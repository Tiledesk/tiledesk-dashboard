import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UploadImageNativeService } from 'app/services/upload-image-native.service';

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
 
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalUploadFileComponent>,
    private uploadImageNativeService: UploadImageNativeService,
  ) { }

  ngOnInit(): void {

  }

  // listenToUploadingStatus() {
  //   this.uploadImageNativeService.uploadAttachment$.subscribe((uploadingStatus) => { 
  //     console.log('[MODAL-UPLOAD-FILE] uploadingStatus  ',uploadingStatus);
  //   })
  // }

  onFileChange(event: any) {
    // console.log('[MODAL-UPLOAD-FILE] ----> FILE - event.target.files ', event.target.files);
    // console.log('[MODAL-UPLOAD-FILE] ----> FILE - event.target.files.length ', event.target.files.length);
    if (event.target.files && event.target.files.length) {
      const fileList = event.target.files;
      // console.log('[MODAL-UPLOAD-FILE] ----> FILE - fileList ', fileList);

      if (fileList.length > 0) { }
      const file: File = fileList[0];
      // console.log('[MODAL-UPLOAD-FILE] ----> FILE - file ', file);

      this.uploadedFile = file;


      // const formData: FormData = new FormData();
      // formData.append('uploadFile', file, file.name);
      // console.log('FORM DATA ', formData)
      if (file.size <= 10485760) {
        this.handleFileUploading(file);
        this.fileSizeExceeds = false;
        // console.log('[MODAL-UPLOAD-FILE] onFileChange fileSizeExceeds ', this.fileSizeExceeds);
      } else {
        this.fileSizeExceeds = true;
        // console.log('[MODAL-UPLOAD-FILE] onFileChange fileSizeExceeds ', this.fileSizeExceeds);
      }
      // this.doFormData(file)

    }
  }

  drop(ev: any) {
    ev.preventDefault();
    ev.stopPropagation();

    // console.log('[MODAL-UPLOAD-FILE] ----> FILE - DROP ev ', ev);
    const fileList = ev.dataTransfer.files;
    // console.log('----> FILE - DROP ev.dataTransfer.files ', fileList);

    if (fileList.length > 0) {
      const file: File = fileList[0];
      // console.log('[MODAL-UPLOAD-FILE] ----> FILE - DROP file ', file);

      var mimeType = fileList[0].type;
      // console.log('[MODAL-UPLOAD-FILE] ----> FILE - drop mimeType files ', mimeType);
      // || mimeType === "application/json"
      // || mimeType === "text/plain"
      if (mimeType === "application/pdf" || mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {

        this.fileSupported = true;

        this.uploadedFile = file;

        // const currentUpload = new UploadModel(this.uploadedFile);

        // console.log('[MODAL-UPLOAD-FILE] ----> FILE - drop this.uploadedFile ', this.uploadedFile);
        // this.uploadedFileName = this.uploadedFile.name
        // console.log('[MODAL-UPLOAD-FILE] Create Faq Kb - drop uploadedFileName ', this.uploadedFileName);
        if (file.size <= 10485760) {
          this.handleFileUploading(file);
          this.fileSizeExceeds = false;
          // console.log('[MODAL-UPLOAD-FILE] drop  fileSizeExceeds ', this.fileSizeExceeds);
        } else {
          this.fileSizeExceeds = true;
          this.isHovering = false;
          // console.log('[MODAL-UPLOAD-FILE] drop  fileSizeExceeds ', this.fileSizeExceeds);
        }
        // this.doFormData(file)
        // && mimeType !==  "text/plain"
      } else if (mimeType !== "application/pdf" && mimeType !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        // console.log('[MODAL-UPLOAD-FILE] ----> FILE - drop mimeType files ', mimeType, 'NOT SUPPORTED FILE TYPE');
        
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
    // console.log('[MODAL-UPLOAD-FILE] ----> FILE - (dragover) allowDrop ev ', ev);
    
    this.isHovering = true;
    // console.log('[MODAL-UPLOAD-FILE] allowDrop isHovering',  this.isHovering);

    // if (this.fileSizeExceeds ) {
    //   this.isHovering = false;
    //   console.log('[MODAL-UPLOAD-FILE] allowDrop fileSizeExceed  ', this.fileSizeExceeds, 'isHovering ',  this.isHovering);
    // }
  }

  // DRAG LEAVE (WHEN LEAVE FROM THE DROP ZONE)
  drag(ev: any) {
    ev.preventDefault();
    ev.stopPropagation();
    // console.log('[MODAL-UPLOAD-FILE] ----> FILE - (dragleave) drag ev ', ev);
    this.isHovering = false;
  }

  handleFileUploading(file: any) {
    if (this.hasAlreadyUploadAfile === false) {
      this.hideProgressBar = false;
      this.hideDropZone = true;

      // console.log('[MODAL-UPLOAD-FILE] - handleFileUploading > file ', file);
      this.uploadedFileName = file.name
      // console.log('[MODAL-UPLOAD-FILE]  - handleFileUploading > uploadedFileName ', this.uploadedFileName);
      this.file_extension = file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length) || file.name
      // console.log('[MODAL-UPLOAD-FILE] - handleFileUploading > file_extension ', this.file_extension)

      this.file_size_in_mb = (file.size / (1024 * 1024)).toFixed(2);
      // console.log('[MODAL-UPLOAD-FILE] - handleFileUploading > file_size_in_mb ', this.file_size_in_mb)

      this.file_name_ellipsis_the_middle = this.start_and_end(file.name)

      this.uploadImageNativeService.uploadAttachment_Native(this.uploadedFile)
        .then(downloadURL => {
          // console.log(`[MODAL-UPLOAD-FILE] - upload native downloadURL `, downloadURL);
          if (downloadURL) {
            this.uploadCompleted = true;
            // console.log(`[MODAL-UPLOAD-FILE] - upload native uploadCompleted `, this.uploadCompleted);

            this.body = {
              type: this.file_extension,
              source: downloadURL,
              content: "",
              name: this.uploadedFileName,
            }
          }
        })
        .catch((error) => {
          console.error(`[MODAL-UPLOAD-FILE] - upload native error `, error);
        });
    }



    // const reader = new FileReader();
    // this.reader.readAsDataURL(file);
    // console.log('[MODAL-UPLOAD-FILE] ----> FILE - file ', reader.readAsDataURL(file));


    // this.reader.onloadstart = () => {
    //   this.loadingFile = true;
    // };

    // this.reader.onprogress = (data) => {
    //   console.log('[MODAL-UPLOAD-FILE] READER ON PROGRESS DATA', data);
    //   if (data.lengthComputable) {
    //     // const progress = parseInt(((data.loaded / data.total) * 100), 10 );
    //     this.percentLoaded = Math.round((data.loaded / data.total) * 100);
    //     console.log('[MODAL-UPLOAD-FILE] READER ON PROGRESS PROGRESS ', this.percentLoaded);

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

    //   // console.log('READER ON LOAD result', reader.result);
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


  start_and_end(str) {

    if (str.length > 40) {
      return str.substr(0, 20) + '...' + str.substr(str.length - 10, str.length)
    }
    return str
  }


  onNoClick(): void {
    this.dialogRef.close();
  }

  onOkPresssed() {
    this.dialogRef.close(this.body);
    
    // console.log('[MODAL-UPLOAD-FILE] onOkPresssed')
  }

}
