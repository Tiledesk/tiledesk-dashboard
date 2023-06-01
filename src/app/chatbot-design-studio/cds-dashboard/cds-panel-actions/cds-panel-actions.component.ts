import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { TYPE_ACTION, ACTIONS_LIST } from '../../utils';
import { CdkDropList, CdkDragStart, CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';
import { DragDropService } from 'app/chatbot-design-studio/cds-services/drag-drop.service';

@Component({
  selector: 'cds-panel-actions',
  templateUrl: './cds-panel-actions.component.html',
  styleUrls: ['./cds-panel-actions.component.scss']
})
export class CdsPanelActionsComponent implements OnInit {
  @ViewChild('action_list_drop_connect') actionListDropConnect: CdkDropList;

  @Input() pos: any;
  @Output() isDraggingMenuElement = new EventEmitter();

  TYPE_ACTION = TYPE_ACTION;
  actionList: any;
  isDragging: any = false;
  indexDrag: number;
  // dropList: CdkDropList;
  connectedLists: CdkDropList[];
  connectedIDLists: string[];

  constructor(
    public dragDropService: DragDropService
  ) { }

  ngOnInit(): void {
    if(!this.pos){
      this.pos = {'x': 0, 'y':0};
    }
    this.actionList = Object.keys(ACTIONS_LIST).map(key => {
      return {
        type: key,
        value: ACTIONS_LIST[key]
      };
    });
    console.log('ACTIONS_LIST',this.actionList);
    
  }

  ngOnChanges() {
    console.log('ngOnChanges:: ', this.pos);
  }


  ngAfterViewInit(){
    this.dragDropService.addConnectedIDList('action_list_drop_connect');
    // this.dragDropService.addConnectedIDList('cds-box-right-content');
    this.dragDropService.addConnectedList(this.actionListDropConnect);
    this.connectedLists = this.dragDropService.connectedLists;
    this.connectedIDLists = this.dragDropService.connectedIDLists;
    // ['action_list_drop_connect','drop-actions'];
    // this.dragDropService.connectedIDLists;
    console.log("connectedLists--------------------> ",this.connectedIDLists);
  }





  onDragStarted(event:CdkDragStart, currentIndex: number) {
    console.log('Drag started!', event, currentIndex);
    this.isDragging = true;
    this.indexDrag = currentIndex;
    this.isDraggingMenuElement.emit(this.isDragging);
  }

  onDragEnd(event: CdkDragEnd) {
    // console.log('Drag End!', event);
    this.isDragging = false;
    this.indexDrag = null;
    this.isDraggingMenuElement.emit(this.isDragging);
  }

  onDragMoved(event: CdkDragMove) {
    // console.log('Drag Moved!', event);
    // const element = event.source.element.nativeElement;
  }

  onDragOver(event: DragEvent) {
    console.log('Drag dragOver!', event);
    // event.preventDefault(); // Annulla l'evento di default che consente il drop
  }

}
