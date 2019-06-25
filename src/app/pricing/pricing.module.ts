import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

import { TranslateModule } from '@ngx-translate/core';
import { PaymentSuccessPageComponent } from './payment-success-page/payment-success-page.component';
import { PaymentCanceledPageComponent } from './payment-canceled-page/payment-canceled-page.component';
import { PricingComponent } from './pricing.component';

@NgModule({
  imports: [
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
    PaymentSuccessPageComponent,
    PaymentCanceledPageComponent,
    PricingComponent,
    TranslateModule,

  ]
})
export class PricingModule { }
