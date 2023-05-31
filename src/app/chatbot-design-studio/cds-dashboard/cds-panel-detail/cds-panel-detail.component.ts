import { Component, OnInit, Input, Output, EventEmitter, HostListener, ElementRef, ViewChild } from '@angular/core';
import { Intent } from '../../../models/intent-model';
import { TYPE_INTENT_ELEMENT, TYPE_ACTION } from '../../utils';


@Component({
  selector: 'cds-panel-detail',
  templateUrl: './cds-panel-detail.component.html',
  styleUrls: ['./cds-panel-detail.component.scss']
})
export class CdsPanelDetailComponent implements OnInit {
  
  @Output() closeAndSavePanelIntentDetail = new EventEmitter();
  @Output() clickedInsidePanelIntentDetail = new EventEmitter();
  @Input() listOfActions: Array<string>;
  @Input() elementIntentSelected: any;
  @Input() showSpinner: boolean;
  @Input() intentSelected: Intent;
  @Input() isOpenPanelDetail: boolean;

  @ViewChild('panel_detail_div', { static: false }) private elementRef: ElementRef;
  typeIntentElement = TYPE_INTENT_ELEMENT;
  typeAction = TYPE_ACTION;
  
  elementSelected: any;
  elementSelectedIndex: number;
  elementSelectedMaxLength: number[] = [];
  elementIntentSelectedType: string;
  openCardButton = false;

  constructor() { }

  ngOnInit(): void {
    //this.isOpenPanelDetail = true;
  }

  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpenPanelDetail = false;
      console.log("FUORI");
    } else {
      this.isOpenPanelDetail = true;
      console.log("DENTRO");
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
    console.log('----> onSaveIntent:: ', this.elementIntentSelectedType, this.intentSelected);
    this.closeAndSavePanelIntentDetail.emit(this.intentSelected);
  }

  onCloseIntent(){
    console.log('----> onCloseIntent:: ', this.elementIntentSelectedType, this.intentSelected);
    this.closeAndSavePanelIntentDetail.emit();
  }



}
