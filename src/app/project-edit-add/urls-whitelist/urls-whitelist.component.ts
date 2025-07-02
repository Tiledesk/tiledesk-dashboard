import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'appdashboard-urls-whitelist',
  templateUrl: './urls-whitelist.component.html',
  styleUrls: ['./urls-whitelist.component.scss']
})
export class UrlsWhitelistComponent implements OnInit {

  newUrl: string = '';
  urlError: string | null = null;
  whitelistedUrls: string[] = [];


  strongUrlValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const domain = control.value;
      // const pattern = new RegExp(
      //   '^https?:\\/\\/' +
      //   '(([\\da-z.-]+)\\.([a-z.]{2,6})|' +
      //   '([\\d.]+))' +
      //   '(\\:[0-9]{1,5})?' +
      //   '(\\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?$',
      //   'i'
      // );
      // return pattern.test(url) ? null : { strongUrl: true };
    if (typeof domain !== 'string' || !domain.trim()) {
      return { strongUrl: true };
    }

    const pattern = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/;
    return pattern.test(domain.trim()) ? null : { strongUrl: true };
    };
  }

  formArray: FormArray = new FormArray([]);
  urlForm: FormGroup;
  submitted = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<UrlsWhitelistComponent>,
    private fb: FormBuilder
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

  _addUrl(): void {
    this.submitted = true;

    const url = this.urlForm.get('url')?.value;

    if (this.urlForm.valid && url) {
      const trimmedUrl = url.trim();

      const isDuplicate = this.formArray.controls.some(ctrl =>
        ctrl.value?.trim().toLowerCase() === trimmedUrl.toLowerCase()
      );

      console.log('[URLS WHITELIST] isDuplicate ', isDuplicate)
      if (isDuplicate) {
        // Optionally show a duplicate warning (you can add a message in template)
        console.warn('[URLS WHITELIS] Duplicate URL');
        this.urlForm.get('url')?.setErrors({ duplicate: true });
        return;
      }

      // Add to reactive form array
      this.formArray.push(
        new FormControl(trimmedUrl, [Validators.required, this.strongUrlValidator()])
      );

      // Reset input
      this.urlForm.reset();
      this.urlControl.setErrors(null);
      this.urlControl.markAsPristine();
      this.urlControl.markAsUntouched();
      this.submitted = false;
    } else {
      this.urlForm.markAllAsTouched();
    }
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
      this.formArray.push(new FormControl(input, [
        Validators.required,
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

  //  onSave(){
  //     this.dialogRef.close(this.whitelistedUrls);
  //   }

  onSave(): void {
    console.warn('this.formArray ', this.formArray);
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

  //    addUrl() {
  //     if (this.isValidUrl(this.newUrl)) {
  //       this.whitelistedUrls.push(this.newUrl.trim());
  //       this.newUrl = '';
  //       this.urlError = '';
  //     } 
  //     else {
  //       this.urlError = 'Please enter a valid URL.';
  //     }
  //   }

  //   validateUrl() {
  //   if (!this.newUrl) {
  //     this.urlError = 'URL is required';
  //     console.log('validateUrl URL is required ', this.newUrl)
  //   } else if (!this.isValidUrl(this.newUrl)) {
  //     this.urlError = 'Invalid URL format';
  //     console.log('validateUrl Invalid URL format ', this.newUrl)
  //   } else {
  //     this.urlError = null; // Important!
  //   }
  // }

  //   isValidUrl(url: string): boolean {
  //   const pattern = new RegExp(
  //     '^https?:\\/\\/' +                  // protocol
  //     '(([\\da-z.-]+)\\.([a-z.]{2,6})|' + // domain name and extension
  //     '([\\d.]+))' +                      // OR ip (v4) address
  //     '(\\:[0-9]{1,5})?' +                // port (optional)
  //     '(\\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?$', // path (optional)
  //     'i'
  //   );
  //   return pattern.test(url);
  // }




}
