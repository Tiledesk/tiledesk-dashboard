import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JoomlaInstallationComponent } from './joomla-installation.component';
import { CodeInstallationModule } from '../code-installation/code-installation.module';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [
    JoomlaInstallationComponent
  ],
  imports: [
    CommonModule,
    CodeInstallationModule,
    TranslateModule,
  ], exports: [
    CodeInstallationModule,
  ]
})
export class JoomlaInstallationModule { }
