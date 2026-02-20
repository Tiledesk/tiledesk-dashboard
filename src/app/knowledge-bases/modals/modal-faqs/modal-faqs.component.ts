import { Component, Inject, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { KB } from 'app/models/kbsettings-model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoggerService } from 'app/services/logger/logger.service';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
// import { FaqService } from 'app/services/faq.service';

@Component({
  selector: 'appdashboard-modal-faqs',
  templateUrl: './modal-faqs.component.html',
  styleUrls: ['./modal-faqs.component.scss']
})
export class ModalFaqsComponent implements OnInit {

  kbForm: FormGroup;
  buttonDisabled: boolean = true;
  displayAddManuallySection : boolean = false;
  displayUploadFromCSVSection: boolean = false;
  displayAfterUploadFromCSVSection: boolean = false;
  csvColumnsDelimiter = ','
  parse_done: boolean;
  parse_err: boolean;
  modalChoosefileDisabled: boolean;
  namespaceid: string
  showBackButton: boolean = true;

  kb: KB = {
    _id: null,
    type: '',
    name: '',
    url: '',
    content: ''
  }

  // KB Tags
  kbTag: string = '';
  kbTagsArray = []
  @ViewChild('kbTagsContainer') kbTagsContainer!: ElementRef;
  private observer!: MutationObserver;
  tagContainerElementHeight: string = '20px';

  constructor(
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalFaqsComponent>,
    private logger: LoggerService,
    private kbService: KnowledgeBaseService,

  ) {
    this.logger.log('[MODAL-FAQS] data', data)
    if (data && data.selectedNamespace) {
      this.namespaceid = data.selectedNamespace.id
    }
    // Se arriva un oggetto prefillKb, precompila la KB
    if (data && data.prefillKb) {
      this.kb = { ...this.kb, ...data.prefillKb };
      this.displayAddManuallySection = true;
      this.showBackButton = false;
    }
  }

  ngOnInit(): void {
    this.kbForm = this.createConditionGroup();
  }

   ngAfterViewInit() {
    this.initTagContainerObserver();
  }

  ngOnDestroy() { 
    console.log('[MODAL-FAQS] ngOnDestroy called');
    // Disconnettere l'observer per evitare memory leaks
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  createConditionGroup(): FormGroup {
    // const contentPattern = /^[^&<>]{3,}$/;
    const namePattern = /^[^&<>]{3,}$/;
    return this.formBuilder.group({
      content: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.pattern(namePattern)]]
    })
  }

  onChangeInput(event): void {
    if (this.kbForm.valid) {
      this.buttonDisabled = false;
    } else {
      this.buttonDisabled = true;
    }
  }

  // KB TAGS
  addsKbTag(kbTag) {
    if (kbTag && kbTag.trim() !== '') {
      const trimmedTag = kbTag.trim();
      // Verifica che il tag non sia già presente
      if (!this.kbTagsArray.includes(trimmedTag)) {
        this.kbTagsArray.push(trimmedTag);
        console.log("[MODAL-FAQS] addsKbTags kbTagsArray: ", this.kbTagsArray);
      }
      // Svuota l'input dopo aver aggiunto il tag
      this.kbTag = '';
    }
    // L'observer gestirà automaticamente l'aggiornamento dell'altezza
  }

  removeKbTag(kbTagName){
    const index =  this.kbTagsArray.findIndex((tag) => tag === kbTagName);
    console.log("[MODAL-FAQS] removeKbTags index: ", index);
    this.kbTagsArray.splice(index, 1)
    console.log("[MODAL-FAQS] removeKbTags kbTagsArray: ", this.kbTagsArray);
    // L'observer gestirà automaticamente l'aggiornamento dell'altezza
  }

  onSaveKnowledgeBase(isSingle) {
    this.logger.log('[MODAL-FAQS] onSaveKnowledgeBase kb ', this.kb, 'isSingle ', isSingle )
    const content = this.kb.name + "\n" + this.kb.content
    let body = {
      'name': this.kb.name,
      'source': this.kb.name,
      'content': content, // this.kb.content,
      'type': 'faq',
      'tags': this.kbTagsArray
    }
    this.dialogRef.close({'body': body, 'isSingle': isSingle});

  }

  onCloseBaseModal() {
    this.dialogRef.close();
  }

  changeSectionToUploadFaqsFromCSV() {
    this.displayUploadFromCSVSection = true
  }

  changeSectionToAddFaqsManually() {
    this.displayAddManuallySection = true
    setTimeout(() => {
      this.initTagContainerObserver();
    }, 0);
  }

  goBack() {
    this.displayUploadFromCSVSection = false;
    this.displayAddManuallySection = false;
  }

  countDelimiterDigit(event) {
    this.logger.log('[FAQ-COMP] # OF DIGIT ', this.csvColumnsDelimiter.length)
    if (this.csvColumnsDelimiter.length !== 1) {
      // (<HTMLInputElement>document.getElementById('file')).disabled = true;
      this.modalChoosefileDisabled = true;
    } else {
      // (<HTMLInputElement>document.getElementById('file')).disabled = false;
      this.modalChoosefileDisabled = false;
    }
  }

  downloadExampleCsv() {
    const examplecsv = `Question 1 ${this.csvColumnsDelimiter} Answer 1` + '\n' + `Question 2 ${this.csvColumnsDelimiter} Answer 2`
    this.downloadFile(examplecsv, 'example.csv');
  }

  downloadFile(data, filename) {
    const blob = new Blob(['\ufeff' + data], { type: 'text/csv;charset=utf-8;' });
    const dwldLink = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const isSafariBrowser = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
    this.logger.log('[FAQ-COMP] isSafariBrowser ', isSafariBrowser)
    if (isSafariBrowser) {  // if Safari open in new window to save file with random filename.
      dwldLink.setAttribute('target', '_blank');

      /**
       * *** FOR SAFARI TO UNCOMMENT AND TEST ***
       */
      // https://stackoverflow.com/questions/29799696/saving-csv-file-using-blob-in-safari/46641236
      // const link = document.createElement('a');
      // link.id = 'csvDwnLink';

      // document.body.appendChild(link);
      // window.URL = window.URL;
      // const csv = '\ufeff' + data,
      //   csvData = 'data:attachment/csv;charset=utf-8,' + encodeURIComponent(csv),
      //   filename = 'filename.csv';
      // $('#csvDwnLink').attr({ 'download': filename, 'href': csvData });
      // $('#csvDwnLink')[0].click();
      // document.body.removeChild(link);
    }
    dwldLink.setAttribute('href', url);
    dwldLink.setAttribute('download', filename);
    dwldLink.style.visibility = 'hidden';
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }



  fileChangeUploadCSV(event) {
    this.logger.log('[FAQ-COMP] UPLOAD CSV DATA - parse_err', this.parse_err);
    this.displayAfterUploadFromCSVSection = true;
    // this.displayImportModal = 'none';
    // this.displayInfoModal = 'block';

    // this.SHOW_CIRCULAR_SPINNER = true;

    this.logger.log('[FAQ-COMP] CSV COLUMNS DELIMITER ', this.csvColumnsDelimiter)
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      const formData: FormData = new FormData();
      formData.set('delimiter', this.csvColumnsDelimiter);
      formData.append('uploadFile', file, file.name);
      this.logger.log('FORM DATA ', formData)

      this.kbService.uploadFaqCsv(formData, this.namespaceid, this.kbTagsArray)

        .subscribe(data => {
          this.logger.log('[FAQ-COMP] UPLOAD CSV DATA ', data);
          if (data) {
            // this.parse_done = true;
           
          }
        
        }, (error) => {
          this.logger.error('[FAQ-COMP] UPLOAD CSV - ERROR ', error);
          
          // this.parse_done = false;

          this.parse_err = true;
        }, () => {
          this.logger.log('[FAQ-COMP] UPLOAD CSV * COMPLETE *');
          this.parse_err = false;
        });

    }
  }

  /**
   * Inizializza l'observer per monitorare i cambiamenti nel container delle tag
   * L'observer viene creato una sola volta in ngAfterViewInit
   */
  private initTagContainerObserver() {
    if (!this.kbTagsContainer) return;

    // Calcola l'altezza iniziale
    this.updateTagContainerHeight();

    // Crea l'observer solo se non esiste già
    if (!this.observer) {
      this.observer = new MutationObserver(() => {
        this.updateTagContainerHeight();
      });

      this.observer.observe(this.kbTagsContainer.nativeElement, {
        childList: true, // osserva aggiunte/rimozioni di elementi
        subtree: false
      });
    }
  }


  /**
   * Aggiorna l'altezza del container delle tag
   * Rimuove temporaneamente l'altezza forzata per misurare correttamente l'altezza naturale
   */
  private updateTagContainerHeight() {
    if (!this.kbTagsContainer) return;

    // Se non ci sono tag, mantieni un'altezza minima fissa
    if (this.kbTagsArray.length === 0) {
      this.tagContainerElementHeight = '20px';
      return;
    }

    const element = this.kbTagsContainer.nativeElement as HTMLElement;
    
    // Salva l'altezza corrente se presente
    const currentHeight = element.style.height;
    
    // Rimuovi temporaneamente l'altezza forzata per misurare l'altezza naturale del contenuto
    element.style.height = 'auto';
    
    // Forza il reflow per assicurarsi che il browser calcoli l'altezza naturale
    void element.offsetHeight;
    
    // Misura l'altezza naturale del contenuto
    const naturalHeight = element.offsetHeight;
    
    // Ripristina l'altezza forzata (verrà aggiornata subito dopo)
    element.style.height = currentHeight;
    
    // Usa solo l'altezza naturale del contenuto
    this.tagContainerElementHeight = naturalHeight + 'px';
  }

}
