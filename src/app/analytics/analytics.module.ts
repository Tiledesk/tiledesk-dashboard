import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsComponent } from './analytics.component';
import { ConvsDurationComponent } from './metrics/convsduration/convsduration.component';
import { EventsAnalyticsComponent } from './metrics/events-analytics/events-analytics.component';
import { MessagesComponent } from './metrics/messages/messages.component';
import { RequestsComponent } from './metrics/requests/requests.component';
import { ResponseTimesComponent } from './metrics/responsetimes/responsetimes.component';
import { SatisfactionComponent } from './metrics/satisfaction/satisfaction.component';
import { SentimentComponent } from './metrics/sentiment/sentiment.component';
import { VisitorsAnalyticsComponent } from './metrics/visitors-analytics/visitors-analytics.component';
import { MetricsComponent } from './metrics/metrics.component';
import { PanoramicaComponent } from './panoramica/panoramica.component';
import { RealtimeComponent } from './realtime/realtime.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule ,Routes} from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { MomentModule } from 'ngx-moment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgApexchartsModule } from "ng-apexcharts";
import { TagsAnalyticsComponent } from './metrics/tags-analytics/tags-analytics.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

const routes: Routes = [
  { path: "", component: AnalyticsComponent},
]; 
@NgModule({
  declarations: [
    AnalyticsComponent,
    ConvsDurationComponent,
    EventsAnalyticsComponent,
    MessagesComponent,
    RequestsComponent,
    ResponseTimesComponent,
    SatisfactionComponent,
    SentimentComponent,
    MetricsComponent,
    VisitorsAnalyticsComponent,
    PanoramicaComponent,
    RealtimeComponent,
    TagsAnalyticsComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    SharedModule,
    NgSelectModule,
    MomentModule,
    FormsModule,
    ReactiveFormsModule,
    NgApexchartsModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  exports: [
    RouterModule
  ]
})
export class AnalyticsModule { }
