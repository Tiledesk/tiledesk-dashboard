import { Directive, ElementRef, Input, Renderer2, OnInit, OnDestroy, SimpleChanges, OnChanges } from '@angular/core';

@Directive({
  selector: '[appAutoWidthInput]'
})
export class AutoWidthInputDirective implements OnInit, OnChanges, OnDestroy {
  
  @Input('appAutoWidthInput') placeholder: string = '';
  @Input() minWidth: number = 100;
  @Input() padding: number = 20;

  private measureElement: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.createMeasureElement();
    this.updateInputWidth();
    this.setupResizeObserver();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['placeholder']) {
      this.updateInputWidth();
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private createMeasureElement(): void {
    this.measureElement = this.renderer.createElement('span');
    this.renderer.setStyle(this.measureElement, 'position', 'absolute');
    this.renderer.setStyle(this.measureElement, 'visibility', 'hidden');
    this.renderer.setStyle(this.measureElement, 'white-space', 'pre');
    this.renderer.setStyle(this.measureElement, 'font-family', getComputedStyle(this.elementRef.nativeElement).fontFamily);
    this.renderer.setStyle(this.measureElement, 'font-size', getComputedStyle(this.elementRef.nativeElement).fontSize);
    this.renderer.setStyle(this.measureElement, 'font-weight', getComputedStyle(this.elementRef.nativeElement).fontWeight);
    this.renderer.setStyle(this.measureElement, 'letter-spacing', getComputedStyle(this.elementRef.nativeElement).letterSpacing);
    this.renderer.appendChild(document.body, this.measureElement);
  }

  private updateInputWidth(): void {
    if (!this.measureElement || !this.placeholder) return;

    this.renderer.setProperty(this.measureElement, 'textContent', this.placeholder);
    const textWidth = this.measureElement.offsetWidth;
    const finalWidth = Math.max(textWidth + this.padding, this.minWidth);
    
    this.renderer.setStyle(this.elementRef.nativeElement, 'width', `${finalWidth}px`);
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateInputWidth();
      });
      this.resizeObserver.observe(this.elementRef.nativeElement);
    }
  }

  private cleanup(): void {
    if (this.measureElement) {
      this.renderer.removeChild(document.body, this.measureElement);
      this.measureElement = null;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }
}
