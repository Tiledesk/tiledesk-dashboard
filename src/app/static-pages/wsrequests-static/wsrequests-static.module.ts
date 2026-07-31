import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { WsrequestsStaticComponent } from './wsrequests-static.component';
import { TranslateModule } from '@ngx-translate/core';
import { StaticPagesCarouselModule } from '../static-pages-carousel/static-pages-carousel.module';

const routes: Routes = [
  { path: "", component: WsrequestsStaticComponent},
];

@NgModule({
  declarations: [
    WsrequestsStaticComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    StaticPagesCarouselModule,
  ]
})
export class WsrequestsStaticModule { }
