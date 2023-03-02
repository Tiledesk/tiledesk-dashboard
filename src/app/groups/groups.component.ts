import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { GroupService } from '../services/group.service';
import { Group } from '../models/group-model';
import { Router } from '@angular/router';
import { UsersService } from '../services/users.service';
import { NotifyService } from '../core/notify.service';
import { URL_creating_groups } from '../utils/util';
import { AppConfigService } from 'app/services/app-config.service';
import { LoggerService } from 'app/services/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'app/services/chat21-core/providers/logger/loggerInstance';
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
  isVisibleGRO
  isChromeVerGreaterThan100: boolean

  private logger: LoggerService = LoggerInstance.getInstance();
  
  constructor(
    private auth: AuthService,
    private groupsService: GroupService,
    private router: Router,
    private usersService: UsersService,
    private notify: NotifyService,
    public appConfigService: AppConfigService,
  ) { }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    this.getCurrentProject();
    this.getOSCODE();
    this.getGroupsByProjectId();
    this.listenSidebarIsOpened();
    this.getOSCODE();
    this.getBrowserVersion()
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => { 
     this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    //  console.log("[WS-REQUESTS-LIST] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
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
    this.displayDeleteModal = 'block';
    this.id_group_to_delete = id_group;
    this.name_group_to_delete = group_name;
    this.logger.log('[GROUPS] OPEN DELETE MODAL - ID OF THE GROUP OF DELETE ', this.id_group_to_delete)
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

}
