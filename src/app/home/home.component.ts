import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, isDevMode, ViewEncapsulation } from '@angular/core';
import { AuthService } from '../core/auth.service';

import { ActivatedRoute } from '@angular/router';

import { Project } from '../models/project-model';
import { Router } from '@angular/router';
import { UsersService } from '../services/users.service';
import { LocalDbService } from '../services/users-local-db.service';
import { NotifyService } from '../core/notify.service';
import { TranslateService } from '@ngx-translate/core';
import { ProjectPlanService } from '../services/project-plan.service';

import { Subscription } from 'rxjs';

import { AppConfigService } from '../services/app-config.service';

// import brand from 'assets/brand/brand.json';
import { BrandService } from '../services/brand.service';

import { Chart } from 'chart.js'; /// VISITOR GRAPH FOR THE NEW NOME
// import * as moment from 'moment';
import moment from "moment";
import { ContactsService } from '../services/contacts.service'; // USED FOR COUNT OF ACTIVE CONTACTS FOR THE NEW HOME
import { FaqKbService } from '../services/faq-kb.service'; // USED FOR COUNT OF BOTS FOR THE NEW HOME
import { APP_SUMO_PLAN_NAME, avatarPlaceholder, getColorBck, goToCDSVersion, PLAN_NAME } from '../utils/util';
import { LoggerService } from '../services/logger/logger.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { ProjectService } from 'app/services/project.service';
import {
  URL_getting_started_for_admins,
  URL_getting_started_for_agents,
  URL_google_tag_manager_add_tiledesk_to_your_sites
} from '../utils/util';

import { AppStoreService } from 'app/services/app-store.service';
import { DepartmentService } from 'app/services/department.service';
import { FaqKb } from 'app/models/faq_kb-model';
import { AnalyticsService } from 'app/services/analytics.service';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { QuotesService } from 'app/services/quotes.service';

const swal = require('sweetalert');
const Swal = require('sweetalert2')

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  PLAN_NAME = PLAN_NAME;
  APP_SUMO_PLAN_NAME = APP_SUMO_PLAN_NAME;
  private unsubscribe$: Subject<any> = new Subject<any>();
  @ViewChild('widgetsContent', { static: false, read: ElementRef }) public widgetsContent;

  @ViewChild('childWhatsappAccount', { static: false, read: ElementRef }) public childWhatsappAccount;
  @ViewChild('childCreateChatbot', { static: false, read: ElementRef }) public childCreateChatbot;
  @ViewChild('editOperatingHoursBtn', { static: false, read: ElementRef }) public editOperatingHoursBtn;



  company_name: string;
  tparams: any;

  firebaseProjectId: any;
  LOCAL_STORAGE_CURRENT_USER: any;

  // public superUser = new SuperUser('');
  currentUserEmailgetFromStorage: string;
  IS_SUPER_USER: boolean;

  user: any;
  project: Project;
  projects: any;
  projectId: string;
  projectName: string;
  // user_is_available: boolean;

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

  subscription: Subscription;

  installWidgetText: string;

  //** FOR THE NEW DASHBOARD **//
  monthNames: any; /// VISITOR GRAPH FOR THE NEW HOME
  initDay: string; /// VISITOR GRAPH FOR THE NEW HOME
  endDay: string; /// VISITOR GRAPH FOR THE NEW HOME
  selectedDaysId: number /// VISITOR GRAPH FOR THE NEW HOME
  countOfActiveContacts: number; /// COUNT OF ACTIVE CONTACT FOR THE NEW HOME
  countOfVisitors: number; /// COUNT OF ACTIVE CONTACT FOR THE NEW HOME
  countOfBots: number; /// USED FOR COUNT OF BOTS FOR THE NEW HOME !!! *** Not used - replaced with LAST 30 DAYS MESSAGES COUNT
  OPERATING_HOURS_ACTIVE: boolean; /// USED TO DISPLAY OPERATING HOURS ENABLED / DISABLED
  countOfLastMonthMsgs: number; /// USED FOR COUNT OF LAST 30 DAYS MSGS FOR THE NEW HOME
  countOfLastMonthRequests: number; // USED FOR COUNT OF LAST 30 DAYS REQUESTS FOR THE NEW HOME 
  countOfLastMonthRequestsHandledByBots: number;
  percentageOfLastMonthRequestsHandledByBots: any;
  projectUsers: any // TO DISPLAY THE PROJECT USERS IN THE NEW HOME HEADER
  storageBucket: string;
  baseUrl: string;
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
  // dispayPromoBanner: boolean = true;
  // promoBannerContent: any;
  // promoBannerSyle: any;
  // resPromoBanner: any;

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
  whatsAppIsInstalled: boolean = false;
  apps: any;

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
  whatsAppIsConnected: boolean = false;
  chatbotConnectedWithWA: boolean = false;
  waWizardSteps = [{ step1: false, step2: false, step3: false }]
  oneStepWizard: any
  wadepartmentid: string;
  wadepartmentName: string = '';
  waBotId: string = '';
  testBotOnWA: boolean = false;
  botIdForTestWA: string = '';
  // dashletsPreferences = [{ convsGraph: true, analyticsIndicators: true, connectWhatsApp: true, createChatbot: true, inviteTeammate: true }]
  dashletsPreferences: any;

  areYouSureMsg: string;
  appWillBeDeletedMsg: string;
  appHasBeenDeletedMsg: string;
  errorWhileDeletingApp: string;
  done_msg: string;
  userHasUnistalledWa: boolean = false
  chatbotCreated: boolean
  userHasClickedDisplayWAWizard: boolean = false
  PROJECT_ATTRIBUTES: any
  showskeleton: boolean = true;
  showskeletonForKbHero: boolean = true;
  showsNewsFeedSkeleton: boolean = true;
  custom_company_home_logo: string;
  companyLogoNoText: string;
  displayNewsAndDocumentation: string;
  // list_case1 = [
  //   { pos: 1, type: 'child1'},
  //   { pos: 2, type: 'child2'},
  //   { pos: 3, type: 'child3'},
  //   { pos: 4, type: 'child4'},
  //   { pos: 5, type: 'child5'},
  //   { pos: 6, type: 'child6'}
  // ]
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

  project_limits: any;
  quotes: any;
  conversationsRunnedOut: boolean = false;
  emailsRunnedOut: boolean = false;
  tokensRunnedOut: boolean = false;

  // ---------------------------------------
  // For test 
  // ---------------------------------------
  // conversationsRunnedOut: boolean = true;
  // emailsRunnedOut: boolean = true;
  // tokensRunnedOut: boolean = true;

  displayQuotaSkeleton: boolean = true

  salesEmail: string

  openedConversations: number = 0;
  closedConversations: number = 0;
  startSlot: string;
  endSlot: string;

  constructor(
    public auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService,
    private usersLocalDbService: LocalDbService,
    private notify: NotifyService,
    private translate: TranslateService,
    private prjctPlanService: ProjectPlanService,
    public appConfigService: AppConfigService,
    public brandService: BrandService,
    private analyticsService: AnalyticsService,
    private contactsService: ContactsService,
    private faqKbService: FaqKbService,
    private logger: LoggerService,
    private projectService: ProjectService,
    public appStoreService: AppStoreService,
    private departmentService: DepartmentService,
    public localDbService: LocalDbService,
    private quotesService: QuotesService
  ) {
    const brand = brandService.getBrand();
    this.company_name = brand['BRAND_NAME'];
    this.custom_company_home_logo = brand['CUSTOM_COMPANY_HOME_LOGO'];
    this.companyLogoNoText = brand['BASE_LOGO_NO_TEXT'];
    this.displayNewsAndDocumentation = brand['display-news-and-documentation'];
    // this.logger.log('[HOME] custom_company_home_logo ', this.custom_company_home_logo)
    this.tparams = brand;
    this.selectedDaysId = 7;
    this.salesEmail = brand['CONTACT_SALES_EMAIL'];
  }

  ngOnInit() {

    this.getLoggedUser()
    this.getCurrentProjectProjectByIdAndBots();
    // this.getStorageBucket(); // moved in getCurrentProject()
    this.logger.log('[HOME] !!! Hello HomeComponent! ');

    this.getBrowserLanguage();
    this.translateString();


    // get the PROJECT-USER BY CURRENT-PROJECT-ID AND CURRENT-USER-ID
    // IS USED TO DETERMINE IF THE USER IS AVAILABLE OR NOT AVAILABLE
    this.getProjectUser();

    // GET AND SAVE ALL BOTS OF CURRENT PROJECT IN LOCAL STORAGE
    this.usersService.getBotsByProjectIdAndSaveInStorage();

    // TEST FUNCTION : GET ALL AVAILABLE PROJECT USER
    // this.getAvailableProjectUsersByProjectId();

    this.getUserRole();
    // this.getProjectPlan(); 
    // this.getVisitorCounter();
    this.getOSCODE();
    this.checkPromoURL()
    this.getChatUrl();
    this.getHasOpenBlogKey()
    this.diplayPopup();
    // this.startChabgelogAnimation()
    // this.pauseResumeLastUpdateSlider() // https://stackoverflow.com/questions/5804444/how-to-pause-and-resume-css3-animation-using-javascript
    // this.getPromoBanner()
    this.waWizardSteps = [{ step1: false, step2: false, step3: false }]
    this.oneStepWizard = { watsAppConnected: false }

    // get if user has used Signin with Google
    const hasSigninWithGoogle = this.localDbService.getFromStorage('swg')
    if (hasSigninWithGoogle) {
      this.localDbService.removeFromStorage('swg')
      // this.logger.log('[SIGN-UP] removeFromStorage swg')
    }

    this.listeHasOpenedNavbarQuotasMenu()
  }

  ngAfterViewInit() {
    if (!isDevMode()) {
      if (window['analytics']) {
        try {
          window['analytics'].page("Home Page, Home", {});
        } catch (err) {
          this.logger.error('page Home error', err);
        }
      }
    }
  }

  ngOnDestroy() {
    // this.logger.log('HOME COMP - CALLING ON DESTROY')
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getCurrentProjectProjectByIdAndBots() {
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {
        this.logger.log('[HOME] $UBSCIBE TO PUBLISHED PROJECT - RES  --> ', project)

        if (project) {


          this.project = project
          this.projectId = this.project._id;
          this.projectName = this.project.name

          if (this.projectId) {
            this.getProjectQuotes();
            this.getQuotasCount()
          }
          this.prjct_name = this.project.name

          const hasEmittedTrialEnded = localStorage.getItem('dshbrd----' + this.project._id)
          this.logger.log('[HOME] - getCurrentProjectAndInit  hasEmittedTrialEnded ', hasEmittedTrialEnded, '  for project id', this.project._id)

          this.OPERATING_HOURS_ACTIVE = this.project.activeOperatingHours
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

  getQuotasCount() {
    this.quotesService.getQuotasCount(this.projectId).subscribe((resp: any) => {
      this.logger.log("[HOME] - GET QUOTAS COUNT - response: ", resp)

      this.openedConversations = resp.open;
      this.closedConversations = resp.closed;
      this.startSlot = resp.slot.startDate;
      this.endSlot = resp.slot.endDate;


      this.logger.log("[HOME] GET QUOTAS COUNT - OPENED CONV ", this.openedConversations);
      this.logger.log("[HOME] GET QUOTAS COUNT - CLOSED CONV ", this.closedConversations);
      this.logger.log("[HOME] GET QUOTAS COUNT - START SLOT ", this.startSlot);
      this.logger.log("[HOME] GET QUOTAS COUNT - END SLOT ", this.endSlot);
    }, (error) => {
      this.logger.error("[HOME] GET QUOTAS COUNT error: ", error)
    }, () => {
      this.logger.log("[HOME] GET QUOTAS COUNT * COMPLETE *");
    })
  }


  goToHistoryOpenedConvs() {
    this.logger.log("[NAVBAR] goToHistoryOpenedConvs ");
    this.router.navigate(['project/' + this.projectId + '/history'], { queryParams: { qs: `"full_text=&dept_id=&start_date=${this.startSlot}&end_date=${this.endSlot}&participant=&requester_email=&tags=&channel=&rstatus=100,200"` } })
  }


  goToHistoryClosedConvs() {
    this.logger.log("[NAVBAR] goToHistoryClosedConvs ");
    this.router.navigate(['project/' + this.projectId + '/history'], { queryParams: { qs: `"full_text=&dept_id=&start_date=${this.startSlot}&end_date=${this.endSlot}&participant=&requester_email=&tags=&channel=&rstatus=1000"` } })
  }

  goToHistoryAllConvs() {
    this.logger.log("[NAVBAR] goToHistoryAllConvs ");
    this.router.navigate(['project/' + this.projectId + '/history'], { queryParams: { qs: `"full_text=&dept_id=&start_date=${this.startSlot}&end_date=${this.endSlot}&participant=&requester_email=&tags=&channel=&rstatus=1000,100,200"` } })
  }


  getProjectQuotes() {
    this.quotesService.getProjectQuotes(this.projectId).then((response) => {
      this.logger.log("[HOME] getProjectQuotes response: ", response);
      this.logger.log("[HOME] getProjectQuotes: ", response);
      this.project_limits = response;
      if (this.project_limits) {
        this.getQuotes()
      }
    }).catch((err) => {
      this.logger.error("[HOME] getProjectQuotes error: ", err);
      this.displayQuotaSkeleton = false
    })
  }

  listeHasOpenedNavbarQuotasMenu() {
    //  this.logger.log("[HOME] listeHasOpenedNavbarQuotasMenu ");
    this.quotesService.hasOpenNavbarQuotasMenu$

      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((hasOpen) => {

        this.logger.log("[HOME] listeHasOpenedNavbarQuotasMenu hasOpen", hasOpen);
        if (this.projectId) {
          this.getQuotes()
        }
      })

  }

  getQuotes() {
    this.quotesService.getAllQuotes(this.projectId).subscribe((resp: any) => {
      this.logger.log("[HOME] getAllQuotes response: ", resp)
      this.quotes = resp

      this.logger.log("[HOME] project_limits: ", this.project_limits)
      this.logger.log("[HOME] resp.quotes: ", resp.quotes)
      if (this.project_limits) {
        this.messages_limit = this.project_limits.messages;
        this.requests_limit = this.project_limits.requests;
        this.email_limit = this.project_limits.email;
        this.tokens_limit = this.project_limits.tokens;
      }
      // -----------------------------
      // For test
      // -----------------------------
      // this.requests_limit = 1;
      // this.email_limit = 1;
      // this.tokens_limit = 1;

      if (resp.quotes.requests.quote === null) {
        resp.quotes.requests.quote = 0;
      }
      if (resp.quotes.messages.quote === null) {
        resp.quotes.messages.quote = 0;
      }
      if (resp.quotes.email.quote === null) {
        resp.quotes.email.quote = 0;
      }
      if (resp.quotes.tokens.quote === null) {
        resp.quotes.tokens.quote = 0;
      }

      this.logger.log('[HOME] used requests', resp.quotes.requests.quote)
      this.logger.log('[HOME] requests_limit', this.requests_limit)

      this.logger.log('[HOME] used email', resp.quotes.email.quote)
      this.logger.log('[HOME] email_limit', this.email_limit)


      this.logger.log('[HOME] used tokens', resp.quotes.tokens.quote)
      this.logger.log('[HOME] tokens_limit', this.tokens_limit)

  

      this.requests_perc = Math.min(100, Math.floor((resp.quotes.requests.quote / this.requests_limit) * 100));
      this.messages_perc = Math.min(100, Math.floor((resp.quotes.messages.quote / this.messages_limit) * 100));
      this.email_perc = Math.min(100, Math.floor((resp.quotes.email.quote / this.email_limit) * 100));
      this.tokens_perc = Math.min(100, Math.floor((resp.quotes.tokens.quote / this.tokens_limit) * 100));

      this.requests_count = resp.quotes.requests.quote;
      this.logger.log("[HOME] getAllQuotes requests_count: ", this.requests_count)
      this.messages_count = resp.quotes.messages.quote;
      this.email_count = resp.quotes.email.quote;
      this.tokens_count = resp.quotes.tokens.quote;

    }, (error) => {
      this.logger.error("[HOME] get all quotes error: ", error)
      this.displayQuotaSkeleton = false


    }, () => {
      this.logger.log("[HOME] get all quotes *COMPLETE*");
      setTimeout(() => {
        this.displayQuotaSkeleton = false
        this.getRunnedOutQuotes( this.quotes)
      }, 1000);

    })
  }

  getRunnedOutQuotes(resp) {
    if (resp.quotes.requests.quote >= this.requests_limit) {
      this.conversationsRunnedOut = true;
      this.logger.log('[HOME] conversationsRunnedOut', this.conversationsRunnedOut)
      // this.quotesService.hasReachedQuotasLimitInHome(true)
    } else {
      this.conversationsRunnedOut = false;
      // this.quotesService.hasReachedQuotasLimitInHome(false)
      this.logger.log('[HOME] conversationsRunnedOut', this.conversationsRunnedOut)
    }

    if (resp.quotes.email.quote >= this.email_limit) {
      this.emailsRunnedOut = true;
      this.logger.log('[HOME] emailsRunnedOut', this.emailsRunnedOut)
      // this.quotesService.hasReachedQuotasLimitInHome(true)
    } else {
      this.emailsRunnedOut = false;
      // this.quotesService.hasReachedQuotasLimitInHome(false)
      this.logger.log('[HOME] emailsRunnedOut', this.emailsRunnedOut)
    }

    if (resp.quotes.tokens.quote >= this.tokens_limit) {
      this.tokensRunnedOut = true;
      this.logger.log('[HOME] tokensRunnedOut', this.tokensRunnedOut)
      // this.quotesService.hasReachedQuotasLimitInHome(true)
    } else {
      this.tokensRunnedOut = false;
      // this.quotesService.hasReachedQuotasLimitInHome(false)
      this.logger.log('[HOME] tokensRunnedOut', this.tokensRunnedOut)
    }
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
        if (project.attributes && project.attributes.dashlets) {
          this.PROJECT_ATTRIBUTES = project.attributes;
          this.getDashlet(this.PROJECT_ATTRIBUTES)
        }

        if (project.attributes && project.attributes.userPreferences) {
          this.PROJECT_ATTRIBUTES = project.attributes;
          this.getOnbordingPreferences(this.PROJECT_ATTRIBUTES)

        } else {
          this.logger.log('[HOME] USECASE  PROJECT_ATTRIBUTES > USER PREFERENCES UNDEFINED - SET DEFAULT', this.PROJECT_ATTRIBUTES)
          this.setDefaultPreferences()
        }


        if (project.attributes && project.attributes.wasettings) {
          this.logger.log('[HOME] - (getProjectById) - wasettings', project.attributes.wasettings)
          this.wadepartmentid = project.attributes.wasettings.department_id
          this.getDeptById(this.wadepartmentid)
        } else {
          this.logger.log('[HOME] - (getProjectById) - not exist wasettings',)
        }

        const projectProfileData = project.profile

        this.manageChatbotVisibility(projectProfileData)

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


      this.getApps();
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
      } else if (this.prjct_profile_name === PLAN_NAME.D) {
        this.prjct_profile_name = PLAN_NAME.D + ' plan'
        this.profile_name_for_segment = this.prjct_profile_name;
        this.auth.projectProfile(this.profile_name_for_segment)
        this.project['plan_badge_background_type'] = 'a_plan_badge'

        // Premium plan
      } else if (this.prjct_profile_name === PLAN_NAME.E) {
        this.prjct_profile_name = PLAN_NAME.E + ' plan'
        this.profile_name_for_segment = this.prjct_profile_name
        this.auth.projectProfile(this.profile_name_for_segment)
        this.project['plan_badge_background_type'] = 'b_plan_badge'

      } else if (this.prjct_profile_name === PLAN_NAME.EE) {
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
            this.logger.error('track Trial Started event error', err);
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
            this.logger.error('group Home error', err);
          }
        }
      }, 100);
      // else {
      //   this.logger.error('group Home window[analytics]', window['analytics']);
      // }
    }
  }

  dismissKbSkeleton(event) {
    this.logger.log('[HOME] - dismissKbSkeleton event', event);
    // if (event === true ) {
    // if(this.displayKbHeroSection) { 
    //   this.showskeleton = false
    // }
  }

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
      this.logger.log('[HOME] - (onInit) - DASHLETS PREFERENCES ', project_attributes.dashlets);
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
    await this.switchConnectWhatsApp(this.displayConnectWhatsApp);

    this.displayCreateChatbot = true;
    await this.switchCreateChatbot(this.displayCreateChatbot)

    this.displayInviteTeammate = true;
    await this.switchInviteTeammate(this.displayInviteTeammate)

    this.displayCustomizeWidget = false;
    await this.switchCustomizeWidget(this.displayCustomizeWidget);

    this.displayKnowledgeBase = true;
    await this.switchyKnowledgeBase(this.displayKnowledgeBase);
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
        this.logger.error(`Track ${userAction} error`, err);
      }

      try {
        window['analytics'].identify(this.user._id, {
          username: userFullname,
          email: this.user.email,
          logins: 5,

        });
      } catch (err) {
        this.logger.error(`Identify ${userAction} error`, err);
      }

      try {
        window['analytics'].group(this.projectId, {
          name: this.project.name,
          plan: this.prjct_profile_name,

        });
      } catch (err) {
        this.logger.error(`Group ${userAction} error`, err);
      }
    }
  }


  async getOnbordingPreferences(project_attributes) {

    this.logger.log('[HOME] - getOnbordingPreferences PREFERENCES  project_attributes', project_attributes);
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
      this.logger.log('[HOME] - getOnbordingPreferences PREFERENCES  displayKbHeroSection', this.displayKbHeroSection);
    }

    if (project_attributes && project_attributes.userHasReMovedWA) {
      if (project_attributes.userHasReMovedWA === true) {
        this.userHasUnistalledWa = true;
        this.displayWhatsappAccountWizard = false;
      }
      else {
        this.userHasUnistalledWa = false;
        // if (project_attributes) {

        //   const waWizardstep1 = project_attributes.wastep1;
        //   const waWizardstep2 = project_attributes.wastep2;
        //   const waWizardstep3 = project_attributes.wastep3;
        //   if ((this.solution_channel_for_child === 'whatsapp_fb_messenger') &&
        //     (this.solution_for_child === 'want_to_talk_to_customers') ||
        //     (this.solution_for_child === 'want_to_automate_conversations')) {
        //     if (waWizardstep1 === undefined && waWizardstep2 === undefined && waWizardstep3 === undefined) {
        //       this.displayWhatsappAccountWizard = true;
        //     }
        //   }
        // }
      }
    }

    if (project_attributes && project_attributes.oneStepWizard && project_attributes.oneStepWizard.watsAppConnected) {
      if (project_attributes.oneStepWizard.watsAppConnected === true) {
        this.whatsAppIsConnected = true;
        this.displayWhatsappAccountWizard = false;
      }
      else {
        this.whatsAppIsConnected = false;
      }
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

      // this.displayAnalyticsConvsGraph = false;
      // await this.switchAnalyticsConvsGraph(this.displayAnalyticsConvsGraph);

      // this.displayAnalyticsIndicators = false;
      // await this.switchAnalyticsIndicators(this.displayAnalyticsIndicators);

      this.displayWhatsappAccountWizard = false;
      this.displayConnectWhatsApp = false;
      await this.switchConnectWhatsApp(this.displayConnectWhatsApp);

      this.displayCreateChatbot = true;
      await this.switchCreateChatbot(this.displayCreateChatbot)

      this.displayInviteTeammate = true;
      await this.switchInviteTeammate(this.displayInviteTeammate)

      this.displayCustomizeWidget = false;
      await this.switchCustomizeWidget(this.displayCustomizeWidget);

      this.displayKnowledgeBase = true;
      await this.switchyKnowledgeBase(this.displayKnowledgeBase);

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

      // this.displayAnalyticsConvsGraph = false;
      // await this.switchAnalyticsConvsGraph(this.displayAnalyticsConvsGraph);

      // this.displayAnalyticsIndicators = false;
      // await this.switchAnalyticsIndicators(this.displayAnalyticsIndicators);

      this.displayWhatsappAccountWizard = false;
      this.displayConnectWhatsApp = false;
      await this.switchConnectWhatsApp(this.displayConnectWhatsApp);

      this.displayCreateChatbot = true;
      await this.switchCreateChatbot(this.displayCreateChatbot)

      this.displayInviteTeammate = true
      await this.switchInviteTeammate(this.displayInviteTeammate)

      this.displayKnowledgeBase = true;
      await this.switchyKnowledgeBase(this.displayKnowledgeBase);

      this.displayCustomizeWidget = true;
      await this.switchCustomizeWidget(this.displayCustomizeWidget)


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

      // this.displayAnalyticsConvsGraph = false;
      // await this.switchAnalyticsConvsGraph(this.displayAnalyticsConvsGraph);

      // this.displayAnalyticsIndicators = false;
      // await this.switchAnalyticsIndicators(this.displayAnalyticsIndicators);

      this.displayWhatsappAccountWizard = false;
      this.displayConnectWhatsApp = false;
      await this.switchConnectWhatsApp(this.displayConnectWhatsApp);

      this.displayCreateChatbot = true;
      await this.switchCreateChatbot(this.displayCreateChatbot);

      this.displayInviteTeammate = true
      await this.switchInviteTeammate(this.displayInviteTeammate)

      this.displayKnowledgeBase = false;
      await this.switchyKnowledgeBase(this.displayKnowledgeBase);

      this.displayCustomizeWidget = true;
      await this.switchCustomizeWidget(this.displayCustomizeWidget)


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
      this.logger.log('[HOME] USECASE 3 userHasUnistalledWa', this.userHasUnistalledWa, 'whatsAppIsConnected', this.whatsAppIsConnected)

      // this.displayAnalyticsConvsGraph = false;
      // await this.switchAnalyticsConvsGraph(this.displayAnalyticsConvsGraph);

      // this.displayAnalyticsIndicators = false;
      // await this.switchAnalyticsIndicators(this.displayAnalyticsIndicators);

      if (!this.userHasUnistalledWa && !this.whatsAppIsConnected) {
        this.displayWhatsappAccountWizard = true;
        this.logger.log('[HOME] USECASE 3 displayWhatsappAccountWizard ', this.displayWhatsappAccountWizard)
      }

      this.displayConnectWhatsApp = true;
      await this.switchConnectWhatsApp(this.displayConnectWhatsApp);

      this.displayCreateChatbot = true;
      await this.switchCreateChatbot(this.displayCreateChatbot);

      this.displayInviteTeammate = true
      await this.switchInviteTeammate(this.displayInviteTeammate)

      this.displayKnowledgeBase = true;
      await this.switchyKnowledgeBase(this.displayKnowledgeBase);

      this.displayCustomizeWidget = false;
      await this.switchCustomizeWidget(this.displayCustomizeWidget)

      this.manageWAWizardSteps(project_attributes, 'USECASE 3')
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

      this.logger.log('[HOME] USECASE 4 userHasUnistalledWa', this.userHasUnistalledWa, 'whatsAppIsConnected', this.whatsAppIsConnected)

      // this.displayAnalyticsConvsGraph = false;
      // await this.switchAnalyticsConvsGraph(this.displayAnalyticsConvsGraph);

      // this.displayAnalyticsIndicators = false;
      // await this.switchAnalyticsIndicators(this.displayAnalyticsIndicators);

      if (!this.userHasUnistalledWa && !this.whatsAppIsConnected) {
        this.displayWhatsappAccountWizard = true;
        this.logger.log('[HOME] USECASE 4 displayWhatsappAccountWizard ', this.displayWhatsappAccountWizard)
      }
      this.displayConnectWhatsApp = true;
      await this.switchConnectWhatsApp(this.displayConnectWhatsApp);

      this.displayCreateChatbot = true;
      await this.switchCreateChatbot(this.displayCreateChatbot);

      this.displayInviteTeammate = true;
      await this.switchInviteTeammate(this.displayInviteTeammate);

      this.displayKnowledgeBase = false;
      await this.switchyKnowledgeBase(this.displayKnowledgeBase);

      this.displayCustomizeWidget = false;
      await this.switchCustomizeWidget(this.displayCustomizeWidget)


      this.manageWAWizardSteps(project_attributes, 'USECASE 4')

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
      await this.switchConnectWhatsApp(this.displayConnectWhatsApp);

      this.displayCreateChatbot = true;
      await this.switchCreateChatbot(this.displayCreateChatbot);

      this.displayInviteTeammate = true;
      await this.switchInviteTeammate(this.displayInviteTeammate);

      this.displayKnowledgeBase = true;
      await this.switchyKnowledgeBase(this.displayKnowledgeBase);

      this.displayCustomizeWidget = true;
      await this.switchCustomizeWidget(this.displayCustomizeWidget)

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
      await this.switchConnectWhatsApp(this.displayConnectWhatsApp);

      this.displayCreateChatbot = true;
      await this.switchCreateChatbot(this.displayCreateChatbot);

      this.displayInviteTeammate = true;
      await this.switchInviteTeammate(this.displayInviteTeammate)

      this.displayKnowledgeBase = false;
      await this.switchyKnowledgeBase(this.displayKnowledgeBase);

      this.displayCustomizeWidget = true;
      await this.switchCustomizeWidget(this.displayCustomizeWidget)

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

      if (!this.userHasUnistalledWa && !this.whatsAppIsConnected) {
        this.displayWhatsappAccountWizard = true;
      }

      this.displayConnectWhatsApp = true;
      await this.switchConnectWhatsApp(this.displayConnectWhatsApp);

      this.displayCreateChatbot = true
      await this.switchCreateChatbot(this.displayCreateChatbot)

      this.displayInviteTeammate = true
      await this.switchInviteTeammate(this.displayInviteTeammate)

      this.displayKnowledgeBase = true;
      await this.switchyKnowledgeBase(this.displayKnowledgeBase);

      this.displayCustomizeWidget = false;
      await this.switchCustomizeWidget(this.displayCustomizeWidget)


      this.manageWAWizardSteps(project_attributes, 'USECASE 7')
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


      if (!this.userHasUnistalledWa && !this.whatsAppIsConnected) {
        this.displayWhatsappAccountWizard = true;
      }
      this.displayConnectWhatsApp = true;
      await this.switchConnectWhatsApp(true);

      this.displayCreateChatbot = true
      await this.switchCreateChatbot(this.displayCreateChatbot)

      this.displayInviteTeammate = true
      await this.switchInviteTeammate(this.displayInviteTeammate)

      this.displayKnowledgeBase = false;
      await this.switchyKnowledgeBase(false);

      this.displayCustomizeWidget = false;
      await this.switchCustomizeWidget(false)

      this.manageWAWizardSteps(project_attributes, 'USECASE 8')

    }
  }

  manageWAWizardSteps(project_attributes: any, calledby: string) {

    const waWizardstep1 = project_attributes.wastep1;
    const waWizardstep2 = project_attributes.wastep2;
    const waWizardstep3 = project_attributes.wastep3;

    this.logger.log('[HOME] ', calledby, 'MANAGE WA WIZARD waWizardstep1', waWizardstep1)
    this.logger.log('[HOME] ', calledby, 'MANAGE WA WIZARD waWizardstep2', waWizardstep2)
    this.logger.log('[HOME] ', calledby, 'MANAGE WA WIZARD waWizardstep3', waWizardstep3)
    if (waWizardstep1 === false || waWizardstep1 === undefined) {
      this.chatbotCreated = false
    } else if (waWizardstep1 === true) {
      this.chatbotCreated = true
    }

    if (waWizardstep2 === false || waWizardstep2 === undefined) {
      this.testBotOnWA = false

    } else if (waWizardstep2 === true) {
      this.testBotOnWA = true
    }

    if (waWizardstep3 === false || waWizardstep3 === undefined) {
      this.whatsAppIsConnected = false
    } else if (waWizardstep3 === true) {
      this.whatsAppIsConnected = true
    }
    this.logger.log('[HOME] ', calledby, 'MANAGE WA WIZARD solution_channel ', this.solution_channel_for_child, ' solution ', this.solution_for_child);
    this.logger.log('[HOME] ', calledby, 'MANAGE WA WIZARD chatbotCreated ', this.chatbotCreated);
    this.logger.log('[HOME] ', calledby, 'MANAGE WA WIZARD testBotOnWA ', this.testBotOnWA);
    this.logger.log('[HOME] ', calledby, 'MANAGE WA WIZARD whatsAppIsConnected ', this.whatsAppIsConnected);


    if (waWizardstep1 === true && waWizardstep2 === true && waWizardstep3 === true) {
      this.displayWhatsappAccountWizard = false;
      this.whatsAppIsConnected = true;
    } else if (waWizardstep1 === true && waWizardstep2 === true && waWizardstep3 === false) {
      this.whatsAppIsConnected = false;
      if (project_attributes.wizardCompleted === true) {
        this.displayWhatsappAccountWizard = false;
      }
    }
  }

  // init() {
  //   // this.logger.log("[HOME] > CALLING INIT")
  //   // this.getDeptsByProjectId(); // USED FOR COUNT OF DEPTS FOR THE NEW HOME
  //   // this.getImageStorageThenUserAndBots(); // to comment -> moved in Home Create Chatbot
  //   // this.getLastMounthMessagesCount() // USED TO GET THE MESSAGES OF THE LAST 30 DAYS
  //   // this.getLastMounthRequestsCount(); // USED TO GET THE REQUESTS OF THE LAST 30 DAYS
  //   // this.getActiveContactsCount()  /// COUNT OF ACTIVE CONTACTS FOR THE NEW HOME
  //   // this.getVisitorsCount() /// COUNT OF VISITORS FOR THE NEW HOME
  //   // this.getCountAndPercentageOfRequestsHandledByBotsLastMonth() /// 
  //   // this.getVisitorsByLastNDays(this.selectedDaysId); /// VISITOR GRAPH FOR THE NEW HOME - NOT MORE USED - REPLACED WITH LAST 7 DAYS CONVERSATIONS GRAPH
  //   // this.initDay = moment().subtract(6, 'd').format('D/M/YYYY') /// VISITOR GRAPH FOR THE NEW HOME
  //   // this.endDay = moment().subtract(0, 'd').format('D/M/YYYY') /// VISITOR GRAPH FOR THE NEW HOME
  //   // this.logger.log("INIT", this.initDay, "END", this.endDay); /// VISITOR GRAPH FOR THE NEW HOME
  //   // this.getRequestByLast7Day()

  //   // this.getLast30daysConvsCount();


  // }




  getApps() {
    this.appStoreService.getApps().subscribe((_apps: any) => {
      this.apps = _apps.apps;
      this.logger.log('[HOME] - getApps APPS ', this.apps);
      this.apps.forEach(app => {
        if (app.title === "WhatsApp Business") {

          this.whatsAppAppId = app._id;
          this.logger.log('[HOME] - whatsAppAppId ', this.whatsAppAppId)
          this.installActionType = app.installActionType
          this.logger.log('[HOME] - installActionType ', this.installActionType)

          this.appTitle = app.title;
          this.logger.log('[HOME] - appTitle ', this.appTitle)
          this.appVersion = app.version;
          this.logger.log('[HOME] - appVersion ', this.appVersion)


        }

        // this.logger.log('[HOME] - getApps APPS app ', app)
        if (app && app.version === "v2") {
          if (app.installActionURL === "") {
            // this.logger.log('HOME - getApps APPS app installActionURL', app.installActionURL)
            delete app.installActionURL
          }
        }
      });


    }, (error) => {
      this.logger.error('[HOME] - getApps ERROR  ', error);
      // this.showSpinner = false;
    }, () => {
      this.logger.log('[HOME] getApps * COMPLETE *');
      this.getInstallations().then((res: any) => {

        if (res) {
          this.logger.log("[HOME] getInstallations res: ", res)
          this.logger.log("[HOME] getInstallations - whatsAppIsInstalled ", this.whatsAppIsInstalled)
          this.logger.log("[HOME] getInstallations - solution_channel ", this.solution_channel_for_child)
          this.logger.log('[HOME] getInstallations - whatsAppAppId ', this.whatsAppAppId)
          this.logger.log("[HOME] getInstallations - userHasUnistalledWa ", this.userHasUnistalledWa)
          this.logger.log("[HOME] getInstallations - solution_channel_for_child ", this.solution_channel_for_child)
          if (res.length > 0) {
            this.logger.log("[HOME] USE CASE RES > 0 ", this.solution_channel_for_child)
            const WAInstallationIndex = res.findIndex((e) => e.app_id === this.whatsAppAppId);
            this.logger.log('[HOME] getInstallations WA app index', WAInstallationIndex)
            if (WAInstallationIndex === -1) {
              this.whatsAppIsInstalled = false;
              this.logger.log('HERE YES 1 whatsAppIsInstalled ', this.whatsAppIsInstalled)
              if (this.userHasUnistalledWa === false) {
                this.logger.log("[HOME] getInstallations - userHasUnistalledWa 2 ", this.userHasUnistalledWa)
                if (this.solution_channel_for_child === 'whatsapp_fb_messenger') {

                  this.installApp();

                }
              }
            } else {
              this.logger.log('HERE YES 2 whatsAppIsInstalled ', this.whatsAppIsInstalled)
              this.whatsAppIsInstalled = true


            }
          } else if (res.length === 0) {
            this.whatsAppIsInstalled = false;
            if (this.userHasUnistalledWa === false) {
              if (this.solution_channel_for_child === 'whatsapp_fb_messenger') {
                this.installApp();
              }
            }
          }
        } else {
          this.whatsAppIsInstalled = false;
        }

        // this.showSpinner = false;
      }).catch((err) => {
        this.logger.error("[HOME] getInstallations ERROR: ", err)
        // this.showSpinner = false;
      })

      // this.showSpinner = false;
    });
  }

  getInstallations() {
    let promise = new Promise((resolve, reject) => {
      this.appStoreService.getInstallation(this.projectId).then((res) => {
        //  this.logger.log("[HOME] Get Installation Response: ", res);
        resolve(res);
      }).catch((err) => {
        // this.logger.error("[HOME] Error getting installation: ", err);
        reject(err);
      })
    })
    return promise;
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

  installApp() {
    this.logger.log('[HOME] installApp appTitle ', this.appTitle)
    const isAvailable = this.checkPlan(this.appTitle)
    this.logger.log('[APP-STORE] isAvaibleFromPlan ', isAvailable)
    if (isAvailable === false) {
      return
    }

    this.logger.log('[HOME] appId installApp', this.whatsAppAppId)
    this.logger.log('[HOME] app app version installApp', this.appVersion)
    this.logger.log('[HOME] installationType installApp', this.installActionType);

    this.installV2App(this.projectId, this.whatsAppAppId)

  }


  installV2App(projectId, appId) {
    this.appStoreService.installAppVersionTwo(projectId, appId).subscribe((res: any) => {
      this.logger.log('[HOME] INSTALL V2 APP ', projectId, appId)

    }, (error) => {
      this.logger.error('[HOME] INSTALL V2 APP - ERROR  ', error);
      this.notify.showWidgetStyleUpdateNotification("An error occurred while installing the app", 4, 'report_problem');
    }, () => {
      this.logger.log('[HOME] INSTALL V2 APP - COMPLETE');
      this.trackUserAction({ action: 'Install app', actionRes: null })
      this.whatsAppIsInstalled = true;
      this.logger.log('[HOME] INSTALL V2 APP - COMPLETE > whatsAppIsInstalled ', this.whatsAppIsInstalled);
    });
  }


  onClickOnUnistallApp() {
    this.presentModalConfirmUnistallWatsApp()
  }
  // this.areYouSureMsg
  presentModalConfirmUnistallWatsApp() {
    swal({
      title: "Are you sure",
      text: "The app will be deleted", // this.appWillBeDeletedMsg,
      icon: "warning",
      buttons: ["Cancel", "Delete"],
      dangerMode: true,
    })
      .then((WillDelete) => {
        if (WillDelete) {
          this.logger.log('[HOME] UNINSTALL WA APP - app_id', this.whatsAppAppId);
          this.appStoreService.unistallNewApp(this.projectId, this.whatsAppAppId).subscribe((res: any) => {
            this.logger.log('[HOME] UNINSTALL WA APP - app_id - RES', res);
            if (res.success === true) {
              this.whatsAppIsInstalled = false
              this.displayWhatsappAccountWizard = false
              this.updatedProjectWithUserHasUnistalledWA(true)
            }

          }, (error) => {
            this.logger.error('[HOME] UNINSTALL WA APP - ERROR  ', error);
            this.notify.showWidgetStyleUpdateNotification(this.errorWhileDeletingApp, 4, 'report_problem');
          }, () => {
            this.trackUserAction({ action: 'Uninstall app', actionRes: null })
            // this.logger.log('[HOME] UNINSTALL WA APP * COMPLETE *');
            // swal(this.done_msg + "!", this.appHasBeenDeletedMsg, {
            //   icon: "success",
            // }).then((okpressed) => {

            // });
          });
        } else {
          this.logger.log('[HOME] UNINSTALL WA APP swal WillDelete (else)')
        }
      });
  }

  scrollToChild(el: ElementRef) {
    el.nativeElement.scrollIntoView({ behavior: 'smooth' });

    setTimeout(() => {
      // this.displayWhatsappAccountWizard = false; 
    }, 1500);
  }

  // -------------------------------------------
  // STEP 1
  // -------------------------------------------
  hasCreatedChatbot(event) {
    this.logger.log('[HOME] hasCreatedChatbot  ', event)
    if (event === true) {
      // if (this.chatbotCreated === false) {
      // this.waWizardSteps = [{ step1: true, step2: false, step3: false }]
      // this.upadatedWatsAppWizard(this.waWizardSteps, 'hasCreatedChatbot')
      this.upadatedWatsAppWizardStep1(true, 'hasCreatedChatbot')
      // }
    }
  }

  upadatedWatsAppWizardStep1(step1, calledBy) {
    this.logger.log('upadatedWatsAppWizardStep1 step  1  ', step1)
    this.logger.log('upadatedWatsAppWizardStep1 calledBy', calledBy)
    this.projectService.updateProjectWithWAWizardStep1(step1)
      .subscribe((res: any) => {
        this.logger.log('[HOME] - UPDATE PRJCT WITH WA WIZARD STEP 1 - RES ', res);
      }, error => {
        this.logger.error('[HOME] - UPDATE PRJCT WITH WA WIZARD STEP 1 - ERROR ', error)
      }, () => {
        this.logger.log('[HOME] - UPDATE PRJCT WITH WA WIZARD STEP 1 * COMPLETE *')
      });
  }


  goToCreateChatbot() {
    this.logger.log('[HOME] GO TO CONNECT WA childCreateChatbot', this.childCreateChatbot);
    this.scrollToChild(this.childCreateChatbot)
  }

  botHookedToDefaultDept(event) {
    this.logger.log('[HOME] BOT ID HOOKED TO DEFAULT DEPT', event);
    this.botIdForTestWA = event;
  }

  // -------------------------------------------
  // STEP 2
  // -------------------------------------------
  hasTestedBotOnWa() {
    // this.waWizardSteps = [{ step1: true, step2: true, step3: false }]
    // this.upadatedWatsAppWizard(this.waWizardSteps, 'hasTestedBotOnWa')
    this.upadatedWatsAppWizardStep2(true, 'hasTestedBotOnWa')
  }

  upadatedWatsAppWizardStep2(step2, calledBy) {
    this.logger.log('upadatedWatsAppWizardStep2 step  2  ', step2)
    this.logger.log('upadatedWatsApupadatedWatsAppWizardStep2 Wizard calledBy', calledBy)
    this.projectService.updateProjectWithWAWizardStep2(step2)
      .subscribe((res: any) => {
        this.logger.log('[HOME] - UPDATE PRJCT WITH WA WIZARD STEP 2 - RES ', res);
      }, error => {
        this.logger.error('[HOME] - UPDATE PRJCT WITH WA WIZARD STEP 2 - ERROR ', error)
      }, () => {
        this.logger.log('[HOME] - UPDATE PRJCT WITH WA WIZARD STEPS 2 * COMPLETE *')
      });
  }

  // -------------------------------------------
  // STEP 3
  // -------------------------------------------
  goToConnectWA() {
    this.logger.log('[HOME] GO TO CONNECT WA childWhatsappAccount', this.childWhatsappAccount);
    this.scrollToChild(this.childWhatsappAccount)
  }

  onClickOnGoToLearnMoreOrManageApp() {
    this.logger.log('HAS CLICKED GO TO LEARN MORE OR MANAGE APP whatsAppIsInstalled', this.whatsAppIsInstalled)
    if (this.whatsAppIsInstalled === false) {
      this.goToWhatsAppDetails()
    } else {
      this.openInAppStoreInstall()
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


  goToWhatsAppDetails() {
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

  openInAppStoreInstall() {
    this.logger.log('[HOME] openInAppStoreInstall appTitle ', this.appTitle)
    const isAvailable = this.checkPlanAndPresentModal(this.appTitle)
    this.logger.log('[APP-STORE] isAvaibleFromPlan ', isAvailable)
    if (isAvailable === false) {
      return
    }


    if (this.appTitle === "WhatsApp Business" || this.appTitle === "Facebook Messenger") {
      // this.router.navigate(['project/' + this.projectId + '/app-store-install/' + this.whatsAppAppId + '/connect/h'])
      this.openAppStoreInPopupWindow()
    }
  }



  openAppStoreInPopupWindow() {
    const whatsappUrl = this.appConfigService.getConfig().whatsappApiUrl;

    this.logger.log('[HOME] openAppStoreInPopupWindow whatsappUrl', whatsappUrl)
    this.logger.log('[HOME] openAppStoreInPopupWindow projectId', this.projectId)
    this.logger.log('[HOME] openAppStoreInPopupWindow user', this.user)
    this.logger.log('[HOME] openAppStoreInPopupWindow whatsAppAppId', this.whatsAppAppId)

    // + '&view=popup' // open connection window without link to documentation
    const url = whatsappUrl + '/configure?project_id=' + this.projectId + '&app_id=' + this.whatsAppAppId + '&token=' + this.user.token


    // const testItOutBaseUrl = this.TESTSITE_BASE_URL.substring(0, this.TESTSITE_BASE_URL.lastIndexOf('/'));
    // const testItOutUrl = testItOutBaseUrl + '/chatbot-panel.html'

    // const url = testItOutUrl + '?tiledesk_projectid=' + this.project._id + '&tiledesk_participants=bot_' + this.id_faq_kb + "&tiledesk_departmentID=" + this.defaultDepartmentId + '&td_draft=true'
    let left = (screen.width - 815) / 2;
    let top = (screen.height - 727) / 4;
    let params = `toolbar=no,menubar=no,width=815,height=727,left=${left},top=${top}`;
    let popup = window.open(url, '_blank', params);

    let popupTick = setInterval(() => {
      if (popup.closed) {
        clearInterval(popupTick);
        this.logger.log('window closed!');
        this.getIfWathsAppIsConnectedAndUpdateProject()
      }
    }, 500);
  }

  // ---------------------------------------------------------------------
  // Get WA settings when the winndow "Connect to WA" is closed
  // ---------------------------------------------------------------------
  getIfWathsAppIsConnectedAndUpdateProject() {
    this.projectService.checkWAConnection()
      .subscribe((res: any) => {

        this.logger.log('[HOME] - CHECK-WA-CONNECTION - RES ', res);
        this.logger.log('[HOME] - CHECK-WA-CONNECTION - RES > success', res.success);

        if (res.success === true) {
          this.whatsAppIsConnected = true;
          this.trackUserAction({ action: 'Connect app', actionRes: null })
          // this.presentModalWaSuccessfullyConnected()

          const calledBy = 'connected'
          this.updateProjectWithStep3AndWASettings(res.settings, true, calledBy)
          // this.updateProjectWithHasCompletedWAWizard()

          // this.upadatedWatsAppWizardStep3(true, 'connected')


        } else if (res.success === false) {
          this.whatsAppIsConnected = false;
          // this.waWizardSteps = [{ step1: true, step2: true, step3: false }]
          // this.upadatedWatsAppWizard(this.waWizardSteps, 'checkWAConnection unsuccess')
          // this.oneStepWizard = { watsAppConnected: false }
          // this.upadatedProjectWithOneStepWizard(this.oneStepWizard)

          // this.updateProjectByDeletingWASettings()

          // this.upadatedWatsAppWizardStep3(false, 'disconnected')
          const calledBy = 'disconnected'
          this.updateProjectWithStep3AndRemoveWASettings(false, calledBy)
        }

      }, error => {
        this.logger.error('[HOME] - CHECK-WA-CONNECTION - ERROR ', error)
      }, () => {
        this.logger.log('[HOME] - CHECK-WA-CONNECTION * COMPLETE *')
      });
  }


  updateProjectWithStep3AndWASettings(wasettings, isConnected, calledBy) {
    this.logger.log('[HOME] updateProjectWithWASettings', wasettings)

    this.projectService.updateProjectWithWASettings(wasettings)
      .subscribe((res: any) => {
        this.logger.log('[HOME] - UPDATE PRJCT WITH WA SETTINGS - RES ', res);

        if (res) {
          this.upadatedWatsAppWizardStep3(isConnected, calledBy)
        }

        if (res && res.attributes && res.attributes.wasettings && res.attributes.wasettings.department_id) {
          this.wadepartmentid = res.attributes.wasettings.department_id
          this.getDeptById(this.wadepartmentid)
        }

      }, error => {
        this.logger.error('[HOME] - UPDATE PRJCT WITH WA WSETTINGS  - ERROR ', error)
      }, () => {
        this.logger.log('[HOME] - UPDATE PRJCT WITH WA WSETTINGS * COMPLETE *')
      });
  }


  updateProjectWithStep3AndRemoveWASettings(isConnected, calledBy) {
    this.logger.log('[HOME] - WA W updateProjectByDeletingWASettings');
    this.projectService.updateProjectRemoveWASettings()
      .subscribe((res: any) => {
        this.logger.log('[HOME] - WA W - UPDATE PRJCT WITH WA SETTINGS - RES ', res);

        this.wadepartmentid = undefined
        this.whatsAppIsConnected = false;
        this.waBotId = undefined
        // this.getDeptById(this.wadepartmentid)
        // this.logger.log('[HOME] - UPDATE PRJCT WITH WA WSETTINGS - whatsAppIsConnected ', this.whatsAppIsConnected);

      }, error => {
        this.logger.error('[HOME] - WA W - UPDATE PRJCT WITH WA WSETTINGS  - ERROR ', error)
      }, () => {
        this.logger.log('[HOME] - WA W - UPDATE PRJCT WITH WA WSETTINGS * COMPLETE *')
        this.upadatedWatsAppWizardStep3(isConnected, calledBy)
      });
  }


  upadatedWatsAppWizardStep3(step3, calledBy) {
    this.logger.log('upadatedWatsAppWizardStep3 step  3  ', step3)
    this.logger.log('upadatedWatsAppWizardStep3 calledBy', calledBy)
    this.projectService.updateProjectWithWAWizardStep3(step3)
      .subscribe((res: any) => {
        this.logger.log('[HOME] - WA W - UPDATE PRJCT WITH WA WIZARD STEP 3 - RES ', res);
        if (res && res.attributes && res.attributes) {
          if (res.attributes.wastep3 === false) {
            this.whatsAppIsConnected = false
            // if ((this.solution_channel_for_child === 'whatsapp_fb_messenger') &&
            //   (this.solution_for_child === 'want_to_talk_to_customers') ||
            //   (this.solution_for_child === 'want_to_automate_conversations')) {
            //   this.displayWhatsappAccountWizard = true;
            // }
          }
        }
        this.logger.log('[HOME] - WA W - UPDATE PRJCT WITH WA WIZARD STEP 3 - whatsAppIsConnected ', this.whatsAppIsConnected);

      }, error => {
        this.logger.error('[HOME] - WA W - UPDATE PRJCT WITH WA WIZARD STEP 3 - ERROR ', error)
      }, () => {
        this.logger.log('[HOME] - WA W - UPDATE PRJCT WITH WA WIZARD STEPS 3 * COMPLETE *')

        if (calledBy === 'connected') {
          this.oneStepWizard = { watsAppConnected: true }
          this.upadatedProjectWithWAWizardOnlyOneStep(this.oneStepWizard)
        } else if (calledBy === 'disconnected') {
          this.oneStepWizard = { watsAppConnected: false }
          this.upadatedProjectWithWAWizardOnlyOneStep(this.oneStepWizard)
        }
      });
  }

  upadatedProjectWithWAWizardOnlyOneStep(oneStepWizard) {
    this.logger.log('[HOME] - WA W - upadatedProjectWithOneStepWizard', oneStepWizard)

    this.projectService.updateProjectWithWAOneStepWizard(oneStepWizard)
      .subscribe((res: any) => {
        this.logger.log('[HOME] - WA W - UPDATE PRJCT WITH ONE STEP WIZARD - RES ', res);
        if (res && res.attributes && res.attributes.oneStepWizard) {
          if (res.attributes.oneStepWizard.watsAppConnected === true) {
            this.displayWhatsappAccountWizard = false;
            this.updateProjectWithHasCompletedWAWizard()
          }
          // else if (res.attributes.oneStepWizard.watsAppConnected === false) {
          //   if ((this.solution_channel_for_child === 'whatsapp_fb_messenger') &&
          //     (this.solution_for_child === 'want_to_talk_to_customers') ||
          //     (this.solution_for_child === 'want_to_automate_conversations')) {
          //     this.displayWhatsappAccountWizard = true;
          //   }
          // }
        }

      }, error => {
        this.logger.error('[HOME] - WA W - UPDATE PRJCT WITH ONE STEP WIZARD  - ERROR ', error)
      }, () => {
        this.logger.log('[HOME]  - WA W - UPDATE PRJCT WITH ONE STEP WIZARD * COMPLETE *')
      });
  }
  // /. --- step 3


  presentModalWaSuccessfullyConnected() {
    swal("Good job!", "WhatsApp connected successfully!", "success");
  }


  updateProjectWithHasCompletedWAWizard() {
    this.projectService.updateProjectWithWAWizardCompleted()
      .subscribe((res: any) => {
        this.logger.log('[HOME] - UPDATE PRJCT WITH WA WIZARD COMPLETED - RES ', res);
      }, error => {
        this.logger.error('[HOME] - UPDATE PRJCT WITH WA WIZARD  - ERROR ', error)
      }, () => {
        this.logger.log('[HOME] - UPDATE PRJCT WITH WA WIZARD * COMPLETE *')
      });

  }

  updatedProjectWithUserHasUnistalledWA(hasuninstalled) {
    this.projectService.updateProjectUserHasRemovedWA(hasuninstalled)
      .subscribe((res: any) => {
        this.logger.log('[HOME] - USER HAS UNISTALLED WA - RES ', res);
      }, error => {
        this.logger.error('[HOME] - USER HAS UNISTALLED WA  - ERROR ', error)
      }, () => {
        this.logger.log('[HOME] - USER HAS UNISTALLED WA * COMPLETE *')
      });
  }

  onClickOnDisplayWhatsAppWizard() {

    this.displayWhatsappAccountWizard = true;
    this.userHasClickedDisplayWAWizard = true;
    // this.scrollToChild(this.childWhatsAppWizard)
    // this.scroll.scrollToPosition([0,0]);
    // this.homeBlocks.scrollIntoView();
    const homeBlocksEl = <HTMLElement>document.querySelector('#homeBlocks');
    homeBlocksEl.scrollIntoView({
      behavior: 'smooth'
    });
    this.projectService.updateProjectWithDisplayWAWizard(this.displayWhatsappAccountWizard)
      .subscribe((res: any) => {
        this.logger.log('[HOME] - USER HAS UNISTALLED WA - RES ', res);
      }, error => {
        this.logger.error('[HOME] - USER HAS UNISTALLED WA  - ERROR ', error)
      }, () => {
        this.logger.log('[HOME] - USER HAS UNISTALLED WA * COMPLETE *')
      });
  }


  // -------------------------------
  // NO MORE USED
  // -------------------------------
  upadatedWatsAppWizard(wasteps, calledBy) {
    this.logger.log('upadatedWatsAppWizard calledBy ', calledBy)
    this.logger.log('upadatedWatsAppWizard calledBy', wasteps)
    this.projectService.updateProjectWithWAWizardSteps(wasteps)
      .subscribe((res: any) => {
        this.logger.log('[HOME] - UPDATE PRJCT WITH WA WIZARD STEPS - RES ', res);
        if (res && res.attributes && res.attributes.wastep) {
          if (res.attributes.wastep[0].step3 === false) {
            this.whatsAppIsConnected = false
          } else {
            this.whatsAppIsConnected = true
          }
        }
        this.logger.log('[HOME] - UPDATE PRJCT WITH WA WIZARD STEPS - whatsAppIsConnected ', this.whatsAppIsConnected);


      }, error => {
        this.logger.error('[HOME] - UPDATE PRJCT WITH WA WIZARD STEPS - ERROR ', error)
      }, () => {
        this.logger.log('[HOME] - UPDATE PRJCT WITH WA WIZARD STEPS * COMPLETE *')
      });
  }



  getDeptById(departmentid: string) {

    this.departmentService.getDeptById(departmentid).subscribe((dept: any) => {
      this.logger.log('[HOME]- GET WA DEPT BY ID - RES ', dept);
      this.wadepartmentName = dept.name;
      this.waBotId = dept.id_bot;
      this.logger.log('[HOME]- GET WA DEPT BY ID - RES > dept name ', this.wadepartmentName);
    }, (error) => {
      this.logger.error('[HOME] - GET WA DEPT BY ID - ERROR ', error);

    }, () => {

      this.logger.log('[HOME] - GET WA DEPT BY ID - COMPLETE ');
      this.getBots()
    })
  }

  getBots() {
    this.faqKbService.getFaqKbByProjectId().subscribe((bots: any) => {
      this.logger.log('[USER-SERV] - GET BOT BY PROJECT ID AND SAVE IN STORAGE - bots ', bots);
      if (bots && bots !== null) {

        bots.forEach(bot => {
          this.logger.log('[HOME] - GET BOT BY PROJECT ID  - BOT', bot);
          this.logger.log('[HOME] - GET BOT BY PROJECT ID  - BOT-ID', bot._id);
          if (bot._id === this.waBotId) {
            this.logger.log('[HOME] - BOT CONNECTED WITH WA  - BOT-ID', bot._id);
            this.chatbotConnectedWithWA = true
          }

        });

      }
    }, (error) => {
      this.logger.error('[HOME] - GET BOT BY PROJECT ID  - ERROR ', error);
    }, () => {
      this.logger.log('[HOME] - GET BOT BY PROJECT ID  * COMPLETE');

    });
  }


  getDeptsByProjectId() {
    this.departmentService.getDeptsByProjectId().subscribe((departments: any) => {

      this.logger.log('[BOT-CREATE] ---> ALL DEPTS RES ', departments);

      if (departments) {

        departments.forEach(dept => {
          this.logger.log('[BOT-CREATE] ---> ALL DEPTS RES  > ', dept)
        });

      }
    }, error => {

      this.logger.error('[BOT-CREATE --->  DEPTS RES - ERROR', error);
    }, () => {
      this.logger.log('[BOT-CREATE --->  DEPTS RES - COMPLETE')

    });
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
        confirmButtonColor: "var(--blue-light)",
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

  // No more used - replaced by presentModalFeautureAvailableFromTier2Plan
  presentModalFeautureAvailableFromBPlan() {
    const el = document.createElement('div')
    el.innerHTML = this.featureAvailableFromBPlan
    swal({
      // title: this.onlyOwnerCanManageTheAccountPlanMsg,
      content: el,
      icon: "info",
      // buttons: true,
      buttons: {
        cancel: this.cancel,
        catch: {
          text: this.upgradePlan,
          value: "catch",
        },
      },
      dangerMode: false,
    }).then((value) => {
      if (value === 'catch') {
        // this.logger.log('featureAvailableFromPlanC value', value)
        // this.logger.log('[HOME] prjct_profile_type', this.prjct_profile_type)
        // this.logger.log('[HOME] subscription_is_active', this.subscription_is_active)
        // this.logger.log('[HOME] prjct_profile_type', this.prjct_profile_type)
        // this.logger.log('[HOME] trial_expired', this.trial_expired)
        // this.logger.log('[HOME] isVisiblePAY', this.isVisiblePAY)
        if (this.isVisiblePay) {
          // this.logger.log('[HOME] HERE 1')
          if (this.USER_ROLE === 'owner') {
            // this.logger.log('[HOME] HERE 2')
            if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
              // this.logger.log('[HOME] HERE 3')
              this.notify._displayContactUsModal(true, 'upgrade_plan');
            } else if (this.prjct_profile_type === 'payment' && this.subscription_is_active === true && this.profile_name === PLAN_NAME.A) {
              this.notify._displayContactUsModal(true, 'upgrade_plan');
            } else if (this.prjct_profile_type === 'free' && this.prjct_trial_expired === true) {
              // this.logger.log('[HOME] HERE 4')
              this.router.navigate(['project/' + this.projectId + '/pricing']);
            }
          } else {
            // this.logger.log('[HOME] HERE 5')
            this.presentModalAgentCannotManageAvancedSettings();
          }
        } else {
          // this.logger.log('[HOME] HERE 6')
          this.notify._displayContactUsModal(true, 'upgrade_plan');
        }
      }
    });
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
      confirmButtonColor: "var(--blue-light)",
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
    this.auth.user_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user) => {
        this.logger.log('[HOME] - USER GET IN HOME ', user)
        // tslint:disable-next-line:no-debugger
        // debugger
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
                this.logger.error('identify Home error', err);
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

  // pauseResumeLastUpdateSlider() {
  //   // var slide = document.querySelectorAll('.slide');
  //   // this.logger.log('HOME slide ', slide)
  //   // this.logger.log('HOME slide Array', Array.from(slide)) ;

  //   var slide =   Array.from(document.getElementsByClassName('slide') as HTMLCollectionOf<HTMLElement>)
  //   const slideArray = Array.from(slide)

  //   for (var i = 0; i < slide.length; i++) {
  //     slide[i].onclick = this.toggleAnimation(slide);
  //     slide[i].style.animationPlayState = 'running';
  //   }
  // }

  toggleAnimation(slide) {
    var style;
    for (var i = 0; i < slide.length; i++) {
      style = slide[i].style;
      if (style.animationPlayState === 'running') {
        style.animationPlayState = 'paused';
        document.body.className = 'paused';
      } else {
        style.animationPlayState = 'running';
        document.body.className = '';
      }
    }
  }


  startChabgelogAnimation() {
    // function(t, e, n) {
    // var u = n(62),
    //     c = n(292),
    //     s = document.querySelector("#futureproof figure"),
    //     l = u.a.queryArray(".entries li", s),
    //     f = new c.a({
    //         container: s.querySelector("ul"),
    //         toggleable: [l],
    //         onActivate: function(t) {
    //             var e = this,
    //                 n = this.__toggleable[0][t].offsetHeight;
    //             this.__toggleable[0].forEach(function(r, i) {
    //                 var o = u.a.mod(i - t + 1, e.__itemCount);
    //                 r.className = "card".concat(o);
    //                 var a = n,
    //                     c = 1;
    //                 0 === o ? (a -= 30, c *= 1.07) : 2 === o ? (a += 30, c /= 1.07) : 3 === o ? (a += 60, c /= 1.1449) : 1 !== o && (a += 120, c /= 1.225043), r.style.transform = "translateY(".concat(a, "px) scale(").concat(c, ")")
    //             })
    //         }
    //     })
    //   }

    var a = document.querySelector("#futureproof figure");
    this.logger.log('[HOME] startChabgelogAnimation entriesElme a', a)
    // var b = a.childNodes[1]
    // this.logger.log('HOME entriesElme b ', b)

    var ulEl = a.querySelector("ul")
    this.logger.log('[HOME] startChabgelogAnimation entriesElme ulEl ', ulEl)

    //  var x = ulEl.childNodes
    var liArray = Array.from(ulEl.getElementsByTagName("li"))
    this.logger.log('[HOME] startChabgelogAnimation entriesElme liArray ', liArray)

    this.logger.log('[HOME] startChabgelogAnimation entriesElme typeof liArray  ', typeof liArray)

    // var liElme = entriesElme.getElementsByTagName("li")
    // this.logger.log('HOME liElme ', liElme)

    this.setAttribute(liArray)


  }

  setAttribute(liArray) {
    // liArray.unshift(liArray.pop());
    liArray.forEach((element, index) => {
      this.logger.log('[HOME] startChabgelogAnimation > setAttribute  entriesElme element ', element, ' index ', index)

      element.className = "card" + index;

      if (index === 0) {
        element.setAttribute("style", "transform: translateY(122px) scale(1.07);");
      }

      if (index === 1) {
        element.setAttribute("style", "transform: translateY(152px) scale(1);");
      }
      if (index === 2) {
        element.setAttribute("style", "transform: translateY(182px) scale(0.934579);");
      }

      if (index === 3) {
        element.setAttribute("style", "transform: translateY(237px) scale(0.873439);");
      }

      if (index === 4) {
        element.setAttribute("style", "transform: translateY(297px) scale(0.816298);");

        // this.setAttribute(liArray)
      }

    });
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


  getImageStorageThenUserAndBots() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {

      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[HOME] - IMAGE STORAGE ', this.storageBucket, 'usecase firebase')

      this.getAllUsersOfCurrentProject(this.storageBucket, this.UPLOAD_ENGINE_IS_FIREBASE)  // USED TO DISPLAY THE HUMAN AGENT FOR THE NEW HOME
      this.getAllFaqKbByProjectId(this.storageBucket, this.UPLOAD_ENGINE_IS_FIREBASE) // USED FOR COUNT OF BOTS FOR THE NEW HOME

    } else {

      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.baseUrl = this.appConfigService.getConfig().baseImageUrl;
      this.logger.log('[HOME] - IMAGE STORAGE ', this.baseUrl, 'usecase native')
      this.getAllUsersOfCurrentProject(this.baseUrl, this.UPLOAD_ENGINE_IS_FIREBASE)  // USED TO DISPLAY THE HUMAN AGENT FOR THE NEW HOME
      this.getAllFaqKbByProjectId(this.baseUrl, this.UPLOAD_ENGINE_IS_FIREBASE) // USED FOR COUNT OF BOTS FOR THE NEW HOME
    }

  }

  // USED FOR COUNT OF ACTIVE CONTACTS FOR THE NEW HOME 
  getActiveContactsCount() {
    this.contactsService.getLeadsActive().subscribe((activeleads: any) => {
      this.logger.log('[HOME] - GET ACTIVE LEADS RESPONSE ', activeleads)
      if (activeleads) {

        this.countOfActiveContacts = activeleads['count'];
        this.logger.log('[HOME] - ACTIVE LEADS COUNT ', this.countOfActiveContacts)
      }
    }, (error) => {
      this.logger.error('[HOME] - GET ACTIVE LEADS - ERROR ', error);

    }, () => {
      this.logger.log('[HOME] - GET ACTIVE LEADS * COMPLETE *');
    });
  }

  getLastMounthMessagesCount() {
    this.analyticsService.getLastMountMessagesCount()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((msgscount: any) => {
        this.logger.log('[HOME] - GET LAST 30 DAYS MESSAGE COUNT RES', msgscount);
        if (msgscount && msgscount.length > 0) {
          this.countOfLastMonthMsgs = msgscount[0]['totalCount']
          this.displayAnalyticsIndicators = true

          this.logger.log('[HOME] - GET LAST 30 DAYS MESSAGE COUNT ', this.countOfLastMonthMsgs);
        } else {
          this.countOfLastMonthMsgs = 0;
          this.displayAnalyticsIndicators = false
        }
      }, (error) => {
        this.logger.error('[HOME] - GET LAST 30 DAYS MESSAGE - ERROR ', error);

      }, () => {
        this.logger.log('[HOME] - GET LAST 30 DAYS MESSAGE * COMPLETE *');
      });
  }

  getLastMounthRequestsCount() {
    this.analyticsService.getLastMountConversationsCount()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((convcount: any) => {
        this.logger.log('[HOME] - GET LAST 30 DAYS CONVERSATION COUNT RES', convcount);

        if (convcount && convcount.length > 0) {
          this.countOfLastMonthRequests = convcount[0]['totalCount'];
          this.logger.log('[HOME] - GET LAST 30 DAYS CONVERSATION COUNT ', this.countOfLastMonthRequests);
        } else {
          this.countOfLastMonthRequests = 0;
        }
      }, (error) => {
        this.logger.error('[HOME] - GET LAST 30 DAYS CONVERSATION COUNT - ERROR ', error);

      }, () => {
        this.logger.log('[HOME] - GET LAST 30 DAYS CONVERSATION COUNT * COMPLETE *');
      });
  }

  getVisitorsCount() {
    this.analyticsService.getVisitors()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((visitorcounts: any) => {
        this.logger.log("HOME - GET VISITORS COUNT RES: ", visitorcounts)

        if (visitorcounts && visitorcounts.length > 0) {
          this.countOfVisitors = visitorcounts[0]['totalCount']
          this.logger.log("HOME - GET VISITORS COUNT: ", this.countOfVisitors)
        } else {
          this.countOfVisitors = 0
        }
      }, (error) => {
        this.logger.error('[HOME] - GET VISITORS COUNT - ERROR ', error);

      }, () => {
        this.logger.log('[HOME] - GET VISITORS COUNT * COMPLETE *');
      });
  }

  getCountAndPercentageOfRequestsHandledByBotsLastMonth() {
    this.analyticsService.getRequestsHasBotCount()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((res: any) => {
        this.logger.log("[HOME] - getRequestsHasBotCount GET REQUESTS COUNT HANDLED BY BOT LAST 30 DAYS RES : ", res)

        if (res && res.length > 0) {
          this.countOfLastMonthRequestsHandledByBots = res[0]['totalCount']

        } else {
          this.countOfLastMonthRequestsHandledByBots = 0
        }

        this.logger.log("[HOME] - getRequestsHasBotCount REQUESTS COUNT HANDLED BY BOT LAST 30 DAYS: ", this.countOfLastMonthRequestsHandledByBots)
        this.logger.log("[HOME] - getRequestsHasBotCount REQUESTS COUNT LAST 30 DAYS: ", this.countOfLastMonthRequests);
        // numero di conversazioni gestite da bot / numero di conversazioni totali (già calcolata) * 100

        if (this.countOfLastMonthRequestsHandledByBots > 0 && this.countOfLastMonthRequests) {
          const _percentageOfLastMonthRequestsHandledByBots = (this.countOfLastMonthRequestsHandledByBots / this.countOfLastMonthRequests) * 100
          this.logger.log("[HOME] - getRequestsHasBotCount % COUNT OF LAST MONTH REQUESTS: ", this.countOfLastMonthRequests);
          this.logger.log("[HOME] - getRequestsHasBotCount % REQUESTS HANDLED BY BOT LAST 30 DAYS: ", _percentageOfLastMonthRequestsHandledByBots);
          this.logger.log("[HOME] - getRequestsHasBotCount % REQUESTS HANDLED BY BOT LAST 30 DAYS typeof: ", typeof _percentageOfLastMonthRequestsHandledByBots);
          this.percentageOfLastMonthRequestsHandledByBots = _percentageOfLastMonthRequestsHandledByBots.toFixed(1);
        } else {
          this.percentageOfLastMonthRequestsHandledByBots = 0
        }

      }, (error) => {
        this.logger.error('[HOME] - GET REQUESTS COUNT HANDLED BY BOT LAST 30 DAYS - ERROR ', error);

      }, () => {
        this.logger.log('[HOME] - GET REQUESTS COUNT HANDLED BY BOT LAST 30 DAYS * COMPLETE *');
      });


  }

  // USED TO DISPLAY THE HUMAN AGENT FOR THE NEW HOME
  getAllUsersOfCurrentProject(storage, uploadEngineIsFirebase) {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      this.logger.log('[HOME] - GET PROJECT-USERS BY PROJECT ID ', projectUsers);

      if (projectUsers) {
        this.projectUsers = projectUsers

        // ------------------------
        // CHECK IF USER HAS IMAGE
        // ------------------------
        this.projectUsers.forEach(user => {
          let imgUrl = ''
          if (uploadEngineIsFirebase === true) {
            // this.logger.log('[HOME] - CHECK IF csnUSER HAS IMAGE - UPLOAD ENGINE IS FIREBASE ? ', uploadEngineIsFirebase);
            // ------------------------------------------------------------------------------
            // Usecase uploadEngine Firebase 
            // ------------------------------------------------------------------------------
            imgUrl = "https://firebasestorage.googleapis.com/v0/b/" + storage + "/o/profiles%2F" + user['id_user']['_id'] + "%2Fphoto.jpg?alt=media"

          } else {
            // this.logger.log('[HOME] - CHECK IF USER HAS IMAGE - UPLOAD ENGINE IS FIREBASE ? ', uploadEngineIsFirebase);
            // ------------------------------------------------------------------------------
            // Usecase uploadEngine Native 
            // ------------------------------------------------------------------------------
            imgUrl = storage + "images?path=uploads%2Fusers%2F" + user['id_user']['_id'] + "%2Fimages%2Fthumbnails_200_200-photo.jpg"
          }

          this.checkImageExists(imgUrl, (existsImage) => {
            if (existsImage == true) {
              this.logger.log('[HOME] - IMAGE EXIST X USERS', user);
              user.hasImage = true;
            }
            else {
              this.logger.log('[HOME] - IMAGE NOT EXIST X USERS', user);
              user.hasImage = false;
            }
          });
          let fullname = '';
          if (user && user['id_user'] && user['id_user'].firstname && user['id_user'].lastname) {
            fullname = user['id_user']['firstname'] + ' ' + user['id_user']['lastname']
            user['fullname_initial'] = avatarPlaceholder(fullname);
            user['fillColour'] = getColorBck(fullname)
          } else if (user && user['id_user'] && user['id_user'].firstname) {

            fullname = user['id_user'].firstname
            user['fullname_initial'] = avatarPlaceholder(fullname);
            user['fillColour'] = getColorBck(fullname)
          } else {
            user['fullname_initial'] = 'N/A';
            user['fillColour'] = 'rgb(98, 100, 167)';
          }
        });
      }

    }, error => {
      this.logger.error('[HOME] - GET PROJECT-USERS  - ERROR', error);
    }, () => {
      this.logger.log('[HOME] - GET PROJECT-USERS  - COMPLETE')
    });
  }

  // USED FOR COUNT OF BOTS FOR THE NEW HOME !!!
  getAllFaqKbByProjectId(storage, uploadEngineIsFirebase) {
    this.faqKbService.getAllBotByProjectId().subscribe((faqKb: any) => {
      this.logger.log('[HOME] - GET FAQKB RES', faqKb);
      if (faqKb) {

        // -----------------------------------------------------------
        // CHECK IF USER HAS IMAGE (AFTER REMOVING THE "IDENTITY BOT")
        // -----------------------------------------------------------
        faqKb.forEach(bot => {
          this.logger.log('[HOME] - GET FAQKB forEach bot: ', bot)

          if (bot && bot['type'] === "identity") {

            const index = faqKb.indexOf(bot);
            this.logger.log('[HOME] - GET FAQKB INDEX OF IDENTITY BOT', index);
            if (index > -1) {
              faqKb.splice(index, 1);
            }
          }
          let imgUrl = ''
          if (uploadEngineIsFirebase === true) {

            // this.logger.log('[HOME] - CHECK IF BOT HAS IMAGE - USECASE UPLOAD-ENGINE FIREBASE ');
            // ------------------------------------------------------------------------------
            // Usecase uploadEngine Firebase 
            // ------------------------------------------------------------------------------
            imgUrl = "https://firebasestorage.googleapis.com/v0/b/" + storage + "/o/profiles%2F" + bot['_id'] + "%2Fphoto.jpg?alt=media"

          } else {
            // this.logger.log('[HOME] - CHECK IF BOT HAS IMAGE - USECASE UPLOAD-ENGINE NATIVE ');
            // ------------------------------------------------------------------------------
            // Usecase uploadEngine Native 
            // ------------------------------------------------------------------------------
            imgUrl = storage + "images?path=uploads%2Fusers%2F" + bot['_id'] + "%2Fimages%2Fthumbnails_200_200-photo.jpg"
          }
          this.checkImageExists(imgUrl, (existsImage) => {
            if (existsImage == true) {
              this.logger.log('[HOME] - IMAGE EXIST X bot', bot);
              bot.hasImage = true;
            }
            else {
              this.logger.log('[HOME] - IMAGE NOT EXIST X bot', bot);
              bot.hasImage = false;
            }
          });
        });
        this.chatbots = faqKb;
        this.logger.log('[HOME] - GET FAQKB RES this.chatbots', this.chatbots);

        // this.countOfBots = faqKb.length;
        // this.logger.log('HOME - GET FAQKB RES', this.countOfBots);
      }
    }, (error) => {
      this.logger.error('[HOME] - GET FAQKB - ERROR ', error);

    }, () => {
      this.logger.log('[HOME] - GET FAQKB * COMPLETE *');
    });
  }

  checkImageExists(imageUrl, callBack) {
    var imageData = new Image();
    imageData.onload = function () {
      callBack(true);
    };
    imageData.onerror = function () {
      callBack(false);
    };
    imageData.src = imageUrl;
  }


  getChatUrl() {
    this.CHAT_BASE_URL = this.appConfigService.getConfig().CHAT_BASE_URL;
    this.logger.log('[HOME] AppConfigService getAppConfig CHAT_BASE_URL', this.CHAT_BASE_URL);
  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    // this.logger.log('[HOME] AppConfigService getAppConfig public_Key', this.public_Key);
    let keys = this.public_Key.split("-");
    // this.logger.log('[HOME] PUBLIC-KEY keys', keys)
    keys.forEach(key => {
      // this.logger.log('[HOME] public_Key key', key)
      if (key.includes("PAY")) {
        // this.logger.log('[HOME] PUBLIC-KEY - key', key);
        let pay = key.split(":");
        // this.logger.log('[HOME] PUBLIC-KEY - pay key&value', pay);
        if (pay[1] === "F") {
          this.isVisiblePay = false;
          //  this.logger.log('[HOME] PUBLIC-KEY - this.isVisiblePay', this.isVisiblePay);
        } else {
          this.isVisiblePay = true;
          // this.logger.log('[HOME] PUBLIC-KEY - this.isVisiblePay', this.isVisiblePay);
        }
      }
      if (key.includes("ANA")) {
        // this.logger.log('[HOME] PUBLIC-KEY - key', key);
        let ana = key.split(":");
        // this.logger.log('[HOME] PUBLIC-KEY - ana key&value', ana);

        if (ana[1] === "F") {
          this.isVisibleANA = false;
          // this.logger.log('[HOME] PUBLIC-KEY - ana isVisible', this.isVisibleANA);
        } else {
          this.isVisibleANA = true;
          // this.logger.log('[HOME] PUBLIC-KEY - ana isVisible', this.isVisibleANA);
        }
      }

      if (key.includes("APP")) {
        // this.logger.log('[HOME] PUBLIC-KEY - key', key);
        let lbs = key.split(":");
        // this.logger.log('[HOME] PUBLIC-KEY - app key&value', lbs);

        if (lbs[1] === "F") {
          this.isVisibleAPP = false;
          // this.logger.log('[HOME] PUBLIC-KEY - app isVisible', this.isVisibleAPP);
        } else {
          this.isVisibleAPP = true;
          // this.logger.log('[HOME] PUBLIC-KEY - app isVisible', this.isVisibleAPP);
        }
      }

      if (key.includes("OPH")) {
        // this.logger.log('[HOME] PUBLIC-KEY - key', key);
        let oph = key.split(":");
        // this.logger.log('[HOME] PUBLIC-KEY - oph key&value', oph);

        if (oph[1] === "F") {
          this.isVisibleOPH = false;
          // this.logger.log('[HOME] PUBLIC-KEY - oph isVisible', this.isVisibleOPH);
        } else {
          this.isVisibleOPH = true;
          // this.logger.log('[HOME] PUBLIC-KEY - oph isVisible', this.isVisibleOPH);
        }
      }

      if (key.includes("HPB")) {
        // this.logger.log('[HOME] PUBLIC-KEY - key', key);
        let hpb = key.split(":");
        // this.logger.log('[HOME] PUBLIC-KEY - oph key&value', oph);

        if (hpb[1] === "F") {
          this.isVisibleHomeBanner = false;
          // this.logger.log('[HOME] PUBLIC-KEY - oph isVisible', this.isVisibleOPH);
        } else {
          this.isVisibleHomeBanner = true;
          // this.logger.log('[HOME] PUBLIC-KEY - oph isVisible', this.isVisibleOPH);
        }
      }

      if (key.includes("PPB")) {
        // this.logger.log('PUBLIC-KEY (HOME) - key', key);
        let ppb = key.split(":");
        // this.logger.log('PUBLIC-KEY (HOME) - ppb key&value', ppb);

        if (ppb[1] === "F") {
          this.project_plan_badge = false;
          // this.logger.log('PUBLIC-KEY (HOME) - project plan badge is', this.project_plan_badge);
        } else {
          this.project_plan_badge = true;
          // this.logger.log('PUBLIC-KEY (HOME) - project plan badge is', this.project_plan_badge);
        }
      }

      if (key.includes('KNB')) {
        let knb = key.split(':')
        if (knb[1] === 'F') {
          this.isVisibleKNB = false;
        } else {
          this.isVisibleKNB = true;
          this.getProjectPlan()
        }
      }


    });

    if (!this.public_Key.includes("ANA")) {
      // this.logger.log('[HOME] PUBLIC-KEY - key.includes("V1L")', this.public_Key.includes("ANA"));
      this.isVisibleANA = false;
    }

    if (!this.public_Key.includes("APP")) {
      // this.logger.log('[HOME] PUBLIC-KEY - key.includes("APP")', this.public_Key.includes("APP"));
      this.isVisibleAPP = false;
    }

    if (!this.public_Key.includes("OPH")) {
      // this.logger.log('[HOME] PUBLIC-KEY - key.includes("OPH")', this.public_Key.includes("OPH"));
      this.isVisibleOPH = false;
    }

    if (!this.public_Key.includes("HPB")) {
      // this.logger.log('[HOME] PUBLIC-KEY - key.includes("OPH")', this.public_Key.includes("OPH"));
      this.isVisibleHomeBanner = false;
    }

    if (!this.public_Key.includes("PPB")) {
      // this.logger.log('PUBLIC-KEY (HOME) - key.includes("PPB")', this.public_Key.includes("PPB"));
      this.project_plan_badge = false;
    }

    if (!this.public_Key.includes("PAY")) {
      // this.logger.log('PUBLIC-KEY (HOME) - key.includes("PPB")', this.public_Key.includes("PPB"));
      this.isVisiblePay = false;
    }

    if (!this.public_Key.includes('KNB')) {
      this.isVisibleKNB = false
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
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
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
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
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
    const hasKeyPromoBannerUrl = this.appConfigService.getConfig().hasOwnProperty('promoBannerUrl');
    this.logger.log('HOME CHECK PROMO URL promoUrl - env hasKeyPromoBannerUrl', hasKeyPromoBannerUrl)
    if (hasKeyPromoBannerUrl) {
      for (const [key, value] of Object.entries(this.appConfigService.getConfig())) {
        // this.logger.log(`${key}: ${value}`);
        if (key === 'promoBannerUrl' && value === '') {
          this.logger.log('HOME CHECK PROMO URL promoUrl - exist key but value is empty value', value)
          this.isVisibleHomeBanner = false;
        } else if (key === 'promoBannerUrl' && value !== '') {
          this.logger.log('HOME CHECK PROMO URL promoUrl - exist key', key, 'and value', value)
          this.isVisibleHomeBanner = true;
        }
      }
    } else {
      this.logger.log('HOME CHECK PROMO URL promoUrl - env NOT HAS hasKeyPromoBannerUrl', hasKeyPromoBannerUrl)
      this.isVisibleHomeBanner = false;
    }
  }

  showPromoBanner() {
    this.isVisibleHomeBanner = false;
    this.logger.log('[HOME] isVisibleHomeBanner', this.isVisibleHomeBanner);
  }


  // getLast30daysConvsCount() {
  //   this.analyticsService.requestsByDay(30)
  //     .pipe(
  //       takeUntil(this.unsubscribe$)
  //     )
  //     .subscribe((convslast30: any) => {
  //       this.logger.log('[HOME] - GET LAST 30 DAYS CONVS ', convslast30);
  //       let count = 0;
  //       convslast30.forEach(conv => {
  //         this.logger.log('[HOME] - GET LAST 30 DAYS CONV COUNT ', conv.count);
  //         count = count + conv.count
  //       });

  //       this.logger.log('[HOME] - GET LAST 30 DAYS CONV TOTAL ', count);
  //       if (count === 0) {
  //         // this.displayAnalyticsConvsGraph = false
  //       } else if (count > 0) {
  //         // this.displayAnalyticsConvsGraph = true
  //       }


  //     }, (error) => {
  //       this.logger.error('[HOME] GET LAST 30 DAYS CONVS - ERROR ', error);
  //     }, () => {
  //       this.logger.log('[HOME] GET LAST 30 DAYS CONVS * COMPLETE *');
  //     });
  // }

  // OLD - NOW NOT WORKS
  // getVisitorCounter() {
  //   this.departmentService.getVisitorCounter()
  //     .subscribe((visitorCounter: any) => {
  //       this.logger.log('[HOME] getVisitorCounter : ', visitorCounter);

  //       // x test
  //       // const visitorCounter = [{ "_id": "5cd2ff0492424372bfa33574", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://www.tiledesk.com", "__v": 0, "createdAt": "2019-05-08T16:08:36.085Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-11-12T16:24:50.764Z", "totalViews": 12564 }, { "_id": "5cd313cc92424372bfa6fad2", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://www.tiledesk.com", "__v": 0, "createdAt": "2019-05-08T17:37:16.872Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-11-08T03:14:10.802Z", "totalViews": 108 }, { "_id": "5cd317e492424372bfa7baad", "id_project": "5ad5bd52c975820014ba900a", "origin": null, "__v": 0, "createdAt": "2019-05-08T17:54:44.273Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-11-11T23:04:26.285Z", "totalViews": 567 }, { "_id": "5cd3187492424372bfa7d4b4", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://testwidget.tiledesk.com", "__v": 0, "createdAt": "2019-05-08T17:57:08.426Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-11-11T14:43:27.804Z", "totalViews": 47 }, { "_id": "5cd3188292424372bfa7d694", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://support.tiledesk.com", "__v": 0, "createdAt": "2019-05-08T17:57:22.763Z", "path": "/5ad5bd52c975820014ba900a/departments/allstatus", "updatedAt": "2019-10-18T10:24:28.260Z", "totalViews": 608 }, { "_id": "5cd37ce592424372bfb4f18c", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://tiledesk.com", "__v": 0, "createdAt": "2019-05-09T01:05:41.918Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-10-31T15:29:55.687Z", "totalViews": 8 }, { "_id": "5cd5a42392424372bffcf279", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://codingpark.com", "__v": 0, "createdAt": "2019-05-10T16:17:39.561Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-05-12T04:30:49.985Z", "totalViews": 7 }, { "_id": "5cda868492424372bfa41f87", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://edit.tiledesk.com", "__v": 0, "createdAt": "2019-05-14T09:12:36.334Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-11-11T14:34:01.768Z", "totalViews": 627 }, { "_id": "5cdbdc5092424372bfd446ed", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://localhost:4200", "__v": 0, "createdAt": "2019-05-15T09:30:56.291Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-07-08T15:18:49.783Z", "totalViews": 669 }, { "_id": "5ce3d37e92424372bff07234", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://s3.eu-west-1.amazonaws.com", "__v": 0, "createdAt": "2019-05-21T10:31:26.193Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-05-21T11:41:47.565Z", "totalViews": 4 }, { "_id": "5ce3ee6692424372bff47a01", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://support-pre.tiledesk.com", "__v": 0, "createdAt": "2019-05-21T12:26:14.830Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-09-03T09:52:03.442Z", "totalViews": 29 }, { "_id": "5ce5532492424372bf26422f", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://localhost:8000", "__v": 0, "createdAt": "2019-05-22T13:48:20.153Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-05-22T15:10:52.097Z", "totalViews": 4 }, { "_id": "5cea371792424372bfcdf00f", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://evil.com/", "__v": 0, "createdAt": "2019-05-26T06:49:59.238Z", "path": "/5ad5bd52c975820014ba900a/departments/allstatus", "updatedAt": "2019-07-20T06:11:47.539Z", "totalViews": 4 }, { "_id": "5cee342c92424372bf5f5ea3", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://testwidget.tiledesk.it", "__v": 0, "createdAt": "2019-05-29T07:26:36.984Z", "path": "/5ad5bd52c975820014ba900a/departments/5b8eb4955ca4d300141fb2cc/operators", "updatedAt": "2019-05-29T07:27:10.327Z", "totalViews": 3 }, { "_id": "5cf072d392424372bfb993d7", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://importchinaproducts.com", "__v": 0, "createdAt": "2019-05-31T00:18:27.503Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-11-03T22:52:21.678Z", "totalViews": 27 }, { "_id": "5cf0892292424372bfbbfcc7", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://importchinaproducts.com", "__v": 0, "createdAt": "2019-05-31T01:53:38.809Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-11-09T14:02:29.505Z", "totalViews": 18 }, { "_id": "5cf64fdf92424372bf9137d0", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://54.37.234.246:1111", "__v": 0, "createdAt": "2019-06-04T11:02:55.936Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-06-14T18:49:33.847Z", "totalViews": 49 }, { "_id": "5cf8d08b1caa8022ad5248e2", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://www.importchinaproducts.com", "__v": 0, "createdAt": "2019-06-06T08:36:27.328Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-10-28T08:37:36.711Z", "totalViews": 7 }, { "_id": "5cfa4eff1caa8022ad8fbc5f", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://54.37.225.206:4300", "__v": 0, "createdAt": "2019-06-07T11:48:15.191Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-06-10T05:58:55.933Z", "totalViews": 26 }, { "_id": "5cfa9c7d1caa8022ad9e40e1", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://vps695843.ovh.net:4300", "__v": 0, "createdAt": "2019-06-07T17:18:53.536Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-06-07T17:18:53.536Z", "totalViews": 1 }, { "_id": "5cfe93281caa8022ad2bbebf", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://widget.kobs.pl", "__v": 0, "createdAt": "2019-06-10T17:28:08.213Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-06-10T17:46:51.521Z", "totalViews": 6 }, { "_id": "5cfe96c91caa8022ad2c850a", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://panel.kobs.pl", "__v": 0, "createdAt": "2019-06-10T17:43:37.206Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-06-17T05:51:44.478Z", "totalViews": 189 }, { "_id": "5cfed7fc1caa8022ad37ff73", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://localhost:8080", "__v": 0, "createdAt": "2019-06-10T22:21:48.300Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-06-10T22:21:50.845Z", "totalViews": 2 }, { "_id": "5d14ead832da4a99f4209603", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://translate.googleusercontent.com", "__v": 0, "createdAt": "2019-06-27T16:12:08.146Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-06-27T16:12:52.926Z", "totalViews": 3 }, { "_id": "5d1ed5de32da4a99f4bdc056", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://localhost", "__v": 0, "createdAt": "2019-07-05T04:45:18.031Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-07-11T08:25:47.008Z", "totalViews": 168 }, { "_id": "5d1f030932da4a99f4c3bc4b", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://192.168.1.137", "__v": 0, "createdAt": "2019-07-05T07:58:01.426Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-07-05T07:58:01.426Z", "totalViews": 1 }, { "_id": "5db2e17b6b2dfaad7c1f1962", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://localhost:3000", "__v": 0, "createdAt": "2019-10-25T11:50:19.452Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-10-30T12:17:18.155Z", "totalViews": 15 }, { "_id": "5db30c036b2dfaad7c269761", "id_project": "5ad5bd52c975820014ba900a", "origin": "null", "__v": 0, "createdAt": "2019-10-25T14:51:47.062Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-10-25T14:52:03.462Z", "totalViews": 2 }, { "_id": "5db314186b2dfaad7c281712", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://www.frontiere21.it", "__v": 0, "createdAt": "2019-10-25T15:26:16.834Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-10-25T15:51:49.450Z", "totalViews": 11 }, { "_id": "5dc92fb73b1c8559fb6c3cc6", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://egov2-dev.comune.bari.it:3000", "__v": 0, "createdAt": "2019-11-11T09:53:59.339Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-11-11T09:53:59.339Z", "totalViews": 1 }, { "_id": "5dc9714e3b1c8559fb79445a", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://baribot.herokuapp.com", "__v": 0, "createdAt": "2019-11-11T14:33:50.123Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-11-11T14:34:18.612Z", "totalViews": 2 }]
  //       this.logger.log('[HOME] getVisitorCounter length : ', visitorCounter.length);
  //       if (visitorCounter && visitorCounter.length > 0) {
  //         let count = 0;
  //         visitorCounter.forEach(visitor => {
  //           this.logger.log('[HOME] getVisitorCounter visitor origin ', visitor.origin);
  //           if (
  //             visitor.origin !== "https://s3.eu-west-1.amazonaws.com" &&
  //             visitor.origin !== "http://testwidget.tiledesk.it" &&
  //             visitor.origin !== "http://testwidget.tiledesk.com" &&
  //             visitor.origin !== "https://support.tiledesk.com" &&
  //             visitor.origin !== null &&
  //             visitor.origin !== 'null' &&
  //             visitor.origin !== "http://evil.com/"
  //           ) {

  //             count = count + 1;
  //             this.logger.log('[HOME] getVisitorCounter the origin ', visitor.origin, ' is != of test-site and is != of support-tiledesk and is != of null ', count);
  //             // this.logger.log('getVisitorCounter ORIGIN != TEST-SITE AND != SUPPORT-TILEDESK »» HAS INSTALLED');
  //           } else {
  //             this.logger.log('[HOME] getVisitorCounter the origin ', visitor.origin, ' is = of test-site or is = support-tiledesk or is = null');
  //           }
  //         });

  //         if (count === 0) {
  //           // this.notify.presentModalInstallTiledeskModal()
  //           this.logger.log('[HOME] getVisitorCounter count', count, '!!!');

  //         }

  //       } else {
  //         this.logger.log('[HOME] getVisitorCounter length : ', visitorCounter.length);
  //         this.logger.log('[HOME] getVisitorCounter VISITOR COUNTER IS O »» HAS NOT INSTALLED');
  //         // this.notify.presentModalInstallTiledeskModal() 
  //         //  this.notify.showNotificationInstallWidget(`${this.installWidgetText} <span style="color:#ffffff; display: inline-block; max-width: 100%;"> Nicola </span>`, 0, 'info');

  //       }
  //     }, (error) => {
  //       this.logger.error('[HOME] getVisitorCounter ERROR ', error);
  //     }, () => {
  //       this.logger.log('[HOME] getVisitorCounter * COMPLETE *');
  //     });
  // }


  getBrowserLanguage() {
    this.browserLang = this.translate.getBrowserLang();
    this.logger.log('[HOME] BRS-LANG (USED FOR SWITCH MONTH NAME)', this.browserLang)


    this.switchMonthName(); /// VISITOR GRAPH FOR THE NEW NOME
  }
  switchMonthName() {
    if (this.browserLang) {
      if (this.browserLang === 'it') {
        this.monthNames = { '1': 'Gen', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'Mag', '6': 'Giu', '7': 'Lug', '8': 'Ago', '9': 'Set', '10': 'Ott', '11': 'Nov', '12': 'Dic' }
      } else {
        this.monthNames = { '1': 'Jan', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'May', '6': 'Jun', '7': 'Jul', '8': 'Aug', '9': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' }
      }
    }
  }




  // IS USED TO GET THE PROJECT-USER AND DETERMINE IF THE USER IS AVAILAVLE/UNAVAILABLE WHEN THE USER ENTER IN HOME
  // (GET THE PROJECT-USER CAN NOT BE DONE IN THE SIDEBAR BECAUSE WHEN THE PROJECT
  // IS SELECTED THE SIDEBAR HAS BEEN ALREADY CALLED)
  // *** NOTE: THE SAME CALLBACK IS RUNNED IN THE SIDEBAR.COMP ***
  getProjectUser() {
    this.logger.log('[HOME] CALL GET-PROJECT-USER')
    this.usersService.getProjectUserByUserId(this.user._id).subscribe((projectUser: any) => {
      this.logger.log('[HOME] PROJECT-USER GET BY PROJECT-ID & CURRENT-USER-ID ', projectUser)
      if (projectUser) {
        this.logger.log('[HOME] PROJECT-USER ID ', projectUser[0]._id)
        this.logger.log('[HOME] USER IS AVAILABLE ', projectUser[0].user_available)
        this.logger.log('[HOME] USER IS BUSY ', projectUser[0].isBusy)
        // this.user_is_available_bs = projectUser.user_available;

        if (projectUser[0].user_available !== undefined) {
          this.usersService.user_availability(projectUser[0]._id, projectUser[0].user_available, projectUser[0].isBusy, projectUser[0]);
        }
        if (projectUser[0].role !== undefined) {
          this.logger.log('!!! »»» HOME GET THE USER ROLE FOR THE PROJECT »»', this.projectId, '»»» ', projectUser[0].role);

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

  // Not used
  goToSubscriptionOrOpenModalSubsExpired() {
    this.logger.log('[HOME] goToSubscriptionOrOpenModalSubsExpired')

    if (this.USER_ROLE === 'owner') {
      if (this.prjct_profile_type === 'free') {

        // this.router.navigate(['project/' + this.projectId + '/pricing']);
        this.router.navigate(['project/' + this.projectId + '/project-settings/payments']);

      } else if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {

        if (this.profile_name !== PLAN_NAME.C && this.profile_name !== PLAN_NAME.F) {
          this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);

        } else if (this.profile_name === PLAN_NAME.C || this.profile_name === PLAN_NAME.F) {

          this.notify.displayEnterprisePlanHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
        }
      } else if (this.prjct_profile_type === 'payment' && this.subscription_is_active === true) {
        this.router.navigate(['project/' + this.projectId + '/project-settings/payments']);
      }

    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan();
    }
  }

  presentModalOnlyOwnerCanManageTheAccountPlan() {
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyOwnerCanManageTheAccountPlanMsg, this.learnMoreAboutDefaultRoles)
  }

  goToProjectSettingsGeneral() {
    if (this.USER_ROLE === 'owner') {
      this.router.navigate(['project/' + this.projectId + '/project-settings/general']);
    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan()
    }
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

  // TEST FUNCTION : GET ALL AVAILABLE PROJECT USER
  getAvailableProjectUsersByProjectId() {
    this.logger.log('[HOME] ... CALLING GET AVAILABLE PROJECT USERS')
    this.usersService.getAvailableProjectUsersByProjectId().subscribe((available_project) => {
      this.logger.log('[HOME]  »»»»»»» AVAILABLE PROJECT USERS ', available_project)
    })
  }





  // <!-- RESOUCES (link renamed in WIDGET) -->
  goToResources() {
    // this.router.navigate(['project/' + this.projectId + '/resources']);
    this.router.navigate(['project/' + this.projectId + '/widget']);
  }
  goToRequests() {
    this.router.navigate(['project/' + this.projectId + '/wsrequests']);
  }

  goToAnalytics() {
    this.router.navigate(['project/' + this.projectId + '/analytics']);
  }

  // test link
  goToAnalyticsStaticPage() {
    this.router.navigate(['project/' + this.projectId + '/analytics-demo']);
  }

  // test link
  goToActivitiesStaticPage() {
    this.router.navigate(['project/' + this.projectId + '/activities-demo']);
  }

  // test link
  goToHoursStaticPage() {
    this.router.navigate(['project/' + this.projectId + '/hours-demo']);
  }

  // test link
  goToPricing() {
    this.router.navigate(['project/' + this.projectId + '/pricing']);
  }


  goToOperatingHours() {
    this.router.navigate(['project/' + this.projectId + '/hours']);
  }

  goToMessagesAnalytics() {
    // this.router.navigate(['project/' + this.projectId + '/messages-analytics']);
    if (this.USER_ROLE !== 'agent') {
      this.router.navigate(['project/' + this.projectId + '/analytics/metrics/messages']);
    }
  }

  goToVisitorsAnalytics() {
    if (this.USER_ROLE !== 'agent') {
      this.router.navigate(['project/' + this.projectId + '/analytics/metrics/visitors']);
    }
  }

  // Analytics > Metrics > Conversation
  goToRequestsAnalytics() {
    // this.router.navigate(['project/' + this.projectId + '/conversation-analytics']);
    if (this.USER_ROLE !== 'agent') {
      this.router.navigate(['project/' + this.projectId + '/analytics/metrics']);
    }
  }

  goToContacts() {
    this.router.navigate(['project/' + this.projectId + '/contacts']);
  }

  goToBotsList() {
    this.router.navigate(['project/' + this.projectId + '/bots']);
  }

  goToUsersList() {
    this.router.navigate(['project/' + this.projectId + '/users']);
  }

  goToWidgetSetup() {
    this.router.navigate(['project/' + this.projectId + '/widget-set-up']);
  }
  goToWidgetConversations() {
    this.router.navigate(['project/' + this.projectId + '/wsrequests']);
  }

  goToWidgetHistory() {
    this.router.navigate(['project/' + this.projectId + '/history']);
  }

  goToAppStore() {
    this.router.navigate(['project/' + this.projectId + '/app-store']);
  }



  goToBotProfile(bot: FaqKb) {
    let botType = ''
    if (bot.type === 'internal') {
      botType = 'native'
      if (this.USER_ROLE !== 'agent') {
        this.router.navigate(['project/' + this.project._id + '/bots/intents/', bot._id, botType]);
      }
    } else if (bot.type === 'tilebot') {
      botType = 'tilebot'
      if (this.USER_ROLE !== 'agent') {
        // this.router.navigate(['project/' + this.project._id + '/tilebot/intents/', bot_id, botType]);
        // this.router.navigate(['project/' + this.project._id + '/cds/', bot._id, 'intent', '0']);
        goToCDSVersion(this.router, bot, this.project._id, this.appConfigService.getConfig().cdsBaseUrl)
      }
    } else if (bot.type === 'tiledesk-ai') {
      botType = 'tiledesk-ai'
      if (this.USER_ROLE !== 'agent') {
        // this.router.navigate(['project/' + this.project._id + '/tilebot/intents/', bot_id, botType]);
        // this.router.navigate(['project/' + this.project._id + '/cds/', bot._id, 'intent', '0']);
        goToCDSVersion(this.router, bot, this.project._id, this.appConfigService.getConfig().cdsBaseUrl)
      }
    } else {
      botType = bot.type

      if (this.USER_ROLE !== 'agent') {
        this.router.navigate(['project/' + this.projectId + '/bots', bot._id, botType]);
      }
    }

  }

  goToAgentProfile(member_id) {
    this.logger.log('[HOME] - goToAgentProfile (AFTER GETTING PROJECT USER ID) ', member_id)
    // this.router.navigate(['project/' + this.projectId + '/member/' + member_id]);

    this.getProjectuserbyUseridAndGoToEditProjectuser(member_id);
  }



  // SERVED_BY: add this if not exist -->
  getProjectuserbyUseridAndGoToEditProjectuser(member_id: string) {
    this.usersService.getProjectUserByUserId(member_id)
      .subscribe((projectUser: any) => {
        this.logger.log('[HOME] - GET projectUser by USER-ID ', projectUser)
        if (projectUser) {
          this.logger.log('[HOME] - GET projectUser > projectUser id', projectUser[0]._id);

          this.router.navigate(['project/' + this.projectId + '/user/edit/' + projectUser[0]._id]);
        }
      }, (error) => {
        this.logger.error('[HOME] - GET projectUser by USER-ID - ERROR ', error);
      }, () => {
        this.logger.log('[HOME] - GET projectUser by USER-ID * COMPLETE *');
      });
  }



  // openChat() {
  //   // const url = this.CHAT_BASE_URL;
  //   this.notify.publishHasClickedChat(true);
  //   // window.open(url, '_blank');

  //   // --- new
  //   localStorage.setItem('last_project', JSON.stringify(this.current_prjct))
  //   let baseUrl = this.CHAT_BASE_URL + '#/conversation-detail/'
  //   let url = baseUrl
  //   const myWindow = window.open(url, '_self', 'Tiledesk - Open Source Live Chat');
  //   myWindow.focus();
  //   // const chatTabCount = localStorage.getItem('tabCount');
  //   // this.logger.log('[HOME] openChat chatTabCount ', chatTabCount);
  //   // if (chatTabCount) {
  //   //   if (+chatTabCount > 0) {
  //   //     this.logger.log('[HOME] openChat chatTabCount > 0 ')

  //   //     this.openWindow('Tiledesk - Open Source Live Chat', url + '?conversation_detail');
  //   //     // this.focusWin('Tiledesk - Open Source Live Chat')
  //   //     // window.open('Tiledesk - Open Source Live Chat', url).focus();
  //   //   } else if (chatTabCount && +chatTabCount === 0) {
  //   //     this.openWindow('Tiledesk - Open Source Live Chat', url);
  //   //   }
  //   // } else {
  //   //   this.openWindow('Tiledesk - Open Source Live Chat', url);
  //   // }

  // }

  openWindow(winName: any, winURL: any) {
    const myWindows = new Array();
    if (myWindows[winName] && !myWindows[winName].closed) {
      alert('window already exists');
    } else {
      myWindows[winName] = window.open(winURL, winName);
    }
  }

  focusWin(winName: any) {
    const myWindows = new Array();
    if (myWindows[winName] && !myWindows[winName].closed) {
      myWindows[winName].focus();
    } else {
      // alert('cannot focus closed or nonexistant window');
      this.logger.log('[HOME] - cannot focus closed or nonexistant window');
    }
  }

  // loads an URL into the popup without reloading it
  // openChatWindow(chatUrl: any, chatWindowName: any) {
  //   // open the window with blank url
  //   const chatwin = window.open('', chatWindowName);
  //   try {
  //     // if we just opened the window
  //     // this.logger.log('1) mywin ', chatwin)
  //     // this.logger.log('1) mywin.document ', chatwin.document)
  //     if (chatwin.closed || (!chatwin.document.URL) || (chatwin.document.URL.indexOf('about') === 0)) {
  //       // this.logger.log('2) mywin ', chatwin)
  //       // this.logger.log('2) mywin.document ', chatwin.document)
  //       chatwin.location.href = chatUrl;
  //     } else {
  //       // this.logger.log('3) mywin ', chatwin)
  //       // this.logger.log('3) mywin.document ', chatwin.document)
  //       chatwin.focus();
  //     }
  //   } catch (err) {
  //     this.logger.log('err ', err)
  //   }
  //   // return the window
  //   return chatwin;
  // }

  goToTiledeskMobileAppPage() {
    let url = ''
    if (this.browserLang === 'it') {
      url = 'https://tiledesk.com/mobile-live-chat-android-e-iphone-apps/';
    } else {
      url = 'https://tiledesk.com/mobile-live-chat-android-e-iphone-apps/';
    }
    window.open(url, '_blank');
  }



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

  getHasOpenBlogKey() {
    const hasOpenedBlog = this.usersLocalDbService.getStoredChangelogDate();
    this.logger.log('[HOME]  »»»»»»»»» hasOpenedBlog ', hasOpenedBlog);
    if (hasOpenedBlog === true) {
      this.hidechangelogrocket = true;
    } else {
      this.hidechangelogrocket = false;
    }
  }


  goToTemplates() {
    this.router.navigate(['project/' + this.projectId + '/bots/templates/all']);
  }

  goToCommunity() {
    this.router.navigate(['project/' + this.projectId + '/bots/templates/community']);
  }


  // NO MORE USED
  goToHistory() {
    this.router.navigate(['project/' + this.projectId + '/history']);
  }

  // no more used
  getProjectId() {
    // this.projectid = this.route.snapshot.params['projectid'];
    // this.logger.log('SIDEBAR - - - - - CURRENT projectid ', this.projectid);
    this.route.params.subscribe(params => {
      // const param = params['projectid'];
      this.logger.log('[HOME] - CURRENT projectid ', params);
    });
  }


  // NOT YET USED
  // superUserAuth() {
  //   if (!this.auth.superUserAuth(this.currentUserEmailgetFromStorage)) {
  //     this.logger.log('[HOME] +++ CURRENT U IS NOT SUPER USER ', this.currentUserEmailgetFromStorage);
  //     this.IS_SUPER_USER = false;
  //   } else {
  //     this.logger.log('[HOME] +++ !! CURRENT U IS SUPER USER ', this.currentUserEmailgetFromStorage);
  //     this.IS_SUPER_USER = true;

  //   }
  // }

  // displayCheckListModal() {
  //   this.notify.showCheckListModal(true);
  // }

  goToUserActivitiesLog() {
    this.router.navigate(['project/' + this.projectId + '/activities']);
  }

  // ------------------------------------------------------------------
  // LAST 7 DAYS CONVERSATIONS GRAPH
  // ------------------------------------------------------------------
  getRequestByLast7Day() {
    this.analyticsService.requestsByDay(7)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((requestsByDay: any) => {
        this.logger.log('[HOME] - REQUESTS BY DAY ', requestsByDay);

        // CREATES THE INITIAL ARRAY WITH THE LAST SEVEN DAYS (calculated with moment) AND REQUESTS COUNT = O
        const last7days_initarray = []
        for (let i = 0; i <= 6; i++) {
          // this.logger.log('»» !!! ANALYTICS - LOOP INDEX', i);
          last7days_initarray.push({ 'count': 0, day: moment().subtract(i, 'd').format('D-M-YYYY') })
        }

        last7days_initarray.reverse()

        this.logger.log('[HOME] - REQUESTS BY DAY - MOMENT LAST SEVEN DATE (init array)', last7days_initarray);

        const requestsByDay_series_array = [];
        const requestsByDay_labels_array = []

        // CREATES A NEW ARRAY FROM THE ARRAY RETURNED FROM THE SERVICE SO THAT IT IS COMPARABLE WITH last7days_initarray
        const requestsByDay_array = []
        for (let j = 0; j < requestsByDay.length; j++) {
          if (requestsByDay[j]) {
            requestsByDay_array.push({ 'count': requestsByDay[j]['count'], day: requestsByDay[j]['_id']['day'] + '-' + requestsByDay[j]['_id']['month'] + '-' + requestsByDay[j]['_id']['year'] })

          }

        }
        this.logger.log('[HOME] - REQUESTS BY DAY FORMATTED ', requestsByDay_array);

        /**
         * MERGE THE ARRAY last7days_initarray WITH requestsByDay_array  */
        // Here, requestsByDay_formatted_array.find(o => o.day === obj.day)
        // will return the element i.e. object from requestsByDay_formatted_array if the day is found in the requestsByDay_formatted_array.
        // If not, then the same element in last7days i.e. obj is returned.
        const requestByDays_final_array = last7days_initarray.map(obj => requestsByDay_array.find(o => o.day === obj.day) || obj);
        this.logger.log('[HOME] - REQUESTS BY DAY - FINAL ARRAY ', requestByDays_final_array);

        const _requestsByDay_series_array = [];
        const _requestsByDay_labels_array = [];

        requestByDays_final_array.forEach(requestByDay => {
          //this.logger.log('»» !!! ANALYTICS - REQUESTS BY DAY - requestByDay', requestByDay);
          _requestsByDay_series_array.push(requestByDay.count)

          const splitted_date = requestByDay.day.split('-');
          //this.logger.log('»» !!! ANALYTICS - REQUESTS BY DAY - SPLITTED DATE', splitted_date);
          _requestsByDay_labels_array.push(splitted_date[0] + ' ' + this.monthNames[splitted_date[1]])
        });


        this.logger.log('[HOME] - REQUESTS BY DAY - SERIES (ARRAY OF COUNT - to use for debug)', requestsByDay_series_array);
        this.logger.log('[HOME] - REQUESTS BY DAY - SERIES (+ NEW + ARRAY OF COUNT)', _requestsByDay_series_array);
        this.logger.log('[HOME] - REQUESTS BY DAY - LABELS (ARRAY OF DAY - to use for debug)', requestsByDay_labels_array);
        this.logger.log('[HOME] - REQUESTS BY DAY - LABELS (+ NEW + ARRAY OF DAY)', _requestsByDay_labels_array);

        const higherCount = this.getMaxOfArray(_requestsByDay_series_array);
        this.logger.log('[HOME] - REQUESTS BY DAY - HIGHTER COUNT ', higherCount);

        let lang = this.browserLang;
        const canvas = <HTMLCanvasElement>document.getElementById('last7dayChart'); // nk added to resolve Failed to create chart: can't acquire context from the given item
        const ctx = canvas.getContext('2d'); // nk added to resolve Failed to create chart: can't acquire context from the given item
        // var lineChart = new Chart('last7dayChart', {
        var lineChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: _requestsByDay_labels_array,
            datasets: [{
              label: 'Number of conversations in last 7 days ',//active label setting to true the legend value
              data: _requestsByDay_series_array,
              fill: true, //riempie zona sottostante dati
              lineTension: 0.4,
              backgroundColor: 'rgba(30, 136, 229, 0.6)',
              borderColor: 'rgba(30, 136, 229, 1)',
              borderWidth: 3,
              borderDash: [],
              borderDashOffset: 0.0,
              pointBackgroundColor: 'rgba(255, 255, 255, 0.8)',
              pointBorderColor: '#1e88e5'

            }]
          },
          options: {
            maintainAspectRatio: false, //allow to resize chart
            title: {
              text: 'Last 7 days converdations',
              display: false
            },
            legend: {
              display: false //do not show label title
            },
            scales: {
              xAxes: [{
                ticks: {
                  beginAtZero: true,
                  display: true,
                  //minRotation: 30,
                  fontColor: 'black',

                },
                gridLines: {
                  display: true,
                  borderDash: [8, 4],
                  //color:'rgba(255, 255, 255, 0.5)',

                }

              }],
              yAxes: [{
                gridLines: {
                  display: true,
                  borderDash: [8, 4],


                },
                ticks: {
                  beginAtZero: true,
                  userCallback: function (label, index, labels) {
                    //userCallback is used to return integer value to ylabel
                    if (Math.floor(label) === label) {
                      return label;
                    }
                  },
                  display: true,
                  fontColor: 'black',
                  suggestedMax: higherCount + 2,

                }
              }]
            },
            tooltips: {
              callbacks: {
                label: function (tooltipItem, data) {

                  const currentItemValue = tooltipItem.yLabel

                  if (lang === 'it') {
                    return 'Conversazioni: ' + currentItemValue;
                  } else {
                    return 'Conversations:' + currentItemValue;
                  }

                }
              }
            }
          },
          plugins: [{
            beforeDraw: function (chartInstance, easing) {
              var ctx = chartInstance.chart.ctx;
              //this.logger.log("chartistance",chartInstance)
              //ctx.fillStyle = 'red'; // your color here
              ctx.height = 128
              //chartInstance.chart.canvas.parentNode.style.height = '128px';
              ctx.font = 'Roboto'
              var chartArea = chartInstance.chartArea;
              //ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
            }
          }]
        });

      }, (error) => {
        this.logger.error('[HOME] - REQUESTS BY DAY - ERROR ', error);

      }, () => {
        this.logger.log('[HOME] - REQUESTS BY DAY * COMPLETE *');

      });
  }


  // ----------------------------------------------------------------------------------------------
  // VISITOR GRAPH FOR THE NEW NOME - NOT MORE USED - REPLACED WITH LAST 7 DAYS CONVERSATIONS GRAPH
  // ----------------------------------------------------------------------------------------------
  getVisitorsByLastNDays(lastdays) {
    this.analyticsService.getVisitorsByDay(lastdays).subscribe((visitorsByDay) => {
      this.logger.log("[HOME] »» VISITORS BY DAY RESULT: ", visitorsByDay)

      const last7days_initarray = [];
      for (let i = 0; i < lastdays; i++) {
        last7days_initarray.push({ 'count': 0, day: moment().subtract(i, 'd').format('D/M/YYYY') })
      }

      last7days_initarray.reverse();
      this.logger.log("[HOME] »» LAST 7 DAYS VISITORS - INIT ARRAY: ", last7days_initarray)

      const visitorsByDay_series_array = [];
      const visitorsByDay_labels_array = [];

      // CREATES A NEW ARRAY FROM THE ARRAY RETURNED FROM THE SERVICE SO THAT IT IS COMPARABLE WITH last7days_initarray
      const visitorsByDay_array = [];
      for (let j = 0; j < visitorsByDay.length; j++) {
        if (visitorsByDay[j]) {
          visitorsByDay_array.push({ 'count': visitorsByDay[j]['count'], day: visitorsByDay[j]['_id']['day'] + '/' + visitorsByDay[j]['_id']['month'] + '/' + visitorsByDay[j]['_id']['year'] })
        }
      }

      // MERGE last7days_initarray & visitorsByDay_array
      const visitorsByDays_final_array = last7days_initarray.map(obj => visitorsByDay_array.find(o => o.day === obj.day) || obj);

      this.initDay = visitorsByDays_final_array[0].day;
      this.endDay = visitorsByDays_final_array[lastdays - 1].day;
      this.logger.log("[HOME] INIT", this.initDay, "END", this.endDay);

      visitorsByDays_final_array.forEach((visitByDay) => {
        visitorsByDay_series_array.push(visitByDay.count)
        const splitted_date = visitByDay.day.split('/');
        visitorsByDay_labels_array.push(splitted_date[0] + ' ' + this.monthNames[splitted_date[1]])
      })

      this.logger.log('[HOME] »» VISITORS BY DAY - SERIES (+ NEW + ARRAY OF COUNT)', visitorsByDay_series_array);
      this.logger.log('[HOME] »» VISITORS BY DAY - LABELS (+ NEW + ARRAY OF DAY)', visitorsByDay_labels_array);

      const higherCount = this.getMaxOfArray(visitorsByDay_series_array);

      let lang = this.browserLang;

      var lineChart = new Chart('last7dayVisitors', {
        type: 'line',
        data: {
          labels: visitorsByDay_labels_array,
          datasets: [{
            label: 'Number of visitors in last 7 days ',
            data: visitorsByDay_series_array,
            fill: true,
            lineTension: 0.4,
            backgroundColor: 'rgba(30, 136, 229, 0.6)',
            borderColor: 'rgba(30, 136, 229, 1)',
            borderWidth: 3,
            borderDash: [],
            borderDashOffset: 0.0,
            pointBackgroundColor: 'rgba(255, 255, 255, 0.8)',
            pointBorderColor: '#1e88e5'
          }]
        },
        options: {
          maintainAspectRatio: false,
          title: {
            text: 'TITLE',
            display: false
          },
          legend: {
            display: false
          },
          scales: {
            xAxes: [{
              ticks: {
                beginAtZero: true,
                display: true,
                fontColor: 'black'
              },
              gridLines: {
                display: true,
                borderDash: [8, 4]
              }
            }],
            yAxes: [{
              gridLines: {
                display: true,
                borderDash: [8, 4]
              },
              ticks: {
                beginAtZero: true,
                userCallback: function (label, index, labels) {
                  if (Math.floor(label) === label) {
                    return label;
                  }
                },
                display: true,
                fontColor: 'black',
                suggestedMax: higherCount + 2
              }
            }]
          },
          tooltips: {
            callbacks: {
              label: function (tooltipItem, data) {
                const currentItemValue = tooltipItem.yLabel

                if (lang == 'it') {
                  return 'Visitatori: ' + currentItemValue;
                } else {
                  return 'Visitors: ' + currentItemValue;
                }
              }
            }
          }
        },
        plugins: [{
          beforeDraw: function (chartInstance, easing) {
            var ctx = chartInstance.chart.ctx;
            ctx.height = 128
            ctx.font = 'Roboto'
            var chartArea = chartInstance.chartArea;
          }
        }]
      })

    }, (error) => {
      this.logger.error('[HOME] »» VISITORS BY DAY - ERROR ', error);
    }, () => {
      this.logger.log('[HOME] »» VISITORS BY DAY - * COMPLETE * ');
    })
  }

  getMaxOfArray(requestsByDay_series_array) {
    return Math.max.apply(null, requestsByDay_series_array);
  }


  activateAppSumoLicenceTest() {
    this.projectService.activateAppSumoTier().subscribe((res) => {
      this.logger.log("[HOME] »» ACTIVATE APPSUMO TIER RES: ", res)
    }, (error) => {
      this.logger.error('[HOME] »» ACTIVATE APPSUMO TIER - ERROR ', error);
    }, () => {
      this.logger.log('[HOME] »» ACTIVATE APPSUMO TIER - * COMPLETE * ');
    })
  }

  updateAppSumoLicenceTest() {
    this.projectService.updateAppSumoTier().subscribe((res) => {
      this.logger.log("[HOME] »» UPDATE APPSUMO TIER RES: ", res)
    }, (error) => {
      this.logger.error('[HOME] »» UPDATE APPSUMO TIER - ERROR ', error);
    }, () => {
      this.logger.log('[HOME] »» UPDATE APPSUMO TIER - * COMPLETE * ');
    })
  }

  downgradeAppSumoLicenceTest() {
    this.projectService.downgradeAppSumoTier().subscribe((res) => {
      this.logger.log("[HOME] »» UPDATE APPSUMO TIER RES: ", res)
    }, (error) => {
      this.logger.error('[HOME] »» UPDATE APPSUMO TIER - ERROR ', error);
    }, () => {
      this.logger.log('[HOME] »» UPDATE APPSUMO TIER - * COMPLETE * ');
    })

  }

  refundAppSumoLicenceTest() {
    this.projectService.refundAppSumoTier().subscribe((res) => {
      this.logger.log("[HOME] »» UPDATE APPSUMO TIER RES: ", res)
    }, (error) => {
      this.logger.error('[HOME] »» UPDATE APPSUMO TIER - ERROR ', error);
    }, () => {
      this.logger.log('[HOME] »» UPDATE APPSUMO TIER - * COMPLETE * ');
    })

  }

  // TRANSLATION
  translateString() {
    this.translateInstallWidget();
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


  translateInstallWidget() {
    this.translate.get('InstallTiledeskNowAndStartChatting', this.tparams)
      .subscribe((text: string) => {
        this.installWidgetText = text;
        // this.logger.log('[HOME] + + + translateInstallWidget', text)
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

  goToProjects() {
    this.logger.log('[HOME] HAS CLICCKED GO TO PROJECT ')
    this.router.navigate(['/projects']);
    // (in AUTH SERVICE ) RESET PROJECT_BS AND REMOVE ITEM PROJECT FROM STORAGE WHEN THE USER GO TO PROJECTS PAGE
    this.auth.hasClickedGoToProjects();

    this.project = null

    // this.subscription.unsubscribe();
    // this.unsubscribe$.next();
    // this.unsubscribe$.complete();

    this.logger.log('[HOME] project AFTER GOTO PROJECTS ', this.project)
  }

  goToCreateProject() {
    this.router.navigate(['/create-new-project']);
  }



}
