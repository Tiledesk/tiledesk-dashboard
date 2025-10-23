import { Component, HostListener, OnInit } from '@angular/core'
import { LoggerService } from './../../services/logger/logger.service'
import { AppConfigService } from '../../services/app-config.service'
import { AuthService } from '../../core/auth.service'
import { NavigationEnd, Router } from '@angular/router'
import { Location } from '@angular/common'
import { TranslateService } from '@ngx-translate/core'
import { UsersService } from 'app/services/users.service'
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service'
import { KbSettings } from 'app/models/kbsettings-model'
import { RolesService } from 'app/services/roles.service'
import { PERMISSIONS } from 'app/utils/permissions.constants'
@Component({
  selector: 'appdashboard-settings-sidebar',
  templateUrl: './settings-sidebar.component.html',
  styleUrls: ['./settings-sidebar.component.scss'],
})
export class SettingsSidebarComponent implements OnInit {
  EMAIL_TEMPLATE_NAME = [
    'assignedRequest',
    'assignedEmailMessage',
    'pooledRequest',
    'pooledEmailMessage',
    'newMessage',
    'ticket',
    'sendTranscript',
  ]
  isVisibleANA: boolean;
  isVisibleACT: boolean;
  isVisibleTRI: boolean;
  isVisibleGRO: boolean;
  isVisibleDEP: boolean;
  isVisibleOPH: boolean;
  isVisibleCAR: boolean;
  isVisibleLBS: boolean;
  isVisibleAPP: boolean;
  isVisibleETK: boolean;
  isVisibleKNB: boolean;
  isVisibleAUT: boolean;
  isVisibleINT: boolean;
  TAG_ROUTE_IS_ACTIVE: boolean;
  EMAIL_TICKETING_ROUTE_IS_ACTIVE: boolean;
  CANNED_RESPONSES_ROUTE_IS_ACTIVE: boolean;
  DEPTS_ROUTE_IS_ACTIVE: boolean;
  EDIT_DEPT_ROUTE_IS_ACTIVE: boolean;
  ADD_DEPT_ROUTE_IS_ACTIVE: boolean;
  TRIGGER_ROUTE_IS_ACTIVE: boolean;
  TEAMMATES_ROUTE_IS_ACTIVE: boolean;
  EDIT_TEAMMATE_ROUTE_IS_ACTIVE: boolean;
  TEAMMATES_ADD_ROUTE_IS_ACTIVE: boolean;
  GROUPS_ROUTE_IS_ACTIVE: boolean;
  EDIT_GROUP_ROUTE_IS_ACTIVE: boolean;
  ADD_GROUP_ROUTE_IS_ACTIVE: boolean;
  ROLE_ROUTE_IS_ACTIVE: boolean;
  CREATE_NEW_ROLE_ROUTE_IS_ACTIVE: boolean;
  EDIT_ROLE_ROUTE_IS_ACTIVE: boolean;
  WIDGET_SETUP_ROUTE_IS_ACTIVE: boolean;
  WIDGET_INSTALLATION_ROUTE_IS_ACTIVE: boolean;
  CHATBOT_ROUTE_IS_ACTIVE: boolean;
  PROJECT_SETTINGS_ROUTE_IS_ACTIVE: boolean;
  WEBHOOK_ROUTE_IS_ACTIVE: boolean;
  SMTP_ROUTE_IS_ACTIVE: boolean;
  OPERATING_HOURS_ROUTE_IS_ACTIVE: boolean;
  KNOWLEDGE_BASES_ROUTE_IS_ACTIVE: boolean;
  AUTOMATIONS_ROUTE_IS_ACTIVE: boolean;
  INTEGRATIONS_ROUTE_IS_ACTIVE: boolean;
  APPS_ROUTE_IS_ACTIVE: boolean;
  TRANSLATIONS_ROUTE_IS_ACTIVE: boolean;
  NOTIFICATION_EMAIL_ROUTE_IS_ACTIVE: boolean;
  public_Key: string;
  USER_ROLE: any;
  CHAT_BASE_URL: string;
  project: any;
  route: string;
  sidebar_settings_height: any;
  IS_OPEN: boolean = true;
  routing_and_depts_lbl: string;
  // widgetAPITestPage: string;
  translations: string;
  teammatates_and_groups_lbl: string;
  USER_HAS_TOGGLE_SIDEBAR: boolean;
  ARE_NEW_KB: boolean;
  TEST_WIDGET_API_BASE_URL: string;
  TESTSITE_BASE_URL: string;
  private unsubscribe$: Subject<any> = new Subject<any>();

  PERMISSION_TO_VIEW_WIDGET_SETUP: boolean;
  PERMISSION_TO_VIEW_DEPTS: boolean;
  PERMISSION_TO_VIEW_TEAMMATES_ROLES_GROUPS: boolean;

  PERMISSION_TO_VIEW_TEAMMATES: boolean;
  PERMISSION_TO_VIEW_ROLES: boolean;
  PERMISSION_TO_VIEW_GROUPS: boolean;

  PERMISSION_TO_VIEW_EMAIL_TICKETING: boolean;
  PERMISSION_TO_VIEW_CANNED_RESPONSES: boolean;
  PERMISSION_TO_UPDATE_CANNED: boolean;
  PERMISSION_TO_VIEW_TAGS: boolean;
  PERMISSION_TO_UPDATE_TAGS: boolean;
  PERMISSION_TO_VIEW_OH: boolean;
  PERMISSION_TO_VIEW_INTEGRATIONS: boolean;
  PERMISSION_TO_VIEW_APPS: boolean;
  PERMISSION_TO_VIEW_PROJECT_SETTINGS: boolean;

  PERMISSION_TO_VIEW_PROJECTSETTINGS_GENERAL: boolean;
  PERMISSION_TO_VIEW_PROJECTSETTINGS_DEVELOPER_READ: boolean;
  PERMISSION_TO_VIEW_PROJECTSETTINGS_SMARTASSIGNMENT_READ: boolean;
  PERMISSION_TO_VIEW_PROJECTSETTINGS_NOTIFICATION_READ: boolean;
  PERMISSION_TO_VIEW_PROJECTSETTINGS_SECURITY_READ: boolean;
  PERMISSION_TO_VIEW_PROJECTSETTINGS_BANNED_READ: boolean;
  PERMISSION_TO_VIEW_PROJECTSETTINGS_ADVANCED_READ: boolean;

  constructor(
    public appConfigService: AppConfigService,
    private logger: LoggerService,
    private auth: AuthService,
    public router: Router,
    public location: Location,
    private translate: TranslateService,
    private usersService: UsersService,
    private kbService: KnowledgeBaseService,
    public rolesService: RolesService
  ) { }

  ngOnInit() {
    this.getUserRole();
    this.getOSCODE();
    this.getChatUrl();
    this.getCurrentProject();
    this.getCurrentRoute();
    // this.getMainContentHeight();
    this.listenSidebarIsOpened();
    this.translateString()
    this.listenToProjectUser()
  }

  ngAfterContentInit() {
    setTimeout(() => {
      this.getWindowWidthOnInit();
    }, 0);
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
  
          console.log('[SETTINGS-SIDEBAR] - Role:', status.role);
          console.log('[SETTINGS-SIDEBAR] - Permissions:', status.matchedPermissions);
    
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

          // ----------------------------------
          // PERMISSION_TO_VIEW_TEAMMATES
          // -----------------------------------
          if (status.role === 'owner' || status.role === 'admin') {
            // Owner and admin always has permission
            this.PERMISSION_TO_VIEW_TEAMMATES = true;
            console.log('[SETTINGS-SIDEBAR] - Project user is owner or admin (1)', 'PERMISSION_TO_VIEW_TEAMMATES:', this.PERMISSION_TO_VIEW_TEAMMATES);
  
          } else if (status.role === 'agent') {
            // Agent never have permission
            this.PERMISSION_TO_VIEW_TEAMMATES = false;
            console.log('[SETTINGS-SIDEBAR] - Project user agent (2)', 'PERMISSION_TO_VIEW_TEAMMATES:', this.PERMISSION_TO_VIEW_TEAMMATES);
  
          } else {
            // Custom roles: permission depends on matchedPermissions
            this.PERMISSION_TO_VIEW_TEAMMATES = status.matchedPermissions.includes(PERMISSIONS.TEAMMATES_READ);
            console.log('[SETTINGS-SIDEBAR] - Custom role (3) role', status.role, 'PERMISSION_TO_VIEW_TEAMMATES:', this.PERMISSION_TO_VIEW_TEAMMATES);
          }

          // ----------------------------------
          // PERMISSION_TO_VIEW_ROLES
          // -----------------------------------
          if (status.role === 'owner' || status.role === 'admin') {
            // Owner and admin always has permission
            this.PERMISSION_TO_VIEW_ROLES = true;
            console.log('[SETTINGS-SIDEBAR] - Project user is owner or admin (1)', 'PERMISSION_TO_VIEW_ROLES:', this.PERMISSION_TO_VIEW_ROLES);
  
          } else if (status.role === 'agent') {
            // Agent never have permission
            this.PERMISSION_TO_VIEW_ROLES = false;
            console.log('[SETTINGS-SIDEBAR] - Project user agent (2)', 'PERMISSION_TO_VIEW_ROLES:', this.PERMISSION_TO_VIEW_ROLES);
  
          } else {
            // Custom roles: permission depends on matchedPermissions
            this.PERMISSION_TO_VIEW_ROLES = status.matchedPermissions.includes(PERMISSIONS.ROLES_READ);
            console.log('[SETTINGS-SIDEBAR] - Custom role (3) role', status.role, 'PERMISSION_TO_VIEW_ROLES:', this.PERMISSION_TO_VIEW_ROLES);
          }

          // ----------------------------------
          // PERMISSION_TO_VIEW_GROUPS
          // -----------------------------------
          if (status.role === 'owner' || status.role === 'admin') {
            // Owner and admin always has permission
            this.PERMISSION_TO_VIEW_GROUPS = true;
            console.log('[SETTINGS-SIDEBAR] - Project user is owner or admin (1)', 'PERMISSION_TO_VIEW_GROUPS:', this.PERMISSION_TO_VIEW_GROUPS);
  
          } else if (status.role === 'agent') {
            // Agent never have permission
            this.PERMISSION_TO_VIEW_GROUPS = false;
            console.log('[SETTINGS-SIDEBAR] - Project user agent (2)', 'PERMISSION_TO_VIEW_GROUPS:', this.PERMISSION_TO_VIEW_GROUPS);
  
          } else {
            // Custom roles: permission depends on matchedPermissions
            this.PERMISSION_TO_VIEW_GROUPS = status.matchedPermissions.includes(PERMISSIONS.GROUPS_READ);
            console.log('[SETTINGS-SIDEBAR] - Custom role (3) role', status.role, 'PERMISSION_TO_VIEW_GROUPS:', this.PERMISSION_TO_VIEW_GROUPS);
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

          // -----------------------------------
          // PERMISSION_TO_UPDATE_CANNED
          // -----------------------------------
          if (status.role === 'owner' || status.role === 'admin') {
            // Owner and admin always has permission
            this.PERMISSION_TO_UPDATE_CANNED = true;
            console.log('[SETTINGS-SIDEBAR] - Project user is owner or admin (1)', 'PERMISSION_TO_UPDATE_CANNED:', this.PERMISSION_TO_UPDATE_CANNED);
  
          } else if (status.role === 'agent') {
            // Agent never have permission
            this.PERMISSION_TO_UPDATE_CANNED = false;
            console.log('[SETTINGS-SIDEBAR] - Project user agent (2)', 'PERMISSION_TO_UPDATE_CANNED:', this.PERMISSION_TO_UPDATE_CANNED);
  
          } else {
            // Custom roles: permission depends on matchedPermissions
            this.PERMISSION_TO_UPDATE_CANNED = status.matchedPermissions.includes(PERMISSIONS.CANNED_RESPONSES_UPDATE);
            console.log('[SETTINGS-SIDEBAR] - Custom role (3) role', status.role, 'PERMISSION_TO_UPDATE_CANNED:', this.PERMISSION_TO_UPDATE_CANNED);
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
            console.log('[SETTINGS-SIDEBAR] - Custom role (3) role', status.role, 'PERMISSION_TO_VIEW_TAGS:', this.PERMISSION_TO_VIEW_TAGS);
          }

          // -------------------------------
          // PERMISSION_TO_UPDATE_TAGS
          // -------------------------------
          if (status.role === 'owner' || status.role === 'admin') {
            // Owner and admin always has permission
            this.PERMISSION_TO_UPDATE_TAGS = true;
            console.log('[SETTINGS-SIDEBAR] - Project user is owner or admin (1)', 'PERMISSION_TO_UPDATE_TAGS:', this.PERMISSION_TO_UPDATE_TAGS);
  
          } else if (status.role === 'agent') {
            // Agent never have permission
            this.PERMISSION_TO_UPDATE_TAGS = false;
            console.log('[SETTINGS-SIDEBAR] - Project user agent (2)', 'PERMISSION_TO_UPDATE_TAGS:', this.PERMISSION_TO_UPDATE_TAGS);
  
          } else {
            // Custom roles: permission depends on matchedPermissions
            this.PERMISSION_TO_UPDATE_TAGS = status.matchedPermissions.includes(PERMISSIONS.TAG_UPDATE);
            console.log('[SETTINGS-SIDEBAR] - Custom role (3) role', status.role, 'PERMISSION_TO_UPDATE_TAGS:', this.PERMISSION_TO_UPDATE_TAGS);
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
              this.PERMISSION_TO_VIEW_PROJECT_SETTINGS = false;
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

          // ------------------------------------------
          // PERMISSION_TO_VIEW_PROJECTSETTINGS_GENERAL
          // ------------------------------------------
          if (status.role === 'owner' || status.role === 'admin') {
            // Owner and admin always has permission
            this.PERMISSION_TO_VIEW_PROJECTSETTINGS_GENERAL = true;
            console.log('[SETTINGS-SIDEBAR] - Project user is owner or admin (1)', 'PERMISSION_TO_VIEW_PROJECTSETTINGS_GENERAL:', this.PERMISSION_TO_VIEW_PROJECTSETTINGS_GENERAL);
  
          } else if (status.role === 'agent') {
            // Agent never have permission
            this.PERMISSION_TO_VIEW_PROJECTSETTINGS_GENERAL = false;
            console.log('[SETTINGS-SIDEBAR] - Project user agent (2)', 'PERMISSION_TO_VIEW_PROJECTSETTINGS_GENERAL:', this.PERMISSION_TO_VIEW_PROJECTSETTINGS_GENERAL);
  
          } else {
            // Custom roles: permission depends on matchedPermissions
            this.PERMISSION_TO_VIEW_PROJECTSETTINGS_GENERAL = status.matchedPermissions.includes(PERMISSIONS.PROJECTSETTINGS_GENERAL_READ);
            console.log('[SETTINGS-SIDEBAR] - Custom role (3) role', status.role, 'PERMISSION_TO_VIEW_PROJECTSETTINGS_GENERAL:', this.PERMISSION_TO_VIEW_PROJECTSETTINGS_GENERAL);
          }

          // -------------------------------------------------
          // PERMISSION_TO_VIEW_PROJECTSETTINGS_DEVELOPER_READ
          // -------------------------------------------------
          if (status.role === 'owner' || status.role === 'admin') {
            // Owner and admin always has permission
            this.PERMISSION_TO_VIEW_PROJECTSETTINGS_DEVELOPER_READ = true;
            console.log('[SETTINGS-SIDEBAR] - Project user is owner or admin (1)', 'PERMISSION_TO_VIEW_PROJECTSETTINGS_DEVELOPER_READ:', this.PERMISSION_TO_VIEW_PROJECTSETTINGS_DEVELOPER_READ);
  
          } else if (status.role === 'agent') {
            // Agent never have permission
            this.PERMISSION_TO_VIEW_PROJECTSETTINGS_DEVELOPER_READ = false;
            console.log('[SETTINGS-SIDEBAR] - Project user agent (2)', 'PERMISSION_TO_VIEW_PROJECTSETTINGS_DEVELOPER_READ:', this.PERMISSION_TO_VIEW_PROJECTSETTINGS_DEVELOPER_READ);
  
          } else {
            // Custom roles: permission depends on matchedPermissions
            this.PERMISSION_TO_VIEW_PROJECTSETTINGS_DEVELOPER_READ = status.matchedPermissions.includes(PERMISSIONS.PROJECTSETTINGS_DEVELOPER_READ);
            console.log('[SETTINGS-SIDEBAR] - Custom role (3) role', status.role, 'PERMISSION_TO_VIEW_PROJECTSETTINGS_DEVELOPER_READ:', this.PERMISSION_TO_VIEW_PROJECTSETTINGS_DEVELOPER_READ);
          }


          // -------------------------------------------------------
          // PERMISSION_TO_VIEW_PROJECTSETTINGS_SMARTASSIGNMENT_READ
          // -------------------------------------------------------
          if (status.role === 'owner' || status.role === 'admin') {
            // Owner and admin always has permission
            this.PERMISSION_TO_VIEW_PROJECTSETTINGS_SMARTASSIGNMENT_READ = true;
            console.log('[SETTINGS-SIDEBAR] - Project user is owner or admin (1)', 'PERMISSION_TO_VIEW_PROJECTSETTINGS_SMARTASSIGNMENT_READ:', this.PERMISSION_TO_VIEW_PROJECTSETTINGS_SMARTASSIGNMENT_READ);
  
          } else if (status.role === 'agent') {
            // Agent never have permission
            this.PERMISSION_TO_VIEW_PROJECTSETTINGS_SMARTASSIGNMENT_READ = false;
            console.log('[SETTINGS-SIDEBAR] - Project user agent (2)', 'PERMISSION_TO_VIEW_PROJECTSETTINGS_SMARTASSIGNMENT_READ:', this.PERMISSION_TO_VIEW_PROJECTSETTINGS_SMARTASSIGNMENT_READ);
  
          } else {
            // Custom roles: permission depends on matchedPermissions
            this.PERMISSION_TO_VIEW_PROJECTSETTINGS_SMARTASSIGNMENT_READ = status.matchedPermissions.includes(PERMISSIONS.PROJECTSETTINGS_SMARTASSIGNMENT_READ);
            console.log('[SETTINGS-SIDEBAR] - Custom role (3) role', status.role, 'PERMISSION_TO_VIEW_PROJECTSETTINGS_SMARTASSIGNMENT_READ:', this.PERMISSION_TO_VIEW_PROJECTSETTINGS_SMARTASSIGNMENT_READ);
          }

          // ----------------------------------------------------
          // PERMISSION_TO_VIEW_PROJECTSETTINGS_NOTIFICATION_READ
          // ----------------------------------------------------
          if (status.role === 'owner' || status.role === 'admin') {
            // Owner and admin always has permission
            this.PERMISSION_TO_VIEW_PROJECTSETTINGS_NOTIFICATION_READ = true;
            console.log('[SETTINGS-SIDEBAR] - Project user is owner or admin (1)', 'PERMISSION_TO_VIEW_PROJECTSETTINGS_NOTIFICATION_READ:', this.PERMISSION_TO_VIEW_PROJECTSETTINGS_NOTIFICATION_READ);
  
          } else if (status.role === 'agent') {
            // Agent never have permission
            this.PERMISSION_TO_VIEW_PROJECTSETTINGS_NOTIFICATION_READ = false;
            console.log('[SETTINGS-SIDEBAR] - Project user agent (2)', 'PERMISSION_TO_VIEW_PROJECTSETTINGS_NOTIFICATION_READ:', this.PERMISSION_TO_VIEW_PROJECTSETTINGS_NOTIFICATION_READ);
  
          } else {
            // Custom roles: permission depends on matchedPermissions
            this.PERMISSION_TO_VIEW_PROJECTSETTINGS_NOTIFICATION_READ = status.matchedPermissions.includes(PERMISSIONS.PROJECTSETTINGS_NOTIFICATION_READ);
            console.log('[SETTINGS-SIDEBAR] - Custom role (3) role', status.role, 'PERMISSION_TO_VIEW_PROJECTSETTINGS_NOTIFICATION_READ:', this.PERMISSION_TO_VIEW_PROJECTSETTINGS_NOTIFICATION_READ);
          }


          // ------------------------------------------------
          // PERMISSION_TO_VIEW_PROJECTSETTINGS_SECURITY_READ
          // ------------------------------------------------
          if (status.role === 'owner' || status.role === 'admin') {
            // Owner and admin always has permission
            this.PERMISSION_TO_VIEW_PROJECTSETTINGS_SECURITY_READ = true;
            console.log('[SETTINGS-SIDEBAR] - Project user is owner or admin (1)', 'PERMISSION_TO_VIEW_PROJECTSETTINGS_SECURITY_READ:', this.PERMISSION_TO_VIEW_PROJECTSETTINGS_SECURITY_READ);
  
          } else if (status.role === 'agent') {
            // Agent never have permission
            this.PERMISSION_TO_VIEW_PROJECTSETTINGS_SECURITY_READ = false;
            console.log('[SETTINGS-SIDEBAR] - Project user agent (2)', 'PERMISSION_TO_VIEW_PROJECTSETTINGS_SECURITY_READ:', this.PERMISSION_TO_VIEW_PROJECTSETTINGS_SECURITY_READ);
  
          } else {
            // Custom roles: permission depends on matchedPermissions
            this.PERMISSION_TO_VIEW_PROJECTSETTINGS_SECURITY_READ = status.matchedPermissions.includes(PERMISSIONS.PROJECTSETTINGS_SECURITY_READ);
            console.log('[SETTINGS-SIDEBAR] - Custom role (3) role', status.role, 'PERMISSION_TO_VIEW_PROJECTSETTINGS_SECURITY_READ:', this.PERMISSION_TO_VIEW_PROJECTSETTINGS_SECURITY_READ);
          }

          // ------------------------------------------------
          // PERMISSION_TO_VIEW_PROJECTSETTINGS_BANNED_READ
          // ------------------------------------------------
          if (status.role === 'owner' || status.role === 'admin') {
            // Owner and admin always has permission
            this.PERMISSION_TO_VIEW_PROJECTSETTINGS_BANNED_READ = true;
            console.log('[SETTINGS-SIDEBAR] - Project user is owner or admin (1)', 'PERMISSION_TO_VIEW_PROJECTSETTINGS_BANNED_READ:', this.PERMISSION_TO_VIEW_PROJECTSETTINGS_BANNED_READ);
  
          } else if (status.role === 'agent') {
            // Agent never have permission
            this.PERMISSION_TO_VIEW_PROJECTSETTINGS_BANNED_READ = false;
            console.log('[SETTINGS-SIDEBAR] - Project user agent (2)', 'PERMISSION_TO_VIEW_PROJECTSETTINGS_BANNED_READ:', this.PERMISSION_TO_VIEW_PROJECTSETTINGS_BANNED_READ);
  
          } else {
            // Custom roles: permission depends on matchedPermissions
            this.PERMISSION_TO_VIEW_PROJECTSETTINGS_BANNED_READ = status.matchedPermissions.includes(PERMISSIONS.PROJECTSETTINGS_BANNED_READ);
            console.log('[SETTINGS-SIDEBAR] - Custom role (3) role', status.role, 'PERMISSION_TO_VIEW_PROJECTSETTINGS_BANNED_READ:', this.PERMISSION_TO_VIEW_PROJECTSETTINGS_BANNED_READ);
          }

          // ------------------------------------------------
          // PERMISSION_TO_VIEW_PROJECTSETTINGS_ADVANCED_READ
          // ------------------------------------------------
          if (status.role === 'owner' || status.role === 'admin') {
            // Owner and admin always has permission
            this.PERMISSION_TO_VIEW_PROJECTSETTINGS_ADVANCED_READ = true;
            console.log('[SETTINGS-SIDEBAR] - Project user is owner or admin (1)', 'PERMISSION_TO_VIEW_PROJECTSETTINGS_ADVANCED_READ:', this.PERMISSION_TO_VIEW_PROJECTSETTINGS_ADVANCED_READ);
  
          } else if (status.role === 'agent') {
            // Agent never have permission
            this.PERMISSION_TO_VIEW_PROJECTSETTINGS_ADVANCED_READ = false;
            console.log('[SETTINGS-SIDEBAR] - Project user agent (2)', 'PERMISSION_TO_VIEW_PROJECTSETTINGS_ADVANCED_READ:', this.PERMISSION_TO_VIEW_PROJECTSETTINGS_ADVANCED_READ);
  
          } else {
            // Custom roles: permission depends on matchedPermissions
            this.PERMISSION_TO_VIEW_PROJECTSETTINGS_ADVANCED_READ = status.matchedPermissions.includes(PERMISSIONS.PROJECTSETTINGS_ADVANCED_READ);
            console.log('[SETTINGS-SIDEBAR] - Custom role (3) role', status.role, 'PERMISSION_TO_VIEW_PROJECTSETTINGS_ADVANCED_READ:', this.PERMISSION_TO_VIEW_PROJECTSETTINGS_ADVANCED_READ);
          }

          // You can also check status.role === 'owner' if needed
        });
    }

  getUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((userRole) => {
        //  this.logger.log('[SETTINGS-SIDEBAR]] - SUBSCRIPTION TO USER ROLE »»» ', userRole)
        this.USER_ROLE = userRole;
      })
  }

  listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
      this.logger.log('[SETTINGS-SIDEBAR] SETTINGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN = isopened
    })
  }

  toggleSettingsSidebar(IS_OPEN) {
    this.logger.log('[SETTINGS-SIDEBAR] IS_OPEN >>>>>', IS_OPEN)
    // this.IS_OPEN = IS_OPENù
    this.USER_HAS_TOGGLE_SIDEBAR = true
    this.logger.log('[SETTINGS-SIDEBAR] toggleSettingsSidebar USER_HAS_TOGGLE_SIDEBAR >>>>>', this.USER_HAS_TOGGLE_SIDEBAR)
    this.auth.toggleSettingsSidebar(IS_OPEN)
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const newInnerWidth = event.target.innerWidth;

    // this.logger.log('SETTINGS-SIDEBAR] ON RESIZE WINDOW WIDTH ', newInnerWidth);

    if (newInnerWidth < 1200) {
      this.toggleSettingsSidebar(false)
    }
    if (newInnerWidth >= 1200) {
      this.toggleSettingsSidebar(true)

    }
  }


  getWindowWidthOnInit() {
    const onInitWindoeWidth = window.innerWidth;
    this.logger.log('SETTINGS-SIDEBAR] ON INIT WINDOW WIDTH >>>>>> ', onInitWindoeWidth);
    this.logger.log('SETTINGS-SIDEBAR] ON INIT USER_HAS_TOGGLE_SIDEBAR >>>>>> ', this.USER_HAS_TOGGLE_SIDEBAR);
    // if (this.USER_HAS_TOGGLE_SIDEBAR === false) {
    if (onInitWindoeWidth < 1200) {
      this.toggleSettingsSidebar(false)
    }
    if (onInitWindoeWidth >= 1200) {
      this.toggleSettingsSidebar(true)
    }
    // }
  }

  // @ Not used 
  getMainContentHeight() {
    const elemMainContent = <HTMLElement>document.querySelector('.main-content')
    const elemAppdashboardSettingsSidebar = <HTMLElement>(document.querySelector('appdashboard-settings-sidebar'))
    this.logger.log('[SETTINGS-SIDEBAR] elemMainContent ', elemMainContent)
    this.logger.log('[SETTINGS-SIDEBAR] elemAppdashboardSettingsSidebar ', elemAppdashboardSettingsSidebar)
    setTimeout(() => {
      this.logger.log('[SETTINGS-SIDEBAR] elemAppdashboardSettingsSidebar clientHeight', elemAppdashboardSettingsSidebar.clientHeight)
    }, 0)

    const main_content_height = elemMainContent.clientHeight
    this.logger.log('[SETTINGS-SIDEBAR] elemMainContent.clientHeight ', main_content_height)

    const _main_content_height = elemMainContent.offsetHeight
    this.logger.log('[SETTINGS-SIDEBAR]  elemMainContent.offsetHeight ', _main_content_height)

    let h = window.innerHeight
    this.logger.log('[SETTINGS-SIDEBAR] window.innerHeight ', h)
    // }, 500);
    //  const main_content_height = elemMainContent.clientHeight
    //  this.logger.log('[SETTINGS-SIDEBAR] main_content_height ',main_content_height)
    this.sidebar_settings_height = main_content_height + 70 + 'px'
  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK
    this.logger.log(
      '[SETTINGS-SIDEBAR] AppConfigService getAppConfig public_Key',
      this.public_Key,
    )

    let keys = this.public_Key.split('-')
    this.logger.log('[SETTINGS-SIDEBAR] PUBLIC-KEY - public_Key keys', keys)

    keys.forEach((key) => {
      if (key.includes('ANA')) {
        let ana = key.split(':')

        if (ana[1] === 'F') {
          this.isVisibleANA = false;
        } else {
          this.isVisibleANA = true;
        }
      }

      if (key.includes('ACT')) {
        let act = key.split(':')
        if (act[1] === 'F') {
          this.isVisibleACT = false;
        } else {
          this.isVisibleACT = true;
        }
      }

      if (key.includes('TRI')) {
        let tri = key.split(':')
        if (tri[1] === 'F') {
          this.isVisibleTRI = false;
        } else {
          this.isVisibleTRI = true;
        }
      }

      if (key.includes('GRO')) {
        let gro = key.split(':')
        if (gro[1] === 'F') {
          this.isVisibleGRO = false;
          this.getTeammatesTraslantion()
        } else {
          this.isVisibleGRO = true;
          this.getTeammatesAndGroupTraslantion()
        }
      }

      if (key.includes('DEP')) {
        let dep = key.split(':')
        if (dep[1] === 'F') {
          this.isVisibleDEP = false;
          this.getRoutingTranslation();
        } else {
          this.isVisibleDEP = true;
          this.getDeptsAndRoutingTranslation();
        }
      }

      if (key.includes('OPH')) {
        let oph = key.split(':')
        if (oph[1] === 'F') {
          this.isVisibleOPH = false;
        } else {
          this.isVisibleOPH = true;
        }
      }

      if (key.includes('CAR')) {
        let car = key.split(':')
        if (car[1] === 'F') {
          this.isVisibleCAR = false;
        } else {
          this.isVisibleCAR = true;
        }
      }

      if (key.includes('LBS')) {
        let lbs = key.split(':')
        if (lbs[1] === 'F') {
          this.isVisibleLBS = false;
        } else {
          this.isVisibleLBS = true;
        }
      }

      if (key.includes('APP')) {
        let lbs = key.split(':')
        if (lbs[1] === 'F') {
          this.isVisibleAPP = false;
        } else {
          this.isVisibleAPP = true;
        }
      }

      if (key.includes('ETK')) {
        let etk = key.split(':')
        if (etk[1] === 'F') {
          this.isVisibleETK = false;
        } else {
          this.isVisibleETK = true;
        }
      }

      if (key.includes('KNB')) {
        let knb = key.split(':')
        if (knb[1] === 'F') {
          this.isVisibleKNB = false;
        } else {
          this.isVisibleKNB = true;
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

      if (key.includes("INT")) {
        let int = key.split(":");
        if (int[1] === "F") {
          this.isVisibleINT = false;
        } else {
          this.isVisibleINT = true;
        }
      }


    })

    if (!this.public_Key.includes('CAR')) {
      this.isVisibleCAR = false
    }

    if (!this.public_Key.includes('LBS')) {
      this.isVisibleLBS = false
    }

    if (!this.public_Key.includes('APP')) {
      this.isVisibleAPP = false
    }
    if (!this.public_Key.includes('ETK')) {
      this.isVisibleETK = false
    }

    if (!this.public_Key.includes('KNB')) {
      this.isVisibleKNB = false
    }
    if (!this.public_Key.includes('AUT')) {
      this.isVisibleAUT = false
    }

    if (!this.public_Key.includes("INT")) {
      this.isVisibleINT = false;
    }
    if (this.isVisibleKNB) {
      // this.listenToKbVersion()
      this.getKnowledgeBaseSettings() 
    }
  }


   getKnowledgeBaseSettings() {
      this.kbService.getKbSettingsPrev().subscribe((kbSettings: KbSettings) => {
        this.logger.log("[SIDEBAR] get kbSettings RES ", kbSettings);
        if (kbSettings && kbSettings.kbs) {
          if (kbSettings.kbs.length === 0) {
            // this.kbService.areNewwKb(true)
            this.ARE_NEW_KB = true
          } else if (kbSettings.kbs.length > 0) {
            // this.kbService.areNewwKb(false)
            this.ARE_NEW_KB = false
          }
  
        } else {
          // this.kbService.areNewwKb(true)
          this.ARE_NEW_KB = true
        }
  
      }, (error) => {
        this.logger.error("[SIDEBAR] get kbSettings ERROR ", error);
      }, () => {
        this.logger.log("SIDEBAR] get kbSettings * COMPLETE *");
  
      })
    }

  // No more used
  // listenToKbVersion() {
  //   this.kbService.newKb
  //     .pipe(
  //       takeUntil(this.unsubscribe$)
  //     )
  //     .subscribe((newKb) => {
  //       this.logger.log('[SETTINGS-SIDEBAR] - are new KB ', newKb)
  //       this.ARE_NEW_KB = newKb;
  //     })
  // }

  getRoutingTranslation() {
    this.translate.get('Routing')
      .subscribe((text: string) => {
        this.routing_and_depts_lbl = text;
      });
  }

  getDeptsAndRoutingTranslation() {
    this.translate.get('RoutingAndDepts')
      .subscribe((text: string) => {
        this.routing_and_depts_lbl = text;
      });
  }
  translateString() {
    this.translate.get('Translations')
      .subscribe((text: string) => {
        this.translations = text;
      });
  }



  getTeammatesTraslantion() {
    this.translate.get('Teammates')
      .subscribe((text: string) => {
        this.teammatates_and_groups_lbl = text.replace(/\b\w/g, l => l.toUpperCase());
      });
  }

  getTeammatesAndGroupTraslantion() {
    this.translate.get('UsersAndGroups')
      .subscribe((text: string) => {

        this.teammatates_and_groups_lbl = text;
      });
  }

  getChatUrl() {
    this.CHAT_BASE_URL = this.appConfigService.getConfig().CHAT_BASE_URL
    // this.logger.log('[SIDEBAR] AppConfigService getAppConfig CHAT_BASE_URL', this.CHAT_BASE_URL);
  }

  getCurrentProject() {
    this.logger.log(
      '[SETTINGS-SIDEBAR] - CALLING GET CURRENT PROJECT  ',
      this.project,
    )
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      // this.logger.log('[SIDEBAR] project from AUTH service subscription  ', this.project)
    })
  }

  goToCannedResponses() {
    this.router.navigate(['project/' + this.project._id + '/cannedresponses'])
  }

  goToEmailTicketing() {
    this.router.navigate(['project/' + this.project._id + '/email'])
  }

  goToTags() {
    // routerLink="project/{{ project._id }}/labels"
    this.router.navigate(['project/' + this.project._id + '/labels'])
  }

  goToDepartments() {
    // routerLink="project/{{ project._id }}/departments"
    this.router.navigate(['project/' + this.project._id + '/departments'])
  }

  goToTrigger() {
    //   routerLink="project/{{ project._id }}/trigger
    this.router.navigate(['project/' + this.project._id + '/trigger'])
  }

  goToTeammatesRolesGroups() {
    if (this.PERMISSION_TO_VIEW_TEAMMATES) {
      this.goToTeammates()
    } else if (this.PERMISSION_TO_VIEW_ROLES) {
        this.goToRoles()
    } else if (this.PERMISSION_TO_VIEW_GROUPS) {
      this.goToGroups()
    }
  }

  goToTeammates() {
    // routerLink="project/{{ project._id }}/users"
    this.router.navigate(['project/' + this.project._id + '/users'])
  }

  goToRoles() {
    this.router.navigate(['project/' + this.project._id + '/roles'])
  }

  goToGroups() {
    this.router.navigate(['project/' + this.project._id + '/groups'])
  }

  goToChatbot() {
    // routerLink="project/{{ project._id }}/bots
    this.router.navigate(['project/' + this.project._id + '/bots'])
  }

  goToWidgetSetUp() {
    // routerLink="project/{{ project._id }}/widget-set-up"
    this.router.navigate(['project/' + this.project._id + '/widget-set-up'])
  }

  goToWidgetInstallation() {
    this.router.navigate(['project/' + this.project._id + '/installation'])
  }

  goToOperatingHours() {
    // routerLink="project/{{ project._id }}/hours"
    this.router.navigate(['project/' + this.project._id + '/hours'])
  }

  goToAutomations() {
    this.router.navigate(['project/' + this.project._id + '/automations'])
  }

  goToIntegrations() {
    this.router.navigate(['project/' + this.project._id + '/integrations'])
  }

  goToApps() {
    this.router.navigate(['project/' + this.project._id + '/app-store'])
  }

  goToKnowledgeBases() {
    this.logger.log("goToKnowledgeBases -----> project._id: ", this.project._id);
    this.router.navigate(['project/' + this.project._id + '/knowledge-bases-pre'])
  }


  goToProjectSettings() {
   if(this.PERMISSION_TO_VIEW_PROJECTSETTINGS_GENERAL) {
    this.goToProjectSettingsGeneral()
   } else if (this.PERMISSION_TO_VIEW_PROJECTSETTINGS_DEVELOPER_READ) {
    this.goToProjectSettingsDeveloper()
   } else if (this.PERMISSION_TO_VIEW_PROJECTSETTINGS_SMARTASSIGNMENT_READ) {
    this.goToProjectSettingsSmartAssign()
   } else if (this.PERMISSION_TO_VIEW_PROJECTSETTINGS_NOTIFICATION_READ) {
     this.goToProjectSettingsNotifications()    
   } else if (this.PERMISSION_TO_VIEW_PROJECTSETTINGS_SECURITY_READ) {
    this.goToProjectSettingsSecurity()
   } else if (this.PERMISSION_TO_VIEW_PROJECTSETTINGS_BANNED_READ) {
    this.goToProjectSettingsBanned()
   } else if (this.PERMISSION_TO_VIEW_PROJECTSETTINGS_ADVANCED_READ) {
    this.goToProjectSettingsAdvanced()
   }

  }


  goToProjectSettingsGeneral() {
    this.router.navigate(['project/' + this.project._id + '/project-settings/general'])
  }

  goToProjectSettingsDeveloper() {
    this.router.navigate(['project/' + this.project._id + '/project-settings/auth'])
  }

  goToProjectSettingsSmartAssign() {
    this.router.navigate(['project/' + this.project._id + '/project-settings/smartassignment'])
  }

  goToProjectSettingsNotifications() {
    this.router.navigate(['project/' + this.project._id + '/project-settings/notification'])
  }

  goToProjectSettingsSecurity() {
    this.router.navigate(['project/' + this.project._id + '/project-settings/security'])
  }

  goToProjectSettingsBanned() {
    this.router.navigate(['project/' + this.project._id + '/project-settings/banned'])
  }

   goToProjectSettingsAdvanced() {
    this.router.navigate(['project/' + this.project._id + '/project-settings/advanced'])
  }

  goToMultilanguage() {
    this.router.navigate(['project/' + this.project._id + '/widget/translations'])
  }

  getCurrentRoute() {
    // this.router.events.filter((event: any) => event instanceof NavigationEnd)
    //   .subscribe(event => {
    // this.router.events.subscribe((val) => {
    // if (this.location.path() !== '') {
    // this.route = this.location.path();
    this.route = this.router.url
    // this.logger.log('[SETTINGS-SIDEBAR] route ', this.route);

    if (this.route.indexOf('/labels') !== -1) {
      this.TAG_ROUTE_IS_ACTIVE = true
      this.logger.log(
        '[SETTING-SIDEBAR] - TAG_ROUTE_IS_ACTIVE  ',
        this.TAG_ROUTE_IS_ACTIVE,
      )
    } else {
      this.TAG_ROUTE_IS_ACTIVE = false
      this.logger.log('[SETTING-SIDEBAR] - TAG_ROUTE_IS_ACTIVE ', this.TAG_ROUTE_IS_ACTIVE)
    }


    if (this.route.indexOf('/email') !== -1) {
      this.EMAIL_TICKETING_ROUTE_IS_ACTIVE = true
      this.logger.log('[SETTING-SIDEBAR] - EMAIL_TICKETING_ROUTE_IS_ACTIVE  ', this.EMAIL_TICKETING_ROUTE_IS_ACTIVE)
    } else {
      this.EMAIL_TICKETING_ROUTE_IS_ACTIVE = false
      this.logger.log('[SETTING-SIDEBAR] - EMAIL_TICKETING_ROUTE_IS_ACTIVE  ', this.EMAIL_TICKETING_ROUTE_IS_ACTIVE)
    }


    if (this.route.indexOf('/cannedresponses') !== -1) {
      this.CANNED_RESPONSES_ROUTE_IS_ACTIVE = true
      this.logger.log(
        '[SETTING-SIDEBAR] - CANNED_RESPONSES_ROUTE_IS_ACTIVE  ',
        this.CANNED_RESPONSES_ROUTE_IS_ACTIVE,
      )
    } else {
      this.CANNED_RESPONSES_ROUTE_IS_ACTIVE = false
      this.logger.log(
        '[SETTING-SIDEBAR] - CANNED_RESPONSES_ROUTE_IS_ACTIVE  ',
        this.CANNED_RESPONSES_ROUTE_IS_ACTIVE,
      )
    }

    if (this.route.indexOf('/departments') !== -1) {
      this.DEPTS_ROUTE_IS_ACTIVE = true
      this.logger.log('[SETTING-SIDEBAR] - DEPTS_ROUTE_IS_ACTIVE  ', this.DEPTS_ROUTE_IS_ACTIVE)
    } else {
      this.DEPTS_ROUTE_IS_ACTIVE = false
      this.logger.log('[SETTING-SIDEBAR] - DEPTS_ROUTE_IS_ACTIVE  ', this.DEPTS_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/department/edit') !== -1) {
      this.EDIT_DEPT_ROUTE_IS_ACTIVE = true
      this.logger.log('[SETTING-SIDEBAR] - EDIT_DEPT_ROUTE_IS_ACTIVE  ', this.EDIT_DEPT_ROUTE_IS_ACTIVE)
    } else {
      this.EDIT_DEPT_ROUTE_IS_ACTIVE = false
      this.logger.log('[SETTING-SIDEBAR] - EDIT_DEPT_ROUTE_IS_ACTIVE  ', this.EDIT_DEPT_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/department/create') !== -1) {
      this.ADD_DEPT_ROUTE_IS_ACTIVE = true
      this.logger.log('[SETTING-SIDEBAR] - ADD_DEPT_ROUTE_IS_ACTIVE  ', this.ADD_DEPT_ROUTE_IS_ACTIVE)
    } else {
      this.ADD_DEPT_ROUTE_IS_ACTIVE = false
      this.logger.log('[SETTING-SIDEBAR] - ADD_DEPT_ROUTE_IS_ACTIVE  ', this.ADD_DEPT_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/trigger') !== -1) {
      this.TRIGGER_ROUTE_IS_ACTIVE = true
      this.logger.log( '[SETTING-SIDEBAR] - TRIGGER_ROUTE_IS_ACTIVE  ', this.TRIGGER_ROUTE_IS_ACTIVE)
    } else {
      this.TRIGGER_ROUTE_IS_ACTIVE = false
      this.logger.log( '[SETTING-SIDEBAR] - TRIGGER_ROUTE_IS_ACTIVE  ', this.TRIGGER_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/users') !== -1) {
      this.TEAMMATES_ROUTE_IS_ACTIVE = true
      this.logger.log( '[SETTING-SIDEBAR] - TEAMMATES_ROUTE_IS_ACTIVE  ', this.TEAMMATES_ROUTE_IS_ACTIVE)
    } else {
      this.TEAMMATES_ROUTE_IS_ACTIVE = false
      this.logger.log( '[SETTING-SIDEBAR] - TEAMMATES_ROUTE_IS_ACTIVE  ', this.TEAMMATES_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/user/edit') !== -1) {
      this.EDIT_TEAMMATE_ROUTE_IS_ACTIVE = true
      this.logger.log( '[SETTING-SIDEBAR] - EDIT_TEAMMATE_ROUTE_IS_ACTIVE  ', this.EDIT_TEAMMATE_ROUTE_IS_ACTIVE)
    } else {
      this.EDIT_TEAMMATE_ROUTE_IS_ACTIVE = false
      this.logger.log( '[SETTING-SIDEBAR] - EDIT_TEAMMATE_ROUTE_IS_ACTIVE  ', this.EDIT_TEAMMATE_ROUTE_IS_ACTIVE)
    }


    

    if (this.route.indexOf('/user/add') !== -1) {
      this.TEAMMATES_ADD_ROUTE_IS_ACTIVE = true
      this.logger.log( '[SETTING-SIDEBAR] - TEAMMATES_ROUTE_IS_ACTIVE  ', this.TEAMMATES_ADD_ROUTE_IS_ACTIVE)
    } else {
      this.TEAMMATES_ADD_ROUTE_IS_ACTIVE = false
      this.logger.log( '[SETTING-SIDEBAR] - TEAMMATES_ADD_ROUTE_IS_ACTIVE  ', this.TEAMMATES_ADD_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/groups') !== -1) {
      this.GROUPS_ROUTE_IS_ACTIVE = true
      this.logger.log( '[SETTING-SIDEBAR] - GROUPS_ROUTE_IS_ACTIVE  ',this.GROUPS_ROUTE_IS_ACTIVE)
    } else {
      this.GROUPS_ROUTE_IS_ACTIVE = false
      this.logger.log('[SETTING-SIDEBAR] - GROUPS_ROUTE_IS_ACTIVE  ',this.GROUPS_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/group/edit') !== -1) {
      this.EDIT_GROUP_ROUTE_IS_ACTIVE = true
      this.logger.log( '[SETTING-SIDEBAR] - EDIT_GROUP_ROUTE_IS_ACTIVE  ', this.EDIT_GROUP_ROUTE_IS_ACTIVE )
    } else {
      this.EDIT_GROUP_ROUTE_IS_ACTIVE = false
      this.logger.log( '[SETTING-SIDEBAR] - EDIT_GROUP_ROUTE_IS_ACTIVE  ', this.EDIT_GROUP_ROUTE_IS_ACTIVE )
    }

    if (this.route.indexOf('/group/create') !== -1) {
      this.ADD_GROUP_ROUTE_IS_ACTIVE = true
      this.logger.log( '[SETTING-SIDEBAR] - ADD_GROUP_ROUTE_IS_ACTIVE  ', this.ADD_GROUP_ROUTE_IS_ACTIVE )
    } else {
      this.ADD_GROUP_ROUTE_IS_ACTIVE = false
      this.logger.log( '[SETTING-SIDEBAR] - ADD_GROUP_ROUTE_IS_ACTIVE  ', this.ADD_GROUP_ROUTE_IS_ACTIVE )
    }

    if (this.route.indexOf('/roles') !== -1) {
      this.ROLE_ROUTE_IS_ACTIVE = true
      this.logger.log( '[SETTING-SIDEBAR] - ROLE_ROUTE_IS_ACTIVE  ', this.ROLE_ROUTE_IS_ACTIVE )
    } else {
      this.ROLE_ROUTE_IS_ACTIVE = false
      this.logger.log( '[SETTING-SIDEBAR] - ROLE_ROUTE_IS_ACTIVE  ', this.ROLE_ROUTE_IS_ACTIVE )
    }

     if (this.route.indexOf('/create-new-role') !== -1) {
      this.CREATE_NEW_ROLE_ROUTE_IS_ACTIVE = true
      this.logger.log( '[SETTING-SIDEBAR] - CREATE_NEW_ROLE_ROUTE_IS_ACTIVE  ', this.CREATE_NEW_ROLE_ROUTE_IS_ACTIVE )
    } else {
      this.CREATE_NEW_ROLE_ROUTE_IS_ACTIVE = false
      this.logger.log( '[SETTING-SIDEBAR] - CREATE_NEW_ROLE_ROUTE_IS_ACTIVE  ', this.CREATE_NEW_ROLE_ROUTE_IS_ACTIVE )
    }

     if (this.route.indexOf('/edit-role') !== -1) {
      this.EDIT_ROLE_ROUTE_IS_ACTIVE = true
      this.logger.log( '[SETTING-SIDEBAR] - EDIT_ROLE_ROUTE_IS_ACTIVE  ', this.CREATE_NEW_ROLE_ROUTE_IS_ACTIVE )
    } else {
      this.EDIT_ROLE_ROUTE_IS_ACTIVE = false
      this.logger.log( '[SETTING-SIDEBAR] - EDIT_ROLE_ROUTE_IS_ACTIVE  ', this.CREATE_NEW_ROLE_ROUTE_IS_ACTIVE )
    }

    

    if (this.route.indexOf('/widget-set-up') !== -1) {
      this.WIDGET_SETUP_ROUTE_IS_ACTIVE = true
      this.logger.log('[SETTING-SIDEBAR] - WIDGET_SETUP_ROUTE_IS_ACTIVE  ', this.WIDGET_SETUP_ROUTE_IS_ACTIVE)
    } else {
      this.WIDGET_SETUP_ROUTE_IS_ACTIVE = false
      this.logger.log('[SETTING-SIDEBAR] - WIDGET_SETUP_ROUTE_IS_ACTIVE  ', this.WIDGET_SETUP_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/installation') !== -1) {
      this.WIDGET_INSTALLATION_ROUTE_IS_ACTIVE = true
      this.logger.log('[SETTING-SIDEBAR] - WIDGET_INSTALLATION_ROUTE_IS_ACTIVE  ', this.WIDGET_INSTALLATION_ROUTE_IS_ACTIVE,
      )
    } else {
      this.WIDGET_INSTALLATION_ROUTE_IS_ACTIVE = false
      this.logger.log('[SETTING-SIDEBAR] - WIDGET_INSTALLATION_ROUTE_IS_ACTIVE  ', this.WIDGET_INSTALLATION_ROUTE_IS_ACTIVE,
      )
    }



    if (this.route.indexOf('/bots') !== -1) {
      this.CHATBOT_ROUTE_IS_ACTIVE = true
      this.logger.log('[SETTING-SIDEBAR] - CHATBOT_ROUTE_IS_ACTIVE  ',this.CHATBOT_ROUTE_IS_ACTIVE )
    } else {
      this.CHATBOT_ROUTE_IS_ACTIVE = false
      this.logger.log( '[SETTING-SIDEBAR] - CHATBOT_ROUTE_IS_ACTIVE  ', this.CHATBOT_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/hours') !== -1) {
      this.OPERATING_HOURS_ROUTE_IS_ACTIVE = true
      this.logger.log('[SETTING-SIDEBAR] - OPERATING_HOURS_ROUTE_IS_ACTIVE ', this.OPERATING_HOURS_ROUTE_IS_ACTIVE)
    } else {
      this.OPERATING_HOURS_ROUTE_IS_ACTIVE = false
      this.logger.log('[SETTING-SIDEBAR] - OPERATING_HOURS_ROUTE_IS_ACTIVE ', this.OPERATING_HOURS_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/knowledge-bases') !== -1) {
      this.KNOWLEDGE_BASES_ROUTE_IS_ACTIVE = true
      this.logger.log('[SETTING-SIDEBAR] - KNOWLEDGE_BASES_ROUTE_IS_ACTIVE ', this.KNOWLEDGE_BASES_ROUTE_IS_ACTIVE)
    } else {
      this.KNOWLEDGE_BASES_ROUTE_IS_ACTIVE = false
      this.logger.log('[SETTING-SIDEBAR] - KNOWLEDGE_BASES_ROUTE_IS_ACTIVE ', this.KNOWLEDGE_BASES_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/automations') !== -1) {
      this.AUTOMATIONS_ROUTE_IS_ACTIVE = true
      this.logger.log('[SETTING-SIDEBAR] - AUTOMATIONS_ROUTE_IS_ACTIVE ', this.AUTOMATIONS_ROUTE_IS_ACTIVE)
    } else {
      this.AUTOMATIONS_ROUTE_IS_ACTIVE = false
      this.logger.log('[SETTING-SIDEBAR] - AUTOMATIONS_ROUTE_IS_ACTIVE ', this.AUTOMATIONS_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/integrations') !== -1) {
      this.INTEGRATIONS_ROUTE_IS_ACTIVE = true
      this.logger.log('[SETTING-SIDEBAR] - INTEGRATIONS_ROUTE_IS_ACTIVE  ', this.INTEGRATIONS_ROUTE_IS_ACTIVE)
    } else {
      this.INTEGRATIONS_ROUTE_IS_ACTIVE = false
      this.logger.log('[SETTING-SIDEBAR] - INTEGRATIONS_ROUTE_IS_ACTIVE  ', this.INTEGRATIONS_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/app-store') !== -1) {
      this.APPS_ROUTE_IS_ACTIVE = true
      this.logger.log('[SETTING-SIDEBAR] - APPS_ROUTE_IS_ACTIVE  ', this.APPS_ROUTE_IS_ACTIVE)
    } else {
      this.APPS_ROUTE_IS_ACTIVE = false
      this.logger.log('[SETTING-SIDEBAR] - INTEGRATIONS_ROUTE_IS_ACTIVE  ', this.APPS_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/widget/translations') !== -1) {
      this.TRANSLATIONS_ROUTE_IS_ACTIVE = true
      this.logger.log('[SETTING-SIDEBAR] - TRANSLATIONS_ROUTE_IS_ACTIVE  ', this.TRANSLATIONS_ROUTE_IS_ACTIVE)
    } else {
      this.TRANSLATIONS_ROUTE_IS_ACTIVE = false
      this.logger.log('[SETTING-SIDEBAR] - TRANSLATIONS_ROUTE_IS_ACTIVE  ', this.TRANSLATIONS_ROUTE_IS_ACTIVE)
    }


    if (this.route.indexOf('/notification-email') !== -1) {
      this.NOTIFICATION_EMAIL_ROUTE_IS_ACTIVE = true
      this.logger.log('[SETTING-SIDEBAR] - NOTIFICATION_EMAIL_ROUTE_IS_ACTIVE  ', this.NOTIFICATION_EMAIL_ROUTE_IS_ACTIVE)
    } else {
      this.NOTIFICATION_EMAIL_ROUTE_IS_ACTIVE = false
      this.logger.log('[SETTING-SIDEBAR] - NOTIFICATION_EMAIL_ROUTE_IS_ACTIVE  ', this.NOTIFICATION_EMAIL_ROUTE_IS_ACTIVE)
    }


    


    if (this.route.indexOf('/project-settings/') !== -1) {
      this.PROJECT_SETTINGS_ROUTE_IS_ACTIVE = true
      this.logger.log('[SETTING-SIDEBAR] - PROJECT_SETTINGS_ROUTE_IS_ACTIVE  ', this.PROJECT_SETTINGS_ROUTE_IS_ACTIVE )
    } else {
      this.PROJECT_SETTINGS_ROUTE_IS_ACTIVE = false
      this.logger.log( '[SETTING-SIDEBAR] - PROJECT_SETTINGS_ROUTE_IS_ACTIVE  ',  this.PROJECT_SETTINGS_ROUTE_IS_ACTIVE )
    }

    if (this.route.indexOf('/smtp-settings') !== -1) {
      this.SMTP_ROUTE_IS_ACTIVE = true
      this.logger.log('[SETTING-SIDEBAR] - SMTP_ROUTE_IS_ACTIVE  ', this.SMTP_ROUTE_IS_ACTIVE)
    } else {
      this.SMTP_ROUTE_IS_ACTIVE = false
      this.logger.log('[SETTING-SIDEBAR] - SMTP_ROUTE_IS_ACTIVE  ', this.SMTP_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/webhook') !== -1) {
      this.WEBHOOK_ROUTE_IS_ACTIVE = true
      this.logger.log('[SETTING-SIDEBAR] - WEBHOOK_ROUTE_IS_ACTIVE  ', this.WEBHOOK_ROUTE_IS_ACTIVE)
    } else {
      this.WEBHOOK_ROUTE_IS_ACTIVE = false
      this.logger.log('[SETTING-SIDEBAR] - WEBHOOK_ROUTE_IS_ACTIVE  ', this.WEBHOOK_ROUTE_IS_ACTIVE)
    }

    

    
  }
}
