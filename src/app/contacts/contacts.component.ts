import { AppConfigService } from './../services/app-config.service';
// tslint:disable:max-line-length
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Http, Headers, RequestOptions} from '@angular/http';
import { ContactsService } from '../services/contacts.service';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Contact } from '../models/contact-model';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { NotifyService } from '../core/notify.service';
import { avatarPlaceholder, getColorBck } from '../utils/util';
import { UsersService } from '../services/users.service';
import { TranslateService } from '@ngx-translate/core';
import { ProjectPlanService } from '../services/project-plan.service';
import { Subscription } from 'rxjs';
declare const $: any;
const swal = require('sweetalert');

@Component({
  selector: 'appdashboard-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
})
export class ContactsComponent implements OnInit, OnDestroy, AfterViewInit {

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
  IS_CURRENT_USER_AGENT: boolean;
  IS_CURRENT_USER_OWNER: boolean;

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

  constructor(
    private http: Http,
    private contactsService: ContactsService,
    private router: Router,
    private auth: AuthService,
    private notify: NotifyService,
    private usersService: UsersService,
    private translate: TranslateService,
    private prjctPlanService: ProjectPlanService,
    private appConfigService: AppConfigService
  ) { }

  ngOnInit() {
    this.getTranslation();

    // this.auth.checkRoleForCurrentProject();
    this.getContacts();
    this.getCurrentProject();
    this.getProjectUserRole();
    this.getProjectPlan();

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

  }


  getTranslation() {

    this.translate.get('DeleteLeadSuccessNoticationMsg')
      .subscribe((text: string) => {

        this.deleteLeadSuccessNoticationMsg = text;
        // console.log('+ + + DeleteLeadSuccessNoticationMsg', text)
      });

    this.translate.get('DeleteLeadErrorNoticationMsg')
      .subscribe((text: string) => {

        this.deleteLeadErrorNoticationMsg = text;
        // console.log('+ + + DeleteLeadErrorNoticationMsg', text)
      });

    this.translate.get('AreYouSure')
      .subscribe((text: string) => {
        this.areYouSure = text;
        // console.log('+ + + areYouSure', text)
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
        console.log('+ + + DeleteContact_msg', this.deleteContact_msg)
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

    this.translatePlaceholder();

  }

  translatePlaceholder() {
    this.translate.get('SearchYourContacts')
      .subscribe((text: string) => {
        this.searchInYourContactsPlaceholder = text;
        console.log('+ + + translatePlaceholder SearchYourContacts', text)
      });


    this.translate.get('SearchInTrash')
      .subscribe((text: string) => {
        this.searchInTrashPlaceholder = text;
        // console.log('+ + + DeleteLeadSuccessNoticationMsg', text)
      });
  }

  ngAfterViewInit() {
    this.getElemSearchField();
  }

  getElemSearchField() {
    // const elemSearchField =   (<HTMLInputElement>document.getElementById('#search_field'));
    const elemSearchField = <HTMLInputElement>document.querySelector('#search_field');
    console.log('!!!! CONTACTS elemSearchField', elemSearchField)
    //  elemSearchField.innerHTML = 'res';
  }

  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      console.log('ProjectPlanService (RequestsListHistoryNewComponent) project Profile Data', projectProfileData)
      if (projectProfileData) {

        this.prjct_profile_type = projectProfileData.profile_type;
        this.subscription_is_active = projectProfileData.subscription_is_active;

        this.subscription_end_date = projectProfileData.subscription_end_date;
        this.trial_expired = projectProfileData.trial_expired

        this.prjct_profile_name = this.buildPlanName(projectProfileData.profile_name, this.browserLang, this.prjct_profile_type);
      }
    })
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  buildPlanName(planName: string, browserLang: string, planType: string) {
    if (planType === 'payment') {
      if (browserLang === 'it') {
        this.prjct_profile_name = 'Piano ' + planName;
        return this.prjct_profile_name
      } else if (browserLang !== 'it') {
        this.prjct_profile_name = planName + ' Plan';
        return this.prjct_profile_name
      }
    }
  }


  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        this.projectId = project._id
        // console.log('00 -> !!!! CONTACTS project ID from AUTH service subscription  ', this.projectId)
      }
    });
  }

  getProjectUserRole() {
    this.usersService.project_user_role_bs.subscribe((user_role) => {
      const current_user_role = user_role;
      console.log('CONTACTS COMP - SUBSCRIBE PROJECT_USER_ROLE_BS ', current_user_role);
      if (current_user_role) {
        console.log('CONTACTS COMP - PROJECT USER ROLE ', current_user_role);
        if (current_user_role === 'agent') {
          this.IS_CURRENT_USER_AGENT = true;
          console.log('CONTACTS COMP - PROJECT USER ROLE - IS CURRENT USER AGENT ', this.IS_CURRENT_USER_AGENT);
        } else {
          this.IS_CURRENT_USER_AGENT = false;
          console.log('CONTACTS COMP - PROJECT USER ROLE - IS CURRENT USER AGENT ', this.IS_CURRENT_USER_AGENT);
        }


        if (current_user_role === 'owner') {
          this.IS_CURRENT_USER_OWNER = true;
          console.log('CONTACTS COMP - PROJECT USER ROLE - IS CURRENT USER OWNER ', this.IS_CURRENT_USER_OWNER);
        } else {
          this.IS_CURRENT_USER_OWNER = false;
          console.log('CONTACTS COMP - PROJECT USER ROLE - IS CURRENT USER OWNER ', this.IS_CURRENT_USER_OWNER);
        }
      }
    });
  }

  decreasePageNumber() {
    const decreasePageNumberBtn = <HTMLElement>document.querySelector('.decrease-page-number-btn');
    decreasePageNumberBtn.blur()

    this.pageNo -= 1;

    console.log('!!!! CONTACTS - DECREASE PAGE NUMBER ', this.pageNo);
    this.getContacts()
  }

  increasePageNumber() {
    const increasePageNumberBtn = <HTMLElement>document.querySelector('.increase-page-number-btn');
    increasePageNumberBtn.blur()

    this.pageNo += 1;
    console.log('!!!! CONTACTS  - INCREASE PAGE NUMBER ', this.pageNo);
    this.getContacts()
  }

  search() {


    // ---------------------------------------------------------------------
    // Programmatically close Dropdown Menu
    // ---------------------------------------------------------------------
    const elemInputGroupDropdown = <HTMLInputElement>document.querySelector('#dropdown_input_group_btn');
    console.log('!!! CONTACTS - elemInputGroupDropdown ', elemInputGroupDropdown);

    const elemBtnDropdown = <HTMLInputElement>document.querySelector('#dropdown_btn');
    console.log('!!! CONTACTS - elemBtnDropdown ', elemBtnDropdown);

    const isOpen = elemBtnDropdown.getAttribute("aria-expanded")
    console.log('!!! CONTACTS - elemBtnDropdown isOpen ', isOpen);

    if (isOpen === 'true') {
      elemInputGroupDropdown.classList.remove('open');
      elemBtnDropdown.setAttribute("aria-expanded", 'false');
    }



    // RESOLVE THE BUG: THE BUTTON SEARCH REMAIN FOCUSED AFTER PRESSED
    const searchBtn = <HTMLElement>document.querySelector('.searchbtn');
    console.log('!!! CONTACTS - SEARCH BTN ', searchBtn)
    searchBtn.blur();

    this.pageNo = 0

    if (this.fullText) {

      console.log('!!!! CONTACTS - SEARCH FULLTEXT CONTAINS email: ', this.fullText.includes('email:'));
      // console.log('!!!! CONTACTS - SEARCH FULLTEXT CONTAINS index of email: ', this.fullText.substring(0, this.fullText.indexOf('email:')));

      // if (this.fullText.includes('email:') === true) {

      //   const cleanedFullText = this.fullText.substring(0, this.fullText.indexOf('email:'))
      //   console.log('!!!! CONTACTS - FULLTEXT - cleanedFullText', cleanedFullText);
      //   this.fullText = cleanedFullText;
      // }


      this.fullTextValue = this.fullText;


      console.log('!!!! CONTACTS - SEARCH FOR FULL TEXT ', this.fullTextValue);
    } else {
      console.log('!!!! CONTACTS - SEARCH FOR FULL TEXT ', this.fullText);
      this.fullTextValue = ''

      if (this.selectedContactEmail) {
        this.searchInYourContactsPlaceholder = "ADVANCED SEARCH"
      }
    }

    if (this.selectedContactEmail) {
      this.selectedContactEmailValue = this.selectedContactEmail;
      console.log('!!!! CONTACTS  - SEARCH FOR selectedContactEmail ', this.selectedContactEmailValue);
    } else {
      console.log('!!!! CONTACTS  - SEARCH FOR selectedContactEmail ', this.selectedContactEmailValue);
      this.selectedContactEmailValue = ''
    }

    this.queryString = 'full_text=' + this.fullTextValue + '&email=' + this.selectedContactEmailValue;
    console.log('!!!! CONTACTS - SEARCH - QUERY STRING ', this.queryString);

    this.getContacts();


    // let search_params_to_dislay_in_fulltext = ''
    // search_params_to_dislay_in_fulltext = this.fullTextValue
    // if (this.selectedContactEmailValue) {

    //   search_params_to_dislay_in_fulltext = this.fullTextValue + ' email:' + this.selectedContactEmailValue
    // }

    // this.fullText = search_params_to_dislay_in_fulltext
  }

  // Not used
  onfocusFullTextSearchField(ev) {

    console.log('+ + + translatePlaceholder searchInYourContactsPlaceholder', this.searchInYourContactsPlaceholder)

    if (this.searchInYourContactsPlaceholder === "ADVANCED SEARCH") {

      this.translatePlaceholder()
      // this.translate.get('SearchYourContacts')
      //   .subscribe((text: string) => {
      //     this.searchInYourContactsPlaceholder = text;
      //     console.log('+ + + translatePlaceholder SearchYourContacts', text)
      //   });
    }
    // console.log('!!!! CONTACTS - onfocusFullTextSearchField event ', ev);
    // ev.preventDefault();
    // ev.stopPropagation();

    console.log('!!!! CONTACTS - onFocusSearchField fullText ', this.fullText);
    console.log('!!!! CONTACTS - onFocusSearchField selectedContactEmail ', this.selectedContactEmail);

    // if (this.fullText.includes('email:') === true) {
    //   console.log('!!!! CONTACTS - SEARCH FULLTEXT CONTAINS replace this: ', 'email:' + this.selectedContactEmail);
    //   const cleanedFullText = this.fullText.replace('email:' + this.selectedContactEmail, '');
    //   console.log('!!!! CONTACTS - FULLTEXT after replace - cleanedFullText', cleanedFullText);
    //   this.fullText = cleanedFullText;
    //   // ---------------------------------------------------------------------
    //   // Programmatically open Dropdown Menu
    //   // ---------------------------------------------------------------------
    //   const elemInputGroupDropdown = <HTMLInputElement>document.querySelector('#dropdown_input_group_btn');
    //   console.log('!!! CONTACTS - elemInputGroupDropdown ', elemInputGroupDropdown);


    if (this.selectedContactEmail) {
      const elemBtnDropdown = <HTMLInputElement>document.querySelector('#dropdown_btn');
      console.log('!!! CONTACTS - elemBtnDropdown ', elemBtnDropdown);

      const isOpen = elemBtnDropdown.getAttribute("aria-expanded");
      console.log('!!! CONTACTS - elemBtnDropdown isOpen ', isOpen);

      if (isOpen === 'false') {
        elemBtnDropdown.click()
        elemBtnDropdown.setAttribute("aria-expanded", 'true')
        elemBtnDropdown.focus();
        ev.preventDefault();
        ev.stopPropagation();
      }
    }

    // const elemDropdownMenu = <HTMLInputElement>document.querySelector('.dropdown-menu');
    // console.log('!!! CONTACTS - elemDropdownMenu ', elemDropdownMenu);


    // elemDropdownMenu.addEventListener(
    //   "click", function (e) {   e.stopPropagation();  }   );

  }

  clearFullText() {

    if (this.searchInYourContactsPlaceholder === "ADVANCED SEARCH") {

      this.translatePlaceholder()
      // this.translate.get('SearchYourContacts')
      //   .subscribe((text: string) => {
      //     this.searchInYourContactsPlaceholder = text;
      //     console.log('+ + + translatePlaceholder SearchYourContacts', text)
      //   });
    }

    this.pageNo = 0
    this.fullText = '';

    if (this.selectedContactEmail) {
      this.selectedContactEmail = '';
    }


    this.queryString = '';
    console.log('!!!! CONTACTS - CLEAR SEARCH - QUERY STRING ', this.queryString);

    this.getContacts();
  }

  clearSearch() {
    // RESOLVE THE BUG: THE BUTTON CLEAR-SEARCH REMAIN FOCUSED AFTER PRESSED
    const clearSearchBtn = <HTMLElement>document.querySelector('.clearsearchbtn');
    console.log('!!!! CONTACTS - CLEAR SEARCH BTN', clearSearchBtn)
    clearSearchBtn.blur()

    this.pageNo = 0
    this.fullText = '';
    this.selectedContactEmail = '';
    this.queryString = '';
    this.getContacts();
  }

  /**
   * GET CONTACTS  */
  getContacts() {

    this.getTrashedContactsCount();
    this.getActiveContactsCount();

    this.showSpinner = true;
    this.contactsService.getLeadsActiveOrTrashed(this.queryString, this.pageNo, this.hasClickedTrashed).subscribe((leads_object: any) => {
      console.log('!!!! CONTACTS - GET LEADS RESPONSE ', leads_object);

      this.contacts = leads_object['leads'];
      console.log('!!!! CONTACTS - CONTACTS LIST ', this.contacts);

      

      /* to test pagination */
      // const contactsCount = 0;

      const contactsCount = leads_object['count'];
      console.log('!!!! CONTACTS - CONTACTS COUNT ', contactsCount);

      this.displayHideFooterPagination(contactsCount);

      const contactsPerPage = leads_object['perPage'];
      console.log('!!!! CONTACTS - N° OF CONTACTS X PAGE ', contactsCount);

      const totalPagesNo = contactsCount / contactsPerPage;
      console.log('!!!! CONTACTS - TOTAL PAGES NUMBER', totalPagesNo);

      this.totalPagesNo_roundToUp = Math.ceil(totalPagesNo);
      console.log('!!!!! CONTACTS - TOTAL PAGES No ROUND TO UP ', this.totalPagesNo_roundToUp);

      this.generateAvatarFromNameAndGetIfContactIsAuthenticated(this.contacts);
    }, (error) => {
      console.log('!!!! CONTACTS - GET LEADS - ERROR  ', error);
      this.showSpinner = false;
    }, () => {
      console.log('!!!! CONTACTS - GET LEADS * COMPLETE *');
      this.showSpinner = false;
    });
  }

  generateAvatarFromNameAndGetIfContactIsAuthenticated(contacts_list) {
    contacts_list.forEach(contact => {

      if (contact) {
        // const id_contact = contact._id
        const leadid = contact.lead_id
        console.log('!!!! CONTACTS - * leadid *', leadid);

        // let initial = '';
        // let fillColour = '';

        let newInitials = '';
        let newFillColour = '';
        if (contact.fullname) {
          const name = contact.fullname;
          // console.log('!!!!! CONTACTS - NAME OF THE CONTACT ', name);

          // initial = name.charAt(0).toUpperCase();
          // // console.log('!!!!! CONTACTS - INITIAL OF NAME OF THE CONTACT ', initial);
          // const charIndex = initial.charCodeAt(0) - 65
          // const colourIndex = charIndex % 19;
          // // console.log('!!!!! CONTACTS - COLOUR INDEX ', colourIndex);
          // fillColour = this.colours[colourIndex];
          // // console.log('!!!!! CONTACTS - NAME INITIAL ', initial, ' COLOUR INDEX ', colourIndex, 'FILL COLOUR ', fillColour);

          // NEW - FULL NAME INITIAL AS DISPLAYED IN THE WIDGET
          newInitials = avatarPlaceholder(name);
          newFillColour = getColorBck(name)


        } else {

          // initial = 'n.a.';
          // fillColour = '#eeeeee';
          newInitials = 'N/A';
          newFillColour = '#6264a7';

        }

  

        contact.avatar_fill_colour = newFillColour;
        contact.name_initial = newInitials
        contact.contact_is_verified = this.CONTACT_IS_VERIFIED

        this.getProjectUserById(contact, leadid)
        // for (const c of contacts_list) {

        //   if (c._id === id_contact) {
        //     // console.log('!!!! CONTACTS  - c._id ', c._id, 'id_contact ', id_contact)
        //     c.avatar_fill_colour = newFillColour;
        //     c.name_initial = newInitials
        //     c.contact_is_verified = this.CONTACT_IS_VERIFIED
        //   }
        // }
      }
    });
  }

  getProjectUserById(contact ,leadid) {
    this.usersService.getProjectUserById(leadid).subscribe((projectUser: any) => {

    
      console.log('!!!!! CONTACTS - GET PROJECT USER BY LEAD ID RES  ', projectUser);
      // console.log('!!!!! CONTACTS DETAILS - GET PROJECT USER BY LEAD ID projectUser[0]  ', projectUser[0]);
      // console.log('!!!!! CONTACTS DETAILS - GET PROJECT USER BY LEAD ID projectUser[0] isAuthenticated ', projectUser[0]['isAuthenticated']);
      // this.CONTACT_IS_VERIFIED = projectUser[0]['isAuthenticated']
      // console.log('!!!!! CONTACTS DETAILS - GET PROJECT USER BY LEAD ID CONTACT_IS_VERIFIED ', this.CONTACT_IS_VERIFIED);
      contact.contact_is_verified = projectUser[0]['isAuthenticated']
    },
      (error) => {
        console.log('!!!! CONTACTS - GET PROJECT USER BY LEAD ID ERR  ', error);
      },
      () => {
        console.log('!!!! CONTACTS - GET PROJECT USER BY LEAD ID * COMPLETE *');
      });
  }

  // --------------------------------------------------
  // TRASH FOREVER METHODS
  // --------------------------------------------------
  openTrashedContact() {
    this.pageNo = 0
    this.fullText = '';
    this.selectedContactEmail = '';
    this.queryString = '';
    this.hasClickedTrashed = true
    this.getContacts()
  }


  closeTrashContacts() {
    this.pageNo = 0
    this.fullText = '';
    this.selectedContactEmail = '';
    this.queryString = '';
    this.hasClickedTrashed = false;
    this.getContacts()

  }

  getTrashedContactsCount() {
    this.contactsService.getLeadsTrashed().subscribe((trashedleads: any) => {
      console.log('!!!! CONTACTS - GET TRASHED LEADS RESPONSE ', trashedleads)
      if (trashedleads) {
        this.trashedContanctCount = trashedleads.count
      }
    });
  }

  getActiveContactsCount() {
    this.contactsService.getLeadsActive().subscribe((activeleads: any) => {
      console.log('!!!! CONTACTS - GET ACTIVE LEADS RESPONSE ', activeleads)
      if (activeleads) {

        this.countOfActiveContacts = activeleads['count'];
      }
    });
  }



  deleteContactForever(contactid: string) {
    this.contactsService.getNodeJsRequestsByRequesterId(contactid, 0)
      .subscribe((requests_object: any) => {
        console.log('!!!! CONTACTS  deleteContactForever requests_object', requests_object);

        const request_count = requests_object.count
        console.log('!!!! CONTACTS  deleteContactForever request_count', request_count);
        if (request_count !== 0) {

          swal({
            title: this.deleteContact_msg,
            text: this.youCannotDeleteThisContact,
            icon: "info",
            button: true,
            dangerMode: false,
          })
        } else {

          console.log('!!!! CONTACTS  deleteContactForever ', contactid)

          swal({
            title: this.areYouSure + "?",
            text: this.contactWillBePermanentlyDeleted,
            icon: "warning",
            buttons: true,
            dangerMode: true,
          })
            .then((willDelete) => {
              if (willDelete) {
                console.log('swal willDelete', willDelete)

                this.contactsService.deleteLeadForever(contactid).subscribe((res: any) => {
                  console.log('in swal deleteRequest res ', res)

                }, (error) => {
                  console.log('in swal deleteRequest res - ERROR ', error);

                  swal(this.errorDeleting, this.pleaseTryAgain, {
                    icon: "error",
                  });

                }, () => {
                  console.log('in swal deleteRequest res* COMPLETE *');

                  swal(this.done_msg + "!", this.contactWasSuccessfullyDeleted, {
                    icon: "success",
                  }).then((okpressed) => {
                    this.getContacts();
                    // this.getTrashedContacts();
                  });

                });
              } else {
                console.log('swal willDelete', willDelete)
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
    // console.log('!!!!! CONTACTS - ON MODAL DELETE OPEN -> USER ID ', id);

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
    
    console.log('!!!!! CONTACTS - moveContactToTrash ', this.moveContactToTrash_msg);

    swal({
      title: this.moveToTrash_msg,
      text: this.moveContactToTrash_msg,
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
      .then((willDelete) => {
        if (willDelete) {
          console.log('swal willDelete', willDelete)

          this.contactsService.deleteLead(contactid).subscribe((res: any) => {
            console.log('in swal deleteRequest res ', res)

          }, (error) => {
            console.log('in swal deleteRequest res - ERROR ', error);

            swal(this.errorDeleting, this.pleaseTryAgain, {
              icon: "error",
            });

          }, () => {
            console.log('in swal deleteRequest res* COMPLETE *');

            swal(this.done_msg + "!", this.contactHasBeenMovedToTheTrash, {
              icon: "success",
            }).then((okpressed) => {
              this.getContacts();
            });

          });
        } else {
          console.log('swal willDelete', willDelete)
          // swal("Your imaginary file is safe!");
        }
      });
  }

  restore_contact(contactid: string) {
    this.contactsService.restoreContact(contactid)
      .subscribe((lead: any) => {
        console.log('!!!!! CONTACTS - RESTORE CONTACT RES ', lead);

        // RE-RUN GET CONTACT TO UPDATE THE TABLE

      }, (error) => {
        console.log('!!!!! CONTACTS - RESTORE CONTACT - ERROR ', error);
        // =========== NOTIFY ERROR ===========

        // this.notify.showNotification(this.deleteLeadErrorNoticationMsg, 4, 'report_problem');
      }, () => {
        console.log('!!!!! CONTACTS - RESTORE CONTACT * COMPLETE *');
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
        console.log('!!!!! CONTACTS - DELETE CONTACT RES ', lead);

        // RE-RUN GET CONTACT TO UPDATE THE TABLE

        this.ngOnInit();
      }, (error) => {
        console.log('!!!!! CONTACTS - DELETE REQUEST - ERROR ', error);
        // =========== NOTIFY ERROR ===========
        // this.notify.showNotification('An error occurred while deleting contact', 4, 'report_problem');
        this.notify.showNotification(this.deleteLeadErrorNoticationMsg, 4, 'report_problem');
      }, () => {
        console.log('!!!!! CONTACTS - DELETE REQUEST * COMPLETE *');
        // =========== NOTIFY SUCCESS===========
        // this.notify.showNotification('Contact successfully deleted', 2, 'done');
        this.notify.showNotification(this.deleteLeadSuccessNoticationMsg, 2, 'done');
      });

  }




  exportContactsToCsv() {
    if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false || this.prjct_profile_type === 'free' && this.trial_expired === true) {
      this.notify.openDataExportNotAvailable()
    } else {
      const exportToCsvBtn = <HTMLElement>document.querySelector('.export-to-csv-btn');
      console.log('!!! NEW REQUESTS HISTORY - EXPORT TO CSV BTN', exportToCsvBtn)
      exportToCsvBtn.blur()

      this.contactsService.exportLeadToCsv(this.queryString, 0, this.hasClickedTrashed).subscribe((leads_object: any) => {
        // console.log('!!!! CONTACTS - EXPORT CONTACT TO CSV RESPONSE ', leads_object);

        // console.log('!!!! CONTACTS - CONTACTS LIST ', this.contacts);
        if (leads_object) {
          console.log('!!!! CONTACTS - - EXPORT CONTACT TO CSV RESPONSE', leads_object);
          this.downloadFile(leads_object);
        }
      }, (error) => {
        console.log('!!!! CONTACTS - EXPORT CONTACT TO CSV - ERROR  ', error);
      }, () => {
        console.log('!!!! CONTACTS - EXPORT CONTACT TO CSV * COMPLETE *');
      });
    }
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
      console.log('!!!! CONTACTS  ', contacts_count, 'DISPLAY FOOTER PAG ', this.displaysFooterPagination);
    } else {
      this.displaysFooterPagination = false;
      // tslint:disable-next-line:max-line-length
      console.log('!!!! CONTACTS  ', contacts_count, 'DISPLAY FOOTER PAG ', this.displaysFooterPagination);
    }
  }



  chatWithAgent(contact) {
    console.log("CONTACT: ", contact);

    const url = this.CHAT_BASE_URL + '?' + 'recipient=' + contact._id + '&recipientFullname=' + contact.fullname;
    console.log("CONTACT-COMP - CHAT URL ", url);
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
  //   console.log('MONGO DB FULL-NAME DIGIT BY USER ', this.fullName);
  //   this.contactsService.addMongoDbContacts(this.fullName).subscribe((contact) => {
  //     console.log('POST DATA ', contact);
  //     this.fullName = '';
  //     // RE-RUN GET CONTACT TO UPDATE THE TABLE
  //     // this.getContacts();
  //     this.ngOnInit();
  //   }, (error) => {

  //     console.log('POST REQUEST ERROR ', error);

  //   }, () => {
  //     console.log('POST REQUEST * COMPLETE *');
  //   });

  // }









}
