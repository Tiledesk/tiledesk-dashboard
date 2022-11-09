import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { slideInOutAnimation } from '../../../_animations/index';
import { FaqService } from '../../../services/faq.service';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from '../../../core/notify.service';
import { LoggerService } from '../../../services/logger/logger.service';
@Component({
  selector: 'appdashboard-faq-test-train-bot',
  templateUrl: './faq-test-train-bot.component.html',
  styleUrls: ['./faq-test-train-bot.component.scss'],
  animations: [slideInOutAnimation],
  // tslint:disable-next-line:use-host-property-decorator
  host: { '[@slideInOutAnimation]': '' }
})
export class FaqTestTrainBotComponent implements OnInit {

  @Output() valueChange = new EventEmitter();
  @Input() selectedQuestion: string;
  @Input() remote_faq_kb_key: string;
  @Input() idBot: string;

  hits: any;
  showSpinner = true;
  answer: string;
  answerSuccessfullyAdded: string;
  constructor(
    private faqService: FaqService,
    private notify: NotifyService,
    private translate: TranslateService,
    private logger: LoggerService
  ) { }

  ngOnInit() {

    this.logger.log('[FAQ-TEST-TRAIN-BOT] - selectedQuestion ', this.selectedQuestion)
    // this.logger.log('FaqTestTrainBotComponent - remote_faq_kb_key ', this.remote_faq_kb_key)
    this.logger.log('[FAQ-TEST-TRAIN-BOT] - idBot ', this.idBot)
    this.searchRemoteFaq();
    this.translateAnswerSuccessfullyAdded();
  }


  translateAnswerSuccessfullyAdded() {
    this.translate.get('AnswerSuccessfullyAdded')
      .subscribe((text: string) => {

        this.answerSuccessfullyAdded = text;
        // this.logger.log('[FAQ-TEST-TRAIN-BOT] + + + AnswerSuccessfullyAdded', text)
      });
  }

  searchRemoteFaq() {
    // this.faqService.searchRemoteFaqByRemoteFaqKbKey(this.remote_faq_kb_key, this.selectedQuestion)
    this.faqService.searchFaqByFaqKbId(this.idBot, this.selectedQuestion)
      .subscribe((remoteFaq) => {
        this.logger.log('[FAQ-TEST-TRAIN-BOT] - REMOTE FAQ FOUND - POST DATA ', remoteFaq);
        if (remoteFaq) {
          this.hits = remoteFaq['hits']
        }
      }, (error) => {
        this.logger.error('[FAQ-TEST-TRAIN-BOT] - REMOTE FAQ - POST REQUEST ERROR ', error);
        this.showSpinner = false;
      }, () => {
        this.logger.log('[FAQ-TEST-TRAIN-BOT] - REMOTE FAQ - POST REQUEST * COMPLETE *');
        this.showSpinner = false;
      });

  }

  /**
   * *** ADD FAQ ***
   */
  create() {
    this.logger.log('[FAQ-TEST-TRAIN-BOT] CREATE FAQ - QUESTION: ', this.selectedQuestion, ' - ANSWER: ', this.answer, ' - ID FAQ KB ', this.idBot);

    if (this.answer) {
      this.faqService.createTrainBotAnswer(this.selectedQuestion, this.answer, this.idBot)
        .subscribe((faq) => {
          this.logger.log('[FAQ-TEST-TRAIN-BOT] - CREATED FAQ ', faq);


        }, (error) => {

          this.logger.error('[FAQ-TEST-TRAIN-BOT] - CREATED FAQ - ERROR ', error);
          // =========== NOTIFY ERROR ===========

          // this.notify.showNotification(this.createFaqErrorNoticationMsg, 4, 'report_problem');
        }, () => {
          this.logger.log('[FAQ-TEST-TRAIN-BOT] - CREATED FAQ * COMPLETE *');
          // =========== NOTIFY SUCCESS===========
          this.answer = '';
          this.notify.showNotification(this.answerSuccessfullyAdded, 2, 'done');

          //  SET A TIMEOUT TO AVOID THAT REMOTE FAQ ARE NOT UPDATED
          this.showSpinner = true;
          setTimeout(() => {
            this.searchRemoteFaq();
          }, 500);

        });
    } else {

      this.logger.log('[FAQ-TEST-TRAIN-BOT] - CREATED FAQ - ANSWER', this.answer);
    }

  }



  closeRightSideBar() {
    this.logger.log('[FAQ-TEST-TRAIN-BOT] - closeRightSideBar ')
    this.valueChange.emit(false);



    [].forEach.call(
      document.querySelectorAll('footer ul li a'),
      function (el) {
        el.setAttribute('style', 'text-transform: none');
      }
    );
  }

}
