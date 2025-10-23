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
import { UnauthorizedForSettingsModule } from 'app/auth/unauthorized-for-settings/unauthorized-for-settings.module';

const routes: Routes = [
  { path: "", component: ContactsComponent},
];

@NgModule({
  declarations: [
    ContactsComponent
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
    UnauthorizedForSettingsModule
  ],
  exports: [
    RouterModule
  ]
})
export class ContactsModule { }
