import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BotListComponent } from './bots-list.component';
import { RouterModule, Routes } from '@angular/router';
import { BotsSidebarModule } from './bots-sidebar/bots-sidebar.module';
import { SharedModule } from 'app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MomentModule } from 'ngx-moment';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChatbotAlertComponent } from './chatbot-alert/chatbot-alert.component';
import { ChatbotAlertModule } from './chatbot-alert/chatbot-alert.module';

const routes: Routes = [
  { path: "", component: BotListComponent},
];

@NgModule({
  declarations: [
    BotListComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    BotsSidebarModule,
    ChatbotAlertModule,
    SharedModule,
    TranslateModule,
    MatIconModule,
    MomentModule,
    MatButtonModule,
    MatMenuModule,
    FormsModule,
    MatTooltipModule
  ]
})
export class BotsListModule { }
