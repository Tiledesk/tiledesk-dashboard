import { Component, OnInit } from '@angular/core';
import { WidgetSharedComponent } from '../../widget-shared/widget-shared.component';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'appdashboard-widget-set-up-base',
  templateUrl: './widget-set-up-base.component.html',
  styleUrls: ['./widget-set-up-base.component.scss']
})
export class WidgetSetUpBaseComponent extends WidgetSharedComponent implements OnInit {

  // { seconds: 'disabled', value: -1 },
  calloutTimerOptions = [
    { seconds: '5', value: 5 },
    { seconds: '10', value: 10 },
    { seconds: '15', value: 15 },
    { seconds: '20', value: 20 },
    { seconds: '25', value: 25 },
    { seconds: '30', value: 30 }
  ]

  // onlineMsgSuccessNoticationMsg: string;
  // offlineMsgSuccessNoticationMsg: string;
  // updateWidgetSuccessNoticationMsg: string;
  // errorNoticationMsg: string;
  // invalidJSON_ErrorMsg: string;

  translationMap: Map<string, string> = new Map();

  public widgetDefaultSettings =
    {
      'preChatForm': false,
      'calloutTimer': -1,
      'align': 'right',
      'logoChat': 'tiledesklogo',
      'themeColor': '#2a6ac1',
      'themeForegroundColor': '#ffffff',
      'preChatFormCustomFieldsEnabled': false,
      'preChatFormJson': [
        {
          "name": "userFullname",
          "type": "text",
          "mandatory": true,
          "label": {
            "en": "Full Name",
            "it": "Nome utente"
          }
        },
        {
          "name": "userEmail",
          "type": "text",
          "mandatory": true,
          "regex": "/^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/",
          "label": {
            "en": "Email",
            "it": "Indirizzo email"
          },
          "errorLabel": {
            "en": "Invalid email address",
            "it": "Indirizzo email non valido"
          }
        }
      ],
      'en': {
        'wellcomeTitle': 'Hi, welcome to tiledesk 👋 ',
        'wellcomeMsg': 'How can we help you?',
        'calloutTitle': 'Need Help?',
        'calloutMsg': 'Click here and start chatting with us!',
        'online_msg': 'Describe shortly your problem, you will be contacted by an agent.',
        // tslint:disable-next-line:max-line-length
        'offline_msg': '🤔 All operators are offline at the moment. You can anyway describe your problem. It will be assigned to the support team who will answer you as soon as possible.'
      },
      'it': {
        'wellcomeTitle': 'Ciao, benvenuto su tiledesk 👋',
        'wellcomeMsg': 'Come possiamo aiutarti?',
        'calloutTitle': 'Bisogno di aiuto?',
        'calloutMsg': 'Clicca qui e inizia a chattare con noi!',
        'online_msg': 'Descrivi sinteticamente il tuo problema, ti metteremo in contatto con un operatore specializzato.',
        // tslint:disable-next-line:max-line-length
        'offline_msg': '🤔 Tutti gli operatori sono offline al momento. Puoi comunque descrivere il tuo problema. Sarà assegnato al team di supporto che ti risponderà appena possibile.'
      },
    }

  browserLang: string;

  constructor(public translate: TranslateService) {
    super();
  }

  ngOnInit() {
    this.getBrowserLang();
  }

  getBrowserLang() {
    this.browserLang = this.translate.getBrowserLang();
    // console.log('WIDGET DESIGN - BROWSER LANG ', this.browserLang)
  }

  compare(a, b) {
    // Use toUpperCase() to ignore character casing
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();

    let comparison = 0;
    if (nameA > nameB) {
      comparison = 1;
    } else if (nameA < nameB) {
      comparison = -1;
    }
    return comparison;
  }

  welcomeTitle_SetPlaceholder() {
    if (this.browserLang) {
      if (this.browserLang === 'it') {
        return this.widgetDefaultSettings.it.wellcomeTitle;
      } else {
        return this.widgetDefaultSettings.en.wellcomeTitle;
      }
    }
  }


  translateTextBaseComp() {

    const keys = [
      'InvalidJSON',
      'UpdateDeptGreetingsOnlineMsgSuccessNoticationMsg',
      'UpdateDeptGreetingsOfflineMsgSuccessNoticationMsg',
      'UpdateDeptGreetingsSuccessNoticationMsg',
      'UserEditAddPage.AnErrorHasOccurred',
      'URLTypeNotAllowed'
    ]

    this.translate.get(keys).subscribe(translations =>{
      Object.keys(translations).forEach(key => this.translationMap.set(key, translations[key]))
    })

  }
}
