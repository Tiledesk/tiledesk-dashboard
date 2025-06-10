import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersRolesComponent } from './users-roles.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsSidebarModule } from 'app/components/settings-sidebar/settings-sidebar.module';
import { SharedModule } from 'app/shared/shared.module';
import { MatTooltipModule } from '@angular/material/tooltip';

const routes: Routes = [
  { path: "", component: UsersRolesComponent },
];

@NgModule({
  declarations: [
    UsersRolesComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    SettingsSidebarModule,
    SharedModule,
    MatTooltipModule
  ]
})
export class UsersRolesModule { }
