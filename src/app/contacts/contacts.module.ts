import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactsComponent } from './contacts.component';
import { RouterModule ,Routes} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MomentModule } from 'ngx-moment';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ContactsWaBroadcastModalComponent } from './contacts-wa-broadcast-modal/contacts-wa-broadcast-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AddNewContactModalComponent } from './add-new-contact-modal/add-new-contact-modal.component';

const routes: Routes = [
  { path: "", component: ContactsComponent},
];

@NgModule({
  declarations: [
    ContactsComponent,
    ContactsWaBroadcastModalComponent,
    AddNewContactModalComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    SharedModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MomentModule,
    MatTooltipModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
  ],
  exports: [
    RouterModule
  ]
})
export class ContactsModule { }
