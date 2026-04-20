import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Home2Component } from './home2.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MomentModule } from 'ngx-moment';

import { SharedModule } from 'app/shared/shared.module';
import { HomeWidgetsModule } from '../home-components/home-widgets.module';

import { SatPopoverModule } from '@ncstate/sat-popover';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

const routes: Routes = [
  { path: '', component: Home2Component },
];

@NgModule({
  declarations: [
    Home2Component,
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    SharedModule,
    MatTooltipModule,
    MatMenuModule,
    MatIconModule,
    MatCheckboxModule,
    SatPopoverModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MomentModule,
    HomeWidgetsModule,
  ],
  exports: [
    RouterModule
  ]
})
export class Home2Module { }
