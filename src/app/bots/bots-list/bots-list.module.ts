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
import { ChatbotAlertModule } from './chatbot-alert/chatbot-alert.module';
import { SatPopoverModule } from '@ncstate/sat-popover';
import { CreateFlowsModalComponent } from './create-flows-modal/create-flows-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { CreateChatbotModalComponent } from './create-chatbot-modal/create-chatbot-modal.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CreateChatbotModalModule } from './create-chatbot-modal/create-chatbot-modal.module';
import { CreateFlowsModalModule } from './create-flows-modal/create-flows-modal.module';

const routes: Routes = [
  { path: "", component: BotListComponent},
];

@NgModule({
  declarations: [
    BotListComponent,
    // CreateFlowsModalComponent,
    // CreateChatbotModalComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    BotsSidebarModule,
    ChatbotAlertModule,
    CreateChatbotModalModule,
    CreateFlowsModalModule,
    SharedModule,
    TranslateModule,
    MatIconModule,
    MomentModule,
    MatButtonModule,
    MatMenuModule,
    FormsModule,
    MatTooltipModule,
    SatPopoverModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ]
})
export class BotsListModule { }
