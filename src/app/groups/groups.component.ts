import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { GroupService } from '../services/group.service';
import { Group } from '../models/group-model';
import { Router } from '@angular/router';
import { UsersService } from '../services/users.service';
import { forEach } from '@angular/router/src/utils/collection';

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

  goToEditAddPage_edit(id_group: string) {
    this.router.navigate(['project/' + this.project_id + '/group/edit/' + id_group]);
  }

  open_users_list_modal(id_group: string, group_name: string, group_members: any) {
    this.id_group = id_group;
    this.group_name = group_name;
    this.group_members = group_members;

    this.showSpinnerInModal = true;

    console.log('GROUP SELECTED -> group NAME: ', this.group_name, ' -> group ID: ', this.id_group)
    console.log('GROUP SELECTED -> MEMBERS; ', this.group_members);

    this.users_selected = this.group_members;
    console.log('ARRAY OF SELECTED USERS WHEN OPEN MODAL ', this.users_selected);


    this.getAllUsersOfCurrentProject();
    this.display_users_list_modal = 'block';
  }

  getAllUsersOfCurrentProject() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      console.log('GROUPS-COMP - PROJECT-USERS (FILTERED FOR PROJECT ID)', projectUsers);

      this.showSpinnerInModal = false;
      this.projectUsersList = projectUsers;

      // CHECK IF THE USER-ID IS BETWEEN THE MEMBER OF THE GROUP
      this.projectUsersList.forEach(projectUser => {


        for (const p of this.projectUsersList) {

          // console.log('vv', projectUser._id)

          this.group_members.forEach(group_member => {


            if (p.id_user._id === group_member) {
              if (projectUser._id === p._id) {
                p.is_group_member = true;
                console.log('GROUP MEMBERS ', group_member)
                console.log('IS MEMBER OF THE GROUP THE USER ', p.id_user._id, ' - ', p.is_group_member)
              }

            }

          });

        }

      });

    },
      error => {
        this.showSpinnerInModal = false;
        console.log('PROJECT USERS (FILTERED FOR PROJECT ID) - ERROR', error);
      },
      () => {
        console.log('PROJECT USERS (FILTERED FOR PROJECT ID) - COMPLETE');
      });
  }

  onCloseModal() {
    this.display_users_list_modal = 'none';
  }


  change(obj) {
    // + this.group_members
    console.log('obj', obj);

    const index = this.users_selected.indexOf(obj);

    console.log('INDEX ', index);

    if (index > -1) {
      this.users_selected.splice(index, 1);
    } else {
      this.users_selected.push(obj);
    }

    console.log('ARRAY OF SELECTED USERS ', this.users_selected);
    console.log('ARRAY OF SELECTED USERS lenght ', this.users_selected.length);

    // DISABLE THE ADD BUTTON
    // if (this.users_selected.length < 1) {
    //   this.add_btn_disabled = true;

    // } else {
    //   this.add_btn_disabled = false;
    // }
  }

  onCloseModalHandled() {
    this.display_users_list_modal = 'none';

    // this.group_members.forEach(group_members => {
    //   console.log(' ++ +++ group_members ', group_members)

    //   this.users_selected.forEach(users_selected => {
    //     if (users_selected !== group_members) {

    //       console.log('XXX ', users_selected)
    //     }
    //   });
    // });

    this.groupsService.updateGroup(this.id_group, this.users_selected).subscribe((group) => {

      console.log('UPDATED GROUP WITH THE USER SELECTED', group);
    },
      (error) => {
        console.log('UPDATED GROUP WITH THE USER SELECTED - ERROR ', error);
      },
      () => {
        console.log('UPDATED GROUP WITH THE USER SELECTED* COMPLETE *');

        // UPDATE THE GROUP LIST
        this.ngOnInit()
      });
  }


}
