import { Component, OnInit } from '@angular/core';
// USED FOR go back last page
import { Location } from '@angular/common';

@Component({
  selector: 'appdashboard-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;


  constructor(
    private _location: Location
  ) { }

  ngOnInit() {
  }


  goBack() {
    this._location.back();
  }

}
