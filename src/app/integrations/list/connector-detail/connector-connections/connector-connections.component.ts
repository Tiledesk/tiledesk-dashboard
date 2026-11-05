import { Subscription } from 'rxjs';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from 'app/core/notify.service';
import { ConnectorHubService, HubConnection, HubConnector, HubInstallResult, HubMe } from 'app/services/connector-hub.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { CONNECTOR_ITEM_KEY_PREFIX, HUB_ERROR_GENERIC_KEY, hubErrorMessage, hubErrorTextKey } from 'app/integrations/utils';

const Swal = require('sweetalert2');

const POLL_INTERVAL_MS = 1500;
const POLL_MAX_ATTEMPTS = 10;

/** Connections tab of a hub connector: the project's accounts for it (list, add, reconnect, rename, revoke). */
@Component({
  selector: 'connector-connections',
  templateUrl: './connector-connections.component.html',
  styleUrls: ['./connector-connections.component.scss']
})
export class ConnectorConnectionsComponent implements OnInit, OnDestroy {

  @Input() connector: HubConnector;
  @Input() me: HubMe;

  connections: HubConnection[] = [];
  isLoading: boolean = false;
  isBusy: boolean = false;
  private loadRequestId = 0;
  private pollTimer: any = null;
  private destroyed = false;
  private pollToken = 0;
  private statusSub: Subscription | null = null;
  private paramsSub: Subscription | null = null;
  private lastReturnKey = '';
  private initialising = false;

  constructor(
    private hub: ConnectorHubService,
    private logger: LoggerService,
    private notify: NotifyService,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  get canManage(): boolean {
    return !!this.me && !!this.me.manager;
  }

  ngOnInit(): void {
    this.load();
    // Also reacts to a second return on this same instance; clearing the params re-emits and is ignored (no key).
    this.initialising = true;
    this.paramsSub = this.route.queryParamMap.subscribe((params) => this.handleReturn(params));
    this.initialising = false;
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.clearPoll();
    if (this.paramsSub) { this.paramsSub.unsubscribe(); }
  }

  load(): void {
    if (!this.connector) {
      return;
    }
    const requestId = ++this.loadRequestId;
    this.isLoading = true;
    this.hub.listConnections(this.connector.id).subscribe(
      (connections) => {
        if (requestId === this.loadRequestId) {
          this.connections = connections || [];
          this.isLoading = false;
        }
      },
      (error) => {
        if (requestId === this.loadRequestId) {
          this.connections = [];
          this.isLoading = false;
          this.onError('listConnections', error);
        }
      }
    );
  }

  statusKey(c: HubConnection): string {
    switch (c.status) {
      case 'connected': return 'Integration.ConnectorStatusConnected';
      case 'disconnected': return 'Integration.ConnectorStatusDisconnected';
      default: return 'Integration.ConnectorStatusPending';
    }
  }

  // ---- install / reconnect ----

  /** Where the provider consent page sends the user back: this very page, Connections tab of this connector. */
  returnUrl(): string {
    const tree = this.router.createUrlTree([], {
      relativeTo: this.route,
      queryParams: { name: CONNECTOR_ITEM_KEY_PREFIX + this.connector.id, tab: 'connections' }
    });
    // Hash routing under a sub-path (/dashboard/, /v3/dashboard/): origin + path, then '#/...' for the route.
    const page = new URL(this.currentHref());
    return page.origin + page.pathname + this.location.prepareExternalUrl(this.router.serializeUrl(tree));
  }

  /** Overridable for tests: the full browser URL (outer query before the '#', hash route after it). */
  currentHref(): string {
    return window.location.href;
  }

  /** Overridable for tests: rewrites the browser URL in place (no navigation, router state kept). */
  replaceHref(url: string): void {
    window.history.replaceState(window.history.state, '', url);
  }

  /** Overridable for tests: leaves the dashboard for the provider consent page. */
  navigate(url: string): void {
    window.location.assign(url);
  }

  addAccount(): void {
    if (!this.canManage || this.isBusy) {
      return;
    }
    this.isBusy = true;
    this.hub.createConnection(this.connector.id).subscribe(
      (created) => this.startInstall(created.id),
      (error) => this.onError('createConnection', error)
    );
  }

  reconnect(c: HubConnection): void {
    if (!this.canManage || this.isBusy) {
      return;
    }
    this.isBusy = true;
    this.startInstall(c.id);
  }

  private startInstall(connectionId: string): void {
    this.hub.install(connectionId, this.returnUrl()).subscribe(
      (result: HubInstallResult) => {
        if (result && result.auth_url) {
          this.navigate(result.auth_url);
          return;
        }
        this.isBusy = false;
        this.load();
        if (result && result.fields) {
          // api_key connectors answer { fields }: there is no submit step yet.
          this.toast('Integration.ConnectorApiKeyNotSupported', 'warning');
        } else {
          this.logger.error('[CONNECTOR-CONNECTIONS] install answered neither auth_url nor fields');
          this.toast(HUB_ERROR_GENERIC_KEY, 'error');
        }
      },
      (error) => {
        this.onError('install', error);
        this.load();
      }
    );
  }

  // ---- rename / revoke ----

  rename(c: HubConnection): void {
    if (!this.canManage || this.isBusy) {
      return;
    }
    this.promptLabel(c.label).then((value) => {
      const label = (value || '').trim();
      if (!label || label === c.label) {
        return;
      }
      this.isBusy = true;
      this.hub.renameConnection(c.id, label).subscribe(
        () => { this.isBusy = false; this.load(); },
        (error) => this.onError('renameConnection', error)
      );
    });
  }

  /** Account labels are user data: shown through Swal `inputValue`, never `html`. */
  promptLabel(current: string): Promise<string | null> {
    return Swal.fire({
      title: this.translate.instant('Integration.ConnectorRename'),
      input: 'text',
      inputValue: current || '',
      showCancelButton: true,
      cancelButtonText: this.translate.instant('Cancel'),
      reverseButtons: true,
    }).then((result) => (result.isConfirmed ? String(result.value ?? '') : null));
  }

  revoke(c: HubConnection): void {
    if (!this.canManage || this.isBusy) {
      return;
    }
    this.confirmRevoke(c).then((confirmed) => {
      if (confirmed) {
        this.doRevoke(c, false);
      }
    });
  }

  private doRevoke(c: HubConnection, force: boolean): void {
    this.isBusy = true;
    const call = force ? this.hub.revokeConnection(c.id, true) : this.hub.revokeConnection(c.id);
    call.subscribe(
      () => { this.isBusy = false; this.load(); },
      (error) => {
        if (!force && hubErrorMessage(error).code === 'revoke_failed') {
          this.isBusy = false;
          this.logger.error('[CONNECTOR-CONNECTIONS] revoke failed at the provider', hubErrorMessage(error).message);
          this.confirmRemoveAnyway().then((again) => {
            if (again) {
              this.doRevoke(c, true);
            }
          });
          return;
        }
        this.onError('revokeConnection', error);
      }
    );
  }

  confirmRevoke(c: HubConnection): Promise<boolean> {
    return Swal.fire({
      title: this.translate.instant('AreYouSure'),
      text: this.translate.instant('Integration.ConnectorRevokeConfirm', { account: this.accountLabel(c) }),
      icon: 'warning',
      showCancelButton: true,
      showConfirmButton: false,
      showDenyButton: true,
      denyButtonText: this.translate.instant('Integration.ConnectorRevoke'),
      cancelButtonText: this.translate.instant('Cancel'),
      focusConfirm: false,
      reverseButtons: true,
    }).then((result) => !!result.isDenied);
  }

  confirmRemoveAnyway(): Promise<boolean> {
    return Swal.fire({
      title: this.translate.instant('Integration.ConnectorErr_revoke_failed'),
      icon: 'warning',
      showCancelButton: true,
      showConfirmButton: false,
      showDenyButton: true,
      denyButtonText: this.translate.instant('Integration.ConnectorRevokeAnyway'),
      cancelButtonText: this.translate.instant('Cancel'),
      focusConfirm: false,
      reverseButtons: true,
    }).then((result) => !!result.isDenied);
  }

  private accountLabel(c: HubConnection): string {
    return (c.account && c.account.display) || c.label;
  }

  // ---- return from the provider ----

  /**
   * Reports the consent result once (?connection_id=&status=), refreshes the list and strips the params.
   * The hub appends them to the real query, before the '#' (outer); a route query (inner) is read too. Outer wins.
   */
  handleReturn(params: ParamMap = this.route.snapshot.queryParamMap): void {
    const outer = new URL(this.currentHref()).searchParams;
    const fromOuter = !!outer.get('connection_id') && !!outer.get('status');
    const connectionId = fromOuter ? outer.get('connection_id') : params.get('connection_id');
    const status = fromOuter ? outer.get('status') : params.get('status');
    if (!connectionId || !status) {
      this.lastReturnKey = '';
      return;
    }
    const key = `${connectionId}:${status}`;
    if (key === this.lastReturnKey) {
      return;
    }
    this.lastReturnKey = key;
    if (fromOuter) {
      this.clearOuterReturnParams();
    }
    this.clearPoll();
    const token = ++this.pollToken;
    if (status === 'connected') {
      this.pollStatus(connectionId, 1, token);
    } else {
      this.toast('Integration.ConnectorAccountFailed', 'error');
      if (!this.initialising) {
        this.load();
      }
      this.clearReturnParams();
    }
  }

  private pollStatus(connectionId: string, attempt: number, token: number): void {
    this.statusSub = this.hub.getConnectionStatus(connectionId).subscribe(
      (res) => {
        if (this.destroyed || token !== this.pollToken) {
          return;
        }
        if (res && res.connected) {
          this.toast('Integration.ConnectorAccountConnected', 'success');
          this.finishReturn();
        } else if (attempt >= POLL_MAX_ATTEMPTS) {
          this.toast('Integration.ConnectorAccountFailed', 'error');
          this.finishReturn();
        } else if (!this.destroyed) {
          this.pollTimer = setTimeout(() => this.pollStatus(connectionId, attempt + 1, token), POLL_INTERVAL_MS);
        }
      },
      (error) => {
        if (this.destroyed || token !== this.pollToken) {
          return;
        }
        this.onError('getConnectionStatus', error);
        this.finishReturn();
      }
    );
  }

  private finishReturn(): void {
    this.load();
    this.clearReturnParams();
  }

  private clearReturnParams(): void {
    this.router.navigate([], {
      queryParams: { connection_id: null, status: null }, queryParamsHandling: 'merge', replaceUrl: true
    });
  }

  /** Drops connection_id/status from the real query, keeping its other params and the hash route. */
  private clearOuterReturnParams(): void {
    const url = new URL(this.currentHref());
    url.searchParams.delete('connection_id');
    url.searchParams.delete('status');
    this.replaceHref(url.pathname + url.search + url.hash);
  }

  private clearPoll(): void {
    if (this.statusSub) {
      this.statusSub.unsubscribe();
      this.statusSub = null;
    }
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
  }

  // ---- helpers ----

  private toast(key: string, type: 'success' | 'error' | 'warning'): void {
    this.notify.showWidgetStyleUpdateNotification(this.translate.instant(key), 3, type);
  }

  private onError(action: string, error: any): void {
    this.isBusy = false;
    this.logger.error(`[CONNECTOR-CONNECTIONS] ${action} failed`, hubErrorMessage(error).message);
    this.toast(hubErrorTextKey(error), 'error');
  }
}
