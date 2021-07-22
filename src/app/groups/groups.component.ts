import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { GroupService } from '../services/group.service';
import { Group } from '../models/group-model';
import { Router } from '@angular/router';
import { UsersService } from '../services/users.service';
import { NotifyService } from '../core/notify.service';
import { LoggerService } from '../services/logger/logger.service';
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

  constructor(
    private auth: AuthService,
    private groupsService: GroupService,
    private router: Router,
    private usersService: UsersService,
    private notify: NotifyService,
    private logger: LoggerService
  ) { }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    this.getCurrentProject();
    this.getGroupsByProjectId();
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
