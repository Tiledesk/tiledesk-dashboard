
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from "rxjs/Rx";
import { AuthService } from '../../core/auth.service';
import { WebSocketJs } from "./websocketjs";
import { environment } from '../../../environments/environment';
// const CHAT_URL = "ws://echo.websocket.org/";

// const CHAT_URL = "ws://tiledesk-server-pre.herokuapp.com?token=JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJlbWFpbHZlcmlmaWVkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YWM3NTIxNzg3ZjZiNTAwMTRlMGI1OTIiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJlbWFpbHZlcmlmaWVkIjoiaW5pdCIsImxhc3RuYW1lIjoiaW5pdCIsImZpcnN0bmFtZSI6ImluaXQiLCJfaWQiOiJpbml0In0sInN0YXRlcyI6eyJpZ25vcmUiOnt9LCJkZWZhdWx0Ijp7fSwiaW5pdCI6eyJlbWFpbHZlcmlmaWVkIjp0cnVlLCJsYXN0bmFtZSI6dHJ1ZSwiZmlyc3RuYW1lIjp0cnVlLCJwYXNzd29yZCI6dHJ1ZSwiZW1haWwiOnRydWUsIl9pZCI6dHJ1ZX0sIm1vZGlmeSI6e30sInJlcXVpcmUiOnt9fSwic3RhdGVOYW1lcyI6WyJyZXF1aXJlIiwibW9kaWZ5IiwiaW5pdCIsImRlZmF1bHQiLCJpZ25vcmUiXX0sInBhdGhzVG9TY29wZXMiOnt9LCJlbWl0dGVyIjp7Il9ldmVudHMiOnt9LCJfZXZlbnRzQ291bnQiOjAsIl9tYXhMaXN0ZW5lcnMiOjB9LCIkb3B0aW9ucyI6dHJ1ZX0sImlzTmV3IjpmYWxzZSwiX2RvYyI6eyJlbWFpbHZlcmlmaWVkIjp0cnVlLCJsYXN0bmFtZSI6IkxhbnppbG90dG8iLCJmaXJzdG5hbWUiOiJOaWNvIiwicGFzc3dvcmQiOiIkMmEkMTAkTlBoSk5VNVZDYlU2d05idG1Jck5lT3MxR0dBSW5rMERMeGVYWXN2dklHZ1JnY1dMWW1kYkciLCJlbWFpbCI6Im5pY29sYS5sYW56aWxvdHRvQGZyb250aWVyZTIxLml0IiwiX2lkIjoiNWFjNzUyMTc4N2Y2YjUwMDE0ZTBiNTkyIn0sIiRpbml0Ijp0cnVlLCJpYXQiOjE1NzQwODU4MTMsImF1ZCI6Imh0dHBzOi8vdGlsZWRlc2suY29tIiwiaXNzIjoiaHR0cHM6Ly90aWxlZGVzay5jb20iLCJzdWIiOiJ1c2VyIn0.GQpPEULk0OUyH6zqAmf2fz30MgtfJiI-WUfw8i-EtCY";
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
  CHAT_URL = environment.websocket.wsUrl;



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




    this.getCurrentUserAndConnectToWs();
  }

  getCurrentUserAndConnectToWs() {
    this.auth.user_bs.subscribe((user) => {
      console.log('% WsRequestsService - LoggedUser ', user);


      if (user && user.token) {

        this.CHAT_URL = 'ws://tiledesk-server-pre.herokuapp.com?token=' + user.token



        // -----------------------------------------------------------------------------------------------------
        // REQUESTS - Create websocket connection and listen @ websocket requests
        // -----------------------------------------------------------------------------------------------------
        
        // ***** UNCOMMENT *****
        // this.initWsjsRequestsService();

      }
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // methods for REQUESTS 
  // -----------------------------------------------------------------------------------------------------

  /**
   * Create websocket connection and listen @ websocket requests
   */
  initWsjsRequestsService() {
    const self = this;
    self.wsRequestsList = []
    console.log("% NEW WS - REQUESTS");


    //init(url, onCreate, onUpdate, onOpen=undefined, onOpenCallback=undefined) {
    this.webSocketJs.init(
      this.CHAT_URL,
      undefined,
      undefined,
      function () {
        self.getCurrentProjectAndSubscribeTo_WsRequests();
      }
    );

  }


  /**
   * REQUESTS publish @ the CREATE
   * 
   * @param request 
   */
  addWsRequests(request: any) {
    // console.log("% WsRequestsService addWsRequest wsRequestsList.length", this.wsRequestsList.length);
    // console.log("% WsRequestsService addWsRequest request._id", request._id);
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


  getCurrentProjectAndSubscribeTo_WsRequests() {
    var self = this;
    this.auth.project_bs.subscribe((project) => {
      // console.log('%% WsRequestsService PROJECT ', project)

      if (project) {
        console.log('%% WsRequestsService PROJECT._ID ', project._id)
        /**
         * Unsubscribe to websocket requests with the old project id  
         */
        if (this.project_id) {
          console.log('%% WsRequestsService THIS.PROJECT_ID ', this.project_id)
          //this.unsubsToWS_Requests(this.project_id);


          // !!!!!!!! 
          // this.webSocketJs.unsubscribe('/' + this.project_id + '/requests');

        }

        this.project_id = project._id;

        // this.subsToWS_Requests(this.project_id)
        // this.webSocketJs.subscribe('/' + this.project_id + '/requests');

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
          });
      }
    });
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

        console.log("% »»» WebSocketJs - WsMsgsService REQUEST-BY-ID CREATE ", data);
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

        console.log("% »»» WebSocketJs - WsMsgsService REQUEST-BY-ID UPDATE ", data);
        self.updateWsRequest(data)
        // this.wsRequestsList.push(data);

        // self.addOrUpdateWsRequestsList(data);
        // self.updateWsRequest(data)
      }

    );
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



