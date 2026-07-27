import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule, Routes } from '@angular/router';
import { StaticPagesCarouselModule } from '../static-pages-carousel/static-pages-carousel.module';
import { ActivitiesStaticComponent } from './activities-static.component';

const routes: Routes = [
  { path: "", component: ActivitiesStaticComponent},
];

@NgModule({
  declarations: [
    ActivitiesStaticComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    MatFormFieldModule,
    MatDatepickerModule,
    NgSelectModule,
    TranslateModule,
    StaticPagesCarouselModule,
  ]
})
export class ActivitiesStaticModule { }
