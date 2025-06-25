import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'modal-confirm-action',
  templateUrl: './modal-confirm-action.component.html',
  styleUrls: ['./modal-confirm-action.component.scss']
})
export class ModalConfirmActionComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalConfirmActionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string,
      message: string,
      confirmText?: string,
      cancelText?: string
    }
  ) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }
  onYesClick(): void {
    this.dialogRef.close(true);
  }
} 