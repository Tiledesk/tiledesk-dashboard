import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'appdashboard-urls-whitelist',
  templateUrl: './urls-whitelist.component.html',
  styleUrls: ['./urls-whitelist.component.scss']
})
export class UrlsWhitelistComponent implements OnInit {

   newUrl: string = '';
  urlError: string = '';
  whitelistedUrls: string[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<UrlsWhitelistComponent>,
  ) { }

  ngOnInit(): void {
  }

   addUrl() {
    if (this.isValidUrl(this.newUrl)) {
      this.whitelistedUrls.push(this.newUrl.trim());
      this.newUrl = '';
      this.urlError = '';
    } else {
      this.urlError = 'Please enter a valid URL.';
    }
  }

  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  }


  onSave(){
    this.dialogRef.close(this.whitelistedUrls);
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

}
