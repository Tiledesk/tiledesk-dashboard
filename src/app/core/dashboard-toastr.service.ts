import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActiveToast, IndividualConfig, ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subject } from 'rxjs';

export interface UnservedNotificationItem {
  id: string;
  /** localStorage key used by navbar: `${request.id}_${status}` */
  storageKey: string;
  projectId: string;
  sender: string;
  msg: string;
  link: string;
  createdAt: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardToastrService {
  /**
   * Emits when an unserved notification is added to the stack.
   * Navbar plays the notification sound from this.
   */
  readonly unservedToastPresented$: Subject<void> = new Subject<void>();

  private static readonly UNSERVED_STACK_STORAGE_KEY = 'td-unserved-notifications';
  /** New "user handled" flag — do not reuse the legacy `${id}_${status}` show-once key. */
  private static readonly UNSERVED_HANDLED_PREFIX = 'td-unserved-handled:';
  /** Play notification sound at most once per burst of stack adds. */
  private static readonly UNSERVED_SOUND_COALESCE_MS = 1500;
  private unservedSoundTimer: number | null = null;

  /**
   * In-memory only (not restored on refresh). Unserved toasts are shown on
   * project enter, not on page reload.
   */
  private readonly unservedNotificationsSubject = new BehaviorSubject<UnservedNotificationItem[]>([]);
  readonly unservedNotifications$ = this.unservedNotificationsSubject.asObservable();

  /**
   * Soft-hidden for the current visit (auto-dismiss / close). Restored when
   * the project UI becomes visible again. Not written to localStorage.
   */
  private readonly parkedUnservedByProject = new Map<string, UnservedNotificationItem[]>();
  /** Blocks navbar re-add while items are parked for this visit. */
  private readonly suppressedUnservedKeys = new Set<string>();

  /**
   * Gate: false after refresh / until the user enters a project.
   * While false, showUnservedNotication is a no-op.
   */
  private unservedPresentationArmed = false;
  /** Navbar re-scans current WS unserved list when this emits. */
  readonly unservedRepublish$: Subject<void> = new Subject<void>();
  /** After refresh: arm for live toasts; navbar should seed shown_requests without toasting. */
  readonly unservedLiveArm$: Subject<void> = new Subject<void>();

  /** True if the user opened this unserved toast (detail) — do not show again. */
  static isUnservedHandled(storageKey: string): boolean {
    if (!storageKey) {
      return false;
    }
    try {
      return localStorage.getItem(DashboardToastrService.UNSERVED_HANDLED_PREFIX + storageKey) === 'true';
    } catch {
      return false;
    }
  }

  /** True while the toast is soft-hidden (auto-dismiss / close) for this visit. */
  isUnservedSuppressed(storageKey: string): boolean {
    return !!storageKey && this.suppressedUnservedKeys.has(storageKey);
  }

  /** Whether navbar / showUnserved may add toasts (armed after project enter). */
  isUnservedPresentationArmed(): boolean {
    return this.unservedPresentationArmed;
  }

  /**
   * Call when the user enters a project (not on refresh hydrate).
   * Restores parked toasts and asks navbar to republish current unserved.
   */
  armUnservedPresentationOnProjectEnter(projectId: string): void {
    // Drop soft suppressions from refresh hydrate / auto-dismiss so intentional
    // enter can republish the current backlog (handled keys still block).
    this.suppressedUnservedKeys.clear();
    this.unservedPresentationArmed = true;
    if (projectId) {
      this.restoreParkedUnservedNotifications(projectId);
    }
    this.unservedRepublish$.next();
  }

  /**
   * After refresh while already in a project: allow *new* live unserved toasts
   * without republishing the existing backlog (navbar seeds shown_requests on this signal).
   */
  armUnservedPresentationForLiveEvents(): void {
    this.unservedPresentationArmed = true;
    this.unservedLiveArm$.next();
  }

  /**
   * Call when leaving project UI (e.g. /projects). Parks current toasts and
   * blocks new shows until the next project enter.
   * Without projectId (e.g. page refresh hydrate): clear the in-memory stack.
   */
  disarmUnservedPresentation(projectId?: string): void {
    if (projectId) {
      this.parkUnservedNotifications(projectId);
    } else {
      this.publishUnservedStack([]);
    }
    this.unservedPresentationArmed = false;
  }

  notifyArchivingRequest: ActiveToast<any> | null = null;
  private archivingProgressText = '';
  private archivingProgressShownAt = 0;
  private static readonly ARCHIVING_PROGRESS_MIN_VISIBLE_MS = 800;
  private static readonly ARCHIVING_PROGRESS_STEP_MS = 70;
  private archivingFinishTimer: number | null = null;
  private archivingProgressPrefix = '';
  private archivingProgressTotal = 0;
  private archivingProgressDisplayed = 0;
  private archivingProgressTarget = 0;
  private archivingProgressStepTimer: number | null = null;

  private verifyEmailToast: ActiveToast<any> | null = null;
  private verifyEmailSuccessDismissTimer: number | null = null;
  private static readonly VERIFY_EMAIL_UPDATE_MS = 2000;
  private static readonly VERIFY_EMAIL_SUCCESS_VISIBLE_MS = 3000;

  /** New message: top-right (same size as unserved), fadeInDown / fadeOutUp. */
  private readonly foregroundToastConfig: Partial<IndividualConfig> = {
    enableHtml: true,
    disableTimeOut: true,
    positionClass: 'toast-top-right',
    toastClass: 'ngx-toastr td-notify-toast animated',
    closeButton: false,
    tapToDismiss: false,
    newestOnTop: true,
  };

  /** Uscita widget: più lenta dell'entrata (350ms). */
  private static readonly WIDGET_TOAST_EXIT_MS = 800;

  /** Cambio/eliminazione progetto (ex bootstrap-notify timer 2000ms). */
  private static readonly CHANGE_PROJECT_TOAST_VISIBLE_MS = 2000;

  /** Banner basso centro (ex showToast bootstrap-notify timer 2000ms). */
  private static readonly CENTER_TOAST_VISIBLE_MS = 2000;

  private readonly centerToastConfig: Partial<IndividualConfig> = {
    enableHtml: true,
    disableTimeOut: true,
    positionClass: 'toast-bottom-center',
    closeButton: false,
    tapToDismiss: true,
    newestOnTop: false,
  };

  private readonly widgetToastConfig: Partial<IndividualConfig> = {
    enableHtml: true,
    disableTimeOut: true,
    positionClass: 'toast-top-right',
    closeButton: false,
    tapToDismiss: true,
    newestOnTop: true,
  };

  private static readonly WIDGET_NOTIFY_ALERT_TYPES = ['', 'info', 'success', 'warning', 'danger'] as const;

  private readonly archivingToastConfig: Partial<IndividualConfig> = {
    enableHtml: true,
    disableTimeOut: true,
    positionClass: 'toast-top-right',
    closeButton: false,
    tapToDismiss: false,
    newestOnTop: true,
  };

  private readonly verifyEmailToastConfig: Partial<IndividualConfig> = {
    enableHtml: true,
    disableTimeOut: true,
    positionClass: 'toast-top-right',
    closeButton: false,
    tapToDismiss: false,
    newestOnTop: true,
  };

  constructor(
    private toastr: ToastrService,
    private translate: TranslateService,
  ) {
    // Drop legacy persisted stack (unserved are in-memory only now).
    try {
      localStorage.removeItem(DashboardToastrService.UNSERVED_STACK_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  showForegroungPushNotification(
    sender: string,
    msg: string,
    link: string,
    _requester_avatar_initial?: string,
    _requester_avatar_bckgrnd?: string
  ): void {
    const header = this.translate.instant('NavBar.NewMessage');
    // Same macOS card look as unserved toasts — no close button; auto-dismiss kept.
    const html = `
      <div id="foreground-not" class="td-notify-container">
        <div class="td-notify-icon" aria-hidden="true">
          <i class="material-icons">chat_bubble</i>
        </div>
        <div class="td-notify-content">
          <span class="td-notify-foreground-header">${header}</span>
          <span class="td-notify-title">${sender}</span>
          <span class="td-notify-message">${msg}</span>
        </div>
      </div>
    `;

    const toast = this.toastr.show(html, '', {
      ...this.foregroundToastConfig,
      toastClass: 'ngx-toastr td-notify-toast animated',
    });

    toast.onShown.subscribe(() => {
      const el = toast.portal?.location?.nativeElement as HTMLElement | undefined;
      if (el) {
        el.classList.add('fadeInDown');
      }
    });

    setTimeout(() => this.dismissForegroundToast(toast), 6000);

    toast.onTap.subscribe(() => {
      this.dismissForegroundToast(toast, () => {
        window.location.href = link;
      });
    });
  }

  /**
   * Unassigned chats: macOS-style stack (no aggregate toast).
   * Shown only after project enter (not on refresh). Newest first.
   */
  showUnservedNotication(
    sender: string,
    msg: string,
    link: string,
    createdAt?: string | number | Date,
    projectId?: string,
    storageKey?: string
  ): void {
    if (!this.unservedPresentationArmed) {
      return;
    }

    const resolvedProjectId = (projectId || '').trim();
    if (!resolvedProjectId) {
      return;
    }

    const resolvedStorageKey = (storageKey || '').trim();
    if (
      resolvedStorageKey &&
      (DashboardToastrService.isUnservedHandled(resolvedStorageKey) ||
        this.isUnservedSuppressed(resolvedStorageKey))
    ) {
      return;
    }

    const id = this.unservedNotificationId(link, sender, msg, resolvedStorageKey);
    const current = this.unservedNotificationsSubject.value;
    if (
      current.some(
        (item) =>
          item.id === id ||
          (link && item.link === link) ||
          (resolvedStorageKey && item.storageKey === resolvedStorageKey)
      )
    ) {
      return;
    }

    const next = this.mergeUnservedNewestFirst(current, [
      {
        id,
        storageKey: resolvedStorageKey,
        projectId: resolvedProjectId,
        sender: sender || '',
        msg: msg || '',
        link: link || '',
        createdAt: this.resolveUnservedCreatedAt(createdAt),
      },
    ]);
    this.publishUnservedStack(next);
    this.scheduleUnservedSoundOnce();
  }

  /**
   * Coalesce rapid stack adds into a single sound trigger.
   * Plays pling here (not via navbar) so project-enter / bursts are not blocked by
   * navbar hasPlayed / panel-route flags.
   * @param force reset the coalesce window (e.g. project enter must always beep once)
   */
  notifyUnservedPresentedOnce(force = false): void {
    if (force && this.unservedSoundTimer != null) {
      window.clearTimeout(this.unservedSoundTimer);
      this.unservedSoundTimer = null;
    }
    this.scheduleUnservedSoundOnce();
  }

  private scheduleUnservedSoundOnce(): void {
    if (this.unservedSoundTimer != null) {
      return;
    }
    this.playUnservedPling();
    this.unservedToastPresented$.next();
    this.unservedSoundTimer = window.setTimeout(() => {
      this.unservedSoundTimer = null;
    }, DashboardToastrService.UNSERVED_SOUND_COALESCE_MS);
  }

  private playUnservedPling(): void {
    try {
      const preference = localStorage.getItem('dshbrd----sound');
      if (preference === 'disabled') {
        return;
      }
      const audio = new Audio('assets/pling.mp3');
      audio.play().catch(() => {
        /* autoplay policies / missing file — ignore */
      });
    } catch {
      /* ignore */
    }
  }

  /**
   * @param permanent true when the user opens detail / closes one — never show again.
   *                  false parks for this visit (auto-dismiss) — can restore on re-enter.
   */
  dismissUnservedNotification(id: string, permanent = false): void {
    const current = this.unservedNotificationsSubject.value;
    const dismissed = current.find((item) => item.id === id);
    if (!dismissed) {
      return;
    }
    if (permanent) {
      this.markUnservedAsHandled(dismissed.storageKey);
      this.unsuppressUnservedKeys([dismissed.storageKey]);
      this.removeFromParked(dismissed);
    } else {
      this.parkItems([dismissed]);
    }
    this.publishUnservedStack(current.filter((item) => item.id !== id));
  }

  /**
   * User "close all": mark handled permanently so they do not return on project re-enter.
   */
  dismissAllUnservedPermanently(projectId?: string): void {
    const current = this.unservedNotificationsSubject.value;
    if (!projectId) {
      current.forEach((item) => {
        this.markUnservedAsHandled(item.storageKey);
        this.unsuppressUnservedKeys([item.storageKey]);
        this.removeFromParked(item);
      });
      this.publishUnservedStack([]);
      return;
    }
    const kept: UnservedNotificationItem[] = [];
    current.forEach((item) => {
      if (item.projectId === projectId) {
        this.markUnservedAsHandled(item.storageKey);
        this.unsuppressUnservedKeys([item.storageKey]);
        this.removeFromParked(item);
      } else {
        kept.push(item);
      }
    });
    this.publishUnservedStack(kept);
  }

  /**
   * Soft-hide (park) all notifications for a project — used by auto-dismiss only.
   * They reappear when re-entering the same project (newest first), except handled ones.
   */
  parkUnservedNotifications(projectId?: string): void {
    const current = this.unservedNotificationsSubject.value;
    if (!projectId) {
      this.parkItems(current);
      this.publishUnservedStack([]);
      return;
    }
    const toPark = current.filter((item) => item.projectId === projectId);
    const kept = current.filter((item) => item.projectId !== projectId);
    this.parkItems(toPark);
    this.publishUnservedStack(kept);
  }

  /**
   * Restore soft-hidden toasts when the user re-opens a project (newest first).
   * Skips items the user already opened (permanent handled).
   * @returns number of items restored
   */
  restoreParkedUnservedNotifications(projectId: string): number {
    if (!projectId) {
      return 0;
    }
    const parked = this.parkedUnservedByProject.get(projectId);
    if (!parked?.length) {
      return 0;
    }
    this.parkedUnservedByProject.delete(projectId);
    const eligible = parked.filter(
      (item) => !item.storageKey || !DashboardToastrService.isUnservedHandled(item.storageKey)
    );
    const keys = eligible.map((item) => item.storageKey).filter(Boolean);
    this.unsuppressUnservedKeys(keys);
    if (!eligible.length) {
      return 0;
    }
    const next = this.mergeUnservedNewestFirst(
      this.unservedNotificationsSubject.value,
      eligible
    );
    this.publishUnservedStack(next);
    return eligible.length;
  }

  /** @deprecated prefer parkUnservedNotifications — kept for any legacy callers */
  clearUnservedNotifications(projectId?: string): void {
    this.parkUnservedNotifications(projectId);
  }

  private parkItems(items: UnservedNotificationItem[]): void {
    if (!items.length) {
      return;
    }
    items.forEach((item) => {
      if (item.storageKey) {
        this.suppressedUnservedKeys.add(item.storageKey);
      }
      const projectId = item.projectId;
      if (!projectId) {
        return;
      }
      const existing = this.parkedUnservedByProject.get(projectId) || [];
      this.parkedUnservedByProject.set(
        projectId,
        this.mergeUnservedNewestFirst(existing, [item])
      );
    });
  }

  private removeFromParked(item: UnservedNotificationItem): void {
    if (!item.projectId) {
      return;
    }
    const parked = this.parkedUnservedByProject.get(item.projectId);
    if (!parked?.length) {
      return;
    }
    const next = parked.filter((p) => p.id !== item.id);
    if (next.length) {
      this.parkedUnservedByProject.set(item.projectId, next);
    } else {
      this.parkedUnservedByProject.delete(item.projectId);
    }
  }

  private markUnservedAsHandled(storageKey: string): void {
    if (!storageKey) {
      return;
    }
    try {
      localStorage.setItem(
        DashboardToastrService.UNSERVED_HANDLED_PREFIX + storageKey,
        'true'
      );
    } catch {
      /* ignore quota / private mode */
    }
  }

  private unsuppressUnservedKeys(keys: string[]): void {
    keys.forEach((key) => {
      if (key) {
        this.suppressedUnservedKeys.delete(key);
      }
    });
  }

  /** Deduplicate by id / storageKey / link; newest createdAt first. */
  private mergeUnservedNewestFirst(
    existing: UnservedNotificationItem[],
    incoming: UnservedNotificationItem[]
  ): UnservedNotificationItem[] {
    const byId = new Map<string, UnservedNotificationItem>();
    const remember = (item: UnservedNotificationItem) => {
      const prev = byId.get(item.id);
      if (!prev || item.createdAt >= prev.createdAt) {
        byId.set(item.id, item);
      }
    };
    existing.forEach(remember);
    incoming.forEach(remember);

    // Drop older duplicates that share storageKey or link but different id
    const list = Array.from(byId.values());
    const seenKeys = new Set<string>();
    const seenLinks = new Set<string>();
    const deduped: UnservedNotificationItem[] = [];
    list
      .sort((a, b) => b.createdAt - a.createdAt)
      .forEach((item) => {
        if (item.storageKey && seenKeys.has(item.storageKey)) {
          return;
        }
        if (item.link && seenLinks.has(item.link)) {
          return;
        }
        if (item.storageKey) {
          seenKeys.add(item.storageKey);
        }
        if (item.link) {
          seenLinks.add(item.link);
        }
        deduped.push(item);
      });
    return deduped;
  }

  private publishUnservedStack(items: UnservedNotificationItem[]): void {
    this.unservedNotificationsSubject.next(items);
  }

  private resolveUnservedCreatedAt(createdAt?: string | number | Date): number {
    if (createdAt instanceof Date) {
      const ms = createdAt.getTime();
      return Number.isNaN(ms) ? Date.now() : ms;
    }
    if (typeof createdAt === 'number' && Number.isFinite(createdAt)) {
      return createdAt;
    }
    if (typeof createdAt === 'string' && createdAt.trim()) {
      const ms = Date.parse(createdAt);
      if (!Number.isNaN(ms)) {
        return ms;
      }
    }
    return Date.now();
  }

  private unservedNotificationId(
    link: string,
    sender: string,
    msg: string,
    storageKey: string
  ): string {
    if (storageKey) {
      return storageKey;
    }
    if (link) {
      return link;
    }
    return `unserved-${Date.now()}-${sender}-${msg}`.slice(0, 180);
  }

  showWidgetStyleUpdateNotification(message: string, notificationColor: number, icon: string): void {
    const alertType =
      DashboardToastrService.WIDGET_NOTIFY_ALERT_TYPES[notificationColor] ||
      DashboardToastrService.WIDGET_NOTIFY_ALERT_TYPES[1];
    const iconBg = this.getWidgetNotificationIconBg(notificationColor);
    const html = `
      <div class="td-widget-notify-body">
        <span class="td-widget-notify-icon">
          <i class="material-icons" style="background-color: ${iconBg}">${icon}</i>
        </span>
        <span class="td-widget-notify-message">${message}</span>
      </div>
    `;

    const toast = this.toastr.show(html, '', {
      ...this.widgetToastConfig,
      toastClass: `ngx-toastr td-widget-notify-toast alert alert-${alertType} animated`,
    });

    toast.onShown.subscribe(() => {
      const el = toast.portal?.location?.nativeElement as HTMLElement | undefined;
      if (el) {
        el.style.animationDuration = '350ms';
        el.classList.add('fadeInDown');
      }
    });

    const exitMs = DashboardToastrService.WIDGET_TOAST_EXIT_MS;
    setTimeout(() => this.dismissForegroundToast(toast, undefined, exitMs), 2000);

    toast.onTap.subscribe(() => {
      this.dismissForegroundToast(toast, undefined, exitMs);
    });
  }

  /** Notifica cambio progetto: alto a destra; `notificationColor` come widget (1 info, 2 success, 3 warning, 4 danger). */
  showNotificationChangeProject(message: string, notificationColor: number, icon: string): void {
    const alertType =
      DashboardToastrService.WIDGET_NOTIFY_ALERT_TYPES[notificationColor] ||
      DashboardToastrService.WIDGET_NOTIFY_ALERT_TYPES[1];
    const iconBg = this.getWidgetNotificationIconBg(notificationColor);
    const html = `
      <div class="td-widget-notify-body">
        <span class="td-widget-notify-icon">
          <i class="material-icons" style="background-color: ${iconBg}">${icon}</i>
        </span>
        <span class="td-widget-notify-message">${message}</span>
      </div>
    `;

    const toast = this.toastr.show(html, '', {
      ...this.widgetToastConfig,
      toastClass: `ngx-toastr td-change-project-notify-toast alert alert-${alertType} animated`,
    });

    toast.onShown.subscribe(() => {
      const el = toast.portal?.location?.nativeElement as HTMLElement | undefined;
      if (el) {
        el.style.animationDuration = '350ms';
        el.classList.add('fadeInDown');
      }
    });

    const exitMs = DashboardToastrService.WIDGET_TOAST_EXIT_MS;
    const visibleMs = DashboardToastrService.CHANGE_PROJECT_TOAST_VISIBLE_MS;
    setTimeout(() => this.dismissForegroundToast(toast, undefined, exitMs), visibleMs);

    toast.onTap.subscribe(() => {
      this.dismissForegroundToast(toast, undefined, exitMs);
    });
  }

  /** Banner basso centro; `notificationColor` come widget (1 info, 2 success, 3 warning, 4 danger). */
  showToast(message: string, notificationColor: number, icon: string): void {
    const alertType =
      DashboardToastrService.WIDGET_NOTIFY_ALERT_TYPES[notificationColor] ||
      DashboardToastrService.WIDGET_NOTIFY_ALERT_TYPES[4];
    const html = `
      <div class="td-center-toast-body">
        <i class="material-icons td-center-toast-icon">${icon}</i>
        <span class="td-center-toast-message">${message}</span>
      </div>
    `;

    const toast = this.toastr.show(html, '', {
      ...this.centerToastConfig,
      toastClass: `ngx-toastr td-center-toast alert alert-${alertType} animated`,
    });

    toast.onShown.subscribe(() => {
      const el = toast.portal?.location?.nativeElement as HTMLElement | undefined;
      if (el) {
        el.style.animationDuration = '350ms';
        el.classList.add('fadeInUp');
      }
    });

    const exitMs = DashboardToastrService.WIDGET_TOAST_EXIT_MS;
    const visibleMs = DashboardToastrService.CENTER_TOAST_VISIBLE_MS;
    setTimeout(() => this.dismissCenterToast(toast, undefined, exitMs), visibleMs);

    toast.onTap.subscribe(() => {
      this.dismissCenterToast(toast, undefined, exitMs);
    });
  }

  /** Invio link verifica email: messaggio in corso → success dopo 2s (stessa toast). */
  showResendingVerifyEmailNotification(userEmail: string): void {
    this.clearVerifyEmailSuccessDismissTimer();
    if (this.verifyEmailToast?.toastId) {
      this.toastr.remove(this.verifyEmailToast.toastId);
      this.verifyEmailToast = null;
    }

    const email = userEmail != null ? String(userEmail) : '';
    const progressHtml = this.buildVerifyEmailProgressHtml();
    const toast = this.toastr.show(progressHtml, '', {
      ...this.verifyEmailToastConfig,
      toastClass: 'ngx-toastr td-verify-email-toast alert alert-info animated',
    });
    this.verifyEmailToast = toast;

    toast.onShown.subscribe(() => {
      const el = toast.portal?.location?.nativeElement as HTMLElement | undefined;
      if (el) {
        this.removeArchivingToastCloseButton(el);
        el.style.animationDuration = '350ms';
        el.classList.add('fadeInDown');
      }
    });

    toast.onHidden.subscribe(() => {
      if (this.verifyEmailToast?.toastId === toast.toastId) {
        this.verifyEmailToast = null;
        this.clearVerifyEmailSuccessDismissTimer();
      }
    });

    window.setTimeout(() => {
      if (this.verifyEmailToast?.toastId !== toast.toastId) {
        return;
      }
      const successHtml = this.buildVerifyEmailSuccessHtml(email);
      this.patchVerifyEmailToastHtml(successHtml, 'success');

      const exitMs = DashboardToastrService.WIDGET_TOAST_EXIT_MS;
      this.verifyEmailSuccessDismissTimer = window.setTimeout(() => {
        if (this.verifyEmailToast?.toastId === toast.toastId) {
          this.dismissForegroundToast(toast, () => {
            this.verifyEmailToast = null;
          }, exitMs);
        }
      }, DashboardToastrService.VERIFY_EMAIL_SUCCESS_VISIBLE_MS) as unknown as number;
    }, DashboardToastrService.VERIFY_EMAIL_UPDATE_MS);
  }

  showArchivingRequestNotification(msg: string): void {
    this.clearArchivingFinishTimer();
    this.clearArchivingProgressStepTimer();
    this.archivingProgressText = msg != null ? String(msg) : '';
    this.archivingProgressShownAt = Date.now();
    this.flushArchivingProgressToast();
  }

  /**
   * Una sola toast in progress: completed/total da 1 (es. 1/6 … 6/6).
   * Se le richieste finiscono in parallelo, i passaggi intermedi vengono mostrati in sequenza.
   */
  showArchivingRequestProgress(messagePrefix: string, completed: number, total: number): void {
    this.clearArchivingFinishTimer();
    const prefix = messagePrefix != null ? String(messagePrefix) : '';
    const safeTotal = Math.max(1, Math.floor(total) || 1);
    let safeCompleted = Math.max(1, Math.floor(completed) || 1);
    safeCompleted = Math.min(safeCompleted, safeTotal);

    this.archivingProgressPrefix = prefix;
    this.archivingProgressTotal = safeTotal;
    if (safeCompleted > this.archivingProgressTarget) {
      this.archivingProgressTarget = safeCompleted;
    }

    if (this.archivingProgressDisplayed === 0) {
      this.scheduleNextArchivingProgressStep();
      return;
    }
    if (safeCompleted > this.archivingProgressDisplayed) {
      this.scheduleNextArchivingProgressStep();
    }
  }

  showAllRequestHaveBeenArchivedNotification(msg_part1: string): void {
    const text = msg_part1 != null && String(msg_part1) !== 'undefined' ? String(msg_part1).trim() : '';
    if (text) {
      this.finishArchivingToast(text);
      return;
    }
    this.translate.get('AllConversationsaveBeenArchived').subscribe((translated) => {
      this.finishArchivingToast(translated);
    });
  }

  showRequestIsArchivedNotification(msg_part1: string): void {
    this.finishArchivingToast(msg_part1);
  }

  operationinprogress(msg: string): void {
    this.showOrUpdateArchivingToast(this.buildArchivingProgressHtml(msg), 'info');
  }

  operationcompleted(msg: string): void {
    this.finishArchivingToast(msg);
  }

  private getWidgetNotificationIconBg(notificationColor: number): string {
    if (notificationColor === 4) {
      return '#d2291c';
    }
    if (notificationColor === 2) {
      return '#449d48';
    }
    if (notificationColor === 3) {
      return '#ffecb5';
    }
    return '#03a9f4';
  }

  private dismissForegroundToast(
    toast: ActiveToast<any>,
    onHidden?: () => void,
    exitAnimationMs = 450
  ): void {
    const el = toast.portal?.location?.nativeElement as HTMLElement | undefined;
    if (!el) {
      this.toastr.remove(toast.toastId);
      onHidden?.();
      return;
    }
    el.classList.remove('fadeInDown');
    void el.offsetWidth;
    el.style.animationDuration = `${exitAnimationMs}ms`;
    el.classList.add('fadeOutUp');
    let done = false;
    const finish = () => {
      if (done) {
        return;
      }
      done = true;
      this.toastr.remove(toast.toastId);
      onHidden?.();
    };
    el.addEventListener('animationend', finish, { once: true });
    setTimeout(finish, exitAnimationMs + 80);
  }

  private dismissCenterToast(
    toast: ActiveToast<any>,
    onHidden?: () => void,
    exitAnimationMs = 450
  ): void {
    const el = toast.portal?.location?.nativeElement as HTMLElement | undefined;
    if (!el) {
      this.toastr.remove(toast.toastId);
      onHidden?.();
      return;
    }
    el.classList.remove('fadeInUp');
    void el.offsetWidth;
    el.style.animationDuration = `${exitAnimationMs}ms`;
    el.classList.add('fadeOutDown');
    let done = false;
    const finish = () => {
      if (done) {
        return;
      }
      done = true;
      this.toastr.remove(toast.toastId);
      onHidden?.();
    };
    el.addEventListener('animationend', finish, { once: true });
    setTimeout(finish, exitAnimationMs + 80);
  }

  private clearArchivingFinishTimer(): void {
    if (this.archivingFinishTimer) {
      clearTimeout(this.archivingFinishTimer);
      this.archivingFinishTimer = null;
    }
  }

  private clearArchivingProgressStepTimer(): void {
    if (this.archivingProgressStepTimer) {
      clearTimeout(this.archivingProgressStepTimer);
      this.archivingProgressStepTimer = null;
    }
  }

  private resetArchivingProgressState(): void {
    this.archivingProgressDisplayed = 0;
    this.archivingProgressTarget = 0;
    this.archivingProgressTotal = 0;
    this.archivingProgressPrefix = '';
    this.clearArchivingProgressStepTimer();
  }

  private applyArchivingProgressLabel(completed: number, total: number): void {
    const text = `${this.archivingProgressPrefix}${completed}/${total}`;
    this.archivingProgressText = text;
    const html = this.buildArchivingProgressHtml(text);
    if (this.notifyArchivingRequest?.toastId) {
      this.patchArchivingToastHtml(html, 'info');
      return;
    }
    this.archivingProgressShownAt = Date.now();
    this.showOrUpdateArchivingToast(html, 'info');
  }

  private scheduleNextArchivingProgressStep(): void {
    this.clearArchivingProgressStepTimer();
    if (this.archivingProgressDisplayed >= this.archivingProgressTarget) {
      return;
    }
    const next = this.archivingProgressDisplayed + 1;
    this.applyArchivingProgressLabel(next, this.archivingProgressTotal);
    this.archivingProgressDisplayed = next;
    if (next < this.archivingProgressTarget) {
      this.archivingProgressStepTimer = window.setTimeout(
        () => this.scheduleNextArchivingProgressStep(),
        DashboardToastrService.ARCHIVING_PROGRESS_STEP_MS
      ) as unknown as number;
    }
  }

  private removeArchivingToastCloseButton(el: HTMLElement): void {
    el.querySelectorAll('.toast-close-button').forEach((btn) => btn.remove());
  }

  private buildArchivingProgressHtml(message: string): string {
    return `<div class="td-widget-notify-body"><span class="td-widget-notify-message">${message}</span></div>`;
  }

  private buildVerifyEmailProgressHtml(): string {
    return `<div class="td-widget-notify-body"><span class="td-widget-notify-message">Sending verification link ...</span></div>`;
  }

  private buildVerifyEmailSuccessHtml(userEmail: string): string {
    return `
      <div class="td-widget-notify-body">
        <span class="td-widget-notify-icon">
          <i class="material-icons" style="background-color: #449d48">done</i>
        </span>
        <span class="td-widget-notify-message">
          <span style="vertical-align: middle; display: inline-block; padding-right: 5px">Verification link has been sent to:</span>
          <span style="vertical-align: middle; display: inline-block; padding-left: 5px">${userEmail}</span>
        </span>
      </div>
    `;
  }

  private patchVerifyEmailToastHtml(html: string, alertType: string, retriesLeft = 5): void {
    const toast = this.verifyEmailToast;
    if (!toast?.toastId) {
      return;
    }
    const el = toast.portal?.location?.nativeElement as HTMLElement | undefined;
    if (!el) {
      if (retriesLeft > 0) {
        requestAnimationFrame(() => this.patchVerifyEmailToastHtml(html, alertType, retriesLeft - 1));
      }
      return;
    }
    el.className = `ngx-toastr td-verify-email-toast alert alert-${alertType} animated`;
    this.removeArchivingToastCloseButton(el);
    let msgEl = el.querySelector('.toast-message') as HTMLElement | null;
    if (!msgEl) {
      msgEl = document.createElement('div');
      msgEl.className = 'toast-message';
      el.appendChild(msgEl);
    }
    msgEl.innerHTML = html;
  }

  private clearVerifyEmailSuccessDismissTimer(): void {
    if (this.verifyEmailSuccessDismissTimer) {
      clearTimeout(this.verifyEmailSuccessDismissTimer);
      this.verifyEmailSuccessDismissTimer = null;
    }
  }

  private buildArchivingSuccessHtml(message: string): string {
    return `
      <div class="td-widget-notify-body">
        <span class="td-widget-notify-icon">
          <i class="material-icons" style="background-color: #449d48">done</i>
        </span>
        <span class="td-widget-notify-message">${message}</span>
      </div>
    `;
  }

  private patchArchivingToastHtml(html: string, alertType: string, retriesLeft = 5): void {
    const toast = this.notifyArchivingRequest;
    if (!toast?.toastId) {
      return;
    }
    const el = toast.portal?.location?.nativeElement as HTMLElement | undefined;
    if (!el) {
      if (retriesLeft > 0) {
        requestAnimationFrame(() => this.patchArchivingToastHtml(html, alertType, retriesLeft - 1));
      }
      return;
    }
    el.className = `ngx-toastr td-archiving-notify-toast alert alert-${alertType} animated`;
    this.removeArchivingToastCloseButton(el);
    let msgEl = el.querySelector('.toast-message') as HTMLElement | null;
    if (!msgEl) {
      msgEl = document.createElement('div');
      msgEl.className = 'toast-message';
      el.appendChild(msgEl);
    }
    msgEl.innerHTML = html;
  }

  /** Stessa toast: aggiorna testo in corso (es. 2/5) o ne crea una nuova. */
  private showOrUpdateArchivingToast(html: string, alertType: string): void {
    const existing = this.notifyArchivingRequest;
    if (existing?.toastId && alertType === 'info') {
      const el = existing.portal?.location?.nativeElement as HTMLElement | undefined;
      if (el?.classList.contains('alert-success')) {
        this.toastr.remove(existing.toastId);
        this.notifyArchivingRequest = null;
      }
    }
    if (this.notifyArchivingRequest?.toastId) {
      requestAnimationFrame(() => this.patchArchivingToastHtml(html, alertType));
      return;
    }
    const toast = this.toastr.show(html, '', {
      ...this.archivingToastConfig,
      toastClass: `ngx-toastr td-archiving-notify-toast alert alert-${alertType} animated`,
    });
    this.notifyArchivingRequest = toast;
    toast.onShown.subscribe(() => {
      const el = toast.portal?.location?.nativeElement as HTMLElement | undefined;
      if (el) {
        this.removeArchivingToastCloseButton(el);
        el.style.animationDuration = '350ms';
        el.classList.add('fadeInDown');
      }
      if (alertType === 'info' && this.archivingProgressText) {
        this.patchArchivingToastHtml(
          this.buildArchivingProgressHtml(this.archivingProgressText),
          'info'
        );
      }
    });
    toast.onHidden.subscribe(() => {
      if (this.notifyArchivingRequest?.toastId === toast.toastId) {
        this.notifyArchivingRequest = null;
        this.archivingProgressText = '';
        this.resetArchivingProgressState();
      }
    });
  }

  private flushArchivingProgressToast(): void {
    const text = this.archivingProgressText ?? '';
    this.showOrUpdateArchivingToast(this.buildArchivingProgressHtml(text), 'info');
  }

  private finishArchivingToast(message: string): void {
    this.clearArchivingFinishTimer();
    this.clearArchivingProgressStepTimer();
    const text = message != null && String(message) !== 'undefined' ? String(message) : '';
    const runSuccess = () => {
      this.archivingProgressText = '';
      this.resetArchivingProgressState();
      this.showOrUpdateArchivingToast(this.buildArchivingSuccessHtml(text), 'success');
      const toast = this.notifyArchivingRequest;
      if (!toast) {
        return;
      }
      const exitMs = DashboardToastrService.WIDGET_TOAST_EXIT_MS;
      window.setTimeout(() => {
        this.dismissForegroundToast(toast, () => {
          this.notifyArchivingRequest = null;
        }, exitMs);
      }, 2500);
    };
    const elapsed = Date.now() - this.archivingProgressShownAt;
    const waitMs = Math.max(0, DashboardToastrService.ARCHIVING_PROGRESS_MIN_VISIBLE_MS - elapsed);
    if (this.notifyArchivingRequest && waitMs > 0) {
      this.archivingFinishTimer = window.setTimeout(runSuccess, waitMs) as unknown as number;
    } else {
      runSuccess();
    }
  }
}
