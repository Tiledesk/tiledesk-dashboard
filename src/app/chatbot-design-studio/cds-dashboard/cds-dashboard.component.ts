import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FaqService } from '../../services/faq.service';
import { Project } from '../../models/project-model';
import { AuthService } from '../../core/auth.service';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '../../services/logger/logger.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { HttpClient } from "@angular/common/http";


import { Intent, Button, Action, Form } from '../../models/intent-model';
import { TYPE_MESSAGE, TIME_WAIT_DEFAULT } from '../utils';
import { Subject } from 'rxjs';
const swal = require('sweetalert');


@Component({
  selector: 'appdashboard-cds-dashboard',
  templateUrl: './cds-dashboard.component.html',
  styleUrls: ['./cds-dashboard.component.scss']
})
export class CdsDashboardComponent implements OnInit {

  listOfIntents: Array<Intent>;
  listOfActions: Array<string>;
  intentSelected: Intent;
  elementIntentSelected: any;

  CREATE_VIEW = false;
  EDIT_VIEW = false;
  showSpinner = false;

  id_faq_kb: string;
  id_faq: string;

  botType: string;
  project: Project;
  projectID: string;
  // openCardButton = false;

  // buttonSelected: Button;
  isChromeVerGreaterThan100: boolean;
  isOpenActionDrawer: boolean;
  eventsSubject: Subject<void> = new Subject<void>();
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
    this.getFaqKbId();
    if (this.router.url.indexOf('/createfaq') !== -1) {
      this.logger.log('[CDS DSHBRD] HAS CLICKED CREATE ');
      this.CREATE_VIEW = true;
      // this.createNewEmptyIntent();
      // this.getFaqKbId();
    } else {
      this.logger.log('[CDS DSHBRD] HAS CLICKED EDIT ');
      this.EDIT_VIEW = true;
      if (this.id_faq) {
        // this.getFaqById();
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
      console.log('[CDS DSHBRD] getUrlParams  PARAMS', params);
      console.log('[CDS DSHBRD] getUrlParams  BOT ID ', this.id_faq_kb);
      console.log('[CDS DSHBRD] getUrlParams  FAQ ID ', this.id_faq);
    });
  }

  /** */
  private createNewEmptyIntent() {
    this.intentSelected = new Intent();
  }

  /**
   * GET THE ID OF FAQ-KB PASSED BY FAQ PAGE (AND THAT FAQ PAGE HAS RECEIVED FROM FAQ-KB)
  */
  private getFaqKbId() {
    this.id_faq_kb = this.route.snapshot.params['faqkbid'];
    if (this.intentSelected) {
      this.intentSelected.id_faq_kb = this.id_faq_kb;
      console.log('[CDS DSHBRD]  intentSelected ', this.intentSelected);
    } else {
      console.log('[CDS DSHBRD]  intentSelected ', this.intentSelected);
    }
  }

  /**
   * GET FAQ BY ID (GET THE DATA OF THE FAQ BY THE ID PASSED FROM FAQ LIST)
   * USED TO SHOW IN THE TEXAREA THE QUESTION AND THE ANSWER THAT USER WANT UPDATE
  */
  private getFaqById() {
    console.log('getFaqById');
    this.showSpinner = true;
    this.faqService.getFaqById(this.id_faq).subscribe((faq: any) => {
      this.logger.log('[CDS DSHBRD] - FAQ GET BY ID RES', faq);
      if (faq) {
        this.intentSelected = faq;
      }
      console.log('faq', faq);
      this.showSpinner = false;
    }, (error) => {
      this.logger.error('[CDS DSHBRD] - FAQ GET BY ID - ERROR ', error);
      this.showSpinner = false;
    }, () => {
      this.logger.log('[CDS DSHBRD] - FAQ GET BY ID - COMPLETE ');
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
      if (project) {
        this.project = project;
        this.projectID = project._id
      }
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
  // MOCK_getFaqIntents() {
  //   let url = 'assets/mock-data/tilebot/faq/intents.json';
  //   this.httpClient.get<Intent[]>(url).subscribe(data => {
  //     this.listOfIntents = data;
  //     this.intentSelected = this.listOfIntents[0];
  //     console.log("[CDS DSHBRD] - MOCK_getFaqIntents  this.intentSelected ", this.intentSelected)
  //   });
  // }

  // MOCK_getFaqIntent() {
  //   let url = 'assets/mock-data/tilebot/faq/intent.json';
  //   this.httpClient.get<Intent>(url).subscribe(data => {

  //     this.intentSelected = data;
  //     this.elementIntentSelected = {};
  //     this.elementIntentSelected['type'] = 'action';
  //     this.elementIntentSelected['element'] = this.intentSelected.actions[0];
  //     console.log('MOCK_getFaqIntent', this.elementIntentSelected);
  //   });
  // }

  /** ADD INTENT  */
  private creatIntent() {
    console.log('creatIntent')
    this.showSpinner = true;
    let id_faq_kb = this.intentSelected.id_faq_kb;
    let questionIntentSelected = this.intentSelected.question;
    let answerIntentSelected = this.intentSelected.answer;
    let displayNameIntentSelected = this.intentSelected.intent_display_name;
    let formIntentSelected = this.intentSelected.form;
    console.log('[CDS DSHBRD] creatIntent formIntentSelected ', formIntentSelected)
    let actionsIntentSelected = this.intentSelected.actions;
    console.log('[CDS DSHBRD] creatIntent actionsIntentSelected ', actionsIntentSelected)
    let webhookEnabledIntentSelected = this.intentSelected.webhook_enabled;
    this.faqService.addIntent(
      this.id_faq_kb,
      questionIntentSelected,
      answerIntentSelected,
      displayNameIntentSelected,
      formIntentSelected,
      actionsIntentSelected,
      webhookEnabledIntentSelected
    ).subscribe((faq) => {
      this.showSpinner = false;
      console.log('[CDS DSHBRD] creatIntent RES ', faq);
    }, (error) => {
      this.showSpinner = false;
      this.logger.error('[CDS DSHBRD] CREATED FAQ - ERROR ', error);
      // if (error && error['status']) {
      //   this.error_status = error['status']
      //   if (this.error_status === 409) {
      //     this.logger.error('[CDS DSHBRD] UPDATE FAQ - ERROR - ERROR-STATUS - TRANSLATE & PRESENT MODAL');
      //     this.translateAndPresentModalIntentNameAlreadyExist(this.intent_name);
      //   }
      // }
      // =========== NOTIFY ERROR ===========
      // this.notify.showWidgetStyleUpdateNotification(this.createFaqErrorNoticationMsg, 4, 'report_problem');
    }, () => {
      this.showSpinner = false;
      this.logger.log('[CDS DSHBRD] CREATED FAQ * COMPLETE *');
      // =========== NOTIFY SUCCESS===========
      // this.notify.showWidgetStyleUpdateNotification(this.createFaqSuccessNoticationMsg, 2, 'done');
      // this.router.navigate(['project/' + this.project._id + '/bots/intents/' + this.id_faq_kb + "/" + this.botType]);
    });

  }

  /** EDIT INTENT  */
  private editIntent() {
    console.log('[CDS DSHBRD] editIntent intentSelected', this.intentSelected);
    this.showSpinner = true;
    let id = this.intentSelected.id;
    let questionIntentSelected = this.intentSelected.question;
    let answerIntentSelected = this.intentSelected.answer;
    let displayNameIntentSelected = this.intentSelected.intent_display_name;
    let formIntentSelected = this.intentSelected.form;
    let actionsIntentSelected = this.intentSelected.actions;
    let webhookEnabledIntentSelected = this.intentSelected.webhook_enabled;
    this.faqService.updateIntent(
      id,
      questionIntentSelected,
      answerIntentSelected,
      displayNameIntentSelected,
      formIntentSelected,
      actionsIntentSelected,
      webhookEnabledIntentSelected
    ).subscribe((data) => {
      this.showSpinner = false;
      console.log('[CDS DSHBRD] UPDATE FAQ RES', data);
    }, (error) => {
      this.showSpinner = false;
      this.logger.error('[CDS DSHBRD] UPDATE FAQ - ERROR ', error);
      // =========== NOTIFY ERROR ===========
      // this.notify.showWidgetStyleUpdateNotification(this.editFaqErrorNoticationMsg, 4, 'report_problem');

      // if (error && error['status']) {
      //   this.error_status = error['status']
      //   this.logger.error('[CDS DSHBRD] UPDATE FAQ - ERROR - ERROR-STATUS', this.error_status);

      //   if (this.error_status === 409) {
      //     this.logger.error('[CDS DSHBRD] UPDATE FAQ - ERROR - ERROR-STATUS - TRANSLATE & PRESENT MODAL');
      //     this.translateAndPresentModalIntentNameAlreadyExist(this.intent_name);
      //   }
      // }

    }, () => {
      this.showSpinner = false;
      this.logger.log('[CDS DSHBRD] UPDATE FAQ * COMPLETE *');
      // =========== NOTIFY SUCCESS===========
      // this.notify.showWidgetStyleUpdateNotification(this.editFaqSuccessNoticationMsg, 2, 'done');
    });
  }


  // EVENTS //

  /** Go back to previous page */
  goBack() {
    this.location.back();
  }

  /** appdashboard-intent: Save intent */
  onSaveIntent(intent: Intent) {
    console.log('[CDS DSHBRD] onSaveIntent :: ', intent);
    console.log('[CDS DSHBRD] listOfIntents :: ', this.listOfIntents);
    this.intentSelected = intent;
    if (this.CREATE_VIEW) {
      this.creatIntent();
    } else if (this.EDIT_VIEW) {
      this.editIntent();
    }
  }

  /** appdashboard-intent-list: Select intent */
  onReturnListOfIntents(intents) {
    this.listOfIntents = intents;
    this.listOfActions = intents.map(a => a.intent_display_name);
    console.log('[CDS DSHBRD]  onReturnListOfIntents: listOfActions', this.listOfActions);
    console.log('[CDS DSHBRD]  onReturnListOfIntents: listOfIntents', this.listOfIntents);
  }

  onSelectIntent(intent: Intent) {
    this.intentSelected = intent;
    // this.MOCK_getFaqIntent();
    console.log("[CDS DSHBRD]  onSelectIntent - intentSelected: ", this.intentSelected);
    console.log("[CDS DSHBRD]  onSelectIntent - intentSelected: ", intent);

    this.elementIntentSelected = {};
    this.elementIntentSelected['type'] = ''
    this.elementIntentSelected['element'] = null
    console.log('[CDS DSBRD] onSelectIntent elementIntentSelected', this.elementIntentSelected)
  }

  onOpenActionDrawer(_isOpenActioDrawer: boolean) {
    console.log('[CDS DSBRD] onOpenActionDrawer - isOpenActioDrawer ', _isOpenActioDrawer)
    this.isOpenActionDrawer = _isOpenActioDrawer
  }

  onAnswerSelected(answer: string) {
    console.log('[CDS DSBRD] onAnswerSelected - answer ', answer)
    this.elementIntentSelected = {};
    this.elementIntentSelected['type'] = 'answer'
    this.elementIntentSelected['element'] = answer
  }

  onActionSelected(action: string) {
    console.log('[CDS DSBRD] onActionSelected from PANEL INTENT - action ', action)
    this.elementIntentSelected = {};
    this.elementIntentSelected['type'] = 'action'
    this.elementIntentSelected['element'] = action
    console.log('[CDS DSBRD] onActionSelected from PANEL INTENT - this.elementIntentSelected ', this.elementIntentSelected)
  }

  onQuestionSelected(intent) {
    console.log('[CDS DSBRD] onQuestionSelected from PANEL INTENT - intent ', intent)
    this.elementIntentSelected = {};
    this.elementIntentSelected['type'] = 'question'
    this.elementIntentSelected['element'] = intent
    console.log('[CDS DSBRD] onQuestionSelected from PANEL INTENT - this.elementIntentSelected ', this.elementIntentSelected)
  }

  onIntentFormSelected(intentform: Form) {
    console.log('[CDS DSBRD] onIntentFormSelected - from PANEL INTENT intentform ', intentform)
    this.elementIntentSelected = {};
    this.elementIntentSelected['type'] = 'form'
    this.elementIntentSelected['element'] = intentform
    console.log('[CDS DSBRD] onIntentFormSelected - from PANEL INTENT - this.elementIntentSelected ', this.elementIntentSelected)
  }


  onCreateIntentBtnClicked() {
    this.CREATE_VIEW = true;
    console.log('[CDS DSBRD] addNewIntent  ')
    this.intentSelected = new Intent();
    let action = new Action()
    action.type = 'reply'
    action.body = {
      text: '',
      commands: [
        {
          type: 'message',
          message: {
            text: 'Ciao',
            type: 'text'
          }
        }
      ]
    }

    this.intentSelected.actions.push(action)
    // this.elementIntentSelected = {};
    // this.elementIntentSelected['type'] = 'new'
    console.log('[CDS DSBRD] addNewIntent intentSelected ', this.intentSelected)
  }




}
