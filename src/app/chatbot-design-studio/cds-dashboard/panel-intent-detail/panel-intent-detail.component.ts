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
  @Output() closeAndSavePanelIntentDetail = new EventEmitter();
  @Output() clickedInsidePanelIntentDetail = new EventEmitter();
  @Input() listOfActions: Array<string>;
  @Input() elementIntentSelected: any;
  @Input() showSpinner: boolean;
  @Input() intentSelected: Intent;
  @Input() project_id: string;
  
  typeIntentElement = TYPE_INTENT_ELEMENT;
  typeAction = TYPE_ACTION;
  
  elementSelected: any;
  elementSelectedIndex: number;
  elementSelectedMaxLength: number[] = [];
  elementIntentSelectedType: string;
  openCardButton = false;

  constructor(
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    this.logger.log('[PANEL-INTENT-DETAIL] (ngOnInit) @Input elementIntentSelected ', this.elementIntentSelected);
    try {
      this.elementSelected = JSON.parse(JSON.stringify(this.elementIntentSelected.element));
      this.elementIntentSelectedType = this.elementIntentSelected.type;
      this.logger.log('[PANEL-INTENT-DETAIL] (OnInit) elementSelected ', this.elementSelected);
    } catch (error) {
      this.logger.log('[PANEL-INTENT-DETAIL] (OnInit) ERROR', error);
    }
  }

  ngOnChanges() {
    this.logger.log('[PANEL-INTENT-DETAIL] (OnChanges) @Input elementIntentSelected ', this.elementIntentSelected);
    try{
      this.elementIntentSelectedType = this.elementIntentSelected.type;
      this.elementSelected = this.elementIntentSelected.element;
      this.elementSelected = JSON.parse(JSON.stringify(this.elementIntentSelected.element));
      this.elementSelectedIndex = this.elementIntentSelected.index
      this.elementSelectedMaxLength = [...Array(this.elementIntentSelected.maxLength).keys()]
      this.logger.log('[PANEL-INTENT-DETAIL] (OnChanges) elementIntentSelectedType ', this.elementIntentSelectedType);
      this.logger.log('[PANEL-INTENT-DETAIL] (OnChanges) elementSelected ', this.elementSelected);
      this.logger.log('[PANEL-INTENT-DETAIL] (OnChanges) intentSelected ', this.intentSelected);
    }catch(error){
      this.logger.error('[PANEL-INTENT-DETAIL] (ngOnChanges) ERROR', error);
    }
  }
  // EVENT FUNCTIONS //

  onUpdateFormIntentSelected($event){
    this.elementSelected = $event;
    // console.log("onUpdateFormIntentSelected:::: ", $event);
  }

  onUpdateAnswerIntentSelected($event){
    this.elementSelected = $event;
    // console.log("updateAnswerIntentSelected:::: ", $event);
  }

  onUpdateQuestionsIntentSelected($event){
    this.elementSelected = $event;
    // console.log("onUpdateQuestionsIntentSelected:::: ", $event);
  }

  onClickInside(){
    // console.log("----> onClickInside:::: ");
    this.clickedInsidePanelIntentDetail.emit();
  }


  onSaveIntent(){
    if(this.elementIntentSelectedType === this.typeIntentElement.ACTION){
      this.intentSelected.actions[this.elementSelectedIndex] = this.elementSelected;
    } else if(this.elementIntentSelectedType === this.typeIntentElement.ANSWER){
      this.intentSelected.answer = this.elementSelected;
    } else if(this.elementIntentSelectedType === this.typeIntentElement.QUESTION){
      this.intentSelected.question = this.elementSelected;
    } else if(this.elementIntentSelectedType === this.typeIntentElement.FORM){
      this.intentSelected.form = this.elementSelected;
    }
    this.logger.log('[PANEL-INTENT-DETAIL] ----> onSaveIntent:: ', this.elementIntentSelectedType, this.intentSelected);
    this.closeAndSavePanelIntentDetail.emit(this.intentSelected);
  }

  onCloseIntent(){
    this.logger.log('[PANEL-INTENT-DETAIL] ----> onCloseIntent:: ', this.elementIntentSelectedType, this.intentSelected);
    this.closeAndSavePanelIntentDetail.emit();
  }

}
