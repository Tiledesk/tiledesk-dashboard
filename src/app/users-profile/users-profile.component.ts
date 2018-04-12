import { Component, OnInit } from '@angular/core';

import { UsersService } from '../services/users.service';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Project } from '../models/project-model';
import { ActivatedRoute } from '@angular/router';

// USED FOR go back last page
import { Location } from '@angular/common';

@Component({
  selector: 'app-users-profile',
  templateUrl: './users-profile.component.html',
  styleUrls: ['./users-profile.component.scss']
})
export class UsersProfileComponent implements OnInit {

  member_id: string;
  user: any;

  constructor(
    private usersService: UsersService,
    private router: Router,
    private auth: AuthService,
    private route: ActivatedRoute,
    private _location: Location
  ) { }

  ngOnInit() {
    this.getMemberId();
  }

  getMemberId() {
    this.member_id = this.route.snapshot.params['memberid'];
    console.log('MEMBER ID ', this.member_id);

    if (this.member_id) {

      this.getMemberDetails();
    }
  }

  getMemberDetails() {
    this.user = JSON.parse((localStorage.getItem(this.member_id)));
    if (this.user !== null) {
      console.log('USER ', this.user)
    } else {
      console.log('this user is not yet in the local storage')
      this.getAllUsersOfCurrentProject();
    }
  }

  getAllUsersOfCurrentProject() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      // console.log('HOME COMP - PROJECT-USERS (FILTERED FOR PROJECT ID)', projectUsers);

      if (projectUsers) {
        projectUsers.forEach(projectUser => {
          console.log('USERS PROFILE - PROJECT-USERS - USER ', projectUser.id_user, projectUser.id_user._id)
          localStorage.setItem(projectUser.id_user._id, JSON.stringify(projectUser.id_user));
        });
    }
      // localStorage.setItem('project', JSON.stringify(project));
      //   this.showSpinner = false;
      //   this.projectUsersList = projectUsers;
    },
      error => {
        // this.showSpinner = false;
        console.log('USERS PROFILE  (FILTERED FOR PROJECT ID) - ERROR', error);
      },
      () => {
        console.log('USERS PROFILE  (FILTERED FOR PROJECT ID) - COMPLETE')

        this.user = JSON.parse((localStorage.getItem(this.member_id)));
      });
  }

  goBack() {
    this._location.back();
  }
}
