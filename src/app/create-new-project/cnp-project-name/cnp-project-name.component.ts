import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'cnp-project-name',
  templateUrl: './cnp-project-name.component.html',
  styleUrls: ['./cnp-project-name.component.scss']
})
export class CnpProjectNameComponent implements OnInit {
  @Output() goToSetProjectName = new EventEmitter();
  @Input() question: any;

  projectName: string;
  LIMIT = 4;
  displayError: boolean = false;
  disabledButton: boolean = true;

  title: string;
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
      this.title = this.question.title;
    } catch (error) {
      this.title = "";
    }
    try {
      this.placeholder = this.question.labels['placeholder'];
    } catch (error) {
      this.placeholder = "";
    }
    try {
      this.message = this.question.labels['message'];
    } catch (error) {
      this.message = "";
    }
    try {
      this.messageError = this.question.labels['message-error'];
    } catch (error) {
      this.messageError = "";
    }
    try {
      this.labelButton = this.question.labels['label-button'];
    } catch (error) {
      this.labelButton = "CONTINUE";
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
    this.goToSetProjectName.emit(this.projectName);
  }
}
