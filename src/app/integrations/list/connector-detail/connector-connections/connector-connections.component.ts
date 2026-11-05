import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from 'app/core/notify.service';
import { ConnectorHubService, HubConnection, HubConnector, HubInstallResult, HubMe } from 'app/services/connector-hub.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { CONNECTOR_ITEM_KEY_PREFIX, hubErrorMessage, hubErrorTextKey } from 'app/integrations/utils';

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
    this.handleReturn();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.clearPoll();
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
    return window.location.origin + this.location.prepareExternalUrl(this.router.serializeUrl(tree));
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
        if (result && result.fields) {
          // api_key connectors answer { fields }: there is no submit step yet.
          this.toast('Integration.ConnectorApiKeyNotSupported', 'warning');
          this.load();
        }
      },
      (error) => this.onError('install', error)
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

  /** Reports the consent result once (?connection_id=&status=), refreshes the list and strips the params. */
  handleReturn(): void {
    const params = this.route.snapshot.queryParamMap;
    const connectionId = params.get('connection_id');
    const status = params.get('status');
    this.load();
    if (!connectionId || !status) {
      return;
    }
    if (status === 'connected') {
      this.pollStatus(connectionId, 1);
    } else {
      this.toast('Integration.ConnectorAccountFailed', 'error');
      this.clearReturnParams();
    }
  }

  private pollStatus(connectionId: string, attempt: number): void {
    this.hub.getConnectionStatus(connectionId).subscribe(
      (res) => {
        if (res && res.connected) {
          this.toast('Integration.ConnectorAccountConnected', 'success');
          this.finishReturn();
        } else if (attempt >= POLL_MAX_ATTEMPTS) {
          this.toast('Integration.ConnectorAccountFailed', 'error');
          this.finishReturn();
        } else if (!this.destroyed) {
          this.pollTimer = setTimeout(() => this.pollStatus(connectionId, attempt + 1), POLL_INTERVAL_MS);
        }
      },
      (error) => {
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

  private clearPoll(): void {
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
