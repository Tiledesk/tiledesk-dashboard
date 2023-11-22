import { TYPE_ACTION, variableList } from 'app/chatbot-design-studio/utils';
import { MultichannelService } from 'app/services/multichannel.service';
import { Component, OnInit, ElementRef } from '@angular/core';
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
import { Intent, Button, Action, Form, ActionReply, Command, Message, ActionAssignVariable } from '../../models/intent-model';
import { TYPE_COMMAND, TYPE_INTENT_ELEMENT, EXTERNAL_URL, TYPE_MESSAGE, TIME_WAIT_DEFAULT } from '../utils';
import { Subject } from 'rxjs';
import { FaqKbService } from 'app/services/faq-kb.service';
import { Chatbot } from 'app/models/faq_kb-model';
import { AppConfigService } from 'app/services/app-config.service';
import { DepartmentService } from 'app/services/department.service';
import { CdsPublishOnCommunityModalComponent } from './cds-publish-on-community-modal/cds-publish-on-community-modal.component';
import { NotifyService } from 'app/core/notify.service';
import { LocalDbService } from 'app/services/users-local-db.service';

import { DialogYesNoComponent } from 'app/chatbot-design-studio/cds-base-element/dialog-yes-no/dialog-yes-no.component';
import { MatDialog } from '@angular/material/dialog';
import { WsChatbotService } from 'app/services/websocket/ws-chatbot.service';
const swal = require('sweetalert');

@Component({
  selector: 'appdashboard-cds-dashboard',
  templateUrl: './cds-dashboard.component.html',
  styleUrls: ['./cds-dashboard.component.scss']
})
export class CdsDashboardComponent implements OnInit {

  listOfIntents: Array<Intent>;
  listOfActions: Array<{ name: string, value: string, icon?: string }>;
  listOfVariables: { userDefined: Array<any>, systemDefined: Array<any> };
  intentSelected: Intent;
  elementIntentSelected: any;
  newIntentName: string;

  CREATE_VIEW = false;
  EDIT_VIEW = false;
  showSpinner = false;
  isIntentElementSelected: boolean = false;
  isClickedInsidePanelIntentDetail: boolean = false;

  id_faq_kb: string;
  id_faq: string;
  idElementOfIntentSelected: string;
  intent_id: string;

  botType: string;
  project: Project;
  projectID: string;
  // openCardButton = false;

  // buttonSelected: Button;
  isChromeVerGreaterThan100: boolean;
  isOpenActionDrawer: boolean;
  //eventsSubject: Subject<any> = new Subject<any>();
  createIntent: Subject<Intent> = new Subject<Intent>();
  upadatedIntent: Subject<Intent> = new Subject<Intent>();
  startUpdatedIntent: Subject<boolean> = new Subject<boolean>();
  newIntentFromSplashScreen: Subject<boolean> = new Subject<boolean>();
  selectedChatbot: Chatbot
  activeSidebarSection: string;
  spinnerCreateIntent: boolean = false;
  IS_OPEN: boolean = false;
  public TESTSITE_BASE_URL: string;
  public defaultDepartmentId: string;
  public_Key: string;
  TRY_ON_WA: boolean;

  // Attach bot to dept
  displayModalAttacchBotToDept: string;
  dept_id: string;
  DISPLAY_SELECT_DEPTS_WITHOUT_BOT: boolean;
  PRESENTS_MODAL_ATTACH_BOT_TO_DEPT: boolean = false;
  depts_without_bot_array = [];
  selected_bot_id: string;
  selected_bot_name: string;
  HAS_CLICKED_HOOK_BOOT_TO_DEPT: boolean = false;
  HAS_COMPLETED_HOOK_BOOT_TO_DEPT: boolean = false;
  HAS_COMPLETED_HOOK_BOOT_TO_DEPT_SUCCESS: boolean = false;
  HAS_COMPLETED_HOOK_BOOT_TO_DEPT_ERROR: boolean = false;
  translateparamBotName: any;

  popup_visibility: string = 'none'

  isBetaUrl: boolean = false;
  calledby: string;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private faqService: FaqService,
    private auth: AuthService,
    public location: Location,
    private logger: LoggerService,
    private httpClient: HttpClient,
    private faqKbService: FaqKbService,
    public appConfigService: AppConfigService,
    private departmentService: DepartmentService,
    private multichannelService: MultichannelService,
    private el: ElementRef,
    public dialog: MatDialog,
    private notify: NotifyService,
    public usersLocalDbService: LocalDbService,
    private wsChatbotService: WsChatbotService
  ) { }

  // SYSTEM FUNCTIONS //
  ngOnInit() {

    this.getTranslations();
    this.auth.checkRoleForCurrentProject();
    this.getUrlParams();
    this.diplayPopup();
    // this.getFaqKbId();
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
    this.getTestSiteUrl();
    this.getDeptsByProjectId();
    this.hideShowWidget('show');
    this.getOSCODE();
    this.subscribeToChatbotAI()
    if(window.location.href.includes('beta')){
      this.isBetaUrl = true
    }
  }


  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    // this.logger.log('AppConfigService getAppConfig (SIGNUP) public_Key', this.public_Key)
    // this.logger.log('NavbarComponent public_Key', this.public_Key)

    let keys = this.public_Key.split("-");

    if (this.public_Key.includes("TOW") === true) {

      keys.forEach(key => {
        // this.logger.log('NavbarComponent public_Key key', key)
        if (key.includes("TOW")) {
          // this.logger.log('PUBLIC-KEY (SIGNUP) - key', key);
          let tow = key.split(":");
          // this.logger.log('PUBLIC-KEY (SIGNUP) - mt key&value', mt);
          if (tow[1] === "F") {
            this.TRY_ON_WA = false;
            // this.logger.log('PUBLIC-KEY (SIGNUP) - mt is', this.MT);
          } else {
            this.TRY_ON_WA = true;
            // this.logger.log('PUBLIC-KEY (SIGNUP) - mt is', this.MT);
          }
        }
      });

    } else {
      this.TRY_ON_WA = false;
      // this.logger.log('PUBLIC-KEY (SIGNUP) - mt is', this.MT);
    }
  }

  private hideShowWidget(status: "hide" | "show") {
    try {
      if (window && window['tiledesk']) {
        this.logger.log('[CDS DSHBRD] HIDE WIDGET ', window['tiledesk'])

        if (status === 'hide') {
          window['tiledesk'].hide();
        } else if (status === 'show') {
          window['tiledesk'].show();
        }
        // alert('signin reinit');
      }
    } catch (error) {
      this.logger.error('tiledesk_widget_hide ERROR', error)
    }
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
      // console.log('[CDS DSHBRD] getUrlParams  PARAMS', params);
      this.id_faq_kb = params.faqkbid;
      if (this.id_faq_kb) {
        this.getBotById(this.id_faq_kb)
      }
      this.id_faq = params.faqid;
      this.botType = params.bottype
      this.intent_id = params.intent_id
      if (params.calledby) {
        this.calledby = 'home'
      }
      
      this.logger.log('[CDS DSHBRD] getUrlParams  BOT ID ', this.id_faq_kb);
      this.logger.log('[CDS DSHBRD] getUrlParams  FAQ ID ', this.id_faq);
      this.logger.log('[CDS DSHBRD] getUrlParams  FAQ ID ', this.intent_id);
    });
  }

  /** */
  private createNewEmptyIntent() {
    this.intentSelected = new Intent();
  }

  getBotById(botid: string) {
    this.logger.log('getFaqById');
    this.showSpinner = true;
    this.faqKbService.getBotById(botid).subscribe((chatbot: Chatbot) => {
      this.logger.log('[CDS DSHBRD] - GET BOT BY ID RES - chatbot', chatbot);
      if (chatbot) {
        this.selectedChatbot = chatbot;
        this.translateparamBotName = { bot_name: this.selectedChatbot.name }
        if (this.selectedChatbot && this.selectedChatbot.attributes && this.selectedChatbot.attributes.variables) {
          variableList.userDefined = this.convertJsonToArray(this.selectedChatbot.attributes.variables);
        }
        if(this.selectedChatbot.intentsEngine == 'tiledesk-ai'){
          // this.wsChatbotService.subsToAITrain_ByBot_id(this.selectedChatbot._id)
        }
        // console.log('variableList.userDefined:: ', this.selectedChatbot.attributes.variables);
      }
    }, (error) => {
      this.logger.error('[CDS DSHBRD] - GET BOT BY ID RES - ERROR ', error);

    }, () => {
      this.logger.log('[CDS DSHBRD] - GET BOT BY ID RES - COMPLETE ');

    });
  }

  private convertJsonToArray(jsonData) {
    this.logger.log('convertJsonToArray  jsonData ', jsonData)
    const arrayOfObjs = Object.entries(jsonData).map(([key, value]) => ({ 'name': key, 'value': value }))
    return arrayOfObjs;
  }


  /**
   * GET THE ID OF FAQ-KB PASSED BY FAQ PAGE (AND THAT FAQ PAGE HAS RECEIVED FROM FAQ-KB)
  */
  // private getFaqKbId() {
  //   this.id_faq_kb = this.route.snapshot.params['faqkbid'];
  //   if (this.intentSelected) {
  //     this.intentSelected.id_faq_kb = this.id_faq_kb;
  //     this.logger.log('[CDS DSHBRD]  intentSelected ', this.intentSelected);
  //   } else {
  //     this.logger.log('[CDS DSHBRD]  intentSelected ', this.intentSelected);
  //   }
  // }

  /**
   * GET FAQ BY ID (GET THE DATA OF THE FAQ BY THE ID PASSED FROM FAQ LIST)
   * USED TO SHOW IN THE TEXAREA THE QUESTION AND THE ANSWER THAT USER WANT UPDATE
  */
  // private getFaqById() {
  //   this.logger.log('getFaqById');
  //   this.showSpinner = true;
  //   this.faqService.getFaqById(this.id_faq).subscribe((faq: any) => {
  //     this.logger.log('[CDS DSHBRD] - FAQ GET BY ID RES', faq);
  //     if (faq) {
  //       this.intentSelected = faq;
  //     }
  //     this.logger.log('faq', faq);
  //     this.showSpinner = false;
  //   }, (error) => {
  //     this.logger.error('[CDS DSHBRD] - FAQ GET BY ID - ERROR ', error);
  //     this.showSpinner = false;
  //   }, () => {
  //     this.logger.log('[CDS DSHBRD] - FAQ GET BY ID - COMPLETE ');
  //     this.showSpinner = false;
  //     //this.translateTheAnswerWillBeDeleted();
  //   });
  // }

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
  //     this.logger.log("[CDS DSHBRD] - MOCK_getFaqIntents  this.intentSelected ", this.intentSelected)
  //   });
  // }

  // MOCK_getFaqIntent() {
  //   let url = 'assets/mock-data/tilebot/faq/intent.json';
  //   this.httpClient.get<Intent>(url).subscribe(data => {

  //     this.intentSelected = data;
  //     this.elementIntentSelected = {};
  //     this.elementIntentSelected['type'] = 'action';
  //     this.elementIntentSelected['element'] = this.intentSelected.actions[0];
  //     this.logger.log('MOCK_getFaqIntent', this.elementIntentSelected);
  //   });
  // }

  /** ADD INTENT  */
  private creatIntent() {
    this.logger.log('creatIntent');
    this.spinnerCreateIntent = true
    this.logger.log('[CDS DSHBRD] creatIntent spinnerCreateIntent ', this.spinnerCreateIntent)
    this.startUpdatedIntent.next(true)
    this.logger.log('creatIntent')
    this.showSpinner = true;
    let id_faq_kb = this.intentSelected.id_faq_kb;
    let questionIntentSelected = this.intentSelected.question;
    let answerIntentSelected = this.intentSelected.answer;
    let displayNameIntentSelected = this.intentSelected.intent_display_name;
    let formIntentSelected = this.intentSelected.form;
    this.logger.log('[CDS DSHBRD] creatIntent formIntentSelected ', formIntentSelected)
    let actionsIntentSelected = this.intentSelected.actions;
    this.logger.log('[CDS DSHBRD] creatIntent actionsIntentSelected ', actionsIntentSelected)
    let webhookEnabledIntentSelected = this.intentSelected.webhook_enabled;

    // const pendingClassName = 'loading-btn--pending';
    // const successClassName = 'loading-btn--success';
    // const failClassName = 'loading-btn--fail';
    const stateDuration = 1500;
    // const button = this.el.nativeElement.querySelector('#cds-save-intent-btn')

    //PENDING STATE
    // button.classList.add(pendingClassName)
    const that = this

    this.faqService.addIntent(
      this.id_faq_kb,
      questionIntentSelected,
      answerIntentSelected,
      displayNameIntentSelected,
      formIntentSelected,
      actionsIntentSelected,
      webhookEnabledIntentSelected
    ).subscribe((intent) => {

      // const pendingClassName = 'loading-btn--pending';
      // const successClassName = 'loading-btn--success';
      // const failClassName = 'loading-btn--fail';
      const stateDuration = 200;
      // const button = this.el.nativeElement.querySelector('#cds-save-intent-btn')

      this.showSpinner = false;
      this.logger.log('[CDS DSHBRD] creatIntent RES ', intent);
      if (intent) {

        //SUCCESS STATE
        setTimeout(() => {
          // if (button) {
          //   button.classList.remove(pendingClassName);
          //   button.classList.add(successClassName);
          // }
          window.setTimeout(() => {
            // if (button) {
            //   button.classList.remove(successClassName)
            // }
            this.logger.log('[CDS DSHBRD] HERE YES  ');
            //that.eventsSubject.next(intent);
            that.createIntent.next(intent);

          }, stateDuration);
        }, stateDuration);

      }
    }, (error) => {
      this.showSpinner = false;
      this.spinnerCreateIntent = false
      this.logger.log('[CDS DSHBRD] creatIntent ERROR spinnerCreateIntent ', this.spinnerCreateIntent)
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

      //FAIL STATE
      setTimeout(() => {
        // if (button) {
        //   button.classList.remove(pendingClassName);
        //   button.classList.add(failClassName);
        // }

        window.setTimeout(() => {
          // button.classList.remove(failClassName), stateDuration
        });
      }, stateDuration);

    }, () => {
      this.showSpinner = false;
      this.spinnerCreateIntent = true
      this.logger.log('[CDS DSHBRD] creatIntent COMPLETE spinnerCreateIntent ', this.spinnerCreateIntent)
      this.logger.log('[CDS DSHBRD] creatIntent * COMPLETE *');
      // =========== NOTIFY SUCCESS===========
      // this.notify.showWidgetStyleUpdateNotification(this.createFaqSuccessNoticationMsg, 2, 'done');
      // this.router.navigate(['project/' + this.project._id + '/bots/intents/' + this.id_faq_kb + "/" + this.botType]); 
    });

  }

  /** EDIT INTENT  */
  private editIntent() {
    this.logger.log('editIntent');
    this.startUpdatedIntent.next(true)
    this.logger.log('[CDS DSHBRD] editIntent intentSelected', this.intentSelected);
    this.showSpinner = true;
    let id = this.intentSelected.id;
    let questionIntentSelected = this.intentSelected.question;
    let answerIntentSelected = this.intentSelected.answer;
    let displayNameIntentSelected = this.intentSelected.intent_display_name;
    let formIntentSelected = {}
    if (this.intentSelected.form !== null) {
      formIntentSelected = this.intentSelected.form
    }
    this.logger.log('[CDS DSHBRD] editIntent formIntentSelected', formIntentSelected)
    let actionsIntentSelected = this.intentSelected.actions;
    let webhookEnabledIntentSelected = this.intentSelected.webhook_enabled;
    let id_faq_kb = this.intentSelected.id_faq_kb

    // const pendingClassName = 'loading-btn--pending';
    // const successClassName = 'loading-btn--success';
    // const failClassName = 'loading-btn--fail';
    const stateDuration = 200;
    // const button = this.el.nativeElement.querySelector('#cds-save-intent-btn')

    //PENDING STATE
    // button.classList.add(pendingClassName)
    const that = this


    this.faqService.updateIntent(
      id,
      questionIntentSelected,
      answerIntentSelected,
      displayNameIntentSelected,
      formIntentSelected,
      actionsIntentSelected,
      webhookEnabledIntentSelected,
      id_faq_kb
    ).subscribe((upadatedIntent) => {
      this.showSpinner = false;
      this.logger.log('[CDS DSHBRD] editIntent - RES upadatedIntent', upadatedIntent);
      if (upadatedIntent) {
        //SUCCESS STATE
        setTimeout(() => {
          // button.classList.remove(pendingClassName);
          // button.classList.add(successClassName);
          window.setTimeout(() => {
            // button.classList.remove(successClassName)
            that.upadatedIntent.next(upadatedIntent);
          }, stateDuration);
        }, stateDuration);
      }
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

      //FAIL STATE
      setTimeout(() => {
        // button.classList.remove(pendingClassName);
        // button.classList.add(failClassName);
        // window.setTimeout(() => button.classList.remove(failClassName), stateDuration);
      }, stateDuration);

    }, () => {
      this.showSpinner = false;
      this.logger.log('[CDS DSHBRD] UPDATE FAQ * COMPLETE *');
      // =========== NOTIFY SUCCESS===========
      // this.notify.showWidgetStyleUpdateNotification(this.editFaqSuccessNoticationMsg, 2, 'done');
    });
  }


  // EVENTS //

  /** SIDEBAR OUTPUT EVENTS */
  onClickItemList(event: string) {
    this.logger.log('[CDS DSHBRD] active section-->', event)
    this.activeSidebarSection = event;
  }

  toggleSidebarWith(IS_OPEN) {
    // this.logger.log('[SETTINGS-SIDEBAR] IS_OPEN ', IS_OPEN)
    this.IS_OPEN = IS_OPEN;
  }


  /** Go back to previous page */
  goBack() {
    // this.router.navigate(['project/' + this.project._id + '/bots/my-chatbots/all']);
    if (this.calledby === "home") {
      this.router.navigate(['project/' + this.project._id + '/home']);
    } else {
      this.router.navigate(['project/' + this.project._id + '/bots/my-chatbots/all']);
    }
    this.hideShowWidget('show')
  }




  /** START EVENTS PANEL ACTIONS */
  onAddNewAction(action){
    this.logger.log('[CDS DSBRD] onAddNewAction ', action)
    this.isOpenActionDrawer = false;
    this.intentSelected.actions.push(action);
    let maxLength = this.intentSelected.actions.length;
    let index = maxLength-1;
    let intent_display_name = 'action_'+index;
    let event = { action: action, index: index, maxLength: maxLength, intent_display_name: intent_display_name };
    this.logger.log('onAddNewAction', event);
    this.idElementOfIntentSelected = intent_display_name;
    this.actionSelected(event);
  }
  /** END EVENTS PANEL ACTIONS */




  /** START EVENTS PANEL INTENT */
  onOpenActionDrawer(_isOpenActioDrawer: boolean) {
    this.logger.log('[CDS DSBRD] onOpenActionDrawer - isOpenActioDrawer ', _isOpenActioDrawer)
    this.isOpenActionDrawer = _isOpenActioDrawer;
  }

  onDropAction(actions){
    this.intentSelected.actions = actions;
    this.saveIntent(this.intentSelected);
  }

  onAnswerSelected(answer: string) {
    this.logger.log('[CDS DSBRD] onAnswerSelected - answer ', answer)
    this.elementIntentSelected = {};
    this.elementIntentSelected['type'] = TYPE_INTENT_ELEMENT.ANSWER;
    this.elementIntentSelected['element'] = answer
    this.isIntentElementSelected = true;
  }

  onActionSelected(event: { action: Action, index: number, maxLength: number, intent_display_name: string }) {
    this.actionSelected(event);
  }

  onQuestionSelected(intent) {
    this.logger.log('[CDS DSBRD] onQuestionSelected from PANEL INTENT - intent ', intent)
    this.elementIntentSelected = {};
    this.elementIntentSelected['type'] = TYPE_INTENT_ELEMENT.QUESTION;
    this.elementIntentSelected['element'] = intent
    this.logger.log('[CDS DSBRD] onQuestionSelected from PANEL INTENT - this.elementIntentSelected ', this.elementIntentSelected)
    this.isIntentElementSelected = true;
  }

  onIntentFormSelected(intentform: Form) {
    this.logger.log('[CDS DSBRD] onIntentFormSelected - from PANEL INTENT intentform ', intentform)
    this.elementIntentSelected = {};
    this.elementIntentSelected['type'] = TYPE_INTENT_ELEMENT.FORM;
    this.elementIntentSelected['element'] = intentform
    this.logger.log('[CDS DSBRD] onIntentFormSelected - from PANEL INTENT - this.elementIntentSelected ', this.elementIntentSelected)
    this.isIntentElementSelected = true;
  }

  onActionDeleted(event) {
    this.logger.log('[CDS DSBRD] onActionDeleted - from PANEL INTENT event ', event)
    this.elementIntentSelected = {};
    this.elementIntentSelected['type'] = ''
    this.elementIntentSelected['element'] = null
    this.editIntent();
  }
  /** END EVENTS PANEL INTENT */




  /** START EVENTS PANEL INTENT LIST */
  onSelectIntent(intent: Intent) { 
    this.logger.log('onSelectIntent::: ', intent);
    this.EDIT_VIEW = true;
    this.intentSelected = intent;
    this.isIntentElementSelected = false;
    // this.MOCK_getFaqIntent();
    this.logger.log("[CDS DSHBRD]  onSelectIntent - intentSelected: ", this.intentSelected);
    this.logger.log("[CDS DSHBRD]  onSelectIntent - intentSelected: ", intent);
    this.logger.log("[CDS DSHBRD]  onSelectIntent - intentSelected > actions: ", this.intentSelected.actions);
    this.logger.log("[CDS DSHBRD]  onSelectIntent - intentSelected > actions length: ", this.intentSelected.actions.length);
    if (this.intentSelected.actions && this.intentSelected.actions.length > 0) {
      this.logger.log('[CDS DSBRD] onSelectIntent elementIntentSelected Exist actions', this.intentSelected.actions[0]);
      // this.onActionSelected({ action: this.intentSelected.actions[0], index: 0, maxLength: 1, intent_display_name: this.intentSelected.intent_display_name })
    } else {
      this.elementIntentSelected = {};
      this.elementIntentSelected['type'] = ''
      this.elementIntentSelected['element'] = null
    }
    this.logger.log('[CDS DSBRD] onSelectIntent elementIntentSelected', this.elementIntentSelected)
  }

  onReturnListOfIntents(intents) {
    this.listOfIntents = intents;
    this.listOfActions = intents.map(a => {
      if (a.intent_display_name.trim() === 'start') {
        return { name: a.intent_display_name, value: '#' + a.intent_id, icon: 'rocket_launch' }
      } else if (a.intent_display_name.trim() === 'defaultFallback') {
        return { name: a.intent_display_name, value: '#' + a.intent_id, icon: 'undo' }
      } else {
        return { name: a.intent_display_name, value: '#' + a.intent_id, icon: 'label_important_outline' }
      }
    });
    this.logger.log('[CDS DSHBRD]  onReturnListOfIntents: listOfActions', this.listOfActions);
    this.logger.log('[CDS DSHBRD]  onReturnListOfIntents: listOfIntents', this.listOfIntents);
  }

  onCreateIntentBtnClicked() {
    this.CREATE_VIEW = true;
    this.logger.log('[CDS DSBRD] addNewIntent  ')
    this.intentSelected = new Intent();
    let action = new ActionReply();
    let commandWait = new Command(TYPE_COMMAND.WAIT);
    action.attributes.commands.push(commandWait);
    let command = new Command(TYPE_COMMAND.MESSAGE);
    command.message = new Message('text', 'A chat message will be sent to the visitor');
    action.text = command.message.text; //Set default reply global text
    action.attributes.commands.push(command);
    this.intentSelected.actions.push(action)
    this.logger.log('[CDS DSBRD] addNewIntent intentSelected ', this.intentSelected)
    this.elementIntentSelected = {};
    this.elementIntentSelected['type'] = ''
    this.elementIntentSelected['element'] = null
  }

  onDeleteSelectedIntent() {
    this.logger.log('[CDS DSBRD] onDeleteSelectedIntent  ')
    this.intentSelected = null;
    this.elementIntentSelected = {};
    this.elementIntentSelected['type'] = ''
    this.elementIntentSelected['element'] = null
  }
  /** END EVENTS PANEL INTENT LIST */




  /** START EVENTS SPLASH SCREEN */
  onAddIntentFromSplashScreen(hasClickedAddNewIntent) {
    this.logger.log('[CDS DSBRD] onAddIntentFromSplashScreen hasClickedAddNewIntent ', hasClickedAddNewIntent)
    this.newIntentFromSplashScreen.next(hasClickedAddNewIntent)
  }
  /** END EVENTS SPLASH SCREEN  */



  
  /** START EVENTS INTENT HEADER */
  onSaveIntent(intent: Intent) {
    this.saveIntent(intent);
  }
  /** END EVENTS INTENT HEADER  */



   
  /** START EVENTS PANEL INTENT DETAIL */
  onCloseAndSavePanelIntentDetail(intentSelected: any){
    if(intentSelected && intentSelected != null){
      this.onSaveIntent(intentSelected);
      this.isIntentElementSelected = false;
    } else {
      this.onOpenDialog();
    }
    // this.isIntentElementSelected = false;
  }

  onClickedInsidePanelIntentDetail(){
    this.isClickedInsidePanelIntentDetail = true;
  }

  onClickPanelIntentDetail(){
    // console.log('dismiss panel intent detail', this.isClickedInsidePanelIntentDetail);
    if(this.isClickedInsidePanelIntentDetail === false){
      // this.isIntentElementSelected = false;
      this.onOpenDialog();
    } else {
      this.isClickedInsidePanelIntentDetail = false;
    }
  }

  onOpenDialog() { 
    var that = this;
    const dialogRef = this.dialog.open(DialogYesNoComponent, {
      panelClass: 'custom-dialog-container',
      data: {title: 'Unsaved changes', text:'Are you sure you want to leave without saving your changes?', yes:'Leave', no:'Cancel'}
    });
    dialogRef.afterClosed().subscribe(result => {
      // console.log(`Dialog result: ${result}`);
      this.idElementOfIntentSelected = null;
      if(result && result !== undefined && result !== false){
        that.isIntentElementSelected = false;
      } else {
        that.isIntentElementSelected = true;
      }
      this.logger.log('afterClosed:: ', this.idElementOfIntentSelected);
    });
  }
  /** END EVENTS PANEL INTENT DETAIL  */

  
  

  /** STAR CUSTOM FUNCTIONS */
  private saveIntent(intent: Intent){
    this.logger.log("Intent:", intent);
    this.logger.log('[CDS DSHBRD] onSaveIntent intent:: ', intent);
    this.logger.log('[CDS DSHBRD] listOfIntents :: ', this.listOfIntents);
    this.intentSelected = intent;
    const intentNameAlreadyCreated = this.listOfIntents.some((el) => {
      return el.id === this.intentSelected.id;
    });
    this.logger.log('[CDS DSHBRD]  intent name already saved', intentNameAlreadyCreated);
    if (this.CREATE_VIEW && !intentNameAlreadyCreated) {
      this.creatIntent();
    } else if (this.EDIT_VIEW) {
      this.editIntent();
    }
  }

  private actionSelected(event){
    this.logger.log('[CDS DSBRD] -----> actionSelected: ',event);
    this.logger.log('[CDS DSBRD] onActionSelected from PANEL INTENT - action ', event.action, event.index)
    this.elementIntentSelected = {};
    this.elementIntentSelected['type'] = TYPE_INTENT_ELEMENT.ACTION;
    this.elementIntentSelected['element'] = event.action
    this.elementIntentSelected['index'] = event.index
    this.elementIntentSelected['maxLength'] = event.maxLength
    this.elementIntentSelected['intent_display_name'] = event.intent_display_name
    this.isIntentElementSelected = true;
    this.logger.log('[CDS DSBRD] onActionSelected from PANEL INTENT - this.elementIntentSelected ', this.elementIntentSelected)
  }

  /** END CUSTOM FUNCTIONS */

  // onChangeIntentName(event) {
  //   this.logger.log('[CDS DSBRD] onChangeIntentName  event', event)
  //   this.newIntentName = event
  // }

  publish() {
    this.faqKbService.publish(this.selectedChatbot).subscribe((data) => {
      this.logger.log('[CDS DSBRD] publish  - RES ', data)
    }, (error) => {

      this.logger.error('[CDS DSBRD] publish ERROR ', error);
    }, () => {
      this.logger.log('[CDS DSBRD] publish * COMPLETE *');
      this.notify.showWidgetStyleUpdateNotification('Successfully published', 2, 'done');

      this.getBotById(this.id_faq_kb)

    });
    if (this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT === true) {
      this.present_modal_attacch_bot_to_dept()
      // } else {

    }
  }

  present_modal_attacch_bot_to_dept() {
    this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT = false
    this.displayModalAttacchBotToDept = 'block'

  }

  onCloseModalAttacchBotToDept() {
    this.displayModalAttacchBotToDept = 'none'
  }

  getDeptsByProjectId() {
    this.departmentService.getDeptsByProjectId().subscribe((departments: any) => {
      this.logger.log('[CDS DSBRD] - DEPT GET DEPTS ', departments);
      this.logger.log('[CDS DSBRD] - DEPT BOT ID ', this.id_faq_kb);

      if (departments) {

        departments.forEach((dept: any) => {
          // this.logger.log('[CDS DSBRD] - DEPT', dept);
          if (dept.default === true) {
            this.defaultDepartmentId = dept._id;
            this.logger.log('[CDS DSBRD] - DEFAULT DEPT ID ', this.defaultDepartmentId);
          }
        })

        const depts_length = departments.length
        this.logger.log('[CDS DSBRD] ---> GET DEPTS DEPTS LENGHT ', depts_length);

        if (depts_length === 1) {
          this.DISPLAY_SELECT_DEPTS_WITHOUT_BOT = false
          this.dept_id = departments[0]['_id']

          this.logger.log('[CDS DSBRD]  --->  DEFAULT DEPT HAS BOT ', departments[0].hasBot);
          if (departments[0].hasBot === true) {

            this.logger.log('[CDS DSBRD] --->  DEFAULT DEPT HAS BOT ');
            // this.DISPLAY_BTN_ACTIVATE_BOT_FOR_NEW_CONV = false;
            // this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT = false
            // this.logger.log('Bot Create --->  DEFAULT DEPT HAS BOT DISPLAY_BTN_ACTIVATE_BOT_FOR_NEW_CONV ', this.DISPLAY_BTN_ACTIVATE_BOT_FOR_NEW_CONV);
            this.logger.log('[CDS DSBRD] --->  DEFAULT DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);
          } else {
            this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT = true;
            this.logger.log('[CDS DSBRD] --->  DEFAULT DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);
          }
        }

        if (depts_length > 1) {
          this.DISPLAY_SELECT_DEPTS_WITHOUT_BOT = true;
          departments.forEach(dept => {

            if (dept.hasBot === true) {
              this.logger.log('[CDS DSBRD] --->  DEPT HAS BOT ');
              this.logger.log('[CDS DSBRD] --->  DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);
            } else {

              this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT = true;

              this.logger.log('[CDS DSBRD] --->  DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);

              this.depts_without_bot_array.push({ id: dept._id, name: dept.name })
            }

          });

          this.logger.log('[CDS DSBRD] --->  DEPT ARRAY OF DEPT WITHOUT BOT ', this.depts_without_bot_array);
        }

      }
    }, error => {
      this.logger.error('[CDS DSBRD] - DEPT - GET DEPTS  - ERROR', error);
    }, () => {
      this.logger.log('[CDS DSBRD] - DEPT - GET DEPTS - COMPLETE')
    });
  }

  onSelectBotId() {
    this.logger.log('[CDS DSBRD] --->  onSelectBotId ', this.selected_bot_id);
    this.dept_id = this.selected_bot_id
    const hasFound = this.depts_without_bot_array.filter((obj: any) => {
      return obj.id === this.selected_bot_id;
    });
    this.logger.log('[CDS DSBRD]  onSelectBotId found', hasFound);

    if (hasFound.length > 0) {
      this.selected_bot_name = hasFound[0]['name']
    }
  }

  hookBotToDept() {
    this.HAS_CLICKED_HOOK_BOOT_TO_DEPT = true;
    this.departmentService.updateExistingDeptWithSelectedBot(this.dept_id, this.selectedChatbot._id).subscribe((res) => {
      this.logger.log('[BOT-CREATE] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - RES ', res);
    }, (error) => {
      this.logger.error('[BOT-CREATE] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - ERROR ', error);

      this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT = true
      this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT_ERROR = true;

      this.logger.error('[BOT-CREATE] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - ERROR - HAS_COMPLETED_HOOK_BOOT_TO_DEPT', this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT);
    }, () => {
      this.logger.log('[BOT-CREATE] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - COMPLETE ');

      this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT = true
      this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT_SUCCESS = true;
      this.logger.log('[BOT-CREATE] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - COMPLETE - HAS_COMPLETED_HOOK_BOOT_TO_DEPT', this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT);
    });
  }

  getTestSiteUrl() {
    this.TESTSITE_BASE_URL = this.appConfigService.getConfig().WIDGET_BASE_URL + 'assets/twp/index.html';
    this.logger.log('[CDS DSBRD] AppConfigService getAppConfig TESTSITE_BASE_URL', this.TESTSITE_BASE_URL);
  }

  openTestSiteInPopupWindow() {
    const testItOutBaseUrl = this.TESTSITE_BASE_URL.substring(0, this.TESTSITE_BASE_URL.lastIndexOf('/'));
    const testItOutUrl = testItOutBaseUrl + '/chatbot-panel.html'

    const url = testItOutUrl + '?tiledesk_projectid=' + this.project._id + '&tiledesk_participants=bot_' + this.id_faq_kb + "&tiledesk_departmentID=" + this.defaultDepartmentId + '&td_draft=true'

    let params = `toolbar=no,menubar=no,width=815,height=727,left=100,top=100`;
    window.open(url, '_blank', params);
  }

  openWhatsappPage() {
    let tiledesk_phone_number = this.appConfigService.getConfig().tiledeskPhoneNumber;

    let info = {
      project_id: this.projectID,
      bot_id: this.selectedChatbot._id
    }

    this.logger.log("--> info: ", info)

    this.multichannelService.getCodeForWhatsappTest(info).then((response: any) => {
      this.logger.log("--> testing code from whatsapp: ", response);
      // let code = "%23td" + response.short_uid;
      let text = "%23td" + response.short_uid + " Send me to start testing your bot";
      const testItOutOnWhatsappUrl = `https://api.whatsapp.com/send/?phone=${tiledesk_phone_number}&text=${text}&type=phone_number&app_absent=0`
      window.open(testItOutOnWhatsappUrl, 'blank');
    }).catch((err) => {
      this.logger.error("--> error getting testing code from whatsapp: ", err);
    })
  }


  subscribeToChatbotAI(){
    this.wsChatbotService.wsChatbotTraining$.subscribe((train)=>{
      this.logger.log('[CDS DSBRD] TRAIN CHATBOT--> ',train)
    })
  }

  
  diplayPopup() {
    const hasClosedPopup = this.usersLocalDbService.getFromStorage('hasclosedcdspopup')
    this.logger.log('[CDS DSBRD] hasClosedPopup', hasClosedPopup)
    if (hasClosedPopup === null) {
      this.popup_visibility = 'block'
      this.logger.log('[CDS DSBRD] popup_visibility', this.popup_visibility)
    }
    if (hasClosedPopup === 'true') {
      this.popup_visibility = 'none'
    }
  }
  closeRemenberToPublishPopup() {
    this.logger.log('[CDS DSBRD] closeRemenberToPublishPopup')
    this.usersLocalDbService.setInStorage('hasclosedcdspopup', 'true')
    this.popup_visibility = 'none'
  }

  onGoToCommunity(){
    // console.log('2 onGoToCommunity:: ', EXTERNAL_URL.getchatbotinfo+this.selectedChatbot._id);
    let url = EXTERNAL_URL.getchatbotinfo+this.selectedChatbot._id; //"https://tiledesk.com/community/getchatbotinfo/chatbotId/63e284400856170019a908e6";
    window.open(url, "_blank");
  }


}
