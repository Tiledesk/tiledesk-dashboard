import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule ,Routes} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SatPopoverModule } from '@ncstate/sat-popover';
import {MatButtonModule} from '@angular/material/button';
import { HomeWidgetsModule } from '../home-components/home-widgets.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MomentModule } from 'ngx-moment';
const routes: Routes = [
  { path: "", component: HomeComponent},
];

@NgModule({
  declarations: [
    HomeComponent,
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
export class HomeModule { }
