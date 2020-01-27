import { Component, OnInit, OnDestroy, AfterViewInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { WsRequestsService } from '../../services/websocket/ws-requests.service';
import { UsersLocalDbService } from '../../services/users-local-db.service';
import { BotLocalDbService } from '../../services/bot-local-db.service';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { avatarPlaceholder, getColorBck } from '../../utils/util';
import { NotifyService } from '../../core/notify.service';
import { RequestsService } from '../../services/requests.service';
import { TranslateService } from '@ngx-translate/core';
import { WsSharedComponent } from '../ws-shared/ws-shared.component';
import * as firebase from 'firebase/app';
import { Request } from '../../models/request-model';
import { UsersService } from '../../services/users.service';
import { UAParser } from 'ua-parser-js'
import { FaqKbService } from '../../services/faq-kb.service';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { AppConfigService } from '../../services/app-config.service';
import { Subscription } from 'rxjs/Subscription';
import PerfectScrollbar from 'perfect-scrollbar';
import { DepartmentService } from '../../services/mongodb-department.service';
import { environment } from '../../../environments/environment';
import { distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'appdashboard-ws-requests-list',
  templateUrl: './ws-requests-list.component.html',
  styleUrls: ['./ws-requests-list.component.scss']
})
export class WsRequestsListComponent extends WsSharedComponent implements OnInit, AfterViewInit, OnDestroy {

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

  TESTSITE_BASE_URL = environment.testsite.testsiteBaseUrl;
  projectName: string;

  participantsInRequests: any;
  deptsArrayBuildFromRequests: any;

  filter: any[] = [{ 'deptId': null }, { 'agentId': null }];
  hasFiltered = false;
  

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
    private usersService: UsersService,
    private faqKbService: FaqKbService,
    public appConfigService: AppConfigService,
    private departmentService: DepartmentService,

  ) {
    super(botLocalDbService, usersLocalDbService, router, wsRequestsService);
    this.zone = new NgZone({ enableLongStackTrace: false });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit() {
    console.log("% »»» WebSocketJs WF +++++ ws-requests--- list ----- ngOnInit ");
    this.getWsRequests$();
    this.getCurrentProject();
    this.getLoggedUser();
    this.getProjectUserRole();
    this.getStorageBucket();
    // this.listenToRequestsLength();

    // this.for1();
    // this.getRequestsTotalCount()  
    // this.getAllProjectUsersAndBot();
    // this.getDepartments();
    // const teamContentEl = <HTMLElement>document.querySelector('.team-content');
    // const perfs = new PerfectScrollbar(teamContentEl);
    // this.selectedDeptId = '';
    // this.selectedAgentId = '';
  }

  ngAfterViewInit() {
    
  }

  ngOnDestroy() {
    console.log('% »»» WebSocketJs WF +++++ ws-requests--- list ≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥ ngOnDestroy')
    // this.subscription.unsubscribe()
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
    this.wsRequestsService.wsRequestsListLength$.subscribe((totalrequests: number) => {

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
    
    this.subscription =  this.wsRequestsService.wsRequestsListLength$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((totalrequests: number) => {
        console.log('% »»» WebSocketJs WF +++++ ws-requests--- list ≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥ listenToRequestsLength RECEIVED NEXT wsRequestsList LENGTH', totalrequests)

       
      

        if (totalrequests === 0) {
          this.SHOW_SIMULATE_REQUEST_BTN = true
          this.showSpinner = false;
          console.log('% »»» WebSocketJs WF +++++ ws-requests--- ≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥ listenToRequestsLength SHOW_SIMULATE_REQUEST_BTN ', this.SHOW_SIMULATE_REQUEST_BTN)
          console.log('% »»» WebSocketJs WF +++++ ws-requests--- ≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥ listenToRequestsLength showSpinner ', this.showSpinner)

        } else if (totalrequests > 0) {

          this.showSpinner = false;
          this.SHOW_SIMULATE_REQUEST_BTN = false
          console.log('% »»» WebSocketJs WF +++++ ws-requests--- ≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥ listenToRequestsLength SHOW_SIMULATE_REQUEST_BTN ', this.SHOW_SIMULATE_REQUEST_BTN)
          console.log('% »»» WebSocketJs WF +++++ ws-requests--- ≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥ listenToRequestsLength showSpinner ', this.showSpinner)

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


  getProjectUserRole() {
    this.usersService.project_user_role_bs.subscribe((user_role) => {
      console.log('% »»» WebSocketJs WF - WsRequestsList USER ROLE ', user_role);
      if (user_role) {
        if (user_role === 'agent') {
          this.ROLE_IS_AGENT = true
          this.displayBtnLabelSeeYourRequets = true
        } else {
          this.ROLE_IS_AGENT = false
          this.displayBtnLabelSeeYourRequets = false;
        }
      }
    });
  }


  seeIamAgentRequests(seeIamAgentReq) {
    this.ONLY_MY_REQUESTS = seeIamAgentReq
    console.log('% »»» WebSocketJs WF - WsRequestsList ONLY_MY_REQUESTS ', this.ONLY_MY_REQUESTS);
    if (seeIamAgentReq === false) {
      this.displayBtnLabelSeeYourRequets = false;
    } else {
      this.displayBtnLabelSeeYourRequets = true;
    }
    this.getWsRequests$()
  }

  hasmeInAgents(agents, wsrequest) {
    let iAmThere = false
    for (let j = 0; j < agents.length; j++) {
      // console.log("% »»» WebSocketJs - WsRequestsService AGENT ", agents[j]);
      // console.log("% »»» WebSocketJs WF - WsRequestsList currentUserID 2 ", this.currentUserID);
      // console.log("% »»» WebSocketJs WF - WsRequestsList id_user ", agents[j].id_user);

      if (this.currentUserID === agents[j].id_user) {
        iAmThere = true
      }
      // console.log("% »»» WebSocketJs WF - WsRequestsList »»» »»» hasmeInAgents", iAmThere, ' request status ', wsrequest.status);
      return iAmThere
    }
  }

  hasmeInParticipants(participants) {
    let iAmThere = false
    participants.forEach(participant => {
      console.log('% »»» WebSocketJs WF - WsRequestsList hasmeInParticipants  participants', participant)
      if (participant === this.currentUserID) {
        // console.log('»»»»»»» UTILS MEMBERS ', members)
        // console.log('»»»»»»» CURRENT_USER_JOINED ', currentUserFireBaseUID);
        iAmThere = true;
        return
      }
    });
    // console.log('»»»»»»» CURRENT USER ', currentUserFireBaseUID, ' is JOINED ?', currentUserIsJoined, 'to the request ', request_id);
    return iAmThere;

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
    // this.filter.push({ 'deptId': this.selectedDeptId }) //['deptId'] = 
    this.filter[0]['deptId'] = this.selectedDeptId
    // console.log('% »»» WebSocketJs WF WS-RL - on Change Depts - filter', this.filter)
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

  // -----------------------------------------------------------------------------------------------------
  // @ Subscribe to get the published requests (called On init)
  // -----------------------------------------------------------------------------------------------------
  getWsRequests$() {

    this.wsRequestsService.wsRequestsList$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((wsrequests) => {

        console.log("% »»» WebSocketJs WF +++++ ws-requests--- list ----- subscribe to NEXT ", wsrequests);
      
        if (wsrequests) {
          
          if (Array.isArray(wsrequests)) {

            // https://stackoverflow.com/questions/18983138/callback-after-all-asynchronous-foreach-callbacks-are-completed
            let requests = wsrequests.map((item) => {
              return new Promise((resolve) => {
                this.asyncFunction(item, resolve);
              });
            })
            Promise.all(requests).then(() => {

              console.log('% »»» WebSocketJs WF +++++ ws-requests--- list ≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥ done -> data.length ', wsrequests.length)
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

            });

          }

    
          // console.log('% »»» WebSocketJs WF - WsRequestsList >>>>>>> WS-REQUESTS-LENGHT <<<<<<< ', wsrequests.length)
          
            
            // if (wsrequests.length > 0) {

            //   this.SHOW_SIMULATE_REQUEST_BTN = false;
            //   console.log('% »»» WebSocketJs WF +++++ ws-requests--- list ----- SHOW_SIMULATE_REQUEST_BTN ', this.SHOW_SIMULATE_REQUEST_BTN)
            //   this.showSpinner = false;
            //   console.log('% »»» WebSocketJs WF +++++ ws-requests--- list ----- SHOW_SPINNER ', this.showSpinner)


            // } else if (wsrequests.length === 0) {
            //   this.SHOW_SIMULATE_REQUEST_BTN = true;
            //   console.log('% »»» WebSocketJs WF +++++ ws-requests--- list ----- SHOW_SIMULATE_REQUEST_BTN ', this.SHOW_SIMULATE_REQUEST_BTN)
            //   this.showSpinner = false;
            //   console.log('% »»» WebSocketJs WF +++++ ws-requests--- list ----- SHOW_SPINNER ', this.showSpinner)
            // }
          


          if (this.ONLY_MY_REQUESTS === false) {
            this.ws_requests = wsrequests;
            // console.log('% »»» WebSocketJs WF - WsRequestsList ONLY_MY_REQUESTS: ', this.ONLY_MY_REQUESTS, ' - this.ws_requests: ', this.ws_requests)
          }

          if (this.ONLY_MY_REQUESTS === true) {
            this.ws_requests = [];
            wsrequests.forEach(wsrequest => {
              // console.log('% »»» WebSocketJs WF - WsRequestsList wsrequest ', wsrequest)

              // const imInParticipants = this.hasmeInParticipants(wsrequest.participants)
              // console.log("% »»» WebSocketJs - WsRequestsService imInParticipants ", imInParticipants, 'for the request ', wsrequest.participants);

              if (wsrequest !== null && wsrequest !== undefined) {
                // || wsrequest.status === 100
                if (this.hasmeInAgents(wsrequest.agents, wsrequest) === true || this.hasmeInParticipants(wsrequest.participants) === true) {

                  this.ws_requests.push(wsrequest);
                }
              }
            });

            console.log('% »»» WebSocketJs WF - WsRequestsList ONLY_MY_REQUESTS  ', this.ONLY_MY_REQUESTS, 'this.ws_requests', this.ws_requests)
          }

          var ws_requests_clone = JSON.parse(JSON.stringify(this.ws_requests));

          this.getDeptsAndCountOfDeptsInRequests(ws_requests_clone);

          this.getParticipantsInRequests(this.ws_requests);

          if (this.hasFiltered === true) {
            this.ws_requests = this.ws_requests.filter(r => {
              // console.log('% »»» WebSocketJs WF WS-RL - WsRequestsList filter r department : ', r.department._id);
              // console.log('% »»» WebSocketJs WF WS-RL - WsRequestsList filter selectedDeptId : ', this.selectedDeptId);

              console.log('% »»» WebSocketJs WF WS-RL - WsRequestsList filter: ', this.filter);
              // console.log('% »»» WebSocketJs WF WS-RL - WsRequestsList filter[0]: ', this.filter[0]);
              // console.log('% »»» WebSocketJs WF WS-RL - WsRequestsList filter[1]: ', this.filter[1]);

              // -----------------------------------------------------------------------------------------------------------
              // USECASE: filter only for department
              // -----------------------------------------------------------------------------------------------------------
              if (this.filter[0] !== undefined && this.filter[0]['deptId'] !== null && this.filter[1]['agentId'] === null) {
                console.log('% »»» WebSocketJs WF WS-RL - <<<<<<<<<<<<<< FILTER USECASE 1  >>>>>>>>>>>>>>  filter only for department ');
                console.log('% »»» WebSocketJs WF WS-RL - WsRequestsList >>> filter[deptId] <<< ', this.filter[0]['deptId']);

                if (r['department']['_id'] === this.filter[0]['deptId']) {
                  return true
                } else {
                  return false
                }
              }

              // -----------------------------------------------------------------------------------------------------------
              // USECASE: filter only for participant
              // -----------------------------------------------------------------------------------------------------------
              if (this.filter[1] !== undefined && this.filter[1]['agentId'] !== null && this.filter[0]['deptId'] === null) {
                console.log('% »»» WebSocketJs WF WS-RL - <<<<<<<<<<<<<< FILTER USECASE 2  >>>>>>>>>>>>>> filter only for participant');
                console.log('% »»» WebSocketJs WF WS-RL - WsRequestsList >>> filter[agentId] <<< ', this.filter[1]['agentId']);
                if (r['participants'].includes(this.filter[1]['agentId'])) {
                  return true
                } else {
                  return false
                }
              }


              // -----------------------------------------------------------------------------------------------------------
              // USECASE: filter for department & participant
              // -----------------------------------------------------------------------------------------------------------
              if (this.filter[1] !== undefined && this.filter[1]['agentId'] !== null && this.filter[0] !== undefined && this.filter[0]['deptId'] !== null) {
                console.log('% »»» WebSocketJs WF WS-RL - <<<<<<<<<<<<<< FILTER USECASE 3 >>>>>>>>>>>>>> filter for dept & participant');
                console.log('% »»» WebSocketJs WF WS-RL - WsRequestsList >>> filter[agentId] <<< ', this.filter[1]['agentId']);
                if (r['participants'].includes(this.filter[1]['agentId']) && (r['department']['_id'] === this.filter[0]['deptId'])) {
                  return true
                } else {
                  return false
                }
              }

              // -----------------------------------------------------------------------------------------------------------
              // USECASE: all filters have been canceled
              // -----------------------------------------------------------------------------------------------------------
              if (this.filter[1]['agentId'] === null && this.filter[0]['deptId'] === null) {
                console.log('% »»» WebSocketJs WF WS-RL - <<<<<<<<<<<<<< FILTER USECASE 4 >>>>>>>>>>>>>> all filters have been canceled');
                this.hasFiltered = false
                return true
              }

              // else {
              //   return false
              // }


              console.log('% »»» WebSocketJs WF WS-RL - WsRequestsList filter[deptId]: ', this.filter[0]['deptId']);

            });
          }
        }

        // console.log('% »»» WebSocketJs WF - WsRequestsList getWsRequests$ ws_request ', wsrequests)





        // this.ws_requests.forEach(request => {
        this.ws_requests.forEach((request) => {

          const user_agent_result = this.parseUserAgent(request.userAgent)

          const ua_browser = user_agent_result.browser.name + ' ' + user_agent_result.browser.version
          // console.log('% »»» WebSocketJs WF - WsRequestsList - USER-AGENT BROWSER ', ua_browser)

          request['ua_browser'] = ua_browser;

          const ua_os = user_agent_result.os.name + ' ' + user_agent_result.os.version
          // console.log('% »»» WebSocketJs WF - WsRequestsList - USER-AGENT OPERATING SYSTEM ', ua_os)

          request['ua_os'] = ua_os;

          // console.log("% »»» currentUserID WebSocketJs WF - WsRequestsList in ws_requests.forEach ", this.currentUserID);
          // console.log("% »»» currentUserID WebSocketJs WF - WsRequestsList in ws_requests.forEach 2 ", this.auth.user_bs.value._id);


          //  replace this.currentUserID with this.auth.user_bs.value._id  because at the go back from the request's details this.currentUserID at the moment in which is passed in currentUserIdIsInParticipants is undefined 
          request['currentUserIsJoined'] = this.currentUserIdIsInParticipants(request.participants, this.auth.user_bs.value._id, request.request_id);


          if (request.lead && request.lead.fullname) {
            request['requester_fullname_initial'] = avatarPlaceholder(request.lead.fullname);
            request['requester_fullname_fillColour'] = getColorBck(request.lead.fullname)
          } else {

            request['requester_fullname_initial'] = 'n.a.';
            request['requester_fullname_fillColour'] = '#eeeeee';
          }

          if (request.lead
            && request.lead.attributes
            && request.lead.attributes.senderAuthInfo
            && request.lead.attributes.senderAuthInfo.authVar
            && request.lead.attributes.senderAuthInfo.authVar.token
            && request.lead.attributes.senderAuthInfo.authVar.token.firebase
            && request.lead.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider
          ) {
            if (request.lead.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider === 'custom') {

              // console.log('- lead sign_in_provider ',  request.lead.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider);
              request['requester_is_verified'] = true;
            } else {
              // console.log('- lead sign_in_provider ',  request.lead.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider);
              request['requester_is_verified'] = false;
            }

          } else {
            request['requester_is_verified'] = false;
          }

        });


        /**
         * Sort requests and manage spinner
         */
        if (this.ws_requests) {
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
      }, error => {
        console.log('% WsRequestsList getWsRequests$ * error * ', error)
      });
  }

  _getWsRequests$() {
    this.wsRequestsService.messages.subscribe((websocketResponse) => {

      if (websocketResponse) {
        console.log('% WsRequestsList getWsRequests$websocket Response', websocketResponse)

        const wsRequests = websocketResponse['payload']['message']
        console.log('% WsRequestsList getWsRequests$websocket Requests (all)', wsRequests);

        this.wsRequestsUnserved = wsRequests
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

        this.wsRequestsServed = wsRequests
          .filter(r => {
            if (r['status'] !== 100) {

              return true
            } else {
              return false
            }
          });
      }

      console.log('% WsRequestsList getWsRequests$ (served)', this.wsRequestsServed);
      console.log('% WsRequestsList getWsRequests$ (unserved)', this.wsRequestsUnserved);

    }, error => {
      console.log('% WsRequestsList getWsRequests$ * error * ', error)
    });
  }


  replace_recipient(request_recipient: string) {
    if (request_recipient) {
      return request_recipient.replace('support-group-', '');
    }
  }



  testWidgetPage() {
    this.testwidgetbtnRef.nativeElement.blur();

    // const url = 'http://support.tiledesk.com/testsite/?projectid=' + this.projectId;
    // + '&projectname=' + this.projectName
    // const url = 'http://testwidget.tiledesk.com/testsitenw3?projectname=' + this.projectName + ' &projectid=' + this.projectId
    const url = this.TESTSITE_BASE_URL + '?tiledesk_projectid=' + this.projectId + '&project_name=' + this.projectName + '&isOpen=true'


    // + '&prechatform=' + false + '&callout_timer=' + false + '&align=right';
    window.open(url, '_blank');
  }





}



