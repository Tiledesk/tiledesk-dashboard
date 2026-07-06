import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatMenuPanel } from '@angular/material/menu';

import { TeammateAvatarView } from '../activities-teammate-avatar/activities-teammate-avatar.component';

@Component({
  selector: 'activities-teammate-link',
  templateUrl: './activities-teammate-link.component.html',
  styleUrls: ['./activities-teammate-link.component.scss'],
})
export class ActivitiesTeammateLinkComponent {
  @Input() label = '';
  @Input() highlighted = false;
  @Input() avatarView: TeammateAvatarView | null = null;
  @Input() menuTrigger: MatMenuPanel | null = null;
  @Output() linkClick = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent): void {
    this.linkClick.emit(event);
  }
}
