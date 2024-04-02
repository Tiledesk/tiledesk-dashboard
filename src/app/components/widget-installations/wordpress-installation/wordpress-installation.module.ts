import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WordpressInstallationComponent } from './wordpress-installation.component';
import { CodeInstallationModule } from '../code-installation/code-installation.module';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [
    WordpressInstallationComponent
  ],
  imports: [
    CommonModule,
    CodeInstallationModule,
    TranslateModule,
  ], exports: [
    CodeInstallationModule,
  ]
})
export class WordpressInstallationModule { }
