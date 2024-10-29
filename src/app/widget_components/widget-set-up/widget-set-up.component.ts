import { Component, OnInit, AfterViewInit, HostListener, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ColorPickerService } from 'ngx-color-picker';
import { WidgetService } from '../../services/widget.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../core/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs'
import { Department } from '../../models/department-model';
import { DepartmentService } from '../../services/department.service';
import { NotifyService } from '../../core/notify.service';
import { WidgetSetUpBaseComponent } from './widget-set-up-base/widget-set-up-base.component';
import { AppConfigService } from '../../services/app-config.service';


// import brand from 'assets/brand/brand.json';
import { BrandService } from '../../services/brand.service';
import { HumanizeDurationLanguage, HumanizeDuration } from 'humanize-duration-ts';
import { LoggerService } from '../../services/logger/logger.service';
import { UsersService } from '../../services/users.service';
import { Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { APP_SUMO_PLAN_NAME, PLAN_NAME, URL_google_tag_manager_add_tiledesk_to_your_sites, checkAcceptedFile, filterImageMimeTypesAndExtensions, isMaliciousHTML, isMaliciousURL } from '../../utils/util';
import { NgSelectComponent } from '@ng-select/ng-select';
import * as moment from 'moment';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { UploadImageService } from 'app/services/upload-image.service';
import { UploadImageNativeService } from 'app/services/upload-image-native.service';

const swal = require('sweetalert');
const Swal = require('sweetalert2')

import { AbstractControl, FormControl } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { isDevMode } from '@angular/core';
import { SelectOptionsTranslatePipe } from '../../selectOptionsTranslate.pipe';
import { AnalyticsService } from 'app/services/analytics.service';
import { LocalDbService } from 'app/services/users-local-db.service';

@Component({
  selector: 'appdashboard-widget-set-up',
  templateUrl: './widget-set-up.component.html',
  styleUrls: ['./widget-set-up.component.scss']
})


export class WidgetSetUp extends WidgetSetUpBaseComponent implements OnInit, AfterViewInit, OnDestroy {
  PLAN_NAME = PLAN_NAME;
  APP_SUMO_PLAN_NAME = APP_SUMO_PLAN_NAME;
  prjct_profile_name_for_segment: string;
  public disabled = false;
  public color: ThemePalette = 'primary';
  public touchUi = false;

  colorCtr: AbstractControl = new FormControl(null);

  public options = [
    { value: true, label: 'True' },
    { value: false, label: 'False' }
  ];

  public listColors = ['primary', 'accent', 'warn'];

  private unsubscribe$: Subject<any> = new Subject<any>();

  @ViewChild('testwidgetbtn', { static: false }) elementRef: ElementRef;
  @ViewChild("multilanguage", { static: false }) multilanguageRef: ElementRef;
  @ViewChild(NgSelectComponent, { static: false }) ngSelectComponent: NgSelectComponent;
  tparams: any;
  t_params: any;
  company_name: any;
  company_site_url: any;
  TESTSITE_BASE_URL: string;
  public_Key: string;
  _route: string;
  public primaryColor: string;
  public primaryColorRgb: any
  public primaryColorRgba: string;
  public primaryColorGradiend: string;
  public primaryColorBorder: string;
  public secondaryColor: string;

  // PrimaryColor opacity
  public primaryColorOpacityEnabled: boolean = false
  // public themeColorOpacity: string = "0.50"
  public themeColorOpacity: string = "1"

  public logoUrl: string;
  public hasOwnLogo = false;

  public customLauncherURL: string;
  public hasOwnLauncherLogo: boolean = false;
  public hasOwnLauncherBtn: boolean = false;
  public launcherLogoUrl: string;
  public singleConversation: boolean = false;
  public timeStamp: any;

  public footerBrand: string
  public id_project: string;

  default_dept: Department[];
  public widgetObj = {};
  hasSelectedLeftAlignment = false
  hasSelectedRightAlignment = true
  private fragment: string;

  private subscription: Subscription;
  ticks: any;
  start: number;
  stop: number;

  // HAS_CHANGED_WELCOME_TITLE = false;
  // HAS_CHANGED_WELCOME_MSG = false;

  HIDE_WELCOME_TITLE_SAVE_BTN = true;

  browserLang: string;
  LOGO_IS_ON: boolean;

  // calloutTimerSecondSelected = -1;
  calloutTimerSecondSelected: number;

  // preChatForm = 'preChatForm'
  // { seconds: 'immediately', value: 0 },

  calloutTitle: string;
  calloutTitleText: string;
  // _calloutTitle: string;
  escaped_calloutTitle: string;

  calloutMsg: string;
  calloutMsgText: string;
  escaped_calloutMsg: string;

  CALLOUT_IS_DISABLED: boolean;

  defaultdept_id: string;

  newInnerWidth: any;
  initInnerWidth: any;
  custom_breakpoint: boolean;
  sub: Subscription;

  showSpinner = true;
  projectName: string;

  HAS_SELECTED_GREENTINGS = false;
  HAS_SELECTED_CALLOUT = false;
  HAS_SELECTED_APPEARANCE = false;

  calloutContainerWidth: any;
  IMAGE_EXIST: boolean;
  CUSTOM_LAUNCHER_LOGO_EXIST: boolean;

  translations: any
  selected_translation: Array<any> = []
  languages_codes: any;

  selectedLang: string;
  selectedLangCode: string;
  selectedLangName: string;
  wd_availableTranslations: Array<any> = []

  defaultLangCode: string;

  public welcomeTitle: string;
  public placeholderWelcomeTitle: string;
  public welcomeMsg: string;
  public placeholderWelcomeMsg: string;
  public onlineMsg: string; // LABEL_FIRST_MSG
  public offlineMsg: string; // LABEL_FIRST_MSG_NO_AGENTS
  public officeClosedMsg: string; // LABEL_FIRST_MSG_OPERATING_HOURS_CLOSED
  public newConversation: string // LABEL_START_NW_CONV
  public noConversation: string // NO_CONVERSATION
  public waitingTimeNotFoundMsg: string; // WAITING_TIME_NOT_FOUND
  public waitingTimeFoundMsg: string; //  WAITING_TIME_FOUND
  public LABEL_PLACEHOLDER: string; //  "type your message.."

  placeholderOnlineMsg: string;
  placeholderOfflineMsg: string;
  placeholderofficeClosedMsg: string;
  placeholderCalloutTitle: string;
  placeholderCalloutMsg: string;
  isVisible: boolean;

  callout_emoticon: string;
  calloutTitleForPreview: string;

  DISPLAY_WIDGET_HOME = true;
  DISPLAY_CALLOUT = false;
  DISPLAY_WIDGET_CHAT = false;
  DISPLAY_LAUNCER_BUTTON = false
  DISPLAY_WIDGET_PRECHAT_FORM = false

  HAS_FOCUSED_ONLINE_MSG = false;
  HAS_FOCUSED_OFFLINE_MSG = false;
  HAS_FOCUSED_OFFICE_CLOSED_MSG = false;

  widget_home_has_conversation = false;

  C21_BODY_HOME = true
  imageStorage: string;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;
  imageUrl: string;
  currentUserId: string;
  preChatFormFieldName: string
  displayNewCustomPrechatFormBuilder: boolean;
  hasBuiltPrechatformWithVisualTool: boolean;
  NEW_PRECHAT_LABEL_ARE_MISSING: boolean = false;

  featureAvailableFromBPlan: string;
  featureAvailableFromEPlan: string;

  cancel: string;
  upgradePlan: string;
  appSumoProfile: string;
  appSumoProfilefeatureAvailableFromBPlan: string;

  desktop_widget_is_visible: boolean = true;
  mobile_widget_is_visible: boolean = true;

  widget_status_on_page_change = [
    { id: 'open', name: 'Always opened' },
    { id: 'close', name: 'Always Closed' },
    { id: 'last', name: 'As last status' }
  ]

  desktopWidgetStatus: 'open' | 'close' | 'last' = 'close'
  mobileWidgetStatus: 'open' | 'close' | 'last' = 'close'

  en_missing_labels =
    {
      "Full name": "Full name",
      "Email": "Email",
      "Phone": "Phone",
      "Invalid email address": "Invalid email address",
      "Your message for the support team": "Your message for the support team",
      "Before proceeding in the conversation please agree to our <a href='https://tiledesk.com/termsofservice/' target='_blank'>Terms</a> and <a href='https://tiledesk.com/privacy.html' target='_blank'>Privacy Policy</a>": "Before proceeding in the conversation please agree to our <a href='https://tiledesk.com/termsofservice/' target='_blank'>Terms</a> and <a href='https://tiledesk.com/privacy.html' target='_blank'>Privacy Policy</a>",
      "I agree": "I agree",
      "This field is required": "This field is required"
    }


  preChatFormFields = [
    {
      "name": "userFullname",
      "type": "text",
      "mandatory": true,
      "label": "LABEL_PRECHAT_USER_FULLNAME",
    },
    {
      "name": "userEmail",
      "type": "text",
      "mandatory": true,
      "regex": "/^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/",
      "label": "LABEL_PRECHAT_USER_EMAIL",
      "errorLabel": "LABEL_PRECHAT_USER_EMAIL_ERROR"
    },
    {
      "name": "userPhone",
      "type": "text",
      "mandatory": true,
      "label": "LABEL_PRECHAT_USER_PHONE",
      "errorLabel": "LABEL_PRECHAT_USER_PHONE_ERROR"
    },
    {
      "name": "termsPrivacyLabel",
      "type": "static",
      "label": "LABEL_PRECHAT_STATIC_TERMS_PRIVACY"
    },
    {
      "type": "checkbox",
      "name": "acceptedTermsPrivacy",
      "label": "LABEL_PRECHAT_ACCEPT_TERMS_PRIVACY",
      "errorLabel": "LABEL_PRECHAT_ACCEPT_TERMS_PRIVACY_ERROR",
      "mandatory": "true"
    },
    {
      "name": "firstMessage",
      "rows": 5,
      "type": "textarea",
      "mandatory": false,
      "label": "LABEL_PRECHAT_FIRST_MESSAGE"
    }
  ]
  preChatformCustomFieldTypeSelect = [
    { id: 'text', name: 'Input' },
    { id: 2, name: 'Label' },
    { id: 3, name: 'Checkbox' },
    { id: 4, name: 'Texarea' }
  ];

  displayModalCreateCustomField: string = 'none'
  customFieldName: string;
  customFieldType: string;
  // customFieldType: string = 'Input'
  customFieldLabel: string;
  customFieldRegexExpression: string;
  customFieldErrorLabel: string;
  customFieldTextAreaRow: number;

  // preChatFieldModel = {
  //   "name": "",
  //   "rows": "",
  //   "type": "",
  //   "mandatory": "",
  //   "label": "",
  //   "regex": "",
  //   "errorLabel": "",
  // }

  @ViewChild('Selecter', { static: false }) ngselect: NgSelectComponent;



  LABEL_PRECHAT_USER_FULLNAME: string;
  LABEL_PRECHAT_USER_EMAIL: string;
  LABEL_PRECHAT_USER_PHONE: string;
  LABEL_PRECHAT_FIRST_MESSAGE: string;
  PRECHAT_FIRST_MESSAGE_ROWS: number;
  LABEL_PRECHAT_STATIC_TERMS_PRIVACY: string;
  LABEL_PRECHAT_ACCEPT_TERMS_PRIVACY: string;
  LABEL_FIELD_EMAIL: string; // for default prechat-form
  LABEL_FIELD_NAME: string; // for default prechat-form
  LABEL_COMPLETE_FORM: string;
  widget_preview_selected = '0000';
  widget_preview_status = [
    { id: '0000', name: 'Home' },
    { id: '0001', name: 'Home with converations' },
    { id: '0002', name: 'Chat' },
    { id: '0003', name: 'Callout' },
    { id: '0004', name: 'Closed' },
    { id: '0005', name: 'Pre-chat form' }
  ];

  lang: any;
  responseAVGtime: String;

  langService: HumanizeDurationLanguage = new HumanizeDurationLanguage();
  humanizer: HumanizeDuration = new HumanizeDuration(this.langService);

  HAS_SELECT_DYMANIC_REPLY_TIME_MSG: boolean;
  HAS_SELECT_STATIC_REPLY_TIME_MSG: boolean;
  has_copied = false;
  WIDGET_URL: string;
  HAS_SELECT_INSTALL_WITH_CODE: boolean = false;
  HAS_SELECT_INSTALL_WITH_GTM: boolean = false;
  addWhiteSpaceBefore: boolean;
  current_user_name: string

  warningMsg: string;
  warning_translated: string;
  custom_prechat_form_is_empty_and_will_be_disabled_msg: string;
  noDefaultLanguageIsSetUpMsg: string;
  noLanguagesAreSetUpMsg: string;
  goToMultilanguagePageMsg: string;
  goToMultilanguageSectionMsg: string;
  setDefaultLangInMultilanguageSection: string;
  toAddLanguagesToYourProjectMsg: string;
  cancelMsg: string;
  HAS_CHANGED_GREETINGS = false;

  public preChatForm: boolean;
  public nativeRating: boolean;
  public enablePrechatformFieldsCheckBox: boolean;
  public prechatFormTexareaJson: any;
  public prechatFormArray: Array<any> = [];
  public preChatFormJson: any;
  public preChatFormFielsBtnsArray: Array<any> = [];
  public preChatFormCustomFieldsEnabled: boolean;
  public HAS_ACTIVATED_PRECHAT_CUSTOM_FIELDS: boolean;
  public USER_ROLE: string;
  IS_OPEN_SETTINGS_SIDEBAR: boolean;
  isChromeVerGreaterThan100: boolean;

  public prjct_name: string;
  public prjct_profile_name: string;
  public profile_name: string;
  public prjct_profile_type: string;
  public prjct_trial_expired: boolean;
  public subscription_is_active: boolean;
  public subscription_end_date: Date;
  public onlyOwnerCanManageTheAccountPlanMsg: string;
  public learnMoreAboutDefaultRoles: string;
  public payIsVisible: boolean;
  public isVisibleWidgetUnbranding: boolean;
  public featureIsAvailable: boolean;
  public user: any;
  public hideHelpLink: boolean;
  public companyNametParams: any;
  public widgetLogoURL: string;
  public defaultFooter: string;
  isAppSumo: boolean;
  // public widgetLauncherButtonPlaceholder: string;

  @ViewChild('fileInputLauncherBtnlogo', { static: false }) fileInputLauncherBtnlogo: any;

  fileUploadAccept: string;

  constructor(
    private notify: NotifyService,
    public location: Location,
    private cpService: ColorPickerService,
    private widgetService: WidgetService,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private auth: AuthService,
    public translate: TranslateService,
    private departmentService: DepartmentService,
    private router: Router,
    public appConfigService: AppConfigService,
    public brandService: BrandService,
    private analyticsService: AnalyticsService,
    private logger: LoggerService,
    private usersService: UsersService,
    private prjctPlanService: ProjectPlanService,
    private uploadImageService: UploadImageService,
    private uploadImageNativeService: UploadImageNativeService,
    public selectOptionsTranslatePipe: SelectOptionsTranslatePipe,
    public localDbService: LocalDbService
  ) {
    super(translate);
    const brand = brandService.getBrand();

    this.tparams = brand;
    this.company_name = brand['BRAND_NAME'];
    this.company_site_url = brand['COMPANY_SITE_URL'];
    this.hideHelpLink = brand['DOCS'];
    this.companyNametParams = { 'BRAND_NAME': this.company_name }
    // this.widgetLogoURL = brand['widget_logo_URL']
    // this.defaultFooter = brand['widget_default_footer'];

    this.widgetLogoURL = brand['WIDGET']['LOGO_CHAT'];
    // this.logger.log('[WIDGET-SET-UP] widgetLogoURL ', this.widgetLogoURL)

    this.defaultFooter = brand['WIDGET']['POWERED_BY'];
    // this.logger.log('[[WIDGET-SET-UP] defaultFooter ', this.defaultFooter)

    // this.logger.log('[WIDGET-SET-UP] widgetLauncherButtonPlaceholder ', this.widgetLauncherButtonPlaceholder)
    // this.t_params = { 'plan_name': PLAN_NAME.B }
  }

  ngOnInit() {
    // this.auth.checkRoleForCurrentProject();
    this.getProjectPlan()
    this.getProjectUserRole();
    // this.HAS_SELECT_INSTALL_WITH_CODE = false
    this.getImageStorage();
    this.getWidgetUrl();
    this.getLoggedUser();
    this.onInitWindowWidth();
    this.getCurrentProject();
    // this.getEnDefaultTranslation();
    this.getBrowserLang();

    this.route.fragment.subscribe(fragment => {
      this.fragment = fragment;
      this.logger.log('[WIDGET-SET-UP] - FRAGMENT ', this.fragment)
    });

    this.translateTextBaseComp();
    // this.getSectionSelected();
    this.getLabels();
    this.getOSCODE();
    this.getTestSiteUrl();
    // this.getAndManageAccordionInstallWidget();
    this.getAndManageAccordion();
    // this.avarageWaitingTimeCLOCK(); // as dashboard
    // this.showWaitingTime(); // as dario


    this.logger.log('[WIDGET-SET-UP] window.matchMedia ', window.matchMedia)
    this.lang = this.translate.getBrowserLang();
    this.logger.log('[WIDGET-SET-UP] LANGUAGE ', this.lang);
    this.listenSidebarIsOpened();
    this.geti118nTranslations();
    this.getBrowserVersion();
    this.getImageStorage();

    this.fileUploadAccept = filterImageMimeTypesAndExtensions(this.appConfigService.getConfig().fileUploadAccept).join(',')
  }

  getImageStorage() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.imageStorage = firebase_conf['storageBucket'];
      this.setLauncherLogoUrl(this.imageStorage)
      // this.logger.log('[WIDGET-SET-UP] IMAGE STORAGE ', this.imageStorage, 'usecase firebase')
    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.imageStorage = this.appConfigService.getConfig().SERVER_BASE_URL;
      // this.logger.log('[WIDGET-SET-UP] IMAGE STORAGE ', this.imageStorage, 'usecase native')

    }
  }

  uploadLauncherButtonLogo(event) {
    if (this.hasOwnLauncherBtn) {
      swal({
        title: this.warningMsg,
        text: this.noDefaultLanguageIsSetUpMsg + '. ' + this.setDefaultLangInMultilanguageSection,
        // content: el,
        icon: "warning",
        buttons: {
          cancel: `${this.cancelMsg}`,
          catch: {
            text: `${this.goToMultilanguageSectionMsg}`,
            value: "catch",
          },
        },

        // `"Cancel", ${this.goToMultilanguagePageMsg}`],
        dangerMode: false,
      })
        .then((value) => {
          //  this.logger.log('[WIDGET-SET-UP] - uploadLauncherButtonLogo value', value)

          if (value === 'catch') {

          }
        })
    }
  }



  deleteCustomLauncherLogo() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.logger.log('[USER-PROFILE] IMAGE deleteUserProfileImage with firebase service')
      this.uploadImageService.deleteCustomLauncherLogo(this.id_project);
      this.subscibeHasDeletedCustomLauncherLogo()

    } else {
      this.logger.log('[USER-PROFILE] IMAGE deleteUserProfileImage with native service')
      this.uploadImageNativeService.deletePhotoProfile_Native(this.id_project, 'user');
    }
  }

  subscibeHasDeletedCustomLauncherLogo() {
    this.uploadImageService.hasdeletedLauncherLogo$.subscribe((hasdeleted) => {
      // this.logger.log('[WIDGET-SET-UP] IMAGE upload with fb service downoloadurl ', hasdeleted);

      this.hasOwnLauncherLogo = false
      // this.launcherLogoUrl = downoloadurl;
    })
  }


  subscribeToLauncherLogoUrl() {
    this.uploadImageService.hasUploadedLauncherLogo$.subscribe((downoloadurl) => {
      // this.logger.log('[WIDGET-SET-UP] IMAGE upload with fb service downoloadurl ', downoloadurl);
      this.setLauncherLogoUrl(this.imageStorage)
      // this.hasOwnLauncherLogo = true
      // this.hasOwnLauncherBtn = false
      // this.launcherLogoUrl = downoloadurl;
    })
  }

  setLauncherLogoUrl(imageStorage) {
    // this.logger.log('[WIDGET-SET-UP] setLauncherLogoUrl storageBucket ', imageStorage)
    this.launcherLogoUrl = ''
    if (this.UPLOAD_ENGINE_IS_FIREBASE) {
      // this.launcherLogoUrl = this.launcherLogoUrl = "https://firebasestorage.googleapis.com/v0/b/" + imageStorage + "/o/public%2Fimages%2F" + this.id_project + "%2Flauncher_logo.jpg?alt=media"
      this.launcherLogoUrl = 'https://firebasestorage.googleapis.com/v0/b/' + imageStorage + '/o/profiles%2F' + this.id_project + '%2Flauncher.jpg?alt=media';
      this.verifyLauncherLogoImgFireBase(this.launcherLogoUrl, (imageExists) => {
        if (imageExists === true) {
          this.hasOwnLauncherLogo = true
          this.hasOwnLauncherBtn = false

          // this.logger.log('[USER-SERV] - LAUNCHER LOGO EXIST ON FB? ', imageExists)
        }
      });
    } else {
      this.launcherLogoUrl = imageStorage + 'images?path=uploads%2Fusers%2F' + this.id_project + '%2Fimages%2Fthumbnails_200_200-photo.jpg'
    }
    this.timeStamp = (new Date()).getTime();

  }

  verifyLauncherLogoImgFireBase(image_url, callBack) {
    const img = new Image();
    img.src = image_url;
    img.onload = function () {
      callBack(true);
    };
    img.onerror = function () {
      callBack(false);
    };
  }


  getLauncherLogoUrl() {
    if (this.timeStamp) {
      return this.launcherLogoUrl + '&' + this.timeStamp;
    }
    return this.launcherLogoUrl
  }

  getProjectPlan() {
    this.prjctPlanService.projectPlan$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((projectProfileData: any) => {
        this.logger.log('[WIDGET-SET-UP] - getProjectPlan project Profile Data', projectProfileData)
        if (projectProfileData) {


          this.prjct_name = projectProfileData.name;
          // this.prjct_profile_name = projectProfileData.profile_name;
          this.profile_name = projectProfileData.profile_name;
          this.prjct_trial_expired = projectProfileData.trial_expired;
          this.prjct_profile_type = projectProfileData.profile_type;
          this.subscription_is_active = projectProfileData.subscription_is_active;
          this.subscription_end_date = projectProfileData.subscription_end_date;

          // this.getOSCODE(projectProfileData);
          this.manageWidgetUnbrandingVisibility(projectProfileData)



          if (projectProfileData.extra3) {
            this.logger.log('[WIDGET-SET-UP] projectProfileData.extra3 ', projectProfileData.extra3)
            this.appSumoProfile = APP_SUMO_PLAN_NAME[projectProfileData.extra3]
            this.appSumoProfilefeatureAvailableFromBPlan = APP_SUMO_PLAN_NAME['tiledesk_tier3']
            if (projectProfileData.extra3 === "tiledesk_tier1" || projectProfileData.extra3 === "tiledesk_tier2") {
              // this.t_params = { 'plan_name': this.appSumoProfilefeatureAvailableFromBPlan }
              this.logger.log('[WIDGET-SET-UP] H0 ')
            }
          }
          // else if (!projectProfileData.extra3) {
          //   this.t_params = { 'plan_name': PLAN_NAME.B }
          // }


          if (projectProfileData.profile_type === 'free') {
            if (projectProfileData.trial_expired === false) {
              // Trial active
              if (this.profile_name === 'free') {
                this.isAppSumo = false
                this.prjct_profile_name_for_segment = PLAN_NAME.B + " plan (trial)"
                this.prjct_profile_name = PLAN_NAME.B + " plan (trial)"
                this.logger.log('[WIDGET-SET-UP] n0 ')
                this.featureIsAvailable = true;
              } else if (this.profile_name === 'Sandbox') {
                this.isAppSumo = false
                this.logger.log('[WIDGET-SET-UP] n1 ')
                this.featureIsAvailable = true;
                this.prjct_profile_name_for_segment = PLAN_NAME.E + " plan (trial)"
                this.prjct_profile_name = PLAN_NAME.E + " plan (trial)"
              }

            } else {
              // Trial expired
              if (this.profile_name === 'free') {
                this.isAppSumo = false
                this.prjct_profile_name_for_segment = "Free plan";
                this.prjct_profile_name = "Free plan";
                this.logger.log('[WIDGET-SET-UP] n2 ')
                // this.t_params = { 'plan_name': PLAN_NAME.B }
                this.t_params = { 'plan_name_1': PLAN_NAME.E, 'plan_name_2': PLAN_NAME.EE }
                this.featureIsAvailable = false;

              } else if (this.profile_name === 'Sandbox') {
                this.isAppSumo = false
                this.logger.log('[WIDGET-SET-UP] n3 ')
                this.t_params = { 'plan_name_1': PLAN_NAME.E, 'plan_name_2': PLAN_NAME.EE }
                this.featureIsAvailable = false;

                this.prjct_profile_name_for_segment = "Sandbox plan";
                this.prjct_profile_name = "Sandbox plan";
              }

            }
          } else if (projectProfileData.profile_type === 'payment') {

            if (this.subscription_is_active === true) {

              if (projectProfileData.profile_name === PLAN_NAME.A) {

                // Growth sub active
                if (!this.appSumoProfile) {
                  this.isAppSumo = false
                  this.prjct_profile_name_for_segment = PLAN_NAME.A + " plan";
                  this.prjct_profile_name = PLAN_NAME.A + " plan";
                  this.featureIsAvailable = false;
                  // this.t_params = { 'plan_name': PLAN_NAME.B }
                  this.t_params = { 'plan_name_1': PLAN_NAME.E, 'plan_name_2': PLAN_NAME.EE }

                  // Growth AppSumo sub active
                } else {
                  this.isAppSumo = true
                  this.prjct_profile_name_for_segment = PLAN_NAME.A + " plan " + '(' + this.appSumoProfile + ')';
                  this.prjct_profile_name = PLAN_NAME.A + " plan " + '(' + this.appSumoProfile + ')';
                  this.featureIsAvailable = false;
                  this.t_params = { 'plan_name': this.appSumoProfilefeatureAvailableFromBPlan }
                }
              } else if (projectProfileData.profile_name === PLAN_NAME.B) {
                // Scale sub active
                if (!this.appSumoProfile) {
                  this.isAppSumo = false
                  this.prjct_profile_name_for_segment = PLAN_NAME.B + " plan";
                  this.prjct_profile_name = PLAN_NAME.B + " plan";
                  this.featureIsAvailable = true;
                  // Scale AppSumo sub active
                } else {
                  this.isAppSumo = true
                  this.prjct_profile_name_for_segment = PLAN_NAME.B + " plan " + '(' + this.appSumoProfile + ')';
                  this.prjct_profile_name = PLAN_NAME.B + " plan " + '(' + this.appSumoProfile + ')';
                  this.featureIsAvailable = true;
                }
                // Plus sub active
              } else if (projectProfileData.profile_name === PLAN_NAME.C) {
                this.isAppSumo = false
                this.prjct_profile_name_for_segment = PLAN_NAME.C + " plan";
                this.prjct_profile_name = PLAN_NAME.C + " plan";
                this.featureIsAvailable = true;

                // Basic sub active
              } else if (projectProfileData.profile_name === PLAN_NAME.D) {
                this.isAppSumo = false
                this.prjct_profile_name_for_segment = PLAN_NAME.D + " plan";
                this.prjct_profile_name = PLAN_NAME.D + " plan";
                // this.t_params = { 'plan_name': PLAN_NAME.E }
                this.t_params = { 'plan_name_1': PLAN_NAME.E, 'plan_name_2': PLAN_NAME.EE }
                this.featureIsAvailable = false;

                // Premium sub active
              } else if (projectProfileData.profile_name === PLAN_NAME.E) {
                this.isAppSumo = false
                this.prjct_profile_name_for_segment = PLAN_NAME.E + " plan";
                this.prjct_profile_name = PLAN_NAME.E + " plan";
                this.featureIsAvailable = true;

                // Team sub active
              } else if (projectProfileData.profile_name === PLAN_NAME.EE) {
                this.isAppSumo = false
                this.prjct_profile_name_for_segment = PLAN_NAME.EE + " plan";
                this.prjct_profile_name = PLAN_NAME.EE + " plan";
                this.featureIsAvailable = true;

                // Custom sub active
              } else if (projectProfileData.profile_name === PLAN_NAME.F) {
                this.isAppSumo = false
                this.prjct_profile_name_for_segment = PLAN_NAME.F + " plan";
                this.prjct_profile_name = PLAN_NAME.F + " plan";
                this.featureIsAvailable = true;
              }

            } else if (this.subscription_is_active === false) {
              // Growth sub expired
              if (projectProfileData.profile_name === PLAN_NAME.A) {
                this.isAppSumo = false
                this.prjct_profile_name = PLAN_NAME.A + " plan"
                // this.t_params = { 'plan_name': PLAN_NAME.B }
                this.t_params = { 'plan_name_1': PLAN_NAME.E, 'plan_name_2': PLAN_NAME.EE }
                this.featureIsAvailable = false;

                // Scale sub expired
              } else if (projectProfileData.profile_name === PLAN_NAME.B) {
                this.isAppSumo = false
                this.prjct_profile_name = PLAN_NAME.B + " plan"
                // this.t_params = { 'plan_name': PLAN_NAME.B }
                this.t_params = { 'plan_name_1': PLAN_NAME.E, 'plan_name_2': PLAN_NAME.EE }
                this.featureIsAvailable = false;

                // Plus sub expired
              } else if (projectProfileData.profile_name === PLAN_NAME.C) {
                this.isAppSumo = false
                this.prjct_profile_name = PLAN_NAME.C + " plan"
                // this.t_params = { 'plan_name': PLAN_NAME.B }
                this.t_params = { 'plan_name_1': PLAN_NAME.E, 'plan_name_2': PLAN_NAME.EE }
                this.featureIsAvailable = false;

                // Basic sub expired
              } else if (projectProfileData.profile_name === PLAN_NAME.D) {
                this.isAppSumo = false
                this.prjct_profile_name = PLAN_NAME.D + " plan"
                // this.t_params = { 'plan_name': PLAN_NAME.E }
                this.t_params = { 'plan_name_1': PLAN_NAME.E, 'plan_name_2': PLAN_NAME.EE }
                this.featureIsAvailable = false;

                // Premium sub expired
              } else if (projectProfileData.profile_name === PLAN_NAME.E) {
                this.isAppSumo = false
                this.prjct_profile_name = PLAN_NAME.E + " plan"
                // this.t_params = { 'plan_name': PLAN_NAME.E }
                this.t_params = { 'plan_name_1': PLAN_NAME.E, 'plan_name_2': PLAN_NAME.EE }
                this.featureIsAvailable = false;

                // Team sub expired
              } else if (projectProfileData.profile_name === PLAN_NAME.EE) {
                this.isAppSumo = false
                this.prjct_profile_name = PLAN_NAME.EE + " plan"
                // this.t_params = { 'plan_name': PLAN_NAME.EE }
                this.t_params = { 'plan_name_1': PLAN_NAME.E, 'plan_name_2': PLAN_NAME.EE }
                this.featureIsAvailable = false;

                // Custom sub expired
              } else if (projectProfileData.profile_name === PLAN_NAME.F) {
                this.isAppSumo = false
                this.prjct_profile_name = PLAN_NAME.F + " plan"
                // this.t_params = { 'plan_name': PLAN_NAME.E }
                this.t_params = { 'plan_name_1': PLAN_NAME.E, 'plan_name_2': PLAN_NAME.EE }
                this.featureIsAvailable = false;

              }

            }
          }
        }
      }, error => {

        this.logger.error('[WIDGET-SET-UP] - getProjectPlan - ERROR', error);
      }, () => {
        this.logger.log('[WIDGET-SET-UP] - getProjectPlan * COMPLETE *')
      });
  }

  getWunValue() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    // this.logger.log('[WIDGET-SET-UP] getAppConfig  public_Key', this.public_Key);
    // this.logger.log('[WIDGET-SET-UP] getAppConfig  public_Key type of', typeof this.public_Key);
    // this.logger.log('[WIDGET-SET-UP] getAppConfig  this.public_Key.includes("WUN") ', this.public_Key.includes("WUN"));
    // let substring = this.public_Key.substring(this.public_Key.indexOf('WUN'));
    let parts = this.public_Key.split('-');
    // this.logger.log('[WIDGET-SET-UP] getAppConfig  parts ', parts);

    let wun = parts.find((part) => part.startsWith('WUN'));
    this.logger.log('[WIDGET-SET-UP] getAppConfig  wun ', wun);
    let wunParts = wun.split(':');
    this.logger.log('[WIDGET-SET-UP] getAppConfig  wunParts ', wunParts);
    let wunValue = wunParts[1]
    this.logger.log('[WIDGET-SET-UP] getAppConfig  wunValue ', wunValue);
    if (wunValue === 'T') {
      return true
    } else if (wunValue === 'F') {
      return false
    }

  }

  manageWidgetUnbrandingVisibility(projectProfileData) {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    if (projectProfileData['customization']) {
      this.logger.log('[WIDGET-SET-UP] USECASE EXIST customization > widgetUnbranding (1)', projectProfileData['customization']['widgetUnbranding'])
    }

    if (projectProfileData['customization'] && projectProfileData['customization']['widgetUnbranding'] !== undefined) {
      this.logger.log('[WIDGET-SET-UP] USECASE A EXIST customization ', projectProfileData['customization'], ' & widgetUnbranding', projectProfileData['customization']['widgetUnbranding'])

      if (projectProfileData['customization']['widgetUnbranding'] === true) {
        this.isVisibleWidgetUnbranding = true;
        this.logger.log('[WIDGET-SET-UP] Widget unbranding USECASE A isVisibleWidgetUnbranding', this.isVisibleWidgetUnbranding)
      } else if (projectProfileData['customization']['widgetUnbranding'] === false) {

        this.isVisibleWidgetUnbranding = false;
        this.logger.log('[WIDGET-SET-UP] Widget unbranding USECASE A isVisibleWidgetUnbranding', this.isVisibleWidgetUnbranding)
      }

    } else if (projectProfileData['customization'] && projectProfileData['customization']['widgetUnbranding'] === undefined) {
      this.logger.log('[WIDGET-SET-UP] USECASE B EXIST customization ', projectProfileData['customization'], ' BUT widgetUnbranding IS', projectProfileData['customization']['widgetUnbranding'])

      if (this.public_Key.includes("WUN")) {
        this.logger.log('[WIDGET-SET-UP] Widget unbranding  USECASE B  (from FT) - EXIST WUN ', this.public_Key.includes("WUN"));

        this.isVisibleWidgetUnbranding = this.getWunValue()
        this.logger.log('[WIDGET-SET-UP]  this.isVisibleWidgetUnbranding from FT ', this.isVisibleWidgetUnbranding)
        // if (key.includes("WUN")) {
        //   // this.logger.log('PUBLIC-KEY (WIDGET-SET-UP) - key', key);
        //   let wun = key.split(":");
        //   //  this.logger.log('PUBLIC-KEY (WIDGET-SET-UP) - ips key&value', ips);
        //   if (wun[1] === "F") {
        //     this.isVisibleWidgetUnbranding = false;
        //     this.logger.log('[WIDGET-SET-UP] Widget unbranding USECASE B  (from FT) isVisibleWidgetUnbranding', this.isVisibleWidgetUnbranding);
        //     // this.logger.log('PUBLIC-KEY (WIDGET-SET-UP) - isVisibleWidgetUnbranding', this.isVisibleAutoSendTranscript);
        //   } else {
        //     this.isVisibleWidgetUnbranding = true;
        //     this.logger.log('[WIDGET-SET-UP] Widget unbranding  USECASE B  (from FT) isVisibleWidgetUnbranding', this.isVisibleWidgetUnbranding);
        //     // this.logger.log('PUBLIC-KEY (WIDGET-SET-UP) - isVisibleWidgetUnbranding', this.isVisibleAutoSendTranscript);
        //   }
        // }
      } else if (!this.public_Key.includes("WUN")) {
        this.logger.log('[WIDGET-SET-UP] Widget unbranding  USECASE B (from FT) -  EXIST WUN ', this.public_Key.includes("WUN"));
        this.isVisibleWidgetUnbranding = false;
        this.logger.log('[WIDGET-SET-UP] Widget unbranding  USECASE B (from FT) isVisibleWidgetUnbranding', this.isVisibleWidgetUnbranding);
      }

    } else if (projectProfileData['customization'] === undefined) {
      this.logger.log('[WIDGET-SET-UP] USECASE C customization is  ', projectProfileData['customization'], 'get value foem FT')
      if (this.public_Key.includes("WUN")) {
        this.logger.log('[WIDGET-SET-UP] Widget unbranding  USECASE B  (from FT) - EXIST WUN ', this.public_Key.includes("WUN"));

        this.isVisibleWidgetUnbranding = this.getWunValue()
        this.logger.log('[WIDGET-SET-UP]  this.isVisibleWidgetUnbranding from FT ', this.isVisibleWidgetUnbranding)
        // if (key.includes("WUN")) {
        //   // this.logger.log('PUBLIC-KEY (WIDGET-SET-UP) - key', key);
        //   let wun = key.split(":");
        //   //  this.logger.log('PUBLIC-KEY (WIDGET-SET-UP) - ips key&value', ips);
        //   if (wun[1] === "F") {
        //     this.isVisibleWidgetUnbranding = false;
        //     this.logger.log('[WIDGET-SET-UP] Widget unbranding USECASE B  (from FT) isVisibleWidgetUnbranding', this.isVisibleWidgetUnbranding);
        //     // this.logger.log('PUBLIC-KEY (WIDGET-SET-UP) - isVisibleWidgetUnbranding', this.isVisibleAutoSendTranscript);
        //   } else {
        //     this.isVisibleWidgetUnbranding = true;
        //     this.logger.log('[WIDGET-SET-UP] Widget unbranding  USECASE B  (from FT) isVisibleWidgetUnbranding', this.isVisibleWidgetUnbranding);
        //     // this.logger.log('PUBLIC-KEY (WIDGET-SET-UP) - isVisibleWidgetUnbranding', this.isVisibleAutoSendTranscript);
        //   }
        // }
      } else if (!this.public_Key.includes("WUN")) {
        this.logger.log('[WIDGET-SET-UP] Widget unbranding  USECASE B (from FT) -  EXIST WUN ', this.public_Key.includes("WUN"));
        this.isVisibleWidgetUnbranding = false;
        this.logger.log('[WIDGET-SET-UP] Widget unbranding  USECASE B (from FT) isVisibleWidgetUnbranding', this.isVisibleWidgetUnbranding);
      }

    }
  }

  getOSCODE() {
    this.logger.log('[WIDGET-SET-UP] getOSCODE')
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;

    let keys = this.public_Key.split("-");
    this.logger.log('[WIDGET-SET-UP] PUBLIC-KEY keys', keys)
    keys.forEach(key => {
      // this.logger.log('NavbarComponent public_Key key', key)
      if (key.includes("MTL")) {
        // this.logger.log('PUBLIC-KEY (Widget-design) - mlt', key);
        let mlt = key.split(":");
        // this.logger.log('PUBLIC-KEY (Widget-design) - mlt key&value', mlt);
        if (mlt[1] === "F") {
          this.isVisible = false;
        } else {
          this.isVisible = true;
        }
      }

      if (key.includes("PAY")) {
        this.logger.log('[WIDGET-SET-UP] PUBLIC-KEY - key', key);
        let pay = key.split(":");
        // this.logger.log('PUBLIC-KEY (Navbar) - pay key&value', pay);
        if (pay[1] === "F") {
          this.payIsVisible = false;
          this.logger.log('[WIDGET-SET-UP] - pay isVisible', this.payIsVisible);
        } else {
          this.payIsVisible = true;
          this.logger.log('[WIDGET-SET-UP] - pay isVisible', this.payIsVisible);
        }
      }

    });

    if (!this.public_Key.includes("PAY")) {
      // this.logger.log('PUBLIC-KEY (WIDGET-SET-UP) - key.includes("PAY")', this.public_Key.includes("PAY"));
      this.payIsVisible = false;
    }

    // if (!this.public_Key.includes("WUN")) {
    //   // this.logger.log('PUBLIC-KEY (WIDGET-SET-UP) - key.includes("PAY")', this.public_Key.includes("PAY"));
    //   this.isVisibleWidgetUnbranding = false;
    // }

    if (!this.public_Key.includes("MTL")) {
      // this.logger.log('PUBLIC-KEY (WIDGET-SET-UP) - key.includes("PAY")', this.public_Key.includes("PAY"));
      this.isVisible = false;
    }
  }



  goToPricing() {
    this.logger.log('[WIDGET-SET-UP] - goToPricing projectId ', this.id_project);

    if (this.payIsVisible) {

      if (!this.appSumoProfile) {
        if (this.prjct_profile_type === 'free') {
          if (this.prjct_trial_expired === true) {
            // Trial expired
            if (this.profile_name === 'free') {
              if (this.USER_ROLE === 'owner') {
                // this.router.navigate(['project/' + this.id_project + '/project-settings/payments']);
                this.router.navigate(['project/' + this.id_project + '/pricing'])
              } else {
                this.presentModalOnlyOwnerCanManageTheAccountPlan();
              }

            } else if (this.profile_name === 'Sandbox') {
              if (this.USER_ROLE === 'owner') {
                // this.router.navigate(['project/' + this.id_project + '/project-settings/payments']);
                this.router.navigate(['project/' + this.id_project + '/pricing'])
              } else {
                this.presentModalOnlyOwnerCanManageTheAccountPlan();
              }

            }
          }
        } else if (this.prjct_profile_type === 'payment') {
          if (this.subscription_is_active) {
            if (this.profile_name === PLAN_NAME.A) {
              // this.presentModalFeautureAvailableFromTier2(this.featureAvailableFromBPlan)
              this.presentModalFeautureAvailableFromTier2(this.featureAvailableFromEPlan)
            } else if (this.profile_name === PLAN_NAME.D) {
              // this.presentModalFeautureAvailableFromTier2(this.featureAvailableFromEPlan)
              this.presentModalFeautureAvailableFromTier2(this.featureAvailableFromEPlan)
            }
          } else if (!this.subscription_is_active) {
            if (this.profile_name === PLAN_NAME.A) {
              // this.presentModalFeautureAvailableFromTier2(this.featureAvailableFromBPlan)
              this.presentModalFeautureAvailableFromTier2(this.featureAvailableFromEPlan)
            } else if (this.profile_name === PLAN_NAME.B) {
              // this.presentModalFeautureAvailableFromTier2(this.featureAvailableFromBPlan)
              this.presentModalFeautureAvailableFromTier2(this.featureAvailableFromEPlan)
            } else if (this.profile_name === PLAN_NAME.C) {
              // this.presentModalFeautureAvailableFromTier2(this.featureAvailableFromBPlan)
              this.presentModalFeautureAvailableFromTier2(this.featureAvailableFromEPlan)
            } else if (this.profile_name === PLAN_NAME.D) {
              this.presentModalFeautureAvailableFromTier2(this.featureAvailableFromEPlan)
            } else if (this.profile_name === PLAN_NAME.E) {
              this.presentModalFeautureAvailableFromTier2(this.featureAvailableFromEPlan)
            } else if (this.profile_name === PLAN_NAME.EE) {
              this.presentModalFeautureAvailableFromTier2(this.featureAvailableFromEPlan)
            } else if (this.profile_name === PLAN_NAME.F) {
              this.presentModalFeautureAvailableFromTier2(this.featureAvailableFromEPlan)
            }
          }

        }
      } else {
        if (this.USER_ROLE === 'owner') {
          this.router.navigate(['project/' + this.id_project + '/project-settings/payments']);
        } else {
          this.presentModalOnlyOwnerCanManageTheAccountPlan();
        }
      }

    } else {
      this.notify._displayContactUsModal(true, 'upgrade_plan');
    }
  }

  presentModalFeautureAvailableFromTier2(planName) {
    // const el = document.createElement('div')
    // el.innerHTML = planName
    Swal.fire({
      title: this.upgradePlan,
      text: planName,
      icon: "info",
      showCloseButton: false,
      showCancelButton: true,
      confirmButtonText: this.upgradePlan ,
      cancelButtonText: this.cancel,
      confirmButtonColor: "var(--blue-light)",
      focusConfirm: true,
      reverseButtons: true,
    
      // content: el,
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
        // this.logger.log('featureAvailableFromPlanC value', value)
        // this.logger.log('[APP-STORE] prjct_profile_type', this.prjct_profile_type)
        // this.logger.log('[APP-STORE] subscription_is_active', this.subscription_is_active)
        // this.logger.log('[APP-STORE] prjct_profile_type', this.prjct_profile_type)
        // this.logger.log('[APP-STORE] trial_expired', this.trial_expired)
        // this.logger.log('[APP-STORE] isVisiblePAY', this.isVisiblePAY)
        if (this.payIsVisible) {
          // this.logger.log('[APP-STORE] HERE 1')
          if (this.USER_ROLE === 'owner') {
            // this.logger.log('[APP-STORE] HERE 2')
            if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
              if (this.profile_name !== PLAN_NAME.C && this.profile_name !== PLAN_NAME.F) {
                this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
              } else if (this.profile_name === PLAN_NAME.C || this.profile_name === PLAN_NAME.F) {
                this.notify.displayEnterprisePlanHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
              }
            } else if (this.prjct_profile_type === 'payment' && this.subscription_is_active === true && (this.profile_name === PLAN_NAME.A || this.profile_name === PLAN_NAME.D)) {
              this.notify._displayContactUsModal(true, 'upgrade_plan');
            } else if (this.prjct_profile_type === 'free') {
              // this.logger.log('[APP-STORE] HERE 4')
              this.router.navigate(['project/' + this.id_project + '/pricing']);
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
  }




  // presentModalContactUsToUpgradePlan() {
  //   this.notify.presentContactUsModalToUpgradePlan(true);
  //   if (!isDevMode()) {
  //     if (window['analytics']) {

  //       try {
  //         window['analytics'].track('Update plan', {
  //           "email": this.user.email,
  //         }, {
  //           "context": {
  //             "groupId": this.id_project
  //           }
  //         });
  //       } catch (err) {
  //         this.logger.error('track [WIDGET-SET-UP] Update plan error', err);
  //       }

  //       let userFullname = ''
  //       if (this.user.firstname && this.user.lastname) {
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
  //         this.logger.error('identify [WIDGET-SET-UP] Update plan error', err);
  //       }

  //       try {
  //         window['analytics'].group(this.id_project, {
  //           name: this.projectName,
  //           plan: this.prjct_profile_name_for_segment,
  //         });
  //       } catch (err) {
  //         this.logger.error('group [WIDGET-SET-UP] Update plan error', err);
  //       }
  //     }
  //   }
  // }

  // else {
  //   this.notify._displayContactUsModal(true, 'upgrade_plan');
  // }

  presentModalOnlyOwnerCanManageTheAccountPlan() {
    // https://github.com/t4t5/sweetalert/issues/845
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyOwnerCanManageTheAccountPlanMsg, this.learnMoreAboutDefaultRoles)

  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  this.logger.log("[WS-REQUESTS-LIST] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }


  geti118nTranslations() {
    this.translate.get('Warning')
      .subscribe((text: any) => {
        this.warning_translated = text
      })


    this.translate.get('TheCustomPreChatFormIsEmptyAndWillBeDisabled')
      .subscribe((text: any) => {
        this.custom_prechat_form_is_empty_and_will_be_disabled_msg = text
      })


    this.translate.get('OnlyUsersWithTheOwnerRoleCanManageTheAccountPlan')
      .subscribe((translation: any) => {
        // this.logger.log('[PRJCT-EDIT-ADD] onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.onlyOwnerCanManageTheAccountPlanMsg = translation;
      });

    this.translate.get('LearnMoreAboutDefaultRoles')
      .subscribe((translation: any) => {
        // this.logger.log('[PRJCT-EDIT-ADD] onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.learnMoreAboutDefaultRoles = translation;
      });

    this.translate.get('AvailableFromThePlan', { plan_name: PLAN_NAME.B })
      .subscribe((translation: any) => {
        this.featureAvailableFromBPlan = translation;
      });

    this.translate.get('AvailableFromThePlans', { plan_name_1: PLAN_NAME.E,  plan_name_2: PLAN_NAME.EE})
      .subscribe((translation: any) => {
        this.featureAvailableFromEPlan = translation;
      });

    this.translate.get('Cancel')
      .subscribe((text: string) => {
        this.cancel = text;
      });

    this.translate.get('Pricing.UpgradePlan')
      .subscribe((translation: any) => {
        this.upgradePlan = translation;
      });

  }

  listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
      this.logger.log('[WIDGET-SET-UP] SETTINGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    });
  }


  ngAfterViewInit(): void {
    try {
      // name of the class of the html div = . + fragment
      const test = <HTMLElement>document.querySelector('.' + this.fragment)
      // this.logger.log('»» WIDGET DESIGN - QUERY SELECTOR TEST  ', test)
      test.scrollIntoView();
      // document.querySelector('#' + this.fragment).scrollIntoView();
      // this.logger.log( document.querySelector('#' + this.fragment).scrollIntoView())
    } catch (e) {
      // this.logger.log('»» WIDGET DESIGN - QUERY SELECTOR ERROR  ', e)
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


  // il testo della modale '"Non è impostata nessuna lingua predefinita' e dato che potrebbe essere visualizzata 
  // all'init della pagina nn può stare nel base compo


  // scroll to multilanguage section
  scroll(el: HTMLElement) {
    el.scrollIntoView();
    var acc = document.getElementsByClassName("widget-section-accordion");
    // this.logger.log('[WIDGET-SET-UP] ACCORDION', acc);
    var i;
    for (i = 0; i < acc.length; i++) {
      var lastAccordion = acc[5];
      var lastPanel = <HTMLElement>lastAccordion.nextElementSibling;
      lastAccordion.classList.add("active");
      lastPanel.style.maxHeight = lastPanel.scrollHeight + "px";

      var arrow_icon_div = lastAccordion.children[1];
      var arrow_icon = arrow_icon_div.children[0]
      arrow_icon.classList.add("arrow-up");
    }
  }

  getWidgetUrl() {
    this.WIDGET_URL = this.appConfigService.getConfig() + 'launch.js';
    this.logger.log('[WIDGET-SET-UP] getAppConfig WIDGET_URL ', this.WIDGET_URL)
  }



  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.newInnerWidth = event.target.innerWidth;
    this.logger.log('[WIDGET-SET-UP] - NEW INNER WIDTH ', this.newInnerWidth);

    if (this.newInnerWidth <= 668) {
      this.logger.log('[WIDGET-SET-UP] - NEW INNER WIDTH ', this.newInnerWidth);

      // let innerWidthLess368 = this.newInnerWidth - 368
      // this.calloutContainerWidth =  innerWidthLess368 += 'px'

      this.custom_breakpoint = true;
    } else {
      this.custom_breakpoint = false;
    }

    if (this.newInnerWidth < 1082) {
      this.HAS_ACTIVATED_PRECHAT_CUSTOM_FIELDS = true
    }

    // ---------------------------------
    // New - small sidebar @media < 1200 
    // ---------------------------------

  }

  onInitWindowWidth(): any {
    this.initInnerWidth = window.innerWidth;
    this.logger.log('[WIDGET-SET-UP] - INIT WIDTH ', this.initInnerWidth);
    if (this.newInnerWidth <= 668) {
      this.logger.log('[WIDGET-SET-UP] - NEW INNER WIDTH ', this.newInnerWidth);
      this.custom_breakpoint = true;
    } else {
      this.custom_breakpoint = false;
    }
  }

  onChangeWidgetPreview(previewselected) {
    this.logger.log('[WIDGET-SET-UP] - PREVIEW SELECTED ', previewselected);

    if (previewselected === '0001') {
      this.DISPLAY_WIDGET_HOME = true;
      this.DISPLAY_LAUNCER_BUTTON = false;
      this.DISPLAY_WIDGET_CHAT = false;
      this.DISPLAY_CALLOUT = false;
      this.C21_BODY_HOME = false;
      this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    } else if (previewselected === '0000') {
      this.DISPLAY_WIDGET_HOME = true;
      this.DISPLAY_LAUNCER_BUTTON = false;
      this.DISPLAY_WIDGET_CHAT = false;
      this.DISPLAY_CALLOUT = false;
      this.C21_BODY_HOME = true;
      this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    } else if (previewselected === '0004') {
      this.DISPLAY_WIDGET_HOME = true;
      this.DISPLAY_LAUNCER_BUTTON = true
      this.DISPLAY_WIDGET_CHAT = false;
      this.DISPLAY_CALLOUT = false;
      this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    }

    if (previewselected === '0002') {
      this.DISPLAY_WIDGET_CHAT = true;
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = false;
      this.HAS_FOCUSED_ONLINE_MSG = true;
      this.HAS_FOCUSED_OFFLINE_MSG = false;
      this.HAS_FOCUSED_OFFICE_CLOSED_MSG = false;
      this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    }

    if (previewselected === '0003') {
      this.DISPLAY_WIDGET_CHAT = false;
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = true;
      this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    }

    if (previewselected === '0005') {
      this.DISPLAY_WIDGET_CHAT = false;
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = false;
      this.DISPLAY_WIDGET_PRECHAT_FORM = true;
    }

  }



  getProjectUserRole() {
    // const user___role =  this.usersService.project_user_role_bs.value;
    // this.logger.log('[NAVBAR] % »»» WebSocketJs WF +++++ ws-requests--- navbar - USER ROLE 1 ', user___role);
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user_role) => {
        this.logger.log('[NAVBAR] % »»» WebSocketJs WF +++++ ws-requests--- navbar - USER ROLE 2', user_role);
        if (user_role) {
          this.USER_ROLE = user_role

        }
      });
  }

  getLoggedUser() {
    this.auth.user_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user) => {
        this.logger.log('[WIDGET-SET-UP] USER GET IN »» WIDGET DESIGN ', user)
        if (user) {
          this.user = user
          this.current_user_name = user.firstname + ' ' + user.lastname
          this.currentUserId = user._id;
          this.logger.log('[WIDGET-SET-UP] Current USER ID ', this.currentUserId)
        }
      });
  }

  selectSidebar() {
    const elemAppSidebar = <HTMLElement>document.querySelector('app-sidebar');
    this.logger.log('[WIDGET-SET-UP]  elemAppSidebar ', elemAppSidebar)
    elemAppSidebar.setAttribute('style', 'display:none;');

    const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    this.logger.log('[WIDGET-SET-UP] elemMainPanel ', elemMainPanel)
    elemMainPanel.setAttribute('style', 'width:100% !important; overflow-x: hidden !important;');
  }

  getAndManageAccordionInstallWidget() {
    var acc = document.getElementsByClassName("accordion-install-widget");

    // this.logger.log('[WIDGET-SET-UP] ACCORDION INSTALL WIDGET', acc);

    var i: number;
    for (i = 0; i < acc.length; i++) {
      this.logger.log('[WIDGET-SET-UP] ACCORDION ARROW - INSTALL WIDGET - QUI ENTRO');
      // this.logger.log('[WIDGET-SET-UP] ACCORDION ARROW - INSTALL WIDGET - acc[i]', acc[i]);

      const self = this;

      acc[i].addEventListener("click", function () {

        this.classList.toggle("active-install-widget");

        var panel = this.nextElementSibling;
        // this.logger.log('WIDGET DESIGN ACCORDION ARROW - INSTALL WIDGET - panel', panel);

        var arrow_icon_div = this.children[1];
        self.logger.log('[WIDGET-SET-UP] ACCORDION ARROW - INSTALL WIDGET - ICON WRAP DIV', arrow_icon_div);

        var arrow_icon = arrow_icon_div.children[0]
        self.logger.log('[WIDGET-SET-UP] ACCORDION ARROW ICON', arrow_icon);
        arrow_icon.classList.toggle("arrow-up-install-widget");

        if (panel.style.maxHeight) {
          panel.style.maxHeight = null;

        } else {
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });
    }
  }

  copyToClipboard() {
    document.querySelector('textarea').select();
    document.execCommand('copy');

    this.has_copied = true;
    setTimeout(() => {
      this.has_copied = false;
    }, 2000);
  }

  close_panel_install_widget() {
    this.HAS_SELECT_INSTALL_WITH_CODE = false;
    this.HAS_SELECT_INSTALL_WITH_GTM = false
    this.logger.log('[WIDGET-SET-UP] close_panel_install_widget HAS_SELECT_INSTALL_WITH_CODE', this.HAS_SELECT_INSTALL_WITH_CODE)

  }

  installWithCode() {
    // this.HAS_SELECT_INSTALL_WITH_CODE = true;
    // this.HAS_SELECT_INSTALL_WITH_GTM = false;
    this.HAS_SELECT_INSTALL_WITH_GTM = false;
    if (this.HAS_SELECT_INSTALL_WITH_CODE === false) {
      this.HAS_SELECT_INSTALL_WITH_CODE = true;
    } else if (this.HAS_SELECT_INSTALL_WITH_CODE === true) {
      this.HAS_SELECT_INSTALL_WITH_CODE = false;
    }

    this.logger.log('[WIDGET-SET-UP] installWithCode HAS_SELECT_INSTALL_WITH_CODE', this.HAS_SELECT_INSTALL_WITH_CODE)
  }

  installWithGTM() {
    // this.HAS_SELECT_INSTALL_WITH_CODE = false;
    // this.HAS_SELECT_INSTALL_WITH_GTM = true;
    this.HAS_SELECT_INSTALL_WITH_CODE = false;
    if (this.HAS_SELECT_INSTALL_WITH_GTM === false) {
      this.HAS_SELECT_INSTALL_WITH_GTM = true;
    } else if (this.HAS_SELECT_INSTALL_WITH_GTM === true) {
      this.HAS_SELECT_INSTALL_WITH_GTM = false;
    }

    this.logger.log('[WIDGET-SET-UP] installWithCode HAS_SELECT_INSTALL_WITH_GTM', this.HAS_SELECT_INSTALL_WITH_GTM)
  }


  getAndManageAccordion() {
    this.logger.log('[WIDGET-SET-UP] ACCORDION id_project', this.id_project)
    var acc = document.getElementsByClassName("widget-section-accordion");
    // this.logger.log('[WIDGET-SET-UP] ACCORDION', acc);
    let i: number;
    // #widget-all-settings-form > button:nth-child(7)
    for (i = 0; i < acc.length; i++) {
      // this.logger.log('[WIDGET-SET-UP] ACCORDION i', i, 'acc[i]', acc[i]);
      // Open the first accordion https://codepen.io/fpavision/details/xxxONGv
      let firstAccordion = acc[0];

      let firstPanel = <HTMLElement>firstAccordion.nextElementSibling;
      this.logger.log('[WIDGET-SET-UP] ACCORDION firstPanel', firstPanel)

      const hasClosedFirstAccordion = this.localDbService.getFromStorage(`hasclosedfirstaccordion-${this.id_project}`)
      this.logger.log('[WIDGET-SET-UP] hasClosedFirstAccordion get from storage', hasClosedFirstAccordion)
      if (hasClosedFirstAccordion === null || hasClosedFirstAccordion === 'false') {
        // this.logger.log('[WIDGET-SET-UP] hasClosedFirstAccordion HERE YES ', hasClosedFirstAccordion)
        setTimeout(() => {
          firstAccordion.classList.add("active");
          firstPanel.style.maxHeight = firstPanel.scrollHeight + "px";

          var arrow_icon_div = firstAccordion.children[1];
          this.logger.log('[WIDGET-SET-UP] ACCORDION ARROW ICON WRAP DIV', arrow_icon_div);
    
          var arrow_icon = arrow_icon_div.children[0]
          // this.logger.log('[WIDGET-SET-UP] ACCORDION ARROW ICON', arrow_icon);
          arrow_icon.classList.add("arrow-up");
        }, 2000);
      }

      // var arrow_icon_div = firstAccordion.children[1];
      // this.logger.log('[WIDGET-SET-UP] ACCORDION ARROW ICON WRAP DIV', arrow_icon_div);

      // var arrow_icon = arrow_icon_div.children[0]
      // // this.logger.log('[WIDGET-SET-UP] ACCORDION ARROW ICON', arrow_icon);
      // arrow_icon.classList.add("arrow-up");
      
      const self = this
      acc[i].addEventListener("click", function () {
        let firstAccordion = acc[0];
        // this.logger.log('firstAccordion', firstAccordion)
        let firstPanel = <HTMLElement>firstAccordion.nextElementSibling;
        // this.logger.log('firstPanel', firstPanel)
        // this.logger.log('[WIDGET-SET-UP] ACCORDION click acc[0]', acc[0]);

        setTimeout(() => {
          // this.logger.log('firstAccordion contains class active', firstAccordion.classList.contains('active'))

          if (firstAccordion.classList.contains('active')) {
            self.localDbService.setInStorage(`hasclosedfirstaccordion-${self.id_project}`, 'false')
          } else if (!firstAccordion.classList.contains('active')) {
            self.localDbService.setInStorage(`hasclosedfirstaccordion-${self.id_project}`, 'true')
          }
        }, 2000);
        self.logger.log('[WIDGET-SET-UP] ACCORDION click i', i, 'acc[i]', acc[i]);
        // this.logger.log('[WIDGET-SET-UP] ACCORDION click i', i, 'acc[i]', acc[i]);
        this.classList.toggle("active");
        var panel = this.nextElementSibling;
        // this.logger.log('[WIDGET-SET-UP] ACCORDION PANEL', panel);

        var arrow_icon_div = this.children[1];
        // this.logger.log('[WIDGET-SET-UP] ACCORDION ARROW ICON WRAP DIV', arrow_icon_div);

        var arrow_icon = arrow_icon_div.children[0]
        // this.logger.log('[WIDGET-SET-UP] ACCORDION ARROW ICON', arrow_icon);
        arrow_icon.classList.toggle("arrow-up");

        if (panel.style.maxHeight) {
          panel.style.maxHeight = null;
          self.HAS_ACTIVATED_PRECHAT_CUSTOM_FIELDS = false
        } else {
          panel.style.maxHeight = panel.scrollHeight + "px";

        }
      });
    }
  }


  getTestSiteUrl() {
    this.TESTSITE_BASE_URL = this.appConfigService.getConfig().WIDGET_BASE_URL + 'assets/twp/index.html';
    this.logger.log('[WIDGET-SET-UP] getAppConfig [WIDGET-SET-UP] TESTSITE_BASE_URL', this.TESTSITE_BASE_URL);
  }



  getLabels() {
    this.widgetService.getLabels().subscribe((labels: any) => {
      // this.logger.log('[WIDGET-SET-UP] - GET LABELS - RES', labels);

      if (labels && Object.keys(labels).length > 0) {

        this.translations = labels['data']

        this.logger.log('[WIDGET-SET-UP] - GET LABELS - RES > TRANSLATIONS ', this.translations);

        this.languages_codes = [];

        this.translations.forEach(translation => {
          this.logger.log('[WIDGET-SET-UP] - GET LABELS - RES >>> TRANSLATION ', translation);
          if (translation) {
            // if 'translation' has an _id is executed the push of the language code in the array languages_codes
            if (translation._id !== undefined) {
              this.languages_codes.push(translation.lang.toLowerCase())
            }

            // IF DEFAULT LANGUAGE IS TRUE
            if (translation.default === true) {
              this.defaultLangCode = translation.lang.toLowerCase()
              this.logger.log('[WIDGET-SET-UP] - GET LABELS ***** defaultLangCode (onInit) ', this.defaultLangCode);
            } else {
              this.logger.log('[WIDGET-SET-UP] - GET LABELS ***** No default Lang *****  ', translation);
              // this.translateAndDisplayModalNoDefaultLangIsSet()
            }

          }
        });


        this.logger.log('[WIDGET-SET-UP] - GET LABELS - defaultLangCode (onInit) 2', this.defaultLangCode);

        if (this.defaultLangCode === undefined) {
          this.translateAndDisplayModalNoDefaultLangIsSet();
        }

        this.logger.log('[WIDGET-SET-UP] - GET LABELS - Array of LANG CODE ', this.languages_codes);


        // const availableTranslations = [{ code: "it", name: "Italian" }, { code: "fr", name: "French" }, { code: "en", name: "English" }];
        const availableTranslations = this.doAvailableLanguageArray(this.languages_codes);
        this.logger.log('[WIDGET-SET-UP] - GET LABELS - availableTranslations ', availableTranslations);

        if (availableTranslations && availableTranslations.length > 0) {
          // IN THE SELECT LANGUAGE COMBO DISPLAY AS SELECTED THE FIRST LANGUAGE IN ALPHABETICAL ORDER
          this.wd_availableTranslations = availableTranslations.sort(this.compare);
          this.logger.log('[WIDGET-SET-UP] - GET LABELS -  ordered wd_availableTranslations', this.wd_availableTranslations);

          if (this.wd_availableTranslations && this.wd_availableTranslations[0]) {
            this.selectedLang = this.wd_availableTranslations[0].name;
            this.selectedLangCode = this.wd_availableTranslations[0].code;
            this.selectedLangName = this.wd_availableTranslations[0].name;
          }

          this.logger.log('[WIDGET-SET-UP] - GET LABELS - selectedLangCode ', this.selectedLangCode);

          this.getCurrentTranslation(this.selectedLangCode);

        } else {

          // there are labels but none assigned to the project
          this.translateAndDisplayModalNoLangAreSet();
        }
      } else {

        // labels are null
        this.translateAndDisplayModalNoLangAreSet();
      }

    }, error => {
      this.logger.error('[WIDGET-SET-UP] - GET LABELS - ERROR ', error)
    }, () => {
      this.logger.log('[WIDGET-SET-UP] - GET LABELS * COMPLETE *')
    });
  }

  translateAndDisplayModalNoDefaultLangIsSet() {
    this.translate.get('NoDefaultLanguage')
      .subscribe((text: any) => {
        this.warningMsg = text['Warning'];
        this.noDefaultLanguageIsSetUpMsg = text['NoDefaultLanguageIsSetUp'];
        this.goToMultilanguagePageMsg = text['GoToMultilanguagePage'];
        this.toAddLanguagesToYourProjectMsg = text['toAddLanguagesToYourProject'];
        this.cancelMsg = text['Cancel'];
        this.noLanguagesAreSetUpMsg = text['NoLanguagesAreSetUp'];
        this.setDefaultLangInMultilanguageSection = text['SetYourDefaultLanguageInTheMultilanguageSection'];
        this.goToMultilanguageSectionMsg = text['GoToMultilanguageSection'];
        // this.noDefaultLanguageIsSetUpMsg = text;
        // this.logger.log('WIDGET DESIGN - translateNoDefaultLanguageIsSetUp warningMsg', this.warningMsg);
        // this.logger.log('WIDGET DESIGN - translateNoDefaultLanguageIsSetUp noDefaultLanguageIsSetUpMsg', this.noDefaultLanguageIsSetUpMsg)
      }, (error) => {
        this.logger.error('[WIDGET-SET-UP] - translateNoDefaultLanguageIsSetUp - ERROR ', error);
      }, () => {
        // this.logger.log('WIDGET DESIGN - translateNoDefaultLanguageIsSetUp * COMPLETE *');

        this.displayModalNoDefaultLangIsSetUp()
      });

  }

  displayModalNoDefaultLangIsSetUp() {
    // const el = document.createElement('div');
    // const url = '#/project/' + this.id_project + '/widget-set-up'
    // el.innerHTML = `${this.noDefaultLanguageIsSetUpMsg} <a href="${url}"> ${this.goToMultilanguagePageMsg}</a>  ${this.toAddLanguagesToYourProjectMsg}</a>`
    swal({
      title: this.warningMsg,
      text: this.noDefaultLanguageIsSetUpMsg + '. ' + this.setDefaultLangInMultilanguageSection,
      // content: el,
      icon: "warning",
      buttons: {
        cancel: `${this.cancelMsg}`,
        catch: {
          text: `${this.goToMultilanguageSectionMsg}`,
          value: "catch",
        },
      },

      // `"Cancel", ${this.goToMultilanguagePageMsg}`],
      dangerMode: false,
    })
      .then((value) => {
        this.logger.log('[WIDGET-SET-UP] - displayModalNoDefaultLangAreSetUp value', value)

        if (value === 'catch') {
          this.scrollToMultilanguageSection()
        }
      })
  }


  scrollToMultilanguageSection() {
    this.multilanguageRef.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });

    var acc = document.getElementsByClassName("widget-section-accordion");
    // this.logger.log('WIDGET DESIGN ACCORDION', acc);
    var i: number;
    for (i = 0; i < acc.length; i++) {
      var lastAccordion = acc[6];
      var lastPanel = <HTMLElement>lastAccordion.nextElementSibling;
      lastAccordion.classList.add("active");
      lastPanel.style.maxHeight = lastPanel.scrollHeight + "px";
      var arrow_icon_div = lastAccordion.children[1];
      var arrow_icon = arrow_icon_div.children[0]
      arrow_icon.classList.add("arrow-up");
    }

  }


  translateAndDisplayModalNoLangAreSet() {
    this.translate.get('NoDefaultLanguage')
      .subscribe((text: any) => {
        this.warningMsg = text['Warning'];
        this.noDefaultLanguageIsSetUpMsg = text['NoDefaultLanguageIsSetUp'];
        this.goToMultilanguagePageMsg = text['GoToMultilanguagePage'];
        this.toAddLanguagesToYourProjectMsg = text['toAddLanguagesToYourProject'];
        this.cancelMsg = text['Cancel'];
        this.noLanguagesAreSetUpMsg = text['NoLanguagesAreSetUp'];
        // this.noDefaultLanguageIsSetUpMsg = text;
        // this.logger.log('WIDGET DESIGN - translateNoDefaultLanguageIsSetUp warningMsg', this.warningMsg);
        // this.logger.log('WIDGET DESIGN - translateNoDefaultLanguageIsSetUp noDefaultLanguageIsSetUpMsg', this.noDefaultLanguageIsSetUpMsg)
      }, (error) => {
        this.logger.error('[WIDGET-SET-UP] - translateNoDefaultLanguageIsSetUp - ERROR ', error);
      }, () => {
        // this.logger.log('WIDGET DESIGN - translateNoDefaultLanguageIsSetUp * COMPLETE *');

        this.displayModalNoLangAreSetUp()
      });
  }

  displayModalNoLangAreSetUp() {
    // const el = document.createElement('div');
    // const url = '#/project/' + this.id_project + '/widget-set-up'
    // el.innerHTML = `${this.noDefaultLanguageIsSetUpMsg} <a href="${url}"> ${this.goToMultilanguagePageMsg}</a>  ${this.toAddLanguagesToYourProjectMsg}</a>`
    swal({
      title: this.warningMsg,
      text: this.noLanguagesAreSetUpMsg + '. ' + this.goToMultilanguagePageMsg + ' ' + this.toAddLanguagesToYourProjectMsg + '.',
      // content: el,
      icon: "warning",
      buttons: {
        cancel: `${this.cancelMsg}`,
        catch: {
          text: `${this.goToMultilanguagePageMsg}`,
          value: "catch",
        },
      },

      // `"Cancel", ${this.goToMultilanguagePageMsg}`],
      dangerMode: false,
    })
      .then((value) => {
        this.logger.log('displayModalNoLangAreSetUp value', value)

        if (value === 'catch') {
          this.goToWidgetMultilanguage()
        }
      })
  }

  getCurrentTranslation(selectedLangCode: string) {
    this.logger.log('[WIDGET-SET-UP] init getCurrentTranslation ')
    this.translations.forEach(translation => {
      if (translation.lang.toLowerCase() === selectedLangCode) {


        this.selected_translation = translation.data
        this.logger.log('[WIDGET-SET-UP] ***** selected translation: ', this.selected_translation)

        // ---------------------------------------------------------------------------------------------
        // @ New Conversation (not editable in the widhet setting page but only from multilanguage page)
        // ---------------------------------------------------------------------------------------------
        this.newConversation = this.selected_translation["LABEL_START_NW_CONV"];
        this.logger.log('[WIDGET-SET-UP] ***** selected translation - newConversation: ', this.newConversation);

        // --------------------------------------------------------------------------------------------
        // @ No Conversation (not editable in the widhet setting page but only from multilanguage page)
        // --------------------------------------------------------------------------------------------
        this.noConversation = this.selected_translation["NO_CONVERSATION"];

        // ---------------------------------------------------------------
        // @ Welcome title and company intro
        // ---------------------------------------------------------------
        // this.welcomeTitle = this.selected_translation["WELLCOME_TITLE"];
        // this.welcomeMsg = this.selected_translation["WELLCOME_MSG"];

        this.welcomeTitle = this.selected_translation["WELCOME_TITLE"];
        if (this.selected_translation.hasOwnProperty("WELLCOME_TITLE")) {
          this.welcomeTitle = this.selected_translation["WELLCOME_TITLE"];
        }

        this.welcomeMsg = this.selected_translation["WELCOME_MSG"];
        if (this.selected_translation.hasOwnProperty("WELLCOME_MSG")) {
          this.welcomeMsg = this.selected_translation["WELLCOME_MSG"];
        }

        this.logger.log('[WIDGET-SET-UP] ***** selected translation - WELCOME_TITLE: ', this.welcomeTitle, ' - WELLCOME_MSG: ', this.welcomeMsg);


        // ---------------------------------------------------------------
        // @ Callout title, msg and emoji
        // ---------------------------------------------------------------
        this.calloutTitle = this.selected_translation["CALLOUT_TITLE_PLACEHOLDER"];
        // this.calloutTitleForPreview =  this.calloutTitle.trim();
        this.checkIsEmoji(this.calloutTitle.trim());
        this.logger.log('[WIDGET-SET-UP] - checkIsEmoji calloutTitleForPreview (on getCurrentTranslation)', this.calloutTitleForPreview);

        this.calloutMsg = this.selected_translation["CALLOUT_MSG_PLACEHOLDER"];
        this.logger.log('[WIDGET-SET-UP] ***** selected translation CALLOUT_TITLE_PLACEHOLDER: ', this.calloutTitle, ' - CALLOUT_MSG: ', this.calloutMsg);

        // ---------------------------------------------------------------
        // @ Online & offline msgs
        // ---------------------------------------------------------------
        this.onlineMsg = this.selected_translation["LABEL_FIRST_MSG"];
        this.offlineMsg = this.selected_translation["LABEL_FIRST_MSG_NO_AGENTS"];
        this.logger.log('[WIDGET-SET-UP] ***** selected translation ONLINE MSG : ', this.onlineMsg, ' - OFFLINE MSG: ', this.offlineMsg);

        // ---------------------------------------------------------------
        // @ Office closed msgs
        // ---------------------------------------------------------------
        this.officeClosedMsg = this.selected_translation["LABEL_FIRST_MSG_OPERATING_HOURS_CLOSED"];

        // -----------------------------------------------------------------------------------------------------------------------
        // @ waitingTimeNotFoundMsg & waitingTimeFoundMsg are displayed in widget preview when the variable C21_BODY_HOME is false 
        // this to simulate the presence of at least one conversation
        // -----------------------------------------------------------------------------------------------------------------------
        this.waitingTimeNotFoundMsg = this.selected_translation["WAITING_TIME_NOT_FOUND"];

        this.logger.log('[WIDGET-SET-UP] - ***** ["WAITING_TIME_FOUND"] contains $reply_time ', this.selected_translation["WAITING_TIME_FOUND"].includes("$reply_time"));

        // -------------------------------------------------------------------------------------------------------
        // @ for new projects $ reply_time is set by the server so it does not need to be added on the client side
        // ------------------------------------------------------------------------------------------------------- 
        // if (this.selected_translation["WAITING_TIME_FOUND"].includes("$reply_time") === false) {
        //   var hasSpaceAtEnds = this.selected_translation["WAITING_TIME_FOUND"].slice(-1);

        //   if (hasSpaceAtEnds == " ") {
        //     this.logger.log("Multilanguage (widget-design) WAITING_TIME_FOUND ends with space");
        //     this.waitingTimeFoundMsg = this.selected_translation["WAITING_TIME_FOUND"] + '$reply_time';
        //   } else {
        //     this.logger.log("Multilanguage (widget-design) WAITING_TIME_FOUND not ends with space");
        //     this.waitingTimeFoundMsg = this.selected_translation["WAITING_TIME_FOUND"] + ' ' + '$reply_time';
        //   }
        // } else {
        //   this.waitingTimeFoundMsg = this.selected_translation["WAITING_TIME_FOUND"]
        // }
        this.waitingTimeFoundMsg = this.selected_translation["WAITING_TIME_FOUND"]
        this.logger.log('[WIDGET-SET-UP] - ***** selected translation waitingTimeNotFoundMsg: ', this.waitingTimeNotFoundMsg);
        this.logger.log('[WIDGET-SET-UP] - ***** selected translation waitingTimeFoundMsg: ', this.waitingTimeFoundMsg);

        this.LABEL_COMPLETE_FORM = this.selected_translation["LABEL_COMPLETE_FORM"]
        this.LABEL_PLACEHOLDER = this.selected_translation["LABEL_PLACEHOLDER"]
        // this.logger.log('[WIDGET-SET-UP] - ***** selected translation LABEL_PLACEHOLDER: ', this.LABEL_PLACEHOLDER);

        // for custom prechat-form
        this.LABEL_PRECHAT_USER_FULLNAME = this.selected_translation["LABEL_PRECHAT_USER_FULLNAME"]
        // this.logger.log('getCurrentTranslation this.LABEL_PRECHAT_USER_FULLNAME ', this.LABEL_PRECHAT_USER_FULLNAME)


        this.LABEL_PRECHAT_USER_EMAIL = this.selected_translation["LABEL_PRECHAT_USER_EMAIL"]
        this.LABEL_PRECHAT_USER_PHONE = this.selected_translation["LABEL_PRECHAT_USER_PHONE"]
        this.LABEL_PRECHAT_FIRST_MESSAGE = this.selected_translation["LABEL_PRECHAT_FIRST_MESSAGE"]
        this.LABEL_PRECHAT_STATIC_TERMS_PRIVACY = this.selected_translation["LABEL_PRECHAT_STATIC_TERMS_PRIVACY"]
        this.LABEL_PRECHAT_ACCEPT_TERMS_PRIVACY = this.selected_translation["LABEL_PRECHAT_ACCEPT_TERMS_PRIVACY"]

        // for default prechat-form
        this.LABEL_FIELD_NAME = this.selected_translation["LABEL_FIELD_NAME"]
        this.LABEL_FIELD_EMAIL = this.selected_translation["LABEL_FIELD_EMAIL"]


      }
    });
  }

  makeDefaultLanguage(languageCode) {
    this.logger.log('[WIDGET-SET-UP] - MAKE DAFAULT LANG - languageCode: ', languageCode);

    this.widgetService.setDefaultLanguage(languageCode).subscribe((translation: any) => {
      this.logger.log('[WIDGET-SET-UP] - MAKE DAFAULT LANG - RES ', translation);

      if (translation.default === true) {
        this.defaultLangCode = translation.lang.toLowerCase()
        this.logger.log('[WIDGET-SET-UP] - MAKE DAFAULT LANG - defaultLangCode (makeDefaultLanguage) ', this.defaultLangCode);
      }
    }, error => {
      this.logger.error('[WIDGET-SET-UP] - MAKE DAFAULT LANG - ERROR ', error);
    }, () => {
      this.logger.log('[WIDGET-SET-UP] - MAKE DAFAULT LANG ***** * COMPLETE *');

      // this.getLabels()

    });
  }

  welcomeTitleChange(event) {
    this.welcomeTitle = event;
    this.logger.log('[WIDGET-SET-UP] - WELCOME TITLE CHANGE: ', this.welcomeTitle);
    this.HAS_CHANGED_GREETINGS = true;
    // if (event.length === 0) {    }
  }

  welcomeMsgChange(event) {
    this.welcomeMsg = event;
    this.logger.log('[WIDGET-SET-UP] - WELCOME MSG CHANGE: ', this.welcomeMsg);
    this.HAS_CHANGED_GREETINGS = true;
    // if (event.length === 0) {  }
  }

  onChangeOnlineMsg(event) {
    this.onlineMsg = event;
    this.logger.log('[WIDGET-SET-UP] - ONLINE MSG CHANGE: ', this.onlineMsg);
    this.HAS_CHANGED_GREETINGS = true;
    // if (event.length === 0) {  }
  }

  onChangeOfflineMsg(event) {
    this.offlineMsg = event;
    this.logger.log('[WIDGET-SET-UP] - OFFLINE MSG CHANGE: ', this.offlineMsg);
    this.HAS_CHANGED_GREETINGS = true;
    // if (event.length === 0 || event) {  }
  }

  onChangeFooterBrand(event) {
    let btnSaveFooterBrandAndLauncherBtn = (document.getElementById('btn-save-footer-brand--launcher-btn') as HTMLInputElement)
    btnSaveFooterBrandAndLauncherBtn.disabled = false
    this.footerBrand = event;
    this.logger.log('[WIDGET-SET-UP] - FOOTER BRAND CHANGE: ', this.footerBrand);

    let checkMaliciousHTML = isMaliciousHTML(event)
    if(checkMaliciousHTML){
      
      btnSaveFooterBrandAndLauncherBtn.disabled = true
      // this.footerBrand = this.defaultFooter

      this.notify.showToast(this.translationMap.get('URLTypeNotAllowed'), 4, 'report_problem')
      this.logger.error('[WIDGET-SET-UP] onChangeFooterBrand: can not set current url--> MALICIOUS HTML DETECTED', event, isMaliciousHTML)
      return;
    }
  }

  onChangeOfficeClosedMsg(event) {
    this.officeClosedMsg = event;
    this.logger.log('[WIDGET-SET-UP] - OFFICE CLOSED MSG CHANGE: ', this.officeClosedMsg);
    this.HAS_CHANGED_GREETINGS = true;
    // if (event.length === 0 || event) {  }
  }


  onChangeReplyTimeTypeMsg(value) {
    this.logger.log('[WIDGET-SET-UP] - ON CHANGE REPLY TIME TYPE MSG : ', value);

    this.DISPLAY_WIDGET_HOME = true;
    this.DISPLAY_CALLOUT = false;
    this.DISPLAY_WIDGET_CHAT = false;
    this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    this.widget_preview_selected = "0000"

    if (value === 'reply_time_dynamic_msg') {
      this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG = true;
      this.HAS_SELECT_STATIC_REPLY_TIME_MSG = false;
      this.logger.log('[WIDGET-SET-UP] - HAS_SELECT_DYMANIC_REPLY_TIME_MSG : ', this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG);

      // this.widgetObj['dynamicWaitTimeReply'] = this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG;
      // this.widgetService.updateWidgetProject(this.widgetObj)

    }
    if (value === 'reply_time_fixed_msg') {
      this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG = false;
      this.HAS_SELECT_STATIC_REPLY_TIME_MSG = true;

      this.logger.log('[WIDGET-SET-UP] - HAS_SELECT_DYMANIC_REPLY_TIME_MSG : ', this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG);
    }

  }

  saveFooterBrandAndLauncherBtn() {
    const footerbrand_save_btn = <HTMLElement>document.querySelector('.footerbrand-save-btn');
    this.logger.log('[WIDGET-SET-UP]) - footerbrand_save_btn: ', footerbrand_save_btn);
    if (footerbrand_save_btn) {
      footerbrand_save_btn.blur()
    }
    this.widgetObj['poweredBy'] = this.footerBrand;


    // Custom launcher btn
    if (this.hasOwnLauncherBtn === true) {
      // this.logger.log('saveFooterBrandAndLauncherBtn customLauncherURL hasOwnLauncherBtn ', this.hasOwnLauncherBtn)
      this.widgetObj['baloonImage'] = this.customLauncherURL
    } else if (this.hasOwnLauncherBtn === false) {
      // this.logger.log('saveFooterBrandAndLauncherBtn customLauncherURL hasOwnLauncherBtn ', this.hasOwnLauncherBtn)

      delete this.widgetObj['baloonImage']
    }
    this.widgetService.updateWidgetProject(this.widgetObj)
  }

  saveReplyTime() {
    this.HAS_CHANGED_GREETINGS = false;
    const save_replytime_btn = <HTMLElement>document.querySelector('.save_replytime_btn');
    this.logger.log('[WIDGET-SET-UP]) - save_replytime_btn: ', save_replytime_btn);
    if (save_replytime_btn) {
      save_replytime_btn.blur()
    }

    this.widgetObj['dynamicWaitTimeReply'] = this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG;
    this.widgetService.updateWidgetProject(this.widgetObj)
  }

  setReplyTimePlaceholder() {
    const elInput = <HTMLElement>document.querySelector('.waiting-time-found-msg-input');
    this.logger.log('[WIDGET-SET-UP] - setReplyTimePlaceholder INPUT ELEM: ', elInput);
    this.insertAtCursor(elInput, '$reply_time')
  }

  waitingTimeNotFoundMsgChange(event) {
    this.waitingTimeNotFoundMsg = event;
    this.logger.log('[WIDGET-SET-UP] - WAITING TIME NOT FOUND CHANGE: ', this.waitingTimeFoundMsg);
  }

  waitingTimeFoundMsgChange(event) {
    this.waitingTimeFoundMsg = event;
    this.logger.log('[WIDGET-SET-UP] - WAITING TIME FOUND CHANGE: ', this.waitingTimeFoundMsg);

    if (/\s$/.test(event)) {

      this.logger.log('[WIDGET-SET-UP] - WAITING TIME FOUND CHANGE - string contains space at last');
      this.addWhiteSpaceBefore = false;
    } else {

      this.logger.log('[WIDGET-SET-UP] - WAITING TIME FOUND CHANGE - string does not contain space at last');

      // IS USED TO ADD A WHITE SPACE TO THE 'PERSONALIZATION' VALUE IF THE STRING DOES NOT CONTAIN SPACE AT LAST
      this.addWhiteSpaceBefore = true;
    }
  }

  insertAtCursor(myField, myValue) {
    this.logger.log('[WIDGET-SET-UP] - insertAtCursor - myValue ', myValue);

    //IE support
    if (myField.selection) {
      myField.focus();
      let sel = myField.selection.createRange();
      sel.text = myValue;
      // this.cannedResponseMessage = sel.text;
    }
    //MOZILLA and others
    else if (myField.selectionStart || myField.selectionStart == '0') {
      var startPos = myField.selectionStart;
      this.logger.log('[WIDGET-SET-UP] - insertAtCursor - startPos ', startPos);

      var endPos = myField.selectionEnd;
      this.logger.log('[WIDGET-SET-UP] - insertAtCursor - endPos ', endPos);

      myField.value = myField.value.substring(0, startPos) + myValue + myField.value.substring(endPos, myField.value.length);

      // place cursor at end of text in text input element
      myField.focus();
      var val = myField.value; //store the value of the element
      myField.value = ''; //clear the value of the element
      myField.value = val + ' '; //set that value back. 

      this.waitingTimeFoundMsg = myField.value;

      // this.texareaIsEmpty = false;
      // myField.select();
    } else {
      myField.value += myValue;
      this.waitingTimeFoundMsg = myField.value;
    }
  }


  calloutTitleChange(event) {
    this.calloutTitle = event;
    this.logger.log('[WIDGET-SET-UP] - CALLOUT TITLE CHANGE: ', this.calloutTitle);
    // if (event.length === 0) {   }
    this.checkIsEmoji(this.calloutTitle.trim())
  }


  checkIsEmoji(calloutTitle) {
    this.calloutTitleForPreview = calloutTitle;
    this.callout_emoticon = null;
    const emojiRegex = require('emoji-regex');

    const regex = emojiRegex();
    let match;
    while (match = regex.exec(this.calloutTitleForPreview)) {
      const emoji = match[0];
      this.logger.log(`[WIDGET-SET-UP] checkIsEmoji emoji ${emoji} — code points: ${[emoji].length}`);

      this.logger.log(`[WIDGET-SET-UP] checkIsEmoji emoji: ${emoji} — position: `, this.calloutTitleForPreview.indexOf(emoji));

      if (this.calloutTitleForPreview.indexOf(emoji) === 0) {

        let cutCalloutTitle = this.calloutTitleForPreview.replace(emoji, "");
        this.logger.log(`[WIDGET-SET-UP] checkIsEmoji emoji ${emoji} —  at position 0: `, emoji);

        this.logger.log(`[WIDGET-SET-UP] checkIsEmoji — CUTTED CalloutTitle: `, cutCalloutTitle);

        this.callout_emoticon = emoji;
        this.calloutTitleForPreview = cutCalloutTitle;

      }

    }
  }


  calloutMsgChange(event) {
    this.calloutMsg = event
    this.logger.log('[WIDGET-SET-UP] - CALLOUT MSG CHANGE: ', this.calloutMsg);
    // if (event.length === 0) {  }
  }



  // ------------------------------------------------------------------------------------
  // Select language
  // ------------------------------------------------------------------------------------
  onSelectlang(selectedLang) {
    this.logger.log('[WIDGET-SET-UP] onSelectlang selectedLang ', selectedLang);
    this.selectedLangCode = selectedLang.code;
    this.logger.log('[WIDGET-SET-UP] - GET LABELS - onSelectlang (onSelectlang) ', this.selectedLangCode);
    this.selectedLangName = selectedLang.name;
    if (selectedLang) {
      this.getCurrentTranslation(selectedLang.code);
    }

  }

  // ------------------------------------------------------------------------------------
  // Save translation
  // ------------------------------------------------------------------------------------
  saveTranslation() {
    const save_online_offline_msgs = <HTMLElement>document.querySelector('.save_online_offline_msgs');

    if (save_online_offline_msgs) {
      save_online_offline_msgs.blur()
    }

    this.selected_translation["WELLCOME_TITLE"] = this.welcomeTitle;
    this.selected_translation["WELLCOME_MSG"] = this.welcomeMsg;
    this.selected_translation["WELCOME_TITLE"] = this.welcomeTitle;
    this.selected_translation["WELCOME_MSG"] = this.welcomeMsg;
    this.selected_translation["CALLOUT_TITLE_PLACEHOLDER"] = this.calloutTitle;
    this.selected_translation["CALLOUT_MSG_PLACEHOLDER"] = this.calloutMsg;
    this.selected_translation["LABEL_FIRST_MSG"] = this.onlineMsg;
    this.selected_translation["LABEL_FIRST_MSG_NO_AGENTS"] = this.offlineMsg;
    this.selected_translation["LABEL_FIRST_MSG_OPERATING_HOURS_CLOSED"] = this.officeClosedMsg;
    this.selected_translation["WAITING_TIME_NOT_FOUND"] = this.waitingTimeNotFoundMsg;
    this.selected_translation["WAITING_TIME_FOUND"] = this.waitingTimeFoundMsg;

    // ----------------------------------------------------------------------------------------
    // For custom pre-chat form 
    // ----------------------------------------------------------------------------------------
    this.selected_translation["LABEL_COMPLETE_FORM"] = this.LABEL_COMPLETE_FORM;
    this.selected_translation["LABEL_PRECHAT_USER_FULLNAME"] = this.LABEL_PRECHAT_USER_FULLNAME;
    this.selected_translation["LABEL_PRECHAT_USER_EMAIL"] = this.LABEL_PRECHAT_USER_EMAIL;
    this.selected_translation["LABEL_PRECHAT_USER_PHONE"] = this.LABEL_PRECHAT_USER_PHONE;
    this.selected_translation["LABEL_PRECHAT_ACCEPT_TERMS_PRIVACY"] = this.LABEL_PRECHAT_ACCEPT_TERMS_PRIVACY;
    this.selected_translation["LABEL_PRECHAT_STATIC_TERMS_PRIVACY"] = this.LABEL_PRECHAT_STATIC_TERMS_PRIVACY;
    this.selected_translation["LABEL_PRECHAT_FIRST_MESSAGE"] = this.LABEL_PRECHAT_FIRST_MESSAGE;

    // ----------------------------------------------------------------------------------------
    // For default pre-chat form 
    // ----------------------------------------------------------------------------------------
    this.selected_translation["LABEL_FIELD_NAME"] = this.LABEL_FIELD_NAME;
    this.selected_translation["LABEL_FIELD_EMAIL"] = this.LABEL_FIELD_EMAIL;



    this.logger.log('[WIDGET-SET-UP] - saveTranslation: ', this.selected_translation);

    this.saveLabels()

  }

  saveLabels() {
    // this.logger.log('[WIDGET-SET-UP] - selectedLangCode (saveLabels) ', this.selectedLangCode);
    this.logger.log('[WIDGET-SET-UP] - defaultLangCode (saveLabels) ', this.defaultLangCode);
    this.logger.log('[WIDGET-SET-UP] - selected_translation (saveLabels) ', this.selected_translation);

    let isdefault = null

    if (this.selectedLangCode === this.defaultLangCode) {
      isdefault = true
    } else {
      isdefault = false
    }


    this.widgetService.editLabels(this.selectedLangCode.toUpperCase(), isdefault, this.selected_translation)
      .subscribe((labels: any) => {
        this.logger.log('[WIDGET-SET-UP] - saveTranslation RES ', labels);

      }, error => {
        this.logger.error('[WIDGET-SET-UP] - saveTranslation - ERROR ', error)
      }, () => {

        if (this.HAS_CHANGED_GREETINGS === true) {
          this.notify.showWidgetStyleUpdateNotification(this.translationMap.get('UpdateDeptGreetingsSuccessNoticationMsg'), 2, 'done');
        }
        this.logger.log('[WIDGET-SET-UP] - saveTranslation * COMPLETE *')
      });
  }


  getBrowserLang() {
    this.browserLang = this.translate.getBrowserLang();
    this.logger.log('[WIDGET-SET-UP] - BROWSER LANG ', this.browserLang)
  }

  getEnDefaultTranslation() {

    this.widgetService.getEnDefaultLabels().subscribe((labels: any) => {
      this.logger.log('[WIDGET-SET-UP] ***** GET labels DEFAULT TRANSLATION ***** - RES ', labels);
      if (labels) {
        this.logger.log('[WIDGET-SET-UP] ***** GET labels DEFAULT TRANSLATION ***** - RES DATA', labels.data);

        if (labels.data.hasOwnProperty('LABEL_PRECHAT_USER_FULLNAME')) {
          this.logger.log('[WIDGET-SET-UP] ***** GET labels DEFAULT TRANSLATION ***** - EXIST LABEL_PRECHAT_USER_FULLNAME');
        } else {
          this.logger.log('[WIDGET-SET-UP] ***** GET labels DEFAULT TRANSLATION ***** - NOT EXIST LABEL_PRECHAT_USER_FULLNAME');
        }
      }
    })
  }

  getCurrentProject() {
    this.sub = this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.id_project = project._id
        this.projectName = project.name;
        this.logger.log('[WIDGET-SET-UP] - SUBSCRIBE TO CURRENT - PRJCT-ID ', this.id_project)

        if (this.id_project) {
          this.getProjectById();
        }
      }
    });
  }


  getProjectById() {
    this.projectService.getProjectById(this.id_project).subscribe((project: any) => {

      // this.logger.log('[WIDGET-SET-UP] - PRJCT (onInit): ', project);
      //  this.logger.log('[WIDGET-SET-UP] - PRJCT > widget (onInit): ', project.widget);

      if (project.widget) {
        this.widgetObj = project.widget;
        // ------------------------------------------------------------------------
        // @ calloutTimer
        // WIDGET AND CALLOUT-TIMER DEFINED
        // ------------------------------------------------------------------------
        if (project.widget.calloutTimer) {
          this.calloutTimerSecondSelected = project.widget.calloutTimer;
          this.CALLOUT_IS_DISABLED = false;
          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) CALLOUT-TIMER: ', this.calloutTimerSecondSelected, 'IS DISABLED ', this.CALLOUT_IS_DISABLED);

        } else {

          // ------------------------------------------------------------------------
          // @ calloutTimer
          // WIDGET DEFINED BUT NOT CALLOUT-TIMER - SET DEFAULT
          // ------------------------------------------------------------------------
          this.logger.log('[WIDGET-SET-UP] - onInit WIDGET DEFINED BUT CALLOUT-TIMER IS: ', this.calloutTimerSecondSelected, ' > SET DEFAULT ')
          // this.calloutTimerSecondSelected = -1;
          this.calloutTimerSecondSelected = 5;
          this.CALLOUT_IS_DISABLED = true;
          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) CALLOUT-TIMER: ', this.calloutTimerSecondSelected, ' - IS DISABLED ', this.CALLOUT_IS_DISABLED);

        }

        // ------------------------------------------------------------------------
        // @ Display widget desktop and mobile
        // WIDGET DEFINED
        // ------------------------------------------------------------------------
        // this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) project.widget.displayOnDesktop 1: ', project.widget.displayOnDesktop);
        if (project.widget.displayOnDesktop === false) {
          // this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) project.widget.displayOnDesktop 2: ', project.widget.displayOnDesktop);
          this.desktop_widget_is_visible = false
          // this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) desktop_widget_is_visible : ', this.desktop_widget_is_visible);
        }

        // this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) project.widget.displayOnMobile 1 : ', project.widget.displayOnMobile);
        if (project.widget.displayOnMobile === false) {
          // this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) project.widget.displayOnMobile 2 : ', project.widget.displayOnMobile);
          this.mobile_widget_is_visible = false
          // this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) mobile_widget_is_visible : ', this.mobile_widget_is_visible);
        }

        // ------------------------------------------------------------------------
        // @ Widget desktop status (open / closed)
        // WIDGET DEFINED
        // ------------------------------------------------------------------------
        if (project.widget.onPageChangeVisibilityDesktop) {
          this.desktopWidgetStatus = project.widget.onPageChangeVisibilityDesktop
        }

        // if (project.widget.d_on_page_load && project.widget.d_on_page_load === 'open') {
        //   this.desktopWidgetStatus = 'open'
        // }

        // if (project.widget.d_on_page_load && project.widget.d_on_page_load === 'close') {
        //   this.desktopWidgetStatus = 'close'
        // }

        // if (project.widget.d_on_page_load && project.widget.d_on_page_load === 'last') {
        //   this.desktopWidgetStatus = 'last'
        // }

        // ------------------------------------------------------------------------
        // @ Widget mobile status (open / closed)
        // WIDGET DEFINED
        // ------------------------------------------------------------------------
        if (project.widget.onPageChangeVisibilityMobile) {
          this.mobileWidgetStatus = project.widget.onPageChangeVisibilityMobile
        }

        // if (project.widget.m_on_page_load && project.widget.m_on_page_load === 'open') {
        //   this.mobileWidgetStatus = 'open'
        // }

        // if (project.widget.m_on_page_load && project.widget.m_on_page_load === 'close') {
        //   this.mobileWidgetStatus = 'close'
        // }

        // if (project.widget.m_on_page_load && project.widget.m_on_page_load === 'last') {
        //   this.mobileWidgetStatus = 'last'
        // }
        // ------------------------------------------------------------------------
        // @ poweredBy
        // WIDGET AND POWERED-BY DEFINED
        // ------------------------------------------------------------------------
        if (project.widget.poweredBy) {
          this.footerBrand = project.widget.poweredBy;

          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) POWERED-BY (footerBrand) : ', this.footerBrand);

        } else {
          // ------------------------------------------------------------------------
          // @ poweredBy
          // WIDGET DEFINED BUT NOT POWERED-BY - SET DEFAULT
          // ------------------------------------------------------------------------
          this.logger.log('[WIDGET-SET-UP] - onInit WIDGET DEFINED BUT POWERED-BY IS: ', project.widget.poweredBy, ' > SET DEFAULT ')
          // this.calloutTimerSecondSelected = -1;

          // this.footerBrand = '<a tabindex="-1" target="_blank" href="http://www.tiledesk.com/?utm_source=widget"><img src="https://panel.tiledesk.com/v3/dashboard/assets/img/logos/tiledesk-solo_logo_new_gray.svg"/><span>Powered by Tiledesk</span></a>';
          this.footerBrand = this.defaultFooter
        }

        // -------------------------------------------
        // @ baloonImage LauncherLogo
        // -------------------------------------------
        if (project.widget.baloonImage) {
          this.customLauncherURL = project.widget.baloonImage;
          this.hasOwnLauncherBtn = true;
          this.hasOwnLauncherLogo = false;

          // this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) BALOON IMAGE : ', this.customLauncherURL);
          // this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) hasOwnLauncherBtn : ', this.hasOwnLauncherBtn);
          // this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) hasOwnLauncherLogo : ', this.hasOwnLauncherLogo);

        } else {
          // ------------------------------------------------------------------------
          // @ poweredBy
          // WIDGET DEFINED BUT NOT POWERED-BY - SET DEFAULT
          // ------------------------------------------------------------------------
          this.hasOwnLauncherBtn = false;
          this.hasOwnLauncherLogo = false;
          // this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) BUT NOT POWERED-BY hasOwnLauncherBtn: ', this.hasOwnLauncherBtn);
          // this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) BUT NOT POWERED-BY hasOwnLauncherBtn: ', this.hasOwnLauncherLogo);

        }



        // ------------------------------------------------------------------------
        // @ Logochat
        // case logoChat = 'userCompanyLogoUrl' > display the userCompanyLogoUrl
        // logoChat (WIDGET AND LOGOCHAT DEFINED - USER HAS SETTED HIS LOGO)
        // ------------------------------------------------------------------------
        // if (project.widget.logoChat && project.widget.logoChat !== 'nologo' && project.widget.logoChat !== 'https://tiledesk.com/tiledesk-logo-white.png') {
        if (project.widget.logoChat && project.widget.logoChat !== 'nologo' && project.widget.logoChat !== this.widgetLogoURL) {
          this.logoUrl = project.widget.logoChat;
          this.hasOwnLogo = true;
          this.LOGO_IS_ON = true;

          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) LOGO URL: ', project.widget.logoChat, ' HAS HOWN LOGO ', this.hasOwnLogo, ' LOGO IS ON', this.LOGO_IS_ON);

          // ------------------------------------------------------------------------
          // @ Logochat
          // case logoChat = 'nologo' > no logo is displayed
          // logoChat (WIDGET AND LOGOCHAT DEFINED - USER HAS SELECTED 'NO LOGO')
          // ------------------------------------------------------------------------
          // } else if (project.widget.logoChat && project.widget.logoChat === 'nologo' && project.widget.logoChat !== 'https://tiledesk.com/tiledesk-logo-white.png') {
        } else if (project.widget.logoChat && project.widget.logoChat === 'nologo' && project.widget.logoChat !== this.widgetLogoURL) {
          this.logoUrl = 'No Logo';
          this.hasOwnLogo = false;
          this.LOGO_IS_ON = false;

          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) LOGO URL: ', project.widget.logoChat, ' HAS HOWN LOGO ', this.hasOwnLogo, ' LOGO IS ON', this.LOGO_IS_ON);


          // ------------------------------------------------------------------------
          // @ Logochat
          // case logoChat = '' > display the tiledesk logo and in the input field display the text 'tiledesklogo'
          // logoChat (WIDGET DEFINED BUT NOT LOGOCHAT - SET DEFAULT)
          // ------------------------------------------------------------------------
        } else {

          this.logoUrl = this.widgetLogoURL; //'https://tiledesk.com/tiledesk-logo-white.png'
          this.hasOwnLogo = false;
          this.LOGO_IS_ON = true;

          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) LOGO URL: ', project.widget.logoChat, ' HAS HOWN LOGO ', this.hasOwnLogo, ' LOGO IS ON', this.LOGO_IS_ON);
        }

        // -----------------------------------------
        // Single conversation
        // -----------------------------------------
        if (project.widget.singleConversation) {

          this.singleConversation = true;
          // this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) - singleConversation', this.singleConversation)
        } else {
          this.singleConversation = false;
          // this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) - singleConversation', this.singleConversation)
        }


        // -----------------------------------------
        // Pre-chat form
        // -----------------------------------------
        if (project.widget.preChatForm) {
          this.preChatForm = true;
        } else {
          this.preChatForm = false;
        }

        if (project.widget.preChatFormCustomFieldsEnabled) {
          this.preChatFormCustomFieldsEnabled = true
        } else {
          this.preChatFormCustomFieldsEnabled = false;
        }

        if (project.widget.preChatFormJson) {
          // this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) preChatFormJson: ', project.widget.preChatFormJson)
          // this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) project.widget.visualTool: ',project.widget.visualTool)
          // PRECHAT_FIRST_MESSAGE_ROWS
          project.widget.preChatFormJson.forEach(field => {
            // this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) preChatFormJson - field: ',field)
            if (field.name === 'firstMessage') {
              this.PRECHAT_FIRST_MESSAGE_ROWS = field.rows
            }
          });


          if (project.widget.visualTool && project.widget.visualTool === true) {
            this.hasBuiltPrechatformWithVisualTool = true
            this.displayNewCustomPrechatFormBuilder = true
          } else if (project.widget.visualTool && project.widget.visualTool === false) {
            this.hasBuiltPrechatformWithVisualTool = false
            this.displayNewCustomPrechatFormBuilder = false
          } else if (!project.widget.visualTool) {
            this.hasBuiltPrechatformWithVisualTool = false
            this.displayNewCustomPrechatFormBuilder = false
          }

          // this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) > displayNewCustomPrechatFormBuilder: ', this.displayNewCustomPrechatFormBuilder);
          // this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) > hasBuiltPrechatformWithVisualTool: ', this.hasBuiltPrechatformWithVisualTool);
          // this.prechatFormTexareaJson = JSON.stringify(this.widgetDefaultSettings.preChatFormJson);
          this.prechatFormArray = project.widget.preChatFormJson;
          this.prechatFormTexareaJson = JSON.stringify(project.widget.preChatFormJson, null, 4);
          this.removepreChatFormFieldsIfAlreadyUsed(this.preChatFormFields, project.widget.preChatFormJson);
          // this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) prechatFormTexareaJson: ', this.prechatFormTexareaJson)
          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) PRE-CHAT-FORM-JSON DEFINED typeof: ', typeof project.widget.preChatFormJson)
        } else {
          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) PRE-CHAT-FORM-JSON NOT DEFINED ')

          this.hasBuiltPrechatformWithVisualTool = true
          this.displayNewCustomPrechatFormBuilder = true
          this.PRECHAT_FIRST_MESSAGE_ROWS = 5
          // this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) PRE-CHAT-FORM-JSON NOT DEFINED displayNewCustomPrechatFormBuilder: ', this.displayNewCustomPrechatFormBuilder);
          // this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) PRE-CHAT-FORM-JSON NOT DEFINED hasBuiltPrechatformWithVisualTool: ', this.hasBuiltPrechatformWithVisualTool);

          // this.prechatFormObject = this.widgetDefaultSettings.preChatFormJson;
          // this.prechatFormTexareaJson = JSON.stringify(this.widgetDefaultSettings.preChatFormJson, null, 4);
          // this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) PRE-CHAT-FORM-JSON UNDEFINED: ', this.widgetDefaultSettings.preChatFormJson)
          // this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) PRE-CHAT-FORM-JSON UNDEFINED typeof: ', typeof this.widgetDefaultSettings.preChatFormJson)

        }

        // -----------------------------------------
        // NATIVE Rating
        // -----------------------------------------
        if (project.widget.nativeRating) {
          this.nativeRating = true;
        } else {
          this.nativeRating = false;
        }



        // ------------------------------------------------------------------------
        // @ themeColor
        // themeColor (WIDGET AND THEME-COLOR DEFINED)
        // ------------------------------------------------------------------------
        if (project.widget.themeColor) {

          this.primaryColor = project.widget.themeColor;
          // this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) THEME COLOR: ', this.primaryColor);
          this.primaryColorRgb = this.hexToRgb(this.primaryColor)
          this.generateRgbaGradientAndBorder(this.primaryColorRgb);

        } else {

          // ------------------------------------------------------------------------
          // @ themeColor
          // case themeColor IS undefined
          // themeColor (WIDGET DEFINED BUT NOT THEME-COLOR - SET DEFAULT)
          // ------------------------------------------------------------------------
          this.primaryColor = this.widgetDefaultSettings.themeColor

          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) THEME COLOR: ', project.widget.themeColor,
            ' IS UNDEFINED > SET DEFAULT ', this.primaryColor);

          this.primaryColorRgb = this.hexToRgb(this.primaryColor);
          this.generateRgbaGradientAndBorder(this.primaryColorRgb);
        }

        // theme color opacity
        if (!project.widget.themeColorOpacity || project.widget.themeColorOpacity === 100) {
          this.themeColorOpacity = "1";
          // this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) THEME COLOR OPACITY: ', this.themeColorOpacity);
          this.primaryColorOpacityEnabled = false
          this.generateRgbaGradientAndBorder(this.primaryColorRgb);
        }
        if (project.widget.themeColorOpacity === 0) {
          // this.logger.log('here yes project.widget.themeColorOpacity ', project.widget.themeColorOpacity)
          this.themeColorOpacity = "0.50";
          this.primaryColorOpacityEnabled = true
          this.generateRgbaGradientAndBorder(this.primaryColorRgb);
        }


        // ------------------------------------------------------------------------
        // @ themeForegroundColor
        // (WIDGET AND THEME-FOREGROUND-COLOR DEFINED)
        // ------------------------------------------------------------------------
        if (project.widget.themeForegroundColor) {
          this.secondaryColor = project.widget.themeForegroundColor;
          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) THEME-FOREGROUND COLOR: ', this.secondaryColor);
        } else {

          // ------------------------------------------------------------------------
          // @ themeForegroundColor
          // case themeForegroundColor IS undefined
          // themeForegroundColor (WIDGET DEFINED BUT NOT THEME-FOREGROUND-COLOR )
          // ------------------------------------------------------------------------
          this.secondaryColor = this.widgetDefaultSettings.themeForegroundColor;

          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) THEME-FOREGROUND COLOR: ', project.widget.themeForegroundColor,
            ' IS UNDEFINED > SET DEFAULT ', this.secondaryColor);
        }

        // ------------------------------------------------------------------------
        // @ Align
        // align (WIDGET AND ALIGN DEFINED)
        // ------------------------------------------------------------------------
        if (project.widget.align && project.widget.align === 'left') {
          this.hasSelectedLeftAlignment = true;
          this.hasSelectedRightAlignment = false;
          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) ALIGN: ', project.widget.align);
        } else {

          // -----------------------------------------------------------------------
          // @ Align
          // WIDGET DEFINED BUT NOT ALIGN
          // -----------------------------------------------------------------------
          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) ALIGN: ', project.widget.align, 'IS UNDEFINED > SET DEFAULT');
          this.hasSelectedLeftAlignment = false;
          this.hasSelectedRightAlignment = true;
        }

        // -----------------------------------------------------------------------
        // @ Reply time
        // WIDGET DEFINED
        // -----------------------------------------------------------------------
        this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) DYNAMIC REPLY TIME: ', project.widget.dynamicWaitTimeReply);

        if (project.widget.dynamicWaitTimeReply === true) {
          this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG = true;
          this.HAS_SELECT_STATIC_REPLY_TIME_MSG = false;
          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET UNDEFINED) >  HAS_SELECT_DYMANIC_REPLY_TIME_MSG: ', this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG);
          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET UNDEFINED) >  HAS_SELECT_DYMANIC_REPLY_TIME_MSG: ', this.HAS_SELECT_STATIC_REPLY_TIME_MSG);
        } else {
          this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG = false;
          this.HAS_SELECT_STATIC_REPLY_TIME_MSG = true;
          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET UNDEFINED) >  HAS_SELECT_DYMANIC_REPLY_TIME_MSG: ', this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG);
          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET UNDEFINED) >  HAS_SELECT_DYMANIC_REPLY_TIME_MSG: ', this.HAS_SELECT_STATIC_REPLY_TIME_MSG);
        }

      } else {

        this.widgetObj = {}
        this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET UNDEFINED)');
        // -----------------------------------------------------------------------
        // @ LogoChat
        // WIDGET UNDEFINED
        // -----------------------------------------------------------------------
        this.logoUrl = this.widgetLogoURL; // 'https://tiledesk.com/tiledesk-logo-white.png'
        this.hasOwnLogo = false;
        this.LOGO_IS_ON = true

        this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET UNDEFINED) > SET DEFAULT LOGOURL: ', this.logoUrl, 'HAS OWN LOGO ', this.hasOwnLogo, 'LOGO IS ON ', this.LOGO_IS_ON);

        // -----------------------------------------------------------------------
        // @ LauncherLogo
        // WIDGET UNDEFINED
        // -----------------------------------------------------------------------
        this.hasOwnLauncherBtn = false;
        this.hasOwnLauncherLogo = false;
        this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET UNDEFINED) > hasOwnLauncherBtn: ', this.hasOwnLauncherBtn);
        this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET UNDEFINED) > hasOwnLauncherLogo: ', this.hasOwnLauncherLogo);

        // -----------------------------------------------------------------------
        // @ themeColor
        // WIDGET UNDEFINED
        // -----------------------------------------------------------------------
        this.primaryColor = this.widgetDefaultSettings.themeColor
        this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET UNDEFINED) > SET DEFAULT THEME COLOR: ', this.primaryColor);
        this.primaryColorRgb = this.hexToRgb(this.primaryColor);
        this.themeColorOpacity = "1";
        this.primaryColorOpacityEnabled = false;

        this.generateRgbaGradientAndBorder(this.primaryColorRgb);

        // -----------------------------------------------------------------------
        // @ themeForegroundColor
        // WIDGET UNDEFINED
        // -----------------------------------------------------------------------
        this.secondaryColor = this.widgetDefaultSettings.themeForegroundColor;
        this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET UNDEFINED) > SET DEFAULT THEME-FOREGROUND COLOR: ', this.secondaryColor);

        // -----------------------------------------------------------------------
        // @ calloutTimer
        // WIDGET UNDEFINED
        // -----------------------------------------------------------------------
        // this.calloutTimerSecondSelected = -1;
        this.calloutTimerSecondSelected = 5;
        this.CALLOUT_IS_DISABLED = true;

        // -----------------------------------------------------------------------
        // @ POWERED-BY
        // WIDGET UNDEFINED
        // -----------------------------------------------------------------------

        // this.footerBrand = '<a tabindex="-1" target="_blank" href="http://www.tiledesk.com/?utm_source=widget"><img src="https://panel.tiledesk.com/v3/dashboard/assets/img/logos/tiledesk-solo_logo_new_gray.svg"/><span>Powered by Tiledesk</span></a>'
        this.footerBrand = this.defaultFooter

        // -----------------------------------------------------------------------
        // @ Single conversation
        // WIDGET UNDEFINED
        // -----------------------------------------------------------------------
        this.singleConversation = false;
        // this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET UNDEFINED) - singleConversation', this.singleConversation)

        // -----------------------------------------------------------------------
        // @ preChatForm
        // WIDGET UNDEFINED
        // -----------------------------------------------------------------------
        this.preChatForm = false;
        this.preChatFormCustomFieldsEnabled = false;
        this.hasBuiltPrechatformWithVisualTool = true
        this.displayNewCustomPrechatFormBuilder = true
        this.PRECHAT_FIRST_MESSAGE_ROWS = 5
        // this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET UNDEFINED) > preChatForm: ', this.preChatForm);
        // this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET UNDEFINED) > preChatFormCustomFieldsEnabled: ', this.preChatFormCustomFieldsEnabled);
        // this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET UNDEFINED) > hasBuiltPrechatformWithVisualTool: ', this.hasBuiltPrechatformWithVisualTool);
        // this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET UNDEFINED) > displayNewCustomPrechatFormBuilder: ', this.displayNewCustomPrechatFormBuilder);
        // this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET UNDEFINED) > PRECHAT_FIRST_MESSAGE_ROWS: ', this.PRECHAT_FIRST_MESSAGE_ROWS);
        // this.prechatFormTexareaJson = JSON.stringify(this.widgetDefaultSettings.preChatFormJson, null, 4);
        // this.prechatFormObject = this.widgetDefaultSettings.preChatFormJson;
        // -----------------------------------------------------------------------
        // @ nativeRating
        // WIDGET UNDEFINED
        // -----------------------------------------------------------------------
        this.nativeRating = false;



        // -----------------------------------------------------------------------
        // @ Reply time
        // WIDGET UNDEFINED
        // -----------------------------------------------------------------------
        this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG = true;
        this.HAS_SELECT_STATIC_REPLY_TIME_MSG = false;
        this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET UNDEFINED) >  HAS_SELECT_DYMANIC_REPLY_TIME_MSG: ', this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG);
        this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET UNDEFINED) >  HAS_SELECT_DYMANIC_REPLY_TIME_MSG: ', this.HAS_SELECT_STATIC_REPLY_TIME_MSG);
      }

    }, (error) => {
      this.logger.error('[WIDGET-SET-UP] - GET PROJECT BY ID - ERROR ', error);
      this.showSpinner = false;
    }, () => {
      this.logger.log('[WIDGET-SET-UP] - GET PROJECT BY ID - COMPLETE ');

      this.showSpinner = false;
    });
  }



  // --------------------------------------------------------------------------
  // *** Preset color combination ***  
  // --------------------------------------------------------------------------
  setPresetColorComb(primaryColor: string, secondaryColor: string) {

    this.logger.log('setPresetColorComb widget_preview_selected ', this.widget_preview_selected)

    if (this.widget_preview_selected === '0001') {
      this.DISPLAY_WIDGET_HOME = true;
      this.DISPLAY_CALLOUT = false;
      this.DISPLAY_WIDGET_CHAT = false;
      this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    }

    if (this.widget_preview_selected === '0002') {
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = false;
      this.DISPLAY_WIDGET_CHAT = true;
      this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    }

    if (this.widget_preview_selected === '0003') {
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = true;
      this.DISPLAY_WIDGET_CHAT = false;
      this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    }

    if (this.widget_preview_selected === '0004') {
      this.widget_preview_selected = "0004"
    }

    if (this.widget_preview_selected === '0005') {
      this.widget_preview_selected = "0005"
    }

    this.logger.log('[WIDGET-SET-UP] - setPresetCombOne ', primaryColor, secondaryColor);
    this.primaryColor = primaryColor;
    this.secondaryColor = secondaryColor;

    this.onChangePrimaryColor(primaryColor);

    this.widgetObj['themeColor'] = primaryColor
    this.widgetObj['themeForegroundColor'] = secondaryColor
  }


  // --------------------------------------------------------------------------
  // *** PRIMARY COLOR (alias for themeColor) ***  
  // --------------------------------------------------------------------------
  /**
   * onChangePrimaryColor: USED FOR THE COLOR PREVIEW (IT IS NECESSARY FOR THE PRIMARY COLOR GIVEN THAT
   * FROM IT ARE GENERATED OTHER PROPERTIES - WITHOUT RUNS generateRgbaGradientAndBorder IN
   * THIS THE UPDATED COLORS OF THE WIDGET'S PREVIEW ARE VISIBLE ONLY AFTER PRESSED TO 'OK' IN onSelectPrimaryColor)
   * @param $event
   */
  onChangePrimaryColor($event) {
    this.logger.log('onChangePrimaryColor widget_preview_selected ', this.widget_preview_selected)
    if (this.widget_preview_selected === '0001') {
      this.DISPLAY_WIDGET_HOME = true;
      this.DISPLAY_CALLOUT = false;
      this.DISPLAY_WIDGET_CHAT = false;
      this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    }

    if (this.widget_preview_selected === '0002') {
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = false;
      this.DISPLAY_WIDGET_CHAT = true;
      this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    }

    if (this.widget_preview_selected === '0003') {
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = true;
      this.DISPLAY_WIDGET_CHAT = false;
      this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    }

    if (this.widget_preview_selected === '0004') {
      this.widget_preview_selected = "0004"
    }

    if (this.widget_preview_selected === '0005') {
      this.widget_preview_selected = "0005"
    }



    this.primaryColor = $event

    // this.logger.log('+ WIDGET DESIGN - ON CHANGE PRIMARY COLOR ', $event);
    // this.widgetService.publishPrimaryColorSelected(this.primaryColor);
    this.primaryColorRgb = this.hexToRgb(this.primaryColor)
    this.logger.log('[WIDGET-SET-UP] - ON CHANGE PRIMARY COLOR - PRIMARY COLOR RGB ', this.primaryColorRgb);
    this.generateRgbaGradientAndBorder(this.primaryColorRgb);

  }

  onFocusChangePrimaryColor() {
    this.logger.log('onFocusChangePrimaryColor widget_preview_selected ', this.widget_preview_selected)

    if (this.widget_preview_selected === '0001') {
      this.DISPLAY_WIDGET_HOME = true;
      this.DISPLAY_CALLOUT = false;
      this.DISPLAY_WIDGET_CHAT = false;
      this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    }

    if (this.widget_preview_selected === '0002') {
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = false;
      this.DISPLAY_WIDGET_CHAT = true;
      this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    }

    if (this.widget_preview_selected === '0003') {
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = true;
      this.DISPLAY_WIDGET_CHAT = false;
      this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    }

    if (this.widget_preview_selected === '0004') {
      this.widget_preview_selected = "0004"
    }

    if (this.widget_preview_selected === '0005') {
      this.widget_preview_selected = "0005"
    }
  }

  onOpenPrimaryColorDialog($event) {
    this.logger.log('onOpenPrimaryColorDialog widget_preview_selected ', this.widget_preview_selected)
    if (this.widget_preview_selected === '0001') {
      this.DISPLAY_WIDGET_HOME = true;
      this.DISPLAY_CALLOUT = false;
      this.DISPLAY_WIDGET_CHAT = false;
      this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    }

    if (this.widget_preview_selected === '0002') {
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = false;
      this.DISPLAY_WIDGET_CHAT = true;
      this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    }

    if (this.widget_preview_selected === '0003') {
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = true;
      this.DISPLAY_WIDGET_CHAT = false;
      this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    }

    if (this.widget_preview_selected === '0004') {
      this.widget_preview_selected = "0004"
    }

    if (this.widget_preview_selected === '0005') {
      this.widget_preview_selected = "0005"
    }
  }

  hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    const resultR = parseInt(result[1], 16);
    const resultG = parseInt(result[2], 16);
    const resultB = parseInt(result[3], 16)

    return result ? 'rgb' + '(' + resultR + ',' + resultG + ',' + resultB + ')' : null;

  }

  onClosePrimaryColorDialog(event) {
    this.logger.log('[WIDGET-SET-UP] - ON CLOSE PRIMARY COLOR DIALOG ', event);
    this.primaryColor = event

    if (this.primaryColor !== this.widgetDefaultSettings.themeColor) {
      this.widgetObj['themeColor'] = this.primaryColor
    } else {

      // *** REMOVE PROPERTY
      delete this.widgetObj['themeColor'];
    }
  }


  generateRgbaGradientAndBorder(primaryColor: string) {
    // this.logger.log('»» WIDGET DESIGN - ON CLOSE PRIMARY COLOR DIALOG COLOR (RGB) ', primaryColor);
    const new_col = primaryColor.replace(/rgb/i, 'rgba');
    // this.primaryColorRgba = new_col.replace(/\)/i, ',0.50)');
    this.primaryColorRgba = new_col.replace(/\)/i, `, ${this.themeColorOpacity})`);
    // this.logger.log('»» WIDGET DESIGN - PRIMARY COLOR RGBA ', this.primaryColorRgba);

    // this.logger.log('»» WIDGET DESIGN - PRIMARY COLOR RGBA ', this.primaryColorRgba);

    this.primaryColorGradiend = `linear-gradient(${this.primaryColor}, ${this.primaryColorRgba})`;
    this.primaryColorBorder = `2.4px solid ${this.primaryColorRgba}`;
  }

  // --------------------------------------------------------------------------------------
  //  @ Primary  color opacity   
  // --------------------------------------------------------------------------------------
  changePrimaryColorOpacity(event) {
    // this.logger.log('Enable / Disable primary color  opacity - event', event.target.checked);
    this.primaryColorOpacityEnabled = event.target.checked;
    if (this.primaryColorOpacityEnabled === false) {
      this.themeColorOpacity = "1";
      // this.themeColorOpacity = "0.50"
      this.widgetObj['themeColorOpacity'] = 100;
      this.generateRgbaGradientAndBorder(this.primaryColorRgb)
      this.widgetService.updateWidgetProject(this.widgetObj)
    } else if (this.primaryColorOpacityEnabled === true) {
      this.themeColorOpacity = "0.50"
      // this.themeColorOpacity = "1"
      this.widgetObj['themeColorOpacity'] = 0;
      // delete this.widgetObj['themeColorOpacity'];
      this.generateRgbaGradientAndBorder(this.primaryColorRgb)
      this.widgetService.updateWidgetProject(this.widgetObj)
    }
  }

  // --------------------------------------------------------------------------------------
  //  @ SECONDARY COLOR (alias for themeForegroundColor) ***  
  // --------------------------------------------------------------------------------------
  onCloseSecondaryColorDialog(event) {
    this.logger.log('[WIDGET-SET-UP] - ON CLOSE SECONDARY DIALOG ', event);
    this.secondaryColor = event

    if (this.secondaryColor !== this.widgetDefaultSettings.themeForegroundColor) {
      // *** ADD PROPERTY
      this.widgetObj['themeForegroundColor'] = this.secondaryColor
      /**
       * *** WidgetProject IS UPDATED WHEN THE USER CLICK ON SAVE ***   */
      // this.widgetService.updateWidgetProject(this.widgetObj)
    } else {
      // *** REMOVE PROPERTY
      delete this.widgetObj['themeForegroundColor'];
    }
  }

  onChangeSecondaryColor(event) {

    this.logger.log('onChangeSecondaryColor widget_preview_selected ', this.widget_preview_selected)
    if (this.widget_preview_selected === '0001') {
      this.DISPLAY_WIDGET_HOME = true;
      this.DISPLAY_CALLOUT = false;
      this.DISPLAY_WIDGET_CHAT = false;
      this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    }

    if (this.widget_preview_selected === '0002') {
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = false;
      this.DISPLAY_WIDGET_CHAT = true;
      this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    }

    if (this.widget_preview_selected === '0003') {
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = true;
      this.DISPLAY_WIDGET_CHAT = false;
      this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    }

    if (this.widget_preview_selected === '0004') {
      this.widget_preview_selected = "0004"
    }
    if (this.widget_preview_selected === '0005') {
      this.widget_preview_selected = "0005"
    }

    this.logger.log('[WIDGET-SET-UP] - onChangeSecondaryColor ', event);
    this.secondaryColor = event;
    if (this.secondaryColor !== this.widgetDefaultSettings.themeForegroundColor) {
      // *** ADD PROPERTY
      this.widgetObj['themeForegroundColor'] = this.secondaryColor

      /**
       * *** WidgetProject IS UPDATED WHEN THE USER CLICK ON SAVE ***   */
      // this.widgetService.updateWidgetProject(this.widgetObj)
    } else {
      // *** REMOVE PROPERTY
      delete this.widgetObj['themeForegroundColor'];

      /**
       * *** WidgetProject IS UPDATED WHEN THE USER CLICK ON SAVE ***   */
      // this.widgetService.updateWidgetProject(this.widgetObj)
    }
  }

  onOpenSecondaryColorDialog($event) {
    this.logger.log('onOpenSecondaryColorDialog widget_preview_selected ', this.widget_preview_selected)
    if (this.widget_preview_selected === '0001') {
      this.DISPLAY_WIDGET_HOME = true;
      this.DISPLAY_CALLOUT = false;
      this.DISPLAY_WIDGET_CHAT = false;
      this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    }

    if (this.widget_preview_selected === '0002') {
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = false;
      this.DISPLAY_WIDGET_CHAT = true;
      this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    }

    if (this.widget_preview_selected === '0003') {
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = true;
      this.DISPLAY_WIDGET_CHAT = false;
      this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    }

    if (this.widget_preview_selected === '0004') {
      this.widget_preview_selected = "0004"
    }

    if (this.widget_preview_selected === '0005') {
      this.widget_preview_selected = "0005"
    }

  }

  onFocusChangeSecondaryColor() {
    this.logger.log('onFocusChangeSecondaryColor widget_preview_selected ', this.widget_preview_selected)
    if (this.widget_preview_selected === '0001') {
      this.DISPLAY_WIDGET_HOME = true;
      this.DISPLAY_CALLOUT = false;
      this.DISPLAY_WIDGET_CHAT = false;
      this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    }

    if (this.widget_preview_selected === '0002') {
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = false;
      this.DISPLAY_WIDGET_CHAT = true;
      this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    }

    if (this.widget_preview_selected === '0003') {
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = true;
      this.DISPLAY_WIDGET_CHAT = false;
      this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    }

    if (this.widget_preview_selected === '0004') {
      this.widget_preview_selected = "0004"
    }

    if (this.widget_preview_selected === '0005') {
      this.widget_preview_selected = "0005"
    }
  }

  onFocusWelcomeMsg() {
    this.DISPLAY_WIDGET_HOME = true;
    this.DISPLAY_CALLOUT = false;
    this.DISPLAY_WIDGET_CHAT = false;
    this.widget_preview_selected = "0000"
    this.DISPLAY_WIDGET_PRECHAT_FORM = false;
  }

  onFocusWelcomeTitle() {
    this.DISPLAY_WIDGET_HOME = true;
    this.DISPLAY_CALLOUT = false;
    this.DISPLAY_WIDGET_CHAT = false;
    this.widget_preview_selected = "0000"
    this.DISPLAY_WIDGET_PRECHAT_FORM = false;
  }

  onFocusReplyTime() {
    this.DISPLAY_WIDGET_HOME = true;
    this.DISPLAY_CALLOUT = false;
    this.DISPLAY_WIDGET_CHAT = false;
    this.widget_preview_selected = "0000"
    this.DISPLAY_WIDGET_PRECHAT_FORM = false;
  }

  // ---- NEW
  onFocusOnlineGreetings() {
    this.DISPLAY_WIDGET_HOME = false;
    this.DISPLAY_CALLOUT = false;
    this.DISPLAY_WIDGET_CHAT = true

    this.HAS_FOCUSED_ONLINE_MSG = true;
    this.HAS_FOCUSED_OFFLINE_MSG = false;
    this.HAS_FOCUSED_OFFICE_CLOSED_MSG = false;
    this.widget_preview_selected = "0002"
    this.DISPLAY_WIDGET_PRECHAT_FORM = false;
  }

  onFocusOfflineGreetings() {
    this.DISPLAY_WIDGET_HOME = false;
    this.DISPLAY_CALLOUT = false;
    this.DISPLAY_WIDGET_CHAT = true;
    this.HAS_FOCUSED_ONLINE_MSG = false;
    this.HAS_FOCUSED_OFFLINE_MSG = true;
    this.HAS_FOCUSED_OFFICE_CLOSED_MSG = false;
    this.widget_preview_selected = "0002"
    this.DISPLAY_WIDGET_PRECHAT_FORM = false;
  }

  onFocusFooterBranding() {
    this.DISPLAY_WIDGET_HOME = true;
    this.DISPLAY_CALLOUT = false;
    this.DISPLAY_WIDGET_CHAT = false;
    this.HAS_FOCUSED_ONLINE_MSG = false;
    this.HAS_FOCUSED_OFFLINE_MSG = true;
    this.HAS_FOCUSED_OFFICE_CLOSED_MSG = false;
    this.widget_preview_selected = "0000"
    this.DISPLAY_WIDGET_PRECHAT_FORM = false;
  }

  onFocusOfficeClosedGreetings() {
    this.DISPLAY_WIDGET_HOME = false;
    this.DISPLAY_CALLOUT = false;
    this.DISPLAY_WIDGET_CHAT = true

    this.HAS_FOCUSED_ONLINE_MSG = false;
    this.HAS_FOCUSED_OFFLINE_MSG = false;
    this.HAS_FOCUSED_OFFICE_CLOSED_MSG = true;
    this.widget_preview_selected = "0002"
    this.DISPLAY_WIDGET_PRECHAT_FORM = false;
  }



  verifyImageURL(url, callBack) {
    const img = new Image();
    img.src = url;
    try {
      img.onload = () => {
        callBack(true);
      };
    } catch (err) {
      this.logger.error('[WIDGET-SET-UP] - verifyImageURL', err);
    }
    try {
      img.onerror = () => {
        callBack(false);
      };
    } catch (err) {
      this.logger.log('[WIDGET-SET-UP] - verifyImageURL', err);
    }
  }


  logoChange(event) {
    this.logger.log('[WIDGET-SET-UP] - logoChange event.length', event.length);

    if (event.length === 0) {
      this.hasOwnLogo = false;

    } else {

      

      let checkMaliciousURL = isMaliciousURL(event)
      if(checkMaliciousURL){
        let logoUrlInput = (document.getElementById('change-logo') as HTMLInputElement)
        logoUrlInput.value  = this.widgetLogoURL
        this.IMAGE_EXIST = true;

        this.notify.showToast(this.translationMap.get('URLTypeNotAllowed'), 4, 'report_problem')
        this.logger.error('[WIDGET-SET-UP] logoChange: can not set current url--> MALICIOUS URL DETECTED', event, isMaliciousURL)
        return;
      }

      if (this.LOGO_IS_ON === true) {

        this.verifyImageURL(event, (imageExists) => {
          // return imageExists
          if (imageExists === true) {
            this.logger.log('[WIDGET-SET-UP] - checkImage Image Exists: ', imageExists);
            this.hasOwnLogo = true;
            this.IMAGE_EXIST = true;
          } else {
            this.logger.log('[WIDGET-SET-UP] - checkImage Image Exists: ', imageExists);
            this.hasOwnLogo = false;
            this.IMAGE_EXIST = false;
          }
        });
      }
    }
  }


  onFocuCustomLauncherURLInput() {
    this.DISPLAY_CALLOUT = true;
    this.DISPLAY_WIDGET_HOME = false;
    this.DISPLAY_WIDGET_CHAT = false;
    this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    this.widget_preview_selected = "0003";
    // this.logger.log('[WIDGET-SET-UP] - onFocuCustomLauncherURLInput');
  }

  launcherLogoChange(event) {
    // this.logger.log('[WIDGET-SET-UP] - launcherLogoChange event.length', event.length);
    let btnSaveFooterBrandAndLauncherBtn = <HTMLButtonElement>document.getElementById('btn-save-footer-brand--launcher-btn');
    btnSaveFooterBrandAndLauncherBtn.disabled = false

    if (event.length === 0) {

      this.customLauncherURL = null
      this.hasOwnLauncherBtn = false;
      this.hasOwnLauncherLogo = false;

      btnSaveFooterBrandAndLauncherBtn.disabled = false;

    } else {

      const checkMaliciousURL = isMaliciousURL(event)
      if(checkMaliciousURL){
        this.notify.showToast(this.translationMap.get('URLTypeNotAllowed'), 4, 'report_problem')
        this.logger.error('[WIDGET-SET-UP] logoChange: can not set current url--> MALICIOUS URL DETECTED', event, checkMaliciousURL)
        this.logoUrl = this.widgetLogoURL

        btnSaveFooterBrandAndLauncherBtn.disabled = true
        this.customLauncherURL = null
        this.hasOwnLauncherBtn = false;
        this.hasOwnLauncherLogo = false;

        return;
      }

      // this.fileUploadAccept = filterImageMimeTypesAndExtensions(this.appConfigService.getConfig().fileUploadAccept).join(',')
      // const canUploadFile = checkAcceptedFile('image/' + event.split('.').pop(), this.fileUploadAccept)
      // if(!canUploadFile){
      //   this.notify.showToast(this.translationMap.get('URLTypeNotAllowed'), 4, 'report_problem')
      //   this.logger.error('[IMAGE-UPLOAD] dropEvent: can not upload current file type--> NOT ALLOWED', event.split('.').pop(), this.fileUploadAccept)
        
      //   this.customLauncherURL = null
      //   this.hasOwnLauncherBtn = false;
      //   this.hasOwnLauncherLogo = false;
      //   return;
      // }
      

      this.verifyImageURL(event, (imageExists) => {
        // return imageExists
        if (imageExists === true) {
          // this.logger.log('[WIDGET-SET-UP] - launcherLogo checkImage Image Exists: ', imageExists);
          this.hasOwnLauncherBtn = true;
          this.hasOwnLauncherLogo = false;
          // this.logger.log('[WIDGET-SET-UP] - launcherLogo checkImage Image Exists this.customLauncherURL  ', this.customLauncherURL);
          // this.logger.log('[WIDGET-SET-UP] - launcherLogo checkImage Image Exists this.hasOwnLauncherBtn  ', this.hasOwnLauncherBtn);
          this.CUSTOM_LAUNCHER_LOGO_EXIST = true;
          // this.logger.log('[WIDGET-SET-UP] - launcherLogo checkImage Image Exists - hasOwnLauncherBtn: ', this.hasOwnLauncherBtn);
          // this.logger.log('[WIDGET-SET-UP] - launcherLogo checkImage Image Exists - launcherLogo: ', this.customLauncherURL);


        } else {
          // this.logger.log('[WIDGET-SET-UP] - launcherLogo checkImage Image Exists: ', imageExists);
          this.hasOwnLauncherBtn = false;
          this.hasOwnLauncherLogo = false;

          this.CUSTOM_LAUNCHER_LOGO_EXIST = false;
        }
      });

    }
  }


  // SWITCH BTN ON / OFF
  onLogoOnOff($event) {
    this.DISPLAY_WIDGET_HOME = true;
    this.DISPLAY_LAUNCER_BUTTON = false;
    this.DISPLAY_WIDGET_CHAT = false;
    this.DISPLAY_CALLOUT = false;
    this.C21_BODY_HOME = true;
    this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    this.widget_preview_selected = "0000"



    this.logger.log('[WIDGET-SET-UP] - LOGO ON/OFF ', $event.target.checked)
    this.LOGO_IS_ON = false

    if ($event.target.checked === false) {
      this.logoUrl = 'No Logo'

      // CASE SWITCH BTN = OFF
      // *** ADD PROPERTY
      this.widgetObj['logoChat'] = 'nologo';

      // UPDATE WIDGET PROJECT
      // this.widgetService.updateWidgetProject(this.widgetObj);

    } else if ($event.target.checked === true) {

      this.logoUrl = this.widgetLogoURL; //'https://tiledesk.com/tiledesk-logo-white.png'
      this.LOGO_IS_ON = true;
      this.logger.log('[WIDGET-SET-UP] LOGO_IS_ON ', this.LOGO_IS_ON)
      this.hasOwnLogo = false;

      // CASE SWITCH BTN = ON
      // *** REMOVE PROPERTY
      delete this.widgetObj['logoChat'];
      this.logger.log('[WIDGET-SET-UP] - widgetObj', this.widgetObj);
    }
  }

  onFocusLogoInput() {
    this.DISPLAY_WIDGET_HOME = true;
    this.DISPLAY_LAUNCER_BUTTON = false;
    this.DISPLAY_WIDGET_CHAT = false;
    this.DISPLAY_CALLOUT = false;
    this.C21_BODY_HOME = true;
    this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    this.widget_preview_selected = "0000"
  }


  /**
   * *** ---------------------------- ***
   * ***    SAVE WIDGET APPEARANCE    ***
   * *** ---------------------------- ***
   */
  saveWidgetAppearance() {
    const appearance_save_btn_mobile = <HTMLElement>document.querySelector('.appearance_save_btn_mobile');
    const appearance_save_btn_desktop = <HTMLElement>document.querySelector('.appearance-save-btn-desktop');
    const appearance_save_btn_bottom = <HTMLElement>document.querySelector('.appearance_save_btn_bottom');

    if (appearance_save_btn_mobile) {
      appearance_save_btn_mobile.blur()
    }
    if (appearance_save_btn_desktop) {
      appearance_save_btn_desktop.blur()
    }
    if (appearance_save_btn_bottom) {
      appearance_save_btn_bottom.blur()
    }
    // this.logger.log('saveWidgetAppearance customLauncherURL ', this.customLauncherURL)
    // Custom launcher btn
    // if (this.hasOwnLauncherBtn === true) {
    //   // this.logger.log('saveWidgetAppearance customLauncherURL hasOwnLauncherBtn ',this.hasOwnLauncherBtn)
    //   this.widgetObj['baloonImage'] = this.customLauncherURL
    // } else if (this.hasOwnLauncherBtn === false) {
    //   // this.logger.log('saveWidgetAppearance customLauncherURL hasOwnLauncherBtn ',this.hasOwnLauncherBtn)

    //   delete this.widgetObj['baloonImage']
    // }

    /// LOGO
    if (this.logoUrl && this.LOGO_IS_ON === true) {
      // if (this.logoUrl !== 'https://tiledesk.com/tiledesk-logo-white.png') { 
      if (this.logoUrl !== this.widgetLogoURL) {
        this.hasOwnLogo = true;
        this.logger.log('[WIDGET-SET-UP] - HAS OWN LOGO ', this.hasOwnLogo, 'LOGO IS ON ', this.LOGO_IS_ON, ' logoUrl: ', this.logoUrl);
      } else {
        this.hasOwnLogo = false;
      }
      // *** ADD PROPERTY
      this.widgetObj['logoChat'] = this.logoUrl

    } else if (this.logoUrl && this.LOGO_IS_ON === false) {
      // if is defined logoUrl and LOGO_IS_ON === false set the property logoChat = to No Logo
      // use case: the logo btn on/off is setted as off and the user enter an logo url
      this.logoUrl = 'No Logo'
      this.logger.log('[WIDGET-SET-UP] - HAS OWN LOGO ', this.hasOwnLogo, 'LOGO IS ON ', this.LOGO_IS_ON, ' logoUrl: ', this.logoUrl);
      // *** ADD PROPERTY
      this.widgetObj['logoChat'] = 'nologo';

    } else {
      // if is not defined logoUrl remove the property logoChat
      // *** REMOVE PROPERTY
      delete this.widgetObj['logoChat'];
      this.logoUrl = this.widgetLogoURL; // 'https://tiledesk.com/tiledesk-logo-white.png'
      this.hasOwnLogo = false;
      this.logger.log('[WIDGET-SET-UP] - HAS OWN LOGO ', this.hasOwnLogo, 'LOGO IS ON ', this.LOGO_IS_ON, ' logoUrl: ', this.logoUrl);
    }

    this.widgetService.updateWidgetProject(this.widgetObj)
  }

  // --------------------------------------------------------------------------------------
  //  @ Single Conversation 
  // --------------------------------------------------------------------------------------
  enableSingleConversation(event) {
    // this.logger.log('Enable / Disable SINGLE CONVERSATION - event', event.target.checked)
    this.singleConversation = event.target.checked
    if (this.singleConversation === true) {

      this.widgetObj['singleConversation'] = this.singleConversation;

      this.widgetService.updateWidgetProject(this.widgetObj)
    } else if (this.singleConversation === false) {

      delete this.widgetObj['singleConversation'];
      this.widgetService.updateWidgetProject(this.widgetObj)

    }
  }

  // --------------------------------------------------------------------------------------
  //  @ Widget visibility
  // --------------------------------------------------------------------------------------
  changeDesktopWidgetVisibility(event) {
    // this.logger.log('[WIDGET-SET-UP] Widget visible / hidden on desktop - event', event.target.checked)
    this.desktop_widget_is_visible = event.target.checked;

    if (this.desktop_widget_is_visible === false) {

      this.widgetObj['displayOnDesktop'] = this.desktop_widget_is_visible;
      delete this.widgetObj['onPageChangeVisibilityDesktop'];
      this.widgetService.updateWidgetProject(this.widgetObj)

    } else if (this.desktop_widget_is_visible === true) {
      this.widgetObj['onPageChangeVisibilityDesktop'] = this.desktopWidgetStatus;
      delete this.widgetObj['displayOnDesktop'];
      this.widgetService.updateWidgetProject(this.widgetObj)

    }
  }

  changeMobileWidgetVisibility(event) {
    // this.logger.log('[WIDGET-SET-UP] Widget visible / hidden on mobile - event', event.target.checked)
    this.mobile_widget_is_visible = event.target.checked

    if (this.mobile_widget_is_visible === false) {
      this.widgetObj['displayOnMobile'] = this.mobile_widget_is_visible;
      delete this.widgetObj['onPageChangeVisibilityMobile']
      this.widgetService.updateWidgetProject(this.widgetObj)
    } else if (this.mobile_widget_is_visible === true) {
      this.widgetObj['onPageChangeVisibilityMobile'] = this.mobileWidgetStatus;
      delete this.widgetObj['displayOnMobile'];
      this.widgetService.updateWidgetProject(this.widgetObj)
    }
  }

  onSelectDesktopWidgetStatus() {
    // this.logger.log('[WIDGET-SET-UP] ON SELECT DESKTOP WIDGET STATUS ', this.desktopWidgetStatus)
    this.widgetObj['onPageChangeVisibilityDesktop'] = this.desktopWidgetStatus;
    this.widgetService.updateWidgetProject(this.widgetObj)
  }

  onSelectMobilepWidgetStatus() {
    // this.logger.log('[WIDGET-SET-UP] ON SELECT MOBILE WIDGET STATUS ', this.mobileWidgetStatus)
    this.widgetObj['onPageChangeVisibilityMobile'] = this.mobileWidgetStatus;
    this.widgetService.updateWidgetProject(this.widgetObj)
  }


  // ---------------------------------------------------------------------
  //  @ CALLOUT TIMER (calloutTimer) 
  // ---------------------------------------------------------------------
  toggleCallout($event) {
    this.DISPLAY_WIDGET_HOME = false;
    this.DISPLAY_CALLOUT = true;
    this.DISPLAY_WIDGET_CHAT = false;
    this.logger.log('toggleCallout', this.widget_preview_selected)
    this.widget_preview_selected = '0003'
    this.DISPLAY_WIDGET_PRECHAT_FORM = false;



    if ($event.target.checked) {
      // this.calloutTimerSecondSelected = 5;
      this.CALLOUT_IS_DISABLED = false;
      this.widgetObj['calloutTimer'] = this.calloutTimerSecondSelected;

      this.logger.log('[WIDGET-SET-UP] CALLOUT TIMER - toggleCallout calloutTimerSecondSelected', this.calloutTimerSecondSelected);
    } else {

      // this.calloutTimerSecondSelected = -1;
      this.CALLOUT_IS_DISABLED = true;
      delete this.widgetObj['calloutTimer'];
      this.logger.log('[WIDGET-SET-UP] CALLOUT TIMER - toggleCallout calloutTimerSecondSelected', this.calloutTimerSecondSelected);
    }
  }

  onFocusCalloutTitle() {
    this.DISPLAY_WIDGET_HOME = false;
    this.DISPLAY_CALLOUT = true;
    this.DISPLAY_WIDGET_CHAT = false;
    this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    this.widget_preview_selected = '0003'
  }

  onFocusCalloutMsg() {
    this.DISPLAY_WIDGET_HOME = false;
    this.DISPLAY_CALLOUT = true;
    this.DISPLAY_WIDGET_CHAT = false;
    this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    this.widget_preview_selected = '0003'
  }


  setSelectedCalloutTimer() {
    this.DISPLAY_WIDGET_HOME = false;
    this.DISPLAY_CALLOUT = true;
    this.DISPLAY_WIDGET_CHAT = false;
    this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    this.widget_preview_selected = '0003'
    // if (this.calloutTimerSecondSelected !== -1) {
    // if (this.CALLOUT_IS_DISABLED = false) {
    this.logger.log('[WIDGET-SET-UP] CALLOUT TIMER - TIMER SELECTED', this.calloutTimerSecondSelected);
    // this.CALLOUT_IS_DISABLED = false;
    // *** ADD PROPERTY
    this.widgetObj['calloutTimer'] = this.calloutTimerSecondSelected;
    // UPDATE WIDGET PROJECT

    /**
     * *** WidgetProject IS UPDATED WHEN THE USER CLICK ON SAVE ***  */
    // this.widgetService.updateWidgetProject(this.widgetObj)

    // COMMENT AS FOR CALLOUT TITLE
    // this.widgetService.publishCalloutTimerSelected(this.calloutTimerSecondSelected)

    // } else if (this.calloutTimerSecondSelected === -1) {
  }

  // else if (this.CALLOUT_IS_DISABLED = true) {
  //   this.logger.log('»» WIDGET DESIGN CALLOUT TIMER - TIMER SELECTED', this.calloutTimerSecondSelected);
  //   // this.CALLOUT_IS_DISABLED = true;
  //   // *** REMOVE PROPERTIES

  //   delete this.widgetObj['calloutTimer'];
  // }
  // }


  saveCalloutSettings() {
    this.HAS_CHANGED_GREETINGS = false;
    const callout_settings_save_btn = <HTMLElement>document.querySelector('.callout-settings-save-btn');

    if (callout_settings_save_btn) {
      callout_settings_save_btn.blur()
    }
    this.widgetService.updateWidgetProject(this.widgetObj)
  }
  // -----------------------------------------------------------------------
  //  @ Pre-chat form  
  // -----------------------------------------------------------------------
  hasOpenedPrechaFormSection() {
    // this.logger.log('hasOpenedPrechaFormSection')
    this.DISPLAY_CALLOUT = false;
    this.DISPLAY_WIDGET_HOME = false;
    this.DISPLAY_WIDGET_CHAT = false;
    this.DISPLAY_WIDGET_PRECHAT_FORM = true;
    this.widget_preview_selected = '0005'
  }

  togglePrechatformCheckBox(event) {
    this.DISPLAY_CALLOUT = false;
    this.DISPLAY_WIDGET_HOME = false;
    this.DISPLAY_WIDGET_CHAT = false;
    this.DISPLAY_WIDGET_PRECHAT_FORM = true;
    this.widget_preview_selected = '0005'
    if (event.target.checked) {
      this.preChatForm = true;
      // *** ADD PROPERTY
      this.widgetObj['preChatForm'] = this.preChatForm;
      this.widgetService.updateWidgetProject(this.widgetObj)
      this.logger.log('[WIDGET-SET-UP] - INCLUDE PRE CHAT FORM ', event.target.checked)
    } else {
      this.preChatForm = false;
      if (this.preChatFormCustomFieldsEnabled === true) {
        this.preChatFormCustomFieldsEnabled = false;
      }

      if (this.widgetObj.hasOwnProperty('preChatFormCustomFieldsEnabled')) {
        delete this.widgetObj['preChatFormCustomFieldsEnabled'];
      }

      // *** REMOVE PROPERTY
      delete this.widgetObj['preChatForm'];
      this.widgetService.updateWidgetProject(this.widgetObj)

      this.logger.log('[WIDGET-SET-UP] - INCLUDE PRE CHAT FORM ', event.target.checked)
    }
  }

  customizePrechatformFieldsCheckBox(event) {
    if (event.target.checked) {
      this.DISPLAY_CALLOUT = false;
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_WIDGET_CHAT = false;
      this.DISPLAY_WIDGET_PRECHAT_FORM = true;
      this.widget_preview_selected = '0005'

      this.preChatFormCustomFieldsEnabled = true;
      this.HAS_ACTIVATED_PRECHAT_CUSTOM_FIELDS = true
      // *** ADD PROPERTY
      this.widgetObj['preChatFormCustomFieldsEnabled'] = this.preChatFormCustomFieldsEnabled;
      if (this.prechatFormTexareaJson) {
        const parsedPrechatFormTexareaJson = JSON.parse(this.prechatFormTexareaJson)
        this.widgetObj['preChatFormJson'] = parsedPrechatFormTexareaJson;
        this.prechatFormArray = parsedPrechatFormTexareaJson;
        this.widgetService.updateWidgetProject(this.widgetObj)
      }
      this.logger.log('[WIDGET-SET-UP] - ENABLE CUSTOMIZE PRE CHAT FORM ', event.target.checked)
    } else {
      this.preChatFormCustomFieldsEnabled = false;
      this.HAS_ACTIVATED_PRECHAT_CUSTOM_FIELDS = false
      // *** REMOVE PROPERTY
      delete this.widgetObj['preChatFormCustomFieldsEnabled'];
      this.widgetService.updateWidgetProject(this.widgetObj)

      this.logger.log('[WIDGET-SET-UP] - ENABLE CUSTOMIZE PRE CHAT FORM ', event.target.checked)
    }
  }

  onChangeLabelCompleteForm($event) {
    // this.logger.log('[WIDGET-SET-UP] - onChangeLabelCompleteForm ', $event),
    this.LABEL_COMPLETE_FORM = $event;
  }

  onChangeDafultPrechatFormName($event) {
    // this.logger.log('[WIDGET-SET-UP] - onChangeDafultPrechatFormName ', $event);
    this.LABEL_FIELD_NAME = $event
  }

  onChangeDafultPrechatFormEmail($event) {
    // this.logger.log('[WIDGET-SET-UP] - onChangeDafultPrechatFormEmail ', $event);
    this.LABEL_FIELD_EMAIL = $event
  }

  onChangeUserFullNameLabel($event) {
    // this.logger.log('[WIDGET-SET-UP] - onChangeUserFullNameLabel ', $event),
    this.LABEL_PRECHAT_USER_FULLNAME = $event;
  }
  onChangeEmailLabel($event) {
    // this.logger.log('[WIDGET-SET-UP] - onChangeEmailLabel ', $event);
    this.LABEL_PRECHAT_USER_EMAIL = $event;
  }
  onChangePhoneLabel($event) {
    // this.logger.log('[WIDGET-SET-UP] - onChangePhoneLabel ', $event)
    this.LABEL_PRECHAT_USER_PHONE = $event;
  }
  onChangeAcceptTermsPrivacyLabel($event) {
    // this.logger.log('[WIDGET-SET-UP] - onChangeAcceptTermsPrivacyLabel ', $event)
    this.LABEL_PRECHAT_ACCEPT_TERMS_PRIVACY = $event;
  }
  onChangeTermsPrivacyLabel($event) {
    // this.logger.log('[WIDGET-SET-UP] - onChangeTermsPrivacyLabel ', $event)
    this.LABEL_PRECHAT_STATIC_TERMS_PRIVACY = $event;
  }
  onChangeFirstMessagel($event) {
    // this.logger.log('[WIDGET-SET-UP] - onChangeFirstMessagel ', $event)
    this.LABEL_PRECHAT_FIRST_MESSAGE = $event;
  }

  onChangeFirstMessageRow($event, field) {
    this.PRECHAT_FIRST_MESSAGE_ROWS = $event;
    // this.logger.log('[WIDGET-SET-UP] - onChangeFirstMessageRow ', this.PRECHAT_FIRST_MESSAGE_ROWS);
    const prechatFormTexareaObjct = JSON.parse(this.prechatFormTexareaJson);
    // this.logger.log('[WIDGET-SET-UP] - prechatFormArray ', this.prechatFormArray);

    for (var i = 0; i < this.prechatFormArray.length; i++) {

      if (this.prechatFormArray[i].name === field.name) {

        this.prechatFormArray[i].rows = this.PRECHAT_FIRST_MESSAGE_ROWS;

      }
    }

    for (var i = 0; i < prechatFormTexareaObjct.length; i++) {

      if (prechatFormTexareaObjct[i].name === field.name) {

        prechatFormTexareaObjct[i].rows = this.PRECHAT_FIRST_MESSAGE_ROWS;
        this.prechatFormTexareaJson = JSON.stringify(prechatFormTexareaObjct, null, 4);
        // this.logger.log('[WIDGET-SET-UP] - onChangeFirstMessageRow ', this.prechatFormTexareaJson);
      }
    }

  }

  focusOnSelectaddPrechatFormField() {
    this.DISPLAY_CALLOUT = false;
    this.DISPLAY_WIDGET_HOME = false;
    this.DISPLAY_WIDGET_CHAT = false;
    this.DISPLAY_WIDGET_PRECHAT_FORM = true;
    this.widget_preview_selected = '0005';
  }

  addPrechatFormField($event) {
    this.HAS_ACTIVATED_PRECHAT_CUSTOM_FIELDS = true;
    this.preChatFormFieldName = $event.name;
    // this.logger.log('[WIDGET-SET-UP] - addPrechatFormField $preChatFormFieldName', this.preChatFormFieldName);
    // this.logger.log('[WIDGET-SET-UP] - addPrechatFormField $event', $event);
    if (this.preChatFormFieldName === 'firstMessage') {
      this.PRECHAT_FIRST_MESSAGE_ROWS = $event.rows;
    }

    this.prechatFormArray.push($event)
    // this.logger.log('[WIDGET-SET-UP] - addPrechatFormField  prechatFormArray', this.prechatFormArray)
    this.prechatFormTexareaJson = JSON.stringify(this.prechatFormArray, null, 4);

    // this.ngSelectComponent.clearModel();
    setTimeout(() => {
      this.preChatFormFieldName = null;
    }, 0)
    this.preChatFormFielsBtnsArray = JSON.parse(this.prechatFormTexareaJson)
    // this.logger.log('[WIDGET-SET-UP] - addPrechatFormField  preChatFormFielsBtnsArray', this.preChatFormFielsBtnsArray)
    this.removepreChatFormFieldsIfAlreadyUsed(this.preChatFormFields, JSON.parse(this.prechatFormTexareaJson))
  }

  // ---------------------------------------------
  // Create pre-chat form custom field
  // ---------------------------------------------
  presentModalCreateCustomField() {
    // this.preChatFieldModel.name = ""
    // this.preChatFieldModel.label = ""
    // this.preChatFieldModel.type = ""
    // this.logger.log('presentModalCreateCustomField preChatFieldModel' , this.preChatFieldModel) 
    this.customFieldType = undefined
    this.customFieldLabel = undefined
    this.customFieldName = undefined
    this.ngselect.close()
    this.displayModalCreateCustomField = 'block'
  }
  closeModalCreateCustomField() {
    this.displayModalCreateCustomField = 'none'
  }
  createCustomField() {
    this.displayModalCreateCustomField = 'none'


    // this.prechatFormArray.push(this.preChatFieldModel)
    // this.logger.log('createCustomField field' , field) 
    const obj = {}

    // if(this.customFieldTypeName === 'Input') {
    //   this.preChatFieldModel.type = 'text'
    // }
    obj['type'] = this.customFieldType
    obj['name'] = this.customFieldName
    obj['label'] = this.customFieldLabel
    // this.logger.log('createCustomField obj' ,obj)

    // this.logger.log('createCustomField preChatFieldModel' , this.preChatFieldModel)

    this.prechatFormArray.push(obj)
    this.prechatFormTexareaJson = JSON.stringify(this.prechatFormArray, null, 4);
  }

  onChangeCustomFieldType($event) {
    // this.logger.log('[WIDGET-SET-UP] - onChangeCustomFieldType  TypeSelected', $event)
    this.customFieldType = $event.id
    // if(this.customFieldTypeName === 'Input') {
    //   // this.preChatFieldModel.type = 'text'
    // }
    // this.customFieldType
    // customFieldType
    // customFieldTypeName
  }
  onChangeCustomFieldTextAreaRow($event) {
    // this.logger.log('[WIDGET-SET-UP] - ON CHANGE TEXAREA ROW - NUM OF ROW', $event)
    // this.logger.log('[WIDGET-SET-UP] - ON CHANGE TEXAREA ROW - NUM OF ROW', this.customFieldTextAreaRow)

  }

  onChangeCustomFieldName($event) {
    // this.logger.log('[WIDGET-SET-UP] - ON CHANGE CUSTOM FIELD NAME - EVENT', $event)
    // this.logger.log('[WIDGET-SET-UP] - ON CHANGE CUSTOM FIELD NAME - customFieldLabel', this.customFieldLabel)

    const fieldNameUndescore = $event.replace(/ /g, "_")
    // this.logger.log('[WIDGET-SET-UP] - ON CHANGE CUSTOM FIELD NAME - FIELD NAME FROM EVENT ', fieldNameUndescore)

    // https://www.codegrepper.com/code-examples/javascript/how+to+generate+random+id+in+javascript
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters after the decimal.
    const customFieldId = '_' + Math.random().toString(36).slice(2)
    //  this.logger.log('[WIDGET-SET-UP] - ON CHANGE CUSTOM FIELD NAME - CUSTOM FIELD ID ', customFieldId)

    this.customFieldName = fieldNameUndescore + customFieldId
  }

  onChangeCustomFieldIsRequired($event) {
    // this.logger.log('[WIDGET-SET-UP] - ON CHANGE CUSTOM FIELD IS REQUIRED - IS CHECKED', $event.target.checked)

  }

  onChangeRegexFieldValidation($event) {
    // this.logger.log('[WIDGET-SET-UP] - ON CHANGE REGEX FIELD VALIDATION - REGEX EXPRESSION', this.customFieldRegexExpression)

  }
  onChangeErrorLabel($event) {
    // this.logger.log('[WIDGET-SET-UP] - ON CHANGE ERROR LABEL - LABEL', this.customFieldErrorLabel)
  }


  // -----------------------------------------------------------------------------------
  // Splice item from the select if is from already present in the prechatFormTexareaJson
  // ------------------------------------------------------------------------------------
  removepreChatFormFieldsIfAlreadyUsed(preChatFormFields: any, prechatFormTexareaJson: any) {
    // this.logger.log('[WIDGET-SET-UP]  preChatFormFields - ', this.preChatFormFields);
    // remove from the custom field select list the field that are already in the preChatFormFields
    for (var i = preChatFormFields.length - 1; i >= 0; i--) {
      for (var j = 0; j < prechatFormTexareaJson.length; j++) {
        if (preChatFormFields[i] && (preChatFormFields[i].name === prechatFormTexareaJson[j].name)) {

          preChatFormFields.splice(i, 1);
        }
      }
    }
    this.preChatFormFields = this.preChatFormFields.slice(0)
    // this.logger.log('[WIDGET-SET-UP] -  preChatFormFields - AFTER SPLICE ', this.preChatFormFields);
  }

  removePrechatFormField(prechatformfield) {
    // this.logger.log('[WIDGET-SET-UP] - REMOVE PRECHAT FORM FIELD ', prechatformfield)

    const prechatFormTexareaObjct = JSON.parse(this.prechatFormTexareaJson)
    // this.logger.log('[WIDGET-SET-UP] - REMOVE PRECHAT FORM TEXTAREA OBJCT ', prechatFormTexareaObjct)
    for (var i = 0; i < prechatFormTexareaObjct.length; i++) {

      if (prechatFormTexareaObjct[i].name === prechatformfield.name) {

        prechatFormTexareaObjct.splice(i, 1);
        this.preChatFormFields.push(prechatformfield)
        this.preChatFormFields = this.preChatFormFields.slice(0)
      }
    }
    // this.logger.log('[WIDGET-SET-UP] - REMOVE PRECHAT FORM TEXTAREA OBJCT ', prechatFormTexareaObjct)
    // this.logger.log('[WIDGET-SET-UP] - REMOVE PRECHAT FORM FIELD (those displayed in the select) ', this.preChatFormFields)
    this.prechatFormArray = prechatFormTexareaObjct
    this.prechatFormTexareaJson = JSON.stringify(prechatFormTexareaObjct, null, 4);
  }

  onChangeFieldIsRequired($event, field) {
    // this.logger.log('[WIDGET-SET-UP] - ON CHANGE FIELD IS REQUIRED - IS CHECKED', $event.target.checked)
    // this.logger.log('[WIDGET-SET-UP] - ON CHANGE FIELD IS REQUIRED - field', field)
    const prechatFormTexareaObjct = JSON.parse(this.prechatFormTexareaJson)
    if ($event.target.checked === false) {
      for (var i = 0; i < prechatFormTexareaObjct.length; i++) {

        if (prechatFormTexareaObjct[i].name === field.name) {

          prechatFormTexareaObjct[i].mandatory = false
          this.prechatFormTexareaJson = JSON.stringify(prechatFormTexareaObjct, null, 4);
        }
      }
    }

    if ($event.target.checked === true) {
      for (var i = 0; i < prechatFormTexareaObjct.length; i++) {

        if (prechatFormTexareaObjct[i].name === field.name) {

          prechatFormTexareaObjct[i].mandatory = true;
          this.prechatFormTexareaJson = JSON.stringify(prechatFormTexareaObjct, null, 4);
        }
      }
    }
  }

  moveUp(field) {
    // this.logger.log('[WIDGET-SET-UP] - MOVE UP - field', field)
    // this.logger.log('[WIDGET-SET-UP] - MOVE UP - this.prechatFormArray', this.prechatFormArray)

    let index = this.prechatFormArray.findIndex(e => e.name == field.name);
    // this.logger.log('[WIDGET-SET-UP] - MOVE UP - field index', index)
    if (index > 0) {
      let el = this.prechatFormArray[index];
      // this.logger.log('[WIDGET-SET-UP] - MOVE UP - field index', el)
      this.prechatFormArray[index] = this.prechatFormArray[index - 1];
      this.prechatFormArray[index - 1] = el;
      // this.prechatFormArray = this.prechatFormTexareaJson
      this.prechatFormTexareaJson = JSON.stringify(this.prechatFormArray, null, 4);
    }
    // this.logger.log('[WIDGET-SET-UP] - MOVE UP - this.prechatFormArray', this.prechatFormArray)

  }

  moveDown(field) {
    // this.logger.log('[WIDGET-SET-UP] - MOVE DOWN - field', field)

    let index = this.prechatFormArray.findIndex(e => e.name == field.name);
    // this.logger.log('[WIDGET-SET-UP] - MOVE DOWN - field index', index)
    if (index !== -1 && index < this.prechatFormArray.length - 1) {
      let el = this.prechatFormArray[index];
      this.prechatFormArray[index] = this.prechatFormArray[index + 1];
      this.prechatFormArray[index + 1] = el;
    }
  }
  hasClickedUpdatePrechatformCustomFields() {
    this.notify.showWidgetStyleUpdateNotification(this.translationMap.get('UpdateDeptGreetingsSuccessNoticationMsg'), 2, 'done');
  }

  savePrechatFormCustomFields() {
    const prechatform_savejson_btn = <HTMLElement>document.querySelector('.prechatform-savejson-btn');
    this.logger.log('[WIDGET-SET-UP] - prechatform_savejson_btn: ', prechatform_savejson_btn);
    if (prechatform_savejson_btn) {
      prechatform_savejson_btn.blur()
    }

    // this.logger.log('[WIDGET-SET-UP] - SAVE PRE-CHAT-FORM-JSON this.prechatFormArray', this.prechatFormArray)

    if (this.prechatFormArray.length > 0) {
      // this.logger.log('[WIDGET-SET-UP] - SAVE PRE-CHAT-FORM-JSON prechatFormTexareaJson', this.prechatFormTexareaJson)
      // this.logger.log('[WIDGET-SET-UP] - SAVE PRE-CHAT-FORM-JSON this.isJsonString(this.prechatFormTexareaJson)', this.isJsonString(this.prechatFormTexareaJson))
      if (this.prechatFormTexareaJson !== '' && this.isJsonString(this.prechatFormTexareaJson) === true) {
        const parsedPrechatFormTexareaJson = JSON.parse(this.prechatFormTexareaJson)

        this.logger.log('[WIDGET-SET-UP] - SAVE PRE-CHAT-FORM-JSON PARSED', parsedPrechatFormTexareaJson)

        this.widgetObj['preChatFormJson'] = parsedPrechatFormTexareaJson;
        if (this.hasBuiltPrechatformWithVisualTool === true) {
          this.widgetObj['visualTool'] = true;
        } else if (this.hasBuiltPrechatformWithVisualTool === false) {
          this.widgetObj['visualTool'] = false;
        }
        this.widgetService.updateWidgetProject(this.widgetObj)
      } else {
        this.notify.showWidgetStyleUpdateNotification(this.translationMap.get('InvalidJSON'), 4, 'report_problem');
      }
    } else {
      this.displayModalNoFieldInCustomPrechatForm();

    }
  }

  isJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  displayModalNoFieldInCustomPrechatForm() {

    swal({
      title: this.warning_translated,
      text: this.custom_prechat_form_is_empty_and_will_be_disabled_msg,
      icon: "warning",
      buttons: 'Ok',
      dangerMode: false,
    })
      .then((value) => {
        // this.logger.log('[WIDGET-SET-UP] - displayModalNoFieldInCustomPrechatForm value', value)

        if (value === true) {
          // this.logger.log('[WIDGET-SET-UP] - SAVE PRE-CHAT-FORM-JSON The custom prechat form contains no fields')
          // this.logger.log('[WIDGET-SET-UP] - SAVE PRE-CHAT-FORM-JSON preChatFormCustomFieldsEnabled ', this.preChatFormCustomFieldsEnabled)

          if (this.widgetObj.hasOwnProperty('preChatFormJson')) {
            // this.logger.log('[WIDGET-SET-UP] - SAVE PRE-CHAT-FORM-JSON widgetObj HAS TEH KEY preChatFormJson')
            delete this.widgetObj['preChatFormJson']
          }
          if (this.widgetObj.hasOwnProperty('preChatFormCustomFieldsEnabled')) {
            this.preChatFormCustomFieldsEnabled = false;
            delete this.widgetObj['preChatFormCustomFieldsEnabled'];
            // this.logger.log('[WIDGET-SET-UP] - SAVE PRE-CHAT-FORM-JSON this.preChatFormCustomFieldsEnabled ', this.preChatFormCustomFieldsEnabled)

          }
          this.widgetService.updateWidgetProject(this.widgetObj)
        }
      })
  }

  // -----------------------------------------------------------------------
  //  @ Auto Rating
  // -----------------------------------------------------------------------
  toggleAutoRating(event) {
    if (event.target.checked) {
      this.nativeRating = true;
      // *** ADD PROPERTY
      this.widgetObj['nativeRating'] = this.nativeRating;
      this.widgetService.updateWidgetProject(this.widgetObj)
      this.logger.log('[WIDGET-SET-UP] - IS ENABLE Auto Rating ', event.target.checked)
    } else {
      this.nativeRating = false;

      // *** REMOVE PROPERTY
      delete this.widgetObj['nativeRating'];
      this.widgetService.updateWidgetProject(this.widgetObj)

      this.logger.log('[WIDGET-SET-UP] - IS ENABLED Auto Rating', event.target.checked)
    }
  }


  // onPastePrechatFormJSON(event: ClipboardEvent) {
  //   // event.preventDefault();

  //   let clipboardData = event.clipboardData;
  //   this.logger.log('[WIDGET-SET-UP] - ON PASTE PRE-CHAT-FORM clipboardData', clipboardData);
  //   let pastedText = clipboardData.getData('text')
  //   this.prechatFormTexareaJson = pastedText
  //   // this.logger.log('[WIDGET-SET-UP] - ON PASTE PRE-CHAT-FORM JSON', pastedText);
  //   // // // replace(/\s+/g , '')
  //   // // // .replace(/\"/g, '"').replace(/\s+/g , '');
  //   // // const pastedTextNoWhiteSpace = pastedText.split('\\');
  //   // // // const pastedTextNoBackSlash = pastedTextNoWhiteSpace.replace(/\\"/g, '"');
  //   // this.prechatFormTexareaJson = pastedText.replace(/\\\//g, "/");
  //   // this.logger.log('[WIDGET-SET-UP] - ON PASTE PRE-CHAT-FORM JSON prechatFormTexareaJson', this.prechatFormTexareaJson);
  // }





  // NOT USED
  onChangePrechatFormTexareaJson(event: any) {
    this.logger.log('[WIDGET-SET-UP] - CHANGE PRE-CHAT-FORM-JSON event', event)
    // this.logger.log('[WIDGET-SET-UP] - CHANGE PRE-CHAT-FORM-JSON prechatFormTexareaJson', this.prechatFormTexareaJson)
    // var x = document.getElementById("prechat-form-texarea").value;
    //  = <HTMLElement>document.querySelector("prechat-form-texarea").value;
    //  var x = (<HTMLInputElement>document.getElementById("prechat-form-texarea")).value;
    //  this.logger.log('[WIDGET-SET-UP] - CHANGE PRE-CHAT-FORM-JSON x', x)
    // this.prechatFormTexareaJson = event

    var myJSONString = JSON.stringify(event);
    var myEscapedJSONString = myJSONString.replace(/\\n/g, "\\n")
      .replace(/\\'/g, "\\'")
      .replace(/\\"/g, '\\"')
      .replace(/\\&/g, "\\&")
      .replace(/\\r/g, "\\r")
      .replace(/\\t/g, "\\t")
      .replace(/\\b/g, "\\b")
      .replace(/\\f/g, "\\f");
  }


  // -----------------------------------------------------------------------
  //  @ WIDGET ALIGNMENT (alias for align)   
  // -----------------------------------------------------------------------
  aligmentLeftSelected(left_selected: boolean) {

    this.DISPLAY_WIDGET_HOME = false;
    this.DISPLAY_CALLOUT = true;
    this.DISPLAY_WIDGET_CHAT = false;
    this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    this.widget_preview_selected = "0003"

    this.logger.log('[WIDGET-SET-UP] - LEFT ALIGNMENT SELECTED ', left_selected);
    this.hasSelectedLeftAlignment = true;
    this.hasSelectedRightAlignment = false;

    // *** ADD PROPERTY
    this.widgetObj['align'] = 'left'

  }

  aligmentRightSelected(right_selected: boolean) {
    this.DISPLAY_CALLOUT = true;
    this.DISPLAY_WIDGET_HOME = false;
    this.DISPLAY_WIDGET_CHAT = false;
    this.DISPLAY_WIDGET_PRECHAT_FORM = false;
    this.widget_preview_selected = "0003"

    this.logger.log('[WIDGET-SET-UP] - RIGHT ALIGNMENT SELECTED ', right_selected);
    this.hasSelectedLeftAlignment = false;
    this.hasSelectedRightAlignment = true;

    // *** REMOVE PROPERTY
    delete this.widgetObj['align'];

  }


  goBack() {
    this.location.back();
  }

  goToWidgetMultilanguage() {
    this.router.navigate(['project/' + this.id_project + '/widget/translations/w']);
  }

  goToInstallWithTagManagerDocs() {
    const url = URL_google_tag_manager_add_tiledesk_to_your_sites;
    window.open(url, '_blank');
  }
  goToWidgetWebSdk() {
    const url = 'https://developer.tiledesk.com/widget/web-sdk';
    window.open(url, '_blank');
  }

  goToPrechatFormExample() {
    const url = 'https://developer.tiledesk.com/widget/advanced/prechat-form-json#examples';
    window.open(url, '_blank');
  }

  testWidgetPage() {
    // this.elementRef.nativeElement.blur();

    // const url = 'http://testwidget.tiledesk.com/testsitenw3?projectname=' + this.projectName + '&projectid=' + this.id_project
    // const url = this.TESTSITE_BASE_URL + '?projectname=' + this.projectName + '&projectid=' + this.id_project + '&isOpen=true'
    // '&isOpen=true'
    const url = this.TESTSITE_BASE_URL + '?tiledesk_projectid=' + this.id_project + '&project_name=' + encodeURIComponent(this.projectName) + '&role=' + this.USER_ROLE

    this.logger.log('[WIDGET-SET-UP] - TEST WIDGET URL ', url);
    window.open(url, '_blank');
  }



  avarageWaitingTimeCLOCK() {
    this.subscription = this.analyticsService.getDataAVGWaitingCLOCK().subscribe((res: any) => {

      if (res && res.length > 0) {
        if (res[0].waiting_time_avg) {
          if (res[0].waiting_time_avg !== null || res[0].waiting_time_avg !== undefined) {

            this.responseAVGtime = this.humanizer.humanize(res[0].waiting_time_avg, { round: true, language: this.lang })

            this.logger.log('[WIDGET-SET-UP]  Waiting time: humanize  this.responseAVGtime', this.responseAVGtime)
            // this.logger.log('waiting time funtion:', this.humanizeDurations(res[0].waiting_time_avg));

          } else {
            this.logger.log('[WIDGET-SET-UP]  waiting_time_avg null or undefined')
          }
        }
      }

    }, (error) => {
      this.logger.error('[WIDGET-SET-UP] - AVERAGE TIME CLOCK REQUEST - ERROR', error);
    }, () => {
      this.logger.log('[WIDGET-SET-UP]  - AVERAGE TIME CLOCK REQUEST * COMPLETE *');
    });
  }

  showWaitingTime() {
    // const projectid = this.g.projectid;
    this.analyticsService.getCurrentWaitingTime()
      .subscribe((res: any) => {

        this.logger.log('[WIDGET-SET-UP]  Waiting time: humanize  responseAVGtimeDario res', res)
        // that.g.wdLog(['response waiting', response]);
        // this.logger.log('response waiting ::::', response);
        if (res && res.length > 0 && res[0].waiting_time_avg) {
          // const wt = response[0].waiting_time_avg;

          // that.waitingTime = wt;
          // that.g.wdLog([' that.waitingTime',  that.waitingTime]);
          // this.logger.log('that.waitingTime', that.waitingTime);

          // const lang = that.translatorService.getLanguage();
          // this.logger.log('lang', lang);
          // that.humanWaitingTime = this.humanizer.humanize(wt, {language: lang});

          const responseAVGtimeDario = this.humanizer.humanize(res[0].waiting_time_avg, { round: true, language: this.lang })

          this.logger.log('[WIDGET-SET-UP]  Waiting time: humanize  responseAVGtimeDario', responseAVGtimeDario)
          // this.logger.log('xxx', this.humanizer.humanize(wt));
          // 'The team typically replies in ' + moment.duration(response[0].waiting_time_avg).format();
        }
        //  else {
        //   that.waitingTimeMessage = 'waiting_time_not_found';
        //   // that.waitingTimeMessage = 'Will reply as soon as they can';
        //  }
      });
  }

  // presentModalFeautureAvailableFromBPlan() {
  //   const el = document.createElement('div')
  //   el.innerHTML = this.featureAvailableFromBPlan
  //   swal({
  //     // title: this.onlyOwnerCanManageTheAccountPlanMsg,
  //     content: el,
  //     icon: "info",
  //     // buttons: true,
  //     buttons: {
  //       cancel: this.cancel,
  //       catch: {
  //         text: this.upgradePlan,
  //         value: "catch",
  //       },
  //     },
  //     dangerMode: false,
  //   }).then((value) => {
  //     if (value === 'catch') {
  //       // this.logger.log('featureAvailableFromPlanC value', value)
  //       // this.logger.log('[APP-STORE] prjct_profile_type', this.prjct_profile_type)
  //       // this.logger.log('[APP-STORE] subscription_is_active', this.subscription_is_active)
  //       // this.logger.log('[APP-STORE] prjct_profile_type', this.prjct_profile_type)
  //       // this.logger.log('[APP-STORE] trial_expired', this.trial_expired)
  //       // this.logger.log('[APP-STORE] isVisiblePAY', this.isVisiblePAY)
  //       if (this.payIsVisible) {
  //         // this.logger.log('[APP-STORE] HERE 1')
  //         if (this.USER_ROLE === 'owner') {
  //           // this.logger.log('[APP-STORE] HERE 2')
  //           if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
  //             if (this.profile_name !== PLAN_NAME.C) {
  //               this.notify.displaySubscripionHasExpiredModal(true, this.profile_name, this.subscription_end_date);
  //             } else if (this.profile_name === PLAN_NAME.C) {
  //               this.notify.displayEnterprisePlanHasExpiredModal(true, this.profile_name, this.subscription_end_date);
  //             }
  //           } else if (this.prjct_profile_type === 'payment' && this.subscription_is_active === true && this.profile_name === PLAN_NAME.A) {
  //             this.notify._displayContactUsModal(true, 'upgrade_plan');
  //           } else if (this.prjct_profile_type === 'free') {
  //             // this.logger.log('[APP-STORE] HERE 4')
  //             this.router.navigate(['project/' + this.id_project + '/pricing']);
  //           }
  //         } else {
  //           // this.logger.log('[APP-STORE] HERE 5')
  //           this.presentModalOnlyOwnerCanManageTheAccountPlan();
  //         }
  //       } else {
  //         // this.logger.log('[APP-STORE] HERE 6')
  //         this.notify._displayContactUsModal(true, 'upgrade_plan');
  //       }
  //     }
  //   });
  // }

}
