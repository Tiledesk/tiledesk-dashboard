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
  @Input() themeColorOpacity: string;
  @Input() newConversation: string;
  @Input() preChatFormCustomFieldsEnabled: boolean;
  @Input() prechatFormArray: any; //used for the new projects
  @Input() LABEL_PRECHAT_USER_FULLNAME: string;
  @Input() LABEL_PRECHAT_USER_EMAIL: string;
  @Input() LABEL_PRECHAT_USER_PHONE: string;
  @Input() LABEL_PRECHAT_FIRST_MESSAGE: string;
  @Input() LABEL_PRECHAT_STATIC_TERMS_PRIVACY: string;
  @Input() LABEL_PRECHAT_ACCEPT_TERMS_PRIVACY: string;
  @Input() LABEL_COMPLETE_FORM: string;
  @Input() LABEL_FIELD_NAME: string; // for default prechat-form
  @Input() LABEL_FIELD_EMAIL: string; // for default prechat-form
  @Input() displayNewCustomPrechatFormBuilder: boolean;
  @Input() prechatFormTexareaJson //used for the old projects
  customPrechatFormArray: any;
  customPrechatFormArray_built_without_visualtool: any;
  primaryColorRGBA_1: any;
  primaryColorRGBA_050: any;
  linearGradient: any;
  // @Output() onErrorRenderForm = new EventEmitter()
  preChatFormGroupCustom: FormGroup;
  objectKeys = Object.keys;

  constructor(
    private formBuilder: FormBuilder,
    private logger: LoggerService,
    private elementRef: ElementRef
  ) { }

  ngOnInit() {

    
    // console.log('WIDGET PRE CHAT FORM displayNewCustomPrechatFormBuilder', this.displayNewCustomPrechatFormBuilder)

    // console.log('WIDGET PRE CHAT FORM LABEL_PRECHAT_USER_FULLNAME', this.LABEL_PRECHAT_USER_FULLNAME)
    // console.log('WIDGET PRE CHAT FORM LABEL_PRECHAT_USER_EMAIL', this.LABEL_PRECHAT_USER_EMAIL)
    // console.log('WIDGET PRE CHAT FORM LABEL_PRECHAT_USER_PHONE', this.LABEL_PRECHAT_USER_PHONE)
    // console.log('WIDGET PRE CHAT FORM LABEL_PRECHAT_FIRST_MESSAGE', this.LABEL_PRECHAT_FIRST_MESSAGE)
    // console.log('WIDGET PRE CHAT FORM LABEL_PRECHAT_STATIC_TERMS_PRIVACY', this.LABEL_PRECHAT_STATIC_TERMS_PRIVACY)
    // console.log('WIDGET PRE CHAT FORM LABEL_PRECHAT_ACCEPT_TERMS_PRIVACY', this.LABEL_PRECHAT_ACCEPT_TERMS_PRIVACY)
    // console.log('WIDGET PRE CHAT FORM LABEL_COMPLETE_FORM', this.LABEL_COMPLETE_FORM)
    // console.log('[WIDGET PRE CHAT FORM] primaryColor', this.primaryColor)

  }




  ngOnChanges() {
    this.customPrechatFormArray = this.prechatFormArray
    // console.log('WIDGET PRE CHAT FORM customPrechatFormArray', this.customPrechatFormArray);
    // console.log('WIDGET PRE CHAT FORM prechatFormTexareaJson', this.prechatFormTexareaJson); 
    if (this.prechatFormTexareaJson) {
      this.customPrechatFormArray_built_without_visualtool = JSON.parse(this.prechatFormTexareaJson)
    }
    // console.log('WIDGET PRE CHAT FORM customPrechatFormArray_built_without_visualtool', this.customPrechatFormArray_built_without_visualtool)
    this.customPrechatFormArray = this.prechatFormArray
    // console.log('WIDGET PRE CHAT FORM customPrechatFormArray', this.customPrechatFormArray)
    this.elementRef.nativeElement.style.setProperty('--themeColor', this.primaryColor);
    this.elementRef.nativeElement.style.setProperty('--foregroundColor', this.secondaryColor);

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
    // console.log('[WIDGET PRE CHAT FORM] primaryColorRGBA_1', this.primaryColorRGBA_1)
    // console.log('[WIDGET PRE CHAT FORM] primaryColorRGBA_050', this.primaryColorRGBA_050)

    this.linearGradient = 'linear-gradient( 180grad, ' + this.primaryColorRGBA_1 + ', ' + this.primaryColorRGBA_050 + ')';
    // console.log('[WIDGET PRE CHAT FORM] linearGradient', this.linearGradient)
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
