import { Component, OnInit, AfterViewInit } from '@angular/core';
// USED FOR go back last page
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { LoggerService } from '../../services/logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PasswordValidation } from 'app/reset-psw/password-validation';
const swal = require('sweetalert');
type UserFields = 'email' | 'password' | 'firstName' | 'lastName' | 'terms';
type FormErrors = { [u in UserFields]: string };
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

  pswForm: FormGroup;
  strongPassword = false;
  isVisiblePsw: boolean = false

  formErrors: FormErrors = {
    'email': '',
    'password': '',
    'firstName': '',
    'lastName': '',
    'terms': '',
  };
  validationMessages = {
    'email': {
      'required': 'Email is required.',
      'email': 'Email must be a valid email',
      'pattern': 'Email must be a valid email',
    },
    'password': {
      'required': 'Password is required.',
      'pattern': 'Password must be include at one letter and one number.',
      'minlength': 'Password must be at least 8 characters long.',
      'maxlength': 'Password is too long.',

    },
    'firstName': {
      'required': 'First Name is required.',
    },
    'lastName': {
      'required': 'Last Name is required.',
    },
    'terms': {
      'required': 'Please accept Terms and Conditions and Privacy Policy',
    },
  };
  
  constructor(
    private _location: Location,
    private route: ActivatedRoute,
    private usersService: UsersService,
    public auth: AuthService,
    private router: Router,
    private logger: LoggerService,
    private translate: TranslateService,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.getUserIdFromRouteParams();
    this.getCurrentProject();
    this.translateStrings();
    this.getBrowserVersion()
    this.buildPswForm();
  }

  buildPswForm() {
    this.pswForm = this.fb.group({
      'oldPassword': ['', Validators.required],
      'password': ['', [
        // Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/),
        Validators.minLength(8),
        Validators.maxLength(512),
      ]],
      'confirmPassword': ['', Validators.required]
      // Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
    },
      { validator: PasswordValidation.MatchPassword }
    );

    this.pswForm.valueChanges.subscribe((data) => this.onValueChanged(data));
    this.onValueChanged(); // reset validation messages
  }

  get passwordFormField() {
    return this.pswForm.get('password');
  }

    // Updates validation state on form changes.
    onValueChanged(data?: any) {
      if (!this.pswForm) {
        return;
      }
      const form = this.pswForm;
  
      for (const field in this.formErrors) {
        // tslint:disable-next-line:max-line-length
        if (Object.prototype.hasOwnProperty.call(this.formErrors, field) && (field === 'email' || field === 'password' || field === 'firstName' || field === 'lastName' || field === 'terms')) {
          // clear previous error message (if any)
          this.formErrors[field] = '';
          const control = form.get(field);
          if (control && control.dirty && !control.valid) {
            const messages = this.validationMessages[field];
            if (control.errors) {
              for (const key in control.errors) {
                if (Object.prototype.hasOwnProperty.call(control.errors, key)) {
                  this.formErrors[field] += `${(messages as { [key: string]: string })[key]} `;
                }
              }
            }
          }
        }
      }
    }

  onPasswordStrengthChanged(event: boolean) {
    this.logger.log('[USER-PROFILE][CHANGE-PSW] onPasswordStrengthChanged ', event)
    this.strongPassword = event;
  }

  togglePswdVisibility(isVisiblePsw) {
    this.logger.log('[USER-PROFILE][CHANGE-PSW] togglePswdVisibility isVisiblePsw ', isVisiblePsw)
    this.isVisiblePsw = isVisiblePsw;

    const pswrdElem = <HTMLInputElement>document.querySelector('#reset-password')
   
    this.logger.log('[USER-PROFILE][CHANGE-PSW] togglePswdVisibility pswrdElem (use case type password) ', pswrdElem)
    if (isVisiblePsw) {
      pswrdElem.setAttribute("type", "text");
    } else {
      pswrdElem.setAttribute("type", "password");
    }
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  this.logger.log("[BOT-CREATE] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
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
    this.logger.log('[USER-PROFILE][CHANGE-PSW] - CHANGE PSW - NEW PSW from FORM', this.pswForm.value.password);
    this.logger.log('[USER-PROFILE][CHANGE-PSW] - CHANGE PSW - OLD PSW from FORM', this.pswForm.value.oldPassword)

    this.newPassword = this.pswForm.value.password;
    this.oldPassword = this.pswForm.value.oldPassword;

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
