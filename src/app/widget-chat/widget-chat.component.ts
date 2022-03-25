import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'appdashboard-widget-chat',
  templateUrl: './widget-chat.component.html',
  styleUrls: ['./widget-chat.component.scss']
})
export class WidgetChatComponent implements OnInit, OnChanges {

  @Input() primaryColor: string;
  @Input() secondaryColor: string;
  @Input() HAS_FOCUSED_ONLINE_MSG: boolean;
  @Input() HAS_FOCUSED_OFFLINE_MSG: boolean;
  @Input() HAS_FOCUSED_OFFICE_CLOSED_MSG: boolean;
  @Input() selected_translation: any;
  @Input() officeClosedMsg: string;
  @Input() onlineMsg: string;
  @Input() offlineMsg: string;
  @Input() projectName: string;
  @Input() UPLOAD_ENGINE_IS_FIREBASE: boolean;
  @Input() imageUrl: string;
  @Input() currentUserId: string;
  @Input() current_user_name: string;
  @Input() LABEL_PLACEHOLDER: string;
  primaryColorRGBA_1: any
  primaryColorRGBA_050: any
  linearGradient: any
  constructor() { }

  ngOnInit() {
    // console.log('[WIDGET-CHAT-COMP] primaryColor', this.primaryColor)

  }

  ngOnChanges() {
    console.log('[WIDGET-CHAT-COMP] LABEL_PLACEHOLDER ', this.LABEL_PLACEHOLDER)
    this.generateLinearGradient(this.primaryColor)
  }

  generateLinearGradient(primaryColor) {
    this.primaryColorRGBA_1 = this.hexToRgbA_1(primaryColor)
    this.primaryColorRGBA_050 = this.hexToRgbA_050(primaryColor)
    // console.log('[WIDGET-CHAT-COMP] primaryColorRGBA_1', this.primaryColorRGBA_1)
    // console.log('[WIDGET-CHAT-COMP] primaryColorRGBA_050', this.primaryColorRGBA_050)

    this.linearGradient = 'linear-gradient( 180grad, ' + this.primaryColorRGBA_1 + ', ' + this.primaryColorRGBA_050 + ')';
    // console.log('[WIDGET-CHAT-COMP] linearGradient', this.linearGradient)
  }


  hexToRgbA_1(hex) {
    var c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split('');
      if (c.length == 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = '0x' + c.join('');
      return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',1)';
    }
    throw new Error('Bad Hex');
  }

  hexToRgbA_050(hex) {
    var c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split('');
      if (c.length == 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = '0x' + c.join('');
      return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',0.5)';
    }
    throw new Error('Bad Hex');
  }



}
