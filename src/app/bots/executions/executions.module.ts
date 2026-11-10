import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { ExecutionsRoutingModule } from './executions-routing.module';
import { ExecutionsListComponent } from './executions-list/executions-list.component';
import { ExecutionDetailComponent } from './execution-detail/execution-detail.component';
import { ExecutionStatusChipComponent } from './shared/execution-status-chip.component';
import { FlowStatePanelComponent, MaskedValueComponent } from './shared/flow-state-panel.component';
import { VarHistoryDrawerComponent } from './shared/var-history-drawer.component';
import { StopDialogComponent } from './shared/stop-dialog.component';
import { DestroyDialogComponent } from './shared/destroy-dialog.component';
import { ExecutionGraphComponent } from './graph/execution-graph.component';

@NgModule({
  declarations: [
    ExecutionsListComponent,
    ExecutionDetailComponent,
    ExecutionStatusChipComponent,
    FlowStatePanelComponent,
    MaskedValueComponent,
    VarHistoryDrawerComponent,
    StopDialogComponent,
    DestroyDialogComponent,
    ExecutionGraphComponent,
  ],
  exports: [ExecutionGraphComponent],
  imports: [
    CommonModule,
    TranslateModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatRadioModule,
    FormsModule,
    ExecutionsRoutingModule,
  ]
})
export class ExecutionsModule { }
