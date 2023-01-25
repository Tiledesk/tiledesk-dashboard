import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Intent, Command, ActionReply } from '../../../../../models/intent-model';
import { TYPE_COMMAND, TYPE_RESPONSE, TIME_WAIT_DEFAULT, TYPE_MESSAGE } from '../../../../utils';

@Component({
  selector: 'cds-action-reply',
  templateUrl: './action-reply.component.html',
  styleUrls: ['./action-reply.component.scss']
})
export class ActionReplyComponent implements OnInit {
  @ViewChild('scrollMe', { static: false }) scrollContainer: ElementRef;
  translateY: string;

  @Output() openButtonPanel = new EventEmitter();
  @Output() saveIntent = new EventEmitter();
  @Input() reply: ActionReply;
  @Input() showSpinner: boolean;

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
    // console.log('ngOnInit panel-response');
    // console.log(this.reply);
    // this.initialize();
  }

  // ngOnChanges(changes: SimpleChanges) {
  ngOnChanges() {
    // console.log('ngOnChanges', this.reply);
    this.initialize();
    //this.elementIntentSelectedType = this.elementIntentSelected.type;
  }
  
  // CUSTOM FUNCTIONS //
  /** */
  private initialize(){
    this.arrayResponses = [];
    this.intentName = '';
    this.intentNameResult = true;
    this.textGrabbing = false;
    if(this.reply){
      try {
        this.arrayResponses = this.reply.attributes.commands;
      } catch (error) {
        console.log('error:::', error);
      }
    }
    this.generateArrayResponse();
    this.scrollToBottom();
  }

  /** */
  private generateArrayResponse(){
    var time = TIME_WAIT_DEFAULT;
    try {
      this.arrayResponses.forEach(element => {
        if(element.type === TYPE_COMMAND.WAIT){
          time = element.time;
        }
        if(element.type === TYPE_COMMAND.MESSAGE){
          element.time = time;
          element.message.time = time;
          time = TIME_WAIT_DEFAULT;
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  /** */
  private updateArrayResponse(){
    let newArrayCommands = []; 
    this.arrayResponses.forEach(element => {
      if(element.type !== TYPE_COMMAND.WAIT){
        let command =  new Command(TYPE_COMMAND.WAIT);
        command.time = element.message.time;
        newArrayCommands.push(command);
        command =  new Command(element.type);
        element.time = element.message.time;
        command.message = element.message;
        newArrayCommands.push(command);
      }
    });
    this.arrayResponses = newArrayCommands;
  }


  /** */
  scrollToBottom(): void {

    setTimeout(() => {
      try {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        this.scrollContainer.nativeElement.animate({scrollTop:0}, '500');
      } catch(error) { 
        console.log('scrollToBottom ERROR: ', error);
      }    
    }, 300);      

    // setTimeout(() => {
    //   this.translateY = "0px";
    //   try {
    //     let scrollHeight = this.scrollContainer.nativeElement.scrollHeight;
    //     console.log('scrollHeight:', scrollHeight);
    //     let elementPosition = this.scrollContainer.nativeElement.offsetHeight; //  .getBoundingClientRect().top;
    //     console.log('elementPosition:', elementPosition);
    //     let distance = elementPosition - scrollHeight;
    //     if (distance < 0) {
    //       this.translateY = 'translateY('+distance+'px)';
    //       console.log('scrollDistance:', this.translateY);
    //     }
    //   } catch(error) { 
    //     console.log('scrollToBottom ERROR: ', error);
    //   }    
    // }, 300);       
  }


  onAddNewResponse(element){
    try {
      this.reply.attributes.commands.push(element);
      this.scrollToBottom();
      // console.log('onAddNewResponse---->', this.reply.commands);
    } catch (error) {
      console.log('onAddNewResponse ERROR', error);
    }
  }


  // /** */
  // private checkIntentName(): boolean {
  //   //setTimeout(() => {
  //     if (!this.intentName || this.intentName.length === 0){
  //       //this.intentNameResult = false;
  //       return false; 
  //     } else {
  //       this.intent.intent_display_name = this.intentName;
  //       //this.intentNameResult = true;
  //       return true;
  //     }
  //   //}, 300);
  // }


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
  // onSaveIntent(){
  //   //console.log('onSaveIntent:: ', this.intent, this.arrayResponses);
  //   this.intentNameResult = this.checkIntentName();
  //   this.updateArrayResponse();
  //   if(this.intentNameResult){
  //     this.saveIntent.emit(this.intent);
  //   }
  // }

  /** */
  onOpenButtonPanel(event){
    this.openButtonPanel.emit(event);
  }

  /** */
  onDisableInputMessage(){
    try {
      this.reply.attributes.disableInputMessage = !this.reply.attributes.disableInputMessage;
    } catch (error) {
      console.log("Error: ", error);
    }
  }

}
