import { Component, OnInit } from '@angular/core';
// USED FOR go back last page
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'appdashboard-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  DISABLE_UPDATE_PSW_BTN = true

  userId: string;

  constructor(
    private _location: Location,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.getUserIdFromRouteParams()
  }

  getUserIdFromRouteParams() {
    this.userId = this.route.snapshot.params['userid'];
    console.log('CHANGE PSW COMP - USER ID ', this.userId)
  }

  goBack() {
    this._location.back();
  }


  onDigitNewPsw() {

    console.log('==> new psw ', this.newPassword);
    if (this.confirmNewPassword !== this.newPassword) {
      this.DISABLE_UPDATE_PSW_BTN = true;
      console.log('CONFIRM PASSWORD IS NOT EQUAL TO NEW PASSWORD ', this.DISABLE_UPDATE_PSW_BTN)
    } else {
      this.DISABLE_UPDATE_PSW_BTN = false;
      console.log('CONFIRM PASSWORD IS NOT EQUAL TO NEW PASSWORD ', this.DISABLE_UPDATE_PSW_BTN)
    }
  }

  onConfirmNewPsw() {
    console.log('==> confirm new psw ', this.confirmNewPassword);

    if (this.confirmNewPassword !== this.newPassword) {
      this.DISABLE_UPDATE_PSW_BTN = true;
      console.log('CONFIRM PASSWORD IS NOT EQUAL TO NEW PASSWORD ', this.DISABLE_UPDATE_PSW_BTN)
    } else {
      this.DISABLE_UPDATE_PSW_BTN = false;
      console.log('CONFIRM PASSWORD IS NOT EQUAL TO NEW PASSWORD ', this.DISABLE_UPDATE_PSW_BTN)
    }

  }


}
