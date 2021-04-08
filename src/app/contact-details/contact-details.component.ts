import { Component, OnInit, HostListener, AfterViewInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RequestsService } from '../services/requests.service';

import { ContactsService } from '../services/contacts.service';
import { BotLocalDbService } from '../services/bot-local-db.service';
import { LocalDbService } from '../services/users-local-db.service';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { avatarPlaceholder, getColorBck } from '../utils/util';
import { NotifyService } from '../core/notify.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from 'app/services/app-config.service';
import { UsersService } from '../services/users.service';
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

  constructor(
    public location: Location,
    private route: ActivatedRoute,
    private requestsService: RequestsService,
    private usersLocalDbService: LocalDbService,
    private botLocalDbService: BotLocalDbService,
    private router: Router,
    public auth: AuthService,
    private contactsService: ContactsService,
    private notify: NotifyService,
    private translate: TranslateService,
    private appConfigService: AppConfigService,
    private usersService: UsersService
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
    // console.log(`:-D CONTACT DETAILS - ATTRIBUTES onResize attributeValueElem offsetWidth:`, this.rightSidebarWidth);
  }

  ngOnInit() {

    // this.auth.checkRoleForCurrentProject();
    this.getRequesterIdParam_AndThenGetRequestsAndContactById();
    this.getCurrentProject();
    this.getCurrentUser();
    this.getTranslation();
    this.getChatUrl();
  }

  getChatUrl() {
    this.CHAT_BASE_URL = this.appConfigService.getConfig().CHAT_BASE_URL;
    console.log('AppConfigService getAppConfig (!!!!! CONTACTS DTLS) CHAT_BASE_URL', this.CHAT_BASE_URL);
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
    // console.log('!!!!! CONTACTS - ON MODAL DELETE OPEN -> USER ID ', id);

    // this.displayDeleteModal = 'block';

    // this.id_toDelete = id;
    // this.fullName_toDelete = fullName;

    this.translate.get('MoveTheContactToTheTrash', { contactname: fullName }).subscribe((text: string) => {

      this.moveContactToTrash_msg = text
    })
    console.log('!!!!! CONTACTS DTLS - moveContactToTrash ', this.moveContactToTrash_msg);

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
              this.goToContactList();
            });

          });
        } else {
          console.log('swal willDelete', willDelete)
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

    console.log(`:-D CONTACT DETAILS - ATTRIBUTES AfterViewInit attributeValueElem offsetWidth:`, this.rightSidebarWidth);

  }


  // TRANSLATION
  translateDeleteLeadSuccessMsg() {
    this.translate.get('DeleteLeadSuccessNoticationMsg')
      .subscribe((text: string) => {

        this.deleteLeadSuccessNoticationMsg = text;
        // console.log('+ + + DeleteLeadSuccessNoticationMsg', text)
      });
  }

  // TRANSLATION
  translateDeleteLeadErrorMsg() {
    this.translate.get('DeleteLeadErrorNoticationMsg')
      .subscribe((text: string) => {

        this.deleteLeadErrorNoticationMsg = text;
        // console.log('+ + + DeleteLeadErrorNoticationMsg', text)
      });

  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      console.log('00 -> CONTACT DETAILS - PRJCT FROM SUBSCRIPTION TO AUTH SERV  ', project)
      if (project) {
        this.projectId = project._id;
      }
    });
  }

  getCurrentUser() {
    const user = this.auth.user_bs.value

    console.log('!!!!! CONTACTS DETAILS - LOGGED USER ', user);
    if (user) {

      this.currentUserID = user._id
      console.log('!!!!! CONTACTS DETAILS- USER UID ', this.currentUserID);

    } else {
      // console.log('No user is signed in');
    }
  }

  getRequesterIdParam_AndThenGetRequestsAndContactById() {
    this.requester_id = this.route.snapshot.params['requesterid'];
    console.log('!!!!! CONTACTS DETAILS - REQUESTER ID ', this.requester_id);

    if (this.requester_id) {
      this.getContactById();
      this.getRequests();

    }
  }

  decreasePageNumber() {
    this.pageNo -= 1;

    console.log('!!!!! CONTACTS DETAILS - DECREASE PAGE NUMBER ', this.pageNo);
    this.getRequests()
  }

  increasePageNumber() {
    this.pageNo += 1;
    console.log('!!!!! CONTACTS DETAILS  - INCREASE PAGE NUMBER ', this.pageNo);
    this.getRequests()
  }


  getRequests() {
    this.contactsService.getNodeJsRequestsByRequesterId(this.requester_id, this.pageNo)
      .subscribe((requests_object: any) => {

        if (requests_object) {
          console.log('!!!!! CONTACTS DETAILS - REQUESTS OBJECTS ', requests_object);
          this.requests_list = requests_object['requests'];
          console.log('!!!!! CONTACTS DETAILS - REQUESTS LIST (got by requester_id) ', this.requests_list);

          this.requests_list = requests_object['requests'];


          this.requests_list.forEach(request => {
            request.currentUserIsJoined = false;
            console.log(' REQUEST ', request)
            request.participants.forEach(p => {
              console.log(' Participant ', p);
              if (p === this.currentUserID) {
                request.currentUserIsJoined = true;
                return
              }
            })
            // Object.keys(participants).forEach(m => {
          });


          // to test pagination
          // const requestsCount = 83;
          const requestsCount = requests_object['count'];
          console.log('!!!!! CONTACTS DETAILS - REQUESTS COUNT ', requestsCount);

          this.displayHideFooterPagination(requestsCount);

          const requestsPerPage = requests_object['perPage'];
          console.log('!!!!! CONTACTS DETAILS - N° OF REQUESTS X PAGE ', requestsPerPage);

          const totalPagesNo = requestsCount / requestsPerPage;
          console.log('!!!!! CONTACTS DETAILS - TOTAL PAGES NUMBER', totalPagesNo);

          this.totalPagesNo_roundToUp = Math.ceil(totalPagesNo);
          console.log('!!!!! CONTACTS DETAILS  - TOTAL PAGES NUMBER ROUND TO UP ', this.totalPagesNo_roundToUp);

        }
      }, (error) => {
        this.showSpinner = false;
        console.log('!!!!! CONTACTS DETAILS - GET REQUEST BY REQUESTER ID - ERROR ', error);
      }, () => {
        this.showSpinner = false;
        console.log('!!!!! CONTACTS DETAILS - GET REQUEST BY REQUESTER ID * COMPLETE *');
      });
  }

  displayHideFooterPagination(requests_count) {
    // DISPLAY / HIDE PAGINATION IN THE FOOTER
    if (requests_count >= 16) {
      this.displaysFooterPagination = true;
      // tslint:disable-next-line:max-line-length
      console.log('!!!!! CONTACTS DETAILS ', requests_count, 'DISPLAY FOOTER PAG ', this.displaysFooterPagination);
    } else {
      this.displaysFooterPagination = false;
      // tslint:disable-next-line:max-line-length
      console.log('!!!!! CONTACTS DETAILS ', requests_count, 'DISPLAY FOOTER PAG ', this.displaysFooterPagination);
    }
  }


  toggleAddress() {
    this.showAllAddress = !this.showAllAddress;
    console.log('!!!!! CONTACTS DETAILS SHOW ALL ADDRESS ', this.showAllAddress);

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
    console.log('!!!!! CONTACTS DETAILS SHOW ALL ATTRIBUTES ', this.showAttributes);

    const attributesArrowIconElem = <HTMLElement>document.querySelector('#attributes_arrow_down');

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
    console.log('WS-REQUESTS-MSGS - ATTRIBUTES DECODED JWT - open attributes-decoded-jwt-accordion -  accordion elem ', acc);
    acc.classList.toggle("active");
    // var panel = acc.nextElementSibling ;
    var panel = <HTMLElement>document.querySelector('.attributes-decoded-jwt-panel')
    console.log('WS-REQUESTS-MSGS - ATTRIBUTES DECODED JWT-  open attributes-decoded-jwt-panel  -  panel ', panel);

    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  }


  getProjectUserById(leadid) {
    this.usersService.getProjectUserById(leadid).subscribe((projectUser: any) => {

    
      // console.log('!!!!! CONTACTS DETAILS - GET PROJECT USER BY LEAD ID RES  ', projectUser);
      // console.log('!!!!! CONTACTS DETAILS - GET PROJECT USER BY LEAD ID projectUser[0]  ', projectUser[0]);
      // console.log('!!!!! CONTACTS DETAILS - GET PROJECT USER BY LEAD ID projectUser[0] isAuthenticated ', projectUser[0]['isAuthenticated']);
      this.CONTACT_IS_VERIFIED = projectUser[0]['isAuthenticated']
      console.log('!!!!! CONTACTS DETAILS - GET PROJECT USER BY LEAD ID CONTACT_IS_VERIFIED ', this.CONTACT_IS_VERIFIED);
    },
      (error) => {
        console.log('!!!!! CONTACTS DETAILS - GET PROJECT USER BY LEAD ID ERR  ', error);
      },
      () => {
        console.log('!!!!! CONTACTS DETAILS - GET PROJECT USER BY LEAD ID * COMPLETE *');
      });
  }

  getContactById() {
    this.contactsService.getLeadById(this.requester_id)
      .subscribe((lead: any) => {

        if (lead) {
          console.log('!!!!! CONTACTS DETAILS - GET LEAD BY REQUESTER ID ', lead);
          this.contact_details = lead;

          if (this.contact_details && this.contact_details.lead_id) {
            this.lead_id = this.contact_details.lead_id;
            
            this.getProjectUserById(this.lead_id)

            console.log('!!!!! CONTACTS DETAILS this.lead_id', this.lead_id) 
          }


          if (this.contact_details.streetAddress && this.contact_details.streetAddress !== "") {
            this.streetAddress = this.contact_details.streetAddress
          } else {
            this.streetAddress = 'n/a'
          }

          if (this.contact_details.city && this.contact_details.city !== "") {
            this.city = this.contact_details.city
          } else {
            this.city = 'n/a'
          }

          if (this.contact_details.region && this.contact_details.region !== "") {
            this.region = this.contact_details.region
          } else {
            this.region = 'n/a'
          }

          if (this.contact_details.zipcode && this.contact_details.zipcode !== "") {
            this.zipcode = this.contact_details.zipcode
          } else {
            this.zipcode = 'n/a'
          }

          if (this.contact_details.country && this.contact_details.country !== "") {
            this.country = this.contact_details.country
          } else {
            this.country = 'n/a'
          }

          if (this.contact_details.fullname) {

            // this.contact_fullname_initial = this.contact_details.fullname.charAt(0).toUpperCase();
            // console.log('!!!!! CONTACTS DETAILS - CONTACT INITIAL: ', this.contact_fullname_initial);
            // const charIndex = this.contact_fullname_initial.charCodeAt(0) - 65
            // const colourIndex = charIndex % 19;
            // console.log('!!!!! CONTACTS DETAILS - CONTACT colourIndex: ', colourIndex);
            // this.fillColour = this.colours[colourIndex];
            // console.log('!!!!! CONTACTS DETAILS - CONTACT fillColour: ', this.fillColour);

            this.contact_fullname_initial = avatarPlaceholder(this.contact_details.fullname);
            this.fillColour = getColorBck(this.contact_details.fullname);
          } else {

            this.contact_fullname_initial = 'N/A';
            this.fillColour = '#6264a7';
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

              // console.log(`:-D Ws-REQUESTS-Msgs - getWsRequestById ATTRIBUTES key : ${key} - value ${value}`);

              let _value: any;
              if (typeof value === 'object' && value !== null) {

                console.log(`:-D CONTACTS DETAILS - ATTRIBUTES value is an object :`, JSON.stringify(value));
                _value = JSON.stringify(value)
              } else {
                _value = value
              }

              // https://stackoverflow.com/questions/50463738/how-to-find-width-of-each-character-in-pixels-using-javascript
              let letterLength = {};
              let letters = ["", " ", " ?", "= ", " -", " :", " _", " ,", " ", " ", " ", "(", ")", "}", "{", "\"", " ", "/", ".", "a", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

              for (let letter of letters) {
                let span = document.createElement('span');
                span.append(document.createTextNode(letter));
                span.style.display = "inline-block";
                document.body.append(span);
                letterLength[letter] = span.offsetWidth;
                span.remove();
              }
              let totalLength = 0;

              // for (let i = 0; i < _value.length; i++) {
              //   console.log(':-D Ws-REQUESTS-Msgs - getWsRequestById _value[i]', _value[i] + ": " + letterLength[_value[i]])
              // }

              for (let i = 0; i < _value.length; i++) {
                if (letterLength[_value[i]] !== undefined) {
                  totalLength += letterLength[_value[i]];
                } else {
                  // if the letter not is in dictionary letters letterLength[_value[i]] is undefined so add the witdh of the 'S' letter (8px)
                  totalLength += letterLength['S'];
                }
              }

              console.log(':-D CONTACTS DETAILS - ATTRIBUTES value LENGHT ', _value + " totalLength : " + totalLength)

              let entries = { 'attributeName': key, 'attributeValue': _value, 'attributeValueL': totalLength };

              this.attributesArray.push(entries)
            } // ./end for
            console.log(':-D CONTACTS DETAILS - getWsRequestById attributesArray: ', this.attributesArray);
            // --------------------------------------------------------------------------------------------------------------

            // ---------------------------------------------------------
            // @ Contact Attributes DECODED JWT
            // ---------------------------------------------------------
            if (this.contact_details.attributes) {
              if (this.contact_details.attributes.decoded_jwt) {
                console.log('WS-REQUESTS-MSGS - ATTRIBUTES DECODED JWT ', this.contact_details.attributes.decoded_jwt);
                this.attributesDecodedJWTArray = []
                for (let [key, value] of Object.entries(this.contact_details.attributes.decoded_jwt)) {

                  console.log(`WS-REQUESTS-MSGS - ATTRIBUTES DECODED JWT -key : ${key} - value ${value}`);

                  let _value: any;
                  if (typeof value === 'object' && value !== null) {

                    // console.log(`:-D Ws-REQUESTS-Msgs - getWsRequestById ATTRIBUTES value is an object :`, JSON.stringify(value));
                    _value = JSON.stringify(value)
                  } else {
                    _value = value
                  }

                  // https://stackoverflow.com/questions/50463738/how-to-find-width-of-each-character-in-pixels-using-javascript
                  let letterLength = {};
                  let letters = ["", " ", " ?", "= ", " -", " :", " _", " ,", " ", " ", " ", "(", ")", "}", "{", "\"", " ", "/", ".", "a", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

                  for (let letter of letters) {
                    let span = document.createElement('span');
                    span.append(document.createTextNode(letter));
                    span.style.display = "inline-block";
                    document.body.append(span);
                    letterLength[letter] = span.offsetWidth;
                    span.remove();
                  }
                  let totalLength = 0;

                  // for (let i = 0; i < _value.length; i++) {
                  //   console.log(':-D Ws-REQUESTS-Msgs - getWsRequestById _value[i]', _value[i] + ": " + letterLength[_value[i]])
                  // }

                  for (let i = 0; i < _value.length; i++) {
                    if (letterLength[_value[i]] !== undefined) {
                      totalLength += letterLength[_value[i]];
                    } else {
                      // if the letter not is in dictionary letters letterLength[_value[i]] is undefined so add the witdh of the 'S' letter (8px)
                      totalLength += letterLength['S'];
                    }
                  }
                  // console.log(':-D Ws-REQUESTS-Msgs - getWsRequestById ATTRIBUTES value LENGHT ', _value + " totalLength : " + totalLength)
                  if (key !== 'attributes') {
                    let entries = { 'attributeName': key, 'attributeValue': _value, 'attributeValueL': totalLength };


                    this.attributesDecodedJWTArray.push(entries)
                  }
                }
                console.log('WS-REQUESTS-MSGS - ATTRIBUTES DECODED JWT - attributesDecodedJWTArray: ', this.attributesDecodedJWTArray);
                // --------------------------------------------------------------------------------------------------------------
              } else {

                console.log('WS-REQUESTS-MSGS - ATTRIBUTES DECODED JWT IS UNDEFINED ');
              }
            } else {
              console.log('WS-REQUESTS-MSGS - ATTRIBUTES IS UNDEFINED ');
            }

            // ---------------------------------------------------------
            // Attributes DECODED JWT Attributes
            // ---------------------------------------------------------
            if (this.contact_details.attributes) {
              if (this.contact_details.attributes.decoded_jwt && this.contact_details.attributes.decoded_jwt.attributes) {
                console.log('WS-REQUESTS-MSGS - ATTRIBUTES DECODED JWT ATTRIBUTES', this.contact_details.attributes.decoded_jwt.attributes);

                this.attributesDecodedJWTAttributesArray = []
                // for (let [key, value] of Object.entries(this.request.attributes.decoded_jwt.attributes)) {
                for (const [index, [key, value]] of Object.entries(Object.entries(this.contact_details.attributes.decoded_jwt.attributes))) {

                  console.log(`WS-REQUESTS-MSGS - ATTRIBUTES DECODED JWT ATTRIBUTES index :${index}: -key  ${key} - value ${value}`);

                  let _value: any;
                  if (typeof value === 'object' && value !== null) {

                    // console.log(`:-D Ws-REQUESTS-Msgs - getWsRequestById ATTRIBUTES value is an object :`, JSON.stringify(value));
                    _value = JSON.stringify(value)
                  } else {
                    _value = value
                  }

                  // https://stackoverflow.com/questions/50463738/how-to-find-width-of-each-character-in-pixels-using-javascript
                  let letterLength = {};
                  let letters = ["", " ", " ?", "= ", " -", " :", " _", " ,", " ", " ", " ", "(", ")", "}", "{", "\"", " ", "/", ".", "a", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

                  for (let letter of letters) {
                    let span = document.createElement('span');
                    span.append(document.createTextNode(letter));
                    span.style.display = "inline-block";
                    document.body.append(span);
                    letterLength[letter] = span.offsetWidth;
                    span.remove();
                  }
                  let totalLength = 0;

                  if (_value) {
                    for (let i = 0; i < _value.length; i++) {
                      console.log(':-D Ws-REQUESTS-Msgs - getWsRequestById _value[i]', _value[i] + ": " + letterLength[_value[i]])
                    }

                    for (let i = 0; i < _value.length; i++) {
                      if (letterLength[_value[i]] !== undefined) {
                        totalLength += letterLength[_value[i]];
                      } else {
                        // if the letter not is in dictionary letters letterLength[_value[i]] is undefined so add the witdh of the 'S' letter (8px)
                        totalLength += letterLength['S'];
                      }
                    }
                  }
                  // console.log(':-D Ws-REQUESTS-Msgs - getWsRequestById ATTRIBUTES value LENGHT ', _value + " totalLength : " + totalLength)

                  let entries = { 'attributeName': key, 'attributeValue': _value, 'decodedJWTType': 'Attributes', 'attributeValueL': totalLength, 'index': index };

                  this.attributesDecodedJWTAttributesArray.push(entries)
                }
                console.log('WS-REQUESTS-MSGS - ATTRIBUTES DECODED JWT  ATTRIBUTES - attributesDecodedJWTAttributesArray: ', this.attributesDecodedJWTAttributesArray);

                this.attributesDecodedJWTArrayMerged = [].concat(this.attributesDecodedJWTArray, this.attributesDecodedJWTAttributesArray);

                console.log('WS-REQUESTS-MSGS - ATTRIBUTES DECODED JWT  ATTRIBUTES - attributesDecodedJWTArrayMerged: ', this.attributesDecodedJWTArrayMerged);
                // --------------------------------------------------------------------------------------------------------------
              } else {
                this.attributesDecodedJWTArrayMerged = this.attributesDecodedJWTArray
                console.log('WS-REQUESTS-MSGS - ATTRIBUTES DECODED JWT  ATTRIBUTES IS UNDEFINED (in decoded_jwt)');
                console.log('WS-REQUESTS-MSGS - ATTRIBUTES DECODED JWT  ATTRIBUTES - attributesDecodedJWTArrayMerged: ', this.attributesDecodedJWTArrayMerged);
              }
            } else {
              console.log('WS-REQUESTS-MSGS - ATTRIBUTES IS UNDEFINED (in  decoded_jwt)');
            }


          }
        }

      }, (error) => {

        console.log('!!!!! CONTACTS DETAILS - GET LEAD BY REQUESTER ID - ERROR ', error);
        this.fillColour = '#eeeeee';
        this.contact_fullname_initial = 'n.a.';

      }, () => {
        console.log('!!!!! CONTACTS DETAILS - GET LEAD BY REQUESTER ID * COMPLETE *');
      });

  }


  toggleShowAllString(elementAttributeValueId: any, elementArrowIconId: any, index) {

    console.log(`:-D Ws-REQUESTS-Msgs - getWsRequestById ATTRIBUTES - element Attribute Value Id:`, elementAttributeValueId);
    console.log(`:-D Ws-REQUESTS-Msgs - getWsRequestById ATTRIBUTES - element Arrow Icon id:`, elementArrowIconId);

    // -------------------------------------------------------------
    // get the element that contains the attribute's value
    // -------------------------------------------------------------
    const attributeValueElem = <HTMLElement>document.querySelector(`#${elementAttributeValueId}`);
    console.log(`:-D Ws-REQUESTS-Msgs - getWsRequestById ATTRIBUTES attributeValueElem :`, attributeValueElem);

    // -------------------------------------------------------------
    // get the element arrow icon 
    // -------------------------------------------------------------
    const arrowIconElem = <HTMLElement>document.querySelector(`#${elementArrowIconId}`);
    console.log(`:-D Ws-REQUESTS-Msgs - getWsRequestById ATTRIBUTES arrowIconElem :`, arrowIconElem);

    // -------------------------------------------------------------
    // get the value of aria-expanded
    // -------------------------------------------------------------
    let isAriaExpanded = attributeValueElem.getAttribute('aria-expanded')
    console.log(`:-D Ws-REQUESTS-Msgs - getWsRequestById ATTRIBUTES - element »»»»»»»»»»» isAriaExpanded:`, isAriaExpanded);


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
    console.log('SHOW ALL TEXT OF THE ATTRIBUTES > CLIENT ', this.showAllClientString)
  }
  toggleShowAllsenderAuthInfoString() {
    this.showAllsenderAuthInfoString = !this.showAllsenderAuthInfoString;
    console.log('SHOW ALL TEXT OF THE ATTRIBUTES > SENDER AUTH INFO ', this.showAllsenderAuthInfoString);
  }

  toggleShowAllSourcePageString() {
    this.showAllSourcePageString = !this.showAllSourcePageString;
    console.log('SHOW ALL TEXT OF THE ATTRIBUTES > SOURCR PAGE ', this.showAllSourcePageString);
  }

  goBack() {
    this.location.back();
  }

  // members_replace(member_id) {
  //   const participantIsBot = member_id.includes('bot_')

  //   if (participantIsBot === true) {

  //     const bot_id = member_id.slice(4);
  //         const bot = this.botLocalDbService.getBotFromStorage(bot_id);
  //     if (bot) {
  //       return member_id = '- ' + bot['name'] + ' (bot)';
  //     } else {
  //       return '- ' + member_id
  //     }

  //   } else {

  //     const user = this.usersLocalDbService.getMemberFromStorage(member_id);
  //     if (user) {
  //       // console.log('user ', user)
  //       const lastnameInizial = user['lastname'].charAt(0)
  //       return member_id = '- ' + user['firstname'] + ' ' + lastnameInizial + '.'
  //     } else {
  //       return '- ' + member_id
  //     }
  //   }
  // }

  getRequestText(text: string): string {
    if (text) {
      return text.length >= 95 ?
        text.slice(0, 95) + '...' :
        text;
    }
  }

  chatWithAgent() {
    console.log("CONTACT: ", this.contact_details);

    const url = this.CHAT_BASE_URL + '?' + 'recipient=' + this.contact_details._id + '&recipientFullname=' + this.contact_details.fullname;
    console.log("CONTACT-DETAIL-COMP - CHAT URL ", url);
    window.open(url, '_blank');
  }

  goToRequestMsgs(request_recipient: string) {
    // this.router.navigate(['project/' + this.projectId + '/request/' + request_recipient + '/messages']);
    this.router.navigate(['project/' + this.projectId + '/wsrequest/' + request_recipient + '/messages']);
  }

  goToEditContact(requester_id) {
    this.router.navigate(['project/' + this.projectId + '/contact/edit', requester_id]);
  }

  // goToMemberProfile(member_id: any) {
  //   console.log('!!!!! CONTACTS DETAILS has clicked GO To MEMBER ', member_id);
  //   if (member_id.indexOf('bot_') !== -1) {
  //     console.log('!!!!! CONTACTS DETAILS IS A BOT !');

  //     this.router.navigate(['project/' + this.projectId + '/botprofile/' + member_id]);
  //   } else {
  //     this.router.navigate(['project/' + this.projectId + '/member/' + member_id]);
  //   }
  // }




  openDeleteContactModal(id: string, fullName: string) {
    console.log('!!!!! CONTACTS DETAILS - ON OPEN DELETE  MODAL -> CONTACT ID ', id);
    console.log('!!!!! CONTACTS DETAILS - ON OPEN DELETE  MODAL -> FULL NAME ID ', fullName);

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
        console.log('!!!!! CONTACTS - DELETE CONTACT RES ', lead);

        // GO TO CONTACT LIST
        this.goToContactDetails()
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

  goToContactDetails() {
    this.router.navigate(['project/' + this.projectId + '/contacts']);
  }



}
