import { Component, EventEmitter, HostListener, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActionAskGPT, Intent } from 'app/models/intent-model';
import { LoggerService } from 'app/services/logger/logger.service';
import { variableList } from 'app/chatbot-design-studio/utils';
import { MatDialog } from '@angular/material/dialog';
import { AddkbDialogComponent } from './addkb-dialog/addkb-dialog.component';
import { GptService } from 'app/chatbot-design-studio/services/gpt.service';
import { DialogYesNoComponent } from 'app/chatbot-design-studio/cds-base-element/dialog-yes-no/dialog-yes-no.component';
import { OpenaikbsService } from 'app/services/openaikbs.service';
import { IntentService } from 'app/chatbot-design-studio/services/intent.service';


@Component({
  selector: 'cds-action-askgpt',
  templateUrl: './cds-action-askgpt.component.html',
  styleUrls: ['./cds-action-askgpt.component.scss']
})
export class CdsActionAskgptComponent implements OnInit {

  @Input() intentSelected: Intent;
  @Input() action: ActionAskGPT;
  @Input() previewMode: boolean = true;
  @Input() project_id: string;
  @Output() updateAndSaveAction = new EventEmitter;
  @Output() onCreateUpdateConnector = new EventEmitter<{fromId: string, toId: string}>()
  
  listOfIntents: Array<{name: string, value: string, icon?:string}>;

  // Connectors
  idIntentSelected: string;
  idConnectorTrue: string;
  idConnectorFalse: string;
  isConnectedTrue: boolean = false;
  isConnectedFalse: boolean = false;
  connector: any;

  kbs_list = [];
  kb_selected_id: string = '';
  kb_selected_name: string = '';
  status_code: number;
  indexing_hint: string = null;

  question: string = "";
  kbid: string = "";
  gptkey: string = "";
  buttonDisabled: boolean = false;
  buttonIcon: string = "add"
  buttonText: string = "Add Knowledge Base";

  idBot: string;
  variableListUserDefined: Array<{ name: string, value: string }> // = variableList.userDefined 
  spinner: boolean = false;

  constructor(
    private logger: LoggerService,
    private openaikbService: OpenaikbsService,
    public dialog: MatDialog,
    private gptService: GptService,
    private intentService: IntentService
  ) { }

  ngOnInit(): void {
    this.logger.debug("[ACTION-ASKGPT] action detail: ", this.action);
    this.question = this.action.question;
    this.kbid = this.action.kbid;
    this.gptkey = this.action.gptkey;

    this.intentService.isChangedConnector$.subscribe((connector: any) => {
      this.logger.debug('[ACTION-ASKGPT] isChangedConnector -->', connector);
      this.connector = connector;
      this.updateConnector();
    });

    this.getAllOpenaiKbs();
    this.initializeAttributes();
  }

  ngOnChanges(changes: SimpleChanges) {
    if(this.intentSelected){
      this.initializeConnector();
    }
    console.log('changessssssss', this.previewMode, this.action)
  }

  initializeConnector() {
    this.idIntentSelected = this.intentSelected.intent_id;
    this.idConnectorTrue = this.idIntentSelected+'/'+this.action._tdActionId + '/true';
    this.idConnectorFalse = this.idIntentSelected+'/'+this.action._tdActionId + '/false';

    this.listOfIntents = this.intentService.getListOfIntents()
  }

  private updateConnector(){
    try {
      const array = this.connector.fromId.split("/");
      const idAction= array[1];
      if(idAction === this.action._tdActionId){
        if(this.connector.deleted){ //TODO: verificare quale dei due connettori è stato eliminato e impostare isConnected a false
          // DELETE 
          if(array[array.length -1] === 'true'){
            this.action.trueIntent = null
            this.isConnectedTrue = false
          }        
          if(array[array.length -1] === 'false'){
            this.action.falseIntent = null
            this.isConnectedFalse = false;
          }
        } else { //TODO: verificare quale dei due connettori è stato aggiunto (controllare il valore della action corrispondente al true/false intent)
          // ADD / EDIT
          this.logger.debug('[ACTION-ASKGPT] updateConnector', this.connector.toId, this.connector.fromId ,this.action, array[array.length-1]);
          if(array[array.length -1] === 'true'){
            this.action.trueIntent = '#'+this.connector.toId;
            this.isConnectedTrue = true
          }        
          if(array[array.length -1] === 'false'){
            this.action.falseIntent = '#'+this.connector.toId;
            this.isConnectedFalse = true;
          }
        }

        this.updateAndSaveAction.emit();
      }
    } catch (error) {
      this.logger.error('[ACTION-ASKGPT] updateConnector error: ', error);
    }
  }

  getAllOpenaiKbs() {
    this.openaikbService.getAllOpenaikbs().subscribe((kbs: any[]) => {
      this.kbs_list = kbs.map(t => {
        t.icon = "language"
        return t;
      })
      if (this.action.kbid) {
        this.kb_selected_id = this.kbs_list.find(k => k.url === this.action.kbid)._id;
        this.kb_selected_name = this.kbs_list.find(k => k.url === this.action.kbid).name;
        //this.checkKbStatus(this.action.kbid);
      }
      //this.checkLimit();
    }, (error) => {
      this.logger.error("[ACTION ASKGPT] ERROR get openai kbs: ", error);
    }, () => {
      this.logger.info("[ACTION ASKGPT] get openai kbs *COMPLETED*");
    })
  }

  private initializeAttributes() {
    let new_attributes = [];
    if (!variableList.userDefined.some(v => v.name === 'gpt_reply')) {
      new_attributes.push({ name: "gpt_reply", value: "gpt_reply" });
    }
    if (!variableList.userDefined.some(v => v.name === 'gpt_source')) {
      new_attributes.push({ name: "gpt_source", value: "gpt_source" });
    }
    if (!variableList.userDefined.some(v => v.name === 'gpt_success')) {
      new_attributes.push({ name: "gpt_success", value: "gpt_success" });
    }
    variableList.userDefined = [ ...variableList.userDefined, ...new_attributes];
    this.logger.debug("[ACTION ASKGPT] Initialized variableList.userDefined: ", variableList.userDefined);
  }

  changeTextarea($event: string, property: string) {
    this.logger.log("[ACTION-ASKGPT] onEditableDivTextChange event", $event)
    this.logger.log("[ACTION-ASKGPT] onEditableDivTextChange property", property)
    this.action[property] = $event
    this.updateAndSaveAction.emit();
  }

  onSelectedAttribute(event, property) {
    this.logger.log("[ACTION-ASKGPT] onEditableDivTextChange event", event)
    this.logger.log("[ACTION-ASKGPT] onEditableDivTextChange property", property)
    this.action[property] = event.value;
    this.updateAndSaveAction.emit();
  }

  onChangeSelect(event) {
    if (event.clickEvent === 'footer') {
      // this.openAddKbDialog();  moved in knowledge base settings
    } else {
      this.action.kbid = event.url;
      this.action.gptkey = event.gptkey;
      this.kb_selected_id = this.kbs_list.find(k => k.url === this.action.kbid)._id;
      this.kb_selected_name = this.kbs_list.find(k => k.url === this.action.kbid).name;
      //this.checkKbStatus(this.action.kbid);
      console.log("[ACTION-ASKGPT] updated action", this.action, this.kb_selected_name);
      this.updateAndSaveAction.emit();
    }
  }

  onChangeBlockSelect(event:{name: string, value: string}, type: 'trueIntent' | 'falseIntent') {
    if(event){
      this.action[type]=event.value
    }

    switch(type){
      case 'trueIntent':
        this.onCreateUpdateConnector.emit({ fromId: this.idConnectorTrue, toId: this.action.trueIntent})
        break;
      case 'falseIntent':
        this.onCreateUpdateConnector.emit({fromId: this.idConnectorFalse, toId: this.action.falseIntent})
        break;
    }
    this.updateAndSaveAction.emit();
  }
  
  onChangeAttributes(attributes:any, type:'trueIntent' | 'falseIntent'){
    console.log("type: ", type)
    console.log("attributes: ", attributes)
    if (type === 'trueIntent') {
      this.action.trueIntentAttributes = attributes;
    }
    if (type === 'falseIntent') {
      this.action.falseIntentAttributes = attributes;
    }
    console.log("action updated: ", this.action)
  }


  getValue(key: string): string{
    let value = ''
    if(this.kbs_list && this.kbs_list.length > 0)
      value = this.kbs_list.find(el => el.url === this.action.kbid)[key]
    return value   
  }

  @HostListener('document:visibilitychange')
  visibilitychange() {
    if (!document.hidden) {
      this.getAllOpenaiKbs();
    }
  }


  // -----------------
  // TO CHECK / DELETE
  // -----------------

  // openAddKbDialog() {
  //   const dialogRef = this.dialog.open(AddkbDialogComponent, {
  //     panelClass: 'custom-dialog-container',
  //     data: { name: '', url: '' }
  //   });
  //   dialogRef.afterClosed().subscribe(result => {
  //     this.logger.info("[ACTION ASKGPT] Dialog result - new openai kb: ", result);
  //     if (result && result.name && result.url) {
  //       this.saveOpenaiKb(result);
  //     }
  //   });
  // }

  // saveOpenaiKb(new_kb) {
  //   this.openaikbService.addOpenaiKb(new_kb).subscribe((savedKb) => {
  //     this.getAllOpenaiKbs();
  //   }, (error) => {
  //     this.logger.error("[ACTION ASKGPT] ERROR add new kb: ", error);
  //   }, () => {
  //     this.logger.info("[ACTION ASKGPT] add new kb *COMPLETED*");
  //   })
  // }

  // onDeleteSelect(id) {
  //   this.openDeleteDialog(id);
  // }

  // openDeleteDialog(id) {
  //   const dialogRef = this.dialog.open(DialogYesNoComponent, {
  //     panelClass: 'custom-dialog-container',
  //     data: { title: 'Delete Knowledge base', text: 'Are you sure you want to delete permanently this Knwoledge base?', yes: 'Delete', no: 'Cancel' }
  //   })
  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result && result !== undefined && result !== false) {
  //       this.deleteKb(id);
  //     }
  //   })
  // }

  // deleteKb(id: string) {
  //   if (this.kb_selected_id === id) {
  //     this.action.kbid = null;
  //     this.kb_selected_id = null;
  //     this.status_code = null;
  //   }
  //   this.openaikbService.deleteOpenaiKb(id).subscribe((deletedKb) => {
  //     this.logger.info("deletedKb response ", deletedKb);
  //     console.log("deletedKb response ", deletedKb);
  //     this.getAllOpenaiKbs();
  //   }, (error) => {
  //     this.logger.error("[ACTION ASKGPT] ERROR delete kb: ", error);
  //   }, () => {
  //     this.logger.info("[ACTION ASKGPT] delete kb *COMPLETE*");
  //   })
  // }

  // checkKbStatus(kbid) {
  //   let data = {
  //     full_url: kbid 
  //   }
  //   this.gptService.checkScrapingStatus(data).subscribe((status: any) => {
  //     this.spinner = false;
  //     this.logger.log("[ACTION ASKGPT] Scraping status: ", status);
  //     this.status_code = status.status_code;;
  //   }, (error) => {
  //     this.logger.error("[ACTION ASKGPT] error getting scraping status: ", error);
  //   }, () => {
  //     this.logger.log("[ACTION ASKGPT] get scraping status *COMPLETE*")
  //   })
  // }

  // startKbIndexing() {

  //   this.spinner = true;
  //   if (!this.action.gptkey) {
  //     this.indexing_hint = "Missing GPT Key"
  //     this.spinner = false;
  //   } else {
  //     let data = {
  //       full_url: this.action.kbid,
  //       gptkey: this.action.gptkey
  //     }

  //     this.gptService.startScraping(data).subscribe((response: any) => {
  //       if (response.message === 'Invalid Openai API key') {
  //         this.indexing_hint = response.message;
  //       }
  //       this.checkKbStatus(this.action.kbid);
  //     }, (error) => {
  //       this.logger.error("[ACTION ASKGPT] error start indexing: ", error);
  //       this.indexing_hint = error.message;
  //       this.spinner = false;
  //     }, () => {
  //       this.logger.log("[ACTION ASKGPT] start indexing *COMPLETE*");
  //     })
  //   }
  // }

  // checkLimit() {
  //   if (this.kbs_list.length >= 3) {
  //     this.buttonDisabled = true;
  //     this.buttonIcon = null;
  //     this.buttonText = "Maximum number of Knwoledge Bases reached"
  //   } else {
  //     this.buttonDisabled = false;
  //     this.buttonIcon = "add";
  //     this.buttonText = "Add Knowledge Bases"
  //   }
  // }

}
