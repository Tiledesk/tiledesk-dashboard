import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { LoadingSpinnerComponent } from '../ui/loading-spinner/loading-spinner.component';
import { DirectivesModule } from '../_directives/directives';
import { OverlayModule } from '@angular/cdk/overlay';
import { RequestPreviewTooltipComponent } from '../components/request-preview-tooltip/request-preview-tooltip.component';
import { RequestPreviewTooltipDirective } from '../components/request-preview-tooltip/request-preview-tooltip.directive';
import { MarkedPipe } from 'app/marked.pipe';
import { HtmlEntitiesEncodePipe } from 'app/html-entities-encode.pipe';
import { SanitizeHtmlPipe } from 'app/sanitize-html.pipe';
import { SelectOptionsTranslatePipe } from 'app/selectOptionsTranslate.pipe';
import { ColorPickerModule } from 'ngx-color-picker';
import { WaToMarkdownPipe } from 'app/wa-to-markdown.pipe';
import { FormatColLabelsPipe } from 'app/format-col-labels-pipe';



@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    DirectivesModule,
    ColorPickerModule,
    OverlayModule,
  ],
  declarations: [
    RequestPreviewTooltipComponent,
    RequestPreviewTooltipDirective,
    LoadingSpinnerComponent,
    MarkedPipe,
    HtmlEntitiesEncodePipe,
    SanitizeHtmlPipe,
    SelectOptionsTranslatePipe,
    WaToMarkdownPipe,
    FormatColLabelsPipe
  ],
  exports: [
    RequestPreviewTooltipDirective,
    LoadingSpinnerComponent,
    TranslateModule,
    DirectivesModule,
    MarkedPipe,
    HtmlEntitiesEncodePipe,
    SanitizeHtmlPipe,
    SelectOptionsTranslatePipe,
    WaToMarkdownPipe,
    FormatColLabelsPipe,
    ColorPickerModule
  ],
  providers: [
    SelectOptionsTranslatePipe
  ]
})
export class SharedModule { }
