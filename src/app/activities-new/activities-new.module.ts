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
import { MatTooltipModule } from '@angular/material/tooltip';

import { SharedModule } from 'app/shared/shared.module';
import { ActivitiesNewComponent } from './activities-new.component';
import { ActivitiesTeammateAvatarComponent } from './components/activities-teammate-avatar/activities-teammate-avatar.component';
import { ActivitiesTeammateLinkComponent } from './components/activities-teammate-link/activities-teammate-link.component';
import { ActivitiesBotLinkComponent } from './components/activities-bot-link/activities-bot-link.component';
import { TeammateActivitiesChartModalComponent } from './modals/teammate-activities-chart-modal/teammate-activities-chart-modal.component';
import { ActivitiesListChartModalComponent } from './modals/activities-list-chart-modal/activities-list-chart-modal.component';
import { ActivitiesTeammateLookupService } from './services/activities-teammate-lookup.service';

const routes: Routes = [
  { path: '', component: ActivitiesNewComponent },
];

@NgModule({
  declarations: [
    ActivitiesNewComponent,
    ActivitiesTeammateAvatarComponent,
    ActivitiesTeammateLinkComponent,
    ActivitiesBotLinkComponent,
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
    MatTooltipModule,
  ],
  providers: [ActivitiesTeammateLookupService],
})
export class ActivitiesNewModule { }
