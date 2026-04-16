import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutoWidthInputDirective } from 'app/_directives/auto-width-input.directive';
import { HtmlTagPipe } from 'app/html-tag.pipe';

/**
 * Shared declarations used by both KB legacy and KB2 modules.
 * Kept separate to avoid duplicate declarations across lazy modules.
 */
@NgModule({
  imports: [CommonModule],
  declarations: [AutoWidthInputDirective, HtmlTagPipe],
  exports: [AutoWidthInputDirective, HtmlTagPipe],
})
export class KbSharedModule {}

