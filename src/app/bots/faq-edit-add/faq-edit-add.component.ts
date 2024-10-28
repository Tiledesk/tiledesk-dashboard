import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FaqService } from '../../services/faq.service';
import { Project } from '../../models/project-model';
import { AuthService } from '../../core/auth.service';
import { NotifyService } from '../../core/notify.service';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '../../services/logger/logger.service';
import {
  URL_styling_your_chatbot_replies,
  URL_response_bot_images_buttons_videos_and_more,
  URL_handoff_to_human_agents,
  URL_advanced_chatbot_styling_buttons,
  URL_more_info_chatbot_forms
} from '../../utils/util';
const swal = require('sweetalert');
import { } from 'app/utils/util';
import { AppConfigService } from 'app/services/app-config.service';
import { DepartmentService } from 'app/services/department.service';
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
  intentForm: any;
  faq_webhook_is_enabled: boolean;
  error_status: number;
  intentNameAlreadyExistsMsg: string;
  warningMsg: string;
  answerWillBeDeletedMsg: string;
  areYouSureMsg: string;
  errorDeleting: string;
  done_msg: string;
  errorDeletingAnswerMsg: string;
  answerSuccessfullyDeleted: string;
  isChromeVerGreaterThan100: boolean;
  public TESTSITE_BASE_URL: string;
  public defaultDepartmentId: string;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private faqService: FaqService,
    private auth: AuthService,
    private notify: NotifyService,
    public location: Location,
    private translate: TranslateService,
    private logger: LoggerService,
    public appConfigService: AppConfigService,
    private departmentService: DepartmentService
  ) { }

  ngOnInit() {
    this.getTranslations()
    // BASED ON THE URL PATH DETERMINE IF THE USER HAS SELECTED (IN FAQ PAGE) 'CREATE' OR 'EDIT'
    // if (this.router.url === '/createfaq') {
    this.getUrlParams();

    if (this.router.url.indexOf('/createfaq') !== -1 || this.router.url.indexOf('/_createfaq') !== -1) {
      this.logger.log('[FAQ-EDIT-ADD] HAS CLICKED CREATE ');
      this.CREATE_VIEW = true;
      this.showSpinner = false;
      // GET THE ID OF FAQ-KB PASSED BY FAQ PAGE (AND THAT FAQ PAGE HAS RECEIVED FROM FAQ-KB)
      this.getFaqKbId();
    } else {
      this.logger.log('[FAQ-EDIT-ADD] HAS CLICKED EDIT ');
      this.EDIT_VIEW = true;
      // GET THE ID OF FAQ PASSED BY FAQ PAGE &
      // GET THE ID OF FAQ-KB PASSED BY FAQ PAGE (AND THAT FAQ PAGE HAS RECEIVED FROM FAQ-KB)


      // IF EXIST THE FAQ ID (GET WITH getFaqKbIdAndFaqId RUN A CALLBACK TO OBTAIN THE FAQ OBJECT BY THE FAQ ID)
      if (this.id_faq) {
        this.getFaqById();
      }
    }
    this.getCurrentProject();
    this.getBrowserVersion();
    this.getDeptsByProjectId();
    this.getTestSiteUrl();
  }

  getDeptsByProjectId() {
    this.departmentService.getDeptsByProjectId().subscribe((departments: any) => {

      // console.log('[FAQ-EDIT-ADD] - DEPT - GET DEPTS  - RES', departments);
      if (departments) {
        departments.forEach((dept: any) => {
          // console.log('[FAQ-EDIT-ADD] - DEPT', dept);

          if (dept.default === true) {
            this.defaultDepartmentId = dept._id;
            // console.log('[FAQ-EDIT-ADD] - DEFAULT DEPT ID ', this.defaultDepartmentId);
          }
        });
      }

    }, error => {

      this.logger.error('[FAQ-EDIT-ADD] - DEPT - GET DEPTS  - ERROR', error);
    }, () => {
      this.logger.log('[FAQ-EDIT-ADD] - DEPT - GET DEPTS - COMPLETE')

    });
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  console.log("[BOT-CREATE] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }


  // GET FROM ROUTE PARAMS (PASSED FROM FAQ COMPONENT):
  // THE FAQ ID - WHEN THE CALLBACK IS COMPLETED RUN GET-FAQ-BY-ID THAT RETURN THE OBJECT FAQ
  // AND THE FAQ KB ID (THEN USED IN THE GOBACK)
  getUrlParams() {
    this.route.params.subscribe((params) => {
      this.id_faq_kb = params.faqkbid;
      this.id_faq = params.faqid;
      this.botType = params.bottype
      this.logger.log('[FAQ-EDIT-ADD] getUrlParams (FaqEditAddComponent) PARAMS', params);
      this.logger.log('[FAQ-EDIT-ADD] getUrlParams (FaqEditAddComponent) BOT ID ', this.id_faq_kb);
      this.logger.log('[FAQ-EDIT-ADD] getUrlParams (FaqEditAddComponent) FAQ ID ', this.id_faq);
    });
  }

  getFaqKbId() {
    this.id_faq_kb = this.route.snapshot.params['faqkbid'];
    this.logger.log('[FAQ-EDIT-ADD] FAQ HAS PASSED id_faq_kb ', this.id_faq_kb);
  }

  getTranslations() {
    this.translateCreateFaqSuccessMsg();
    this.translateCreateFaqErrorMsg();
    this.translateUpdateFaqSuccessMsg();
    this.translateUpdateFaqErrorMsg();
    this.translateWarningMsg();

    this.translateAreYouSure();
    this.translateErrorDeleting();
    this.translateDone();
    this.translateErrorOccurredDeletingAnswer();
    this.translateAnswerSuccessfullyDeleted();
  }

  // TRANSLATION
  translateCreateFaqSuccessMsg() {
    this.translate.get('CreateFaqSuccessNoticationMsg')
      .subscribe((text: string) => {

        this.createFaqSuccessNoticationMsg = text;
        // this.logger.log('+ + + CreateFaqSuccessNoticationMsg', text)
      });
  }

  // TRANSLATION
  translateCreateFaqErrorMsg() {
    this.translate.get('CreateFaqErrorNoticationMsg')
      .subscribe((text: string) => {

        this.createFaqErrorNoticationMsg = text;
        // this.logger.log('+ + + CreateFaqErrorNoticationMsg', text)
      });
  }

  // TRANSLATION
  translateUpdateFaqSuccessMsg() {
    this.translate.get('UpdateFaqSuccessNoticationMsg')
      .subscribe((text: string) => {

        this.editFaqSuccessNoticationMsg = text;
        // this.logger.log('+ + + UpdateFaqSuccessNoticationMsg', text)
      });
  }

  // TRANSLATION
  translateUpdateFaqErrorMsg() {
    this.translate.get('UpdateFaqErrorNoticationMsg')
      .subscribe((text: string) => {

        this.editFaqErrorNoticationMsg = text;
        // this.logger.log('+ + + UpdateFaqErrorNoticationMsg', text)
      });
  }

  // TRANSLATION
  translateWarningMsg() {
    this.translate.get('Warning').subscribe((text: string) => {
      this.warningMsg = text;
      // this.logger.log('+ + + warningMsg', text)
    });
  }

  translateAreYouSure() {
    this.translate.get('AreYouSure').subscribe((text: string) => {
      this.areYouSureMsg = text;
    });
  }

  translateErrorDeleting() {
    this.translate.get('ErrorDeleting').subscribe((text: string) => {
      this.errorDeleting = text;
    });
  }

  translateDone() {
    this.translate.get('Done').subscribe((text: string) => {
      this.done_msg = text;
    });
  }

  translateErrorOccurredDeletingAnswer() {
    this.translate.get('FaqPage.AnErrorOccurredWhilDeletingTheAnswer').subscribe((text: string) => {
      this.errorDeletingAnswerMsg = text;
      // this.logger.log('+ + + AnErrorOccurredWhilDeletingTheAnswer', this.errorDeletingAnswerMsg)
    });
  }

  translateAnswerSuccessfullyDeleted() {
    this.translate.get('FaqPage.AnswerSuccessfullyDeleted').subscribe((text: string) => {
      this.answerSuccessfullyDeleted = text;
      // this.logger.log('+ + + AnswerSuccessfullyDeleted', this.answerSuccessfullyDeleted)
    });
  }

  // /. end translations

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      // this.logger.log('00 -> FAQ EDIT/ADD COMP project ID from AUTH service subscription  ', this.project._id)
    });
  }

  presentSwalModalDeleteFaq() {
    swal({
      title: this.areYouSureMsg,
      text: this.answerWillBeDeletedMsg,
      icon: "warning",
      buttons: ["Cancel", "Delete"],
      dangerMode: true,
    })
      .then((WillDelete) => {
        if (WillDelete) {
          this.logger.log('[FAQ-EDIT-ADD] presentSwalModalDeleteFaq swal WillDelete', WillDelete)
          this.faqService.deleteFaq(this.id_faq).subscribe((data) => {
            this.logger.log('[FAQ-EDIT-ADD] presentSwalModalDeleteFaq swal DELETE FAQ RES ', data)
          }, (error) => {
            swal(this.errorDeletingAnswerMsg, {
              icon: "error",
            });
            this.logger.error('[FAQ-EDIT-ADD] DELETE FAQ ERROR ', error);
          }, () => {
            this.logger.log('[FAQ-EDIT-ADD] DELETE FAQ * COMPLETE *');
            swal(this.done_msg + "!", this.answerSuccessfullyDeleted, {
              icon: "success",
            }).then((okpressed) => {
              this.location.back();
            });
          });
        } else {
          this.logger.log('[FAQ-EDIT-ADD] WS-REQUESTS-LIST swal WillDelete (else)')
        }
      });
  }

  /**
  * GET FAQ BY ID (GET THE DATA OF THE FAQ BY THE ID PASSED FROM FAQ LIST)
  * USED TO SHOW IN THE TEXAREA THE QUESTION AND THE ANSWER THAT USER WANT UPDATE
  */
  getFaqById() {
    this.faqService.getFaqById(this.id_faq).subscribe((faq: any) => {
      this.logger.log('[FAQ-EDIT-ADD] - FAQ GET BY ID RES', faq);
      if (faq) {
        this.question_toUpdate = faq.question;
        this.answer_toUpdate = faq.answer;
        this.intentForm = faq.form;
        this.faq_creationDate = faq.createdAt;
        this.intent_name = faq.intent_display_name;
        this.faq_webhook_is_enabled = faq.webhook_enabled;
        this.logger.log('[FAQ-EDIT-ADD] FAQ QUESTION TO UPDATE', this.question_toUpdate);
        this.logger.log('[FAQ-EDIT-ADD] FAQ ANSWER TO UPDATE', this.answer_toUpdate);
      }

    }, (error) => {
      this.logger.error('[FAQ-EDIT-ADD] - FAQ GET BY ID - ERROR ', error);
      this.showSpinner = false;
    }, () => {
      this.logger.log('[FAQ-EDIT-ADD] - FAQ GET BY ID - COMPLETE ');
      this.showSpinner = false;

      this.translateTheAnswerWillBeDeleted();
    });
  }

  translateTheAnswerWillBeDeleted() {
    let parameter = { intent_name: this.intent_name };
    this.translate.get('TheAnswerWillBeDeleted', parameter).subscribe((text: string) => {
      this.answerWillBeDeletedMsg = text;
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
    this.logger.log('[FAQ-EDIT-ADD] toggleFaqWebhook ', $event.target.checked);
    this.faq_webhook_is_enabled = $event.target.checked
  }


  /**
   * *** ADD FAQ ***
   */
  create() {
    const create_answer_btn = <HTMLElement>document.querySelector('.create-answer-btn');
    create_answer_btn.blur();

    this.logger.log('[FAQ-EDIT-ADD] CREATE FAQ - QUESTION: ', this.question, ' - ANSWER: ', this.answer, ' - ID FAQ KB ', this.id_faq_kb, ' - INTENT NAME ', this.intent_name, ' - FAQ WEBHOOK ENABLED ', this.faq_webhook_is_enabled);
    this.faqService.addFaq(this.question, this.answer, this.id_faq_kb, this.intent_name, this.intentForm, this.faq_webhook_is_enabled)
      .subscribe((faq) => {
        this.logger.log('[FAQ-EDIT-ADD] CREATED FAQ RES ', faq);

        // this.question = '';
        // this.answer = '';
        // RE-RUN GET FAQ TO UPDATE THE TABLE
        // this.getDepartments();
        // this.ngOnInit();
      }, (error) => {

        this.logger.error('[FAQ-EDIT-ADD] CREATED FAQ - ERROR ', error);

        if (error && error['status']) {
          this.error_status = error['status']
          this.logger.error('[FAQ-EDIT-ADD] UPDATE FAQ - ERROR - ERROR-STATUS', this.error_status);

          if (this.error_status === 409) {
            this.logger.error('[FAQ-EDIT-ADD] UPDATE FAQ - ERROR - ERROR-STATUS - TRANSLATE & PRESENT MODAL');
            this.translateAndPresentModalIntentNameAlreadyExist(this.intent_name);
          }
        }
        // =========== NOTIFY ERROR ===========
        // this.notify.showNotification('An error occurred while creating the FAQ', 4, 'report_problem');
        this.notify.showWidgetStyleUpdateNotification(this.createFaqErrorNoticationMsg, 4, 'report_problem');
      }, () => {
        this.logger.log('[FAQ-EDIT-ADD] CREATED FAQ * COMPLETE *');
        // =========== NOTIFY SUCCESS===========
        // this.notify.showNotification('FAQ successfully created', 2, 'done');
        this.notify.showWidgetStyleUpdateNotification(this.createFaqSuccessNoticationMsg, 2, 'done');


        // this.router.navigate(['project/' + this.project._id + '/bots', this.id_faq_kb, this.botType]);
        this.router.navigate(['project/' + this.project._id + '/tilebot/intents/' + this.id_faq_kb + "/" + this.botType]);
      });

  }

  /**
   * *** EDIT FAQ ***
   */
  edit() {
    const updated_answer_btn = <HTMLElement>document.querySelector('.update-answer-btn');
    updated_answer_btn.blur();

    this.logger.log('[FAQ-EDIT-ADD] FAQ QUESTION TO UPDATE ', this.question_toUpdate);
    this.logger.log('[FAQ-EDIT-ADD] FAQ ANSWER TO UPDATE ', this.answer_toUpdate);

    this.faqService.updateFaq(this.id_faq, this.question_toUpdate, this.answer_toUpdate, this.intent_name, this.intentForm, this.faq_webhook_is_enabled)
      .subscribe((data) => {
        this.logger.log('[FAQ-EDIT-ADD] UPDATE FAQ RES', data);

        // RE-RUN TO UPDATE THE TABLE
        // this.ngOnInit();
      }, (error) => {
        this.logger.error('[FAQ-EDIT-ADD] UPDATE FAQ - ERROR ', error);
        // =========== NOTIFY ERROR ===========
        // this.notify.showNotification('An error occurred while updating the FAQ', 4, 'report_problem');
        this.notify.showWidgetStyleUpdateNotification(this.editFaqErrorNoticationMsg, 4, 'report_problem');

        if (error && error['status']) {
          this.error_status = error['status']
          this.logger.error('[FAQ-EDIT-ADD] UPDATE FAQ - ERROR - ERROR-STATUS', this.error_status);

          if (this.error_status === 409) {
            this.logger.error('[FAQ-EDIT-ADD] UPDATE FAQ - ERROR - ERROR-STATUS - TRANSLATE & PRESENT MODAL');
            this.translateAndPresentModalIntentNameAlreadyExist(this.intent_name);
          }
        }

      }, () => {
        this.logger.log('[FAQ-EDIT-ADD] UPDATE FAQ * COMPLETE *');
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
        this.logger.log('[FAQ-EDIT-ADD] + + + intentNameAlreadyExistsMsg', text)
      }, (error) => {
        this.logger.error('[FAQ-EDIT-ADD] + + + intentNameAlreadyExistsMsg', error)
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


  goToKBArticle_ResolutionBotImagesVideosButtonsAndMore() {
    // const url = 'https://docs.tiledesk.com/knowledge-base/response-bot-images-buttons-videos-and-more/'; // NOT FOUND on gethelp
    const url = URL_response_bot_images_buttons_videos_and_more; // NOT FOUND on gethelp
    window.open(url, '_blank');
  }

  goToKBArticleAnchor_SendImages() {
    // const url = 'https://docs.tiledesk.com/knowledge-base/response-bot-images-buttons-videos-and-more/#send-images'; // NOT FOUND on gethelp
    const url = URL_response_bot_images_buttons_videos_and_more + '#send-images'; // NOT FOUND on gethelp
    window.open(url, '_blank');
  }

  goToKBArticleAnchor_TextButton() {
    // const url = 'https://docs.tiledesk.com/knowledge-base/response-bot-images-buttons-videos-and-more/#text-buttons'; // NOT FOUND on gethelp
    const url = URL_response_bot_images_buttons_videos_and_more + '#text-buttons'; // NOT FOUND on gethelp
    window.open(url, '_blank');
  }

  goToKBArticle_HandoffToHumanAgents() {
    // const url = 'https://gethelp.tiledesk.com/articles/handoff-to-human-agents/';
    const url = URL_handoff_to_human_agents;
    window.open(url, '_blank');
  }

  goToKBArticle_AdvancedChatbotStyling() {
    this.logger.log('goToKBArticle_AdvancedChatbotStyling');
    // const url = 'https://gethelp.tiledesk.com/articles/advanced-chatbot-styling-buttons/';
    const url = URL_advanced_chatbot_styling_buttons;
    window.open(url, '_blank');
  }

  goToKBArticle_StylingYourChatbotReplies() {
    // const url = 'https://gethelp.tiledesk.com/articles/styling-your-chatbot-replies/';
    const url = URL_styling_your_chatbot_replies;
    window.open(url, '_blank');
  }

  /**
   * GET JSON FORM
   */
  passJsonIntentForm(json) {
    // this.intentForm = {};
    //if(json && json.fields && json.fields.length>0){
    //}
    this.intentForm = json;
    // console.log("-------------------> passJsonIntentForm::: ", this.intentForm);
  }

  getTestSiteUrl() {
    this.TESTSITE_BASE_URL = this.appConfigService.getConfig().WIDGET_BASE_URL + 'assets/twp/index.html';
    this.logger.log('[TEMPLATE DETAIL] AppConfigService getAppConfig TESTSITE_BASE_URL', this.TESTSITE_BASE_URL);
  }

  openTestSiteInPopupWindow() {
    // console.log('openTestSiteInPopupWindow TESTSITE_BASE_URL', this.TESTSITE_BASE_URL)
    const testItOutBaseUrl = this.TESTSITE_BASE_URL.substring(0, this.TESTSITE_BASE_URL.lastIndexOf('/'));
    const testItOutUrl = testItOutBaseUrl + '/chatbot-panel.html'
    // console.log('openTestSiteInPopupWindow testItOutBaseUrl', testItOutBaseUrl)
    const url = testItOutUrl + '?tiledesk_projectid=' + this.project._id + '&tiledesk_participants=bot_' + this.id_faq_kb + "&tiledesk_departmentID=" + this.defaultDepartmentId
    // console.log('openTestSiteInPopupWindow URL ', url)
    let params = `toolbar=no,menubar=no,width=815,height=727,left=100,top=100`;
    window.open(url, '_blank', params);
  }

  goToFormMoreInfo() {
    const url = URL_more_info_chatbot_forms;
    window.open(url, '_blank');
  }

}
