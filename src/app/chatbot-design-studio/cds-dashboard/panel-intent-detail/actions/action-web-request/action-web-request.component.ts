import { Component, OnInit, Input } from '@angular/core';
import { ActionWebRequest } from 'app/models/intent-model';
import { LoggerService } from 'app/services/logger/logger.service';
import { TYPE_METHOD_ATTRIBUTE, TYPE_METHOD_REQUEST, TEXT_CHARS_LIMIT } from '../../../../utils';

@Component({
  selector: 'cds-action-web-request',
  templateUrl: './action-web-request.component.html',
  styleUrls: ['./action-web-request.component.scss']
})
export class ActionWebRequestComponent implements OnInit {

  @Input() action: ActionWebRequest;
  methods: Array<string>;
  pattern = "^[a-zA-Z_]*[a-zA-Z_]+[a-zA-Z0-9_]*$";

  limitCharsText = TEXT_CHARS_LIMIT;
  jsonHeader: any; 
  jsonBody: string;
  jsonIsValid = true;
  errorMessage: string;
  methodSelectedHeader = true;
  methodSelectedBody = false;
  headerAttributes: any;

  hasSelectedVariable: boolean = false;
  typeMethodAttribute = TYPE_METHOD_ATTRIBUTE;
  assignments: {} = {}

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
    if (this.action && this.action.assignTo) {
      this.hasSelectedVariable = true
    }
  }

  
  // CUSTOM FUNCTIONS //
  private initialize(){
    this.methods = Object.values(TYPE_METHOD_REQUEST);
    this.jsonHeader = this.action.headersString;
    this.jsonIsValid = this.isValidJson(this.action.jsonBody);
    if(this.jsonIsValid){
      this.jsonBody = this.action.jsonBody;
      this.jsonBody = this.formatJSON(this.jsonBody, "\t");
    }
    this.assignments = this.action.assignments
  }

  private setActionWebRequest(){
    this.action.jsonBody = this.jsonBody;
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
  onChangeMethodButton(e){
    this.action.method = e;
  }

  onChangeTextarea(e, type: 'url' | 'jsonBody'){
    this.logger.debug('onChangeTextarea:', e, type );
    switch(type){
      case 'jsonBody': {
        this.jsonBody = e;
        this.setActionWebRequest();
        setTimeout(() => {
          this.jsonIsValid = this.isValidJson(this.jsonBody);
        }, 500);
        break;
      }
      case 'url' : {
        this.action.url = e
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
    this.jsonIsValid = this.isValidJson(this.jsonBody);
    this.setActionWebRequest();
  }

  onJsonFormatter(){
      try {
        this.jsonBody = this.formatJSON(this.jsonBody, "\t");
      }
      catch (err) {
        this.logger.error('error:', err);
      }
  }

  onChangeAttributes(attributes:any){
    // console.log('onChangeAttributes');
    this.action.headersString = attributes;
    // this.jsonHeader = attributes;
  }

  onClearSelectedAttribute(){
    this.action.assignTo = '';
    this.hasSelectedVariable = false;
  }
  
  onSelectedAttribute(variableSelected: {name: string, value: string}, step: number){
    this.hasSelectedVariable = true;
    this.action.assignTo = variableSelected.value;
  }


  onChangeAttributesResponse(attributes:{[key: string]: string }){
    this.action.assignments = attributes ;
  }

}
