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
import { ContactsComponent } from './contacts/contacts.component';
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

import { ProjectEditAddComponent } from './project-edit-add/project-edit-add.component';
// import { RequestsListHistoryComponent } from './requests-list-history/requests-list-history.component';
import { HistoryAndNortConvsComponent } from './ws_requests//history-and-nort-convs/history-and-nort-convs.component';

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

import { Analytics2Component } from './analytics2/analytics2.component';
import { PanoramicaComponent } from './analytics2/panoramica/panoramica.component';
import { MetricheComponent } from './analytics2/metriche/metriche.component';
import { RealtimeComponent } from './analytics2/realtime/realtime.component';

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
import { MessagesComponent } from './analytics2/metriche/messages/messages.component';
import { RichiesteComponent } from './analytics2/metriche/richieste/richieste.component';


// /Users/nicola/TILEDESK-DSHBRD-ENTP/src/app/analytics2/metriche/messages/messages.component.ts
const routes: Routes = [


  /* PRIVATE */
  { path: 'project/:projectid/pricing', component: PricingComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/success', component: PaymentSuccessPageComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/canceled', component: PaymentCanceledPageComponent, canActivate: [AuthGuard] },


  // PROJECTS IS THE NEW HOME
  { path: 'projects', component: ProjectsComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'projects', pathMatch: 'full' },

  // are used in the left panel of the chat
  { path: 'projects-for-panel', component: ProjectsForPanelComponent, canActivate: [AuthGuard] },

  
  // **** NEW - WIZARD CREATE PROJECT ****
  // { path: 'project/create-project', component: CreateProjectComponent, canActivate: [AuthGuard] },

  // FOR CreateProjectComponent I HAVE CREATE TO PATH TO HIDE THE BUTTON 'close' WHEN THE
  // COMPONENT IS CALLED AFTER THE SIGNUP
  // USED AFTER THE SIGNUP
  { path: 'create-project', component: CreateProjectComponent, canActivate: [AuthGuard] }, // wizard 
  // USED WHEN THE USER CLICK ON 'ADD NEW PROJECT' FROM THE NAVBAR
  { path: 'create-new-project', component: CreateProjectComponent, canActivate: [AuthGuard] }, // wizard 
  { path: 'project/:projectid/configure-widget', component: ConfigureWidgetComponent, canActivate: [AuthGuard] }, // wizard step 2
  { path: 'project/:projectid/install-widget', component: InstallWidgetComponent, canActivate: [AuthGuard] }, // wizard step 3

  { path: 'project/:projectid/cannedresponses', component: CannedResponsesListComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/labels', component: TagsComponent, canActivate: [AuthGuard] },

  { path: 'project/create', component: ProjectEditAddComponent, canActivate: [AuthGuard] },

  // { path: 'project/:projectid/edit', component: ProjectEditAddComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/project-settings/general', component: ProjectEditAddComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/project-settings/payments', component: ProjectEditAddComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/project-settings/auth', component: ProjectEditAddComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/project-settings/advanced', component: ProjectEditAddComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/notification-email', component: NotificationEmailComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/smtp-settings', component: SmtpSettingsComponent, canActivate: [AuthGuard] },
  
  
  { path: 'project/:projectid/project-settings/notification', component: ProjectEditAddComponent, canActivate: [AuthGuard] },

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
  { path: 'project/:projectid/wsrequests', component: WsRequestsListComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/wsrequest/:requestid/messages', component: WsRequestsMsgsComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/request-for-panel/:requestid', component: WsRequestsMsgsComponent, canActivate: [AuthGuard] },

   { path: 'project/:projectid/unserved-request-for-panel', component: WsRequestsUnservedForPanelComponent, canActivate: [AuthGuard] },



  // is the dummy component used in ws-requests-msgs: when the user is in the request' details page and 
  // click an in-app notification (of a request unserved or assigned to him) the navigation is redirect to the loading component 
  // and then again to request' details page
  { path: 'project/:projectid/wsrequest/loading', component: LoadingPageComponent, canActivate: [AuthGuard] },
  { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/chat', component: ChatComponent, canActivate: [AuthGuard] },

  // MESSAGES OF A REQUEST (IT BEFORE WERE DISPLAYED IN A MODAL WINDOW)
  // tslint:disable-next-line:max-line-length
  
  // tslint:disable-next-line:max-line-length
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
  { path: 'project/:projectid/bots/bot-select-type', component: BotTypeSelectComponent, canActivate: [AuthGuard] },
  // { path: 'project/:projectid/bots/createfaqkb', component: BotCreateComponent, canActivate: [AuthGuard] }, // replaced by the bottom path
  { path: 'project/:projectid/bots/create/:type', component: BotCreateComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/editfaqkb/:faqkbid', component: BotCreateComponent, canActivate: [AuthGuard] },

  // { path: 'faq/:faqkbid', component: FaqComponent, canActivate: [AuthGuard] }, // used to pass the faq kb id from  in faq page

  /* path /faq/:faqkbid' commented and duplicated RENAMED IN /bots/:faqkbid ( used to pass the faq kb id from  in faq page) */
  // { path: 'project/:projectid/faq/:faqkbid', component: FaqComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/bots/:faqkbid/:type', component: FaqComponent, canActivate: [AuthGuard] },

  { path: 'project/:projectid/createfaq/:faqkbid/:bottype', component: FaqEditAddComponent, canActivate: [AuthGuard] },

  { path: 'project/:projectid/editfaq/:faqkbid/:faqid/:bottype', component: FaqEditAddComponent, canActivate: [AuthGuard] },

  // TEST-FAQ PAGE
  // { path: 'project/:projectid/faq/test/:remoteFaqKbKey/:faqkbid', component: FaqTestComponent, canActivate: [AuthGuard] },
  // TEST-FAQ PAGE NEW URL
  { path: 'project/:projectid/faq/test/:faqkbid', component: FaqTestComponent, canActivate: [AuthGuard] },

  { path: 'project/:projectid/analytics', component: Analytics2Component, canActivate: [AuthGuard, ProjectProfileGuard] },
  { path: 'project/:projectid/analytics/metrics', component: Analytics2Component, canActivate: [AuthGuard, ProjectProfileGuard] },
  { path: 'project/:projectid/analytics/metrics/visitors', component: Analytics2Component, canActivate: [AuthGuard, ProjectProfileGuard] },
  { path: 'project/:projectid/analytics/metrics/messages', component: Analytics2Component, canActivate: [AuthGuard, ProjectProfileGuard] },


  { path: 'project/:projectid/analytics-demo', component: AnalyticsStaticComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/analytics/metrics-demo', component: AnalyticsStaticComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/analytics/metrics/visitors-demo', component: AnalyticsStaticComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/analytics/metrics/messages-demo', component: AnalyticsStaticComponent, canActivate: [AuthGuard] },
 
  { path: 'project/:projectid/messages-analytics', component: MessagesComponent, canActivate: [AuthGuard] }, // doesn't works
  { path: 'project/:projectid/conversation-analytics', component: RichiesteComponent, canActivate: [AuthGuard] }, // doesn't works
  
  

  // , ProjectProfileGuard
  { path: 'project/:projectid/activities', component: ActivitiesComponent, canActivate: [AuthGuard, ProjectProfileGuard] },
  { path: 'project/:projectid/activities-demo', component: ActivitiesStaticComponent, canActivate: [AuthGuard] },


  // , ProjectProfileGuard
  { path: 'project/:projectid/departments', component: DepartmentsComponent, canActivate: [AuthGuard] },
  // 
  { path: 'project/:projectid/department/create', component: DepartmentEditAddComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },

  { path: 'project/:projectid/department/edit/:deptid', component: DepartmentEditAddComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard]},


  // new routing page is the edit department
  { path: 'project/:projectid/routing/:deptid', component: DepartmentEditAddComponent, canActivate: [AuthGuard] }, // new

  { path: 'project/:projectid/departments-demo', component: DepartmentsStaticComponent, canActivate: [AuthGuard] },

  // HISTORY
  // { path: 'project/:projectid/historyrt', component: RequestsListHistoryComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/history', component: HistoryAndNortConvsComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/all-conversations', component: HistoryAndNortConvsComponent, canActivate: [AuthGuard] },
  
  // TRIGGER
  { path: 'project/:projectid/trigger', component: TriggerComponent, canActivate: [AuthGuard, ProjectProfileGuard] },
  { path: 'project/:projectid/trigger-demo', component: TriggerStaticComponent, canActivate: [AuthGuard] },

  { path: 'project/:projectid/trigger/add', component: TriggerAddComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/trigger/:triggerId', component: TriggerEditComponent, canActivate: [AuthGuard] },



  // { path: 'project/:projectid/widget/design', component: WidgetDesignComponent, canActivate: [AuthGuard] },
  // { path: 'project/:projectid/widget/greetings', component: WidgetSetUp, canActivate: [AuthGuard] }, // old
  // { path: 'project/:projectid/widget/callout', component: WidgetSetUp, canActivate: [AuthGuard] }, // old
  // { path: 'project/:projectid/widget/appearance', component: WidgetSetUp, canActivate: [AuthGuard] }, // old
  { path: 'project/:projectid/widget/translations', component: WidgetMultilanguageComponent, canActivate: [AuthGuard] }, // old
  { path: 'project/:projectid/widget-set-up', component: WidgetSetUp, canActivate: [AuthGuard] },

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

  // RESET PASSORD (i.e. page forgot psw & reset psw )
  { path: 'forgotpsw', component: ResetPswComponent },
  { path: 'resetpassword/:resetpswrequestid', component: ResetPswComponent },

  { path: 'project/:projectid/contacts', component: ContactsComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/visitors', component: VisitorsComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/events/:requesterid', component: EventsComponent, canActivate: [AuthGuard] },
  
  
  { path: 'project/:projectid/contact/:requesterid', component: ContactDetailsComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/contact/edit/:requesterid', component: ContactEditComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/payments', component: PaymentsListComponent, canActivate: [AuthGuard] },

  { path: 'project/:projectid/app-store', component: AppStoreComponent, canActivate: [AuthGuard] },
  //{ path: 'project/:projectid/app-store-install/:url/:apptitle', component: AppStoreInstallComponent, canActivate: [AuthGuard] },
  { path: 'project/:projectid/app-store-install/:appid', component: AppStoreInstallComponent, canActivate: [AuthGuard]},

  // Webhook
  { path: 'project/:projectid/webhook', component: WebhookComponent, canActivate: [AuthGuard]},
  { path: 'project/:projectid/map-request', component: MapRequestComponent, canActivate: [AuthGuard]},




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
