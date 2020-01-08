import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';

import { ActivatedRoute } from '@angular/router';
import { ResetPswService } from '../services/reset-psw.service';
import { Location } from '@angular/common';
import { PasswordValidation } from './password-validation';
import brand from 'assets/brand/brand.json';

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


  companyLogoBlack_Url = brand.company_logo_black__url;
  contact_us_email = brand.contact_us_email;
  company_site_url = brand.company_site_url;


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
      'minlength': 'Password must be at least 6 characters long.',
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
  constructor
    (
    private fb: FormBuilder,
    private resetPswService: ResetPswService,
    private activetedRoute: ActivatedRoute,
    public location: Location
    ) { }

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
      console.log('RESET PSW »> »> ', this.route);
      if (this.route.indexOf('/resetpassword') !== -1) {
        // this.router.navigate([`${this.route}`]);
        this.IS_RESET_PSW_ROUTE = true;
        console.log('»> »> RESET PSW - IS RESET PSW PAGE »> »> ', this.IS_RESET_PSW_ROUTE);

        /**
         * ****** GET RESET PSW REQUEST ID ******
         */
        this.getResetPswRequestId();

      } else {
        this.IS_RESET_PSW_ROUTE = false;
        this.showSpinner = false;
        console.log('»> »> RESET PSW - IS RESET PSW PAGE »> »> ', this.IS_RESET_PSW_ROUTE);
      }
    }
  }

  getResetPswRequestId() {
    this.resetPswRequestId = this.activetedRoute.snapshot.params['resetpswrequestid'];
    console.log('»»» »»» RESET PSW - ID OF THE REQUEST FOR RESET THE PSW ', this.resetPswRequestId);

    if (this.resetPswRequestId) {
      this.checkIfExistResetPswRequestId();
    }
  }

  checkIfExistResetPswRequestId() {
    this.resetPswService.getUserByPswRequestId(this.resetPswRequestId).subscribe((user) => {
      console.log('»»» »»» CHECK RESET PSW REQUEST ID  ', user);

    },
      (error) => {
        console.log('»»» »»» CHECK RESET PSW REQUEST ID - ERROR ', error);
        const ckeckrequestid_errorbody = JSON.parse(error._body);
        console.log('»»» »»» CHECK RESET PSW REQUEST ID - ERROR BODY ', ckeckrequestid_errorbody)
        if (error && ckeckrequestid_errorbody.msg === 'Invalid password reset key') {

          this.RESET_PSW_REQUEST_ID_IS_VALID = false;
          console.log('»»» »»» CHECK RESET PSW REQUEST ID - IS VALID REQUEST ID ', this.RESET_PSW_REQUEST_ID_IS_VALID);
          this.showSpinner = false;
        }
      },
      () => {
        this.RESET_PSW_REQUEST_ID_IS_VALID = true;
        console.log('»»» »»» CHECK RESET PSW REQUEST ID - COMPLETE ');
        console.log('»»» »»» CHECK RESET PSW REQUEST ID - IS VALID REQUEST ID ', this.RESET_PSW_REQUEST_ID_IS_VALID);
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
        // Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
        Validators.minLength(6),
        Validators.maxLength(25),
      ]],
      'confirmPassword': ['', Validators.required]
      // Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
    },
      { validator: PasswordValidation.MatchPassword }
    );

    this.pswForm.valueChanges.subscribe((data) => this.onPswValueChanged(data));
    this.onPswValueChanged(); // reset validation messages
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

  dismissAlert() {
    console.log('DISMISS ALERT CLICKED')
    this.display = 'none';
  }

  dismissResetPswEmailSentAlert() {
    console.log('DISMISS RESET PSW EMAIL ALERT CLICKED')
    this.displayResetPswEmailSentAlert = 'none';
  }

  requestResetPsw() {
    this.showSpinnerInRequestNewPswBtn = true;
    console.log('REQUEST RESET PSW USER EMAIL ', this.emailForm.value['email']);

    this.resetPswService.sendResetPswEmailAndUpdateUserWithResetPswRequestId(this.emailForm.value['email']).subscribe((user) => {
      console.log('REQUEST RESET PSW - UPDATED USER ', user);

    },
      (error) => {
        this.HAS_REQUEST_NEW_PSW = false
        this.showSpinnerInRequestNewPswBtn = true;
        console.log('REQUEST RESET PSW - ERROR ', error);
        this.showSpinnerInRequestNewPswBtn = false;
        if (error.status === 0) {
          this.signin_errormsg = 'Sorry, there was an error connecting to the server'
          this.display = 'block';
        }
        // const signin_errorbody = JSON.parse(error._body);
        // console.log('SIGNIN ERROR BODY ', signin_errorbody)
        // this.signin_errormsg = signin_errorbody['msg']

      },
      () => {
        console.log('REQUEST RESET PSW - * COMPLETE *');
        setTimeout(() => {
          this.showSpinnerInRequestNewPswBtn = false;
          this.displayResetPswEmailSentAlert = 'block'
          this.HAS_REQUEST_NEW_PSW = true
        }, 300);

      });
  }

  resetPsw() {
    this.showSpinnerInResetPswBtn = true;
    console.log('RESET PSW - NEW PSW ', this.pswForm.value['password']);

    this.resetPswService.getUserByResetPswRequestIdAndResetPsw(this.resetPswRequestId, this.pswForm.value['password']).subscribe((user) => {
      console.log('RESET PSW - UPDATED USER ', user);

    },
      (error) => {
        console.log('RESET PSW - ERR ', error);
        this.showSpinnerInResetPswBtn = false;
      },
      () => {
        console.log('RESET PSW   * COMPLETE *');
        setTimeout(() => {
          this.showSpinnerInResetPswBtn = false;
          this.PSW_HAS_BEEN_CHANGED = true;
        }, 300);
      });
  }

  // goToLoginForm() {
  // }
  // onDigitCofirmPsw() {
  //   console.log('WRITING CONFIRM PSW - CONFIRM PSW LENGTH: ', this.pswForm.value['confirmPassword'].length);
  //   console.log('WRITING CONFIRM PSW - PSW LENGTH: ', this.pswForm.value['password'].length);
  //   if (this.pswForm.value['confirmPassword'] === this.pswForm.value['password']) {
  //     this.CONFIRM_PSW_IS_SAME_OF_PWS = true;
  //     console.log('CONFIRM PSW IS PSW ', this.CONFIRM_PSW_IS_SAME_OF_PWS);
  //   } else {
  //     this.CONFIRM_PSW_IS_SAME_OF_PWS = false;
  //     console.log('CONFIRM PSW IS PSW ', this.CONFIRM_PSW_IS_SAME_OF_PWS);
  //   }
  // }

}
