import { TYPE_ACTION, variableList } from 'app/chatbot-design-studio/utils';
import { Subscription } from 'rxjs';
// import { MultichannelService } from 'app/services/multichannel.service';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
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
import { Intent, Button, Action, Form, ActionReply, Command, Message, ActionAssignVariable, Attributes } from '../../models/intent-model';
import { TYPE_COMMAND, TYPE_INTENT_ELEMENT, EXTERNAL_URL, TYPE_MESSAGE, TIME_WAIT_DEFAULT, convertJsonToArray } from '../utils';
import { Subject } from 'rxjs';
import { FaqKbService } from 'app/services/faq-kb.service';
import { Chatbot } from 'app/models/faq_kb-model';
// import { AppConfigService } from 'app/services/app-config.service';
// import { DepartmentService } from 'app/services/department.service';
// import { CdsPublishOnCommunityModalComponent } from './cds-publish-on-community-modal/cds-publish-on-community-modal.component';
// import { NotifyService } from 'app/core/notify.service';
// import { LocalDbService } from 'app/services/users-local-db.service';

import { DialogYesNoComponent } from 'app/chatbot-design-studio/cds-base-element/dialog-yes-no/dialog-yes-no.component';
import { MatDialog } from '@angular/material/dialog';
import { DragDropService } from 'app/chatbot-design-studio/services/drag-drop.service';
import { IntentService } from 'app/chatbot-design-studio/services/intent.service';
import { ControllerService } from 'app/chatbot-design-studio/services/controller.service';

// import { Subscription } from 'rxjs';
import { TiledeskStage } from 'assets/cds/js/tiledesk-stage.js';
import { TiledeskConnectors } from 'app/../assets/cds/js/tiledesk-connectors.js';

const swal = require('sweetalert');


// declare function setDrawer(el, drawer);
// declare function setDragElement(el);

@Component({
  selector: 'appdashboard-cds-dashboard',
  templateUrl: './cds-dashboard.component.html',
  styleUrls: ['./cds-dashboard.component.scss']
})
export class CdsDashboardComponent implements OnInit {


  @ViewChild('receiver_elements_dropped_on_stage') receiverElementsDroppedOnStage: ElementRef;
  @ViewChild('drawer_of_items_to_zoom_and_drag') drawerOfItemsToZoomAndDrag: ElementRef;
  private subscriptionListOfIntents: Subscription;
  // @Input() listOfIntents: Intent[] = [];

  updatePanelIntentList: boolean = true;
  listOfIntents: Array<Intent> = [];
  // updatedConnector: Array<any> = [];
  connector: any;
  connectors: any = {};

  intentStart: Intent;
  intentDefaultFallback: Intent;


  idElementOfIntentSelected: string;
  intentSelected: Intent;
  elementIntentSelected: any;


  listOfActions: Array<{ name: string, value: string, icon?: string }>;
  listOfVariables: { userDefined: Array<any>, systemDefined: Array<any> };
  
  newIntentName: string;

  CREATE_VIEW = false;
  EDIT_VIEW = false;
  showSpinner = false;
  isIntentElementSelected: boolean = false;
  isClickedInsidePanelIntentDetail: boolean = false;
  id_faq_kb: string;
 


  id_faq: string;
  botType: string;
  intent_id: string;

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
  // public defaultDepartmentId: string;
  // public_Key: string;
  // TRY_ON_WA: boolean;

  // Attach bot to dept
  dept_id: string;
  // DISPLAY_SELECT_DEPTS_WITHOUT_BOT: boolean;
  // PRESENTS_MODAL_ATTACH_BOT_TO_DEPT: boolean = false;
  // depts_without_bot_array = [];
  // selected_bot_id: string;
  // selected_bot_name: string;
  // HAS_CLICKED_HOOK_BOOT_TO_DEPT: boolean = false;
  // HAS_COMPLETED_HOOK_BOOT_TO_DEPT: boolean = false;
  // HAS_COMPLETED_HOOK_BOOT_TO_DEPT_SUCCESS: boolean = false;
  // HAS_COMPLETED_HOOK_BOOT_TO_DEPT_ERROR: boolean = false;
  translateparamBotName: any;

  
  isOpenPanelDetail: boolean = false;
  elementInDetailPanel: any;


  isOpenPanelActions: boolean = true;
  positionPanelActions: any;



  dashboardAttributes: any = {};
  // popup_visibility: string = 'none'


  
  TiledeskStage: any; 
  tiledeskConnectors: any;
  isOpenFloatMenu: boolean = false;
  positionFloatMenu: any = {'x':0, 'y':0};
  connectorDraft: any = {};

  // isBetaUrl: boolean;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private faqService: FaqService,
    private auth: AuthService,
    public location: Location,
    private logger: LoggerService,
    private dragDropService:DragDropService,
    private intentService: IntentService,
    private controllerService: ControllerService,
    private httpClient: HttpClient,
    private faqKbService: FaqKbService,
    // public appConfigService: AppConfigService,
    // private departmentService: DepartmentService,
    // private multichannelService: MultichannelService,
    private el: ElementRef,
    public dialog: MatDialog,
    private translate: TranslateService,
    // private notify: NotifyService,
    // public usersLocalDbService: LocalDbService,
  ) { 
    this.subscriptionListOfIntents = this.intentService.getIntents().subscribe(value => {
      console.log("subscriptionListOfIntents********** ", value);
      this.updatePanelIntentList = !this.updatePanelIntentList;
      this.listOfIntents = value;
      this.intentService.setListOfActions(this.listOfIntents);
      this.listOfActions = this.intentService.getListOfActions();
    });

    this.controllerService.isOpenButtonPanel$.subscribe((button: Button) => {
      this.elementInDetailPanel = button;
      if(button){
        this.isOpenPanelDetail = true;
      } else {
        this.isOpenPanelDetail = false;
      }
    });

    
    
  } 


  // SYSTEM FUNCTIONS //
  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    this.dashboardAttributes = this.intentService.getDashboardAttributes();
    console.log('dashboardAttributes::: ', this.dashboardAttributes);
    if(this.dashboardAttributes.connectors){
      this.connectors = this.dashboardAttributes.connectors;
    }
    this.executeTailAsyncFunctions();
  }


  ngAfterViewInit(){
    console.log('ngAfterViewInit -------------> ');
    this.TiledeskStage = new TiledeskStage('tds_container', 'tds_drawer', 'tds_draggable');
    this.setDragConfig();
    this.hideShowWidget('show');

    this.tiledeskConnectors = new TiledeskConnectors("tds_drawer", {"input_block": "tds_input_block"}, this.connectors);
    this.tiledeskConnectors.mousedown(document);


    document.addEventListener(
      "moved-and-scaled", (e:CustomEvent) => {
        // console.log("event:", e);
        this.tiledeskConnectors.scale = e.detail.scale;
        this.tiledeskConnectors.removeConnectorDraft();
        this.isOpenFloatMenu = false;
        // console.log("changing connectors scale:", this.tiledeskConnectors.scale);
      },
      false
    );


    document.addEventListener(
      "dragged", (e:CustomEvent) => {
        // console.log("event:", e);
        const el = e.detail.element;
        const x = e.detail.x;
        const y = e.detail.y;
        this.tiledeskConnectors.moved(el, x, y);
        // console.log("changing connectors dragged:", this.tiledeskConnectors.scale);
      },
      false
    );

    document.addEventListener(
      "connector-draft-released", (e:CustomEvent) => {
        console.log("connector-draft-released:", e);
        if (e.detail.target.classList.contains("tds_container")) {
          console.log("connector-draft-released event, catched on 'stage'");
          // this.tiledeskConnectors.removeConnectorDraft();
        }
        else {
          // console.log("connector-draft-released event, catched but unsupported", e.detail);
          this.positionFloatMenu = this.TiledeskStage.physicPointCorrector(e.detail.menuPoint);
          this.isOpenFloatMenu = true;
          this.connectorDraft = {
            fromId: e.detail.fromId,
            fromPoint: e.detail.fromPoint,
            toPoint: e.detail.toPoint,
            menuPoint: this.positionFloatMenu,
            target: e.detail.target
          }
          // this.tiledeskConnectors.removeConnectorDraft();
          console.log('OPEN MENU', this.connectorDraft);
        }
      },
      true
    );




    document.addEventListener(
      "connector-created", (e:CustomEvent) => {
        console.log("connector-created:", e);
        this.connector = e.detail.connector;
        console.log("connector-created:", this.connector);
        this.connectors[this.connector.id] = this.connector;
        console.log("connector-created:", this.connectors);
        this.dashboardAttributes['connectors'] = this.connectors;
        console.log("connector-created:", this.dashboardAttributes);
        this.intentService.setDashboardAttributes(this.dashboardAttributes);
      },
      true
    );


    document.addEventListener(
      "connector-deleted", (e:CustomEvent) => {
        console.log("connector-deleted:", e);
        this.connector = e.detail.connector;
        this.connector['deleted'] = true;
        console.log("connector-deleted:", this.connector);
        delete this.connectors[this.connector.id];
        console.log("connector-deleted:", this.connectors);
        this.dashboardAttributes['connectors'] = this.connectors;
        console.log("connector-deleted:", this.dashboardAttributes);
        this.intentService.setDashboardAttributes(this.dashboardAttributes);
      },
      true
    );
    

  }


  

  setListOfActions(){
    this.listOfActions = this.listOfIntents.map(a => {
      if (a.intent_display_name.trim() === 'start') {
        return { name: a.intent_display_name, value: '#' + a.intent_id, icon: 'rocket_launch' }
      } else if (a.intent_display_name.trim() === 'defaultFallback') {
        return { name: a.intent_display_name, value: '#' + a.intent_id, icon: 'undo' }
      } else {
        return { name: a.intent_display_name, value: '#' + a.intent_id, icon: 'label_important_outline' }
      }
    });
    console.log('this.listOfActions: ', this.listOfActions);
  }



  // ngOnChanges(changes: SimpleChanges) {
  //   console.log('ngOnChanges:: cds-dashboard');
  //   if (changes.listOfIntents) {
  //     const newValue = changes.listOfIntents.currentValue;
  //     // Aggiorna il valore della variabile e reagisci di conseguenza
  //     console.log('Nuovo valore:', newValue);
  //   }
  // }


  ngOnDestroy() {
    this.subscriptionListOfIntents.unsubscribe();
  }



  
  async executeTailAsyncFunctions() {
    // Le funzioni asincrone sono state eseguite in coda
    try {
      const GetTranslations = await this.getTranslations();
      console.log('Risultato 1:', GetTranslations);
      const GetUrlParams = await this.getUrlParams();
      console.log('Risultato 2:', GetUrlParams, this.id_faq_kb);
      if (this.id_faq_kb) {
        const GetBotById = await this.getBotById(this.id_faq_kb);
        console.log('Risultato 3:', GetBotById);
      }
      const getCurrentProject = await this.getCurrentProject();
      console.log('Risultato 4:', getCurrentProject);
      const getBrowserVersion = await this.getBrowserVersion();
      console.log('Risultato 5:', getBrowserVersion);
      const getAllIntents = await this.intentService.getAllIntents(this.id_faq_kb);
      console.log('Risultato 6: getAllIntents', getAllIntents );
      if(getAllIntents){
        // !!! il valore di listOfIntents è bindato nel costructor con subscriptionListOfIntents !!! //
        setTimeout(() => {
          this.setDragAndListnerEventToElements();
        }, 1000);
      }
      // this.setDragConfig();
    } catch (errore) {
      console.log('Si è verificato un errore:', errore);
      console.error('Si è verificato un errore:', errore);
    }
  }
  

  



  // CUSTOM FUNCTIONS //

  /** GET TRANSLATIONS */
  private async getTranslations(): Promise<boolean> { 
    return new Promise((resolve, reject) => {
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
      resolve(true);
    });
  }

  /** 
   * GET FROM ROUTE PARAMS (PASSED FROM FAQ COMPONENT):
   * THE FAQ ID - WHEN THE CALLBACK IS COMPLETED RUN GET-FAQ-BY-ID THAT RETURN THE OBJECT FAQ
   * AND THE FAQ KB ID (THEN USED IN THE GOBACK)
  */
  private async getUrlParams(): Promise<boolean> { 
    return new Promise((resolve, reject) => {
      this.route.params.subscribe((params) => {
        this.id_faq_kb = params.faqkbid;
        // if (this.id_faq_kb) {
        //   this.getBotById(this.id_faq_kb);
        // }
        this.id_faq = params.faqid;
        this.botType = params.bottype;
        this.intent_id = params.intent_id;
        this.logger.log('[CDS DSHBRD] getUrlParams  PARAMS', params);
        this.logger.log('[CDS DSHBRD] getUrlParams  BOT ID ', this.id_faq_kb);
        this.logger.log('[CDS DSHBRD] getUrlParams  FAQ ID ', this.id_faq);
        this.logger.log('[CDS DSHBRD] getUrlParams  FAQ ID ', this.intent_id);
        console.log('ok: funzioneAsincrona2');
        resolve(true);
      }, (error) => {
        this.logger.error('ERROR: ', error);
        // console.log('error: funzioneAsincrona2');
        reject(false);
      }, () => {
        this.logger.log('COMPLETE');
        // console.log('end: funzioneAsincrona2');
      });
    });
  }

  /** GET BOT BY ID */
  private async getBotById(botid: string): Promise<boolean> { 
    return new Promise((resolve, reject) => {
      this.showSpinner = true;
      this.faqKbService.getBotById(botid).subscribe((chatbot: Chatbot) => {
        // console.log('[CDS DSHBRD] - GET BOT BY ID RES - chatbot', chatbot);
        if (chatbot) {
          this.selectedChatbot = chatbot;
          this.translateparamBotName = { bot_name: this.selectedChatbot.name }
          if (this.selectedChatbot && this.selectedChatbot.attributes) {
            variableList.userDefined = convertJsonToArray(this.selectedChatbot.attributes.variables);
          }
          // console.log('ok: funzioneAsincrona3');
          resolve(true);
          //console.log('variableList.userDefined:: ', this.selectedChatbot.attributes.variables);
        }
      }, (error) => {
        this.logger.error('ERROR: ', error);
        // console.log('ERROR: funzioneAsincrona3');
        reject(false);
      }, () => {
        this.logger.log('COMPLETE ');
        // console.log('COMPLETE: funzioneAsincrona3');
        resolve(true);
      });
    });
  }



  /** hideShowWidget */
  private hideShowWidget(status: "hide" | "show") {
    try {
      if (window && window['tiledesk']) {
        this.logger.log('[CDS DSHBRD] HIDE WIDGET ', window['tiledesk'])
        if (status === 'hide') {
          window['tiledesk'].hide();
        } else if (status === 'show') {
          window['tiledesk'].show();
        }
      }
    } catch (error) {
      this.logger.error('tiledesk_widget_hide ERROR', error)
    }
  }


  /** getCurrentProject */
  private async getCurrentProject(): Promise<boolean> { 
    return new Promise((resolve, reject) => {
      this.auth.project_bs.subscribe((project) => {
        if (project) {
          this.project = project;
          this.projectID = project._id;
        }
        resolve(true);
      }, (error) => {
        this.logger.error('ERROR: ', error);
        reject(false);
      }, () => {
        this.logger.log('COMPLETE ');
        resolve(true);
      });
    });
  }

  /** getBrowserVersion */
  private async getBrowserVersion(): Promise<boolean> { 
    return new Promise((resolve, reject) => {
      this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
        this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
        resolve(true);
      }, (error) => {
        this.logger.error('ERROR: ', error);
        reject(false);
      }, () => {
        this.logger.log('COMPLETE ');
        resolve(true);
      });
    });
  }
  // END CUSTOM FUNCTIONS //




  /** ************************* **/
  /** START DRAG DROP FUNCTIONS 
  /** ************************* **/

  /**  setDragConfig */
  private setDragConfig(){
    this.TiledeskStage.setDrawer();
    // const container = document.querySelector('#tds_container');
    // const drawer = document.querySelector('#tds_drawer');
    // console.log('getElementById:: drawer',container,  drawer);
    // setDrawer(container, drawer);
  }

  private setDragAndListnerEvent(intent){
    let that = this;
    if(intent.id){
        try {
          setTimeout(() => {
            // this.TiledeskStage.setDragElement(intent.id);
            let elem = document.getElementById(intent.id);
            // setDragElement(elem);
            this.TiledeskStage.setDragElement(intent.id);
            // **************** !!!!!!!! aggiungo listner !!!!!!! *******************//
            elem.removeEventListener('mouseup', function() {
              that.onMouseUp(intent, elem);
            });
            // Aggiungi l'event listener con i parametri
            elem.addEventListener('mouseup', function() {
              that.onMouseUp(intent, elem);
            });
            // Rimuovi l'event listener con i parametri
            elem.removeEventListener('mousedown', function() {
              that.onMouseDown(elem);
            });
            // Aggiungi l'event listener con i parametri
            elem.addEventListener('mousedown', function() {
              that.onMouseDown(elem);
            });
            // Rimuovi l'event listener con i parametri
            elem.removeEventListener('mousemove', function() {
              that.onMouseMove(elem);
            });
            // Aggiungi l'event listener con i parametri
            elem.addEventListener('mousemove', function() {
              that.onMouseMove(elem);
            });
          }, 500);
        } catch (error) {
          console.error('ERROR', error);
        }
    }
  }

  /** setDragAndListnerEventToElements */
  private setDragAndListnerEventToElements(){
    this.listOfIntents.forEach(intent => {
      // console.log('SET -----> ', intent);
      this.setDragAndListnerEvent(intent);
    });
  }

  onMouseDown(element){
    const x = element.offsetLeft; 
    const y = element.offsetTop; 
    element.style.zIndex = 2;
    console.log("CHIAMA ON mouseDown x:", x, " y: ",y);
  }

  onMouseUp(intent, element){
    // const x = element.offsetLeft; 
    // const y = element.offsetTop; 
    
    let newPos = {'x':element.offsetLeft, 'y':element.offsetTop};
    console.log("onMouseUp x:", newPos.x, " y: ", newPos.y);
    let pos = {'x':0, 'y':0};
    try {
      // posX = this.dashboardAttributes.intents[intent.id].pos['x'];
      // posY = this.dashboardAttributes.intents[intent.id].pos['y'];
      pos = this.getIntentPosition(intent.id);
      console.log("getIntentPosition x:", pos.x, " y: ",pos.y);
    } catch (error) {
      console.error("ERROR: ", error);
    }

    if(newPos.x != pos.x || newPos.y != pos.y){
      element.style.zIndex = 'auto';
      // this.CREATE_VIEW = false;
      // this.saveIntent(intent);
      // let pos = {'x':x, 'y':y};
      console.log("getIntentPosition x:", pos.x, " y: ",pos.y);
      this.setIntentPosition(intent.id, newPos);
      // this.intentService.setDashboardAttributes(this.dashboardAttributes);
    }
    // this.isOpenPanelDetail = true;
  }

  onMouseMove(element){
    // const x = element.offsetLeft; 
    // const y = element.offsetTop; 
    // console.log("CHIAMA ON onMouseMove x:", x, " y: ",y);
  }

  getIntentPosition(value){
    // let key = 'id';
    let pos = {'x':0, 'y':0};
    // console.log("getIntentPosition: ", value);
    if(this.dashboardAttributes[value]){
      return this.dashboardAttributes[value];
    }
    return pos;
    // try {
    //   // const foundItem = this.dashboardAttributes.find(item => item[key] === value);
    //   // console.log('foundItem ------------------>', foundItem);
    //   pos = this.dashboardAttributes[value];
    //   return pos;
    // } catch (error) {
    //   // console.log('ERRORE ----------->', error);
    //   return pos;
    // }
  }

  setIntentPosition(id:string, newPos: any){
    // const intent = { key: id, value:  };
    this.dashboardAttributes[id] =  {'x': newPos.x, 'y': newPos.y};
    console.log('setIntentPosition id ----------->', id, this.dashboardAttributes[id]);
    // console.log(this.dashboardAttributes);
    this.intentService.setDashboardAttributes(this.dashboardAttributes);
  }

  /** ************************* **/
  /** END DRAG DROP FUNCTIONS 
  /** ************************* **/


  /** ************************* **/
  /** START CUSTOM FUNCTIONS 
  /** ************************* **/

  


  // onXXX(){
  //   const editIntent = await this.intentService.editIntent(this.intentSelected);
  //   console.log('editIntent:', editIntent);
  //   if(editIntent){

  //   }
  // }









  // private creatIntent(newIntent) {
  //   console.log('creatIntent', newIntent, this.id_faq_kb);
  //   let questionIntentSelected = newIntent.question;
  //   let answerIntentSelected = newIntent.answer;
  //   let displayNameIntentSelected = newIntent.intent_display_name;
  //   let formIntentSelected = newIntent.form;
  //   let actionsIntentSelected = newIntent.actions;
  //   let webhookEnabledIntentSelected = newIntent.webhook_enabled;
  //   // PENDING STATE
  //   const that = this;
  //   this.faqService.addIntent(
  //     this.id_faq_kb,
  //     questionIntentSelected,
  //     answerIntentSelected,
  //     displayNameIntentSelected,
  //     formIntentSelected,
  //     actionsIntentSelected,
  //     webhookEnabledIntentSelected
  //   ).subscribe((intent) => {
  //     console.log('addIntent: ', intent);
  //     const getAllIntents = await that.intentService.getAllIntents(that.id_faq_kb);
  //     if(getAllIntents){
  //       that.listOfIntents = that.intentService.listOfIntents;
  //       that.setDragAndListnerEventToElements();
  //     }
  //   }, (error) => {
  //     console.log('error: ', error);
  //   }, () => {
  //     console.log('fine: ');
  //   });

  // }

  /** ************************* **/
  /** END CUSTOM FUNCTIONS 
  /** ************************* **/


  
  

  /** ADD INTENT  */
  // private creatIntent_old() {
  //   console.log('creatIntent', this.intentSelected, this.id_faq_kb);
  //   this.spinnerCreateIntent = true
  //   this.logger.log('[CDS DSHBRD] creatIntent spinnerCreateIntent ', this.spinnerCreateIntent)
  //   this.startUpdatedIntent.next(true)
  //   this.logger.log('creatIntent')
  //   this.showSpinner = true;
  //   // let id_faq_kb = this.intentSelected.id_faq_kb;
  //   let questionIntentSelected = this.intentSelected.question;
  //   let answerIntentSelected = this.intentSelected.answer;
  //   let displayNameIntentSelected = this.intentSelected.intent_display_name;
  //   let formIntentSelected = this.intentSelected.form;
  //   this.logger.log('[CDS DSHBRD] creatIntent formIntentSelected ', formIntentSelected)
  //   let actionsIntentSelected = this.intentSelected.actions;
  //   this.logger.log('[CDS DSHBRD] creatIntent actionsIntentSelected ', actionsIntentSelected)
  //   let webhookEnabledIntentSelected = this.intentSelected.webhook_enabled;

  //   // const pendingClassName = 'loading-btn--pending';
  //   // const successClassName = 'loading-btn--success';
  //   // const failClassName = 'loading-btn--fail';
  //   const stateDuration = 1500;
  //   // const button = this.el.nativeElement.querySelector('#cds-save-intent-btn')

  //   //PENDING STATE
  //   // button.classList.add(pendingClassName)
  //   const that = this

  //   this.faqService.addIntent(
  //     this.id_faq_kb,
  //     questionIntentSelected,
  //     answerIntentSelected,
  //     displayNameIntentSelected,
  //     formIntentSelected,
  //     actionsIntentSelected,
  //     webhookEnabledIntentSelected
  //   ).subscribe((intent) => {

  //     // const pendingClassName = 'loading-btn--pending';
  //     // const successClassName = 'loading-btn--success';
  //     // const failClassName = 'loading-btn--fail';
  //     const stateDuration = 200;
  //     // const button = this.el.nativeElement.querySelector('#cds-save-intent-btn')

  //     this.showSpinner = false;
  //     this.logger.log('[CDS DSHBRD] creatIntent RES ', intent);
  //     if (intent) {

  //       //SUCCESS STATE
  //       setTimeout(() => {
  //         // if (button) {
  //         //   button.classList.remove(pendingClassName);
  //         //   button.classList.add(successClassName);
  //         // }
  //         window.setTimeout(() => {
  //           // if (button) {
  //           //   button.classList.remove(successClassName)
  //           // }
  //           this.logger.log('[CDS DSHBRD] HERE YES  ');
  //           //that.eventsSubject.next(intent);
  //           that.createIntent.next(intent);

  //         }, stateDuration);
  //       }, stateDuration);

  //     }
  //   }, (error) => {
  //     this.showSpinner = false;
  //     this.spinnerCreateIntent = false
  //     this.logger.log('[CDS DSHBRD] creatIntent ERROR spinnerCreateIntent ', this.spinnerCreateIntent)
  //     this.logger.error('[CDS DSHBRD] CREATED FAQ - ERROR ', error);
  //     //FAIL STATE
  //     setTimeout(() => {
  //       // if (button) {
  //       //   button.classList.remove(pendingClassName);
  //       //   button.classList.add(failClassName);
  //       // }

  //       window.setTimeout(() => {
  //         // button.classList.remove(failClassName), stateDuration
  //       });
  //     }, stateDuration);

  //   }, () => {
  //     this.showSpinner = false;
  //     this.spinnerCreateIntent = true
  //     this.logger.log('[CDS DSHBRD] creatIntent COMPLETE spinnerCreateIntent ', this.spinnerCreateIntent)
  //     this.logger.log('[CDS DSHBRD] creatIntent * COMPLETE *');
  //     // =========== NOTIFY SUCCESS===========
  //     // this.notify.showWidgetStyleUpdateNotification(this.createFaqSuccessNoticationMsg, 2, 'done');
  //     // this.router.navigate(['project/' + this.project._id + '/bots/intents/' + this.id_faq_kb + "/" + this.botType]); 
  //   });

  // }

  /** EDIT INTENT  */
  private editIntent() {
    console.log('******** editIntent ******** ', this.intentSelected);
    this.startUpdatedIntent.next(true)
    this.logger.log('[CDS DSHBRD] editIntent intentSelected', this.intentSelected);
    this.showSpinner = true;
    let id = this.intentSelected.id;
    let attributes = this.intentSelected.attributes;
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
      attributes,
      questionIntentSelected,
      answerIntentSelected,
      displayNameIntentSelected,
      formIntentSelected,
      actionsIntentSelected,
      webhookEnabledIntentSelected
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
      // =========== NOTIFY ERROR ==========
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

  onShowPanelActions(pos){
    console.log('onShowPanelActions:: ', pos);
    this.positionPanelActions = pos;
  }

  /** SIDEBAR OUTPUT EVENTS */
  onClickItemList(event: string) {
    this.logger.log('[CDS DSHBRD] active section-->', event)
    this.activeSidebarSection = event;
  }



  onToggleSidebarWith(IS_OPEN) {
    this.IS_OPEN = IS_OPEN;
  }


  /** Go back to previous page */
  goBack() {
    console.log('goBack    -----> ');
    this.router.navigate(['project/' + this.project._id + '/bots/my-chatbots/all']);
    this.hideShowWidget('show');
  }




  /** START EVENTS PANEL ACTIONS */
  onAddNewAction(action){
    this.logger.log('[CDS DSBRD] onAddNewAction ', action)
    this.isOpenActionDrawer = false;
    this.intentSelected.actions.push(action);
    let maxLength = this.intentSelected.actions.length;
    let index = maxLength-1;
    let intent_display_name = 'action_'+index;
    // let event = { action: action, index: index, maxLength: maxLength, intent_display_name: intent_display_name };
    console.log('onAddNewAction', action.id);
    this.idElementOfIntentSelected = intent_display_name;
    this.actionSelected(action.id);
  }
  /** END EVENTS PANEL ACTIONS */




  /** START EVENTS PANEL INTENT */


  async onAddingActionToStage(event) {
    // console.log('onAddingActionToStage:: ', event);
    const actionType = event.type;
    const toPoint = this.connectorDraft.toPoint;
    const fromPoint = this.connectorDraft.fromPoint;
    const fromId = this.connectorDraft.fromId;
    const toId = await this.addNewIntent(toPoint, actionType);
    // console.log('onAddingActionToStage:: fromId: ', fromId);
    // console.log('onAddingActionToStage:: toId: ', toId);
    // console.log('onAddingActionToStage:: fromPoint: ', fromPoint);
    // console.log('onAddingActionToStage:: toPoint: ', toPoint);
    this.tiledeskConnectors.createConnector(fromId, toId, fromPoint, toPoint);
    this.tiledeskConnectors.removeConnectorDraft();
    this.isOpenFloatMenu = false;
  }



  onDroppedElementToStage(event: CdkDragDrop<string[]>) {
    console.log('droppedElementOnStage!!!!!', event);
    let actionType = '';
    let pos = this.dragDropService.positionElementOnStage(event.dropPoint, this.receiverElementsDroppedOnStage, this.drawerOfItemsToZoomAndDrag);
    try {
      let action: any = event.previousContainer.data[event.previousIndex];
      actionType = action.value.type;
      // console.log('actionType::: ', actionType);
    } catch (error) {
      console.error('ERROR: ', error);
    }
    const idNewIntent = this.addNewIntent(pos, actionType);
  }
 
  /** */
  private async addNewIntent(pos, actionType){
    this.CREATE_VIEW = true;
    this.intentSelected = this.intentService.createIntent(this.id_faq_kb, actionType);
    this.intentSelected.id = 'new';
    this.setIntentPosition('new', pos);
    const idNewIntent = await this.intentService.addNewIntent(this.id_faq_kb, this.intentSelected);
    this.intentSelected.id = idNewIntent;
    console.log('creatIntent: OK ', idNewIntent);
    if(idNewIntent){
      // !!! il valore di listOfIntents è bindato nel costructor con subscriptionListOfIntents !!! //
      this.setIntentPosition(idNewIntent, pos);
      this.setDragAndListnerEvent(this.intentSelected);
      // this.TiledeskStage.setDragElement(idNewIntent);
    }
    return idNewIntent;
  }


  /** onDeleteIntent */
  onDeleteIntent(intent) {
    swal({
      title: this.translate.instant('AreYouSure'),
      text: "The intent " + intent.intent_display_name + " will be deleted",
      icon: "warning",
      buttons: ["Cancel", "Delete"],
      dangerMode: true,
    }).then((WillDelete) => {
      if (WillDelete) {
        this.deleteIntent(intent.id);
      }
    })
  }

  /** deleteIntent */
  private async deleteIntent(intentId) {
    const deleteIntent = await this.intentService.deleteIntent(intentId);
    if(deleteIntent){
      this.intentSelected = null;
      this.elementIntentSelected = {};
      this.elementIntentSelected['type'] = '';
      this.elementIntentSelected['element'] = null;
      // !!! il valore di listOfIntents è bindato nel costructor con subscriptionListOfIntents !!! //
      // this.listOfIntents = this.intentService.intents.getValue();
      // this.setDragAndListnerEventToElements();
    
      // this.TiledeskStage.deleteRefDragElement(intentId);
      
      swal(this.translate.instant('Done') + "!", this.translate.instant('FaqPage.AnswerSuccessfullyDeleted'), {
        icon: "success",
      }).then((okpressed) => {
        this.logger.log("ok pressed");
      })
    } else {
      swal(this.translate.instant('AnErrorOccurredWhilDeletingTheAnswer'), {
        icon: "error"
      })
    }
  }

  // positionElementOnStage(dropPoint:any, receiverElementsDroppedOnStageReference:ElementRef, drawerOfItemsToZoomAndDragReference:ElementRef){
  //     let pos = {
  //       'x': 0,
  //       'y': 0
  //     }
  //     const dropElement = receiverElementsDroppedOnStageReference.nativeElement;
  //     const posDropElement = dropElement.getBoundingClientRect();
  //     console.log('drop X:', posDropElement.left);
  //     console.log('drop Y:', posDropElement.top);
  //     let point = {'x':0, 'y':0};
  //     point.x = dropPoint.x-posDropElement.left;
  //     point.y = dropPoint.y-posDropElement.top;
  //     console.log('point:', point.x, point.y);
  //     const drawerElement = drawerOfItemsToZoomAndDragReference.nativeElement;
  //     const rectDrawerElement = drawerElement.getBoundingClientRect();
  //     console.log('drawerElement:', this.drawerOfItemsToZoomAndDrag);
  //     console.log('drawer X:', rectDrawerElement.left);
  //     console.log('drawer Y:', rectDrawerElement.top);
  //     let scaleValue = 1;
  //     try {
  //       const transform = drawerElement.style.transform; 
  //       const scaleMatch = transform.match(/scale\((.*?)\)/);
  //       if (scaleMatch) {
  //         scaleValue = scaleMatch[1];
  //         console.log('Scala di trasformazione:', scaleValue);
  //       } else {
  //         console.log('Nessuna scala di trasformazione trovata');
  //       }
  //     } catch (error) {
  //       console.error('ERROR: ', error);
  //     }
  //     // calcolo differenza di posizione
  //     let diffX = (rectDrawerElement.left - posDropElement.left);
  //     let diffY = (rectDrawerElement.top - posDropElement.top);
  //     console.log('diff X:', diffX);
  //     console.log('diff Y:', diffY);

  //     // pos.x = (point.x - 0);
  //     // pos.y = (point.y - 0);
  //     // console.log('pos:', pos.x, pos.y);

  //     pos.x = (point.x - diffX)/scaleValue;
  //     pos.y = (point.y - diffY)/scaleValue;
  //     console.log('new pos:', pos.x, pos.y);
  //     return pos;
  // }


  onOpenActionDrawer(_isOpenActioDrawer: boolean) {
    this.logger.log('[CDS DSBRD] onOpenActionDrawer - isOpenActioDrawer ', _isOpenActioDrawer)
    this.isOpenActionDrawer = _isOpenActioDrawer;
  }

  // onDropAction(params: any){
  //   try {
  //     let intentID = params.intentID;
  //     let actions = params.actions;
  //     this.intentSelected = this.listOfIntents.find(obj => obj.id === intentID);
  //     this.intentSelected.actions = actions;
  //     this.saveIntent(this.intentSelected);
  //   } catch (error) {
  //     console.error('error: ', error);
  //   }
  // }

  onAnswerSelected(answer: string) {
    this.logger.log('[CDS DSBRD] onAnswerSelected - answer ', answer)
    this.elementIntentSelected = {};
    this.elementIntentSelected['type'] = TYPE_INTENT_ELEMENT.ANSWER;
    this.elementIntentSelected['element'] = answer
    this.isIntentElementSelected = true;
  }

  onSelectAction(actionID) {
    this.actionSelected(event);
  }

  onQuestionSelected(intent) {
    console.log('[CDS DSBRD] onQuestionSelected from PANEL INTENT - intent ', intent)
    this.elementIntentSelected = {};
    this.elementIntentSelected['type'] = TYPE_INTENT_ELEMENT.QUESTION;
    this.elementIntentSelected['element'] = intent
    console.log('[CDS DSBRD] onQuestionSelected from PANEL INTENT - this.elementIntentSelected ', this.elementIntentSelected)
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
    this.elementIntentSelected = {};
    this.elementIntentSelected['type'] = ''
    this.elementIntentSelected['element'] = null
    this.editIntent();
  }




  /** END EVENTS PANEL INTENT */




  /** START EVENTS PANEL INTENT LIST */
  onSelectIntent(intent: Intent) { 
    console.log('onSelectIntent::: ', intent);
    this.EDIT_VIEW = true;
    this.intentSelected = intent;
    this.isIntentElementSelected = false;
    // this.MOCK_getFaqIntent();
    if (this.intentSelected.actions && this.intentSelected.actions.length > 0) {
      this.logger.log('[CDS DSBRD] onSelectIntent elementIntentSelected Exist actions', this.intentSelected.actions[0]);
      // this.onActionSelected({ action: this.intentSelected.actions[0], index: 0, maxLength: 1, intent_display_name: this.intentSelected.intent_display_name })
    } else {
      this.elementIntentSelected = {};
      this.elementIntentSelected['type'] = '';
      this.elementIntentSelected['element'] = null;
    }
    this.posCenterIntentSelected(intent);
    // this.router.navigate(['project/' + this.projectID + '/cds/' + this.id_faq_kb + '/intent/' + this.intentSelected.id], { replaceUrl: true })
  }

  
  posCenterIntentSelected(intent){
    // add class animation
    var stageElement = document.getElementById(intent.id);
    var w = stageElement.offsetWidth;
    var h = stageElement.offsetHeight;
    var x = stageElement.offsetLeft;
    var y = stageElement.offsetTop;
    // console.log("position : ", w,h,x,y);
    const dropElement = this.receiverElementsDroppedOnStage.nativeElement;
    const posDropElement = dropElement.getBoundingClientRect();
    // console.log('drop W:', posDropElement.width);
    // console.log('drop H:', posDropElement.height);
    // console.log('drop X:', posDropElement.left);
    // console.log('drop Y:', posDropElement.top);

    const drawerElement = this.drawerOfItemsToZoomAndDrag.nativeElement;
    drawerElement.style.transition = "transform 0.3s ease-in-out";

    const posDrawerElement = drawerElement.getBoundingClientRect();
    // console.log('drop W:', posDrawerElement.width);
    // console.log('drop H:', posDrawerElement.height);
    // console.log('drop X:', posDrawerElement.left);
    // console.log('drop Y:', posDrawerElement.top);

    let newX = (posDropElement.width/2)-(x+w/2);
    // console.log('newX:', newX);

    let newY = (posDropElement.height/2)-(y+h/2);
    // console.log('newX:', newY);

    let tcmd = `translate(${newX}px, ${newY}px)`;
    // let scmd = `scale(${1})`;
    // console.log("tcmd:", tcmd);
    // console.log("transform:", tcmd);
    drawerElement.style.transform = tcmd;

    setTimeout(() => {
      drawerElement.style.removeProperty('transition');
      // remove class animation
    }, 300);
  }

  // onReturnListOfIntents(intents) {
  //   console.log('onReturnListOfIntents:::: ', intents);
  //   return;
  //   this.listOfIntents = intents;
  //   this.listOfActions = intents.map(a => {
  //     if (a.intent_display_name.trim() === 'start') {
  //       return { name: a.intent_display_name, value: '#' + a.intent_id, icon: 'rocket_launch' }
  //     } else if (a.intent_display_name.trim() === 'defaultFallback') {
  //       return { name: a.intent_display_name, value: '#' + a.intent_id, icon: 'undo' }
  //     } else {
  //       return { name: a.intent_display_name, value: '#' + a.intent_id, icon: 'label_important_outline' }
  //     }
  //   });
  //   this.logger.log('[CDS DSHBRD]  onReturnListOfIntents: listOfActions', this.listOfActions);
  //   this.logger.log('[CDS DSHBRD]  onReturnListOfIntents: listOfIntents', this.listOfIntents);
  //   setTimeout(() => {
  //     this.listOfIntents.forEach(intent => {

  //       try {
  //         if(!intent.attributes){
  //           intent.attributes = {'x':0, 'y':0};
  //         }
  //       } catch (error) {
          
  //       }
        
  //       console.log('SET -----> ',intent);
  //       // setDragElement(element.id);
  //       let elem = document.getElementById(intent.id);
  //       setDragElement(elem);
  //       // elem.addEventListener('mouseup', this.onMouseUp);
  //       elem.addEventListener('mouseup',(evt) => this.onMouseUp(intent, elem));
  //       elem.addEventListener('mousedown',(evt) => this.onMouseDown(elem));
  //       elem.addEventListener('mousemove',(evt) => this.onMouseMove(elem));
  //       // elem.addEventListener('mousedown', this.onDragEnd);

  //       // elem.addEventListener("mousedown", function(event) {
  //       //   console.log("CHIAMA ON mousedown", event);
  //       //   //event.preventDefault();
  //       // });
  //       // elem.addEventListener("mouseup", function(event) {
  //       //   console.log("CHIAMA ON mouseup", event);
  //       //   //event.preventDefault();
  //       // });
  //       // elem.addEventListener("mousemove", function(event) {
  //       //   console.log("CHIAMA ON mousemove", event);
  //       //   //event.preventDefault();
  //       // });

  //       // elem.addEventListener("mouseenter", function(event) {
  //       //   console.log("CHIAMA ON mouseenter", event);
  //       // });
  //       // elem.addEventListener("dragstart", function(event) {
  //       //   // document.getElementById("demo").innerHTML = "Finished dragging the p element.";
  //       //   // event.target.style.opacity = "1";
  //       //   console.log("CHIAMA ON dragstart", event);
  //       // });
  //       // elem.addEventListener("dragover", function(event) {
  //       //   // document.getElementById("demo").innerHTML = "Finished dragging the p element.";
  //       //   // event.target.style.opacity = "1";
  //       //   console.log("CHIAMA ON dragover", event);
  //       // });
  //       // elem.addEventListener("dragleave", function(event) {
  //       //   // document.getElementById("demo").innerHTML = "Finished dragging the p element.";
  //       //   // event.target.style.opacity = "1";
  //       //   console.log("CHIAMA ON dragleave", event);
  //       // });
        
  //       // document.getElementById(element.id).addEventListener('dragstart', (e) => {
  //       //   console.log("CHIAMA ON dragstart");
  //       //   e.preventDefault();
  //       //   //e.target.style.backgroundColor = "";
  //       // });
        
  //       // document.getElementById(element.id).addEventListener('drop', (e) => {
  //       //   console.log("CHIAMA ON drop");
  //       //   //e.target.style.backgroundColor = "";
  //       //   e.preventDefault();
  //       // });
        
  //       // document.getElementById(element.id).addEventListener('dragover', (e) => {
  //       //   console.log("CHIAMA ON dragover");
  //       //   e.preventDefault();
  //       //   // e.target.style.backgroundColor = 'blue';
  //       // });
        
  //       // document.getElementById(element.id).addEventListener('dragleave', (e) => {
  //       //   console.log("CHIAMA ON dragleave");
  //       //   e.preventDefault();
          
  //       //   // e.target.style.backgroundColor = "";
  //       // })
        


  //     });
  //   }, 0);

  // }



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
  /** END EVENTS PANEL INTENT LIST */

  /** START EVENTS PANEL ELEMENTS */


  // onAddNewElement(){
  //   this.CREATE_VIEW = true;
  //   this.logger.log('[CDS DSBRD] addNewIntent  ')
  //   this.intentSelected = new Intent();
  //   this.intentSelected.id_faq_kb = this.id_faq_kb;
  //   // console.log(':::: intentSelected :::: ', this.intentSelected);
  //   this.intentSelected.intent_display_name = this.setDisplayName();
  //   let action = new ActionReply();
  //   let commandWait = new Command(TYPE_COMMAND.WAIT);
  //   action.attributes.commands.push(commandWait);
  //   let command = new Command(TYPE_COMMAND.MESSAGE);
  //   command.message = new Message('text', 'A chat message will be sent to the visitor');
  //   action.text = command.message.text; //Set default reply global text
  //   action.attributes.commands.push(command);
  //   this.intentSelected.actions.push(action)
  //   this.intentSelected.attributes.x = 300;
  //   this.intentSelected.attributes.y = 80;
  //   console.log(':::: onAddNewElement :::: ', this.intentSelected);
  //   this.listOfIntents.push(this.intentSelected);
  //   this.creatIntent(this.intentSelected);
  // }
  /** END EVENTS PANEL ELEMENTS  */

  /** START EVENTS SPLASH SCREEN */
  // onAddIntentFromSplashScreen(hasClickedAddNewIntent) {
  //   this.logger.log('[CDS DSBRD] onAddIntentFromSplashScreen hasClickedAddNewIntent ', hasClickedAddNewIntent)
  //   this.newIntentFromSplashScreen.next(hasClickedAddNewIntent)
  // }
  /** END EVENTS SPLASH SCREEN  */



  
  /** START EVENTS INTENT HEADER */
  onSaveIntent(intent: Intent) {
    console.log('**** onSaveIntent:: ', intent);
    this.saveIntent(intent);
    // this.CREATE_VIEW = true;
    // this.intentSelected = new Intent();
    // this.intentSelected.intent_display_name = this.intentService.setDisplayName(this.listOfIntents);
    // let action = new ActionReply();
    // let commandWait = new Command(TYPE_COMMAND.WAIT);
    // action.attributes.commands.push(commandWait);
    // let command = new Command(TYPE_COMMAND.MESSAGE);
    // command.message = new Message('text', 'A chat message will be sent to the visitor');
    // action.text = command.message.text;
    // action.attributes.commands.push(command);
    // this.intentSelected.actions.push(action)
    // this.intentSelected.attributes.x = 300;
    // this.intentSelected.attributes.y = 80;
    // console.log(':::: onAddNewElement :::: ', this.intentSelected);
    // this.listOfIntents.push(this.intentSelected);
    //this.saveIntent(this.intentSelected);
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
      console.log('afterClosed:: ', this.idElementOfIntentSelected);
    });
  }
  /** END EVENTS PANEL INTENT DETAIL  */

  
  

  /** STAR CUSTOM FUNCTIONS */
  private saveIntent(intent: Intent){
    console.log("********* saveIntent ********* ", intent);
    this.intentSelected = intent;
    const intentNameAlreadyCreated = this.listOfIntents.some((el) => {
      return el.id === this.intentSelected.id;
    });
    console.log("********* el.id ********* ", this.CREATE_VIEW, intentNameAlreadyCreated, this.intentSelected.id);
    if (this.CREATE_VIEW && !intentNameAlreadyCreated) {
      // this.creatIntent(this.intentSelected);
    } else {
      this.editIntent();
    }
  }

  private actionSelected(actionID){
    
    console.log('-----> actionSelected: ',actionID);
    // this.logger.log('[CDS DSBRD] onActionSelected from PANEL INTENT - action ', event.action, event.index)
    // this.elementIntentSelected = {};
    // this.elementIntentSelected['type'] = TYPE_INTENT_ELEMENT.ACTION;
    // this.elementIntentSelected['element'] = event.action
    // this.elementIntentSelected['index'] = event.index
    // this.elementIntentSelected['maxLength'] = event.maxLength
    // this.elementIntentSelected['intent_display_name'] = event.intent_display_name
    // this.isIntentElementSelected = true;
    // this.logger.log('[CDS DSBRD] onActionSelected from PANEL INTENT - this.elementIntentSelected ', this.elementIntentSelected)
  }

  /** END CUSTOM FUNCTIONS */

  // getDeptsByProjectId() {
  //   this.departmentService.getDeptsByProjectId().subscribe((departments: any) => {
  //     this.logger.log('[CDS DSBRD] - DEPT GET DEPTS ', departments);
  //     this.logger.log('[CDS DSBRD] - DEPT BOT ID ', this.id_faq_kb);

  //     if (departments) {
  //       departments.forEach((dept: any) => {
  //         // this.logger.log('[CDS DSBRD] - DEPT', dept);
  //         if (dept.default === true) {
  //           this.defaultDepartmentId = dept._id;
  //           this.logger.log('[CDS DSBRD] - DEFAULT DEPT ID ', this.defaultDepartmentId);
  //         }
  //       })
  //       const depts_length = departments.length
  //       this.logger.log('[CDS DSBRD] ---> GET DEPTS DEPTS LENGHT ', depts_length);

  //       if (depts_length === 1) {
  //         this.DISPLAY_SELECT_DEPTS_WITHOUT_BOT = false
  //         this.dept_id = departments[0]['_id']

  //         this.logger.log('[CDS DSBRD]  --->  DEFAULT DEPT HAS BOT ', departments[0].hasBot);
  //         if (departments[0].hasBot === true) {

  //           this.logger.log('[CDS DSBRD] --->  DEFAULT DEPT HAS BOT ');
  //           // this.DISPLAY_BTN_ACTIVATE_BOT_FOR_NEW_CONV = false;
  //           // this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT = false
  //           // this.logger.log('Bot Create --->  DEFAULT DEPT HAS BOT DISPLAY_BTN_ACTIVATE_BOT_FOR_NEW_CONV ', this.DISPLAY_BTN_ACTIVATE_BOT_FOR_NEW_CONV);
  //           this.logger.log('[CDS DSBRD] --->  DEFAULT DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);
  //         } else {
  //           this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT = true;
  //           this.logger.log('[CDS DSBRD] --->  DEFAULT DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);
  //         }
  //       }

  //       if (depts_length > 1) {
  //         this.DISPLAY_SELECT_DEPTS_WITHOUT_BOT = true;
  //         departments.forEach(dept => {

  //           if (dept.hasBot === true) {
  //             this.logger.log('[CDS DSBRD] --->  DEPT HAS BOT ');
  //             this.logger.log('[CDS DSBRD] --->  DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);
  //           } else {

  //             this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT = true;

  //             this.logger.log('[CDS DSBRD] --->  DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);

  //             this.depts_without_bot_array.push({ id: dept._id, name: dept.name })
  //           }

  //         });

  //         this.logger.log('[CDS DSBRD] --->  DEPT ARRAY OF DEPT WITHOUT BOT ', this.depts_without_bot_array);
  //       }

  //     }
  //   }, error => {
  //     this.logger.error('[CDS DSBRD] - DEPT - GET DEPTS  - ERROR', error);
  //   }, () => {
  //     this.logger.log('[CDS DSBRD] - DEPT - GET DEPTS - COMPLETE')
  //   });
  // }

  // onSelectBotId() {
  //   this.logger.log('[CDS DSBRD] --->  onSelectBotId ', this.selected_bot_id);
  //   this.dept_id = this.selected_bot_id
  //   const hasFound = this.depts_without_bot_array.filter((obj: any) => {
  //     return obj.id === this.selected_bot_id;
  //   });
  //   this.logger.log('[CDS DSBRD]  onSelectBotId found', hasFound);

  //   if (hasFound.length > 0) {
  //     this.selected_bot_name = hasFound[0]['name']
  //   }
  // }

  // hookBotToDept() {
  //   this.HAS_CLICKED_HOOK_BOOT_TO_DEPT = true;
  //   this.departmentService.updateExistingDeptWithSelectedBot(this.dept_id, this.selectedChatbot._id).subscribe((res) => {
  //     this.logger.log('[BOT-CREATE] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - RES ', res);
  //   }, (error) => {
  //     this.logger.error('[BOT-CREATE] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - ERROR ', error);

  //     this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT = true
  //     this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT_ERROR = true;

  //     this.logger.error('[BOT-CREATE] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - ERROR - HAS_COMPLETED_HOOK_BOOT_TO_DEPT', this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT);
  //   }, () => {
  //     this.logger.log('[BOT-CREATE] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - COMPLETE ');

  //     this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT = true
  //     this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT_SUCCESS = true;
  //     this.logger.log('[BOT-CREATE] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - COMPLETE - HAS_COMPLETED_HOOK_BOOT_TO_DEPT', this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT);
  //   });
  // }






  /* POP UP */
  // diplayPopup() {
  //   const hasClosedPopup = this.usersLocalDbService.getFromStorage('hasclosedcdspopup')
  //   this.logger.log('[CDS DSBRD] hasClosedPopup', hasClosedPopup)
  //   if (hasClosedPopup === null) {
  //     this.popup_visibility = 'block'
  //     this.logger.log('[CDS DSBRD] popup_visibility', this.popup_visibility)
  //   }
  //   if (hasClosedPopup === 'true') {
  //     this.popup_visibility = 'none'
  //   }
  // }
  // closeRemenberToPublishPopup() {
  //   this.logger.log('[CDS DSBRD] closeRemenberToPublishPopup')
  //   this.usersLocalDbService.setInStorage('hasclosedcdspopup', 'true')
  //   this.popup_visibility = 'none'
  // }


  onClosePanel(){

  }


  onSaveElement(event){

  }
  

}
