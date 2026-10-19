import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/core/auth.service';
import { Project } from 'app/models/project-model';
import { AppConfigService } from 'app/services/app-config.service';
import { BotLocalDbService } from 'app/services/bot-local-db.service';
import { BrandService } from 'app/services/brand.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { ProjectService } from 'app/services/project.service';
import { MAX_PROMPT_LENGTH, saveAgentPrompt } from 'app/utils/agent-from-prompt.util';
import { consumePendingWebsitePrompt } from 'app/utils/pending-website-prompt.util';
import { emailDomainWhiteList, openChatbotEditor } from 'app/utils/util';
import { Subject } from 'rxjs';
import { filter, map, switchMap, take, takeUntil } from 'rxjs/operators';

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
  /** True when a prompt arrived from the website — vibe coder UI is skipped. */
  skipVibeCoder = false;

  private user: any;
  private pendingExternalPrompt: string | null = null;
  private silentStartTriggered = false;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public brandService: BrandService,
    private auth: AuthService,
    private projectService: ProjectService,
    private faqKbService: FaqKbService,
    private botLocalDbService: BotLocalDbService,
    private appConfigService: AppConfigService,
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
      this.skipVibeCoder = true;
      this.logger.log('[ON-BOARDING-WELCOME] External prompt detected — skipping vibe coder UI');
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
        if (user && this.skipVibeCoder && this.pendingExternalPrompt && !this.silentStartTriggered) {
          this.silentStartTriggered = true;
          this.startWithPrompt(this.pendingExternalPrompt);
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onVibeCoderStart(prompt: string): void {
    this.startWithPrompt(prompt);
  }

  private startWithPrompt(rawPrompt: string): void {
    const prompt = (rawPrompt || '').trim().slice(0, MAX_PROMPT_LENGTH);
    if (!prompt) {
      return;
    }

    if (!this.user) {
      this.startError = 'User not available. Please sign in again.';
      return;
    }

    if (this.isStarting) {
      return;
    }

    this.isStarting = true;
    this.startError = null;

    const projectName = this.resolveProjectName();
    const agentName = `${projectName} AI Agent`;
    const language = this.translate.currentLang || 'en';

    this.logger.log('[ON-BOARDING-WELCOME] Start — projectName:', projectName, 'agentName:', agentName, 'silent:', this.skipVibeCoder);

    // Same sequence as New Flow → AI Agent after a project exists:
    // createChatbotFromScratch → saveAgentPrompt → openChatbotEditor (response as-is).
    this.projectService.createProject(projectName, 'onboarding-welcome')
      .pipe(
        takeUntil(this.unsubscribe$),
        switchMap((project: Project) => {
          this.logger.log('[ON-BOARDING-WELCOME] Project created', project);
          project['role'] = 'owner';
          this.auth.projectSelected(project, 'onboarding-welcome');
          localStorage.setItem(project._id, JSON.stringify(project));

          return this.auth.project_bs.pipe(
            filter((p) => !!(p && p._id === project._id)),
            take(1),
            switchMap(() =>
              this.faqKbService.createChatbotFromScratch(agentName, 'tilebot', 'chatbot', language)
                .pipe(
                  map((faqKb: any) => {
                    this.logger.log('[ON-BOARDING-WELCOME] AI Agent created', faqKb);
                    if (faqKb?._id) {
                      this.botLocalDbService.saveBotsInStorage(faqKb._id, faqKb);
                      saveAgentPrompt({
                        botId: faqKb._id,
                        prompt,
                        language,
                        createdAt: Date.now(),
                      });
                    }
                    return { project, faqKb };
                  })
                )
            )
          );
        })
      )
      .subscribe({
        next: ({ project, faqKb }) => {
          this.isStarting = false;
          if (!faqKb?._id) {
            this.startError = 'Could not create the AI Agent. Please try again.';
            return;
          }
          openChatbotEditor(this.router, faqKb, project._id, this.appConfigService.getConfig());
        },
        error: (error) => {
          this.logger.error('[ON-BOARDING-WELCOME] Start flow error', error);
          this.isStarting = false;
          this.startError = 'Something went wrong while setting up your project. Please try again.';
        }
      });
  }

  /**
   * Same rules as onboarding-content.setProjectName():
   * corporate email domain → use domain label; consumer domains → fallback.
   */
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
