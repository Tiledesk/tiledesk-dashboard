import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'appdashboard-widget-domains-withelist-modal',
  templateUrl: './widget-domains-withelist-modal.component.html',
  styleUrls: ['./widget-domains-withelist-modal.component.scss']
})
export class WidgetDomainsWithelistModalComponent implements OnInit {
  newUrl: string = '';
  urlError: string | null = null;
  // whitelistedUrls: string[] = [];
  blacklistPatterns: string[] = [];
  formArray: FormArray = new FormArray([]);
  regexForm: FormGroup;
  submitted = false;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<WidgetDomainsWithelistModalComponent>,
    private fb: FormBuilder,
    public logger: LoggerService,
  ) { 
    console.log(' UrlsWhitelistComponent data ', data)
    if (data) {
      this.blacklistPatterns = data
    }
  }

  ngOnInit(): void {
   this.regexForm = this.fb.group({
      // pattern: ['', [Validators.required, this.regexValidator()]]
      pattern: ['', [Validators.required]]
    });

   // Initialize list if editing existing patterns
    this.blacklistPatterns.forEach(pattern => {
      // this.formArray.push(new FormControl(pattern, [Validators.required, this.regexValidator()]));
      this.formArray.push(new FormControl(pattern, [Validators.required]));
    });
  }

   /**
   * ✅ Validator for checking valid regex syntax
   */
  regexValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.trim();
      if (!value) return { invalidRegex: true };
      try {
        new RegExp(value);
        return null; // valid regex
      } catch {
        return { invalidRegex: true };
      }
    };
  }

  addPattern(): void {
    this.submitted = true;
    let input = this.regexForm.get('pattern')?.value?.trim();

    if (!input) {
      this.regexForm.markAllAsTouched();
      return;
    }

    // Check duplicates
    const isDuplicate = this.formArray.controls.some(ctrl => ctrl.value?.trim() === input);
    if (isDuplicate) {
      this.regexForm.get('pattern')?.setErrors({ duplicate: true });
      return;
    }

    if (this.regexForm.valid) {
      this.formArray.push(new FormControl(input, [Validators.required]));
      this.regexForm.reset();
      this.patternControl.setErrors(null);
      this.patternControl.markAsPristine();
      this.patternControl.markAsUntouched();
      this.submitted = false;
    } else {
      this.regexForm.markAllAsTouched();
    }
  }

  get patternControl(): FormControl {
    return this.regexForm.get('pattern') as FormControl;
  }


   hasChanges(): boolean {
    const currentValues = this.formArray.value.map((v: string) => v.trim().toLowerCase());
    const originalValues = this.blacklistPatterns.map((v: string) => v.trim().toLowerCase());

    // Sort both arrays for consistent comparison
    currentValues.sort();
    originalValues.sort();

    return JSON.stringify(currentValues) !== JSON.stringify(originalValues);
  }


  removeUrl(index: number) {
    this.blacklistPatterns.splice(index, 1);
  }

  onSave(): void {
    this.logger.warn('this.formArray ', this.formArray);
    if (this.formArray.invalid) {
      this.formArray.markAllAsTouched();
      return;
    }

    const urlsToSave = this.formArray.value;
    this.dialogRef.close(urlsToSave);
  }

   onNoClick(): void {
    this.dialogRef.close(null);
  }

}
