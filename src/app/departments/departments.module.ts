import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DepartmentsComponent } from './departments.component';
import { SettingsSidebarModule } from 'app/components/settings-sidebar/settings-sidebar.module';
import { SharedModule } from 'app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule, Routes } from '@angular/router';
import { UnauthorizedForSettingsModule } from 'app/auth/unauthorized-for-settings/unauthorized-for-settings.module';
import { MatTooltipModule } from '@angular/material/tooltip';

const routes: Routes = [
  { path: "", component: DepartmentsComponent},
];

@NgModule({
  declarations: [
    DepartmentsComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SettingsSidebarModule,
    SharedModule,
    TranslateModule,
    UnauthorizedForSettingsModule,
    MatTooltipModule,
  ]
})
export class DepartmentsModule { }
