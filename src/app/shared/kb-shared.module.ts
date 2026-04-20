import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutoWidthInputDirective } from 'app/_directives/auto-width-input.directive';
import { HtmlTagPipe } from 'app/html-tag.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [AutoWidthInputDirective, HtmlTagPipe],
  exports: [AutoWidthInputDirective, HtmlTagPipe],
})
export class KbSharedModule {}

