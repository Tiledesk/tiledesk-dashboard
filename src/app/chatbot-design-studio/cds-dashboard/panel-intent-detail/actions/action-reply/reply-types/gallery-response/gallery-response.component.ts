import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TYPE_ACTION, TYPE_BUTTON, TYPE_URL } from 'app/chatbot-design-studio/utils';
import { Button, Expression, GalleryElement, MessageAttributes, MessageWithWait, Metadata } from 'app/models/intent-model';
import { LoggerService } from 'app/services/chat21-core/providers/abstract/logger.service';

@Component({
  selector: 'appdashboard-gallery-response',
  templateUrl: './gallery-response.component.html',
  styleUrls: ['./gallery-response.component.scss']
})
export class GalleryResponseComponent implements OnInit {

  @ViewChild('scrollMe', { static: false }) scrollContainer: ElementRef;
  
  @Output() changeDelayTimeReplyElement = new EventEmitter();
  @Output() changeReplyElement = new EventEmitter();
  
  @Output() deleteResponse = new EventEmitter();
  @Output() moveUpResponse = new EventEmitter();
  @Output() moveDownResponse = new EventEmitter();
  @Output() openButtonPanel = new EventEmitter();
  

  @Input() response: MessageWithWait;
  @Input() index: number;
  @Input() typeAction: string;
  
  // Delay //onMoveTopButton
  delayTime: number;
  // Filter // 
  canShowFilter: boolean = true;
  booleanOperators=[ { type: 'AND', operator: 'AND'},{ type: 'OR', operator: 'OR'},]
 
  typeActions = TYPE_ACTION;
  
  gallery: Array<GalleryElement>;

  // Textarea //
  activateEL: { [key: number]: {title: boolean, description: boolean} } = {}
  constructor(
    private el: ElementRef,
    private logger: LoggerService,
  ) { }

  ngOnInit(): void {
    this.delayTime = this.response.time/1000;
    this.gallery = [];
    try {
      this.gallery = this.response.attributes.attachment.gallery;
      this.initElement();
      this.scrollToLeft()
    } catch (error) {
      // console.log('there are no buttons');
    }
  }


  initElement(){
    if(this.gallery && this.gallery.length > 0){
      this.gallery.forEach((el, index)=> {
        this.activateEL[index]= {title: false, description: false}
      })
    }
  }

  onAdd(){
    this.gallery.push( this.newGalleryElement() )
    this.initElement()
    this.scrollToLeft()

  }

  newGalleryElement(){
    return {
      preview: { src: ''}, //https://i.imgur.com/Py2UyiT.png
      title: 'Place title',
      description: 'Place description',
      buttons: [ this.newButton() ]
    }
  }

  newButton(): Button{
    return {
      'value': 'Button',
      'type': TYPE_BUTTON.TEXT,
      'target': TYPE_URL.BLANK,
      'link': '',
      'action': '',
      'show_echo': true
    }
  }

  onAddButton(index){
    let buttonSelected = this.newButton();
    this.gallery[index].buttons.push(buttonSelected)
  }

  scrollToLeft(): void {
    setTimeout(() => {
      try {
        // this.scrollContainer.nativeElement.scrollLeft = this.scrollContainer.nativeElement.scrollWidth;
        // this.scrollContainer.nativeElement.animate({ scrollLeft: 0 }, '1000');
        this.scrollContainer.nativeElement.scrollTo({ left: (this.scrollContainer.nativeElement.scrollWidth ), behavior: 'smooth' });
      } catch (error) {
        this.logger.log('scrollToBottom ERROR: ', error);
      }
    }, 300);
  }


  // EVENT FUNCTIONS //
  /** */
  drop(event: CdkDragDrop<string[]>) {
    // this.textGrabbing = false;
    moveItemInArray(this.gallery, event.previousIndex, event.currentIndex);
  }

  dropButton(event: CdkDragDrop<string[]>, index) {
    // this.textGrabbing = false;
    moveItemInArray(this.gallery[index].buttons, event.previousIndex, event.currentIndex);
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

  onClickDelayTime(opened: boolean){
    this.canShowFilter = !opened
  }
  /** */
  onChangeDelayTime(value:number){
    this.delayTime = value;
    this.response.time = value*1000;
    this.changeDelayTimeReplyElement.emit();
    this.canShowFilter = true;
  }

  onChangeExpression(expression: Expression){
    this.response._tdJSONCondition = expression
    this.changeReplyElement.emit();
  }

  onSelectedAttribute(variableSelected: { name: string, value: string }, element: 'title' | 'description', index: number){
    this.activateEL[index][element] = false
  }

  onChangeText(text: string, element: 'title' | 'description', index: number) {
    // this.response.text = text;
    this.gallery[index][element] = text;
    this.response.attributes.attachment.gallery = this.gallery
    // this.activateEL[index][element] = false
    setTimeout(() => {
      this.changeReplyElement.emit();
    }, 500);
  }

  onOpenButtonPanel(indexGallery: number, indexButton: number, button?){
    // console.log('onOpenButtonPanel: ', button, this.response);
    try {
      if(!this.response.attributes || !this.gallery[indexGallery].buttons){
        this.response.attributes.attachment.gallery[indexGallery].buttons[indexButton] = this.newButton();
        this.gallery[indexGallery].buttons = this.response.attributes.attachment.buttons;
      }
    } catch (error) {
      // console.log('error: ', error);
    }
    this.openButtonPanel.emit({button: button, refResponse: this.response});
  }

  onDeleteImage(index){
    this.gallery[index].preview = { src: ''}
  }

  


  // ----- DRAG FUNCTIONS: GALLERY ELEMENT: start
  private arraymove(elements, fromIndex, toIndex) {
    var element = elements[fromIndex];
    elements.splice(fromIndex, 1);
    elements.splice(toIndex, 0, element);
  }

  onMoveLeftGallery(fromIndex){
    let toIndex = fromIndex-1;
    if(toIndex<0){
      toIndex = 0;
    }
    this.arraymove(this.gallery, fromIndex, toIndex);
  }

  onMoveRightGallery(fromIndex){
    let toIndex = fromIndex+1;
    if(toIndex>this.gallery.length-1){
      toIndex = this.gallery.length-1;
    }
    this.arraymove(this.gallery, fromIndex, toIndex);
  }

  onDeleteGallery(index){
    this.gallery.splice(index, 1);
    // if(this.buttons.length === 0){
    //   delete this.response.attributes.attachment
    // } 
  }
  // ----- DRAG FUNCTIONS: GALLERY ELEMENT: end

  // ----- BUTTONS INSIDE GALLERY ELEMENT: start
  onMoveTopButton(indexGallery: number, fromIndex){
    let toIndex = fromIndex-1;
    if(toIndex<0){
      toIndex = 0;
    }
    this.arraymove(this.gallery[indexGallery].buttons, fromIndex, toIndex);
  }

  onMoveBottomButton(indexGallery: number, fromIndex){
    let toIndex = fromIndex+1;
    if(toIndex>this.gallery[indexGallery].buttons.length-1){
      toIndex = this.gallery[indexGallery].buttons.length-1;
    }
    this.arraymove(this.gallery[indexGallery].buttons, fromIndex, toIndex);
  }

  onDeleteButton(indexGallery: number, index){
    this.gallery[indexGallery].buttons.splice(index, 1);
    // if(this.buttons.length === 0){
    //   delete this.response.attributes.attachment
    // } 
  }
   // ----- BUTTONS INSIDE GALLERY ELEMENT: end

}

