import { Component, Input } from '@angular/core';

export interface TeammateAvatarView {
  initials: string;
  background: string;
}

@Component({
  selector: 'activities-teammate-avatar',
  templateUrl: './activities-teammate-avatar.component.html',
  styleUrls: ['./activities-teammate-avatar.component.scss'],
})
export class ActivitiesTeammateAvatarComponent {
  @Input() view: TeammateAvatarView | null = null;
}
