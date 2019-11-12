import { Injectable } from '@angular/core';
import * as Rx from "rxjs/Rx";

@Injectable()
export class WebsocketService {

  constructor() { }


  private subject: Rx.Subject<MessageEvent>;

  public connect(url): Rx.Subject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create(url);
      console.log("%% Successfully connected: " + url);
    }
    return this.subject;
  }

  private create(url): Rx.Subject<MessageEvent> {
    let ws = new WebSocket(url);

    let observable = Rx.Observable.create((obs: Rx.Observer<MessageEvent>) => {
      ws.onopen =  (evt) => {
        console.log("%% WebsocketService onopen: ", evt);

        };
      ws.onmessage = obs.next.bind(obs);
      ws.onerror = obs.error.bind(obs);
      ws.onclose = obs.complete.bind(obs);
      return ws.close.bind(ws);
    });
    let observer = {
      next: (data: Object) => {
        console.log("%% WebsocketService next state ", ws.readyState);
        if (ws.readyState === WebSocket.OPEN) {
          console.log("%% WebsocketService open ");
          ws.send(JSON.stringify(data));
        } else {
          console.log("%% WebsocketService else ");
        }
      },
      error: (data: Object) => {
        console.log("%% WebsocketService error: ", data);
      },
      // onopen: (data: Object) => {
      //   console.log("%% WebsocketService onopen: ", data);
      // }
    };
    return Rx.Subject.create(observer, observable);
  }


}
