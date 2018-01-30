import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserLoginComponent } from './ui/user-login/user-login.component';
import { ItemsListComponent } from './items/items-list/items-list.component';
import { ReadmePageComponent } from './ui/readme-page/readme-page.component';
import { NotesListComponent } from './notes/notes-list/notes-list.component';
import { HomeComponent } from './home/home.component';

// MY
import { UsersListComponent } from './users-list/users-list.component';
import { ContactsComponent } from './contacts/contacts.component';

import { UserProfileComponent } from './ui/user-profile/user-profile.component';

import { AuthGuard } from './core/auth.guard';
import { CoreModule } from './core/core.module';
import { ChatComponent} from './chat/chat.component';

const routes: Routes = [
  // { path: '', component: ReadmePageComponent }
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: UserLoginComponent },
  { path: 'users', component: UsersListComponent, canActivate: [AuthGuard]},
  { path: 'chat', component: ChatComponent, canActivate: [AuthGuard]},
  { path: 'contacts', component: ContactsComponent, canActivate: [AuthGuard]},
  { path: 'items', component: ItemsListComponent, canActivate: [AuthGuard] },
  { path: 'notes', component: NotesListComponent, canActivate: [AuthGuard] },
  { path: 'userprofile', component: UserProfileComponent },

  // uploads are lazy loaded
  { path: 'uploads', loadChildren: './uploads/shared/upload.module#UploadModule', canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard],
})
export class AppRoutingModule { }
