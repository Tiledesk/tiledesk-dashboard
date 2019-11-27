
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from "rxjs/Rx";
import { AuthService } from '../../core/auth.service';
import { WebSocketJs } from "./websocket-js";
import { environment } from '../../../environments/environment';


export interface Message {
  action: string;
  payload: {
    topic: string,
    method: string, message: any
  };
}


@Injectable()

export class WsRequestsService {
  public messages: Subject<Message>;
  public wsRequestsList$: BehaviorSubject<[]> = new BehaviorSubject<[]>([]);
  public wsRequest$: BehaviorSubject<any> = new BehaviorSubject(null);

  wsRequestsList: any
  wsjsRequestsService: WebSocketJs;
  wsjsRequestByIdService: WebSocketJs;
  project_id: string;
  // CHAT_URL = environment.websocket.wsUrl;

  WS_IS_CONNECTED: number;

  /**
   * Constructor
   * 
   * @param {AuthService} auth 
   */
  constructor(
    public auth: AuthService,
    public webSocketJs: WebSocketJs
  ) {

    console.log("% HI WsRequestsService wsjsRequestsService  ", this.wsjsRequestsService);
    // console.log("% HI WsRequestsService CHAT_URL ", CHAT_URL);
    //this.wsConnect(); !no more used

    // this.getWsRequestsById()


    // -----------------------------------------------------------------------------------------------------
    // REQUESTS - @ the publication of the 'current project' subscribes to the websocket requests
    // -----------------------------------------------------------------------------------------------------
 
    
    // this.getCurrentProjectAndSubscribeTo_WsRequests()


  }

 
  // -----------------------------------------------------------------------------------------------------
  // methods for REQUESTS 
  // -----------------------------------------------------------------------------------------------------

 
  resetWsRequestList() {
    this.wsRequestsList = [];
    this.wsRequestsList$.next(this.wsRequestsList);
  }

  getCurrentProjectAndSubscribeTo_WsRequests() {
    var self = this;
    self.wsRequestsList = [];
    this.auth.project_bs.subscribe((project) => {
      // console.log('%% WsRequestsService PROJECT ', project)

      if (project) {
        console.log('% »»» WebSocketJs WF ****** WsRequestsService PROJECT._ID ', project._id)
        /**
         * Unsubscribe to websocket requests with the old project id  
         */
        if (this.project_id) {
          console.log('%% WsRequestsService THIS.PROJECT_ID ', this.project_id)
          //this.unsubsToWS_Requests(this.project_id);

          this.webSocketJs.unsubscribe('/' + this.project_id + '/requests');
          this.resetWsRequestList();
        }

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
                self.addWsRequests(data)
              } else {
                console.log("%%%  WsRequestsService hasFound - not add", hasFound);
              }

            }, function (data, notification) {

              console.log("% »»» WebSocketJs - WsRequestsService REQUESTS UPDATE", data);
              // this.wsRequestsList.push(data);

              // self.addOrUpdateWsRequestsList(data);
              self.updateWsRequests(data)
            }, function (data, notification) {
              // dismetti loading
            });
        // }
      }
    });
  }


  /**
   * REQUESTS publish @ the CREATE
   * 
   * @param request 
   */
  addWsRequests(request: any) {
    // console.log("% WsRequestsService addWsRequest wsRequestsList.length", this.wsRequestsList.length);
    // console.log("% »»» WebSocketJs WF - WsRequestsService addWsRequest request ", request);
    if (request !== null) {
      this.wsRequestsList.push(request);
    }

    if (this.wsRequestsList) {
      this.wsRequestsList$.next(this.wsRequestsList);
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
          console.log("% WsRequestsService getWsRequests UPATE REQUESTS LIST: ", this.wsRequestsList);
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
      });
    // console.log("% SUB »»»»»»» subsToWS RequestById from client to websocket: ", message);

  }


  /**
  * 
  * REQUEST BY ID - Subscribe to websocket request by id service 
  * called when in WsRequestsMsgsComponent onInit() is got the request id from url params
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



