import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { TYPE_MESSAGE, TYPE_COMMAND, generateShortUID, TYPE_BUTTON, TYPE_URL } from 'app/chatbot-design-studio/utils';
import { Message, Command, Button } from 'app/models/intent-model';

@Component({
  selector: 'cds-action-reply-tools',
  templateUrl: './cds-action-reply-tools.component.html',
  styleUrls: ['./cds-action-reply-tools.component.scss']
})
export class CdsActionReplyToolsComponent implements OnInit {

  @Input() idAction: string;
  @Output() addNewActionReply = new EventEmitter();

  TypeMessage = TYPE_MESSAGE;

  constructor() { }

  ngOnInit(): void {
  }


  addElement(type: TYPE_MESSAGE){
    // this.logger.log('addElement---->', type);
    var newElement:Command;
    switch (type) {
      case TYPE_MESSAGE.TEXT:
        newElement = {
          type: TYPE_COMMAND.MESSAGE,
          message: {
            text: '',
            type: TYPE_MESSAGE.TEXT
          },
        } 
        break;
      case TYPE_MESSAGE.IMAGE:
        newElement = {
          type: TYPE_COMMAND.MESSAGE,
          message: {
            text: '',
            type: TYPE_MESSAGE.IMAGE,
            metadata: {
              src: '',
              // width: MESSAGE_METADTA_WIDTH,
              // height: MESSAGE_METADTA_HEIGHT
            }
          },
        } 
        break;
      case TYPE_MESSAGE.FRAME:
        newElement = {
          type: TYPE_COMMAND.MESSAGE,
          message: {
            text: '',
            type: TYPE_MESSAGE.FRAME,
            metadata: {
              src: '',
              // width: MESSAGE_METADTA_WIDTH,
              // height: MESSAGE_METADTA_HEIGHT
            }
          },
        } 
        break;
      case TYPE_MESSAGE.GALLERY:
        const idButton = generateShortUID();
        const idActionConnector = this.idAction+'/'+idButton;
        newElement = {
          type: TYPE_COMMAND.MESSAGE,
          message: {
            text: '',
            type: TYPE_MESSAGE.GALLERY,
            attributes: {
              attachment: {
                  type: 'gallery',
                  gallery: [
                    {
                      preview: { src: ''},
                      title: 'Type title',
                      description: 'Type description',
                      buttons: [

                        new Button(
                          idButton,
                          idActionConnector,
                          false,
                          TYPE_BUTTON.TEXT,
                          'Button',
                          '',
                          TYPE_URL.BLANK,
                          '',
                          '',
                          true
                        )
                        // {
                        //   'uid': idButton,
                        //   'idConnector': idActionConnector,
                        //   'isConnected': false,
                        //   'value': 'Button',
                        //   'type': TYPE_BUTTON.TEXT,
                        //   'target': TYPE_URL.BLANK,
                        //   'link': '',
                        //   'action': '',
                        //   'show_echo': true
                        // }
                      ]
                    }
                  ]
              }
            }
          },
        } 
        break;
      case TYPE_MESSAGE.REDIRECT:
        newElement = {
          type: TYPE_COMMAND.MESSAGE,
          message: {
            text: '',
            type: TYPE_MESSAGE.REDIRECT,
            metadata: {
              src : '',
              target: TYPE_URL.BLANK
            }
          },
        } 
        break;
      default:
        break;
    }
    this.addNewActionReply.emit(newElement);
  }

}
