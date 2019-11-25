import { Component, OnInit, ElementRef, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { WsRequestsService } from '../services/websocket/ws-requests.service';
import { WsMsgsService } from '../services/websocket/ws-msgs.service';
import { Location } from '@angular/common';
import { UsersLocalDbService } from '../services/users-local-db.service';
import { BotLocalDbService } from '../services/bot-local-db.service';
import { UsersService } from '../services/users.service';
import { WsSharedComponent } from '../ws-shared/ws-shared.component';
import { RequestsService } from '../services/requests.service';
import { NotifyService } from '../core/notify.service';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/auth.service';
import { WsMessage } from '../models/ws-message-model';
import * as firebase from 'firebase';
import 'firebase/database';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
  selector: 'appdashboard-ws-requests-msgs',
  templateUrl: './ws-requests-msgs.component.html',
  styleUrls: ['./ws-requests-msgs.component.scss']
})
export class WsRequestsMsgsComponent extends WsSharedComponent implements OnInit, OnDestroy {

  @ViewChild('scrollMe')
  private myScrollContainer: ElementRef;

  @ViewChild('openChatBtn')
  private openChatBtn: ElementRef;


  CHAT_BASE_URL = environment.chat.CHAT_BASE_URL;
  BASE_URL = environment.mongoDbConfig.BASE_URL;

  // messagesList: WsMessage[] = [];
  messagesList: any;

  showSpinner = true;
  showSpinner_inModalUserList = true;
  id_project: string;

  IS_CURRENT_USER_JOINED: boolean;
  HAS_COMPLETED_JOIN_TO_GROUP_POST_REQUEST = false;
  SHOW_JOIN_TO_GROUP_SPINNER_PROCESSING = false;
  JOIN_TO_GROUP_HAS_ERROR = false;

  IS_CURRENT_USER_AGENT: boolean; // Not yet used

  firebase_token: any;
  currentUserID: string;
  request: any;
  requester_fullname: string;
  requester_id: string;
  user_name: string;
  user_email: string;
  department_name: string;
  department_id: string;

  rating: string; // Not yet used
  rating_message: string; // Not yet used

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

  REQUESTER_IS_VERIFIED = false;

  isMobile: boolean;
  actionInModal: string;
  REQUESTER_IS_ONLINE = false;

  contact_id: string; // Not yet used
  NODEJS_REQUEST_CNTCT_FOUND: boolean;
  OPEN_RIGHT_SIDEBAR = false;
  selectedQuestion: string;

  id_request: string;

  train_bot_sidebar_height: any;


  /**
   * Constructor
   * 
   * @param {Router} router 
   * @param {ActivatedRoute} route 
   * @param {WsRequestsService} wsRequestsService 
   * @param {WsMsgsService} wsMsgsService 
   * @param {Location} _location 
   * @param {BotLocalDbService} botLocalDbService 
   * @param {UsersLocalDbService} usersLocalDbService
   * @param {UsersService} usersService 
   * @param {RequestsService} requestsService 
   * @param {NotifyService} requestsService  
   * @param {AuthService} auth  
   */
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private wsRequestsService: WsRequestsService,
    private wsMsgsService: WsMsgsService,
    private _location: Location,
    public botLocalDbService: BotLocalDbService,
    public usersLocalDbService: UsersLocalDbService,
    private usersService: UsersService,
    private requestsService: RequestsService,
    private notify: NotifyService,
    private auth: AuthService
  ) {
    super(botLocalDbService, usersLocalDbService)
  }

  // -----------------------------------------------------------------------------------------------------
  // @ HostListener window:resize
  // -----------------------------------------------------------------------------------------------------

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {

    this.newInnerWidth = event.target.innerWidth;
    console.log('REQUEST-MSGS - ON RESIZE -> WINDOW WITH ', this.newInnerWidth);


    this.newInnerHeight = event.target.innerHeight;
    // console.log('%%% Ws-REQUESTS-Msgs - ON RESIZE -> WINDOW HEIGHT ', this.newInnerHeight);

    const elemMainContent = <HTMLElement>document.querySelector('.main-content');
    this.main_content_height = elemMainContent.clientHeight
    // console.log('%%% Ws-REQUESTS-Msgs - ON RESIZE -> MAIN CONTENT HEIGHT', this.main_content_height);

    // determine the height of the modal when the width of the window is <= of 991px when the window is resized
    // RESOLVE THE BUG: @media screen and (max-width: 992px) THE HEIGHT OF THE  MODAL 'USERS LIST' IS NOT 100%
    if (this.newInnerWidth <= 991) {
      this.users_list_modal_height = elemMainContent.clientHeight + 70 + 'px'

      this.train_bot_sidebar_height = elemMainContent.clientHeight + 'px'
      // console.log('%%% Ws-REQUESTS-Msgs - *** MODAL HEIGHT ***', this.users_list_modal_height);
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit() {

    if (this.id_request) {
      this.unsuscribeRequestById(this.id_request);
      this.unsuscribeMessages(this.id_request);
    }

    this.getParamRequestId();
    this.getCurrentProject();
    this.getLoggedUser();
    this.detectMobile();

  }

  /**
   * On destroy
   */
  ngOnDestroy() {

    // this.wsRequestsService.unsubscribeTo_wsRequestById(this.id_request)
    // this.wsMsgsService.unsubsToWS_MsgsByRequestId(this.id_request)
    if (this.id_request) {
      this.unsuscribeRequestById(this.id_request);
      this.unsuscribeMessages(this.id_request);
    }

  }


  // -----------------------------------------------------------------------------------------------------
  // @ Common methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get the request id from url params and then with this
   * start the subscription to websocket messages and to websocket request by id
   */
  getParamRequestId() {
    this.id_request = this.route.snapshot.params['requestid'];
    console.log('%%% Ws-REQUESTS-Msgs - FROM URL PARAMS GET REQUEST-ID  ', this.id_request);

    if (this.id_request) {

      this.subscribeToWs_MsgsByRequestId(this.id_request);

      this.subscribeToWs_RequestById(this.id_request);
    }
  }




  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.id_project = project._id
        // console.log('00 -> BOT EDIT/ADD COMP project ID from AUTH service subscription  ', this.project._id)
      }
    });
  }

  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      // console.log('%%% Ws-REQUESTS-Msgs - USER ', user)

      // this.user = user;
      if (user) {
        this.currentUserID = user._id
        console.log('%%% Ws-REQUESTS-Msgs - USER ID ', this.currentUserID);

      }
    });
  }




  // -----------------------------------------------------------------------------------------------------
  // @ Unsuscribe Request-by-id and Messages (are called On init & On destroy)
  // -----------------------------------------------------------------------------------------------------

  /**
   * Unsuscribe Request-by-id
   * @param idrequest 
   */
  unsuscribeRequestById(idrequest) {
    this.wsRequestsService.unsubscribeTo_wsRequestById(idrequest);
  }

  /**
   * Unsuscribe Messages
   * @param idrequest 
   */
  unsuscribeMessages(idrequest) {
    this.wsMsgsService.unsubsToWS_MsgsByRequestId(idrequest);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Request-by-id ws-subscription (called On init > getParamRequestId) and get 
  // -----------------------------------------------------------------------------------------------------

  /**
   * Start the websocket subscription to request-by-id and get the request published by behaviourSubject
   * @param id_request 
   */
  subscribeToWs_RequestById(id_request) {

    // Start websocket subscription
    this.wsRequestsService.subscribeTo_wsRequestById(id_request);

    // Get request
    this.getWsRequestById$();

  }


  /**
   * Get the request published
   */
  getWsRequestById$() {
    this.wsRequestsService.wsRequest$
      .subscribe((wsrequest) => {

        this.request = wsrequest;
        console.log('%%% Ws-REQUESTS-Msgs - getWsRequestById$ *** request *** ', this.request)
        // this.showSpinner = false;

        if (this.request) {
          this.members_array = this.request.participants;
          console.log('%%% Ws-REQUESTS-Msgs - getWsRequestById PARTICIPANTS ARRAY ', this.members_array)

          /**
           * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
           *  requester_id NON VA OTTENUTO DALL'OGGETTO ATTRIBUTES DELLA RICHIESTA 
           *  DA MODIFICARE  QUANDO ANDREA LO RITORNA  NELLA RICHIESTA   
           * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
           */
          // this.requester_id = this.request.requester ??? 
          this.requester_id = this.request.attributes.requester_id;
          console.log('%%% Ws-REQUESTS-Msgs - getWsRequestById REQUESTER ID (DA ATTRIBUTES)', this.requester_id);
          console.log('%%% Ws-REQUESTS-Msgs - getWsRequestById REQUESTER EMAIL (DA ATTRIBUTES)', this.request.attributes.userEmail);
          console.log('%%% Ws-REQUESTS-Msgs - getWsRequestById REQUESTER FULLNAME (DA ATTRIBUTES)', this.request.attributes.userFullname);
          // ********

          /**
           * DISPLAY / HIDE THE VIEW 'CONTACT' DETAIL BUTTON 
           */
          if (this.requester_id) {
            // this.contact_id = nodejsRequest['requests'][0]['requester_id']
            this.contact_id = this.requester_id
            console.log('%%% Ws-REQUESTS-Msgs: NODEJS REQUEST > CONTACT ID ', this.contact_id);
            this.NODEJS_REQUEST_CNTCT_FOUND = true;
            console.log('%%% Ws-REQUESTS-Msgs: NODEJS REQUEST FOUND ? ', this.NODEJS_REQUEST_CNTCT_FOUND);

          } else {

            this.NODEJS_REQUEST_CNTCT_FOUND = false;
            console.log('%%% Ws-REQUESTS-Msgs: NODEJS REQUEST >  FOUND ? ', this.NODEJS_REQUEST_CNTCT_FOUND);
          }



          this.getRequesterAvailabilityStatus(this.requester_id);

          this.createAgentsArrayFromParticipantsId(this.members_array, this.requester_id)

          this.createRequesterAvatar(this.request.lead);

          /**
           * Extracts the values from the "attributes" object of the request and assign them to local variables
           */
          this.destructureAttributes(this.request.attributes)


          this.IS_CURRENT_USER_JOINED = this.currentUserIdIsInParticipants(this.request.participants, this.currentUserID, this.request.request_id);
          console.log('%%% Ws-REQUESTS-Msgs »»»»»»» IS_CURRENT_USER_JOINED? ', this.IS_CURRENT_USER_JOINED)
          console.log('%%% Ws-REQUESTS-Msgs »»»»»»» IS_CURRENT_USER_JOINED - PARTICIPANTS ', this.request.participants)
          console.log('%%% Ws-REQUESTS-Msgs »»»»»»» IS_CURRENT_USER_JOINED - CURRENT USER ID ', this.currentUserID)
        }


      }, error => {
        console.log('%%% Ws-REQUESTS-Msgs - getWsRequestById$ * error * ', error)
      });


  }

  // -----------------------------------------------------------------------------------------------------
  // @ Messages ws-subscription (called On init > getParamRequestId) and get
  // -----------------------------------------------------------------------------------------------------

  subscribeToWs_MsgsByRequestId(id_request: string) {
    this.wsMsgsService.subsToWS_MsgsByRequestId(id_request);
    this.getWsMsgs$();
  }

  getWsMsgs$() {
    this.wsMsgsService.wsMsgsList$.subscribe((wsmsgs) => {
      // this.wsMsgsService._wsMsgsList.subscribe((wsmsgs) => {
      console.log('%%% Ws-REQUESTS-Msgs Msgs getWsMsgs$ *** wsmsgs *** ', wsmsgs)


      this.messagesList = wsmsgs;
      // console.log('%%% WsRequestsMsgsComponent getWsRequests$ *** messagesList *** ', this.messagesList)

      this.showSpinner = false;

      //  this.wsMsgsService.wsMsgsList$.complete();
      // console.log('%%% WsRequestsMsgsComponent getWsRequests$ * complete * ', x)

      this.scrollCardContetToBottom();

    }, error => {
      console.log('%%% Ws-REQUESTS-Msgs - getWsMsgs$ * error * ', error)
    }, () => {
      console.log('%%% Ws-REQUESTS-Msgs - getWsMsgs$ *** complete *** ')
    });

  }


  getRequesterAvailabilityStatus(requester_id: string) {
    // const firebaseRealtimeDbUrl = `/apps/tilechat/presence/LmBT2IKjMzeZ3wqyU8up8KIRB6J3/connections`
    const firebaseRealtimeDbUrl = `/apps/tilechat/presence/` + requester_id + `/connections`
    const connectionsRef = firebase.database().ref().child(firebaseRealtimeDbUrl);
    console.log('%%% Ws-REQUESTS-Msgs »»» REQUEST DETAILS - CALLING REQUESTER AVAILABILITY VALUE ');

    connectionsRef.on('value', (child) => {
      if (child.val()) {
        this.REQUESTER_IS_ONLINE = true;
        console.log('%%% Ws-REQUESTS-Msgs »»» REQUEST DETAILS - REQUESTER is ONLINE ', this.REQUESTER_IS_ONLINE);
      } else {
        this.REQUESTER_IS_ONLINE = false;

        console.log('%%% Ws-REQUESTS-Msgs »»» REQUEST DETAILS - REQUESTER is ONLINE ', this.REQUESTER_IS_ONLINE);
      }
    })
  }






  scrollCardContetToBottom() {
    setTimeout(() => {
      const initialScrollPosition = this.myScrollContainer.nativeElement;
      // console.log('SCROLL CONTAINER ', initialScrollPosition)

      initialScrollPosition.scrollTop = initialScrollPosition.scrollHeight;
      // console.log('SCROLL HEIGHT ', initialScrollPosition.scrollHeight);
    }, 100);

  }

  // LISTEN TO SCROLL POSITION
  onScroll(event: any): void {
    // console.log('RICHIAMO ON SCROLL ')
    const scrollPosition = this.myScrollContainer.nativeElement.scrollTop;

    const scrollHeight = this.myScrollContainer.nativeElement.scrollHeight;
    // console.log('ON SCROLL - SCROLL POSITION ', scrollPosition);
    // console.log('ON SCROLL - SCROLL HEIGHT ', scrollHeight);

    const scrollHeighLessScrollPosition = scrollHeight - scrollPosition;
    // console.log('ON SCROLL - SCROLL OVERFLOW ', scrollHeighLessScrollPosition);
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
      // console.log('RUN SCROLL TO BOTTOM - SCROLL TOP ', this.myScrollContainer.nativeElement.scrollHeight, ' SCROLL HEIGHT ', this.myScrollContainer.nativeElement.scrollHeight);
    } catch (err) {
      console.log('%%% Ws-REQUESTS-Msgs - scrollToBottom ERROR ', err);
    }
  }

  openRightSideBar(message: string) {
    this.OPEN_RIGHT_SIDEBAR = true;
    console.log('%%% Ws-REQUESTS-Msgs »»»» OPEN RIGHT SIDEBAR ', this.OPEN_RIGHT_SIDEBAR, ' MSG: ', message);
    this.selectedQuestion = message;


    // questo non funziona se è commented BUG RESOLVE
    const elemMainContent = <HTMLElement>document.querySelector('.main-content');
    this.train_bot_sidebar_height = elemMainContent.clientHeight + 10 + 'px'
    console.log('%%% Ws-REQUESTS-Msgs - REQUEST-MSGS - ON OPEN RIGHT SIDEBAR -> RIGHT SIDEBAR HEIGHT', this.train_bot_sidebar_height);


    // BUG RESOLVE inserisco questo visto che all'ampiezza in cui compare la sidebar sx non è comunque possibile scorrere
    // la pagina
    // const _elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    // _elemMainPanel.setAttribute('style', 'overflow-x: hidden !important;overflow-y: hidden !important;');

    // const mainPanelScrollPosition = _elemMainPanel.scrollTop;
    // console.log('mainPanelScrollPosition ', mainPanelScrollPosition);
    // this.train_bot_sidebar_top_pos = mainPanelScrollPosition + 'px'
  }


  handleCloseRightSidebar(event) {
    console.log('%%% Ws-REQUESTS-Msgs »»»» CLOSE RIGHT SIDEBAR ', event);
    this.OPEN_RIGHT_SIDEBAR = event;

    // const _elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    // _elemMainPanel.setAttribute('style', 'overflow-x: hidden !important;');
  }



  goBack() {
    this._location.back();

  }



  detectMobile() {
    // this.isMobile = true;
    this.isMobile = /Android|iPhone/i.test(window.navigator.userAgent);
    console.log('%%% Ws-REQUESTS-Msgs - IS MOBILE ', this.isMobile);

    // CUSTOMIZE CARDS AND NAVBAR IF TILEDESK DASHBOARD IS RUNNED ON MOBILE
    if (this.isMobile) {
      const elemMainContent = <HTMLElement>document.querySelector('.main-content');
      elemMainContent.setAttribute('style', 'padding-right: 0px; padding-left: 0px; padding-top: 0px');
      console.log('%%% Ws-REQUESTS-Msgs - MOBILE DETECTED - SET ATTIBUTE TO MAIN CONTENT ', elemMainContent);
    }

  }

  openSelectUsersModal(actionSelected) {
    this.actionInModal = actionSelected
    console.log('%%% Ws-REQUESTS-Msgs - ACTION IN MODAL ', this.actionInModal);
    this.getAllUsersOfCurrentProject();
    this.displayUsersListModal = 'block'
    console.log('%%% Ws-REQUESTS-Msgs - DISPLAY USERS LIST MODAL ', this.displayUsersListModal);
    const actualHeight = window.innerHeight;
    console.log('%%% Ws-REQUESTS-Msgs - ON OPEN USER LIST MODAL -> ACTUAL WINDOW HEIGHT  ', actualHeight);
    const actualWidth = window.innerWidth;
    console.log('%%% Ws-REQUESTS-Msgs - ON OPEN USER LIST MODAL -> ACTUAL WINDOW WIDTH  ', actualWidth);

    const elemMainContent = <HTMLElement>document.querySelector('.main-content');
    this.main_content_height = elemMainContent.clientHeight
    console.log('%%% Ws-REQUESTS-Msgs - ON OPEN USER LIST MODAL -> ACTUAL MAIN CONTENT HEIGHT', elemMainContent.clientHeight);

    // determine the height of the modal when the width of the window is <= of 991px when is opened the modal
    // RESOLVE THE BUG: @media screen and (max-width: 992px) THE THE HEIGHT OF THE  MODAL 'USERS LIST' IS NOT 100%
    if (actualWidth <= 991) {
      this.users_list_modal_height = elemMainContent.clientHeight + 70 + 'px'
      console.log('%%% Ws-REQUESTS-Msgs - *** MODAL HEIGHT ***', this.users_list_modal_height);
    }

  }

  closeSelectUsersModal() {
    this.displayUsersListModal = 'none'
    console.log('%%% Ws-REQUESTS-Msgs - ON CLOSE USERS LIST MODAL ', this.displayUsersListModal);
  }


  // ------------------------------------------------------------------------------------------------------------------------
  // @ Get all project's Agents (i.e., project-users) - called when the user open the SelectUsersModal (openSelectUsersModal)
  // ------------------------------------------------------------------------------------------------------------------------
  getAllUsersOfCurrentProject() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      console.log('%%% Ws-REQUESTS-Msgs - PROJECT USERS (FILTERED FOR PROJECT ID)', projectUsers);

      this.projectUsersList = projectUsers;

      this.projectUsersList.forEach(projectUser => {

        projectUser['is_joined_to_request'] = this.currentUserIdIsInParticipants(this.request.participants, projectUser.id_user._id, this.request.request_id);
        console.log('%%% Ws-REQUESTS-Msgs - PROJECT USERS ID', projectUser.id_user._id, ' is JOINED ', projectUser['is_joined_to_request']);
      });

    }, error => {
      this.showSpinner_inModalUserList = false;
      console.log('%%% Ws-REQUESTS-Msgs - PROJECT USERS (FILTERED FOR PROJECT ID) - ERROR', error);
    }, () => {
      this.showSpinner_inModalUserList = false;
      console.log('%%% Ws-REQUESTS-Msgs - PROJECT USERS (FILTERED FOR PROJECT ID) - COMPLETE');
    });
  }

  selectUser(user_id: string, user_firstname: string, user_lastname: string, user_email: string) {
    console.log('%%% Ws-REQUESTS-Msgs - SELECTED USER ID ', user_id);
    console.log('%%% Ws-REQUESTS-Msgs - SELECTED USER FIRSTNAME ', user_firstname);
    console.log('%%% Ws-REQUESTS-Msgs - SELECTED USER LASTNAME ', user_lastname);
    console.log('%%% Ws-REQUESTS-Msgs - SELECTED USER EMAIL ', user_email);
    this.userid_selected = user_id;
    this.userfirstname_selected = user_firstname;
    this.userlastname_selected = user_lastname;
    this.useremail_selected = user_email;

    // const testDiv = <HTMLElement>document.querySelector('.swap_btn');
    // console.log('REQUEST-MSGS - SELECTED USER ROW TOP OFFSET ', testDiv.offsetTop);
    this.displayConfirmReassignmentModal = 'block'

    // this.document.body.scrollTop = 0;
  }

  closeConfirmReassignmentModal() {
    this.displayConfirmReassignmentModal = 'none'
  }

  reassignRequest(userid_selected) {
    console.log('%%% Ws-REQUESTS-Msgs - REASSIGN REQUEST TO USER ID ', userid_selected);
    this.displayConfirmReassignmentModal = 'none';
    this.displayUsersListModal = 'none'

    this.joinAnotherAgentLeaveCurrentAgents(userid_selected);

  }

  assignRequest(userid_selected) {
    console.log('%%% Ws-REQUESTS-Msgs - ASSIGN REQUEST TO USER ID ', userid_selected);
    this.displayConfirmReassignmentModal = 'none';
    this.displayUsersListModal = 'none'
    this.joinAnotherAgent(userid_selected);
  }



  /// new RIASSIGN REQUEST
  joinAnotherAgentLeaveCurrentAgents(userid_selected) {
    this.getFirebaseToken(() => {

      // this.requestsService.joinToGroup(this.currentUserFireBaseUID, this.requestRecipient)
      this.requestsService.joinToGroup(this.id_request, this.firebase_token, userid_selected)
        .subscribe((joinToGroupRes: any) => {

          console.log('%%% Ws-REQUESTS-Msgs - RIASSIGN REQUEST - JOIN ANOTHER USER TO CHAT GROUP ', joinToGroupRes);

        }, (err) => {
          console.log('%%% Ws-REQUESTS-Msgs - RIASSIGN REQUEST - JOIN ANOTHER USER TO CHAT GROUP - ERROR ', err);

          // =========== NOTIFY ERROR ===========
          this.notify.showNotification('An error has occurred assigning the request', 4, 'report_problem')
        }, () => {
          console.log('%%% Ws-REQUESTS-Msgs- RIASSIGN REQUEST - JOIN ANOTHER USER TO CHAT GROUP - COMPLETE');

          // =========== NOTIFY SUCCESS===========
          this.notify.showNotification(`request reassigned to ${this.userfirstname_selected}  ${this.userlastname_selected}`, 2, 'done');

          this.cleaned_members_array.forEach(memberId => {
            // const memberId =  this.cleaned_members_array[0]['_id']

            // this.requestsService.leaveTheGroup(this.id_request, this.firebase_token, this.currentUserID)

            if (memberId !== userid_selected) {
              console.log('%%% Ws-REQUESTS-Msgs - RIASSIGN REQUEST - USER ID OF THE USER THAT LEAVE THE GROUP ', memberId)
              this.requestsService.leaveTheGroup(this.id_request, this.firebase_token, memberId)
                .subscribe((leaveTheGroupRes: any) => {

                  console.log('%%% Ws-REQUESTS-Msgs - RIASSIGN REQUEST - LEAVE THE GROUP - RESPONSE ', leaveTheGroupRes);
                }, (err) => {
                  console.log('%%% Ws-REQUESTS-Msgs - RIASSIGN REQUEST - LEAVE THE GROUP - ERROR ', err);

                  // =========== NOTIFY ERROR ===========
                  this.notify.showNotification('An error has occurred reassigning the request', 4, 'report_problem')
                }, () => {

                  console.log('%%% Ws-REQUESTS-Msgs -RIASSIGN REQUEST - LEAVE THE GROUP * COMPLETE');

                });
            }
          });
        });
    });
  }
  // end new

  /// new
  joinAnotherAgent(userid_selected) {
    console.log('%%% Ws-REQUESTS-Msgs - ASSIGN REQUEST - USER ID SELECTED ', userid_selected);
    this.getFirebaseToken(() => {

      // this.requestsService.joinToGroup(this.currentUserFireBaseUID, this.requestRecipient)
      this.requestsService.joinToGroup(this.id_request, this.firebase_token, userid_selected)
        .subscribe((joinToGroupRes: any) => {

          console.log('%%% Ws-REQUESTS-Msgs - ASSIGN REQUEST - JOIN ANOTHER USER TO CHAT GROUP ', joinToGroupRes);

        }, (err) => {
          console.log('%%% Ws-REQUESTS-Msgs - ASSIGN REQUEST - JOIN ANOTHER USER TO CHAT GROUP - ERROR ', err);

          // =========== NOTIFY ERROR ===========
          this.notify.showNotification('An error has occurred assigning the request', 4, 'report_problem')
        }, () => {
          console.log('%%% Ws-REQUESTS-Msgs - ASSIGN REQUEST - JOIN ANOTHER USER TO CHAT GROUP - COMPLETE');

          // =========== NOTIFY SUCCESS===========
          this.notify.showNotification(`request assigned to ${this.userfirstname_selected}  ${this.userlastname_selected}`, 2, 'done');

        });
    });
  }

  // ARCHIVE REQUEST - OPEN THE POPUP
  openArchiveRequestModal(request_recipient: string) {
    console.log('%%% Ws-REQUESTS-Msgs - ID OF REQUEST TO ARCHIVE ', request_recipient)
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
    console.log('%%% Ws-REQUESTS-Msgs - HAS CLICKED ARCHIVE REQUEST archiveTheRequestHandler');

    this.displayArchiveRequestModal = 'none';

    this.SHOW_CIRCULAR_SPINNER = true;

    this.displayArchivingInfoModal = 'block'

    this.getFirebaseToken(() => {

      this.requestsService.closeSupportGroup(this.id_request_to_archive, this.firebase_token)
        .subscribe((data: any) => {

          console.log('%%% Ws-REQUESTS-Msgs - CLOSE SUPPORT GROUP - DATA ', data);
        },
          (err) => {
            console.log('%%% Ws-REQUESTS-Msgs - CLOSE SUPPORT GROUP - ERROR ', err);
            this.SHOW_CIRCULAR_SPINNER = false;
            this.ARCHIVE_REQUEST_ERROR = true;
            // =========== NOTIFY ERROR ===========
            // tslint:disable-next-line:quotemark
            this.notify.showNotification("An error has occurred archiving the request", 4, 'report_problem')
          },
          () => {
            // this.ngOnInit();
            console.log('%%% Ws-REQUESTS-Msgs - CLOSE SUPPORT GROUP - COMPLETE');
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
      console.log('%%% Ws-REQUESTS-Msgs - JOIN PRESSED');
      this.SHOW_JOIN_TO_GROUP_SPINNER_PROCESSING = true;
      // this.requestsService.joinToGroup(this.currentUserFireBaseUID, this.requestRecipient)
      this.requestsService.joinToGroup(this.id_request, this.firebase_token, this.currentUserID)
        .subscribe((data: any) => {

          console.log('%%% Ws-REQUESTS-Msgs - JOIN TO CHAT GROUP ', data);
        }, (err) => {
          console.log('%%% Ws-REQUESTS-Msgs - JOIN TO CHAT GROUP ERROR ', err);
          this.SHOW_JOIN_TO_GROUP_SPINNER_PROCESSING = false;
          this.HAS_COMPLETED_JOIN_TO_GROUP_POST_REQUEST = false;
          this.JOIN_TO_GROUP_HAS_ERROR = true;
        }, () => {
          console.log('%%% Ws-REQUESTS-Msgs - JOIN TO CHAT GROUP COMPLETE');

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

          console.log('%%% Ws-REQUESTS-Msgs - LEAVE THE GROUP - RESPONSE ', data);
        }, (err) => {
          console.log('%%% Ws-REQUESTS-Msgs - LEAVE THE GROUP - ERROR ', err);
          this.SHOW_CIRCULAR_SPINNER = false;
          this.LEAVE_CHAT_ERROR = true;

        }, () => {
          this.notify.showNotification(`You have successfully left the chat`, 2, 'done');
          console.log('%%% Ws-REQUESTS-Msgs - LEAVE THE GROUP * COMPLETE');
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

  // -----------------------------------------------------------------------------------------------------
  // @ goTo & Navigate
  // -----------------------------------------------------------------------------------------------------

  goToContactDetails() {
    this.router.navigate(['project/' + this.id_project + '/contact', this.contact_id]);
  }

  goToMemberProfile(member_id: any) {
    console.log('%%% Ws-REQUESTS-Msgs - has clicked GO To MEMBER ', member_id);
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





}
