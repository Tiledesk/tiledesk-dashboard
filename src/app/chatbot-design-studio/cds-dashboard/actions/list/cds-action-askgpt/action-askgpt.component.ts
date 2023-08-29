import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActionAskGPT } from 'app/models/intent-model';
import { LoggerService } from 'app/services/logger/logger.service';
import { variableList } from 'app/chatbot-design-studio/utils';
import { MatDialog } from '@angular/material/dialog';
import { AddkbDialogComponent } from './addkb-dialog/addkb-dialog.component';
import { GptService } from 'app/chatbot-design-studio/services/gpt.service';
import { DialogYesNoComponent } from 'app/chatbot-design-studio/cds-base-element/dialog-yes-no/dialog-yes-no.component';
import { OpenaikbsService } from 'app/services/openaikbs.service';


@Component({
  selector: 'cds-action-askgpt',
  templateUrl: './action-askgpt.component.html',
  styleUrls: ['./action-askgpt.component.scss']
})
export class CdsActionAskgptComponent implements OnInit {

  @Input() action: ActionAskGPT;
  @Input() previewMode: boolean = true;
  @Input() project_id: string;
  @Output() updateAndSaveAction = new EventEmitter;

  kbs_list = [];
  kb_selected_id: null;
  kb_selected_name: null;
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
    private gptService: GptService
  ) { }

  ngOnInit(): void {
    this.logger.debug("[ACTION-ASKGPT] action detail: ", this.action);
    this.question = this.action.question;
    this.kbid = this.action.kbid;
    this.gptkey = this.action.gptkey;

    this.getAllOpenaiKbs();
    this.initializeAttributes();
  }

  getAllOpenaiKbs() {
    this.openaikbService.getAllOpenaikbs().subscribe((kbs: any[]) => {
      this.kbs_list = kbs.map(t => {
        t.icon = "language"
        return t;
      })
      console.log("kbid: ", this.action.kbid);
      if (this.action.kbid) {
        this.kb_selected_id = this.kbs_list.find(k => k.url === this.action.kbid)._id;
        this.kb_selected_name = this.kbs_list.find(k => k.url === this.action.kbid).name;
        this.checkKbStatus(this.action.kbid);
      }
      this.checkLimit();
    }, (error) => {
      this.logger.error("[ACTION ASKGPT] ERROR get openai kbs: ", error);
    }, () => {
      this.logger.info("[ACTION ASKGPT] get openai kbs *COMPLETED*");
    })
  }

  checkLimit() {
    console.log("checking limit...")
    if (this.kbs_list.length >= 3) {
      this.buttonDisabled = true;
      this.buttonIcon = null;
      this.buttonText = "Maximum number of Knwoledge Bases reached"
    } else {
      this.buttonDisabled = false;
      this.buttonIcon = "add";
      this.buttonText = "Add Knowledge Bases"
    }
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
    this.logger.debug("Initialized variableList.userDefined: ", variableList.userDefined);
  }

  changeTextarea($event: string, property: string) {
    this.logger.log("[ACTION-ASKGPT] onEditableDivTextChange event", $event)
    this.logger.log("[ACTION-ASKGPT] onEditableDivTextChange property", property)
    this.action[property] = $event
  }

  onSelectedAttribute(event, property) {
    this.logger.log("[ACTION-ASKGPT] onEditableDivTextChange event", event)
    this.logger.log("[ACTION-ASKGPT] onEditableDivTextChange property", property)
    this.action[property] = event.value;
  }

  onChangeSelect(event) {
    if (event.clickEvent === 'footer') {
      this.openAddKbDialog();
    } else {
      this.action.kbid = event.url;
      this.kb_selected_id = this.kbs_list.find(k => k.url === this.action.kbid)._id;
      this.checkKbStatus(this.action.kbid);
      this.logger.log("[ACTION-ASKGPT] updated action", this.action);
    }
  }

  onDeleteSelect(id) {
    this.openDeleteDialog(id);
  }

  openDeleteDialog(id) {
    const dialogRef = this.dialog.open(DialogYesNoComponent, {
      panelClass: 'custom-dialog-container',
      data: { title: 'Delete Knowledge base', text: 'Are you sure you want to delete permanently this Knwoledge base?', yes: 'Delete', no: 'Cancel' }
    })
    dialogRef.afterClosed().subscribe(result => {
      if (result && result !== undefined && result !== false) {
        this.deleteKb(id);
      }
    })
  }

  deleteKb(id: string) {
    if (this.kb_selected_id === id) {
      this.action.kbid = null;
      this.kb_selected_id = null;
      this.status_code = null;
    }
    this.openaikbService.deleteOpenaiKb(id).subscribe((deletedKb) => {
      this.logger.info("deletedKb response ", deletedKb);
      console.log("deletedKb response ", deletedKb);
      this.getAllOpenaiKbs();
    }, (error) => {
      this.logger.error("[ACTION ASKGPT] ERROR delete kb: ", error);
    }, () => {
      this.logger.info("[ACTION ASKGPT] delete kb *COMPLETE*");
    })
  }

  openAddKbDialog() {
    const dialogRef = this.dialog.open(AddkbDialogComponent, {
      panelClass: 'custom-dialog-container',
      data: { name: '', url: '' }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.logger.info("[ACTION ASKGPT] Dialog result - new openai kb: ", result);
      if (result && result.name && result.url) {
        this.saveOpenaiKb(result);
      }
    });
  }

  saveOpenaiKb(new_kb) {
    this.openaikbService.addOpenaiKb(new_kb).subscribe((savedKb) => {
      this.getAllOpenaiKbs();
    }, (error) => {
      this.logger.error("[ACTION ASKGPT] ERROR add new kb: ", error);
    }, () => {
      this.logger.info("[ACTION ASKGPT] add new kb *COMPLETED*");
    })
  }

  startKbIndexing() {

    this.spinner = true;
    if (!this.action.gptkey) {
      this.indexing_hint = "Missing GPT Key"
      this.spinner = false;
    } else {
      let data = {
        full_url: this.action.kbid,
        gptkey: this.action.gptkey
      }

      this.gptService.startScraping(data).subscribe((response: any) => {
        if (response.message === 'Invalid Openai API key') {
          this.indexing_hint = response.message;
        }
        this.checkKbStatus(this.action.kbid);
      }, (error) => {
        this.logger.error("[ACTION ASKGPT] error start indexing: ", error);
        this.indexing_hint = error.message;
        this.spinner = false;
      }, () => {
        this.logger.log("[ACTION ASKGPT] start indexing *COMPLETE*");
      })
    }
  }

  checkKbStatus(kbid) {
    let data = {
      full_url: kbid 
    }
    this.gptService.checkScrapingStatus(data).subscribe((status: any) => {
      this.spinner = false;
      this.logger.log("[ACTION ASKGPT] Scraping status: ", status);
      this.status_code = status.status_code;;
    }, (error) => {
      this.logger.error("[ACTION ASKGPT] error getting scraping status: ", error);
    }, () => {
      this.logger.log("[ACTION ASKGPT] get scraping status *COMPLETE*")
    })
  }
}
