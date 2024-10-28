import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { SupportComponent } from './support.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [
  { path: "", component: SupportComponent},
];


@NgModule({
  declarations: [
    SupportComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule ,
  ]
})
export class SupportModule { }
