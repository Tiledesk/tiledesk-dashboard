import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PaymentSuccessPageComponent } from './payment-success-page/payment-success-page.component';
import { PaymentCanceledPageComponent } from './payment-canceled-page/payment-canceled-page.component';
import { PricingComponent } from './pricing.component';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [
  { path: "", component: PricingComponent},
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    RouterModule,
    TranslateModule,
    SharedModule
  ],
  declarations: [
    PaymentSuccessPageComponent,
    PaymentCanceledPageComponent,
    PricingComponent
  ],
  exports: [
    RouterModule,
  ]
})
export class PricingModule { }
