import { Component, OnInit, Output, EventEmitter, SimpleChanges, Inject } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KB_LIMIT_CONTENT } from 'app/utils/util';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'modal-urls-knowledge-base',
  templateUrl: './modal-urls-knowledge-base.component.html',
  styleUrls: ['./modal-urls-knowledge-base.component.scss']
})
export class ModalUrlsKnowledgeBaseComponent implements OnInit {

  @Output() saveKnowledgeBase = new EventEmitter();
  @Output() closeBaseModal = new EventEmitter();

  KB_LIMIT_CONTENT = KB_LIMIT_CONTENT;
  buttonDisabled: boolean = true;

  listOfUrls: string;
  countSitemap: number;
  errorLimit: boolean = false;

  panelOpenState = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalUrlsKnowledgeBaseComponent>,
    private logger: LoggerService
  ) { }

  /** */
  ngOnInit(): void {
    // this.kbForm = this.createConditionGroup();
  }

  /** */
  ngOnChanges(changes: SimpleChanges){
    // this.logger.log('ModalSiteMapComponent changes: ', changes);
    // if(this.listSitesOfSitemap.length > 0){
    //   this.listOfUrls = this.listSitesOfSitemap.join('\n');
    //   this.countSitemap = this.listSitesOfSitemap.length;
    // } 
  }

  /** */
  onChangeInput(event): void {
    let listSitesOfSitemap = this.listOfUrls.split("\n").filter(function(row) {
      return row.trim() !== '';
    });
    var lines = this.listOfUrls.split('\n');
    if (lines.length > KB_LIMIT_CONTENT) {
      this.errorLimit = true;
      this.buttonDisabled = true;
      this.listOfUrls = lines.slice(0, KB_LIMIT_CONTENT).join('\n');
      // this.logger.log("onChangeInput: ",this.listOfUrls);
    } else {
      this.errorLimit = false;
      this.buttonDisabled = false;
    }
    this.countSitemap = listSitesOfSitemap.length;
  }

  /** */
  onSaveKnowledgeBase(){
    //const arrayURLS = this.content.split('\n');
    const arrayURLS = this.listOfUrls.split("\n").filter(function(row) {
      return row.trim() !== '';
    });
    let body: any = {
      list: arrayURLS,
      scrape_type: this.selectedScrapeType,
    }

    if (this.selectedScrapeType === 4) {
      body.scrape_options = {
        tags_to_extract: this.extract_tags,
        unwanted_tags: this.unwanted_tags,
        unwanted_classnames: this.unwanted_classnames
      }
    }
    
    this.dialogRef.close(body);
    // this.saveKnowledgeBase.emit(body);
  }

  onSelectScrapeType(selectedType) {
    // this.logger.log("onSelectScrapeType: ", selectedType);
  }

  addTag(type, event: MatChipInputEvent): void {
    // this.logger.log("Tag Event: ", event);
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

  /** */
  onCloseBaseModal() {
    this.countSitemap = 0;
    this.dialogRef.close();
    // this.closeBaseModal.emit();
  }
}
