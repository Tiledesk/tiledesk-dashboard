import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PasswordStrengthComponent } from './password-strength.component';
import { SatPopoverModule } from '@ncstate/sat-popover';
import { SharedModule } from 'app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [
    PasswordStrengthComponent
  ],
  imports: [
    CommonModule,
    SatPopoverModule,
    SharedModule,
    TranslateModule,
  ], exports: [
    PasswordStrengthComponent,
  ]
})
export class PasswordStrengthModule { }
