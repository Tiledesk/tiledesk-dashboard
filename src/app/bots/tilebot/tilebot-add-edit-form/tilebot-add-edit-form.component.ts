import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'appdashboard-tilebot-add-edit-form',
  templateUrl: './tilebot-add-edit-form.component.html',
  styleUrls: ['./tilebot-add-edit-form.component.scss']
})
export class TilebotAddEditFormComponent implements OnInit {  

  @Output() closeAddEditForm = new EventEmitter();
  @Output() saveAddEditForm = new EventEmitter();
  @Input() field: any;

  langDashboard = 'En';
  nameResult = true;
  labelResult = true;
  regexResult = true;
  errorLabelResult = true;
  showRegexField = false;
  displayInfoMessage = false;


  textRGEX = /^.{1,}$/;
  phoneRGEX = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;
  nameRGEX = /^[a-zA-Z0-9_]{1,}$/;
  emailRGEX = /^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/;

  infoMessages = {}
  infoMessage: string;


  constructor(
    private translate: TranslateService,
    private httpClient: HttpClient
  ) {}

  ngOnInit(): void {
    this.getCurrentTranslation();
    this.infoMessage = this.infoMessages['field_name'];
    if(!this.field){
      this.field = {
        "name": "",
        "type": "text",
        "regex": "",
        "label": "",
        "errorLabel": ""
      }
    }
  }

  // FUNCTIONS //
  /** */
  getCurrentTranslation() {   
    if(this.translate.currentLang){
      this.langDashboard = this.translate.currentLang;
    }
    let jsonWidgetLangURL = 'assets/i18n/'+this.langDashboard+'.json';
    this.httpClient.get(jsonWidgetLangURL).subscribe(data =>{
      this.infoMessages = data['AddIntentPage'].InfoMessages;
    })
  }

  /** */
  checkFields(){
    this.nameResult = true;
    this.labelResult = true;
    this.errorLabelResult = true;
    let status = true;
    switch (this.field.type) {
      case 'email':
        this.field.regex = this.emailRGEX;
        break;
      case 'number':
        this.field.regex = this.phoneRGEX;
        break;
      default:
        this.field.regex = this.textRGEX;
    }
    this.nameResult = this.nameRGEX.test(this.field.name);
    if(this.nameResult === false){
      status = false;
    }
    // console.log('this.nameResult:', this.nameResult);
    // console.log('this.field.name:', this.field.name);
    if(this.field.name.length == 0){
      this.nameResult = false;
      status = false;
    }

    if(this.field.label.length == 0){
      this.labelResult = false;
      status = false;
    }
    // if(this.field.errorLabel.length == 0){
    //   this.errorLabelResult = false;
    //   status = false;
    // }
    if(this.field.regex.length == 0 && this.field.type === 'custom'){
      this.regexResult = false;
      status = false;
    }

    this.field.regex = this.field.regex.toString();
    return status;
  }


  // ON EVENT //

  onChange(typeFieldValue) {
    if(typeFieldValue === 'custom'){
      this.showRegexField = true;
    } else {
      this.showRegexField = false;
    }
  }

  displayMessage(field){
    if(this.infoMessages[field]){
      this.infoMessage = this.infoMessages[field];
      this.displayInfoMessage = true;
    }
  }

  save(){
    this.displayInfoMessage = false;
    if(this.checkFields()){
      this.saveAddEditForm.emit(this.field);
    }
  }

  close() {
    this.displayInfoMessage = false;
    this.closeAddEditForm.emit();
  }

}
