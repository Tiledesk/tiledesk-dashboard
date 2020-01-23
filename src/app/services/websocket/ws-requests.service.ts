
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { Subject } from "rxjs/Subject";
// import { Subject } from "rxjs/Rx";
import { AuthService } from '../../core/auth.service';
import { WebSocketJs } from "./websocket-js";
import { environment } from '../../../environments/environment';
import { Request } from '../../models/request-model';
import { Http, Headers, RequestOptions } from '@angular/http';
// import * as Rx from "rxjs";


export interface Message {
  action: string;
  payload: {
    topic: string,
    method: string, message: any
  };
}


@Injectable()

export class WsRequestsService {

  http: Http;
  public messages: Subject<Message>;

  requesTtotal: number;
  public wsRequestsList$: BehaviorSubject<Request[]> = new BehaviorSubject<Request[]>([]);
  

  public wsRequest$ = new Subject()
  public wsRequestsListLength$ = new Subject()


  // public wsRequestsList$: BehaviorSubject<[]> = new BehaviorSubject<[]>([]);

  
  // public wsMyRequestsList$: BehaviorSubject<Request[]> = new BehaviorSubject<Request[]>([]);

  // public wsRequest$: BehaviorSubject<any> = new BehaviorSubject(null);
  // public wsRequest$:  AsyncSubject<any> = new AsyncSubject();
  

  // fwcUser: BehaviorSubject<FwcUser> = new BehaviorSubject<FwcUser>(null);
  // fwcUser$ = this.fwcUser.asObservable();

  // public wsRequestsListLength$: BehaviorSubject<number> = new BehaviorSubject(0)
  
  // _wsRequestsListLength$ = this.wsRequestsListLength$.asObservable()
  // public wsRequestsListLength$$: ReplaySubject<number> = new ReplaySubject(null);

  wsRequestsList: any
  wsAllRequestsList: any

  wsjsRequestsService: WebSocketJs;
  wsjsRequestByIdService: WebSocketJs;
  project_id: string;
  // CHAT_URL = environment.websocket.wsUrl;

  WS_IS_CONNECTED: number;
  currentUserID: string;

  BASE_URL = environment.mongoDbConfig.BASE_URL;
  TOKEN: string;
  /**
   * Constructor
   * 
   * @param {AuthService} auth 
   */
  constructor(
    http: Http,
    public auth: AuthService,
    public webSocketJs: WebSocketJs
  ) {
    this.http = http;
    console.log("% HI WsRequestsService wsjsRequestsService  ", this.wsjsRequestsService);

    console.log("% »»» WebSocketJs - WsRequestsService BASE URL", this.BASE_URL);
    // console.log("% HI WsRequestsService CHAT_URL ", CHAT_URL);
    //this.wsConnect(); !no more used

    // this.getWsRequestsById()


    // -----------------------------------------------------------------------------------------------------
    // REQUESTS - @ the publication of the 'current project' subscribes to the websocket requests
    // -----------------------------------------------------------------------------------------------------
    this.getCurrentProjectAndSubscribeTo_WsRequests()
    this.getLoggedUser();
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
  }

  getCurrentProjectAndSubscribeTo_WsRequests() {
    var self = this;
    self.wsRequestsList = [];
    self.wsAllRequestsList = [];
    this.auth.project_bs.subscribe((project) => {

      // console.log('%% WsRequestsService PROJECT ', project)
      // console.log('% »»» WebSocketJs WF ****** WsRequestsService PROJECT._ID 1', project)
      /**
       * Unsubscribe to websocket requests with the old project id  
       */
      if (this.project_id) {
        // console.log('%% WsRequestsService THIS.PROJECT_ID ', this.project_id)
        //this.unsubsToWS_Requests(this.project_id);

        this.webSocketJs.unsubscribe('/' + this.project_id + '/requests');
        this.resetWsRequestList();
      }


      if (project) {
        // console.log('% »»» WebSocketJs WF ****** WsRequestsService PROJECT._ID 2', project._id)


        this.project_id = project._id;

        // this.subsToWS_Requests(this.project_id)
        // this.webSocketJs.subscribe('/' + this.project_id + '/requests');

        // console.log('% »»» WebSocketJs WF ****** WS-REQUESTS-SERVICE - WS_IS_CONNECTED ****** ', this.WS_IS_CONNECTED );

        // if (this.WS_IS_CONNECTED === 1) {
        this.webSocketJs.ref('/' + this.project_id + '/requests',

          function (data, notification) {

            // console.log("% »»» WebSocketJs - WsRequestsService REQUESTS CREATE", data);

            const hasFound = self.wsRequestsList.filter((obj: any) => {
              if (data && obj) {
                return obj._id === data._id;
              }
            });

            if (hasFound.length === 0) {

              // self.addWsRequests(data);

              self.addWsRequests(data)
              console.log("% »»» WebSocketJs WF - WsRequestsService Not Found - <<<<<<<<<<<<<<< add request >>>>>>>>>>>>>>>", data);

            } else {
              // console.log("% »»» WebSocketJs WF - WsRequestsService hasFound - not added", hasFound);
            }

          }, function (data, notification) {

            console.log("% »»» WebSocketJs WF - WsRequestsService REQUESTS UPDATE", data);
            // this.wsRequestsList.push(data);

            // self.addOrUpdateWsRequestsList(data);
            self.updateWsRequests(data)


          }, function (data, notification) {

            console.log("% »»» WebSocketJs WF - WsRequestsService REQUESTS *** notification *** ", notification);
            console.log("% »»» WebSocketJs WF - WsRequestsService  >>>>>>> REQUESTS LENGTH BEFORE TO PUBLISH <<<<<<< ", data.length);
            // && data.length !== undefined

            // setTimeout(() => {
            //   // behaviorSubject.next('Angular 8');
            //   // replaySubject.next('Angular 8');
            //   self.wsRequestsListLength$$.next(data.length);
            // }, 1000);

            // && data.length > 0
            // setTimeout(() => { 
            if (data) {

              console.log("% »»» WebSocketJs WF - onData (ws-requests.serv) ≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥ data is ARRAY", Array.isArray(data));
              // data.map works only with array
              if (Array.isArray(data)) {
                
                // https://stackoverflow.com/questions/18983138/callback-after-all-asynchronous-foreach-callbacks-are-completed
                let requests = data.map((item) => {
                  return new Promise((resolve) => {
                    self.asyncFunction(item, resolve);
                  });
                })
                Promise.all(requests).then(() => {

                  console.log('% »»» WebSocketJs WF - onData (ws-requests.serv) ≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥ done -> data.length ', data.length)
                  self.wsRequestsListLength$.next(data.length);
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
      }
    });
  }

  asyncFunction(item, cb) {
    setTimeout(() => {
      // console.log('≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥ done with', item);
      cb();
    }, 100);
  }
  // _getRequestsTotalCount(requestsLenght) {
  //   if (requestsLenght != null) {
  //     return Observable.of(requestsLenght);
  //   }
  // }

  // public getTotalRequestLength(): Promise<number> {
  //   return new Promise<number>((resolve, reject) => {

  //     resolve(this.requesTtotal);
  //   });
  // }

  hasmeInAgents(agents) {
    let found = false
    for (let j = 0; j < agents.length; j++) {
      console.log("% »»» WebSocketJs - WsRequestsService AGENT ", agents[j]);
      console.log("% »»» WebSocketJs - WsRequestsService currentUserID 2 ", this.currentUserID);
      console.log("% »»» WebSocketJs - WsRequestsService id_user ", agents[j].id_user);

      if (this.currentUserID === agents[j].id_user) {
        found = true
        console.log("% »»» WebSocketJs - WsRequestsService HERE-YES ", found);

      }

      return found
    }

  }

  /**
   * REQUESTS publish @ the CREATE
   * 
   * @param request 
   */
  addWsRequests(request: Request) {
    // console.log("% WsRequestsService addWsRequest wsRequestsList.length", this.wsRequestsList.length);
    // console.log("% »»» WebSocketJs WF - WsRequestsService addWsRequest request ", request);



    // SOLO RICHIESTE IN CUI IL CURRENT USER E' NEL NESTED ARRAY AGENTS DELLA RICHIESTA
    // && this.hasmeInAgents(request.agents) === true
    if (request !== null && request !== undefined) {
      this.wsRequestsList.push(request);
    }



    if (this.wsRequestsList) {

      // -----------------------------------------------------------------------------------------------------
      // publish all REQUESTS 
      // -----------------------------------------------------------------------------------------------------
      this.wsRequestsList$.next(this.wsRequestsList);

      // imInAgentsRequests = this.wsRequestsList.filter(this.hasmeInAgents(request.agents));
      // let myRequests = [];
      // this.wsRequestsList.forEach(request => {
      //   console.log("% »»» WebSocketJs - WsRequestsService request ", request);

      //   if (request !== null && request !== undefined && this.hasmeInAgents(request.agents) === true) {
      //     myRequests.push(request);
      //   }
      // });

      // this.wsMyRequestsList$.next(myRequests); 
      // console.log("% »»» WebSocketJs - WsRequestsService only MY Requests ", myRequests);
      console.log("% »»» WebSocketJs - WsRequestsService ALL Requests ", this.wsRequestsList.length);


      // request.agents.forEach(agent => {
      //   console.log("% »»» WebSocketJs - WsRequestsService AGENTS ", agent);
      //   // if (current_user_id === agent.id_user) {
      //   //   // console.log('AGENT - ID USER MATCH', agent.id_user)

      //   //   found = true

      //   if (agent.id_user === this.currentUserID) {
      //     imInAgentsRequests.push(request)

      //   }

      // })

      // const iAreAgent = this.hasmeInAgents(request.agents);
      // console.log("% »»» WebSocketJs - WsRequestsService AGENT iAreAgent ", iAreAgent);



      // const requests_agents = request.agents
      // for (let j = 0; j < requests_agents.length; j++) {
      //   console.log("% »»» WebSocketJs - WsRequestsService AGENT ", requests_agents[j]);
      //   console.log("% »»» WebSocketJs - WsRequestsService currentUserID 2 ", this.currentUserID);
      //   console.log("% »»» WebSocketJs - WsRequestsService id_user ", requests_agents[j].id_user);
      //   if (this.currentUserID === requests_agents[j].id_user) {
      //     console.log("% »»» WebSocketJs - WsRequestsService HERE-YES ", requests_agents[j].id_user);
      //     imInAgentsRequests.push(request)
      //   }
      // }

      // });


      // imInAgentsRequests = this.wsRequestsList.filter((obj: any) => {
      //   console.log("% »»» WebSocketJs - WsRequestsService obj ", obj);

      //   obj.agents.forEach(agent => {

      //     return agent.id_user === this.currentUserID;
      //   });
      // });

      // console.log("% »»» WebSocketJs - WsRequestsService request.hasAgent ", request.hasAgent(this.currentUserID));

      // console.log("% »»» WebSocketJs - WsRequestsService REQUEST LIST ", imInAgentsRequests);
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
    for (let i = 0; i < this.wsRequestsList.length; i++) {

      if (request._id === this.wsRequestsList[i]._id) {
        console.log("% WsRequestsService getWsRequests UPATE AN EXISTING REQUESTS - request._id : ", request._id, ' wsRequestsList[i]._id: ', this.wsRequestsList[i]._id);


        if (request.status !== 1000) {

          /// UPATE AN EXISTING REQUESTS
          this.wsRequestsList[i] = request
          console.log("% WsRequestsService getWsRequests UPATE request (status !== 1000): ", request);

          // if (this.wsRequestsList) {
          //   // this.wsRequestsList$.next(request);
          //   this.wsRequestsList$.next(this.wsRequestsList);
          // }

        } else if (request.status === 1000) {

          console.log("% WsRequestsService getWsRequests UPATE request (status === 1000): ", request);
          // delete this.wsRequestsList[i]
          this.wsRequestsList.splice(i, 1);

        }

        if (this.wsRequestsList) {
          this.wsRequestsList$.next(this.wsRequestsList);
          console.log("% WsRequestsService getWsRequests UPATED REQUESTS LIST: ", this.wsRequestsList);


          // let myRequests = [];
          // this.wsRequestsList.forEach(request => {
          //   console.log("% »»» WebSocketJs - WsRequestsService request ", request);
          //            if (request !== null && request !== undefined && this.hasmeInAgents(request.agents) === true) {
          //     myRequests.push(request);
          //   }
          // });
          // this.wsMyRequestsList$.next(myRequests); 


        }
      }
    }
  }



  // -----------------------------------------------------------------------------------------------------
  // methods for REQUEST BY ID  
  // -----------------------------------------------------------------------------------------------------

  /**
   * 
   * REQUEST BY ID publish @ the CREATE
   * 
   * @param request 
   */
  addWsRequest(request) {
    this.wsRequest$.next(request);

  }

  /**
   * 
   * REQUEST BY ID publish @ the UPDATE
   * 
   * @param request 
   */
  updateWsRequest(request) {

    this.wsRequest$.next(request);
  }

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
    this.webSocketJs.ref('/' + this.project_id + '/requests/' + id_request,

      function (data, notification) {

        console.log("% »»» WebSocketJs WF - WsMsgsService REQUEST-BY-ID CREATE ", data);
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

        console.log("% »»» WebSocketJs WF - WsMsgsService REQUEST-BY-ID UPDATE ", data);
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
    // console.log("% SUB (UN) »»»»»»» UN-subsToWS RequestById from client to websocket: ", message);

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
    const url = this.BASE_URL + this.project_id + '/requests/' + group_id + '/close';

    console.log('% »»» WebSocketJs WF - NEW CLOSE SUPPORT GROUP URL ', url);
    return this.http
      .put(url, body, options)
    // commented because the service not return nothing and if try to map the json obtain the error:
    // ERROR  SyntaxError: Unexpected end of JSON
    // .map((res) => res.json());
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



