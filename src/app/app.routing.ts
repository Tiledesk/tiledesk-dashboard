import { OnboardingWidgetComponent } from './create-project-wizard/onboarding-widget/onboarding-widget.component';
// import { MapRequestComponent } from './map-request/map-request.component'; // now lazy
import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';

import { UserProfileComponent } from './user-profile/user-profile.component';

import { AuthGuard } from './core/auth.guard';
import { AdminGuard } from './core/admin.guard';
import { ProjectProfileGuard } from './core/project-profile.guard';
import { PendingChangesGuard } from './core/pending-changes.guard';
import { CoreModule } from './core/core.module';

// import { HomeComponent } from './home/home.component'; // now lazy

// NK

import { VisitorsComponent } from './visitors/visitors.component';
import { EventsComponent } from './events/events.component';


/*** WEBSOCKET ***/ 
// import { WsRequestsListComponent } from './ws_requests/ws-requests-list/ws-requests-list.component'; // now lazy
// import { WsRequestsMsgsComponent } from './ws_requests/ws-requests-msgs/ws-requests-msgs.component';  // now lazy
// import { WsRequestsUnservedForPanelComponent } from './ws_requests/for-panel/ws-requests-unserved-for-panel/ws-requests-unserved-for-panel.component'; // now lazy

import { DepartmentsComponent } from './departments/departments.component';
import { DepartmentEditAddComponent } from './department-edit-add/department-edit-add.component';

// import { ProjectsComponent } from './projects/projects.component'; // now lazy
// import { ProjectsForPanelComponent } from './projects/for-panel/projects-for-panel/projects-for-panel.component'; // removed

import { UsersComponent } from './users/users.component';

// BOTS & FAQ
import { BotListComponent } from './bots/bots-list/bots-list.component';
import { BotTypeSelectComponent } from './bots/bot-create/bot-type-select/bot-type-select.component';
import { BotCreateComponent } from './bots/bot-create/bot-create.component';
import { FaqComponent } from './bots/faq/faq.component';
import { FaqEditAddComponent } from './bots/faq-edit-add/faq-edit-add.component';

import { FaqTestComponent } from './bots/faq-test/faq-test.component';
import { TemplatesComponent } from './bots/templates/templates.component';

import { ProjectEditAddComponent } from './project-edit-add/project-edit-add.component';
// import { RequestsListHistoryComponent } from './requests-list-history/requests-list-history.component';
// import { HistoryAndNortConvsComponent } from './ws_requests/history-and-nort-convs/history-and-nort-convs.component'; // now lazy

// --------------------------------------------------------------------------------------------
// AUTH PAGES
// --------------------------------------------------------------------------------------------
// import { SigninComponent } from './auth/signin/signin.component'; // now lazy
// import { SignupComponent } from './auth/signup/signup.component'; // now lazy
import { UnauthorizedComponent } from './auth/unauthorized/unauthorized.component';
import { UnauthorizedForPricingComponent } from './auth/unauthorized-for-pricing/unauthorized-for-pricing.component';
import { UnauthorizedForProjectComponent } from './auth/unauthorized-for-project/unauthorized-for-project.component';
import { HandleInvitationComponent } from './auth/handle-invitation/handle-invitation.component';
import { AutologinComponent } from './auth/autologin/autologin.component';

import { WidgetSetUp } from './widget_components/widget-set-up/widget-set-up.component';
import { WidgetMultilanguageComponent } from './widget_components/widget-multilanguage/widget-multilanguage.component';

import { UserEditAddComponent } from './user-edit-add/user-edit-add.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';

import { GroupsComponent } from './groups/groups.component';
import { GroupEditAddComponent } from './group-edit-add/group-edit-add.component';
import { GroupsStaticComponent } from './static-pages/groups-static/groups-static.component';
import { ChangePasswordComponent } from './user-profile/change-password/change-password.component';
import { AccountSettingsComponent } from './user-profile/account-settings/account-settings.component';
import { HoursComponent } from './hours/hours.component';
import { ResetPswComponent } from './reset-psw/reset-psw.component';

import { ActivitiesComponent } from './activities/activities.component';

// Andrea
import { ChatComponent } from './chat/chat.component';

import { AnalyticsStaticComponent } from './static-pages/analytics-static/analytics-static.component';
import { ActivitiesStaticComponent } from './static-pages/activities-static/activities-static.component';
import { HoursStaticComponent } from './static-pages/hours-static/hours-static.component';
import { DepartmentsStaticComponent } from './static-pages/departments-static/departments-static.component';
import { ContactsStaticComponent } from './static-pages/contacts-static/contacts-static.component';
import { AutomationStaticComponent } from './static-pages/automation-static/automation-static.component';

// import { AnalyticsComponent } from './analytics/analytics.component'; // now lazy
// import { RequestsComponent } from './analytics/metrics/requests/requests.component'; // now lazy
// import { MessagesComponent } from './analytics/metrics/messages/messages.component'; // now lazy

import { TriggerComponent } from './trigger/trigger.component';
import { TriggerEditComponent } from './trigger/trigger-edit/trigger-edit.component';
import { TriggerAddComponent } from './trigger/trigger-add/trigger-add.component';
import { TriggerStaticComponent } from './static-pages/trigger-static/trigger-static.component';
import { NotificationEmailComponent } from './project-edit-add/notification-email/notification-email.component';
import { SmtpSettingsComponent } from './project-edit-add/smtp-settings/smtp-settings.component';
// import { UserProfileComponent } from './ui/user-profile/user-profile.component';

/* PRIVATE */
// import { PricingComponent } from './pricing/pricing.component'; //  now Lazy
// import { PaymentsListComponent } from './pricing/payments-list/payments-list.component'; // now Lazy
// import { PaymentSuccessPageComponent } from './pricing/payment-success-page/payment-success-page.component'; // now Lazy
// import { PaymentCanceledPageComponent } from './pricing/payment-canceled-page/payment-canceled-page.component'; // now Lazy

import { CreateProjectComponent } from './create-project-wizard/create-project/create-project.component';
import { OnboardingContentComponent } from './create-new-project/onboarding-content/onboarding-content.component';

import { InstallWidgetComponent } from './create-project-wizard/install-widget/install-widget.component';
import { ConfigureWidgetComponent } from './create-project-wizard/configure-widget/configure-widget.component';
import { LoadingPageComponent } from './loading-page/loading-page.component';
import { CannedResponsesListComponent } from './canned-responses/canned-responses-list.component';
import { TagsComponent } from './tags/tags.component';




// @ Apps
// import { AppStoreComponent } from './app-store/app-store.component'; // now lazy
// import { AppStoreInstallComponent } from './app-store/app-store-install/app-store-install.component'; // now lazy
// import { AppCreateComponent } from './app-store/app-create/app-create.component'; // now lazy

import { WebhookComponent } from './webhook/webhook.component';
import { NotificationSettingsComponent } from './user-profile/notification-settings/notification-settings.component';
import { NativeBotComponent } from './bots/native-bot/native-bot.component';
import { NativeBotSelectTypeComponent } from './bots/native-bot-select-type/native-bot-select-type.component';
import { RasaBotComponent } from './bots/rasa-bot/rasa-bot.component';
import { EmailTicketingComponent } from './email-ticketing/email-ticketing.component';
import { WidgetInstallationComponent } from './widget-installation/widget-installation.component';
import { TilebotSelectTypeComponent } from './bots/tilebot-select-type/tilebot-select-type.component';
import { TilebotComponent } from './bots/tilebot/tilebot.component';
import { OnboardingComponent } from './create-project-wizard/onboarding/onboarding.component';
import { GetStartChatbotForkComponent } from './create-project-wizard/get-start-chatbot-fork/get-start-chatbot-fork.component';
import { InstallTemplateComponent } from './create-project-wizard/install-template/install-template.component';
// import { ContactsComponent } from './contacts/contacts.component'; // now lazy
// import { ContactDetailsComponent } from './contact-details/contact-details.component'; // now lazy
// import { ContactEditComponent } from './contact-edit/contact-edit.component'; // now lazy



// import { CdsDashboardComponent } from './chatbot-design-studio/cds-dashboard/cds-dashboard.component'; // now lazy
import { CreateChatbotComponent } from './bots/create-chatbot/create-chatbot.component';
import { CommunityTemplateDtlsComponent } from './bots/templates/community-template-dtls/community-template-dtls.component';
import { CannedResponsesStaticComponent } from './static-pages/canned-responses-static/canned-responses-static.component';
import { WsrequestsStaticComponent } from './static-pages/wsrequests-static/wsrequests-static.component';
import { EmailTicketingStaticComponent } from './static-pages/email-ticketing-static/email-ticketing-static.component';
import { ActivateAppsumoProductComponent } from './create-project-wizard/activate-appsumo-product/activate-appsumo-product.component';
import { CreateProjectGsComponent } from './create-project-wizard/create-project-gs/create-project-gs.component';
import { KnowledgeBasesComponent } from './knowledge-bases/knowledge-bases.component';
import { CnpIsMobileComponent } from './create-new-project/cnp-is-mobile/cnp-is-mobile.component';
import { CnpTemplatesComponent } from './create-new-project/cnp-templates/cnp-templates.component';
import { OnboardingWelcomeComponent } from './create-new-project/onboarding-welcome/onboarding-welcome.component';
import { AutomationsComponent } from './automations/automations.component';


import { KnowledgeBasesPreviousComponent } from './knowledge-bases-previous/knowledge-bases-previous.component';
import { IntegrationsComponent } from './integrations/integrations.component';



const routes: Routes = [



  // Login
  {
    path: 'login',
    loadChildren: () => import('app/auth/signin/signin.module').then(m => m.SigninModule)
  },
  // { path: 'login', component: SigninComponent }, // now lazy

  // Signup
  {
    path: 'signup',
    loadChildren: () => import('app/auth/signup/signup.module').then(m => m.SignupModule)
  },
  // { path: 'signup', component: SignupComponent },// now lazy

  // Signup on invitations
  {
    path: 'signup-on-invitation/:pendinginvitationemail',
    loadChildren: () => import('app/auth/signup/signup.module').then(m => m.SignupModule)
  },
  // { path: 'signup-on-invitation/:pendinginvitationemail', component: SignupComponent }, // now lazy

  // Autologin 
  { path: 'autologin/:route/:token', component: AutologinComponent },


  { path: 'verify/email/:user_id', component: VerifyEmailComponent },

  // Projects
  { path: '', redirectTo: 'projects', pathMatch: 'full' },
  {
    path: 'projects',
    loadChildren: () => import('app/projects/projects.module').then(m => m.ProjectsModule),
    canActivate: [AuthGuard]
  },
  // { path: 'projects', component: ProjectsComponent, canActivate: [AuthGuard] }, // now Lazy

  // Home
  {
    path: 'project/:projectid/home',
    loadChildren: () => import('app/home/home.module').then(m => m.HomeModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/home', component: HomeComponent, canActivate: [AuthGuard] }, // now Lazy


  // Pricing 
  {
    path: 'project/:projectid/pricing',
    loadChildren: () => import('app/pricing/pricing.module').then(m => m.PricingModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/pricing', component: PricingComponent, canActivate: [AuthGuard] }, // now Lazy
  {
    path: 'project/:projectid/chat-pricing',
    loadChildren: () => import('app/pricing/pricing.module').then(m => m.PricingModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/chat-pricing', component: PricingComponent, canActivate: [AuthGuard] }, // now Lazy
  {
    path: 'project/:projectid/payments',
    loadChildren: () => import('app/pricing/payments-list/payments-list.module').then(m => m.PaymentsListModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/payments', component: PaymentsListComponent, canActivate: [AuthGuard] }, // now Lazy
  {
    path: 'project/::projectid/success',
    loadChildren: () => import('app/pricing/payment-success-page/payment-success.module').then(m => m.PaymentSuccessModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/success', component: PaymentSuccessPageComponent, canActivate: [AuthGuard] }, // now Lazy

  {
    path: 'success',
    loadChildren: () => import('app/pricing/payment-success-page/payment-success.module').then(m => m.PaymentSuccessModule),
    canActivate: [AuthGuard]
  },
  // { path: 'success', component: PaymentSuccessPageComponent, canActivate: [AuthGuard] }, // now Lazy
  {
    path: 'project/:projectid/canceled',
    loadChildren: () => import('app/pricing/payment-canceled-page/payment-canceled.module').then(m => m.PaymentCanceledModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/canceled', component: PaymentCanceledPageComponent, canActivate: [AuthGuard] }, // now Lazy

  // CDS
  {
    path: 'project/:projectid/cds/:faqkbid',
    loadChildren: () => import('app/chatbot-design-studio/chatbot-design-studio.module').then(m => m.ChatbotDesignStudioModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/cds/:faqkbid', component: CdsDashboardComponent, canActivate: [AuthGuard] }, // now Lazy

  {
    path: 'project/:projectid/cds/:faqkbid/intent/:intent_id',
    loadChildren: () => import('app/chatbot-design-studio/chatbot-design-studio.module').then(m => m.ChatbotDesignStudioModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/cds/:faqkbid/intent/:intent_id', component: CdsDashboardComponent, canActivate: [AuthGuard] }, // now Lazy

  {
    path: 'project/:projectid/cds/:faqkbid/intent/:intent_id',
    loadChildren: () => import('app/chatbot-design-studio/chatbot-design-studio.module').then(m => m.ChatbotDesignStudioModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/cds/:faqkbid/intent/:intent_id/:calledby', component: CdsDashboardComponent, canActivate: [AuthGuard] }, // now Lazy

  // -----------------------------------------
  // NEW  replace the path ...createfaq and ...editfaq
  // -----------------------------------------
  // old
  // { path: 'project/:projectid/tilebot/intents/:faqkbid/:type', component: TilebotComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/_createfaq/:faqkbid/:bottype/:botlang', component: FaqEditAddComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/_editfaq/:faqkbid/:faqid/:bottype', component: FaqEditAddComponent, canActivate: [AuthGuard] },

  // Analytics
  {
    path: 'project/:projectid/analytics',
    loadChildren: () => import('app/analytics/analytics.module').then(m => m.AnalyticsModule),
    canActivate: [AuthGuard, ProjectProfileGuard]
  },
  // { path: 'project/:projectid/analytics', component: AnalyticsComponent, canActivate: [AuthGuard, ProjectProfileGuard] }, // now lazy

  {
    path: 'project/:projectid/analytics/metrics',
    loadChildren: () => import('app/analytics/analytics.module').then(m => m.AnalyticsModule),
    canActivate: [AuthGuard, ProjectProfileGuard]
  },
  // { path: 'project/:projectid/analytics/metrics', component: AnalyticsComponent, canActivate: [AuthGuard, ProjectProfileGuard] }, // now lazy

  {
    path: 'project/:projectid/analytics/metrics/visitors',
    loadChildren: () => import('app/analytics/analytics.module').then(m => m.AnalyticsModule),
    canActivate: [AuthGuard, ProjectProfileGuard]
  },
  // { path: 'project/:projectid/analytics/metrics/visitors', component: AnalyticsComponent, canActivate: [AuthGuard, ProjectProfileGuard] }, // now lazy

  {
    path: 'project/:projectid/analytics/metrics/messages',
    loadChildren: () => import('app/analytics/analytics.module').then(m => m.AnalyticsModule),
    canActivate: [AuthGuard, ProjectProfileGuard]
  },
  // { path: 'project/:projectid/analytics/metrics/messages', component: AnalyticsComponent, canActivate: [AuthGuard, ProjectProfileGuard] }, // now lazy

  // { path: 'project/:projectid/messages-analytics', component: MessagesComponent, canActivate: [AuthGuard] }, // doesn't works
  // { path: 'project/:projectid/conversation-analytics', component: RequestsComponent, canActivate: [AuthGuard] }, // doesn't works


  // Apps
  {
    path: 'project/:projectid/app-store',
    loadChildren: () => import('app/app-store/app-store.module').then(m => m.AppStoreModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/app-store', component: AppStoreComponent, canActivate: [AuthGuard] }, // now lazy

  {
    path: 'project/:projectid/app-store-install/:appid/:reason',
    loadChildren: () => import('app/app-store/app-store-install/app-store-install.module').then(m => m.AppStoreInstallModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/app-store-install/:appid/:reason', component: AppStoreInstallComponent, canActivate: [AuthGuard] }, // now lazy
 
  {
    path: 'project/:projectid/app-store-install/:appid/:reason/:calledby',
    loadChildren: () => import('app/app-store/app-store-install/app-store-install.module').then(m => m.AppStoreInstallModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/app-store-install/:appid/:reason/:calledby', component: AppStoreInstallComponent, canActivate: [AuthGuard] }, // now lazy
  
  {
    path: 'project/:projectid/app-create',
    loadChildren: () => import('app/app-store/app-create/app-create.module').then(m => m.AppCreateModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/app-create', component: AppCreateComponent, canActivate: [AuthGuard] }, // now lazy

  {
    path: 'project/:projectid/app-edit/:appid',
    loadChildren: () => import('app/app-store/app-create/app-create.module').then(m => m.AppCreateModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/app-edit/:appid', component: AppCreateComponent, canActivate: [AuthGuard] }, // now lazy


   // Contacts
   {
     path: 'project/:projectid/contacts',
     loadChildren: () => import('app/contacts/contacts.module').then(m => m.ContactsModule),
     canActivate: [AuthGuard, ProjectProfileGuard],
   },
  //  { path: 'project/:projectid/contacts', component: ContactsComponent, canActivate: [AuthGuard, ProjectProfileGuard] },  // now lazy
 
  {
    path: 'project/:projectid/contact/:requesterid',
    loadChildren: () => import('app/contact-details/contact-details.module').then(m => m.ContactDetailsModule),
    canActivate: [AuthGuard],
  },
  // { path: 'project/:projectid/contact/:requesterid', component: ContactDetailsComponent, canActivate: [AuthGuard] }, // now lazy
  
  {
    path: 'project/:projectid/contact/edit/:requesterid',
    loadChildren: () => import('app/contact-edit/contact-edit.module').then(m => m.ContactEditModule),
    canActivate: [AuthGuard],
  },
  // { path: 'project/:projectid/contact/edit/:requesterid', component: ContactEditComponent, canActivate: [AuthGuard] }, // now lazy
  
  {
    path: 'project/:projectid/contact/_edit/:requesterid',
    loadChildren: () => import('app/contact-edit/contact-edit.module').then(m => m.ContactEditModule),
    canActivate: [AuthGuard],
  },
  // { path: 'project/:projectid/contact/_edit/:requesterid', component: ContactEditComponent, canActivate: [AuthGuard] }, // now lazy // called from the dropodown of the chat to change contact email , name amd lastname on fly (use to not display the goBack)


  // Conversation details
  {
    path: 'project/:projectid/wsrequest/:requestid/messages',
    loadChildren: () => import('app/ws_requests/ws-requests-msgs/ws-requests-msgs.module').then(m => m.WsRequestsMsgsModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/wsrequest/:requestid/messages', component: WsRequestsMsgsComponent, canActivate: [AuthGuard] }, // now lazy
  {
    path: 'project/:projectid/request-for-panel/:requestid',
    loadChildren: () => import('app/ws_requests/ws-requests-msgs/ws-requests-msgs.module').then(m => m.WsRequestsMsgsModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/request-for-panel/:requestid', component: WsRequestsMsgsComponent, canActivate: [AuthGuard] }, // now lazy

  {
    path: 'project/:projectid/wsrequest/:requestid/:calledby/messages',
    loadChildren: () => import('app/ws_requests/ws-requests-msgs/ws-requests-msgs.module').then(m => m.WsRequestsMsgsModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/wsrequest/:requestid/:calledby/messages', component: WsRequestsMsgsComponent, canActivate: [AuthGuard] }, 

  {
    path: 'project/:projectid/wsrequest/:requestid/:calledby/:hassearchedby/messages',
    loadChildren: () => import('app/ws_requests/ws-requests-msgs/ws-requests-msgs.module').then(m => m.WsRequestsMsgsModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/wsrequest/:requestid/:calledby/:hassearchedby/messages', component: WsRequestsMsgsComponent, canActivate: [AuthGuard] }, // now lazy
  
  {
    path: 'project/:projectid/wsrequest/:requestid/:calledby/:hassearchedby/:isopenadvancedsearch/messages',
    loadChildren: () => import('app/ws_requests/ws-requests-msgs/ws-requests-msgs.module').then(m => m.WsRequestsMsgsModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/wsrequest/:requestid/:calledby/:hassearchedby/:isopenadvancedsearch/messages', component: WsRequestsMsgsComponent, canActivate: [AuthGuard] },  // now lazy
  
  {
    path: 'project/:projectid/wsrequest/:requestid/:calledby/:hassearchedby/:isopenadvancedsearch/:deptid/messages',
    loadChildren: () => import('app/ws_requests/ws-requests-msgs/ws-requests-msgs.module').then(m => m.WsRequestsMsgsModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/wsrequest/:requestid/:calledby/:hassearchedby/:isopenadvancedsearch/:deptid/messages', component: WsRequestsMsgsComponent, canActivate: [AuthGuard] }, // now lazy

  // Conversations list - Served - Unserved
  {
    path: 'project/:projectid/wsrequests',
    loadChildren: () => import('app/ws_requests/ws-requests-list/ws-requests-list.module').then(m => m.WsRequestsListModule),
    canActivate: [AuthGuard, ProjectProfileGuard]
  },

  // { path: 'project/:projectid/wsrequests', component: WsRequestsListComponent, canActivate: [AuthGuard, ProjectProfileGuard] }, // now lazy

  // HISTORY & NORT
  {
    path: 'project/:projectid/history',
    loadChildren: () => import('app/ws_requests/history-and-nort-convs/history-and-nort-convs.module').then(m => m.HistoryAndNortConvsModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/history', component: HistoryAndNortConvsComponent, canActivate: [AuthGuard] }, // now lazy

  {
    path: 'project/:projectid/all-conversations',
    loadChildren: () => import('app/ws_requests/history-and-nort-convs/history-and-nort-convs.module').then(m => m.HistoryAndNortConvsModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/all-conversations', component: HistoryAndNortConvsComponent, canActivate: [AuthGuard] }, // now lazy

  {
    path: 'project/:projectid/history/:hassearcedby',
    loadChildren: () => import('app/ws_requests/history-and-nort-convs/history-and-nort-convs.module').then(m => m.HistoryAndNortConvsModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/history/:hassearcedby', component: HistoryAndNortConvsComponent, canActivate: [AuthGuard] }, // now lazy
  
  {
    path: 'project/:projectid/history/:hassearcedby/:isopenadvancedsearch',
    loadChildren: () => import('app/ws_requests/history-and-nort-convs/history-and-nort-convs.module').then(m => m.HistoryAndNortConvsModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/history/:hassearcedby/:isopenadvancedsearch', component: HistoryAndNortConvsComponent, canActivate: [AuthGuard] }, // now lazy
  
  {
    path: 'project/:projectid/history/:hassearcedby/:isopenadvancedsearch/:deptid',
    loadChildren: () => import('app/ws_requests/history-and-nort-convs/history-and-nort-convs.module').then(m => m.HistoryAndNortConvsModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/history/:hassearcedby/:isopenadvancedsearch/:deptid', component: HistoryAndNortConvsComponent, canActivate: [AuthGuard] }, // now lazy

  {
    path: 'project/:projectid/all-conversations/:hassearcedby',
    loadChildren: () => import('app/ws_requests/history-and-nort-convs/history-and-nort-convs.module').then(m => m.HistoryAndNortConvsModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/all-conversations/:hassearcedby', component: HistoryAndNortConvsComponent, canActivate: [AuthGuard] }, // now lazy
  
  {
    path: 'project/:projectid/all-conversations/:hassearcedby/:isopenadvancedsearch',
    loadChildren: () => import('app/ws_requests/history-and-nort-convs/history-and-nort-convs.module').then(m => m.HistoryAndNortConvsModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/all-conversations/:hassearcedby/:isopenadvancedsearch', component: HistoryAndNortConvsComponent, canActivate: [AuthGuard] }, // now lazy

  {
    path: 'project/:projectid/all-conversations/:hassearcedby/:isopenadvancedsearch/:deptid',
    loadChildren: () => import('app/ws_requests/history-and-nort-convs/history-and-nort-convs.module').then(m => m.HistoryAndNortConvsModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/all-conversations/:hassearcedby/:isopenadvancedsearch/:deptid', component: HistoryAndNortConvsComponent, canActivate: [AuthGuard] }, // now lazy


  // Unserved for chat ionic
  {
    path: 'project/:projectid/unserved-request-for-panel',
    loadChildren: () => import('app/ws_requests/for-panel/ws-requests-unserved-for-panel/ws-requests-unserved-for-panel.module').then(m => m.WsRequestsUnservedForPanelModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/unserved-request-for-panel', component: WsRequestsUnservedForPanelComponent, canActivate: [AuthGuard] }, // now lazy

   { path: 'project/:projectid/contacts-demo', component: ContactsStaticComponent, canActivate: [AuthGuard] },


  { path: 'project/:projectid/template-details/:templateid', component: CommunityTemplateDtlsComponent },




  // { path: 'projects-for-panel', component: ProjectsForPanelComponent, canActivate: [AuthGuard] }, // removed - was used in the left panel of the chat
  { path: 'get-chatbot/:botid', component: GetStartChatbotForkComponent, canActivate: [AuthGuard] },
  { path: 'activate-product/:activation_email/:licenseproductkeyuuid/:plan_id/:invoice_item_uuid', component: ActivateAppsumoProductComponent, canActivate: [AuthGuard] },
  { path: 'install-template/:botid/:projectid', component: InstallTemplateComponent, canActivate: [AuthGuard] },
  { path: 'install-template-np/:botid/:projectid/:langcode/:langname', component: InstallTemplateComponent, canActivate: [AuthGuard] },
  { path: 'create-project-itw/:botid', component: CreateProjectComponent, canActivate: [AuthGuard] }, // wizard 
  { path: 'create-project-gs', component: CreateProjectGsComponent, canActivate: [AuthGuard] },

  // **** NEW - WIZARD CREATE PROJECT ****
  // { path: 'project/create-project', component: CreateProjectComponent, canActivate: [AuthGuard] },

  // FOR CreateProjectComponent I HAVE CREATE TO PATH TO HIDE THE BUTTON 'close' WHEN THE
  // COMPONENT IS CALLED AFTER THE SIGNUP

  // USED AFTER THE SIGNUP
  { path: 'create-project', component: CreateProjectComponent, canActivate: [AuthGuard] }, // wizard 


  // USED WHEN THE USER CLICK ON 'ADD NEW PROJECT' FROM THE NAVBAR
  //{ path: 'create-new-project', component: CreateProjectComponent, canActivate: [AuthGuard] }, // wizard 

  { path: 'onboarding', component: OnboardingWelcomeComponent, canActivate: [AuthGuard] }, // wizard
  { path: 'create-new-project', component: OnboardingContentComponent, canActivate: [AuthGuard] }, // wizard 
  { path: 'project/:projectid/onboarding-widget', component: OnboardingWidgetComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/desktop-access/:botid', component: CnpIsMobileComponent, canActivate: [AuthGuard] }, // wizard 
  { path: 'project/:projectid/onboarding-templates', component: CnpTemplatesComponent, canActivate: [AuthGuard] }, // wizard 


  { path: 'project/:projectid/configure-widget', component: ConfigureWidgetComponent, canActivate: [AuthGuard] }, // wizard step 2
  { path: 'project/:projectid/onboarding/:langcode/:langname', component: OnboardingComponent, canActivate: [AuthGuard] }, // wizard step 3
  { path: 'project/:projectid/install-widget/:langcode/:langname', component: InstallWidgetComponent, canActivate: [AuthGuard] },

  { path: 'project/:projectid/cannedresponses', component: CannedResponsesListComponent, canActivate: [AuthGuard, ProjectProfileGuard] },
  { path: 'project/:projectid/cannedresponses-demo', component: CannedResponsesStaticComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/labels', component: TagsComponent, canActivate: [AuthGuard] },

  { path: 'project/create', component: ProjectEditAddComponent, canActivate: [AuthGuard] },

  // { path: 'project/:projectid/edit', component: ProjectEditAddComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/project-settings/general', component: ProjectEditAddComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/project-settings/payments', component: ProjectEditAddComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/project-settings/auth', component: ProjectEditAddComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/project-settings/advanced', component: ProjectEditAddComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/notification-email', component: NotificationEmailComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/project-settings/notification', component: ProjectEditAddComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/project-settings/security', component: ProjectEditAddComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/project-settings/banned', component: ProjectEditAddComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/smtp-settings', component: SmtpSettingsComponent, canActivate: [AuthGuard] },


  // { path: 'home', component: HomeComponent, canActivate: [AuthGuard]}, // , canDeactivate: [AuthGuard]




  { path: 'handle-invitation/:pendinginvitationid/:projectname/:adminfirstname/:adminsurname', component: HandleInvitationComponent },
  // added to resolve the error Cannot match any routes when the surname is not available  
  { path: 'handle-invitation/:pendinginvitationid/:projectname/:adminfirstname', component: HandleInvitationComponent },

  { path: 'project/:projectid/unauthorized', component: UnauthorizedComponent },
  { path: 'project/:projectid/unauthorized-access', component: UnauthorizedForPricingComponent },
  { path: 'project/:projectid/unauthorized_access', component: UnauthorizedForProjectComponent },


  { path: 'userprofile', component: UserProfileComponent },
  // , canActivate: [AuthGuard]



  /*** WEBSOCKET ***/
  /**
   * if change wsrequest search for all occurrence - 
   * remember that in the navbar component wsrequest is used for the link from the in app-notification to the request's messages */
 
  { path: 'project/:projectid/wsrequests-demo', component: WsrequestsStaticComponent, canActivate: [AuthGuard] },

  

  

  { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/chat', component: ChatComponent, canActivate: [AuthGuard] },

  // ARE ALL THE USER OF A PROJECT (e.g. THE USER THAT HAS CREATED THE PROJECT AND THE USERS THAT HE HAS INVITED (THE OTHER MEMBERS OF THE PROJECT))
  { path: 'project/:projectid/users', component: UsersComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/user/add', component: UserEditAddComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/user/edit/:projectuserid', component: UserEditAddComponent, canActivate: [AuthGuard] },


  // GROUPS
  // , ProjectProfileGuard
  { path: 'project/:projectid/groups', component: GroupsComponent, canActivate: [AuthGuard, ProjectProfileGuard] },
  // GROUP EDIT/ADD
  { path: 'project/:projectid/group/create', component: GroupEditAddComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/group/edit/:groupid', component: GroupEditAddComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/groups-demo', component: GroupsStaticComponent, canActivate: [AuthGuard] },


  // IS THE PROFILE OF THE LOGGED USER
  { path: 'project/:projectid/user-profile', component: UserProfileComponent },

  // IS THE PROFILE OF THE LOGGED USER THAT IS ON THE PROJECTS PAGE (THE USER HAS NOT YET SELECTED A PROJECT)
  { path: 'user-profile', component: UserProfileComponent },

  // FAQKB (i.e. BOT)
  /* path /faqkb commented and duplicated RENAMED IN /bots */
  // { path: 'project/:projectid/faqkb', component: FaqKbComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/bots', component: BotListComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/bots/my-chatbots/all', component: BotListComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/bots/my-chatbots/customer-satisfaction', component: BotListComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/bots/my-chatbots/increase-sales', component: BotListComponent, canActivate: [AuthGuard] },

  { path: 'project/:projectid/bots/bot-select-type', component: BotTypeSelectComponent, canActivate: [AuthGuard] },
  // { path: 'project/:projectid/bots/createfaqkb', component: BotCreateComponent, canActivate: [AuthGuard] }, // replaced by the bottom path
  { path: 'project/:projectid/bots/create/:type', component: BotCreateComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/chatbot/create', component: CreateChatbotComponent, canActivate: [AuthGuard] }, //Multilanguage bot from scratch

  { path: 'project/:projectid/bots/templates/all', component: TemplatesComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/bots/templates/customer-satisfaction', component: TemplatesComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/bots/templates/increase-sales', component: TemplatesComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/bots/templates/community', component: TemplatesComponent, canActivate: [AuthGuard] },


  // rasa bot
  { path: 'project/:projectid/bot/rasa/create', component: RasaBotComponent, canActivate: [AuthGuard] },

  // native bot (to create these is required to pass the template )
  { path: 'project/:projectid/bots/create/:type/:template', component: BotCreateComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/editfaqkb/:faqkbid', component: BotCreateComponent, canActivate: [AuthGuard] },

  // { path: 'faq/:faqkbid', component: FaqComponent, canActivate: [AuthGuard] }, // used to pass the faq kb id from  in faq page

  /* path /faq/:faqkbid' commented and duplicated RENAMED IN /bots/:faqkbid ( used to pass the faq kb id from  in faq page) */
  // { path: 'project/:projectid/faq/:faqkbid', component: FaqComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/bots/:faqkbid/:type', component: FaqComponent, canActivate: [AuthGuard] },

  // new component for native bot (i.e. resolution-bot)
  { path: 'project/:projectid/bots/general/:faqkbid/:type', component: NativeBotComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/bots/intents/:faqkbid/:type', component: NativeBotComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/bots/fulfillment/:faqkbid/:type', component: NativeBotComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/bots/prebuilt', component: NativeBotSelectTypeComponent, canActivate: [AuthGuard] },

  { path: 'project/:projectid/tilebot/general/:faqkbid/:type', component: TilebotComponent, canActivate: [AuthGuard] },

  { path: 'project/:projectid/tilebot/fulfillment/:faqkbid/:type', component: TilebotComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/tilebot/prebuilt', component: TilebotSelectTypeComponent, canActivate: [AuthGuard] },

  { path: 'project/:projectid/faq/test/:faqkbid', component: FaqTestComponent, canActivate: [AuthGuard] },

  { path: 'project/:projectid/createfaq/:faqkbid/:bottype/:botlang', component: FaqEditAddComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/editfaq/:faqkbid/:faqid/:bottype', component: FaqEditAddComponent, canActivate: [AuthGuard] },



  // TEST-FAQ PAGE
  // { path: 'project/:projectid/faq/test/:remoteFaqKbKey/:faqkbid', component: FaqTestComponent, canActivate: [AuthGuard] },
  // TEST-FAQ PAGE NEW URL

  { path: 'project/:projectid/analytics-demo', component: AnalyticsStaticComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/analytics/metrics-demo', component: AnalyticsStaticComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/analytics/metrics/visitors-demo', component: AnalyticsStaticComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/analytics/metrics/messages-demo', component: AnalyticsStaticComponent, canActivate: [AuthGuard] },




  // , ProjectProfileGuard
  { path: 'project/:projectid/activities', component: ActivitiesComponent, canActivate: [AuthGuard, ProjectProfileGuard] },
  { path: 'project/:projectid/activities-demo', component: ActivitiesStaticComponent, canActivate: [AuthGuard] },


  // , ProjectProfileGuard
  { path: 'project/:projectid/departments', component: DepartmentsComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/departments-demo', component: DepartmentsStaticComponent, canActivate: [AuthGuard] },
  // 
  { path: 'project/:projectid/department/create', component: DepartmentEditAddComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },

  { path: 'project/:projectid/department/edit/:deptid', component: DepartmentEditAddComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },


  // new routing page is the edit department
  { path: 'project/:projectid/routing/:deptid', component: DepartmentEditAddComponent, canActivate: [AuthGuard] }, // new





  

  

  // is the dummy component used in ws-requests-msgs: when the user is in the request' details page and 
  // click an in-app notification (of a request unserved or assigned to him) the navigation is redirect to the loading component 
  // and then again to request' details page
  { path: 'project/:projectid/wsrequest/loading', component: LoadingPageComponent, canActivate: [AuthGuard] },

  // TRIGGER , ProjectProfileGuard
  { path: 'project/:projectid/trigger', component: TriggerComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/trigger-demo', component: TriggerStaticComponent, canActivate: [AuthGuard] },

  { path: 'project/:projectid/trigger/add', component: TriggerAddComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/trigger/:triggerId', component: TriggerEditComponent, canActivate: [AuthGuard] },



  // { path: 'project/:projectid/widget/design', component: WidgetDesignComponent, canActivate: [AuthGuard] },
  // { path: 'project/:projectid/widget/greetings', component: WidgetSetUp, canActivate: [AuthGuard] }, // old
  // { path: 'project/:projectid/widget/callout', component: WidgetSetUp, canActivate: [AuthGuard] }, // old
  // { path: 'project/:projectid/widget/appearance', component: WidgetSetUp, canActivate: [AuthGuard] }, // old
  { path: 'project/:projectid/widget/translations', component: WidgetMultilanguageComponent, canActivate: [AuthGuard] }, // old
  { path: 'project/:projectid/widget-set-up', component: WidgetSetUp, canActivate: [AuthGuard] },
  { path: 'project/:projectid/installation', component: WidgetInstallationComponent, canActivate: [AuthGuard] },


  // CHANGE PSWRD if project is defined (use case: THE USER SELECTED A PROJECT)
  { path: 'project/:projectid/user/:userid/password/change', component: ChangePasswordComponent, canActivate: [AuthGuard] },
  // CHANGE PSWRD if project is undefined (use case: THE USER HAS NOT YET SELECTED A PROJECT)
  { path: 'user/:userid/password/change', component: ChangePasswordComponent, canActivate: [AuthGuard] },

  // Account settings if project is defined (use case: THE USER SELECTED A PROJECT)
  { path: 'project/:projectid/user/:userid/settings', component: AccountSettingsComponent, canActivate: [AuthGuard] },
  // Account settings if project is undefined (use case: THE USER HAS NOT YET SELECTED A PROJECT)
  { path: 'user/:userid/settings', component: AccountSettingsComponent, canActivate: [AuthGuard] },

  // Notification settings if project is defined (use cae: THE USER SELECTED A PROJECT)
  { path: 'project/:projectid/user/:userid/notifications', component: NotificationSettingsComponent, canActivate: [AuthGuard] },
  // Account settings if project is undefined (use case: THE USER HAS NOT YET SELECTED A PROJECT)
  { path: 'user/:userid/notifications', component: NotificationSettingsComponent, canActivate: [AuthGuard] },

  // HOURS
  { path: 'project/:projectid/hours', component: HoursComponent, canActivate: [AuthGuard, ProjectProfileGuard] },
  { path: 'project/:projectid/hours-demo', component: HoursStaticComponent, canActivate: [AuthGuard] },

  // AUTOMATIONS
  { path: 'project/:projectid/automations', component: AutomationsComponent, canActivate: [AuthGuard, ProjectProfileGuard] },
  { path: 'project/:projectid/automations-demo', component: AutomationStaticComponent, canActivate: [AuthGuard] },


  // KNOWLEDGE BASES
  { path: 'project/:projectid/knowledge-bases', component: KnowledgeBasesComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/knowledge-bases/:calledby', component: KnowledgeBasesComponent, canActivate: [AuthGuard] }, // when called from home


  // KNOWLEDGE BASES OLD
  { path: 'project/:projectid/knowledge-bases-pre', component: KnowledgeBasesPreviousComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/knowledge-bases-pre/:calledby', component: KnowledgeBasesPreviousComponent, canActivate: [AuthGuard] },

  // RESET PASSORD (i.e. page forgot psw & reset psw )
  { path: 'forgotpsw', component: ResetPswComponent },
  { path: 'resetpassword/:resetpswrequestid', component: ResetPswComponent },


  { path: 'project/:projectid/visitors', component: VisitorsComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/events/:requesterid', component: EventsComponent, canActivate: [AuthGuard] },


 



  // Webhook
  { path: 'project/:projectid/webhook', component: WebhookComponent, canActivate: [AuthGuard] },
  // { path: 'project/:projectid/map-request', component: MapRequestComponent, canActivate: [AuthGuard] }, // now lazy
  { path: 'project/:projectid/email', component: EmailTicketingComponent, canActivate: [AuthGuard, ProjectProfileGuard] },
  { path: 'project/:projectid/email-demo', component: EmailTicketingStaticComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/integrations', component: IntegrationsComponent, canActivate: [AuthGuard] },


];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule],
  providers: [AuthGuard, AdminGuard, ProjectProfileGuard, PendingChangesGuard]
})
export class AppRoutingModule { }
