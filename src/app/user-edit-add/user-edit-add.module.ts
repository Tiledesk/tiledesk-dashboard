import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { UserEditAddComponent } from './user-edit-add.component';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsSidebarModule } from 'app/components/settings-sidebar/settings-sidebar.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  { path: "", component: UserEditAddComponent},
];

@NgModule({
  declarations: [
    UserEditAddComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    SettingsSidebarModule,
    SharedModule,
    NgSelectModule,
    FormsModule
  ]
})
export class UserEditAddModule { }
