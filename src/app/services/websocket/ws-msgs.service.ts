import { Injectable } from '@angular/core';
import { WebSocketJs } from "./websocketjs";
import { AuthService } from '../../core/auth.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

const CHAT_URL = "wss://tiledesk-server-pre.herokuapp.com?token=JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJlbWFpbHZlcmlmaWVkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YWM3NTIxNzg3ZjZiNTAwMTRlMGI1OTIiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJlbWFpbHZlcmlmaWVkIjoiaW5pdCIsImxhc3RuYW1lIjoiaW5pdCIsImZpcnN0bmFtZSI6ImluaXQiLCJfaWQiOiJpbml0In0sInN0YXRlcyI6eyJpZ25vcmUiOnt9LCJkZWZhdWx0Ijp7fSwiaW5pdCI6eyJlbWFpbHZlcmlmaWVkIjp0cnVlLCJsYXN0bmFtZSI6dHJ1ZSwiZmlyc3RuYW1lIjp0cnVlLCJwYXNzd29yZCI6dHJ1ZSwiZW1haWwiOnRydWUsIl9pZCI6dHJ1ZX0sIm1vZGlmeSI6e30sInJlcXVpcmUiOnt9fSwic3RhdGVOYW1lcyI6WyJyZXF1aXJlIiwibW9kaWZ5IiwiaW5pdCIsImRlZmF1bHQiLCJpZ25vcmUiXX0sInBhdGhzVG9TY29wZXMiOnt9LCJlbWl0dGVyIjp7Il9ldmVudHMiOnt9LCJfZXZlbnRzQ291bnQiOjAsIl9tYXhMaXN0ZW5lcnMiOjB9LCIkb3B0aW9ucyI6dHJ1ZX0sImlzTmV3IjpmYWxzZSwiX2RvYyI6eyJlbWFpbHZlcmlmaWVkIjp0cnVlLCJsYXN0bmFtZSI6IkxhbnppbG90dG8iLCJmaXJzdG5hbWUiOiJOaWNvIiwicGFzc3dvcmQiOiIkMmEkMTAkTlBoSk5VNVZDYlU2d05idG1Jck5lT3MxR0dBSW5rMERMeGVYWXN2dklHZ1JnY1dMWW1kYkciLCJlbWFpbCI6Im5pY29sYS5sYW56aWxvdHRvQGZyb250aWVyZTIxLml0IiwiX2lkIjoiNWFjNzUyMTc4N2Y2YjUwMDE0ZTBiNTkyIn0sIiRpbml0Ijp0cnVlLCJpYXQiOjE1NzM0Njg4MzAsImF1ZCI6Imh0dHBzOi8vdGlsZWRlc2suY29tIiwiaXNzIjoiaHR0cHM6Ly90aWxlZGVzay5jb20iLCJzdWIiOiJ1c2VyIn0.ujMJkZYSEN53fE9bwTeWnig1rTObOnEmcSh_Hu6KkTM";
@Injectable()

export class WsMsgsService {

  wsService: WebSocketJs;
  project_id: string;
  wsMsgsList: any;

  public wsMsgsList$: BehaviorSubject<[]> = new BehaviorSubject<[]>([]);
  constructor(

    public auth: AuthService

  ) {

    // this.getCurrentProject();
    // this.getWsRequests();
  }

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


  getWsRequests() {
    const self = this;
    self.wsMsgsList = []

    this.wsService = new WebSocketJs(
      CHAT_URL,

      function (data, notification) {

        console.log("% WsMsgsService create", data);
        console.log("% WsMsgsService notification", notification);



        const hasFound = self.wsMsgsList.filter((obj: any) => {
          return obj._id === data._id;
        });

        if (hasFound.length === 0) {
          self.addWsMsg(data)
        }

      }, function (data, notification) {

        console.log("% WsMsgsService update", data);
        console.log("% WsMsgsService notification", notification);

        self.updateWsMsg(data)
      }
    );

    // if(this.wsRequestsList) {
    //   self.wsRequestsList$.next(this.wsRequestsList);
    // }

  }



  addWsMsg(msg) {
    console.log("% WsMsgsService addWsMsgs wsMsgsList.length", this.wsMsgsList.length);

    this.wsMsgsList.push(msg);

    if (this.wsMsgsList) {
      this.wsMsgsList$.next(this.wsMsgsList);
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


  // getWsRequestMsgs(request_id) {

  //   this.wsService = new WebSocketJs(
  // }

  subscribeToWebsocket(request_id) {

    var message = {
      action: 'subscribe',
      payload: {

        topic: '/' + this.project_id + '/requests/' + request_id + '/messages/',
        message: undefined,
        method: undefined
      },
    };
    var str = JSON.stringify(message);
    console.log("%% str " + str);

    this.wsService.start(str);

    // this.messages.next(message);

    console.log("%% subscribeToWebsocket new message from client to websocket: ", message);

  }



}
