import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FaqService } from '../../services/faq.service';
import { Project } from '../../models/project-model';
import { AuthService } from '../../core/auth.service';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '../../services/logger/logger.service';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { HttpClient } from "@angular/common/http";


import { Intent, Button } from '../../models/intent-model';
import { TYPE_MESSAGE, TIME_WAIT_DEFAULT } from '../utils';
const swal = require('sweetalert');


@Component({
  selector: 'appdashboard-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  listOfIntents: Array<Intent>;
  intentSelected: Intent;

  CREATE_VIEW = false;
  EDIT_VIEW = false;
  showSpinner = false;

  id_faq_kb: string;
  id_faq: string;

  botType: string;
  project: Project;
  openCardButton = false;

  buttonSelected: Button;
  isChromeVerGreaterThan100: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private faqService: FaqService,
    private auth: AuthService,
    public location: Location,
    private logger: LoggerService,
    private httpClient: HttpClient
  ) { }


  // SYSTEM FUNCTIONS //
  ngOnInit() {
    this.getTranslations();
    this.auth.checkRoleForCurrentProject();
    this.getUrlParams();
    if (this.router.url.indexOf('/createfaq') !== -1) {
      this.logger.log('[FAQ-EDIT-ADD] HAS CLICKED CREATE ');
      this.CREATE_VIEW = true;
      this.createNewEmptyIntent();
      this.getFaqKbId();
    } else {
      this.logger.log('[FAQ-EDIT-ADD] HAS CLICKED EDIT ');
      this.EDIT_VIEW = true;
      if (this.id_faq) {
        this.getFaqById();
        //this.MOCK_getFaqById();
      }
    }
    this.getCurrentProject();
    this.getBrowserVersion();
  }



  // CUSTOM FUNCTIONS //

  /** */
  private getTranslations() {
    // this.translateCreateFaqSuccessMsg();
    // this.translateCreateFaqErrorMsg();
    // this.translateUpdateFaqSuccessMsg();
    // this.translateUpdateFaqErrorMsg();
    // this.translateWarningMsg();
    // this.translateAreYouSure();
    // this.translateErrorDeleting();
    // this.translateDone();
    // this.translateErrorOccurredDeletingAnswer();
    // this.translateAnswerSuccessfullyDeleted();
  }

  /** 
   * GET FROM ROUTE PARAMS (PASSED FROM FAQ COMPONENT):
   * THE FAQ ID - WHEN THE CALLBACK IS COMPLETED RUN GET-FAQ-BY-ID THAT RETURN THE OBJECT FAQ
   * AND THE FAQ KB ID (THEN USED IN THE GOBACK)
  */
  private getUrlParams() {
    this.route.params.subscribe((params) => {
      this.id_faq_kb = params.faqkbid;
      this.id_faq = params.faqid;
      this.botType = params.bottype
      this.logger.log('[FAQ-EDIT-ADD] getUrlParams (FaqEditAddComponent) PARAMS', params);
      this.logger.log('[FAQ-EDIT-ADD] getUrlParams (FaqEditAddComponent) BOT ID ', this.id_faq_kb);
      this.logger.log('[FAQ-EDIT-ADD] getUrlParams (FaqEditAddComponent) FAQ ID ', this.id_faq);
    });
  }

  /** */
  private createNewEmptyIntent(){
    this.intentSelected = new Intent();
  }

  /**
   * GET THE ID OF FAQ-KB PASSED BY FAQ PAGE (AND THAT FAQ PAGE HAS RECEIVED FROM FAQ-KB)
  */
   private getFaqKbId() {
    this.id_faq_kb = this.route.snapshot.params['faqkbid'];
    this.intentSelected.id_faq_kb = this.id_faq_kb;
    this.logger.log('[FAQ-EDIT-ADD] FAQ HAS PASSED id_faq_kb ', this.id_faq_kb);
  }

  /**
   * GET FAQ BY ID (GET THE DATA OF THE FAQ BY THE ID PASSED FROM FAQ LIST)
   * USED TO SHOW IN THE TEXAREA THE QUESTION AND THE ANSWER THAT USER WANT UPDATE
  */
  private getFaqById() {
    this.showSpinner = true;
    this.faqService.getFaqById(this.id_faq).subscribe((faq: any) => {
      this.logger.log('[FAQ-EDIT-ADD] - FAQ GET BY ID RES', faq);
      if (faq) {
        this.intentSelected = faq;
      }
      this.showSpinner = false;
    }, (error) => {
      this.logger.error('[FAQ-EDIT-ADD] - FAQ GET BY ID - ERROR ', error);
      this.showSpinner = false;
    }, () => {
      this.logger.log('[FAQ-EDIT-ADD] - FAQ GET BY ID - COMPLETE ');
      this.showSpinner = false;
      //this.translateTheAnswerWillBeDeleted();
    });
  }
 
  // translateTheAnswerWillBeDeleted() {
  //   let parameter = { intent_name: this.intent_name };
  //   this.translate.get('TheAnswerWillBeDeleted', parameter).subscribe((text: string) => {
  //     this.answerWillBeDeletedMsg = text;
  //   });
  // }

  /** */
  private getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project;
    });
  }

  /** */
  private getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => { 
     this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    });
  } 




  // drop(event: CdkDragDrop<string[]>) {
  //   if (event.previousContainer === event.container) {
  //     moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  //   } else {
  //     transferArrayItem(
  //       event.previousContainer.data,
  //       event.container.data,
  //       event.previousIndex,
  //       event.currentIndex,
  //     );
  //   }
  // }


  // SERVICE FUNCTIONS //
  
  /**
   * !!! this function is temporary and will be replaced with a server function 
  */
  MOCK_getFaqById(){
    let url = 'assets/mock-data/tilebot/faq/intents.json';
    this.httpClient.get<Intent[]>(url).subscribe(data => {
      this.listOfIntents = data;
      this.intentSelected = this.listOfIntents[0];
    }); 
  }

  /** ADD INTENT  */
  private creatIntent() {
    this.showSpinner = true;
    let id_faq_kb = this.intentSelected.id_faq_kb;
    let questionIntentSelected = this.intentSelected.question; 
    let answerIntentSelected = this.intentSelected.answer;
    let displayNameIntentSelected = this.intentSelected.intent_display_name;
    let formIntentSelected = this.intentSelected.form;
    let replyIntentSelected = this.intentSelected.reply;
    let webhookEnabledIntentSelected = this.intentSelected.webhook_enabled;
    this.faqService.addIntent(
      id_faq_kb,
      questionIntentSelected, 
      answerIntentSelected, 
      displayNameIntentSelected, 
      formIntentSelected, 
      replyIntentSelected, 
      webhookEnabledIntentSelected
    ).subscribe((faq) => {
        this.showSpinner = false;
        this.logger.log('[FAQ-EDIT-ADD] CREATED FAQ RES ', faq);
      }, (error) => {
        this.showSpinner = false;
        this.logger.error('[FAQ-EDIT-ADD] CREATED FAQ - ERROR ', error);
        // if (error && error['status']) {
        //   this.error_status = error['status']
        //   if (this.error_status === 409) {
        //     this.logger.error('[FAQ-EDIT-ADD] UPDATE FAQ - ERROR - ERROR-STATUS - TRANSLATE & PRESENT MODAL');
        //     this.translateAndPresentModalIntentNameAlreadyExist(this.intent_name);
        //   }
        // }
        // =========== NOTIFY ERROR ===========
        // this.notify.showWidgetStyleUpdateNotification(this.createFaqErrorNoticationMsg, 4, 'report_problem');
      }, () => {
        this.showSpinner = false;
        this.logger.log('[FAQ-EDIT-ADD] CREATED FAQ * COMPLETE *');
        // =========== NOTIFY SUCCESS===========
        // this.notify.showWidgetStyleUpdateNotification(this.createFaqSuccessNoticationMsg, 2, 'done');
        this.router.navigate(['project/' + this.project._id + '/bots/intents/' + this.id_faq_kb + "/" + this.botType]);
      });

  }

  /** EDIT INTENT  */
  private editIntent() {
    this.showSpinner = true;
    let id = this.intentSelected.id;
    let questionIntentSelected = this.intentSelected.question; 
    let answerIntentSelected = this.intentSelected.answer;
    let displayNameIntentSelected = this.intentSelected.intent_display_name;
    let formIntentSelected = this.intentSelected.form;
    let replyIntentSelected = this.intentSelected.reply;
    let webhookEnabledIntentSelected = this.intentSelected.webhook_enabled;   
    this.faqService.updateIntent(
      id, 
      questionIntentSelected,
      answerIntentSelected,
      displayNameIntentSelected,
      formIntentSelected,
      replyIntentSelected,
      webhookEnabledIntentSelected
    ).subscribe((data) => {
        this.showSpinner = false;
        this.logger.log('[FAQ-EDIT-ADD] UPDATE FAQ RES', data);
      }, (error) => {
        this.showSpinner = false;
        this.logger.error('[FAQ-EDIT-ADD] UPDATE FAQ - ERROR ', error);
        // =========== NOTIFY ERROR ===========
        // this.notify.showWidgetStyleUpdateNotification(this.editFaqErrorNoticationMsg, 4, 'report_problem');

        // if (error && error['status']) {
        //   this.error_status = error['status']
        //   this.logger.error('[FAQ-EDIT-ADD] UPDATE FAQ - ERROR - ERROR-STATUS', this.error_status);

        //   if (this.error_status === 409) {
        //     this.logger.error('[FAQ-EDIT-ADD] UPDATE FAQ - ERROR - ERROR-STATUS - TRANSLATE & PRESENT MODAL');
        //     this.translateAndPresentModalIntentNameAlreadyExist(this.intent_name);
        //   }
        // }

      }, () => {
        this.showSpinner = false;
        this.logger.log('[FAQ-EDIT-ADD] UPDATE FAQ * COMPLETE *');
        // =========== NOTIFY SUCCESS===========
        // this.notify.showWidgetStyleUpdateNotification(this.editFaqSuccessNoticationMsg, 2, 'done');
      });
  }


  // EVENTS //

  /** Go back to previous page */
  goBack() {
    this.location.back();
  }

  /** appdashboard-tools: add new response **/
  onAddNewResponse(element){
    try {
      this.intentSelected.reply.attributes.commands.push(element);
      console.log('onAddNewResponse---->', this.intentSelected.reply.attributes.commands);
    } catch (error) {
      console.log('onAddNewResponse ERROR', error);
    }
  }

  /** appdashboard-intent: Save intent */
  onSaveIntent(intent: Intent){
    this.intentSelected = intent;
    if(this.CREATE_VIEW){
      this.creatIntent();
    } else if(this.EDIT_VIEW){
      this.editIntent();
    }
  }

  /** appdashboard-intent: Open button panel */
  onOpenButtonPanel(event){
    if(this.openCardButton === true){
      this.onCloseButtonPanel();
    }
    this.buttonSelected = event;
    this.openCardButton = true;
  }

  /** appdashboard-button-configuration-panel: Save button */
  onSaveButton(button){ 
    this.openCardButton = false;
  }

  /** appdashboard-button-configuration-panel: Close button panel */
  onCloseButtonPanel(){
    this.openCardButton = false;
  }

}
