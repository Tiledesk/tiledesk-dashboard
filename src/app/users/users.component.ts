import { Component, OnInit } from '@angular/core';
import { UsersService } from '../services/users.service';

import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Project } from '../models/project-model';

@Component({
  selector: 'users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  showSpinner = true;
  projectUsersList: any;
  id_projectUser: string;

  // set to none the property display of the modal
  display = 'none';
  project: Project;
  id_project: string;
  USER_ROLE: string;

  constructor(
    private usersService: UsersService,
    private router: Router,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.getAllUsersOfCurrentProject();
    this.getCurrentProject();
    this.getProjectUserRole();
  }

  getProjectUserRole() {

    this.usersService.project_user_role_bs.subscribe((user_role) => {
      this.USER_ROLE = user_role;
      console.log('USERS-COMP - PROJECT USER ROLE ', this.USER_ROLE);
    });
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project;
      if (this.project) {
        this.id_project = project._id

      }
    });
  }

  goToAddUser() {
    this.router.navigate(['project/' + this.id_project + '/user/add']);
  }

  getAllUsersOfCurrentProject() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      console.log('PROJECT USERS (FILTERED FOR PROJECT ID)', projectUsers);

      this.showSpinner = false;
      this.projectUsersList = projectUsers;
    },
      error => {
        this.showSpinner = false;
        console.log('PROJECT USERS (FILTERED FOR PROJECT ID) - ERROR', error);
      },
      () => {
        console.log('PROJECT USERS (FILTERED FOR PROJECT ID) - COMPLETE');
      });
  }

  openDeleteModal(projectUser_id: string) {
    this.display = 'block';
    this.id_projectUser = projectUser_id;
    console.log('DELETE PROJECT-USER with ID ', this.id_projectUser);
  }

  onCloseDeleteModalHandled() {
    this.display = 'none';
    // console.log('Confirm Delete Project-User');
    this.usersService.deleteProjectUser(this.id_projectUser).subscribe((projectUsers: any) => {
      console.log('DELETE PROJECT USERS ', projectUsers);

      this.ngOnInit();

    }, error => {
      this.showSpinner = false;
      console.log('DELETE PROJECT USERS - ERROR ', error);
    },
      () => {
        console.log('DELETE PROJECT USERS * COMPLETE *');
      });
  }

  onCloseModal() {
    this.display = 'none';
  }

  goToMemberProfile(member_id: string) {
    this.router.navigate(['project/' + this.id_project + '/member/' + member_id]);
  }

}
