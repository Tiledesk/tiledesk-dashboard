import { Injectable } from '@angular/core';
import { FaqService } from '../../services/faq.service';

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
  ActionJsonCondition,
  ActionOnlineAgent,
  ActionOpenHours,
  ActionRandomReply,
  ActionReplaceBot,
  ActionWait,
  ActionWebRequest,
  Command, Message, Expression } from '../../models/intent-model';
import { TYPE_ACTION, TYPE_COMMAND, TYPE_INTENT_ELEMENT, EXTERNAL_URL, TYPE_MESSAGE, TIME_WAIT_DEFAULT } from '../utils';


@Injectable({
  providedIn: 'root'
})
export class IntentService {

  // listOfIntents: Array<Intent>;
  keyDashboardAttributes = 'Dashboard-Attributes';
  jsonDashboardAttributes: any;
  preDisplayName: string = 'untitled_block_';
  listOfIntents: any;



  constructor(
    private faqService: FaqService
  ) { }

 

  setDashboardAttributes(data){
    // Dati da salvare come JSON
    let key = this.keyDashboardAttributes;
    this.setFromLocalStorage(key, data);
  }


  getDashboardAttributes(){
    let key = this.keyDashboardAttributes;
    const savedData = this.getFromLocalStorage(key);
    if(savedData){
      this.jsonDashboardAttributes = savedData;
    } else {
      this.jsonDashboardAttributes = {
        intents: []
      }
    }
    return this.jsonDashboardAttributes;
  }


  private setFromLocalStorage(key, data){
    const json = JSON.stringify(data);
    localStorage.setItem(key, json);
  }


  private getFromLocalStorage(key){
    const savedJson = localStorage.getItem(key);
    const savedData = JSON.parse(savedJson);
    return savedData;
  }




  

  /** GET ALL INTENTS  */
  public async getAllIntents(id_faq_kb): Promise<boolean> { 
    return new Promise((resolve, reject) => {
      this.faqService._getAllFaqByFaqKbId(id_faq_kb).subscribe((faqs: Intent[]) => {
        if (faqs) {
          this.listOfIntents = JSON.parse(JSON.stringify(faqs));
        }
        console.log('getAllIntents: ',faqs);
        // this.setDragConfig();
        // setTimeout(() => {
        //   // this.setDragAndListnerEventToElements();
        // }, 0);
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


  public async createIntent(id_faq_kb, newIntent): Promise<string> { 
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
      ).subscribe((intent) => {
        console.log('addIntent: ************************', intent['id']);
        resolve(intent['id']);
      }, (error) => {
          console.error('ERROR: ', error);
          reject(false);
      }, () => {
          console.log('COMPLETE ');
          resolve(null);
      });
    });
  }

  public async editIntent(intent): Promise<boolean> { 
    return new Promise((resolve, reject) => {
      let id = intent.id;
      let attributes = intent.attributes;
      let questionIntent = intent.question;
      let answerIntent = intent.answer;
      let displayNameIntent = intent.intent_display_name;
      let formIntent = {};
      if (intent.form !== null) {
        formIntent = intent.form;
      }
      let actionsIntent = intent.actions;
      let webhookEnabledIntent = intent.webhook_enabled;
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
        console.log('edit intent: ', intent);
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
      


  public addNewIntent(id_faq_kb: string, listOfIntents:Array<Intent>, actionType: string){
    let intent = new Intent();
    intent.id_faq_kb = id_faq_kb;
    intent.intent_display_name = this.setDisplayName(listOfIntents);
    let action = this.addActionToIntent(actionType);
    intent.actions.push(action);
    return intent;
    //this.creatIntent(this.intent);
  }


  public addActionToIntent(actionType){
    let action = this.createAction(actionType);
    //new ActionReply();
    let commandWait = new Command(TYPE_COMMAND.WAIT);
    action.attributes.commands.push(commandWait);
    let command = new Command(TYPE_COMMAND.MESSAGE);
    command.message = new Message('text', 'A chat message will be sent to the visitor');
    action.text = command.message.text;
    action.attributes.commands.push(command);
    return action;
  }


  public setDisplayName(listOfIntents){
    const filteredArray = listOfIntents.filter((element) => element.intent_display_name.startsWith(this.preDisplayName));
    if(filteredArray.length>0){
      const lastElement = filteredArray.slice(-1)[0];
      const intent_display_name = parseInt(lastElement.intent_display_name.substring(this.preDisplayName.length));
      return this.preDisplayName+(intent_display_name+1);
    } else {
      return this.preDisplayName+1;
    }
  }


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
  
}
