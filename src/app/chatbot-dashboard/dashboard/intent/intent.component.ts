import { Component, OnInit, Input } from '@angular/core';
import { Intent, Answer } from '../../../models/intent-model';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

@Component({
  selector: 'appdashboard-intent',
  templateUrl: './intent.component.html',
  styleUrls: ['./intent.component.scss']
})
export class IntentComponent implements OnInit {
  @Input() intent: Intent;

  // @Input() arrayResponses: Array<Answer>;

  intentName: string;
  intentNameResult: boolean;

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

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.arrayResponses, event.previousIndex, event.currentIndex);
  }


  onDeleteResponse(index:number){
    this.arrayResponses.splice(index, 1); 
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
}
