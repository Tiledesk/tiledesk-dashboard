import { Component, OnInit, AfterViewInit, EventEmitter, Input, Output, ElementRef, ViewChild } from '@angular/core';
import { slideInOutAnimation } from '../../../_animations/index';
import { MongodbFaqService } from '../../../services/mongodb-faq.service';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from '../../../core/notify.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'appdashboard-ws-train-bot',
  templateUrl: './ws-train-bot.component.html',
  styleUrls: ['./ws-train-bot.component.scss'],
  animations: [slideInOutAnimation],
  // tslint:disable-next-line:use-host-property-decorator
  host: { '[@slideInOutAnimation]': '' }
})
export class WsTrainBotComponent implements OnInit {

  @ViewChild('searchbtn') private searchbtnRef: ElementRef;
  @ViewChild('searchbox') private searchboxRef: ElementRef;

  @Output() valueChange = new EventEmitter();
  @Input() selectedQuestion: string;

  faqToSearch: string;
  isOpenRightSidebar = true;
  sidebar_content_height: any;
  windowActualHeight: any;
  foundFAQs: any;
  faqSuccessfullyUpdated: string;
  faqErrorWhileUpdating: string;
  updatedFAQ: any;
  scrollpos: number;
  elSidebarContent: any;
  showSpinner = false;
  project_id: string;
  has_pressed_search = false;
  selectQuestionForTooltip: string;

  constructor(
    private faqService: MongodbFaqService,
    private translate: TranslateService,
    private notify: NotifyService,
    private router: Router,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.onInitSidebarContentHeight();
    this.getCurrentProject();
    console.log('WsTrainBotComponent - selectedQuestion ', this.selectedQuestion);

    this.translateFaqSuccessfullyUpdated();
    this.translateFaqErrorWhileUpdating();
    this.sliceSelectedQuestion(this.selectedQuestion)

  }
  /* TRUNCATE THE Selected Question DISPLAYED TOOLTIP */
  sliceSelectedQuestion(text: string) {
    if (text) {
      if (text.length >= 55) {
        this.selectQuestionForTooltip = text.slice(0, 55) + '...'
      } else {
        this.selectQuestionForTooltip = text
      }
    }
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        this.project_id = project._id;
      }
    });
  }

  // TRANSLATION
  translateFaqSuccessfullyUpdated() {
    this.translate.get('FaqUpdatedSuccessfullyMsg')
      .subscribe((text: string) => {

        this.faqSuccessfullyUpdated = text;
        // console.log('+ + + FaqUpdatedSuccessfullyMsg', text)
      });
  }

  translateFaqErrorWhileUpdating() {
    this.translate.get('FaqUpdatedErrorMsg')
      .subscribe((text: string) => {

        this.faqErrorWhileUpdating = text;
        // console.log('+ + + FaqUpdatedErrorMsg', text)
      });
  }



  onInitSidebarContentHeight() {
    this.windowActualHeight = window.innerHeight;
    console.log('WsTrainBotComponent - windowActualHeight ', this.windowActualHeight);
  }

  closeRightSideBar() {
    console.log('WsTrainBotComponent closeRightSideBar this.valueChange ', this.valueChange)
    // this.valueChange.next()
    this.valueChange.emit(false);
    this.isOpenRightSidebar = false;


    [].forEach.call(
      document.querySelectorAll('footer ul li a'),
      function (el) {
        // console.log('footer > ul > li > a element: ', el);
        el.setAttribute('style', 'text-transform: none');
      }
    );

  }


  searchFaq() {
    this.showSpinner = true;
    this.has_pressed_search = true;
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

    // if (this.elSidebarContent) {
    //   this.elSidebarContent.scrollTop = 279;
    //   console.log('TrainBotComponent SCROLL POSITION 2 ', this.scrollpos)
    // }

    this.faqService.getFaqsByText(this.faqToSearch)
      .subscribe((faqs: any) => {
        console.log('TrainBotComponent FAQs GOT BY TEXT ', faqs);
        // this.foundFAQs = faqs;

        /**
         **! *** FILTER ***
         * GET ONLY THE FAQ OF NOT TRASHED BOT
         */
        this.foundFAQs = faqs.filter((faq: any) => {
          return faq.faq_kb[0].trashed === false
        });

        console.log('TrainBotComponent FAQs GOT BY TEXT foundFAQs ', this.foundFAQs);
      }, (error) => {
        console.log('TrainBotComponent FAQs GOT BY TEXT  error', error);
        this.showSpinner = false;
      },
        () => {
          console.log('TrainBotComponent FAQs GOT BY TEXT * COMPLETE *');

          this.showSpinner = false;
        });

    // this.faqToSearch = getFaq.question
    console.log('searchFaq - faqToSearch ', this.faqToSearch);

  }

  // onScroll(event: any): void {
  //   this.elSidebarContent = <HTMLElement>document.querySelector('.sidebar-content');
  //   this.scrollpos = this.elSidebarContent.scrollTop
  //   console.log('TrainBotComponent SCROLL POSITION', this.scrollpos)
  // }

  clearFaqToSearch() {
    this.has_pressed_search = false;
    console.log('calling clearFaqToSearch');
    this.faqToSearch = '';
    this.foundFAQs = []
  }

  /**
   * *** EDIT FAQ ***
   */
  editFaq(faq_id: string, question: string, answer: string) {
    console.log('TrainBotComponent FAQ ID TO UPDATE ', faq_id);
    console.log('TrainBotComponent FAQ QUESTION TO UPDATE ', question);
    console.log('TrainBotComponent FAQ ANSWER TO UPDATE ', answer);


    this.faqService.updateTrainBotAnswer(faq_id, question + '\n\n' + this.selectedQuestion, answer)
      .subscribe((updatedFAQ) => {
        console.log('TrainBotComponent PUT DATA (UPDATED FAQs)', updatedFAQ);
        this.updatedFAQ = updatedFAQ;

      }, (error) => {
        console.log('TrainBotComponent PUT (UPDATE FAQ) REQUEST ERROR ', error);
        // =========== NOTIFY ERROR ===========
        this.notify.showNotification(this.faqErrorWhileUpdating, 4, 'report_problem');
      }, () => {
        console.log('TrainBotComponent PUT (UPDATE FAQ) REQUEST * COMPLETE *');
        // =========== NOTIFY SUCCESS===========
        this.notify.showNotification(this.faqSuccessfullyUpdated, 2, 'done');

        this.foundFAQs.forEach(faq => {
          console.log('TrainBotComponent foundFAQs faq', faq);
          if (faq_id === faq._id) {
            faq.question = faq.question + '\n\n' + this.selectedQuestion
          }
        });
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
        // console.log('footer > ul > li > a element: ', el);

        el.setAttribute('style', 'z-index:-1; text-transform: none');

      }
    );

    // for (let i = 0, len = 3; i < len; i++) {
    //   console.log('elemFooter', elemFooter[i]);
    //   // work with checkboxes[i]
    // }
    // elemFooter.setAttribute('style', 'z-index:-1');
  }

  goToBot(idFaqKb: string) {
    console.log('TrainBotComponent goToBot id_bot', idFaqKb);

    // this.router.navigate(['project/' + this.project._id + '/faq', idFaqKb]);
    this.router.navigate(['project/' + this.project_id + '/bots', idFaqKb, 'native']);
  }







}
