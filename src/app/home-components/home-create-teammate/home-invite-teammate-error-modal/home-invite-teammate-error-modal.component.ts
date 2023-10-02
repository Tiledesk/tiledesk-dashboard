import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'appdashboard-home-invite-teammate-error-modal',
  templateUrl: './home-invite-teammate-error-modal.component.html',
  styleUrls: ['./home-invite-teammate-error-modal.component.scss']
})
export class HomeInviteTeammateErrorModalComponent implements OnInit {
 inviteTeammatesErrorMsg: string;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<HomeInviteTeammateErrorModalComponent>,
    public dialog: MatDialog,
    private logger: LoggerService,
  ) { 
    this.logger.log('[INVITE TEMMATE ERROR MODAL] data ', data)
    this.inviteTeammatesErrorMsg = data.error
  }

  ngOnInit(): void {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
