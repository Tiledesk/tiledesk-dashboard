import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'cnp-project-name',
  templateUrl: './cnp-project-name.component.html',
  styleUrls: ['./cnp-project-name.component.scss']
})
export class CnpProjectNameComponent implements OnInit {
  @Output() goToSetProjectName = new EventEmitter();
  @Input() jsonInit: any;

  projectName: string;
  LIMIT = 4;
  displayError: boolean = false;
  disabledButton: boolean = true;

  subtitle: string;
  placeholder: string;
  message: string;
  messageError: string;
  labelButton: string;

  constructor() { }

  ngOnInit(): void {
    this.initialize();
  }

  initialize(){
    try {
      this.subtitle = this.jsonInit.subtitle;
    } catch (error) {
      this.subtitle = "";
    }
    try {
      this.placeholder = this.jsonInit.labels['placeholder'];
    } catch (error) {
      this.placeholder = "";
    }
    try {
      this.message = this.jsonInit.labels['message'];
    } catch (error) {
      this.message = "";
    }
    try {
      this.messageError = this.jsonInit.labels['message-error'];
    } catch (error) {
      this.messageError = "";
    }
    try {
      this.labelButton = this.jsonInit.labels['label-button'];
    } catch (error) {
      this.labelButton = "CONTINUE";
    }
    if(this.jsonInit.answer){
      this.disabledButton = false;
      this.projectName = this.jsonInit.answer;
    }
  }


  onChange(){
    this.displayError = this.projectName?.length > 0 && this.projectName?.length < this.LIMIT;
    if( this.projectName?.length > 0 &&  this.displayError === false){
      this.disabledButton = false;
    } else {
      this.disabledButton = true;
    }
  }

  onGoToNext(){
    this.jsonInit.answer = this.projectName;
    this.goToSetProjectName.emit(this.projectName);
  }
}
