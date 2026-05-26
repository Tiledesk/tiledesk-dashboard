import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActiveToast, IndividualConfig, ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class DashboardToastrService {
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

  /** Stesso comportamento di bootstrap-notify: stack verticale, fadeInDown / fadeOutUp. */
  private readonly foregroundToastConfig: Partial<IndividualConfig> = {
    enableHtml: true,
    disableTimeOut: true,
    positionClass: 'toast-top-center',
    toastClass: 'ngx-toastr td-notify-toast alert alert-minimalist-pooled animated',
    closeButton: false,
    tapToDismiss: false,
    newestOnTop: false,
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
  ) {}

  showForegroungPushNotification(
    sender: string,
    msg: string,
    link: string,
    _requester_avatar_initial?: string,
    _requester_avatar_bckgrnd?: string
  ): void {
    const html = `
      <div id="foreground-not" class="td-notify-container">
        <span class="td-notify-foreground-header">New message</span>
        <span class="td-notify-title">${sender}</span>
        <span class="td-notify-message">${msg}</span>
      </div>
    `;

    const toast = this.toastr.show(html, '', {
      ...this.foregroundToastConfig,
      toastClass: 'ngx-toastr td-notify-toast alert alert-minimalist animated',
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

  showUnservedNotication(sender: string, msg: string, link: string): void {
    const html = `
      <div class="td-notify-container">
        <span class="td-notify-header">New unassigned chat</span>
        <span class="td-notify-title">${sender}</span>
        <span class="td-notify-message">${msg}</span>
      </div>
    `;

    const toast = this.toastr.show(html, '', this.foregroundToastConfig);

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
