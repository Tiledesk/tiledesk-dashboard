// // import { Injectable } from '@angular/core';

// // @Injectable({
// //   providedIn: 'root'
// // })
// // export class WsRequestsService {

// //   constructor() { }
// // }

// import { Injectable } from '@angular/core';
// import { Observable, Subject } from "rxjs/Rx";
// import { WebsocketService } from "./websocket.service";
// import { AuthService } from '../core/auth.service';
// import { BehaviorSubject } from 'rxjs/BehaviorSubject';

// // const CHAT_URL = "ws://echo.websocket.org/";
// const CHAT_URL = "ws://tiledesk-server-pre.herokuapp.com?token=JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJlbWFpbHZlcmlmaWVkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YWM3NTIxNzg3ZjZiNTAwMTRlMGI1OTIiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJlbWFpbHZlcmlmaWVkIjoiaW5pdCIsImxhc3RuYW1lIjoiaW5pdCIsImZpcnN0bmFtZSI6ImluaXQiLCJfaWQiOiJpbml0In0sInN0YXRlcyI6eyJpZ25vcmUiOnt9LCJkZWZhdWx0Ijp7fSwiaW5pdCI6eyJlbWFpbHZlcmlmaWVkIjp0cnVlLCJsYXN0bmFtZSI6dHJ1ZSwiZmlyc3RuYW1lIjp0cnVlLCJwYXNzd29yZCI6dHJ1ZSwiZW1haWwiOnRydWUsIl9pZCI6dHJ1ZX0sIm1vZGlmeSI6e30sInJlcXVpcmUiOnt9fSwic3RhdGVOYW1lcyI6WyJyZXF1aXJlIiwibW9kaWZ5IiwiaW5pdCIsImRlZmF1bHQiLCJpZ25vcmUiXX0sInBhdGhzVG9TY29wZXMiOnt9LCJlbWl0dGVyIjp7Il9ldmVudHMiOnt9LCJfZXZlbnRzQ291bnQiOjAsIl9tYXhMaXN0ZW5lcnMiOjB9LCIkb3B0aW9ucyI6dHJ1ZX0sImlzTmV3IjpmYWxzZSwiX2RvYyI6eyJlbWFpbHZlcmlmaWVkIjp0cnVlLCJsYXN0bmFtZSI6IkxhbnppbG90dG8iLCJmaXJzdG5hbWUiOiJOaWNvIiwicGFzc3dvcmQiOiIkMmEkMTAkTlBoSk5VNVZDYlU2d05idG1Jck5lT3MxR0dBSW5rMERMeGVYWXN2dklHZ1JnY1dMWW1kYkciLCJlbWFpbCI6Im5pY29sYS5sYW56aWxvdHRvQGZyb250aWVyZTIxLml0IiwiX2lkIjoiNWFjNzUyMTc4N2Y2YjUwMDE0ZTBiNTkyIn0sIiRpbml0Ijp0cnVlLCJpYXQiOjE1NzM0Njg4MzAsImF1ZCI6Imh0dHBzOi8vdGlsZWRlc2suY29tIiwiaXNzIjoiaHR0cHM6Ly90aWxlZGVzay5jb20iLCJzdWIiOiJ1c2VyIn0.ujMJkZYSEN53fE9bwTeWnig1rTObOnEmcSh_Hu6KkTM";

// export interface Message {
//   action: string;
//   payload: {
//     topic: string,
//     method: string, message: any
//   };
// }

// // {
// //   action: 'subscribe',
// //   payload: {
// //     topic: 'topic1',
// //   },
// // }

// @Injectable()


// export class WsRequestsService {
//   public messages: Subject<Message>;
//   public wsRequestsList$: BehaviorSubject<[]> = new BehaviorSubject<[]>([]);

//   wsRequestsList: any;

//   constructor(
//     public wsService: WebsocketService,
//     public auth: AuthService
//   ) {

//     this.wsConnect();

//     this.getWsRequests();

//     this.getCurrentProject();

//   }

//   getWsRequests() {
//     this.wsRequestsList = []
//     this.messages.subscribe(json => {
//       console.log("% WsRequestsService getWsRequests (Response from websocket) json : ", json);

//       if (json) {
//         const wsresponse = json
//         const wsmethod = wsresponse['payload']['method'];

//         // this.wsRequestsList$.next(this.wsRequestsList);
       

//         console.log("% WsRequestsService getWsRequests (Response from websocket) wsmethod: ", wsmethod);
//         console.log("% WsRequestsService getWsRequests (Response from websocket) wsRequestsList: ", this.wsRequestsList);
//         //hai array di richieste iniziali 


//         wsresponse['payload']['message'].forEach(request => {
          
//           this.addOrUpdateWsRequestsList(request);

//         });

//       }



//       //   if (json && json.payload  && json.payload.message && this.isArray(json.payload.message)) {
//       //     json.payload.message.forEach(element => {
//       //        // console.log("element", element);
//       //         //let insUp = that.insertOrUpdate(element);
//       //       let insUp = json.payload.method;
//       //     console.log("insUp",insUp);

//       //         // var object = {event: json.payload, data: element};
//       //         if (insUp=="CREATE" ) {
//       //               //create 
//       //           }
//       //           if (insUp=="UPDATE" ) {
//       //             //update 
//       //           }

//       //         // if (insUp=="CREATE" && that.onCreate) {
//       //         //     that.onCreate(element, object);
//       //         // }
//       //         // if (insUp=="UPDATE" && that.onUpdate) {
//       //         //     that.onUpdate(element, object);
//       //         // }
//       //         // //this.data.push(element);

//       //         //  resolve(element, object);
//       //         // $('#messages').after(element.text + '<br>');
//       //     });
//       // }else {
//       //     //let insUp = that.insertOrUpdate(json.payload.message);
//       //     let insUp = json.payload.method;                                                                                                                                                                                                                         
//       //       console.log("insUp",insUp);     

//       //     var object = {event: json.payload, data: json};

//       //     if (insUp=="CREATE" && that.onCreate) {
//       //         that.onCreate(json.payload.message, object);
//       //     }
//       //     if (insUp=="UPDATE" && that.onUpdate) {
//       //         that.onUpdate(json.payload.message, object);
//       //     }
//       //      resolve(json.payload.message, object);
//       //     // resolve
//       //     // $('#messages').after(json.text + '<br>');
//       // }

//     });
//   }

//   addOrUpdateWsRequestsList(request) {

//     console.log("% WsRequestsService getWsRequests addOrUpdateWsRequestsList: ", request);

//   }

//   wsConnect() {
//     console.log('%% HI WsRequestsService! - wsService ')
//     this.messages = <Subject<Message>>this.wsService.connect(CHAT_URL).map(
//       (response: MessageEvent): Message => {
//         console.log('%% WsRequestsService response ', response)
//         let data = JSON.parse(response.data);
//         return data;
//         // return {
//         //   action: data.action,
//         //   payload: data.payload.topic
//         // };

//       }
//     );
//   }


//   // topic: '/5dc924a13fa2b8001798b9c1/requests',



//   getCurrentProject() {

//     // IF EXIST A PROJECT UNSUSCRIBE query.onSnapshot AND RESET REQUEST LIST
//     this.auth.project_bs.subscribe((project) => {
//       console.log('!!! REQUEST SERVICE: SUBSCRIBE TO THE PROJECT PUBLISHED BY AUTH SERVICE ', project)
//       // // tslint:disable-next-line:no-debugger
//       // debugger
//       if (project) {

//         setTimeout(() => {
//           this.subscribeToWebsocket(project._id)
//         }, 2000);


//         //   if (this.unsubscribe) {
//         //     this.unsubscribe();
//         //     console.log('!!! REQUEST SERVICE: unsubscribe ', this.unsubscribe)
//         //     this.resetRequestsList();
//         //   }
//         //   this.project = project;

//         //   this.startRequestsQuery();
//         //   this.subscribeToWebsocket(project)

//         // } else {
//         //   if (this.unsubscribe) {
//         //     this.unsubscribe();
//         //     this.resetRequestsList();
//         //   }
//         //   this.project = project;
//       }

//       // console.log('00 -> REQUEST SERVICE project from AUTH service subscription ', project)
//     });
//   }

//   subscribeToWebsocket(project_id) {

//     var message = {
//       action: 'subscribe',
//       payload: {
//         topic: '/' + project_id + '/requests',
//         message: undefined,
//         method: undefined
//       },
//     };

//     this.messages.next(message);
//     console.log("%% subscribeToWebsocket new message from client to websocket  this.messages: ", this.messages);
//     console.log("%% subscribeToWebsocket new message from client to websocket: ", message);

//   }

//   isArray(what) {
//     return Object.prototype.toString.call(what) === '[object Array]';
//   }

// }



