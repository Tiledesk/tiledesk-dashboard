import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExecutionsRoutingModule } from './executions-routing.module';
import { ExecutionsListComponent } from './executions-list/executions-list.component';
import { ExecutionDetailComponent } from './execution-detail/execution-detail.component';
import { ExecutionStatusChipComponent } from './shared/execution-status-chip.component';
import { FlowStatePanelComponent, MaskedValueComponent } from './shared/flow-state-panel.component';
import { VarHistoryDrawerComponent } from './shared/var-history-drawer.component';

@NgModule({
  declarations: [
    ExecutionsListComponent,
    ExecutionDetailComponent,
    ExecutionStatusChipComponent,
    FlowStatePanelComponent,
    MaskedValueComponent,
    VarHistoryDrawerComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    MatIconModule,
    MatTooltipModule,
    ExecutionsRoutingModule,
  ]
})
export class ExecutionsModule { }
