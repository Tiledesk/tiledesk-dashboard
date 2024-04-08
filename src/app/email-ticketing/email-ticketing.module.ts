import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailTicketingComponent } from './email-ticketing.component';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsSidebarModule } from 'app/components/settings-sidebar/settings-sidebar.module';
import { SharedModule } from 'app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

const routes: Routes = [
  { path: "", component: EmailTicketingComponent},
];

@NgModule({
  declarations: [
    EmailTicketingComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    SettingsSidebarModule,
    SharedModule,
    FormsModule,
    NgSelectModule
  ]
})
export class EmailTicketingModule { }
