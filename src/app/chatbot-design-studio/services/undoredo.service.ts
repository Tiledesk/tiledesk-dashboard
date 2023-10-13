// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class UndoredoService {

//   constructor() { }

//   /************************************************
//    * UNDO / REDO
//    * 
//    * 
//   /************************************************/

//   public addIntentToUndoRedo(type, intent, intentsToUpdateUndo, intentsToUpdateRedo){ // intent_id_chiamante
//     let typeUNDO = type;
//     let typeREDO = type;
//     if(type === 'PUSH'){typeUNDO = 'DEL';}
//     if(type === 'DEL'){typeUNDO = 'PUSH';}
//     let pos =  this.listOfIntents.findIndex((element) => { return element.intent_id === intent.intent_id });
//     if(!pos || pos <0)pos = this.listOfIntents.length;
//     let UNDO = this.setUndoRedoObject(type, typeUNDO, typeREDO, pos, intent, intentsToUpdateUndo, intentsToUpdateRedo);
//     this.arrayUNDO.push(UNDO);
//     console.log('[INTENT SERVICE] -> AGGIUNGO ', UNDO, this.arrayUNDO );
//     // this.arrayUNDO = this.arrayUNDO.slice(10);
//     this.arrayREDO = [];
//   }


//   setUndoRedoObject(type, typeUNDO, typeREDO, pos, intent, intentsToUpdateUndo, intentsToUpdateRedo){
//     let obj = {
//       type: type,
//       pos: pos,  
//       undo:{
//         type: typeUNDO,
//         intent: JSON.parse(JSON.stringify(intent)),
//         intentsToUpdate: intentsToUpdateUndo,
//       },
//       redo:{
//         type: typeREDO,
//         intent: JSON.parse(JSON.stringify(intent)),
//         intentsToUpdate: intentsToUpdateRedo,
//       }
//     }
//     console.log('[INTENT SERVICE] -> setUndoRedoObject', obj);
//     return obj;
//   }

//   async restoreLastUNDO(){
//     console.log('[INTENT SERVICE] -> restoreLastUNDO', this.arrayUNDO);
//     if(this.arrayUNDO && this.arrayUNDO.length>0){
//       const objUNDO = this.arrayUNDO.pop();
//       this.arrayREDO.push(JSON.parse(JSON.stringify(objUNDO)));
//       console.log('[INTENT SERVICE] -> RESTORE UNDO: ', objUNDO);
//       this.restoreIntent(objUNDO.pos, objUNDO.undo);
//       console.log('[INTENT SERVICE] -> ho aggiornato gli array dopo UNDO ', this.arrayUNDO, this.arrayREDO);
//     }
//   }

//   public restoreLastREDO(){
//     console.log('[INTENT SERVICE] -> restoreLastREDO', this.arrayREDO);
//     if(this.arrayREDO && this.arrayREDO.length>0){
//       const objREDO = this.arrayREDO.pop();
//       this.arrayUNDO.push(JSON.parse(JSON.stringify(objREDO)));
//       console.log('[INTENT SERVICE] -> RESTORE REDO: ', objREDO);
//       this.restoreIntent(objREDO.pos, objREDO.redo);
//       console.log('[INTENT SERVICE] -> ho aggiornato gli array dopo REDO ', this.arrayUNDO, this.arrayREDO);
//     }
//   }



//   async restoreIntent(pos, object){
//     const restoreAction = object.type;
//     const intent = object.intent;
//     const intentsToUpdate = object.intentsToUpdate;
//     console.log('[INTENT SERVICE] -> restoreAction : typeAction:', object, object.intentsToUpdate);
    
    
//     if(restoreAction == 'DEL'){
//       this.deleteIntentToListOfIntents(intent.intent_id);
//       this.connectorService.deleteConnectorByToId(intent.intent_id); // elimina i connettori e salva!
//       intentsToUpdate.forEach(element => {
//         console.log('[INTENT SERVICE] -> REPLACE ', element);
//         this.listOfIntents = this.replaceIntent(element, this.listOfIntents);
//         this.connectorService.deleteConnectorsOutOfBlock(element.intent_id);
//         this.updateIntent(element);
//       });
//       this.refreshIntents();
//       this.deleteIntent(intent);
//       setTimeout(() => {
//         this.connectorService.createConnectors(this.listOfIntents);
//       }, 100);
//       return;
//     } 
    
//     if(restoreAction == 'PUSH'){
//       this.listOfIntents = this.insertItemIntoPositionInTheArray(this.listOfIntents, intent, pos);
//       intentsToUpdate.forEach(element => {
//         console.log('[INTENT SERVICE] -> REPLACE ', element);
//         this.listOfIntents = this.replaceIntent(element, this.listOfIntents);
//         this.connectorService.deleteConnectorsOutOfBlock(element.intent_id);
//         // this.createConnectors(element); // crea i connettori e salva
//         this.updateIntent(element);
//         this.connectorService.createConnectors(this.listOfIntents);
//       });
//       console.log('[INTENT SERVICE] -> UPDATED ', this.listOfIntents);
//       let isOnTheStage = await this.isElementOnTheStage(intent.intent_id);
//       console.log('[INTENT SERVICE] -> restoreAction', isOnTheStage, intent.intent_id);
//       if(isOnTheStage){
//         this.connectorService.createConnectorsOfIntent(intent);
//       }
//       this.refreshIntents();
//       this.saveNewIntent(intent);

//       setTimeout(() => {
//         this.connectorService.createConnectors(this.listOfIntents);
//       }, 100);
//       return;
//     }

//     if(restoreAction == 'PUT'){ 
//       // console.log('[INTENT SERVICE] -> PUT intentsToUpdate: ', intentsToUpdate);
//       intentsToUpdate.forEach(obj => {
//         console.log('[INTENT SERVICE] -> PUT ', obj);
//         let intent = this.listOfIntents.find((intent) => intent.intent_id === obj.intent_id);
//         if(JSON.stringify(obj) !== JSON.stringify(intent)){
//           console.log('[INTENT SERVICE] -> CONFRONTO ', obj);
//           // this.connectorService.deleteConnectorsOutOfBlock(obj);
//           this.listOfIntents = this.replaceIntent(obj, this.listOfIntents);
//           this.updateIntent(obj);
//           this.connectorService.updateConnector(obj.intent_id);
//           setTimeout(() => {
//             this.connectorService.createConnectors(this.listOfIntents);
//           }, 100);
//         }
//         this.setDragAndListnerEventToElement(obj);
//       });
//       // this.listOfIntents = this.replaceIntent(intent, this.listOfIntents);
//       // this.setDragAndListnerEventToElement(intent);
//       this.refreshIntents();
//     } 

    
   
//   }


//   // finds all instances of the element in the object
  
//   // private findsAllElementsInObject(obj, elements) {
//   //   for (const chiave in obj) {
//   //     console.log('[INTENT SERVICE] -> chiave', chiave);
//   //     if (typeof obj[chiave] === 'object') {
//   //       this.findsAllElementsInObject(obj[chiave], elements);
//   //     } else if (chiave === 'buttons') {
//   //       elements.push(obj[chiave]);
//   //     }
//   //   }
//   // }

// // Funzione per trovare tutti gli oggetti "buttons" in modo ricorsivo
// private findsAllElementsInObject(obj) {
//   let buttonsArray = [];
//   for (const key in obj) {
//     if (key === 'buttons') {
//       buttonsArray = buttonsArray.concat(obj[key]);
//     } else if (Array.isArray(obj[key])) {
//       obj[key].forEach((item) => {
//         buttonsArray = buttonsArray.concat(this.findsAllElementsInObject(item));
//       });
//     } else if (typeof obj[key] === 'object') {
//       buttonsArray = buttonsArray.concat(this.findsAllElementsInObject(obj[key]));
//     }
//   }
//   return buttonsArray;
// }


// private createConnectors(intent){
//   console.log('[INTENT SERVICE] -> createConnectors', intent);
  
//   intent.actions.forEach(element => {
//     if(element._tdActionType == 'intent'){
//       console.log('[INTENT SERVICE] -> createConnectors', element._tdActionType);
//       if(element.intentName){
//         const toId = element.intentName.replace("#", "");
//         const fromId = intent.intent_id+'/'+element._tdActionId;
//         console.log("creato connector:",  toId, fromId);
//         this.connectorService.createConnectorFromId(fromId, toId);
//       }
//     }

//     if(element._tdActionType == 'reply'){
//       console.log('[INTENT SERVICE] -> createConnectors element:', element);
//       let buttons = this.findsAllElementsInObject(element);
//       console.log("creato connector: btn", buttons);
//       buttons.forEach(btn => {
//         // if (btn.type === TYPE_BUTTON.ACTION &&  btn.__isConnected === true && btn.__idConnector){
//         //   // this.changeActionReply.emit();
//         // } 


//         // const toId = element.intentName.replace("#", "");
//         // const fromId = intent.intent_id+'/'+element._tdActionId;
//         // console.log("creato connector:",  toId, fromId);
//         // this.connectorService.createConnectorFromId(fromId, toId);
//       });
//     }
//       // // ADD / EDIT
//       // // buttonChanged.__isConnected = true;
//       // buttonChanged.__idConnector = this.connector.fromId;
//       // buttonChanged.action = buttonChanged.action? buttonChanged.action : '#' + this.connector.toId;
//       // buttonChanged.type = TYPE_BUTTON.ACTION;
//       // console.log(' updateConnector :: ', this.buttons);
//       // if(!buttonChanged.__isConnected){
//       //   buttonChanged.__isConnected = true;
//       //   this.updateIntentFromConnectorModification.emit(this.connector.id);
//       //   // this.changeActionReply.emit();
//       // } 
        
//         // this.changeActionReply.emit();
    
//   });



//   // setTimeout(() => {
//   //   // this.connectorService.deleteConnectorsOutOfBlock(element.intent_id);
//   //   const connettoriPieni = this.trovaEstraiConnettori(element.intent_id, true);
//   //   // const connettoriVuoti = this.trovaEstraiConnettori(element.intent_id, false);
//   //   // connettoriVuoti.forEach(element => {
//   //   // });
//   //   connettoriPieni.forEach(element => {
//   //     // Dividi la stringa sull'ultimo "/"
//   //     const split = element.split('/').slice(0, -1);
//   //     const fromId = split[0];
//   //     const toId = element.substr(element.lastIndexOf('/') + 1);
//   //     // parti conterrà tutte le parti della stringa tranne l'ultima
//   //     console.log("Parti della stringa escluendo l'ultimo slash:", fromId);
//   //     // ultimoSlash conterrà l'ultima parte della stringa
//   //     console.log("Ultimo slash:", toId);
//   //     this.connectorService.createConnectorFromId(fromId, toId);
//   //   });
//   // }, 0);
// }

//   private insertItemIntoPositionInTheArray(array, item, pos = array.length) {
//     if (pos < 0 || pos > array.length) {
//       console.error("ERROR invalid position.");
//       // return;
//       pos = array.length;
//     }
//     array.splice(pos, 0, item);
//     return array;
//   }

//   private async isElementOnTheStage(id): Promise<boolean>{
//     return new Promise((resolve) => {
//       let intervalId = setInterval(async () => {
//         const result = document.getElementById(id);
//         if (result) {
//           clearInterval(intervalId);
//           resolve(true);
//         }
//       }, 100);
//       setTimeout(() => {
//         clearInterval(intervalId);
//         resolve(false);
//       }, 2000);
//     });
//   }


//   trovaEstraiConnettori(intent_id, isConnected) {
//     let className = '.point-connector-empty';
//     if(isConnected) className = '.isConnected';
//     let  idConnettori = [];
//     const cdsIntentElement = document.querySelector(`cds-intent[id="${intent_id}"]`);
//     if(!cdsIntentElement)return;
//     const connettori = cdsIntentElement.querySelectorAll('cds-connector');
//     connettori.forEach((connettore) => {
//       const pointConnectorElements = connettore.querySelector(className);
//       if(pointConnectorElements)idConnettori.push(pointConnectorElements.id);
//     });
//     console.log('[INTENT SERVICE] -> CONNETTORI::::: Connessi:', isConnected, idConnettori);
//     return idConnettori;
    
//   }

//   private replaceIntent(intent, listOfIntents){
    
//     for (let i = 0; i < listOfIntents.length; i++) {
//       console.log('[INTENT SERVICE] -> replaceIntent:', intent.intent_id, listOfIntents[i].intent_id);
//       if (listOfIntents[i].intent_id == intent.intent_id) {
//         listOfIntents[i] = intent;
//         console.log('[INTENT SERVICE] -> SOSTITUISCO:', intent);
//         break;
//       }
//     }
//     return listOfIntents;
//   }
//   /************************************************/
// }
