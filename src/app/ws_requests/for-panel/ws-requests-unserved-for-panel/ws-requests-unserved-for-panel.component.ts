
import { Component, OnInit, OnDestroy, AfterViewInit, NgZone, ViewChild, ElementRef, HostListener } from '@angular/core';
import { WsRequestsService } from '../../../services/websocket/ws-requests.service';
import { UsersLocalDbService } from '../../../services/users-local-db.service';
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
import { DepartmentService } from '../../../services/mongodb-department.service';
import { environment } from '../../../../environments/environment';
import { distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { browserRefresh } from '../../../app.component';
import * as uuid from 'uuid';
import { Chart } from 'chart.js';

const swal = require('sweetalert');

@Component({
  selector: 'appdashboard-ws-requests-unserved-for-panel',
  templateUrl: './ws-requests-unserved-for-panel.component.html',
  styleUrls: ['./ws-requests-unserved-for-panel.component.scss']
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

  departments: any;
  selectedDeptId: string;
  selectedAgentId: string;

  // TESTSITE_BASE_URL = environment.testsite.testsiteBaseUrl; // moved
  // TESTSITE_BASE_URL = environment.testsiteBaseUrl;   // now get from appconfig
  TESTSITE_BASE_URL: string;
  projectName: string;

  participantsInRequests: any;
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
  OPEN_REQUEST_DETAILS:boolean = false;
  selectedRequest: any;

  /**
   * Constructor
   * 
   * @param {WsRequestsService} wsRequestsService 
   * @param {Router} router 
   * @param {UsersLocalDbService} usersLocalDbService 
   * @param {BotLocalDbService} botLocalDbService 
   * @param {AuthService} auth 
   * @param {RequestsService} requestsService
   * @param {TranslateService} translate  
   */
  constructor(
    public wsRequestsService: WsRequestsService,
    public router: Router,
    public usersLocalDbService: UsersLocalDbService,
    public botLocalDbService: BotLocalDbService,
    public auth: AuthService,
    private requestsService: RequestsService,
    private translate: TranslateService,
    public usersService: UsersService,
    public faqKbService: FaqKbService,
    public appConfigService: AppConfigService,
    private departmentService: DepartmentService,
    private notify: NotifyService

  ) {
    super(botLocalDbService, usersLocalDbService, router, wsRequestsService, faqKbService, usersService);
    this.zone = new NgZone({ enableLongStackTrace: false });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit() {
    this.getDepartments();
    // this.getWsRequests$();
    this.getCurrentProject();
    this.getLoggedUser();
    this.getProjectUserRole();
    this.getStorageBucket();



    // this.for1();
    // this.getRequestsTotalCount()  
    // this.getAllProjectUsersAndBot();

    // const teamContentEl = <HTMLElement>document.querySelector('.team-content');
    // const perfs = new PerfectScrollbar(teamContentEl);
    // this.selectedDeptId = '';
    // this.selectedAgentId = '';
    this.detectBrowserRefresh();

    this.getChatUrl();
    this.getTestSiteUrl();
    this.getTranslations();
  }

  displayDetails(request) {
    // const wrapper = document.createElement('div');
    // wrapper.innerHTML = 'YOUR_DYNAMIC_HTML';

    // swal({
    //   title: 'Test Title',
    //   text: 'Test Text',
    //   content: wrapper
    // });

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
    console.log('AppConfigService getAppConfig (WS-REQUESTS-LIST COMP.) TESTSITE_BASE_URL', this.TESTSITE_BASE_URL);
  }

  getChatUrl() {
    this.CHAT_BASE_URL = this.appConfigService.getConfig().CHAT_BASE_URL;
    console.log('AppConfigService getAppConfig (WS-REQUESTS-LIST COMP.) CHAT_BASE_URL', this.CHAT_BASE_URL);
  }

  ngAfterViewInit() { }

  ngOnDestroy() {
    console.log('% »»» WebSocketJs WF +++++ ws-requests--- list ≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥ ngOnDestroy')
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
        console.log('% »»» WebSocketJs WF +++++ ws-requests---  WsRequestsList USER ROLE ', user_role);
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

  getDepartments() {
    this.departmentService.getDeptsByProjectId().subscribe((_departments: any) => {
      console.log('% »»» WebSocketJs WF WS-RL - GET DEPTS RESPONSE ', _departments);
      this.departments = _departments
    }, error => {
      console.log('% »»» WebSocketJs WF WS-RL - GET DEPTS - ERROR: ', error);
    }, () => {
      console.log('% »»» WebSocketJs WF WS-RL - GET DEPTS * COMPLETE *')
    });
  }

  getStorageBucket() {
    const firebase_conf = this.appConfigService.getConfig().firebase;
    this.storageBucket = firebase_conf['storageBucket'];
    // console.log('STORAGE-BUCKET Ws Requests List ', this.storageBucket)
  }

  public scrollRight(): void {
    this.teamContent.nativeElement.scrollTo({ left: (this.teamContent.nativeElement.scrollLeft + 150), behavior: 'smooth' });
  }

  public scrollLeft(): void {
    this.teamContent.nativeElement.scrollTo({ left: (this.teamContent.nativeElement.scrollLeft - 150), behavior: 'smooth' });
  }

  // async getRequestsTotalCount() {
  //   // this.wsRequestsService.getTotalRequestLength(requestTotal).then((resultImage) => {  })

  //   const totalR = await this.wsRequestsService.getTotalRequestLength();
  //   console.log('% »»» WebSocketJs WF >>>>>>>>> >>>>>>>  L FROM PROMISE ',totalR);
  // }

  for1() {
    // this.Xlength = this.wsRequestsService.wsRequestsListLength$.value
    this.wsRequestsService.ws_All_RequestsLength$.subscribe((totalrequests: number) => {

      this.Xlength = totalrequests
    })

    console.log('% »»» WebSocketJs WF >>>>>>>>> >>>>>>> FOR 1 Lenght ', this.Xlength);
    // console.log('% »»» WebSocketJs WF >>>>>>>>> >>>>>>> FOR 1 ', this.i);

    if (this.Xlength !== undefined) {

      this.for2();

    } else if (this.Xlength === undefined) {
      setTimeout(() => {
        // this.showSpinner = false;

      }, 100);
    }
  }

  for2() {
    // var length = 10;
    if (this.i == this.Xlength) {
      console.log('% »»» WebSocketJs WF >>>>>>>>> >>>>>>> FOR 1 == Xlength ');
      // this.showSpinner = false;
      return false;
    }
    setTimeout(() => {
      this.i++;
      this.for1();
    }, 50);
  }


  getAllProjectUsersAndBot() {
    // createBotsAndUsersArray() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      // console.log('% »»» WebSocketJs WF WS-RL - +++ GET PROJECT-USERS ', projectUsers);
      if (projectUsers) {
        projectUsers.forEach(user => {

          if (user) {
            this.user_and_bot_array.push({ '_id': user.id_user._id, 'firstname': user.id_user.firstname, 'lastname': user.id_user.lastname });
            this.team_ids_array.push(user.id_user._id);
          }
        });

        // console.log('% »»» WebSocketJs WF WS-RL - +++ USERS & BOTS ARRAY (1) ', this.user_and_bot_array);
      }
    }, (error) => {
      console.log('% »»» WebSocketJs WF WS-RL - +++ GET PROJECT-USERS ', error);
    }, () => {
      console.log('% »»» WebSocketJs WF WS-RL - +++ GET PROJECT-USERS * COMPLETE *');
      this.getAllBot();
    });
  }

  getAllBot() {
    this.faqKbService.getFaqKbByProjectId().subscribe((bots: any) => {
      console.log('% »»» WebSocketJs WF - +++ GET  BOT ', bots);

      if (bots) {
        bots.forEach(bot => {
          if (bot) {
            this.user_and_bot_array.push({ '_id': 'bot_' + bot._id, 'firstname': bot.name + ' (bot)' });
            this.team_ids_array.push('bot_' + bot._id);
          }
        });
      }
      // console.log('% »»» WebSocketJs WF WS-RL - +++ TEAM IDs ARRAY (2) ', this.team_ids_array);
      console.log('% »»» WebSocketJs WF WS-RL - +++ TEAM ARRAY (2) ', this.user_and_bot_array);
      // this.doFlatParticipantsArray()

    }, (error) => {
      console.log('% »»» WebSocketJs WF WS-RL - +++ GET  BOT ', error);
    }, () => {
      console.log('% »»» WebSocketJs WF WS-RL - +++ GET  BOT * COMPLETE *');
    });
  }

  doFlatParticipantsArray() {
    this.subscription = this.wsRequestsService.wsRequestsList$.subscribe((wsrequests) => {
      if (wsrequests) {
        let flat_participants_array = [];

        for (let i = 0; i < wsrequests.length; i++) {
          flat_participants_array = flat_participants_array.concat(wsrequests[i].participants);
        }

        // console.log('% »»» WebSocketJs WF WS-RL - +++ FLAT PARTICIPANTS IDs ARRAY ', flat_participants_array);
        if (flat_participants_array) {
          for (let i = 0; i < this.team_ids_array.length; i++) {
            // console.log('% »»» WebSocketJs WF WS-RL -  TEAM IDs ARRAY LENGTH ', this.team_ids_array.length);
            this.getAgentIdOccurrencesinFlatParticipantsArray(flat_participants_array, this.team_ids_array[i])
          }
        }
      }
    })
  }

  getAgentIdOccurrencesinFlatParticipantsArray(array, value) {
    // console.log('% »»» WebSocketJs WF WS-RL - CALLING GET OCCURRENCE REQUESTS FOR AGENT AND ASSIGN TO PROJECT USERS');
    let count = 0;
    array.forEach((v) => (v === value && count++));
    // console.log('% »»» WebSocketJs WF WS-RL - #', count, ' REQUESTS ASSIGNED TO AGENT WITH ID ', value);

    for (const agent of this.user_and_bot_array) {
      if (value === agent._id) {
        agent.value = count
      }
    }
    return count;
  }


  listenToRequestsLength() {
    this.subscription = this.wsRequestsService.ws_All_RequestsLength$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((totalrequests: number) => {
        console.log('% »»» WebSocketJs WF +++++ ws-requests--- list listenToRequestsLength RECEIVED NEXT wsRequestsList LENGTH', totalrequests)

        if (totalrequests === 0) {
          this.SHOW_SIMULATE_REQUEST_BTN = true
          this.showSpinner = false;
          console.log('% »»» WebSocketJs WF +++++ ws-requests---  listenToRequestsLength SHOW_SIMULATE_REQUEST_BTN ', this.SHOW_SIMULATE_REQUEST_BTN)
          console.log('% »»» WebSocketJs WF +++++ ws-requests---  listenToRequestsLength showSpinner ', this.showSpinner)

        } else if (totalrequests > 0) {

          this.showSpinner = false;
          this.SHOW_SIMULATE_REQUEST_BTN = false
          console.log('% »»» WebSocketJs WF +++++ ws-requests---  listenToRequestsLength SHOW_SIMULATE_REQUEST_BTN ', this.SHOW_SIMULATE_REQUEST_BTN)
          console.log('% »»» WebSocketJs WF +++++ ws-requests---  listenToRequestsLength showSpinner ', this.showSpinner)

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
      console.log('%%% WsRequestsList  USER ', user)
      // this.user = user;
      if (user) {
        this.currentUserID = user._id
        console.log('% »»» currentUserID WsRequestsList currentUser ID', this.currentUserID);
      }
    });
  }


  // -----------------------------------------------------------------------------------------------------
  // @ Subscribe to get the published current project (called On init)
  // -----------------------------------------------------------------------------------------------------
  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      console.log('WsRequestsList  project', project)
      if (project) {
        this.projectId = project._id;
        this.projectName = project.name;
      }
    });
  }


  seeIamAgentRequests(seeIamAgentReq) {
    this.ONLY_MY_REQUESTS = seeIamAgentReq
    console.log('% »»» WebSocketJs WF +++++ ws-requests--- list + ONLY_MY_REQUESTS ', this.ONLY_MY_REQUESTS);
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

    // this.display_dept_sidebar = true;
    // this.ws_requestslist_deptIdSelected = deptid

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


    for (let j = 0; j < agents.length; j++) {
      // console.log("% »»» WebSocketJs WF - WsRequestsList »»» »»» hasmeInAgents agent", agents[j]);
      console.log("% »»» WebSocketJs WF +++++ ws-requests--- list + hasmeInAgents currentUserID 2 ", this.currentUserID);
      // console.log("% »»» WebSocketJs WF - WsRequestsList id_user ", agents[j].id_user);

      if (this.currentUserID === agents[j].id_user) {
        return true
        // console.log("% »»» WebSocketJs WF +++++ ws-requests--- list + hasmeInAgents in If", iAmThere, '(forEach) the request id ', wsrequest.request_id, ' status: ', wsrequest.status, ' agent: ', agents );
      }
      // console.log("% »»» WebSocketJs WF +++++ ws-requests--- list + hasmeInAgents", iAmThere, '(forEach) the request id ', wsrequest.request_id, ' status: ', wsrequest.status, ' agent: ', agents );
      // return iAmThere
    }
  }

  // this check fix the bug: the request is assigned to a agent or admin od the dept A 
  // the the same requets is reassigned to an agent or admin of the dept B
  // the agent or admin doesn't see the request
  hasmeInParticipants(participants) {
    let iAmThere = false
    participants.forEach(participant => {
      console.log('% »»» WebSocketJs WF +++++ ws-requests--- list + hasmeInParticipants  participant', participant)
      if (participant === this.currentUserID) {
        // console.log('»»»»»»» UTILS MEMBERS ', members)
        // console.log('»»»»»»» CURRENT_USER_JOINED ', currentUserFireBaseUID);
        iAmThere = true;
        return
      }
    });
    console.log('% »»» WebSocketJs WF +++++ ws-requests--- list + hasmeInParticipants', iAmThere);
    return iAmThere;

  }

  // DEPTS_LAZY: add this 
  addDeptObject(wsrequests) {
    this.departmentService.getDeptsByProjectIdToPromise().then((_departments: any) => {

      console.log('WS-REQUESTS-UNSERVED-X-PANEL % »»» WebSocketJs WF +++++ ws-requests--- service -  X-> DEPTS <-X', _departments)

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

          request['dept'] = this.getDeptObj(request.department, _departments);


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

  // -----------------------------------------------------------------------------------------------------
  // @ Subscribe to get the published requests (called On init)
  // -----------------------------------------------------------------------------------------------------
  getWsRequests$() {
    console.log("% »»» WebSocketJs WF +++++ ws-requests--- list - enter NOW in getWsRequests$");
    this.wsRequestsService.wsRequestsList$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((wsrequests) => {

        // DEPTS_LAZY: add this 
        this.addDeptObject(wsrequests)

        // console.log("% »»» WebSocketJs WF +++++ ws-requests--- list - subscribe ", wsrequests);

        if (wsrequests) {
          console.log("% »»» WebSocketJs WF +++++ ws-requests--- list - subscribe > if (wsrequests) ", wsrequests);
          this.browserRefresh = browserRefresh;

          // console.log("% »»» WebSocketJs WF +++++ ws-requests--- list subscribe > if (wsrequests) browserRefresh ", this.browserRefresh, 'wsRequestsList$.value length ', this.wsRequestsService.wsRequestsList$.value.length);


          if ((this.browserRefresh === false) || (this.browserRefresh === true && this.wsRequestsService.wsRequestsList$.value.length > 0)) {
            if (wsrequests.length > 0) {

              this.SHOW_SIMULATE_REQUEST_BTN = false;
              console.log('% »»» WebSocketJs WF +++++ ws-requests--- list ----- SHOW_SIMULATE_REQUEST_BTN ', this.SHOW_SIMULATE_REQUEST_BTN)
              this.showSpinner = false;
              console.log('% »»» WebSocketJs WF +++++ ws-requests--- list ----- SHOW_SPINNER ', this.showSpinner)


            } else if (wsrequests.length === 0) {
              this.SHOW_SIMULATE_REQUEST_BTN = true;
              console.log('% »»» WebSocketJs WF +++++ ws-requests--- list ----- SHOW_SIMULATE_REQUEST_BTN ', this.SHOW_SIMULATE_REQUEST_BTN)
              this.showSpinner = false;
              console.log('% »»» WebSocketJs WF +++++ ws-requests--- list ----- SHOW_SPINNER ', this.showSpinner)
            }
          }



          if (this.ONLY_MY_REQUESTS === false) {
            this.ws_requests = wsrequests;
            // console.log('% »»» WebSocketJs WF +++++ ws-requests--- list - ONLY_MY_REQUESTS: ', this.ONLY_MY_REQUESTS, ' - this.ws_requests: ', this.ws_requests)
          }

          if (this.ONLY_MY_REQUESTS === true) {
            this.ws_requests = [];
            wsrequests.forEach(wsrequest => {
              // console.log('% »»» WebSocketJs WF +++++ ws-requests--- list - ONLY_MY_REQUESTS: ', this.ONLY_MY_REQUESTS, ' - (forEach) wsrequest: ', wsrequest);

              // const imInParticipants = this.hasmeInParticipants(wsrequest.participants)
              // console.log("% »»» WebSocketJs - WsRequestsService imInParticipants ", imInParticipants, 'for the request ', wsrequest.participants);

              if (wsrequest !== null && wsrequest !== undefined) {
                // || wsrequest.status === 100
                // console.log("% »»» WebSocketJs WF +++++ ws-requests--- list - »»» »»» hasmeInAgents ONLY_MY_REQUESTS forEach hasmeInAgents", this.hasmeInAgents(wsrequest.agents, wsrequest));

                if (this.hasmeInAgents(wsrequest.agents, wsrequest) === true || this.hasmeInParticipants(wsrequest.participants) === true) {

                  this.ws_requests.push(wsrequest);
                }
              }
            });

            // console.log('% »»» WebSocketJs WF +++++ ws-requests--- list - ONLY_MY_REQUESTS  ', this.ONLY_MY_REQUESTS, 'this.ws_requests', this.ws_requests)
          }

          // DEPTS_LAZY: comment this 2 lines
          // var ws_requests_clone = JSON.parse(JSON.stringify(this.ws_requests));
          // this.getDeptsAndCountOfDeptsInRequests(ws_requests_clone);

          this.getParticipantsInRequests(this.ws_requests);


        }

        // console.log('% »»» WebSocketJs WF - WsRequestsList getWsRequests$ ws_request ', wsrequests)


        // this.ws_requests.forEach(request => {
        this.ws_requests.forEach((request) => {

          console.log('WS-REQUESTS-UNSERVED-X-PANEL - WsRequestsList request ', request)

          const user_agent_result = this.parseUserAgent(request.userAgent)
          // console.log('% »»» WebSocketJs WF - WsRequestsList - USER-AGENT RESULT ', user_agent_result)      

          const ua_browser = user_agent_result.browser.name + ' ' + user_agent_result.browser.version
          // console.log('% »»» WebSocketJs WF - WsRequestsList - USER-AGENT BROWSER ', ua_browser)
          request['ua_browser'] = ua_browser;

          const ua_os = user_agent_result.os.name + ' ' + user_agent_result.os.version
          // console.log('% »»» WebSocketJs WF - WsRequestsList - USER-AGENT OPERATING SYSTEM ', ua_os)
          request['ua_os'] = ua_os;

          // console.log("% »»» currentUserID WebSocketJs WF - WsRequestsList in ws_requests.forEach ", this.currentUserID);
          // console.log("% »»» currentUserID WebSocketJs WF - WsRequestsList in ws_requests.forEach 2 ", this.auth.user_bs.value._id);


          //  console.log('% »»» WebSocketJs WF - WsRequestsList - department id ', request.department)
          // if (this.departments) {
          //   this.departments.forEach(dept => {
          //     if (dept.id === request.department) {
          //       request['dept'] = dept;
          //     }
          //   });
          // }



          //  replace this.currentUserID with this.auth.user_bs.value._id  because at the go back from the request's details this.currentUserID at the moment in which is passed in currentUserIdIsInParticipants is undefined 
          request['currentUserIsJoined'] = this.currentUserIdIsInParticipants(request.participants, this.auth.user_bs.value._id, request.request_id);

          if (request.status === 200) {
            // USE CASE L'ARRAY new_participants è UNDEFINED x es al refresh o quando si entra nella pagina (anche al back dal dettaglio) o all' UPDATE
            // console.log('!! Ws SHARED  (from request list) PARTICIPATING-AGENTS  ', request['participantingAgents']);

            if (!request['participanting_Agents']) {

              console.log('!! Ws SHARED  (from request list) PARTICIPATING-AGENTS IS ', request['participanting_Agents'], ' - RUN DO ');

              request['participanting_Agents'] = this.doParticipatingAgentsArray(request.participants, request.first_text)

            } else {

              console.log('!! Ws SHARED  (from request list) PARTICIPATING-AGENTS IS DEFINED');
              // USE CASE L'ARRAY new_participants è definito per es arriva un nuova richiesta: new_participants x le richieste già esistenti

              // const participantingAgentsIds = []

              // request['participanting_Agents'].forEach(participant => {
              //   participantingAgentsIds.push(participant['_id'])
              // });
              // console.log('!! Ws SHARED (from request list) PARTICIPATING-AGENTS IDS ARRAY ', participantingAgentsIds);
              // console.log('!! Ws SHARED (from request list) PARTICIPANTS ', request.participants);
            }
          }
          // this.createFullParticipacipantsArray(request, request.participants)


          // request["test"] = this.newParticipants
          // console.log('!! Ws SHARED  (from) »»»»»»» createFullParticipacipantsArray request["test"] ' , request["test"]);

          if (request.lead && request.lead.fullname) {
            request['requester_fullname_initial'] = avatarPlaceholder(request.lead.fullname);
            request['requester_fullname_fillColour'] = getColorBck(request.lead.fullname)
          } else {

            request['requester_fullname_initial'] = 'N/A';
            request['requester_fullname_fillColour'] = '#6264a7';
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
        console.log('% »»» WebSocketJs WF +++++ ws-requests--- list getWsRequests (served)', this.wsRequestsServed);
        console.log('% »»» WebSocketJs WF +++++ ws-requests--- list getWsRequests (unserved)', this.wsRequestsUnserved);


      }, error => {
        console.log('% WsRequestsList getWsRequests$ * error * ', error)
      }, () => {


        console.log('% »»» WebSocketJs WF +++++ ws-requests--- list getWsRequests */* COMPLETE */*')
      })
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








  archiveRequest(request_id) {
    this.notify.showArchivingRequestNotification(this.archivingRequestNoticationMsg);
    console.log('WS-REQUESTS-UNSERVED - HAS CLICKED ARCHIVE REQUEST ');


    this.wsRequestsService.closeSupportGroup(request_id)
      .subscribe((data: any) => {
        console.log('WS-REQUESTS-UNSERVED - CLOSE SUPPORT GROUP - DATA ', data);
      }, (err) => {
        console.log('WS-REQUESTS-UNSERVED - CLOSE SUPPORT GROUP - ERROR ', err);


        // =========== NOTIFY ERROR ===========
        // this.notify.showNotification('An error has occurred archiving the request', 4, 'report_problem');
        this.notify.showNotification(this.archivingRequestErrorNoticationMsg, 4, 'report_problem');
      }, () => {
        // this.ngOnInit();
        console.log('CLOSE SUPPORT GROUP - COMPLETE');

        // =========== NOTIFY SUCCESS===========
        // this.notify.showNotification(`request with id: ${this.id_request_to_archive} has been moved to History`, 2, 'done');
        this.notify.showRequestIsArchivedNotification(this.requestHasBeenArchivedNoticationMsg_part1);

        // this.onArchiveRequestCompleted()
      });
  }


}




