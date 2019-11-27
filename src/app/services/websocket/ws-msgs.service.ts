import { Injectable } from '@angular/core';
import { WebSocketJs } from "./websocket-js";
import { AuthService } from '../../core/auth.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../../environments/environment';
import { Subject } from 'rxjs/Subject';
import { WsMessage } from '../../models/ws-message-model';

// const CHAT_URL = "ws://tiledesk-server-pre.herokuapp.com?token=JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJlbWFpbHZlcmlmaWVkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YWM3NTIxNzg3ZjZiNTAwMTRlMGI1OTIiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJlbWFpbHZlcmlmaWVkIjoiaW5pdCIsImxhc3RuYW1lIjoiaW5pdCIsImZpcnN0bmFtZSI6ImluaXQiLCJfaWQiOiJpbml0In0sInN0YXRlcyI6eyJpZ25vcmUiOnt9LCJkZWZhdWx0Ijp7fSwiaW5pdCI6eyJlbWFpbHZlcmlmaWVkIjp0cnVlLCJsYXN0bmFtZSI6dHJ1ZSwiZmlyc3RuYW1lIjp0cnVlLCJwYXNzd29yZCI6dHJ1ZSwiZW1haWwiOnRydWUsIl9pZCI6dHJ1ZX0sIm1vZGlmeSI6e30sInJlcXVpcmUiOnt9fSwic3RhdGVOYW1lcyI6WyJyZXF1aXJlIiwibW9kaWZ5IiwiaW5pdCIsImRlZmF1bHQiLCJpZ25vcmUiXX0sInBhdGhzVG9TY29wZXMiOnt9LCJlbWl0dGVyIjp7Il9ldmVudHMiOnt9LCJfZXZlbnRzQ291bnQiOjAsIl9tYXhMaXN0ZW5lcnMiOjB9LCIkb3B0aW9ucyI6dHJ1ZX0sImlzTmV3IjpmYWxzZSwiX2RvYyI6eyJlbWFpbHZlcmlmaWVkIjp0cnVlLCJsYXN0bmFtZSI6IkxhbnppbG90dG8iLCJmaXJzdG5hbWUiOiJOaWNvIiwicGFzc3dvcmQiOiIkMmEkMTAkTlBoSk5VNVZDYlU2d05idG1Jck5lT3MxR0dBSW5rMERMeGVYWXN2dklHZ1JnY1dMWW1kYkciLCJlbWFpbCI6Im5pY29sYS5sYW56aWxvdHRvQGZyb250aWVyZTIxLml0IiwiX2lkIjoiNWFjNzUyMTc4N2Y2YjUwMDE0ZTBiNTkyIn0sIiRpbml0Ijp0cnVlLCJpYXQiOjE1NzQwODU4MTMsImF1ZCI6Imh0dHBzOi8vdGlsZWRlc2suY29tIiwiaXNzIjoiaHR0cHM6Ly90aWxlZGVzay5jb20iLCJzdWIiOiJ1c2VyIn0.GQpPEULk0OUyH6zqAmf2fz30MgtfJiI-WUfw8i-EtCY";
@Injectable()

export class WsMsgsService {

  wsService: WebSocketJs;
  project_id: string;
  wsMsgsList: any;
  // CHAT_URL = environment.websocket.wsUrl;
  WS_IS_CONNECTED: number;

  public wsMsgsList$: BehaviorSubject<[]> = new BehaviorSubject<[]>([]);

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

    console.log('% »»» WebSocketJs WF - WS-MESSAGES-SERVICE - this.WS_IS_CONNECTED  ', this.WS_IS_CONNECTED );
    this.webSocketJs.ref('/' + this.project_id + '/requests/' + request_id + '/messages',

      function (data, notification) {

        // console.log("% »»» WebSocketJs - WsMsgsService MSGS CREATE ", data);
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
        // dismetti loading
      });
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
