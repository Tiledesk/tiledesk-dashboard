import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'cds-panel-elements',
  templateUrl: './cds-panel-elements.component.html',
  styleUrls: ['./cds-panel-elements.component.scss']
})
export class CdsPanelElementsComponent implements OnInit {
  @Output() addNewElement = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }


  onAddNewElement(){
    // console.log(':::: CdsPanelElementsComponent onAddNewElement :::: ');
    this.addNewElement.emit();
  }
}
