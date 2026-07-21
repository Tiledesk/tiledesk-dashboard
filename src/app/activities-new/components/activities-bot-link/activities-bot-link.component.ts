import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'activities-bot-link',
  templateUrl: './activities-bot-link.component.html',
  styleUrls: ['./activities-bot-link.component.scss'],
})
export class ActivitiesBotLinkComponent {
  @Input() label = '';
  @Input() highlighted = false;
  @Output() linkClick = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent): void {
    this.linkClick.emit(event);
  }
}
