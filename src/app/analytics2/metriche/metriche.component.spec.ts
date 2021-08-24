import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricheComponent } from './metriche.component';

import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';  // If 'appdashboard-richieste' ...... is an Angular component, then verify that it is part of this module.
import { LoggerService } from '../../services/logger/logger.service';
import { AppConfigService } from 'app/services/app-config.service';
import { HttpModule } from '@angular/http'; 
import { RichiesteComponent } from '../metriche/richieste/richieste.component';
import { MessagesComponent } from '../metriche/messages/messages.component';
import { TempirispostaComponent } from '../metriche/tempirisposta/tempirisposta.component';
import { DurataconvComponent } from '../metriche/durataconv/durataconv.component';
import { EventsAnalyticsComponent } from '../metriche/events-analytics/events-analytics.component';
import { VisitorsAnalyticsComponent } from '../metriche/visitors-analytics/visitors-analytics.component';
import { SatisfactionComponent } from '../metriche/satisfaction/satisfaction.component';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { AnalyticsService } from 'app/services/analytics.service';
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

describe('MetricheComponent', () => {
  let component: MetricheComponent;
  let fixture: ComponentFixture<MetricheComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ 
        MetricheComponent, 
        RichiesteComponent,
        MessagesComponent,
        TempirispostaComponent,
        DurataconvComponent,
        EventsAnalyticsComponent,
        VisitorsAnalyticsComponent,
        SatisfactionComponent
        
       ],
      // schemas: [NO_ERRORS_SCHEMA],
      imports: [
        TranslateModule.forRoot(),
        HttpModule,
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
    fixture = TestBed.createComponent(MetricheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
