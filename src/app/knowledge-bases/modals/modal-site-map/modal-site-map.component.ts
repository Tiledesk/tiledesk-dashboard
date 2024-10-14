import { Component, OnInit, Output, EventEmitter, SimpleChanges, Input, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KB, KbSettings } from 'app/models/kbsettings-model';
import { KB_LIMIT_CONTENT } from 'app/utils/util';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'modal-site-map',
  templateUrl: './modal-site-map.component.html',
  styleUrls: ['./modal-site-map.component.scss']
})
export class ModalSiteMapComponent implements OnInit {
  
  // @Input() listSitesOfSitemap: any[];
  // @Output() sendSitemap = new EventEmitter();
  // @Output() saveKnowledgeBase = new EventEmitter();
  // @Output() closeBaseModal = new EventEmitter();
  listSitesOfSitemap: any[];
  KB_LIMIT_CONTENT = KB_LIMIT_CONTENT;
  kbForm: FormGroup;
  buttonDisabled: boolean = true;
  isSitemapLoaded: boolean = false;
  listOfUrls: string;
  countSitemap: number;
  errorLimit: boolean = false;


  panelOpenState = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  // scrape_types: Array<any> = [
  //   { name: "Full HTML page", value: 1 },
  //   { name: "Headless (Standard)", value: 2 },
  //   { name: "Headless (Text Only)", value: 3 },
  //   { name: "Headless (Parameterizable)", value: 4 },
  // ];

  scrape_types: Array<any> = [
    // { name: "Full HTML page", value: 1 },
    { name: "Standard", value: 2 },
    // { name: "Headless (Text Only)", value: 3 },
    { name: "Advanced", value: 4 },
  ];

  selectedScrapeType = 2;
  extract_tags = [];
  unwanted_tags = [];
  unwanted_classnames = [];

  kb: KB = {
    _id: null,
    type: '',
    name: '',
    url: '',
    content: ''
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalSiteMapComponent>,
    private formBuilder: FormBuilder,
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    this.kbForm = this.createConditionGroup();
    this.listenToOnSenSitemapSiteListEvent()
  }

  listenToOnSenSitemapSiteListEvent() {
    document.addEventListener(
      "on-send-sitemap-site-list", (e: CustomEvent) => {
        // this.logger.log("[MODAL-SITE-MAP] on-send-sitemap-site-list :", e.detail);
        this.listSitesOfSitemap=e.detail
       
        if(this.listSitesOfSitemap.length > 0){
          this.buttonDisabled = false;
          this.listOfUrls = this.listSitesOfSitemap.join('\n');
          // this.logger.log('MODAL-SITE-MAP listOfUrls: ', this.listOfUrls);
          this.countSitemap = this.listSitesOfSitemap.length;
          this.isSitemapLoaded = true;
          // this.logger.log('MODAL-SITE-MAP isSitemapLoaded: ', this.isSitemapLoaded);
        } else {
          this.buttonDisabled = true;
          this.isSitemapLoaded = false;
        } 
      }
    );
  }

  // ngOnChanges(changes: SimpleChanges){
  //   // this.logger.log('ModalSiteMapComponent changes: ', changes);
  //   if(this.listSitesOfSitemap.length > 0){
  //     this.buttonDisabled = false;
  //     this.listOfUrls = this.listSitesOfSitemap.join('\n');
  //     // this.logger.log('ModalSiteMapComponent listOfUrls: ', this.listOfUrls);
  //     this.countSitemap = this.listSitesOfSitemap.length;
  //     this.isSitemapLoaded = true;
  //   } else {
  //     this.buttonDisabled = true;
  //     this.isSitemapLoaded = false;
  //   }
  // }


  createConditionGroup(): FormGroup {
    const namePattern = /^[^&<>]{3,}$/;
    return this.formBuilder.group({
      //url: ['', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]],
      url: ['', [Validators.required]],
      // name: ['', [Validators.required, Validators.pattern(namePattern)]]
    })
  }

  onChangeInput(event): void {
    if (this.kbForm.valid) {
      this.buttonDisabled = false;
    } else {
      this.buttonDisabled = true;
    }
  }


  onChangeList(event):void {
    // this.listSitesOfSitemap = this.listOfUrls.split("\n");
    this.listSitesOfSitemap = this.listOfUrls.split("\n").filter(function(row) {
      return row.trim() !== '';
    });
    var lines = this.listOfUrls.split('\n');
    if (lines.length > KB_LIMIT_CONTENT) {
      this.errorLimit = true;
      this.buttonDisabled = true;
      // this.listOfUrls = lines.slice(0, KB_LIMIT_CONTENT).join('\n');
    } else {
      this.errorLimit = false;
      this.buttonDisabled = false;
    }
    this.countSitemap = this.listSitesOfSitemap.length;
  }

  onCloseBaseModal() {
    this.listSitesOfSitemap = [];
    this.listOfUrls = "";
    this.countSitemap = 0;
    this.isSitemapLoaded = false;
    this.buttonDisabled = false;
    // this.closeBaseModal.emit();
    this.dialogRef.close()
  }

  onSendSitemap(){
   
    let body = {
      'sitemap': this.kb.url
    }
    // this.logger.log('[MODAL-SITE-MAP] onSendSitemap body ', body)
    this.buttonDisabled = true;

    const event = new CustomEvent("on-send-sitemap", { detail:  body  });
    document.dispatchEvent(event);
    // this.sendSitemap.emit(body);
  }

  onSaveKnowledgeBase(){
    if(this.listSitesOfSitemap.length > this.KB_LIMIT_CONTENT){
      this.errorLimit = true;
    } else {
      this.errorLimit = false;
      const arrayURLS = this.listOfUrls.split("\n").filter(function(row) {
        return row.trim() !== '';
      });
      let body = {
        'list': arrayURLS,
        scrape_type: this.selectedScrapeType,
      }

      if (this.selectedScrapeType === 4) {
        body['scrape_options'] = {
          tags_to_extract: this.extract_tags,
          unwanted_tags: this.unwanted_tags,
          unwanted_classnames: this.unwanted_classnames
        }
      }
      this.dialogRef.close(body)
      // this.saveKnowledgeBase.emit(body);
    }
    
  }

  onSelectScrapeType(selectedType) {
    // this.logger.log("onSelectScrapeType: ", selectedType);
  }

  addTag(type, event: MatChipInputEvent): void {
    //this.logger.log("Tag Event: ", event);
    const value = (event.value || '').trim();
    if (value) {
      if (type === 'extract_tags') {
        this.extract_tags.push(value);
      }
      if (type === 'unwanted_tags') {
        this.unwanted_tags.push(value);
      }
      if (type === 'unwanted_classnames') {
        this.unwanted_classnames.push(value);
      }
    }
    // Clear the input value
    if (event.input) {
      event.input.value = "";
    }
    //this.logger.log("Tags: ", this.content.tags);
  }


  removeTag(arrayName, tag) {
    this.logger.log("Remove tag arrayName: ", arrayName, ' tag ', tag);
    if (arrayName === 'extract_tags')  {
      this.logger.log('extract_tags array',  this.extract_tags)
      const index =  this.extract_tags.findIndex((val) => val === tag); 
      this.logger.log("Remove tag index: ", index);
      this.extract_tags.splice(index, 1)
    }

    if (arrayName === 'unwanted_tags')  {
      this.logger.log('unwanted_tags array',  this.extract_tags)
      const index =  this.unwanted_tags.findIndex((val) => val === tag); // Returns 1  
      this.logger.log("Remove tag index: ", index);
      this.unwanted_tags.splice(index, 1)
    }

    if (arrayName === 'unwanted_classnames')  {
      this.logger.log('unwanted_classnames array',  this.extract_tags)
      const index =  this.unwanted_classnames.findIndex((val) => val === tag); // Returns 1  
      this.logger.log("Remove tag index: ", index);
      this.unwanted_classnames.splice(index, 1)
    }

  }


}
