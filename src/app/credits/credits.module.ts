import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MomentModule } from 'ngx-moment';
import { CreditsComponent } from './credits.component';
import { CreditsPipe } from './credits.pipe';

const routes: Routes = [
  { path: '', component: CreditsComponent },
];

@NgModule({
  declarations: [
    CreditsComponent
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
