import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResetPswComponent } from './reset-psw.component';
import { PasswordStrengthModule } from 'app/auth/signup/password-strength/password-strength.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: "", component: ResetPswComponent},
];


@NgModule({
  declarations: [
    ResetPswComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    PasswordStrengthModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
  ]
})
export class ResetPswModule { }
