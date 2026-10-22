import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/core/auth.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { ProjectService } from 'app/services/project.service';
import { LocalDbService } from 'app/services/users-local-db.service';
import { WidgetService } from 'app/services/widget.service';
import { tranlatedLanguage } from 'app/utils/util';
import {
  chooseProjectForBuild, lastOpenedProjectOf, lastProjectIdFrom, projectNameForUser,
  readBuildOrigin, readBuildPromptFromQuery, savePendingBuild
} from 'app/utils/pending-build.util';
import { Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';

/**
 * Landing page for a prompt written on the website: `/#/build?prompt=<text>`.
 *
 * Kept apart from the onboarding on purpose, so nothing of the current flows changes. It:
 * 1. saves the prompt for the Home (pending-build.util) and drops it from the address;
 * 2. not logged in: goes to the login, leaving itself as the page to come back to (`wannago`, the
 *    key the login and the signup already honour after access). No query on it: the prompt is
 *    already saved, and a `?` in `wannago` would be mangled by the login's redirect;
 * 3. logged in: opens the last project used if it is still one of the user's -- `last_project`
 *    as the projects list writes it, or, after a logout has removed that, the last project this
 *    user opened (`lastOpenedProjectOf`) -- else the only project, else the projects list. A user
 *    with no project at all -- just signed up -- gets one created, as the onboarding does
 *    (name, owner role, widget labels), and lands on its Home. The Home then
 *    puts the prompt in the vibe coder field; nothing is started until the user presses it.
 */
/** Where the login and the signup send the user after access (SigninComponent, SignupComponent). */
const WANNAGO_KEY = 'wannago';
/** This page, as stored there: no query, the prompt is already saved. */
const BUILD_ROUTE = '/build';

@Component({
  selector: 'appdashboard-build-from-website',
  templateUrl: './build-from-website.component.html',
  styleUrls: ['./build-from-website.component.scss']
})
export class BuildFromWebsiteComponent implements OnInit, OnDestroy {

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly auth: AuthService,
    private readonly projectService: ProjectService,
    private readonly localDbService: LocalDbService,
    private readonly widgetService: WidgetService,
    private readonly translate: TranslateService,
    private readonly logger: LoggerService
  ) { }

  ngOnInit(): void {
    const prompt = readBuildPromptFromQuery(this.route.snapshot.queryParams);
    if (prompt) {
      const originUrl = readBuildOrigin(this.route.snapshot.queryParams, document.referrer, window.location.origin);
      const saved = savePendingBuild(prompt, Date.now(), originUrl);
      this.logger.log('[BUILD-FROM-WEBSITE] prompt received from', originUrl, 'saved:', saved);
    }

    if (!this.loggedUser()) {
      this.logger.log('[BUILD-FROM-WEBSITE] not logged in: to the login, then back here');
      this.localDbService.setInStorage(WANNAGO_KEY, BUILD_ROUTE);
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }
    // Back from the login: the login does not remove `wannago` itself, and left there it would
    // bring every later login to this page.
    if (this.localDbService.getFromStorage(WANNAGO_KEY) === BUILD_ROUTE) {
      this.localDbService.removeFromStorage(WANNAGO_KEY);
    }
    this.openLastProject(this.loggedUser());
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /** The logged user, as the AuthService publishes it or as it stays in storage after a reload. */
  private loggedUser(): any {
    const published = this.auth.user_bs?.value;
    if (published) {
      return published;
    }
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private openLastProject(user: any): void {
    let lastId: string | null = null;
    try { lastId = lastProjectIdFrom(localStorage.getItem('last_project')); } catch { lastId = null; }
    lastId = lastId || lastOpenedProjectOf(user?._id || user?.id);
    this.projectService.getProjects()
      .pipe(take(1), takeUntil(this.unsubscribe$))
      .subscribe({
        next: (projectUsers: any[]) => {
          if (!projectUsers || projectUsers.length === 0) {
            this.createFirstProject(user);
            return;
          }
          const chosen = chooseProjectForBuild(projectUsers, lastId);
          if (!chosen) {
            this.logger.log('[BUILD-FROM-WEBSITE] no last project to open: to the projects list');
            this.router.navigate(['/projects'], { replaceUrl: true });
            return;
          }
          this.goToHome(chosen);
        },
        error: (error) => {
          this.logger.error('[BUILD-FROM-WEBSITE] projects not loaded: to the projects list', error);
          this.router.navigate(['/projects'], { replaceUrl: true });
        }
      });
  }

  /** A user with no project (just signed up): create one as the onboarding does, then its Home. */
  private createFirstProject(user: any): void {
    const name = projectNameForUser(user);
    this.logger.log('[BUILD-FROM-WEBSITE] no project yet: creating', name);
    this.projectService.createProject(name, 'build-from-website')
      .pipe(take(1), takeUntil(this.unsubscribe$))
      .subscribe({
        next: (project: any) => {
          project['role'] = 'owner';
          this.auth.projectSelected(project, 'BUILD-FROM-WEBSITE');
          localStorage.setItem(project._id, JSON.stringify(project));
          this.auth.project_bs.pipe(
            filter((p: any) => !!(p && p._id === project._id)),
            take(1),
            takeUntil(this.unsubscribe$)
          ).subscribe(() => {
            this.cloneWidgetDefaultLanguage();
            this.router.navigate([`/project/${project._id}/home`], { replaceUrl: true });
          });
        },
        error: (error) => {
          this.logger.error('[BUILD-FROM-WEBSITE] project not created: to the projects list', error);
          this.router.navigate(['/projects'], { replaceUrl: true });
        }
      });
  }

  /** As the onboarding: seed the new project's widget labels in the browser's language (or EN).
   *  Fire-and-forget, it does not hold the Home back. */
  private cloneWidgetDefaultLanguage(): void {
    const browserLang = this.translate.getBrowserLang();
    const langCode = tranlatedLanguage.includes(browserLang) ? browserLang : 'en';
    this.widgetService.cloneLabel(langCode.toUpperCase()).subscribe({
      next: () => this.logger.log('[BUILD-FROM-WEBSITE] widget labels seeded:', langCode),
      error: (error) => this.logger.error('[BUILD-FROM-WEBSITE] widget labels not seeded', error)
    });
  }

  /** What the projects list does on a project card (ProjectsComponent.goToHome), and the same Home. */
  private goToHome(projectUser: any): void {
    const project = { ...projectUser.id_project, role: projectUser.role, is_selected: true };
    localStorage.setItem('last_project', JSON.stringify(projectUser));
    this.auth.projectSelected(project, 'BUILD-FROM-WEBSITE');
    localStorage.setItem(project._id, JSON.stringify(project));
    localStorage.setItem('project', JSON.stringify(project));
    this.logger.log('[BUILD-FROM-WEBSITE] opening the Home of', project._id);
    this.router.navigate([`/project/${project._id}/home`], { replaceUrl: true });
  }
}
