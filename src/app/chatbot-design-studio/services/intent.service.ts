import { ComponentFactoryResolver, Injectable } from '@angular/core';
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
  Command, Wait, Message, Expression, Attributes, Action, ActionAskGPT, ActionWhatsappAttribute, ActionWhatsappStatic, ActionWebRequestV2, ActionGPTTask } from 'app/models/intent-model';
import { FaqService } from 'app/services/faq.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { TYPE_INTENT_NAME, NEW_POSITION_ID, TYPE_ACTION, TYPE_COMMAND, removeNodesStartingWith, generateShortUID, checkIFElementExists} from 'app/chatbot-design-studio/utils';
import { ConnectorService } from 'app/chatbot-design-studio/services/connector.service';
import { ControllerService } from 'app/chatbot-design-studio/services/controller.service';
import { StageService } from 'app/chatbot-design-studio/services/stage.service';
import { DashboardService } from 'app/chatbot-design-studio/services/dashboard.service';



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
  prevListOfIntent: Array<Intent> = [];
  // selectedIntent: Intent;
  intentSelected: Intent;
  listActions: Array<Action>;
  selectedAction: Action;

  actionSelectedID: string;
  // intentSelectedID: string;

  previousIntentId: string = '';
  preDisplayName: string = 'untitled_block_';
  
  botAttributes: any = {};
  listOfPositions: any = {};

  setTimeoutChangeEvent: any;
  idIntentUpdating: string;

  intentNameAlreadyExist: boolean;


  // newPosition: any = {'x':0, 'y':0};
  

  private changedConnector = new Subject<any>();
  public isChangedConnector$ = this.changedConnector.asObservable();



  public arrayUNDO: Array<any> = [];
  public arrayREDO: Array<any> = [];
  public lastActionSavedInUndoRedo: any;

  constructor(
    private faqService: FaqService,
    private faqKbService: FaqKbService,
    private connectorService: ConnectorService,
    private controllerService: ControllerService,
    private stageService: StageService,
    private dashboardService: DashboardService,
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

  public setDefaultIntentSelected(){
    if(this.listOfIntents && this.listOfIntents.length > 0){
      let startIntent = this.listOfIntents.filter(obj => ( obj.intent_display_name.trim() === TYPE_INTENT_NAME.DISPLAY_NAME_START));
      // console.log('setDefaultIntentSelected: ', startIntent, startIntent[0]);
      if(startIntent && startIntent.length>0){
        this.intentSelected = startIntent[0];
      }
    }
    console.log('[INTENT SERVICE] ::: setDefaultIntentSelected ::: ', this.intentSelected);
    this.behaviorIntent.next(this.intentSelected);
    //this.liveActiveIntent.next(this.intentSelected);
  }

  // public setIntentSelected(intent){
  //   this.intentSelected = intent;
  //   console.log('[INTENT SERVICE] ::: setIntentSelected ::: ', this.intentSelected);
  //   this.behaviorIntent.next(this.intentSelected);
  //   //this.liveActiveIntent.next(this.selectedIntent);
  // }

  public setLiveActiveIntent(intentName: string){
    let intent = this.listOfIntents.find((intent) => intent.intent_display_name === intentName);
    this.liveActiveIntent.next(intent)
  }


  /** checkIntentNameMachRegex */
  // checkIntentNameMachRegex(intentname) {
  //   const regex = /^[ _0-9a-zA-Z]+$/
  //   return regex.test(intentname);
  // }

  // private checkIntentName(name: string, ) {
  //   this.intentNameAlreadyExist = false;
  //   if (name !== this.intent.intent_display_name) {
  //     this.intentNameAlreadyExist = this.listOfIntents.some((el) => {
  //       return el.intent_display_name === name;
  //     });
  //   }

  //   this.intentNameNotHasSpecialCharacters = this.checkIntentNameMachRegex(name);
  //   this.intentNameResult = true;
  //   if (!this.intentName || this.intentName.trim().length === 0) {
  //     this.intentNameResult = false;
  //   }
  //   return this.intentNameResult;
  // }
  

  /** setDragAndListnerEvent */
  // public setListnerEvent(intent) {
  //   let that = this;
  //   let elem = document.getElementById(intent.intent_id);
  //   if(elem){
  //     const panelIntentContent = elem.getElementsByClassName('panel-intent-content')[0];
  //     const picHeader = panelIntentContent.getElementsByClassName('pic-header')[0];
  //     if(picHeader){
  //       console.log("imposto il listner per la selezione/deselezione dell'elemento ");
  //       // **************** !!!!!!!! aggiungo listner !!!!!!! *******************//
  //       // Aggiungi l'event listener con i parametri
  //       // console.log("2.1 --- hasListenerMouseup -> ", elem.dataset.hasListenerMouseup ,intent.intent_id);
  //       if (elem.dataset.hasListenerMouseup !== 'true') {
  //         picHeader.addEventListener('mouseup', function () {
  //           elem.dataset.hasListenerMouseup = 'true';
  //           that.onMouseUpIntent(intent, elem);
  //         });
  //       }
  //       // Aggiungi l'event listener con i parametri
  //       // console.log("2.2 --- hasListenerMousedown -> ",elem.dataset.hasListenerMousedown, intent.intent_id);
  //       if (elem.dataset.hasListenerMousedown !== 'true') {
  //         picHeader.addEventListener('mousedown', function () {
  //           elem.dataset.hasListenerMousedown = 'true';
  //           that.onMouseDownIntent(elem);
  //         });
  //       }
  //       // Aggiungi l'event listener con i parametri
  //       // console.log("2.3 --- hasListenerMousemove -> ",elem.dataset.hasListenerMousemove, intent.intent_id);
  //       if (elem.dataset.hasListenerMousemove !== 'true') {
  //         picHeader.addEventListener('mousemove', function () {
  //           elem.dataset.hasListenerMousemove = 'true';
  //           that.onMouseMoveIntent(elem);
  //         });
  //       }
  //     }
  //   }
  // }

  // /** */
  // onMouseDownIntent(element): void {
  //   // console.log("onMouseDownIntent:  element: ",element);
  //   const x = element.offsetLeft;
  //   const y = element.offsetTop;
  //   element.style.zIndex = 2;
  // }

  // /** */
  // onMouseUpIntent(intent: any, element: any) {
  //   console.log("onMouseUpIntent: ", intent, " element: ", element);
  //   let newPos = { 'x': element.offsetLeft, 'y': element.offsetTop };
  //   let pos = intent.attributes.position; // this.intentService.getIntentPosition(intent.id);
  //   if (newPos.x != pos.x || newPos.y != pos.y) {
  //     element.style.zIndex = '1';
  //     // console.log("setIntentPosition x:", newPos.x, " y: ",newPos.y);
  //     this.setIntentPosition(intent.id, newPos);
  //   }
  // }

  // /** */
  // onMouseMoveIntent(element: any) {
  // }


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
    console.log("aggiorno elenco intent: ", this.listOfIntents);
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
    let intent = this.listOfIntents.find((intent) => intent.intent_id === intentId);
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
    let intentToUpdate = this.listOfIntents.find((intent) => intent.intent_id === intentId);
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
          this.listOfIntents = JSON.parse(JSON.stringify(faqs));
          this.prevListOfIntent = JSON.parse(JSON.stringify(faqs));
        } else {
          // console.log('EMPTY: ', faqs);
          this.listOfIntents = [];
          this.prevListOfIntent = [];
        }
        this.refreshIntents();
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
    console.log("[INTENT SERVICE] ho creato un nuovo intent contenente l'azione ", action, " in posizione ", pos);
    this.addIntentToUndoRedo('PUSH', intent);
    return intent;
  }

  /** generate display name of intent */
  public setDisplayName(){
    // let listOfIntents = this.behaviorIntents.getValue();
    let displayNames = this.listOfIntents.filter((element) => element.intent_display_name.startsWith(this.preDisplayName))
                                          .map((element) => element.intent_display_name.replace(this.preDisplayName, ''));
    // displayNames = displayNames.slice().sort();
    const numbers = displayNames.filter(el => el !== '').map((name) => parseInt(name, 10));
    numbers.sort((a, b) => a - b);
    const lastNumber = numbers[numbers.length - 1];
    if(numbers.length>0){
      return this.preDisplayName+(lastNumber+1);
    } else {
      return this.preDisplayName+1;
    }
    // const filteredArray = this.listOfIntents.filter((element) => element.intent_display_name.startsWith(this.preDisplayName));
    // if(filteredArray.length>0){
    //   const lastElement = filteredArray.slice(-1)[0];
    //   const intent_display_name = parseInt(lastElement.intent_display_name.substring(this.preDisplayName.length));
    //   return this.preDisplayName+(intent_display_name+1);
    // } else {
    //   return this.preDisplayName+1;
    // }
  }
  
  /** save a New Intent, created on drag action on stage */
  public async saveNewIntent(newIntent: Intent, fromCallerUndoRedo?:boolean): Promise<any> { 
    // if(!fromCallerUndoRedo)this.addUNDOactionToList(newIntent, 'PUSH');
    let id_faq_kb = this.dashboardService.id_faq_kb;
    console.log('[INTENT SERVICE] -> saveNewIntent, ');
    
    return new Promise((resolve, reject) => {
      console.log("[INTENT SERVICE]  salva ");
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
        console.log("[INTENT SERVICE]  ho salvato in remoto l'intent ", intent.intent_id);
        this.prevListOfIntent = JSON.parse(JSON.stringify(this.listOfIntents));
        resolve(intent);
      }, (error) => {
        console.error('[INTENT SERVICE]  ERROR: ', error);
        reject(false);
      }, () => {
        // console.log('COMPLETE ');
        resolve(false);
      });
    });
  }


  /** updateIntent */
  public async updateIntent(originalIntent: Intent, timeout?: number, connector?: any, fromCallerUndoRedo?:boolean): Promise<boolean> { 
    const thereIsIntent = this.listOfIntents.some((intent) => intent.intent_id === originalIntent.intent_id);
    if(!thereIsIntent)return;
    if(!timeout)timeout = 0;
    let intent = JSON.parse(JSON.stringify(originalIntent));
    intent = removeNodesStartingWith(intent, '__');
    console.log('[INTENT SERVICE] -> updateIntent, ', originalIntent);

    // if(!fromCallerUndoRedo)this.addUNDOactionToList(originalIntent, 'PUT');

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

      if(this.idIntentUpdating == intent.intent_id){
        clearTimeout(this.setTimeoutChangeEvent);
      } else {
        this.idIntentUpdating = intent.intent_id;
      }
      this.setTimeoutChangeEvent = setTimeout(() => {
        this.faqService.updateIntent(
          id,
          attributes,
          questionIntent,
          answerIntent,
          displayNameIntent,
          formIntent,
          actionsIntent,
          webhookEnabledIntent,
          intent.intent_id
        ).subscribe((intent: Intent) => {
          this.prevListOfIntent = JSON.parse(JSON.stringify(this.listOfIntents));
          resolve(true);
        }, (error) => {
          console.error('ERROR: ', error);
          reject(false);
        }, () => {
          resolve(true);
        });
      }, timeout);
    });
  }






  /** deleteIntent */
  public async deleteIntent(intent: Intent, fromCallerUndoRedo?:boolean): Promise<boolean> { 
    // if(!fromCallerUndoRedo)this.addUNDOactionToList(intent, 'DEL');
    // this.deleteIntentToListOfIntents(intent.intent_id);
    console.log('[INTENT SERVICE] -> deleteIntent, ');
    return new Promise((resolve, reject) => {
      this.faqService.deleteFaq(intent.id, intent.intent_id).subscribe((data) => {
        this.prevListOfIntent = JSON.parse(JSON.stringify(this.listOfIntents));
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

  /** update title of intent */
  public changeIntentName(intent){
    setTimeout(async () => {
      const response = await this.updateIntent(intent, 2000);
      if(response){
        this.behaviorIntents.next(this.listOfIntents);
      }
    }, 0);
  }

  // moving new action in intent from panel elements
  public moveNewActionIntoIntent(event, action, currentIntentId): any {
    console.log('[INTENT-SERVICE] moveNewActionIntoIntent');
    let newAction = this.createNewAction(action.value.type);
    let currentIntent = this.listOfIntents.find(function(obj) {
      return obj.intent_id === currentIntentId;
    });
    currentIntent.actions.splice(event.currentIndex, 0, newAction);
    this.behaviorIntent.next(currentIntent);
    this.connectorService.updateConnector(currentIntent.intent_id);
    setTimeout(async () => {
      const responseCurrentIntent = await this.updateIntent(currentIntent);
      if(responseCurrentIntent){
        // const fromEle = document.getElementById(currentIntent.intent_id);
        // this.connectorService.updateConnector(currentIntent.intent_id);
        console.log('update current Intent: OK');
        //this.behaviorIntent.next(currentIntent);
      }
    }, 0);
    return newAction
  }

  // on move action from different intents
  public moveActionBetweenDifferentIntents(event, action, currentIntentId){
    console.log('[INTENT-SERVICE] moveActionBetweenDifferentIntents');
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
    this.connectorService.updateConnector(currentIntent.intent_id);
    this.connectorService.updateConnector(previousIntent.intent_id);
    this.connectorService.deleteConnectorsFromActionByActionId(action._tdActionId);
    const responseCurrentIntent = this.updateIntent(currentIntent);
    if(responseCurrentIntent){
      console.log('update current Intent: OK');
    }
    const responsePreviousIntent = this.updateIntent(previousIntent);
    if(responsePreviousIntent){
      console.log('update previous Intent: OK');
    }  
    // this.controllerService.closeAllPanels();
    // this.behaviorIntent.next(currentIntent);
    // this.behaviorIntent.next(previousIntent);
  }


  
  // on move action from intent to stage
  // set previousIntentId on dragStarted
  // cancello la action dall'intent che la conteneva precedentemente
  public deleteActionFromPreviousIntentOnMovedAction(action){
    const actionId = action._tdActionId;
    let intentToUpdate = this.listOfIntents.find((intent) => intent.intent_id === this.previousIntentId);
    if(intentToUpdate){
      const actions = intentToUpdate.actions.filter((action: any) => action._tdActionId !== actionId);
      intentToUpdate.actions = actions;
      console.log("[CDS-INTENT-SERVICES] ho eliminato la action dall'intent che la conteneva ",actionId, intentToUpdate);
      this.connectorService.deleteConnectorsFromActionByActionId(actionId);
      console.log('[CDS-INTENT-SERVICES] aggiorno intent di partenza', intentToUpdate);
      const responseIntent = this.updateIntent(intentToUpdate);
      if(responseIntent){
        console.log('[CDS-INTENT-SERVICES] update Intent: OK');
        this.behaviorIntent.next(intentToUpdate);
      }
      return intentToUpdate;
    } else {
      return;
    }
  }


  addNewIntentToListOfIntents(intent){
    console.log("[CDS-INTENT-SERVICES] aggiungo l'intent alla lista di intent");
    this.listOfIntents.push(intent);
    this.refreshIntents();
    // this.behaviorIntents.next(this.listOfIntents);
  }

  replaceNewIntentToListOfIntents(intent, oldID){
    this.listOfIntents = this.listOfIntents.map((obj) => {
      if (obj.id === oldID) {
        return intent;
      }
      return obj;
    });
    console.log("[CDS-INTENT-SERVICES] sostituisco l'intent con id NEW con l'intent salvato nella lista degli intent");
    // this.behaviorIntents.next(this.listOfIntents);
    this.refreshIntents();
  }

  deleteIntentToListOfIntents(intentId){
    console.log("[CDS-INTENT-SERVICES] elimino l'intent alla lista di intent", intentId);
    this.listOfIntents = this.listOfIntents.filter((intent: any) => intent.intent_id !== intentId);
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


  /** selectIntent */
  public selectIntent(intentID){
    console.log('[INTENT SERVICE] --> selectIntent',  this.listOfIntents, intentID);
    this.intentSelected = this.listOfIntents.find(intent => intent.intent_id === intentID);
    if(this.intentSelected)this.stageService.setDragElement(this.intentSelected.intent_id);
   
  }

  /** selectAction */
  public selectAction(intentID, actionId){
    this.actionSelectedID = actionId;
    this.intentSelected = this.listOfIntents.find(intent => intent.intent_id === intentID);
    this.listActions = this.intentSelected.actions;
    this.selectedAction = this.listActions.find(action => action._tdActionId === actionId);
    console.log('[INTENT SERVICE] --> selectAction: ', intentID, actionId);
    this.behaviorIntent.next(this.intentSelected);
  }

  /** setIntentSelected */
  public setIntentSelected(intentID){
    this.selectIntent(intentID);
    this.actionSelectedID = null;
    this.listActions = this.intentSelected.actions?this.intentSelected.actions:null;
    this.selectedAction = null;
    console.log('[INTENT SERVICE] ::: setIntentSelected ::: ', this.intentSelected);
    this.behaviorIntent.next(this.intentSelected);
    // if(!this.intentSelected)return;
    // chiudo tutti i pannelli
    // this.controllerService.closeAllPanels();
  }


  /** unselectAction */
  public unselectAction(){
    this.actionSelectedID = null;
    // this.intentSelectedID = null;
  }

  /** deleteSelectedAction 
  */
  public deleteSelectedAction(){
    console.log('[INTENT SERVICE] ::: deleteSelectedAction', this.intentSelected.intent_id, this.actionSelectedID);
    if(this.intentSelected.intent_id && this.actionSelectedID){
      this.connectorService.deleteConnectorsFromActionByActionId(this.actionSelectedID);
      let intentToUpdate = this.listOfIntents.find((intent) => intent.intent_id === this.intentSelected.intent_id);
      intentToUpdate.actions = intentToUpdate.actions.filter((action: any) => action._tdActionId !== this.actionSelectedID);
      this.listOfIntents = this.listOfIntents.map((intent) => {
        if (intent.intent_id === this.intentSelected.intent_id) {
          return intentToUpdate;
        }
        return intent;
      });
      this.behaviorIntent.next(intentToUpdate);
      this.connectorService.updateConnector(intentToUpdate.intent_id);
      this.controllerService.closeAllPanels();
      // this.connectorService.deleteConnectorsFromActionByActionId(this.actionSelectedID);
      const responseIntent = this.updateIntent(intentToUpdate);
      if(responseIntent){
        // this.connectorService.updateConnector(intentToUpdate.intent_id);
        console.log('update Intent: OK');
        // this.behaviorIntent.next(intentToUpdate);
      }
      this.unselectAction();
      console.log('deleteSelectedAction', intentToUpdate);
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
    if(typeAction === TYPE_ACTION.WEB_REQUESTV2){
      action = new ActionWebRequestV2();
      action.assignResultTo= 'result'
      action.assignStatusTo = 'status';
      action.assignErrorTo = 'error';
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
      action.question = '{{last_user_text}}'
      action.assignReplyTo = 'kb_reply';
      action.assignSourceTo = 'kb_source';
    }
    if(typeAction === TYPE_ACTION.GPT_TASK){
      action = new ActionGPTTask();
      action.max_tokens = 128;
      action.temperature = 0.7;
      action.model = "gpt-3.5-turbo";
      action.assignReplyTo = 'gpt_reply';
    }
    console.log('ho creato nuova action ', action);
    return action;
  }
  // END ATTRIBUTE FUNCTIONS //
  



  public patchButtons(buttons, idAction){
    console.log('patchButtons:: ', buttons);
    buttons.forEach((button, index) => {
      const checkUid = buttons.filter(btn => btn.uid === button.uid);
      if (checkUid.length > 1 || !button.uid && button.uid == undefined) {
        button.uid = generateShortUID(index);
      } 
      buttons[index] = this.patchButton(button, idAction);
    }); 
    return buttons;
  }
  

  public patchButton(button, idAction){
    console.log('patchButton:: ', button);
    const idActionConnector = idAction+'/'+button.uid;
    button.__idConnector = idActionConnector;
    if(button.action && button.action !== ''){
      button.__isConnected = true;
    } else {
      button.__isConnected = false;
    }
    return button;
  }

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
    clearTimeout(this.setTimeoutChangeEvent);
    this.setTimeoutChangeEvent = setTimeout(() => {
      console.log('[INTENT SERVICE] -> patchAttributes, ', intentID, attributes);
      // let intentToUpdate = this.listOfIntents.find((intent) => intent.id === intentID);
      //if(!fromCallerUndoRedo)this.addUNDOtoList(intent, 'DEL');
      this.faqService.patchAttributes(intentID, attributes).subscribe((data) => {
        this.prevListOfIntent = JSON.parse(JSON.stringify(this.listOfIntents));
        if (data) {
          // this.listOfIntents = this.listOfIntents.map((obj) => (obj.id === intentID ? data : obj));
          // data['attributesChanged'] = true;
          console.log('[INTENT SERVICE] patchAttributes OK: ', data);
          // this.behaviorIntent.next(data);
        }
      }, (error) => {
        console.log('error:   ', error);
      }, () => {
        console.log('complete');
      });
    }, 2000);
  }



  /** setDragAndListnerEventToElement */
  public setDragAndListnerEventToElement(intent) {
    let intervalId = setInterval(async () => {
      const result = checkIFElementExists(intent.intent_id);
      if (result === true) {
        console.log('[CDS CANVAS] Condition is true ', intent.intent_id);
        this.stageService.setDragElement(intent.intent_id);
        // this.intentService.setListnerEvent(intent);
        clearInterval(intervalId);
      }
    }, 100); 
    // Chiamiamo la funzione ogni 100 millisecondi (0.1 secondo)
    // Termina l'intervallo dopo 2 secondi (2000 millisecondi)
    setTimeout(() => {
      console.log('Timeout: 2 secondo scaduto.');
      clearInterval(intervalId);
    }, 2000);
  }

  /************************************************
   * UNDO / REDO
   * 
   * 
  /************************************************/

  public addIntentToUndoRedo(type, intent){ // intent_id_chiamante
    // se muovo tra intent differenti uso setPreviousIntentId
    // se creo da floatmenu uso  ...
    // altrimenti non uso nulla

    let intentsToUpdateUndo = [];
    let intentsToUpdateRedo = [];
    let typeUNDO;
    let typeREDO = type;
    if(type === 'PUSH'){
      typeUNDO = 'DEL';
      const intentToUpdateUndo = this.prevListOfIntent.find((intent) => intent.intent_id === this.previousIntentId);
      if(intentToUpdateUndo)intentsToUpdateUndo.push(intentToUpdateUndo);
      const intentToUpdateRedo = this.listOfIntents.find((intent) => intent.intent_id === this.previousIntentId);
      if(intentToUpdateRedo)intentsToUpdateRedo.push(intentToUpdateRedo);
    }
    let pos =  this.listOfIntents.findIndex((element) => { return element.intent_id === intent.intent_id });
    if(!pos || pos <0)pos = this.listOfIntents.length;
    let UNDO = this.setUndoRedoObject(type, typeUNDO, typeREDO, pos, intent, intentsToUpdateUndo, intentsToUpdateRedo);
    this.arrayUNDO.push(UNDO);
    console.log('[INTENT SERVICE] -> AGGIUNGO ', UNDO, this.arrayUNDO, this.arrayREDO);
    // this.arrayUNDO = this.arrayUNDO.slice(10);
    this.arrayREDO = [];
  }


  setUndoRedoObject(type, typeUNDO, typeREDO, pos, intent, intentsToUpdateUndo, intentsToUpdateRedo){
    let obj = {
      type: type,
      pos: pos,  
      undo:{
        type: typeUNDO,
        intent: {...intent},
        intentsToUpdate: intentsToUpdateUndo,
      },
      redo:{
        type: typeREDO,
        intent: {...intent},
        intentsToUpdate: intentsToUpdateRedo,
      }
    }
    console.log('[INTENT SERVICE] -> setUndoRedoObject', obj);
    return obj;
  }

  async restoreLastUNDO(){
    console.log('[INTENT SERVICE] -> restoreLastUNDO', this.arrayUNDO);
    if(this.arrayUNDO && this.arrayUNDO.length>0){
      let objUNDO = this.arrayUNDO.pop();
      // let objREDO = {...objUNDO};
      this.arrayREDO.push(objUNDO);
      this.restoreIntent(objUNDO.pos, objUNDO.undo);
      // let intentsToUpdate = [];
      // objUNDO.intentsToUpdate.forEach(element => {
      //   const intentToUpdate = this.prevListOfIntent.find((intent) => intent.intent_id === element.intent_id);
      //   if(intentToUpdate)intentsToUpdate.push(intentToUpdate);
      // });
      // let objREDO = this.setUndoRedoObject(objUNDO.type, objUNDO.typeUNDO, objUNDO.typeREDO, objUNDO.pos, objUNDO.intent, intentsToUpdate);
      
      console.log('[INTENT SERVICE] -> ho aggiornato gli array dopo UNDO ', this.arrayUNDO, this.arrayREDO);
    }
  }

  public restoreLastREDO(){
    console.log('[INTENT SERVICE] -> restoreLastREDO', this.arrayREDO);
    if(this.arrayREDO && this.arrayREDO.length>0){
      let objREDO = this.arrayREDO.pop();
      console.log('[INTENT SERVICE] -> objREDO', objREDO);
      // let objUNDO = {...objREDO};
      this.arrayUNDO.push(objREDO);
      this.restoreIntent(objREDO.pos, objREDO.redo);
      console.log('[INTENT SERVICE] -> ho aggiornato gli array dopo REDO ', this.arrayUNDO, this.arrayREDO);
    }
  }



  async restoreIntent(pos, object){
    let restoreAction = object.type;
    let intent = object.intent;
    let intentsToUpdate = object.intentsToUpdate;
    console.log('[INTENT SERVICE] -> restoreAction : typeAction:', restoreAction, intentsToUpdate);


    if(restoreAction == 'DEL'){
      this.deleteIntentToListOfIntents(intent.intent_id);
      this.refreshIntents();
      intentsToUpdate.forEach(element => {
        console.log('[INTENT SERVICE] -> update:', element);
        this.replaceIntent(element);
        // this.refreshIntent(element);
        this.updateIntent(element);
        this.connectorService.updateConnector(element.intent_id);
      });
      this.deleteIntent(intent, true);
      return;
    } 

    if(restoreAction == 'PUSH'){
      this.listOfIntents = this.insertItemIntoPositionInTheArray(this.listOfIntents, intent, pos);
      let isOnTheStage = await this.isElementOnTheStage(intent.intent_id);
      console.log('[INTENT SERVICE] -> restoreAction', isOnTheStage, intent.intent_id);
      if(isOnTheStage){
        this.connectorService.createConnectorsOfIntent(intent);
      }
      this.refreshIntents();
      intentsToUpdate.forEach(element => {
        this.replaceIntent(element);
        this.updateIntent(element);
        this.connectorService.updateConnector(element.intent_id);
      });
      this.saveNewIntent(intent, true);
      return
    }

    if(restoreAction == 'PUT'){ 
        console.log('[INTENT SERVICE] -> PUT ', intent);
        // this.replaceIntent(intent);
        // this.refreshIntents();
        // this.updateIntent(intent, 0, null, true);
    } 
  }





  public addUNDOactionToList(intent, type){
    const lastUNDO = this.arrayUNDO[this.arrayUNDO.length - 1];
    const lastREDO = this.arrayREDO[this.arrayREDO.length - 1];
    let pos = 0;
    let intentPrev = this.prevListOfIntent.find((obj) => obj.intent_id === intent.intent_id);
    console.log('[INTENT SERVICE] START ----------------> addUNDOactionToList', intent, type);
    console.log('[INTENT SERVICE] -> addUNDOactionToList', this.arrayUNDO, this.arrayREDO);
    pos =  this.prevListOfIntent.findIndex((element) => { return element.intent_id === intent.intent_id });
    if(type == 'PUSH'){
      // CASO 1: ho creato un intet da una action trascinata da un altro intent
      // cerco tutti gli intents che hanno una action con lo stasso id della action creata
      // if(this.lastActionSavedInUndoRedo && intent.intent_id == this.lastActionSavedInUndoRedo.intent.intent_id)return;
    } 
    // else if(type == 'DEL'){
    //   if(this.lastActionSavedInUndoRedo && intent.intent_id == this.lastActionSavedInUndoRedo.intent.intent_id)return;
    // } else if(type == 'PUT'){
    //   // intent = this.prevListOfIntent.find((obj) => obj.intent_id === intent.intent_id);
    //   if(typeAction == 'CON+' || typeAction == 'CON-'){
    //     // intent = this.prevListOfIntent.find((obj) => obj.intent_id === intent.intent_id);
    //     // type = "CON";
    //     console.log('[INTENT SERVICE] -> lastUNDO', lastUNDO, connector);
    //     if(lastUNDO && lastUNDO.typeAction == typeAction && lastUNDO.connector == connector){
    //       console.log('[INTENT SERVICE] -> vengo da un REDO di PUT');
    //       return;
    //     }
    //     console.log('[INTENT SERVICE] -> lastREDO', lastREDO, connector);
    //     if(lastREDO && lastREDO.typeAction == typeAction && lastREDO.connector == connector){
    //       console.log('[INTENT SERVICE] -> vengo da un UNDO di PUT');
    //       return;
    //     }


    //   } else {
    //     typeAction = "PUT";
    //     intent = intentPrev;

    //   }
    // }

    // const obj = {
    //   type: type,
    //   typeAction: typeAction,
    //   pos: pos,
    //   intent: {...intent},
    //   intentsToUpdate: [],
    //   connector: connector,
    //   connectors: connectors
    // }
    const obj = {
      type: type,
      pos: pos,
      intent: {...intent},
      intentsToUpdate: [],
    }
    this.arrayUNDO.push(obj);
    console.log('[INTENT SERVICE] -> AGGIUNGO ', obj, this.arrayUNDO, this.arrayREDO);
    // this.arrayUNDO = this.arrayUNDO.slice(10);
    this.arrayREDO = [];
    this.lastActionSavedInUndoRedo = obj;
  }

  private insertItemIntoPositionInTheArray(array, item, pos = array.length) {
    if (pos < 0 || pos > array.length) {
      console.error("ERROR invalid position.");
      // return;
      pos = array.length;
    }
    array.splice(pos, 0, item);
    return array;
  }

  private async isElementOnTheStage(id): Promise<boolean>{
    return new Promise((resolve) => {
      let intervalId = setInterval(async () => {
        const result = document.getElementById(id);
        if (result) {
          clearInterval(intervalId);
          resolve(true);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(intervalId);
        resolve(false);
      }, 2000);
    });
  }

  // async restoreLastUNDO(){
  //   console.log('[INTENT SERVICE] -> restoreLastUNDO', this.arrayUNDO);
  //   if(this.arrayUNDO && this.arrayUNDO.length>0){
  //     const objUNDO = this.arrayUNDO.pop();
  //     const objREDO = {...objUNDO};
  //     if(objUNDO.typeAction == 'PUSH') objREDO.typeAction = 'DEL';
  //     else if(objUNDO.typeAction == 'DEL') objREDO.typeAction = 'PUSH';
  //     else if(objUNDO.typeAction == 'CON+')objREDO.typeAction = 'CON-'
  //     else if(objUNDO.typeAction == 'CON-')objREDO.typeAction = 'CON+';
  //     else if(objUNDO.typeAction == 'PUT'){
  //       objREDO.typeAction = 'PUT';
  //       let intent = this.listOfIntents.find((obj) => obj.intent_id === objUNDO.intent.intent_id);
  //       objREDO.intent = intent;
  //     }
  //     this.arrayREDO.push(objREDO);
  //     this.restoreAction(objUNDO, objUNDO.typeAction);
  //     console.log('[INTENT SERVICE] -> ho aggiornato gli array dopo UNDO ', this.arrayUNDO, this.arrayREDO);
  //   }
  // }

  // public restoreLastREDO(){
  //   console.log('[INTENT SERVICE] -> restoreLastREDO', this.arrayREDO);
  //   if(this.arrayREDO && this.arrayREDO.length>0){
  //     const objREDO = this.arrayREDO.pop();
  //     const objUNDO = {...objREDO};
  //     if(objREDO.typeAction == 'PUSH') objUNDO.typeAction = 'DEL';
  //     else if(objREDO.typeAction == 'DEL') objUNDO.typeAction = 'PUSH';
  //     else if(objREDO.typeAction == 'CON+') objUNDO.typeAction = 'CON-';
  //     else if(objREDO.typeAction == 'CON-') objUNDO.typeAction = 'CON+';
  //     else if(objREDO.typeAction == 'PUT') {
  //       objUNDO.typeAction = 'PUT';
  //       let intent = this.listOfIntents.find((obj) => obj.intent_id === objREDO.intent.intent_id);
  //       objUNDO.intent = intent;
  //     } 
  //     this.arrayUNDO.push(objUNDO);
  //     // this.restoreAction(objREDO, objREDO.typeAction);
  //     console.log('[INTENT SERVICE] -> ho aggiornato gli array dopo REDO ', this.arrayUNDO, this.arrayREDO);
  //   }
  // }


  // async restoreAction(action, typeAction){
  //   this.lastActionSavedInUndoRedo = action;
  //   console.log('[INTENT SERVICE] -> restoreAction : typeAction:', typeAction, action);
    
  //   if(typeAction == 'PUSH'){
  //     this.listOfIntents = this.insertItemIntoPositionInTheArray(this.listOfIntents, action.intent, action.pos);
  //     let isOnTheStage = await this.isElementOnTheStage(action.intent.intent_id);
  //     console.log('[INTENT SERVICE] -> restoreAction', isOnTheStage, action.intent.intent_id);
  //     if(isOnTheStage){
  //       action.connectors.forEach(connector => {
  //         console.log('[INTENT SERVICE] -> creo connector', connector);
  //         this.connectorService.createNewConnector(connector.fromId, connector.toId);
  //       });
  //     }
  //     this.refreshIntents();
  //     this.connectorService.updateConnector(action.intent.intent_id);
  //     this.saveNewIntent(action.intent, true);

  //   } else if(typeAction == 'DEL'){
  //     this.deleteIntentToListOfIntents(action.intent.intent_id);
  //     this.refreshIntents();
  //     this.connectorService.deleteConnectorsOfBlock(action.intent.intent_id);
  //     this.connectorService.updateConnector(action.intent.intent_id);
  //     this.deleteIntent(action.intent, true);
  //   } else if(typeAction == 'PUT'){ 
  //     console.log('[INTENT SERVICE] -> PUT >>>', action);
  //     this.replaceIntent(action.intent);
  //     this.refreshIntents();
  //     // let connectors = this.connectorService.searchConnectorsOfIntent(action.intent.intent_id);
  //     // this.connectorService.updateConnectorsOutOfItent(action.intent);
  //     // recupero tutti i connector dell'intent
  //     // per ogni connector verifico se esiste
  //     // se ESISTE lo aggiorno
  //     // ALTRIMENTI lo creo
  //     // 
  //     this.updateIntent(action.intent, 0, null, true);

  //     // this.connectorService.deleteConnectorsOutOfBlock(action.intent.intent_id);
  //     // let isOnTheStage = await this.isElementOnTheStage(action.intent.intent_id);
  //     // console.log('[INTENT SERVICE] -> restoreAction', isOnTheStage, action.intent.intent_id);
  //     // if(isOnTheStage){
  //     //   action.connectors.forEach(connector => {
  //     //     console.log('[INTENT SERVICE] -> creo connector', connector);
  //     //     this.connectorService.createNewConnector(connector.fromId, connector.toId);
  //     //   });
  //     // }

  //     // 
  //     // this.connectorService.createConnectorsOfIntent(action.intent.intent_id);
  //     this.connectorService.updateConnector(action.intent.intent_id);
  //     // this.refreshIntent(action.intent);
      
  //   } else if(typeAction == 'CON+'){ 
  //     console.log('[INTENT SERVICE] : AGGIUNGO CONNETTORE', action.connector);
  //     // console.log('[INTENT SERVICE] -> CON', action);
  //     let fromId = action.connector;
  //     let toId = '';
  //     const ultimoSlashIndex = action.connector.lastIndexOf('/');
  //     if (ultimoSlashIndex !== -1) {
  //       fromId = action.connector.substring(0, ultimoSlashIndex);
  //       toId = action.connector.substring(ultimoSlashIndex + 1);
  //       this.connectorService.createConnectorFromId(fromId, toId);
  //     } else {
  //       // console.log('[INTENT SERVICE] NON creo CONNETTORE');
  //     }
  //   } else if(typeAction == 'CON-'){ 
  //     const actionId = action.connector.split('/');
  //     console.log('[INTENT SERVICE] : ELIMINO CONNETTORE', actionId[0], action.connector);
  //     this.connectorService.deleteConnectorFromAction(actionId[0], action.connector);
  //   }
  // }

  private replaceIntent(intent){
    for (let i = 0; i < this.listOfIntents.length; i++) {
      if ( this.listOfIntents[i].intent_id === intent.intent_id) {
        this.listOfIntents[i] = intent;
        break;
      }
    }
  }
  /************************************************/

}
