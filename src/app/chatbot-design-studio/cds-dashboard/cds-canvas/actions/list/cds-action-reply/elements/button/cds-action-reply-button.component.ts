import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { TYPE_BUTTON } from 'app/chatbot-design-studio/utils';

@Component({
  selector: 'cds-action-reply-button',
  templateUrl: './cds-action-reply-button.component.html',
  styleUrls: ['./cds-action-reply-button.component.scss']
})
export class CdsActionReplyButtonComponent implements OnInit {

  @Input() button: any
  @Input() previewMode: boolean = true;
  @Output() onButtonControl = new EventEmitter()
  
  TYPE_BUTTON = TYPE_BUTTON

  constructor() { }

  ngOnInit(): void {
  }

  onDeleteButton(){
    this.onButtonControl.emit('delete')
  }
  onMoveLeftButton(){
    this.onButtonControl.emit('moveLeft')
  }
  onMoveRightButton(){
    this.onButtonControl.emit('moveRight')
  }

}
