import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactsStaticComponent } from './contacts-static.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule, Routes } from '@angular/router';
import { StaticPagesCarouselModule } from '../static-pages-carousel/static-pages-carousel.module';

const routes: Routes = [
  { path: "", component: ContactsStaticComponent},
];

@NgModule({
  declarations: [
    ContactsStaticComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    StaticPagesCarouselModule,
  ]
})
export class ContactsStaticModule { }
