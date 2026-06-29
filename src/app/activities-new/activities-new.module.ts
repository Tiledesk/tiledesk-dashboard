import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { SharedModule } from 'app/shared/shared.module';
import { ActivitiesNewComponent } from './activities-new.component';
import { TeammateActivitiesChartModalComponent } from './modals/teammate-activities-chart-modal/teammate-activities-chart-modal.component';
import { ActivitiesListChartModalComponent } from './modals/activities-list-chart-modal/activities-list-chart-modal.component';

const routes: Routes = [
  { path: '', component: ActivitiesNewComponent },
];

@NgModule({
  declarations: [
    ActivitiesNewComponent,
    TeammateActivitiesChartModalComponent,
    ActivitiesListChartModalComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    SharedModule,
    NgSelectModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatDialogModule,
  ],
})
export class ActivitiesNewModule { }
