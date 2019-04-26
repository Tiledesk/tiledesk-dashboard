import { Component, OnInit, AfterViewInit, EventEmitter, Input, Output } from '@angular/core';
import { slideInOutAnimation } from '../../_animations/index';

@Component({
  selector: 'appdashboard-train-bot',
  templateUrl: './train-bot.component.html',
  styleUrls: ['./train-bot.component.scss'],
  animations: [slideInOutAnimation],
  // tslint:disable-next-line:use-host-property-decorator
  host: { '[@slideInOutAnimation]': '' }
})
export class TrainBotComponent implements OnInit, AfterViewInit {

  @Output() valueChange = new EventEmitter();
  @Input() selectedQuestion;
  faqToSearch: string;
  isOpenRightSidebar = true;

  constructor() { }

  ngOnInit() {

    console.log('selectedQuestion ', this.selectedQuestion);
  }


  closeRightSideBar() {
    console.log('closeRightSideBar ')
    this.valueChange.emit(false);
    this.isOpenRightSidebar = false;


    [].forEach.call(
      document.querySelectorAll('footer ul li a'),
      function (el) {
        console.log('footer > ul > li > a element: ', el);
        el.setAttribute('style', 'text-transform: none');
      }
    );
  }

  searchFaq() {
    console.log('searchFaq - faqToSearch ', this.faqToSearch)
  }

  clearFaqToSearch() {
    console.log('calling clearFaqToSearch');
    this.faqToSearch = '';
  }

  ngAfterViewInit() {
    // ul li a
    const elemFooter = <HTMLElement>document.querySelector('footer ul li');
    console.log('elemFooter ', elemFooter);

    [].forEach.call(

      document.querySelectorAll('footer ul li a'),
      function (el) {
        console.log('footer > ul > li > a element: ', el);

        el.setAttribute('style', 'z-index:-1; text-transform: none');

      }
    );

    // for (let i = 0, len = 3; i < len; i++) {
    //   console.log('elemFooter', elemFooter[i]);
    //   // work with checkboxes[i]
    // }
    // elemFooter.setAttribute('style', 'z-index:-1');
  }

}
