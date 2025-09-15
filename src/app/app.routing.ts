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

// import { DepartmentsComponent } from './departments/departments.component'; // now lazy
// import { DepartmentEditAddComponent } from './department-edit-add/department-edit-add.component'; // now lazy

// import { ProjectsComponent } from './projects/projects.component'; // now lazy
// import { ProjectsForPanelComponent } from './projects/for-panel/projects-for-panel/projects-for-panel.component'; // removed

// import { UsersComponent } from './users/users.component'; // now lazy

// BOTS & FAQ
// import { BotListComponent } from './bots/bots-list/bots-list.component'; // now lazy
// import { BotTypeSelectComponent } from './bots/bot-create/bot-type-select/bot-type-select.component';  // No more used
import { BotCreateComponent } from './bots/bot-create/bot-create.component';

import { FaqComponent } from './bots/faq/faq.component';
// import { FaqEditAddComponent } from './bots/faq-edit-add/faq-edit-add.component'; // No more used
// import { FaqTestComponent } from './bots/faq-test/faq-test.component'; // No more used
// import { TemplatesComponent } from './bots/templates/templates.component'; // now lazy

// import { ProjectEditAddComponent } from './project-edit-add/project-edit-add.component'; // now lazy
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

// import { WidgetSetUp } from './widget_components/widget-set-up/widget-set-up.component'; // now lazy
// import { WidgetMultilanguageComponent } from './widget_components/widget-multilanguage/widget-multilanguage.component'; // now lazy

// import { UserEditAddComponent } from './user-edit-add/user-edit-add.component'; // now lazy
import { VerifyEmailComponent } from './verify-email/verify-email.component';

// import { GroupsComponent } from './groups/groups.component'; // now lazy
// import { GroupEditAddComponent } from './group-edit-add/group-edit-add.component'; // now lazy
// import { GroupsStaticComponent } from './static-pages/groups-static/groups-static.component'; // now lazy
// import { ChangePasswordComponent } from './user-profile/change-password/change-password.component'; // now lazy
import { AccountSettingsComponent } from './user-profile/account-settings/account-settings.component';
// import { HoursComponent } from './hours/hours.component'; // now lazy
// import { ResetPswComponent } from './reset-psw/reset-psw.component'; // now lazy

import { ActivitiesComponent } from './activities/activities.component';

// Andrea
import { ChatComponent } from './chat/chat.component';

// import { AnalyticsStaticComponent } from './static-pages/analytics-static/analytics-static.component'; // now lazy 
// import { ActivitiesStaticComponent } from './static-pages/activities-static/activities-static.component'; // now lazy
// import { HoursStaticComponent } from './static-pages/hours-static/hours-static.component'; // now lazy 
// import { DepartmentsStaticComponent } from './static-pages/departments-static/departments-static.component'; // now lazy 
// import { ContactsStaticComponent } from './static-pages/contacts-static/contacts-static.component'; // now lazy 
// import { AutomationStaticComponent } from './static-pages/automation-static/automation-static.component'; // now lazy

// import { AnalyticsComponent } from './analytics/analytics.component'; // now lazy
// import { RequestsComponent } from './analytics/metrics/requests/requests.component'; // now lazy
// import { MessagesComponent } from './analytics/metrics/messages/messages.component'; // now lazy

import { TriggerComponent } from './trigger/trigger.component';
import { TriggerEditComponent } from './trigger/trigger-edit/trigger-edit.component';
import { TriggerAddComponent } from './trigger/trigger-add/trigger-add.component';
// import { TriggerStaticComponent } from './static-pages/trigger-static/trigger-static.component'; // now lazy
// import { NotificationEmailComponent } from './project-edit-add/notification-email/notification-email.component'; // now lazy
// import { SmtpSettingsComponent } from './project-edit-add/smtp-settings/smtp-settings.component'; // now lazy
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
// import { CannedResponsesListComponent } from './canned-responses/canned-responses-list.component'; // now Lazy
// import { TagsComponent } from './tags/tags.component'; // now Lazy




// @ Apps
// import { AppStoreComponent } from './app-store/app-store.component'; // now lazy
// import { AppStoreInstallComponent } from './app-store/app-store-install/app-store-install.component'; // now lazy
// import { AppCreateComponent } from './app-store/app-create/app-create.component'; // now lazy

// import { WebhookComponent } from './webhook/webhook.component'; // now lazy
import { NotificationSettingsComponent } from './user-profile/notification-settings/notification-settings.component';
// import { NativeBotComponent } from './bots/native-bot/native-bot.component'; // No more used
import { NativeBotSelectTypeComponent } from './bots/native-bot-select-type/native-bot-select-type.component';
// import { RasaBotComponent } from './bots/rasa-bot/rasa-bot.component'; // No more used
// import { EmailTicketingComponent } from './email-ticketing/email-ticketing.component'; // now lazy
// import { WidgetInstallationComponent } from './widget-installation/widget-installation.component'; // now lazy
// import { TilebotSelectTypeComponent } from './bots/tilebot-select-type/tilebot-select-type.component'; // No more used
// import { TilebotComponent } from './bots/tilebot/tilebot.component'; // No more used
import { OnboardingComponent } from './create-project-wizard/onboarding/onboarding.component';
import { GetStartChatbotForkComponent } from './create-project-wizard/get-start-chatbot-fork/get-start-chatbot-fork.component';
import { InstallTemplateComponent } from './create-project-wizard/install-template/install-template.component';
// import { ContactsComponent } from './contacts/contacts.component'; // now lazy
// import { ContactDetailsComponent } from './contact-details/contact-details.component'; // now lazy
// import { ContactEditComponent } from './contact-edit/contact-edit.component'; // now lazy



// import { CdsDashboardComponent } from './chatbot-design-studio/cds-dashboard/cds-dashboard.component'; // now lazy
import { CreateChatbotComponent } from './bots/create-chatbot/create-chatbot.component';
import { CommunityTemplateDtlsComponent } from './bots/templates/community-template-dtls/community-template-dtls.component';
// import { CannedResponsesStaticComponent } from './static-pages/canned-responses-static/canned-responses-static.component'; // now lazy
// import { WsrequestsStaticComponent } from './static-pages/wsrequests-static/wsrequests-static.component'; // now lazy
// import { EmailTicketingStaticComponent } from './static-pages/email-ticketing-static/email-ticketing-static.component'; // now lazy
import { ActivateAppsumoProductComponent } from './create-project-wizard/activate-appsumo-product/activate-appsumo-product.component';
import { CreateProjectGsComponent } from './create-project-wizard/create-project-gs/create-project-gs.component';
// import { KnowledgeBasesComponent } from './knowledge-bases/knowledge-bases.component'; // now lazy
import { CnpIsMobileComponent } from './create-new-project/cnp-is-mobile/cnp-is-mobile.component';
import { CnpTemplatesComponent } from './create-new-project/cnp-templates/cnp-templates.component';
import { OnboardingWelcomeComponent } from './create-new-project/onboarding-welcome/onboarding-welcome.component';
import { RoleGuard } from './core/role.guard';
import { UnauthorizedToUpgradeComponent } from './auth/unauthorized-to-upgrade/unauthorized-to-upgrade.component';

// import { AutomationsComponent } from './automations/automations.component'; // now lazy


// import { KnowledgeBasesPreviousComponent } from './knowledge-bases-previous/knowledge-bases-previous.component'; // now lazy
// import { IntegrationsComponent } from './integrations/integrations.component'; // now lazy



const routes: Routes = [

  // no-auth page
  {
    // path: 'project/:projectid/wsrequests-no-auth',
    path: 'project/:projectid/:callingpage/no-auth',
    loadChildren: () => import('app/auth/unauthorized-for-sidebar/unauthorized-for-sidebar.module').then(m => m.UnauthorizedForSidebarModule),
    canActivate: [AuthGuard]
  },

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

  // RESET PASSORD (i.e. page forgot psw & reset psw )
  {
    path: 'forgotpsw',
    loadChildren: () => import('app/reset-psw/reset-psw.module').then(m => m.ResetPswModule)
  },
  //  { path: 'forgotpsw', component: ResetPswComponent }, // now lazy

  {
    path: 'resetpassword/:resetpswrequestid',
    loadChildren: () => import('app/reset-psw/reset-psw.module').then(m => m.ResetPswModule)
  },
  //  { path: 'resetpassword/:resetpswrequestid', component: ResetPswComponent }, // now lazy


  // Signup on invitations
  {
    path: 'signup-on-invitation/:pendinginvitationemail',
    loadChildren: () => import('app/auth/signup/signup.module').then(m => m.SignupModule)
  },
  // { path: 'signup-on-invitation/:pendinginvitationemail', component: SignupComponent }, // now lazy

  // Autologin 
  { path: 'autologin/:route/:token', component: AutologinComponent },


  { path: 'verify/email/:user_id/:code', component: VerifyEmailComponent },


  // CHANGE PSWRD if project is defined (use case: THE USER SELECTED A PROJECT)
  {
    path: 'project/:projectid/user/:userid/password/change',
    loadChildren: () => import('app/user-profile/change-password/change-password.module').then(m => m.ChangePasswordModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/user/:userid/password/change', component: ChangePasswordComponent, canActivate: [AuthGuard] }, // now lazy

  // CHANGE PSWRD if project is undefined (use case: THE USER HAS NOT YET SELECTED A PROJECT)
  {
    path: 'user/:userid/password/change',
    loadChildren: () => import('app/user-profile/change-password/change-password.module').then(m => m.ChangePasswordModule),
    canActivate: [AuthGuard]
  },
  // { path: 'user/:userid/password/change', component: ChangePasswordComponent, canActivate: [AuthGuard] },

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
    canActivate: [AuthGuard, RoleGuard],
    data: [{ roles: ['owner'] }]
  },

  // Pricing  trial expired
  {
    path: 'project/:projectid/pricing/te',
    loadChildren: () => import('app/pricing/pricing.module').then(m => m.PricingModule),
    canActivate: [AuthGuard, RoleGuard],
    data: [{ roles: ['owner'] }]
  },

  // { path: 'project/:projectid/pricing', component: PricingComponent, canActivate: [AuthGuard] }, // now Lazy
  {
    path: 'project/:projectid/chat-pricing',
    loadChildren: () => import('app/pricing/pricing.module').then(m => m.PricingModule),
    canActivate: [AuthGuard, RoleGuard],
    data: [{ roles: ['owner'] }]
  },
  // { path: 'project/:projectid/chat-pricing', component: PricingComponent, canActivate: [AuthGuard] }, // now Lazy
  {
    path: 'project/:projectid/payments',
    loadChildren: () => import('app/pricing/payments-list/payments-list.module').then(m => m.PaymentsListModule),
    canActivate: [AuthGuard, RoleGuard],
    data: [{ roles: ['owner'] }]
  },
  // { path: 'project/:projectid/payments', component: PaymentsListComponent, canActivate: [AuthGuard] }, // now Lazy
  {
    path: 'project/:projectid/success',
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
    canActivate: [AuthGuard, RoleGuard],
    data: [{ roles: ['owner', 'admin'] }]
  },
  // { path: 'project/:projectid/cds/:faqkbid', component: CdsDashboardComponent, canActivate: [AuthGuard] }, // now Lazy

  {
    path: 'project/:projectid/cds/:faqkbid/intent/:intent_id',
    loadChildren: () => import('app/chatbot-design-studio/chatbot-design-studio.module').then(m => m.ChatbotDesignStudioModule),
    canActivate: [AuthGuard, RoleGuard],
    data: [{ roles: ['owner', 'admin'] }]
  },
  // { path: 'project/:projectid/cds/:faqkbid/intent/:intent_id', component: CdsDashboardComponent, canActivate: [AuthGuard] }, // now Lazy

  {
    path: 'project/:projectid/cds/:faqkbid/intent/:intent_id',
    loadChildren: () => import('app/chatbot-design-studio/chatbot-design-studio.module').then(m => m.ChatbotDesignStudioModule),
    canActivate: [AuthGuard, RoleGuard],
    data: [{ roles: ['owner', 'admin'] }]
  },
  // { path: 'project/:projectid/cds/:faqkbid/intent/:intent_id/:calledby', component: CdsDashboardComponent, canActivate: [AuthGuard] }, // now Lazy



  // Activities
  {
    path: 'project/:projectid/activities', component: ActivitiesComponent,
    canActivate: [AuthGuard, ProjectProfileGuard]
  },

  // Activities demo page
  {
    path: 'project/:projectid/activities-demo',
    loadChildren: () => import('app/static-pages/activities-static/activities-static.module').then(m => m.ActivitiesStaticModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/activities-demo', component: ActivitiesStaticComponent, canActivate: [AuthGuard] }, // now lazy

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

  // Analytics demo page
  {
    path: 'project/:projectid/analytics-demo',
    loadChildren: () => import('app/static-pages/analytics-static/analytics-static.module').then(m => m.AnalyticsStaticModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/analytics-demo', component: AnalyticsStaticComponent, canActivate: [AuthGuard] }, // Now lazy

  {
    path: 'project/:projectid/analytics/metrics-demo',
    loadChildren: () => import('app/static-pages/analytics-static/analytics-static.module').then(m => m.AnalyticsStaticModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/analytics/metrics-demo', component: AnalyticsStaticComponent, canActivate: [AuthGuard] }, // Now lazy

  {
    path: 'project/:projectid/analytics/metrics/visitors-demo',
    loadChildren: () => import('app/static-pages/analytics-static/analytics-static.module').then(m => m.AnalyticsStaticModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/analytics/metrics/visitors-demo', component: AnalyticsStaticComponent, canActivate: [AuthGuard] }, // Now lazy

  {
    path: 'project/:projectid/analytics/metrics/messages-demo',
    loadChildren: () => import('app/static-pages/analytics-static/analytics-static.module').then(m => m.AnalyticsStaticModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/analytics/metrics/messages-demo', component: AnalyticsStaticComponent, canActivate: [AuthGuard] }, // Now lazy


  // { path: 'project/:projectid/messages-analytics', component: MessagesComponent, canActivate: [AuthGuard] }, // doesn't works
  // { path: 'project/:projectid/conversation-analytics', component: RequestsComponent, canActivate: [AuthGuard] }, // doesn't works


  // Apps - Check moved in RoleService
  // {
  //   path: 'project/:projectid/app-store',
  //   loadChildren: () => import('app/app-store/app-store.module').then(m => m.AppStoreModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }]
  // },
  // { path: 'project/:projectid/app-store', component: AppStoreComponent, canActivate: [AuthGuard] }, // now lazy

  // Apps store - Check moved in RoleService
  {
    path: 'project/:projectid/app-store',
    loadChildren: () => import('app/app-store/app-store.module').then(m => m.AppStoreModule),
    canActivate: [AuthGuard]
  },


  // Apps store install - Check moved in RoleService
  // {
  //   path: 'project/:projectid/app-store-install/:appid/:reason',
  //   loadChildren: () => import('app/app-store/app-store-install/app-store-install.module').then(m => m.AppStoreInstallModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }]
  // },
  // { path: 'project/:projectid/app-store-install/:appid/:reason', component: AppStoreInstallComponent, canActivate: [AuthGuard] }, // now lazy

  // Apps store install - Check moved in RoleService
  {
    path: 'project/:projectid/app-store-install/:appid/:reason',
    loadChildren: () => import('app/app-store/app-store-install/app-store-install.module').then(m => m.AppStoreInstallModule),
    canActivate: [AuthGuard]
  },

  // Apps store install - Check moved in RoleService
  // {
  //   path: 'project/:projectid/app-store-install/:appid/:reason/:calledby',
  //   loadChildren: () => import('app/app-store/app-store-install/app-store-install.module').then(m => m.AppStoreInstallModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }]
  // },
  // { path: 'project/:projectid/app-store-install/:appid/:reason/:calledby', component: AppStoreInstallComponent, canActivate: [AuthGuard] }, // now lazy
  
  // Apps store install - Check moved in RoleService
  {
    path: 'project/:projectid/app-store-install/:appid/:reason/:calledby',
    loadChildren: () => import('app/app-store/app-store-install/app-store-install.module').then(m => m.AppStoreInstallModule),
    canActivate: [AuthGuard]
  },
  // Check moved in Role service
  // {
  //   path: 'project/:projectid/app-create',
  //   loadChildren: () => import('app/app-store/app-create/app-create.module').then(m => m.AppCreateModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }]
  // },
  // { path: 'project/:projectid/app-create', component: AppCreateComponent, canActivate: [AuthGuard] }, // now lazy

  // Check moved in Role service
  {
    path: 'project/:projectid/app-create',
    loadChildren: () => import('app/app-store/app-create/app-create.module').then(m => m.AppCreateModule),
    canActivate: [AuthGuard]
  },

  // Check moved in Role service
  // {
  //   path: 'project/:projectid/app-edit/:appid',
  //   loadChildren: () => import('app/app-store/app-create/app-create.module').then(m => m.AppCreateModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }]
  // },
  // { path: 'project/:projectid/app-edit/:appid', component: AppCreateComponent, canActivate: [AuthGuard] }, // now lazy

  // Check moved in Role service
  {
    path: 'project/:projectid/app-edit/:appid',
    loadChildren: () => import('app/app-store/app-create/app-create.module').then(m => m.AppCreateModule),
    canActivate: [AuthGuard]
  },


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

  // Contacts demo page
  {
    path: 'project/:projectid/contacts-demo',
    loadChildren: () => import('app/static-pages/contacts-static/contacts-static.module').then(m => m.ContactsStaticModule),
    canActivate: [AuthGuard],
  },
  // { path: 'project/:projectid/contacts-demo', component: ContactsStaticComponent, canActivate: [AuthGuard] }, // now lazy 

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

  // Conversation details with scrollposition
  {
    path: 'project/:projectid/wsrequest/:requestid/:calledby/messages/:scrollposition',
    loadChildren: () => import('app/ws_requests/ws-requests-msgs/ws-requests-msgs.module').then(m => m.WsRequestsMsgsModule),
    canActivate: [AuthGuard]
  },

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

  // Conversations list  (Served - Unserved)
  {
    path: 'project/:projectid/wsrequests',
    loadChildren: () => import('app/ws_requests/ws-requests-list/ws-requests-list.module').then(m => m.WsRequestsListModule),
    canActivate: [AuthGuard, ProjectProfileGuard]
  },

  // Conversations list  (Served - Unserved) with scroll position
  {
    path: 'project/:projectid/wsrequests/:scrollposition',
    loadChildren: () => import('app/ws_requests/ws-requests-list/ws-requests-list.module').then(m => m.WsRequestsListModule),
    canActivate: [AuthGuard, ProjectProfileGuard]
  },

  // { path: 'project/:projectid/wsrequests', component: WsRequestsListComponent, canActivate: [AuthGuard, ProjectProfileGuard] }, // now lazy



  // Conversations list demo page
  {
    path: 'project/:projectid/wsrequests-demo',
    loadChildren: () => import('app/static-pages/wsrequests-static/wsrequests-static.module').then(m => m.WsrequestsStaticModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/wsrequests-demo', component: WsrequestsStaticComponent, canActivate: [AuthGuard] }, // now lazy

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

  // ---------------------------------
  // Components with setting sidebar
  // ---------------------------------
  // Canned Responses
  {
    path: 'project/:projectid/cannedresponses',
    loadChildren: () => import('app/canned-responses/canned-responses-list.module').then(m => m.CannedResponsesListModule),
    canActivate: [AuthGuard, ProjectProfileGuard],
  },
  // { path: 'project/:projectid/cannedresponses', component: CannedResponsesListComponent, canActivate: [AuthGuard, ProjectProfileGuard] },

  // Canned Responses demo page
  {
    path: 'project/:projectid/cannedresponses-demo',
    loadChildren: () => import('app/static-pages/canned-responses-static/canned-responses-static.module').then(m => m.CannedResponsesStaticModule),
    canActivate: [AuthGuard],
  },
  // { path: 'project/:projectid/cannedresponses-demo', component: CannedResponsesStaticComponent, canActivate: [AuthGuard] },

  // Widget Set Up
  // {
  //   path: 'project/:projectid/widget-set-up',
  //   loadChildren: () => import('app/widget_components/widget-set-up/widget-set-up.module').then(m => m.WidgetSetUpModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }]
  // },
  // Widget Set Up control moved in roleService
  {
    path: 'project/:projectid/widget-set-up',
    loadChildren: () => import('app/widget_components/widget-set-up/widget-set-up.module').then(m => m.WidgetSetUpModule),
    canActivate: [AuthGuard],
  },
  // { path: 'project/:projectid/widget-set-up', component: WidgetSetUp, canActivate: [AuthGuard] },

  // Widget Multilanguage - check moved in Roleservice
  // {
  //   path: 'project/:projectid/widget/translations',
  //   loadChildren: () => import('app/widget_components/widget-multilanguage/widget-multilanguage.module').then(m => m.WidgetMultilanguageModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }]
  // },
  // { path: 'project/:projectid/widget/translations', component: WidgetMultilanguageComponent, canActivate: [AuthGuard] },

  // Widget Multilanguage called from widget setup
  // {
  //   path: 'project/:projectid/widget/translations/:calledby',
  //   loadChildren: () => import('app/widget_components/widget-multilanguage/widget-multilanguage.module').then(m => m.WidgetMultilanguageModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }]
  // },


  // Widget Multilanguage Check moved in Roleservice
  {
    path: 'project/:projectid/widget/translations',
    loadChildren: () => import('app/widget_components/widget-multilanguage/widget-multilanguage.module').then(m => m.WidgetMultilanguageModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/widget/translations', component: WidgetMultilanguageComponent, canActivate: [AuthGuard] },

  // Widget Multilanguage called from widget setup Check moved in Roleservice
  {
    path: 'project/:projectid/widget/translations/:calledby',
    loadChildren: () => import('app/widget_components/widget-multilanguage/widget-multilanguage.module').then(m => m.WidgetMultilanguageModule),
    canActivate: [AuthGuard]
  },



  // Widget installation
  // {
  //   path: 'project/:projectid/installation',
  //   loadChildren: () => import('app/widget-installation/widget-installation.module').then(m => m.WidgetInstallationModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }]
  // },


  // Widget installation - check moved in Role service
  {
    path: 'project/:projectid/installation',
    loadChildren: () => import('app/widget-installation/widget-installation.module').then(m => m.WidgetInstallationModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/installation', component: WidgetInstallationComponent, canActivate: [AuthGuard] },

  // Departments - Check moved in RoleService
  // {
  //   path: 'project/:projectid/departments',
  //   loadChildren: () => import('app/departments/departments.module').then(m => m.DepartmentsModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }]
  // },
  // { path: 'project/:projectid/departments', component: DepartmentsComponent, canActivate: [AuthGuard] }, // now lazy

  // Departments 
  {
    path: 'project/:projectid/departments',
    loadChildren: () => import('app/departments/departments.module').then(m => m.DepartmentsModule),
    canActivate: [AuthGuard]
  },

  // Department Create
  {
    path: 'project/:projectid/department/create',
    loadChildren: () => import('app/department-edit-add/department-edit-add.module').then(m => m.DepartmentEditAddModule),
    canActivate: [AuthGuard, ProjectProfileGuard]
    // ,
    // canDeactivate: [PendingChangesGuard]
  },
  // { path: 'project/:projectid/department/create', component: DepartmentEditAddComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },

  // Department Edit - Check moved in RoleService
  // {
  //   path: 'project/:projectid/department/edit/:deptid',
  //   loadChildren: () => import('app/department-edit-add/department-edit-add.module').then(m => m.DepartmentEditAddModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }]
  //   // ,
  //   // canDeactivate: [PendingChangesGuard]
  // },
  // { path: 'project/:projectid/department/edit/:deptid', component: DepartmentEditAddComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },

  // Department Edit 
  {
    path: 'project/:projectid/department/edit/:deptid',
    loadChildren: () => import('app/department-edit-add/department-edit-add.module').then(m => m.DepartmentEditAddModule),
    canActivate: [AuthGuard]
  },

  // new routing page is the edit department
  // {
  //   path: 'project/:projectid/routing/:deptid',
  //   loadChildren: () => import('app/departments/departments.module').then(m => m.DepartmentsModule),
  //   canActivate: [AuthGuard],
  //   canDeactivate: [PendingChangesGuard]
  // },
  // { path: 'project/:projectid/routing/:deptid', component: DepartmentEditAddComponent, canActivate: [AuthGuard] }, // new

  // Departments demo page
  {
    path: 'project/:projectid/department/create-demo',
    loadChildren: () => import('app/static-pages/departments-static/departments-static.module').then(m => m.DepartmentsStaticModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/departments-demo', component: DepartmentsStaticComponent, canActivate: [AuthGuard] }, // now lazy


  // ARE ALL THE USER OF A PROJECT (e.g. THE USER THAT HAS CREATED THE PROJECT AND THE USERS THAT HE HAS INVITED (THE OTHER MEMBERS OF THE PROJECT)

  // Teammates - check moved in Role Service
  // {
  //   path: 'project/:projectid/users',
  //   loadChildren: () => import('app/users/users.module').then(m => m.UsersModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }]
  // },
  // { path: 'project/:projectid/users', component: UsersComponent, canActivate: [AuthGuard] }, // now lazy
 
  // Teammates - check moved in Role Service
  {
    path: 'project/:projectid/users',
    loadChildren: () => import('app/users/users.module').then(m => m.UsersModule),
    canActivate: [AuthGuard]
  },


  // Add Teammate - ckeck moved in RoleService
  // {
  //   path: 'project/:projectid/user/add',
  //   loadChildren: () => import('app/user-edit-add/user-edit-add.module').then(m => m.UserEditAddModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }]
  // },
  // { path: 'project/:projectid/user/add', component: UserEditAddComponent, canActivate: [AuthGuard] }, // now lazy

  // Add Teammate - ckeck moved in RoleService
  {
    path: 'project/:projectid/user/add',
    loadChildren: () => import('app/user-edit-add/user-edit-add.module').then(m => m.UserEditAddModule),
    canActivate: [AuthGuard]
  },

  // Teammate profile
  {
    path: 'project/:projectid/user/edit/:projectuserid',
    loadChildren: () => import('app/user-edit-add/user-edit-add.module').then(m => m.UserEditAddModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/user/edit/:projectuserid', component: UserEditAddComponent, canActivate: [AuthGuard] }, // now lazy


  // Groups
  {
    path: 'project/:projectid/groups',
    loadChildren: () => import('app/groups/groups.module').then(m => m.GroupsModule),
    canActivate: [AuthGuard, ProjectProfileGuard],
  },
  // { path: 'project/:projectid/groups', component: GroupsComponent, canActivate: [AuthGuard, ProjectProfileGuard] },


  // Group create 
  {
    path: 'project/:projectid/group/create',
    loadChildren: () => import('app/group-edit-add/group-edit-add.module').then(m => m.GroupEditAddModule),
    canActivate: [AuthGuard, RoleGuard],
    data: [{ roles: ['owner', 'admin'] }]
  },
  // { path: 'project/:projectid/group/create', component: GroupEditAddComponent, canActivate: [AuthGuard] }, // now lazy

  // Group edit
  {
    path: 'project/:projectid/group/edit/:groupid',
    loadChildren: () => import('app/group-edit-add/group-edit-add.module').then(m => m.GroupEditAddModule),
    canActivate: [AuthGuard, RoleGuard],
    data: [{ roles: ['owner', 'admin'] }]
  },
  // { path: 'project/:projectid/group/edit/:groupid', component: GroupEditAddComponent, canActivate: [AuthGuard] }, // now lazy

  // Group demo page
  {
    path: 'project/:projectid/groups-demo',
    loadChildren: () => import('app/static-pages/groups-static/groups-static.module').then(m => m.GroupsStaticModule),
    canActivate: [AuthGuard],
  },
  // { path: 'project/:projectid/groups-demo', component: GroupsStaticComponent, canActivate: [AuthGuard] }, // now lazy


  // Roles  canActivate: [AuthGuard, ProjectProfileGuard],
  {
    path: 'project/:projectid/roles',
    loadChildren: () => import('app/users-roles/users-roles.module').then(m => m.UsersRolesModule),
    canActivate: [AuthGuard],
  },

  // New Role  canActivate: [AuthGuard, ProjectProfileGuard],
  {
    path: 'project/:projectid/create-new-role',
    loadChildren: () => import('app/users-new-role/users-new-role.module').then(m => m.UsersNewRoleModule),
    canActivate: [AuthGuard],
  },

  // Role details
  {
    path: 'project/:projectid/edit-role/:roleid',
    loadChildren: () => import('app/users-new-role/users-new-role.module').then(m => m.UsersNewRoleModule),
    canActivate: [AuthGuard],
  },


  // Email ticketing
  {
    path: 'project/:projectid/email',
    loadChildren: () => import('app/email-ticketing/email-ticketing.module').then(m => m.EmailTicketingModule),
    canActivate: [AuthGuard, ProjectProfileGuard],
  },
  // { path: 'project/:projectid/email', component: EmailTicketingComponent, canActivate: [AuthGuard, ProjectProfileGuard] }, // now lazy


  // Email ticketing demo page
  {
    path: 'project/:projectid/email-demo',
    loadChildren: () => import('app/static-pages/email-ticketing-static/email-ticketing-static.module').then(m => m.EmailTicketingStaticModule),
    canActivate: [AuthGuard],
  },
  // { path: 'project/:projectid/email-demo', component: EmailTicketingStaticComponent, canActivate: [AuthGuard] },

  // Tags - check moved in RoleService
  // {
  //   path: 'project/:projectid/labels',
  //   loadChildren: () => import('app/tags/tags.module').then(m => m.TagsModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }]
  // },
  // { path: 'project/:projectid/labels', component: TagsComponent, canActivate: [AuthGuard] }, // now Lazy

  // Tags - check moved in RoleService
  {
    path: 'project/:projectid/labels',
    loadChildren: () => import('app/tags/tags.module').then(m => m.TagsModule),
    canActivate: [AuthGuard]
  },

  // Working hours 
  {
    path: 'project/:projectid/hours',
    loadChildren: () => import('app/hours/hours.module').then(m => m.HoursModule),
    canActivate: [AuthGuard, ProjectProfileGuard],
  },
  // { path: 'project/:projectid/hours', component: HoursComponent, canActivate: [AuthGuard, ProjectProfileGuard] }, // now lazy

  // Working hours demo page
  {
    path: 'project/:projectid/hours-demo',
    loadChildren: () => import('app/static-pages/hours-static/hours-static.module').then(m => m.HoursStaticModule),
    canActivate: [AuthGuard],
  },
  // { path: 'project/:projectid/hours-demo', component: HoursStaticComponent, canActivate: [AuthGuard] }, // now lazy 


  // Automations
  {
    path: 'project/:projectid/automations',
    loadChildren: () => import('app/automations/automations.module').then(m => m.AutomationsModule),
    canActivate: [AuthGuard, ProjectProfileGuard],
  },
  // { path: 'project/:projectid/automations', component: AutomationsComponent, canActivate: [AuthGuard, ProjectProfileGuard] }, // now lazy

   {
    path: 'project/:projectid/new-broadcast',
    loadChildren: () => import('app/automation-create/automation-create.module').then(m => m.AutomationCreateModule),
    canActivate: [AuthGuard],
  },


  // Automations demo page
  {
    path: 'project/:projectid/automations-demo',
    // app/static-pages/trigger-static/trigger-static.module
    loadChildren: () => import('app/static-pages/automation-static/automation-static.module').then(m => m.AutomationStaticModule),
    canActivate: [AuthGuard],
  },
  // { path: 'project/:projectid/automations-demo', component: AutomationStaticComponent, canActivate: [AuthGuard] }, // now lazy

  // Integrations - check moved in RoleService
  // {
  //   path: 'project/:projectid/integrations',
  //   loadChildren: () => import('app/integrations/integrations.module').then(m => m.IntegrationsModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }],
  // },
  // { path: 'project/:projectid/integrations', component: IntegrationsComponent, canActivate: [AuthGuard] }, // now lazy

  // Integrations - check moved in RoleService
  {
    path: 'project/:projectid/integrations',
    loadChildren: () => import('app/integrations/integrations.module').then(m => m.IntegrationsModule),
    canActivate: [AuthGuard]
  },


  // { path: 'project/create', component: ProjectEditAddComponent, canActivate: [AuthGuard] }, seems not used

  // Project edit / add - General - check moved in Role service
  // {
  //   path: 'project/:projectid/project-settings/general',
  //   loadChildren: () => import('app/project-edit-add/project-edit-add.module').then(m => m.ProjectEditAddModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }],
  // },
  // { path: 'project/:projectid/project-settings/general', component: ProjectEditAddComponent, canActivate: [AuthGuard] }, // now lazy

  // Project edit / add - General - Check moved in RoleService
  {
    path: 'project/:projectid/project-settings/general',
    loadChildren: () => import('app/project-edit-add/project-edit-add.module').then(m => m.ProjectEditAddModule),
    canActivate: [AuthGuard]
  },

  // Project edit / add - Payments section - Check moved in RoleService
  // {
  //   path: 'project/:projectid/project-settings/payments',
  //   loadChildren: () => import('app/project-edit-add/project-edit-add.module').then(m => m.ProjectEditAddModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner'] }],
  // },
  // { path: 'project/:projectid/project-settings/payments', component: ProjectEditAddComponent, canActivate: [AuthGuard] }, // now lazy

  // Project edit / add - Payments section - Check moved in RoleService
  {
    path: 'project/:projectid/project-settings/payments',
    loadChildren: () => import('app/project-edit-add/project-edit-add.module').then(m => m.ProjectEditAddModule),
    canActivate: [AuthGuard]
  },

  // Project edit / add - Developer section - Check moved in RoleService
  // {
  //   path: 'project/:projectid/project-settings/auth',
  //   loadChildren: () => import('app/project-edit-add/project-edit-add.module').then(m => m.ProjectEditAddModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }],
  // },
  // { path: 'project/:projectid/project-settings/auth', component: ProjectEditAddComponent, canActivate: [AuthGuard] }, // now lazy


  // Project edit / add - Developer section - Check moved in RoleService
  {
    path: 'project/:projectid/project-settings/auth',
    loadChildren: () => import('app/project-edit-add/project-edit-add.module').then(m => m.ProjectEditAddModule),
    canActivate: [AuthGuard]
  },

  // Project edit / add - Smart Assignment - Check moved in RoleService
  // {
  //   path: 'project/:projectid/project-settings/smartassignment',
  //   loadChildren: () => import('app/project-edit-add/project-edit-add.module').then(m => m.ProjectEditAddModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }]
  // },

   // Project edit / add - Smart Assignment - Check moved in RoleService
  {
    path: 'project/:projectid/project-settings/smartassignment',
    loadChildren: () => import('app/project-edit-add/project-edit-add.module').then(m => m.ProjectEditAddModule),
    canActivate: [AuthGuard]
  },

  // Project edit / add - Advanced - Check moved in RoleService
  // {
  //   path: 'project/:projectid/project-settings/advanced',
  //   loadChildren: () => import('app/project-edit-add/project-edit-add.module').then(m => m.ProjectEditAddModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner'] }]
  // },
  // { path: 'project/:projectid/project-settings/advanced', component: ProjectEditAddComponent, canActivate: [AuthGuard] }, // now lazy


  // Project edit / add - Advanced - Check moved in RoleService
  {
    path: 'project/:projectid/project-settings/advanced',
    loadChildren: () => import('app/project-edit-add/project-edit-add.module').then(m => m.ProjectEditAddModule),
    canActivate: [AuthGuard]
  },


  // Project edit / add - Notifications - Check moved in RoleService
  // {
  //   path: 'project/:projectid/project-settings/notification',
  //   loadChildren: () => import('app/project-edit-add/project-edit-add.module').then(m => m.ProjectEditAddModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }]
  // },
  // { path: 'project/:projectid/project-settings/notification', component: ProjectEditAddComponent, canActivate: [AuthGuard] }, // now lazy

  // Project edit / add - Notifications - Check moved in RoleService
  {
    path: 'project/:projectid/project-settings/notification',
    loadChildren: () => import('app/project-edit-add/project-edit-add.module').then(m => m.ProjectEditAddModule),
    canActivate: [AuthGuard]
  },

  // Project edit / add - Security - Check moved in RoleService 
  // {
  //   path: 'project/:projectid/project-settings/security',
  //   loadChildren: () => import('app/project-edit-add/project-edit-add.module').then(m => m.ProjectEditAddModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner'] }]
  // },
  // { path: 'project/:projectid/project-settings/security', component: ProjectEditAddComponent, canActivate: [AuthGuard] }, // now lazy
  
  // Project edit / add - Security - Check moved in RoleService 
  {
    path: 'project/:projectid/project-settings/security',
    loadChildren: () => import('app/project-edit-add/project-edit-add.module').then(m => m.ProjectEditAddModule),
    canActivate: [AuthGuard]
  },

  // Project edit / add - Banned visitors - Check moved in RoleService 
  // {
  //   path: 'project/:projectid/project-settings/banned',
  //   loadChildren: () => import('app/project-edit-add/project-edit-add.module').then(m => m.ProjectEditAddModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner'] }]
  // },
  // { path: 'project/:projectid/project-settings/banned', component: ProjectEditAddComponent, canActivate: [AuthGuard] }, // now lazy

  // Project edit / add - Banned visitors - Check moved in RoleService 
  {
    path: 'project/:projectid/project-settings/banned',
    loadChildren: () => import('app/project-edit-add/project-edit-add.module').then(m => m.ProjectEditAddModule),
    canActivate: [AuthGuard]
  },



  // Project edit / add - Customize the notification email templates
  {
    path: 'project/:projectid/notification-email',
    loadChildren: () => import('app/project-edit-add/notification-email/notification-email.module').then(m => m.NotificationEmailModule),
    canActivate: [AuthGuard, RoleGuard],
    data: [{ roles: ['owner', 'admin'] }]
  },
  // { path: 'project/:projectid/notification-email', component: NotificationEmailComponent, canActivate: [AuthGuard] }, // now lazy


  // Project edit / add - SMTP settings
  {
    path: 'project/:projectid/smtp-settings',
    loadChildren: () => import('app/project-edit-add/smtp-settings/smtp-settings.module').then(m => m.SmtpSettingsModule),
    canActivate: [AuthGuard, RoleGuard],
    data: [{ roles: ['owner'] }]
  },
  // { path: 'project/:projectid/smtp-settings', component: SmtpSettingsComponent, canActivate: [AuthGuard] }, // now lazy

  // Project edit / add - Webhook
  // {
  //   path: 'project/:projectid/webhook',
  //   loadChildren: () => import('app/webhook/webhook.module').then(m => m.WebhookModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }]
  // },

   // Project edit / add - Check moved in RoleService
   {
    path: 'project/:projectid/webhook',
    loadChildren: () => import('app/webhook/webhook.module').then(m => m.WebhookModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/webhook', component: WebhookComponent, canActivate: [AuthGuard] }, // now lazy

  // Trigger demo page
  {
    path: 'project/:projectid/trigger-demo',
    loadChildren: () => import('app/static-pages/trigger-static/trigger-static.module').then(m => m.TriggerStaticModule),
    canActivate: [AuthGuard],
  },
  // { path: 'project/:projectid/trigger-demo', component: TriggerStaticComponent, canActivate: [AuthGuard] }, // now lazy

  // ---------------------------------------
  // KNOWLEDGE BASES OLD
  // ---------------------------------------
  {
    path: 'project/:projectid/knowledge-bases-pre',
    loadChildren: () => import('app/knowledge-bases-previous/knowledge-bases-previous.module').then(m => m.KnowledgeBasesPreviousModule),
    canActivate: [AuthGuard, RoleGuard],
    data: [{ roles: ['owner', 'admin'] }]
  },
  //  { path: 'project/:projectid/knowledge-bases-pre', component: KnowledgeBasesPreviousComponent, canActivate: [AuthGuard] }, // now lazy

  {
    path: 'project/:projectid/knowledge-bases-pre/:calledby',
    loadChildren: () => import('app/knowledge-bases-previous/knowledge-bases-previous.module').then(m => m.KnowledgeBasesPreviousModule),
    canActivate: [AuthGuard, RoleGuard],
    data: [{ roles: ['owner', 'admin'] }]
  },
  //  { path: 'project/:projectid/knowledge-bases-pre/:calledby', component: KnowledgeBasesPreviousComponent, canActivate: [AuthGuard] }, // now lazy

  // ---------------------------------------
  // KNOWLEDGE BASES (new)
  // ---------------------------------------
  // Check moved in RoleService
  // {
  //   path: 'project/:projectid/knowledge-bases',
  //   loadChildren: () => import('app/knowledge-bases/knowledge-bases.module').then(m => m.KnowledgeBasesModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }]
  // },

  {
    path: 'project/:projectid/knowledge-bases',
    loadChildren: () => import('app/knowledge-bases/knowledge-bases.module').then(m => m.KnowledgeBasesModule),
    canActivate: [AuthGuard]
  },

  // Check moved in RoleService
  // {
  //   path: 'project/:projectid/knowledge-bases/:namespaceid',
  //   loadChildren: () => import('app/knowledge-bases/knowledge-bases.module').then(m => m.KnowledgeBasesModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }]
  // },
  {
    path: 'project/:projectid/knowledge-bases/:namespaceid',
    loadChildren: () => import('app/knowledge-bases/knowledge-bases.module').then(m => m.KnowledgeBasesModule),
    canActivate: [AuthGuard]
  },

  // Check moved in RoleService
  // {
  //   path: 'project/:projectid/knowledge-bases/:calledby',
  //   loadChildren: () => import('app/knowledge-bases/knowledge-bases.module').then(m => m.KnowledgeBasesModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }]
  // },

  {
    path: 'project/:projectid/knowledge-bases/:calledby',
    loadChildren: () => import('app/knowledge-bases/knowledge-bases.module').then(m => m.KnowledgeBasesModule),
    canActivate: [AuthGuard],
  },
  // { path: 'project/:projectid/knowledge-bases/:calledby', component: KnowledgeBasesComponent, canActivate: [AuthGuard] }, // now lazy // when called from home

  // ---------------------------
  // Chatbots
  // ---------------------------
  // Check moved in Roles service
  {
    path: 'project/:projectid/bots/create/:type/:template', component: BotCreateComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: [{ roles: ['owner', 'admin'] }]
  },

   // Check moved in Roles service
  // {
  //   path: 'project/:projectid/bots/create/:type/:template', component: BotCreateComponent,
  //   canActivate: [AuthGuard]
  // },

  {
    path: 'project/:projectid/bots',
    loadChildren: () => import('app/bots/bots-list/bots-list.module').then(m => m.BotsListModule),
    canActivate: [AuthGuard, RoleGuard],
    data: [{ roles: ['owner', 'admin'] }]
  },
  // { path: 'project/:projectid/bots', component: BotListComponent, canActivate: [AuthGuard] }, // now lazy



  // Check moved in role service
  // {
  //   path: 'project/:projectid/bots/my-chatbots/all',
  //   loadChildren: () => import('app/bots/bots-list/bots-list.module').then(m => m.BotsListModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }]
  // },
  // { path: 'project/:projectid/bots/my-chatbots/all', component: BotListComponent, canActivate: [AuthGuard] }, // now lazy

  {
    path: 'project/:projectid/bots/my-chatbots/all',
    loadChildren: () => import('app/bots/bots-list/bots-list.module').then(m => m.BotsListModule),
    canActivate: [AuthGuard]
  },

  // Check moved in RoleService
  // {
  //   path: 'project/:projectid/flows/flow-aiagent',
  //   loadChildren: () => import('app/bots/bots-list/bots-list.module').then(m => m.BotsListModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }]
  // },

  {
    path: 'project/:projectid/flows/flow-aiagent',
    loadChildren: () => import('app/bots/bots-list/bots-list.module').then(m => m.BotsListModule),
    canActivate: [AuthGuard]
  },

  // Check moved in RoleService
  // {
  //   path: 'project/:projectid/flows/flow-automations',
  //   loadChildren: () => import('app/bots/bots-list/bots-list.module').then(m => m.BotsListModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }]
  // },

  {
    path: 'project/:projectid/flows/flow-automations',
    loadChildren: () => import('app/bots/bots-list/bots-list.module').then(m => m.BotsListModule),
    canActivate: [AuthGuard]
  },

  // Check moved in RoleService
  // {
  //   path: 'project/:projectid/flows/flow-webhooks',
  //   loadChildren: () => import('app/bots/flow-webhooks/flow-webhooks.module').then(m => m.FlowWebhooksModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }]
  // },
  {
    path: 'project/:projectid/flows/flow-webhooks',
    loadChildren: () => import('app/bots/flow-webhooks/flow-webhooks.module').then(m => m.FlowWebhooksModule),
    canActivate: [AuthGuard]
  },


  {
    path: 'project/:projectid/bots/my-chatbots/customer-satisfaction',
    loadChildren: () => import('app/bots/bots-list/bots-list.module').then(m => m.BotsListModule),
    canActivate: [AuthGuard, RoleGuard],
    data: [{ roles: ['owner', 'admin'] }]
  },
  // { path: 'project/:projectid/bots/my-chatbots/customer-satisfaction', component: BotListComponent, canActivate: [AuthGuard] }, // now lazy

  {
    path: 'project/:projectid/bots/my-chatbots/increase-sales',
    loadChildren: () => import('app/bots/bots-list/bots-list.module').then(m => m.BotsListModule),
    canActivate: [AuthGuard, RoleGuard],
    data: [{ roles: ['owner', 'admin'] }]
  },
  // { path: 'project/:projectid/bots/my-chatbots/increase-sales', component: BotListComponent, canActivate: [AuthGuard] }, // now lazy


  // ---------------------------
  // Templates
  // ---------------------------
  // Check moved in RoleService
  // {
  //   path: 'project/:projectid/bots/templates/all',
  //   loadChildren: () => import('app/bots/templates/templates.module').then(m => m.TemplatesModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }]
  // },
  // { path: 'project/:projectid/bots/templates/all', component: TemplatesComponent, canActivate: [AuthGuard] }, // now lazy


   {
    path: 'project/:projectid/bots/templates/all',
    loadChildren: () => import('app/bots/templates/templates.module').then(m => m.TemplatesModule),
    canActivate: [AuthGuard]
   },

  // Check moved in RoleService
  // {
  //   path: 'project/:projectid/bots/templates/customer-satisfaction',
  //   loadChildren: () => import('app/bots/templates/templates.module').then(m => m.TemplatesModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }]
  // },

  {
    path: 'project/:projectid/bots/templates/customer-satisfaction',
    loadChildren: () => import('app/bots/templates/templates.module').then(m => m.TemplatesModule),
    canActivate: [AuthGuard]
  },
  // { path: 'project/:projectid/bots/templates/customer-satisfaction', component: TemplatesComponent, canActivate: [AuthGuard] }, // now lazy

  // Check moved in RoleService
  // {
  //   path: 'project/:projectid/bots/templates/increase-sales',
  //   loadChildren: () => import('app/bots/templates/templates.module').then(m => m.TemplatesModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }]
  // },
  // { path: 'project/:projectid/bots/templates/increase-sales', component: TemplatesComponent, canActivate: [AuthGuard] }, // now lazy

  {
    path: 'project/:projectid/bots/templates/increase-sales',
    loadChildren: () => import('app/bots/templates/templates.module').then(m => m.TemplatesModule),
    canActivate: [AuthGuard],
   
  },

  // Check moved in RoleService
  // {
  //   path: 'project/:projectid/bots/templates/community',
  //   loadChildren: () => import('app/bots/templates/templates.module').then(m => m.TemplatesModule),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }]
  // },
  // { path: 'project/:projectid/bots/templates/community', component: TemplatesComponent, canActivate: [AuthGuard] }, // now lazy


  {
    path: 'project/:projectid/bots/templates/community',
    loadChildren: () => import('app/bots/templates/templates.module').then(m => m.TemplatesModule),
    canActivate: [AuthGuard]
  },

  {
    path: 'project/:projectid/template-details/:templateid', component: CommunityTemplateDtlsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: [{ roles: ['owner', 'admin'] }]
  },


  // Used in app-store to create an External chatbot - Check moved in Roles service
  // {
  //   path: 'project/:projectid/bots/create/:type', component: BotCreateComponent,
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }]
  // },

  // Used in app-store to create an External chatbot - Check moved in Roles service 
  {
    path: 'project/:projectid/bots/create/:type', component: BotCreateComponent,
    canActivate: [AuthGuard]
  },

   // Used to edit an External chatbot - Check moved in Roles service 
  // {
  //   path: 'project/:projectid/bots/:faqkbid/:type', component: FaqComponent,
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: [{ roles: ['owner', 'admin'] }]
  // },

   // Used to edit an External chatbot - !!!!! Left pending 
  {
    path: 'project/:projectid/bots/:faqkbid/:type', component: FaqComponent,
    canActivate: [AuthGuard]
  },

  // Chatbots demo page
  {
    path: 'project/:projectid/bots-demo',
    loadChildren: () => import('app/static-pages/bots-static/bots-static.module').then(m => m.BotsStaticModule),
    canActivate: [AuthGuard, RoleGuard],
    data: [{ roles: ['owner', 'admin'] }]
  },



 


  // Unathorized page - Token not valid
  {
    path: 'invalid-token',
    loadChildren: () => import('app/auth/unauthorized-token/unauthorized-token.module').then(m => m.UnauthorizedTokenModule),
  },

  // Support page
  {
    path: 'project/:projectid/support',
    loadChildren: () => import('app/support/support.module').then(m => m.SupportModule),
    canActivate: [AuthGuard]
  },



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
  { path: 'project/:projectid/desktop--access/:namespaceid', component: CnpIsMobileComponent, canActivate: [AuthGuard] }, // wizard 
  { path: 'project/:projectid/onboarding-templates', component: CnpTemplatesComponent, canActivate: [AuthGuard] }, // wizard 


  { path: 'project/:projectid/configure-widget', component: ConfigureWidgetComponent, canActivate: [AuthGuard] }, // wizard step 2
  { path: 'project/:projectid/onboarding/:langcode/:langname', component: OnboardingComponent, canActivate: [AuthGuard] }, // wizard step 3
  { path: 'project/:projectid/install-widget/:langcode/:langname', component: InstallWidgetComponent, canActivate: [AuthGuard] },

  // { path: 'home', component: HomeComponent, canActivate: [AuthGuard]}, // , canDeactivate: [AuthGuard]

  { path: 'handle-invitation/:pendinginvitationid/:projectname/:adminfirstname/:adminsurname', component: HandleInvitationComponent },
  // added to resolve the error Cannot match any routes when the surname is not available  
  { path: 'handle-invitation/:pendinginvitationid/:projectname/:adminfirstname', component: HandleInvitationComponent },

  { path: 'project/:projectid/unauthorized', component: UnauthorizedComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: 'project/:projectid/unauthorized-access', component: UnauthorizedForPricingComponent },
  { path: 'project/:projectid/unauthorized_access', component: UnauthorizedForProjectComponent },
  { path: 'project/:projectid/unauthorized-to-upgrade', component: UnauthorizedToUpgradeComponent },




  // { path: 'userprofile', component: UserProfileComponent },
  // , canActivate: [AuthGuard]


  // IS THE PROFILE OF THE LOGGED USER THAT IS ON THE PROJECTS PAGE (THE USER HAS NOT YET SELECTED A PROJECT)
  { path: 'user-profile', component: UserProfileComponent, canActivate: [AuthGuard] },


  // IS THE PROFILE OF THE LOGGED USER
  { path: 'project/:projectid/user-profile', component: UserProfileComponent, canActivate: [AuthGuard] },


  /*** WEBSOCKET ***/
  /**
   * if change wsrequest search for all occurrence - 
   * remember that in the navbar component wsrequest is used for the link from the in app-notification to the request's messages */

  { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/chat', component: ChatComponent, canActivate: [AuthGuard] },




  // is the dummy component used in ws-requests-msgs: when the user is in the request' details page and 
  // click an in-app notification (of a request unserved or assigned to him) the navigation is redirect to the loading component 
  // and then again to request' details page
  { path: 'project/:projectid/wsrequest/loading', component: LoadingPageComponent, canActivate: [AuthGuard] },

  // TRIGGER , ProjectProfileGuard
  { path: 'project/:projectid/trigger', component: TriggerComponent, canActivate: [AuthGuard] },


  { path: 'project/:projectid/trigger/add', component: TriggerAddComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/trigger/:triggerId', component: TriggerEditComponent, canActivate: [AuthGuard] },

  // { path: 'project/:projectid/widget/design', component: WidgetDesignComponent, canActivate: [AuthGuard] },
  // { path: 'project/:projectid/widget/greetings', component: WidgetSetUp, canActivate: [AuthGuard] }, // old
  // { path: 'project/:projectid/widget/callout', component: WidgetSetUp, canActivate: [AuthGuard] }, // old
  // { path: 'project/:projectid/widget/appearance', component: WidgetSetUp, canActivate: [AuthGuard] }, // old


  // Account settings if project is defined (use case: THE USER SELECTED A PROJECT)
  { path: 'project/:projectid/user/:userid/settings', component: AccountSettingsComponent, canActivate: [AuthGuard] },
  // Account settings if project is undefined (use case: THE USER HAS NOT YET SELECTED A PROJECT)
  { path: 'user/:userid/settings', component: AccountSettingsComponent, canActivate: [AuthGuard] },

  // Notification settings if project is defined (use cae: THE USER SELECTED A PROJECT)
  { path: 'project/:projectid/user/:userid/notifications', component: NotificationSettingsComponent, canActivate: [AuthGuard] },
  // Account settings if project is undefined (use case: THE USER HAS NOT YET SELECTED A PROJECT)
  { path: 'user/:userid/notifications', component: NotificationSettingsComponent, canActivate: [AuthGuard] },














  { path: 'project/:projectid/visitors', component: VisitorsComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/events/:requesterid', component: EventsComponent, canActivate: [AuthGuard] },


  // ----------------------------------
  // No more used
  // ----------------------------------
  // { path: 'project/:projectid/bots/prebuilt', component: NativeBotSelectTypeComponent, canActivate: [AuthGuard] }, 

  // { path: 'project/:projectid/editfaqkb/:faqkbid', component: BotCreateComponent, canActivate: [AuthGuard] },
  // new component for native bot (i.e. resolution-bot)

  // { path: 'project/:projectid/bots/general/:faqkbid/:type', component: NativeBotComponent, canActivate: [AuthGuard] },
  // { path: 'project/:projectid/bots/intents/:faqkbid/:type', component: NativeBotComponent, canActivate: [AuthGuard] },
  // { path: 'project/:projectid/bots/fulfillment/:faqkbid/:type', component: NativeBotComponent, canActivate: [AuthGuard] },

  // { path: 'project/:projectid/tilebot/general/:faqkbid/:type', component: TilebotComponent, canActivate: [AuthGuard] },
  // { path: 'project/:projectid/tilebot/intents/:faqkbid/:type', component: TilebotComponent, canActivate: [AuthGuard] },
  // { path: 'project/:projectid/tilebot/fulfillment/:faqkbid/:type', component: TilebotComponent, canActivate: [AuthGuard] },
  // { path: 'project/:projectid/faq/test/:faqkbid', component: FaqTestComponent, canActivate: [AuthGuard] },

  // { path: 'project/:projectid/createfaq/:faqkbid/:bottype/:botlang', component: FaqEditAddComponent, canActivate: [AuthGuard] },
  // { path: 'project/:projectid/editfaq/:faqkbid/:faqid/:bottype', component: FaqEditAddComponent, canActivate: [AuthGuard] },



  // { path: 'project/:projectid/_createfaq/:faqkbid/:bottype/:botlang', component: FaqEditAddComponent, canActivate: [AuthGuard] },
  // { path: 'project/:projectid/_editfaq/:faqkbid/:faqid/:bottype', component: FaqEditAddComponent, canActivate: [AuthGuard] },

  // Multilanguage bot from scratch
  // { path: 'project/:projectid/chatbot/create', component: CreateChatbotComponent, canActivate: [AuthGuard] }, 

  // Choose bot type
  // { path: 'project/:projectid/bots/bot-select-type', component: BotTypeSelectComponent, canActivate: [AuthGuard] },


  // !!!! No more used (see in app store and dislayed after bot-select-type)
  // { path: 'project/:projectid/tilebot/prebuilt', component: TilebotSelectTypeComponent, canActivate: [AuthGuard] }, 

  // Rasa bot Not more used
  // { path: 'project/:projectid/bot/rasa/create', component: RasaBotComponent, canActivate: [AuthGuard] },




];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule],
  providers: [AuthGuard, AdminGuard, ProjectProfileGuard, RoleGuard]
})
export class AppRoutingModule { }
