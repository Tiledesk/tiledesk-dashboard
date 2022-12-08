import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { Message, Command } from '../../../models/intent-model';
import { 
  TYPE_COMMAND, 
  TYPE_MESSAGE, 
  TYPE_BUTTON, 
  TIME_WAIT_DEFAULT,
  MESSAGE_METADTA_WIDTH,
  MESSAGE_METADTA_HEIGHT 
} from '../../utils';

@Component({
  selector: 'appdashboard-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['../dashboard.component.scss', './tools.component.scss']
})
export class ToolsComponent implements OnInit {
  @Output() addNewResponse = new EventEmitter();

  items: Array<string> = [];
  showSpinner:boolean = false;
  TypeCommand = TYPE_COMMAND;
  
  constructor() { 
    // console.log('constructor);
  }

  ngOnInit(): void {
    // console.log('ngOnInit);
  }


  addElement(type: TYPE_COMMAND){
    console.log('addElement---->', type);
    var newElement:Command;
    switch (type) {
      case this.TypeCommand.MESSAGE:
        newElement = {
          type: this.TypeCommand.MESSAGE,
          message: {
            text: '',
            type: TYPE_MESSAGE.TEXT,
            time: TIME_WAIT_DEFAULT
          },
        } 
      break;
      case this.TypeCommand.IMAGE:
          newElement = {
            type: this.TypeCommand.IMAGE,
            message: {
              text: '',
              type: TYPE_MESSAGE.TEXT,
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
