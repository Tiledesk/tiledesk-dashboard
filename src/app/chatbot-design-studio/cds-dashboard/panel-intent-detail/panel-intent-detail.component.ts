import { Component, OnInit, Input, Output, EventEmitter, OnChanges, ChangeDetectorRef, TemplateRef, ViewContainerRef } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';

import { Intent, Button, ActionReply, Action } from '../../../models/intent-model';
import { TYPE_INTENT_ELEMENT, TYPE_ACTION } from '../../utils';


@Component({
  selector: 'appdashboard-panel-intent-detail',
  templateUrl: './panel-intent-detail.component.html',
  styleUrls: ['./panel-intent-detail.component.scss']
})
export class PanelIntentDetailComponent implements OnInit, OnChanges {
  // @Output() openButtonPanel = new EventEmitter();
  @Output() closeAndSavePanelIntentDetail = new EventEmitter();
  @Output() clickedInsidePanelIntentDetail = new EventEmitter();

  @Input() listOfActions: Array<string>;
  @Input() elementIntentSelected: any;
  @Input() showSpinner: boolean;
  @Input() intentSelected: Intent;
  

  typeIntentElement = TYPE_INTENT_ELEMENT;
  typeAction = TYPE_ACTION;
  
  elementSelected: any;
  elementSelectedIndex: number;
  elementSelectedMaxLength: number[] = [];
  elementIntentSelectedType: string;


  openCardButton = false;
  // buttonSelected: Button;

  constructor(
    private logger: LoggerService,
  ) { }

  ngOnInit(): void {
    console.log('elementIntentSelected: ', this.elementIntentSelected);
    console.log('intentSelected: ', this.intentSelected);
    try {
      this.elementSelected = JSON.parse(JSON.stringify(this.elementIntentSelected.element));
      // this.elementSelected = this.elementIntentSelected.element;
      this.elementIntentSelectedType = this.elementIntentSelected.type;
      this.logger.log('[PANEL-INTENT-DETAIL] (OnInit) elementIntentSelectedType ', this.elementIntentSelectedType);
      this.logger.log('[PANEL-INTENT-DETAIL] (OnInit) elementSelected ', this.elementSelected);
    } catch (error) {
      this.logger.log('[PANEL-INTENT-DETAIL] (OnInit) ERROR', error);
    }
  }

  ngOnChanges() {
    this.logger.log('[PANEL-INTENT-DETAIL] (OnChanges) @Input elementIntentSelected ', this.elementIntentSelected);
    // this.elementIntentSelectedType = this.elementIntentSelected.type;
    // this.elementSelected = this.elementIntentSelected.element;
    // this.elementSelected = JSON.parse(JSON.stringify(this.elementIntentSelected.element));
    this.elementSelectedIndex = this.elementIntentSelected.index
    this.elementSelectedMaxLength = [...Array(this.elementIntentSelected.maxLength).keys()]
    this.logger.log('[PANEL-INTENT-DETAIL] (OnChanges) elementIntentSelectedType ', this.elementIntentSelectedType);
    this.logger.log('[PANEL-INTENT-DETAIL] (OnChanges) elementSelected ', this.elementSelected);
    this.logger.log('[PANEL-INTENT-DETAIL] (OnChanges) intentSelected ', this.intentSelected);
    
    console.log('intentSelected ------> ', this.intentSelected);
  }
  // EVENT FUNCTIONS //




  /** appdashboard-tools: add new response **/
  // onAddNewResponse(element){
  //   try {

  //     // this.intentSelected.reply.attributes.commands.push(element);
  //     this.intentSelected.actions.push(element);
  //     this.logger.log('onAddNewResponse---->', this.intentSelected.actions);
  //   } catch (error) {
  //     this.logger.log('onAddNewResponse ERROR', error);
  //   }
  // }



  /** appdashboard-intent: Open button panel */
  onOpenButtonPanel(event) {
    this.logger.log('onOpenButtonPanel :: ', event);
    // if (this.openCardButton === true) {
    //   this.onCloseButtonPanel();
    // }
    // this.buttonSelected = event;
    // this.openCardButton = true;
  }

  
  /** appdashboard-button-configuration-panel: Save button */
  // onSaveButton(button) {
  //   this.logger.log('onSaveButton :: ', this.elementSelected);
  //   this.elementSelected.text = "...";
  //   this.openCardButton = false;
  // }

  // /** appdashboard-button-configuration-panel: Close button panel */
  // onCloseButtonPanel() {
  //   this.openCardButton = false;
  // }

  passJsonIntentForm(intentForm) {
    this.logger.log('[PANEL-INTENT-DETAIL] passJsonIntentForm ', intentForm);
    // if(json && json.fields && json.fields.length>0){
    //   // this.intentForm = json;
    // }
    
    console.log("passJsonIntentForm:::: ", this.intentSelected);
  }


  onUpdateIntentForm(intentForm) {
    this.intentSelected.form = intentForm;
  }

  onClickInside(){
    this.clickedInsidePanelIntentDetail.emit();
  }

  onChangeAnswer(event){
    console.log('onChangeAnswer:: ', event);
    this.elementSelected = event;
  }

  onSaveIntent(){
    if(this.elementIntentSelectedType === this.typeIntentElement.ACTION){
      this.intentSelected.actions[this.elementSelectedIndex] = this.elementSelected;
    } else if(this.elementIntentSelectedType === this.typeIntentElement.ANSWER){
      this.intentSelected.answer = this.elementSelected;
    } else if(this.elementIntentSelectedType === this.typeIntentElement.FORM){
      this.intentSelected.form = this.elementSelected;
    } else if(this.elementIntentSelectedType === this.typeIntentElement.QUESTION){
      this.intentSelected.question = this.elementSelected;
    }
    console.log('onSaveIntent:: ', this.elementIntentSelectedType, this.intentSelected);
    this.closeAndSavePanelIntentDetail.emit(this.intentSelected);
  }

  onCloseIntent(){
    this.closeAndSavePanelIntentDetail.emit();
  }

}
