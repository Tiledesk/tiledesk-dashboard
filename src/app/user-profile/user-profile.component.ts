import { Component, ElementRef, isDevMode, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../core/auth.service';

// USED FOR go back last page
import { Location } from '@angular/common';
import { Project } from '../models/project-model';
import { UsersService } from '../services/users.service';
import { UploadImageService } from '../services/upload-image.service';
import { UploadImageNativeService } from '../services/upload-image-native.service';
import { NotifyService } from '../core/notify.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConfigService } from '../services/app-config.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '../services/logger/logger.service';
import { tranlatedLanguage, avatarPlaceholder, getColorBck, PLAN_NAME, APP_SUMO_PLAN_NAME, filterImageMimeTypesAndExtensions, checkAcceptedFile } from 'app/utils/util';
import { LocalDbService } from 'app/services/users-local-db.service';
import { environment } from '../../environments/environment';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { DomSanitizer } from '@angular/platform-browser';
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component';
import { BrandService } from 'app/services/brand.service';
import { parsePhoneNumberFromString, isValidPhoneNumber, AsYouType, getCountries, getCountryCallingCode } from 'libphonenumber-js/max';
const Swal = require('sweetalert2')


@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent extends PricingBaseComponent implements OnInit {
  @ViewChild('phoneInput') phoneInput!: ElementRef<HTMLInputElement>;
  PLAN_NAME = PLAN_NAME;
  APP_SUMO_PLAN_NAME = APP_SUMO_PLAN_NAME;
  appSumoProfile: string;
  user: any;
  project: Project;
  userFirstname: string;
  userLastname: string;
  userEmail: string;
  userPhone: string;
  userPhoneValue:string;
  selectedCountry: any;
  countries: { code: string; name: string; dialCode: string }[] = [];
  dialCode: string;
  isValidPhoneNumber: boolean
  userId: string;
  // displayModalUpdatingUser = 'none';
  SHOW_CIRCULAR_SPINNER = false;
  UPDATE_USER_ERROR = false;
  showSpinner = true;
  firstnameCurrentValue: string;
  lastnameCurrentValue: string;
  HAS_EDIT_FIRSTNAME = false;
  HAS_EDIT_LASTNAME = false;
  emailverified: boolean;
  projectId: string;
  userProfileImageExist: boolean;
  userImageHasBeenUploaded: boolean;
  userProfileImageurl: string;
  timeStamp: any;

  storageBucket: string;
  baseUrl: string;
  showSpinnerInUploadImageBtn = false;
  userRole: string;
  browser_lang: string;
  selected_dashboard_language: any
  flag_url: string;
  display_msg_please_select_language: boolean = false;
  display_msg_refresh_page_for_browser_lang: boolean = false;
  display_msg_refresh_page_for_selected_lang: boolean = false;
  hasSelectedBrowserLangRadioBtn: boolean;
  hasSelectedPreferredLangRadioBtn: boolean;
  // used to unsuscribe from behaviour subject
  private unsubscribe$: Subject<any> = new Subject<any>();

  HAS_SELECTED_PREFERRED_LANG: boolean = false;
  private fragment: string;
  i18n_for_this_brower_language_is_available = false;
  prjct_profile_name: string;
  prjct_id: string;
  prjct_name: string;
  mobile_number_available: boolean;
  dislayUserPhoneMandatoryMsg: boolean;

  @ViewChild('fileInputUserProfileImage', { static: false }) fileInputUserProfileImage: any;

  fileUploadAccept: string;
  translationsMap: Map<string, string> = new Map();

  dashboard_languages = [
    {
      id: 1,
      name: 'it',
      avatar: 'assets/img/language_flag/it.png'
    },
    {
      id: 2,
      name: 'en',
      avatar: 'assets/img/language_flag/en.png'
    },
    {
      id: 3,
      name: 'de',
      avatar: 'assets/img/language_flag/de.png'
    },
    {
      id: 4,
      name: 'es',
      avatar: 'assets/img/language_flag/es.png'
    },
    {
      id: 5,
      name: 'pt',
      avatar: 'assets/img/language_flag/pt.png'
    },
    {
      id: 6,
      name: 'fr',
      avatar: 'assets/img/language_flag/fr.png'
    },
    {
      id: 7,
      name: 'ru',
      avatar: 'assets/img/language_flag/ru.png'
    },
    {
      id: 8,
      name: 'tr',
      avatar: 'assets/img/language_flag/tr.png'
    },
    {
      id: 9,
      name: 'sr',
      avatar: 'assets/img/language_flag/sr.png'
    },
    {
      id: 10,
      name: 'ar',
      avatar: 'assets/img/language_flag/ar.png'
    },
    {
      id: 11,
      name: 'uk',
      avatar: 'assets/img/language_flag/uk.png'
    },
    {
      id: 12,
      name: 'sv',
      avatar: 'assets/img/language_flag/sv.png'
    },
    {
      id: 13,
      name: 'az',
      avatar: 'assets/img/language_flag/az.png'
    },
    {
      id: 14,
      name: 'kk',
      avatar: 'assets/img/language_flag/kk.png'
    },
    {
      id: 15,
      name: 'uz',
      avatar: 'assets/img/language_flag/uz.png'
    }
  ];
  isChromeVerGreaterThan100: boolean;
  displayChangePwd: boolean;
  constructor(
    public auth: AuthService,
    private _location: Location,
    private usersService: UsersService,
    public notify: NotifyService,
    private router: Router,
    private uploadImageService: UploadImageService,
    private uploadImageNativeService: UploadImageNativeService,
    public appConfigService: AppConfigService,
    private translate: TranslateService,
    private logger: LoggerService,
    private route: ActivatedRoute,
    private usersLocalDbService: LocalDbService,
    public prjctPlanService: ProjectPlanService,
    private sanitizer: DomSanitizer,
    public brandService: BrandService
  ) {
    super(prjctPlanService, notify);
    const brand = brandService.getBrand();
    this.displayChangePwd = brand['display_change_pwd']
    // this.logger.log('[USER-PROFILE] displayChangePwd ' , this.displayChangePwd) 
  }

  ngOnInit() {

    this.getLoggedUser();

    this.getProfileImageStorage();
    this.getCurrentProject();

    this.checkUserImageUploadIsComplete()
    // used when the page is refreshed
    this.checkUserImageExist();
    this.getProjectUserRole();

    this.translateStrings();
    this.getBrowserLanguage();

    this.route.fragment.subscribe(fragment => {
      this.fragment = fragment;
      this.logger.log('[USER-PROFILE] - FRAGMENT ', this.fragment)
    });
    this.getBrowserVersion();
    this.getProjectPlan();
    this.trackPage();

    this.fileUploadAccept = 'image/jpg, image/jpeg, image/png'
  }

  ngAfterViewInit(): void {
    try {
      // name of the class of the html div = . + fragment
      const languageEl = <HTMLElement>document.querySelector('.' + this.fragment)
      this.logger.log('[USER-PROFILE] - QUERY SELECTOR language  ', languageEl)
      if (languageEl) {
        languageEl.scrollIntoView();
      }
      // document.querySelector('#' + this.fragment).scrollIntoView();
      // this.logger.log( document.querySelector('#' + this.fragment).scrollIntoView())
    } catch (e) {
      this.logger.error('[USER-PROFILE] - QUERY SELECTOR language ERROR  ', e)
    }
  }

  trackPage() {
    if (!isDevMode()) {
      if (window['analytics']) {
        try {
          window['analytics'].page("User Profile Page, Profile", {

          });
        } catch (err) {
          this.logger.error('User Profile page error', err);
        }
      }
    }
  }


  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project

      if (this.project) {
        this.projectId = project._id
        this.logger.log('[USER-PROFILE] - GET CURRENT PROJECT project ', project)
      } else {
        this.logger.log('[USER-PROFILE] - GET CURRENT PROJECT project ', project, ' - HIDE SIDEBAR')
        this.selectSidebar();
      }
    });
  }

  getProjectUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user_role) => {
        this.logger.log('[USER-PROFILE] - USER ROLE ', user_role);
        if (user_role) {
          // this.userRole = user_role

          this.translate.get(user_role)
            .subscribe((text: string) => {
              this.userRole = text;
            });
        }
      });
  }

  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      this.logger.log('[USER-PROFILE] - USER GET IN USER PROFILE - USER', user)

      if (user) {
        this.user = user;
        this.userFirstname = user.firstname;
        this.logger.log('[USER-PROFILE] - USER GET IN USER PROFILE - userFirstname ', this.userFirstname)
        this.userLastname = user.lastname;
        this.logger.log('[USER-PROFILE] - USER GET IN USER PROFILE - userLastname ', this.userLastname)
        this.userId = user._id;


        // this.getCurrentProjectUser(this.userId)

        this.userEmail = user.email;
        this.firstnameCurrentValue = user.firstname;
        this.logger.log('[USER-PROFILE] - USER GET IN USER PROFILE - firstnameCurrentValue ', this.firstnameCurrentValue)
        this.lastnameCurrentValue = user.lastname;
        this.logger.log('[USER-PROFILE] - USER GET IN USER PROFILE - firstnameCurrentValue ', this.lastnameCurrentValue)
        this.emailverified = user.emailverified;
        this.logger.log('[USER-PROFILE] - USER GET IN USER PROFILE - EMAIL VERIFIED ', this.emailverified)
        this.logger.log('[USER-PROFILE] - USER GET IN USER PROFILE - this.user ', this.user)

        const user_phone = user['phone'];
        this.logger.log('[USER-PROFILE] - USER GET user_phone ', user_phone)

        if (user_phone) {
          this.mobile_number_available = true;
          this.dislayUserPhoneMandatoryMsg= true;
          // this.isValidPhoneNumber = isValidPhoneNumber(user_phone)
          this.logger.log('[USER-PROFILE] USER GET IN USER PROFILE mobile_number_available ', this.mobile_number_available)

          const phoneNumber = parsePhoneNumberFromString(user_phone);
          this.logger.log('[USER-PROFILE] - USER GET USER  parsed phone Number ', phoneNumber)

          this.logger.log('[USER-PROFILE] - USER GET USER  parsed phone Number country', phoneNumber.country)

          if (phoneNumber) {
            this.logger.log('USER-PROFILE] - USER GET USER phone Number getType ', phoneNumber.getType())
          }

          const formatter = new AsYouType();
          this.userPhone = formatter.input(user_phone);

          this.getSupportedCountry(phoneNumber.country, 'hasMobile')

          if (isValidPhoneNumber(this.userPhone) === false) {

            this.isValidPhoneNumber = false
          } else if (isValidPhoneNumber(this.userPhone) === true) {

            this.isValidPhoneNumber = true
          }

          this.logger.log('USER-PROFILE] - getCurrentProjectUser isValidPhoneNumber ', this.isValidPhoneNumber)
        } else {
          this.mobile_number_available = false;
          this.dislayUserPhoneMandatoryMsg = false;
          // this.isValidPhoneNumber = true;
          try {

          fetch('https://ipinfo.io/json?token=80a9a2b7dc46e3')
            .then(response => response.json())
            .then(data => {
              const userCountry = data.country
              this.logger.log('[USER-PROFILE] - Detected country from IP:', userCountry);
              this.getSupportedCountry(userCountry, 'NotHasMobile')
            })
          } catch (error) {
            this.logger.error('FCM error', error);
          }
        }


        const storedUser = this.usersLocalDbService.getMemberFromStorage(this.userId);
        this.logger.log('[USER-PROFILE] - USER GET IN USER PROFILE - storedUser ', storedUser)
        this.logger.log('[USER-PROFILE] - USER GET IN USER PROFILE - storedUser typeof', typeof storedUser)

        if (storedUser) {

          if (this.userFirstname && this.userLastname) {
            this.logger.log('Stored user Firstname ', storedUser['firstname'])
            this.logger.log('Stored user Lastname ', storedUser['lastname'])
            if (this.userFirstname !== storedUser['firstname']) {
              storedUser['firstname'] = this.userFirstname
              this.usersLocalDbService.saveMembersInStorage(user['_id'], storedUser, 'user profile');
            }
            if (this.userLastname !== storedUser['lastname']) {
              storedUser['lastname'] = this.userLastname
              this.usersLocalDbService.saveMembersInStorage(user['_id'], storedUser, 'user profile');
            }
          } else if (this.userFirstname && !this.userFirstname) {
            if (this.userFirstname !== storedUser['firstname']) {
              storedUser['firstname'] = this.userFirstname
              this.usersLocalDbService.saveMembersInStorage(user['_id'], storedUser, 'user profile');
            }
          }
        }


        this.showSpinner = false;

        this.createUserAvatar(user);

        const stored_preferred_lang = localStorage.getItem(this.userId + '_lang')

        if (stored_preferred_lang) {
          this.HAS_SELECTED_PREFERRED_LANG = true;
          this.selected_dashboard_language = stored_preferred_lang;
          this.logger.log('[USER-PROFILE] HAS_SELECTED_PREFERRED_LANG ', this.HAS_SELECTED_PREFERRED_LANG)
          this.logger.log('[USER-PROFILE] stored_preferred_lang ', stored_preferred_lang)
        } else {
          this.HAS_SELECTED_PREFERRED_LANG = false;
          this.logger.log('[USER-PROFILE] HAS_SELECTED_PREFERRED_LANG ', this.HAS_SELECTED_PREFERRED_LANG)
          this.logger.log('[USER-PROFILE] stored_preferred_lang ', stored_preferred_lang)
        }
      }

    }, (error) => {
      this.logger.error('[USER-PROFILE] - USER GET IN USER PROFILE - ERROR', error);
      this.showSpinner = false;
    }, () => {
      this.logger.log('[USER-PROFILE] - USER GET IN USER PROFILE * COMPLETE *');
    });
  }



  getSupportedCountry(countryCode, calledBy) {
    this.countries = getCountries().map((code) => ({
      code: code,
      name: new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code,
      dialCode: `+${getCountryCallingCode(code)}`
    }));
    this.logger.log('[USER-PROFILE] - getSupportedCountry country', countryCode)
    this.logger.log('[USER-PROFILE] - getSupportedCountry PHONE VALIDATION SUPPORTED countries', this.countries)
    // this.selectedCountry = countryCode // set the conntry
    const selected_country = this.countries.find(c => c.code === countryCode);

    this.logger.log('[USER-PROFILE] - getSupportedCountry PHONE VALIDATION SUPPORTED selected_country', selected_country)
    if (selected_country) {
      this.dialCode = selected_country.dialCode
      this.selectedCountry = selected_country.code // set the conntry
    } else {
      this.dialCode = this.countries[0].dialCode;
      this.selectedCountry = this.countries[0].code // set the default country
    }

    if (calledBy === 'NotHasMobile') {
      this.userPhone = this.dialCode + ' '
    }
  }

  onCountryChange(country: any) {
    if (country) {
      this.logger.log('[USER-PROFILE] onCountryChange country', country)
      const selectedCountry = this.countries.find(c => c.code === country.code);
      this.logger.log('[USER-PROFILE] onCountryChange selectedCountry 1 ', selectedCountry)

      if (selectedCountry) {
        this.logger.log('[USER-PROFILE] onCountryChange selectedCountry 2', selectedCountry)
        this.dialCode = selectedCountry.dialCode;
        this.userPhone = this.dialCode + ' '

        this.isValidPhone()

        setTimeout(() => {
          const inputElement = this.phoneInput.nativeElement;
          inputElement.focus();
          inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length);
        }, 100); // Delay to ensure the input is ready
      }
    }
  }


  formatAsYouType(event) {
    this.logger.log('[USER-PROFILE] formatAsYouType ---->  event ', event)
    this.userPhoneValue = event.target.value;
    this.logger.log('[USER-PROFILE] formatAsYouType event value', this.userPhoneValue)
 

    const formatter = new AsYouType();
    this.userPhone = formatter.input(this.userPhone);

    // Prevent user from removing the dial code
    this.logger.log('[USER-PROFILE] formatAsYouType  userPhone start with dial code ', this.userPhone.startsWith(this.dialCode))

    if (!this.userPhone.startsWith(this.dialCode)) {
      this.userPhone = this.dialCode + ' '
      // + ' ' + inputValue.replace(dialCode, '').trim();
    }

    this.isValidPhone()
  }

  isValidPhone() {
    this.logger.log('[USER-PROFILE] --> isValidPhone userPhone', this.userPhone)
    this.logger.log('[USER-PROFILE] --> isValidPhone mobile_number_available', this.mobile_number_available)

    const phoneNumber = parsePhoneNumberFromString(this.userPhone);
    this.logger.log('[USER-PROFILE] --> isValidPhone parsePhoneNumberFromString phoneNumber', phoneNumber)

    this.logger.log('[USER-PROFILE] --> isValidPhoneNumber ', isValidPhoneNumber(this.userPhone))

    if (phoneNumber) {
      this.logger.log('[USER-PROFILE] --> isValidPhoneNumber getType ', phoneNumber.getType())
    }

    
    if (isValidPhoneNumber(this.userPhone) === false) {

      this.isValidPhoneNumber = false
    } else if (isValidPhoneNumber(this.userPhone) === true) {

      this.isValidPhoneNumber = true
    }

    // if (!this.mobile_number_available && this.userPhone !== this.dialCode || this.userPhone === this.dialCode) {
    //   this.logger.log('[USER-PROFILE] --> isValidPhoneNumber - HAS SIGNED UP WITHOUT PHONE NUMBER AND HAS ENTERED A PHONE NUMBER ', this.userPhone)
    //   this.mobile_number_available  = false
    // }
    // if (this.mobile_number_available && this.userPhone === this.dialCode || this.userPhone !== this.dialCode ) {
    //   this.logger.log('[USER-PROFILE] --> isValidPhoneNumber - HAS SIGNED UP WITHOUT PHONE NUMBER AND HAS NOT ENTERED A PHONE NUMBER ', this.userPhone)
    //   this.mobile_number_available  = true
    // }
  }

  updateCurrentUserFirstnameLastname() {
    let mobile_phone = this.userPhone.replace(/\s/g, "");
    this.logger.log('[USER-PROFILE] - UPDATE CURRENT USER - WHEN CLICK UPDATE - USER MOBILE PHONE ', mobile_phone)

    if (mobile_phone === this.dialCode) {
      this.logger.log('[USER-PROFILE] - UPDATE CURRENT USER - HAS SIGNED UP WITHOUT PHONE NUMBER AND NOT HAS ENTERED A PHONE NUMBER ', mobile_phone)
      mobile_phone = null
    }

    // this.displayModalUpdatingUser = 'block';
    this.SHOW_CIRCULAR_SPINNER = true;

    this.logger.log('[USER-PROFILE] - UPDATE CURRENT USER - WHEN CLICK UPDATE - USER FIRST NAME ', this.userFirstname);
    this.logger.log('[USER-PROFILE] - UPDATE CURRENT USER - WHEN CLICK UPDATE - USER LAST NAME ', this.userLastname);
    
    this.usersService.updateCurrentUser(this.userFirstname, this.userLastname, mobile_phone, (response) => {

      this.logger.log('[USER-PROFILE] - update Current User  RES ', response)
      this.logger.log('[USER-PROFILE] - update Current User  RES updatedUser ', response.updatedUser)

      if (response.success === true) {

        this.trackUpdateProfileName(response.updatedUser)
        // this.getLoggedUser()

        this.SHOW_CIRCULAR_SPINNER = false;
        this.UPDATE_USER_ERROR = false;
        this.logger.log('[USER-PROFILE] - UPDATE CURRENT USER  ', this.SHOW_CIRCULAR_SPINNER);
        // =========== NOTIFY SUCCESS===========
        this.notify.showWidgetStyleUpdateNotification(this.translationsMap.get('UserProfile.YourProfileHasBeenUploaded'), 2, 'done');
        // if (response === 'error')
      } else {
        this.SHOW_CIRCULAR_SPINNER = false;
        this.UPDATE_USER_ERROR = true;
        // =========== NOTIFY ERROR ===========
        this.notify.showWidgetStyleUpdateNotification(this.translationsMap.get('UserProfile.AnErrorHasOccurred'), 4, 'report_problem')
      }
    });
  }

  createUserAvatar(user) {
    this.logger.log('[USER-PROFILE] - createProjectUserAvatar ', user)
    let fullname = ''
    if (user && user.firstname && user.lastname) {
      fullname = user.firstname + ' ' + user.lastname
      user['fullname_initial'] = avatarPlaceholder(fullname)
      user['fillColour'] = getColorBck(fullname)
    } else if (user && user.firstname) {
      fullname = user.firstname
      user['fullname_initial'] = avatarPlaceholder(fullname)
      user['fillColour'] = getColorBck(fullname)
    } else {
      user['fullname_initial'] = 'N/A'
      user['fillColour'] = 'rgb(98, 100, 167)'
    }
  }

  getBrowserLanguage() {
    this.browser_lang = this.translate.getBrowserLang();
    if (tranlatedLanguage.includes(this.browser_lang)) {
      this.logger.log('[USER-PROFILE] - browser_lang includes', tranlatedLanguage.includes(this.browser_lang))
      this.i18n_for_this_brower_language_is_available = true;
      this.logger.log('[USER-PROFILE] - browser_lang', this.browser_lang)
      this.logger.log('[USER-PROFILE] - this.i18n_for_this_brower_language_is_available', this.i18n_for_this_brower_language_is_available)

      this.logger.log('[USER-PROFILE] - browser_lang ', this.browser_lang)
      this.flag_url = "assets/img/language_flag/" + this.browser_lang + ".png"
    } else {
      this.logger.log('[USER-PROFILE] - browser_lang includes', tranlatedLanguage.includes(this.browser_lang))
      this.i18n_for_this_brower_language_is_available = false;
      this.logger.log('[USER-PROFILE] - this.i18n_for_this_brower_language_is_available', this.i18n_for_this_brower_language_is_available)
      this.flag_url = "assets/img/language_flag/not_found_language.svg"
    }
  }

  onSelectPreferredDsbrdLang(selectedLanguageCode) {
    this.logger.log('[USER-PROFILE] onSelectPreferredDsbrdLang -  selectedLanguage ', selectedLanguageCode)
    this.selected_dashboard_language = selectedLanguageCode;
    localStorage.setItem(this.userId + '_lang', selectedLanguageCode);
    this.HAS_SELECTED_PREFERRED_LANG = true;
    this.display_msg_please_select_language = false;
    this.display_msg_refresh_page_for_selected_lang = true;
    this.hasSelectedBrowserLangRadioBtn = false;
    this.hasSelectedPreferredLangRadioBtn = true;

  }

  onSelectPreferredLangFromRadioBtn($event) {
    this.logger.log('[USER-PROFILE] onSelectPreferredLangFromRadioBtn -  event ', $event.target.checked);
    // this.selected_dashboard_language = this.browser_lang;
    this.HAS_SELECTED_PREFERRED_LANG = true;
    this.hasSelectedPreferredLangRadioBtn = $event.target.checked;
    this.hasSelectedBrowserLangRadioBtn = false
    this.logger.log('[USER-PROFILE]  hasSelectedBrowserLangRadioBtn  ', this.hasSelectedBrowserLangRadioBtn);

    if ($event.target.checked === true && this.selected_dashboard_language === undefined) {

      this.logger.log('[USER-PROFILE]  this.selected_dashboard_language  ', this.selected_dashboard_language);
      this.display_msg_please_select_language = true;
    }

    if ($event.target.checked === true && this.selected_dashboard_language !== undefined) {
      this.logger.log('[USER-PROFILE]  this.selected_dashboard_language  ', this.selected_dashboard_language);
      this.display_msg_refresh_page_for_selected_lang = true;
      this.hasSelectedBrowserLangRadioBtn = false;
    }

  }

  onSelectBrowserLangFromRadioBtn($event) {
    this.logger.log('[USER-PROFILE] onSelectBrowserLangFromRadioBtn -  event ', $event.target.checked)
    localStorage.removeItem(this.userId + '_lang');
    this.HAS_SELECTED_PREFERRED_LANG = false;
    this.hasSelectedBrowserLangRadioBtn = $event.target.checked
    this.hasSelectedPreferredLangRadioBtn = false;
    this.logger.log('[USER-PROFILE]  hasSelectedPreferredLangRadioBtn  ', this.hasSelectedPreferredLangRadioBtn);
    if ($event.target.checked === true) {

      this.display_msg_refresh_page_for_browser_lang = true;
      this.logger.log('[USER-PROFILE] onSelectBrowserLangFromRadioBtn  ', this.display_msg_refresh_page_for_browser_lang);
    }
  }

  getProfileImageStorage() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[USER-PROFILE] - IMAGE STORAGE ', this.storageBucket, 'usecase Firebase')
    } else {
      this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;
      // this.logger.log('[USER-PROFILE] - IMAGE STORAGE ', this.baseUrl, 'usecase Native')
    }
  }

  upload(event) {
    this.logger.log('[USER-PROFILE] IMAGE upload')
    this.showSpinnerInUploadImageBtn = true;
    const file = event.target.files[0]

    const canUploadFile = checkAcceptedFile(event.target.files[0].type, this.fileUploadAccept)
    if (!canUploadFile) {
      // this.presentToastOnlyImageFilesAreAllowedToDrag()
      this.notify.showToast(this.translationsMap.get('SorryFileTypeNotSupported'), 4, 'report_problem')
      this.logger.error('[IMAGE-UPLOAD] detectFiles: can not upload current file type--> NOT ALLOWED', event.target.files[0].type, this.fileUploadAccept)
      this.showSpinnerInUploadImageBtn = false;
      return;
    }

    // Firebase upload
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.uploadImageService.uploadUserAvatar(file, this.userId)

    } else {
      // Native upload
      this.logger.log('[USER-PROFILE] IMAGE upload with native service')
      // const userImageExist = this.usersService.userProfileImageExist.getValue()
      // this.logger.log('USER PROFILE IMAGE (USER-PROFILE ) upload with native service userImageExist ', userImageExist);

      this.uploadImageNativeService.uploadUserPhotoProfile_Native(file).subscribe((downloadurl) => {
        this.logger.log('[USER-PROFILE] downloadurl ', downloadurl)
        this.userProfileImageurl = ''

        if (environment.production && environment.production === true && this.appConfigService.getConfig().baseImageUrl === "https://api.tiledesk.com/v2/") {
          // this.logger.log('upload env prod? ', environment.production)
          this.userProfileImageurl = "https://rtm.tiledesk.com/images?path=uploads%2Fusers%2F" + this.userId + "%2Fimages%2Fphoto.jpg"
          // this.userProfileImageurl = "https://rtm.tiledesk.com/images?path=uploads%2Fusers%2F" + this.userId + "%2Fimages%2Fthumbnails_200_200-photo.jpg"

          this.logger.log('[USER-PROFILE] userProfileImageurl ', this.userProfileImageurl)
        } else if (environment.production && environment.production === true && this.appConfigService.getConfig().baseImageUrl !== "https://api.tiledesk.com/v2/") {
          this.userProfileImageurl = downloadurl;
        } else if (!environment.production) {
          // this.logger.log('upload env prod? ', environment.production)
          this.userProfileImageurl = downloadurl;
        }
        // this.logger.log('[USER-PROFILE] IMAGE upload with native service - RES downoloadurl', this.userProfileImageurl);
        this.timeStamp = (new Date()).getTime();
      }, (error) => {

        this.logger.error('[USER-PROFILE] IMAGE upload with native service - ERR ', error);
        this.showSpinnerInUploadImageBtn = false;
      })

    }
    this.fileInputUserProfileImage.nativeElement.value = '';
  }

  checkUserImageUploadIsComplete() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.uploadImageService.userImageWasUploaded.subscribe((image_exist) => {
        this.logger.log('[USER-PROFILE] - IMAGE UPLOADING IS COMPLETE ?  ', image_exist, '(usecase Firebase)');

        // this.notify.showWidgetStyleUpdateNotification(this.profilePhotoWasUploaded, 2, 'done');
        this.userImageHasBeenUploaded = image_exist;
        if (this.storageBucket && this.userImageHasBeenUploaded === true) {

          this.showSpinnerInUploadImageBtn = false;

          this.logger.log('[USER-PROFILE] - IMAGE UPLOADING IS COMPLETE - BUILD userProfileImageurl ');
          this.setImageProfileUrl(this.storageBucket)

          const stored_user = this.usersLocalDbService.getMemberFromStorage(this.userId);
          this.logger.log('[USER-PROFILE] stored_user', stored_user)
          stored_user['hasImage'] = true;
          this.usersLocalDbService.saveMembersInStorage(this.userId, stored_user, 'user-profile');
        } else if (image_exist === false) {
          this.notify.showToast(this.translationsMap.get('UserProfile.AnErrorHasOccurred'), 4, 'report_problem')
        }
      });
    } else {
      // Native upload
      this.uploadImageNativeService.userImageWasUploaded_Native.subscribe((image_exist) => {
        this.logger.log('[USER-PROFILE] - IMAGE UPLOADING IS COMPLETE ? ', image_exist, '(usecase Native)');

        this.userImageHasBeenUploaded = image_exist;
        if (this.userImageHasBeenUploaded === true) {
          this.showSpinnerInUploadImageBtn = false;

          const stored_user = this.usersLocalDbService.getMemberFromStorage(this.userId);
          this.logger.log('[USER-PROFILE] stored_user', stored_user)
          stored_user['hasImage'] = true;
          this.usersLocalDbService.saveMembersInStorage(this.userId, stored_user, 'user-profile');

        }
        // here "setImageProfileUrl" is missing because in the "upload" method there is the subscription to the downoload 
        // url published by the BehaviourSubject in the service "upload-image-native"
      })
    }
  }

  checkUserImageExist() {
    this.usersService.userProfileImageExist.subscribe((image_exist) => {
      this.logger.log('[USER-PROFILE] PROFILE IMAGE - USER PROFILE IMAGE EXIST ? ', image_exist);
      this.userProfileImageExist = image_exist;

      if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
        if (this.storageBucket && this.userProfileImageExist === true) {
          //  this.logger.log('[USER-PROFILE] PROFILE IMAGE - USER PROFILE IMAGE EXIST - setImageProfileUrl ');
          this.setImageProfileUrl(this.storageBucket)
        }
      } else {
        if (this.baseUrl && this.userProfileImageExist === true) {
          this.setImageProfileUrl_Native(this.baseUrl)
          // this.logger.log('[USER-PROFILE] PROFILE IMAGE - USER PROFILE IMAGE EXIST - NATIVE  - here yes ');
        }
      }
    });
  }

  setImageProfileUrl_Native(baseUrl) {
    this.userProfileImageurl = baseUrl + 'images?path=uploads%2Fusers%2F' + this.userId + '%2Fimages%2Fthumbnails_200_200-photo.jpg';
    this.logger.log('[SIDEBAR] PROFILE IMAGE (USER-PROFILE ) - userProfileImageurl ', this.userProfileImageurl);
    // this.timeStamp = (new Date()).getTime();

    // this.userProfileImageurl = ''
    // if (environment.production && environment.production === true) {
    //   // this.logger.log('setImageProfileUrl_Native env prod ', environment.production)
    //   this.userProfileImageurl = "https://rtm.tiledesk.com/images?path=uploads%2Fusers%2F" + this.userId + "%2Fimages%2Fphoto.jpg"

    // } else if (!environment.production) {
    //   this.userProfileImageurl = baseUrl + 'images?path=uploads%2Fusers%2F' + this.userId + '%2Fimages%2Fthumbnails_200_200-photo.jpg';
    // }

    // this.logger.log('setImageProfileUrl_Native userProfileImageurl ', this.userProfileImageurl)
    // this.logger.log('PROFILE IMAGE (USER-PROFILE ) - userProfileImageurl ', this.userProfileImageurl);
    this.timeStamp = (new Date()).getTime();
  }

  setImageProfileUrl(storageBucket) {
    this.userProfileImageurl = 'https://firebasestorage.googleapis.com/v0/b/' + storageBucket + '/o/profiles%2F' + this.userId + '%2Fphoto.jpg?alt=media';
    // this.logger.log('PROFILE IMAGE (USER-PROFILE ) - userProfileImageurl ', this.userProfileImageurl);
    this.timeStamp = (new Date()).getTime();
  }

  deleteUserProfileImage() {
    this.logger.log('[USER-PROFILE] - deleteUserProfileImage')

    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.logger.log('[USER-PROFILE] IMAGE deleteUserProfileImage with firebase service')
      this.uploadImageService.deleteUserProfileImage(this.userId);
    } else {
      this.logger.log('[USER-PROFILE] IMAGE deleteUserProfileImage with native service')
      this.uploadImageNativeService.deletePhotoProfile_Native(this.userId, 'user');
    }

    this.userProfileImageExist = false;
    this.userImageHasBeenUploaded = false

    const stored_user = this.usersLocalDbService.getMemberFromStorage(this.userId);
    this.logger.log('[USER-PROFILE] stored_user', stored_user)
    stored_user['hasImage'] = false;
    this.usersLocalDbService.saveMembersInStorage(this.userId, stored_user, 'user-profile');

    const delete_user_image_btn = <HTMLElement>document.querySelector('.delete-user-image');
    delete_user_image_btn.blur();
  }

  getUserProfileImage() {
    if (this.timeStamp) {
      this.logger.log('PROFILE IMAGE (USER-IMG IN USER-LOG) - getUserProfileImage ', this.userProfileImageurl);
      // setTimeout(() => {
      return this.sanitizer.bypassSecurityTrustUrl(this.userProfileImageurl + '&' + this.timeStamp);
      // }, 200);
    }
    return this.sanitizer.bypassSecurityTrustUrl(this.userProfileImageurl)
  }
  

  onEditFirstname(updatedFirstname) {
    this.logger.log('[USER-PROFILE] - onEditFirstname ==> firstname previous value ', this.firstnameCurrentValue);
    this.logger.log('[USER-PROFILE] - onEditFirstname ==> firstname updated value', updatedFirstname);
    if (this.firstnameCurrentValue !== updatedFirstname) {
      this.HAS_EDIT_FIRSTNAME = true;
      this.logger.log('[USER-PROFILE] - onEditFirstname HAS CHANGED FIRSTNAME: ', this.HAS_EDIT_FIRSTNAME);
    } else {
      this.HAS_EDIT_FIRSTNAME = false;
      this.logger.log('[USER-PROFILE] - onEditFirstname HAS CHANGED FIRSTNAME: ', this.HAS_EDIT_FIRSTNAME);
    }
  }

  onEditLastname(updatedLastname) {
    this.logger.log('[USER-PROFILE] - onEditLastname ==> lastname previous value ', this.lastnameCurrentValue);
    this.logger.log('[USER-PROFILE] - onEditLastname  ==> lastname updated value', updatedLastname);
    if (this.lastnameCurrentValue !== updatedLastname) {
      this.HAS_EDIT_LASTNAME = true;
      this.logger.log('[USER-PROFILE] - onEditLastname HAS CHANGED LASTNAME: ', this.HAS_EDIT_LASTNAME);
    } else {
      this.HAS_EDIT_LASTNAME = false;
      this.logger.log('[USER-PROFILE] - onEditLastname HAS CHANGED LASTNAME: ', this.HAS_EDIT_LASTNAME);
    }
  }





  trackUpdateProfileName(updateUserResponse) {
    this.logger.log('[USER-PROFILE] - trackUpdateProfileName  ', this.prjct_profile_name);
    this.logger.log('[USER-PROFILE] - updateUserResponse  ', updateUserResponse);
    if (!isDevMode()) {
      if (window['analytics']) {
        try {
          window['analytics'].page("User Profile Page, Profile", {

          });
        } catch (err) {
          this.logger.error('User Profile page error', err);
        }

        let userFullname = ''
        if (this.user.firstname && this.user.lastname) {
          userFullname = this.user.firstname + ' ' + this.user.lastname
        } else if (this.user.firstname && !this.user.lastname) {
          userFullname = this.user.firstname
        }


        try {
          window['analytics'].identify(this.user._id, {
            name: userFullname,
            email: this.user.email,
            plan: this.prjct_profile_name

          });
        } catch (err) {
          this.logger.error('identify in User Profile error', err);
        }

        try {
          window['analytics'].group(this.prjct_id, {
            name: this.prjct_name,
            plan: this.prjct_profile_name,
          });
        } catch (err) {
          this.logger.error('group in User Profile error', err);
        }
      }
    }
  }



  // closeModalUpdatingUser() {
    // this.displayModalUpdatingUser = 'none';
  // }

  // closeModalUpdatingUserHandler() {
  //   this.displayModalUpdatingUser = 'none';
  //   this.HAS_EDIT_FIRSTNAME = false;
  //   this.HAS_EDIT_LASTNAME = false;
  // }


  resendVerificationEmail() {
    this.usersService.resendVerifyEmail().subscribe((res) => {

      this.logger.log('[USER-PROFILE] - RESEND VERIFY EMAIL - RESPONSE ', res);
      const res_success = res['success'];
      this.logger.log('[USER-PROFILE] - RESEND VERIFY EMAIL - RESPONSE SUCCESS ', res_success);
      if (res_success === true) {
        // =========== NOTIFY SUCCESS===========
        this.notify.showResendingVerifyEmailNotification(this.userEmail);
      }
    }, (error) => {
      this.logger.error('[USER-PROFILE] - RESEND VERIFY EMAIL - ERROR ', error);
      const error_body = JSON.parse(error._body);
      this.logger.error('[USER-PROFILE] - RESEND VERIFY EMAIL - ERROR BODY', error_body);
      if (error_body['success'] === false) {
        this.notify.showWidgetStyleUpdateNotification(this.translationsMap.get('UserProfile.AnErrorHasOccurredSendingVerificationLink'), 4, 'report_problem')
      }
    }, () => {
      this.logger.log('[USER-PROFILE] - RESEND VERIFY EMAIL * COMPLETE *');
    });
  }




  presentModalSelectAProjectToManageEmailNotification() {
    Swal.fire({
      title: this.translationsMap.get('Warning'),
      text: this.translationsMap.get('ItIsNecessaryToSelectAProjectToManageNotificationEmails'),
      icon: "warning",
      showCancelButton: false,
      confirmButtonText: this.translate.instant('Ok'),
      focusConfirm: false,
      // button: "Ok",
      // dangerMode: false,
    })
  }


  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  this.logger.log("[BOT-CREATE] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }

  refreshPage() {
    location.reload();
  }

  translateStrings() {
    const keys = [
      'YourProfilePhotoHasBeenUploadedSuccessfully',
      'Warning',
      'ItIsNecessaryToSelectAProjectToManageNotificationEmails',
      'SorryFileTypeNotSupported',
      'AnErrorHasOccurred',
      'UserProfile.AnErrorHasOccurredSendingVerificationLink',
      'UserProfile.YourProfileHasBeenUploaded',
      'UserProfile.AnErrorHasOccurred'
    ];

    this.translate.get(keys).subscribe(translations => {
      Object.keys(translations).forEach(key => {
        this.translationsMap.set(key, translations[key])
      });
    });
  }

  // hides the sidebar if the user views his profile but has not yet selected a project
  selectSidebar() {
    const elemAppSidebar = <HTMLElement>document.querySelector('app-sidebar');
    this.logger.log('[USER-PROFILE]  elemAppSidebar ', elemAppSidebar)
    elemAppSidebar.setAttribute('style', 'display:none;');

    const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    this.logger.log('[USER-PROFILE] elemMainPanel ', elemMainPanel)
    elemMainPanel.setAttribute('style', 'width:100% !important; overflow-x: hidden !important;');
  }


  goBack() {
    this._location.back();
  }

  goToChangePsw() {
    this.logger.log('[USER-PROFILE] - GO TO CHANGE PSW - PROJECT ID ', this.projectId)
    if (this.projectId === undefined) {
      this.router.navigate(['user/' + this.userId + '/password/change']);
    } else {
      this.router.navigate(['project/' + this.projectId + '/user/' + this.userId + '/password/change']);
    }
  }

  goToAccountSettings() {
    this.logger.log('[USER-PROFILE] - GO TO USER  PROFILE SETTINGS - PROJECT ID ', this.projectId)
    if (this.projectId === undefined) {
      this.router.navigate(['user/' + this.userId + '/settings']);
    } else {
      this.router.navigate(['project/' + this.projectId + '/user/' + this.userId + '/settings']);
    }
  }

  goToNotificationSettings() {
    this.logger.log('[USER-PROFILE] - GO TO USER  NOTIFICATION SETTINGS - PROJECT ID ', this.projectId)
    if (this.projectId === undefined) {
      // this.router.navigate(['user/' + this.userId + '/notifications']);
      this.presentModalSelectAProjectToManageEmailNotification();
    } else {
      this.router.navigate(['project/' + this.projectId + '/user/' + this.userId + '/notifications']);
    }
  }
}
