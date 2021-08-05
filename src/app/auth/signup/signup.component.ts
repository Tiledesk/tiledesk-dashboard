import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { NotifyService } from '../../core/notify.service';
import { AppConfigService } from '../../services/app-config.service';

// import brand from 'assets/brand/brand.json';
import { BrandService } from '../../services/brand.service';
import { LoggerService } from '../../services/logger/logger.service';


type UserFields = 'email' | 'password' | 'firstName' | 'lastName' | 'terms';
type FormErrors = { [u in UserFields]: string };

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, AfterViewInit {


  // tparams = brand;
  // companyLogoBlack_Url = brand.company_logo_black__url;
  // companyLogoAllWithe_Url = brand.company_logo_allwhite__url;
  // company_name = brand.company_name;
  // company_site_url = brand.company_site_url;
  // privacy_policy_link_text = brand.privacy_policy_link_text;
  // terms_and_conditions_url = brand.terms_and_conditions_url;
  // privacy_policy_url = brand.privacy_policy_url;
  // display_terms_and_conditions_link = brand.signup_page.display_terms_and_conditions_link;


  tparams: any;
  companyLogoBlack_Url: string;
  companyLogoAllWithe_Url: string;
  company_name: string;
  company_site_url: string;
  privacy_policy_link_text: string;
  terms_and_conditions_url: string;
  privacy_policy_url: string;
  display_terms_and_conditions_link: boolean;


  showSpinnerInLoginBtn = false;
  public signin_errormsg = '';
  display = 'none';
  SKIP_WIZARD: boolean;
  currentLang: string;
  pendingInvitationEmail: string;

  hide_left_panel: boolean;
  bckgndImageSize = 60 + '%'

  public_Key: string;
  MT: boolean;
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
    private route: ActivatedRoute,
    private notify: NotifyService,
    public appConfigService: AppConfigService,
    public brandService: BrandService,
    private logger: LoggerService
  ) {

    const brand = brandService.getBrand();

    this.tparams = brand;
    this.companyLogoBlack_Url = brand['company_logo_black__url'];
    this.companyLogoAllWithe_Url = brand['company_logo_allwhite__url'];
    this.company_name = brand['company_name'];
    this.company_site_url = brand['company_site_url'];
    this.privacy_policy_link_text = brand['privacy_policy_link_text'];
    this.terms_and_conditions_url = brand['terms_and_conditions_url'];
    this.privacy_policy_url = brand['privacy_policy_url'];
    this.display_terms_and_conditions_link = brand['signup_page'].display_terms_and_conditions_link;
  }

  ngOnInit() {
    this.redirectIfLogged();
    this.buildForm();
    this.getBrowserLang();

    this.getOSCODE();
  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    // this.logger.log('AppConfigService getAppConfig (SIGNUP) public_Key', this.public_Key)
    // this.logger.log('NavbarComponent public_Key', this.public_Key)

    let keys = this.public_Key.split("-");
    // this.logger.log('PUBLIC-KEY (SIGNUP) - public_Key keys', keys)

    // this.logger.log('PUBLIC-KEY (SIGNUP) - public_Key Arry includes MTT', this.public_Key.includes("MTT"));

    if (this.public_Key.includes("MTT") === true) {

      keys.forEach(key => {
        // this.logger.log('NavbarComponent public_Key key', key)
        if (key.includes("MTT")) {
          // this.logger.log('PUBLIC-KEY (SIGNUP) - key', key);
          let mt = key.split(":");
          // this.logger.log('PUBLIC-KEY (SIGNUP) - mt key&value', mt);
          if (mt[1] === "F") {
            this.MT = false;
            // this.logger.log('PUBLIC-KEY (SIGNUP) - mt is', this.MT);
          } else {
            this.MT = true;
            // this.logger.log('PUBLIC-KEY (SIGNUP) - mt is', this.MT);
          }
        }
      });

    } else {
      this.MT = false;
      // this.logger.log('PUBLIC-KEY (SIGNUP) - mt is', this.MT);
    }

    this.checkCurrentUrlAndSkipWizard();
  }

  redirectIfLogged() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.logger.log('[SIGN-UP] - REDIRECT TO DASHBORD IF USER IS LOGGED-IN - STORED USER', storedUser);
      this.router.navigate(['/projects']);
    }
  }

  getWindowWidthAndHeight() {
    this.logger.log('[SIGN-UP] - ACTUAL INNER WIDTH ', window.innerWidth);
    this.logger.log('[SIGN-UP] - ACTUAL INNER HEIGHT ', window.innerHeight);

    if (window.innerHeight <= 680) {
      this.bckgndImageSize = 50 + '%'
    } else {
      this.bckgndImageSize = 60 + '%'
    }


    if (window.innerWidth < 992) {
      this.hide_left_panel = true;
      this.logger.log('[SIGN-UP] - ACTUAL INNER WIDTH hide_left_panel ', this.hide_left_panel);
    } else {
      this.hide_left_panel = false;
      this.logger.log('[SIGN-UP] - ACTUAL INNER WIDTH hide_left_panel ', this.hide_left_panel);
    }

  }


  checkCurrentUrlAndSkipWizard() {
    this.logger.log('[SIGN-UP] checkCurrentUrlAndSkipWizard router.url  ', this.router.url)

    // (this.router.url === '/signup-on-invitation')
    if (this.router.url.indexOf('/signup-on-invitation') !== -1) {
      this.SKIP_WIZARD = true;
      this.logger.log('[SIGN-UP] checkCurrentUrlAndSkipWizard SKIP_WIZARD ', this.SKIP_WIZARD)
      this.getAndPatchInvitationEmail();

    } else if (this.router.url.indexOf('/signup-on-invitation') === -1 && this.MT === false) {

      this.SKIP_WIZARD = true;
      this.logger.log('[SIGN-UP]checkCurrentUrlAndSkipWizard SKIP_WIZARD ', this.SKIP_WIZARD)
    }
    else if (this.router.url.indexOf('/signup-on-invitation') === -1 && this.MT === true) {

      this.SKIP_WIZARD = false;
      this.logger.log('[SIGN-UP] checkCurrentUrlAndSkipWizard SKIP_WIZARD ', this.SKIP_WIZARD)
    }
  }

  getAndPatchInvitationEmail() {
    this.pendingInvitationEmail = this.route.snapshot.params['pendinginvitationemail'];

    this.userForm.patchValue({ 'email': this.pendingInvitationEmail })
    this.logger.log('[SIGN-UP] Pending Invitation Email (get From URL)  ', this.pendingInvitationEmail)
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
    // this.logger.log('ELEMENT INPUT PSW ', elemPswInput)
    const style = window.getComputedStyle(elemPswInput);
    // this.logger.log('ELEMENT INPUT PSW STYLE', style)

    /**
     * THE HTML ELEMENT FOR INSERTING THE PASSWORD IS OF TEXT TYPE (instead of PASSWORD TYPE) TO AVOID THE CHROME SELF-COMPLETION
     * (e.g., "USE PASSWORD FOR"").
     * TO AVOID THAT THE TEXT INSERTED IN THE PASSWORD FIELD IS DISPLAYED AT ELEMEMT HAS BEEN SETTED THE STYLE
     * 'webkitTextSecurity' THAT HIDES THE USER INPUT.
     * HOWEVER THE STYLE 'webkitTextSecurity' IS NOT COMPATIPLE ON ALL THE BROWSER,
     * FOR WHETHER IF THE webkitTextSecurity STYLE THERE IS NOT, IS ADDED THE ATTRIBUTE PASSWORD TO THE FIELD
     */
    if (style['-webkitTextSecurity']) {
      this.logger.log('[SIGN-UP] ngAfterViewInit ELEMENT INPUT PSW HAS STYLE webkitTextSecurity: YES')
    } else {
      this.logger.log('[SIGN-UP] ngAfterViewInit ELEMENT INPUT PSW HAS STYLE webkitTextSecurity: FALSE')
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
        this.logger.log('[SIGN-UP] Email ', this.userForm.value['email']);
        this.logger.log('[SIGN-UP] Password ', this.userForm.value['password']);
        this.logger.log('[SIGN-UP] Firstname ', this.userForm.value['firstName']);
        this.logger.log('[SIGN-UP] Lastname ', this.userForm.value['lastName']);
        this.logger.log('[SIGN-UP] POST DATA ', signupResponse);
        if (signupResponse['success'] === true) {
          // this.router.navigate(['/welcome']);
          this.logger.log('[SIGN-UP] RES ', signupResponse);
          const userEmail = signupResponse.user.email
          this.logger.log('[SIGN-UP] RES USER EMAIL ', userEmail);
          this.autoSignin(userEmail);

        } else {
          this.logger.error('[SIGN-UP] ERROR CODE', signupResponse['code']);
          this.showSpinnerInLoginBtn = false;
          this.display = 'block';

          if (signupResponse['code'] === 11000) {
            if (this.currentLang === 'it') {
              this.signin_errormsg = `Un account con l'email ${this.userForm.value['email']} esiste già`;

              this.notify.showToast(this.signin_errormsg, 4, 'report_problem')
            } else if (this.currentLang === 'en') {
              this.signin_errormsg = `An account with the email ${this.userForm.value['email']} already exist`;
              this.notify.showToast(this.signin_errormsg, 4, 'report_problem')

            } else if (this.currentLang !== 'en' && this.currentLang !== 'it') {
              this.signin_errormsg = `An account with the email ${this.userForm.value['email']} already exist`;
              this.notify.showToast(this.signin_errormsg, 4, 'report_problem')

            }
          } else {
            this.signin_errormsg = signupResponse['errmsg'];
            this.notify.showToast(this.signin_errormsg, 4, 'report_problem')
          }
        }
      }, (error) => {

        this.logger.error('[SIGN-UP] CREATE NEW USER - POST REQUEST ERROR ', error);
        this.showSpinnerInLoginBtn = false;
        this.display = 'block';
        // const errorObj = JSON.parse(error);
        this.logger.error('[SIGN-UP] CREATE NEW USER - POST REQUEST ERROR STATUS', error.status);
        
        if (error.status === 422) {
          this.signin_errormsg = 'Form validation error. Please fill in every fields.';
          this.notify.showToast(this.signin_errormsg, 4, 'report_problem')

        } else {
          this.signin_errormsg = 'An error occurred while creating the account';
          this.notify.showToast(this.signin_errormsg, 4, 'report_problem')
        }
      }, () => {
        this.logger.log('[SIGN-UP] CREATE NEW USER  - POST REQUEST COMPLETE ');
      });
  }


  autoSignin(userEmail: string) {
    // this.auth.emailLogin(
    const self = this;
    // this.auth.signin(this.userForm.value['email'], this.userForm.value['password'])
    //   .subscribe((error) => {
    this.auth.signin(userEmail, this.userForm.value['password'], function (error) {
      self.logger.log('[SIGN-UP] autoSignin 1. POST DATA ', error);
      // this.auth.user = signinResponse.user;
      // this.auth.user.token = signinResponse.token
      // this.logger.log('SIGNIN TOKEN ', this.auth.user.token)
      // tslint:disable-next-line:no-debugger
      // debugger
      if (!error) {
        self.widgetReInit();
        /**
         * *** WIDGET - pass data to the widget method setTiledeskWidgetUser in index.html ***
         */
        const storedUser = localStorage.getItem('user')
        self.logger.log('Signup - STORED USER  ', storedUser)
        if (storedUser !== null) {
          const _storedUser = JSON.parse(storedUser);
          self.logger.log('[SIGN-UP] autoSignin SetTiledeskWidgetUserSignin (Signup) - userFullname', _storedUser.firstname + _storedUser.lastname)
          self.logger.log('[SIGN-UP] autoSignin SetTiledeskWidgetUserSignin (Signup) - userEmail', _storedUser.email);
          self.logger.log('[SIGN-UP] autoSignin SetTiledeskWidgetUserSignin (Signup) - userId', _storedUser._id);

          setTimeout(() => {
            try {
              window['[SIGN-UP] setTiledeskWidgetUser'](_storedUser.firstname + ' ' + _storedUser.lastname, _storedUser.email, _storedUser._id);
            } catch (err) {
              self.logger.error('[SIGN-UP] SetTiledeskWidgetUser (Signup) - error', err);
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
        // this.logger.log('SIGNIN USER - POST REQUEST ERROR ', error);
        // this.logger.log('SIGNIN USER - POST REQUEST BODY ERROR ', signin_errorbody);
        self.logger.error('[SIGN-UP] SIGNIN USER - POST REQUEST MSG ERROR ', self.signin_errormsg);
      }
      // tslint:disable-next-line:no-debugger
      // debugger
    });
  }

  widgetReInit() {
    if (window && window['tiledesk']) {
      this.logger.log('[SIGN-UP] widgetReInit ', window['tiledesk'])

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
        Validators.maxLength(4000),
      ]],
      'displayName': ['', []
      ],
      'firstName': ['', [
        Validators.required,
      ]],
      'lastName': ['',
        [
          Validators.required,
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
    this.logger.log('[SIGN-UP] DISMISS ALERT CLICKED')
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
    this.logger.log('[SIGN-UP] CHECK MODEL ', checkModel)
  }



}
