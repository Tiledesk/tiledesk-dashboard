
import { Component, OnInit, OnDestroy, AfterViewInit, NgZone, ViewChild, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { WsRequestsService } from '../../../services/websocket/ws-requests.service';
import { LocalDbService } from '../../../services/users-local-db.service';
import { BotLocalDbService } from '../../../services/bot-local-db.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { avatarPlaceholder, getColorBck } from '../../../utils/util';
import { NotifyService } from '../../../core/notify.service';
import { TranslateService } from '@ngx-translate/core';
import { WsSharedComponent } from '../../ws-shared/ws-shared.component';
import { Request } from '../../../models/request-model';
import { UsersService } from '../../../services/users.service';
import { UAParser } from 'ua-parser-js'
import { FaqKbService } from '../../../services/faq-kb.service';
import { AppConfigService } from '../../../services/app-config.service';
import { Subscription } from 'rxjs'
import PerfectScrollbar from 'perfect-scrollbar';
import { DepartmentService } from '../../../services/department.service';

import { Subject } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators'

import { browserRefresh } from '../../../app.component';
import { Location } from '@angular/common';
// import { fadeInAnimation } from '../../../_animations/index';
const swal = require('sweetalert');
import { ContactsService } from '../../../services/contacts.service';
import { LoggerService } from '../../../services/logger/logger.service';
import { WebSocketJs } from 'app/services/websocket/websocket-js';

@Component({
  selector: 'appdashboard-ws-requests-unserved-for-panel',
  templateUrl: './ws-requests-unserved-for-panel.component.html',
  styleUrls: ['./ws-requests-unserved-for-panel.component.scss']
  // animations: [fadeInAnimation],
  // tslint:disable-next-line:use-host-property-decorator
  // host: { '[@fadeInAnimation]': '' }
})
export class WsRequestsUnservedForPanelComponent extends WsSharedComponent implements OnInit, AfterViewInit, OnDestroy {

  CHAT_BASE_URL: string;

  // used to unsuscribe from behaviour subject
  private unsubscribe$: Subject<any> = new Subject<any>();

  // @ViewChild('teamContent', { read: ElementRef }) public teamContent: ElementRef<any>;
  @ViewChild('teamContent', { static: false })  teamContent: ElementRef;
  @ViewChild('testwidgetbtn', { static: false })  testwidgetbtnRef: ElementRef;


  wsRequestsUnserved: any;
  wsRequestsServed: any;
  ws_requests: any;
  projectId: string;
  zone: NgZone;
  SHOW_SIMULATE_REQUEST_BTN = false;
  showSpinner = true;
  firebase_token: any;
  currentUserID: string;
  ONLY_MY_REQUESTS: boolean = true;
  ROLE_IS_AGENT: boolean;
  // displayBtnLabelSeeYourRequets = false;

  totalRequests: any;
  i = 0
  Xlength: number

  user_and_bot_array = [];
  team_ids_array = [];

  seeAll: any;
  subscription: Subscription;
  storageBucket: string;
  baseUrl: string;
  imageStorage: string;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;

  departments: any;
  selectedDeptId: string;
  selectedAgentId: string;
  TESTSITE_BASE_URL: string;
  projectName: string;
  projectNameFirstLetter: any;

  deptsArrayBuildFromRequests: any;

  filter: any[] = [{ 'deptId': null }, { 'agentId': null }];
  hasFiltered = false;
  public browserRefresh: boolean;
  displayInternalRequestModal = 'none';
  internalRequest_subject: string;
  internalRequest_deptId: string;
  internalRequest_message: string;
  showSpinner_createInternalRequest = false;
  hasClickedCreateNewInternalRequest = false;
  createNewInternalRequest_hasError: boolean;
  internal_request_id: string;
  deptIdSelectedInRequuestsXDepts
  ws_requestslist_deptIdSelected: string
  display_dept_sidebar = false;

  archivingRequestNoticationMsg: string;
  archivingRequestErrorNoticationMsg: string;
  requestHasBeenArchivedNoticationMsg_part1: string;
  requestHasBeenArchivedNoticationMsg_part2: string;
  OPEN_REQUEST_DETAILS: boolean = false;
  selectedRequest: any;

  SHOW_NO_REQUEST_MSG: boolean
  USER_ROLE: string;
  join_polling: any
  archive_polling: any
  /**
   * 
   * @param wsRequestsService 
   * @param router 
   * @param usersLocalDbService 
   * @param botLocalDbService 
   * @param auth 
   * @param translate 
   * @param usersService 
   * @param faqKbService 
   * @param appConfigService 
   * @param departmentService 
   * @param notify 
   * @param location 
   * @param cdref 
   * @param contactsService 
   * @param logger 
   */
  constructor(
    public wsRequestsService: WsRequestsService,
    public router: Router,
    public usersLocalDbService: LocalDbService,
    public botLocalDbService: BotLocalDbService,
    public auth: AuthService,
    public translate: TranslateService,
    public usersService: UsersService,
    public faqKbService: FaqKbService,
    public appConfigService: AppConfigService,
    private departmentService: DepartmentService,
    public notify: NotifyService,
    public location: Location,
    private cdref: ChangeDetectorRef,
    public contactsService: ContactsService,
    public logger: LoggerService,
    public webSocketJs: WebSocketJs

  ) {
    super(botLocalDbService, usersLocalDbService, router, wsRequestsService, faqKbService, usersService, notify, logger, translate);
    this.zone = new NgZone({ enableLongStackTrace: false });
    // this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] !!!!')
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit() {

    this.getImageStorage();
    this.detectBrowserRefresh();
    this.getCurrentProject();
    this.getLoggedUser();
    this.getTranslations();
    this.setPerfectScrollbar();
    
    this.getUserRole();
  }


 

  ngAfterViewInit() {
    this.getProjectUserRole();
    this.cdref.detectChanges();
    // window.top.postMessage('finished', '*')
    this.listenToParentPostMessage();
  }

  ngOnDestroy() {
    this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - ngOnDestroy')
    if (this.subscription) {
      this.subscription.unsubscribe()
    }

    if (this.wsRequestsUnserved) {
      this.wsRequestsUnserved.forEach(request => {

        this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - ngOnDestroy request', request)
        if (request && request.lead) {
          this.unsuscribeRequesterPresence(request.lead.lead_id)
        }
      });
    }

    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

 

  getUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((userRole) => {
        this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - SUBSCRIPTION TO USER ROLE »»» ', userRole)
        this.USER_ROLE = userRole;
      })
  }

  // ------------------------------------------
  // Join request
  // ------------------------------------------
  joinRequest(request_id: string) {
    this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] JOIN-REQUEST request_id', request_id, ' - CURRENT-USER-ID ', this.currentUserID);

    const msg = { action: 'openJoinConversationModal', parameter: request_id, calledBy: 'ws_unserved_for_panel' }
    window.parent.postMessage(msg, '*')
    // this.onJoinHandled(request_id, this.currentUserID);

    // ------------------------
    // For test
    // ------------------------
    // this.onJoinHandledinWsRequestsUnsevedForPanel(request_id, this.currentUserID);
  }

  listenToParentPostMessage() {
    window.addEventListener("message", (event) => {
      this.logger.log("[WS-REQUESTS-UNSERVED-X-PANEL] message event ", event);

      if (event && event.data && event.data.action && event.data.parameter && event.data.calledBy) {
        if (event.data.action === 'joinConversation' && event.data.calledBy === 'ws_unserved_for_panel') {
          this.logger.log("[WS-REQUESTS-UNSERVED-X-PANEL] message event ", event.data.action);
          this.logger.log("[WS-REQUESTS-UNSERVED-X-PANEL] message parameter ", event.data.parameter);
          this.logger.log("[WS-REQUESTS-UNSERVED-X-PANEL] currentUserID ", this.currentUserID);
          this.onJoinHandledinWsRequestsUnsevedForPanel(event.data.parameter, this.currentUserID, "postMessage");
        }

        // if (event.data.action === 'hasArchived' && event.data.calledBy === 'ws_unserved_for_panel') {
        //   console.log("[WS-REQUESTS-UNSERVED-X-PANEL] message event ", event.data.action);
        //   console.log("[WS-REQUESTS-UNSERVED-X-PANEL] message parameter ", event.data.parameter);
        //   console.log("[WS-REQUESTS-UNSERVED-X-PANEL] currentUserID ", this.currentUserID);
        // }
      }
      // && window['tiledesk_widget_hide']
      if (event && event.data && event.data.action && event.data.calledBy) {
        if (event.data.action === "hidewidget" && event.data.calledBy === "unassigned-convs") {
          try {
            if (window &&  window['Tiledesk'] ) {
              this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - HIDE WIDGET - HERE 1')
              // setTimeout(() => {
                // window['Tiledesk']('hide');
                // window['tiledesk_widget_hide']();
              // }, 1500);
              window['Tiledesk']('onLoadParams', (event_data) => {
                this.logger.log("[WS-REQUESTS-UNSERVED-X-PANEL] onLoadParams Initialized!");
               
                window['Tiledesk']('setParameter', { key: 'autoStart', value: false })
                window['tiledesk_widget_hide']();
                this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL]  window[Tiledesk]' ,  window['Tiledesk'] )
                // customAuth((token) => {
                //     if (token) {
                //         window.tiledesk.signInWithCustomToken(token);
                //     }
                //     else {
                //         console.log("No user found.");
                //     }
                // });
              });

            }
          } catch (e) {
            this.logger.error('[WS-REQUESTS-UNSERVED-X-PANEL] tiledesk_widget_hide ERROR', e)
          }
        }
      }

      // const msg = { action: "hidewidget", calledBy: 'unassigned-convs' }
    })
  }



  onJoinHandledinWsRequestsUnsevedForPanel(id_request: string, currentUserID: string, postmessage?: string) {
    // this.getFirebaseToken(() => {
    // console.log('[WS-SHARED] - onJoinHandled postmessage ', postmessage)
    this.logger.log('[WS-SHARED][REQUEST-DTLS-X-PANEL][WS-REQUESTS-UNSERVED-X-PANEL][WS-REQUESTS-LIST][SERVED][UNSERVED] - JOIN PRESSED');
    this.logger.log('[WS-SHARED][REQUEST-DTLS-X-PANEL][WS-REQUESTS-UNSERVED-X-PANEL][WS-REQUESTS-LIST][SERVED][UNSERVED] - JOIN PRESSED postmessage', postmessage);
    this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] JOIN waiting for service-worker to be ready - current state', this.webSocketJs.ws.readyState)
    // this.join_polling = setInterval(() => {
    // if (this.webSocketJs.ws.readyState === 1) {
    //   if (this.webSocketJs.ws.readyState === 1) {
    //     clearInterval(this.join_polling);
    //   }
    this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] JOIN service-worker is ready ', this.webSocketJs.ws.readyState, ' - run ADD PARTCIPANT')
    this.wsRequestsService.addParticipant(id_request, currentUserID)
      .subscribe((data: any) => {

        // console.log('[WS-SHARED] - onJoinHandled data ', data)
        this.logger.log('[WS-SHARED][REQUEST-DTLS-X-PANEL][WS-REQUESTS-UNSERVED-X-PANEL][WS-REQUESTS-LIST][SERVED][UNSERVED] - addParticipant TO CHAT GROUP ', data);
      }, (err) => {
        this.logger.error('[WS-SHARED][REQUEST-DTLS-X-PANEL][WS-REQUESTS-UNSERVED-X-PANEL][WS-REQUESTS-LIST][SERVED][UNSERVED] - addParticipant TO CHAT GROUP - ERROR ', err);

      }, () => {
        this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] JOIN  * COMPLETE *')

        this.logger.log('[WS-SHARED][REQUEST-DTLS-X-PANEL][WS-REQUESTS-UNSERVED-X-PANEL][WS-REQUESTS-LIST][SERVED][UNSERVED] - addParticipant TO CHAT GROUP * COMPLETE *');
        if (postmessage === undefined) {
          this.getTranslationsDisplayInAppNotification()

        } else {

          this.getTranslationsAndPostMessage()
        }
      });
    // }
    // }, 100);
  }


  archiveRequest(request_id) {
    // this.notify.showArchivingRequestNotification(this.archivingRequestNoticationMsg);
    this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - HAS CLICKED ARCHIVE REQUEST ');

    // this.archive_polling = setInterval(() => {
    // if (this.webSocketJs.ws.readyState === 1) {
    //   if (this.webSocketJs.ws.readyState === 1) {
    //     clearInterval(this.archive_polling);
    //   }
    this._closeSupportGroup(request_id)
    //   }
    // }, 100);
  }

  _closeSupportGroup(request_id,) {
    this.wsRequestsService.closeSupportGroup(request_id)
      .subscribe((data: any) => {
        this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - CLOSE SUPPORT GROUP - RES ', data);
      }, (err) => {
        this.logger.error('[WS-REQUESTS-UNSERVED-X-PANEL] - CLOSE SUPPORT GROUP - ERROR ', err);
      }, () => {
        this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL]- CLOSE SUPPORT GROUP * COMPLETE *');
        // ---------------------------------------
        // POST TO PARENT
        // ---------------------------------------
        // const msg = { action: 'hasArchived', parameter: request_id, calledBy: 'ws_unserved_for_panel' }
        // window.top.postMessage(msg, '*')

      });
  }




  unsuscribeRequesterPresence(requester_id) {
    this.wsRequestsService.unsubscribeToWS_RequesterPresence(requester_id);
  }

  setPerfectScrollbar() {
    const container_projects_for_panel = <HTMLElement>document.querySelector('.main-content-projects-for-panel');
    this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] setPerfectScrollbar main-content-projects-for-panel', container_projects_for_panel);
    let ps = new PerfectScrollbar(container_projects_for_panel, {
      suppressScrollX: true
    });
  }

  displayDetails(request) {
    this.OPEN_REQUEST_DETAILS = true;
    this.selectedRequest = request
    this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - displayDetails OPEN_REQUEST_DETAILS? ', this.OPEN_REQUEST_DETAILS, 'SELECTED REQUEST ', this.selectedRequest);
  }

  handleCloseRightSidebar(event) {
    this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] IS OPEN RIGHT SIDEBAR event', event);
    this.OPEN_REQUEST_DETAILS = event;
  }

  getTranslations() {
    this.translateArchivingRequestErrorMsg();
    this.translateArchivingRequestMsg();
    this.translateRequestHasBeenArchivedNoticationMsg_part1();
    this.translateRequestHasBeenArchivedNoticationMsg_part2();

  }

  // TRANSLATION
  translateArchivingRequestMsg() {
    this.translate.get('ArchivingRequestNoticationMsg')
      .subscribe((text: string) => {
        this.archivingRequestNoticationMsg = text;
        // this.logger.log('+ + + ArchivingRequestNoticationMsg', text)
      });
  }

  // TRANSLATION
  translateArchivingRequestErrorMsg() {
    this.translate.get('ArchivingRequestErrorNoticationMsg')
      .subscribe((text: string) => {

        this.archivingRequestErrorNoticationMsg = text;
        // this.logger.log('+ + + ArchivingRequestErrorNoticationMsg', text)
      });
  }

  // TRANSLATION
  translateRequestHasBeenArchivedNoticationMsg_part1() {
    // this.translate.get('RequestHasBeenArchivedNoticationMsg_part1')
    this.translate.get('RequestSuccessfullyClosed')
      .subscribe((text: string) => {
        this.requestHasBeenArchivedNoticationMsg_part1 = text;
        // this.logger.log('+ + + RequestHasBeenArchivedNoticationMsg_part1', text)
      });
  }

  // TRANSLATION
  translateRequestHasBeenArchivedNoticationMsg_part2() {
    this.translate.get('RequestHasBeenArchivedNoticationMsg_part2')
      .subscribe((text: string) => {
        this.requestHasBeenArchivedNoticationMsg_part2 = text;
        // this.logger.log('+ + + RequestHasBeenArchivedNoticationMsg_part2', text)
      });
  }

  detectBrowserRefresh() {
    this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - CALLING browserRefresh')
    this.browserRefresh = browserRefresh;

    if (this.browserRefresh) {

      this.listenToRequestsLength();
    } else {
      this.wsRequestsService.wsRequestsList$.value
    }
  }

  getProjectUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user_role) => {
        this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - GET PROJECT-USER ROLE user_role ', user_role);

        this.ONLY_MY_REQUESTS = true
        this.getWsRequests$();
        // if (user_role) {
        //   if (user_role === 'agent') {
        //     this.ROLE_IS_AGENT = true
        //     // this.displayBtnLabelSeeYourRequets = true
        //     // ------ 
        //     this.ONLY_MY_REQUESTS = true
        //     this.getWsRequests$();
        //   } else {
        //     this.ROLE_IS_AGENT = false
        //     // this.displayBtnLabelSeeYourRequets = false;
        //     this.getWsRequests$();
        //   }
        // }
      });
  }


  getImageStorage() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.imageStorage = this.storageBucket;
      this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] IMAGE STORAGE ', this.storageBucket, 'usecase firebase')
    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;
      this.imageStorage = this.baseUrl;
      this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] IMAGE STORAGE ', this.baseUrl, 'usecase native')
    }

  }

  listenToRequestsLength() {
    this.subscription = this.wsRequestsService.ws_All_RequestsLength$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((totalrequests: number) => {
        this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - listenToRequestsLength RECEIVED NEXT wsRequestsList LENGTH', totalrequests)

        if (totalrequests === 0) {
          this.SHOW_SIMULATE_REQUEST_BTN = true
      
          this.showSpinner = false;
          this.SHOW_NO_REQUEST_MSG = true
          this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - listenToRequestsLength SHOW_SIMULATE_REQUEST_BTN ', this.SHOW_SIMULATE_REQUEST_BTN)
          this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - listenToRequestsLength showSpinner ', this.showSpinner)

        } else if (totalrequests > 0) {

          this.showSpinner = false;
          this.SHOW_NO_REQUEST_MSG = false;
          this.SHOW_SIMULATE_REQUEST_BTN = false
          this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - listenToRequestsLength SHOW_SIMULATE_REQUEST_BTN ', this.SHOW_SIMULATE_REQUEST_BTN)
          this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - listenToRequestsLength showSpinner ', this.showSpinner)
        }
      })
  }

  public generateFake(count: number): Array<number> {
    const indexes = [];
    for (let i = 0; i < count; i++) {
      indexes.push(i);
    }
    return indexes;
  }

  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - GET CURRENT USER ', user)
      // this.user = user;
      if (user) {
        this.currentUserID = user._id
        this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - GET CURRENT USER > currentUser ID', this.currentUserID);
      }
    });
  }


  // -----------------------------------------------------------------------------------------------------
  // @ Subscribe to get the published current project (called On init)
  // -----------------------------------------------------------------------------------------------------
  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - GET CURRENT PRJCT - project', project)
      if (project) {
        this.projectNameFirstLetter = project.name.charAt(0)
        this.projectId = project._id;
        this.projectName = project.name;
      }
    });
  }

  parseUserAgent(uastring) {
    // https://github.com/faisalman/ua-parser-js
    var parser = new UAParser();
    parser.setUA(uastring);
    return parser.getResult();
  }

  hasmeInAgents(agents, wsrequest) {
    if (agents) {
      for (let j = 0; j < agents.length; j++) {

        this.logger.log("[WS-REQUESTS-UNSERVED-X-PANEL] - hasmeInAgents currentUserID 2 ", this.currentUserID, " - THE REQUEST ", wsrequest);

        if (this.currentUserID === agents[j].id_user) {
          return true;
        }
      }
    }
  }

  // this check fix the bug: the request is assigned to a agent or admin od the dept A 
  // the the same requets is reassigned to an agent or admin of the dept B
  // the agent or admin doesn't see the request
  hasmeInParticipants(participants) {
    let iAmThere = false
    participants.forEach(participant => {
      this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - hasmeInParticipants  participant', participant)
      if (participant === this.currentUserID) {

        iAmThere = true;
        return
      }
    });
    this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - hasmeInParticipants', iAmThere);
    return iAmThere;
  }



  // -----------------------------------------------------------------------------------------------------
  // @ Subscribe to get the published requests (called On init)
  // -----------------------------------------------------------------------------------------------------
  getWsRequests$() {

    this.wsRequestsService.wsRequestsList$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .pipe(skip(1))
      .subscribe((wsrequests) => {
        this.logger.log("[WS-REQUESTS-UNSERVED-X-PANEL] - subscribe getWsRequests$", wsrequests);
        if (wsrequests) {
          this.addDeptObject(wsrequests)

          this.logger.log("[WS-REQUESTS-UNSERVED-X-PANEL] - subscribe > if (wsrequests) ", wsrequests);
          this.browserRefresh = browserRefresh;

          if ((this.browserRefresh === false) || (this.browserRefresh === true && this.wsRequestsService.wsRequestsList$.value.length > 0)) {
            if (wsrequests.length > 0) {

              this.SHOW_SIMULATE_REQUEST_BTN = false;
              this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - SHOW_SIMULATE_REQUEST_BTN ', this.SHOW_SIMULATE_REQUEST_BTN)
              this.showSpinner = false;
              this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - SHOW_SPINNER ', this.showSpinner)


            } else if (wsrequests.length === 0) {
              this.SHOW_SIMULATE_REQUEST_BTN = true;
              this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - SHOW_SIMULATE_REQUEST_BTN ', this.SHOW_SIMULATE_REQUEST_BTN)
              this.showSpinner = false;
              this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - SHOW_SPINNER ', this.showSpinner)
            }
          }

          if (this.ONLY_MY_REQUESTS === false) {
            this.ws_requests = wsrequests;
          }

          if (this.ONLY_MY_REQUESTS === true) {
            this.ws_requests = [];
            wsrequests.forEach(wsrequest => {
              if (wsrequest !== null && wsrequest !== undefined) {
                if (this.hasmeInAgents(wsrequest.agents, wsrequest) === true || this.hasmeInParticipants(wsrequest.participants) === true) {
                  this.ws_requests.push(wsrequest);
                }
              }
            });
          }
        }
        if (this.ws_requests) {
          this.ws_requests.forEach((request) => {
            // console.log('[WS-REQUESTS-UNSERVED-X-PANEL] forEach request', request);
            const user_agent_result = this.parseUserAgent(request.userAgent)
            const ua_browser = user_agent_result.browser.name + ' ' + user_agent_result.browser.version
            request['ua_browser'] = ua_browser;
            const ua_os = user_agent_result.os.name + ' ' + user_agent_result.os.version
            request['ua_os'] = ua_os;

            request['currentUserIsJoined'] = this.currentUserIdIsInParticipants(request.participants, this.auth.user_bs.value._id, request.request_id);

            if (request.status === 200) {

              // USE CASE ARRAY "new_participants" is UNDEFINED e.g. when the page is refreshed or when you enter the page (even when back from the detail) or to the "UPDATE"
              if (!request['participanting_Agents']) {
                this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - PARTICIPATING-AGENTS IS ', request['participanting_Agents'], ' - RUN DO ');
                request['participanting_Agents'] = this.doParticipatingAgentsArray(request.participants, request.first_text, this.imageStorage, this.UPLOAD_ENGINE_IS_FIREBASE)

              } else {
                this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - PARTICIPATING-AGENTS IS DEFINED');
              }
            }

            if (request.lead && request.lead.fullname) {
              request['requester_fullname_initial'] = avatarPlaceholder(request.lead.fullname);
              request['requester_fullname_fillColour'] = getColorBck(request.lead.fullname)
            } else {
              // console.log('here y getContactById')
              this.getContactById(request)
              request['requester_fullname_initial'] = 'N/A';
              request['requester_fullname_fillColour'] = '#6264a7';
            }


            if (request.lead && request.lead.lead_id) {
              if (request.status === 100) {
                this.getRequesterAvailabilityStatus(request.lead.lead_id, request)
              }
            }

            if (request && request.first_text) {
              const length = 45

              if (request.first_text.length > length) {
                request['trimmedFirst_text'] = request.first_text.substring(0, length - 3) + "..."
              } else {
                request['trimmedFirst_text'] = request.first_text
              }
            }
          });
        }

        // -------------------------------------------------------
        // Sort requests and manage spinner
        // -------------------------------------------------------
        if (this.ws_requests) {
          // console.log('[WS-REQUESTS-UNSERVED-X-PANEL]  getWsRequests *** ws_requests ***', this.ws_requests);
          this.wsRequestsUnserved = this.ws_requests
            .filter(r => {
              if (r['status'] === 100) {

                return true
              } else {
                return false
              }
            }).sort(function compare(a: Request, b: Request) {
              if (a['createdAt'] > b['createdAt']) {
                return -1;
              }
              if (a['createdAt'] < b['createdAt']) {
                return 1;
              }
              return 0;
            });

          this.wsRequestsServed = this.ws_requests
            .filter(r => {
              if (r['status'] !== 100) {

                return true
              } else {
                return false
              }
            }).sort(function compare(a: Request, b: Request) {
              if (a['createdAt'] > b['createdAt']) {
                return -1;
              }
              if (a['createdAt'] < b['createdAt']) {
                return 1;
              }
              return 0;
            });

        } else {

        }
        this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - getWsRequests$ (served)', this.wsRequestsServed);
        this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - getWsRequests$ (unserved)', this.wsRequestsUnserved);


      }, error => {
        this.logger.error('[WS-REQUESTS-UNSERVED-X-PANEL] - getWsRequests$ - ERROR ', error)
      }, () => {


        this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - getWsRequests$  */* COMPLETE */*')
      })
  }

  getContactById(request) {
    this.contactsService.getLeadById(request.lead)
      .subscribe((lead: any) => {

        if (lead) {
          this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - GET LEAD BY  ID ', lead);
          request.lead = { "createdAt": lead.createdAt, "createdBy": lead.createdBy, "email": lead.email, "fullname": lead.fullname, "id_project": lead.id_project, "lead_id": lead.lead_id, "status": lead.status, "_id": lead }
          request['requester_fullname_initial'] = avatarPlaceholder(lead.fullname);
          request['requester_fullname_fillColour'] = getColorBck(lead.fullname)
        } else {
          request['requester_fullname_initial'] = 'N/A';
          request['requester_fullname_fillColour'] = '#6264a7';
        }
      }, (error) => {

        this.logger.error('[WS-REQUESTS-UNSERVED-X-PANEL] - GET LEAD BY  ID - ERROR ', error);
        request['requester_fullname_initial'] = 'N/A';
        request['requester_fullname_fillColour'] = '#6264a7';


      }, () => {
        this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - GET LEAD BY  ID * COMPLETE *');
      });
  }



  getRequesterAvailabilityStatus(requester_id: string, request: any) {
    this.logger.log('WS-REQUEST-USVER-FOR-PANEL - GET REQUESTER AVAILABILITY STATUS --- requester_id ', requester_id)

    // const firebaseRealtimeDbUrl = `/apps/tilechat/presence/LmBT2IKjMzeZ3wqyU8up8KIRB6J3/connections`
    // -----------------------------------------------------------------------------------------
    // No more used - replaced by Get Lead presence from websocket
    // -----------------------------------------------------------------------------------------
    // const firebaseRealtimeDbUrl = `/apps/tilechat/presence/` + requester_id + `/connections`
    // const connectionsRef = firebase.database().ref().child(firebaseRealtimeDbUrl);
    // this.logger.log('REQUEST-DTLS-X-PANEL »» REQUEST DETAILS - CALLING REQUESTER AVAILABILITY VALUE ');

    // connectionsRef.on('value', (child) => {
    //   if (child.val()) {
    //           request['REQUESTER_IS_ONLINE'] = true;
    //   } else {
    //     request['REQUESTER_IS_ONLINE'] = false;

    //   }
    // })


    // -----------------------------------------------------------------------------------------
    // New - Get Lead presence from websocket subscription (replace firebaseRealtimeDb)
    // -----------------------------------------------------------------------------------------
    // this.contactsService.subscribeToWS_RequesterPresence(requester_id);
    this.wsRequestsService.subscribeToWS_RequesterPresence(requester_id);
    this.getWsRequesterPresence(request, requester_id);
  }

  getWsRequesterPresence(request, requester_id) {
    // this.contactsService.wsRequesterStatus$
    this.wsRequestsService.wsRequesterStatus$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data) => {
        const user = data

        // this.logger.log("[WS-REQUESTS-UNSERVED-X-PANEL] - wsRequesterPresence - getWsRequesterPresence user uuid_user ", user.uuid_user);
        // this.logger.log("[WS-REQUESTS-UNSERVED-X-PANEL] - wsRequesterPresence - getWsRequesterPresence user ", user);
        if (user && user.presence) {
          if (requester_id === user.uuid_user) {
            if (user.presence.status === "offline") {

              request['REQUESTER_IS_ONLINE'] = false;
            } else {
              request['REQUESTER_IS_ONLINE'] = true;
            }
          }
        }
      }, error => {

        this.logger.error('[WS-REQUESTS-UNSERVED-X-PANEL] - wsRequesterPresence - getWsRequesterPresence user - ERROR ', error)
      }, () => {
        this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - wsRequesterPresence - getWsRequesterPresence user *   complete * ')
      });
  }


  checkIfFinished(wsRequestsServed) {
    return (wsRequestsServed.length > 0);
  }

  // goBack() {
  //   this.location.back();
  // }

  goBackToProjectsList() {
    this.router.navigate(['/projects-for-panel']);
  }

  // DEPTS_LAZY: add this 
  addDeptObject(wsrequests) {
    this.departmentService.getDeptsByProjectIdToPromise().then((_departments: any) => {

      this.logger.log('[WS-REQUESTS-UNSERVED-X-PANEL] - X-> DEPTS <-X', _departments)

      wsrequests.forEach(request => {
        if (request && request.department) {
          // console.log('[WS-REQUESTS-UNSERVED-X-PANEL] - addDeptObject', request)
          const deptHasName = request.department.hasOwnProperty('name')
          if (deptHasName) {
            // this.logger.log('% »»» WebSocketJs WF +++++ ws-requests--- service -  X-> REQ DEPT HAS NAME', deptHasName)
            request['dept'] = request.department;
            let newInitials = '';
            let newFillColour = '';

            if (request.dept) {
              if (request.dept.name) {
                newInitials = avatarPlaceholder(request.dept.name);
                newFillColour = getColorBck(request.dept.name)
              } else {
                newInitials = 'N/A';
                newFillColour = '#eeeeee';
              }
              request.dept['dept_name_initial'] = newInitials;
              request.dept['dept_name_fillcolour'] = newFillColour;
            }
          }

        } else {
          // this.logger.log('% »»» WebSocketJs WF +++++ ws-requests--- service -  X-> REQ DEPT HAS NAME', deptHasName)
          if (request && request.department) {
            request['dept'] = this.getDeptObj(request.department._id, _departments);

            let newInitials = '';
            let newFillColour = '';

            if (request.dept) {
              if (request.dept.name) {
                newInitials = avatarPlaceholder(request.dept.name);
                newFillColour = getColorBck(request.dept.name)
              } else {

                newInitials = 'N/A';
                newFillColour = '#eeeeee';
              }

              request.dept['dept_name_initial'] = newInitials;
              request.dept['dept_name_fillcolour'] = newFillColour;
            }
          }
        }
      });
    });
  }

  // DEPTS_LAZY: add this 
  getDeptObj(departmentid: string, deparments: any) {
    const deptObjct = deparments.filter((obj: any) => {
      return obj._id === departmentid;
    });
    return deptObjct[0]
  }

}




