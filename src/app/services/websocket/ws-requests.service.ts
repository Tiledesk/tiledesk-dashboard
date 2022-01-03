
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from "rxjs/Subject";
import { AuthService } from '../../core/auth.service';
import { WebSocketJs } from "./websocket-js";
import { Request } from '../../models/request-model';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/of';
import { Subscription } from 'rxjs/Subscription';
import { AppConfigService } from '../../services/app-config.service';


import { LoggerService } from '../../services/logger/logger.service';
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

  http: Http;
  public messages: Subject<Message>;

  requesTtotal: number;
  public wsRequestsList$: BehaviorSubject<Request[]> = new BehaviorSubject<Request[]>([]);
  public projectUsersOfProject$: BehaviorSubject<[]> = new BehaviorSubject<[]>([]);
  public wsOnDataUnservedConvs$: BehaviorSubject<Request[]> = new BehaviorSubject<Request[]>([]);
 
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
    http: Http,
    public auth: AuthService,
    public webSocketJs: WebSocketJs,
    public appConfigService: AppConfigService,
    private logger: LoggerService
  ) {
    this.http = http;

    this.getAppConfig();
    // -----------------------------------------------------------------------------------------------------
    // REQUESTS - @ the publication of the 'current project' subscribes to the websocket requests
    // -----------------------------------------------------------------------------------------------------
    // NOTE_nk: comment this.getCurrentProjectAndSubscribeTo_WsRequests()
    this.getCurrentProjectAndSubscribeTo_WsRequests()
    this.getLoggedUser();

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

    // this.subscription  =  
    this.auth.project_bs.subscribe((project) => {
      this.logger.log('[WS-REQUESTS-SERV] - GET CURRENT PRJCT AND SUBSCRIBE TO WS-REQUESTS - PRJCT ', this.auth.project_bs.value)

      // ---------------------------------------------------------------------------------
      // Unsubscribe to websocket requests with the old project id  
      // ---------------------------------------------------------------------------------
      if (this.project_id) {

        this.logger.log('[WS-REQUESTS-SERV] - GET CURRENT PRJCT AND SUBSCRIBE TO WS-REQUESTS - ACTUALLY SUBSCRIBED TO THE REQUEST ID', this.subscribed_request_id)
        this.logger.log('[WS-REQUESTS-SERV] - GET CURRENT PRJCT AND SUBSCRIBE TO WS-REQUESTS - UNSUBSCTIBE FROM OLD PROJECT-ID (REQUESTS - REQUEST-ID - MSGS - PRESENCE - AVAILABILITY)', this.project_id)

        this.webSocketJs.unsubscribe('/' + this.project_id + '/requests');

        // per risolvere: se il cambio progetto vien effettuato quando si è nella pagina del dettaglio conversazioni unsuscibe da request by id viene fatto con un path sbagliato
        // id-nuovo-progetto/requests/id-richiesta invece che con - id-vecchio-progetto/requests/id-richiesta (vedi in ws-msgs.service unsubsToWS_MsgsByRequestId e unsubscribeTo_wsRequestById in questo componente)
        if (this.subscribed_request_id) {
          this.webSocketJs.unsubscribe('/' + this.project_id + '/requests/' + this.subscribed_request_id); // WHEN CHANGING THE PROJECT I UNSUBSCRIBE FROM THE "REQUEST BY ID" TO WHICH IT IS POSSIBLY SUBSCRIBED
          this.webSocketJs.unsubscribe('/' + this.project_id + '/requests/' + this.subscribed_request_id + '/messages'); // AS ABOVE BUT FOR MESSAGES
        }
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

          }, function (data, notification) {

            self.logger.log("[WS-REQUESTS-SERV] DSHB - UPDATE - DATA ", data);


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
            self.logger.log("[WS-REQUESTS-SERV] DSHB - ON-DATA - NOTIFICATION ", notification);

            // if (notification.event.method === 'CREATE') {

              // self.wsRequestsList.push(data[0]);
              // console.log("[WS-REQUESTS-SERV] DSHB - ON-DATA - DATA data published ",  self.wsRequestsList);

              // self.wsRequestsList$.next(data);
              // console.log("[WS-REQUESTS-SERV] DSHB - ON-DATA - DATA data published ",  data);

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
              // console.log("[WS-REQUESTS-SERV] DSHB - ON-DATA - DATA wsOnDataConvsList ", wsOnDataConvsList);
              // // if (wsOnDataRequestsList.length > 0) {
              // let wsOnDataConvsUnserved = wsOnDataConvsList[0].filter((el) => {
              //   return el.status === 100;
              // });
              // console.log("[WS-REQUESTS-SERV] DSHB - ON-DATA - DATA ONLY UNSERVED  ", wsOnDataConvsUnserved);
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
    this.logger.log("[WS-REQUESTS-SERV] - SUBSCR TO WS REQUEST-BY-ID (REF) id_request ", id_request);
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


  /**
   * unsubscribeTo_wsRequestById
   * 
   * @param id_request 
   */
  unsubscribeTo_wsRequestById(id_request) {
    this.webSocketJs.unsubscribe('/' + this.project_id + '/requests/' + id_request);

    this.logger.log("[WS-REQUESTS-SERV] - UNSUBSCRIBE REQUEST-BY-ID FROM WS request_id ", id_request, ' project_id ', this.project_id);
  }


  // -----------------------------------------------
  //  @ Subscribe to Requester Presence
  // -----------------------------------------------
  subscribeToWS_RequesterPresence(requesterid) {
    this.subscribed_requester_id = requesterid
    var self = this;

    const path = '/' + this.project_id + '/project_users/users/' + requesterid;

    this.logger.log("[WS-REQUESTS-SERV] - SUBSCRIBE TO REQUESTER-PRECENCE PATH ", path);

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

        self.currentUserWsAvailability$.next(data.user_available);
        if (data.isBusy) {
          self.currentUserWsIsBusy$.next(data.isBusy)
        } else {
          self.currentUserWsIsBusy$.next(false)
        }

      }, function (data, notification) {

        self.logger.log("[WS-REQUESTS-SERV] - SUBSCRIBE TO CURRENT-USER AVAILABILITY - UPDATE data", data);
        self.currentUserWsAvailability$.next(data.user_available);
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
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);

    const options = new RequestOptions({ headers });
    // this.logger.log('[WS-REQUESTS-SERV] -  CLOSE SUPPORT-GROUP OPTIONS  ', options)

    const body = {};

    // const url = 'https://tiledesk-server-pre.herokuapp.com/' + this.project_id + '/requests/' + group_id + '/close';
    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + group_id + '/close';

    this.logger.log('[WS-REQUESTS-SERV] - CLOSE SUPPORT-GROUP URL ', url);
    return this.http
      .put(url, body, options)
  }

  // --------------------------------------------------
  // @ Archive request using promise
  // --------------------------------------------------
  public archiveRequestOnPromise(request_id) {
    let promise = new Promise((resolve, reject) => {

      const headers = new Headers();
      headers.append('Accept', 'application/json');
      headers.append('Content-type', 'application/json');
      headers.append('Authorization', this.TOKEN);
      const options = new RequestOptions({ headers });

      const body = {};
      const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + request_id + '/close';
      this.logger.log('[WS-REQUESTS-SERV] - ARCHIVE REQUEST WITH PROMISE - URL ', url)

      this.http.put(url, body, options)
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
  // @ Delete request 
  // --------------------------------------------------
  public deleteRequest(request_id: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + request_id
    this.logger.log('[WS-REQUESTS-SERV] - DELETE REQUEST - URL ', url)

    return this.http
      .delete(url, options)
      .map((res) => res.json());
  }

  // --------------------------------------------------
  // @ Delete request using promise
  // --------------------------------------------------
  public deleteRequestOnPromise(request_id) {
    let promise = new Promise((resolve, reject) => {

      const headers = new Headers();
      headers.append('Accept', 'application/json');
      headers.append('Content-type', 'application/json');
      headers.append('Authorization', this.TOKEN);
      const options = new RequestOptions({ headers });

      const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + request_id
      this.logger.log('[WS-REQUESTS-SERV] - DELETE REQUEST USING PROMISE - URL ', url)

      this.http.delete(url, options)
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
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);

    const options = new RequestOptions({ headers });
    // this.logger.log('[WS-REQUESTS-SERV] JOIN DEPT OPTIONS  ', options)

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + requestid + '/departments'
    this.logger.log('[WS-REQUESTS-SERV] - JOIN DEPT URL ', url);

    const body = { 'departmentid': departmentid };
    // this.logger.log('CLOUD FUNCT CLOSE SUPPORT GROUP REQUEST BODY ', body);

    return this.http
      .put(url, body, options)
  }

  // --------------------------------------------------
  // @ LEAVE THE GROUP
  // --------------------------------------------------
  public leaveTheGroup(requestid: string, userid: string,) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });
    // this.logger.log('LEAVE THE GROUP OPTIONS  ', options)

    //   /:project_id/requests/:id/participants
    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + requestid + '/participants/' + userid
    this.logger.log('[WS-REQUESTS-SERV] - LEAVE THE GROUP URL ', url)

    return this.http
      .delete(url, options)
      .map((res) => res.json());
  }

  // SEE DOC HERE -> https://developer.tiledesk.com/apis/api/requests#set-the-request-participants
  // -----------------------------------------------------------------------------------------
  // @ Reassign request
  // -----------------------------------------------------------------------------------------
  public setParticipants(requestid: string, userUid: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });
    // this.logger.log('JOIN FUNCT OPTIONS  ', options);

    const body = [userUid];

    this.logger.log('[WS-REQUESTS-SERV] REASSIGN REQUEST - PUT REQUEST BODY ', body);

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + requestid + '/participants/'
    this.logger.log('[WS-REQUESTS-SERV] REASSIGN REQUEST - URL ', url)

    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }

  // SEE DOC HERE -> https://developer.tiledesk.com/apis/api/requests#add-a-participant-to-a-request
  // -----------------------------------------------------------------------------------------
  // @ Add participant
  // -----------------------------------------------------------------------------------------
  public addParticipant(requestid: string, userid: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });
    // this.logger.log('JOIN FUNCT OPTIONS  ', options);

    const body = { 'member': userid };
    this.logger.log('[WS-REQUESTS-SERV] ADD PARTICIPANT - BODY ', body);

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + requestid + '/participants/'
    this.logger.log('[WS-REQUESTS-SERV] ADD PARTICIPANT - URL ', url)

    return this.http
      .post(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }


  // -----------------------------------------------------------------------------------------
  // @ Create internal request
  // -----------------------------------------------------------------------------------------
  createInternalRequest(requester_id: string, request_id: string, subject: string, message: string, departmentid: string, participantid: string, ticketpriority: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });
    // this.logger.log('JOIN FUNCT OPTIONS  ', options);
    let body = {}
    body = { 'sender': requester_id, 'subject': subject, 'text': message, 'departmentid': departmentid, 'channel': { 'name': 'form' }, 'priority': ticketpriority };
    if (participantid !== undefined) {
      body['participants'] = [participantid]
    } else {
      body['participants'] = participantid
    }
    // , 'participants': [participantid]


    this.logger.log('[WS-REQUESTS-SERV] - CREATE INTERNAL REQUEST body ', body);

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + request_id + '/messages'
    this.logger.log('[WS-REQUESTS-SERV] - CREATE INTERNAL REQUEST URL ', url)

    return this.http
      .post(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }

  // -----------------------------------------------------------------------------------------
  // Update request by id - Remove all Tag -  /// NOT USED (was used for tag)
  // -----------------------------------------------------------------------------------------
  // updateRequestsById_RemoveAllTags(request_id: string) {
  //   const headers = new Headers();
  //   headers.append('Accept', 'application/json');
  //   headers.append('Content-type', 'application/json');
  //   headers.append('Authorization', this.TOKEN);
  //   const options = new RequestOptions({ headers });
  //   // this.logger.log('JOIN FUNCT OPTIONS  ', options);

  //   const body = { 'tags': [] };

  //   this.logger.log('[WS-REQUESTS-SERV] updateRequestsById - REMOVE ALL TAG - BODY ', body);

  //   const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + request_id
  //   this.logger.log('[WS-REQUESTS-SERV] updateRequestsById - REMOVE ALL TAG - BODY - URL ', url)

  //   return this.http
  //     .patch(url, JSON.stringify(body), options)
  //     .map((res) => res.json());
  // }

  // -----------------------------------------------------------------------------------------
  // Update request by id - (UPDATE TAG) Add / Remove tag
  // -----------------------------------------------------------------------------------------
  updateRequestsById_UpdateTag(request_id: string, tags: Array<string>) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });
    // this.logger.log('JOIN FUNCT OPTIONS  ', options);

    const body = { 'tags': tags };
    // const body = { 'tags':  { tag: "kll", color: "#43B1F2" } };
    this.logger.log('[WS-REQUESTS-SERV] UPDATE TAG - BODY ', body);

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + request_id
    this.logger.log('[WS-REQUESTS-SERV] UPDATE TAG - URL ', body);

    return this.http
      .patch(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }

  // -------------------------------------------------------
  // @ Create note
  // -------------------------------------------------------
  public createNote(note: string, request_id: string,) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'text': note };
    this.logger.log('[WS-REQUESTS-SERV] - CREATE NOTE  body ', body);

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + request_id + '/notes'
    this.logger.log('[WS-REQUESTS-SERV] - CREATE NOTE - URL ', url)

    return this.http
      .post(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }

  // ------------------------------------------------------
  // @ Delete note
  // ------------------------------------------------------
  public deleteNote(requestid: string, noteid: string,) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + requestid + '/notes/' + noteid
    this.logger.log('[WS-REQUESTS-SERV] - DELETE NOTE  URL ', url);

    return this.http
      .delete(url, options)
      .map((res) => res.json());
  }

  // -----------------------------------------------------------------------------------------
  // Update Priority
  // -----------------------------------------------------------------------------------------
  updatePriority(request_id: string, selectedPriority: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });
    // this.logger.log('JOIN FUNCT OPTIONS  ', options);

    const body = { 'priority': selectedPriority };
    // const body = { 'tags':  { tag: "kll", color: "#43B1F2" } };
    this.logger.log('[WS-REQUESTS-SERV] UPDATE PRIORITY - BODY ', body);

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + request_id
    this.logger.log('[WS-REQUESTS-SERV] UPDATE PRIORITY - URL ', body);

    return this.http
      .patch(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }


  // ------------------------------------------------------
  // @ Download history request as CSV
  // ------------------------------------------------------
  public downloadHistoryRequestsAsCsv(querystring: string, pagenumber: number) {
    let _querystring = '&' + querystring
    if (querystring === undefined || !querystring) {
      _querystring = ''
    }
    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/csv?status=1000' + _querystring + '&page=' + pagenumber;
    this.logger.log('[WS-REQUESTS-SERV][HISTORY & NORT-CONVS] - DOWNLOAD REQUESTS AS CSV URL ', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/csv');
    /* *** USED TO TEST IN LOCALHOST (note: this service doesn't work in localhost) *** */
    // headers.append('Authorization', 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJlbWFpbHZlcmlmaWVkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YWFhOTJmZjRjM2IxMTAwMTRiNDc4Y2IiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJsYXN0bmFtZSI6ImluaXQiLCJmaXJzdG5hbWUiOiJpbml0IiwiX2lkIjoiaW5pdCJ9LCJzdGF0ZXMiOnsiaWdub3JlIjp7fSwiZGVmYXVsdCI6e30sImluaXQiOnsibGFzdG5hbWUiOnRydWUsImZpcnN0bmFtZSI6dHJ1ZSwicGFzc3dvcmQiOnRydWUsImVtYWlsIjp0cnVlLCJfaWQiOnRydWV9LCJtb2RpZnkiOnt9LCJyZXF1aXJlIjp7fX0sInN0YXRlTmFtZXMiOlsicmVxdWlyZSIsIm1vZGlmeSIsImluaXQiLCJkZWZhdWx0IiwiaWdub3JlIl19LCJwYXRoc1RvU2NvcGVzIjp7fSwiZW1pdHRlciI6eyJkb21haW4iOm51bGwsIl9ldmVudHMiOnt9LCJfZXZlbnRzQ291bnQiOjAsIl9tYXhMaXN0ZW5lcnMiOjB9LCIkb3B0aW9ucyI6dHJ1ZX0sImlzTmV3IjpmYWxzZSwiX2RvYyI6eyJsYXN0bmFtZSI6IkxhbnppbG90dG8iLCJmaXJzdG5hbWUiOiJOaWNvbGEgNzQiLCJwYXNzd29yZCI6IiQyYSQxMCRwVWdocTVJclgxMzhTOXBEY1pkbG1lcnNjVTdVOXJiNlFKaVliMXlEckljOHJDMFh6c2hUcSIsImVtYWlsIjoibGFuemlsb3R0b25pY29sYTc0QGdtYWlsLmNvbSIsIl9pZCI6IjVhYWE5MmZmNGMzYjExMDAxNGI0NzhjYiJ9LCIkaW5pdCI6dHJ1ZSwiaWF0IjoxNTM4MTIzNTcyfQ.CYnxkLbg5XWk2JWAxQg1QNGDpNgNbZAzs5PEQpLCCnI');
    /* *** USED IN PRODUCTION *** */
    headers.append('Authorization', this.TOKEN);

    return this.http
      .get(url, { headers })
      .map((response) => response.text());
  }

  // -------------------------------------------------------------
  // WS Requests NO-RT & HISTORY
  // -------------------------------------------------------------
  public getHistoryAndNortRequests(operator: string, status: string, querystring: string, pagenumber: number) {
    this.logger.log('[WS-REQUESTS-SERV][HISTORY & NORT-CONVS] - REQUESTS SERVICE Get REQUESTS - operator  ', operator);
    this.logger.log('[WS-REQUESTS-SERV][HISTORY & NORT-CONVS] - REQUESTS SERVICE Get REQUEST - status  ', status);
    this.logger.log('[WS-REQUESTS-SERV][HISTORY & NORT-CONVS] - REQUESTS SERVICE Get REQUEST - querystring  ', querystring);
    this.logger.log('[WS-REQUESTS-SERV][HISTORY & NORT-CONVS] - REQUESTS SERVICE Get REQUEST - pagenumber  ', pagenumber);

    let _querystring = ''
    if (querystring && querystring !== undefined) {
      if (status === '100' || status === '200' || status === '1000') {
        _querystring = '&' + querystring
      } else if (status === 'all') {
        _querystring = querystring + '&'
      }
    } else {
      _querystring = ''
    }

    let url = '';
    if (status !== 'all') {
      url = this.SERVER_BASE_PATH + this.project_id + '/requests?status' + operator + status + _querystring + '&page=' + pagenumber + '&no_populate=true';
    } else {
      url = this.SERVER_BASE_PATH + this.project_id + '/requests?' + _querystring + 'page=' + pagenumber + '&no_populate=true';
    }

    this.logger.log('[WS-REQUESTS-SERV][HISTORY & NORT-CONVS] - GET REQUESTS URL ', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    headers.append('Authorization', this.TOKEN);

    return this.http
      .get(url, { headers })
      // .map((response) => response.json());
      .map(
        (response) => {
          const data = response.json();
          // Does something on data.data
          this.logger.log('[WS-REQUESTS-SERV][HISTORY & NORT-CONVS] - REQUESTS SERVICE * DATA * ', data);

          if (data.requests) {
            data.requests.forEach(request => {

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
  }





  // ---------------------------------
  // NOT SEEMS USED !!!!
  // ---------------------------------
  // public downloadNodeJsWSRequestsAsCsv(querystring: string, pagenumber: number) {
  //   let _querystring = '&' + querystring
  //   if (querystring === undefined || !querystring) {
  //     _querystring = ''
  //   }
  //   const url = this.SERVER_BASE_PATH + this.project_id + '/requests/csv?status<1000' + _querystring + '&page=' + pagenumber;
  //   this.logger.log('!!! NEW REQUESTS HISTORY - DOWNLOAD REQUESTS AS CSV URL ', url);

  //   const headers = new Headers();
  //   headers.append('Content-Type', 'application/csv');
  //   /* *** USED TO TEST IN LOCALHOST (note: this service doesn't work in localhost) *** */
  //   // headers.append('Authorization', 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJlbWFpbHZlcmlmaWVkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YWFhOTJmZjRjM2IxMTAwMTRiNDc4Y2IiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJsYXN0bmFtZSI6ImluaXQiLCJmaXJzdG5hbWUiOiJpbml0IiwiX2lkIjoiaW5pdCJ9LCJzdGF0ZXMiOnsiaWdub3JlIjp7fSwiZGVmYXVsdCI6e30sImluaXQiOnsibGFzdG5hbWUiOnRydWUsImZpcnN0bmFtZSI6dHJ1ZSwicGFzc3dvcmQiOnRydWUsImVtYWlsIjp0cnVlLCJfaWQiOnRydWV9LCJtb2RpZnkiOnt9LCJyZXF1aXJlIjp7fX0sInN0YXRlTmFtZXMiOlsicmVxdWlyZSIsIm1vZGlmeSIsImluaXQiLCJkZWZhdWx0IiwiaWdub3JlIl19LCJwYXRoc1RvU2NvcGVzIjp7fSwiZW1pdHRlciI6eyJkb21haW4iOm51bGwsIl9ldmVudHMiOnt9LCJfZXZlbnRzQ291bnQiOjAsIl9tYXhMaXN0ZW5lcnMiOjB9LCIkb3B0aW9ucyI6dHJ1ZX0sImlzTmV3IjpmYWxzZSwiX2RvYyI6eyJsYXN0bmFtZSI6IkxhbnppbG90dG8iLCJmaXJzdG5hbWUiOiJOaWNvbGEgNzQiLCJwYXNzd29yZCI6IiQyYSQxMCRwVWdocTVJclgxMzhTOXBEY1pkbG1lcnNjVTdVOXJiNlFKaVliMXlEckljOHJDMFh6c2hUcSIsImVtYWlsIjoibGFuemlsb3R0b25pY29sYTc0QGdtYWlsLmNvbSIsIl9pZCI6IjVhYWE5MmZmNGMzYjExMDAxNGI0NzhjYiJ9LCIkaW5pdCI6dHJ1ZSwiaWF0IjoxNTM4MTIzNTcyfQ.CYnxkLbg5XWk2JWAxQg1QNGDpNgNbZAzs5PEQpLCCnI');
  //   /* *** USED IN PRODUCTION *** */
  //   headers.append('Authorization', this.TOKEN);

  //   return this.http
  //     .get(url, { headers })
  //     .map((response) => response.text());
  //   // .map((response) => JSON.stringify(response.text()));
  // }



  // getWsRequestsById() {
  //   const self = this;
  //   self.wsRequestsList = []

  //   this.requestById = new WebSocketJs(
  //     CHAT_URL,

  //     function (data, notification) {

  //       this.logger.log("% WsRequestsService getWs RequestsById create", data);

  //       // const hasFound = self.wsRequestsList.filter((obj: any) => {
  //       //   return obj._id === data._id;
  //       // });

  //       // if (hasFound.length === 0) {
  //       //   self.addWsRequest(data)
  //       // } else {
  //       //   // this.logger.log("%%%  WsRequestsService hasFound - not add", hasFound);
  //       // }

  //       // if() 


  //     }, function (data, notification) {

  //       this.logger.log("% WsRequestsService getWs RequestsById update", data);
  //       // this.wsRequestsList.push(data);

  //       // self.addOrUpdateWsRequestsList(data);
  //       // self.updateWsRequest(data)
  //     }
  //   );

  //   // if(this.wsRequestsList) {
  //   //   self.wsRequestsList$.next(this.wsRequestsList);
  //   // }

  // }


  // -----------------------------

  // addOrUpdateWsRequestsList(request) {
  //   this.logger.log("% WsRequestsService getWsRequests addOrUpdateWsRequestsList: ", request);
  //   for (let i = 0; i < this.wsRequestsList.length; i++) {
  //     if (request._id === this.wsRequestsList[i]._id) {
  //       this.logger.log("% WsRequestsService getWsRequests UPATE AN EXISTING REQUESTS - request._id : ", request._id, ' wsRequestsList[i]._id: ', this.wsRequestsList[i]._id);
  //       /// UPATE AN EXISTING REQUESTS
  //       this.wsRequestsList[i] = request

  //     } else {

  //       this.wsRequestsList.push(request);
  //     }
  //   }

  //   this.wsRequestsList$.next(this.wsRequestsList);
  // }

  // getWsRequests_old() {
  //   this.wsRequestsList = []
  //   this.messages.subscribe(json => {
  //     this.logger.log("% WsRequestsService getWsRequests (Response from websocket) json : ", json);

  //     if (json) {
  //       const wsresponse = json
  //       const wsmethod = wsresponse['payload']['method'];

  //       // this.wsRequestsList$.next(this.wsRequestsList);


  //       this.logger.log("% WsRequestsService getWsRequests (Response from websocket) wsmethod: ", wsmethod);
  //       this.logger.log("% WsRequestsService getWsRequests (Response from websocket) wsRequestsList: ", this.wsRequestsList);
  //       //hai array di richieste iniziali 


  //       wsresponse['payload']['message'].forEach(request => {

  //         this.addOrUpdateWsRequestsList(request);

  //       });

  //     }

  //   });
  // }





  // wsConnectOld() {
  //   this.logger.log('%% HI WsRequestsService! - wsService ')
  //   this.messages = <Subject<Message>>this.wsService.connect(CHAT_URL).map(
  //     (response: MessageEvent): Message => {
  //       this.logger.log('%% WsRequestsService response ', response)
  //       let data = JSON.parse(response.data);
  //       return data;
  //       // return {
  //       //   action: data.action,
  //       //   payload: data.payload.topic
  //       // };

  //     }
  //   );
  // }


  // topic: '/5dc924a13fa2b8001798b9c1/requests',


}



