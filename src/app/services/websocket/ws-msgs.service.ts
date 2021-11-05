import { Injectable } from '@angular/core';
import { WebSocketJs } from "./websocket-js";
import { AuthService } from '../../core/auth.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { WsMessage } from '../../models/ws-message-model';
import { LoggerService } from '../../services/logger/logger.service';

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
    public webSocketJs: WebSocketJs,
    private logger: LoggerService
  ) {
    this.wsMsgsList = [];
    this.logger.log('[WS-MSGS-SERV] - HELLO !!! wsMsgsList ', this.wsMsgsList)
    this.getCurrentProject();
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
}
