import { Component, OnInit } from '@angular/core';
import { WidgetSharedComponent } from '../../widget-shared/widget-shared.component';
@Component({
  selector: 'appdashboard-base-translation',
  templateUrl: './base-translation.component.html',
  styleUrls: ['./base-translation.component.scss']
})
export class BaseTranslationComponent extends WidgetSharedComponent implements OnInit {

  

 
  constructor() {
    super();
   }

  ngOnInit() {

  }



  // <ng-option value="zh">Chinese (中文 (Zhōngwén), 汉语, 漢語)</ng-option>
  // <ng-option value="da">Danish (dansk)</ng-option>
  // <ng-option value="nl">Dutch (Nederlands, Vlaams)</ng-option>

  // availableTranslations = [{ code: 'en', name: 'English' }, { code: 'it', name: 'Italian' }]



  spliceLanguageIfAlreadyAdded() {
    // console.log('Multilanguage Calling doAvailableLanguageArray languages ', this.languages)
    // console.log('Multilanguage Calling doAvailableLanguageArray availableTranslations ', this.availableTranslations)

    this.availableTranslations.forEach(translation => {
      // console.log('Multilanguage Calling spliceLanguageIfAlreadyAdded availableTranslations translation', translation)

      var foundIndex = this.languages.findIndex(x => x.code == translation.code);
      // console.log('Multilanguage splice Language If Already Added - foundIndex', foundIndex)
      this.languages.splice(foundIndex, 1);
      // console.log('Multilanguage Calling doAvailableLanguageArray availableTranslations this.languages ', this.languages)
    });
  }
}


