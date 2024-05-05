import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetInstallationComponent } from './widget-installation.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { SettingsSidebarModule } from 'app/components/settings-sidebar/settings-sidebar.module';
import { JsInstallationComponent } from 'app/components/widget-installations/js-installation/js-installation.component';
import { JoomlaInstallationComponent } from 'app/components/widget-installations/joomla-installation/joomla-installation.component';
import { PrestashopInstallationComponent } from 'app/components/widget-installations/prestashop-installation/prestashop-installation.component';
import { WordpressInstallationComponent } from 'app/components/widget-installations/wordpress-installation/wordpress-installation.component';
import { ShopifyInstallationComponent } from 'app/components/widget-installations/shopify-installation/shopify-installation.component';
import { GoogleTagManagerInstallationComponent } from 'app/components/widget-installations/google-tag-manager-installation/google-tag-manager-installation.component';
import { CodeInstallationModule } from 'app/components/widget-installations/code-installation/code-installation.module';
import { MagentoInstallationComponent } from 'app/components/widget-installations/magento-installation/magento-installation.component';
import { WixComponent } from 'app/components/widget-installations/wix/wix.component';
import { BigcommerceInstallationComponent } from 'app/components/widget-installations/bigcommerce-installation/bigcommerce-installation.component';

const routes: Routes = [
  { path: "", component: WidgetInstallationComponent},
];

@NgModule({
  declarations: [
    WidgetInstallationComponent,
    JsInstallationComponent,
    JoomlaInstallationComponent,
    PrestashopInstallationComponent,
    WordpressInstallationComponent,
    ShopifyInstallationComponent,
    GoogleTagManagerInstallationComponent,
    MagentoInstallationComponent,
    WixComponent,
    BigcommerceInstallationComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    SettingsSidebarModule,
    SharedModule,
    CodeInstallationModule
  ]
})
export class WidgetInstallationModule { }
