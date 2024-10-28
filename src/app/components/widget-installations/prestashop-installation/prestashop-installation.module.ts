import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrestashopInstallationComponent } from './prestashop-installation.component';
import { CodeInstallationModule } from '../code-installation/code-installation.module';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [
    PrestashopInstallationComponent
  ],
  imports: [
    CommonModule,
    CodeInstallationModule,
    TranslateModule,
  ], exports: [
    CodeInstallationModule,
  ]
})
export class PrestashopInstallationModule { }
