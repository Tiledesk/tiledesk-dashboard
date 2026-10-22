import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/core/auth.service';
import { Project } from 'app/models/project-model';
import { BrandService } from 'app/services/brand.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { ProjectService } from 'app/services/project.service';
import { WidgetService } from 'app/services/widget.service';
import {
  ONBOARDING_FOCUS_VIBE_CODER_STATE,
  ONBOARDING_VIBE_CODER_PROMPT_STATE,
  consumePendingWebsitePrompt,
} from 'app/utils/pending-website-prompt.util';
import { emailDomainWhiteList, tranlatedLanguage } from 'app/utils/util';
import { Subject } from 'rxjs';
import { filter, take, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'appdashboard-onboarding-welcome',
  templateUrl: './onboarding-welcome.component.html',
  styleUrls: ['./onboarding-welcome.component.scss']
})
export class OnboardingWelcomeComponent implements OnInit, OnDestroy {
  company_name: string;
  companyNameParams: any;
  isStarting = false;
  startError: string | null = null;

  private user: any;
  /** Prompt from marketing site (?prompt=) — prefilled on Home vibe coder, no auto agent create. */
  private pendingExternalPrompt: string | null = null;
  private silentStartTriggered = false;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public brandService: BrandService,
    private auth: AuthService,
    private projectService: ProjectService,
    private widgetService: WidgetService,
    private translate: TranslateService,
    private logger: LoggerService,
  ) {
    const brand = brandService.getBrand();
    this.company_name = brand['BRAND_NAME'];
    this.companyNameParams = { 'BRAND_NAME': this.company_name };
  }

  ngOnInit(): void {
    this.pendingExternalPrompt = consumePendingWebsitePrompt(this.route.snapshot.queryParams);
    if (this.pendingExternalPrompt) {
      this.logger.log('[ON-BOARDING-WELCOME] External prompt detected — will open Home with vibe coder focus');
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true,
      });
    }

    this.auth.user_bs
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((user) => {
        this.user = user;
        // Website deep-link: create project and go Home (no auto chatbot).
        if (user && this.pendingExternalPrompt && !this.silentStartTriggered) {
          this.silentStartTriggered = true;
          this.startProjectAndGoHome(this.pendingExternalPrompt);
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onGetStarted(): void {
    this.startProjectAndGoHome(this.pendingExternalPrompt);
  }

  /**
   * Create project only (no AI Agent), seed widget labels, navigate to Home
   * with vibe coder focused (and optional prompt prefilled).
   */
  private startProjectAndGoHome(promptForHome: string | null): void {
    if (!this.user) {
      this.startError = this.translate.instant('UserNotAvailableSignInAgain');
      return;
    }

    if (this.isStarting) {
      return;
    }

    this.isStarting = true;
    this.startError = null;

    const projectName = this.resolveProjectName();
    this.logger.log('[ON-BOARDING-WELCOME] Get started — projectName:', projectName);

    this.projectService.createProject(projectName, 'onboarding-welcome')
      .pipe(
        takeUntil(this.unsubscribe$),
        tap((project: Project) => {
          this.logger.log('[ON-BOARDING-WELCOME] Project created', project);
          project['role'] = 'owner';
          this.auth.projectSelected(project, 'onboarding-welcome');
          localStorage.setItem(project._id, JSON.stringify(project));
        }),
      )
      .subscribe({
        next: (project: Project) => {
          this.auth.project_bs.pipe(
            filter((p) => !!(p && p._id === project._id)),
            take(1),
            takeUntil(this.unsubscribe$),
          ).subscribe({
            next: () => {
              this.cloneWidgetDefaultLanguage();
              this.isStarting = false;
              this.router.navigate([`project/${project._id}/home`], {
                state: {
                  [ONBOARDING_FOCUS_VIBE_CODER_STATE]: true,
                  [ONBOARDING_VIBE_CODER_PROMPT_STATE]: promptForHome || null,
                },
              });
            },
            error: (error) => {
              this.logger.error('[ON-BOARDING-WELCOME] project_bs error', error);
              this.isStarting = false;
              this.startError = this.translate.instant('SomethingWentWrongSettingUpProject');
            },
          });
        },
        error: (error) => {
          this.logger.error('[ON-BOARDING-WELCOME] createProject error', error);
          this.isStarting = false;
          this.startError = this.translate.instant('SomethingWentWrongSettingUpProject');
        },
      });
  }

  /**
   * Same as onboarding-content.addWidgetDefaultLanguage():
   * seed project widget labels from the default pack for browser lang (or EN).
   * Fire-and-forget — does not block navigation to Home.
   */
  private cloneWidgetDefaultLanguage(): void {
    const browserLang = this.translate.getBrowserLang();
    const langCode = tranlatedLanguage.includes(browserLang) ? browserLang : 'en';

    this.logger.log('[ON-BOARDING-WELCOME] cloneLabel lang:', langCode);
    this.widgetService.cloneLabel(langCode.toUpperCase()).subscribe({
      next: (res: any) => {
        this.logger.log('[ON-BOARDING-WELCOME] cloneLabel RES', res?.data);
      },
      error: (error) => {
        this.logger.error('[ON-BOARDING-WELCOME] cloneLabel ERROR', error);
      },
    });
  }

  private resolveProjectName(): string {
    const fromEmail = this.setProjectNameFromEmail();
    if (fromEmail) {
      return fromEmail;
    }

    const firstName = (this.user?.firstname || '').trim();
    if (firstName) {
      return firstName;
    }

    const beforeAt = (this.user?.email || '').split('@')[0];
    if (beforeAt) {
      return beforeAt;
    }

    return 'My project';
  }

  private setProjectNameFromEmail(): string | null {
    let projectName = null;
    const email = this.user?.email;
    if (email && email.includes('@')) {
      const emailAfterAt = email.split('@')[1];
      if (!emailDomainWhiteList.includes(emailAfterAt)) {
        if (emailAfterAt.includes('.')) {
          projectName = emailAfterAt.split('.')[0];
        } else {
          projectName = emailAfterAt;
        }
      }
    }
    return projectName;
  }
}
