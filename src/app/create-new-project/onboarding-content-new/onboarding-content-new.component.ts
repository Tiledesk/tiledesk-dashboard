import { Component, HostListener, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from "@angular/common/http";
import { TranslateService } from '@ngx-translate/core';
import { Project } from 'app/models/project-model';
import { WidgetSetUpBaseComponent } from 'app/widget_components/widget-set-up/widget-set-up-base/widget-set-up-base.component';
import { ProjectService } from 'app/services/project.service';
import { BrandService } from 'app/services/brand.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { AuthService } from 'app/core/auth.service';
import { emailDomainWhiteList } from 'app/utils/util';
import { FaqKbService } from 'app/services/faq-kb.service';
import { BotLocalDbService } from 'app/services/bot-local-db.service';
import { DepartmentService } from 'app/services/department.service';
import { FaqService } from 'app/services/faq.service';
import { WidgetService } from 'app/services/widget.service';
import { AppConfigService } from 'app/services/app-config.service';
import { UsersService } from 'app/services/users.service';
import { TYPE_STEP } from '../onboarding-content/onboarding-content.component';
import { OnboardingChatbotSetupService } from 'app/services/onboarding-chatbot-setup.service';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { take } from 'rxjs/operators';

/**
 * Clone of `OnboardingContentComponent` used for cssTheme: 'new' when a project is created.
 *
 * Differences vs legacy:
 * - It assumes the project is already created/selected (reads `projectid` param + AuthService project_bs).
 * - It exits to Knowledge Bases instead of Home.
 */
@Component({
  selector: 'cnp-onboarding-content-new',
  templateUrl: './onboarding-content-new.component.html',
  styleUrls: ['./onboarding-content-new.component.scss']
})
export class OnboardingContentNewComponent extends WidgetSetUpBaseComponent implements OnInit {
  previousUrl: string;
  DISPLAY_SPINNER_SECTION = false;
  CLOSE_BTN_IS_HIDDEN = false;
  DISPLAY_SPINNER = false;

  companyLogo: string;
  companyLogoNoText: string;
  temp_SelectedLangName: string;
  temp_SelectedLangCode: string;
  browser_lang: string;

  activeQuestionNumber: number;
  activeQuestion: any;
  DISABLED_NEXT_BUTTON: boolean = false;
  DISABLED_PREV_BUTTON: boolean = true;
  welcomeMessage: string = "";
  defaultFallback: string = "";

  projects: Project[];
  newProject: any;
  projectName: string;
  projectID: string;
  user: any;
  userFullname: string;

  translateY: string;
  typeStep = TYPE_STEP;
  nameLastStep: TYPE_STEP = null;
  nameMsgStep: TYPE_STEP = null;
  arrayOfSteps: TYPE_STEP[] = [TYPE_STEP.TEMPLATES_INSTALLATION];
  activeTypeStepNumber: number = 0;
  activeCustomStepNumber: number;
  customSteps: any[] = [];
  activeStep: any;

  CREATE_BOT_ERROR: boolean = false;
  botId: string;
  CREATE_FAQ_ERROR: boolean = false;

  segmentIdentifyAttributes: any = {};
  isFirstProject: boolean = false;
  selectedTranslationCode: string;
  selectedTranslationLabel: string;
  displayLogoWithText: boolean = true;
  isMobile: boolean = true;
  updatedProject: any;
  showSpinner: boolean = false;
  public_Key: string;
  isMTT: boolean;
  USER_ROLE: string;
  hasSelectChatBotOrKb: string
  IS_SAFARI: boolean;

  constructor(
    private auth: AuthService,
    private router: Router,
    public location: Location,
    public brandService: BrandService,
    private logger: LoggerService,
    private route: ActivatedRoute,
    public translate: TranslateService,
    private httpClient: HttpClient,
    private projectService: ProjectService,
    private faqService: FaqService,
    private faqKbService: FaqKbService,
    private botLocalDbService: BotLocalDbService,
    private departmentService: DepartmentService,
    private widgetService: WidgetService,
    public appConfigService: AppConfigService,
    private usersService: UsersService,
    private onboardingChatbotSetupService: OnboardingChatbotSetupService,
    private kbService: KnowledgeBaseService,
  ) {
    super(translate);
    const brand = brandService.getBrand();
    this.companyLogo = brand['BASE_LOGO'];
    this.companyLogoNoText = brand['BASE_LOGO_NO_TEXT'];
    this.projectID = this.route.snapshot.params['projectid'];
  }

  /**
   * Component entrypoint.
   * Initializes translations/state and binds to the selected project stream
   * (the project is expected to be created/selected just before navigating here).
   */
  ngOnInit() {
    this.getCurrentTranslation();
    this.initialize();
    this.onInitWindowHeight();
    // this.detectMobile();
    this.getIfIsSafary();

    // Ensure we have the selected project (created just before navigating here)
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.newProject = project;
        this.projectName = project.name;
      }
    });
  }

  /**
   * Sets `IS_SAFARI` flag used by template/layout tweaks.
   */
  getIfIsSafary() {
    this.IS_SAFARI = this.isSafari();
  }

  /**
   * Safari user-agent detection used for CSS/layout fallbacks.
   */
  isSafari(): boolean {
    const ua = navigator.userAgent;
    return /^((?!chrome|android).)*safari/i.test(ua);
  }

  /**
   * Initializes logo rendering based on the current viewport width.
   * This keeps the header compact on very small screens.
   */
  onInitWindowHeight(): any {
    if (window.innerWidth < 371) {
      this.displayLogoWithText = false
    } else {
      this.displayLogoWithText = true
    }
  }

  @HostListener('window:resize', ['$event'])
  /**
   * Keeps header logo responsive on resize.
   */
  onResize(_event: any) {
    if (window.innerWidth < 371) {
      this.displayLogoWithText = false
    } else {
      this.displayLogoWithText = true
    }
  }

  /**
   * Loads i18n strings used by the onboarding experience (welcome/fallback).
   * Falls back silently if keys are missing.
   */
  private getCurrentTranslation() {
    let langDashboard = 'en';
    if (this.translate.currentLang) {
      langDashboard = this.translate.currentLang;
    }
    let jsonWidgetLangURL = 'assets/i18n/' + langDashboard + '.json';
    this.httpClient.get(jsonWidgetLangURL).subscribe(data => {
      try {
        if (data['OnboardPage']) {
          let translations = data['OnboardPage'];
          this.welcomeMessage = translations["WelcomeMessage"];
          this.defaultFallback = translations["DefaultFallback"];
        }
      } catch (err) {
        this.logger.error('error', err);
      }
    });
  }

  /**
   * Derives a suggested project name from the user's email domain.
   * Returns null if no suitable name can be inferred.
   */
  private setProjectName() {
    let projectName = null;
    const email = this.user?.email;
    if (email && email.includes('@')) {
      const emailAfterAt = email.split('@')[1];
      if (!emailDomainWhiteList.includes(emailAfterAt)) {
        if (emailAfterAt.includes('.')) projectName = emailAfterAt.split('.')[0]
        else projectName = emailAfterAt;
      }
    }
    return projectName;
  }

  /**
   * Initializes the wizard state for the new-theme onboarding flow.
   */
  private initialize() {
    this.translateY = 'translateY(0px)';
    this.activeQuestionNumber = 0;
    this.arrayOfSteps = [TYPE_STEP.TEMPLATES_INSTALLATION];
     //TYPE_STEP.SELECT_TEMPLATE_OR_KB,
    this.segmentIdentifyAttributes['onboarding_type'] = 'kb';
    this.hasSelectChatBotOrKb = 'kb';
    this.activeTypeStepNumber = 0;
    this.getLoggedUser();
    this.checkPrevButton();
  }

  /**
   * Subscribes to the authenticated user stream and caches basic user info
   * used in the onboarding flow.
   */
  private getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      if (user) {
        this.user = user;
        this.userFullname = user.displayName ? user.displayName : user.firstname;
      }
    });
  }

  /**
   * Advances to the next step index and updates the step indicator transform.
   */
  private nextNumberStep() {
    this.activeTypeStepNumber++;
    this.translateY = 'translateY(' + (-(this.activeTypeStepNumber + 1) * 20 + 20) + 'px)';
  }

  /**
   * Goes back one step index and updates the step indicator transform.
   */
  private prevNumberStep() {
    this.activeTypeStepNumber--;
    this.translateY = 'translateY(' + (-(this.activeTypeStepNumber + 1) * 20 + 20) + 'px)';
  }

  /**
   * Computes whether the "previous" button must be disabled.
   */
  private checkPrevButton() {
    if (this.activeTypeStepNumber == 0) {
      this.DISABLED_PREV_BUTTON = true;
    } else {
      this.DISABLED_PREV_BUTTON = false
    }
  }

  /**
   * Captures the user selection (KB vs template onboarding) and stores it
   * for analytics/segmentation.
   */
  userSelection(event) {
    this.hasSelectChatBotOrKb = event
    this.segmentIdentifyAttributes['onboarding_type'] = this.hasSelectChatBotOrKb
  }

  /**
   * Template event: proceed from selection step to installation step.
   */
  goToTemplatesInstallation(_event) {
    this.goToNextStep();
  }

  /**
   * Navigates to the previous wizard step.
   */
  goToPrevStep() {
    this.prevNumberStep();
    this.checkPrevButton();
  }

  /**
   * Navigates to the next wizard step.
   */
  goToNextStep() {
    this.nextNumberStep();
    this.checkPrevButton();
  }

  /**
   * Closes the onboarding and returns to the previous page.
   */
  goBack() {
    this.location.back();
  }

  // Exit to Knowledge Bases (new theme requirement)
  /**
   * Final CTA: exits onboarding to Knowledge Bases for the current project.
   * Uses the route param when available, otherwise falls back to the selected project stream.
   */
  goToExitOnboarding() {
    const pid = this.projectID || this.newProject?._id || this.newProject?.id;
    if (pid) {
      this.router.navigate([`project/${pid}/knowledge-bases`]);
    }
  }

  /**
   * Temporary CTA used while `cnp-templates` is disabled.
   * Sets the chatbot name to "pippo" and aligns the KB namespace name accordingly.
   */
  createPippoChatbot() {
    const chatbotName = 'pippo';
    const kbOfficialResponderTag = 'kb-official-responder';

    // 1) resolve project + first namespace
    this.auth.project_bs.pipe(take(1)).subscribe((project: any) => {
      const projectId = project?._id || project?.id;
      if (!projectId) {
        this.logger.error('[ONBOARDING-CONTENT-NEW] createPippoChatbot - missing projectId');
        return;
      }

      this.kbService.getAllNamespaces().pipe(take(1)).subscribe((namespaces: any[]) => {
        const firstNamespace = namespaces?.[0];
        const namespaceId = firstNamespace?.id;
        if (!namespaceId) {
          this.logger.error('[ONBOARDING-CONTENT-NEW] createPippoChatbot - missing namespaceId');
          return;
        }

        // 2) export official responder template to JSON
        this.faqKbService.getTemplates().pipe(take(1)).subscribe((templates: any[]) => {
          const kbOfficialResponderTemplate = templates?.find((t: any) =>
            t?.certifiedTags?.some((tag: any) => tag?.name === kbOfficialResponderTag)
          );
          if (!kbOfficialResponderTemplate?._id) {
            this.logger.error('[ONBOARDING-CONTENT-NEW] createPippoChatbot - kb-official-responder template not found');
            return;
          }

          this.faqKbService.exportChatbotToJSON(kbOfficialResponderTemplate._id).pipe(take(1)).subscribe((chatbotJson: any) => {
            if (!chatbotJson) {
              this.logger.error('[ONBOARDING-CONTENT-NEW] createPippoChatbot - exportChatbotToJSON returned empty payload');
              return;
            }

            // 3) set chatbot name + bind askgpt actions to the namespace
            chatbotJson['name'] = chatbotName;
            if (Array.isArray(chatbotJson?.intents)) {
              chatbotJson.intents.forEach((intent: any) => {
                const actions = intent?.actions;
                if (!Array.isArray(actions)) return;
                actions.forEach((action: any) => {
                  if (action?._tdActionType === 'askgptv2') {
                    action.namespace = namespaceId;
                  }
                });
              });
            }

            // 4) same operations as cnp-templates (import + namespace rename)
            this.onboardingChatbotSetupService.importChatbotAndRenameNamespace({
              chatbotJson,
              chatbotName,
              projectId,
              namespaceId,
            }).subscribe({
              next: ({ faqkb }) => {
                // Mirror cnp-templates flow to get a valid/openable bot.
                this.onboardingChatbotSetupService.publishAndHookToDefaultDeptIfNeeded(faqkb).subscribe({
                  next: () => {
                    this.logger.log('[ONBOARDING-CONTENT-NEW] createPippoChatbot - completed');
                    this.goToExitOnboarding();
                  },
                  error: (err) => {
                    this.logger.error('[ONBOARDING-CONTENT-NEW] createPippoChatbot - publish/hook ERROR', err);
                  }
                });
              },
              error: (err) => {
                this.logger.error('[ONBOARDING-CONTENT-NEW] createPippoChatbot - ERROR', err);
              }
            });
          });
        });
      });
    });
  }

  /**
   * Utility entrypoint for onboarding flows that only need to set the chatbot name.
   * It renames the first KB namespace of the current project (used by KB-based onboarding).
   */
  renameKbNamespaceToMatchChatbotName(chatbotName: string) {
    this.onboardingChatbotSetupService.renameFirstNamespaceForCurrentProject(chatbotName).subscribe({
      next: () => {
        this.logger.log('[ONBOARDING-CONTENT-NEW] Namespace renamed to chatbotName:', chatbotName);
      },
      error: (err) => {
        this.logger.error('[ONBOARDING-CONTENT-NEW] renameKbNamespaceToMatchChatbotName - ERROR', err);
      }
    });
  }
}

