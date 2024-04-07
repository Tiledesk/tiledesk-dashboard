import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactsStaticComponent } from './contacts-static.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgImageSliderModule } from 'ng-image-slider';
import { RouterModule, Routes } from '@angular/router';

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
    NgImageSliderModule
  ]
})
export class ContactsStaticModule { }
