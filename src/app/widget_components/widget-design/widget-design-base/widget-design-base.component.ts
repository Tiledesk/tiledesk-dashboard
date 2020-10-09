import { Component, OnInit } from '@angular/core';
import { WidgetSharedComponent } from '../../widget-shared/widget-shared.component';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'appdashboard-widget-design-base',
  templateUrl: './widget-design-base.component.html',
  styleUrls: ['./widget-design-base.component.scss']
})
export class WidgetDesignBaseComponent extends WidgetSharedComponent implements OnInit {

  calloutTimerOptions = [
    { seconds: 'disabled', value: -1 },
    { seconds: '5', value: 5 },
    { seconds: '10', value: 10 },
    { seconds: '15', value: 15 },
    { seconds: '20', value: 20 },
    { seconds: '25', value: 25 },
    { seconds: '30', value: 30 }
  ]

  onlineMsgSuccessNoticationMsg: string;
  offlineMsgSuccessNoticationMsg: string;
  updateWidgetSuccessNoticationMsg: string;
  errorNoticationMsg: string;

  public widgetDefaultSettings =
  {
    'preChatForm': false,
    'calloutTimer': -1,
    'align': 'right',
    'logoChat': 'https://tiledesk.com/tiledesk-logo-white.png',
    'themeColor': '#2a6ac1',
    'themeForegroundColor': '#ffffff',
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
    console.log('WIDGET DESIGN - BROWSER LANG ', this.browserLang)
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

  translateOnlineMsgSuccessNoticationMsg() {
    this.translate.get('UpdateDeptGreetingsOnlineMsgSuccessNoticationMsg')
      .subscribe((text: string) => {

        this.onlineMsgSuccessNoticationMsg = text;
        // console.log('»» WIDGET SERVICE - translateOnlineMsgSuccessNoticationMsg ', text)
      }, (error) => {
        // console.log('»» WIDGET SERVICE -  translateOnlineMsgSuccessNoticationMsg - ERROR ', error);
      }, () => {
        // console.log('»» WIDGET SERVICE -  Update Widget Project Success NoticationMsg * COMPLETE *');
      });
  }

  translateOfflineMsgSuccessNoticationMsg() {
    this.translate.get('UpdateDeptGreetingsOfflineMsgSuccessNoticationMsg')
      .subscribe((text: string) => {

        this.offlineMsgSuccessNoticationMsg = text;
        // console.log('»» WIDGET SERVICE - translateOfflineMsgSuccessNoticationMsg ', text)
      }, (error) => {
        // console.log('»» WIDGET SERVICE -  translateOnlineMsgSuccessNoticationMsg - ERROR ', error);
      }, () => {
        // console.log('»» WIDGET SERVICE -  translateOfflineMsgSuccessNoticationMsg * COMPLETE *');
      });
  }

  

  translateOfficeClosedSuccessNoticationMsg() {
    this.translate.get('UpdateDeptGreetingsSuccessNoticationMsg')
      .subscribe((text: string) => {

        this.updateWidgetSuccessNoticationMsg = text;
        // console.log('»» WIDGET SERVICE - translateOfflineMsgSuccessNoticationMsg ', text)
      }, (error) => {
        // console.log('»» WIDGET SERVICE -  translateOnlineMsgSuccessNoticationMsg - ERROR ', error);
      }, () => {
        // console.log('»» WIDGET SERVICE -  translateOfflineMsgSuccessNoticationMsg * COMPLETE *');
      });
  }

 

  translateGetTranslationErrorMsg() {
    this.translate.get('UserEditAddPage.AnErrorHasOccurred')
      .subscribe((text: string) => {

        this.errorNoticationMsg = text;
        // console.log('+ + + An Error Has Occurred Notication Msg', text)
      });
  }


}
