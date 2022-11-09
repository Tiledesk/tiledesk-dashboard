import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricsComponent } from './metrics.component';

import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';  // If 'appdashboard-richieste' ...... is an Angular component, then verify that it is part of this module.
import { LoggerService } from '../../services/logger/logger.service';
import { AppConfigService } from 'app/services/app-config.service';
import { RequestsComponent } from './requests/requests.component';
import { MessagesComponent } from './messages/messages.component';
import { ResponseTimesComponent } from './responsetimes/responsetimes.component';
import { ConvsDurationComponent } from './convsduration/convsduration.component';
import { EventsAnalyticsComponent } from './events-analytics/events-analytics.component';
import { VisitorsAnalyticsComponent } from './visitors-analytics/visitors-analytics.component';
import { SatisfactionComponent } from './satisfaction/satisfaction.component';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { HttpClient, HttpClientModule } from '@angular/common/http'; 

import { AuthService } from '../../core/auth.service';
import { NotifyService } from '../../core/notify.service';  // Error: StaticInjectorError(DynamicTestModule)[AuthService -> NotifyService]:
import { LocalDbService } from '../../services/users-local-db.service'; // Error: StaticInjectorError(DynamicTestModule)[AuthService -> LocalDbService]: 
import { WebSocketJs } from "../../services/websocket/websocket-js"; // Error: StaticInjectorError(DynamicTestModule)[AuthService -> WebSocketJs]: 

import { RouterTestingModule } from '@angular/router/testing';
import { DepartmentService } from '../../services/department.service';
import { UsersService } from '../../services/users.service';
import { FaqKbService } from '../../services/faq-kb.service';
import { BotLocalDbService } from '../../services/bot-local-db.service';

import { HttpClientTestingModule, HttpTestingController, RequestMatch, TestRequest } from '@angular/common/http/testing';
import { AnalyticsService } from '../analytics-service/analytics.service';

describe('MetricheComponent', () => {
  let component: MetricsComponent;
  let fixture: ComponentFixture<MetricsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ 
        MetricsComponent, 
        RequestsComponent,
        MessagesComponent,
        ResponseTimesComponent,
        ConvsDurationComponent,
        EventsAnalyticsComponent,
        VisitorsAnalyticsComponent,
        SatisfactionComponent
        
       ],
      // schemas: [NO_ERRORS_SCHEMA],
      imports: [
        TranslateModule.forRoot(),
        FormsModule,
        NgSelectModule,
        HttpClientModule,
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers:[
        LoggerService,
        AppConfigService,
        AnalyticsService,
        HttpClient,
        AuthService,
        NotifyService,
        LocalDbService,
        WebSocketJs,
        DepartmentService,
        UsersService,
        FaqKbService,
        BotLocalDbService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
