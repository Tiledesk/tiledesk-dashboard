import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { GroupService } from '../services/group.service';
import { Group } from '../models/group-model';
import { Router } from '@angular/router';
import { NotifyService } from '../core/notify.service';
import { LoggerService } from '../services/logger/logger.service';
import { avatarPlaceholder, getColorBck, URL_creating_groups } from '../utils/util';
import { AppConfigService } from 'app/services/app-config.service';
import { BrandService } from 'app/services/brand.service';
import { DepartmentService } from 'app/services/department.service';
import { TranslateService } from '@ngx-translate/core';
import { RoleService } from 'app/services/role.service';
const swal = require('sweetalert');
const Swal = require('sweetalert2')

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {

  showSpinner = true;
  showSpinnerInModal: boolean;

  groupsList: Group[];
  project_id: string;
  display_users_list_modal = 'none';
  group_name: string;
  id_group: string;
  group_members: any;

  projectUsersList: any;

  users_selected = [];

  add_btn_disabled: boolean;

  displayDeleteModal = 'none';
  displayDisableModal = 'none';
  displayRestoreModal = 'none';
  id_group_to_delete: string;
  name_group_to_delete: string;
  id_group_to_disable: string;
  name_group_to_disable: string;
  id_group_to_restore: string;
  name_group_to_restore: string;
  IS_OPEN_SETTINGS_SIDEBAR: boolean;
  public_Key: any;
  isVisibleGRO: any
  isChromeVerGreaterThan100: boolean;

  disassociateTheGroup: string;
  disassociateTheGroupBeforeToDisableIt: string;

  warning: string;

  public hideHelpLink: boolean;

  isAuthorized = false;
  permissionChecked = false;

  percentage: number;
  totalPercentage = 0;
  overflowGroupId: string | null = null;

  constructor(
    private auth: AuthService,
    private groupsService: GroupService,
    private router: Router,
    private notify: NotifyService,
    private logger: LoggerService,
    public appConfigService: AppConfigService,
    public brandService: BrandService,
    public departmentService: DepartmentService,
    private translate: TranslateService,
    private roleService: RoleService,
  ) {
    const brand = brandService.getBrand();
    this.hideHelpLink = brand['DOCS'];
  }

  ngOnInit() {
    // this.auth.checkRoleForCurrentProject();
    // this.roleService.checkRoleForCurrentProject('groups')
    this.getCurrentProject();
    this.getOSCODE();
    this.getGroupsByProjectId();
    this.listenSidebarIsOpened();
    this.getOSCODE();
    this.getBrowserVersion()
    this.getTranslations();
    this.checkPermissions();
  }


  async checkPermissions() {
    const result = await this.roleService.checkRoleForCurrentProject('groups')
    console.log('[GROUPS] result ', result)
    this.isAuthorized = result === true;
    this.permissionChecked = true;
    console.log('[GROUPS] isAuthorized ', this.isAuthorized)
    console.log('[GROUPS] permissionChecked ', this.permissionChecked)
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  this.logger.log("[WS-REQUESTS-LIST] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[GROUPS] AppConfigService getAppConfig public_Key', this.public_Key);

    let keys = this.public_Key.split("-");
    this.logger.log('[GROUPS] PUBLIC-KEY - public_Key keys', keys)

    keys.forEach(key => {
      if (key.includes("GRO")) {
        let gro = key.split(":");
        if (gro[1] === "F") {
          this.isVisibleGRO = false;
          this.router.navigate([`project/${this.project_id}/unauthorized`])
        } else {
          this.isVisibleGRO = true;
        }
      }
    });

    if (!this.public_Key.includes("GRO")) {
      this.isVisibleGRO = false;
    }
  }

  listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
      this.logger.log('[GROUPS] SETTINGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    });
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        this.project_id = project._id;
        this.logger.log('[GROUPS] project ID from AUTH service subscription ', this.project_id);
      }
    });
  }

  /**
   * GETS ALL GROUPS WITH THE CURRENT PROJECT-ID   */
  getGroupsByProjectId() {
    this.groupsService.getGroupsByProjectId().subscribe((groups: any) => {
      console.log('[GROUPS] - GET GROUPS BY PROJECT ID ', groups);



      if (groups) {
        this.groupsList = groups;

        // this.groupsList = groups.map(group => ({
        //   ...group,
        //   percentage: 0
        // }));

        console.log('[GROUPS] - GET GROUPS BY PROJECT this.groupsList ', this.groupsList);
        this.createGroupAvatar(this.groupsList)
      }
      // this.faqkbList = faqKb;

    }, (error) => {
      this.logger.error('[GROUPS] GET GROUPS - ERROR ', error);
      this.showSpinner = false;
    }, () => {
      this.showSpinner = false;
      this.logger.log('[GROUPS] GET GROUPS * COMPLETE');
    });

  }

  // onPercentageChange(changedGroup: Group): void {
  //   this.totalPercentage = this.groupsList.reduce(
  //     (sum, group) => sum + (group.percentage || 0),
  //     0
  //   );

  //   // If overflow, mark the last changed group
  //   this.overflowGroupId = this.totalPercentage > 100 ? changedGroup._id : null;
  // }

  // get totalPercentage(): number {
  //   return this.groupsList.reduce((sum, group) => sum + (group.percentage || 0), 0);
  // }

  // isTotalOverLimit(): boolean {
  //   return this.totalPercentage > 100;
  // }

  createGroupAvatar(groupsList) {
    groupsList.forEach(group => {
      group['groupName_initial'] = avatarPlaceholder(group.name)
      group['fillColour'] = getColorBck(group.name)
    });
  }

  goToEditAddPage_create() {
    this.router.navigate(['project/' + this.project_id + '/group/create']);
  }

  goToUsers() {
    this.router.navigate(['project/' + this.project_id + '/users']);
  }

  goToUsersRoles() {
    this.router.navigate(['project/' + this.project_id + '/roles']);
  }

  goToEditAddPage_edit(id_group: string) {
    this.router.navigate(['project/' + this.project_id + '/group/edit/' + id_group]);
  }

  goToGroupsDoc() {
    const url = URL_creating_groups;
    window.open(url, '_blank');
  }

  openDeleteModal(id_group: string, group_name: string) {
    this.id_group_to_delete = id_group;
    this.name_group_to_delete = group_name;
    this.logger.log('[GROUPS] OPEN DELETE MODAL - ID OF THE GROUP OF DELETE ', this.id_group_to_delete)
    this.getDepartments(this.id_group_to_delete, 'delete')
  }

  opendisableModal(id_group: string, group_name: string) {
    this.id_group_to_disable = id_group;
    this.name_group_to_disable = group_name;
    this.logger.log('[GROUPS] OPEN DISABLE MODAL - ID OF THE GROUP OF DISABLE ', this.id_group_to_disable)
    this.getDepartments(this.id_group_to_disable, 'disable')
  }

  openRestoreModal(id_group: string, group_name: string) {
    this.displayRestoreModal = 'block';
    this.id_group_to_restore = id_group;
    this.name_group_to_restore = group_name;
    this.logger.log('[GROUPS] OPEN DISABLE MODAL - ID OF THE GROUP OF DISABLE ', this.id_group_to_disable)
  }

  getDepartments(selectedGrouId?: string, reason?: string) {
    console.log('[GROUPS] getDepartmentsL - DELETE / DISABLE reason ', reason)
    this.logger.log('[GROUPS] getDepartmentsL - ID OF THE GROUP OF DELETE / DISABLE ', selectedGrouId)
    this.departmentService.getDeptsByProjectId().subscribe((_departments: any) => {
      this.logger.log('[GROUPS] ON MODAL DELETE OPEN - GET DEPTS RES', _departments);

      const deptsArrayWithAssociatedGroup = _departments.filter((obj: any) => {
        return obj.id_group === selectedGrouId;
      });

      if (deptsArrayWithAssociatedGroup.length === 0) {
        this.logger.log('[GROUPS] ON MODAL DELETE OPEN - GROUP NOT ASSOCIATED');
        if (reason === 'delete') {
          this.displayDeleteModal = 'block'; 
        } else {
          this.displayDisableModal = 'block'; 
        }
      } else {
        this.logger.log('[GROUPS] ON MODAL DELETE OPEN - GROUP !!! ASSOCIATED');
        this.logger.log('[GROUPS] ON MODAL DELETE OPEN - deptsArrayWithAssociatedGroup', deptsArrayWithAssociatedGroup);

        const deptsNameAssociatedToGroup = []

        deptsArrayWithAssociatedGroup.forEach(dept => {
          deptsNameAssociatedToGroup.push(dept.name)
        });

        console.log('[GROUPS] ON MODAL DELETE OPEN - deptsNameAssociatedToGroup ', deptsNameAssociatedToGroup);

        const isPlural = deptsNameAssociatedToGroup.length > 1;
        const translationKey = isPlural
          ? 'GroupsPage.TheGroupIsAssociatedWithDepartments'
          : 'GroupsPage.TheGroupIsAssociatedWithTheDepartment';

        const actionMessage = reason === 'delete'
          ? this.disassociateTheGroup
          : this.disassociateTheGroupBeforeToDisableIt;

        // const translatedMessage = this.translate.instant(translationKey, { 
        //   depts_name: deptsNameAssociatedToGroup.join(', ') 
        // });

        this.showWarningAlert(
          this.warning,
          `${this.translate.instant(translationKey, { depts_name: deptsNameAssociatedToGroup.join(', ') })}. ${actionMessage}`
        );

        // Swal.fire({
        //   title: this.warning,
        //   text: `${translatedMessage}. ${this.disassociateTheGroup}`,
        //   icon: "warning",
        //   showCloseButton: true,
        //   showCancelButton: false,
        //   // confirmButtonColor: "var(--blue-light)",
        //   focusConfirm: false
        // })

        // if (deptsArrayWithAssociatedGroup.length > 1) {
        //   Swal.fire({
        //     title: this.warning,
        //     text: this.translate.instant('GroupsPage.TheGroupIsAssociatedWithDepartments', { depts_name: deptsNameAssociatedToGroup.join(', ') }) +'. ' + this.disassociateTheGroup,
        //     icon: "warning",
        //     showCloseButton: true,
        //     showCancelButton: false,
        //     // confirmButtonColor: "var(--blue-light)",
        //     focusConfirm: false,
        //   })
        // }
      }
    })
  }

  private showWarningAlert(title: string, text: string): void {
    Swal.fire({
      title,
      text,
      icon: 'warning',
      showCloseButton: true,
      showCancelButton: false,
      focusConfirm: false,
      // confirmButtonColor: 'var(--blue-light)'
    });
  }

  onCloseDeleteModal() {
    this.displayDeleteModal = 'none';
  }
  onCloseDidableModal () {
    this.displayDisableModal = 'none';
  }
  onCloseRestoreModal() {
    this.displayRestoreModal = 'none';
  }


  deleteGroup() {
    this.displayDeleteModal = 'none';
    this.groupsService.setTrashedToTheGroup(this.id_group_to_delete).subscribe((group) => {

      

      this.logger.log('[GROUPS] - UPDATED GROUP WITH TRASHED = TRUE ', group);
    }, (error) => {
      this.logger.error('[GROUPS] - UPDATED GROUP WITH TRASHED = TRUE - ERROR ', error);
      // =========== NOTIFY ERROR ===========
      this.notify.showWidgetStyleUpdateNotification(this.translate.instant('GroupsPage.AnErrorOccurredWhileDeletingTheGroup'), 4, 'report_problem');
    }, () => {
      this.logger.log('[GROUPS] - UPDATED GROUP WITH TRASHED = TRUE * COMPLETE *');

      // =========== NOTIFY SUCCESS===========
      this.notify.showWidgetStyleUpdateNotification(this.translate.instant('GroupsPage.TheGroupHasBeenSuccessfullyDeleted'), 2, 'done');
      // UPDATE THE GROUP LIST
      //this.ngOnInit()

      for (var i = 0; i < this.groupsList.length; i++) {
        if (this.groupsList[i]._id === this.id_group_to_delete) {
          this.groupsList.splice(i, 1);
          i--;
        }
      }

    });
  }




  disableGroup(group_id: string) {
    this.displayDisableModal = 'none';
    console.log("[GROUPS] disableGroup group_id: ", group_id);
    this.groupsService.disableGroup(group_id).subscribe((group) => {
      console.log("[GROUPS] disableGroup response: ", group);
    }, (error) => {
      console.error("[GROUPS] error disabling group: ", error);
      if (error.status === 403) {
        // this.notify.showWidgetStyleUpdateNotification('Hey' + error.error.error, 4, 'report_problem')
        // this.getDepartments(group_id, 'disable') 
      } else {
        this.notify.showWidgetStyleUpdateNotification(this.translate.instant("GroupsPage.AnErrorOccurredWhileDisablingTheGroup"), 4, 'report_problem')
      }
    }, () => {
      this.logger.log("[GROUPS] group disabled");
      this.notify.showWidgetStyleUpdateNotification(this.translate.instant("GroupsPage.TheGroupHasBeenSuccessfullyDisabled"), 2, 'done')
      const groupToDisable = this.groupsList.find(g => g._id === group_id);
      if (groupToDisable) {
        groupToDisable.enabled = false;
      }
    })
  }


  restoreGroup(group_id) {
    this.displayRestoreModal = 'none';
    this.groupsService.restoreGroup(group_id).subscribe((group) => {
      this.logger.log("[GROUPS] restoreGroup response: ", group);
    }, (error) => {
      this.logger.error("[GROUPS] error restoring group: ", error);
      this.notify.showWidgetStyleUpdateNotification(this.translate.instant("GroupsPage.AnErrorOccurredWhileRestoringTheGroup"), 4, 'report_problem')
      // if (error.status === 403) {
      //   this.notify.showWidgetStyleUpdateNotification(error.error.error, 4, 'report_problem')
      // } else {
      //   this.notify.showWidgetStyleUpdateNotification("An error occurred enabling group", 4, 'report_problem')
      // }
    }, () => {
      this.logger.log("[GROUPS] group restored");
      this.notify.showWidgetStyleUpdateNotification(this.translate.instant("GroupsPage.TheGroupHasBeenSuccessfullyRestored"), 2, 'done')
      const groupToRestore = this.groupsList.find(g => g._id === group_id);
      if (groupToRestore) {
        groupToRestore.enabled = true;
      }
    })
  }


  getTranslations() {
    this.translate.get('GroupsPage')
      .subscribe((text: string) => {
        // this.deleteContact_msg = text;
        this.logger.log('[GROUPS] getTranslations GroupsPage : ', text)
        this.disassociateTheGroup = text['DisassociateTheGroup'];
      });

    this.translate.get('GroupsPage')
      .subscribe((text: string) => {
        // this.deleteContact_msg = text;
        this.logger.log('[GROUPS] getTranslations GroupsPage : ', text)
        this.disassociateTheGroupBeforeToDisableIt = text['DisassociateTheGroupBeforeToDisable'];
      });

    this.translate.get('Warning')
      .subscribe((text: string) => {
        // this.deleteContact_msg = text;
        // this.logger.log('+ + + BotsPage translation: ', text)
        this.warning = text;
      });


  }
}
