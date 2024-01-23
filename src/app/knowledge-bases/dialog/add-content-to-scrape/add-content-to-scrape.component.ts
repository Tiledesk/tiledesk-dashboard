import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { KB, KbSettings } from 'app/models/kbsettings-model';
import { LoggerService } from 'app/services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'appdashboard-add-content-to-scrape',
  templateUrl: './add-content-to-scrape.component.html',
  styleUrls: ['./add-content-to-scrape.component.scss']
})
export class AddContentToScrapeComponent implements OnInit {

  modalAddContent: string = 'block';
  buttonDisabledPageUrl: boolean = true;
  kbForm: FormGroup;

  kbSettings: KbSettings = {
    _id: null,
    id_project: null,
    gptkey: null,
    maxKbsNumber: null,
    maxPagesNumber: null,
    kbs: []
  }

  newKb: KB = {
    _id: null,
    name: '',
    url: '',
    title: ''
  }


  constructor(
    public dialogRef: MatDialogRef<AddContentToScrapeComponent>,
    private formBuilder: FormBuilder,
    private kbService: KnowledgeBaseService,
    private logger: LoggerService,
  ) { }

  ngOnInit(): void {
    this.kbForm = this.createConditionGroup();
  }

    
  createConditionGroup(): FormGroup {
    return this.formBuilder.group({
      url: ['', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]],
      title: ['', [Validators.required,Validators.pattern('^[a-zA-Z0-9]{3,}$')]],
      textFile: ['', [Validators.required,Validators.pattern('^[a-zA-Z0-9]{3,}$')]]
    })
  }


  closeAddKnowledgeBaseModal() {
    this.dialogRef.close(this.kbSettings);
  }

  getKnowledgeBaseSettings() {
    let body = {
      namespace: "proj01"//this.kbService.project_id 
    }
    this.kbService.getKbSettings2(body).subscribe((response: any) => {

      this.logger.log("[KNOWLEDGE BASES COMP] get kbSettings: ", response);
      if(response.success === true && response.message){
        const messageArray = Object.keys(response.message).map(key => response.message[key]);
        this.logger.log("[KNOWLEDGE BASES COMP] messageArray: ", messageArray);
        this.kbSettings.kbs = messageArray;
        // this.addButtonDisabled = true;
      } else {
      }
    }, (error) => {
      this.logger.error("[KNOWLEDGE BASES COMP] ERROR get kbSettings: ", error);
    }, () => {
      this.logger.log("[KNOWLEDGE BASES COMP] get kbSettings *COMPLETE*");
      // this.showSpinner = false;
    })
  }


  saveKnowledgeBase(type?){
    let body = {
      id: uuidv4(),
      source: "",
      type: "",
      content: "",
      gptkey: this.kbSettings.gptkey,
      namespace: this.kbService.project_id 
    }
    // namespace: this.newKb.title 
    if(type==='url-page'){
      body.source = this.newKb.url;
      body.type = "url";
    }
    else if(type==='text-file'){
      body.source = this.newKb.url;
      body.type = "text";
    } else {
      body.source = this.newKb.url;
      body.type = "url";
    }
    console.log('[KNOWLEDGE BASES COMP] kbService::  ', this.kbService, this.kbSettings._id, this.newKb);
    this.kbService.addNewKb(this.kbSettings._id, body).subscribe((savedSettings: any) => {
      this.getKnowledgeBaseSettings();
      // let kb = savedSettings.kbs.find(kb => kb.url === this.newKb.url);
      console.log('[KNOWLEDGE BASES COMP] kbService::  ', type);
      this.closeAddKnowledgeBaseModal();
    }, (error) => {
      this.logger.error("[KNOWLEDGE BASES COMP] ERROR add new kb: ", error);
    }, () => {
      this.logger.log("[KNOWLEDGE BASES COMP] add new kb *COMPLETED*");
      let gptkey = "empty"
      if (this.kbSettings.gptkey !== "") {
        gptkey = 'filled'
      }
      // console.log("[KNOWLEDGE BASES COMP] gptkey ", gptkey)
      // this.trackUserActioOnKB('Added Knowledge Base', gptkey)
      //this.dialogRef.close(gptkey);
    })
    
  }


  onChangeInput(event): void {
    this.buttonDisabledPageUrl = false;
  }
}
