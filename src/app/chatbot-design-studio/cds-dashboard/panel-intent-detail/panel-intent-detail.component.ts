import { Component, OnInit, Input, Output, EventEmitter, OnChanges, ChangeDetectorRef, TemplateRef, ViewContainerRef } from '@angular/core';

import { Intent, Button, ActionReply, Action } from '../../../models/intent-model';
import { TYPE_INTENT_ELEMENT, TYPE_ACTION } from '../../utils';


@Component({
  selector: 'appdashboard-panel-intent-detail',
  templateUrl: './panel-intent-detail.component.html',
  styleUrls: ['./panel-intent-detail.component.scss']
})
export class PanelIntentDetailComponent implements OnInit, OnChanges {
  @Output() openButtonPanel = new EventEmitter();

  @Input() listOfActions: Array<string>;
  @Input() elementIntentSelected: any;
  @Input() showSpinner: boolean;
  @Input() intentSelected: Intent

  typeIntentElement = TYPE_INTENT_ELEMENT;
  typeAction = TYPE_ACTION;
  elementSelected: any;
  elementSelectedIndex: number;
  elementSelectedMaxLength: number[] = [];
  elementIntentSelectedType: string;


  openCardButton = false;
  // buttonSelected: Button;

  constructor() { }

  ngOnInit(): void {
    try {
      this.elementIntentSelectedType = this.elementIntentSelected.type;
      this.elementSelected = this.elementIntentSelected.element;
      console.log('[PANEL-INTENT-DETAIL] (OnInit) elementIntentSelectedType ', this.elementIntentSelectedType);
      console.log('[PANEL-INTENT-DETAIL] (OnInit) elementSelected ', this.elementSelected);
    } catch (error) {
      console.log('[PANEL-INTENT-DETAIL] (OnInit) ERROR', error);
    }
  }

  ngOnChanges() {
    console.log('[PANEL-INTENT-DETAIL] (OnChanges) @Input elementIntentSelected ', this.elementIntentSelected);
    this.elementIntentSelectedType = this.elementIntentSelected.type;
    this.elementSelected = this.elementIntentSelected.element;
    this.elementSelectedIndex = this.elementIntentSelected.index
    this.elementSelectedMaxLength = [...Array(this.elementIntentSelected.maxLength).keys()]
    console.log('[PANEL-INTENT-DETAIL] (OnChanges) elementIntentSelectedType ', this.elementIntentSelectedType);
    console.log('[PANEL-INTENT-DETAIL] (OnChanges) elementSelected ', this.elementSelected);
    console.log('[PANEL-INTENT-DETAIL] (OnChanges) intentSelected ', this.intentSelected);
    
  }
  // EVENT FUNCTIONS //




  /** appdashboard-tools: add new response **/
  // onAddNewResponse(element){
  //   try {

  //     // this.intentSelected.reply.attributes.commands.push(element);
  //     this.intentSelected.actions.push(element);
  //     console.log('onAddNewResponse---->', this.intentSelected.actions);
  //   } catch (error) {
  //     console.log('onAddNewResponse ERROR', error);
  //   }
  // }



  /** appdashboard-intent: Open button panel */
  onOpenButtonPanel(event) {
    console.log('onOpenButtonPanel :: ', event);
    // if (this.openCardButton === true) {
    //   this.onCloseButtonPanel();
    // }
    // this.buttonSelected = event;
    // this.openCardButton = true;
  }

  
  /** appdashboard-button-configuration-panel: Save button */
  // onSaveButton(button) {
  //   console.log('onSaveButton :: ', this.elementSelected);
  //   this.elementSelected.text = "...";
  //   this.openCardButton = false;
  // }

  // /** appdashboard-button-configuration-panel: Close button panel */
  // onCloseButtonPanel() {
  //   this.openCardButton = false;
  // }

  passJsonIntentForm(json) {
    console.log('[PANEL-INTENT-DETAIL] passJsonIntentForm ', json);
    if(json && json.fields && json.fields.length>0){
      // this.intentForm = json;
    }
  }

}
