import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'appdashboard-edit-load-distribution-modal',
  templateUrl: './edit-load-distribution-modal.component.html',
  styleUrls: ['./edit-load-distribution-modal.component.scss']
})
export class EditLoadDistributionModalComponent implements OnInit {

  percentageControl: FormControl;
  isTotalExceeded = false;
  currentTotal: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { groups: any[], group: any },
    public dialogRef: MatDialogRef<EditLoadDistributionModalComponent>,
  ) { 
    console.log('EditLoadDistributionModalComponent  data', data) 
     // Create a deep copy of groups to avoid modifying the original data
    this.data.groups = JSON.parse(JSON.stringify(data.groups));
    this.data.group = this.data.groups.find(g => g.id === data.group.id);

     this.percentageControl = new FormControl(data.group.percentage, [
      Validators.required,
      Validators.min(0),
      Validators.max(100)
    ]);

    this.calculateCurrentTotal();
    
    this.percentageControl.valueChanges.subscribe((value) => {
      // Ensure value is a number (input might return string)
      const numValue = Number(value);
      this.data.group.percentage = numValue;
      this.validateTotal();
    });
  }

  ngOnInit(): void {
  }


  calculateCurrentTotal(): void {
    this.currentTotal = this.data.groups.reduce((sum, g) => sum + g.percentage, 0);
  }

  validateTotal(): void {
    this.calculateCurrentTotal();
    this.isTotalExceeded = this.currentTotal > 100;
  }

  get isSaveDisabled(): boolean {
    return this.isTotalExceeded || 
           this.percentageControl.invalid || 
           this.percentageControl.pristine;
  }

  onSave(): void {
    if (!this.isSaveDisabled) {
      this.dialogRef.close(this.data.groups);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
