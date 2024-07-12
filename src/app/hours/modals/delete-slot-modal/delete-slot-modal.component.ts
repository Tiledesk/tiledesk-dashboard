import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'appdashboard-delete-slot-modal',
  templateUrl: './delete-slot-modal.component.html',
  styleUrls: ['./delete-slot-modal.component.scss']
})
export class DeleteSlotModalComponent implements OnInit {


  slotName: string;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DeleteSlotModalComponent>
  ) {
    console.log("MODAL data: ", data);
    this.slotName = data.slotName;
  }
  

  ngOnInit(): void {
  }

  onOkPressed() {
    this.dialogRef.close(true);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
