import { Component, OnInit, Input } from '@angular/core';
import { Intent } from '../../../models/intent-model';
import { TYPE_INTENT_ELEMENT } from '../../utils';


@Component({
  selector: 'appdashboard-panel-intent-detail',
  templateUrl: './panel-intent-detail.component.html',
  styleUrls: ['./panel-intent-detail.component.scss']
})
export class PanelIntentDetailComponent implements OnInit {
  @Input() intentSelected: Intent;
  @Input() showSpinner: boolean;

  typeIntentElement = TYPE_INTENT_ELEMENT;
  typeIntentElementSelected: string;

  constructor() { }

  ngOnInit(): void {
    this.typeIntentElement = TYPE_INTENT_ELEMENT;
    this.typeIntentElementSelected = TYPE_INTENT_ELEMENT.RESPONSE;
  }

  // EVENT FUNCTIONS //
  /** */
  onSaveIntent(){
    // this.intentNameResult = this.checkIntentName();
    // this.updateArrayResponse();
    // if(this.intentNameResult){
    //   this.saveIntent.emit(this.intent);
    // }
  }

  /** */
  onOpenButtonPanel(event){
    // this.openButtonPanel.emit(event);
  }

    /** appdashboard-tools: add new response **/
    onAddNewResponse(element){
      try {
        // this.intentSelected.reply.attributes.commands.push(element);
        // console.log('onAddNewResponse---->', this.intentSelected.reply.attributes.commands);
      } catch (error) {
        console.log('onAddNewResponse ERROR', error);
      }
    }

}
