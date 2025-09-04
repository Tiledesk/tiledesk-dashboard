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
import { take, takeUntil } from 'rxjs/operators'
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
import { ProjectUser } from 'app/models/project-user';

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
  quotasSubscription: Subscription;

  installWidgetText: string;

  //** FOR THE NEW DASHBOARD **//
  monthNames: any; /// VISITOR GRAPH FOR THE NEW HOME
  initDay: string; /// VISITOR GRAPH FOR THE NEW HOME
  endDay: string; /// VISITOR GRAPH FOR THE NEW HOME
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
  // whatsAppIsConnected: boolean = false;
  // userHasUnistalledWa: boolean = false



  // wadepartmentid: string;


  // testBotOnWA: boolean = false;
  botIdForTestWA: string = '';
  // dashletsPreferences = [{ convsGraph: true, analyticsIndicators: true, connectWhatsApp: true, createChatbot: true, inviteTeammate: true }]
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

  project_limits: any;
  quotes: any;
  all_quotes: any;

  conversationsRunnedOut: boolean = false;
  emailsRunnedOut: boolean = false;
  tokensRunnedOut: boolean = false;
  voiceRunnedOut: boolean = false;
  diplayVXMLVoiceQuota: boolean;


  // ---------------------------------------
  // For test 
  // ---------------------------------------
  // conversationsRunnedOut: boolean = true;
  // emailsRunnedOut: boolean = true;
  // tokensRunnedOut: boolean = true;

  displayQuotaSkeleton: boolean;

  salesEmail: string

  openedConversations: number = 0;
  closedConversations: number = 0;
  startSlot: string;
  endSlot: string;


  // refactoring quotas
  quotasLimits
  allQuotas



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

    this.salesEmail = brand['CONTACT_SALES_EMAIL'];
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
    this.faqKbService.getBotsByProjectIdAndSaveInStorage();

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

    // this.pauseResumeLastUpdateSlider() // https://stackoverflow.com/questions/5804444/how-to-pause-and-resume-css3-animation-using-javascript
    // this.getPromoBanner()



    // get if user has used Signin with Google
    const hasSigninWithGoogle = this.localDbService.getFromStorage('swg')
    if (hasSigninWithGoogle) {
      this.localDbService.removeFromStorage('swg')
      // this.logger.log('[SIGN-UP] removeFromStorage swg')
    }

    // this.listeHasOpenedNavbarQuotasMenu()

    this.listenToQuotas()

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
            this.displayQuotaSkeleton = true

            this.logger.log("[QUOTA-DEBUG][HOME][DISPLAY-SKELETON] listenToQuotas displayQuotaSkeleton 1:", this.displayQuotaSkeleton);
            // ----------------------------------------
            // Notify Navbar to fetch quotas
            // ----------------------------------------
            this.quotesService.requestQuotasUpdate();
            // this.getProjectQuotes();
          }

          this.prjct_name = this.project.name

          const hasEmittedTrialEnded = localStorage.getItem('dshbrd----' + this.project._id)
          this.logger.log('[HOME] - getCurrentProjectAndInit  hasEmittedTrialEnded ', hasEmittedTrialEnded, '  for project id', this.project._id)

          this.OPERATING_HOURS_ACTIVE = this.project.activeOperatingHours
          this.logger.log('[HOME] - getCurrentProjectAndInit OPERATING_HOURS_ACTIVE', this.OPERATING_HOURS_ACTIVE)

          // this.findCurrentProjectAmongAll(this.projectId)
          this.getProjectById(this.projectId);
          this.getProjectBots();
          // this.getUserRole()
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

        if (data) {
          if (data['projectId'] === this.projectId) {
            this.logger.log("[QUOTA-DEBUG][HOME] LISTEN TO QUOTAS HAS BEEN CALLED 2 data ", data);
            this.logger.log("[QUOTA-DEBUG][HOME] LISTEN TO QUOTAS HAS BEEN CALLED 2 data.projectId ", data['projectId']);
            this.quotasLimits = data.projectLimits;
            this.allQuotas = data.allQuotes;
            this.logger.log("[HOME] Received quotasLimits:", this.quotasLimits);
            this.logger.log("[HOME] Received allQuotas:", this.allQuotas);

            if (this.quotasLimits) {
              this.messages_limit = this.quotasLimits.messages;
              this.requests_limit = this.quotasLimits.requests;
              this.email_limit = this.quotasLimits.email;
              this.tokens_limit = this.quotasLimits.tokens;

              // if (this.quotasLimits.voice_duration)  {
              this.voice_limit_in_sec = this.quotasLimits.voice_duration;
              this.voice_limit = Math.floor(this.quotasLimits.voice_duration / 60);
              // } else {
              //   this.voice_limit = 0
              // }


              this.logger.log("[HOME] Received allQuotas limit - messages_limit:", this.messages_limit);
              this.logger.log("[HOME] Received allQuotas limit - requests_limit:", this.requests_limit);
              this.logger.log("[HOME] Received allQuotas limit - email_limit:", this.email_limit);
              this.logger.log("[HOME] Received allQuotas limit - tokens_limit:", this.tokens_limit);
              this.logger.log("[HOME] Received allQuotas limit - voice_limit_in_sec:", this.voice_limit_in_sec);
              this.logger.log("[HOME] Received allQuotas limit - quotasLimits.voice_duration:", this.quotasLimits.voice_duration);
              this.logger.log("[HOME] Received allQuotas limit - voice_limit:", this.voice_limit);
            }

            // -----------------------------
            // For test
            // -----------------------------
            // this.requests_limit = 1;
            // this.email_limit = 1;
            // this.tokens_limit = 1;

            this.logger.log("[HOME] Received allQuotas quota - requests quota :", this.allQuotas.requests.quote);
            this.logger.log("[HOME] Received allQuotas quota - messages quota :", this.allQuotas.messages.quote);
            this.logger.log("[HOME] Received allQuotas quota - email quota :", this.allQuotas.email.quote);
            this.logger.log("[HOME] Received allQuotas quota - tokens quota :", this.allQuotas.tokens.quote);
            if (this.allQuotas.requests.quote === null) {
              this.allQuotas.requests.quote = 0;
            }
            if (this.allQuotas.messages.quote === null) {
              this.allQuotas.messages.quote = 0;
            }
            if (this.allQuotas.email.quote === null) {
              this.allQuotas.email.quote = 0;
            }
            if (this.allQuotas.tokens.quote === null) {
              this.allQuotas.tokens.quote = 0;
            }
            if (this.allQuotas.voice_duration && this.allQuotas.voice_duration.quote === null) {
              this.allQuotas.voice_duration.quote = 0;
              this.logger.log('[HOME] used voice', this.allQuotas.voice_duration.quote)
            }


            if (this.allQuotas.requests.quote >= this.requests_limit) {
              this.conversationsRunnedOut = true;
              this.logger.log('[HOME] conversationsRunnedOut', this.conversationsRunnedOut)
            } else {
              this.conversationsRunnedOut = false;
              this.logger.log('[HOME] conversationsRunnedOut', this.conversationsRunnedOut)
            }

            if (this.allQuotas.email.quote >= this.email_limit) {
              this.emailsRunnedOut = true;
              this.logger.log('[HOME] emailsRunnedOut', this.emailsRunnedOut)
            } else {
              this.emailsRunnedOut = false;
              this.logger.log('[HOME] emailsRunnedOut', this.emailsRunnedOut)
            }

            if (this.allQuotas.tokens.quote >= this.tokens_limit) {
              this.tokensRunnedOut = true;
              this.logger.log('[HOME] tokensRunnedOut', this.tokensRunnedOut)
            } else {
              this.tokensRunnedOut = false;
              this.logger.log('[HOME] tokensRunnedOut', this.tokensRunnedOut)
            }

            if (this.diplayVXMLVoiceQuota) {
              if (this.allQuotas.voice_duration?.quote >= this.voice_limit_in_sec) {
                // if (3342 >= this.voice_limit_in_sec) {   
                this.voiceRunnedOut = true;
                this.logger.log('[HOME] voiceRunnedOut', this.voiceRunnedOut)
              } else {
                this.voiceRunnedOut = false;
                this.logger.log('[HOME] voiceRunnedOut', this.voiceRunnedOut)
              }
            }


            this.requests_perc = Math.min(100, Math.floor((this.allQuotas.requests.quote / this.requests_limit) * 100));
            this.messages_perc = Math.min(100, Math.floor((this.allQuotas.messages.quote / this.messages_limit) * 100));
            this.email_perc = Math.min(100, Math.floor((this.allQuotas.email.quote / this.email_limit) * 100));
            this.tokens_perc = Math.min(100, Math.floor((this.allQuotas.tokens.quote / this.tokens_limit) * 100));
            this.voice_perc = Math.min(100, Math.floor((this.allQuotas.voice_duration?.quote / this.voice_limit_in_sec) * 100));

            this.requests_count = this.allQuotas.requests.quote;
            this.messages_count = this.allQuotas.messages.quote;
            this.email_count = this.allQuotas.email.quote;
            this.tokens_count = this.allQuotas.tokens.quote;
            this.voice_count = this.allQuotas.voice_duration?.quote
            this.voice_count_min_sec = this.secondsToMinutes_seconds(this.voice_count)

            this.logger.log("[QUOTA-DEBUG][HOME][DISPLAY-SKELETON] projectChangedFromList :", this.projectChangedFromList);
            this.displayQuotaSkeleton = false
            // if (this.projectChangedFromList) {
            //   setTimeout(() => {
            //     this.displayQuotaSkeleton = false
            //   }, 1000);

            //   this.logger.log("[QUOTA-DEBUG][HOME][DISPLAY-SKELETON] listenToQuotas displayQuotaSkeleton 2:", this.displayQuotaSkeleton);
            // } 
            // else {
            //   this.displayQuotaSkeleton = false
            //   this.logger.log("[QUOTA-DEBUG][HOME][DISPLAY-SKELETON] listenToQuotas displayQuotaSkeleton 3:", this.displayQuotaSkeleton);
            // }
          }
        }
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

  secondsToMinutes_seconds(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
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

  manageVoiceQuotaVisibility(projectProfileData) {
    if (projectProfileData['customization']) {
      this.logger.log('[HOME] (manageVoiceQuotaVisibility) projectProfileData[customization] ', projectProfileData['customization'])
      // (projectProfileData['customization']['voice-twilio'] !== undefined) ||
      if (projectProfileData['customization'] && ( (projectProfileData['customization']['voice'] !== undefined))) {

        this.logger.log('[HOME] (manageVoiceQuotaVisibility) projectProfileData[customization] voice', projectProfileData['customization']['voice'])
        // this.logger.log('[HOME] (manageVoiceQuotaVisibility) projectProfileData[customization] voice-twilio', projectProfileData['customization']['voice-twilio'])
        // if (projectProfileData['customization']['voice-twilio'] === true) {
        //   this.diplayTwilioVoiceQuota = true
        // } else if (projectProfileData['customization']['voice-twilio'] === false) {
        //   this.diplayTwilioVoiceQuota = false
        // } else if (projectProfileData['customization']['voice-twilio'] === undefined) {
        //   this.diplayTwilioVoiceQuota = false
        // }

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

  contacUsViaEmail() {
    window.open(`mailto:${this.salesEmail}?subject=Resource increase request for project ${this.projectName} (${this.projectId}) &body=Dear Sales team, some of my monthly resource quota reached his limit for this month, I need some help!`);
  }

  contacUsViaEmailToUpdadePaymentInformation() {
    window.open(`mailto:${this.salesEmail}?subject=Update payment information for project ${this.projectName} (${this.projectId})`);
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

      if (key.includes("QIN")) {
        // this.logger.log('PUBLIC-KEY (HOME) - key', key);
        let qt = key.split(":");
        // this.logger.log('PUBLIC-KEY (HOME) - mt key&value', mt);
        if (qt[1] === "F") {
          this.isVisibleQuoteSection = false;
          // this.logger.log('PUBLIC-KEY (HOME) - isVisibleQuoteSection ', this.isVisibleQuoteSection);
        } else {
          this.isVisibleQuoteSection = true;
          // this.logger.log('PUBLIC-KEY (HOME) - isVisibleQuoteSection ', this.isVisibleQuoteSection);
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

    if (!this.public_Key.includes("QIN")) {
      this.isVisibleQuoteSection = false;
      // this.logger.log('PUBLIC-KEY (Navbar) - isVisibleQuoteSection', this.isVisibleQuoteSection);
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
        this.logger.log('[HOME] PROJECT-USER ID ', projectUser._id)
        this.logger.log('[HOME] USER IS AVAILABLE ', projectUser.user_available)
        this.logger.log('[HOME] USER IS BUSY ', projectUser.isBusy)
        // this.user_is_available_bs = projectUser.user_available;

        if (projectUser[0].user_available !== undefined) {
          this.usersService.user_availability(projectUser[0]._id, projectUser[0].user_available, projectUser[0].isBusy, projectUser[0]);
        }
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
    this.usersService.projectUser_bs.subscribe((projectUser: ProjectUser) => {
      this.logger.log('[HOME] - $UBSCRIPTION TO USER ROLE »»» ', projectUser)
      if(projectUser){
        this.USER_ROLE = projectUser.role;
      }
    })
  }

  // TEST FUNCTION : GET ALL AVAILABLE PROJECT USER
  getAvailableProjectUsersByProjectId() {
    this.logger.log('[HOME] ... CALLING GET AVAILABLE PROJECT USERS')
    this.usersService.getAvailableProjectUsersByProjectId().subscribe((available_project) => {
      this.logger.log('[HOME]  »»»»»»» AVAILABLE PROJECT USERS ', available_project)
    })
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



  goToTemplates() {
    this.router.navigate(['project/' + this.projectId + '/bots/templates/all']);
  }

  goToCommunity() {
    this.router.navigate(['project/' + this.projectId + '/bots/templates/community']);
  }


  goToUserActivitiesLog() {
    this.router.navigate(['project/' + this.projectId + '/activities']);
  }


  // NO MORE USED
  goToHistory() {
    this.router.navigate(['project/' + this.projectId + '/history']);
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


  // -------------------------
  // No more used
  // -------------------------
  getProjectQuotes() {
    this.quotesService.getProjectQuotes(this.projectId).then((response) => {
      this.logger.log("[HOME] getProjectQuotes response: ", response);
      this.project_limits = response;
      if (this.project_limits) {
        this.getQuotes()
      }
    }).catch((err) => {
      this.logger.error("[HOME] getProjectQuotes error: ", err);
      this.displayQuotaSkeleton = false
    })
  }

  // -------------------------
  // No more used
  // -------------------------
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
        this.getRunnedOutQuotes(this.quotes)
      }, 1500);

    })
  }

  getRunnedOutQuotes(resp) {
    if (this.project_limits) {
      if (resp.quotes.requests.quote >= this.project_limits.requests) {
        this.conversationsRunnedOut = true;
        this.logger.log('[HOME] conversationsRunnedOut', this.conversationsRunnedOut)
        // this.quotesService.hasReachedQuotasLimitInHome(true)
      } else {
        this.conversationsRunnedOut = false;
        // this.quotesService.hasReachedQuotasLimitInHome(false)
        this.logger.log('[HOME] conversationsRunnedOut', this.conversationsRunnedOut)
      }

      if (resp.quotes.email.quote >= this.project_limits.email) {
        this.emailsRunnedOut = true;
        this.logger.log('[HOME] emailsRunnedOut', this.emailsRunnedOut)
        // this.quotesService.hasReachedQuotasLimitInHome(true)
      } else {
        this.emailsRunnedOut = false;
        // this.quotesService.hasReachedQuotasLimitInHome(false)
        this.logger.log('[HOME] emailsRunnedOut', this.emailsRunnedOut)
      }

      if (resp.quotes.tokens.quote >= this.project_limits.tokens) {
        this.tokensRunnedOut = true;
        this.logger.log('[HOME] tokensRunnedOut', this.tokensRunnedOut)
        // this.quotesService.hasReachedQuotasLimitInHome(true)
      } else {
        this.tokensRunnedOut = false;
        // this.quotesService.hasReachedQuotasLimitInHome(false)
        this.logger.log('[HOME] tokensRunnedOut', this.tokensRunnedOut)
      }
    }
  }



  // -------------------------
  // No more used
  // -------------------------
  listeHasOpenedNavbarQuotasMenu() {
    //  this.logger.log("[HOME] listeHasOpenedNavbarQuotasMenu ");
    this.quotesService.hasOpenNavbarQuotasMenu$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((hasOpen) => {

        this.logger.log("[HOME] listeHasOpenedNavbarQuotasMenu hasOpen", hasOpen);

        if (this.projectId) {
          if (hasOpen !== null) {
            // this.getQuotes()
          }
        }
      })
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


}
