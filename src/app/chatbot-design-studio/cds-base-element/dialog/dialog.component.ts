import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'cds-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
  }

  onAddCustomAttribute(): void {
    // console.log('onAddCustomAttribute');
    // this.dialogRef.close();
  }

  onCloseDialog(): void {
    this.dialogRef.close();
  }

  onChange(){
    // verifico regex
  }


}
