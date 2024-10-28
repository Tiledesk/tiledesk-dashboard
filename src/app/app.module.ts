import { NotificationService } from './services/notification.service';
import { PopupService } from './services/popup.service';
import { MarkerService } from './services/marker.service';
import { LoggerService } from './services/logger/logger.service';
import { HomeService } from './services/home.service';
import { ActivitiesService } from './activities/activities-service/activities.service';


// import { LoggerInstance } from './services/logger/LoggerInstance';
// import { MapRequestComponent } from './map-request/map-request.component'; // now lazy

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

// import { HomeComponent } from './home/home.component'; //now lazy
// new home comp
// import { HomeConvsGraphComponent } from './home-components/home-convs-graph/home-convs-graph.component'; //now lazy
// import { HomeWhatsappAccountComponent } from './home-components/home-whatsapp-account/home-whatsapp-account.component'; // now lazy
// import { HomeCreateChatbotComponent } from './home-components/home-create-chatbot/home-create-chatbot.component'; // now lazy
// import { HomeNewsFeedComponent } from './home-components/home-news-feed/home-news-feed.component'; // now lazy
// import { HomeAnalyticsIndicatorComponent } from './home-components/home-analytics-indicator/home-analytics-indicator.component'; // now lazy
// import { HomeWhatsappAccountWizardComponent } from './home-components/home-whatsapp-account-wizard/home-whatsapp-account-wizard.component'; // now lazy
// import { HomeWhatsappAccountWizardModalComponent } from './home-components/home-whatsapp-account-wizard/home-whatsapp-account-wizard-modal/home-whatsapp-account-wizard-modal.component'; // now lazy
// import { HomeCustomizeWidgetComponent } from './home-components/home-customize-widget/home-customize-widget.component'; // now lazy
// import { HomeCreateTeammateComponent } from './home-components/home-create-teammate/home-create-teammate.component'; // now lazy
// import { HomeKbComponent } from './home-components/home-kb/home-kb.component'; // now lazy
// ./new home comp 


import { ChatComponent } from './chat/chat.component';

import { UsersService } from './services/users.service';
import { ContactsService } from './services/contacts.service';
// import { ContactsComponent } from './contacts/contacts.component'; // now lazy
// import { ContactEditComponent } from './contact-edit/contact-edit.component'; // now lazy
// import { ContactDetailsComponent } from './contact-details/contact-details.component'; // now lazy

import { DepartmentService } from './services/department.service';
// import { DepartmentsComponent } from './departments/departments.component'; // now lazy

import { FaqService } from './services/faq.service';
import { UrlService } from './services/shared/url.service';

// import { ProjectsComponent } from './projects/projects.component'; // now lazy
// import { ProjectsForPanelComponent } from './projects/for-panel/projects-for-panel/projects-for-panel.component'; // removed

// import { UsersComponent } from './users/users.component'; // now lazy


// BOTS & FAQ
import { FaqKbService } from './services/faq-kb.service';
// import { BotListComponent } from './bots/bots-list/bots-list.component'; // // now lazy
import { BotTypeSelectComponent } from './bots/bot-create/bot-type-select/bot-type-select.component';
import { BotCreateComponent } from './bots/bot-create/bot-create.component';
import { FaqEditAddComponent } from './bots/faq-edit-add/faq-edit-add.component';
import { FaqComponent } from './bots/faq/faq.component';
import { FaqTestComponent } from './bots/faq-test/faq-test.component';
import { FaqTestTrainBotComponent } from './bots/faq-test/faq-test-train-bot/faq-test-train-bot.component';
import { FaqSidebarComponent } from './bots/faq/faq-sidebar/faq-sidebar.component'; // fake comp used for a demo

import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { HashLocationStrategy, LocationStrategy } from '@angular/common';
// import { DepartmentEditAddComponent } from './department-edit-add/department-edit-add.component'; // now lazy
// import { ProjectEditAddComponent } from './project-edit-add/project-edit-add.component'; // now lazy

import { ProjectService } from './services/project.service';
// import { RequestsListHistoryComponent } from './requests-list-history/requests-list-history.component';

// import { SigninComponent } from './auth/signin/signin.component'; // now lazy
// import { SignupComponent } from './auth/signup/signup.component'; // now lazy
import { UnauthorizedComponent } from './auth/unauthorized/unauthorized.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// import { UserEditAddComponent } from './user-edit-add/user-edit-add.component'; // now lazy
import { LocalDbService } from './services/users-local-db.service';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { GroupService } from './services/group.service';
// import { GroupsComponent } from './groups/groups.component'; // now lazy
// import { GroupEditAddComponent } from './group-edit-add/group-edit-add.component'; // now lazy

import { BotLocalDbService } from './services/bot-local-db.service';
// import { ChangePasswordComponent } from './user-profile//change-password/change-password.component'; // now lazy

// PIPE
import { GroupNamePipe } from './groupname.pipe';
// import { SortByPipe } from './sortby.pipe'; // now lazy
import { SortByDesPipe } from './sortbydes.pipe';
import { MapToIterable } from './map-to-iterable-pipe';
// import { SelectOptionsTranslatePipe } from './selectOptionsTranslate.pipe';
import { FilterArrayPipe } from './filterarray.pipe';
// import { MarkedPipe } from './marked.pipe'; // moved in SharedModule

// import { HoursComponent } from './hours/hours.component'; // now lazy
import { NgSelectModule } from '@ng-select/ng-select';
// import { ResetPswComponent } from './reset-psw/reset-psw.component';  // now lazy
import { ResetPswService } from './services/reset-psw.service';

import { UploadImageService } from './services/upload-image.service';
import { UploadImageNativeService } from './services/upload-image-native.service';


// import { HistoryAndNortConvsComponent } from './ws_requests/history-and-nort-convs/history-and-nort-convs.component'; // now lazy
import { WidgetService } from './services/widget.service';

import { ActivitiesComponent } from './activities/activities.component';

// import { AnalyticsStaticComponent } from './static-pages/analytics-static/analytics-static.component'; // now lazy
// import { ActivitiesStaticComponent } from './static-pages/activities-static/activities-static.component'; // now lazy

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// import { AnalyticsComponent } from './analytics/analytics.component'; // now lazy
// import { EventsAnalyticsComponent } from './analytics/metrics/events-analytics/events-analytics.component'; // now lazy
// import { ConvsDurationComponent } from './analytics/metrics/convsduration/convsduration.component'; // now lazy
// import { MessagesComponent } from './analytics/metrics/messages/messages.component'; // now lazy
// import { RequestsComponent } from './analytics/metrics/requests/requests.component'; // now lazy
// import { MetricsComponent } from './analytics/metrics/metrics.component'; // now lazy
// import { ResponseTimesComponent } from './analytics/metrics/responsetimes/responsetimes.component'; // now lazy 
// import { SatisfactionComponent } from './analytics/metrics/satisfaction/satisfaction.component';  // now lazy 
// import { SentimentComponent } from './analytics/metrics/sentiment/sentiment.component'; // now lazy
// import { VisitorsAnalyticsComponent } from './analytics/metrics/visitors-analytics/visitors-analytics.component'; // now lazy
// import { PanoramicaComponent } from './analytics/panoramica/panoramica.component'; // now lazy
// import { RealtimeComponent } from './analytics/realtime/realtime.component'; // now lazy


// import { HoursStaticComponent } from './static-pages/hours-static/hours-static.component'; // now lazy
// import { DepartmentsStaticComponent } from './static-pages/departments-static/departments-static.component'; // now lazy
import { ProjectPlanService } from './services/project-plan.service';
import { TriggerComponent } from './trigger/trigger.component';
import { BasetriggerComponent } from './trigger/basetrigger/basetrigger.component';
import { TriggerService } from './services/trigger.service';
import { TriggerAddComponent } from './trigger/trigger-add/trigger-add.component';
import { TriggerEditComponent } from './trigger/trigger-edit/trigger-edit.component';


/* PRIVATE */
// import { PricingModule } from './pricing/pricing.module'; // lazy loading

// import { StaticPageBaseComponent } from './static-pages/static-page-base/static-page-base.component'; // deleted

// import { GroupsStaticComponent } from './static-pages/groups-static/groups-static.component'; // now lazy

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
// import { WsRequestsListComponent } from './ws_requests/ws-requests-list/ws-requests-list.component'; // now lazy
import { WsRequestsService } from './services/websocket/ws-requests.service';
// import { WsRequestsMsgsComponent } from './ws_requests/ws-requests-msgs/ws-requests-msgs.component'; // now lazy
import { WsMsgsService } from './services/websocket/ws-msgs.service';
import { WsSharedComponent } from './ws_requests/ws-shared/ws-shared.component';
// import { WsTrainBotComponent } from './ws_requests/ws-requests-msgs/ws-train-bot/ws-train-bot.component';  // now removed
import { WebSocketJs } from './services/websocket/websocket-js';
import { WidgetMultilanguageComponent } from './widget_components/widget-multilanguage/widget-multilanguage.component';  // now lazy
// import { BaseTranslationComponent } from './widget_components/widget-multilanguage/base-translation/base-translation.component'; // now lazy
import { WidgetSharedComponent } from './widget_components/widget-shared/widget-shared.component';
import { WidgetSetUpBaseComponent } from './widget_components/widget-set-up/widget-set-up-base/widget-set-up-base.component';
// import { WsRequestsServedComponent } from './ws_requests/ws-requests-list/ws-requests-served/ws-requests-served.component'; // now lazy
// import { WsRequestsUnservedComponent } from './ws_requests/ws-requests-list/ws-requests-unserved/ws-requests-unserved.component'; // now lazy
import { CloseRequestModalComponent } from './ws_requests/modals/close-request-modal/close-request-modal.component';
import { LoadingPageComponent } from './loading-page/loading-page.component';
import { BotsBaseComponent } from './bots/bots-base/bots-base.component';
// import { CannedResponsesListComponent } from './canned-responses/canned-responses-list.component'; // now lazy
// import { CannedResponsesAddEditComponent } from './canned-responses/canned-responses-add-edit/canned-responses-add-edit.component'; // now lazy
import { CannedResponsesService } from './services/canned-responses.service';
import { TagsService } from './services/tags.service';
// import { TagsComponent } from './tags/tags.component'; // now lazy
// import { TagsDeleteComponent } from './tags/tags-delete/tags-delete.component'; // now lazy
// import { TagsEditComponent } from './tags/tags-edit/tags-edit.component'; // now lazy
// import { TriggerStaticComponent } from './static-pages/trigger-static/trigger-static.component'; // now lazy
import { AccountSettingsComponent } from './user-profile/account-settings/account-settings.component';




// import { WsRequestsUnservedForPanelComponent } from './ws_requests/for-panel/ws-requests-unserved-for-panel/ws-requests-unserved-for-panel.component'; // now lazy
// import { WsRequestDetailForPanelComponent } from './ws_requests/for-panel//ws-request-detail-for-panel/ws-request-detail-for-panel.component'; // now lazy
import { AutologinComponent } from './auth/autologin/autologin.component';
// APP
// import { AppStoreComponent } from './app-store/app-store.component'; // now lazy
// import { AppStoreInstallComponent } from './app-store/app-store-install/app-store-install.component'; // now lazy
// import { AppCreateComponent } from './app-store/app-create/app-create.component'; // now lazy
import { AppStoreService } from './services/app-store.service';

import { BrandService } from './services/brand.service';
import { ScriptService } from './services/script/script.service';

// import { PerfectScrollbarTdDirective } from './_directives/td-perfect-scrollbar/perfect-scrollbar-td.directive';
import { DocsUrlRowComponent } from './components/docs-url-row/docs-url-row.component';
import { VisitorsComponent } from './visitors/visitors.component';
import { EventsComponent } from './events/events.component';

// import { WidgetSetUp } from './widget_components/widget-set-up/widget-set-up.component'; // now lazy
// import { WidgetHomeComponent } from './widget-home-preview/widget-home.component'; // now lazy
// import { WidgetCalloutComponent } from './widget-callout/widget-callout.component'; // now lazy
// import { WidgetChatComponent } from './widget-chat/widget-chat.component'; // now lazy
// import { WidgetPrechatFormComponent } from './widget-prechat-form/widget-prechat-form.component'; // now lazy


// import { WebhookComponent } from './webhook/webhook.component'; // now lazy
// import { WebhookAddEditComponent } from './webhook/webhook-add-edit/webhook-add-edit.component'; // now lazy
import { WebhookService } from './services/webhook.service';



import { NotificationSettingsComponent } from './user-profile/notification-settings/notification-settings.component';

// import { CreateGroupComponent } from './department-edit-add/create-group/create-group.component'; // now lazy
// import { CreateBotComponent } from './department-edit-add/create-bot/create-bot.component'; // now lazy


import { UnauthorizedForPricingComponent } from './auth/unauthorized-for-pricing/unauthorized-for-pricing.component';

// import { SanitizeHtmlPipe } from './sanitize-html.pipe'; // moved in SharedModule // used for iframe to bypass security 
import { SafeHtmlPipe } from './safe-html.pipe'; // used to sanitize email 
import { UnauthorizedForProjectComponent } from './auth/unauthorized-for-project/unauthorized-for-project.component';

// import { HtmlEntitiesEncodePipe } from './html-entities-encode.pipe';  // moved in SharedModule
// import { NotificationEmailComponent } from './project-edit-add/notification-email/notification-email.component'; now lazy
// import { SmtpSettingsComponent } from './project-edit-add/smtp-settings/smtp-settings.component'; // now lazy
// import { SettingsSidebarComponent } from './components/settings-sidebar/settings-sidebar.component';

import { OnlynumberDirective } from './_directives/onlynumber.directive';
import { NativeBotSidebarComponent } from './bots/native-bot-sidebar/native-bot-sidebar.component';
import { NativeBotComponent } from './bots/native-bot/native-bot.component';
import { NativeBotSelectTypeComponent } from './bots/native-bot-select-type/native-bot-select-type.component';

import { TilebotSelectTypeComponent } from './bots/tilebot-select-type/tilebot-select-type.component';
import { TilebotSidebarComponent } from './bots/tilebot-sidebar/tilebot-sidebar.component';
import { TilebotComponent } from './bots/tilebot/tilebot.component';
import { RasaBotComponent } from './bots/rasa-bot/rasa-bot.component';
// import { TemplatesComponent } from './bots/templates/templates.component'; // now lazy

// import { EmailTicketingComponent } from './email-ticketing/email-ticketing.component'; // now lazy

import { CutomTooltipOptions } from './utils/util';
// import { WsSidebarAppsComponent } from './ws_requests/ws-requests-msgs/ws-sidebar-apps/ws-sidebar-apps.component'; // now lazy
import { ImageViewerComponent } from './ws_requests/ws-requests-msgs/image-viewer/image-viewer.component';
// import { WidgetInstallationComponent } from './widget-installation/widget-installation.component'; // now lazy
import { AutofocusDirective } from './_directives/autofocus.directive';

import { TooltipModule, TooltipOptions } from 'ng2-tooltip-directive';

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
// import { ColorPickerModule } from 'ngx-color-picker';
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


// Custom component widget installation //
// import { CodeInstallationComponent } from './components/widget-installations/code-installation/code-installation.component'; // now lazy
// import { JsInstallationComponent } from './components/widget-installations/js-installation/js-installation.component'; // now lazy
// import { GoogleTagManagerInstallationComponent } from './components/widget-installations/google-tag-manager-installation/google-tag-manager-installation.component' // now lazy
// import { ShopifyInstallationComponent } from './components/widget-installations/shopify-installation/shopify-installation.component'; // now lazy
// import { WordpressInstallationComponent } from './components/widget-installations/wordpress-installation/wordpress-installation.component'; // now lazy
// import { PrestashopInstallationComponent } from './components/widget-installations/prestashop-installation/prestashop-installation.component'; //no lazy
// import { JoomlaInstallationComponent } from './components/widget-installations/joomla-installation/joomla-installation.component'; //no lazy
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
// import { BotsSidebarComponent } from './bots/bots-list/bots-sidebar/bots-sidebar.component'; // now lazy
import { GetStartChatbotForkComponent } from './create-project-wizard/get-start-chatbot-fork/get-start-chatbot-fork.component';
import { InstallTemplateComponent } from './create-project-wizard/install-template/install-template.component';
// import { ChatbotDesignStudioModule } from './chatbot-design-studio/chatbot-design-studio.module'; // now lazy
import { CreateChatbotComponent } from './bots/create-chatbot/create-chatbot.component';
import { OnboardingWidgetComponent } from './create-project-wizard/onboarding-widget/onboarding-widget.component';
import { CommunityTemplateDtlsComponent } from './bots/templates/community-template-dtls/community-template-dtls.component';
import { HomePromoDesignStudioComponent } from './home-promo-design-studio/home-promo-design-studio.component';
// import { PasswordStrengthComponent } from './auth/signup/password-strength/password-strength.component';
import { CloneBotComponent } from './bots/bots-list/clone-bot/clone-bot.component';
// import { ContactsStaticComponent } from './static-pages/contacts-static/contacts-static.component'; // now lazy
// import { CannedResponsesStaticComponent } from './static-pages/canned-responses-static/canned-responses-static.component'; // now lazy
import { UpgradePlanModalComponent } from './components/modals/upgrade-plan-modal/upgrade-plan-modal.component';
// import { WsrequestsStaticComponent } from './static-pages/wsrequests-static/wsrequests-static.component'; // now lazy
// import { EmailTicketingStaticComponent } from './static-pages/email-ticketing-static/email-ticketing-static.component'; // now lazy
import { OnboardingContentComponent } from './create-new-project/onboarding-content/onboarding-content.component';
import { CnpProjectNameComponent } from './create-new-project/cnp-project-name/cnp-project-name.component';
import { CnpQuestionSelectComponent } from './create-new-project/cnp-question-select/cnp-question-select.component';
import { CnpQuestionButtonComponent } from './create-new-project/cnp-question-button/cnp-question-button.component';
import { CnpChatbotWelcomeMessageComponent } from './create-new-project/cnp-chatbot-welcome-message/cnp-chatbot-welcome-message.component';
// import { CnpWidgetInstallationComponent } from './create-new-project/cnp-widget-installation/cnp-widget-installation.component'; // no more used
import { CnpIsMobileComponent } from './create-new-project/cnp-is-mobile/cnp-is-mobile.component';
import { LoadingSectionComponent } from './create-new-project/loading-section/loading-section.component';
import { ActivateAppsumoProductComponent } from './create-project-wizard/activate-appsumo-product/activate-appsumo-product.component';
import { ContactCustomPropertiesComponent } from './components/modals/contact-custom-properties/contact-custom-properties.component';
// import { ContactInfoComponent } from './components/shared/contact-info/contact-info.component'; // now lazy
import { CreateProjectGsComponent } from './create-project-wizard/create-project-gs/create-project-gs.component';



import { OpenaiService } from './services/openai.service';
import { HomeKbModalComponent } from './home-components/home-kb/home-kb-modal/home-kb-modal.component';
import { HomeCreateChatbotModalComponent } from './home-components/home-create-chatbot/home-create-chatbot-modal/home-create-chatbot-modal.component';
import { HomeInviteTeammateModalComponent } from './home-components/home-create-teammate/home-invite-teammate-modal/home-invite-teammate-modal.component';
import { HomeInviteTeammateErrorModalComponent } from './home-components/home-create-teammate/home-invite-teammate-error-modal/home-invite-teammate-error-modal.component';
// import { HomeGoToChatComponent } from './home-components/home-go-to-chat/home-go-to-chat.component'; // now lazy
import { ChatbotModalComponent } from './bots/bots-list/chatbot-modal/chatbot-modal.component';
// import { ChatbotAlertComponent } from './bots/bots-list/chatbot-alert/chatbot-alert.component'; // now lazy
// import { KnowledgeBasesComponent } from './knowledge-bases/knowledge-bases.component'; // now lazy
import { CnpTemplatesComponent } from './create-new-project/cnp-templates/cnp-templates.component';
import { OnboardingWelcomeComponent } from './create-new-project/onboarding-welcome/onboarding-welcome.component';
import { HomeNewsFeedModalComponent } from './home-components/home-news-feed/home-news-feed-modal/home-news-feed-modal.component';
// import { AutomationsComponent } from './automations/automations.component'; // now lazy
import { MatAutocompleteModule } from '@angular/material/autocomplete';
// import { HomeCdsComponent } from './home-components/home-cds/home-cds.component'; // now lazy
// import { AutomationStaticComponent } from './static-pages/automation-static/automation-static.component'; // now lazy
// import { KbModalComponent } from './knowledge-bases/kb-modal/kb-modal.component';
// import { KbAlertComponent } from './knowledge-bases/kb-alert/kb-alert.component';

// import { IntegrationsComponent } from './integrations/integrations.component'; // now lazy
// import { OpenaiIntegrationComponent } from './integrations/list/openai-integration/openai-integration.component'; // now lazy
// import { QaplaIntegrationComponent } from './integrations/list/qapla-integration/qapla-integration.component'; // now lazy
// import { CustomerioIntegrationComponent } from './integrations/list/customerio-integration/customerio-integration.component'; // now lazy
// import { HubspotIntegrationComponent } from './integrations/list/hubspot-integration/hubspot-integration.component'; // now lazy
// import { BrevoIntegrationComponent } from './integrations/list/brevo-integration/brevo-integration.component'; // now lazy
// import { GsheetsIntegrationComponent } from './integrations/list/gsheets-integration/gsheets-integration.component'; // now lazy
// import { MakeIntegrationComponent } from './integrations/list/make-integration/make-integration.component'; // now lazy
// import { IntegrationHeaderComponent } from './integrations/base-components/integration-header/integration-header.component'; // now lazy

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
// import { ModalPageUrlComponent } from './knowledge-bases/modals/modal-page-url/modal-page-url.component'; // now lazy
// import { ModalSiteMapComponent } from './knowledge-bases/modals/modal-site-map/modal-site-map.component'; // now lazy
// import { ModalTextFileComponent } from './knowledge-bases/modals/modal-text-file/modal-text-file.component'; // now lazy
// import { ModalGptKeyComponent } from './knowledge-bases/modals/modal-gpt-key/modal-gpt-key.component'; // now lazy
// import { ModalDeleteKnowledgeBaseComponent } from './knowledge-bases/modals/modal-delete-knowledge-base/modal-delete-knowledge-base.component'; // now lazy
// import { ModalPreviewKnowledgeBaseComponent } from './knowledge-bases/modals/modal-preview-knowledge-base/modal-preview-knowledge-base.component'; // now lazy
// import { ModalDetailKnowledgeBaseComponent } from './knowledge-bases/modals/modal-detail-knowledge-base/modal-detail-knowledge-base.component'; // now lazy
// import { KnowledgeBaseTableComponent } from './knowledge-bases/modals/knowledge-base-table/knowledge-base-table.component'; // now lazy
// import { ModalErrorComponent } from './knowledge-bases/modals/modal-error/modal-error.component'; // now lazy
// import { KnowledgeBasesPreviousComponent } from './knowledge-bases-previous/knowledge-bases-previous.component'; // now lazy
// import { ModalUrlsKnowledgeBaseComponent } from './knowledge-bases/modals/modal-urls-knowledge-base/modal-urls-knowledge-base.component'; // now lazy
// import { AddContentMenuComponent } from './knowledge-bases/menu/add-content-menu/add-content-menu.component'; // now lazy
import { UserModalComponent } from './users/user-modal/user-modal.component';
import { MessagesStatsModalComponent } from './components/modals/messages-stats-modal/messages-stats-modal.component';
import { WsChatbotService } from './services/websocket/ws-chatbot.service';
import { AnalyticsService } from './services/analytics.service';
// import { N8nIntegrationComponent } from './integrations/list/n8n-integration/n8n-integration.component'; // now lazy
import { KnowledgeBasesAlertComponent } from './knowledge-bases/knowledge-bases-alert/knowledge-bases-alert.component';
import { LogRequestsInterceptor } from './services/interceptor/log-requests.interceptor';
import { CnpSelectTemplatesOrKbComponent } from './create-new-project/cnp-select-templates-or-kb/cnp-select-templates-or-kb.component';
import { RoleService } from './services/role.service';
// import { PasswordStrengthModule } from './auth/signup/password-strength/password-strength.module';
// import { ModalChatbotReassignmentComponent } from './modal-chatbot-reassignment/modal-chatbot-reassignment.component';

// import { ModalAddNamespaceComponent } from './knowledge-bases/modals/modal-add-namespace/modal-add-namespace.component';
// import { ModalUploadFileComponent } from './knowledge-bases/modals/modal-upload-file/modal-upload-file.component';
// import { ModalChatbotNameComponent } from './knowledge-bases/modals/modal-chatbot-name/modal-chatbot-name.component';



// NOTE: Eliminazione del local storage produce inconsistenza delle instances Firebase. Si salta il logout.

// console.log('************** APPMODULE ******************');
// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const appInitializerFn = (appConfig: AppConfigService, brandService: BrandService) => {
  return async () => {
    // console.log('APP INITIALIZED')
    
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
    // HomeComponent, // now lazy
    // ContactsComponent, // now lazy
    ChatComponent,
    // DepartmentsComponent,  // now lazy
    FaqComponent,
    // ProjectsComponent, // now lazy
    // UsersComponent, // now lazy
    // BotListComponent, // now lazy
    BotCreateComponent,
    FaqEditAddComponent,
    // DepartmentEditAddComponent, // now lazy
    // ProjectEditAddComponent, // now lazy
    // RequestsListHistoryComponent,
    // SigninComponent, // now lazy
    // SignupComponent, // now lazy
    UnauthorizedComponent,
    FaqTestComponent,
    // UserEditAddComponent, // now lazy
    VerifyEmailComponent,
    // GroupsComponent, // now lazy
    // GroupEditAddComponent, // now lazy
    GroupNamePipe,
    // SortByPipe, // now lazy
    SortByDesPipe,
    MapToIterable,
    // SelectOptionsTranslatePipe, moved in SharedModule
    FilterArrayPipe,
    // ChangePasswordComponent, // now lazy
    // HoursComponent, // now lazy
    // ResetPswComponent, // now lazy
   // WidgetSetUp, // now lazy
    // HistoryAndNortConvsComponent, // now lazy
    // ContactDetailsComponent, // now lazy
    // ContactEditComponent, // now lazy
    ActivitiesComponent,
    // AnalyticsStaticComponent, // now lazy
    // ActivitiesStaticComponent, // now lazy
    FaqTestTrainBotComponent,
    // AnalyticsComponent, // now lazy
    // ConvsDurationComponent,  // now lazy
    // EventsAnalyticsComponent, // now lazy
    // MessagesComponent, // now lazy
    // RequestsComponent, // now lazy
    // MetricsComponent, // now lazy
    // ResponseTimesComponent, // now lazy
    // SatisfactionComponent, // now lazy
    // SentimentComponent, // now lazy
    // VisitorsAnalyticsComponent, // now lazy
    // PanoramicaComponent, // now lazy
    // RealtimeComponent, // now lazy
    // HoursStaticComponent, // now lazy
    // DepartmentsStaticComponent, // now lazy
    // StaticPageBaseComponent, //deleted
    // GroupsStaticComponent, // now lazy
    TriggerComponent,
    TriggerAddComponent,
    TriggerEditComponent,
    BasetriggerComponent,
    FaqSidebarComponent,
    CreateProjectComponent,
    InstallWidgetComponent,
    HandleInvitationComponent,
    // WsRequestsListComponent, // now lazy
    // WsRequestsMsgsComponent, // now lazy
    WsSharedComponent,
    // WsTrainBotComponent, // now removed
    // WidgetMultilanguageComponent,   // now lazy
    // BaseTranslationComponent, // now lazy
    WidgetSharedComponent,
    WidgetSetUpBaseComponent,
    // WsRequestsServedComponent, // now lazy
    // WsRequestsUnservedComponent, // now lazy
    CloseRequestModalComponent,
    LoadingPageComponent,
    BotTypeSelectComponent,
    BotsBaseComponent,
    // CannedResponsesListComponent, // now lazy
    // CannedResponsesAddEditComponent, // now lazy
    // TagsComponent, // now lazy
    // TagsDeleteComponent, // now lazy
    // TagsEditComponent, // now lazy
    // TriggerStaticComponent, // now lazy
    AccountSettingsComponent,
    // ProjectsForPanelComponent, // removed
    // WsRequestsUnservedForPanelComponent, // now lazy
    // WsRequestDetailForPanelComponent, // now lazy
    AutologinComponent,
    // AppStoreComponent, // now lazy
    // AppStoreInstallComponent, // now lazy
    // AppCreateComponent, // now lazy
    // PerfectScrollbarTdDirective,
    DocsUrlRowComponent,
    VisitorsComponent,
    EventsComponent,
    // WidgetHomeComponent, // now lazy
    // WidgetCalloutComponent, // now lazy
    ConfigureWidgetComponent,
    // WidgetChatComponent, // now lazy
    // WebhookComponent, // now lazy
    // WebhookAddEditComponent,
    // MapRequestComponent, // now lazy
    NotificationSettingsComponent,
    // CreateGroupComponent, // now lazy
    // CreateBotComponent, // now lazy
    UnauthorizedForPricingComponent,
    // MarkedPipe, // moved in SharedModule
    // HtmlEntitiesEncodePipe, // moved in SharedModule
    // SanitizeHtmlPipe, // moved in SharedModule
    SafeHtmlPipe,
    UnauthorizedForProjectComponent,
    // NotificationEmailComponent, // now lazy
    // SmtpSettingsComponent, // now lazy
    // SettingsSidebarComponent,
    // WidgetPrechatFormComponent, // now lazy
    NativeBotSidebarComponent,
    NativeBotComponent,
    NativeBotSelectTypeComponent,
    // EmailTicketingComponent, // now lazy
    // WsSidebarAppsComponent, // now lazy
    RasaBotComponent,
    ImageViewerComponent,
    // WidgetInstallationComponent,  // now lazy
    AutofocusDirective,
    TilebotSelectTypeComponent,
    TilebotSidebarComponent,
    TilebotComponent,
    OnboardingComponent,
    WelcomeMessageConfigurationComponent,
    ChatbotConfigurationComponent,
    HumanConfigurationComponent,
    ErrorResultComponent,
    // CodeInstallationComponent, // now lazy
    // JsInstallationComponent, // now lazy
    // GoogleTagManagerInstallationComponent, // now lazy
    // ShopifyInstallationComponent, // now lazy
    // WordpressInstallationComponent, // now lazy
    // PrestashopInstallationComponent, // now lazy
    // JoomlaInstallationComponent, // now lazy
    TilebotFormComponent, 
    ModalDeleteComponent, 
    TilebotAddEditFormComponent, 
    TilebotListFieldsFormComponent, 
    ChatbotSetupComponent, 
    SidebarClaimsComponent, 
    NetworkOfflineComponent, 
    HomePromoBannerComponent, 
    // TemplatesComponent, // now lazy
    TemplateDetailComponent, 
    // BotsSidebarComponent,  // now lazy
    GetStartChatbotForkComponent, 
    InstallTemplateComponent, 
    CreateChatbotComponent,
    OnboardingWidgetComponent, 
    CommunityTemplateDtlsComponent, 
    HomePromoDesignStudioComponent,
    // PasswordStrengthComponent,
    CloneBotComponent,
    // ContactsStaticComponent, // now lazy
    // CannedResponsesStaticComponent, // now lazy
    UpgradePlanModalComponent,
    // WsrequestsStaticComponent, // now lazy
    // EmailTicketingStaticComponent, // now lazy
    OnboardingContentComponent,
    CnpProjectNameComponent,
    CnpQuestionSelectComponent,
    CnpQuestionButtonComponent,
    CnpChatbotWelcomeMessageComponent,
    // CnpWidgetInstallationComponent, // no more used
    LoadingSectionComponent,
    ActivateAppsumoProductComponent,
    ContactCustomPropertiesComponent,
    // ContactInfoComponent, ContactInfoComponent
    CreateProjectGsComponent, // now lazy
    // KnowledgeBasesComponent, // now lazy
    // HomeConvsGraphComponent, // now lazy
    // HomeWhatsappAccountComponent, // now lazy
    // HomeCreateChatbotComponent, // now lazy
    // HomeNewsFeedComponent, // now lazy
    // HomeAnalyticsIndicatorComponent, // now lazy
    // HomeWhatsappAccountWizardComponent, // now lazy
    // HomeWhatsappAccountWizardModalComponent, // now lazy
    // HomeCustomizeWidgetComponent, // now lazy
    // HomeCreateTeammateComponent, // now lazy
    // HomeKbComponent, // now lazy
    CnpIsMobileComponent,
    HomeKbModalComponent,
    HomeCreateChatbotModalComponent,
    HomeInviteTeammateModalComponent,
    HomeInviteTeammateErrorModalComponent,
    // HomeGoToChatComponent, // now lazy
    ChatbotModalComponent,
    // ChatbotAlertComponent, // now lazy
    CnpTemplatesComponent,
    OnboardingWelcomeComponent,
    HomeNewsFeedModalComponent,
    // AutomationsComponent, // now lazy
    // HomeCdsComponent, // now lazy
    // AutomationStaticComponent, // now lazy
    // KbModalComponent,
    // KbAlertComponent,
    // IntegrationsComponent, // now lazy
    // OpenaiIntegrationComponent, // now lazy
    // QaplaIntegrationComponent, // now lazy
    // CustomerioIntegrationComponent, // now lazy
    // HubspotIntegrationComponent, // now lazy
    // MakeIntegrationComponent, // now lazy
    // BrevoIntegrationComponent, // now lazy
    // GsheetsIntegrationComponent, // now lazy
    // IntegrationHeaderComponent, // now lazy
    // ModalPageUrlComponent, // now lazy
    // ModalSiteMapComponent, // now lazy
    // ModalTextFileComponent, // now lazy
    // ModalGptKeyComponent, // now lazy
    // ModalDeleteKnowledgeBaseComponent, // now lazy
    // ModalPreviewKnowledgeBaseComponent, // now lazy
    // ModalDetailKnowledgeBaseComponent, // now lazy
    // KnowledgeBaseTableComponent, // now lazy
    // ModalErrorComponent, // now lazy
    // KnowledgeBasesPreviousComponent, // now lazy
    // ModalUrlsKnowledgeBaseComponent, // now lazy
    // AddContentMenuComponent, // now lazy
    UserModalComponent,
    MessagesStatsModalComponent,
    // N8nIntegrationComponent,
    KnowledgeBasesAlertComponent,
    CnpSelectTemplatesOrKbComponent,
    // ModalChatbotReassignmentComponent,
    // ModalAddNamespaceComponent,
    // ModalUploadFileComponent,
    // ModalChatbotNameComponent
  ],
  imports: [
    TooltipModule.forRoot(CutomTooltipOptions as TooltipOptions),
    NgApexchartsModule,
    DragDropModule,
    CreditCardDirectivesModule,
    NgImageSliderModule,
    MomentModule,
    NgxMatTimepickerModule,
    // ColorPickerModule, // moved in WidgetSetUpModule
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
    // PricingModule, // now lazy
    // ChatbotDesignStudioModule, // now lazy
    /* PRIVATE */
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
    // PasswordStrengthModule,
    UiModule,
    ComponentsModule,
    RouterModule,
    HttpClientModule,
    SatPopoverModule,
    NgxSkeletonLoaderModule,
    // CreditCardDirectivesModule,
    // MomentModule,
    // AmazingTimePickerModule,
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
    // { provide: HTTP_INTERCEPTORS, useClass: LogRequestsInterceptor, multi: true },
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
    WsChatbotService,
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
    // SelectOptionsTranslatePipe, // Moved in moved in SharedModule
    FilterArrayPipe,
    MarkerService,
    // LoggerInstance,
    OpenaiService,
    PopupService,
    NotificationService,
    RoleService,
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
