import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';

// USED FOR go back last page
import { Location } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: any;
  constructor(
    public auth: AuthService,
    private _location: Location
  ) { }

  ngOnInit() {
    this.getLoggedUser()
  }

  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      console.log('USER GET IN USER PROFILE ', user)
      // tslint:disable-next-line:no-debugger
      // debugger
      this.user = user;
    });
  }

  goBack() {
    this._location.back();
  }

}
