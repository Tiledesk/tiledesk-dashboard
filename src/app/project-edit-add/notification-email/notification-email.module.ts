import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationEmailComponent } from './notification-email.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { FormsModule } from '@angular/forms';

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
  ]
})
export class NotificationEmailModule { }
