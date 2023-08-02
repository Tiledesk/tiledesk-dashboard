import { Subscription, Subject } from 'rxjs';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { HttpClient } from "@angular/common/http";
import { MatDialog } from '@angular/material/dialog';

import { TranslateService } from '@ngx-translate/core';

// SERVICES //
import { FaqKbService } from 'app/services/faq-kb.service';
import { FaqService } from 'app/services/faq.service';
import { AuthService } from 'app/core/auth.service';
import { LoggerService } from 'app/services/logger/logger.service';
// import { DragDropService } from 'app/chatbot-design-studio/services/drag-drop.service';
import { IntentService } from 'app/chatbot-design-studio/services/intent.service';
import { ControllerService } from 'app/chatbot-design-studio/services/controller.service';
import { ConnectorService } from 'app/chatbot-design-studio/services/connector.service';
import { StageService } from 'app/chatbot-design-studio/services/stage.service';

// MODEL //
import { Project } from 'app/models/project-model';
import { Chatbot } from 'app/models/faq_kb-model';
import { Intent, Button, Action, Form, ActionReply, Command, Message, ActionAssignVariable, Attributes } from 'app/models/intent-model';


// UTILS //
import { NEW_POSITION_ID, TYPE_ACTION, TYPE_COMMAND, TYPE_INTENT_ELEMENT, EXTERNAL_URL, TYPE_MESSAGE, TIME_WAIT_DEFAULT, variableList, convertJsonToArray } from 'app/chatbot-design-studio/utils';
const swal = require('sweetalert');

// COMPONENTS //
import { DialogYesNoComponent } from 'app/chatbot-design-studio/cds-base-element/dialog-yes-no/dialog-yes-no.component';


@Component({
  selector: 'appdashboard-cds-dashboard',
  templateUrl: './cds-dashboard.component.html',
  styleUrls: ['./cds-dashboard.component.scss']
})
export class CdsDashboardComponent implements OnInit {


  @ViewChild('receiver_elements_dropped_on_stage', { static: false }) receiverElementsDroppedOnStage: ElementRef;
  @ViewChild('drawer_of_items_to_zoom_and_drag', { static: false }) drawerOfItemsToZoomAndDrag: ElementRef;
  // @ViewChild('tds_container', { static: false }) tdsContainer: ElementRef;
  // @ViewChild('chatboat_dashboard', { static: false }) chatbotDashboard: ElementRef;


  private subscriptionListOfIntents: Subscription;

  updatePanelIntentList: boolean = true;
  listOfIntents: Array<Intent> = [];
  intentsChanged: boolean = false;

  intentStart: Intent;
  intentDefaultFallback: Intent;


  idElementOfIntentSelected: string;
  intentSelected: Intent;
  elementIntentSelected: any;

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

  isChromeVerGreaterThan100: boolean;
  isOpenActionDrawer: boolean;

  createIntent: Subject<Intent> = new Subject<Intent>();
  upadatedIntent: Subject<Intent> = new Subject<Intent>();
  startUpdatedIntent: Subject<boolean> = new Subject<boolean>();
  newIntentFromSplashScreen: Subject<boolean> = new Subject<boolean>();
  selectedChatbot: Chatbot
  activeSidebarSection: string;
  spinnerCreateIntent: boolean = false;

  IS_OPEN: boolean = false;
  IS_OPEN_PANEL_WIDGET: boolean = false;
  public TESTSITE_BASE_URL: string;

  // Attach bot to dept
  dept_id: string;
  translateparamBotName: any;


  isOpenPanelButtonConfig: boolean = false;
  isOpenPanelActionDetail: boolean = false;
  buttonSelected: any;

  isOpenPanelActions: boolean = true;
  positionPanelActions: any;

  tiledeskStage: any;
  isOpenFloatMenu: boolean = false;
  isOpenAddActionsMenu: boolean = false;
  positionFloatMenu: any = { 'x': 0, 'y': 0 };
  connectorDraft: any = {};

  isSaving: boolean = false;
  // intentToAddAction: any;
  tdsContainerEleHeight: number = 0
  // isBetaUrl: boolean;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    public location: Location,
    private logger: LoggerService,
    private intentService: IntentService,
    private controllerService: ControllerService,
    private connectorService: ConnectorService,
    private stageService: StageService,
    private faqKbService: FaqKbService,
    public dialog: MatDialog,
    private translate: TranslateService
  ) {

    /** SUBSCRIBE TO THE INTENT LIST */
    /**
     * Creo una sottoscrizione all'array di INTENT per averlo sempre aggiornato
     * ad ogni modifica (aggiunta eliminazione di un intent)
     */
    this.subscriptionListOfIntents = this.intentService.getIntents().subscribe(intents => {
      console.log("1 --- AGGIORNATO ELENCO INTENTS", intents);
      this.listOfIntents = intents;
      this.initListOfIntents();
    });


    /** SUBSCRIBE TO THE STATE BUTTON PANEL */
    this.controllerService.isOpenButtonPanel$.subscribe((button: Button) => {
      this.buttonSelected = button;
      if (button) {
        this.isOpenPanelButtonConfig = true;
      } else {
        this.isOpenPanelButtonConfig = false;
      }
      // console.log('isOpenButtonPanel ', this.isOpenPanelButtonConfig);
    });

    /** SUBSCRIBE TO THE STATE ACTION DETAIL PANEL */
    this.controllerService.isOpenActionDetailPanel$.subscribe((action: Action) => {
      if (action) {
        this.isOpenPanelActionDetail = true;
      } else {
        this.isOpenPanelActionDetail = false;
      }
    });

  }
  // ---------------------------------------------------------
  // Life hooks
  // ---------------------------------------------------------
  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    this.executeAsyncFunctionsInSequence();
  }

  initListOfIntents(){
    this.listOfIntents.forEach(intent => {
      if (intent.actions) {
        intent.actions = intent.actions.filter(obj => obj !== null); // patch if action is null
      }
    });
    this.updatePanelIntentList = !this.updatePanelIntentList;
    /* variabile booleana aggiunta per far scattare l'onchange nei componenti importati dalla dashboard
    * ngOnChanges funziona bene solo sugli @import degli elementi primitivi!!!  */
    this.refreshIntents();
  }

  ngAfterViewInit() {
    this.stageService.initializeStage();
    this.tiledeskStage = this.stageService.tiledeskStage;
    this.tiledeskStage.setDrawer();

    this.hideShowWidget('show');
    this.connectorService.initializeConnectors();

    this.addEventListener();
  }

  ngOnDestroy() {
    console.log("•••• On Destroy ••••")
    this.subscriptionListOfIntents.unsubscribe();
    this.connectorService.deleteAllConnectors();
  }

  clickedOutOfAddActionMenu(event) {
    console.log('[CDS DSHBRD] clickedOutOfAddActionMenu ', event)
    if (event === true) {
      this.isOpenAddActionsMenu = false // nk
    }
  }


  // ---------------------------------------------------------
  // Event listener
  // ---------------------------------------------------------
  addEventListener() {
    let that = this;

    /** LISTENER OF TILEDESK STAGE */
    document.addEventListener(
      "moved-and-scaled", (e: CustomEvent) => {
        // console.log('[CDS DSHBRD] moved-and-scaled ' ) 
        this.connectorService.tiledeskConnectors.scale = e.detail.scale;
        this.removeConnectorDraftAndCloseFloatMenu();
        this.isOpenAddActionsMenu = false // nk
      },
      false
    );

    document.addEventListener(
      "dragged", (e: CustomEvent) => {
        const el = e.detail.element;
        const x = e.detail.x;
        const y = e.detail.y;
        this.connectorService.tiledeskConnectors.moved(el, x, y);
        this.removeConnectorDraftAndCloseFloatMenu();
      },
      false
    );


    /** LISTNER OF TILEDESK CONNECTORS */
    document.addEventListener(
      "connector-draft-released", (e: CustomEvent) => {
        if (e && e.detail && e.detail.target && e.detail.target.classList.contains("tds_container")) {
          // console.log("connector-draft-released event, catched on 'stage'");
          // this.tiledeskConnectors.removeConnectorDraft();
        }
        else {
          // console.log("connector-draft-released event, catched but unsupported", e.detail);
          this.positionFloatMenu = this.tiledeskStage.physicPointCorrector(e.detail.menuPoint);
          console.log('[CDS DSHBRD] this.positionFloatMenu ', this.positionFloatMenu)
          this.isOpenFloatMenu = true;
          this.connectorDraft = {
            fromId: e.detail.fromId,
            fromPoint: e.detail.fromPoint,
            toPoint: e.detail.toPoint,
            menuPoint: this.positionFloatMenu,
            target: e.detail.target
          }
          // this.tiledeskConnectors.removeConnectorDraft();
          console.log('[CDS DSHBRD] OPEN MENU', this.connectorDraft);
        }
      },
      true
    );


    document.addEventListener(
      "connector-created", (e: CustomEvent) => {
        console.log("[CDS DSHBRD] connector-created:", e);
        const connector = e.detail.connector;
        console.log("[CDS DSHBRD] connector-created:", connector);
        //this.connectors[this.connector.id] = this.connector;
        // console.log("connector-created:", this.connectors);
        this.connectorService.addConnector(connector);
        // this.intentService.setConnectorsInDashboardAttributes(this.connectors);
        // this.connectors = this.intentService.botAttributes.connectors;
        this.intentService.onChangedConnector(connector);
      },
      true
    );


    document.addEventListener(
      "connector-deleted", (e: CustomEvent) => {
        console.log("[CDS DSHBRD] connector-deleted:", e);
        const connector = e.detail.connector;
        connector['deleted'] = true;
        console.log("[CDS DSHBRD] connector-deleted:", connector.id);
        this.connectorService.onConnectorDeleted(connector.id);
        this.intentService.onChangedConnector(connector);
      },
      true
    );

    document.addEventListener(
      "connector-selected", (e: CustomEvent) => {
        console.log("connector-selected:", e);
        this.intentService.unselectAction();
      },
      true
    );



    /** LISTNER OF FLOAT MENU */
    /** mouseup */
    document.addEventListener('mouseup', function () {
      console.log('[CDS DSHBRD] MOUSE UP CLOSE FLOAT MENU')
      if (that.isOpenFloatMenu) {
        that.removeConnectorDraftAndCloseFloatMenu();
      }
    });

    /** keydown */
    document.addEventListener('keydown', function (event) {
      console.log('[CDS DSHBRD] MOUSE KEYDOWN CLOSE FLOAT MENU')
      if (event.key === 'Backspace' || event.key === 'Escape' || event.key === 'Canc' && that.isOpenFloatMenu) {
        that.removeConnectorDraftAndCloseFloatMenu();

        // that.intentService.deleteSelectedAction();
      }
    });
  }

  /**
   * execute Async Functions In Sequence
   * Le funzioni async sono gestite in maniera sincrona ed eseguite in coda
   * da aggiungere un loader durante il processo e se tutte vanno a buon fine 
   * possiamo visualizzare lo stage completo
   */
  async executeAsyncFunctionsInSequence() {
    console.log('executeAsyncFunctionsInSequence -------------> ');
    try {
      const getTranslations = await this.getTranslations();
      console.log('Risultato 1:', getTranslations);
      const getUrlParams = await this.getUrlParams();
      console.log('Risultato 2:', getUrlParams, this.id_faq_kb);
      const getBotById = await this.getBotById(this.id_faq_kb);
      console.log('Risultato 3:', getBotById, this.selectedChatbot);
      const getCurrentProject = await this.getCurrentProject();
      console.log('Risultato 4:', getCurrentProject);
      const getBrowserVersion = await this.getBrowserVersion();
      console.log('Risultato 5:', getBrowserVersion);
      this.listOfIntents = [];
      const getAllIntents = await this.intentService.getAllIntents(this.id_faq_kb);
      console.log('Risultato 6:', getAllIntents);
      if(getAllIntents){
        this.listOfIntents = this.intentService.listOfIntents;
        this.initListOfIntents();
      }
      if (getTranslations && getUrlParams && getBotById && getCurrentProject && getBrowserVersion && getAllIntents) {
        // !!! il valore di listOfIntents è bindato nel costructor con subscriptionListOfIntents !!! // 
      }
    } catch (error) {
      console.error('error: ', error);
    }
  }





  /** ************************* **/
  /** START CUSTOM FUNCTIONS 
  /** ************************* **/

  /** refreshIntents
  * set drag and listner on intents, 
  * create connectors
  */
  private refreshIntents() {
    /** SET DRAG STAGE AND CREATE CONNECTORS */
    setTimeout(() => {
      this.setDragAndListnerEventToElements();
      this.connectorService.createConnectors(this.listOfIntents);
    }, 0);
  }

  /** */
  private removeConnectorDraftAndCloseFloatMenu() {
    this.connectorService.tiledeskConnectors.removeConnectorDraft();
    this.isOpenFloatMenu = false;
    console.log('ho rimosso il connettore tratteggiato');
  }


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
        this.id_faq = params.faqid;
        this.botType = params.bottype;
        this.intent_id = params.intent_id;
        this.logger.log('[CDS DSHBRD] getUrlParams  PARAMS', params);
        this.logger.log('[CDS DSHBRD] getUrlParams  BOT ID ', this.id_faq_kb);
        this.logger.log('[CDS DSHBRD] getUrlParams  FAQ ID ', this.id_faq);
        this.logger.log('[CDS DSHBRD] getUrlParams  FAQ ID ', this.intent_id);
        resolve(true);
      }, (error) => {
        this.logger.error('ERROR: ', error);
        reject(false);
      }, () => {
        this.logger.log('COMPLETE');
      });
    });
  }

  /** GET BOT BY ID */
  private async getBotById(botid: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.showSpinner = true;
      this.faqKbService.getBotById(botid).subscribe((chatbot: Chatbot) => {
        console.log('[CDS DSHBRD] - GET BOT BY ID RES - chatbot', chatbot);
        if (chatbot) {
          this.selectedChatbot = chatbot;
          this.translateparamBotName = { bot_name: this.selectedChatbot.name }
          if (this.selectedChatbot && this.selectedChatbot.attributes && this.selectedChatbot.attributes.variables) {
            variableList.userDefined = convertJsonToArray(this.selectedChatbot.attributes.variables);
          }else {
            variableList.userDefined = []
          }
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
  /** ************************* **/
  /** END CUSTOM FUNCTIONS 
  /** ************************* **/




  /** ************************* **/
  /** START DRAG DROP FUNCTIONS 
  /** ************************* **/

  /** setDragAndListnerEventToElements */
  private setDragAndListnerEventToElements() {
    console.log("2 --- AGGIORNO ELENCO LISTNER");
    this.listOfIntents.forEach(intent => {
      this.setDragAndListnerEvent(intent);
    });
  }

  /** setDragAndListnerEvent */
  private setDragAndListnerEvent(intent) {
    let that = this;
    if (intent.intent_id) {
      // this.removeListnerEventToElements(intent);
      try {
        let elem = document.getElementById(intent.intent_id);
        if(elem){
          console.log("imposto il drag sull'elemento "+elem);
          this.tiledeskStage.setDragElement(intent.intent_id);
          // const headerElement = elem.querySelector('.panel-intent-content .pic-header');
          const panelIntentContent = elem.getElementsByClassName('panel-intent-content')[0];
          const picHeader = panelIntentContent.getElementsByClassName('pic-header')[0];

          if(picHeader){
            setTimeout(() => {
              console.log("imposto il listner per la selezione/deselezione dell'elemento ");
              // **************** !!!!!!!! aggiungo listner !!!!!!! *******************//
              // Aggiungi l'event listener con i parametri
              // console.log("2.1 --- hasListenerMouseup -> ", elem.dataset.hasListenerMouseup ,intent.intent_id);
              if (elem.dataset.hasListenerMouseup !== 'true') {
                picHeader.addEventListener('mouseup', function () {
                  elem.dataset.hasListenerMouseup = 'true';
                  that.onMouseUpIntent(intent, elem);
                });
              }
  
              // Aggiungi l'event listener con i parametri
              // console.log("2.2 --- hasListenerMousedown -> ",elem.dataset.hasListenerMousedown, intent.intent_id);
              if (elem.dataset.hasListenerMousedown !== 'true') {
                picHeader.addEventListener('mousedown', function () {
                  elem.dataset.hasListenerMousedown = 'true';
                  that.onMouseDownIntent(elem);
                });
              }
  
              // Aggiungi l'event listener con i parametri
              // console.log("2.3 --- hasListenerMousemove -> ",elem.dataset.hasListenerMousemove, intent.intent_id);
              if (elem.dataset.hasListenerMousemove !== 'true') {
                picHeader.addEventListener('mousemove', function () {
                  elem.dataset.hasListenerMousemove = 'true';
                  that.onMouseMoveIntent(elem);
                });
              }
            }, 500);
          }
          
        }
        
      } catch (error) {
        console.error('ERROR', error);
      }
    }
  }

  /** */
  // private removeListnerEventToElements(intent) {
  //   let that = this;
  //   try {
  //     let elem = document.getElementById(intent.intent_id);
  //     if(elem){
  //       console.log("2.1 --- ELIMINO LISTNER DI ", intent.intent_id);
  //       setTimeout(() => {
  //         // **************** !!!!!!!! rimuovo listner !!!!!!! *******************//
  //         elem.removeEventListener('mouseup', function () {
  //           that.onMouseUpIntent(intent, elem);
  //         });
  //         // Rimuovi l'event listener con i parametri
  //         elem.removeEventListener('mousedown', function () {
  //           that.onMouseDownIntent(elem);
  //         });
  //         // Rimuovi l'event listener con i parametri
  //         elem.removeEventListener('mousemove', function () {
  //           that.onMouseMoveIntent(elem);
  //         });
  //       }, 0);
  //     }
  //   } catch (error) {
  //     console.error('ERROR: ', error);
  //   }
  // }

  /** */
  onMouseDownIntent(element): void {
    // console.log("onMouseDownIntent:  element: ",element);
    const x = element.offsetLeft;
    const y = element.offsetTop;
    element.style.zIndex = 2;
    // console.log("CHIAMA ON mouseDown x:", x, " y: ",y);
  }

  /** */
  onMouseUpIntent(intent: any, element: any) {
    console.log("onMouseUpIntent: ", intent, " element: ", element);
    let newPos = { 'x': element.offsetLeft, 'y': element.offsetTop };
    let pos = intent.attributes.position; // this.intentService.getIntentPosition(intent.id);
    if (newPos.x != pos.x || newPos.y != pos.y) {
      element.style.zIndex = '1';
      // console.log("setIntentPosition x:", newPos.x, " y: ",newPos.y);
      this.intentService.setIntentPosition(intent.id, newPos);
      // this.intentService.setDashboardAttributes(this.dashboardAttributes);
    }
    // this.isOpenPanelDetail = true;
  }

  /** */
  onMouseMoveIntent(element: any) {
  }


  /** getIntentPosition: call from html */
  getIntentPosition(intentId: string) {
    return this.intentService.getIntentPosition(intentId);
  }


  /** */

  private async createNewIntentWithNewAction(pos, action) {
    this.CREATE_VIEW = true;
    console.log('sto per creare un nuovo intent con pos e action::: ', pos, action);
    this.intentSelected = this.intentService.createNewIntent(this.id_faq_kb, action, pos);
    this.intentSelected.id = NEW_POSITION_ID;
    this.intentService.addNewIntentToListOfIntents(this.intentSelected);
    // this.intentService.refreshIntents();
    const newIntent = await this.intentService.saveNewIntent(this.id_faq_kb, this.intentSelected);
    if (newIntent) {
      this.intentSelected.id = newIntent.id;
      this.intentSelected.intent_id = newIntent.intent_id;
      this.intentService.refreshIntents();
      // this.intentService.addNewIntentToListOfIntents(this.intentSelected);
      // this.intentService.replaceNewIntentToListOfIntents(newIntent);
      console.log('Intent salvato correttamente: ', newIntent, this.listOfIntents);
      // !!! il valore di listOfIntents è bindato nel costructor con subscriptionListOfIntents !!! //
      setTimeout(async () => {
        this.setDragAndListnerEvent(this.intentSelected);
      }, 1000);
      
    }
    return newIntent;
  }

  private async createNewIntentFromMovedAction(event, pos, action) {
    // move action into the stage
    console.log("creo un nuovo intent sullo stage con la action draggata", pos);
    this.CREATE_VIEW = true;
    this.intentSelected = this.intentService.createNewIntent(this.id_faq_kb, action, pos);
    this.intentSelected.id = NEW_POSITION_ID;
    this.intentService.addNewIntentToListOfIntents(this.intentSelected);
    const newIntent = await this.intentService.saveNewIntent(this.id_faq_kb, this.intentSelected);
    if (newIntent) {
      this.intentSelected.id = newIntent.id;
      this.intentSelected.intent_id = newIntent.intent_id;
      this.intentService.refreshIntents();
      // this.intentService.replaceNewIntentToListOfIntents(newIntent);
      // // !!! il valore di listOfIntents è bindato nel costructor con subscriptionListOfIntents !!! //
      console.log('Intent salvato correttamente: ', newIntent, this.listOfIntents);
      setTimeout(async () => {
        this.setDragAndListnerEvent(this.intentSelected);
      }, 0);
    }
    // return newIntent;
  }


  /** deleteIntent */
  private async deleteIntent(intent) {
    const deleteIntent = await this.intentService.deleteIntent(intent.id);
    if (deleteIntent) {
      console.log('deleteIntent:: ', deleteIntent, intent.id);
      this.intentSelected = null;
      this.elementIntentSelected = {};
      this.elementIntentSelected['type'] = '';
      this.elementIntentSelected['element'] = null;
      // !!! il valore di listOfIntents è bindato nel costructor con subscriptionListOfIntents !!! //
      // 1 - rimuovo tutti i listner dell'intent
      // this.removeListnerEventToElements(intent); ---> se l'intent è stato eliminato dallo stage nn c'è bisogno di eliminare i listner
      // 2 - cancello tutti i connettori dell'intent
      this.connectorService.deleteConnectorsOfBlock(intent.intent_id);
      // !!! chiama patch positions !!!!
      swal(this.translate.instant('Done') + "!", this.translate.instant('FaqPage.AnswerSuccessfullyDeleted'), {
        icon: "success",
      }).then(() => {
        // this.intentService.setIntentPosition(intent.intent_id, null);
        // this.intentService.refreshIntents();
      })
    } else {
      swal(this.translate.instant('AnErrorOccurredWhilDeletingTheAnswer'), {
        icon: "error"
      })
    }
  }

  /** EDIT INTENT  */
  private async updateIntent() {
    if (this.isSaving === false) {
      setTimeout(async () => {
        this.isSaving = true;
        console.log('******** updateIntent ******** ', this.intentSelected);
        const response = await this.intentService.updateIntent(this.intentSelected);
        if (response) {
          this.isSaving = false;
          console.log('updateIntent: OK', this.intentSelected);
        }
      }, 500);
    }
  }


  /** STAR CUSTOM FUNCTIONS */
  private saveIntent(intent: Intent) {
    console.log("********* saveIntent ********* ", intent);
    this.intentSelected = intent;
    const intentNameAlreadyCreated = this.listOfIntents.some((el) => {
      return el.id === this.intentSelected.id;
    });
    console.log("********* el.id ********* ", this.CREATE_VIEW, intentNameAlreadyCreated, this.intentSelected.id);
    if (this.CREATE_VIEW && !intentNameAlreadyCreated) {
      // this.creatIntent(this.intentSelected);
    } else {
      // this.editIntent();
      this.updateIntent();
    }
  }

  // nk
  showPanelActions(event) {
    console.log('[CDS DSHBRD] showPanelActions event:: ', event);
    this.isOpenAddActionsMenu = true;
    // this.isOpenFloatMenu = true;
    const pos = { 'x': event.x, 'y': event.y }
    // this.connectorService.tiledeskConnectors.logicPoint(event.dropPoint);
    this.intentSelected = event.intent;
    this.positionFloatMenu = pos;
    console.log('[CDS DSHBRD] showPanelActions intentSelected ', this.intentSelected);
    console.log('[CDS DSHBRD] showPanelActions positionFloatMenu ', this.positionFloatMenu)

    this.getTdsContainerHeight()
    // this.getChatbotDashbordHeight()
  }

  // getChatbotDashbordHeight() {
  //   this.chatbotDashboardEle = <HTMLElement>document.querySelector('#tds_container')
  //   console.log('[CDS DSHBRD] Chat bot Dashbord Ele ', this.chatbotDashboardEle)
  //   console.log('[CDS DSHBRD] Chat bot Dashbord Height ', this.chatbotDashboardEle.offsetHeight)

  // }

  getTdsContainerHeight() {
    let tdsContainerEle = <HTMLElement>document.querySelector('#tds_container')
    console.log('[CDS DSHBRD] tdsContainerEle ', tdsContainerEle)

    this.tdsContainerEleHeight = tdsContainerEle.offsetHeight - 35;
    console.log('[CDS DSHBRD] tdsContainerEle Height', this.tdsContainerEleHeight)
  }

  posCenterIntentSelected(intent) {
    // add class animation
    var stageElement = document.getElementById(intent.intent_id);
    // let pos = {'x': stageElement.offsetLeft, 'y': stageElement.offsetTop };
    // console.log('posCenterIntentSelected::: ', pos);
    this.stageService.centerStageOnPosition(stageElement);
    return;

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

    let newX = (posDropElement.width / 2) - (x + w / 2);
    // console.log('newX:', newX);

    let newY = (posDropElement.height / 2) - (y + h / 2);
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

  /** ************************* **/
  /** END DRAG DROP FUNCTIONS 
  /** ************************* **/

  // EVENTS //

  onShowPanelActions(pos) {
    console.log('onShowPanelActions pos:: ', pos);
    this.positionPanelActions = pos;
  }



  /** SIDEBAR OUTPUT EVENTS */
  onClickItemList(event: string) {
    this.logger.log('[CDS DSHBRD] active section-->', event)
    this.activeSidebarSection = event;
  }


  /** Go back to previous page */
  goBack() {
    console.log('goBack    -----> ');
    this.router.navigate(['project/' + this.project._id + '/bots/my-chatbots/all']);
    this.hideShowWidget('show');
  }
  onTestItOut(status) {
    console.log('onTestItOut    -----> ');
    this.IS_OPEN_PANEL_WIDGET = status
  }
  onToggleSidebarWith(IS_OPEN) {
    this.IS_OPEN = IS_OPEN;
  }

  /** START EVENTS PANEL ACTIONS */
  onAddNewAction(action) {
    this.logger.log('[CDS DSBRD] onAddNewAction ', action)
    this.isOpenActionDrawer = false;
    this.intentSelected.actions.push(action);
    let maxLength = this.intentSelected.actions.length;
    let index = maxLength - 1;
    let intent_display_name = 'action_' + index;
    // let event = { action: action, index: index, maxLength: maxLength, intent_display_name: intent_display_name };
    console.log('onAddNewAction', action.id);
    this.idElementOfIntentSelected = intent_display_name;
  }

  /** END EVENTS PANEL ACTIONS */




  /** START EVENTS PANEL INTENT */
  /** chiamata quando trascino un connettore sullo stage e creo un intent al volo */
  /** OPPURE */
  /** chiamata quando premo + sull'intent per aggiungere una nuova action */
  async onAddingActionToStage(event) {
    console.log('[CDS-DSHBRD] onAddingActionToStage:: ', event);
    this.isOpenAddActionsMenu = false; // nk

    console.log('trascino connettore sullo stage ', event);
    if (this.connectorDraft.toPoint) {
      const toPoint = this.connectorDraft.toPoint;
      toPoint.x = toPoint.x - 132;
      const fromPoint = this.connectorDraft.fromPoint;
      const fromId = this.connectorDraft.fromId;
      const newAction = this.intentService.createNewAction(event.type);
      const newIntent = await this.createNewIntentWithNewAction(toPoint, newAction);
      if (newIntent) {
        const toId = newIntent.intent_id;
        console.log('sto per creare il connettore ');
        this.connectorService.tiledeskConnectors.createConnector(fromId, toId, fromPoint, toPoint);
      }
      console.log('sto per creare il connettore ');
      this.removeConnectorDraftAndCloseFloatMenu();
    } else {
      console.log("creo una nuova action e la aggiungo all'intent", event.type);
      const newAction = this.intentService.createNewAction(event.type)
      console.log('[CDS-DSHBRD] this.intentSelected:: ', this.intentSelected);
      this.intentSelected.actions.push(newAction);
      this.updateIntent();
    }
  }


  /** 
   * chiamata quando aggiungo (droppandola) una action sullo stage da panel element
   * oppure 
   * chiamata quando aggiungo (droppandola) una action sullo stage spostandola da un altro intent  */
  async onDroppedElementToStage(event: CdkDragDrop<string[]>) {
    console.log('droppedElementOnStage:: ', event);
    // recuperare la posizione
    let pos = this.connectorService.tiledeskConnectors.logicPoint(event.dropPoint);
    pos.x = pos.x - 132;
    let action: any = event.previousContainer.data[event.previousIndex];
    if (action.value && action.value.type) {
      // dragging a new action into the stage
      console.log('ho draggato una action da panel element sullo stage');
      const newAction = this.intentService.createNewAction(action.value.type);
      await this.createNewIntentWithNewAction(pos, newAction);
    } else if (action) {
      // dragging an action from another intent, into the stage
      console.log('ho draggato una action da un intent sullo stage');
      // moveItemInArray(this.intentSelected.actions, event.previousIndex, event.currentIndex);
      this.intentService.deleteActionFromPreviousIntentOnMovedAction(event, action);
      await this.createNewIntentFromMovedAction(event, pos, action);
    }
  }

  // async onDroppedElementFromIntentToStage(event: CdkDragDrop<string[]>) {
  //   console.log('onDroppedElementFromIntentToStage!!!!!', event);
  //   let actionType = '';
  //   let pos = this.connectorService.tiledeskConnectors.logicPoint(event.dropPoint);
  //   // let pos = this.dragDropService.positionElementOnStage(event.dropPoint, this.receiverElementsDroppedOnStage, this.drawerOfItemsToZoomAndDrag);
  //   console.log('pos::: ', pos);
  //   try {
  //     let action: any = event.previousContainer.data[event.previousIndex];
  //     actionType = action.value.type;
  //     console.log('actionType::: ', actionType);
  //   } catch (error) {
  //     console.error('ERROR: ', error);
  //   }
  //   await this.addNewIntent(pos, actionType);
  //   // const idNewIntent = this.addNewIntent(pos, actionType);
  // }




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
        this.deleteIntent(intent);
      }
    })
  }



  onOpenActionDrawer(_isOpenActioDrawer: boolean) {
    this.logger.log('[CDS DSBRD] onOpenActionDrawer - isOpenActioDrawer ', _isOpenActioDrawer)
    this.isOpenActionDrawer = _isOpenActioDrawer;
  }

  onAnswerSelected(answer: string) {
    this.logger.log('[CDS DSBRD] onAnswerSelected - answer ', answer)
    this.elementIntentSelected = {};
    this.elementIntentSelected['type'] = TYPE_INTENT_ELEMENT.ANSWER;
    this.elementIntentSelected['element'] = answer
    this.isIntentElementSelected = true;
  }


  onActionSelected(event) {

    console.log('-----> actionSelected: ', event);

    this.controllerService.openActionDetailPanel(this.buttonSelected);
    this.logger.log('[CDS DSBRD] onActionSelected from PANEL INTENT - action ', event.action, event.index)
    this.elementIntentSelected = {};
    this.elementIntentSelected['type'] = TYPE_INTENT_ELEMENT.ACTION;
    this.elementIntentSelected['element'] = event.action
    this.elementIntentSelected['index'] = event.index
    this.elementIntentSelected['maxLength'] = event.maxLength
    this.elementIntentSelected['intent_display_name'] = event.intent_display_name
    this.isIntentElementSelected = true;
    this.logger.log('[CDS DSBRD] onActionSelected from PANEL INTENT - this.elementIntentSelected ', this.elementIntentSelected)
    this.intentSelected = this.listOfIntents.find(el => el.intent_id === this.intentService.intentSelectedID)
    this.controllerService.openActionDetailPanel(this.elementIntentSelected['element'])
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
    // this.editIntent()
    this.updateIntent();
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
    this.intentService.selectIntent(intent.intent_id)
    // this.router.navigate(['project/' + this.projectID + '/cds/' + this.id_faq_kb + '/intent/' + this.intentSelected.id], { replaceUrl: true })
  }




  onCreateIntentBtnClicked() {
    this.CREATE_VIEW = true;
    this.intentSelected = new Intent();
    let action = new ActionReply();
    let commandWait = new Command(TYPE_COMMAND.WAIT);
    action.attributes.commands.push(commandWait);
    let command = new Command(TYPE_COMMAND.MESSAGE);
    command.message = new Message('text', 'A chat message will be sent to the visitor');
    action.text = command.message.text; //Set default reply global text
    action.attributes.commands.push(command);
    this.intentSelected.actions.push(action)
    this.elementIntentSelected = {};
    this.elementIntentSelected['type'] = ''
    this.elementIntentSelected['element'] = null
  }
  /** END EVENTS PANEL INTENT LIST */

  /** START EVENTS PANEL ELEMENTS */


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
  onCloseAndSavePanelIntentDetail(intentSelected: any) {
    if (intentSelected && intentSelected != null) {
      this.onSaveIntent(intentSelected);
      this.isIntentElementSelected = false;
      this.controllerService.closeActionDetailPanel();
    } else {
      this.onOpenDialog();
    }
    // this.isIntentElementSelected = false;
  }

  onClickedInsidePanelIntentDetail() {
    this.isClickedInsidePanelIntentDetail = true;
  }

  onClickPanelIntentDetail() {
    // console.log('dismiss panel intent detail', this.isClickedInsidePanelIntentDetail);
    if (this.isClickedInsidePanelIntentDetail === false) {
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
      data: { title: 'Unsaved changes', text: 'Are you sure you want to leave without saving your changes?', yes: 'Leave', no: 'Cancel' }
    });
    dialogRef.afterClosed().subscribe(result => {
      // console.log(`Dialog result: ${result}`);
      this.idElementOfIntentSelected = null;
      if (result && result !== undefined && result !== false) {
        that.isIntentElementSelected = false;
      } else {
        that.isIntentElementSelected = true;
      }
      this.controllerService.closeActionDetailPanel();
      console.log('afterClosed:: ', this.idElementOfIntentSelected);
    });
  }
  /** END EVENTS PANEL INTENT DETAIL  */



  /** END CUSTOM FUNCTIONS */


  onClosePanel() {

  }


  onSaveButton(button: Button) {
    const arrayId = button.idConnector.split("/");
    const idConnector = arrayId[0] ? arrayId[0] : null;
    console.log('onSaveButton: ', idConnector, this.listOfIntents);
    if (idConnector) {
      this.intentSelected = this.listOfIntents.find(obj => obj.intent_id === idConnector);
      console.log('onSaveButton: ', this.intentSelected);
      this.updateIntent();
    }
  }


}
