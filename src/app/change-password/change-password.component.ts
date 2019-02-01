import { Component, OnInit, AfterViewInit } from '@angular/core';
// USED FOR go back last page
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from '../services/users.service';
import { AuthService } from '../core/auth.service';

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
  displayModalChangingPsw = 'none';
  SHOW_CIRCULAR_SPINNER: boolean;

  CHANGE_PSW_NO_ERROR: boolean;
  CURRENT_PSW_INVALID_ERROR: boolean;
  CHANGE_PSW_OTHER_ERROR: boolean;

  constructor(
    private _location: Location,
    private route: ActivatedRoute,
    private usersService: UsersService,
    public auth: AuthService
  ) { }

  ngOnInit() {
    this.getUserIdFromRouteParams();

    this.getCurrentProject();
  }
  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {

        console.log('00 -> CHANGE PSW - project from AUTH service subscription  ', project)
      } else {
        console.log('00 -> CHANGE PSW - project from AUTH service subscription ? ', project)

        this.hideSidebar();
      }
    });
  }

  // hides the sidebar if the user is in the CHANGE PSW PAGE but has not yet selected a project
  hideSidebar() {
    const elemAppSidebar = <HTMLElement>document.querySelector('app-sidebar');
    console.log('USER PROFILE  elemAppSidebar ', elemAppSidebar)
    elemAppSidebar.setAttribute('style', 'display:none;');

    const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    console.log('USER PROFILE  elemMainPanel ', elemMainPanel)
    elemMainPanel.setAttribute('style', 'width:100% !important; overflow-x: hidden !important;');
  }


  ngAfterViewInit() {
    if (document.getElementsByTagName) {

      const inputElements = document.getElementsByTagName('input');
      console.log('» input elemnts ', inputElements)

      for (let i = 0; inputElements[i]; i++) {

        // if (inputElements[i].className && (inputElements[i].className.indexOf('disableAutoComplete') !== -1)) {
        console.log('» qui entro')
        inputElements[i].setAttribute('autocomplete', 'off');

        // }

      }

    }
  }

  getUserIdFromRouteParams() {
    this.userId = this.route.snapshot.params['userid'];
    console.log('CHANGE PSW COMP - USER ID ', this.userId)
  }

  goBack() {
    this._location.back();
  }


  onDigitNewPsw() {

    console.log('==> new psw ', this.newPassword);
    if (this.confirmNewPassword !== this.newPassword) {
      this.DISABLE_UPDATE_PSW_BTN = true;
      console.log('CONFIRM PASSWORD IS NOT EQUAL TO NEW PASSWORD ', this.DISABLE_UPDATE_PSW_BTN)
    } else {
      this.DISABLE_UPDATE_PSW_BTN = false;
      console.log('CONFIRM PASSWORD IS NOT EQUAL TO NEW PASSWORD ', this.DISABLE_UPDATE_PSW_BTN)
    }
  }

  onConfirmNewPsw() {
    console.log('==> confirm new psw ', this.confirmNewPassword);

    if (this.confirmNewPassword !== this.newPassword) {
      this.DISABLE_UPDATE_PSW_BTN = true;
      console.log('CONFIRM PASSWORD IS NOT EQUAL TO NEW PASSWORD ', this.DISABLE_UPDATE_PSW_BTN)
    } else {
      this.DISABLE_UPDATE_PSW_BTN = false;
      console.log('CONFIRM PASSWORD IS NOT EQUAL TO NEW PASSWORD ', this.DISABLE_UPDATE_PSW_BTN)
    }

  }

  changePsw() {
    console.log('on CHANGE PSW - OLD PSW ', this.oldPassword)
    console.log('on CHANGE PSW - NEW PSW ', this.newPassword)

    this.displayModalChangingPsw = 'block';
    this.SHOW_CIRCULAR_SPINNER = true;

    this.usersService.changePassword(this.userId, this.oldPassword, this.newPassword)
      .subscribe((user) => {
        console.log('CHANGE PASSWORD - DATA ', user);

      },
        (error) => {
          console.log('CHANGE PASSWORD - ERROR ', error);
          this.SHOW_CIRCULAR_SPINNER = false;
          this.CHANGE_PSW_NO_ERROR = false;

          const error_body = JSON.parse(error._body);

          if (error_body.msg === 'Current password is invalid.') {
            this.CURRENT_PSW_INVALID_ERROR = true;
            this.CHANGE_PSW_OTHER_ERROR = false;

          } else {
            this.CHANGE_PSW_OTHER_ERROR = true;
            this.CURRENT_PSW_INVALID_ERROR = false;
          }

        },
        () => {
          console.log('CHANGE PASSWORD * COMPLETE *');
          this.CHANGE_PSW_OTHER_ERROR = false;
          this.CURRENT_PSW_INVALID_ERROR = false;
          this.SHOW_CIRCULAR_SPINNER = false;
          this.CHANGE_PSW_NO_ERROR = true;
        });
  }

  closeModalChangingPswHandler() {

    this.displayModalChangingPsw = 'none';

    this._location.back();
  }

  closeModalChangingPsw() {
    this.displayModalChangingPsw = 'none';
  }


    // hides the sidebar if the user views his profile but has not yet selected a project
    selectSidebar() {
      const elemAppSidebar = <HTMLElement>document.querySelector('app-sidebar');
      console.log('USER PROFILE  elemAppSidebar ', elemAppSidebar)
      elemAppSidebar.setAttribute('style', 'display:none;');
  
      const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
      console.log('USER PROFILE  elemMainPanel ', elemMainPanel)
      elemMainPanel.setAttribute('style', 'width:100% !important; overflow-x: hidden !important;');
    }
}
