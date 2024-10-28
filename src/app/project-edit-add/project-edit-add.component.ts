import { Component, OnInit, OnDestroy, ViewChild, ElementRef, isDevMode } from '@angular/core';
import { ProjectService } from '../services/project.service';
import { Router, ActivatedRoute } from '@angular/router';


// USED FOR go back last page
import { Location } from '@angular/common';
import { AuthService } from '../core/auth.service';
import { Project } from '../models/project-model';
import { ProjectPlanService } from '../services/project-plan.service';
import { NotifyService } from '../core/notify.service';
import { Subscription } from 'rxjs'
import { TranslateService } from '@ngx-translate/core';

import { UsersService } from '../services/users.service';
// import * as moment from 'moment';
import moment from "moment";
import { environment } from './../../environments/environment';
import { AppConfigService } from '../services/app-config.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'

// import brand from 'assets/brand/brand.json';
import { BrandService } from '../services/brand.service';
import { LoggerService } from '../services/logger/logger.service';
import { appSumoHighlightedFeaturesPlanATier1, appSumoHighlightedFeaturesPlanATier2, appSumoHighlightedFeaturesPlanATier3, appSumoHighlightedFeaturesPlanATier4, APPSUMO_PLAN_SEATS, APP_SUMO_PLAN_NAME, avatarPlaceholder, featuresPlanA, getColorBck, PLAN_NAME, PLAN_SEATS, URL_setting_up_automatic_assignment } from './../utils/util';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreditCardValidators } from 'angular-cc-library';
import { ContactsService } from '../services/contacts.service';
import { CacheService } from 'app/services/cache.service';
import { RoleService } from 'app/services/role.service';

const swal = require('sweetalert');
const Swal = require('sweetalert2')

type UserFields = 'creditCard' | 'expirationDate' | 'cvc';
type FormErrors = { [u in UserFields]: string };

@Component({
  selector: 'app-project-edit-add',
  templateUrl: './project-edit-add.component.html',
  styleUrls: ['./project-edit-add.component.scss']
})
export class ProjectEditAddComponent implements OnInit, OnDestroy {
  PLAN_NAME = PLAN_NAME;
  PLAN_SEATS = PLAN_SEATS;
  APP_SUMO_PLAN_NAME = APP_SUMO_PLAN_NAME;
  APPSUMO_PLAN_SEATS = APPSUMO_PLAN_SEATS;
  appSumoProfile: string;
  appSumoInvoiceUUID: string;
  tParamsPlanAndSeats: any;
  tParamsFreePlanSeatsNum: any;
  tParamsFeatureAvailableWith: any;
  seatsLimit: any;
  agentCannotManageAdvancedOptions: string;

  @ViewChild('ccNumber', { static: false }) ccNumberField: ElementRef;
  @ViewChild('ccExpdate', { static: false }) ccExpdateField: ElementRef;

  private unsubscribe$: Subject<any> = new Subject<any>();
  // tparams = brand;
  tparams: any;
  translationParams: any;

  // public_Key = environment.t2y12PruGU9wUtEGzBJfolMIgK; // now get from appconfig
  public_Key: string;
  CREATE_VIEW = false;
  EDIT_VIEW = false;
  PROJECT_SETTINGS_ROUTE: boolean;
  PROJECT_SETTINGS_PAYMENTS_ROUTE: boolean;
  PROJECT_SETTINGS_AUTH_ROUTE: boolean;
  PROJECT_SETTINGS_ADVANCED_ROUTE: boolean;
  PROJECT_SETTINGS_SMARTASSIGNMENT_ROUTE: boolean;
  PROJECT_SETTINGS_NOTIFICATION_ROUTE: boolean;
  PROJECT_SETTINGS_SECURITY_ROUTE: boolean;
  PROJECT_SETTINGS_BANNED_VISITORS_ROUTE: boolean;

  showSpinner = true;

  project_name: string;
  projectName_toUpdate: string;
  id_project: string;

  display = 'none';
  displayJwtSecretGeneratedModal = 'none';
  displayConfirmJwtSecretCreationModal = 'none';
  sharedSecret: string;

  DISABLE_UPDATE_BTN = true;
  DISABLE_DELETE_PROJECT_BTN = true;
  project: Project;

  projectObject: Project;

  AUTO_SEND_TRANSCRIPT_IS_ON: boolean;

  prjct_name: string;
  prjct_profile_name: string;
  profile_name: string;
  prjct_trial_expired: boolean;
  prjc_trial_days_left: any;
  prjct_profile_type: string;
  subscription_is_active: boolean;
  subscription_end_date: Date;

  displayContactUsModal = 'none';
  subscription: Subscription;

  subscriptionCanceledSuccessfully: string;
  subscriptionCanceledError: string;

  cancelSubscriptionDone = false;
  subscription_payments: any;
  subscription_creation_date: string;
  current_invoice_start_date: string;
  current_invoice_end_date: string;

  stripe_subscription_objct: any;
  days_to_next_renew: number;
  numberOf_agents_seats: number;
  subscription_start_date: string;
  timeOfNextRenew: string;
  plan_amount: string;
  plan_interval: string;
  browser_lang: string;
  countOfPendingInvites: number;
  projectUsersLength: number;
  subscriptionPaymentsLength: number;
  SUBSCRIPTION_BUFFER_DAYS: boolean;

  isVisiblePaymentTab: boolean;
  isVisibleAdvancedTab: boolean;
  isVisibleSmartAssignmentTab: boolean;
  isVisibleDeveloperTab: boolean;
  isVisibleNotificationTab: boolean;
  isVisibleSecurityTab: boolean;
  isVisibleCustomizeEmailTemplate: boolean
  isVisibleSMTPsettings: boolean;
  isVisibleBannedVisitor: boolean
  isVisibleAutoSendTranscript: boolean;
  isVisibleVisitorAuthentication: boolean;
  max_agent_assigned_chat: number
  reassignment_delay: number
  automatic_idle_chats: number

  updateSuccessMsg: string;
  updateErrorMsg: string;
  deleteSuccessMsg: string;
  deleteErrorMsg: string;

  // maximum_chats_has_error = false;
  // reassignment_timeout_has_error = false;
  maximum_chats_has_minimum_error = false;
  maximum_chats_has_maximum_error = false;
  reassignment_timeout_has_minimum_error = false;
  reassignment_timeout_has_maximum__error = false;
  automatic_idle_chats_has_minimum_error = false;
  automatic_idle_chats_has_maximum__error = false;
  chat_limit_on: boolean;
  reassignment_on: boolean;
  automatic_unavailable_status_on: boolean;
  agents_can_see_only_own_convs: boolean;
  areHideChatbotAttributesInConvDtls: boolean;

  // unavailable_status_on: boolean;


  is_disabled_chat_limit_section: boolean;
  is_disabled_reassignment_section: boolean;
  is_disabled_unavailable_status_section: boolean;
  notificationNothingToSave: string;
  onlyATeammateWithTheOwnerRoleCanDeleteAProject_lbl: string;
  onlyUsersWithTheOwnerRoleCanManageSMTPsettings: string;
  onlyUserWithOwnerRoleCanManageAdvancedProjectSettings: string;
  project_id_to_delete: string;
  SHOW_CIRCULAR_SPINNER = false;
  DISPLAY_DELETE_PRJCT_BTN: boolean;
  DISPLAY_ADVANCED_TAB: boolean;
  isUNIS: boolean = false;

  assigned_conv_on: boolean;
  displaySupportWidget: boolean;
  unassigned_conv_on: boolean;
  ip_restrictions_on: boolean;
  USER_ROLE: string;

  onlyOwnerCanManageTheAccountPlanMsg: string;
  onlyOwnerCanManageAdvancedProjectSettings: string;
  onlyOwnerCanManageEmailTempalte: string;
  onlyAvailableWithEnterprisePlan: string;
  cPlanOnly: string
  learnMoreAboutDefaultRoles: string;
  TESTSITE_BASE_URL: string;
  TEST_WIDGET_API_BASE_URL: string;
  projectId: string;
  projectName: string;
  contactUsEmail: string;
  IS_OPEN_SETTINGS_SIDEBAR: boolean;
  subscription_id: string;
  customer_id: string;
  card_id: string;
  ccform: FormGroup;
  submitted: boolean = false;
  customer_default_payment_method_id: string
  default_card_brand_name: string;
  card_brand: string;
  card_last_four_digits: string;
  form: FormGroup;
  displayAddPaymentMethodModal: string = 'none'
  credit_card_error_msg: string;
  CARD_HAS_ERROR: boolean;
  SPINNER_IN_ADD_CARD_MODAL: boolean;
  CVC_LENGHT: number;
  DISPLAY_ADD_CARD_COMPLETED: boolean = false;
  no_default_payment_method_id_array: Array<string>
  isActiveSubscription: boolean = false;
  isChromeVerGreaterThan100: boolean

  thereHasBeenAnErrorProcessing: string;
  advancedSettingBtnDisabled = false;
  upgradePlan: string;
  cancel: string;
  featureAvailableOnlyWithPaidPlans: string;
  t_params: any;
  planFeatures: any;
  highlightedFeatures: any;
  isTier3Plans: boolean // Plus or Custom
  isSripeSub: boolean;
  salesEmail: string;
  public hideHelpLink: boolean;
  public displayExtremeMeasures: boolean;

  formErrors: FormErrors = {
    'creditCard': '',
    'expirationDate': '',
    'cvc': '',
  };
  validationMessages = {
    'creditCard': {

      'pattern': 'CC Number must be a valid',
    },
    'expirationDate': {

      'pattern': 'expirationDate  must be  valid',
    },
    'cvc': {
      'required': 'is required.',

    },

  };
  allowedIPs: any
  /**
   * 
   * @param projectService 
   * @param router 
   * @param route 
   * @param _location 
   * @param auth 
   * @param prjctPlanService 
   * @param notify 
   * @param usersService 
   * @param translate 
   * @param appConfigService 
   * @param brandService 
   * @param logger 
   */
  constructor(
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute,
    private _location: Location,
    private auth: AuthService,
    private prjctPlanService: ProjectPlanService,
    private notify: NotifyService,
    private usersService: UsersService,
    private translate: TranslateService,
    public appConfigService: AppConfigService,
    public brandService: BrandService,
    private logger: LoggerService,
    private _fb: FormBuilder,
    private contactsService: ContactsService,
    private cacheService: CacheService,
    private roleService: RoleService
    // private formGroup: FormGroup

  ) {
    const brand = brandService.getBrand();
    this.tparams = brand;
    this.hideHelpLink = brand['DOCS'];
    if (brand) {
      this.contactUsEmail = brand['CONTACT_US_EMAIL'];
      this.salesEmail = brand['CONTACT_SALES_EMAIL'];
      this.displayExtremeMeasures = brand['EXTREME_MEASURES']
      // this.logger.log('[PRJCT-EDIT-ADD] displayExtremeMeasures ',  this.displayExtremeMeasures)
    }
    // this.translationParams = { plan_name: PLAN_NAME.B } // Scale
    this.translationParams = { plan_name: PLAN_NAME.E } // Premium
    this.tParamsFreePlanSeatsNum = { free_plan_allowed_seats_num: PLAN_SEATS.free }
    // this.tParamsFeatureAvailableWith = { plan_name: PLAN_NAME.C }
    // this.t_params = { 'plan_name': PLAN_NAME.A }
  }

  ngOnInit() {

    this.getBrowserVersion()
    this.getCurrentUrlAndSwitchView();
    this.getProjectPlan();
    this.listenCancelSubscription();
    this.translateStrings()
    this.getProjectId();
    this.getBrowserLanguage();
    this.getOSCODE();
    this.getAllUsersOfCurrentProject();
    this.getPendingInvitation();
    this.getProjectUserRole();
    this.getTestSiteUrl();
    this.getCurrentProject();
    //this.checkCurrentStatus();
    this.listenSidebarIsOpened();

    this.buildCreditCardForm()
  }




  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  this.logger.log("[WS-REQUESTS-LIST] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }

  buildCreditCardForm() {

    // this.ccform = this._fb.group({
    //  cardNumber: ['', [CreditCardValidator.validateCardNumber],
    // cardExpDate: ['', [CreditCardValidator.validateCardExpiry],
    // cardCvv: ['', [CreditCardValidator.validateCardCvc],
    // });

    // this.formBuilder = new FormBuilder();
    // this.ccform = this.formBuilder.group({
    //   cardNumber: ['', [CreditCardValidator.validateCardNumber],
    //   cardExpDate: ['', [CreditCardValidator.validateCardExpiry],
    //   cardCvv: ['', [CreditCardValidator.validateCardCvc],
    // });
    this.form = this._fb.group({
      creditCard: ['', [Validators.required]],
      expirationDate: ['', [<any>CreditCardValidators.validateExpDate]],
      cvc: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]]
    });

    // this.form = this._fb.group({
    //   creditCard: ['', [Validators.required]],
    //   expirationDate: ['', [Validators.required]],
    //   cvc: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]] 
    // });

    this.form.valueChanges.subscribe((data) => this.onValueChanged(data));
    this.onValueChanged();
  }

  onValueChanged(data?: any) {
    if (!this.form) {
      return;
    }
    const { expirationDate } = this.form.controls
    this.logger.log('onValueChanged expirationDate', expirationDate)
    this.logger.log('onValueChanged expirationDate status', expirationDate.status)

    if (expirationDate.value && expirationDate.value.length === 7) {
      this.logger.log('onValueChanged expirationDate status expirationDate.value.length', expirationDate.value.length)
      if (expirationDate.status === 'INVALID') {

        this.CARD_HAS_ERROR = true
        this.SPINNER_IN_ADD_CARD_MODAL = false
        this.credit_card_error_msg = "The expiration date is invalid"
        this.logger.log('onValueChanged expirationDate INVALID credit_card_error_msg', this.credit_card_error_msg)
      }
      if (expirationDate.status === 'VALID') {

        this.CARD_HAS_ERROR = null
        this.SPINNER_IN_ADD_CARD_MODAL = null
        this.credit_card_error_msg = null
        this.logger.log('onValueChanged expirationDate INVALID credit_card_error_msg', this.credit_card_error_msg)
      }
    }
  }


  listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
      this.logger.log('[PRJCT-EDIT-ADD] SETTINGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


  getCurrentProject() {
    // this.project = this.auth.project_bs.value;
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {
        if (project) {
          this.project = project
          // this.logger.log('[PRJCT-EDIT-ADD] GET CURRENT PROJECT project', this.project);
          this.projectId = project._id;
          this.logger.log('[PRJCT-EDIT-ADD] GET CURRENT PROJECT projectId ', this.projectId);
          this.projectName = project.name;
          this.logger.log('[PRJCT-EDIT-ADD] GET CURRENT PROJECT projectName ', this.projectName);

        }
      });
  }

  getProjectUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user_role) => {
        this.logger.log('[PRJCT-EDIT-ADD] - USER ROLE ', user_role);
        if (user_role) {
          this.USER_ROLE = user_role

        }
      });
  }

  translateStrings() {
    this.translateNotificationMsgs();
    this.translateMsgSubscriptionCanceledSuccessfully();
    this.translateMsgSubscriptionCanceledError();
    this.translateModalOnlyOwnerCanManageProjectAccount();
    this.translateOnlyATeammateWithTheOwnerRoleCanDeleteAProject();
    this.translateThereHasBeenAnErrorProcessing();

    this.translate.get('UsersWiththeAgentroleCannotManageTheAdvancedOptionsOfTheProject')
      .subscribe((translation: any) => {
        this.agentCannotManageAdvancedOptions = translation;
      });

    this.translate.get('Pricing.UpgradePlan')
      .subscribe((translation: any) => {
        this.upgradePlan = translation;
      });

    this.translate.get('Cancel')
      .subscribe((translation: any) => {
        this.cancel = translation;
      });

    this.translate.get('FeatureAvailableOnlyWithPaidPlans')
      .subscribe((translation: any) => {
        this.featureAvailableOnlyWithPaidPlans = translation;
      });

    this.translate.get('OnlyUsersWithTheOwnerRoleCanManageSMTPsettings')
      .subscribe((translation: any) => {
        this.onlyUsersWithTheOwnerRoleCanManageSMTPsettings = translation;
      });

    this.translate.get('OnlyUserWithOwnerRoleCanManageAdvancedProjectSettings')
      .subscribe((translation: any) => {
        this.onlyUserWithOwnerRoleCanManageAdvancedProjectSettings = translation;
      });


  }

  translateThereHasBeenAnErrorProcessing() {
    this.translate.get('ThereHasBeenAnErrorProcessing')
      .subscribe((translation: any) => {
        this.thereHasBeenAnErrorProcessing = translation;
      });
  }

  translateNotificationMsgs() {
    this.translate.get('ProjectEditPage.NotificationMsgs')
      .subscribe((translation: any) => {
        // this.logger.log('[PRJCT-EDIT-ADD] translateNotificationMsgs text', translation)

        this.updateSuccessMsg = translation.UpdateProjectSuccess;
        this.updateErrorMsg = translation.UpdateProjectError;
        this.deleteSuccessMsg = translation.DeleteProjectSuccess
        this.deleteErrorMsg = translation.DeleteProjectError

      });

    this.translate.get('NotificationNothingToSave')
      .subscribe((translation: any) => {
        this.notificationNothingToSave = translation;
      });
  }

  translateOnlyATeammateWithTheOwnerRoleCanDeleteAProject() {
    this.translate.get('OnlyATeammateWithTheOwnerRoleCanDeleteAProject')
      .subscribe((translation: any) => {
        this.onlyATeammateWithTheOwnerRoleCanDeleteAProject_lbl = translation;
      });
  }


  translateModalOnlyOwnerCanManageProjectAccount() {
    this.translate.get('OnlyUsersWithTheOwnerRoleCanManageTheAccountPlan')
      .subscribe((translation: any) => {
        // this.logger.log('[PRJCT-EDIT-ADD] onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.onlyOwnerCanManageTheAccountPlanMsg = translation;
      });

    this.translate.get('OnlyUsersWithTheOwnerRoleCanManageTheEmailTemplate')
      .subscribe((translation: any) => {
        // this.logger.log('[PRJCT-EDIT-ADD] onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.onlyOwnerCanManageEmailTempalte = translation;
      });

    this.translate.get('ProjectEditPage.FeatureOnlyAvailableWithTheEnterprisePlan')
      .subscribe((translation: any) => {
        // this.logger.log('[PRJCT-EDIT-ADD] onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.onlyAvailableWithEnterprisePlan = translation;
      });


    this.translate.get('LearnMoreAboutDefaultRoles')
      .subscribe((translation: any) => {
        // this.logger.log('[PRJCT-EDIT-ADD] onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.learnMoreAboutDefaultRoles = translation;
      });

    this.translate.get('OnlyUserWithOwnerRoleCanManageAdvancedProjectSettings')
      .subscribe((translation: any) => {
        // this.logger.log('[PRJCT-EDIT-ADD] onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.onlyOwnerCanManageAdvancedProjectSettings = translation;
      });




    // this.translate.get('AvailableWithThePlan', { plan_name: PLAN_NAME.C })
    //   .subscribe((translation: any) => {
    //     this.cPlanOnly = translation;
    //   });
  }


  getPendingInvitation() {
    this.usersService.getPendingUsers()
      .subscribe((pendingInvitation: any) => {
        this.logger.log('[PRJCT-EDIT-ADD] - GET PENDING INVITATION ', pendingInvitation);

        if (pendingInvitation) {
          this.countOfPendingInvites = pendingInvitation.length
          this.logger.log('[PRJCT-EDIT-ADD] - # OF PENDING INVITATION ', this.countOfPendingInvites);
        }
      }, error => {
        this.logger.error('[PRJCT-EDIT-ADD] - GET PENDING INVITATION - ERROR', error);
      }, () => {
        this.logger.log('[PRJCT-EDIT-ADD] - GET PENDING INVITATION - COMPLETE');
      });
  }

  getAllUsersOfCurrentProject() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      this.logger.log('[PRJCT-EDIT-ADD] GET PROJECT USERS - RES ', projectUsers);

      if (projectUsers) {
        this.projectUsersLength = projectUsers.length;
        this.logger.log('[PRJCT-EDIT-ADD] # OF PROJECT USERS ', this.projectUsersLength);
      }
    }, error => {
      this.logger.error('[PRJCT-EDIT-ADD] PROJECT USERS - ERROR', error);
    }, () => {
      this.logger.log('[PRJCT-EDIT-ADD] PROJECT USERS - COMPLETE');
    });
  }


  getBrowserLanguage() {
    this.browser_lang = this.translate.getBrowserLang();
    this.logger.log('[PRJCT-EDIT-ADD] - browser_lang ', this.browser_lang)
  }

  getCurrentUrlAndSwitchView() {
    const currentUrl = this.router.url;
    this.logger.log('[PRJCT-EDIT-ADD] current_url ', currentUrl);

    this.logger.log('[PRJCT-EDIT-ADD] - PROJECT_SETTINGS_ROUTE ', currentUrl.indexOf('/project-settings/general'));
    this.logger.log('[PRJCT-EDIT-ADD] - PROJECT_SETTINGS_PAYMENTS_ROUTE ', currentUrl.indexOf('/project-settings/payments'));
    this.logger.log('[PRJCT-EDIT-ADD] - PROJECT_SETTINGS_AUTH_ROUTE ', currentUrl.indexOf('/project-settings/auth'));
    this.logger.log('[PRJCT-EDIT-ADD] - PROJECT_SETTINGS_AUTH_ROUTE ', currentUrl.indexOf('/project-settings/advanced'));
    this.logger.log('[PRJCT-EDIT-ADD] - PROJECT_SETTINGS_NOTIFICATION ', currentUrl.indexOf('/project-settings/notification'));
    this.logger.log('[PRJCT-EDIT-ADD] - PROJECT_SMARTASSIGNMENT ', currentUrl.indexOf('/project-settings/smartassignment'));

    const url_segments = currentUrl.split('/');
    this.logger.log('[PRJCT-EDIT-ADD] - url_segments ', url_segments);

    const nav_project_id = url_segments[2];
    this.logger.log('[PRJCT-EDIT-ADD] - nav_project_id ', nav_project_id);



    if (nav_project_id === '5ec688ed13400f0012c2edc2') {

      this.isUNIS = true;

      // this.DISPLAY_ADVANCED_TAB = true;
      this.logger.log('[PRJCT-EDIT-ADD] - isUNIS ', this.isUNIS);
    } else {
      this.isUNIS = false;
      this.logger.log('[PRJCT-EDIT-ADD] - isUNIS ', this.isUNIS);

      // this.DISPLAY_ADVANCED_TAB = false;
    }


    /** THE ACTIVE ROUTE IS /project-settings/general */
    if (
      (currentUrl.indexOf('/project-settings/general') !== -1) &&
      (currentUrl.indexOf('/project-settings/payments') === -1) &&
      (currentUrl.indexOf('/project-settings/auth') === -1) &&
      (currentUrl.indexOf('/project-settings/smartassignment') === -1) &&
      (currentUrl.indexOf('/project-settings/notification') === -1) &&
      (currentUrl.indexOf('/project-settings/security') === -1) &&
      (currentUrl.indexOf('/project-settings/banned') === -1) &&
      (currentUrl.indexOf('/project-settings/advanced') === -1)
    ) {
      this.logger.log('%ProjectEditAddComponent router.url', this.router.url);

      this.PROJECT_SETTINGS_ROUTE = true;
      this.PROJECT_SETTINGS_PAYMENTS_ROUTE = false;
      this.PROJECT_SETTINGS_AUTH_ROUTE = false;
      this.PROJECT_SETTINGS_SMARTASSIGNMENT_ROUTE = false;
      this.PROJECT_SETTINGS_NOTIFICATION_ROUTE = false;
      this.PROJECT_SETTINGS_SECURITY_ROUTE = false;
      this.PROJECT_SETTINGS_BANNED_VISITORS_ROUTE = false;
      this.PROJECT_SETTINGS_ADVANCED_ROUTE = false;

      this.logger.log('[PRJCT-EDIT-ADD] - is PROJECT_SETTINGS_ROUTE ', this.PROJECT_SETTINGS_ROUTE);
      this.logger.log('[PRJCT-EDIT-ADD] - is PROJECT_SETTINGS_PAYMENTS_ROUTE ', this.PROJECT_SETTINGS_PAYMENTS_ROUTE);
      this.logger.log('[PRJCT-EDIT-ADD] - is PROJECT_SETTINGS_AUTH_ROUTE ', this.PROJECT_SETTINGS_AUTH_ROUTE);
      this.logger.log('[PRJCT-EDIT-ADD] - is PROJECT_SETTINGS_SMARTASSIGNMENT_ROUTE ', this.PROJECT_SETTINGS_SMARTASSIGNMENT_ROUTE);
      this.logger.log('[PRJCT-EDIT-ADD] - is PROJECT_SETTINGS_ADVANCED_ROUTE ', this.PROJECT_SETTINGS_ADVANCED_ROUTE);
      this.logger.log('[PRJCT-EDIT-ADD] - is PROJECT_SETTINGS_NOTIFICATION ', this.PROJECT_SETTINGS_NOTIFICATION_ROUTE);
      this.logger.log('[PRJCT-EDIT-ADD] - is PROJECT_SETTINGS_SECURITY_ROUTE ', this.PROJECT_SETTINGS_SECURITY_ROUTE);

      /** THE ACTIVE ROUTE IS /project-settings/payments (i.e. Subcsription) */
    } else if (
      (currentUrl.indexOf('/project-settings/general') === -1) &&
      (currentUrl.indexOf('/project-settings/payments') !== -1) &&
      (currentUrl.indexOf('/project-settings/auth') === -1) &&
      (currentUrl.indexOf('/project-settings/smartassignment') === -1) &&
      (currentUrl.indexOf('/project-settings/notification') === -1) &&
      (currentUrl.indexOf('/project-settings/security') === -1) &&
      (currentUrl.indexOf('/project-settings/banned') === -1) &&
      (currentUrl.indexOf('/project-settings/advanced') === -1)
    ) {
      this.PROJECT_SETTINGS_ROUTE = false;
      this.PROJECT_SETTINGS_PAYMENTS_ROUTE = true;
      this.PROJECT_SETTINGS_AUTH_ROUTE = false;
      this.PROJECT_SETTINGS_SMARTASSIGNMENT_ROUTE = false;
      this.PROJECT_SETTINGS_NOTIFICATION_ROUTE = false;
      this.PROJECT_SETTINGS_SECURITY_ROUTE = false;
      this.PROJECT_SETTINGS_BANNED_VISITORS_ROUTE = false;
      this.PROJECT_SETTINGS_ADVANCED_ROUTE = false;

      // this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_ROUTE ', this.PROJECT_SETTINGS_ROUTE);
      // this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_PAYMENTS_ROUTE ', this.PROJECT_SETTINGS_PAYMENTS_ROUTE);
      // this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_AUTH_ROUTE ', this.PROJECT_SETTINGS_AUTH_ROUTE);
      this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_SMARTASSIGNMENT_ROUTE ', this.PROJECT_SETTINGS_SMARTASSIGNMENT_ROUTE);
      this.logger.log('[PRJCT-EDIT-ADD] - is PROJECT_SETTINGS_ADVANCED_ROUTE ', this.PROJECT_SETTINGS_ADVANCED_ROUTE);
      /** THE ACTIVE ROUTE IS project-settings/auth */
    } else if (
      (currentUrl.indexOf('/project-settings/general') === -1) &&
      (currentUrl.indexOf('/project-settings/payments') === -1) &&
      (currentUrl.indexOf('/project-settings/auth') !== -1) &&
      (currentUrl.indexOf('/project-settings/smartassignment') === -1) &&
      (currentUrl.indexOf('/project-settings/notification') === -1) &&
      (currentUrl.indexOf('/project-settings/security') === -1) &&
      (currentUrl.indexOf('/project-settings/banned') === -1) &&
      (currentUrl.indexOf('/project-settings/advanced') === -1)
    ) {
      this.PROJECT_SETTINGS_ROUTE = false;
      this.PROJECT_SETTINGS_PAYMENTS_ROUTE = false;
      this.PROJECT_SETTINGS_AUTH_ROUTE = true;
      this.PROJECT_SETTINGS_SMARTASSIGNMENT_ROUTE = false;
      this.PROJECT_SETTINGS_NOTIFICATION_ROUTE = false;
      this.PROJECT_SETTINGS_SECURITY_ROUTE = false;
      this.PROJECT_SETTINGS_BANNED_VISITORS_ROUTE = false;
      this.PROJECT_SETTINGS_ADVANCED_ROUTE = false;
      // this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_ROUTE ', this.PROJECT_SETTINGS_ROUTE);
      // this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_PAYMENTS_ROUTE ', this.PROJECT_SETTINGS_PAYMENTS_ROUTE);
      // this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_AUTH_ROUTE ', this.PROJECT_SETTINGS_AUTH_ROUTE);
      this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_SMARTASSIGNMENT_ROUTE ', this.PROJECT_SETTINGS_SMARTASSIGNMENT_ROUTE);
      this.logger.log('[PRJCT-EDIT-ADD] - is PROJECT_SETTINGS_ADVANCED_ROUTE ', this.PROJECT_SETTINGS_ADVANCED_ROUTE);
    }
    /** THE ACTIVE ROUTE IS project-settings/smartassignment */
    else if (
      (currentUrl.indexOf('/project-settings/general') === -1) &&
      (currentUrl.indexOf('/project-settings/payments') === -1) &&
      (currentUrl.indexOf('/project-settings/auth') === -1) &&
      (currentUrl.indexOf('/project-settings/smartassignment') !== -1) &&
      (currentUrl.indexOf('/project-settings/notification') === -1) &&
      (currentUrl.indexOf('/project-settings/security') === -1) &&
      (currentUrl.indexOf('/project-settings/banned') === -1) &&
      (currentUrl.indexOf('/project-settings/advanced') === -1)
    ) {
      this.PROJECT_SETTINGS_ROUTE = false;
      this.PROJECT_SETTINGS_PAYMENTS_ROUTE = false;
      this.PROJECT_SETTINGS_AUTH_ROUTE = false;
      this.PROJECT_SETTINGS_SMARTASSIGNMENT_ROUTE = true;
      this.PROJECT_SETTINGS_NOTIFICATION_ROUTE = false;
      this.PROJECT_SETTINGS_SECURITY_ROUTE = false;
      this.PROJECT_SETTINGS_BANNED_VISITORS_ROUTE = false;
      this.PROJECT_SETTINGS_ADVANCED_ROUTE = false;
      // this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_ROUTE ', this.PROJECT_SETTINGS_ROUTE);
      // this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_PAYMENTS_ROUTE ', this.PROJECT_SETTINGS_PAYMENTS_ROUTE);
      // this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_AUTH_ROUTE ', this.PROJECT_SETTINGS_AUTH_ROUTE);
      this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_SMARTASSIGNMENT_ROUTE ', this.PROJECT_SETTINGS_SMARTASSIGNMENT_ROUTE);
      this.logger.log('[PRJCT-EDIT-ADD] - is PROJECT_SETTINGS_ADVANCED_ROUTE ', this.PROJECT_SETTINGS_ADVANCED_ROUTE);
    }

    /** THE ACTIVE ROUTE IS project-settings/notification */
    else if (
      (currentUrl.indexOf('/project-settings/general') === -1) &&
      (currentUrl.indexOf('/project-settings/payments') === -1) &&
      (currentUrl.indexOf('/project-settings/auth') === -1) &&
      (currentUrl.indexOf('/project-settings/smartassignment') === -1) &&
      (currentUrl.indexOf('/project-settings/notification') !== -1) &&
      (currentUrl.indexOf('/project-settings/security') === -1) &&
      (currentUrl.indexOf('/project-settings/banned') === -1) &&
      (currentUrl.indexOf('/project-settings/advanced') === -1)
    ) {
      this.PROJECT_SETTINGS_ROUTE = false;
      this.PROJECT_SETTINGS_PAYMENTS_ROUTE = false;
      this.PROJECT_SETTINGS_AUTH_ROUTE = false;
      this.PROJECT_SETTINGS_SMARTASSIGNMENT_ROUTE = false;
      this.PROJECT_SETTINGS_NOTIFICATION_ROUTE = true;
      this.PROJECT_SETTINGS_SECURITY_ROUTE = false;
      this.PROJECT_SETTINGS_BANNED_VISITORS_ROUTE = false;
      this.PROJECT_SETTINGS_ADVANCED_ROUTE = false;
      this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_SMARTASSIGNMENT_ROUTE ', this.PROJECT_SETTINGS_SMARTASSIGNMENT_ROUTE);
      this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_ADVANCED_ROUTE ', this.PROJECT_SETTINGS_ADVANCED_ROUTE);
    }
    /** THE ACTIVE ROUTE IS project-settings/security */
    else if (
      (currentUrl.indexOf('/project-settings/general') === -1) &&
      (currentUrl.indexOf('/project-settings/payments') === -1) &&
      (currentUrl.indexOf('/project-settings/auth') === -1) &&
      (currentUrl.indexOf('/project-settings/smartassignment') === -1) &&
      (currentUrl.indexOf('/project-settings/notification') === -1) &&
      (currentUrl.indexOf('/project-settings/security') !== -1) &&
      (currentUrl.indexOf('/project-settings/banned') === -1) &&
      (currentUrl.indexOf('/project-settings/advanced') === -1)
    ) {
      this.PROJECT_SETTINGS_ROUTE = false;
      this.PROJECT_SETTINGS_PAYMENTS_ROUTE = false;
      this.PROJECT_SETTINGS_AUTH_ROUTE = false;
      this.PROJECT_SETTINGS_SMARTASSIGNMENT_ROUTE = false;
      this.PROJECT_SETTINGS_NOTIFICATION_ROUTE = false;
      this.PROJECT_SETTINGS_SECURITY_ROUTE = true;
      this.PROJECT_SETTINGS_BANNED_VISITORS_ROUTE = false;
      this.PROJECT_SETTINGS_ADVANCED_ROUTE = false;
      this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_SMARTASSIGNMENT_ROUTE ', this.PROJECT_SETTINGS_SMARTASSIGNMENT_ROUTE);
      this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_ADVANCED_ROUTE ', this.PROJECT_SETTINGS_ADVANCED_ROUTE);
    }
    /** THE ACTIVE ROUTE IS project-settings/banned */
    else if (
      (currentUrl.indexOf('/project-settings/general') === -1) &&
      (currentUrl.indexOf('/project-settings/payments') === -1) &&
      (currentUrl.indexOf('/project-settings/auth') === -1) &&
      (currentUrl.indexOf('/project-settings/smartassignment') === -1) &&
      (currentUrl.indexOf('/project-settings/notification') === -1) &&
      (currentUrl.indexOf('/project-settings/security') === -1) &&
      (currentUrl.indexOf('/project-settings/banned') !== -1) &&
      (currentUrl.indexOf('/project-settings/advanced') === -1)
    ) {
      this.PROJECT_SETTINGS_ROUTE = false;
      this.PROJECT_SETTINGS_PAYMENTS_ROUTE = false;
      this.PROJECT_SETTINGS_AUTH_ROUTE = false;
      this.PROJECT_SETTINGS_SMARTASSIGNMENT_ROUTE = false;
      this.PROJECT_SETTINGS_NOTIFICATION_ROUTE = false;
      this.PROJECT_SETTINGS_SECURITY_ROUTE = false;
      this.PROJECT_SETTINGS_BANNED_VISITORS_ROUTE = true;
      this.PROJECT_SETTINGS_ADVANCED_ROUTE = false;
      this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_SMARTASSIGNMENT_ROUTE ', this.PROJECT_SETTINGS_SMARTASSIGNMENT_ROUTE);
      this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_ADVANCED_ROUTE ', this.PROJECT_SETTINGS_ADVANCED_ROUTE);
    }

    else if (
      (currentUrl.indexOf('/project-settings/general') === -1) &&
      (currentUrl.indexOf('/project-settings/payments') === -1) &&
      (currentUrl.indexOf('/project-settings/auth') === -1) &&
      (currentUrl.indexOf('/project-settings/smartassignment') === -1) &&
      (currentUrl.indexOf('/project-settings/notification') === -1) &&
      (currentUrl.indexOf('/project-settings/security') === -1) &&
      (currentUrl.indexOf('/project-settings/banned') === -1) &&
      (currentUrl.indexOf('/project-settings/advanced') !== -1)
    ) {
      this.PROJECT_SETTINGS_ROUTE = false;
      this.PROJECT_SETTINGS_PAYMENTS_ROUTE = false;
      this.PROJECT_SETTINGS_AUTH_ROUTE = false;
      this.PROJECT_SETTINGS_SMARTASSIGNMENT_ROUTE = false;
      this.PROJECT_SETTINGS_NOTIFICATION_ROUTE = false;
      this.PROJECT_SETTINGS_SECURITY_ROUTE = false;
      this.PROJECT_SETTINGS_BANNED_VISITORS_ROUTE = false;
      this.PROJECT_SETTINGS_ADVANCED_ROUTE = true;
      this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_SMARTASSIGNMENT_ROUTE ', this.PROJECT_SETTINGS_SMARTASSIGNMENT_ROUTE);
      this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_ADVANCED_ROUTE ', this.PROJECT_SETTINGS_ADVANCED_ROUTE);
    }
  }


  goToProjectSettings_General() {
    this.logger.log('[PRJCT-EDIT-ADD] - HAS CLICKED goToProjectSettings_General ');
    this.router.navigate(['project/' + this.id_project + '/project-settings/general']);
  }

  // i.e. Subscription TAB
  goToProjectSettings_Payments() {
    this.logger.log('[PRJCT-EDIT-ADD] - HAS CLICKED goToProjectSettings_Payments USER_ROLE ', this.USER_ROLE);
    if (this.USER_ROLE === 'owner') {
      this.logger.log('[PRJCT-EDIT-ADD] - HAS CLICKED goToProjectSettings_Payments ');
      this.router.navigate(['project/' + this.id_project + '/project-settings/payments']);
      if (!isDevMode()) {
        if (window['analytics']) {
          try {
            window['analytics'].page("Project Settings, Subscription", {});
          } catch (err) {
            this.logger.error('page Home error', err);
          }
        }
      }

    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan()
    }
  }

  // i.e. Developer TAB
  goToProjectSettings_Auth() {
    this.logger.log('[PRJCT-EDIT-ADD] - HAS CLICKED goToProjectSettings_Auth ');
    this.router.navigate(['project/' + this.id_project + '/project-settings/auth']);
  }


  // 

  goToProjectSettings_SmartAssignment() {
    this.logger.log('[PRJCT-EDIT-ADD] - HAS CLICKED goToProjectSettings_SmartAssignment');
    if (this.isVisiblePaymentTab) {
      if (this.USER_ROLE !== 'agent') {
        if (this.profile_name === PLAN_NAME.C || this.profile_name === PLAN_NAME.F) {
          // this.logger.log('goToProjectSettings_Security HERE 1 ')
          if (this.subscription_is_active === true) {
            // this.logger.log('goToProjectSettings_Security HERE 2 ')
            this.router.navigate(['project/' + this.id_project + '/project-settings/smartassignment']);
          } else if (this.subscription_is_active === false) {
            // this.logger.log('goToProjectSettings_Security HERE 3 ')
            if (this.profile_name === PLAN_NAME.C) {
              this.notify.displayEnterprisePlanHasExpiredModal(true, PLAN_NAME.C + ' plan', this.subscription_end_date);
            } else if (this.profile_name === PLAN_NAME.F) {
              this.notify.displayEnterprisePlanHasExpiredModal(true, PLAN_NAME.F + ' plan', this.subscription_end_date);
            }
          }
        } else if (
          this.profile_name === PLAN_NAME.A ||
          this.profile_name === PLAN_NAME.B ||
          this.profile_name === PLAN_NAME.D ||
          this.profile_name === PLAN_NAME.E ||
          this.profile_name === PLAN_NAME.EE ||
          this.prjct_profile_type === 'free'
        ) {
          // this.logger.log('goToProjectSettings_Security HERE 4 ')
          this.presentModalFeautureAvailableOnlyWithPlanC()
        }
      } else {
        // this.logger.log('goToProjectSettings_Security HERE 5 ')
        this.presentModalAgentCannotManageAvancedSettings()
      }
    } else {
      this.notify._displayContactUsModal(true, 'upgrade_plan');
    }
  }

  goToProjectSettings_Notification() {
    this.logger.log('[PRJCT-EDIT-ADD] - HAS CLICKED goToProjectSettings_Notification');
    this.router.navigate(['project/' + this.id_project + '/project-settings/notification'])
  }

  goToProjectSettings_Security() {
    if (this.isVisiblePaymentTab) {
      if (this.USER_ROLE === 'owner') {
        if (this.profile_name === PLAN_NAME.C || this.profile_name === PLAN_NAME.F) {
          // this.logger.log('goToProjectSettings_Security HERE 1 ')
          if (this.subscription_is_active === true) {
            // this.logger.log('goToProjectSettings_Security HERE 2 ')
            this.router.navigate(['project/' + this.id_project + '/project-settings/security'])
          } else if (this.subscription_is_active === false) {
            // this.logger.log('goToProjectSettings_Security HERE 3 ')
            if (this.profile_name === PLAN_NAME.C) {
              this.notify.displayEnterprisePlanHasExpiredModal(true, PLAN_NAME.C + ' plan', this.subscription_end_date);
            } else if (this.profile_name === PLAN_NAME.F) {
              this.notify.displayEnterprisePlanHasExpiredModal(true, PLAN_NAME.F + ' plan', this.subscription_end_date);
            }
          }
        } else if (
          this.profile_name === PLAN_NAME.A ||
          this.profile_name === PLAN_NAME.B ||
          this.profile_name === PLAN_NAME.D ||
          this.profile_name === PLAN_NAME.E ||
          this.profile_name === PLAN_NAME.EE ||
          this.prjct_profile_type === 'free'
        ) {
          // this.logger.log('goToProjectSettings_Security HERE 4 ')
          this.presentModalFeautureAvailableOnlyWithPlanC()
        }
      } else {
        // this.logger.log('goToProjectSettings_Security HERE 5 ')
        this.presentModalOnlyOwnerCanManageAdvancedProjectSettings()
      }
    } else {
      this.notify._displayContactUsModal(true, 'upgrade_plan');
    }
  }


  goToProjectSettings_BannedVisitors() {
    if (this.isVisiblePaymentTab) {
      if (this.USER_ROLE === 'owner') {
        if (this.profile_name === PLAN_NAME.C || this.profile_name === PLAN_NAME.F) {
          // this.logger.log('displayModalBanVisitor HERE 1 ')
          if (this.subscription_is_active === true) {
            // this.logger.log('displayModalBanVisitor HERE 2 ')
            this.router.navigate(['project/' + this.id_project + '/project-settings/banned'])
          } else if (this.subscription_is_active === false) {
            // this.logger.log('displayModalBanVisitor HERE 3 ')
            if (this.profile_name === PLAN_NAME.C) {
              this.notify.displayEnterprisePlanHasExpiredModal(true, PLAN_NAME.C + ' plan', this.subscription_end_date);
            } else if (this.profile_name === PLAN_NAME.F) {
              this.notify.displayEnterprisePlanHasExpiredModal(true, PLAN_NAME.F + ' plan', this.subscription_end_date);
            }
          }
        } else if (
          this.profile_name === PLAN_NAME.A ||
          this.profile_name === PLAN_NAME.B ||
          this.profile_name === PLAN_NAME.D ||
          this.profile_name === PLAN_NAME.E ||
          this.profile_name === PLAN_NAME.EE ||
          this.prjct_profile_type === 'free'
        ) {
          // this.logger.log('displayModalBanVisitor HERE 4 ')
          this.presentModalFeautureAvailableOnlyWithPlanC()
        }
      } else {
        // this.logger.log('displayModalBanVisitor HERE 5 ')
        this.presentModalOnlyOwnerCanManageAdvancedProjectSettings()
      }
    } else {
      this.notify._displayContactUsModal(true, 'upgrade_plan');
    }

  }

  goToProjectSettings_Advanced() {
    if (this.isVisiblePaymentTab) {
      if (this.USER_ROLE === 'owner') {
        if (this.profile_name === PLAN_NAME.C || this.profile_name === PLAN_NAME.F) {
          // this.logger.log('displayModalBanVisitor HERE 1 ')
          if (this.subscription_is_active === true) {
            // this.logger.log('displayModalBanVisitor HERE 2 ')
            this.router.navigate(['project/' + this.id_project + '/project-settings/advanced'])
          } else if (this.subscription_is_active === false) {
            // this.logger.log('displayModalBanVisitor HERE 3 ')
            if (this.profile_name === PLAN_NAME.C) {
              this.notify.displayEnterprisePlanHasExpiredModal(true, PLAN_NAME.C + ' plan', this.subscription_end_date);
            } else if (this.profile_name === PLAN_NAME.F) {
              this.notify.displayEnterprisePlanHasExpiredModal(true, PLAN_NAME.F + ' plan', this.subscription_end_date);
            }
          }
        } else if (
          this.profile_name === PLAN_NAME.A ||
          this.profile_name === PLAN_NAME.B ||
          this.profile_name === PLAN_NAME.D ||
          this.profile_name === PLAN_NAME.E ||
          this.profile_name === PLAN_NAME.EE ||
          this.prjct_profile_type === 'free'
        ) {
          // this.logger.log('displayModalBanVisitor HERE 4 ')
          this.presentModalFeautureAvailableOnlyWithPlanC()
        }
      } else {
        // this.logger.log('displayModalBanVisitor HERE 5 ')
        this.presentModalOnlyOwnerCanManageAdvancedProjectSettings()
      }
    } else {
      this.notify._displayContactUsModal(true, 'upgrade_plan');
    }
  }


  goToCustomizeNotificationEmailPage() {
    // this.roleService.checkRoleForCurrentProject('notification-email');
    // this.router.navigate(['project/' + this.id_project + '/notification-email'])
    this.logger.log('goToCustomizeNotificationEmailPage profile_name ', this.profile_name)

    if (this.USER_ROLE === 'owner') {
      if (this.profile_name === PLAN_NAME.C || this.profile_name === PLAN_NAME.F) {
        // this.logger.log('goToCustomizeNotificationEmailPage HERE 1 ')
        if (this.subscription_is_active === true) {
          // this.logger.log('goToCustomizeNotificationEmailPage HERE 2 ')
          this.router.navigate(['project/' + this.id_project + '/notification-email'])
        } else if (this.subscription_is_active === false) {
          // this.logger.log('goToCustomizeNotificationEmailPage HERE 3 ')
          if (this.profile_name === PLAN_NAME.C) {
            this.notify.displayEnterprisePlanHasExpiredModal(true, PLAN_NAME.C + ' plan', this.subscription_end_date);
          } else if (this.profile_name === PLAN_NAME.F) {
            // -----------------------------
            // For withe labelling
            // -----------------------------
            if (this.isVisiblePaymentTab) {
              this.notify.displayEnterprisePlanHasExpiredModal(true, PLAN_NAME.F + ' plan', this.subscription_end_date);
            } else {
              this.notify._displayContactUsModal(true, 'upgrade_plan');
            }
          }
        }
      } else if (
        this.profile_name === PLAN_NAME.A ||
        this.profile_name === PLAN_NAME.B ||
        this.profile_name === PLAN_NAME.D ||
        this.profile_name === PLAN_NAME.E ||
        this.profile_name === PLAN_NAME.EE ||
        this.prjct_profile_type === 'free'
      ) {
        // this.logger.log('goToCustomizeNotificationEmailPage HERE 4 ')

        this.presentModalFeautureAvailableOnlyWithPlanC()
      }
    } else {
      // this.logger.log('goToCustomizeNotificationEmailPage HERE 5 ')
      this.presentModalOnlyOwnerCanManageAdvancedProjectSettings()
    }
  }

  goToManageEmailSettings() {
    if (this.USER_ROLE === 'owner') {
      if (this.profile_name === PLAN_NAME.C || this.profile_name === PLAN_NAME.F) {
        // this.logger.log('goToManageEmailSettings HERE 1 ')
        if (this.subscription_is_active === true) {
          // this.logger.log('goToManageEmailSettings HERE 2 ')
          this.router.navigate(['project/' + this.id_project + '/smtp-settings'])
        } else if (this.subscription_is_active === false) {
          this.logger.log('goToManageEmailSettings HERE 3 isVisiblePaymentTab ', this.isVisiblePaymentTab, 'profile_name ', this.profile_name)
          if (this.profile_name === PLAN_NAME.C) {
            this.logger.log('goToManageEmailSettings HERE 4  PLAN_NAME', this.profile_name)
            // -----------------------------
            // For withe labelling
            // -----------------------------
            if (this.isVisiblePaymentTab) {
              this.notify.displayEnterprisePlanHasExpiredModal(true, PLAN_NAME.C + ' plan', this.subscription_end_date);
            } else {
              this.notify._displayContactUsModal(true, 'upgrade_plan');
            }
          } else if (this.profile_name === PLAN_NAME.F) {
            if (this.isVisiblePaymentTab) {
              this.notify.displayEnterprisePlanHasExpiredModal(true, PLAN_NAME.F + ' plan', this.subscription_end_date);
            } else {
              this.notify._displayContactUsModal(true, 'upgrade_plan');
            }
          }
        }
      } else if (
        this.profile_name === PLAN_NAME.A ||
        this.profile_name === PLAN_NAME.B ||
        this.profile_name === PLAN_NAME.D ||
        this.profile_name === PLAN_NAME.E ||
        this.profile_name === PLAN_NAME.EE ||
        this.prjct_profile_type === 'free'
      ) {
        // this.logger.log('goToManageEmailSettings HERE 4 ')
        this.presentModalFeautureAvailableOnlyWithPlanC()
      }
    } else {
      // this.logger.log('goToManageEmailSettings HERE 5 ')
      this.presentModalOnlyOwnerCanManageTSMTPsettings()
    }
  }


  presentModalFeautureAvailableOnlyWithPlanC() {
    // this.logger.log('here presentModalFeautureAvailableOnlyWithPlanC')
    // const el = document.createElement('div')
    // el.innerHTML = this.cPlanOnly
    Swal.fire({
      // content: el,
      title: this.upgradePlan,
      text: this.cPlanOnly,
      showCloseButton: false,
      showCancelButton: true,
      confirmButtonText: this.upgradePlan,
      cancelButtonText: this.cancel,
      confirmButtonColor: "var(--blue-light)",
      focusConfirm: true,
      reverseButtons: true,
      icon: "info",

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
        // this.logger.log('featureAvailableFromPlanC value', value, 'this.profile_name', this.profile_name)
        if (this.isVisiblePaymentTab) {
          if (this.USER_ROLE === 'owner') {
            if (this.prjct_profile_type === 'payment' && this.subscription_is_active === true) {
              if (this.profile_name === PLAN_NAME.A || this.profile_name === PLAN_NAME.B || this.profile_name === PLAN_NAME.D || this.profile_name === PLAN_NAME.E || this.profile_name === PLAN_NAME.EE) {
                // this.logger.log('HERE Y')
                this.notify._displayContactUsModal(true, 'upgrade_plan');
              }
            } else if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {

              if (this.profile_name === PLAN_NAME.A || this.profile_name === PLAN_NAME.B || this.profile_name === PLAN_NAME.D || this.profile_name === PLAN_NAME.E || this.profile_name === PLAN_NAME.EE) {
                // this.logger.log('HERE Y')
                this.notify.displaySubscripionHasExpiredModal(true, this.profile_name, this.subscription_end_date)
              }

            } else if (this.prjct_profile_type === 'free') {
              this.router.navigate(['project/' + this.id_project + '/pricing']);

            }
          } else {
            this.presentModalOnlyOwnerCanManageTheAccountPlan();
          }
        } else {
          this.notify._displayContactUsModal(true, 'upgrade_plan');
        }
      }
    });
  }

  presentModalOnlyOwnerCanManageEmailTempalte() {
    // https://github.com/t4t5/sweetalert/issues/845
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyOwnerCanManageEmailTempalte, this.learnMoreAboutDefaultRoles)
  }

  presentModalOnlyOwnerCanManageTheAccountPlan() {
    // https://github.com/t4t5/sweetalert/issues/845
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyOwnerCanManageTheAccountPlanMsg, this.learnMoreAboutDefaultRoles)
  }

  presentModalOnlyOwnerCanManageAdvancedProjectSettings() {
    this.notify.presentModalOnlyOwnerCanManageAdvancedProjectSettings(this.onlyUserWithOwnerRoleCanManageAdvancedProjectSettings, this.learnMoreAboutDefaultRoles)
  }

  presentModalAgentCannotManageAvancedSettings() {
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyOwnerCanManageAdvancedProjectSettings, this.learnMoreAboutDefaultRoles)
  }

  presentModalAgentCannotManageSmartAssigment() { }

  presentModalOnlyOwnerCanManageTSMTPsettings() {
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyUsersWithTheOwnerRoleCanManageSMTPsettings, this.learnMoreAboutDefaultRoles)
  }


  // "SubscriptionSuccessfullyCanceled":"Abbonamento annullato correttamente",
  // "AnErrorOccurredWhileCancellingSubscription": "Si è verificato un errore durante l'annullamento dell'abbonamento",
  // TRANSLATION
  translateMsgSubscriptionCanceledSuccessfully() {
    this.translate.get('SubscriptionSuccessfullyCanceled')
      .subscribe((text: string) => {
        this.subscriptionCanceledSuccessfully = text;
      });
  }

  translateMsgSubscriptionCanceledError() {
    this.translate.get('AnErrorOccurredWhileCancellingSubscription')
      .subscribe((text: string) => {
        this.subscriptionCanceledError = text;
      });
  }

  translateAvailableWithPlusOrCustomPlan(planName) {
    // let planName = ""
    //   if (this.profile_name === PLAN_NAME.A || this.profile_name === PLAN_NAME.B || this.profile_name === 'free') {
    //     planName = PLAN_NAME.C
    //     this.logger.log('[PRJCT-EDIT-ADD] AvailableWithThePlan here 1 planName ', planName) 
    //   } else if (this.profile_name === PLAN_NAME.D || this.profile_name === PLAN_NAME.E || this.profile_name === 'Sandbox') {
    //     planName = PLAN_NAME.F
    //     this.logger.log('[PRJCT-EDIT-ADD] AvailableWithThePlan here 2 planName ', planName) 
    //   }
    this.translate.get('AvailableWithThePlan', { plan_name: planName })
      .subscribe((translation: any) => {
        this.logger.log('[PRJCT-EDIT-ADD] AvailableWithThePlan translation ', translation)
        this.cPlanOnly = translation;
      });
  }

  SMTPsettingsValue() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    // this.logger.log('[WIDGET-SET-UP] getAppConfig  public_Key', this.public_Key);
    // this.logger.log('[WIDGET-SET-UP] getAppConfig  public_Key type of', typeof this.public_Key);
    // this.logger.log('[WIDGET-SET-UP] getAppConfig  this.public_Key.includes("WUN") ', this.public_Key.includes("WUN"));
    // let substring = this.public_Key.substring(this.public_Key.indexOf('WUN'));
    let parts = this.public_Key.split('-');
    // this.logger.log('[WIDGET-SET-UP] getAppConfig  parts ', parts);

    let mts = parts.find((part) => part.startsWith('MTS'));
    this.logger.log('[PRJCT-EDIT-ADD] getAppConfig  mts ', mts);
    let mtsParts = mts.split(':');
    this.logger.log('[PRJCT-EDIT-ADD] getAppConfig  mtsParts ', mtsParts);
    let mtsValue = mtsParts[1]
    this.logger.log('[PRJCT-EDIT-ADD] getAppConfig  mtsValue ', mtsValue);
    if (mtsValue === 'T') {
      return true
    } else if (mtsValue === 'F') {
      return false
    }

  }

  manageSmtpSettingsVisibility(projectProfileData) {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    if (projectProfileData['customization']) {
      this.logger.log('[PRJCT-EDIT-ADD] USECASE EXIST customization > SMTPsettings (1)', projectProfileData['customization']['smtpSettings'])
    }

    if (projectProfileData['customization'] && projectProfileData['customization']['smtpSettings'] !== undefined) {
      this.logger.log('[PRJCT-EDIT-ADD] USECASE A EXIST customization ', projectProfileData['customization'], ' & smtpSettings', projectProfileData['customization']['smtpSettings'])

      if (projectProfileData['customization']['smtpSettings'] === true) {
        this.isVisibleSMTPsettings = true;
        this.logger.log('[PRJCT-EDIT-ADD] SMTP Settings USECASE A isVisibleSMTPsettings', this.isVisibleSMTPsettings)
      } else if (projectProfileData['customization']['smtpSettings'] === false) {

        this.isVisibleSMTPsettings = false;
        this.logger.log('[PRJCT-EDIT-ADD] SMTP Settings USECASE A isVisibleSMTPsettings', this.isVisibleSMTPsettings)
      }

    } else if (projectProfileData['customization'] && projectProfileData['customization']['smtpSettings'] === undefined) {
      this.logger.log('PRJCT-EDIT-ADD] USECASE B EXIST customization ', projectProfileData['customization'], ' BUT smtpSettings IS', projectProfileData['customization']['smtpSettings'])

      if (this.public_Key.includes("MTS")) {
        this.logger.log('[PRJCT-EDIT-ADD] SMTP Settings  USECASE B  (from FT) - EXIST MTS ', this.public_Key.includes("MTS"));

        this.isVisibleSMTPsettings = this.SMTPsettingsValue()
        this.logger.log('[PRJCT-EDIT-ADD]  this.isVisibleSMTPsettings from FT ', this.isVisibleSMTPsettings)

      } else if (!this.public_Key.includes("MTS")) {
        this.logger.log('[PRJCT-EDIT-ADD] SMTP Settings  USECASE B (from FT) -  EXIST MTS ', this.public_Key.includes("MTS"));
        this.isVisibleSMTPsettings = false;
        this.logger.log('[PRJCT-EDIT-ADD] SMTP Settings  USECASE B (from FT) isVisibleSMTPsettings', this.isVisibleSMTPsettings);
      }

    } else if (projectProfileData['customization'] === undefined) {
      this.logger.log('[PRJCT-EDIT-ADD] USECASE C customization is  ', projectProfileData['customization'], 'get value foem FT')
      if (this.public_Key.includes("MTS")) {
        this.logger.log('[PRJCT-EDIT-ADD] SMTP Settings  USECASE B  (from FT) - EXIST MTS ', this.public_Key.includes("MTS"));

        this.isVisibleSMTPsettings = this.SMTPsettingsValue()
        this.logger.log('[PRJCT-EDIT-ADD]  this.isVisibleSMTPsettings from FT ', this.isVisibleSMTPsettings)

      } else if (!this.public_Key.includes("MTS")) {
        this.logger.log('[PRJCT-EDIT-ADD] SMTP Settings  USECASE B (from FT) -  EXIST MTS ', this.public_Key.includes("MTS"));
        this.isVisibleSMTPsettings = false;
        this.logger.log('[WPRJCT-EDIT-ADD] WSMTP Settings  USECASE B (from FT) isVisibleWidgetUnbranding', this.isVisibleSMTPsettings);
      }

    }
  }



  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      //  this.logger.log('[PRJCT-EDIT-ADD] - getProjectPlan project Profile Data', projectProfileData)
      if (projectProfileData) {
        this.prjct_name = projectProfileData.name;
        this.logger.log('[PRJCT-EDIT-ADD] - getProjectPlan prjct_name', this.prjct_name);

        this.profile_name = projectProfileData.profile_name;
        this.logger.log('[PRJCT-EDIT-ADD] - getProjectPlan profile_name', this.profile_name);

        this.prjct_trial_expired = projectProfileData.trial_expired;
        this.logger.log('[PRJCT-EDIT-ADD] - getProjectPlan prjct_trial_expired', this.prjct_trial_expired);

        this.prjc_trial_days_left = projectProfileData.trial_days_left;
        this.logger.log('[PRJCT-EDIT-ADD] - getProjectPlan prjc_trial_days_left', this.prjc_trial_days_left);

        this.subscription_is_active = projectProfileData.subscription_is_active;
        this.logger.log('[PRJCT-EDIT-ADD] - getProjectPlan subscription_is_active', this.subscription_is_active);

        this.subscription_end_date = projectProfileData.subscription_end_date;
        this.logger.log('[PRJCT-EDIT-ADD] - getProjectPlan subscription_end_date', this.subscription_end_date)

        this.subscription_start_date = projectProfileData.subscription_start_date;
        this.logger.log('[PRJCT-EDIT-ADD] - getProjectPlan subscription_start_date', this.subscription_start_date);

        this.prjct_profile_type = projectProfileData.profile_type;
        this.logger.log('[PRJCT-EDIT-ADD] - getProjectPlan prjct_profile_type', this.prjct_profile_type)

        // this.getOSCODE(projectProfileData)

        this.manageSmtpSettingsVisibility(projectProfileData)

        if (projectProfileData.subscription_creation_date) {
          this.subscription_creation_date = projectProfileData.subscription_creation_date;
        }
        // else {
        //   this.subscription_creation_date = projectProfileData.subscription_start_date;
        // }
        this.logger.log('[PRJCT-EDIT-ADD] - getProjectPlan subscription_creation_date', this.subscription_creation_date)
        this.logger.log('[PRJCT-EDIT-ADD] - getProjectPlan subscription_creation_date typeof', typeof this.subscription_creation_date)

        if (projectProfileData.subscription_id) {
          this.subscription_id = projectProfileData.subscription_id;
          this.logger.log('[PRJCT-EDIT-ADD] - subscription_id ', this.subscription_id);
          if (this.subscription_id.startsWith('sub_')) {
            this.isSripeSub = true;
            this.logger.log('[PRJCT-EDIT-ADD] - is a stripe subscription ', this.isSripeSub);
          } else {
            this.isSripeSub = false;
            this.logger.log('[PRJCT-EDIT-ADD] - NOT is a stripe subscription ', this.isSripeSub);
          }
        } else {
          this.isSripeSub = false;
          this.logger.log('[PRJCT-EDIT-ADD] - NOT is a stripe subscription ', this.isSripeSub);
        }

        if (projectProfileData.extra3) {
          this.appSumoProfile = APP_SUMO_PLAN_NAME[projectProfileData.extra3]
          this.logger.log('[PRJCT-EDIT-ADD] - GET PROJECT PLAN  appSumoProfile ', this.appSumoProfile)
        }

        if (projectProfileData.extra4) {
          this.appSumoInvoiceUUID = projectProfileData.extra4
          this.logger.log('[PRJCT-EDIT-ADD] - GET PROJECT PLAN  appSumoInvoiceUUID ', this.appSumoInvoiceUUID)
        }

        if (projectProfileData.extra3 === 'tiledesk_tier1' || projectProfileData.extra3 === 'tiledesk_tier2') {
          this.tParamsFeatureAvailableWith = { plan_name: PLAN_NAME.F }
          this.translateAvailableWithPlusOrCustomPlan(PLAN_NAME.F)
          this.planFeatures = featuresPlanA;
          if (projectProfileData.extra3 === 'tiledesk_tier1') {
            this.highlightedFeatures = appSumoHighlightedFeaturesPlanATier1;
          } else if (projectProfileData.extra3 === 'tiledesk_tier2') {
            this.highlightedFeatures = appSumoHighlightedFeaturesPlanATier2;
          }
        }
        else if (projectProfileData.extra3 === 'tiledesk_tier3' || projectProfileData.extra3 === 'tiledesk_tier4') {
          this.tParamsFeatureAvailableWith = { plan_name: PLAN_NAME.F }
          this.translateAvailableWithPlusOrCustomPlan(PLAN_NAME.F)
          this.planFeatures = featuresPlanA;
          if (projectProfileData.extra3 === 'tiledesk_tier3') {
            this.highlightedFeatures = appSumoHighlightedFeaturesPlanATier3;
          } else if (projectProfileData.extra3 === 'tiledesk_tier4') {
            this.highlightedFeatures = appSumoHighlightedFeaturesPlanATier4;
          }
        }


        // this.prjct_profile_type = projectProfileData.profile_type;
        // this.logger.log('[PRJCT-EDIT-ADD] - getProjectPlan project Profile Data > prjct_profile_type', this.prjct_profile_type)

        if (this.profile_name === PLAN_NAME.C && this.subscription_is_active === true || this.profile_name === PLAN_NAME.F && this.subscription_is_active === true) {
          this.advancedSettingBtnDisabled = false
        } else if (this.profile_name === PLAN_NAME.C && this.subscription_is_active === false || this.profile_name === PLAN_NAME.F && this.subscription_is_active === false) {
          this.advancedSettingBtnDisabled = true

        } else if (this.profile_name !== PLAN_NAME.C && this.profile_name !== PLAN_NAME.F) {
          this.advancedSettingBtnDisabled = true
        }
        if (projectProfileData.profile_type === 'free') {
          if (projectProfileData.trial_expired === false) {
            if (this.profile_name === 'free') {
              this.prjct_profile_name = PLAN_NAME.B + " (trial)"
              this.seatsLimit = PLAN_SEATS[PLAN_NAME.B]
              this.tParamsPlanAndSeats = { plan_name: this.prjct_profile_name, allowed_seats_num: this.seatsLimit }
              this.tParamsFeatureAvailableWith = { plan_name: PLAN_NAME.F }
              this.translateAvailableWithPlusOrCustomPlan(PLAN_NAME.F)
            } else if (this.profile_name === 'Sandbox') {
              this.prjct_profile_name = PLAN_NAME.E + " (trial)"
              this.seatsLimit = PLAN_SEATS[PLAN_NAME.E]
              this.tParamsPlanAndSeats = { plan_name: this.prjct_profile_name, allowed_seats_num: this.seatsLimit }
              this.tParamsFeatureAvailableWith = { plan_name: PLAN_NAME.F }
              this.translateAvailableWithPlusOrCustomPlan(PLAN_NAME.F)
            }
          } else {
            if (this.profile_name === 'free') {
              this.prjct_profile_name = "Free plan";
              this.seatsLimit = PLAN_SEATS.free
              this.tParamsPlanAndSeats = { plan_name: 'Free', allowed_seats_num: this.seatsLimit }
              this.tParamsFeatureAvailableWith = { plan_name: PLAN_NAME.F }
              this.translateAvailableWithPlusOrCustomPlan(PLAN_NAME.F)
              this.translationParams = { plan_name: PLAN_NAME.B } // Scale


            } else if (this.profile_name === 'Sandbox') {
              this.prjct_profile_name = "Sandbox";
              this.seatsLimit = PLAN_SEATS.free
              this.tParamsPlanAndSeats = { plan_name: 'Sandbox', allowed_seats_num: this.seatsLimit }
              this.tParamsFeatureAvailableWith = { plan_name: PLAN_NAME.F }
              this.translateAvailableWithPlusOrCustomPlan(PLAN_NAME.F)
              this.translationParams = { plan_name: PLAN_NAME.E } // Premium
            }
          }
        } else if (projectProfileData.profile_type === 'payment') {
          if (this.subscription_is_active === true) {
            if (projectProfileData.profile_name === PLAN_NAME.A) {
              if (!this.appSumoProfile) {
                this.prjct_profile_name = PLAN_NAME.A + " plan";
                this.seatsLimit = PLAN_SEATS[PLAN_NAME.A]
                this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.A, allowed_seats_num: this.seatsLimit }
                this.logger.log('[PRJCT-EDIT-ADD] - GET PROJECT PLAN - PLAN_NAME ', PLAN_NAME.A, ' SEATS LIMIT: ', this.seatsLimit)
                this.tParamsFeatureAvailableWith = { plan_name: PLAN_NAME.F }
                this.translateAvailableWithPlusOrCustomPlan(PLAN_NAME.F)
              } else {
                this.prjct_profile_name = PLAN_NAME.A + ' plan ' + '(' + this.appSumoProfile + ')'
                this.seatsLimit = APPSUMO_PLAN_SEATS[projectProfileData.extra3];
                this.tParamsPlanAndSeats = { plan_name: this.prjct_profile_name, allowed_seats_num: this.seatsLimit }
              }
            } else if (projectProfileData.profile_name === PLAN_NAME.B) {
              if (!this.appSumoProfile) {
                this.prjct_profile_name = PLAN_NAME.B + " plan";
                this.seatsLimit = PLAN_SEATS[PLAN_NAME.B]
                this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.B, allowed_seats_num: this.seatsLimit };
                this.tParamsFeatureAvailableWith = { plan_name: PLAN_NAME.F }
                this.translateAvailableWithPlusOrCustomPlan(PLAN_NAME.F)
                // this.logger.log('[PRJCT-EDIT-ADD] - GET PROJECT PLAN - PLAN_NAME ', PLAN_NAME.B, ' SEATS LIMIT: ', this.seatsLimit)
              } else {
                this.prjct_profile_name = PLAN_NAME.B + ' plan ' + '(' + this.appSumoProfile + ')'
                this.seatsLimit = APPSUMO_PLAN_SEATS[projectProfileData.extra3];
                this.tParamsPlanAndSeats = { plan_name: this.prjct_profile_name, allowed_seats_num: this.seatsLimit }
              }
            } else if (projectProfileData.profile_name === PLAN_NAME.C) {
              this.prjct_profile_name = PLAN_NAME.C + " plan";
              this.seatsLimit = projectProfileData.profile_agents
              this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.C, allowed_seats_num: this.seatsLimit }
              // this.logger.log('[PRJCT-EDIT-ADD] - GET PROJECT PLAN - PLAN_NAME ', PLAN_NAME.C, ' SEATS LIMIT: ', this.seatsLimit)
            } else if (projectProfileData.profile_name === PLAN_NAME.D) {
              this.prjct_profile_name = PLAN_NAME.D + " plan";
              this.seatsLimit = projectProfileData.profile_agents
              this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.D, allowed_seats_num: this.seatsLimit }
              this.tParamsFeatureAvailableWith = { plan_name: PLAN_NAME.F }
              this.translateAvailableWithPlusOrCustomPlan(PLAN_NAME.F)
              // this.logger.log('[PRJCT-EDIT-ADD] - GET PROJECT PLAN - PLAN_NAME ', PLAN_NAME.C, ' SEATS LIMIT: ', this.seatsLimit)
            } else if (projectProfileData.profile_name === PLAN_NAME.E) {
              this.prjct_profile_name = PLAN_NAME.E + " plan";
              this.seatsLimit = projectProfileData.profile_agents
              this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.E, allowed_seats_num: this.seatsLimit }
              this.tParamsFeatureAvailableWith = { plan_name: PLAN_NAME.F }
              this.translateAvailableWithPlusOrCustomPlan(PLAN_NAME.F)

            } else if (projectProfileData.profile_name === PLAN_NAME.EE) {
              this.prjct_profile_name = PLAN_NAME.EE + " plan";
              this.seatsLimit = projectProfileData.profile_agents
              this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.EE, allowed_seats_num: this.seatsLimit }
              this.tParamsFeatureAvailableWith = { plan_name: PLAN_NAME.F }
              this.translateAvailableWithPlusOrCustomPlan(PLAN_NAME.F)
              // this.logger.log('[PRJCT-EDIT-ADD] - GET PROJECT PLAN - PLAN_NAME ', PLAN_NAME.C, ' SEATS LIMIT: ', this.seatsLimit)
            } else if (projectProfileData.profile_name === PLAN_NAME.F) {
              this.prjct_profile_name = PLAN_NAME.F + " plan";
              this.seatsLimit = projectProfileData.profile_agents
              this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.F, allowed_seats_num: this.seatsLimit }
              // this.logger.log('[PRJCT-EDIT-ADD] - GET PROJECT PLAN - PLAN_NAME ', PLAN_NAME.C, ' SEATS LIMIT: ', this.seatsLimit)
            }

          } else if (this.subscription_is_active === false) {
            this.seatsLimit = PLAN_SEATS.free
            if (projectProfileData.profile_name === PLAN_NAME.A) {
              this.prjct_profile_name = PLAN_NAME.A + " plan";
              this.seatsLimit = PLAN_SEATS[PLAN_NAME.A]
              this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.A, allowed_seats_num: this.seatsLimit }
              this.tParamsFeatureAvailableWith = { plan_name: PLAN_NAME.F }
              this.translateAvailableWithPlusOrCustomPlan(PLAN_NAME.F)
              // this.logger.log('[PRJCT-EDIT-ADD] - GET PROJECT PLAN - PLAN_NAME ', PLAN_NAME.A, ' SEATS LIMIT: ', this.seatsLimit)

            } else if (projectProfileData.profile_name === PLAN_NAME.B) {
              this.prjct_profile_name = PLAN_NAME.B + " plan";
              this.seatsLimit = PLAN_SEATS[PLAN_NAME.B]
              this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.B, allowed_seats_num: this.seatsLimit }
              this.tParamsFeatureAvailableWith = { plan_name: PLAN_NAME.F }
              this.translateAvailableWithPlusOrCustomPlan(PLAN_NAME.F)
              // this.logger.log('[PRJCT-EDIT-ADD] - GET PROJECT PLAN - PLAN_NAME ', PLAN_NAME.B, ' SEATS LIMIT: ', this.seatsLimit)

            } else if (projectProfileData.profile_name === PLAN_NAME.C) {
              this.prjct_profile_name = PLAN_NAME.C + " plan";
              this.seatsLimit = projectProfileData.profile_agents
              this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.C, allowed_seats_num: this.seatsLimit }
              this.tParamsFeatureAvailableWith = { plan_name: PLAN_NAME.F }
              this.translateAvailableWithPlusOrCustomPlan(PLAN_NAME.F)
              // this.logger.log('[PRJCT-EDIT-ADD] - GET PROJECT PLAN - PLAN_NAME ', PLAN_NAME.C, ' SEATS LIMIT: ', this.seatsLimit)
            } else if (projectProfileData.profile_name === PLAN_NAME.D) {
              this.prjct_profile_name = PLAN_NAME.D + " plan";
              this.seatsLimit = projectProfileData.profile_agents
              this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.D, allowed_seats_num: this.seatsLimit }
              // this.logger.log('[PRJCT-EDIT-ADD] - GET PROJECT PLAN - PLAN_NAME ', PLAN_NAME.C, ' SEATS LIMIT: ', this.seatsLimit)
              this.tParamsFeatureAvailableWith = { plan_name: PLAN_NAME.F }
              this.translateAvailableWithPlusOrCustomPlan(PLAN_NAME.F)
            } else if (projectProfileData.profile_name === PLAN_NAME.E) {
              this.prjct_profile_name = PLAN_NAME.E + " plan";
              this.seatsLimit = projectProfileData.profile_agents
              this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.E, allowed_seats_num: this.seatsLimit }
              this.tParamsFeatureAvailableWith = { plan_name: PLAN_NAME.F }
              this.translateAvailableWithPlusOrCustomPlan(PLAN_NAME.F)
              // this.logger.log('[PRJCT-EDIT-ADD] - GET PROJECT PLAN - PLAN_NAME ', PLAN_NAME.C, ' SEATS LIMIT: ', this.seatsLimit)
            } else if (projectProfileData.profile_name === PLAN_NAME.EE) {
              this.prjct_profile_name = PLAN_NAME.EE + " plan";
              this.seatsLimit = projectProfileData.profile_agents
              this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.EE, allowed_seats_num: this.seatsLimit }
              this.tParamsFeatureAvailableWith = { plan_name: PLAN_NAME.F }
              this.translateAvailableWithPlusOrCustomPlan(PLAN_NAME.F)
              // this.logger.log('[PRJCT-EDIT-ADD] - GET PROJECT PLAN - PLAN_NAME ', PLAN_NAME.C, ' SEATS LIMIT: ', this.seatsLimit)
            } else if (projectProfileData.profile_name === PLAN_NAME.F) {
              this.prjct_profile_name = PLAN_NAME.F + " plan";
              this.seatsLimit = projectProfileData.profile_agents
              this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.F, allowed_seats_num: this.seatsLimit }
              this.tParamsFeatureAvailableWith = { plan_name: PLAN_NAME.F }
              this.translateAvailableWithPlusOrCustomPlan(PLAN_NAME.F)
              // this.logger.log('[PRJCT-EDIT-ADD] - GET PROJECT PLAN - PLAN_NAME ', PLAN_NAME.C, ' SEATS LIMIT: ', this.seatsLimit)
            }
          }
        }


        const today = moment().startOf('day')

        // RETURN THE CURRENT DAY AT THE CURRENT TIME
        // const today = moment();
        // 2019-09-20T08:48:07.000Z
        const current_sub_end_date = moment(this.subscription_end_date)
        this.logger.log('[PRJCT-EDIT-ADD] - getProjectPlan project Profile Data ', today);
        this.logger.log('[PRJCT-EDIT-ADD] - getProjectPlan project Profile Data current_sub_end_date ', current_sub_end_date);

        this.days_to_next_renew = current_sub_end_date.diff(today, 'days');
        this.logger.log('[PRJCT-EDIT-ADD] - getProjectPlan project Profile Data days_to_next_renew ', this.days_to_next_renew);

        if (this.days_to_next_renew === 0) {

          this.timeOfNextRenew = moment(current_sub_end_date).format('HH.mm')
          this.logger.log('[PRJCT-EDIT-ADD] - getProjectPlan project Profile Data timeOfNextRenew ', this.timeOfNextRenew);
        }

        // USE CASE 'BUFFER DAYS': WHEN THE SUBSCRIPTION IS EXPIRED WE ADD 3 DAYS TO THE SUB END DATE
        // WHEN days_to_next_renew IS = -3 OR > 3 THE SUBSCRIPTION IS NOT ACTIVE
        // WHEN days_to_next_renew IS = 0 THE SUBSCRIPTION IS ACTIVE
        // WHEN days_to_next_renew IS = -1 OR = -2 THE STRIPE SUBCRIPTION IS EXPIRED BUT WE NOT STILL LOCKED THE PRO FEATURE
        if (this.days_to_next_renew === -1 || this.days_to_next_renew === -2) {

          this.SUBSCRIPTION_BUFFER_DAYS = true;
          this.logger.log('[PRJCT-EDIT-ADD] - getProjectPlan days_to_next_renew ', this.days_to_next_renew, ' SUBSCRIPTION_BUFFER_DAYS ', this.SUBSCRIPTION_BUFFER_DAYS);
        } else {
          this.SUBSCRIPTION_BUFFER_DAYS = false;
          this.logger.log('[PRJCT-EDIT-ADD] - getProjectPlan days_to_next_renew ', this.days_to_next_renew, ' SUBSCRIPTION_BUFFER_DAYS ', this.SUBSCRIPTION_BUFFER_DAYS);
        }


        // for the Auto send transcript by email
        if (projectProfileData.profile_type === 'free') {
          if (projectProfileData.trial_expired === false) {
            this.DISPLAY_ADVANCED_TAB = true;
            this.isTier3Plans = false
            // this.logger.log('[WS-REQUESTS-MSGS] profile_type', projectProfileData.profile_type)
            // this.logger.log('[WS-REQUESTS-MSGS] displayChatRatings', this.DISPLAY_ADVANCED_TAB)
          } else {
            this.DISPLAY_ADVANCED_TAB = false;
            if (this.profile_name === 'Sandbox') {
              this.t_params = { 'plan_name': PLAN_NAME.D }
              this.isTier3Plans = false
            } else if (this.profile_name === 'free') {
              this.t_params = { 'plan_name': PLAN_NAME.D }
              this.isTier3Plans = false
            }
            // this.logger.log('[WS-REQUESTS-MSGS] profile_type', projectProfileData.profile_type)
            // this.logger.log('[WS-REQUESTS-MSGS] displayChatRatings', this.DISPLAY_ADVANCED_TAB)
          }
        } else if (projectProfileData.profile_type === 'payment') {
          if (projectProfileData.subscription_is_active === true) {
            this.DISPLAY_ADVANCED_TAB = true;

            if (this.profile_name === PLAN_NAME.A) {

              this.isTier3Plans = false

            } else if (this.profile_name === PLAN_NAME.B) {

              this.isTier3Plans = false

            } else if (this.profile_name === PLAN_NAME.C) {

              this.isTier3Plans = true

            } else if (this.profile_name === PLAN_NAME.D) {

              this.isTier3Plans = false

            } else if (this.profile_name === PLAN_NAME.E) {

              this.isTier3Plans = false

            } else if (this.profile_name === PLAN_NAME.EE) {

              this.isTier3Plans = false

            } else if (this.profile_name === PLAN_NAME.F) {

              this.isTier3Plans = true

            }

            // this.logger.log('[WS-REQUESTS-MSGS] profile_type', projectProfileData.profile_type)
            // this.logger.log('[WS-REQUESTS-MSGS] displayChatRatings', this.DISPLAY_ADVANCED_TAB)
          } else if (projectProfileData.subscription_is_active === false) {
            // this.logger.log('[WS-REQUESTS-MSGS] profile_type', projectProfileData.profile_type)
            this.DISPLAY_ADVANCED_TAB = false;

            if (this.profile_name === PLAN_NAME.A) {

              this.t_params = { 'plan_name': PLAN_NAME.D }
              this.isTier3Plans = false

            } else if (this.profile_name === PLAN_NAME.B) {

              this.t_params = { 'plan_name': PLAN_NAME.D }
              this.isTier3Plans = false

            } else if (this.profile_name === PLAN_NAME.C) {

              this.t_params = { 'plan_name': PLAN_NAME.D }
              this.isTier3Plans = false

            } else if (this.profile_name === PLAN_NAME.D) {

              this.t_params = { 'plan_name': PLAN_NAME.D }
              this.isTier3Plans = false

            } else if (this.profile_name === PLAN_NAME.E) {

              this.t_params = { 'plan_name': PLAN_NAME.D }
              this.isTier3Plans = false

            } else if (this.profile_name === PLAN_NAME.EE) {

              this.t_params = { 'plan_name': PLAN_NAME.D }
              this.isTier3Plans = false

            } else if (this.profile_name === PLAN_NAME.F) {

              this.t_params = { 'plan_name': PLAN_NAME.D }
              this.isTier3Plans = false

            }

            // this.logger.log('[WS-REQUESTS-MSGS] DISPLAY_ADVANCED_TAB', this.DISPLAY_ADVANCED_TAB)
          }
        }

        // ------------------------------------------------------------------------------------------------------------------------------------------------
        // If the subscription id is present in the project profile, the methods getSubscriptionPayments() getCustomerAndPaymentMethods() are executed
        // ------------------------------------------------------------------------------------------------------------------------------------------------
        this.logger.log('[PRJCT-EDIT-ADD] this.subscription_id ', this.subscription_id, ' before to run getSubscriptionPayments & getCustomerAndPaymentMethods')
        if (this.subscription_id && this.subscription_id.startsWith('sub_')) {
          // this.subscription_id = projectProfileData.subscription_id;
          // this.logger.log('[PRJCT-EDIT-ADD] this.subscription_id ', this.subscription_id)
          this.getSubscriptionPayments(projectProfileData.subscription_id);
          this.getCustomerAndPaymentMethods()
        }
      }
    }, error => {

      this.logger.error('[PRJCT-EDIT-ADD] - getProjectPlan - ERROR', error);
    }, () => {

      this.logger.log('[PRJCT-EDIT-ADD]] - getProjectPlan * COMPLETE *')

    });
  }


  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[PRJCT-EDIT-ADD] getAppConfig public_Key', this.public_Key);
    let keys = this.public_Key.split("-");
    this.logger.log('[PRJCT-EDIT-ADD] keys', keys)
    keys.forEach(key => {
      // this.logger.log('NavbarComponent public_Key key', key)
      if (key.includes("PAY")) {
        // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - key', key);
        let pay = key.split(":");
        // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - pay key&value', pay);
        if (pay[1] === "F") {
          this.isVisiblePaymentTab = false;
        } else {
          this.isVisiblePaymentTab = true;
        }
      }

      if (key.includes("PSA")) {
        // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - key', key);
        let psa = key.split(":");
        // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - pay key&value', psa);
        if (psa[1] === "F") {
          this.isVisibleSmartAssignmentTab = false;
        } else {
          this.isVisibleSmartAssignmentTab = true;
        }
      }

      if (key.includes("DEV")) {
        // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - key', key);
        let dev = key.split(":");
        // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - dev key&value', dev);
        if (dev[1] === "F") {
          this.isVisibleDeveloperTab = false;
        } else {
          this.isVisibleDeveloperTab = true;
        }
      }

      if (key.includes("NOT")) {
        // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - key', key);
        let not = key.split(":");
        // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - not key&value', not);
        if (not[1] === "F") {
          this.isVisibleNotificationTab = false;
        } else {
          this.isVisibleNotificationTab = true;
        }
      }

      if (key.includes("IPS")) {
        // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - key', key);
        let ips = key.split(":");
        //  this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - ips key&value', ips);
        if (ips[1] === "F") {
          this.isVisibleSecurityTab = false;
          // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - isVisibleSecurityTab', this.isVisibleSecurityTab);
        } else {
          this.isVisibleSecurityTab = true;
          // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - isVisibleSecurityTab', this.isVisibleSecurityTab);
        }
      }
      // Customize the notification email template
      if (key.includes("PET")) {
        // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - key', key);
        let pet = key.split(":");
        //  this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - ips key&value', ips);
        if (pet[1] === "F") {
          this.isVisibleCustomizeEmailTemplate = false;
          // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - isVisibleCustomizeEmailTemplate', this.isVisibleCustomizeEmailTemplate);
        } else {
          this.isVisibleCustomizeEmailTemplate = true;
          // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - isVisibleCustomizeEmailTemplate', this.isVisibleCustomizeEmailTemplate);
        }
      }
      // SMTP settings
      // if (this.public_Key.includes("MTS")) {
      //   this.logger.log('[PROJECT-EDIT-ADD] - includes MTS ');
      //   if (key.includes("MTS")) {
      //     // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - key', key);
      //     let mts = key.split(":");
      //     //  this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - ips key&value', ips);
      //     if (mts[1] === "F") {
      //       this.isVisibleSMTPsettings = false;
      //       // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - isVisibleSMTPsettings', this.isVisibleSMTPsettings);
      //     } else {
      //       this.isVisibleSMTPsettings = true;
      //       // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - isVisibleSMTPsettings', this.isVisibleSMTPsettings);
      //     }
      //   }
      // } else if (!this.public_Key.includes("MTS")) {
      //   this.logger.log('[PROJECT-EDIT-ADD] - NOT includes MTS ');
      //   this.isVisibleSMTPsettings = false;
      // }


      if (key.includes("BAN")) {
        // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - key', key);
        let mts = key.split(":");
        //  this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - ips key&value', ips);
        if (mts[1] === "F") {
          this.isVisibleBannedVisitor = false;
          // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - isVisibleBannedVisitor', this.isVisibleBannedVisitor);
        } else {
          this.isVisibleBannedVisitor = true;
          // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - isVisibleBannedVisitor', this.isVisibleBannedVisitor);
        }
      }

      // Auto send transcript by email 
      if (key.includes("AST")) {
        // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - key', key);
        let mts = key.split(":");
        //  this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - ips key&value', ips);
        if (mts[1] === "F") {
          this.isVisibleAutoSendTranscript = false;
          // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - isVisibleAutoSendTranscript', this.isVisibleAutoSendTranscript);
        } else {
          this.isVisibleAutoSendTranscript = true;
          // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - isVisibleAutoSendTranscript', this.isVisibleAutoSendTranscript);
        }
      }

      if (key.includes("VAU")) {
        // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - key', key);
        let vau = key.split(":");
        //  this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - ips key&value', ips);
        if (vau[1] === "F") {
          this.isVisibleVisitorAuthentication = false;
          // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - isVisibleVisitorAuthentication', this.isVisibleVisitorAuthentication);
        } else {
          this.isVisibleVisitorAuthentication = true;
          // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - isVisibleVisitorAuthentication', this.isVisibleVisitorAuthentication);
        }
      }
    });

    if (!this.public_Key.includes("PAY")) {
      // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - key.includes("PAY")', this.public_Key.includes("PAY"));
      this.isVisiblePaymentTab = false;
    }

    if (!this.public_Key.includes("VAU")) {
      // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - key.includes("VAU")', this.public_Key.includes("VAU"));
      this.isVisibleVisitorAuthentication = false;
    }

    if (!this.public_Key.includes("PSA")) {
      // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - key.includes("PSA")', this.public_Key.includes("PSA"));
      this.isVisibleSmartAssignmentTab = false;
    }

    if (!this.public_Key.includes("DEV")) {
      // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - key.includes("DEV")', this.public_Key.includes("DEV"));
      this.isVisibleDeveloperTab = false;
    }

    if (!this.public_Key.includes("NOT")) {
      // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - key.includes("NOT")', this.public_Key.includes("NOT"));
      this.isVisibleNotificationTab = false;
    }

    if (!this.public_Key.includes("IPS")) {
      //  this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - key.includes("IPS")', this.public_Key.includes("IPS"));
      this.isVisibleSecurityTab = false;
    }

    if (!this.public_Key.includes("PET")) {
      //  this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - key.includes("PET")', this.public_Key.includes("PET"));
      this.isVisibleCustomizeEmailTemplate = false;
    }

    // if (!this.public_Key.includes("MTS")) {
    //   // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - key.includes("MTS")', this.public_Key.includes("MTS"));
    //   this.isVisibleSMTPsettings = false;
    // }

    if (!this.public_Key.includes("BAN")) {
      // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - key.includes("BAN")', this.public_Key.includes("BAN"));
      this.isVisibleBannedVisitor = false;
    }

    if (!this.public_Key.includes("AST")) {
      // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - key.includes("AST")', this.public_Key.includes("AST"));
      this.isVisibleAutoSendTranscript = false;
    }
  }

  changeAppSumoProduct() {
    const el = document.createElement('div')
    el.innerHTML = "Hi Sumo-ling! After managing your subscription in AppSumo, refresh the page to see plan updates",

      swal({

        content: el,
        icon: "info",
        // buttons: true,
        buttons: {
          cancel: this.cancel,
          catch: {
            text: "Change Plan",
            value: "catch",
          },
        },
        dangerMode: false,
      }).then((value) => {
        if (value === 'catch') {
          // this.logger.log('featureAvailableFromPlanC value', value, 'this.profile_name', this.profile_name)

          if (this.USER_ROLE === 'owner') {
            const url = `https://appsumo.com/account/redemption/${this.appSumoInvoiceUUID}#change-plan`
            window.open(url, '_blank');

          } else {
            this.presentModalOnlyOwnerCanManageTheAccountPlan();
          }
        } else {
          this.notify._displayContactUsModal(true, 'upgrade_plan');
        }

      });

  }


  openModalSubsExpired() {
    if (this.isVisiblePaymentTab) {
      if (this.USER_ROLE === 'owner') {
        if (this.profile_name !== PLAN_NAME.C && this.profile_name !== PLAN_NAME.F) {
          this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
        } else {
          if (this.profile_name === PLAN_NAME.C || this.profile_name === PLAN_NAME.F) {

            this.notify.displayEnterprisePlanHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
          }
        }
      } else {
        this.presentModalOnlyOwnerCanManageTheAccountPlan();
      }
    } else {
      this.notify._displayContactUsModal(true, 'upgrade_plan');
    }
  }

  // GET THE SUBSCRIPTION PAYMENT SAVED IN OUR DB
  getSubscriptionPayments(subscription_id) {
    this.projectService.getSubscriptionPayments(subscription_id).subscribe((subscriptionPayments: any) => {
      this.logger.log('[PRJCT-EDIT-ADD] GET subscriptionPayments ', subscriptionPayments);

      this.subscriptionPaymentsLength = subscriptionPayments.length
      this.logger.log('[PRJCT-EDIT-ADD] GET subscriptionPayments Length ', this.subscriptionPaymentsLength);
      if (subscriptionPayments) {
        this.subscription_payments = [];
        subscriptionPayments.forEach((subscriptionPayment, index) => {
          this.logger.log('[PRJCT-EDIT-ADD] subscriptionPayment.stripe_event ', subscriptionPayment.stripe_event);

          if (subscriptionPayment.stripe_event === "checkout.session.completed") {
            this.subscription_creation_date = subscriptionPayment.object.start_date
            this.logger.log('[PRJCT-EDIT-ADD] -  subscriptionPayments (checkout.session.completed) > subscription creation date ', this.subscription_creation_date);
          }

          if (subscriptionPayment.stripe_event === 'invoice.payment_succeeded') {

            /**
             **! *** GET THE subscription_creation_date FROM THE SUBSCRIPTION PAYMENT OBJECT OF TYPE invoice.payment_succeeded ***
             *  AND billing_reason === 'subscription_create'
             */
            if (subscriptionPayment.object.data.object.billing_reason === 'subscription_create') {
              this.subscription_creation_date = subscriptionPayment.object.data.object.lines.data[0].period.start
              this.logger.log('[PRJCT-EDIT-ADD] -  subscriptionPayments (invoice.payment_succeeded subscription_create) > subscription creation date ', this.subscription_creation_date);
            }

            // get the last iteration in a _.forEach() loop

            this.plan_amount = subscriptionPayment.object.data.object.lines.data[0].plan.amount;
            this.logger.log('[PRJCT-EDIT-ADD] - subscriptionPayments plan_amount ', this.plan_amount);

            this.plan_interval = subscriptionPayment.object.data.object.lines.data[0].plan.interval;
            this.logger.log('[PRJCT-EDIT-ADD] - subscriptionPayments plan_interval ', this.plan_interval);

            const plan_description = subscriptionPayment.object.data.object.lines.data[0].description;
            this.logger.log('[PRJCT-EDIT-ADD] subscriptionPayment plan_description: ', plan_description);
            if (plan_description.indexOf('×') !== -1) {
              const planSubstring = plan_description.split('×').pop();
              this.logger.log('[PRJCT-EDIT-ADD] subscriptionPayment planSubstring: ', planSubstring);
              if (plan_description.indexOf('(') !== -1) {
                const planName = planSubstring.substring(0, planSubstring.indexOf('('));
                this.logger.log('[PRJCT-EDIT-ADD] subscriptionPayment planName: ', planName);
                subscriptionPayment.plan_name = planName.trim()
              }

              if (plan_description.indexOf('after') !== -1) {
                const planName = planSubstring.substring(0, planSubstring.indexOf('after'));
                this.logger.log('[PRJCT-EDIT-ADD] subscriptionPayment planName: ', planName);

                subscriptionPayment.plan_name = planName.trim()
              }
            } else {
              subscriptionPayment.plan_name = plan_description
            }
            this.subscription_payments.push(subscriptionPayment);
          }

        });
        this.logger.log('[PRJCT-EDIT-ADD] FILTERED subscriptionPayments ', this.subscription_payments);
      }
    }, (error) => {
      this.logger.error('[PRJCT-EDIT-ADD] - GET subscriptionPayments error ', error);
      this.showSpinner = false;
    }, () => {
      this.logger.log('[PRJCT-EDIT-ADD] - GET subscriptionPayments * COMPLETE * ');
      this.showSpinner = false;
    });
  }

  getCustomerAndPaymentMethods() {
    this.projectService.getStripeCustomer().subscribe((customer: any) => {
      this.logger.log('[PRJCT-EDIT-ADD] - GET STRIPE CUSTOMER & PAYMENT METHODS - customer ', customer);
      if (customer) {
        this.customer_id = customer.id
        this.logger.log('[PRJCT-EDIT-ADD] - GET STRIPE CUSTOMER & PAYMENT METHODS - customer id', this.customer_id);
        if (customer.invoice_settings && customer.invoice_settings.default_payment_method !== null) {
          this.customer_default_payment_method_id = customer.invoice_settings.default_payment_method
          this.logger.log('[PRJCT-EDIT-ADD] - GET STRIPE CUSTOMER & PAYMENT METHODS - customer_default_payment_method_id (from invoice_settings > default_payment_method)', this.customer_default_payment_method_id);
        } else {
          this.logger.log('[PRJCT-EDIT-ADD] - GET STRIPE CUSTOMER & PAYMENT METHODS - customer_default_payment_method_id (from invoice_settings > default_payment_method) 2', this.customer_default_payment_method_id);
          this.logger.log('[PRJCT-EDIT-ADD] - GET STRIPE CUSTOMER & PAYMENT METHODS - customer_default_payment_method_id (from customer > default_source) 2', customer.default_source);
          this.customer_default_payment_method_id = customer.default_source
        }
        this.logger.log('[PRJCT-EDIT-ADD] - GET STRIPE CUSTOMER & PAYMENT METHODS -  this.customer_default_payment_method_id', this.customer_default_payment_method_id);
        if (customer.paymentMethods) {
          customer.paymentMethods.data.forEach(paymentmethod => {
            this.logger.log('[PRJCT-EDIT-ADD] - GET STRIPE CUSTOMER & PAYMENT METHODS - customer >  paymentMethod ', paymentmethod);
            if (this.customer_default_payment_method_id !== null && this.customer_default_payment_method_id === paymentmethod.id) {
              this.logger.log('[PRJCT-EDIT-ADD] - GET STRIPE CUSTOMER & PAYMENT METHODS - customer > default paymentMethod ', paymentmethod);
              if (paymentmethod.card) {
                this.logger.log('[PRJCT-EDIT-ADD] - GET STRIPE CUSTOMER & PAYMENT METHODS - customer > default paymentMethod CARD', paymentmethod.card);
                this.default_card_brand_name = paymentmethod.card.brand;
                this.card_last_four_digits = paymentmethod.card.last4;
              }
            } else if (this.customer_default_payment_method_id === null) {
              if (paymentmethod.card) {
                // this.logger.log('[PRJCT-EDIT-ADD] - GET STRIPE CUSTOMER & PAYMENT METHODS - customer > NO default paymentMethod OT deafult source - CARD', paymentmethod.card);
                this.default_card_brand_name = paymentmethod.card.brand;
                this.card_last_four_digits = paymentmethod.card.last4;
              }
            }
          });
        }
      }
    }, (error) => {
      this.logger.error('[PRJCT-EDIT-ADD] - GET STRIPE CUSTOMER error ', error);

    }, () => {
      this.logger.log('[PRJCT-EDIT-ADD] - GET STRIPE CUSTOMER * COMPLETE * ');

    });
  }


  closePaymentMethodModal() {
    this.displayAddPaymentMethodModal = 'none';
  }

  openModalAddPaymentMethod() {
    this.displayAddPaymentMethodModal = 'block'

    this.DISPLAY_ADD_CARD_COMPLETED = false;
    this.logger.log('openModalAddPaymentMethod DISPLAY_ADD_CARD_COMPLETED ', this.DISPLAY_ADD_CARD_COMPLETED)
    this.CARD_HAS_ERROR = null;
    this.SPINNER_IN_ADD_CARD_MODAL = null;
    this.form.reset()

    if (this.ccNumberField) {
      const creditCardInput = this.ccNumberField.nativeElement;
      // this.logger.log('openModalAddPaymentMethod creditCardInput ', creditCardInput) 
      setTimeout(() => {
        creditCardInput.focus()
      }, 200);
    }
  }

  // https://stackoverflow.com/questions/50416301/angular-how-to-do-credit-card-input
  creditCardNumberSpacing() {
    const input = this.ccNumberField.nativeElement;
    const { selectionStart } = input;
    const { creditCard } = this.form.controls;
    this.logger.log('creditCardNumberSpacing creditCard value ', creditCard.value)
    if (creditCard.value) {
      let trimmedCardNum = creditCard.value.replace(/\s+/g, '');

      if (trimmedCardNum.length > 16) {
        trimmedCardNum = trimmedCardNum.substr(0, 16);
      }

      /* Handle American Express 4-6-5 spacing */
      const partitions = trimmedCardNum.startsWith('34') || trimmedCardNum.startsWith('37')
        ? [4, 6, 5]
        : [4, 4, 4, 4];

      const numbers = [];
      let position = 0;
      partitions.forEach(partition => {
        const part = trimmedCardNum.substr(position, partition);
        if (part) numbers.push(part);
        position += partition;
      })

      creditCard.setValue(numbers.join(' '));

      /* Handle caret position if user edits the number later */
      if (selectionStart < creditCard.value.length - 1) {
        input.setSelectionRange(selectionStart, selectionStart, 'none');
      }

      this.card_brand = this.creditCardTypeFromNumber(creditCard.value);
      this.logger.log('card_brand ', this.card_brand)
      if (this.card_brand === 'amex') {
        this.CVC_LENGHT = 4
      } else[
        this.CVC_LENGHT = 3
      ]
    }

    // this.creditCardNumberSpacing()
  }
  // https://stackoverflow.com/questions/30008556/regex-and-keyup-for-credit-card-detection
  // https://gist.github.com/michaelkeevildown/9096cd3aac9029c4e6e05588448a8841 (list of credit card regex)
  creditCardTypeFromNumber(num) {
    // Sanitise number  
    this.logger.log('creditCardTypeFromNumber num ', num)
    num = num.replace(/[^\d]/g, '');

    var regexps = {
      'mastercard': /^5[1-5][0-9]{5,}$/,
      'visa': /^4[0-9]{6,}$/,
      'amex': /^3[47][0-9]{5,}$/,
      'discover': /^6(?:011|5[0-9]{2})[0-9]{3,}$/,
      'diners': /^3(?:0[0-5]|[68][0-9])[0-9]{4,}$/,
      'jcb': /^(?:2131|1800|35[0-9]{3})[0-9]{3,}$/,
      'unionpay': /^(62[0-9]{14,17})$/,
      'unknown': /.*/,
    };

    for (var card in regexps) {
      if (num.match(regexps[card])) {
        this.logger.log(card);
        return card;
      }
    }
  }

  onPasteCreditCardNumber(event: ClipboardEvent) {
    const input = this.ccNumberField.nativeElement;
    const { selectionStart } = input;
    const { creditCard } = this.form.controls;
    let clipboardData = event.clipboardData;
    let pastedText = clipboardData.getData('text');
    this.logger.log('onPasteCreditCardNumber pastedText', pastedText)
    this.ccExpdateField.nativeElement.focus()
  }


  onSubmit(form) {
    this.logger.log('onSubmit form', form)
    this.submitted = true;
    this.logger.log('onSubmit form', form);
    if (form.expirationDate && form.expirationDate !== '') {
      const expirationDateSegment = form.expirationDate.split('/');
      this.logger.log('onSubmit expirationDateSegment', expirationDateSegment);
      const expirationDateMonth = expirationDateSegment[0].trim()
      const expirationDateYear = expirationDateSegment[1].trim()
      const creditcardnum = form.creditCard.replace(/\s/g, '')
      this.logger.log('onSubmit creditCard NUM', creditcardnum);

      this.logger.log('onSubmit expirationDateMonth', expirationDateMonth);
      this.logger.log('onSubmit expirationDateYear', expirationDateYear);
      const creditcardcvc = form.cvc
      this.logger.log('onSubmit cvc', creditcardcvc);


      this.updateCustomer(creditcardnum, expirationDateMonth, expirationDateYear, creditcardcvc)
    }
  }

  updateCustomer(creditcardnum: string, expirationDateMonth: string, expirationDateYear: string, creditcardcvc: string) {
    this.SPINNER_IN_ADD_CARD_MODAL = true;
    this.CARD_HAS_ERROR = null
    this.projectService.updateStripeCustomer(this.customer_id, creditcardnum, expirationDateMonth, expirationDateYear, creditcardcvc).subscribe((updatedcustomer: any) => {
      this.logger.log('[PRJCT-EDIT-ADD] - UPDATED CUSTOMER - customer ', updatedcustomer);


    }, (error) => {
      // this.logger.log('[PRJCT-EDIT-ADD] - UPDATED CUSTOMER error ', error);  
      // this.logger.log('[PRJCT-EDIT-ADD] - UPDATED CUSTOMER error _body', error._body);

      const error_body = error
      this.logger.error('[PRJCT-EDIT-ADD] - UPDATED CUSTOMER error_body ', error_body);
      this.logger.error('[PRJCT-EDIT-ADD] - UPDATED CUSTOMER error_body > msg ', error_body.msg);

      if (error_body && error_body.msg) {
        this.credit_card_error_msg = error_body.msg.raw.message;
        this.logger.error('[PRJCT-EDIT-ADD] - UPDATED CUSTOMER error_body > msg > raw ', error_body.msg.raw);
        this.logger.error('[PRJCT-EDIT-ADD] - UPDATED CUSTOMER credit_card_error_msg ', this.credit_card_error_msg);
        this.CARD_HAS_ERROR = true;
        this.SPINNER_IN_ADD_CARD_MODAL = false
        this.DISPLAY_ADD_CARD_COMPLETED = false
      } else if (error_body && !error_body.msg) {
        if (error_body && error_body.error && error_body.error && error_body.error.msg.code) {
          this.credit_card_error_msg = error_body.error.msg.code;
          this.CARD_HAS_ERROR = true;
          this.SPINNER_IN_ADD_CARD_MODAL = false
          this.DISPLAY_ADD_CARD_COMPLETED = false
        }
      }
    }, () => {
      this.logger.log('[PRJCT-EDIT-ADD] - UPDATED CUSTOMER * COMPLETE * ');
      this.CARD_HAS_ERROR = false;
      this.SPINNER_IN_ADD_CARD_MODAL = false
      this.DISPLAY_ADD_CARD_COMPLETED = true
      setTimeout(() => {
        this.getCustomerAndPaymentMethods();
      }, 0);
      this.getCustomerPaymentMethodsListAndDeleteNotDefault()
    });
  }

  getCustomerPaymentMethodsListAndDeleteNotDefault() {
    this.projectService.getCustomerPaymentMethodsList(this.customer_id).subscribe((paymentMethodsList: any) => {
      this.logger.log('[PRJCT-EDIT-ADD] - GET PAYMENT METHODS LIST paymentMethodsList ', paymentMethodsList);

    }, (error) => {
      this.logger.log('[PRJCT-EDIT-ADD] - GET PAYMENT METHODS LIST * ERROR *', error);

    }, () => {
      this.logger.log('[PRJCT-EDIT-ADD] - GET PAYMENT METHODS LIST * COMPLETE *');
    });

  }



  // createCardToken() {
  //   this.projectService.createCardToken().subscribe((token: any) => {
  //     this.logger.log('[PRJCT-EDIT-ADD] - CREATE CARD TOKEN - token ', token);
  //     if (token) {
  //       this.card_id = token.card.id
  //       this.logger.log('[PRJCT-EDIT-ADD] -  CREATE CARD TOKEN card_id ', this.card_id);
  //     }

  //   }, (error) => {
  //     this.logger.error('[PRJCT-EDIT-ADD] - CREATE CARD TOKEN error ', error);

  //   }, () => {
  //     this.logger.log('[PRJCT-EDIT-ADD] - CREATE CARD TOKEN * COMPLETE * ');

  //   });
  // }

  // createCustomerPortal() {
  //   this.projectService.createCustomerPortal().subscribe((customer: any) => {
  //     this.logger.log('[PRJCT-EDIT-ADD] - GET STRIPE CUSTOMER - customer ', customer);
  //     // if (customer ) {
  //     //   const customerId = 
  //     // }

  //   }, (error) => {
  //     this.logger.error('[PRJCT-EDIT-ADD] - GET STRIPE CUSTOMER error ', error);

  //   }, () => {
  //     this.logger.log('[PRJCT-EDIT-ADD] - GET STRIPE CUSTOMER * COMPLETE * ');

  //   });
  // }

  /**
   * *** CANCEL SUBSCRIPTION ***
   * * the callback cancelSubscription() IS RUNNED in NotificationMessageComponent when the user click on
   *   the modal button Cancel Subscription
   * * NotificationMessageComponent, through the notify service, publishes the progress status
   *   of the cancellation of the subscription
   * * the NavbarComponent is subscribed to cancelSubscriptionCompleted$ and, when hasDone === true,
   *   call prjctPlanService.getProjectByID() that get and publish (with prjctPlanService.projectPlan$) the updated project object
   * * this component is a subscriber of prjctPlanService.projectPlan$ so the UI is refreshed when the prjctPlanService publish projectPlan$
   */

  listenCancelSubscription() {
    this.notify.cancelSubscriptionCompleted$.subscribe((hasDone: boolean) => {

      this.logger.log('[PRJCT-EDIT-ADD] - (listenCancelSubscription) cancelSubscriptionCompleted hasDone', hasDone);
      if (hasDone === false) {
        this.showSpinner = true;
      }

      if (hasDone === true) {
        this.showSpinner = false;
        // this.prjct_profile_type = 'free'
      }
    });
  }



  goToPayments() {
    if (this.USER_ROLE === 'owner') {
      this.router.navigate(['project/' + this.id_project + '/payments']);
    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan();
    }
  }

  goToTeammates() {
    this.router.navigate(['project/' + this.id_project + '/users'])
  }

  // openLetsChatModal() {
  //   this.displayContactUsModal = 'block';
  //   this.logger.log('openLetsChatModal')
  // }
  getMoreOperatorsSeats() {
    if (this.USER_ROLE === 'owner') {
      this.notify._displayContactUsModal(true, 'upgrade_plan');
    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan();
    }
  }

  closeContactUsModal() {
    this.displayContactUsModal = 'none';
  }

  contactUs() {
    // if (window && window['tiledesk']) {
    //   window['tiledesk'].open();
    // }
    // window.open('mailto:' + this.contactUsEmail, 'mail')
    if (this.USER_ROLE === 'owner') {
      window.open(`mailto:${this.salesEmail}?subject=Upgrade plan`);
    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan()
    }
  }

  goToPricing() {
    if (this.isVisiblePaymentTab) {
      if (this.USER_ROLE === 'owner') {
        if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
          if (this.profile_name === PLAN_NAME.C) {
            this.notify.displayEnterprisePlanHasExpiredModal(true, PLAN_NAME.C + ' plan', this.subscription_end_date);
          } else if (this.profile_name === PLAN_NAME.F) {
            this.notify.displayEnterprisePlanHasExpiredModal(true, PLAN_NAME.F + ' plan', this.subscription_end_date);
          } else if (this.profile_name !== PLAN_NAME.C && this.profile_name !== PLAN_NAME.F) {
            // this.notify._displayContactUsModal(true, 'upgrade_plan');
            this.notify.displaySubscripionHasExpiredModal(true, this.profile_name, this.subscription_end_date);
          }
        } else if (this.prjct_profile_type === 'free') {
          this.router.navigate(['project/' + this.id_project + '/pricing']);
        } else if (
          this.profile_name === PLAN_NAME.A ||
          this.profile_name === PLAN_NAME.B ||
          this.profile_name === PLAN_NAME.D ||
          this.profile_name === PLAN_NAME.E ||
          this.profile_name === PLAN_NAME.EE ||
          this.prjct_profile_type === 'free'

        ) {
          this.logger.log('goToManageEmailSettings HERE 4 ')
          this.presentModalFeautureAvailableOnlyWithPlanC()
        }
      } else {
        this.presentModalOnlyOwnerCanManageTheAccountPlan();
      }
    } else {
      this.notify._displayContactUsModal(true, 'upgrade_plan');
    }
  }

  // !!! NO MORE USED - GO BACK TO PROJECT LIST
  goBackToProjectsList() {
    this.router.navigate(['/projects']);
  }

  goBack() {
    this._location.back();
  }

  getProjectId() {
    this.id_project = this.route.snapshot.params['projectid'];
    this.logger.log('[PRJCT-EDIT-ADD] - PROJECT COMPONENT HAS PASSED id_project ', this.id_project);
    if (this.id_project) {
      this.getProjectById();
    }
  }

  goToContactDetails(requester_id) {
    this.router.navigate(['project/' + this.projectId + '/contact', requester_id]);
  }

  getAllLeads(projectObject) {
    const bannedVisitors = []
    this.contactsService.getAllLeadsActiveWithLimit(10000)
      .subscribe((leads: any) => {

        const contacts = leads.leads
        this.logger.log('[PRJCT-EDIT-ADD] GET ALL LEADS ', contacts)

        for (var i = 0; i < contacts.length; i++) {
          if (contacts[i] && contacts[i].fullname) {
            contacts[i]['leadInitials'] = avatarPlaceholder(contacts[i].fullname);
            contacts[i].fillColour = getColorBck(contacts.fullname);
          } else {
            contacts[i]['leadInitials'] = 'N/A';
            contacts[i].fillColour = '#6264a7';
          }

          if (contacts[i] && contacts[i].email) {
            contacts[i]['leademail'] = contacts[i].email;
          } else {
            leads.leads[i]['leademail'] = 'n/a'
          }
          for (var j = 0; j < projectObject.bannedUsers.length; j++) {
            if (leads.leads[i].lead_id === projectObject.bannedUsers[j].id) {

              bannedVisitors.push({
                bannedUsers_Id: projectObject.bannedUsers[j]._id,
                bannedUsersId: projectObject.bannedUsers[j].id,
                leademail: leads.leads[i].leademail,
                leadInitials: leads.leads[i].leadInitials,
                fullname: leads.leads[i].fullname,
                fillColour: leads.leads[i].fillColour,
                requesterId: leads.leads[i]._id,
              });
            }
          }
        }

        this.logger.log('[PRJCT-EDIT-ADD] PROJECT bannedVisitors ', bannedVisitors)
        projectObject['bannedVisitors'] = bannedVisitors

      })
  }


  unbanVisitor(bannedUserId: string) {
    this.logger.log('[PRJCT-EDIT-ADD]  UNBAN VISITOR contact_id ', bannedUserId)
    this.projectService.unbanVisitor(bannedUserId).subscribe((res: any) => {
      this.logger.log('[PRJCT-EDIT-ADD]  UNBAN VISITOR  - RES ', res)
      // this.projectObject = res
    }, (error) => {
      this.logger.error('[PRJCT-EDIT-ADD] UNBAN VISITOR   - ERROR ', error);
      this.notify.showWidgetStyleUpdateNotification(this.thereHasBeenAnErrorProcessing, 4, 'report_problem');

    }, () => {
      this.logger.log('[PRJCT-EDIT-ADD] UNBAN VISITOR  * COMPLETE *');
      if (this.projectObject['bannedVisitors']) {
        for (var i = 0; i < this.projectObject['bannedVisitors'].length; i++) {
          if (this.projectObject['bannedVisitors'][i].bannedUsers_Id === bannedUserId) {
            this.projectObject['bannedVisitors'].splice(i, 1);
          }
        }
      }
    });
  }
  /**
   * *** GET PROJECT OBJECT BY ID (EDIT VIEW) ***
   * THE ID USED TO RUN THIS getMongDbBotById IS PASSED FROM BOTS LIST (BOTS COMPONENT goToEditAddPage_EDIT))
   * FROM THE BOT OBJECT IS USED:
   */
  getProjectById() {
    this.projectService.getProjectById(this.id_project).subscribe((project: any) => {
      this.logger.log('[PRJCT-EDIT-ADD] - GET PROJECT BY ID - PROJECT OBJECT: ', project);
      if (project) {
        this.projectObject = project;
        this.logger.log('[PRJCT-EDIT-ADD] - GET PROJECT BY ID - PROJECT OBJECT: ', this.projectObject);

        this.projectObject['bannedUsers'].forEach(bannedUser => {
          // this.logger.log('[PRJCT-EDIT-ADD] - GET PROJECT BY ID - bannedUser: ', bannedUser);
          this.getAllLeads(this.projectObject)

        });
        this.projectName_toUpdate = project.name;
        this.logger.log('[PRJCT-EDIT-ADD] - PROJECT NAME TO UPDATE: ', this.projectName_toUpdate);

        if (project.ipFilter) {
          let IP_filterArrayToString = project.ipFilter.toString()
          // this.logger.log('[PRJCT-EDIT-ADD] - IP FILTER ARRAY : ', IP_filterArrayToString);
          let IP_filterArrayToStringSpaced = IP_filterArrayToString.replace(/,/g, ', ');
          // this.logger.log('[PRJCT-EDIT-ADD] - IP FILTER ARRAY : ', IP_filterArrayToStringSpaced);
          this.allowedIPs = IP_filterArrayToStringSpaced
        }

        if (project.ipFilterEnabled) {
          this.ip_restrictions_on = project.ipFilterEnabled
        }
        // used in onProjectNameChange to enable / disable the 'update project name' btn
        this.project_name = project.name;

        if (project.settings) {
          this.logger.log('[PRJCT-EDIT-ADD] -  project.settings ', project.settings);
          this.logger.log('[PRJCT-EDIT-ADD] -  project.settings displayWidget ', project.settings.displayWidget);
          this.logger.log('[PRJCT-EDIT-ADD] -  project.settings .hasOwnProperty(displayWidget) ', project.settings.hasOwnProperty('displayWidget'));
          if (project.settings.hasOwnProperty('displayWidget')) {

            if (project.settings.displayWidget === true) {
              this.displaySupportWidget = true
              this.logger.log('[PRJCT-EDIT-ADD] - ON INIT displaySupportWidget IS ', project.settings.displayWidget);
            } else if (project.settings.displayWidget === false) {
              this.displaySupportWidget = false;
              this.logger.log('[PRJCT-EDIT-ADD] - ON INIT displaySupportWidget IS ', project.settings.displayWidget);
            }

          } else if (!project.settings.hasOwnProperty('displayWidget')) {
            this.displaySupportWidget = true
            this.logger.log('[PRJCT-EDIT-ADD] - ON INIT displaySupportWidget IS ', project.settings.displayWidget, 'so set to true displaySupportWidget ', this.displaySupportWidget);
          }

          if (project.settings.email) {

            if (project.settings.email.autoSendTranscriptToRequester === true) {
              this.logger.log('[PRJCT-EDIT-ADD] - ON INIT AUTO SEND TRANSCRIPT IS ', project.settings.email.autoSendTranscriptToRequester);

              this.AUTO_SEND_TRANSCRIPT_IS_ON = true;
              this.logger.log('[PRJCT-EDIT-ADD] - ON INIT AUTO SEND TRANSCRIPT IS ON ', this.AUTO_SEND_TRANSCRIPT_IS_ON);

            } else {
              this.AUTO_SEND_TRANSCRIPT_IS_ON = false;
              this.logger.log('[PRJCT-EDIT-ADD] - ON INIT AUTO SEND TRANSCRIPT IS ON ', this.AUTO_SEND_TRANSCRIPT_IS_ON);
            }

            // Check Notification Status - START
            if (project.settings.email.notification) {
              if (project.settings.email.notification.conversation) {

                if (project.settings.email.notification.conversation.assigned === true) {
                  this.assigned_conv_on = true;
                } else {
                  this.assigned_conv_on = false;
                }

                if (project.settings.email.notification.conversation.pooled === true) {
                  this.unassigned_conv_on = true;
                } else {
                  this.unassigned_conv_on = false;
                }

              }
            } else {
              this.assigned_conv_on = true;
              this.unassigned_conv_on = true;
            }
            // END

          } else {

            this.AUTO_SEND_TRANSCRIPT_IS_ON = false;
            this.assigned_conv_on = true;
            this.unassigned_conv_on = true;
            this.logger.log('[PRJCT-EDIT-ADD]- ON INIT AUTO SEND TRANSCRIPT IS ON ', this.AUTO_SEND_TRANSCRIPT_IS_ON);
          }


        } else {
          this.displaySupportWidget = true
          this.AUTO_SEND_TRANSCRIPT_IS_ON = false;
          this.assigned_conv_on = true;
          this.unassigned_conv_on = true;
          this.logger.log('[PRJCT-EDIT-ADD] - ON INIT AUTO SEND TRANSCRIPT IS ON ', this.AUTO_SEND_TRANSCRIPT_IS_ON);
        }


        // ------------------------------------------------------------
        // Advanced section properties
        // ------------------------------------------------------------

        // chat_limit_on: boolean;
        // reassignment_on: boolean;
        // automatic_unavailable_status_on: boolean;

        //       is_disabled_chat_limit_section: boolean;
        // is_disabled_reassignment_section: boolean;
        // is_disabled_unavailable_status_section: boolean;

        if (project.settings) {
          // Chat limit
          if (project.settings.max_agent_assigned_chat) {
            this.max_agent_assigned_chat = project.settings.max_agent_assigned_chat
          } else {
            this.max_agent_assigned_chat = 3
          }

          if (project.settings.chat_limit_on) {
            this.chat_limit_on = project.settings.chat_limit_on;
          } else {
            this.chat_limit_on = false;
          }

          // Reassignment
          if (project.settings.reassignment_delay) {
            this.reassignment_delay = project.settings.reassignment_delay
          } else {
            this.reassignment_delay = 300;
          }

          if (project.settings.reassignment_on) {
            this.reassignment_on = project.settings.reassignment_on
          } else {
            this.reassignment_on = false;
          }

          if (project.settings.current_agent_my_chats_only) {
            this.agents_can_see_only_own_convs = project.settings.current_agent_my_chats_only
          } else {
            this.agents_can_see_only_own_convs = false;
          }

          if (project.settings.chatbots_attributes_hidden) {
            this.areHideChatbotAttributesInConvDtls = project.settings.chatbots_attributes_hidden
          } else {
            this.areHideChatbotAttributesInConvDtls = false;
          }



          // Automatic unavailable status
          if (project.settings.automatic_idle_chats) {
            this.automatic_idle_chats = project.settings.automatic_idle_chats
          } else {
            this.automatic_idle_chats = 3;
          }

          if (project.settings.automatic_unavailable_status_on) {
            this.automatic_unavailable_status_on = project.settings.automatic_unavailable_status_on
          } else {
            this.automatic_unavailable_status_on = false;
          }


        } else {
          this.max_agent_assigned_chat = 3;
          this.reassignment_delay = 300;
          this.automatic_idle_chats = 3;
          this.chat_limit_on = false;
          this.reassignment_on = false;
          this.automatic_unavailable_status_on = false;
          this.agents_can_see_only_own_convs = false;
          this.areHideChatbotAttributesInConvDtls = false;
        }
      }

    }, (error) => {
      this.logger.error('[PRJCT-EDIT-ADD] - GET PROJECT BY ID - ERROR ', error);
      this.showSpinner = false;
    }, () => {
      this.logger.log('[PRJCT-EDIT-ADD] - GET PROJECT BY ID - COMPLETE ');
      this.showSpinner = false;
    });
  }


  toggleChat_limit_on($event) {

    if ($event.target.checked) {

      this.chat_limit_on = true;
      this.logger.log('[PRJCT-EDIT-ADD] - toggleChat_limit_on ', this.chat_limit_on);
    } else {

      this.chat_limit_on = false;
      this.logger.log('[PRJCT-EDIT-ADD] - toggleChat_limit_on ', this.chat_limit_on);
    }


  }

  toggleReassignment_on($event) {

    if ($event.target.checked) {

      this.reassignment_on = true;
      this.logger.log('[PRJCT-EDIT-ADD] - toggleReassignment_on ', this.reassignment_on);
    } else {

      this.reassignment_on = false;
      this.logger.log('[PRJCT-EDIT-ADD] - toggleReassignment_on ', this.reassignment_on);
    }

  }

  toggleUnavailable_status_on($event) {
    if ($event.target.checked) {

      this.automatic_unavailable_status_on = true;
      this.logger.log('[PRJCT-EDIT-ADD]- toggleUnavailable_status_on ', this.automatic_unavailable_status_on);
    } else {

      this.automatic_unavailable_status_on = false;
      this.logger.log('[PRJCT-EDIT-ADD] - toggleUnavailable_status_on ', this.automatic_unavailable_status_on);
    }
  }

  toggleAgentViewOnlyOwnConv(event) {
    this.logger.log('[PRJCT-EDIT-ADD]- toggleCurrentAgentViewOnlyOwnConv event', event.target.checked);
    this.agents_can_see_only_own_convs = event.target.checked;
    this.projectService.agentViewOnlyOwnConv(this.agents_can_see_only_own_convs).then((result) => {
      this.logger.log("[PRJCT-EDIT-ADD] - toggleCurrentAgentViewOnlyOwnConv RESULT: ", result)
      this.notify.showWidgetStyleUpdateNotification(this.updateSuccessMsg, 2, 'done')
    }).catch((err) => {
      this.logger.error("[PRJCT-EDIT-ADD] - TtoggleCurrentAgentViewOnlyOwnConv ERROR: ", err)
      this.notify.showWidgetStyleUpdateNotification(this.updateErrorMsg, 4, 'report_problem')
    })
  }


  toggleVisibilityOfChatbotAttributes(event) {
    this.logger.log('[PRJCT-EDIT-ADD]- toggleVisibilityOfChatbotAttributes', event.target.checked);
    this.areHideChatbotAttributesInConvDtls = event.target.checked;
    this.projectService.switchChatbotAttributesVisibility(this.areHideChatbotAttributesInConvDtls).then((result) => {
      this.logger.log("[PRJCT-EDIT-ADD] - toggleVisibilityOfChatbotAttributes RESULT: ", result)
      this.notify.showWidgetStyleUpdateNotification(this.updateSuccessMsg, 2, 'done')
      this.cacheService.clearCache()
    }).catch((err) => {
      this.logger.error("[PRJCT-EDIT-ADD] - TtoggleCurrentAgentViewOnlyOwnConv ERROR: ", err)
      this.notify.showWidgetStyleUpdateNotification(this.updateErrorMsg, 4, 'report_problem')
    })
  }

  toggleSupportWidgetVisibility($event) {
    // this.logger.log("[PRJCT-EDIT-ADD] - Toggle Widget Visibility event.target.checked: ", $event.target.checked);
    this.displaySupportWidget = $event.target.checked;
    // this.logger.log("[PRJCT-EDIT-ADD] - Toggle Widget Visibility displaySupportWidget: ", this.displaySupportWidget);

    this.projectService.enableDisableSupportWidgetVisibility(this.displaySupportWidget).then((result) => {
      // this.logger.log("[PRJCT-EDIT-ADD] - Toggle Widget Visibility RESULT: ", result)
      this.notify.showWidgetStyleUpdateNotification(this.updateSuccessMsg, 2, 'done')
    }).catch((err) => {
      // this.logger.error("[PRJCT-EDIT-ADD] - Toggle Widget Visibility ERROR: ", err)
      this.notify.showWidgetStyleUpdateNotification(this.updateErrorMsg, 4, 'report_problem')
    })
  }

  toggleProjectAssignedConversation($event) {
    this.logger.log("[PRJCT-EDIT-ADD] - Event Toggle Assigned: ", $event.target.checked);
    this.assigned_conv_on = $event.target.checked;

    this.projectService.enableDisableAssignedNotification(this.assigned_conv_on).then((result) => {
      this.logger.log("[PRJCT-EDIT-ADD] - ENABLE/DISABLED ASSIGNED NOTIFICATION RESULT: ", result)
      this.notify.showWidgetStyleUpdateNotification(this.updateSuccessMsg, 2, 'done')
    }).catch((err) => {
      this.logger.error("[PRJCT-EDIT-ADD] - Error during ENABLE/DISABLED ASSIGNED NOTIFICATION updating: ", err)
      this.notify.showWidgetStyleUpdateNotification(this.updateErrorMsg, 4, 'report_problem')
    })
  }

  toggleProjectUnassignedConversation($event) {
    this.logger.log("[PRJCT-EDIT-ADD] - Event Toggle UNASSIGNED: ", $event.target.checked);
    this.unassigned_conv_on = $event.target.checked;

    this.projectService.enableDisableUnassignedNotification(this.unassigned_conv_on).then((result) => {
      this.logger.log("[PRJCT-EDIT-ADD] ENABLE/DISABLED UNASSIGNED NOTIFICATION RESULT: ", result)
      this.notify.showWidgetStyleUpdateNotification(this.updateSuccessMsg, 2, 'done')
    }).catch((err) => {
      this.logger.error("PRJCT-EDIT-ADD] Error during  ENABLE/DISABLED UNASSIGNED NOTIFICATION updating: ", err)
      this.notify.showWidgetStyleUpdateNotification(this.updateErrorMsg, 4, 'report_problem')
    })
  }

  toggleEnableIPrestrictions($event) {
    this.ip_restrictions_on = $event.target.checked;
  }

  allowedIPsChanged($event) {
    // this.logger.log("[PRJCT-EDIT-ADD] allowedIPsChanged $event ", $event)
  }

  saveIPranges() {
    this.logger.log("[PRJCT-EDIT-ADD] SAVE IP RANGES - id_project", this.id_project)
    this.logger.log("[PRJCT-EDIT-ADD] SAVE IP RANGES - allowedIPranges", this.allowedIPs)

    this.logger.log("[PRJCT-EDIT-ADD] SAVE IP RANGES - ip_restrictions_on", this.ip_restrictions_on)
    let allowedIPsArray = []
    if (this.allowedIPs) {
      const allowedIPsTrimmed = this.allowedIPs.replace(/\s/g, '');
      this.logger.log("[PRJCT-EDIT-ADD] SAVE IP RANGES - allowedIPranges allowedIPsTrimmed ", allowedIPsTrimmed)
      allowedIPsArray = allowedIPsTrimmed.split(',')
      this.logger.log("[PRJCT-EDIT-ADD] SAVE IP RANGES - allowedIPranges split ", allowedIPsArray)
      // if (allowedIPsArray.length === 0) {
      //   this.logger.log("[PRJCT-EDIT-ADD] SAVE IP RANGES - allowedIPranges is empty ")
      // }
    } else {
      this.logger.log("[PRJCT-EDIT-ADD] SAVE IP RANGES - allowedIPs is empty ")
      this.ip_restrictions_on = false;
    }


    if (this.ip_restrictions_on && allowedIPsArray.length > 0) {
      swal({
        title: "Are you sure?",
        text: "Adding IP-based access restrictions can break Tiledesk access!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
        .then((willAddIpRanges) => {
          if (willAddIpRanges) {

            this.logger.log('[PRJCT-EDIT-ADD] swal willAddIpRanges', willAddIpRanges)
            // this.id_project,

            this.projectService.addAllowedIPranges(this.id_project, this.ip_restrictions_on, allowedIPsArray).subscribe((res: any) => {
              this.logger.log('[PRJCT-EDIT-ADD] addAllowedIPranges res ', res)

            }, (error) => {
              this.logger.error('[PRJCT-EDIT-ADD] addAllowedIPranges - ERROR ', error);

              swal("Sorry, an error occurred saving IPs addresses", {
                icon: "error",
              });

            }, () => {
              this.logger.log('[PRJCT-EDIT-ADD] addAllowedIPranges * COMPLETE *');

              swal("IP addresses successfully added", {
                icon: "success",
              }).then((okpressed) => {

              });

            });


            // swal("Poof! Your imaginary file has been deleted!", {
            //   icon: "success",
            // });
          } else {
            // swal("Your imaginary file is safe!");
          }
        });
    } else if (this.ip_restrictions_on === false || allowedIPsArray.length === 0) {

      this.projectService.addAllowedIPranges(this.id_project, this.ip_restrictions_on, allowedIPsArray).subscribe((res: any) => {
        this.logger.log('[PRJCT-EDIT-ADD] addAllowedIPranges res ', res)

      }, (error) => {
        this.logger.error('[PRJCT-EDIT-ADD] addAllowedIPranges - ERROR ', error);
      }, () => {
        this.logger.log('[PRJCT-EDIT-ADD] addAllowedIPranges * COMPLETE *');


      });
    }
  }




  onProjectNameChange(event) {
    this.logger.log('[PRJCT-EDIT-ADD] - ON PROJECT NAME CHANGE ', event);
    this.logger.log('[PRJCT-EDIT-ADD] - ON PROJECT NAME TO UPDATE ', this.project_name);

    if (event === this.project_name) {
      this.DISABLE_UPDATE_BTN = true;

    } else {
      this.DISABLE_UPDATE_BTN = false;
    }
  }



  edit() {
    this.logger.log('[PRJCT-EDIT-ADD] - PROJECT ID WHEN EDIT IS PRESSED ', this.id_project);
    this.logger.log('[PRJCT-EDIT-ADD] - PROJECT NAME WHEN EDIT IS PRESSED ', this.projectName_toUpdate);

    this.projectService.updateProjectName(this.id_project, this.projectName_toUpdate)
      .subscribe((prjct: Project) => {
        // this.logger.log('[PRJCT-EDIT-ADD] - UPDATE PROJECT - RESPONSE ', prjct);

        if (prjct) {
          if (prjct['name'] === this.projectName_toUpdate) {
            this.DISABLE_UPDATE_BTN = true;
          }


          prjct['role'] = this.USER_ROLE
          this.auth.projectSelected(prjct, 'project-edit-add update-project-name')
          localStorage.setItem(prjct._id, JSON.stringify(prjct));
          this.projectService.newProjectCreated(true);

          // const storedProjectJson = localStorage.getItem(this.id_project);
          // this.logger.log('[PRJCT-EDIT-ADD] - STORED PROJECT JSON ', storedProjectJson);

          // if (storedProjectJson) {
          //   const projectObject = JSON.parse(storedProjectJson);
          //   this.logger.log('[PRJCT-EDIT-ADD] - STORED PROJECT OBJ ', projectObject);

          //   const storedUserRole = projectObject['role'];
          //   this.logger.log('[PRJCT-EDIT-ADD] - STORED PROJECT OBJ - USER ROLE ', storedUserRole);

          //   const storedProjectName = projectObject['name'];
          //   this.logger.log('[PRJCT-EDIT-ADD] - STORED PROJECT OBJ - PRJ NAME ', storedProjectName);

          //   const storedProjectId = projectObject['_id'];
          //   this.logger.log('[PRJCT-EDIT-ADD] - STORED PROJECT OBJ - PRJ ID ', storedProjectId);

          //   const storedProjectOH = projectObject['operatingHours'];

          //   if (storedProjectName !== prjct['name']) {



          //     // const updatedProjectForStorage: Project = {
          //     //   _id: storedProjectId,
          //     //   name: prjct['name'],
          //     //   role: storedUserRole,
          //     //   operatingHours: storedProjectOH
          //     // }

          //     // RE-SET THE PROJECT IN THE STORAGE WITH THE UPDATED NAME
          //     localStorage.setItem(storedProjectId, JSON.stringify(updatedProjectForStorage));

          // }
          // }
        }

      }, (error) => {
        this.logger.error('[PRJCT-EDIT-ADD] UPDATE PROJECT - ERROR ', error);

        this.notify.showWidgetStyleUpdateNotification(this.updateErrorMsg, 4, 'report_problem');

      }, () => {
        this.logger.log('[PRJCT-EDIT-ADD] UPDATE PROJECT * COMPLETE *');
        // this.router.navigate(['/projects']);


        this.notify.showWidgetStyleUpdateNotification(this.updateSuccessMsg, 2, 'done');
      });
  }


  autoSendTranscriptOnOff($event) {
    this.logger.log('[PRJCT-EDIT-ADD] - AUTO SEND TRANSCRIPT BY EMAIL ON ', $event.target.checked);

    this.projectService.updateAutoSendTranscriptToRequester($event.target.checked)
      .subscribe((prjct) => {
        this.logger.log('[PRJCT-EDIT-ADD] AUTO SEND TRANSCRIPT UPDATE PROJECT - RES ', prjct);
      }, (error) => {
        this.logger.error('[PRJCT-EDIT-ADD] AUTO SEND TRANSCRIPT UPDATE PROJECT - ERROR ', error);
        this.notify.showWidgetStyleUpdateNotification(this.updateErrorMsg, 4, 'report_problem');

      }, () => {
        this.logger.log('[PRJCT-EDIT-ADD] AUTO SEND TRANSCRIPT UPDATE PROJECT * COMPLETE *');
        this.notify.showWidgetStyleUpdateNotification(this.updateSuccessMsg, 2, 'done');
        // this.router.navigate(['/projects']);
      });
  }

  updateAdvancedSettings() {
    // if (this.advancedSettingBtnDisabled) {}
    const updateAdvancedSettingBtn = <HTMLElement>document.querySelector('.btn_edit_advanced_settings');
    this.logger.log('[PRJCT-EDIT-ADD]  - UPDATE ADVANCED SETTINGS BTN ', updateAdvancedSettingBtn)
    updateAdvancedSettingBtn.blur();
    this.logger.log('[PRJCT-EDIT-ADD] - UPDATE ADVANCED SETTINGS - max_agent_assigned_chat ', this.max_agent_assigned_chat, ' reassignment_delay ', this.reassignment_delay, ' automatic_idle_chats ', this.automatic_idle_chats);

    this.logger.log('[PRJCT-EDIT-ADD] - UPDATE ADVANCED SETTINGS - chat_limit_on ', this.chat_limit_on, ' reassignment_on ', this.reassignment_on, ' automatic_unavailable_status_on ', this.automatic_unavailable_status_on);


    // if (this.chat_limit_on === true || this.reassignment_on === true || this.automatic_unavailable_status_on === true) {
    this.projectService.updateAdvancedSettings(this.max_agent_assigned_chat, this.reassignment_delay, this.automatic_idle_chats, this.chat_limit_on, this.reassignment_on, this.automatic_unavailable_status_on)
      .subscribe((prjct: Project) => {
        // this.logger.log('[PRJCT-EDIT-ADD] UPDATE ADVANCED SETTINGS - RES ', prjct);

        // -------------------------------------------------------------------------------------------------------------------------------------------------------------------
        // I call "this.auth.projectSelected" so that the project is republished and can have the updated data of the advanced options (smart assign) in the conversation list
        // -------------------------------------------------------------------------------------------------------------------------------------------------------------------
        // const _project: Project = {
        //   _id: prjct['_id'],
        //   name: prjct['name'],
        //   profile_name: prjct['profile'].name,
        //   trial_expired: prjct['trialExpired'],
        //   trial_days_left: prjct['trialDaysLeft'],
        //   operatingHours: prjct['activeOperatingHours']
        // }
        prjct['role'] = this.USER_ROLE
        this.auth.projectSelected(prjct, 'project-edit-add update-advanced-settings')
        localStorage.setItem(prjct._id, JSON.stringify(prjct));


      }, (error) => {
        this.logger.error('[PRJCT-EDIT-ADD] - UPDATE ADVANCED SETTINGS - ERROR ', error);
        this.notify.showWidgetStyleUpdateNotification(this.updateErrorMsg, 4, 'report_problem');
      }, () => {
        this.logger.log('[PRJCT-EDIT-ADD] - UPDATE ADVANCED SETTINGS * COMPLETE *');
        this.notify.showWidgetStyleUpdateNotification(this.updateSuccessMsg, 2, 'done');
      })
    // } else {

    //   this.notify.showWidgetStyleUpdateNotification(this.notificationNothingToSave, 3, 'report_problem');
    // }
  }


  onChangeMaximum_chats($event) {
    this.logger.log('[PRJCT-EDIT-ADD] - UPDATE ADVANCED SETTINGS - ON CHANGE MAXIMUM CHAT  ', $event);

    if ($event < 1) {
      this.maximum_chats_has_minimum_error = true;
      this.logger.log('[PRJCT-EDIT-ADD] - UPDATE ADVANCED SETTINGS - ON CHANGE MAXIMUM CHAT - HAS MIN ERROR ', this.maximum_chats_has_minimum_error);
    } else {
      this.maximum_chats_has_minimum_error = false;
    }

    if ($event > 10000000) {
      this.maximum_chats_has_maximum_error = true;
      this.logger.log('[PRJCT-EDIT-ADD] - UPDATE ADVANCED SETTINGS - ON CHANGE MAXIMUM CHAT - HAS MAX ERROR ', this.maximum_chats_has_maximum_error);
    } else {
      this.maximum_chats_has_maximum_error = false;
    }
  }

  onChangeReassignment_timeout($event) {
    this.logger.log('[PRJCT-EDIT-ADD] - UPDATE ADVANCED SETTINGS - ON CHANGE REASSIGMENT TIMEOUT ', $event);

    if ($event < 1) {
      this.reassignment_timeout_has_minimum_error = true;
      this.logger.log('[PRJCT-EDIT-ADD] - UPDATE ADVANCED SETTINGS - ON CHANGE REASSIGMENT TIMEOUT - HAS MIN ERROR ', this.reassignment_timeout_has_minimum_error);
    } else {
      this.reassignment_timeout_has_minimum_error = false;
    }

    if ($event > 10000000) {
      this.reassignment_timeout_has_maximum__error = true;
      this.logger.log('[PRJCT-EDIT-ADD] - UPDATE ADVANCED SETTINGS - ON CHANGE REASSIGMENT TIMEOUT - HAS MAX ERROR ', this.reassignment_timeout_has_maximum__error);
    } else {
      this.reassignment_timeout_has_maximum__error = false;
    }

  }

  onChangeAutomaticUnavailable($event) {
    this.logger.log('[PRJCT-EDIT-ADD] - UPDATE ADVANCED SETTINGS - ON CHANGE Automatic Unavailable after a n of chat ', $event);

    if ($event < 1) {
      this.automatic_idle_chats_has_minimum_error = true;
      this.logger.log('[PRJCT-EDIT-ADD] - ADVANCED SETTINGS - ON CHANGE REASSIGMENT TIMEOUT - HAS MIN ERROR ', this.reassignment_timeout_has_minimum_error);
    } else {
      this.automatic_idle_chats_has_minimum_error = false;
    }

    if ($event > 10000000) {
      this.automatic_idle_chats_has_maximum__error = true;
      this.logger.log('[PRJCT-EDIT-ADD] - UPDATE ADVANCED SETTINGS - ON CHANGE REASSIGMENT TIMEOUT - HAS MAX ERROR ', this.reassignment_timeout_has_maximum__error);
    } else {
      this.automatic_idle_chats_has_maximum__error = false;
    }

  }

  openConfirmJwtSecretCreationModal() {
    this.displayConfirmJwtSecretCreationModal = 'block';
  }

  closeConfirmJwtSecretCreationModal() {
    this.displayConfirmJwtSecretCreationModal = 'none';
  }

  generateSharedSecret() {
    this.displayConfirmJwtSecretCreationModal = 'none';
    this.projectService.generateSharedSecret()
      .subscribe((res) => {
        this.logger.log('[PRJCT-EDIT-ADD] - GENERATE SHARED SECRET - RESPONSE ', res);
        this.sharedSecret = res['jwtSecret']

      }, (error) => {
        this.logger.error('[PRJCT-EDIT-ADD] GENERATE SHARED SECRET - ERROR ', error);
      }, () => {
        this.logger.log('[PRJCT-EDIT-ADD] GENERATE SHARED SECRET  * COMPLETE *');

        this.displayJwtSecretGeneratedModal = 'block'
      });
  }

  closeJwtSecretGeneratedModal() {
    this.displayJwtSecretGeneratedModal = 'none'
  }

  copySharedSecret() {
    const copyText = document.getElementById('sharedSecretInput') as HTMLInputElement;
    copyText.select();
    document.execCommand('copy');
  }

  /**
   * MODAL DELETE PROJECT
   * @param id
   * @param projectName
   */
  openDeleteModal() {
    this.logger.log('[PRJCT-EDIT-ADD] - OPEN DELETE MODAL -> PROJECT ID ', this.id_project);
    if (this.USER_ROLE === 'owner') {
      this.display = 'block';
    } else {
      this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyATeammateWithTheOwnerRoleCanDeleteAProject_lbl, this.learnMoreAboutDefaultRoles)
    }

    if (this.USER_ROLE === 'owner' && this.prjct_profile_type === 'payment') {
      this.isActiveSubscription = true
    }
  }

  onCloseModal() {
    this.display = 'none';
  }

  onProjectIdToDeleteChange($event) {
    this.logger.log('[PRJCT-EDIT-ADD] - ON PROJECT ID CHANGE ', $event);
    this.logger.log('[PRJCT-EDIT-ADD] - PROJECT ID  ', this.id_project);

    if ($event === this.id_project) {
      this.DISABLE_DELETE_PROJECT_BTN = false;

    } else {
      this.DISABLE_DELETE_PROJECT_BTN = true;
    }
  }

  deleteProject() {
    // if (this.prjct_profile_type !== 'payment') {
    this.SHOW_CIRCULAR_SPINNER = true;
    this.logger.log('[PRJCT-EDIT-ADD] - deleteProject ID PROJECT TO DELETE ', this.project_id_to_delete);
    this.logger.log('[PRJCT-EDIT-ADD] - deleteProject ID PROJECT ', this.id_project);

    this.projectService.deleteProject(this.id_project).subscribe((data) => {
      this.logger.log('[PRJCT-EDIT-ADD] - deleteProject RES ', data);

    }, (error) => {
      this.SHOW_CIRCULAR_SPINNER = false;
      this.logger.error('[PRJCT-EDIT-ADD] - deleteProject - ERROR ', error);
      this.notify.showWidgetStyleUpdateNotification(this.deleteErrorMsg, 4, 'report_problem');
    }, () => {
      this.logger.log('[PRJCT-EDIT-ADD] - deleteProject * COMPLETE *');

      setTimeout(() => {
        this.SHOW_CIRCULAR_SPINNER = false;
        this.notify.showNotificationChangeProject(this.deleteSuccessMsg, 2, 'done');
        this.router.navigate(['/projects']);
      }, 1500);
    });
    // } else {
    //   this.logger.log('[PRJCT-EDIT-ADD] - deleteProject > project profile type' , this.prjct_profile_type );
    // }
  }



  goToWidgetAuthenticationDocs() {
    const url = 'https://developer.tiledesk.com/widget/auth'
    window.open(url, '_blank');
  }

  goToWebhookDocs() {
    const url = 'https://developer.tiledesk.com/apis/webhooks'
    window.open(url, '_blank');
  }

  goToKBDocsSettingUpAutomaticAssignment() {
    const url = URL_setting_up_automatic_assignment
    window.open(url, '_blank');
  }

  goToWebhookPage() {
    this.logger.log("[PRJCT-EDIT-ADD] GO TO WEBHOOK PAGE > ProjectID: ", this.id_project);


    if (this.prjct_profile_type === 'free' && this.prjct_trial_expired === false) {
      // this.logger.log('PRJCT-EDIT-ADD] GO TO WEBHOOK PAGE HERE USECASE PLAN B TRIAL ')
      this.router.navigate(['project/' + this.id_project + '/webhook']);
    }
    if (this.profile_name == PLAN_NAME.A && this.subscription_is_active === true) {
      // this.logger.log('PRJCT-EDIT-ADD] GO TO WEBHOOK PAGE HERE USECASE PLAN A ACTIVE ')
      this.router.navigate(['project/' + this.id_project + '/webhook']);
    }
    if (this.profile_name == PLAN_NAME.B && this.subscription_is_active === true) {
      // this.logger.log('PRJCT-EDIT-ADD] GO TO WEBHOOK PAGE HERE USECASE PLAN B ACTIVE ')
      this.router.navigate(['project/' + this.id_project + '/webhook']);
    }
    if (this.profile_name == PLAN_NAME.C && this.subscription_is_active === true) {
      // this.logger.log('PRJCT-EDIT-ADD] GO TO WEBHOOK PAGE HERE USECASE PLAN C ACTIVE ')
      this.router.navigate(['project/' + this.id_project + '/webhook']);
    }
    if (this.profile_name == PLAN_NAME.D && this.subscription_is_active === true) {
      // this.logger.log('PRJCT-EDIT-ADD] GO TO WEBHOOK PAGE HERE USECASE PLAN C ACTIVE ')
      this.router.navigate(['project/' + this.id_project + '/webhook']);
    }
    if (this.profile_name == PLAN_NAME.E && this.subscription_is_active === true) {
      // this.logger.log('PRJCT-EDIT-ADD] GO TO WEBHOOK PAGE HERE USECASE PLAN C ACTIVE ')
      this.router.navigate(['project/' + this.id_project + '/webhook']);
    }
    if (this.profile_name == PLAN_NAME.EE && this.subscription_is_active === true) {
      // this.logger.log('PRJCT-EDIT-ADD] GO TO WEBHOOK PAGE HERE USECASE PLAN C ACTIVE ')
      this.router.navigate(['project/' + this.id_project + '/webhook']);
    }
    if (this.profile_name == PLAN_NAME.F && this.subscription_is_active === true) {
      // this.logger.log('PRJCT-EDIT-ADD] GO TO WEBHOOK PAGE HERE USECASE PLAN f ACTIVE ')
      this.router.navigate(['project/' + this.id_project + '/webhook']);


    } else if (this.prjct_profile_type === 'free' && this.prjct_trial_expired === true) {
      // this.logger.log('PRJCT-EDIT-ADD] GO TO WEBHOOK PAGE HERE USECASE PLAN FREE FOREVER - PRESENT MODAL ')
      this.presentModalFeautureAvailableOnlyWithPaidPlans()
    } else if (this.profile_name == PLAN_NAME.A && this.subscription_is_active === false) {
      // this.logger.log('PRJCT-EDIT-ADD] GO TO WEBHOOK PAGE HERE USECASE PLAN A EXPIRED - PRESENT MODAL ')
      this.presentModalFeautureAvailableOnlyWithPaidPlans()
    } else if (this.profile_name == PLAN_NAME.B && this.subscription_is_active === false) {
      // this.logger.log('PRJCT-EDIT-ADD] GO TO WEBHOOK PAGE HERE USECASE PLAN B EXPIRED - PRESENT MODAL ')
      this.presentModalFeautureAvailableOnlyWithPaidPlans()
    } else if (this.profile_name == PLAN_NAME.C && this.subscription_is_active === false) {
      // this.logger.log('PRJCT-EDIT-ADD] GO TO WEBHOOK PAGE HERE USECASE PLAN C EXPIRED - PRESENT MODAL ')
      this.presentModalFeautureAvailableOnlyWithPaidPlans()
    } else if (this.profile_name == PLAN_NAME.D && this.subscription_is_active === false) {
      // this.logger.log('PRJCT-EDIT-ADD] GO TO WEBHOOK PAGE HERE USECASE PLAN C EXPIRED - PRESENT MODAL ')
      this.presentModalFeautureAvailableOnlyWithPaidPlans()
    } else if (this.profile_name == PLAN_NAME.E && this.subscription_is_active === false) {
      // this.logger.log('PRJCT-EDIT-ADD] GO TO WEBHOOK PAGE HERE USECASE PLAN C EXPIRED - PRESENT MODAL ')
      this.presentModalFeautureAvailableOnlyWithPaidPlans()
    } else if (this.profile_name == PLAN_NAME.EE && this.subscription_is_active === false) {
      // this.logger.log('PRJCT-EDIT-ADD] GO TO WEBHOOK PAGE HERE USECASE PLAN C EXPIRED - PRESENT MODAL ')
      this.presentModalFeautureAvailableOnlyWithPaidPlans()
    } else if (this.profile_name == PLAN_NAME.F && this.subscription_is_active === false) {
      // this.logger.log('PRJCT-EDIT-ADD] GO TO WEBHOOK PAGE HERE USECASE PLAN C EXPIRED - PRESENT MODAL ')
      this.presentModalFeautureAvailableOnlyWithPaidPlans()
    }
  }

  // GoTo Weebhook
  presentModalFeautureAvailableOnlyWithPaidPlans() {
    // const el = document.createElement('div')
    // el.innerHTML = this.featureAvailableOnlyWithPaidPlans
    if (this.isVisiblePaymentTab) {
      Swal.fire({

        // content: el,
        title: this.upgradePlan,
        text: this.featureAvailableOnlyWithPaidPlans,
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
          // this.logger.log('presentModalFeautureAvailableOnlyWithPaidPlans value', value)
          // this.router.navigate(['project/' + this.projectId + '/pricing']);
          if (this.isVisiblePaymentTab) {

            if (this.USER_ROLE === 'owner') {
              if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
                if (this.profile_name !== PLAN_NAME.C && this.profile_name !== PLAN_NAME.F) {
                  this.notify.displaySubscripionHasExpiredModal(true, this.profile_name, this.subscription_end_date);
                } else if (this.profile_name === PLAN_NAME.C || this.profile_name === PLAN_NAME.F) {
                  this.notify.displayEnterprisePlanHasExpiredModal(true, this.profile_name, this.subscription_end_date);
                }

                this.logger.log('[PRJCT-EDIT-ADD] profile_name ', this.profile_name)
              } else if (this.profile_name === 'free' && this.prjct_trial_expired === true || this.profile_name === 'Sandbox' && this.prjct_trial_expired === true) {  //

                this.router.navigate(['project/' + this.projectId + '/pricing']);

              }

            } else {
              this.presentModalOnlyOwnerCanManageTheAccountPlan();
            }
          } else {
            this.notify._displayContactUsModal(true, 'upgrade_plan');
          }
        }
      });
    } else {
      this.notify._displayContactUsModal(true, 'upgrade_plan');
    }
  }

  getTestSiteUrl() {
    this.TESTSITE_BASE_URL = this.appConfigService.getConfig().WIDGET_BASE_URL + 'assets/twp/index.html';
    this.logger.log('[PRJCT-EDIT-ADD] getAppConfig TESTSITE_BASE_URL', this.TESTSITE_BASE_URL);

    this.TEST_WIDGET_API_BASE_URL = this.TESTSITE_BASE_URL.replace('index.html', "index-dev.html")
    this.logger.log('[PRJCT-EDIT-ADD] getAppConfig TEST_WIDGET_API_BASE_URL', this.TEST_WIDGET_API_BASE_URL);
  }

  goToWidgetTestPage() {
    const widgetTestPageBtnElem = <HTMLElement>document.querySelector('.test-widget-api-btn');
    widgetTestPageBtnElem.blur();

    const url = this.TEST_WIDGET_API_BASE_URL + '?tiledesk_projectid=' + this.projectId + '&project_name=' + this.projectName + '&isOpen=true'
    window.open(url, '_blank');
  }

  viewCancelSubscription() {
    this.notify.displayCancelSubscriptionModal(true);
  }

}
