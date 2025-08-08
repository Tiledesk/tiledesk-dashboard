import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AutomationCreateComponent } from './automation-create.component';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsSidebarModule } from 'app/components/settings-sidebar/settings-sidebar.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { AutomationUploadCsvComponent } from 'app/automation-upload-csv/automation-upload-csv.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

const routes: Routes = [
  { path: "", component: AutomationCreateComponent},
];


@NgModule({
  declarations: [
    AutomationCreateComponent,
    AutomationUploadCsvComponent
  ],

  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    SettingsSidebarModule,
    SharedModule,
    NgSelectModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule
  ]
})
export class AutomationCreateModule { }
