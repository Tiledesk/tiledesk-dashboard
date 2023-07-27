import { Injectable } from '@angular/core';
import { WebSocketJs } from './websocket-js';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'app/core/auth.service';
import { LoggerService } from '../logger/logger.service';
import { AppConfigService } from '../app-config.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WsChatbotService {

  wsService: WebSocketJs;
  project_id: string;
  TOKEN: string

  public wsChatbotTraining$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  
  SERVER_BASE_PATH: string;
  CURRENT_USER_ID: string;

  constructor(
    public auth: AuthService,
    public webSocketJs: WebSocketJs,
    private logger: LoggerService,
    public appConfigService: AppConfigService,
    private _httpClient: HttpClient
  ) { 
    this.logger.log('[WS-CHATBOT-SERV] - HELLO !!!')
    this.getCurrentProject();
    this.getUserTokenAndUserId();
    this.getAppConfig();
  }

  getAppConfig() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    // console.log('[WS-MSGS-SERV] getAppConfig SERVER_BASE_PATH', this.SERVER_BASE_PATH);
  }

  getUserTokenAndUserId() {
    this.auth.user_bs.subscribe((user) => {
      if (user) {
        this.TOKEN = user.token;
        this.CURRENT_USER_ID = user._id
        // console.log('[WS-MSGS-SERV] TOKEN ',   this.TOKEN)
      }
    });
  }


  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.logger.log('[WS-CHATBOT-SERV] - project ', project)
      // // tslint:disable-next-line:no-debugger
      // debugger
      if (project) {
        this.project_id = project._id
        // set the list of messages to empty before subscribing
      }
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // methods for AI train
  // -----------------------------------------------------------------------------------------------------
  /**
   * 
   * Subscribe to websocket chatbot by bot id 
   * called if chatbot.intentsEngine is equal to 'ai'
   * 
   * @param bot_id 
   */
  subsToAITrain_ByBot_id(bot_id) {
    var self = this;

    this.logger.log("[WS-CHATBOT-SERV] - SUBSCRIBE TO AI TRAIN BY BOT ID bot_id", bot_id);

    const path = '/' + this.project_id + '/bots/' + bot_id

    this.logger.log("[WS-CHATBOT-SERV] - SUBSCRIBE TO AI TRAIN BY BOT ID path", path);
    this.webSocketJs.ref(path, 'subsToAITrain_ByBot_id',
      function (data, notification) {
        self.logger.log("[WS-CHATBOT-SERV] -SUBSCRIBE TO AI TRAIN BY BOT ID - CREATE data", data);
        // console.log("[WS-CHATBOT-SERV] -SUBSCRIBE TO AI TRAIN BY BOT ID - CREATE data", data)

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
        // const index = self.wsMsgsList.findIndex((msg) => msg._id === data._id);
        // // if (msgFound.length === 0) {
        // if (index === -1) {
        //   self.addWsMsg(data)
        // } else {
        //   // self.logger.log("[WS-MSGS-SERV] - SUBSCRIBE TO MSGS BY REQUESTS ID - MSG ALREADY EXIST - NOT ADD");
        // }

      }, function (data, notification) {
        // console.log("[WS-MSGS-SERV] - SUBSCRIBE TO MSGS BY REQUESTS ID - UPDATE data", data);

        // self.updateWsMsg(data)

      }, function (data, notification) {

        if (data) {
          // console.log("[WS-MSGS-SERV] - SUBSCRIBE TO MSGS BY REQUESTS ID - ON-DATA - data", data);
          self.wsChatbotTraining$.next(data);
        }
      }
    );
  }

  /** 
   * Unsubscribe to websocket messages by request id service 
   * called when in WsRequestsMsgsComponent onInit() is got the request id from url params
   * 
   * @param request_id 
   */
  unsubsToAITrain_ByBot_id(bot_id) {
    this.logger.log("[WS-MSGS-SERV] - UNSUBSCRIBE TO MSGS BY REQUEST ID - request_id ", bot_id);
    this.webSocketJs.unsubscribe('/' + this.project_id + '/bots/' + bot_id );

  }

}
