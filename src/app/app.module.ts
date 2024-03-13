import { NotificationService } from './services/notification.service';
import { PopupService } from './services/popup.service';
import { MarkerService } from './services/marker.service';
import { LoggerService } from './services/logger/logger.service';
import { HomeService } from './services/home.service';
import { ActivitiesService } from './activities/activities-service/activities.service';


// import { LoggerInstance } from './services/logger/LoggerInstance';
import { MapRequestComponent } from './map-request/map-request.component';
import { MetricsComponent } from './analytics/metrics/metrics.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';
import { AppComponent } from './app.component';

import { UserProfileComponent } from './user-profile/user-profile.component';

import { UiModule } from './ui/shared/ui.module';


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
import { UrlService } from './services/shared/url.service';

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

import { SigninComponent } from './auth/signin/signin.component';
import { SignupComponent } from './auth/signup/signup.component';
import { UnauthorizedComponent } from './auth/unauthorized/unauthorized.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

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



import { NgSelectModule } from '@ng-select/ng-select';
import { ResetPswComponent } from './reset-psw/reset-psw.component';
import { ResetPswService } from './services/reset-psw.service';
import { WidgetSetUp } from './widget_components/widget-set-up/widget-set-up.component';
import { UploadImageService } from './services/upload-image.service';
import { UploadImageNativeService } from './services/upload-image-native.service';


import { HistoryAndNortConvsComponent } from './ws_requests/history-and-nort-convs/history-and-nort-convs.component';

import { ContactDetailsComponent } from './contact-details/contact-details.component';

import { WidgetService } from './services/widget.service';
import { ContactEditComponent } from './contact-edit/contact-edit.component';
import { ActivitiesComponent } from './activities/activities.component';

import { AnalyticsStaticComponent } from './static-pages/analytics-static/analytics-static.component';
import { ActivitiesStaticComponent } from './static-pages/activities-static/activities-static.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AnalyticsComponent } from './analytics/analytics.component';
import { PanoramicaComponent } from './analytics/panoramica/panoramica.component';
import { RealtimeComponent } from './analytics/realtime/realtime.component';
import { RequestsComponent } from './analytics/metrics/requests/requests.component';
import { SentimentComponent } from './analytics/metrics/sentiment/sentiment.component';
import { ResponseTimesComponent } from './analytics/metrics/responsetimes/responsetimes.component';
import { ConvsDurationComponent } from './analytics/metrics/convsduration/convsduration.component';
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

import { GroupsStaticComponent } from './static-pages/groups-static/groups-static.component';

import { CreateProjectComponent } from './create-project-wizard/create-project/create-project.component';
import { InstallWidgetComponent } from './create-project-wizard/install-widget/install-widget.component';
import { ConfigureWidgetComponent } from './create-project-wizard/configure-widget/configure-widget.component';
import { OnboardingComponent } from './create-project-wizard/onboarding/onboarding.component';
import { WelcomeMessageConfigurationComponent } from './create-project-wizard/onboarding/welcome-message-configuration/welcome-message-configuration.component';
import { ChatbotConfigurationComponent } from './create-project-wizard/onboarding/chatbot-configuration/chatbot-configuration.component';
import { HumanConfigurationComponent } from './create-project-wizard/onboarding/human-configuration/human-configuration.component';
import { ErrorResultComponent } from './create-project-wizard/onboarding/error-result/error-result.component';

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
// APP
import { AppStoreComponent } from './app-store/app-store.component';
import { AppStoreInstallComponent } from './app-store/app-store-install/app-store-install.component';
import { AppCreateComponent } from './app-store/app-create/app-create.component';
import { AppStoreService } from './services/app-store.service';

import { BrandService } from './services/brand.service';
import { ScriptService } from './services/script/script.service';

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


import { VisitorsAnalyticsComponent } from './analytics/metrics/visitors-analytics/visitors-analytics.component';
import { MessagesComponent } from './analytics/metrics/messages/messages.component';
import { NotificationSettingsComponent } from './user-profile/notification-settings/notification-settings.component';

import { CreateGroupComponent } from './department-edit-add/create-group/create-group.component';
import { CreateBotComponent } from './department-edit-add/create-bot/create-bot.component';

import { SatisfactionComponent } from './analytics/metrics/satisfaction/satisfaction.component';
import { UnauthorizedForPricingComponent } from './auth/unauthorized-for-pricing/unauthorized-for-pricing.component';
import { EventsAnalyticsComponent } from './analytics/metrics/events-analytics/events-analytics.component';
import { SanitizeHtmlPipe } from './sanitize-html.pipe'; // used for iframe to bypass security 
import { SafeHtmlPipe } from './safe-html.pipe'; // used to sanitize email 
import { UnauthorizedForProjectComponent } from './auth/unauthorized-for-project/unauthorized-for-project.component';

import { HtmlEntitiesEncodePipe } from './html-entities-encode.pipe';
import { NotificationEmailComponent } from './project-edit-add/notification-email/notification-email.component';
import { SmtpSettingsComponent } from './project-edit-add/smtp-settings/smtp-settings.component';
import { SettingsSidebarComponent } from './components/settings-sidebar/settings-sidebar.component';


import { WidgetPrechatFormComponent } from './widget-prechat-form/widget-prechat-form.component';


import { OnlynumberDirective } from './_directives/onlynumber.directive';
import { NativeBotSidebarComponent } from './bots/native-bot-sidebar/native-bot-sidebar.component';
import { NativeBotComponent } from './bots/native-bot/native-bot.component';
import { NativeBotSelectTypeComponent } from './bots/native-bot-select-type/native-bot-select-type.component';

import { TilebotSelectTypeComponent } from './bots/tilebot-select-type/tilebot-select-type.component';
import { TilebotSidebarComponent } from './bots/tilebot-sidebar/tilebot-sidebar.component';
import { TilebotComponent } from './bots/tilebot/tilebot.component';
import { RasaBotComponent } from './bots/rasa-bot/rasa-bot.component';
import { TemplatesComponent } from './bots/templates/templates.component';

import { EmailTicketingComponent } from './email-ticketing/email-ticketing.component';

import { CutomTooltipOptions } from './utils/util';
import { WsSidebarAppsComponent } from './ws_requests/ws-requests-msgs/ws-sidebar-apps/ws-sidebar-apps.component';
import { ImageViewerComponent } from './ws_requests/ws-requests-msgs/image-viewer/image-viewer.component';
import { WidgetInstallationComponent } from './widget-installation/widget-installation.component';
import { AutofocusDirective } from './_directives/autofocus.directive';
import { AnalyticsService } from './analytics/analytics-service/analytics.service';
import { TooltipModule, TooltipOptions } from 'ng2-tooltip-directive';

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';


import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { MomentModule } from 'ngx-moment';
import { NgImageSliderModule } from 'ng-image-slider';
import { CreditCardDirectivesModule } from 'angular-cc-library';
import { NgApexchartsModule } from "ng-apexcharts";
import { DragDropModule } from '@angular/cdk/drag-drop';

// Removed libraries
// import { ColorPickerModule } from 'ngx-color-picker'; -- ColorPickerModule v12.0.1 (was v6.7.0) -| widget-set-up.component.ts |--|
// import { MyDatePickerModule } from 'mydatepicker'; -- replaced with MatDatepickerModule -| activities.componet.ts |--| history-and-nort-convs.component.ts |--| activities-static.component.ts
// import { SlideshowModule } from 'ng-simple-slideshow'; --  replaced with npm i ng-image-slider -| analytics-static.component |--| departments-static |--|  groups-static

// import { AmazingTimePickerModule } from 'amazing-time-picker'; -- ngx-mat-timepicker -| hours.component.ts |--| // see https://stackblitz.com/edit/ngx-mat-timepicker?file=src%2Fapp%2Fapp.component.ts
// import { MomentModule } from 'angular2-moment';

// Custom component widget installation //
import { CodeInstallationComponent } from './components/widget-installations/code-installation/code-installation.component';
import { JsInstallationComponent } from './components/widget-installations/js-installation/js-installation.component';
import { GoogleTagManagerInstallationComponent } from './components/widget-installations/google-tag-manager-installation/google-tag-manager-installation.component'
import { ShopifyInstallationComponent } from './components/widget-installations/shopify-installation/shopify-installation.component';
import { WordpressInstallationComponent } from './components/widget-installations/wordpress-installation/wordpress-installation.component';
import { PrestashopInstallationComponent } from './components/widget-installations/prestashop-installation/prestashop-installation.component';
import { JoomlaInstallationComponent } from './components/widget-installations/joomla-installation/joomla-installation.component';
import { SatPopoverModule } from '@ncstate/sat-popover';
import { TilebotFormComponent } from './bots/tilebot/tilebot-form/tilebot-form.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';


import { ModalDeleteComponent } from './components/modals/modal-delete/modal-delete.component';
import { TilebotAddEditFormComponent } from './bots/tilebot/tilebot-add-edit-form/tilebot-add-edit-form.component';
import { TilebotListFieldsFormComponent } from './bots/tilebot/tilebot-list-fields-form/tilebot-list-fields-form.component';
import { ChatbotSetupComponent } from './create-project-wizard/onboarding/chatbot-setup/chatbot-setup.component';

import { SidebarClaimsComponent } from './create-project-wizard/onboarding/sidebar-claims/sidebar-claims.component';
import { NetworkOfflineComponent } from './network-offline/network-offline.component';
import { HomePromoBannerComponent } from './home-promo-banner/home-promo-banner.component';
import { TemplateDetailComponent } from './bots/templates/template-detail/template-detail.component';
import { BotsSidebarComponent } from './bots/bots-list/bots-sidebar/bots-sidebar.component';
import { GetStartChatbotForkComponent } from './create-project-wizard/get-start-chatbot-fork/get-start-chatbot-fork.component';
import { InstallTemplateComponent } from './create-project-wizard/install-template/install-template.component';
import { ChatbotDesignStudioModule } from './chatbot-design-studio/chatbot-design-studio.module';
import { CreateChatbotComponent } from './bots/create-chatbot/create-chatbot.component';
import { OnboardingWidgetComponent } from './create-project-wizard/onboarding-widget/onboarding-widget.component';
import { CommunityTemplateDtlsComponent } from './bots/templates/community-template-dtls/community-template-dtls.component';
import { HomePromoDesignStudioComponent } from './home-promo-design-studio/home-promo-design-studio.component';
import { PasswordStrengthComponent } from './auth/signup/password-strength/password-strength.component';
import { CloneBotComponent } from './bots/bots-list/clone-bot/clone-bot.component';
import { ContactsStaticComponent } from './static-pages/contacts-static/contacts-static.component';
import { CannedResponsesStaticComponent } from './static-pages/canned-responses-static/canned-responses-static.component';
import { UpgradePlanModalComponent } from './components/modals/upgrade-plan-modal/upgrade-plan-modal.component';
import { WsrequestsStaticComponent } from './static-pages/wsrequests-static/wsrequests-static.component';
import { EmailTicketingStaticComponent } from './static-pages/email-ticketing-static/email-ticketing-static.component';
import { OnboardingContentComponent } from './create-new-project/onboarding-content/onboarding-content.component';
import { CnpProjectNameComponent } from './create-new-project/cnp-project-name/cnp-project-name.component';
import { CnpQuestionSelectComponent } from './create-new-project/cnp-question-select/cnp-question-select.component';
import { CnpQuestionButtonComponent } from './create-new-project/cnp-question-button/cnp-question-button.component';
import { CnpChatbotWelcomeMessageComponent } from './create-new-project/cnp-chatbot-welcome-message/cnp-chatbot-welcome-message.component';
import { CnpWidgetInstallationComponent } from './create-new-project/cnp-widget-installation/cnp-widget-installation.component';
import { CnpIsMobileComponent } from './create-new-project/cnp-is-mobile/cnp-is-mobile.component';
import { LoadingSectionComponent } from './create-new-project/loading-section/loading-section.component';
import { ActivateAppsumoProductComponent } from './create-project-wizard/activate-appsumo-product/activate-appsumo-product.component';
import { ContactCustomPropertiesComponent } from './components/modals/contact-custom-properties/contact-custom-properties.component';
import { ContactInfoComponent } from './components/shared/contact-info/contact-info.component';
import { CreateProjectGsComponent } from './create-project-wizard/create-project-gs/create-project-gs.component';
// new home comp
import { HomeConvsGraphComponent } from './home-components/home-convs-graph/home-convs-graph.component';
import { HomeWhatsappAccountComponent } from './home-components/home-whatsapp-account/home-whatsapp-account.component';
import { HomeCreateChatbotComponent } from './home-components/home-create-chatbot/home-create-chatbot.component';
import { HomeNewsFeedComponent } from './home-components/home-news-feed/home-news-feed.component';
import { HomeAnalyticsIndicatorComponent } from './home-components/home-analytics-indicator/home-analytics-indicator.component';
import { HomeWhatsappAccountWizardComponent } from './home-components/home-whatsapp-account-wizard/home-whatsapp-account-wizard.component';
import { HomeWhatsappAccountWizardModalComponent } from './home-components/home-whatsapp-account-wizard/home-whatsapp-account-wizard-modal/home-whatsapp-account-wizard-modal.component';
import { HomeCustomizeWidgetComponent } from './home-components/home-customize-widget/home-customize-widget.component';
import { HomeCreateTeammateComponent } from './home-components/home-create-teammate/home-create-teammate.component';
import { HomeKbComponent } from './home-components/home-kb/home-kb.component';
// ./new home comp


import { OpenaiService } from './services/openai.service';
// import { KnowledgeBasesComponent } from './knowledge-bases/knowledge-bases.component';
import { HomeKbModalComponent } from './home-components/home-kb/home-kb-modal/home-kb-modal.component';
import { HomeCreateChatbotModalComponent } from './home-components/home-create-chatbot/home-create-chatbot-modal/home-create-chatbot-modal.component';
import { HomeInviteTeammateModalComponent } from './home-components/home-create-teammate/home-invite-teammate-modal/home-invite-teammate-modal.component';
import { HomeInviteTeammateErrorModalComponent } from './home-components/home-create-teammate/home-invite-teammate-error-modal/home-invite-teammate-error-modal.component';
import { HomeGoToChatComponent } from './home-components/home-go-to-chat/home-go-to-chat.component';
import { ChatbotModalComponent } from './bots/bots-list/chatbot-modal/chatbot-modal.component';
import { ChatbotAlertComponent } from './bots/bots-list/chatbot-alert/chatbot-alert.component';
import { KnowledgeBasesComponent } from './knowledge-bases/knowledge-bases.component';
import { CnpTemplatesComponent } from './create-new-project/cnp-templates/cnp-templates.component';
import { OnboardingWelcomeComponent } from './create-new-project/onboarding-welcome/onboarding-welcome.component';
import { HomeNewsFeedModalComponent } from './home-components/home-news-feed/home-news-feed-modal/home-news-feed-modal.component';
import { AutomationsComponent } from './automations/automations.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { HomeCdsComponent } from './home-components/home-cds/home-cds.component';
import { AutomationStaticComponent } from './static-pages/automation-static/automation-static.component';
// import { KbModalComponent } from './knowledge-bases/kb-modal/kb-modal.component';
// import { KbAlertComponent } from './knowledge-bases/kb-alert/kb-alert.component';

import { IntegrationsComponent } from './integrations/integrations.component';
import { OpenaiIntegrationComponent } from './integrations/list/openai-integration/openai-integration.component';
import { QaplaIntegrationComponent } from './integrations/list/qapla-integration/qapla-integration.component';
import { CustomerioIntegrationComponent } from './integrations/list/customerio-integration/customerio-integration.component';
import { HubspotIntegrationComponent } from './integrations/list/hubspot-integration/hubspot-integration.component';
import { BrevoIntegrationComponent } from './integrations/list/brevo-integration/brevo-integration.component';
import { GsheetsIntegrationComponent } from './integrations/list/gsheets-integration/gsheets-integration.component';
import { MakeIntegrationComponent } from './integrations/list/make-integration/make-integration.component';
import { IntegrationHeaderComponent } from './integrations/base-components/integration-header/integration-header.component';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { ModalPageUrlComponent } from './knowledge-bases/modals/modal-page-url/modal-page-url.component';
import { ModalSiteMapComponent } from './knowledge-bases/modals/modal-site-map/modal-site-map.component';
import { ModalTextFileComponent } from './knowledge-bases/modals/modal-text-file/modal-text-file.component';
import { ModalGptKeyComponent } from './knowledge-bases/modals/modal-gpt-key/modal-gpt-key.component';
import { ModalDeleteKnowledgeBaseComponent } from './knowledge-bases/modals/modal-delete-knowledge-base/modal-delete-knowledge-base.component';
import { ModalPreviewKnowledgeBaseComponent } from './knowledge-bases/modals/modal-preview-knowledge-base/modal-preview-knowledge-base.component';
import { ModalDetailKnowledgeBaseComponent } from './knowledge-bases/modals/modal-detail-knowledge-base/modal-detail-knowledge-base.component';
import { KnowledgeBaseTableComponent } from './knowledge-bases/modals/knowledge-base-table/knowledge-base-table.component';
import { ModalErrorComponent } from './knowledge-bases/modals/modal-error/modal-error.component';
import { KnowledgeBasesPreviousComponent } from './knowledge-bases-previous/knowledge-bases-previous.component';
import { UserModalComponent } from './users/user-modal/user-modal.component';
import { MessagesStatsModalComponent } from './components/modals/messages-stats-modal/messages-stats-modal.component';




// NOTE: Eliminazione del local storage produce inconsistenza delle instances Firebase. Si salta il logout.

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
    OnlynumberDirective,
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
    AnalyticsComponent,
    PanoramicaComponent,
    MetricsComponent,
    RealtimeComponent,
    RequestsComponent,
    SentimentComponent,
    ResponseTimesComponent,
    ConvsDurationComponent,
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
    SafeHtmlPipe,
    UnauthorizedForProjectComponent,
    HtmlEntitiesEncodePipe,
    NotificationEmailComponent,
    SmtpSettingsComponent,
    SettingsSidebarComponent,
    WidgetPrechatFormComponent,
    NativeBotSidebarComponent,
    NativeBotComponent,
    NativeBotSelectTypeComponent,
    EmailTicketingComponent,
    WsSidebarAppsComponent,
    AppCreateComponent,
    RasaBotComponent,
    ImageViewerComponent,
    WidgetInstallationComponent,
    AutofocusDirective,
    TilebotSelectTypeComponent,
    TilebotSidebarComponent,
    TilebotComponent,
    OnboardingComponent,
    WelcomeMessageConfigurationComponent,
    ChatbotConfigurationComponent,
    HumanConfigurationComponent,
    ErrorResultComponent,
    CodeInstallationComponent,
    JsInstallationComponent,
    GoogleTagManagerInstallationComponent,
    ShopifyInstallationComponent,
    WordpressInstallationComponent,
    PrestashopInstallationComponent,
    JoomlaInstallationComponent,
    TilebotFormComponent, 
    ModalDeleteComponent, 
    TilebotAddEditFormComponent, 
    TilebotListFieldsFormComponent, 
    ChatbotSetupComponent, 
    SidebarClaimsComponent, 
    NetworkOfflineComponent, 
    HomePromoBannerComponent, 
    TemplatesComponent, 
    TemplateDetailComponent, 
    BotsSidebarComponent, 
    GetStartChatbotForkComponent, 
    InstallTemplateComponent, 
    CreateChatbotComponent,
    OnboardingWidgetComponent, 
    CommunityTemplateDtlsComponent, 
    HomePromoDesignStudioComponent,
    PasswordStrengthComponent,
    CloneBotComponent,
    ContactsStaticComponent,
    CannedResponsesStaticComponent,
    UpgradePlanModalComponent,
    WsrequestsStaticComponent,
    EmailTicketingStaticComponent,
    OnboardingContentComponent,
    CnpProjectNameComponent,
    CnpQuestionSelectComponent,
    CnpQuestionButtonComponent,
    CnpChatbotWelcomeMessageComponent,
    CnpWidgetInstallationComponent,
    LoadingSectionComponent,
    ActivateAppsumoProductComponent,
    ContactCustomPropertiesComponent,
    ContactInfoComponent,
    CreateProjectGsComponent,
    KnowledgeBasesComponent,
    HomeConvsGraphComponent,
    HomeWhatsappAccountComponent,
    HomeCreateChatbotComponent,
    HomeNewsFeedComponent,
    HomeAnalyticsIndicatorComponent,
    HomeWhatsappAccountWizardComponent,
    HomeWhatsappAccountWizardModalComponent,
    HomeCustomizeWidgetComponent,
    HomeCreateTeammateComponent,
    CnpIsMobileComponent,
    HomeKbComponent,
    HomeKbModalComponent,
    HomeCreateChatbotModalComponent,
    HomeInviteTeammateModalComponent,
    HomeInviteTeammateErrorModalComponent,
    HomeGoToChatComponent,
    ChatbotModalComponent,
    ChatbotAlertComponent,
    CnpTemplatesComponent,
    OnboardingWelcomeComponent,
    HomeNewsFeedModalComponent,
    AutomationsComponent,
    HomeCdsComponent,
    AutomationStaticComponent,
    // KbModalComponent,
    // KbAlertComponent,
    IntegrationsComponent,
    OpenaiIntegrationComponent,
    QaplaIntegrationComponent,
    CustomerioIntegrationComponent,
    HubspotIntegrationComponent,
    MakeIntegrationComponent,
    BrevoIntegrationComponent,
    GsheetsIntegrationComponent,
    IntegrationHeaderComponent,
    ModalPageUrlComponent,
    ModalSiteMapComponent,
    ModalTextFileComponent,
    ModalGptKeyComponent,
    ModalDeleteKnowledgeBaseComponent,
    ModalPreviewKnowledgeBaseComponent,
    ModalDetailKnowledgeBaseComponent,
    KnowledgeBaseTableComponent,
    ModalErrorComponent,
    KnowledgeBasesPreviousComponent,
    UserModalComponent,
    MessagesStatsModalComponent
  ],
  imports: [
    TooltipModule.forRoot(CutomTooltipOptions as TooltipOptions),
    NgApexchartsModule,
    DragDropModule,
    CreditCardDirectivesModule,
    NgImageSliderModule,
    MomentModule,
    NgxMatTimepickerModule,
    ColorPickerModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatMenuModule,
    MatSelectModule,
    MatToolbarModule,
    MatTabsModule,
    MatExpansionModule,
    MatDialogModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    /* PRIVATE */
    PricingModule,
    ChatbotDesignStudioModule,
    /* PRIVATE */
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
    UiModule,
    ComponentsModule,
    RouterModule,
    HttpClientModule,
    SatPopoverModule,
    NgxSkeletonLoaderModule,
    // CreditCardDirectivesModule,
    // MomentModule,
    // AmazingTimePickerModule,
    // ColorPickerModule,
    // MyDatePickerModule,
    // SlideshowModule,
    NgSelectModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    AppConfigService, // https://juristr.com/blog/2018/01/ng-app-runtime-config/
    BrandService,
    LoggerService,
    HomeService,
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
    ActivitiesService,
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
    UrlService,
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
    AnalyticsService,
    HttpClientModule,
    TriggerService,
    SelectOptionsTranslatePipe,
    FilterArrayPipe,
    MarkerService,
    // LoggerInstance,
    OpenaiService,
    PopupService,
    NotificationService,
    { provide: LocationStrategy, useClass: HashLocationStrategy }
  ],
  bootstrap: [
    AppComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {
  // constructor() {
  //   firebase.initializeApp(firebaseConfig);
  // }
}
