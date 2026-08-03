import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OverlayModule } from '@angular/cdk/overlay';
import { NgSelectModule } from '@ng-select/ng-select';

import { DataTablesComponent } from './data-tables.component';
import { ColumnTypeIconComponent } from './column-type-icon/column-type-icon.component';
import { CreateTableModalComponent } from './modals/create-table-modal.component';

const routes: Routes = [
  { path: '', component: DataTablesComponent },
];

@NgModule({
  declarations: [
    DataTablesComponent,
    ColumnTypeIconComponent,
    CreateTableModalComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    TranslateModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    OverlayModule,
    NgSelectModule,
  ],
})
export class DataTablesModule {}
