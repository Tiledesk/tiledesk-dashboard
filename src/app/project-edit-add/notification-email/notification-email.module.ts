import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationEmailComponent } from './notification-email.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { SettingsSidebarModule } from 'app/components/settings-sidebar/settings-sidebar.module';

const routes: Routes = [
  { path: "", component: NotificationEmailComponent},
];


@NgModule({
  declarations: [
    NotificationEmailComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    SharedModule,
    FormsModule,
    MatTabsModule,
    SettingsSidebarModule,
  ]
})
export class NotificationEmailModule { }
