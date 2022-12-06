import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { Message, Command } from '../../../models/intent-model';
import { TYPE_MESSAGE, TYPE_RESPONSE, TYPE_BUTTON, TIME_WAIT_DEFAULT } from '../../utils';

@Component({
  selector: 'appdashboard-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['../dashboard.component.scss', './tools.component.scss']
})
export class ToolsComponent implements OnInit {
  @Output() addNewResponse = new EventEmitter();

  items: Array<string> = [];
  showSpinner:boolean = false;
  Type = TYPE_RESPONSE;
  
  constructor() { 
    // console.log('constructor);
  }

  ngOnInit(): void {
    // console.log('ngOnInit);
  }


  addElement(type: TYPE_RESPONSE){
    var newElement:Command;
    if(type === this.Type.TEXT){
      newElement = {
        type: TYPE_MESSAGE.MESSAGE,
        message: {
          text: '',
          type: TYPE_BUTTON.TEXT,
          time: TIME_WAIT_DEFAULT
        },
      } 
      this.addNewResponse.emit(newElement);
    }
  }



  drop(event: CdkDragDrop<string[]>) {
    // drag
  }

}
