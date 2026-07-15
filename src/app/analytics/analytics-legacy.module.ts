import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnalyticsModule } from './analytics.module';
import { AnalyticsComponent } from './analytics.component';

const routes: Routes = [
  { path: '', component: AnalyticsComponent },
];

@NgModule({
  imports: [
    AnalyticsModule,
    RouterModule.forChild(routes),
  ],
})
export class AnalyticsLegacyModule {}
