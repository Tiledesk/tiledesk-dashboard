import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutomationsComponent } from './automations.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsSidebarModule } from 'app/components/settings-sidebar/settings-sidebar.module';
import { SharedModule } from 'app/shared/shared.module';
import { MatExpansionModule } from '@angular/material/expansion';

const routes: Routes = [
  { path: "", component: AutomationsComponent},
];


@NgModule({
  declarations: [
    AutomationsComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    SettingsSidebarModule,
    SharedModule,
    MatExpansionModule
  ]
})
export class AutomationsModule { }
