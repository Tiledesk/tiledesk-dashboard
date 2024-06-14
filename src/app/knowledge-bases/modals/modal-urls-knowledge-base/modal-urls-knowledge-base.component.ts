import { Component, OnInit, Output, EventEmitter, SimpleChanges, Inject } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KB_LIMIT_CONTENT } from 'app/utils/util';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalUrlsKnowledgeBaseComponent>,
  ) { }

  /** */
  ngOnInit(): void {
    // this.kbForm = this.createConditionGroup();
  }

  /** */
  ngOnChanges(changes: SimpleChanges){
    // console.log('ModalSiteMapComponent changes: ', changes);
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
      // console.log("onChangeInput: ",this.listOfUrls);
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
    let body = {
      'list': arrayURLS
    }
    this.dialogRef.close(body);
    // this.saveKnowledgeBase.emit(body);
  }

  /** */
  onCloseBaseModal() {
    this.countSitemap = 0;
    this.dialogRef.close();
    // this.closeBaseModal.emit();
  }
}
