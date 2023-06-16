import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { TYPE_ACTION, ACTIONS_LIST, TYPE_OF_MENU } from 'app/chatbot-design-studio/utils';

@Component({
  selector: 'cds-floating-menu',
  templateUrl: './cds-floating-menu.component.html',
  styleUrls: ['./cds-floating-menu.component.scss']
})
export class CdsFloatingMenuComponent implements OnInit {

  @Input() menuType: string;
  @Input() menuPoint: any;

  @Output() addingActionToStage = new EventEmitter();

  TYPE_ACTION = TYPE_ACTION;
  TYPE_OF_MENU = TYPE_OF_MENU;

  menuItemsList: any;

  constructor() { }

  ngOnInit() {
    console.log('ngOnChanges:: ', this.menuType);
    switch (this.menuType) {
      case TYPE_OF_MENU.ACTION:
        this.menuItemsList = Object.keys(ACTIONS_LIST).map(key => {
          return {
            type: key,
            value: ACTIONS_LIST[key]
          };
        });
        break;
      case TYPE_OF_MENU.EVENT:
        this.menuItemsList = [];
        break;
      case TYPE_OF_MENU.BLOCK:
        this.menuItemsList = [{
          "type": "BLOCK",
          "value": {
            "name": "Block",
            "type": "BLOCK",
            "src": "",
            "description": ""
          }
        }];
        break;
      case TYPE_OF_MENU.FORM:
        this.menuItemsList = [];
        break;
      default:
        this.menuItemsList = Object.keys(ACTIONS_LIST).map(key => {
          return {
            type: key,
            value: ACTIONS_LIST[key]
          };
        });
        break;
    }
    
  }



  ngAfterViewInit(){
  }


  /** */
  onAddingActionToStage(item){
    console.log('item: ', item);
    let event = { 
      'type': item.value.type
    }
    this.addingActionToStage.emit(event);
  }

}
