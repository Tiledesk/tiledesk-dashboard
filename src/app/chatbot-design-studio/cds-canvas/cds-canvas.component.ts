import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TranslateService } from '@ngx-translate/core';


// SERVICES //
import { IntentService } from 'app/chatbot-design-studio/services/intent.service';
import { StageService } from 'app/chatbot-design-studio/services/stage.service';
import { ConnectorService } from 'app/chatbot-design-studio/services/connector.service';
import { ControllerService } from 'app/chatbot-design-studio/services/controller.service';

// MODEL //
import { Intent, Button, Action, Form, ActionReply, Command, Message, ActionAssignVariable, Attributes } from 'app/models/intent-model';

// UTILS //
import { checkIFElementExists, TYPE_INTENT_ELEMENT } from 'app/chatbot-design-studio/utils';

const swal = require('sweetalert');

@Component({
  selector: 'cds-canvas',
  templateUrl: './cds-canvas.component.html',
  styleUrls: ['./cds-canvas.component.scss']
})
export class CdsCanvasComponent implements OnInit {

  @ViewChild('receiver_elements_dropped_on_stage', { static: false }) receiverElementsDroppedOnStage: ElementRef;
  @ViewChild('drawer_of_items_to_zoom_and_drag', { static: false }) drawerOfItemsToZoomAndDrag: ElementRef;

  @Input() id_faq_kb: string;

  IS_OPEN_INTENTS_LIST: boolean = true;
  private subscriptionListOfIntents: Subscription;
  listOfIntents: Array<Intent> = [];
  updatePanelIntentList: boolean = true;


  intentSelected: Intent;
  intent_id: string;
  hasClickedAddAction: boolean = false;
  hideActionPlaceholderOfActionPanel: boolean;

  constructor(
    private intentService: IntentService,
    private stageService: StageService,
    private connectorService: ConnectorService,
    private controllerService: ControllerService,
    private translate: TranslateService
  ) {
    this.setSubscriptions();
  }

  ngOnInit(): void {
    console.log("[CdsCanvasComponent] •••• ngOnInit ••••", this.id_faq_kb);
    this.initialize();
  }

  ngAfterViewInit() {
    console.log("[CdsCanvasComponent] •••• ngAfterViewInit ••••");
    this.stageService.initializeStage();
    this.stageService.setDrawer();
    this.connectorService.initializeConnectors();
    // this.hideShowWidget('show');
    this.addEventListener();
  }


  /** ************************* **/
  /** START CUSTOM FUNCTIONS 
  /** ************************* **/

  /** getIntentPosition: call from html */
  getIntentPosition(intentId: string) {
    return this.intentService.getIntentPosition(intentId);
  }

  private setSubscriptions(){
    /** SUBSCRIBE TO THE INTENT LIST */
    /**
     * Creo una sottoscrizione all'array di INTENT per averlo sempre aggiornato
     * ad ogni modifica (aggiunta eliminazione di un intent)
     */
    this.subscriptionListOfIntents = this.intentService.getIntents().subscribe(intents => {
      console.log("[cds-canvas] --- AGGIORNATO ELENCO INTENTS", intents);
      // this.listOfIntents = intents;
      // this.updatePanelIntentList = !this.updatePanelIntentList;
    });
  }

  private async initialize(){
    this.listOfIntents = [];
    const getAllIntents = await this.intentService.getAllIntents(this.id_faq_kb);
    console.log('Risultato 6:', getAllIntents);
    if (getAllIntents) {
      this.listOfIntents = this.intentService.listOfIntents;
      this.initListOfIntents();
    }
  }

  private initListOfIntents() {
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

  // ---------------------------------------------------------
  // Event listener di eventi Stage e Connectors
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
        // this.removeConnectorDraftAndCloseFloatMenu();
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
        // this.removeConnectorDraftAndCloseFloatMenu();
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
          // this.openFloatMenuOnConnectorDraftReleased(detail);
        } else {
          console.log("ho rilasciato in un punto qualsiasi del DS ma non sullo stage quindi non devo aprire il menu", detail);
          // this.removeConnectorDraftAndCloseFloatMenu();
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
        this.connectorService.addConnectorToList(connector);
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
          // that.removeConnectorDraftAndCloseFloatMenu();
        }
      }
    });

  } // close addEventListener



  // ------------------------------------------
  // @ START DRAG DROP FUNCTIONS 
  // ------------------------------------------
 
  /** setDragAndListnerEventToElements */
  private setDragAndListnerEventToElements() {
    console.log("2 --- AGGIORNO ELENCO LISTNER");
    this.listOfIntents.forEach(intent => {
      this.setDragAndListnerEventToElement(intent);
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

  /** ************************* **/
  /** END DRAG DROP FUNCTIONS 
  /** ************************* **/
 
 
 
/** removeConnectorDraftAndCloseFloatMenu */
 private removeConnectorDraftAndCloseFloatMenu() {
  this.connectorService.removeConnectorDraft();
  // this.isOpenAddActionsMenu = false;
}


/** posCenterIntentSelected */
private posCenterIntentSelected(intent) {
  var stageElement = document.getElementById(intent.intent_id);
  this.stageService.centerStageOnPosition(stageElement);
}


  // EVENTS //

  onShowPanelActions(pos) {
    console.log('onShowPanelActions pos:: ', pos);
    // this.positionPanelActions = pos;
  }


  onHideActionPlaceholderOfActionPanel(event){
    console.log('[CDS DSHBRD] onHideActionPlaceholderOfActionPanel event : ', event);
    // this.hideActionPlaceholderOfActionPanel = event
  }

  // -------------------------------------------------------
  // @ Close WHEN THE ACTION LEFT MENU IS CLICKED
  // - actions context menu (static & float)
  // - test widget
  // -------------------------------------------------------
  onMouseOverActionMenuSx(event: boolean) {
    console.log('[CDS DSHBRD] onMouseOverActionMenuSx ', event)
    // if (event === true) {
    //   this.IS_OPEN_PANEL_WIDGET = false;
    //   // this.isOpenAddActionsMenu = false
    //   // @ Remove connectors of the float context menu
    //   if (!this.hasClickedAddAction) {
    //     this.removeConnectorDraftAndCloseFloatMenu();
    //   }
    // }
  }

  /** START EVENTS PANEL INTENT LIST */
  onSelectIntent(intent: Intent) {
    // console.log('[cds-canvas] onSelectIntent::: ', intent);
    if (!this.hasClickedAddAction) {
      this.removeConnectorDraftAndCloseFloatMenu();
    }
    this.intentSelected = intent;
    this.intentService.selectIntent(intent.intent_id);
    this.posCenterIntentSelected(intent);
  }

 

  /** onDeleteIntent */
  onDeleteIntent(intent: Intent) {
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


  /** Delete Intent **
   * cancello tutti i connettori dell'intent
   * rimuovo l'intent dallo stage
   * elimino intent da remoto
   */
  private async deleteIntent(intent) {
    this.connectorService.deleteConnectorsOfBlock(intent.intent_id);
    this.intentService.deleteIntentToListOfIntents(intent.intent_id);
    this.intentSelected = null;
    this.intentService.deleteIntent(intent.id);
  }

  /** onToogleSidebarIntentsList */
  onToogleSidebarIntentsList() {
    this.IS_OPEN_INTENTS_LIST = !this.IS_OPEN_INTENTS_LIST;
  }


  /** 
   * chiamata quando aggiungo (droppandola) una action sullo stage da panel element
   * oppure 
   * chiamata quando aggiungo (droppandola) una action sullo stage spostandola da un altro intent  */
  async onDroppedElementToStage(event: CdkDragDrop<string[]>) {
    console.log('[CDS DSHBRD] droppedElementOnStage:: ', event);
    // recuperare la posizione
    // let pos = this.connectorService.tiledeskConnectors.logicPoint(event.dropPoint);
    // pos.x = pos.x - 132;
    // let action: any = event.previousContainer.data[event.previousIndex];
    // if (action.value && action.value.type) {
    //   // dragging a new action into the stage
    //   console.log('[CDS DSHBRD] ho draggato una action da panel element sullo stage');
    //   const newAction = this.intentService.createNewAction(action.value.type);
    //   const newIntent = await this.createNewIntentWithAnAction(pos, newAction);
    // } else if (action) {
    //   // dragging an action from another intent, into the stage
    //   console.log('[CDS DSHBRD] ho draggato una action da un intent sullo stage');
    //   const resp = this.intentService.deleteActionFromPreviousIntentOnMovedAction(event, action);
    //   if (resp) {
    //     const newIntent = await this.createNewIntentWithAnAction(pos, action);
    //     if (newIntent) {
    //       console.log('[CDS DSHBRD] cancello i connettori della action draggata');
    //       this.connectorService.deleteConnectorsFromActionByActionId(action._tdActionId);
    //       const elementID = this.intentService.previousIntentId;
    //       console.log("[CDS DSHBRD] aggiorno i connettori dell'intent", elementID);
    //       this.connectorService.movedConnector(elementID);
    //     }
    //   }
    // }
  }


  // EVENT > INTENT //
  /** onActionSelected  **
   * @ Close WHEN AN ACTION IS SELECTED FROM AN INTENT
   * - actions context menu (static & float)
   * - button configuration panel  
   * - test widget
  */
  onActionSelected(event) {
    console.log('[cds-canvas] onActionSelected from PANEL INTENT - action ', event.action, ' - index ', event.index)
    // this.isOpenAddActionsMenu = false;
    // this.controllerService.closeButtonPanel();
    // this.IS_OPEN_PANEL_WIDGET = false;
    // CHIUDI TUTTI I PANNELLI APERTI

    if (!this.hasClickedAddAction) {
      this.removeConnectorDraftAndCloseFloatMenu();
    }
    //// this.controllerService.openActionDetailPanel(this.buttonSelected);
    // this.elementIntentSelected = {};
    // this.elementIntentSelected['type'] = TYPE_INTENT_ELEMENT.ACTION;
    // this.elementIntentSelected['element'] = event.action
    // this.elementIntentSelected['index'] = event.index
    // this.elementIntentSelected['maxLength'] = event.maxLength
    // this.elementIntentSelected['intent_display_name'] = event.intent_display_name;
    // this.isIntentElementSelected = true;
    // this.logger.log('[CDS DSHBRD] onActionSelected from PANEL INTENT - this.elementIntentSelected ', this.elementIntentSelected)
    this.intentSelected = this.listOfIntents.find(el => el.intent_id === this.intentService.intentSelectedID);
    this.controllerService.openActionDetailPanel(TYPE_INTENT_ELEMENT.ACTION, event.action);
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
    // this.controllerService.closeButtonPanel();
    // this.IS_OPEN_PANEL_WIDGET = false;

    // // @ Remove connectors of the float context menu
    // if (!this.hasClickedAddAction) {
    //   this.removeConnectorDraftAndCloseFloatMenu();
    // }

    // this.elementIntentSelected = {};
    // this.elementIntentSelected['type'] = TYPE_INTENT_ELEMENT.QUESTION;
    // this.elementIntentSelected['element'] = question
    // console.log('[CDS DSHBRD] onQuestionSelected from PANEL INTENT - this.elementIntentSelected ', this.elementIntentSelected)
    // this.isIntentElementSelected = true;
    // this.intentSelected = this.listOfIntents.find(el => el.intent_id === this.intentService.intentSelectedID)
    // this.controllerService.openActionDetailPanel(TYPE_INTENT_ELEMENT.QUESTION, this.elementIntentSelected['element'])
  }

  onIntentFormSelected(intentform: Form) {
    // -------------------------------------------------------
    // @ Close WHEN THE FORM DETAIL PANEL IS OPENED
    // - actions context menu (static & float)
    // - button configuration panel 
    // - test widget
    // -------------------------------------------------------
    // this.isOpenAddActionsMenu = false;
    // this.controllerService.closeButtonPanel();
    // this.IS_OPEN_PANEL_WIDGET = false;

    // // @ Remove connectors of the float context menu
    // if (!this.hasClickedAddAction) {
    //   this.removeConnectorDraftAndCloseFloatMenu();
    // }
    // this.logger.log('[CDS DSHBRD] onIntentFormSelected - from PANEL INTENT intentform ', intentform)
    // this.elementIntentSelected = {};
    // this.elementIntentSelected['type'] = TYPE_INTENT_ELEMENT.FORM;
    // this.elementIntentSelected['element'] = intentform
    // this.logger.log('[CDS DSHBRD] onIntentFormSelected - from PANEL INTENT - this.elementIntentSelected ', this.elementIntentSelected)
    // this.isIntentElementSelected = true;
    // this.intentSelected = this.listOfIntents.find(el => el.intent_id === this.intentService.intentSelectedID)
    // this.controllerService.openActionDetailPanel(TYPE_INTENT_ELEMENT.FORM, this.elementIntentSelected['element'])
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
    // this.isOpenAddActionsMenu = true;
    // this.controllerService.closeActionDetailPanel();
    // this.controllerService.closeButtonPanel();
    // this.hasClickedAddAction = event.addAction;
    // console.log('[CDS DSHBRD] showPanelActions hasClickedAddAction:: ', this.hasClickedAddAction);
    // this.IS_OPEN_PANEL_WIDGET = false;
    // // this.isOpenFloatMenu = true;
    // const pos = { 'x': event.x, 'y': event.y }
    // // this.connectorService.tiledeskConnectors.logicPoint(event.dropPoint);
    // this.intentSelected = event.intent;
    // this.positionFloatMenu = pos;
    // console.log('[CDS DSHBRD] showPanelActions intentSelected ', this.intentSelected);
    // console.log('[CDS DSHBRD] showPanelActions positionFloatMenu ', this.positionFloatMenu)
    // this.getTdsContainerHeight()
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
    // this.IS_OPEN_PANEL_WIDGET = status
    // this.controllerService.closeActionDetailPanel();
    // this.controllerService.closeButtonPanel();
    // this.intentService.setLiveActiveIntent(null);
    // // this.isOpenAddActionsMenu = false;
    // if (!this.hasClickedAddAction) {
    //   this.removeConnectorDraftAndCloseFloatMenu();
    // }
  }

  onActionDeleted(event) {
    // this.elementIntentSelected = {};
    // this.elementIntentSelected['type'] = ''
    // this.elementIntentSelected['element'] = null
    // // this.editIntent()
    // this.updateIntent();
  }
}
