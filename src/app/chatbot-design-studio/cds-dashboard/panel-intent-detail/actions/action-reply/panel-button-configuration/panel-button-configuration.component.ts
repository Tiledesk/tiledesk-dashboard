
import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { Button } from 'app/models/intent-model';

import { TYPE_BUTTON, TYPE_URL, classCardButtonNoClose } from '../../../../../utils';

@Component({
  selector: 'appdashboard-panel-button-configuration',
  templateUrl: './panel-button-configuration.component.html',
  styleUrls: ['./panel-button-configuration.component.scss']
})
export class PanelButtonConfigurationComponent implements OnInit {

  @Output() saveButton = new EventEmitter();
  @Output() closeButtonPanel = new EventEmitter();

  @Input() listOfActions: Array<string>;
  @Input() button: Button;

  buttonLabelResult: boolean;
  buttonLabel: string;

  typeOfButton = TYPE_BUTTON;
  buttonTypes: Array<{label: string, value: TYPE_BUTTON}>;
  buttonType: string;

  typeOfUrl = TYPE_URL;
  urlTypes: Array<{label: string, value: TYPE_URL}>;
  urlType: string;

  buttonUrl: string;
  errorUrl: boolean;

  buttonAction: string;

  clickInside: boolean;

  constructor() { }

  /** Close panel on click outside */
  @HostListener("click")
  clicked() {
    this.clickInside = true;
  }

  @HostListener('document:click', ['$event'])
  clickedOut(event) {
    let parentId;
    try {
      parentId = event.target.id;
    } catch (error) {
      // error
    }
    if(this.clickInside === false && parentId !== classCardButtonNoClose) {
      this.closeButtonPanel.emit();
    }
    this.clickInside = false;
  }


  // SYSTEM FUNCTIONS //  
  /** */
  ngOnInit(): void {
    this.buttonLabelResult = true;
    this.errorUrl = false;
    this.buttonTypes = [
      {label: "text", value: this.typeOfButton.TEXT},
      {label: "url", value: this.typeOfButton.URL}, 
      {label: "go to intent", value: this.typeOfButton.ACTION}
    ];
    this.urlTypes = [
      {label: "blank", value: this.typeOfUrl.BLANK},
      {label: "parent", value: this.typeOfUrl.PARENT},
      {label: "self", value: this.typeOfUrl.SELF},
    ];
    this.buttonLabel = '';
    this.buttonType = this.typeOfButton.TEXT;
    this.urlType = this.typeOfUrl.BLANK;
    this.buttonUrl = '';
    
    try {
      this.buttonLabel = this.button.value?this.button.value:null;
      this.buttonType = this.button.type?this.button.type:null;
      this.urlType = this.button.target?this.button.target:null;
      this.buttonUrl = this.button.link?this.button.link:null;
      this.buttonAction = this.button.action?this.button.action:null;
    } catch (error) {
      // error
    }

    console.log('PanelButtonConfigurationComponent', this.button, this.buttonTypes);
    
  }


  // PRIVATE FUNCTIONS //  
  /** */
  // private addNewButton(){
  //   this.button = {
  //     'value': '',
  //     'type': this.typeOfButton.TEXT,
  //     'target': this.typeOfUrl.BLANK,
  //     'link': '',
  //     'action': '',
  //     'show_echo': true
  //   };
  // }

  
  private checkButtonLabel(): boolean {
    //setTimeout(() => {
      if (!this.buttonLabel || this.buttonLabel.length === 0){
        this.buttonLabelResult = false;
        return false;
      } else {
        this.button.value = this.buttonLabel;
        this.buttonLabelResult = true;
        return true;
      }
    //}, 300);
  }

  private checkTypeButton(){
    if(this.buttonType === this.typeOfButton.TEXT){
      return true;
    } else if(this.buttonType === this.typeOfButton.URL){
      return this.checkUrl(this.buttonUrl);
    } else if(this.buttonType === this.typeOfButton.ACTION){
      return this.checkAction(this.buttonAction);
    }
    return false;
  }

  private checkUrl(url: string): boolean {
    this.errorUrl = true;
    if(url && url.length > 1){
      this.errorUrl = false;
      this.button.link = url;
      this.button.target = this.urlType;
      return true;
    }
    return false;
  }

  private checkAction(action: string): boolean {
    if(action && action.length > 1){
      this.button.action = action;
      this.button.show_echo = true;
      return true;
    }
    return false;
  }
  

  // EVENTS FUNCTIONS //  
  /** */
  onSaveButton(){
    let checkLabel = this.checkButtonLabel();
    let checkType = this.checkTypeButton();
    if(checkLabel && checkType){
      this.saveButton.emit(this.button);
    }
  }

  /** */
  onBlurButtonLabel(name: string){
    this.buttonLabelResult = true;
  }

  /** */
  onChangeTypeButton(typeOfButton: {label:string, value: TYPE_BUTTON}) {
    this.button.type = typeOfButton.value;
  }

  /** */
  onChangeActionButton(actionButton) {
    this.button.action = actionButton;
  }

  /** */
  onCloseButtonPanel(){
    this.closeButtonPanel.emit();
  }

}
