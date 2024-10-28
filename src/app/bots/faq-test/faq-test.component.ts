import { Component, OnInit, ElementRef, ViewChild, HostListener, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { Project } from '../../models/project-model';
import { ActivatedRoute } from '@angular/router';
import { FaqService } from '../../services/faq.service';

// USED FOR go back last page
import { Location } from '@angular/common';
import { FaqKbService } from '../../services/faq-kb.service';
// import * as moment from 'moment';
import moment from "moment";
import { LoggerService } from '../../services/logger/logger.service';

@Component({
  selector: 'app-faq-test',
  templateUrl: './faq-test.component.html',
  styleUrls: ['./faq-test.component.scss']
})
export class FaqTestComponent implements OnInit, AfterViewInit {

  @ViewChild('runtestbtn', { static: false }) elementRef: ElementRef;
  project: Project;
  questionToTest: string;
  remote_faq_kb_key: string;
  hits: any;
  faq_number_of_found: number;
  showSpinner = false;
  hideScore = false;
  bubbleAltMarginLeft: any;
  elemSendCardContentWidth: any;

  questionsAndAnswersArray = [];
  reverseQuestionsAndAnswersArray = [];
  OPEN_RIGHT_SIDEBAR = false;
  train_bot_sidebar_height: any;
  selectedQuestion: string;
  idBot: string;
  currentUserFirstname: string;
  botName: string;
  isChromeVerGreaterThan100: boolean;
  constructor(
    private router: Router,
    private auth: AuthService,
    private route: ActivatedRoute,
    private faqService: FaqService,
    private _location: Location,
    private faqKbService: FaqKbService,
    private logger: LoggerService
  ) { }

  ngOnInit() {
    this.getSearchedQuestionFromStorage();

    this.getCurrentProject();
    this.getRemoteFaqKbKey();
    this.getCurrentUser();

    this.logger.log('[FAQ-TEST-COMP] - OnInit  questionToTest', this.questionToTest);
    // if (this.questionToTest && this.questionToTest !== null) {
    //   this.showSpinner = true;

    //   // SET A TIMEOUT TO AVOID THAT REMOTE FAQ ARE NOT UPDATED
    //   setTimeout(() => {
    //     this.onInitSearchRemoteFaq(this.questionToTest);
    //   }, 500);
    // }
    this.getBrowserVersion()
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  console.log("[BOT-CREATE] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }



  getCurrentUser() {
    this.auth.user_bs.subscribe((user) => {
      this.logger.log('[FAQ-TEST-COMP] - LoggedUser ', user);

      if (user && user.firstname) {
        this.currentUserFirstname = user.firstname;
      }
    });
  }

  ngAfterViewInit() {
    this.logger.log('[FAQ-TEST-COMP] - ngAfterViewInit ');
    const elemSendCardContent = <HTMLElement>document.querySelector('.ref-for-speech-wrapper');
    this.logger.log('[FAQ-TEST-COMP] - elemSendCardContent ', elemSendCardContent);
    this.elemSendCardContentWidth = elemSendCardContent.clientWidth;
    this.logger.log('[FAQ-TEST-COMP] - elemSendCardContent Width', this.elemSendCardContentWidth);

  }

  /**
   * WHEN THE USER RUN A TEST, THE QUESTION FOR THAT SEARCH IS SAVED IN THE STORAGE
   * IF THE USER, IN THE FAQ TEST PAGE, CLICK ON A FAQ TO EDIT IT AND THEN RETURN IN THE FAQ TEST PAGE, IN THE FAQ-TEST PAGE
   * (THIS COMPONENT) IS RUNNED THE onInitSearchRemoteFaq THAT SEARCH FOR THE REMOTE FAQ
   * USING THE QUESTION SAVED IN THE STORAGE (IN THIS WAY THE USER DISPLAY THE PREVIOUS RESULT OF RESEARCH)
   * WHEN THE USER GO TO THE PAGE 'EDIT BOT' (faq.comp) THE STORED SEARCHED QUESTION IS CLEARED  */
  getSearchedQuestionFromStorage() {
    const storedQuestionToTest = localStorage.getItem('searchedQuestion');
    this.logger.log('[FAQ-TEST-COMP] SEARCHED QUESTION - FROM LOcAL STORAGE 1', storedQuestionToTest)
    if (storedQuestionToTest !== 'null') {
      // this.questionToTest = storedQuestionToTest;
      this.logger.log('[FAQ-TEST-COMP] SEARCHED QUESTION - FROM LOcAL STORAGE 2', this.questionToTest)
    }
  }

  getRemoteFaqKbKey() {
    this.remote_faq_kb_key = this.route.snapshot.params['remoteFaqKbKey'];
    this.logger.log('[FAQ-TEST-COMP] - FAQ-KB COMP HAS PASSED remote_faq_kb_key', this.remote_faq_kb_key);

    this.idBot = this.route.snapshot.params['faqkbid'];
    this.logger.log('[FAQ-TEST-COMP] - FAQ-KB COMP HAS PASSED idBot', this.idBot);

    if (this.idBot) {
      this.getFaqKbById();
    }
  }

  getFaqKbById() {
    this.faqKbService.getFaqKbById(this.idBot).subscribe((faqKb: any) => {
      this.logger.log('[FAQ-TEST-COMP] - FAQ-KB GET BY ID', faqKb);
      this.botName = faqKb.name;
      this.logger.log('[FAQ-TEST-COMP] - FAQ-KB NAME', this.botName);
    });
  }


  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      // this.logger.log('[FAQ-TEST-COMP] project ID from AUTH service subscription  ', this.project._id)
    });
  }

  // NO MORE USED (SUBSTITUTED BY goBack()) BECAUSE THE FAQ TEST PAGE CAN BE CALLED FROM THE FAQ-KB LIST PAGE (faq-kb.component.ts)
  // AND FROM THE FAQ PAGE (faq.component.ts)
  goBackToFaqKbList() {
    this.router.navigate(['project/' + this.project._id + '/faqkb']);
  }

  goBack() {
    this._location.back();
  }

  searchRemoteFaq() {
    // const today = new Date();
    // const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    // this.logger.log('[FAQ-TEST-COMP]  time: ', time);

    const momentTime = moment().toDate()
    this.logger.log('[FAQ-TEST-COMP] moment  time: ', momentTime);
    const mTime = moment(momentTime).format('HH:mm:ss');

    this.logger.log('[FAQ-TEST-COMP]  mTime: ', mTime);
    // this.bubbleAltMarginLeft = this.elemSendCardContentWidth - 406 + 'px'
    // this.logger.log('[FAQ-TEST-COMP]  searchRemoteFaq bubbleAltMarginLeft : ', this.bubbleAltMarginLeft);

    // BUG FIX 'RUN TEST button remains focused after clicking'
    // this.elementRef.nativeElement.blur();
    this.logger.log('[FAQ-TEST-COMP]  questionToTest: ', this.questionToTest);

    if (this.questionToTest) {

      localStorage.setItem('searchedQuestion', this.questionToTest);

      // this.faqService.searchRemoteFaqByRemoteFaqKbKey(this.remote_faq_kb_key, this.questionToTest)
      this.faqService.searchFaqByFaqKbId(this.idBot, this.questionToTest)
        .subscribe((remoteFaq) => {
          this.logger.log('[FAQ-TEST-COMP] REMOTE FAQ FOUND - POST DATA ', remoteFaq);

          if (remoteFaq) {
            this.hits = remoteFaq['hits']
            this.logger.log('[FAQ-TEST-COMP] *** hits *** ', this.hits);
            let answer = '';

            if (this.hits && this.hits.length > 0) {
              // answer = this.hits[0].document.answer;
              answer = this.hits[0].answer;
            } else {

              answer = 'NoGoodMatchFound';
            }

            this.questionsAndAnswersArray.push({ 'q': this.questionToTest, 'a': answer, 'time': mTime });
            const questionsAndAnswersArrayClone = JSON.parse(JSON.stringify(this.questionsAndAnswersArray));

            this.reverseQuestionsAndAnswersArray = questionsAndAnswersArrayClone.reverse();
            // this.questionsAndAnswersArray.push({'q': this.hits[0].document.question, 'a': this.hits[0].document.answer })

            this.logger.log('[FAQ-TEST-COMP] *** Questions & Answers Array *** ', this.questionsAndAnswersArray);
            this.logger.log('[FAQ-TEST-COMP] *** Reverse Questions & Answers Array *** ', this.reverseQuestionsAndAnswersArray);

            this.faq_number_of_found = remoteFaq['total'];
            this.logger.log('[FAQ-TEST-COMP] REMOTE FAQ LENGHT ', this.faq_number_of_found);

          }

        }, (error) => {
          this.logger.error('[FAQ-TEST-COMP] REMOTE FAQ - POST REQUEST ERROR ', error);
        }, () => {
          this.logger.log('[FAQ-TEST-COMP] REMOTE FAQ - POST REQUEST * COMPLETE *');
        });

    } else {
      this.logger.log('[FAQ-TEST-COMP] **** ***** NO QUESTION ENTERED');

    }
  }

  startOver() {
    this.questionsAndAnswersArray = [];
    this.reverseQuestionsAndAnswersArray = [];
    this.questionToTest = '';
  }


  goToEditFaqPage(id_faq: string) {
    this.logger.log('[FAQ-TEST-COMP] ID OF FAQ Pressed', id_faq);
  }

  getFaqKbIdAndGoToEditFaqPage(id_faq) {
    this.faqService.getFaqById(id_faq).subscribe((faq: any) => {
      this.logger.log('[FAQ-TEST-COMP] FAQ GET BY ID', faq);

      if (faq) {
        this.router.navigate(['project/' + this.project._id + '/editfaq', faq.id_faq_kb, id_faq]);
      }

    }, (error) => {
      this.logger.error('[FAQ-TEST-COMP] FAQ GET BY ID - ERROR ', error);

    }, () => {
      this.logger.log('[FAQ-TEST-COMP] FAQ GET BY ID - COMPLETE ');

    });
  }

  onChangeHideScore($event) {
    this.hideScore = $event.target.checked;
    this.logger.log('[FAQ-TEST-COMP] ON CHANGE - HIDE SCORE', this.hideScore);
  }

  openRightSideBar(question: string) {

    this.OPEN_RIGHT_SIDEBAR = true;

    this.selectedQuestion = question

    this.logger.log('[FAQ-TEST-COMP] »»»» OPEN RIGHT SIDEBAR selectetQuestion', this.selectedQuestion);

    this.logger.log('[FAQ-TEST-COMP] »»»» OPEN RIGHT SIDEBAR ', this.OPEN_RIGHT_SIDEBAR);
    const elemMainContent = <HTMLElement>document.querySelector('.main-content');
    this.train_bot_sidebar_height = elemMainContent.clientHeight + 10 + 'px'
    this.logger.log('[FAQ-TEST-COMP] - ON OPEN RIGHT SIDEBAR -> RIGHT SIDEBAR HEIGHT', this.train_bot_sidebar_height);

  }

  closeRightSidebar(event) {
    this.logger.log('[FAQ-TEST-COMP] »»»» CLOSE RIGHT SIDEBAR ', event);
    this.OPEN_RIGHT_SIDEBAR = event;
  }

}
