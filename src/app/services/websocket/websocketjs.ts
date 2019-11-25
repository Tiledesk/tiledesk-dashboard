
//import { Injectable } from '@angular/core';

//@Injectable()
export class WebSocketJs {

public url;
public onCreate;
public onUpdate;
public onOpen;
public ws;
public topics;
public callbacks;
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


//   sendMesagesInSendingArray() {
//       if (this.sendingMessages && this.sendingMessages.lenght>0) {
//         this.sendingMessages.forEach(msg => {
//             console.log(msg);
//             this.send(msg);
//         });
//       }
//   }
  ref (topic, onCreate, onUpdate) {
      console.log('% »»» WebSocketJs ****** CALLING REF ****** ');
      //this.callbacks.set(topic, {onCreate:onCreate, onUpdate:onUpdate});
      this.callbacks.set(topic, {onCreate:onCreate, onUpdate:onUpdate});
      console.log('% »»» WebSocketJs *** REF *** callbacks ', this.callbacks);
      this.subscribe(topic);
  }

  subscribe(topic) {
    console.log('% »»» WebSocketJs ****** CALLING SUBSCRIBE ****** ');
    //this.topics.set(topic,1);
    console.log('% »»» WebSocketJs ****** CALLING SUBSCRIBE ****** topic ', topic);
    
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

    this.send(str);
  }


  unsubscribe(topic) {
    console.log('% »»» WebSocketJs ****** CALLING UN-SUBSCRIBE ****** ');
    console.log("% »»» WebSocketJs *** UNSUBSCRIBE *** - topics array " , this.topics);

    console.log("% »»» WebSocketJs *** UNSUBSCRIBE *** - unsubcribe topic " , topic);
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

    this.send(str);
  }


  send(initialMessage) {
    console.log('% »»» WebSocketJs ****** CALLING SEND ****** ');
    this.ws.send(initialMessage);
  }

  
//   sendAfterConnected(initialMessage) {
      
//    this.sendingMessages.push(initialMessage);
//   }

  close () {
    console.log('% »»» WebSocketJs ****** CALLING CLOSE ****** ');
    this.ws.onclose = function () {}; // disable onclose handler first
    this.ws.close();
  }

  resubscribe() {
      console.log('% »»» WebSocketJs ****** CALLING RESUSCRIBE ****** ');
      console.log('% »»» WebSocketJs ****** CALLING RESUSCRIBE ****** TOPICS ', this.topics);
      console.log('% »»» WebSocketJs ****** CALLING RESUSCRIBE ****** TOPICS LENGTH ', this.topics.length );
      if (this.topics.length > 0) {
        this.topics.forEach(topic => {
          console.log('% »»» WebSocketJs *** RESUBSCRIBE *** topic ', topic);
          this.subscribe(topic);
        });
      }
  }

  init(url, onCreate, onUpdate, onOpen=undefined, onOpenCallback=undefined, _topics=[], _callbacks=new Map() ) {
    console.log('% »»» WebSocketJs ****** CALLING INIT ****** ');
    // console.log('% »»» WebSocketJs - INIT url ', url);
    console.log('% »»» WebSocketJs - INIT onCreate ', onCreate);
    console.log('% »»» WebSocketJs - INIT onUpdate ', onUpdate);
    console.log('% »»» WebSocketJs - INIT onOpen ', onOpen);
    console.log('% »»» WebSocketJs - INIT onOpenCallback ', onOpenCallback);
    this.url = url;
    this.onCreate = onCreate;
    this.onUpdate = onUpdate;
    this.onOpen = onOpen;
    this.topics = _topics//[];//new Map();
    this.callbacks = _callbacks// new Map();
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
                      /*
                      if (initialMessage) {
                        that.ws.send(initialMessage);
                      }*/
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
                      // https://stackoverflow.com/questions/3780511/reconnection-of-client-when-server-reboots-in-websocket
                      // Try to reconnect in 3 seconds
                      
                      setTimeout(function(){
                          //that.start(initialMessage)
                          that.init(url, onCreate, onUpdate, onOpen, function () {                        
                            that.resubscribe();
                          }, that.topics, that.callbacks);         
                        }, 3000);
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
                                   
                                    console.log('% »»» WebSocketJs - INIT > UPDATE  callbackObj when array (1)', callbackObj)
                                    
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
                                  // console.log('% »»» WebSocketJs - INIT > UPDATE  when object callbackObj (1)', callbackObj)
                                
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

  isArray(what) {
      return Object.prototype.toString.call(what) === '[object Array]';
  }

  
}
