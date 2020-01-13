import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { WidgetService } from '../services/widget.service';
import { BaseTranslationComponent } from './base-translation/base-translation.component';
import { NotifyService } from '../core/notify.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'appdashboard-widget-multilanguage',
  templateUrl: './widget-multilanguage.component.html',
  styleUrls: ['./widget-multilanguage.component.scss']
})


export class WidgetMultilanguageComponent extends BaseTranslationComponent implements OnInit {
  objectKeys = Object.keys;
  selectedTranslationCode: string;
  selectedLang: string
  selectedTranslationLabel: string;
  mock_labels: any;
  eng_labels: any;

  temp_SelectedLangCode: string;
  temp_SelectedLangName: string;

  selected_translation: Array<any> = []
  languages_codes: any;

  showSheleton = true;

  translations: any
  currentTraslationClone: object;

  engTraslationClone: object;
  errorNoticationMsg: string;

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

    this.translateGetTranslationErrorMsg();
    this.getLabels();
    // this.getMockLabels()

  }

  translateGetTranslationErrorMsg() {
    this.translate.get('UserEditAddPage.AnErrorHasOccurred')
    .subscribe((text: string) => {

        this.errorNoticationMsg = text;
        console.log('+ + + change Availability Error Notication Msg', text)
    });
  }

  public generateFake(count: number): Array<number> {
    const indexes = [];
    for (let i = 0; i < count; i++) {
      indexes.push(i);
    }
    return indexes;
  }


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


        if (this.translations.filter(e => e.lang === 'EN').length > 0) {
          /* vendors contains the element we're looking for */
          console.log('Multilanguage ***** EN EXIST');

        } else {
          console.log('Multilanguage ***** ENGLISH TRANSLATION NOT EXIST');
          this.notify.showNotification(this.errorNoticationMsg, 4, 'report_problem');
        }

        this.translations.forEach(translation => {
          console.log('Multilanguage ***** GET labels ***** - RES >>> TRANSLATION ', translation);

          if (translation) {
            // se c'è inglese eseguo subito il push in languages_codes perle altre lang verifico se è presente _id
            // prima di eseguire il push

            if (translation.lang === 'EN') {
              this.languages_codes.push(translation.lang.toLowerCase());

              this.engTraslationClone = Object.assign({}, translation['data']);
              // console.log('Multilanguage ***** GET labels ***** >>> engTraslationClone', this.engTraslationClone);
            }
            if (translation.lang !== 'EN') {
              console.log('Multilanguage ***** GET labels ***** - RES >>> TRANSLATION _id', translation._id);
              if (translation._id !== undefined) {
                this.languages_codes.push(translation.lang.toLowerCase())
              }
            }
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
      this._selectTranslationTab('en', 'English')
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
          console.log('Multilanguage _selectTranslationTab traslation ', translation)

          if (translation.lang.toLowerCase() === this.selectedTranslationCode) {

            // console.log('Multilanguage _selectTranslationTab traslation selected ', translation['data'])

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
    }
  }

  _saveNewLanguage() {
    this.selectedTranslationCode = this.temp_SelectedLangCode
    this.selectedTranslationLabel = this.temp_SelectedLangName
    console.log('Multilanguage ***** _saveNewLanguage selectedTranslationCode', this.selectedTranslationCode);
    console.log('Multilanguage ***** _saveNewLanguage selectedTranslationLabel', this.selectedTranslationLabel);



    // cloneLabel CHE RITORNERA IN RESPONSE LA NUOVA LINGUA (l'inglese nel caso non sia una delle nostre lingue pretradotte)
    this.widgetService.cloneLabel(this.temp_SelectedLangCode.toUpperCase())
      .subscribe((res: any) => {
        console.log('Multilanguage SAVE label - RES ', res);

        if (res) {

          this._selectTranslationTab(this.selectedTranslationCode, this.selectedTranslationLabel)
        }

      }, error => {
        console.log('Multilanguage SAVE label - ERROR ', error)
      }, () => {
        console.log('Multilanguage SAVE label * COMPLETE *')
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
        // console.log('Multilanguage -- onChangeTranslation - traslation ', translation)

        if (translation.lang.toLowerCase() === this.selectedTranslationCode) {
          this.currentTraslationClone = Object.assign({}, translation['data']);
          // console.log('Multilanguage - onChangeTranslation CLONE OF CURRENT TRASLATION ', this.currentTraslationClone);


          // quando l'utente modifica un labelValue viene passato l'event (il label value modificato) e la labelName
          // Per modificare il clone della traduzione corrente individuo nel clone della traduzione inglese la key corrispondente al
          // alla labelName della label value che l'utente sta modificando

          var key = Object.keys(this.engTraslationClone).find(key => this.engTraslationClone[key] === labelName);
          console.log('Multilanguage - onChangeTranslation filter result ', key);


          this.currentTraslationClone[key] = event
          // console.log('Multilanguage - onChangeTranslation original traslation', translation['data']);
          // console.log('Multilanguage - onChangeTranslation this.selected_translation', this.selected_translation);
          // console.log('Multilanguage - onChangeTranslation clone traslation', this.currentTraslationClone);
        }
      }
    });
  }

  editLang() {
    console.log('Multilanguage editLang translation ', this.currentTraslationClone)
    // this.widgetService.editLang(translation)
    //   .subscribe((res: any) => {
    //     console.log('Multilanguage SAVE label - RES ', res);

    //   }, error => {
    //     console.log('Multilanguage SAVE label - ERROR ', error)
    //   }, () => {
    //     console.log('Multilanguage SAVE label * COMPLETE *')
    //   });
  }

  onSelectlang(selectedLang) {
    this.temp_SelectedLangCode = selectedLang.code
    this.temp_SelectedLangName = selectedLang.name
    console.log('Multilanguage onSelectlang selected TEMP Lang Code ', this.temp_SelectedLangCode)
    console.log('Multilanguage onSelectlang selected TEMP Lang label ', this.temp_SelectedLangName)
  }



  getMockLabels() {
    const self = this
    this.widgetService.getMockLabels().subscribe((labels: any) => {
      console.log('Multilanguage ***** GET labels ***** - RES', labels);

      if (labels) {

        // this.translation = labels[0].data[0];
        this.translations = labels
        // console.log('Multilanguage ***** GET labels ***** - RES > TRANSLATIONS ', labels[0].data[0]);
        console.log('Multilanguage ***** GET labels ***** - RES > TRANSLATIONS ', labels);

        this.languages_codes = [];

        Object.keys(self.translations).forEach(function (key) {
          var key = key;
          var value = self.translations[key];

          self.languages_codes.push(key)
          // console.log('Multilanguage ***** GET labels ***** - KEY name', key);
          // console.log('Multilanguage ***** GET labels ***** - KEY value', value);
        });

        console.log('Multilanguage ***** GET labels ***** - Array of LANG CODE ', this.languages_codes);
        this.doAvailableLanguageArray(this.languages_codes);
      }

    }, error => {
      console.log('Multilanguage ***** GET labels ***** - ERROR ', error)
    }, () => {
      console.log('Multilanguage ***** GET labels ***** * COMPLETE *')
      this.showSheleton = false;
      // this.selectTranslationTab('en', 'English')
    });
  }


  // selectTranslationTab(langSelectedCode, langSelectedName) {
  //   this.selectedTranslationCode = langSelectedCode;
  //   console.log('Multilanguage selectTranslationTab lang Selected Code ', this.selectedTranslationCode);
  //   this.selectedTranslationLabel = langSelectedName;
  //   console.log('Multilanguage selectTranslationTab lang Selected Name ', this.selectedTranslationLabel);

  //   this.selected_translation = []

  //   if (this.selectedTranslationCode !== 'add') {

  //     for (let [key, value] of Object.entries(this.translations[this.selectedTranslationCode])) {
  //       // console.log(`Multilanguage selectTranslationTab key : ${key} value ${value}`);

  //       let enLabel = this.translations['en'][key]
  //       let entry = { "labelName": enLabel, "labelValue": value }

  //       this.selected_translation.push(entry);
  //     }
  //     console.log(`Multilanguage selectTranslationTab selected_translation `, this.selected_translation);
  //   } else if (this.selectedTranslationCode === 'add') {
  //     this.spliceLanguageIfAlreadyAdded();
  //   }
  // }

 

  saveNewLanguage() {
    // this.selectedTranslationCode = this.temp_SelectedLangCode
    // this.selectedTranslationLabel = this.temp_SelectedLangName

    // this.saveLabel(this.temp_SelectedLangCode) // -- questo è quello da richiamare a regime

    // TEST CODE --  DA SOSTITUIRE CON saveLabel CHE RITORNERA IN RESPONSE LA NUOVA LINGUA (l'inglese nel caso non sia una delle nostre lingue pretradotte) 

    const preTraslatedLang = ['es', 'it', 'fr']
    if (preTraslatedLang.includes(this.temp_SelectedLangCode)) {

      // this.getPreTrasletedLang(this.temp_SelectedLangCode)

    } else {

      // this.getPreTrasletedLang('nopretraslated');

    }

    // ADD THE NEW LANGUAGE TO BOTTOM NAV
    const newLang = { code: this.temp_SelectedLangCode, name: this.temp_SelectedLangName };
    console.log('Multilanguage saveNewLanguage newLang objct ', newLang);

    this.availableTranslations.push(newLang)
    console.log('Multilanguage saveNewLanguage availableTranslations ', this.availableTranslations)
  }


  // getPreTrasletedLang(temp_SelectedLangCode) {
  //   this.widgetService.getMockLabels(temp_SelectedLangCode).subscribe((newTranslation: any) => {

  //     console.log('Multilanguage - saveNewLanguage - RES ', newTranslation);
  //     // use case : the language is one of the our already translated:
  //     // save the new language in the available traslation of the user
  //     // append the new language to the initial object  this.mock_labels

  //     // APPEND THE RESPONSE TO THE 'traslation' object
  //     this.appendNewLang(this.temp_SelectedLangCode, newTranslation)

  //   }, (error) => {
  //     console.log('Multilanguage - saveNewLanguage - ERROR ', error);

  //   }, () => {
  //     console.log('Multilanguage - saveNewLanguage - getMockLabels * COMPLETE *');
  //   });
  // }


  appendNewLang(langCode, newMockLabels) {
    // qui salvo la nuova lingua nel progetto
    // da fare
    this.translations[langCode] = newMockLabels
    console.log('Multilanguage saveNewLangInUserProjectAndAppendToInitialObject newMockLabels ', this.translations)
  }





  deleteLang() {


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
