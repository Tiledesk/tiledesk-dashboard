import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Metadata } from '../../../../../../../models/intent-model';
import { MESSAGE_METADTA_WIDTH, MESSAGE_METADTA_HEIGHT } from '../../../../../../utils';

@Component({
  selector: 'appdashboard-image-panel',
  templateUrl: './image-panel.component.html',
  styleUrls: ['./image-panel.component.scss']
})
export class ImagePanelComponent implements OnInit {
  @Output() closeImagePanel = new EventEmitter();
  @Input() metadata: Metadata;
  @ViewChild('imageUploaded', { static: false }) myIdentifier: ElementRef;
  
  imageUrl: string;
  imageWidth: string;
  imageHeight: string;
  showAddImage: boolean;

  isHovering: boolean = false;
  dropEvent: any;
  fileSelected: any;


  selectedFiles?: FileList;
  currentFile?: File;
  progress = 0;
  message = '';
  preview = '';

  // imageInfos?: Observable<any>;

  constructor() { }

  // SYSTEM FUNCTIONS //
  ngOnInit(): void {
    this.showAddImage = true;
    this.imageUrl = this.metadata.src;
    this.imageWidth = this.metadata.width;
    this.imageHeight = this.metadata.height;
    if(this.imageUrl && this.imageUrl.length>0){
      this.showAddImage = false;
    }

    //this.fileSelected = document.querySelector("#fileSelected");

  }



  selectFile(event: any): void {
    this.message = '';
    this.preview = '';
    this.progress = 0;
    this.selectedFiles = event.target.files;
    console.log("this.selectedFiles: ", this.selectedFiles);
    if (this.selectedFiles) {
      const file: File | null = this.selectedFiles.item(0);
      if (file) {
        this.preview = '';
        this.currentFile = file;
        const reader = new FileReader();
        reader.onload = (e: any) => {
          console.log(e.target.result);
          this.preview = e.target.result;
        };
        reader.readAsDataURL(this.currentFile);
      }
    }
  }

  // EVENT FUNCTIONS //
  /** */
  onCloseImagePanel(){
    let image = {
      url: this.imageUrl,
      width: this.imageWidth,
      height: this.imageHeight,
    }
    if(this.imageUrl){
      this.showAddImage = false;
    } else {
      this.showAddImage = true;
    }
    console.log('onCloseImagePanel:: ', image, this.imageUrl);
    this.closeImagePanel.emit(image);
  }

  onRemoveImage(){
    this.imageUrl = null;
    this.imageWidth = MESSAGE_METADTA_WIDTH;
    this.imageHeight = MESSAGE_METADTA_HEIGHT;
    this.onCloseImagePanel();
  }


  getDimensionImage(){
    setTimeout(() => {
      try {
        console.log('this.myIdentifier:' + this.myIdentifier);
        var width = this.myIdentifier.nativeElement .offsetWidth;
        var height = this.myIdentifier.nativeElement.offsetHeight;
        console.log('Width:' + width);
        console.log('Height: ' + height);
      } catch (error) {
        console.log('this.myIdentifier:' + error);
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
      console.log('[LOADER-PREVIEW-PAGE] readAsDataURL file', dataFiles)
    // ---------------------------------------------------------------------
    // USE CASE IMAGE
    // ---------------------------------------------------------------------
    let file:any = dataFiles[0];
    if (file.type.startsWith('image') && !file.type.includes('svg')) {
      const reader = new FileReader();
      let that = this;
      reader.onload = (e: any) => {
        console.log("CARICATA IMMAGINE::: ", e.target.result);
        this.preview = e.target.result;
        var img = new Image();
        img.onload = function() {
            // the image is ready
            console.log("onload IMMAGINE::: ");
            that.getDimensionImage();
        };
        img.onerror = function(e) {
            // the image has failed
            console.log("onerror IMMAGINE::: ", e);
        };
        img.src = this.preview;
      }
      reader.readAsDataURL(file);

      // reader.onloadend = (e: any) => {

      //   this.getDimensionImage();
      // }
      
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
