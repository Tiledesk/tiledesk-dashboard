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

  // set to none the property display of the modal
  display = 'none';
  project: Project;

  constructor(
    private usersService: UsersService,
    private router: Router,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.getAllUsersOfCurrentProject();
    this.getCurrentProject();
  }


  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      console.log('00 -> USER COMP project ID from AUTH service subscription  ', this.project._id)
    });
  }

  goToAddUser() {
    this.router.navigate(['project/' + this.project._id + '/user/add']);
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
        console.log('PROJECT USERS (FILTERED FOR PROJECT ID) - COMPLETE')
      });
  }

  openDeleteModal() {
    this.display = 'block';
  }

  onCloseDeleteModalHandled() {
    console.log('Confirm Delete Project Member')
  }
  onCloseModal() {
    this.display = 'none';
  }

}
