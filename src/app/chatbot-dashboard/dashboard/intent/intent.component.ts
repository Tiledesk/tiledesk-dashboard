import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'appdashboard-intent',
  templateUrl: './intent.component.html',
  styleUrls: ['./intent.component.scss']
})
export class IntentComponent implements OnInit {

  intentName: string;
  intentNameResult: boolean;

  arrayResponses: Array<any>;

  constructor() { }

  ngOnInit(): void {
    this.initialize();
  }
  
  // FUNCTIONS //
  private initialize(){
    this.intentName = "";
    this.intentNameResult = true;
    this.arrayResponses = ['test'];
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
