import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DepartmentEditAddComponent } from './department-edit-add.component';
import { CreateGroupComponent } from './create-group/create-group.component';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsSidebarModule } from 'app/components/settings-sidebar/settings-sidebar.module';
import { SharedModule } from 'app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { CreateBotComponent } from './create-bot/create-bot.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PendingChangesGuard } from 'app/core/pending-changes.guard';
import { MomentModule } from 'ngx-moment';
import { NgSelectModule } from '@ng-select/ng-select';
import { HttpClientModule } from '@angular/common/http';
import { UnauthorizedForSettingsModule } from 'app/auth/unauthorized-for-settings/unauthorized-for-settings.module';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EditLoadDistributionModalComponent } from './edit-load-distribution-modal/edit-load-distribution-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { EditGroupsLoadDistributionModalComponent } from './edit-groups-load-distribution-modal/edit-groups-load-distribution-modal.component';
import { MatMenuModule } from '@angular/material/menu';

const routes: Routes = [
  // { path: "", component: DepartmentEditAddComponent, canDeactivate: [PendingChangesGuard]},
  { path: "", component: DepartmentEditAddComponent},
];

@NgModule({
  declarations: [
    DepartmentEditAddComponent,
    CreateGroupComponent,
    CreateBotComponent,
    EditLoadDistributionModalComponent,
    EditGroupsLoadDistributionModalComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    CommonModule,
    TranslateModule,
    SettingsSidebarModule,
    SharedModule,
    FormsModule,
    MomentModule,
    NgSelectModule,
    HttpClientModule,
    UnauthorizedForSettingsModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatMenuModule
  ]
})
export class DepartmentEditAddModule { }
