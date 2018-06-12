import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';

// USED FOR go back last page
import { Location } from '@angular/common';
import { Project } from '../models/project-model';
import { UsersService } from '../services/users.service';

import { NotifyService } from '../core/notify.service';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: any;
  project: Project;
  userFirstname: string;
  userLastname: string;
  displayModalUpdatingUser = 'none';
  SHOW_CIRCULAR_SPINNER = false;
  UPDATE_USER_ERROR = false;
  showSpinner = true;

  constructor(
    public auth: AuthService,
    private _location: Location,
    private usersService: UsersService,
    public notify: NotifyService
  ) { }

  ngOnInit() {
    this.getLoggedUser();

    this.getCurrentProject();

  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project

      if (this.project) {
        console.log('00 -> USER PROFILE project from AUTH service subscription  ', project)
      } else {
        console.log('00 -> USER PROFILE project from AUTH service subscription ? ', project)
        this.selectSidebar();
      }
    });
  }

  // hides the sidebar if the user views his profile but has not yet selected a project
  selectSidebar() {
    const elemAppSidebar = <HTMLElement>document.querySelector('app-sidebar');
    console.log('USER PROFILE  elemAppSidebar ', elemAppSidebar)
    elemAppSidebar.setAttribute('style', 'display:none;');
  }

  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      console.log('==> USER GET IN USER PROFILE ', user)
      // tslint:disable-next-line:no-debugger
      // debugger
      if (user) {

        this.user = user;

        this.userFirstname = user.firstname;
        this.userLastname = user.lastname;

        this.showSpinner = false;
      }

    }, (error) => {
      console.log('==> USER GET IN USER PROFILE', error);
      this.showSpinner = false;
    });

  }

  goBack() {
    this._location.back();
  }

  updateCurrentUserFirstnameLastname() {

    this.displayModalUpdatingUser = 'block';
    this.SHOW_CIRCULAR_SPINNER = true;

    console.log('»» »» »» WHEN CLICK UPDATE - USER FIRST NAME ', this.userFirstname);
    console.log('»» »» »» WHEN CLICK UPDATE - USER LAST NAME ', this.userLastname);
    this.usersService.updateCurrentUserLastnameFirstname(this.userFirstname, this.userLastname, (response) => {

      console.log('»»»» CALLBACK RESPONSE ', response)
      if (response === 'user successfully updated on firebase') {

        this.SHOW_CIRCULAR_SPINNER = false;
        this.UPDATE_USER_ERROR = false;
        // =========== NOTIFY SUCCESS===========
        this.notify.showNotification('your profile has been successfully updated', 2, 'done');

      } else if (response === 'error') {
        this.SHOW_CIRCULAR_SPINNER = false;
        this.UPDATE_USER_ERROR = true;
        // =========== NOTIFY ERROR ===========
        this.notify.showNotification('An error has occurred updating your profile', 4, 'report_problem')
      }
    });
    // this.notify.showNotification()
    // this.displayModalUpdatingUser = 'block'
  }

  closeModalUpdatingUser() {

    this.displayModalUpdatingUser = 'none';

  }

}
