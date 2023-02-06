// import {} from 'jasmine';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivitiesComponent } from './activities.component';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UsersService } from '../services/users.service';
import { AuthService } from '../core/auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { NotifyService } from '../core/notify.service';
import { LoggerService } from '../services/logger/logger.service';
import { AppConfigService } from '../services/app-config.service';

import { LocalDbService } from '../services/users-local-db.service';
import { BotLocalDbService } from '../services/bot-local-db.service';
import { WebSocketJs } from "../services/websocket/websocket-js";
import { FaqKbService } from '../services/faq-kb.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { LoadingSpinnerComponent } from '../ui/loading-spinner/loading-spinner.component';

describe('ActivitiesComponent', () => {
  let component: ActivitiesComponent;
  let fixture: ComponentFixture<ActivitiesComponent>;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [ActivitiesComponent, LoadingSpinnerComponent],
      // schemas: [NO_ERRORS_SCHEMA],
      imports: [
        TranslateModule.forRoot(),
        RouterTestingModule,
        HttpClientModule,
        FormsModule,
        NgSelectModule
      ],
      providers: [
        UsersService,
        AuthService,
        NotifyService,
        LoggerService,
        AppConfigService,
        LocalDbService,
        BotLocalDbService,
        WebSocketJs,
        FaqKbService,
        HttpClient
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
