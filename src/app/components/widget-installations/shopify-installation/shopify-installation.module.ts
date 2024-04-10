import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeInstallationModule } from '../code-installation/code-installation.module';
import { TranslateModule } from '@ngx-translate/core';
import { ShopifyInstallationComponent } from './shopify-installation.component';



@NgModule({
  declarations: [
    ShopifyInstallationComponent
  ],
  imports: [
    CommonModule,
    CodeInstallationModule,
    TranslateModule,
  ], exports: [
    CodeInstallationModule,
  ]
})
export class ShopifyInstallationModule { }
