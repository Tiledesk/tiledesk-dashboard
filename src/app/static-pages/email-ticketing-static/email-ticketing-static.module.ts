import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailTicketingStaticComponent } from './email-ticketing-static.component';
import { RouterModule, Routes } from '@angular/router';
import { SettingsSidebarModule } from 'app/components/settings-sidebar/settings-sidebar.module';
import { TranslateModule } from '@ngx-translate/core';
import { StaticPagesCarouselModule } from '../static-pages-carousel/static-pages-carousel.module';

const routes: Routes = [
  { path: "", component: EmailTicketingStaticComponent},
];

@NgModule({
  declarations: [
    EmailTicketingStaticComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SettingsSidebarModule,
    TranslateModule,
    StaticPagesCarouselModule,
  ]
})
export class EmailTicketingStaticModule { }
