import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { VibeCoderComponent } from './vibe-coder.component';

@NgModule({
  declarations: [VibeCoderComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatTooltipModule,
    TranslateModule,
  ],
  exports: [VibeCoderComponent],
})
export class VibeCoderModule { }
