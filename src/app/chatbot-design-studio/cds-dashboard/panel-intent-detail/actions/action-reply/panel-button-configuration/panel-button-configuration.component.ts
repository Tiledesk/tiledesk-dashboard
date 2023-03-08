import { CDSTextComponent } from './../../../../../cds-base-element/text/text.component';

import { Component, OnInit, Input, Output, EventEmitter, HostListener, ViewChild, ElementRef } from '@angular/core';
import { Button } from 'app/models/intent-model';

import { TYPE_BUTTON, TYPE_URL } from '../../../../../utils';

@Component({
  selector: 'appdashboard-panel-button-configuration',
  templateUrl: './panel-button-configuration.component.html',
  styleUrls: ['./panel-button-configuration.component.scss']
})
export class PanelButtonConfigurationComponent implements OnInit {

  @ViewChild('input_title', { static: true }) input_topic: CDSTextComponent;
  @ViewChild('button_save', { static: true }) button_save_topic: any;
  

  @Input() listOfActions: Array<{name: string, value: string, icon?:string}>;
  @Input() button: Button;
  @Output() saveButton = new EventEmitter();
  @Output() closeButtonPanel = new EventEmitter();

  buttonLabelResult: boolean;
  buttonLabel: string;
  typeOfButton = TYPE_BUTTON;
  buttonTypes: Array<{ label: string, value: TYPE_BUTTON }> = [
    { label: "text", value: this.typeOfButton.TEXT },
    { label: "url", value: this.typeOfButton.URL },
    { label: "go to block", value: this.typeOfButton.ACTION }
  ]
  buttonType: string;

  typeOfUrl = TYPE_URL;
  urlTypes: Array<{ label: string, value: TYPE_URL }> = [
    { label: "blank", value: this.typeOfUrl.BLANK },
    { label: "parent", value: this.typeOfUrl.PARENT },
    { label: "self", value: this.typeOfUrl.SELF },
  ];
  urlType: string;
  buttonUrl: string;
  errorUrl: boolean;
  buttonAction: string;
  clickInside: boolean;

  buttonAttributes: Array<any>;

  constructor(
    private eRef: ElementRef
  ) { }

  /** Close panel on click outside */
  // @HostListener("click")
  // clicked() {
  //   this.clickInside = true;
  // }

  // @HostListener('document:click', ['$event'])
  // clickedOut(event) {
  //   let parentId;
  //   try {
  //     parentId = event.target.id;
  //   } catch (error) {
  //     // error
  //   }
  //   if(this.clickInside === false && parentId !== classCardButtonNoClose) {
  //     this.closeButtonPanel.emit();
  //   }
  //   this.clickInside = false;
  // }


  // SYSTEM FUNCTIONS //  
  /** */
  ngOnInit(): void {
    this.buttonLabelResult = true;
    this.errorUrl = false;
    this.buttonLabel = '';
    this.buttonType = this.typeOfButton.TEXT;
    this.urlType = this.typeOfUrl.BLANK;
    this.buttonUrl = '';
    try {
      this.buttonLabel = this.button.value ? this.button.value : null;
      this.buttonType = this.button.type ? this.button.type : null;
      this.urlType = this.button.target ? this.button.target : null;
      this.buttonUrl = this.button.link ? this.button.link : null;
      this.buttonAction = this.button.action ? this.button.action : null;
      this.buttonAttributes = this.button.attributes ? this.button.attributes : [];
    } catch (error) {
      // error
    }
    
  }

  ngOnChanges() {
    try {
      this.buttonLabel = this.button.value ? this.button.value : null;
      this.buttonType = this.button.type ? this.button.type : null;
      this.urlType = this.button.target ? this.button.target : null;
      this.buttonUrl = this.button.link ? this.button.link : null;
      this.buttonAction = this.button.action ? this.button.action : null;
    } catch (error) {
      // error
    }
  }

  ngAfterViewInit() {
    this.input_topic.myInput.nativeElement.focus();
  }

  // @HostListener('document:click', ['$event'])
  // clickout(event) {
  //   const clicked_element_id = event.target.id;
  //   console.log("clicked: ", event.target.classList);
  //   if (this.eRef.nativeElement.contains(event.target)) {
  //     // console.log("clicked inside")
  //   } else {
  //     // console.log('clicked outside')
  //     if (!event.target.classList.contains('single-btn-reply') && !event.target.classList.contains('ng-option') && !event.target.classList.contains('ng-option-label') && !event.target.classList.contains('mat-option-text')) {
  //       this.onCloseButtonPanel();
  //       // console.log('clicked outside')
  //     }
  //   }
  // }

  // PRIVATE FUNCTIONS //  

  private setFocusOnButtonSave(){
    // console.log('setFocusOnButtonSave: ', this.button_save_topic);
    this.button_save_topic.nativeElement.focus();
  }

  private checkButtonLabel(): boolean {
    if (!this.buttonLabel || this.buttonLabel.length === 0) {
      this.buttonLabel = '';
    }
    this.button.value = this.buttonLabel;
    this.buttonLabelResult = true;
    return true;
    //setTimeout(() => {
    // if (!this.buttonLabel || this.buttonLabel.length === 0) {
    //   this.buttonLabelResult = false;
    //   return false;
    // } else {
    //   this.button.value = this.buttonLabel;
    //   this.buttonLabelResult = true;
    //   return true;
    // }
    //}, 300);
  }

  private checkTypeButton() {
    if (this.buttonType === this.typeOfButton.TEXT) {
      return true;
    } else if (this.buttonType === this.typeOfButton.URL) {
      return this.checkUrl(this.buttonUrl);
    } else if (this.buttonType === this.typeOfButton.ACTION) {
      return this.checkAction(this.buttonAction);
    }
    return false;
  }

  private checkUrl(url: string): boolean {
    this.errorUrl = true;
    if (url && url.length > 1) {
      this.errorUrl = false;
      this.button.link = url;
      this.button.target = this.urlType;
      return true;
    }
    return false;
  }

  private checkAction(action: string): boolean {
    if (action && action.length > 1) {
      this.button.action = action;
      this.button.show_echo = true;
      return true;
    }
    return false;
  }

  private checkAndSaveButton(){
    let checkLabel = this.checkButtonLabel();
    let checkType = this.checkTypeButton();
    if (checkLabel && checkType) {
      this.saveButton.emit(this.button);
    }
  }

  // EVENTS FUNCTIONS //  
  /** */
  onSaveButton() {
    this.checkAndSaveButton();
    this.closeButtonPanel.emit();
  }

  /** */
  onBlurButtonLabel(name: string) {
    this.buttonLabelResult = true;
  }

  /** */
  onChangeTypeButton(typeOfButton: { label: string, value: TYPE_BUTTON }) {
    this.button.type = typeOfButton.value;
  }

  /** */
  onChangeActionButton(actionButton) {
    this.buttonAction = actionButton;
    this.button.action = actionButton;
  }

  onChangeSelect(event: {name: string, value: string}){
    // console.log('onChangeSelect: ', event);
    this.buttonAction = event.value;
    this.button.action = event.value;
    this.setFocusOnButtonSave();
  }

  /** */
  onCloseButtonPanel() {
    this.closeButtonPanel.emit();
  }

  onChangeTitle(text: string) {
    this.buttonLabel = text;
    this.checkAndSaveButton();
  }

  onChangeUrl(text: string) {
    this.buttonUrl = text;
    this.checkAndSaveButton();
  }

  onChangeAttributes(attributes:any){
    this.button.attributes = attributes;
    // console.log('attributes: ', this.button, attributes);
    this.saveButton.emit(this.button);
  }
}
