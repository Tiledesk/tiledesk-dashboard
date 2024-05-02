import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule ,Routes} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SatPopoverModule } from '@ncstate/sat-popover';
import {MatButtonModule} from '@angular/material/button';
import { HomeConvsGraphComponent } from 'app/home-components/home-convs-graph/home-convs-graph.component';
import { HomeWhatsappAccountComponent } from 'app/home-components/home-whatsapp-account/home-whatsapp-account.component';
import { HomeCreateChatbotComponent } from 'app/home-components/home-create-chatbot/home-create-chatbot.component';
import { HomeNewsFeedComponent } from 'app/home-components/home-news-feed/home-news-feed.component';
import { HomeAnalyticsIndicatorComponent } from 'app/home-components/home-analytics-indicator/home-analytics-indicator.component';
import { HomeWhatsappAccountWizardComponent } from 'app/home-components/home-whatsapp-account-wizard/home-whatsapp-account-wizard.component';
import { HomeWhatsappAccountWizardModalComponent } from 'app/home-components/home-whatsapp-account-wizard/home-whatsapp-account-wizard-modal/home-whatsapp-account-wizard-modal.component';
import { HomeCustomizeWidgetComponent } from 'app/home-components/home-customize-widget/home-customize-widget.component';
import { HomeCreateTeammateComponent } from 'app/home-components/home-create-teammate/home-create-teammate.component';
import { HomeKbComponent } from 'app/home-components/home-kb/home-kb.component';
import { HomeCdsComponent } from 'app/home-components/home-cds/home-cds.component';
import { HomeGoToChatComponent } from 'app/home-components/home-go-to-chat/home-go-to-chat.component';
const routes: Routes = [
  { path: "", component: HomeComponent},
];

@NgModule({
  declarations: [
    HomeComponent,
    HomeConvsGraphComponent,
    HomeWhatsappAccountComponent,
    HomeCreateChatbotComponent,
    HomeNewsFeedComponent,
    HomeAnalyticsIndicatorComponent,
    HomeWhatsappAccountWizardComponent,
    HomeWhatsappAccountWizardModalComponent,
    HomeCustomizeWidgetComponent,
    HomeCreateTeammateComponent,
    HomeKbComponent,
    HomeCdsComponent,
    HomeGoToChatComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    SharedModule,
    MatTooltipModule,
    MatMenuModule,
    MatIconModule,
    MatCheckboxModule,
    SatPopoverModule,
    MatButtonModule
  ],
  exports: [
    RouterModule
  ]
})
export class HomeModule { }
