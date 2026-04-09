import { Component, HostListener, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { WidgetSetUpBaseComponent } from 'app/widget_components/widget-set-up/widget-set-up-base/widget-set-up-base.component';
import { BrandService } from 'app/services/brand.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { AuthService } from 'app/core/auth.service';
import { FaqKbService } from 'app/services/faq-kb.service';
// import { HttpClient } from "@angular/common/http"; // unused
// import { Project } from 'app/models/project-model'; // unused
// import { ProjectService } from 'app/services/project.service'; // unused
// import { emailDomainWhiteList } from 'app/utils/util'; // unused
// import { BotLocalDbService } from 'app/services/bot-local-db.service'; // unused
// import { DepartmentService } from 'app/services/department.service'; // unused
// import { FaqService } from 'app/services/faq.service'; // unused
// import { WidgetService } from 'app/services/widget.service'; // unused
// import { AppConfigService } from 'app/services/app-config.service'; // unused
// import { UsersService } from 'app/services/users.service'; // unused
// import { TYPE_STEP } from '../onboarding-content/onboarding-content.component'; // unused
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
  // previousUrl: string;
  DISPLAY_SPINNER_SECTION = false;
  CLOSE_BTN_IS_HIDDEN = false;
  DISPLAY_SPINNER = true;
  showSpinner = false;

  companyLogo: string;
  companyLogoNoText: string;
  // temp_SelectedLangName: string;
  // temp_SelectedLangCode: string;
  // browser_lang: string;

  // activeQuestionNumber: number;
  // activeQuestion: any;
  // DISABLED_NEXT_BUTTON: boolean = false;
  // DISABLED_PREV_BUTTON: boolean = true;
  // welcomeMessage: string = "";
  // defaultFallback: string = "";

  // projects: Project[];
  newProject: any;
  projectName: string;
  projectID: string;
  // user: any;
  // userFullname: string;

  // translateY: string;
  // typeStep = TYPE_STEP;
  // nameLastStep: TYPE_STEP = null;
  // nameMsgStep: TYPE_STEP = null;
  // arrayOfSteps: TYPE_STEP[] = [TYPE_STEP.TEMPLATES_INSTALLATION];
  // activeTypeStepNumber: number = 0;
  // activeCustomStepNumber: number;
  // customSteps: any[] = [];
  // activeStep: any;

  // CREATE_BOT_ERROR: boolean = false;
  // botId: string;
  // CREATE_FAQ_ERROR: boolean = false;

  // segmentIdentifyAttributes: any = {};
  // isFirstProject: boolean = false;
  // selectedTranslationCode: string;
  // selectedTranslationLabel: string;
  displayLogoWithText: boolean = true;
  // isMobile: boolean = true;
  // updatedProject: any;
  // public_Key: string;
  // isMTT: boolean;
  // USER_ROLE: string;
  // hasSelectChatBotOrKb: string
  IS_SAFARI: boolean;
  // private chatbotFlowStarted = false;
  /** When set (non-empty), the overlay shows the error UI. */
  creationErrorMessage: string = '';
  /** Debug flag: force the error UI on load. */
  private simulateErrorUi: boolean = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    public location: Location,
    public brandService: BrandService,
    private logger: LoggerService,
    private route: ActivatedRoute,
    public translate: TranslateService,
    private faqKbService: FaqKbService,
    // private httpClient: HttpClient, // unused
    // private projectService: ProjectService, // unused
    // private faqService: FaqService, // unused
    // private botLocalDbService: BotLocalDbService, // unused
    // private departmentService: DepartmentService, // unused
    // private widgetService: WidgetService, // unused
    // public appConfigService: AppConfigService, // unused
    // private usersService: UsersService, // unused
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
    //this.getCurrentTranslation();
    // this.initialize(); // unused in simplified flow
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

    // Auto-run the onboarding flow (no manual CTA button).
    // Keep the loader visible until the operation completes successfully and we navigate away.

    if (this.simulateErrorUi) {
      this.DISPLAY_SPINNER = false;
      this.creationErrorMessage = 'Errore simulato: creazione non completata. Premi “Riprova”.';
    } else {
      this.createChatbot();
    }
    
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

  /*
   * UNUSED wizard/i18n helpers.
   * Kept (commented) because they belonged to the legacy step-based onboarding.
   *
   * private getCurrentTranslation() { ... }
   * private setProjectName() { ... }
   * private initialize() { ... }
   * private getLoggedUser() { ... }
   * private checkPrevButton() { ... }
   * userSelection(event) { ... }
   * goToTemplatesInstallation(_event) { ... }
   * goToPrevStep() { ... }
   * goToNextStep() { ... }
   */

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
    // if (pid) {
    //   this.router.navigate([`project/${pid}/knowledge-bases`]);
    // }
  }

  /**
   * Temporary CTA used while `cnp-templates` is disabled.
   * Sets the chatbot name to "default" and aligns the KB namespace name accordingly.
   */
  createChatbot() {
    const chatbotName = 'default';
    const kbOfficialResponderTag = 'kb-official-responder';

    // If we were simulating the error UI, disable it on retry.
    this.simulateErrorUi = false;

    // Show onboarding loader until success.
    this.creationErrorMessage = '';
    this.DISPLAY_SPINNER = true;

    // 1) resolve project + first namespace
    this.auth.project_bs.pipe(take(1)).subscribe((project: any) => {
      const projectId = project?._id || project?.id;
      if (!projectId) {
        this.logger.error('[ONBOARDING-CONTENT-NEW] createPippoChatbot - missing projectId');
        this.DISPLAY_SPINNER = false;
        return;
      }

      this.kbService.getAllNamespaces().pipe(take(1)).subscribe((namespaces: any[]) => {
        const firstNamespace = namespaces?.[0];
        const namespaceId = firstNamespace?.id;
        if (!namespaceId) {
          this.logger.error('[ONBOARDING-CONTENT-NEW] createPippoChatbot - missing namespaceId');
          this.DISPLAY_SPINNER = false;
          return;
        }

        // 2) export official responder template to JSON
        this.faqKbService.getTemplates().pipe(take(1)).subscribe((templates: any[]) => {
          const kbOfficialResponderTemplate = templates?.find((t: any) =>
            t?.certifiedTags?.some((tag: any) => tag?.name === kbOfficialResponderTag)
          );
          if (!kbOfficialResponderTemplate?._id) {
            this.logger.error('[ONBOARDING-CONTENT-NEW] createPippoChatbot - kb-official-responder template not found');
            this.DISPLAY_SPINNER = false;
            return;
          }

          this.faqKbService.exportChatbotToJSON(kbOfficialResponderTemplate._id).pipe(take(1)).subscribe((chatbotJson: any) => {
            if (!chatbotJson) {
              this.logger.error('[ONBOARDING-CONTENT-NEW] createPippoChatbot - exportChatbotToJSON returned empty payload');
              this.DISPLAY_SPINNER = false;
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
                     this.DISPLAY_SPINNER = false;
                    this.goToExitOnboarding();
                  },
                  error: (err) => {
                    this.logger.error('[ONBOARDING-CONTENT-NEW] createPippoChatbot - publish/hook ERROR', err);
                    this.DISPLAY_SPINNER = false;
                  }
                });
              },
              error: (err) => {
                this.logger.error('[ONBOARDING-CONTENT-NEW] createPippoChatbot - ERROR', err);
                this.DISPLAY_SPINNER = false;
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

