import { ChangeDetectorRef, Component, DoCheck, Input } from '@angular/core';
import { CHANNELS_NAME } from 'app/utils/util';

@Component({
  selector: 'app-request-preview-tooltip',
  templateUrl: './request-preview-tooltip.component.html',
})
export class RequestPreviewTooltipComponent implements DoCheck {
  @Input() request: any;

  readonly CHANNELS_NAME = CHANNELS_NAME;
  private msgsArrayLength = -1;

  constructor(private cdr: ChangeDetectorRef) {}

  ngDoCheck(): void {
    const len = this.request?.msgsArray?.length ?? 0;
    if (len !== this.msgsArrayLength) {
      this.msgsArrayLength = len;
      this.cdr.detectChanges();
    }
  }
}
