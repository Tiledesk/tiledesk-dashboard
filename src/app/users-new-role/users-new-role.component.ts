import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators'
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { NotifyService } from 'app/core/notify.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { AppConfigService } from 'app/services/app-config.service';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RolesService } from 'app/services/roles.service';
import { TranslateService } from '@ngx-translate/core';
import { PERMISSIONS } from 'app/utils/permissions.constants';
import { RoleService } from 'app/services/role.service';



// export interface Task {
//   name: string;
//   completed: boolean;
//   color: ThemePalette;
//   subtasks?: Task[];
// }

// export interface Task {
//   name: string;
//   completed: boolean;
//   value: string;
//   subtasks?: Task[];
// }
interface PermissionSection {
  key: string;
  title: string;
  parentLabel: string;
  type: string;
  expanded: boolean,
  children: { key: string; label: string }[];
}

@Component({
  selector: 'appdashboard-users-new-role',
  templateUrl: './users-new-role.component.html',
  styleUrls: ['./users-new-role.component.scss']
})

export class UsersNewRoleComponent implements OnInit {
  private unsubscribe$: Subject<any> = new Subject<any>();
  IS_OPEN_SETTINGS_SIDEBAR: boolean
  isChromeVerGreaterThan100: boolean
  id_project: string;
  panelOpenState: boolean;
  newRoleName: string;

  // task: Task = {
  //   name: 'Indeterminate',
  //   completed: false,
  //   color: 'primary',
  //   subtasks: [
  //     { name: 'Primary', completed: false, color: 'primary' },
  //     { name: 'Accent', completed: false, color: 'accent' },
  //     { name: 'Warn', completed: false, color: 'warn' },
  //   ],
  // };

  // task: Task = {
  //   name: 'Indeterminate',
  //   completed: false,
  //   value: 'primary',
  //   subtasks: [
  //     { name: 'Primary', completed: false, value: 'primary' },
  //     { name: 'Accent', completed: false, value: 'accent' },
  //     { name: 'Warn', completed: false, value: 'warn' },
  //   ],
  // };

  // permissions: RolePermissions = {
  //   name: 'Permission 1',
  //   completed: false,
  //   permissions: [
  //     { name: 'Create lead', value: 'lead_create', completed: false },
  //     { name: 'Request read group', value: 'request_read_group', completed: false }
  //   ]
  // };
  // [{ "name":"role1", "permissions":["lead_create","request_read_group"]}, { "name":"role2", "permissions":["request_read_group"]}]


  CREATE_VIEW = false;
  EDIT_VIEW = false;

  isVisiblePay: boolean;
  public_Key: string;

  roleId: string;

  allComplete: boolean = false;

  form: FormGroup;

  

  sections: PermissionSection[] = [
    {
      key: 'conversationAccess',
      title: 'Conversations Access',
      parentLabel: 'Conversations Access Level',
      type: 'radio',
      expanded: false,
      children: [
        { key: PERMISSIONS.REQUEST_READ_ALL, label: 'All conversations' },
        { key: PERMISSIONS.REQUEST_READ_GROUP, label: 'Conversations assigned to their groups only' },
        { key: PERMISSIONS.REQUEST_READ_MY, label: 'Conversations assigned to them only' }
      ]
    },
    {
      key: 'conversationManagement',
      title: 'Conversations',
      parentLabel: 'Select all',
      type: 'checkbox',
      expanded: false,
      children: [
        { key: PERMISSIONS.INBOX_READ, label: 'Able to view real time and opened' },
        { key: PERMISSIONS.HISTORY_READ, label: 'Able to view History' },
        { key: PERMISSIONS.HISTORY_FILTER_BY_AGENT, label: 'Able to filter conversations by Agent in History' },
        // { key: PERMISSIONS.REQUEST_UPDATE, label: 'Able to update' },
        // { key: PERMISSIONS.REQUEST_CREATE_TICKET, label: 'Able to create a ticket'},
        { key: PERMISSIONS.REQUEST_SEND, label: 'Able to send message and upload file' },
        { key: PERMISSIONS.REQUEST_JOIN, label: 'Able to join to a conversation' },
        { key: PERMISSIONS.REQUEST_CLOSE, label: 'Able to resolve a conversation' },
        { key: PERMISSIONS.REQUEST_REOPEN, label: 'Able to reopen an archived conversation' },
        { key: PERMISSIONS.REQUEST_DELETE, label: 'Able to delete an archived conversation' },
        { key: PERMISSIONS.REQUEST_UPDATE_STATUS, label: 'Able to update the status of a conversation' },
        { key: PERMISSIONS.REQUEST_UPDATE_PRIORITY, label: 'Able to update the priority of a conversation' },
        { key: PERMISSIONS.REQUEST_UPDATE_FOLLOWERS, label: 'Able to add teammates as followers of a conversation' },
        { key: PERMISSIONS.REQUEST_UPDATE_SMART_ASSIGNMENT, label: 'Able to convert a conversation to offline / online' },
        { key: PERMISSIONS.REQUEST_UPDATE_TAGS, label: 'Able to add / remove conversation TAGS' },
        { key: PERMISSIONS.REQUEST_UPDATE_NOTES, label: 'Able to add / remove notes from a conversation' },
        { key: PERMISSIONS.REQUEST_REASSIGN, label: 'Able to reassign a conversation' },
        { key: PERMISSIONS.REQUEST_ADD, label: 'Able to add a teammate to a conversation' },
        { key: PERMISSIONS.REQUEST_LEFT, label: 'Able to leave a conversation to which is joined' },
        { key: PERMISSIONS.REQUEST_TRANSCRIPT_SEND, label: 'Able to send the chat transcript' },
        { key: PERMISSIONS.LEAD_BAN, label: 'Able to ban visitor' },
      ]
    },
    {
      key: 'conversationDetailSidebar',
      title: 'Conversation detail sidebar',
      parentLabel: 'Select all',
      type: 'checkbox',
      expanded: false,
      children: [
        { key: PERMISSIONS.CONVERSATION_DETAIL_READ, label: 'Able to view' },
        { key: PERMISSIONS.TICKET_ID_READ, label: 'Able to view ticked id' },
        { key: PERMISSIONS.RATING_READ, label: 'Able to view conversation rating' },
        { key: PERMISSIONS.TAGS_READ_ALL, label: 'Able to view all conversation tags' },
      ]
    },

    {
      key: 'navbar',
      title: 'Navbar',
      parentLabel: 'Select all',
      type: 'checkbox',
      expanded: false,
      children: [
        { key: PERMISSIONS.CHANGE_PROJECT, label: 'Able to change project' },
        { key: PERMISSIONS.SIMULATE_CONV, label: 'Able to simulate a conversation' },
        { key: PERMISSIONS.QUOTA_USAGE_READ, label: 'Able to view quota usage' },
      ]
    },

    // {
    //   key: 'sidebar',
    //   title: 'Sidebar',
    //   parentLabel: 'Select all',
    //   type: 'checkbox',
    //   expanded: false,
    //   children: [
    //     { key: PERMISSIONS.LOGOUT, label: 'Able to Log out' },
    //   ]
    // },

    {
      key: 'homePage',
      title: 'Home Page',
      parentLabel: 'Select all',
      type: 'checkbox',
      expanded: false,
      children: [
        { key: PERMISSIONS.HOME_READ, label: 'Able to view' },

      ]
    },



    {
      key: 'knowledgeBasesManagement',
      title: 'Knowledge bases',
      parentLabel: 'Select all',
      type: 'checkbox',
      expanded: false,
      children: [
        { key: PERMISSIONS.KB_READ, label: 'Able to view' },
        { key: PERMISSIONS.KB_CONTENTS_ADD, label: 'Able to add contents (by manual creation or via import)' },
        { key: PERMISSIONS.KB_CONTENTS_EXPORT, label: 'Able to export contents' },
        { key: PERMISSIONS.KB_CONTENT_UPDATE, label: 'Able to edit content' },
        { key: PERMISSIONS.KB_CONTENT_REINDEX, label: 'Able to reindex content' },
        { key: PERMISSIONS.KB_CONTENT_CHECK_STATUS, label: 'Able to check content status' },
        { key: PERMISSIONS.KB_NAMESPACE_ADD, label: 'Able to add a new Knowledge Base' },
        { key: PERMISSIONS.KB_SETTINGS_EDIT, label: 'Able to update and test AI settings' },
        { key: PERMISSIONS.KB_DELETE, label: 'Able to delete Knowledge Base and contents' },
        // { key: PERMISSIONS.KB_CONTENTS_DELETE, label: 'Able to delete only the contents of a Knowledge Base' },
        // { key: PERMISSIONS.KB_NAMESPACE_DELETE, label: 'Able to delete a Knowledge Base and its contents' },
        
      ]
    },
    {
      key: 'flowsManagement',
      title: 'Flows',
      parentLabel: 'Select all',
      type: 'checkbox',
      expanded: false,
      children: [
        { key: PERMISSIONS.FLOWS_READ, label: 'Able to view' },
        { key: PERMISSIONS.FLOW_ADD, label: 'Able to create a new Flow' },
        { key: PERMISSIONS.FLOW_EDIT, label: 'Able to edit a Flow' },
        { key: PERMISSIONS.FLOW_DELETE, label: 'Able to delete' },
        { key: PERMISSIONS.FLOW_TEST, label: 'Able to test' },
        { key: PERMISSIONS.FLOW_DUPLICATE, label: 'Able to duplicate' },
        { key: PERMISSIONS.FLOW_SHARE, label: 'Able to share via link' },
        { key: PERMISSIONS.FLOW_EXPORT, label: 'Able to export' },
        { key: PERMISSIONS.FLOW_WEBHOOK_COPY, label: 'Able to copy Webhooks URL' },
        { key: PERMISSIONS.FLOW_WEBHOOK_EDIT, label: 'Able to enable/disable Webhooks' },
        { key: PERMISSIONS.FLOW_WEBHOOK_DELETE, label: 'Able to delete Webhooks' },
        // { key: PERMISSIONS.FLOW_VIEW_MESSAGE_GRAPH, label: 'Able to view messages graph' },
      ]
    },

    {
      key: 'WhatsAppBroadcasts',
      title: 'WhatsApp Broadcasts',
      parentLabel: 'Select all',
      type: 'checkbox',
      expanded: false,
      children: [
        { key: PERMISSIONS.AUTOMATIONSLOG_READ, label: 'Able to view' },
        { key: PERMISSIONS.AUTOMATIONSLOG_CREATE, label: 'Able to create' }
      ]
    },
    {
      key: 'leads',
      title: 'Contacts',
      parentLabel: 'Select all',
      type: 'checkbox',
      expanded: false,
      children: [
       { key: PERMISSIONS.LEADS_READ, label: 'Able to view' },
       { key: PERMISSIONS.LEADS_EXPORT, label: 'Able to export' },
       { key: PERMISSIONS.LEAD_TRASH, label: 'Able to trash' },
       { key: PERMISSIONS.LEAD_RESTORE, label: 'Able to restore' },
       { key: PERMISSIONS.LEAD_DELETE, label: 'Able to permanently delete' },
       { key: PERMISSIONS.LEAD_UPDATE, label: 'Able to update' },
      ]
    },

    {
      key: 'SectionsAccess',
      title: 'Reports',
      parentLabel: 'Reports',
      type: 'checkbox',
      expanded: false,
      children: [
        { key: PERMISSIONS.ANALYTICS_READ, label: 'Able to view Analytics' },
        { key: PERMISSIONS.ACTIVITIES_READ, label: 'Able to view Activities' },
        // { key: PERMISSIONS.AUTOMATIONSLOG_READ, label: 'Able to view Automations Log' },
        

        // { key: 'profilePages', label: 'Can access lead and user profile pages' },
        // { key: 'leadData', label: 'Can export Lead, User, Company data' },
        // { key: 'importData', label: 'Can import contacts, companies and tickets' },
        // { key: 'manageTags', label: 'Can manage tags' },
      ]
    },
    // {
    //   key: 'inboxManagement',
    //   title: 'Monitor & Not real time conversations',
    //   parentLabel: 'Select all',
    //   type: 'checkbox',
    //   expanded: false,
    //   children: [
    //     { key: PERMISSIONS.INBOX_READ, label: 'Able to view' },
    //   ]
    // },
    {
      key: 'widgetSettings',
      title: 'Widget set up',
      parentLabel: 'Widget set up',
      type: 'checkbox',
      expanded: false,
      children: [
        { key: PERMISSIONS.WIDGETSETUP_READ, label: 'Able to view' },
        { key: PERMISSIONS.WIDGETSETUP_UPDATE, label: 'Able to update ' },
        // { key: PERMISSIONS.INSTALLATION_READ, label: 'Able to view Widget installations' },
        // { key: PERMISSIONS.TRANSLATIONS_READ, label: 'Able to view Widget translations' },
        // { key: 'profilePages', label: 'Can access lead and user profile pages' },
        // { key: 'leadData', label: 'Can export Lead, User, Company data' },
        // { key: 'importData', label: 'Can import contacts, companies and tickets' },
        // { key: 'manageTags', label: 'Can manage tags' },
      ]
    },
     {
      key: 'routingAndDepts',
      title: 'Routing & Departments',
      parentLabel: 'Select all',
      type: 'checkbox',
      expanded: false,
      children: [
        { key: PERMISSIONS.DEPARTMENTS_LIST_READ, label: 'Able to view' },
        { key: PERMISSIONS.DEPARTMENT_DETAIL_READ, label: 'Able to edit'},
        { key: PERMISSIONS.DEPARTMENT_CREATE_READ, label: 'Able to create'},
      ]
    },

     {
      key: 'teammatesRolesGroups ',
      title: 'Teammates & Groups',
      parentLabel: 'Select all',
      type: 'checkbox',
      expanded: false,
      children: [
        { key: PERMISSIONS.TEAMMATES_READ, label: 'Able to view Teammates' },
        { key: PERMISSIONS.TEAMMATE_UPDATE, label: 'Able to edit Teammates' },
        { key: PERMISSIONS.TEAMMATES_CREATE, label: 'Able to invite a new Teammate' },
        { key: PERMISSIONS.ROLES_READ, label: 'Able to view Roles'},
        { key: PERMISSIONS.ROLE_CREATE, label: 'Able to create Roles'},
        { key: PERMISSIONS.ROLE_UPDATE, label: 'Able to edit Roles'},
        { key: PERMISSIONS.ROLE_DELETE, label: 'Able to delete Roles'},
        { key: PERMISSIONS.GROUPS_READ, label: 'Able to view Groups'},
        { key: PERMISSIONS.GROUPS_CREATE, label: 'Able to create Groups'},
        { key: PERMISSIONS.GROUP_UPDATE, label: 'Able to edit Groups'},
        { key: PERMISSIONS.GROUP_DELETE, label: 'Able to delete Groups'}
      ]
    },
    {
      key: 'emailTicketing',
      title: 'Email ticketing',
      parentLabel: 'Select all',
      type: 'checkbox',
      expanded: false,
      children: [
        { key: PERMISSIONS.EMAIL_TICKETING_READ, label: 'Able to view' },
        { key: PERMISSIONS.EMAIL_TICKETING_UPDATE, label: 'Able to generate a department\'s email address' },
      ]
    },
     {
      key: 'cannedResponses',
      title: 'Canned Response',
      parentLabel: 'Select all',
      type: 'checkbox',
      expanded: false,
      children: [
        { key: PERMISSIONS.CANNED_RESPONSES_READ, label: 'Able to view' },
        { key: PERMISSIONS.CANNED_RESPONSES_UPDATE, label: 'Able to edit' },
        // { key: PERMISSIONS.CANNED_RESPONSES_SHARED_CREATE, label: 'Able to create project shared' }, 
        { key: PERMISSIONS.CANNED_RESPONSES_CREATE, label: 'Able to create' },
        { key: PERMISSIONS.CANNED_RESPONSES_DELETE, label: 'Able to delete' },
      ]
    },

    {
      key: 'tags',
      title: 'Tags',
      parentLabel: 'Select all',
      type: 'checkbox',
      expanded: false,
      children: [
        { key: PERMISSIONS.TAGS_READ, label: 'Able to view' },
        { key: PERMISSIONS.TAG_UPDATE, label: 'Able to edit' },
        { key: PERMISSIONS.TAG_CREATE, label: 'Able to create' },
        { key: PERMISSIONS.TAG_DELETE, label: 'Able to delete' },
        
      ]
    },

    {
      key: 'hours',
      title: 'Operating Hours',
      parentLabel: 'Select all',
      type: 'checkbox',
      expanded: false,
      children: [
        { key: PERMISSIONS.HOURS_READ, label: 'Able to view' },
        { key: PERMISSIONS.HOURS_UPDATE, label: 'Able to edit' },
        { key: PERMISSIONS.HOURS_CREATE, label: 'Able to create' },
        { key: PERMISSIONS.HOURS_DELETE, label: 'Able to delete' }
      ]
    },

    {
      key: 'integrations',
      title: 'Integrations',
      parentLabel: 'Select all',
      type: 'checkbox',
      expanded: false,
      children: [
        { key: PERMISSIONS.INTEGRATIONS_READ, label: 'Able to view' },
        { key: PERMISSIONS.INTEGRATIONS_UPDATE, label: 'Able to manage' }
      ]
    },
    {
      key: 'appStore',
      title: 'Apps',
      parentLabel: 'Select all',
      type: 'checkbox',
      expanded: false,
      children: [
        { key: PERMISSIONS.APPS_READ, label: 'Able to view' },
        { key: PERMISSIONS.APPS_UPDATE, label: 'Able to manage' },
        // { key: PERMISSIONS.HOURS_DELETE, label: 'Able to delete' },
        // { key: PERMISSIONS.HOURS_CREATE, label: 'Able to create' },
      ]
    },

    {
      key: 'projectSettings',
      title: 'Project settings ',
      parentLabel: 'Select all',
      type: 'checkbox',
      expanded: false,
      children: [
        { key: PERMISSIONS.PROJECTSETTINGS_GENERAL_READ, label: 'Able to view General' },
        { key: PERMISSIONS.PROJECTSETTINGS_GENERAL_UPDATE, label: 'Able to edit project name (in General)' },
        // { key: PERMISSIONS.PROJECTSETTINGS_SUBSCRIPTION_READ, label: 'Able to view Subscription' },
        { key: PERMISSIONS.PROJECTSETTINGS_DEVELOPER_READ, label: 'Able to view Developer' },
        { key: PERMISSIONS.PROJECTSETTINGS_DEVELOPER_UPDATE, label: 'Able to manage features available in Developer' },
        { key: PERMISSIONS.PROJECTSETTINGS_SMARTASSIGNMENT_READ, label: 'Able to view Smart Assignment' },
        { key: PERMISSIONS.PROJECTSETTINGS_SMARTASSIGNMENT_UPDATE, label: 'Able to manage Smart Assignment' },
        { key: PERMISSIONS.PROJECTSETTINGS_NOTIFICATION_READ, label: 'Able to view Notifications' },
        { key: PERMISSIONS.PROJECTSETTINGS_SECURITY_READ, label: 'Able to view Security' },
        { key: PERMISSIONS.PROJECTSETTINGS_BANNED_READ, label: 'Able to view Banned visitors' },
        { key: PERMISSIONS.LEAD_UNBAN, label: 'Able to unban visitor' },
        { key: PERMISSIONS.PROJECTSETTINGS_ADVANCED_READ, label: 'Able to view Advanced' },
      ]
    },

    //  {
    //   key: 'projectSettings',
    //   title: 'Project settings',
    //   parentLabel: 'Select all',
    //   type: 'checkbox',
    //   expanded: false,
    //   children: [
    //     { key: PERMISSIONS.PROJECTSETTINGS_GENERAL_READ, label: 'Able to view' },
    //     { key: PERMISSIONS.PROJECTSETTINGS_GENERAL_UPDATE, label: 'Able to edit project name' },

    //   ]
    // },


  


    // {
    //   key: 'dataSecurity',
    //   title: 'Data and security',
    //   parentLabel: 'Data and security Access',
    //   type: 'checkbox',
    //   expanded: false,
    //   children: [
    //     { key: 'manageWorkspace', label: 'Can manage workspace data' },
    //     { key: 'accessLists', label: 'Can access people, companies, and account lists' },
    //     { key: 'profilePages', label: 'Can access lead and user profile pages' },
    //     { key: 'leadData', label: 'Can export Lead, User, Company data' },
    //     { key: 'importData', label: 'Can import contacts, companies and tickets' },
    //     { key: 'manageTags', label: 'Can manage tags' },
    //   ]
    // },
    // {
    //   key: 'appsIntegration',
    //   title: 'Apps and Integrations',
    //   parentLabel: 'Apps and Integrations Access',
    //   type: 'checkbox',
    //   expanded: false,
    //   children: [
    //     { key: 'developerHub', label: 'Can access Developer Hub' },
    //     { key: 'manageApps', label: 'Can install, configure and delete apps' }
    //   ]
    // }
  ];
  reservedRoleNames = ['owner', 'admin', 'agent', 'user', 'guest', 'supervisor', 'teammate'];
  roles: any[] = [];
  reservedName: boolean = false;
  nameExists: boolean = false;
  isAuthorized = false;
  permissionChecked = false;

  constructor(
    private router: Router,
    private auth: AuthService,
    public notify: NotifyService,
    private logger: LoggerService,
    public appConfigService: AppConfigService,
    public location: Location,
    private fb: FormBuilder,
    private rolesService: RolesService,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private roleService: RoleService,
  ) {

  }

  ngOnInit(): void {
    this.listenSidebarIsOpened();
    this.getBrowserVersion();
    this.getCurrentProject()
    this.buildForm()
    this.detectsCreateEditInTheUrl()
    this.getRoles()
    this.getOSCODE()
    // this.checkPermissions();
  }

  async checkEditPermissions() {
    const result = await this.roleService.checkRoleForCurrentProject('edit-roles')
    console.log('[CREATE-NEW-ROLE] edit-roles result ', result)
    this.isAuthorized = result === true;
    this.permissionChecked = true;
    console.log('[CREATE-NEW-ROLE] isAuthorized to EDIT ', this.isAuthorized)
    console.log('[CREATE-NEW-ROLE] permissionChecked ', this.permissionChecked)
  }

  async checkCreatePermissions() {
    const result = await this.roleService.checkRoleForCurrentProject('create-roles')
    console.log('[CREATE-NEW-ROLE] result ', result)
    this.isAuthorized = result === true;
    this.permissionChecked = true;
    console.log('[CREATE-NEW-ROLE] isAuthorized to CREATE', this.isAuthorized)
    console.log('[CREATE-NEW-ROLE] permissionChecked ', this.permissionChecked)
  }


  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[CREATE-NEW-ROLE] getAppConfig public_Key', this.public_Key);
    let keys = this.public_Key.split("-");
    this.logger.log('[CREATE-NEW-ROLE] keys', keys)
    keys.forEach(key => {
      // this.logger.log('NavbarComponent public_Key key', key)
      if (key.includes("PAY")) {
        // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - key', key);
        let pay = key.split(":");
        // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - pay key&value', pay);
        if (pay[1] === "F") {
          this.isVisiblePay = false;
          
        } else {
          this.isVisiblePay = true;
        }
      }
    })
  }

  getRoles() {
    this.rolesService.getAllRoles()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((roles: any) => {
        console.log('[CREATE-NEW-ROLE] - GET ROLES - roles ', roles);
        this.roles = roles || [];

      }, error => {


        console.error('[CREATE-NEW-ROLE] - GET ROLES - ERROR: ', error);
      }, () => {

        console.log('[CREATE-NEW-ROLE] - GET ROLES * COMPLETE *')
      });
  }
  detectsCreateEditInTheUrl() {
    if (this.router.url.indexOf('/create-new-role') !== -1) {
    this.checkCreatePermissions();

      this.CREATE_VIEW = true;
      console.log('[CREATE-NEW-ROLE] - CREATE_VIEW ', this.CREATE_VIEW)
      // this.showSpinner = false;

    } else {
      this.checkEditPermissions();
      this.EDIT_VIEW = true;
      this.form.get('roleName')?.disable();
      this.sections.forEach(section => section.expanded = true);
      console.log('[CREATE-NEW-ROLE] - CREATE_VIEW ', this.CREATE_VIEW)
      console.log('[CREATE-NEW-ROLE] - EDIT_VIEW ', this.EDIT_VIEW)
      console.log('[CREATE-NEW-ROLE] - EDIT_VIEW this.route', this.route)
      this.roleId = this.route.snapshot.params['roleid'];
      console.log('[CREATE-NEW-ROLE] - CREATE_VIEW  roleId', this.roleId)
      this.getRoleById(this.roleId)
      // this.showSpinner = false;
    }
  }

  getRoleById(roleId) {
    this.rolesService.getRoleById(roleId)
      .subscribe((res: any) => {
        console.log('[USERS-ROLES] - GET ROLE BY ID - RES ', res);
        // Set role name
        this.form.patchValue({
          roleName: res.name
        });

        // Process permissions
        res.permissions.forEach(permission => {
          for (const section of this.sections) {
            if (section.type === 'radio') {
              // If the permission is one of the radio options, set the section key
              const match = section.children.find(child => child.key === permission);
              if (match) {
                this.form.patchValue({
                  [section.key]: permission
                });
              }
            } else {
              // Checkbox: set the child key directly to true
              if (section.children.some(child => child.key === permission)) {
                this.form.patchValue({
                  [permission]: true
                });
              }
            }
          }
        });
      },
        error => {
          console.error('[USERS-ROLES] - GET ROLE BY ID - ERROR: ', error);
        },
        () => {
          console.log('[USERS-ROLES] - GET ROLE BY ID * COMPLETE *')
          this.syncAfterPatch()
        });
  }

  syncAfterPatch() {
    // Manually trigger syncing after patch
    this.sections.forEach(section => {
      if (section.type !== 'radio') {
        const allChecked = section.children.every(c => this.form.get(c.key)?.value);
        const noneChecked = section.children.every(c => !this.form.get(c.key)?.value);

        if (allChecked) {
          this.form.get(section.key)?.setValue(true, { emitEvent: false });
        } else if (noneChecked) {
          this.form.get(section.key)?.setValue(false, { emitEvent: false });
        } else {
          this.form.get(section.key)?.setValue(true, { emitEvent: false }); // indeterminate
        }
      }
    });

  }


  buildForm() {
    const group: any = {};
    group['roleName'] = [''];
    // group['roleName'] = [{ value: '', disabled: this.EDIT_VIEW }];
    // for (const section of this.sections) {
    //   group[section.key] = false;
    //   for (const child of section.children) {
    //     group[child.key] = false;
    //   }
    // }

    for (const section of this.sections) {
      if (section.type === 'radio') {
        group[section.key] = ['']; // single control for radio
      } else {
        group[section.key] = false;
        for (const child of section.children) {
          group[child.key] = false;
        }
      }
    }
    this.form = this.fb.group(group);

    // Parent-child control syncing

    this.sections.forEach(section => {
      section.children.forEach(child => {
        this.form.get(child.key)?.valueChanges.subscribe(() => {
          const allChecked = section.children.every(c => this.form.get(c.key)?.value);
          const noneChecked = section.children.every(c => !this.form.get(c.key)?.value);

          if (allChecked) {
            this.form.get(section.key)?.setValue(true, { emitEvent: false });
          } else if (noneChecked) {
            this.form.get(section.key)?.setValue(false, { emitEvent: false });
          } else {
            this.form.get(section.key)?.setValue(true, { emitEvent: false }); // value true but indeterminate
          }
        });
      });
    });
    this.onValuesChanges()
  }



  onValuesChanges() {
    this.form.valueChanges.subscribe(() => {
      this.sections.forEach(section => {
        const parent = section.key;
        const parentValue = this.form.get(parent)?.value;

        const children = section.children.map(child => ({
          key: child.key,
          value: this.form.get(child.key)?.value
        }));

        console.log(`[USERS-ROLES] - Parent [${parent}]:`, parentValue);
        console.log(`[USERS-ROLES] - Children:`, children);
      });
      const payload = {
        name: this.form.value.roleName,

        permissions: this.getSelectedPermissions()
      };

      console.log('[USERS-ROLES] - payload ', payload)
      this.validateRoleName(payload.name)
    });

  }

  validateRoleName(rolename) {
    const name = rolename?.toLowerCase()?.trim();

    if (!name) return null;

    // Check against reserved names
    if (this.reservedRoleNames.includes(name)) {
      console.log('[USERS-ROLES] - reservedName ', this.reservedRoleNames.includes(name))
      this.reservedName = true
      console.log('[USERS-ROLES] - reservedName ', this.reservedName)
      // return { reservedName: true };
    } else {
      this.reservedName = false
    }

    // Check if name already exists in roles
    const nameExists = this.roles.some(role => role.name?.toLowerCase()?.trim() === name);
    if (nameExists) {
      this.nameExists = true
      console.log('[USERS-ROLES] - nameExists ', this.nameExists)
      // return { nameExists: true };
    } else {
      this.nameExists = false
      console.log('[USERS-ROLES] - nameExists ', this.nameExists)
    }
  }



  getSelectedPermissions(): string[] {
    const selected: string[] = [];

    this.sections.forEach(section => {
      if (section.type === 'radio') {
        const value = this.form.get(section.key)?.value;
        if (value) selected.push(value);
      } else {
        section.children.forEach(child => {
          if (this.form.get(child.key)?.value) {
            selected.push(child.key);
          }
        });
      }
    });

    return selected;
  }


  // getAccessLabel(section: PermissionSection): string {
  //   const allUnchecked = section.children.every(child => !this.form.get(child.key)?.value);
  //   const allChecked = section.children.every(child => this.form.get(child.key)?.value);
  //   return allChecked ? 'Full access' : allUnchecked ? 'No access' : 'Custom';
  // }

  getAccessLabel(section: PermissionSection): string {
    if (section.type === 'radio') {
      const selectedValue = this.form.get(section.key)?.value;
      if (!selectedValue) {
        return 'No access';
      }
      const selectedLabel = section.children.find(child => child.key === selectedValue)?.label;
      return selectedLabel || 'Custom';
    }

    // Default behavior for checkbox-type sections
    const allUnchecked = section.children.every(child => !this.form.get(child.key)?.value);
    const allChecked = section.children.every(child => this.form.get(child.key)?.value);
    return allChecked ? 'Full permissions' : allUnchecked ? 'No permissions' : 'Custom';
  }

  getLabelClass(label: string): string {
  const labelLower = label.toLowerCase();

  if (labelLower === 'no access' || labelLower === 'no permissions') {
    return 'label-gray';
  }

  if (labelLower === 'full access' || labelLower === 'full permissions' ||  labelLower === 'all conversations') {
    return 'label-green';
  }

  if (labelLower === 'custom') {
    return 'label-blue';
  }

  if (
    labelLower === 'conversations assigned to their groups only' ||
    labelLower === 'conversations assigned to them only'
  ) {
    return 'label-orange';
  }

  return 'label-default'; // fallback
}

  isIndeterminate(sectionKey: string): boolean {
    const section = this.sections.find(s => s.key === sectionKey);
    if (!section) return false;

    const selectedCount = section.children.filter(child => this.form.get(child.key)?.value).length;
    return selectedCount > 0 && selectedCount < section.children.length;
  }

  onParentToggle(section: PermissionSection) {
    const parentControl = this.form.get(section.key);
    const isChecked = parentControl?.value;

    section.children.forEach(child => {
      this.form.get(child.key)?.setValue(isChecked);
    });
  }

  get isSubmitDisabled(): boolean {
    const roleName = this.form.get('roleName')?.value?.trim();
    const hasName = !!roleName;

    const hasPermission = this.sections.some(section =>
      this.form.get(section.key)?.value ||
      section.children.some(child => this.form.get(child.key)?.value)
    );

    return !(hasName && hasPermission);
  }

  submit() {
    const name = this.form.get('roleName')!.value;
    const permissions = this.getSelectedPermissions();  // your helper to pull all `true` keys
    const payload = { name, permissions };
    console.log(payload);
    if (this.CREATE_VIEW) {
      this.saveRole(payload)
    } else {
      this.editRole(payload)
    }
  }

  saveRole(payload) {
    this.rolesService.createNewRole(payload)

      .subscribe((res: any) => {
        console.log('[CREATE-NEW-ROLE] - SAVE ROLE - RES ', res);


      }, error => {
        console.error('[CREATE-NEW-ROLE] - SAVE ROLE - ERROR: ', error);
        this.notify.showWidgetStyleUpdateNotification(this.translate.instant("AnErrorOccurredWhileCreatingTheNewRole"), 4, 'report_problem');
      }, () => {
        console.log('[CREATE-NEW-ROLE] - SAVE ROLE * COMPLETE *')
        this.notify.showWidgetStyleUpdateNotification(this.translate.instant("TheNewRoleHasBeenSuccessfullyCreated"), 2, 'done');
      });
  }

  editRole(payload,) {
    this.rolesService.updateRole(payload, this.roleId)

      .subscribe((res: any) => {
        console.log('[CREATE-NEW-ROLE] - EDIT ROLE - RES ', res);


      }, error => {
        console.error('[CREATE-NEW-ROLE] - EDIT ROLE - ERROR: ', error);
        this.notify.showWidgetStyleUpdateNotification(this.translate.instant("AnErrorOccurredWhileUpdatingTheRole"), 4, 'report_problem');
      }, () => {
        console.log('[CREATE-NEW-ROLE] - EDIT ROLE * COMPLETE *')
        this.notify.showWidgetStyleUpdateNotification(this.translate.instant("RoleSuccessfullyUpdated"), 2, 'done');
      });
  }


  getCurrentProject() {
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {
        if (project) {

          this.id_project = project._id;
          this.logger.log('[CREATE-NEW-ROLE] - GET CURRENT PROJECT -> project ID', this.id_project)
        }
      })
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  this.logger.log("[CREATE-NEW-ROLE] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }

  listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
      this.logger.log('[CREATE-NEW-ROLE] SETTINGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    })
  }

  goBack() {
    this.location.back();
  }


  _getSelectedPermissions(): string[] {
    return Object.keys(this.form.value)
      .filter(key => key !== 'roleName' && this.form.value[key] === true);
  }
  __getSelectedPermissions(): string[] {
    const parentKeys = this.sections.map(section => section.key);
    return Object.keys(this.form.value)
      .filter(key => key !== 'roleName' && !parentKeys.includes(key) && this.form.value[key] === true);
  }

  // updateAllComplete() {
  //   this.allComplete = this.task.subtasks != null && this.task.subtasks.every(t => t.completed);
  // }

  // someComplete(): boolean {
  //   if (this.task.subtasks == null) {
  //     return false;
  //   }
  //   return this.task.subtasks.filter(t => t.completed).length > 0 && !this.allComplete;
  // }

  // setAll(completed: boolean) {
  //   this.allComplete = completed;
  //   if (this.task.subtasks == null) {
  //     return;
  //   }
  //   this.task.subtasks.forEach(t => (t.completed = completed));
  // }

}
