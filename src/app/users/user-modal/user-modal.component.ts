import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoggerService } from 'app/services/logger/logger.service';
import { UsersService } from 'app/services/users.service';
@Component({
  selector: 'appdashboard-user-modal',
  templateUrl: './user-modal.component.html',
  styleUrls: ['./user-modal.component.scss']
})
export class UserModalComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<UserModalComponent>,
    private logger: LoggerService,
    private usersService: UsersService,
  ) { 
    this.logger.log('[USER-MODAL] data ', data)
  }

  ngOnInit(): void {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onOkPresssed() {
    this.dialogRef.close();
   this.resetBusyStatus()
  }

  resetBusyStatus() {
    this.usersService.resetBusyStatus().subscribe((res: any) => {

      this.logger.log('[USER-MODAL] REST BUSY STATUS RES ', res)

    }, (error) => {
      this.logger.error('[USER-MODAL] REST BUSY STATUS - ERROR  ', error);
      

    }, () => {
      this.logger.log('[USER-MODAL] REST BUSY STATUS  * COMPLETE *');
    });
  }

}
