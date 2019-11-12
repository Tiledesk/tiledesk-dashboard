
import { Injectable } from '@angular/core';
import { Observable, Subject } from "rxjs/Rx";
import { WebSocketJs } from "./websocketjs";
import { AuthService } from '../core/auth.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

// const CHAT_URL = "ws://echo.websocket.org/";
const CHAT_URL = "ws://tiledesk-server-pre.herokuapp.com?token=JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJlbWFpbHZlcmlmaWVkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YWM3NTIxNzg3ZjZiNTAwMTRlMGI1OTIiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJlbWFpbHZlcmlmaWVkIjoiaW5pdCIsImxhc3RuYW1lIjoiaW5pdCIsImZpcnN0bmFtZSI6ImluaXQiLCJfaWQiOiJpbml0In0sInN0YXRlcyI6eyJpZ25vcmUiOnt9LCJkZWZhdWx0Ijp7fSwiaW5pdCI6eyJlbWFpbHZlcmlmaWVkIjp0cnVlLCJsYXN0bmFtZSI6dHJ1ZSwiZmlyc3RuYW1lIjp0cnVlLCJwYXNzd29yZCI6dHJ1ZSwiZW1haWwiOnRydWUsIl9pZCI6dHJ1ZX0sIm1vZGlmeSI6e30sInJlcXVpcmUiOnt9fSwic3RhdGVOYW1lcyI6WyJyZXF1aXJlIiwibW9kaWZ5IiwiaW5pdCIsImRlZmF1bHQiLCJpZ25vcmUiXX0sInBhdGhzVG9TY29wZXMiOnt9LCJlbWl0dGVyIjp7Il9ldmVudHMiOnt9LCJfZXZlbnRzQ291bnQiOjAsIl9tYXhMaXN0ZW5lcnMiOjB9LCIkb3B0aW9ucyI6dHJ1ZX0sImlzTmV3IjpmYWxzZSwiX2RvYyI6eyJlbWFpbHZlcmlmaWVkIjp0cnVlLCJsYXN0bmFtZSI6IkxhbnppbG90dG8iLCJmaXJzdG5hbWUiOiJOaWNvIiwicGFzc3dvcmQiOiIkMmEkMTAkTlBoSk5VNVZDYlU2d05idG1Jck5lT3MxR0dBSW5rMERMeGVYWXN2dklHZ1JnY1dMWW1kYkciLCJlbWFpbCI6Im5pY29sYS5sYW56aWxvdHRvQGZyb250aWVyZTIxLml0IiwiX2lkIjoiNWFjNzUyMTc4N2Y2YjUwMDE0ZTBiNTkyIn0sIiRpbml0Ijp0cnVlLCJpYXQiOjE1NzM0Njg4MzAsImF1ZCI6Imh0dHBzOi8vdGlsZWRlc2suY29tIiwiaXNzIjoiaHR0cHM6Ly90aWxlZGVzay5jb20iLCJzdWIiOiJ1c2VyIn0.ujMJkZYSEN53fE9bwTeWnig1rTObOnEmcSh_Hu6KkTM";

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

  wsRequestsList: any
  wsService: WebSocketJs;

  constructor(
    public auth: AuthService
  ) {

    console.log("HI WsRequestsService ");
    //this.wsConnect(); !no more used

    // this.getWsRequests();
    // this.getCurrentProject();

  }

  getWsRequests() {
    const self = this;
    self.wsRequestsList = []

    this.wsService = new WebSocketJs(
      CHAT_URL,

      function (data, notification) {

        console.log("% WsRequestsService create", data);
        // this.wsRequestsList.push(data);
        // self.addOrUpdateWsRequestsList(data);

        self.addWsRequest(data)

      }, function (data, notification) {

        console.log("% WsRequestsService update", data);
        // this.wsRequestsList.push(data);

        // self.addOrUpdateWsRequestsList(data);
        self.updateWsRequest(data)
      }
    );

    // if(this.wsRequestsList) {
    //   self.wsRequestsList$.next(this.wsRequestsList);
    // }
    
  }


  addWsRequest(request) {
    this.wsRequestsList.push(request);

    if(this.wsRequestsList) {
      this.wsRequestsList$.next(this.wsRequestsList);
    }
  }


  updateWsRequest(request) {
    for (let i = 0; i < this.wsRequestsList.length; i++) {
      
      if (request._id === this.wsRequestsList[i]._id) {
        console.log("% WsRequestsService getWsRequests UPATE AN EXISTING REQUESTS - request._id : ", request._id , ' wsRequestsList[i]._id: ', this.wsRequestsList[i]._id);
        /// UPATE AN EXISTING REQUESTS
        this.wsRequestsList[i] = request       

        if(this.wsRequestsList) {
          this.wsRequestsList$.next(request);
        } 
      }
    }
  }

  addOrUpdateWsRequestsList(request) {
    console.log("% WsRequestsService getWsRequests addOrUpdateWsRequestsList: ", request);
    for (let i = 0; i < this.wsRequestsList.length; i++) {
      if (request._id === this.wsRequestsList[i]._id) {
        console.log("% WsRequestsService getWsRequests UPATE AN EXISTING REQUESTS - request._id : ", request._id , ' wsRequestsList[i]._id: ', this.wsRequestsList[i]._id);
        /// UPATE AN EXISTING REQUESTS
        this.wsRequestsList[i] = request

      } else {

        this.wsRequestsList.push(request);
      }
    }

    this.wsRequestsList$.next(this.wsRequestsList);
  }


  getCurrentProject() {

    // IF EXIST A PROJECT UNSUSCRIBE query.onSnapshot AND RESET REQUEST LIST
    this.auth.project_bs.subscribe((project) => {
      console.log('!!! REQUEST SERVICE: SUBSCRIBE TO THE PROJECT PUBLISHED BY AUTH SERVICE ', project)
      // // tslint:disable-next-line:no-debugger
      // debugger
      if (project) {

        /**
         ***** UNCOMMENT THIS TO START WEBSOCKET ****** 
         */
        this.subscribeToWebsocket(project._id)
      }

    });
  }

  subscribeToWebsocket(project_id) {

    var message = {
      action: 'subscribe',
      payload: {
        // topic: '/' + project_id + '/requests',
        topic: '/' + project_id + '/requests/5dcac2f2c71f1e001705c42f/messages/',
        message: undefined,
        method: undefined
      },
    };
    var str = JSON.stringify(message);
    console.log("%% str " + str);
    this.wsService.start(str);

    // this.messages.next(message);
    console.log("%% subscribeToWebsocket new message from client to websocket  this.messages: ", this.messages);
    console.log("%% subscribeToWebsocket new message from client to websocket: ", message);

  }



  getWsRequests_old() {
    this.wsRequestsList = []
    this.messages.subscribe(json => {
      console.log("% WsRequestsService getWsRequests (Response from websocket) json : ", json);

      if (json) {
        const wsresponse = json
        const wsmethod = wsresponse['payload']['method'];

        // this.wsRequestsList$.next(this.wsRequestsList);


        console.log("% WsRequestsService getWsRequests (Response from websocket) wsmethod: ", wsmethod);
        console.log("% WsRequestsService getWsRequests (Response from websocket) wsRequestsList: ", this.wsRequestsList);
        //hai array di richieste iniziali 


        wsresponse['payload']['message'].forEach(request => {

          this.addOrUpdateWsRequestsList(request);

        });

      }

    });
  }



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



