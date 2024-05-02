import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DepartmentsStaticComponent } from './departments-static.component';
import { SettingsSidebarModule } from 'app/components/settings-sidebar/settings-sidebar.module';
import { TranslateModule } from '@ngx-translate/core';
import { NgImageSliderModule } from 'ng-image-slider';

const routes: Routes = [
  { path: "", component: DepartmentsStaticComponent},
];

@NgModule({
  declarations: [
    DepartmentsStaticComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SettingsSidebarModule,
    TranslateModule,
    NgImageSliderModule
  ]
})
export class DepartmentsStaticModule { }
