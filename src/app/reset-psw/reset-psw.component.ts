import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';

import { ActivatedRoute } from '@angular/router';
import { ResetPswService } from '../services/reset-psw.service';
import { Location } from '@angular/common';

type EmailField = 'email';
type EmailFormErrors = { [u in EmailField]: string };

type PswFields = 'password';
type PswFormErrors = { [u in PswFields]: string };

@Component({
  selector: 'appdashboard-reset-psw',
  templateUrl: './reset-psw.component.html',
  styleUrls: ['./reset-psw.component.scss']
})
export class ResetPswComponent implements OnInit {

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
  };
  paswvalidationMessages = {
    'password': {
      'required': 'Password is required.',
      'pattern': 'Password must be include at one letter and one number.',
      'minlength': 'Password must be at least 6 characters long.',
      'maxlength': 'Password cannot be more than 25 characters long.',
    },
  };

  public signin_errormsg = '';
  display = 'none';
  showSpinnerInLoginBtn = false;
  displayResetPswEmailSentAlert = 'none';
  resetPswRequestId: string;
  route: string;
  IS_RESET_PSW_ROUTE: boolean;

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
        console.log('»> »> RESET PSW - IS RESET PSW PAGE »> »> ', this.IS_RESET_PSW_ROUTE);
      }
    }
  }

  getResetPswRequestId() {
    this.resetPswRequestId = this.activetedRoute.snapshot.params['resetpswrequestid'];
    console.log('»»» »»» RESET PSW - ID OF THE REQUEST FOR RESET THE PSW ', this.resetPswRequestId);
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
    });

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
      if (Object.prototype.hasOwnProperty.call(this.pswformErrors, field) && (field === 'password')) {
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

  pswResetRequest() {
    this.showSpinnerInLoginBtn = true;
    console.log('RESET PSW USER EMAIL ', this.emailForm.value['email']);

    this.resetPswService.resetPswRequest(this.emailForm.value['email']).subscribe((user) => {
      console.log('RESET PSW - UPDATED USER ', user);

    },
      (error) => {
        this.showSpinnerInLoginBtn = true;
        console.log('RESET PSW - ERROR ', error);
        this.showSpinnerInLoginBtn = false;
        if (error.status === 0) {
          this.signin_errormsg = 'Sorry, there was an error connecting to the server'
          this.display = 'block';
        }
        // const signin_errorbody = JSON.parse(error._body);
        // console.log('SIGNIN ERROR BODY ', signin_errorbody)
        // this.signin_errormsg = signin_errorbody['msg']

      },
      () => {
        console.log('RESET PSW - * COMPLETE *');
        setTimeout(() => {
          this.showSpinnerInLoginBtn = false;
          this.displayResetPswEmailSentAlert = 'block'
        }, 300);

      });


  }

}
