import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Router } from '@angular/router';
import { User } from '../models/user-model';
import { BrandService } from '../services/brand.service';
import { LoggerService } from '../services/logger/logger.service';

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

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router,
    public brandService: BrandService,
    private logger: LoggerService
  ) { 
    const brand = brandService.getBrand();
    this.company_logo_black = brand['BASE_LOGO'];
    this.company_site_url = brand['COMPANY_SITE_URL'];
  }

  ngOnInit() {
    this.getUserIdAndUpdateVerifiedEmail();
  }

  getUserIdAndUpdateVerifiedEmail() {
    this.user_id = this.route.snapshot.params['user_id'];
    this.logger.log('[VERIFY-EMAIL] :: USER ID  ', this.user_id);

    // this.auth.emailVerify('5ae30c95192bba2f25XXXdd5').subscribe((user) => {
    // this.auth.emailVerify('5ae30c95192bba2f25983dd5').subscribe((user) => {
    this.auth.emailVerify(this.user_id).subscribe((_user) => {
      this.logger.log('[VERIFY-EMAIL] - USER RETURNED FROM SUBSCRIPTION ', _user);
      this.logger.log('[VERIFY-EMAIL] - USER RETURNED FROM SUBSCRIPTION - EMAIL VERIFIED ', _user['emailverified']);
      if (_user && _user['emailverified'] === true) {

        this.success_msg = 'Your email has successfully been verified';

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
      this.logger.error('[VERIFY-EMAIL] PUT REQUEST - ERROR ', error);

      if (error.status === 500) {
        this.error_msg_title = 'Sorry, something went wrong!';
        this.error_msg_subtitle = 'An error occured during data processing';
      } else if (error.status === 404) {
        this.error_msg_title = 'Sorry, something went wrong!';
        this.error_msg_subtitle = 'Verification failed';
      }
    }, () => {
      this.logger.log('[VERIFY-EMAIL] PUT REQUEST * COMPLETE *');

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


}
