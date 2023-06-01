import { Injectable } from '@angular/core';
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
  preDisplayName: string = 'untitled_block_';
  listOfIntents: any


   /** GET ALL INTENTS  */
  //  private async getAllIntents(id_faq_kb): Promise<boolean> { 
  //   return new Promise((resolve, reject) => {
  //     this.faqService._getAllFaqByFaqKbId(id_faq_kb).subscribe((faqs: Intent[]) => {
  //       if (faqs) {
  //         this.listOfIntents = JSON.parse(JSON.stringify(faqs));
  //       }
  //       console.log('getAllIntents: ',faqs);
  //       // this.setDragConfig();
  //       setTimeout(() => {
  //         this.setDragAndListnerEventToElements();
  //       }, 0);
  //       resolve(true);
  //     }, (error) => {
  //       this.logger.error('ERROR: ', error);
  //       reject(false);
  //     }, () => {
  //       this.logger.log('COMPLETE ');
  //       resolve(true);
  //     });
  //   });
  // }



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
