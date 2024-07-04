import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'cnp-select-templates-or-kb',
  templateUrl: './cnp-select-templates-or-kb.component.html',
  styleUrls: ['./cnp-select-templates-or-kb.component.scss']
})
export class CnpSelectTemplatesOrKbComponent implements OnInit {

  @Output() prevPage = new EventEmitter();
  @Output() nextPage = new EventEmitter();
  @Output() goToNext = new EventEmitter();
  @Output() userSelection = new EventEmitter();
  // @Output() createProjectFromTemplates = new EventEmitter();
  // @Input() segmentAttributes: any;
  // @Input() updatedProject: any;
  selectedOption: any
  // dept_routing: string
  constructor() { }

  ngOnInit(): void {
  }


  goToPrevPage() {
    let event = { step: 'step3' }
    this.prevPage.emit(event);
  }

  goToNextPage() {
    let event = { step: 'step4' }
    this.nextPage.emit(event);

    // this.goToNext.emit(this.segmentAttributes);

  }


  has_clicked_kb() {
    this.selectedOption = 'kb'
    console.log('[CNP-SELECT-TEMPLATE-OR-KB] selectedOption', this.selectedOption) 
    this.userSelection.emit(this.selectedOption)
  }

  has_clicked_templates() {
    this.selectedOption = 'templates'
    console.log('[CNP-SELECT-TEMPLATE-OR-KB] selectedOption', this.selectedOption) 
    this.userSelection.emit(this.selectedOption)
  }

}
