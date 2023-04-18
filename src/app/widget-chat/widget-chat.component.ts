import { Component, OnInit, Input, OnChanges, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'appdashboard-widget-chat',
  templateUrl: './widget-chat.component.html',
  styleUrls: ['./widget-chat.component.scss']
})
export class WidgetChatComponent implements OnInit, OnChanges {

  @Input() primaryColor: string;
  @Input() secondaryColor: string;
  @Input() themeColorOpacity: string;
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

  @Input() questions: any;
  @Input() activeQuestion: number;
  @Input() IS_ONBOARDING_PAGE: boolean = false;

  primaryColorRGBA_1: any
  primaryColorRGBA_050: any
  linearGradient: any
  // IS_ONBOARDING_PAGE: boolean = false;
  constructor(
    private router: Router,
    private elementRef: ElementRef
  ) { }

  ngOnInit() {
    // console.log('[WIDGET-CHAT-COMP] primaryColor', this.primaryColor)
    const current_url = this.router.url
    if (current_url.indexOf('onboarding') > -1) {
      this.IS_ONBOARDING_PAGE = true;
    }

  }

  ngOnChanges() {
    // console.log('[WIDGET-CHAT-COMP] LABEL_PLACEHOLDER ', this.LABEL_PLACEHOLDER)
    // console.log('[WIDGET-CHAT-COMP] themeColorOpacity ', this.themeColorOpacity)
    if (this.themeColorOpacity === '0.50') {
      this.generateLinearGradient(this.primaryColor)
    } else if (this.themeColorOpacity === '1') {
      this.genetateThemeColorNoOpacity();
    }
  }
  genetateThemeColorNoOpacity() {
    this.primaryColorRGBA_1 = this.hexToRgbA_1(this.primaryColor)
    this.linearGradient = 'linear-gradient( 180grad, ' + this.primaryColorRGBA_1 + ', ' + this.primaryColorRGBA_1 + ')';
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
      // return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + `${this.themeColorOpacity})`;
    }
    throw new Error('Bad Hex');
  }



}
