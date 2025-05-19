import { Component, OnInit, Input, OnChanges, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

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
  @Input() selectedLangCode: string;
  @Input() UPLOAD_ENGINE_IS_FIREBASE: boolean;
  @Input() imageStorage: string;
  @Input() currentUserId: string;
  @Input() current_user_name: string;
  @Input() LABEL_PLACEHOLDER: string;
  @Input() questions: any;
  @Input() activeQuestion: number;
  @Input() IS_ONBOARDING_PAGE: boolean = false;
  @Input() showAttachmentButton: boolean;
  @Input() showEmojiButton: boolean;
  @Input() showAudioRecorderButton: boolean; // to activate whwn is ready on the widget
  @Input() footerBrand : string;
  // showAudioRecorderButton: boolean =false;
  
  primaryColorRGBA_1: any
  primaryColorRGBA_050: any
  linearGradient: any;
  chatPreviewText1: string;
  chatPreviewText2: string;
  // IS_ONBOARDING_PAGE: boolean = false;
  constructor(
    private router: Router,
    private elementRef: ElementRef,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    // console.log('[WIDGET-CHAT-COMP] primaryColor', this.primaryColor)
    const current_url = this.router.url
    if (current_url.indexOf('onboarding') > -1) {
      this.IS_ONBOARDING_PAGE = true;
    }

   

  }

  

  ngOnChanges() {
    // console.log('[WIDGET-CHAT-COMP] imageStorage ', this.imageStorage)
    // console.log('[WIDGET-CHAT-COMP] currentUserId ', this.currentUserId)
    // console.log('[WIDGET-CHAT-COMP] footerBrand ', this.footerBrand)
    // console.log('[WIDGET-CHAT-COMP] selectedLangCode ', this.selectedLangCode)
     this.translateHardcodedStrings(this.selectedLangCode)
    
    // console.log('[WIDGET-CHAT-COMP] showAttachmentButton ', this.showAttachmentButton)
    // console.log('[WIDGET-CHAT-COMP] showAudioRecorderButton ', this.showAudioRecorderButton)
    // console.log('[WIDGET-CHAT-COMP] LABEL_PLACEHOLDER ', this.LABEL_PLACEHOLDER)
    // console.log('[WIDGET-CHAT-COMP] themeColorOpacity ', this.themeColorOpacity)
    if (this.themeColorOpacity === '0.50') {
      this.generateLinearGradient(this.primaryColor)
    } else if (this.themeColorOpacity === '1') {
      this.genetateThemeColorNoOpacity();
    }
  }

translateHardcodedStrings(selectedLangCode) {
  

  //  const translation = this.translate.translations[selectedLangCode]?.['ChatPreviewText1'];
  //   console.log(`ChatPreviewText1 in ${selectedLangCode} ChatPreviewText1 :`, translation);

    //  this.translate.use(selectedLangCode).subscribe(() => {
    // const translated = this.translate.instant('ChatPreviewText1');
    // console.log(`ChatPreviewText1 in ${selectedLangCode}:`, translated);
    //  });

    if (selectedLangCode === 'ar')  {
      this.chatPreviewText1 = "مرحبًا، أواجه مشكلة في تسجيل الدخول."  
      this.chatPreviewText2 = "هل يمكنك أن تخبرني المزيد؟"
    } else if (selectedLangCode === 'az') {
      this.chatPreviewText1 = "Salam, mən daxil olmaqda çətinlik çəkirəm."
      this.chatPreviewText2 = "Mənə daha çox məlumat verə bilərsinizmi?"
    } else if (selectedLangCode === 'de') {
      this.chatPreviewText1 = "Hallo, ich habe Probleme beim Anmelden."
      this.chatPreviewText2 = "Können Sie mir mehr erzählen?"
    } else if (selectedLangCode === 'en') {
      this.chatPreviewText1 = "Hi, i'm having trouble logging in."
      this.chatPreviewText2 = "Can you tell me more?"
    } else if (selectedLangCode === 'es') {
      this.chatPreviewText1 = "Hola, tengo problemas para iniciar sesión."
      this.chatPreviewText2 = "¿Podrías contarme más?"
    } else if (selectedLangCode === 'fr') {
      this.chatPreviewText1 = "Bonjour, j'ai des difficultés à me connecter."
      this.chatPreviewText2 = "Pouvez-vous m'en dire plus?"
    } else if (selectedLangCode === 'it') {
      this.chatPreviewText1 = "Ciao, ho problemi ad effettuare l'accesso."
      this.chatPreviewText2 = "Puoi darmi maggiori informazioni?"
    } else if (selectedLangCode === 'kk') {
      this.chatPreviewText1 = "Сәлем, менде жүйеге кіруде қиындықтар туындады."
      this.chatPreviewText2 = "Толығырақ айта аласыз ба?"
    } else if (selectedLangCode === 'pt') {
      this.chatPreviewText1 = "Olá, estou com problemas para fazer login."
      this.chatPreviewText2 = "Pode me contar mais?"
    } else if (selectedLangCode === 'ru') {
      this.chatPreviewText1 = "Привет, у меня проблемы со входом."
      this.chatPreviewText2 = "Можете рассказать подробнее?"
    } else if (selectedLangCode === 'sr') {
      this.chatPreviewText1 = "Здраво, имам проблема са пријављивањем."
      this.chatPreviewText2 = "Можете ли ми рећи више?"
    } else if (selectedLangCode === 'sv') {
      this.chatPreviewText1 = "Hej, jag har problem med att logga in."
      this.chatPreviewText2 = "Kan du berätta mer?"
    } else if (selectedLangCode === 'tr') {
      this.chatPreviewText1 = "Merhaba, giriş yapmada sorun yaşıyorum."
      this.chatPreviewText2 = "Daha fazla bilgi verebilir misiniz?"
    } else if (selectedLangCode === 'uk') {
      this.chatPreviewText1 = "Привіт, у мене проблеми зі входом."
      this.chatPreviewText2 = "Чи можете ви розповісти мені більше?"
    } else if (selectedLangCode === 'uz') {
      this.chatPreviewText1 = "Salom, men kirishda muammoga duch keldim."
      this.chatPreviewText2 = "Menga ko'proq aytib bera olasizmi?"
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
