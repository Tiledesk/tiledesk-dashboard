import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ProjectEditAddComponent } from './project-edit-add.component';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsSidebarModule } from 'app/components/settings-sidebar/settings-sidebar.module';
import { SharedModule } from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MomentModule } from 'ngx-moment';
import { MatTooltipModule } from '@angular/material/tooltip';

const routes: Routes = [
  { path: "", component: ProjectEditAddComponent},
];

@NgModule({
  declarations: [
    ProjectEditAddComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    SettingsSidebarModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MomentModule,
    MatTooltipModule
  ]
})
export class ProjectEditAddModule { }
