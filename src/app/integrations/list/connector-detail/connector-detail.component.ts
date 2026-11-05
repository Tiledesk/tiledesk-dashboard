import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/core/auth.service';
import { NotifyService } from 'app/core/notify.service';
import { ConnectorHubService, HubConnector, HubMe, RegistryScope } from 'app/services/connector-hub.service';
import { LoggerService } from 'app/services/logger/logger.service';
import {
  canActOnConnector, ConnectorGroupSummary, escapeHtml, ConnectorItemSummary, hubErrorMessage, hubErrorTextKey, registryScopeOf
} from 'app/integrations/utils';
import { ConnectorItemsModalComponent } from './connector-items-modal/connector-items-modal.component';

const Swal = require('sweetalert2');

const MAX_SHOWN_ERRORS = 5;
const DEFAULT_CONNECTOR_ICON = 'assets/img/int/connector-icon.svg';

/** Detail of one hub connector: Details tab (manifest summary, registry actions) and Connections tab. */
@Component({
  selector: 'connector-detail',
  templateUrl: './connector-detail.component.html',
  styleUrls: ['./connector-detail.component.scss']
})
export class ConnectorDetailComponent implements OnChanges {

  @Input() connector: HubConnector;
  @Input() me: HubMe;
  @Output() onChanged = new EventEmitter<void>();

  activeTab: 'details' | 'connections' = 'details';
  manifest: any | null = null;
  isBusy: boolean = false;
  private manifestRequestId = 0;

  constructor(
    private hub: ConnectorHubService,
    private logger: LoggerService,
    private notify: NotifyService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private auth: AuthService
  ) {
    // Returning from the provider consent page reopens the Connections tab (?tab=connections).
    this.activeTab = this.tabFromUrl();
  }

  private tabFromUrl(): 'details' | 'connections' {
    return this.route.snapshot.queryParamMap.get('tab') === 'connections' ? 'connections' : 'details';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.connector) {
      const previous = changes.connector.previousValue as HubConnector | undefined;
      // The url tab (?tab=connections, a consent return) only applies to the first connector shown.
      if (!previous) {
        this.activeTab = this.tabFromUrl();
      } else if (!this.connector || previous.id !== this.connector.id) {
        this.activeTab = 'details';
      }
      this.loadManifest();
    }
  }

  private get projectId(): string {
    return this.auth.project_bs.value?._id;
  }

  get scope(): RegistryScope | null {
    return this.me ? registryScopeOf(this.me) : null;
  }

  /** Refresh / enable-disable / delete: registry rights over this very connector (hub admin, or its owning project). */
  get canEdit(): boolean {
    return !!this.me && !!this.connector && canActOnConnector(this.me, this.connector, this.projectId);
  }

  get isDisabled(): boolean {
    return !!this.connector && this.connector.status === 'disabled';
  }

  get iconUrl(): string {
    return (this.connector && this.connector.icon) || DEFAULT_CONNECTOR_ICON;
  }

  onIconError(event: Event): void {
    (event.target as HTMLImageElement).src = DEFAULT_CONNECTOR_ICON;
  }

  get actions(): ConnectorItemSummary[] {
    return this.items(this.manifest && this.manifest.actions);
  }

  get triggers(): ConnectorItemSummary[] {
    return this.items(this.manifest && this.manifest.triggers);
  }

  private get groups(): ConnectorGroupSummary[] {
    const groups = this.manifest && this.manifest.groups;
    return Array.isArray(groups) ? groups.map((g: any) => ({ id: g.id, name: g.name })) : [];
  }

  private items(list: any): ConnectorItemSummary[] {
    return Array.isArray(list) ? list.map((i: any) => ({ id: i.id, name: i.name, group: i.group })) : [];
  }

  setTab(tab: 'details' | 'connections'): void {
    this.activeTab = tab;
  }

  // A disabled connector has no manifest endpoint answer (hub: connector_disabled): only its registry data is shown.
  private loadManifest(): void {
    const requestId = ++this.manifestRequestId;
    this.manifest = null;
    if (!this.connector || this.isDisabled) {
      return;
    }
    this.hub.getManifest(this.connector.id).subscribe(
      (manifest) => {
        if (requestId === this.manifestRequestId) {
          this.manifest = manifest || null;
        }
      },
      (error) => {
        this.logger.error('[CONNECTOR-DETAIL] getManifest ERROR: ', hubErrorMessage(error).message, error);
        if (requestId === this.manifestRequestId) {
          this.notifyError(error);
        }
      }
    );
  }

  openActionsModal(): void {
    this.openItemsModal('Actions', this.actions);
  }

  openTriggersModal(): void {
    this.openItemsModal('Triggers', this.triggers);
  }

  private openItemsModal(titleKey: string, items: ConnectorItemSummary[]): void {
    if (!items.length) {
      return;
    }
    this.dialog.open(ConnectorItemsModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '80vh',
      data: { title: this.translate.instant(titleKey), items, groups: this.groups }
    });
  }

  refresh(): void {
    const scope = this.scope;
    if (!this.canEdit || !scope || this.isBusy) {
      return;
    }
    this.isBusy = true;
    this.hub.refresh(this.connector.id, scope).subscribe(
      (res) => {
        this.isBusy = false;
        if (res && res.valid === false) {
          const errors = Array.isArray(res.errors) ? res.errors : [];
          const shown = errors.slice(0, MAX_SHOWN_ERRORS);
          if (errors.length > MAX_SHOWN_ERRORS) {
            shown.push('…');
          }
          this.notify.showWidgetStyleUpdateNotification(
            [this.translate.instant('Integration.ConnectorValidationErrors'), ...shown].join(' - '), 3, 'warning');
        } else {
          this.notify.showWidgetStyleUpdateNotification(this.translate.instant('Integration.ConnectorRefreshed'), 3, 'success');
        }
        this.onChanged.emit();
      },
      (error) => this.onActionError('refresh', error)
    );
  }

  toggleEnabled(): void {
    const scope = this.scope;
    if (!this.canEdit || !scope || this.isBusy) {
      return;
    }
    this.isBusy = true;
    this.hub.setEnabled(this.connector.id, this.isDisabled, scope).subscribe(
      () => {
        this.isBusy = false;
        this.onChanged.emit();
      },
      (error) => this.onActionError('setEnabled', error)
    );
  }

  confirmDelete(): Promise<boolean> {
    return Swal.fire({
      title: this.translate.instant('AreYouSure'),
      html: this.translate.instant('Integration.ConnectorWillBeDeleted', { serverName: escapeHtml(this.connector.name) }),
      icon: 'warning',
      showCloseButton: false,
      showCancelButton: true,
      showConfirmButton: false,
      showDenyButton: true,
      denyButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
      focusConfirm: false,
      reverseButtons: true,
    }).then((result) => !!result.isDenied);
  }

  deleteConnector(): void {
    const scope = this.scope;
    if (!this.canEdit || !scope || this.isBusy) {
      return;
    }
    this.confirmDelete().then((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.isBusy = true;
      this.hub.removeConnector(this.connector.id, scope).subscribe(
        () => {
          this.isBusy = false;
          this.notify.showWidgetStyleUpdateNotification(this.translate.instant('Integration.ConnectorDeleted'), 3, 'success');
          this.onChanged.emit();
        },
        (error) => this.onActionError('removeConnector', error)
      );
    });
  }

  private onActionError(action: string, error: any): void {
    this.isBusy = false;
    this.logger.error('[CONNECTOR-DETAIL] ' + action + ' ERROR: ', hubErrorMessage(error).message, error);
    this.notifyError(error);
  }

  private notifyError(error: any): void {
    this.notify.showWidgetStyleUpdateNotification(this.translate.instant(hubErrorTextKey(error)), 3, 'error');
  }
}
