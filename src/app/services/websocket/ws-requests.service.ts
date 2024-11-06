
import { Injectable, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject } from "rxjs";
import { AuthService } from '../../core/auth.service';
import { WebSocketJs } from "./websocket-js";
import { Request } from '../../models/request-model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs'
import { AppConfigService } from '../../services/app-config.service';
import { LoggerService } from '../../services/logger/logger.service';
import { LocalDbService } from '../users-local-db.service';
import { map } from 'rxjs/operators';
import { CodeInstallationModule } from 'app/components/widget-installations/code-installation/code-installation.module';
export interface Message {
  action: string;
  payload: {
    topic: string,
    method: string, message: any
  };
}


@Injectable()

export class WsRequestsService implements OnDestroy {
  public wsRequesterStatus$: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public currentUserWsAvailability$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null); // Moved here from user.service 
  public currentUserWsIsBusy$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null); // Moved here from user.service 

  // http: Http;
  public messages: Subject<Message>;

  requesTtotal: number;
  public wsRequestsList$: BehaviorSubject<Request[]> = new BehaviorSubject<Request[]>([]);
  public wsConv$: BehaviorSubject<Request[]> = new BehaviorSubject<Request[]>([]);
  public wsConvData$: BehaviorSubject<Request[]> = new BehaviorSubject<Request[]>([]);
  public projectUsersOfProject$: BehaviorSubject<Array<[any]>> = new BehaviorSubject<Array<[any]>>([]);
  public wsOnDataUnservedConvs$: BehaviorSubject<Request[]> = new BehaviorSubject<Request[]>([]);
  public foregroundNotificationCount$: BehaviorSubject<number> = new BehaviorSubject(null);
  public hasChangedSoundPreference$: BehaviorSubject<string> = new BehaviorSubject(null);

  public requestIsReady$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  public ws__RequestsList$: any;

  public wsRequest$ = new Subject()
  public ws_All_RequestsLength$ = new Subject<number>()
  // public ws_Served_RequestsLength$ = new Subject<number>()
  // public ws_Unserved_RequestsLength$ = new Subject<number>()
  // public ws_All_RequestsLength$: ReplaySubject<number> = new ReplaySubject(1);


  // public wsRequestsList$: BehaviorSubject<[]> = new BehaviorSubject<[]>([]);


  // public wsMyRequestsList$: BehaviorSubject<Request[]> = new BehaviorSubject<Request[]>([]);

  // public wsRequest$: BehaviorSubject<any> = new BehaviorSubject(null);
  // public wsRequest$:  AsyncSubject<any> = new AsyncSubject();


  // fwcUser: BehaviorSubject<FwcUser> = new BehaviorSubject<FwcUser>(null);
  // fwcUser$ = this.fwcUser.asObservable();

  // public ws_All_RequestsLength$: BehaviorSubject<number> = new BehaviorSubject(0)

  // _wsRequestsListLength$ = this.ws_All_RequestsLength$.asObservable()
  // public ws_All_RequestsLength$$: ReplaySubject<number> = new ReplaySubject(null);

  wsRequestsList: Request[]
  fakeWsRequestsList: Request[]

  wsAllRequestsList: any

  wsjsRequestsService: WebSocketJs;
  wsjsRequestByIdService: WebSocketJs;
  project_id: string;

  WS_IS_CONNECTED: number;
  currentUserID: string;
  SERVER_BASE_PATH: string;

  TOKEN: string;
  timeout: any;
  subscription: Subscription;
  departments: any;
  subscribed_request_id: string;
  subscribed_requester_id: string;
  subscribed_projectuser_id: string;
  /**
   * Constructor
   * 
   * @param {AuthService} auth 
   */
  constructor(

    public auth: AuthService,
    public webSocketJs: WebSocketJs,
    public appConfigService: AppConfigService,
    private logger: LoggerService,
    public usersLocalDbService: LocalDbService,
    private _httpClient: HttpClient
  ) {
    this.getAppConfig();
    // -----------------------------------------------------------------------------------------------------
    // REQUESTS - @ the publication of the 'current project' subscribes to the websocket requests
    // -----------------------------------------------------------------------------------------------------
    // NOTE_nk: comment this.getCurrentProjectAndSubscribeTo_WsRequests()
    this.getCurrentProjectAndSubscribeTo_WsRequests()
    this.getLoggedUser();
    this.getStoredForegroungNotificationAndPublish()
  }


  getAppConfig() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;

  }

  ngOnDestroy() {
    this.logger.log('[WS-REQUESTS-SERV] - ngOnDestroy')
    this.subscription.unsubscribe();
    // this.unsubscribe$.next();
    // this.unsubscribe$.complete();
  }


  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      if (user) {
        this.TOKEN = user.token
        this.currentUserID = user._id
      }
    });
  }
  getStoredForegroungNotificationAndPublish() {
    const foregrondNotificationsCount = +this.usersLocalDbService.getForegrondNotificationsCount();
    // this.logger.log('foregrondNotificationsCount ', foregrondNotificationsCount) 
    this.foregroundNotificationCount$.next(foregrondNotificationsCount)
  }

  publishAndStoreForegroundRequestCount(msgscount) {
    // this.logger.log('[WS-MSGS-SERV] - foreground Request Count ', msgscount)
    this.foregroundNotificationCount$.next(msgscount)
    this.usersLocalDbService.storeForegrondNotificationsCount(msgscount)
  }

  hasChangedSoundPreference(soundPreference) {
    this.hasChangedSoundPreference$.next(soundPreference)
  }

  // -----------------------------------------------------------------------------------------------------
  // methods for REQUESTS 
  // -----------------------------------------------------------------------------------------------------
  resetWsRequestList() {
    this.wsRequestsList = [];
    this.wsAllRequestsList = [];
    this.wsRequestsList$.next(this.wsRequestsList);
    this.logger.log('[WS-REQUESTS-SERV] - RESET WS REQUEST LIST')
  }

  getCurrentProjectAndSubscribeTo_WsRequests() {
    var self = this;
    self.wsRequestsList = [];
    self.wsAllRequestsList = [];
 
    this.auth.project_bs.subscribe((project) => {
      // this.logger.log('[WS-REQUESTS-SERV] - GET CURRENT PRJCT AND SUBSCRIBE TO WS-REQUESTS - PRJCT this.auth.project_bs.value', this.auth.project_bs.value)
      // this.logger.log('[WS-REQUESTS-SERV] - GET CURRENT PRJCT AND SUBSCRIBE TO WS-REQUESTS - PRJCT project', project)

      // ---------------------------------------------------------------------------------
      // Unsubscribe to websocket requests with the old project id  
      // ---------------------------------------------------------------------------------
      if (this.project_id) {

        // this.logger.log('[WS-REQUESTS-SERV] - GET CURRENT PRJCT AND SUBSCRIBE TO WS-REQUESTS - ACTUALLY SUBSCRIBED TO THE REQUEST ID', this.subscribed_request_id)
        // this.logger.log('[WS-REQUESTS-SERV] - GET CURRENT PRJCT AND SUBSCRIBE TO WS-REQUESTS - UNSUBSCRIBE FROM OLD PROJECT-ID (REQUESTS - REQUEST-ID - MSGS - PRESENCE - AVAILABILITY)', this.project_id)

        this.webSocketJs.unsubscribe('/' + this.project_id + '/requests');

        // per risolvere: se il cambio progetto vien effettuato quando si è nella pagina del dettaglio conversazioni unsuscibe da request by id viene fatto con un path sbagliato
        // id-nuovo-progetto/requests/id-richiesta invece che con - id-vecchio-progetto/requests/id-richiesta (vedi in ws-msgs.service unsubsToWS_MsgsByRequestId e unsubscribeTo_wsRequestById in questo componente)

        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        // Moved under subscribeTo_wsRequestById (fixes the bug: in the chat ionic the conversation detail not works because the request id websocket unsubscribe triggers after that the request has subscribed)
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        // if (this.subscribed_request_id) {
        //   this.webSocketJs.unsubscribe('/' + this.project_id + '/requests/' + this.subscribed_request_id); // WHEN CHANGING THE PROJECT I UNSUBSCRIBE FROM THE "REQUEST BY ID" TO WHICH IT IS POSSIBLY SUBSCRIBED
        //   this.webSocketJs.unsubscribe('/' + this.project_id + '/requests/' + this.subscribed_request_id + '/messages'); // AS ABOVE BUT FOR MESSAGES
        // }

        //  unsuscribe requester presence al cambio progetto
        if (this.subscribed_requester_id) {
          this.webSocketJs.unsubscribe('/' + this.project_id + '/project_users/users/' + this.subscribed_requester_id);
        }
        //  unsuscribe current user availability al cambio progetto
        if (this.subscribed_projectuser_id) {
          this.webSocketJs.unsubscribe('/' + this.project_id + '/project_users/' + this.subscribed_projectuser_id);
        }

        this.resetWsRequestList();
      }


      if (project) {
        // this.logger.log('% »»» WebSocketJs WF ****** WsRequestsService PROJECT._ID 2', project._id)
        this.logger.log('[WS-REQUESTS-SERV] - SUBSCRIBE (REF) WITH NEW PROJECT-ID', project._id)
        this.logger.log('[WS-REQUESTS-SERV] - OLD PROJECT-ID', this.project_id)

        this.project_id = project._id;

        // if (this.WS_IS_CONNECTED === 1) {
        this.webSocketJs.ref('/' + this.project_id + '/requests', 'getCurrentProjectAndSubscribeTo_WsRequests',
          // Create
          function (data, notification) {

            if (data) {
              // ------------------------------------------------
              // @ Agents - pass in data agents get from snapshot
              // ------------------------------------------------
              if (data.snapshot && data.snapshot.agents) {

                data.agents = data['snapshot']["agents"]
              } else if (data.agents) {
                // ---------------------------------------------------------------
                // @ Agents - else (if exist agents in data) pass agents from data
                // ---------------------------------------------------------------
                data.agents = data.agents
              }

              // ---------------------------------------------
              // @ Lead - pass in data lead get from snapshot
              // ----------------------------------------------
              if (data.snapshot && data.snapshot.lead) {

                data.lead = data['snapshot']["lead"];

              } else {
                // ---------------------------------------------------------------------
                // @ Lead - else (if exist lead in attributes) pass lead from attributes
                // ---------------------------------------------------------------------
                if (data['attributes'] && data['attributes'] !== undefined) {

                  if (data['attributes']['userFullname'] && data['attributes']['userEmail'] && data['attributes']['requester_id']) {
                    data.lead = { 'fullname': data['attributes']['userFullname'], 'email': data['attributes']['userEmail'], 'lead_id': data['attributes']['requester_id'] }
                  }
                  // ---------------------------------------------------------
                  // @ Lead - else (if exist lead in data) pass lead from data
                  // ---------------------------------------------------------
                  else if (data.lead) {
                    data.lead = data.lead
                  }
                } else if (data.lead) {
                  data.lead = data.lead;
                }
              }

              // -----------------------------------------------------
              // @ Requester pass in data requester get from snapshot
              // -----------------------------------------------------
              if (data.snapshot && data.snapshot.requester) {

                data.requester = data['snapshot']["requester"]

              } else if (data.requester) {
                // ---------------------------------------------------------------------
                // @ Lead - else (if exist requester in data) pass requester from data
                // ---------------------------------------------------------------------
                data.requester = data.requester
              }

              // ------------------------------------------------------
              // @ Department pass in data department get from snapshot
              // ------------------------------------------------------
              if (data.snapshot && data.snapshot.department) {

                data.department = data['snapshot']["department"]

              } else if (data.department) {
                // ----------------------------------------------------------------------------
                // @ Department - else (if exist department in data) pass department from data
                // ----------------------------------------------------------------------------
                data.department = data.department
              }
            }

            // https://stackoverflow.com/questions/36719477/array-push-and-unique-items
            const index = self.wsRequestsList.findIndex((e) => e.id === data.id);

            if (index === -1) {
              self.addWsRequests(data)
              // self.logger.log("[WS-REQUESTS-SERV] - CREATE - ADD REQUESTS");
            } else {
              // self.logger.log("[WS-REQUESTS-SERV] - CREATE - REQUEST ALREADY EXIST - NOT ADD");
            }

          // Update
          }, function (data, notification) {

            // this.logger.log("[WS-REQUESTS-SERV] DSHB - UPDATE - DATA ", data);

            self.wsConv$.next(data)
            

            // -------------------------------------------------------
            // @ Agents (UPDATE) pass in data agents get from snapshot
            // -------------------------------------------------------
            if (data.snapshot && data.snapshot.agents) {
              data.agents = data['snapshot']["agents"]
            } else if (data.agents) {
              // ---------------------------------------------------------------
              // @ Agents - else (if exist agents in data) pass agents from data
              // ---------------------------------------------------------------
              data.agents = data.agents
            }
            self.updateWsRequests(data)


          }, function (data, notification) {
            self.logger.log("[WS-REQUESTS-SERV] DSHB - ON-DATA - DATA ", data);
            // this.logger.log("[WS-REQUESTS-SERV] DSHB - ON-DATA - DATA ", data);
            self.logger.log("[WS-REQUESTS-SERV] DSHB - ON-DATA - NOTIFICATION ", notification);
            // self.wsConvData$.next(data)

            // if (notification.event.method === 'CREATE') {

            // self.wsRequestsList.push(data[0]);
            // this.logger.log("[WS-REQUESTS-SERV] DSHB - ON-DATA - DATA data published ",  self.wsRequestsList);

            // self.wsRequestsList$.next(data);
            // this.logger.log("[WS-REQUESTS-SERV] DSHB - ON-DATA - DATA data published ",  data);

            // if (data) {
            //   if (Array.isArray(data)) {
            //     // https://stackoverflow.com/questions/18983138/callback-after-all-asynchronous-foreach-callbacks-are-completed
            //     let requests = data.map((item) => {
            //       return new Promise((resolve) => {
            //         self.asyncFunction(item, resolve);
            //       });
            //     })
            //     Promise.all(requests).then(() => {
            //       self.ws_All_RequestsLength$.next(data.length);
            //     });
            //   }
            // }
            // this.wsRequestsList$.next(this.wsRequestsList);



            // ------------------------------- 
            // let wsOnDataConvsList = [];
            // wsOnDataConvsList.push(data)
            // this.logger.log("[WS-REQUESTS-SERV] DSHB - ON-DATA - DATA wsOnDataConvsList ", wsOnDataConvsList);
            // // if (wsOnDataRequestsList.length > 0) {
            // let wsOnDataConvsUnserved = wsOnDataConvsList[0].filter((el) => {
            //   return el.status === 100;
            // });
            // this.logger.log("[WS-REQUESTS-SERV] DSHB - ON-DATA - DATA ONLY UNSERVED  ", wsOnDataConvsUnserved);
            // self.wsOnDataUnservedConvs$.next(wsOnDataConvsUnserved);
            // }
            // }

            if (data) {
              if (Array.isArray(data)) {
                // https://stackoverflow.com/questions/18983138/callback-after-all-asynchronous-foreach-callbacks-are-completed
                let requests = data.map((item) => {
                  return new Promise((resolve) => {
                    self.asyncFunction(item, resolve);
                  });
                })
                Promise.all(requests).then(() => {
                  self.ws_All_RequestsLength$.next(data.length);
                });
              }
            }
          }
        );
      }
    });
  }

  asyncFunction(request, cb) {
    setTimeout(() => {
      cb();
    }, 100);
  }


  /**
   * REQUESTS publish @ the CREATE
   * 
   * @param request 
   */
  addWsRequests(request: Request) {
    if (request !== null && request !== undefined) {
      this.wsRequestsList.push(request);
      // this.wsRequestsList$.next(this.wsRequestsList);

    }

    if (this.wsRequestsList) {
      // -----------------------------------------------------------------------------------------------------
      // publish all REQUESTS 
      // -----------------------------------------------------------------------------------------------------
      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      this.timeout = setTimeout(() => {
        this.wsRequestsList$.next(this.wsRequestsList);
      }, 1000);
    }
  }

  /**
   * REQUESTS - publish @ the UPDATE
   * overwrite the request in the requests-list with the upcoming request if the id is the same
   * remove the request from the requests-list if the status is === 1000 (i.e. archived request)
   * 
   * @param request 
   */
  updateWsRequests(request: any) {

    // QUANDO UNA RICHIESTA VIENE EMESSA CON preflight = true non passa dal ON CREATE
    // sull ON UPDATE VENGONO AGGIORNATE SOLO LE RICHIESTE CHE VERIFICANO LA condizione request._id === this.wsRequestsList[i]._id
    // PER PUBBLICARE LE RICHIESTE CHE LA CUI PROPRIETà preflight = true E AGGIORNATA A FALSE (E CHE QUINDI è DA VISUALIZZARE) CERCO
    // L'ESISTENZA DELL'ID NELLA wsRequestsList
    // const hasFound = this.wsRequestsList.filter((obj: any) => {
    //   return obj._id === request._id;
    // });
    // this.logger.log("% »»» WebSocketJs WF +++++ ws-requests--- service ON-UPATE hasFound IN wsRequestsList: ", hasFound , 'THE REQUEST ID', request._id);

    const index = this.wsRequestsList.findIndex((e) => e.id === request.id);
    if (index === -1) {

      this.wsRequestsList.push(request);
      this.wsRequestsList$.next(this.wsRequestsList);

    } else {
      this.logger.log("[WS-REQUESTS-SERV] - ON-UPATE - THE REQUEST NOT EXIST ");
    }


    for (let i = 0; i < this.wsRequestsList.length; i++) {
      if (request._id === this.wsRequestsList[i]._id) {

        if (request.status !== 1000) {

          // --------------------------
          // UPATE AN EXISTING REQUESTS
          // --------------------------
          this.logger.log("[WS-REQUESTS-SERV] - UPDATE AN EXISTING REQUESTS ");

          this.wsRequestsList[i] = request

        } else if (request.status === 1000) {

          this.wsRequestsList.splice(i, 1);

        }

        if (this.wsRequestsList) {
          this.wsRequestsList$.next(this.wsRequestsList);
          this.logger.log("[WS-REQUESTS-SERV] -  ON-UPATE REQUESTS LIST ", this.wsRequestsList);
        }
      }
    }
  }

  unsubscribePreviousRequestId() {
    // this.logger.log('[WS-REQUESTS-SERV] UNSUBSCRIBE TO PREVIOUS REQUEST ID ', this.subscribed_request_id)
   
    if (this.subscribed_request_id) {
      this.webSocketJs.unsubscribe('/' + this.project_id + '/requests/' + this.subscribed_request_id);
      this.webSocketJs.unsubscribe('/' + this.project_id + '/requests/' + this.subscribed_request_id + '/messages');
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // methods for REQUEST BY ID  
  // -----------------------------------------------------------------------------------------------------
  /**
   * REQUEST BY ID - Subscribe to websocket request by id service 
   * called when in WsRequestsMsgsComponent onInit() is got the request id from url params
   * 
   * @param id_request 
   */
  subscribeTo_wsRequestById(id_request) {
    // this.logger.log("[WS-REQUESTS-SERV] - SUBSCR TO WS REQUEST-BY-ID (REF) id_request ", id_request);

    this.unsubscribePreviousRequestId()

    this.subscribed_request_id = id_request

    var self = this;

    this.webSocketJs.ref('/' + this.project_id + '/requests/' + id_request, 'subscribeTo_wsRequestById',

      function (data, notification) {
        self.logger.log("[WS-REQUESTS-SERV] - SUBSCR TO REQUEST-BY-ID - CREATE data", data);
        
        self.addWsRequest(data);


      }, function (data, notification) {

        self.logger.log("[WS-REQUESTS-SERV] - SUBSCR TO REQUEST-BY-ID - UPDATE data", data);
       
        self.updateWsRequest(data)

      }, function (data, notification) {
        // dismetti loading
      }
    );
    // this.logger.log("% SUB »»»»»»» subsToWS RequestById from client to websocket: ", message);
  }


  /**
   * 
   * REQUEST BY ID publish @ the CREATE
   * 
   * @param request 
   */
  addWsRequest(request) {
    this.logger.log("[WS-REQUESTS-SERV] - ADD WS REQUEST-BY-ID (PUBLISH) request", request);
    this.wsRequest$.next(request);
  }

  /**
   * 
   * REQUEST BY ID publish @ the UPDATE
   * 
   * @param request 
   */
  updateWsRequest(request) {
    this.logger.log("[WS-REQUESTS-SERV] - UPDATE WS REQUEST-BY-ID (PUBLISH) request ", request);
    this.wsRequest$.next(request);
  }

  requestIsReady(ready) {
    this.requestIsReady$.next(true)
  }


  /**
   * unsubscribeTo_wsRequestById
   * 
   * @param id_request 
   */
  unsubscribeTo_wsRequestById(id_request) {
    this.webSocketJs.unsubscribe('/' + this.project_id + '/requests/' + id_request);
    // this.logger.log("[WS-REQUESTS-SERV] - UNSUBSCRIBE REQUEST-BY-ID FROM WS request_id ", id_request, ' project_id ', this.project_id);
  }


  // -----------------------------------------------
  //  @ Subscribe to Requester Presence
  // -----------------------------------------------
  subscribeToWS_RequesterPresence(requesterid) {
    this.subscribed_requester_id = requesterid
    var self = this;

    const path = '/' + this.project_id + '/project_users/users/' + requesterid;

    // this.logger.log("[WS-REQUESTS-SERV] - SUBSCRIBE TO REQUESTER-PRECENCE PATH ", path);

    this.webSocketJs.ref(path, 'subscribeToWS_RequesterPresence',

      function (data, notification) {
        // self.logger.log("[WS-REQUESTS-SERV] - SUBSCRIBE TO REQUESTER-PRECENCE - CREATE data ", data);

        self.wsRequesterStatus$.next(data);

      }, function (data, notification) {
        self.logger.log("[WS-REQUESTS-SERV] - SUBSCRIBE TO REQUESTER-PRECENCE - UPDATE data ", data);

        self.wsRequesterStatus$.next(data);

      }, function (data, notification) {

        if (data) {
          // self.logger.log("[WS-REQUESTS-SERV] - SUBSCRIBE TO REQUESTER-PRECENCE - ON-DATA data ", data);
        }
      }
    );
  }

  // -----------------------------------------------
  //  @ Un-Subscribe to Requester Presence
  // -----------------------------------------------
  unsubscribeToWS_RequesterPresence(requesterid) {
    const path = '/' + this.project_id + '/project_users/users/' + requesterid;
    this.logger.log("[WS-REQUESTS-SERV] - UNSUBSCRIBE  TO REQUESTER-PRECENCE PATH", path);
    this.webSocketJs.unsubscribe(path);
  }

  // -----------------------------------------------------------------------------------------------------
  // Availability - subscribe to WS Current user availability !! // Moved here from user.service 
  // -----------------------------------------------------------------------------------------------------
  subscriptionToWsCurrentUser(prjctuserid) {
    this.subscribed_projectuser_id = prjctuserid

    var self = this;

    self.logger.log("[WS-REQUESTS-SERV] - SUBSCRIBE TO CURRENT-USER AVAILABILITY (REF) - prjctuserid", prjctuserid);
    const path = '/' + this.project_id + '/project_users/' + prjctuserid

    this.webSocketJs.ref(path, 'subscriptionToWsCurrentUser',
      function (data, notification) {

        self.logger.log("[WS-REQUESTS-SERV] - SUBSCRIBE TO CURRENT-USER AVAILABILITY - CREATE data", data);
        // self.currentUserWsAvailability$.next(data.user_available);
        self.currentUserWsAvailability$.next(data);
        if (data.isBusy) {
          self.currentUserWsIsBusy$.next(data.isBusy)
        } else {
          self.currentUserWsIsBusy$.next(false)
        }

      }, function (data, notification) {

        self.logger.log("[WS-REQUESTS-SERV] - SUBSCRIBE TO CURRENT-USER AVAILABILITY - UPDATE data", data);
        // self.currentUserWsAvailability$.next(data.user_available);
        self.currentUserWsAvailability$.next(data);
        if (data.isBusy) {
          self.currentUserWsIsBusy$.next(data.isBusy)
        } else {
          self.currentUserWsIsBusy$.next(false)
        }

      }, function (data, notification) {
        if (data) {
          self.logger.log("[WS-REQUESTS-SERV] - SUBSCRIBE TO CURRENT-USER AVAILABILITY - ON-DATA data", data);
        }
      }
    );
  }

  // -----------------------------------------------------------------------------------------------------
  // Availability - unsubscribe to WS Current user availability !! // Moved here from user.service 
  // -----------------------------------------------------------------------------------------------------
  // Nota unsubscriptionToWsCurrentUser nn viene mai richiamato cmq eseguo unsubscribe('/' + this.project_id + '/project_users/' + prjctuserid); in questo
  // componente al cambio di progetto
  unsubscriptionToWsCurrentUser(prjctuserid) {
    this.webSocketJs.unsubscribe('/' + this.project_id + '/project_users/' + prjctuserid);
    this.logger.log("[WS-REQUESTS-SERV] - UNSUBSCRIBE TO CURRENT-USER AVAILABILITY project_id ", this.project_id, " prjctuserid", prjctuserid);
  }

  // -----------------------------------------------------------------------------------------------------------------------------
  // Subscribe to WS PROJECT-USERS OF THE PROJECT
  // -----------------------------------------------------------------------------------------------------------------------------
  subscriptionToWsAllProjectUsersOfTheProject(userid) {
    var self = this;

    const path = '/' + this.project_id + '/project_users/users/' + userid

    this.logger.log("[WS-REQUESTS-SERV] - SUBSCRIBE TO ALL PROJECT-USER OF THE PROJECT - projectid", this.project_id, ' userid: ', userid, 'path', path);
    return new Promise(function (resolve, reject) {

      self.webSocketJs.ref(path, 'subscriptionToWsAllProjectUsersOfTheProject', function (data, notification) {

        self.logger.log("[WS-REQUESTS-SERV] - SUBSCRIBE - TO ALL PROJECT-USER OF THE PROJECT - CREATE data ", data);


        resolve(data)
        self.projectUsersOfProject$.next(data);
        // self.currentUserWsBusyAndAvailabilityForProject$.next(data)

      }, function (data, notification) {

        self.logger.log("[WS-REQUESTS-SERV] - SUBSCRIBE - TO ALL PROJECT-USER OF THE PROJECT - UPDATE data ", data);

        resolve(data)

        self.projectUsersOfProject$.next(data);

      }, function (data, notification) {
        if (data) {
          // resolve(data)
          //  self.logger.log("WS-REQUESTS-SERVICE SUBSCRIBE - TO ALL PROJECT-USER OF THE PROJECT - ON_DATA data ", data);
        }
      });

    })
  }
  // -----------------------------------------------------------------------------------------------------------------------------
  // UN-Subscribe to WS PROJECT-USERS OF THE PROJECT
  // -----------------------------------------------------------------------------------------------------------------------------
  unsubsToToWsAllProjectUsersOfTheProject(userid) {
    this.webSocketJs.unsubscribe('/' + this.project_id + '/project_users/users/' + userid);
    this.logger.log("[WS-REQUESTS-SERV] - UNSUBSCRIBE - TO ALL PROJECT-USER OF THE PROJECT - projectid ", this.project_id, ' userid:', userid);
  }

  // --------------------------------------------------
  // @ Close support group
  // --------------------------------------------------
  public closeSupportGroup(group_id: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
    // this.logger.log('[WS-REQUESTS-SERV] -  CLOSE SUPPORT-GROUP OPTIONS  ', options)

    const body = { force: true };
    // const body = {};

    // const url = 'https://tiledesk-server-pre.herokuapp.com/' + this.project_id + '/requests/' + group_id + '/close';
    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + group_id + '/close';

    this.logger.log('[WS-REQUESTS-SERV] - CLOSE SUPPORT-GROUP URL ', url);
    return this._httpClient.put(url, JSON.stringify(body), httpOptions)

  }

  // --------------------------------------------------
  // @ Archive request using promise
  // --------------------------------------------------
  public archiveRequestOnPromise(request_id) {
    let promise = new Promise((resolve, reject) => {

      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': this.TOKEN
        })
      };

      const body = {};
      const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + request_id + '/close';
      this.logger.log('[WS-REQUESTS-SERV] - ARCHIVE REQUEST WITH PROMISE - URL ', url)

      this._httpClient.put(url, body, httpOptions)
        .toPromise()
        .then((res) => {
          resolve(res);
        }).catch((err) => {
          reject(err);
        })

    })
    return promise;
  }

  // --------------------------------------------------
  // @ Unarchive request 
  // --------------------------------------------------
  public unarchiveRequest(request_id: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + request_id + '/reopen';
    this.logger.log('[WS-REQUESTS-SERV] - REOPEN REQUEST - URL ', url)

    return this._httpClient.put(url, null, httpOptions)

  }

  // --------------------------------------------------
  // @ Delete request 
  // --------------------------------------------------
  public deleteRequest(request_id: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };


    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + request_id
    this.logger.log('[WS-REQUESTS-SERV] - DELETE REQUEST - URL ', url)

    return this._httpClient.delete(url, httpOptions)

  }

  // --------------------------------------------------
  // @ Get request count
  // --------------------------------------------------
  public getConversationCount() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/count'
    this.logger.log('[WS-REQUESTS-SERV] - getConversationByIDWithRestRequest - URL ', url)
    return this._httpClient.get(url, httpOptions)
  }

  // --------------------------------------------------
  // @ Get request by id 
  // --------------------------------------------------
  public getConversationByIDWithRestRequest(request_id) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + request_id
    this.logger.log('[WS-REQUESTS-SERV] - getConversationByIDWithRestRequest - URL ', url)
    return this._httpClient.get(url, httpOptions)
  }

  // --------------------------------------------------
  // @ Delete request using promise
  // --------------------------------------------------
  public deleteRequestOnPromise(request_id) {
    let promise = new Promise((resolve, reject) => {

      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': this.TOKEN
        })
      };

      const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + request_id
      this.logger.log('[WS-REQUESTS-SERV] - DELETE REQUEST USING PROMISE - URL ', url)

      this._httpClient.delete(url, httpOptions)
        .toPromise()
        .then((res) => {
          resolve(res);
        }).catch((err) => {
          reject(err);
        })

    })
    return promise;
  }

  // --------------------------------------------------
  // @ JOIN DEPT
  // --------------------------------------------------
  joinDept(departmentid, requestid) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
    // this.logger.log('[WS-REQUESTS-SERV] JOIN DEPT OPTIONS  ', options)

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + requestid + '/departments'
    this.logger.log('[WS-REQUESTS-SERV] - JOIN DEPT URL ', url);

    const body = { 'departmentid': departmentid };
    // this.logger.log('CLOUD FUNCT CLOSE SUPPORT GROUP REQUEST BODY ', body);

    return this._httpClient.put(url, body, httpOptions)
  }

  // --------------------------------------------------
  // @ LEAVE THE GROUP
  // --------------------------------------------------
  public leaveTheGroup(requestid: string, userid: string,) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + requestid + '/participants/' + userid
    this.logger.log('[WS-REQUESTS-SERV] - LEAVE THE GROUP URL ', url)

    return this._httpClient.delete(url, httpOptions)
  }

  // SEE DOC HERE -> https://developer.tiledesk.com/apis/api/requests#set-the-request-participants
  // -----------------------------------------------------------------------------------------
  // @ Reassign request
  // -----------------------------------------------------------------------------------------
  public setParticipants(requestid: string, userUid: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const body = [userUid];

    this.logger.log('[WS-REQUESTS-SERV] REASSIGN REQUEST - PUT REQUEST BODY ', body);

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + requestid + '/participants/'
    this.logger.log('[WS-REQUESTS-SERV] REASSIGN REQUEST - URL ', url)

    return this._httpClient
      .put(url, JSON.stringify(body), httpOptions)


  }

  // SEE DOC HERE -> https://developer.tiledesk.com/apis/api/requests#add-a-participant-to-a-request
  // -----------------------------------------------------------------------------------------
  // @ Add participant
  // -----------------------------------------------------------------------------------------
  public addParticipant(requestid: string, userid: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const body = { 'member': userid };
    this.logger.log('[WS-REQUESTS-SERV] ADD PARTICIPANT - BODY ', body);

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + requestid + '/participants/'
    this.logger.log('[WS-REQUESTS-SERV] ADD PARTICIPANT - URL ', url)

    return this._httpClient
      .post(url, JSON.stringify(body), httpOptions)
  }

  // SEE DOC HERE ->  https://developer.tiledesk.com/apis/rest-api/requests#add-a-follower-to-a-request
  // -----------------------------------------------------------------------------------------
  // @ Add Follower
  // -----------------------------------------------------------------------------------------
  public addFollower(projectuserid: string, request_id: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + request_id + '/followers'
    this.logger.log('[WS-REQUESTS-SERV] - ADD FOLLOWER URL ', url)

    const body = { 'member': projectuserid };
    this.logger.log('[WS-REQUESTS-SERV] - ADD FOLLOWER body ', body);
    return this._httpClient
      .post(url, JSON.stringify(body), httpOptions)

  }


  // SEE DOC HERE -> https://developer.tiledesk.com/apis/rest-api/requests#delete-a-follower-from-the-request
  // /:project_id/requests/:request_id/followers/:followerid

  // -----------------------------------------------------------------------------------------
  // @ REMOVE Follower
  // -----------------------------------------------------------------------------------------
  public removeFollower(projectuserid: string, request_id: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + request_id + '/followers/' + projectuserid
    // this.logger.log('[WS-REQUESTS-SERV] - REMOVE FOLLOWER  URL ', url);

    return this._httpClient
      .delete(url, httpOptions)

  }

  // https://developer.tiledesk.com/apis/rest-api/requests#set-the-request-followers
  // /:project_id/requests/:request_id/followers
  // -----------------------------------------------------------------------------------------
  // @ REMOVE ALL Follower
  // -----------------------------------------------------------------------------------------
  public removeAllFollowers(request_id: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + request_id + '/followers';
    this.logger.log('[WS-REQUESTS-SERV] - REMOVE ALL FOLLOWERS - URL ', url)
    const body = []
    return this._httpClient
      .put(url, body, httpOptions)

  }


  // -----------------------------------------------------------------------------------------
  // @ Export transcript to CSV
  // -----------------------------------------------------------------------------------------
  // https://tiledesk-server-pre.herokuapp.com/public/requests/support-group-62e26b1324bc4200357b1a3c-0930f905800f4c62b6bac937d6beb568/messages.html
  // https://tiledesk-server-pre.herokuapp.com/public/requests/support-group-62e26b1324bc4200357b1a3c-0930f905800f4c62b6bac937d6beb568/messages.pdf
  // https://tiledesk-server-pre.herokuapp.com/public/requests/support-group-62e26b1324bc4200357b1a3c-0930f905800f4c62b6bac937d6beb568/messages.csv
  public exportTranscriptAsCSVFile(idrequest: any) {
    const url = this.SERVER_BASE_PATH + 'public/requests/' + idrequest + '/messages.csv';
    // this.logger.log('DOWNLOAD TRANSCRIPT AS CSV URL ', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN,
      }),
      responseType: 'text' as 'json'
    };

    return this._httpClient
      .get(url, httpOptions);
  }

  // Not USED
  public exportTranscriptAsPDFFile(idrequest: string) {
    const url = this.SERVER_BASE_PATH + 'public/requests/' + idrequest + '/messages.pdf';

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN,
      })
    };

    return this._httpClient
      .get(url, httpOptions)
  }


  // -----------------------------------------------------------------------------------------
  // @ Create internal request
  // -----------------------------------------------------------------------------------------
  createInternalRequest(requester_id: string, request_id: string, subject: string, message: string, departmentid: string, participantid: string, ticketpriority: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    // this.logger.log('JOIN FUNCT OPTIONS  ', options);
    let body = {}
    body = { 'sender': requester_id, 'subject': subject, 'text': message, 'departmentid': departmentid, 'channel': { 'name': 'form' }, 'priority': ticketpriority };
    if (participantid !== undefined) {
      body['participants'] = [participantid]
    } else {
      body['participants'] = participantid
    }

    this.logger.log('[WS-REQUESTS-SERV] - CREATE INTERNAL REQUEST body ', body);

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + request_id + '/messages'
    this.logger.log('[WS-REQUESTS-SERV] - CREATE INTERNAL REQUEST URL ', url)

    return this._httpClient
      .post(url, JSON.stringify(body), httpOptions)

  }

  // -----------------------------------------------------------------------------------------
  // Update Ticket Subject
  // -----------------------------------------------------------------------------------------
  updateRequestsById_UpdateTicketSubject(request_id: string, subject: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const body = { 'subject': subject };

    this.logger.log('[WS-REQUESTS-SERV] UPDATE TICKET SUBJECT - BODY ', body);

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + request_id
    this.logger.log('[WS-REQUESTS-SERV] UPDATE TICKET SUBJECT - URL ', url);

    return this._httpClient
      .patch(url, JSON.stringify(body), httpOptions)

  }

  // -----------------------------------------------------------------------------------------
  // Update request by id - (UPDATE TAG) Add / Remove tag
  // -----------------------------------------------------------------------------------------
  updateRequestsById_UpdateTag(request_id: string, tags: Array<string>) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const body = { 'tags': tags };
    // const body = { 'tags':  { tag: "kll", color: "#43B1F2" } };
    this.logger.log('[WS-REQUESTS-SERV] UPDATE TAG - BODY ', body);

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + request_id
    this.logger.log('[WS-REQUESTS-SERV] UPDATE TAG - URL ', url);

    return this._httpClient
      .patch(url, JSON.stringify(body), httpOptions)
  }

  // -------------------------------------------------------
  // @ Create note
  // -------------------------------------------------------
  public createNote(note: string, request_id: string,) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const body = { 'text': note };
    this.logger.log('[WS-REQUESTS-SERV] - CREATE NOTE  body ', body);

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + request_id + '/notes'
    this.logger.log('[WS-REQUESTS-SERV] - CREATE NOTE - URL ', url)

    return this._httpClient
      .post(url, JSON.stringify(body), httpOptions)
  }

  // ------------------------------------------------------
  // @ Delete note
  // ------------------------------------------------------
  public deleteNote(requestid: string, noteid: string,) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + requestid + '/notes/' + noteid
    this.logger.log('[WS-REQUESTS-SERV] - DELETE NOTE  URL ', url);

    return this._httpClient
      .delete(url, httpOptions)

  }

  // -----------------------------------------------------------------------------------------
  // Update Priority
  // -----------------------------------------------------------------------------------------
  updatePriority(request_id: string, selectedPriority: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
    // this.logger.log('JOIN FUNCT OPTIONS  ', options);

    const body = { 'priority': selectedPriority };
    // const body = { 'tags':  { tag: "kll", color: "#43B1F2" } };
    this.logger.log('[WS-REQUESTS-SERV] UPDATE PRIORITY - BODY ', body);

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + request_id
    this.logger.log('[WS-REQUESTS-SERV] UPDATE PRIORITY - URL ', body);

    return this._httpClient
      .patch(url, JSON.stringify(body), httpOptions)
  }


  // -----------------------------------------------------------------------------------------
  // Update Working Status
  // -----------------------------------------------------------------------------------------
  updateRequestWorkingStatus(request_id: string, workingstatus: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const body = { 'workingStatus': workingstatus };
    // const body = { 'tags':  { tag: "kll", color: "#43B1F2" } };
    this.logger.log('[WS-REQUESTS-SERV] UPDATE PRIORITY - BODY ', body);

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + request_id
    this.logger.log('[WS-REQUESTS-SERV] UPDATE PRIORITY - URL ', body);

    return this._httpClient
      .patch(url, JSON.stringify(body), httpOptions)
  }

  // -----------------------------------------------------------------------------------------
  // Get Bot conversation attributes
  // -----------------------------------------------------------------------------------------
  public getBotConversationAttribute(id_request) {

    // const url = this.SERVER_BASE_PATH + 'modules/tilebot/ext/parameters/requests/' + id_request;
    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + id_request + '/chatbot/parameters';
    // this.logger.log('[WS-REQUESTS-SERV] - GET CONVERSATION WITH BOT URL ', url);

    // 'Authorization': this.TOKEN,
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN,
      }),
    };
    return this._httpClient
      .get(url, httpOptions)
  }


  // ------------------------------------------------------
  // @ Download history request as CSV
  // ------------------------------------------------------
  public downloadHistoryRequestsAsCsv(requests_status:any, querystring: string, preflight: boolean, pagenumber: number) {
    this.logger.log('[WS-REQUESTS-SERV][HISTORY & NORT-CONVS] - DOWNLOAD REQUESTS AS CSV requests_status ', requests_status);
    this.logger.log('[WS-REQUESTS-SERV][HISTORY & NORT-CONVS] - DOWNLOAD REQUESTS AS CSV preflight ', preflight);
    let _querystring = '&' + querystring
    if (querystring === undefined || !querystring) {
      _querystring = ''
    }
    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/csv?status='+ requests_status + _querystring + '&preflight=' + preflight + '&page=' + pagenumber;
    this.logger.log('[WS-REQUESTS-SERV][HISTORY & NORT-CONVS] - DOWNLOAD REQUESTS AS CSV URL ', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN,
      }),
      responseType: 'text' as 'json'
    };
    return this._httpClient
      .get(url, httpOptions)
  }

  // -------------------------------------------------------------
  // WS Requests NO-RT & HISTORY
  // -------------------------------------------------------------
  public getHistoryAndNortRequests(operator: string, status: string, statuses, _preflight, querystring: string, pagenumber: number) {
    this.logger.log('[WS-REQUESTS-SERV][HISTORY & NORT-CONVS] - *** REQUESTS SERVICE Get REQUESTS - operator  ', operator);
    this.logger.log('[WS-REQUESTS-SERV][HISTORY & NORT-CONVS] - *** REQUESTS SERVICE Get REQUEST - status  ', status);
    this.logger.log('[WS-REQUESTS-SERV][HISTORY & NORT-CONVS] - *** REQUESTS SERVICE Get REQUEST - statuses  ', statuses);
    this.logger.log('[WS-REQUESTS-SERV][HISTORY & NORT-CONVS] - *** REQUESTS SERVICE Get REQUEST - statuses length ', statuses?.length);
    this.logger.log('[WS-REQUESTS-SERV][HISTORY & NORT-CONVS] - *** REQUESTS SERVICE Get REQUEST - querystring  ', querystring);
    this.logger.log('[WS-REQUESTS-SERV][HISTORY & NORT-CONVS] - *** REQUESTS SERVICE Get REQUEST - _preflight  ', _preflight);
    this.logger.log('[WS-REQUESTS-SERV][HISTORY & NORT-CONVS] - *** REQUESTS SERVICE Get REQUEST - pagenumber  ', pagenumber);

    if (status === 'all') {
      status = '100,150,200'
      operator = '='
     } 

     if (status === '150' ) {
       operator = '='
     }

    let _querystring = ''
    if (querystring && querystring !== undefined) {
      if (status === '100' || status === '200' || status === '1000' || status === '150' ||  status ==="1000,100,200" || status ==="100,150,200" || statuses?.length>0) {
        _querystring = '&' + querystring
        this.logger.log('[WS-REQUESTS-SERV][HISTORY & NORT-CONVS] - *** REQUESTS SERVICE HERE 1');
      } else if (status === 'all') {
        _querystring = querystring + '&'
      
        this.logger.log('[WS-REQUESTS-SERV][HISTORY & NORT-CONVS] - *** REQUESTS SERVICE HERE 2', _querystring);
      } else {
        this.logger.log('[WS-REQUESTS-SERV][HISTORY & NORT-CONVS] - *** REQUESTS SERVICE HERE 3');
      }
    } else {
      _querystring = ''
      this.logger.log('[WS-REQUESTS-SERV][HISTORY & NORT-CONVS] - *** REQUESTS SERVICE HERE 4');
    }

    let url = '';
    if (status !== 'all') {
      url = this.SERVER_BASE_PATH + this.project_id + '/requests?status' + operator + status + _querystring + '&page=' + pagenumber + '&no_populate=true&no_textscore=true&preflight='+ _preflight;
      this.logger.log('url status != all ' ,url )

    } else {
      url = this.SERVER_BASE_PATH + this.project_id + '/requests?' + _querystring + 'page=' + pagenumber + '&no_populate=true&no_textscore=true&preflight='+ _preflight;
      this.logger.log('url status all ' ,url )
    }

  //  this.logger.log('[WS-REQUESTS-SERV][HISTORY & NORT-CONVS] - GET REQUESTS URL ', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN,
      })
    };

    return this._httpClient
      .get(url, httpOptions)
      .pipe(
        map(
          (response) => {
            const data = response;
            // Does something on data.data
            this.logger.log('[WS-REQUESTS-SERV][HISTORY & NORT-CONVS] - REQUESTS SERVICE * DATA * ', data);

            if (data['requests']) {
              data['requests'].forEach(request => {

                // ----------------------------------
                // @ Department
                // ----------------------------------
                if (request.snapshot && request.snapshot.department) {
                  this.logger.log("[WS-REQUESTS-SERV][HISTORY & NORT-CONVS] snapshot department", request.snapshot.department);
                  request.department = request['snapshot']["department"]


                }
                else if (request['attributes']) {
                  if (request['attributes']['departmentId'] && request['attributes']['departmentName'])
                    request.department = { 'name': request['attributes']['departmentName'], 'id': request['attributes']['departmentId'] }
                }

                else if (request.department) {
                  request.department = request.department
                }

                // ----------------------------------
                // @ Lead
                // ----------------------------------
                if (request.snapshot && request.snapshot.lead) {
                  this.logger.log("[WS-REQUESTS-SERV][HISTORY & NORT-CONVS] snapshot lead ", request.snapshot.lead);
                  request.lead = request['snapshot']["lead"]
                }
                else {

                  if (request['attributes']) {
                    if (request['attributes']['userFullname'] && request['attributes']['userEmail'] && request['attributes']['requester_id']) {
                      request.lead = { 'fullname': request['attributes']['userFullname'], 'email': request['attributes']['userEmail'], 'lead_id': request['attributes']['requester_id'] }
                    }
                    else if (request.lead) {
                      request.lead = request.lead
                    }
                  } else if (request.lead) {
                    request.lead = request.lead;
                  }
                }

                // ----------------------------------
                // @ Requester
                // ----------------------------------
                if (request.snapshot && request.snapshot.requester) {
                  this.logger.log("[WS-REQUESTS-SERV][HISTORY & NORT-CONVS] snapshot requester ", request.snapshot.requester);
                  request.requester = request['snapshot']["requester"]

                } else if (request.requester) {
                  request.requester = request.requester
                }

                // ----------------------------------
                // @ Agents
                // ----------------------------------
                if (request.snapshot && request.snapshot.agents) {
                  this.logger.log("[WS-REQUESTS-SERV][HISTORY & NORT-CONVS] snapshot agents ", request.snapshot.agents);
                  request.agents = request['snapshot']["agents"]
                } else {
                  if (request.agents) {
                    request.agents = request.agents
                  }
                }
              });
            }
            return data;
          })
      );
  }


}



