import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'appdashboard-panel-intent-header',
  templateUrl: './panel-intent-header.component.html',
  styleUrls: ['./panel-intent-header.component.scss']
})
export class PanelIntentHeaderComponent implements OnInit {

  intentNameResult = true;
  intentName = "intent name ...";
  showSpinner = false;
  constructor() { }

  ngOnInit(): void {
  }

    /** */
    onChangeIntentName(name: string){
      name.toString();
      try {
        this.intentName = name.replace(/[^A-Z0-9_]+/ig, "");
      } catch (error) {
        console.log('name is not a string', error)
      }
    }
  
    /** */
    onBlurIntentName(name: string){
      this.intentNameResult = true;
    }

    /** */
  onSaveIntent(){
    //console.log('onSaveIntent:: ', this.intent, this.arrayResponses);
    // this.intentNameResult = this.checkIntentName();
    // this.updateArrayResponse();
    // if(this.intentNameResult){
    //   this.saveIntent.emit(this.intent);
    // }
  }

}
