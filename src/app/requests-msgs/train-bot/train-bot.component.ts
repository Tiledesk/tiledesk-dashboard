import { Component, OnInit, AfterViewInit, EventEmitter, Input, Output, ElementRef, ViewChild } from '@angular/core';
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
  @ViewChild('searchbtn') private searchbtnRef: ElementRef;
  @ViewChild('searchbox') private searchboxRef: ElementRef;

  @Output() valueChange = new EventEmitter();
  @Input() selectedQuestion;
  faqToSearch: string;
  isOpenRightSidebar = true;
  sidebar_content_height: any;
  windowActualHeight: any;
  foundFAQs = []
  constructor() { }

  ngOnInit() {
    this.onInitSidebarContentHeight();
    console.log('TrainBotComponent - selectedQuestion ', this.selectedQuestion);
  }

  onInitSidebarContentHeight() {

    this.windowActualHeight = window.innerHeight;
    console.log('TrainBotComponent - windowActualHeight ', this.windowActualHeight);
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
    const elemBubbleOfSelectedQuestion = <HTMLElement>document.querySelector('.selected-question');
    console.log('TrainBotComponent - elemBubbleOfSelectedQuestion ', elemBubbleOfSelectedQuestion);
    const elemBubbleHeight = elemBubbleOfSelectedQuestion.clientHeight;
    console.log('TrainBotComponent - elemBubbleHeight 2', elemBubbleHeight);

    this.sidebar_content_height = this.windowActualHeight - elemBubbleHeight + 25 + 'px';
    console.log('TrainBotComponent - sidebar_content_height ', this.sidebar_content_height);


    // ########### Check if  the sidebar-content html element has scrollbar ###########
    // const elemSidebarContent = <HTMLElement>document.querySelector('.sidebar-content');
    // console.log('TrainBotComponent - elemSidebarContent ', elemSidebarContent);
    // console.log('TrainBotComponent - elemSidebarContent scrollWidth', elemSidebarContent.scrollWidth);
    // console.log('TrainBotComponent - elemSidebarContent clientWidth', elemSidebarContent.clientWidth);
    // var hasHorizontalScrollbar = elemSidebarContent.scrollWidth > elemSidebarContent.clientWidth;
    // console.log('TrainBotComponent - hasHorizontalScrollbar ', hasHorizontalScrollbar);


    this.searchbtnRef.nativeElement.blur();
    console.log('searchFaq - faqToSearch ', this.faqToSearch)
    const faq = [
      { question: 'Ciao', answer: 'Ciao lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
      { question: 'Ciao', answer: 'Hi' },
      { question: 'Ciao', answer: 'Ola' },
      { question: 'Ciao', answer: 'Ciao lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
      { question: 'Ciao', answer: 'Ciao lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' },
      { question: 'Ciao', answer: 'Ciao lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' },
      { question: 'Ciao', answer: 'Ciao lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' },
      { question: 'Ciao', answer: 'Ciao lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' },

    ];
    // const getFaq = faq.find(f =>
    //   f.question === this.faqToSearch || f.answer === this.faqToSearch
    // );

    faq.forEach(f => {

      // DA CHIEDERE: CERCARE SIA PER LA DOMANDA CHE PER LA RISPOSTA
      if (f.question === this.faqToSearch || f.answer === this.faqToSearch) {

        this.foundFAQs.push({ 'question': f.question, 'answer': f.answer })

      }
    });

    // this.faqToSearch = getFaq.question
    console.log('searchFaq - faqToSearch ', this.faqToSearch)
    console.log('getFaq ', this.foundFAQs);

  }

  clearFaqToSearch() {
    console.log('calling clearFaqToSearch');
    this.faqToSearch = '';
  }

  ngAfterViewInit() {
    console.log('searchboxRef ', this.searchboxRef)
    this.searchboxRef.nativeElement.focus();

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
