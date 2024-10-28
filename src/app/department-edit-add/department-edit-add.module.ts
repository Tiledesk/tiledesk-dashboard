import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DepartmentEditAddComponent } from './department-edit-add.component';
import { CreateGroupComponent } from './create-group/create-group.component';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsSidebarModule } from 'app/components/settings-sidebar/settings-sidebar.module';
import { SharedModule } from 'app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { CreateBotComponent } from './create-bot/create-bot.component';
import { FormsModule } from '@angular/forms';
import { PendingChangesGuard } from 'app/core/pending-changes.guard';
import { MomentModule } from 'ngx-moment';
import { NgSelectModule } from '@ng-select/ng-select';
import { HttpClientModule } from '@angular/common/http';

const routes: Routes = [
  // { path: "", component: DepartmentEditAddComponent, canDeactivate: [PendingChangesGuard]},
  { path: "", component: DepartmentEditAddComponent},
];

@NgModule({
  declarations: [
    DepartmentEditAddComponent,
    CreateGroupComponent,
    CreateBotComponent
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
    HttpClientModule
  ]
})
export class DepartmentEditAddModule { }
