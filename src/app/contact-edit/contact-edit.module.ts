import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactEditComponent } from './contact-edit.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { RouterModule ,Routes} from '@angular/router';

const routes: Routes = [
  { path: "", component: ContactEditComponent},
];

@NgModule({
  declarations: [
    ContactEditComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    SharedModule,
  ],
  exports: [
    RouterModule
  ]
})
export class ContactEditModule { }
