import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { KbSourcesService } from 'app/services/kb-sources.service';
import { NotifyService } from 'app/core/notify.service';
import { KbSourceConnection } from 'app/models/kb-sources.model';

/**
 * Microsoft 365 accounts of the project.
 * view 'list' (accounts dialog): every account, with reconnect and disconnect.
 * view 'banner' (KB page): only the accounts that need to sign in again, as warnings with Reconnect.
 */
@Component({
  selector: 'kb-ms365-connections',
  templateUrl: './kb-ms365-connections.component.html',
  styleUrls: ['./kb-ms365-connections.component.scss']
})
export class KbMs365ConnectionsComponent implements OnInit, OnDestroy {
  /** Something changed on the server: the page refreshes its accounts (and the KB list after a cascade). */
  @Output() changed = new EventEmitter<{ cascade: boolean }>();
  /** The accounts were (re)loaded: the page shows their count on its header button. */
  @Output() loaded = new EventEmitter<KbSourceConnection[]>();
  @Input() view: 'list' | 'banner' = 'list';

  connections: KbSourceConnection[] = [];
  busyId: string | null = null;
  private relaySub: Subscription | null = null;

  constructor(
    private kbSources: KbSourcesService,
    private notify: NotifyService,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.load();
    // a reconnect whose popup lost window.opener reports here, after connect() resolved 'closed'
    this.relaySub = this.kbSources.relayedConnectResults$.subscribe(result => {
      if (result.status !== 'connected') { return; }
      this.load();
      this.changed.emit({ cascade: false });
    });
  }

  ngOnDestroy(): void {
    if (this.relaySub) { this.relaySub.unsubscribe(); }
  }

  load() {
    this.kbSources.getConnections().subscribe({
      next: (list) => { this.connections = list || []; this.loaded.emit(this.connections); },
      error: () => { this.connections = []; this.loaded.emit(this.connections); } // not an admin: nothing to manage
    });
  }

  get needsReconnect(): KbSourceConnection[] {
    return this.connections.filter(c => c.status === 'needs_reconnect');
  }

  initials(c: KbSourceConnection): string {
    const src = (c.account?.display_name || c.account?.upn || '?').replace(/@.*/, '');
    const parts = src.split(/[\s._-]+/).filter(Boolean);
    return ((parts[0] || '?')[0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  }

  /** 'KbPage.Ms365FolderOne' / 'KbPage.Ms365FoldersCount' (and File...): singular for exactly one. */
  countKey(n: number | undefined, what: 'Folder' | 'File'): string {
    return (n || 0) === 1 ? 'KbPage.Ms365' + what + 'One' : 'KbPage.Ms365' + what + 's' + 'Count';
  }

  accountLabel(c: KbSourceConnection): string {
    return (c.account?.display_name || '') + ' — ' + (c.account?.upn || '');
  }

  /** connect() opens the popup synchronously, so it is called straight from the click. */
  reconnect(c: KbSourceConnection) {
    this.kbSources.connect('microsoft365', c._id).then(result => {
      if (result.status === 'connected') {
        this.load();
        this.changed.emit({ cascade: false });
      } else if (result.status === 'blocked') {
        this.continueInWindow(c);
      } else if (result.status === 'closed') {
        this.notify.showWidgetStyleUpdateNotification(this.translate.instant('KbPage.Ms365OpenAgain'), 3, 'open_in_new');
      } else {
        this.notify.showWidgetStyleUpdateNotification(this.translate.instant('KbPage.Ms365ErrConnect'), 4, 'report_problem');
      }
    }).catch(() => {
      this.notify.showWidgetStyleUpdateNotification(this.translate.instant('KbPage.Ms365ErrConnect'), 4, 'report_problem');
    });
  }

  /** Pop-ups blocked: offer the full-page sign-in. */
  private async continueInWindow(c: KbSourceConnection) {
    const text = this.translate.instant('KbPage.Ms365BlockedContinue');
    if (!await this.confirm(text, 'KbPage.Ms365ContinueHere')) { return; }
    try {
      await this.kbSources.connectInWindow('microsoft365', c._id);
    } catch (e) {
      this.notify.showWidgetStyleUpdateNotification(this.translate.instant('KbPage.Ms365ErrConnect'), 4, 'report_problem');
    }
  }

  private confirm(text: string, confirmKey: string): Promise<boolean> {
    return Swal.fire({
      title: this.translate.instant('AreYouSure') + '?',
      text,
      icon: 'warning',
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: this.translate.instant(confirmKey),
      cancelButtonText: this.translate.instant('Cancel'),
      focusConfirm: false,
      reverseButtons: true,
    }).then(r => !!(r && r.isConfirmed));
  }

  async disconnect(c: KbSourceConnection) {
    if (this.busyId) { return; }
    if (!await this.confirm(this.translate.instant('KbPage.Ms365DisconnectConfirm'), 'KbPage.Ms365Disconnect')) {
      return;
    }
    this.busyId = c._id;
    this.kbSources.deleteConnection(c._id, false).subscribe({
      next: () => this.done(false),
      error: (err) => {
        if (err?.status === 409 && err?.error?.error === 'in_use') {
          this.busyId = null;
          this.disconnectInUse(c, err.error);
        } else {
          this.busyId = null;
          this.notify.showWidgetStyleUpdateNotification(this.translate.instant('KbPage.Ms365ErrDisconnect'), 4, 'report_problem');
        }
      }
    });
  }

  private async disconnectInUse(c: KbSourceConnection, body: any) {
    const n = (body.folders_count || 0) + (body.files_count || 0);
    const text = this.translate.instant('KbPage.Ms365DisconnectInUse', { n });
    if (!await this.confirm(text, 'KbPage.Ms365DisconnectAndDelete')) {
      return;
    }
    this.busyId = c._id;
    this.kbSources.deleteConnection(c._id, true).subscribe({
      next: () => this.done(true),
      error: (err) => {
        this.busyId = null;
        if (err?.status === 409 && err?.error?.error === 'remove_failed') {
          const msg = this.translate.instant('KbPage.Ms365ErrRemoveFailed', { failed: err.error.failed, removed: err.error.removed });
          this.notify.showWidgetStyleUpdateNotification(msg, 4, 'report_problem');
          this.load();
          this.changed.emit({ cascade: true }); // some contents were removed: the page lists them again
        } else {
          this.notify.showWidgetStyleUpdateNotification(this.translate.instant('KbPage.Ms365ErrDisconnect'), 4, 'report_problem');
        }
      }
    });
  }

  private done(cascade: boolean) {
    this.busyId = null;
    this.load();
    this.changed.emit({ cascade });
  }
}
