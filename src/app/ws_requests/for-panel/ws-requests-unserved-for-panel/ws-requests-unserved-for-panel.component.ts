
import { Component, OnInit, OnDestroy, AfterViewInit, NgZone, ViewChild, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { WsRequestsService } from '../../../services/websocket/ws-requests.service';
import { LocalDbService } from '../../../services/users-local-db.service';
import { BotLocalDbService } from '../../../services/bot-local-db.service';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { avatarPlaceholder, getColorBck } from '../../../utils/util';
import { NotifyService } from '../../../core/notify.service';
import { RequestsService } from '../../../services/requests.service';
import { TranslateService } from '@ngx-translate/core';
import { WsSharedComponent } from '../../ws-shared/ws-shared.component';
import * as firebase from 'firebase/app';
import { Request } from '../../../models/request-model';
import { UsersService } from '../../../services/users.service';
import { UAParser } from 'ua-parser-js'
import { FaqKbService } from '../../../services/faq-kb.service';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { AppConfigService } from '../../../services/app-config.service';
import { Subscription } from 'rxjs/Subscription';
import PerfectScrollbar from 'perfect-scrollbar';
import { DepartmentService } from '../../../services/department.service';
import { environment } from '../../../../environments/environment';
import { distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { browserRefresh } from '../../../app.component';
import { Location } from '@angular/common';
// import { fadeInAnimation } from '../../../_animations/index';
const swal = require('sweetalert');
import { ContactsService } from '../../../services/contacts.service';

@Component({
  selector: 'appdashboard-ws-requests-unserved-for-panel',
  templateUrl: './ws-requests-unserved-for-panel.component.html',
  styleUrls: ['./ws-requests-unserved-for-panel.component.scss']
  // animations: [fadeInAnimation],
  // tslint:disable-next-line:use-host-property-decorator
  // host: { '[@fadeInAnimation]': '' }
})
export class WsRequestsUnservedForPanelComponent extends WsSharedComponent implements OnInit, AfterViewInit, OnDestroy {

  // CHAT_BASE_URL = environment.chat.CHAT_BASE_URL; // moved
  // CHAT_BASE_URL = environment.CHAT_BASE_URL; // now get from appconfig
  CHAT_BASE_URL: string;

  // used to unsuscribe from behaviour subject
  private unsubscribe$: Subject<any> = new Subject<any>();


  // @ViewChild('teamContent', { read: ElementRef }) public teamContent: ElementRef<any>;
  @ViewChild('teamContent') private teamContent: ElementRef;
  @ViewChild('testwidgetbtn') private testwidgetbtnRef: ElementRef;

  // wsRequestsUnserved: Observable<Request[]>;
  // wsRequestsServed: Observable<Request[]>;
  wsRequestsUnserved: any;
  wsRequestsServed: any;
  ws_requests: any;

  projectId: string;
  zone: NgZone;
  SHOW_SIMULATE_REQUEST_BTN = false;
  showSpinner = true;


  firebase_token: any;

  currentUserID: string;
  ONLY_MY_REQUESTS: boolean = false;
  ROLE_IS_AGENT: boolean;
  displayBtnLabelSeeYourRequets = false;

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

  // TESTSITE_BASE_URL = environment.testsite.testsiteBaseUrl; // moved
  // TESTSITE_BASE_URL = environment.testsiteBaseUrl;   // now get from appconfig
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

  /**
   * Constructor
   * 
   * @param {WsRequestsService} wsRequestsService 
   * @param {Router} router 
   * @param {LocalDbService} usersLocalDbService 
   * @param {BotLocalDbService} botLocalDbService 
   * @param {AuthService} auth 
   * @param {RequestsService} requestsService
   * @param {TranslateService} translate  
   */
  constructor(
    public wsRequestsService: WsRequestsService,
    public router: Router,
    public usersLocalDbService: LocalDbService,
    public botLocalDbService: BotLocalDbService,
    public auth: AuthService,
    private requestsService: RequestsService,
    private translate: TranslateService,
    public usersService: UsersService,
    public faqKbService: FaqKbService,
    public appConfigService: AppConfigService,
    private departmentService: DepartmentService,
    public notify: NotifyService,
    public location: Location,
    private cdref: ChangeDetectorRef,
    public contactsService: ContactsService

  ) {
    super(botLocalDbService, usersLocalDbService, router, wsRequestsService, faqKbService, usersService, notify);
    this.zone = new NgZone({ enableLongStackTrace: false });
    console.log('WS-REQUESTS-UNSERVED-X-PANEL !!!!')
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit() {
    // this.getDepartments();
    // this.getWsRequests$();

    // this.getProjectUserRole();


    // this.for1();
    // this.getRequestsTotalCount()  
    // this.getAllProjectUsersAndBot();

    // const teamContentEl = <HTMLElement>document.querySelector('.team-content');
    // const perfs = new PerfectScrollbar(teamContentEl);
    // this.selectedDeptId = '';
    // this.selectedAgentId = '';


    // this.getChatUrl();
    // this.getTestSiteUrl();
    this.getImageStorage();
    this.detectBrowserRefresh();
    this.getCurrentProject();
    this.getLoggedUser();
    this.getTranslations();
    this.setPerfectScrollbar();

  }

  ngAfterViewInit() {
    const leftsidebarbtn = <HTMLElement>document.querySelector('.left-sidebar--btns-container')
    console.log('WS-REQUESTS-UNSERVED-X-PANEL - leftsidebarbtn ', leftsidebarbtn);

    this.getProjectUserRole();
    this.cdref.detectChanges();
  }

  ngOnDestroy() {
    console.log('WS-REQUESTS-UNSERVED-X-PANEL - ngOnDestroy')
    if (this.subscription) {
      this.subscription.unsubscribe()
    }

    this.wsRequestsUnserved.forEach(request => {

      console.log('WS-REQUESTS-UNSERVED-X-PANEL - ngOnDestroy request', request)
      if (request && request.lead) {
        this.unsuscribeRequesterPresence(request.lead.lead_id)
      }
    });

    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  unsuscribeRequesterPresence(requester_id) {
    // this.contactsService.unsubscribeToWS_RequesterPresence(requester_id);
    this.wsRequestsService.unsubscribeToWS_RequesterPresence(requester_id);
  }

  setPerfectScrollbar() {
    const container_projects_for_panel = <HTMLElement>document.querySelector('.main-content-projects-for-panel');
    console.log('WS-REQUESTS-SERVED main-content-projects-for-panel', container_projects_for_panel);
    let ps = new PerfectScrollbar(container_projects_for_panel, {
      suppressScrollX: true
    });
  }


  // ------------------------------------------
  // Join request
  // ------------------------------------------
  joinRequest(request_id: string) {
    this.currentUserID
    this.onJoinHandled(request_id, this.currentUserID);
  }

  archiveRequest(request_id) {
    this.notify.showArchivingRequestNotification(this.archivingRequestNoticationMsg);
    console.log('WS-REQUESTS-SERVED - HAS CLICKED ARCHIVE REQUEST ');
    this.wsRequestsService.closeSupportGroup(request_id)
      .subscribe((data: any) => {
        console.log('WS-REQUESTS-SERVED - CLOSE SUPPORT GROUP - DATA ', data);
      }, (err) => {
        console.log('WS-REQUESTS-SERVED - CLOSE SUPPORT GROUP - ERROR ', err);

        // =========== NOTIFY ERROR ===========
        // this.notify.showNotification('An error has occurred archiving the request', 4, 'report_problem');
        this.notify.showNotification(this.archivingRequestErrorNoticationMsg, 4, 'report_problem');
      }, () => {
        // this.ngOnInit();
        console.log('WS-REQUESTS-UNSERVED-X-PANEL - CLOSE SUPPORT GROUP - COMPLETE');

        // =========== NOTIFY SUCCESS===========
        // this.notify.showNotification(`request with id: ${this.id_request_to_archive} has been moved to History`, 2, 'done');
        this.notify.showRequestIsArchivedNotification(this.requestHasBeenArchivedNoticationMsg_part1);

        // this.onArchiveRequestCompleted()
      });
  }

  displayDetails(request) {
    this.OPEN_REQUEST_DETAILS = true;
    this.selectedRequest = request
  }

  handleCloseRightSidebar(event) {
    console.log('%%% Ws-REQUESTS-Msgs »»»» CLOSE RIGHT SIDEBAR ', event);
    this.OPEN_REQUEST_DETAILS = event;

    // const _elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    // _elemMainPanel.setAttribute('style', 'overflow-x: hidden !important;');
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
        // console.log('+ + + ArchivingRequestNoticationMsg', text)
      });
  }

  // TRANSLATION
  translateArchivingRequestErrorMsg() {
    this.translate.get('ArchivingRequestErrorNoticationMsg')
      .subscribe((text: string) => {

        this.archivingRequestErrorNoticationMsg = text;
        // console.log('+ + + ArchivingRequestErrorNoticationMsg', text)
      });
  }

  // TRANSLATION
  translateRequestHasBeenArchivedNoticationMsg_part1() {
    // this.translate.get('RequestHasBeenArchivedNoticationMsg_part1')
    this.translate.get('RequestSuccessfullyClosed')
      .subscribe((text: string) => {
        this.requestHasBeenArchivedNoticationMsg_part1 = text;
        // console.log('+ + + RequestHasBeenArchivedNoticationMsg_part1', text)
      });
  }

  // TRANSLATION
  translateRequestHasBeenArchivedNoticationMsg_part2() {
    this.translate.get('RequestHasBeenArchivedNoticationMsg_part2')
      .subscribe((text: string) => {
        this.requestHasBeenArchivedNoticationMsg_part2 = text;
        // console.log('+ + + RequestHasBeenArchivedNoticationMsg_part2', text)
      });
  }

  getTestSiteUrl() {
    this.TESTSITE_BASE_URL = this.appConfigService.getConfig().testsiteBaseUrl;
    console.log('AppConfigService getAppConfig (WS-REQUESTS-UNSERVED-X-PANEL) TESTSITE_BASE_URL', this.TESTSITE_BASE_URL);
  }

  getChatUrl() {
    this.CHAT_BASE_URL = this.appConfigService.getConfig().CHAT_BASE_URL;
    console.log('AppConfigService getAppConfig (WS-REQUESTS-UNSERVED-X-PANEL) CHAT_BASE_URL', this.CHAT_BASE_URL);
  }


  detectBrowserRefresh() {
    // console.log('% »»» WebSocketJs WF +++++ ws-requests--- list CALLING browserRefresh')
    this.browserRefresh = browserRefresh;
    // console.log("% »»» WebSocketJs WF +++++ ws-requests--- list ----- ngOnInit browserRefresh ", this.browserRefresh);
    // console.log("% »»» WebSocketJs WF +++++ ws-requests--- list ----- ngOnInit browserRefresh ", this.browserRefresh, 'wsRequestsList$.value length', this.wsRequestsService.wsRequestsList$.value.length);
    if (this.browserRefresh) {

      this.listenToRequestsLength();
    } else {
      this.wsRequestsService.wsRequestsList$.value
      // console.log("% »»» WebSocketJs WF +++++ ws-requests--- list ----- ngOnInit browserRefresh ", this.browserRefresh, 'wsRequestsList$.value length', this.wsRequestsService.wsRequestsList$.value.length);

    }
  }

  getProjectUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user_role) => {
        console.log('WS-REQUESTS-UNSERVED-X-PANEL - USER ROLE ', user_role);
        if (user_role) {
          if (user_role === 'agent') {
            this.ROLE_IS_AGENT = true
            this.displayBtnLabelSeeYourRequets = true
            // ------ 
            this.ONLY_MY_REQUESTS = true
            this.getWsRequests$();
          } else {
            this.ROLE_IS_AGENT = false
            this.displayBtnLabelSeeYourRequets = false;
            this.getWsRequests$();
          }
        }
      });
  }


  getImageStorage() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.imageStorage = this.storageBucket;
      console.log('WS-REQUESTS-UNSERVED-X-PANEL IMAGE STORAGE ', this.storageBucket, 'usecase firebase')
    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;
      this.imageStorage = this.baseUrl;
      console.log('WS-REQUESTS-UNSERVED-X-PANEL IMAGE STORAGE ', this.baseUrl, 'usecase native')
    }
    // console.log('STORAGE-BUCKET Ws Requests List ', this.storageBucket)
  }

  listenToRequestsLength() {
    this.subscription = this.wsRequestsService.ws_All_RequestsLength$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((totalrequests: number) => {
        console.log('WS-REQUESTS-UNSERVED-X-PANEL listenToRequestsLength RECEIVED NEXT wsRequestsList LENGTH', totalrequests)

        if (totalrequests === 0) {
          this.SHOW_SIMULATE_REQUEST_BTN = true
          this.showSpinner = false;
          console.log('WS-REQUESTS-UNSERVED-X-PANEL - listenToRequestsLength SHOW_SIMULATE_REQUEST_BTN ', this.SHOW_SIMULATE_REQUEST_BTN)
          console.log('WS-REQUESTS-UNSERVED-X-PANEL - listenToRequestsLength showSpinner ', this.showSpinner)

        } else if (totalrequests > 0) {

          this.showSpinner = false;
          this.SHOW_SIMULATE_REQUEST_BTN = false
          console.log('WS-REQUESTS-UNSERVED-X-PANEL - listenToRequestsLength SHOW_SIMULATE_REQUEST_BTN ', this.SHOW_SIMULATE_REQUEST_BTN)
          console.log('WS-REQUESTS-UNSERVED-X-PANEL - listenToRequestsLength showSpinner ', this.showSpinner)

        }

        // console.log('% »»» WebSocketJs WF - WsRequestsList >>>>>>> >>>>>>> BEHAVIOUR TOTAL-REQUESTS <<<<<<< ', totalrequests)
        // console.log('% »»» WebSocketJs WF - WsRequestsList >>>>>>> >>>>>>> THIS.WS-REQUESTS LENGTH <<<<<<< ', this.ws_requests.length)
        // if (totalrequests) {
        //   this.totalRequests = totalrequests
        // }
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
      console.log('WS-REQUESTS-UNSERVED-X-PANEL -  USER ', user)
      // this.user = user;
      if (user) {
        this.currentUserID = user._id
        console.log('WS-REQUESTS-UNSERVED-X-PANEL - currentUser ID', this.currentUserID);
      }
    });
  }


  // -----------------------------------------------------------------------------------------------------
  // @ Subscribe to get the published current project (called On init)
  // -----------------------------------------------------------------------------------------------------
  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      console.log('WS-REQUESTS-UNSERVED-X-PANEL - project', project)
      if (project) {
        this.projectNameFirstLetter = project.name.charAt(0)
        this.projectId = project._id;
        this.projectName = project.name;
      }
    });
  }


  seeIamAgentRequests(seeIamAgentReq) {
    this.ONLY_MY_REQUESTS = seeIamAgentReq
    console.log('WS-REQUESTS-UNSERVED-X-PANEL - ONLY_MY_REQUESTS ', this.ONLY_MY_REQUESTS);
    if (seeIamAgentReq === false) {
      this.displayBtnLabelSeeYourRequets = false;
    } else {
      this.displayBtnLabelSeeYourRequets = true;
    }
    this.getWsRequests$()
  }

  // hasmeInUnserved(agents) {
  //   let iAmThere = false
  //   for (let j = 0; j < agents.length; j++) {
  //     // console.log("% »»» WebSocketJs - WsRequestsService AGENT ", agents[j]);
  //     console.log("% »»» WebSocketJs - WsRequestsService currentUserID 2 ", this.currentUserID);
  //     console.log("% »»» WebSocketJs - WsRequestsService id_user ", agents[j].id_user);

  //     if (this.currentUserID === agents[j].id_user) {
  //       iAmThere = true
  //       console.log("% »»» WebSocketJs - WsRequestsService HERE-YES ", iAmThere);
  //     }
  //     return iAmThere
  //   }
  // }

  goToDept(deptid) {
    this.router.navigate(['project/' + this.projectId + '/department/edit/' + deptid]);

  }


  parseUserAgent(uastring) {
    // https://github.com/faisalman/ua-parser-js
    var parser = new UAParser();
    // var uastring = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36";
    parser.setUA(uastring);
    return parser.getResult();
  }

  // getRequestsTotalCount(wsrequests): Observable<[]> {
  //   return Observable.of(wsrequests);
  // }

  onChangeDepts() {
    this.hasFiltered = true
    // console.log('% »»» WebSocketJs WF WS-RL - on Change Depts - dept id', this.selectedDeptId);

    this.filter[0]['deptId'] = this.selectedDeptId

    console.log('% »»» WebSocketJs WF WS-RL - on Change Depts - filter', this.filter)
    this.getWsRequests$();
    // console.log('% »»» WebSocketJs WF WS-RL - on Change Depts - ws Requests Unserved ', this.wsRequestsUnserved.length);
    // console.log('% »»» WebSocketJs WF WS-RL - on Change Depts - ws Requests Served length', this.wsRequestsServed.length)

  }

  clearDeptFilter() {
    this.filter[0]['deptId'] = null;
    this.hasFiltered = false
    // this.getWsRequests$();
    console.log('% »»» WebSocketJs WF WS-RL - clear Dept Filter selectedDeptId', this.selectedDeptId)
  }



  // countRequestsLength(wsrequests) {
  //   console.log('% »»» WebSocketJs WF WS-RL - WsRequestsList  ≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥ CALLING NOW countRequestsLength ',wsrequests.length);
  //   if (wsrequests.length === 0) {
  //     this.showSpinner = false;
  //     this.SHOW_SIMULATE_REQUEST_BTN = true;
  //   }
  // }
  asyncFunction(item, cb) {
    setTimeout(() => {
      // console.log('% »»» WebSocketJs WF +++++ ws-requests--- list  ≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥ asyncFunction done with', item);
      cb();
    }, 100);
  }

  hasmeInAgents(agents, wsrequest) {
    if (agents) {
      for (let j = 0; j < agents.length; j++) {
        // console.log("% »»» WebSocketJs WF - WsRequestsList »»» »»» hasmeInAgents agent", agents[j]);
        console.log("WS-REQUESTS-UNSERVED-X-PANEL -  hasmeInAgents currentUserID 2 ", this.currentUserID);
        // console.log("% »»» WebSocketJs WF - WsRequestsList id_user ", agents[j].id_user);

        if (this.currentUserID === agents[j].id_user) {
          return true
          // console.log("% »»» WebSocketJs WF +++++ ws-requests--- list + hasmeInAgents in If", iAmThere, '(forEach) the request id ', wsrequest.request_id, ' status: ', wsrequest.status, ' agent: ', agents );
        }
        // console.log("% »»» WebSocketJs WF +++++ ws-requests--- list + hasmeInAgents", iAmThere, '(forEach) the request id ', wsrequest.request_id, ' status: ', wsrequest.status, ' agent: ', agents );
        // return iAmThere
      }
    }
  }

  // this check fix the bug: the request is assigned to a agent or admin od the dept A 
  // the the same requets is reassigned to an agent or admin of the dept B
  // the agent or admin doesn't see the request
  hasmeInParticipants(participants) {
    let iAmThere = false
    participants.forEach(participant => {
      console.log('WS-REQUESTS-UNSERVED-X-PANEL - hasmeInParticipants  participant', participant)
      if (participant === this.currentUserID) {
        // console.log('»»»»»»» UTILS MEMBERS ', members)
        // console.log('»»»»»»» CURRENT_USER_JOINED ', currentUserFireBaseUID);
        iAmThere = true;
        return
      }
    });
    console.log('WS-REQUESTS-UNSERVED-X-PANEL -  hasmeInParticipants', iAmThere);
    return iAmThere;

  }



  // -----------------------------------------------------------------------------------------------------
  // @ Subscribe to get the published requests (called On init)
  // -----------------------------------------------------------------------------------------------------
  getWsRequests$() {
    console.log("WS-REQUESTS-UNSERVED-X-PANEL - enter NOW in getWsRequests$");
    this.wsRequestsService.wsRequestsList$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((wsrequests) => {

        if (wsrequests) {

          this.addDeptObject(wsrequests)

          console.log("WS-REQUESTS-UNSERVED-X-PANEL - subscribe > if (wsrequests) ", wsrequests);
          this.browserRefresh = browserRefresh;

          if ((this.browserRefresh === false) || (this.browserRefresh === true && this.wsRequestsService.wsRequestsList$.value.length > 0)) {
            if (wsrequests.length > 0) {

              this.SHOW_SIMULATE_REQUEST_BTN = false;
              console.log('WS-REQUESTS-UNSERVED-X-PANEL - SHOW_SIMULATE_REQUEST_BTN ', this.SHOW_SIMULATE_REQUEST_BTN)
              this.showSpinner = false;
              console.log('WS-REQUESTS-UNSERVED-X-PANEL - SHOW_SPINNER ', this.showSpinner)


            } else if (wsrequests.length === 0) {
              this.SHOW_SIMULATE_REQUEST_BTN = true;
              console.log('WS-REQUESTS-UNSERVED-X-PANEL - SHOW_SIMULATE_REQUEST_BTN ', this.SHOW_SIMULATE_REQUEST_BTN)
              this.showSpinner = false;
              console.log('WS-REQUESTS-UNSERVED-X-PANEL - SHOW_SPINNER ', this.showSpinner)
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

        // this.ws_requests.forEach(request => {
        this.ws_requests.forEach((request) => {

          const user_agent_result = this.parseUserAgent(request.userAgent)
          const ua_browser = user_agent_result.browser.name + ' ' + user_agent_result.browser.version
          request['ua_browser'] = ua_browser;
          const ua_os = user_agent_result.os.name + ' ' + user_agent_result.os.version
          request['ua_os'] = ua_os;

          request['currentUserIsJoined'] = this.currentUserIdIsInParticipants(request.participants, this.auth.user_bs.value._id, request.request_id);

          if (request.status === 200) {
            // USE CASE L'ARRAY new_participants è UNDEFINED x es al refresh o quando si entra nella pagina (anche al back dal dettaglio) o all' UPDATE
            // console.log('!! Ws SHARED  (from request list) PARTICIPATING-AGENTS  ', request['participantingAgents']);

            if (!request['participanting_Agents']) {
              console.log('!! Ws SHARED  (from request list) PARTICIPATING-AGENTS IS ', request['participanting_Agents'], ' - RUN DO ');
              request['participanting_Agents'] = this.doParticipatingAgentsArray(request.participants, request.first_text, this.imageStorage, this.UPLOAD_ENGINE_IS_FIREBASE)

            } else {
              console.log('!! Ws SHARED  (from request list) PARTICIPATING-AGENTS IS DEFINED');
            }
          }

          if (request.lead && request.lead.fullname) {
            request['requester_fullname_initial'] = avatarPlaceholder(request.lead.fullname);
            request['requester_fullname_fillColour'] = getColorBck(request.lead.fullname)
          } else {
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

        /**
         * Sort requests and manage spinner
         */
        if (this.ws_requests) {
          console.log('% »»» WebSocketJs WF +++++ ws-requests--- list getWsRequests *** ws_requests ***', this.ws_requests);
          this.wsRequestsUnserved = this.ws_requests
            .filter(r => {
              if (r['status'] === 100) {

                return true
              } else {
                return false
              }
            }).sort(function compare(a: Request, b: Request) {
              if (a['createdAt'] > b['createdAt']) {
                return 1;
              }
              if (a['createdAt'] < b['createdAt']) {
                return -1;
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
          // this.showSpinner = false;
        }
        console.log('WS-REQUESTS-UNSERVED-X-PANEL getWsRequests (served)', this.wsRequestsServed);
        console.log('WS-REQUESTS-UNSERVED-X-PANEL list getWsRequests (unserved)', this.wsRequestsUnserved);

        var time = 1;
        // this = that
        var interval = setInterval(() => {
          if (time <= 3) {
            console.log('WS-REQUESTS-UNSERVED-X-PANEL (unserved) TIME TIME TIME ', time);
            time++;
          }
          else {
            clearInterval(interval);
            console.log('WS-REQUESTS-UNSERVED-X-PANEL (unserved) TIME TIME TIME COMPLETED Unserved LENGTH ', this.wsRequestsUnserved.length);

            if (this.wsRequestsUnserved.length > 0) {
              this.SHOW_NO_REQUEST_MSG = false;
              this.showSpinner = false;
            } else {
              this.SHOW_NO_REQUEST_MSG = true;
              this.showSpinner = false;
            }
          }
        }, 1000);

      }, error => {
        console.log('% WsRequestsList getWsRequests$ * error * ', error)
      }, () => {


        console.log('% »»» WebSocketJs WF +++++ ws-requests--- list getWsRequests */* COMPLETE */*')
      })
  }

  getRequesterAvailabilityStatus(requester_id: string, request: any) {
    console.log('WS-REQUEST-USVER-FOR-PANEL - GET REQUESTER AVAILABILITY STATUS --- requester_id ', requester_id)

    // const firebaseRealtimeDbUrl = `/apps/tilechat/presence/LmBT2IKjMzeZ3wqyU8up8KIRB6J3/connections`
    // -----------------------------------------------------------------------------------------
    // No more used - replaced by Get Lead presence from websocket
    // -----------------------------------------------------------------------------------------
    // const firebaseRealtimeDbUrl = `/apps/tilechat/presence/` + requester_id + `/connections`
    // const connectionsRef = firebase.database().ref().child(firebaseRealtimeDbUrl);
    // console.log('REQUEST-DTLS-X-PANEL »» REQUEST DETAILS - CALLING REQUESTER AVAILABILITY VALUE ');

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

        console.log("WS-REQUESTS-UNSERVED-X-PANEL -  wsRequesterPresence - getWsRequesterPresence user uuid_user ", user.uuid_user);
        console.log("WS-REQUESTS-UNSERVED-X-PANEL -  wsRequesterPresence - getWsRequesterPresence user ", user);
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

        console.log('WS-REQUESTS-UNSERVED-X-PANEL - wsRequesterPresence - getWsRequesterPresence user * error * ', error)
      }, () => {
        console.log('WS-REQUESTS-UNSERVED-X-PANEL - wsRequesterPresence - getWsRequesterPresence user *** complete *** ')
      });
  }



  cutFirstMessage(text: string): string {
    if (text) {
      return text.length >= 20 ?
        text.slice(0, 20) + '...' :
        text;
    }
  }

  checkIfFinished(wsRequestsServed) {
    return (wsRequestsServed.length > 0);
  }

  goBack() {
    this.location.back();
  }



  getDepartments() {
    this.departmentService.getDeptsByProjectId().subscribe((_departments: any) => {
      console.log('WS-REQUESTS-UNSERVED-X-PANEL - GET DEPTS RESPONSE ', _departments);
      this.departments = _departments
    }, error => {
      console.log('WS-REQUESTS-UNSERVED-X-PANEL - GET DEPTS - ERROR: ', error);
    }, () => {
      console.log('WS-REQUESTS-UNSERVED-X-PANEL - GET DEPTS * COMPLETE *')
    });
  }

  // DEPTS_LAZY: add this 
  addDeptObject(wsrequests) {
    this.departmentService.getDeptsByProjectIdToPromise().then((_departments: any) => {

      console.log('WS-REQUESTS-UNSERVED-X-PANEL - X-> DEPTS <-X', _departments)

      wsrequests.forEach(request => {
        const deptHasName = request.department.hasOwnProperty('name')
        if (deptHasName) {
          // console.log('% »»» WebSocketJs WF +++++ ws-requests--- service -  X-> REQ DEPT HAS NAME', deptHasName)
          request['dept'] = request.department;
          let newInitials = '';
          let newFillColour = '';

          if (request.dept) {
            if (request.dept.name) {
              newInitials = avatarPlaceholder(request.dept.name);
              newFillColour = getColorBck(request.dept.name)
            } else {
              newInitials = 'n.a.';
              newFillColour = '#eeeeee';
            }
            request.dept['dept_name_initial'] = newInitials;
            request.dept['dept_name_fillcolour'] = newFillColour;
          }

        } else {
          // console.log('% »»» WebSocketJs WF +++++ ws-requests--- service -  X-> REQ DEPT HAS NAME', deptHasName)

          request['dept'] = this.getDeptObj(request.department._id, _departments);


          let newInitials = '';
          let newFillColour = '';

          if (request.dept) {
            if (request.dept.name) {
              newInitials = avatarPlaceholder(request.dept.name);
              newFillColour = getColorBck(request.dept.name)
            } else {

              newInitials = 'n.a.';
              newFillColour = '#eeeeee';
            }

            request.dept['dept_name_initial'] = newInitials;
            request.dept['dept_name_fillcolour'] = newFillColour;
          }
        }
      });
    });
  }

  // DEPTS_LAZY: add this 
  getDeptObj(departmentid: string, deparments: any) {
    // const deptObjct =  this.departments.findIndex((e) => e.department === departmentid);
    const deptObjct = deparments.filter((obj: any) => {
      return obj._id === departmentid;
    });
    // console.log('% »»» WebSocketJs WF +++++ ws-requests--- service -  X-> DEPT OBJECT <-X', deptObjct)
    return deptObjct[0]
  }


  onChangeAgent() {
    this.hasFiltered = true
    // this.filter['agentId'] = this.selectedAgentId
    // this.filter.push({ 'agentId': this.selectedAgentId }) 
    // console.log('% »»» WebSocketJs WF WS-RL - on Change Agent filter', this.filter)
    this.filter[1]['agentId'] = this.selectedAgentId;
    // console.log('% »»» WebSocketJs WF WS-RL - on Change Agent - selected Agent Id', this.selectedAgentId);
    // console.log('% »»» WebSocketJs WF WS-RL - on Change Agent - filter', this.filter)
    this.getWsRequests$();

    // console.log('% »»» WebSocketJs WF WS-RL - on Change Agent - ws Requests Unserved ', this.wsRequestsUnserved.length);
    // console.log('% »»» WebSocketJs WF WS-RL - on Change Agent - ws Requests Served ', this.wsRequestsServed.length)
  }

  clearAgentFilter() {
    // console.log('% »»» WebSocketJs WF WS-RL - clear Agent Filter selectedAgentId', this.selectedAgentId)
    this.filter[1]['agentId'] = null;
    this.hasFiltered = false
  }


}




