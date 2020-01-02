import { Component, OnInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { WsRequestsService } from '../services/websocket/ws-requests.service';
import { UsersLocalDbService } from '../services/users-local-db.service';
import { BotLocalDbService } from '../services/bot-local-db.service';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { avatarPlaceholder, getColorBck } from '../utils/util';
import { NotifyService } from '../core/notify.service';
import { RequestsService } from '../services/requests.service';
import { TranslateService } from '@ngx-translate/core';
import { WsSharedComponent } from '../ws-shared/ws-shared.component';
import * as firebase from 'firebase/app';
import { Request } from '../models/request-model';
import { UsersService } from '../services/users.service';
import { UAParser } from 'ua-parser-js'
import { FaqKbService } from '../services/faq-kb.service';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { AppConfigService } from '../services/app-config.service';
import { Subscription } from 'rxjs/Subscription';
import PerfectScrollbar from 'perfect-scrollbar';
import { DepartmentService } from '../services/mongodb-department.service';
import { environment } from '../../environments/environment';
@Component({
  selector: 'appdashboard-ws-requests-list',
  templateUrl: './ws-requests-list.component.html',
  styleUrls: ['./ws-requests-list.component.scss']
})
export class WsRequestsListComponent extends WsSharedComponent implements OnInit {

  // @ViewChild('teamContent', { read: ElementRef }) public teamContent: ElementRef<any>;
  @ViewChild('teamContent') private teamContent: ElementRef;
  @ViewChild('testwidgetbtn') private testwidgetbtnRef: ElementRef;

  wsRequestsServed: any;
  wsRequestsUnserved: any;
  projectId: string;
  zone: NgZone;
  SHOW_SIMULATE_REQUEST_BTN: boolean;
  showSpinner = true;

  ws_requests: any[] = [];

  displayArchiveRequestModal = 'none';
  ARCHIVE_REQUEST_ERROR = false;
  id_request_to_archive: string;

  archivingRequestErrorNoticationMsg: string;
  archivingRequestNoticationMsg: string;
  requestHasBeenArchivedNoticationMsg_part1: string;
  requestHasBeenArchivedNoticationMsg_part2: string;

  firebase_token: any;

  OPEN_RIGHT_SIDEBAR = false;
  selectedQuestion: string;
  train_bot_sidebar_height: any;

  currentUserID: string;
  depts_array_noduplicate = [];

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

  hasFiltered = false;

  /**
   * Constructor
   * 
   * @param {WsRequestsService} wsRequestsService 
   * @param {Router} router 
   * @param {UsersLocalDbService} usersLocalDbService 
   * @param {BotLocalDbService} botLocalDbService 
   * @param {AuthService} auth 
   * @param {NotifyService} notify 
   * @param {RequestsService} requestsService
   * @param {TranslateService} translate  
   */
  constructor(
    public wsRequestsService: WsRequestsService,
    private router: Router,
    public usersLocalDbService: UsersLocalDbService,
    public botLocalDbService: BotLocalDbService,
    public auth: AuthService,
    private notify: NotifyService,
    private requestsService: RequestsService,
    private translate: TranslateService,
    private usersService: UsersService,
    private faqKbService: FaqKbService,
    public appConfigService: AppConfigService,
    private departmentService: DepartmentService,

  ) {
    super(botLocalDbService, usersLocalDbService);
    this.zone = new NgZone({ enableLongStackTrace: false });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit() {
    this.getWsRequests$();
    this.getCurrentProject();
    this.getTranslations();
    this.getLoggedUser();
    this.getProjectUserRole();

    // this.listenToDismissWsRequestsSpinner();

    this.for1();

    // this.getRequestsTotalCount()

    this.getStorageBucket();
    this.getAllProjectUsersAndBot();

    // const teamContentEl = <HTMLElement>document.querySelector('.team-content');
    // const perfs = new PerfectScrollbar(teamContentEl);
    this.getDepartments();

    // this.selectedDeptId = '';
    // this.selectedAgentId = '';
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

  onChangeDepts() {
    this.hasFiltered = true
    // this.getWsRequests$();
    console.log('% »»» WebSocketJs WF WS-RL - onChangeDepts dept id', this.selectedDeptId)
    // this.wsRequestsUnserved = [];
    // this.wsRequestsServed = [];
    // console.log('% »»» WebSocketJs WF WS-RL - onChangeDepts ws_requests', this.ws_requests)


    // const myClonedArray = Object.assign([], this.ws_requests);
    // console.log('% »»» WebSocketJs WF WS-RL - myClonedArray ', myClonedArray)

    // const results = []
    // console.log('% »»» WebSocketJs WF WS-RL - onChangeDepts results', results)
    // this.ws_requests = results
    // myClonedArray.forEach(wsr => {
    //   console.log('% »»» WebSocketJs WF WS-RL - onChangeDepts wsr', wsr)
    //   if (wsr.department._id === this.selectedDeptId) {
    //     results.push(wsr)
    //   }
    // });

    // this.ws_requests = this.ws_requests.filter((obj: any) => {
    //   if (this.selectedDeptId && obj) {
    //     return obj.department._id === this.selectedDeptId;
    //   }
    // });

  }

  clearDeptFilter() {
    console.log('% »»» WebSocketJs WF WS-RL - clearDeptFilter selectedDeptId', this.selectedDeptId)
  }

  onChangeAgent() {

    console.log('% »»» WebSocketJs WF WS-RL - onChangeAgent selectedAgentId', this.selectedAgentId)
  }

  clearAgentFilter() {
    console.log('% »»» WebSocketJs WF WS-RL - clearAgentFilter selectedAgentId', this.selectedAgentId)
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

    // console.log('% »»» WebSocketJs WF >>>>>>>>> >>>>>>> FOR 1 Lenght ', this.Xlength);
    // console.log('% »»» WebSocketJs WF >>>>>>>>> >>>>>>> FOR 1 ', this.i);

    if (this.Xlength !== undefined) {

      this.for2();

    } else if (this.Xlength === undefined) {
      setTimeout(() => {
        this.showSpinner = false;
      }, 100);
    }
  }

  for2() {
    // var length = 10;
    if (this.i == this.Xlength) {
      // console.log('% »»» WebSocketJs WF >>>>>>>>> >>>>>>> FOR 1 == Xlength ');
      this.showSpinner = false;
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
      // console.log('% »»» WebSocketJs WF WS-RL - +++ TEAM ARRAY (2) ', this.user_and_bot_array);


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
    // this.showSpinner = false;
    // console.log('% »»» WebSocketJs WF WS-RL - !!!!! SHOW SPINNER', this.showSpinner);
    return count;
  }


  listenToDismissWsRequestsSpinner() {
    // this.wsRequestsService.wsRequestsListLength$.subscribe((totalrequests: number) => {
    //   console.log('% »»» WebSocketJs WF - WsRequestsList totalrequests (1) ', totalrequests)

    //   if (totalrequests) {
    //     this.totalRequests = totalrequests

    //   }
    // })
    // setTimeout(() => {
    //   // replaySubject.subscribe(lateReplayObserver);


    //   this.wsRequestsService.wsRequestsListLength$$.subscribe((totalrequests: number) => {
    //     console.log('% »»» WebSocketJs WF - WsRequestsList >>>>>>> REPLAY TOTAL-REQUESTS <<<<<<< ', totalrequests)

    //     if (totalrequests) {
    //       this.totalRequests = totalrequests

    //     }
    //   })

    // }, 1500);
    this.wsRequestsService.wsRequestsListLength$.subscribe((totalrequests: number) => {
      console.log('% »»» WebSocketJs WF - WsRequestsList >>>>>>> >>>>>>> AS-OBSERVABLE TOTAL-REQUESTS <<<<<<< ', totalrequests)
      console.log('% »»» WebSocketJs WF - WsRequestsList >>>>>>> >>>>>>> BEHAVIOUR TOTAL-REQUESTS <<<<<<< ', totalrequests)
      // console.log('% »»» WebSocketJs WF - WsRequestsList >>>>>>> >>>>>>> THIS.WS-REQUESTS LENGTH <<<<<<< ', this.ws_requests.length)
      if (totalrequests) {
        this.totalRequests = totalrequests

        // if (this.ws_requests.length === this.totalRequests) {

        //   this.showSpinner = fals
        // }
      }
    })

  }


  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      console.log('%%% WsRequestsList  USER ', user)

      // this.user = user;
      if (user) {
        this.currentUserID = user._id
        console.log('%%% WsRequestsList currentUser ID', this.currentUserID);

      }
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Translations (called On init)
  // -----------------------------------------------------------------------------------------------------

  getTranslations() {
    this.translateArchivingRequestErrorMsg();
    this.translateArchivingRequestMsg();
    this.translateRequestHasBeenArchivedNoticationMsg_part1();
    this.translateRequestHasBeenArchivedNoticationMsg_part2();

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
  translateArchivingRequestMsg() {
    this.translate.get('ArchivingRequestNoticationMsg')
      .subscribe((text: string) => {

        this.archivingRequestNoticationMsg = text;
        // console.log('+ + + ArchivingRequestNoticationMsg', text)
      });
  }

  // TRANSLATION
  translateRequestHasBeenArchivedNoticationMsg_part1() {
    this.translate.get('RequestHasBeenArchivedNoticationMsg_part1')
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
      console.log("% »»» WebSocketJs WF - WsRequestsList currentUserID 2 ", this.currentUserID);
      console.log("% »»» WebSocketJs WF - WsRequestsList id_user ", agents[j].id_user);

      if (this.currentUserID === agents[j].id_user) {
        iAmThere = true

      }

      console.log("% »»» WebSocketJs WF - WsRequestsList »»» »»» hasmeInAgents", iAmThere, ' request status ', wsrequest.status);
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



  // -----------------------------------------------------------------------------------------------------
  // @ Subscribe to get the published requests (called On init)
  // -----------------------------------------------------------------------------------------------------
  getWsRequests$() {
    this.wsRequestsService.wsRequestsList$.subscribe((wsrequests) => {

      if (wsrequests) {
        // this.showSpinner = false;

        console.log('% »»» WebSocketJs WF WS-RL - WsRequestsList ALL-REQUESTS: ', wsrequests);


        // if (this.hasFiltered === true) {
        //   // this.ws_requests = [];

        //   console.log('% »»» WebSocketJs WF WS-RL - WsRequestsList QUI SI ');
        //   this.ws_requests.filter(r => {
        //     console.log('% »»» WebSocketJs WF WS-RL - WsRequestsList filter r department : ', r.department._id);

        //     // if (r['department']['_id'] === this.selectedDeptId) {
        //     //   return true
        //     // } else {
        //     //   return false
        //     // }
        //   });
        // }

        if (this.ONLY_MY_REQUESTS === false) {

          this.ws_requests = wsrequests;
          console.log('% »»» WebSocketJs WF - WsRequestsList ONLY_MY_REQUESTS: ', this.ONLY_MY_REQUESTS, ' - this.ws_requests: ', this.ws_requests)



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


        this.getCountOfDeptsInRequests(this.ws_requests);
      }

      console.log('% »»» WebSocketJs WF - WsRequestsList getWsRequests$ ws_request ', wsrequests)
      console.log('% »»» WebSocketJs WF - WsRequestsList >>>>>>> WS-REQUESTS-LENGHT <<<<<<< ', wsrequests.length)

      // this.getRequestsTotalCount(wsrequests)

      // -----------------------------------------------------------------------------------------------------
      // dismiss Spinner 
      // -----------------------------------------------------------------------------------------------------

      this.totalRequests = this.wsRequestsService.wsRequestsListLength$.value
      // console.log('% »»» WebSocketJs WF - WsRequestsList  >>>>>>> BEHAVIOUR TOTAL-REQUESTS <<<<<<< ', this.wsRequestsService.wsRequestsListLength$.value)

      // console.log('% »»» WebSocketJs WF - WsRequestsList >>>>>>> AS OBSERVABLE TOTAL-REQUESTS (2) <<<<<<< ', this.totalRequests)
      console.log('% »»» WebSocketJs WF - WsRequestsList >>>>>>> BEHAVIOUR TOTAL-REQUESTS (2) <<<<<<< ', this.totalRequests)

      if (wsrequests.length === this.totalRequests) {
        console.log('% »»» WebSocketJs WF - WsRequestsList  >>>>>>> +++++ WS-REQUESTS-LENGHT = TOTAL-REQUESTS +++++ <<<<<< ')
        // this.showSpinner = false;
      }

      // if (wsrequests.length === this.totalRequests) {
      //   this.showSpinner = false;
      // } 

      // else if (this.totalRequests === undefined) {
      //   this.showSpinner = false;

      // }


      // console.log('%%% WsRequestsList getWsRequests$ typeof ws_request ', typeof wsrequests)

      // this.zone.run(() => {

      if (wsrequests.length > 0) {
        this.SHOW_SIMULATE_REQUEST_BTN = false;

        // console.log('% »»» WebSocketJs WF - WsRequestsList - SHOW_SIMULATE_REQUEST_BTN ', this.SHOW_SIMULATE_REQUEST_BTN)
      } else if (wsrequests.length === 0) {
        this.SHOW_SIMULATE_REQUEST_BTN = true;

      }


      this.ws_requests.forEach(request => {
        // console.log('%%% WsRequestsList getWsRequests$ typeof ws_request ', typeof wsrequests)

        const user_agent_result = this.parseUserAgent(request.userAgent)

        const ua_browser = user_agent_result.browser.name + ' ' + user_agent_result.browser.version
        // console.log('% »»» WebSocketJs WF - WsRequestsList - USER-AGENT BROWSER ', ua_browser)

        request['ua_browser'] = ua_browser;

        const ua_os = user_agent_result.os.name + ' ' + user_agent_result.os.version
        // console.log('% »»» WebSocketJs WF - WsRequestsList - USER-AGENT OPERATING SYSTEM ', ua_os)

        request['ua_os'] = ua_os;

        request['currentUserIsJoined'] = this.currentUserIdIsInParticipants(request.participants, this.currentUserID, request.request_id);

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
              // this.showSpinner = false;
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
              // this.showSpinner = false;
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
        this.showSpinner = false;
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
              // this.showSpinner = false;
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
              // this.showSpinner = false;
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


  members_replace(member_id) {
    // console.log('!!! NEW REQUESTS HISTORY  - SERVED BY ID ', member_id)
    // console.log(' !!! NEW REQUESTS HISTORY underscore found in the participant id  ', member_id, member_id.includes('bot_'));

    const participantIsBot = member_id.includes('bot_')

    if (participantIsBot === true) {

      const bot_id = member_id.slice(4);
      // console.log('!!! NEW REQUESTS HISTORY - THE PARTICIP', member_id, 'IS A BOT ', participantIsBot, ' - ID ', bot_id);

      const bot = this.botLocalDbService.getBotFromStorage(bot_id);
      if (bot) {
        // '- ' +
        return member_id = bot['name'] + ' (bot)';
      } else {
        // '- ' +
        return member_id
      }

    } else {

      const user = this.usersLocalDbService.getMemberFromStorage(member_id);
      if (user) {
        // console.log('user ', user)
        const lastnameInizial = user['lastname'].charAt(0);
        // '- ' +
        return member_id = user['firstname'] + ' ' + lastnameInizial + '.'
      } else {
        // '- ' +
        return member_id
      }
    }
  }

  goToMemberProfile(member_id: any) {
    console.log('!!! NEW REQUESTS HISTORY has clicked GO To MEMBER ', member_id);
    if (member_id.indexOf('bot_') !== -1) {
      console.log('!!! NEW REQUESTS HISTORY IS A BOT !');

      this.router.navigate(['project/' + this.projectId + '/botprofile/' + member_id]);
    } else {
      this.router.navigate(['project/' + this.projectId + '/member/' + member_id]);
    }
  }

  getRequestText(text: string): string {
    if (text) {
      return text.length >= 30 ?
        text.slice(0, 30) + '...' :
        text;
    }
  }

  goToRequestMsgs(request_id: string) {
    this.router.navigate(['project/' + this.projectId + '/wsrequest/' + request_id + '/messages']);
  }


  // ======================== ARCHIVE A REQUEST ========================
  openDeleteRequestModal(request_recipient: string) {
    console.log('ID OF REQUEST TO ARCHIVE ', request_recipient)
    this.id_request_to_archive = request_recipient;

    this.displayArchiveRequestModal = 'block'
  }

  _archiveTheRequestHandler() {
    this.notify.showArchivingRequestNotification(this.archivingRequestNoticationMsg);
    console.log('HAS CLICKED ARCHIVE REQUEST ');

    this.displayArchiveRequestModal = 'none';



    this.getFirebaseToken(() => {

      this.requestsService.closeSupportGroup(this.id_request_to_archive, this.firebase_token)
        .subscribe((data: any) => {

          console.log('CLOSE SUPPORT GROUP - DATA ', data);
        }, (err) => {
          console.log('CLOSE SUPPORT GROUP - ERROR ', err);

          this.ARCHIVE_REQUEST_ERROR = true;
          // =========== NOTIFY ERROR ===========

          // this.notify.showNotification('An error has occurred archiving the request', 4, 'report_problem');
          this.notify.showNotification(this.archivingRequestErrorNoticationMsg, 4, 'report_problem');
        }, () => {
          // this.ngOnInit();
          console.log('CLOSE SUPPORT GROUP - COMPLETE');

          this.ARCHIVE_REQUEST_ERROR = false;

          // =========== NOTIFY SUCCESS===========
          // this.notify.showNotification(`request with id: ${this.id_request_to_archive} has been moved to History`, 2, 'done');
          this.notify.showRequestIsArchivedNotification(this.requestHasBeenArchivedNoticationMsg_part1, this.id_request_to_archive, this.requestHasBeenArchivedNoticationMsg_part2);
        });
    });
  }



  archiveTheRequestHandler() {
    this.notify.showArchivingRequestNotification(this.archivingRequestNoticationMsg);
    console.log('HAS CLICKED ARCHIVE REQUEST ');

    this.displayArchiveRequestModal = 'none';

    this.wsRequestsService.closeSupportGroup(this.id_request_to_archive)
      .subscribe((data: any) => {


        console.log('CLOSE SUPPORT GROUP - DATA ', data);
      }, (err) => {
        console.log('CLOSE SUPPORT GROUP - ERROR ', err);

        this.ARCHIVE_REQUEST_ERROR = true;
        // =========== NOTIFY ERROR ===========

        // this.notify.showNotification('An error has occurred archiving the request', 4, 'report_problem');
        this.notify.showNotification(this.archivingRequestErrorNoticationMsg, 4, 'report_problem');
      }, () => {
        // this.ngOnInit();
        console.log('CLOSE SUPPORT GROUP - COMPLETE');

        this.ARCHIVE_REQUEST_ERROR = false;

        // =========== NOTIFY SUCCESS===========
        // this.notify.showNotification(`request with id: ${this.id_request_to_archive} has been moved to History`, 2, 'done');
        this.notify.showRequestIsArchivedNotification(this.requestHasBeenArchivedNoticationMsg_part1, this.id_request_to_archive, this.requestHasBeenArchivedNoticationMsg_part2);
      });

  }


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
          console.log('Firebase Token (for join-to-chat & close-support-group)', idToken);
        }).catch(function (error) {
          // Handle error
          console.log('idToken.', error);
          callback();
        });
    }
  }

  onCloseArchiveRequestModal() {
    this.displayArchiveRequestModal = 'none'
  }


  replace_recipient(request_recipient: string) {
    if (request_recipient) {
      return request_recipient.replace('support-group-', '');
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Train bot sidebar
  // -----------------------------------------------------------------------------------------------------

  openRightSideBar(message: string) {
    this.OPEN_RIGHT_SIDEBAR = true;
    console.log('»»»» OPEN RIGHT SIDEBAR ', this.OPEN_RIGHT_SIDEBAR, ' MSG: ', message);
    this.selectedQuestion = message;


    // questo non funziona se è commented BUG RESOLVE
    const elemMainContent = <HTMLElement>document.querySelector('.main-content');
    this.train_bot_sidebar_height = elemMainContent.clientHeight + 10 + 'px'
    console.log('REQUEST-MSGS - ON OPEN RIGHT SIDEBAR -> RIGHT SIDEBAR HEIGHT', this.train_bot_sidebar_height);

  }

  // closeRightSidebar(event) {
  //   console.log('»»»» CLOSE RIGHT SIDEBAR ', event);
  //   this.OPEN_RIGHT_SIDEBAR = event;
  // }



  // -----------------------------------------------------------------------------------------------------
  // @ Requests for department
  // -----------------------------------------------------------------------------------------------------

  /**
   * Count of depts in requests !! no more get from request attributes but from department
   * 
   * @param requests_array 
   */
  getCountOfDeptsInRequests(requests_array) {
    const depts_array = [];
    const deptsIDs = [];

    const deptsNames = [];

    requests_array.forEach((request, index) => {
      // if (request && request.attributes) {
      if (request && request.department) {
        // console.log('% WsRequestsList  - REQUEST ', request, '#', index);

        /**
         * CREATES AN ARRAY WITH ALL THE DEPTS RETURNED IN THE REQUESTS OBJCTS
         * (FROM THIS IS CREATED requestsDepts_uniqueArray)
         */

        // depts_array.push({ '_id': request.attributes.departmentId, 'deptName': request.attributes.departmentName }); 
        depts_array.push({ '_id': request.department._id, 'deptName': request.department.name });


        /**
         * CREATES AN ARRAY WITH * ONLY THE IDs * OF THE DEPTS RETURNED IN THE REQUESTS OBJCTS
         * THIS IS USED TO GET THE OCCURRENCE IN IT OF THE ID OF THE ARRAY this.requestsDepts_array
         */

        /**
         * USING DEPT ID  */
        // deptsIDs.push(request.attributes.departmentId)
        deptsIDs.push(request.department._id);

        /**
         * USING DEPT NAME  */
        // deptsNames.push(request.attributes.departmentName)
      } else {
        // console.log('REQUESTS-LIST COMP - REQUEST (else)', request, '#', index);

      }
    });
    // console.log('REQUESTS-LIST COMP - DEPTS ARRAY NK', depts_array);
    // console.log('REQUESTS-LIST COMP - DEPTS ID ARRAY NK', deptsIDs);
    // console.log('REQUESTS-LIST COMP - DEPTS NAME ARRAY NK', deptsNames)

    /**
     * *********************************************************************
     * ************************* REMOVE DUPLICATE **************************
     * *********************************************************************
     * */

    /**
     * USING DEPT ID  */
    this.depts_array_noduplicate = this.removeDuplicates(depts_array, '_id');

    /**
     * USING DEPT NAME  */
    //  this.depts_array_noduplicate = this.removeDuplicates(depts_array, 'deptName');

    console.log('% WsRequestsList - REQUESTSxDEPTS - DEPTS ARRAY [no duplicate] NK', this.depts_array_noduplicate)

    // GET OCCURRENCY OF THE DEPT ID IN THE ARRAY OF THE TOTAL DEPT ID
    this.depts_array_noduplicate.forEach(dept => {

      /**
       * USING DEPT ID  */
      this.getDeptIdOccurrence(deptsIDs, dept._id)

      /**
       * USING DEPT NAME  */
      // this.getDeptNameOccurrence(deptsNames, dept.deptName)
    });
  }

  removeDuplicates(originalArray, prop) {
    const newArray = [];
    const lookupObject = {};

    // tslint:disable-next-line:forin
    for (const i in originalArray) {
      lookupObject[originalArray[i][prop]] = originalArray[i];
    }

    // tslint:disable-next-line:forin
    for (const i in lookupObject) {
      newArray.push(lookupObject[i]);
    }
    return newArray;
  }

  getDeptIdOccurrence(array_of_all_depts_ids, dept_id) {
    // console.log('!!! ANALYTICS - ALL REQUESTS X DEPT - GET DEP OCCURRENCE FOR DEPTS ');
    const newUnicArray = []
    let count = 0;
    array_of_all_depts_ids.forEach((v) => (v === dept_id && count++));
    console.log('% WsRequestsList - REQUESTSxDEPTS - DEPT - #', count, ' REQUESTS ASSIGNED TO DEPT ', dept_id);
    let i
    for (i = 0; i < this.depts_array_noduplicate.length; ++i) {

      for (const dept of this.depts_array_noduplicate) {
        if (dept_id === dept._id) {
          dept.requestsCount = count
        }
      }
      console.log('% WsRequestsList - REQUESTSxDEPTS DEPTS ARRAY [no duplicate] NK * 2 * : ' + JSON.stringify(this.depts_array_noduplicate));
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



