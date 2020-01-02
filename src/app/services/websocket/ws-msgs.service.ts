import { Injectable } from '@angular/core';
import { WebSocketJs } from "./websocket-js";
import { AuthService } from '../../core/auth.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../../environments/environment';
import { Subject } from 'rxjs/Subject';
import { WsMessage } from '../../models/ws-message-model';

@Injectable()

export class WsMsgsService {

  wsService: WebSocketJs;
  project_id: string;
  wsMsgsList: any;
  // CHAT_URL = environment.websocket.wsUrl;
  WS_IS_CONNECTED: number;

  public wsMsgsList$: BehaviorSubject<[]> = new BehaviorSubject<[]>([]);
  public wsMsgsGotAllData$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  // public _wsMsgsList = new Subject<any>();

  constructor(
    public auth: AuthService,
    public webSocketJs: WebSocketJs
  ) {

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
    // set the list of messages to empty before subscribing
    this.wsMsgsList = [];

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

    console.log('% »»» WebSocketJs WF ****** CALLING REF (ws-msgs service) ****** ');
    const path =  '/' + this.project_id + '/requests/' + request_id + '/messages'
    
    this.webSocketJs.ref(path,
      function (data, notification) {
        console.log("% »»» WebSocketJs WF *** - WsMsgsService MSGS CREATE ", data , ' path ', path);
        // console.log("% WsMsgsService notification", notification);

        // Check if upcoming messages already exist in the messasges list
        const msgFound = self.wsMsgsList.filter((obj: any) => {
          return obj._id === data._id;
        });

        if (msgFound.length === 0) {
          self.addWsMsg(data)
        }

      }, function (data, notification) {

        console.log("% »»» WebSocketJs - WsMsgsService MSGS UPDATE ", data);
        console.log("% WsMsgsService notification", notification);

        self.updateWsMsg(data)

      }, function (data, notification) {

        if (data) {
          console.log("% »»» WebSocketJs - WsMsgsService MSGS *** DATA *** ", data);
          self.wsMsgsGotAllData$.next(true);
        }

        // dismetti loading
      }

    );
    // this.messages.next(message);

    // console.log("% SUB »»»»»» subsToWS_ Msgs By RequestId new message from client to websocket: ", message);
  }


  addWsMsg(msg) {
    console.log("% WsMsgsService addWsMsgs wsMsgsList.length", this.wsMsgsList.length);

    this.wsMsgsList.push(msg);

    if (this.wsMsgsList) {
      this.wsMsgsList$.next(this.wsMsgsList);
      // this._wsMsgsList.next(this.wsMsgsList);
    }
  }

  updateWsMsg(msg) {
    for (let i = 0; i < this.wsMsgsList.length; i++) {

      if (msg._id === this.wsMsgsList[i]._id) {
        console.log("% WsRequestsService getWsRequests UPATE AN EXISTING REQUESTS - request._id : ", msg._id, ' wsMsgsList[i]._id: ', this.wsMsgsList[i]._id);
        /// UPATE AN EXISTING REQUESTS
        this.wsMsgsList[i] = msg

        if (this.wsMsgsList) {
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

    // ********** UNCOMMENT **********
    this.webSocketJs.unsubscribe('/' + this.project_id + '/requests/' + request_id + '/messages');


    // this.messages.next(message);

    // console.log("% SUB (UN) UN-subsToWS_ Msgs By RequestId new message from client to websocket: ", message);

  }



}
