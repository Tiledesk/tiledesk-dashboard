import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PaymentsListComponent } from './payments-list.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';

const routes: Routes = [
  { path: "", component: PaymentsListComponent},
];


@NgModule({
  declarations: [
    PaymentsListComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule,
    TranslateModule,
  ],
  exports: [
    RouterModule,
  ]
})
export class PaymentsListModule { }
