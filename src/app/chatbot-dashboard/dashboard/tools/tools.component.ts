import { Component, OnInit } from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

@Component({
  selector: 'appdashboard-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['../dashboard.component.scss', './tools.component.scss']
})
export class ToolsComponent implements OnInit {
  items: Array<string> = [];
  showSpinner:boolean = false;
  constructor() { 
    // console.log('constructor);
    // void;
  }

  ngOnInit(): void {
    // console.log('ngOnInit);
    // void;
  }

  drop(event: CdkDragDrop<string[]>) {
    // if (event.previousContainer === event.container) {
    //   moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    // } else {
    //   transferArrayItem(
    //     event.previousContainer.data,
    //     event.container.data,
    //     event.previousIndex,
    //     event.currentIndex,
    //   );
    // }
  }

}
