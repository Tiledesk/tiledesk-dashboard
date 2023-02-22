import { Component, OnInit, Input } from '@angular/core';
import { ActionWebRequest } from 'app/models/intent-model';
import { TYPE_METHOD_REQUEST, TEXT_CHARS_LIMIT } from '../../../../utils';

@Component({
  selector: 'cds-action-web-request',
  templateUrl: './action-web-request.component.html',
  styleUrls: ['./action-web-request.component.scss']
})
export class ActionWebRequestComponent implements OnInit {

  @Input() action: ActionWebRequest;
  methods: Array<string>;

  limitCharsText = TEXT_CHARS_LIMIT;
  jsonHeader: string; 
  jsonBody: string;
  jsonText: string;
  jsonIsValid = true;
  errorMessage: string;
  methodSelectedHeader = true;
  methodSelectedBody = false;

  constructor() { }

  // SYSTEM FUNCTIONS //
  ngOnInit(): void {
    this.initialize();
  }

  
  // CUSTOM FUNCTIONS //
  private initialize(){
    this.methods = Object.values(TYPE_METHOD_REQUEST);
    this.jsonHeader = JSON.parse(this.action.headersString);
    this.jsonBody = JSON.parse(this.action.jsonBody);
    //this.action.method = this.action.method;
    this.setActionWebRequest();
    this.switchJsonText();
  }

  private setActionWebRequest(){
    this.action.headersString = JSON.stringify(this.jsonHeader);
    this.action.jsonBody = JSON.stringify(this.jsonBody);
  }

  private switchJsonText(){
    this.jsonText = this.jsonHeader;
    this.jsonText = this.formatJSON(this.jsonText, "\t");
  }

  private formatJSON(input, indent) {
    if (input.length == 0) {
      return '';
    }
    else {
      var parsedData = JSON.parse(input);
      return JSON.stringify(parsedData, null, indent);
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

  onChangeTextarea(e){
    // console.log('onChangeTextarea:: ', e);
    if(this.methodSelectedHeader){
      this.jsonHeader = this.jsonText;
    } else if(this.methodSelectedBody){
      this.jsonBody = this.jsonText;
    }
    this.setActionWebRequest();
    setTimeout(() => {
      this.jsonIsValid = this.isValidJson(this.jsonText);
    }, 500);
  }

  onChangeParamsButton(){
    if(this.methodSelectedHeader){
      this.methodSelectedHeader = false;
      this.methodSelectedBody = true;
      this.jsonHeader = this.jsonText;
      this.jsonText = this.jsonBody;
    } else if(this.methodSelectedBody){
      this.methodSelectedHeader = true;
      this.methodSelectedBody = false;
      this.jsonBody = this.jsonText;
      this.jsonText = this.jsonHeader;
    }
    this.jsonIsValid = this.isValidJson(this.jsonText);
    this.setActionWebRequest();
  }

  onJsonFormatter(){
      try {
        this.jsonText = this.formatJSON(this.jsonText, "\t");
      }
      catch (err) {
        console.log('error:', err);
      }
  }
  
}
