import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Analytics2Component } from './analytics2.component';

import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core'; // suppress the error msgs "If 'appdashboard-panoramica' -  'appdashboard-metriche' - 'appdashboard-realtime'  is an Angular component, then verify that it is part of this module" + Can't bind to 'ngModel' since it isn't a known property of 'ng-select'.

import { AuthService } from '../core/auth.service';
import { HttpModule } from '@angular/http'; // Error: StaticInjectorError(DynamicTestModule)[AuthService -> Http]:
import { NotifyService } from '../core/notify.service';  // Error: StaticInjectorError(DynamicTestModule)[AuthService -> NotifyService]:
import { LocalDbService } from '../services/users-local-db.service'; // Error: StaticInjectorError(DynamicTestModule)[AuthService -> LocalDbService]: 
import { WebSocketJs } from "../services/websocket/websocket-js"; // Error: StaticInjectorError(DynamicTestModule)[AuthService -> WebSocketJs]: 

import { RouterTestingModule } from '@angular/router/testing'; // Error: StaticInjectorError(DynamicTestModule)[Analytics2Component -> Router]: 
import { LoggerService } from '../services/logger/logger.service';
import { AppConfigService } from '../services/app-config.service';

import { AnalyticsService } from 'app/services/analytics.service';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Error: StaticInjectorError(DynamicTestModule)[AnalyticsService -> HttpClient]:

import { WsRequestsService } from '../services/websocket/ws-requests.service';
import { PanoramicaComponent } from './panoramica/panoramica.component';
import { MetricheComponent } from './metriche/metriche.component';
import { RealtimeComponent } from './realtime/realtime.component';
import { HeatMapModule } from '@syncfusion/ej2-angular-heatmap';
import { RichiesteComponent } from './metriche/richieste/richieste.component';
import { VisitorsAnalyticsComponent } from './metriche/visitors-analytics/visitors-analytics.component';
import { MessagesComponent } from './metriche/messages/messages.component';
import { TempirispostaComponent } from './metriche/tempirisposta/tempirisposta.component';
import { DurataconvComponent } from './metriche/durataconv/durataconv.component';
import { EventsAnalyticsComponent } from './metriche/events-analytics/events-analytics.component';
import { SatisfactionComponent } from './metriche/satisfaction/satisfaction.component';
import { MomentModule } from 'angular2-moment';
import { LoadingSpinnerComponent } from 'app/ui/loading-spinner/loading-spinner.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController, RequestMatch, TestRequest } from '@angular/common/http/testing';

describe('Analytics2Component', () => {
  let component: Analytics2Component;
  let fixture: ComponentFixture<Analytics2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        Analytics2Component,
        PanoramicaComponent,
        MetricheComponent,
        RealtimeComponent,
        RichiesteComponent,
        VisitorsAnalyticsComponent,
        MessagesComponent,
        TempirispostaComponent,
        DurataconvComponent,
        EventsAnalyticsComponent,
        SatisfactionComponent,
        LoadingSpinnerComponent

      ],
      // schemas: [NO_ERRORS_SCHEMA],
      imports: [
        TranslateModule.forRoot(),
        HttpModule,
        RouterTestingModule,
        HttpClientModule,
        HeatMapModule,
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
    fixture = TestBed.createComponent(Analytics2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
