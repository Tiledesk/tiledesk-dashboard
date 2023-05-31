import { Component, OnInit, Input } from '@angular/core';
import { TYPE_ACTION, ACTIONS_LIST } from '../../utils';
import { CdkDragDrop, CdkDragStart, CdkDragEnd, CdkDrag, CdkDragMove, CdkDragPlaceholder, CdkDragHandle } from '@angular/cdk/drag-drop';

@Component({
  selector: 'cds-panel-actions',
  templateUrl: './cds-panel-actions.component.html',
  styleUrls: ['./cds-panel-actions.component.scss']
})
export class CdsPanelActionsComponent implements OnInit {
  @Input() isOpenPanelDetail: boolean;
  @Input() pos: any;


  TYPE_ACTION = TYPE_ACTION;
  actionList: any;
  // isDragging: any;

  constructor() { }

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







  dragStarted(event: CdkDragStart, currentIndex) {
    console.log('Drag started!', event, currentIndex);
    this.actionList[currentIndex].isDragging = true;
    // this.actionList.splice(currentIndex+1, 0, emptyAction);
  }

  dragEnd(event: CdkDragEnd, currentIndex) {
    console.log('Drag End!', event, currentIndex);
    this.actionList[currentIndex].isDragging = false;
    // this.actionList.splice(currentIndex+1, 1);
  }

  dragMoved(event: CdkDragMove, currentIndex) {
    console.log('Drag Moved!', event);
    // this.actionList = event.source.dropContainer.data;
  }

  dragOver(event: DragEvent) {
    console.log('Drag dragOver!', event);
    // event.preventDefault(); // Annulla l'evento di default che consente il drop
  }

  

  // drop(event: CdkDragDrop<string[]>) {
  //   if (event.previousContainer === event.container) {
  //     //moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  //   } else {
  //     // copyArrayItem(
  //     //   event.previousContainer.data,
  //     //   event.container.data,
  //     //   event.previousIndex,
  //     //   event.currentIndex
  //     // );
  //   }
  // }

}
