import { Component, OnInit, AfterViewInit, isDevMode, ViewChild, ElementRef } from '@angular/core';
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
import moment from 'moment';
import { LocalDbService } from 'app/services/users-local-db.service';
import { ProjectService } from 'app/services/project.service';
import { Project } from 'app/models/project-model';
import { emailDomainWhiteList, tranlatedLanguage } from 'app/utils/util';
import { TitleCasePipe } from '@angular/common';
declare const grecaptcha: any;
import { WidgetSetUpBaseComponent } from 'app/widget_components/widget-set-up/widget-set-up-base/widget-set-up-base.component';
import { WidgetService } from 'app/services/widget.service';
import { UsersService } from 'app/services/users.service';

type UserFields = 'email' | 'password' | 'firstName' | 'lastName' | 'terms';
type FormErrors = { [u in UserFields]: string };

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  providers: [TitleCasePipe]
})

export class SignupComponent extends WidgetSetUpBaseComponent implements OnInit, AfterViewInit {
  @ViewChild('recaptcha', { static: false }) el: ElementRef;

  tparams: any;
  companyLogo: string;
  companyLogoNoText: string;
  secondaryBrandColor: string;
  primaryBrandColor: string;
  companyLogoPlanet: string;
  company_name: string;
  company_site_url: string;
  privacy_policy_link_text: string;
  terms_and_conditions_url: string;
  privacy_policy_url: string;
  display_terms_and_conditions_link: boolean;
  queryParams: any;

  showSpinnerInLoginBtn = false;
  public signin_errormsg = '';
  display = 'none';
  SKIP_WIZARD: boolean;
  currentLang: string;
  pendingInvitationEmail: string;

  hide_left_panel: boolean;
  bckgndImageSize = 60 + '%'
  EXIST_STORED_ROUTE: boolean = false
  storedRoute: string;

  public_Key: string;
  reCaptchaSiteKey: string;
  areActivePay: boolean;
  MT: boolean;

  templateName: string;
  strongPassword = false;
  userForm: FormGroup;
  isVisiblePsw: boolean = false
  isVisiblePwsStrengthBar: boolean = false;

  // @ create project on signup
  new_project: any;
  project_name: string;
  id_project: string;
  appSumoActivationEmail: string;
  isValidAppSumoActivationEmail: boolean;

  browser_lang: string;
  temp_SelectedLangName: string;
  temp_SelectedLangCode: string;
  selectedTranslationLabel: string;
  selectedTranslationCode: string;
  displaySocialProofContainer: string;
  hideGoogleAuthBtn: string;
  USER_ROLE: string;

  // newUser = false; // to toggle login or signup form
  // passReset = false; // set to true when password reset is triggered
  // 'maxlength': 'Password cannot be more than 25 characters long.',
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
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    public translate: TranslateService,
    private route: ActivatedRoute,
    private notify: NotifyService,
    public appConfigService: AppConfigService,
    public brandService: BrandService,
    private logger: LoggerService,
    private localDbService: LocalDbService,
    private projectService: ProjectService,
    public titleCasePipe: TitleCasePipe,
    private widgetService: WidgetService,
    private usersService: UsersService
  ) {
    super(translate);
    const brand = brandService.getBrand();
    // this.logger.log('>>> BRAND ' , brand) 

    this.tparams = brand;
    this.companyLogo = brand['BASE_LOGO'];
    this.companyLogoNoText = brand['BASE_LOGO_NO_TEXT'];
    this.secondaryBrandColor = brand['BRAND_SECONDARY_COLOR'];
    this.primaryBrandColor = brand['BRAND_PRIMARY_COLOR'];
    this.companyLogoPlanet = brand['COMPANY_LOGO_PLANET'];
    this.company_name = brand['BRAND_NAME'];
    this.company_site_url = brand['COMPANY_SITE_URL'];
    this.privacy_policy_link_text = brand['privacy_policy_link_text'];
    this.terms_and_conditions_url = brand['terms_and_conditions_url'];
    this.privacy_policy_url = brand['privacy_policy_url'];
    this.display_terms_and_conditions_link = brand['signup_page'].display_terms_and_conditions_link;
    this.displaySocialProofContainer = brand['signup_page'].display_social_proof_container;
    this.hideGoogleAuthBtn = brand['display_google_auth_btn'];
  }

  ngOnInit() {
    this.redirectIfLogged();
    this.buildForm();
    this.getBrowserLang();
    this.getOSCODE();
    this.getQueryParamsAndSegmentRecordPageAndIdentify();
    this.getReCaptchaSiteKey()
    this.getUserRole()

    const hasSigninWithGoogle = this.localDbService.getFromStorage('swg')
    if (hasSigninWithGoogle) {
      this.localDbService.removeFromStorage('swg')
      // this.logger.log('[SIGN-UP] removeFromStorage swg')
    }
  }

  getUserRole() {
    this.usersService.project_user_role_bs
      .subscribe((userRole) => {
        this.logger.log('[SIGN-UP] - $UBSCRIPTION TO USER ROLE »»» ', userRole)
        this.USER_ROLE = userRole;
      })
  }

  ngAfterViewInit() {
    const elemPswInput = <HTMLInputElement>document.getElementById('signup-password');
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


  // 
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
        Validators.maxLength(512),
        Validators.minLength(8),
        Validators.required,

      ]],
      'displayName': ['', []],
      'firstName': ['', []],
      'lastName': [' ', []],
      'terms': ['', [Validators.required,]],
    });
    this.userForm.valueChanges.subscribe((data) => this.onValueChanged(data));
    this.onValueChanged(); // reset validation messages
  }

  // Updates validation state on form changes.
  onValueChanged(data?: any) {
    if (!this.userForm) {
      return;
    }
    const form = this.userForm;

    // this.logger.log('[SIGN-UP] onValueChanged  data', data)
    // if (data) {
    //   let elemPswInput = <HTMLInputElement>document.getElementById('signup-password')
    //   this.logger.log('[SIGN-UP] onValueChanged  data password length (1)', data.password.length)
    //   if (data.password.length >= 0) {
    //     this.logger.log('[SIGN-UP] onValueChanged  data password length (2)', data.password.length)
    //     // document.getElementById("password")

    //     elemPswInput.setAttribute("type", "text");
    //     elemPswInput.classList.add("secure");
    //   }
    //   // else if ( data.password.length == 0) {
    //   //   this.logger.log('[SIGN-UP] onValueChanged  data password length (3)', data.password.length)
    //   //   elemPswInput.setAttribute("type", "password");
    //   //   elemPswInput.classList.remove("secure");
    //   // }
    // }

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



  getQueryParamsAndSegmentRecordPageAndIdentify() {
    this.route.queryParamMap
      .subscribe(params => {
        this.logger.log('[SIGN-UP] queryParams', params['params']);
        this.queryParams = params['params']
        this.logger.log('segmentsPageAndIdentify queryParams', this.queryParams)
        var size = Object.keys(this.queryParams).length;
        // this.logger.log('queryParams size ', size)
        const storedRoute = this.localDbService.getFromStorage('wannago')
        // this.logger.log('[SIGN-UP] storedRoute', storedRoute)
        if (size > 0) {

          for (const [key, value] of Object.entries(this.queryParams)) {
            this.logger.log(`${key}: ${value}`);
            this.segmentRecordPageAndIdentify(key + '=' + value)
          }

        } else if (size === 0 && storedRoute) {

          let storedRouteSegments = storedRoute.split('/')

          // this.logger.log('[SIGN-UP] storedRouteSegments', storedRouteSegments)
          let secondStoredRouteSegment = storedRouteSegments[2]
          // this.logger.log('[SIGN-UP] secondStoredRouteSegment', storedRouteSegments)
          if (secondStoredRouteSegment && secondStoredRouteSegment.includes("?")) {

            const secondStoredRouteSegments = storedRouteSegments[2].split('?tn=')
            // this.logger.log('[SIGN-UP] secondStoredRouteSegments', secondStoredRouteSegments)
            this.templateName = decodeURIComponent(secondStoredRouteSegments[1])
            // this.logger.log('[SIGN-UP] secondStoredRouteSegments templateName', this.templateName)
          }
          this.segmentRecordPageAndIdentify(this.templateName)

        } else if (size === 0 && !storedRoute) {
          this.segmentRecordPageAndIdentify()
        }
      })
  }

  segmentRecordPageAndIdentify(queryParams?: any) {
    if (!isDevMode()) {
      setTimeout(() => {
        if (window['analytics']) {
          let page = ''
          if (queryParams) {
            page = "Auth Page, Signup" + ' ' + queryParams
          } else {
            page = "Auth Page, Signup"
          }

          try {
            window['analytics'].page(page, {

            });
          } catch (err) {
            this.logger.error('Signup page error', err);
          }
          try {
            window['analytics'].identify({
              createdAt: moment().format("YYYY-MM-DD hh:mm:ss")
            });
          } catch (err) {
            this.logger.error('Signup identify error', err);
          }
        }
      }, 3000);
    }

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

    if (this.public_Key.includes("PAY") === true) {

      keys.forEach(key => {
        // this.logger.log('NavbarComponent public_Key key', key)
        if (key.includes("PAY")) {
          // this.logger.log('PUBLIC-KEY (SIGNUP) - key', key);
          let pay = key.split(":");
          // this.logger.log('PUBLIC-KEY (SIGNUP) - areActivePay key&value', pay);
          if (pay[1] === "F") {
            this.areActivePay = false;
            // this.logger.log('PUBLIC-KEY (SIGNUP) - areActivePay is', this.areActivePay);
          } else {
            this.areActivePay = true;
            // this.logger.log('PUBLIC-KEY (SIGNUP) - areActivePay is', this.areActivePay);
          }
        }
      });

    } else {
      this.areActivePay = false;
      // this.logger.log('PUBLIC-KEY (SIGNUP) - areActivePay is', this.areActivePay);
    }

    this.checkCurrentUrlAndSkipWizard();
  }



  signupWithGoogle() {
    this.auth.siginUpWithGoogle()
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

    this.storedRoute = this.localDbService.getFromStorage('wannago')
    // this.logger.log('[SIGN-UP] storedRoute ', this.storedRoute)
    if (this.storedRoute) {
      this.EXIST_STORED_ROUTE = true
    } else {
      this.EXIST_STORED_ROUTE = false
    }

    if (this.storedRoute) {
      if (this.storedRoute.indexOf('/activate-product') !== -1) {
        const storedRouteSegment = this.storedRoute.split('/')
        // this.logger.log('[SIGN-UP] storedRouteSegment', storedRouteSegment)
        this.appSumoActivationEmail = storedRouteSegment[2]
        // this.logger.log('[SIGN-UP] this.appSumoActivationEmail ', this.appSumoActivationEmail)
        this.userForm.patchValue({ 'email': this.appSumoActivationEmail })
        this.isValidAppSumoActivationEmail = this.validateEmail(this.appSumoActivationEmail)
        // this.logger.log('[SIGN-UP] this.isValidAppSumoActivationEmail ', this.isValidAppSumoActivationEmail)
        // this.logger.log('[SIGN-UP] this.isValidAppSumoActivationEmail ', this.isValidAppSumoActivationEmail)
        const emailInputElm = document.getElementById("user-email") as HTMLInputElement;
        // this.logger.log('[SIGN-UP] emailInputElm ', emailInputElm)
        emailInputElm.disabled = true;
      }
    }


    // this.logger.log('[SIGN-UP] checkCurrentUrlAndSkipWizard router.url  ', this.router.url)


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

  validateEmail(appSumoActivationEmail) {
    var validateEmailRegex = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/
    if (appSumoActivationEmail.match(validateEmailRegex)) {
      // this.logger.log('Valid email address!')
      return true;
    } else {
      // this.logger.log('Invalid email address!')
      return false;
    }
  }

  getAndPatchInvitationEmail() {
    this.pendingInvitationEmail = this.route.snapshot.params['pendinginvitationemail'];

    this.userForm.patchValue({ 'email': this.pendingInvitationEmail })
    // this.logger.log('[SIGN-UP] Pending Invitation Email (get From URL)  ', this.pendingInvitationEmail)
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

  getReCaptchaSiteKey() {
    this.reCaptchaSiteKey = this.appConfigService.getConfig().reCaptchaSiteKey;
    this.logger.log('[SIGN-UP] reCaptchaSiteKey ', this.reCaptchaSiteKey)
  }

  signUp() {
    if (window && window['grecaptcha']) {
      this.logger.log('[SIGN-UP] window grecaptcha', window['grecaptcha'])
      this.logger.log('[SIGN-UP] signup with recaptcha', window['grecaptcha'])
      grecaptcha.ready(() => {
        grecaptcha.execute(this.reCaptchaSiteKey, { action: 'submit' }).then((token) => {
          // Add your logic to submit to your backend server here.
          this.logger.log('[SIGN-UP] grecaptcha ', token)
          if (token) {
            this.signup()
          }
        });
      });
    } else {
      this.logger.log('[SIGN-UP] signup without recaptcha' )
      this.signup()
    }
  }


  signup() {
    this.logger.log('[SIGN-UP] !!!! ')
    this.showSpinnerInLoginBtn = true;
    const email = this.userForm.value['email']
    this.logger.log('[SIGN-UP] signup  email ', email)

    let yourname = "";
    if (email.includes('@')) {
      const emailBeforeAt = email.split('@')[0];
      if (emailBeforeAt && !emailBeforeAt.includes('.')) {
        yourname = this.titleCasePipe.transform(emailBeforeAt);
        this.logger.log('[SIGN-UP] signup  yourname (use case email without dot before @) ', yourname)
        this.userForm.controls['firstName'].patchValue(yourname)
      } else if (emailBeforeAt && emailBeforeAt.includes('.')) {
        const emailBeforeAtAndFirstOfDot = email.split('.')[0];
        this.logger.log('[SIGN-UP] signup  emailBeforeAtAndFirstDot ', emailBeforeAtAndFirstOfDot)
        yourname = this.titleCasePipe.transform(emailBeforeAtAndFirstOfDot);
        this.logger.log('[SIGN-UP] signup  yourname (use case email with dot before @) ', yourname)
        this.userForm.controls['firstName'].patchValue(yourname)
      }
    }

    this.logger.log('[SIGN-UP] signup  this.userForm ', this.userForm)

    this.auth.showExpiredSessionPopup(true);

    // const stringOnlyFirstCharacter = this.userForm.value['firstName'].charAt(0)
    // const stringWithoutFirstCharacter = this.userForm.value['firstName'].slice(1);

    // const _first_name = stringOnlyFirstCharacter + stringWithoutFirstCharacter

    this.auth.signup(this.userForm.value['email'], this.userForm.value['password'], this.userForm.value['firstName'], this.userForm.value['lastName'])

      .subscribe((signupResponse) => {
        this.logger.log('[SIGN-UP] Email ', this.userForm.value['email']);
        this.logger.log('[SIGN-UP] Password ', this.userForm.value['password']);
        this.logger.log('[SIGN-UP] Firstname ', this.userForm.value['firstName']);
        this.logger.log('[SIGN-UP] Lastname ', this.userForm.value['lastName']);
        this.logger.log('[SIGN-UP] POST DATA ', signupResponse);
        if (signupResponse['success'] === true) {

          // this.localDbService.setInStorage('signedup', 'true')
          // this.router.navigate(['/welcome']);
          this.logger.log('[SIGN-UP] RES ', signupResponse);
          const userEmail = signupResponse.user.email
          this.logger.log('[SIGN-UP] RES USER EMAIL ', userEmail);

          // Hide pending email alert if the user sign up (will be displayed when the userr signin)
          // this.localDbService.setInStorage('hpea', true);

          if (!isDevMode()) {
            if (window['analytics']) {
              let userFullname = ''
              if (signupResponse.user.firstname && signupResponse.user.lastname) {
                userFullname = signupResponse.user.firstname + ' ' + signupResponse.user.lastname
              } else if (signupResponse.user.firstname && !signupResponse.user.lastname) {
                userFullname = signupResponse.user.firstname
              }

              try {
                window['analytics'].identify(signupResponse.user._id, {
                  name: userFullname,
                  email: signupResponse.user.email,
                  logins: 5,
                });
              } catch (err) {
                this.logger.error('identify signup event error', err);
              }
              let utm_source_value = undefined;
              let su: any = 'Signed up';
              var size = Object.keys(this.queryParams).length;
              // this.logger.log('queryParams size ', size)
              // let event = ''
              if (size > 0) {

                for (const [key, value] of Object.entries(this.queryParams)) {
                  // this.logger.log(`${key}: ${value}`);
                  // event = "Signed Up button clicked" + ' ' + key + '=' + value
                  if (key === 'utm_source') {
                    utm_source_value = value
                  }
                  if (key === 'su') {
                    su = value
                  }
                }
              } else if (size === 0 && this.templateName) {
                su = this.templateName
              }
              // } else {
              //   event = "Signed Up button clicked"
              // }
              // this.logger.log('[SIGN-UP] Signed Up button clicked event ', event)




              try {
                window['analytics'].track("Signed Up", {
                  "type": "organic",
                  "utm_source": utm_source_value,
                  "button": su,
                  "first_name": signupResponse.user.firstname,
                  "last_name": signupResponse.user.lastname,
                  "email": signupResponse.user.email,
                  "username": userFullname,
                  'userId': signupResponse.user._id,
                  'method': "Email and Password"
                });
              } catch (err) {
                this.logger.error('track signup event error', err);
              }
            }
          }

          this.autoSignin(userEmail, signupResponse);

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


  autoSignin(userEmail: string, signupResponse: any) {
    // this.auth.emailLogin(
    const self = this;

    this.auth.signin(userEmail, this.userForm.value['password'], this.appConfigService.getConfig().SERVER_BASE_URL, function (error) {
      self.logger.log('[SIGN-UP] autoSignin 1. POST DATA ', error);
      // this.logger.log('autoSignin: ', error);
      if (!error) {
        // --------------------------------------------
        // Run widget login
        // --------------------------------------------
        if (window && window['tiledesk_widget_login']) {
          window['tiledesk_widget_login']();
        }
        // self.widgetReInit();
        // --------------------------------------------
        // Run widget login
        // --------------------------------------------
        if (window && window['tiledesk_widget_login']) {
          window['tiledesk_widget_login']();
        }

        // this.logger.log('[SIGN-UP] autoSignin storedRoute ', self.storedRoute)
        // this.logger.log('[SIGN-UP] autoSignin EXIST_STORED_ROUTE ', self.EXIST_STORED_ROUTE)

        // this.logger.log('self.EXIST_STORED_ROUTE: ', self.EXIST_STORED_ROUTE, self.storedRoute);
        // this.logger.log('self.SKIP_WIZARD: ', self.SKIP_WIZARD);

        // this.logger.log('self.EXIST_STORED_ROUTE: ', self.EXIST_STORED_ROUTE, self.storedRoute);
        // this.logger.log('self.SKIP_WIZARD: ', self.SKIP_WIZARD);

        if (!self.EXIST_STORED_ROUTE) {
          if (self.SKIP_WIZARD === false) {

            self.logger.log('self.areActivePay: ', self.areActivePay);
            // self.router.navigate(['/create-project']);

            // self.createNewProject(signupResponse)

            // self.router.navigate(['/create-new-project']);
            // self.router.navigate(['/onboarding']);

            if (self.areActivePay) {
              self.router.navigate(['/onboarding']);

            } else if (!self.areActivePay) {
              // self.router.navigate(['/create-new-project']);
              self.createNewProject(signupResponse)

            }

          } else {
            self.router.navigate(['/projects']);
          }
        } else {
          self.localDbService.removeFromStorage('wannago')
          self.router.navigate([self.storedRoute]);
        }

      } else {
        self.showSpinnerInLoginBtn = false;
        const signin_errorbody = error['error']
        self.signin_errormsg = signin_errorbody['msg']
        self.display = 'block';
        self.logger.error('[SIGN-UP] SIGNIN USER - POST REQUEST MSG ERROR ', self.signin_errormsg);
      }

    });
  }

  createNewProject(signupResponse) {
    let projectName = ''
    const email = this.userForm.value['email']
    if (email.includes('@')) {
      const emailAfterAt = email.split('@')[1];
      if (!emailDomainWhiteList.includes(emailAfterAt)) {
        if (emailAfterAt.includes('.'))
          projectName = emailAfterAt.split('.')[0]
        else if (!emailAfterAt.includes('.')) {
          projectName = emailAfterAt
        }
      } else {
        projectName = 'My awesome project'
      }
    } else {
      projectName = 'My awesome project'
    }
    // this.DISPLAY_SPINNER_SECTION = true;
    // this.DISPLAY_SPINNER = true;
    this.logger.log('[SIGN-UP] CREATE NEW PROJECT - PROJECT-NAME DIGIT BY USER ', projectName);

    this.projectService.createProject(projectName, 'signup')
      .subscribe((project: Project) => {
        this.logger.log('[SIGN-UP] POST DATA PROJECT RESPONSE ', project);
        if (project) {
          this.new_project = project;
          this.logger.log('[SIGN-UP] new_project ',  this.new_project);
          this.new_project['role'] = 'owner';
          this.logger.log('[SIGN-UP] role ', this.new_project['role']);
            
          this.auth.projectSelected(this.new_project, 'sign-up')
          localStorage.setItem(this.new_project._id, JSON.stringify(project));
          this.router.navigate(['/projects']);



          // // WHEN THE USER SELECT A PROJECT ITS ID IS SEND IN THE PROJECT SERVICE THET PUBLISHES IT
          // // THE SIDEBAR SIGNS UP FOR ITS PUBLICATION
          // const newproject: Project = {
          //   _id: project['_id'],
          //   name: project['name'],
          //   operatingHours: project['activeOperatingHours'],
          //   profile_type: project['profile'].type,
          //   profile_name: project['profile'].name,
          //   trial_expired: project['trialExpired']
          // }

          // SENT THE NEW PROJECT TO THE AUTH SERVICE THAT PUBLISH
          // this.auth.projectSelected(newproject, 'sign-up')
          // this.logger.log('[SIGN-UP] CREATED PROJECT ', newproject)

          // this.id_project = newproject._id
          // this.router.navigate([`/project/${this.id_project}/configure-widget`]);
          // this.router.navigate(['/create-new-project']);
         
        }


      }, (error) => {
        // this.DISPLAY_SPINNER = false;
        this.logger.error('[SIGN-UP] CREATE NEW PROJECT - POST REQUEST - ERROR ', error);

      }, () => {
        this.logger.log('[SIGN-UP] CREATE NEW PROJECT - POST REQUEST * COMPLETE *');
        this.projectService.newProjectCreated(true);

        this.getProjectsAndSaveLastProject(this.new_project._id)

        const trialStarDate = moment(new Date(this.new_project.createdAt)).format("YYYY-MM-DD hh:mm:ss")
        // this.logger.log('[WIZARD - CREATE-PRJCT] POST DATA PROJECT trialStarDate ', trialStarDate);
        const trialEndDate = moment(new Date(this.new_project.createdAt)).add(14, 'days').format("YYYY-MM-DD hh:mm:ss")
        // this.logger.log('[WIZARD - CREATE-PRJCT] POST DATA PROJECT trialEndDate', trialEndDate)

        this.trackCreateProject(signupResponse, trialStarDate, trialEndDate)
        // setTimeout(() => {
        //   this.DISPLAY_SPINNER = false;
        // }, 2000);

        // 'getProjectsAndSaveInStorage()' was called only on the onInit lifehook, now recalling also after the creation 
        // of the new project resolve the bug  'the auth service not find the project in the storage'
        // this.getProjectsAndSaveInStorage();
        this.addWidgetDefaultLanguage()
      });
  }

  getProjectsAndSaveLastProject(project_id) {
    this.projectService.getProjects().subscribe((projects: any) => {
      this.logger.log('[SIGN-UP] getProjects projects ', projects)
      if (projects) {
        const populateProjectUser = projects.find(prj => prj.id_project.id === project_id);
        this.logger.log('[SIGN-UP] currentProjectUser ', populateProjectUser)
        localStorage.setItem('last_project', JSON.stringify(populateProjectUser))
      }
    });
  }

  addWidgetDefaultLanguage() {
    this.browser_lang = this.translate.getBrowserLang();

    if (tranlatedLanguage.includes(this.browser_lang)) {
      const langName = this.getLanguageNameFromCode(this.browser_lang)
      // this.logger.log('[WIZARD - CREATE-PRJCT] - langName ', langName)

      this.temp_SelectedLangName = langName;
      this.temp_SelectedLangCode = this.browser_lang
    } else {

      this.temp_SelectedLangName = 'English';
      this.temp_SelectedLangCode = 'en'
    }

    this.addNewLanguage(this.temp_SelectedLangCode, this.temp_SelectedLangName)

  }

  addNewLanguage(langCode, langName) {
    this.selectedTranslationCode = langCode;
    this.selectedTranslationLabel = langName;
    this.logger.log('[SIGN-UP] ADD-NEW-LANG selectedTranslationCode', this.selectedTranslationCode);
    this.logger.log('[SIGN-UP] ADD-NEW-LANG selectedTranslationLabel', this.selectedTranslationLabel);

    this.widgetService.cloneLabel(this.temp_SelectedLangCode.toUpperCase())
      .subscribe((res: any) => {
        // this.logger.log('Multilanguage - addNewLanguage - CLONE LABEL RES ', res);
        this.logger.log('[SIGN-UP] - ADD-NEW-LANG (clone-label) RES ', res.data);

      }, error => {
        this.logger.error('[SIGN-UP] ADD-NEW-LANG (clone-label) - ERROR ', error)
      }, () => {
        this.logger.log('[SIGN-UP] ADD-NEW-LANG (clone-label) * COMPLETE *')
      });

    // // ADD THE NEW LANGUAGE TO BOTTOM NAV
    const newLang = { code: this.temp_SelectedLangCode, name: this.temp_SelectedLangName };
    this.logger.log('[SIGN-UP] Multilanguage saveNewLanguage newLang objct ', newLang);

    this.availableTranslations.push(newLang)
    this.logger.log('[SIGN-UP] Multilanguage saveNewLanguage availableTranslations ', this.availableTranslations)
  }

  // getProjectsAndSaveInStorage() {
  //   this.projectService.getProjects().subscribe((projects: any) => {
  //     this.logger.log('[SIGN-UP] !!! getProjectsAndSaveInStorage PROJECTS ', projects);

  //     if (projects) {
  //       // SET THE IDs and the NAMES OF THE PROJECT IN THE LOCAL STORAGE.
  //       // WHEN IS REFRESHED A PAGE THE AUTSERVICE USE THE NAVIGATION PROJECT ID TO GET FROM STORAGE THE NAME OF THE PROJECT
  //       // AND THEN PUBLISH PROJECT ID AND PROJECT NAME
  //       projects.forEach(project => {
  //        this.logger.log('[SIGN-UP] !!! getProjectsAndSaveInStorage SET PROJECT IN STORAGE')
  //         if (project.id_project) {
  //           // const prjct: Project = {
  //           //   _id: project.id_project._id,
  //           //   name: project.id_project.name,
  //           //   role: project.role,
  //           //   operatingHours: project.id_project.activeOperatingHours
  //           // }

  //           localStorage.setItem(project.id_project._id, JSON.stringify(project.id_project));
  //         }
  //       });
  //     }
  //   }, error => {
  //     this.logger.error('[SIGN-UP] getProjectsAndSaveInStorage - ERROR ', error)
  //   }, () => {
  //     this.logger.log('[SIGN-UP] getProjectsAndSaveInStorage - COMPLETE')
  //   });
  // }

  trackCreateProject(signupResponse, trialStarDate, trialEndDate) {
    if (!isDevMode()) {
      if (window['analytics']) {
        try {
          window['analytics'].page("Signup, Create project", {

          });
        } catch (err) {
          this.logger.error('Signup Create project page error', err);
        }

        let userFullname = ''
        if (signupResponse.user.firstname && signupResponse.user.lastname) {
          userFullname = signupResponse.user.firstname + ' ' + signupResponse.user.lastname
        } else if (signupResponse.user.firstname && !signupResponse.user.lastname) {
          userFullname = signupResponse.user.firstname
        }

        try {
          window['analytics'].identify(signupResponse.user._id, {
            name: userFullname,
            email: signupResponse.user.email,
            logins: 5,
            plan: "Premium (trial)"
          });
        } catch (err) {
          this.logger.error('Signup Create project identify error', err);
        }

        try {
          window['analytics'].track('Trial Started', {
            "userId": signupResponse.user._id,
            "trial_start_date": trialStarDate,
            "trial_end_date": trialEndDate,
            "trial_plan_name": "Premium (trial)",
            "context": {
              "groupId": this.new_project._id
            }
          });
        } catch (err) {
          this.logger.error('Signup Create track Trial Started event error', err);
        }

        try {
          window['analytics'].group(this.new_project._id, {
            name: this.new_project.name,
            plan: "Premium (trial)",
          });
        } catch (err) {
          this.logger.error('Signup Create project group error', err);
        }
      }
    }
  }

  widgetReInit() {
    if (window && window['tiledesk']) {
      this.logger.log('[SIGN-UP] widgetReInit ', window['tiledesk'])

      window['tiledesk'].reInit();
      // alert('signin reinit');
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

  goToCompanySite() {
    const url = this.company_site_url;
    window.open(url, '_blank');
  }



  goToSigninPage() {
    this.router.navigate(['login']);
  }


  onChange($event) {
    const checkModel = $event.target.checked;
    this.logger.log('[SIGN-UP] CHECK MODEL ', checkModel)
  }

  onPasswordStrengthChanged(event: boolean) {
    this.strongPassword = event;
  }

  togglePswdVisibility(isVisiblePsw) {
    this.logger.log('[SIGN-UP] togglePswdVisibility isVisiblePsw ', isVisiblePsw)
    this.isVisiblePsw = isVisiblePsw;

    const pswrdElem = <HTMLInputElement>document.querySelector('#signup-password')
    // if (pswrdElem.type === "text") {
    //   this.logger.log('[SIGN-UP] togglePswdVisibility pswrdElem (use case type text)', pswrdElem)
    //   pswrdElem.classList.toggle("secure")
    // }

    // if (pswrdElem.type === "password") {
    this.logger.log('[SIGN-UP] togglePswdVisibility pswrdElem (use case type password) ', pswrdElem)
    if (isVisiblePsw) {
      pswrdElem.setAttribute("type", "text");
    } else {
      pswrdElem.setAttribute("type", "password");
    }

    // }
  }


  onFocusPwsInput() {

    this.isVisiblePwsStrengthBar = true;
    this.logger.log('[SIGN-UP] onFocusPwsInput isVisiblePwsStrengthBar ', this.isVisiblePwsStrengthBar)
  }

  onBlurPwsInput() {
    this.isVisiblePwsStrengthBar = false;
    this.logger.log('[SIGN-UP] onBlurPwsInput isVisiblePwsStrengthBar ', this.isVisiblePwsStrengthBar)
  }



}
