import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { Message, Command } from '../../../../../../models/intent-model';
import { 
  TYPE_BUTTON,
  TYPE_COMMAND, 
  TYPE_MESSAGE,
  TYPE_URL,
} from '../../../../../utils';

@Component({
  selector: 'appdashboard-panel-reply-tools',
  templateUrl: './panel-reply-tools.component.html',
  styleUrls: ['./panel-reply-tools.component.scss']
})
export class PanelReplyToolsComponent implements OnInit {
  @Output() addNewResponse = new EventEmitter();

  items: Array<string> = [];
  showSpinner:boolean = false;
  // TypeCommand = TYPE_COMMAND;
  TypeMessage = TYPE_MESSAGE;
  
  constructor() { 
    // console.log('constructor);
  }

  ngOnInit(): void {
    // console.log('ngOnInit);
  }


  addElement(type: TYPE_MESSAGE){
    // console.log('addElement---->', type);
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
                        title: 'Place title',
                        description: 'Place description',
                        buttons: [
                          {
                            'value': 'Button',
                            'type': TYPE_BUTTON.TEXT,
                            'target': TYPE_URL.BLANK,
                            'link': '',
                            'action': '',
                            'show_echo': true
                          }
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
    this.addNewResponse.emit(newElement);
  }



  drop(event: CdkDragDrop<string[]>) {
    // drag
  }

}
