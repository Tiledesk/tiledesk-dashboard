import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BotsStaticComponent } from './bots-static.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { StaticPagesCarouselModule } from '../static-pages-carousel/static-pages-carousel.module';

const routes: Routes = [
  { path: "", component: BotsStaticComponent},
];

@NgModule({
  declarations: [
    BotsStaticComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    StaticPagesCarouselModule,
  ]
})
export class BotsStaticModule { }
