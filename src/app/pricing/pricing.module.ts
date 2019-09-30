import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


import { TranslateModule } from '@ngx-translate/core';
import { PaymentSuccessPageComponent } from './payment-success-page/payment-success-page.component';
import { PaymentCanceledPageComponent } from './payment-canceled-page/payment-canceled-page.component';
import { PricingComponent } from './pricing.component';
import { PaymentsListComponent } from './payments-list/payments-list.component';
// import { LoadingSpinnerComponent } from '../ui/loading-spinner/loading-spinner.component';
import { SharedModule } from '../shared/shared.module';
import { PricingBaseComponent } from './pricing-base/pricing-base.component';
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
    PricingComponent,
    PaymentsListComponent,
    PricingBaseComponent,
    // LoadingSpinnerComponent
  ],
  exports: [
    PaymentSuccessPageComponent,
    PaymentCanceledPageComponent,
    PricingComponent,
    TranslateModule,
    // LoadingSpinnerComponent
  ]
})
export class PricingModule { }
