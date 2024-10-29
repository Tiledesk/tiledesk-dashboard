import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangePasswordComponent } from './change-password.component';
import { RouterModule, Routes } from '@angular/router';
import { PasswordStrengthModule } from 'app/auth/signup/password-strength/password-strength.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'app/shared/shared.module';

const routes: Routes = [
  { path: "", component: ChangePasswordComponent},
];

@NgModule({
  declarations: [
    ChangePasswordComponent
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
export class ChangePasswordModule { }
