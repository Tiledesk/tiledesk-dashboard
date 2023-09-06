import { Subscription, Subject } from 'rxjs';
import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
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
import { NEW_POSITION_ID, TYPE_ACTION, TYPE_COMMAND, TYPE_INTENT_ELEMENT, EXTERNAL_URL, TYPE_MESSAGE, TIME_WAIT_DEFAULT, variableList, convertJsonToArray, checkIFElementExists } from 'app/chatbot-design-studio/utils';
const swal = require('sweetalert');

// COMPONENTS //
import { DialogYesNoComponent } from 'app/chatbot-design-studio/cds-base-element/dialog-yes-no/dialog-yes-no.component';
import { DepartmentService } from 'app/services/department.service';
// import { setInterval } from 'timers';


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

  id_faq_kb: string;

  id_faq: string;
  botType: string;
  intent_id: string;

  project: Project;
  projectID: string;
  defaultDepartmentId: string;

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
  IS_OPEN_INTENTS_LIST: boolean = true;
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
  // isOpenFloatMenu: boolean = false;
  isOpenAddActionsMenu: boolean = false;
  positionFloatMenu: any = { 'x': 0, 'y': 0 };
  // connectorDraft: any = {};

  isSaving: boolean = false;
  // intentToAddAction: any;
  tdsContainerEleHeight: number = 0;
  hasClickedAddAction: boolean = false;
  hideActionPlaceholderOfActionPanel: boolean;

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
    private departmentService: DepartmentService,
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
      this.updatePanelIntentList = !this.updatePanelIntentList;
    });


    /** SUBSCRIBE TO THE STATE BUTTON PANEL */
    this.controllerService.isOpenButtonPanel$.subscribe((button: Button) => {

      this.buttonSelected = button;
      if (button) {
        this.isOpenPanelButtonConfig = true;
        // -------------------------------------------------------
        // @ Close WHEN THE BUTTON CONFIGURATION PANEL IS OPENED
        // - test widget
        // -------------------------------------------------------
        this.IS_OPEN_PANEL_WIDGET = false;
      } else {
        this.isOpenPanelButtonConfig = false;
      }
      // console.log('isOpenButtonPanel ', this.isOpenPanelButtonConfig);
    });

    /** SUBSCRIBE TO THE STATE ACTION DETAIL PANEL */
    this.controllerService.isOpenActionDetailPanel$.subscribe((element: { type: TYPE_INTENT_ELEMENT, element: Action | string | Form }) => {
      this.elementIntentSelected = element;
      console.log('isOpenActionDetailPanel elementIntentSelected ', this.elementIntentSelected);
      if (element.type) {
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
    this.initListOfIntents();
    this.getDeptsByProjectId();
  }

  initListOfIntents() {
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

  onHideActionPlaceholderOfActionPanel(event){
    console.log('[CDS DSHBRD] onHideActionPlaceholderOfActionPanel event : ', event);
    this.hideActionPlaceholderOfActionPanel = event
  }

  // clickedOutOfAddActionMenu(event) {
  //   console.log('[CDS DSHBRD] clickedOutOfAddActionMenu ', event)
  //   if (event === true) {
  //     this.isOpenAddActionsMenu = false // nk
  //   }
  // }

  // -------------------------------------------------------
  // @ Close WHEN THE STAGE IS CLICKED 
  // - actions context menu' (static & float),
  // - detail action panel, 
  // - button configuration panel
  // - test widget
  // -------------------------------------------------------
  @HostListener('document:click', ['$event'])
  documentClick(event: any): void {
    console.log('[CDS DSHBRD] DOCUMENT CLICK event: ', event.target.id);
    // if (event.target.id ==='cdk-drop-list-0') {
    if (event.target.id.startsWith("cdk-drop-list-")) {

      this.removeConnectorDraftAndCloseFloatMenu();

      // this.isOpenAddActionsMenu = false // nk
      this.controllerService.closeActionDetailPanel();
      this.controllerService.closeButtonPanel();
      this.IS_OPEN_PANEL_WIDGET = false;
    }
  }

  // -------------------------------------------------------
  // @ Close WHEN THE ACTION LEFT MENU IS CLICKED
  // - actions context menu (static & float)
  // - test widget
  // -------------------------------------------------------
  onMouseOverActionMenuSx(event: boolean) {
    console.log('[CDS DSHBRD] onMouseOverActionMenuSx ', event)
    if (event === true) {
      this.IS_OPEN_PANEL_WIDGET = false;
      // this.isOpenAddActionsMenu = false
      // @ Remove connectors of the float context menu
      if (!this.hasClickedAddAction) {
        this.removeConnectorDraftAndCloseFloatMenu();
      }
    }
  }

  // -------------------------------------------------------
  // @ Close WHEN THE ACTION LEFT MENU IS CLICKED
  // - Action detail panel
  // -------------------------------------------------------
  actionDeleted(event) {
    console.log('[CDS DSHBRD] actionDeleted ', event)
    if (event === true) {
      this.controllerService.closeActionDetailPanel();
    }
  }

  // ---------------------------------------------------------
  // Event listener
  // ---------------------------------------------------------
  addEventListener() {
    let that = this;

    /** LISTENER OF TILEDESK STAGE */
    
    /** moved-and-scaled ** 
     * scatta quando sposto lo stage (lo muovo o lo scalo):
     * - imposto la scala
     * - chiudo 
     * - elimino il connettore disegnato e chiudo il float menu se è aperto
    */
    document.addEventListener(
      "moved-and-scaled", (e: CustomEvent) => {
        // console.log('[CDS DSHBRD] moved-and-scaled ', e)
        this.connectorService.tiledeskConnectors.scale = e.detail.scale;
        // this.isOpenAddActionsMenu = false;
        this.removeConnectorDraftAndCloseFloatMenu();
      },
      false
    );

    /** dragged **
     * l'evento scatta quando muovo un intent sullo stage:
     * - muovo i connettori collegati all'intent
     * - rimuovo eventuali connectors tratteggiati e chiudo il float menu se è aperto
    */
    document.addEventListener(
      "dragged", (e: CustomEvent) => {
        console.log('[CDS DSHBRD] dragged ', e);
        const el = e.detail.element;
        const x = e.detail.x;
        const y = e.detail.y;
        this.connectorService.moved(el, x, y);
        this.removeConnectorDraftAndCloseFloatMenu();
      },
      false
    );


    /** LISTNER OF TILEDESK CONNECTORS */
     
    /** connector-draft-released ** 
     * scatta solo quando NON viene creato un connettore, cioè quando rilascio il connettore tratteggiato in un punto che non è "collegabile"
     * se lo rilascio sullo stage ed 'e.detail' è completo della posizione di partenza e di arrivo del connettore posso aprire il float menu
     * altrimenti
     * rimuovo il connettore tratteggiato
    */
    document.addEventListener(
      "connector-draft-released", (e: CustomEvent) => {
        console.log("evento -> connector-draft-released :: ", e.detail);
        if(!e || !e.detail) return;
        const detail = e.detail;
        const arrayOfClass = detail.target.classList.value.split(' ');
        if (detail.target && arrayOfClass.includes("receiver-elements-dropped-on-stage") && detail.toPoint && detail.menuPoint) {
          console.log("ho rilasciato il connettore tratteggiato nello stage (nell'elemento con classe 'receiver_elements_dropped_on_stage') e quindi apro il float menu");
          this.openFloatMenuOnConnectorDraftReleased(detail);
        } else {
          console.log("ho rilasciato in un punto qualsiasi del DS ma non sullo stage quindi non devo aprire il menu", detail);
          this.removeConnectorDraftAndCloseFloatMenu();
        }
      },
      true
    );

    /** connector-created **
     * scatta quando viene creato un connettore:
     *  - aggiungo il connettore alla lista dei connettori (addConnectorToList)
     *  - notificare alle actions che i connettori sono cambiati (onChangedConnector) per aggiornare i pallini
    */
    document.addEventListener(
      "connector-created", (e: CustomEvent) => {
        console.log("[CDS DSHBRD] connector-created:", e);
        const connector = e.detail.connector;
        // console.log("connector-created:", this.connectors);
        this.connectorService.addConnectorToList(connector);
        // this.intentService.setConnectorsInDashboardAttributes(this.connectors);
        // this.connectors = this.intentService.botAttributes.connectors;
        this.intentService.onChangedConnector(connector);
      },
      true
    );

    /** connector-deleted **
     * scatta quando viene eliminato un connettore:
     *  - elimino il connettore dalla lista dei connettori (deleteConnectorToList)
     *  - notificare alle actions che i connettori sono cambiati (onChangedConnector) per aggiornare i pallini
    */
    document.addEventListener(
      "connector-deleted", (e: CustomEvent) => {
        console.log("[CDS DSHBRD] connector-deleted:", e);
        const connector = e.detail.connector;
        connector['deleted'] = true;
        this.connectorService.deleteConnectorToList(connector.id);
        this.intentService.onChangedConnector(connector);
      },
      true
    );

    /** connector-selected **
     * scatta quando viene selezionato un connettore:
     * deseleziono action e intent (unselectAction)
    */
    document.addEventListener(
      "connector-selected", (e: CustomEvent) => {
        console.log("[CDS DSHBRD] connector-selected:", e);
        this.intentService.unselectAction();
      },
      true
    );



    /** LISTNER OF FLOAT MENU */
    /** mouseup */
    document.addEventListener('mouseup', function () {
      console.log('[CDS DSHBRD] MOUSE UP CLOSE FLOAT MENU')
      // @ Remove connectors of the float context menu
      // if (!that.hasClickedAddAction) {
      //   that.removeConnectorDraftAndCloseFloatMenu();
      // }
    });

    /** keydown */
    document.addEventListener('keydown', function (event) {
      console.log('[CDS DSHBRD] MOUSE KEYDOWN CLOSE FLOAT MENU hasClickedAddAction ', that.hasClickedAddAction)
      if (event.key === 'Backspace' || event.key === 'Escape' || event.key === 'Canc' && !that.hasClickedAddAction) {
        // --------------------------------------------------------------------
        // @ Close WHEN ARE CLICKED THE KEYBOARD KEYS Backspace, Escape or Canc
        // - actions context menu (static & float)
        // --------------------------------------------------------------------
        // that.isOpenAddActionsMenu = false;
        // @ Remove connectors of the float context menu
        if (!that.hasClickedAddAction) {
          that.removeConnectorDraftAndCloseFloatMenu();
        }
        // that.intentService.deleteSelectedAction();
      }
    });

  } // close addEventListener






  private openFloatMenuOnConnectorDraftReleased(detail){
        console.log("ho rilasciato in un punto qualsiasi dello stage e quindi apro il float menu", detail);
        this.positionFloatMenu = this.tiledeskStage.physicPointCorrector(detail.menuPoint);
        this.positionFloatMenu.x = this.positionFloatMenu.x + 300;
        detail.menuPoint = this.positionFloatMenu;
        console.log('[CDS DSHBRD] this.positionFloatMenu', this.positionFloatMenu);
        this.isOpenAddActionsMenu = true;
        this.hasClickedAddAction = false;
        this.IS_OPEN_PANEL_WIDGET = false;
        this.controllerService.closeActionDetailPanel();
        this.connectorService.createConnectorDraft(detail);
        console.log('[CDS DSHBRD] OPEN MENU hasClickedAddAction', this.hasClickedAddAction);
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
      if (getAllIntents) {
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
    this.connectorService.removeConnectorDraft();
    this.isOpenAddActionsMenu = false;
    console.log('ho rimosso il connettore tratteggiato e ho chiuso il float menu');
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

  // ----------------------------------------------------------
  // GET FROM ROUTE PARAMS (PASSED FROM FAQ COMPONENT):
  // THE FAQ ID - WHEN THE CALLBACK IS COMPLETED RUN GET-FAQ-BY-ID THAT RETURN THE OBJECT FAQ
  // AND THE FAQ KB ID (THEN USED IN THE GOBACK)
  // ----------------------------------------------------------

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

  // ----------------------------------------------------------
  // Get bot by id
  // ----------------------------------------------------------
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
          } else {
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

  // ----------------------------------------------------------
  // Get depts
  // ----------------------------------------------------------
  getDeptsByProjectId() {
    this.departmentService.getDeptsByProjectId().subscribe((departments: any) => {
      this.logger.log('[CDS DSHBRD] - DEPT GET DEPTS ', departments);
      this.logger.log('[CDS DSHBRD] - DEPT BOT ID ', this.id_faq_kb);

      if (departments) {

        departments.forEach((dept: any) => {
          // this.logger.log('[CDS DSHBRD] - DEPT', dept);
          if (dept.default === true) {
            this.defaultDepartmentId = dept._id;
            this.logger.log('[CDS DSHBRD] - DEFAULT DEPT ID ', this.defaultDepartmentId);
          }
        })
        const depts_length = departments.length
        this.logger.log('[CDS DSHBRD] ---> GET DEPTS DEPTS LENGHT ', depts_length);
      }
    }, error => {
      this.logger.error('[CDS DSHBRD] - DEPT - GET DEPTS  - ERROR', error);
    }, () => {
      this.logger.log('[CDS DSHBRD] - DEPT - GET DEPTS - COMPLETE')
    });
  }

  /** hideShowWidget ???? */
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

  // ----------------------------------------------------------
  // Get current project
  // ----------------------------------------------------------
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

  // ----------------------------------------------------------
  // Get browser version
  // ----------------------------------------------------------
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




  // ------------------------------------------
  // @ START DRAG DROP FUNCTIONS 
  // ------------------------------------------

  /** setDragAndListnerEventToElements */
  private setDragAndListnerEventToElements() {
    console.log("2 --- AGGIORNO ELENCO LISTNER");
    this.listOfIntents.forEach(intent => {
      this.setDragAndListnerEventToElement(intent);
      // this.setDragAndListnerToElement(intent);
      // this.stageService.setDragElement(intent.intent_id);
      // this.intentService.setListnerEvent(intent);
    });
  }


  private setDragAndListnerEventToElement(intent) {
    let intervalId = setInterval(async () => {
      const result = checkIFElementExists(intent.intent_id);
      if (result === true) {
        console.log('Condition is true!');
        this.stageService.setDragElement(intent.intent_id);
        this.intentService.setListnerEvent(intent);
        clearInterval(intervalId);
      }
    }, 100); // Chiamiamo la funzione ogni 100 millisecondi (0.1 secondo)
    // Termina l'intervallo dopo 2 secondi (2000 millisecondi)
    setTimeout(() => {
      console.log('Timeout: 1 secondo scaduto.');
      clearInterval(intervalId);
    }, 2000);
  }




  /** getIntentPosition: call from html */
  getIntentPosition(intentId: string) {
    return this.intentService.getIntentPosition(intentId);
  }


  /** createNewIntentWithNewAction
  * chiamata quando trascino un connettore sullo stage e creo un intent al volo 
  * oppure
  * chiamata quando aggiungo (droppandola) una action sullo stage da panel element
  * oppure
  * chiamata quando aggiungo (droppandola) una action sullo stage spostandola da un altro intent
 */
  private async createNewIntentWithAnAction(pos, action) {
    this.CREATE_VIEW = true;
    console.log('sto per creare un nuovo intent con pos e action::: ', pos, action);
    this.intentSelected = this.intentService.createNewIntent(this.id_faq_kb, action, pos);
    this.setDragAndListnerEventToElement(this.intentSelected);
    this.setDragAndListnerEventToElements();
    this.intentSelected.id = NEW_POSITION_ID;
    this.intentService.addNewIntentToListOfIntents(this.intentSelected);
    
    /** chiamata quando trascino un connettore sullo stage e creo un intent al volo  */
    const connectorDraft = this.connectorService.connectorDraft;
    if(connectorDraft){
      const fromId = connectorDraft.fromId;
      const toId = this.intentSelected.intent_id;
      console.log('[CDS-DSHBRD] sto per creare il connettore ', connectorDraft, fromId, toId);
      this.connectorService.createConnectorFromId(fromId, toId);
      this.removeConnectorDraftAndCloseFloatMenu();
    }

    const newIntent = await this.intentService.saveNewIntent(this.id_faq_kb, this.intentSelected);
    if (newIntent) {
      this.intentSelected.id = newIntent.id;
      // this.intentSelected.intent_id = newIntent.intent_id;
      console.log('Intent salvato correttamente: ', newIntent, this.listOfIntents);
      this.intentService.replaceNewIntentToListOfIntents(newIntent);
      // console.log('Intent salvato correttamente: ', newIntent, this.listOfIntents);
      // !!! il valore di listOfIntents è bindato nel costructor con subscriptionListOfIntents !!! //
      // this.setDragAndListnerEventToElement(this.intentSelected);
      // this.setDragAndListnerEventToElements();
      return newIntent;
    } else {
      return null;
    }
  }

  // /** 
  //  * chiamata quando aggiungo (droppandola) una action sullo stage spostandola da un altro intent  
  //  * */
  // private async createNewIntentFromMovedAction(event, pos, action) {
  //   // move action into the stage
  //   console.log("creo un nuovo intent sullo stage con la action draggata", pos);
  //   this.CREATE_VIEW = true;
  //   this.intentSelected = this.intentService.createNewIntent(this.id_faq_kb, action, pos);
  //   this.intentSelected.id = NEW_POSITION_ID;
  //   this.intentService.addNewIntentToListOfIntents(this.intentSelected);
  //   const newIntent = await this.intentService.saveNewIntent(this.id_faq_kb, this.intentSelected);
  //   if (newIntent) {
  //     this.intentSelected.id = newIntent.id;
  //     this.intentSelected.intent_id = newIntent.intent_id;
  //     console.log('Intent salvato correttamente: ', newIntent, this.listOfIntents);
  //     this.intentService.replaceNewIntentToListOfIntents(this.intentSelected);
  //     // this.intentService.replaceNewIntentToListOfIntents(newIntent);
  //     // // !!! il valore di listOfIntents è bindato nel costructor con subscriptionListOfIntents !!! //
  //     setTimeout(async () => {
  //       this.setDragAndListnerEvent(this.intentSelected);
  //     }, 0);
  //   }
  // }


  // Delete Intent 
  private async deleteIntent(intent) {
    // 1 - rimuovo l'intent dallo stage
    // 2 - cancello tutti i connettori dell'intent
    this.connectorService.deleteConnectorsOfBlock(intent.intent_id);
    this.intentService.deleteIntentToListOfIntents(intent.intent_id);

    const deleteIntent = await this.intentService.deleteIntent(intent.id);
    if (deleteIntent) {
      console.log('deleteIntent:: ', deleteIntent, intent.id);
      this.intentSelected = null;
      this.elementIntentSelected = {};
      this.elementIntentSelected['type'] = '';
      this.elementIntentSelected['element'] = null;
      // !!! il valore di listOfIntents è bindato nel costructor con subscriptionListOfIntents !!! //
      // !!! chiama patch positions !!!!
      swal(this.translate.instant('Done') + "!", this.translate.instant('FaqPage.AnswerSuccessfullyDeleted'), {
        icon: "success",
      }).then(() => {
        // this.intentService.setIntentPosition(intent.intent_id, null);
      })
    } else {
      swal(this.translate.instant('AnErrorOccurredWhilDeletingTheAnswer'), {
        icon: "error"
      })
    }
  }


  // Edit Intent 
  private async updateIntent() {
    if (this.isSaving === false) {
      setTimeout(async () => {
        this.isSaving = true;
        console.log('******** updateIntent ******** ', this.intentSelected);
        const response = await this.intentService.updateIntent(this.intentSelected);
        if (response) {
          this.isSaving = false;
          console.log('updateIntent: OK', this.intentSelected);
          // console.log('propago aggiornamento intent');
          // this.intentService.behaviorIntent.next(this.intentSelected);
        }
      }, 0);
    }
  }


  // Save Intent
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
  // -------------------------------------------------------
  // @ Open WHEN THE ADD ACTION BTN IS PRESSED
  // - actions static context menu
  // @ Close
  // - test widget
  // - detail action panel
  // - button configuration panel 
  // -------------------------------------------------------
  showPanelActions(event) {
    console.log('[CDS DSHBRD] showPanelActions event:: ', event);
    this.isOpenAddActionsMenu = true;
    this.controllerService.closeActionDetailPanel();
    this.controllerService.closeButtonPanel();
    this.hasClickedAddAction = event.addAction;
    console.log('[CDS DSHBRD] showPanelActions hasClickedAddAction:: ', this.hasClickedAddAction);
    this.IS_OPEN_PANEL_WIDGET = false;
    // this.isOpenFloatMenu = true;
    const pos = { 'x': event.x, 'y': event.y }
    // this.connectorService.tiledeskConnectors.logicPoint(event.dropPoint);
    this.intentSelected = event.intent;
    this.positionFloatMenu = pos;
    console.log('[CDS DSHBRD] showPanelActions intentSelected ', this.intentSelected);
    console.log('[CDS DSHBRD] showPanelActions positionFloatMenu ', this.positionFloatMenu)
    this.getTdsContainerHeight()
  }

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
  }

  posCenterTopIntentSelected(intent) {
    // add class animation
    var stageElement = document.getElementById(intent.intent_id);
    // let pos = {'x': stageElement.offsetLeft, 'y': stageElement.offsetTop };
    // console.log('posCenterIntentSelected::: ', pos);
    this.stageService.centerStageOnTopPosition(stageElement);
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
    console.log('[CDS DSHBRD] goBack ');
    this.router.navigate(['project/' + this.project._id + '/bots/my-chatbots/all']);
    this.hideShowWidget('show');
  }
  // -------------------------------------------------------
  // @ Open WHEN THE PLAY BUTTON IS CLICKED
  // - test widget
  // @ Close
  // - detail action panel
  // - actions context menu' (static & float),
  // - button configuration panel  
  // -------------------------------------------------------
  onTestItOut(status) {
    console.log('[CDS DSHBRD] onTestItOut  status ', status);
    this.IS_OPEN_PANEL_WIDGET = status
    this.controllerService.closeActionDetailPanel();
    this.controllerService.closeButtonPanel();
    this.intentService.setLiveActiveIntent(null);
    // this.isOpenAddActionsMenu = false;
    if (!this.hasClickedAddAction) {
      this.removeConnectorDraftAndCloseFloatMenu();
    }
  }

  onToggleSidebarWith(IS_OPEN) {
    this.IS_OPEN = IS_OPEN;
  }
  onToogleSidebarIntentsList(IS_OPEN) {
    this.IS_OPEN_INTENTS_LIST = IS_OPEN
  }

  /** START EVENTS PANEL ACTIONS */
  onAddNewAction(action) {
    this.logger.log('[CDS DSHBRD] onAddNewAction ', action)
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
    // -------------------------------------------------------------------------
    // @ Close WHEN AN ACTION IS ADDED ON THE STAGE FROM THE ACTIONS CONTEX MENU
    // - actions context menu (static & float)
    // -------------------------------------------------------------------------
    // this.isOpenAddActionsMenu = false; // nk
    const connectorDraft = this.connectorService.connectorDraft;
    
    if (connectorDraft && connectorDraft.toPoint && !this.hasClickedAddAction) {
      console.log('[CDS-DSHBRD] trascino connettore sullo stage ', event, connectorDraft.toPoint, this.hasClickedAddAction);
      const toPoint = connectorDraft.toPoint;
      // toPoint.x = toPoint.x - 132;
      const fromId = connectorDraft.fromId;
      const newAction = this.intentService.createNewAction(event.type);
      const newIntent = await this.createNewIntentWithAnAction(toPoint, newAction);
      if (newIntent) {
        // const toId = newIntent.intent_id;
        // console.log('[CDS-DSHBRD] sto per creare il connettore ', fromId, toId);
        // this.connectorService.createConnectorFromId(fromId, toId);
        // this.removeConnectorDraftAndCloseFloatMenu();
      }
    } else if (this.hasClickedAddAction) {
      console.log("[CDS-DSHBRD] ho premuto + quindi creo una nuova action e la aggiungo all'intent");
      const newAction = this.intentService.createNewAction(event.type);
      console.log("[CDS-DSHBRD] nuova action creata ", newAction);
      this.intentSelected.actions.push(newAction);
      console.log('propago aggiornamento intent');
      this.intentService.refreshIntent(this.intentSelected);
      console.log("[CDS-DSHBRD] nuova action aggiunta all'intent ", this.intentSelected);
      this.updateIntent();
    }
    this.removeConnectorDraftAndCloseFloatMenu();
  }


  /** 
   * chiamata quando aggiungo (droppandola) una action sullo stage da panel element
   * oppure 
   * chiamata quando aggiungo (droppandola) una action sullo stage spostandola da un altro intent  */
  async onDroppedElementToStage(event: CdkDragDrop<string[]>) {
    console.log('[CDS DSHBRD] droppedElementOnStage:: ', event);
    // recuperare la posizione
    let pos = this.connectorService.tiledeskConnectors.logicPoint(event.dropPoint);
    pos.x = pos.x - 132;
    let action: any = event.previousContainer.data[event.previousIndex];
    if (action.value && action.value.type) {
      // dragging a new action into the stage
      console.log('[CDS DSHBRD] ho draggato una action da panel element sullo stage');
      const newAction = this.intentService.createNewAction(action.value.type);
      const newIntent = await this.createNewIntentWithAnAction(pos, newAction);
    } else if (action) {
      // dragging an action from another intent, into the stage
      console.log('[CDS DSHBRD] ho draggato una action da un intent sullo stage');
      const resp = this.intentService.deleteActionFromPreviousIntentOnMovedAction(event, action);
      if (resp) {
        const newIntent = await this.createNewIntentWithAnAction(pos, action);
        if (newIntent) {
          console.log('[CDS DSHBRD] cancello i connettori della action draggata');
          this.connectorService.deleteConnectorsFromActionByActionId(action._tdActionId);
          const elementID = this.intentService.previousIntentId;
          console.log("[CDS DSHBRD] aggiorno i connettori dell'intent", elementID);
          this.connectorService.movedConnector(elementID);
        }
      }
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
    if (!this.hasClickedAddAction) {
      this.removeConnectorDraftAndCloseFloatMenu();
    }
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
    this.logger.log('[CDS DSHBRD] onOpenActionDrawer - isOpenActioDrawer ', _isOpenActioDrawer)
    this.isOpenActionDrawer = _isOpenActioDrawer;
  }

  onAnswerSelected(answer: string) {
    this.logger.log('[CDS DSHBRD] onAnswerSelected - answer ', answer)
    this.elementIntentSelected = {};
    this.elementIntentSelected['type'] = TYPE_INTENT_ELEMENT.ANSWER;
    this.elementIntentSelected['element'] = answer
    this.isIntentElementSelected = true;
  }


  onActionSelected(event) {
    console.log('[CDS DSHBRD] onActionSelected from PANEL INTENT - action ', event.action, ' - index ', event.index)
    // -------------------------------------------------------
    // @ Close WHEN AN ACTION IS SELECTED FROM AN INTENT
    // - actions context menu (static & float)
    // - button configuration panel 
    // - test widget
    // -------------------------------------------------------
    // this.isOpenAddActionsMenu = false;
    this.controllerService.closeButtonPanel();
    this.IS_OPEN_PANEL_WIDGET = false;

    // @ Remove connectors of the float context menu
    if (!this.hasClickedAddAction) {
      this.removeConnectorDraftAndCloseFloatMenu();
    }

    // this.controllerService.openActionDetailPanel(this.buttonSelected);

    this.elementIntentSelected = {};
    this.elementIntentSelected['type'] = TYPE_INTENT_ELEMENT.ACTION;
    this.elementIntentSelected['element'] = event.action
    this.elementIntentSelected['index'] = event.index
    this.elementIntentSelected['maxLength'] = event.maxLength
    this.elementIntentSelected['intent_display_name'] = event.intent_display_name
    this.isIntentElementSelected = true;
    this.logger.log('[CDS DSHBRD] onActionSelected from PANEL INTENT - this.elementIntentSelected ', this.elementIntentSelected)
    this.intentSelected = this.listOfIntents.find(el => el.intent_id === this.intentService.intentSelectedID)
    this.controllerService.openActionDetailPanel(TYPE_INTENT_ELEMENT.ACTION, this.elementIntentSelected['element'])
  }

  onQuestionSelected(question: string) {
    console.log('[CDS DSHBRD] onQuestionSelected from PANEL INTENT - question ', question)
    // -------------------------------------------------------
    // @ Close WHEN THE QUESTION DETAIL PANEL IS OPENED
    // - actions context menu (static & float)
    // - button configuration panel 
    // - test widget
    // -------------------------------------------------------
    // this.isOpenAddActionsMenu = false;
    this.controllerService.closeButtonPanel();
    this.IS_OPEN_PANEL_WIDGET = false;

    // @ Remove connectors of the float context menu
    if (!this.hasClickedAddAction) {
      this.removeConnectorDraftAndCloseFloatMenu();
    }

    this.elementIntentSelected = {};
    this.elementIntentSelected['type'] = TYPE_INTENT_ELEMENT.QUESTION;
    this.elementIntentSelected['element'] = question
    console.log('[CDS DSHBRD] onQuestionSelected from PANEL INTENT - this.elementIntentSelected ', this.elementIntentSelected)
    this.isIntentElementSelected = true;
    this.intentSelected = this.listOfIntents.find(el => el.intent_id === this.intentService.intentSelectedID)
    this.controllerService.openActionDetailPanel(TYPE_INTENT_ELEMENT.QUESTION, this.elementIntentSelected['element'])
  }

  onIntentFormSelected(intentform: Form) {
    // -------------------------------------------------------
    // @ Close WHEN THE FORM DETAIL PANEL IS OPENED
    // - actions context menu (static & float)
    // - button configuration panel 
    // - test widget
    // -------------------------------------------------------
    // this.isOpenAddActionsMenu = false;
    this.controllerService.closeButtonPanel();
    this.IS_OPEN_PANEL_WIDGET = false;

    // @ Remove connectors of the float context menu
    if (!this.hasClickedAddAction) {
      this.removeConnectorDraftAndCloseFloatMenu();
    }
    this.logger.log('[CDS DSHBRD] onIntentFormSelected - from PANEL INTENT intentform ', intentform)
    this.elementIntentSelected = {};
    this.elementIntentSelected['type'] = TYPE_INTENT_ELEMENT.FORM;
    this.elementIntentSelected['element'] = intentform
    this.logger.log('[CDS DSHBRD] onIntentFormSelected - from PANEL INTENT - this.elementIntentSelected ', this.elementIntentSelected)
    this.isIntentElementSelected = true;
    this.intentSelected = this.listOfIntents.find(el => el.intent_id === this.intentService.intentSelectedID)
    this.controllerService.openActionDetailPanel(TYPE_INTENT_ELEMENT.FORM, this.elementIntentSelected['element'])
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
    console.log('[CDS DSHBRD] onSelectIntent::: ', intent);
    if (!this.hasClickedAddAction) {
      this.removeConnectorDraftAndCloseFloatMenu();
    }
    this.EDIT_VIEW = true;
    this.intentSelected = intent;
    this.isIntentElementSelected = false;
    // this.MOCK_getFaqIntent();
    if (this.intentSelected.actions && this.intentSelected.actions.length > 0) {
      this.logger.log('[CDS DSHBRD] onSelectIntent elementIntentSelected Exist actions', this.intentSelected.actions[0]);
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
  onSavePanelIntentDetail(intentSelected: any) {
    console.log('[CDS DSHBRD] onSavePanelIntentDetail intentSelected ', intentSelected)
    if (intentSelected && intentSelected != null) {
      this.onSaveIntent(intentSelected);
      this.isIntentElementSelected = false;

      // this.controllerService.closeActionDetailPanel();
    } else {
      this.onOpenDialog();
    }
    // this.isIntentElementSelected = false;
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
    const arrayId = button.__idConnector.split("/");
    const idConnector = arrayId[0] ? arrayId[0] : null;
    console.log('onSaveButton: ', idConnector, this.listOfIntents);
    if (idConnector) {
      this.intentSelected = this.listOfIntents.find(obj => obj.intent_id === idConnector);
      console.log('onSaveButton: ', this.intentSelected);
      this.updateIntent();
    }
  }


}
