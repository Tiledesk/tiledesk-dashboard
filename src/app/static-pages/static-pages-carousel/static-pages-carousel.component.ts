import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';

export interface StaticPagesCarouselImage {
  image: string;
  alt?: string;
  thumbImage?: string;
}

@Component({
  selector: 'appdashboard-static-pages-carousel',
  templateUrl: './static-pages-carousel.component.html',
  styleUrls: ['./static-pages-carousel.component.scss']
})
export class StaticPagesCarouselComponent implements OnInit, OnChanges, OnDestroy {
  @Input() images: StaticPagesCarouselImage[] = [];
  /** Autoplay interval in ms (default 4s). Disabled when there is only one image. */
  @Input() intervalMs = 4000;
  @Input() pauseOnHover = true;

  activeIndex = 0;
  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.start();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['images'] && !changes['images'].firstChange) {
      this.activeIndex = 0;
      this.start();
    }
    if (changes['intervalMs'] && !changes['intervalMs'].firstChange) {
      this.start();
    }
  }

  ngOnDestroy(): void {
    this.stop();
  }

  goToSlide(index: number): void {
    if (!this.images?.length) {
      return;
    }
    const len = this.images.length;
    this.activeIndex = ((index % len) + len) % len;
  }

  onMouseEnter(): void {
    if (this.pauseOnHover) {
      this.stop();
    }
  }

  onMouseLeave(): void {
    if (this.pauseOnHover) {
      this.start();
    }
  }

  private start(): void {
    this.stop();
    if (!this.images || this.images.length < 2 || this.intervalMs <= 0) {
      return;
    }
    this.timer = setInterval(() => {
      this.activeIndex = (this.activeIndex + 1) % this.images.length;
    }, this.intervalMs);
  }

  private stop(): void {
    if (this.timer != null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
