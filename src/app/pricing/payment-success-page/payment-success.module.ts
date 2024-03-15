import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule ,Routes} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { PaymentSuccessPageComponent } from './payment-success-page.component';

const routes: Routes = [
  { path: "", component: PaymentSuccessPageComponent},
];

@NgModule({
  declarations: [
    PaymentSuccessPageComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    SharedModule
  ],
  exports: [
    RouterModule
  ]
})
export class PaymentSuccessModule { }
