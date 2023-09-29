import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'appdashboard-home-invite-teammate-error-modal',
  templateUrl: './home-invite-teammate-error-modal.component.html',
  styleUrls: ['./home-invite-teammate-error-modal.component.scss']
})
export class HomeInviteTeammateErrorModalComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<HomeInviteTeammateErrorModalComponent>,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
