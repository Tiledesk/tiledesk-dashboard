import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntegrationsComponent } from './integrations.component';
import { BrevoIntegrationComponent } from './list/brevo-integration/brevo-integration.component';
import { CustomerioIntegrationComponent } from './list/customerio-integration/customerio-integration.component';
import { GsheetsIntegrationComponent } from './list/gsheets-integration/gsheets-integration.component';
import { HubspotIntegrationComponent } from './list/hubspot-integration/hubspot-integration.component';
import { MakeIntegrationComponent } from './list/make-integration/make-integration.component';
import { OpenaiIntegrationComponent } from './list/openai-integration/openai-integration.component';
import { QaplaIntegrationComponent } from './list/qapla-integration/qapla-integration.component';
import { IntegrationHeaderComponent } from './base-components/integration-header/integration-header.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsSidebarModule } from 'app/components/settings-sidebar/settings-sidebar.module';
import { SharedModule } from 'app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExtIntegrationComponent } from './list/ext-integration/ext-integration.component';
import { N8nIntegrationComponent } from './list/n8n-integration/n8n-integration.component';

const routes: Routes = [
  { path: "", component: IntegrationsComponent},
];

@NgModule({
  declarations: [
    IntegrationsComponent,
    IntegrationHeaderComponent,
    BrevoIntegrationComponent,
    CustomerioIntegrationComponent,
    GsheetsIntegrationComponent,
    HubspotIntegrationComponent,
    MakeIntegrationComponent,
    OpenaiIntegrationComponent,
    QaplaIntegrationComponent,
    ExtIntegrationComponent,
    N8nIntegrationComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    MatExpansionModule,
    TranslateModule,
    SettingsSidebarModule,
    SharedModule,
    FormsModule
  ]
})
export class IntegrationsModule { }
