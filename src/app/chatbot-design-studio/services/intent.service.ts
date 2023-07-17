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
  Command, Message, Expression, Attributes } from 'app/models/intent-model';
import { FaqService } from 'app/services/faq.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { NEW_POSITION_ID, TYPE_ACTION, TYPE_COMMAND } from 'app/chatbot-design-studio/utils';
import { ConnectorService } from 'app/chatbot-design-studio/services/connector.service';


/** CLASSE DI SERVICES PER TUTTE LE AZIONI RIFERITE AD OGNI SINGOLO INTENT **/

@Injectable({
  providedIn: 'root'
})
export class IntentService {
  idBot: string;
  intents = new BehaviorSubject <Intent[]>([]);
  intent= new BehaviorSubject <Intent>(null);

  previousIntentId: string = '';
  preDisplayName: string = 'untitled_block_';

  listOfActions: Array<{ name: string, value: string, icon?: string }>;
  actionSelectedID: string;
  intentSelectedID: string;
  
  botAttributes: any = {};
  listOfPositions: any = {};

  // newPosition: any = {'x':0, 'y':0};

  private changedConnector = new Subject<any>();
  public isChangedConnector$ = this.changedConnector.asObservable();

  constructor(
    private faqService: FaqService,
    private faqKbService: FaqKbService,
    private connectorService: ConnectorService
  ) { 

  }


  public onChangedConnector(connector){
    console.log('onChangedConnector:: ', connector);
    this.changedConnector.next(connector);
  }


  getIntents() {
    return this.intents.asObservable();
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


  /** imposta quello che è l'intent di partenza quando inizia un drag su una action dell'intent */
  setPreviousIntentId(intentId){
    this.previousIntentId = intentId;
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
    let listOfIntents = this.intents.getValue();
    let intent = listOfIntents.find((intent) => intent.id === intentId);
    if(!intent.attributes || !intent.attributes.position)return pos;
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
    // if(intentId === NEW_POSITION_ID){
    //   this.newPosition = newPos;
    //   return;
    // }
    let listOfIntents = this.intents.getValue();
    let intentToUpdate = listOfIntents.find((intent) => intent.id === intentId);
    
    if(!intentToUpdate)return;
    if(!intentToUpdate.attributes)intentToUpdate.attributes = {};
    intentToUpdate.attributes['position'] = {'x': newPos.x, 'y': newPos.y};
    this.patchAttributes(intentId, intentToUpdate.attributes);
  }
  // END DASHBOARD FUNCTIONS //

  


  // START INTENT FUNCTIONS //

  /** GET ALL INTENTS  */
  public async getAllIntents(id_faq_kb): Promise<boolean> { 
    return new Promise((resolve, reject) => {
      this.faqService._getAllFaqByFaqKbId(id_faq_kb).subscribe((faqs: Intent[]) => {
        if (faqs) {
          // console.log('getAllIntents: ', faqs);
          let arrayOfIntents = JSON.parse(JSON.stringify(faqs));
          // this.updateIntents(arrayOfIntents);
          this.intents.next(arrayOfIntents);
          resolve(true);
        } 
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
  public createNewIntent(id_faq_kb: string, action: any){
    let intent = new Intent();
    intent.id_faq_kb = id_faq_kb;
    intent.intent_display_name = this.setDisplayName();
    intent.actions.push(action);
    return intent;
  }

  /** generate display name of intent */
  public setDisplayName(){
    let listOfIntents = this.intents.getValue();
    const filteredArray = listOfIntents.filter((element) => element.intent_display_name.startsWith(this.preDisplayName));
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
    let newIntents = this.intents.getValue();
    newIntents.push(newIntent); 
    console.log("Aggiungo un intent all'array in ultima posizione con id fake");
    return new Promise((resolve, reject) => {
      let questionIntentSelected = newIntent.question;
      let answerIntentSelected = newIntent.answer;
      let displayNameIntentSelected = newIntent.intent_display_name;
      let formIntentSelected = newIntent.form;
      let actionsIntentSelected = newIntent.actions;
      let webhookEnabledIntentSelected = newIntent.webhook_enabled;
      let attributes = newIntent.attributes;
      const that = this;
      this.faqService.addIntent(
        id_faq_kb,
        attributes,
        questionIntentSelected,
        answerIntentSelected,
        displayNameIntentSelected,
        formIntentSelected,
        actionsIntentSelected,
        webhookEnabledIntentSelected
      ).subscribe((intent:any) => {
        console.log("addIntent: sostituisto l'ultimo elemento dell'array aggiunto in precedenza, con quello salvato con un id valido");
        let newIntents = this.intents.getValue();
        newIntents[newIntents.length-1] = intent;
        this.intents.next(newIntents);
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
  public async updateIntent(intent: Intent): Promise<boolean> { 
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
      this.faqService.updateIntent(
        id,
        attributes,
        questionIntent,
        answerIntent,
        displayNameIntent,
        formIntent,
        actionsIntent,
        webhookEnabledIntent
      ).subscribe((intent) => {
        // console.log('EDIT ', intent);
        // this.intent.next(intent);
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

  /** deleteIntent */
  public async deleteIntent(intentId: string): Promise<boolean> { 
    return new Promise((resolve, reject) => {
      this.faqService.deleteFaq(intentId).subscribe((data) => {
        let newIntents = this.intents.getValue();
        newIntents = newIntents.filter(obj => obj.id !== intentId);
        this.intents.next(newIntents);
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
  public moveNewActionIntoIntent(event, action, currentIntentId){
    let newAction = this.createNewAction(action.value.type);
    let listOfIntents = this.intents.getValue();
    let currentIntent = listOfIntents.find(function(obj) {
      return obj.intent_id === currentIntentId;
    });
    console.log('currentIntentId: ', currentIntentId);
    currentIntent.actions.splice(event.currentIndex, 0, newAction);
    setTimeout(async () => {
      const responseCurrentIntent = await this.updateIntent(currentIntent);
      if(responseCurrentIntent){
        // console.log('update current Intent: OK');
      }
    }, 0);
  }

  // on move action from different intents
  public moveActionBetweenDifferentIntents(event, action, currentIntentId){
    const that = this;
    // console.log('moving action from another intent - action: ', event, action);
    let listOfIntents = this.intents.getValue();
    let currentIntent = listOfIntents.find(function(obj) {
      return obj.intent_id === currentIntentId;
    });
    let previousIntent = listOfIntents.find(function(obj) {
      return obj.intent_id === that.previousIntentId;
    });
    console.log('moveActionBetweenDifferentIntents: ', event, listOfIntents, currentIntentId, currentIntent, previousIntent);
    currentIntent.actions.splice(event.currentIndex, 0, action);
    previousIntent.actions.splice(event.previousIndex, 1);
    this.connectorService.deleteConnectorsFromActionByActionId(action._tdActionId);
    setTimeout(async () => {
      const responseCurrentIntent = await this.updateIntent(currentIntent);
      if(responseCurrentIntent){
        console.log('update current Intent: OK');
      }
      const responsePreviousIntent = await this.updateIntent(previousIntent);
      if(responsePreviousIntent){
        console.log('update previous Intent: OK');
      }
    }, 0);
  }

  
  // on move action from intent to stage
  public moveActionFromIntentToStage(event, action){
    const that = this;
    let listOfIntents = this.intents.getValue();
    let previousIntent = listOfIntents.find(function(obj) {
      return obj.intent_id === that.previousIntentId;
    });
    console.log('moveActionFromIntentToStage: ', event, listOfIntents, previousIntent);
    previousIntent.actions.splice(event.previousIndex, 1);
    this.connectorService.deleteConnectorsFromActionByActionId(action._tdActionId);
    setTimeout(async () => {
      const responsePreviousIntent = await this.updateIntent(previousIntent);
      if(responsePreviousIntent){
        console.log('update previous Intent: OK');
      }
    }, 0);
  }


  /** setListOfActions */
  public setListOfActions(intents){
    this.listOfActions = intents.map(a => {
      if (a.intent_display_name.trim() === 'start') {
        return { name: a.intent_display_name, value: '#' + a.intent_id, icon: 'rocket_launch' }
      } else if (a.intent_display_name.trim() === 'defaultFallback') {
        return { name: a.intent_display_name, value: '#' + a.intent_id, icon: 'undo' }
      } else {
        return { name: a.intent_display_name, value: '#' + a.intent_id, icon: 'label_important_outline' }
      }
    });
    console.log('this.listOfActions: ', this.listOfActions); 
  }

  /** getListOfActions */
  public getListOfActions(){
    return this.listOfActions;
  }

  /** selectAction */
  public selectAction(intentID, actionId){
    this.actionSelectedID = actionId;
    this.intentSelectedID = intentID;
  }

  /** unselectAction */
  public unselectAction(){
    this.actionSelectedID = null;
    this.intentSelectedID = null;
  }

  /** deleteSelectedAction */
  public deleteSelectedAction(){
    console.log('deleteSelectedAction', this.intentSelectedID, this.actionSelectedID);
    if(this.intentSelectedID && this.actionSelectedID){
      let listOfIntents = this.intents.getValue();
      let intentToUpdate = listOfIntents.find((intent) => intent.intent_id === this.intentSelectedID);
      intentToUpdate.actions = intentToUpdate.actions.filter((action: any) => action._tdActionId !== this.actionSelectedID);
      listOfIntents = listOfIntents.map((intent) => {
        if (intent.intent_id === this.intentSelectedID) {
          return intentToUpdate;
        }
        return intent;
      });

      this.connectorService.deleteConnectorsFromActionByActionId(this.actionSelectedID);
      setTimeout(async () => {
        const responseIntent = await this.updateIntent(intentToUpdate);
        if(responseIntent){
          // console.log('update Intent: OK');
        }
      }, 0);
      this.unselectAction();
      this.setListOfActions(listOfIntents);
      console.log('deleteSelectedAction', intentToUpdate);
      this.intent.next(intentToUpdate);
    }
  } 


  /** createNewAction */
  public createNewAction(typeAction: TYPE_ACTION) {
    let action: any;

  //   switch (typeAction) {
  //     case TYPE_ACTION.REPLY:
  //         return '';
  //     default:
  //         return '';
  // }

    if(typeAction === TYPE_ACTION.REPLY){
      action = new ActionReply();
      let commandWait = new Command(TYPE_COMMAND.WAIT);
      action.attributes.commands.push(commandWait);
      let command = new Command(TYPE_COMMAND.MESSAGE);
      command.message = new Message('text', 'A chat message will be sent to the visitor');
      action.attributes.commands.push(command);
    }
    if(typeAction === TYPE_ACTION.RANDOM_REPLY){
      action = new ActionRandomReply();
      let commandWait = new Command(TYPE_COMMAND.WAIT);
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
    return action;
  }
  // END ATTRIBUTE FUNCTIONS //
  




  

  OLD_patchAttributes(attributes: any) {
    console.log('-----------> patchAttributes, ', this.idBot);
    this.faqKbService.patchAttributes(this.idBot, attributes).subscribe((data) => {
        if (data) {
          console.log('data:   ', data);
        }
      }, (error) => {
        console.log('error:   ', error);
      }, () => {
        console.log('complete');
      });

  }

  patchAttributes(intentID: string, attributes: any) {
    console.log('-----------> patchAttributes, ', intentID, attributes);
    this.faqService.patchAttributes(intentID, attributes).subscribe((data) => {
        if (data) {
          console.log('data:   ', data);
        }
      }, (error) => {
        console.log('error:   ', error);
      }, () => {
        console.log('complete');
      });

  }

}
