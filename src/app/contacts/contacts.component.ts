import { AppConfigService } from './../services/app-config.service';
// tslint:disable:max-line-length
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ContactsService } from '../services/contacts.service';

import { Contact } from '../models/contact-model';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { NotifyService } from '../core/notify.service';
import { APP_SUMO_PLAN_NAME, avatarPlaceholder, getColorBck, PLAN_NAME } from '../utils/util';
import { UsersService } from '../services/users.service';
import { TranslateService } from '@ngx-translate/core';
import { ProjectPlanService } from '../services/project-plan.service';
import { Subscription } from 'rxjs';
import { LoggerService } from '../services/logger/logger.service';
declare const $: any;
const swal = require('sweetalert');

@Component({
  selector: 'appdashboard-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
})
export class ContactsComponent implements OnInit, OnDestroy, AfterViewInit {

  PLAN_NAME = PLAN_NAME;
  APP_SUMO_PLAN_NAME = APP_SUMO_PLAN_NAME;
  appSumoProfile: string;
  appSumoProfilefeatureAvailableFromBPlan: string;
  profile_name: string;
  upgradePlan: string;
  cancel: string;
  featureAvailableFromBPlan: string;
  featureAvailableFromEPlan: string;

  public colours = [
    '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e', '#16a085',
    '#27ae60', '#2980b9', '#8e44ad', '#2c3e50', '#f1c40f', '#e67e22',
    '#e74c3c', '#95a5a6', '#f39c12', '#d35400', '#c0392b', '#bdc3c7', '#7f8c8d'
  ];

  fullText: string;
  pageNo = 0;
  totalPagesNo_roundToUp: number;
  displaysFooterPagination: boolean;
  showSpinner: boolean;
  fullTextValue: string;
  queryString: string;
  projectId: string;

  contacts: Contact[];

  fullName: string;

  // SWITCH DISPLAYED DATA IN THE MODAL DEPENDING ON WHETHER THE
  // USER CLICK ON DELETE BTN OR ON EDIT BUTTON
  DISPLAY_DATA_FOR_UPDATE_MODAL = false;
  DISPLAY_DATA_FOR_DELETE_MODAL = false;
  // set to none the property display of the modal
  displayDeleteModal = 'none';

  // DATA DISPLAYED IN THE 'DELETE' MODAL
  id_toDelete: string;
  fullName_toDelete: string;

  // DATA DISPLAYED IN THE 'UPDATE' MODAL
  id_toUpdate: string;
  fullName_toUpdate: string;
  CONTACT_IS_VERIFIED = false;
  showAdvancedSearchOption = false;

  selectedContactEmail: string;
  selectedContactEmailValue: string;
  selectedContactTAG: string;
  selectedContactTAGValue: string;
  IS_CURRENT_USER_AGENT: boolean;
  IS_CURRENT_USER_OWNER: boolean;
  USER_ROLE: any;

  deleteLeadSuccessNoticationMsg: string;
  deleteLeadErrorNoticationMsg: string;

  subscription: Subscription;
  prjct_profile_type: string;
  subscription_is_active: any;
  prjct_profile_name: string;
  subscription_end_date: Date;
  trial_expired: boolean;
  browserLang: string;
  hasClickedTrashed: boolean = false;
  trashedContanctCount: any;

  searchInYourContactsPlaceholder: string;
  searchInTrashPlaceholder: string;
  searchPlaceholder: string;
  areYouSure: string;
  contactWillBePermanentlyDeleted: string;
  errorDeleting: string;
  done_msg: string;
  pleaseTryAgain: string;
  contactWasSuccessfullyDeleted: string;

  deleteContact_msg: string;
  youCannotDeleteThisContact: string
  contactHasBeenMovedToTheTrash: string;
  moveContactToTrash_msg: string;
  moveToTrash_msg: string;
  countOfActiveContacts: number;

  CHAT_BASE_URL: string;
  id_request: string;
  payIsVisible: boolean;
  public_Key: any;
  isChromeVerGreaterThan100: boolean;
  onlyOwnerCanManageTheAccountPlanMsg: string;
  learnMoreAboutDefaultRoles: string;
  tagsArray = [];
  emailArray = [];
  HAS_SEARCHED: boolean = false
  fullTextIsAValidEmail: boolean = false;
  constructor(
    private contactsService: ContactsService,
    private router: Router,
    private auth: AuthService,
    private notify: NotifyService,
    private usersService: UsersService,
    private translate: TranslateService,
    private prjctPlanService: ProjectPlanService,
    private appConfigService: AppConfigService,
    private logger: LoggerService
  ) { }

  ngOnInit() {
    this.getTranslation();
    this.getOSCODE();
    // this.auth.checkRoleForCurrentProject();
    this.getContacts();
    this.getAllContacts()
    this.getCurrentProject();
    this.getProjectUserRole();
    this.getProjectPlan();
    this.selectedContactTAG
    // console.log('oninit this.selectedContactTAG', this.selectedContactTAG)

    this.CHAT_BASE_URL = this.appConfigService.getConfig().CHAT_BASE_URL;

    // this.getTrashedContactsCount();
    // this.getActiveContactsCount();

    // ----------------------------------------
    //  Bootstrap 3.0 - Keep Dropdown Open
    //  http://jsfiddle.net/KyleMit/ZS4L7/
    // ----------------------------------------
    $('.dropdown.keep-open').on({
      "shown.bs.dropdown": function () { this.closable = false; },
      "click": function () { this.closable = true; },
      "hide.bs.dropdown": function () { return this.closable; }
    });
    this.getBrowserVersion();
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    })
  }



  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;

    let keys = this.public_Key.split("-");

    keys.forEach(key => {

      if (key.includes("PAY")) {
        this.logger.log('[CONTACTS-COMP] PUBLIC-KEY - key', key);
        let pay = key.split(":");

        if (pay[1] === "F") {
          this.payIsVisible = false;
          this.logger.log('[CONTACTS-COMP] - pay isVisible', this.payIsVisible);
        } else {
          this.payIsVisible = true;
          this.logger.log('[CONTACTS-COMP] - pay isVisible', this.payIsVisible);
        }
      }
    });

    if (!this.public_Key.includes("PAY")) {
      this.payIsVisible = false;
      this.logger.log('[CONTACTS-COMP] - pay isVisible', this.payIsVisible);
    }
  }


  getTranslation() {

    this.translate.get('AvailableFromThePlan', { plan_name: PLAN_NAME.E })
      .subscribe((translation: any) => {
        this.featureAvailableFromEPlan = translation;
      });

    this.translate.get('AvailableFromThePlan', { plan_name: PLAN_NAME.B })
      .subscribe((translation: any) => {
        this.featureAvailableFromBPlan = translation;
      });

    this.translate.get('DeleteLeadSuccessNoticationMsg')
      .subscribe((text: string) => {
        this.deleteLeadSuccessNoticationMsg = text;
        // this.logger.log('[CONTACTS-COMP] + + + DeleteLeadSuccessNoticationMsg', text)
      });

    this.translate.get('DeleteLeadErrorNoticationMsg')
      .subscribe((text: string) => {

        this.deleteLeadErrorNoticationMsg = text;
        // this.logger.log('[CONTACTS-COMP] + + + DeleteLeadErrorNoticationMsg', text)
      });

    this.translate.get('AreYouSure')
      .subscribe((text: string) => {
        this.areYouSure = text;
        // this.logger.log('[CONTACTS-COMP] + + + areYouSure', text)
      });

    this.translate.get('Done')
      .subscribe((text: string) => {
        this.done_msg = text;
      });

    this.translate.get('TheContactWillBePermanentlyDeleted')
      .subscribe((text: string) => {
        this.contactWillBePermanentlyDeleted = text;
      });

    this.translate.get('ErrorDeleting')
      .subscribe((text: string) => {
        this.errorDeleting = text;
      });

    this.translate.get('PleaseTryAgain')
      .subscribe((text: string) => {
        this.pleaseTryAgain = text;
      });


    this.translate.get('TheContactWasSuccessfullyDeleted')
      .subscribe((text: string) => {
        this.contactWasSuccessfullyDeleted = text;
      });

    this.translate.get('DeleteContact')
      .subscribe((text: string) => {
        this.deleteContact_msg = text;
        // this.logger.log('[CONTACTS-COMP] + + + DeleteContact_msg', this.deleteContact_msg)
      });

    this.translate.get('YouCannotDeleteThisContact')
      .subscribe((text: string) => {
        this.youCannotDeleteThisContact = text;
      });

    this.translate.get('TheContactHasBeenMovedToTheTrash')
      .subscribe((text: string) => {
        this.contactHasBeenMovedToTheTrash = text;
      });

    this.translate.get('MoveToTrash')
      .subscribe((text: string) => {
        this.moveToTrash_msg = text;
      });

    this.translate.get('Pricing.UpgradePlan')
      .subscribe((translation: any) => {
        this.upgradePlan = translation;
      });

    this.translate.get('Cancel')
      .subscribe((translation: any) => {
        this.cancel = translation;
      });

    this.translate.get('OnlyUsersWithTheOwnerRoleCanManageTheAccountPlan')
      .subscribe((translation: any) => {

        this.onlyOwnerCanManageTheAccountPlanMsg = translation;
      });

    this.translate.get('LearnMoreAboutDefaultRoles')
      .subscribe((translation: any) => {

        this.learnMoreAboutDefaultRoles = translation;
      });

    this.translatePlaceholder();

  }

  translatePlaceholder() {
    // this.translate.get('SearchYourContacts')
    this.translate.get('SearchByFirstAndOrLastName')
      .subscribe((text: string) => {
        this.searchInYourContactsPlaceholder = text;
        // this.logger.log('[CONTACTS-COMP] + + + translatePlaceholder SearchYourContacts', text)
      });


    this.translate.get('SearchInTrash')
      .subscribe((text: string) => {
        this.searchInTrashPlaceholder = text;
        // this.logger.log('[CONTACTS-COMP] + + + DeleteLeadSuccessNoticationMsg', text)
      });
  }

  ngAfterViewInit() {
    this.getElemSearchField();
  }

  getElemSearchField() {
    // const elemSearchField =   (<HTMLInputElement>document.getElementById('#search_field'));
    const elemSearchField = <HTMLInputElement>document.querySelector('#search_field');
    this.logger.log('[CONTACTS-COMP] GET elemSearchField', elemSearchField)
    //  elemSearchField.innerHTML = 'res';
  }

  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      this.logger.log('[CONTACTS-COMP] getProjectPlan project Profile Data', projectProfileData)
      if (projectProfileData) {
        this.profile_name = projectProfileData.profile_name
        this.prjct_profile_type = projectProfileData.profile_type;
        this.subscription_is_active = projectProfileData.subscription_is_active;

        this.subscription_end_date = projectProfileData.subscription_end_date;
        this.trial_expired = projectProfileData.trial_expired

        // this.buildPlanName(projectProfileData.profile_name, this.browserLang, this.prjct_profile_type);
        if (projectProfileData.extra3) {
          this.appSumoProfile = APP_SUMO_PLAN_NAME[projectProfileData.extra3]
          this.appSumoProfilefeatureAvailableFromBPlan = APP_SUMO_PLAN_NAME['tiledesk_tier3']
        }
      }
    }, error => {

      this.logger.error('[CONTACTS-COMP] - getProjectPlan - ERROR', error);
    }, () => {

      this.logger.log('[CONTACTS-COMP] - getProjectPlan * COMPLETE')

    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  buildPlanName(planName: string, browserLang: string, planType: string) {
    if (planType === 'payment') {
      this.getPaidPlanTranslation(planName)
      // if (browserLang === 'it') {
      //   this.prjct_profile_name = 'Piano ' + planName;
      //   return this.prjct_profile_name
      // } else if (browserLang !== 'it') {
      //   this.prjct_profile_name = planName + ' Plan';
      //   return this.prjct_profile_name
      // }
    }
  }

  getPaidPlanTranslation(project_profile_name) {
    this.translate.get('PaydPlanName', { projectprofile: project_profile_name })
      .subscribe((text: string) => {
        this.prjct_profile_name = text;
        // this.logger.log('+ + + PaydPlanName ', text)
      });
  }


  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        this.projectId = project._id
        // this.logger.log('[CONTACTS-COMP] project ID from AUTH service subscription  ', this.projectId)
      }
    });
  }

  getProjectUserRole() {
    this.usersService.project_user_role_bs.subscribe((user_role) => {
      const current_user_role = user_role;
      this.USER_ROLE = user_role;
      this.logger.log('[CONTACTS-COMP] - SUBSCRIBE PROJECT_USER_ROLE_BS ', current_user_role);
      if (current_user_role) {
        this.logger.log('[CONTACTS-COMP] - PROJECT USER ROLE ', current_user_role);
        if (current_user_role === 'agent') {
          this.IS_CURRENT_USER_AGENT = true;
          this.logger.log('[CONTACTS-COMP] - PROJECT USER ROLE - IS CURRENT USER AGENT? ', this.IS_CURRENT_USER_AGENT);
        } else {
          this.IS_CURRENT_USER_AGENT = false;
          this.logger.log('[CONTACTS-COMP] - PROJECT USER ROLE - IS CURRENT USER AGENT? ', this.IS_CURRENT_USER_AGENT);
        }


        if (current_user_role === 'owner') {
          this.IS_CURRENT_USER_OWNER = true;
          this.logger.log('[CONTACTS-COMP] - PROJECT USER ROLE - IS CURRENT USER OWNER? ', this.IS_CURRENT_USER_OWNER);
        } else {
          this.IS_CURRENT_USER_OWNER = false;
          this.logger.log('[CONTACTS-COMP] - PROJECT USER ROLE - IS CURRENT USER OWNER? ', this.IS_CURRENT_USER_OWNER);
        }
      }
    });
  }

  decreasePageNumber() {
    const decreasePageNumberBtn = <HTMLElement>document.querySelector('.decrease-page-number-btn');
    decreasePageNumberBtn.blur()

    this.pageNo -= 1;

    this.logger.log('[CONTACTS-COMP] - DECREASE PAGE NUMBER ', this.pageNo);
    this.getContacts()
  }

  increasePageNumber() {
    const increasePageNumberBtn = <HTMLElement>document.querySelector('.increase-page-number-btn');
    increasePageNumberBtn.blur()

    this.pageNo += 1;
    this.logger.log('[CONTACTS-COMP]  - INCREASE PAGE NUMBER ', this.pageNo);
    this.getContacts()
  }

  validateEmail(appSumoActivationEmail) {
    var validateEmailRegex = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/
    if (appSumoActivationEmail.match(validateEmailRegex)) {
      // console.log('Valid email address!')
      return true;
    } else {
      // console.log('Invalid email address!')
      return false;
    }
  }

  search() {
    this.HAS_SEARCHED = true
    // ---------------------------------------------------------------------
    // Programmatically close Dropdown Menu
    // ---------------------------------------------------------------------
    const elemInputGroupDropdown = <HTMLInputElement>document.querySelector('#dropdown_input_group_btn');
    this.logger.log('[CONTACTS-COMP] - elemInputGroupDropdown ', elemInputGroupDropdown);

    const elemBtnDropdown = <HTMLInputElement>document.querySelector('#dropdown_btn');
    this.logger.log('[CONTACTS-COMP] - elemBtnDropdown ', elemBtnDropdown);

    const isOpen = elemBtnDropdown.getAttribute("aria-expanded")
    this.logger.log('[CONTACTS-COMP] - elemBtnDropdown isOpen ', isOpen);

    if (isOpen === 'true') {
      elemInputGroupDropdown.classList.remove('open');
      elemBtnDropdown.setAttribute("aria-expanded", 'false');
    }



    // RESOLVE THE BUG: THE BUTTON SEARCH REMAIN FOCUSED AFTER PRESSED
    const searchBtn = <HTMLElement>document.querySelector('.searchbtn');
    this.logger.log('[CONTACTS-COMP] - SEARCH BTN ', searchBtn)
    searchBtn.blur();

    this.pageNo = 0

    if (this.fullText) {

      this.fullTextIsAValidEmail = this.validateEmail(this.fullText)
      // console.log('[CONTACTS-COMP] - FULL TEXT IS A VALID EMAIL: ',  this.fullTextIsAValidEmail);


      if (this.fullTextIsAValidEmail === false) {
        this.fullTextValue = this.fullText;
      } else {
        this.selectedContactEmail = this.fullText;
        this.fullTextValue = '';
        this.fullText = undefined
      }

    } else {
      this.logger.log('[CONTACTS-COMP] - SEARCH FOR FULL TEXT ', this.fullText);
      this.fullTextValue = ''

      if (this.selectedContactEmail || this.selectedContactTAG) {
        this.searchInYourContactsPlaceholder = "ADVANCED SEARCH"
      }
    }

    if (this.selectedContactEmail) {
      this.selectedContactEmailValue = this.selectedContactEmail;
      this.logger.log('[CONTACTS-COMP]  - SEARCH FOR selectedContactEmailValue ', this.selectedContactEmailValue);
    } else {

      this.selectedContactEmailValue = ''
      this.logger.log('[CONTACTS-COMP]  - SEARCH FOR selectedContactEmailValue ', this.selectedContactEmailValue);
    }

    if (this.selectedContactTAG) {
      this.selectedContactTAGValue = this.selectedContactTAG;
      this.logger.log('[CONTACTS-COMP]  - SEARCH FOR selectedContactTAGValue ', this.selectedContactTAGValue);
    } else {

      this.selectedContactTAGValue = ''
      this.logger.log('[CONTACTS-COMP]  - SEARCH FOR selectedContactTAGValue ', this.selectedContactTAGValue);
    }

    this.queryString = 'full_text=' + this.fullTextValue + '&email=' + this.selectedContactEmailValue + '&tags=' + this.selectedContactTAGValue
    this.logger.log('[CONTACTS-COMP] - SEARCH - QUERY STRING ', this.queryString);

    this.getContacts();

  }

  // Not used
  onfocusFullTextSearchField(ev) {

    this.logger.log('[CONTACTS-COMP] + + + translatePlaceholder searchInYourContactsPlaceholder', this.searchInYourContactsPlaceholder)

    if (this.searchInYourContactsPlaceholder === "ADVANCED SEARCH") {

      this.translatePlaceholder()
      // this.translate.get('SearchYourContacts')
      //   .subscribe((text: string) => {
      //     this.searchInYourContactsPlaceholder = text;
      //     this.logger.log('+ + + translatePlaceholder SearchYourContacts', text)
      //   });
    }
    // this.logger.log('!!!! CONTACTS - onfocusFullTextSearchField event ', ev);
    // ev.preventDefault();
    // ev.stopPropagation();

    this.logger.log('[CONTACTS-COMP] - onFocusSearchField fullText ', this.fullText);
    this.logger.log('[CONTACTS-COMP] - onFocusSearchField selectedContactEmail ', this.selectedContactEmail);

    // if (this.fullText.includes('email:') === true) {
    //   this.logger.log('!!!! CONTACTS - SEARCH FULLTEXT CONTAINS replace this: ', 'email:' + this.selectedContactEmail);
    //   const cleanedFullText = this.fullText.replace('email:' + this.selectedContactEmail, '');
    //   this.logger.log('!!!! CONTACTS - FULLTEXT after replace - cleanedFullText', cleanedFullText);
    //   this.fullText = cleanedFullText;
    //   // ---------------------------------------------------------------------
    //   // Programmatically open Dropdown Menu
    //   // ---------------------------------------------------------------------

    if (this.selectedContactEmail) {
      const elemBtnDropdown = <HTMLInputElement>document.querySelector('#dropdown_btn');
      this.logger.log('[CONTACTS-COMP] - elemBtnDropdown ', elemBtnDropdown);

      const isOpen = elemBtnDropdown.getAttribute("aria-expanded");
      this.logger.log('[CONTACTS-COMP] - elemBtnDropdown isOpen ', isOpen);

      if (isOpen === 'false') {
        elemBtnDropdown.click()
        elemBtnDropdown.setAttribute("aria-expanded", 'true')
        elemBtnDropdown.focus();
        ev.preventDefault();
        ev.stopPropagation();
      }
    }
  }

  clearFullText() {
    this.HAS_SEARCHED = false;
    const clearSearchBtnEle = <HTMLInputElement>document.querySelector('#clear-search-btn');
    this.logger.log('[CONTACTS-COMP] clearSearchBtnEle', clearSearchBtnEle)
    if (clearSearchBtnEle) {
      clearSearchBtnEle.blur()
    }

    if (this.searchInYourContactsPlaceholder === "ADVANCED SEARCH") {

      this.translatePlaceholder()
      // this.translate.get('SearchYourContacts')
      //   .subscribe((text: string) => {
      //     this.searchInYourContactsPlaceholder = text;
      //     this.logger.log('+ + + translatePlaceholder SearchYourContacts', text)
      //   });
    }

    this.pageNo = 0
    this.fullText = '';

    if (this.selectedContactEmail) {
      this.selectedContactEmail = '';
    }

    if (this.selectedContactTAG) {
      this.selectedContactTAG = '';
    }

    this.queryString = '';
    this.logger.log('[CONTACTS-COMP] - CLEAR SEARCH - QUERY STRING ', this.queryString);

    this.getContacts();
  }

  clearSearch() {
    // RESOLVE THE BUG: THE BUTTON CLEAR-SEARCH REMAIN FOCUSED AFTER PRESSED
    const clearSearchBtn = <HTMLElement>document.querySelector('.clearsearchbtn');
    this.logger.log('[CONTACTS-COMP] - CLEAR SEARCH BTN', clearSearchBtn)
    clearSearchBtn.blur()

    this.pageNo = 0
    this.fullText = '';
    this.selectedContactEmail = '';
    this.selectedContactTAG = undefined;
    this.queryString = '';
    this.getContacts();
  }

  // ------------------------------------------------------------------------------
  // @ Tags - on change tags get selected tag name
  // ------------------------------------------------------------------------------
  tagNameSelected() {
    this.logger.log('[CONTACTS-COMP] - selectedContactTAG ', this.selectedContactTAG);
  }

  emailSelected() {
    this.logger.log('[CONTACTS-COMP] - selectedContactEmail ', this.selectedContactEmail);
  }

  getAllContacts() {
    this.contactsService.getAllLeadsActiveWithLimit(10000).subscribe((res: any) => {

      const allContacts = res['leads'];
      this.logger.log('[CONTACTS-COMP] - GET ALL LEADS - LEADS  ', allContacts);
      allContacts.forEach(contact => {
        // console.log('[CONTACTS-COMP] - CONTACTS LIST > contact', contact);
        if (contact && contact.tags.length > 0) {
          // console.log('[CONTACTS-COMP] - CONTACTS LIST > contact > tags ', contact.tags);
          contact.tags.forEach((tag: string) => {
            // console.log('[CONTACTS-COMP] - CONTACTS LIST > contact > tags >  tag', tag);
            let index = this.tagsArray.findIndex(x => x.name == tag)
            // console.log('[CONTACTS-COMP] - CONTACTS LIST > contact > tags >  tag index', index);
            if (index === -1) {
              this.tagsArray.push({ 'name': tag });
            } else {
              // console.log("object already exists ")
            }
          });
        }
        // console.log('[CONTACTS-COMP] - CONTACTS LIST > contact > TAG ARRAY ', this.tagsArray);
        this.tagsArray = this.tagsArray.slice(0)


        // console.log('[CONTACTS-COMP] - CONTACTS LIST > contact', contact);
        if (contact && contact.email) {
          // console.log('[CONTACTS-COMP] - CONTACTS LIST > contact > email ', contact.email);
          this.emailArray.push({ 'name': contact.email });
        }

        // console.log('[CONTACTS-COMP] - CONTACTS LIST > contact > EMAIL ARRAY ', this.emailArray);
        this.emailArray = this.emailArray.slice(0);
      });

      // console.log('[CONTACTS-COMP] - GET ALL LEADS - RES  ', allContacts);
    }, (error) => {
      this.logger.error('[CONTACTS-COMP] - GET ALL LEADS - ERROR  ', error);

    }, () => {
      this.logger.log('[CONTACTS-COMP] - GET ALL LEADS * COMPLETE *');

    });
  }

  /**
   * GET CONTACTS  */
  getContacts() {
    this.getTrashedContactsCount();
    this.getActiveContactsCount();

    this.showSpinner = true;
    this.contactsService.getLeadsActiveOrTrashed(this.queryString, this.pageNo, this.hasClickedTrashed).subscribe((leads_object: any) => {
      this.logger.log('[CONTACTS-COMP] - GET LEADS RESPONSE ', leads_object);

      this.contacts = leads_object['leads'];
      this.logger.log('[CONTACTS-COMP] - CONTACTS LIST ', this.contacts);


      const contactsCount = leads_object['count'];
      this.logger.log('[CONTACTS-COMP] - CONTACTS COUNT ', contactsCount);

      this.displayHideFooterPagination(contactsCount);

      const contactsPerPage = leads_object['perPage'];
      this.logger.log('[CONTACTS-COMP] - N° OF CONTACTS X PAGE ', contactsCount);

      const totalPagesNo = contactsCount / contactsPerPage;
      this.logger.log('[CONTACTS-COMP] - TOTAL PAGES NUMBER', totalPagesNo);

      this.totalPagesNo_roundToUp = Math.ceil(totalPagesNo);
      this.logger.log('[CONTACTS-COMP] - TOTAL PAGES No ROUND TO UP ', this.totalPagesNo_roundToUp);

      this.generateAvatarFromNameAndGetIfContactIsAuthenticated(this.contacts);
    }, (error) => {
      this.logger.error('[CONTACTS-COMP] - GET LEADS - ERROR  ', error);
      this.showSpinner = false;
    }, () => {
      this.logger.log('[CONTACTS-COMP] - GET LEADS * COMPLETE *');
      this.showSpinner = false;
    });
  }

  generateAvatarFromNameAndGetIfContactIsAuthenticated(contacts_list) {
    contacts_list.forEach(contact => {
      if (contact) {
        // const id_contact = contact._id
        const leadid = contact.lead_id
        this.logger.log('[CONTACTS-COMP] - * leadid *', leadid);

        // let initial = '';
        // let fillColour = '';

        let newInitials = '';
        let newFillColour = '';
        if (contact.fullname) {
          const name = contact.fullname;
          // this.logger.log('!!!!! CONTACTS - NAME OF THE CONTACT ', name);

          // initial = name.charAt(0).toUpperCase();
          // // this.logger.log('!!!!! CONTACTS - INITIAL OF NAME OF THE CONTACT ', initial);
          // const charIndex = initial.charCodeAt(0) - 65
          // const colourIndex = charIndex % 19;
          // // this.logger.log('!!!!! CONTACTS - COLOUR INDEX ', colourIndex);
          // fillColour = this.colours[colourIndex];
          // // this.logger.log('!!!!! CONTACTS - NAME INITIAL ', initial, ' COLOUR INDEX ', colourIndex, 'FILL COLOUR ', fillColour);

          // NEW - FULL NAME INITIAL AS DISPLAYED IN THE WIDGET
          newInitials = avatarPlaceholder(name);
          newFillColour = getColorBck(name)


        } else {
          newInitials = 'N/A';
          newFillColour = '#6264a7';

        }



        contact.avatar_fill_colour = newFillColour;
        contact.name_initial = newInitials
        contact.contact_is_verified = this.CONTACT_IS_VERIFIED

        this.getProjectUserById(contact, leadid)
        // for (const c of contacts_list) {

        //   if (c._id === id_contact) {
        //     // this.logger.log('!!!! CONTACTS  - c._id ', c._id, 'id_contact ', id_contact)
        //     c.avatar_fill_colour = newFillColour;
        //     c.name_initial = newInitials
        //     c.contact_is_verified = this.CONTACT_IS_VERIFIED
        //   }
        // }
      }
    });
  }

  // --------------------------------------------------
  // @ Tags - display more tags
  // --------------------------------------------------
  displayMoreTags(contactid) {
    const hiddenTagsElem = <HTMLElement>document.querySelector(`#more_tags_${contactid}`);
    this.logger.log("[WS-REQUESTS-LIST][SERVED] - displayMoreTags - hiddenTagsElem ", hiddenTagsElem);
    hiddenTagsElem.style.display = "inline-block";

    const moreTagsBtn = <HTMLElement>document.querySelector(`#more_tags_btn_${contactid}`);
    this.logger.log("[WS-REQUESTS-LIST][SERVED] - displayMoreTags - moreTagsBtn ", moreTagsBtn);
    moreTagsBtn.style.display = "none";

  }

  // --------------------------------------------------
  // @ Tags - display less tags
  // --------------------------------------------------
  displayLessTag(contactid) {
    const hiddenTagsElem = <HTMLElement>document.querySelector(`#more_tags_${contactid}`);
    this.logger.log("[WS-REQUESTS-LIST][SERVED] - displayLessTag - hiddenTagsElem ", hiddenTagsElem);
    hiddenTagsElem.style.display = "none";

    const moreTagsBtn = <HTMLElement>document.querySelector(`#more_tags_btn_${contactid}`);
    this.logger.log("[WS-REQUESTS-LIST][SERVED] - displayLessTag - moreTagsBtn ", moreTagsBtn);
    moreTagsBtn.style.display = "inline-block";
  }

  getProjectUserById(contact, leadid) {
    this.usersService.getProjectUserById(leadid).subscribe((projectUser: any) => {


      this.logger.log('[CONTACTS-COMP] - GET PROJECT USER BY LEAD ID RES  ', projectUser);
      // this.logger.log('[CONTACTS-COMP] - GET PROJECT USER BY LEAD ID projectUser[0]  ', projectUser[0]);
      // this.logger.log('[CONTACTS-COMP] - GET PROJECT USER BY LEAD ID projectUser[0] isAuthenticated ', projectUser[0]['isAuthenticated']);
      // this.CONTACT_IS_VERIFIED = projectUser[0]['isAuthenticated']
      // this.logger.log('[CONTACTS-COMP] - GET PROJECT USER BY LEAD ID CONTACT_IS_VERIFIED ', this.CONTACT_IS_VERIFIED);
      contact.contact_is_verified = projectUser[0]['isAuthenticated']
    },
      (error) => {
        this.logger.error('[CONTACTS-COMP] - GET PROJECT USER BY LEAD ID ERR  ', error);
      },
      () => {
        this.logger.log('[CONTACTS-COMP] - GET PROJECT USER BY LEAD ID * COMPLETE *');
      });
  }

  // --------------------------------------------------
  // TRASH FOREVER METHODS
  // --------------------------------------------------
  openTrashedContact() {
    this.pageNo = 0
    this.fullText = '';
    this.selectedContactEmail = '';
    this.selectedContactTAG = '';
    this.queryString = '';
    this.hasClickedTrashed = true
    this.getContacts()
  }


  closeTrashContacts() {
    this.pageNo = 0
    this.fullText = '';
    this.selectedContactEmail = '';
    this.selectedContactTAG = ''
    this.queryString = '';
    this.hasClickedTrashed = false;
    this.getContacts();
  }

  getTrashedContactsCount() {
    this.contactsService.getLeadsTrashed().subscribe((trashedleads: any) => {
      this.logger.log('[CONTACTS-COMP] - GET TRASHED LEADS RESPONSE ', trashedleads)
      if (trashedleads) {
        this.trashedContanctCount = trashedleads.count
      }
    }, (error) => {
      this.logger.error('[CONTACTS-COMP] - GET TRASHED LEADS - ERROR ', error);
    }, () => {
      this.logger.log('[CONTACTS-COMP] - GET TRASHED LEADS * COMPLETE *');
    });
  }

  getActiveContactsCount() {
    this.contactsService.getLeadsActive().subscribe((activeleads: any) => {
      this.logger.log('[CONTACTS-COMP] - GET ACTIVE LEADS RESPONSE ', activeleads)
      if (activeleads) {
        this.countOfActiveContacts = activeleads['count'];
      }
    }, (error) => {
      this.logger.error('[CONTACTS-COMP] - GET ACTIVE LEADS - ERROR ', error);
    }, () => {
      this.logger.log('[CONTACTS-COMP] - GET ACTIVE LEADS * COMPLETE *');
    });
  }

  deleteContactForever(contactid: string) {
    this.contactsService.getRequestsByRequesterId(contactid, 0)
      .subscribe((requests_object: any) => {
        this.logger.log('[CONTACTS-COMP]  deleteContactForever requests_object', requests_object);

        const request_count = requests_object.count
        this.logger.log('[CONTACTS-COMP]  deleteContactForever request_count', request_count);
        if (request_count !== 0) {

          swal({
            title: this.deleteContact_msg,
            text: this.youCannotDeleteThisContact,
            icon: "info",
            button: true,
            dangerMode: false,
          })
        } else {

          this.logger.log('[CONTACTS-COMP]  deleteContactForever ', contactid)

          swal({
            title: this.areYouSure + "?",
            text: this.contactWillBePermanentlyDeleted,
            icon: "warning",
            buttons: true,
            dangerMode: true,
          })
            .then((willDelete) => {
              if (willDelete) {
                this.logger.log('[CONTACTS-COMP] swal willDelete', willDelete)

                this.contactsService.deleteLeadForever(contactid).subscribe((res: any) => {
                  this.logger.log('[CONTACTS-COMP] in swal deleteRequest res ', res)

                }, (error) => {
                  this.logger.error('[CONTACTS-COMP] in swal deleteRequest res - ERROR ', error);

                  swal(this.errorDeleting, this.pleaseTryAgain, {
                    icon: "error",
                  });

                }, () => {
                  this.logger.log('[CONTACTS-COMP] in swal deleteRequest res* COMPLETE *');

                  swal(this.done_msg + "!", this.contactWasSuccessfullyDeleted, {
                    icon: "success",
                  }).then((okpressed) => {
                    this.getContacts();
                    // this.getTrashedContacts();
                  });

                });
              } else {
                this.logger.log('[CONTACTS-COMP] swal willDelete', willDelete)
                // swal("Your imaginary file is safe!");
              }
            });
        }
      })
  }

  // --------------------------------------------------
  // MOVE TO TRASH
  // --------------------------------------------------
  moveContactToTrash(contactid: string, fullName: string) {
    // this.logger.log('!!!!! CONTACTS - ON MODAL DELETE OPEN -> USER ID ', id);

    // this.displayDeleteModal = 'block';

    // this.id_toDelete = id;
    // this.fullName_toDelete = fullName;

    if (fullName) {
      this.translate.get('MoveTheContactToTheTrash', { contactname: fullName }).subscribe((text: string) => {
        this.moveContactToTrash_msg = text
      })
    } else {
      this.translate.get('MoveTheContactToTheTrashNoName').subscribe((text: string) => {
        this.moveContactToTrash_msg = text
      })
    }

    this.logger.log('[CONTACTS-COMP] - moveContactToTrash ', this.moveContactToTrash_msg);

    swal({
      title: this.moveToTrash_msg,
      text: this.moveContactToTrash_msg,
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
      .then((willDelete) => {
        if (willDelete) {
          this.logger.log('[CONTACTS-COMP] swal willDelete', willDelete)

          this.contactsService.deleteLead(contactid).subscribe((res: any) => {
            this.logger.log('[CONTACTS-COMP] in swal deleteRequest res ', res)

          }, (error) => {
            this.logger.error('[CONTACTS-COMP] in swal deleteRequest res - ERROR ', error);

            swal(this.errorDeleting, this.pleaseTryAgain, {
              icon: "error",
            });

          }, () => {
            this.logger.log('[CONTACTS-COMP] in swal deleteRequest res* COMPLETE *');

            swal(this.done_msg + "!", this.contactHasBeenMovedToTheTrash, {
              icon: "success",
            }).then((okpressed) => {
              this.getContacts();
            });

          });
        } else {
          this.logger.log('[CONTACTS-COMP] swal willDelete', willDelete)
          // swal("Your imaginary file is safe!");
        }
      });
  }

  restore_contact(contactid: string) {
    this.contactsService.restoreLead(contactid)
      .subscribe((lead: any) => {
        this.logger.log('[CONTACTS-COMP] - RESTORE CONTACT RES ', lead);

      }, (error) => {
        this.logger.error('[CONTACTS-COMP] - RESTORE CONTACT - ERROR ', error);
        // =========== NOTIFY ERROR ===========
        // this.notify.showNotification(this.deleteLeadErrorNoticationMsg, 4, 'report_problem');
      }, () => {
        this.logger.log('[CONTACTS-COMP] - RESTORE CONTACT * COMPLETE *');
        // =========== NOTIFY SUCCESS===========
        this.getContacts();
        // this.notify.showNotification(this.deleteLeadSuccessNoticationMsg, 2, 'done');
      });

  }

  // CLOSE MODAL WITHOUT SAVE THE UPDATES OR WITHOUT CONFIRM THE DELETION
  onCloseDeleteModal() {
    this.displayDeleteModal = 'none';
  }

  /**
   * DELETE CONTACT (WHEN THE 'CONFIRM' BUTTON IN MODAL IS CLICKED)  */
  deleteContact() {
    this.displayDeleteModal = 'none';

    this.contactsService.deleteLead(this.id_toDelete)
      .subscribe((lead: any) => {
        this.logger.log('[CONTACTS-COMP] - DELETE CONTACT RES ', lead);

        // RE-RUN GET CONTACT TO UPDATE THE TABLE

        this.ngOnInit();
      }, (error) => {
        this.logger.error('[CONTACTS-COMP] - DELETE REQUEST - ERROR ', error);
        // =========== NOTIFY ERROR ===========
        // this.notify.showNotification('An error occurred while deleting contact', 4, 'report_problem');
        this.notify.showNotification(this.deleteLeadErrorNoticationMsg, 4, 'report_problem');
      }, () => {
        this.logger.log('[CONTACTS-COMP] - DELETE REQUEST * COMPLETE *');
        // =========== NOTIFY SUCCESS===========
        // this.notify.showNotification('Contact successfully deleted', 2, 'done');
        this.notify.showNotification(this.deleteLeadSuccessNoticationMsg, 2, 'done');
      });

  }

  checkPlanAndPresentModal() {
    if ((this.profile_name === PLAN_NAME.A) ||
      (this.profile_name === PLAN_NAME.B && this.subscription_is_active === false) ||
      (this.profile_name === PLAN_NAME.C && this.subscription_is_active === false) ||
      (this.profile_name === 'free' && this.trial_expired === true)) {

      if (!this.appSumoProfile) {

        this.presentModalFeautureAvailableFromTier2Plan(this.featureAvailableFromBPlan)
        return false
      } else {
        this.presentModalAppSumoFeautureAvailableFromBPlan()
        return false
      }
    } else if ((this.profile_name === PLAN_NAME.D) ||
      (this.profile_name === PLAN_NAME.E && this.subscription_is_active === false) ||
      (this.profile_name === PLAN_NAME.F && this.subscription_is_active === false) ||
      (this.profile_name === 'Sandbox' && this.trial_expired === true)) {
      if (!this.appSumoProfile) {
        this.presentModalFeautureAvailableFromTier2Plan(this.featureAvailableFromEPlan)
        return false
      }

    }
  }


  exportContactsToCsv() {
    if (this.payIsVisible) {
      const isAvailable = this.checkPlanAndPresentModal()
      this.logger.log('[CONTACTS-COMP] isAvaibleFromPlan ', isAvailable)
      if (isAvailable === false) {
        return
      }

      this.contactsService.exportLeadToCsv(this.queryString, 0, this.hasClickedTrashed).subscribe((leads_object: any) => {
        this.logger.log('[CONTACTS-COMP] - EXPORT CONTACT TO CSV RESPONSE ', leads_object);
        if (leads_object) {
          this.logger.log('[CONTACTS-COMP] - EXPORT CONTACTS TO CSV RESPONSE', leads_object);
          this.downloadFile(leads_object);
        }
      }, (error) => {
        this.logger.error('[CONTACTS-COMP]- EXPORT CONTACT TO CSV - ERROR  ', error);
      }, () => {
        this.logger.log('[CONTACTS-COMP] - EXPORT CONTACT TO CSV * COMPLETE *');
      });
      // console.log('[CONTACTS-COMP] - EXPORT DATA IS  AVAILABLE ')
    } else {
      this.notify._displayContactUsModal(true, 'upgrade_plan');
    }
  }

  // Export CSV
  presentModalFeautureAvailableFromTier2Plan(planName: string) {
    const el = document.createElement('div')
    el.innerHTML = planName // this.featureAvailableFromBPlan
    swal({
      // title: this.onlyOwnerCanManageTheAccountPlanMsg,
      content: el,
      icon: "info",
      // buttons: true,
      buttons: {
        cancel: this.cancel,
        catch: {
          text: this.upgradePlan,
          value: "catch",
        },
      },
      dangerMode: false,
    }).then((value) => {
      if (value === 'catch') {

        if (this.payIsVisible) {

          if (this.USER_ROLE === 'owner') {
            if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
              if (this.profile_name !== PLAN_NAME.C && this.profile_name !== PLAN_NAME.F) {
                this.notify.displaySubscripionHasExpiredModal(true, this.profile_name, this.subscription_end_date);
              } else if (this.profile_name === PLAN_NAME.C || this.profile_name === PLAN_NAME.F) {
                this.notify.displayEnterprisePlanHasExpiredModal(true, this.profile_name, this.subscription_end_date);
              }

            } else if (this.prjct_profile_type === 'payment' && this.subscription_is_active === true) {
              this.notify._displayContactUsModal(true, 'upgrade_plan');
            } else if (this.profile_name === 'free') {  // 
              this.router.navigate(['project/' + this.projectId + '/pricing']);
              
            }

          } else {
            this.presentModalOnlyOwnerCanManageTheAccountPlan();
          }
        } else {
          this.notify._displayContactUsModal(true, 'upgrade_plan');
        }
      }
    });
  }

  presentModalAppSumoFeautureAvailableFromBPlan() {
    const el = document.createElement('div')
    el.innerHTML = 'Available with ' + this.appSumoProfilefeatureAvailableFromBPlan
    swal({
      // title: this.onlyOwnerCanManageTheAccountPlanMsg,
      content: el,
      icon: "info",
      // buttons: true,
      buttons: {
        cancel: this.cancel,
        catch: {
          text: this.upgradePlan,
          value: "catch",
        },
      },
      dangerMode: false,
    }).then((value) => {
      if (value === 'catch') {
        if (this.USER_ROLE === 'owner') {
          this.router.navigate(['project/' + this.projectId + '/project-settings/payments']);
        } else {
          this.presentModalOnlyOwnerCanManageTheAccountPlan();
        }
      }
    });
  }

  presentModalOnlyOwnerCanManageTheAccountPlan() {
    // https://github.com/t4t5/sweetalert/issues/845
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyOwnerCanManageTheAccountPlanMsg, this.learnMoreAboutDefaultRoles)
  }


  downloadFile(data) {
    const blob = new Blob(['\ufeff' + data], { type: 'text/csv;charset=utf-8;' });
    const dwldLink = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const isSafariBrowser = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
    if (isSafariBrowser) {  // if Safari open in new window to save file with random filename.
      dwldLink.setAttribute('target', '_blank');
    }
    dwldLink.setAttribute('href', url);
    dwldLink.setAttribute('download', 'contacts.csv');
    dwldLink.style.visibility = 'hidden';
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }




  displayHideFooterPagination(contacts_count) {
    // DISPLAY / HIDE PAGINATION IN THE FOOTER
    if (contacts_count >= 16) {
      this.displaysFooterPagination = true;
      // tslint:disable-next-line:max-line-length
      this.logger.log('[CONTACTS-COMP] contacts_count ', contacts_count, 'DISPLAY FOOTER PAG ', this.displaysFooterPagination);
    } else {
      this.displaysFooterPagination = false;
      // tslint:disable-next-line:max-line-length
      this.logger.log('[CONTACTS-COMP] contacts_count ', contacts_count, 'DISPLAY FOOTER PAG ', this.displaysFooterPagination);
    }
  }



  chatWithAgent(contact) {
    this.logger.log("[CONTACTS-COMP] CHAT WITH AGENT > CONTACT : ", contact);


    // const url = this.CHAT_BASE_URL + '?' + 'recipient=' + contact._id + '&recipientFullname=' + contact.fullname;
    const url = this.CHAT_BASE_URL + '#/conversation-detail/' + contact._id + '/' + contact.fullname + '/active'
    this.logger.log("[CONTACTS-COMP] CHAT WITH AGENT -> CHAT URL ", url);
    window.open(url, '_blank');
  }

  goToContactDetails(requester_id) {
    this.router.navigate(['project/' + this.projectId + '/contact', requester_id]);
  }


  goToEditContact(requester_id) {
    this.router.navigate(['project/' + this.projectId + '/contact/edit', requester_id]);
  }

  goToVisitors() {
    this.router.navigate(['project/' + this.projectId + '/visitors']);
  }


  toggleAdvancedOption() {
    this.showAdvancedSearchOption = !this.showAdvancedSearchOption;
  }



  // -----------------=============== NOTE: THE CODE BELOW IS NOT USED ===============-----------------
  /**
   * ADD CONTACT  */
  // createContact() {
  //   this.logger.log('MONGO DB FULL-NAME DIGIT BY USER ', this.fullName);
  //   this.contactsService.addMongoDbContacts(this.fullName).subscribe((contact) => {
  //     this.logger.log('POST DATA ', contact);
  //     this.fullName = '';
  //     // RE-RUN GET CONTACT TO UPDATE THE TABLE
  //     // this.getContacts();
  //     this.ngOnInit();
  //   }, (error) => {

  //     this.logger.log('POST REQUEST ERROR ', error);

  //   }, () => {
  //     this.logger.log('POST REQUEST * COMPLETE *');
  //   });

  // }

}
