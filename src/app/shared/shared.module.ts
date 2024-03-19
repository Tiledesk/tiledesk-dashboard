import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { LoadingSpinnerComponent } from '../ui/loading-spinner/loading-spinner.component';
import { DirectivesModule } from '../_directives/directives';
import { MarkedPipe } from 'app/marked.pipe';
import { HtmlEntitiesEncodePipe } from 'app/html-entities-encode.pipe';
import { SanitizeHtmlPipe } from 'app/sanitize-html.pipe';


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
    SanitizeHtmlPipe
  ],
  exports: [
    LoadingSpinnerComponent,
    TranslateModule,
    DirectivesModule,
    MarkedPipe,
    HtmlEntitiesEncodePipe,
    SanitizeHtmlPipe
  ],
})
export class SharedModule { }
