import { Component, OnInit, HostListener } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';

import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import brand from 'assets/brand/brand.json';
type UserFields = 'email' | 'password';
type FormErrors = { [u in UserFields]: string };


@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {
  companyLogoBlack_Url = brand.company_logo_black__url;
  company_name = brand.company_name;
  company_site_url = brand.company_site_url;
  showSpinnerInLoginBtn = false;

  hide_left_panel: boolean;

  public signin_errormsg = '';
  public signin_error_statusZero: boolean;
  display = 'none';

  userForm: FormGroup;
  // newUser = false; // to toggle login or signup form
  // passReset = false; // set to true when password reset is triggered
  formErrors: FormErrors = {
    'email': '',
    'password': '',
  };
  validationMessages = {
    'email': {
      'required': 'Email is required.',
      'email': 'Email must be a valid email',
    },
    'password': {
      'required': 'Password is required.',
      'pattern': 'Password must be include at one letter and one number.',
      'minlength': 'Password must be at least 6 characters long.',
      'maxlength': 'Password cannot be more than 25 characters long.',
    },
  };

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) { }

  ngOnInit() {

    // this.widgetReInit()


    // console.log('xxxx ', this.userForm)
    this.buildForm();
    this.getWindowWidth();
    // const x = document.getElementsByTagName('input');
    // console.log('XX ', x)
    // for (let i = 0; i <= x.length - 1; i++) {
    //   if (x.item(i).type !== 'button') {
    //     x.item(i).value = '';
    //   }
    // }

  }
  getWindowWidth() {
    console.log('SIGNUP - ACTUAL INNER WIDTH ', window.innerWidth);
    if(window.innerWidth < 992) {

      this.hide_left_panel = true;
      console.log('SIGNUP - ACTUAL INNER WIDTH hide_left_panel ',  this.hide_left_panel);
    } else {
      this.hide_left_panel = false;
      console.log('SIGNUP - ACTUAL INNER WIDTH hide_left_panel ',  this.hide_left_panel);
    }
    
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {

    console.log('SIGNUP - NEW INNER WIDTH ', event.target.innerWidth);

    if (event.target.innerWidth < 992) {
      
      this.hide_left_panel = true;
      console.log('SIGNUP - NEW INNER WIDTH hide_left_panel ',  this.hide_left_panel);
    } else {
      this.hide_left_panel = false;
      console.log('SIGNUP - NEW INNER WIDTH hide_left_panel ',  this.hide_left_panel);
    }

  }


  buildForm() {
    this.userForm = this.fb.group({
      'email': ['', [
        Validators.required,
        Validators.email,
      ]],
      'password': ['', [
        // Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
        Validators.minLength(6),
        Validators.maxLength(25),
      ]],
    });

    this.userForm.valueChanges.subscribe((data) => this.onValueChanged(data));
    this.onValueChanged(); // reset validation messages
  }

  // Updates validation state on form changes.
  onValueChanged(data?: any) {
    if (!this.userForm) { return; }
    const form = this.userForm;
    for (const field in this.formErrors) {
      // tslint:disable-next-line:max-line-length
      if (Object.prototype.hasOwnProperty.call(this.formErrors, field) && (field === 'email' || field === 'password')) {
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

  signin() {
    this.showSpinnerInLoginBtn = true;

    this.auth.showExpiredSessionPopup(true);
    // this.auth.emailLogin(
    const self = this;
    // this.auth.signin(this.userForm.value['email'], this.userForm.value['password'])
    //   .subscribe((error) => {
    console.log('SIGNIN email ', this.userForm.value['email'])
    this.auth.signin(this.userForm.value['email'], this.userForm.value['password'], function (error, user) {


      // this.auth.user = signinResponse.user;
      // this.auth.user.token = signinResponse.token
      // console.log('SIGNIN TOKEN ', this.auth.user.token)
      // tslint:disable-next-line:no-debugger
      // debugger
      if (!error) {
        self.router.navigate(['/projects']);

        self.widgetReInit();

        /**
         * *** WIDGET - pass data to the widget function setTiledeskWidgetUser in index.html ***
         */
        console.log('SetTiledeskWidgetUserSignin (Signin) - userFullname', user.firstname + ' ' + user.lastname)
        console.log('SetTiledeskWidgetUserSignin (Signin) - userEmail', user.email);
        console.log('SetTiledeskWidgetUserSignin (Signin) - userId', user._id);

        setTimeout(() => {
          try {
            window['setTiledeskWidgetUser'](user.firstname + ' ' + user.lastname, user.email, user._id);
          } catch (err) {
            console.log('SetTiledeskWidgetUserSignin (Signin) error', err);
          }
        }, 2000);


      } else {
        self.showSpinnerInLoginBtn = false;
        console.log('1. POST DATA ERROR', error);
        console.log('2. POST DATA ERROR status', error.status);

        if (error.status === 0) {

          self.display = 'block';
          self.signin_errormsg = 'Sorry, there was an error connecting to the server'
        } else {
          self.display = 'block';
          // if ( )
          const signin_errorbody = JSON.parse(error._body)
          console.log('SIGNIN ERROR BODY ', signin_errorbody)
          self.signin_errormsg = signin_errorbody['msg']

          // console.log('SIGNIN USER - POST REQUEST ERROR ', error);
          // console.log('SIGNIN USER - POST REQUEST BODY ERROR ', signin_errorbody);
          console.log('SIGNIN USER - POST REQUEST MSG ERROR ', self.signin_errormsg);
        }
      }
      // tslint:disable-next-line:no-debugger
      // debugger
    });

  }

  widgetReInit() {
    if (window && window['tiledesk']) {
      console.log('SIGNIN PAGE ', window['tiledesk'])

      window['tiledesk'].reInit();
      // alert('signin reinit');
    }
  }

  dismissAlert() {
    console.log('DISMISS ALERT CLICKED')
    this.display = 'none';
  }

  goToTileDeskDotCom() {
    // const url = 'http://tiledesk.com/'
    const url = this.company_site_url;
    window.open(url);
    // , '_blank'
  }

  goToResetPsw() {
    console.log('HAS CLICKED FORGOT PWS ');
    this.router.navigate(['forgotpsw']);
  }

  goToSignupPage() {
    this.router.navigate(['signup']);
  }
}
