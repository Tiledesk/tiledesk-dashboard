import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, HostListener, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { WsRequestsService } from '../../services/websocket/ws-requests.service';
import { WsMsgsService } from '../../services/websocket/ws-msgs.service';
import { Location } from '@angular/common';
import { LocalDbService } from '../../services/users-local-db.service';
import { BotLocalDbService } from '../../services/bot-local-db.service';
import { WsSharedComponent } from '../ws-shared/ws-shared.component';
import { NotifyService } from '../../core/notify.service';
import { AuthService } from '../../core/auth.service';
import { WsMessage } from '../../models/ws-message-model';
import { AppConfigService } from '../../services/app-config.service';
import { Subscription } from 'rxjs';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DepartmentService } from '../../services/department.service';
import { GroupService } from '../../services/group.service';
import { Observable } from 'rxjs';
import { UsersService } from '../../services/users.service';
import { FaqKbService } from '../../services/faq-kb.service';
import { TranslateService } from '@ngx-translate/core';
import { TagsService } from '../../services/tags.service';
import PerfectScrollbar from 'perfect-scrollbar';
import { UAParser } from 'ua-parser-js';
import { ContactsService } from '../../services/contacts.service';
import { avatarPlaceholder, getColorBck } from '../../utils/util';
import { LoggerService } from '../../services/logger/logger.service';

import 'firebase/database';
const swal = require('sweetalert');

@Component({
  selector: 'appdashboard-ws-requests-msgs',
  templateUrl: './ws-requests-msgs.component.html',
  styleUrls: ['./ws-requests-msgs.component.scss']
  // ,
  // encapsulation: ViewEncapsulation.None
})
export class WsRequestsMsgsComponent extends WsSharedComponent implements OnInit, OnDestroy, AfterViewInit {
  objectKeys = Object.keys;
  @ViewChild('scrollMe')
  private myScrollContainer: ElementRef;

  @ViewChild('openChatBtn')
  private openChatBtn: ElementRef;

  SERVER_BASE_PATH: string;
  CHAT_BASE_URL: string;

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
  displayDeptConfirmReassignmentModal = 'none';
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
  deptid_selected: string;
  deptname_selected: string;
  userlastname_selected: string;
  useremail_selected: string;
  REQUESTER_IS_VERIFIED = false;
  isMobile: boolean;
  action: any // used in template
  actionInModal: string;
  REQUESTER_IS_ONLINE = false;

  contact_id: string; // Not yet used
  NODEJS_REQUEST_CNTCT_FOUND: boolean;
  OPEN_RIGHT_SIDEBAR = false;
  selectedQuestion: string;

  id_request: string;

  train_bot_sidebar_height: any;
  storageBucket: string;
  baseUrl: string;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;

  // isSubscribedToMsgs = false;
  clientStringCutted: string;
  showAllClientString = false;

  senderAuthInfoString: string;
  senderAuthInfoStringCutted: string;
  showAllsenderAuthInfoString = false;

  showAllSourcePageString = false;
  showAllIdRequest = false;
  sourcePage: string;
  sourcePageCutted: string;
  requestidCutted: string;
  departments: any;
  bots: any;
  subscribe: Subscription;
  bot_participant_id: string;
  selected_bot_id: string;
  private unsubscribe$: Subject<any> = new Subject<any>();

  timeout: any;

  attributesArray: Array<any>;
  attributesDecodedJWTArray: Array<any>
  attributesDecodedJWTAttributesArray: Array<any>
  attributesDecodedJWTArrayMerged: Array<any>
  preChatFormArray: Array<any>;
  rightSidebarWidth: number;
  tag: any;
  tagcolor: any;
  tagsArray: Array<any>
  diplayAddTagInput = false;

  create_label_success: string;
  create_label_error: string;
  delete_label_success: string;
  delete_label_error: string;

  create_note_success: string;
  create_note_error: string;
  delete_note_success: string;
  delete_note_error: string;
  notifyProcessingMsg: string

  tagsList: Array<any>;
  typeALabelAndPressEnter: string;
  loadingTags: boolean;

  new_note: string;
  notesArray: Array<any>;
  displayModalDeleteNote = 'none';
  id_note_to_delete: string;
  main_panel_scrolltop: any;
  topPos: any;

  showSpinnerInAddNoteBtn: boolean = false;
  subscription: Subscription;
  CURRENT_USER_ROLE: string;

  CHAT_PANEL_MODE: boolean;
  dshbrdBaseUrl: string;
  project_name: string;

  DISABLE_ADD_NOTE_AND_TAGS = false;
  DISABLE_BTN_AGENT_NO_IN_PARTICIPANTS = false;

  request_archived_msg: string;
  request_archived_err_msg: string;
  archivingRequestNoticationMsg: string;
  requestHasBeenArchivedNoticationMsg_part1: string;

  isVisibleLBS: boolean;
  public_Key: string;

  DISPLAY_BTN_CREATE_JIRA_ISSUE: boolean
  jira_issue_types: any
  selectedJiraType: number;

  reassignRequestMsg: string;
  requestWillBeReassignedToMsg: string;
  addAgentMsg: string;
  requestWillBeAssignedToMsg: string;
  anErrorHasOccurredMsg: string;
  done_msg: string;
  COUNT_OF_VISIBLE_DEPT: number;

  ALL_MSG_LENGTH: number;

  urls: any = /(\b(https?|http|ftp|ftps|Https|rtsp|Rtsp):\/\/[A-Z0-9+&@#\/%?=~_|!:,.;-]*[-A-Z0-9+&@#\/%=~_|])/gim; // Find/Replace URL's in text  
  emails: any = /(\S+@\S+\.\S+)/gim; // Find/Replace email addresses in text
  FIREBASE_AUTH: boolean;
  browserLang: string;
  // = this.priority[2].name;
  selectedPriority: any;
  priority_updated_successfully_msg: string;
  priority_update_failed: string;

  /**
   * Constructor
   * @param router 
   * @param route 
   * @param wsRequestsService 
   * @param wsMsgsService 
   * @param _location 
   * @param botLocalDbService 
   * @param usersLocalDbService 
   * @param notify 
   * @param auth 
   * @param appConfigService 
   * @param departmentService 
   * @param groupsService 
   * @param usersService 
   * @param faqKbService 
   * @param translate 
   * @param tagsService 
   * @param contactsService 
   * @param logger 
   */
  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public wsRequestsService: WsRequestsService,
    private wsMsgsService: WsMsgsService,
    private _location: Location,
    public botLocalDbService: BotLocalDbService,
    public usersLocalDbService: LocalDbService,
    public notify: NotifyService,
    public auth: AuthService,
    public appConfigService: AppConfigService,
    private departmentService: DepartmentService,
    private groupsService: GroupService,
    public usersService: UsersService,
    public faqKbService: FaqKbService,
    public translate: TranslateService,
    private tagsService: TagsService,
    public contactsService: ContactsService,
    public logger: LoggerService

  ) {
    super(botLocalDbService, usersLocalDbService, router, wsRequestsService, faqKbService, usersService, notify, logger, translate)
    this.jira_issue_types = [
      { id: 10002, name: 'Task', avatar: 'https://tiledesk.atlassian.net/secure/viewavatar?size=medium&avatarId=10318&avatarType=issuetype' },
      { id: 10004, name: 'Bug', avatar: 'https://tiledesk.atlassian.net/secure/viewavatar?size=medium&avatarId=10303&avatarType=issuetype' },
    ];
  }

  @ViewChild('cont') contEl: any;

  // -----------------------------------------------------------------------------------------------------
  // @ HostListener window:resize
  // -----------------------------------------------------------------------------------------------------
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {

    this.newInnerWidth = event.target.innerWidth;
    this.logger.log('[WS-REQUESTS-MSGS] - ON RESIZE -> WINDOW WITH ', this.newInnerWidth);


    this.newInnerHeight = event.target.innerHeight;
    // this.logger.log('%%% Ws-REQUESTS-Msgs - ON RESIZE -> WINDOW HEIGHT ', this.newInnerHeight);

    const elemMainContent = <HTMLElement>document.querySelector('.main-content');
    this.main_content_height = elemMainContent.clientHeight
    this.logger.log('[WS-REQUESTS-MSGS] - USER LIST MODAL - ON RESIZE -> ACTUAL MAIN CONTENT HEIGHT', elemMainContent.clientHeight);

    // determine the height of the modal when the width of the window is <= of 991px when the window is resized
    // RESOLVE THE BUG: @media screen and (max-width: 992px) THE HEIGHT OF THE  MODAL 'USERS LIST' IS NOT 100%
    if (this.newInnerWidth <= 991) {
      this.users_list_modal_height = elemMainContent.clientHeight + 70 + 'px';
      this.logger.log('[WS-REQUESTS-MSGS] - USER LIST MODAL - ON RESIZE -> users_list_modal_height', this.users_list_modal_height);
      this.train_bot_sidebar_height = elemMainContent.clientHeight + 'px';
      this.logger.log('[WS-REQUESTS-MSGS] - MODAL HEIGHT ', this.users_list_modal_height);
    }

    // ------------------------------
    // Right sidebar width on resize
    // ------------------------------
    const rightSidebar = <HTMLElement>document.querySelector(`.right-card`);
    this.rightSidebarWidth = rightSidebar.offsetWidth
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  ngOnInit() {
    this.getParamRequestId();
    this.getCurrentProject();
    this.getLoggedUser();
    this.detectMobile();
    this.getProfileImageStorage();
    this.getBaseUrlsFromAppConfig()
    this.translateNotificationMsgs();
    this.getProjectUserRole();
    this.getIfRouteUrlIsRequestForPanel();
    this.getBaseUrl();
    this.getOSCODE();
    this.getFirebaseAuth();
    this.getBrowserLang();


  }
  ngAfterViewInit() {
    // -----------------------------------
    // Right sidebar width after view init
    // -----------------------------------
    const rightSidebar = <HTMLElement>document.querySelector(`.right-card`);
    this.rightSidebarWidth = rightSidebar.offsetWidth;
  }

  ngOnDestroy() {
    this.logger.log('[WS-REQUESTS-MSGS] - ngOnDestroy')
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    this.unsuscribeRequesterPresence(this.requester_id);
    if (this.id_request) {
      this.unsuscribeRequestById(this.id_request);
      this.unsuscribeMessages(this.id_request);
    }
  }

  getBrowserLang() {
    this.browserLang = this.translate.getBrowserLang();
    this.logger.log('[WS-REQUESTS-MSGS] browserLang', this.browserLang)
  }

  unsuscribeRequesterPresence(requester_id) {
    this.wsRequestsService.unsubscribeToWS_RequesterPresence(requester_id);
  }

  getFirebaseAuth() {
    this.logger.log('[WS-REQUESTS-MSGS] - this.appConfigService.getConfig().firebaseAuth  ', this.appConfigService.getConfig().firebaseAuth);
    if (this.appConfigService.getConfig().firebaseAuth === true) {
      this.FIREBASE_AUTH = true;
      this.logger.log('[WS-REQUESTS-MSGS] - FIREBASE_AUTH IS ', this.FIREBASE_AUTH);
    } else if (this.appConfigService.getConfig().firebaseAuth === false) {
      this.FIREBASE_AUTH = false;
      this.logger.log('[WS-REQUESTS-MSGS] - FIREBASE_AUTH IS ', this.FIREBASE_AUTH);
    }
  }

  getBaseUrlsFromAppConfig() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    this.CHAT_BASE_URL = this.appConfigService.getConfig().CHAT_BASE_URL;

    const appID = this.appConfigService.getConfig().firebase.appId
    this.logger.log('[WS-REQUESTS-MSGS] getAppConfig - APP ID: ', appID);

    if (appID === "1:269505353043:web:b82af070572669e3707da6") {
      this.DISPLAY_BTN_CREATE_JIRA_ISSUE = false;
    } else {
      this.DISPLAY_BTN_CREATE_JIRA_ISSUE = false;
    }


    this.logger.log('[WS-REQUESTS-MSGS] getAppConfig - SERVER_BASE_PATH: ', this.SERVER_BASE_PATH);
    this.logger.log('[WS-REQUESTS-MSGS] getAppConfig - CHAT_BASE_URL: ', this.CHAT_BASE_URL);
  }

  getBaseUrl() {
    const href = window.location.href;
    this.logger.log('[WS-REQUESTS-MSGS] - getBaseUrl - href ', href)

    const hrefArray = href.split('/#/');
    this.dshbrdBaseUrl = hrefArray[0]
    this.logger.log('[WS-REQUESTS-MSGS] - getBaseUrl - dshbrdBaseUrl ', this.dshbrdBaseUrl)
  }

  getProfileImageStorage() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[WS-REQUESTS-MSGS] IMAGE STORAGE ', this.storageBucket, 'usecase firebase')
    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;
      this.logger.log('[WS-REQUESTS-MSGS] IMAGE STORAGE ', this.baseUrl, 'usecase native')
    }
  }

  detectMobile() {
    // this.isMobile = true;
    this.isMobile = /Android|iPhone/i.test(window.navigator.userAgent);
    this.logger.log('[WS-REQUESTS-MSGS] - IS MOBILE ', this.isMobile);

    // CUSTOMIZE CARDS AND NAVBAR IF TILEDESK DASHBOARD IS RUNNED ON MOBILE
    if (this.isMobile) {
      const elemMainContent = <HTMLElement>document.querySelector('.main-content');
      elemMainContent.setAttribute('style', 'padding-right: 0px; padding-left: 0px; padding-top: 0px');
      this.logger.log('[WS-REQUESTS-MSGS] - MOBILE DETECTED - SET ATTIBUTE TO MAIN CONTENT ', elemMainContent);
    }

  }

  // --------------------------------------------------------------------------------------------------------------------------------
  // @ Get if the route url is request-for-panel (i.e. this component is displayed in the iframe of the right side panel of the chat )
  // --------------------------------------------------------------------------------------------------------------------------------
  getIfRouteUrlIsRequestForPanel() {
    this.CHAT_PANEL_MODE = false
    if (this.router.url.indexOf('/request-for-panel') !== -1) {
      this.CHAT_PANEL_MODE = true;
      this.logger.log('[WS-REQUESTS-MSGS] - CHAT_PANEL_MODE »»» ', this.CHAT_PANEL_MODE)
    } else {
      this.CHAT_PANEL_MODE = false;
      this.logger.log('[WS-REQUESTS-MSGS] - CHAT_PANEL_MODE »»» ', this.CHAT_PANEL_MODE)
    }
  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[WS-REQUESTS-MSGS]  getAppConfig public_Key', this.public_Key)

    let keys = this.public_Key.split("-");
    this.logger.log('[WS-REQUESTS-MSGS] - public_Key keys', keys)

    keys.forEach(key => {
      // this.logger.log('[WS-REQUESTS-MSGS] public_Key key', key)
      if (key.includes("LBS")) {
        // this.logger.log('[WS-REQUESTS-MSGS] - key', key);
        let lbs = key.split(":");
        // this.logger.log('[WS-REQUESTS-MSGS] - lbs key&value', lbs);

        if (lbs[1] === "F") {
          this.isVisibleLBS = false;
          // this.logger.log('[WS-REQUESTS-MSGS] - lbs is', this.isVisibleLBS);
        } else {
          this.isVisibleLBS = true;
          // this.logger.log('[WS-REQUESTS-MSGS] - lbs is', this.isVisibleLBS);
        }
      }
    });
    if (!this.public_Key.includes("LBS")) {
      // this.logger.log('PUBLIC-KEY (SIDEBAR) - key.includes("LBS")', this.public_Key.includes("LBS"));
      this.isVisibleLBS = false;
    }
  }

  // -------------------------------------------------------------
  // @ JIRA (CREATE A JIRA DISPLAYED ONLY IN PRE)
  // -------------------------------------------------------------
  selectJiraType() {
    this.logger.log('[WS-REQUESTS-MSGS] - Selected jira type ', this.selectedJiraType);
  }

  createJiraTicket() {
    const transcript_url = this.SERVER_BASE_PATH + 'public/requests/' + this.id_request + '/messages.html'
    const url = `https://tiledesk.atlassian.net/secure/CreateIssueDetails!init.jspa?summary=${this.request.first_text}&description=${this.request.first_text}` + "%0A" + `${transcript_url}&pid=10000&issuetype=${this.selectedJiraType}&reporter=5e21d01f010b260ca87b14ba`;
    window.open(url, '_blank');
  }


  // -------------------------------------------------------------
  // @ Subscribe to project user role
  // -------------------------------------------------------------
  getProjectUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((userRole) => {
        this.logger.log('[WS-REQUESTS-MSGS] - GET CURRENT PTOJECT-USER ROLE - userRole ', userRole)
        // used to display / hide 'WIDGET' and 'ANALITCS' in home.component.html
        this.CURRENT_USER_ROLE = userRole;
      })
  }

  // -------------------------------------------------------------
  // @ Subscribe to current project
  // -------------------------------------------------------------
  getCurrentProject() {
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {
        // this.logger.log('[WS-REQUESTS-MSGS GET CURRENT PROJECT - project: ', project)
        if (project) {
          this.logger.log('[WS-REQUESTS-MSGS] GET CURRENT PROJECT project._id (NEW)', project._id)
          this.logger.log('[WS-REQUESTS-MSGS] GET CURRENT PROJECT this.project_id (OLD)', this.id_project)

          this.id_project = project._id;
          this.project_name = project.name;
        }
      });
  }

  // -------------------------------------------------------------
  // @ Subscribe to current USER
  // -------------------------------------------------------------
  getLoggedUser() {
    this.auth.user_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user) => {
        if (user) {
          this.currentUserID = user._id
          // this.logger.log('%%% Ws-REQUESTS-Msgs - USER ID ', this.currentUserID);
          this.logger.log('[WS-REQUESTS-MSGS] GET CURRENT PROJECT this.project_id (OLD)', this.id_project)
        }
      });
  }

  // ----------------------------------------------------------------------------
  // Get the request id from url params and then with this
  // start the subscription to websocket request by id
  // ----------------------------------------------------------------------------
  getParamRequestId() {
    this.route.params.subscribe((params) => {
      this.logger.log('[WS-REQUESTS-MSGS] - getParamRequestId  ', params);
      if (this.id_request) {
        this.logger.log('[WS-REQUESTS-MSGS] - UNSUB-REQUEST-BY-ID - id_request ', this.id_request);
        this.logger.log('[WS-REQUESTS-MSGS] - UNSUB-MSGS - id_request ', this.id_request);

        // Unsubcribe from old request
        this.unsuscribeRequestById(this.id_request);
        // Unsubcribe from old msgs
        this.unsuscribeMessages(this.id_request);
      }

      if (this.id_request !== undefined) { // this avoid to apply 'redirectTo' when the page is refreshed (indeed in this case this.id_request is undefined)
        if (this.id_request !== params.requestid) { // this occur when the user click on the in-app notification when is in the request' details page
          this.redirectTo('project/' + params.projectid + '/wsrequest/' + params.requestid + '/messages', params.projectid);
        }
      }

      this.id_request = params.requestid;
      this.logger.log('[WS-REQUESTS-MSGS] request_id (new)', this.id_request);
    });

    if (this.id_request) {
      this.subscribeToWs_RequestById(this.id_request);
    }
  }

  // https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
  redirectTo(uri: string, projectid: string) {
    this.router.navigateByUrl('project/' + projectid + '/wsrequest/loading', { skipLocationChange: true }).then(() =>
      this.router.navigate([uri]));
  }


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
   * Start subscription to Websocket request-by-id and get the request published by behaviourSubject
   * Note: in getWsRequestById$() is runned the sunscription to WS MSGS (subscribeToWs_MsgsByRequestId())
   * @param id_request 
   */
  subscribeToWs_RequestById(id_request) {
    this.logger.log('[WS-REQUESTS-MSGS] - CALLING SUBSCRIBE to Request-By-Id: ', id_request)
    // Start websocket subscription ro ws request by id
    this.wsRequestsService.subscribeTo_wsRequestById(id_request);
    // Subscribe to ws request by id
    this.getWsRequestById$();
  }

  // -----------------------------------
  // @ Subscribe to bs request by id
  // -----------------------------------
  getWsRequestById$() {
    this.wsRequestsService.wsRequest$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((wsrequest) => {
        this.logger.log('[WS-REQUESTS-MSGS] - getWsRequestById$ *** wsrequest *** ', wsrequest)
        this.request = wsrequest;

        if (this.request) {
          this.logger.log('[WS-REQUESTS-MSGS] - this.request: ', this.request);

          // -------------------------------------------------------------------
          // User Agent
          // -------------------------------------------------------------------
          const user_agent_result = this.parseUserAgent(this.request.userAgent);

          if (user_agent_result.browser.name) {
            if (user_agent_result.browser.version) {
              const ua_browser = user_agent_result.browser.name + ' ' + user_agent_result.browser.version
              this.request['ua_browser'] = ua_browser;
            } else {
              const ua_browser = user_agent_result.browser.name;
              this.request['ua_browser'] = ua_browser;
            }
          } else {
            const ua_browser = "N/A";
            this.request['ua_browser'] = ua_browser;
          }

          if (user_agent_result.os.name) {
            if (user_agent_result.os.version) {
              const ua_os = user_agent_result.os.name + ' ' + user_agent_result.os.version;
              this.request['ua_os'] = ua_os;
            } else {
              const ua_os = user_agent_result.os.name;
              this.request['ua_os'] = ua_os;
            }
          } else {
            const ua_os = "N/A"
            this.request['ua_os'] = ua_os
          }


          // -------------------------------------------------------------------
          // Members array
          // -------------------------------------------------------------------
          this.members_array = this.request.participants;
          this.logger.log('[WS-REQUESTS-MSGS] - getWsRequestById PARTICIPANTS_ARRAY ', this.members_array)

          this.members_array.forEach(member => {

            // ----------------------------------------------------------------------------------------------
            // disable notes and tags if the current user has agent role and is not among the participants
            // ----------------------------------------------------------------------------------------------
            this.logger.log('[WS-REQUESTS-MSGS] - getWsRequestById CURRENT_USER_ROLE ', this.CURRENT_USER_ROLE);
            this.logger.log('[WS-REQUESTS-MSGS] - getWsRequestById CURRENT_USER_ID ', this.currentUserID);


            if (this.currentUserID !== member && this.CURRENT_USER_ROLE === 'agent') {
              this.logger.log('[WS-REQUESTS-MSGS] - getWsRequestById CURRENT USER NOT IN PARTICIPANT AND IS AGENT');
              this.DISABLE_ADD_NOTE_AND_TAGS = true;
              this.DISABLE_BTN_AGENT_NO_IN_PARTICIPANTS = true;
            } else if (this.currentUserID === member && this.CURRENT_USER_ROLE === 'agent') {
              this.logger.log('[WS-REQUESTS-MSGS] - getWsRequestById CURRENT USER IS IN PARTICIPANT AND IS AGENT');
              this.DISABLE_ADD_NOTE_AND_TAGS = false;
              this.DISABLE_BTN_AGENT_NO_IN_PARTICIPANTS = false;
            }

            this.logger.log('[WS-REQUESTS-MSGS] - getWsRequestById member ', member);
            this.logger.log('[WS-REQUESTS-MSGS] - getWsRequestById member is bot?', member.includes('bot_'));


            if (member.includes('bot_')) {
              this.bot_participant_id = member.substr(4);
              this.logger.log('[WS-REQUESTS-MSGS] - getWsRequestById id bot in participants (substring) ', this.bot_participant_id);

            } else {
              this.bot_participant_id = ''
            }
          });

          // ---------------------------------------------------------
          // @ Tags
          // ---------------------------------------------------------
          if (this.request.tags) {
            this.tagsArray = this.request.tags // initialize the tagsArray with the existing tags
            this.logger.log('[WS-REQUESTS-MSGS] - onInit TAGS ARRAY: ', this.tagsArray);
          }

          // ---------------------------------------------------------
          // @ Notes
          // ---------------------------------------------------------
          if (this.request.notes) {
            this.notesArray = this.request.notes.reverse()
            this.logger.log('[WS-REQUESTS-MSGS] - onInit NOTES ARRAY: ', this.notesArray)

            this.notesArray.forEach(note => {
              // -----------------------------------------------------
              // Get the user by id ('createdBy' matches the user id)
              // -----------------------------------------------------
              const user = this.usersLocalDbService.getMemberFromStorage(note.createdBy);

              if (user !== null) {
                note.createdBy_user = user;
              } else {

                // -----------------------------------------------------
                // From remote if not exist in the local storage
                // -----------------------------------------------------
                this.getMemberFromRemote(note, note.createdBy);
              }

            });
          }

          // ---------------------------------------------------------
          // @ Priority
          // ---------------------------------------------------------

          if (this.request.priority) {
            this.selectedPriority = this.request.priority
            this.logger.log('[WS-REQUESTS-MSGS] selectedPriority ', this.selectedPriority);
          } else {
            this.selectedPriority = 'medium'
          }

          // ---------------------------------------------------------
          // @ Source page stripped string -  NO MORE USED !!!
          // ---------------------------------------------------------
          let stripHere = 20;
          let sourcePageStripHere = 30;
          if (this.CHAT_PANEL_MODE) {
            stripHere = 10;
            sourcePageStripHere = 10;
          }
          if (this.request.sourcePage) {
            this.sourcePageCutted = this.request.sourcePage.substring(0, sourcePageStripHere) + '...';
          }

          // ---------------------------------------------------------
          // @ Request id stripped string -  NO MORE USED !!!
          // ---------------------------------------------------------
          if (this.CHAT_PANEL_MODE) {
            stripHere = 10;
          }
          if (this.request.request_id) {
            this.requestidCutted = this.request.request_id.substring(0, stripHere) + '...';
          }

          // ---------------------------------------------------------
          // Requester is authenticated
          // ---------------------------------------------------------
          if (this.request.requester != null && this.request.requester.isAuthenticated === true) {
            this.REQUESTER_IS_VERIFIED = true;
          } else {
            this.REQUESTER_IS_VERIFIED = false;
          }

          // ---------------------------------------------------------
          // Contact
          // ---------------------------------------------------------
          if (this.request.lead) {
            this.requester_id = this.request.lead.lead_id;
            this.logger.log('[WS-REQUESTS-MSGS] - requester_id ', this.requester_id)
            this.getRequesterAvailabilityStatus(this.requester_id);
          } else {
            this.requester_id = "n.a.";
          }

          // ---------------------------------------------------------
          // Rating
          // ---------------------------------------------------------
          if (this.request.rating) {
            this.rating = this.request.rating + '/5'
          } else {
            this.rating = 'n.a./5'
          }

          if (this.request.rating_message) {
            this.rating_message = this.request.rating_message
          } else {
            this.rating_message = 'n.a.'
          }

          // ---------------------------------------------------------
          // Attributes
          // ---------------------------------------------------------
          if (this.request.attributes) {
            // ----------------------------------------
            // new: display all attributes dinamically
            // ----------------------------------------
            this.attributesArray = []
            for (let [key, value] of Object.entries(this.request.attributes)) {

              this.logger.log(`[WS-REQUESTS-MSGS] - getWsRequestById ATTRIBUTES key : ${key} - value ${value}`);

              let _value: any;
              if (typeof value === 'object' && value !== null) {
                // this.logger.log(`:-D Ws-REQUESTS-Msgs - getWsRequestById ATTRIBUTES value is an object :`, JSON.stringify(value));
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
              //   this.logger.log(':-D Ws-REQUESTS-Msgs - getWsRequestById _value[i]', _value[i] + ": " + letterLength[_value[i]])
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
                // this.logger.log(':-D Ws-REQUESTS-Msgs - getWsRequestById ATTRIBUTES value LENGHT ', _value + " totalLength : " + totalLength)

                let entries = { 'attributeName': key, 'attributeValue': _value, 'attributeValueL': totalLength };
                // if (key !== 'decoded_jwt') {
                this.attributesArray.push(entries)
              }
            }
            this.logger.log('[WS-REQUESTS-MSGS] - getWsRequestById attributesArray: ', this.attributesArray);

          } else {
            this.logger.log('[WS-REQUESTS-MSGS] - getWsRequestById ATTRIBUTES IS UNDEFINED ', this.request.attributes);
          }

          // ---------------------------------------------------------
          // Attributes DECODED JWT
          // ---------------------------------------------------------
          if (this.request.attributes) {
            if (this.request.attributes.decoded_jwt) {
              this.logger.log('[WS-REQUESTS-MSGS] - ATTRIBUTES DECODED JWT  (getWsRequestById)', this.request.attributes.decoded_jwt);
              this.attributesDecodedJWTArray = []
              for (let [key, value] of Object.entries(this.request.attributes.decoded_jwt)) {

                // this.logger.log(`WS-REQUESTS-MSGS - ATTRIBUTES DECODED JWT -key : ${key} - value ${value}`);

                let _value: any;
                if (typeof value === 'object' && value !== null) {

                  // this.logger.log(`:-D Ws-REQUESTS-Msgs - getWsRequestById ATTRIBUTES value is an object :`, JSON.stringify(value));
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
                //   this.logger.log(':-D Ws-REQUESTS-Msgs - getWsRequestById _value[i]', _value[i] + ": " + letterLength[_value[i]])
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

                  if (key !== 'attributes') {
                    let entries = { 'attributeName': key, 'attributeValue': _value, 'attributeValueL': totalLength };
                    this.attributesDecodedJWTArray.push(entries)
                  }
                }
              }
              this.logger.log('[WS-REQUESTS-MSGS] - ATTRIBUTES DECODED JWT (getWsRequestById) - attributesDecodedJWTArray: ', this.attributesDecodedJWTArray);

            } else {

              this.logger.log('[WS-REQUESTS-MSGS] - ATTRIBUTES DECODED JWT (getWsRequestById) IS UNDEFINED ');
            }
          } else {
            this.logger.log('[WS-REQUESTS-MSGS] - ATTRIBUTES IS UNDEFINED (getWsRequestById) (in decoded_jwt)');
          }

          // ---------------------------------------------------------
          // Attributes DECODED JWT Attributes
          // ---------------------------------------------------------
          if (this.request.attributes) {
            if (this.request.attributes.decoded_jwt && this.request.attributes.decoded_jwt.attributes) {
              this.logger.log('[WS-REQUESTS-MSGS] - ATTRIBUTES DECODED JWT ATTRIBUTES  (getWsRequestById) (1))', this.request.attributes.decoded_jwt.attributes);

              this.attributesDecodedJWTAttributesArray = []
              // for (let [key, value] of Object.entries(this.request.attributes.decoded_jwt.attributes)) {
              for (const [index, [key, value]] of Object.entries(Object.entries(this.request.attributes.decoded_jwt.attributes))) {

                // this.logger.log(`WS-REQUESTS-MSGS - ATTRIBUTES DECODED JWT ATTRIBUTES index :${index}: -key  ${key} - value ${value}`);

                let _value: any;
                if (typeof value === 'object' && value !== null) {

                  // this.logger.log(`:-D Ws-REQUESTS-Msgs - getWsRequestById ATTRIBUTES value is an object :`, JSON.stringify(value));
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
                    this.logger.log('[WS-REQUESTS-MSGS] - ATTRIBUTES DECODED JWT (getWsRequestById)  _value[i] (1)', _value[i] + ": " + letterLength[_value[i]])


                    for (let i = 0; i < _value.length; i++) {
                      if (letterLength[_value[i]] !== undefined) {
                        totalLength += letterLength[_value[i]];
                      } else {
                        // if the letter not is in dictionary letters letterLength[_value[i]] is undefined so add the witdh of the 'S' letter (8px)
                        totalLength += letterLength['S'];
                      }
                    }
                  }
                  // this.logger.log(':-D Ws-REQUESTS-Msgs - getWsRequestById ATTRIBUTES value LENGHT ', _value + " totalLength : " + totalLength)

                  let entries = { 'attributeName': key, 'attributeValue': _value, 'decodedJWTType': 'Attributes', 'attributeValueL': totalLength, 'index': index };

                  this.attributesDecodedJWTAttributesArray.push(entries)
                }
              }
              this.logger.log('[WS-REQUESTS-MSGS] -  ATTRIBUTES DECODED JWT ATTRIBUTES (getWsRequestById) - attributesDecodedJWTAttributesArray (1): ', this.attributesDecodedJWTAttributesArray);

              this.attributesDecodedJWTArrayMerged = [].concat(this.attributesDecodedJWTArray, this.attributesDecodedJWTAttributesArray);

              // this.logger.log('WS-REQUESTS-MSGS - ATTRIBUTES DECODED JWT  ATTRIBUTES - attributesDecodedJWTArrayMerged: ', this.attributesDecodedJWTArrayMerged);
              // --------------------------------------------------------------------------------------------------------------
            } else {
              this.attributesDecodedJWTArrayMerged = this.attributesDecodedJWTArray
              this.logger.log('[WS-REQUESTS-MSGS] - ATTRIBUTES DECODED JWT ATTRIBUTES (getWsRequestById) IS UNDEFINED (in decoded_jwt) (1)');
              this.logger.log('[WS-REQUESTS-MSGS] - ATTRIBUTES DECODED JWT ATTRIBUTES (getWsRequestById) - attributesDecodedJWTArrayMerged (1): ', this.attributesDecodedJWTArrayMerged);
            }
          } else {
            this.logger.log('[WS-REQUESTS-MSGS] - ATTRIBUTES IS UNDEFINED (getWsRequestById) (in  decoded_jwt) (1)');
          }

          // ---------------------------------------------------------
          // Attributes PRE-CHAT FORM
          // ---------------------------------------------------------
          if (this.request.attributes && this.request.attributes.preChatForm) {
            // ----------------------------------------
            // new: display all attributes dinamically
            // ----------------------------------------
            this.preChatFormArray = []
            for (let [key, value] of Object.entries(this.request.attributes.preChatForm)) {

              this.logger.log(`[WS-REQUESTS-MSGS] - getWsRequestById ATTRIBUTES > PRE-CHAT FORM key : ${key} - value ${value}`);

              let _value: any;
              if (typeof value === 'object' && value !== null) {
                // this.logger.log(`:-D Ws-REQUESTS-Msgs - getWsRequestById ATTRIBUTES value is an object :`, JSON.stringify(value));
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
              //   this.logger.log(':-D Ws-REQUESTS-Msgs - getWsRequestById _value[i]', _value[i] + ": " + letterLength[_value[i]])
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
                // this.logger.log(':-D Ws-REQUESTS-Msgs - getWsRequestById ATTRIBUTES value LENGHT ', _value + " totalLength : " + totalLength)

                let entries = { 'attributeName': key, 'attributeValue': _value, 'attributeValueL': totalLength };
                // if (key !== 'decoded_jwt') {
                this.preChatFormArray.push(entries)
              }
            }
            this.logger.log('[WS-REQUESTS-MSGS] - getWsRequestById preChatFormArray: ', this.preChatFormArray);

          } else {
            this.logger.log('[WS-REQUESTS-MSGS] - getWsRequestById ATTRIBUTES > PRE-CHAT FORM IS UNDEFINED ');
          }



          // -----------------------------------------------------------------------------------------------------
          // @ Msgs ws-subscription
          // -----------------------------------------------------------------------------------------------------
          this.subscribeToWs_MsgsByRequestId(this.id_request);

          // -----------------------------------------------------------
          // DISPLAY / HIDE THE VIEW 'CONTACT' DETAIL BUTTON 
          // AND GET THE CONTACT-ID USED TO GO TO THE CONTACT DETAILS
          // -----------------------------------------------------------
          if (this.request) {

            if (this.request.lead) {
              this.contact_id = this.request.lead._id
              this.logger.log('[WS-REQUESTS-MSGS]: NODEJS REQUEST > CONTACT ID ', this.contact_id);
              this.NODEJS_REQUEST_CNTCT_FOUND = true;
              this.logger.log('[WS-REQUESTS-MSGS]: NODEJS REQUEST > FOUND ? ', this.NODEJS_REQUEST_CNTCT_FOUND);
            } else {
              this.NODEJS_REQUEST_CNTCT_FOUND = false;
              this.logger.log('[WS-REQUESTS-MSGS]: NODEJS REQUEST > FOUND ? ', this.NODEJS_REQUEST_CNTCT_FOUND);
            }

          }

          this.createAgentsArrayFromParticipantsId(this.members_array, this.requester_id)
          this.createRequesterAvatar(this.request.lead);
          this.IS_CURRENT_USER_JOINED = this.currentUserIdIsInParticipants(this.request.participants, this.currentUserID, this.request.request_id);
          this.logger.log('[WS-REQUESTS-MSGS] - IS_CURRENT_USER_JOINED? ', this.IS_CURRENT_USER_JOINED)
        }
      }, error => {
        this.logger.error('[WS-REQUESTS-MSGS] - getWsRequestById$ - ERROR ', error)
      }, () => {
        this.logger.log('[WS-REQUESTS-MSGS] - getWsRequestById$ * COMPLETE *')
      });




  }


  // -----------------------------------------------------------------------------------------------------
  // @ Messages ws-subscription and get msgs from BS subscription
  // -----------------------------------------------------------------------------------------------------
  subscribeToWs_MsgsByRequestId(id_request: string) {
    this.logger.log('[WS-REQUESTS-MSGS] - subscribe To WS MSGS ByRequestId ', id_request)
    this.wsMsgsService.subsToWS_MsgsByRequestId(id_request);
    this.listenToGotAllMsg()
    this.getWsMsgs$();
  }
  // .pipe(filter((data) => data !== null))
  listenToGotAllMsg() {
    this.wsMsgsService.wsMsgsGotAllData$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data: any) => {
        if (data) {
          this.logger.log('[WS-REQUESTS-MSGS] - ALL MSGS LENGTH ', data.length)
          this.ALL_MSG_LENGTH = data.length
        }
      })
  }


  getWsMsgs$() {
    this.wsMsgsService.wsMsgsList$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((wsmsgs) => {

        if (wsmsgs) {
          this.logger.log('[WS-REQUESTS-MSGS] getWsMsgs$ WSMSGS lenght', wsmsgs.length)
          this.messagesList = wsmsgs;
          this.logger.log('[WS-REQUESTS-MSGS] getWsMsgs$ *** this.messagesList *** ', this.messagesList);
        }

        this.showSpinner = false;

        if (this.messagesList && this.messagesList.length !== this.ALL_MSG_LENGTH) {
          this.scrollCardContetToBottom();
        }

      }, error => {
        this.showSpinner = false;
        this.logger.error('[WS-REQUESTS-MSGS] - getWsMsgs$ - ERROR ', error)
      }, () => {
        this.logger.log('[WS-REQUESTS-MSGS] - getWsMsgs$ * COMPLETE * ')
      });
  }

  // -------------------------------------------------------------------------
  // Scroll
  // -------------------------------------------------------------------------
  scrollCardContetToBottom() {
    setTimeout(() => {
      // CHECK THIS
      const initialScrollPosition = this.myScrollContainer.nativeElement;
      // this.logger.log('[WS-REQUESTS-MSGS] SCROLL CONTAINER ', initialScrollPosition)

      initialScrollPosition.scrollTop = initialScrollPosition.scrollHeight;
      // this.logger.log('[WS-REQUESTS-MSGS] SCROLL HEIGHT ', initialScrollPosition.scrollHeight);
    }, 100);
  }

  getRequesterAvailabilityStatus(requester_id: string) {
    // const firebaseRealtimeDbUrl = `/apps/tilechat/presence/LmBT2IKjMzeZ3wqyU8up8KIRB6J3/connections`

    // -----------------------------------------------------------------------------------------
    // No more used - replaced by Get Lead presence from websocket
    // -----------------------------------------------------------------------------------------
    // const firebaseRealtimeDbUrl = `/apps/tilechat/presence/` + requester_id + `/connections`
    // const connectionsRef = firebase.database().ref().child(firebaseRealtimeDbUrl);
    // this.logger.log('%%% Ws-REQUESTS-Msgs »»» REQUEST DETAILS - CALLING REQUESTER AVAILABILITY VALUE ');

    // connectionsRef.on('value', (child) => {
    //   if (child.val()) {
    //     this.REQUESTER_IS_ONLINE = true;
    //     this.logger.log('%%% Ws-REQUESTS-Msgs »»» REQUEST DETAILS - REQUESTER is ONLINE ', this.REQUESTER_IS_ONLINE);
    //   } else {
    //     this.REQUESTER_IS_ONLINE = false;

    //     this.logger.log('%%% Ws-REQUESTS-Msgs »»» REQUEST DETAILS - REQUESTER is ONLINE ', this.REQUESTER_IS_ONLINE);
    //   }
    // })


    // -----------------------------------------------------------------------------------------
    // New - Get Lead presence from websocket subscription (replace firebaseRealtimeDb)
    // -----------------------------------------------------------------------------------------
    this.wsRequestsService.subscribeToWS_RequesterPresence(requester_id);
    this.getWsRequesterPresence();
  }

  getWsRequesterPresence() {
    // this.contactsService.wsRequesterStatus$
    this.wsRequestsService.wsRequesterStatus$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data) => {
        const user = data
        this.logger.log("[WS-REQUESTS-MSGS] - getWsRequesterPresence user ", user);
        if (user && user.presence) {

          if (user.presence.status === "offline") {
            this.REQUESTER_IS_ONLINE = false;
          } else {
            this.REQUESTER_IS_ONLINE = true;
          }
        }
      }, error => {

        this.logger.error('[WS-REQUESTS-MSGS] - getWsRequesterPresence user - ERROR ', error)
      }, () => {
        this.logger.log('[WS-REQUESTS-MSGS] - getWsRequesterPresence user * COMPLETE * ')
      });
  }


  getMemberFromRemote(note: any, userid: string) {
    this.usersService.getProjectUserById(userid)
      .subscribe((projectuser) => {
        this.logger.log('[WS-REQUESTS-MSGS] - getMemberFromRemote ID ', projectuser);

        note.createdBy_user = projectuser[0].id_user
        // this.usersLocalDbService.saveMembersInStorage(this.user['_id'], this.user);

      }, (error) => {
        this.logger.error('[WS-REQUESTS-MSGS] - getMemberFromRemote - ERROR ', error);
      }, () => {
        this.logger.log('[WS-REQUESTS-MSGS] - getMemberFromRemote * COMPLETE *');
      });
  }


  parseUserAgent(uastring) {
    // https://github.com/faisalman/ua-parser-js
    var parser = new UAParser();
    parser.setUA(uastring);
    return parser.getResult();
  }


  // ---------------------------------------------------------------------------------------
  // @ Tags
  // ---------------------------------------------------------------------------------------
  toggleAddTagInputAndGetTags() {
    const elem_add_tag_btn = <HTMLElement>document.querySelector('.add_tag_btn');
    // this.logger.log('% Ws-REQUESTS-Msgs - elem_add_tag_btn ', elem_add_tag_btn);
    elem_add_tag_btn.blur();
    this.getTag();
    this.diplayAddTagInput = !this.diplayAddTagInput
    this.logger.log('[WS-REQUESTS-MSGS] - toggleAddTagInputAndGetTags - DISPLAY TAG INPUT : ', this.diplayAddTagInput);
  }


  addTag() {
    this.logger.log('[WS-REQUESTS-MSGS] - ADD TAG - this.tag TO ADD: ', this.tag);
    const foundtag = this.tagsList.filter((obj: any) => {
      return obj._id === this.tag;
    });

    this.logger.log('[WS-REQUESTS-MSGS] - ADD TAG - foundtag: ', foundtag);
    const tagObject = { tag: foundtag[0].tag, color: foundtag[0].color }

    this.logger.log('[WS-REQUESTS-MSGS] - ADD TAG - tagObject: ', tagObject);
    this.tagsArray.push(tagObject);

    setTimeout(() => {
      this.tag = null;
    })

    // this.removeTagFromTaglistIfAlreadyAssigned(this.tagsList, this.tagsArray);
    this.getTag()

    this.logger.log('[WS-REQUESTS-MSGS] - ADD TAG - TAGS ARRAY AFTER PUSH: ', this.tagsArray);
    this.wsRequestsService.updateRequestsById_UpdateTag(this.id_request, this.tagsArray)
      .subscribe((data: any) => {
        this.logger.log('[WS-REQUESTS-MSGS] - ADD TAG - RES: ', data);
      }, (err) => {
        this.logger.error('[WS-REQUESTS-MSGS] - ADD TAG - ERROR: ', err);
        this.notify.showWidgetStyleUpdateNotification(this.create_label_error, 4, 'report_problem');
      }, () => {
        this.logger.log('[WS-REQUESTS-MSGS] * COMPLETE *');
        this.notify.showWidgetStyleUpdateNotification(this.create_label_success, 2, 'done');
      });
  }

  getTag() {
    this.loadingTags = true
    this.tagsService.getTags().subscribe((tags: any) => {
      if (tags) {
        // tagsList are the available tags that the administrator has set on the tag management page
        // and that are displayed in the combo box 'Add tag' of this template
        this.tagsList = tags
        this.logger.log('[WS-REQUESTS-MSGS] - GET TAGS - tag of tagsList ', tags);

        // "tagArray" are the tags present in the "this.request" object
        this.logger.log('[WS-REQUESTS-MSGS] - GET TAGS - tagsArray', this.tagsArray);
        this.logger.log('[WS-REQUESTS-MSGS] - GET TAGS - tagsList length', this.tagsList.length);

        if (this.tagsList.length > 0) {
          this.typeALabelAndPressEnter = "Type a label and press Enter";
        } else {
          this.typeALabelAndPressEnter = "No item Found";
        }
        // -----------------------------------------------------------------------------------
        // Splice tags from the tagslist the tags already present in the "this.request" object
        // ------------------------------------------------------------------------------------
        this.removeTagFromTaglistIfAlreadyAssigned(this.tagsList, this.tagsArray);
      }
    }, (error) => {
      this.logger.error('[WS-REQUESTS-MSGS] - GET TAGS - ERROR  ', error);
      this.loadingTags = false
    }, () => {
      this.logger.log('[WS-REQUESTS-MSGS] - GET TAGS * COMPLETE *');
      this.loadingTags = false
    });
  }

  // -----------------------------------------------------------------------------------
  // Splice tags from the tagslist the tags already present in the "this.request" object
  // ------------------------------------------------------------------------------------
  removeTagFromTaglistIfAlreadyAssigned(tagsList: any, tagsArray: any) {
    // remove from the taglist (tags that the administrator has set on the tag management page and that are displayed in the combo box 'Add tag' of this template)
    // the tag that are already in the tagArray (the tags present in the "this.request" object)
    for (var i = tagsList.length - 1; i >= 0; i--) {
      for (var j = 0; j < tagsArray.length; j++) {
        if (tagsList[i] && (tagsList[i].tag === tagsArray[j].tag)) {
          this.logger.log('[WS-REQUESTS-MSGS] - GET TAGS -  tagsList - tagsList[i] ', tagsList[i]);
          tagsList.splice(i, 1);
        }
      }
    }
    this.logger.log('[WS-REQUESTS-MSGS] - GET TAGS -  tagsList - AFTER SPLICE ', this.tagsList);
  }


  removeTag(tag: string) {
    if (this.DISABLE_ADD_NOTE_AND_TAGS === false) {
      this.logger.log('[WS-REQUESTS-MSGS] - REMOVE TAG - tag TO REMOVE: ', tag);
      var index = this.tagsArray.indexOf(tag);
      if (index !== -1) {
        this.tagsArray.splice(index, 1);
      }
      // this.removeTagFromTaglistIfAlreadyAssigned(this.tagsList, this.tagsArray);
      this.getTag();

      this.logger.log('[WS-REQUESTS-MSGS] -  REMOVE TAG - TAGS ARRAY AFTER SPLICE: ', this.tagsArray);
      this.wsRequestsService.updateRequestsById_UpdateTag(this.id_request, this.tagsArray)
        .subscribe((data: any) => {

          this.logger.log('[WS-REQUESTS-MSGS] - REMOVE TAG - RES: ', data);
        }, (err) => {
          this.logger.error('[WS-REQUESTS-MSGS] - REMOVE TAG - ERROR: ', err);
          this.notify.showWidgetStyleUpdateNotification(this.delete_label_error, 4, 'report_problem');

        }, () => {
          this.logger.log('[WS-REQUESTS-MSGS] - REMOVE TAG * COMPLETE *');
          this.notify.showWidgetStyleUpdateNotification(this.delete_label_success, 2, 'done');
        });
    }
  }

  // ---------------------------------------------------------------------------------------
  // @ Notes
  // ---------------------------------------------------------------------------------------
  openNotesAccordion() {
    var acc = <HTMLElement>document.querySelector('.accordion');
    this.logger.log('[WS-REQUESTS-MSGS] - openNotesAccordion -  accordion elem ', acc);
    acc.classList.toggle("active");
    // var panel = acc.nextElementSibling ;
    var panel = <HTMLElement>document.querySelector('.note-panel')
    this.logger.log('[WS-REQUESTS-MSGS] - openNotesAccordion -  panel ', panel);

    this.scrollTopWhenNewItemISAdded();
    // let ps = new PerfectScrollbar(panel);
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      // panel.style.maxHeight = panel.scrollHeight + "111px";
      panel.style.maxHeight = "300px";
      // panel.scrollTop = panel.scrollHeight; // scroll to bottom when the accordion is opened
      panel.scrollTop = 0;
      // setTimeout(function(){
      //   panel.scrollTop = 0;
      // }, 500);
    }
  }

  scrollTopWhenNewItemISAdded() {
    let current = this.contEl.nativeElement.offsetTop;
    this.contEl.scrollTop;
    this.logger.log('[WS-REQUESTS-MSGS] - scrollTopWhenNewItemISAdded - contEl.scrollTop ', this.contEl);
    this.logger.log('[WS-REQUESTS-MSGS] - scrollTopWhenNewItemISAdded - contEl.nativeElement.offsetTop; ', current);

  }

  addNote() {
    // this.disableMainPanelScroll();
    this.showSpinnerInAddNoteBtn = true;
    this.wsRequestsService.createNote(this.new_note, this.id_request)
      .subscribe((responses: any) => {
        this.logger.log('[WS-REQUESTS-MSGS] - CREATE NOTE - RES ', responses);
      }, (error) => {
        this.logger.error('[WS-REQUESTS-MSGS] - CREATE NOTE - ERROR ', error);
        this.notify.showWidgetStyleUpdateNotification(this.create_note_success, 4, 'report_problem');
        this.showSpinnerInAddNoteBtn = false;
      }, () => {
        this.logger.error('[WS-REQUESTS-MSGS] - CREATE NOTE * COMPLETE *');
        this.new_note = ''
        // var panel = <HTMLElement>document.querySelector('.note-panel')
        // panel.scrollTop = panel.scrollHeight;
        // this.logger.log('% Ws-REQUESTS-Msgs - note-wf - CREATE NOTE * COMPLETE *');

        this.notify.showWidgetStyleUpdateNotification(this.create_note_success, 2, 'done');
        this.showSpinnerInAddNoteBtn = false;
        // this.enableMainPanelScroll()

      });
  }


  deleteNote(note_id) {
    this.notify.operationinprogress(this.notifyProcessingMsg);

    this.wsRequestsService.deleteNote(this.id_request, note_id)
      .subscribe((responses: any) => {
        this.logger.log('[WS-REQUESTS-MSGS]  - DELETE NOTE - RES ', responses);


      }, (error) => {
        this.logger.error('[WS-REQUESTS-MSGS]  - DELETE NOTE - ERROR ', error);
        this.notify.showWidgetStyleUpdateNotification(this.delete_note_success, 4, 'report_problem');
      }, () => {

        var panel = <HTMLElement>document.querySelector('.note-panel')
        // panel.scrollTop = panel.scrollHeight;
        this.logger.log('[WS-REQUESTS-MSGS]  DELETE NOTE * COMPLETE *');
        // this.notify.showWidgetStyleUpdateNotification(this.delete_note_success, 2, 'done');
        this.notify.operationcompleted(this.delete_note_success);

        // this.closeModalDeleteNote(); // no more used
      });
  }


  // ------------------------------------------------
  // @ Used in notes (CALLED FROM TEMPLATE)
  // ------------------------------------------------
  onScrollx(event: any): void {
    // // this.logger.log('SIDEBAR RICHIAMO ON SCROLL ');
    // this.elSidebarWrapper = <HTMLElement>document.querySelector('.sidebar-wrapper');
    // this.scrollpos = this.elSidebarWrapper.scrollTop
    // this.logger.log('SIDEBAR SCROLL POSITION', this.scrollpos)

    var panel = <HTMLElement>document.querySelector('.note-panel')
    const scrollpos = panel.scrollTop
    this.logger.log('[WS-REQUESTS-MSGS] - note panel - scrollpos onScrollx ', scrollpos);

    // window.scrollTo(0, 0);
    // let elBody = <HTMLElement>document.querySelector('body');
    // elBody.animate({ scrollTop: 0 }, 200);

    let elMainPanel = <HTMLElement>document.querySelector('.main-panel');
    this.logger.log('[WS-REQUESTS-MSGS] - note panel -  elMainPanel: ', elMainPanel)
    this.logger.log('[WS-REQUESTS-MSGS] - note panel -  elMainPanel.scrollTop: ', elMainPanel.scrollTop)

    // elMainPanel.scrollTo(0,scrollpos)
  }

  // ---------------------------------------------------------------------------------------
  // @ Priority
  // ---------------------------------------------------------------------------------------
  onChangeSelectedPriority(selectedPriority) {
    this.logger.log('[WS-REQUESTS-MSGS] - onChangeSelectedPriority selectedPriority ', selectedPriority)
    this.selectedPriority = selectedPriority;

    this.wsRequestsService.updatePriority(this.id_request, selectedPriority)
      .subscribe((res: any) => {
        this.logger.log('[WS-REQUESTS-MSGS] - onChangeSelectedPriority - UPDATED PRIORITY - RES ', res);

      }, (error) => {
        this.logger.error('[WS-REQUESTS-MSGS] - onChangeSelectedPriority -UPDATED PRIORITY - ERROR ', error);
        this.notify.showWidgetStyleUpdateNotification(this.priority_update_failed, 4, 'report_problem');
      }, () => {
        // panel.scrollTop = panel.scrollHeight;
        this.logger.log('[WS-REQUESTS-MSGS] - onChangeSelectedPriority - UPDATED PRIORITY  * COMPLETE *');
        this.notify.showWidgetStyleUpdateNotification(this.priority_updated_successfully_msg, 2, 'done');

      });

  }

  // ---------------------------------------------------------------------------------------
  // @ Attributes accordion
  // ---------------------------------------------------------------------------------------
  openAttributesAccordion() {
    // var acc = document.getElementsByClassName("accordion");
    var acc = <HTMLElement>document.querySelector('.attributes-accordion');
    this.logger.log('[WS-REQUESTS-MSGS] - open attributes-accordion -  accordion elem ', acc);
    acc.classList.toggle("active");
    // var panel = acc.nextElementSibling ;
    var panel = <HTMLElement>document.querySelector('.attributes-panel')
    this.logger.log('[WS-REQUESTS-MSGS] -  open attributes-accordion  -  panel ', panel);

    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  }

  // ---------------------------------------------------------------------------------------
  // @ Attributes decoded jwt accordion
  // ---------------------------------------------------------------------------------------
  openAttributesDecodedJWTAccordion() {
    // var acc = document.getElementsByClassName("accordion");
    var acc = <HTMLElement>document.querySelector('.attributes-decoded-jwt-accordion');
    // this.logger.log('WS-REQUESTS-MSGS - ATTRIBUTES DECODED JWT - open attributes-decoded-jwt-accordion -  accordion elem ', acc);
    acc.classList.toggle("active");
    // var panel = acc.nextElementSibling ;
    var panel = <HTMLElement>document.querySelector('.attributes-decoded-jwt-panel')
    // this.logger.log('WS-REQUESTS-MSGS - ATTRIBUTES DECODED JWT-  open attributes-decoded-jwt-panel  -  panel ', panel);

    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  }

  // ---------------------------------------------------------------------------------------
  // @ Attributes PRE-CHAT FORM accordion
  // ---------------------------------------------------------------------------------------
  openAttributesPrechatFormAccordion() {
    // var acc = document.getElementsByClassName("accordion");
    var acc = <HTMLElement>document.querySelector('.attributes-pre-chat-form-accordion');
    // this.logger.log('WS-REQUESTS-MSGS - ATTRIBUTES DECODED JWT - open attributes-decoded-jwt-accordion -  accordion elem ', acc);
    acc.classList.toggle("active");
    // var panel = acc.nextElementSibling ;
    var panel = <HTMLElement>document.querySelector('.attributes-pre-chat-form-accordion-panel')
    // this.logger.log('WS-REQUESTS-MSGS - ATTRIBUTES DECODED JWT-  open attributes-decoded-jwt-panel  -  panel ', panel);

    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  }

  // https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript see section Async + Fallback
  copyToClipboardPreChatFormValue(prechatAttributeValue: string, prechattooltipid: string): void {
    this.logger.log('copyToClipboardPreChatFormValue attributeValue', prechatAttributeValue)
    this.logger.log('copyToClipboardPreChatFormValue prechatAttributeName', prechattooltipid)
    const prechatTooltip = <HTMLElement>document.querySelector(`#${prechattooltipid}`)
    this.logger.log('copyToClipboardPreChatFormValue prechatTooltip ', prechatTooltip);

    let listener = (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', (prechatAttributeValue));
      e.preventDefault();
    };

    document.addEventListener('copy', listener);
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      this.logger.log('copyToClipboardPreChatFormValue: Copying text command was ' + msg);

      if (successful) {
        prechatTooltip.classList.add('show-has-copied-tooltip');
        setTimeout(() => {
          prechatTooltip.classList.remove('show-has-copied-tooltip');
        }, 1000);
      }
    } catch (err) {
      this.logger.error('Fallback: Oops, unable to copy', err);
    }

    document.removeEventListener('copy', listener);
  }


  copyToClipboardContactEmail(contactemail) {
    this.logger.log('copyToClipboardContactEmail contactemail', contactemail)

    const prechatTooltip = <HTMLElement>document.querySelector(`#contact-email`)
    this.logger.log('Fallback: prechatTooltip ', prechatTooltip);

    let listener = (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', (contactemail));
      e.preventDefault();
    };

    document.addEventListener('copy', listener);
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      this.logger.log('Fallback: Copying text command was ' + msg);

      if (successful) {
        prechatTooltip.classList.add('show-has-copied-tooltip');
        setTimeout(() => {
          prechatTooltip.classList.remove('show-has-copied-tooltip');
        }, 1000);
      }
    } catch (err) {
      this.logger.error('Fallback: Oops, unable to copy', err);
    }

    document.removeEventListener('copy', listener);

  }

  // ------------------------------------------------
  // LISTEN TO SCROLL POSITION (CALLED FROM TEMPLATE)
  // ------------------------------------------------
  onScroll(event: any): void {
    // this.logger.log('[WS-REQUESTS-MSGS] CALL ON SCROLL ')
    const scrollPosition = this.myScrollContainer.nativeElement.scrollTop;

    const scrollHeight = this.myScrollContainer.nativeElement.scrollHeight;
    // this.logger.log('[WS-REQUESTS-MSGS] - SCROLL POSITION ', scrollPosition);
    // this.logger.log('[WS-REQUESTS-MSGS] - SCROLL HEIGHT ', scrollHeight);

    const scrollHeighLessScrollPosition = scrollHeight - scrollPosition;
    // this.logger.log('[WS-REQUESTS-MSGS] ON SCROLL - SCROLL OVERFLOW ', scrollHeighLessScrollPosition);
    if (scrollHeighLessScrollPosition > 500) {
      this.displayBtnScrollToBottom = 'block';
    } else {
      this.displayBtnScrollToBottom = 'none';
    }
  }



  // ------------------------------------------------
  // SCROLL TO BOTTOM (CALLED FROM TEMPLATE)
  // ------------------------------------------------
  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      // tslint:disable-next-line:max-line-length
      // this.logger.log('RUN SCROLL TO BOTTOM - SCROLL TOP ', this.myScrollContainer.nativeElement.scrollHeight, ' SCROLL HEIGHT ', this.myScrollContainer.nativeElement.scrollHeight);
    } catch (err) {
      this.logger.error('[WS-REQUESTS-MSGS] - scrollToBottom ERROR ', err);
    }
  }


  openRightSideBar(message: string) {
    this.OPEN_RIGHT_SIDEBAR = true;
    this.logger.log('[WS-REQUESTS-MSGS] »»»» OPEN RIGHT SIDEBAR ', this.OPEN_RIGHT_SIDEBAR, ' MSG: ', message);
    this.selectedQuestion = message;


    // questo non funziona se è commented BUG RESOLVE
    const elemMainContent = <HTMLElement>document.querySelector('.main-content');
    this.train_bot_sidebar_height = elemMainContent.clientHeight + 10 + 'px'
    this.logger.log('[WS-REQUESTS-MSGS] - REQUEST-MSGS - ON OPEN RIGHT SIDEBAR -> RIGHT SIDEBAR HEIGHT', this.train_bot_sidebar_height);


    // BUG RESOLVE inserisco questo visto che all'ampiezza in cui compare la sidebar sx non è comunque possibile scorrere
    // la pagina
    // const _elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    // _elemMainPanel.setAttribute('style', 'overflow-x: hidden !important;overflow-y: hidden !important;');

    // const mainPanelScrollPosition = _elemMainPanel.scrollTop;
    // this.logger.log('mainPanelScrollPosition ', mainPanelScrollPosition);
    // this.train_bot_sidebar_top_pos = mainPanelScrollPosition + 'px'
  }


  handleCloseRightSidebar(event) {
    this.logger.log('[WS-REQUESTS-MSGS] - CLOSE RIGHT SIDEBAR ', event);
    this.OPEN_RIGHT_SIDEBAR = event;

    // const _elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    // _elemMainPanel.setAttribute('style', 'overflow-x: hidden !important;');
  }



  openSelectUsersModal(actionSelected) {
    this.actionInModal = actionSelected
    this.logger.log('[WS-REQUESTS-MSGS] - ACTION IN MODAL ', this.actionInModal);
    // this.getAllUsersOfCurrentProject();
    this.getProjectUsersAndBots();

    this.getDepartments();
    this.displayUsersListModal = 'block'
    this.logger.log('[WS-REQUESTS-MSGS] - DISPLAY USERS LIST MODAL ', this.displayUsersListModal);
    const actualHeight = window.innerHeight;
    this.logger.log('[WS-REQUESTS-MSGS] - ON OPEN USER LIST MODAL -> ACTUAL WINDOW HEIGHT  ', actualHeight);
    const actualWidth = window.innerWidth;
    this.logger.log('[WS-REQUESTS-MSGS] - ON OPEN USER LIST MODAL -> ACTUAL WINDOW WIDTH  ', actualWidth);

    const elemMainContent = <HTMLElement>document.querySelector('.main-content');
    this.main_content_height = elemMainContent.clientHeight
    this.logger.log('[WS-REQUESTS-MSGS] - USER LIST MODAL - ON OPEN -> ACTUAL MAIN CONTENT HEIGHT', elemMainContent.clientHeight);

    this.logger.log('[WS-REQUESTS-MSGS] - USER LIST MODAL - ON OPEN  > 991 - users_list_modal_height', this.users_list_modal_height);

    // determine the height of the modal when the width of the window is <= of 991px when is opened the modal
    // RESOLVE THE BUG: @media screen and (max-width: 992px) THE THE HEIGHT OF THE  MODAL 'USERS LIST' IS NOT 100%
    if (actualWidth <= 991) {
      this.users_list_modal_height = elemMainContent.clientHeight + 70 + 'px'
      // this.logger.log('%%% Ws-REQUESTS-Msgs - *** MODAL HEIGHT ***', this.users_list_modal_height);
      this.logger.log('[WS-REQUESTS-MSGS] - USER LIST MODAL - ON OPEN  <=991 - users_list_modal_height', this.users_list_modal_height);
    }
  }

  closeSelectUsersModal() {
    this.displayUsersListModal = 'none'
    this.logger.log('[WS-REQUESTS-MSGS] - ON CLOSE USERS LIST MODAL ', this.displayUsersListModal);
  }


  // ------------------------------------------------------------------------------------------------------------------------
  // @ Get all project's Agents (project-users & bots) - called when the user open the SelectUsersModal (openSelectUsersModal)
  // ------------------------------------------------------------------------------------------------------------------------
  getProjectUsersAndBots() {
    // https://stackoverflow.com/questions/44004144/how-to-wait-for-two-observables-in-rxjs
    const projectUsers = this.usersService.getProjectUsersByProjectId();
    const bots = this.faqKbService.getFaqKbByProjectId();

    Observable
      .zip(projectUsers, bots, (_projectUsers: any, _bots: any) => ({ _projectUsers, _bots }))
      .subscribe(pair => {
        // this.logger.log('%% Ws-REQUESTS-Msgs - GET P-USERS-&-BOTS - PROJECT USERS : ', pair._projectUsers);
        // this.logger.log('%% Ws-REQUESTS-Msgs - GET P-USERS-&-BOTS - BOTS: ', pair._bots);

        if (pair && pair._projectUsers) {
          this.projectUsersList = pair._projectUsers;
          this.projectUsersList.forEach(projectUser => {

            projectUser['is_joined_to_request'] = this.currentUserIdIsInParticipants(this.request.participants, projectUser.id_user._id, this.request.request_id);
            this.logger.log('%%% Ws-REQUESTS-Msgs - PROJECT USERS ID', projectUser.id_user._id, ' is JOINED ', projectUser['is_joined_to_request']);
          });
        }

        if (pair && pair._bots) {
          this.bots = pair._bots
            .filter(bot => {
              if (bot['trashed'] === false) {
                return true
              } else {
                return false
              }
            })
        }
      }, error => {
        this.showSpinner_inModalUserList = false;
        this.logger.error('%% Ws-REQUESTS-Msgs - GET P-USERS-&-BOTS - ERROR: ', error);
      }, () => {
        this.showSpinner_inModalUserList = false;
        this.logger.log('%% Ws-REQUESTS-Msgs - GET P-USERS-&-BOTS - COMPLETE');
      });
  }

  // ----------------------------
  // GET DEPTS
  // ----------------------------
  getDepartments() {
    this.departmentService.getDeptsByProjectId().subscribe((depts: any) => {
      this.logger.log('[WS-REQUESTS-MSGS] - GET DEPTS RESPONSE ', depts);
      this.departments = depts;
      let count = 0;
      this.departments.forEach(dept => {
        if (dept.default === false && dept.status === 1) {
          count = count + 1;
        }
        let newInitials = '';
        let newFillColour = '';
        if (dept.name) {
          newInitials = avatarPlaceholder(dept.name);
          if (dept.default !== true) {
            newFillColour = getColorBck(dept.name);
          } else if (dept.default === true && this.departments.length === 1) {
            newFillColour = '#6264A7'
          } else if (dept.default === true && this.departments.length > 1) {
            newFillColour = 'rgba(98, 100, 167, 0.6) '
          }
        } else {
          newInitials = 'N/A.';
          newFillColour = '#eeeeee';
        }

        dept['dept_name_initial'] = newInitials;
        dept['dept_name_fillcolour'] = newFillColour;

        if (dept.routing === 'assigned' || dept.routing === 'pooled') {
          if (dept.id_group !== null && dept.id_group !== undefined) {
            this.getGroupById(dept.id_group)
          }
          if (dept.id_bot !== null && dept.id_bot !== undefined) {
            this.getBotById(dept.id_bot);
          }
        }
      });

      this.COUNT_OF_VISIBLE_DEPT = count;
      this.logger.log('[WS-REQUESTS-MSGS] - GET DEPTS - COUNT_OF_VISIBLE_DEPT', this.COUNT_OF_VISIBLE_DEPT);
    }, error => {
      this.logger.error('[WS-REQUESTS-MSGS] - GET DEPTS - ERROR: ', error);
    }, () => {
      this.logger.log('[WS-REQUESTS-MSGS] - GET DEPTS * COMPLETE *')
    });
  }

  // ----------------------------
  // GET GROUP BY ID
  // ----------------------------
  getGroupById(id_group) {
    this.groupsService.getGroupById(id_group).subscribe((group: any) => {

      if (group) {
        this.logger.log('[WS-REQUESTS-MSGS] - GET GROUP RESPONSE', group);

        // this.groupName = group.name
        // this.groupIsTrashed = group.trashed
        // this.logger.log(' -- > GROUP NAME ', this.groupName, 'is TRASHED ', this.groupIsTrashed);
        for (const dept of this.departments) {
          if (dept.id_group === group._id) {
            if (dept.routing === 'assigned' || dept.routing === 'pooled') {
              dept.hasGroupName = group.name
              if (group.trashed === true) {
                dept.groupHasBeenTrashed = true
              }
            }
          }
        }
      }
    }, error => {
      this.logger.error('[WS-REQUESTS-MSGS] - GET GROUP - ERROR ', error);
    }, () => {
      this.logger.log('[WS-REQUESTS-MSGS] - GET GROUP * COMPLETE *')
    });
  }


  // ----------------------------
  // GET BOT BY ID 
  // ----------------------------
  getBotById(id_bot) {
    this.faqKbService.getFaqKbById(id_bot).subscribe((bot: any) => {
      if (bot) {
        this.logger.log('[WS-REQUESTS-MSGS] - BOT GET BY ID RES', bot);
        const botName = bot.name;

        for (const dept of this.departments) {
          if (dept.id_bot === bot._id) {
            dept.hasBotName = botName
            dept.botHasBeenTrashed = bot.trashed
          }
        }
      }
    }, error => {
      this.logger.error('[WS-REQUESTS-MSGS] - BOT GET BY ID - ERROR', error);

      const errorBody = JSON.parse(error._body)
      this.logger.error('[WS-REQUESTS-MSGS] - BOT GET BY ID - ERROR BODY', errorBody);

      if (errorBody.msg === 'Object not found.') {
        this.logger.error('[WS-REQUESTS-MSGS] - BOT GET BY ID - ERROR BODY MSG', errorBody.msg);
        this.logger.error('[WS-REQUESTS-MSGS] - BOT GET BY ID - ERROR url', error.url);

        const IdOfBotNotFound = error.url.split('/').pop();
        this.logger.error('[WS-REQUESTS-MSGS] - BOT GET BY ID - ERROR - ID OF BOT NOT FOUND ', IdOfBotNotFound);
      }
    }, () => {
      this.logger.log('[WS-REQUESTS-MSGS] - BOT GET BY ID * COMPLETE *')
    });
  }


  selectUser(user_id: string, user_firstname: string, user_lastname: string, user_email: string) {
    this.logger.log('[WS-REQUESTS-MSGS] - SELECTED USER ID ', user_id);
    this.logger.log('[WS-REQUESTS-MSGS] - SELECTED USER FIRSTNAME ', user_firstname);
    this.logger.log('[WS-REQUESTS-MSGS] - SELECTED USER LASTNAME ', user_lastname);
    this.logger.log('[WS-REQUESTS-MSGS] - SELECTED USER EMAIL ', user_email);
    this.userid_selected = user_id;
    this.userfirstname_selected = user_firstname;
    this.userlastname_selected = user_lastname;
    this.useremail_selected = user_email;

    // const testDiv = <HTMLElement>document.querySelector('.swap_btn');
    // this.logger.log('REQUEST-MSGS - SELECTED USER ROW TOP OFFSET ', testDiv.offsetTop);
    // this.displayConfirmReassignmentModal = 'block';

    if (this.actionInModal === 'reassign') {
      this.presentSwalModalReassignConversationToAgent(this.userid_selected, this.userfirstname_selected, this.userlastname_selected);
    }

    if (this.actionInModal === 'invite') {
      this.presentSwalModalAddAgentToConversation(this.userid_selected, this.userfirstname_selected, this.userlastname_selected);
    }
  }

  presentSwalModalReassignConversationToAgent(userid, userfirstname, userlastname) {
    swal({
      title: this.reassignRequestMsg,
      text: this.requestWillBeReassignedToMsg + ' ' + userfirstname + ' ' + userlastname,
      icon: "info",
      buttons: true,
      dangerMode: false,
      className: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""
    })
      .then((willReassign) => {
        if (willReassign) {
          this.logger.log('[WS-REQUESTS-MSGS] ReassignConversationToAgent swal willReassign to User', willReassign)


          this.wsRequestsService.setParticipants(this.id_request, userid).subscribe((res: any) => {
            this.logger.log('[WS-REQUESTS-MSGS] ReassignConversationToAgent in swal willReassign to User setParticipants res ', res)

          }, (error) => {
            this.logger.error('[WS-REQUESTS-MSGS] ReassignConversationToAgent in swal willReassign to User setParticipants - ERROR ', error);

            swal(this.anErrorHasOccurredMsg, {
              icon: "error",
            });

          }, () => {
            this.logger.log('[WS-REQUESTS-MSGS] ReassignConversationToAgent in swal willReassign to User setParticipants * COMPLETE *');

            swal({
              title: this.done_msg + "!",
              icon: "success",
              button: "OK",
              className: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""
            }).then((okpressed) => {

              this.displayUsersListModal = 'none'
            });

          });
        } else {
          this.logger.log('[WS-REQUESTS-MSGS] ReassignConversationToAgent  swal willReassign', willReassign)
          // swal("Your imaginary file is safe!");
        }
      });
  }

  presentSwalModalAddAgentToConversation(userid, userfirstname, userlastname) {
    swal({
      title: this.addAgentMsg,
      text: this.requestWillBeAssignedToMsg + ' ' + userfirstname + ' ' + userlastname,
      icon: "info",
      buttons: true,
      dangerMode: false,
      className: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""
    })
      .then((willBeAdded: any) => {
        if (willBeAdded) {
          this.logger.log('[WS-REQUESTS-MSGS] AddAgentToConversation in wal willBeAdded to User', willBeAdded)


          this.wsRequestsService.addParticipant(this.id_request, userid).subscribe((res: any) => {
            this.logger.log('[WS-REQUESTS-MSGS] AddAgentToConversation in swal willBeAdded to User addParticipant res ', res)

          }, (error) => {
            this.logger.error('[WS-REQUESTS-MSGS] AddAgentToConversation in swal willBeAssigned to User addParticipant - ERROR ', error);

            swal(this.anErrorHasOccurredMsg, {
              icon: "error",
            });

          }, () => {
            this.logger.log('[WS-REQUESTS-MSGS] AddAgentToConversation in swal willBeAssigned to User addParticipant * COMPLETE *');

            swal({
              title: this.done_msg + "!",
              icon: "success",
              button: "OK",
              className: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""
            }).then((okpressed) => {

              this.displayUsersListModal = 'none'
            });

          });
        } else {
          this.logger.log('[WS-REQUESTS-MSGS] AddAgentToConversation swal willReassign', willBeAdded);
        }
      });
  }


  selectBot(botid: string, botname: string) {
    this.logger.log('[WS-REQUESTS-MSGS] AddAgentToConversation - SELECTED BOT ID ', botid);
    this.logger.log('[WS-REQUESTS-MSGS] AddAgentToConversation - SELECTED BOT NAME ', botname);
    this.userid_selected = 'bot_' + botid
    this.userfirstname_selected = botname;
    this.userlastname_selected = '';
    this.useremail_selected = '';
    // this.displayConfirmReassignmentModal = 'block'
    this.presentSwalModalReassignConversationToBot(this.userid_selected, this.userfirstname_selected)
  }


  presentSwalModalReassignConversationToBot(botid, botname) {
    swal({
      title: this.reassignRequestMsg,
      text: this.requestWillBeReassignedToMsg + ' ' + botname,
      icon: "info",
      buttons: true,
      dangerMode: false,
      className: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""
    })
      .then((willReassign) => {
        if (willReassign) {
          this.logger.log('[WS-REQUESTS-MSGS] ReassignConversationToBot in swal willReassign to Bot', willReassign)


          this.wsRequestsService.setParticipants(this.id_request, botid).subscribe((res: any) => {
            this.logger.log('[WS-REQUESTS-MSGS] ReassignConversationToBot in swal willReassign to Bot setParticipants res ', res)

          }, (error) => {
            this.logger.log('[WS-REQUESTS-MSGS] ReassignConversationToBot in swal willReassign to Bot setParticipants - ERROR ', error);

            swal(this.anErrorHasOccurredMsg, {
              icon: "error",
            });

          }, () => {
            this.logger.log('[WS-REQUESTS-MSGS] ReassignConversationToBot in swal willReassign to Bot setParticipants * COMPLETE *');

            swal({
              title: this.done_msg + "!",
              icon: "success",
              button: "OK",
              className: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""
            }).then((okpressed) => {

              this.displayUsersListModal = 'none';
            });
          });
        } else {
          this.logger.log('swal willReassign', willReassign);
        }
      });
  }

  selectDept(deptname: string, deptid: string) {
    this.logger.log('[WS-REQUESTS-MSGS] - SELECTED DEPT ID ', deptname);
    this.logger.log('[WS-REQUESTS-MSGS] - SELECTED DEPT NAME ', deptid);

    this.deptid_selected = deptid
    this.deptname_selected = deptname

    this.presentSwalModalConfirmReassignToDept(deptid, deptname)
  }


  presentSwalModalConfirmReassignToDept(deptid, deptname) {
    swal({
      title: this.reassignRequestMsg,
      text: this.requestWillBeReassignedToMsg + ' ' + deptname,
      icon: "info",
      buttons: true,
      dangerMode: false,
      className: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""
    })
      .then((willReassign) => {
        if (willReassign) {
          this.logger.log('[WS-REQUESTS-MSGS] ConfirmReassignToDept swal willReassign to dept', willReassign)


          this.wsRequestsService.joinDept(deptid, this.id_request).subscribe((res: any) => {
            this.logger.log('[WS-REQUESTS-MSGS] ConfirmReassignToDept in swal joinDept res ', res)
          }, (error) => {
            this.logger.error('[WS-REQUESTS-MSGS] ConfirmReassignToDept in swal joinDept - ERROR ', error);

            swal(this.anErrorHasOccurredMsg, {
              icon: "error",
            });

          }, () => {
            this.logger.log('[WS-REQUESTS-MSGS] ConfirmReassignToDept in swal joinDept * COMPLETE *');

            swal({
              title: this.done_msg + "!",
              icon: "success",
              button: "OK",
              className: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""
            }).then((okpressed) => {

              this.displayUsersListModal = 'none'
            });

          });
        } else {
          this.logger.log('[WS-REQUESTS-MSGS] ConfirmReassignToDept swal willReassign', willReassign)
          // swal("Your imaginary file is safe!");
        }
      });
  }


  archiveRequest(requestid) {
    this.notify.showArchivingRequestNotification(this.archivingRequestNoticationMsg);

    this.wsRequestsService.closeSupportGroup(requestid)
      .subscribe((data: any) => {
        this.logger.log('[WS-REQUESTS-MSGS] - CLOSE SUPPORT GROUP - DATA ', data);
      },
        (err) => {
          this.logger.error('[WS-REQUESTS-MSGS] - CLOSE SUPPORT GROUP - ERROR ', err);

          //  NOTIFY ERROR 
          this.notify.showWidgetStyleUpdateNotification(this.request_archived_err_msg, 4, 'report_problem')
        }, () => {

          this.logger.log('[WS-REQUESTS-MSGS] - CLOSE SUPPORT GROUP - COMPLETE');
          //  NOTIFY SUCCESS
          this.notify.showRequestIsArchivedNotification(this.requestHasBeenArchivedNoticationMsg_part1);
        });
  }

  // JOIN TO CHAT GROUP
  onJoinHandled() {
    this.logger.log('[WS-REQUESTS-MSGS]- JOIN PRESSED');
    this.SHOW_JOIN_TO_GROUP_SPINNER_PROCESSING = true;

    this.wsRequestsService.addParticipant(this.id_request, this.currentUserID)
      .subscribe((data: any) => {

        this.logger.log('[WS-REQUESTS-MSGS] - addParticipant TO CHAT GROUP ', data);
      }, (err) => {
        this.logger.error('[WS-REQUESTS-MSGS] - addParticipant TO CHAT GROUP - ERROR ', err);
        this.SHOW_JOIN_TO_GROUP_SPINNER_PROCESSING = false;
        this.HAS_COMPLETED_JOIN_TO_GROUP_POST_REQUEST = false;
        this.JOIN_TO_GROUP_HAS_ERROR = true;
      }, () => {
        this.logger.log('[WS-REQUESTS-MSGS] - addParticipant TO CHAT GROUP * COMPLETE *');

        this.notify.showWidgetStyleUpdateNotification(`You are successfully added to the chat`, 2, 'done');
        this.SHOW_JOIN_TO_GROUP_SPINNER_PROCESSING = false;
        this.HAS_COMPLETED_JOIN_TO_GROUP_POST_REQUEST = true;
      });

  }

  openleaveChatModal() {
    this.displayLeaveChatModal = 'block'
  }

  leaveChat() {
    this.displayLeaveChatModal = 'none'
    this.displayLeavingChatInfoModal = 'block';
    this.SHOW_CIRCULAR_SPINNER = true;
    this.wsRequestsService.leaveTheGroup(this.id_request, this.currentUserID)
      .subscribe((data: any) => {

        this.logger.log('[WS-REQUESTS-MSGS] - LEAVE THE GROUP - RESPONSE ', data);
      }, (err) => {
        this.logger.error('[WS-REQUESTS-MSGS] - LEAVE THE GROUP - ERROR ', err);
        this.SHOW_CIRCULAR_SPINNER = false;
        this.LEAVE_CHAT_ERROR = true;

      }, () => {
        this.notify.showWidgetStyleUpdateNotification(`You have successfully left the chat`, 2, 'done');
        this.logger.log('[WS-REQUESTS-MSGS] - LEAVE THE GROUP * COMPLETE');
        this.SHOW_CIRCULAR_SPINNER = false;
        this.LEAVE_CHAT_ERROR = false;
      });
  }

  closeLeaveChatModal() {
    this.displayLeaveChatModal = 'none'
  }

  closeLeavingChatInfoModal() {
    this.displayLeavingChatInfoModal = 'none';
  }

  // -------------------------------------------------------------
  // Toggle methods
  // -------------------------------------------------------------
  toggleShowAllClientString() {
    this.showAllClientString = !this.showAllClientString;
    this.logger.log('[WS-REQUESTS-MSGS] - SHOW ALL TEXT OF THE ATTRIBUTES > CLIENT ', this.showAllClientString)
  }

  toggleShowAllsenderAuthInfoString() {
    this.showAllsenderAuthInfoString = !this.showAllsenderAuthInfoString;
    this.logger.log('[WS-REQUESTS-MSGS] - SHOW ALL TEXT OF THE ATTRIBUTES > SENDER AUTH INFO ', this.showAllsenderAuthInfoString);
  }

  toggleShowAllSourcePageString() {
    this.showAllSourcePageString = !this.showAllSourcePageString;
    this.logger.log('[WS-REQUESTS-MSGS] - SHOW ALL TEXT OF THE ATTRIBUTES > SOURCR PAGE ', this.showAllSourcePageString);

    const sourcepageArrowIconElem = <HTMLElement>document.querySelector('#source_page_arrow_down');

    if (this.showAllSourcePageString === true) {
      sourcepageArrowIconElem.classList.add("up");
    }
    if (this.showAllSourcePageString === false) {
      sourcepageArrowIconElem.className = sourcepageArrowIconElem.className.replace(/\bup\b/g, "");
    }
  }

  toggleShowAllRequestId() {
    this.showAllIdRequest = !this.showAllIdRequest;
    this.logger.log('[WS-REQUESTS-MSGS] - SHOW ALL REQUEST ID ', this.showAllIdRequest);

    const requestIdArrowIconElem = <HTMLElement>document.querySelector('#request_id_arrow_down');
    // this.logger.log('SHOW ALL REQUEST ID requestIdArrowIconElem', this.showAllIdRequest);
    if (this.showAllIdRequest === true) {
      requestIdArrowIconElem.classList.add("up");
    }
    if (this.showAllIdRequest === false) {
      requestIdArrowIconElem.className = requestIdArrowIconElem.className.replace(/\bup\b/g, "");
    }
  }


  toggleShowAllString(elementAttributeValueId: any, elementArrowIconId: any, index) {
    this.logger.log(`[WS-REQUESTS-MSGS] - ATTRIBUTES toggleShowAllString - element Attribute Value Id:`, elementAttributeValueId);
    this.logger.log(`[WS-REQUESTS-MSGS] - ATTRIBUTES toggleShowAllString - element Arrow Icon id:`, elementArrowIconId);

    // -------------------------------------------------------------
    // get the element that contains the attribute's value
    // -------------------------------------------------------------
    const attributeValueElem = <HTMLElement>document.querySelector(`#${elementAttributeValueId}`);
    // this.logger.log(`[WS-REQUESTS-MSGS] ATTRIBUTES toggleShowAllString - attributeValueElem :`, attributeValueElem);
    // -------------------------------------------------------------
    // get the element arrow icon 
    // -------------------------------------------------------------
    const arrowIconElem = <HTMLElement>document.querySelector(`#${elementArrowIconId}`);
    // this.logger.log(`[WS-REQUESTS-MSGS] ATTRIBUTES toggleShowAllString - arrowIconElem :`, arrowIconElem);
    // -------------------------------------------------------------
    // get the value of aria-expanded
    // -------------------------------------------------------------
    let isAriaExpanded = attributeValueElem.getAttribute('aria-expanded')
    // this.logger.log(`[WS-REQUESTS-MSGS] ATTRIBUTES toggleShowAllString - element  isAriaExpanded:`, isAriaExpanded);

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

  // -----------------------------------------------------------------------------------------------------
  // @ goTo & Navigate
  // -----------------------------------------------------------------------------------------------------
  goBack() {
    this._location.back();
  }

  openTranscript() {
    const url = this.SERVER_BASE_PATH + 'public/requests/' + this.id_request + '/messages.html';
    this.logger.log('[WS-REQUESTS-MSGS] openTranscript url ', url);
    window.open(url, '_blank');
  }

  goToTags() {
    this.router.navigate(['project/' + this.id_project + '/labels']);
  }


  openChatAtSelectedConversation() {
    this.openChatBtn.nativeElement.blur();
    this.openChatToTheSelectedConversation(this.CHAT_BASE_URL, this.id_request, this.request.lead.fullname)
  }

  // openChatInNewWindow() {
  //   // RESOLVE THE BUG: THE BUTTON 'OPEN THE CHAT' REMAIN FOCUSED AFTER PRESSED
  //   this.openChatBtn.nativeElement.blur();

  //   this.logger.log('[WS-REQUESTS-MSGS] openChatInNewWindow CHAT_BASE_URL ', this.CHAT_BASE_URL);
  //   // let url = '';
  //   // if (this.FIREBASE_AUTH === false) {
  //   //   url = this.CHAT_BASE_URL + "/" + this.id_request + "/" + this.request.lead.fullname + "/active"
  //   // } else if (this.FIREBASE_AUTH === true)  {
  //   //   url = this.CHAT_BASE_URL + '?recipient=' + this.id_request;
  //   // } else {
  //   //   url = this.CHAT_BASE_URL + '#/conversation-detail/'+ this.id_request + "/" + this.request.lead.fullname + "/active"
  //   // }
  //   const url = this.CHAT_BASE_URL + '#/conversation-detail/' + this.id_request + "/" + this.request.lead.fullname + "/active"
  //   this.logger.log('[WS-REQUESTS-MSGS] openChatInNewWindow url ', url);
  //   window.open(url, '_blank');
  //   // this.openWindow('Tiledesk - Open Source Live Chat', url)
  //   // this.focusWin('Tiledesk - Open Source Live Chat')
  // }

  openWindow(winName: any, winURL: any) {
    const myWindows = new Array();
    if (myWindows[winName] && !myWindows[winName].closed) {
      alert('window already exists');
    } else {
      myWindows[winName] = window.open(winURL, winName);
    }
  }

  focusWin(winName: any) {
    const myWindows = new Array();
    if (myWindows[winName] && !myWindows[winName].closed) {
      myWindows[winName].focus();
    } else {
      // alert('cannot focus closed or nonexistant window');
      this.logger.log('[HOME] - cannot focus closed or nonexistant window');
    }
  }
  chatWithAgent(agentId, agentFirstname, agentLastname) {
    this.logger.log('[WS-REQUESTS-MSGS] - CHAT WITH AGENT - agentId: ', agentId, ' - agentFirstname: ', agentFirstname, ' - agentLastname: ', agentLastname);

    // https://support-pre.tiledesk.com/chat/index.html?recipient=5de9200d6722370017731969&recipientFullname=Nuovopre%20Pre
    // https://support-pre.tiledesk.com/chat/index.html?recipient=5dd278b8989ecd00174f9d6b&recipientFullname=Gian Burrasca

    // let _agentLastName = ''
    // if (agentLastname) {
    //   _agentLastName = agentLastname
    // }
    // const url = this.CHAT_BASE_URL + '?' + 'recipient=' + agentId + '&recipientFullname=' + agentFirstname + ' ' + _agentLastName;

    let agentFullname = ''
    if (agentLastname) {
      agentFullname = agentFirstname + ' ' + agentLastname
    } else {
      agentFullname = agentFirstname
    }
    // const url = this.CHAT_BASE_URL + '#/conversation-detail/' + agentId + '/' + agentFullname + '/new'
    // this.logger.log('[WS-REQUESTS-MSGS] - chatWithAgent - CHAT URL ', url);
    // window.open(url, '_blank');


    // ---- new

    let baseUrl = this.CHAT_BASE_URL + '#/conversation-detail/'
    let url = baseUrl + agentId + '/' + agentFullname + '/new'
    const myWindow = window.open(url, 'Tiledesk - Open Source Live Chat');
    myWindow.focus();


    // const chatTabCount = localStorage.getItem('tabCount')
    // console.log('[WS-REQUESTS-MSGS] chatWithAgent chatTabCount ', chatTabCount)
    // let url = ''
    // if (chatTabCount) {
    //   if (+chatTabCount > 0) {
    //     console.log('[WS-REQUESTS-MSGS]  chatWithAgent chatTabCount > 0 ')
    //     url = this.CHAT_BASE_URL + '#/conversation-detail?contact_id=' + agentId + '&contact_fullname=' + agentFullname
    //     this.openWindow('Tiledesk - Open Source Live Chat', url)
    //   } else if (chatTabCount && +chatTabCount === 0) {
    //     console.log('[WS-REQUESTS-MSGS]  chatWithAgent chatTabCount = 0 ')
    //     url = this.CHAT_BASE_URL + '#/conversation-detail/' + agentId + '/' + agentFullname + '/new'
    //     this.openWindow('Tiledesk - Open Source Live Chat', url)
    //   }
    // } else {
    //   url = this.CHAT_BASE_URL + '#/conversation-detail/' + agentId + '/' + agentFullname + '/new'
    //   this.openWindow('Tiledesk - Open Source Live Chat', url)
    // }

  }

  goToContactDetails() {
    this.router.navigate(['project/' + this.id_project + '/contact', this.contact_id]);
  }

  goToMemberProfile(member_id: any) {
    this.logger.log('[WS-REQUESTS-MSGS] - goToMemberProfile -has clicked GO To MEMBER ', member_id);

    if (this.CHAT_PANEL_MODE === false) {
      if (member_id.indexOf('bot_') !== -1) {
        this.logger.log('[WS-REQUESTS-MSGS] IS A BOT !');

        const id_bot = member_id.substring(4);
        // this.router.navigate(['project/' + this.id_project + '/botprofile/' + member_id]);
        const bot = this.botLocalDbService.getBotFromStorage(id_bot);
        this.logger.log('[WS-REQUESTS-MSGS] - goToMemberProfile - BOT FROM STORAGE ', bot)

        let botType = ''
        if (bot.type === 'internal') {
          botType = 'native'
        } else {
          botType = bot.type
        }

        if (this.CURRENT_USER_ROLE !== 'agent') {
          this.router.navigate(['project/' + this.id_project + '/bots', id_bot, botType]);
        }
      } else {
        // this.router.navigate(['project/' + this.id_project + '/member/' + member_id]);
        this.getProjectuserbyUseridAndGoToEditProjectuser(member_id);
      }
    }
  }


  getProjectuserbyUseridAndGoToEditProjectuser(member_id: string) {
    this.usersService.getProjectUserByUserId(member_id).subscribe((projectUser: any) => {
      this.logger.log('[WS-REQUESTS-MSGS] GET projectUser by USER-ID & GO TO EDIT PROJECT USER - projectUser', projectUser)
      if (projectUser) {
        this.logger.log('[WS-REQUESTS-MSGS] GET projectUser by USER-ID & GO TO EDIT PROJECT USER - projectUser id', projectUser[0]._id);

        this.router.navigate(['project/' + this.id_project + '/user/edit/' + projectUser[0]._id]);
      }
    }, (error) => {
      this.logger.error('[WS-REQUESTS-MSGS] GET projectUser by USER-ID & GO TO EDIT PROJECT USER - ERROR ', error);
    }, () => {
      this.logger.log('[WS-REQUESTS-MSGS] GET projectUser by USER-ID & GO TO EDIT PROJECT USER * COMPLETE *');
    });
  }

  // dispalyed only if CHAT_PANEL_MODE === true
  goToRequestInNewTab() {
    // target="_blank" routerLink="project/{{id_project}}/wsrequest/{{id_request}}/messages"
    const url = this.dshbrdBaseUrl + '/#/project/' + this.id_project + '/wsrequest/' + this.id_request + '/messages'
    window.open(url, '_blank');
  }

  goToProjectHomeInNewTab() {
    // target="_blank" routerLink="project/{{id_project}}/wsrequest/{{id_request}}/messages"
    const url = this.dshbrdBaseUrl + '/#/project/' + this.id_project + '/home'
    window.open(url, '_blank');
  }

  goToContactDetailsInNewTab() {
    // this.router.navigate(['project/' + this.id_project + '/contact', this.contact_id]);
    if (this.NODEJS_REQUEST_CNTCT_FOUND === true) {
      const url = this.dshbrdBaseUrl + '/#/project/' + this.id_project + '/contact/' + this.contact_id
      window.open(url, '_blank');
    }
  }

  goToEvents() {
    if (this.request.requester) {
      this.router.navigate(['project/' + this.id_project + '/events/', this.request.requester.id]);
    }
  }

  // ----------------------------------
  // No used
  // ----------------------------------
  // openUserList() {
  //   this.router.navigate(['project/' + this.id_project + '/userslist']);
  // }

  // ----------------------------------
  // No used
  // ----------------------------------
  disableMainPanelScroll() {
    let elMainPanel = <HTMLElement>document.querySelector('.main-panel');
    elMainPanel.setAttribute('style', 'overflow-anchor: none;');
    //   this.main_panel_scrolltop = elMainPanel.scrollTop;
    //   this.logger.log('% Ws-REQUESTS-Msgs - note-wf - onInit elMainPanel scrollTop: ', this.main_panel_scrolltop);

    //  let el_ws_msgs_note__textarea = <HTMLElement>document.querySelector('.ws_msgs_note__textarea');
    //  this.logger.log('% Ws-REQUESTS-Msgs - note-wf - onInit el_ws_msgs_note__textarea: ', el_ws_msgs_note__textarea.scrollTop);

    //  this.topPos = el_ws_msgs_note__textarea.getBoundingClientRect().top + window.scrollY;
    //  this.logger.log('% Ws-REQUESTS-Msgs - note-wf - onInit el_ws_msgs_note__textarea topPos: ', this.topPos);


    // let scrollbarWidth =  elMainPanel.scrollWidth - elMainPanel.clientWidth;
    // this.logger.log('% Ws-REQUESTS-Msgs - note-wf - onInit elMainPanel scrollbarWidth elMainPanel: ', scrollbarWidth);

    let elBody = <HTMLElement>document.querySelector('body');
    // this.logger.log('% Ws-REQUESTS-Msgs - note-wf - onInit elBody: ', elBody);
    // elBody.setAttribute('style', 'overflow-anchor: none;');


    // let scrollbarWidthb =  elBody.scrollWidth - elBody.clientWidth;
    // this.logger.log('% Ws-REQUESTS-Msgs - note-wf - onInit elMainPanel scrollbarWidthb elBody: ', scrollbarWidthb);
  }

  // ----------------------------------
  // No used
  // ----------------------------------
  enableMainPanelScroll() {
    let elMainPanel = <HTMLElement>document.querySelector('.main-panel');
    this.logger.log('% Ws-REQUESTS-Msgs - note-wf - completed add note - elMainPanel: ', elMainPanel);
    // elMainPanel.style.overflow-x = 'overflow-x: hidden !important';
    // elMainPanel.setAttribute('style', 'overflow-x: hidden !important;');
    this.logger.log('% Ws-REQUESTS-Msgs - note-wf - enableMainPanelScroll elMainPanel scrollTop: ', this.main_panel_scrolltop);
    // elMainPanel.scrollTop = this.main_panel_scrolltop

    elMainPanel.scrollIntoView()
    // elMainPanel.scrollTop = this.topPos
  }



  // -----------------------------------------------
  // @ Translate strings
  // -----------------------------------------------
  translateNotificationMsgs() {
    this.translate.get('Tags.NotificationMsgs')
      .subscribe((translation: any) => {
        // this.logger.log('% »»» WebSocketJs WF >>> ws-m  translateNotificationMsgs text', translation)
        this.create_label_success = translation.AddLabelSuccess;
        this.create_label_error = translation.AddLabelError;
        this.delete_label_success = translation.DeleteLabelSuccess;
        this.delete_label_error = translation.DeleteLabelError;
      });

    this.translate.get('Notes.NotificationMsgs')
      .subscribe((translation: any) => {
        // this.logger.log('% »»» WebSocketJs WF >>> ws-m  translateNotificationMsgs text', translation)
        this.create_note_success = translation.CreateNoteSuccess;
        this.create_note_error = translation.CreateNoteError;
        this.delete_note_success = translation.DeleteNoteSuccess;
        this.delete_note_error = translation.DeleteNoteError;
      });

    this.translate.get('Processing')
      .subscribe((translation: any) => {
        // this.logger.log('% »»» WebSocketJs WF >>> ws-m  translateNotificationMsgs text', translation)
        this.notifyProcessingMsg = translation;
      });

    this.translate.get('TheRequestHasBeenMovedToHistory')
      .subscribe((translation: any) => {
        // this.logger.log('% »»» WebSocketJs WF >>> ws-m  translateNotificationMsgs text', translation)
        this.request_archived_msg = translation;
      });

    this.translate.get('AnErrorHasOccurredArchivingTheRequest')
      .subscribe((translation: any) => {
        // this.logger.log('% »»» WebSocketJs WF >>> ws-m  translateNotificationMsgs text', translation)
        this.request_archived_err_msg = translation;
      });


    this.translate.get('ArchivingRequestNoticationMsg')
      .subscribe((text: string) => {
        this.archivingRequestNoticationMsg = text;
        // this.logger.log('+ + + ArchivingRequestNoticationMsg', text)
      });

    this.translate.get('RequestSuccessfullyClosed')
      .subscribe((text: string) => {
        this.requestHasBeenArchivedNoticationMsg_part1 = text;
        // this.logger.log('+ + + RequestHasBeenArchivedNoticationMsg_part1', text)
      });


    this.translate.get('VisitorsPage.ReassignRequest')
      .subscribe((text: string) => {
        this.reassignRequestMsg = text;

      });

    this.translate.get('VisitorsPage.TheRequestWillBeReassignedTo')
      .subscribe((text: string) => {
        this.requestWillBeReassignedToMsg = text;

      });

    this.translate.get('VisitorsPage.AddAgent')
      .subscribe((text: string) => {
        this.addAgentMsg = text;

      });

    this.translate.get('VisitorsPage.TheRequestWillBeAssignedTo')
      .subscribe((text: string) => {
        this.requestWillBeAssignedToMsg = text;

      });

    this.translate.get('UserEditAddPage.AnErrorHasOccurred')
      .subscribe((text: string) => {
        this.anErrorHasOccurredMsg = text;
      });

    this.translate.get('Done')
      .subscribe((text: string) => {
        this.done_msg = text;
      });

    this.translate.get('TheConversationPriorityHasBeenSuccessfullyUpdated')
      .subscribe((text: string) => {
        this.priority_updated_successfully_msg = text;
      });

    this.translate.get('AnErrorOccurredWhileUpdatingTheCnversationPriority')
      .subscribe((text: string) => {
        this.priority_update_failed = text;
      });
  }


  // NO MORE USED - REPLACED BY getProjectUsersAndBots
  // ------------------------------------------------------------------------------------------------------------------------
  // @ Get all project's Agents (i.e., project-users) - called when the user open the SelectUsersModal (openSelectUsersModal)
  // ------------------------------------------------------------------------------------------------------------------------
  // getAllUsersOfCurrentProject() {
  //   this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
  //     this.logger.log('%%% Ws-REQUESTS-Msgs - PROJECT USERS (FILTERED FOR PROJECT ID)', projectUsers);

  //     this.projectUsersList = projectUsers;

  //     this.projectUsersList.forEach(projectUser => {

  //       projectUser['is_joined_to_request'] = this.currentUserIdIsInParticipants(this.request.participants, projectUser.id_user._id, this.request.request_id);
  //       this.logger.log('%%% Ws-REQUESTS-Msgs - PROJECT USERS ID', projectUser.id_user._id, ' is JOINED ', projectUser['is_joined_to_request']);
  //     });

  //   }, error => {
  //     this.showSpinner_inModalUserList = false;
  //     this.logger.error('%%% Ws-REQUESTS-Msgs - PROJECT USERS (FILTERED FOR PROJECT ID) - ERROR', error);
  //   }, () => {
  //     this.showSpinner_inModalUserList = false;
  //     this.logger.log('%%% Ws-REQUESTS-Msgs - PROJECT USERS (FILTERED FOR PROJECT ID) - COMPLETE');
  //   });
  // }


  // assignRequest(userid_selected) {
  //   this.logger.log('%%% Ws-REQUESTS-Msgs - ASSIGN REQUEST TO USER ID ', userid_selected);
  //   this.displayConfirmReassignmentModal = 'none';
  //   this.displayUsersListModal = 'none'
  //   this.joinAnotherAgent(userid_selected);
  // }


  /// new RIASSIGN REQUEST
  // joinAnotherAgentLeaveCurrentAgents(userid_selected) {
  //   // this.getFirebaseToken(() => {
  //   this.wsRequestsService.setParticipants(this.id_request, userid_selected)
  //     .subscribe((joinToGroupRes: any) => {

  //       this.logger.log('%%% Ws-REQUESTS-Msgs - RIASSIGN REQUEST - JOIN ANOTHER USER TO CHAT GROUP ', joinToGroupRes);

  //     }, (err) => {
  //       this.logger.error('%%% Ws-REQUESTS-Msgs - RIASSIGN REQUEST - JOIN ANOTHER USER TO CHAT GROUP - ERROR ', err);

  //       //  NOTIFY ERROR 
  //       this.notify.showNotification('An error has occurred assigning the request', 4, 'report_problem')
  //     }, () => {
  //       this.logger.log('%%% Ws-REQUESTS-Msgs- RIASSIGN REQUEST - JOIN ANOTHER USER TO CHAT GROUP - COMPLETE');

  //       //  NOTIFY SUCCESS
  //       this.notify.showNotification(`request reassigned to ${this.userfirstname_selected}  ${this.userlastname_selected}`, 2, 'done');

  //     });
  // }

  // end new

  // -----------------------------------------------------------------------------------------
  // Add Agent
  // -----------------------------------------------------------------------------------------
  // joinAnotherAgent(userid_selected) {
  //   this.logger.log('%%% Ws-REQUESTS-Msgs - ASSIGN REQUEST - USER ID SELECTED ', userid_selected);
  //   // this.getFirebaseToken(() => {

  //   this.wsRequestsService.addParticipant(this.id_request, userid_selected)
  //     .subscribe((joinToGroupRes: any) => {

  //       this.logger.log('%%% Ws-REQUESTS-Msgs - ASSIGN REQUEST - JOIN ANOTHER USER TO CHAT GROUP ', joinToGroupRes);

  //     }, (err) => {
  //       this.logger.error('%%% Ws-REQUESTS-Msgs - ASSIGN REQUEST - JOIN ANOTHER USER TO CHAT GROUP - ERROR ', err);

  //       //  NOTIFY ERROR 
  //       this.notify.showNotification('An error has occurred assigning the request', 4, 'report_problem')
  //     }, () => {
  //       this.logger.log('%%% Ws-REQUESTS-Msgs - ASSIGN REQUEST - JOIN ANOTHER USER TO CHAT GROUP - COMPLETE');

  //       //  NOTIFY SUCCESS
  //       this.notify.showNotification(`request assigned to ${this.userfirstname_selected}  ${this.userlastname_selected}`, 2, 'done');

  //     });
  //   // });
  // }

  // ARCHIVE REQUEST - OPEN THE POPUP !!! NO MORE USED
  // openArchiveRequestModal(request_recipient: string) {
  //   this.logger.log('%%% Ws-REQUESTS-Msgs - ID OF REQUEST TO ARCHIVE ', request_recipient)
  //   this.id_request_to_archive = request_recipient;
  //   this.displayArchiveRequestModal = 'block'
  // }

  // // MODAL ArchiveRequest !!! NO MORE USED
  // onCloseArchiveRequestModal() {
  //   this.displayArchiveRequestModal = 'none'
  // }

  // onCloseArchivingInfoModal() {
  //   this.displayArchivingInfoModal = 'none'
  // }



  // archiveTheRequestHandler() {
  //   this.logger.log('%%% Ws-REQUESTS-Msgs - HAS CLICKED ARCHIVE REQUEST archiveTheRequestHandler');

  //   this.displayArchiveRequestModal = 'none';

  //   this.SHOW_CIRCULAR_SPINNER = true;

  //   this.displayArchivingInfoModal = 'block'

  //   this.wsRequestsService.closeSupportGroup(this.id_request_to_archive)
  //     .subscribe((data: any) => {
  //       this.logger.log('%%% Ws-REQUESTS-Msgs - CLOSE SUPPORT GROUP - DATA ', data);
  //     },
  //       (err) => {
  //         this.logger.error('%%% Ws-REQUESTS-Msgs - CLOSE SUPPORT GROUP - ERROR ', err);
  //         this.SHOW_CIRCULAR_SPINNER = false;
  //         this.ARCHIVE_REQUEST_ERROR = true;
  //         //  NOTIFY ERROR 
  //         // tslint:disable-next-line:quotemark
  //         this.notify.showNotification(this.request_archived_err_msg, 4, 'report_problem')
  //       },
  //       () => {
  //         // this.ngOnInit();
  //         this.logger.log('%%% Ws-REQUESTS-Msgs - CLOSE SUPPORT GROUP - COMPLETE');
  //         this.SHOW_CIRCULAR_SPINNER = false;
  //         this.ARCHIVE_REQUEST_ERROR = false;

  //         //  NOTIFY SUCCESS
  //         // with id: ${this.id_request_to_archive}
  //         this.notify.showNotification(this.request_archived_msg, 2, 'done');
  //       });

  // }

  // closeConfirmReassignmentModal() {
  //   this.displayConfirmReassignmentModal = 'none'
  // }

  // closeDeptConfirmReassignmentModal() {
  //   this.displayDeptConfirmReassignmentModal = 'none'
  // }

  // verifyImageURL(image_url, callBack) {
  //   const img = new Image();
  //   img.src = image_url;
  //   img.onload = function () {
  //     callBack(true);
  //   };
  //   img.onerror = function () {
  //     callBack(false);
  //   };
  // }

  // NOT USED (was used for tag)
  //  stringToColour(tag: string) {
  //   // var hash = 0;
  //   // for (var i = 0; i < str.length; i++) {
  //   //   hash = str.charCodeAt(i) + ((hash << 5) - hash);
  //   // }
  //   // var colour = '#';
  //   // for (var i = 0; i < 3; i++) {
  //   //   var value = (hash >> (i * 8)) & 0xFF;
  //   //   colour += ('00' + value.toString(16)).substr(-2);
  //   // }
  //   // return colour;

  //   const tagColor = ['#FF5C55', '#F89D34', '#F3C835', '#66C549', '#43B1F2', '#CB80DD'];
  //   let num = 0;
  //   if (tag) {

  //     const code = tag.charCodeAt(0) + tag.charCodeAt(1);
  //     // this.logger.log('% Ws-REQUESTS-Msgs - tag-wf - stringToColour - code',code);
  //     num = Math.round(code % tagColor.length);

  //   }
  //   // this.logger.log('% Ws-REQUESTS-Msgs - tag-wf - stringToColour - tagColor[num]', arrayBckColor[num]);
  //   return tagColor[num];

  // }

  // !!!! No more used
  // presentModalDeleteNote(note_id) {
  //   this.id_note_to_delete = note_id
  //   this.displayModalDeleteNote = 'block'
  // }

  // !!!! No more used
  // closeModalDeleteNote() {
  //   this.displayModalDeleteNote = 'none'
  // }

}
