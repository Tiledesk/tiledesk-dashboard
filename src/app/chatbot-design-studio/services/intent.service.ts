import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';


import { 
  Intent, 
  ActionReply, 
  ActionAgent,
  ActionAssignFunction, 
  ActionAssignVariable,
  ActionChangeDepartment,
  ActionClose,
  ActionDeleteVariable,
  ActionEmail, 
  ActionHideMessage, 
  ActionIntentConnected,
  ActionJsonCondition,
  ActionOnlineAgent,
  ActionOpenHours,
  ActionRandomReply,
  ActionReplaceBot,
  ActionWait,
  ActionWebRequest,
  Command, Wait, Message, Expression, Attributes, Action, ActionAskGPT, ActionWhatsappAttribute, ActionWhatsappStatic } from 'app/models/intent-model';
import { FaqService } from 'app/services/faq.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { NEW_POSITION_ID, TYPE_ACTION, TYPE_COMMAND, removeNodesStartingWith } from 'app/chatbot-design-studio/utils';
import { ConnectorService } from 'app/chatbot-design-studio/services/connector.service';


/** CLASSE DI SERVICES PER TUTTE LE AZIONI RIFERITE AD OGNI SINGOLO INTENT **/

@Injectable({
  providedIn: 'root'
})
export class IntentService {
  idBot: string;
  behaviorIntents = new BehaviorSubject <Intent[]>([]);
  behaviorIntent = new BehaviorSubject <Intent>(null);
  liveActiveIntent = new BehaviorSubject<Intent>(null);

  listOfIntents: Array<Intent> = [];
  selectedIntent: Intent;
  listActions: Array<Action>;
  selectedAction: Action;

  actionSelectedID: string;
  intentSelectedID: string;

  previousIntentId: string = '';
  preDisplayName: string = 'untitled_block_';
  
  botAttributes: any = {};
  listOfPositions: any = {};

  setTimeoutChangeEvent: any

  // newPosition: any = {'x':0, 'y':0};
  

  private changedConnector = new Subject<any>();
  public isChangedConnector$ = this.changedConnector.asObservable();

  constructor(
    private faqService: FaqService,
    private faqKbService: FaqKbService,
    private connectorService: ConnectorService
  ) { }


  /**
   * onChangedConnector
   * funzione chiamata sul 'connector-created', 'connector-deleted'
   * per notificare alle actions che i connettori sono cambiati
   */
  public onChangedConnector(connector){
    console.log('onChangedConnector:: ', connector);
    this.changedConnector.next(connector);
  }


  public setIntentSelected(intent){
    this.selectedIntent = intent;
  }

  public setLiveActiveIntent(intentName: string){
    let intent = this.listOfIntents.find((intent) => intent.intent_display_name === intentName);
    this.liveActiveIntent.next(intent)
  }

  /** setDragAndListnerEvent */
  public setListnerEvent(intent) {
    let that = this;
    let elem = document.getElementById(intent.intent_id);
    if(elem){
      const panelIntentContent = elem.getElementsByClassName('panel-intent-content')[0];
      const picHeader = panelIntentContent.getElementsByClassName('pic-header')[0];
      if(picHeader){
        console.log("imposto il listner per la selezione/deselezione dell'elemento ");
        // **************** !!!!!!!! aggiungo listner !!!!!!! *******************//
        // Aggiungi l'event listener con i parametri
        // console.log("2.1 --- hasListenerMouseup -> ", elem.dataset.hasListenerMouseup ,intent.intent_id);
        if (elem.dataset.hasListenerMouseup !== 'true') {
          picHeader.addEventListener('mouseup', function () {
            elem.dataset.hasListenerMouseup = 'true';
            that.onMouseUpIntent(intent, elem);
          });
        }
        // Aggiungi l'event listener con i parametri
        // console.log("2.2 --- hasListenerMousedown -> ",elem.dataset.hasListenerMousedown, intent.intent_id);
        if (elem.dataset.hasListenerMousedown !== 'true') {
          picHeader.addEventListener('mousedown', function () {
            elem.dataset.hasListenerMousedown = 'true';
            that.onMouseDownIntent(elem);
          });
        }
        // Aggiungi l'event listener con i parametri
        // console.log("2.3 --- hasListenerMousemove -> ",elem.dataset.hasListenerMousemove, intent.intent_id);
        if (elem.dataset.hasListenerMousemove !== 'true') {
          picHeader.addEventListener('mousemove', function () {
            elem.dataset.hasListenerMousemove = 'true';
            that.onMouseMoveIntent(elem);
          });
        }
      }
    }
  }

  /** */
  onMouseDownIntent(element): void {
    // console.log("onMouseDownIntent:  element: ",element);
    const x = element.offsetLeft;
    const y = element.offsetTop;
    element.style.zIndex = 2;
  }

  /** */
  onMouseUpIntent(intent: any, element: any) {
    console.log("onMouseUpIntent: ", intent, " element: ", element);
    let newPos = { 'x': element.offsetLeft, 'y': element.offsetTop };
    let pos = intent.attributes.position; // this.intentService.getIntentPosition(intent.id);
    if (newPos.x != pos.x || newPos.y != pos.y) {
      element.style.zIndex = '1';
      // console.log("setIntentPosition x:", newPos.x, " y: ",newPos.y);
      this.setIntentPosition(intent.id, newPos);
    }
  }

  /** */
  onMouseMoveIntent(element: any) {
  }


  /** 
   * restituisce tutti gli intents
   */
  getIntents() {
    console.log('getIntents: ',  this.behaviorIntents);
    return this.behaviorIntents.asObservable();
  }



  // START DASHBOARD FUNCTIONS //

  // //** recupero le posizioni degli intent sullo stage */
  // setDashboardAttributes(idBot, attributes){
  //   this.botAttributes = attributes;
  //   this.idBot = idBot;
  //   if(attributes && attributes['positions']){
  //     this.listOfPositions = attributes['positions'];
  //   }
  // }


  // /** imposta le posizioni degli elementi sullo stage */
  // setPositionsInDashboardAttributes(json){
  //   this.listOfPositions = json;
  //   this.botAttributes['positions'] = this.listOfPositions;
  //   // this.patchAttributes(this.botAttributes);
  // }


  refreshIntents(){
    console.log("aggiorno elenco intent")
    this.behaviorIntents.next(this.listOfIntents);
  }

  refreshIntent(intentSelected){
    console.log("aggiorno singolo intent")
    this.behaviorIntent.next(intentSelected);
  }
  

  /** setPreviousIntentId
   * imposta quello che è l'intent di partenza quando inizia un drag su una action dell'intent 
   * */
  setPreviousIntentId(intentId){
    // this.intentSelected = intent;
    this.previousIntentId = intentId;
  }

  getPreviousIntent(){
    console.log("getPreviousIntent: ", this.listOfIntents, this.previousIntentId)
    return this.listOfIntents.find((intent) => intent.intent_id === this.previousIntentId);
  }



  // /** Get Intent position */    
  // OLD_getIntentPosition(id: string){
  //   let pos = {'x':0, 'y':0};
  //   const positions = this.listOfPositions;
  //   if(!positions)return pos;
  //   if(positions && positions[id]){
  //     return positions[id];
  //   }
  //   return pos;
  // }

  getIntentPosition(intentId: string){
    let pos = {'x':0, 'y':0};
    let intent = this.listOfIntents.find((intent) => intent.id === intentId);
    // console.log('getIntentPosition intentId: ', intentId, intent);
    if(!intent || !intent.attributes || !intent.attributes.position)return pos;
    return intent.attributes.position;
    
  }

  // /** Set intent position */
  // OLD_setIntentPosition(id:string, newPos: any){
  //   const positions = this.listOfPositions;
  //   if(positions){
  //     if(!newPos && positions[id]){
  //       delete positions[id];
  //     } else {
  //       positions[id] =  {'x': newPos.x, 'y': newPos.y};
  //     }
  //     this.setPositionsInDashboardAttributes(positions);
  //   }
  // }

  setIntentPosition(intentId:string, newPos: any){
    console.log('setIntentPosition:: ',intentId, newPos);
    // this.listOfIntents = this.behaviorIntents.getValue();
    let intentToUpdate = this.listOfIntents.find((intent) => intent.id === intentId);
    if(!intentToUpdate)return; 
    // if(!intentToUpdate.attributes){intentToUpdate.attributes = {};
    intentToUpdate['attributes']['position'] = {'x': newPos.x, 'y': newPos.y};
    this.patchAttributes(intentId, intentToUpdate.attributes);
  }
  // END DASHBOARD FUNCTIONS //

  


  // START INTENT FUNCTIONS //

  /** GET ALL INTENTS  */
  public async getAllIntents(id_faq_kb): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.faqService._getAllFaqByFaqKbId(id_faq_kb).subscribe((faqs: Intent[]) => {
        // console.log('getAllIntents: ', faqs);
        if (faqs) {
          this.listOfIntents = JSON.parse(JSON.stringify(faqs));;
          // this.behaviorIntents.next(this.listOfIntents);
        } else {
          // console.log('EMPTY: ', faqs);
          this.listOfIntents = [];
          // this.behaviorIntents.next([]);
        }
        resolve(true);
      }, (error) => {
        console.error('ERROR: ', error);
        reject(false);
      }, () => {
        console.log('COMPLETE ');
        resolve(true);
      });
    });
  }


  /** create a new intent when drag an action on the stage */
  public createNewIntent(id_faq_kb: string, action: any, pos:any){
    let intent = new Intent();
    intent.id_faq_kb = id_faq_kb;
    intent.attributes.position = pos;
    intent.intent_display_name = this.setDisplayName();
    intent.actions.push(action);
    console.log("ho creato un nuovo intent contenente l'azione ", action, " in posizione ", pos);
    return intent;
  }

  /** generate display name of intent */
  public setDisplayName(){
    // let listOfIntents = this.behaviorIntents.getValue();
    const filteredArray = this.listOfIntents.filter((element) => element.intent_display_name.startsWith(this.preDisplayName));
    if(filteredArray.length>0){
      const lastElement = filteredArray.slice(-1)[0];
      const intent_display_name = parseInt(lastElement.intent_display_name.substring(this.preDisplayName.length));
      return this.preDisplayName+(intent_display_name+1);
    } else {
      return this.preDisplayName+1;
    }
  }
  
  /** save a New Intent, created on drag action on stage */
  public async saveNewIntent(id_faq_kb, newIntent): Promise<any> { 
    // let newIntents = this.intents.getValue();
    // newIntents.push(newIntent); 
    // console.log("Aggiungo un intent all'array in ultima posizione con id fake");
    return new Promise((resolve, reject) => {
      // let questionIntentSelected = newIntent.question;
      // let answerIntentSelected = newIntent.answer;
      // let displayNameIntentSelected = newIntent.intent_display_name;
      // let formIntentSelected = newIntent.form;
      // let actionsIntentSelected = newIntent.actions;
      // let webhookEnabledIntentSelected = newIntent.webhook_enabled;
      // let attributes = newIntent.attributes;
      const that = this;
      this.faqService.addIntent(
        id_faq_kb,
        newIntent.attributes,
        newIntent.question,
        newIntent.answer,
        newIntent.intent_display_name,
        newIntent.intent_id,
        newIntent.form,
        newIntent.actions,
        newIntent.webhook_enabled
      ).subscribe((intent:any) => {
        // console.log("addIntent: sostituisto l'ultimo elemento dell'array aggiunto in precedenza, con quello salvato con un id valido");
        // this.listOfIntents[this.listOfIntents.length-1] = intent;
        // this.behaviorIntents.next(this.listOfIntents);
        console.log("ho salvato in remoto l'intent ", intent.id);
        resolve(intent);
      }, (error) => {
        console.error('ERROR: ', error);
        reject(false);
      }, () => {
        // console.log('COMPLETE ');
        resolve(false);
      });
    });
  }





  /** updateIntent */
  public async updateIntent(originalIntent: Intent): Promise<boolean> { 
    let intent = JSON.parse(JSON.stringify(originalIntent));
    intent = removeNodesStartingWith(intent, '__');

    return new Promise((resolve, reject) => {
      let id = intent.id;
      let attributes = intent.attributes?intent.attributes:{};
      let questionIntent = intent.question?intent.question:'';
      let answerIntent = intent.answer?intent.answer:'';
      let displayNameIntent = intent.intent_display_name?intent.intent_display_name:'';
      let formIntent = {};
      if (intent.form !== null) {
        formIntent = intent.form;
      }
      let actionsIntent = intent.actions?intent.actions:[];
      let webhookEnabledIntent = intent.webhook_enabled?intent.webhook_enabled:false;

      clearTimeout(this.setTimeoutChangeEvent);
      this.setTimeoutChangeEvent = setTimeout(() => {
        this.faqService.updateIntent(
          id,
          attributes,
          questionIntent,
          answerIntent,
          displayNameIntent,
          formIntent,
          actionsIntent,
          webhookEnabledIntent
        ).subscribe((intent: Intent) => {
          console.log('EDIT ', intent.id);
          resolve(true);
        }, (error) => {
          console.error('ERROR: ', error);
          reject(false);
        }, () => {
          // console.log('COMPLETE ');
          resolve(true);
        });
      }, 2000);

    });
  }

  /** deleteIntent */
  public async deleteIntent(intentId: string): Promise<boolean> { 
    return new Promise((resolve, reject) => {
      this.faqService.deleteFaq(intentId).subscribe((data) => {
        resolve(true);
      }, (error) => {
        console.error('ERROR: ', error);
        reject(false);
      }, () => {
        // console.log('COMPLETE ');
        resolve(true);
      });
    });
  }
  // END INTENT FUNCTIONS //





  // START ACTION FUNCTIONS //

  // moving new action in intent from panel elements
  public moveNewActionIntoIntent(event, action, currentIntentId): any {
    let newAction = this.createNewAction(action.value.type);
    let currentIntent = this.listOfIntents.find(function(obj) {
      return obj.intent_id === currentIntentId;
    });
    currentIntent.actions.splice(event.currentIndex, 0, newAction);
    this.behaviorIntent.next(currentIntent);
    this.connectorService.movedConnector(currentIntent.intent_id);
    setTimeout(async () => {
      const responseCurrentIntent = await this.updateIntent(currentIntent);
      if(responseCurrentIntent){
        // const fromEle = document.getElementById(currentIntent.intent_id);
        // this.connectorService.movedConnector(currentIntent.intent_id);
        console.log('update current Intent: OK');
        
        //this.behaviorIntent.next(currentIntent);
      }
    }, 0);
    return newAction
  }

  // on move action from different intents
  public moveActionBetweenDifferentIntents(event, action, currentIntentId){
    const that = this;
    console.log('moving action from another intent - action: ', currentIntentId);
    let currentIntent = this.listOfIntents.find(function(obj) {
      return obj.intent_id === currentIntentId;
    });
    let previousIntent = this.listOfIntents.find(function(obj) {
      return obj.intent_id === that.previousIntentId;
    });
    console.log('moveActionBetweenDifferentIntents: ', event, this.listOfIntents, currentIntentId, currentIntent, previousIntent);
    currentIntent.actions.splice(event.currentIndex, 0, action);
    previousIntent.actions.splice(event.previousIndex, 1);

    this.behaviorIntent.next(currentIntent);
    this.behaviorIntent.next(previousIntent);
    this.connectorService.movedConnector(currentIntent.intent_id);
    this.connectorService.movedConnector(previousIntent.intent_id);
    this.connectorService.deleteConnectorsFromActionByActionId(action._tdActionId);
    setTimeout(async () => {
      const responseCurrentIntent = await this.updateIntent(currentIntent);
      if(responseCurrentIntent){
        // update the intent connectors
        // this.connectorService.movedConnector(currentIntent.intent_id);
        // console.log('update current Intent: OK');
        // this.behaviorIntent.next(currentIntent);
      }
      if( previousIntent.actions.length>0){
        const responsePreviousIntent = await this.updateIntent(previousIntent);
        if(responsePreviousIntent){
          // update the intent connectors
          // this.connectorService.movedConnector(previousIntent.intent_id);
          // console.log('update previous Intent: OK');
          // this.behaviorIntent.next(previousIntent);
        }
      } else {
        const responsePreviousIntent = await this.deleteIntent(previousIntent.id);
        if(responsePreviousIntent){
          console.log('delete previous Intent: OK');
          // this.refreshIntents();
        }
      }
      
    }, 0);
  }

  
  // on move action from intent to stage
  // set previousIntentId on dragStarted
  // cancello la action dall'intent che la conteneva precedentemente
  public deleteActionFromPreviousIntentOnMovedAction(event, action){
    const actionId = action._tdActionId;
    console.log("elimino la action dall'intent che la conteneva",actionId, this.previousIntentId);
    let intentToUpdate = this.listOfIntents.find((intent) => intent.intent_id === this.previousIntentId);
    if(intentToUpdate){
      const actions = intentToUpdate.actions.filter((action: any) => action._tdActionId !== actionId);
      if(actions){ // && actions.length>0
        intentToUpdate.actions = actions;
        // this.listOfIntents = this.listOfIntents.map((intent) => (intent.intent_id !== this.previousIntentId ? intent : intentToUpdate));
        // console.log("aggiorno la lista degli intents sostituendo l'intent al quale è stata eliminata la action ", this.listOfIntents);
        console.log('aggiorno intent di partenza', intentToUpdate);
        const responseIntent = this.updateIntent(intentToUpdate);
        this.connectorService.deleteConnectorsFromActionByActionId(actionId);
        if(responseIntent){
          console.log('update Intent: OK');
          this.behaviorIntent.next(intentToUpdate);
         // this.connectorService.deleteConnectorsFromActionByActionId(action._tdActionId);
        }
        return true;
      } else {
        // // NON HA SENSO ELIMINARE L'ULTIMA ACTION QUINDI ANNULLO L'AZIONE!!!
        // console.log("l'intent è vuoto quindi lo elimino  ::: ", intentToUpdate.id);
        // const responseIntent = this.deleteIntent(intentToUpdate.id);
        // if(responseIntent){
        //   console.log('delete Intent: OK');
        //   this.listOfIntents = this.listOfIntents.filter(obj => obj.id !== intentToUpdate.id && obj.actions.length>0);
        //   console.log("ho eliminato l'intent da remoto, quindi aggiorno l'array degli intent e propago l'azione");
        //   this.behaviorIntents.next(this.listOfIntents);
        // }
        // return false;
      }
      return false;
      // console.log("propago la lista di intents"); 
      // this.behaviorIntents.next(this.listOfIntents);
    }
    return false;
    // return this.listOfIntents;
  }


  addNewIntentToListOfIntents(intent){
    console.log("aggiungo l'intent alla lista di intent");
    this.listOfIntents.push(intent);
    this.refreshIntents();
    // this.behaviorIntents.next(this.listOfIntents);
  }

  replaceNewIntentToListOfIntents(intent){
    this.listOfIntents = this.listOfIntents.map((obj) => {
      if (obj.id === NEW_POSITION_ID) {
        return intent;
      }
      return obj;
    });
    console.log("sostituisco l'intent con id NEW con l'intent salvato nella lista degli intent");
    // this.behaviorIntents.next(this.listOfIntents);
    this.refreshIntents();
  }

  deleteIntentToListOfIntents(intentId){
    console.log("elimino l'intent alla lista di intent", intentId);
    this.listOfIntents = this.listOfIntents.filter((intent: any) => intent.intent_id !== intentId);
    // this.behaviorIntents.next(this.listOfIntents);
    this.refreshIntents();
  }


  /** getListOfActions */
  public getListOfActions(){
    return this.listActions;
  }


  public getListOfIntents(): Array<{name: string, value: string, icon?:string}>{
    return this.listOfIntents.map(a => {
      if (a.intent_display_name.trim() === 'start') {
        return { name: a.intent_display_name, value: '#' + a.intent_id, icon: 'rocket_launch' }
      } else if (a.intent_display_name.trim() === 'defaultFallback') {
        return { name: a.intent_display_name, value: '#' + a.intent_id, icon: 'undo' }
      } else {
        return { name: a.intent_display_name, value: '#' + a.intent_id, icon: 'label_important_outline' }
      }
    });
  }

  /** selectAction */
  public selectAction(intentID, actionId){
    this.actionSelectedID = actionId;
    this.intentSelectedID = intentID;

    this.selectedIntent = this.listOfIntents.find(intent => intent.intent_id === intentID);

    this.listActions = this.selectedIntent.actions;
    this.selectedAction = this.listActions.find(action => action._tdActionId === actionId);
  }

  public selectIntent(intentID){
    this.intentSelectedID = intentID;
    this.actionSelectedID = null;
    this.selectedIntent = this.listOfIntents.find(intent => intent.intent_id === intentID);
    console.log('[INTENT SERVICE] --> intentID', intentID)
    console.log('[INTENT SERVICE] --> selectIntent', this.selectedIntent)
    if(!this.selectedIntent)return;
    this.listActions = this.selectedIntent.actions?this.selectedIntent.actions:null;
    this.selectedAction = null;
    // this.behaviorIntent.next(this.selectedIntent)
  }


  /** unselectAction */
  public unselectAction(){
    this.actionSelectedID = null;
    this.intentSelectedID = null;
  }

  /** deleteSelectedAction 
  */
  public deleteSelectedAction(){
    console.log('deleteSelectedAction', this.intentSelectedID, this.actionSelectedID);
    if(this.intentSelectedID && this.actionSelectedID){
      this.connectorService.deleteConnectorsFromActionByActionId(this.actionSelectedID);
      let intentToUpdate = this.listOfIntents.find((intent) => intent.intent_id === this.intentSelectedID);
      intentToUpdate.actions = intentToUpdate.actions.filter((action: any) => action._tdActionId !== this.actionSelectedID);
      this.listOfIntents = this.listOfIntents.map((intent) => {
        if (intent.intent_id === this.intentSelectedID) {
          return intentToUpdate;
        }
        return intent;
      });
      this.behaviorIntent.next(intentToUpdate);
      this.connectorService.movedConnector(intentToUpdate.intent_id);
      // this.connectorService.deleteConnectorsFromActionByActionId(this.actionSelectedID);
      setTimeout(async () => {
        const responseIntent = await this.updateIntent(intentToUpdate);
        if(responseIntent){
          // this.connectorService.movedConnector(intentToUpdate.intent_id);
          console.log('update Intent: OK');
          // this.behaviorIntent.next(intentToUpdate);
        }
        this.unselectAction();
        console.log('deleteSelectedAction', intentToUpdate);
      }, 0);
    }
  } 


  /** createNewAction */
  public createNewAction(typeAction: TYPE_ACTION) {
    // console.log('[INTENT-SERV] createNewAction typeAction ', typeAction)
    let action: any;

    if(typeAction === TYPE_ACTION.REPLY){
      action = new ActionReply();
      let commandWait = new Wait();
      action.attributes.commands.push(commandWait);
      let command = new Command(TYPE_COMMAND.MESSAGE);
      command.message = new Message('text', 'A chat message will be sent to the visitor');
      action.attributes.commands.push(command);
    }
    if(typeAction === TYPE_ACTION.RANDOM_REPLY){
      action = new ActionRandomReply();
      let commandWait = new Wait();
      action.attributes.commands.push(commandWait);
      let command = new Command(TYPE_COMMAND.MESSAGE);
      command.message = new Message('text', 'A chat message will be sent to the visitor');
      action.attributes.commands.push(command);
    }
    if(typeAction === TYPE_ACTION.WEB_REQUEST){
      action = new ActionWebRequest();
    }
    if(typeAction === TYPE_ACTION.AGENT){
      action = new ActionAgent();
    }
    if(typeAction === TYPE_ACTION.CLOSE){
      action = new ActionClose();
    }
    if(typeAction === TYPE_ACTION.WAIT){
      action = new ActionWait();
    }
    if(typeAction === TYPE_ACTION.INTENT) {
      action = new ActionIntentConnected();
    }
    if(typeAction === TYPE_ACTION.EMAIL) {
      action = new ActionEmail();
    }
    if(typeAction === TYPE_ACTION.ASSIGN_VARIABLE){
      action = new ActionAssignVariable();
    }
    if(typeAction === TYPE_ACTION.DELETE_VARIABLE){
      action = new ActionDeleteVariable();
    }
    if(typeAction === TYPE_ACTION.ONLINE_AGENTS){
      action = new ActionOnlineAgent();
    }
    if(typeAction === TYPE_ACTION.OPEN_HOURS){
      action = new ActionOpenHours();
    }
    if(typeAction === TYPE_ACTION.REPLACE_BOT){
      action = new  ActionReplaceBot();
    }
    if(typeAction === TYPE_ACTION.CHANGE_DEPARTMENT) {
      action = new  ActionChangeDepartment();
    }
    if(typeAction === TYPE_ACTION.HIDE_MESSAGE){
      action = new ActionHideMessage();
    }
    if(typeAction === TYPE_ACTION.JSON_CONDITION){
      action = new ActionJsonCondition();
      action.groups.push( new Expression());
    }
    if(typeAction === TYPE_ACTION.ASSIGN_FUNCTION){
      action = new ActionAssignFunction();
    }
    if(typeAction === TYPE_ACTION.WHATSAPP_ATTRIBUTE){
      action = new ActionWhatsappAttribute();
    }
    if(typeAction === TYPE_ACTION.WHATSAPP_STATIC){
      action = new ActionWhatsappStatic();
    }
    if(typeAction === TYPE_ACTION.ASKGPT){
      action = new ActionAskGPT();
      action.question = '${last_user_text}'
      action.assignReplyTo = 'gpt_reply';
      action.assignSourceTo = 'gpt_source';
      action.assignSuccessTo = 'gpt_success';
    }
    console.log('ho creato nuova action ', action);
    return action;
  }
  // END ATTRIBUTE FUNCTIONS //
  




  

  // OLD_patchAttributes(attributes: any) {
  //   console.log('-----------> patchAttributes, ', this.idBot);
  //   this.faqKbService.patchAttributes(this.idBot, attributes).subscribe((data) => {
  //       if (data) {
  //         console.log('data:   ', data);
  //       }
  //     }, (error) => {
  //       console.log('error:   ', error);
  //     }, () => {
  //       console.log('complete');
  //     });
  // }

  patchAttributes(intentID: string, attributes: any) {
    console.log('-----------> patchAttributes, ', intentID, attributes);
    this.faqService.patchAttributes(intentID, attributes).subscribe((data) => {
        if (data) {
          this.listOfIntents = this.listOfIntents.map((obj) => (obj.id === intentID ? data : obj));
          // const indexToUpdate = this.listOfIntents.findIndex((obj) => obj.id === intentID);
          // if (indexToUpdate !== -1) {
          //   this.listOfIntents[indexToUpdate] = data;
          // }
          data['attributesChanged']=true;
          console.log('data:   ', data);
          this.behaviorIntent.next(data);
        }
      }, (error) => {
        console.log('error:   ', error);
      }, () => {
        console.log('complete');
      });

  }

}
