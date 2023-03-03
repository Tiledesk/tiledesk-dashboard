import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsComponent } from './analytics.component';

import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core'; // suppress the error msgs "If 'appdashboard-panoramica' -  'appdashboard-metriche' - 'appdashboard-realtime'  is an Angular component, then verify that it is part of this module" + Can't bind to 'ngModel' since it isn't a known property of 'ng-select'.

import { AuthService } from '../core/auth.service';

import { NotifyService } from '../core/notify.service';  // Error: StaticInjectorError(DynamicTestModule)[AuthService -> NotifyService]:
import { LocalDbService } from '../services/users-local-db.service'; // Error: StaticInjectorError(DynamicTestModule)[AuthService -> LocalDbService]: 
import { WebSocketJs } from "../services/websocket/websocket-js"; // Error: StaticInjectorError(DynamicTestModule)[AuthService -> WebSocketJs]: 

import { RouterTestingModule } from '@angular/router/testing'; // Error: StaticInjectorError(DynamicTestModule)[Analytics2Component -> Router]: 
import { LoggerService } from '../services/logger/logger.service';
import { AppConfigService } from '../services/app-config.service';

import { HttpClient, HttpClientModule } from '@angular/common/http'; // Error: StaticInjectorError(DynamicTestModule)[AnalyticsService -> HttpClient]:

import { WsRequestsService } from '../services/websocket/ws-requests.service';
import { PanoramicaComponent } from './panoramica/panoramica.component';
import { MetricsComponent } from './metrics/metrics.component';
import { RealtimeComponent } from './realtime/realtime.component';
import { RequestsComponent } from './metrics/requests/requests.component';
import { VisitorsAnalyticsComponent } from './metrics/visitors-analytics/visitors-analytics.component';
import { MessagesComponent } from './metrics/messages/messages.component';
import { ConvsDurationComponent } from './metrics/convsduration/convsduration.component';
import { EventsAnalyticsComponent } from './metrics/events-analytics/events-analytics.component';
import { SatisfactionComponent } from './metrics/satisfaction/satisfaction.component';
import { MomentModule } from 'ngx-moment';
import { LoadingSpinnerComponent } from 'app/ui/loading-spinner/loading-spinner.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController, RequestMatch, TestRequest } from '@angular/common/http/testing';
import { AnalyticsService } from './analytics-service/analytics.service';
import { ResponseTimesComponent } from './metrics/responsetimes/responsetimes.component';

describe('AnalyticsComponent', () => {
  let component: AnalyticsComponent;
  let fixture: ComponentFixture<AnalyticsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AnalyticsComponent,
        PanoramicaComponent,
        MetricsComponent,
        RealtimeComponent,
        RequestsComponent,
        VisitorsAnalyticsComponent,
        MessagesComponent,
        ResponseTimesComponent,
        ConvsDurationComponent,
        EventsAnalyticsComponent,
        SatisfactionComponent,
        LoadingSpinnerComponent
      ],
      // schemas: [NO_ERRORS_SCHEMA],
      imports: [
        TranslateModule.forRoot(),
        RouterTestingModule,
        HttpClientModule,
        MomentModule,
        FormsModule,
        NgSelectModule,
        HttpClientTestingModule
      ],
      providers: [
        AuthService,
        NotifyService,
        LocalDbService,
        WebSocketJs,
        LoggerService,
        AppConfigService,
        AnalyticsService,
        HttpClient,
        WsRequestsService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
