import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'cnp-project-name',
  templateUrl: './cnp-project-name.component.html',
  styleUrls: ['./cnp-project-name.component.scss']
})
export class CnpProjectNameComponent implements OnInit {
  @Output() goToSetProjectName = new EventEmitter();
  @Input() projectName: any;

  LIMIT = 4;
  displayError: boolean = false;
  disabledButton: boolean = true;

  constructor() { }

  ngOnInit(): void {
    this.initialize();
  }

  initialize(){
    if(this.projectName){
      this.disabledButton = false;
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
