import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { slideInOutAnimation } from '../../_animations/index';
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
  constructor() { }

  ngOnInit() {
  }

  closeRightSideBar() {
    console.log('FaqSidebarComponent - closeRightSideBar ')
    this.valueChange.emit(false);



    [].forEach.call(
      document.querySelectorAll('footer ul li a'),
      function (el) {
        console.log('footer > ul > li > a element: ', el);
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
