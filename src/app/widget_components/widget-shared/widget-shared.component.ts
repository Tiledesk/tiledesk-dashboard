import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'appdashboard-widget-shared',
  templateUrl: './widget-shared.component.html',
  styleUrls: ['./widget-shared.component.scss']
})
export class WidgetSharedComponent implements OnInit {

  availableTranslations: Array<any> = []

  languages = [
    { code: 'ar', name: 'Arabic', type: '--- Pre-translated ---' },
    { code: 'az', name: 'Azerbaijani (Beta)', type: '--- Pre-translated ---' },
    { code: 'en', name: 'English', type: '--- Pre-translated ---' },
    { code: 'fr', name: 'French', type: '--- Pre-translated ---' },
    { code: 'de', name: 'German', type: '--- Pre-translated ---' },
    { code: 'it', name: 'Italian', type: '--- Pre-translated ---' },
    { code: 'kk', name: 'Kazakh (Beta)', type: '--- Pre-translated ---' },
    { code: 'pt', name: 'Portuguese', type: '--- Pre-translated ---' },
    { code: 'ru', name: 'Russian', type: '--- Pre-translated ---' },
    { code: 'sr', name: 'Serbian', type: '--- Pre-translated ---' },
    { code: 'es', name: 'Spanish, Castilian', type: '--- Pre-translated ---' },
    { code: 'sv', name: 'Swedish (Beta)', type: '--- Pre-translated ---' },
    { code: 'tr', name: 'Turkish', type: '--- Pre-translated ---' },
    { code: 'uk', name: 'Ukrainian', type: '--- Pre-translated ---' },
    { code: 'uz', name: 'Uzbek (Beta)', type: '--- Pre-translated ---' },
    { code: 'ab', name: 'Abkhazian', type: '--- Needs own translation ---' },
    { code: 'aa', name: 'Afar', type: '--- Needs own translation ---' },
    { code: 'af', name: 'Afrikaans', type: '--- Needs own translation ---' },
    { code: 'ak', name: 'Akan', type: '--- Needs own translation ---' },
    { code: 'sq', name: 'Albanian', type: '--- Needs own translation ---' },
    { code: 'am', name: 'Amharic', type: '--- Needs own translation ---' },
    { code: 'an', name: 'Aragonese', type: '--- Needs own translation ---' },
    { code: 'hy', name: 'Armenian', type: '--- Needs own translation ---' },
    { code: 'as', name: 'Assamese', type: '--- Needs own translation ---' },
    { code: 'av', name: 'Avaric', type: '--- Needs own translation ---' },
    { code: 'ae', name: 'Avestan', type: '--- Needs own translation ---' },
    { code: 'ay', name: 'Aymara', type: '--- Needs own translation ---' },
    { code: 'bm', name: 'Bambara', type: '--- Needs own translation ---' },
    { code: 'ba', name: 'Bashkir', type: '--- Needs own translation ---' },
    { code: 'eu', name: 'Basque', type: '--- Needs own translation ---' },
    { code: 'be', name: 'Belarusian', type: '--- Needs own translation ---' },
    { code: 'bn', name: 'Bengali', type: '--- Needs own translation ---' },
    { code: 'bh', name: 'Bihari languages', type: '--- Needs own translation ---' },
    { code: 'bi', name: 'Bislama', type: '--- Needs own translation ---' },
    { code: 'bs', name: 'Bosnian', type: '--- Needs own translation ---' },
    { code: 'br', name: 'Breton', type: '--- Needs own translation ---' },
    { code: 'bg', name: 'Bulgarian', type: '--- Needs own translation ---' },
    { code: 'my', name: 'Burmese', type: '--- Needs own translation ---' },
    { code: 'ca', name: 'Catalan, Valencian', type: '--- Needs own translation ---' },
    { code: 'km', name: 'Central Khmer', type: '--- Needs own translation ---' },
    { code: 'ch', name: 'Chamorro', type: '--- Needs own translation ---' },
    { code: 'ce', name: 'Chechen', type: '--- Needs own translation ---' },
    { code: 'ny', name: 'Chichewa, Chewa, Nyanja', type: '--- Needs own translation ---' },
    { code: 'zh', name: 'Chinese', type: '--- Needs own translation ---' },
    { code: 'cu', name: 'Church Slavonic, Old Bulgarian, Old Church Slavonic', type: '--- Needs own translation ---' },
    { code: 'cv', name: 'Chuvash', type: '--- Needs own translation ---' },
    { code: 'kw', name: 'Cornish', type: '--- Needs own translation ---' },
    { code: 'co', name: 'Corsican', type: '--- Needs own translation ---' },
    { code: 'cr', name: 'Cree', type: '--- Needs own translation ---' },
    { code: 'hr', name: 'Croatian', type: '--- Needs own translation ---' },
    { code: 'cs', name: 'Czech', type: '--- Needs own translation ---' },
    { code: 'da', name: 'Danish', type: '--- Needs own translation ---' },
    { code: 'dv', name: 'Divehi, Dhivehi, Maldivian', type: '--- Needs own translation ---' },
    { code: 'nl', name: 'Dutch, Flemish', type: '--- Needs own translation ---' },
    { code: 'dz', name: 'Dzongkha', type: '--- Needs own translation ---' },
    { code: 'eo', name: 'Esperanto', type: '--- Needs own translation ---' },
    { code: 'et', name: 'Estonian', type: '--- Needs own translation ---' },
    { code: 'ee', name: 'Ewe', type: '--- Needs own translation ---' },
    { code: 'fo', name: 'Faroese', type: '--- Needs own translation ---' },
    { code: 'fj', name: 'Fijian', type: '--- Needs own translation ---' },
    { code: 'fi', name: 'Finnish', type: '--- Needs own translation ---' },
    { code: 'ff', name: 'Fulah', type: '--- Needs own translation ---' },
    { code: 'gd', name: 'Gaelic, Scottish Gaelic', type: '--- Needs own translation ---' },
    { code: 'gl', name: 'Galician', type: '--- Needs own translation ---' },
    { code: 'lg', name: 'Ganda', type: '--- Needs own translation ---' },
    { code: 'ka', name: 'Georgian', type: '--- Needs own translation ---' },
    { code: 'ki', name: 'Gikuyu, Kikuyu', type: '--- Needs own translation ---' },
    { code: 'el', name: 'Greek (Modern)', type: '--- Needs own translation ---' },
    { code: 'kl', name: 'Greenlandic, Kalaallisut', type: '--- Needs own translation ---' },
    { code: 'gn', name: 'Guarani', type: '--- Needs own translation ---' },
    { code: 'gu', name: 'Gujarati', type: '--- Needs own translation ---' },
    { code: 'ht', name: 'Haitian, Haitian Creole', type: '--- Needs own translation ---' },
    { code: 'ha', name: 'Hausa', type: '--- Needs own translation ---' },
    { code: 'he', name: 'Hebrew', type: '--- Needs own translation ---' },
    { code: 'hz', name: 'Herero', type: '--- Needs own translation ---' },
    { code: 'hi', name: 'Hindi', type: '--- Needs own translation ---' },
    { code: 'ho', name: 'Hiri Motu', type: '--- Needs own translation ---' },
    { code: 'hu', name: 'Hungarian', type: '--- Needs own translation ---' },
    { code: 'is', name: 'Icelandic', type: '--- Needs own translation ---' },
    { code: 'io', name: 'Ido', type: '--- Needs own translation ---' },
    { code: 'ig', name: 'Igbo', type: '--- Needs own translation ---' },
    { code: 'id', name: 'Indonesian', type: '--- Needs own translation ---' },
    { code: 'ia', name: 'Interlingua (International Auxiliary Language Association)', type: '--- Needs own translation ---' },
    { code: 'ie', name: 'Interlingue', type: '--- Needs own translation ---' },
    { code: 'iu', name: 'Inuktitut', type: '--- Needs own translation ---' },
    { code: 'ik', name: 'Inupiaq', type: '--- Needs own translation ---' },
    { code: 'ga', name: 'Irish', type: '--- Needs own translation ---' },
    { code: 'ja', name: 'Japanese', type: '--- Needs own translation ---' },
    { code: 'jv', name: 'Javanese', type: '--- Needs own translation ---' },
    { code: 'kn', name: 'Kannada', type: '--- Needs own translation ---' },
    { code: 'kr', name: 'Kanuri', type: '--- Needs own translation ---' },
    { code: 'ks', name: 'Kashmiri', type: '--- Needs own translation ---' },
    { code: 'rw', name: 'Kinyarwanda', type: '--- Needs own translation ---' },
    { code: 'kv', name: 'Komi', type: '--- Needs own translation ---' },
    { code: 'kg', name: 'Kongo', type: '--- Needs own translation ---' },
    { code: 'ko', name: 'Korean', type: '--- Needs own translation ---' },
    { code: 'kj', name: 'Kwanyama, Kuanyama', type: '--- Needs own translation ---' },
    { code: 'ku', name: 'Kurdish', type: '--- Needs own translation ---' },
    { code: 'ky', name: 'Kyrgyz', type: '--- Needs own translation ---' },
    { code: 'lo', name: 'Lao', type: '--- Needs own translation ---' },
    { code: 'la', name: 'Latin', type: '--- Needs own translation ---' },
    { code: 'lv', name: 'Latvian', type: '--- Needs own translation ---' },
    { code: 'lb', name: 'Letzeburgesch, Luxembourgish', type: '--- Needs own translation ---' },
    { code: 'li', name: 'Limburgish, Limburgan, Limburger', type: '--- Needs own translation ---' },
    { code: 'ln', name: 'Lingala', type: '--- Needs own translation ---' },
    { code: 'lt', name: 'Lithuanian', type: '--- Needs own translation ---' },
    { code: 'lu', name: 'Luba-Katanga', type: '--- Needs own translation ---' },
    { code: 'mk', name: 'Macedonian', type: '--- Needs own translation ---' },
    { code: 'mg', name: 'Malagasy', type: '--- Needs own translation ---' },
    { code: 'ms', name: 'Malay', type: '--- Needs own translation ---' },
    { code: 'ml', name: 'Malayalam', type: '--- Needs own translation ---' },
    { code: 'mt', name: 'Maltese', type: '--- Needs own translation ---' },
    { code: 'gv', name: 'Manx', type: '--- Needs own translation ---' },
    { code: 'mi', name: 'Maori', type: '--- Needs own translation ---' },
    { code: 'mr', name: 'Marathi', type: '--- Needs own translation ---' },
    { code: 'mh', name: 'Marshallese', type: '--- Needs own translation ---' },
    { code: 'ro', name: 'Moldovan, Moldavian, Romanian', type: '--- Needs own translation ---' },
    { code: 'mn', name: 'Mongolian', type: '--- Needs own translation ---' },
    { code: 'na', name: 'Nauru', type: '--- Needs own translation ---' },
    { code: 'nv', name: 'Navajo, Navaho', type: '--- Needs own translation ---' },
    { code: 'nd', name: 'Northern Ndebele', type: '--- Needs own translation ---' },
    { code: 'ng', name: 'Ndonga', type: '--- Needs own translation ---' },
    { code: 'ne', name: 'Nepali', type: '--- Needs own translation ---' },
    { code: 'se', name: 'Northern Sami', type: '--- Needs own translation ---' },
    { code: 'no', name: 'Norwegian', type: '--- Needs own translation ---' },
    { code: 'nb', name: 'Norwegian Bokmål', type: '--- Needs own translation ---' },
    { code: 'nn', name: 'Norwegian Nynorsk', type: '--- Needs own translation ---' },
    { code: 'ii', name: 'Nuosu, Sichuan Yi', type: '--- Needs own translation ---' },
    { code: 'oc', name: 'Occitan (post 1500)', type: '--- Needs own translation ---' },
    { code: 'oj', name: 'Ojibwa', type: '--- Needs own translation ---' },
    { code: 'or', name: 'Oriya', type: '--- Needs own translation ---' },
    { code: 'om', name: 'Oromo', type: '--- Needs own translation ---' },
    { code: 'os', name: 'Ossetian, Ossetic', type: '--- Needs own translation ---' },
    { code: 'pi', name: 'Pali', type: '--- Needs own translation ---' },
    { code: 'pa', name: 'Panjabi, Punjabi', type: '--- Needs own translation ---' },
    { code: 'ps', name: 'Pashto, Pushto', type: '--- Needs own translation ---' },
    { code: 'fa', name: 'Persian', type: '--- Needs own translation ---' },
    { code: 'pl', name: 'Polish', type: '--- Needs own translation ---' },
    { code: 'qu', name: 'Quechua', type: '--- Needs own translation ---' },
    { code: 'rm', name: 'Romansh', type: '--- Needs own translation ---' },
    { code: 'rn', name: 'Rundi', type: '--- Needs own translation ---' },
    { code: 'sm', name: 'Samoan', type: '--- Needs own translation ---' },
    { code: 'sg', name: 'Sango', type: '--- Needs own translation ---' },
    { code: 'sa', name: 'Sanskrit', type: '--- Needs own translation ---' },
    { code: 'sc', name: 'Sardinian', type: '--- Needs own translation ---' },
    { code: 'sn', name: 'Shona', type: '--- Needs own translation ---' },
    { code: 'sd', name: 'Sindhi', type: '--- Needs own translation ---' },
    { code: 'si', name: 'Sinhala, Sinhalese', type: '--- Needs own translation ---' },
    { code: 'sk', name: 'Slovak', type: '--- Needs own translation ---' },
    { code: 'sl', name: 'Slovenian', type: '--- Needs own translation ---' },
    { code: 'so', name: 'Somali', type: '--- Needs own translation ---' },
    { code: 'st', name: 'Sotho, Southern', type: '--- Needs own translation ---' },
    { code: 'nr', name: 'South Ndebele', type: '--- Needs own translation ---' },
    { code: 'su', name: 'Sundanese', type: '--- Needs own translation ---' },
    { code: 'sw', name: 'Swahili', type: '--- Needs own translation ---' },
    { code: 'ss', name: 'Swati', type: '--- Needs own translation ---' },
    { code: 'tl', name: 'Tagalog', type: '--- Needs own translation ---' },
    { code: 'ty', name: 'Tahitian', type: '--- Needs own translation ---' },
    { code: 'tg', name: 'Tajik', type: '--- Needs own translation ---' },
    { code: 'ta', name: 'Tamil', type: '--- Needs own translation ---' },
    { code: 'tt', name: 'Tatar', type: '--- Needs own translation ---' },
    { code: 'te', name: 'Telugu', type: '--- Needs own translation ---' },
    { code: 'th', name: 'Thai', type: '--- Needs own translation ---' },
    { code: 'bo', name: 'Tibetan', type: '--- Needs own translation ---' },
    { code: 'ti', name: 'Tigrinya', type: '--- Needs own translation ---' },
    { code: 'to', name: 'Tonga (Tonga Islands)', type: '--- Needs own translation ---' },
    { code: 'ts', name: 'Tsonga', type: '--- Needs own translation ---' },
    { code: 'tn', name: 'Tswana', type: '--- Needs own translation ---' },
    { code: 'tk', name: 'Turkmen', type: '--- Needs own translation ---' },
    { code: 'tw', name: 'Twi', type: '--- Needs own translation ---' },
    { code: 'ug', name: 'Uighur, Uyghur', type: '--- Needs own translation ---' },
    { code: 'ur', name: 'Urdu', type: '--- Needs own translation ---' },
    { code: 've', name: 'Venda', type: '--- Needs own translation ---' },
    { code: 'vi', name: 'Vietnamese', type: '--- Needs own translation ---' },
    { code: 'vo', name: 'Volap_k', type: '--- Needs own translation ---' },
    { code: 'wa', name: 'Walloon', type: '--- Needs own translation ---' },
    { code: 'cy', name: 'Welsh', type: '--- Needs own translation ---' },
    { code: 'fy', name: 'Western Frisian', type: '--- Needs own translation ---' },
    { code: 'wo', name: 'Wolof', type: '--- Needs own translation ---' },
    { code: 'xh', name: 'Xhosa', type: '--- Needs own translation ---' },
    { code: 'yi', name: 'Yiddish', type: '--- Needs own translation ---' },
    { code: 'yo', name: 'Yoruba', type: '--- Needs own translation ---' },
    { code: 'za', name: 'Zhuang, Chuang', type: '--- Needs own translation ---' },
    { code: 'zu', name: 'Zulu', type: '--- Needs own translation ---' }
  ];



  constructor() { }

  ngOnInit() {
  }


  doAvailableLanguageArray(languagesCodes) {
    // console.log('Multilanguage Calling doAvailableLanguageArray in Widget-shared ')
    for (let i = 0; i < this.languages.length; i++) {
      // console.log('Multilanguage Calling doAvailableLanguageArray languages[i] ', this.languages[i])
      // Loop for array2 
      for (let j = 0; j < languagesCodes.length; j++) {
        // console.log('Multilanguage Calling doAvailableLanguageArray languagesCodes[j] ', languagesCodes[j])
        // Compare the element of each and 
        // every element from both of the 
        // arrays 
        if (this.languages[i]['code'] === languagesCodes[j]) {
          // console.log('Multilanguage (widget-shared) LANG CODE FOUND IN LANG ARRAY - ITEM: ', this.languages[i])

          this.availableTranslations.push(this.languages[i])
          // Return if common element found 
          // return true;
        }
      }
    }
    // console.log('Multilanguage (widget-shared) availableTranslations - ARRAY: ', this.availableTranslations)
    return this.availableTranslations
  }

  spliceAvailableLanguage(selectedLangCode) {
    const index = this.availableTranslations.indexOf(selectedLangCode);
    if (index > -1) {
      this.availableTranslations.splice(index, 1);
    }

    // console.log('Multilanguage (widget-shared) availableTranslations - ARRAY: ', this.availableTranslations)
  }

  getLanguageNameFromCode(langCode) {
    // console.log('Multilanguage (widget-shared) getLanguageNameFromCode - langCode: ', langCode)
    const index = this.languages.findIndex(x => x.code === langCode);
    // console.log('Multilanguage (widget-shared) getLanguageNameFromCode - index: ', index)
    // console.log('Multilanguage (widget-shared) delault lang - : ', this.languages[index])

    return this.languages[index].name;
    //     a = [
    //   {prop1:"abc",prop2:"qwe"},
    //   {prop1:"bnmb",prop2:"yutu"},
    //   {prop1:"zxvz",prop2:"qwrq"}];

    // index = a.findIndex(x => x.prop2 ==="yutu");


  }


}
