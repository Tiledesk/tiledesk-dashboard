import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ExecutionStatCardsModule } from './shared/execution-stat-cards.module';
import { ExecutionGraphModule } from './graph/execution-graph.module';
import { ExecutionsRoutingModule } from './executions-routing.module';
import { ExecutionsListComponent } from './executions-list/executions-list.component';
import { ExecutionDetailComponent } from './execution-detail/execution-detail.component';
import { ExecutionStatusChipComponent } from './shared/execution-status-chip.component';
import { FlowStatePanelComponent, MaskedValueComponent } from './shared/flow-state-panel.component';
import { ValueCellComponent } from './shared/value-cell.component';
import { VarHistoryDrawerComponent } from './shared/var-history-drawer.component';
import { StopDialogComponent } from './shared/stop-dialog.component';
import { DestroyDialogComponent } from './shared/destroy-dialog.component';
import { ResumeDialogComponent } from './shared/resume-dialog.component';
import { StartNewDialogComponent } from './shared/start-new-dialog.component';
import { DataAccessDialogComponent } from './shared/data-access-dialog.component';
import { MonitorTabsModule } from './monitor-tabs/monitor-tabs.module';

@NgModule({
  declarations: [
    ExecutionsListComponent,
    ExecutionDetailComponent,
    ExecutionStatusChipComponent,
    FlowStatePanelComponent,
    MaskedValueComponent,
    ValueCellComponent,
    VarHistoryDrawerComponent,
    StopDialogComponent,
    DestroyDialogComponent,
    ResumeDialogComponent,
    StartNewDialogComponent,
    DataAccessDialogComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatRadioModule,
    MatButtonModule,
    FormsModule,
    NgSelectModule,
    ExecutionStatCardsModule,
    // the executions page's Graph view
    ExecutionGraphModule,
    ExecutionsRoutingModule,
    MonitorTabsModule,
  ]
})
export class ExecutionsModule { }
