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

//   strongUrlValidator(control: AbstractControl): ValidationErrors | null {
//   const value = control.value;

//   if (!value) return null;

//   const pattern = new RegExp(
//     '^https?:\\/\\/' +                  // protocol
//     '(([\\da-z.-]+)\\.([a-z.]{2,6})|' + // domain name and extension
//     '([\\d.]+))' +                      // OR ip (v4) address
//     '(\\:[0-9]{1,5})?' +                // port (optional)
//     '(\\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?$', // path (optional)
//     'i'
//   );

//   return pattern.test(value) ? null : { strongUrl: true };
// }

strongUrlValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const url = control.value;
    const pattern = new RegExp(
      '^https?:\\/\\/' +
      '(([\\da-z.-]+)\\.([a-z.]{2,6})|' +
      '([\\d.]+))' +
      '(\\:[0-9]{1,5})?' +
      '(\\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?$',
      'i'
    );
    return pattern.test(url) ? null : { strongUrl: true };
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
      this.whitelistedUrls  = data
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

  

  

  // addUrl(): void {
  //   this.submitted = true;
  //   if (this.urlForm.valid) {
  //     const url = this.urlForm.value.url;
  //     this.whitelistedUrls.push(url.trim());
  //     this.urlForm.reset(); // Clear input
  //     this.submitted = false; // Reset after successful add
  //   } else {
  //     // Mark all controls as touched to trigger error display
  //     this.urlForm.markAllAsTouched();
  //   }
  // }

// addUrl(): void {
//   this.submitted = true;

//   if (this.urlForm.valid) {
//     const url = this.urlForm.value.url;
//     this.whitelistedUrls.push(url.trim());

//     // Reset the form and control state
//     this.urlForm.reset();
//     this.urlControl.setErrors(null);
//     this.urlControl.markAsPristine();
//     this.urlControl.markAsUntouched();
//     this.submitted = false;
//   } else {
//     this.urlForm.markAllAsTouched();
//   }
// }

addUrl(): void {
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

  get urlControl(): FormControl {
    return this.urlForm.get('url') as FormControl;
  }

  removeUrl(index: number) {
    this.whitelistedUrls.splice(index, 1);
  }

//  onSave(){
//     this.dialogRef.close(this.whitelistedUrls);
//   }

  onSave(): void {
    this.submitted = true;
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
