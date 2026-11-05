import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from 'app/core/notify.service';
import { ConnectorHubService, HubConnector, HubMe, RegistryScope } from 'app/services/connector-hub.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { ConnectorGroupSummary, ConnectorItemSummary, hubErrorMessage, hubErrorTextKey, registryScopeOf } from 'app/integrations/utils';

export interface ConnectorPreview {
  name: string;
  icon?: string;
  actionCount: number;
  triggerCount: number;
  actions: ConnectorItemSummary[];
  triggers: ConnectorItemSummary[];
  groups: ConnectorGroupSummary[];
}

/** Registers a connector through the hub: validate the manifest at a URL, then register it. */
@Component({
  selector: 'connector-integration',
  templateUrl: './connector-integration.component.html',
  styleUrls: ['./connector-integration.component.scss']
})
export class ConnectorIntegrationComponent {

  @Input() me: HubMe;
  @Output() onChanged = new EventEmitter<HubConnector>();

  baseUrl: string = '';
  internalUrl: string = '';
  preview: ConnectorPreview | null = null;
  errors: string[] = [];

  isLoadingManifest: boolean = false;
  isRegistering: boolean = false;
  loadingBaseUrl: string = '';
  private previewedBaseUrl: string = '';
  private previewedInternalUrl: string | null = null;

  constructor(
    private hub: ConnectorHubService,
    private logger: LoggerService,
    private notify: NotifyService,
    private translate: TranslateService
  ) { }

  get scope(): RegistryScope | null {
    return this.me ? registryScopeOf(this.me) : null;
  }

  private currentInternalUrl(): string | null {
    // Only a hub admin can set it (global connectors).
    const value = this.me && this.me.hub_admin ? (this.internalUrl || '').trim() : '';
    return value || null;
  }

  resetForm(): void {
    this.baseUrl = '';
    this.internalUrl = '';
    this.preview = null;
    this.errors = [];
    this.previewedBaseUrl = '';
    this.previewedInternalUrl = null;
  }

  onUrlChange(): void {
    if (this.preview && (this.baseUrl !== this.previewedBaseUrl || this.currentInternalUrl() !== this.previewedInternalUrl)) {
      this.preview = null;
    }
  }

  previewManifest(): void {
    const scope = this.scope;
    if (!this.baseUrl || !scope || this.isLoadingManifest) {
      return;
    }
    const baseUrl = this.baseUrl;
    const internalUrl = this.currentInternalUrl();

    this.isLoadingManifest = true;
    this.loadingBaseUrl = baseUrl;
    this.preview = null;
    this.errors = [];

    this.hub.validate(baseUrl, internalUrl, scope).subscribe(
      (result) => {
        if (this.isStale(baseUrl, internalUrl)) {
          // The URL changed while the request was in flight: the answer no longer matches the form.
          this.finishLoading();
          return;
        }
        this.finishLoading();
        if (!result || !result.valid) {
          this.errors = result && Array.isArray(result.errors) ? result.errors : [];
          return;
        }
        this.preview = this.buildPreview(result.manifest, baseUrl);
        this.previewedBaseUrl = baseUrl;
        this.previewedInternalUrl = internalUrl;
      },
      (error) => {
        this.logger.error('[INT-CONNECTOR] validate ERROR: ', hubErrorMessage(error).message, error);
        this.finishLoading();
        if (this.isStale(baseUrl, internalUrl)) {
          return;
        }
        this.errors = hubErrorMessage(error).details;
        this.notifyError(error);
      }
    );
  }

  register(): void {
    const scope = this.scope;
    if (!this.preview || !scope || this.isRegistering) {
      return;
    }
    this.isRegistering = true;
    this.hub.register(this.previewedBaseUrl, this.previewedInternalUrl, scope).subscribe(
      (res) => {
        this.isRegistering = false;
        this.notify.showWidgetStyleUpdateNotification(this.translate.instant('Integration.ConnectorRegistered'), 3, 'success');
        this.resetForm();
        this.onChanged.emit(res.connector);
      },
      (error) => {
        this.logger.error('[INT-CONNECTOR] register ERROR: ', hubErrorMessage(error).message, error);
        this.isRegistering = false;
        this.errors = hubErrorMessage(error).details;
        this.notifyError(error);
      }
    );
  }

  private isStale(baseUrl: string, internalUrl: string | null): boolean {
    return this.baseUrl !== baseUrl || this.currentInternalUrl() !== internalUrl;
  }

  private finishLoading(): void {
    this.isLoadingManifest = false;
    this.loadingBaseUrl = '';
  }

  private notifyError(error: any): void {
    this.notify.showWidgetStyleUpdateNotification(this.translate.instant(hubErrorTextKey(error)), 3, 'error');
  }

  private buildPreview(manifest: any, fallbackName: string): ConnectorPreview {
    const m = manifest || {};
    const actions: ConnectorItemSummary[] = Array.isArray(m.actions)
      ? m.actions.map((a: any) => ({ id: a.id, name: a.name, group: a.group })) : [];
    const triggers: ConnectorItemSummary[] = Array.isArray(m.triggers)
      ? m.triggers.map((t: any) => ({ id: t.id, name: t.name, group: t.group })) : [];
    const groups: ConnectorGroupSummary[] = Array.isArray(m.groups)
      ? m.groups.map((g: any) => ({ id: g.id, name: g.name })) : [];
    const info = m.connector || {};
    return {
      name: info.name || fallbackName,
      icon: info.icon,
      actionCount: actions.length,
      triggerCount: triggers.length,
      actions, triggers, groups
    };
  }
}
