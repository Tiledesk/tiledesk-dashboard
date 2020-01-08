import { Component, OnInit } from '@angular/core';
import { UsersService } from '../services/users.service';
import { Location } from '@angular/common';
import { PendingInvitation } from '../models/pending-invitation-model';
import { NotifyService } from '../core/notify.service';
import { TranslateService } from '@ngx-translate/core';
import brand from 'assets/brand/brand.json';

@Component({
  selector: 'appdashboard-users-pending',
  templateUrl: './users-pending.component.html',
  styleUrls: ['./users-pending.component.scss']
})

export class UsersPendingComponent implements OnInit {
  tparams = brand;
  
  pending_invites: PendingInvitation;
  pendingInvitationEmail: string;
  resendInviteSuccessNoticationMsg: string;
  resendInviteErrorNoticationMsg: string;
  showSpinner = true;
  constructor(
    private usersService: UsersService,
    private _location: Location,
    private notify: NotifyService,
    private translate: TranslateService

  ) { }

  ngOnInit() {
    this.translateResendInviteSuccessMsg();
    this.translateResendInviteErrorMsg();


    this.getPendingInvitation();
  }

  translateResendInviteSuccessMsg() {
    this.translate.get('UsersPage.ResendInviteSuccessNoticationMsg')
      .subscribe((text: string) => {

        this.resendInviteSuccessNoticationMsg = text;
        console.log('+ + + resend Invite Success Notication Msg', text)
      });
  }

  translateResendInviteErrorMsg() {
    this.translate.get('UsersPage.ResendInviteErrorNoticationMsg')
      .subscribe((text: string) => {

        this.resendInviteErrorNoticationMsg = text;
        console.log('+ + + resend Invite Error Notication Msg', text)
      });
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
        this.showSpinner = false;
      }, () => {
        console.log('GET PENDING INVITATION - COMPLETE');
        this.showSpinner = false;
      });
  }


  deletePendinInvitation(pendingInvitationId: string) {

    console.log('DELETE PENDING INVITATION - INVITATION ID ', pendingInvitationId);
    this.usersService.deletePendingInvitation(pendingInvitationId)
      .subscribe((pendingInvitation: any) => {
        console.log('DELETE PENDING INVITATION ', pendingInvitation);

         }, error => {

        console.log('DELETE PENDING INVITATION - ERROR', error);
      }, () => {
        console.log('DELETE PENDING INVITATION - COMPLETE');
        this.getPendingInvitation();
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
        console.log('GET PENDING INVITATION BY ID AND RESEND INVITE - RES  email', this.pendingInvitationEmail);
      }, error => {

        console.log('GET PENDING INVITATION BY ID AND RESEND INVITE - ERROR', error);
        // this.notify.showNotification('An error occurred sending the email', 4, 'report_problem')
        this.notify.showNotification(this.resendInviteErrorNoticationMsg, 4, 'report_problem')

      }, () => {
        console.log('GET PENDING INVITATION BY ID AND RESEND INVITE - COMPLETE');
        // =========== NOTIFY SUCCESS===========
        //  this.notify.showNotification('Invitation email has been sent to ' + this.pendingInvitationEmail, 2, 'done');
        this.notify.showNotification(this.resendInviteSuccessNoticationMsg + this.pendingInvitationEmail, 2, 'done');
      });
  }

}
