import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MessageWithWait } from '../../../../../../../models/intent-model';
import { TEXT_CHARS_LIMIT, calculatingRemainingCharacters } from '../../../../../../utils';

@Component({
  selector: 'appdashboard-image-response',
  templateUrl: './image-response.component.html',
  styleUrls: ['./image-response.component.scss']
})
export class ImageResponseComponent implements OnInit {
  
  @Output() onChange = new EventEmitter()
  @Output() deleteResponse = new EventEmitter();
  @Output() moveUpResponse = new EventEmitter();
  @Output() moveDownResponse = new EventEmitter();
  @Output() openButtonPanel = new EventEmitter();
  
  @Input() response: MessageWithWait;
  @Input() index: number;


  // Textarea //
  limitCharsText: number;
  leftCharsText: number;
  textMessage: string;
  alertCharsText: boolean;

  // Delay //
  delayTime: number;


  constructor() { }

  ngOnInit(): void {
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
  onChangeDelayTime(value:number){
    this.delayTime = value;
    this.response.time = value*1000;
    this.onChange.emit();
  }

  /** */
  onCloseImagePanel(event){
    
    //if(event.url){
      //this.imagePath = event.url;
      this.response.metadata.src = event.url;
    //}
    //if(event.width){
      //this.imageWidth = event.width;
      this.response.metadata.width = event.width;
    //}
    //if(event.height){
      //this.imageHeight = event.height;
      this.response.metadata.height = event.height;
    //}
    console.log('onCloseImagePanel:: ', event);
  }

  /** */
  onChangeImageSelected(event){

  }



  /** */
  onDeletePathElement(){
    this.response.metadata.src = null;
    console.log('onDeletePathElement::: ', this.response.metadata);
  }

  /** */
  onChangeTextarea(text:string) {
    this.response.text = text;
    this.onChange.emit()
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
}

