import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Message } from '../../../../../../../models/intent-model';
import { TEXT_CHARS_LIMIT, MESSAGE_METADTA_WIDTH, MESSAGE_METADTA_HEIGHT, calculatingRemainingCharacters } from '../../../../../../utils';

@Component({
  selector: 'appdashboard-image-response',
  templateUrl: './image-response.component.html',
  styleUrls: ['./image-response.component.scss']
})
export class ImageResponseComponent implements OnInit {
  @Output() deleteResponse = new EventEmitter();
  @Output() moveUpResponse = new EventEmitter();
  @Output() moveDownResponse = new EventEmitter();
  @Output() openButtonPanel = new EventEmitter();
  
  @Input() response: Message;
  @Input() index: number;

  // Image //
  imagePath: string;
  imageWidth: string;
  imageHeight: string;
  isHovering: boolean = false;
  dropEvent: any;
  fileSelected: any;

  // Textarea //
  limitCharsText: number;
  leftCharsText: number;
  textMessage: string;
  alertCharsText: boolean;

  // Delay //
  delayTime: number;


  constructor() { }

  ngOnInit(): void {
    this.imagePath = this.response.metadata.src?this.response.metadata.src:'';
    this.imageWidth = this.response.metadata.width?this.response.metadata.width:MESSAGE_METADTA_WIDTH;
    this.imageHeight = this.response.metadata.height?this.response.metadata.height:MESSAGE_METADTA_HEIGHT;
    
    this.limitCharsText = TEXT_CHARS_LIMIT;
    this.delayTime = this.response.time/1000;
    this.textMessage = this.response.text;
    this.leftCharsText = calculatingRemainingCharacters(this.textMessage);
    if(this.leftCharsText<(TEXT_CHARS_LIMIT/10)){
      this.alertCharsText = true;
    } else {
      this.alertCharsText = false;
    }
  }

  // EVENT FUNCTIONS //
  /** */
  onDeleteResponse(){
    this.deleteResponse.emit(this.index);
  }

  /** */
  onMoveUpResponse(){
    this.moveUpResponse.emit(this.index);
  }

  /** */
  onMoveDownResponse(){
    this.moveDownResponse.emit(this.index);
  }

  /** */
  onChangeText(text:string) {
    this.response.text = text;
  }

  /** */
  onChangeDelayTime(value:number){
    //this.delayTime = value;
    this.response.time = value*1000;
  }

  /** */
  onCloseImagePanel(event){
    //if(event.url){
      this.imagePath = event.url;
      this.response.metadata.src = event.url;
    //}
    //if(event.width){
      this.imageWidth = event.width;
      this.response.metadata.width = event.width;
    //}
    //if(event.height){
      this.imageHeight = event.height;
      this.response.metadata.height = event.height;
    //}
    console.log('onCloseImagePanel:: ', event);
  }





  // private async presentModal(e: any): Promise<any> {
  //   let dataFiles = " "
  //   if (e.type === 'change') {
  //     console.log('[CONVS-DETAIL][MSG-TEXT-AREA] presentModal change e', e);
  //     console.log('[CONVS-DETAIL][MSG-TEXT-AREA] presentModal change e.target ', e.target);
  //     console.log('[CONVS-DETAIL][MSG-TEXT-AREA] presentModal change e.target.files', e.target.files);
  //     dataFiles = e.target.files;
  //   } else if (e.type === 'drop') {
  //     dataFiles = e.dataTransfer.files
  //     console.log('[CONVS-DETAIL][MSG-TEXT-AREA] presentModal drop e.dataTransfer.files', e.dataTransfer.files);
  //   } else {
  //     dataFiles = e.files
  //     console.log('[CONVS-DETAIL][MSG-TEXT-AREA] presentModal dataFiles when paste', dataFiles);
  //   }
  //   const attributes = { files: dataFiles, enableBackdropDismiss: false };
  //   console.log('[CONVS-DETAIL][MSG-TEXT-AREA] attributes', attributes);
  // }

  readAsDataURL(e: any) {
    
    let dataFiles = " "
      if (e.type === 'change') {
        console.log('[CONVS-DETAIL][MSG-TEXT-AREA] presentModal change e', e);
        console.log('[CONVS-DETAIL][MSG-TEXT-AREA] presentModal change e.target ', e.target);
        console.log('[CONVS-DETAIL][MSG-TEXT-AREA] presentModal change e.target.files', e.target.files);
        dataFiles = e.target.files;
      } else if (e.type === 'drop') {
        dataFiles = e.dataTransfer.files
        console.log('[CONVS-DETAIL][MSG-TEXT-AREA] presentModal drop e.dataTransfer.files', e.dataTransfer.files);
      } else {
        dataFiles = e.files
        console.log('[CONVS-DETAIL][MSG-TEXT-AREA] presentModal dataFiles when paste', dataFiles);
      }
      const attributes = { files: dataFiles, enableBackdropDismiss: false };
      console.log('[CONVS-DETAIL][MSG-TEXT-AREA] attributes', attributes);
      console.log('[LOADER-PREVIEW-PAGE] readAsDataURL file', dataFiles)
    // ---------------------------------------------------------------------
    // USE CASE IMAGE
    // ---------------------------------------------------------------------
    let file:any = dataFiles[0];
    if (file.type.startsWith('image') && !file.type.includes('svg')) {
      console.log('[LOADER-PREVIEW-PAGE] - readAsDataURL - USE CASE IMAGE file TYPE',file.type)
      const reader = new FileReader()
      reader.onloadend = (evt) => {
        const img = reader.result.toString()
        console.log('[LOADER-PREVIEW-PAGE] - readAsDataURL - FileReader success ',img)
        // this.arrayFiles.push(img)
        // if (!this.fileSelected) {
        this.fileSelected = img
        // }
      }

      reader.readAsDataURL(file)
      // ---------------------------------------------------------------------
      // USE CASE SVG
      // ---------------------------------------------------------------------
    } else if (file.type.startsWith('image') && file.type.includes('svg')) {
      console.log('[LOADER-PREVIEW-PAGE] - readAsDataURL file TYPE',file.type)
      console.log('[LOADER-PREVIEW-PAGE] - readAsDataURL file ', file)
      const preview = document.querySelector('#img-preview') as HTMLImageElement

      const reader = new FileReader()
      const that = this
      reader.addEventListener('load',function () {
          // convert image file to base64 string
          // const img = reader.result as string;
          const img = reader.result.toString()
          console.log('FIREBASE-UPLOAD USE CASE SVG LoaderPreviewPage readAsDataURL img ',img)
          // that.arrayFiles.push(that.sanitizer.bypassSecurityTrustResourceUrl(img))
          // if (!that.fileSelected) {
          //   that.fileSelected = that.sanitizer.bypassSecurityTrustResourceUrl(img)
          // }
      },false)

      if (file) {
        reader.readAsDataURL(file)
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
    this.dropEvent = ev
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

