
//import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

//@Injectable()
export class WebSocketJs {

  public url;
  public onCreate;
  public onUpdate;
  public onOpen;
  public onData;
  public ws;
  public topics;
  public callbacks;
  public readyState: number;
  // public userHasClosed: boolean;

  // HEARTBEAT https://github.com/zimv/websocket-heartbeat-js/blob/master/lib/index.js
  private pingTimeoutId;
  private pongTimeoutId;

  public pingMsg = { action: "heartbeat", payload: { message: { text: "ping" } } }

  public pongMsg = { action: "heartbeat", payload: { message: { text: "pong" } } }


  public pongTimeout = 10000;
  public pingTimeout = 15000;

  // nktest
  // startTimeMS = 0;

  public pingSent$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public pongSent$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public pongReceived$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  // public sendingMessages;
  //public data;

  /*
    constructor(url, onCreate, onUpdate, onOpen=undefined) {
      console.log("WebSocketJs constructor");
      this.url = url;
      this.onCreate = onCreate;
      this.onUpdate = onUpdate;
      this.onOpen = onOpen;
      this.topics = [];//new Map();
      this.callbacks = new Map();
      this.sendingMessages = [];//new Map();
    // this.data = [];
      this.init(this.sendMesagesInSendingArray);

    }
    */

  constructor() {

    console.log("% »»» WebSocketJs WF constructor ***");
    this.topics = [];//new Map();
    this.callbacks = new Map();

    // this.sendingMessages = [];//new Map();
  }


  /**
   * readyState: A read-only attribute. It represents the state of the connection. It can have the following values:
   * 0: Connection is in progress and has not yet been established.
   * 1: Connection is established and messages can be sent between the client and the server.
   * 2: Connection is going through the closing handshake.
   * 3: Connection has been closed or could not be opened.
   */

  // -----------------------------------------------------------------------------------------------------
  // @ ref - called by 'WsRequestsService' and 'WsMsgsService' & call 'subscribe' 
  // -----------------------------------------------------------------------------------------------------
  // WsRequestsService:
  //  - in getCurrentProjectAndSubscribeTo_WsRequests() 
  //  - in subscribeTo_wsRequestById() called when in 
  //     WsRequestsMsgsComponent onInit() is got the request id from url params
  // WsMsgsService     
  //  - in subsToWS_MsgsByRequestId() called when in 
  //     WsRequestsMsgsComponent onInit() is got the request id from url params

  ref(topic, calledby, onCreate, onUpdate, onData) {
    // console.log('% »»» WebSocketJs ****** CALLING REF ****** ');
    console.log('% »»» WebSocketJs WF ****** CALLING REF ****** calledby ', calledby);
    console.log('% »»» WebSocketJs WF ****** CALLING REF ****** TOPIC ', topic);
    console.log('% »»» WebSocketJs WF ****** CALLING REF ****** CALLBACKS', this.callbacks);
    console.log('% »»» WebSocketJs WF ****** CALLING REF ****** CALLBACKS typeof', typeof this.callbacks);
    console.log('% »»» WebSocketJs WF ****** CALLING REF ****** CALLBACKS    Object.prototype.toString.call(this.callbacks)', Object.prototype.toString.call(this.callbacks));
    console.log('% »»» WebSocketJs WF ****** CALLING REF ****** CALLBACKS  this.callbacks.has(topic) ', this.callbacks.has(topic));
    //this.callbacks.set(topic, {onCreate:onCreate, onUpdate:onUpdate});


    if (!this.callbacks) {
      console.log('% »»» WebSocketJs WF *** REF *** OOOOPS! NOT CALLBACKS ***', topic);
      return
    }

    this.callbacks.set(topic, { onCreate: onCreate, onUpdate: onUpdate, onData: onData });
    console.log('% »»» WebSocketJs WF ****** CALLING REF ****** CALLBACKS this.callbacks.set ', this.callbacks);
    // console.log('% »»» WebSocketJs WF *** REF *** callbacks *** ', this.callbacks);
    // this.callbacks


    console.log('% »»» WebSocketJs WF *** REF *** topic ***', topic);
    // console.log('% »»» WebSocketJs WF *** REF *** this.topics ***', this.topics);
    // console.log('% »»» WebSocketJs WF *** REF *** READY STATE *** ws.readyState ', this.ws.readyState);
    // console.log('% »»» WebSocketJs WF *** REF *** READY STATE *** this.readyState ', this.readyState);
    console.log('% »»» WebSocketJs WF *** REF *** WS 1 ', this.ws)
    if (this.ws && this.ws.readyState == 1) {

      console.log('% »»» WebSocketJs WF *** REF *** READY STATE 1 ', this.ws.readyState)
      this.subscribe(topic);

    } else {
      // this.ws =  new WebSocket("wss://tiledesk-server-pre.herokuapp.com/?token=JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZGRkMzBiZmYwMTk1ZjAwMTdmNzJjNmQiLCJlbWFpbCI6InByZWdpbm9AZjIxdGVzdC5pdCIsImZpcnN0bmFtZSI6Ikdpbm8iLCJsYXN0bmFtZSI6IlByZSIsImVtYWlsdmVyaWZpZWQiOnRydWUsImlhdCI6MTYwODgwNjY0MCwiYXVkIjoiaHR0cHM6Ly90aWxlZGVzay5jb20iLCJpc3MiOiJodHRwczovL3RpbGVkZXNrLmNvbSIsInN1YiI6InVzZXIiLCJqdGkiOiI1YmVmMDcxYy00ODBlLTQzYzQtOTRhYS05ZjQxYzMyNDcxMGQifQ.wv6uBn2P6H9wGb5WCYQkpPEScMU9PB1pBUzFouhJk20");

      console.log('% »»» WebSocketJs WF *** REF *** READY STATE 2 ', this.ws.readyState);
      console.log('% »»» WebSocketJs WF *** REF *** WS 2 ', this.ws);

      var that = this;
      if (this.ws) {



        this.ws.addEventListener("open", function (event) {
          console.log('% »»» WebSocketJs WF *** REF *** OPEN EVENT *** ', event);
          that.subscribe(topic);
        });
      }

      if (this.topics.indexOf(topic) === -1) {
        this.topics.push(topic);
      }
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ subscribe - is called by 'ref' & call 'send'
  // -----------------------------------------------------------------------------------------------------
  subscribe(topic) {
    // console.log('% »»» WebSocketJs ****** CALLING SUBSCRIBE ****** ');
    //this.topics.set(topic,1);
    // console.log('% »»» WebSocketJs ****** CALLING SUBSCRIBE ****** to topic ', topic);

    if (this.topics.indexOf(topic) === -1) {
      this.topics.push(topic);
    }
    console.log("% »»» WebSocketJs *** SUBSCRIBE *** topics ", this.topics);

    var message = {
      action: 'subscribe',
      payload: {
        //topic: '/' + project_id + '/requests',
        topic: topic,
        message: undefined,
        method: undefined
      },
    };
    var str = JSON.stringify(message);
    console.log("%% str " + str);

    this.send(str, `SUBSCRIBE to ${topic}`);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ unsubscribe 
  // - called by: 'WsRequestsService' > getCurrentProjectAndSubscribeTo_WsRequests()  
  //                                  > unsubscribeTo_wsRequestById() called by WsRequestsMsgsComponent > On Init & On Destroy
  //              'WsMsgsService' > unsubsToWS_MsgsByRequestId() > On Init & On Destroy
  //  - call 'send'
  // -----------------------------------------------------------------------------------------------------
  unsubscribe(topic) {
    console.log('% »»» WebSocketJs WF ****** CALLING UN-SUBSCRIBE ****** ');
    // console.log("% »»» WebSocketJs WF *** UNSUBSCRIBE *** - this.topics ", this.topics);
    console.log("% »»» WebSocketJs WF *** UNSUBSCRIBE *** - topic ", topic);
    console.log("% »»» WebSocketJs WF *** UNSUBSCRIBE *** - callbacks ", this.callbacks);
    //this.topics.delete(topic);

    var index = this.topics.indexOf(topic);
    console.log("% »»» WebSocketJs WF *** UNSUBSCRIBE *** - topic  (1C)", topic, ' index ', index);
    if (index > -1) {
      this.topics.splice(index, 1);
    }

    console.log("% »»» WebSocketJs WF *** UNSUBSCRIBE *** - topics after splice ", this.topics);
    console.log("% »»» WebSocketJs WF *** UNSUBSCRIBE *** - topic  ", topic);
    console.log('% »»» WebSocketJs WF *** UNSUBSCRIBE *** this.ws.readyState ', this.ws.readyState);
    console.log("% »»» WebSocketJs WF *** UNSUBSCRIBE *** - callback size ", this.callbacks.size);

    // if (this.callbacks.length > 0) {
    if (this.callbacks.size > 0) {
      this.callbacks.delete(topic);
      console.log("% »»» WebSocketJs WF *** UNSUBSCRIBE *** - callback after delete ", this.callbacks);
    }

    var message = {
      action: 'unsubscribe',
      payload: {
        //topic: '/' + project_id + '/requests',
        topic: topic,
        message: undefined,
        method: undefined
      },
    };
    var str = JSON.stringify(message);
    console.log("%% str " + str);

    if (this.ws.readyState == 1) {
      this.send(str, `calling method - UNSUSCRIBE from ${topic}`);

    } else {
      console.log('% »»» WebSocketJs WF *** UNSUSCRIBE try send but this.ws.readyState is = ', this.ws.readyState);


    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ send - call this.ws.send()  
  // -----------------------------------------------------------------------------------------------------
  send(initialMessage, calling_method) {

    // const initialMessageObj = JSON.parse(initialMessage);
    // const message = initialMessageObj.payload.message.text
    // console.log('% »»» WebSocketJs WF  SEND - initialMessageObj', initialMessageObj);

    // nk 
    console.log('% »»» WebSocketJs WF *** UNSUSCRIBE  sender: ', calling_method, '- message: ', initialMessage);
    this.ws.send(initialMessage);
  }


  // -----------------------------------------------------------------------------------------------------
  // @ close (to find where is used search for x webSocketClose()) 
  // -----------------------------------------------------------------------------------------------------
  close() {
    console.log('% »»» WebSocketJs WF *** CALLING CLOSE ****** ');
    this.topics = [];
    // this.callbacks = []; // NK COMMENTET FOR THE BUG callback.set is not a function
    this.callbacks = {};
    console.log('% »»» WebSocketJs WF *** CALLING CLOSE ****** this.callbacks');
    if (this.ws) {
      this.ws.onclose = function () { }; // disable onclose handler first
      this.ws.close();
    }
    this.heartReset();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ resubscribe
  // -----------------------------------------------------------------------------------------------------
  resubscribe() {
    console.log('% »»» WebSocketJs WF *** CALLING RESUBSCRIBE ****** ');
    console.log('% »»» WebSocketJs WF *** CALLING RESUBSCRIBE ****** TOPICS ', this.topics);
    console.log('% »»» WebSocketJs WF *** CALLING RESUBSCRIBE ****** CALLBACKS  444 ', this.callbacks);
    console.log('% »»» WebSocketJs WF *** CALLING RESUBSCRIBE ****** TOPICS LENGTH ', this.topics.length);
    if (this.topics.length > 0) {
      this.topics.forEach(topic => {
        console.log('% »»» WebSocketJs WF *** RESUBSCRIBE *** to topic ', topic);
        this.subscribe(topic); // nn fa sudbcribe 
      });
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ heartCheck
  // -----------------------------------------------------------------------------------------------------
  heartCheck() {
    this.heartReset();
    this.heartStart();
  }

  // _heartStart() {
  //   // if(this.forbidReconnect) return;//Non ricollegare o eseguire il battito cardiaco
  //   this.pingTimeoutId = setTimeout(() => {
  //     // Qui viene inviato un battito cardiaco Dopo averlo ricevuto, viene restituito un messaggio di battito cardiaco.
  //     // onmessage Ottieni il battito cardiaco restituito per indicare che la connessione è normale
  //     try {
  //       console.log('% »»» WebSocketJs - HEARTBEAT send MSG ', JSON.stringify(this.pingMsg));
  //       this.ws.send(JSON.stringify(this.pingMsg));
  //       // Se non viene ripristinato dopo un determinato periodo di tempo, il backend viene attivamente disconnesso
  //       this.pongTimeoutId = setTimeout(() => {
  //         // se onclose Si esibirà reconnect，Eseguiamo ws.close() Bene, se lo esegui direttamente reconnect Si innescherà onclose Causa riconnessione due volte
  //         this.ws.close();
  //       }, this.pongTimeout);

  //     } catch (e) {

  //       console.log('% »»» WebSocketJs - HEARTBEAT err ', e);
  //     }

  //   }, this.pingTimeout);
  // }


  getRemainingTime() {
    // return  this.pingTimeout - ( (new Date()).getTime() -  this.startTimeMS );

    var milliSecondsTime = 15000;
    var timer;

    console.log('% »»» WebSocketJs - heartStart timer 1', milliSecondsTime / 1000);
    timer = setInterval(function () {
      milliSecondsTime = milliSecondsTime - 1000;
      if (milliSecondsTime / 1000 == 0) {
        clearTimeout(timer);
      }
      else {
        console.log('% »»» WebSocketJs - heartStart timer 2 ', milliSecondsTime / 1000);
      }
    }, 1000);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ heartStart
  // -----------------------------------------------------------------------------------------------------
  heartStart() {
    // this.getRemainingTime();
    this.pingTimeoutId = setTimeout(() => {

      // Qui viene inviato un battito cardiaco Dopo averlo ricevuto, viene restituito un messaggio di battito cardiaco.
      // onmessage Ottieni il battito cardiaco restituito per indicare che la connessione è normale
      if (this.ws.readyState == 1) {
        console.log('% »»» WebSocketJs - heartStart WS OK - readyState ', this.ws.readyState);
        console.log('% »»» WebSocketJs - HEART-START send PING MSG ', JSON.stringify(this.pingMsg));

        // this.ws.send(JSON.stringify(this.pingMsg));
        this.send(JSON.stringify(this.pingMsg), 'HEART-START')

      } else {
        console.log('% »»» WebSocketJs - heartStart WS KO - readyState ', this.ws.readyState);


      }

      // Se non viene ripristinato dopo un determinato periodo di tempo, il backend viene attivamente disconnesso
      this.pongTimeoutId = setTimeout(() => {
        console.log('% »»» WebSocketJs - HEARTBEAT pongTimeoutId ', this.pongTimeoutId);
        // se onclose Si esibirà reconnect，Eseguiamo ws.close() Bene, se lo esegui direttamente reconnect Si innescherà onclose Causa riconnessione due volte
        this.ws.close();
      }, this.pongTimeout);

    }, this.pingTimeout);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ heartReset
  // -----------------------------------------------------------------------------------------------------
  heartReset() {
    console.log('% »»» WebSocketJs - HEART-START RESET ');
    clearTimeout(this.pingTimeoutId);
    clearTimeout(this.pongTimeoutId);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ init
  // -----------------------------------------------------------------------------------------------------
  init(url, onCreate, onUpdate, onData, onOpen = undefined, onOpenCallback = undefined, _topics = [], _callbacks = new Map()) {
    console.log('% »»» WebSocketJs WF ***  ****** CALLING INIT ****** ');
    // console.log('% »»» WebSocketJs - INIT url ', url);
    console.log('% »»» WebSocketJs WF *** - INIT onCreate ', onCreate);
    console.log('% »»» WebSocketJs WF *** - INIT onUpdate ', onUpdate);
    console.log('% »»» WebSocketJs WF *** - INIT onOpen ', onOpen);
    console.log('% »»» WebSocketJs WF *** - INIT onOpenCallback ', onOpenCallback);
    this.url = url;
    this.onCreate = onCreate;
    this.onUpdate = onUpdate;
    this.onData = onData;
    this.onOpen = onOpen;
    this.topics = _topics//[];//new Map();
    this.callbacks = _callbacks// new Map();
    // this.userHasClosed = false;
    // console.log('% »»» WebSocketJs WF - closeWebsocket this.userHasClosed ' , this.userHasClosed);

    // this.sendingMessages = [];//new Map();
    // this.data = [];
    // this.init(this.sendMesagesInSendingArray);
    console.log('% »»» WebSocketJs WF *** - INIT topics ', this.topics);

    var that = this;
    return new Promise(function (resolve, reject) {
      // var options = {
      //     // headers: {
      //     //     "Authorization" : "JWT " + token
      //     // }
      // };
      // console.log('options', options);
      // var ws = new WebSocket('ws://localhost:3000');
      // var ws = new WebSocket('ws://localhost:3000/public/requests');
      // var ws = new WebSocket('ws://localhost:3000/5bae41325f03b900401e39e8/messages');


      // -----------------------------------------------------------------------------------------------------
      // @ new WebSocket
      // -----------------------------------------------------------------------------------------------------

      console.log('Web_SocketJs url', that.url)
      // 'ws://localhost:40510'
      that.ws = new WebSocket(that.url);
      // var ws = new WebSocket(that.url, options);

      // -----------------------------------------------------------------------------------------------------
      // @ onopen
      // -----------------------------------------------------------------------------------------------------
      that.ws.onopen = function (e) {
        console.log('% »»» WebSocketJs WF *** - websocket is connected ...', e);

        // -----------------
        // @ heartCheck
        // -----------------
        that.heartCheck();

        // ws.send('connected')
        if (onOpenCallback) {
          onOpenCallback();
        }

        if (that.onOpen) {
          that.onOpen();
        }

      }

      // -----------------------------------------------------------------------------------------------------
      // @ onclose
      // -----------------------------------------------------------------------------------------------------

      that.ws.onclose = function (e) {
        console.log('% »»» WebSocketJs WF *** - websocket IS CLOSED ... Try to reconnect in 3 seconds ', e);

        // console.log('% »»» WebSocketJs - websocket onclose this.userHasClosed ', that.userHasClosed);
        // https://stackoverflow.com/questions/3780511/reconnection-of-client-when-server-reboots-in-websocket
        // Try to reconnect in 3 seconds

        // --------------------
        // @ init > resubscribe
        // --------------------

        setTimeout(function () {
          that.init(url, onCreate, onUpdate, onData, onOpen, function () {
            that.resubscribe();
          }, that.topics, that.callbacks);
        }, 3000);
      }

      // -----------------------------------------------------------------------------------------------------
      // @ onerror
      // -----------------------------------------------------------------------------------------------------

      that.ws.onerror = function () {
        console.log('% »»» WebSocketJs WF *** - websocket error ...')
      }

      // -----------------------------------------------------------------------------------------------------
      // @ onmessage
      // -----------------------------------------------------------------------------------------------------

      that.ws.onmessage = function (message) {
        // console.log('% »»» WebSocketJs - websocket onmessage ', message);
        // console.log('% »»» WebSocketJs - websocket onmessage data ', message.data);

        let test = '{ "action": "publish","payload": {"topic": "/5df26badde7e1c001743b63c/requests", "method": "CREATE", "message": [ { "_id": "5f29372d690e6f0034edf100", "status": 200, "preflight": false, "hasBot": true, "participants": ["bot_5df272e8de7e1c001743b645"],  "participantsAgents": [], "participantsBots": ["5df272e8de7e1c001743b645"], "request_id": "support-group-MDszsSJlwqQn1_WCh6u", "requester": "5f29371b690e6f0034edf0f5", "lead": "5f29372d690e6f0034edf0ff", "first_text": "ocourse the email is valid ","department": "5df26badde7e1c001743b63e", "agents": [{"user_available": true,"online_status": "online", "number_assigned_requests": 35, "_id": "5e0f2119705a35001725714d","id_project": "5df26badde7e1c001743b63c", "id_user": "5aaa99024c3b110014b478f0", "role": "admin", "createdBy": "5df26ba1de7e1c001743b637","createdAt": "2020-01-03T11:10:17.123Z", "updatedAt": "2020-01-03T11:10:17.123Z", "__v": 0 }, { "user_available": false, "online_status": "offline", "number_assigned_requests": 0, "_id": "5e1a13824437eb0017f712b4", "id_project": "5df26badde7e1c001743b63c","id_user": "5ac7521787f6b50014e0b592", "role": "admin", "createdBy": "5df26ba1de7e1c001743b637", "createdAt": "2020-01-11T18:27:14.657Z","updatedAt": "2020-01-11T18:27:14.657Z", "__v": 0}, { "user_available": false,"online_status": "offline", "number_assigned_requests": 0, "_id": "5df26bdfde7e1c001743b640", "id_project": "5df26badde7e1c001743b63c", "id_user": "5de9200d6722370017731969","role": "admin","createdBy": "5df26ba1de7e1c001743b637", "createdAt": "2019-12-12T16:33:35.244Z", "updatedAt": "2019-12-12T16:33:35.244Z","__v": 0 }, {"user_available": true, "online_status": "online","number_assigned_requests": -11, "_id": "5eb1a3647ac005003480f54d", "id_project": "5df26badde7e1c001743b63c","id_user": "5e09d16d4d36110017506d7f","role": "owner", "createdBy": "5aaa99024c3b110014b478f0","createdAt": "2020-05-05T17:33:24.328Z", "updatedAt": "2020-05-05T17:33:24.328Z","__v": 0}], "sourcePage": "https://www.tiledesk.com/pricing-self-managed/", "language": "en","userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36","attributes": { "departmentId": "5df26badde7e1c001743b63e","departmentName": "Default Department","ipAddress": "115.96.30.154","client": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36","sourcePage": "https://www.tiledesk.com/pricing-self-managed/", "projectId": "5df26badde7e1c001743b63c", "requester_id": "ce31d3fd-a358-49c7-9b9f-5aead8330063", "subtype": "info","decoded_jwt": {"_id": "ce31d3fd-a358-49c7-9b9f-5aead8330063","firstname": "Guest", "id": "ce31d3fd-a358-49c7-9b9f-5aead8330063", "fullName": "Guest ","iat": 1596536604,"aud": "https://tiledesk.com","iss": "https://tiledesk.com","sub": "guest","jti": "702a4a7e-e56a-43cf-aadd-376f7c12f633"}},"id_project": "5df26badde7e1c001743b63c","createdBy": "ce31d3fd-a358-49c7-9b9f-5aead8330063","tags": [], "notes": [],"channel": {"name": "chat21"},"createdAt": "2020-08-04T10:23:41.641Z","updatedAt": "2021-03-25T18:01:13.371Z","__v": 3,"assigned_at": "2020-08-04T10:25:26.059Z","channelOutbound": {"name": "chat21"},"snapshot": {"agents": [{"id_user": "5aaa99024c3b110014b478f0"}, {"id_user": "5ac7521787f6b50014e0b592"}, {"id_user": "5de9200d6722370017731969"}, { "id_user": "5e09d16d4d36110017506d7f"}]},"id": "5f29372d690e6f0034edf100","requester_id": "5f29372d690e6f0034edf0ff"}]}}'
        let test_due = '{ "action": "publish","payload": {"topic": "/5df26badde7e1c001743b63c/requests", "method": "CREATE", "message": [ { "_id": "5f29372d690e6f0034edf100", "status": 200, "preflight": false, "hasBot": true, "participants": ["bot_5df272e8de7e1c001743b645"],  "participantsAgents": [], "participantsBots": ["5df272e8de7e1c001743b645"], "request_id": "support-group-MDszsSJlwqQn1_WCh6u", "requester": "5f29371b690e6f0034edf0f5", "lead": "5f29372d690e6f0034edf0ff", "first_text": "ocourse the email is valid ","department": "5df26badde7e1c001743b63e", "agents": [{"user_available": true,"online_status": "online", "number_assigned_requests": 35, "_id": "5e0f2119705a35001725714d","id_project": "5df26badde7e1c001743b63c", "id_user": "5aaa99024c3b110014b478f0", "role": "admin", "createdBy": "5df26ba1de7e1c001743b637","createdAt": "2020-01-03T11:10:17.123Z", "updatedAt": "2020-01-03T11:10:17.123Z", "__v": 0 }, { "user_available": false, "online_status": "offline", "number_assigned_requests": 0, "_id": "5e1a13824437eb0017f712b4", "id_project": "5df26badde7e1c001743b63c","id_user": "5ac7521787f6b50014e0b592", "role": "admin", "createdBy": "5df26ba1de7e1c001743b637", "createdAt": "2020-01-11T18:27:14.657Z","updatedAt": "2020-01-11T18:27:14.657Z", "__v": 0}, { "user_available": false,"online_status": "offline", "number_assigned_requests": 0, "_id": "5df26bdfde7e1c001743b640", "id_project": "5df26badde7e1c001743b63c", "id_user": "5de9200d6722370017731969","role": "admin","createdBy": "5df26ba1de7e1c001743b637", "createdAt": "2019-12-12T16:33:35.244Z", "updatedAt": "2019-12-12T16:33:35.244Z","__v": 0 }, {"user_available": true, "online_status": "online","number_assigned_requests": -11, "_id": "5eb1a3647ac005003480f54d", "id_project": "5df26badde7e1c001743b63c","id_user": "5e09d16d4d36110017506d7f","role": "owner", "createdBy": "5aaa99024c3b110014b478f0","createdAt": "2020-05-05T17:33:24.328Z", "updatedAt": "2020-05-05T17:33:24.328Z","__v": 0}], "sourcePage": "https://www.tiledesk.com/pricing-self-managed/", "language": "en","userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36","attributes": { "departmentId": "5df26badde7e1c001743b63e","departmentName": "Default Department","ipAddress": "115.96.30.154","client": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36","sourcePage": "https://www.tiledesk.com/pricing-self-managed/", "projectId": "5df26badde7e1c001743b63c", "requester_id": "ce31d3fd-a358-49c7-9b9f-5aead8330063", "subtype": "info","decoded_jwt": {"_id": "ce31d3fd-a358-49c7-9b9f-5aead8330063","firstname": "Guest", "id": "ce31d3fd-a358-49c7-9b9f-5aead8330063", "fullName": "Guest ","iat": 1596536604,"aud": "https://tiledesk.com","iss": "https://tiledesk.com","sub": "guest","jti": "702a4a7e-e56a-43cf-aadd-376f7c12f633"}},"id_project": "5df26badde7e1c001743b63c","createdBy": "ce31d3fd-a358-49c7-9b9f-5aead8330063","tags": [], "notes": [],"channel": {"name": "chat21"},"createdAt": "2020-08-04T10:23:41.641Z","updatedAt": "2021-03-25T18:01:13.371Z","__v": 3,"assigned_at": "2020-08-04T10:25:26.059Z","channelOutbound": {"name": "chat21"},"_snapshot": {"agents": [{"id_user": "5aaa99024c3b110014b478f0"}, {"id_user": "5ac7521787f6b50014e0b592"}, {"id_user": "5de9200d6722370017731969"}, { "id_user": "5e09d16d4d36110017506d7f"}]},"id": "5f29372d690e6f0034edf100","requester_id": "5f29372d690e6f0034edf0ff"}]}}'

        try {
          var json = JSON.parse(message.data);
          // var json = JSON.parse(test_due);
          // console.log('% »»» WebSocketJs - websocket onmessage JSON.parse(message.data) json payload', json.payload);
          // console.log('% »»» WebSocketJs - websocket onmessage JSON.parse(message.data) json payload topic', json.payload.topic);
          console.log('% »»» WebSocketJs - websocket onmessage JSON.parse(message.data) json ', json);
        } catch (e) {
          console.log('% »»» WebSocketJs WF ***  This doesn\'t look like a valid JSON: ', message.data);
          return;
        }

        // console.log('% »»» WebSocketJs - INIT > ON-MESSAGE action: ', json.action , ' message: ', json.payload.message)

        // -------------------
        // @ heartCheck
        // -------------------
        that.heartCheck();

        // --------------------------------------------------------------------------------------------------------------------
        // check the action and the message's text - if action is 'heartbeat' and text is ping send the PONG message and return
        // --------------------------------------------------------------------------------------------------------------------

        if (json.action == "heartbeat") {

          if (json.payload.message.text == "ping") {
            // nk 
            // console.log('% »»» WebSocketJs - RECEIVED PING -> SEND PONG  ')

            // -------------------
            // @ send PONG
            // -------------------
            // that.ws.send(JSON.stringify(that.pongMsg));
            that.send(JSON.stringify(that.pongMsg), 'ON-MESSAGE')

          } else {

            // nk
            // console.log('% »»» WebSocketJs - RECEIVED PONG -> NOTHING  ')
          }
          return;
        }

        var object = { event: json.payload, data: json };

        console.log("% »»» WebSocketJs WF *** - WsRequestsService - WebSocketJs onData object ", object);

        if (that.onData) {
          that.onData(json.payload.message, object);
        }

        var callbackObj = that.callbacks.get(object.event.topic);
        // console.log("% »»» WebSocketJs WF - WsRequestsService - WebSocketJs onData callbackObj ", callbackObj);
        if (callbackObj && callbackObj.onData) {
          // console.log("% »»» WebSocketJs WF - WsRequestsService - WebSocketJs onData json.payload.message ", json.payload.message);
          // console.log("% »»» WebSocketJs WF - WsRequestsService - WebSocketJs onData object ", object);
          callbackObj.onData(json.payload.message, object);
        }

        if (json && json.payload && json.payload.message && that.isArray(json.payload.message)) {

          json.payload.message.forEach(element => {
            // console.log("element", element);
            //let insUp = that.insertOrUpdate(element);
            let insUp = json.payload.method;
            console.log("% »»» WebSocketJs WF *** - insUp", insUp);

            var object = { event: json.payload, data: element };

            //console.log("% object.event.topic",object.event.topic);
            //console.log("% that.callbacks",that.callbacks);
            var callbackObj = that.callbacks.get(object.event.topic);

            // console.log("% »»» WebSocketJs - INIT callbackObj when array (1) ", callbackObj);
            if (insUp == "CREATE") {

              if (that.onCreate) {
                console.log("% »»» WebSocketJs WF *** - INIT > CREATE when array (general)");
                that.onCreate(element, object);
              }

              if (callbackObj) {

                callbackObj.onCreate(element, object);
                // console.log("% »»» WebSocketJs - INIT > CREATE when array (specific) callbackObj (2)", callbackObj);
              }
            }

            if (insUp == "UPDATE") {

              console.log('% »»» WebSocketJs WF *** - INIT > UPDATE  callbackObj when array (1)', callbackObj)

              if (that.onUpdate) {

                that.onUpdate(element, object);
                // console.log('% »»» WebSocketJs - INIT > UPDATE when array (general) onUpdate ', that.onUpdate(element, object));
              }

              if (callbackObj && callbackObj.onUpdate) {

                callbackObj.onUpdate(element, object);
                // console.log('% »»» WebSocketJs - INIT > UPDATE when array (specific) callbackObj (2)', callbackObj);
              }
            }
            //this.data.push(element);

            resolve({ element: element, object: object });
            // $('#messages').after(element.text + '<br>');
          });

        } else {
          //let insUp = that.insertOrUpdate(json.payload.message);
          let insUp = json.payload.method;
          // console.log("insUp", insUp);
          var object = { event: json.payload, data: json };
          var callbackObj = that.callbacks.get(object.event.topic);
          // console.log('% »»» WebSocketJs - INIT callbackObj when object (1)', callbackObj)

          if (insUp == "CREATE") {

            if (that.onCreate) {
              console.log("% »»» WebSocketJs WF *** - INIT > CREATE when object (general)");
              that.onCreate(json.payload.message, object);
            }

            if (callbackObj && callbackObj.onCreate) {
              callbackObj.onCreate(json.payload.message, object);
            }
          }

          if (insUp == "UPDATE") {
            console.log('% »»» WebSocketJs WF *** - INIT > UPDATE  when object callbackObj (1)', callbackObj)

            if (that.onUpdate) {
              // console.log('% »»» WebSocketJs - INIT > UPDATE when object (general)')
              that.onUpdate(json.payload.message, object);
            }

            if (callbackObj && callbackObj.onUpdate) {
              //  console.log("% »»» WebSocketJs - INIT > UPDATE when object (specific) callbackObj (2)", callbackObj);
              callbackObj.onUpdate(json.payload.message, object);
            }

          }

          resolve({ element: json.payload.message, object: object });
          // resolve:
          // $('#messages').after(json.text + '<br>');
        }
      }
    }); // .PROMISE
  }

  // !! not use this but the above close()
  closeWebsocket() {
    this.topics = [];
    this.callbacks = [];
    console.log('% »»» WebSocketJs WF - closeWebsocket  this.ws ', this.ws)
    // this.userHasClosed = true;
    // console.log('% »»» WebSocketJs WF - closeWebsocket this.userHasClosed ' , this.userHasClosed)
    if (this.ws) {
      this.ws.close();
      console.log('% »»» WebSocketJs WF - closeWebsocket ')
    }
  }




  isArray(what) {
    return Object.prototype.toString.call(what) === '[object Array]';
  }


}
