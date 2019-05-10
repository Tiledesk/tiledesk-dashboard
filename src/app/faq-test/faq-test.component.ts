import { Component, OnInit, ElementRef, ViewChild, HostListener, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Project } from '../models/project-model';
import { ActivatedRoute } from '@angular/router';
import { MongodbFaqService } from '../services/mongodb-faq.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
// USED FOR go back last page
import { Location } from '@angular/common';
import { FaqKbService } from '../services/faq-kb.service';


@Component({
  selector: 'app-faq-test',
  templateUrl: './faq-test.component.html',
  styleUrls: ['./faq-test.component.scss']
})
export class FaqTestComponent implements OnInit, AfterViewInit {

  @ViewChild('runtestbtn') private elementRef: ElementRef;
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

  constructor(
    private router: Router,
    private auth: AuthService,
    private route: ActivatedRoute,
    private faqService: MongodbFaqService,
    private _location: Location,
    private faqKbService: FaqKbService
  ) { }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    this.getSearchedQuestionFromStorage();

    this.getCurrentProject();
    this.getRemoteFaqKbKey();
    this.getCurrentUser();

    console.log('FaqTestComponent - OnInit  questionToTest', this.questionToTest);
    // if (this.questionToTest && this.questionToTest !== null) {
    //   this.showSpinner = true;

    //   // SET A TIMEOUT TO AVOID THAT REMOTE FAQ ARE NOT UPDATED
    //   setTimeout(() => {
    //     this.onInitSearchRemoteFaq(this.questionToTest);
    //   }, 500);
    // }

  }



  getCurrentUser() {
    this.auth.user_bs.subscribe((user) => {
      console.log('FaqTestComponent - LoggedUser ', user);

      if (user && user.firstname) {
        this.currentUserFirstname = user.firstname;
      }
    });
  }

  ngAfterViewInit() {
    console.log('FaqTestComponent - ngAfterViewInit ');
    const elemSendCardContent = <HTMLElement>document.querySelector('.ref-for-speech-wrapper');
    console.log('FaqTestComponent - elemSendCardContent ', elemSendCardContent);
    this.elemSendCardContentWidth = elemSendCardContent.clientWidth;
    console.log('FaqTestComponent - elemSendCardContent Width', this.elemSendCardContentWidth);

  }


  // @HostListener('window:resize', ['$event'])
  // onResize(event: any) {
  //   const newInnerWidth = event.target.innerWidth;
  //   console.log('FaqTestComponent newInnerWidth ', newInnerWidth)

  //   // const elemSpeechWrapper = <HTMLElement>document.querySelector('.speech-wrapper');

  //   const elemSendCardContent = <HTMLElement>document.querySelector('.ref-for-speech-wrapper');
  //   //  console.log('FaqTestComponent - elemSpeechWrapper onResize ', elemSpeechWrapper);
  //   if (elemSendCardContent) {

  //     // elemSendCardContentWidth è la card sopra alla card che contiene le bubble.
  //     // Uso questa x calcolare il margine delle bulle sx perchè la sua ampiezza e da subito calcolabile e non bisogna aspettare
  //     // che venga effettuata una ricerca
  //     this.elemSendCardContentWidth = elemSendCardContent.clientWidth;
  //     console.log('FaqTestComponent - elemSendCardContentWidth onResize', this.elemSendCardContentWidth);

  //     if (newInnerWidth > 410) {
  //       // this.bubbleAltMarginLeft = elemSpeechWrapperWidth - 260 + 'px';
  //       this.bubbleAltMarginLeft = this.elemSendCardContentWidth - 406 + 'px';
  //       console.log('FaqTestComponent - bubbleAltMarginLeft onResize', this.elemSendCardContentWidth);
  //     } else {

  //       this.bubbleAltMarginLeft = 0 + 'px'
  //     }
  //   }
  // }

  /**
   * WHEN THE USER RUN A TEST, THE QUESTION FOR THAT SEARCH IS SAVED IN THE STORAGE
   * IF THE USER, IN THE FAQ TEST PAGE, CLICK ON A FAQ TO EDIT IT AND THEN RETURN IN THE FAQ TEST PAGE, IN THE FAQ-TEST PAGE
   * (THIS COMPONENT) IS RUNNED THE onInitSearchRemoteFaq THAT SEARCH FOR THE REMOTE FAQ
   * USING THE QUESTION SAVED IN THE STORAGE (IN THIS WAY THE USER DISPLAY THE PREVIOUS RESULT OF RESEARCH)
   * WHEN THE USER GO TO THE PAGE 'EDIT BOT' (faq.comp) THE STORED SEARCHED QUESTION IS CLEARED  */
  getSearchedQuestionFromStorage() {
    const storedQuestionToTest = localStorage.getItem('searchedQuestion');
    console.log('FaqTestComponent SEARCHED QUESTION - FROM LOcAL STORAGE 1', storedQuestionToTest)
    if (storedQuestionToTest !== 'null') {
      // this.questionToTest = storedQuestionToTest;
      console.log('FaqTestComponent SEARCHED QUESTION - FROM LOcAL STORAGE 2', this.questionToTest)
    }
  }

  getRemoteFaqKbKey() {
    this.remote_faq_kb_key = this.route.snapshot.params['remoteFaqKbKey'];
    console.log('FaqTestComponent - FAQ-KB COMP HAS PASSED remote_faq_kb_key', this.remote_faq_kb_key);

    this.idBot = this.route.snapshot.params['faqkbid'];
    console.log('FaqTestComponent - FAQ-KB COMP HAS PASSED idBot', this.idBot);

    if (this.idBot) {
      this.getFaqKbById();
    }
  }

  getFaqKbById() {
    this.faqKbService.getMongDbFaqKbById(this.idBot).subscribe((faqKb: any) => {
      console.log('FaqTestComponent - FAQ-KB GET BY ID', faqKb);
      this.botName = faqKb.name;
      console.log('FaqTestComponent - FAQ-KB NAME', this.botName);
    });
  }


  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      // console.log('00 -> FAQ-KB EDIT ADD COMP project ID from AUTH service subscription  ', this.project._id)
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

  // onInitSearchRemoteFaq(questionToTest) {
  //   console.log('ON INIT QUESTION TO TEST ', questionToTest)
  //   this.faqService.searchRemoteFaqByRemoteFaqKbKey(this.remote_faq_kb_key, questionToTest)
  //     .subscribe((remoteFaq) => {
  //       console.log('REMOTE FAQ FOUND - POST DATA ', remoteFaq);

  //       if (remoteFaq) {
  //         this.hits = remoteFaq.hits;
  //         console.log('FaqTestComponent *** hits *** ', this.hits);
  //         this.faq_number_of_found = remoteFaq.total;
  //         console.log('REMOTE FAQ LENGHT ', this.faq_number_of_found);

  //       }

  //     }, (error) => {
  //       console.log('REMOTE FAQ - POST REQUEST ERROR ', error);

  //       this.showSpinner = false;
  //     }, () => {
  //       console.log('REMOTE FAQ - POST REQUEST * COMPLETE *');

  //       this.showSpinner = false;

  //       setTimeout(() => {
  //         this.getSpeechWrapperWidth()
  //       }, 500);
  //     });
  // }

  searchRemoteFaq() {

    const today = new Date();
    const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    console.log('FaqTestComponent  time: ', time);
    // this.bubbleAltMarginLeft = this.elemSendCardContentWidth - 406 + 'px'
    // console.log('FaqTestComponent  searchRemoteFaq bubbleAltMarginLeft : ', this.bubbleAltMarginLeft);

    // BUG FIX 'RUN TEST button remains focused after clicking'
    // this.elementRef.nativeElement.blur();
    console.log('FaqTestComponent  questionToTest: ', this.questionToTest);

    if (this.questionToTest) {

      localStorage.setItem('searchedQuestion', this.questionToTest);

      this.faqService.searchRemoteFaqByRemoteFaqKbKey(this.remote_faq_kb_key, this.questionToTest)
        .subscribe((remoteFaq) => {
          console.log('REMOTE FAQ FOUND - POST DATA ', remoteFaq);

          if (remoteFaq) {
            this.hits = remoteFaq.hits
            console.log('FaqTestComponent *** hits *** ', this.hits);
            let answer = '';

            if (this.hits.length > 0) {
              answer = this.hits[0].document.answer;
            } else {

              answer = 'NoGoodMatchFound';
            }
            this.questionsAndAnswersArray.push({ 'q': this.questionToTest, 'a': answer, 'time': time });
            
            const questionsAndAnswersArrayClone = JSON.parse(JSON.stringify(this.questionsAndAnswersArray));


            this.reverseQuestionsAndAnswersArray = questionsAndAnswersArrayClone.reverse();
            // this.questionsAndAnswersArray.push({'q': this.hits[0].document.question, 'a': this.hits[0].document.answer })

            console.log('FaqTestComponent *** Questions & Answers Array *** ', this.questionsAndAnswersArray);
            console.log('FaqTestComponent *** Reverse Questions & Answers Array *** ', this.reverseQuestionsAndAnswersArray);

            this.faq_number_of_found = remoteFaq.total;
            console.log('REMOTE FAQ LENGHT ', this.faq_number_of_found);

          }

        }, (error) => {
          console.log('REMOTE FAQ - POST REQUEST ERROR ', error);
        }, () => {
          console.log('REMOTE FAQ - POST REQUEST * COMPLETE *');
        });

    } else {
      console.log('FaqTestComponent **** ***** NO QUESTION ENTERED');

    }
  }

  startOver() {
    this.questionsAndAnswersArray = [];
    this.reverseQuestionsAndAnswersArray = [];
    this.questionToTest = '';
  }


  goToEditFaqPage(id_faq: string) {
    console.log('ID OF FAQ Pressed', id_faq);

    // this.getFaqById(id_faq);
    // this.router.navigate(['project/' + this.project._id + '/editfaq', this.id_faq_kb, faq_id]);
  }

  getFaqKbIdAndGoToEditFaqPage(id_faq) {
    this.faqService.getMongDbFaqById(id_faq).subscribe((faq: any) => {
      console.log('FAQ GET BY ID', faq);

      if (faq) {
        this.router.navigate(['project/' + this.project._id + '/editfaq', faq.id_faq_kb, id_faq]);
      }

    }, (error) => {
      console.log('FAQ GET BY ID - ERROR ', error);

    }, () => {
      console.log('FAQ GET BY ID - COMPLETE ');

    });
  }

  onChangeHideScore($event) {

    this.hideScore = $event.target.checked;
    console.log('ON CHANGE - HIDE SCORE', this.hideScore);
  }

  openRightSideBar(question: string) {

    this.OPEN_RIGHT_SIDEBAR = true;

    this.selectedQuestion = question

    console.log('FaqTestComponent »»»» OPEN RIGHT SIDEBAR selectetQuestion', this.selectedQuestion);

    console.log('FaqTestComponent »»»» OPEN RIGHT SIDEBAR ', this.OPEN_RIGHT_SIDEBAR);
    const elemMainContent = <HTMLElement>document.querySelector('.main-content');
    this.train_bot_sidebar_height = elemMainContent.clientHeight + 10 + 'px'
    console.log('FaqTestComponent - ON OPEN RIGHT SIDEBAR -> RIGHT SIDEBAR HEIGHT', this.train_bot_sidebar_height);

  }

  closeRightSidebar(event) {
    console.log('»»»» CLOSE RIGHT SIDEBAR ', event);
    this.OPEN_RIGHT_SIDEBAR = event;

    // const _elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    // _elemMainPanel.setAttribute('style', 'overflow-x: hidden !important;');
  }

}
