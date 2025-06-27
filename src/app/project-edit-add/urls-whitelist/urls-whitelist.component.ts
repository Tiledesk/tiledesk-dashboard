import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
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

  strongUrlValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  if (!value) return null;

  const pattern = new RegExp(
    '^https?:\\/\\/' +                  // protocol
    '(([\\da-z.-]+)\\.([a-z.]{2,6})|' + // domain name and extension
    '([\\d.]+))' +                      // OR ip (v4) address
    '(\\:[0-9]{1,5})?' +                // port (optional)
    '(\\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?$', // path (optional)
    'i'
  );

  return pattern.test(value) ? null : { strongUrl: true };
}

 urlForm: FormGroup;
 
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
      url: ['', [Validators.required, this.strongUrlValidator]]
    });
  }

   get urlControl() {
    return this.urlForm.get('url');
  }

  addUrl(): void {
    if (this.urlForm.valid) {
      const url = this.urlForm.value.url;
      this.whitelistedUrls.push(url.trim());
      this.urlForm.reset(); // Clear input
    }
  }

   removeUrl(index: number) {
    this.whitelistedUrls.splice(index, 1);
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


  onSave(){
    this.dialogRef.close(this.whitelistedUrls);
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

}
