import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { WidgetService } from '../../services/widget.service';
import { BaseTranslationComponent } from './base-translation/base-translation.component';
import { NotifyService } from '../../core/notify.service';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '../../services/logger/logger.service';
import { AuthService } from 'app/core/auth.service';
import { ActivatedRoute } from '@angular/router';
const swal = require('sweetalert');

@Component({
  selector: 'appdashboard-widget-multilanguage',
  templateUrl: './widget-multilanguage.component.html',
  styleUrls: ['./widget-multilanguage.component.scss']
})


export class WidgetMultilanguageComponent extends BaseTranslationComponent implements OnInit {
  objectKeys = Object.keys;
  selectedTranslationCode: string;
  selectedTranslationLabel: string;
  selectedLang: string

  mock_labels: any;
  eng_labels: any;

  temp_SelectedLangCode: string;
  temp_SelectedLangName: string;

  selected_translation: Array<any> = []
  languages_codes: any;

  showSheleton = true;

  translations: any
  currentTraslationClone: object;
  modifiedTranslation: object;

  engTraslationClone: object;
  errorNoticationMsg: string;
  disableAddBtn: boolean;
  updateWidgetSuccessNoticationMsg: string;
  translationDeleted: string;
  defaultLangName: string;
  defaultLangCode: string;
  areYouSureMsg: string;
  deleteMsg: string;
  cancelMsg: string;
  isChromeVerGreaterThan100: boolean;
  IS_OPEN_SETTINGS_SIDEBAR: boolean; 
  callingPage: string;
  constructor(
    public location: Location,
    public widgetService: WidgetService,
    private notify: NotifyService,
    private translate: TranslateService,
    public auth: AuthService,
    private logger: LoggerService,
    public route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit() {
    this.selectedTranslationCode = 'en'

    this.getTranslation()
    this.getEnDefaultTranslation();
    // this.getLabels();
    this.getBrowserVersion()
    this.listenSidebarIsOpened();
    this.getRouteParams()
  }

  getRouteParams() {
    this.route.params.subscribe((params) => {
      this.logger.log('[MULTILANGUAGE] - GET ROUTE PARAMS ', params);
      if (params.calledby && params.calledby === 'w') {
        this.callingPage = 'widgetsetup'
        this.logger.log('[MULTILANGUAGE] - GET ROUTE PARAMS callingPage ', this.callingPage);
      } else if (!params.calledby) {
        this.callingPage = 'settingsb'
        this.logger.log('[MULTILANGUAGE] - GET ROUTE PARAMS callingPage ', this.callingPage);
      }
    })
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => { 
     this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    //   this.logger.log("[BOT-CREATE] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
   }

   listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
      this.logger.log('Multilanguage (widget-multilanguage) isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    })
  }



  getTranslation() {
    this.translateGetTranslationErrorMsg();
    this.translateAreYouSure();
    this.translateDelete();
    this.translateCancel();
  }

  translateGetTranslationErrorMsg() {
    this.translate.get('UserEditAddPage.AnErrorHasOccurred')
      .subscribe((text: string) => {
        this.errorNoticationMsg = text;
      });
  }

  translateAreYouSure() {
    this.translate.get('AreYouSure').subscribe((text: string) => {
      this.areYouSureMsg = text;
    });
  }

  translateDelete() {
    this.translate.get('Delete')
      .subscribe((text: string) => {
        this.deleteMsg = text;
      });
  }
  translateCancel() {
    this.translate.get('Cancel')
      .subscribe((text: string) => {
        this.cancelMsg = text;
      });
  }

  public generateFake(count: number): Array<number> {
    const indexes = [];
    for (let i = 0; i < count; i++) {
      indexes.push(i);
    }
    return indexes;
  }


  getEnDefaultTranslation() {

    this.widgetService.getEnDefaultLabels().subscribe((labels: any) => {
      this.logger.log('Multilanguage (widget-multilanguage) ***** GET labels DEFAULT TRANSLATION ***** - RES', labels);
      if (labels) {
        // this.translation = labels[0].data[0];

        this.engTraslationClone = Object.assign({}, labels['data']);
        // this.logger.log('Multilanguage ***** GET labels ***** - RES > TRANSLATIONS ', labels[0].data[0]);
        this.logger.log('Multilanguage (widget-multilanguage) ***** GET labels DEFAULT TRANSLATION ***** - engTraslationClone >  ', this.engTraslationClone);


      }

    }, error => {
      this.logger.error('Multilanguage - ***** GET labels DEFAULT TRANSLATION ***** - ERROR ', error)
    }, () => {
      this.logger.log('Multilanguage - ***** GET labels DEFAULT TRANSLATION ***** * COMPLETE *')
      // this.showSheleton = false;
      // this.getLabels(labels.lang.toLowerCase(), );
      this.getLabels()
    });
  }

  // langSelectedCode, langSelectedName
  getLabels() {
    const self = this
    this.widgetService.getLabels().subscribe((labels: any) => {
      this.logger.log('Multilanguage (widget-multilanguage) labels ***** - RES', labels);
      this.logger.log('Multilanguage (widget-multilanguage) labels ***** - RES typeof', typeof labels);
      // && labels.length > 0 
      if (labels && Object.keys(labels).length > 0) {
        // this.translation = labels[0].data[0];
        this.translations = labels['data']
        // this.logger.log('Multilanguage ***** GET labels ***** - RES > TRANSLATIONS ', labels[0].data[0]);
        this.logger.log('Multilanguage ***** GET labels ***** - RES > TRANSLATIONS ', this.translations);

        this.languages_codes = [];



        // if (this.translations.filter(e => e.lang === 'EN').length > 0) {
        //   /* vendors contains the element we're looking for */
        //   this.logger.log('Multilanguage ***** EN EXIST');

        // } else {
        //   this.logger.log('Multilanguage ***** ENGLISH TRANSLATION NOT EXIST');
        //   this.notify.showNotification(this.errorNoticationMsg, 4, 'report_problem');
        // }

        this.translations.forEach(translation => {
          this.logger.log('Multilanguage (widget-multilanguage) ***** GET labels ***** - RES >>> TRANSLATION ', translation);

          if (translation) {

            // UNA LINGUA  FA PARTE DEL PROGETTO SE HA UN ID ED  L'AGGIUNGO TRA LE DISPONIBILI
            if (translation._id !== undefined) {
              this.languages_codes.push(translation.lang.toLowerCase())
            }

            if (translation.default === true) {
              this.defaultLangCode = translation.lang.toLowerCase()
              this.logger.log('Multilanguage (widget-multilanguage) - defaultLangCode (onInit) ', this.defaultLangCode);
              this.defaultLangName = this.getLanguageNameFromCode(translation.lang.toLowerCase());
              this.logger.log('Multilanguage (widget-multilanguage) ***** GET labels ***** - RES >>> TRANSLATION defaultLangName', this.defaultLangName);
              this.logger.log('Multilanguage (widget-multilanguage) ***** GET labels ***** - RES >>> TRANSLATION defaultLangCode', this.defaultLangCode);
              this._selectTranslationTab(translation.lang.toLowerCase(), this.defaultLangName);
            }
            this.logger.log('Multilanguage (widget-multilanguage) ***** GET labels ***** - languages_codes.length', this.languages_codes.length);
            if (this.languages_codes.length === 0) {
              this._selectTranslationTab('add', '');
            }


            /* old */
            // se c'è inglese eseguo subito il push in languages_codes per le altre lang verifico se è presente _id
            // prima di eseguire il push

            // if (translation.lang === 'EN') {
            //   this.languages_codes.push(translation.lang.toLowerCase());

            //   this.engTraslationClone = Object.assign({}, translation['data']);
            //   // this.logger.log('Multilanguage ***** GET labels ***** >>> engTraslationClone', this.engTraslationClone);
            // }
            // if (translation.lang !== 'EN') {
            //   this.logger.log('Multilanguage ***** GET labels ***** - RES >>> TRANSLATION _id', translation._id);

            //   // UNA LINGUA DIVERSA DALL'INGLESE FA PARTE DEL PROGETTO SE HA UN ID ED è IN QUESTO CASO CHE L'AGGIUNGO TRA LE DISPONIBILI
            //   // (INFATTI LE LINGUE CON L'ID SONO QUELLE CHE AGGIUNGE L'UTENTE - ANCHE L'INGLESE AVRA' L'ID SE VIENE MODIFICATA)
            //   if (translation._id !== undefined) {
            //     this.languages_codes.push(translation.lang.toLowerCase())
            //   }
            // }
          }
        });
        this.logger.log('Multilanguage (widget-multilanguage) - defaultLangCode (onInit) 2', this.defaultLangCode);
        this.logger.log('Multilanguage ***** GET labels ***** - Array of LANG CODE ', this.languages_codes);
        this.doAvailableLanguageArray(this.languages_codes);
      } else {
        this._selectTranslationTab('add', '');
      }

    }, error => {
      this.logger.error('Multilanguage ***** GET labels ***** - ERROR ', error)
    }, () => {
      this.logger.log('Multilanguage ***** GET labels ***** * COMPLETE *')
      this.showSheleton = false;

      /* old */
      // if (this.translations) {
      //   this._selectTranslationTab('en', 'English');
      // }
    });
  }

  makeDefaultLanguage(languageCode) {
    this.logger.log('Multilanguage (widget-multilanguage) - MAKE DAFAULT LANG - languageCode: ', languageCode);

    this.widgetService.setDefaultLanguage(languageCode).subscribe((translation: any) => {
      this.logger.log('Multilanguage (widget-multilanguage) - MAKE DAFAULT LANG - RES ', translation);

      if (translation.default === true) {
        this.defaultLangCode = translation.lang.toLowerCase()
        this.logger.log('Multilanguage (widget-multilanguage) - MAKE DAFAULT LANG - defaultLangCode ', this.defaultLangCode);
        this.defaultLangName = this.getLanguageNameFromCode(languageCode);
      }
    }, error => {
      this.logger.error('Multilanguage (widget-multilanguage) - MAKE DAFAULT LANG - ERROR ', error);
    }, () => {
      this.logger.log('Multilanguage (widget-multilanguage) - MAKE DAFAULT LANG ***** * COMPLETE *');

      // this.getLabels()

    });
  }

  _selectTranslationTab(langSelectedCode, langSelectedName) {
    this.logger.log('Multilanguage (widget-multilanguage) _selectTranslationTab -- translations ', this.translations);
    this.selectedTranslationCode = langSelectedCode;
    this.logger.log('Multilanguage (widget-multilanguage) _selectTranslationTab lang Selected Code ', this.selectedTranslationCode);
    this.selectedTranslationLabel = langSelectedName;
    this.logger.log('Multilanguage (widget-multilanguage) _selectTranslationTab lang Selected Name ', this.selectedTranslationLabel);

    this.selected_translation = []

    if (this.selectedTranslationCode !== 'add') {

      this.translations.forEach(translation => {
        if (translation) {
          this.logger.log('Multilanguage (widget-multilanguage) _selectTranslationTab traslation (forEach) ', translation)

          if (translation.lang.toLowerCase() === this.selectedTranslationCode) {
            this.logger.log('Multilanguage (widget-multilanguage) _selectTranslationTab traslation selected ', translation['data'])

            // for (let [key, value] of Object.entries(translation['data'])) {
            //   // this.logger.log(`Multilanguage (widget-multilanguage) selectTranslationTab key : ${key} - value ${value}`);

            //   let enLabel = this.engTraslationClone[key]

            //   let entry = { "labelName": enLabel, "labelValue": value }
            //   this.selected_translation.push(entry);
            //   // this.selected_translation['labelValue'] = value

            // }

            for (let [key, value] of Object.entries(this.engTraslationClone)) {
              this.logger.log(`Multilanguage (widget-multilanguage) selectTranslationTab key : ${key} - value ${value}`);

              let enLabel = this.engTraslationClone[key]

              let entry = { "labelName": enLabel, "labelValue": translation['data'][key] ? translation['data'][key] :  enLabel}
              this.selected_translation.push(entry);
              // this.selected_translation['labelValue'] = value

            }
            this.logger.log('Multilanguage ***** GET labels ***** - selected_translation ', this.selected_translation);
          }
        }
      });

    } else if (this.selectedTranslationCode === 'add') {
      this.spliceLanguageIfAlreadyAdded();
      this.selectedLang = null;
      this.disableAddBtn = true;
    }
  }

  addNewLanguage() {
    this.showSheleton = true;
    this.selectedTranslationCode = this.temp_SelectedLangCode
    this.selectedTranslationLabel = this.temp_SelectedLangName
    this.logger.log('Multilanguage ***** ADD-NEW-LANG selectedTranslationCode', this.selectedTranslationCode);
    this.logger.log('Multilanguage ***** ADD-NEW-LANG selectedTranslationLabel', this.selectedTranslationLabel);

    // cloneLabel CHE RITORNERA IN RESPONSE LA NUOVA LINGUA (l'inglese nel caso non sia una delle nostre lingue pretradotte)
    this.widgetService.cloneLabel(this.temp_SelectedLangCode.toUpperCase())
      .subscribe((res: any) => {
        // this.logger.log('Multilanguage - addNewLanguage - CLONE LABEL RES ', res);
        this.logger.log('Multilanguage - ADD-NEW-LANG (clone-label) RES ', res.data);

        if (res) {

          // UPDATE THE ARRAY TRANSLATION CREATED ON INIT
          this.translations = res.data
          this._selectTranslationTab(this.selectedTranslationCode, this.selectedTranslationLabel)
        }

      }, error => {
        this.logger.error('Multilanguage ADD-NEW-LANG (clone-label) - ERROR ', error)
      }, () => {
        this.logger.log('Multilanguage ADD-NEW-LANG (clone-label) * COMPLETE *')


        this.showSheleton = false;
        this.notify.presentModalSuccessCheckModal('AddTranslation', 'Completed')
      });

    // // ADD THE NEW LANGUAGE TO BOTTOM NAV
    const newLang = { code: this.temp_SelectedLangCode, name: this.temp_SelectedLangName };
    this.logger.log('Multilanguage saveNewLanguage newLang objct ', newLang);

    this.availableTranslations.push(newLang)
    this.logger.log('Multilanguage saveNewLanguage availableTranslations ', this.availableTranslations)
  }

  onChangeTranslation(event, labelName) {
    this.logger.log('Multilanguage - onChangeTranslation event: ', event, ' - labelName: ', labelName);
    this.translations.forEach(translation => {
      if (translation) {
        this.logger.log('Multilanguage -- onChangeTranslation - traslation ', translation)

        if (translation.lang.toLowerCase() === this.selectedTranslationCode) {

          // this.logger.log('Multilanguage - onChangeTranslation CLONE OF CURRENT TRASLATION ', this.currentTraslationClone);


          // quando l'utente modifica un labelValue viene passato l'event (il label value modificato) e la labelName
          // Per modificare il clone della traduzione corrente individuo nel clone della traduzione inglese la key corrispondente al
          // alla labelName della label value che l'utente sta modificando

          var found_key = Object.keys(this.engTraslationClone).find(key => this.engTraslationClone[key] === labelName);
          this.logger.log('Multilanguage - onChangeTranslation filter result found_key ', found_key);

          translation['data'][found_key] = event
          this.logger.log('Multilanguage - onChangeTranslation ========== translation[data] ', translation['data']);

          this.currentTraslationClone = Object.assign({}, translation['data']);
          this.logger.log('Multilanguage - onChangeTranslation currentTraslationClone Translation', this.currentTraslationClone);

          // this.logger.log('Multilanguage - onChangeTranslation ========== this.translations', this.translations);
          // const found_translation = this.translations.filter((obj: any) => {
          //   return obj.lang === this.selectedTranslationCode.toUpperCase();
          // });
          // this.logger.log('Multilanguage - onChangeTranslation ========== found_translation', found_translation);


        }
      }
    });
  }

  editLang() {
    this.logger.log('Multilanguage (widget-multilanguage) - currentTraslationClone ', this.currentTraslationClone);
    const btn_edit_lang = <HTMLElement>document.querySelector('.btn_edit_lang');
    if (btn_edit_lang) {
      btn_edit_lang.blur()
    }



    this.logger.log('Multilanguage (widget-multilanguage) - selectedTranslationCode ', this.selectedTranslationCode);
    this.logger.log('Multilanguage (widget-multilanguage)) - defaultLangCode ', this.defaultLangCode);

    let isdefault = null

    if (this.selectedTranslationCode === this.defaultLangCode) {
      isdefault = true
    } else {
      isdefault = false
    }
    this.currentTraslationClone['WELLCOME_TITLE'] = this.currentTraslationClone['WELCOME_TITLE']
    this.currentTraslationClone['WELLCOME_MSG'] = this.currentTraslationClone['WELCOME_MSG']
    this.currentTraslationClone['WELLCOME'] = this.currentTraslationClone['WELCOME']
    this.widgetService.editLabels(this.selectedTranslationCode.toUpperCase(), isdefault, this.currentTraslationClone)
      .subscribe((labels: any) => {
        this.logger.log('Multilanguage (widget-multilanguage) - editLang RES ', labels);

      }, error => {
        this.logger.error('Multilanguage (widget-multilanguage)) - editLang - ERROR ', error);

        this.notify.showNotification(this.errorNoticationMsg, 4, 'report_problem');
      }, () => {

        this.translateAndShowUpdateWidgetNotification();
        this.logger.log('Multilanguage (widget-multilanguage) - editLang * COMPLETE *')
      });
  }

  translateAndShowUpdateWidgetNotification() {
    this.translate.get('UpdateDeptGreetingsSuccessNoticationMsg')
      .subscribe((text: string) => {

        this.updateWidgetSuccessNoticationMsg = text;
        // this.logger.log('»» WIDGET SERVICE - Update Widget Project Success NoticationMsg', text)
      }, (error) => {

        this.logger.error('»» WIDGET SERVICE -  Update Widget Project Success NoticationMsg - ERROR ', error);
      }, () => {

        this.notify.showWidgetStyleUpdateNotification(this.updateWidgetSuccessNoticationMsg, 2, 'done');
        // this.logger.log('»» WIDGET SERVICE -  Update Widget Project Success NoticationMsg * COMPLETE *');
      });
  }

  onFocusSelectLang() {
    this.logger.log('Multilanguage onFocusSelectLang translations ', this.translations);
  }


  onSelectlang(selectedLang) {
    if (selectedLang) {
      this.disableAddBtn = false;
      this.temp_SelectedLangCode = selectedLang.code;
      this.temp_SelectedLangName = selectedLang.name;
      this.logger.log('Multilanguage onSelectlang selected TEMP Lang Code ', this.temp_SelectedLangCode);
      this.logger.log('Multilanguage onSelectlang selected TEMP Lang label ', this.temp_SelectedLangName);
    }
  }

  onClearSelectedLanguage() {
    this.disableAddBtn = true;
    this.logger.log('Multilanguage onClearSelectedLanguage disableAddBtn ', this.disableAddBtn);
  }


  presentSwalModalDeleteLanguage() {
    //  this.logger.log('Multilanguage deleteLang selected Translation Label', this.selectedTranslationLabel)
    swal({
      title: this.areYouSureMsg + '?',
      text: this.translate.instant('TheLanguageWillBeRemovedFromYourProject', {language_name: this.selectedTranslationLabel }),
      icon: "warning",
      buttons: [this.cancelMsg, this.deleteMsg],
      dangerMode: true,
    })
      .then((WillDelete) => {
        if (WillDelete) {
          this.deleteLang();
          //  this.logger.log('[Multilanguage] swal WillDelete ', WillDelete)
        } else {
          //  this.logger.log('[Multilanguage] swal WillDelete (else)', swal)
        }
      });
  }



  deleteLang() {
    this.logger.log('Multilanguage deleteLang selected Translation Label', this.selectedTranslationLabel);
    const btn_delete_lang = <HTMLElement>document.querySelector('.btn_delete_lang');
    if (btn_delete_lang) {
      btn_delete_lang.blur()
    }

    this.logger.log('Multilanguage (widget-mtl) - deleteLang ->  availableTranslations before splice', this.availableTranslations)
    var foundIndex = this.availableTranslations.findIndex(x => x.code == this.selectedTranslationCode);

    this.logger.log('Multilanguage (widget-mtl) - deleteLang ->  availableTranslations foundIndex', foundIndex)

    this.availableTranslations.splice(foundIndex, 1);
    this.logger.log('Multilanguage (widget-mtl) - deleteLang ->  availableTranslations after splice ', this.availableTranslations)

    const elemLangTab = <HTMLElement>document.querySelector(`#${this.selectedTranslationCode}_tab`);
    this.logger.log('Multilanguage (widget-mtl) - deleteLang -> bottom nav tab to remove', elemLangTab)

    if (elemLangTab) {
      // elemLangTab.style.display = "none"

      elemLangTab.remove()
    }

    // this.spliceAvailableLanguage(this.selectedTranslationCode)
    // this.getLabels();


    this.widgetService.deleteLabels(this.selectedTranslationCode.toUpperCase())
      .subscribe((labels: any) => {
        this.logger.log('Multilanguage (widget-mtl) - deleteLang RES ', labels);
      }, error => {
        this.logger.error('Multilanguage (widget-mtl) - deleteLang - ERROR ', error)
        this.notify.showNotification(this.errorNoticationMsg, 4, 'report_problem');

        this.selectedTranslationCode = 'add'
      }, () => {

        this.selectedTranslationCode = 'add'
        this.selectedLang = null;
        this.disableAddBtn = true;

        this.logger.log('Multilanguage (widget-mtl) - deleteLang * COMPLETE *');

        this.translateTranslationDeletedAndShowNotification()

      });
  }

  translateTranslationDeletedAndShowNotification() {
    this.translateTranslationDeleted();
  }

  translateTranslationDeleted() {
    this.translate.get('TranslationDeleted', { language_name: this.selectedTranslationLabel })

      .subscribe((text: string) => {

        this.translationDeleted = text;
        this.logger.log('+ + + translateTranslationDeleted ', text)
      }, (error) => {
        this.logger.error('+ + + translateTranslationDeleted  - ERROR ', error);
      }, () => {
        this.logger.log('+ + + translateTranslationDeleted  * COMPLETE *');
        this.notify.showWidgetStyleUpdateNotification(this.translationDeleted, 2, 'done');
      });
  }

  goBack() {
    this.location.back();
  }

}
