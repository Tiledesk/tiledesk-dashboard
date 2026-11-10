import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ExecutionGraphComponent } from './execution-graph.component';

// Routing-free on purpose: the agents page imports this, not ExecutionsModule (whose routes would leak into it).
@NgModule({
  declarations: [ExecutionGraphComponent],
  exports: [ExecutionGraphComponent],
  imports: [CommonModule, TranslateModule],
})
export class ExecutionGraphModule { }
