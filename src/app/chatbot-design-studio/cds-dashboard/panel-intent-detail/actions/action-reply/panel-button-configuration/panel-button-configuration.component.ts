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
  labelAction: string;
  urlType: string;
  buttonUrl: string;
  errorUrl: boolean;
  buttonAction: string;
  clickInside: boolean;
  buttonAttributes: Array<any>;

  constructor(
    private eRef: ElementRef
  ) { }


  // SYSTEM FUNCTIONS //  
  /** */
  ngOnInit(): void {
    // this.initialize();
  }

  ngOnChanges() {
    this.initialize();
  }


  ngAfterViewInit() {
    this.input_topic.myInput.nativeElement.focus();
  }


  private initialize(){
    this.buttonLabelResult = true;
    this.errorUrl = false;
    this.buttonLabel = '';
    this.buttonType = this.typeOfButton.TEXT;
    this.urlType = this.typeOfUrl.BLANK;
    this.buttonUrl = '';
    this.buttonAction = null;
    this.buttonAttributes = [];
    try {
      this.buttonLabel = this.button.value ? this.button.value : null;
      this.buttonType = this.button.type ? this.button.type : null;
      this.urlType = this.button.target ? this.button.target : null;
      this.buttonUrl = this.button.link ? this.button.link : null; 
      // this.buttonAttributes = this.button.attributes ? this.button.attributes : [];
    } catch (error) {
      // error
    }
    let intent = this.setAttributesFromAction(this.button.action);
    if(intent && intent.action !== null){
      this.buttonAction = intent.action;
    }
    if(intent && intent.attributes !== null){
      this.buttonAttributes = intent.attributes;
    }
  }


  // PRIVATE FUNCTIONS //  
  private setAttributesFromAction(actionAndParameters) {
    let intent: any = {};
    if (actionAndParameters === null) {
      return null; // invalid intent
    }
    if (actionAndParameters.trim().length === 0) {
      return null; // invalid intent
    }
    let parts = actionAndParameters.split("{");
    if (parts.length > 0 && parts[0].startsWith("{")) {
      return null; // invalid intent
    } else {
      // console.log('intent 2', actionAndParameters);
      intent.action = parts[0];
      // console.log('intent 3', intent);
    }
    if (parts.length > 1) {
      let attributes = (actionAndParameters.substring(parts[0].length));
      // console.log('intent 4', intent);
      try {
        intent.attributes = JSON.parse(attributes);
        // console.log('intent 5', intent);
      }
      catch (err) {
        console.log("error on intent.parameters = JSON.parse(json_string)", err);
      }            
    }
    return intent;
  }


  private setFocusOnButtonSave(){
    try {
      this.button_save_topic.nativeElement.focus();
    } catch (error) {
      console.log('error: ', error);
    }
  }

  private checkButtonLabel(): boolean {
    try {
      if (!this.buttonLabel || this.buttonLabel.length === 0) {
        this.buttonLabel = '';
      }
      this.button.value = this.buttonLabel;
      this.buttonLabelResult = true;
    } catch (error) {
      console.log('error: ', error);
    }
    return true;
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
    // console.log('checkAction: ', action);
    if (action && action.length > 1) {
      // this.button.action = action;
      // this.button.action = this.buttonAction + JSON.stringify(this.buttonAttributes);
      this.button.show_echo = true;
      return true;
    }
    return false;
  }

  private checkAndSaveButton(){
    // console.log('checkAndSaveButton: ');
    let checkLabel = this.checkButtonLabel();
    let checkType = this.checkTypeButton();
    if (checkLabel && checkType) {
      this.saveButton.emit(this.button);
    }
  }

  // EVENTS FUNCTIONS //  
  /** */
  onSaveButton() {
    // console.log('onSaveButton: ');
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
    // console.log('onChangeActionButton: ', actionButton);
    this.buttonAction = actionButton;
  }

  onChangeSelect(event: {name: string, value: string}){
    // console.log('onChangeSelect: ', event);
    this.buttonAction = event.value;
    // this.button.action = this.buttonAction + this.buttonAttributes;
    this.button.action = this.buttonAction + JSON.stringify(this.buttonAttributes);
    this.setFocusOnButtonSave();
  }

  /** */
  onCloseButtonPanel() {
    this.closeButtonPanel.emit();
  }

  onChangeTitle(text: string) {
    // console.log('onChangeTitle: ');
    this.buttonLabel = text;
    this.checkAndSaveButton();
  }

  onChangeUrl(text: string) {
    // console.log('onChangeUrl: ');
    this.buttonUrl = text;
    this.checkAndSaveButton();
  }

  onChangeAttributes(attributes:any){
    // console.log('attributes: ', this.button, attributes);
    this.button.attributes = attributes;
    this.button.action = this.buttonAction + JSON.stringify(attributes);
    delete(this.button.attributes);
    this.saveButton.emit(this.button);
  }


  
  
  

}
