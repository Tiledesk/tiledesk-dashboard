import { Component, ElementRef, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { LoggerService } from '../services/logger/logger.service';
@Component({
  selector: 'appdashboard-widget-prechat-form',
  templateUrl: './widget-prechat-form.component.html',
  styleUrls: ['./widget-prechat-form.component.scss']
})
export class WidgetPrechatFormComponent implements OnInit, OnChanges {

  @Input() primaryColor: string;
  @Input() secondaryColor: string;
  @Input() newConversation: string;
  @Input() preChatFormCustomFieldsEnabled: boolean;
  @Input() prechatFormArray: any;
  @Input() LABEL_PRECHAT_USER_FULLNAME: string;
  @Input() LABEL_PRECHAT_USER_EMAIL: string;
  @Input() LABEL_PRECHAT_USER_PHONE: string;
  @Input() LABEL_PRECHAT_FIRST_MESSAGE: string;
  @Input() LABEL_PRECHAT_STATIC_TERMS_PRIVACY: string;
  @Input() LABEL_PRECHAT_ACCEPT_TERMS_PRIVACY: string;
  @Input() LABEL_COMPLETE_FORM: string;
  customPrechatFormArray: any;
  primaryColorRGBA_1: any;
  primaryColorRGBA_050: any;
  linearGradient: any;
  // @Output() onErrorRenderForm = new EventEmitter()
  preChatFormGroupCustom: FormGroup;


  constructor(
    private formBuilder: FormBuilder,
    private logger: LoggerService,
    private elementRef: ElementRef
  ) { }

  ngOnInit() {
    // console.log('WIDGET PRE CHAT FORM prechatFormTexareaJson' ,this.prechatFormTexareaJson)
    this.customPrechatFormArray = this.prechatFormArray
    console.log('WIDGET PRE CHAT FORM customPrechatFormArray', this.customPrechatFormArray)
    console.log('WIDGET PRE CHAT FORM LABEL_PRECHAT_USER_FULLNAME', this.LABEL_PRECHAT_USER_FULLNAME)
    console.log('WIDGET PRE CHAT FORM LABEL_PRECHAT_USER_EMAIL', this.LABEL_PRECHAT_USER_EMAIL)
    console.log('WIDGET PRE CHAT FORM LABEL_PRECHAT_USER_PHONE', this.LABEL_PRECHAT_USER_PHONE)
    console.log('WIDGET PRE CHAT FORM LABEL_PRECHAT_FIRST_MESSAGE', this.LABEL_PRECHAT_FIRST_MESSAGE)
    console.log('WIDGET PRE CHAT FORM LABEL_PRECHAT_STATIC_TERMS_PRIVACY', this.LABEL_PRECHAT_STATIC_TERMS_PRIVACY)
    console.log('WIDGET PRE CHAT FORM LABEL_PRECHAT_ACCEPT_TERMS_PRIVACY', this.LABEL_PRECHAT_ACCEPT_TERMS_PRIVACY)
    console.log('WIDGET PRE CHAT FORM LABEL_COMPLETE_FORM', this.LABEL_COMPLETE_FORM)

    console.log('[WIDGET PRE CHAT FORM] primaryColor', this.primaryColor)

  }




  ngOnChanges() {
    console.log()
    this.customPrechatFormArray = this.prechatFormArray
    console.log('WIDGET PRE CHAT FORM customPrechatFormArray', this.customPrechatFormArray)
    this.elementRef.nativeElement.style.setProperty('--themeColor', this.primaryColor);
    this.elementRef.nativeElement.style.setProperty('--foregroundColor', this.secondaryColor);

    this.generateLinearGradient(this.primaryColor)
  }

  generateLinearGradient(primaryColor) {
    this.primaryColorRGBA_1 = this.hexToRgbA_1(primaryColor)
    this.primaryColorRGBA_050 = this.hexToRgbA_050(primaryColor)
    console.log('[WIDGET PRE CHAT FORM] primaryColorRGBA_1', this.primaryColorRGBA_1)
    console.log('[WIDGET PRE CHAT FORM] primaryColorRGBA_050', this.primaryColorRGBA_050)

    this.linearGradient = 'linear-gradient( 180grad, ' + this.primaryColorRGBA_1 + ', ' + this.primaryColorRGBA_050 + ')';
    console.log('[WIDGET PRE CHAT FORM] linearGradient', this.linearGradient)
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
