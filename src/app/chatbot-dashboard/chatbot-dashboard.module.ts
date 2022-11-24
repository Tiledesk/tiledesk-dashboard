import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ToolsComponent } from './dashboard/tools/tools.component';
import { IntentComponent } from './dashboard/intent/intent.component';


@NgModule({
  declarations: [
    DashboardComponent,
    ToolsComponent,
    IntentComponent
  ],
  imports: [
    CommonModule,
    DragDropModule,
    RouterModule,
    TranslateModule,
    SharedModule
  ]
})
export class ChatbotDashboardModule { }