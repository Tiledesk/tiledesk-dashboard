import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { TYPE_ACTION, ACTIONS_LIST, TYPE_OF_MENU } from 'app/chatbot-design-studio/utils';


@Component({
  selector: 'cds-panel-elements',
  templateUrl: './cds-panel-elements.component.html',
  styleUrls: ['./cds-panel-elements.component.scss']
  // standalone: true,
  // imports: [MatButtonModule, MatMenuModule],
})
export class CdsPanelElementsComponent implements OnInit {
  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;
  @ViewChild('menuElement', { static: false }) private menuElement: ElementRef;


  @Output() addNewElement = new EventEmitter();
  @Output() showPanelActions = new EventEmitter();
  
  isOpen: boolean = false;
  isOverMenu: boolean = false;
  positionMenu: any = {'x': 80, 'y': 0 };
  isDraggingMenuElement: boolean = false;
  menuType: string;
  TYPE_OF_MENU = TYPE_OF_MENU;

  constructor() { }

  ngOnInit(): void {
  }



  onOpenMenu(e, type) {
    setTimeout(() => {
      console.log('onOpenMenu: ', type);
      this.menuType = type;
      //this.menuTrigger.openMenu();
      // let x = e.offsetLeft;
      let y = e.offsetTop;
      // console.log(':::: CdsPanelElementsComponent onMouseOverElement :::: ', y, this.isDraggingMenuElement);
      this.isOpen = true;
      if(this.isDraggingMenuElement == false){
        this.positionMenu = {'x': 80, 'y': y }
      }
    }, 0);
  }
  
  onCloseMenu() {
    // this.menuTrigger.closeMenu();
    setTimeout(() => {
      if(this.isOverMenu == false && this.isDraggingMenuElement == false){
        // console.log("CLOSE");
        this.isOpen = false;
      }
    }, 0);
  }

  onMouseOverElement(e){
    // console.log(':::: CdsPanelElementsComponent onMouseOverElement :::: ', e, e.target.offsetLeft);
    // let pos = {'x': e.target.offsetLeft+e.target.offsetWidth+20, 'y': e.target.offsetTop+12 }
    // this.showPanelActions.emit(pos);
  }

  onMouseLeaveElement(e){
    // console.log(':::: CdsPanelElementsComponent onMouseOverElement :::: ', e, e.target.offsetLeft);
    let pos = {'x': -100, 'y': -100 }
    this.showPanelActions.emit(pos);
  }

  onAddNewElement(){
    // console.log(':::: CdsPanelElementsComponent onAddNewElement :::: ');
    // this.addNewElement.emit();
  }

  onOverMenu(){
    this.isOverMenu = true;
  }

  onLeaveMenu(){
    this.isOverMenu = false;
    this.onCloseMenu();
  }

  onIsDraggingMenuElement(event: boolean){
    this.isDraggingMenuElement = event;
    if(event === false){
      this.onCloseMenu();
    }
  }

}
