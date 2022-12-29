import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContactsRoutingModule } from './contacts-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ContactsComponent } from './contacts.component';


@NgModule({
  declarations: [ContactsComponent],
  imports: [
    CommonModule,
    ContactsRoutingModule,
    TranslateModule,
    FormsModule
  ]
})
export class ContactsModule { }
