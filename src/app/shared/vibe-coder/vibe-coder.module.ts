import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VibeCoderComponent } from './vibe-coder.component';

@NgModule({
  declarations: [VibeCoderComponent],
  imports: [
    CommonModule,
    FormsModule,
  ],
  exports: [VibeCoderComponent],
})
export class VibeCoderModule { }
