import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { LoggerService } from 'app/services/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'app/services/chat21-core/providers/logger/loggerInstance';
import { slideInOutAnimation } from '../../../_animations/index';
@Component({
  selector: 'appdashboard-faq-sidebar',
  templateUrl: './faq-sidebar.component.html',
  styleUrls: ['./faq-sidebar.component.scss'],
  animations: [slideInOutAnimation],
  // tslint:disable-next-line:use-host-property-decorator
  host: { '[@slideInOutAnimation]': '' }
})
export class FaqSidebarComponent implements OnInit {
  @Output() valueChange = new EventEmitter();
  _displaydDemoModal = 'none'
  hasClickedStart= false;

  private logger: LoggerService = LoggerInstance.getInstance();
  
  constructor() { }

  ngOnInit() {
  }

  closeRightSideBar() {
    this.logger.log('[FAQ-SIDEBAR] - closeRightSideBar ')
    this.valueChange.emit(false);


    [].forEach.call(
      document.querySelectorAll('footer ul li a'),
      function (el) {
        this.logger.log('[FAQ-SIDEBAR] footer > ul > li > a element: ', el);
        el.setAttribute('style', 'text-transform: none');
      }
    );
  }


  closeDemoModal() {
    this._displaydDemoModal = 'none'
  }

  displaydDemoModal () {
    this._displaydDemoModal = 'block'
  }

  hasClickedStartAcquisitions(){
    this.hasClickedStart = true
  }

  closeDemoModalAndSetFalse() {
    this.hasClickedStart = false
    this._displaydDemoModal = 'none'
  }

}
