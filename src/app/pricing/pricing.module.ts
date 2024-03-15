import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule ,Routes} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PricingComponent } from './pricing.component';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [
  { path: "", component: PricingComponent},
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    SharedModule
  ],
  declarations: [
    PricingComponent
  ],
  exports: [
    RouterModule
  ]
})
export class PricingModule { }
