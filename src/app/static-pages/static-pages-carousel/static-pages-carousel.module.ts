import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaticPagesCarouselComponent } from './static-pages-carousel.component';

@NgModule({
  declarations: [StaticPagesCarouselComponent],
  imports: [CommonModule],
  exports: [StaticPagesCarouselComponent],
})
export class StaticPagesCarouselModule {}
