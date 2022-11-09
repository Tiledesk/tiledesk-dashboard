import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessagesComponent } from './messages.component';

import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core'; // suppress the error msg Can't bind to 'ngModel' + 'clearable' .... since it isn't a known property of 'ng-select'.


import { HttpClient, HttpClientModule } from '@angular/common/http'; // Error: StaticInjectorError(DynamicTestModule)[AnalyticsService -> HttpClient]:

import { AuthService } from '../../../core/auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { NotifyService } from 'app/core/notify.service';
import { LoggerService } from '../../../services/logger/logger.service';
import { AppConfigService } from '../../../services/app-config.service';
import { LocalDbService } from '../../../services/users-local-db.service';
import { WebSocketJs } from "../../../services/websocket/websocket-js"; 
import { UsersService } from '../../../services/users.service';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { FaqKbService } from '../../../services/faq-kb.service';
import { BotLocalDbService } from '../../../services/bot-local-db.service';
import { HttpClientTestingModule, HttpTestingController, RequestMatch, TestRequest } from '@angular/common/http/testing';
import { AnalyticsService } from 'app/analytics/analytics-service/analytics.service';


describe('MessagesComponent', () => {
  let component: MessagesComponent;
  let fixture: ComponentFixture<MessagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessagesComponent ],
      // schemas: [NO_ERRORS_SCHEMA],
      imports: [
        TranslateModule.forRoot(),
        HttpClientModule,
        RouterTestingModule,
        FormsModule,
        NgSelectModule,
        HttpClientTestingModule
      ],
      providers: [
        AnalyticsService,
        HttpClient,
        AuthService,
        NotifyService,
        LoggerService,
        AppConfigService,
        LocalDbService,
        WebSocketJs,
        UsersService,
        FaqKbService,
        BotLocalDbService
       ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
