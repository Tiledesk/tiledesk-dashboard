import { Component, ViewEncapsulation } from '@angular/core';

import { NotifyService } from '../../core/notify.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'notification-message',
  templateUrl: './notification-message.component.html',
  styleUrls: ['./notification-message.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NotificationMessageComponent {
  displayExpiredSessionModal: string

  constructor(
    public notify: NotifyService,
    public auth: AuthService
  ) { }

  onOkExpiredSessionModal() {
    this.notify.onOkExpiredSessionModal();
    this.auth.signOut();
  }

}
