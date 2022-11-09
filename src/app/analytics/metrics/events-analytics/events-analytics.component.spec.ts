import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsAnalyticsComponent } from './events-analytics.component';

import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core'; // suppress the error msg Can't bind to 'ngModel' + 'clearable' .... since it isn't a known property of 'ng-select'.


import { HttpClient, HttpClientModule } from '@angular/common/http'; // Error: StaticInjectorError(DynamicTestModule)[AnalyticsService -> HttpClient]:
import { AppConfigService } from '../../../services/app-config.service'; // ERRORStaticInjectorError(DynamicTestModule)[AnalyticsService -> AppConfigService]:

import { AuthService } from '../../../core/auth.service';

import { NotifyService } from '../../../core/notify.service';  // Error: StaticInjectorError(DynamicTestModule)[AuthService -> NotifyService]:
import { LocalDbService } from '../../../services/users-local-db.service'; // Error: StaticInjectorError(DynamicTestModule)[AuthService -> LocalDbService]: 
import { WebSocketJs } from "../../../services/websocket/websocket-js"; // Error: StaticInjectorError(DynamicTestModule)[AuthService -> WebSocketJs]: 
import { RouterTestingModule } from '@angular/router/testing'; // Error: StaticInjectorError(DynamicTestModule)[AuthService -> Router]: 

import { LoggerService } from '../../../services/logger/logger.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { AnalyticsService } from 'app/analytics/analytics-service/analytics.service';
// to suppress the Error  TypeError: Cannot read property 'length' of undefined  added in the method getEventsByLastNDays() wrapped  "for (let j = 0; j < eventsByDay.length; j++) {.." in  if (eventsByDay) { ...

describe('EventsAnalyticsComponent', () => {
  let component: EventsAnalyticsComponent;
  let fixture: ComponentFixture<EventsAnalyticsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventsAnalyticsComponent ],
      // schemas: [NO_ERRORS_SCHEMA],
      imports: [
        TranslateModule.forRoot(),
        HttpClientModule,
        RouterTestingModule,
        HttpClientTestingModule,
        NgSelectModule,
        FormsModule,
      ],
      providers: [
        AnalyticsService,
        HttpClient,
        AuthService,
        NotifyService,
        LocalDbService,
        WebSocketJs,
        LoggerService,
        AppConfigService
       ],

    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
