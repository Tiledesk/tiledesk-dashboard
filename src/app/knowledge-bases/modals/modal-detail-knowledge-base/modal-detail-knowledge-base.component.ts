import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, Inject } from '@angular/core';
import { KB } from 'app/models/kbsettings-model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoggerService } from 'app/services/logger/logger.service';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';

@Component({
  selector: 'modal-detail-knowledge-base',
  templateUrl: './modal-detail-knowledge-base.component.html',
  styleUrls: ['./modal-detail-knowledge-base.component.scss']
})
export class ModalDetailKnowledgeBaseComponent implements OnInit {
  // @Input() kb: KB;
  @Output() closeBaseModal = new EventEmitter();
  @Output() updateKnowledgeBase = new EventEmitter();

  kb: KB;
  name: string;
  source: string;
  content: string;
  faqcontent: string;
  chunks: Array<any> = [];
  chunksCount: number;
  showSpinner: boolean = true;
  getChunksError: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalDetailKnowledgeBaseComponent>,
    private logger: LoggerService,
    private kbService: KnowledgeBaseService,
  ) { 
    if (data && data.kb) 
      this.kb = data.kb
      this.logger.log('[MODAL-DETAIL-KB] kb ', this.kb) 

      this.name = this.kb.name;
      this.source = this.kb.source;
      this.content = this.kb.content;

      if (this.kb.type === 'faq') {
       this.content = this.kb.content.replace(this.kb.name + '\n', '').trimStart()
      } 

      this.getContentChuncks(this.kb.id_project, this.kb.namespace, this.kb._id)
  }

  getContentChuncks(id_project: string, namespaceid: string, contentid: string) {
    this.kbService.getContentChuncks(id_project, namespaceid, contentid).subscribe((chunks: any) => {
      if (chunks) {
        
        this.logger.log('[KNOWLEDGE-BASES-COMP] - GET CONTENT CHUNCKS - RES', chunks);
        chunks.matches.forEach(el => {

          this.logger.log('[KNOWLEDGE-BASES-COMP] - GET CONTENT CHUNCKS - element', el) 

          this.chunks.push({ id: el.id, text: el.text })
        });
        

      }
    }, (error) => {
      this.logger.error('[KNOWLEDGE-BASES-COMP] - GET CONTENT CHUNCKS - ERROR ', error);
      this.showSpinner = false;
      this.chunksCount = 0;
      this.getChunksError = true;
    }, () => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] - GET CONTENT CHUNCKS * COMPLETE *');
      this.logger.log('[KNOWLEDGE-BASES-COMP] - GET CONTENT CHUNCKS  Array', this.chunks) 
      this.chunksCount = this.chunks.length;
      this.logger.log('[KNOWLEDGE-BASES-COMP] - GET CONTENT CHUNCKS  Array', this.chunks) 
      this.showSpinner = false;
    });

  }

  ngOnInit(): void {
    // this.name = this.kb.name;
    // this.source = this.kb.source;
    // this.content = this.kb.content;
    
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   this.logger.log('[MODAL-DETAIL-KB] kb ', this.kb) 
  // }


  onChangeInput(event): void {
    // if (this.kbForm.valid) {
    //   this.buttonDisabled = false;
    // } else {
    //   this.buttonDisabled = true;
    // }
  }

  onCloseBaseModal() {
    // this.closeBaseModal.emit();
    this.dialogRef.close();
  }

  onUpdateKnowledgeBase(){
    if (this.kb.type === 'faq') {
      this.content = this.name + "\n" + this.content
    }
    this.kb.name = this.name;
    this.kb.source = this.source;
    this.kb.content = this.content;

   
    
    // this.logger.log('[MODAL-DETAIL-KB] onUpdateKnowledgeBase kb ', this.kb) 
    this.dialogRef.close(this.kb);
    // this.updateKnowledgeBase.emit(this.kb);
  }

}
