import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanoramicaComponent } from './panoramica.component';

import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core'; // Can't bind to 'yAxis' since it isn't a known property of 'ejs-heatmap'..... 

import { HttpClient, HttpClientModule } from '@angular/common/http'; // Error: StaticInjectorError(DynamicTestModule)[AnalyticsService -> HttpClient]:


import { AuthService } from '../../core/auth.service';
import { NotifyService } from '../../core/notify.service';  // Error: StaticInjectorError(DynamicTestModule)[AuthService -> NotifyService]:
import { LocalDbService } from '../../services/users-local-db.service'; // Error: StaticInjectorError(DynamicTestModule)[AuthService -> LocalDbService]: 
import { WebSocketJs } from "../../services/websocket/websocket-js"; // Error: StaticInjectorError(DynamicTestModule)[AuthService -> WebSocketJs]: 
import { RouterTestingModule } from '@angular/router/testing'; // Error: StaticInjectorError(DynamicTestModule)[AuthService -> Router]: 
import { LoggerService } from '../../services/logger/logger.service';
import { AppConfigService } from '../../services/app-config.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AnalyticsService } from '../analytics-service/analytics.service';

describe('PanoramicaComponent', () => {
  let component: PanoramicaComponent;
  let fixture: ComponentFixture<PanoramicaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanoramicaComponent ],
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
        AppConfigService
       ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanoramicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
