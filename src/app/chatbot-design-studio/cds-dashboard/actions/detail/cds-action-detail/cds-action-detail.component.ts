import { Component, OnInit, Input, Output, EventEmitter, OnChanges, ChangeDetectorRef, TemplateRef, ViewContainerRef } from '@angular/core';
import { TYPE_INTENT_ELEMENT, TYPE_ACTION } from 'app/chatbot-design-studio/utils';
import { Intent } from 'app/models/intent-model';
import { LoggerService } from 'app/services/logger/logger.service';



@Component({
  selector: 'cds-action-detail',
  templateUrl: './cds-action-detail.component.html',
  styleUrls: ['./cds-action-detail.component.scss']
})
export class CdsActionDetail implements OnInit, OnChanges {
  @Output() closeAndSavePanelIntentDetail = new EventEmitter();
  @Output() clickedInsidePanelIntentDetail = new EventEmitter();
  @Input() listOfActions: Array<string>;
  @Input() elementIntentSelected: any;
  @Input() showSpinner: boolean;
  @Input() intentSelected: Intent;
  @Input() isOpenDetailActionPanel: boolean
  
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
    this.logger.log('[CDS-ACTION-DTLS] (ngOnInit) @Input elementIntentSelected ', this.elementIntentSelected);
    try {
      this.elementSelected = JSON.parse(JSON.stringify(this.elementIntentSelected.element));
      this.elementIntentSelectedType = this.elementIntentSelected.type;
      this.logger.log('[CDS-ACTION-DTLS] (OnInit) elementSelected ', this.elementSelected);
    } catch (error) {
      this.logger.log('[CDS-ACTION-DTLS] (OnInit) ERROR', error);
    }
  }

  ngOnChanges() {
    console.log('[CDS-ACTION-DTLS] isOpenDetailActionPanel ', this.isOpenDetailActionPanel) 
    console.log('[CDS-ACTION-DTLS] (OnChanges) @Input elementIntentSelected ', this.elementIntentSelected);
    try{
      this.elementIntentSelectedType = this.elementIntentSelected.type;
      this.elementSelected = this.elementIntentSelected.element;
      this.elementSelected = JSON.parse(JSON.stringify(this.elementIntentSelected.element));
      this.elementSelectedIndex = this.elementIntentSelected.index
      this.elementSelectedMaxLength = [...Array(this.elementIntentSelected.maxLength).keys()]
      console.log('[CDS-ACTION-DTLS] (OnChanges) elementIntentSelectedType ', this.elementIntentSelectedType);
      console.log('[CDS-ACTION-DTLS] (OnChanges) elementSelected ', this.elementSelected);
      console.log('[CDS-ACTION-DTLS] (OnChanges) intentSelected ', this.intentSelected);
    }catch(error){
      console.log('[CDS-ACTION-DTLS] (ngOnChanges) ERROR', error);
    }
  }


  // private setDragConfig(){
  //   // drag study
  //   let el = document.getElementById("content-panel");
  //   console.log('getElementById:: el', el);
  //   let drawer = document.getElementById("box-right");
  //   console.log('getElementById:: drawer', drawer);
  //   setDrawer(el, drawer);
  // }

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
    console.log('----> onSaveIntent:: ', this.elementIntentSelectedType, this.intentSelected);
    this.closeAndSavePanelIntentDetail.emit(this.intentSelected);
  }

  onCloseIntent(){
    console.log('----> onCloseIntent:: ', this.elementIntentSelectedType, this.intentSelected);
    this.closeAndSavePanelIntentDetail.emit();
  }

}
