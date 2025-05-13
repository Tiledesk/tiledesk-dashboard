import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlowWebhooksLogsComponent } from './flow-webhooks-logs.component';
import { RouterModule, Routes } from '@angular/router';
import { BotsSidebarModule } from '../bots-list/bots-sidebar/bots-sidebar.module';
import { SharedModule } from 'app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MomentModule } from 'ngx-moment';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgSelectModule } from '@ng-select/ng-select';

const routes: Routes = [
  { path: "", component: FlowWebhooksLogsComponent },
];

@NgModule({
  declarations: [
    FlowWebhooksLogsComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    BotsSidebarModule,
    SharedModule,
    TranslateModule,
    MatIconModule,
    MomentModule,
    MatButtonModule,
    MatMenuModule,
    FormsModule,
    MatTooltipModule,
    NgSelectModule
  ]
})
export class FlowWebhooksLogsModule { }
