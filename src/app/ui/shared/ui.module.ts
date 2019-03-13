import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../shared/shared.module';

import { NavService } from './nav.service';

import { TopNavComponent } from '../top-nav/top-nav.component';
import { FooterNavComponent } from '../footer-nav/footer-nav.component';
import { ReadmePageComponent } from '../readme-page/readme-page.component';
import { NotificationMessageComponent } from '../notification-message/notification-message.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    BrowserAnimationsModule,
  ],
  declarations: [
    TopNavComponent,
    FooterNavComponent,
    ReadmePageComponent,
    NotificationMessageComponent,
  ],
  exports: [
    TopNavComponent,
    FooterNavComponent,
    NotificationMessageComponent,
  ],
})
export class UiModule { }
