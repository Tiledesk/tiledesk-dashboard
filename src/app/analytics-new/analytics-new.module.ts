import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsNewComponent } from './analytics-new.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

const routes: Routes = [
  { path: "", component: AnalyticsNewComponent},
];


@NgModule({
  declarations: [
    AnalyticsNewComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    MatProgressSpinnerModule
  ]
})
export class AnalyticsNewModule { }
