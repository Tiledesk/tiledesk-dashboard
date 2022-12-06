import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Intent, Message, Command } from '../../../models/intent-model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TYPE_MESSAGE, TIME_WAIT_DEFAULT } from '../../utils';

@Component({
  selector: 'appdashboard-intent',
  templateUrl: './intent.component.html',
  styleUrls: ['./intent.component.scss']
})
export class IntentComponent implements OnInit {
  @Output() openButtonPanel = new EventEmitter();
  @Output() saveIntent = new EventEmitter();
  @Input() intent: Intent;
  @Input() showSpinner: boolean;
  
  // @Input() arrayResponses: Array<Command>;

  typeMessage = TYPE_MESSAGE;
  intentName: string;
  intentNameResult: boolean;
  textGrabbing: boolean;
  arrayResponses: Array<Command>;

  constructor() { }

  // SYSTEM FUNCTIONS //
  ngOnInit(): void {
    this.initialize();
  }
  
  // CUSTOM FUNCTIONS //
  /** */
  private initialize(){
    this.intentName = '';
    try {
      this.intentName = this.intent.intent_display_name;
    } catch (error) {
      console.log('there is not reply', error);
    }
    this.intentNameResult = true;
    try {
      this.arrayResponses = this.intent.reply.attributes.commands;
    } catch (error) {
      console.log('error:::', error);
    }
    this.textGrabbing = false;
    this.generateArrayResponse();
  }

  /** */
  private generateArrayResponse(){
    var time = TIME_WAIT_DEFAULT;
    this.arrayResponses.forEach(element => {
      if(element.type === TYPE_MESSAGE.WAIT) {
        time = element.time;
      }
      if(element.type === TYPE_MESSAGE.MESSAGE){
        element.time = time;
        time = TIME_WAIT_DEFAULT;
      }
    });
  }

  /** */
  private updateArrayResponse(){
    let newArrayCommands = []; 
    this.arrayResponses.forEach(element => {
      if(element.type === TYPE_MESSAGE.MESSAGE){
        let command =  new Command();
        command.type = TYPE_MESSAGE.WAIT;
        command.time = element.message.time;
        newArrayCommands.push(command);
        command =  new Command();
        command.type = TYPE_MESSAGE.MESSAGE;
        element.time = element.message.time;
        command.message = element.message;
        newArrayCommands.push(command);
      }
    });
    this.arrayResponses = newArrayCommands;
  }


  /** */
  private checkIntentName(): boolean {
    //setTimeout(() => {
      if (!this.intentName || this.intentName.length === 0){
        //this.intentNameResult = false;
        return false; 
      } else {
        this.intent.intent_display_name = this.intentName;
        //this.intentNameResult = true;
        return true;
      }
    //}, 300);
  }


  // EVENT FUNCTIONS //
  /** */
  mouseDown(){
    this.textGrabbing = true;
  }

  /** */
  mouseUp(){
    this.textGrabbing = false;
  }

  /** */
  drop(event: CdkDragDrop<string[]>) {
    this.textGrabbing = false;
    moveItemInArray(this.arrayResponses, event.previousIndex, event.currentIndex);
  }

  /** */
  onDeleteResponse(index:number){
    this.arrayResponses.splice(index, 1); 
  }

  /** */
  onMoveUpResponse(index:number){
    if(index>0){
      let to = index-1;
      let from = index;
      this.arrayResponses.splice(to,0,this.arrayResponses.splice(from,1)[0]);
    }
  }

  /** */
  onMoveDownResponse(index:number){
    if(index<this.arrayResponses.length-1){
      let to = index+1;
      let from = index;
      this.arrayResponses.splice(to,0,this.arrayResponses.splice(from,1)[0]);
    }
  }

  /** */
  onChangeIntentName(name: string){
    name.toString();
    try {
      this.intentName = name.replace(/[^A-Z0-9_]+/ig, "");
    } catch (error) {
      console.log('name is not a string', error)
    }
  }

  /** */
  onBlurIntentName(name: string){
    this.intentNameResult = true;
  }
 
  /** */
  onSaveIntent(){
    //console.log('onSaveIntent:: ', this.intent, this.arrayResponses);
    this.intentNameResult = this.checkIntentName();
    this.updateArrayResponse();
    if(this.intentNameResult){
      this.saveIntent.emit(this.intent);
    }
  }

  /** */
  onOpenButtonPanel(event){
    this.openButtonPanel.emit(event);
  }
}
