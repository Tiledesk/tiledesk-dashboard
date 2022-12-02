import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Intent, Answer } from '../../../models/intent-model';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

@Component({
  selector: 'appdashboard-intent',
  templateUrl: './intent.component.html',
  styleUrls: ['./intent.component.scss']
})
export class IntentComponent implements OnInit {
  @Output() openAddButtonPanel = new EventEmitter();
  @Input() intent: Intent;

  // @Input() arrayResponses: Array<Answer>;

  intentName: string;
  intentNameResult: boolean;

  textGrabbing: boolean;

  arrayResponses: Array<Answer>;

  constructor() { }

  ngOnInit(): void {
    this.initialize();
  }
  
  // FUNCTIONS //
  private initialize(){
    this.intentName = "";
    this.intentNameResult = true;
    this.arrayResponses = this.intent.answers;
    this.textGrabbing = false;
  }

  /** */
  private checkIntentName() {
    setTimeout(() => {
      if (!this.intentName || this.intentName.length === 0){
        this.intentNameResult = false;
      } else {
        this.intentNameResult = true;
      }
    }, 300);
    
  }



  // ON EVENT //

  mouseDown(){
    this.textGrabbing = true;
    console.log('mouseDown');
  }

  mouseUp(){
    this.textGrabbing = false;
    console.log('mouseUp');
  }

  drop(event: CdkDragDrop<string[]>) {
    console.log('drop');
    this.textGrabbing = false;
    moveItemInArray(this.arrayResponses, event.previousIndex, event.currentIndex);
  }


  onDeleteResponse(index:number){
    this.arrayResponses.splice(index, 1); 
  }

  onMoveUpResponse(index:number){
    if(index>0){
      let to = index-1;
      let from = index;
      this.arrayResponses.splice(to,0,this.arrayResponses.splice(from,1)[0]);
    }
  }

  onMoveDownResponse(index:number){
    if(index<this.arrayResponses.length-1){
      let to = index+1;
      let from = index;
      this.arrayResponses.splice(to,0,this.arrayResponses.splice(from,1)[0]);
    }
  }

  /** */
  onChangeIntentName(name: string){
    name.toString();
    this.intentName = name.replace(/[^A-Z0-9_]+/ig, "");
  }

  /** */
  onBlurIntentName(name: string){
    this.intentNameResult = true;
    // this.checkIntentName();
  }
 

  /** */
  onSaveIntent(){
    this.checkIntentName();
  }


  onOpenAddButtonPanel(event){
    this.openAddButtonPanel.emit(event);
  }
}
