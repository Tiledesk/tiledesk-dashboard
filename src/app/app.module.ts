import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';

import { AppComponent } from './app.component';

import { DashboardComponent } from './dashboard/dashboard.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { TableListComponent } from './table-list/table-list.component';
import { TypographyComponent } from './typography/typography.component';
import { IconsComponent } from './icons/icons.component';
import { MapsComponent } from './maps/maps.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { UpgradeComponent } from './upgrade/upgrade.component';

// Feature Modules
import { ItemModule } from './items/shared/item.module';
import { UploadModule } from './uploads/shared/upload.module';
import { UiModule } from './ui/shared/ui.module';
import { NotesModule } from './notes/notes.module';
///// Start FireStarter
// Core
import { CoreModule } from './core/core.module';

// Shared/Widget
import { SharedModule } from './shared/shared.module';
import { environment } from '../environments/environment';
import { AngularFireModule } from 'angularfire2';
export const firebaseConfig = environment.firebaseConfig;
import { AngularFirestoreModule } from 'angularfire2/firestore';

import { HomeComponent } from './home/home.component';
import { ChatComponent } from './chat/chat.component';

// FIRESTORE
import { UsersService } from './services/users.service';
import { UsersListComponent } from './users-list/users-list.component';
import { RequestsService } from './services/requests.service';
import { RequestsListComponent } from './requests-list/requests-list.component';

// MONGO DB

import { ContactsService } from './services/contacts.service';
import { ContactsComponent } from './contacts/contacts.component';
import { DepartmentService } from './services/mongodb-department.service';
import { DepartmentsComponent } from './departments/departments.component';

import { MongodbFaqService } from './services/mongodb-faq.service';
import { FaqComponent } from './faq/faq.component';
import { BotService } from './services/bot.service';
import { BotsComponent } from './bots/bots.component';
import { ProjectsComponent } from './projects/projects.component';
import { UsersComponent } from './users/users.component';
import { FaqKbService } from './services/faq-kb.service';
import { FaqKbComponent } from './faq-kb/faq-kb.component';
import { FaqKbEditAddComponent } from './faq-kb-edit-add/faq-kb-edit-add.component';
import { FaqEditAddComponent } from './faq-edit-add/faq-edit-add.component';
import { BotEditAddComponent } from './bot-edit-add/bot-edit-add.component';

import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AnalyticsComponent } from './analytics/analytics.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { DepartmentEditAddComponent } from './department-edit-add/department-edit-add.component';
import { ProjectEditAddComponent } from './project-edit-add/project-edit-add.component';

import { ProjectService } from './services/project.service';
import { RequestsListHistoryComponent } from './requests-list-history/requests-list-history.component';
import { MomentModule } from 'angular2-moment';
import { SigninComponent } from './auth/signin/signin.component';
import { SignupComponent } from './auth/signup/signup.component';
import { UnauthorizedComponent } from './auth/unauthorized/unauthorized.component';
import { ReactiveFormsModule } from '@angular/forms';
import { WidgetComponent } from './widget/widget.component';
import { ScriptComponent } from './script/script.component';
import { ChannelsComponent } from './channels/channels.component';
import { SocialComponent } from './social/social.component';
import { FaqTestComponent } from './faq-test/faq-test.component';
import { UserEditAddComponent } from './user-edit-add/user-edit-add.component';
import { UsersProfileComponent } from './users-profile/users-profile.component';
import { UsersLocalDbService } from './services/users-local-db.service';
import { RoutingPageComponent } from './routing-page/routing-page.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { RequestsMsgsComponent } from './requests-msgs/requests-msgs.component';

import { GroupService } from './services/group.service';
import { GroupsComponent } from './groups/groups.component';
import { GroupEditAddComponent } from './group-edit-add/group-edit-add.component';

import { BotLocalDbService } from './services/bot-local-db.service';
import { ChangePasswordComponent } from './change-password/change-password.component';

// PIPE
import { GroupNamePipe } from './groupname.pipe';
import { SortByPipe } from './sortby.pipe';
import { SortByDesPipe } from './sortbydes.pipe';
import { HoursComponent } from './hours/hours.component';

import { AmazingTimePickerModule } from 'amazing-time-picker';

import { NgSelectModule } from '@ng-select/ng-select';
import { ResetPswComponent } from './reset-psw/reset-psw.component';
import { ResetPswService } from './services/reset-psw.service';
import { WidgetDesignComponent } from './widget-design/widget-design.component';
import { UploadImageService } from './services/upload-image.service';
import { RequestsListHistoryNewComponent } from './requests-list-history-new/requests-list-history-new.component';
import { MyDatePickerModule } from 'mydatepicker';
import { ContactDetailsComponent } from './contact-details/contact-details.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { WidgetService } from './services/widget.service';
import { ContactEditComponent } from './contact-edit/contact-edit.component';


// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    UserProfileComponent,
    TableListComponent,
    TypographyComponent,
    IconsComponent,
    MapsComponent,
    NotificationsComponent,
    UpgradeComponent,
    HomeComponent,
    UsersListComponent,
    ContactsComponent,
    RequestsListComponent,
    ChatComponent,
    DepartmentsComponent,
    FaqComponent,
    BotsComponent,
    ProjectsComponent,
    UsersComponent,
    FaqKbComponent,
    FaqKbEditAddComponent,
    FaqEditAddComponent,
    BotEditAddComponent,
    AnalyticsComponent,
    DepartmentEditAddComponent,
    ProjectEditAddComponent,
    RequestsListHistoryComponent,
    SigninComponent,
    SignupComponent,
    UnauthorizedComponent,
    WidgetComponent,
    ScriptComponent,
    ChannelsComponent,
    SocialComponent,
    FaqTestComponent,
    UserEditAddComponent,
    UsersProfileComponent,
    RoutingPageComponent,
    VerifyEmailComponent,
    RequestsMsgsComponent,
    GroupsComponent,
    GroupEditAddComponent,
    GroupNamePipe,
    SortByPipe,
    SortByDesPipe,
    ChangePasswordComponent,
    HoursComponent,
    ResetPswComponent,
    WidgetDesignComponent,
    RequestsListHistoryNewComponent,
    ContactDetailsComponent,
    ContactEditComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
    ItemModule,
    UiModule,
    NotesModule,
    HttpModule,
    ComponentsModule,
    RouterModule,
    AngularFireModule.initializeApp(firebaseConfig),
    HttpModule,
    HttpClientModule,
    MomentModule,
    AmazingTimePickerModule,
    NgSelectModule,
    MyDatePickerModule,
    ColorPickerModule,
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
      },
  }),
  ],
  providers: [
    UsersService,
    ContactsService,
    RequestsService,
    DepartmentService,
    MongodbFaqService,
    BotService,
    FaqKbService,
    ProjectService,
    UsersLocalDbService,
    GroupService,
    BotLocalDbService,
    ResetPswService,
    UploadImageService,
    WidgetService,
    {provide: LocationStrategy, useClass: HashLocationStrategy}
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
