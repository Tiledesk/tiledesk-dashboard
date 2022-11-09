import { Component, OnInit, AfterViewInit } from '@angular/core';
// USED FOR go back last page
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { LoggerService } from '../../services/logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
const swal = require('sweetalert');

@Component({
  selector: 'appdashboard-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit, AfterViewInit {

  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  DISABLE_UPDATE_PSW_BTN = true

  userId: string;
  projectId: string;
  displayModalChangingPsw = 'none';
  SHOW_CIRCULAR_SPINNER: boolean;

  CHANGE_PSW_NO_ERROR: boolean;
  CURRENT_PSW_INVALID_ERROR: boolean;
  CHANGE_PSW_OTHER_ERROR: boolean;

  warning: string;
  selectAProjectToManageNotificationEmails: string;
  isChromeVerGreaterThan100: boolean;
  constructor(
    private _location: Location,
    private route: ActivatedRoute,
    private usersService: UsersService,
    public auth: AuthService,
    private router: Router,
    private logger: LoggerService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.getUserIdFromRouteParams();
    this.getCurrentProject();
    this.translateStrings();
    this.getBrowserVersion()
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  console.log("[BOT-CREATE] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }

  translateStrings() {
    this.translate.get('Warning')
      .subscribe((text: string) => {

        this.warning = text;
      });

    this.translate.get('ItIsNecessaryToSelectAProjectToManageNotificationEmails')
      .subscribe((text: string) => {

        this.selectAProjectToManageNotificationEmails = text;
      });
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        this.projectId = project._id;
        this.logger.log('[USER-PROFILE][CHANGE-PSW] - GET CURRENT PROJECT - project ', project)
      } else {
        this.logger.log('[USER-PROFILE][CHANGE-PSW] - GET CURRENT PROJECT - project ', project, ' HIDE-SIDEBAR')

        this.hideSidebar();
      }
    });
  }

  // hides the sidebar if the user is in the CHANGE PSW PAGE but has not yet selected a project
  hideSidebar() {
    const elemAppSidebar = <HTMLElement>document.querySelector('app-sidebar');
    this.logger.log('[USER-PROFILE][CHANGE-PSW] - HIDE-SIDEBAR - elemAppSidebar ', elemAppSidebar)
    elemAppSidebar.setAttribute('style', 'display:none;');

    const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    this.logger.log('[USER-PROFILE][CHANGE-PSW] - HIDE-SIDEBAR - elemMainPanel ', elemMainPanel)
    elemMainPanel.setAttribute('style', 'width:100% !important; overflow-x: hidden !important;');
  }


  ngAfterViewInit() {
    if (document.getElementsByTagName) {
      const inputElements = document.getElementsByTagName('input');
      this.logger.log('[USER-PROFILE][CHANGE-PSW] » input elemnts ', inputElements)

      for (let i = 0; inputElements[i]; i++) {
        // if (inputElements[i].className && (inputElements[i].className.indexOf('disableAutoComplete') !== -1)) {
        this.logger.log('[USER-PROFILE][CHANGE-PSW] » HERE YES - SET ATTRIBUTE AUTOCOMPLETE OFF TO INPUT-ELEMENTS')
        inputElements[i].setAttribute('autocomplete', 'off');
      }
    }
  }

  getUserIdFromRouteParams() {
    this.userId = this.route.snapshot.params['userid'];
    this.logger.log('[USER-PROFILE][CHANGE-PSW] - GET USER ID PROM PARAMS - USER ID ', this.userId)
  }

  onDigitNewPsw() {
    this.logger.log('[USER-PROFILE][CHANGE-PSW] - ON DIGIT NEW PSW ==> new psw ', this.newPassword);
    if (this.confirmNewPassword !== this.newPassword) {
      this.DISABLE_UPDATE_PSW_BTN = true;
      this.logger.log('[USER-PROFILE][CHANGE-PSW] - ON DIGIT NEW PSW - CONFIRM PASSWORD IS NOT EQUAL TO NEW PASSWORD ', this.DISABLE_UPDATE_PSW_BTN)
    } else {
      this.DISABLE_UPDATE_PSW_BTN = false;
      this.logger.log('[USER-PROFILE][CHANGE-PSW] - ON DIGIT NEW PSW - CONFIRM PASSWORD IS NOT EQUAL TO NEW PASSWORD ', this.DISABLE_UPDATE_PSW_BTN)
    }
  }

  onConfirmNewPsw() {
    this.logger.log('[USER-PROFILE][CHANGE-PSW] - ON CONFIRM NEW PSW ==> confirm new psw ', this.confirmNewPassword);
    if (this.confirmNewPassword !== this.newPassword) {
      this.DISABLE_UPDATE_PSW_BTN = true;
      this.logger.log('[USER-PROFILE][CHANGE-PSW] - ON CONFIRM NEW PSW - CONFIRM PASSWORD IS NOT EQUAL TO NEW PASSWORD ', this.DISABLE_UPDATE_PSW_BTN)
    } else {
      this.DISABLE_UPDATE_PSW_BTN = false;
      this.logger.log('[USER-PROFILE][CHANGE-PSW] - ON CONFIRM NEW PSW - CONFIRM PASSWORD IS NOT EQUAL TO NEW PASSWORD ', this.DISABLE_UPDATE_PSW_BTN)
    }

  }

  changePsw() {
    this.logger.log('[USER-PROFILE][CHANGE-PSW] - CHANGE PSW - OLD PSW ', this.oldPassword)
    this.logger.log('[USER-PROFILE][CHANGE-PSW] - CHANGE PSW - NEW PSW ', this.newPassword)

    this.displayModalChangingPsw = 'block';
    this.SHOW_CIRCULAR_SPINNER = true;

    this.usersService.changePassword(this.userId, this.oldPassword, this.newPassword)
      .subscribe((user) => {
        this.logger.log('USER-PROFILE][CHANGE-PSW] - CHANGE PASSWORD - RES ', user);

      }, (error) => {
        this.logger.error('USER-PROFILE][CHANGE-PSW] - CHANGE PASSWORD - ERROR ', error);
        this.SHOW_CIRCULAR_SPINNER = false;
        this.CHANGE_PSW_NO_ERROR = false;

        const errorMsg = error['error']['msg'];

        if (errorMsg === 'Current password is invalid.') {
          this.CURRENT_PSW_INVALID_ERROR = true;
          this.CHANGE_PSW_OTHER_ERROR = false;

        } else {
          this.CHANGE_PSW_OTHER_ERROR = true;
          this.CURRENT_PSW_INVALID_ERROR = false;
        }

      }, () => {
        this.logger.log('USER-PROFILE][CHANGE-PSW] - CHANGE PASSWORD * COMPLETE *');
        this.CHANGE_PSW_OTHER_ERROR = false;
        this.CURRENT_PSW_INVALID_ERROR = false;
        this.SHOW_CIRCULAR_SPINNER = false;
        this.CHANGE_PSW_NO_ERROR = true;
      });
  }

  closeModalChangingPswHandler() {
    this.displayModalChangingPsw = 'none';
    // this._location.back();

    if (document.getElementsByTagName) {
      const inputElements = document.getElementsByTagName('input');
      this.logger.log('[USER-PROFILE][CHANGE-PSW] » input elemnts ', inputElements)

      for (let i = 0; inputElements[i]; i++) {
        // if (inputElements[i].className && (inputElements[i].className.indexOf('disableAutoComplete') !== -1)) {
        this.logger.log('[USER-PROFILE][CHANGE-PSW] » HERE YES - SET VALUE TO EMPTY')
        inputElements[i].value = '';
      }
    }
  }

  closeModalChangingPsw() {
    this.displayModalChangingPsw = 'none';
  }


  // hides the sidebar if the user views his profile but has not yet selected a project
  // selectSidebar() {
  //   const elemAppSidebar = <HTMLElement>document.querySelector('app-sidebar');
  //   this.logger.log('USER PROFILE  elemAppSidebar ', elemAppSidebar)
  //   elemAppSidebar.setAttribute('style', 'display:none;');

  //   const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
  //   this.logger.log('USER PROFILE  elemMainPanel ', elemMainPanel)
  //   elemMainPanel.setAttribute('style', 'width:100% !important; overflow-x: hidden !important;');
  // }


  goBack() {
    this._location.back();
  }

  goToUserProfile() {
    this.logger.log('USER-PROFILE][CHANGE-PSW] »» GO TO USER PROFILE  - PROJECT ID ', this.projectId)
    if (this.projectId === undefined) {

      this.router.navigate(['user-profile']);
    } else {
      this.router.navigate(['project/' + this.projectId + '/user-profile']);
    }
  }

  goToAccountSettings() {
    this.logger.log('USER-PROFILE][CHANGE-PSW] »» GO TO USER  PROFILE SETTINGS - PROJECT ID ', this.projectId)
    if (this.projectId === undefined) {
      this.router.navigate(['user/' + this.userId + '/settings']);
    } else {
      this.router.navigate(['project/' + this.projectId + '/user/' + this.userId + '/settings']);
    }
  }

  goToNotificationSettings() {
    this.logger.log('USER-PROFILE][CHANGE-PSW] »» GO TO USER  NOTIFICATION SETTINGS - PROJECT ID ', this.projectId)
    if (this.projectId === undefined) {
      // this.router.navigate(['user/' + this.userId + '/notifications']);
      this.presentModalSelectAProjectToManageEmailNotification();
    } else {
      this.router.navigate(['project/' + this.projectId + '/user/' + this.userId + '/notifications']);
    }
  }

  presentModalSelectAProjectToManageEmailNotification() {
    swal({
      title: this.warning,
      text: this.selectAProjectToManageNotificationEmails,
      icon: "warning",
      button: "Ok",
      dangerMode: false,
    })
  }



}
