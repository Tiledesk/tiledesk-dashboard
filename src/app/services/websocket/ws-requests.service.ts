
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { Subject } from "rxjs/Subject";
import { AuthService } from '../../core/auth.service';
import { WebSocketJs } from "./websocket-js";
import { environment } from '../../../environments/environment';
import { Request } from '../../models/request-model';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/of';
import { Subscription } from 'rxjs/Subscription';
import { AppConfigService } from '../../services/app-config.service';
import { DepartmentService } from '../department.service';

export interface Message {
  action: string;
  payload: {
    topic: string,
    method: string, message: any
  };
}


@Injectable()

export class WsRequestsService implements OnDestroy {

  http: Http;
  public messages: Subject<Message>;

  requesTtotal: number;
  public wsRequestsList$: BehaviorSubject<Request[]> = new BehaviorSubject<Request[]>([]);
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
  wsAllRequestsList: any

  wsjsRequestsService: WebSocketJs;
  wsjsRequestByIdService: WebSocketJs;
  project_id: string;

  WS_IS_CONNECTED: number;
  currentUserID: string;

  // BASE_URL = environment.mongoDbConfig.BASE_URL; // replaced with SERVER_BASE_PATH
  // SERVER_BASE_PATH = environment.SERVER_BASE_URL; // now get from appconfig
  SERVER_BASE_PATH: string;

  TOKEN: string;
  timeout: any;
  subscription: Subscription;
  departments: any;
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
    private departmentService: DepartmentService
  ) {
    this.http = http;
    console.log("% HI WsRequestsService wsjsRequestsService  ", this.wsjsRequestsService);

    console.log("% »»» WebSocketJs - WsRequestsService BASE URL", this.SERVER_BASE_PATH);
    // console.log("% HI WsRequestsService CHAT_URL ", CHAT_URL);
    //this.wsConnect(); !no more used

    // this.getWsRequestsById()

    this.getAppConfig();
    // -----------------------------------------------------------------------------------------------------
    // REQUESTS - @ the publication of the 'current project' subscribes to the websocket requests
    // -----------------------------------------------------------------------------------------------------
    // NOTE_nk: comment this.getCurrentProjectAndSubscribeTo_WsRequests()
    this.getCurrentProjectAndSubscribeTo_WsRequests()
    this.getLoggedUser();

  }

  // getDepartments() {
  //   this.departmentService.getDeptsByProjectId().subscribe((_departments: any) => {
  //     console.log('% »»» WebSocketJs WF +++++ ws-requests--- service - GET DEPTS RESPONSE ', _departments);
  //     this.departments = _departments

  //   }, error => {
  //     console.log('% »»» WebSocketJs WF +++++ ws-requests--- service - GET DEPTS - ERROR: ', error);
  //   }, () => {
  //     console.log('% »»» WebSocketJs WF +++++ ws-requests--- service - GET DEPTS * COMPLETE *')
  //   });
  // }


  // getDeptObj(departmentid: string) {
  //   // const deptObjct =  this.departments.findIndex((e) => e.department === departmentid);
  //   const deptObjct = this.departments.filter((obj: any) => {
  //     return obj._id === departmentid;
  //   });
  //   console.log('% »»» WebSocketJs WF +++++ ws-requests--- service -  X-> DEPT OBJECT <-X', deptObjct)
  //   return deptObjct[0]
  // }

  getAppConfig() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    console.log('AppConfigService getAppConfig (WS-REQUESTS SERV.) SERVER_BASE_PATH ', this.SERVER_BASE_PATH);
  }

  ngOnDestroy() {
    console.log('% »»» WebSocketJs WF +++++ ws-requests--- service ≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥ ngOnDestroy')
    this.subscription.unsubscribe();
    // this.unsubscribe$.next();
    // this.unsubscribe$.complete();
  }


  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      if (user) {
        this.TOKEN = user.token
        this.currentUserID = user._id
        console.log("% »»» WebSocketJs - WsRequestsService CURRENT USER ID", this.currentUserID);
        console.log("% »»» WebSocketJs - WsRequestsService TOKEN", this.TOKEN);
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
    console.log('% »»» WebSocketJs WF +++++ ws-requests--- service resetWsRequestList')
  }

  getCurrentProjectAndSubscribeTo_WsRequests() {
    var self = this;
    self.wsRequestsList = [];
    self.wsAllRequestsList = [];

    // this.subscription  =  
    this.auth.project_bs.subscribe((project) => {
      console.log('% »»» WebSocketJs WF +++++ ws-requests--- service  PRJCT VALUE = ', this.auth.project_bs.value)

      // console.log('%% WsRequestsService PROJECT ', project)
      // console.log('% »»» WebSocketJs WF ****** WsRequestsService PROJECT._ID 1', project)

      // ---------------------------------------------------------------------------------
      // Unsubscribe to websocket requests with the old project id  
      // ---------------------------------------------------------------------------------
      if (this.project_id) {
        // console.log('% »»» WebSocketJs WF +++++ ws-requests--- service getWsRequests */* ref */* this.project_id ', this.project_id)
        // console.log('%% WsRequestsService THIS.PROJECT_ID ', this.project_id)
        //this.unsubsToWS_Requests(this.project_id);
     
        console.log('% »»» WebSocketJs WF +++++ ws-requests--- service getWsRequests unsubscribe project._id', this.project_id)
        this.webSocketJs.unsubscribe('/' + this.project_id + '/requests');
        this.resetWsRequestList();
      }


      if (project) {
        // console.log('% »»» WebSocketJs WF ****** WsRequestsService PROJECT._ID 2', project._id)
        console.log('% »»» WebSocketJs WF +++++ ws-requests--- service getWsRequests */* ref */* project._id', project._id)
        console.log('% »»» WebSocketJs WF +++++ ws-requests--- service getWsRequests */* ref */* this.project_id ', this.project_id)

        this.project_id = project._id;

        // this.getDepartments()
        // this.departmentService.getDeptsByProjectIdToPromise().then((_departments: any) => {

        // console.log('% »»» WebSocketJs WF +++++ ws-requests--- service - GET DEPTS TO PROMISE RESPONSE ', _departments);
        // self.departments = _departments

        // this.subsToWS_Requests(this.project_id)
        // this.webSocketJs.subscribe('/' + this.project_id + '/requests');

        // console.log('% »»» WebSocketJs WF ****** WS-REQUESTS-SERVICE - WS_IS_CONNECTED ****** ', this.WS_IS_CONNECTED );

        // if (this.WS_IS_CONNECTED === 1) {
        this.webSocketJs.ref('/' + this.project_id + '/requests', 'getCurrentProjectAndSubscribeTo_WsRequests',

          function (data, notification) {

            // console.log("% »»» WebSocketJs WF +++++ ws-requests--- service ----- HERE ON-CREATE !");

            // if (self.wsRequestsList.length > 0) {

            console.log("% »»» WebSocketJs WF +++++ ws-requests--- service ----- ON-CREATE - DATA ", data);
            // data['dept'] = self.getDeptObj(data.department)

            // console.log("% »»» WebSocketJs WF +++++ ws-requests--- service ----- ON-CREATE - WS-REQUESTS ARRAY ", self.wsRequestsList);

            // const hasFound = self.wsRequestsList.filter((obj: any) => {
            //   if (data && obj) {
            //     return obj._id === data._id;
            //   }
            // });

            // if (hasFound.length === 0) {
            //   self.addWsRequests(data)

            //   // console.log("% »»» WebSocketJs WF - WsRequestsService Not Found - <<<<<<<<<<<<<<< add request >>>>>>>>>>>>>>>", data);
            // } else {
            //   // console.log("% »»» WebSocketJs WF - WsRequestsService hasFound - not added", hasFound);
            // }

            // https://stackoverflow.com/questions/36719477/array-push-and-unique-items
            const index = self.wsRequestsList.findIndex((e) => e.id === data.id);

            if (index === -1) {
              self.addWsRequests(data)

              console.log("% »»» WebSocketJs WF +++++ ws-requests--- service ----- CREATE the request not exist - addWsRequests!");
            } else {
              console.log("% »»» WebSocketJs WF +++++ ws-requests--- service ----- CREATE the request exist - NOT addWsRequests!");
            }

            // }
          }, function (data, notification) {
            // data['dept'] = self.getDeptObj(data.department)
            console.log("% »»» WebSocketJs WF +++++ ws-requests--- service ----- ON-UPDATE", data);
            // this.wsRequestsList.push(data);

            // self.addOrUpdateWsRequestsList(data);
            self.updateWsRequests(data)


          }, function (data, notification) {
            // console.log("% »»» WebSocketJs WF +++++ ws-requests--- service ----- HERE ON-DATA !");
            // console.log("% »»» WebSocketJs WF - WsRequestsService ON-DATA REQUESTS *** notification *** ", notification);

            // && data.length !== undefined

            // setTimeout(() => {
            //   // behaviorSubject.next('Angular 8');
            //   // replaySubject.next('Angular 8');
            //   self.ws_All_RequestsLength$$.next(data.length);
            // }, 1000);

            // && data.length > 0
            // setTimeout(() => { 
            if (data) {


              console.log("% »»» WebSocketJs WF +++++ ws-requests--- service ----- ON-DATA - WS-REQUESTS ARRAY ", self.wsRequestsList);

              // if (self.wsRequestsList && self.wsRequestsList.length === 0 && Array.isArray(data)) {

              //   console.log("% »»» WebSocketJs WF +++++ ws-requests--- service ----- ON-DATA - DATA LENGHT ", data.length);
              //   self.wsRequestsList = data;
              //   self.wsRequestsList$.next(self.wsRequestsList);
              //   console.log("% »»» WebSocketJs WF +++++ ws-requests--- service ----- ON-DATA ----- NEXT ", data);

              //   /**
              //    * USE CASE : INIZIALMENTE DATA è VUOTO (NN CI SONO RICHIESTE) E POI ARRIVA UNA RICHIESTA - ARRIVANDO SINGOLA ARRIVA COME UN JSON *
              //    */
              // } else if (self.wsRequestsList && self.wsRequestsList.length === 0 && !Array.isArray(data)) {


              //   self.wsRequestsList$.next([data]);
              //   self.wsRequestsList.push(data);

              // }

              // console.log("% »»» WebSocketJs WF - onData (ws-requests.serv) ≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥ data is ARRAY", Array.isArray(data));
              /**
               * data.map works only with array
               * 
               */
              if (Array.isArray(data)) {

                // https://stackoverflow.com/questions/18983138/callback-after-all-asynchronous-foreach-callbacks-are-completed
                let requests = data.map((item) => {
                  return new Promise((resolve) => {
                    self.asyncFunction(item, resolve);
                  });
                })
                Promise.all(requests).then(() => {

                  // console.log('% »»» WebSocketJs WF +++++ ws-requests--- service ≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥ done -> data.length ', data.length)
                  // console.log('% »»» WebSocketJs WF +++++ ws-requests--- service ≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥ done -> data ', data)

                  // var served = data.filter(r => {
                  //   if (r['status'] !== 100) {
                  //     return true
                  //   }
                  // })

                  // var unserved = data.filter(r => {
                  //   if (r['status'] === 100) {
                  //     return true
                  //   }
                  // })
                  // console.log('% »»» WebSocketJs WF +++++ ws-requests--- service ≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥ done -> served length ', served.length)
                  // console.log('% »»» WebSocketJs WF +++++ ws-requests--- service ≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥ done -> unserved length ', unserved.length)


                  self.ws_All_RequestsLength$.next(data.length);
                  // self.ws_Served_RequestsLength$.next(served.length);
                  // self.ws_Unserved_RequestsLength$.next(unserved.length);
                });

              }
              // this.requesTtotal = data.length
              // if (this.requesTtotal) {
              // self.getRequestsTotalCount()
              // }

              // this.requesTtotal = data
              // self.getTotalRequestLength();

              // var promise = new Promise(function(resolve, reject) {
              //   if (data) {
              //     resolve(data);
              //   } else {
              //     reject('motivo');
              //   }
              // });

              // self.getTotalRequestLength(data.length)

            }
            // }, 100);
            // else if (data.length === 0) {
            //   self.wsRequestsListLength$.next(0);
            //   console.log("% »»» WebSocketJs WF - WsRequestsService  >>>>>>> HERE 2 <<<<<<< ");

            // }
          }
        );
        // });
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
    // console.log("% WsRequestsService addWsRequest wsRequestsList.length", this.wsRequestsList.length);
    console.log("% »»» WebSocketJs WF - WsRequestsService addWsRequest request ", request);

    if (request !== null && request !== undefined) {
      this.wsRequestsList.push(request);
    }

    if (this.wsRequestsList) {
      // -----------------------------------------------------------------------------------------------------
      // publish all REQUESTS 
      // -----------------------------------------------------------------------------------------------------
      // this.wsRequestsList$.next(this.wsRequestsList);
      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      this.timeout = setTimeout(() => {
        this.wsRequestsList$.next(this.wsRequestsList);
        console.log('% »»» WebSocketJs WF +++++ ws-requests--- service ON-CREATE ----- NEXT wsRequestsList ', this.wsRequestsList)
        // this.ws_All_RequestsLength$.next(this.wsRequestsList.length);
        // console.log('% »»» WebSocketJs WF +++++ ws-requests--- service ON-CREATE ----- NEXT wsRequestsList LENGTH', this.wsRequestsList.length)
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
    // console.log("% »»» WebSocketJs WF +++++ ws-requests--- service ON-UPATE hasFound IN wsRequestsList: ", hasFound , 'THE REQUEST ID', request._id);

    const index = this.wsRequestsList.findIndex((e) => e.id === request.id);
    if (index === -1) {

      console.log("% »»» WebSocketJs WF +++++ ws-requests--- service ----- ON-UPATE the request not exist - PUSH & PUBLISH ");
      this.wsRequestsList.push(request);
      this.wsRequestsList$.next(this.wsRequestsList);

    } else {
      console.log("% »»» WebSocketJs WF +++++ ws-requests--- service ----- ON-UPATE the request exist");
    }




    for (let i = 0; i < this.wsRequestsList.length; i++) {

      if (request._id === this.wsRequestsList[i]._id) {
        console.log("% »»» WebSocketJs WF +++++ ws-requests--- service ON-UPATE AN EXISTING REQUESTS - request._id : ", request._id, " wsRequestsList[i]._id: ", this.wsRequestsList[i]._id);


        if (request.status !== 1000) {

          /// UPATE AN EXISTING REQUESTS
          this.wsRequestsList[i] = request
          console.log("% »»» WebSocketJs WF +++++ ws-requests--- service ON-UPATE request (status !== 1000): ", request);

          // if (this.wsRequestsList) {
          //   // this.wsRequestsList$.next(request);
          //   this.wsRequestsList$.next(this.wsRequestsList);
          // }

        } else if (request.status === 1000) {

          console.log("% »»» WebSocketJs WF +++++ ws-requests--- service ON-UPATE request (status === 1000): ", request);
          // delete this.wsRequestsList[i]
          this.wsRequestsList.splice(i, 1);

        }

        if (this.wsRequestsList) {
          this.wsRequestsList$.next(this.wsRequestsList);
          console.log("% »»» WebSocketJs WF +++++ ws-requests--- service ON-UPATE REQUESTS LIST: ", this.wsRequestsList);
        }
      }

      // else {

      //   console.log("% »»» WebSocketJs WF +++++ ws-requests--- service ON-UPATE AN !NOT EXISTING REQUESTS - request._id : ", request._id, " wsRequestsList[i]._id: ", this.wsRequestsList[i]._id);
      // }
    }
  }



  // -----------------------------------------------------------------------------------------------------
  // methods for REQUEST BY ID  
  // -----------------------------------------------------------------------------------------------------

  /**
   * 
   * REQUEST BY ID - Subscribe to websocket request by id service 
   * called when in WsRequestsMsgsComponent onInit() is got the request id from url params
   * 
   * @param id_request 
   */
  subscribeTo_wsRequestById(id_request) {
    var self = this;
    // var message = {
    //   action: 'subscribe',
    //   payload: {
    //     topic: '/' + this.project_id + '/requests/' + id_request,
    //     // topic: '/' + project_id + '/requests/support-group-LtOiA7nku6c9Ho0rUfa/messages/',
    //     message: undefined,
    //     method: undefined
    //   },
    // };
    // var str = JSON.stringify(message);
    // console.log("%% str " + str);

    // ----------------------------------------------
    // SUBSCRIPTION START (send subscription message)
    // ----------------------------------------------
    // this.wsjsRequestByIdService.send(str);

    // this.webSocketJs.ref('/' + this.project_id + '/requests/' + id_request,
    console.log('% »»» WebSocketJs WF >>> ws-msgs--- r-service - SUBSCR To WS REQUEST-BY-ID ****** CALLING REF ******');
    this.webSocketJs.ref('/' + this.project_id + '/requests/' + id_request, 'subscribeTo_wsRequestById',

      function (data, notification) {

        console.log("% »»» WebSocketJs WF - WsMsgsService REQUEST-BY-ID CREATE ", data);
        console.log("% »»» WebSocketJs WF >>> ws-msgs--- r-service - SUBSCR To WS REQUEST-BY-ID - CREATE - data ", data);
        /**
         *  HERE MANAGE IF ALREADY HAS EMIT THE REQUEST BY ID
         */

        self.addWsRequest(data)
        // const hasFound = self.wsRequestsList.filter((obj: any) => {
        //   return obj._id === data._id;
        // });

        // if (hasFound.length === 0) {
        //   self.addWsRequest(data)
        // } else {
        //   // console.log("%%%  WsRequestsService hasFound - not add", hasFound);
        // }

        // if() 

      }, function (data, notification) {

        // console.log("% »»» WebSocketJs WF - WsMsgsService REQUEST-BY-ID UPDATE ", data);
        console.log("% »»» WebSocketJs WF >>> ws-msgs--- r-service - SUBSCR To WS REQUEST-BY-ID - UPDATE - data ", data);
        self.updateWsRequest(data)
        // this.wsRequestsList.push(data);

        // self.addOrUpdateWsRequestsList(data);
        // self.updateWsRequest(data)
      }, function (data, notification) {
        // dismetti loading
      }
    );
    // console.log("% SUB »»»»»»» subsToWS RequestById from client to websocket: ", message);
  }


  /**
   * 
   * REQUEST BY ID publish @ the CREATE
   * 
   * @param request 
   */
  addWsRequest(request) {
    console.log("% »»» WebSocketJs WF >>> ws-msgs--- r-service - ADD WS REQUEST-BT-ID (PUBLISH) ", request);
    this.wsRequest$.next(request);

  }

  /**
   * 
   * REQUEST BY ID publish @ the UPDATE
   * 
   * @param request 
   */
  updateWsRequest(request) {
    console.log("% »»» WebSocketJs WF >>> ws-msgs--- r-service - UPDATE WS REQUEST-BT-ID (PUBLISH) ", request);
    this.wsRequest$.next(request);
  }


  /**
   * 
   * 
   * @param id_request 
   */
  unsubscribeTo_wsRequestById(id_request) {
    // var message = {
    //   action: 'unsubscribe',
    //   payload: {
    //     topic: '/' + this.project_id + '/requests/' + id_request,
    //     // topic: '/' + project_id + '/requests/support-group-LtOiA7nku6c9Ho0rUfa/messages/',
    //     message: undefined,
    //     method: undefined
    //   },
    // };
    // var str = JSON.stringify(message);
    // console.log("%% str " + str);

    // ----------------------------------------------
    // SUBSCRIPTION START (send subscription message)
    // ----------------------------------------------
    // this.wsjsRequestByIdService.send(str);
    this.webSocketJs.unsubscribe('/' + this.project_id + '/requests/' + id_request);
    console.log("% »»» WebSocketJs WF >>> ws-msgs--- r-service - UN-SUBS REQUEST-BY-ID FROM WS »»»»»»» request_id ", id_request);

  }


  // CLOSE SUPPORT GROUP
  public closeSupportGroup(group_id: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);

    const options = new RequestOptions({ headers });
    console.log('% »»» WebSocketJs WF - CLOUD FUNCT CLOSE SUPPORT OPTIONS  ', options)

    const body = {};
    // console.log('CLOUD FUNCT CLOSE SUPPORT GROUP REQUEST BODY ', body);

    // const url = 'https://tiledesk-server-pre.herokuapp.com/' + this.project_id + '/requests/' + group_id + '/close';
    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + group_id + '/close';

    console.log('% »»» WebSocketJs WF - NEW CLOSE SUPPORT GROUP URL ', url);
    return this.http
      .put(url, body, options)
    // commented because the service not return nothing and if try to map the json obtain the error:
    // ERROR  SyntaxError: Unexpected end of JSON
    // .map((res) => res.json());
  }

  public deleteRequest(request_id: string) {

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + request_id
    console.log('DELETE REQUEST URL ', url)

    return this.http
      .delete(url, options)
      .map((res) => res.json());
  }



  joinDept(departmentid, requestid) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);

    const options = new RequestOptions({ headers });
    console.log('JOIN DEPT OPTIONS  ', options)

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + requestid + '/departments'
    console.log('JOIN DEPT URL ', url);

    const body = { 'departmentid': departmentid };
    // console.log('CLOUD FUNCT CLOSE SUPPORT GROUP REQUEST BODY ', body);

    return this.http
      .put(url, body, options)
  }

  public leaveTheGroup(requestid: string, userid: string,) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });
    console.log('LEAVE THE GROUP OPTIONS  ', options)

    //   /:project_id/requests/:id/participants
    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + requestid + '/participants/' + userid
    console.log('LEAVE THE GROUP URL ', url)

    return this.http
      .delete(url, options)
      .map((res) => res.json());
  }

  // SEE DOC HERE -> https://developer.tiledesk.com/apis/api/requests#set-the-request-participants
  // -----------------------------------------------------------------------------------------
  // Reassign request
  // -----------------------------------------------------------------------------------------
  public setParticipants(requestid: string, userUid: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });
    // console.log('JOIN FUNCT OPTIONS  ', options);

    const body = [userUid];

    console.log('JOIN TO GROUP PUT REQUEST BODY ', body);

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + requestid + '/participants/'
    console.log('JOIN TO GROUP PUT JOIN A GROUP URL ', url)

    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }

  // SEE DOC HERE -> https://developer.tiledesk.com/apis/api/requests#add-a-participant-to-a-request
  // -----------------------------------------------------------------------------------------
  // Add participant
  // -----------------------------------------------------------------------------------------
  public addParticipant(requestid: string, userid: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });
    // console.log('JOIN FUNCT OPTIONS  ', options);

    const body = { 'member': userid };
    console.log('JOIN TO GROUP PUT REQUEST BODY ', body);

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + requestid + '/participants/'
    console.log('JOIN TO GROUP PUT JOIN A GROUP URL ', url)

    return this.http
      .post(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }


  // -----------------------------------------------------------------------------------------
  // Create internal request
  // -----------------------------------------------------------------------------------------
  createInternalRequest(request_id: string, subject: string, message: string, departmentid: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });
    // console.log('JOIN FUNCT OPTIONS  ', options);

    const body = { 'subject': subject, 'text': message, 'departmentid': departmentid };

    console.log('createInternalRequest ', body);

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + request_id + '/messages'
    console.log('createInternalRequest URL ', url)

    return this.http
      .post(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }

  // -----------------------------------------------------------------------------------------
  // Update request by id - Remove all Tag
  // -----------------------------------------------------------------------------------------
  updateRequestsById_RemoveAllTags(request_id: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });
    // console.log('JOIN FUNCT OPTIONS  ', options);

    const body = { 'tags': [] };

    console.log('updateRequestsById - add tag body ', body);

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + request_id
    console.log('updateRequestsById - add tag URL ', url)

    return this.http
      .patch(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }

  // -----------------------------------------------------------------------------------------
  // Update request by id - Add tag
  // -----------------------------------------------------------------------------------------
  updateRequestsById_AddTag(request_id: string, tags: Array<string>) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });
    // console.log('JOIN FUNCT OPTIONS  ', options);

    const body = { 'tags': tags };
    // const body = { 'tags':  { tag: "kll", color: "#43B1F2" } };
    console.log('updateRequestsById - add tag body ', body);

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + request_id
    console.log('updateRequestsById - add tag URL ', url)

    return this.http
      .patch(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }




  // -----------------------------------------------------------------------------------------
  // Create note
  // -----------------------------------------------------------------------------------------
  public createNote(note: string, request_id: string,) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'text': note };
    console.log('create note - body ', body);

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + request_id + '/notes'
    console.log('create note - URL ', url)

    return this.http
      .post(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }


  public deleteNote(requestid: string, noteid: string,) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + requestid + '/notes/' + noteid
    console.log('delete note - url ', url);

    return this.http
      .delete(url, options)
      .map((res) => res.json());
  }


  public downloadNodeJsHistoryRequestsAsCsv(querystring: string, pagenumber: number) {
    let _querystring = '&' + querystring
    if (querystring === undefined || !querystring) {
      _querystring = ''
    }
    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/csv?status=1000' + _querystring + '&page=' + pagenumber;
    console.log('!!! NEW REQUESTS HISTORY - DOWNLOAD REQUESTS AS CSV URL ', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/csv');
    /* *** USED TO TEST IN LOCALHOST (note: this service doesn't work in localhost) *** */
    // headers.append('Authorization', 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJlbWFpbHZlcmlmaWVkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YWFhOTJmZjRjM2IxMTAwMTRiNDc4Y2IiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJsYXN0bmFtZSI6ImluaXQiLCJmaXJzdG5hbWUiOiJpbml0IiwiX2lkIjoiaW5pdCJ9LCJzdGF0ZXMiOnsiaWdub3JlIjp7fSwiZGVmYXVsdCI6e30sImluaXQiOnsibGFzdG5hbWUiOnRydWUsImZpcnN0bmFtZSI6dHJ1ZSwicGFzc3dvcmQiOnRydWUsImVtYWlsIjp0cnVlLCJfaWQiOnRydWV9LCJtb2RpZnkiOnt9LCJyZXF1aXJlIjp7fX0sInN0YXRlTmFtZXMiOlsicmVxdWlyZSIsIm1vZGlmeSIsImluaXQiLCJkZWZhdWx0IiwiaWdub3JlIl19LCJwYXRoc1RvU2NvcGVzIjp7fSwiZW1pdHRlciI6eyJkb21haW4iOm51bGwsIl9ldmVudHMiOnt9LCJfZXZlbnRzQ291bnQiOjAsIl9tYXhMaXN0ZW5lcnMiOjB9LCIkb3B0aW9ucyI6dHJ1ZX0sImlzTmV3IjpmYWxzZSwiX2RvYyI6eyJsYXN0bmFtZSI6IkxhbnppbG90dG8iLCJmaXJzdG5hbWUiOiJOaWNvbGEgNzQiLCJwYXNzd29yZCI6IiQyYSQxMCRwVWdocTVJclgxMzhTOXBEY1pkbG1lcnNjVTdVOXJiNlFKaVliMXlEckljOHJDMFh6c2hUcSIsImVtYWlsIjoibGFuemlsb3R0b25pY29sYTc0QGdtYWlsLmNvbSIsIl9pZCI6IjVhYWE5MmZmNGMzYjExMDAxNGI0NzhjYiJ9LCIkaW5pdCI6dHJ1ZSwiaWF0IjoxNTM4MTIzNTcyfQ.CYnxkLbg5XWk2JWAxQg1QNGDpNgNbZAzs5PEQpLCCnI');
    /* *** USED IN PRODUCTION *** */
    headers.append('Authorization', this.TOKEN);

    return this.http
      .get(url, { headers })
      .map((response) => response.text());
    // .map((response) => JSON.stringify(response.text()));
  }


  // ---------------------------------------------------------------------
  // HISTORY  Requests (used in history)
  // ---------------------------------------------------------------------
  public getNodeJsHistoryRequests(querystring: string, pagenumber: number) {
    let _querystring = '&' + querystring
    if (querystring === undefined || !querystring) {
      _querystring = ''
    }
    /* *** USED TO TEST IN LOCALHOST (note: this service doen't work in localhost) *** */
    // const url = 'https://api.tiledesk.com/v1/' + '5af02d8f705ac600147f0cbb' + '/requests?status=1000' + _querystring + '&page=' + pagenumber;
    /* *** USED IN PRODUCTION *** */
    const url = this.SERVER_BASE_PATH + this.project_id + '/requests?status=1000' + _querystring + '&page=' + pagenumber;

    console.log('!!! NEW REQUESTS HISTORY - REQUESTS SERVICE URL ', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    /* *** USED TO TEST IN LOCALHOST (note: this service doesn't work in localhost) *** */
    // headers.append('Authorization', 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJlbWFpbHZlcmlmaWVkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YWM3NTIxNzg3ZjZiNTAwMTRlMGI1OTIiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJlbWFpbHZlcmlmaWVkIjoiaW5pdCIsImxhc3RuYW1lIjoiaW5pdCIsImZpcnN0bmFtZSI6ImluaXQiLCJfaWQiOiJpbml0In0sInN0YXRlcyI6eyJpZ25vcmUiOnt9LCJkZWZhdWx0Ijp7fSwiaW5pdCI6eyJlbWFpbHZlcmlmaWVkIjp0cnVlLCJsYXN0bmFtZSI6dHJ1ZSwiZmlyc3RuYW1lIjp0cnVlLCJwYXNzd29yZCI6dHJ1ZSwiZW1haWwiOnRydWUsIl9pZCI6dHJ1ZX0sIm1vZGlmeSI6e30sInJlcXVpcmUiOnt9fSwic3RhdGVOYW1lcyI6WyJyZXF1aXJlIiwibW9kaWZ5IiwiaW5pdCIsImRlZmF1bHQiLCJpZ25vcmUiXX0sInBhdGhzVG9TY29wZXMiOnt9LCJlbWl0dGVyIjp7Il9ldmVudHMiOnt9LCJfZXZlbnRzQ291bnQiOjAsIl9tYXhMaXN0ZW5lcnMiOjB9LCIkb3B0aW9ucyI6dHJ1ZX0sImlzTmV3IjpmYWxzZSwiX2RvYyI6eyJlbWFpbHZlcmlmaWVkIjp0cnVlLCJsYXN0bmFtZSI6IkxhbnppbG90dG8iLCJmaXJzdG5hbWUiOiJOaWNvIiwicGFzc3dvcmQiOiIkMmEkMTAkTlBoSk5VNVZDYlU2d05idG1Jck5lT3MxR0dBSW5rMERMeGVYWXN2dklHZ1JnY1dMWW1kYkciLCJlbWFpbCI6Im5pY29sYS5sYW56aWxvdHRvQGZyb250aWVyZTIxLml0IiwiX2lkIjoiNWFjNzUyMTc4N2Y2YjUwMDE0ZTBiNTkyIn0sIiRpbml0Ijp0cnVlLCJpYXQiOjE1NjgzMDg2OTl9.sl2zMzVv__5Gc7Xj6TV1lkzxkqnRVMv7-U3YHBbpq20');
    /* *** USED IN PRODUCTION *** */
    headers.append('Authorization', this.TOKEN);

    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }



  // -------------------------------------------------------------
  // WS Requests no-realtime
  // -------------------------------------------------------------
  public getNodeJsWSRequests(operator: string, status: string, querystring: string, pagenumber: number) {

    console.log('!!! NEW REQUESTS HISTORY - REQUESTS SERVICE Get NodeREQUEST - operator  ', operator);
    console.log('!!! NEW REQUESTS HISTORY - REQUESTS SERVICE Get NodeREQUEST - status  ', status);
    console.log('!!! NEW REQUESTS HISTORY - REQUESTS SERVICE Get NodeREQUEST - querystring  ', querystring);
    console.log('!!! NEW REQUESTS HISTORY - REQUESTS SERVICE Get NodeREQUEST - pagenumber  ', pagenumber);

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

    // if (querystring === undefined || !querystring) {
    //   _querystring = ''
    // }

    // if (status === '1000') {
    //   _querystring = querystring
    // }

    let url = '';
    if (status !== 'all') {
      url = this.SERVER_BASE_PATH + this.project_id + '/requests?status' + operator + status + _querystring + '&page=' + pagenumber;
    } else {
      url = this.SERVER_BASE_PATH + this.project_id + '/requests?' + _querystring + 'page=' + pagenumber;
    }



    // let _querystring = ''
    // if (status === '100' || status === '200') {
    //   _querystring = '&' + querystring
    // }

    // if (querystring === undefined || !querystring) {
    //   _querystring = ''
    // }

    // if (status === '1000') {
    //   _querystring = querystring
    // }

    // let url = '';
    // if (status !== '1000') {
    //   url = this.SERVER_BASE_PATH + this.project_id + '/requests?status' + operator + status + _querystring + '&page=' + pagenumber;
    // } else {
    //   url = this.SERVER_BASE_PATH + this.project_id + '/requests?' + _querystring + '&page=' + pagenumber;
    // }

    console.log('!!! NEW REQUESTS HISTORY - REQUESTS SERVICE URL ', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    headers.append('Authorization', this.TOKEN);

    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  public downloadNodeJsWSRequestsAsCsv(querystring: string, pagenumber: number) {
    let _querystring = '&' + querystring
    if (querystring === undefined || !querystring) {
      _querystring = ''
    }
    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/csv?status<1000' + _querystring + '&page=' + pagenumber;
    console.log('!!! NEW REQUESTS HISTORY - DOWNLOAD REQUESTS AS CSV URL ', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/csv');
    /* *** USED TO TEST IN LOCALHOST (note: this service doesn't work in localhost) *** */
    // headers.append('Authorization', 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJlbWFpbHZlcmlmaWVkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YWFhOTJmZjRjM2IxMTAwMTRiNDc4Y2IiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJsYXN0bmFtZSI6ImluaXQiLCJmaXJzdG5hbWUiOiJpbml0IiwiX2lkIjoiaW5pdCJ9LCJzdGF0ZXMiOnsiaWdub3JlIjp7fSwiZGVmYXVsdCI6e30sImluaXQiOnsibGFzdG5hbWUiOnRydWUsImZpcnN0bmFtZSI6dHJ1ZSwicGFzc3dvcmQiOnRydWUsImVtYWlsIjp0cnVlLCJfaWQiOnRydWV9LCJtb2RpZnkiOnt9LCJyZXF1aXJlIjp7fX0sInN0YXRlTmFtZXMiOlsicmVxdWlyZSIsIm1vZGlmeSIsImluaXQiLCJkZWZhdWx0IiwiaWdub3JlIl19LCJwYXRoc1RvU2NvcGVzIjp7fSwiZW1pdHRlciI6eyJkb21haW4iOm51bGwsIl9ldmVudHMiOnt9LCJfZXZlbnRzQ291bnQiOjAsIl9tYXhMaXN0ZW5lcnMiOjB9LCIkb3B0aW9ucyI6dHJ1ZX0sImlzTmV3IjpmYWxzZSwiX2RvYyI6eyJsYXN0bmFtZSI6IkxhbnppbG90dG8iLCJmaXJzdG5hbWUiOiJOaWNvbGEgNzQiLCJwYXNzd29yZCI6IiQyYSQxMCRwVWdocTVJclgxMzhTOXBEY1pkbG1lcnNjVTdVOXJiNlFKaVliMXlEckljOHJDMFh6c2hUcSIsImVtYWlsIjoibGFuemlsb3R0b25pY29sYTc0QGdtYWlsLmNvbSIsIl9pZCI6IjVhYWE5MmZmNGMzYjExMDAxNGI0NzhjYiJ9LCIkaW5pdCI6dHJ1ZSwiaWF0IjoxNTM4MTIzNTcyfQ.CYnxkLbg5XWk2JWAxQg1QNGDpNgNbZAzs5PEQpLCCnI');
    /* *** USED IN PRODUCTION *** */
    headers.append('Authorization', this.TOKEN);

    return this.http
      .get(url, { headers })
      .map((response) => response.text());
    // .map((response) => JSON.stringify(response.text()));
  }



  // getWsRequestsById() {
  //   const self = this;
  //   self.wsRequestsList = []

  //   this.requestById = new WebSocketJs(
  //     CHAT_URL,

  //     function (data, notification) {

  //       console.log("% WsRequestsService getWs RequestsById create", data);

  //       // const hasFound = self.wsRequestsList.filter((obj: any) => {
  //       //   return obj._id === data._id;
  //       // });

  //       // if (hasFound.length === 0) {
  //       //   self.addWsRequest(data)
  //       // } else {
  //       //   // console.log("%%%  WsRequestsService hasFound - not add", hasFound);
  //       // }

  //       // if() 


  //     }, function (data, notification) {

  //       console.log("% WsRequestsService getWs RequestsById update", data);
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
  //   console.log("% WsRequestsService getWsRequests addOrUpdateWsRequestsList: ", request);
  //   for (let i = 0; i < this.wsRequestsList.length; i++) {
  //     if (request._id === this.wsRequestsList[i]._id) {
  //       console.log("% WsRequestsService getWsRequests UPATE AN EXISTING REQUESTS - request._id : ", request._id, ' wsRequestsList[i]._id: ', this.wsRequestsList[i]._id);
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
  //     console.log("% WsRequestsService getWsRequests (Response from websocket) json : ", json);

  //     if (json) {
  //       const wsresponse = json
  //       const wsmethod = wsresponse['payload']['method'];

  //       // this.wsRequestsList$.next(this.wsRequestsList);


  //       console.log("% WsRequestsService getWsRequests (Response from websocket) wsmethod: ", wsmethod);
  //       console.log("% WsRequestsService getWsRequests (Response from websocket) wsRequestsList: ", this.wsRequestsList);
  //       //hai array di richieste iniziali 


  //       wsresponse['payload']['message'].forEach(request => {

  //         this.addOrUpdateWsRequestsList(request);

  //       });

  //     }

  //   });
  // }





  // wsConnectOld() {
  //   console.log('%% HI WsRequestsService! - wsService ')
  //   this.messages = <Subject<Message>>this.wsService.connect(CHAT_URL).map(
  //     (response: MessageEvent): Message => {
  //       console.log('%% WsRequestsService response ', response)
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



