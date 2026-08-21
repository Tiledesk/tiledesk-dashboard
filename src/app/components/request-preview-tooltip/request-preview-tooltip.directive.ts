import {
  ComponentRef,
  Directive,
  ElementRef,
  HostListener,
  Injector,
  Input,
  OnDestroy,
} from '@angular/core';
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { RequestPreviewTooltipComponent } from './request-preview-tooltip.component';

/** Gap between sidebar right edge and tooltip left edge (A14-like). */
const SIDEBAR_GAP_PX = 8;
const TOOLTIP_MIN_WIDTH = 470;
const TOOLTIP_MAX_WIDTH = 560;

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

    const maxWidth = Math.min(
      TOOLTIP_MAX_WIDTH,
      Math.max(TOOLTIP_MIN_WIDTH, window.innerWidth - this.getMinLeft() - 24)
    );

    this.overlayRef = this.overlay.create({
      positionStrategy: this.buildPositionStrategy(maxWidth),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      panelClass: ['custom-ng2-tooltip', 'td-request-preview-overlay'],
      minWidth: TOOLTIP_MIN_WIDTH,
      maxWidth,
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

    // After layout, clamp again if real width differs from estimate and sync arrow.
    requestAnimationFrame(() => this.finalizePlacement());
  }

  private buildPositionStrategy(estimatedWidth: number) {
    const originRect = this.elementRef.nativeElement.getBoundingClientRect();
    const minLeft = this.getMinLeft();
    const idealLeft =
      originRect.left + originRect.width / 2 - estimatedWidth / 2;
    // Push right so the tooltip stays in the main panel (never over the sidebar).
    const offsetX = Math.max(0, minLeft - idealLeft);

    const positions: ConnectedPosition[] = [
      {
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom',
        offsetY: -10,
        offsetX,
      },
      {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom',
        offsetY: -10,
        offsetX: Math.max(0, minLeft - originRect.left),
      },
      {
        originX: 'end',
        originY: 'top',
        overlayX: 'end',
        overlayY: 'bottom',
        offsetY: -10,
      },
    ];

    return this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef)
      .withFlexibleDimensions(false)
      .withPush(true)
      .withViewportMargin(8)
      .withPositions(positions);
  }

  private finalizePlacement(): void {
    if (!this.overlayRef?.hasAttached()) {
      return;
    }

    const pane = this.overlayRef.overlayElement;
    const minLeft = this.getMinLeft();
    const rect = pane.getBoundingClientRect();

    if (rect.left < minLeft - 0.5) {
      const originRect = this.elementRef.nativeElement.getBoundingClientRect();
      const measuredOffsetX = Math.max(
        0,
        minLeft - (originRect.left + originRect.width / 2 - rect.width / 2)
      );
      this.overlayRef.updatePositionStrategy(
        this.overlay
          .position()
          .flexibleConnectedTo(this.elementRef)
          .withFlexibleDimensions(false)
          .withPush(true)
          .withViewportMargin(8)
          .withPositions([
            {
              originX: 'center',
              originY: 'top',
              overlayX: 'center',
              overlayY: 'bottom',
              offsetY: -10,
              offsetX: measuredOffsetX,
            },
          ])
      );
      this.overlayRef.updatePosition();
    }

    this.syncArrowToOrigin();
  }

  private syncArrowToOrigin(): void {
    if (!this.overlayRef?.hasAttached()) {
      return;
    }
    const pane = this.overlayRef.overlayElement;
    const tooltipEl = pane.querySelector(
      '.td-request-preview-tooltip'
    ) as HTMLElement | null;
    if (!tooltipEl) {
      return;
    }

    const originRect = this.elementRef.nativeElement.getBoundingClientRect();
    const tooltipRect = tooltipEl.getBoundingClientRect();
    const originCenter = originRect.left + originRect.width / 2;
    const arrowLeft = Math.min(
      Math.max(originCenter - tooltipRect.left, 16),
      tooltipRect.width - 16
    );
    tooltipEl.style.setProperty(
      '--td-preview-tooltip-arrow-left',
      `${arrowLeft}px`
    );
  }

  /** Left bound of the main panel (sidebar right edge + gap). */
  private getMinLeft(): number {
    const sidebar = document.querySelector('.sidebar') as HTMLElement | null;
    if (sidebar) {
      return Math.ceil(sidebar.getBoundingClientRect().right) + SIDEBAR_GAP_PX;
    }
    return 60 + SIDEBAR_GAP_PX;
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
