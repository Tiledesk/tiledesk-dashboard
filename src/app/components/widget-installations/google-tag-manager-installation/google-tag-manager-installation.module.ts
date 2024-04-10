import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeInstallationModule } from '../code-installation/code-installation.module';
import { TranslateModule } from '@ngx-translate/core';
import { GoogleTagManagerInstallationComponent } from './google-tag-manager-installation.component';


@NgModule({
  declarations: [
    GoogleTagManagerInstallationComponent,
  ],
  imports: [
    CommonModule,
    CodeInstallationModule,
    TranslateModule,
  ], exports: [
    CodeInstallationModule,
  ]
})
export class GoogleTagManagerInstallationModule { }
