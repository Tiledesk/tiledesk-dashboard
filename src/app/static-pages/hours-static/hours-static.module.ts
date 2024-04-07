import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HoursStaticComponent } from './hours-static.component';
import { RouterModule, Routes } from '@angular/router';
import { SettingsSidebarModule } from 'app/components/settings-sidebar/settings-sidebar.module';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  { path: "", component: HoursStaticComponent},
];


@NgModule({
  declarations: [
    HoursStaticComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SettingsSidebarModule,
    TranslateModule,
  ]
})
export class HoursStaticModule { }
