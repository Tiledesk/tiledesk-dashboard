import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { Message, Command } from '../../../../models/intent-model';
import { 
  TYPE_COMMAND, 
  TYPE_MESSAGE, 
  TYPE_BUTTON, 
  TIME_WAIT_DEFAULT,
  MESSAGE_METADTA_WIDTH,
  MESSAGE_METADTA_HEIGHT 
} from '../../../utils';

@Component({
  selector: 'appdashboard-panel-intent-tools',
  templateUrl: './panel-intent-tools.component.html',
  styleUrls: ['../../dashboard.component.scss', './panel-intent-tools.component.scss']
})
export class PanelIntentToolsComponent implements OnInit {
  @Output() addNewResponse = new EventEmitter();

  items: Array<string> = [];
  showSpinner:boolean = false;
  // TypeCommand = TYPE_COMMAND;
  TypeMessage = TYPE_MESSAGE;
  
  constructor() { 
    // console.log('constructor);
  }

  ngOnInit(): void {
    // console.log('ngOnInit);
  }


  addElement(type: TYPE_MESSAGE){
    console.log('addElement---->', type);
    var newElement:Command;
    switch (type) {
      case TYPE_MESSAGE.TEXT:
        newElement = {
          type: TYPE_COMMAND.MESSAGE,
          message: {
            text: '',
            type: TYPE_MESSAGE.TEXT,
            time: TIME_WAIT_DEFAULT
          },
        } 
        break;
      case TYPE_MESSAGE.IMAGE:
        newElement = {
          type: TYPE_COMMAND.MESSAGE,
          message: {
            text: '',
            type: TYPE_MESSAGE.IMAGE,
            time: TIME_WAIT_DEFAULT,
            metadata: {
              src: '',
              width: MESSAGE_METADTA_WIDTH,
              height: MESSAGE_METADTA_HEIGHT
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
            time: TIME_WAIT_DEFAULT,
            metadata: {
              src: '',
              width: MESSAGE_METADTA_WIDTH,
              height: MESSAGE_METADTA_HEIGHT
            }
          },
        } 
        break;
      default:
        break;
    }
    this.addNewResponse.emit(newElement);
  }



  drop(event: CdkDragDrop<string[]>) {
    // drag
  }

}
