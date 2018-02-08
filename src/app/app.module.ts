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
import { HttpModule } from '@angular/http';

import { HomeComponent } from './home/home.component';

import { ChatComponent } from './chat/chat.component';

// FIRESTORE
import { UsersService } from './services/users.service';
import { UsersListComponent } from './users-list/users-list.component';
import { RequestsService } from './services/requests.service';
import { RequestsListComponent } from './requests-list/requests-list.component';

// MONGO DB
import { MongodbConfService } from './utils/mongodb-conf.service';

import { MongoDbContactsService } from './services/mongodb-contacts.service';
import { ContactsComponent } from './contacts/contacts.component';
import { MongodbDepartmentService } from './services/mongodb-department.service';
import { MongodbDepartmentsComponent } from './mongodb-departments/mongodb-departments.component';

import { MongodbFaqService } from './services/mongodb-faq.service';
import { MongodbFaqComponent } from './mongodb-faq/mongodb-faq.component';
import { BotService } from './services/bot.service';
import { BotsComponent } from './bots/bots.component';
import { SettingsComponent } from './settings/settings.component';
import { UsersComponent } from './users/users.component';
import { FaqKbComponent } from './faq-kb/faq-kb.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    UsersListComponent,
    ContactsComponent,
    RequestsListComponent,
    ChatComponent,
    MongodbDepartmentsComponent,
    MongodbFaqComponent,
    BotsComponent,
    SettingsComponent,
    UsersComponent,
    FaqKbComponent,
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
  providers: [
    UsersService,
    MongoDbContactsService,
    RequestsService,
    MongodbConfService,
    MongodbDepartmentService,
    MongodbFaqService,
    BotService,
  ],
  bootstrap: [
    AppComponent,
  ],
})
export class AppModule { }
