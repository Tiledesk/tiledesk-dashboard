import { Component, Inject, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoggerService } from 'app/services/logger/logger.service';
import { UploadImageNativeService } from 'app/services/upload-image-native.service';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { BrandService } from 'app/services/brand.service';
import { URL_kb_contents_tags} from 'app/utils/util';

@Component({
  selector: 'appdashboard-modal-upload-file',
  templateUrl: './modal-upload-file.component.html',
  styleUrls: ['./modal-upload-file.component.scss']
})
export class ModalUploadFileComponent implements OnInit {

  isHovering: boolean;
  loadingFile: any;
  percentLoaded: number;
  reader = new FileReader();
  dropDisabled = false;
  uploadedFile: any;
  hideDropZone = false;
  hideProgressBar = true;
  uploadCompleted = false;
  uploadedFileName: string;

  hasAlreadyUploadAfile = false
  file_extension: string;
  file_size_in_mb: any;
  file_name_ellipsis_the_middle: string;
  fileSizeExceeds: boolean;
  fileSupported: boolean = true;
  body: any;
  tparams = { "file_size_limit": "10" }

  fileUrlInput = '';
  urlImportInvalid = false;

  // KB Tags
  kbTag: string = '';
  kbTagsArray = []
  @ViewChild('kbTagsContainer') kbTagsContainer!: ElementRef;
  private observer!: MutationObserver;
  tagContainerElementHeight: any;
  public hideHelpLink: boolean;
  isOpen = false;
  private closeTimeout: any;

  positions: ConnectedPosition[] = [
    {
      originX: 'start',
      originY: 'center',
      overlayX: 'end',
      overlayY: 'center',
      offsetX: -8
    }
  ];
 
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalUploadFileComponent>,
    private uploadImageNativeService: UploadImageNativeService,
    private logger: LoggerService,
    public brandService: BrandService
  ) { 
    const brand = brandService.getBrand();
    this.hideHelpLink = brand['DOCS'];
  }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    this.initTagContainerObserver();
  }

  ngOnDestroy() { 
    this.logger.log('[MODAL-UPLOAD-FILE] ngOnDestroy called');
    // Disconnettere l'observer per evitare memory leaks
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  // CDK methods
  open() {
    clearTimeout(this.closeTimeout);
    this.isOpen = true;
  }

  scheduleClose() {
    this.closeTimeout = setTimeout(() => {
      this.isOpen = false;
    }, 150);
  }

  cancelClose() {
    clearTimeout(this.closeTimeout);
  }

  // listenToUploadingStatus() {
  //   this.uploadImageNativeService.uploadAttachment$.subscribe((uploadingStatus) => { 
  //     this.logger.log('[MODAL-UPLOAD-FILE] uploadingStatus  ',uploadingStatus);
  //   })
  // }

  onFileChange(event: any) {
    this.clearUrlImportFields();
    // this.logger.log('[MODAL-UPLOAD-FILE] ----> FILE - event.target.files ', event.target.files);
    // this.logger.log('[MODAL-UPLOAD-FILE] ----> FILE - event.target.files.length ', event.target.files.length);
    if (event.target.files && event.target.files.length) {
      const fileList = event.target.files;
      // this.logger.log('[MODAL-UPLOAD-FILE] ----> FILE - fileList ', fileList);

      if (fileList.length > 0) { }
      const file: File = fileList[0];
      this.logger.log('[MODAL-UPLOAD-FILE] ----> FILE - file ', file);

      this.uploadedFile = file;


      // const formData: FormData = new FormData();
      // formData.append('uploadFile', file, file.name);
      // this.logger.log('FORM DATA ', formData)
      if (file.size <= 10485760) {
        this.handleFileUploading(file);
        this.fileSizeExceeds = false;
        // this.logger.log('[MODAL-UPLOAD-FILE] onFileChange fileSizeExceeds ', this.fileSizeExceeds);
      } else {
        this.fileSizeExceeds = true;
        // this.logger.log('[MODAL-UPLOAD-FILE] onFileChange fileSizeExceeds ', this.fileSizeExceeds);
      }
      // this.doFormData(file)

    }
  }

  drop(ev: any) {
    ev.preventDefault();
    ev.stopPropagation();

    // this.logger.log('[MODAL-UPLOAD-FILE] ----> FILE - DROP ev ', ev);
    const fileList = ev.dataTransfer.files;
    // this.logger.log('----> FILE - DROP ev.dataTransfer.files ', fileList);

    if (fileList.length > 0) {
      const file: File = fileList[0];
      this.clearUrlImportFields();
      // this.logger.log('[MODAL-UPLOAD-FILE] ----> FILE - DROP file ', file);

      var mimeType = fileList[0].type;
      // this.logger.log('[MODAL-UPLOAD-FILE] ----> FILE - drop mimeType files ', mimeType);
      // || mimeType === "application/json"
      // || mimeType === "text/plain"
      if (mimeType === "application/pdf" || mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || mimeType === "text/plain") {

        this.fileSupported = true;

        this.uploadedFile = file;

        // const currentUpload = new UploadModel(this.uploadedFile);

        // this.logger.log('[MODAL-UPLOAD-FILE] ----> FILE - drop this.uploadedFile ', this.uploadedFile);
        // this.uploadedFileName = this.uploadedFile.name
        // this.logger.log('[MODAL-UPLOAD-FILE] Create Faq Kb - drop uploadedFileName ', this.uploadedFileName);
        if (file.size <= 10485760) {
          this.handleFileUploading(file);
          this.fileSizeExceeds = false;
          // this.logger.log('[MODAL-UPLOAD-FILE] drop  fileSizeExceeds ', this.fileSizeExceeds);
        } else {
          this.fileSizeExceeds = true;
          this.isHovering = false;
          // this.logger.log('[MODAL-UPLOAD-FILE] drop  fileSizeExceeds ', this.fileSizeExceeds);
        }
        // this.doFormData(file)
        // && mimeType !==  "text/plain"
      } else if (mimeType !== "application/pdf" && mimeType !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && mimeType === "text/plain") {
        // this.logger.log('[MODAL-UPLOAD-FILE] ----> FILE - drop mimeType files ', mimeType, 'NOT SUPPORTED FILE TYPE');
        
        this.fileSupported = false;
        this.isHovering  = false;
        // this.notify.showWidgetStyleUpdateNotification(this.filetypeNotSupported, 4, 'report_problem');

      }
    }
  }

  // DRAG OVER (WHEN HOVER OVER ON THE "DROP ZONE")
  allowDrop(ev: any) {
    ev.preventDefault();
    ev.stopPropagation();
    // this.logger.log('[MODAL-UPLOAD-FILE] ----> FILE - (dragover) allowDrop ev ', ev);
    
    this.isHovering = true;
    // this.logger.log('[MODAL-UPLOAD-FILE] allowDrop isHovering',  this.isHovering);

    // if (this.fileSizeExceeds ) {
    //   this.isHovering = false;
    //   this.logger.log('[MODAL-UPLOAD-FILE] allowDrop fileSizeExceed  ', this.fileSizeExceeds, 'isHovering ',  this.isHovering);
    // }
  }

  // DRAG LEAVE (WHEN LEAVE FROM THE DROP ZONE)
  drag(ev: any) {
    ev.preventDefault();
    ev.stopPropagation();
    // this.logger.log('[MODAL-UPLOAD-FILE] ----> FILE - (dragleave) drag ev ', ev);
    this.isHovering = false;
  }

  // KB TAGS
  addsKbTag(kbTag) {
    if (kbTag && kbTag.trim() !== '') {
      const trimmedTag = kbTag.trim();
      // Verifica che il tag non sia già presente
      if (!this.kbTagsArray.includes(trimmedTag)) {
        this.kbTagsArray.push(trimmedTag);
        this.logger.log("[MODAL-UPLOAD-FILE] addsKbTags kbTagsArray: ", this.kbTagsArray);
      }
      // Svuota l'input dopo aver aggiunto il tag
      this.kbTag = '';
    }
    // L'observer gestirà automaticamente l'aggiornamento dell'altezza
  }

  removeKbTag(kbTagName){
    const index =  this.kbTagsArray.findIndex((tag) => tag === kbTagName);
    this.logger.log("[MODAL-UPLOAD-FILE] removeKbTags index: ", index);
    this.kbTagsArray.splice(index, 1)
    this.logger.log("[MODAL-UPLOAD-FILE] removeKbTags kbTagsArray: ", this.kbTagsArray);
    // L'observer gestirà automaticamente l'aggiornamento dell'altezza
  }

  handleFileUploading(file: any) {
    this.uploadCompleted = false;
    this.body = null;

    if (this.hasAlreadyUploadAfile === false) {
      this.hideProgressBar = false;
      this.hideDropZone = true;

      this.uploadedFile = file;
      this.uploadedFileName = file.name;
      this.file_extension = file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length) || file.name;
      this.file_size_in_mb = (file.size / (1024 * 1024)).toFixed(2);
      this.file_name_ellipsis_the_middle = this.start_and_end(file.name);

      this.uploadFileToStorage(file).catch((error) => {
        this.logger.error(`[MODAL-UPLOAD-FILE] - upload native error `, error);
      });
    }



    // const reader = new FileReader();
    // this.reader.readAsDataURL(file);
    // this.logger.log('[MODAL-UPLOAD-FILE] ----> FILE - file ', reader.readAsDataURL(file));


    // this.reader.onloadstart = () => {
    //   this.loadingFile = true;
    // };

    // this.reader.onprogress = (data) => {
    //   this.logger.log('[MODAL-UPLOAD-FILE] READER ON PROGRESS DATA', data);
    //   if (data.lengthComputable) {
    //     // const progress = parseInt(((data.loaded / data.total) * 100), 10 );
    //     this.percentLoaded = Math.round((data.loaded / data.total) * 100);
    //     this.logger.log('[MODAL-UPLOAD-FILE] READER ON PROGRESS PROGRESS ', this.percentLoaded);

    //     if (this.percentLoaded === 100) {
    //       setTimeout(() => {
    //         this.hideProgressBar = false // true;
    //         this.uploadCompleted = true;
    //       }, 500);
    //     }

    //     // if (this.botNameLength > 1 && this.percentLoaded === 100) {
    //     //   this.btn_create_bot_is_disabled = false;
    //     // }
    //   }
    // };

    // triggered each time the reading operation is successfully completed.
    // this.reader.onload = () => {
    //   setTimeout(() => {
    //     this.loadingFile = false;
    //   }, 500);

    //   // this.logger.log('READER ON LOAD result', reader.result);
    //   if (this.reader.result) {

    //     // this.form.get(this.field.name).patchValue({ 'value': file['name'] });

    //     // if (!this.field.hasNotes) {
    //     //   this.form.get(this.field.name).patchValue(file['name']);
    //     // } else {
    //     //   this.form.get(this.field.name).patchValue({ 'value': file['name'] });
    //     // }

    //   }
    // };
  }

  private uploadFileToStorage(file: File): Promise<boolean> {
    this.uploadedFile = file;
    return this.uploadImageNativeService.uploadAssetFile(file, 86400).then((downloadURL) => {
      if (downloadURL) {
        this.uploadCompleted = true;
        this.body = {
          type: this.file_extension,
          source: downloadURL,
          content: '',
          name: this.uploadedFileName,
          tags: [...this.kbTagsArray]
        };
        return true;
      }
      return false;
    });
  }

  start_and_end(str: string) {
    if (!str) {
      return '';
    }
    if (str.length > 40) {
      return str.substr(0, 20) + '...' + str.substr(str.length - 10, str.length)
    }
    return str
  }


  onNoClick(): void {
    this.dialogRef.close();
  }

  get importDisabled(): boolean {
    const raw = (this.fileUrlInput || '').trim();
    /** URL field has priority: Import only when it is a valid http(s) link to .pdf / .docx / .txt */
    if (raw) {
      return this.parseUrlImportSpec(raw) === null;
    }
    if (this.body) {
      return false;
    }
    if (this.hideDropZone && !this.uploadCompleted) {
      return true;
    }
    return true;
  }

  onUrlInput(): void {
    this.scheduleValidateUrlImportState();
  }

  /** Paste runs before ngModel updates; defer so validation reads the full URL. */
  onUrlPaste(_event: ClipboardEvent): void {
    this.scheduleValidateUrlImportState();
  }

  private scheduleValidateUrlImportState(): void {
    setTimeout(() => this.validateUrlImportState(), 0);
  }

  /** Any non-empty text that is not a valid import URL shows KbPage.ImportFileUrlInvalid (incl. garbage like "tesr"). */
  validateUrlImportState(): void {
    const raw = (this.fileUrlInput || '').trim();
    if (!raw) {
      this.urlImportInvalid = false;
      return;
    }
    this.urlImportInvalid = this.parseUrlImportSpec(raw) === null;
  }

  onOkPresssed(): void {
    const raw = (this.fileUrlInput || '').trim();
    /** URL field wins over a prior browse upload so wrong extension (e.g. .png) is validated and shown. */
    if (raw) {
      if (!this.tryBuildBodyFromUrl(raw)) {
        return;
      }
      this.body.tags = [...this.kbTagsArray];
      this.dialogRef.close(this.body);
      return;
    }
    if (this.body) {
      this.body.tags = [...this.kbTagsArray];
      this.dialogRef.close(this.body);
      return;
    }
  }

  /** Validates URL in UI (scheme, path extension); backend receives `source` as the URL. */
  private tryBuildBodyFromUrl(raw: string): boolean {
    this.urlImportInvalid = false;
    const spec = this.parseUrlImportSpec(raw);
    if (!spec) {
      this.urlImportInvalid = true;
      return false;
    }
    this.body = {
      type: spec.ext,
      source: spec.url.href,
      content: '',
      name: spec.name,
      tags: [...this.kbTagsArray]
    };
    return true;
  }

  private parseUrlImportSpec(raw: string): { url: URL; ext: string; name: string } | null {
    let u: URL;
    try {
      u = new URL(raw);
    } catch {
      return null;
    }
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      return null;
    }
    let pathname: string;
    try {
      pathname = decodeURIComponent(u.pathname);
    } catch {
      pathname = u.pathname;
    }
    /** Trailing slash breaks .endsWith('.pdf'); use last path segment. */
    const pathNorm = pathname.replace(/\/+$/, '') || '/';
    const lower = pathNorm.toLowerCase();
    let ext: string;
    if (lower.endsWith('.pdf')) {
      ext = 'pdf';
    } else if (lower.endsWith('.docx')) {
      ext = 'docx';
    } else if (lower.endsWith('.txt')) {
      ext = 'txt';
    } else {
      return null;
    }
    const segment = pathNorm.substring(pathNorm.lastIndexOf('/') + 1);
    const name = segment || 'document';
    return { url: u, ext, name };
  }

  private clearUrlImportFields(): void {
    this.fileUrlInput = '';
    this.urlImportInvalid = false;
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

   goToKbTagsDoc() {
    const docsUrl = URL_kb_contents_tags;
    window.open(docsUrl, '_blank');
  }
}
