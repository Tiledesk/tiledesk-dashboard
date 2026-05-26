import {
  ComponentRef,
  Directive,
  ElementRef,
  HostListener,
  Injector,
  Input,
  OnDestroy,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { RequestPreviewTooltipComponent } from './request-preview-tooltip.component';

@Directive({
  selector: '[tdRequestPreviewTooltip]',
})
export class RequestPreviewTooltipDirective implements OnDestroy {
  @Input('tdRequestPreviewTooltip') request: any;
  @Input() tdRequestPreviewLoad: (request: any) => void;

  private overlayRef: OverlayRef | null = null;
  private tooltipComponent: RequestPreviewTooltipComponent | null = null;
  private tooltipComponentRef: ComponentRef<RequestPreviewTooltipComponent> | null = null;

  constructor(
    private overlay: Overlay,
    private elementRef: ElementRef<HTMLElement>,
    private injector: Injector
  ) {}

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.openTooltip();
    if (this.request && this.tdRequestPreviewLoad) {
      this.tdRequestPreviewLoad(this.request);
    }
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.disposeOverlay();
  }

  ngOnDestroy(): void {
    this.disposeOverlay();
  }

  private openTooltip(): void {
    if (!this.request) {
      return;
    }

    if (this.overlayRef?.hasAttached()) {
      this.syncRequestToTooltip();
      return;
    }

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef)
      .withFlexibleDimensions(false)
      .withPush(false)
      .withPositions([
        {
          originX: 'center',
          originY: 'top',
          overlayX: 'center',
          overlayY: 'bottom',
          offsetY: -10,
        },
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      panelClass: ['custom-ng2-tooltip', 'td-request-preview-overlay'],
      minWidth: 470,
    });

    const portal = new ComponentPortal(
      RequestPreviewTooltipComponent,
      null,
      this.injector
    );
    const componentRef = this.overlayRef.attach(portal);
    this.tooltipComponentRef = componentRef;
    this.tooltipComponent = componentRef.instance;
    this.syncRequestToTooltip();
  }

  private syncRequestToTooltip(): void {
    if (this.tooltipComponent) {
      this.tooltipComponent.request = this.request;
      this.tooltipComponentRef?.changeDetectorRef.detectChanges();
    }
  }

  private disposeOverlay(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
    this.tooltipComponent = null;
    this.tooltipComponentRef = null;
  }
}
