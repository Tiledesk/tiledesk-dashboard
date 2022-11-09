import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SentimentComponent } from './sentiment.component';

import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core'; // suppress the error msg "Can't bind to 'ngModel' + 'clearable' since it isn't a known property of 'ng-select'.""

import { HttpClient, HttpClientModule } from '@angular/common/http'; // Error: StaticInjectorError(DynamicTestModule)[AnalyticsService -> HttpClient]:


import { AuthService } from '../../../core/auth.service';
import { NotifyService } from '../../../core/notify.service';  // Error: StaticInjectorError(DynamicTestModule)[AuthService -> NotifyService]:
import { LocalDbService } from '../../../services/users-local-db.service'; // Error: StaticInjectorError(DynamicTestModule)[AuthService -> LocalDbService]: 
import { WebSocketJs } from "../../../services/websocket/websocket-js"; // Error: StaticInjectorError(DynamicTestModule)[AuthService -> WebSocketJs]: 
import { RouterTestingModule } from '@angular/router/testing'; // Error: StaticInjectorError(DynamicTestModule)[AuthService -> Router]: 
import { LoggerService } from '../../../services/logger/logger.service';
import { AppConfigService } from '../../../services/app-config.service';
import { DepartmentService } from '../../../services/department.service';
import { UsersService } from '../../../services/users.service';
import { FaqKbService } from '../../../services/faq-kb.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AnalyticsService } from 'app/analytics/analytics-service/analytics.service';

describe('SentimentComponent', () => {
  let component: SentimentComponent;
  let fixture: ComponentFixture<SentimentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SentimentComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        TranslateModule.forRoot(),
        HttpClientModule,
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [
        AnalyticsService,
        HttpClient,
        AuthService,
        NotifyService,
        LocalDbService,
        WebSocketJs,
        LoggerService,
        AppConfigService,
        DepartmentService,
        UsersService,
        FaqKbService,
       ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SentimentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
