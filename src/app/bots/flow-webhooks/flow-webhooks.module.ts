import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MomentModule } from 'ngx-moment';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SatPopoverModule } from '@ncstate/sat-popover';
import { FlowWebhooksComponent } from './flow-webhooks.component';
import { BotsSidebarModule } from '../bots-list/bots-sidebar/bots-sidebar.module';

const routes: Routes = [
  { path: "", component: FlowWebhooksComponent },
];

@NgModule({
  declarations: [
    FlowWebhooksComponent
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
    SatPopoverModule
  ]
})
export class FlowWebhooksModule { }
