import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PasswordStrengthComponent } from './password-strength.component';
import { SatPopoverModule } from '@ncstate/sat-popover';



@NgModule({
  declarations: [
    PasswordStrengthComponent
  ],
  imports: [
    CommonModule,
    SatPopoverModule
  ], exports: [
    PasswordStrengthComponent,
  ]
})
export class PasswordStrengthModule { }
