import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Intent } from '../../../models/intent-model';

@Component({
  selector: 'appdashboard-panel-intent-header',
  templateUrl: './panel-intent-header.component.html',
  styleUrls: ['./panel-intent-header.component.scss']
})
export class PanelIntentHeaderComponent implements OnInit, OnChanges {
  @Output() saveIntent = new EventEmitter();
  @Input() intentSelected: Intent;
  @Input() showSpinner: boolean;
  @Input() listOfIntents: Intent[];
  
  intentName: string;
  intentNameResult = true;

  constructor() { }

  // SYSTEM FUNCTIONS //
  ngOnInit(): void {
    this.showSpinner = false;
    console.log("header --> intentSelected: ", this.intentSelected)
    try {
      this.intentName = this.intentSelected.intent_display_name;
    } catch (error) {
      console.log('intent selected ', error);
    }
  }

  ngOnChanges() {
    this.showSpinner = false;
    console.log("[PANEL-INTENT-HEADER] header --> intentSelected: ", this.intentSelected)
    console.log("[PANEL-INTENT-HEADER] header --> listOfIntents: ", this.listOfIntents)
    try {
      this.intentName = this.intentSelected.intent_display_name;
    } catch (error) {
      console.log('[PANEL-INTENT-HEADER] intent selected ', error);
    }
  }

  // CUSTOM FUNCTIONS //
  /** */
  private checkIntentName(): boolean {
    if (!this.intentName || this.intentName.length === 0){
      return false; 
    } else {
      return true;
    }
  }


  // EVENT FUNCTIONS //
  /** */
  onChangeIntentName(name: string){
    console.log('[PANEL-INTENT-HEADER] onChangeIntentName', name);
  
    
   
    // var isPresent = this.listOfIntents.some((el) => {
    //    return el.id === 2
    //   });
    // console.log(isPresent);
    // name.toString();
    // try {
    //   this.intentName = name.replace(/[^A-Z0-9_]+/ig, "");
    // } catch (error) {
    //   console.log('name is not a string', error);
    // }
  }

  /** */
  onBlurIntentName(name: string){
    this.intentNameResult = true;
  }

  /** */
  onSaveIntent(){
    this.intentNameResult = this.checkIntentName();
    if(this.intentNameResult){
      this.intentSelected.intent_display_name = this.intentName;
      this.saveIntent.emit(this.intentSelected);
    }
  }

}
