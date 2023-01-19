import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Metadata } from '../../../../../../../models/intent-model';
import { MESSAGE_METADTA_WIDTH, MESSAGE_METADTA_HEIGHT } from '../../../../../../utils';

@Component({
  selector: 'appdashboard-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent implements OnInit {
  @Input() metadata: Metadata;
  @ViewChild('imageUploaded', { static: false }) myIdentifier: ElementRef;

  isHovering: boolean = false;
  dropEvent: any;
  
  constructor() { }

  // SYSTEM FUNCTIONS //
  ngOnInit(): void {
    if(this.metadata.src){
      this.setImageSize();
    }
  }


  // CUSTOM FUNCTIONS //
  selectFile(event: any): void {
    let selectedFiles = event.target.files;
    if (selectedFiles) {
      const file: File | null = selectedFiles.item(0);
      if (file) {
        let currentFile = file;
        let that = this;
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.metadata.src = e.target.result;
          that.setImageSize();
        };
        reader.readAsDataURL(currentFile);
      }
    }
  }

  // EVENT FUNCTIONS //

  private setImageSize(){
    setTimeout(() => {
      try {
        var width = this.myIdentifier.nativeElement.offsetWidth;
        var height = this.myIdentifier.nativeElement.offsetHeight;
        this.myIdentifier.nativeElement.setAttribute("width", width);
        this.myIdentifier.nativeElement.setAttribute("height", height);
        this.metadata.width = width;
        this.metadata.height = height;
      } catch (error) {
        console.log('myIdentifier:' + error);
      }
    }, 0);
  }


  readAsDataURL(e: any) {
    let dataFiles = " "
    if (e.type === 'change') {
      dataFiles = e.target.files;
    } else if (e.type === 'drop') {
      dataFiles = e.dataTransfer.files
    } else {
      dataFiles = e.files
    }
    const attributes = { files: dataFiles, enableBackdropDismiss: false };
    // ---------------------------------------------------------------------
    // USE CASE IMAGE
    // ---------------------------------------------------------------------
    let file:any = dataFiles[0];
    if (file.type.startsWith('image') && !file.type.includes('svg')) {
      const reader = new FileReader();
      let that = this;
      reader.onload = (e: any) => {
        console.log("CARICATA IMMAGINE::: ", e.target.result);
        this.metadata.src = e.target.result;
        var img = new Image();
        img.src = this.metadata.src;
        img.onload = function() {
            that.setImageSize();
        };
        img.onerror = function(e) {
            console.log("ERROR ::: ", e);
        };
        
      }
      reader.readAsDataURL(file);
      // ---------------------------------------------------------------------
      // USE CASE SVG
      // ---------------------------------------------------------------------
    } else if (file.type.startsWith('image') && file.type.includes('svg')) {
      const preview = document.querySelector('#img-preview') as HTMLImageElement
      const reader = new FileReader();
      const that = this;
      reader.addEventListener('load',function () {
          const img = reader.result.toString();
          console.log('FIREBASE-UPLOAD USE CASE SVG LoaderPreviewPage readAsDataURL img ',img)
          // that.arrayFiles.push(that.sanitizer.bypassSecurityTrustResourceUrl(img))
          // if (!that.fileSelected) {
          //   that.fileSelected = that.sanitizer.bypassSecurityTrustResourceUrl(img)
          // }
      },false);

      if (file) {
        reader.readAsDataURL(file);
      }
      // ---------------------------------------------------------------------
      // USE CASE FILE
      // ---------------------------------------------------------------------
    } else {
      console.log('[LOADER-PREVIEW-PAGE] - readAsDataURL - USE CASE FILE - FILE ',file)
      console.log('[LOADER-PREVIEW-PAGE] - readAsDataURL - USE CASE FILE - FILE TYPE',file.type)
      let file_extension =  file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length) || file.name
      console.log('[LOADER-PREVIEW-PAGE] - readAsDataURL - USE CASE FILE - FILE EXTENSION', file_extension)
      let file_name = file.name
      console.log( '[LOADER-PREVIEW-PAGE] - readAsDataURL - USE CASE FILE - FILE NAME', file_name)
      // this.createFile()
    }
  }


  // -------------------------------------------------------------
  // DRAG FILE
  // -------------------------------------------------------------
  // DROP (WHEN THE FILE IS RELEASED ON THE DROP ZONE)
  drop(ev: any) {
    ev.preventDefault();
    ev.stopPropagation();
    const fileList = ev.dataTransfer.files
    this.isHovering = false
    if (fileList.length > 0) {
      const file: File = fileList[0];
      var mimeType = fileList[0].type;
      const isAccepted = this.checkAcceptedFile(mimeType);
      if (isAccepted === true) {
        this.handleDropEvent(ev);
      } else {
        this.presentToastOnlyImageFilesAreAllowedToDrag()
      }
    }
  }

  handleDropEvent(ev) {
    this.dropEvent = ev;
    this.readAsDataURL(ev);
  }

  // DRAG OVER (WHEN HOVER OVER ON THE "DROP ZONE")
  allowDrop(ev: any) {
    ev.preventDefault()
    ev.stopPropagation()
    this.isHovering = true
  }

  // DRAG LEAVE (WHEN LEAVE FROM THE DROP ZONE)
  drag(ev: any) {
    ev.preventDefault()
    ev.stopPropagation()
    this.isHovering = false
  }

  async presentToastOnlyImageFilesAreAllowedToDrag() {
    // const toast = await this.toastController.create({
    //   message: this.translationMap.get('FAILED_TO_UPLOAD_THE_FORMAT_IS_NOT_SUPPORTED'),
    //   duration: 5000,
    //   color: 'danger',
    //   cssClass: 'toast-custom-class',
    // })
    // toast.present()
  }


  checkAcceptedFile(draggedFileMimeType) {
    let isAcceptFile = false
    // this.logger.log('[CONVS-DETAIL] > checkAcceptedFile - fileUploadAccept: ',this.appConfigProvider.getConfig().fileUploadAccept)
    let accept_files = '*/*';//this.appConfigProvider.getConfig().fileUploadAccept
    // this.logger.log('[CONVS-DETAIL] > checkAcceptedFile - mimeType: ',draggedFileMimeType)
    if (accept_files === '*/*') {
      isAcceptFile = true
      return isAcceptFile
    } else if (accept_files !== '*/*') {
      // this.logger.log( '[CONVS-DETAIL] > checkAcceptedFile - fileUploadAccept typeof accept_files ',typeof accept_files)
      const accept_files_array = accept_files.split(',')
      // this.logger.log('[CONVS-DETAIL] > checkAcceptedFile - fileUploadAccept accept_files_array ',accept_files_array)
      // this.logger.log('[CONVS-DETAIL] > checkAcceptedFile - fileUploadAccept accept_files_array typeof: ',typeof accept_files_array)

      accept_files_array.forEach((accept_file) => {
        // this.logger.log('[CONVS-DETAIL] > checkAcceptedFile - fileUploadAccept accept_file ',accept_file)
        const accept_file_segment = accept_file.split('/')
        // this.logger.log('[CONVS-DETAIL] > checkAcceptedFile - fileUploadAccept accept_file_segment ',accept_file_segment)
        if (accept_file_segment[1] === '*') {
          if (draggedFileMimeType.startsWith(accept_file_segment[0])) {
            isAcceptFile = true
            // this.logger.log(
            //   '[CONVS-DETAIL] > checkAcceptedFile - fileUploadAccept isAcceptFile',
            //   isAcceptFile,
            // )
            return isAcceptFile
          } else {
            isAcceptFile = false
            // this.logger.log(
            //   '[CONVS-DETAIL] > checkAcceptedFile - fileUploadAccept isAcceptFile',
            //   isAcceptFile,
            // )
            return isAcceptFile
          }
        } else if (accept_file_segment[1] !== '*') {
          if (draggedFileMimeType === accept_file) {
            isAcceptFile = true
            // this.logger.log(
            //   '[CONVS-DETAIL] > checkAcceptedFile - fileUploadAccept isAcceptFile',
            //   isAcceptFile,
            // )
            return isAcceptFile
          }
        }
        return isAcceptFile
      })
      return isAcceptFile
    }
  }
}
// END ALL //
