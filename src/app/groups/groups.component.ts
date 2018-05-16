import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { GroupService } from '../services/group.service';
import { Group } from '../models/group-model';
import { Router } from '@angular/router';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {

  showSpinner = true;
  groupsList: Group[];
  project_id: string;
  display_users_list_modal = 'none';
  group_name: string;
  projectUsersList: any;

  constructor(
    private auth: AuthService,
    private groupsService: GroupService,
    private router: Router,
    private usersService: UsersService
  ) { }

  ngOnInit() {
    this.auth.checkRole();
    this.getCurrentProject();
    this.getGroupsByProjectId();
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        this.project_id = project._id;
        console.log('00 -> GROUPS COMP project ID from AUTH service subscription ', this.project_id);
      }
    });
  }

  /**
   * GETS ALL GROUPS WITH THE CURRENT PROJECT-ID
   */
  getGroupsByProjectId() {
    this.groupsService.getGroupsByProjectId().subscribe((groups: any) => {
      console.log('GROUPS GET BY PROJECT ID', groups);

      this.groupsList = groups;
      // this.faqkbList = faqKb;
      this.showSpinner = false;
    },
      (error) => {

        console.log('GET GROUPS - ERROR ', error);

        this.showSpinner = false;
      },
      () => {
        console.log('GET GROUPS * COMPLETE');

      });

  }

  goToEditAddPage_create() {
    this.router.navigate(['project/' + this.project_id + '/group/create']);
  }

  open_user_list_modal(group_name: string) {
    this.group_name = group_name;
    this.getAllUsersOfCurrentProject();
    this.display_users_list_modal = 'block';
  }

  getAllUsersOfCurrentProject() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      console.log('GROUPS-COMP PROJECT-USERS (FILTERED FOR PROJECT ID)', projectUsers);

      // this.showSpinner = false;
      this.projectUsersList = projectUsers;

    },
      error => {
        // this.showSpinner = false;
        console.log('PROJECT USERS (FILTERED FOR PROJECT ID) - ERROR', error);
      },
      () => {
        console.log('PROJECT USERS (FILTERED FOR PROJECT ID) - COMPLETE');
      });
  }

  onCloseModal() {
    this.display_users_list_modal = 'none';
  }

  onCloseModalHandled() {
    this.display_users_list_modal = 'none';
  }

  selectUser(user_id) {
    console.log('USER ID SELECTED ', user_id)

  }
}
