import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { TYPE_MESSAGE, TYPE_COMMAND } from 'app/chatbot-design-studio/utils';
import { Message, Command } from 'app/models/intent-model';

@Component({
  selector: 'cds-action-reply-tools',
  templateUrl: './cds-action-reply-tools.component.html',
  styleUrls: ['./cds-action-reply-tools.component.scss']
})
export class CdsActionReplyToolsComponent implements OnInit {

  @Output() addNewActionReply = new EventEmitter();

  TypeMessage = TYPE_MESSAGE;

  constructor() { }

  ngOnInit(): void {
  }


  addElement(type: TYPE_MESSAGE){
    // console.log('addElement---->', type);
    var newElement:Command;
    switch (type) {
      case TYPE_MESSAGE.TEXT:
        newElement = {
          type: TYPE_COMMAND.MESSAGE,
          message: {
            text: '',
            type: TYPE_MESSAGE.TEXT
          },
        } 
        break;
      case TYPE_MESSAGE.IMAGE:
        newElement = {
          type: TYPE_COMMAND.MESSAGE,
          message: {
            text: '',
            type: TYPE_MESSAGE.IMAGE,
            metadata: {
              src: '',
              // width: MESSAGE_METADTA_WIDTH,
              // height: MESSAGE_METADTA_HEIGHT
            }
          },
        } 
        break;
      case TYPE_MESSAGE.FRAME:
        newElement = {
          type: TYPE_COMMAND.MESSAGE,
          message: {
            text: '',
            type: TYPE_MESSAGE.FRAME,
            metadata: {
              src: '',
              // width: MESSAGE_METADTA_WIDTH,
              // height: MESSAGE_METADTA_HEIGHT
            }
          },
        } 
        break;
      default:
        break;
    }
    this.addNewActionReply.emit(newElement);
  }

}
