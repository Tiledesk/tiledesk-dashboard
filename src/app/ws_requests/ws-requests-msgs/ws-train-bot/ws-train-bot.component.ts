import { Component, OnInit, AfterViewInit, EventEmitter, Input, Output, ElementRef, ViewChild, OnChanges, OnDestroy } from '@angular/core';
import { slideInOutAnimation } from '../../../_animations/index';
import { FaqService } from '../../../services/faq.service';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from '../../../core/notify.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { LoggerService } from '../../../services/logger/logger.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'appdashboard-ws-train-bot',
  templateUrl: './ws-train-bot.component.html',
  styleUrls: ['./ws-train-bot.component.scss'],
  animations: [slideInOutAnimation],
  // tslint:disable-next-line:use-host-property-decorator
  host: { '[@slideInOutAnimation]': '' }
})
export class WsTrainBotComponent implements OnInit, OnChanges, OnDestroy {

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
  private unsubscribe$: Subject<any> = new Subject<any>();
  /**
   * Constructor
   * @param faqService 
   * @param translate 
   * @param notify 
   * @param router 
   * @param auth 
   * @param logger 
   */
  constructor(
    private faqService: FaqService,
    private translate: TranslateService,
    private notify: NotifyService,
    private router: Router,
    private auth: AuthService,
    private logger: LoggerService
  ) { }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  ngOnInit() {
    this.onInitSidebarContentHeight();
    this.getCurrentProject();
    this.translateFaqSuccessfullyUpdated();
    this.translateFaqErrorWhileUpdating();
    this.sliceSelectedQuestion(this.selectedQuestion)
  }

  ngOnChanges() {
    this.logger.log('[WS-TRAIN-BOT] - selectedQuestion ', this.selectedQuestion);
  }

  ngAfterViewInit() {
    this.logger.log('searchboxRef ', this.searchboxRef)
    this.searchboxRef.nativeElement.focus();

    // ul li a
    const elemFooter = <HTMLElement>document.querySelector('footer ul li');
    this.logger.log('elemFooter ', elemFooter);

    [].forEach.call(

      document.querySelectorAll('footer ul li a'),
      function (el) {
        el.setAttribute('style', 'z-index:-1; text-transform: none');
      }
    );

    // for (let i = 0, len = 3; i < len; i++) {
    //   this.logger.log('elemFooter', elemFooter[i]);
    //   // work with checkboxes[i]
    // }
    // elemFooter.setAttribute('style', 'z-index:-1');
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // ---------------------------------------------------
  // TRUNCATE THE Selected Question DISPLAYED TOOLTIP
  // ---------------------------------------------------
  sliceSelectedQuestion(text: string) {
    if (text) {
      if (text.length >= 55) {
        this.selectQuestionForTooltip = text.slice(0, 55) + '...'
      } else {
        this.selectQuestionForTooltip = text
      }
    }
  }

  // ---------------------------------------------------
  // Subscribe to current project
  // ---------------------------------------------------
  getCurrentProject() {
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {

        if (project) {
          this.project_id = project._id;
        }
      });
  }

  onInitSidebarContentHeight() {
    this.windowActualHeight = window.innerHeight;
    this.logger.log('[WS-TRAIN-BOT] - onInitSidebarContentHeight -windowActualHeight ', this.windowActualHeight);
  }

  closeRightSideBar() {
    this.logger.log('[WS-TRAIN-BOT] - closeRightSideBar this.valueChange ', this.valueChange)
    // this.valueChange.next()
    this.valueChange.emit(false);
    this.isOpenRightSidebar = false;


    [].forEach.call(
      document.querySelectorAll('footer ul li a'),
      function (el) {
        // this.logger.log('footer > ul > li > a element: ', el);
        el.setAttribute('style', 'text-transform: none');
      }
    );

  }

  // ----------------------------------------------------------------
  // @ SEARCH FAQ
  // ----------------------------------------------------------------
  searchFaq() {
    this.showSpinner = true;
    this.has_pressed_search = true;
    const elemBubbleOfSelectedQuestion = <HTMLElement>document.querySelector('.selected-question');
    this.logger.log('[WS-TRAIN-BOT] - searchFaq - elemBubbleOfSelectedQuestion ', elemBubbleOfSelectedQuestion);
    const elemBubbleHeight = elemBubbleOfSelectedQuestion.clientHeight;
    this.logger.log('[WS-TRAIN-BOT] - searchFaq - elemBubbleHeight 2', elemBubbleHeight);

    // this.sidebar_content_height = this.windowActualHeight - elemBubbleHeight + 25 + 'px';
    this.sidebar_content_height = 500 + 'px';
    this.logger.log('[WS-TRAIN-BOT] - sidebar_content_height ', this.sidebar_content_height);

    this.searchbtnRef.nativeElement.blur();
    this.logger.log('[WS-TRAIN-BOT] - searchFaq - faqToSearch ', this.faqToSearch)

    this.faqService.getFaqsByText(this.faqToSearch)
      .subscribe((faqs: any) => {
        this.logger.log('[WS-TRAIN-BOT] - searchFaq - FAQS GOT BY TEXT ', faqs);
        // this.foundFAQs = faqs;

        // ------------------------------------------------
        //  ! FILTER:  GET ONLY THE FAQ OF NOT TRASHED BOT
        // ------------------------------------------------
        this.foundFAQs = faqs.filter((faq: any) => {
          return faq.faq_kb[0].trashed === false
        });

        this.logger.log('[WS-TRAIN-BOT] - searchFaq - FAQS GOT BY TEXT foundFAQs ', this.foundFAQs);
      }, (error) => {
        this.logger.error('[WS-TRAIN-BOT] - searchFaq - FAQS GOT BY TEXT - ERROR', error);
        this.showSpinner = false;
      }, () => {
          this.logger.log('[WS-TRAIN-BOT] - searchFaq - FAQS GOT BY TEXT * COMPLETE *');
          this.showSpinner = false;
        });
    // this.logger.log('[WS-TRAIN-BOT] - searchFaq - faqToSearch ', this.faqToSearch);

  }

  // ----------------------------------------------------------------
  // @ CLEAR FAQ TO SEARCH
  // ----------------------------------------------------------------
  clearFaqToSearch() {
    this.logger.log('[WS-TRAIN-BOT] - calling clearFaqToSearch');
    this.has_pressed_search = false;
    this.faqToSearch = '';
    this.foundFAQs = []
  }


  // ----------------------------------------------------------------
  // @ EDIT FAQ
  // ----------------------------------------------------------------
  editFaq(faq_id: string, question: string, answer: string) {
    this.logger.log('[WS-TRAIN-BOT] - editFaq - FAQ ID TO UPDATE ', faq_id);
    this.logger.log('[WS-TRAIN-BOT] - editFaq - FAQ QUESTION TO UPDATE ', question);
    this.logger.log('[WS-TRAIN-BOT] - editFaq - FAQ ANSWER TO UPDATE ', answer);


    this.faqService.updateTrainBotFaq(faq_id, question + '\n\n' + this.selectedQuestion, answer)
      .subscribe((updatedFAQ) => {
        this.logger.log('[WS-TRAIN-BOT] - editFaq - UPDATED FAQ RES', updatedFAQ);
        this.updatedFAQ = updatedFAQ;

      }, (error) => {
        this.logger.error('[WS-TRAIN-BOT] - editFaq - UPDATE FAQ - ERROR ', error);
        //  NOTIFY ERROR 
        this.notify.showWidgetStyleUpdateNotification(this.faqErrorWhileUpdating, 4, 'report_problem');
      }, () => {
        this.logger.log('[WS-TRAIN-BOT] - editFaq - UPDATE FAQ * COMPLETE *');
        //  NOTIFY SUCCESS
        this.notify.showWidgetStyleUpdateNotification(this.faqSuccessfullyUpdated, 2, 'done');

        this.foundFAQs.forEach(faq => {
          this.logger.log('[WS-TRAIN-BOT] - editFaq - foundFAQs faq', faq);
          if (faq_id === faq._id) {
            faq.question = faq.question + '\n\n' + this.selectedQuestion
          }
        });
      });
  }


  goToBot(idFaqKb: string) {
    this.logger.log('[WS-TRAIN-BOT] goToBot id_bot', idFaqKb);
    this.router.navigate(['project/' + this.project_id + '/bots', idFaqKb, 'native']);
  }


  // TRANSLATION
  translateFaqSuccessfullyUpdated() {
    this.translate.get('FaqUpdatedSuccessfullyMsg')
      .subscribe((text: string) => {

        this.faqSuccessfullyUpdated = text;
        // this.logger.log('+ + + FaqUpdatedSuccessfullyMsg', text)
      });
  }

  translateFaqErrorWhileUpdating() {
    this.translate.get('FaqUpdatedErrorMsg')
      .subscribe((text: string) => {

        this.faqErrorWhileUpdating = text;
        // this.logger.log('+ + + FaqUpdatedErrorMsg', text)
      });
  }

}
