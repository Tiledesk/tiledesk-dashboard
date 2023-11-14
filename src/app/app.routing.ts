import { OnboardingWidgetComponent } from './create-project-wizard/onboarding-widget/onboarding-widget.component';
import { MapRequestComponent } from './map-request/map-request.component';
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

import { HomeComponent } from './home/home.component';

// NK

import { VisitorsComponent } from './visitors/visitors.component';
import { EventsComponent } from './events/events.component';


/*** WEBSOCKET ***/
import { WsRequestsListComponent } from './ws_requests/ws-requests-list/ws-requests-list.component';
import { WsRequestsMsgsComponent } from './ws_requests/ws-requests-msgs/ws-requests-msgs.component';

import { DepartmentsComponent } from './departments/departments.component';
import { DepartmentEditAddComponent } from './department-edit-add/department-edit-add.component';

import { ProjectsComponent } from './projects/projects.component';
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
import { HistoryAndNortConvsComponent } from './ws_requests/history-and-nort-convs/history-and-nort-convs.component';

// --------------------------------------------------------------------------------------------
// AUTH PAGES
// --------------------------------------------------------------------------------------------
import { SigninComponent } from './auth/signin/signin.component';
import { SignupComponent } from './auth/signup/signup.component';
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
import { ContactDetailsComponent } from './contact-details/contact-details.component';
import { ContactEditComponent } from './contact-edit/contact-edit.component';
import { ActivitiesComponent } from './activities/activities.component';

// Andrea
import { ChatComponent } from './chat/chat.component';

import { AnalyticsStaticComponent } from './static-pages/analytics-static/analytics-static.component';
import { ActivitiesStaticComponent } from './static-pages/activities-static/activities-static.component';
import { HoursStaticComponent } from './static-pages/hours-static/hours-static.component';
import { DepartmentsStaticComponent } from './static-pages/departments-static/departments-static.component';
import { ContactsStaticComponent } from './static-pages/contacts-static/contacts-static.component';

import { AnalyticsComponent } from './analytics/analytics.component';
import { PanoramicaComponent } from './analytics/panoramica/panoramica.component';
import { MetricsComponent } from './analytics/metrics/metrics.component';
import { RealtimeComponent } from './analytics/realtime/realtime.component';

import { TriggerComponent } from './trigger/trigger.component';
import { TriggerEditComponent } from './trigger/trigger-edit/trigger-edit.component';
import { TriggerAddComponent } from './trigger/trigger-add/trigger-add.component';
import { TriggerStaticComponent } from './static-pages/trigger-static/trigger-static.component';
import { NotificationEmailComponent } from './project-edit-add/notification-email/notification-email.component';
import { SmtpSettingsComponent } from './project-edit-add/smtp-settings/smtp-settings.component';
// import { UserProfileComponent } from './ui/user-profile/user-profile.component';

/* PRIVATE */
import { PricingComponent } from './pricing/pricing.component';
import { PaymentSuccessPageComponent } from './pricing/payment-success-page/payment-success-page.component';
import { PaymentCanceledPageComponent } from './pricing/payment-canceled-page/payment-canceled-page.component';
import { PaymentsListComponent } from './pricing/payments-list/payments-list.component';
import { CreateProjectComponent } from './create-project-wizard/create-project/create-project.component';
import { OnboardingContentComponent } from './create-new-project/onboarding-content/onboarding-content.component';

import { InstallWidgetComponent } from './create-project-wizard/install-widget/install-widget.component';
import { ConfigureWidgetComponent } from './create-project-wizard/configure-widget/configure-widget.component';
import { LoadingPageComponent } from './loading-page/loading-page.component';
import { CannedResponsesListComponent } from './canned-responses/canned-responses-list.component';
import { TagsComponent } from './tags/tags.component';
import { ProjectsForPanelComponent } from './projects/for-panel/projects-for-panel/projects-for-panel.component';

import { WsRequestsUnservedForPanelComponent } from './ws_requests/for-panel/ws-requests-unserved-for-panel/ws-requests-unserved-for-panel.component';
import { AppStoreComponent } from './app-store/app-store.component';
import { AppStoreInstallComponent } from './app-store/app-store-install/app-store-install.component';

import { WebhookComponent } from './webhook/webhook.component';
import { NotificationSettingsComponent } from './user-profile/notification-settings/notification-settings.component';
import { MessagesComponent } from './analytics/metrics/messages/messages.component';
import { RequestsComponent } from './analytics/metrics/requests/requests.component';
import { NativeBotComponent } from './bots/native-bot/native-bot.component';
import { NativeBotSelectTypeComponent } from './bots/native-bot-select-type/native-bot-select-type.component';
import { RasaBotComponent } from './bots/rasa-bot/rasa-bot.component';
import { EmailTicketingComponent } from './email-ticketing/email-ticketing.component';
import { AppCreateComponent } from './app-store/app-create/app-create.component';
import { WidgetInstallationComponent } from './widget-installation/widget-installation.component';
import { TilebotSelectTypeComponent } from './bots/tilebot-select-type/tilebot-select-type.component';
import { TilebotComponent } from './bots/tilebot/tilebot.component';
import { OnboardingComponent } from './create-project-wizard/onboarding/onboarding.component';
import { GetStartChatbotForkComponent } from './create-project-wizard/get-start-chatbot-fork/get-start-chatbot-fork.component';
import { InstallTemplateComponent } from './create-project-wizard/install-template/install-template.component';
import { ContactsComponent } from './contacts/contacts.component';

// Lazy loading
// import { ContactsComponent } from './contacts/contacts.component';
// import { ContactsModule } from './contacts/contacts.module';
import { CdsDashboardComponent } from './chatbot-design-studio/cds-dashboard/cds-dashboard.component';
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



const routes: Routes = [

  // Lazy loading
  { path: 'project/:projectid/contacts', component: ContactsComponent, canActivate: [AuthGuard, ProjectProfileGuard] },
  // {
  //   canActivate: [AuthGuard],
  //   path: 'project/:projectid/contacts',
  //   loadChildren: () => import('./contacts/contacts.module').then(m => m.ContactsModule)
  // },

  { path: 'project/:projectid/contacts-demo', component: ContactsStaticComponent, canActivate: [AuthGuard] },
  
  

  /* PRIVATE */
  { path: 'project/:projectid/pricing', component: PricingComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/chat-pricing', component: PricingComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/success', component: PaymentSuccessPageComponent, canActivate: [AuthGuard] },
  { path: 'success', component: PaymentSuccessPageComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/canceled', component: PaymentCanceledPageComponent, canActivate: [AuthGuard] },


  { path: 'project/:projectid/template-details/:templateid', component: CommunityTemplateDtlsComponent },

  // PROJECTS IS THE NEW HOME
  { path: 'projects', component: ProjectsComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'projects', pathMatch: 'full' },

  // are used in the left panel of the chat
  { path: 'projects-for-panel', component: ProjectsForPanelComponent, canActivate: [AuthGuard] },
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

  { path: 'project/:projectid/cannedresponses', component: CannedResponsesListComponent, canActivate: [AuthGuard , ProjectProfileGuard] },
  { path: 'project/:projectid/cannedresponses-demo', component: CannedResponsesStaticComponent, canActivate: [AuthGuard]},
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
  { path: 'project/:projectid/home', component: HomeComponent, canActivate: [AuthGuard] },

  { path: 'login', component: SigninComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'signup-on-invitation/:pendinginvitationemail', component: SignupComponent },
  { path: 'verify/email/:user_id', component: VerifyEmailComponent },

  // -------------------------------------------------
  // Autologin 
  // -------------------------------------------------
  { path: 'autologin/:route/:token', component: AutologinComponent },



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
  { path: 'project/:projectid/wsrequests', component: WsRequestsListComponent, canActivate: [AuthGuard, ProjectProfileGuard] },
  { path: 'project/:projectid/wsrequests-demo', component: WsrequestsStaticComponent, canActivate: [AuthGuard] },

  { path: 'project/:projectid/request-for-panel/:requestid', component: WsRequestsMsgsComponent, canActivate: [AuthGuard] },

  { path: 'project/:projectid/unserved-request-for-panel', component: WsRequestsUnservedForPanelComponent, canActivate: [AuthGuard] },

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

  // -----------------------------------------
  // NEW  replace the path ...createfaq and ...editfaq
  // -----------------------------------------
  { path: 'project/:projectid/cds/:faqkbid', component: CdsDashboardComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/cds/:faqkbid/intent/:intent_id', component: CdsDashboardComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/cds/:faqkbid/intent/:intent_id/:calledby', component: CdsDashboardComponent, canActivate: [AuthGuard] },
  
  { path: 'project/:projectid/tilebot/intents/:faqkbid/:type', component: TilebotComponent, canActivate: [AuthGuard] },

  // old
  // { path: 'project/:projectid/tilebot/intents/:faqkbid/:type', component: TilebotComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/_createfaq/:faqkbid/:bottype/:botlang', component: FaqEditAddComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/_editfaq/:faqkbid/:faqid/:bottype', component: FaqEditAddComponent, canActivate: [AuthGuard] },

  // TEST-FAQ PAGE
  // { path: 'project/:projectid/faq/test/:remoteFaqKbKey/:faqkbid', component: FaqTestComponent, canActivate: [AuthGuard] },
  // TEST-FAQ PAGE NEW URL

  { path: 'project/:projectid/analytics', component: AnalyticsComponent, canActivate: [AuthGuard, ProjectProfileGuard] },
  { path: 'project/:projectid/analytics/metrics', component: AnalyticsComponent, canActivate: [AuthGuard, ProjectProfileGuard] },
  { path: 'project/:projectid/analytics/metrics/visitors', component: AnalyticsComponent, canActivate: [AuthGuard, ProjectProfileGuard] },
  { path: 'project/:projectid/analytics/metrics/messages', component: AnalyticsComponent, canActivate: [AuthGuard, ProjectProfileGuard] },


  { path: 'project/:projectid/analytics-demo', component: AnalyticsStaticComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/analytics/metrics-demo', component: AnalyticsStaticComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/analytics/metrics/visitors-demo', component: AnalyticsStaticComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/analytics/metrics/messages-demo', component: AnalyticsStaticComponent, canActivate: [AuthGuard] },

  { path: 'project/:projectid/messages-analytics', component: MessagesComponent, canActivate: [AuthGuard] }, // doesn't works
  { path: 'project/:projectid/conversation-analytics', component: RequestsComponent, canActivate: [AuthGuard] }, // doesn't works


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
 




  // HISTORY & NORT
  { path: 'project/:projectid/history', component: HistoryAndNortConvsComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/all-conversations', component: HistoryAndNortConvsComponent, canActivate: [AuthGuard] },

  { path: 'project/:projectid/history/:hassearcedby', component: HistoryAndNortConvsComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/history/:hassearcedby/:isopenadvancedsearch', component: HistoryAndNortConvsComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/history/:hassearcedby/:isopenadvancedsearch/:deptid', component: HistoryAndNortConvsComponent, canActivate: [AuthGuard] },

  { path: 'project/:projectid/all-conversations/:hassearcedby', component: HistoryAndNortConvsComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/all-conversations/:hassearcedby/:isopenadvancedsearch', component: HistoryAndNortConvsComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/all-conversations/:hassearcedby/:isopenadvancedsearch/:deptid', component: HistoryAndNortConvsComponent, canActivate: [AuthGuard] },

  // Conversation details
  { path: 'project/:projectid/wsrequest/:requestid/messages', component: WsRequestsMsgsComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/wsrequest/:requestid/:calledby/messages', component: WsRequestsMsgsComponent, canActivate: [AuthGuard] },

  { path: 'project/:projectid/wsrequest/:requestid/:calledby/:hassearchedby/messages', component: WsRequestsMsgsComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/wsrequest/:requestid/:calledby/:hassearchedby/:isopenadvancedsearch/messages', component: WsRequestsMsgsComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/wsrequest/:requestid/:calledby/:hassearchedby/:isopenadvancedsearch/:deptid/messages', component: WsRequestsMsgsComponent, canActivate: [AuthGuard] },

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

  // KNOWLEDGE BASES
  { path: 'project/:projectid/knowledge-bases', component: KnowledgeBasesComponent, canActivate: [AuthGuard]},
  { path: 'project/:projectid/knowledge-bases/:calledby', component: KnowledgeBasesComponent, canActivate: [AuthGuard]}, // when called from home
  // RESET PASSORD (i.e. page forgot psw & reset psw )
  { path: 'forgotpsw', component: ResetPswComponent },
  { path: 'resetpassword/:resetpswrequestid', component: ResetPswComponent },


  { path: 'project/:projectid/visitors', component: VisitorsComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/events/:requesterid', component: EventsComponent, canActivate: [AuthGuard] },


  { path: 'project/:projectid/contact/:requesterid', component: ContactDetailsComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/contact/edit/:requesterid', component: ContactEditComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/contact/_edit/:requesterid', component: ContactEditComponent, canActivate: [AuthGuard] }, // called from the dropodown of the chat to change contact email , name amd lastname on fly (use to not display the goBack)
  { path: 'project/:projectid/payments', component: PaymentsListComponent, canActivate: [AuthGuard] },

  { path: 'project/:projectid/app-store', component: AppStoreComponent, canActivate: [AuthGuard] },
  //{ path: 'project/:projectid/app-store-install/:url/:apptitle', component: AppStoreInstallComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/app-store-install/:appid/:reason', component: AppStoreInstallComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/app-store-install/:appid/:reason/:calledby', component: AppStoreInstallComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/app-create', component: AppCreateComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/app-edit/:appid', component: AppCreateComponent, canActivate: [AuthGuard] },
  // Webhook
  { path: 'project/:projectid/webhook', component: WebhookComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/map-request', component: MapRequestComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/email', component: EmailTicketingComponent, canActivate: [AuthGuard, ProjectProfileGuard] },
  { path: 'project/:projectid/email-demo', component: EmailTicketingStaticComponent, canActivate: [AuthGuard] },


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
