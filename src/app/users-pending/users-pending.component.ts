import { Component, OnInit } from '@angular/core';
import { UsersService } from '../services/users.service';
import { Location } from '@angular/common';
import { PendingInvitation } from '../models/pending-invitation-model';
import { NotifyService } from '../core/notify.service';

@Component({
  selector: 'appdashboard-users-pending',
  templateUrl: './users-pending.component.html',
  styleUrls: ['./users-pending.component.scss']
})

export class UsersPendingComponent implements OnInit {

  pending_invites: PendingInvitation;
  pendingInvitationEmail: string;
  constructor(
    private usersService: UsersService,
    private _location: Location,
    private notify: NotifyService

  ) { }

  ngOnInit() {

    this.getPendingInvitation();
  }


  getPendingInvitation() {
    this.usersService.getPendingUsers()
      .subscribe((pendingInvitation: any) => {
        console.log('GET PENDING INVITATION ', pendingInvitation);

        if (pendingInvitation) {
          this.pending_invites = pendingInvitation
        }

      }, error => {

        console.log('GET PENDING INVITATION - ERROR', error);
      }, () => {
        console.log('GET PENDING INVITATION - COMPLETE');
      });

  }
  goBack() {
    this._location.back();
  }

  resendInvite(pendingInvitationId: string) {
    console.log('RESEND INVITE TO PENDING INVITATION ID: ', pendingInvitationId);
    this.usersService.getPendingUsersByIdAndResendEmail(pendingInvitationId)
      .subscribe((pendingInvitation: any) => {
        console.log('GET PENDING INVITATION BY ID AND RESEND INVITE - RES ', pendingInvitation);
        this.pendingInvitationEmail = pendingInvitation['Resend invitation email to']['email'];
        console.log('GET PENDING INVITATION BY ID AND RESEND INVITE - RES  email',  this.pendingInvitationEmail);
      }, error => {

        console.log('GET PENDING INVITATION BY ID AND RESEND INVITE - ERROR', error);
        this.notify.showNotification('An error occurred sending the email', 4, 'report_problem')
      }, () => {
        console.log('GET PENDING INVITATION BY ID AND RESEND INVITE - COMPLETE');
           // =========== NOTIFY SUCCESS===========
           this.notify.showNotification('Invitation email has been sent to ' + this.pendingInvitationEmail, 2, 'done');
      });
  }

}
