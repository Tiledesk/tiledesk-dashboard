import { Component, Inject, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'appdashboard-new-slot-modal',
  templateUrl: './new-slot-modal.component.html',
  styleUrls: ['./new-slot-modal.component.scss']
})
export class NewSlotModalComponent implements OnInit {

  public slotName: string;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<NewSlotModalComponent>
  ) { }

  ngOnInit(): void {
  }

  onOkPressed(slotName: string) {
    this.dialogRef.close({ 'slotName': slotName });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
