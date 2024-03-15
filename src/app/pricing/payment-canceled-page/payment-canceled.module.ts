import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentCanceledPageComponent } from './payment-canceled-page.component';
import { RouterModule ,Routes} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';

const routes: Routes = [
  { path: "", component: PaymentCanceledPageComponent},
];

@NgModule({
  declarations: [
    PaymentCanceledPageComponent,
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
export class PaymentCanceledModule { }
