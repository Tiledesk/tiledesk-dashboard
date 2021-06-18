import { Injectable } from '@angular/core';
import { WebSocketJs } from "./websocket-js";
import { AuthService } from '../../core/auth.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { WsMessage } from '../../models/ws-message-model';

@Injectable()

export class WsMsgsService {

  wsService: WebSocketJs;
  project_id: string;
  wsMsgsList: any;
  WS_IS_CONNECTED: number;

  public wsMsgsList$: BehaviorSubject<[]> = new BehaviorSubject<[]>([]);
  public wsMsgsGotAllData$: BehaviorSubject<any> = new BehaviorSubject(null);

  // public _wsMsgsList = new Subject<any>();

  constructor(
    public auth: AuthService,
    public webSocketJs: WebSocketJs
  ) {

    console.log('WS SERV - HELLO CONSTRUCTOR !!!!!!')
    this.wsMsgsList = [];
    this.getCurrentProject();

    // this.getCurrentUserAndConnectToWs();

  }

  // async websocketIsReady(websocketReadyState: number) {
  //   console.log('% »»» WebSocketJs WF - WS-MESSAGES-SERVICE - websocketIsReady ', websocketReadyState);

  //   this.WS_IS_CONNECTED = await websocketReadyState
  //   if (websocketReadyState === 1) {

  //     // this.WS_IS_CONNECTED = true;
  //   } else {
  //     // this.WS_IS_CONNECTED = false;
  //   }
  // }



  // getCurrentUserAndConnectToWs() {
  //   this.auth.user_bs.subscribe((user) => {
  //     console.log('% WsRequestsService - LoggedUser ', user);

  //     if (user && user.token) {

  //       this.CHAT_URL = 'ws://tiledesk-server-pre.herokuapp.com?token=' + user.token

  //       // -----------------------------------------------------------------------------------------------------
  //       // MESSAGES - Create websocket connection and listen @ websocket messages
  //       // -----------------------------------------------------------------------------------------------------
  //       // this.initWsjsMessagesService();

  //     }
  //   });
  // }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      console.log('!!! WsMsgsService project ', project)
      // // tslint:disable-next-line:no-debugger
      // debugger
      if (project) {

        this.project_id = project._id
        // set the list of messages to empty before subscribing

      }

    });
  }


  // -----------------------------------------------------------------------------------------------------
  // methods for Request's Messages 
  // -----------------------------------------------------------------------------------------------------
  /**
   * 
   * Subscribe to websocket messages by request id service 
   * called when in WsRequestsMsgsComponent onInit() is got the request id from url params
   * 
   * @param request_id 
   */
  subsToWS_MsgsByRequestId(request_id) {
    var self = this;


    console.log("% »»» WebSocketJs WF >>> ws-msgs--- m-service - subs To WS Msgs - wsMsgsList init ", this.wsMsgsList);
    // var message = {
    //   action: 'subscribe',
    //   payload: {

    //     topic: '/' + this.project_id + '/requests/' + request_id + '/messages',
    //     message: undefined,
    //     method: undefined
    //   },
    // };
    // var str = JSON.stringify(message);
    // console.log("%% str " + str);

    // this.wsService.send(str);

    // console.log('% »»» WebSocketJs WF - WS-MESSAGES-SERVICE - this.WS_IS_CONNECTED  ', this.WS_IS_CONNECTED );

    // console.log('% »»» WebSocketJs WF >>> ws-msgs--- m-service - SUBSCR To WS MSGS ****** CALLING REF ****** ');
    const path = '/' + this.project_id + '/requests/' + request_id + '/messages'

    this.webSocketJs.ref(path, 'subsToWS_MsgsByRequestId',
      function (data, notification) {
        // console.log("% »»» WebSocketJs WF >>> ws-msgs--- m-service - SUBSCR To WS MSGS - CREATE - data ", data, ' path ', path);
        // console.log("% WsMsgsService notification", notification);

        // Check if upcoming messages already exist in the messasges list
        // console.log("MSGS SRV - ADD WS Msgs - CHEK IF ADD MSD data ",  data);
        // const msgFound = self.wsMsgsList.filter((obj: any) => {
        //   console.log("MSGS SRV - ADD WS Msgs - CHEK IF ADD MSD obj._id ", obj._id , ' data._id ', data._id);

        //   return obj._id === data._id;
        // });
        console.log("MSGS SRV - ADD WS Msgs - CHEK IF ADD MSG INCOMING data ", data);
        console.log("MSGS SRV - ADD WS Msgs - CHEK IF ADD MSG INCOMING data wsMsgsList ", self.wsMsgsList);
        const index = self.wsMsgsList.findIndex((msg) => msg._id === data._id);
        // if (msgFound.length === 0) {
        if (index === -1) {
          self.addWsMsg(data)
        } else {
          // console.log("% »»» WebSocketJs WF >>> ws-msgs--- m-service - SUBSCR To WS MSGS - HAS FOUND - NOT ADD");
        }

      }, function (data, notification) {

        // console.log("% »»» WebSocketJs WF >>> ws-msgs--- m-service - SUBSCR To WS MSGS - UPDATE - data ", data);
        // console.log("% WsMsgsService notification", notification);

        self.updateWsMsg(data)

      }, function (data, notification) {

        if (data) {
          // console.log("% »»» WebSocketJs WF >>> ws-msgs--- m-service - SUBSCR To WS MSGS - ON-DATA - data", data);
          self.wsMsgsGotAllData$.next(data);
        }
      }
    );
  }



  // htmlEntities(str) {
  //   return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g, '<br>');
  // }

  addWsMsg(msg) {
    console.log("MSGS SRV - ADD WS Msgs - HERE YES");
    console.log("% WsMsgsService addWsMsgs wsMsgsList.length", this.wsMsgsList.length);
    console.log("MSGS SRV - ADD WS Msgs - CHEK IF ADD MSD data ", this.wsMsgsList);
    console.log("MSGS SRV - ADD WS Msgs - msg ", msg);
    // msg['TEXT'] = this.linkify(msg.text)
    // msg.text = this.htmlEntities(msg.text)
    this.wsMsgsList.push(msg);




    if (this.wsMsgsList) {
      console.log("MSGS SRV - ADD WS Msgs - HERE YES 2");
      // console.log("% »»» WebSocketJs WF >>> ws-msgs--- m-service - ADD WS Msgs - wsMsgsList before publish ", this.wsMsgsList);
      this.wsMsgsList$.next(this.wsMsgsList);
      // this._wsMsgsList.next(this.wsMsgsList);
    }
  }

  updateWsMsg(msg) {
    console.log("MSGS SRV - UPDATED WS Msgs - msg ", msg);
    for (let i = 0; i < this.wsMsgsList.length; i++) {

      if (msg._id === this.wsMsgsList[i]._id) {
        // console.log("% »»» WebSocketJs WF >>> ws-msgs--- m-service - UPDATE WS Msgs - EXISTING REQUESTS - request._id : ", msg._id, ' wsMsgsList[i]._id: ', this.wsMsgsList[i]._id);
        /// UPATE AN EXISTING REQUESTS
        this.wsMsgsList[i] = msg

        if (this.wsMsgsList) {
          console.log("MSGS SRV - ADD WS Msgs - HERE YES 3");
          this.wsMsgsList$.next(msg);
        }
      }
    }
  }

  /**
   * 
   * Unsubscribe to websocket messages by request id service 
   * called when in WsRequestsMsgsComponent onInit() is got the request id from url params
   * 
   * @param request_id 
   */
  unsubsToWS_MsgsByRequestId(request_id) {

    console.log('WS SERV - HAS BEEN CALLED UNSUBSCRIBE TO MSGS BY REQUEST ID')

    this.wsMsgsList = [];


    // var message = {
    //   action: 'unsubscribe',
    //   payload: {

    //     topic: '/' + this.project_id + '/requests/' + request_id + '/messages',
    //     message: undefined,
    //     method: undefined
    //   },
    // };
    // var str = JSON.stringify(message);
    // console.log("%% str " + str);

    // this.wsService.send(str);


    this.webSocketJs.unsubscribe('/' + this.project_id + '/requests/' + request_id + '/messages');
    // console.log("% »»» WebSocketJs WF >>> ws-msgs--- m-service - UN-SUBS MSGS FROM WS »»»»»»» request_id ", request_id, ' project_id ', this.project_id);

  }



}
