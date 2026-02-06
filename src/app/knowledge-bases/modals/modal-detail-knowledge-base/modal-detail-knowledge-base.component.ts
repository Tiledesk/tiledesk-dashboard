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
  showCopiedMessage: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalDetailKnowledgeBaseComponent>,
    private logger: LoggerService,
    private kbService: KnowledgeBaseService,
  ) { 
    if (data && data.kb) 
      this.kb = data.kb
     console.log('[MODAL-DETAIL-KB] kb ', this.kb) 

      this.name = this.kb.name;
      this.source = this.kb.source;
      this.logger.log('[MODAL-DETAIL-KB] source ', this.source)
      this.content = this.kb.content;
      console.log('[MODAL-DETAIL-KB] content ', this.content)

      if (this.kb.type === 'faq') {
       this.content = this.kb.content.replace(this.kb.name + '\n', '').trimStart()
      } 

      // Recupera i chunks solo se esiste _id
      if (this.kb._id && this.kb.type !== 'sitemap') {
        this.getContentChuncks(this.kb.id_project, this.kb.namespace, this.kb._id)
      } else {
        this.showSpinner = false;
      }
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
    this.dialogRef.close({'kb': this.kb, 'method': 'update'});
    // this.updateKnowledgeBase.emit(this.kb);
  }

  onDeleteKnowledgeBase() {
    this.dialogRef.close({'kb': this.kb, 'method': 'delete'})
  }

  /**
   * Copy all scrape options to localStorage and clipboard
   */
  copyAllScrapeOptions(): void {
    // Get scrape options from KB object (check both direct properties and scrape_options object)
    const extract_tags = this.kb.extract_tags || this.kb.scrape_options?.tags_to_extract || [];
    const unwanted_tags = this.kb.unwanted_tags || this.kb.scrape_options?.unwanted_tags || [];
    const unwanted_classnames = this.kb.unwanted_classnames || this.kb.scrape_options?.unwanted_classnames || [];
    
    this.logger.log('[MODAL-DETAIL-KB] copyAllScrapeOptions called');
    this.logger.log('[MODAL-DETAIL-KB] Current extract_tags:', extract_tags);
    this.logger.log('[MODAL-DETAIL-KB] Current unwanted_tags:', unwanted_tags);
    this.logger.log('[MODAL-DETAIL-KB] Current unwanted_classnames:', unwanted_classnames);
    
    const scrapeOptions = {
      extract_tags: [...extract_tags],
      unwanted_tags: [...unwanted_tags],
      unwanted_classnames: [...unwanted_classnames]
    };
    console.log('[MODAL-DETAIL-KB] Scrape options object to save:', scrapeOptions);
    
    try {
      const jsonString = JSON.stringify(scrapeOptions);
      this.logger.log('[MODAL-DETAIL-KB] JSON string to save:', jsonString);
      
      // Save to localStorage
      localStorage.setItem('scrape_options', jsonString);
      
      // Copy to clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(jsonString).then(() => {
          this.logger.log('[MODAL-DETAIL-KB] Scrape options copied to clipboard successfully');
          this.showCopiedMessage = true;
          setTimeout(() => {
            this.showCopiedMessage = false;
          }, 2000);
        }).catch((err) => {
          this.logger.error('[MODAL-DETAIL-KB] Error copying to clipboard:', err);
          // Fallback to execCommand
          const success = this.fallbackCopyToClipboard(jsonString);
          if (success) {
            this.showCopiedMessage = true;
            setTimeout(() => {
              this.showCopiedMessage = false;
            }, 2000);
          }
        });
      } else {
        // Fallback for older browsers
        const success = this.fallbackCopyToClipboard(jsonString);
        if (success) {
          this.showCopiedMessage = true;
          setTimeout(() => {
            this.showCopiedMessage = false;
          }, 2000);
        }
      }
      
      // Verify it was saved
      const saved = localStorage.getItem('scrape_options');
      console.log('[MODAL-DETAIL-KB] Verified saved value:', saved);
      this.logger.log('[MODAL-DETAIL-KB] Scrape options copied to storage successfully');
    } catch (error) {
      this.logger.error('[MODAL-DETAIL-KB] Error saving scrape options to storage:', error);
    }
  }

  /**
   * Fallback method to copy text to clipboard for older browsers
   */
  private fallbackCopyToClipboard(text: string): boolean {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        this.logger.log('[MODAL-DETAIL-KB] Scrape options copied to clipboard using fallback method');
        return true;
      } else {
        this.logger.error('[MODAL-DETAIL-KB] Fallback copy command failed');
        return false;
      }
    } catch (err) {
      this.logger.error('[MODAL-DETAIL-KB] Error in fallback copy:', err);
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }

  /**
   * Check if KB has scrape options to copy
   */
  hasScrapeOptions(): boolean {
    if (!this.kb) return false;
    const extract_tags = this.kb.extract_tags || this.kb.scrape_options?.tags_to_extract || [];
    const unwanted_tags = this.kb.unwanted_tags || this.kb.scrape_options?.unwanted_tags || [];
    const unwanted_classnames = this.kb.unwanted_classnames || this.kb.scrape_options?.unwanted_classnames || [];
    return extract_tags.length > 0 || unwanted_tags.length > 0 || unwanted_classnames.length > 0;
  }

}
