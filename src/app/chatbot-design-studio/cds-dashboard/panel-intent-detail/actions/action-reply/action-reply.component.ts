import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Button, Message, Command, ActionReply, MessageWithWait, MessageAttributes } from '../../../../../models/intent-model';
import { TYPE_COMMAND, TYPE_RESPONSE, TYPE_BUTTON, TYPE_URL, TYPE_MESSAGE } from '../../../../utils';

@Component({
  selector: 'cds-action-reply',
  templateUrl: './action-reply.component.html',
  styleUrls: ['./action-reply.component.scss']
})
export class ActionReplyComponent implements OnInit {
  @ViewChild('scrollMe', { static: false }) scrollContainer: ElementRef;
  translateY: string;

  // @Output() openButtonPanel = new EventEmitter();
  // @Output() saveIntent = new EventEmitter();
  @Input() reply: ActionReply;
  @Input() listOfActions: Array<string>;
  
  // @Input() showSpinner: boolean;
  // @Input() openCardButton: boolean;
  
  response: MessageWithWait;
  openCardButton: boolean = false;
  buttonSelected: Button;
  newButton: boolean = false;

  typeCommand = TYPE_COMMAND;
  typeResponse = TYPE_RESPONSE;
  typeMessage = TYPE_MESSAGE;
  intentName: string;
  intentNameResult: boolean;
  textGrabbing: boolean;
  arrayResponses: Array<Command>;
  arrayMessagesWithWait: Array<MessageWithWait>;



  
  constructor() { }

  // SYSTEM FUNCTIONS //
  ngOnInit(): void {
    console.log('ngOnInit panel-response');
    // this.initialize();
  }
    
  ngOnChanges() {
    console.log('ActionReplyComponent ngOnChanges');
    this.initialize();

    // this.generateCommandsOfElements();
    // this.elementIntentSelectedType = this.elementIntentSelected.type;
  }

  
  /** */
  // ngAfterContentChecked(){
  //   console.log('ActionReplyComponent ngAfterContentChecked');
  //   setTimeout(() => {
  //     this.generateCommandsOfElements();
  //   }, 500); 
  // }

  // ngOnDestroy(){
  //   console.log('ActionReplyComponent ngOnDestroy');
  //   setTimeout(() => {
  //     this.generateCommandsOfElements();
  //   }, 500); 
  // }

  // ngDoCheck(){
  //   console.log('ActionReplyComponent ngDoCheck');
  // }



  // CUSTOM FUNCTIONS //
  /** */
  private initialize(){
    this.arrayResponses = [];
    this.arrayMessagesWithWait = [];
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
    this.generateCommandsOfElements();
    this.scrollToBottom();
  }


  /** */
  private generateCommandsWithWaitOfElements(){
    let replyArrayElements: Array<Command> = [];
    this.arrayMessagesWithWait.forEach(el => {
      if(el.time && el.time > 0){
        let elementWait = new Command(TYPE_COMMAND.WAIT);
        elementWait.time = el.time;
        replyArrayElements.push(elementWait);
      }
      let elementMessage = new Command(TYPE_COMMAND.MESSAGE);
      elementMessage.message = new Message(el.type, el.text);
      if(el.attributes){
        elementMessage.message.attributes = el.attributes;
      }
      if(el.metadata){
        elementMessage.message.metadata = el.metadata;
      }
      replyArrayElements.push(elementMessage);
    });
    this.reply.attributes.commands = replyArrayElements;
    console.log("replyArrayElements", replyArrayElements);
  }

  /** */
  private generateCommandsOfElements(){
    var time = 0;
    try {
      this.arrayResponses.forEach(element => {
        if(element.type === TYPE_COMMAND.WAIT){
          time = element.time;
        }
        if(element.type === TYPE_COMMAND.MESSAGE){
          let message = new MessageWithWait(element.message.type, element.message.text, time);
          if(element.message.attributes){
            message.attributes = element.message.attributes;
          }
          if(element.message.metadata){
            message.metadata = element.message.metadata;
          }
          console.log('MessageWithWait:::', message);
          this.arrayMessagesWithWait.push(message);
          time = 0;
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  /** */
  // private updateArrayResponse(){
  //   let newArrayCommands = []; 
  //   this.arrayResponses.forEach(element => {
  //     if(element.type !== TYPE_COMMAND.WAIT){
  //       let command =  new Command(TYPE_COMMAND.WAIT);
  //       command.time = element.message.time;
  //       newArrayCommands.push(command);
  //       command =  new Command(element.type);
  //       element.time = element.message.time;
  //       command.message = element.message;
  //       newArrayCommands.push(command);
  //     }
  //   });
  //   this.arrayResponses = newArrayCommands;
  // }


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
  }


  onAddNewResponse(element){
    console.log('onAddNewResponse:: ', element);
    try {
      let message = new MessageWithWait(element.message.type, element.message.text, 0);
      if(element.message.attributes){
        message.attributes = element.message.attributes;
      }
      if(element.message.metadata){
        message.metadata = element.message.metadata;
      }
      this.arrayMessagesWithWait.push(message);
      // this.reply.attributes.commands.push(element);
      this.scrollToBottom();
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
    moveItemInArray(this.arrayMessagesWithWait, event.previousIndex, event.currentIndex);
    this.generateCommandsWithWaitOfElements();
  }

  /** */
  onDeleteResponse(index:number){
    this.arrayMessagesWithWait.splice(index, 1); 
    this.generateCommandsWithWaitOfElements();
  }

  /** */
  onMoveUpResponse(index:number){
    if(index>0){
      let to = index-1;
      let from = index;
      this.arrayMessagesWithWait.splice(to,0,this.arrayMessagesWithWait.splice(from,1)[0]);
      this.generateCommandsWithWaitOfElements();
    }
  }

  /** */
  onMoveDownResponse(index:number){
    if(index<this.arrayMessagesWithWait.length-1){
      let to = index+1;
      let from = index;
      this.arrayMessagesWithWait.splice(to,0,this.arrayMessagesWithWait.splice(from,1)[0]);
      this.generateCommandsWithWaitOfElements();
    }
  }

  /** */
  onChangeDelayTimeReplyElement(){
    console.log('onChangeDelayTimeReplyElement ************', this.arrayMessagesWithWait);
    this.generateCommandsWithWaitOfElements();
  }

  /**onChangeTextareaReplyElement */
  onChangeTextareaReplyElement(){
    this.generateCommandsWithWaitOfElements();
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
  onDisableInputMessage(){
    try {
      this.reply.attributes.disableInputMessage = !this.reply.attributes.disableInputMessage;
    } catch (error) {
      console.log("Error: ", error);
    }
  }




private createNewButton(){
  this.buttonSelected =  {
    'value': '',
    'type': TYPE_BUTTON.TEXT,
    'target': TYPE_URL.BLANK,
    'link': '',
    'action': '',
    'show_echo': true
  };
  console.log('createNewButton :: ', this.buttonSelected);
}

  /** appdashboard-button-configuration-panel: onOpenButtonPanel */
  onOpenButtonPanel(event){
    console.log('onOpenButtonPanel :: ', event);
    this.response = event.refResponse;
    if(!event.button){
      console.log('new button  :: ', event.button);
      this.newButton = true;
      this.createNewButton();
    } else {
      this.newButton = false;
      this.buttonSelected = event.button;
    }

    console.log("listOfActions:: ", this.listOfActions);
    if (this.openCardButton === true) {
      this.onCloseButtonPanel();
    }
    this.openCardButton = true;
    console.log('buttonSelected :: ', this.buttonSelected);
  }

  /** appdashboard-button-configuration-panel: Save button */
  onSaveButton(button) {
    if(this.newButton){
      this.response.attributes.attachment.buttons.push(button);
    }
    console.log('onSaveButton222 :: ', button, this.response);
    this.openCardButton = false;
    this.generateCommandsWithWaitOfElements();
  }

  /** appdashboard-button-configuration-panel: Close button panel */
  onCloseButtonPanel() {
    console.log('onCloseButtonPanel :: ');
    this.openCardButton = false;
  }




}
