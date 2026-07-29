import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import {
  DashboardToastrService,
  UnservedNotificationItem,
} from 'app/core/dashboard-toastr.service';
import { AuthService } from 'app/core/auth.service';

@Component({
  selector: 'appdashboard-unserved-notifications',
  templateUrl: './unserved-notifications.component.html',
  styleUrls: ['./unserved-notifications.component.scss'],
})
export class UnservedNotificationsComponent implements OnInit, OnDestroy {
  /** Auto-dismiss window for the unserved stack. */
  private static readonly AUTO_DISMISS_MS = 10000;

  /** All stored notifications (any project). */
  private allItems: UnservedNotificationItem[] = [];
  /** Notifications for the current project only. */
  items: UnservedNotificationItem[] = [];
  expanded = false;
  /** False on login / signup / projects list / panel routes (same idea as old toast hide). */
  canShow = false;
  currentProjectId: string | null = null;
  /** Entrance animation class toggle (fadeInDown). */
  enterAnimating = false;

  private readonly destroy$ = new Subject<void>();
  /**
   * After refresh, project_bs often emits null then the project — that must not
   * count as "project enter". Only present after a real leave→enter or A→B switch.
   */
  private projectHydrated = false;
  /**
   * True only when the app boots already inside a project route (refresh).
   * The first visibility enter must not show toasts in that case.
   */
  private skipNextVisibilityEnter = false;
  private enterAnimationTimer: number | null = null;
  /** Auto-dismiss timer; paused while the stack is expanded. */
  private autoDismissTimer: number | null = null;

  constructor(
    private dashboardToastr: DashboardToastrService,
    private auth: AuthService,
    private router: Router,
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.updateRouteVisibility(this.location.path());
    // Refresh while already on a project page: ignore the first "enter" signal.
    if (this.canShow) {
      this.skipNextVisibilityEnter = true;
      this.dashboardToastr.disarmUnservedPresentation();
    }

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        const wasShow = this.canShow;
        this.updateRouteVisibility(this.location.path());

        if (wasShow && !this.canShow) {
          // Left project UI (e.g. /projects): park and block until next enter.
          this.dashboardToastr.disarmUnservedPresentation(this.currentProjectId || undefined);
          this.applyProjectFilter();
          this.skipNextVisibilityEnter = false;
          return;
        }

        if (!wasShow && this.canShow && this.currentProjectId) {
          if (this.skipNextVisibilityEnter) {
            // Initial NavigationEnd after refresh — do not present backlog,
            // but arm so subsequent live unserved still toast.
            this.skipNextVisibilityEnter = false;
            this.dashboardToastr.armUnservedPresentationForLiveEvents();
            this.applyProjectFilter();
            return;
          }
          this.presentOnProjectEnter(this.currentProjectId);
        }
      });

    this.auth.project_bs
      .pipe(takeUntil(this.destroy$))
      .subscribe((project) => {
        const prevId = this.currentProjectId;
        this.currentProjectId = project?._id || null;
        const projectChanged = prevId !== this.currentProjectId;

        if (!this.projectHydrated) {
          // First non-null project (or settling null→project) after refresh: never present backlog.
          if (this.currentProjectId) {
            this.projectHydrated = true;
          }
          this.dashboardToastr.disarmUnservedPresentation();
          this.applyProjectFilter();
          // Already inside a project route: allow new live toasts after hydrate.
          if (this.canShow && this.currentProjectId) {
            this.dashboardToastr.armUnservedPresentationForLiveEvents();
          }
          return;
        }

        this.applyProjectFilter();

        // After hydrate: A→B switch, or null→project when leaving /projects and entering one.
        // (Hydrate's first null→project is handled above and must not present backlog.)
        if (projectChanged && this.currentProjectId && this.canShow) {
          this.presentOnProjectEnter(this.currentProjectId);
        }
      });

    this.dashboardToastr.unservedNotifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe((items) => {
        this.allItems = items;
        this.applyProjectFilter();
      });
  }

  ngOnDestroy(): void {
    if (this.enterAnimationTimer != null) {
      window.clearTimeout(this.enterAnimationTimer);
    }
    this.clearAutoDismiss();
    this.destroy$.next();
    this.destroy$.complete();
  }

  get visibleItems(): UnservedNotificationItem[] {
    if (this.expanded || this.items.length <= 1) {
      return this.items;
    }
    return this.items.slice(0, 3);
  }

  get isStacked(): boolean {
    return !this.expanded && this.items.length > 1;
  }

  get showExpandedToolbar(): boolean {
    return this.expanded && this.items.length > 1;
  }

  onStackOrCardClick(item: UnservedNotificationItem, event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (target?.closest('.td-unserved-close, .td-unserved-stack-close, .td-unserved-toolbar')) {
      return;
    }

    if (this.isStacked) {
      this.expanded = true;
      this.syncAutoDismiss();
      return;
    }

    this.openDetail(item);
  }

  onDismissOne(item: UnservedNotificationItem, event: MouseEvent): void {
    event.stopPropagation();
    // Same as open detail: permanent handled — do not bring back on project re-enter.
    this.dashboardToastr.dismissUnservedNotification(item.id, true);
  }

  onClearAll(event?: MouseEvent): void {
    event?.stopPropagation();
    // User "close all": permanent handled (not soft park).
    this.dashboardToastr.dismissAllUnservedPermanently(this.currentProjectId || undefined);
    this.expanded = false;
    this.clearAutoDismiss();
  }

  onShowLess(event: MouseEvent): void {
    event.stopPropagation();
    this.expanded = false;
    this.syncAutoDismiss();
  }

  trackById(_index: number, item: UnservedNotificationItem): string {
    return item.id;
  }

  private presentOnProjectEnter(projectId: string): void {
    this.dashboardToastr.armUnservedPresentationOnProjectEnter(projectId);
    this.applyProjectFilter();
    if (this.items.length > 0) {
      this.dashboardToastr.notifyUnservedPresentedOnce(true);
      this.triggerEnterAnimation();
    }
  }

  private applyProjectFilter(): void {
    if (!this.currentProjectId) {
      this.items = [];
      this.expanded = false;
      this.clearAutoDismiss();
      return;
    }
    this.items = this.allItems
      .filter((item) => item.projectId === this.currentProjectId)
      .sort((a, b) => b.createdAt - a.createdAt);
    if (this.items.length <= 1) {
      this.expanded = false;
    }
    this.syncAutoDismiss();
  }

  /**
   * Hide unserved toasts on auth / projects / panel / onboarding routes
   * (aligned with app.component LOGIN_PAGE / navbar hidePendingEmailNotification).
   */
  private updateRouteVisibility(path: string): void {
    const route = (path || '').split('?')[0];
    if (!route) {
      this.canShow = false;
      this.syncAutoDismiss();
      return;
    }

    const hidden =
      route === '/login' ||
      route === '/signup' ||
      route === '/projects' ||
      route === '/forgotpsw' ||
      route === '/create-project' ||
      route.indexOf('/signup') !== -1 ||
      route.indexOf('/signup-on-invitation') !== -1 ||
      route.indexOf('/projects') !== -1 ||
      route.indexOf('/verify') !== -1 ||
      route.indexOf('/resetpassword') !== -1 ||
      route.indexOf('/pricing') !== -1 ||
      route.indexOf('/chat-pricing') !== -1 ||
      route.indexOf('/success') !== -1 ||
      route.indexOf('/canceled') !== -1 ||
      route.indexOf('/create-new-project') !== -1 ||
      route.indexOf('/configure-widget') !== -1 ||
      route.indexOf('/onboarding') !== -1 ||
      route.indexOf('/install-widget') !== -1 ||
      route.indexOf('/handle-invitation') !== -1 ||
      route.indexOf('/activate-product') !== -1 ||
      route.indexOf('/request-for-panel') !== -1 ||
      route.indexOf('/projects-for-panel') !== -1 ||
      route.indexOf('/project-for-panel') !== -1 ||
      route.indexOf('/unserved-request-for-panel') !== -1 ||
      route.indexOf('/autologin') !== -1 ||
      route.indexOf('/get-chatbot') !== -1 ||
      route.indexOf('/install-template') !== -1 ||
      route.indexOf('/unauthorized') !== -1 ||
      route.indexOf('/invalid-token') !== -1 ||
      route.indexOf('/desktop-access') !== -1 ||
      route.indexOf('/desktop--access') !== -1;

    this.canShow = !hidden;
    this.syncAutoDismiss();
  }

  /**
   * Auto-dismiss the current project stack after AUTO_DISMISS_MS.
   * Paused while expanded; full timer restarts when the stack is collapsed again.
   * Soft-parks only (unlike user close / close-all) so they can return on project re-enter.
   */
  private syncAutoDismiss(): void {
    this.clearAutoDismiss();
    if (!this.canShow || this.expanded || this.items.length === 0) {
      return;
    }
    this.autoDismissTimer = window.setTimeout(() => {
      this.autoDismissTimer = null;
      if (this.currentProjectId) {
        this.dashboardToastr.parkUnservedNotifications(this.currentProjectId);
      } else {
        this.dashboardToastr.parkUnservedNotifications();
      }
      this.expanded = false;
    }, UnservedNotificationsComponent.AUTO_DISMISS_MS);
  }

  private clearAutoDismiss(): void {
    if (this.autoDismissTimer != null) {
      window.clearTimeout(this.autoDismissTimer);
      this.autoDismissTimer = null;
    }
  }

  private triggerEnterAnimation(): void {
    if (this.enterAnimationTimer != null) {
      window.clearTimeout(this.enterAnimationTimer);
    }
    this.enterAnimating = false;
    window.requestAnimationFrame(() => {
      this.enterAnimating = true;
      this.enterAnimationTimer = window.setTimeout(() => {
        this.enterAnimating = false;
        this.enterAnimationTimer = null;
      }, 450);
    });
  }

  private openDetail(item: UnservedNotificationItem): void {
    // Opened by the user: permanent handled — do not bring back on project re-enter.
    this.dashboardToastr.dismissUnservedNotification(item.id, true);
    if (item.link) {
      window.location.href = item.link;
    }
  }
}
