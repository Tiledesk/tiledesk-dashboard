import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'activities-execution-link',
  templateUrl: './activities-execution-link.component.html',
  styleUrls: ['./activities-execution-link.component.scss'],
})
export class ActivitiesExecutionLinkComponent {
  @Input() label = '';
  @Input() highlighted = false;
  @Output() linkClick = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent): void {
    this.linkClick.emit(event);
  }
}
