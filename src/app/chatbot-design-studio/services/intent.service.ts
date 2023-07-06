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
  Command, Message, Expression } from 'app/models/intent-model';
import { FaqService } from 'app/services/faq.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { TYPE_ACTION, TYPE_COMMAND } from 'app/chatbot-design-studio/utils';


/** CLASSE DI SERVICES PER TUTTE LE AZIONI RIFERITE AD OGNI SINGOLO INTENT **/

@Injectable({
  providedIn: 'root'
})
export class IntentService {
  idBot: string;
  intents = new BehaviorSubject <Intent[]>([]);
  listOfActions: Array<{ name: string, value: string, icon?: string }>;

  // keyDashboardAttributes = 'stage';//'Dashboard-Attributes';
  // jsonDashboardAttributes: any;

  preDisplayName: string = 'untitled_block_';

  botAttributes: any = {};
  // listOfConnectors: any = {};
  listOfPositions: any = {};

  private changedConnector = new Subject<any>();
  public isChangedConnector$ = this.changedConnector.asObservable();

  constructor(
    private faqService: FaqService,
    private faqKbService: FaqKbService
  ) { 

  }


  public onChangedConnector(connector){
    console.log('onChangedConnector:: ', connector);
    this.changedConnector.next(connector);
  }


  getIntents() {
    return this.intents.asObservable();
  }

  // updateIntents(newIntents: Intent[]) {
  //   this.intents.next(newIntents);
  // }

  // START DASHBOARD FUNCTIONS //

  /** */
  setDashboardAttributes(idBot, attributes){
    this.botAttributes = attributes;
    this.idBot = idBot;
    if(attributes && attributes['positions']){
      this.listOfPositions = attributes['positions'];
    }
    // if(attributes && attributes['connectors']){
    //   this.listOfConnectors = attributes['connectors'];
    // }
  }

  /** */
  setPositionsInDashboardAttributes(json){
    this.listOfPositions = json;
    this.botAttributes['positions'] = this.listOfPositions;
    this.patchAttributes(this.botAttributes);
    // let key = this.keyDashboardAttributes;
    // this.setFromLocalStorage(key, json);
  }

  /** */
  // setConnectorsInDashboardAttributes(json){
  //   // let key = this.keyDashboardAttributes;
  //   // this.setFromLocalStorage(key, json);
  //   this.listOfConnectors = json;
  //   this.botAttributes['connectors'] = this.listOfConnectors;
  //   this.patchAttributes(this.botAttributes);
  // }


  /** Get Intent position */    
  getIntentPosition(id: string){
    let pos = {'x':0, 'y':0};
    const positions = this.listOfPositions;
    if(!positions)return pos;
    if(positions && positions[id]){
      return positions[id];
    }
    return pos;
  }

  /** Set intent position */
  setIntentPosition(id:string, newPos: any){
    const positions = this.listOfPositions;
    if(positions){
      if(!newPos && positions[id]){
        positions[id].remove();
      } else {
        positions[id] =  {'x': newPos.x, 'y': newPos.y};
      }
      this.setPositionsInDashboardAttributes(positions);
    }
  }


  // private setFromLocalStorage(key, data){
  //   const json = JSON.stringify(data);
  //   localStorage.setItem(key, json);
  // }

  // private getFromLocalStorage(key){
  //   const savedJson = localStorage.getItem(key);
  //   const savedData = JSON.parse(savedJson);
  //   return savedData;
  // }

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
          // resolve(true);
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

  public createIntent(id_faq_kb: string, actionType: TYPE_ACTION){
    let intent = new Intent();
    intent.id_faq_kb = id_faq_kb;
    intent.intent_display_name = this.setDisplayName();
    let action = this.createAction(actionType);
    intent.actions.push(action);
    return intent;
    //this.creatIntent(this.intent);
  }

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
  
  
  public async addNewIntent(id_faq_kb, newIntent): Promise<any> { 
    let newIntents = this.intents.getValue();
    newIntents.push(newIntent); 
    console.log("Aggiungo un intent all'array in ultima posizione con id fake");
    // this.updateIntents(newIntents);
    return new Promise((resolve, reject) => {
      let questionIntentSelected = newIntent.question;
      let answerIntentSelected = newIntent.answer;
      let displayNameIntentSelected = newIntent.intent_display_name;
      let formIntentSelected = newIntent.form;
      let actionsIntentSelected = newIntent.actions;
      let webhookEnabledIntentSelected = newIntent.webhook_enabled;
      const that = this;
      this.faqService.addIntent(
        id_faq_kb,
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
        console.log('ADDED');
        resolve(intent.id);
      }, (error) => {
        console.error('ERROR: ', error);
        reject(false);
      }, () => {
        console.log('COMPLETE ');
        resolve(false);
      });
    });
  }


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
      console.log('id: ', id);
      console.log('attributes: ', attributes);
      console.log('questionIntent: ', questionIntent);
      console.log('answerIntent: ', answerIntent);
      console.log('displayNameIntent: ', displayNameIntent);
      console.log('formIntent: ', formIntent);
      console.log('actionsIntent: ', actionsIntent);
      console.log('webhookEnabledIntent: ', webhookEnabledIntent);

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
        console.log('EDIT ', intent);
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


  public async deleteIntent(intentId: string): Promise<boolean> { 
    return new Promise((resolve, reject) => {
      this.faqService.deleteFaq(intentId).subscribe((data) => {
        let newIntents = this.intents.getValue();
        newIntents = newIntents.filter(obj => obj.id !== intentId);
        this.intents.next(newIntents);
        console.log('DELETE ', intentId);
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

  // END INTENT FUNCTIONS //


  // START ATTRIBUTE FUNCTIONS //
  public createAction(typeAction: TYPE_ACTION) {
    let action: any;
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


  setListOfActions(intents){
    // .pipe(map((response: any) => response.json()));
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

  getListOfActions(){
    return this.listOfActions;
  }
  // END ATTRIBUTE FUNCTIONS //
  


  patchAttributes(attributes: any) {
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

}
