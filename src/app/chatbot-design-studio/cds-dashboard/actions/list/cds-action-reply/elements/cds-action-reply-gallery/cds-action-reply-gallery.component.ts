import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ConnectorService } from 'app/chatbot-design-studio/services/connector.service';
import { IntentService } from 'app/chatbot-design-studio/services/intent.service';
import { TYPE_ACTION, TYPE_BUTTON, TYPE_URL, generateShortUID } from 'app/chatbot-design-studio/utils';
import { Button, Expression, GalleryElement, MessageAttributes, MessageWithWait, Metadata } from 'app/models/intent-model';
import { LoggerService } from 'app/services/chat21-core/providers/abstract/logger.service';

@Component({
  selector: 'cds-action-reply-gallery',
  templateUrl: './cds-action-reply-gallery.component.html',
  styleUrls: ['./cds-action-reply-gallery.component.scss']
})
export class CdsActionReplyGalleryComponent implements OnInit {

  @ViewChild('scrollMe', { static: false }) scrollContainer: ElementRef;
  
  @Output() changeActionReply = new EventEmitter();
  @Output() deleteActionReply = new EventEmitter();
  @Output() moveUpResponse = new EventEmitter();
  @Output() moveDownResponse = new EventEmitter();
  @Output() openButtonPanel = new EventEmitter();
  @Output() createNewButton = new EventEmitter();
  @Output() deleteButton = new EventEmitter();
  
  @Input() idAction: string;
  @Input() response: MessageWithWait;
  @Input() index: number;
  @Input() previewMode: boolean = true
  
  idIntent: string;
  // Connector //
  connector: any;

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
    private sanitizer: DomSanitizer,
    private connectorService: ConnectorService,
    private intentService: IntentService,
    private logger: LoggerService,
  ) { }

  ngOnInit(): void {
    this.delayTime = this.response.time/1000;
    this.gallery = [];
    try {
      this.gallery = this.response.attributes.attachment.gallery;
      console.log('galleryyyyyy', this.gallery, this.response)
      this.initElement();
      if(!this.previewMode) this.scrollToLeft()

      this.intentService.isChangedConnector$.subscribe((connector: any) => {
        console.log('CdsActionReplyGalleryComponent isChangedConnector-->', connector);
        this.connector = connector;
        this.updateConnector();
      });
      // this.patchButtons();
      this.idIntent = this.idAction.split('/')[0];

    } catch (error) {
      // console.log('there are no buttons');
    }
  }


  private patchButtons(element: GalleryElement, index: number){
    console.log('patchButtons:: ', this.response);
    let buttons = this.response?.attributes?.attachment?.gallery[index].buttons;
    if(!buttons)return;
    buttons.forEach(button => {
      if(!button.uid || button.uid === undefined){
        const idButton = generateShortUID();
        const idActionConnector = this.idAction+'/'+idButton;
        button.uid = idButton;
        button.idConnector = idActionConnector;
        if(button.action && button.action !== ''){
          button.isConnected = true;
        } else {
          button.isConnected = false;
        }
      }
    }); 
  }
  
  private updateConnector(){
    try {
      this.gallery.forEach((el, index)=> {
        const array = this.connector.fromId.split("/");
        const idButton = array[array.length - 1];
        const idConnector = this.idAction+'/'+idButton;
        console.log('[REPLY-GALLERY] updateConnector :: connector.fromId: ', this.connector.fromId);
        console.log('[REPLY-GALLERY] updateConnector :: idConnector: ', idConnector);
        console.log('[REPLY-GALLERY] updateConnector :: idButton: ', idButton);
        console.log('[REPLY-GALLERY] updateConnector :: connector.id: ', this.connector.id);
        const buttonChanged = el.buttons.find(obj => obj.uid === idButton);
        if(idConnector === this.connector.fromId && buttonChanged){
          if(this.connector.deleted){
            // DELETE 
            console.log(' deleteConnector :: ', this.connector.fromId);
            buttonChanged.isConnected = false;
            buttonChanged.idConnector = this.connector.fromId;
            buttonChanged.action = '';
            buttonChanged.type = TYPE_BUTTON.TEXT;
          } else {
            // ADD / EDIT
            buttonChanged.isConnected = true;
            buttonChanged.idConnector = this.connector.fromId;
            buttonChanged.action = '#' + this.connector.toId;
            buttonChanged.type = TYPE_BUTTON.ACTION;
            console.log('updateConnector :: ', el.buttons);
          }
          this.changeActionReply.emit();
        }
      });
    } catch (error) {
      console.log('error: ', error);
    }
  }

  initElement(){
    if(this.gallery && this.gallery.length > 0){
      this.gallery.forEach((el, index)=> {
        this.activateEL[index]= {title: false, description: false}
        this.patchButtons(el, index);
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
    const idButton = generateShortUID();
    const idActionConnector = this.idAction+'/'+idButton;
    return {
      'uid': idButton,
      'idConnector': idActionConnector,
      'isConnected': false,
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
    const that = this
    setTimeout(() => {
      try {
        // this.scrollContainer.nativeElement.scrollLeft = this.scrollContainer.nativeElement.scrollWidth;
        // this.scrollContainer.nativeElement.animate({ scrollLeft: 0 }, '1000');
        that.scrollContainer.nativeElement.scrollTo({ left: (that.scrollContainer.nativeElement.scrollWidth ), behavior: 'smooth' });
      } catch (error) {
        that.logger.log('scrollToBottom ERROR: ', error);
      }
    }, 300);
  }

  sanitizerUrlImage(url){
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }


  // EVENT FUNCTIONS //
  /** onClickDelayTime */
  onClickDelayTime(opened: boolean){
    this.canShowFilter = !opened;
  }

  /** onChangeDelayTime */
  onChangeDelayTime(value:number){
    this.delayTime = value;
    this.response.time = value*1000;
    this.changeActionReply.emit();
    this.canShowFilter = true;
  }

  /** onChangeExpression */
  onChangeExpression(expression: Expression){
    this.response._tdJSONCondition = expression
    this.changeActionReply.emit();
  }

  onChangeMetadata(metadata: Metadata, index: number){
    this.gallery[index].preview = metadata;
    this.response.attributes.attachment.gallery = this.gallery
    this.changeActionReply.emit();
  }

  /** onDeleteActionReply */
  onDeleteActionReply(){
    this.deleteActionReply.emit(this.index);
  }
  onMoveUpResponse(){
    this.moveUpResponse.emit(this.index);
  }
  onMoveDownResponse(){
    this.moveDownResponse.emit(this.index);
  }

  drop(event: CdkDragDrop<string[]>) {
    // this.textGrabbing = false;
    moveItemInArray(this.gallery, event.previousIndex, event.currentIndex);
  }

  dropButton(event: CdkDragDrop<string[]>, index) {
    // this.textGrabbing = false;
    moveItemInArray(this.gallery[index].buttons, event.previousIndex, event.currentIndex);
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
      this.changeActionReply.emit();
    }, 500);
  }

  onOpenButtonPanel(indexGallery: number, indexButton: number, button?){
    // console.log('onOpenButtonPanel: ', button, indexGallery, indexButton, this.response);
    try {
      if(!this.response.attributes || !this.gallery[indexGallery].buttons){
        this.response.attributes.attachment.gallery[indexGallery].buttons[indexButton] = this.newButton();
        // this.gallery[indexGallery].buttons = this.response.attributes.attachment.gallery[indexGallery].buttons;
      }
    } catch (error) {
      console.log('error: ', error);
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

