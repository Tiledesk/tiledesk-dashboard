import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'cnp-select-templates-or-kb',
  templateUrl: './cnp-select-templates-or-kb.component.html',
  styleUrls: ['./cnp-select-templates-or-kb.component.scss']
})
export class CnpSelectTemplatesOrKbComponent implements OnInit, OnChanges {

  @Output() prevPage = new EventEmitter();
  @Output() nextPage = new EventEmitter();
  @Output() goToNext = new EventEmitter();
  @Output() userSelection = new EventEmitter();
  // @Output() createProjectFromTemplates = new EventEmitter();
  @Input() segmentAttributes: any;
  @Input() updatedProject: any;
  selectedOption: string
  isMobile: boolean = true;
  constructor(
    private logger: LoggerService,
  ) { }

  ngOnInit(): void {
    this.has_clicked_kb()
    this.detectMobile()
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.logger.log('[CNP-SELECT-TEMPLATE-OR-KB] ngOnChanges segmentAttributes ', this.segmentAttributes) 
  }

  detectMobile() {
    this.isMobile = /Android|iPhone/i.test(window.navigator.userAgent);
    this.logger.log('[CNP-SELECT-TEMPLATE-OR-KB] - IS MOBILE ', this.isMobile);
  }

  goToPrevPage() {
    let event = { step: 'step3' }
    this.prevPage.emit(event);
  }

  goToNextPage() {
    let event = { step: 'step4' }
    this.nextPage.emit(event);

    this.segmentAttributes['onboarding_type'] = this.selectedOption
    this.goToNext.emit(this.segmentAttributes);

    // this.goToNext.emit(this.segmentAttributes);

  }


  has_clicked_kb() {
    this.selectedOption = 'kb'
    this.logger.log('[CNP-SELECT-TEMPLATE-OR-KB] selectedOption', this.selectedOption) 
    this.userSelection.emit(this.selectedOption)
  }

  has_clicked_templates() {
    this.selectedOption = 'templates'
    this.logger.log('[CNP-SELECT-TEMPLATE-OR-KB] selectedOption', this.selectedOption) 
    this.userSelection.emit(this.selectedOption)
  }

}
