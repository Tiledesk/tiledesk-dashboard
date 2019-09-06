import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { slideInOutAnimation } from '../../_animations/index';
import { MongodbFaqService } from '../../services/mongodb-faq.service';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from '../../core/notify.service';

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
    private faqService: MongodbFaqService,
    private notify: NotifyService,
    private translate: TranslateService
  ) { }

  ngOnInit() {

    console.log('FaqTestTrainBotComponent - selectedQuestion ', this.selectedQuestion)
    console.log('FaqTestTrainBotComponent - remote_faq_kb_key ', this.remote_faq_kb_key)
    console.log('FaqTestTrainBotComponent - idBot ', this.idBot)

    this.searchRemoteFaq();

    this.translateAnswerSuccessfullyAdded();
  }



  translateAnswerSuccessfullyAdded() {

    this.translate.get('AnswerSuccessfullyAdded')
      .subscribe((text: string) => {

        this.answerSuccessfullyAdded = text;
        console.log('FaqTestTrainBotComponent + + + AnswerSuccessfullyAdded', text)
      });
  }

  searchRemoteFaq() {

    // this.faqService.searchRemoteFaqByRemoteFaqKbKey(this.remote_faq_kb_key, this.selectedQuestion)
    this.faqService.searchRemoteFaqByRemoteFaqKbKey(this.idBot, this.selectedQuestion)
      .subscribe((remoteFaq) => {
        console.log('FaqTestTrainBotComponent - REMOTE FAQ FOUND - POST DATA ', remoteFaq);

        if (remoteFaq) {
          this.hits = remoteFaq.hits
        }

      }, (error) => {
        console.log('FaqTestTrainBotComponent - REMOTE FAQ - POST REQUEST ERROR ', error);
        this.showSpinner = false;
      }, () => {
        console.log('FaqTestTrainBotComponent - REMOTE FAQ - POST REQUEST * COMPLETE *');
        this.showSpinner = false;
      });

  }


  /**
   * *** ADD FAQ ***
   */
  create() {
    console.log('MONGO DB CREATE FAQ - QUESTION: ', this.selectedQuestion, ' - ANSWER: ', this.answer, ' - ID FAQ KB ', this.idBot);

    if (this.answer) {
      this.faqService.addMongoDbFaq(this.selectedQuestion, this.answer, this.idBot)
        .subscribe((faq) => {
          console.log('FaqTestComponent - CREATED FAQ ', faq);


        }, (error) => {

          console.log('FaqTestComponent - CREATED FAQ - ERROR ', error);
          // =========== NOTIFY ERROR ===========

          // this.notify.showNotification(this.createFaqErrorNoticationMsg, 4, 'report_problem');
        }, () => {
          console.log('FaqTestComponent - CREATED FAQ * COMPLETE *');
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

      console.log('FaqTestComponent - CREATED FAQ - ANSWER', this.answer);
    }

  }



  closeRightSideBar() {
    console.log('FaqTestTrainBotComponent - closeRightSideBar ')
    this.valueChange.emit(false);



    [].forEach.call(
      document.querySelectorAll('footer ul li a'),
      function (el) {
        console.log('footer > ul > li > a element: ', el);
        el.setAttribute('style', 'text-transform: none');
      }
    );
  }

}
