import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, HostListener, OnDestroy, ViewEncapsulation, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Message } from '../models/message-model';
import { RequestsService } from '../services/requests.service';
import { AuthService } from '../core/auth.service';
import { environment } from '../../environments/environment';

import { UsersLocalDbService } from '../services/users-local-db.service';
// USED FOR go back last page
import { Location } from '@angular/common';
import { NotifyService } from '../core/notify.service';

import { PlatformLocation } from '@angular/common';
import { BotLocalDbService } from '../services/bot-local-db.service';
import { UsersService } from '../services/users.service';
import { DOCUMENT } from '@angular/platform-browser';
import { avatarPlaceholder, getColorBck } from '../utils/util';
import { Subscription } from 'rxjs/Subscription';
import { fadeInAnimation } from '../_animations/index';

import * as firebase from 'firebase';
import 'firebase/database';

import { AppConfigService } from '../services/app-config.service';

@Component({
  selector: 'appdashboard-requests-msgs',
  templateUrl: './requests-msgs.component.html',
  animations: [fadeInAnimation],
  // tslint:disable-next-line:use-host-property-decorator
  host: { '[@fadeInAnimation]': '' },
  styleUrls: ['./requests-msgs.component.scss'],
  encapsulation: ViewEncapsulation.None, /* it allows to customize 'Powered By' */
})
export class RequestsMsgsComponent implements OnInit, AfterViewInit, OnDestroy {

  public colours = [
    '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e', '#16a085',
    '#27ae60', '#2980b9', '#8e44ad', '#2c3e50', '#f1c40f', '#e67e22',
    '#e74c3c', '#95a5a6', '#f39c12', '#d35400', '#c0392b', '#bdc3c7', '#7f8c8d'
  ];

  @ViewChild('scrollMe')
  private myScrollContainer: ElementRef;

  @ViewChild('openChatBtn')
  private openChatBtn: ElementRef;

  CHAT_BASE_URL = environment.chat.CHAT_BASE_URL;
  BASE_URL = environment.mongoDbConfig.BASE_URL;

  id_request: string;
  messagesList: Message[];
  showSpinner = true;
  showSpinner_inModalUserList = true;
  id_project: string;

  IS_CURRENT_USER_JOINED: boolean;
  HAS_COMPLETED_JOIN_TO_GROUP_POST_REQUEST = false;
  SHOW_JOIN_TO_GROUP_SPINNER_PROCESSING = false;
  JOIN_TO_GROUP_HAS_ERROR = false;

  IS_CURRENT_USER_AGENT: boolean;

  user: any;
  firebase_token: any;
  currentUserID: string;

  request: any;
  members_array: any

  requester_fullname: string;
  requester_id: string;
  user_name: string;
  user_email: string;
  department_name: string;
  department_id: string;
  rating: string;
  rating_message: string;
  source_page: string;

  displayBtnScrollToBottom = 'none';
  displayArchiveRequestModal = 'none';
  displayConfirmReassignmentModal = 'none';
  id_request_to_archive: string;

  SHOW_CIRCULAR_SPINNER = false;
  displayArchivingInfoModal = 'none';
  ARCHIVE_REQUEST_ERROR = false;
  LEAVE_CHAT_ERROR = false;

  newInnerWidth: any;
  newInnerHeight: any;

  users_list_modal_height: any
  main_content_height: any

  windowWidth: any;

  displayUsersListModal = 'none'
  displayLeaveChatModal = 'none'
  displayLeavingChatInfoModal = 'none'
  projectUsersList: any;

  userid_selected: string;
  userfirstname_selected: string;
  userlastname_selected: string;
  useremail_selected: string;
  agents_array: any;
  isMobile: boolean;
  requester_fullname_initial: string;
  fillColour: string;
  REQUESTER_IS_VERIFIED = false;
  cleaned_members_array: any;
  actionInModal: string;

  REQUESTER_IS_ONLINE = false;

  contact_id: string;

  NODEJS_REQUEST_CNTCT_FOUND: boolean;
  subscription: Subscription

  locationSubscription: any;
  OPEN_RIGHT_SIDEBAR = false;
  selectedQuestion: string;
  train_bot_sidebar_height: any;
  // train_bot_sidebar_top_pos: any;

  storageBucket: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private requestsService: RequestsService,
    private auth: AuthService,
    private usersLocalDbService: UsersLocalDbService,
    private _location: Location,
    private notify: NotifyService,
    private platformLocation: PlatformLocation,
    private botLocalDbService: BotLocalDbService,
    private usersService: UsersService,
    public appConfigService: AppConfigService,
    @Inject(DOCUMENT) private document: Document
  ) {

    this.platformLocation.onPopState(() => {

      console.log('PLATFORM LOCATION ON POP STATE')
    });

    // console.log('REQUEST-MSGS - ON RESIZE -> WINDOW WITH ', this.newInnerWidth);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {

    this.newInnerWidth = event.target.innerWidth;
    console.log('REQUEST-MSGS - ON RESIZE -> WINDOW WITH ', this.newInnerWidth);


    this.newInnerHeight = event.target.innerHeight;
    // console.log('REQUEST-MSGS - ON RESIZE -> WINDOW HEIGHT ', this.newInnerHeight);

    const elemMainContent = <HTMLElement>document.querySelector('.main-content');
    this.main_content_height = elemMainContent.clientHeight
    // console.log('REQUEST-MSGS - ON RESIZE -> MAIN CONTENT HEIGHT', this.main_content_height);

    // determine the height of the modal when the width of the window is <= of 991px when the window is resized
    // RESOLVE THE BUG: @media screen and (max-width: 992px) THE THE HEIGHT OF THE  MODAL 'USERS LIST' IS NOT 100%
    if (this.newInnerWidth <= 991) {
      this.users_list_modal_height = elemMainContent.clientHeight + 70 + 'px'

      this.train_bot_sidebar_height = elemMainContent.clientHeight + 'px'
      // console.log('REQUEST-MSGS - *** MODAL HEIGHT ***', this.users_list_modal_height);
    }


    // remove the padding on small device
    // if (this.newInnerWidth <= 768) {
    //   elemMainContent.setAttribute('style', 'padding-right: 0px; padding-left: 0px');
    // } else {
    //   elemMainContent.setAttribute('style', 'padding-right: 15px; padding-left: 15px');
    // }
  }


  // detect browser back button click
  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    console.log('»»»» Back button pressed');
    // window.onbeforeunload = function () {
    //   return 'Are you sure you want to leave?';
    // };
  }

  ngOnInit() {
    this.listenUrl();
    // prevent browser back button navigation
    // history.pushState(null, null, location.href);
    // window.onpopstate = function (event) {
    //   history.go(1);
    // };

    this.getRequestId();
    this.getCurrentProject();
    this.getLoggedUser();

    this.detectMobile();
    this.getProjectUserRole();
    this.getStorageBucket();
  }

  getStorageBucket() {
    const firebase_conf = this.appConfigService.getConfig().firebase;
    this.storageBucket = firebase_conf['storageBucket'];
    console.log('STORAGE-BUCKET Requests-Msgs ', this.storageBucket)
  }

  openRightSideBar(message: string) {
    this.OPEN_RIGHT_SIDEBAR = true;
    console.log('»»»» OPEN RIGHT SIDEBAR ', this.OPEN_RIGHT_SIDEBAR, ' MSG: ', message);
    this.selectedQuestion = message;


    // questo non funziona se è commented BUG RESOLVE
    const elemMainContent = <HTMLElement>document.querySelector('.main-content');
    this.train_bot_sidebar_height = elemMainContent.clientHeight + 10 + 'px'
    console.log('REQUEST-MSGS - ON OPEN RIGHT SIDEBAR -> RIGHT SIDEBAR HEIGHT', this.train_bot_sidebar_height);


    // BUG RESOLVE inserisco questo visto che all'ampiezza in cui compare la sidebar sx non è comunque possibile scorrere
    // la pagina
    // const _elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    // _elemMainPanel.setAttribute('style', 'overflow-x: hidden !important;overflow-y: hidden !important;');

    // const mainPanelScrollPosition = _elemMainPanel.scrollTop;
    // console.log('mainPanelScrollPosition ', mainPanelScrollPosition);
    // this.train_bot_sidebar_top_pos = mainPanelScrollPosition + 'px'
  }

  closeRightSidebar(event) {
    console.log('»»»» CLOSE RIGHT SIDEBAR ', event);
    this.OPEN_RIGHT_SIDEBAR = event;

    // const _elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    // _elemMainPanel.setAttribute('style', 'overflow-x: hidden !important;');
  }



  listenUrl() {
    // this.subscription = this.router.events.subscribe(() => {
    //   const location_path = this._location.path();
    //   console.log('»»» REQUEST DETAILS location (**** location path ****)', location_path);

    this.locationSubscription = this._location.subscribe((val: any) => {
      // console.log('»»»»» _location ', val)
      if (val.type === 'hashchange') {
        console.log('»»» REQUEST DETAILS location (**** hashchange ****)', val);
        // this.router.navigate(['project/' + this.id_project + '/request/support-group-Lb7rV7Lqt6ZN_MDrCR4/messages'])

        // this.redirectTo(val.url)
        // window.location.reload();
        const urlSplitted = JSON.stringify(val).split('/');
        console.log('»»» REQUEST DETAILS urlSplitted', urlSplitted)
        // const requestId =  urlSplitted[4];
        // console.log('»»»»» _location (only hashchange) requestId', requestId)

        setTimeout(() => {
          if (urlSplitted[3] === 'request') {
            this.showSpinner = true;
            this.getRequestId();
          }
        }, 100);
        // this.ngOnInit();
      }
    });

    // });
  }



  getProjectUserRole() {
    this.usersService.project_user_role_bs.subscribe((user_role) => {
      const current_user_role = user_role;
      console.log('REQUESTS MSGS SUBSCRIBE PROJECT_USER_ROLE_BS ', current_user_role);
      if (current_user_role) {
        console.log('REQUESTS MSGS - PROJECT USER ROLE ', current_user_role);
        if (current_user_role === 'agent') {
          this.IS_CURRENT_USER_AGENT = true;
          console.log('REQUESTS MSGS - PROJECT USER ROLE - IS CURRENT USER AGENT ', this.IS_CURRENT_USER_AGENT);
        } else {
          this.IS_CURRENT_USER_AGENT = false;
          console.log('REQUESTS MSGS - PROJECT USER ROLE - IS CURRENT USER AGENT ', this.IS_CURRENT_USER_AGENT);
        }
      }
    });
  }

  detectMobile() {
    // this.isMobile = true;
    this.isMobile = /Android|iPhone/i.test(window.navigator.userAgent);
    console.log('REQUEST-MSGS - IS MOBILE ', this.isMobile);

    // CUSTOMIZE CARDS AND NAVBAR IF TILEDESK DASHBOARD IS RUNNED ON MOBILE
    if (this.isMobile) {
      const elemMainContent = <HTMLElement>document.querySelector('.main-content');
      elemMainContent.setAttribute('style', 'padding-right: 0px; padding-left: 0px; padding-top: 0px');
      console.log('REQUEST-MSGS - MOBILE DETECTED - SET ATTIBUTE TO AMAIN CONTENT ', elemMainContent);
    }

  }

  openSelectUsersModal(actionSelected) {
    this.actionInModal = actionSelected
    console.log('REQUEST-MSGS - ACTION IN MODAL ', this.actionInModal);
    this.getAllUsersOfCurrentProject();
    this.displayUsersListModal = 'block'
    console.log('REQUEST-MSGS - DISPLAY USERS LIST MODAL ', this.displayUsersListModal);
    const actualHeight = window.innerHeight;
    console.log('REQUEST-MSGS - ON OPEN USER LIST MODAL -> ACTUAL WINDOW HEIGHT  ', actualHeight);
    const actualWidth = window.innerWidth;
    console.log('REQUEST-MSGS - ON OPEN USER LIST MODAL -> ACTUAL WINDOW WIDTH  ', actualWidth);

    const elemMainContent = <HTMLElement>document.querySelector('.main-content');
    this.main_content_height = elemMainContent.clientHeight
    console.log('REQUEST-MSGS - ON OPEN USER LIST MODAL -> ACTUAL MAIN CONTENT HEIGHT', elemMainContent.clientHeight);

    // determine the height of the modal when the width of the window is <= of 991px when is opened the modal
    // RESOLVE THE BUG: @media screen and (max-width: 992px) THE THE HEIGHT OF THE  MODAL 'USERS LIST' IS NOT 100%
    if (actualWidth <= 991) {
      this.users_list_modal_height = elemMainContent.clientHeight + 70 + 'px'
      console.log('REQUEST-MSGS - *** MODAL HEIGHT ***', this.users_list_modal_height);
    }

  }

  closeSelectUsersModal() {
    this.displayUsersListModal = 'none'
    console.log('USERS-MODAL-COMP - ON CLOSE USERS LIST MODAL ', this.displayUsersListModal);
  }


  getAllUsersOfCurrentProject() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      console.log('REQUEST-MSGS - PROJECT USERS (FILTERED FOR PROJECT ID)', projectUsers);

      this.projectUsersList = projectUsers;

    }, error => {
      this.showSpinner_inModalUserList = false;
      console.log('REQUEST-MSGS - PROJECT USERS (FILTERED FOR PROJECT ID) - ERROR', error);
    }, () => {
      this.showSpinner_inModalUserList = false;
      console.log('REQUEST-MSGS - PROJECT USERS (FILTERED FOR PROJECT ID) - COMPLETE');
    });
  }

  selectUser(user_id: string, user_firstname: string, user_lastname: string, user_email: string) {
    console.log('REQUEST-MSGS - SELECTED USER ID ', user_id);
    console.log('REQUEST-MSGS - SELECTED USER FIRSTNAME ', user_firstname);
    console.log('REQUEST-MSGS - SELECTED USER LASTNAME ', user_lastname);
    console.log('REQUEST-MSGS - SELECTED USER EMAIL ', user_email);
    this.userid_selected = user_id;
    this.userfirstname_selected = user_firstname;
    this.userlastname_selected = user_lastname;
    this.useremail_selected = user_email;

    // const testDiv = <HTMLElement>document.querySelector('.swap_btn');
    // console.log('REQUEST-MSGS - SELECTED USER ROW TOP OFFSET ', testDiv.offsetTop);
    this.displayConfirmReassignmentModal = 'block'

    // this.document.body.scrollTop = 0;
  }


  // mouseOvered(event) {
  //   // console.log('REQUEST-MSGS - MOUSE ON ROW ', event);
  //   this._isFirstRow = false;
  //   // console.log('REQUEST-MSGS - MOUSE ON ROW ', this._isFirstRow );
  //   const firsrRow = <HTMLElement>document.querySelector('.tablerow')
  //   console.log('REQUEST-MSGS - MOUSE ON ROW ', firsrRow );
  //   firsrRow.setAttribute('style', 'background-color: #ffffff');
  // }

  closeConfirmReassignmentModal() {
    this.displayConfirmReassignmentModal = 'none'
  }

  reassignRequest(userid_selected) {
    console.log('REQUEST-MSGS - REASSIGN REQUEST TO USER ID ', userid_selected);
    this.displayConfirmReassignmentModal = 'none';
    this.displayUsersListModal = 'none'

    this.joinAnotherAgentLeaveCurrentAgents(userid_selected);

  }

  assignRequest(userid_selected) {
    console.log('REQUEST-MSGS - ASSIGN REQUEST TO USER ID ', userid_selected);
    this.displayConfirmReassignmentModal = 'none';
    this.displayUsersListModal = 'none'
    this.joinAnotherAgent(userid_selected);
  }


  toggleCheckBox(event) {
    if (event.target.checked) {
      console.log('REQUEST-MSGS - TOGGLE CHECKBOX ', event.target.checked);
      // this.preChatForm = true;
      // this.preChatFormValue = 'true'
      // console.log('INCLUDE PRE CHAT FORM ', this.preChatForm)
    } else {
      // this.preChatForm = false;
      // this.preChatFormValue = 'false'
      // console.log('INCLUDE PRE CHAT FORM ', this.preChatForm)
    }
  }

  onInitWindowWidth(): any {
    this.windowWidth = window.innerWidth;
    console.log('ON INIT WINDOW WIDTH ', this.windowWidth);

    return;
  }

  ngAfterViewInit() {

  }

  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      console.log('USER GET IN REQUEST-MSGS COMP ', user)

      this.user = user;
      if (this.user) {
        this.currentUserID = this.user._id
        console.log('USER UID GET IN REQUEST-MSGS COMPONENT', this.currentUserID);

      }
    });
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.id_project = project._id
        // console.log('00 -> BOT EDIT/ADD COMP project ID from AUTH service subscription  ', this.project._id)
      }
    });
  }

  getRequestId() {
    this.id_request = this.route.snapshot.params['requestid'];
    console.log('»»» REQUEST DETAILS - GET REQUEST-ID ', this.id_request);

    if (this.id_request) {
      this.getMessagesList();
      this.getRequestByRecipient();
      this.getContactIdFromNodejsRequest();
    }
  }

  getContactIdFromNodejsRequest() {
    this.requestsService.getNodeJsRequestByFirebaseRequestId(this.id_request, 0).subscribe((nodejsRequest) => {

      console.log('»»» REQUESTS-MSGS.COMP: GET NODEJS REQUEST BY FireBase REQ ID ', nodejsRequest);

      if (nodejsRequest) {
        // if (nodejsRequest['requests'] && nodejsRequest['requests'].length > 0) {

        // if (nodejsRequest['requests'][0]['requester_id']) {
        if (nodejsRequest['requester_id']) {

          // this.contact_id = nodejsRequest['requests'][0]['requester_id']
          this.contact_id = nodejsRequest['requester_id']
          console.log('»»» REQUESTS-MSGS.COMP: NODEJS REQUEST > CONTACT ID ', this.contact_id);
          this.NODEJS_REQUEST_CNTCT_FOUND = true;
          console.log('»»» REQUESTS-MSGS.COMP: NODEJS REQUEST FOUND ? ', this.NODEJS_REQUEST_CNTCT_FOUND);

        } else {

          this.NODEJS_REQUEST_CNTCT_FOUND = false;
          console.log('»»» REQUESTS-MSGS.COMP: NODEJS REQUEST >  FOUND ? ', this.NODEJS_REQUEST_CNTCT_FOUND);
        }

        // }
      }
    }, (err) => {
      console.log('»»» REQUESTS-MSGS.COMP: GET NODEJS REQUEST BY FireBase REQ ID ', err);
      this.showSpinner = false;
    }, () => {
      console.log('»»» REQUESTS-MSGS.COMP: GET NODEJS REQUEST BY FireBase REQ ID * COMPLETE *');


    });
  }

  goToContactDetails() {

    this.router.navigate(['project/' + this.id_project + '/contact', this.contact_id]);

  }

  /**
   * REQUEST' MESSAGES (on FIRESTORE the COLLECTION is 'MESSAGES')
   */
  getMessagesList() {
    // SUBSCIPTION TO snapshotChanges
    // this.requestsService.getSnapshotMsg(this.id_request)
    this.requestsService.getMsgsByRequestId(this.id_request)
      .subscribe((data) => {
        this.messagesList = data;
        console.log('*MSGS - REQUESTS-MSGS.COMP getMessagesList RES', data);
        this.showSpinner = false;

        this.scrollCardContetToBottom();
        // console.log('TIMESTAMP ', this.messagesList);
        // if (data.length) {
        // this.scrollToBottom();
        // }
      }, (err) => {
        console.log('*MSGS - REQUESTS-MSGS.COMP getMessagesList ERROR ', err);
        this.showSpinner = false;
      }, () => {
        console.log('*MSGS - REQUESTS-MSGS.COMP getMessagesList * COMPLETE *');
        // this.showSpinner = false;

      });

  }

  messageSenderInitialLetter(sender_fullname) {
    // console.log('SENDER FULLNAME INITIAL LETTER ', sender_fullname.charAt(0))
    if (sender_fullname) {
      return sender_fullname.charAt(0);
    }

  }

  // GET DETAIL OF THE REQUEST - USED FOR:
  // GET IF THE USER IS JOINED OR NOT JOINED
  getRequestByRecipient() {
    // this.requestsService.getSnapshotConversationByRecipient(this.id_request)
    this.requestsService.getRequestsById(this.id_request)
      .subscribe((request) => {
        // console.log('--> REQUEST ', request);

        if (request) {

          this.request = request[0];
          console.log('»»» REQUEST DETAILS - THIS REQUEST ', this.request);

          this.members_array = Object.keys(request[0].members);
          console.log('»»» REQUEST DETAILS - MEMBERS ARRAY ', this.members_array)

          this.IS_CURRENT_USER_JOINED = request[0].currentUserIsJoined;
          console.log('* IS_CURRENT_USER_JOINED: ', this.IS_CURRENT_USER_JOINED);

          /**
           * REQUESTER FULLNAME
           */
          if (request[0].requester_fullname) {
            this.requester_fullname = request[0].requester_fullname;
            console.log('* REQUESTER FULLNAME: ', this.requester_fullname);

            // this.requester_fullname_initial = this.requester_fullname.charAt(0).toUpperCase();
            // console.log('REQUESTER FULL NAME - INITIAL: ', this.requester_fullname_initial);
            // const charIndex = this.requester_fullname_initial.charCodeAt(0) - 65
            // const colourIndex = charIndex % 19;
            // console.log('REQUESTER FULL NAME - colourIndex: ', colourIndex);
            // this.fillColour = this.colours[colourIndex];
            // console.log('REQUESTER FULL NAME - fillColour: ', this.fillColour);

            this.requester_fullname_initial = avatarPlaceholder(this.requester_fullname);
            this.fillColour = getColorBck(this.requester_fullname);

          } else {

            this.requester_fullname_initial = 'n.a.';
            this.fillColour = '#eeeeee';
          }

          if (request[0].first_message
            && request[0].first_message.senderAuthInfo
            && request[0].first_message.senderAuthInfo.authVar
            && request[0].first_message.senderAuthInfo.authVar.token
            && request[0].first_message.senderAuthInfo.authVar.token.firebase
            && request[0].first_message.senderAuthInfo.authVar.token.firebase.sign_in_provider) {

            if (request[0].first_message.senderAuthInfo.authVar.token.firebase.sign_in_provider === 'custom') {
              this.REQUESTER_IS_VERIFIED = true;
            } else {
              this.REQUESTER_IS_VERIFIED = false;
            }
          } else {
            this.REQUESTER_IS_VERIFIED = false;
          }

          this.requester_id = request[0].requester_id;
          console.log('* REQUESTER ID: ', this.requester_id);

          this.getRequesterAvailabilityStatus(this.requester_id);

          // this.cleaned_members_array = [];
          // this.members_array.forEach(member_id => {
          //   if (member_id !== this.requester_id && member_id !== 'system') {

          //     this.cleaned_members_array.push(member_id)
          //   }
          // });

          console.log('»»» REQUEST DETAILS - CLEANED MEMBERS ARRAY ', this.cleaned_members_array);


          this.agents_array = [];
          this.cleaned_members_array = [];
          this.members_array.forEach(member_id => {
            if (member_id !== this.requester_id && member_id !== 'system') {

              /**
               * cleaned_members_array USED IN reassignRequest:
               * WHEN IS RIASSIGNED A REQUEST IS RUNNED:
               * ** joinToGroup: WITH WHOM THE userid_selected IS JOINED TO THE GROUP
               * ** leaveTheGroup: WITH WHOM LEAVE THE GROUP THE MEMBER ID CONTAINED IN cleaned_members_array
               *    note: before of this in leaveTheGroup was used the currentUserID  */
              this.cleaned_members_array.push(member_id);
              console.log('»»» REQUEST DETAILS - CLEANED MEMBERS ARRAY ', this.cleaned_members_array);

              const memberIsBot = member_id.includes('bot_');

              if (memberIsBot === true) {

                const bot_id = member_id.slice(4);
                console.log('!!! NEW REQUESTS HISTORY - THE PARTICIP', member_id, 'IS A BOT ', memberIsBot, ' - ID ', bot_id);

                const bot = this.botLocalDbService.getBotFromStorage(bot_id);
                if (bot) {

                  this.agents_array.push({ '_id': 'bot_' + bot['_id'], 'firstname': bot['name'], 'isBot': true })

                } else {
                  this.agents_array.push({ '_id': member_id, 'firstname': member_id, 'isBot': true })
                }

                // NON è UN BOT
              } else {
                console.log('--> THIS REQUEST - MEMBER ', member_id)

                // l'utente è salvato nello storage
                const user = this.usersLocalDbService.getMemberFromStorage(member_id);

                if (user) {
                  if (member_id === user['_id']) {
                    // tslint:disable-next-line:max-line-length
                    this.agents_array.push({ '_id': user['_id'], 'firstname': user['firstname'], 'lastname': user['lastname'], 'isBot': false })

                    // this.request.push(user)
                    // console.log('--> THIS REQUEST - USER ', user)
                  }
                } else {
                  this.agents_array.push({ '_id': member_id, 'firstname': member_id, 'isBot': false })
                }
              }
            }
          });

          console.log('--> --> THIS REQUEST - AGENT ARRAY ', this.agents_array)

          if (request[0].attributes) {
            if (request[0].attributes.userFullname) {
              this.user_name = request[0].attributes.userFullname;
              console.log('* USER NAME: ', this.user_name);
            } else {
              this.user_name = 'n.a.'
            }
          } else {

            this.user_name = 'n.a.'
          }

          if (request[0].attributes) {
            if (request[0].attributes.userEmail) {
              this.user_email = request[0].attributes.userEmail;
              console.log('* USER EMAIL: ', this.user_email);
            } else {
              this.user_email = 'n.a.'
            }
          } else {

            this.user_email = 'n.a.'
          }

          if (request[0].attributes) {
            if (request[0].attributes.departmentName) {
              this.department_name = request[0].attributes.departmentName;
              console.log('* DEPATMENT NAME: ', this.department_name);
            } else {
              this.department_name = 'Default'
            }
          } else {
            this.department_name = 'n.a.'
          }

          if (request[0].attributes) {
            if (request[0].attributes.departmentId) {
              this.department_id = request[0].attributes.departmentId;
              console.log('* DEPATMENT ID: ', this.department_id);
            } else {
              this.department_id = 'n.a.'
            }
          } else {
            this.department_id = 'n.a.'
          }

          if (request[0].rating) {
            this.rating = request[0].rating + '/5'
          } else {
            this.rating = 'n.a./5'
          }

          if (request[0].rating_message) {
            this.rating_message = request[0].rating_message
          } else {
            this.rating_message = 'n.a.'
          }

          if (request[0].attributes) {
            if (request[0].attributes.sourcePage) {
              this.source_page = request[0].attributes.sourcePage;
              console.log('* SOURCE PAGE: ', this.source_page);
            } else {
              this.source_page = 'n.a.'
              console.log('* SOURCE PAGE: ', this.source_page);
            }
          } else {

            this.source_page = 'n.a.'
          }
        }
      });
  }

  getRequesterAvailabilityStatus(requester_id: string) {
    // const firebaseRealtimeDbUrl = `/apps/tilechat/presence/LmBT2IKjMzeZ3wqyU8up8KIRB6J3/connections`

    const firebaseRealtimeDbUrl = `/apps/tilechat/presence/` + requester_id + `/connections`

    const connectionsRef = firebase.database().ref().child(firebaseRealtimeDbUrl);

    console.log('»»» REQUEST DETAILS - CALLING REQUESTER AVAILABILITY VALUE ');

    connectionsRef.on('value', (child) => {
      if (child.val()) {
        this.REQUESTER_IS_ONLINE = true;
        console.log('»»» REQUEST DETAILS - REQUESTER is ONLINE ', this.REQUESTER_IS_ONLINE);
      } else {
        this.REQUESTER_IS_ONLINE = false;

        console.log('»»» REQUEST DETAILS - REQUESTER is ONLINE ', this.REQUESTER_IS_ONLINE);
      }

    })
    // userIsOnline(userid){
    //   //this.lastOnlineForUser(userid);
    //   const that = this;
    //   let myConnectionsRefURL = this.urlNodeFirebase+"/presence/"+userid+"/connections";
    //   const connectionsRef = firebase.database().ref().child(myConnectionsRefURL);
    //   connectionsRef.on("value", (child) => {
    //     if(child.val()){
    //       that.events.publish('statusUser:online-'+userid, userid, true);
    //     }
    //     else {
    //       that.events.publish('statusUser:online-'+userid, userid, false);
    //       //that.events.publish('statusUser:offline-'+userid, userid,'offline');
    //     }
    //   })
    // }
  }


  /// new RIASSIGN REQUEST
  joinAnotherAgentLeaveCurrentAgents(userid_selected) {
    this.getFirebaseToken(() => {

      // this.requestsService.joinToGroup(this.currentUserFireBaseUID, this.requestRecipient)
      this.requestsService.joinToGroup(this.id_request, this.firebase_token, userid_selected)
        .subscribe((joinToGroupRes: any) => {

          console.log('RIASSIGN REQUEST - JOIN ANOTHER USER TO CHAT GROUP ', joinToGroupRes);

        }, (err) => {
          console.log('RIASSIGN REQUEST - JOIN ANOTHER USER TO CHAT GROUP - ERROR ', err);

          // =========== NOTIFY ERROR ===========
          this.notify.showNotification('An error has occurred assigning the request', 4, 'report_problem')
        }, () => {
          console.log('RIASSIGN REQUEST - JOIN ANOTHER USER TO CHAT GROUP - COMPLETE');

          // =========== NOTIFY SUCCESS===========
          this.notify.showNotification(`request reassigned to ${this.userfirstname_selected}  ${this.userlastname_selected}`, 2, 'done');

          this.cleaned_members_array.forEach(memberId => {
            // const memberId =  this.cleaned_members_array[0]['_id']

        
            if (memberId !== userid_selected) {
              console.log('RIASSIGN REQUEST - USER ID OF THE USER THAT LEAVE THE GROUP ', memberId)
              this.requestsService.leaveTheGroup(this.id_request, this.firebase_token, memberId)
                .subscribe((leaveTheGroupRes: any) => {

                  console.log('RIASSIGN REQUEST - LEAVE THE GROUP - RESPONSE ', leaveTheGroupRes);
                }, (err) => {
                  console.log('RIASSIGN REQUEST - LEAVE THE GROUP - ERROR ', err);

                  // =========== NOTIFY ERROR ===========
                  this.notify.showNotification('An error has occurred reassigning the request', 4, 'report_problem')
                }, () => {

                  console.log('RIASSIGN REQUEST - LEAVE THE GROUP * COMPLETE');

                });
            }
          });
        });
    });
  }
  // end new

  /// new
  joinAnotherAgent(userid_selected) {
    console.log('ASSIGN REQUEST - USER ID SELECTED ', userid_selected);
    this.getFirebaseToken(() => {

      // this.requestsService.joinToGroup(this.currentUserFireBaseUID, this.requestRecipient)
      this.requestsService.joinToGroup(this.id_request, this.firebase_token, userid_selected)
        .subscribe((joinToGroupRes: any) => {

          console.log('ASSIGN REQUEST - JOIN ANOTHER USER TO CHAT GROUP ', joinToGroupRes);

        }, (err) => {
          console.log('ASSIGN REQUEST - JOIN ANOTHER USER TO CHAT GROUP - ERROR ', err);

          // =========== NOTIFY ERROR ===========
          this.notify.showNotification('An error has occurred assigning the request', 4, 'report_problem')
        }, () => {
          console.log('ASSIGN REQUEST - JOIN ANOTHER USER TO CHAT GROUP - COMPLETE');

          // =========== NOTIFY SUCCESS===========
          this.notify.showNotification(`request assigned to ${this.userfirstname_selected}  ${this.userlastname_selected}`, 2, 'done');

        });
    });
  }


  // ARCHIVE REQUEST - OPEN THE POPUP
  openArchiveRequestModal(request_recipient: string) {
    console.log('»»» »»» ID OF REQUEST TO ARCHIVE ', request_recipient)
    this.id_request_to_archive = request_recipient;

    this.displayArchiveRequestModal = 'block'
  }

  onCloseArchiveRequestModal() {
    this.displayArchiveRequestModal = 'none'
  }

  onCloseArchivingInfoModal() {
    this.displayArchivingInfoModal = 'none'
  }

  archiveTheRequestHandler() {
    console.log('HAS CLICKED ARCHIVE REQUEST ');

    this.displayArchiveRequestModal = 'none';

    this.SHOW_CIRCULAR_SPINNER = true;

    this.displayArchivingInfoModal = 'block'

    this.getFirebaseToken(() => {

      this.requestsService.closeSupportGroup(this.id_request_to_archive, this.firebase_token)
        .subscribe((data: any) => {

          console.log('CLOSE SUPPORT GROUP - DATA ', data);
        },
          (err) => {
            console.log('CLOSE SUPPORT GROUP - ERROR ', err);
            this.SHOW_CIRCULAR_SPINNER = false;
            this.ARCHIVE_REQUEST_ERROR = true;
            // =========== NOTIFY ERROR ===========
            // tslint:disable-next-line:quotemark
            this.notify.showNotification("An error has occurred archiving the request", 4, 'report_problem')
          },
          () => {
            // this.ngOnInit();
            console.log('CLOSE SUPPORT GROUP - COMPLETE');
            this.SHOW_CIRCULAR_SPINNER = false;
            this.ARCHIVE_REQUEST_ERROR = false;

            // =========== NOTIFY SUCCESS===========
            // with id: ${this.id_request_to_archive}
            this.notify.showNotification(`the request has been moved to History`, 2, 'done');
          });
    });
  }


  // USED TO JOIN TO CHAT GROUP (SEE onJoinHandled())
  getFirebaseToken(callback) {
    const that = this;
    // console.log('Notification permission granted.');
    const firebase_currentUser = firebase.auth().currentUser;
    console.log(' // firebase current user ', firebase_currentUser);
    if (firebase_currentUser) {
      firebase_currentUser.getIdToken(/* forceRefresh */ true)
        .then(function (idToken) {
          that.firebase_token = idToken;

          // qui richiama la callback
          callback();
          console.log('!! »»» Firebase Token (for join-to-chat and for archive request)', idToken);
        }).catch(function (error) {
          // Handle error
          console.log('!! »»» idToken.', error);
          callback();
        });
    }
  }

  // JOIN TO CHAT GROUP
  onJoinHandled() {
    this.getFirebaseToken(() => {
      console.log('JOIN PRESSED');
      this.SHOW_JOIN_TO_GROUP_SPINNER_PROCESSING = true;
      // this.requestsService.joinToGroup(this.currentUserFireBaseUID, this.requestRecipient)
      this.requestsService.joinToGroup(this.id_request, this.firebase_token, this.currentUserID)
        .subscribe((data: any) => {

          console.log('JOIN TO CHAT GROUP ', data);
        }, (err) => {
          console.log('JOIN TO CHAT GROUP ERROR ', err);
          this.SHOW_JOIN_TO_GROUP_SPINNER_PROCESSING = false;
          this.HAS_COMPLETED_JOIN_TO_GROUP_POST_REQUEST = false;
          this.JOIN_TO_GROUP_HAS_ERROR = true;
        }, () => {
          console.log('JOIN TO CHAT GROUP COMPLETE');

          this.notify.showNotification(`You are successfully added to the chat`, 2, 'done');
          this.SHOW_JOIN_TO_GROUP_SPINNER_PROCESSING = false;
          this.HAS_COMPLETED_JOIN_TO_GROUP_POST_REQUEST = true;
        });
    });
  }

  openleaveChatModal() {
    this.displayLeaveChatModal = 'block'
  }

  leaveChat() {
    this.displayLeaveChatModal = 'none'

    this.displayLeavingChatInfoModal = 'block';
    this.SHOW_CIRCULAR_SPINNER = true;


    this.getFirebaseToken(() => {
      this.requestsService.leaveTheGroup(this.id_request, this.firebase_token, this.currentUserID)
        .subscribe((data: any) => {

          console.log('LEAVE THE GROUP - RESPONSE ', data);
        }, (err) => {
          console.log('LEAVE THE GROUP - ERROR ', err);
          this.SHOW_CIRCULAR_SPINNER = false;
          this.LEAVE_CHAT_ERROR = true;

        }, () => {
          this.notify.showNotification(`You have successfully left the chat`, 2, 'done');
          console.log('LEAVE THE GROUP * COMPLETE');
          this.SHOW_CIRCULAR_SPINNER = false;
          this.LEAVE_CHAT_ERROR = false;

        });
    });
  }

  closeLeaveChatModal() {
    this.displayLeaveChatModal = 'none'
  }

  closeLeavingChatInfoModal() {
    this.displayLeavingChatInfoModal = 'none';
  }

  openTranscript() {

    // const url = 'https://api.tiledesk.com/v1/public/requests/' + this.id_request + '/messages.html';
    const url = this.BASE_URL + 'public/requests/' + this.id_request + '/messages.html';

    console.log('openTranscript url ', url);
    window.open(url, '_blank');
  }

  // <!--target="_blank" href="{{ CHAT_BASE_URL }}?recipient={{id_request}}"   -->
  openChatInNewWindow() {
    // RESOLVE THE BUG: THE BUTTON 'OPEN THE CHAT' REMAIN FOCUSED AFTER PRESSED
    // const openChatBtn = <HTMLElement>document.querySelector('.open_the_chat_btn');
    // console.log('!!! REQUESTS-MSGS - OPEN THE CHAT BTN ', openChatBtn)
    // openChatBtn.blur();
    this.openChatBtn.nativeElement.blur();

    const url = this.CHAT_BASE_URL + '?recipient=' + this.id_request
    window.open(url, '_blank');
  }



  scrollCardContetToBottom() {
    setTimeout(() => {
      const initialScrollPosition = this.myScrollContainer.nativeElement;
      console.log('SCROLL CONTAINER ', initialScrollPosition)
      //  objDiv.scrollTop = objDiv.scrollHeight;
      initialScrollPosition.scrollTop = initialScrollPosition.scrollHeight;
      console.log('SCROLL HEIGHT ', initialScrollPosition.scrollHeight);
    }, 100);

  }

  // LISTEN TO SCROLL POSITION
  onScroll(event: any): void {
    console.log('RICHIAMO ON SCROLL ')
    const scrollPosition = this.myScrollContainer.nativeElement.scrollTop;

    const scrollHeight = this.myScrollContainer.nativeElement.scrollHeight;
    console.log('ON SCROLL - SCROLL POSITION ', scrollPosition);
    console.log('ON SCROLL - SCROLL HEIGHT ', scrollHeight);

    const scrollHeighLessScrollPosition = scrollHeight - scrollPosition;
    console.log('ON SCROLL - SCROLL OVERFLOW ', scrollHeighLessScrollPosition);
    if (scrollHeighLessScrollPosition > 500) {
      this.displayBtnScrollToBottom = 'block';
    } else {
      this.displayBtnScrollToBottom = 'none';
    }
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      // tslint:disable-next-line:max-line-length
      console.log('RUN SCROLL TO BOTTOM - SCROLL TOP ', this.myScrollContainer.nativeElement.scrollHeight, ' SCROLL HEIGHT ', this.myScrollContainer.nativeElement.scrollHeight);
    } catch (err) {
      console.log('ERROR ', err);
    }
  }

  cut_support_group_from_request_id(request_id: string) {
    if (request_id) {
      return request_id.replace('support-group-', '');
    }
  }

  // !!! NO MORE USED SUBSTITUTED BY goBack()
  // SINCE THE COMPONENTS THAT CALL 'requests-msgs' CAN BE 'requests-list.comp' OR 'requests-list-history.comp'
  // -  GO BACK REQUESTS LIST
  goBackToRequestsList() {
    this.router.navigate(['project/' + this.id_project + '/requests']);
  }

  goBack() {
    this._location.back();

    // this._location.replaceState('/')
    // this.router.navigate(['project/' + this.id_project + '/home'], { replaceUrl: true });
    // window.history.replaceState('HOME', 'http://localhost:4200/#/projects')
    // console.log('WINDOWS HISTORY ', window.history.replaceState);
  }

  /**
   * 
   * @param image_url
   * @param callBack
   * *** METHOD REPLACED BY agents_array IN getRequestByRecipient ***
   */
  // members_replace(member_id) {
  //   // console.log('Members replace ', m)
  //   // const user = JSON.parse((localStorage.getItem(member_id)));
  //   const memberIsBot = member_id.includes('bot_');
  //   if (memberIsBot === true) {
  //     const bot_id = member_id.slice(4);
  //     // console.log('!!! NEW REQUESTS HISTORY - THE PARTICIP', member_id, 'IS A BOT ', memberIsBot, ' - ID ', bot_id);
  //     const bot = this.botLocalDbService.getBotFromStorage(bot_id);
  //     if (bot) {
  //       return member_id = bot['name'] + ' <em>(bot)</em>';
  //     } else {
  //       return member_id
  //     }

  //   } else {
  //     const user = this.usersLocalDbService.getMemberFromStorage(member_id);
  //     if (user) {
  //       // console.log('user ', user)
  // tslint:disable-next-line:max-line-length
  //       const user_img = `<img class=\"rightsidebar-user-img\" src=\"https://firebasestorage.googleapis.com/v0/b/{{storageBucket}}/o/profiles%2F${user['_id']}%2Fphoto.jpg?alt=media\" onerror=\"this.src='assets/img/no_image_user.png'\"/>`

  //       return member_id = user_img + user['firstname'] + ' ' + user['lastname']
  //     } else {
  //       return member_id
  //     }
  //   }
  // }

  verifyImageURL(image_url, callBack) {
    const img = new Image();
    img.src = image_url;
    img.onload = function () {
      callBack(true);
    };
    img.onerror = function () {
      callBack(false);
    };
  }

  goToMemberProfile(member_id: any) {
    console.log('has clicked GO To MEMBER ', member_id);
    if (member_id.indexOf('bot_') !== -1) {
      console.log('IS A BOT !');

      this.router.navigate(['project/' + this.id_project + '/botprofile/' + member_id]);
    } else {
      this.router.navigate(['project/' + this.id_project + '/member/' + member_id]);
    }
  }

  openUserList() {
    this.router.navigate(['project/' + this.id_project + '/userslist']);
  }

  ngOnDestroy() {
    console.log('»»» REQUEST MSG COMP >>>>> ON DESTROY <<<<< ');
    this.locationSubscription.unsubscribe();
    // this.subscription.unsubscribe();
  }
}
