import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

export enum TYPE {
  TEXT = 'text', 
  RANDOM_TEXT = 'randomText', 
  IMAGE = 'image', 
  FORM = 'form', 
  VIDEO = 'video'
}

@Component({
  selector: 'appdashboard-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['../dashboard.component.scss', './tools.component.scss']
})
export class ToolsComponent implements OnInit {
  @Input() arrayResponses: Array<any>;

  items: Array<string> = [];
  showSpinner:boolean = false;
  Type = TYPE;
  
  constructor() { 
    // console.log('constructor);
  }

  ngOnInit(): void {
    // console.log('ngOnInit);
  }


  addElement(type: TYPE){
    if(type === TYPE.TEXT){
      this.arrayResponses.push({
        messages: ["ciao"],
        delay: 1.5,
        buttons: []
      });
    }
  }



  drop(event: CdkDragDrop<string[]>) {
    // drag
  }

}
