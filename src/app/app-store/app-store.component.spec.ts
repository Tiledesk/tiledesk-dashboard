import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingSpinnerComponent } from 'app/ui/loading-spinner/loading-spinner.component';
import { AppStoreService } from '../services/app-store.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthService } from '../core/auth.service';
import { NotifyService } from '../core/notify.service';  // Error: StaticInjectorError(DynamicTestModule)[AuthService -> NotifyService]:
import { LocalDbService } from '../services/users-local-db.service'; // Error: StaticInjectorError(DynamicTestModule)[AuthService -> LocalDbService]: 
import { WebSocketJs } from "../services/websocket/websocket-js"; // Error: StaticInjectorError(DynamicTestModule)[AuthService -> WebSocketJs]: 

import { AppStoreComponent } from './app-store.component';
import { LoggerService } from '../services/logger/logger.service';
import { AppConfigService } from 'app/services/app-config.service';

describe('AppStoreComponent', () => {
  let component: AppStoreComponent;
  let fixture: ComponentFixture<AppStoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ 
        AppStoreComponent ,
        LoadingSpinnerComponent
      ],
      imports: [ 
        HttpClientModule,
        RouterTestingModule
      ],
      providers: [ 
        AppStoreService,
        HttpClient,
        AuthService,
        NotifyService,
        LocalDbService,
        WebSocketJs,
        LoggerService,
        AppConfigService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
