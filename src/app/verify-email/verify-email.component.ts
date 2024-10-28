import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Router } from '@angular/router';
import { User } from '../models/user-model';
import { BrandService } from '../services/brand.service';
import { LoggerService } from '../services/logger/logger.service';
import { UsersService } from 'app/services/users.service';
import { NotifyService } from 'app/core/notify.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {

  company_logo_black: string;
  company_site_url: string;

  user_id: string;
  error_msg_title: string;
  error_msg_subtitle: string;
  success_msg: string;
  emailcode: string;
  errorCode: number;
  hasError: boolean;
  showProcessing = true;
  userEmail: string

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router,
    public brandService: BrandService,
    private logger: LoggerService,
    private usersService: UsersService,
    public notify: NotifyService,
  ) { 
    const brand = brandService.getBrand();
    this.company_logo_black = brand['BASE_LOGO'];
    this.company_site_url = brand['COMPANY_SITE_URL'];
  }

  ngOnInit() {
    this.getUserIdAndUpdateVerifiedEmail();
    this.getCurrentUser() 
    
  }
  getCurrentUser() {
    this.auth.user_bs.subscribe((user) => {
      this.logger.log('[VERIFY-EMAIL] - LoggedUser ', user);

      if (user) {
        this.userEmail = user.email
      }
    });
  }

  // getParams() {
  //   this.route.params.subscribe((params) => {
  //    console.log('[VERIFY-EMAIL] - GET PARAMS  ', params)
  //    this.emailcode = params.code
  //   });
  // }

  getUserIdAndUpdateVerifiedEmail() {
    this.user_id = this.route.snapshot.params['user_id'];
    this.emailcode = this.route.snapshot.params['code'];
    this.logger.log('[VERIFY-EMAIL] :: USER ID  ', this.user_id);
    this.logger.log('[VERIFY-EMAIL] :: CODE  ', this.emailcode);
    // this.auth.emailVerify('5ae30c95192bba2f25XXXdd5').subscribe((user) => {
    // this.auth.emailVerify('5ae30c95192bba2f25983dd5').subscribe((user) => {
    this.auth.emailVerify(this.user_id, this.emailcode).subscribe((_user) => {
      this.logger.log('[VERIFY-EMAIL] - USER RETURNED FROM SUBSCRIPTION ', _user);
      this.logger.log('[VERIFY-EMAIL] - USER RETURNED FROM SUBSCRIPTION - EMAIL VERIFIED ', _user['emailverified']);
      if (_user && _user['emailverified'] === true) {

        this.success_msg = 'Your email has successfully been verified';
        this.hasError = false
        const storedUser = localStorage.getItem('user')

        if (storedUser !== null) {

          const storedUserObject = JSON.parse(storedUser);
          this.logger.log('[VERIFY-EMAIL] - STORED USER ', JSON.parse(storedUser));

          this.logger.log('[VERIFY-EMAIL] - STORED USER * ID: ', storedUserObject._id);
          this.logger.log('[VERIFY-EMAIL] - STORED USER * EMAIL: ', storedUserObject.email);
          this.logger.log('[VERIFY-EMAIL] - STORED USER * EMAIL VERIFIED: ', storedUserObject.emailverified);
          this.logger.log('[VERIFY-EMAIL] - STORED USER * PSW: ', storedUserObject.password);
          this.logger.log('[VERIFY-EMAIL] - STORED USER * FIRSTNAME: ', storedUserObject.firstname);
          this.logger.log('[VERIFY-EMAIL] - STORED USER * LASTNAME: ', storedUserObject.lastname);
          this.logger.log('[VERIFY-EMAIL] - STORED USER * TOKEN: ', storedUserObject.token);

          const user: User = {
            _id: storedUserObject._id,
            email: storedUserObject.email,
            emailverified: true,
            password: storedUserObject.password,
            firstname: storedUserObject.firstname,
            lastname: storedUserObject.lastname,
            token: storedUserObject.token
          }

          this.logger.log('[VERIFY-EMAIL] - USER UPDATED OBJECT ', user);
          this.auth.publishUpdatedUser(user)
        }
      }

    }, (error) => {
      this.hasError = true
      this.showProcessing = false
      this.logger.error('[VERIFY-EMAIL] PUT REQUEST - ERROR ', error);
      this.logger.error('[VERIFY-EMAIL] PUT REQUEST - ERROR error ', error.error);
      this.logger.error('[VERIFY-EMAIL] PUT REQUEST - ERROR error_code ', error.error.error_code);
      if (error.status === 500) {
        this.errorCode = 500
        this.error_msg_title = 'Sorry, something went wrong!';
        this.error_msg_subtitle = 'An error occured during data processing';
      } else if (error.status === 404) {
        this.errorCode = 404
        this.error_msg_title = 'Sorry, something went wrong!';
        this.error_msg_subtitle = 'Verification failed';
      } else if (error.error.error_code === 10005) {
        this.errorCode = 10005
        this.error_msg_title = 'Sorry, something went wrong!';
        this.error_msg_subtitle = 'Looks like the verification link has expired. Not to worry, we can send the link again.';
      }  else if (error.error.error_code === 10006) {
        this.errorCode = 10006 
        this.error_msg_subtitle = "Trying to use a verification code from another user."
      }
    }, () => {
      this.logger.log('[VERIFY-EMAIL] PUT REQUEST * COMPLETE *');
      this.showProcessing = false
    });
  }


  getUserAndGoToLoginOrProjects() {
    this.auth.user_bs.subscribe((user) => {
      this.logger.log('[VERIFY-EMAIL] - GET USER AND GO TO LOGIN OR PROJECTS - USER ', user)
      // tslint:disable-next-line:no-debugger
      // debugger

      if (user) {
        this.logger.log('[VERIFY-EMAIL] - USER EXIST GO TO PROJECT ', user)
        this.router.navigate(['/projects']);
      } else {
        this.logger.log('[VERIFY-EMAIL] - USER NOT EXIST GO TO LOGIN ', user)
        this.router.navigate(['/login']);
      }
    });
  }


  resendVerificationEmail() {
    this.usersService.resendVerifyEmail().subscribe((res) => {

      this.logger.log('[VERIFY-EMAIL] - RESEND VERIFY EMAIL - RESPONSE ', res);
      const res_success = res['success'];
      this.logger.log('[VERIFY-EMAIL] - RESEND VERIFY EMAIL - RESPONSE SUCCESS ', res_success);
      // if (res_success === true) {
        this.notify.showResendingVerifyEmailNotification(this.userEmail);
      // }
    }, (error) => {
      this.logger.error('[VERIFY-EMAIL] - RESEND VERIFY EMAIL - ERROR ', error);
      const error_body = JSON.parse(error._body);
      this.logger.error('[VERIFY-EMAIL] - RESEND VERIFY EMAIL - ERROR BODY', error_body);
      if (error_body['success'] === false) {
        this.notify.showNotification('An error has occurred sending verification link', 4, 'report_problem')
      }
    }, () => {
      this.logger.log('[VERIFY-EMAIL] - RESEND VERIFY EMAIL * COMPLETE *');
    });
  }


}
