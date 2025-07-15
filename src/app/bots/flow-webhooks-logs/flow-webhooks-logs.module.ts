import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FlowWebhooksLogsComponent } from './flow-webhooks-logs.component';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

const routes: Routes = [
  {
    path: '',
    component: FlowWebhooksLogsComponent
  }
];

@NgModule({
  declarations: [FlowWebhooksLogsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    NgSelectModule
  ]
})
export class FlowWebhooksLogsModule { } 