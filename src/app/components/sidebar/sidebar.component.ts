import { Component, OnInit, AfterViewInit, NgModule, ElementRef, ViewChild, HostListener, EventEmitter, Output, Input, Renderer2 } from '@angular/core';

import { Router, NavigationEnd, Event as NavigationEvent } from '@angular/router';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../core/auth.service';
import { UsersService } from '../../services/users.service';
import { Project } from '../../models/project-model';
// import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
// import { SharedModule } from '../../shared/shared.module';
import { LocalDbService } from '../../services/users-local-db.service';
import { NotifyService } from '../../core/notify.service';
import { UploadImageService } from '../../services/upload-image.service';
import { UploadImageNativeService } from '../../services/upload-image-native.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AppConfigService } from '../../services/app-config.service';

import { DepartmentService } from '../../services/department.service';

// import { publicKey } from '../../utils/util';
// import { public_Key } from '../../utils/util';
// import { environment } from '../../../environments/environment';
// import brand from 'assets/brand/brand.json';
import { BrandService } from '../../services/brand.service';
import { WsRequestsService } from './../../services/websocket/ws-requests.service';
import { LoggerService } from './../../services/logger/logger.service';
import { avatarPlaceholder, getColorBck } from '../../utils/util'
import { DomSanitizer } from '@angular/platform-browser';
import { FaqKbService } from 'app/services/faq-kb.service';
import { KbSettings } from 'app/models/kbsettings-model';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserModalComponent } from 'app/users/user-modal/user-modal.component';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { INFO_MENU_ITEMS } from 'app/support/support-utils';

import { ShepherdService } from 'angular-shepherd';
import { getSteps as defaultSteps, defaultStepOptions } from './sidebar.tour.config';

import Step from 'shepherd.js/src/types/step';
import { environment } from 'environments/environment';
import { LogoutModalComponent } from 'app/auth/logout-modal/logout-modal.component';
import { RolesService } from 'app/services/roles.service';
import { PERMISSIONS } from 'app/utils/permissions.constants';

declare const $: any;

declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
}

//    export const ROUTES: RouteInfo[];
//  = [
//     { path: `project/${this.projectid}/home`, title: 'Home', icon: 'dashboard', class: '' },
//     { path: 'requests', title: 'Visitatori', icon: 'group', class: '' },
//     { path: 'chat', title: 'Chat', icon: 'chat', class: '' },
//     // { path: 'analytics', title: 'Analytics', icon: 'trending_up', class: '' },
//     // MOVED IN THE TEMPLATE: IS NECESSARY TO MANAGE THE SETTING SUB MENU
//     // { path: 'settings', title: 'Impostazioni',  icon: 'settings', class: '' },

//     // { path: 'dashboard', title: 'Dashboard', icon: 'dashboard', class: '' },
//     // { path: 'user-profile', title: 'User Profile', icon: 'person', class: '' },
//     // { path: 'table-list', title: 'Table List', icon: 'content_paste', class: '' },
//     // { path: 'typography', title: 'Typography', icon: 'library_books', class: '' },
//     // { path: 'icons', title: 'Icons', icon: 'bubble_chart', class: '' },
//     // { path: 'maps', title: 'Maps', icon: 'location_on', class: '' },
//     // { path: 'notifications', title: 'Notifications', icon: 'notifications', class: '' },
//     // { path: 'upgrade', title: 'Upgrade to PRO', icon: 'unarchive', class: 'active-pro' },
// ];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, AfterViewInit {
  INFO_MENU_ITEMS = INFO_MENU_ITEMS;
  public version: string = environment.VERSION;
  test: Date = new Date();

  // tparams = brand;

  // hidechangelogrocket = brand.sidebar__hide_changelog_rocket;
  tparams: any;
  sidebarLogoWhite_Url: string;
  companyLogoNoText: string;
  // hidechangelogrocket: boolean;

  // background_bottom_section = brand.sidebar.background_bottom_section
  // public_Key = environment.t2y12PruGU9wUtEGzBJfolMIgK; // now get from appconfig
  public_Key: string;

  @ViewChild('openchatbtn') private elementRef: ElementRef;
  @ViewChild('homebtn') private homeBtnElement: ElementRef;
  // @ViewChild('.item-active', { static: false }) svgPath: ElementRef;

  countClickOnOpenUserDetailSidebar: number = 0
  menuItems: any[];

  checked_route: string;

  SHOW_SETTINGS_SUBMENU = false;
  SETTINGS_SUBMENU_WAS_OPEN: any;

  // FOR THE CARETS IN SIDEBAR IN MOBILE MODE
  SHOW_PRJCT_SUB = false;
  SHOW_PROFILE_SUB = false;

  // NO MORE USED
  // isActive: string;

  // switch up and down the caret of menu item settings
  // trasform = 'none';
  trasform = 'none';
  trasform_projectname_caret = 'none';
  transform_user_profile_caret = 'none';

  unservedRequestCount: number;

  // route: string;
  LOGIN_PAGE: boolean;
  // IS_UNAVAILABLE = false;
  IS_AVAILABLE: boolean;
  IS_BUSY: boolean;
  IS_INACTIVE: boolean;
  SIDEBAR_IS_SMALL: boolean = true;
  projectUser_id: string;

  project: Project;
  projectId: string;
  user: any;

  ROUTES: RouteInfo[];
  displayLogoutModal = 'none';

  USER_ROLE: string = 'agent';

  currentUserId: string

  // CHAT_BASE_URL = environment.chat.CHAT_BASE_URL; // moved
  // CHAT_BASE_URL = environment.CHAT_BASE_URL; // now get from appconfig
  CHAT_BASE_URL: string;

  userProfileImageExist: boolean;
  userImageHasBeenUploaded: boolean;
  userProfileImageurl: string;
  timeStamp: any;

  IS_MOBILE_MENU: boolean;
  scrollpos: number;
  elSidebarWrapper: any;

  changeAvailabilitySuccessNoticationMsg: string;
  changeAvailabilityErrorNoticationMsg: string;

  isOverAvar = false;

  availabilityCount: number;
  _route: string;

  ACTIVITIES_ROUTE_IS_ACTIVE: boolean;
  ACTIVITIES_DEMO_ROUTE_IS_ACTIVE: boolean;
  ANALYTICS_DEMO_ROUTE_IS_ACTIVE: boolean;
  WIDGET_ROUTE_IS_ACTIVE: boolean;
  ANALITYCS_ROUTE_IS_ACTIVE: boolean;
  HOME_ROUTE_IS_ACTIVE: boolean;
  APPS_ROUTE_IS_ACTIVE: boolean;
  NOTIFICATION_EMAIL_IS_ACTIVE: boolean;
  YOUR_PROJECT_ROUTE_IS_ACTIVE: boolean;
  AUTOLOGIN_ROUTE_IS_ACTIVE: boolean;
  // settings route
  TRIGGER_ROUTE_IS_ACTIVE: boolean;
  TAG_ROUTE_IS_ACTIVE: boolean;
  CANNED_RESPONSES_ROUTE_IS_ACTIVE: boolean;
  DEPTS_ROUTE_IS_ACTIVE: boolean;
  EDIT_DEPT_ROUTE_IS_ACTIVE: boolean;
  TEAMMATES_ROUTE_IS_ACTIVE: boolean;
  GROUPS_ROUTE_IS_ACTIVE: boolean;
  ROLES_ROUTE_IS_ACTIVE: boolean;
  EDIT_ROLE_ROUTE_IS_ACTIVE: boolean;
  ADD_ROLE_ROUTE_IS_ACTIVE: boolean;
  CREATE_GROUP_ROUTE_IS_ACTIVE: boolean;
  EDIT_GROUP_ROUTE_IS_ACTIVE: boolean;
  WIDGET_SETUP_ROUTE_IS_ACTIVE: boolean;
  CREATE_FAQ_ROUTE_IS_ACTIVE: boolean;
  EDIT_FAQ_ROUTE_IS_ACTIVE: boolean;
  BOT_TEST_ROUTE_IS_ACTIVE: boolean;
  PROJECT_SETTINGS_ROUTE_IS_ACTIVE: boolean;
  ENTERPRISE_NOTIFICATION_EMAIL_ROUTE_IS_ACTIVE: boolean;
  ENTERPRISE_SMTP_SETTINGS_ROUTE_IS_ACTIVE: boolean;
  PRJCT_SETTINGS_WEBHOOK_ROUTE_IS_ACTIVE: boolean;
  PRJCT_SETTINGS_PAYMENTS_ROUTE_IS_ACTIVE: boolean;
  INVITE_TEAMMATE_ROUTE_IS_ACTIVE: boolean;
  EDIT_PROJECT_USER_ROUTE_IS_ACTIVE: boolean;
  OPERATING_HOURS_ROUTE_IS_ACTIVE: boolean;
  CONV_DETAIL_ROUTE_IS_ACTIVE: boolean;
  CONV_DETAIL_ROUTE_NO_AUTH_IS_ACTIVE: boolean;
  CONV_DEMO_ROUTE_IS_ACTIVE: boolean;
  MONITOR_ROUTE_IS_ACTIVE: boolean;
  MONITOR_NO_AUTH_ROUTE_IS_ACTIVE: boolean;
  HISTORY_NO_AUTH_ROUTE_IS_ACTIVE: boolean;
  
  CONTACT_EDIT_ROUTE_IS_ACTIVE: boolean;
  CONTACT_CONVS_ROUTE_IS_ACTIVE: boolean;
  CONTACTS_DEMO_ROUTE_IS_ACTIVE: boolean;
  CONTACTS_NO_AUTH_ROUTE_IS_ACTIVE: boolean;
  INTEGRATIONS_ROUTE_IS_ACTIVE: boolean;
  TRANSLATIONS_ROUTE_IS_ACTIVE: boolean;
  INSTALLATION_ROUTE_IS_ACTIVE: boolean;
  EMAIL_TICKETING_ROUTE_IS_ACTIVE: boolean;
  AUTOMATIONS_ROUTE_IS_ACTIVE: boolean;
  AUTOMATIONS_ROUTE_NO_AUTH_IS_ACTIVE: boolean;
  AUTOMATIONS_DEMO_ROUTE_IS_ACTIVE: boolean;
  NEW_BROADCAST_ROUTE_IS_ACTIVE: boolean;
  AUTOMATIONS_DETAILS_ROUTE_IS_ACTIVE: boolean;
  IS_REQUEST_FOR_PANEL_ROUTE: boolean;
  IS_UNSERVEDREQUEST_FOR_PANEL_ROUTE: boolean;
  BOTS_DEMO_ROUTE_IS_ACTIVE: boolean;
  // Chatbot sidebar
  MY_BOTS_ALL_ROUTE_IS_ACTIVE: boolean;
  MY_BOTS_ALL_ROUTE_IS_ACTIVE_NO_AUTH: boolean;
  EDIT_EXTERNAL_CHATBOT_ROUTE_IS_ACTIVE: boolean;
  MY_BOTS_IS_ROUTE_IS_ACTIVE: boolean;
  FLOW_AUTOMATION_ROUTE_IS_ACTIVE: boolean;
  FLOW_AIAGENT_ROUTE_IS_ACTIVE: boolean;
  FLOW_WEBHOOKS_ROUTE_IS_ACTIVE: boolean;
  MY_BOTS_CS_ROUTE_IS_ACTIVE: boolean;
  TMPLT_ALL_ROUTE_IS_ACTIVE: boolean;
  TMPLT_CMNT_ROUTE_IS_ACTIVE: boolean;
  TMPLT_IS_ROUTE_IS_ACTIVE: boolean;
  TMPLT_CS_ROUTE_IS_ACTIVE: boolean;
  OLD_KB_ROUTE_IS_ACTIVE: boolean;
  KB_ROUTE_IS_ACTIVE: boolean;
  KB_ROUTE_IS_ACTIVE_NO_AUTH: boolean;
  CREATE_BOT_ROUTE_IS_ACTIVE: boolean;
  SUPPORT_ROUTE_IS_ACTIVE: boolean;
  NORT_CONV_ROUTE_IS_ACTIVE: boolean;


  prjct_profile_name: string;
  prjct_trial_expired: boolean;
  prjc_trial_days_left: number
  prjc_trial_days_left_percentage: number
  isVisibleANA: boolean;
  isVisibleACT: boolean;
  isVisibleTRI: boolean;
  isVisibleGRO: boolean;
  isVisibleDEP: boolean;
  isVisibleOPH: boolean;
  isVisibleCAR: boolean;
  isVisibleLBS: boolean;
  isVisibleAPP: boolean;
  isVisiblePAY: boolean;
  isVisibleMON: boolean;
  isVisibleCNT: boolean;
  isVisibleINT: boolean;
  isVisibleAUT: boolean;
  storageBucket: string;
  baseUrl: string;
  default_dept_id: string;
  browserLang: string;
  dsbrd_lang: string;
  tlangparams: any
  flag_url: string;
  tooltip_text_for_availability_status: string
  plan_subscription_is_active: boolean;
  plan_name: string;
  _prjct_profile_name: string;
  plan_type: string;
  prjct_name: string;
  private unsubscribe$: Subject<any> = new Subject<any>();

  new_messages_count: number;

  NOTIFICATION_SOUND: string;
  storedValuePrefix = 'dshbrd----'
  hasPlayed = false
  currentUrl: string;
  audio: any;
  myChatbotCount: number;
  companySiteUrl: string;
  companyName: string;
  dialogRef: MatDialogRef<any>;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;
  areVisibleChatbot: boolean;
  isVisibleKNB: boolean;
  ARE_NEW_KB: boolean;
  kbNameSpaceid: string = '';
  currentProjectUser: any;
  isVisibleSupportMenu: boolean;
  company_brand_color: string;

  PERMISSION_TO_VIEW_MONITOR: boolean;
  PERMISSION_TO_VIEW_HISTORY: boolean;
  PERMISSION_TO_VIEW_CONTACTS: boolean;
  PERMISSION_TO_VIEW_FLOWS: boolean;
  PERMISSION_TO_VIEW_KB: boolean;
  PERMISSION_TO_VIEW_ANALYTICS: boolean;
  PERMISSION_TO_VIEW_ACTVITIES: boolean;
  PERMISSION_TO_VIEW_WA_BRODCAST: boolean;
  PERMISSION_TO_VIEW_SETTING: boolean;


  ROLE: string; 
  PERMISSION_TO_VIEW_WIDGET_SETUP: boolean;
  PERMISSION_TO_VIEW_DEPTS: boolean;
  PERMISSION_TO_VIEW_TEAMMATES_ROLES_GROUPS: boolean;
  PERMISSION_TO_VIEW_EMAIL_TICKETING: boolean;
  PERMISSION_TO_VIEW_CANNED_RESPONSES: boolean;
  PERMISSION_TO_VIEW_TAGS: boolean;
  PERMISSION_TO_VIEW_OH: boolean;
  PERMISSION_TO_VIEW_INTEGRATIONS: boolean;
  PERMISSION_TO_VIEW_APPS: boolean;
  PERMISSION_TO_VIEW_PROJECT_SETTINGS: boolean;
  isTiledeskDomain = false;

  constructor(
    private router: Router,
    public location: Location,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private auth: AuthService,
    private usersService: UsersService,
    private notify: NotifyService,
    private uploadImageService: UploadImageService,
    private uploadImageNativeService: UploadImageNativeService,
    private translate: TranslateService,
    public appConfigService: AppConfigService,
    private kbService: KnowledgeBaseService,
    public brandService: BrandService,
    public wsRequestsService: WsRequestsService,
    private logger: LoggerService,
    private sanitizer: DomSanitizer,
    private faqKbService: FaqKbService,
    public dialog: MatDialog,
    private prjctPlanService: ProjectPlanService,
    private shepherdService: ShepherdService,
    public localDbService: LocalDbService,
    private element: ElementRef,
    private renderer: Renderer2,
    public rolesService: RolesService
  ) {
    this.getBaseUrlAndThenProjectPlan();
    this.logger.log('[SIDEBAR] !!!!! HELLO SIDEBAR')

    const brand = brandService.getBrand();

    this.tparams = brand;
    if (brand) {
      this.companyLogoNoText = brand['COMPANY_LOGO_NO_TEXT'];
      this.companySiteUrl = brand["COMPANY_SITE_URL"]
      this.companyName = brand["COMPANY_NAME"]
      this.isVisibleSupportMenu = brand["SUPPORT_MENU"]
      this.company_brand_color = brand['BRAND_PRIMARY_COLOR'];
    }
  }

  ngOnInit() {
    this.getLoggedUser();
    this.getCurrentProjectProjectUsersProjectBots();
    this.translateChangeAvailabilitySuccessMsg();
    this.translateChangeAvailabilityErrorMsg();
    this.getProfileImageStorage();
    this.getUserAvailability();
    this.getUserUserIsBusy();
    this.getProjectUserId();
    this.hasChangedAvailabilityStatusInUsersComp();
    this.checkUserImageUploadIsComplete();
    // used when the page is refreshed
    this.checkUserImageExist();
    this.subscribeToMyAvailibilityCount();
    this.getCurrentRoute();
    this.getOSCODE();
    // this.getDahordBaseUrlThenOSCODE()
    this.brandLog();
    // this.getHasOpenBlogKey()
    this.getChatUrl();
    this.isMac();
    this.listenHasDeleteUserProfileImage();
    this.listenToForegroundNotificationCount(); // nk commented
    this.listenSoundPreference();
    this.getNotificationSoundPreferences();
    this.getWsCurrentUserAvailability$();
    // this.getProjectPlan()

    // this.listenToKbVersion()

    // document.documentElement.style.setProperty('--sidebar-active-icon', this.company_brand_color);
    this.listenToProjectUser()
  }

  ngAfterViewInit() {
    // const pathElement = this.svgPath.nativeElement;
    // this.logger.log('[SIDEBAR] pathElement ', pathElement)
    // this.renderer.setStyle(this.element.nativeElement, '--brandColor', this.company_brand_color);
    if (this.company_brand_color) {
      // this.element.nativeElement.querySelector('.project_background').style.setProperty('--brandColor', this.company_brand_color)
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  listenToProjectUser() {
    this.rolesService.listenToProjectUserPermissions(this.unsubscribe$);
    this.rolesService.getUpdateRequestPermission()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(status => {
        this.ROLE = status.role
        console.log('[SIDEBAR] - Role:', this.ROLE);
    
        console.log('[SIDEBAR] - Permissions:', status.matchedPermissions);
        // -------------------------------
        // PERMISSION TO VIEW MONITOR
        // -------------------------------
        if (status.role !== 'owner' && status.role !== 'admin' && status.role !== 'agent') {

          if (status.matchedPermissions.includes(PERMISSIONS.INBOX_READ)) {
            this.PERMISSION_TO_VIEW_MONITOR = true
            console.log('[SIDEBAR] - PERMISSION_TO_VIEW_MONITOR ', this.PERMISSION_TO_VIEW_MONITOR);
          } else {
            this.PERMISSION_TO_VIEW_MONITOR = false

            console.log('[SIDEBAR] - PERMISSION_TO_VIEW_MONITOR ', this.PERMISSION_TO_VIEW_MONITOR);
          }
        } else {
          this.PERMISSION_TO_VIEW_MONITOR = true
          console.log('[SIDEBAR] - Project user has a default role ', status.role, 'PERMISSION_TO_VIEW_MONITOR ', this.PERMISSION_TO_VIEW_MONITOR);
        }

        // -------------------------------
        // PERMISSION TO VIEW HISTORY
        // -------------------------------
        if (status.role !== 'owner' && status.role !== 'admin' && status.role !== 'agent') {

          if (status.matchedPermissions.includes(PERMISSIONS.HISTORY_READ)) {
            this.PERMISSION_TO_VIEW_HISTORY = true
            console.log('[SIDEBAR] - PERMISSION_TO_VIEW_HISTORY ', this.PERMISSION_TO_VIEW_HISTORY);
          } else {
            this.PERMISSION_TO_VIEW_HISTORY = false

            console.log('[SIDEBAR] - PERMISSION_TO_VIEW_HISTORY ', this.PERMISSION_TO_VIEW_HISTORY);
          }
        } else {
          this.PERMISSION_TO_VIEW_HISTORY = true
          console.log('[SIDEBAR] - Project user has a default role ', status.role, 'PERMISSION_TO_VIEW_HISTORY ', this.PERMISSION_TO_VIEW_HISTORY);
        }
        // -------------------------------
        // PERMISSION TO VIEW CONTACTS
        // -------------------------------
        if (status.role !== 'owner' && status.role !== 'admin' && status.role !== 'agent') {

          if (status.matchedPermissions.includes(PERMISSIONS.LEADS_READ)) {
            this.PERMISSION_TO_VIEW_CONTACTS = true
            console.log('[SIDEBAR] - PERMISSION_TO_VIEW_CONTACTS ', this.PERMISSION_TO_VIEW_CONTACTS);
          } else {
            this.PERMISSION_TO_VIEW_CONTACTS = false

            console.log('[SIDEBAR] - PERMISSION_TO_VIEW_CONTACTS ', this.PERMISSION_TO_VIEW_CONTACTS);
          }
        } else {
          this.PERMISSION_TO_VIEW_CONTACTS = true
          console.log('[SIDEBAR] - Project user has a default role ', status.role, 'PERMISSION_TO_VIEW_CONTACTS ', this.PERMISSION_TO_VIEW_CONTACTS);
        }

        // ---------------------------------
        // PERMISSION TO FLOWS
        // ---------------------------------
        if (status.role === 'owner' || status.role === 'admin') {
          // Owner and admin always has permission
          this.PERMISSION_TO_VIEW_FLOWS = true;
          console.log('[SIDEBAR] - Project user is owner or admin (1)', 'PERMISSION_TO_VIEW_FLOWS:', this.PERMISSION_TO_VIEW_FLOWS);

        } else if (status.role === 'agent') {
          // Agent never have permission
          this.PERMISSION_TO_VIEW_FLOWS = false;
          console.log('[SIDEBAR] - Project user agent (2)', 'PERMISSION_TO_VIEW_FLOWS:', this.PERMISSION_TO_VIEW_FLOWS);

        } else {
          // Custom roles: permission depends on matchedPermissions
          this.PERMISSION_TO_VIEW_FLOWS = status.matchedPermissions.includes(PERMISSIONS.FLOWS_READ);
          console.log('[SIDEBAR] - Custom role (3) role', status.role, 'PERMISSION_TO_VIEW_FLOWS:', this.PERMISSION_TO_VIEW_FLOWS);
        }

        // -------------------------------
        // PERMISSION TO VIEW KB
        // -------------------------------
        if (status.role === 'owner' || status.role === 'admin') {
          // Owner and admin always has permission
          this.PERMISSION_TO_VIEW_KB = true;
          console.log('[SIDEBAR] - Project user is owner or admin (1)', 'PERMISSION_TO_VIEW_KB:', this.PERMISSION_TO_VIEW_KB);

        } else if (status.role === 'agent') {
          // Agent never have permission
          this.PERMISSION_TO_VIEW_KB = false;
          console.log('[SIDEBAR] - Project user agent (2)', 'PERMISSION_TO_VIEW_KB:', this.PERMISSION_TO_VIEW_KB);

        } else {
          // Custom roles: permission depends on matchedPermissions
          this.PERMISSION_TO_VIEW_KB = status.matchedPermissions.includes(PERMISSIONS.KB_READ);
          console.log('[SIDEBAR] - Custom role (3) role', status.role, 'PERMISSION_TO_VIEW_KB:', this.PERMISSION_TO_VIEW_KB);
        }

        // -------------------------------
        // PERMISSION_TO_VIEW_ANALYTICS
        // -------------------------------
        if (status.role === 'owner' || status.role === 'admin') {
          // Owner and admin always has permission
          this.PERMISSION_TO_VIEW_ANALYTICS = true;
          console.log('[SIDEBAR] - Project user is owner or admin (1)', 'PERMISSION_TO_VIEW_ANALYTICS:', this.PERMISSION_TO_VIEW_ANALYTICS);

        } else if (status.role === 'agent') {
          // Agent never have permission
          this.PERMISSION_TO_VIEW_ANALYTICS = false;
          console.log('[SIDEBAR] - Project user agent (2)', 'PERMISSION_TO_VIEW_ANALYTICS:', this.PERMISSION_TO_VIEW_ANALYTICS);

        } else {
          // Custom roles: permission depends on matchedPermissions
          this.PERMISSION_TO_VIEW_ANALYTICS = status.matchedPermissions.includes(PERMISSIONS.ANALYTICS_READ);
          console.log('[SIDEBAR] - Custom role (3) role', status.role, 'PERMISSION_TO_VIEW_ANALYTICS:', this.PERMISSION_TO_VIEW_ANALYTICS);
        }

        // -------------------------------
        // PERMISSION_TO_VIEW_ACTVITIES
        // -------------------------------
         if (status.role === 'owner' || status.role === 'admin') {
          // Owner and admin always has permission
          this.PERMISSION_TO_VIEW_ACTVITIES = true;
          console.log('[SIDEBAR] - Project user is owner or admin (1)', 'PERMISSION_TO_VIEW_ACTVITIES:', this.PERMISSION_TO_VIEW_ACTVITIES);

        } else if (status.role === 'agent') {
          // Agent never have permission
          this.PERMISSION_TO_VIEW_ACTVITIES = false;
          console.log('[SIDEBAR] - Project user agent (2)', 'PERMISSION_TO_VIEW_ACTVITIES:', this.PERMISSION_TO_VIEW_ACTVITIES);

        } else {
          // Custom roles: permission depends on matchedPermissions
          this.PERMISSION_TO_VIEW_ACTVITIES = status.matchedPermissions.includes(PERMISSIONS.ACTIVITIES_READ);
          console.log('[SIDEBAR] - Custom role (3) role', status.role, 'PERMISSION_TO_VIEW_ACTVITIES:', this.PERMISSION_TO_VIEW_ACTVITIES);
        }

        // -------------------------------
        // PERMISSION_TO_VIEW_WA_BRODCAST
        // -------------------------------
         if (status.role === 'owner' || status.role === 'admin') {
          // Owner and admin always has permission
          this.PERMISSION_TO_VIEW_WA_BRODCAST = true;
          console.log('[SIDEBAR] - Project user is owner or admin (1)', 'PERMISSION_TO_VIEW_WA_BRODCAST:', this.PERMISSION_TO_VIEW_WA_BRODCAST);

        } else if (status.role === 'agent') {
          // Agent never have permission
          this.PERMISSION_TO_VIEW_WA_BRODCAST = false;
          console.log('[SIDEBAR] - Project user agent (2)', 'PERMISSION_TO_VIEW_WA_BRODCAST:', this.PERMISSION_TO_VIEW_WA_BRODCAST);

        } else {
          // Custom roles: permission depends on matchedPermissions
          this.PERMISSION_TO_VIEW_WA_BRODCAST = status.matchedPermissions.includes(PERMISSIONS.AUTOMATIONSLOG_READ);
          console.log('[SIDEBAR] - Custom role (3) role', status.role, 'PERMISSION_TO_VIEW_ACTVITIES:', this.PERMISSION_TO_VIEW_WA_BRODCAST);
        }
        // -------------------------------
        // PERMISSION_TO_VIEW_SETTING
        // -------------------------------
        if (status.role === 'owner' || status.role === 'admin') {
          // Owner and admin always has permission
          this.PERMISSION_TO_VIEW_SETTING = true;
          console.log('[SIDEBAR] - Project user is owner or admin', 'PERMISSION_TO_VIEW_SETTING:', this.PERMISSION_TO_VIEW_SETTING);

        } else if (status.role === 'agent') {
            // Agent never have permission
            this.PERMISSION_TO_VIEW_SETTING = false;
            console.log('[SIDEBAR] - Project user is agent', 'PERMISSION_TO_VIEW_SETTING:', this.PERMISSION_TO_VIEW_SETTING);

        } else {
            // Custom roles: permission depends on matchedPermissions
            // PERMISSIONS.PROJECTSETTINGS_SUBSCRIPTION_READ,
            const requiredPermissions = [
                PERMISSIONS.WIDGETSETUP_READ, 
                PERMISSIONS.DEPARTMENTS_LIST_READ, 
                PERMISSIONS.TEAMMATES_READ, 
                PERMISSIONS.ROLES_READ, 
                PERMISSIONS.GROUPS_READ,
                PERMISSIONS.EMAIL_TICKETING_READ,
                PERMISSIONS.CANNED_RESPONSES_READ,
                PERMISSIONS.TAGS_READ,
                PERMISSIONS.HOURS_READ,
                PERMISSIONS.INTEGRATIONS_READ,
                PERMISSIONS.APPS_READ,
                PERMISSIONS.PROJECTSETTINGS_GENERAL_READ,
                PERMISSIONS.PROJECTSETTINGS_DEVELOPER_READ,
                PERMISSIONS.PROJECTSETTINGS_SMARTASSIGNMENT_READ,
                PERMISSIONS.PROJECTSETTINGS_NOTIFICATION_READ,
                PERMISSIONS.PROJECTSETTINGS_SECURITY_READ,
                PERMISSIONS.PROJECTSETTINGS_BANNED_READ,
                PERMISSIONS.PROJECTSETTINGS_ADVANCED_READ
            ];
            
            this.PERMISSION_TO_VIEW_SETTING = requiredPermissions.some(permission => 
                status.matchedPermissions.includes(permission)
            );
      
          console.log('[SIDEBAR] - Custom role', status.role, 'PERMISSION_TO_VIEW_SETTING:', this.PERMISSION_TO_VIEW_SETTING);
        }


          // TO MANAGE THE NAVIGATION ON THE SETTINGS BTN CLICK  //
          // ---------------------------------
          // PERMISSION_TO_VIEW_WIDGET_SETUP
          // ---------------------------------
          if (status.role === 'owner' || status.role === 'admin') {
            // Owner and admin always has permission
            this.PERMISSION_TO_VIEW_WIDGET_SETUP = true;
            console.log('[SETTINGS-SIDEBAR] - Project user is owner or admin (1)', 'PERMISSION_TO_VIEW_WIDGET_SETUP:', this.PERMISSION_TO_VIEW_WIDGET_SETUP);
  
          } else if (status.role === 'agent') {
            // Agent never have permission
            this.PERMISSION_TO_VIEW_WIDGET_SETUP = false;
            console.log('[SETTINGS-SIDEBAR] - Project user agent (2)', 'PERMISSION_TO_VIEW_WIDGET_SETUP:', this.PERMISSION_TO_VIEW_WIDGET_SETUP);
  
          } else {
            // Custom roles: permission depends on matchedPermissions
            this.PERMISSION_TO_VIEW_WIDGET_SETUP = status.matchedPermissions.includes(PERMISSIONS.WIDGETSETUP_READ);
            console.log('[SETTINGS-SIDEBAR] - Custom role (3) role', status.role, 'PERMISSION_TO_VIEW_WIDGET_SETUP:', this.PERMISSION_TO_VIEW_WIDGET_SETUP);
          }
  
          // -------------------------------
          // PERMISSION_TO_VIEW_DEPTS
          // -------------------------------
          if (status.role === 'owner' || status.role === 'admin') {
            // Owner and admin always has permission
            this.PERMISSION_TO_VIEW_DEPTS = true;
            console.log('[SETTINGS-SIDEBAR] - Project user is owner or admin (1)', 'PERMISSION_TO_VIEW_DEPTS:', this.PERMISSION_TO_VIEW_DEPTS);
  
          } else if (status.role === 'agent') {
            // Agent never have permission
            this.PERMISSION_TO_VIEW_DEPTS = false;
            console.log('[SETTINGS-SIDEBAR] - Project user agent (2)', 'PERMISSION_TO_VIEW_DEPTS:', this.PERMISSION_TO_VIEW_DEPTS);
  
          } else {
            // Custom roles: permission depends on matchedPermissions
            this.PERMISSION_TO_VIEW_DEPTS = status.matchedPermissions.includes(PERMISSIONS.DEPARTMENTS_LIST_READ);
            console.log('[SETTINGS-SIDEBAR] - Custom role (3) role', status.role, 'PERMISSION_TO_VIEW_DEPTS:', this.PERMISSION_TO_VIEW_DEPTS);
          }

          // ------------------------------------------
          // PERMISSION_TO_VIEW_TEAMMATES_ROLES_GROUPS
          // ------------------------------------------
          if (status.role === 'owner' || status.role === 'admin') {
            // Owner and admin always has permission
            this.PERMISSION_TO_VIEW_TEAMMATES_ROLES_GROUPS = true;
            console.log('[SETTINGS-SIDEBAR] - Project user is owner or admin', 'PERMISSION_TO_VIEW_TEAMMATES_ROLES_GROUPS:', this.PERMISSION_TO_VIEW_TEAMMATES_ROLES_GROUPS);
  
          } else if (status.role === 'agent') {
              // Agent never have permission
              this.PERMISSION_TO_VIEW_TEAMMATES_ROLES_GROUPS = false;
              console.log('[SETTINGS-SIDEBAR] - Project user is agent', 'PERMISSION_TO_VIEW_TEAMMATES_ROLES_GROUPS:', this.PERMISSION_TO_VIEW_TEAMMATES_ROLES_GROUPS);
  
          } else {
              // Custom roles: permission depends on matchedPermissions
              const requiredPermissions = [
                  PERMISSIONS.TEAMMATES_READ, 
                  PERMISSIONS.ROLES_READ, 
                  PERMISSIONS.GROUPS_READ,
              ];
              
              this.PERMISSION_TO_VIEW_TEAMMATES_ROLES_GROUPS = requiredPermissions.some(permission => 
                  status.matchedPermissions.includes(permission)
              );
        
            console.log('[SETTINGS-SIDEBAR] - Custom role', status.role, 'PERMISSION_TO_VIEW_TEAMMATES_ROLES_GROUPS:', this.PERMISSION_TO_VIEW_TEAMMATES_ROLES_GROUPS);
          }

          // -----------------------------------
          // PERMISSION_TO_VIEW_EMAIL_TICKETING
          // -----------------------------------
          if (status.role === 'owner' || status.role === 'admin') {
            // Owner and admin always has permission
            this.PERMISSION_TO_VIEW_EMAIL_TICKETING = true;
            console.log('[SETTINGS-SIDEBAR] - Project user is owner or admin (1)', 'PERMISSION_TO_VIEW_EMAIL_TICKETING:', this.PERMISSION_TO_VIEW_EMAIL_TICKETING);
  
          } else if (status.role === 'agent') {
            // Agent never have permission
            this.PERMISSION_TO_VIEW_EMAIL_TICKETING = false;
            console.log('[SETTINGS-SIDEBAR] - Project user agent (2)', 'PERMISSION_TO_VIEW_EMAIL_TICKETING:', this.PERMISSION_TO_VIEW_EMAIL_TICKETING);
  
          } else {
            // Custom roles: permission depends on matchedPermissions
            this.PERMISSION_TO_VIEW_EMAIL_TICKETING = status.matchedPermissions.includes(PERMISSIONS.EMAIL_TICKETING_READ);
            console.log('[SETTINGS-SIDEBAR] - Custom role (3) role', status.role, 'PERMISSION_TO_VIEW_EMAIL_TICKETING:', this.PERMISSION_TO_VIEW_EMAIL_TICKETING);
          }
  
          // -----------------------------------
          // PERMISSION_TO_VIEW_CANNED_RESPONSES
          // -----------------------------------
          if (status.role === 'owner' || status.role === 'admin') {
            // Owner and admin always has permission
            this.PERMISSION_TO_VIEW_CANNED_RESPONSES = true;
            console.log('[SETTINGS-SIDEBAR] - Project user is owner or admin (1)', 'PERMISSION_TO_VIEW_CANNED_RESPONSES:', this.PERMISSION_TO_VIEW_CANNED_RESPONSES);
  
          } else if (status.role === 'agent') {
            // Agent never have permission
            this.PERMISSION_TO_VIEW_CANNED_RESPONSES = false;
            console.log('[SETTINGS-SIDEBAR] - Project user agent (2)', 'PERMISSION_TO_VIEW_CANNED_RESPONSES:', this.PERMISSION_TO_VIEW_CANNED_RESPONSES);
  
          } else {
            // Custom roles: permission depends on matchedPermissions
            this.PERMISSION_TO_VIEW_CANNED_RESPONSES = status.matchedPermissions.includes(PERMISSIONS.CANNED_RESPONSES_READ);
            console.log('[SETTINGS-SIDEBAR] - Custom role (3) role', status.role, 'PERMISSION_TO_VIEW_CANNED_RESPONSES:', this.PERMISSION_TO_VIEW_CANNED_RESPONSES);
          }
  
          // -------------------------------
          // PERMISSION_TO_VIEW_TAGS
          // -------------------------------
          if (status.role === 'owner' || status.role === 'admin') {
            // Owner and admin always has permission
            this.PERMISSION_TO_VIEW_TAGS = true;
            console.log('[SETTINGS-SIDEBAR] - Project user is owner or admin (1)', 'PERMISSION_TO_VIEW_TAGS:', this.PERMISSION_TO_VIEW_TAGS);
  
          } else if (status.role === 'agent') {
            // Agent never have permission
            this.PERMISSION_TO_VIEW_TAGS = false;
            console.log('[SETTINGS-SIDEBAR] - Project user agent (2)', 'PERMISSION_TO_VIEW_TAGS:', this.PERMISSION_TO_VIEW_TAGS);
  
          } else {
            // Custom roles: permission depends on matchedPermissions
            this.PERMISSION_TO_VIEW_TAGS = status.matchedPermissions.includes(PERMISSIONS.TAGS_READ);
            console.log('[SETTINGS-SIDEBAR] - Custom role (3) role', status.role, 'PERMISSION_TO_VIEW_ACTVITIES:', this.PERMISSION_TO_VIEW_TAGS);
          }

          // -------------------------------
          // PERMISSION_TO_VIEW_OH
          // -------------------------------
          if (status.role === 'owner' || status.role === 'admin') {
            // Owner and admin always has permission
            this.PERMISSION_TO_VIEW_OH = true;
            console.log('[SETTINGS-SIDEBAR] - Project user is owner or admin (1)', 'PERMISSION_TO_VIEW_OH:', this.PERMISSION_TO_VIEW_OH);
  
          } else if (status.role === 'agent') {
            // Agent never have permission
            this.PERMISSION_TO_VIEW_OH = false;
            console.log('[SETTINGS-SIDEBAR] - Project user agent (2)', 'PERMISSION_TO_VIEW_OH:', this.PERMISSION_TO_VIEW_OH);
  
          } else {
            // Custom roles: permission depends on matchedPermissions
            this.PERMISSION_TO_VIEW_OH = status.matchedPermissions.includes(PERMISSIONS.HOURS_READ);
            console.log('[SETTINGS-SIDEBAR] - Custom role (3) role', status.role, 'PERMISSION_TO_VIEW_OH:', this.PERMISSION_TO_VIEW_OH);
          }

          // -------------------------------
          // PERMISSION_TO_VIEW_INTEGRATIONS
          // -------------------------------
          if (status.role === 'owner' || status.role === 'admin') {
            // Owner and admin always has permission
            this.PERMISSION_TO_VIEW_INTEGRATIONS = true;
            console.log('[SETTINGS-SIDEBAR] - Project user is owner or admin (1)', 'PERMISSION_TO_VIEW_INTEGRATIONS:', this.PERMISSION_TO_VIEW_INTEGRATIONS);
  
          } else if (status.role === 'agent') {
            // Agent never have permission
            this.PERMISSION_TO_VIEW_INTEGRATIONS = false;
            console.log('[SETTINGS-SIDEBAR] - Project user agent (2)', 'PERMISSION_TO_VIEW_INTEGRATIONS:', this.PERMISSION_TO_VIEW_INTEGRATIONS);
  
          } else {
            // Custom roles: permission depends on matchedPermissions
            this.PERMISSION_TO_VIEW_INTEGRATIONS = status.matchedPermissions.includes(PERMISSIONS.INTEGRATIONS_READ);
            console.log('[SETTINGS-SIDEBAR] - Custom role (3) role', status.role, 'PERMISSION_TO_VIEW_INTEGRATIONS:', this.PERMISSION_TO_VIEW_INTEGRATIONS);
          }

          // -----------------------
          // PERMISSION_TO_VIEW_APPS
          // -----------------------
          if (status.role === 'owner' || status.role === 'admin') {
            // Owner and admin always has permission
            this.PERMISSION_TO_VIEW_APPS = true;
            console.log('[SETTINGS-SIDEBAR] - Project user is owner or admin (1)', 'PERMISSION_TO_VIEW_APPS:', this.PERMISSION_TO_VIEW_APPS);
  
          } else if (status.role === 'agent') {
            // Agent never have permission
            this.PERMISSION_TO_VIEW_APPS = false;
            console.log('[SETTINGS-SIDEBAR] - Project user agent (2)', 'PERMISSION_TO_VIEW_APPS:', this.PERMISSION_TO_VIEW_APPS);
  
          } else {
            // Custom roles: permission depends on matchedPermissions
            this.PERMISSION_TO_VIEW_APPS = status.matchedPermissions.includes(PERMISSIONS.APPS_READ);
            console.log('[SETTINGS-SIDEBAR] - Custom role (3) role', status.role, 'PERMISSION_TO_VIEW_APPS:', this.PERMISSION_TO_VIEW_APPS);
          }

          // ------------------------------------------
          // PERMISSION_TO_VIEW_PROJECT_SETTINGS
          // ------------------------------------------
          if (status.role === 'owner' || status.role === 'admin') {
            // Owner and admin always has permission
            this.PERMISSION_TO_VIEW_PROJECT_SETTINGS = true;
            console.log('[SETTINGS-SIDEBAR] - Project user is owner or admin', 'PERMISSION_TO_VIEW_PROJECT_SETTINGS:', this.PERMISSION_TO_VIEW_PROJECT_SETTINGS);
  
          } else if (status.role === 'agent') {
              // Agent never have permission
              this.PERMISSION_TO_VIEW_TEAMMATES_ROLES_GROUPS = false;
              console.log('[SETTINGS-SIDEBAR] - Project user is agent', 'PERMISSION_TO_VIEW_PROJECT_SETTINGS:', this.PERMISSION_TO_VIEW_PROJECT_SETTINGS);
  
          } else {
              // Custom roles: permission depends on matchedPermissions

              // PERMISSIONS.PROJECTSETTINGS_SUBSCRIPTION_READ, 
              const requiredPermissions = [
                  PERMISSIONS.PROJECTSETTINGS_GENERAL_READ, 
                  PERMISSIONS.PROJECTSETTINGS_DEVELOPER_READ,
                  PERMISSIONS.PROJECTSETTINGS_SMARTASSIGNMENT_READ,
                  PERMISSIONS.PROJECTSETTINGS_NOTIFICATION_READ,
                  PERMISSIONS.PROJECTSETTINGS_SECURITY_READ,
                  PERMISSIONS.PROJECTSETTINGS_BANNED_READ,
                  PERMISSIONS.PROJECTSETTINGS_ADVANCED_READ
              ];
              
              this.PERMISSION_TO_VIEW_PROJECT_SETTINGS = requiredPermissions.some(permission => 
                  status.matchedPermissions.includes(permission)
              );
        
            console.log('[SETTINGS-SIDEBAR] - Custom role', status.role, 'PERMISSION_TO_VIEW_PROJECT_SETTINGS:', this.PERMISSION_TO_VIEW_PROJECT_SETTINGS);
          }
      });
  }


  // ngAfterContentInit(): void { 
  //   if (this.company_brand_color) { 
  //     this.logger.log('[SIDEBAR] company_brand_color ', this.company_brand_color)
  //      const pathElement = this.element.nativeElement.querySelector('.item-active').style.setProperty('--brandColor', this.company_brand_color)
  //      this.logger.log('[SIDEBAR] pathElement ', pathElement)

  //      this.renderer.setStyle(document.documentElement, '--sidebar-active-icon', this.company_brand_color);
  //     this.renderer.setStyle(document.body, '--sidebar-active-icon', this.company_brand_color);
  //   }
  // }


  getBaseUrlAndThenProjectPlan() {
    // For test in local host
    // const currentDomain = "https://panel.tiledesk.com/v3/dashboard/#/project/63a075485f117f0013541e32/bots/templates/community"
    const currentDomain = window.location.hostname;
    this.isTiledeskDomain = currentDomain.includes('tiledesk.com');
    this.logger.log('[SIDEBAR] isTiledeskDomain ', this.isTiledeskDomain)

    const href = window.location.href;

    this.logger.log('[SIDEBAR] href ', href)

    const hrefArray = href.split('/#/');
    const dshbrdBaseUrl = hrefArray[0]

    this.logger.log('[SIDEBAR] dshbrdBaseUrl ', dshbrdBaseUrl)
    this.logger.log('[SIDEBAR]  dshbrdBaseUrl includes tiledesk.com', dshbrdBaseUrl.includes('tiledesk.com'));

    if (dshbrdBaseUrl.includes('tiledesk.com')) {
      this.areVisibleChatbot = true;
      this.isVisibleKNB = true;
      // this.listenToKbVersion() // no more used
    }

    if (!dshbrdBaseUrl.includes('tiledesk.com')) {
      this.getProjectPlan()

      // FOR KB MOVED HERE FROM BOTS-SIDEBAR
      this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
      if (this.public_Key.includes("KNB")) {
        let parts = this.public_Key.split('-');
        // this.logger.log('[BOTS-SIDEBAR] getAppConfig  parts ', parts);

        let kbn = parts.find((part) => part.startsWith('KNB'));
        this.logger.log('[SIDEBAR] kbn from FT', kbn);
        let kbnParts = kbn.split(':');
        this.logger.log('[SIDEBAR] kbnParts from FT', kbnParts);
        let kbnValue = kbnParts[1]
        this.logger.log('[SIDEBAR] kbnValue from FT', kbnValue);

        if (kbnValue === 'T') {
          this.getProjectPlan()
          // this.listenToKbVersion() // no more used

        } else if (kbnValue === 'F') {
          this.isVisibleKNB = false;
        }

      } else {
        this.isVisibleKNB = false;
        this.logger.log('[BOTS-SIDEBAR] this.public_Key.includes("KNB")', this.public_Key.includes("KNB"))
      }
    }
  }

  // no more used
  // listenToKbVersion() {
  //   this.kbService.newKb
  //     .pipe(
  //       takeUntil(this.unsubscribe$)
  //     )
  //     .subscribe((newKb) => {
  //       this.logger.log('[BOTS-SIDEBAR] - are new KB ', newKb)
  //       this.ARE_NEW_KB = newKb;
  //     })
  // }

  getProjectPlan() {
    this.prjctPlanService.projectPlan$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((projectProfileData: any) => {
        this.logger.log('[SIDEBAR] - getProjectPlan project Profile Data', projectProfileData)
        if (projectProfileData) {
          this.manageChatbotVisibility(projectProfileData);
          this.manageknowledgeBasesVisibility(projectProfileData)
        }
      }, error => {

        this.logger.error('[SIDEBAR] - getProjectPlan - ERROR', error);
      }, () => {
        this.logger.log('[SIDEBAR] - getProjectPlan * COMPLETE *')
      });
  }

  manageChatbotVisibility(projectProfileData) {
    if (projectProfileData['customization']) {
      this.logger.log('[SIDEBAR] USECASE EXIST customization > chatbot (1)', projectProfileData['customization']['chatbot'])
    }

    if (projectProfileData['customization'] && projectProfileData['customization']['chatbot'] !== undefined) {
      this.logger.log('[SIDEBAR] USECASE A EXIST customization ', projectProfileData['customization'], ' & chatbot', projectProfileData['customization']['chatbot'])

      if (projectProfileData['customization']['chatbot'] === true) {
        this.areVisibleChatbot = true;
        this.logger.log('[SIDEBAR] manageChatbotVisibility USECASE A areVisibleChatbot', this.areVisibleChatbot)
      } else if (projectProfileData['customization']['chatbot'] === false) {

        this.areVisibleChatbot = false;
        this.logger.log('[SIDEBAR] manageChatbotVisibility USECASE A areVisibleChatbot', this.areVisibleChatbot)
      }

    } else if (projectProfileData['customization'] && projectProfileData['customization']['chatbot'] === undefined) {
      //this.logger.log('[SIDEBAR] USECASE B EXIST customization ', projectProfileData['customization'], ' BUT chatbot IS', projectProfileData['customization']['chatbot'])
      this.areVisibleChatbot = true;
      this.logger.log('[SIDEBAR] manageChatbotVisibility USECASE B EXIST customization ', projectProfileData['customization'], ' BUT chatbot IS', projectProfileData['customization']['chatbot'], ' areVisibleChatbot ', this.areVisibleChatbot)

    } else if (projectProfileData['customization'] === undefined) {
      //this.logger.log('[SIDEBAR] USECASE C customization is  ', projectProfileData['customization'])
      this.areVisibleChatbot = true;
      this.logger.log('[SIDEBAR] manageChatbotVisibility USECASE C customization is  ', projectProfileData['customization'], ' areVisibleChatbot ', this.areVisibleChatbot)

    }
  }

  manageknowledgeBasesVisibility(projectProfileData) {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    if (projectProfileData['customization']) {
      this.logger.log('[BOTS-SIDEBAR] manageknowledgeBasesVisibility USECASE EXIST customization > knowledgeBases (1)', projectProfileData['customization']['knowledgeBases'])
    }

    if (projectProfileData['customization'] && projectProfileData['customization']['knowledgeBases'] !== undefined) {
      this.logger.log('[BOTS-SIDEBAR] manageknowledgeBasesVisibility USECASE A EXIST customization ', projectProfileData['customization'], ' & knowledgeBases', projectProfileData['customization']['knowledgeBases'])

      if (projectProfileData['customization']['knowledgeBases'] === true) {
        this.isVisibleKNB = true;
        this.logger.log('[BOTS-SIDEBAR] manageknowledgeBasesVisibility USECASE A isVisibleKNB', this.isVisibleKNB)
      } else if (projectProfileData['customization']['knowledgeBases'] === false) {

        this.isVisibleKNB = false;
        this.logger.log('[BOTS-SIDEBAR] manageknowledgeBasesVisibility USECASE A isVisibleKNB', this.isVisibleKNB)
      }


    } else if (projectProfileData['customization'] && projectProfileData['customization']['knowledgeBases'] === undefined) {
      this.logger.log('[BOTS-SIDEBAR] manageknowledgeBasesVisibility USECASE B EXIST customization ', projectProfileData['customization'], ' BUT knowledgeBases IS', projectProfileData['customization']['knowledgeBases'])

      // if (this.public_Key.includes("KNB")) {
      this.logger.log('[BOTS-SIDEBAR] manageknowledgeBasesVisibility USECASE B  (from FT) - EXIST KNB ', this.public_Key.includes("KNB"));

      this.isVisibleKNB = this.getKnbValue()
      this.logger.log('[BOTS-SIDEBAR]  this.isVisibleKNB from FT ', this.isVisibleKNB)
      // if (key.includes("KNB")) {
      //   // this.logger.log('PUBLIC-KEY (BOTS-SIDEBAR) - key', key);
      //   let wun = key.split(":");
      //   //  this.logger.log('PUBLIC-KEY (BOTS-SIDEBAR) - ips key&value', ips);
      //   if (wun[1] === "F") {
      //     this.isVisibleKNB = false;
      //     this.logger.log('[BOTS-SIDEBAR] Widget unbranding USECASE B  (from FT) isVisibleKNB', this.isVisibleKNB);
      //     // this.logger.log('PUBLIC-KEY (BOTS-SIDEBAR) - isVisibleKNB', this.isVisibleAutoSendTranscript);
      //   } else {
      //     this.isVisibleKNB = true;
      //     this.logger.log('[BOTS-SIDEBAR] Widget unbranding  USECASE B  (from FT) isVisibleKNB', this.isVisibleKNB);
      //     // this.logger.log('PUBLIC-KEY (BOTS-SIDEBAR) - isVisibleKNB', this.isVisibleAutoSendTranscript);
      //   }
      // }
      // } else if (!this.public_Key.includes("KNB")) {
      //   this.logger.log('[BOTS-SIDEBAR] manageknowledgeBasesVisibility isVisibleKNB  USECASE B (from FT) -  EXIST KNB ', this.public_Key.includes("KNB"));
      //   this.isVisibleKNB = false;
      //   this.logger.log('[BOTS-SIDEBAR] manageknowledgeBasesVisibility isVisibleKNB  USECASE B (from FT) ', this.isVisibleKNB);
      // }

    } else if (projectProfileData['customization'] === undefined) {
      this.logger.log('[BOTS-SIDEBAR] manageknowledgeBasesVisibility USECASE C customization is  ', projectProfileData['customization'], 'get value from FT')
      // if (this.public_Key.includes("KNB")) {
      // this.logger.log('[BOTS-SIDEBAR] manageknowledgeBasesVisibility  USECASE B  (from FT) - EXIST KNB ', this.public_Key.includes("KNB"));

      this.isVisibleKNB = this.getKnbValue()
      this.logger.log('[BOTS-SIDEBAR]  this.isVisibleKNB from FT ', this.isVisibleKNB)

    }
  }

  getKnbValue() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    // this.logger.log('[BOTS-SIDEBAR] getAppConfig  public_Key', this.public_Key);
    // this.logger.log('[BOTS-SIDEBAR] getAppConfig  public_Key type of', typeof this.public_Key);
    // this.logger.log('[BOTS-SIDEBAR] getAppConfig  this.public_Key.includes("KNB") ', this.public_Key.includes("KNB"));
    // let substring = this.public_Key.substring(this.public_Key.indexOf('KNB'));
    let parts = this.public_Key.split('-');
    // this.logger.log('[BOTS-SIDEBAR] getAppConfig  parts ', parts);

    let kbn = parts.find((part) => part.startsWith('KNB'));
    this.logger.log('[BOTS-SIDEBAR] manageknowledgeBasesVisibility  kbn ', kbn);
    let kbnParts = kbn.split(':');
    this.logger.log('[BOTS-SIDEBAR] manageknowledgeBasesVisibility  kbnParts ', kbnParts);
    let kbnValue = kbnParts[1]
    this.logger.log('[BOTS-SIDEBAR] manageknowledgeBasesVisibility  kbnValue ', kbnValue);
    if (kbnValue === 'T') {
      return true
    } else if (kbnValue === 'F') {
      return false
    }

  }


  presentDialogResetBusy() {
    this.logger.log('[SIDEBAR] presentDialogResetBusy ')
    if (this.dialogRef) {
      this.dialogRef.close();
      return
    }
    this.dialogRef = this.dialog.open(UserModalComponent, {
      width: '600px',
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      data: {

      },
    });

    this.dialogRef.afterClosed().subscribe(result => {
      this.logger.log(`[SIDEBAR] Dialog result: ${result}`);
      this.dialogRef = null
    });
  }

  getNotificationSoundPreferences() {
    // NOTIFICATION_SOUND = 'enabled';
    const storedNotificationSound = localStorage.getItem(this.storedValuePrefix + 'sound');

    if (storedNotificationSound !== 'undefined' && storedNotificationSound !== null) {

      this.NOTIFICATION_SOUND = storedNotificationSound;
      this.logger.log('[SIDEBAR] NOTIFICATION_SOUND - GET SOUND PRREFERENCE - NOTIFICATION_SOUND', this.NOTIFICATION_SOUND)
    } else {
      this.NOTIFICATION_SOUND = 'enabled';
      this.logger.log('[SIDEBAR] NOTIFICATION_SOUND - GET SOUND PRREFERENCE - NOTIFICATION_SOUND', this.NOTIFICATION_SOUND)
    }
  }

  listenSoundPreference() {
    this.wsRequestsService.hasChangedSoundPreference$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((newSoundPreference) => {
        this.logger.log('[SIDEBAR] - LISTEN TO SOUND PREFERNCE CHANGED ', newSoundPreference);
        if (newSoundPreference !== null) {
          this.NOTIFICATION_SOUND = newSoundPreference;
        }
      }, error => {
        this.logger.error('[SIDEBAR] - LISTEN TO SOUND PREFERNCE CHANGED * ERROR * ', error)
      }, () => {
        this.logger.log('[SIDEBAR] - LISTEN TO SOUND PREFERNCE CHANGED *** COMPLETE *** ')
      });
  }

  listenToForegroundNotificationCount() {
    this.wsRequestsService.foregroundNotificationCount$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((foregroundNoticationCount) => {
        this.logger.log('[SIDEBAR] - FOREGROUND NOTIFICATION - COUNT ', foregroundNoticationCount);
        this.new_messages_count = foregroundNoticationCount;

        const storedSoundPreference = localStorage.getItem(this.storedValuePrefix + 'sound');
        this.logger.log('[SIDEBAR] FOREGROUND NOTIFICATION - storedSoundPreference ', storedSoundPreference)
        this.logger.log('[SIDEBAR] FOREGROUND NOTIFICATION - NOTIFICATION_SOUND ', this.NOTIFICATION_SOUND)
        if (this.new_messages_count > 0) {
          if (this.NOTIFICATION_SOUND === 'enabled' && this.IS_REQUEST_FOR_PANEL_ROUTE === false && this.IS_UNSERVEDREQUEST_FOR_PANEL_ROUTE === false) {
            this.logger.log('[SIDEBAR] NOTIFICATION_SOUND (showNotification) hasPlayed ', this.hasPlayed)
            if (this.hasPlayed === false) {
              // this.logger.log('[NAVBAR] NOTIFICATION_SOUND (showNotification) hasPlayed (HERE IN IF)', this.hasPlayed)
              this.audio = new Audio();

              this.audio.src = 'assets/pling.mp3';
              // this.logger.log('sidebar audio src ',  this.audio.src )
              this.audio.load();

              this.audio.play().then(() => {

                this.hasPlayed = true
                this.logger.log('[SIDEBAR] - SOUND HAS PLAYED  hasPlayed ', this.hasPlayed)

                setTimeout(() => {
                  this.hasPlayed = false;
                  this.logger.log('[SIDEBAR] - SOUND HAS PLAYED  hasPlayed ', this.hasPlayed)

                }, 4000);
              }).catch((error: any) => {
                this.logger.log('[SIDEBAR] ***soundMessage error*', error);
              });
            }
          }
        }
      }, error => {
        this.logger.error('[SIDEBAR] - FOREGROUND NOTIFICATION COUNT * ERROR * ', error)
      }, () => {
        this.logger.log('[SIDEBAR] - FOREGROUND NOTIFICATION COUNT *** COMPLETE *** ')
      });
  }



  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      this.logger.log('[SIDEBAR] USER GET IN SIDEBAR ', user)
      this.user = user;
      if (user) {
        this.createUserAvatar(user)
        this.currentUserId = user._id;
        this.logger.log('[SIDEBAR] Current USER ID ', this.currentUserId);

        const stored_preferred_lang = localStorage.getItem(this.user._id + '_lang')

        if (stored_preferred_lang) {
          this.dsbrd_lang = stored_preferred_lang;
          this.getLangTranslation(this.dsbrd_lang)
          this.flag_url = "assets/img/language_flag/" + stored_preferred_lang + ".png"

          this.logger.log('[SIDEBAR] flag_url (from stored_preferred_lang) ', this.flag_url)

          this.logger.log('[SIDEBAR] stored_preferred_lang ', stored_preferred_lang)
        } else {
          this.browserLang = this.translate.getBrowserLang();
          this.dsbrd_lang = this.browserLang;
          this.getLangTranslation(this.dsbrd_lang)
          this.logger.log('[SIDEBAR] - browser_lang ', this.browserLang)
          this.flag_url = "assets/img/language_flag/" + this.browserLang + ".png"

          this.logger.log('[SIDEBAR] flag_url (from browser_lang) ', this.flag_url)
        }
      }
    });
  }



  createUserAvatar(user) {
    this.logger.log('[USERS] - createProjectUserAvatar ', user)
    let fullname = ''
    if (user && user.firstname && user.lastname) {
      fullname = user.firstname + ' ' + user.lastname
      user['fullname_initial'] = avatarPlaceholder(fullname)
      user['fillColour'] = getColorBck(fullname)
    } else if (user && user.firstname) {
      fullname = user.firstname
      user['fullname_initial'] = avatarPlaceholder(fullname)
      user['fillColour'] = getColorBck(fullname)
    } else {
      user['fullname_initial'] = 'N/A'
      user['fillColour'] = 'rgb(98, 100, 167)'
    }
  }

  getLangTranslation(dsbrd_lang_code) {
    this.translate.get(dsbrd_lang_code)
      .subscribe((translation: any) => {
        this.logger.log('[SIDEBAR] getLangTranslation', translation)
        this.tlangparams = { language_name: translation }
      });
  }

  getChatUrl() {
    this.CHAT_BASE_URL = this.appConfigService.getConfig().CHAT_BASE_URL;
    this.logger.log('[SIDEBAR] AppConfigService getAppConfig CHAT_BASE_URL', this.CHAT_BASE_URL);
  }


  brandLog() {
    // this.logger.log('BRAND_JSON - SIDEBAR ', brand);
    this.logger.log('[SIDEBAR] BRAND_JSON - sidebarlogourl ', this.sidebarLogoWhite_Url);

  }

  getProfileImageStorage() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[SIDEBAR] IMAGE STORAGE ', this.storageBucket, 'usecase Firebase')
    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false
      this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;
      this.logger.log('[SIDEBAR] IMAGE STORAGE ', this.storageBucket, 'usecase Native')
    }


  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[SIDEBAR] AppConfigService getAppConfig public_Key', this.public_Key);

    let keys = this.public_Key.split("-");
    this.logger.log('[SIDEBAR] PUBLIC-KEY - public_Key keys', keys)

    keys.forEach(key => {

      if (key.includes("ANA")) {

        let ana = key.split(":");

        if (ana[1] === "F") {
          this.isVisibleANA = false;
        } else {
          this.isVisibleANA = true;
        }
      }

      if (key.includes("ACT")) {
        let act = key.split(":");
        if (act[1] === "F") {
          this.isVisibleACT = false;
        } else {
          this.isVisibleACT = true;
        }
      }

      if (key.includes("TRI")) {
        let tri = key.split(":");
        if (tri[1] === "F") {
          this.isVisibleTRI = false;
        } else {
          this.isVisibleTRI = true;
        }
      }

      if (key.includes("GRO")) {
        let gro = key.split(":");
        if (gro[1] === "F") {
          this.isVisibleGRO = false;
        } else {
          this.isVisibleGRO = true;
        }
      }

      if (key.includes("DEP")) {
        let dep = key.split(":");
        if (dep[1] === "F") {
          this.isVisibleDEP = false;
        } else {
          this.isVisibleDEP = true;
        }
      }

      if (key.includes("OPH")) {
        let oph = key.split(":");
        if (oph[1] === "F") {
          this.isVisibleOPH = false;
        } else {
          this.isVisibleOPH = true;
        }
      }

      if (key.includes("CAR")) {
        let car = key.split(":");
        if (car[1] === "F") {
          this.isVisibleCAR = false;
        } else {
          this.isVisibleCAR = true;
        }
      }

      if (key.includes("LBS")) {
        let lbs = key.split(":");
        if (lbs[1] === "F") {
          this.isVisibleLBS = false;
        } else {
          this.isVisibleLBS = true;
        }
      }

      if (key.includes("APP")) {
        let lbs = key.split(":");
        if (lbs[1] === "F") {
          this.isVisibleAPP = false;
        } else {
          this.isVisibleAPP = true;
        }
      }

      if (key.includes("PAY")) {
        let pay = key.split(":");
        if (pay[1] === "F") {
          this.isVisiblePAY = false;
        } else {
          this.isVisiblePAY = true;
        }
      }
      if (key.includes("MON")) {
        let pay = key.split(":");
        if (pay[1] === "F") {
          this.isVisibleMON = false;
        } else {
          this.isVisibleMON = true;
        }
      }

      if (key.includes("CNT")) {
        let pay = key.split(":");
        if (pay[1] === "F") {
          this.isVisibleCNT = false;
        } else {
          this.isVisibleCNT = true;
        }
      }

      if (key.includes("INT")) {
        let int = key.split(":");
        if (int[1] === "F") {
          this.isVisibleINT = false;
        } else {
          this.isVisibleINT = true;
        }
      }

      if (key.includes('AUT')) {
        let aut = key.split(':')
        if (aut[1] === 'F') {
          this.isVisibleAUT = false;
        } else {
          this.isVisibleAUT = true;
        }
      }

    });

    if (!this.public_Key.includes("INT")) {
      this.isVisibleINT = false;
    }

    if (!this.public_Key.includes("CAR")) {
      this.isVisibleCAR = false;
    }

    if (!this.public_Key.includes("LBS")) {
      this.isVisibleLBS = false;
    }

    if (!this.public_Key.includes("APP")) {
      this.isVisibleAPP = false;
    }
    if (!this.public_Key.includes("PAY")) {
      this.isVisiblePAY = false;
    }
    if (!this.public_Key.includes("MON")) {
      this.isVisibleMON = false;
    }

    if (!this.public_Key.includes("CNT")) {
      this.isVisibleCNT = false;
    }

    if (!this.public_Key.includes('AUT')) {
      this.isVisibleAUT = false
    }
  }




  getCurrentRoute() {
    this.router.events.subscribe((event: NavigationEvent) => {
      if (event instanceof NavigationEnd) {
        this.logger.log('[SIDEBAR] NavigationEnd event.url', event.url.substring(event.url.lastIndexOf('/') + 1))
        if (event.url.indexOf('/request-for-panel') !== -1) {
          this.IS_REQUEST_FOR_PANEL_ROUTE = true;
          // this.logger.log('[NAVBAR] NavigationEnd - IS_REQUEST_FOR_PANEL_ROUTE  ', this.IS_REQUEST_FOR_PANEL_ROUTE);
        } else {
          this.IS_REQUEST_FOR_PANEL_ROUTE = false;
          // this.logger.log('[NAVBAR] NavigationEnd - IS_REQUEST_FOR_PANEL_ROUTE  ', this.IS_REQUEST_FOR_PANEL_ROUTE);
        }

        if (event.url.indexOf('/unserved-request-for-panel') !== -1) {
          this.IS_UNSERVEDREQUEST_FOR_PANEL_ROUTE = true;
          // this.logger.log('[SIDEBAR] NavigationEnd - IS_UNSERVEDREQUEST_FOR_PANEL_ROUTE  ', this.IS_UNSERVEDREQUEST_FOR_PANEL_ROUTE);
        } else {
          this.IS_UNSERVEDREQUEST_FOR_PANEL_ROUTE = false;
          // this.logger.log('[SIDEBAR] NavigationEnd- IS_UNSERVEDREQUEST_FOR_PANEL_ROUTE  ', this.IS_UNSERVEDREQUEST_FOR_PANEL_ROUTE);
        }

        if (event.url.indexOf('/autologin') !== -1) {
          // this.logger.log('[SIDEBAR] NavigationEnd - THE activities-demo route IS ACTIVE  ', event.url);
          this.AUTOLOGIN_ROUTE_IS_ACTIVE = true;

        } else {
          // this.logger.log('[SIDEBAR] NavigationEnd - THE activities-demo route IS NOT ACTIVE  ', event.url);
          this.AUTOLOGIN_ROUTE_IS_ACTIVE = false;
        }

        if (event.url === '/projects') {
          this.logger.log('[SIDEBAR] NavigationEnd - THE activities-demo route IS ACTIVE  ', event.url);
          this.YOUR_PROJECT_ROUTE_IS_ACTIVE = true;

        } else {
          // this.logger.log('[SIDEBAR] NavigationEnd - THE activities-demo route IS NOT ACTIVE  ', event.url);
          this.YOUR_PROJECT_ROUTE_IS_ACTIVE = false;
        }

        if (event.url.indexOf('/activities') !== -1) {
          // this.logger.log('[SIDEBAR] NavigationEnd - THE activities-demo route IS ACTIVE  ', event.url);
          this.ACTIVITIES_ROUTE_IS_ACTIVE = true;
        } else {
          // this.logger.log('[SIDEBAR] NavigationEnd - THE activities-demo route IS NOT ACTIVE  ', event.url);
          this.ACTIVITIES_ROUTE_IS_ACTIVE = false;
        }

        if (event.url.indexOf('/activities-demo') !== -1) {
          // this.logger.log('[SIDEBAR] NavigationEnd - THE activities-demo route IS ACTIVE  ', event.url);
          this.ACTIVITIES_DEMO_ROUTE_IS_ACTIVE = true;
        } else {
          // this.logger.log('[SIDEBAR] NavigationEnd - THE activities-demo route IS NOT ACTIVE  ', event.url);
          this.ACTIVITIES_DEMO_ROUTE_IS_ACTIVE = false;
        }

        if (event.url.indexOf('/analytics-demo') !== -1) {
          // this.logger.log('[SIDEBAR] NavigationEnd - THE analytics-demo route IS ACTIVE  ', event.url);
          this.ANALYTICS_DEMO_ROUTE_IS_ACTIVE = true;
        } else {
          // this.logger.log('[SIDEBAR] NavigationEnd - THE analytics-demo route IS NOT ACTIVE  ', event.url);
          this.ANALYTICS_DEMO_ROUTE_IS_ACTIVE = false;
        }

        if (event.url.indexOf('/widget') !== -1) {
          // this.logger.log('[SIDEBAR] NavigationEnd - THE widget route IS ACTIVE  ', event.url);
          this.WIDGET_ROUTE_IS_ACTIVE = true;
        } else {
          // this.logger.log('[SIDEBAR] NavigationEnd - THE widget route IS NOT ACTIVE  ', event.url);
          this.WIDGET_ROUTE_IS_ACTIVE = false;
        }

        if (event.url.indexOf('/analytics') !== -1) {
          // this.logger.log('[SIDEBAR] NavigationEnd - THE analytics route IS ACTIVE  ', event.url);
          this.ANALITYCS_ROUTE_IS_ACTIVE = true;
        } else {
          // this.logger.log('[SIDEBAR] NavigationEnd - THE analytics route IS NOT ACTIVE  ', event.url);
          this.ANALITYCS_ROUTE_IS_ACTIVE = false;
        }

        if (event.url.indexOf('/home') !== -1) {
          // this.logger.log('[SIDEBAR] NavigationEnd - THE home route IS ACTIVE  ', event.url);
          this.HOME_ROUTE_IS_ACTIVE = true;
        } else {
          // this.logger.log('[SIDEBAR] NavigationEnd - THE home route IS NOT ACTIVE  ', event.url);
          this.HOME_ROUTE_IS_ACTIVE = false;
        }

        if (event.url.indexOf('/notification-email') !== -1) {
          // this.logger.log('[SIDEBAR] NavigationEnd - THE home route IS ACTIVE  ', event.url);
          this.NOTIFICATION_EMAIL_IS_ACTIVE = true;
          // this.smallSidebar(true)
        } else {
          // this.logger.log('[SIDEBAR] NavigationEnd - THE home route IS NOT ACTIVE  ', event.url);
          this.NOTIFICATION_EMAIL_IS_ACTIVE = false;
          // this.smallSidebar(false)
        }

        if (event.url.indexOf('/app-store') !== -1) {
          // this.logger.log('[SIDEBAR] NavigationEnd - THE home route IS ACTIVE  ', event.url);
          this.APPS_ROUTE_IS_ACTIVE = true;
          // this.smallSidebar(true)
        } else {
          // this.logger.log('[SIDEBAR] NavigationEnd - THE home route IS NOT ACTIVE  ', event.url);
          this.APPS_ROUTE_IS_ACTIVE = false;
          // this.smallSidebar(false)
        }
        // ------------------------------------------------------------------------------------------------
        // the following are also route of settings
        // ------------------------------------------------------------------------------------------------
        if (event.url.indexOf('/trigger') !== -1) {
          // this.logger.log('[SIDEBAR] NavigationEnd - THE home route IS ACTIVE  ', event.url);
          this.TRIGGER_ROUTE_IS_ACTIVE = true;
          // this.logger.log('[SIDEBAR] NavigationEnd - TRIGGER_ROUTE_IS_ACTIVE ', this.TRIGGER_ROUTE_IS_ACTIVE);
        } else {
          // this.logger.log('[SIDEBAR] NavigationEnd - THE home route IS NOT ACTIVE  ', event.url);
          this.TRIGGER_ROUTE_IS_ACTIVE = false;
          // this.logger.log('[SIDEBAR] NavigationEnd - TRIGGER_ROUTE_IS_ACTIVE ', this.TRIGGER_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/labels') !== -1) {
          this.TAG_ROUTE_IS_ACTIVE = true;
          // this.logger.log('[SIDEBAR] NavigationEnd - TAG_ROUTE_IS_ACTIVE ', this.TAG_ROUTE_IS_ACTIVE);
        } else {
          this.TAG_ROUTE_IS_ACTIVE = false;
          // this.logger.log('[SIDEBAR] NavigationEnd - TAG_ROUTE_IS_ACTIVE ', this.TAG_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/cannedresponses') !== -1) {
          this.CANNED_RESPONSES_ROUTE_IS_ACTIVE = true;
          // this.logger.log('[SIDEBAR] NavigationEnd - CANNED_RESPONSES_ROUTE_IS_ACTIVE ', this.CANNED_RESPONSES_ROUTE_IS_ACTIVE);
        } else {
          this.CANNED_RESPONSES_ROUTE_IS_ACTIVE = false;
          // this.logger.log('[SIDEBAR] NavigationEnd - CANNED_RESPONSES_ROUTE_IS_ACTIVE ', this.CANNED_RESPONSES_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/departments') !== -1) {
          this.DEPTS_ROUTE_IS_ACTIVE = true;
          // this.logger.log('[SIDEBAR] NavigationEnd - DEPTS_ROUTE_IS_ACTIVE ', this.DEPTS_ROUTE_IS_ACTIVE);
        } else {
          this.DEPTS_ROUTE_IS_ACTIVE = false;
          // this.logger.log('[SIDEBAR] NavigationEnd - DEPTS_ROUTE_IS_ACTIVE ', this.DEPTS_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/department/edit/') !== -1) {
          this.EDIT_DEPT_ROUTE_IS_ACTIVE = true;
          // this.logger.log('[SIDEBAR] NavigationEnd - EDIT_DEPT_ROUTE_IS_ACTIVE ', this.EDIT_DEPT_ROUTE_IS_ACTIVE);
        } else {
          this.EDIT_DEPT_ROUTE_IS_ACTIVE = false;
          // this.logger.log('[SIDEBAR] NavigationEnd - EDIT_DEPT_ROUTE_IS_ACTIVE ', this.EDIT_DEPT_ROUTE_IS_ACTIVE);
        }


        if (event.url.indexOf('/users') !== -1) {
          this.TEAMMATES_ROUTE_IS_ACTIVE = true;
          // this.logger.log('[SIDEBAR] NavigationEnd - TEAMMATES_ROUTE_IS_ACTIVE ', this.TEAMMATES_ROUTE_IS_ACTIVE);
        } else {
          this.TEAMMATES_ROUTE_IS_ACTIVE = false;
          // this.logger.log('[SIDEBAR] NavigationEnd - TEAMMATES_ROUTE_IS_ACTIVE ', this.TEAMMATES_ROUTE_IS_ACTIVE);;
        }

        if (event.url.indexOf('/groups') !== -1) {
          this.GROUPS_ROUTE_IS_ACTIVE = true;
          // this.logger.log('[SIDEBAR] NavigationEnd - GROUPS_ROUTE_IS_ACTIVE ', this.GROUPS_ROUTE_IS_ACTIVE);
        } else {
          this.GROUPS_ROUTE_IS_ACTIVE = false;
          // this.logger.log('[SIDEBAR] NavigationEnd - GROUPS_ROUTE_IS_ACTIVE ', this.GROUPS_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/group/create') !== -1) {
          this.CREATE_GROUP_ROUTE_IS_ACTIVE = true;
          // this.logger.log('[SIDEBAR] NavigationEnd - CREATE_GROUP_ROUTE_IS_ACTIVE ', this.CREATE_GROUP_ROUTE_IS_ACTIVE);
        } else {
          this.CREATE_GROUP_ROUTE_IS_ACTIVE = false;
          // this.logger.log('[SIDEBAR] NavigationEnd - CREATE_GROUP_ROUTE_IS_ACTIVE ', this.CREATE_GROUP_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/group/edit') !== -1) {
          this.EDIT_GROUP_ROUTE_IS_ACTIVE = true;
          // this.logger.log('[SIDEBAR] NavigationEnd - EDIT_GROUP_ROUTE_IS_ACTIVE ', this.EDIT_GROUP_ROUTE_IS_ACTIVE);
        } else {
          this.EDIT_GROUP_ROUTE_IS_ACTIVE = false;
          // this.logger.log('[SIDEBAR] NavigationEnd - EDIT_GROUP_ROUTE_IS_ACTIVE ', this.EDIT_GROUP_ROUTE_IS_ACTIVE);
        }

         if (event.url.indexOf('/roles') !== -1) {
          this.ROLES_ROUTE_IS_ACTIVE = true;
          // this.logger.log('[SIDEBAR] NavigationEnd - ROLES_ROUTE_IS_ACTIVE ', this.ROLES_ROUTE_IS_ACTIVE);
        } else {
          this.ROLES_ROUTE_IS_ACTIVE = false;
          // this.logger.log('[SIDEBAR] NavigationEnd - ROLES_ROUTE_IS_ACTIVE ', this.ROLES_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/edit-role') !== -1) {
          this.EDIT_ROLE_ROUTE_IS_ACTIVE = true;
          // this.logger.log('[SIDEBAR] NavigationEnd - EDIT_ROLE_ROUTE_IS_ACTIVE ', this.EDIT_ROLE_ROUTE_IS_ACTIVE);
        } else {
          this.EDIT_ROLE_ROUTE_IS_ACTIVE = false;
          // this.logger.log('[SIDEBAR] NavigationEnd - EDIT_ROLE_ROUTE_IS_ACTIVE ', this.EDIT_ROLE_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/create-new-role') !== -1) {
          this.ADD_ROLE_ROUTE_IS_ACTIVE = true;
          // this.logger.log('[SIDEBAR] NavigationEnd - ADD_ROLE_ROUTE_IS_ACTIVE ', this.ADD_ROLE_ROUTE_IS_ACTIVE);
        } else {
          this.ADD_ROLE_ROUTE_IS_ACTIVE = false;
          // this.logger.log('[SIDEBAR] NavigationEnd - ADD_ROLE_ROUTE_IS_ACTIVE ', this.ADD_ROLE_ROUTE_IS_ACTIVE);
        }

        

        

        if (event.url.indexOf('/widget-set-up') !== -1) {
          this.WIDGET_SETUP_ROUTE_IS_ACTIVE = true;
          // this.logger.log('[SIDEBAR] NavigationEnd - WIDGET_SETUP_ROUTE_IS_ACTIVE ', this.WIDGET_SETUP_ROUTE_IS_ACTIVE);
        } else {
          this.WIDGET_SETUP_ROUTE_IS_ACTIVE = false;
          // this.logger.log('[SIDEBAR] NavigationEnd - WIDGET_SETUP_ROUTE_IS_ACTIVE ', this.WIDGET_SETUP_ROUTE_IS_ACTIVE);
        }

        // Chatbot sidebar
        if (event.url.indexOf('/bots/my-chatbots/all') !== -1 || event.url.indexOf('/bots') !== -1) {
          this.MY_BOTS_ALL_ROUTE_IS_ACTIVE = true;
          this.logger.log('[SIDEBAR] NavigationEnd - MY_BOTS_ALL_ROUTE_IS_ACTIVE ', this.MY_BOTS_ALL_ROUTE_IS_ACTIVE);
        } else {
          this.MY_BOTS_ALL_ROUTE_IS_ACTIVE = false;
          this.logger.log('[SIDEBAR] NavigationEnd - MY_BOTS_ALL_ROUTE_IS_ACTIVE ', this.MY_BOTS_ALL_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('flows/no-auth') !== -1) {
          this.MY_BOTS_ALL_ROUTE_IS_ACTIVE_NO_AUTH = true;
          this.logger.log('[SIDEBAR] NavigationEnd - MY_BOTS_ALL_ROUTE_IS_ACTIVE_NO_AUTH ', this.MY_BOTS_ALL_ROUTE_IS_ACTIVE_NO_AUTH);
        } else {
          this.MY_BOTS_ALL_ROUTE_IS_ACTIVE_NO_AUTH = false;
          this.logger.log('[SIDEBAR] NavigationEnd - MY_BOTS_ALL_ROUTE_IS_ACTIVE_NO_AUTH ', this.MY_BOTS_ALL_ROUTE_IS_ACTIVE_NO_AUTH);
        }

        if (event.url.indexOf('/external') !== -1) {
          this.EDIT_EXTERNAL_CHATBOT_ROUTE_IS_ACTIVE = true;
          this.logger.log('[SIDEBAR] NavigationEnd - EDIT_EXTERNAL_CHATBOT_ROUTE_IS_ACTIVE ', this.EDIT_EXTERNAL_CHATBOT_ROUTE_IS_ACTIVE);
        } else {
          this.EDIT_EXTERNAL_CHATBOT_ROUTE_IS_ACTIVE = false;
          this.logger.log('[SIDEBAR] NavigationEnd - EDIT_EXTERNAL_CHATBOT_ROUTE_IS_ACTIVE ', this.EDIT_EXTERNAL_CHATBOT_ROUTE_IS_ACTIVE);
        }
        

        

        if (event.url.indexOf('/flows/flow-automations') !== -1) {
          this.FLOW_AUTOMATION_ROUTE_IS_ACTIVE = true;
          this.logger.log('[SIDEBAR] NavigationEnd - FLOW_AUTOMATION_ROUTE_IS_ACTIVE ', this.FLOW_AUTOMATION_ROUTE_IS_ACTIVE);
        } else {
          this.FLOW_AUTOMATION_ROUTE_IS_ACTIVE = false;
          this.logger.log('[SIDEBAR] NavigationEnd - FLOW_AUTOMATION_ROUTE_IS_ACTIVE ', this.FLOW_AUTOMATION_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/flows/flow-aiagent') !== -1) {
          this.FLOW_AIAGENT_ROUTE_IS_ACTIVE = true;
          this.logger.log('[SIDEBAR] NavigationEnd - FLOW_AIAGENT_ROUTE_IS_ACTIVE ', this.FLOW_AIAGENT_ROUTE_IS_ACTIVE);
        } else {
          this.FLOW_AIAGENT_ROUTE_IS_ACTIVE = false;
          this.logger.log('[SIDEBAR] NavigationEnd - FLOW_AIAGENT_ROUTE_IS_ACTIVE ', this.FLOW_AIAGENT_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/flows/flow-webhooks') !== -1) {
          this.FLOW_WEBHOOKS_ROUTE_IS_ACTIVE = true;
          this.logger.log('[SIDEBAR] NavigationEnd - FLOW_WEBHOOKS_ROUTE_IS_ACTIVE ', this.FLOW_WEBHOOKS_ROUTE_IS_ACTIVE);
        } else {
          this.FLOW_WEBHOOKS_ROUTE_IS_ACTIVE = false;
          this.logger.log('[SIDEBAR] NavigationEnd - FLOW_WEBHOOKS_ROUTE_IS_ACTIVE ', this.FLOW_WEBHOOKS_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/flow-webhook/no-auth') !== -1) {
          this.FLOW_WEBHOOKS_ROUTE_IS_ACTIVE = true;
          this.logger.log('[SIDEBAR] NavigationEnd - FLOW_WEBHOOKS_ROUTE_IS_ACTIVE ', this.FLOW_WEBHOOKS_ROUTE_IS_ACTIVE);
        } else {
          this.FLOW_WEBHOOKS_ROUTE_IS_ACTIVE = false;
          this.logger.log('[SIDEBAR] NavigationEnd - FLOW_WEBHOOKS_ROUTE_IS_ACTIVE ', this.FLOW_WEBHOOKS_ROUTE_IS_ACTIVE);
        }

        


        if (event.url.indexOf('/bots-demo') !== -1) {
          this.BOTS_DEMO_ROUTE_IS_ACTIVE = true;
          this.logger.log('[SIDEBAR] NavigationEnd - BOTS_DEMO_ROUTE_IS_ACTIVE ', this.BOTS_DEMO_ROUTE_IS_ACTIVE);
        } else {
          this.BOTS_DEMO_ROUTE_IS_ACTIVE = false;
          this.logger.log('[SIDEBAR] NavigationEnd - BOTS_DEMO_ROUTE_IS_ACTIVE ', this.BOTS_DEMO_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/bots/my-chatbots/increase-sales') !== -1) {
          this.MY_BOTS_IS_ROUTE_IS_ACTIVE = true;
          this.logger.log('[SIDEBAR] NavigationEnd - MY_BOTS_IS_ROUTE_IS_ACTIVE ', this.MY_BOTS_IS_ROUTE_IS_ACTIVE);
        } else {
          this.MY_BOTS_IS_ROUTE_IS_ACTIVE = false;
          this.logger.log('[SIDEBAR] NavigationEnd - MY_BOTS_IS_ROUTE_IS_ACTIVE ', this.MY_BOTS_IS_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/bots/my-chatbots/customer-satisfaction') !== -1) {
          this.MY_BOTS_CS_ROUTE_IS_ACTIVE = true;
          this.logger.log('[SIDEBAR] NavigationEnd - MY_BOTS_CS_ROUTE_IS_ACTIVE ', this.MY_BOTS_CS_ROUTE_IS_ACTIVE);
        } else {
          this.MY_BOTS_CS_ROUTE_IS_ACTIVE = false;
          this.logger.log('[SIDEBAR] NavigationEnd - MY_BOTS_CS_ROUTE_IS_ACTIVE ', this.MY_BOTS_CS_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/bots/templates/all') !== -1) {
          this.TMPLT_ALL_ROUTE_IS_ACTIVE = true;
          this.logger.log('[SIDEBAR] NavigationEnd - TMPLT_ALL_ROUTE_IS_ACTIVE ', this.TMPLT_ALL_ROUTE_IS_ACTIVE);
        } else {
          this.TMPLT_ALL_ROUTE_IS_ACTIVE = false;
          this.logger.log('[SIDEBAR] NavigationEnd - TMPLT_ALL_ROUTE_IS_ACTIVE ', this.TMPLT_ALL_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/bots/templates/community') !== -1) {
          this.TMPLT_CMNT_ROUTE_IS_ACTIVE = true;
          this.logger.log('[SIDEBAR] NavigationEnd - TMPLT_CMNT_ROUTE_IS_ACTIVE ', this.TMPLT_CMNT_ROUTE_IS_ACTIVE);
        } else {
          this.TMPLT_CMNT_ROUTE_IS_ACTIVE = false;
          this.logger.log('[SIDEBAR] NavigationEnd - TMPLT_CMNT_ROUTE_IS_ACTIVE ', this.TMPLT_CMNT_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/bots/templates/increase-sales') !== -1) {
          this.TMPLT_IS_ROUTE_IS_ACTIVE = true;
          this.logger.log('[SIDEBAR] NavigationEnd - TMPLT_IS_ROUTE_IS_ACTIVE ', this.TMPLT_IS_ROUTE_IS_ACTIVE);
        } else {
          this.TMPLT_IS_ROUTE_IS_ACTIVE = false;
          this.logger.log('[SIDEBAR] NavigationEnd - TMPLT_IS_ROUTE_IS_ACTIVE ', this.TMPLT_IS_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/bots/templates/customer-satisfaction') !== -1) {
          this.TMPLT_CS_ROUTE_IS_ACTIVE = true;
          this.logger.log('[SIDEBAR] NavigationEnd - TMPLT_CS_ROUTE_IS_ACTIVE ', this.TMPLT_CS_ROUTE_IS_ACTIVE);
        } else {
          this.TMPLT_CS_ROUTE_IS_ACTIVE = false;
          this.logger.log('[SIDEBAR] NavigationEnd - TMPLT_CS_ROUTE_IS_ACTIVE ', this.TMPLT_CS_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/createfaq') !== -1) {
          this.CREATE_FAQ_ROUTE_IS_ACTIVE = true;
          // this.logger.log('[SIDEBAR] NavigationEnd - CREATE_FAQ_ROUTE_IS_ACTIVE ', this.CREATE_FAQ_ROUTE_IS_ACTIVE);
        } else {
          this.CREATE_FAQ_ROUTE_IS_ACTIVE = false;
          // this.logger.log('[SIDEBAR] NavigationEnd - CREATE_FAQ_ROUTE_IS_ACTIVE ', this.CREATE_FAQ_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/editfaq') !== -1) {
          this.EDIT_FAQ_ROUTE_IS_ACTIVE = true;
          // this.logger.log('[SIDEBAR] NavigationEnd - EDIT_FAQ_ROUTE_IS_ACTIVE ', this.EDIT_FAQ_ROUTE_IS_ACTIVE);
        } else {
          this.EDIT_FAQ_ROUTE_IS_ACTIVE = false;
          // this.logger.log('[SIDEBAR] NavigationEnd - EDIT_FAQ_ROUTE_IS_ACTIVE ', this.EDIT_FAQ_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/faq/test/') !== -1) {
          this.BOT_TEST_ROUTE_IS_ACTIVE = true;
          // this.logger.log('[SIDEBAR] NavigationEnd - BOT_TEST_ROUTE_IS_ACTIVE ', this.BOT_TEST_ROUTE_IS_ACTIVE);
        } else {
          this.BOT_TEST_ROUTE_IS_ACTIVE = false;
          // this.logger.log('[SIDEBAR] NavigationEnd - BOT_TEST_ROUTE_IS_ACTIVE ', this.BOT_TEST_ROUTE_IS_ACTIVE);
        }


        if (event.url.indexOf('/hours') !== -1) {
          this.OPERATING_HOURS_ROUTE_IS_ACTIVE = true;
          // this.logger.log('[SIDEBAR] NavigationEnd - OPERATING_HOURS_ROUTE_IS_ACTIVE ', this.OPERATING_HOURS_ROUTE_IS_ACTIVE);
        } else {
          this.OPERATING_HOURS_ROUTE_IS_ACTIVE = false;
          // this.logger.log('[SIDEBAR] NavigationEnd - OPERATING_HOURS_ROUTE_IS_ACTIVE ', this.OPERATING_HOURS_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/project-settings/') !== -1) {
          this.PROJECT_SETTINGS_ROUTE_IS_ACTIVE = true;
          // this.logger.log('[SIDEBAR] NavigationEnd - PROJECT_SETTINGS_ROUTE_IS_ACTIVE ', this.PROJECT_SETTINGS_ROUTE_IS_ACTIVE);
        } else {
          this.PROJECT_SETTINGS_ROUTE_IS_ACTIVE = false;
          // this.logger.log('[SIDEBAR] NavigationEnd - SETTINGS_IS_ACTIVE ', this.PROJECT_SETTINGS_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/notification-email') !== -1) {
          this.ENTERPRISE_NOTIFICATION_EMAIL_ROUTE_IS_ACTIVE = true;
          // this.logger.log('[SIDEBAR] NavigationEnd - ENTERPRISE_NOTIFICATION_EMAIL_ROUTE_IS_ACTIVE ', this.ENTERPRISE_NOTIFICATION_EMAIL_ROUTE_IS_ACTIVE);
        } else {
          this.ENTERPRISE_NOTIFICATION_EMAIL_ROUTE_IS_ACTIVE = false;
          // this.logger.log('[SIDEBAR] NavigationEnd - ENTERPRISE_NOTIFICATION_EMAIL_ROUTE_IS_ACTIVE ', this.ENTERPRISE_NOTIFICATION_EMAIL_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/smtp-settings') !== -1) {
          this.ENTERPRISE_SMTP_SETTINGS_ROUTE_IS_ACTIVE = true;
          // this.logger.log('[SIDEBAR] NavigationEnd - ENTERPRISE_SMTP_SETTINGS_ROUTE_IS_ACTIVE ', this.ENTERPRISE_SMTP_SETTINGS_ROUTE_IS_ACTIVE);
        } else {
          this.ENTERPRISE_SMTP_SETTINGS_ROUTE_IS_ACTIVE = false;
          // this.logger.log('[SIDEBAR] NavigationEnd - ENTERPRISE_SMTP_SETTINGS_ROUTE_IS_ACTIVE ', this.ENTERPRISE_SMTP_SETTINGS_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/webhook') !== -1) {
          this.PRJCT_SETTINGS_WEBHOOK_ROUTE_IS_ACTIVE = true;
          // this.logger.log('[SIDEBAR] NavigationEnd - PRJCT_SETTINGS_WEBHOOK_ROUTE_IS_ACTIVE ', this.PRJCT_SETTINGS_WEBHOOK_ROUTE_IS_ACTIVE);
        } else {
          this.PRJCT_SETTINGS_WEBHOOK_ROUTE_IS_ACTIVE = false;
          // this.logger.log('[SIDEBAR] NavigationEnd - PRJCT_SETTINGS_WEBHOOK_ROUTE_IS_ACTIVE ', this.PRJCT_SETTINGS_WEBHOOK_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/payments') !== -1) {
          this.PRJCT_SETTINGS_PAYMENTS_ROUTE_IS_ACTIVE = true;
          // this.logger.log('[SIDEBAR] NavigationEnd - PRJCT_SETTINGS_PAYMENTS_ROUTE_IS_ACTIVE ', this.PRJCT_SETTINGS_PAYMENTS_ROUTE_IS_ACTIVE);
        } else {
          this.PRJCT_SETTINGS_PAYMENTS_ROUTE_IS_ACTIVE = false;
          // this.logger.log('[SIDEBAR] NavigationEnd - PRJCT_SETTINGS_PAYMENTS_ROUTE_IS_ACTIVE ', this.PRJCT_SETTINGS_PAYMENTS_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/user/add') !== -1) {
          this.INVITE_TEAMMATE_ROUTE_IS_ACTIVE = true;
          // this.logger.log('[SIDEBAR] NavigationEnd - INVITE_TEAMMATE_ROUTE_IS_ACTIVE ', this.INVITE_TEAMMATE_ROUTE_IS_ACTIVE);
        } else {
          this.INVITE_TEAMMATE_ROUTE_IS_ACTIVE = false;
          // this.logger.log('[SIDEBAR] NavigationEnd - INVITE_TEAMMATE_ROUTE_IS_ACTIVE ', this.INVITE_TEAMMATE_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/user/edit/') !== -1) {
          this.EDIT_PROJECT_USER_ROUTE_IS_ACTIVE = true;
          // this.logger.log('[SIDEBAR] NavigationEnd - EDIT_PROJECT_USER_ROUTE_IS_ACTIVE ', this.EDIT_PROJECT_USER_ROUTE_IS_ACTIVE);
        } else {
          this.EDIT_PROJECT_USER_ROUTE_IS_ACTIVE = false;
          // this.logger.log('[SIDEBAR] NavigationEnd - EDIT_PROJECT_USER_ROUTE_IS_ACTIVE ', this.EDIT_PROJECT_USER_ROUTE_IS_ACTIVE);
        }


        if (event.url.substring(event.url.lastIndexOf('/') + 1) === 'wsrequests') {
          this.MONITOR_ROUTE_IS_ACTIVE = true;
          this.logger.log('[SIDEBAR] NavigationEnd - MONITOR_ROUTE_IS_ACTIVE ', this.MONITOR_ROUTE_IS_ACTIVE);
        } else {
          this.MONITOR_ROUTE_IS_ACTIVE = false;
          this.logger.log('[SIDEBAR] NavigationEnd - MONITOR_ROUTE_IS_ACTIVE ', this.MONITOR_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/wsrequests/no-auth') !== -1) {
          this.MONITOR_NO_AUTH_ROUTE_IS_ACTIVE = true;
          console.log('[SIDEBAR] NavigationEnd - MONITOR_NO_AUTH_ROUTE_IS_ACTIVE ', this.MONITOR_NO_AUTH_ROUTE_IS_ACTIVE);
        } else {
          this.MONITOR_NO_AUTH_ROUTE_IS_ACTIVE = false;
          console.log('[SIDEBAR] NavigationEnd - MONITOR_NO_AUTH_ROUTE_IS_ACTIVE ', this.MONITOR_NO_AUTH_ROUTE_IS_ACTIVE);
        }

         if (event.url.indexOf('/history/no-auth') !== -1) {
          this.HISTORY_NO_AUTH_ROUTE_IS_ACTIVE = true;
          console.log('[SIDEBAR] NavigationEnd - HISTORY_NO_AUTH_ROUTE_IS_ACTIVE ', this.HISTORY_NO_AUTH_ROUTE_IS_ACTIVE);
        } else {
          this.HISTORY_NO_AUTH_ROUTE_IS_ACTIVE = false;
          console.log('[SIDEBAR] NavigationEnd - HISTORY_NO_AUTH_ROUTE_IS_ACTIVE ', this.HISTORY_NO_AUTH_ROUTE_IS_ACTIVE);
        }

        

        

        // if (event.url.indexOf('/messages') !== -1) {
        if (event.url.indexOf('/messages') !== -1) {
          this.CONV_DETAIL_ROUTE_IS_ACTIVE = true;
          console.log('[SIDEBAR] NavigationEnd - CONV_DETAIL_ROUTE_IS_ACTIVE ', this.CONV_DETAIL_ROUTE_IS_ACTIVE);
        } else {
          this.CONV_DETAIL_ROUTE_IS_ACTIVE = false;
          console.log('[SIDEBAR] NavigationEnd - CONV_DETAIL_ROUTE_IS_ACTIVE ', this.CONV_DETAIL_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/wsrequest-detail') !== -1 || event.url.indexOf('/wsrequest-detail-history') !== -1) {
          this.CONV_DETAIL_ROUTE_NO_AUTH_IS_ACTIVE = true;
          this.logger.log('[SIDEBAR] NavigationEnd - CONV_DETAIL_ROUTE_NO_AUTH_IS_ACTIVE ', this.CONV_DETAIL_ROUTE_NO_AUTH_IS_ACTIVE);
        } else {
          this.CONV_DETAIL_ROUTE_NO_AUTH_IS_ACTIVE = false;
          this.logger.log('[SIDEBAR] NavigationEnd - CONV_DETAIL_ROUTE_NO_AUTH_IS_ACTIVE ', this.CONV_DETAIL_ROUTE_NO_AUTH_IS_ACTIVE);
        }

        if (event.url.indexOf('/wsrequests-demo') !== -1) {
          this.CONV_DEMO_ROUTE_IS_ACTIVE = true;
          // this.logger.log('[SIDEBAR] NavigationEnd - CONV_DEMO_ROUTE_IS_ACTIVE ', this.CONV_DEMO_ROUTE_IS_ACTIVE);
        } else {
          this.CONV_DEMO_ROUTE_IS_ACTIVE = false;
          // this.logger.log('[SIDEBAR] NavigationEnd - CONV_DEMO_ROUTE_IS_ACTIVE ', this.CONV_DEMO_ROUTE_IS_ACTIVE);
        }





        if (event.url.indexOf('/contact/edit/') !== -1) {
          this.CONTACT_EDIT_ROUTE_IS_ACTIVE = true;
          // this.logger.log('[SIDEBAR] NavigationEnd - CONTACT_EDIT_ROUTE_IS_ACTIVE ', this.CONTACT_EDIT_ROUTE_IS_ACTIVE);
        } else {
          this.CONTACT_EDIT_ROUTE_IS_ACTIVE = false;
          // this.logger.log('[SIDEBAR] NavigationEnd - CONTACT_EDIT_ROUTE_IS_ACTIVE ', this.CONTACT_EDIT_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/contact/') !== -1) {
          this.CONTACT_CONVS_ROUTE_IS_ACTIVE = true;
          // this.logger.log('[SIDEBAR] NavigationEnd - CONTACT_CONVS_ROUTE_IS_ACTIVE ', this.CONTACT_CONVS_ROUTE_IS_ACTIVE);
        } else {
          this.CONTACT_CONVS_ROUTE_IS_ACTIVE = false;
          // this.logger.log('[SIDEBAR] NavigationEnd - CONTACT_CONVS_ROUTE_IS_ACTIVE ', this.CONTACT_CONVS_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/contacts-demo') !== -1) {
          this.CONTACTS_DEMO_ROUTE_IS_ACTIVE = true;
          // this.logger.log('[SIDEBAR] NavigationEnd - CONTACTS_DEMO_ROUTE_IS_ACTIVE ', this.CONTACTS_DEMO_ROUTE_IS_ACTIVE);
        } else {
          this.CONTACTS_DEMO_ROUTE_IS_ACTIVE = false;
          // this.logger.log('[SIDEBAR] NavigationEnd - CONTACTS_DEMO_ROUTE_IS_ACTIVE ', this.CONTACTS_DEMO_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/contacts/no-auth') !== -1) {
          this.CONTACTS_NO_AUTH_ROUTE_IS_ACTIVE = true;
          // this.logger.log('[SIDEBAR] NavigationEnd - CONTACTS_NO_AUTH_ROUTE_IS_ACTIVE ', this.CONTACTS_NO_AUTH_ROUTE_IS_ACTIVE);
        } else {
          this.CONTACTS_NO_AUTH_ROUTE_IS_ACTIVE = false;
          // this.logger.log('[SIDEBAR] NavigationEnd - CONTACTS_NO_AUTH_ROUTE_IS_ACTIVE ', this.CONTACTS_NO_AUTH_ROUTE_IS_ACTIVE);
        }

        



        if (event.url.indexOf('/integrations') !== -1) {
          this.INTEGRATIONS_ROUTE_IS_ACTIVE = true;
          this.logger.log('[SIDEBAR] NavigationEnd - INTEGRATIONS_ROUTE_IS_ACTIVE ', this.INTEGRATIONS_ROUTE_IS_ACTIVE);
        } else {
          this.INTEGRATIONS_ROUTE_IS_ACTIVE = false;
          this.logger.log('[SIDEBAR] NavigationEnd - INTEGRATIONS_ROUTE_IS_ACTIVE ', this.INTEGRATIONS_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/widget/translations') !== -1) {
          this.TRANSLATIONS_ROUTE_IS_ACTIVE = true;
          this.logger.log('[SIDEBAR] NavigationEnd - TRANSLATIONS_ROUTE_IS_ACTIVE ', this.TRANSLATIONS_ROUTE_IS_ACTIVE);
        } else {
          this.TRANSLATIONS_ROUTE_IS_ACTIVE = false;
          this.logger.log('[SIDEBAR] NavigationEnd - TRANSLATIONS_ROUTE_IS_ACTIVE ', this.TRANSLATIONS_ROUTE_IS_ACTIVE);
        }



        if (event.url.indexOf('/installation') !== -1) {
          this.INSTALLATION_ROUTE_IS_ACTIVE = true;
          this.logger.log('[SIDEBAR] NavigationEnd - INSTALLATION_ROUTE_IS_ACTIVE ', this.INSTALLATION_ROUTE_IS_ACTIVE);
        } else {
          this.INSTALLATION_ROUTE_IS_ACTIVE = false;
          this.logger.log('[SIDEBAR] NavigationEnd - INSTALLATION_ROUTE_IS_ACTIVE ', this.INSTALLATION_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/email') !== -1) {
          this.EMAIL_TICKETING_ROUTE_IS_ACTIVE = true;
          this.logger.log('[SIDEBAR] NavigationEnd - EMAIL_TICKETING_ROUTE_IS_ACTIVE ', this.EMAIL_TICKETING_ROUTE_IS_ACTIVE);
        } else {
          this.EMAIL_TICKETING_ROUTE_IS_ACTIVE = false;
          this.logger.log('[SIDEBAR] NavigationEnd - EMAIL_TICKETING_ROUTE_IS_ACTIVE ', this.EMAIL_TICKETING_ROUTE_IS_ACTIVE);
        }

        // if (event.url.indexOf('/automations') !== -1) {
        if (event.url.substring(event.url.lastIndexOf('/') + 1) === 'automations') {
          this.AUTOMATIONS_ROUTE_IS_ACTIVE = true;
          this.logger.log('[SIDEBAR] NavigationEnd - AUTOMATIONS_ROUTE_IS_ACTIVE ', this.AUTOMATIONS_ROUTE_IS_ACTIVE);
        } else {
          this.AUTOMATIONS_ROUTE_IS_ACTIVE = false;
          this.logger.log('[SIDEBAR] NavigationEnd - AUTOMATIONS_ROUTE_IS_ACTIVE ', this.AUTOMATIONS_ROUTE_IS_ACTIVE);
        }

        if (event.url.substring(event.url.lastIndexOf('/') + 1) === 'automations-demo') {
          this.AUTOMATIONS_DEMO_ROUTE_IS_ACTIVE = true;
          this.logger.log('[SIDEBAR] NavigationEnd - AUTOMATIONS_DEMO_ROUTE_IS_ACTIVE ', this.AUTOMATIONS_DEMO_ROUTE_IS_ACTIVE);
        } else {
          this.AUTOMATIONS_DEMO_ROUTE_IS_ACTIVE = false;
          this.logger.log('[SIDEBAR] NavigationEnd - AUTOMATIONS_DEMO_ROUTE_IS_ACTIVE ', this.AUTOMATIONS_DEMO_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/automations?id') !== -1) {
          this.AUTOMATIONS_DETAILS_ROUTE_IS_ACTIVE = true;
          this.logger.log('[SIDEBAR] NavigationEnd - AUTOMATIONS_DETAILS_ROUTE_IS_ACTIVE ', this.AUTOMATIONS_DETAILS_ROUTE_IS_ACTIVE);
        } else {
          this.AUTOMATIONS_DETAILS_ROUTE_IS_ACTIVE = false;
          this.logger.log('[SIDEBAR] NavigationEnd - AUTOMATIONS_DETAILS_ROUTE_IS_ACTIVE ', this.AUTOMATIONS_DETAILS_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/new-broadcast') !== -1) {
          this.NEW_BROADCAST_ROUTE_IS_ACTIVE = true;
          this.logger.log('[SIDEBAR] NavigationEnd - NEW_BROADCAST_ROUTE_IS_ACTIVE ', this.NEW_BROADCAST_ROUTE_IS_ACTIVE);
        } else {
          this.NEW_BROADCAST_ROUTE_IS_ACTIVE = false;
         this.logger.log('[SIDEBAR] NavigationEnd - NEW_BROADCAST_ROUTE_IS_ACTIVE ', this.NEW_BROADCAST_ROUTE_IS_ACTIVE);
        }
        
        if (event.url.indexOf('/automations/no-auth') !== -1) {
          this.AUTOMATIONS_ROUTE_NO_AUTH_IS_ACTIVE = true;
          console.log('[SIDEBAR] NavigationEnd - AUTOMATIONS_ROUTE_NO_AUTH_IS_ACTIVE ', this.AUTOMATIONS_ROUTE_NO_AUTH_IS_ACTIVE);
        } else {
          this.AUTOMATIONS_ROUTE_NO_AUTH_IS_ACTIVE = false;
          console.log('[SIDEBAR] NavigationEnd - AUTOMATIONS_ROUTE_NO_AUTH_IS_ACTIVE ', this.AUTOMATIONS_ROUTE_NO_AUTH_IS_ACTIVE);
        }

        
        



        // if (event.url.indexOf('/knowledge-bases-pre') ) {
        if (event.url.substring(event.url.lastIndexOf('/') + 1) === 'knowledge-bases-pre') {
          this.OLD_KB_ROUTE_IS_ACTIVE = true;
          this.logger.log('[SIDEBAR] NavigationEnd - OLD_KB_ROUTE_IS_ACTIVE ', this.OLD_KB_ROUTE_IS_ACTIVE);
        } else {
          this.OLD_KB_ROUTE_IS_ACTIVE = false;
          this.logger.log('[SIDEBAR] NavigationEnd - OLD_KB_ROUTE_IS_ACTIVE ', this.OLD_KB_ROUTE_IS_ACTIVE);
        }


        // if (event.url.match('/knowledge-bases')) {
        // if (event.url.substring(event.url.lastIndexOf('/') + 1) === 'knowledge-bases') {
        if (event.url.indexOf('/knowledge-bases') !== -1 && event.url.substring(event.url.lastIndexOf('/') + 1) !== 'knowledge-bases-pre') {
          this.KB_ROUTE_IS_ACTIVE = true;
          this.logger.log('[SIDEBAR] NavigationEnd - KB_ROUTE_IS_ACTIVE ', this.KB_ROUTE_IS_ACTIVE);
        } else {
          this.KB_ROUTE_IS_ACTIVE = false;
          this.logger.log('[SIDEBAR] NavigationEnd - KB_ROUTE_IS_ACTIVE ', this.KB_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/kb/no-auth') !== -1) {
          this.KB_ROUTE_IS_ACTIVE_NO_AUTH = true;
          this.logger.log('[SIDEBAR] NavigationEnd - KB_ROUTE_IS_ACTIVE_NO_AUTH ', this.KB_ROUTE_IS_ACTIVE_NO_AUTH);
        } else {
          this.KB_ROUTE_IS_ACTIVE_NO_AUTH = false;
          this.logger.log('[SIDEBAR] NavigationEnd - KB_ROUTE_IS_ACTIVE_NO_AUTH ', this.KB_ROUTE_IS_ACTIVE_NO_AUTH);
        }
        

        if (event.url.indexOf('/bots/create/tilebot/blank') !== -1) {
          this.CREATE_BOT_ROUTE_IS_ACTIVE = true;
          this.logger.log('[SIDEBAR] NavigationEnd - CREATE_BOT_ROUTE_IS_ACTIVE ', this.CREATE_BOT_ROUTE_IS_ACTIVE);
        } else {
          this.CREATE_BOT_ROUTE_IS_ACTIVE = false;
          this.logger.log('[SIDEBAR] NavigationEnd - CREATE_BOT_ROUTE_IS_ACTIVE ', this.CREATE_BOT_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/all-conversations') !== -1) {
          this.NORT_CONV_ROUTE_IS_ACTIVE = true;
          this.logger.log('[SIDEBAR] NavigationEnd - NORT_CONV_ROUTE_IS_ACTIVE ', this.NORT_CONV_ROUTE_IS_ACTIVE);
        } else {
          this.NORT_CONV_ROUTE_IS_ACTIVE = false;
          this.logger.log('[SIDEBAR] NavigationEnd - NORT_CONV_ROUTE_IS_ACTIVE ', this.NORT_CONV_ROUTE_IS_ACTIVE);
        }


        // if (event.url.indexOf('/support') !== -1) {
        if (event.url.substring(event.url.lastIndexOf('/') + 1) === 'support') {
          this.SUPPORT_ROUTE_IS_ACTIVE = true;
          this.logger.log('[SIDEBAR] NavigationEnd - SUPPORT_ROUTE_IS_ACTIVE; ', this.SUPPORT_ROUTE_IS_ACTIVE);
        } else {
          this.SUPPORT_ROUTE_IS_ACTIVE = false;
          this.logger.log('[SIDEBAR] NavigationEnd - SUPPORT_ROUTE_IS_ACTIVE ', this.SUPPORT_ROUTE_IS_ACTIVE);
        }

        if (event.url.indexOf('/home') !== -1) {
          this.presentHelpCenterPopup()
        }
      }
    });
  }

  presentHelpCenterPopup() {
    const sidebarTourShowed = this.localDbService.getFromStorage(`sidebar-tour-showed-${this.currentUserId}`)

    if (!sidebarTourShowed) {
      setTimeout(() => {
        this.shepherdService.defaultStepOptions = defaultStepOptions;
        this.shepherdService.modal = true;
        this.shepherdService.confirmCancel = false;
        const steps = defaultSteps(this.router, this.shepherdService, this.translate, this.brandService);
        this.shepherdService.addSteps(steps as Array<Step.StepOptions>);
        this.shepherdService.start();
        this.localDbService.setInStorage(`sidebar-tour-showed-${this.currentUserId}`, 'true')
      }, 1500);
    }
  }


  subscribeToMyAvailibilityCount() {
    this.projectService.myAvailabilityCount
      .subscribe((num: number) => {
        this.logger.log('[SIDEBAR] subscribeToMyAvailibilityCount ', num)
        this.availabilityCount = num;
      })
  }

  translateChangeAvailabilitySuccessMsg() {
    this.translate.get('ChangeAvailabilitySuccessNoticationMsg')
      .subscribe((text: string) => {
        this.changeAvailabilitySuccessNoticationMsg = text;
        // this.logger.log('+ + + change Availability Success Notication Msg', text)
      });
  }

  translateChangeAvailabilityErrorMsg() {
    this.translate.get('ChangeAvailabilityErrorNoticationMsg')
      .subscribe((text: string) => {
        this.changeAvailabilityErrorNoticationMsg = text;
        // this.logger.log('+ + + change Availability Error Notication Msg', text)
      });
  }


  listenHasDeleteUserProfileImage() {
    this.getLoggedUser()
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.uploadImageService.hasDeletedUserPhoto.subscribe((hasDeletedImage) => {
        this.logger.log('[SIDEBAR] - hasDeletedImage ? ', hasDeletedImage, '(usecase Firebase)');
        this.userImageHasBeenUploaded = false
        this.userProfileImageExist = false
      });
    } else {
      this.uploadImageNativeService.hasDeletedUserPhoto.subscribe((hasDeletedImage) => {
        this.logger.log('[SIDEBAR] - hasDeletedImage ? ', hasDeletedImage, '(usecase Native)');
        this.userImageHasBeenUploaded = false
        this.userProfileImageExist = false
      });
    }
  }

  handleImageError() {
    // this.userImageUrl = 'assets/img/no_image_user.png';
  }


  checkUserImageExist() {
    this.usersService.userProfileImageExist.subscribe((image_exist) => {
      this.logger.log('[SIDEBAR] - USER PROFILE EXIST ? ', image_exist);
      this.userProfileImageExist = image_exist;

      if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
        if (this.storageBucket && this.userProfileImageExist === true) {
          this.logger.log('[SIDEBAR] - USER PROFILE EXIST - BUILD userProfileImageurl');
          // this.setImageProfileUrl(this.storageBucket)
        }
      } else {
        if (this.baseUrl && this.userProfileImageExist === true) {
          // this.setImageProfileUrl_Native(this.baseUrl)
        }
      }
    });
  }



  checkUserImageUploadIsComplete() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.uploadImageService.userImageWasUploaded.subscribe((image_exist) => {
        this.logger.log('[SIDEBAR] - IMAGE UPLOADING IS COMPLETE ? ', image_exist, '(usecase Firebase)');
        this.userImageHasBeenUploaded = image_exist;
        this.timeStamp = (new Date()).getTime();
        // if (this.storageBucket && this.userImageHasBeenUploaded === true) {
        //   this.logger.log('[SIDEBAR] - IMAGE UPLOADING IS COMPLETE - BUILD userProfileImageurl ');
        //   this.setImageProfileUrl(this.storageBucket)
        // }
      });
    } else {

      // NATIVE
      this.uploadImageNativeService.userImageWasUploaded_Native.subscribe((image_exist) => {
        this.logger.log('[SIDEBAR] USER PROFILE IMAGE - IMAGE UPLOADING IS COMPLETE ? ', image_exist, '(usecase Native)');

        this.userImageHasBeenUploaded = image_exist;
        this.uploadImageNativeService.userImageDownloadUrl_Native.subscribe((imageUrl) => {
          this.userProfileImageurl = imageUrl
          this.timeStamp = (new Date()).getTime();
        })
      })
    }
  }

  getProjectUserId() {
    this.usersService.project_user_id_bs.subscribe((projectUser_id) => {
      this.logger.log('[SIDEBAR] - PROJECT-USER-ID ', projectUser_id);

      // if (this.projectUser_id) {
      //     this.logger.log('[SIDEBAR] - PROJECT-USER-ID (THIS)  ', this.projectUser_id);
      //     this.logger.log('[SIDEBAR] - PROJECT-USER-ID ', projectUser_id);

      //     this.usersService.unsubscriptionToWsCurrentUser(projectUser_id)
      // }
      if (projectUser_id) {
        this.projectUser_id = projectUser_id;
      }
    });
  }

  // ============ SUBSCRIPTION TO user_is_available_bs, project_user_id_bs AND user_is_busy$ PUBLISHED BY THE USER SERVICE USED
  /* WF: when the user select A PROJECT,
     - in the HOME COMP is made a call-back to get the PROJECT-USER OBJECT
     - the HOME COMP PASS THE PROJECT-USER AVAILABILITY AND THE PROJECT-USER-ID  AND USER IS BUSY TO THE  USER SERVICE
     - the USER-SERVICE PUBLISH THE PROJECT-USER AVAILABILITY AND THE PROJECT-USER ID
     - the SIDEBAR (this component) SUBSCRIBES THESE VALUES
  */
  getUserAvailability() {
    this.usersService.user_is_available_bs.subscribe((user_available) => {
      this.IS_AVAILABLE = user_available;
      console.log('[SIDEBAR] - USER IS AVAILABLE ', this.IS_AVAILABLE);
    });
  }

  getUserUserIsBusy() {
    this.usersService.user_is_busy$.subscribe((user_isbusy) => {
      this.IS_BUSY = user_isbusy;
      // THE VALUE OS  IS_BUSY IS THEN UPDATED WITH THE VALUE RETURNED FROM THE WEBSOCKET getWsCurrentUserIsBusy$()
      // WHEN, FOR EXAMPLE IN PROJECT-SETTINGS > ADVANCED THE NUM OF MAX CHAT IS 3 AND THE 
      // this.logger.log('[SIDEBAR] - USER IS BUSY (from db)', this.IS_BUSY);
    });
  }


  // changeAvailabilityState(IS_AVAILABLE, profilestatus) {
  //     this.logger.log('[SIDEBAR] - CHANGE STATUS - USER IS AVAILABLE ? ', IS_AVAILABLE);
  //     this.logger.log('[SIDEBAR]- CHANGE STATUS - PROJECT USER ID: ', this.projectUser_id);


  //     // this.usersService.updateProjectUser(this.projectUser_id, IS_AVAILABLE).subscribe((projectUser: any) => {
  //     // DONE - WORKS NK-TO-TEST - da implementare quando viene implementato il servizio - serve per cambiare lo stato di disponibilità dell'utente corrente
  //     // anche in USER & GROUP bisogna cambiare per la riga dell'utente corrente   
  //     this.usersService.updateCurrentUserAvailability(this.projectId, IS_AVAILABLE).subscribe((projectUser: any) => { // non 

  //         this.logger.log('[SIDEBAR] PROJECT-USER UPDATED ', projectUser)

  //         // NOTIFY TO THE USER SERVICE WHEN THE AVAILABLE / UNAVAILABLE BUTTON IS CLICKED
  //         this.usersService.availability_btn_clicked(true)

  //     }, (error) => {
  //         this.logger.error('[SIDEBAR] PROJECT-USER UPDATED ERR  ', error);
  //         // =========== NOTIFY ERROR ===========
  //         // this.notify.showNotification('An error occurred while updating status', 4, 'report_problem');
  //         this.notify.showWidgetStyleUpdateNotification(this.changeAvailabilityErrorNoticationMsg, 4, 'report_problem');

  //     }, () => {
  //         this.logger.log('[SIDEBAR] PROJECT-USER UPDATED  * COMPLETE *');

  //         // =========== NOTIFY SUCCESS===========
  //         // this.notify.showNotification('status successfully updated', 2, 'done');
  //         this.notify.showWidgetStyleUpdateNotification(this.changeAvailabilitySuccessNoticationMsg, 2, 'done');


  //         // this.getUserAvailability()
  //         this.getProjectUser();
  //     });
  // }

  // IF THE AVAILABILITY STATUS IS CHANGED from THE USER.COMP AVAILABLE / UNAVAILABLE TOGGLE BTN
  // RE-RUN getAllUsersOfCurrentProject TO UPDATE AVAILABLE / UNAVAILABLE BTN ON THE TOP OF THE SIDEBAR
  hasChangedAvailabilityStatusInUsersComp() {
    this.usersService.has_changed_availability_in_users.subscribe((has_changed_availability) => {
      //    this.logger.log('[SIDEBAR] SUBSCRIBES TO HAS CHANGED AVAILABILITY FROM THE USERS COMP', has_changed_availability)

      if (this.project) {
        this.getProjectUser()
      }
      // this.getWsCurrentUserAvailability$()
    })
  }

  // NO MORE USED - SUBSTITUDED WITH changeAvailabilityState
  // availale_unavailable_status(hasClickedChangeStatus: boolean) {
  //     hasClickedChangeStatus = hasClickedChangeStatus;
  //     if (hasClickedChangeStatus) {
  //         //   this.display = 'block';

  //         this.IS_AVAILABLE = hasClickedChangeStatus
  //         this.logger.log('HAS CLICKED CHANGE STATUS - IS_AVAILABLE ? ', this.IS_AVAILABLE);
  //     }

  //     if (!hasClickedChangeStatus) {
  //         //   this.display = 'none';
  //         this.logger.log('HAS CLICKED CHANGE STATUS ', hasClickedChangeStatus);
  //         this.IS_AVAILABLE = hasClickedChangeStatus
  //         this.logger.log('HAS CLICKED CHANGE STATUS - IS_AVAILABLE ? ', this.IS_AVAILABLE);
  //     }
  // }


  // GET CURRENT PROJECT - IF IS DEFINED THE CURRENT PROJECT GET THE PROJECTUSER
  getCurrentProjectProjectUsersProjectBots() {

    this.auth.project_bs.subscribe((project) => {


      if (project) {
        this.project = project
        // this.logger.log('[SIDEBAR] - CALLING GET CURRENT PROJECT  ', this.project , ' isVisibleKNB ', this.isVisibleKNB)

        // FOR KB
        const storedNamespace = this.localDbService.getFromStorage(`last_kbnamespace-${this.project._id}`)
        this.logger.log('[BOTS-SIDEBAR] storedNamespace', storedNamespace);
        if (storedNamespace) {
          let storedNamespaceObjct = JSON.parse(storedNamespace)
          this.logger.log('[BOTS-SIDEBAR] storedNamespaceObjct', storedNamespaceObjct);
          this.kbNameSpaceid = storedNamespaceObjct.id
        }

        this.projectId = this.project._id
        this.logger.log('[SIDEBAR] project $ubscription  ', this.project)

        this.projectService.getProjects().subscribe((projects: any) => {
          this.logger.log('[SIDEBAR] getProjects projects ', projects)
          if (projects) {
            this.currentProjectUser = projects.find(prj => prj.id_project.id === this.projectId);
            this.logger.log('[SIDEBAR] currentProjectUser ', this.currentProjectUser)

          }
        });
        this.getProjectUserRole();

        this.getProjectUser();
        // this.getFaqKbByProjectId()
        // if(this.isVisibleKNB) {
        // const areEnabledKbn = this.getKnbValue()
        // console.log('[SIDEBAR] getCurrentProjectProjectUsersProjectBots areEnabledKbn ', areEnabledKbn) 
        // if (areEnabledKbn) {
        //   this.getKnowledgeBaseSettings()
        // }
      }
    });
  }

  // *** NOTE: THE SAME CALLBACK IS RUNNED IN THE HOME.COMP ***
  getProjectUser() {
    this.logger.log('[SIDEBAR]  !!! SIDEBAR CALL GET-PROJECT-USER')
    // this.usersService.getProjectUserByUserId(this.currentUserId).subscribe((projectUser: any) => {
    this.usersService.getCurrentProjectUser().subscribe((projectUser: any) => {
      console.log('[SIDEBAR] PROJECT-USER GET BY USER-ID  ', projectUser);
      this.logger.log('[SIDEBAR] PROJECT-USER GET BY USER-ID - PROJECT-ID ', this.projectId);
      this.logger.log('[SIDEBAR] PROJECT-USER GET BY USER-ID - CURRENT-USER-ID ', this.user._id);
      // this.logger.log('[SIDEBAR] PROJECT-USER GET BY USER-ID - PROJECT USER ', projectUser);
      this.logger.log('[SIDEBAR] PROJECT-USER GET BY USER-ID - PROJECT USER LENGTH', projectUser.length);
      if ((projectUser) && (projectUser.length !== 0)) {
        // this.logger.log('[SIDEBAR] PROJECT-USER ID ', projectUser[0]._id)
        // this.logger.log('[SIDEBAR] USER IS AVAILABLE ', projectUser[0].user_available)
        // this.logger.log('[SIDEBAR] USER IS BUSY (from db)', projectUser[0].isBusy)
        // this.user_is_available_bs = projectUser.user_available;

        // NOTE_nk: comment this this.subsTo_WsCurrentUser(projectUser[0]._id)
        this.subsTo_WsCurrentUser(projectUser[0]._id)

        if (projectUser[0].user_available !== undefined) {
          this.usersService.user_availability(projectUser[0]._id, projectUser[0].user_available, projectUser[0].isBusy, projectUser[0])
        }

        // ADDED 21 AGO
        if (projectUser[0].role !== undefined) {
          console.log('[SIDEBAR] GET PROJECT USER ROLE FOR THE PROJECT ', this.projectId, ' »» ', projectUser[0].role);

          // ASSIGN THE projectUser[0].role VALUE TO USER_ROLE
          this.USER_ROLE = projectUser[0].role;

          // SEND THE ROLE TO USER SERVICE THAT PUBLISH
          this.usersService.user_role(projectUser[0].role);

        }
      } else {
        // this could be the case in which the current user was deleted as a member of the current project
        this.logger.log('[SIDEBAR] PROJECT-USER UNDEFINED ')
      }

    }, (error) => {
      this.logger.error('[SIDEBAR] PROJECT-USER GET BY PROJECT-ID & CURRENT-USER-ID  ', error);
    }, () => {
      this.logger.log('[SIDEBAR] PROJECT-USER GET BY PROJECT ID & CURRENT-USER-ID  * COMPLETE *');
    });
  }

  getProjectUserRole() {
    this.usersService.project_user_role_bs.subscribe((user_role) => {
      this.USER_ROLE = user_role;
      this.logger.log('[SIDEBAR] - 1. SUBSCRIBE PROJECT_USER_ROLE_BS ', this.USER_ROLE);
      if (this.USER_ROLE) {
        // this.logger.log('[SIDEBAR] - PROJECT USER ROLE get from $ subsription', this.USER_ROLE);
        if (this.USER_ROLE === 'agent') {
          this.SHOW_SETTINGS_SUBMENU = false;
        }
      }

    });
  }

  subsTo_WsCurrentUser(currentuserprjctuserid) {
    this.logger.log('[SIDEBAR] - SUBSCRIBE TO WS CURRENT-USER AVAILABILITY  prjct user id of current user ', currentuserprjctuserid);
    // this.usersService.subscriptionToWsCurrentUser(currentuserprjctuserid);
    this.wsRequestsService.subscriptionToWsCurrentUser(currentuserprjctuserid);

    this.getWsCurrentUserAvailability$();
    this.getWsCurrentUserIsBusy$();
  }



  getWsCurrentUserAvailability$() {
    // this.usersService.currentUserWsAvailability$
    this.wsRequestsService.currentUserWsAvailability$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data) => {
        console.log('[SIDEBAR] - GET WS CURRENT-USER - data ', data);
        if (data !== null) {
          if (data['user_available'] === false && data['profileStatus'] === "inactive") {
            this.IS_AVAILABLE = false;
            this.IS_INACTIVE = true;
            // this.logger.log('[SIDEBAR] - GET WS CURRENT-USER - data - IS_INACTIVE ' , this.IS_INACTIVE) 
          } else if (data['user_available'] === false && (data['profileStatus'] === '' || !data['profileStatus'])) {
            this.IS_AVAILABLE = false;
            this.IS_INACTIVE = false;
            // this.logger.log('[SIDEBAR] - GET WS CURRENT-USER - data - IS_AVAILABLE ' , this.IS_AVAILABLE) 
          } else if (data['user_available'] === true && (data['profileStatus'] === '' || !data['profileStatus'])) {
            this.IS_AVAILABLE = true;
            this.IS_INACTIVE = false;
            // this.logger.log('[SIDEBAR] - GET WS CURRENT-USER - data - IS_AVAILABLE ' , this.IS_AVAILABLE) 
          }

          // if (this.IS_AVAILABLE === true) {
          //     this.tooltip_text_for_availability_status = this.translate.instant('CHANGE_TO_YOUR_STATUS_TO_UNAVAILABLE')
          // } else {
          //     this.tooltip_text_for_availability_status = this.translate.instant('CHANGE_TO_YOUR_STATUS_TO_AVAILABLE')
          // }
        }
      }, error => {
        this.logger.error('[SIDEBAR] - GET WS CURRENT-USER AVAILABILITY * error * ', error)
      }, () => {
        this.logger.log('[SIDEBAR] - GET WS CURRENT-USER AVAILABILITY *** complete *** ')
      });
  }

  getWsCurrentUserIsBusy$() {
    // this.usersService.currentUserWsIsBusy$
    this.wsRequestsService.currentUserWsIsBusy$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((currentuser_isbusy) => {
        // this.logger.log('[SIDEBAR] - GET WS CURRENT-USER - currentuser_isbusy? ', currentuser_isbusy);
        if (currentuser_isbusy !== null) {
          this.IS_BUSY = currentuser_isbusy;
          // this.logger.log('[SIDEBAR] - GET WS CURRENT-USER (from ws)- this.IS_BUSY? ', this.IS_BUSY);
        }
      }, error => {
        this.logger.error('[SIDEBAR] - GET WS CURRENT-USER IS BUSY * error * ', error)
      }, () => {
        this.logger.log('[SIDEBAR] - GET WS CURRENT-USER IS BUSY *** complete *** ')
      });


  }

  // No more used  
  // getKnowledgeBaseSettings() {
  //   this.kbService.getKbSettingsPrev().subscribe((kbSettings: KbSettings) => {
  //     this.logger.log("[SIDEBAR] get kbSettings RES ", kbSettings);
  //     if (kbSettings && kbSettings.kbs) {
  //       if (kbSettings.kbs.length === 0) {
  //         this.kbService.areNewwKb(true)
  //       } else if (kbSettings.kbs.length > 0) {
  //         this.kbService.areNewwKb(false)
  //       }

  //     } else {
  //       this.kbService.areNewwKb(true)
  //     }

  //   }, (error) => {
  //     this.logger.error("[SIDEBAR] get kbSettings ERROR ", error);
  //   }, () => {
  //     this.logger.log("SIDEBAR] get kbSettings * COMPLETE *");

  //   })
  // }

  // getFaqKbByProjectId() {
  //   this.faqKbService.getFaqKbByProjectId().subscribe((faqKb: any) => {
  //     if (faqKb) {
  //       this.myChatbotCount = faqKb.length
  //       this.logger.log('[SIDEBAR] - GET BOTS BY PROJECT ID - myChatbotCount', this.myChatbotCount);
  //     }
  //   }, (error) => {
  //     this.logger.error('[SIDEBAR] GET BOTS ERROR ', error);

  //   }, () => {
  //     this.logger.log('[SIDEBAR] GET BOTS COMPLETE');
  //   });
  // }






  isMobileMenu() {
    // this.logger.log('SIDEBAR_IS_SMALL', this.SIDEBAR_IS_SMALL)
    if ($(window).width() > 991) {
      this.IS_MOBILE_MENU = false
      // this.logger.log('[SIDEBAR] - IS MOBILE MENU ', this.IS_MOBILE_MENU);
      // USED FOR THE SMALL SIDEBAR
      // const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
      // const elemSidebar = <HTMLElement>document.querySelector('.sidebar');
      // const elemSidebarWrapper = <HTMLElement>document.querySelector('.sidebar-wrapper');
      // if (this.SIDEBAR_IS_SMALL === false) {
      //     if (this.YOUR_PROJECT_ROUTE_IS_ACTIVE === false && this.AUTOLOGIN_ROUTE_IS_ACTIVE) {
      //         elemMainPanel.style.width = "calc(100% - 260px)";
      //         elemSidebar.style.width = "260px"
      //         elemSidebarWrapper.setAttribute('style', 'width: 260px;background-color: #2d323e!important');
      //     }
      // } else if (this.SIDEBAR_IS_SMALL === true) {
      //     elemMainPanel.style.width = "calc(100% - 70px)"
      //     elemSidebar.style.width = "70px"
      //     elemSidebarWrapper.setAttribute('style', 'width: 70px; background-color: #2d323e!important');
      // }
      return false;
    }

    this.IS_MOBILE_MENU = true

    // USED FOR THE SMALL SIDEBAR
    // const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    // const elemSidebarWrapper = <HTMLElement>document.querySelector('.sidebar-wrapper');
    // const elemSidebar = <HTMLElement>document.querySelector('.sidebar');
    // elemMainPanel.style.width = "100%"
    // elemSidebarWrapper.setAttribute('style', 'width: 260px;background-color: #2d323e!important');
    // elemSidebar.style.width = "260px"
    // // this.logger.log('[SIDEBAR] - IS MOBILE MENU ', this.IS_MOBILE_MENU);

    return true;
  };

  isMac(): boolean {
    this.logger.log('[SIDEBAR] NAVIGATOR PLATFORM', navigator.platform)
    let bool = false;
    if (navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.platform.toUpperCase().indexOf('IPAD') >= 0) {
      bool = true;
    }
    return bool;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // this.logger.log('SIDEBAR - WINDOW WIDTH ON RESIZE', event.target.innerWidth);
    if (event.target.innerWidth > 991) {
      this.IS_MOBILE_MENU = false
    } else {
      this.IS_MOBILE_MENU = true
    }
  }


  onScroll(event: any): void {
    // this.logger.log('[SIDEBAR] RICHIAMO ON SCROLL ');
    this.elSidebarWrapper = <HTMLElement>document.querySelector('.sidebar-wrapper');
    this.scrollpos = this.elSidebarWrapper.scrollTop
    // this.logger.log('[SIDEBAR] SCROLL POSITION', this.scrollpos)
  }

  stopScroll() {
    // const el = <HTMLElement>document.querySelector('.sidebar-wrapper');
    this.logger.log('[SIDEBAR] SCROLL TO', this.scrollpos);
    this.logger.log('[SIDEBAR] SCROLL TO elSidebarWrapper ', this.elSidebarWrapper)

    // const oh = <HTMLElement>document.querySelector('.oh');
    // this.logger.log('[SIDEBAR] SCROLL TO operating hours ', oh)
    // oh.scrollIntoView();

    if (this.elSidebarWrapper) {

      this.elSidebarWrapper.scrollTop = this.scrollpos;
      // this.elSidebarWrapper.scrollTo(0,242)
    }
  }

  onEvent($event) {
    this.logger.log('[SIDEBAR] SCROLL event ', $event);
    event.stopPropagation();
  }


  // -------------------------------------------
  // @ Sidebar navigation
  // -------------------------------------------


  goToHome() {
    this.router.navigate(['/project/' + this.projectId + '/home']);
  }


  goToAllMyChatbot() {
    if (!this.PERMISSION_TO_VIEW_FLOWS) {
      this.notify.presentDialogNoPermissionToViewThisSection();
      return;
    }

    this.router.navigate(['/project/' + this.projectId + '/bots/my-chatbots/all']);
  }

  goToNewKnowledgeBases() {
    if (!this.PERMISSION_TO_VIEW_KB) {
      this.notify.presentDialogNoPermissionToViewThisSection();
      return;
    }
    if (this.kbNameSpaceid !== '') {
      this.router.navigate(['project/' + this.project._id + '/knowledge-bases/' + this.kbNameSpaceid]);
    } else {
      this.router.navigate(['project/' + this.project._id + '/knowledge-bases/0']);
    }
  }

  handleMonitorClick(event: MouseEvent): void {
    if (!this.PERMISSION_TO_VIEW_MONITOR) {
      event.preventDefault(); // Stops routerLink navigation
      event.stopPropagation(); // Stops bubbling
      this.notify.presentDialogNoPermissionToViewThisSection()
    }
  }


  handleContactsClick(event: MouseEvent): void {
    if (!this.PERMISSION_TO_VIEW_CONTACTS) {
      event.preventDefault(); // Stops routerLink navigation
      event.stopPropagation(); // Stops bubbling
      this.notify.presentDialogNoPermissionToViewThisSection()
    }
  }

   handleAnalyticsClick(event: MouseEvent): void {
    if (!this.PERMISSION_TO_VIEW_ANALYTICS) {
      event.preventDefault(); // Stops routerLink navigation
      event.stopPropagation(); // Stops bubbling
      this.notify.presentDialogNoPermissionToViewThisSection()
    }
  }

  handleActivitiesClick(event: MouseEvent): void {
    if (!this.PERMISSION_TO_VIEW_ACTVITIES) {
      event.preventDefault(); // Stops routerLink navigation
      event.stopPropagation(); // Stops bubbling
      this.notify.presentDialogNoPermissionToViewThisSection()
    }
  }

  handleHistoryClick(event: MouseEvent): void {
    if (!this.PERMISSION_TO_VIEW_HISTORY) {
      event.preventDefault(); // Stops routerLink navigation
      event.stopPropagation(); // Stops bubbling
      this.notify.presentDialogNoPermissionToViewThisSection()
    }
  }






  onMenuOptionFN(item: { key: string, label: string, icon: string, src?: string }) {
    this.logger.log('[SIDEBAR] onMenuOptionFN', item)
    switch (item.key) {
      case 'FEEDBACK':
      case 'CHANGELOG':
        window.open(item.src, '_blank')
        break;
      case 'SUPPORT':
        this.goToSuppotPage()
      // this.router.navigate(['./support'], {relativeTo: this.route})
      // this.onClickItemList.emit(SIDEBAR_PAGES.SUPPORT)
      // window.open(item.src, '_self')
    }
  }

  goToSuppotPage() {
    this.router.navigate(['/project/' + this.projectId + '/support']);
  }

  goToWidgetSetUpOrToCannedResponses() {
    if (this.USER_ROLE === 'owner' || this.USER_ROLE === 'admin' ) {
      this.goToWidgetSetUp()
    } else if (this.USER_ROLE === 'agent') {
      this.goToCannedResponses()
    } else if (this.ROLE !== 'owner' && this.ROLE !== 'admin' && this.ROLE !== 'agent' ) {
      if (this.PERMISSION_TO_VIEW_WIDGET_SETUP)  {
         this.goToWidgetSetUp()
      } else if (this.PERMISSION_TO_VIEW_DEPTS) {
        this.goToDepartments()
      } else if (this.PERMISSION_TO_VIEW_TEAMMATES_ROLES_GROUPS) {
        this.goToTeammates()
      } else if (this.PERMISSION_TO_VIEW_EMAIL_TICKETING) {
        this.goToEmailTicketing()
      } else if (this.PERMISSION_TO_VIEW_CANNED_RESPONSES) {
        this.goToCannedResponses()
      } else if (this.PERMISSION_TO_VIEW_TAGS) {
        this.goToTags()
      } else if (this.PERMISSION_TO_VIEW_OH) {
        this.goToOperatingHours()
      } else if (this.PERMISSION_TO_VIEW_INTEGRATIONS) {
        this.goToIntegrations()
      } else if (this.PERMISSION_TO_VIEW_APPS) {
        this.goToApps()
      }
    }
  }



  goToWidgetSetUp() {
    // this.router.navigate(['project/' + this.project._id + '/widget-set-up'])
    const now = performance.now();
    this.logger.log('[SIDEBAR] Clicked WIDGET  at:', now);
    const route = `project/${this.project._id}/widget-set-up`
      this.router.navigate([route]).then(() => {
      const afterNav = performance.now();
      const durationMs = afterNav - now;
      const durationSec = durationMs / 1000;
      this.logger.log(`[SIDEBAR] WIDGET Navigation complete in ${durationMs.toFixed(2)} ms (${durationSec.toFixed(2)} seconds)`);
    });
  }

  goToDepartments() {
    // routerLink="project/{{ project._id }}/departments"
    this.router.navigate(['project/' + this.project._id + '/departments'])
  }

  goToTeammates() {
    // routerLink="project/{{ project._id }}/users"
    this.router.navigate(['project/' + this.project._id + '/users'])
  }

  goToEmailTicketing() {
    this.router.navigate(['project/' + this.project._id + '/email'])
  }

  goToCannedResponses() {
    this.router.navigate(['project/' + this.project._id + '/cannedresponses'])
  }

  goToTags() {
    // routerLink="project/{{ project._id }}/labels"
    this.router.navigate(['project/' + this.project._id + '/labels'])
  }

  goToOperatingHours() {
    // routerLink="project/{{ project._id }}/hours"
    this.router.navigate(['project/' + this.project._id + '/hours'])
  }

  goToIntegrations() {
  this.router.navigate(['project/' + this.project._id + '/integrations'])
  }

  goToApps() {
    this.router.navigate(['project/' + this.project._id + '/app-store'])
  }

  


  goToProjects() {
    this.logger.log('[SIDEBAR] IS MOBILE -  HAS CLICCKED GO TO PROJECT')
    this.router.navigate(['/projects']);

    // (in AUTH SERVICE ) RESET PROJECT_BS AND REMOVE ITEM PROJECT FROM STORAGE WHEN THE USER GO TO PROJECTS PAGE
    this.auth.hasClickedGoToProjects()
    this.logger.log('[SIDEBAR] IS MOBILE project AFTER GOTO PROJECTS ', this.project)
  }

  has_clicked_settings(SHOW_SETTINGS_SUBMENU: boolean) {
    this.SHOW_SETTINGS_SUBMENU = SHOW_SETTINGS_SUBMENU;
    this.logger.log('[SIDEBAR] HAS CLICKED SETTINGS - SHOW_SETTINGS_SUBMENU ', this.SHOW_SETTINGS_SUBMENU);

    // SAVE IN 'show_settings_submenu' KEY OF LOCAL STORAGE THE VALUE OF this.SHOW_SETTINGS_SUBMENU
    // (IS USED TO DISPLAY / HIDE THE SUBMENU WHEN THE PAGE IS REFRESHED)
    localStorage.setItem('show_settings_submenu', `${this.SHOW_SETTINGS_SUBMENU}`);

    if (this.SHOW_SETTINGS_SUBMENU === true) {
      this.trasform = 'rotate(180deg)';
    } else {
      this.trasform = 'none';
    }
  }

  // USED FOR SIDEBAR IN MOBILE MODE (TOGGLE THE CARET OF THE 'PROJECT NAME' DROPDOWN-MENU)
  has_cliked_hidden_project(SHOW_PRJCT_SUB) {
    this.logger.log('[SIDEBAR] HAS CLICKED PROJECT NAME ON MOBILE - SHOW SUBMENU ', this.SHOW_PRJCT_SUB);
    if (this.SHOW_PRJCT_SUB === true) {
      this.trasform_projectname_caret = 'rotate(180deg)';
    } else {
      this.trasform_projectname_caret = 'none';
    }
  }

  // USED FOR SIDEBAR IN MOBILE MODE (TOGGLE THE CARET OF THE 'NAME OF THE CURRENT USER' DROPDOWN-MENU)
  has_cliked_hidden_profile(SHOW_PROFILE_SUB) {
    this.logger.log('[SIDEBAR] HAS CLICKED NAME OF THE CURRENT USER ON MOBILE - SHOW SUBMENU ', this.SHOW_PRJCT_SUB);
    if (this.SHOW_PROFILE_SUB === true) {
      this.transform_user_profile_caret = 'rotate(180deg)';
    } else {
      this.transform_user_profile_caret = 'none';
    }
  }



  openLogoutModal() {
    this.logger.log('[SIDEBAR] - calling openLogoutModal - PROJRCT ID ', this.projectId);
    // this.displayLogoutModal = 'block';
    this.auth.hasOpenedLogoutModal(true);
    this.logger.log('[SIDEBAR] PRESENT LOGOUT-MODAL ')
    const dialogRef = this.dialog.open(LogoutModalComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '600px',
      data: {
        calledby: 'sidebar'
      },
    });

    dialogRef.afterClosed().subscribe(calledBy => {
      if (calledBy) {
        this.logger.log(`[SIDEBAR] LOGOUT-MODAL AFTER CLOSED :`, calledBy);
        this.logout()
      }
    });
  }

  logout() {
    this.auth.showExpiredSessionPopup(false);
    this.auth.signOut('sidebar');
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



  removeChatBtnFocus() {
    this.notify.publishHasClickedChat(true);
    this.elementRef.nativeElement.blur();
  }

  openChat() {
    this.elementRef.nativeElement.blur();
    this.notify.publishHasClickedChat(true);
    this.logger.log('SIDEBAR openChat project ', this.project)

    // --- new 
    if (this.project) {
      this.project['role'] = this.USER_ROLE
      localStorage.setItem('last_project', JSON.stringify(this.currentProjectUser))
    }
    // let baseUrl = this.CHAT_BASE_URL + '#/conversation-detail/'
    // let url = baseUrl
    // const myWindow = window.open(url, '_self', 'Tiledesk - Open Source Live Chat');
    // myWindow.focus();


    // --- already commented ---
    // const chatTabCount = localStorage.getItem('tabCount');
    // this.logger.log('[SIDEBAR] openChat chatTabCount ', chatTabCount);
    // if (chatTabCount) {
    //     if (+chatTabCount > 0) {
    //         this.logger.log('[SIDEBAR] openChat chatTabCount > 0 ')

    //         this.openWindow('Tiledesk - Open Source Live Chat', url + '?conversation_detail');
    //         // this.focusWin('Tiledesk - Open Source Live Chat')
    //         // window.open('Tiledesk - Open Source Live Chat', url).focus();
    //     } else if (chatTabCount && +chatTabCount === 0) {
    //         this.openWindow('Tiledesk - Open Source Live Chat', url);
    //     }
    // } else {
    //     this.openWindow('Tiledesk - Open Source Live Chat', url);
    // }
    // this.redirectToPricing(this.currentProjectUser)
  }

  redirectToPricing(projectUser) {
    const role = projectUser.role;
    const project = projectUser.id_project;

    const projectCreationDate = new Date(project.createdAt);
    const dateLimit = new Date('2025-01-16T00:00:00');
    // const dateLimit = new Date('2022-07-04T00:00:00') // for test purpose

    this.logger.log('[APP-COMPONENT] REDIRECT TO PRICING - projectUser ', projectUser)
    this.logger.log('[APP-COMPONENT] REDIRECT TO PRICING - project ', project)
    this.logger.log('[APP-COMPONENT] REDIRECT TO PRICING - projectCreationDate ', projectCreationDate)
    this.logger.log('[APP-COMPONENT] REDIRECT TO PRICING - dateLimit ', dateLimit)
    this.logger.log('[APP-COMPONENT] REDIRECT TO PRICING - project.profile.type ', project.profile.type)
    this.logger.log('[APP-COMPONENT] REDIRECT TO PRICING - project.trialExpired ', project.trialExpired)

    if (projectCreationDate >= dateLimit) {
      this.logger.log('[APP-COMPONENT] REDIRECT TO PRICING - projectCreationDate > dateLimit ')
      if (project) {
        if (project.profile.type === 'free' && project.trialExpired === true) {
          if (role === 'owner') {
            this.router.navigate(['project/' + project._id + '/pricing/te']);
          } else {
            this.router.navigate(['project/' + project._id + '/unauthorized-to-upgrade']);
          }
        } else {
          this.goToChat()
        }
      }

    } else {
      this.logger.log('[APP-COMPONENT] REDIRECT TO PRICING - projectCreationDate < dateLimit ')
      this.goToChat()
    }
  }

  goToChat() {
    const url = this.CHAT_BASE_URL;
    window.open(url, '_self');
  }



  @HostListener('document:mousedown', ['$event'])
  onMouseDown(event) {
    // this.logger.log('mousedown event', event)
    // this.logger.log('mousedown event.target.id', event.target.id)
    // this.logger.log('mousedown event.target', event.target)
    // this.logger.log('mousedown event.which', event.which)
    // --------------------------------------------------------------------
    // event.which === 1  left button - event.which === 3 right button
    // --------------------------------------------------------------------
    if ((event.target.id.startsWith('openchat') && event.which === 3) || (event.target.id.startsWith('openchat') && event.which === 1)) {
      this.logger.log('SIDEBAR openChat HAS CLIKED ON OPEN CHAT WITH THE RIGHT BTN')
      this.project['role'] = this.USER_ROLE
      localStorage.setItem('last_project', JSON.stringify(this.currentProjectUser))
    }

  }

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
      this.logger.log('[SIDEBAR] - cannot focus closed or nonexistant window');
    }
  }





  // SE IMPLEMENTATO NELL 'AFTER VIEW INIT' RITORNA ERRORE:
  // Cannot read property 'nativeElement' of undefined
  // PER ORA LO COMMENTO NELL 'AFTER VIEW INIT'
  checkForUnathorizedRoute() {
    this.router.events.subscribe((val) => {
      if (this.location.path() !== '') {
        this.checked_route = this.location.path();
        this.logger.log('[SIDEBAR] CHECKED ROUTE ', this.checked_route)
        if (this.checked_route.indexOf('/unauthorized') !== -1) {

          // RESOLVE THE BUG 'HOME button remains focused WHEN AN USER WITH AGENT ROLE TRY TO ACCESS TO AN UNATHORIZED PAGE 
          // IS REDIRECTED TO THE unauthorized page
          this.homeBtnElement.nativeElement.blur();
        }
      }
    })
  }

  mouseOver(_isOverAvar: boolean) {
    this.isOverAvar = _isOverAvar
    // this.logger.log('[SIDEBAR] Mouse Over Avatar Container ', _isOverAvar)
  }


  isOdd(countClickOnOpenUserDetailSidebar) {
    return countClickOnOpenUserDetailSidebar % 2;
  }

  openUserDetailSidePanel() {
    this.countClickOnOpenUserDetailSidebar++
    this.logger.log('[SIDEBAR] countClickOnOpenUserDetailSidebar', this.countClickOnOpenUserDetailSidebar)
    // const countClickOnOpenUserDetailSidebarIsAnOddNum = this.isOdd(this.countClickOnOpenUserDetailSidebar)
    // this.logger.log('[SIDEBAR] countClickOnOpenUserDetailSidebarIsAnOddNum', countClickOnOpenUserDetailSidebarIsAnOddNum)

    const elSidebarUserDtls = <HTMLElement>document.querySelector('#user-details');
    this.logger.log('[SIDEBAR] OPEN USER DTLS SIDE PANEL elSidebarUserDtls ', elSidebarUserDtls)

    if (elSidebarUserDtls && this.countClickOnOpenUserDetailSidebar === 1) {
      elSidebarUserDtls.classList.add("active");
    }

    if (elSidebarUserDtls && this.countClickOnOpenUserDetailSidebar > 1) {
      // this.logger.log('[SIDEBAR] this.countClickOnOpenUserDetailSidebar HERE', this.countClickOnOpenUserDetailSidebar)
      if (elSidebarUserDtls.classList.contains('active')) {
        this.logger.log('[SIDEBAR] elSidebarUserDtls contains class ACTIVE', elSidebarUserDtls)
        elSidebarUserDtls.classList.remove("active");
      } else if (!elSidebarUserDtls.classList.contains('active')) {
        this.logger.log('[SIDEBAR] elSidebarUserDtls NOT contains class ACTIVE', elSidebarUserDtls)
        elSidebarUserDtls.classList.add("active");
      }
    }
    // if (elSidebarUserDtls && countClickOnOpenUserDetailSidebarIsAnOddNum === 1) {
    //     elSidebarUserDtls.classList.add("active");
    // }
    // if (elSidebarUserDtls && countClickOnOpenUserDetailSidebarIsAnOddNum === 0) {
    //     elSidebarUserDtls.classList.remove("active");
    // }

    // const elemNavbar = <HTMLElement>document.querySelector('.navbar-absolute');
    // this.logger.log('[SIDEBAR] elemNavBar ', elemNavbar)
    // if (elemNavbar) {
    //     elemNavbar.classList.add("navbar-absolute-custom-class");
    // }
    // const elemNavbarBrand = <HTMLElement>document.querySelector('.navbar-brand');
    // this.logger.log('[SIDEBAR] elemNavbarBrand ', elemNavbarBrand)
    // if (elemNavbarBrand) {
    //     elemNavbarBrand.classList.add("navbar-brand-z-index-zero")
    // }
  }

  // onCloseUserDetailsSidebar($event) {
  //     this.logger.log('[SIDEBAR] HAS_CLICKED_CLOSE_USER_DETAIL ', $event)
  //     // this.HAS_CLICKED_OPEN_USER_DETAIL = $event
  //     const elemNavbar = <HTMLElement>document.querySelector('.navbar-absolute');
  //     this.logger.log('[SIDEBAR] elemNavBar ', elemNavbar)
  //     if (elemNavbar) {
  //         elemNavbar.classList.remove("navbar-absolute-custom-class")
  //     }

  //     const elemNavbarBrand = <HTMLElement>document.querySelector('.navbar-brand');
  //     this.logger.log('[SIDEBAR] elemNavbarBrand ', elemNavbarBrand)
  //     if (elemNavbarBrand) {
  //         elemNavbarBrand.classList.remove("navbar-brand-z-index-zero")
  //     }
  // }

  // goToAnalytics() {
  //     this.router.navigate(['project/' + this.projectId + '/analytics']);
  // }

  // goToActivities() {
  //     this.router.navigate(['project/' + this.projectId + '/activities']);
  // }








}
