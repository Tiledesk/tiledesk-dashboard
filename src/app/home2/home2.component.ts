import { AfterViewInit, Component, ElementRef, isDevMode, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { Project } from '../models/project-model';
import { Router } from '@angular/router';
import { UsersService } from '../services/users.service';
import { LocalDbService } from '../services/users-local-db.service';
import { NotifyService } from '../core/notify.service';
import { TranslateService } from '@ngx-translate/core';
import { ProjectPlanService } from '../services/project-plan.service';

import { Subscription } from 'rxjs';
import { Home2ConfigVmService } from './services/home2-config-vm.service';

import moment from "moment";
import { FaqKbService } from '../services/faq-kb.service'; // USED FOR COUNT OF BOTS FOR THE NEW HOME
import { APP_SUMO_PLAN_NAME, PLAN_NAME } from '../utils/util';
import { LoggerService } from '../services/logger/logger.service';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators'
import { ProjectService } from 'app/services/project.service';
import {
  URL_getting_started_for_admins,
  URL_getting_started_for_agents,
  URL_google_tag_manager_add_tiledesk_to_your_sites
} from '../utils/util';

import { AppStoreService } from 'app/services/app-store.service';
 

import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { QuotesService } from 'app/services/quotes.service';
import { RolesService } from 'app/services/roles.service';
import { Home2Facade } from './services/home2.facade';
import { Home2PermissionsVmService } from './services/home2-permissions-vm.service';
import { Home2QuotesVmService } from './services/home2-quotes-vm.service';
import { Home2ProjectAttributesVmService } from './services/home2-project-attributes-vm.service';

const swal = require('sweetalert');
const Swal = require('sweetalert2')

@Component({
  selector: 'home2',
  templateUrl: './home2.component.html',
  styleUrls: ['./home2.component.scss']
})
export class Home2Component implements OnInit, OnDestroy, AfterViewInit {
  PLAN_NAME = PLAN_NAME;
  APP_SUMO_PLAN_NAME = APP_SUMO_PLAN_NAME;
  private unsubscribe$: Subject<any> = new Subject<any>();
  @ViewChild('widgetsContent', { static: false, read: ElementRef }) public widgetsContent;

  @ViewChild('childWhatsappAccount', { static: false, read: ElementRef }) public childWhatsappAccount;
  @ViewChild('childCreateChatbot', { static: false, read: ElementRef }) public childCreateChatbot;
  @ViewChild('editOperatingHoursBtn', { static: false, read: ElementRef }) public editOperatingHoursBtn;



  company_name: string;
  tparams: any;

  user: any;
  project: Project;
  projectId: string;
  projectName: string;

  USER_ROLE: string;
  CHAT_BASE_URL: string;
  browserLang: string;

  prjct_name: string;
  prjct_profile_name: string;
  profile_name: string;
  profile_name_for_segment: string;
  prjct_profile_type: string;
  prjct_trial_expired: boolean;
  subscription_is_active: boolean;
  subscription_end_date: Date;
  showSpinner = true;

  quotasSubscription: Subscription;

  //** FOR THE NEW DASHBOARD **//
  OPERATING_HOURS_ACTIVE: boolean; /// USED TO DISPLAY OPERATING HOURS ENABLED / DISABLED
  countOfLastMonthMsgs: number; /// USED FOR COUNT OF LAST 30 DAYS MSGS FOR THE NEW HOME
  countOfLastMonthRequests: number; // USED FOR COUNT OF LAST 30 DAYS REQUESTS FOR THE NEW HOME 
  countOfLastMonthRequestsHandledByBots: number;
  percentageOfLastMonthRequestsHandledByBots: any;
  // Removed unused header-related fields (kept in git history).
  chatbots: any // TO DISPLAY THE CHATBOT IN THE NEW HOME HEADER
  DISPLAY_TEAMMATES: boolean = false;
  DISPLAY_CHATBOTS: boolean = false;

  public_Key: string;
  isVisibleANA: boolean;
  isVisibleAPP: boolean;
  isVisibleOPH: boolean;
  isVisibleHomeBanner: boolean;
  isVisiblePay: boolean;
  isVisibleKNB: boolean;

  hidechangelogrocket: boolean;
  onlyOwnerCanManageTheAccountPlanMsg: string;
  learnMoreAboutDefaultRoles: string;
  DISPLAY_OPH_AS_DISABLED: boolean;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;
  current_prjct: any;
  popup_visibility: string = 'none';
  appSumoProfile: string;
  project_plan_badge: boolean;
  featureAvailableFromBPlan: string;
  featureAvailableFromEPlan: string;
  appSumoProfilefeatureAvailableFromBPlan: string;
  agentCannotManageAdvancedOptions: string;
  tPlanParams: any;

  // HOME REVOLUTION 
  displayAnalyticsConvsGraph: boolean = false;
  displayAnalyticsIndicators: boolean = false;
  displayConnectWhatsApp: boolean;
  displayKnowledgeBase: boolean;
  displayCreateChatbot: boolean
  displayInviteTeammate: boolean
  displayCustomizeWidget: boolean
  displayNewsFeed: boolean = true
  displayWhatsappAccountWizard = false;

  // Removed unused apps list (kept in git history).
  whatsAppAppId: string;
  installActionType: string;
  appTitle: string;
  appVersion: string;
  upgradePlan: string;
  cancel: string;

  // User preferences after onboarding
  solution: string
  solution_channel: string
  use_case: string;
  use_case_for_child: string = "";
  solution_channel_for_child: string = "";
  solution_for_child: string = "";
  elemHomeMainContentHeight: any;
  dashletsPreferences: any;

  areYouSureMsg: string;
  appWillBeDeletedMsg: string;
  appHasBeenDeletedMsg: string;
  errorWhileDeletingApp: string;
  done_msg: string;


  userHasClickedDisplayWAWizard: boolean = false
  PROJECT_ATTRIBUTES: any
  showskeleton: boolean = true;
  showskeletonForKbHero: boolean = true;
  showsNewsFeedSkeleton: boolean = true;
  custom_company_home_logo: string;
  companyLogoNoText: string;
  displayNewsAndDocumentation: string;
  projectChangedFromList: boolean;
  child_list_order = [
    { pos: 1, type: 'child1' },
    { pos: 2, type: 'child2' },
    { pos: 3, type: 'child3' },
    { pos: 4, type: 'child4' },
    { pos: 5, type: 'child5' },
    { pos: 6, type: 'child6' },
    { pos: 7, type: 'child7' },
    { pos: 8, type: 'child8' }
  ];

  areVisibleChatbot: boolean;
  displayKbHeroSection: boolean;

  // QUOTES
  isVisibleQuoteBtn: boolean;
  isVisibleQuoteSection: boolean;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'determinate';
  requests_count = 0;
  requests_perc = 0;
  requests_limit = 0;

  messages_count = 0;
  messages_perc = 0;
  messages_limit = 0;

  email_count = 0;
  email_perc = 0;
  email_limit = 0;

  tokens_count = 0;
  tokens_perc = 0;
  tokens_limit = 0;

  voice_count = 0;
  voice_perc = 0;
  voice_limit = 0;
  voice_limit_in_sec = 0;
  voice_count_min_sec: any;

  // NOTE: Legacy quotes flow (`getProjectQuotes()`/`getQuotes()`) removed from Home2.
  // Home2 uses `quotesService.quotesData$` via `listenToQuotas()`.
  conversationsRunnedOut: boolean = false;
  emailsRunnedOut: boolean = false;
  tokensRunnedOut: boolean = false;
  voiceRunnedOut: boolean = false;
  diplayVXMLVoiceQuota: boolean;


  displayQuotaSkeleton: boolean;

  salesEmail: string

  /** ISO `slot.endDate` da quotes (via subscription), stesso uso della navbar. */
  quotaResetEndDateLabel: string | null = null;

  // refactoring quotas
  quotasLimits
  allQuotas

  PERMISSION_TO_VIEW_FLOWS: boolean;
  PERMISSION_TO_VIEW_KB: boolean;
  PERMISSION_TO_VIEW_ANALYTICS: boolean;
  PERMISSION_TO_VIEW_WA_BRODCAST: boolean;
  PERMISSION_TO_VIEW_TEAMMATES: boolean;
  PERMISSION_TO_READ_TEAMMATE_DETAILS: boolean;
  PERMISSION_TO_INVITE: boolean;
  PERMISSION_TO_VIEW_HISTORY: boolean;
  PERMISSION_TO_VIEW_OP: boolean;
  PERMISSION_TO_VIEW_WIDGET_SETUP: boolean;
  PERMISSION_TO_VIEW_QUOTA_USAGE: boolean;

  constructor(
    public auth: AuthService,
    private home2Facade: Home2Facade,
    private router: Router,
    private usersService: UsersService,
    private usersLocalDbService: LocalDbService,
    private notify: NotifyService,
    private translate: TranslateService,
    private prjctPlanService: ProjectPlanService,
    private home2ConfigVm: Home2ConfigVmService,
    private home2PermissionsVm: Home2PermissionsVmService,
    private home2QuotesVm: Home2QuotesVmService,
    private home2ProjectAttributesVm: Home2ProjectAttributesVmService,
    private faqKbService: FaqKbService,
    private logger: LoggerService,
    private projectService: ProjectService,
    public appStoreService: AppStoreService,
    public localDbService: LocalDbService,
    private quotesService: QuotesService,
    public rolesService: RolesService
  ) {
    this.home2Facade.brandVm$.pipe(take(1)).subscribe((brandVm) => {
      this.company_name = brandVm.companyName;
      this.custom_company_home_logo = brandVm.customCompanyHomeLogo;
      this.companyLogoNoText = brandVm.companyLogoNoText;
      this.displayNewsAndDocumentation = brandVm.displayNewsAndDocumentation;
      this.tparams = brandVm.tparams;
      this.salesEmail = brandVm.salesEmail;
    });
  }

  ngOnInit() {
    this.getLoggedUser()
    this.getCurrentProjectProjectByIdAndBots();
    this.listenHasChangedProjectFroList()
    // this.getStorageBucket(); // moved in getCurrentProject()
    this.logger.log('[HOME] !!! Hello HomeComponent! ');

    this.getBrowserLanguage();
    this.translateString();

    // get the PROJECT-USER BY CURRENT-PROJECT-ID AND CURRENT-USER-ID
    // IS USED TO DETERMINE IF THE USER IS AVAILABLE OR NOT AVAILABLE
    this.getProjectUser();

    // GET AND SAVE ALL BOTS OF CURRENT PROJECT IN LOCAL STORAGE
    this.usersService.getBotsByProjectIdAndSaveInStorage();

    this.getUserRole();
    // this.getProjectPlan(); 
    // this.getVisitorCounter();
    this.getOSCODE();
    this.checkPromoURL()
    this.getChatUrl();
    this.getHasOpenBlogKey()
    this.diplayPopup();

    // get if user has used Signin with Google
    const hasSigninWithGoogle = this.localDbService.getFromStorage('swg')
    if (hasSigninWithGoogle) {
      this.localDbService.removeFromStorage('swg')
      // this.logger.log('[SIGN-UP] removeFromStorage swg')
    }

    this.listenToQuotas()
    this.listenToProjectUser()
  }

  ngAfterViewInit() {
    if (!isDevMode()) {
      if (window['analytics']) {
        try {
          window['analytics'].page("Home Page, Home", {});
        } catch (err) {
          // this.logger.error('page Home error', err);
        }
      }
    }
  }

  ngOnDestroy() {
    this.logger.log('[QUOTA-DEBUG][HOME COMP] - CALLING ON DESTROY')
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    if (this.quotasSubscription) {
      this.quotasSubscription.unsubscribe();
    }
  }

  listenToProjectUser() {
    this.home2PermissionsVm.permissions$(this.unsubscribe$)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((vm) => {
        this.PERMISSION_TO_VIEW_QUOTA_USAGE = vm.PERMISSION_TO_VIEW_QUOTA_USAGE;
        this.PERMISSION_TO_VIEW_OP = vm.PERMISSION_TO_VIEW_OP;
        this.PERMISSION_TO_VIEW_WIDGET_SETUP = vm.PERMISSION_TO_VIEW_WIDGET_SETUP;
        this.PERMISSION_TO_VIEW_FLOWS = vm.PERMISSION_TO_VIEW_FLOWS;
        this.PERMISSION_TO_VIEW_KB = vm.PERMISSION_TO_VIEW_KB;
        this.PERMISSION_TO_VIEW_ANALYTICS = vm.PERMISSION_TO_VIEW_ANALYTICS;
        this.PERMISSION_TO_VIEW_WA_BRODCAST = vm.PERMISSION_TO_VIEW_WA_BRODCAST;
        this.PERMISSION_TO_VIEW_TEAMMATES = vm.PERMISSION_TO_VIEW_TEAMMATES;
        this.PERMISSION_TO_READ_TEAMMATE_DETAILS = vm.PERMISSION_TO_READ_TEAMMATE_DETAILS;
        this.PERMISSION_TO_INVITE = vm.PERMISSION_TO_INVITE;
      });
  }

  listenHasChangedProjectFroList() {
    this.auth.hasChangedProjectFroList$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((projectChangedFromList) => {
        this.logger.log('[HOME][HAS CHANGED PROJECT FROM LIST]: ', projectChangedFromList)
        this.projectChangedFromList = projectChangedFromList
      })
  }

  getCurrentProjectProjectByIdAndBots() {
    this.home2Facade.projectVm$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((vm) => {
        this.logger.log('[HOME] $UBSCIBE TO PUBLISHED PROJECT - RES  --> ', vm?.project)

        if (vm?.project) {

          this.project = vm.project
          this.projectId = vm.projectId;
          this.projectName = vm.projectName

          if (this.projectId) {
            this.displayQuotaSkeleton = true

            this.logger.log("[QUOTA-DEBUG][HOME][DISPLAY-SKELETON] listenToQuotas displayQuotaSkeleton 1:", this.displayQuotaSkeleton);
            // ----------------------------------------
            // Notify Navbar to fetch quotas
            // ----------------------------------------
            this.quotesService.requestQuotasUpdate();
          }

          this.prjct_name = vm.projectName

          const hasEmittedTrialEnded = localStorage.getItem('dshbrd----' + this.project._id)
          this.logger.log('[HOME] - getCurrentProjectAndInit  hasEmittedTrialEnded ', hasEmittedTrialEnded, '  for project id', this.project._id)

          this.OPERATING_HOURS_ACTIVE = vm.operatingHoursActive
          this.logger.log('[HOME] - getCurrentProjectAndInit OPERATING_HOURS_ACTIVE', this.OPERATING_HOURS_ACTIVE)

          // this.findCurrentProjectAmongAll(this.projectId)
          this.getProjectById(this.projectId);
          this.getProjectBots();
          // this.init()
        }
      }, (error) => {
        this.logger.error('[HOME] $UBSCIBE TO PUBLISHED PROJECT - ERROR ', error);

      }, () => {
        this.logger.log('[HOME] $UBSCIBE TO PUBLISHED PROJECT * COMPLETE *');
      });
  }



  goToCreateChatbot() {
    this.logger.log('[HOME] GO TO CONNECT WA childCreateChatbot', this.childCreateChatbot);
    // this.scrollToChild(this.childCreateChatbot)
    this.router.navigate(['project/' + this.projectId + '/bots/my-chatbots/all']);
  }


  listenToQuotas() {
    this.logger.log("[QUOTA-DEBUG][HOME] LISTEN TO QUOTAS HAS BEEN CALLED 1 projectId ------------> ", this.projectId);
    this.logger.log("[QUOTA-DEBUG][HOME] LISTEN TO QUOTAS HAS BEEN CALLED 1 projectChangedFromList :", this.projectChangedFromList);
    this.quotasSubscription = this.quotesService.quotesData$
      .subscribe((data) => {
        const vm = this.home2QuotesVm.mapQuotesDataToVm(data, this.projectId, this.diplayVXMLVoiceQuota);
        if (!vm) return;

        this.quotasLimits = vm.quotasLimits;
        this.allQuotas = vm.allQuotas;
        this.quotaResetEndDateLabel = vm.quotaResetEndDateLabel;

        this.messages_limit = vm.messages_limit;
        this.requests_limit = vm.requests_limit;
        this.email_limit = vm.email_limit;
        this.tokens_limit = vm.tokens_limit;
        this.voice_limit_in_sec = vm.voice_limit_in_sec;
        this.voice_limit = vm.voice_limit;

        this.requests_count = vm.requests_count;
        this.messages_count = vm.messages_count;
        this.email_count = vm.email_count;
        this.tokens_count = vm.tokens_count;
        this.voice_count = vm.voice_count;
        this.voice_count_min_sec = vm.voice_count_min_sec;

        this.requests_perc = vm.requests_perc;
        this.messages_perc = vm.messages_perc;
        this.email_perc = vm.email_perc;
        this.tokens_perc = vm.tokens_perc;
        this.voice_perc = vm.voice_perc;

        this.conversationsRunnedOut = vm.conversationsRunnedOut;
        this.emailsRunnedOut = vm.emailsRunnedOut;
        this.tokensRunnedOut = vm.tokensRunnedOut;
        this.voiceRunnedOut = vm.voiceRunnedOut;

        this.displayQuotaSkeleton = false;
      },
        (error) => {
          // Handle error
          this.displayQuotaSkeleton = false
        },
        () => {
          // This complete callback will be called if/when the observable completes
          this.logger.log('[QUOTA-DEBUG][HOME] Subscription completed');
        }
      )
  }

  contacUsViaEmail() {
    window.open(`mailto:${this.salesEmail}?subject=Resource increase request for project ${this.projectName} (${this.projectId}) &body=Dear Sales team, some of my monthly resource quota reached his limit for this month, I need some help!`);
  }

  contacUsViaEmailToUpdadePaymentInformation() {
    window.open(`mailto:${this.salesEmail}?subject=Update payment information for project ${this.projectName} (${this.projectId})`);
  }

  getProjectById(projectId) {
    this.projectService.getProjectById(projectId).subscribe((project: any) => {
      this.logger.log('[HOME] - GET PROJECT BY ID - PROJECT: ', project);
      if (project) {
        this.project = project
        this.PROJECT_ATTRIBUTES = project.attributes;

        const attrsVm = this.home2ProjectAttributesVm.getVm(this.PROJECT_ATTRIBUTES);

        if (attrsVm.dashlets) {
          this.displayAnalyticsConvsGraph = attrsVm.dashlets.displayAnalyticsConvsGraph;
          this.displayAnalyticsIndicators = attrsVm.dashlets.displayAnalyticsIndicators;
          this.displayConnectWhatsApp = attrsVm.dashlets.displayConnectWhatsApp;
          this.displayCreateChatbot = attrsVm.dashlets.displayCreateChatbot;
          this.displayKnowledgeBase = attrsVm.dashlets.displayKnowledgeBase;
          this.displayInviteTeammate = attrsVm.dashlets.displayInviteTeammate;
          this.displayCustomizeWidget = attrsVm.dashlets.displayCustomizeWidget;
          this.displayNewsFeed = attrsVm.dashlets.displayNewsFeed;
        }

        if (attrsVm.onboarding) {
          this.displayKbHeroSection = attrsVm.onboarding.displayKbHeroSection;
          this.solution = attrsVm.onboarding.solution;
          this.solution_channel = attrsVm.onboarding.solution_channel;
          this.use_case = attrsVm.onboarding.use_case;

          this.solution_for_child = this.solution;
          this.solution_channel_for_child = this.solution_channel;
          this.use_case_for_child = this.use_case;

          this.child_list_order = attrsVm.onboarding.child_list_order;
          this.displayWhatsappAccountWizard = attrsVm.onboarding.displayWhatsappAccountWizard;

          // onboarding maps also these visibility flags (same names as component fields)
          this.displayConnectWhatsApp = attrsVm.onboarding.displayConnectWhatsApp;
          this.displayCreateChatbot = attrsVm.onboarding.displayCreateChatbot;
          this.displayInviteTeammate = attrsVm.onboarding.displayInviteTeammate;
          this.displayCustomizeWidget = attrsVm.onboarding.displayCustomizeWidget;
          this.displayKnowledgeBase = attrsVm.onboarding.displayKnowledgeBase;

          // Keep legacy behavior for the detailed rules (no regressions).
          this.getOnbordingPreferences(this.PROJECT_ATTRIBUTES);
        } else {
          this.logger.log('[HOME] USECASE  PROJECT_ATTRIBUTES > USER PREFERENCES UNDEFINED - SET DEFAULT', this.PROJECT_ATTRIBUTES)
          this.setDefaultPreferences()
        }



        const projectProfileData = project.profile

        this.manageChatbotVisibility(projectProfileData)
        this.manageVoiceQuotaVisibility(projectProfileData)

        this.logger.log('[HOME] - (getProjectById) - projectProfileData', projectProfileData)

        this.prjct_name = project.name
        this.logger.log('[HOME] - (getProjectById) - prjct_name', this.prjct_name)

        this.prjct_profile_name = projectProfileData.name;
        this.logger.log('[HOME] - (getProjectById) CURRENT PROJECT - Profile name (prjct_profile_name)', this.prjct_profile_name)

        this.profile_name = projectProfileData.name;
        this.logger.log('[HOME] - (getProjectById) CURRENT PROJECT - Profile name (profile_name)', this.profile_name)

        this.prjct_trial_expired = project.trialExpired;
        this.logger.log('[HOME] - (getProjectById) CURRENT PROJECT - TRIAL EXIPIRED', this.prjct_trial_expired)

        this.prjct_profile_type = projectProfileData.type;
        this.logger.log('[HOME] - (getProjectById) CURRENT PROJECT - PROFILE TYPE', this.prjct_profile_type)

        this.subscription_is_active = project.isActiveSubscription;
        this.logger.log('[HOME] - (getProjectById) CURRENT PROJECT - SUB IS ACTIVE', this.subscription_is_active)

        this.subscription_end_date = projectProfileData.subEnd;
        this.logger.log('[HOME] - (getProjectById) CURRENT PROJECT - SUB END DATE', this.subscription_end_date)

        if (projectProfileData && projectProfileData.extra3) {
          this.logger.log('[HOME] (getProjectById) extra3 ', projectProfileData.extra3)

          this.appSumoProfile = APP_SUMO_PLAN_NAME[projectProfileData.extra3];
          this.appSumoProfilefeatureAvailableFromBPlan = APP_SUMO_PLAN_NAME['tiledesk_tier3']
          this.logger.log('[HOME] (getProjectById) appSumoProfile ', this.appSumoProfile)
          this.tPlanParams = { 'plan_name': this.appSumoProfilefeatureAvailableFromBPlan }
        } else if (!projectProfileData.extra3) {
          this.tPlanParams = { 'plan_name': PLAN_NAME.B }
        }

        if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false || this.prjct_profile_type === 'free' && this.prjct_trial_expired === true) {
          this.DISPLAY_OPH_AS_DISABLED = true;
        } else {
          this.DISPLAY_OPH_AS_DISABLED = false;
        }


        this.buildProjectProfileName()


        const projectCreatedAt = project.createdAt
        this.logger.log('[HOME] - getProjectById CreatedAt', projectCreatedAt)
        const trialStarDate = moment(new Date(projectCreatedAt)).format("YYYY-MM-DD hh:mm:ss")
        this.logger.log('[HOME] - getProjectById trialStarDate', trialStarDate)

        const trialEndDate = moment(new Date(projectCreatedAt)).add(14, 'days').format("YYYY-MM-DD hh:mm:ss")
        this.logger.log('[HOME] - getProjectById trialEndDate', trialEndDate)

        const currentTime = moment();

        const daysDiffNowFromProjctCreated = currentTime.diff(projectCreatedAt, 'd');
        this.logger.log('[HOME] - getProjectById daysDiffNowFromProjctCreated', daysDiffNowFromProjctCreated)

        const hasEmittedTrialEnded = localStorage.getItem('dshbrd----' + project._id)
        this.logger.log('[HOME] - getProjectById hasEmittedTrialEnded  ', hasEmittedTrialEnded, '  for project id', project._id)
        this.logger.log('[HOME] - getProjectById - current_prjct - prjct_profile_type 2', this.prjct_profile_type);

        if ((this.prjct_trial_expired === true && hasEmittedTrialEnded === null) || (this.prjct_profile_type === 'payment' && hasEmittedTrialEnded === null)) {
          this.logger.log('[HOME] - getProjectById - Emitting TRIAL ENDED profile_name_for_segment', this.profile_name_for_segment)

          localStorage.setItem('dshbrd----' + project._id, 'hasEmittedTrialEnded')

          this.trackTrialEnded(project, trialStarDate, trialEndDate)

        }

        this.trackGroup(projectProfileData)
      }
    }, error => {
      this.logger.error('[HOME] - GET PROJECT BY ID - ERROR ', error);
    }, () => {
      this.logger.log('[HOME] - GET PROJECT BY ID * COMPLETE *  this.project ', this.project);



    });
  }

  buildProjectProfileName() {
    if (this.prjct_profile_type === 'free') {
      if (this.prjct_trial_expired === false) {

        if (this.profile_name === 'free') {
          this.prjct_profile_name = PLAN_NAME.B + " (trial)"
          this.profile_name_for_segment = this.prjct_profile_name;
          this.auth.projectProfile(this.profile_name_for_segment)
        } else if (this.profile_name === 'Sandbox') {

          // --------------------------------------------------
          // New pricing
          // --------------------------------------------------
          this.prjct_profile_name = PLAN_NAME.E + " (trial)"
          this.profile_name_for_segment = this.prjct_profile_name;
          this.auth.projectProfile(this.profile_name_for_segment)
        }

        this.project['plan_badge_background_type'] = 'b_plan_badge'

      } else {

        if (this.profile_name === 'free') {
          this.prjct_profile_name = "Free plan";
          this.profile_name_for_segment = this.prjct_profile_name
          this.auth.projectProfile(this.profile_name_for_segment)
          this.project['plan_badge_background_type'] = 'free_plan_badge'

        } else if (this.profile_name === 'Sandbox') {
          this.prjct_profile_name = "Sandbox plan";
          this.profile_name_for_segment = this.prjct_profile_name
          this.auth.projectProfile(this.profile_name_for_segment)
          this.project['plan_badge_background_type'] = 'free_plan_badge'
        }
      }
    } else if (this.prjct_profile_type === 'payment') {

      // Growth plan
      if (this.prjct_profile_name === PLAN_NAME.A) {
        if (!this.appSumoProfile) {
          this.prjct_profile_name = PLAN_NAME.A + ' plan'
          this.profile_name_for_segment = this.prjct_profile_name
          this.auth.projectProfile(this.profile_name_for_segment)
        } else {
          this.prjct_profile_name = PLAN_NAME.A + ' plan ' + '(' + this.appSumoProfile + ')'
          this.profile_name_for_segment = this.prjct_profile_name;
          this.auth.projectProfile(this.profile_name_for_segment)
        }
        this.project['plan_badge_background_type'] = 'a_plan_badge'

        // Scale plan
      } else if (this.prjct_profile_name === PLAN_NAME.B) {
        if (!this.appSumoProfile) {
          this.prjct_profile_name = PLAN_NAME.B + ' plan'
          this.profile_name_for_segment = this.prjct_profile_name
          this.auth.projectProfile(this.profile_name_for_segment)
        } else {
          this.prjct_profile_name = PLAN_NAME.B + ' plan ' + '(' + this.appSumoProfile + ')'
          this.profile_name_for_segment = this.prjct_profile_name
          this.auth.projectProfile(this.profile_name_for_segment)
        }
        this.project['plan_badge_background_type'] = 'b_plan_badge'

        // Plus plan
      } else if (this.prjct_profile_name === PLAN_NAME.C) {
        this.prjct_profile_name = PLAN_NAME.C + ' plan'
        this.profile_name_for_segment = this.prjct_profile_name;
        this.auth.projectProfile(this.profile_name_for_segment)
        this.project['plan_badge_background_type'] = 'c_plan_badge'

        // Basic plan
      } else if (this.prjct_profile_name === PLAN_NAME.D || this.prjct_profile_name === "Basic") {
        this.prjct_profile_name = PLAN_NAME.D + ' plan'
        this.profile_name_for_segment = this.prjct_profile_name;
        this.auth.projectProfile(this.profile_name_for_segment)
        this.project['plan_badge_background_type'] = 'a_plan_badge'

        // Premium plan
      } else if (this.prjct_profile_name === PLAN_NAME.E || this.prjct_profile_name === "Premium") {
        this.prjct_profile_name = PLAN_NAME.E + ' plan'
        this.profile_name_for_segment = this.prjct_profile_name
        this.auth.projectProfile(this.profile_name_for_segment)
        this.project['plan_badge_background_type'] = 'b_plan_badge'

      } else if (this.prjct_profile_name === PLAN_NAME.EE || this.prjct_profile_name === "Team") {
        this.prjct_profile_name = PLAN_NAME.EE + ' plan'
        this.profile_name_for_segment = this.prjct_profile_name
        this.auth.projectProfile(this.profile_name_for_segment)
        this.project['plan_badge_background_type'] = 'bb_plan_badge'

        // Custom plan
      } else if (this.prjct_profile_name === PLAN_NAME.F) {
        this.prjct_profile_name = PLAN_NAME.F + ' plan'
        this.profile_name_for_segment = this.prjct_profile_name
        this.auth.projectProfile(this.profile_name_for_segment)
        this.project['plan_badge_background_type'] = 'c_plan_badge'

      } else if (
        this.prjct_profile_name !== PLAN_NAME.A &&
        this.prjct_profile_name !== PLAN_NAME.B &&
        this.prjct_profile_name !== PLAN_NAME.C &&
        this.prjct_profile_name !== PLAN_NAME.D &&
        this.prjct_profile_name !== PLAN_NAME.E &&
        this.prjct_profile_name !== PLAN_NAME.EE &&
        this.prjct_profile_name !== PLAN_NAME.F
      ) {
        this.prjct_profile_name = this.prjct_profile_name + ' plan (UNSUPPORTED)'
        this.project['plan_badge_background_type'] = 'unsupported_plan_badge'
      }
    }

  }

  manageChatbotVisibility(projectProfileData) {
    this.logger.log('[HOME] (manageChatbotVisibility) ')

    if (projectProfileData['customization']) {
      this.logger.log('[HOME] (manageChatbotVisibility) USECASE EXIST customization > chatbot (1)', projectProfileData['customization']['chatbot'])
    }

    if (projectProfileData['customization'] && projectProfileData['customization']['chatbot'] !== undefined) {
      this.logger.log('[HOME] (manageChatbotVisibility) USECASE A EXIST customization ', projectProfileData['customization'], ' & chatbot', projectProfileData['customization']['chatbot'])

      if (projectProfileData['customization']['chatbot'] === true) {
        this.areVisibleChatbot = true;
        this.logger.log('[HOME] (manageChatbotVisibility) USECASE A areVisibleChatbot', this.areVisibleChatbot)
      } else if (projectProfileData['customization']['chatbot'] === false) {

        this.areVisibleChatbot = false;
        this.logger.log('[HOME] (manageChatbotVisibility) USECASE A areVisibleChatbot', this.areVisibleChatbot)
      }

    } else if (projectProfileData['customization'] && projectProfileData['customization']['chatbot'] === undefined) {
      this.logger.log('[HOME] (manageChatbotVisibility) USECASE B EXIST customization ', projectProfileData['customization'], ' BUT chatbot IS', projectProfileData['customization']['chatbot'])
      this.areVisibleChatbot = true;
      this.logger.log('[HOME] (manageChatbotVisibility) USECASE B areVisibleChatbot', this.areVisibleChatbot)

    } else if (projectProfileData['customization'] === undefined) {
      this.logger.log('[HOME] (manageChatbotVisibility) USECASE C customization is  ', projectProfileData['customization'])
      this.areVisibleChatbot = true;
      this.logger.log('[HOME] (manageChatbotVisibility) USECASE C areVisibleChatbot', this.areVisibleChatbot)

    }
  }

  

  manageVoiceQuotaVisibility(projectProfileData) {
    if (projectProfileData['customization']) {
      this.logger.log('[HOME] (manageVoiceQuotaVisibility) projectProfileData[customization] ', projectProfileData['customization'])
    
      if (projectProfileData['customization'] && ((projectProfileData['customization']['voice'] !== undefined))) {

        this.logger.log('[HOME] (manageVoiceQuotaVisibility) projectProfileData[customization] voice', projectProfileData['customization']['voice'])
     

        if (projectProfileData['customization']['voice'] === true) {
          this.diplayVXMLVoiceQuota = true
        } else if (projectProfileData['customization']['voice'] === false) {
          this.diplayVXMLVoiceQuota = false
        } else if (projectProfileData['customization']['voice'] === undefined) {
          this.diplayVXMLVoiceQuota = false
        }
      } else {
        this.logger.log('[HOME] (manageVoiceQuotaVisibility) projectProfileData[customization][voice] ', projectProfileData['customization']['voice'])
        this.diplayVXMLVoiceQuota = false
      }

    } else {

      this.logger.log('[HOME] (manageVoiceQuotaVisibility) projectProfileData[customization] (else) ', projectProfileData['customization'])
      // this.diplayTwilioVoiceQuota = false
      this.diplayVXMLVoiceQuota = false
    }

  }


  trackTrialEnded(project, trialStarDate, trialEndDate) {
    if (!isDevMode()) {
      setTimeout(() => {
        if (window['analytics']) {
          this.logger.log('[HOME] - Find Current Project Among All - Emitting TRIAL ENDED profile_name_for_segment', this.profile_name_for_segment)
          try {
            window['analytics'].track('Trial Ended', {
              "userId": this.user._id,
              "trial_start_date": trialStarDate,
              "trial_end_date": trialEndDate,
              "trial_plan_name": this.profile_name_for_segment,
            }, {
              "context": {
                "groupId": project._id
              }
            });
            // this.updatedProjectTrialEndedEmitted(true)
            // localStorage.setItem('dshbrd----' + this.current_prjct.id_project._id, 'hasEmittedTrialEnded')
          } catch (err) {
            // this.logger.error('track Trial Started event error', err);
          }


        } else {
          this.logger.log('track Trial Started window[analytics]', window['analytics']);
        }
      }, 100);
    }

  }

  trackGroup(projectProfileData) {
    if (!isDevMode()) {
      this.logger.log('here yes - group isDevMode', isDevMode())
      setTimeout(() => {
        if (window['analytics']) {
          try {
            window['analytics'].group(projectProfileData._id, {
              name: this.prjct_name,
              plan: this.profile_name_for_segment,
            });
          } catch (err) {
            // this.logger.error('group Home error', err);
          }
        }
      }, 100);
      // else {
      //   this.logger.error('group Home window[analytics]', window['analytics']);
      // }
    }
  }

  // dismissKbSkeleton(event) {
  //   this.logger.log('[HOME] - dismissKbSkeleton event', event);
  //   // if (event === true ) {
  //   // if(this.displayKbHeroSection) { 
  //   //   this.showskeleton = false
  //   // }
  // }

  getProjectBots() {
    this.faqKbService.getFaqKbByProjectId().subscribe((faqKb: any) => {
      this.chatbots = faqKb
      this.logger.log('[HOME] - GET FAQKB * chatbots *', this.chatbots);

    }, (error) => {
      this.logger.error('[HOME] - GET FAQKB - ERROR ', error);
      // if(!this.displayKbHeroSection) {
      this.showskeleton = false;
      // } else {
      //   setTimeout(() => {
      //     this.showskeleton = false;
      //     this.logger.log('[HOME] - GET FAQKB - showskeleton ', this.showskeleton);
      //   }, 500);
      // }

      this.delayNewsFeedSkeleton()


    }, () => {
      this.logger.log('[HOME] - GET FAQKB * COMPLETE *');
      // if(!this.displayKbHeroSection) {
      this.showskeleton = false;
      // } else {
      //   setTimeout(() => {

      //     this.showskeleton = false;
      //     this.logger.log('[HOME] - GET FAQKB COMPLETE - showskeleton ', this.showskeleton);
      //   }, 3000);
      // }
      this.delayNewsFeedSkeleton()

    });
  }

  delayNewsFeedSkeleton() {
    setTimeout(() => {
      this.showsNewsFeedSkeleton = false;
      // this.logger.log('[HOME] - skeleton showskeleton ', this.showskeleton );
    }, 500);
  }



  // hasFinishedGetProjectBots() {
  //   // this.showskeleton = false;
  //   this.logger.log('[HOME] - skeleton hasFinishedGetProjectBots in home-cds ');
  // }

  operatingHoursPopoverClosed() {
    this.logger.log('[HOME] - operatingHoursPopoverClosed');
    // const editOperatingHoursBtnEl = <HTMLElement>document.querySelector('#adjust-operating-hours-btn');
    this.logger.log('[HOME] - operatingHoursPopoverClosed editOperatingHoursBtn', this.editOperatingHoursBtn);
    this.editOperatingHoursBtn.nativeElement.blur();
  }

  getDashlet(project_attributes) {
    // this.logger.log('[HOME] - (onInit) - DASHLETS PREFERENCES project_attributes ', project_attributes);
    if (project_attributes && project_attributes.dashlets) {
      this.logger.log('[HOME] - (onInit) ----> DASHLETS PREFERENCES ', project_attributes.dashlets);
      const dashlets = project_attributes.dashlets;

      this.displayAnalyticsConvsGraph = dashlets.convsGraph
      this.displayAnalyticsIndicators = dashlets.analyticsIndicators
      this.displayConnectWhatsApp = dashlets.connectWhatsApp
      this.displayCreateChatbot = dashlets.createChatbot
      this.displayKnowledgeBase = dashlets.knowledgeBase
      this.displayInviteTeammate = dashlets.inviteTeammate
      this.displayCustomizeWidget = dashlets.customizeWidget
      this.displayNewsFeed = dashlets.newsFeed
    }
  }

  async setDefaultPreferences() {
    this.child_list_order = [
      { pos: 1, type: 'child1' },
      { pos: 2, type: 'child2' },
      { pos: 3, type: 'child5' },
      { pos: 4, type: 'child7' },
      { pos: 5, type: 'child6' },
      { pos: 6, type: 'child8' },
      { pos: 7, type: 'child3' },
      { pos: 8, type: 'child4' }
    ]

    // this.displayAnalyticsConvsGraph = false;
    // await this.switchAnalyticsConvsGraph(this.displayAnalyticsConvsGraph);

    // this.displayAnalyticsIndicators = false;
    // await this.switchAnalyticsIndicators(this.displayAnalyticsIndicators);

    this.displayWhatsappAccountWizard = false;
    this.displayConnectWhatsApp = false;
    // await this.switchConnectWhatsApp(this.displayConnectWhatsApp);

    this.displayCreateChatbot = true;
    // await this.switchCreateChatbot(this.displayCreateChatbot)

    this.displayInviteTeammate = true;
    // await this.switchInviteTeammate(this.displayInviteTeammate)

    this.displayCustomizeWidget = false;
    // await this.switchCustomizeWidget(this.displayCustomizeWidget);

    this.displayKnowledgeBase = true;
    // await this.switchyKnowledgeBase(this.displayKnowledgeBase);
  }




  trackUserAction(event) {
    let userFullname = ''
    if (this.user.firstname && this.user.lastname) {
      userFullname = this.user.firstname + ' ' + this.user.lastname
    } else if (this.user.firstname && !this.user.lastname) {
      userFullname = this.user.firstname
    }
    this.logger.log('[HOME] - trackUserAction ', event);
    const userAction = event.action
    const userActionRes = event.actionRes
    this.logger.log('[HOME] - trackUserAction userAction', userAction);
    this.logger.log('[HOME] - trackUserAction userActionRes', userActionRes);
    const trackObjct = {
      "type": "organic",
      "username": userFullname,
      "email": this.user.email,
      'userId': this.user._id,
      'page': 'Home'
    }

    // Created chatbot
    if (userAction === 'Create chatbot' && userActionRes !== null) {
      trackObjct['chatbotName'] = userActionRes.name
      trackObjct['chatbotId'] = userActionRes._id
      trackObjct['button'] = "Start from scratch"
    }
    // Install App 
    if (userAction === 'Install app') {
      trackObjct['appTitle'] = "WhatsApp Business"
      trackObjct['appID'] = this.whatsAppAppId
      trackObjct['button'] = "Automatic installation"
    }
    if (userAction === 'Uninstall app') {
      trackObjct['appTitle'] = "WhatsApp Business"
      trackObjct['appID'] = this.whatsAppAppId
      trackObjct['button'] = "Uninstall"
    }
    if (userAction === 'Connect app') {
      trackObjct['appTitle'] = "WhatsApp Business"
      trackObjct['appID'] = this.whatsAppAppId
      trackObjct['button'] = "Connect"
    }

    if (userAction === 'Explore Templates' && userActionRes !== null) {
      trackObjct['category'] = userActionRes
    }

    if (userAction === 'Customize widget' && userActionRes === null) {
      trackObjct['button'] = 'Customize'
    }



    this.logger.log('[HOME] - trackUserAction trackObjct', trackObjct);
    if (!isDevMode()) {
      try {
        window['analytics'].track(userAction, trackObjct);
      } catch (err) {
        // this.logger.error(`Track ${userAction} error`, err);
      }

      try {
        window['analytics'].identify(this.user._id, {
          username: userFullname,
          email: this.user.email,
          logins: 5,

        });
      } catch (err) {
        // this.logger.error(`Identify ${userAction} error`, err);
      }

      try {
        window['analytics'].group(this.projectId, {
          name: this.project.name,
          plan: this.prjct_profile_name,

        });
      } catch (err) {
        // this.logger.error(`Group ${userAction} error`, err);
      }
    }
  }


  async getOnbordingPreferences(project_attributes) {

    this.logger.log('[HOME][x][HOME-CDS] - getOnbordingPreferences PROJECT ATTRIBUTES ', project_attributes);
    this.logger.log('[HOME][x][HOME-CDS] - getOnbordingPreferences PROJECT ATTRIBUTES > USER PREFERENCE', project_attributes.userPreferences);
    // if (this.current_prjct &&
    //   this.current_prjct.id_project &&
    //   this.current_prjct.id_project.attributes &&
    //   this.current_prjct.id_project.attributes.userPreferences) {

    if (project_attributes && project_attributes.userPreferences.onboarding_type) {
      if (project_attributes.userPreferences.onboarding_type === "kb") {
        this.displayKbHeroSection = true
      } else {
        this.displayKbHeroSection = false
      }
      this.logger.log('[HOME][x][HOME-CDS] - getOnbordingPreferences PREFERENCES ---> displayKbHeroSection', this.displayKbHeroSection);
    } else {
      this.displayKbHeroSection = false
    }

    this.solution = project_attributes.userPreferences.solution
    this.solution_channel = project_attributes.userPreferences.solution_channel
    this.use_case = project_attributes.userPreferences.use_case

    this.logger.log('[HOME] - USER PREFERENCES getOnbordingPreferences solution_channel', this.solution_channel);
    this.logger.log('[HOME] - USER PREFERENCES getOnbordingPreferences use_case', this.use_case);
    this.logger.log('[HOME] - USER PREFERENCES getOnbordingPreferences solution', this.solution);

    this.solution_for_child = this.solution;
    this.solution_channel_for_child = this.solution_channel;
    this.use_case_for_child = this.use_case;

    if (this.solution === undefined && this.solution_channel === undefined && this.use_case === undefined) {
      this.logger.log('[HOME] - USECASE USER PREFERENCES getOnbordingPreferences solution', this.solution, 'solution_channel ', this.solution_channel, ' use_case ', this.use_case);

      this.child_list_order = [
        { pos: 1, type: 'child1' },
        { pos: 2, type: 'child2' },
        { pos: 3, type: 'child5' },
        { pos: 4, type: 'child7' },
        { pos: 5, type: 'child6' },
        { pos: 6, type: 'child8' },
        { pos: 7, type: 'child3' },
        { pos: 8, type: 'child4' }
      ]


      this.displayWhatsappAccountWizard = false;
      this.displayConnectWhatsApp = false;
      // await this.switchConnectWhatsApp(this.displayConnectWhatsApp);

      this.displayCreateChatbot = true;
      // await this.switchCreateChatbot(this.displayCreateChatbot)

      this.displayInviteTeammate = true;
      // await this.switchInviteTeammate(this.displayInviteTeammate)

      this.displayCustomizeWidget = false;
      // await this.switchCustomizeWidget(this.displayCustomizeWidget);

      this.displayKnowledgeBase = true;
      // await this.switchyKnowledgeBase(this.displayKnowledgeBase);

      this.logger.log('[HOME] - YES ATTRIBUTES - NO USER PREFERENCES');
    }


    // ----------------------------------------------
    // USECASE 1
    // ----------------------------------------------
    if (this.solution === 'want_to_automate_conversations' &&
      this.solution_channel === 'web_mobile' &&
      this.use_case === "solve_customer_problems") {

      this.logger.log('[HOME] USECASE 1')
      // , show: false
      this.child_list_order = [
        { pos: 1, type: 'child1' },
        { pos: 2, type: 'child2' },
        { pos: 3, type: 'child5' },
        { pos: 4, type: 'child7' },
        { pos: 5, type: 'child6' },
        { pos: 6, type: 'child8' },
        { pos: 7, type: 'child3' },
        { pos: 8, type: 'child4' }
      ]


      this.displayWhatsappAccountWizard = false;

      this.displayConnectWhatsApp = false;
      // await this.switchConnectWhatsApp(this.displayConnectWhatsApp);

      this.displayCreateChatbot = true;
      // await this.switchCreateChatbot(this.displayCreateChatbot)

      this.displayInviteTeammate = true
      // await this.switchInviteTeammate(this.displayInviteTeammate)

      this.displayKnowledgeBase = true;
      // await this.switchyKnowledgeBase(this.displayKnowledgeBase);

      this.displayCustomizeWidget = true;
      // await this.switchCustomizeWidget(this.displayCustomizeWidget)
    }

    // ----------------------------------------------
    // USECASE 2
    // ----------------------------------------------
    if (this.solution === 'want_to_automate_conversations' &&
      this.solution_channel === 'web_mobile' &&
      this.use_case === "increase_online_sales") {
      this.logger.log('[HOME] USECASE 2')

      this.child_list_order = [
        { pos: 1, type: 'child1' },
        { pos: 2, type: 'child2' },
        { pos: 3, type: 'child5' },
        { pos: 4, type: 'child7' },
        { pos: 5, type: 'child6' },
        { pos: 6, type: 'child8' },
        { pos: 7, type: 'child3' },
        { pos: 8, type: 'child4' }
      ]


      this.displayWhatsappAccountWizard = false;

      this.displayConnectWhatsApp = false;
      // await this.switchConnectWhatsApp(this.displayConnectWhatsApp);

      this.displayCreateChatbot = true;
      // await this.switchCreateChatbot(this.displayCreateChatbot);

      this.displayInviteTeammate = true
      // await this.switchInviteTeammate(this.displayInviteTeammate)

      this.displayKnowledgeBase = false;
      // await this.switchyKnowledgeBase(this.displayKnowledgeBase);

      this.displayCustomizeWidget = true;
      // await this.switchCustomizeWidget(this.displayCustomizeWidget)


    }

    // ----------------------------------------------
    // USECASE 3
    // ----------------------------------------------
    if (this.solution === 'want_to_automate_conversations' &&
      this.solution_channel === 'whatsapp_fb_messenger' &&
      this.use_case === 'solve_customer_problems') {
      this.logger.log('[HOME] USECASE 3')

      this.child_list_order = [
        { pos: 1, type: 'child1' },
        { pos: 2, type: 'child2' },
        { pos: 3, type: 'child3' },
        { pos: 4, type: 'child4' },
        { pos: 5, type: 'child5' },
        { pos: 6, type: 'child7' },
        { pos: 7, type: 'child6' },
        { pos: 8, type: 'child8' }
      ]

      this.displayWhatsappAccountWizard = true;

      this.displayConnectWhatsApp = true;
      // await this.switchConnectWhatsApp(this.displayConnectWhatsApp);

      this.displayCreateChatbot = true;
      // await this.switchCreateChatbot(this.displayCreateChatbot);

      this.displayInviteTeammate = true
      // await this.switchInviteTeammate(this.displayInviteTeammate)

      this.displayKnowledgeBase = true;
      // await this.switchyKnowledgeBase(this.displayKnowledgeBase);

      this.displayCustomizeWidget = false;
      // await this.switchCustomizeWidget(this.displayCustomizeWidget)

    }

    // ----------------------------------------------
    // USECASE 4
    // ----------------------------------------------
    if (this.solution === 'want_to_automate_conversations' &&
      this.solution_channel === 'whatsapp_fb_messenger' &&
      this.use_case === 'increase_online_sales') {
      this.logger.log('[HOME] USECASE 4')

      this.child_list_order = [
        { pos: 1, type: 'child1' },
        { pos: 2, type: 'child2' },
        { pos: 3, type: 'child3' },
        { pos: 4, type: 'child4' },
        { pos: 5, type: 'child5' },
        { pos: 6, type: 'child6' },
        { pos: 7, type: 'child7' },
        { pos: 8, type: 'child8' }
      ]


      // this.displayAnalyticsConvsGraph = false;
      // await this.switchAnalyticsConvsGraph(this.displayAnalyticsConvsGraph);

      // this.displayAnalyticsIndicators = false;
      // await this.switchAnalyticsIndicators(this.displayAnalyticsIndicators);

      this.displayWhatsappAccountWizard = true;

      this.displayConnectWhatsApp = true;
      // await this.switchConnectWhatsApp(this.displayConnectWhatsApp);

      this.displayCreateChatbot = true;
      // await this.switchCreateChatbot(this.displayCreateChatbot);

      this.displayInviteTeammate = true;
      // await this.switchInviteTeammate(this.displayInviteTeammate);

      this.displayKnowledgeBase = false;
      // await this.switchyKnowledgeBase(this.displayKnowledgeBase);

      this.displayCustomizeWidget = false;
      // await this.switchCustomizeWidget(this.displayCustomizeWidget)


    }

    // ----------------------------------------------
    // USECASE 5
    // ----------------------------------------------
    if (this.solution === 'want_to_talk_to_customers' &&
      this.solution_channel === 'web_mobile' &&
      this.use_case === 'solve_customer_problems') {
      this.logger.log('[HOME] USECASE 5')

      this.child_list_order = [
        { pos: 1, type: 'child1' },
        { pos: 2, type: 'child2' },
        { pos: 3, type: 'child6' },
        { pos: 4, type: 'child8' },
        { pos: 5, type: 'child5' },
        { pos: 6, type: 'child7' },
        { pos: 7, type: 'child3' },
        { pos: 8, type: 'child4' }
      ]

      // this.displayAnalyticsConvsGraph = false;
      // await this.switchAnalyticsConvsGraph(this.displayAnalyticsConvsGraph);

      // this.displayAnalyticsIndicators = false;
      // await this.switchAnalyticsIndicators(this.displayAnalyticsIndicators);

      this.displayWhatsappAccountWizard = false;
      this.displayConnectWhatsApp = false;
      // await this.switchConnectWhatsApp(this.displayConnectWhatsApp);

      this.displayCreateChatbot = true;
      // await this.switchCreateChatbot(this.displayCreateChatbot);

      this.displayInviteTeammate = true;
      // await this.switchInviteTeammate(this.displayInviteTeammate);

      this.displayKnowledgeBase = true;
      // await this.switchyKnowledgeBase(this.displayKnowledgeBase);

      this.displayCustomizeWidget = true;
      // await this.switchCustomizeWidget(this.displayCustomizeWidget)

    }

    // ----------------------------------------------
    // USECASE 6
    // ----------------------------------------------
    if (this.solution === 'want_to_talk_to_customers' &&
      this.solution_channel === 'web_mobile' &&
      this.use_case === 'increase_online_sales') {
      this.logger.log('[HOME] USECASE 6')

      this.child_list_order = [
        { pos: 1, type: 'child1' },
        { pos: 2, type: 'child2' },
        { pos: 3, type: 'child6' },
        { pos: 4, type: 'child8' },
        { pos: 5, type: 'child5' },
        { pos: 6, type: 'child7' },
        { pos: 7, type: 'child3' },
        { pos: 8, type: 'child4' }
      ]

      // this.displayAnalyticsConvsGraph = false;
      // this.switchAnalyticsConvsGraph(this.displayAnalyticsConvsGraph);

      // this.displayAnalyticsIndicators = false;
      // this.switchAnalyticsIndicators(this.displayAnalyticsIndicators);

      this.displayWhatsappAccountWizard = false;
      this.displayConnectWhatsApp = false;
      // await this.switchConnectWhatsApp(this.displayConnectWhatsApp);

      this.displayCreateChatbot = true;
      // await this.switchCreateChatbot(this.displayCreateChatbot);

      this.displayInviteTeammate = true;
      // await this.switchInviteTeammate(this.displayInviteTeammate)

      this.displayKnowledgeBase = false;
      // await this.switchyKnowledgeBase(this.displayKnowledgeBase);

      this.displayCustomizeWidget = true;
      // await this.switchCustomizeWidget(this.displayCustomizeWidget)

    }

    // ----------------------------------------------
    // USECASE 7
    // ----------------------------------------------
    if (this.solution === 'want_to_talk_to_customers' &&
      this.solution_channel === 'whatsapp_fb_messenger' &&
      this.use_case === 'solve_customer_problems') {
      this.logger.log('[HOME] USECASE 7')

      this.child_list_order = [
        { pos: 1, type: 'child1' },
        { pos: 2, type: 'child2' },
        { pos: 3, type: 'child3' },
        { pos: 4, type: 'child4' },
        { pos: 5, type: 'child6' },
        { pos: 6, type: 'child5' },
        { pos: 7, type: 'child7' },
        { pos: 8, type: 'child8' }
      ]

      // this.displayAnalyticsConvsGraph = false;
      // this.switchAnalyticsConvsGraph(this.displayAnalyticsConvsGraph);

      // this.displayAnalyticsIndicators = false;
      // this.switchAnalyticsIndicators(this.displayAnalyticsIndicators);

      this.displayWhatsappAccountWizard = true;

      this.displayConnectWhatsApp = true;
      // await this.switchConnectWhatsApp(this.displayConnectWhatsApp);

      this.displayCreateChatbot = true
      // await this.switchCreateChatbot(this.displayCreateChatbot)

      this.displayInviteTeammate = true
      // await this.switchInviteTeammate(this.displayInviteTeammate)

      this.displayKnowledgeBase = true;
      // await this.switchyKnowledgeBase(this.displayKnowledgeBase);

      this.displayCustomizeWidget = false;
      // await this.switchCustomizeWidget(this.displayCustomizeWidget)

    }


    // ----------------------------------------------
    // USECASE 8
    // ----------------------------------------------
    if (this.solution === 'want_to_talk_to_customers' &&
      this.solution_channel === 'whatsapp_fb_messenger' &&
      this.use_case === 'increase_online_sales') {
      this.logger.log('[HOME] USECASE 8')

      this.child_list_order = [
        { pos: 1, type: 'child1' },
        { pos: 2, type: 'child2' },
        { pos: 3, type: 'child3' },
        { pos: 4, type: 'child4' },
        { pos: 5, type: 'child6' },
        { pos: 6, type: 'child5' },
        { pos: 7, type: 'child7' },
        { pos: 8, type: 'child8' }
      ]

      this.displayWhatsappAccountWizard = true;

      this.displayConnectWhatsApp = true;
      // await this.switchConnectWhatsApp(true);

      this.displayCreateChatbot = true
      // await this.switchCreateChatbot(this.displayCreateChatbot)

      this.displayInviteTeammate = true
      // await this.switchInviteTeammate(this.displayInviteTeammate)

      this.displayKnowledgeBase = false;
      // await this.switchyKnowledgeBase(false);

      this.displayCustomizeWidget = false;
      // await this.switchCustomizeWidget(false)



    }
  }

  checkPlan(appTitle) {
    if (
      (appTitle === "WhatsApp Business" || appTitle === "Facebook Messenger") &&
      ((this.profile_name === PLAN_NAME.A) ||
        (this.profile_name === PLAN_NAME.B && this.subscription_is_active === false) ||
        (this.profile_name === PLAN_NAME.C && this.subscription_is_active === false) ||
        (this.profile_name === 'free' && this.prjct_trial_expired === true))
    ) {

      if (!this.appSumoProfile) {

        return false
      } else {

        return false
      }
    } else if (
      (appTitle === "WhatsApp Business" || appTitle === "Facebook Messenger") &&
      ((this.profile_name === PLAN_NAME.D) ||
        (this.profile_name === PLAN_NAME.E && this.subscription_is_active === false) ||
        (this.profile_name === PLAN_NAME.EE && this.subscription_is_active === false) ||
        (this.profile_name === PLAN_NAME.F && this.subscription_is_active === false) ||
        (this.profile_name === 'Sandbox' && this.prjct_trial_expired === true))
    ) {
      if (!this.appSumoProfile) {
        // this.presentModalFeautureAvailableFromTier2Plan(this.featureAvailableFromEPlan)
        return false
      }

    }
  }

  scrollToChild(el: ElementRef) {
    el.nativeElement.scrollIntoView({ behavior: 'smooth' });

    setTimeout(() => {
      // this.displayWhatsappAccountWizard = false; 
    }, 1500);
  }

  goToConnectWA() {
    this.logger.log('[HOME] GO TO CONNECT WA childWhatsappAccount', this.childWhatsappAccount);
    this.scrollToChild(this.childWhatsappAccount)
  }

  onClickOnGoToLearnMoreOrManageApp() {
    this.logger.log('HAS CLICKED GO TO WhatsApp Details')
    this.goToWhatsAppDetails()
  }

  goToWhatsAppDetails() {
    this.appTitle = "WhatsApp Business"
    this.logger.log('[HOME] goToWhatsAppDetails appTitle ', this.appTitle)
    const isAvailable = this.checkPlanAndPresentModal(this.appTitle)
    this.logger.log('[HOME] isAvaibleFromPlan ', isAvailable)
    if (isAvailable === false) {
      return
    }

    // || this.appTitle === "Facebook Messenger"
    if (this.appTitle === "WhatsApp Business") {
      this.router.navigate(['project/' + this.projectId + '/integrations'], { queryParams: { 'name': 'whatsapp' } })
      // this.router.navigate(['project/' + this.projectId + '/app-store-install/' + this.whatsAppAppId + '/detail/h'])

    }
  }

  checkPlanAndPresentModal(appTitle) {
    this.logger.log('[HOME] checkPlanAndPresentModal appTitle', appTitle, 'appSumoProfile ', this.appSumoProfile)
    if (
      (appTitle === "WhatsApp Business" || appTitle === "Facebook Messenger") &&
      ((this.profile_name === PLAN_NAME.A) ||
        (this.profile_name === PLAN_NAME.B && this.subscription_is_active === false) ||
        (this.profile_name === PLAN_NAME.C && this.subscription_is_active === false) ||
        (this.profile_name === 'free' && this.prjct_trial_expired === true))) {

      if (!this.appSumoProfile) {
        // this.presentModalFeautureAvailableFromTier2Plan(this.featureAvailableFromBPlan)
        this.presentModalFeautureAvailableFromTier2Plan(this.featureAvailableFromEPlan)
        return false
      } else {
        this.presentModalAppSumoFeautureAvailableFromBPlan()
        return false
      }
    } else if (
      (appTitle === "WhatsApp Business" || appTitle === "Facebook Messenger") &&
      ((this.profile_name === PLAN_NAME.D) ||
        (this.profile_name === PLAN_NAME.E && this.subscription_is_active === false) ||
        (this.profile_name === PLAN_NAME.EE && this.subscription_is_active === false) ||
        (this.profile_name === PLAN_NAME.F && this.subscription_is_active === false) ||
        (this.profile_name === 'Sandbox' && this.prjct_trial_expired === true))) {
      if (!this.appSumoProfile) {
        this.presentModalFeautureAvailableFromTier2Plan(this.featureAvailableFromEPlan)
        return false
      }

    }
  }


  presentModalFeautureAvailableFromTier2Plan(planName) {
    if (this.isVisiblePay) {
      // const el = document.createElement('div')
      // el.innerHTML = planName //this.featureAvailableFromBPlan
      Swal.fire({
        // content: el,
        title: this.upgradePlan,
        text: planName,
        icon: "info",
        showCloseButton: false,
        showCancelButton: true,
        confirmButtonText: this.upgradePlan,
        cancelButtonText: this.cancel,
        // confirmButtonColor: "var(--blue-light)",
        focusConfirm: true,
        reverseButtons: true,

        // buttons: {
        //   cancel: this.cancel,
        //   catch: {
        //     text: this.upgradePlan,
        //     value: "catch",
        //   },
        // },
        // dangerMode: false,
      }).then((result) => {
        if (result.isConfirmed) {

          if (this.isVisiblePay) {
            // this.logger.log('[APP-STORE] HERE 1')
            if (this.USER_ROLE === 'owner') {
              // this.logger.log('[APP-STORE] HERE 2')
              if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
                // this.logger.log('[APP-STORE] HERE 3')
                this.notify._displayContactUsModal(true, 'upgrade_plan');
              } else if (this.prjct_profile_type === 'payment' && this.subscription_is_active === true && (this.profile_name === PLAN_NAME.A || this.profile_name === PLAN_NAME.D)) {
                this.notify._displayContactUsModal(true, 'upgrade_plan');
              } else if (this.prjct_profile_type === 'free' && this.prjct_trial_expired === true) {
                // this.logger.log('[APP-STORE] HERE 4')
                this.router.navigate(['project/' + this.projectId + '/pricing']);
              }
            } else {
              // this.logger.log('[APP-STORE] HERE 5')

              this.presentModalOnlyOwnerCanManageTheAccountPlan();
            }
          } else {
            // this.logger.log('[APP-STORE] HERE 6')
            this.notify._displayContactUsModal(true, 'upgrade_plan');
          }
        }
      });
    } else {
      this.notify._displayContactUsModal(true, 'upgrade_plan');
    }
  }

  presentModalAppSumoFeautureAvailableFromBPlan() {
    // const el = document.createElement('div')
    // el.innerHTML = 'Available from ' + this.appSumoProfilefeatureAvailableFromBPlan
    Swal.fire({
      // content: el,
      icon: "info",
      title: this.upgradePlan,
      text: 'Available from ' + this.appSumoProfilefeatureAvailableFromBPlan,
      showCloseButton: false,
      showCancelButton: true,
      confirmButtonText: this.upgradePlan,
      cancelButtonText: this.cancel,
      // confirmButtonColor: "var(--blue-light)",
      focusConfirm: true,
      reverseButtons: true,

      // buttons: {
      //   cancel: this.cancel,
      //   catch: {
      //     text: this.upgradePlan,
      //     value: "catch",
      //   },
      // },
      // dangerMode: false,
    }).then((result) => {
      if (result.isConfirmed) {
        if (this.USER_ROLE === 'owner') {
          this.router.navigate(['project/' + this.projectId + '/project-settings/payments']);
        } else {
          // this.logger.log('[HOME-WA] HERE 5')
          this.presentModalAgentCannotManageAvancedSettings();
        }
      }
    });
  }


  presentModalAgentCannotManageAvancedSettings() {
    // this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.agentCannotManageAdvancedOptions, this.learnMoreAboutDefaultRoles)
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyOwnerCanManageTheAccountPlanMsg, this.learnMoreAboutDefaultRoles)
  }


  getLoggedUser() {
    this.home2Facade.user$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user) => {
        this.logger.log('[HOME] - USER GET IN HOME ', user)
        if (user) {
          this.user = user;
        }

        if (this.user) {
          if (!isDevMode()) {
            if (window['analytics']) {
              try {
                window['analytics'].identify(this.user._id, {
                  name: this.user.firstname + ' ' + this.user.lastname,
                  email: this.user.email,
                  logins: 5,
                  plan: this.profile_name_for_segment,

                });
              } catch (err) {
                // this.logger.error('identify Home error', err);
              }
            }
          }

          // !!!! NO MORE USED - MOVED IN USER SERVICE
          // this.getAllUsersOfCurrentProject();
          this.logger.log('[HOME] CALL -> getAllUsersOfCurrentProjectAndSaveInStorage')
          this.usersService.getAllUsersOfCurrentProjectAndSaveInStorage();

        }
      });
  }



  updatedProjectTrialEndedEmitted(hasemittetedtrialendend) {
    this.projectService.updateProjectName(this.projectId, hasemittetedtrialendend)
      .subscribe((prjct) => {
        this.logger.log('[HOME] - UPDATE PROJECT - HAS EMITTED TRIAL ENDED - RESPONSE ', prjct);

      }, (error) => {
        this.logger.error('[HOME] UPDATE PROJECT - HAS EMITTED TRIAL ENDED - ERROR ', error);
      }, () => {
        this.logger.log('[HOME] UPDATE PROJECT - HAS EMITTED TRIAL ENDED * COMPLETE *');
      });
  }





  diplayPopup() {
    const hasClosedPopup = localStorage.getItem('dshbrd----hasclosedpopup')
    // this.logger.log('[HOME] hasClosedPopup', hasClosedPopup)
    if (hasClosedPopup === null) {
      this.popup_visibility = 'block'
      // this.logger.log('[HOME] popup_visibility', this.popup_visibility)
    }
    if (hasClosedPopup === 'true') {
      this.popup_visibility = 'none'
    }
  }

  closeEverythingStartsHerePopup() {
    // this.logger.log('[HOME] closeEverythingStartsHerePopup')
    localStorage.setItem('dshbrd----hasclosedpopup', 'true')
    this.popup_visibility = 'none'
    // this.logger.log('[HOME] closeEverythingStartsHerePopup popup_visibility ',  this.popup_visibility)
  }


  public scrollRight(): void {
    this.logger.log('[HOME] scrollRight widgetsContent', this.widgetsContent)

    this.widgetsContent.nativeElement.scrollTo({ left: (this.widgetsContent.nativeElement.scrollLeft + 150), behavior: 'smooth' });
  }

  public scrollLeft(): void {
    this.logger.log('[HOME] scrollLeft widgetsContent', this.widgetsContent)
    this.widgetsContent.nativeElement.scrollTo({ left: (this.widgetsContent.nativeElement.scrollLeft - 150), behavior: 'smooth' });
  }


  toggleDisplayTeammates() {
    this.DISPLAY_TEAMMATES = !this.DISPLAY_TEAMMATES;
    // this.logger.log('DISPLAY_TEAMMATES ',   this.DISPLAY_TEAMMATES)
    // if (this.DISPLAY_TEAMMATES === false) {
    //   this.DISPLAY_TEAMMATES = true;
    //   this.logger.log('[HOME] > DISPLAY_TEAMMATES', this.DISPLAY_TEAMMATES)
    // } else if (this.DISPLAY_TEAMMATES === true) {
    //   this.DISPLAY_TEAMMATES = false;
    //   this.logger.log('[HOME] > DISPLAY_TEAMMATES', this.DISPLAY_TEAMMATES)
    // }
  }

  toggleDisplayChatbots(DISPLAY_CHATBOTS) {
    // this.DISPLAY_CHATBOTS = !this.DISPLAY_CHATBOTS
    // this.logger.log('DISPLAY_CHATBOTS ',   this.DISPLAY_CHATBOTS)
    // if (this.DISPLAY_CHATBOTS === false) {
    //   this.DISPLAY_CHATBOTS = true;
    //   this.logger.log('[HOME] > DISPLAY_CHATBOTS', this.DISPLAY_CHATBOTS)
    // } else if (this.DISPLAY_CHATBOTS === true) {
    //   this.DISPLAY_CHATBOTS = false;
    //   this.logger.log('[HOME] > DISPLAY_CHATBOTS', this.DISPLAY_CHATBOTS)
    // }
  }


  getChatUrl() {
    const cfg = this.home2ConfigVm.getConfigVm();
    this.CHAT_BASE_URL = cfg.chatBaseUrl;
    this.logger.log('[HOME] Chat base url', this.CHAT_BASE_URL);
  }

  getOSCODE() {
    const cfg = this.home2ConfigVm.getConfigVm();
    this.public_Key = cfg.publicKey;

    const flags = this.home2ConfigVm.parsePublicKeyFlags(this.public_Key);
    this.isVisiblePay = flags.isVisiblePay;
    this.isVisibleANA = flags.isVisibleANA;
    this.isVisibleAPP = flags.isVisibleAPP;
    this.isVisibleOPH = flags.isVisibleOPH;
    this.isVisibleHomeBanner = flags.isVisibleHomeBanner;
    this.project_plan_badge = flags.projectPlanBadge;
    this.isVisibleKNB = flags.isVisibleKNB;
    this.isVisibleQuoteSection = flags.isVisibleQuoteSection;

    if (this.isVisibleKNB) {
      this.getProjectPlan();
    }
  }

  getProjectPlan() {
    this.prjctPlanService.projectPlan$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((projectProfileData: any) => {
        this.logger.log('[HOME] - getProjectPlan project Profile Data', projectProfileData)
        if (projectProfileData) {

          this.manageknowledgeBasesVisibility(projectProfileData)

        }
      })
  }

  manageknowledgeBasesVisibility(projectProfileData) {
    this.public_Key = this.home2ConfigVm.getConfigVm().publicKey;
    if (projectProfileData['customization']) {
      this.logger.log('[HOME] manageknowledgeBasesVisibility USECASE EXIST customization > knowledgeBases (1)', projectProfileData['customization']['knowledgeBases'])
    }

    if (projectProfileData['customization'] && projectProfileData['customization']['knowledgeBases'] !== undefined) {
      this.logger.log('[HOME] manageknowledgeBasesVisibility USECASE A EXIST customization ', projectProfileData['customization'], ' & knowledgeBases', projectProfileData['customization']['knowledgeBases'])

      if (projectProfileData['customization']['knowledgeBases'] === true) {
        this.isVisibleKNB = true;
        this.logger.log('[HOME] manageknowledgeBasesVisibility USECASE A isVisibleKNB', this.isVisibleKNB)
      } else if (projectProfileData['customization']['knowledgeBases'] === false) {

        this.isVisibleKNB = false;
        this.logger.log('[HOME] manageknowledgeBasesVisibility USECASE A isVisibleKNB', this.isVisibleKNB)
      }


    } else if (projectProfileData['customization'] && projectProfileData['customization']['knowledgeBases'] === undefined) {
      this.logger.log('[HOME] manageknowledgeBasesVisibility USECASE B EXIST customization ', projectProfileData['customization'], ' BUT knowledgeBases IS', projectProfileData['customization']['knowledgeBases'])

      // if (this.public_Key.includes("KNB")) {
      this.logger.log('[HOME] manageknowledgeBasesVisibility USECASE B  (from FT) - EXIST KNB ', this.public_Key.includes("KNB"));

      this.isVisibleKNB = this.getKnbValue()
      this.logger.log('[HOME]  this.isVisibleKNB from FT ', this.isVisibleKNB)


    } else if (projectProfileData['customization'] === undefined) {
      this.logger.log('[HOME] manageknowledgeBasesVisibility USECASE C customization is  ', projectProfileData['customization'], 'get value from FT')
      this.isVisibleKNB = this.getKnbValue()
      this.logger.log('[HOME]  this.isVisibleKNB from FT ', this.isVisibleKNB)
    }
  }

  getKnbValue() {
    this.public_Key = this.home2ConfigVm.getConfigVm().publicKey;
    // this.logger.log('[HOME] getAppConfig  public_Key', this.public_Key);
    // this.logger.log('[HOME] getAppConfig  public_Key type of', typeof this.public_Key);
    // this.logger.log('[HOME] getAppConfig  this.public_Key.includes("KNB") ', this.public_Key.includes("KNB"));
    // let substring = this.public_Key.substring(this.public_Key.indexOf('KNB'));
    let parts = this.public_Key.split('-');
    // this.logger.log('[HOME] getAppConfig  parts ', parts);

    let kbn = parts.find((part) => part.startsWith('KNB'));
    this.logger.log('[HOME] manageknowledgeBasesVisibility  kbn ', kbn);
    let kbnParts = kbn.split(':');
    this.logger.log('[HOME] manageknowledgeBasesVisibility  kbnParts ', kbnParts);
    let kbnValue = kbnParts[1]
    this.logger.log('[HOME] manageknowledgeBasesVisibility  kbnValue ', kbnValue);
    if (kbnValue === 'T') {
      return true
    } else if (kbnValue === 'F') {
      return false
    }

  }




  checkPromoURL() {
    const cfg = this.home2ConfigVm.getConfigVm();
    this.isVisibleHomeBanner = cfg.promoBannerVisible;
  }

  showPromoBanner() {
    this.isVisibleHomeBanner = false;
    this.logger.log('[HOME] isVisibleHomeBanner', this.isVisibleHomeBanner);
  }


  getBrowserLanguage() {
    this.browserLang = this.translate.getBrowserLang();
    this.logger.log('[HOME] BRS-LANG (USED FOR SWITCH MONTH NAME)', this.browserLang)
  }




  // IS USED TO GET THE PROJECT-USER AND DETERMINE IF THE USER IS AVAILAVLE/UNAVAILABLE WHEN THE USER ENTER IN HOME
  // (GET THE PROJECT-USER CAN NOT BE DONE IN THE SIDEBAR BECAUSE WHEN THE PROJECT
  // IS SELECTED THE SIDEBAR HAS BEEN ALREADY CALLED)
  // *** NOTE: THE SAME CALLBACK IS RUNNED IN THE SIDEBAR.COMP ***
  getProjectUser() {
    console.log('[HOME] CALL GET-PROJECT-USER')
    // this.usersService.getProjectUserByUserId(this.user._id).subscribe((projectUser: any) => {
    this.usersService.getCurrentProjectUser().subscribe((projectUser: any) => {
      this.logger.log('[HOME] PROJECT-USER GET BY PROJECT-ID & CURRENT-USER-ID ', projectUser)
      if (projectUser) {
        this.logger.log('[HOME] PROJECT-USER ID ', projectUser[0]._id)
        this.logger.log('[HOME] USER IS AVAILABLE ', projectUser[0].user_available)
        this.logger.log('[HOME] USER IS BUSY ', projectUser[0].isBusy)
        // this.user_is_available_bs = projectUser.user_available;

        // if (projectUser[0].user_available !== undefined) {
        //   this.usersService.user_availability(projectUser[0]._id, projectUser[0].user_available, projectUser[0].isBusy, projectUser[0]);
        // }
        if (projectUser[0].role !== undefined) {
          console.log('!!! »»» HOME GET THE USER ROLE FOR THE PROJECT »»', this.projectId, '»»» ', projectUser[0].role);

          // SEND THE ROLE TO USER SERVICE THAT PUBLISH
          this.usersService.user_role(projectUser[0].role);

          // save the user role in storage - then the value is get by auth.service:
          // the user with agent role can not access to the pages under the settings sub-menu
          // this.auth.user_role(projectUser[0].role);
          // this.usersLocalDbService.saveUserRoleInStorage(projectUser[0].role);

          // used to display / hide 'WIDGET' and 'ANALITCS' in home.component.html
          this.USER_ROLE = projectUser[0].role;
        }

      }
    }, (error) => {
      this.logger.error('[HOME] PROJECT-USER GET BY PROJECT-ID & CURRENT-USER-ID ERROR ', error);
    }, () => {
      this.logger.log('[HOME] PROJECT-USER GET BY PROJECT ID & CURRENT-USER-ID  * COMPLETE *');
    });
  }

  goToPayment() {
    if (this.USER_ROLE === 'owner') {
      // if (this.prjct_profile_type === 'payment') {
      this.router.navigate(['project/' + this.projectId + '/project-settings/payments']);
      // }
    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan()
    }
  }

  goToSubscription() {
    this.logger.log('[HOME] goToSubscription')

    if (this.USER_ROLE === 'owner') {
      this.router.navigate(['project/' + this.projectId + '/project-settings/payments']);
    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan();
    }
  }

  presentModalOnlyOwnerCanManageTheAccountPlan() {
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyOwnerCanManageTheAccountPlanMsg, this.learnMoreAboutDefaultRoles)
  }





  // RISOLVE lo USE-CASE: L'UTENTE è NELLA HOME DEL PROGETTO A (DI CUI è OWNER)
  // SEGUE UN LINK CHE LO PORTA (AD ESEMPIO) AL DETTAGLIO DI UNA RICHIESTA DEL PROGETTO B (DI CUI è AGENT)
  // AVVIENE IL CAMBIO DAL PROGETTO A AL PROGETTO B 'ON THE FLY'
  // DOPO AVER VISUALIZZATO IL DETTAGLIO DELLA RICHIESTA L'UTENTE PREME SUL PULSANTE BACK E TORNA INDIETRO ALLA HOME DEL PROGETTO A
  // ANCHE SE NELLO STORAGE IL RUOLO DELL'UTENTE è STATO AGGIORNATO (DA AGENT A OWNER) LA PAGINA HOME NON VISUALIZZA
  // IL PULSANTE 'WIDGET' NN AVENDO FATTO IN TEMPO A AGGIORNARE IL 'ROLE' NELL'HTML
  // CON getUserRole() AGGIORNO this.USER_ROLE QUANDO LA SIDEBAR, NEL MOMENTO
  // IN CUI ESGUE getProjectUser() PASSA LO USER ROLE ALLO USER SERVICE CHE LO PUBBLICA
  // NOTA: LA SIDEBAR AGGIORNA LO USER ROLE PRIMA DELLA HOME
  getUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((userRole) => {

        this.logger.log('[HOME] - SUBSCRIPTION TO USER ROLE »»» ', userRole)
        // used to display / hide 'WIDGET' and 'ANALITCS' in home.component.html
        this.USER_ROLE = userRole;
      })
  }

  getHasOpenBlogKey() {
    const hasOpenedBlog = this.usersLocalDbService.getStoredChangelogDate();
    this.logger.log('[HOME]  »»»»»»»»» hasOpenedBlog ', hasOpenedBlog);
    if (hasOpenedBlog === true) {
      this.hidechangelogrocket = true;
    } else {
      this.hidechangelogrocket = false;
    }
  }


  // new dashbord
  async switchAnalyticsConvsGraph(event) {
    this.logger.log('[HOME] SWITCH ANALYTICS OVERVIEW event ', event)
    this.displayAnalyticsConvsGraph = event
    await this.updatesDashletsPreferences('switchAnalyticsConvsGraph')
  }

  async switchAnalyticsIndicators(event) {
    this.logger.log('[HOME] SWITCH ANALYTICS OVERVIEW event ', event)
    this.displayAnalyticsIndicators = event
    await this.updatesDashletsPreferences('switchAnalyticsIndicators')
  }

  async switchConnectWhatsApp(event) {
    this.logger.log('[HOME] SWITCH CNNECT WA event ', event)
    this.displayConnectWhatsApp = event;
    await this.updatesDashletsPreferences('switchConnectWhatsApp')
  }

  async switchCreateChatbot(event) {
    this.logger.log('[HOME] SWITCH CREATE CHATBOT event ', event)
    this.displayCreateChatbot = event;
    await this.updatesDashletsPreferences('switchCreateChatbot')
  }

  async switchInviteTeammate(event) {
    this.logger.log('[HOME] SWITCH INVITE TEAMMATES event ', event)
    this.displayInviteTeammate = event;
    await this.updatesDashletsPreferences('switchInviteTeammate')
  }

  async switchyKnowledgeBase(event) {
    this.logger.log('[HOME] SWITCH KNOWLEDGE BASE event ', event)
    this.displayKnowledgeBase = event;
    await this.updatesDashletsPreferences('switchyKnowledgeBase')
  }

  async switchCustomizeWidget(event) {
    this.logger.log('[HOME] SWITCH CUSTOMIZE WIDGET event ', event)
    this.displayCustomizeWidget = event;
    await this.updatesDashletsPreferences('switchCustomizeWidget')
  }

  async switchNewsFeed(event) {
    this.logger.log('[HOME] SWITCH NEWS FEED event ', event)
    this.displayNewsFeed = event;
    await this.updatesDashletsPreferences('switchNewsFeed')
  }



  async updatesDashletsPreferences(calledBy) {
    // const dashletArray =[ {'convsGraph': true, 'analyticsIndicators': true, 'connectWhatsApp': null, 'createChatbot': null, 'knowledgeBase': null, 'inviteTeammate': null,  'customizeWidget': null, 'newsFeed': true}]
    this.logger.log('[HOME] - calling updatesDashletsPreferences by ', calledBy);
    return await this.projectService.updateDashletsPreferences(
      this.displayAnalyticsConvsGraph,
      this.displayAnalyticsIndicators,
      this.displayConnectWhatsApp,
      this.displayCreateChatbot,
      this.displayKnowledgeBase,
      this.displayInviteTeammate,
      this.displayCustomizeWidget,
      this.displayNewsFeed)
      .toPromise().then((res) => {
        this.logger.log('[HOME] - UPDATE PRJCT WITH DASHLET PREFERENCES - RES ', res);
        return;
      }).catch((err) => {
        this.logger.log('[HOME] - UPDATE PRJCT WITH DASHLET PREFERENCES - err ', err);
      })
  }

  goToProjectSettingsGeneral() {
    if (this.USER_ROLE === 'owner') {
      this.router.navigate(['project/' + this.projectId + '/project-settings/general']);
    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan()
    }
  }



  goToOperatingHours() {
    this.router.navigate(['project/' + this.projectId + '/hours']);
  }

  // goToTiledeskMobileAppPage() {
  //   let url = ''
  //   if (this.browserLang === 'it') {
  //     url = 'https://tiledesk.com/mobile-live-chat-android-e-iphone-apps/';
  //   } else {
  //     url = 'https://tiledesk.com/mobile-live-chat-android-e-iphone-apps/';
  //   }
  //   window.open(url, '_blank');
  // }

  goToAdminDocs() {
    const url = URL_getting_started_for_admins
    window.open(url, '_blank');
  }

  goToAgentDocs() {
    const url = URL_getting_started_for_agents
    window.open(url, '_blank');
  }

  goToDeveloperDocs() {
    // const url = 'https://docs.tiledesk.com/';
    const url = 'https://developer.tiledesk.com';
    window.open(url, '_blank');
  }

  goToInstallWithTagManagerDocs() {
    const url = URL_google_tag_manager_add_tiledesk_to_your_sites;
    window.open(url, '_blank');
  }

  goToChangelogBlog() {
    // const url = 'https://tiledesk.com/tiledesk-changelog'
    const url = 'https://tiledesk.com/category/changelog/'
    window.open(url, '_blank');
    this.usersLocalDbService.savChangelogDate()
    this.hidechangelogrocket = true;
  }



  goToCreateProject() {
    this.router.navigate(['/create-new-project']);
  }


  // TRANSLATION
  translateString() {
    this.translateModalOnlyOwnerCanManageProjectAccount();

    this.translate.get('AvailableFromThePlan', { plan_name: PLAN_NAME.B })
      .subscribe((translation: any) => {
        this.featureAvailableFromBPlan = translation;
      });

    this.translate.get('AvailableFromThePlans', { plan_name_1: PLAN_NAME.E, plan_name_2: PLAN_NAME.EE })
      .subscribe((translation: any) => {
        this.featureAvailableFromEPlan = translation;
      });

    this.translate.get('Pricing.UpgradePlan')
      .subscribe((translation: any) => {
        this.upgradePlan = translation;
      });

    this.translate.get('Cancel')
      .subscribe((text: string) => {
        this.cancel = text;
      });

    this.translate.get('OnlyUsersWithTheOwnerRoleCanManageTheAccountPlan')
      .subscribe((translation: any) => {
        this.agentCannotManageAdvancedOptions = translation;
      });


    this.translateAreYouSure()
    this.translateAppWillBeDeleted()
    this.translateAppHasBeenDeleted()
    this.translateAnErrorOccurreWhileDeletingTheApp()
    this.translateDone()

  }

  translateAreYouSure() {
    this.translate.get('AreYouSure').subscribe((text: string) => {
      this.areYouSureMsg = text;
    });
  }

  translateAppWillBeDeleted() {
    this.translate.get('TheAppWillBeDeleted').subscribe((text: string) => {
      this.appWillBeDeletedMsg = text;
    });
  }

  translateAppHasBeenDeleted() {
    this.translate.get('TheAppHasBeenDeleted').subscribe((text: string) => {
      this.appHasBeenDeletedMsg = text;
    });
  }
  translateAnErrorOccurreWhileDeletingTheApp() {
    this.translate.get('AnErrorOccurreWhileDeletingTheApp').subscribe((text: string) => {
      this.errorWhileDeletingApp = text;
    });
  }

  translateDone() {
    this.translate.get('Done').subscribe((text: string) => {
      this.done_msg = text;
    });
  }


  translateModalOnlyOwnerCanManageProjectAccount() {
    this.translate.get('OnlyUsersWithTheOwnerRoleCanManageTheAccountPlan')
      .subscribe((translation: any) => {
        this.onlyOwnerCanManageTheAccountPlanMsg = translation;
      });

    this.translate.get('LearnMoreAboutDefaultRoles')
      .subscribe((translation: any) => {
        this.learnMoreAboutDefaultRoles = translation;
      });
  }

  getProPlanTrialTranslation() {
    this.translate.get('ProPlanTrial')
      .subscribe((translation: any) => {
        this.prjct_profile_name = translation;
      });
  }

  getPaidPlanTranslation(project_profile_name) {
    this.translate.get('PaydPlanName', { projectprofile: project_profile_name })
      .subscribe((text: string) => {
        this.prjct_profile_name = text;
        this.logger.log('+ + + PaydPlanName ', text)
      });
  }





}
