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
  roleId: string;

  allComplete: boolean = false;

  form: FormGroup;
  sections: PermissionSection[] = [
    {
      key: 'conversationAccess',
      title: 'Conversation Access',
      parentLabel: 'Conversation Access Level',
      type: 'radio',
      expanded: false,
      children: [
        { key: 'allConversations', label: 'All conversations' },
        { key: 'assignedToUser', label: 'Conversations assigned to them only' },
        { key: 'assignedToTeams', label: 'Conversations assigned to their teams only' }
      ]
    },
    {
      key: 'dataSecurity',
      title: 'Data and security',
      parentLabel: 'Data and security Access',
      type: 'checkbox',
      expanded: false,
      children: [
        { key: 'manageWorkspace', label: 'Can manage workspace data' },
        { key: 'accessLists', label: 'Can access people, companies, and account lists' },
        { key: 'profilePages', label: 'Can access lead and user profile pages' },
        { key: 'leadData', label: 'Can export Lead, User, Company data' },
        { key: 'importData', label: 'Can import contacts, companies and tickets' },
        { key: 'manageTags', label: 'Can manage tags' },
      ]
    },
    {
      key: 'appsIntegration',
      title: 'Apps and Integrations',
      parentLabel: 'Apps and Integrations Access',
      type: 'checkbox',
      expanded: false,
      children: [
        { key: 'developerHub', label: 'Can access Developer Hub' },
        { key: 'manageApps', label: 'Can install, configure and delete apps' }
      ]
    }
  ];

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
    private translate: TranslateService
  ) {

  }

  ngOnInit(): void {
    this.listenSidebarIsOpened();
    this.getBrowserVersion();
    this.getCurrentProject()
    this.buildForm()
    this.detectsCreateEditInTheUrl()
    //  this.getOSCODE()
  }
  detectsCreateEditInTheUrl() {
    if (this.router.url.indexOf('/create-new-role') !== -1) {
      

      this.CREATE_VIEW = true;
      console.log('[CREATE-NEW-ROLE] - CREATE_VIEW ', this.CREATE_VIEW)
      // this.showSpinner = false;

    } else {

      this.EDIT_VIEW = true;
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
          console.log('[USERS-ROLESN] - GET ROLE BY ID * COMPLETE *')
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
    this.setupValueChangeLogging()
  }



  setupValueChangeLogging() {
    this.form.valueChanges.subscribe(() => {
      this.sections.forEach(section => {
        const parent = section.key;
        const parentValue = this.form.get(parent)?.value;

        const children = section.children.map(child => ({
          key: child.key,
          value: this.form.get(child.key)?.value
        }));

        console.log(`Parent [${parent}]:`, parentValue);
        console.log(`Children:`, children);
      });
      const payload = {
        name: this.form.value.roleName,
        permissions: this.getSelectedPermissions()
      };
      console.log('payload ', payload)

    });

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


  getAccessLabel(section: PermissionSection): string {
    const allUnchecked = section.children.every(child => !this.form.get(child.key)?.value);
    const allChecked = section.children.every(child => this.form.get(child.key)?.value);
    return allChecked ? 'Full access' : allUnchecked ? 'No access' : 'Custom';
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
         this.notify.showWidgetStyleUpdateNotification(this.translate.instant("TheNewRoleHasBeenSuccessfullyCreated"),  2, 'done');
      });
  }

   editRole(payload, ) {
    this.rolesService.updateRole(payload, this.roleId)

      .subscribe((res: any) => {
        console.log('[CREATE-NEW-ROLE] - EDIT ROLE - RES ', res);
       

      }, error => {
        console.error('[CREATE-NEW-ROLE] - EDIT ROLE - ERROR: ', error);
         this.notify.showWidgetStyleUpdateNotification(this.translate.instant("AnErrorOccurredWhileUpdatingTheRole"),  4, 'report_problem');
      }, () => {
        console.log('[CREATE-NEW-ROLE] - EDIT ROLE * COMPLETE *')
         this.notify.showWidgetStyleUpdateNotification(this.translate.instant("RoleSuccessfullyUpdated"),  2, 'done');
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
