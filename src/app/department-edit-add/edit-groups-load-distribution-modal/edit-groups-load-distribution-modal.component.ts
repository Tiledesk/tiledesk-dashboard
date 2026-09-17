import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'appdashboard-edit-groups-load-distribution-modal',
  templateUrl: './edit-groups-load-distribution-modal.component.html',
  styleUrls: ['./edit-groups-load-distribution-modal.component.scss']
})
export class EditGroupsLoadDistributionModalComponent implements OnInit {

  distributionForm: FormGroup;
  isTotalExceeded = false;
  currentTotal: number = 0;

  constructor(

    public dialogRef: MatDialogRef<EditGroupsLoadDistributionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { groups: any[] },
    private fb: FormBuilder
  ) {
     // Create form group with form array for percentages
    this.distributionForm = this.fb.group({
      percentages: this.fb.array([])
    });

    // Initialize form controls for each group
    this.data.groups.forEach(group => {
      this.addPercentageControl(group);
    });

    // Calculate initial total
    this.calculateCurrentTotal();

    // Subscribe to form value changes
    this.distributionForm.valueChanges.subscribe(() => {
      this.validateTotal();
    });
   }

  ngOnInit(): void {
  }

    get percentages(): FormArray {
    return this.distributionForm.get('percentages') as FormArray;
  }

  addPercentageControl(group: any): void {
    const control = this.fb.control(group.percentage, [
      Validators.required,
      Validators.min(0),
      Validators.max(100)
    ]);
    
    this.percentages.push(control);
  }

  calculateCurrentTotal(): void {
    this.currentTotal = this.percentages.controls.reduce((sum, control) => {
      return sum + (Number(control.value) || 0);
    }, 0);
  }

  validateTotal(): void {
    this.calculateCurrentTotal();
    this.isTotalExceeded = this.currentTotal > 100;
  }

  get isSaveDisabled(): boolean {
    return this.isTotalExceeded || this.distributionForm.invalid;
  }

  onSave(): void {
    if (!this.isSaveDisabled) {
      // Update the original groups with new percentages
      const updatedGroups = this.data.groups.map((group, index) => ({
        ...group,
        percentage: Number(this.percentages.at(index).value)
      }));
      this.dialogRef.close(updatedGroups);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
