import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActionWebRequest, ActionWebRequestV2 } from 'app/models/intent-model';
import { LoggerService } from 'app/services/logger/logger.service';
import { TYPE_METHOD_ATTRIBUTE, TYPE_METHOD_REQUEST, TEXT_CHARS_LIMIT } from 'app/chatbot-design-studio/utils';

@Component({
  selector: 'cds-action-web-request-v2',
  templateUrl: './cds-action-web-request-v2.component.html',
  styleUrls: ['./cds-action-web-request-v2.component.scss']
})
export class CdsActionWebRequestV2Component implements OnInit {

  @Input() action: ActionWebRequestV2;
  @Input() previewMode: boolean = true;
  @Output() updateAndSaveAction = new EventEmitter();
  @Output() onCreateUpdateConnector = new EventEmitter<{fromId: string, toId: string}>()
  
  listOfIntents: Array<{name: string, value: string, icon?:string}>;

  // Connectors
  idIntentSelected: string;
  idConnectorTrue: string;
  idConnectorFalse: string;
  isConnectedTrue: boolean = false;
  isConnectedFalse: boolean = false;
  connector: any;
  
  methods: Array<{label: string, value: string}>;
  pattern = "^[a-zA-Z_]*[a-zA-Z_]+[a-zA-Z0-9_]*$";

  limitCharsText = TEXT_CHARS_LIMIT;
  jsonHeader: any; 
  body: string = null
  jsonIsValid = true;
  errorMessage: string;
  methodSelectedHeader = true;
  methodSelectedBody = false;
  headerAttributes: any;

  // hasSelectedVariable: boolean = false;
  typeMethodAttribute = TYPE_METHOD_ATTRIBUTE;
  assignments: {} = {}

  bodyOptions: Array<{label: string, value: string, disabled: boolean, checked: boolean}>= [ {label: 'none', value: 'none', disabled: false, checked: true}, {label: 'Json', value: 'json', disabled: false, checked: false}]
  
  
  constructor(
    private logger: LoggerService
  ) { }

  // SYSTEM FUNCTIONS //
  ngOnInit(): void {
    // on init
  }

  ngOnChanges() {
    // on change
    this.initialize();
    console.log('[ACTION-WEB-REQUEST-v2] onChanges' , this.action )
    // if (this.action && this.action.assignStatusTo) {
    //   this.hasSelectedVariable = true
    // }
  }

  
  // CUSTOM FUNCTIONS //
  private initialize(){
    this.methods = Object.keys(TYPE_METHOD_REQUEST).map((key, index) => {
      return { label: key, value: key }
    })
    this.jsonHeader = this.action.headersString;
    this.jsonIsValid = this.isValidJson(this.action.body);
    if(this.jsonIsValid){
      this.body = this.action.body;
      this.body = this.formatJSON(this.body, "\t");
    }
    this.assignments = this.action.assignments
  }

  private setActionWebRequest(){
    this.action.body = this.body;
    this.updateAndSaveAction.emit()
  }

  private formatJSON(input, indent) {
    if (input.length == 0) {
      return '';
    }
    else {
      try {
        var parsedData = JSON.parse(input);
        return JSON.stringify(parsedData, null, indent);
      } catch (e) {
        return input;
      }
    }
  }

  private isValidJson(json) {
    try {
      JSON.parse(json);
      this.errorMessage = null;
      return true;
    } catch (e) {
      this.errorMessage = e;
      return false;
    }
  }


  // EVENT FUNCTIONS //
  onChangeMethodButton(e: {label: string, value: string}){
    this.action.method = e.value;
    this.updateAndSaveAction.emit()
  }


  onChangeButtonSelect(event: {label: string, value: string, disabled: boolean}){
    switch (event.value){
      case 'none':
        this.body = null
        break;
      case 'json':
        this.body = JSON.stringify({})
    }
    console.log('onChangeButtonSelect-->', event, this.body)
  }

  onChangeTextarea(e, type: 'url' | 'jsonBody'){
    this.logger.debug('onChangeTextarea:', e, type );
    switch(type){
      case 'jsonBody': {
        this.body = e;
        this.setActionWebRequest();
        setTimeout(() => {
          this.jsonIsValid = this.isValidJson(this.body);
          this.updateAndSaveAction.emit()
        }, 500);
        break;
      }
      case 'url' : {
        this.action.url = e
        this.updateAndSaveAction.emit()
      }
    }

  }

  onChangeParamsButton(){
    if(this.methodSelectedHeader){
      this.methodSelectedHeader = false;
      this.methodSelectedBody = true;
      this.jsonHeader = this.action.headersString;
    } else if(this.methodSelectedBody){
      this.methodSelectedHeader = true;
      this.methodSelectedBody = false;
    }
    this.jsonIsValid = this.isValidJson(this.body);
    this.setActionWebRequest();
  }

  onJsonFormatter(){
      try {
        this.body = this.formatJSON(this.body, "\t");
      }
      catch (err) {
        this.logger.error('error:', err);
      }
  }

  onChangeAttributes(attributes:any){
    // console.log('onChangeAttributes');
    this.action.headersString = attributes;
    this.updateAndSaveAction.emit()
    // this.jsonHeader = attributes;
  }

  onChangeAttributesResponse(attributes:{[key: string]: string }){
    this.action.assignments = attributes ;
    this.updateAndSaveAction.emit()
  }

  onSelectedAttribute(event, property) {
    this.logger.log("[ACTION-WEB-REQUEST-v2] onEditableDivTextChange event", event)
    this.logger.log("[ACTION-WEB-REQUEST-v2] onEditableDivTextChange property", property)
    this.action[property] = event.value;
    this.updateAndSaveAction.emit();
  }

  onChangeBlockSelect(event:{name: string, value: string}, type: 'trueIntent' | 'falseIntent') {
    if(event){
      this.action[type]=event.value
    }

    switch(type){
      case 'trueIntent':
        this.onCreateUpdateConnector.emit({ fromId: this.idConnectorTrue, toId: this.action.trueIntent})
        break;
      case 'falseIntent':
        this.onCreateUpdateConnector.emit({fromId: this.idConnectorFalse, toId: this.action.falseIntent})
        break;
    }
    this.updateAndSaveAction.emit();
  }

}
