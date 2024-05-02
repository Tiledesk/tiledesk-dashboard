import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SmtpSettingsComponent } from './smtp-settings.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  { path: "", component: SmtpSettingsComponent},
];

@NgModule({
  declarations: [
    SmtpSettingsComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    SharedModule,
    FormsModule,
  ]
})
export class SmtpSettingsModule { }
