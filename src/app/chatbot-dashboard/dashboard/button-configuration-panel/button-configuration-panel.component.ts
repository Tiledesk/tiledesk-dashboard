import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { Button } from 'app/models/intent-model';

import { TYPE_BUTTON, TYPE_URL } from '../../utils';

@Component({
  selector: 'appdashboard-button-configuration-panel',
  templateUrl: './button-configuration-panel.component.html',
  styleUrls: ['./button-configuration-panel.component.scss']
})
export class ButtonConfigurationPanelComponent implements OnInit {

  @Output() createdNewButton = new EventEmitter();
  @Output() closeButtonPanel = new EventEmitter();
  @Input() arrayActions: Array<string>;
  @Input() button: Button;

  buttonLabelResult: boolean;
  buttonLabel: string;

  typeOfButton = TYPE_BUTTON;
  buttonTypes: Array<string>;
  buttonType: string;

  typeOfUrl = TYPE_URL;
  urlTypes: Array<string>;
  urlType: string;

  buttonUrl: string;
  errorUrl: boolean;

  buttonAction: string;

  clickInside: boolean;

  constructor() { }

  @HostListener("click")
  clicked() {
    this.clickInside = true;
    console.log('----> click::: ', this.clickInside);
  }

  @HostListener('document:click', ['$event'])
  clickedOut(event) {
    let parentId;
    try {
      parentId = event.target.id;
    } catch (error) {
      // error
    }
   
    console.log('onCloseButtonPanel ---------------> ', event, event.target, parentId)
    if(this.clickInside === false && parentId !== "card-buttons-no-close") {
      this.closeButtonPanel.emit();
    }
    this.clickInside = false;
  }

  ngOnInit(): void {
    this.arrayActions = ['uno', 'due'];
    this.buttonLabelResult = true;
    this.errorUrl = false;
    console.log('----> this.button::: ', this.button);

    this.buttonTypes = [this.typeOfButton.TEXT,this.typeOfButton.URL, this.typeOfButton.ACTION];
    this.urlTypes = [this.typeOfUrl.BLANK,this.typeOfUrl.PARENT, this.typeOfUrl.SELF];
    this.buttonLabel = '';
    this.buttonType = this.typeOfButton.TEXT;
    this.urlType = this.typeOfUrl.BLANK;
    this.buttonUrl = '';

    if(this.button){
      this.buttonLabel = this.button.value;
      this.buttonType = this.button.type;
      this.urlType = this.button.target;
      this.buttonUrl = this.button.link;
      this.buttonAction = this.button.action;
    } else {
      this.addNewButton();
    }

    // this.clickInside = true; // altrimenti non si apre
  }


  private addNewButton(){
    this.button = {
      'value': '',
      'type': this.typeOfButton.TEXT,
      'target': this.typeOfUrl.BLANK,
      'link': '',
      'action': '',
      'show_echo': true
    };
  }
  
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
  

  /** */
  onSaveButton(){
    let checkLabel = this.checkButtonLabel();
    let checkType = this.checkTypeButton();
    if(checkLabel && checkType){
      console.log('----> this.onSaveButton::: ', this.button);
      this.createdNewButton.emit(this.button);

    }
  }

  /** */
  // onChangeButtonLabel(name: string){
  //   name.toString();
  //   this.buttonLabel = name.replace(/[^A-Z0-9_]+/ig, "");
  // }

  /** */
  onBlurButtonLabel(name: string){
    this.buttonLabelResult = true;
  }






  /** */
  displayPlaceholder(event){
  }

  /** */
  displayMessage(field){
  }

  /** */
  onChangeTypeButton(typeOfButton) {
    this.button.type = typeOfButton;
  }

  /** */
  onChangeActionButton(actionButton) {
    this.button.action = actionButton;
  }

  

  triggerResize(){}

  onBlurIntentName(event){}
  onChangeIntentName(event){}

}
