import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { TableListComponent } from './table-list/table-list.component';
import { TypographyComponent } from './typography/typography.component';
import { IconsComponent } from './icons/icons.component';
import { MapsComponent } from './maps/maps.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { UpgradeComponent } from './upgrade/upgrade.component';

import { AuthGuard } from './core/auth.guard';
import { CoreModule } from './core/core.module';

import { UserLoginComponent } from './ui/user-login/user-login.component';
import { ItemsListComponent } from './items/items-list/items-list.component';
import { ReadmePageComponent } from './ui/readme-page/readme-page.component';
import { NotesListComponent } from './notes/notes-list/notes-list.component';
import { HomeComponent } from './home/home.component';

// NK
import { UsersListComponent } from './users-list/users-list.component';
import { ContactsComponent } from './contacts/contacts.component';
import { RequestsListComponent } from './requests-list/requests-list.component';
import { DepartmentsComponent } from './departments/departments.component';
import { DepartmentEditAddComponent } from './department-edit-add/department-edit-add.component';

import { BotsComponent } from './bots/bots.component';
import { ProjectsComponent } from './projects/projects.component';
import { UsersComponent } from './users/users.component';

// FAQ
import { FaqComponent } from './faq/faq.component';
import { FaqEditAddComponent } from './faq-edit-add/faq-edit-add.component';
import { FaqKbComponent } from './faq-kb/faq-kb.component';
import { FaqKbEditAddComponent } from './faq-kb-edit-add/faq-kb-edit-add.component';

import { BotEditAddComponent } from './bot-edit-add/bot-edit-add.component';
import { AnalyticsComponent } from './analytics/analytics.component';

import { ProjectEditAddComponent } from './project-edit-add/project-edit-add.component';

// import { DashboardComponent} from './dashboard/dashboard.component';
// Andrea
import { ChatComponent } from './chat/chat.component';

// import { UserProfileComponent } from './ui/user-profile/user-profile.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'user-profile', component: UserProfileComponent },
  { path: 'table-list', component: TableListComponent },
  { path: 'typography', component: TypographyComponent },
  { path: 'icons', component: IconsComponent },
  { path: 'maps', component: MapsComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'upgrade', component: UpgradeComponent },
  // { path: '',               redirectTo: 'dashboard', pathMatch: 'full' }

  // CHAT 21
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: UserLoginComponent },
  // firestore user CRUD
  // { path: 'users', component: UsersListComponent, canActivate: [AuthGuard]},
  { path: 'contacts', component: ContactsComponent },
  { path: 'items', component: ItemsListComponent, canActivate: [AuthGuard] },
  { path: 'notes', component: NotesListComponent, canActivate: [AuthGuard] },
  { path: 'userprofile', component: UserProfileComponent },
  { path: 'requests', component: RequestsListComponent, canActivate: [AuthGuard] },
  { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },
  { path: 'departments', component: DepartmentsComponent, canActivate: [AuthGuard] },

  { path: 'users', component: UsersComponent, canActivate: [AuthGuard] },
  { path: 'faqkb', component: FaqKbComponent, canActivate: [AuthGuard] },
  { path: 'createfaqkb', component: FaqKbEditAddComponent, canActivate: [AuthGuard] },
  { path: 'editfaqkb/:faqkbid', component: FaqKbEditAddComponent, canActivate: [AuthGuard] },
  { path: 'faq/:faqkbid', component: FaqComponent, canActivate: [AuthGuard] }, // used to pass the faq kb id from  in faq page
  { path: 'createfaq/:faqkbid', component: FaqEditAddComponent, canActivate: [AuthGuard] },
  { path: 'editfaq/:faqkbid/:faqid', component: FaqEditAddComponent, canActivate: [AuthGuard] },
  { path: 'createbot', component: BotEditAddComponent, canActivate: [AuthGuard] },
  { path: 'editbot/:botid', component: BotEditAddComponent, canActivate: [AuthGuard] },
  { path: 'analytics', component: AnalyticsComponent, canActivate: [AuthGuard] },
  { path: 'bots', component: BotsComponent, canActivate: [AuthGuard] },

  { path: 'projects', component: ProjectsComponent, canActivate: [AuthGuard] },

  { path: 'department/create', component: DepartmentEditAddComponent, canActivate: [AuthGuard] },
  { path: 'department/edit/:deptid', component: DepartmentEditAddComponent, canActivate: [AuthGuard] },

  { path: 'project/create', component: ProjectEditAddComponent, canActivate: [AuthGuard] },
  { path: 'project/edit/:projectid', component: ProjectEditAddComponent, canActivate: [AuthGuard] },

  { path: 'dashboard', component: DashboardComponent },

  // uploads are lazy loaded
  { path: 'uploads', loadChildren: './uploads/shared/upload.module#UploadModule', canActivate: [AuthGuard] },
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule],
  providers: [AuthGuard],
})
export class AppRoutingModule { }
