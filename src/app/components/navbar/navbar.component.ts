// tslint:disable:max-line-length
import { Component, OnInit, ElementRef, AfterContentChecked, AfterViewInit, AfterViewChecked, OnDestroy, Inject } from '@angular/core';
// import { ROUTES } from '../sidebar/sidebar.component';
import { DOCUMENT, Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthGuard } from '../../core/auth.guard';
import { Router, NavigationEnd, Event as NavigationEvent } from '@angular/router';

declare var $: any;

import { Project } from '../../models/project-model';
import { UsersService } from '../../services/users.service';

import { isDevMode } from '@angular/core';
import { UploadImageService } from '../../services/upload-image.service';
import { UploadImageNativeService } from '../../services/upload-image-native.service';
import { NotifyService } from '../../core/notify.service';
// import * as moment from 'moment';
import moment from "moment";
import { ProjectPlanService } from '../../services/project-plan.service';
import { ProjectService } from '../../services/project.service';

import { WsRequestsService } from '../../services/websocket/ws-requests.service';
import { AppConfigService } from '../../services/app-config.service';


// import { publicKey } from '../../utils/util';
// import { public_Key } from '../../utils/util';
// import { environment } from '../../../environments/environment';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators'
import { Subscription } from 'rxjs'

// import brand from 'assets/brand/brand.json';
import { BrandService } from './../../services/brand.service';
import { LocalDbService } from '../../services/users-local-db.service';
import { LoggerService } from '../../services/logger/logger.service';
import { ThemePalette} from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { QuotesService } from 'app/services/quotes.service';
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component';
import { APP_SUMO_PLAN_NAME, PLAN_NAME, URL_understanding_default_roles } from 'app/utils/util';

const swal = require('sweetalert');


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent extends PricingBaseComponent implements OnInit, AfterViewInit, AfterContentChecked, OnDestroy, AfterViewChecked {

  PLAN_NAME = PLAN_NAME;
  // PLANS_LIST = PLANS_LIST;
  APP_SUMO_PLAN_NAME = APP_SUMO_PLAN_NAME;
  appSumoProfile: string;
  prjct_profile_name_for_segment: string;
  URL_UNDERSTANDING_DEFAULT_ROLES = URL_understanding_default_roles
  // used to unsuscribe from behaviour subject
  private unsubscribe$: Subject<any> = new Subject<any>();

  // tparams = brand;
  tparams: any;
  // translationParams: any;

  // public_Key = environment.t2y12PruGU9wUtEGzBJfolMIgK; // now get from appconfig
  public_Key: string;

  private listTitles: any[];
  location: Location;
  private toggleButton: any;
  private sidebarVisible: boolean;
  unservedRequestCount: number;
  currentUserRequestCount: number;

  value: number
  valueText: string;
  lastRequest: any;
  audio: any;
  membersObjectInRequestArray: any;
  currentUserFireBaseUID: string;
  user: any;
  LOCAL_STORAGE_CURRENT_USER: any;
  // CURRENT_USER_UID_IS_BETWEEN_MEMBERS = false;
  // SHOW_NOTIFICATION_FOR_REQUEST_RECIPIENT: boolean;
  LOCAL_STORAGE_LAST_REQUEST_RECIPIENT: string;
  USER_IS_SIGNED_IN: boolean;
  routerLink = 'routerLink="/analytics"'

  notify: any;
  private shown_requests = {};
  private shown_my_requests = {};


  project: Project;
  projectUser_id: string;
  route: string;

  DETECTED_CHAT_PAGE = false;
  // DETECTED_PROJECT_PAGE = false;
  // DETECTED_LOGIN_PAGE = false;
  // DETECTED_SIGNUP_PAGE = false;
  HIDE_PENDING_EMAIL_NOTIFICATION = true;

  DETECTED_USER_PROFILE_PAGE = false;

  // CHAT_BASE_URL = environment.chat.CHAT_BASE_URL; // moved
  // CHAT_BASE_URL = environment.CHAT_BASE_URL; // now get from appconfig
  CHAT_BASE_URL: string;

  displayLogoutModal = 'none';

  APP_IS_DEV_MODE: boolean;

  userProfileImageExist: boolean;
  userImageHasBeenUploaded: boolean;
  userProfileImageurl: string;
  timeStamp: any;

  HAS_OPENED_THE_CHAT: boolean;
  IS_AVAILABLE: boolean;
  projectId: string;

  prjct_profile_name: string;
  profile_name: string;
  prjct_profile_type: string;
  prjct_trial_expired: boolean;

  prjc_trial_days_left: number;
  prjc_trial_days_left_percentage: number;
  browserLang: string;
  subscription_end_date: any;
  subscription_is_active: boolean;
  HOME_ROUTE_IS_ACTIVE: boolean;
  projects: any;
  isVisible: boolean;

  storageBucket: string;
  baseUrl: string;

  currentUserId: string;
  subscription: Subscription;
  ROLE_IS_AGENT: boolean;
  USER_ROLE: string;
  IS_REQUEST_FOR_PANEL_ROUTE: boolean;
  IS_UNSERVEDREQUEST_FOR_PANEL_ROUTE: boolean;

  NOTIFICATION_SOUND: string;
  storedValuePrefix = 'dshbrd----'
  hasPlayed = false
  MT: boolean
  OPERATING_HOURS_ACTIVE: boolean;
  TESTSITE_BASE_URL: string;
  projectName: string;

  onlyOwnerCanManageTheAccountPlanMsg: string;
  learnMoreAboutDefaultRoles: string;
  flag_url: string;
  dsbrd_lang: string;
  tlangparams: any;

  // QUOTES
  isVisibleQuoteBtn: boolean;
  isVisiblePay: boolean
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

  constructor(
    @Inject(DOCUMENT) private document: Document,
    location: Location,
    private element: ElementRef,
    public auth: AuthService,
    public authguard: AuthGuard,
    private translate: TranslateService,
    private router: Router,
    private usersService: UsersService,
    private uploadImageService: UploadImageService,
    private uploadImageNativeService: UploadImageNativeService,
    public notifyService: NotifyService,
    public prjctPlanService: ProjectPlanService,
    private projectService: ProjectService,
    public wsRequestsService: WsRequestsService,
    public appConfigService: AppConfigService,
    public brandService: BrandService,
    public localDbService: LocalDbService,
    private logger: LoggerService,
    private quotesService: QuotesService
  ) {

    super(prjctPlanService, notifyService);
    
    const brand = brandService.getBrand();
    this.tparams = brand;
    this.location = location;
    this.sidebarVisible = false;
    // this.unservedRequestCount = 0

    this.logger.log('[NAVBAR] IS DEV MODE ', isDevMode());
    this.APP_IS_DEV_MODE = isDevMode()
  }



  ngOnInit() {
    this.getCurrentProject();
    this.getProjectUserRole();
    this.getProfileImageStorage();

    // -------------------------------------------
    //  Replaced with Foregrond notification
    // -------------------------------------------
    // this.updateUnservedRequestCount();
    // this.updateCurrentUserRequestCount();
    // this.notifyLastUnservedAndCurrentUserRequest();
    // this.checkRequestStatusInShown_requests();

    this.notifyLastUnserved();

    this.getLoggedUser();

    /* REPLACED */
    // this.getLastRequest();
    // this.getUnservedRequestLenght();
    // this.getUnservedRequestLenght_bs();


    this.getProjectUserId();

    this.getActiveRoute();
    this.hidePendingEmailNotification();
    this.detectUserProfilePage();

    this.checkUserImageUploadIsComplete();

    // used when the page is refreshed
    this.checkUserImageExist();

    this.getFromLocalStorageHasOpenedTheChat();
    this.getFromNotifyServiceHasOpenedChat();

    this.getUserAvailability();
    this.hasChangedAvailabilityStatusInSidebar();
    this.hasChangedAvailabilityStatusInUsersComp();
    // this.subscribeToLogoutPressedinSidebarNavMobile();

    this.getProjectPlan();
    this.getTrialLeft()
    this.getBrowserLanguage();
    this.listenCancelSubscription();
    this.getIfIsCreatedNewProject();

    this.getChatUrl();
    this.getOSCODE();


    this.setNotificationSound();
    this.getTestSiteUrl();

    this.translateStrings();
    this.listenHasDeleteUserProfileImage();

 

  } // OnInit


  ngOnDestroy() {
    this.logger.log('[NAVBAR] % »»» WebSocketJs WF +++++ ws-requests--- navbar ≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥ ngOnDestroy')
    this.subscription.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getProjectQuotes() {
    this.quotesService.getProjectQuotes(this.projectId).then((response) => {
      this.logger.log("[NAVBAR] getProjectQuotes response: ", response);
      this.logger.log("getProjectQuotes: ", response);
      this.project_limits = response;
    }).catch((err) => {
      this.logger.error("[NAVBAR] getProjectQuotes error: ", err);
    })
  }

  getQuotes() {
    this.quotesService.getAllQuotes(this.projectId).subscribe((resp: any) => {
      this.logger.log("[NAVBAR] getAllQuotes response: ", resp)

      this.logger.log("project_limits: ", this.project_limits)
      this.logger.log("resp.quotes: ", resp.quotes)

      this.messages_limit = this.project_limits.messages;
      this.requests_limit = this.project_limits.requests;
      this.email_limit = this.project_limits.email;
      this.tokens_limit = this.project_limits.tokens;

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
      
      this.requests_perc = Math.min(100, Math.floor((resp.quotes.requests.quote / this.requests_limit) * 100));
      this.messages_perc = Math.min(100, Math.floor((resp.quotes.messages.quote / this.messages_limit) * 100));
      this.email_perc = Math.min(100, Math.floor((resp.quotes.email.quote / this.email_limit) * 100));
      this.tokens_perc = Math.min(100, Math.floor((resp.quotes.tokens.quote / this.tokens_limit) * 100));

      this.requests_count = resp.quotes.requests.quote;
      this.messages_count = resp.quotes.messages.quote;
      this.email_count = resp.quotes.email.quote;
      this.tokens_count = resp.quotes.tokens.quote;

    }, (error) => {
      this.logger.error("get all quotes error: ", error)
    }, () => {
      this.logger.log("get all quotes *COMPLETE*");
    })
  }

  getformat(number, intg: Boolean | null){
    if(number == 0) {
      return 0;
    }
    else
    {        
      // hundreds
      if(number <= 999){
        return number ;
      }
      // thousands
      else if(number >= 1000 && number <= 999999){
        if (intg) {
          return (number / 1000).toFixed(0) + 'K';  
        }
        return (number / 1000).toFixed(1) + 'K';
      }
      // millions
      else if(number >= 1000000 && number <= 999999999){
        if (intg) {
          return (number / 1000000).toFixed(0) + 'M';
        }
        return (number / 1000000).toFixed(1) + 'M';
      }
      else
        return number ;
      }
    }

  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
     this.logger.log('[NAVBAR] »»» »»» USER GET IN NAVBAR ', user)
      // tslint:disable-next-line:no-debugger
      // debugger
      this.user = user;

      // GET ALL PROJECTS WHEN IS PUBLISHED THE USER
      if (this.user) {

        const stored_preferred_lang = localStorage.getItem(this.user._id + '_lang')

        if (stored_preferred_lang) {
          this.dsbrd_lang = stored_preferred_lang;
          this.getLangTranslation(this.dsbrd_lang)
          this.flag_url = "assets/img/language_flag/" + stored_preferred_lang + ".png"

          this.logger.log('[NAVBAR] flag_url (from stored_preferred_lang) ', this.flag_url)

          this.logger.log('[NAVBAR] stored_preferred_lang ', stored_preferred_lang)
        } else {
          this.browserLang = this.translate.getBrowserLang();
          this.dsbrd_lang = this.browserLang;
          this.getLangTranslation(this.dsbrd_lang)
          this.logger.log('[NAVBAR] - browser_lang ', this.browserLang)
          this.flag_url = "assets/img/language_flag/" + this.browserLang + ".png"

          this.logger.log('[NAVBAR] flag_url (from browser_lang) ', this.flag_url)
        }

        this.currentUserId = this.user._id;
        
      }
    });
  }

  getLangTranslation(dsbrd_lang_code) {
    this.translate.get(dsbrd_lang_code)
      .subscribe((translation: any) => {
        this.logger.log('[NAVBAR] getLangTranslation', translation)
        this.tlangparams = { language_name: translation }
      });
  }

  translateStrings() {
    this.translateModalOnlyOwnerCanManageProjectAccount()
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

  setNotificationSound() {
    // NOTIFICATION_SOUND = 'enabled';
    const storedNotificationSound = localStorage.getItem(this.storedValuePrefix + 'sound');
    this.logger.log('[NAVBAR] NOTIFICATION_SOUND STORED ', storedNotificationSound)

    if (storedNotificationSound !== 'undefined' && storedNotificationSound !== null) {
     this.logger.log('[NAVBAR] NOTIFICATION_SOUND - EXIST STORED SO SET STORED VALUE', storedNotificationSound)
      this.NOTIFICATION_SOUND = storedNotificationSound;
    } else {

      this.NOTIFICATION_SOUND = 'enabled';

      localStorage.setItem(this.storedValuePrefix + 'sound', this.NOTIFICATION_SOUND);
      this.logger.log('[NAVBAR] NOTIFICATION_SOUND - NOT EXIST STORED SO SET DEFAULT ', this.NOTIFICATION_SOUND)
    }

  }


  getChatUrl() {
    this.CHAT_BASE_URL = this.appConfigService.getConfig().CHAT_BASE_URL;
    // this.logger.log('[NAVBAR] AppConfigService getAppConfig (NAVBAR) CHAT_BASE_URL', this.CHAT_BASE_URL);
  }

  getProjectUserRole() {
    // const user___role =  this.usersService.project_user_role_bs.value;
    // this.logger.log('[NAVBAR] % »»» WebSocketJs WF +++++ ws-requests--- navbar - USER ROLE 1 ', user___role);

    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user_role) => {
        this.logger.log('[NAVBAR] - USER ROLE from $ubscription', user_role);
        if (user_role) {
          this.USER_ROLE = user_role
          if (user_role === 'agent') {
            this.ROLE_IS_AGENT = true;

          } else {
            this.ROLE_IS_AGENT = false;
          }
        }
      });
  }


  getProfileImageStorage() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[NAVBAR] IMAGE STORAGE ', this.storageBucket, 'usecase firebase')
    } else {
      this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;
      this.logger.log('[NAVBAR] IMAGE STORAGE ', this.storageBucket, 'usecase native')
    }
  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[NAVBAR] AppConfigService getAppConfig public_Key', this.public_Key)
    this.logger.log('[NAVBAR] public_Key', this.public_Key)

    let keys = this.public_Key.split("-");
    // this.logger.log('PUBLIC-KEY (Navbar) - public_Key keys', keys)

    keys.forEach(key => {
      // this.logger.log('NavbarComponent public_Key key', key)
      if (key.includes("PAY")) {
        // this.logger.log('PUBLIC-KEY (Navbar) - key', key);
        let pay = key.split(":");
        // this.logger.log('PUBLIC-KEY (Navbar) - pay key&value', pay);
        if (pay[1] === "F") {
          this.isVisible = false;
          // this.logger.log('PUBLIC-KEY (Navbar) - pay isVisible', this.isVisible);
        } else {
          this.isVisible = true;
          // this.logger.log('PUBLIC-KEY (Navbar) - pay isVisible', this.isVisible);
        }
      }

      if (key.includes("MTT")) {
        // this.logger.log('PUBLIC-KEY (Navbar) - key', key);
        let mt = key.split(":");
        // this.logger.log('PUBLIC-KEY (Navbar) - mt key&value', mt);
        if (mt[1] === "F") {
          this.MT = false;
          // this.logger.log('PUBLIC-KEY (Navbar) - mt is', this.MT);
        } else {
          this.MT = true;
          // this.logger.log('PUBLIC-KEY (Navbar) - mt is', this.MT);
        }
      }

      if (key.includes("QIN")) {
        // this.logger.log('PUBLIC-KEY (Navbar) - key', key);
        let qt = key.split(":");
        // this.logger.log('PUBLIC-KEY (Navbar) - mt key&value', mt);
        if (qt[1] === "F") {
          this.isVisibleQuoteBtn = false;
          // this.logger.log('PUBLIC-KEY (Navbar) - isVisibleQuoteBtn ', this.isVisibleQuoteBtn);
        } else {
          this.isVisibleQuoteBtn = true;
          // this.logger.log('PUBLIC-KEY (Navbar) - isVisibleQuoteBtn ', this.isVisibleQuoteBtn);
        }
      }

      if (key.includes("PAY")) {
        // this.logger.log('PUBLIC-KEY (Navbar) - key', key);
        let pay = key.split(":");
        // this.logger.log('PUBLIC-KEY (Navbar) - mt key&value', mt);
        if (pay[1] === "F") {
          this.isVisiblePay = false;
          // this.logger.log('PUBLIC-KEY (Navbar) - isVisibleQuoteBtn ', this.isVisibleQuoteBtn);
        } else {
          this.isVisiblePay = true;
          // this.logger.log('PUBLIC-KEY (Navbar) - isVisibleQuoteBtn ', this.isVisibleQuoteBtn);
        }
      }

      
    });

    if (!this.public_Key.includes("MTT")) {
      this.MT = false;
      // this.logger.log('PUBLIC-KEY (Navbar) - mt is', this.MT);
    }
    if (!this.public_Key.includes("QIN")) {
      this.isVisibleQuoteBtn = false;
      // this.logger.log('PUBLIC-KEY (Navbar) - isVisibleQuoteBtn', this.isVisibleQuoteBtn);
    }
    if (!this.public_Key.includes("PAY")) {
      this.isVisiblePay = false;
      // this.logger.log('PUBLIC-KEY (Navbar) - isVisiblePay', this.isVisiblePay);
    }
  }

  getProjects() {
    // this.logger.log('[NAVBAR] calling getProjects ... ');
    this.projectService.getProjects().subscribe((projects: any) => {
      this.logger.log('[NAVBAR] getProjects PROJECTS ', projects);

      if (projects) {
        // this.projects = projects;

        this.projects = projects.filter((project: any) => {
          // this.logger.log('[NAVBAR] getProjects PROJECTS status ', project.id_project.status);
          return project.id_project.status === 100;

        });
        this.logger.log('[NAVBAR] getProjects this.projects ', this.projects);
      }
    }, error => {
      this.logger.error('[NAVBAR] getProjects - ERROR ', error)
    }, () => {
      this.logger.log('[NAVBAR] getProjects - COMPLETE')
    });
  }


  getBrowserLanguage() {
    this.browserLang = this.translate.getBrowserLang();
    this.logger.log('[NAVBAR] ===== BRS LANG ', this.browserLang)
  }

  getUserAvailability() {
    this.usersService.user_is_available_bs.subscribe((user_available) => {
      this.IS_AVAILABLE = user_available;
      this.logger.log('[NAVBAR]- USER IS AVAILABLE ', this.IS_AVAILABLE);
    });
  }

  hasChangedAvailabilityStatusInSidebar() {
    this.usersService.has_changed_availability_in_sidebar.subscribe((has_changed_availability) => {
      this.logger.log('[NAVBAR] SUBSCRIBES TO HAS CHANGED AVAILABILITY FROM THE SIDEBAR', has_changed_availability)
      //   this.getAllUsersOfCurrentProject();
    })
  }

  hasChangedAvailabilityStatusInUsersComp() {
    this.usersService.has_changed_availability_in_users.subscribe((has_changed_availability) => {
      this.logger.log('[NAVBAR] SUBSCRIBES TO HAS CHANGED AVAILABILITY FROM THE USERS COMP', has_changed_availability)
      if (this.project) {
        // this.getProjectUser()
      }
    })
  }

  ngAfterViewInit() {
    const navbar: HTMLElement = this.element.nativeElement;
    this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
    this.logger.log('[NAVBAR] toggleButton ', this.toggleButton)
  }

  // bs_hasClickedChat IS PUBLISHED WHEN THE USER CLICK THE CHAT BTN FROM SIDEBAR OR HOME
  getFromNotifyServiceHasOpenedChat() {
    this.notifyService.bs_hasClickedChat.subscribe((hasClickedChat) => {
      this.logger.log('[NAVBAR] - HAS CLICKED CHAT ? ', hasClickedChat);

      if (hasClickedChat === true) {
        this.HAS_OPENED_THE_CHAT = true
      }
    })
  }

  listenHasDeleteUserProfileImage() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.uploadImageService.hasDeletedUserPhoto.subscribe((hasDeletedImage) => {
        this.logger.log('[NAVBAR] - hasDeletedImage ? ', hasDeletedImage, '(usecase Firebase)');
        this.userImageHasBeenUploaded = false
        this.userProfileImageExist = false
      });
    } else {
      this.uploadImageNativeService.hasDeletedUserPhoto.subscribe((hasDeletedImage) => {
        this.logger.log('[NAVBAR] - hasDeletedImage ? ', hasDeletedImage, '(usecase Native)');
        this.userImageHasBeenUploaded = false
        this.userProfileImageExist = false
      });
    }
  }

  checkUserImageExist() {
    this.usersService.userProfileImageExist.subscribe((image_exist) => {
      this.logger.log('[NAVBAR] - USER PROFILE EXIST ? ', image_exist);
      this.userProfileImageExist = image_exist;
      if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
        if (this.storageBucket && this.userProfileImageExist === true) {
          this.logger.log('[NAVBAR] - USER PROFILE EXIST - BUILD userProfileImageurl');
          this.setImageProfileUrl(this.storageBucket)
        }
      } else {
        if (this.userProfileImageExist === true) {
          this.setImageProfileUrl_Native(this.baseUrl)
        }
      }
    });
  }

  checkUserImageUploadIsComplete() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.uploadImageService.userImageWasUploaded.subscribe((image_exist) => {
        this.logger.log('[NAVBAR] - IMAGE UPLOADING IS COMPLETE ? ', image_exist, '(usecase Firebase)');
        this.userImageHasBeenUploaded = image_exist;
        if (this.storageBucket && this.userImageHasBeenUploaded === true) {
          this.logger.log('[NAVBAR] - IMAGE UPLOADING IS COMPLETE - BUILD userProfileImageurl ');
          this.setImageProfileUrl(this.storageBucket)
        }
      });
    } else {

      // NATIVE
      this.uploadImageNativeService.userImageWasUploaded_Native.subscribe((image_exist) => {
        this.logger.log('[NAVBAR] USER PROFILE IMAGE - IMAGE UPLOADING IS COMPLETE ? ', image_exist, '(usecase Native)');

        this.userImageHasBeenUploaded = image_exist;
        this.uploadImageNativeService.userImageDownloadUrl_Native.subscribe((imageUrl) => {
          this.userProfileImageurl = imageUrl
          this.timeStamp = (new Date()).getTime();
        })
      })
    }
  }

  setImageProfileUrl_Native(storage) {
    this.userProfileImageurl = storage + 'images?path=uploads%2Fusers%2F' + this.currentUserId + '%2Fimages%2Fthumbnails_200_200-photo.jpg';
    // this.logger.log('[NAVBAR] PROFILE IMAGE (USER-PROFILE ) - userProfileImageurl ', this.userProfileImageurl);
    this.timeStamp = (new Date()).getTime();
  }

  setImageProfileUrl(storageBucket) {
    this.userProfileImageurl = 'https://firebasestorage.googleapis.com/v0/b/' + storageBucket + '/o/profiles%2F' + this.currentUserId + '%2Fphoto.jpg?alt=media';
    this.timeStamp = (new Date()).getTime();
  }

  getUserProfileImage() {
    if (this.timeStamp) {
      // this.logger.log('[NAVBAR] PROFILE IMAGE (USER-IMG IN NAV-COMP) - getUserProfileImage ', this.userProfileImageurl);
      return this.userProfileImageurl + '&' + this.timeStamp;
    }
    return this.userProfileImageurl
  }

  getActiveRoute() {
    this.router.events
      .subscribe((event: NavigationEvent) => {
        if (event instanceof NavigationEnd) {
          // this.logger.log('[NAVBAR]  NavigationEnd ', event.url);

          /** HIDE THE PLAN NAME IF THE ROUTE ACTIVE IS THE HOME */
          if (event.url.indexOf('/home') !== -1) {
            // this.logger.log('[NAVBAR] NavigationEnd - THE home route IS ACTIVE  ', event.url);
            this.HOME_ROUTE_IS_ACTIVE = true;
          } else {
            // this.logger.log('[NAVBAR] NavigationEnd - THE home route IS NOT ACTIVE  ', event.url);
            this.HOME_ROUTE_IS_ACTIVE = false;
          }

          if (event.url.indexOf('/chat') !== -1) {
            // this.logger.log('[NAVBAR] NavigationEnd - THE chat route IS ACTIVE  ', event.url);
            this.DETECTED_CHAT_PAGE = true;
          } else {
            // this.logger.log('[NAVBAR] NavigationEnd - THE chat route IS NOT ACTIVE  ', event.url);
            this.DETECTED_CHAT_PAGE = false;
          }

          if (event.url.indexOf('/request-for-panel') !== -1) {
            this.IS_REQUEST_FOR_PANEL_ROUTE = true;
            // this.logger.log('[NAVBAR] NavigationEnd - IS_REQUEST_FOR_PANEL_ROUTE  ', this.IS_REQUEST_FOR_PANEL_ROUTE);
          } else {
            this.IS_REQUEST_FOR_PANEL_ROUTE = false;
            // this.logger.log('[NAVBAR] NavigationEnd - IS_REQUEST_FOR_PANEL_ROUTE  ', this.IS_REQUEST_FOR_PANEL_ROUTE);
          }

          if (event.url.indexOf('/unserved-request-for-panel') !== -1) {
            this.IS_UNSERVEDREQUEST_FOR_PANEL_ROUTE = true;
            this.logger.log('[NAVBAR] NavigationEnd - IS_UNSERVEDREQUEST_FOR_PANEL_ROUTE  ', this.IS_UNSERVEDREQUEST_FOR_PANEL_ROUTE);
          } else {
            this.IS_UNSERVEDREQUEST_FOR_PANEL_ROUTE = false;
            this.logger.log('[NAVBAR] NavigationEnd - IS_UNSERVEDREQUEST_FOR_PANEL_ROUTE  ', this.IS_UNSERVEDREQUEST_FOR_PANEL_ROUTE);
          }
        }
      })
  }

  /**
   * - WHEN IS DETECTED THE PROJECT PAGE OR THE LOGIN PAGE OR THE SIGNUP PAGE  THE "PENDING EMAIL VERIFICATION ALERT " IS NOT DISPLAYED
   */
  hidePendingEmailNotification() {
    //  const hidePendingEmailAlert = this.localDbService.getFromStorage('hpea');


    this.router.events.subscribe((val) => {
      
      if (this.location.path() !== '') {
        this.route = this.location.path();
        // this.logger.log('»> »> »> NAVBAR ROUTE DETECTED »> ', this.route)
        if (
          (this.route === '/projects') ||
          (this.route === '/login') ||
          (this.route === '/signup') ||
          (this.route === '/create-project') ||
          (this.route === '/configure-widget') ||
          (this.route === '/install-widget') ||
          (this.route === '/forgotpsw') ||
          (this.route.indexOf('/configure-widget') !== -1) ||
          (this.route.indexOf('/install-widget') !== -1) ||
          (this.route.indexOf('/install-tiledesk') !== -1) ||
          (this.route.indexOf('/handle-invitation') !== -1) ||
          (this.route.indexOf('/signup-on-invitation') !== -1) ||
          (this.route.indexOf('/create-new-project') !== -1) ||
          (this.route.indexOf('/success') !== -1) ||
          (this.route.indexOf('/request-for-panel') !== -1) ||
          (this.route.indexOf('/projects-for-panel') !== -1) ||
          (this.route.indexOf('/unserved-request-for-panel') !== -1) ||
          (this.route.indexOf('/desktop-access') !== -1) ||
          (this.route.indexOf('/onboarding-templates') !== -1) ||
          (this.route.indexOf('/onboarding') !== -1)
          
        ) {
          // this.logger.log('»> »> »> NAVBAR ROUTE DETECTED  »> ', this.route)
          // this.DETECTED_PROJECT_PAGE = true;
          this.HIDE_PENDING_EMAIL_NOTIFICATION = true;
          // this.logger.log('»> »> »> NAVBAR ROUTE DETECTED  »> ', this.route, 'HIDE PENDING_EMAIL_NOTIFICATION ', this.HIDE_PENDING_EMAIL_NOTIFICATION)
        } else {
          this.HIDE_PENDING_EMAIL_NOTIFICATION = false;
          // this.logger.log('»> »> »> NAVBAR ROUTE DETECTED  »> ', this.route, 'HIDE PENDING_EMAIL_NOTIFICATION ', this.HIDE_PENDING_EMAIL_NOTIFICATION)
        }

        // const navigationEndVal = val instanceof NavigationEnd
        // this.logger.log('[NAVBAR] navigationEndVal ' ,navigationEndVal  )

        // if (navigationEndVal) {
        //   const hasSignedup = this.localDbService.getFromStorage('signedup')
        //   this.logger.log('[NAVBAR] hasSignedup ', hasSignedup) 
        //   if (hasSignedup) {
        //     this.HIDE_PENDING_EMAIL_NOTIFICATION = true;

        //     this.logger.log('[NAVBAR] HIDE_PENDING_EMAIL_NOTIFICATION ' ,this.HIDE_PENDING_EMAIL_NOTIFICATION  )
        //   }
        // }

       


        // if (this.route === '/login') {
        //     this.logger.log('»> »> »> NAVBAR ROUTE DETECTED  »> ', this.route)
        //     // this.DETECTED_LOGIN_PAGE = true;
        //     this.HIDE_PENDING_EMAIL_NOTIFICATION = true;
        // } else {
        //     // this.DETECTED_LOGIN_PAGE = false;
        //     this.HIDE_PENDING_EMAIL_NOTIFICATION = false;
        // }

        // if (this.route === '/signup') {
        //     this.logger.log('»> »> »> NAVBAR ROUTE DETECTED  »> ', this.route)
        //     // this.DETECTED_SIGNUP_PAGE = true;
        //     this.HIDE_PENDING_EMAIL_NOTIFICATION = true;
        // } else {
        //     // this.DETECTED_SIGNUP_PAGE = false;
        //     this.HIDE_PENDING_EMAIL_NOTIFICATION = false;
        // }
      }
    });

   
  }

  /**
   * WHEN IS DETECTED THE USER-PROFILE PAGE (NOTE: THE ROUTE '/user-profile' IS THAT IN WHICH THERE IS NOT THE SIDEBAR)
   * TO THE "PENDING EMAIL VERIFICATION ALERT " IS ASIGNED THE CLASS is-user-profile-page THAT MODIFIED THE LEFT POSITION 
   * USE THE SAME CLASS ALSO FOR create-new-project and pricing THAT are OTHER PAGE WITHOUT SIDEABAR */
  detectUserProfilePage() {
    this.router.events.subscribe((val) => {

      if (this.location.path() !== '') {
        this.route = this.location.path();
        //  this.logger.log('[NAVBAR] »> »> »> NAVBAR ROUTE DETECTED  »> ', this.route)
        if (
          this.route === '/user-profile' ||
          this.route === '/create-new-project' ||
          this.route.indexOf('/pricing') !== -1 ||
          this.route.indexOf('/password/change') !== -1
        ) {

          this.DETECTED_USER_PROFILE_PAGE = true;
          // this.logger.log('[NAVBAR] »> »> »> NAVBAR ROUTE DETECTED  »> ', this.route, 'DETECTED_USER_PROFILE_PAGE ', this.DETECTED_USER_PROFILE_PAGE)
        } else {
          this.DETECTED_USER_PROFILE_PAGE = false;
          // this.logger.log('[NAVBAR] »> »> »> NAVBAR ROUTE DETECTED  »> ', this.route, 'DETECTED_USER_PROFILE_PAGE ', this.DETECTED_USER_PROFILE_PAGE)
        }

        if (this.route.indexOf('/request-for-panel') !== -1) {
          this.IS_REQUEST_FOR_PANEL_ROUTE = true;
          // this.logger.log('[NAVBAR] route detected - IS_REQUEST_FOR_PANEL_ROUTE  ', this.IS_REQUEST_FOR_PANEL_ROUTE);
        } else {
          this.IS_REQUEST_FOR_PANEL_ROUTE = false;
          // this.logger.log('[NAVBAR] route detected - IS_REQUEST_FOR_PANEL_ROUTE  ', this.IS_REQUEST_FOR_PANEL_ROUTE);
        }

        if (this.route.indexOf('/unserved-request-for-panel') !== -1) {
          this.IS_UNSERVEDREQUEST_FOR_PANEL_ROUTE = true;
          // this.logger.log('[NAVBAR] route detected - IS_UNSERVEDREQUEST_FOR_PANEL_ROUTE  ', this.IS_UNSERVEDREQUEST_FOR_PANEL_ROUTE);
        } else {
          this.IS_UNSERVEDREQUEST_FOR_PANEL_ROUTE = false;
          // this.logger.log('[NAVBAR] route detected - IS_UNSERVEDREQUEST_FOR_PANEL_ROUTE  ', this.IS_UNSERVEDREQUEST_FOR_PANEL_ROUTE);
        }



      }
    });
  }

  getCurrentProject() {
    // this.project = this.auth.project_bs.value;
    this.auth.project_bs.subscribe((project) => {
      
      if (project) {
        this.project = project
        this.logger.log('[NAVBAR] - project from $ubscription ', this.project);
        if (project.name) {
          
          this.projectId = project._id;
          this.projectName = project.name;
          // this.OPERATING_HOURS_ACTIVE = this.project.operatingHours
          this.getProjectQuotes();
          // this.logger.log('[NAVBAR] -> OPERATING_HOURS_ACTIVE ', this.OPERATING_HOURS_ACTIVE);
        }
    
        this.getProjects()
      }
    });
  }

  onOpenQuoteMenu() {
    this.logger.log('[NAVBAR] - on open quotes menu' )
    this.getQuotes();
  }

  getTrialLeft() {
    this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      // this.logger.log('[NAVBAR] - getProjectPlan project Profile Data', projectProfileData)
      if (projectProfileData) {

        this.prjct_trial_expired = projectProfileData.trial_expired;
        this.prjc_trial_days_left = projectProfileData.trial_days_left;
       
     
      

        if (this.prjct_trial_expired === false) {
          this.prjc_trial_days_left_percentage = (this.prjc_trial_days_left * 100) / 14;
          // this.logger.log('[NAVBAR] prjc_trial_days_left_percentage ', this.prjc_trial_days_left_percentage)
          // this.prjc_trial_days_left_percentage IT IS 
          // A NEGATIVE NUMBER AND SO TO DETERMINE THE PERCENT IS MADE AN ADDITION
          const perc = 100 + this.prjc_trial_days_left_percentage
          // this.logger.log('[NAVBAR] project perc ', perc)

          this.prjc_trial_days_left_percentage = this.round5(perc);
          // this.logger.log('ProjectPlanService (navbar) trial days left % rounded', this.prjc_trial_days_left_percentage);

        } else if (this.prjct_trial_expired === true) {
          this.prjc_trial_days_left_percentage = 100;
        }
        // if (this.prjct_profile_type === 'payment') {
        //   this.logger.log('[NAVBAR] browserLang ', this.browserLang);
        //   this.getPaidPlanTranslation(projectProfileData.profile_name);
        // }
      }
    }, error => {
      this.logger.error('[NAVBAR] - getProjectPlan - ERROR', error);
    }, () => {
      this.logger.log('[NAVBAR] - getProjectPlan - COMPLETE')
    });
  }

  round5(x) {
    // const percentageRounded = Math.ceil(x / 5) * 5;
    // this.logger.log('[NAVBAR] project trial days left % rounded', percentageRounded);
    // return Math.ceil(x / 5) * 5;
    return x % 5 < 3 ? (x % 5 === 0 ? x : Math.floor(x / 5) * 5) : Math.ceil(x / 5) * 5
  }

  /**
   * *! ############ CANCEL SUBSCRIPTION ############ !*
  * * the callback cancelSubscription() IS RUNNED in NotificationMessageComponent when the user click on
  *   the modal button Cancel Subscription
  * * NotificationMessageComponent, through the notify service, publishes the progress status
  *   of the cancellation of the subscription
  * * the NavbarComponent (this component) is subscribed to cancelSubscriptionCompleted$ and, when hasDone === true,
  *   call prjctPlanService.getProjectByID() that get and publish (with prjctPlanService.projectPlan$) the updated project object
  * * ProjectEditAddComponent is a subscriber of prjctPlanService.projectPlan$ so also his UI is refreshed when the prjctPlanService publish projectPlan$
  */

  listenCancelSubscription() {
    this.notifyService.cancelSubscriptionCompleted$.subscribe((hasDone: boolean) => {

      this.logger.log('[NAVBAR] cancelSubscriptionCompleted hasDone', hasDone);
      if (hasDone === false) { }

      if (hasDone === true) {
        setTimeout(() => {
          this.prjctPlanService.findCurrentProjectAmongAll(this.projectId);
        }, 2000);
      }
    });
  }


  openModalSubsExpired() {
    if (this.USER_ROLE === 'owner') {
      if (this.profile_name !== PLAN_NAME.C && this.profile_name !== PLAN_NAME.F ) {
        this.notifyService.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
      } else if (this.profile_name === PLAN_NAME.C || this.profile_name === PLAN_NAME.F) {
        this.notifyService.displayEnterprisePlanHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
      }
    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan();
    }
  }



  goToPricing() {
    // if (this.ROLE_IS_AGENT === false) {
    if (this.USER_ROLE === 'owner') {
     
      this.router.navigate(['project/' + this.projectId + '/pricing']);
    } else {

      this.presentModalOnlyOwnerCanManageTheAccountPlan()
    }
  }

  // presentModalUpgradePlan() {

  //   this.notifyService.presentContactUsModalToUpgradePlan(true);
  //   if (!isDevMode()) {
  //     if (window['analytics']) {

  //       try {
  //         window['analytics'].track('Update plan', {
  //           "email": this.user.email,
  //         }, {
  //           "context": {
  //             "groupId": this.projectId
  //           }
  //         });
  //       } catch (err) {
  //         this.logger.error('track [NAVBAR] Update plan error', err);
  //       }

  //       let userFullname = ''
  //       if (this.user.firstname && this.user.lastname)  {
  //         userFullname = this.user.firstname + ' ' + this.user.lastname
  //       } else if (this.user.firstname && !this.user.lastname) {
  //         userFullname = this.user.firstname
  //       }

  //       try {
  //         window['analytics'].identify(this.user._id, {
  //           name: userFullname,
  //           email: this.user.email,
  //           logins: 5,
  //           plan: this.prjct_profile_name_for_segment,
  //         });
  //       } catch (err) {
  //         this.logger.error('identify [NAVBAR] Update plan error', err);
  //       }

  //       try {
  //         window['analytics'].group(this.projectId, {
  //           name: this.projectName,
  //           plan: this.prjct_profile_name_for_segment,
  //         });
  //       } catch (err) {
  //         this.logger.error('group [NAVBAR] Update plan error', err);
  //       }
  //     }
  //   }

  // }



  // goToPayment() {
  //   var _this = this;
  //   if (this.USER_ROLE === 'owner') {
  //     if (this.prjct_profile_type === 'payment' && this.subscription_is_active === true) {
  //       this.router.navigate(['project/' + this.projectId + '/project-settings/payments']);
  //     }
  //   } else {
  //     this.presentModalOnlyOwnerCanManageTheAccountPlan()
  //   }
  // }


  presentModalOnlyOwnerCanManageTheAccountPlan() {
    this.notifyService.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyOwnerCanManageTheAccountPlanMsg, this.learnMoreAboutDefaultRoles)
  }



  getIfIsCreatedNewProject() {
    this.projectService.hasCreatedNewProject$.subscribe((hasCreatedNewProject) => {
      this.logger.log('[NAVBAR] »»» »»» getIfIsCreatedNewProject hasCreatedNewProject', hasCreatedNewProject)
      if (hasCreatedNewProject) {
        this.getProjects();
      }
    })
  }


  goToProjects() {
    this.logger.log('[NAVBAR] HAS CLICCKED GO TO PROJECT ')
    this.router.navigate(['/projects']);
    // (in AUTH SERVICE ) RESET PROJECT_BS AND REMOVE ITEM PROJECT FROM STORAGE WHEN THE USER GO TO PROJECTS PAGE
    this.auth.hasClickedGoToProjects();

    this.project = null

    // this.subscription.unsubscribe();
    // this.unsubscribe$.next();
    // this.unsubscribe$.complete();

    this.logger.log('[NAVBAR] project AFTER GOTO PROJECTS ', this.project)
  }

  // WHEN A USER CLICK ON A PROJECT IN THE NAVBAR DROPDOWN 
  goToHome(
    prjct_user:any,
    project: any,
    project_role,
    id_project: string,) {
    this.logger.log('[NAVBAR] goToHome prjct ', project )
    this.logger.log('[NAVBAR] goToHome project_role ', project_role )
    this.logger.log('[NAVBAR] goToHome id_project ', id_project )
   
    project['role'] =  project_role
    localStorage.setItem('last_project', JSON.stringify(prjct_user))
    // RUNS ONLY IF THE THE USER CLICK OVER A PROJECT WITH THE ID DIFFERENT FROM THE CURRENT PROJECT ID
    if (id_project !== this.projectId) {
     
      this.auth.projectSelected(project, 'navbar')
      this.router.navigate([`/project/${id_project}/home`]);    
    }
  }


  goToCreateProject() {
    this.router.navigate(['/create-new-project']);
    this.subscription.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  goToUserProfile() {
    this.logger.log('[NAVBAR] »»» »»» GO TO USER PROFILE ', this.project)
    if (this.project) {
      this.router.navigate(['/project/' + this.project._id + '/user-profile']);

    }
  }


  // goToOperatingHours() {
  //   this.router.navigate(['project/' + this.projectId + '/hours']);
  // }

  getTestSiteUrl() {
    this.TESTSITE_BASE_URL = this.appConfigService.getConfig().WIDGET_BASE_URL + 'assets/twp/index.html';
    this.logger.log('[NAVBAR] AppConfigService getAppConfig TESTSITE_BASE_URL', this.TESTSITE_BASE_URL);
  }

  testWidgetPage() {
    const simulateVisitorBtnElem = <HTMLElement>document.querySelector('.simulate-visitor-btn');
    simulateVisitorBtnElem.blur();
    // + '&isOpen=true'
    const url = this.TESTSITE_BASE_URL + '?tiledesk_projectid=' + this.projectId + '&project_name=' + this.projectName + '&role=' + this.USER_ROLE
    window.open(url, '_blank');
  }


  hasmeInAgents(agents) {
    if (agents) {
      for (let j = 0; j < agents.length; j++) {
        this.logger.log('[NAVBAR] hasmeInAgents currentUserId  ', this.currentUserId)
        this.logger.log('[NAVBAR] hasmeInAgents agent  ', agents[j].id_user)
        if (this.currentUserId === agents[j].id_user) {
          this.logger.log('[NAVBAR] hasmeInAgents ')
          return true
        }
      }
    } else {
      this.logger.log('[NAVBAR] hasmeInAgents OOPS!!! AGENTS THERE ARE NOT ')
    }
  }

  // NEW
  updateUnservedRequestCount() {
    // this.requestsService.requestsList_bs.subscribe((requests) => {
    this.subscription = this.wsRequestsService.wsRequestsList$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((requests) => {

        if (requests) {
          let count = 0;
          requests.forEach(r => {
            // this.logger.log('NAVBAR - UPDATE-UNSERVED-REQUEST-COUNT request agents', r.agents)
            // *bug fix: when the user is an agent also for the unserved we have to consider if he is present in agents
            if (r.status === 100 && this.ROLE_IS_AGENT === true) {
              if (this.hasmeInAgents(r.agents) === true) {  // new *bug fix
                count = count + 1;
              }
            }
            if (r.status === 100 && this.ROLE_IS_AGENT === false) {
              count = count + 1;
            }
          });
          this.unservedRequestCount = count;
        }
      }, error => {
        this.logger.error('[NAVBAR] updateUnservedRequestCount * error * ', error)
      }, () => {
        this.logger.log('[NAVBAR] updateUnservedRequestCount */* COMPLETE */*')
      })
  }

  updateCurrentUserRequestCount() {
    // this.requestsService.requestsList_bs.subscribe((requests) => {
    this.subscription = this.wsRequestsService.wsRequestsList$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((requests) => {
        if (requests) {
          let count = 0;
          requests.forEach(r => {

            // const membersArray = Object.keys(r.members);
            const participantsArray = r.participants // new used with ws 
            // this.logger.log('[NAVBAR] »» WIDGET updateCurrentUserRequestCount REQUEST currentUserRequestCount membersArray ', membersArray);

            // const currentUserIsInParticipants = membersArray.includes(this.user._id);
            const currentUserIsInParticipants = participantsArray.includes(this.user._id); // new used with ws 

            // this.logger.log('[NAVBAR] »» WIDGET updateCurrentUserRequestCount REQUEST currentUserRequestCount currentUserIsInParticipants ', currentUserIsInParticipants);
            if (currentUserIsInParticipants === true) {
              count = count + 1;
            }
          });
          this.currentUserRequestCount = count;
          // this.logger.log('»» NAVBAR notifyLastUnservedRequest REQUEST currentUserRequestCount ', this.currentUserRequestCount);
        }
      }, error => {
        this.logger.error('[NAVBAR] updateCurrentUserRequestCount * error * ', error)
      }, () => {
        this.logger.log('[NAVBAR] updateCurrentUserRequestCount */* COMPLETE */*')
      })

  }

  // IS USED FOR: A REQUEST CHANGE STATE
  // FROM -> 100 (THE R. RECIPIENT IS ADDED AND SET TO TRUE IN  shown_requests )
  // TO -> 200 (THE R. RECIPIENT IS SET TO FALSE IN  shown_requests )
  // SO IF THE REQUEST CHANGE AGAIN STATUS IN 100 THE NOTICATION IS AGAIN DISPLAYED
  checkRequestStatusInShown_requests() {
    this.logger.log('[NAVBAR] shown_requests object ', this.shown_requests)
    // this.requestsService.requestsList_bs.subscribe((requests) => {
    this.subscription = this.wsRequestsService.wsRequestsList$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((requests) => {
        // const storedRequest = []
        if (requests) {
          requests.forEach(r => {

            if (r.status !== 100) {
              // this.logger.log('REQUEST WITH STATUS != 100 ', r.status)
              this.shown_requests[r.id] = false;
            }
          });

        }
      }, error => {
        this.logger.error('[NAVBAR] checkRequestStatusInShown_requests * ERROR * ', error)
      }, () => {
        this.logger.log('[NAVBAR] checkRequestStatusInShown_requests */* COMPLETE */*')
      })
  }



  notifyLastUnserved() {
    // this.requestsService.requestsList_bs.subscribe((requests) => {
    this.subscription = this.wsRequestsService.wsRequestsList$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((requests) => {

        if (requests) {
          requests.forEach(r => {

            const participantsArray = r.participants // new used with ws 
            // this.logger.log([NAVBAR] participantsArray ', participantsArray);

            // const currentUserIsInMembers = membersArray.includes(this.user._id);  // old used with firestore 
            const currentUserIsInParticipants = participantsArray.includes(this.user._id); // new used with ws 
            // this.logger.log('[NAVBAR] notifyLastUnservedRequest REQUEST currentUserIsInParticipants ', currentUserIsInParticipants);


            // --------------------------------------------------------------------------
            // @ get stored request
            // --------------------------------------------------------------------------
            const storedRequest = localStorage.getItem(r.id + '_' + r.status);
            // this.logger.log('[NAVBAR] IN-APP-NOTIFICATION >> get storedRequest served >> ', r.id + '_' + r.updatedAt, ' - ', storedRequest);

            // if (r.status === 100 && !this.shown_requests[r.id] && this.user !== null) {
            if (r.status === 100 && !storedRequest && this.user !== null) {


              // *bug fix: when the user is an agent also for the unserved we have to consider if he is present in agents
              if (this.ROLE_IS_AGENT === true) {
                if (this.hasmeInAgents(r.agents) === true) {
                  this.displayUnservedInAppNotification(r)
                }
              } else {
                this.displayUnservedInAppNotification(r)
              }
            }



          });
        }
      }, error => {
        this.logger.error('[NAVBAR] notifyLastUnservedRequest * ERROR * ', error)
      }, () => {
        this.logger.log('[NAVBAR] notifyLastUnservedRequest */* COMPLETE */*')
      })
  }


  displayUnservedInAppNotification(r) {

    // const url = '#/project/' + this.projectId + '/request/' + r.id + '/messages'
    const url = '#/project/' + this.projectId + '/wsrequest/' + r.request_id + '/messages'
    this.logger.log('[NAVBAR] unserved request url ', url);

    this.logger.log('[NAVBAR] NOTIFICATION_SOUND (showNotification) before to show notification (unserved) this.notify ', this.notify)

    let contact_fullname = ''
    if (r.lead && r.lead.fullname) {
      contact_fullname = r.lead.fullname
    } else {
      contact_fullname = ""
    }

    if (this.IS_REQUEST_FOR_PANEL_ROUTE === false && this.IS_UNSERVEDREQUEST_FOR_PANEL_ROUTE === false) {
      this.notifyService.showUnservedNotication(contact_fullname, r.first_text, url)

      const count = +this.localDbService.getForegrondNotificationsCount();
      this.wsRequestsService.publishAndStoreForegroundRequestCount(count)

      this.shown_requests[r.id] = true;


      // --------------------------------------------------------------------------
      // @ set request to store (doUnservedDateDiffAndShowNotification)
      // --------------------------------------------------------------------------
      localStorage.setItem(r.id + '_' + r.status, 'true');

    }

  }



  /*** from 14 feb 19 are displayed also the request assigned to the current user */
  // NOTE: ARE DISPLAYED IN THE NOTIFICATION ONLY THE UNSERVED REQUEST (support_status = 100)
  // THAT ARE NOT FOUND (OR HAVE THE VALUE FALSE) IN THE LOCAL DICTIONARY shown_requests
  // FURTHERMORE THE NOTICATIONS WILL NOT BE DISPLAYED IF THE USER OBJECT IS NULL (i.e THERE ISN'T USER LOGGED IN)
  notifyLastUnservedAndCurrentUserRequest() {
    // this.requestsService.requestsList_bs.subscribe((requests) => {
    this.subscription = this.wsRequestsService.wsRequestsList$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((requests) => {

        if (requests) {
          requests.forEach(r => {

            const participantsArray = r.participants // new used with ws 
            // this.logger.log([NAVBAR] participantsArray ', participantsArray);

            // const currentUserIsInMembers = membersArray.includes(this.user._id);  // old used with firestore 
            const currentUserIsInParticipants = participantsArray.includes(this.user._id); // new used with ws 
            // this.logger.log('[NAVBAR] notifyLastUnservedRequest REQUEST currentUserIsInParticipants ', currentUserIsInParticipants);


            // --------------------------------------------------------------------------
            // @ get stored request
            // --------------------------------------------------------------------------
            const storedRequest = localStorage.getItem(r.id + '_' + r.status);
            // this.logger.log('[NAVBAR] IN-APP-NOTIFICATION >> get storedRequest served >> ', r.id + '_' + r.updatedAt, ' - ', storedRequest);

            // if (r.status === 100 && !this.shown_requests[r.id] && this.user !== null) {
            if (r.status === 100 && !storedRequest && this.user !== null) {


              // *bug fix: when the user is an agent also for the unserved we have to consider if he is present in agents
              if (this.ROLE_IS_AGENT === true) {
                if (this.hasmeInAgents(r.agents) === true) {
                  this.doUnservedDateDiffAndShowNotification(r)
                }
              } else {
                this.doUnservedDateDiffAndShowNotification(r)
              }
            }


            if (this.user !== null && !storedRequest && currentUserIsInParticipants === true) {
              // const requestCreationDate = moment(r.createdAt);
              const requestUpdatedTime = moment(r.updatedAt);

              const currentTime = moment();

              // const dateDiff = currentTime.diff(requestCreationDate, 'h');
              const dateDiff = currentTime.diff(requestUpdatedTime, 's');

              const url = '#/project/' + this.projectId + '/wsrequest/' + r.request_id + '/messages'

              let contact_fullname = ''
              this.logger.log('[NAVBAR] -  currentUserIsInParticipants DATE DIFF (s) ', dateDiff);
              if (r.lead && r.lead.fullname) {
                contact_fullname = r.lead.fullname
              } else {
                contact_fullname = ""
              }

              this.showNotification(
                '<span style="font-weight: 400; font-family: Poppins, sans-serif; color:#2d323e!important">' + contact_fullname + '</span>' +
                '<em style="font-family: Poppins, sans-serif;color:#7695a5!important">' + r.first_text +
                '</em>' + `<a href="${url}" target="_self" data-notify="url" style="height: 100%; left: 0px; position: absolute; top: 0px; width: 100%; z-index: 1032;"></a>`,
                4,
                'border-left-color: rgb(77, 175, 79)',
                'new-chat-icon-served-by-me.png'
              );


              this.shown_my_requests[r.id] = true;


              // --------------------------------------------------------------------------
              // @ set request to store (notifyLastUnservedAndCurrentUserRequest)
              // --------------------------------------------------------------------------
              localStorage.setItem(r.id + '_' + r.status, 'true');

            }

          });
        }
      }, error => {
        this.logger.error('[NAVBAR] notifyLastUnservedRequest * ERROR * ', error)
      }, () => {
        this.logger.log('[NAVBAR] notifyLastUnservedRequest */* COMPLETE */*')
      })
  }

  doUnservedDateDiffAndShowNotification(r) {
    // const requestCreationDate = moment(r.createdAt);
    const requestUpdatedTime = moment(r.updatedAt);
    const currentTime = moment();
    this.logger.log('[NAVBAR] notifyLastUnservedRequest REQUEST TODAY ', currentTime);

    // const dateDiff = currentTime.diff(requestCreationDate, 'h');
    const dateDiff = currentTime.diff(requestUpdatedTime, 's');
    // this.logger.log('IN-APP-NOTIFICATION  notifyLastUnservedRequest DATE DIFF (second)', dateDiff);

    /**
     * *** NEW 29JAN19: the unserved requests notifications are not displayed if it is older than one day ***
     */


    // if (dateDiff < 5) {

    // this.lastRequest = requests[requests.length - 1];
    // this.logger.log('!!! »»» LAST UNSERVED REQUEST ', this.lastRequest)

    // this.logger.log('!!! »»» UNSERVED REQUEST IN BOOTSTRAP NOTIFY ', r)
    // const url = '#/project/' + this.projectId + '/request/' + r.id + '/messages'
    const url = '#/project/' + this.projectId + '/wsrequest/' + r.request_id + '/messages'
    this.logger.log('[NAVBAR] unserved request url ', url);

    this.logger.log('[NAVBAR] NOTIFICATION_SOUND (showNotification) before to show notification (unserved) this.notify ', this.notify)

    let contact_fullname = ''
    if (r.lead && r.lead.fullname) {
      contact_fullname = r.lead.fullname
    } else {
      contact_fullname = ""
    }

    this.showNotification(
      '<span style="font-weight: 400; font-family: Poppins, sans-serif;color:#2d323e!important">' + contact_fullname + '</span>' +
      '<em style="font-family: Poppins, sans-serif;color:#7695a5!important">' + r.first_text +
      '</em>' + `<a href="${url}" target="_self" data-notify="url" style="height: 100%; left: 0px; position: absolute; top: 0px; width: 100%; z-index: 1032;"></a>`,
      3,
      'border-left-color: rgb(237, 69, 55)',
      'new-chat-icon-unserved.png'
    );

    this.shown_requests[r.id] = true;
    // this.logger.log('IN-APP-NOTIFICATION shown_requests ', this.shown_requests)
    // r.notification_already_shown = true;

    // --------------------------------------------------------------------------
    // @ set request to store (doUnservedDateDiffAndShowNotification)
    // --------------------------------------------------------------------------
    localStorage.setItem(r.id + '_' + r.status, 'true');


  }


  showNotification(text: string, notificationColor: number, borderColor: string, chatIcon: string) {
    // this.logger.log('show notification' )
    const type = ['', 'info', 'success', 'warning', 'danger'];

    // const color = Math.floor((Math.random() * 4) + 1);
    // the tree corresponds to the orange
    const color = notificationColor

    // this.logger.log('COLOR ', color)
    // const color = '#ffffff';

    // the in-app notifications are not displayed if the route is /request-for-panel
    if (this.IS_REQUEST_FOR_PANEL_ROUTE === false && this.IS_UNSERVEDREQUEST_FOR_PANEL_ROUTE === false) {


      // const elemNotificationAlert = $('#request-notify');
      // this.logger.log('[NAVBAR] NAV NOTIFICATION_SOUND (showNotification) notify alert get by id ', elemNotificationAlert)


      this.notify = $.notify({
        icon: 'notifications',
        // message: 'Welcome to <b>Material Dashboard</b> - a beautiful freebie for every web developer.'
        // this.lastRequest.text + '<br>ID: ' + request_recipient,
        message: text
        // url: 'routerLink="/requests"',
        // url: 'https://github.com/mouse0270/bootstrap-notify',
        // url: '<a routerLink="/requests">',
        // url: this.router.navigate(['/requests']),
        // target: '_self'
        // border-left-color: rgb(255, 179, 40);

      }, {
        type: type[color],
        timer: 1000,
        template:
          `<div id="request-notify" data-notify="container" style="padding:10px!important;background-color:rgb(255, 255, 238);box-shadow:0px 0px 5px rgba(51, 51, 51, 0.3);cursor:pointer;border-left:15px solid;${borderColor}"
                    class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">` +
          '<button type="button" aria-hidden="true" class="close custom-hover" data-notify="dismiss" style="background-color:beige; padding-right:4px;padding-left:4px;border-radius:50%;">×</button>' +
          '<div class="row">' +
          '<div class="col-xs-2 col-sm-2 col-md-2 col-lg-2">' +
          '<span data-notify="icon" class="notify-icon"> ' + `<img style="width:30px!important"src="assets/img/${chatIcon}" alt="Notify Icon"></span>` +
          '</div>' +
          '<div class="col-xs-10 col-sm-10 col-md-10 col-lg-10">' +
          '<span data-notify="title">{1}</span>' +
          '<span data-notify="message">{2}</span>' +
          '</div>' +
          '</div>' +
          '</div>'
        // placement: {
        //     from: from,
        //     align: align
        // }
      },
        {
          // onClose: this.test(),
        }
      );

    } // end if IS_REQUEST_FOR_PANEL_ROUTE


    //------------------------------------------
    // Notification Sound
    //------------------------------------------


    this.NOTIFICATION_SOUND = localStorage.getItem(this.storedValuePrefix + 'sound');
    // this.logger.log('[NAVBAR] NAV NOTIFICATION_SOUND (showNotification)', this.NOTIFICATION_SOUND)
    // this.logger.log('[NAVBAR] NAV NOTIFICATION_SOUND (showNotification) hasPlayed ', this.hasPlayed)
    if (this.NOTIFICATION_SOUND === 'enabled' && this.IS_REQUEST_FOR_PANEL_ROUTE === false && this.IS_UNSERVEDREQUEST_FOR_PANEL_ROUTE === false) {
      // this.logger.log('[NAVBAR] NOTIFICATION_SOUND (showNotification) hasPlayed ', this.hasPlayed)
      if (this.hasPlayed === false) {
        // this.logger.log('[NAVBAR] NOTIFICATION_SOUND (showNotification) hasPlayed (HERE IN IF)', this.hasPlayed)
        this.audio = new Audio();
        // this.audio.src = 'assets/Carme.mp3';
        // this.audio.src = 'assets/microbounce.mp3';
        // this.audio.src = 'assets/justsaying.mp3';
        this.audio.src = 'assets/intuition-561.mp3';

        this.audio.load();
        this.audio.play();

      }

    }
    this.hasPlayed = true
    // this.logger.log('[NAVBAR] NOTIFICATION_SOUND (showNotification) hasPlayed ', this.hasPlayed)
    setTimeout(() => {
      this.hasPlayed = false
    }, 3000);
  }  // end show notification



  soundON() {
    this.NOTIFICATION_SOUND = 'enabled';
    this.setNoticationSoundUserPreference(this.NOTIFICATION_SOUND);
    this.wsRequestsService.hasChangedSoundPreference(this.NOTIFICATION_SOUND)
  }
  soundOFF() {
    this.NOTIFICATION_SOUND = 'disabled';
    this.setNoticationSoundUserPreference(this.NOTIFICATION_SOUND);
    this.wsRequestsService.hasChangedSoundPreference(this.NOTIFICATION_SOUND)
  }

  setNoticationSoundUserPreference(value) {
    // this.logger.log('[NAVBAR] NOTIFICATION_SOUND (setNoticationSoundUserPreference)', value)
    localStorage.setItem(this.storedValuePrefix + 'sound', value);
  }

  ngAfterContentChecked() {
    // this.logger.log('[NAVBAR] -- --- *** ngAfterContentChecked');
  }

  ngAfterViewChecked() {
    // this.logger.log('[NAVBAR]++ ++ +++ ngAfterViewChecked');
  }




  sidebarOpen() {
    if (this.toggleButton) {
      const toggleButton = this.toggleButton;
      const body = document.getElementsByTagName('body')[0];
      setTimeout(function () {
        toggleButton.classList.add('toggled');
      }, 500);
      body.classList.add('nav-open');

      this.sidebarVisible = true;
    }

    try {
      if (window && window['tiledesk_widget_hide']) {
        this.logger.log('[NAV] - HIDE WIDGET - HERE 1')
        window['tiledesk_widget_hide']();
      }
    } catch (e) {
      this.logger.error('tiledesk_widget_hide ERROR', e)
    }
  };
  sidebarClose() {
    // this.logger.log('[NAVBAR] sidebarClose clicked')
    const body = document.getElementsByTagName('body')[0];
    if (this.toggleButton) {
      this.toggleButton.classList.remove('toggled');
    }
    this.sidebarVisible = false;
    body.classList.remove('nav-open');

    try {
      if (window && window['tiledesk_widget_show']) {
        this.logger.log('[NAV] - SHOW WIDGET - HERE 1')
        window['tiledesk_widget_show']();
      }
    } catch (e) {
      this.logger.error('tiledesk_widget_show ERROR', e)
    }

  };

  sidebarToggle() {
    this.logger.log('[NAVBAR] sidebarToggle clicked')
    // const toggleButton = this.toggleButton;
    // const body = document.getElementsByTagName('body')[0];
    if (this.sidebarVisible === false) {
      this.sidebarOpen();
    } else {
      this.sidebarClose();
    }
  };

  getTitle() {
    var titlee = this.location.prepareExternalUrl(this.location.path());
    if (titlee.charAt(0) === '#') {
      titlee = titlee.slice(2);
    }
    titlee = titlee.split('/').pop();

    for (var item = 0; item < this.listTitles.length; item++) {
      if (this.listTitles[item].path === titlee) {
        return this.listTitles[item].title;
      }
    }
    return 'Dashboard';
  }

  getProjectUserId() {
    this.usersService.project_user_id_bs.subscribe((projectUser_id) => {
      this.logger.log('[NAVBAR] - PROJECT-USER-ID ', projectUser_id);
      this.projectUser_id = projectUser_id;
    });
  }

  openLogoutModal() {
    this.displayLogoutModal = 'block';
    this.auth.hasOpenedLogoutModal(true);
  }

  onCloseModal() {
    this.displayLogoutModal = 'none';
  }

  onCloseLogoutModalHandled() {
    this.displayLogoutModal = 'none';
  }

  onLogoutModalHandled() {
    this.logout();
    this.displayLogoutModal = 'none';
  }

  logout() {
    this.logger.log('[NAVBAR] RUN LOGOUT FROM NAV-BAR')
    this.auth.showExpiredSessionPopup(false);
    this.auth.signOut('navbar');
  }

  testExpiredSessionFirebaseLogout() {
    this.auth.testExpiredSessionFirebaseLogout(true)
  }

  // NOT USED
  // openChat() {
  //     const url = this.CHAT_BASE_URL;
  //     window.open(url, '_blank');
  // }

  getFromLocalStorageHasOpenedTheChat() {
    const storedChatOpenedValue = localStorage.getItem('chatOpened');
    this.logger.log('[NAVBAR] + + + STORED CHAT OPENED VALUE ', storedChatOpenedValue);
    if (storedChatOpenedValue && storedChatOpenedValue === 'true') {
      this.HAS_OPENED_THE_CHAT = true;
      this.logger.log('[NAVBAR] + + + HAS OPENED THE CHAT ', this.HAS_OPENED_THE_CHAT);
    } else {
      this.HAS_OPENED_THE_CHAT = false;
      this.logger.log('[NAVBAR] + + + HAS OPENED THE CHAT ', this.HAS_OPENED_THE_CHAT);
    }
  }

  // changeThemeColor() {
  //   this.document.body.classList.add('dark');
  // }
}
