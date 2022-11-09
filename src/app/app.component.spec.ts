import { TestBed, async } from '@angular/core/testing';

import { AppComponent } from './app.component';
import { FooterComponent } from './components/footer/footer.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NotificationMessageComponent } from './ui/notification-message/notification-message.component';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingSpinnerComponent } from './ui/loading-spinner/loading-spinner.component';
import { AuthService } from './core/auth.service';
import { NotifyService } from './core/notify.service';  // Error: StaticInjectorError(DynamicTestModule)[AuthService -> NotifyService]:
import { LocalDbService } from './services/users-local-db.service'; // Error: StaticInjectorError(DynamicTestModule)[AuthService -> LocalDbService]: 
import { WebSocketJs } from "./services/websocket/websocket-js"; // Error: StaticInjectorError(DynamicTestModule)[AuthService -> WebSocketJs]: 
import { LoggerService } from './services/logger/logger.service';
import { AppConfigService } from './services/app-config.service';
import { WsRequestsService } from './services/websocket/ws-requests.service';
import { WsMsgsService } from './services/websocket/ws-msgs.service';
import { BrandService } from './services/brand.service';
import { ScriptService } from './services/script/script.service';
import { ProjectService } from './services/project.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { UsersService } from './services/users.service';
import { FaqKbService } from './services/faq-kb.service';
import { BotLocalDbService } from './services/bot-local-db.service';
import { UploadImageService } from './services/upload-image.service';
import { DepartmentService } from './services/department.service';
import { UploadImageNativeService } from './services/upload-image-native.service';
import { AuthGuard } from './core/auth.guard';
import { ProjectPlanService } from './services/project-plan.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        SidebarComponent,
        NavbarComponent,
        NotificationMessageComponent,
        FooterComponent,
        LoadingSpinnerComponent,
        
      ],
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot(),
        HttpClientModule,
        HttpClientTestingModule
      ],
      providers: [ 
        AuthService,
        NotifyService,
        LocalDbService,
        WebSocketJs,
        LoggerService,
        AppConfigService,
        WsRequestsService,
        WsMsgsService,
        BrandService,
        ScriptService,
        ProjectService,
        HttpClient,
        UsersService,
        FaqKbService,
        BotLocalDbService,
        UploadImageService,
        UploadImageNativeService,
        DepartmentService,
        AuthGuard,
        ProjectPlanService
      ]
    }).compileComponents();
  }));

  xit('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  xit(`should have as title 'app works!'`, async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('app works!');
  }));

  xit('should render title in a h1 tag', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('app works!');
  }));
});
