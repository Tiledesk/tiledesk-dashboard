import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppStoreService } from '../../services/app-store.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthService } from '../../core/auth.service';
import { NotifyService } from '../../core/notify.service';  // Error: StaticInjectorError(DynamicTestModule)[AuthService -> NotifyService]:
import { LocalDbService } from '../../services/users-local-db.service'; // Error: StaticInjectorError(DynamicTestModule)[AuthService -> LocalDbService]: 
import { WebSocketJs } from "../../services/websocket/websocket-js"; // Error: StaticInjectorError(DynamicTestModule)[AuthService -> WebSocketJs]: 

import { AppStoreInstallComponent } from './app-store-install.component';
import { LoggerService } from '../../services/logger/logger.service';
import { AppConfigService } from '../../services/app-config.service';

describe('AppStoreInstallComponent', () => {
  let component: AppStoreInstallComponent;
  let fixture: ComponentFixture<AppStoreInstallComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppStoreInstallComponent],
      imports: [
        RouterTestingModule,
        HttpClientModule
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
    fixture = TestBed.createComponent(AppStoreInstallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
