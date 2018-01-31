import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

///// Start FireStarter

// Core
import { CoreModule } from './core/core.module';

// Shared/Widget
import { SharedModule } from './shared/shared.module';

// Feature Modules
import { ItemModule } from './items/shared/item.module';
import { UploadModule } from './uploads/shared/upload.module';
import { UiModule } from './ui/shared/ui.module';
import { NotesModule } from './notes/notes.module';
///// End FireStarter

import { environment } from '../environments/environment';

import { AngularFireModule } from 'angularfire2';
export const firebaseConfig = environment.firebaseConfig;
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { HomeComponent } from './home/home.component';
import { UsersListComponent } from './users-list/users-list.component';
import { ChatComponent } from './chat/chat.component';


import { ContactsService } from './services/contacts.service';
import { UsersService } from './services/users.service';
import { ContactsComponent } from './contacts/contacts.component';
import { HttpModule } from '@angular/http';
import { RequestsListComponent } from './requests-list/requests-list.component';

import { RequestsService } from './services/requests.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    UsersListComponent,
    ContactsComponent,
    RequestsListComponent,
    ChatComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
    ItemModule,
    UiModule,
    NotesModule,
    AngularFireModule.initializeApp(firebaseConfig),
    HttpModule,
  ],
  providers: [UsersService, ContactsService, RequestsService],
  bootstrap: [
    AppComponent,
  ],
})
export class AppModule { }
