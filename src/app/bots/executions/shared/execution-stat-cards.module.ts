import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ExecutionStatCardsComponent } from './execution-stat-cards.component';

// Shared by the executions list (ExecutionsModule) and the graph (ExecutionGraphModule, routing-free).
@NgModule({
  declarations: [ExecutionStatCardsComponent],
  exports: [ExecutionStatCardsComponent],
  imports: [CommonModule, TranslateModule],
})
export class ExecutionStatCardsModule { }
