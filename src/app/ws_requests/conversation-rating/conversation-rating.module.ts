import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { ConversationRatingComponent } from './conversation-rating.component';

@NgModule({
  declarations: [ConversationRatingComponent],
  imports: [
    CommonModule,
    TranslateModule,
    MatTooltipModule,
  ],
  exports: [ConversationRatingComponent],
})
export class ConversationRatingModule { }
