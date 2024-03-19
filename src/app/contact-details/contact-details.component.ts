import { Component, OnInit, HostListener, AfterViewInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ContactsService } from '../services/contacts.service';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { avatarPlaceholder, getColorBck } from '../utils/util';
import { NotifyService } from '../core/notify.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from 'app/services/app-config.service';
import { UsersService } from '../services/users.service';
import { LoggerService } from '../services/logger/logger.service';
const swal = require('sweetalert');
@Component({
  selector: 'appdashboard-contact-details',
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.scss']
})
export class ContactDetailsComponent implements OnInit, AfterViewInit {

  public colours = [
    '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e', '#16a085',
    '#27ae60', '#2980b9', '#8e44ad', '#2c3e50', '#f1c40f', '#e67e22',
    '#e74c3c', '#95a5a6', '#f39c12', '#d35400', '#c0392b', '#bdc3c7', '#7f8c8d'
  ];

  requester_id: string
  requests_list: any;
  contact_details: any;
  projectId: string
  displaysFooterPagination: boolean;
  pageNo = 0;
  totalPagesNo_roundToUp: number;
  showSpinner = true;
  currentUserID: string;
  CONTACT_IS_VERIFIED = false;
  contact_fullname_initial: string;
  fillColour: string;

  clientStringCutted: string;
  showAllClientString = false;

  senderAuthInfoString: string;
  senderAuthInfoStringCutted: string;
  showAllsenderAuthInfoString = false;
  showAllSourcePageString = false;
  sourcePage: string;
  sourcePageCutted: string;
  displayDeleteModal = 'none';
  id_toDelete: string;
  fullName_toDelete: string;

  deleteLeadSuccessNoticationMsg: string;
  deleteLeadErrorNoticationMsg: string;

  lead_id: string;

  attributesArray: Array<any>
  rightSidebarWidth: number;
  contact_full_address: string;
  showAllAddress = false;
  showAttributes = false;

  streetAddress: string;
  city: string;
  region: string;
  zipcode: string;
  country: string;

  moveContactToTrash_msg: string;
  moveToTrash_msg: string;

  errorDeleting: string;
  done_msg: string;
  pleaseTryAgain: string;
  contactHasBeenMovedToTheTrash: string;

  CHAT_BASE_URL: string;

  attributesDecodedJWTArray: Array<any>
  attributesDecodedJWTAttributesArray: Array<any>
  attributesDecodedJWTArrayMerged: Array<any>
  isChromeVerGreaterThan100: boolean;
  contactTags: Array<any>
  contactTempTags: Array<any> = []
  tag: any;
  tagcolor: any;
  tagContainerElementHeight: any;
  isVisibleLBS: boolean;
  public_Key: string;
  isOpenEditContactFullnameDropdown: boolean = false;
  contactNewFirstName: string;
  contactNewLastName: string;
  constructor(
    public location: Location,
    private route: ActivatedRoute,
    private router: Router,
    public auth: AuthService,
    private contactsService: ContactsService,
    private notify: NotifyService,
    private translate: TranslateService,
    private appConfigService: AppConfigService,
    private usersService: UsersService,
    private logger: LoggerService
  ) { }

  // -----------------------------------------------------------------------------------------------------
  // @ HostListener window:resize
  // -----------------------------------------------------------------------------------------------------

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {

    // ------------------------------
    // Right sidebar width on resize
    // ------------------------------
    const rightSidebar = <HTMLElement>document.querySelector(`.right-card`);
    if (rightSidebar) {
      this.rightSidebarWidth = rightSidebar.offsetWidth
    }

    this.getTagContainerElementHeight()
    // this.logger.log(`:-D CONTACT DETAILS - ATTRIBUTES onResize attributeValueElem offsetWidth:`, this.rightSidebarWidth);
  }

  ngOnInit() {

    // this.auth.checkRoleForCurrentProject();
    this.getRequesterIdParam_AndThenGetRequestsAndContactById();
    this.getCurrentProject();
    this.getCurrentUser();
    this.getTranslation();
    this.getChatUrl();
    this.getBrowserVersion();
    this.getOSCODE();
  }


  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[CONTACTS-DTLS]  getAppConfig public_Key', this.public_Key)

    let keys = this.public_Key.split("-");
    this.logger.log('[CONTACTS-DTLS] - public_Key keys', keys)

    keys.forEach(key => {
   
      if (key.includes("LBS")) {
        let lbs = key.split(":");
        if (lbs[1] === "F") {
          this.isVisibleLBS = false;
        } else {
          this.isVisibleLBS = true;
        }
      }
    });
    if (!this.public_Key.includes("LBS")) {
      this.isVisibleLBS = false;
    }
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    })
  }

  getChatUrl() {
    this.CHAT_BASE_URL = this.appConfigService.getConfig().CHAT_BASE_URL;
    this.logger.log('[CONTACTS-DTLS] AppConfigService getAppConfig CHAT_BASE_URL', this.CHAT_BASE_URL);
  }

  getTranslation() {
    this.translateDeleteLeadSuccessMsg();
    this.translateDeleteLeadErrorMsg();

    this.translate.get('MoveToTrash')
      .subscribe((text: string) => {
        this.moveToTrash_msg = text;
      });

    this.translate.get('ErrorDeleting')
      .subscribe((text: string) => {
        this.errorDeleting = text;
      });

    this.translate.get('PleaseTryAgain')
      .subscribe((text: string) => {
        this.pleaseTryAgain = text;
      });

    this.translate.get('Done')
      .subscribe((text: string) => {
        this.done_msg = text;
      });

    this.translate.get('TheContactHasBeenMovedToTheTrash')
      .subscribe((text: string) => {
        this.contactHasBeenMovedToTheTrash = text;
      });
  }


  // --------------------------------------------------
  // MOVE TO TRASH
  // --------------------------------------------------
  moveContactToTrash(contactid: string, fullName: string) {
    // this.logger.log('[CONTACTS-DTLS] - ON MODAL DELETE OPEN -> USER ID ', id);

    // this.displayDeleteModal = 'block';

    // this.id_toDelete = id;
    // this.fullName_toDelete = fullName;

    this.translate.get('MoveTheContactToTheTrash', { contactname: fullName }).subscribe((text: string) => {

      this.moveContactToTrash_msg = text
    })
    this.logger.log('[CONTACTS-DTLS] - moveContactToTrash ', this.moveContactToTrash_msg);

    swal({
      title: this.moveToTrash_msg,
      text: this.moveContactToTrash_msg,
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
      .then((willDelete) => {
        if (willDelete) {
          this.logger.log('[CONTACTS-DTLS] swal willDelete', willDelete)

          this.contactsService.deleteLead(contactid).subscribe((res: any) => {
            this.logger.log('[CONTACTS-DTLS] in swal deleteRequest res ', res)

          }, (error) => {
            this.logger.error('[CONTACTS-DTLS] in swal deleteRequest res - ERROR ', error);

            swal(this.errorDeleting, this.pleaseTryAgain, {
              icon: "error",
            });

          }, () => {
            this.logger.log('[CONTACTS-DTLS]in swal deleteRequest res * COMPLETE *');

            swal(this.done_msg + "!", this.contactHasBeenMovedToTheTrash, {
              icon: "success",
            }).then((okpressed) => {
              this.goToContactList();
            });

          });
        } else {
          this.logger.log('[CONTACTS-DTLS] swal willDelete', willDelete)
          // swal("Your imaginary file is safe!");
        }
      });
  }

  goToContactList() {
    this.router.navigate(['project/' + this.projectId + '/contacts']);
    // project/{{ project._id }}/contacts
  }


  ngAfterViewInit() {
    // -----------------------------------
    // Right sidebar width after view init
    // -----------------------------------
    const rightSidebar = <HTMLElement>document.querySelector(`.right-card`);

    this.rightSidebarWidth = rightSidebar.offsetWidth

    this.logger.log(`[CONTACTS-DTLS] - ATTRIBUTES AfterViewInit attributeValueElem offsetWidth:`, this.rightSidebarWidth);

    setTimeout(() => {
      this.getTagContainerElementHeight()
    }, 1500);
  }


  // TRANSLATION
  translateDeleteLeadSuccessMsg() {
    this.translate.get('DeleteLeadSuccessNoticationMsg')
      .subscribe((text: string) => {

        this.deleteLeadSuccessNoticationMsg = text;
        // this.logger.log('[CONTACTS-DTLS] + + + DeleteLeadSuccessNoticationMsg', text)
      });
  }

  // TRANSLATION
  translateDeleteLeadErrorMsg() {
    this.translate.get('DeleteLeadErrorNoticationMsg')
      .subscribe((text: string) => {

        this.deleteLeadErrorNoticationMsg = text;
        // this.logger.log('[CONTACTS-DTLS] + + + DeleteLeadErrorNoticationMsg', text)
      });

  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.logger.log('[CONTACTS-DTLS] - PRJCT FROM SUBSCRIPTION TO AUTH SERV  ', project)
      if (project) {
        this.projectId = project._id;
      }
    });
  }

  getCurrentUser() {
    const user = this.auth.user_bs.value

    this.logger.log('[CONTACTS-DTLS] - LOGGED USER ', user);
    if (user) {

      this.currentUserID = user._id
      this.logger.log('[CONTACTS-DTLS] - USER UID ', this.currentUserID);

    } else {
      this.logger.log('[CONTACTS-DTLS] - No user is signed in ');

    }
  }

  getRequesterIdParam_AndThenGetRequestsAndContactById() {
    this.requester_id = this.route.snapshot.params['requesterid'];
    this.logger.log('[CONTACTS-DTLS] - GET REQUESTER ID PARAM & THEN GET REQUESTS AND CONTACT BY ID -> REQUESTER ID ', this.requester_id);

    if (this.requester_id) {
      this.getContactById();
      this.getRequests();

    }
  }

  decreasePageNumber() {
    this.pageNo -= 1;

    this.logger.log('[CONTACTS-DTLS] - DECREASE PAGE NUMBER ', this.pageNo);
    this.getRequests()
  }

  increasePageNumber() {
    this.pageNo += 1;
    this.logger.log('[CONTACTS-DTLS]  - INCREASE PAGE NUMBER ', this.pageNo);
    this.getRequests()
  }


  getRequests() {
    this.contactsService.getRequestsByRequesterId(this.requester_id, this.pageNo)

      .subscribe((requests_object: any) => {

        if (requests_object) {
          this.logger.log('[CONTACTS-DTLS] - getRequests REQUESTS OBJECTS ', requests_object);
          this.requests_list = requests_object['requests'];
          this.logger.log('[CONTACTS-DTLS] - getRequests REQUESTS LIST (got by requester_id) ', this.requests_list);

          // this.requests_list = requests_object['requests'];


          this.requests_list.forEach(request => {
            request.currentUserIsJoined = false;
            this.logger.log('[CONTACTS-DTLS] - REQUEST ', request)
            request.participants.forEach(p => {
              this.logger.log('[CONTACTS-DTLS] Participant ', p);
              if (p === this.currentUserID) {
                request.currentUserIsJoined = true;
                return
              }
            })
          });

          // to test pagination
          // const requestsCount = 83;
          const requestsCount = requests_object['count'];
          this.logger.log('[CONTACTS-DTLS] - REQUESTS COUNT ', requestsCount);

          this.displayHideFooterPagination(requestsCount);

          const requestsPerPage = requests_object['perPage'];
          this.logger.log('[CONTACTS-DTLS] - N° OF REQUESTS X PAGE ', requestsPerPage);

          const totalPagesNo = requestsCount / requestsPerPage;
          this.logger.log('[CONTACTS-DTLS] - TOTAL PAGES NUMBER', totalPagesNo);

          this.totalPagesNo_roundToUp = Math.ceil(totalPagesNo);
          this.logger.log('[CONTACTS-DTLS] - TOTAL PAGES NUMBER ROUND TO UP ', this.totalPagesNo_roundToUp);

        }
      }, (error) => {
        this.showSpinner = false;
        this.logger.error('[CONTACTS-DTLS] - GET REQUEST BY REQUESTER ID - ERROR ', error);
      }, () => {
        this.showSpinner = false;
        this.logger.log('[CONTACTS-DTLS] - GET REQUEST BY REQUESTER ID * COMPLETE *');
      });
  }

  displayHideFooterPagination(requests_count) {
    // DISPLAY / HIDE PAGINATION IN THE FOOTER
    if (requests_count >= 16) {
      this.displaysFooterPagination = true;
      // tslint:disable-next-line:max-line-length
      this.logger.log('[CONTACTS-DTLS] ', requests_count, 'DISPLAY FOOTER PAG ', this.displaysFooterPagination);
    } else {
      this.displaysFooterPagination = false;
      // tslint:disable-next-line:max-line-length
      this.logger.log('[CONTACTS-DTLS] ', requests_count, 'DISPLAY FOOTER PAG ', this.displaysFooterPagination);
    }
  }


  toggleAddress() {
    this.showAllAddress = !this.showAllAddress;
    this.logger.log('[CONTACTS-DTLS] SHOW ALL ADDRESS ', this.showAllAddress);

    const addressArrowIconElem = <HTMLElement>document.querySelector('#address_arrow_down');

    if (this.showAllAddress === true) {
      addressArrowIconElem.classList.add("up");
    }
    if (this.showAllAddress === false) {
      addressArrowIconElem.className = addressArrowIconElem.className.replace(/\bup\b/g, "");
    }
  }

  toggleAttributes() {
    this.showAttributes = !this.showAttributes;
    this.logger.log('[CONTACTS-DTLS] SHOW ALL ATTRIBUTES ', this.showAttributes);
    const attributesArrowIconElem = <HTMLElement>document.querySelector('#lead-attributes_arrow_down');
    if (this.showAttributes === true) {
      attributesArrowIconElem.classList.add("up");
    }
    if (this.showAttributes === false) {
      attributesArrowIconElem.className = attributesArrowIconElem.className.replace(/\bup\b/g, "");
    }
  }

  // ---------------------------------------------------------------------------------------
  // @ Attributes decoded jwt accordion
  // ---------------------------------------------------------------------------------------
  openAttributesDecodedJWTAccordion() {
    // var acc = document.getElementsByClassName("accordion");
    var acc = <HTMLElement>document.querySelector('.attributes-decoded-jwt-accordion');
    // this.logger.log('[CONTACTS-DTLS] - ATTRIBUTES DECODED JWT - open attributes-decoded-jwt-accordion -  accordion elem ', acc);
    acc.classList.toggle("active");
    // var panel = acc.nextElementSibling ;
    var panel = <HTMLElement>document.querySelector('.attributes-decoded-jwt-panel')
    // this.logger.log('[CONTACTS-DTLS] - ATTRIBUTES DECODED JWT-  open attributes-decoded-jwt-panel  -  panel ', panel);

    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  }


  getProjectUserById(leadid) {
    this.usersService.getProjectUserById(leadid).subscribe((projectUser: any) => {


      // this.logger.log('[CONTACTS-DTLS] - GET PROJECT USER BY LEAD ID RES  ', projectUser);
      // this.logger.log('[CONTACTS-DTLS] - GET PROJECT USER BY LEAD ID projectUser[0]  ', projectUser[0]);
      // this.logger.log('[CONTACTS-DTLS] - GET PROJECT USER BY LEAD ID projectUser[0] isAuthenticated ', projectUser[0]['isAuthenticated']);
      this.CONTACT_IS_VERIFIED = projectUser[0]['isAuthenticated']
      this.logger.log('[CONTACTS-DTLS] - GET PROJECT USER BY LEAD ID CONTACT_IS_VERIFIED ', this.CONTACT_IS_VERIFIED);
    }, (error) => {
      this.logger.error('[CONTACTS-DTLS] - GET PROJECT USER BY LEAD ID ERR  ', error);
    }, () => {
      this.logger.log('[CONTACTS-DTLS] - GET PROJECT USER BY LEAD ID * COMPLETE *');
    });
  }


  // When the user select a tag from the combo-box 
  addTag(tag) {
    this.logger.log('[CONTACTS-DTLS] - ADD TAG > tag: ', tag);
    this.contactTags.push(tag.tag)
    var index = this.contactTempTags.indexOf(tag);
    if (index !== -1) {
      this.contactTempTags.splice(index, 1);
    }
    this.contactTempTags = this.contactTempTags.slice(0)
    this.logger.log('[CONTACTS-DTLS] - ADD TAG > contactTags: ', this.contactTags);
    
    this.logger.log('[CONTACTS-DTLS] - ADD TAG > contactTempTags: ', this.contactTempTags);

    setTimeout(() => {
      this.tag = null;
    })
    this.updateContactTag(this.requester_id, this.contactTags)
  }

  createNewTag = (newTag: string) => {
    let self = this;
    self.logger.log("Create New TAG Clicked : " + newTag)
    let newTagTrimmed = newTag.trim()
    self.contactTags.push(newTagTrimmed)
    self.logger.log("Create New TAG Clicked - leads tag: ", self.contactTags)
    self.updateContactTag(self.requester_id, self.contactTags)
  }

  removeTag(tag: string) {
    // this.contactTempTags = []
    this.logger.log('[CONTACTS-DTLS] removeTag tag', tag)
    var index = this.contactTags.indexOf(tag);
    if (index !== -1) {
      this.contactTags.splice(index, 1);
      this.contactTempTags.push({ tag: tag })
      this.contactTempTags = this.contactTempTags.slice(0)
     this.logger.log('[CONTACTS-DTLS] removeTag contactTempTags', this.contactTempTags)
     this.logger.log('[CONTACTS-DTLS] removeTag contactTags', this.contactTags)

      this.updateContactTag(this.requester_id, this.contactTags)
    }

  }

  updateContactTag(requester_id: string, tags: any) {
    this.contactsService.updateLeadTag(requester_id, tags)
      .subscribe((lead: any) => {
        this.logger.log('[CONTACTS-DTLS] - ADD CONTACT TAGS  lead ', lead);
        if (lead) {
          this.contactTags = lead.tags
          this.getTagContainerElementHeight()
        }

      })
  }

  


  getTagContainerElementHeight() {
    const tagContainerElement = <HTMLElement>document.querySelector('.lead-tags--container');
    this.logger.log('tagContainerElement ', tagContainerElement)
    if (tagContainerElement) {
      this.tagContainerElementHeight = tagContainerElement.offsetHeight + 'px'
      this.logger.log('[CONTACTS-DTLS] tagContainerElement.offsetHeight tagContainerElementHeight ', this.tagContainerElementHeight)
      this.logger.log('[CONTACTS-DTLS] tagContainerElement.clientHeight ', tagContainerElement.clientHeight)

      // this.tagContainerElementHeight = (this.requestInfoListElementHeight + tagContainerElement.offsetHeight) + 'px';
      // this.logger.log('this.tagContainerElementHeight ', this.tagContainerElementHeight)
    }
  }

  getContactById() {
    this.contactsService.getLeadById(this.requester_id)
      .subscribe((lead: any) => {

        if (lead) {
          this.logger.log('[CONTACTS-DTLS] - GET LEAD BY REQUESTER ID ', lead);
          this.contact_details = lead;

          if (this.contact_details && this.contact_details.lead_id) {
            this.lead_id = this.contact_details.lead_id;
            this.getProjectUserById(this.lead_id)

            this.logger.log('[CONTACTS-DTLS] this.lead_id', this.lead_id)
          }

          if (this.contact_details.streetAddress && this.contact_details.streetAddress !== "") {
            this.streetAddress = this.contact_details.streetAddress
          } else {
            this.streetAddress = 'N/A'
          }

          if (this.contact_details.city && this.contact_details.city !== "") {
            this.city = this.contact_details.city
          } else {
            this.city = 'N/A'
          }

          if (this.contact_details.region && this.contact_details.region !== "") {
            this.region = this.contact_details.region
          } else {
            this.region = 'N/A'
          }

          if (this.contact_details.zipcode && this.contact_details.zipcode !== "") {
            this.zipcode = this.contact_details.zipcode
          } else {
            this.zipcode = 'N/A'
          }

          if (this.contact_details.country && this.contact_details.country !== "") {
            this.country = this.contact_details.country
          } else {
            this.country = 'N/A'
          }

          if (this.contact_details.fullname) {

            this.contact_fullname_initial = avatarPlaceholder(this.contact_details.fullname);
            this.fillColour = getColorBck(this.contact_details.fullname);
          } else {

            this.contact_fullname_initial = 'N/A';
            this.fillColour = '#6264a7';
          }

          if (this.contact_details.tags) {
            this.contactTags = this.contact_details.tags
            this.getTagContainerElementHeight()
          }

          // No more used -- now is get from projrct user
          // if (this.contact_details.attributes
          //   && this.contact_details.attributes.senderAuthInfo
          //   && this.contact_details.attributes.senderAuthInfo.authVar
          //   && this.contact_details.attributes.senderAuthInfo.authVar.token
          //   && this.contact_details.attributes.senderAuthInfo.authVar.token.firebase
          //   && this.contact_details.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider) {

          //   if (this.contact_details.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider === 'custom') {
          //     this.CONTACT_IS_VERIFIED = true;
          //   } else {
          //     this.CONTACT_IS_VERIFIED = false;
          //   }
          // } else {
          //   this.CONTACT_IS_VERIFIED = false;
          // }




          // --------------------------------------------------------------------------------------------------------------
          // @ Contact Attributes
          // --------------------------------------------------------------------------------------------------------------
          if (this.contact_details.attributes) {
            // --------------------------------------------------------------------------------------------------------------
            // new: display all attributes dinamically
            // --------------------------------------------------------------------------------------------------------------
            this.attributesArray = []

            for (let [key, value] of Object.entries(this.contact_details.attributes)) {

              // this.logger.log(`[CONTACTS-DTLS] -  ATTRIBUTES key : ${key} - value ${value}`);

              let _value: any;
              if (typeof value === 'object' && value !== null) {

                this.logger.log(`[CONTACTS-DTLS] - ATTRIBUTES value is an object :`, JSON.stringify(value));
                _value = JSON.stringify(value)
              } else {
                _value = value
              }

              // https://stackoverflow.com/questions/50463738/how-to-find-width-of-each-character-in-pixels-using-javascript
              let letterLength = {};
              let letters = ["", " ", " ?", "= ", " -", " :", " _", " ,", " ", " ", " ", "(", ")", "}", "{", "\"", " ", "/", ".", "a", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

              for (let letter of letters) {
                let span = document.createElement('span');
                (<any>span).append(document.createTextNode(letter));
                span.style.display = "inline-block";
                (<any>document.body).append(span);
                letterLength[letter] = span.offsetWidth;
                span.remove();
              }
              let totalLength = 0;

              // for (let i = 0; i < _value.length; i++) {
              //   this.logger.log('[CONTACTS-DTLS] _value[i]', _value[i] + ": " + letterLength[_value[i]])
              // }
              if (_value) {
                for (let i = 0; i < _value.length; i++) {
                  if (letterLength[_value[i]] !== undefined) {
                    totalLength += letterLength[_value[i]];
                  } else {
                    // if the letter not is in dictionary letters letterLength[_value[i]] is undefined so add the witdh of the 'S' letter (8px)
                    totalLength += letterLength['S'];
                  }
                }

                this.logger.log('[CONTACTS-DTLS] - ATTRIBUTES value LENGHT ', _value + " totalLength : " + totalLength)

                let entries = { 'attributeName': key, 'attributeValue': _value, 'attributeValueL': totalLength };

                this.attributesArray.push(entries)
              }
            } // ./end for
            this.logger.log('[CONTACTS-DTLS] - getWsRequestById attributesArray: ', this.attributesArray);
            // --------------------------------------------------------------------------------------------------------------

            // ---------------------------------------------------------
            // @ Contact Attributes DECODED JWT
            // ---------------------------------------------------------
            if (this.contact_details.attributes) {
              if (this.contact_details.attributes.decoded_jwt) {
                // this.logger.log('[CONTACTS-DTLS] - ATTRIBUTES DECODED JWT ', this.contact_details.attributes.decoded_jwt);
                this.attributesDecodedJWTArray = []
                for (let [key, value] of Object.entries(this.contact_details.attributes.decoded_jwt)) {

                  // this.logger.log(`[CONTACTS-DTLS] - ATTRIBUTES DECODED JWT -key : ${key} - value ${value}`);

                  let _value: any;
                  if (typeof value === 'object' && value !== null) {

                    // this.logger.log(`[CONTACTS-DTLS] - ATTRIBUTES value is an object :`, JSON.stringify(value));
                    _value = JSON.stringify(value)
                  } else {
                    _value = value
                  }

                  // https://stackoverflow.com/questions/50463738/how-to-find-width-of-each-character-in-pixels-using-javascript
                  let letterLength = {};
                  let letters = ["", " ", " ?", "= ", " -", " :", " _", " ,", " ", " ", " ", "(", ")", "}", "{", "\"", " ", "/", ".", "a", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

                  for (let letter of letters) {
                    let span = document.createElement('span');
                    (<any>span).append(document.createTextNode(letter));
                    span.style.display = "inline-block";
                    (<any>document.body).append(span);
                    letterLength[letter] = span.offsetWidth;
                    span.remove();
                  }
                  let totalLength = 0;

                  // for (let i = 0; i < _value.length; i++) {
                  //   this.logger.log('[CONTACTS-DTLS] _value[i]', _value[i] + ": " + letterLength[_value[i]])
                  // }

                  for (let i = 0; i < _value.length; i++) {
                    if (letterLength[_value[i]] !== undefined) {
                      totalLength += letterLength[_value[i]];
                    } else {
                      // if the letter not is in dictionary letters letterLength[_value[i]] is undefined so add the witdh of the 'S' letter (8px)
                      totalLength += letterLength['S'];
                    }
                  }
                  // this.logger.log('[CONTACTS-DTLS] - ATTRIBUTES value LENGHT ', _value + " totalLength : " + totalLength)
                  if (key !== 'attributes') {
                    let entries = { 'attributeName': key, 'attributeValue': _value, 'attributeValueL': totalLength };


                    this.attributesDecodedJWTArray.push(entries)
                  }
                }
                // this.logger.log('[CONTACTS-DTLS] - ATTRIBUTES DECODED JWT - attributesDecodedJWTArray: ', this.attributesDecodedJWTArray);
                // --------------------------------------------------------------------------------------------------------------
              } else {

                // this.logger.log('[CONTACTS-DTLS] - ATTRIBUTES DECODED JWT IS UNDEFINED ');
              }
            } else {
              this.logger.log('[CONTACTS-DTLS] - ATTRIBUTES IS UNDEFINED ');
            }

            // ---------------------------------------------------------
            // Attributes DECODED JWT Attributes
            // ---------------------------------------------------------
            if (this.contact_details.attributes) {
              if (this.contact_details.attributes.decoded_jwt && this.contact_details.attributes.decoded_jwt.attributes) {
                // this.logger.log('[CONTACTS-DTLS] - ATTRIBUTES DECODED JWT ATTRIBUTES', this.contact_details.attributes.decoded_jwt.attributes);

                this.attributesDecodedJWTAttributesArray = []
                // for (let [key, value] of Object.entries(this.request.attributes.decoded_jwt.attributes)) {
                for (const [index, [key, value]] of Object.entries(Object.entries(this.contact_details.attributes.decoded_jwt.attributes))) {

                  // this.logger.log(`[CONTACTS-DTLS]- ATTRIBUTES DECODED JWT ATTRIBUTES index :${index}: -key  ${key} - value ${value}`);

                  let _value: any;
                  if (typeof value === 'object' && value !== null) {

                    // this.logger.log(`[CONTACTS-DTLS] - getWsRequestById ATTRIBUTES value is an object :`, JSON.stringify(value));
                    _value = JSON.stringify(value)
                  } else {
                    _value = value
                  }

                  // https://stackoverflow.com/questions/50463738/how-to-find-width-of-each-character-in-pixels-using-javascript
                  let letterLength = {};
                  let letters = ["", " ", " ?", "= ", " -", " :", " _", " ,", " ", " ", " ", "(", ")", "}", "{", "\"", " ", "/", ".", "a", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

                  for (let letter of letters) {
                    let span = document.createElement('span');
                    (<any>span).append(document.createTextNode(letter));
                    span.style.display = "inline-block";
                    (<any>document.body).append(span);
                    letterLength[letter] = span.offsetWidth;
                    span.remove();
                  }
                  let totalLength = 0;

                  if (_value) {
                    for (let i = 0; i < _value.length; i++) {
                      // this.logger.log('[CONTACTS-DTLS] - getWsRequestById _value[i]', _value[i] + ": " + letterLength[_value[i]])


                      for (let i = 0; i < _value.length; i++) {
                        if (letterLength[_value[i]] !== undefined) {
                          totalLength += letterLength[_value[i]];
                        } else {
                          // if the letter not is in dictionary letters letterLength[_value[i]] is undefined so add the witdh of the 'S' letter (8px)
                          totalLength += letterLength['S'];
                        }
                      }
                    }
                    // this.logger.log('[CONTACTS-DTLS] getWsRequestById ATTRIBUTES value LENGHT ', _value + " totalLength : " + totalLength)

                    let entries = { 'attributeName': key, 'attributeValue': _value, 'decodedJWTType': 'Attributes', 'attributeValueL': totalLength, 'index': index };

                    this.attributesDecodedJWTAttributesArray.push(entries)
                  }
                }
                // this.logger.log('[CONTACTS-DTLS] - ATTRIBUTES DECODED JWT  ATTRIBUTES - attributesDecodedJWTAttributesArray: ', this.attributesDecodedJWTAttributesArray);

                this.attributesDecodedJWTArrayMerged = [].concat(this.attributesDecodedJWTArray, this.attributesDecodedJWTAttributesArray);

                // this.logger.log('[CONTACTS-DTLS] - ATTRIBUTES DECODED JWT  ATTRIBUTES - attributesDecodedJWTArrayMerged: ', this.attributesDecodedJWTArrayMerged);
                // --------------------------------------------------------------------------------------------------------------
              } else {
                this.attributesDecodedJWTArrayMerged = this.attributesDecodedJWTArray
                this.logger.log('[CONTACTS-DTLS] - ATTRIBUTES DECODED JWT  ATTRIBUTES IS UNDEFINED (in decoded_jwt)');
                this.logger.log('[CONTACTS-DTLS] - ATTRIBUTES DECODED JWT  ATTRIBUTES - attributesDecodedJWTArrayMerged: ', this.attributesDecodedJWTArrayMerged);
              }
            } else {
              this.logger.log('[CONTACTS-DTLS] - ATTRIBUTES IS UNDEFINED (in  decoded_jwt)');
            }
          }
        }
      }, (error) => {

        this.logger.error('[CONTACTS-DTLS] - GET LEAD BY REQUESTER ID - ERROR ', error);
        this.fillColour = '#eeeeee';
        this.contact_fullname_initial = 'N/A';

      }, () => {
        this.logger.log('[CONTACTS-DTLS] - GET LEAD BY REQUESTER ID * COMPLETE *');
      });
  }


  toggleShowAllString(elementAttributeValueId: any, elementArrowIconId: any, index) {

    // this.logger.log(`[CONTACTS-DTLS] - ATTRIBUTES - element Attribute Value Id:`, elementAttributeValueId);
    // this.logger.log(`[CONTACTS-DTLS] - ATTRIBUTES - element Arrow Icon id:`, elementArrowIconId);

    // -------------------------------------------------------------
    // get the element that contains the attribute's value
    // -------------------------------------------------------------
    const attributeValueElem = <HTMLElement>document.querySelector(`#${elementAttributeValueId}`);
    // this.logger.log(`[CONTACTS-DTLS] ATTRIBUTES attributeValueElem :`, attributeValueElem);

    // -------------------------------------------------------------
    // get the element arrow icon 
    // -------------------------------------------------------------
    const arrowIconElem = <HTMLElement>document.querySelector(`#${elementArrowIconId}`);
    // this.logger.log(`[CONTACTS-DTLS] ATTRIBUTES arrowIconElem :`, arrowIconElem);

    // -------------------------------------------------------------
    // get the value of aria-expanded
    // -------------------------------------------------------------
    let isAriaExpanded = attributeValueElem.getAttribute('aria-expanded')
    // this.logger.log(`[CONTACTS-DTLS] ATTRIBUTES - element »»»»»»»»»»» isAriaExpanded:`, isAriaExpanded);


    if (isAriaExpanded === 'false') {
      // -----------------------------------------------------------------------------------
      // Replace class to the div that contains the attribute's value
      // -----------------------------------------------------------------------------------
      attributeValueElem.className = attributeValueElem.className.replace(/\battribute_cutted_text\b/g, "attribute_full_text")

      // -----------------------------------------------------------------------------------
      // Add class to the arrow icon
      // -----------------------------------------------------------------------------------
      arrowIconElem.classList.add("up");


      // -----------------------------------------------------------------------------------
      // Set aria-expanded attribute to true
      // -----------------------------------------------------------------------------------
      attributeValueElem.setAttribute('aria-expanded', 'true');
    }

    if (isAriaExpanded === 'true') {
      // -----------------------------------------------------------------------------------
      // Replace class to the div that contains the attribute's value 
      // -----------------------------------------------------------------------------------
      attributeValueElem.className = attributeValueElem.className.replace(/\battribute_full_text\b/g, "attribute_cutted_text")

      // -----------------------------------------------------------------------------------
      // Remove the class 'up' to the arrow icon (note: Remove Class Cross-browser solution)
      // ------------------------------------------------------------------------------------
      arrowIconElem.className = arrowIconElem.className.replace(/\bup\b/g, "");

      // -----------------------------------------------------------------------------------
      // Set aria-expanded attribute to false
      // -----------------------------------------------------------------------------------
      attributeValueElem.setAttribute('aria-expanded', 'false');
    }
  }

  toggleShowAllClientString() {
    this.showAllClientString = !this.showAllClientString;
    this.logger.log('[CONTACTS-DTLS] - SHOW ALL TEXT OF THE ATTRIBUTES > CLIENT ', this.showAllClientString)
  }
  toggleShowAllsenderAuthInfoString() {
    this.showAllsenderAuthInfoString = !this.showAllsenderAuthInfoString;
    this.logger.log('[CONTACTS-DTLS] - SHOW ALL TEXT OF THE ATTRIBUTES > SENDER AUTH INFO ', this.showAllsenderAuthInfoString);
  }

  toggleShowAllSourcePageString() {
    this.showAllSourcePageString = !this.showAllSourcePageString;
    this.logger.log('[CONTACTS-DTLS] - SHOW ALL TEXT OF THE ATTRIBUTES > SOURCR PAGE ', this.showAllSourcePageString);
  }

  goBack() {
    this.location.back();
  }


  getRequestText(text: string): string {
    if (text) {
      return text.length >= 95 ?
        text.slice(0, 95) + '...' :
        text;
    }
  }

  chatWithAgent() {
    this.logger.log("[CONTACTS-DTLS] CHAT WITH AGENT > CONTACT: ", this.contact_details);

    // const url = this.CHAT_BASE_URL + '?' + 'recipient=' + this.contact_details._id + '&recipientFullname=' + this.contact_details.fullname;
    const url = this.CHAT_BASE_URL + '#/conversation-detail/' + this.contact_details._id + '/' + this.contact_details.fullname + '/new'
    this.logger.log('[USERS] - CHAT WITH AGENT - CHAT URL ', url);
    this.logger.log("[CONTACTS-DTLS] - CHAT URL ", url);
    window.open(url, '_blank');
  }

  goToRequestMsgs(request_recipient: string) {
    // this.router.navigate(['project/' + this.projectId + '/request/' + request_recipient + '/messages']);
    this.router.navigate(['project/' + this.projectId + '/wsrequest/' + request_recipient + '/messages']);
  }

  goToEditContact(requester_id) {
    this.router.navigate(['project/' + this.projectId + '/contact/edit', requester_id]);
  }

  goToEditContactNote(requester_id) {
    this.router.navigate(['project/' + this.projectId + '/contact/edit', requester_id], { fragment: 'note' });
  }

  goToEditContactAddress(requester_id) {
    this.router.navigate(['project/' + this.projectId + '/contact/edit', requester_id], { fragment: 'address' });
  }

  goToEditContactPhone(requester_id) {
    this.router.navigate(['project/' + this.projectId + '/contact/edit', requester_id], { fragment: 'phone' });
  }


  openDeleteContactModal(id: string, fullName: string) {
    this.logger.log('[CONTACTS-DTLS] - ON OPEN DELETE  MODAL -> CONTACT ID ', id);
    this.logger.log('[CONTACTS-DTLS] - ON OPEN DELETE  MODAL -> FULL NAME ID ', fullName);

    this.displayDeleteModal = 'block';

    this.id_toDelete = id;
    this.fullName_toDelete = fullName;
  }

  onCloseDeleteModal() {
    this.displayDeleteModal = 'none';
  }

  deleteContact() {
    this.displayDeleteModal = 'none';

    this.contactsService.deleteLead(this.id_toDelete)
      .subscribe((lead: any) => {
        this.logger.log('[CONTACTS-DTLS] - DELETE CONTACT RES ', lead);

        // GO TO CONTACT LIST
        this.goToContactDetails()
      }, (error) => {
        this.logger.error('[CONTACTS-DTLS] - DELETE CONTACT - ERROR ', error);
        // =========== NOTIFY ERROR ===========
        // this.notify.showNotification('An error occurred while deleting contact', 4, 'report_problem');
        this.notify.showWidgetStyleUpdateNotification(this.deleteLeadErrorNoticationMsg, 4, 'report_problem');
      }, () => {
        this.logger.log('[CONTACTS-DTLS] - DELETE CONTACT * COMPLETE *');
        // =========== NOTIFY SUCCESS===========
        // this.notify.showNotification('Contact successfully deleted', 2, 'done');
        this.notify.showWidgetStyleUpdateNotification(this.deleteLeadSuccessNoticationMsg, 2, 'done');
      });

  }

  goToContactDetails() {
    this.router.navigate(['project/' + this.projectId + '/contacts']);
  }

  openAddContactNameForm($event) {
    $event.stopPropagation();
    this.isOpenEditContactFullnameDropdown = !this.isOpenEditContactFullnameDropdown
    this.logger.log('openAddContactNameForm - isOpenEditContactFullnameDropdown', this.isOpenEditContactFullnameDropdown)
    const elemDropDown = <HTMLElement>document.querySelector('.lead-dropdown__menu-form');
    this.logger.log('elemDropDown EDIT CONTACT NAME ', elemDropDown)
    if (!elemDropDown.classList.contains("dropdown__menu-form--active")) {

      elemDropDown.classList.add("dropdown__menu-form--active");
      this.logger.log('here 1')
    } else if (elemDropDown.classList.contains("dropdown__menu-form--active")) {
      elemDropDown.classList.remove("dropdown__menu-form--active");
      this.logger.log('here 2')
    }

    this.contactNewFirstName = undefined;
    this.contactNewLastName = undefined;
  }



  updateContactFullName() {
    // const elemDropDown = <HTMLElement>document.querySelector('.dropdown__menu');
    // elemDropDown.classList.remove("dropdown__menu--active");

    const elemDropDown = <HTMLElement>document.querySelector('.lead-dropdown__menu-form');
    elemDropDown.classList.remove("dropdown__menu-form--active");
    this.logger.log('[WS-REQUESTS-MSGS] saveContactFullName  contactNewFirstName', this.contactNewFirstName)
    this.logger.log('[WS-REQUESTS-MSGS] saveContactFullName  contactNewLastName', this.contactNewLastName)
   
    // request?.lead?.fullname
    if (this.contactNewFirstName && !this.contactNewLastName) {

      const lead_fullname = this.contactNewFirstName
      this.logger.log('[WS-REQUESTS-MSGS] saveContactFullName usecase only contactNewFirstName - lead_fullname', lead_fullname)
      this._createRequesterAvatar(lead_fullname)

      this.contact_details.fullname = lead_fullname
      this.updateContactName(this.contact_details._id, lead_fullname);
    } else if (this.contactNewFirstName && this.contactNewLastName) {

      const lead_fullname = this.contactNewFirstName + ' ' + this.contactNewLastName
      this.logger.log('[WS-REQUESTS-MSGS] saveContactFullName usecase  contactNewFirstName & contactNewLastName - lead_fullname', lead_fullname)
      this.contact_details.fullname = lead_fullname
      this._createRequesterAvatar(lead_fullname)
      this.updateContactName(this.contact_details._id, lead_fullname);
    }
  }
  _createRequesterAvatar(lead_fullname) {
    if (lead_fullname) {
      this.contact_fullname_initial = avatarPlaceholder(lead_fullname);
      this.fillColour = getColorBck(lead_fullname)
    } else {

      this.contact_fullname_initial = 'N/A';
      this.fillColour = 'rgb(98, 100, 167)';
    }

  }

  updateContactName(lead_id, lead_fullname) {
    this.contactsService.updateLeadFullname(lead_id, lead_fullname)
      .subscribe((contact) => {
        this.logger.log('[WS-REQUESTS-MSGS] - UPDATED CONTACT ', contact);
      }, (error) => {
        this.logger.error('[WS-REQUESTS-MSGS] - UPDATE CONTACT - ERROR ', error);
        // =========== NOTIFY ERROR ===========
        // this.notify.showNotification('An error occurred while updating contact', 4, 'report_problem');
      }, () => {
        this.logger.log('[WS-REQUESTS-MSGS] - UPDATE CONTACT * COMPLETE *');
        // =========== NOTIFY SUCCESS===========
        // this.notify.showNotification('Contact successfully updated', 2, 'done')
      });
  }

  @HostListener('document:click', ['$event'])
  clickout(event) {

    this.logger.log('[WS-REQUESTS-MSGS] clickout event.target.id)', event.target.id)

    const clicked_element_id = event.target.id


    if (clicked_element_id.startsWith("edit-fullname")) {
      this.logger.log('>>> click inside')
      // const elemDropDown = <HTMLElement>document.querySelector('.lead-dropdown__menu-form');
      // // this.logger.log('elemDropDown EDIT CONTACT NAME ', elemDropDown)
      // if (!elemDropDown.classList.contains("dropdown__menu-form--active")) {

      //   elemDropDown.classList.add("dropdown__menu-form--active");
      //   // this.logger.log('here 1 A')
      // } else if (elemDropDown.classList.contains("dropdown__menu-form--active")) {
      //   elemDropDown.classList.remove("dropdown__menu-form--active");
      //   // this.logger.log('here 2 A')
      // }
    } else {
      this.logger.log('[WS-REQUESTS-MSGS] >>> click outside')
      this.closeEditContactFullnameDropdown()
    }
  }

  closeEditContactFullnameDropdown() {
    const elemDropDown = <HTMLElement>document.querySelector('.lead-dropdown__menu-form');
    if (elemDropDown && elemDropDown.classList.contains("dropdown__menu-form--active")) {
      elemDropDown.classList.remove("dropdown__menu-form--active");
    }
  }


}
