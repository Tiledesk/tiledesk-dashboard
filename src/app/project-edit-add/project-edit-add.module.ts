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
import { UnauthorizedForSettingsModule } from 'app/auth/unauthorized-for-settings/unauthorized-for-settings.module';
import { UrlsWhitelistComponent } from './urls-whitelist/urls-whitelist.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

const routes: Routes = [
  { path: "", component: ProjectEditAddComponent },
];

@NgModule({
  declarations: [
    ProjectEditAddComponent,
    UrlsWhitelistComponent
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
    MatTooltipModule,
    UnauthorizedForSettingsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatListModule
  ]
})
export class ProjectEditAddModule { }
