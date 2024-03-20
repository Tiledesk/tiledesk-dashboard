import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { LoadingSpinnerComponent } from '../ui/loading-spinner/loading-spinner.component';
import { DirectivesModule } from '../_directives/directives';
import { MarkedPipe } from 'app/marked.pipe';
import { HtmlEntitiesEncodePipe } from 'app/html-entities-encode.pipe';
import { SanitizeHtmlPipe } from 'app/sanitize-html.pipe';
import { SelectOptionsTranslatePipe } from 'app/selectOptionsTranslate.pipe';



@NgModule({
  imports: [
   
    CommonModule,
    TranslateModule,
    DirectivesModule
  ],
  declarations: [
    LoadingSpinnerComponent,
    MarkedPipe,
    HtmlEntitiesEncodePipe,
    SanitizeHtmlPipe,
    SelectOptionsTranslatePipe, 
  ],
  exports: [
    LoadingSpinnerComponent,
    TranslateModule,
    DirectivesModule,
    MarkedPipe,
    HtmlEntitiesEncodePipe,
    SanitizeHtmlPipe,
    SelectOptionsTranslatePipe
  ]
  ,
  providers: [ 
    SelectOptionsTranslatePipe
  ]
})
export class SharedModule { }
