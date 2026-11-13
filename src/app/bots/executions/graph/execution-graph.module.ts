import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ExecutionGraphComponent } from './execution-graph.component';

// Routing-free: the executions page (ExecutionsModule) embeds it as its Graph view.
@NgModule({
  declarations: [ExecutionGraphComponent],
  exports: [ExecutionGraphComponent],
  imports: [CommonModule, TranslateModule],
})
export class ExecutionGraphModule { }
