import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';
import { MomentModule } from 'ngx-moment';

import { SharedModule } from 'app/shared/shared.module';

import { SatPopoverModule } from '@ncstate/sat-popover';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { HomeAnalyticsIndicatorComponent } from './home-analytics-indicator/home-analytics-indicator.component';
import { HomeConvsGraphComponent } from './home-convs-graph/home-convs-graph.component';
import { HomeCreateChatbotComponent } from './home-create-chatbot/home-create-chatbot.component';
import { HomeCreateTeammateComponent } from './home-create-teammate/home-create-teammate.component';
import { HomeCdsComponent } from './home-cds/home-cds.component';
import { HomeCustomizeWidgetComponent } from './home-customize-widget/home-customize-widget.component';
import { HomeGoToChatComponent } from './home-go-to-chat/home-go-to-chat.component';
import { HomeKbComponent } from './home-kb/home-kb.component';
import { HomeNewsFeedComponent } from './home-news-feed/home-news-feed.component';
import { HomeWhatsappAccountComponent } from './home-whatsapp-account/home-whatsapp-account.component';
import { HomeWhatsappAccountWizardComponent } from './home-whatsapp-account-wizard/home-whatsapp-account-wizard.component';

@NgModule({
  declarations: [
    HomeAnalyticsIndicatorComponent,
    HomeConvsGraphComponent,
    HomeCreateChatbotComponent,
    HomeCreateTeammateComponent,
    HomeCdsComponent,
    HomeCustomizeWidgetComponent,
    HomeGoToChatComponent,
    HomeKbComponent,
    HomeNewsFeedComponent,
    HomeWhatsappAccountComponent,
    HomeWhatsappAccountWizardComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    SharedModule,
    MatTooltipModule,
    MatMenuModule,
    MatIconModule,
    MatCheckboxModule,
    SatPopoverModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MomentModule,
  ],
  exports: [
    HomeAnalyticsIndicatorComponent,
    HomeConvsGraphComponent,
    HomeCreateChatbotComponent,
    HomeCreateTeammateComponent,
    HomeCdsComponent,
    HomeCustomizeWidgetComponent,
    HomeGoToChatComponent,
    HomeKbComponent,
    HomeNewsFeedComponent,
    HomeWhatsappAccountComponent,
    HomeWhatsappAccountWizardComponent,
  ],
})
export class HomeWidgetsModule {}

