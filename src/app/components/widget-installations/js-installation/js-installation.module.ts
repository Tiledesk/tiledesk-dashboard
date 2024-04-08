import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeInstallationModule } from '../code-installation/code-installation.module';
import { TranslateModule } from '@ngx-translate/core';
import { JsInstallationComponent } from './js-installation.component';



@NgModule({
  declarations: [
    JsInstallationComponent
  ],
  imports: [
    CommonModule,
    CodeInstallationModule,
    TranslateModule,
  ], exports: [
    CodeInstallationModule,
  ]
})
export class JsInstallationModule { }
