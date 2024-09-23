import { Injectable } from '@angular/core';
import { WebSocketJs } from "./websocket-js";
import { AuthService } from '../../core/auth.service';
import { BehaviorSubject } from 'rxjs';
import { Subject } from 'rxjs';
import { WsMessage } from '../../models/ws-message-model';
import { LoggerService } from '../../services/logger/logger.service';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfigService } from '../app-config.service';
@Injectable()

export class WsMsgsService {

  wsService: WebSocketJs;
  project_id: string;
  wsMsgsList: any;
  WS_IS_CONNECTED: number;
  TOKEN: string
  public wsMsgsList$: BehaviorSubject<Array<[any]>> = new BehaviorSubject<Array<[any]>>([]);
  public wsMsgsGotAllData$: BehaviorSubject<any> = new BehaviorSubject(null);

  SERVER_BASE_PATH: string;
  // public _wsMsgsList = new Subject<any>();
  CURRENT_USER_ID: string;

  constructor(

    public auth: AuthService,
    public webSocketJs: WebSocketJs,
    private logger: LoggerService,
    public appConfigService: AppConfigService,
    private _httpClient: HttpClient
  ) {
    this.wsMsgsList = [];
    this.logger.log('[WS-MSGS-SERV] - HELLO !!! wsMsgsList ', this.wsMsgsList)
    this.getCurrentProject();
    this.getUserTokenAndUserId();
    this.getAppConfig();
  }

  getAppConfig() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    // this.logger.log('[WS-MSGS-SERV] getAppConfig SERVER_BASE_PATH', this.SERVER_BASE_PATH);
  }

  getUserTokenAndUserId() {
    this.auth.user_bs.subscribe((user) => {
      if (user) {
        this.TOKEN = user.token;
        this.CURRENT_USER_ID = user._id
        // this.logger.log('[WS-MSGS-SERV] TOKEN ',   this.TOKEN)
      }
    });
  }


  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.logger.log('[WS-MSGS-SERV] - project ', project)
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

    this.logger.log("[WS-MSGS-SERV] - SUBSCRIBE TO MSGS BY REQUESTS ID request_id", request_id);
    this.logger.log("[WS-MSGS-SERV] - SUBSCRIBE TO MSGS BY REQUESTS ID wsMsgsList", this.wsMsgsList);

    const path = '/' + this.project_id + '/requests/' + request_id + '/messages'

    this.logger.log("[WS-MSGS-SERV] - SUBSCRIBE TO MSGS BY REQUESTS ID path", path);
    this.webSocketJs.ref(path, 'subsToWS_MsgsByRequestId',
      function (data, notification) {
        self.logger.log("[WS-MSGS-SERV] - SUBSCRIBE TO MSGS BY REQUESTS ID - CREATE data", data);


        // --------------------------------------------------------------------------
        // Check if upcoming messages already exist in the messasges list (1° METHOD)
        // --------------------------------------------------------------------------

        // this.logger.log("[WS-MSGS-SERV]- ADD WS Msgs - CHEK IF ADD MSD data ",  data);
        // const msgFound = self.wsMsgsList.filter((obj: any) => {
        //   this.logger.log("[WS-MSGS-SERV]- ADD WS Msgs - CHEK IF ADD MSD obj._id ", obj._id , ' data._id ', data._id);

        //   return obj._id === data._id;
        // });
        // this.logger.log("[WS-MSGS-SERV] - ADD WS Msgs - CHEK IF ADD MSG INCOMING data ", data);
        // this.logger.log("[WS-MSGS-SERV] - ADD WS Msgs - CHEK IF ADD MSG INCOMING data wsMsgsList ", self.wsMsgsList);

        // --------------------------------------------------------------------------
        // Check if upcoming messages already exist in the messasges list (2nd METHOD)
        // --------------------------------------------------------------------------
        const index = self.wsMsgsList.findIndex((msg) => msg._id === data._id);
        // if (msgFound.length === 0) {
        if (index === -1) {
          self.addWsMsg(data)
        } else {
          // self.logger.log("[WS-MSGS-SERV] - SUBSCRIBE TO MSGS BY REQUESTS ID - MSG ALREADY EXIST - NOT ADD");
        }

      }, function (data, notification) {
        self.logger.log("[WS-MSGS-SERV] - SUBSCRIBE TO MSGS BY REQUESTS ID - UPDATE data", data);

        self.updateWsMsg(data)

      }, function (data, notification) {

        if (data) {
          self.logger.log("[WS-MSGS-SERV] - SUBSCRIBE TO MSGS BY REQUESTS ID - ON-DATA - data", data);
          self.wsMsgsGotAllData$.next(data);
        }
      }
    );
  }


  addWsMsg(msg) {
    this.logger.log("[WS-MSGS-SERV] - ADD MSG - MSG", msg);
    this.wsMsgsList.push(msg);
    if (this.wsMsgsList) {
      this.wsMsgsList$.next(this.wsMsgsList);
    }
  }

  updateWsMsg(msg) {
    this.logger.log("[WS-MSGS-SERV] - UPDATED MSG - MSG", msg);
    for (let i = 0; i < this.wsMsgsList.length; i++) {

      if (msg._id === this.wsMsgsList[i]._id) {

        // -----------------------------
        // UPATE AN EXISTING MSG
        // -----------------------------
        this.wsMsgsList[i] = msg

        if (this.wsMsgsList) {
          this.wsMsgsList$.next(msg);
        }
      }
    }
  }

  /** 
   * Unsubscribe to websocket messages by request id service 
   * called when in WsRequestsMsgsComponent onInit() is got the request id from url params
   * 
   * @param request_id 
   */
  unsubsToWS_MsgsByRequestId(request_id) {
    this.logger.log("[WS-MSGS-SERV] - UNSUBSCRIBE TO MSGS BY REQUEST ID - request_id ", request_id);
    this.wsMsgsList = [];
    this.webSocketJs.unsubscribe('/' + this.project_id + '/requests/' + request_id + '/messages');

  }



  public sendChatMessage(projectid: string, convid: string, chatmsg: string, replytypedid: number, requesterid: string, iscurrentuserjoined: boolean, msgmetadata: any, msgTipe: string) {
    // this.logger.log('[WS-MSGS-SERV] replytypedid ', replytypedid ) 
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.SERVER_BASE_PATH + projectid + '/requests/' + convid + '/messages'
    this.logger.log('[WS-MSGS-SERV] SEND CHAT MSG URL', this.SERVER_BASE_PATH)
    let body = {}

    if (!msgmetadata) {
      body = { 'text': chatmsg }
    } else if (msgmetadata) {
      body = { 'text': chatmsg, 'metadata': msgmetadata, 'type': msgTipe }
    }

    // replytypedid === 2 'Internal note'
    if (replytypedid === 2 && iscurrentuserjoined === true) {
      body['attributes'] = {
        "privateFor": requesterid,
        "subtype": 'private'
      }
    }
    // replytypedid === 2 'Internal note'
    if (replytypedid === 2 && iscurrentuserjoined === false) {
      body['attributes'] = {
        "privateFor": requesterid,
        "subtype": 'private',
        "updateconversation": false,
      }
    }

    // replytypedid === 1 ->   'Public answer',
    if (replytypedid === 1 && iscurrentuserjoined === false) {
      body['attributes'] = {
        "updateconversation": false,
      }
    }

    if (replytypedid === 3) {
      body['sender'] = 'bot_manager';
      body['senderFullname'] = 'System';
      body['type'] = 'text';
      body['attributes'] = {
        "subtype": 'info',
      }
    }

    this.logger.log('[WS-MSGS-SERV] SEND CHAT MSG URL BODY ', body);
    return this._httpClient.post(url, JSON.stringify(body), httpOptions)
  }

  // SEE DOCS -> https://developer.tiledesk.com/apis/rest-api/messages#get-the-messages-of-a-request-by-id
  // /v2/:project_id/requests/:request_id/messages
  public geRequestMsgs(request_id) {
    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + request_id + '/messages/';
    this.logger.log('[WS-MSGS-SERV] - GET REQUESTS MSGS ', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    return this._httpClient.get(url, httpOptions);

  }

  public updateConversationSmartAssigment(request_id: string, smartassigment: boolean) {

    const url = this.SERVER_BASE_PATH + this.project_id + '/requests/' + request_id

    this.logger.log('[WS-MSGS-SERV] - UPDATE CONV SMART ASSIGMENT - URL', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    // const body = {'smartAssignmentEnabled': smartassigment };
    const body = { 'smartAssignment': smartassigment };

    this.logger.log('[WS-MSGS-SERV] - UPDATE CONV SMART ASSIGMENT - BODY', body);

    return this._httpClient
      .patch(url, JSON.stringify(body), httpOptions)

  }

  public getTranscriptAsText(request_id) {
    const url = this.SERVER_BASE_PATH + 'public/requests/' + request_id + '/messages.txt'
    this.logger.log('[WS-MSGS-SERV] - GET TRANSCRIPT AS TXT URL ', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      }),
      responseType: 'text' as 'json'
    };

    return this._httpClient
      .get(url, httpOptions);

  }

}
