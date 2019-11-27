
//import { Injectable } from '@angular/core';


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
public userHasClosed: boolean;

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
   
    console.log("WebSocketJs constructor");
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
  ref (topic, onCreate, onUpdate, onData) {
      console.log('% »»» WebSocketJs ****** CALLING REF ****** ');
      //this.callbacks.set(topic, {onCreate:onCreate, onUpdate:onUpdate});
      this.callbacks.set(topic, {onCreate:onCreate, onUpdate:onUpdate, onData: onData});

      console.log('% »»» WebSocketJs WF *** REF *** callbacks *** ', this.callbacks);
      console.log('% »»» WebSocketJs WF *** REF *** topic ***', topic);
      console.log('% »»» WebSocketJs WF *** REF *** this.topics ***', this.topics);
      // console.log('% »»» WebSocketJs WF *** REF *** READY STATE *** ws.readyState ', this.ws.readyState);
      // console.log('% »»» WebSocketJs WF *** REF *** READY STATE *** this.readyState ', this.readyState);
       
      if (this.ws && this.ws.readyState == 1) {
        
         console.log('% »»» WebSocketJs WF *** REF *** READY STATE 2 ', this.ws.readyState)
         this.subscribe(topic);

        } else {

        var that = this;

        if(this.ws) {
          this.ws.addEventListener("open", function(event) {
    
            console.log('% »»» WebSocketJs WF *** REF *** OPEN EVENT *** ', event);
            that.subscribe(topic);
    
          });

        }
       }


  }

  subscribe(topic) {
    console.log('% »»» WebSocketJs ****** CALLING SUBSCRIBE ****** ');
    //this.topics.set(topic,1);
    console.log('% »»» WebSocketJs ****** CALLING SUBSCRIBE ****** to topic ', topic);
    
    if (this.topics.indexOf(topic) === -1) { 
      this.topics.push(topic);
    }
    console.log("% »»» WebSocketJs *** SUBSCRIBE *** topics " , this.topics);

    var message = {
        action: 'subscribe',
        payload: {
          //topic: '/' + project_id + '/requests',
          topic:topic,
          message: undefined,
          method: undefined
        },
      };
      var str = JSON.stringify(message);
      console.log("%% str " + str);

    this.send(str , `calling method - SUBSCRIBE to ${topic}`);
  }


  unsubscribe(topic) {
    console.log('% »»» WebSocketJs WF ****** CALLING UN-SUBSCRIBE ****** ');
    console.log("% »»» WebSocketJs WF *** UNSUBSCRIBE *** - this.topics " , this.topics);
    console.log("% »»» WebSocketJs WF *** UNSUBSCRIBE *** - topic " , topic);
    console.log("% »»» WebSocketJs WF *** UNSUBSCRIBE *** - callbacks " , this.callbacks);
    //this.topics.delete(topic);

    var index = this.topics.indexOf(topic);
    // console.log("% »»» WebSocketJs *** UNSUBSCRIBE *** - topic  (1C)" , topic, ' index ', index);
    if (index > -1) {
        this.topics.splice(index, 1);
    }

     console.log("% »»» WebSocketJs *** UNSUBSCRIBE *** - topics after splice " , this.topics);
    
    this.callbacks.delete(topic);
    console.log("% »»» WebSocketJs *** UNSUBSCRIBE *** - callback after delete " , this.callbacks);

    var message = {
        action: 'unsubscribe',
        payload: {
          //topic: '/' + project_id + '/requests',
          topic:topic,
          message: undefined, 
          method: undefined
        },
      };
      var str = JSON.stringify(message);
      console.log("%% str " + str);
    
    this.send(str , `calling method - UNSUSCRIBE from ${topic}`);
  }


  send(initialMessage, calling_method) {
    console.log('% »»» WebSocketJs WF ****** CALLING SEND ****** ', calling_method);
    this.ws.send(initialMessage);
  }


  close () {
    console.log('% »»» WebSocketJs ****** CALLING CLOSE ****** ');
    this.ws.onclose = function () {}; // disable onclose handler first
    this.ws.close();
  }

  resubscribe() {
      console.log('% »»» WebSocketJs ****** CALLING RESUBSCRIBE ****** ');
      console.log('% »»» WebSocketJs ****** CALLING RESUBSCRIBE ****** TOPICS ', this.topics);
      console.log('% »»» WebSocketJs ****** CALLING RESUBSCRIBE ****** CALLBACKS  444 ', this.callbacks); 
      console.log('% »»» WebSocketJs ****** CALLING RESUBSCRIBE ****** TOPICS LENGTH ', this.topics.length );
      if (this.topics.length > 0) {
        this.topics.forEach(topic => {
          console.log('% »»» WebSocketJs *** RESUBSCRIBE *** to topic ', topic);
          this.subscribe(topic);
        });
      }
  }

  init(url, onCreate, onUpdate, onData, onOpen=undefined, onOpenCallback=undefined, _topics=[], _callbacks=new Map()) {
    console.log('% »»» WebSocketJs WF ****** CALLING INIT ****** ');
    // console.log('% »»» WebSocketJs - INIT url ', url);
    console.log('% »»» WebSocketJs - INIT onCreate ', onCreate);
    console.log('% »»» WebSocketJs - INIT onUpdate ', onUpdate);
    console.log('% »»» WebSocketJs - INIT onOpen ', onOpen);
    console.log('% »»» WebSocketJs - INIT onOpenCallback ', onOpenCallback);
    this.url = url;
    this.onCreate = onCreate;
    this.onUpdate = onUpdate;
    this.onData = onData;
    this.onOpen = onOpen;
    this.topics = _topics//[];//new Map();
    this.callbacks = _callbacks// new Map();
    this.userHasClosed = false;
    console.log('% »»» WebSocketJs WF - closeWebsocket this.userHasClosed ' , this.userHasClosed)
    // this.sendingMessages = [];//new Map();
   // this.data = [];
   // this.init(this.sendMesagesInSendingArray);
   console.log('% »»» WebSocketJs - INIT topics ', this.topics);
    
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
                  
                  // 'ws://localhost:40510'
                  that.ws = new WebSocket(that.url);
                  // var ws = new WebSocket(that.url, options);
                  that.ws.onopen = function (e) {
                     console.log('% »»» WebSocketJs - websocket is connected ...', e);
                    
                    //   that.readyState = e.currentTarget['readyState'];                    
                    //   console.log('% »»» WebSocketJs WF *** ONPEN *** READY STATE *** ws.readyState ', that.ws.readyState);
                    //   readyState(that.readyState);                    
                    //   console.log('% »»» WebSocketJs WF - readyState ', that.readyState); 

                    //  console.log('% »»» WebSocketJs WF - onOpenCallback ', onOpenCallback);
                    //  console.log('% »»» WebSocketJs WF - that.onOpen ', that.onOpen);
                      
                    
                      /*
                      if (initialMessage) {
                        that.ws.send(initialMessage);
                      }
                      */

                     // ws.send('connected')
                     if (onOpenCallback){
                        onOpenCallback();
                     }
                     if (that.onOpen) {
                         that.onOpen();
                     }
                  }


                  that.ws.onclose = function (e) {
                      console.log('% »»» WebSocketJs - websocket IS CLOSED ... Try to reconnect in 5 seconds ', e);
                      
                      console.log('% »»» WebSocketJs - websocket onclose this.userHasClosed ', that.userHasClosed);
                      // https://stackoverflow.com/questions/3780511/reconnection-of-client-when-server-reboots-in-websocket
                      // Try to reconnect in 3 seconds
                      if (that.userHasClosed === false) {

                        setTimeout(function(){
                          //that.start(initialMessage)
                          that.init(url, onCreate, onUpdate,onData, onOpen, function () {                        
                            that.resubscribe();
                          }, that.topics, that.callbacks);         
                        }, 3000);

                      }
                  }

                  that.ws.onerror = function () {
                      console.log('% »»» WebSocketJs - websocket error ...')
                  }

                  that.ws.onmessage = function(message) {   
                      console.log('% »»» WebSocketJs - websocket onmessage ',message);

                     
                          try {
                              var json = JSON.parse(message.data);
                          } catch (e) {
                              console.log('This doesn\'t look like a valid JSON: ',
                                  message.data);
                                  return;
                              // return reject('This doesn\'t look like a valid JSON: ',
                              //         message.data);
                          }
                          
                          console.log('% »»» WebSocketJs - INIT > onmessage  callbackObj json.payload.message', json.payload.message)
                         
                          var object = {event: json.payload, data: json};
                          if (that.onData) {                            
                            // console.log("% »»» WebSocketJs - INIT > CREATE when array (general)");
                            that.onData(json.payload.message, object);
                          }
                          var callbackObj = that.callbacks.get(object.event.topic);
                          if (callbackObj && callbackObj.onData) {
                            callbackObj.onData(json.payload.message, object);
                          }


                          if (json && json.payload  && json.payload.message && that.isArray(json.payload.message)) {
                            json.payload.message.forEach(element => {
                               // console.log("element", element);
                                //let insUp = that.insertOrUpdate(element);
                                let insUp = json.payload.method;
                                console.log("insUp",insUp);

                                var object = {event: json.payload, data: element};
                                
                                //console.log("% object.event.topic",object.event.topic);
                                //console.log("% that.callbacks",that.callbacks);
                                var callbackObj = that.callbacks.get(object.event.topic);
                                
                                // console.log("% »»» WebSocketJs - INIT callbackObj when array (1) ", callbackObj);
                                
                                if (insUp=="CREATE") {
                                   
                                    if (that.onCreate) {
                                      // console.log("% »»» WebSocketJs - INIT > CREATE when array (general)");
                                      that.onCreate(element, object);
                                    }
                                    

                                     if (callbackObj) {
                                        
                                        callbackObj.onCreate(element, object);
                                        // console.log("% »»» WebSocketJs - INIT > CREATE when array (specific) callbackObj (2)", callbackObj);
                                    }
                                }
                                if (insUp=="UPDATE" ) {
                                   
                                    console.log('% »»» WebSocketJs WF - INIT > UPDATE  callbackObj when array (1)', callbackObj)
                                    
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
                                
                                 resolve({element:element, object:object});
                                // $('#messages').after(element.text + '<br>');
                            });
                        } else {
                            //let insUp = that.insertOrUpdate(json.payload.message);
                          let insUp = json.payload.method;                                                                                                                                                                                                                         
                              console.log("insUp",insUp);     

                            var object = {event: json.payload, data: json};

                            var callbackObj = that.callbacks.get(object.event.topic);
                            // console.log('% »»» WebSocketJs - INIT callbackObj when object (1)', callbackObj)
                            
                            if (insUp=="CREATE" ) {

                                if (that.onCreate) {
                                    // console.log("% »»» WebSocketJs - INIT > CREATE when object (general)");
                                    that.onCreate(json.payload.message, object);
                                }
                                
                                if (callbackObj && callbackObj.onCreate) {


                                    callbackObj.onCreate(json.payload.message, object);
                                }
                            }
                            if (insUp=="UPDATE") {
                                  console.log('% »»» WebSocketJs WF - INIT > UPDATE  when object callbackObj (1)', callbackObj)

                                
                                  if (that.onUpdate) {

                                  // console.log('% »»» WebSocketJs - INIT > UPDATE when object (general)')
                                   that.onUpdate(json.payload.message, object);
                                }
                                
                                if (callbackObj && callbackObj.onUpdate) {
                                  //  console.log("% »»» WebSocketJs - INIT > UPDATE when object (specific) callbackObj (2)", callbackObj);
                                    callbackObj.onUpdate(json.payload.message, object);
                                }

                            }
                             resolve({element:json.payload.message, object:object});
                            // resolve:
                            // $('#messages').after(json.text + '<br>');
                        }

                  }    
                
                  
      });

  }

  closeWebsocket() {

    this.topics = [];
    this.callbacks = [];

    console.log('% »»» WebSocketJs WF - closeWebsocket  this.ws ' ,this.ws)
    this.userHasClosed = true;
    console.log('% »»» WebSocketJs WF - closeWebsocket this.userHasClosed ' , this.userHasClosed)
    if (this.ws) {
      this.ws.close();
      console.log('% »»» WebSocketJs WF - closeWebsocket ')
    }

  }




  isArray(what) {
      return Object.prototype.toString.call(what) === '[object Array]';
  }

  
}
