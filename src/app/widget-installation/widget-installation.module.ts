import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetInstallationComponent } from './widget-installation.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  { path: "", component: WidgetInstallationComponent},
];

@NgModule({
  declarations: [
    WidgetInstallationComponent,
    TranslateModule,
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule
  ]
})
export class WidgetInstallationModule { }
