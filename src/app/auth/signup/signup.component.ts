import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';

import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import brand from 'assets/brand/brand.json';
type UserFields = 'email' | 'password' | 'firstName' | 'lastName' | 'terms';
type FormErrors = { [u in UserFields]: string };

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, AfterViewInit {

  // tparams = {value: 'world'};
  tparams = brand;

  companyLogoBlack_Url = brand.company_logo_black__url;
  companyLogoAllWithe_Url = brand.company_logo_allwhite__url;
  company_name = brand.company_name;
  company_site_url = brand.company_site_url;
  privacy_policy_link_text = brand.privacy_policy_link_text;
  terms_and_conditions_url = brand.terms_and_conditions_url;
  privacy_policy_url = brand.privacy_policy_url;
  display_terms_and_conditions_link = brand.signup_page.display_terms_and_conditions_link;
 

  showSpinnerInLoginBtn = false;
  public signin_errormsg = '';
  display = 'none';
  SKIP_WIZARD: boolean;
  currentLang: string;
  pendingInvitationEmail: string;

  hide_left_panel: boolean;
  bckgndImageSize = 60 + '%'

  userForm: FormGroup;
  // newUser = false; // to toggle login or signup form
  // passReset = false; // set to true when password reset is triggered
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
      'minlength': 'Password must be at least 6 characters long.',
      'maxlength': 'Password cannot be more than 25 characters long.',
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
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private translate: TranslateService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.buildForm();
    this.getBrowserLang();
    this.checkCurrentUrlAndSkipWizard()
  }

  getWindowWidthAndHeight() {
    console.log('SIGN-IN - ACTUAL INNER WIDTH ', window.innerWidth);
    console.log('SIGN-IN - ACTUAL INNER HEIGHT ', window.innerHeight);

    if( window.innerHeight <= 680) {

      this.bckgndImageSize = 50 + '%'
    } else {
      this.bckgndImageSize = 60 + '%'
    }


    if(window.innerWidth < 992) {

      this.hide_left_panel = true;
      console.log('SIGN-IN - ACTUAL INNER WIDTH hide_left_panel ',  this.hide_left_panel);
    } else {
      this.hide_left_panel = false;
      console.log('SIGN-IN - ACTUAL INNER WIDTH hide_left_panel ',  this.hide_left_panel);
    }
    
  }


  checkCurrentUrlAndSkipWizard() {
    console.log('SignupComponent checkCurrentUrlAndSkipWizard router.url  ', this.router.url)

    // (this.router.url === '/signup-on-invitation')
    if (this.router.url.indexOf('/signup-on-invitation') !== -1) {
      this.SKIP_WIZARD = true;
      console.log('SignupComponent checkCurrentUrlAndSkipWizard SKIP_WIZARD ', this.SKIP_WIZARD)
      this.getAndPatchInvitationEmail();
    } else {
      console.log('SignupComponent checkCurrentUrlAndSkipWizard SKIP_WIZARD ', this.SKIP_WIZARD)
      this.SKIP_WIZARD = false;

    }
  }

  getAndPatchInvitationEmail() {
    this.pendingInvitationEmail = this.route.snapshot.params['pendinginvitationemail'];

    this.userForm.patchValue({ 'email': this.pendingInvitationEmail })
    console.log('SignupComponent Pending Invitation Email (get From URL)  ', this.pendingInvitationEmail)
  }


  getBrowserLang() {
    const browserLang = this.translate.getBrowserLang();
    if (browserLang) {
      if (browserLang === 'it') {
        this.currentLang = 'it'
      } else {
        this.currentLang = browserLang
      }
    }
  }

  ngAfterViewInit() {
    const elemPswInput = <HTMLInputElement>document.getElementById('password');
    // console.log('ELEMENT INPUT PSW ', elemPswInput)
    const style = window.getComputedStyle(elemPswInput);
    // console.log('ELEMENT INPUT PSW STYLE', style)

    /**
     * THE HTML ELEMENT FOR INSERTING THE PASSWORD IS OF TEXT TYPE (instead of PASSWORD TYPE) TO AVOID THE CHROME SELF-COMPLETION
     * (e.g., "USE PASSWORD FOR"").
     * TO AVOID THAT THE TEXT INSERTED IN THE PASSWORD FIELD IS DISPLAYED AT ELEMEMT HAS BEEN SETTED THE STYLE
     * 'webkitTextSecurity' THAT HIDES THE USER INPUT.
     * HOWEVER THE STYLE 'webkitTextSecurity' IS NOT COMPATIPLE ON ALL THE BROWSER,
     * FOR WHETHER IF THE webkitTextSecurity STYLE THERE IS NOT, IS ADDED THE ATTRIBUTE PASSWORD TO THE FIELD
     */
    if (style['-webkitTextSecurity']) {
      console.log('ELEMENT INPUT PSW HAS STYLE webkitTextSecurity: YES')
    } else {
      console.log('ELEMENT INPUT PSW HAS STYLE webkitTextSecurity: FALSE')
      elemPswInput.setAttribute('type', 'password');
    }
  }

  signup() {
    this.showSpinnerInLoginBtn = true;

    this.auth.showExpiredSessionPopup(true);

    this.auth.signup(
      this.userForm.value['email'],
      this.userForm.value['password'],
      this.userForm.value['firstName'],
      this.userForm.value['lastName'])
      .subscribe((signupResponse) => {
        console.log('SIGNUP Email ', this.userForm.value['email']);
        console.log('SIGNUP Password ', this.userForm.value['password']);
        console.log('SIGNUP Firstname ', this.userForm.value['firstName']);
        console.log('SIGNUP Lastname ', this.userForm.value['lastName']);
        console.log('POST DATA ', signupResponse);
        if (signupResponse['success'] === true) {
          // this.router.navigate(['/welcome']);

          this.autoSignin();

        } else {
          console.log('SIGNUP ERROR CODE', signupResponse['code']);
          this.showSpinnerInLoginBtn = false;
          this.display = 'block';

          if (signupResponse['code'] === 11000) {
            if (this.currentLang === 'it') {
              this.signin_errormsg = `Un account con l'email ${this.userForm.value['email']} esiste già`;
            } else if (this.currentLang === 'en') {
              this.signin_errormsg = `An account with the email ${this.userForm.value['email']} already exist`;
            } else if (this.currentLang !== 'en' && this.currentLang !== 'it') {
              this.signin_errormsg = `An account with the email ${this.userForm.value['email']} already exist`;
            }
          } else {
            this.signin_errormsg = signupResponse['errmsg'];
          }
        }
      }, (error) => {

        console.log('CREATE NEW USER - POST REQUEST ERROR ', error);
        this.showSpinnerInLoginBtn = false;
        this.display = 'block';
        this.signin_errormsg = 'An error occurred while creating the account';
      }, () => {
        console.log('CREATE NEW USER  - POST REQUEST COMPLETE ');
      });
  }


  autoSignin() {
    // this.auth.emailLogin(
    const self = this;
    // this.auth.signin(this.userForm.value['email'], this.userForm.value['password'])
    //   .subscribe((error) => {
    this.auth.signin(this.userForm.value['email'], this.userForm.value['password'], function (error) {
      console.log('1. POST DATA ', error);
      // this.auth.user = signinResponse.user;
      // this.auth.user.token = signinResponse.token
      // console.log('SIGNIN TOKEN ', this.auth.user.token)
      // tslint:disable-next-line:no-debugger
      // debugger
      if (!error) {
        self.widgetReInit();
        /**
         * *** WIDGET - pass data to the widget function setTiledeskWidgetUser in index.html ***
         */
        const storedUser = localStorage.getItem('user')
        console.log('Signup - STORED USER  ', storedUser)
        if (storedUser !== null) {
          const _storedUser = JSON.parse(storedUser);
          console.log('SetTiledeskWidgetUserSignin (Signup) - userFullname', _storedUser.firstname + _storedUser.lastname)
          console.log('SetTiledeskWidgetUserSignin (Signup) - userEmail', _storedUser.email);
          console.log('SetTiledeskWidgetUserSignin (Signup) - userId', _storedUser._id);

          setTimeout(() => {
            try {
              window['setTiledeskWidgetUser'](_storedUser.firstname + ' ' + _storedUser.lastname, _storedUser.email, _storedUser._id);
            } catch (err) {
              console.log('SetTiledeskWidgetUser (Signup) - error', err);
            }
          }, 2000);
        }

        if (self.SKIP_WIZARD === false) {
          self.router.navigate(['/create-project']);
        } else {
          self.router.navigate(['/projects']);
        }

      } else {
        self.showSpinnerInLoginBtn = false;

        const signin_errorbody = JSON.parse(error._body)
        self.signin_errormsg = signin_errorbody['msg']
        self.display = 'block';
        // console.log('SIGNIN USER - POST REQUEST ERROR ', error);
        // console.log('SIGNIN USER - POST REQUEST BODY ERROR ', signin_errorbody);
        console.log('SIGNIN USER - POST REQUEST MSG ERROR ', self.signin_errormsg);
      }
      // tslint:disable-next-line:no-debugger
      // debugger
    });
  }

  widgetReInit() {
    if (window && window['tiledesk']) {
      console.log('SIGNUP PAGE ', window['tiledesk'])

      window['tiledesk'].reInit();
      // alert('signin reinit');
    }
  }
  

  // 'email': [{ value: '', disabled: true }, [
  buildForm() {
    this.userForm = this.fb.group({
      'email': ['', [
        Validators.required,
        // Validators.email,
        Validators.pattern(/^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/),
      ]],
      'password': ['', [
        // Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
        Validators.minLength(6),
        Validators.maxLength(25),
      ]],
      'displayName': ['', []
      ],
      'firstName': ['', [
        Validators.required,
      ]],
      'lastName': ['',
        [
          // Validators.required,
        ]],
      'terms': ['',
        [
          Validators.required,
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

 

  goToSigninPage() {
      this.router.navigate(['login']);
    }
  

  onChange($event) {
    const checkModel = $event.target.checked;
    console.log('CHECK MODEL ', checkModel)
  }



}
