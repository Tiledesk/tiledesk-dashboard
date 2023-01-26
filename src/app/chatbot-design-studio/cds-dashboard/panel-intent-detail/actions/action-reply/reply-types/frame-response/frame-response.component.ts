import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'
import { MessageWithWait } from '../../../../../../../models/intent-model';
import { TYPE_MESSAGE, TEXT_CHARS_LIMIT, MESSAGE_METADTA_WIDTH, MESSAGE_METADTA_HEIGHT, calculatingRemainingCharacters } from '../../../../../../utils';

@Component({
  selector: 'appdashboard-frame-response',
  templateUrl: './frame-response.component.html',
  styleUrls: ['./frame-response.component.scss']
})
export class FrameResponseComponent implements OnInit {
  @Output() changeDelayTimeReplyElement = new EventEmitter();
  @Output() deleteResponse = new EventEmitter();
  @Output() moveUpResponse = new EventEmitter();
  @Output() moveDownResponse = new EventEmitter();
  @Output() openButtonPanel = new EventEmitter();
  
  @Input() response: MessageWithWait;
  @Input() index: number;

  // frame //
  framePath: any;
  frameWidth: string;
  frameHeight: string;
  typeMessage =  TYPE_MESSAGE;

  // Textarea //
  limitCharsText: number;
  leftCharsText: number;
  textMessage: string;
  alertCharsText: boolean;

  // Delay //
  delayTime: number;


  constructor(
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.frameWidth = this.response.metadata.width?this.response.metadata.width:MESSAGE_METADTA_WIDTH;
    this.frameHeight = this.response.metadata.height?this.response.metadata.height:MESSAGE_METADTA_HEIGHT;
    if(this.response.metadata.src){
      this.framePath = this.sanitizer.bypassSecurityTrustResourceUrl(this.response.metadata.src?this.response.metadata.src:null);
    }

    this.limitCharsText = TEXT_CHARS_LIMIT;
    this.delayTime = this.response.time/1000;
    this.textMessage = this.response.text;
    this.leftCharsText = calculatingRemainingCharacters(this.textMessage);
    if(this.leftCharsText<(TEXT_CHARS_LIMIT/10)){
      this.alertCharsText = true;
    } else {
      this.alertCharsText = false;
    }
     
    // this.pathElementUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.pathElement);
    // console.log(this.pathElementUrl);
    // this.showAddImage = false;

  }

  // EVENT FUNCTIONS //
  /** */
  onChangeTextarea(text:string) {
    this.response.text = text;
  }

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
    this.delayTime = value;
    this.response.time = value*1000;
    this.changeDelayTimeReplyElement.emit();
  }

  /** */
  onCloseFramePanel(event){
    //if(event.url){
      this.framePath = event.url;
      this.response.metadata.src = event.url;
    //}
    //if(event.width){
      this.frameWidth = event.width;
      this.response.metadata.width = event.width;
    //}
    //if(event.height){
      this.frameHeight = event.height;
      this.response.metadata.height = event.height;
    //}
    console.log('onCloseframePanel:: ', event);
  }

  /** */
  onDeletePathElement(){
    this.framePath = null;
    this.response.metadata.src = '';
  }

  /** */
  onLoadPathElement(){
    try {
      this.framePath = this.sanitizer.bypassSecurityTrustResourceUrl(this.response.metadata.src);
    } catch (error) {
      console.log('error:: ', error);
    }
  }

}
