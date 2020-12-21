import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { WidgetService } from '../../services/widget.service';
import { BaseTranslationComponent } from './base-translation/base-translation.component';
import { NotifyService } from '../../core/notify.service';
import { TranslateService } from '@ngx-translate/core';
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
  constructor(
    public location: Location,
    public widgetService: WidgetService,
    private notify: NotifyService,
    private translate: TranslateService,
  ) {
    super();
  }

  ngOnInit() {
    this.selectedTranslationCode = 'en'

    this.getTranslation()
    this.getEnDefaultTranslation();
    // this.getLabels();
    // this.getMockLabels()

  }



  getTranslation() {
    this.translateGetTranslationErrorMsg();
  }

  translateGetTranslationErrorMsg() {
    this.translate.get('UserEditAddPage.AnErrorHasOccurred')
      .subscribe((text: string) => {

        this.errorNoticationMsg = text;
        // console.log('+ + + An Error Has Occurred Notication Msg', text)
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
      console.log('WIZARD - CONFIGURE WIDGET ***** GET labels ***** - RES', labels);
      if (labels) {
        // this.translation = labels[0].data[0];

        this.engTraslationClone = Object.assign({}, labels['data']);
        // console.log('Multilanguage ***** GET labels ***** - RES > TRANSLATIONS ', labels[0].data[0]);
        console.log('WIZARD - CONFIGURE WIDGET ***** GET labels ***** - RES > DEFAULT TRANSLATION ', this.engTraslationClone);


      }

    }, error => {
      console.log('WIZARD - CONFIGURE WIDGET ***** GET labels ***** - ERROR ', error)
    }, () => {
      console.log('WIZARD - CONFIGURE WIDGET ***** GET labels ***** * COMPLETE *')
      // this.showSheleton = false;
      // this.getLabels(labels.lang.toLowerCase(), );
      this.getLabels()
    });
  }

  // langSelectedCode, langSelectedName
  getLabels() {
    const self = this
    this.widgetService.getLabels().subscribe((labels: any) => {
      console.log('Multilanguage ***** GET labels ***** - RES', labels);
      if (labels) {
        // this.translation = labels[0].data[0];
        this.translations = labels['data']
        // console.log('Multilanguage ***** GET labels ***** - RES > TRANSLATIONS ', labels[0].data[0]);
        console.log('Multilanguage ***** GET labels ***** - RES > TRANSLATIONS ', this.translations);

        this.languages_codes = [];



        // if (this.translations.filter(e => e.lang === 'EN').length > 0) {
        //   /* vendors contains the element we're looking for */
        //   console.log('Multilanguage ***** EN EXIST');

        // } else {
        //   console.log('Multilanguage ***** ENGLISH TRANSLATION NOT EXIST');
        //   this.notify.showNotification(this.errorNoticationMsg, 4, 'report_problem');
        // }

        this.translations.forEach(translation => {
          console.log('Multilanguage ***** GET labels ***** - RES >>> TRANSLATION ', translation);

          if (translation) {

            // UNA LINGUA  FA PARTE DEL PROGETTO SE HA UN ID ED  L'AGGIUNGO TRA LE DISPONIBILI
            if (translation._id !== undefined) {
              this.languages_codes.push(translation.lang.toLowerCase())
            }

            if (translation.default === true) {
              this.defaultLangCode = translation.lang.toLowerCase()
              this.defaultLangName = this.getLanguageNameFromCode(translation.lang.toLowerCase());
              console.log('Multilanguage ***** GET labels ***** - RES >>> TRANSLATION defaultLangName', this.defaultLangName);
              console.log('Multilanguage ***** GET labels ***** - RES >>> TRANSLATION defaultLangCode', this.defaultLangCode);
              this._selectTranslationTab(translation.lang.toLowerCase(), this.defaultLangName);
            }


            /* old */
            // se c'è inglese eseguo subito il push in languages_codes per le altre lang verifico se è presente _id
            // prima di eseguire il push

            // if (translation.lang === 'EN') {
            //   this.languages_codes.push(translation.lang.toLowerCase());

            //   this.engTraslationClone = Object.assign({}, translation['data']);
            //   // console.log('Multilanguage ***** GET labels ***** >>> engTraslationClone', this.engTraslationClone);
            // }
            // if (translation.lang !== 'EN') {
            //   console.log('Multilanguage ***** GET labels ***** - RES >>> TRANSLATION _id', translation._id);

            //   // UNA LINGUA DIVERSA DALL'INGLESE FA PARTE DEL PROGETTO SE HA UN ID ED è IN QUESTO CASO CHE L'AGGIUNGO TRA LE DISPONIBILI
            //   // (INFATTI LE LINGUE CON L'ID SONO QUELLE CHE AGGIUNGE L'UTENTE - ANCHE L'INGLESE AVRA' L'ID SE VIENE MODIFICATA)
            //   if (translation._id !== undefined) {
            //     this.languages_codes.push(translation.lang.toLowerCase())
            //   }
            // }
          }
        });
        console.log('Multilanguage ***** GET labels ***** - Array of LANG CODE ', this.languages_codes);
        this.doAvailableLanguageArray(this.languages_codes);
      }

    }, error => {
      console.log('Multilanguage ***** GET labels ***** - ERROR ', error)
    }, () => {
      console.log('Multilanguage ***** GET labels ***** * COMPLETE *')
      this.showSheleton = false;

      /* old */
      // if (this.translations) {
      //   this._selectTranslationTab('en', 'English');
      // }
    });
  }

  makeDefaultLanguage(languageCode) {
    console.log('Multilanguage (widget-design) - MAKE DAFAULT LANG - languageCode: ', languageCode);

    this.widgetService.setDefaultLanguage(languageCode).subscribe((translation: any) => { 
      console.log('Multilanguage (widget-design) - MAKE DAFAULT LANG - RES ', translation);

      if (translation.default === true) {
        this.defaultLangCode = translation.lang.toLowerCase()
        this.defaultLangName = this.getLanguageNameFromCode(languageCode);
      }
    }, error => {
      console.log('Multilanguage (widget-design) - MAKE DAFAULT LANG - ERROR ', error);
    }, () => {
      console.log('Multilanguage (widget-design) - MAKE DAFAULT LANG ***** * COMPLETE *');

      // this.getLabels()
     
    });
  }

  _selectTranslationTab(langSelectedCode, langSelectedName) {
    console.log('Multilanguage _selectTranslationTab -- translations ', this.translations);
    this.selectedTranslationCode = langSelectedCode;
    console.log('Multilanguage _selectTranslationTab lang Selected Code ', this.selectedTranslationCode);
    this.selectedTranslationLabel = langSelectedName;
    console.log('Multilanguage _selectTranslationTab lang Selected Name ', this.selectedTranslationLabel);

    this.selected_translation = []

    if (this.selectedTranslationCode !== 'add') {

      this.translations.forEach(translation => {
        if (translation) {
          console.log('Multilanguage _selectTranslationTab traslation (forEach) ', translation)

          if (translation.lang.toLowerCase() === this.selectedTranslationCode) {
            console.log('Multilanguage _selectTranslationTab traslation selected ', translation['data'])

            for (let [key, value] of Object.entries(translation['data'])) {
              // console.log(`Multilanguage selectTranslationTab key : ${key} - value ${value}`);

              let enLabel = this.engTraslationClone[key]

              let entry = { "labelName": enLabel, "labelValue": value }
              this.selected_translation.push(entry);
              // this.selected_translation['labelValue'] = value

            }
            console.log('Multilanguage ***** GET labels ***** - selected_translation ', this.selected_translation);
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
    console.log('Multilanguage ***** ADD-NEW-LANG selectedTranslationCode', this.selectedTranslationCode);
    console.log('Multilanguage ***** ADD-NEW-LANG selectedTranslationLabel', this.selectedTranslationLabel);

    // cloneLabel CHE RITORNERA IN RESPONSE LA NUOVA LINGUA (l'inglese nel caso non sia una delle nostre lingue pretradotte)
    this.widgetService.cloneLabel(this.temp_SelectedLangCode.toUpperCase())
      .subscribe((res: any) => {
        // console.log('Multilanguage - addNewLanguage - CLONE LABEL RES ', res);
        console.log('Multilanguage - ADD-NEW-LANG (clone-label) RES ', res.data);

        if (res) {

          // UPDATE THE ARRAY TRANSLATION CREATED ON INIT
          this.translations = res.data
          this._selectTranslationTab(this.selectedTranslationCode, this.selectedTranslationLabel)
        }

      }, error => {
        console.log('Multilanguage ADD-NEW-LANG (clone-label) - ERROR ', error)
      }, () => {
        console.log('Multilanguage ADD-NEW-LANG (clone-label) * COMPLETE *')


        this.showSheleton = false;
        this.notify.presentModalSuccessCheckModal('AddTranslation', 'Completed')
      });

    // // ADD THE NEW LANGUAGE TO BOTTOM NAV
    const newLang = { code: this.temp_SelectedLangCode, name: this.temp_SelectedLangName };
    console.log('Multilanguage saveNewLanguage newLang objct ', newLang);

    this.availableTranslations.push(newLang)
    console.log('Multilanguage saveNewLanguage availableTranslations ', this.availableTranslations)
  }

  onChangeTranslation(event, labelName) {
    console.log('Multilanguage - onChangeTranslation event: ', event, ' - labelName: ', labelName);
    this.translations.forEach(translation => {
      if (translation) {
        console.log('Multilanguage -- onChangeTranslation - traslation ', translation)

        if (translation.lang.toLowerCase() === this.selectedTranslationCode) {

          // console.log('Multilanguage - onChangeTranslation CLONE OF CURRENT TRASLATION ', this.currentTraslationClone);


          // quando l'utente modifica un labelValue viene passato l'event (il label value modificato) e la labelName
          // Per modificare il clone della traduzione corrente individuo nel clone della traduzione inglese la key corrispondente al
          // alla labelName della label value che l'utente sta modificando

          var found_key = Object.keys(this.engTraslationClone).find(key => this.engTraslationClone[key] === labelName);
          console.log('Multilanguage - onChangeTranslation filter result found_key ', found_key);

          translation['data'][found_key] = event
          console.log('Multilanguage - onChangeTranslation ========== translation[data] ', translation['data']);

          this.currentTraslationClone = Object.assign({}, translation['data']);
          console.log('Multilanguage - onChangeTranslation currentTraslationClone Translation', this.currentTraslationClone);

          // console.log('Multilanguage - onChangeTranslation ========== this.translations', this.translations);
          // const found_translation = this.translations.filter((obj: any) => {
          //   return obj.lang === this.selectedTranslationCode.toUpperCase();
          // });
          // console.log('Multilanguage - onChangeTranslation ========== found_translation', found_translation);


        }
      }
    });
  }

  editLang() {
    console.log('Multilanguage (widget-mtl) - currentTraslationClone ', this.currentTraslationClone);
    const btn_edit_lang = <HTMLElement>document.querySelector('.btn_edit_lang');
    if (btn_edit_lang) {
      btn_edit_lang.blur()
    }

    this.widgetService.editLabels(this.selectedTranslationCode.toUpperCase(), this.currentTraslationClone)
      .subscribe((labels: any) => {
        console.log('Multilanguage (widget-mtl) - editLang RES ', labels);

      }, error => {
        console.log('Multilanguage (widget-mtl) - editLang - ERROR ', error);

        this.notify.showNotification(this.errorNoticationMsg, 4, 'report_problem');
      }, () => {

        this.translateAndShowUpdateWidgetNotification();
        console.log('Multilanguage (widget-mtl) - editLang * COMPLETE *')
      });
  }

  translateAndShowUpdateWidgetNotification() {
    this.translate.get('UpdateDeptGreetingsSuccessNoticationMsg')
      .subscribe((text: string) => {

        this.updateWidgetSuccessNoticationMsg = text;
        // console.log('»» WIDGET SERVICE - Update Widget Project Success NoticationMsg', text)
      }, (error) => {

        console.log('»» WIDGET SERVICE -  Update Widget Project Success NoticationMsg - ERROR ', error);
      }, () => {

        this.notify.showWidgetStyleUpdateNotification(this.updateWidgetSuccessNoticationMsg, 2, 'done');
        // console.log('»» WIDGET SERVICE -  Update Widget Project Success NoticationMsg * COMPLETE *');
      });
  }

  onFocusSelectLang () {
    console.log('Multilanguage onFocusSelectLang translations ', this.translations);
  }


  onSelectlang(selectedLang) {
    if (selectedLang) {
      this.disableAddBtn = false;
      this.temp_SelectedLangCode = selectedLang.code;
      this.temp_SelectedLangName = selectedLang.name;
      console.log('Multilanguage onSelectlang selected TEMP Lang Code ', this.temp_SelectedLangCode);
      console.log('Multilanguage onSelectlang selected TEMP Lang label ', this.temp_SelectedLangName);
    }
  }

  onClearSelectedLanguage() {
    this.disableAddBtn = true;
    console.log('Multilanguage onClearSelectedLanguage disableAddBtn ', this.disableAddBtn);
  }


  deleteLang() {

    console.log('Multilanguage deleteLang selected Translation Label', this.selectedTranslationLabel);
    const btn_delete_lang = <HTMLElement>document.querySelector('.btn_delete_lang');
    if (btn_delete_lang) {
      btn_delete_lang.blur()
    }

    console.log('Multilanguage (widget-mtl) - deleteLang ->  availableTranslations before splice', this.availableTranslations)
    var foundIndex = this.availableTranslations.findIndex(x => x.code == this.selectedTranslationCode);

    console.log('Multilanguage (widget-mtl) - deleteLang ->  availableTranslations foundIndex', foundIndex)

    this.availableTranslations.splice(foundIndex, 1);
    console.log('Multilanguage (widget-mtl) - deleteLang ->  availableTranslations after splice ', this.availableTranslations)

    const elemLangTab = <HTMLElement>document.querySelector(`#${this.selectedTranslationCode}_tab`);
    console.log('Multilanguage (widget-mtl) - deleteLang -> bottom nav tab to remove', elemLangTab)

    if (elemLangTab) {
      // elemLangTab.style.display = "none"

      elemLangTab.remove()
    }

    // this.spliceAvailableLanguage(this.selectedTranslationCode)
    // this.getLabels();


    this.widgetService.deleteLabels(this.selectedTranslationCode.toUpperCase())
      .subscribe((labels: any) => {
        console.log('Multilanguage (widget-mtl) - deleteLang RES ', labels);
      }, error => {
        console.log('Multilanguage (widget-mtl) - deleteLang - ERROR ', error)
        this.notify.showNotification(this.errorNoticationMsg, 4, 'report_problem');

        this.selectedTranslationCode = 'add'
      }, () => {

        this.selectedTranslationCode = 'add'
        this.selectedLang = null;
        this.disableAddBtn = true;

        console.log('Multilanguage (widget-mtl) - deleteLang * COMPLETE *');

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
        console.log('+ + + translateTranslationDeleted ', text)
      }, (error) => {
        console.log('+ + + translateTranslationDeleted  - ERROR ', error);
      }, () => {
        console.log('+ + + translateTranslationDeleted  * COMPLETE *');
        this.notify.showWidgetStyleUpdateNotification(this.translationDeleted, 2, 'done');



      });


  }




  goBack() {
    this.location.back();
  }


  // USECASE: NO PRE-TRANSLATED
  // getSaveAndAppendEngLang(langCode) {
  //   // get eng lang
  //   this.widgetService.getMockLabels('en').subscribe((engMockLabels: any) => {

  //     console.log('Multilanguage - NEW LANG !NOT EXIST get ENG Translation - RES ', engMockLabels);


  //     // append the new language whith the lang code of the not found language to the initial object  this.mock_labels
  //     this.translation[langCode] = engMockLabels
  //     console.log('Multilanguage - NEW LANG !NOT EXIST - get Save * Append ENG * ', this.translation)

  //     this.saveLabel(langCode)
  //     // save eng lang in the user available lang (NOTE to do with the lang code of the new lang)
  //     // const newLangTraslation = { engMockLabels }
  //     // this.widgetService.createMockLabel(newLangTraslation).subscribe((res: any) => {
  //     //   console.log('Multilanguage - NEW LANG !NOT EXIST - get * Save ENG RES* ', res);
  //     // });

  //   }, (error) => {
  //     console.log('Multilanguage - NEW LANG !NOT EXIST get ENG Translation - ERROR ', error);
  //   }, () => {
  //     console.log('Multilanguage - NEW LANG !NOT EXIST get ENG Translation * COMPLETE *');
  //   });
  // }



  // getMockLabels() {
  //   const self = this
  //   this.widgetService.getMockLabels('all').subscribe((mockLabels: any) => {
  //     console.log('Multilanguage GET MOCK labels - RES', mockLabels);

  //     this.languages_codes = []

  //     Object.keys(mockLabels).forEach(function (key) {
  //       var key = key;
  //       var value = mockLabels[key];

  //       self.languages_codes.push(key)
  //       console.log('Multilanguage GET MOCK labels - KEY name', key);
  //       console.log('Multilanguage GET MOCK labels - KEY value', value);
  //     });

  //     console.log('Multilanguage GET MOCK labels - Array of LANG CODE ', this.languages_codes);

  //     // this.doAvailableLanguageArray(this.languages_codes);

  //     this.mock_labels = mockLabels;

  //   }, error => {
  //     console.log('Multilanguage GET MOCK labels - ERROR ', error)
  //   }, () => {
  //     console.log('Multilanguage GET MOCK labels * COMPLETE *')


  //     this.showSheleton = false;
  //     // this.selectTranslationTab('en', 'English')
  //   });
  // }



}
