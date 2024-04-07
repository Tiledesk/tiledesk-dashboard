import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutomationStaticComponent } from './automation-static.component';
import { RouterModule, Routes } from '@angular/router';
import { SettingsSidebarModule } from 'app/components/settings-sidebar/settings-sidebar.module';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  { path: "", component: AutomationStaticComponent},
];

@NgModule({
  declarations: [
    AutomationStaticComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SettingsSidebarModule,
    TranslateModule,
  ]
})
export class AutomationStaticModule { }
