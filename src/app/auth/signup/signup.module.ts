import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignupComponent } from './signup.component';
import { RouterModule ,Routes} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { PasswordStrengthComponent } from './password-strength/password-strength.component';
import { SharedModule } from 'app/shared/shared.module';
// import { SatPopoverModule } from '@ncstate/sat-popover';
import { PasswordStrengthModule } from './password-strength/password-strength.module';

const routes: Routes = [
  { path: "", component: SignupComponent},
];

@NgModule({
  declarations: [
    SignupComponent,
    // PasswordStrengthComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    PasswordStrengthModule
    // SatPopoverModule
  ],
  exports: [
    RouterModule
  ]
})
export class SignupModule { }
