import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { WidgetService } from '../services/widget.service';
import { BaseTranslationComponent } from './base-translation/base-translation.component';

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

  translation: any
  currentTraslationClone: object;

  constructor(
    public location: Location,
    public widgetService: WidgetService
  ) {
    super();
  }

  ngOnInit() {
    this.selectedTranslationCode = 'en'

    this.getLabels();
    // this.getMockLabels()

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

        this.translation = labels[0].data[0];
        console.log('Multilanguage ***** GET labels ***** - RES > TRANSLATIONS ', labels[0].data[0]);

        this.languages_codes = [];

        Object.keys(self.translation).forEach(function (key) {
          var key = key;
          var value = self.translation[key];

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
      this.selectTranslationTab('en', 'English')
    });
  }


  selectTranslationTab(langSelectedCode, langSelectedName) {
    this.selectedTranslationCode = langSelectedCode;
    console.log('Multilanguage selectTranslationTab lang Selected Code ', this.selectedTranslationCode);
    this.selectedTranslationLabel = langSelectedName;
    console.log('Multilanguage selectTranslationTab lang Selected Name ', this.selectedTranslationLabel);

    this.selected_translation = []

    if (this.selectedTranslationCode !== 'add') {

      for (let [key, value] of Object.entries(this.translation[this.selectedTranslationCode])) {
        // console.log(`Multilanguage selectTranslationTab key : ${key} value ${value}`);

        let enLabel = this.translation['en'][key]
        let entry = { "labelName": enLabel, "labelValue": value }

        this.selected_translation.push(entry);
      }

    } else if (this.selectedTranslationCode === 'add') {
      this.spliceLanguageIfAlreadyAdded();
    }
  }


  onSelectlang(selectedLang) {
    this.temp_SelectedLangCode = selectedLang.code
    this.temp_SelectedLangName = selectedLang.name
    console.log('Multilanguage onSelectlang selected TEMP Lang Code ', this.temp_SelectedLangCode)
    console.log('Multilanguage onSelectlang selected TEMP Lang label ', this.temp_SelectedLangName)
  }



  saveNewLanguage() {
    // this.selectedTranslationCode = this.temp_SelectedLangCode
    // this.selectedTranslationLabel = this.temp_SelectedLangName

    this.saveLabel(this.temp_SelectedLangCode) // -- questo è quello da richiamare a regime

    // TEST CODE --  DA SOSTITUIRE CON saveLabel CHE RITORNERA IN RESPONSE LA NUOVA LINGUA (l'inglese nel caso non sia una delle nostre lingue pretradotte) 

    const preTraslatedLang = ['es', 'it', 'fr']
    if (preTraslatedLang.includes(this.temp_SelectedLangCode)) {

      this.getPreTrasletedLang(this.temp_SelectedLangCode)

    } else {

      this.getPreTrasletedLang('nopretraslated');

    }

    // ADD THE NEW LANGUAGE TO BOTTOM NAV
    const newLang = { code: this.temp_SelectedLangCode, name: this.temp_SelectedLangName };
    console.log('Multilanguage saveNewLanguage newLang objct ', newLang);

    this.availableTranslations.push(newLang)
    console.log('Multilanguage saveNewLanguage availableTranslations ', this.availableTranslations)
  }


  getPreTrasletedLang(temp_SelectedLangCode) {
    this.widgetService.getMockLabels(temp_SelectedLangCode).subscribe((newTranslation: any) => {

      console.log('Multilanguage - saveNewLanguage - RES ', newTranslation);
      // use case : the language is one of the our already translated:
      // save the new language in the available traslation of the user
      // append the new language to the initial object  this.mock_labels

      // APPEND THE RESPONSE TO THE 'traslation' object
      this.appendNewLang(this.temp_SelectedLangCode, newTranslation)

    }, (error) => {
      console.log('Multilanguage - saveNewLanguage - ERROR ', error);

    }, () => {
      console.log('Multilanguage - saveNewLanguage - getMockLabels * COMPLETE *');
    });
  }


  appendNewLang(langCode, newMockLabels) {
    // qui salvo la nuova lingua nel progetto
    // da fare
    this.translation[langCode] = newMockLabels
    console.log('Multilanguage saveNewLangInUserProjectAndAppendToInitialObject newMockLabels ', this.translation)
  }


  saveLabel(langCode) {
    console.log('Multilanguage -  SAVE LABEL langCode ', langCode);
    // this.widgetService.createLabel(langCode)
    //   .subscribe((res: any) => {
    //     console.log('Multilanguage SAVE label - RES ', res);

    //   }, error => {
    //     console.log('Multilanguage SAVE label - ERROR ', error)
    //   }, () => {
    //     console.log('Multilanguage SAVE label * COMPLETE *')
    //   });
  }

  onChangeTranslation(event, labelName) {
    console.log('Multilanguage - onChangeTranslation event: ', event, ' - labelName: ', labelName);
    // console.log('Multilanguage - onChangeTranslation selected traslation ', this.selected_translation);

    // this.selected_translation.forEach(element => {
    //   console.log('Multilanguage - onChangeTranslation selected traslation el', element);

    // });

    // var result = this.translation[this.selectedTranslationCode].filter(obj => {
    //   console.log('Multilanguage - onChangeTranslation filter result ', result);
    //   return obj.b === labelName

    this.currentTraslationClone = Object.assign({}, this.translation[this.selectedTranslationCode]);
    // console.log('Multilanguage - onChangeTranslation CLONE OF  CURRENT TRASLATION ', this.currentTraslationClone);

  
    // get the key of the current traslation object corresponding at the label of the value that the user is editing in the array selected_translation
    var key = Object.keys(this.translation[this.selectedTranslationCode]).find(key => this.translation[this.selectedTranslationCode][key] === labelName);
    console.log('Multilanguage - onChangeTranslation filter result ', key);
    
   
    this.currentTraslationClone[key] = event
    console.log('Multilanguage - onChangeTranslation original traslation', this.translation[this.selectedTranslationCode]);
    console.log('Multilanguage - onChangeTranslation clone traslation', this.currentTraslationClone);
    

   

    // for (let [key, value] of Object.entries(this.translation[this.selectedTranslationCode])) {
    // for (let [key, value] of Object.entries(this.translation['en'])) {

      // edited_traslation[key] = event

      // console.log('Multilanguage - onChangeTranslation - edited_traslation ', edited_traslation);

      // console.log('Multilanguage - onChangeTranslation - KEY name', key);
      // console.log('Multilanguage - onChangeTranslation - KEY value', value);

      // if (labelName === value) {
      // console.log('Multilanguage - onChangeTranslation - current translation object ',  this.translation[this.selectedTranslationCode].key);
      // console.log('Multilanguage - onChangeTranslation - current translation object ',  this.translation[this.selectedTranslationCode].value);
      // console.log('Multilanguage - onChangeTranslation - KEY name: ', key);
      // console.log('Multilanguage - onChangeTranslation - KEY value: ', value);
      // console.log('Multilanguage - onChangeTranslation - this.translation[this.selectedTranslationCode].key', this.translation[this.selectedTranslationCode][key]);

      // this.translation[this.selectedTranslationCode][key] = event
      // console.log('Multilanguage - onChangeTranslation - current MODIFIED traslation ', this.translation[this.selectedTranslationCode]);
      // }

      // console.log('Multilanguage - onChangeTranslation - current translation object ', this.translation[this.selectedTranslationCode].LABEL_PLACEHOLDER);
      // this.translation[this.selectedTranslationCode]
      // edited_traslation['key'] = 

      // console.log(`Multilanguage selectTranslationTab key : ${key} value ${value}`);

      // edited_traslations.
      // let enLabel = this.translation['en'][key]
      // let enLabel = this.translation['en']
      // console.log('Multilanguage - onChangeTranslation selected enLabel ', enLabel);
      // if (labelName === enLabel) {

      //   console.log('Multilanguage - onChangeTranslation selected select traslation value ', value);

      // }



      // let entry = { "labelName": enLabel, "labelValue": value }

      // this.selected_translation.push(entry);
    // }



  }

  editLang() {


    console.log('Multilanguage editLang translation ', this.selected_translation)

    // this.widgetService.editLang(translation)
    //   .subscribe((res: any) => {
    //     console.log('Multilanguage SAVE label - RES ', res);

    //   }, error => {
    //     console.log('Multilanguage SAVE label - ERROR ', error)
    //   }, () => {
    //     console.log('Multilanguage SAVE label * COMPLETE *')
    //   });
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
