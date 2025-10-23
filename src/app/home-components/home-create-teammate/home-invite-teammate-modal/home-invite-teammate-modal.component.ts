import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LoggerService } from 'app/services/logger/logger.service';
import {FormControl, Validators} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RolesService } from 'app/services/roles.service';
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
  roles: any;
  private unsubscribe$: Subject<any> = new Subject<any>();
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<HomeInviteTeammateModalComponent>,
    public dialog: MatDialog,
    public logger: LoggerService,
    private rolesService: RolesService,
  ) { }

  ngOnInit(): void {
    this.getRoles()
  }

   getRoles() {
      this.rolesService.getAllRoles()
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe((res: any) => {
          console.log('[HOME-MODAL-INVITE-USER] - GET ROLES - RES ', res);
          this.roles = res
  
        }, error => {
  
        
          console.error('[HOME-MODAL-INVITE-USER] - GET ROLES - ERROR: ', error);
        }, () => {
    
          console.log('[HOME-MODAL-INVITE-USER] - GET ROLES * COMPLETE *')
        });
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
