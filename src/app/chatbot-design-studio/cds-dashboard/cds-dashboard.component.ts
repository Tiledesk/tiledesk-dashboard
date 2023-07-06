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
import { DragDropService } from 'app/chatbot-design-studio/services/drag-drop.service';
import { IntentService } from 'app/chatbot-design-studio/services/intent.service';
import { ControllerService } from 'app/chatbot-design-studio/services/controller.service';
import { ConnectorService } from 'app/chatbot-design-studio/services/connector.service';
import { StageService } from 'app/chatbot-design-studio/services/stage.service';

// MODEL //
import { Project } from 'app/models/project-model';
import { Chatbot } from 'app/models/faq_kb-model';
import { Intent, Button, Action, Form, ActionReply, Command, Message, ActionAssignVariable, Attributes } from 'app/models/intent-model';


// UTILS //
import { TYPE_ACTION, TYPE_COMMAND, TYPE_INTENT_ELEMENT, EXTERNAL_URL, TYPE_MESSAGE, TIME_WAIT_DEFAULT, variableList, convertJsonToArray } from 'app/chatbot-design-studio/utils';
const swal = require('sweetalert');

// COMPONENTS //
import { DialogYesNoComponent } from 'app/chatbot-design-studio/cds-base-element/dialog-yes-no/dialog-yes-no.component';


@Component({
  selector: 'appdashboard-cds-dashboard',
  templateUrl: './cds-dashboard.component.html',
  styleUrls: ['./cds-dashboard.component.scss']
})
export class CdsDashboardComponent implements OnInit {


  @ViewChild('receiver_elements_dropped_on_stage') receiverElementsDroppedOnStage: ElementRef;
  @ViewChild('drawer_of_items_to_zoom_and_drag') drawerOfItemsToZoomAndDrag: ElementRef;

  private subscriptionListOfIntents: Subscription;

  updatePanelIntentList: boolean = true;
  listOfIntents: Array<Intent> = [];

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
  public TESTSITE_BASE_URL: string;

  // Attach bot to dept
  dept_id: string;
  translateparamBotName: any;

  
  isOpenPanelButtonConfig: boolean = false;
  buttonSelected: any;

  isOpenPanelActions: boolean = true;
  positionPanelActions: any;

  tiledeskStage: any; 
  isOpenFloatMenu: boolean = false;
  positionFloatMenu: any = {'x':0, 'y':0};
  connectorDraft: any = {};

  isSaving: boolean = false;

  // isBetaUrl: boolean;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    public location: Location,
    private logger: LoggerService,
    private dragDropService:DragDropService,
    private intentService: IntentService,
    private controllerService: ControllerService,
    private connectorService: ConnectorService,
    private stageService: StageService,
    private faqKbService: FaqKbService,
    public dialog: MatDialog,
    private translate: TranslateService
  ) { 

    /** SUBSCRIBE TO THE INTENT LIST */
    this.subscriptionListOfIntents = this.intentService.getIntents().subscribe(intents => {
      /* 
      * variabile booleana aggiunta per far scattare l'onchange nei componenti importati dalla dashboard
      * ngOnChanges funziona sugli @import degli elementi primitivi!!!  
      */
      this.updatePanelIntentList = !this.updatePanelIntentList;
      this.listOfIntents = intents;
      this.intentService.setListOfActions(this.listOfIntents);
      this.listOfActions = this.intentService.getListOfActions();
      /** SET DRAG STAGE AND CREATE CONNECTORS */
      setTimeout(() => {
        this.setDragAndListnerEventToElements();
        this.connectorService.createConnectors(this.listOfIntents);
      }, 0);
    });

    /** SUBSCRIBE TO THE STATE BUTTON PANEL */
    this.controllerService.isOpenButtonPanel$.subscribe((button: Button) => {
      this.buttonSelected = button;
      if(button){
        this.isOpenPanelButtonConfig = true;
      } else {
        this.isOpenPanelButtonConfig = false;
      }
      // console.log('isOpenButtonPanel ', this.isOpenPanelButtonConfig);
    });
    
  } 


  // SYSTEM FUNCTIONS //
  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    this.executeAsyncFunctionsInSequence();
  }

  ngAfterViewInit(){
    this.stageService.initializeStage();
    this.tiledeskStage = this.stageService.tiledeskStage;
    this.tiledeskStage.setDrawer();

    this.hideShowWidget('show');
    this.connectorService.initializeConnectors();

    this.addEventListener();
  }


  /** */
  addEventListener(){
    let that = this;

    /** LISTNER OF TILEDESK STAGE */
    document.addEventListener(
      "moved-and-scaled", (e:CustomEvent) => {
        this.connectorService.tiledeskConnectors.scale = e.detail.scale;
        this.removeConnectorDraftAndCloseFloatMenu();
      },
      false
    );

    document.addEventListener(
      "dragged", (e:CustomEvent) => {
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
      "connector-draft-released", (e:CustomEvent) => {
        if (e.detail.target.classList.contains("tds_container")) {
          // console.log("connector-draft-released event, catched on 'stage'");
          // this.tiledeskConnectors.removeConnectorDraft();
        }
        else {
          // console.log("connector-draft-released event, catched but unsupported", e.detail);
          this.positionFloatMenu = this.tiledeskStage.physicPointCorrector(e.detail.menuPoint);
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
        const connector = e.detail.connector;
        console.log("connector-created:", connector);
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
      "connector-deleted", (e:CustomEvent) => {
        console.log("connector-deleted:", e);
        const connector = e.detail.connector;
        connector['deleted'] = true;
        // this.connector['toId'] = ''; // serve per farlo scattare sempre!!!
        console.log("connector-deleted:", connector.id);
        // delete this.connectors[this.connector.id];
        // console.log("connector-deleted:", this.connectors);
        // delete this.connectors[this.connector.id];
        this.connectorService.deleteConnector(connector.id);
        // this.connectors = this.intentService.botAttributes.connectors;
        // this.intentService.setConnectorsInDashboardAttributes(this.id_faq_kb, this.connectors);
        this.intentService.onChangedConnector(connector);
      },
      true
    );
    

    /** LISTNER OF FLOAT MENU */
    /** mouseup */
    document.addEventListener('mouseup', function() {
      if (that.isOpenFloatMenu) {
        that.removeConnectorDraftAndCloseFloatMenu();
      }
    });

    /** keydown */
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Backspace' || event.key === 'Escape' || event.key === 'Canc' && that.isOpenFloatMenu) {
        that.removeConnectorDraftAndCloseFloatMenu();
      }
    });
  }

  ngOnDestroy() {
    this.subscriptionListOfIntents.unsubscribe();
  }


  
  async executeAsyncFunctionsInSequence() {
    console.log('executeAsyncFunctionsInSequence -------------> ');
    // Le funzioni asincrone sono state eseguite in coda
    try {
      const GetTranslations = await this.getTranslations();
      console.log('Risultato 1:', GetTranslations);
      const GetUrlParams = await this.getUrlParams();
      console.log('Risultato 2:', GetUrlParams, this.id_faq_kb);
      if (this.id_faq_kb) {
        const GetBotById = await this.getBotById(this.id_faq_kb);
        console.log('Risultato 3:', GetBotById, this.selectedChatbot);
        if(this.selectedChatbot){
          this.configChatbotSelected();
        }
      }
      const getCurrentProject = await this.getCurrentProject();
      console.log('Risultato 4:', getCurrentProject);
      const getBrowserVersion = await this.getBrowserVersion();
      console.log('Risultato 5:', getBrowserVersion);
      const getAllIntents = await this.intentService.getAllIntents(this.id_faq_kb);
      console.log('Risultato 6:', getAllIntents );
      if(getAllIntents){
        // !!! il valore di listOfIntents è bindato nel costructor con subscriptionListOfIntents !!! // 
      }
    } catch (error) {
      console.error('error: ', error);
    }
  }



  /** ************************* **/
  /** START CUSTOM FUNCTIONS 
  /** ************************* **/

  /** */
  private removeConnectorDraftAndCloseFloatMenu(){
    this.connectorService.tiledeskConnectors.removeConnectorDraft();
    this.isOpenFloatMenu = false;
  }

  /** configChatbotSelected */
  /** recupero le posizioni degli intent sullo stage */
  private configChatbotSelected(){
    let attributes = {}
    if(this.selectedChatbot.attributes){
      attributes = this.selectedChatbot.attributes;
    }
    this.intentService.setDashboardAttributes(this.id_faq_kb, attributes);
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
  private setDragAndListnerEventToElements(){
    this.listOfIntents.forEach(intent => {
      this.setDragAndListnerEvent(intent);
    });
  }

  /** setDragAndListnerEvent */
  private setDragAndListnerEvent(intent){
    let that = this;
    if(intent.intent_id){
      this.removeDragAndListnerEventToElements(intent);
        try {
          let elem = document.getElementById(intent.intent_id);  
          this.tiledeskStage.setDragElement(intent.intent_id);
          setTimeout(() => {
            // **************** !!!!!!!! aggiungo listner !!!!!!! *******************//
            // Aggiungi l'event listener con i parametri
            elem.addEventListener('mouseup', function() {
              that.onMouseUpIntent(intent, elem);
            });
            // Aggiungi l'event listener con i parametri
            elem.addEventListener('mousedown', function() {
              that.onMouseDownIntent(elem);
            });
            // Aggiungi l'event listener con i parametri
            elem.addEventListener('mousemove', function() {
              that.onMouseMoveIntent(elem);
            });
          }, 500);
        } catch (error) {
          console.error('ERROR', error);
        }
    }
  }

  /** */
  private removeDragAndListnerEventToElements(intent){
    let that = this;
    try {
      let elem = document.getElementById(intent.intent_id);
      setTimeout(() => {
        // **************** !!!!!!!! aggiungo listner !!!!!!! *******************//
        elem.removeEventListener('mouseup', function() {
          that.onMouseUpIntent(intent, elem);
        });
        // Rimuovi l'event listener con i parametri
        elem.removeEventListener('mousedown', function() {
          that.onMouseDownIntent(elem);
        });
        // Rimuovi l'event listener con i parametri
        elem.removeEventListener('mousemove', function() {
          that.onMouseMoveIntent(elem);
        });
      }, 500);
    } catch (error) {
      console.error('ERROR: ', error);
    }
  }

  /** */
  onMouseDownIntent(element): void{
    const x = element.offsetLeft; 
    const y = element.offsetTop; 
    element.style.zIndex = 2;
    // console.log("CHIAMA ON mouseDown x:", x, " y: ",y);
  }

  /** */
  onMouseUpIntent(intent:any, element:any){
    let newPos = {'x':element.offsetLeft, 'y':element.offsetTop};
    let pos = this.intentService.getIntentPosition(intent.id);
    if(newPos.x != pos.x || newPos.y != pos.y){
      element.style.zIndex = 'auto';
      // console.log("setIntentPosition x:", newPos.x, " y: ",newPos.y);
      this.intentService.setIntentPosition(intent.id, newPos);
      // this.intentService.setDashboardAttributes(this.dashboardAttributes);
    }
    // this.isOpenPanelDetail = true;
  }

  /** */
  onMouseMoveIntent(element: any){
  }


  /** getIntentPosition: call from html */
  getIntentPosition(id: string){
    return this.intentService.getIntentPosition(id);
  }

  // getIntentPosition(id: string){
  //   let pos = {'x':0, 'y':0};
  //   const positions = this.intentService.listOfPositions;
  //   if(!positions)return pos;
  //   if(positions && positions[id]){
  //     return positions[id];
  //   }
  //   return pos;
  // }

  // /** Imposto la posizione di un intent */
  // setIntentPosition(id:string, newPos: any){
  //   const positions = this.intentService.listOfPositions;
  //   console.log('setIntentPosition id ----------->', id, positions);
  //   if(positions){
  //     if(!newPos && positions[id]){
  //       positions[id].remove();
  //     } else {
  //       positions[id] =  {'x': newPos.x, 'y': newPos.y};
  //       // console.log('setIntentPosition id ----------->', id, this.dashboardAttributes.positions[id]);
  //     }
  //     this.intentService.setPositionsInDashboardAttributes(positions);
  //   }
  // }


  /** */
  private async addNewIntent(pos, actionType){
    this.CREATE_VIEW = true;
    this.intentSelected = this.intentService.createIntent(this.id_faq_kb, actionType);
    this.intentSelected.id = 'new';
    this.intentService.setIntentPosition('new', pos);
    const idNewIntent = await this.intentService.addNewIntent(this.id_faq_kb, this.intentSelected);
    this.intentSelected.id = idNewIntent;
    console.log('creatIntent: OK ', idNewIntent);
    if(idNewIntent){
      // !!! il valore di listOfIntents è bindato nel costructor con subscriptionListOfIntents !!! //
      this.intentService.setIntentPosition(idNewIntent, pos);
      this.setDragAndListnerEvent(this.intentSelected);
      // this.TiledeskStage.setDragElement(idNewIntent);
    }
    return idNewIntent;
  }

  /** deleteIntent */
  private async deleteIntent(intent) {
    const deleteIntent = await this.intentService.deleteIntent(intent.id);
    if(deleteIntent){
      console.log('deleteIntent:: ', deleteIntent, intent.id);
      this.intentSelected = null;
      this.elementIntentSelected = {};
      this.elementIntentSelected['type'] = '';
      this.elementIntentSelected['element'] = null;
      // !!! il valore di listOfIntents è bindato nel costructor con subscriptionListOfIntents !!! //
      this.removeDragAndListnerEventToElements(intent);
      // cancello tutti i connettori dell'intent
      this.connectorService.deleteConnectorsOfBlock(intent.intent_id);

      // !!! chiama patch positioni !!!!
      
      swal(this.translate.instant('Done') + "!", this.translate.instant('FaqPage.AnswerSuccessfullyDeleted'), {
        icon: "success",
      }).then(() => {
        this.intentService.setIntentPosition(intent.intent_id, null);
      })
    } else {
      swal(this.translate.instant('AnErrorOccurredWhilDeletingTheAnswer'), {
        icon: "error"
      })
    }
  }

  /** EDIT INTENT  */
  private async updateIntent(){
    if(this.isSaving === false){
      setTimeout(async () => {
        this.isSaving = true;
        console.log('******** updateIntent ******** ', this.intentSelected);
        const response = await this.intentService.updateIntent(this.intentSelected);
        if(response){
          this.isSaving = false;
          console.log('updateIntent: OK', this.intentSelected);
        }
      }, 500);
    }
  }


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
    // this.editIntent();
    this.updateIntent();
  }
}

  posCenterIntentSelected(intent){
    // add class animation
    var stageElement = document.getElementById(intent.intent_id);
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

  /** ************************* **/ 
  /** END DRAG DROP FUNCTIONS 
  /** ************************* **/


  






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
    if(toId){
      this.connectorService.tiledeskConnectors.createConnector(fromId, toId, fromPoint, toPoint);
    }
    this.removeConnectorDraftAndCloseFloatMenu();
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

  
  

 

 

  /** END CUSTOM FUNCTIONS */



  onClosePanel(){

  }


  onSaveButton(button:Button){
    const arrayId = button.idConnector.split("/");
    const idConnector = arrayId[0]?arrayId[0]:null;
    console.log('onSaveButton: ', idConnector, this.listOfIntents);
    if(idConnector){
      this.intentSelected = this.listOfIntents.find(obj => obj.intent_id === idConnector);
      console.log('onSaveButton: ', this.intentSelected);
      this.updateIntent();
    }
  }
  

}
