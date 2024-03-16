import { Component, OnInit, HostListener, isDevMode } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AppConfigService } from '../../services/app-config.service';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { NotifyService } from '../../core/notify.service';

// import brand from 'assets/brand/brand.json';
import { BrandService } from '../../services/brand.service';
import { LoggerService } from '../../services/logger/logger.service';
import { LocalDbService } from 'app/services/users-local-db.service';

type UserFields = 'email' | 'password';
type FormErrors = { [u in UserFields]: string };


@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {

  EXIST_STORED_ROUTE: boolean = false
  storedRoute: string;
  companyLogo: string;
  companyLogoNoText: string;
  companyLogoAllWithe_Url: string;
  company_name: string;
  company_site_url: string;
  showSpinnerInLoginBtn = false;

  hide_left_panel: boolean;
  bckgndImageSize = 60 + '%'

  public signin_errormsg = '';
  public signin_error_statusZero: boolean;
  display = 'none';
  userForm: FormGroup;
  public_Key: string;
  SUP: boolean = true;
  isVisibleV1L: boolean = true;
  secondaryBrandColor: string;
  primaryBrandColor: string;
  hideGoogleAuthBtn: string;

  // newUser = false; // to toggle login or signup form
  // passReset = false; // set to true when password reset is triggered
  formErrors: FormErrors = {
    'email': '',
    'password': '',
  };
  validationMessages = {
    'email': {
      'required': 'Email is required.',
      'pattern': 'Email must be a valid email',
    },
    'password': {
      'required': 'Password is required.',
      'pattern': 'Password must be include at one letter and one number.',
      'minlength': 'Password must be at least 8 characters long.',
      'maxlength': 'Password cannot be more than 25 characters long.',
    },
  };

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    public appConfigService: AppConfigService,
    private notify: NotifyService,
    public brandService: BrandService,
    private logger: LoggerService,
    private localDbService: LocalDbService
  ) {
    const brand = brandService.getBrand();

    this.companyLogo = brand['BASE_LOGO'];
    this.companyLogoNoText = brand['BASE_LOGO_NO_TEXT'];
    this.company_name = brand['BRAND_NAME'];
    this.company_site_url = brand['COMPANY_SITE_URL'];
    this.secondaryBrandColor = brand['BRAND_SECONDARY_COLOR']; 
    this.primaryBrandColor = brand['BRAND_PRIMARY_COLOR'];
    this.hideGoogleAuthBtn = brand['display_google_auth_btn'];
  }

  ngOnInit() {
    // console.log('[SIGN-IN] ON INIT !!!! ')
    this.getOSCODE();
    // this.redirectIfLogged();
    // this.widgetReInit()
    // this.logger.log('xxxx ', this.userForm)
    this.buildForm();
    this.getWindowWidthAndHeight();
    this.getStoredRoute()
    // get if user has used Signin with Google
    const hasSigninWithGoogle = this.localDbService.getFromStorage('swg')
    if (hasSigninWithGoogle) {
      this.localDbService.removeFromStorage('swg')
      // console.log('[SIGN-IN] removeFromStorage swg')
    }
  }

  getStoredRoute() {
    this.storedRoute = this.localDbService.getFromStorage('wannago')
    this.logger.log('[SIGN-IN] storedRoute ', this.storedRoute)
    if (this.storedRoute) {
      this.EXIST_STORED_ROUTE = true
    } else {
      this.EXIST_STORED_ROUTE = false
    }
  }

  signinWithGoogle() {
    this.auth.siginWithGoogle()
  }

  redirectIfLogged() {
    const storedUser = localStorage.getItem('user')
    if (storedUser && !this.EXIST_STORED_ROUTE) {
      this.logger.log('[SIGN-IN] - REDIRECT TO DASHBORD IF USER IS LOGGED-IN - STORED USER', storedUser);
      this.router.navigate(['/projects']);
    } else if (storedUser && this.EXIST_STORED_ROUTE) {

      this.router.navigate([this.storedRoute]);
    }
  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    let keys = this.public_Key.split("-");
    // this.logger.log('PUBLIC-KEY (SIGN-IN) - public_Key keys', keys)
    keys.forEach(key => {
      if (key.includes("V1L")) {
        // this.logger.log('PUBLIC-KEY (SIGN-IN) - key', key);
        let v1l = key.split(":");
        // this.logger.log('PUBLIC-KEY (SIGN-IN) - v1l key&value', v1l);

        if (v1l[1] === "F") {
          this.isVisibleV1L = false;
          // this.logger.log('PUBLIC-KEY (SIGN-IN) - v1l isVisible', this.isVisibleV1L);
        } else {
          this.isVisibleV1L = true;
          // this.logger.log('PUBLIC-KEY (SIGN-IN) - v1l isVisible', this.isVisibleV1L);
        }
      }

      if (key.includes("SUP")) {
        // this.logger.log('PUBLIC-KEY (SIGN-IN) - key', key);
        let sup = key.split(":");
        // this.logger.log('PUBLIC-KEY (SIGN-IN) - sup key&value ', sup);

        if (sup[1] === "F") {
          this.SUP = false;
          // this.logger.log('PUBLIC-KEY (SIGN-IN) - sup is ', this.SUP);
        } else {
          this.SUP = true;
          // this.logger.log('PUBLIC-KEY (SIGN-IN) - sup is ', this.SUP);
        }
      }
      /* this generates bugs: the loop goes into the false until the "key" matches "V1L" */
      // else {
      //   this.isVisibleV1L = false;
      // }
    });

    if (!this.public_Key.includes("V1L")) {
      // this.logger.log('PUBLIC-KEY (SIGN-IN) - key.includes("V1L")', this.public_Key.includes("V1L"));
      this.isVisibleV1L = false;
    }

    if (!this.public_Key.includes("SUP")) {
      this.SUP = false;
      // this.logger.log('PUBLIC-KEY (SIGN-IN) - SUP is', this.SUP);
    }

  }


  getWindowWidthAndHeight() {
    this.logger.log('[SIGN-IN] - ACTUAL INNER WIDTH ', window.innerWidth);
    this.logger.log('[SIGN-IN] - ACTUAL INNER HEIGHT ', window.innerHeight);

    if (this.SUP === true) {
      if (window.innerHeight <= 680) {
        this.bckgndImageSize = 50 + '%'
      } else {
        this.bckgndImageSize = 60 + '%'
      }
    } else {
      this.bckgndImageSize = 80 + '%'
    }

    if (window.innerWidth < 992) {
      this.hide_left_panel = true;
      this.logger.log('[SIGN-IN]- ACTUAL INNER WIDTH hide_left_panel ', this.hide_left_panel);
    } else {
      this.hide_left_panel = false;
      this.logger.log('[SIGN-IN] - ACTUAL INNER WIDTH hide_left_panel ', this.hide_left_panel);
    }
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {

    const elemLeftPanelSignin = <HTMLElement>document.querySelector('.centered');
    // this.logger.log('SIGN-IN - ACTUAL INNER WIDTH elem Left Panel Signin div offsetTop ', elemLeftPanelSignin.getBoundingClientRect());
    // this.logger.log('SIGN-IN - NEW INNER WIDTH ', event.target.innerWidth);
    // this.logger.log('SIGN-IN - NEW INNER HEIGHT ', event.target.innerHeight);
    if (this.SUP === true) {
      if (event.target.innerHeight <= 680) {

        this.bckgndImageSize = 50 + '%'
      } else {
        this.bckgndImageSize = 60 + '%'
      }
    } else {
      this.bckgndImageSize = 80 + '%'
    }

    if (event.target.innerWidth < 992) {

      this.hide_left_panel = true;
      this.logger.log('[SIGN-IN] - NEW INNER WIDTH hide_left_panel ', this.hide_left_panel);
    } else {
      this.hide_left_panel = false;
      this.logger.log('[SIGN-IN] - NEW INNER WIDTH hide_left_panel ', this.hide_left_panel);
    }

  }


  buildForm() {
    this.userForm = this.fb.group({
      'email': ['', [
        Validators.required,
        // Validators.email,
        Validators.pattern(/^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/),
      ]],
      'password': ['', [
        // Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
        Validators.minLength(8),
        Validators.maxLength(4000),
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

    this.logger.log('[SIGN-IN] email ', this.userForm.value['email'])
    this.auth.signin(this.userForm.value['email'], this.userForm.value['password'], this.appConfigService.getConfig().SERVER_BASE_URL, (error, user) => {
      if (!error) {
        // this.localDbService.removeFromStorage('signedup')
        // console.log('[SIGN-IN] SSO (Signin) - user', user);
        // this.localDbService.removeFromStorage('hpea');
        if (!isDevMode()) {
          if (window['analytics']) {
            try {
              window['analytics'].page("Auth Page, Signin", {

              });
            } catch (err) {
              this.logger.error('Signin page error', err);
            }

            let userFullname = ''
            if (user.firstname && user.lastname) {
              userFullname = user.firstname + ' ' + user.lastname
            } else if (user.firstname && !user.lastname) {
              userFullname = user.firstname
            }

            try {
              window['analytics'].identify(user._id, {
                name: userFullname,
                email: user.email,
                logins: 5,

              });
            } catch (err) {
              this.logger.error('identify signin event error', err);
            }
            // Segments
            try {
              window['analytics'].track('Signed In', {
                "username": userFullname,
                "userId": user._id,
                'button': 'Login',
                'method': "Email and Password"
              });
            } catch (err) {
              this.logger.error('track signin event error', err);
            }
          }
        }

        if (!this.EXIST_STORED_ROUTE) {
          this.router.navigate(['/projects']);
        } else {
          this.router.navigate([this.storedRoute]);
        }



        // --------------------------------------------
        // Run widget login
        // --------------------------------------------
        if (window && window['tiledesk_widget_login']) {
          window['tiledesk_widget_login']();
        }


      } else {
        this.showSpinnerInLoginBtn = false;
        // console.error('[SIGN-IN] 1. POST DATA ERROR', error);
        self.logger.error('[SIGN-IN] 2. POST DATA ERROR status', error.status);

        if (error.status === 0) {

          this.display = 'block';
          this.signin_errormsg = 'Sorry, there was an error connecting to the server'
          this.notify.showToast(self.signin_errormsg, 4, 'report_problem')
        } else {


          // this.logger.log('SIGNIN USER - POST REQUEST ERROR ', error);
          // this.logger.log('SIGNIN USER - POST REQUEST BODY ERROR ', signin_errorbody);
          // console.log('[SIGN-IN] SIGNIN USER - POST REQUEST MSG ERROR ', self.signin_errormsg);

          if (error.status !== 401) {
            this.display = 'block';

            this.signin_errormsg = error['error']['msg']

            self.notify.showToast(self.signin_errormsg, 4, 'report_problem')

          } else if (error.status === 401) {

            self.signinV2()

          }
        }
      }
      // tslint:disable-next-line:no-debugger
      // debugger
    });
  }


  signinV2() {
    const self = this;
    this.auth.signin(this.userForm.value['email'], this.userForm.value['password'], 'https://api.tiledesk.com/v2/', (error, user) => {
      if (!error) {
        // console.log('[SIGN-IN] IN V2 (Signin) - user', user);
        const url = "https://console.tiledesk.com/v2/dashboard/#/projects?token=" + user.token;
        window.open(url, '_self');
      } else {
        this.showSpinnerInLoginBtn = false;
        this.logger.error('[SIGN-IN] IN V2  1. POST DATA ERROR', error);
        self.logger.error('[SIGN-IN] 2. POST DATA ERROR status', error.status);

        if (error.status === 0) {

          this.display = 'block';
          this.signin_errormsg = 'Sorry, there was an error connecting to the server'
          this.notify.showToast(self.signin_errormsg, 4, 'report_problem')
        } else {
          this.display = 'block';

          this.signin_errormsg = error['error']['msg']
          this.notify.showToast(self.signin_errormsg, 4, 'report_problem')
          // this.logger.log('SIGNIN USER - POST REQUEST ERROR ', error);
          // this.logger.log('SIGNIN USER - POST REQUEST BODY ERROR ', signin_errorbody);
          // console.log('[SIGN-IN] SIGNIN USER - POST REQUEST MSG ERROR ', self.signin_errormsg);

        }
      }
      // tslint:disable-next-line:no-debugger
      // debugger
    });

  }

  widgetReInit() {
    if (window && window['tiledesk']) {
      this.logger.log('[SIGN-IN] SIGNIN PAGE ', window['tiledesk'])

      window['tiledesk'].reInit();
      // alert('signin reinit');
    }
  }

  dismissAlert() {
    this.logger.log('[SIGN-IN] DISMISS ALERT CLICKED')
    this.display = 'none';
  }

  goToTileDeskDotCom() {
    // const url = 'http://tiledesk.com/'
    const url = this.company_site_url;
    window.open(url);
    // , '_blank'
  }

  goToResetPsw() {
    this.logger.log('[SIGN-IN] HAS CLICKED FORGOT PWS ');
    this.router.navigate(['forgotpsw']);
  }

  goToSignup() {
    this.router.navigate(['signup']);
  }

  goToCompanySite() {
    const url = this.company_site_url;
    window.open(url, '_blank');
  }

  // goToSignupPage() {
  //   this.router.navigate(['signup']);
  // }
  goToSignupPage() {
    const storedUser = localStorage.getItem('user');
    this.logger.log('[SIGN-IN] GO TO SIGNUP PAGE STORED USER ', storedUser)
    if (storedUser) {
      // localStorage.removeItem('user')
      this.auth.signOut('signin');
    }
    this.router.navigate(['signup']);
  }



  goToTiledekV1() {
    const url = "https://support.tiledesk.com/dashboard/#/login";
    window.open(url);
  }


}
