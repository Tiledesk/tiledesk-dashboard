import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Intent, Command } from '../../../../models/intent-model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TYPE_COMMAND, TYPE_RESPONSE, TIME_WAIT_DEFAULT, TYPE_MESSAGE } from '../../../utils';

@Component({
  selector: 'appdashboard-panel-response',
  templateUrl: './panel-response.component.html',
  styleUrls: ['./panel-response.component.scss']
})
export class PanelResponseComponent implements OnInit {
  @Output() openButtonPanel = new EventEmitter();
  @Output() saveIntent = new EventEmitter();
  @Input() intent: Intent;
  @Input() showSpinner: boolean;
  
  // @Input() arrayResponses: Array<Command>;

  typeCommand = TYPE_COMMAND;
  typeResponse = TYPE_RESPONSE;
  typeMessage = TYPE_MESSAGE;
  intentName: string;
  intentNameResult: boolean;
  textGrabbing: boolean;
  arrayResponses: Array<Command>;

  constructor() { }

  // SYSTEM FUNCTIONS //
  ngOnInit(): void {
    console.log('ngOnInit panel-response', this.intent);
    this.initialize();
  }
  
  // CUSTOM FUNCTIONS //
  /** */
  private initialize(){
    this.arrayResponses = [];
    this.intentName = '';
    this.intentNameResult = true;
    this.textGrabbing = false;
    try {
      this.intentName = this.intent.intent_display_name;
    } catch (error) {
      console.log('there is not reply', error);
    }
    if(this.intent.reply){
      try {
        this.arrayResponses = this.intent.reply.attributes.commands;
      } catch (error) {
        console.log('error:::', error);
      }
    }
    this.generateArrayResponse();
  }

  /** */
  private generateArrayResponse(){
    var time = TIME_WAIT_DEFAULT;
    try {
      this.arrayResponses.forEach(element => {
        if(element.type === TYPE_COMMAND.WAIT) {
          time = element.time;
        }
        if(element.type === TYPE_COMMAND.MESSAGE){
          element.time = time;
          time = TIME_WAIT_DEFAULT;
        }
      });
    } catch (error) {
      console.log(error);
    }
    
    console.log('generateArrayResponse:::', this.arrayResponses);
  }

  /** */
  private updateArrayResponse(){
    let newArrayCommands = []; 
    this.arrayResponses.forEach(element => {
      if(element.type !== TYPE_COMMAND.WAIT){
        let command =  new Command();
        command.type = TYPE_COMMAND.WAIT;
        command.time = element.message.time;
        newArrayCommands.push(command);
        command =  new Command();
        command.type = element.type;
        element.time = element.message.time;
        command.message = element.message;
        newArrayCommands.push(command);
      }
    });
    this.arrayResponses = newArrayCommands;
  }


  // /** */
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
