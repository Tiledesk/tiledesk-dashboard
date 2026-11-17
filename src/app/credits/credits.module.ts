import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MomentModule } from 'ngx-moment';
import { CreditsComponent } from './credits.component';
import { CreditsPipe } from './credits.pipe';
import { CreditsOverviewComponent } from './overview/credits-overview.component';
import { CreditsModelsComponent } from './models/credits-models.component';
import { CreditsHistoryComponent } from './history/credits-history.component';
import { CreditsPricesComponent } from './prices/credits-prices.component';

const routes: Routes = [
  {
    path: '',
    component: CreditsComponent,
    children: [
      { path: '', component: CreditsOverviewComponent },
      { path: 'models', component: CreditsModelsComponent },
      { path: 'history', component: CreditsHistoryComponent },
      { path: 'prices', component: CreditsPricesComponent },
      { path: '**', redirectTo: '' }
    ]
  }
];

@NgModule({
  declarations: [
    CreditsComponent,
    CreditsOverviewComponent,
    CreditsModelsComponent,
    CreditsHistoryComponent,
    CreditsPricesComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    TranslateModule,
    MatProgressSpinnerModule,
    MomentModule,
    CreditsPipe
  ]
})
export class CreditsModule { }
