import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatMenuPanel } from '@angular/material/menu';

import { ActivitiesTeammateLookupService } from '../../services/activities-teammate-lookup.service';
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
  @Input() participantId = '';
  @Input() showEmail = true;
  @Input() menuTrigger: MatMenuPanel | null = null;
  @Output() linkClick = new EventEmitter<MouseEvent>();

  constructor(private teammateLookup: ActivitiesTeammateLookupService) {}

  /** Same rule as hiding "Go to profile": user not in current project_users. */
  get showRemovedBadge(): boolean {
    return this.teammateLookup.shouldShowRemovedBadge(this.participantId);
  }

  get displayEmail(): string {
    if (!this.showEmail || !this.participantId) {
      return '';
    }

    return this.teammateLookup.getDisplayEmail(this.participantId);
  }

  onClick(event: MouseEvent): void {
    this.linkClick.emit(event);
  }
}
