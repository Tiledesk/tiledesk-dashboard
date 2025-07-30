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
  whitelistedUrls: string[] = [];

  formArray: FormArray = new FormArray([]);
  urlForm: FormGroup;
  submitted = false;

  strongUrlValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const domain = control.value;
   
      if (typeof domain !== 'string' || !domain.trim()) {
        return { strongUrl: true };
      }

      const pattern = /^(?:\*\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/; // Accepts: *.example.com, example.com, sub.example.com
      return pattern.test(domain.trim()) ? null : { strongUrl: true };
    };
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<WidgetDomainsWithelistModalComponent>,
    private fb: FormBuilder,
    public logger: LoggerService,
  ) { 
    console.log(' UrlsWhitelistComponent data ', data)
    if (data) {
      this.whitelistedUrls = data
    }
  }

  ngOnInit(): void {
     this.urlForm = this.fb.group({
      url: ['', [Validators.required, this.strongUrlValidator()]]
    });

    // Initialize list if editing existing URLs
    this.whitelistedUrls.forEach(url => {
      this.formArray.push(new FormControl(url, [Validators.required, this.strongUrlValidator()]));
    });
  }

   addUrl(): void {
    this.submitted = true;
    let input = this.urlForm.get('url')?.value;

    if (input) {
      input = input.trim().toLowerCase();

      // Extract domain from full URL if needed
      try {
        if (input.startsWith('http://') || input.startsWith('https://')) {
          const urlObj = new URL(input);
          input = urlObj.hostname;
        }
      } catch (e) {
        // fallback: strip protocols manually if URL constructor fails
        input = input.replace(/(^\w+:|^)\/\//, '');
      }

      const isDuplicate = this.formArray.controls.some(ctrl =>
        ctrl.value?.trim().toLowerCase() === input
      );

      if (isDuplicate) {
        this.urlForm.get('url')?.setErrors({ duplicate: true });
        return;
      }

      if (this.urlForm.valid) {
        this.formArray.push(new FormControl(input, [Validators.required,
          this.strongUrlValidator()
        ]));

        this.urlForm.reset();
        this.urlControl.setErrors(null);
        this.urlControl.markAsPristine();
        this.urlControl.markAsUntouched();
        this.submitted = false;
      } else {
        this.urlForm.markAllAsTouched();
      }
    }
  }

   get urlControl(): FormControl {
    return this.urlForm.get('url') as FormControl;
  }

   hasChanges(): boolean {
    const currentValues = this.formArray.value.map((v: string) => v.trim().toLowerCase());
    const originalValues = this.whitelistedUrls.map((v: string) => v.trim().toLowerCase());

    // Sort both arrays for consistent comparison
    currentValues.sort();
    originalValues.sort();

    return JSON.stringify(currentValues) !== JSON.stringify(originalValues);
  }


  removeUrl(index: number) {
    this.whitelistedUrls.splice(index, 1);
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
