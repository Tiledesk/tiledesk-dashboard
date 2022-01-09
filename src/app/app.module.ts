import { NotificationService } from './services/notification.service';
import { PopupService } from './services/popup.service';
import { MarkerService } from './services/marker.service';
import { LoggerService } from './services/logger/logger.service';
// import { LoggerInstance } from './services/logger/LoggerInstance';
import { MapRequestComponent } from './map-request/map-request.component';
import { MetricheComponent } from './analytics2/metriche/metriche.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';
import { AppComponent } from './app.component';

import { UserProfileComponent } from './user-profile/user-profile.component';

import { UiModule } from './ui/shared/ui.module';

///// Start FireStarter
// Core
import { CoreModule } from './core/core.module';

// Shared/Widget
import { SharedModule } from './shared/shared.module';

import { HomeComponent } from './home/home.component';
import { ChatComponent } from './chat/chat.component';

import { UsersService } from './services/users.service';
import { ContactsService } from './services/contacts.service';
import { ContactsComponent } from './contacts/contacts.component';
import { DepartmentService } from './services/department.service';
import { DepartmentsComponent } from './departments/departments.component';

import { FaqService } from './services/faq.service';
import { BotService } from './services/bot.service';
import { ProjectsComponent } from './projects/projects.component';
import { UsersComponent } from './users/users.component';

// BOTS & FAQ
import { FaqKbService } from './services/faq-kb.service';
import { BotListComponent } from './bots/bots-list/bots-list.component';
import { BotTypeSelectComponent } from './bots/bot-create/bot-type-select/bot-type-select.component';
import { BotCreateComponent } from './bots/bot-create/bot-create.component';
import { FaqEditAddComponent } from './bots/faq-edit-add/faq-edit-add.component';
import { FaqComponent } from './bots/faq/faq.component';
import { FaqTestComponent } from './bots/faq-test/faq-test.component';
import { FaqTestTrainBotComponent } from './bots/faq-test/faq-test-train-bot/faq-test-train-bot.component';
import { FaqSidebarComponent } from './bots/faq/faq-sidebar/faq-sidebar.component'; // fake comp used for a demo

import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { DepartmentEditAddComponent } from './department-edit-add/department-edit-add.component';
import { ProjectEditAddComponent } from './project-edit-add/project-edit-add.component';

import { ProjectService } from './services/project.service';
// import { RequestsListHistoryComponent } from './requests-list-history/requests-list-history.component';
import { MomentModule } from 'angular2-moment';
import { SigninComponent } from './auth/signin/signin.component';
import { SignupComponent } from './auth/signup/signup.component';
import { UnauthorizedComponent } from './auth/unauthorized/unauthorized.component';
import { ReactiveFormsModule } from '@angular/forms';

import { UserEditAddComponent } from './user-edit-add/user-edit-add.component';

import { LocalDbService } from './services/users-local-db.service';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { GroupService } from './services/group.service';
import { GroupsComponent } from './groups/groups.component';
import { GroupEditAddComponent } from './group-edit-add/group-edit-add.component';

import { BotLocalDbService } from './services/bot-local-db.service';
import { ChangePasswordComponent } from './user-profile//change-password/change-password.component';

// PIPE
import { GroupNamePipe } from './groupname.pipe';
import { SortByPipe } from './sortby.pipe';
import { SortByDesPipe } from './sortbydes.pipe';
import { MapToIterable } from './map-to-iterable-pipe';
import { SelectOptionsTranslatePipe } from './selectOptionsTranslate.pipe';
import { FilterArrayPipe } from './filterarray.pipe';
import { MarkedPipe } from './marked.pipe';

import { HoursComponent } from './hours/hours.component';

import { AmazingTimePickerModule } from 'amazing-time-picker';

import { NgSelectModule } from '@ng-select/ng-select';
import { ResetPswComponent } from './reset-psw/reset-psw.component';
import { ResetPswService } from './services/reset-psw.service';
import { WidgetSetUp } from './widget_components/widget-set-up/widget-set-up.component';
import { UploadImageService } from './services/upload-image.service';
import { UploadImageNativeService } from './services/upload-image-native.service';


import { HistoryAndNortConvsComponent } from './ws_requests/history-and-nort-convs/history-and-nort-convs.component';
import { MyDatePickerModule } from 'mydatepicker';
import { ContactDetailsComponent } from './contact-details/contact-details.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { WidgetService } from './services/widget.service';
import { ContactEditComponent } from './contact-edit/contact-edit.component';
import { ActivitiesComponent } from './activities/activities.component';

import { AnalyticsStaticComponent } from './static-pages/analytics-static/analytics-static.component';
import { ActivitiesStaticComponent } from './static-pages/activities-static/activities-static.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { HeatMapModule, TooltipService, LegendService, AdaptorService } from '@syncfusion/ej2-angular-heatmap'
import { AnalyticsService } from './services/analytics.service';
import { Analytics2Component } from './analytics2/analytics2.component';
import { PanoramicaComponent } from './analytics2/panoramica/panoramica.component';
import { RealtimeComponent } from './analytics2/realtime/realtime.component';
import { RichiesteComponent } from './analytics2/metriche/richieste/richieste.component';
import { SentimentComponent } from './analytics2/metriche/sentiment/sentiment.component';
import { TempirispostaComponent } from './analytics2/metriche/tempirisposta/tempirisposta.component';
import { DurataconvComponent } from './analytics2/metriche/durataconv/durataconv.component';
import { HoursStaticComponent } from './static-pages/hours-static/hours-static.component';
import { DepartmentsStaticComponent } from './static-pages/departments-static/departments-static.component';
import { ProjectPlanService } from './services/project-plan.service';
import { TriggerComponent } from './trigger/trigger.component';
import { BasetriggerComponent } from './trigger/basetrigger/basetrigger.component';
import { TriggerService } from './services/trigger.service';
import { TriggerAddComponent } from './trigger/trigger-add/trigger-add.component';
import { TriggerEditComponent } from './trigger/trigger-edit/trigger-edit.component';


/* PRIVATE */
import { PricingModule } from './pricing/pricing.module';
import { StaticPageBaseComponent } from './static-pages/static-page-base/static-page-base.component';

import { SlideshowModule } from 'ng-simple-slideshow';
import { GroupsStaticComponent } from './static-pages/groups-static/groups-static.component';

import { CreateProjectComponent } from './create-project-wizard/create-project/create-project.component';
import { InstallWidgetComponent } from './create-project-wizard/install-widget/install-widget.component';
import { ConfigureWidgetComponent } from './create-project-wizard/configure-widget/configure-widget.component';
import { HandleInvitationComponent } from './auth/handle-invitation/handle-invitation.component';

import { environment } from '../environments/environment';
import { AppConfigService } from './services/app-config.service';
import { WsRequestsListComponent } from './ws_requests/ws-requests-list/ws-requests-list.component';
import { WsRequestsService } from './services/websocket/ws-requests.service';
import { WsRequestsMsgsComponent } from './ws_requests/ws-requests-msgs/ws-requests-msgs.component';
import { WsMsgsService } from './services/websocket/ws-msgs.service';
import { WsSharedComponent } from './ws_requests/ws-shared/ws-shared.component';
import { WsTrainBotComponent } from './ws_requests/ws-requests-msgs/ws-train-bot/ws-train-bot.component';
import { WebSocketJs } from './services/websocket/websocket-js';
import { WidgetMultilanguageComponent } from './widget_components/widget-multilanguage/widget-multilanguage.component';
import { BaseTranslationComponent } from './widget_components/widget-multilanguage/base-translation/base-translation.component';
import { WidgetSharedComponent } from './widget_components/widget-shared/widget-shared.component';
import { WidgetSetUpBaseComponent } from './widget_components/widget-set-up/widget-set-up-base/widget-set-up-base.component';
import { WsRequestsServedComponent } from './ws_requests/ws-requests-list/ws-requests-served/ws-requests-served.component';
import { WsRequestsUnservedComponent } from './ws_requests/ws-requests-list/ws-requests-unserved/ws-requests-unserved.component';
import { CloseRequestModalComponent } from './ws_requests/modals/close-request-modal/close-request-modal.component';
import { LoadingPageComponent } from './loading-page/loading-page.component';
import { BotsBaseComponent } from './bots/bots-base/bots-base.component';
import { CannedResponsesListComponent } from './canned-responses/canned-responses-list.component';
import { CannedResponsesAddEditComponent } from './canned-responses/canned-responses-add-edit/canned-responses-add-edit.component';
import { CannedResponsesService } from './services/canned-responses.service';
import { TagsService } from './services/tags.service';
import { TagsComponent } from './tags/tags.component';
import { TagsDeleteComponent } from './tags/tags-delete/tags-delete.component';
import { TagsEditComponent } from './tags/tags-edit/tags-edit.component';
import { TriggerStaticComponent } from './static-pages/trigger-static/trigger-static.component';
import { AccountSettingsComponent } from './user-profile/account-settings/account-settings.component';

import { ProjectsForPanelComponent } from './projects/for-panel/projects-for-panel/projects-for-panel.component';


import { WsRequestsUnservedForPanelComponent } from './ws_requests/for-panel/ws-requests-unserved-for-panel/ws-requests-unserved-for-panel.component';
import { WsRequestDetailForPanelComponent } from './ws_requests/for-panel//ws-request-detail-for-panel/ws-request-detail-for-panel.component';
import { AutologinComponent } from './auth/autologin/autologin.component';
import { AppStoreComponent } from './app-store/app-store.component';
import { AppStoreService } from './services/app-store.service';
import { BrandService } from './services/brand.service';
import { ScriptService } from './services/script/script.service';
import { AppStoreInstallComponent } from './app-store/app-store-install/app-store-install.component';
// import { PerfectScrollbarTdDirective } from './_directives/td-perfect-scrollbar/perfect-scrollbar-td.directive';
import { DocsUrlRowComponent } from './components/docs-url-row/docs-url-row.component';
import { VisitorsComponent } from './visitors/visitors.component';
import { EventsComponent } from './events/events.component';
import { WidgetHomeComponent } from './widget-home-preview/widget-home.component';
import { WidgetCalloutComponent } from './widget-callout/widget-callout.component';
import { WidgetChatComponent } from './widget-chat/widget-chat.component';



import { WebhookComponent } from './webhook/webhook.component';
import { WebhookAddEditComponent } from './webhook/webhook-add-edit/webhook-add-edit.component';
import { WebhookService } from './services/webhook.service';


import { VisitorsAnalyticsComponent } from './analytics2/metriche/visitors-analytics/visitors-analytics.component';
import { MessagesComponent } from './analytics2/metriche/messages/messages.component';
import { NotificationSettingsComponent } from './user-profile/notification-settings/notification-settings.component';

import { CreateGroupComponent } from './department-edit-add/create-group/create-group.component';
import { CreateBotComponent } from './department-edit-add/create-bot/create-bot.component';

import { SatisfactionComponent } from './analytics2/metriche/satisfaction/satisfaction.component';
import { UnauthorizedForPricingComponent } from './auth/unauthorized-for-pricing/unauthorized-for-pricing.component';
import { EventsAnalyticsComponent } from './analytics2/metriche/events-analytics/events-analytics.component';
import { SanitizeHtmlPipe } from './sanitize-html.pipe';
import { UnauthorizedForProjectComponent } from './auth/unauthorized-for-project/unauthorized-for-project.component';
import { Autolinkerjs } from './autolinkerjs.pipe';
import { HtmlEntitiesEncodePipe } from './html-entities-encode.pipe';
import { NotificationEmailComponent } from './project-edit-add/notification-email/notification-email.component';
import { SmtpSettingsComponent } from './project-edit-add/smtp-settings/smtp-settings.component';



// console.log('************** APPMODULE ******************');
// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const appInitializerFn = (appConfig: AppConfigService, brandService: BrandService) => {
  return async () => {
    // console.log('APP INITIALIZED')
    // localStorage.setItem('isLoading', 'false')
    let loggingLevel = ''
    if (typeof appConfig.getConfig().logLevel === 'string') {
      loggingLevel = appConfig.getConfig().logLevel.toUpperCase()
    }
    if (appConfig.getConfig().logLevel === undefined) {
      // console.log('### DSHBRD here 1')
      loggingLevel = 'DEBUG'
    }

    if (appConfig.getConfig().logLevel !== undefined) {
      // console.log('### DSHBRD here 2A')
      if (appConfig.getConfig().logLevel.length === 0) {
        // console.log('### DSHBRD here 2B')
        loggingLevel = 'DEBUG'
      }
    }


    if (environment.remoteConfig) {
      await appConfig.loadAppConfig();
      await brandService.loadBrand();
      // let customLogger = new LoggerService(appConfig);
      let chatEngine = appConfig.getConfig().chatEngine
      let uploadEngine = appConfig.getConfig().uploadEngine
      let pushEngine = appConfig.getConfig().pushEngine

      // console.log('APP-CONFIG ', appConfig.getConfig() ) 

      if (loggingLevel === 'INFO' || loggingLevel === 'DEBUG') {
        // console.info('%c ### DSHBRD [APP-MODULE-TS] remoteConfig', 'color: #1a73e8', environment.remoteConfig);
        console.info('%c ### DSHBRD [APP-MODULE-TS] appConfig loaded', 'color: #1a73e8');
        console.info('%c ### DSHBRD [APP-MODULE-TS] brandService loaded', 'color: #1a73e8');
        console.info('%c ### DSHBRD [APP-MODULE-TS] chat Engine ', 'color: #1a73e8', chatEngine);
        console.info('%c ### DSHBRD [APP-MODULE-TS] upload Engine ', 'color: #1a73e8', uploadEngine);
        console.info('%c ### DSHBRD [APP-MODULE-TS] push Engine: ', 'color: #1a73e8', pushEngine);
      }

      return;
    } else {
      // return brandService.loadBrand();
      await brandService.loadBrand();

      let chatEngine = appConfig.getConfig().chatEngine
      let uploadEngine = appConfig.getConfig().uploadEngine
      let pushEngine = appConfig.getConfig().pushEngine

      if (loggingLevel === 'INFO' || loggingLevel === 'DEBUG') {
        // console.info('%c ### DSHBRD [APP-MODULE-TS] remoteConfig', 'color: #1a73e8', environment.remoteConfig);
        // console.info('%c ### DSHBRD [APP-MODULE-TS] config', 'color: #1a73e8', appConfig.getConfig());
        console.info('%c ### DSHBRD [APP-MODULE-TS] brandService loaded', 'color: #1a73e8');
        console.info('%c ### DSHBRD [APP-MODULE-TS] chat Engine ', 'color: #1a73e8', chatEngine);
        console.info('%c ### DSHBRD [APP-MODULE-TS] upload Engine ', 'color: #1a73e8', uploadEngine);
        console.info('%c ### DSHBRD [APP-MODULE-TS] push Engine: ', 'color: #1a73e8', pushEngine);
      }

      return;
    }
  };
};



@NgModule({
  declarations: [
    AppComponent,
    UserProfileComponent,
    HomeComponent,
    ContactsComponent,
    ChatComponent,
    DepartmentsComponent,
    FaqComponent,
    ProjectsComponent,
    UsersComponent,
    BotListComponent,
    BotCreateComponent,
    FaqEditAddComponent,
    DepartmentEditAddComponent,
    ProjectEditAddComponent,
    // RequestsListHistoryComponent,
    SigninComponent,
    SignupComponent,
    UnauthorizedComponent,
    FaqTestComponent,
    UserEditAddComponent,
    VerifyEmailComponent,
    GroupsComponent,
    GroupEditAddComponent,
    GroupNamePipe,
    SortByPipe,
    SortByDesPipe,
    MapToIterable,
    SelectOptionsTranslatePipe,
    FilterArrayPipe,
    ChangePasswordComponent,
    HoursComponent,
    ResetPswComponent,
    WidgetSetUp,
    HistoryAndNortConvsComponent,
    ContactDetailsComponent,
    ContactEditComponent,
    ActivitiesComponent,
    AnalyticsStaticComponent,
    ActivitiesStaticComponent,
    FaqTestTrainBotComponent,
    Analytics2Component,
    PanoramicaComponent,
    MetricheComponent,
    RealtimeComponent,
    RichiesteComponent,
    SentimentComponent,
    TempirispostaComponent,
    DurataconvComponent,
    HoursStaticComponent,
    DepartmentsStaticComponent,
    StaticPageBaseComponent,
    GroupsStaticComponent,
    TriggerComponent,
    TriggerAddComponent,
    TriggerEditComponent,
    BasetriggerComponent,
    FaqSidebarComponent,
    CreateProjectComponent,
    InstallWidgetComponent,
    HandleInvitationComponent,
    WsRequestsListComponent,
    WsRequestsMsgsComponent,
    WsSharedComponent,
    WsTrainBotComponent,
    WidgetMultilanguageComponent,
    BaseTranslationComponent,
    WidgetSharedComponent,
    WidgetSetUpBaseComponent,
    WsRequestsServedComponent,
    WsRequestsUnservedComponent,
    CloseRequestModalComponent,
    LoadingPageComponent,
    BotTypeSelectComponent,
    BotsBaseComponent,
    CannedResponsesListComponent,
    CannedResponsesAddEditComponent,
    TagsComponent,
    TagsDeleteComponent,
    TagsEditComponent,
    TriggerStaticComponent,
    AccountSettingsComponent,
    ProjectsForPanelComponent,
    WsRequestsUnservedForPanelComponent,
    WsRequestDetailForPanelComponent,
    AutologinComponent,
    AppStoreComponent,
    AppStoreInstallComponent,
    // PerfectScrollbarTdDirective,
    DocsUrlRowComponent,
    VisitorsComponent,
    EventsComponent,
    WidgetHomeComponent,
    WidgetCalloutComponent,
    ConfigureWidgetComponent,
    WidgetChatComponent,
    WebhookComponent,
    WebhookAddEditComponent,
    MapRequestComponent,
    WebhookComponent,
    WebhookAddEditComponent,
    MapRequestComponent,
    MessagesComponent,
    NotificationSettingsComponent,
    VisitorsAnalyticsComponent,
    CreateGroupComponent,
    CreateBotComponent,
    SatisfactionComponent,
    UnauthorizedForPricingComponent,
    EventsAnalyticsComponent,
    MarkedPipe,
    SanitizeHtmlPipe,
    UnauthorizedForProjectComponent,
    Autolinkerjs,
    HtmlEntitiesEncodePipe,
    NotificationEmailComponent,
    SmtpSettingsComponent,
  ],
  imports: [
    /* PRIVATE */
    PricingModule,
    /* PRIVATE */
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
    UiModule,
    HttpModule,
    ComponentsModule,
    RouterModule,
    HeatMapModule,
    HttpClientModule,
    MomentModule,
    AmazingTimePickerModule,
    NgSelectModule,
    MyDatePickerModule,
    ColorPickerModule,
    BrowserAnimationsModule,
    SlideshowModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    AppConfigService, // https://juristr.com/blog/2018/01/ng-app-runtime-config/
    BrandService,
    LoggerService,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFn,
      multi: true,
      deps: [AppConfigService, BrandService]
    },
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: brandLoader,
    //   multi: true,
    //   deps: [BrandService]
    // },
    ScriptService,
    WsRequestsService,
    WsMsgsService,
    AppStoreService,
    WebSocketJs,
    UsersService,
    ContactsService,
    CannedResponsesService,
    TagsService,
    DepartmentService,
    FaqService,
    BotService,
    FaqKbService,
    ProjectService,
    LocalDbService,
    GroupService,
    BotLocalDbService,
    ResetPswService,
    UploadImageService,
    UploadImageNativeService,
    WidgetService,
    WebhookService,
    ProjectPlanService,
    LegendService, TooltipService, AdaptorService, AnalyticsService, HttpClientModule,
    TriggerService,
    SelectOptionsTranslatePipe,
    FilterArrayPipe,
    MarkerService,
    // LoggerInstance,
    PopupService,
    NotificationService,
    { provide: LocationStrategy, useClass: HashLocationStrategy }
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
  // constructor() {
  //   firebase.initializeApp(firebaseConfig);
  // }
}
