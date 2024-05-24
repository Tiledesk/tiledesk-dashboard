import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { GroupService } from '../services/group.service';
import { Group } from '../models/group-model';
import { Router } from '@angular/router';
import { NotifyService } from '../core/notify.service';
import { LoggerService } from '../services/logger/logger.service';
import { URL_creating_groups } from '../utils/util';
import { AppConfigService } from 'app/services/app-config.service';
import { BrandService } from 'app/services/brand.service';
import { DepartmentService } from 'app/services/department.service';
import { TranslateService } from '@ngx-translate/core';
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
  id_group_to_delete: string;
  name_group_to_delete: string;
  IS_OPEN_SETTINGS_SIDEBAR: boolean;
  public_Key: any;
  isVisibleGRO: any
  isChromeVerGreaterThan100: boolean;

  disassociateTheGroup: string;
  warning: string;

  public hideHelpLink: boolean;
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
  ) {
    const brand = brandService.getBrand();
    this.hideHelpLink = brand['DOCS'];
  }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    this.getCurrentProject();
    this.getOSCODE();
    this.getGroupsByProjectId();
    this.listenSidebarIsOpened();
    this.getOSCODE();
    this.getBrowserVersion()
    this.getTranslations();
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
      this.logger.log('[GROUPS] - GET GROUPS BY PROJECT ID ', groups);

      this.groupsList = groups;
      // this.faqkbList = faqKb;

    }, (error) => {
      this.logger.error('[GROUPS] GET GROUPS - ERROR ', error);
      this.showSpinner = false;
    }, () => {
      this.showSpinner = false;
      this.logger.log('[GROUPS] GET GROUPS * COMPLETE');
    });

  }

  goToEditAddPage_create() {
    this.router.navigate(['project/' + this.project_id + '/group/create']);
  }

  goToUsers() {
    this.router.navigate(['project/' + this.project_id + '/users']);
  }

  goToEditAddPage_edit(id_group: string) {
    this.router.navigate(['project/' + this.project_id + '/group/edit/' + id_group]);
  }

  goToGroupsDoc() {
    const url = URL_creating_groups;
    window.open(url, '_blank');
  }

  openDeleteModal(id_group: string, group_name: string) {
    // this.displayDeleteModal = 'block';
    this.id_group_to_delete = id_group;
    this.name_group_to_delete = group_name;
    this.logger.log('[GROUPS] OPEN DELETE MODAL - ID OF THE GROUP OF DELETE ', this.id_group_to_delete)
    this.getDepartments(this.id_group_to_delete)

  }

  getDepartments(selectedGrouId?: string) {
    this.logger.log('[GROUPS] getDepartmentsL - ID OF THE GROUP OF DELETE ', selectedGrouId)
    this.departmentService.getDeptsByProjectId().subscribe((_departments: any) => {
      this.logger.log('[GROUPS] ON MODAL DELETE OPEN - GET DEPTS RES', _departments);

      const deptsArrayWithAssociatedGroup = _departments.filter((obj: any) => {
        return obj.id_group === selectedGrouId;
      });

      if (deptsArrayWithAssociatedGroup.length === 0) {
        this.logger.log('[GROUPS] ON MODAL DELETE OPEN - GROUP NOT ASSOCIATED');
        this.displayDeleteModal = 'block'; 
      } else {
        this.logger.log('[GROUPS] ON MODAL DELETE OPEN - GROUP !!! ASSOCIATED');
        this.logger.log('[GROUPS] ON MODAL DELETE OPEN - deptsArrayWithAssociatedGroup', deptsArrayWithAssociatedGroup);

        const deptsNameAssociatedToGroup = []

        deptsArrayWithAssociatedGroup.forEach(dept => {
          deptsNameAssociatedToGroup.push(dept.name)
        });

        this.logger.log('[GROUPS] ON MODAL DELETE OPEN - deptsNameAssociatedToGroup ', deptsNameAssociatedToGroup);

        if (deptsArrayWithAssociatedGroup.length === 1) {
          Swal.fire({
            title: this.warning,
            text: this.translate.instant('GroupsPage.TheGroupIsAssociatedWithTheDepartment', { depts_name: deptsNameAssociatedToGroup.join(', ') }) + '. ' + this.disassociateTheGroup,
            icon: "warning",
            showCloseButton: true,
            showCancelButton: false,
            confirmButtonColor: "var(--blue-light)",
            focusConfirm: false
          })
        }

        if (deptsArrayWithAssociatedGroup.length > 1) {
          Swal.fire({
            title: this.warning,
            text: this.translate.instant('GroupsPage.TheGroupIsAssociatedWithDepartments', { depts_name: deptsNameAssociatedToGroup.join(', ') }) +'. ' + this.disassociateTheGroup,
            icon: "warning",
            showCloseButton: true,
            showCancelButton: false,
            confirmButtonColor: "var(--blue-light)",
            focusConfirm: false,
          })
        }
      }
    })
  }

  onCloseDeleteModal() {
    this.displayDeleteModal = 'none';
  }

  deleteGroup() {
    this.displayDeleteModal = 'none';
    this.groupsService.setTrashedToTheGroup(this.id_group_to_delete).subscribe((group) => {

      this.logger.log('[GROUPS] - UPDATED GROUP WITH TRASHED = TRUE ', group);
    }, (error) => {
      this.logger.error('[GROUPS] - UPDATED GROUP WITH TRASHED = TRUE - ERROR ', error);
      // =========== NOTIFY ERROR ===========
      this.notify.showNotification('An error occurred while deleting the group', 4, 'report_problem');
    }, () => {
      this.logger.log('[GROUPS] - UPDATED GROUP WITH TRASHED = TRUE * COMPLETE *');

      // =========== NOTIFY SUCCESS===========
      this.notify.showNotification('group successfully deleted', 2, 'done');
      // UPDATE THE GROUP LIST
      this.ngOnInit()
    });
  }


  getTranslations() {
    this.translate.get('GroupsPage')
      .subscribe((text: string) => {
        // this.deleteContact_msg = text;
        this.logger.log('[GROUPS] getTranslations GroupsPage : ', text)
        this.disassociateTheGroup = text['DisassociateTheGroup'];
      });


    this.translate.get('Warning')
      .subscribe((text: string) => {
        // this.deleteContact_msg = text;
        // this.logger.log('+ + + BotsPage translation: ', text)
        this.warning = text;
      });

  
  }

}
