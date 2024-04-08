import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { GroupsComponent } from './groups.component';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsSidebarModule } from 'app/components/settings-sidebar/settings-sidebar.module';
import { SortByPipe } from 'app/sortby.pipe';
import { SharedModule } from 'app/shared/shared.module';

const routes: Routes = [
  { path: "", component: GroupsComponent },
];

@NgModule({
  declarations: [
    GroupsComponent,
    SortByPipe
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    SettingsSidebarModule,
    SharedModule,
  ]
})
export class GroupsModule { }
