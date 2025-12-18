import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'appdashboard-assign-reassign-dialog',
  templateUrl: './assign-reassign-dialog.component.html',
  styleUrls: ['./assign-reassign-dialog.component.scss']
})
export class AssignReassignDialogComponent implements OnInit {
  actionInModal: string;
  CHAT_PANEL_MODE: boolean;
  projectUsersList: any[];
  bots: any[];
  departments: any[];
  showSpinner_inModalUserList: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AssignReassignDialogComponent>,
    private logger: LoggerService
  ) {
    this.logger.log('[ASSIGN-REASSIGN-DIALOG] data ', data);
    if (data) {
      this.actionInModal = data.actionInModal;
      this.CHAT_PANEL_MODE = data.CHAT_PANEL_MODE;
      this.projectUsersList = data.projectUsersList || [];
      this.bots = data.bots || [];
      this.departments = data.departments || [];
      this.showSpinner_inModalUserList = data.showSpinner_inModalUserList || false;
    }
  }

  ngOnInit(): void {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  selectUser(userId: string, firstname: string, lastname: string, email: string): void {
    const result = {
      type: 'user',
      userId,
      firstname,
      lastname,
      email
    };
    this.dialogRef.close(result);
  }

  selectBot(botId: string, botName: string): void {
    const result = {
      type: 'bot',
      botId,
      botName
    };
    this.dialogRef.close(result);
  }

  selectDepartment(departmentId: string, departmentName: string): void {
    const result = {
      type: 'department',
      departmentId,
      departmentName
    };
    this.dialogRef.close(result);
  }
}

