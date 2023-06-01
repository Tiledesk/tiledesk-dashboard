import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
// import {MatMenuModule} from '@angular/material/menu';
// import {MatButtonModule} from '@angular/material/button';
import { MatMenuTrigger } from '@angular/material/menu';

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

  constructor() { }

  ngOnInit(): void {
  }



  openMenu(e) {
    //this.menuTrigger.openMenu();
    let x = e.offsetLeft;
    let y = e.offsetTop;
    console.log(':::: CdsPanelElementsComponent onMouseOverElement :::: ', y, this.isDraggingMenuElement);
    this.isOpen = true;
    setTimeout(() => {
      if(this.isDraggingMenuElement == false){
        console.log("OPEN", e);
        this.positionMenu = {'x': 80, 'y': y }
      }
    }, 0);
    
  }
  
  closeMenu() {
    // this.menuTrigger.closeMenu();
    setTimeout(() => {
      if(this.isOverMenu == false && this.isDraggingMenuElement == false){
        console.log("CLOSE");
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
    console.log(':::: CdsPanelElementsComponent onMouseOverElement :::: ', e, e.target.offsetLeft);
    let pos = {'x': -100, 'y': -100 }
    // 144 92 136 (8+64)
    this.showPanelActions.emit(pos);
  }

  onAddNewElement(){
    // console.log(':::: CdsPanelElementsComponent onAddNewElement :::: ');
    this.addNewElement.emit();
  }

  onOverMenu(){
    this.isOverMenu = true;
  }
  onLeaveMenu(){
    this.isOverMenu = false;
    this.closeMenu();
  }

  onIsDraggingMenuElement(event: boolean){
    this.isDraggingMenuElement = event;
    if(event === false){
      this.closeMenu();
    }
  }

}
