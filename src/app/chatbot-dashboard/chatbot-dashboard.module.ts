import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
// import { TextFieldModule } from '@angular/cdk/text-field';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ToolsComponent } from './dashboard/tools/tools.component';
import { IntentComponent } from './dashboard/intent/intent.component';
import { FormsModule } from '@angular/forms';
import { TextResponseComponent } from './dashboard/intent/response-types/text-response/text-response.component';


@NgModule({
  declarations: [
    DashboardComponent,
    ToolsComponent,
    IntentComponent,
    TextResponseComponent
  ],
  imports: [
    CommonModule,
    DragDropModule,
    // CdkTextareaAutosize,
    RouterModule,
    TranslateModule,
    SharedModule,
    FormsModule
  ]
})
export class ChatbotDashboardModule { }