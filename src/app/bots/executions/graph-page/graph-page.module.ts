import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ExecutionGraphModule } from '../graph/execution-graph.module';
import { MonitorTabsModule } from '../monitor-tabs/monitor-tabs.module';
import { GraphPageComponent } from './graph-page.component';

// Lazy module of monitor/graph. Its own routing, so the executions routes stay as they are.
@NgModule({
  declarations: [GraphPageComponent],
  imports: [
    CommonModule,
    TranslateModule,
    ExecutionGraphModule,
    MonitorTabsModule,
    RouterModule.forChild([{ path: '', component: GraphPageComponent }]),
  ]
})
export class GraphPageModule { }
