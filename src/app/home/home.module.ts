import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule ,Routes} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HomeWidgetsModule } from 'app/home-components/home-widgets.module';
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
    MatTooltipModule,
    MatMenuModule,
    MatCheckboxModule,
    HomeWidgetsModule
  ],
  exports: [
    RouterModule
  ]
})
export class HomeModule { }
