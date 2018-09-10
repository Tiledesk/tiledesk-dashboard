import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Router } from '@angular/router';
import { User } from '../models/user-model';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {

  user_id: string;
  error_msg_title: string;
  error_msg_subtitle: string;
  success_msg: string;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router
  ) { }

  ngOnInit() {

    this.getUserIdAndUpdateVerifiedEmail();
  }

  getUserIdAndUpdateVerifiedEmail() {
    this.user_id = this.route.snapshot.params['user_id'];
    console.log('VERIFY-EMAIL :: USER ID  ', this.user_id);

    // this.auth.emailVerify('5ae30c95192bba2f25XXXdd5').subscribe((user) => {
    // this.auth.emailVerify('5ae30c95192bba2f25983dd5').subscribe((user) => {
    this.auth.emailVerify(this.user_id).subscribe((_user) => {
      console.log('VERIFY-EMAIL - USER RETURNED FROM SUBSCRIPTION ', _user);
      console.log('VERIFY-EMAIL - USER RETURNED FROM SUBSCRIPTION - EMAIL VERIFIED ', _user['emailverified']);
      if (_user && _user['emailverified'] === true) {

        this.success_msg = 'Your email has successfully been verified';

        const storedUser = localStorage.getItem('user')

        if (storedUser !== null) {

          const storedUserObject = JSON.parse(storedUser);
          console.log('VERIFY EMAIL - STORED USER ', JSON.parse(storedUser));

          console.log('VERIFY EMAIL - STORED USER * ID: ', storedUserObject._id);
          console.log('VERIFY EMAIL - STORED USER * EMAIL: ', storedUserObject.email);
          console.log('VERIFY EMAIL - STORED USER * EMAIL VERIFIED: ', storedUserObject.emailverified);
          console.log('VERIFY EMAIL - STORED USER * PSW: ', storedUserObject.password);
          console.log('VERIFY EMAIL - STORED USER * FIRSTNAME: ', storedUserObject.firstname);
          console.log('VERIFY EMAIL - STORED USER * LASTNAME: ', storedUserObject.lastname);
          console.log('VERIFY EMAIL - STORED USER * TOKEN: ', storedUserObject.token);

          const user: User = {
            _id: storedUserObject._id,
            email: storedUserObject.email,
            emailverified: true,
            password: storedUserObject.password,
            firstname: storedUserObject.firstname,
            lastname: storedUserObject.lastname,
            token: storedUserObject.token
          }

          console.log('VERIFY EMAIL - USER UPDATED OBJECT ', user);
          this.auth.publishUpdatedUser(user)
        }
      }

    }, (error) => {
      console.log('VERIFY-EMAIL PUT REQUEST ERROR ', error);

      if (error.status === 500) {
        this.error_msg_title = 'Sorry, something went wrong!';
        this.error_msg_subtitle = 'An error occured during data processing';
      } else if (error.status === 404) {
        this.error_msg_title = 'Sorry, something went wrong!';
        this.error_msg_subtitle = 'Verification failed';
      }
    }, () => {
      console.log('VERIFY-EMAIL PUT REQUEST * COMPLETE *');

    });
  }

  // goToTileDeskDotCom() {
  //   const url = 'http://tiledesk.com/'
  //   window.open(url);
  //   // , '_blank'
  // }
  getUserAndGoToLoginOrProjects() {
    this.auth.user_bs.subscribe((user) => {
      console.log('USER GET in VERIFY EMAIL ', user)
      // tslint:disable-next-line:no-debugger
      // debugger

      if (user) {
        this.router.navigate(['/projects']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }


}
