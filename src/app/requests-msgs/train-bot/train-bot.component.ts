import { Component, OnInit, AfterViewInit, EventEmitter, Input, Output, ElementRef, ViewChild } from '@angular/core';
import { slideInOutAnimation } from '../../_animations/index';
import { MongodbFaqService } from '../../services/mongodb-faq.service';

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

  constructor(
    private faqService: MongodbFaqService
  ) { }

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
  /**
    * GET ONLY THE FAQ WITH THE FAQ-KB ID PASSED FROM FAQ-KB COMPONENT
    */
  getFaqByFaqKbId() {
    this.faqService.getMongoDbFaqByFaqKbId('d9497a95-f381-42ab-865a-1004685c0a94')
      .subscribe((faq: any) => {
        console.log('>> FAQs GOT BY FAQ-KB ID', faq);


        // this.faq = faq;
        //   if (faq) {
        //     this.faq_lenght = faq.length
        //   }
        // }, (error) => {
        //   this.showSpinner = false;
        //   console.log('>> FAQs GOT BY FAQ-KB ID - ERROR', error);

        // }, () => {
        //   this.showSpinner = false;
        //   console.log('>> FAQs GOT BY FAQ-KB ID - COMPLETE');
        // });
      })
  }


  searchFaq() {
    const elemBubbleOfSelectedQuestion = <HTMLElement>document.querySelector('.selected-question');
    console.log('TrainBotComponent - elemBubbleOfSelectedQuestion ', elemBubbleOfSelectedQuestion);
    const elemBubbleHeight = elemBubbleOfSelectedQuestion.clientHeight;
    console.log('TrainBotComponent - elemBubbleHeight 2', elemBubbleHeight);

    // this.sidebar_content_height = this.windowActualHeight - elemBubbleHeight + 25 + 'px';
    this.sidebar_content_height = 500 + 'px';
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

    this.faqService.getFaqsByText(this.faqToSearch)
      .subscribe((faq: any) => {
        console.log('TrainBotComponent FAQs GOT BY FAQ-KB ID', faq);
        this.foundFAQs = faq;
        console.log('getFaq ', this.foundFAQs);
      })

    // this.faqToSearch = getFaq.question
    console.log('searchFaq - faqToSearch ', this.faqToSearch);

  }

  clearFaqToSearch() {
    console.log('calling clearFaqToSearch');
    this.faqToSearch = '';
  }


  /**
   * *** EDIT FAQ ***
   */
  editFaq(faq_id: string, question: string, answer: string) {
    console.log('TrainBotComponent FAQ ID TO UPDATE ', faq_id);
    console.log('TrainBotComponent FAQ QUESTION TO UPDATE ', question);
    console.log('TrainBotComponent FAQ ANSWER TO UPDATE ', answer);

    this.faqService.updateMongoDbFaq(faq_id, question + '\n\n' + this.selectedQuestion, answer)
      .subscribe((data) => {
        console.log('TrainBotComponent PUT DATA (UPDATE FAQ)', data);

      }, (error) => {
        console.log('TrainBotComponent PUT (UPDATE FAQ) REQUEST ERROR ', error);
        // =========== NOTIFY ERROR ===========
        // this.notify.showNotification('An error occurred while updating the FAQ', 4, 'report_problem');
        // this.notify.showNotification(this.editFaqErrorNoticationMsg, 4, 'report_problem');
      }, () => {
        console.log('TrainBotComponent PUT (UPDATE FAQ) REQUEST * COMPLETE *');
        // =========== NOTIFY SUCCESS===========
        // this.notify.showNotification('FAQ successfully updated', 2, 'done');
        // this.notify.showNotification(this.editFaqSuccessNoticationMsg, 2, 'done');


      });
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
