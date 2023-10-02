import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LoggerService } from 'app/services/logger/logger.service';
import {FormControl, Validators} from '@angular/forms';
@Component({
  selector: 'appdashboard-home-invite-teammate-modal',
  templateUrl: './home-invite-teammate-modal.component.html',
  styleUrls: ['./home-invite-teammate-modal.component.scss']
})
export class HomeInviteTeammateModalComponent implements OnInit {
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  selectFormControl = new FormControl('', Validators.required);
  teammateEmail: string;
  selectedRole: string;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<HomeInviteTeammateModalComponent>,
    public dialog: MatDialog,
    public logger: LoggerService,
  ) { }

  ngOnInit(): void {
  }

  setSelected(value) {
    // this.logger.log('setSelected value', value )
    this.selectedRole = value
  }

  onOkPresssed(teammateEmail ){
    this.dialogRef.close({'email': teammateEmail, role: this.selectedRole });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
