import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MongodbFaqService } from '../../services/mongodb-faq.service';
import { Project } from '../../models/project-model';
import { AuthService } from '../../core/auth.service';
import { NotifyService } from '../../core/notify.service';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
const swal = require('sweetalert');
@Component({
  selector: 'faq-edit-add',
  templateUrl: './faq-edit-add.component.html',
  styleUrls: ['./faq-edit-add.component.scss'],
})
export class FaqEditAddComponent implements OnInit {

  question: string;
  answer: string;

  id_toUpdate: any;

  question_toUpdate: string;
  answer_toUpdate: string;

  CREATE_VIEW = false;
  EDIT_VIEW = false;

  showSpinner = true;

  id_faq_kb: string;
  id_faq: string;
  faq_creationDate: any;
  project: Project;

  createFaqSuccessNoticationMsg: string;
  createFaqErrorNoticationMsg: string;

  editFaqSuccessNoticationMsg: string;
  editFaqErrorNoticationMsg: string;
  botType: string;
  intent_name: string;
  faq_webhook_is_enabled: boolean;
  error_status: number;
  intentNameAlreadyExistsMsg: string;
  warningMsg: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private mongodbFaqService: MongodbFaqService,
    private auth: AuthService,
    private notify: NotifyService,
    public location: Location,
    private translate: TranslateService
  ) { }

  ngOnInit() {

    this.getTranslations()
    

    this.auth.checkRoleForCurrentProject();

    // BASED ON THE URL PATH DETERMINE IF THE USER HAS SELECTED (IN FAQ PAGE) 'CREATE' OR 'EDIT'
    // if (this.router.url === '/createfaq') {
    this.getUrlParams();

    if (this.router.url.indexOf('/createfaq') !== -1) {
      console.log('HAS CLICKED CREATE ');
      this.CREATE_VIEW = true;
      this.showSpinner = false;
      // GET THE ID OF FAQ-KB PASSED BY FAQ PAGE (AND THAT FAQ PAGE HAS RECEIVED FROM FAQ-KB)
      this.getFaqKbId();
    } else {
      console.log('HAS CLICKED EDIT ');
      this.EDIT_VIEW = true;
      // GET THE ID OF FAQ PASSED BY FAQ PAGE &
      // GET THE ID OF FAQ-KB PASSED BY FAQ PAGE (AND THAT FAQ PAGE HAS RECEIVED FROM FAQ-KB)


      // IF EXIST THE FAQ ID (GET WITH getFaqKbIdAndFaqId RUN A CALLBACK TO OBTAIN THE FAQ OBJECT BY THE FAQ ID)
      if (this.id_faq) {
        this.getFaqById();
      }
    }
    this.getCurrentProject();
  }


  // GET FROM ROUTE PARAMS (PASSED FROM FAQ COMPONENT):
  // THE FAQ ID - WHEN THE CALLBACK IS COMPLETED RUN GET-FAQ-BY-ID THAT RETURN THE OBJECT FAQ
  // AND THE FAQ KB ID (THEN USED IN THE GOBACK)
  getUrlParams() {
    this.route.params.subscribe((params) => {
      this.id_faq_kb = params.faqkbid;
      this.id_faq = params.faqid;
      this.botType = params.bottype
      console.log('getUrlParams (FaqEditAddComponent) PARAMS', params);
      console.log('getUrlParams (FaqEditAddComponent) BOT ID ', this.id_faq_kb);
      console.log('getUrlParams (FaqEditAddComponent) FAQ ID ', this.id_faq);
    });
  }

  getFaqKbId() {
    this.id_faq_kb = this.route.snapshot.params['faqkbid'];
    console.log('FAQ HAS PASSED id_faq_kb ', this.id_faq_kb);
  }

  getTranslations() {
    this.translateCreateFaqSuccessMsg();
    this.translateCreateFaqErrorMsg();
    this.translateUpdateFaqSuccessMsg();
    this.translateUpdateFaqErrorMsg();
    this.translateWarningMsg()
  }

  // TRANSLATION
  translateCreateFaqSuccessMsg() {
    this.translate.get('CreateFaqSuccessNoticationMsg')
      .subscribe((text: string) => {

        this.createFaqSuccessNoticationMsg = text;
        console.log('+ + + CreateFaqSuccessNoticationMsg', text)
      });
  }

  // TRANSLATION
  translateCreateFaqErrorMsg() {
    this.translate.get('CreateFaqErrorNoticationMsg')
      .subscribe((text: string) => {

        this.createFaqErrorNoticationMsg = text;
        console.log('+ + + DeleteLeadSuccessNoticationMsg', text)
      });
  }

  // TRANSLATION
  translateUpdateFaqSuccessMsg() {
    this.translate.get('UpdateFaqSuccessNoticationMsg')
      .subscribe((text: string) => {

        this.editFaqSuccessNoticationMsg = text;
        console.log('+ + + UpdateFaqSuccessNoticationMsg', text)
      });
  }

  // TRANSLATION
  translateUpdateFaqErrorMsg() {
    this.translate.get('UpdateFaqErrorNoticationMsg')
      .subscribe((text: string) => {

        this.editFaqErrorNoticationMsg = text;
        console.log('+ + + UpdateFaqErrorNoticationMsg', text)
      });
  }

  // TRANSLATION
  translateWarningMsg() {
    this.translate.get('Warning')
    .subscribe((text: string) => {

      this.warningMsg = text;
      console.log('+ + + warningMsg', text)
    });
  }
 


  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      // console.log('00 -> FAQ EDIT/ADD COMP project ID from AUTH service subscription  ', this.project._id)
    });
  }



  /**
   * GET FAQ BY ID (GET THE DATA OF THE FAQ BY THE ID PASSED FROM FAQ LIST)
   * USED TO SHOW IN THE TEXAREA THE QUESTION AND THE ANSWER THAT USER WANT UPDATE
   */
  getFaqById() {
    this.mongodbFaqService.getMongDbFaqById(this.id_faq).subscribe((faq: any) => {
      console.log('FaqEditAddComponent - FAQ GET BY ID RES', faq);
      if (faq) {
        this.question_toUpdate = faq.question;
        this.answer_toUpdate = faq.answer;
        this.faq_creationDate = faq.createdAt;
        this.intent_name = faq.intent_display_name;
        this.faq_webhook_is_enabled = faq.webhook_enabled;
        console.log('FAQ QUESTION TO UPDATE', this.question_toUpdate);
        console.log('FAQ ANSWER TO UPDATE', this.answer_toUpdate);
      }

    }, (error) => {
      console.log('FaqEditAddComponent - FAQ GET BY ID - ERROR ', error);
      this.showSpinner = false;
    }, () => {
      console.log('FaqEditAddComponent - FAQ GET BY ID - COMPLETE ');
      this.showSpinner = false;
    });
  }

  // // GO BACK TO FAQ COMPONENT
  // goBackToFaqList() {
  //   // this.router.navigate(['project/' + this.project._id  + '/faq', this.id_faq_kb]);
  //   this.router.navigate(['project/' + this.project._id + '/bots', this.id_faq_kb]);
  // }

  goBack() {
    this.location.back();
  }

  toggleFaqWebhook($event) {
    console.log('FaqEditAddComponent toggleFaqWebhook ', $event.target.checked);
    this.faq_webhook_is_enabled = $event.target.checked
  }

  /**
   * *** ADD FAQ ***
   */
  create() {
    const create_answer_btn = <HTMLElement>document.querySelector('.create-answer-btn');
    create_answer_btn.blur();

    console.log('FaqEditAddComponent CREATE FAQ - QUESTION: ', this.question, ' - ANSWER: ', this.answer, ' - ID FAQ KB ', this.id_faq_kb, ' - INTENT NAME ', this.intent_name, ' - FAQ WEBHOOK ENABLED ', this.faq_webhook_is_enabled);
    this.mongodbFaqService.addMongoDbFaq(this.question, this.answer, this.id_faq_kb, this.intent_name, this.faq_webhook_is_enabled)
      .subscribe((faq) => {
        console.log('FaqEditAddComponent CREATED FAQ RES ', faq);

        // this.question = '';
        // this.answer = '';
        // RE-RUN GET FAQ TO UPDATE THE TABLE
        // this.getDepartments();
        // this.ngOnInit();
      }, (error) => {

        console.log('FaqEditAddComponent CREATED FAQ - ERROR ', error);

        if (error && error['status']) {
          
          this.error_status = error['status']
          console.log('FaqEditAddComponent UPDATE FAQ - ERROR - ERROR-STATUS', this.error_status);
         
          if (this.error_status === 409) {
            console.log('FaqEditAddComponent UPDATE FAQ - ERROR - ERROR-STATUS - TRANSLATE & PRESENT MODAL');
            this.translateAndPresentModalIntentNameAlreadyExist(this.intent_name);
          }
        }
        // =========== NOTIFY ERROR ===========
        // this.notify.showNotification('An error occurred while creating the FAQ', 4, 'report_problem');
        this.notify.showWidgetStyleUpdateNotification(this.createFaqErrorNoticationMsg, 4, 'report_problem');
      }, () => {
        console.log('FaqEditAddComponent CREATED FAQ * COMPLETE *');
        // =========== NOTIFY SUCCESS===========
        // this.notify.showNotification('FAQ successfully created', 2, 'done');
        this.notify.showWidgetStyleUpdateNotification(this.createFaqSuccessNoticationMsg, 2, 'done');

        // this.router.navigate(['project/' + this.project._id  + '/faq', this.id_faq_kb]);
        this.router.navigate(['project/' + this.project._id + '/bots', this.id_faq_kb, this.botType]);
      });

  }

  /**
   * *** EDIT FAQ ***
   */
  edit() {
    const updated_answer_btn = <HTMLElement>document.querySelector('.update-answer-btn');
    updated_answer_btn.blur();

    console.log('FaqEditAddComponent FAQ QUESTION TO UPDATE ', this.question_toUpdate);
    console.log('FaqEditAddComponent FAQ ANSWER TO UPDATE ', this.answer_toUpdate);

    this.mongodbFaqService.updateMongoDbFaq(this.id_faq, this.question_toUpdate, this.answer_toUpdate, this.intent_name, this.faq_webhook_is_enabled)
      .subscribe((data) => {
        console.log('FaqEditAddComponent UPDATE FAQ RES', data);

        // RE-RUN TO UPDATE THE TABLE
        // this.ngOnInit();
      }, (error) => {
        console.log('FaqEditAddComponent UPDATE FAQ - ERROR ', error);
        // =========== NOTIFY ERROR ===========
        // this.notify.showNotification('An error occurred while updating the FAQ', 4, 'report_problem');
        this.notify.showWidgetStyleUpdateNotification(this.editFaqErrorNoticationMsg, 4, 'report_problem');

     
        if (error && error['status']) {
          
          this.error_status = error['status']
          console.log('FaqEditAddComponent UPDATE FAQ - ERROR - ERROR-STATUS', this.error_status);
         
          if (this.error_status === 409) {
            console.log('FaqEditAddComponent UPDATE FAQ - ERROR - ERROR-STATUS - TRANSLATE & PRESENT MODAL');
            this.translateAndPresentModalIntentNameAlreadyExist(this.intent_name);
          }
        }

      }, () => {
        console.log('FaqEditAddComponent UPDATE FAQ * COMPLETE *');
        // =========== NOTIFY SUCCESS===========
        // this.notify.showNotification('FAQ successfully updated', 2, 'done');
        this.notify.showWidgetStyleUpdateNotification(this.editFaqSuccessNoticationMsg, 2, 'done');

        // this.router.navigate(['project/' + this.project._id  + '/faq', this.id_faq_kb]);

        /**
         * THE FAQ-TEST PAGE (THAT CAN BE ONE OF THE PAGES FROM WICH EDIT-FAQ IS CALLED)
         * DISPLAY THE REMOTE FAQ AFTER A SEARCH BY THE QUESTION TYPED BY THE USER.
         * TO AVOID THAT THE REMOTE FAQ DISPLAYED ARE NOT UPDATED COMMENT THE AUTOMATIC 'NAVIGATE'
         * AFTER THE USER CLICK ON THE 'UPDATE BUTTON'
         */
        // this.router.navigate(['project/' + this.project._id + '/bots', this.id_faq_kb]);
        // this.location.back();
      });
  }


  translateAndPresentModalIntentNameAlreadyExist(intent_name) {
    let parameter = { intent_name: intent_name };
    this.translate.get('AnswerWithTheIntentNameAlreadyExists', parameter)
      .subscribe((text: string) => {

        this.intentNameAlreadyExistsMsg = text;
        console.log('+ + + intentNameAlreadyExistsMsg', text)
      }, (error) => {
        
      }, () => {
        this.displayModalIntentNameAlreadyExist()
      });
  }

  displayModalIntentNameAlreadyExist() {
    swal({
      title: this.warningMsg,
      text: this.intentNameAlreadyExistsMsg,
      icon: "warning",
      button: "OK",
      dangerMode: false,
    })
  }


  goToKBArticle_AdvancedChatbotStyling() {
    console.log('goToKBArticle_AdvancedChatbotStyling');
    const url = 'https://docs.tiledesk.com/knowledge-base/advanced-chatbot-styling-buttons/';
    window.open(url, '_blank');
  }

  goToKBArticle_StylingYourChatbotReplies() {
    console.log('goToKBArticle_StylingYourChatbotReplies');
    const url = 'https://docs.tiledesk.com/knowledge-base/styling-your-chatbot-replies/';
    window.open(url, '_blank');
  }

}
