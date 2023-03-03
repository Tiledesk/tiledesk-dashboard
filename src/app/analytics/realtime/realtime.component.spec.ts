import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RealtimeComponent } from './realtime.component';

import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MomentModule } from 'ngx-moment';
import { UsersService } from '../../services/users.service';
import { FaqKbService } from '../../services/faq-kb.service';
import { BotLocalDbService } from '../../services/bot-local-db.service';
import { AuthService } from '../../core/auth.service';
import { NotifyService } from '../../core/notify.service';  // Error: StaticInjectorError(DynamicTestModule)[AuthService -> NotifyService]:
import { LocalDbService } from '../../services/users-local-db.service'; // Error: StaticInjectorError(DynamicTestModule)[AuthService -> LocalDbService]: 
import { WebSocketJs } from "../../services/websocket/websocket-js"; // Error: StaticInjectorError(DynamicTestModule)[AuthService -> WebSocketJs]: 
import { RouterTestingModule } from '@angular/router/testing'; // Error: StaticInjectorError(DynamicTestModule)[AuthService -> Router]: 
import { LoggerService } from '../../services/logger/logger.service';
import { AppConfigService } from '../../services/app-config.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DepartmentService } from '../../services/department.service';
import { WsRequestsService } from '../../services/websocket/ws-requests.service';
import { AnalyticsService } from '../analytics-service/analytics.service';


describe('RealtimeComponent', () => {
  let component: RealtimeComponent;
  let fixture: ComponentFixture<RealtimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RealtimeComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        TranslateModule.forRoot(),
        MomentModule,
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [
        UsersService,
        FaqKbService,
        BotLocalDbService,
        AuthService,
        NotifyService,
        LocalDbService,
        WebSocketJs,
        LoggerService,
        AppConfigService,
        DepartmentService,
        WsRequestsService,
        AnalyticsService
       ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RealtimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
