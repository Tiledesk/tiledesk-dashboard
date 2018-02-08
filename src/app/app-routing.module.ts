import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserLoginComponent } from './ui/user-login/user-login.component';
import { ItemsListComponent } from './items/items-list/items-list.component';
import { ReadmePageComponent } from './ui/readme-page/readme-page.component';
import { NotesListComponent } from './notes/notes-list/notes-list.component';
import { HomeComponent } from './home/home.component';

// NK
import { UsersListComponent } from './users-list/users-list.component';
import { ContactsComponent } from './contacts/contacts.component';
import { RequestsListComponent } from './requests-list/requests-list.component';
import { MongodbDepartmentsComponent } from './mongodb-departments/mongodb-departments.component';
import { MongodbFaqComponent } from './mongodb-faq/mongodb-faq.component';
import { BotsComponent } from './bots/bots.component';
import { SettingsComponent } from './settings/settings.component';
import { UsersComponent } from './users/users.component';

import { FaqKbComponent} from './faq-kb/faq-kb.component';

// Andrea
import { ChatComponent } from './chat/chat.component';

import { UserProfileComponent } from './ui/user-profile/user-profile.component';

import { AuthGuard } from './core/auth.guard';
import { CoreModule } from './core/core.module';

const routes: Routes = [
  // { path: '', component: ReadmePageComponent }
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: UserLoginComponent },
  // firestore user CRUD
  // { path: 'users', component: UsersListComponent, canActivate: [AuthGuard]},
  { path: 'contacts', component: ContactsComponent },
  { path: 'items', component: ItemsListComponent, canActivate: [AuthGuard] },
  { path: 'notes', component: NotesListComponent, canActivate: [AuthGuard] },
  { path: 'userprofile', component: UserProfileComponent },
  { path: 'requests', component: RequestsListComponent, canActivate: [AuthGuard]},
  { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },
  { path: 'departments', component: MongodbDepartmentsComponent, canActivate: [AuthGuard] },
  { path: 'bots', component: BotsComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: 'users', component:  UsersComponent, canActivate: [AuthGuard] },
  { path: 'faqkb', component:  FaqKbComponent, canActivate: [AuthGuard] },
  { path: 'faq', component: MongodbFaqComponent, canActivate: [AuthGuard] },

  // uploads are lazy loaded
  { path: 'uploads', loadChildren: './uploads/shared/upload.module#UploadModule', canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard],
})
export class AppRoutingModule { }
