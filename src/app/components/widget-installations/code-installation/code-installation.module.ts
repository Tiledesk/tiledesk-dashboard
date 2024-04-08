import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeInstallationComponent } from './code-installation.component';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [
    CodeInstallationComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
  ],
   exports: [
    CodeInstallationComponent,
  ]
})
export class CodeInstallationModule { }
