import { Component, OnInit } from '@angular/core';
import { UsersService } from '../services/users.service';
import { Location } from '@angular/common';
import { PendingInvitation } from '../models/pending-invitation-model';

@Component({
  selector: 'appdashboard-users-pending',
  templateUrl: './users-pending.component.html',
  styleUrls: ['./users-pending.component.scss']
})

export class UsersPendingComponent implements OnInit {

  pending_invites: PendingInvitation;

  constructor(
    private usersService: UsersService,
    private _location: Location

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


}
