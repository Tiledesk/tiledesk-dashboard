import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Message } from '../../../../../../models/intent-model';
import { TEXT_CHARS_LIMIT, MESSAGE_METADTA_WIDTH, MESSAGE_METADTA_HEIGHT } from '../../../../../utils';

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
    this.leftCharsText = this.limitCharsText;
    this.alertCharsText = false;
    this.delayTime = this.response.time/1000;
    this.textMessage = this.response.text;
    
      this.imagePath = this.response.metadata.src?this.response.metadata.src:'';
      this.imageWidth = this.response.metadata.width?this.response.metadata.width:MESSAGE_METADTA_WIDTH;
      this.imageHeight = this.response.metadata.height?this.response.metadata.height:MESSAGE_METADTA_HEIGHT;
    
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

}
