import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';

import { ActivatedRoute } from '@angular/router';
import { ResetPswService } from '../services/reset-psw.service';
import { Location } from '@angular/common';
import { PasswordValidation } from './password-validation';
// import brand from 'assets/brand/brand.json';
import { BrandService } from '../services/brand.service';
import { LoggerService } from '../services/logger/logger.service';


type EmailField = 'email';
type EmailFormErrors = { [u in EmailField]: string };

type PswFields = 'password' | 'confirmPassword';
type PswFormErrors = { [u in PswFields]: string };

@Component({
  selector: 'appdashboard-reset-psw',
  templateUrl: './reset-psw.component.html',
  styleUrls: ['./reset-psw.component.scss']
})
export class ResetPswComponent implements OnInit {


  companyLogo: string;
  contact_us_email: string;
  company_site_url: string;
  strongPassword = false;

  emailForm: FormGroup;
  pswForm: FormGroup;
  emailformErrors: EmailFormErrors = {
    'email': '',
  };
  emailvalidationMessages = {
    'email': {
      'required': 'Email is required.',
      'email': 'Email must be a valid email',
    }
  };

  pswformErrors: PswFormErrors = {
    'password': '',
    'confirmPassword': '',
  };
  paswvalidationMessages = {
    'password': {
      'required': 'Password is required.',
      'pattern': 'Password must be include at one letter and one number.',
      'minlength': 'Password must be at least 8 characters long.',
      'maxlength': 'Password cannot be more than 25 characters long.',
    },
    'confirmPassword': {
      'required': 'Confirm Password is required.',
    },
  };

  public signin_errormsg = '';
  display = 'none';
  showSpinnerInRequestNewPswBtn = false;
  showSpinnerInResetPswBtn = false;
  displayResetPswEmailSentAlert = 'none';
  resetPswRequestId: string;
  route: string;
  IS_RESET_PSW_ROUTE: boolean;
  RESET_PSW_REQUEST_ID_IS_VALID: boolean;
  showSpinner = true;
  PSW_HAS_BEEN_CHANGED = false;
  HAS_REQUEST_NEW_PSW = false;
  CONFIRM_PSW_IS_SAME_OF_PWS: boolean

  ERROR_SENDING_EMAIL_RESET_PSW: boolean;
  ERROR_SENDING_EMAIL_RESET_PSW_USER_NOT_FOUND: boolean;
  ERROR_SENDING_EMAIL_RESET_PSW_OTHER_ERROR: boolean;
  OTHER_ERROR_MSG: string;
  primaryBrandColor: string;
  isVisiblePsw: boolean = false
  constructor
    (
      private fb: FormBuilder,
      private resetPswService: ResetPswService,
      private activetedRoute: ActivatedRoute,
      public location: Location,
      public brandService: BrandService,
      private logger: LoggerService
    ) {

    const brand = brandService.getBrand();

    this.companyLogo = brand['BASE_LOGO'];
    this.contact_us_email = brand['CONTACT_US_EMAIL'];
    this.company_site_url = brand['COMPANY_SITE_URL'];
    this.primaryBrandColor = brand['BRAND_PRIMARY_COLOR'];

  }

  ngOnInit() {
    this.detectResetPswRoute();
    this.buildEmailForm();
    this.buildPswForm();

  }

  /**
   * ****** TEST URL ******
   * to test in localhost the resetpassword route paste the following url and edit an user on mongpdb adding
   * "resetpswrequestid" : "afc4uekjjskvnko",
   * http://localhost:4200/#/resetpassword/afc4uekjjskvnko
   */

  /**
   * *** WORKFLOW ***
   * 1) DETECT IF IS THE resetpassword ROUTE
   * 2) IF IS THE resetpassword ROUTE GET THE REQUEST RESET PSW ID (getResetPswRequestId)
   * 3) CHECK (IN MONGO DB) IF THE GOT REQUEST RESET PSW ID EXIST (checkIfExistResetPswRequestId)
   */
  detectResetPswRoute() {
    if (this.location.path() !== '') {
      this.route = this.location.path();
      // this.logger.log('[RESET PSW] detectResetPswRoute »> »> ', this.route);
      if (this.route.indexOf('/resetpassword') !== -1) {
        // this.router.navigate([`${this.route}`]);
        this.IS_RESET_PSW_ROUTE = true;
        this.logger.log('[RESET-PSW] - IS RESET PSW COMP »> »> ', this.IS_RESET_PSW_ROUTE);

        // ----------------------------------------
        //  GET RESET PSW REQUEST ID 
        // ----------------------------------------
        this.getResetPswRequestId();

      } else {
        this.IS_RESET_PSW_ROUTE = false;
        this.showSpinner = false;
        this.logger.log('[RESET-PSW] - IS RESET PSW PAGE »> »> ', this.IS_RESET_PSW_ROUTE);
      }
    }
  }

  getResetPswRequestId() {
    this.resetPswRequestId = this.activetedRoute.snapshot.params['resetpswrequestid'];
    this.logger.log('[RESET-PSW] - ID OF THE REQUEST FOR RESET THE PSW ', this.resetPswRequestId);

    if (this.resetPswRequestId) {
      this.checkIfExistResetPswRequestId();
    }
  }

  checkIfExistResetPswRequestId() {
    this.resetPswService.getUserByPswRequestId(this.resetPswRequestId).subscribe((user) => {
      this.logger.log('[RESET-PSW] »»» »»» CHECK RESET PSW REQUEST ID  ', user);

    }, (error) => {
      this.logger.error('[RESET-PSW] »»» »»» CHECK RESET PSW REQUEST ID - ERROR ', error);

      const ckeckrequestid_errorMsg = error['error']['msg'];
      this.logger.log('[RESET-PSW] »»» »»» CHECK RESET PSW REQUEST ID - ERROR MSG ', ckeckrequestid_errorMsg)
      if (ckeckrequestid_errorMsg && ckeckrequestid_errorMsg === 'Invalid password reset key') {

        this.RESET_PSW_REQUEST_ID_IS_VALID = false;
        this.logger.log('[RESET-PSW] »»» »»» CHECK RESET PSW REQUEST ID - IS VALID REQUEST ID ', this.RESET_PSW_REQUEST_ID_IS_VALID);
        this.showSpinner = false;
      }
    }, () => {
      this.RESET_PSW_REQUEST_ID_IS_VALID = true;
      this.logger.log('[RESET PSW] »»» »»» CHECK RESET PSW REQUEST ID * COMPLETE *');
      this.logger.log('[RESET PSW] »»» »»» CHECK RESET PSW REQUEST ID - IS VALID REQUEST ID ', this.RESET_PSW_REQUEST_ID_IS_VALID);
      this.showSpinner = false
    });
  }

  buildEmailForm() {
    this.emailForm = this.fb.group({
      'email': ['', [
        Validators.required,
        Validators.email,
      ]]
    });

    this.emailForm.valueChanges.subscribe((data) => this.onEmailValueChanged(data));
    this.onEmailValueChanged(); // reset validation messages
  }

  buildPswForm() {
    this.pswForm = this.fb.group({
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

    this.pswForm.valueChanges.subscribe((data) => this.onPswValueChanged(data));
    this.onPswValueChanged(); // reset validation messages
  }

  get passwordFormField() {
    return this.pswForm.get('password');
  }

  // Updates validation state on form changes.
  onEmailValueChanged(data?: any) {
    if (!this.emailForm) { return; }
    const form = this.emailForm;
    for (const field in this.emailformErrors) {
      // tslint:disable-next-line:max-line-length
      if (Object.prototype.hasOwnProperty.call(this.emailformErrors, field) && (field === 'email')) {
        // clear previous error message (if any)
        this.emailformErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.emailvalidationMessages[field];
          if (control.errors) {
            for (const key in control.errors) {
              if (Object.prototype.hasOwnProperty.call(control.errors, key)) {
                this.emailformErrors[field] += `${(messages as { [key: string]: string })[key]} `;
              }
            }
          }
        }
      }
    }
  }

  onPswValueChanged(data?: any) {
    if (!this.pswForm) { return; }
    const form = this.pswForm;
    for (const field in this.pswformErrors) {
      // tslint:disable-next-line:max-line-length
      if (Object.prototype.hasOwnProperty.call(this.pswformErrors, field) && (field === 'password' || field === 'confirmPassword')) {
        // clear previous error message (if any)
        this.pswformErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.paswvalidationMessages[field];
          if (control.errors) {
            for (const key in control.errors) {
              if (Object.prototype.hasOwnProperty.call(control.errors, key)) {
                this.pswformErrors[field] += `${(messages as { [key: string]: string })[key]} `;
              }
            }
          }
        }
      }
    }
  }

  onPasswordStrengthChanged(event: boolean) {
    this.logger.log('[RESET-PSW] onPasswordStrengthChanged ', event)
    this.strongPassword = event;
  }

  togglePswdVisibility(isVisiblePsw) {
    this.logger.log('[RESET-PSW] togglePswdVisibility isVisiblePsw ', isVisiblePsw)
    this.isVisiblePsw = isVisiblePsw;

    const pswrdElem = <HTMLInputElement>document.querySelector('#reset-password')
   
    this.logger.log('[RESET-PSW] togglePswdVisibility pswrdElem (use case type password) ', pswrdElem)
    if (isVisiblePsw) {
      pswrdElem.setAttribute("type", "text");
    } else {
      pswrdElem.setAttribute("type", "password");
    }
  }

  dismissAlert() {
    this.logger.log('[RESET-PSW] - DISMISS ALERT CLICKED')
    this.display = 'none';
  }

  dismissResetPswEmailSentAlert() {
    this.logger.log('[RESET-PSW] - DISMISS RESET PSW EMAIL ALERT CLICKED')
    this.displayResetPswEmailSentAlert = 'none';
  }

  requestResetPsw() {
    this.showSpinnerInRequestNewPswBtn = true;
    this.logger.log('[RESET-PSW] - REQUEST RESET PSW USER EMAIL ', this.emailForm.value['email']);

    this.resetPswService.sendResetPswEmailAndUpdateUserWithResetPswRequestId(this.emailForm.value['email']).subscribe((user) => {
      this.logger.log('[RESET-PSW] - REQUEST RESET PSW - UPDATED USER ', user);

      if (user['success'] === false) {
        this.ERROR_SENDING_EMAIL_RESET_PSW = true;
        this.logger.error('[RESET-PSW] - REQUEST RESET PSW - UPDATED USER - success false > MSG', user['msg']);
        if (user['msg'] === 'User not found.') {

          this.ERROR_SENDING_EMAIL_RESET_PSW_USER_NOT_FOUND = true;
          this.ERROR_SENDING_EMAIL_RESET_PSW_OTHER_ERROR = false;
        } else {

          this.ERROR_SENDING_EMAIL_RESET_PSW_OTHER_ERROR = true;
          this.ERROR_SENDING_EMAIL_RESET_PSW_USER_NOT_FOUND = false;
          this.OTHER_ERROR_MSG = user['msg'];
        }
      } else if (user['success'] === true) {
        this.ERROR_SENDING_EMAIL_RESET_PSW = false;
      }

    }, (error) => {
      this.HAS_REQUEST_NEW_PSW = false
      this.showSpinnerInRequestNewPswBtn = true;
      this.logger.error('[RESET-PSW] - REQUEST RESET PSW - ERROR ', error);
      this.showSpinnerInRequestNewPswBtn = false;
      if (error.status === 0) {
        this.ERROR_SENDING_EMAIL_RESET_PSW_OTHER_ERROR = true;
        this.OTHER_ERROR_MSG = 'Sorry, there was an error connecting to the server'
        this.display = 'block';
      } else {
        this.ERROR_SENDING_EMAIL_RESET_PSW_OTHER_ERROR = true;
        this.OTHER_ERROR_MSG = this.OTHER_ERROR_MSG;
        this.display = 'block';
      }

    }, () => {
      this.logger.log('REQUEST RESET PSW - * COMPLETE *');
      setTimeout(() => {
        this.showSpinnerInRequestNewPswBtn = false;
        this.displayResetPswEmailSentAlert = 'block'
        this.HAS_REQUEST_NEW_PSW = true
      }, 300);

    });
  }

  resetPsw() {
    this.showSpinnerInResetPswBtn = true;
    this.logger.log('[RESET-PSW] - RESET-PSW - NEW PSW ', this.pswForm.value['password']);

    this.resetPswService.getUserByResetPswRequestIdAndResetPsw(this.resetPswRequestId, this.pswForm.value['password']).subscribe((user) => {
      this.logger.log('[RESET-PSW] - RESET-PSW - UPDATED USER ', user);

    }, (error) => {
      this.logger.error('[RESET-PSW] - RESET-PSW - ERROR ', error);
      this.showSpinnerInResetPswBtn = false;
    }, () => {
      this.logger.log('[RESET-PSW] - RESET-PSW - * COMPLETE *');
      setTimeout(() => {
        this.showSpinnerInResetPswBtn = false;
        this.PSW_HAS_BEEN_CHANGED = true;
      }, 300);
    });
  }

  // goToLoginForm() {
  // }
  // onDigitCofirmPsw() {
  //   this.logger.log('WRITING CONFIRM PSW - CONFIRM PSW LENGTH: ', this.pswForm.value['confirmPassword'].length);
  //   this.logger.log('WRITING CONFIRM PSW - PSW LENGTH: ', this.pswForm.value['password'].length);
  //   if (this.pswForm.value['confirmPassword'] === this.pswForm.value['password']) {
  //     this.CONFIRM_PSW_IS_SAME_OF_PWS = true;
  //     this.logger.log('CONFIRM PSW IS PSW ', this.CONFIRM_PSW_IS_SAME_OF_PWS);
  //   } else {
  //     this.CONFIRM_PSW_IS_SAME_OF_PWS = false;
  //     this.logger.log('CONFIRM PSW IS PSW ', this.CONFIRM_PSW_IS_SAME_OF_PWS);
  //   }
  // }

}
