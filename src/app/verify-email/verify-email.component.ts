import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../core/auth.service';

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
    private auth: AuthService
  ) { }

  ngOnInit() {

    this.getUserIdAndUpdateVerifiedEmail();
  }

  getUserIdAndUpdateVerifiedEmail() {
    this.user_id = this.route.snapshot.params['user_id'];
    console.log('VERIFY-EMAIL :: USER ID  ', this.user_id);

    // this.auth.emailVerify('5ae30c95192bba2f25XXXdd5').subscribe((user) => {
    // this.auth.emailVerify('5ae30c95192bba2f25983dd5').subscribe((user) => {
    this.auth.emailVerify(this.user_id).subscribe((user) => {
      console.log('VERIFY-EMAIL PUT ', user);
      if (user) {
        this.success_msg = 'Your email has successfully been verified'
      }

    },
      (error) => {
        console.log('VERIFY-EMAIL PUT REQUEST ERROR ', error);

        if (error.status === 500) {
          this.error_msg_title = 'Sorry, something went wrong!';
          this.error_msg_subtitle = 'An error occured during data processing';
        } else if (error.status === 404) {
          this.error_msg_title = 'Sorry, something went wrong!';
          this.error_msg_subtitle = 'Verification failed';
        }
      },
      () => {
        console.log('VERIFY-EMAIL PUT REQUEST * COMPLETE *');

      });
  }

  goToTileDeskDotCom() {
    const url = 'http://tiledesk.com/'
    window.open(url);
    // , '_blank'
  }
}
