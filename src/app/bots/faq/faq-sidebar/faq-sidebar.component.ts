import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { slideInOutAnimation } from '../../../_animations/index';
import { LoggerService } from '../../../services/logger/logger.service';
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
  constructor(
    private logger: LoggerService
  ) { }

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
