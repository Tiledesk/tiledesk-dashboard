import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { BrandService } from 'app/services/brand.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { UsersService } from 'app/services/users.service';


@Component({
  selector: 'appdashboard-cnp-is-mobile',
  templateUrl: './cnp-is-mobile.component.html',
  styleUrls: ['./cnp-is-mobile.component.scss']
})
export class CnpIsMobileComponent implements OnInit {
  companyLogoBlack_Url: string;
  loginLinkSent: boolean = false;
  loginLinkResent: boolean = false;
  id_project: string;

  constructor(
    public brandService: BrandService,
    private logger: LoggerService,
    private usersService: UsersService,
    private auth: AuthService
  ) {
    const brand = brandService.getBrand();
    this.companyLogoBlack_Url = brand['company_logo_black__url'];
  }

  ngOnInit(): void {
    this.auth.project_bs.subscribe((project) => {
      this.id_project = project._id;
    });
  }

  hasClickedSendEmail() {
    
    this.sendEmail().then((response) => {
      if (response == true) {
        this.loginLinkSent = true;
        setTimeout(() => {
          const spinnerContainerEl = <HTMLElement>document.querySelector('.spinner--container');
          this.logger.log('[CNP-IS-MOB] spinnerContainerEl ', spinnerContainerEl)
          spinnerContainerEl.style.visibility = "visible";
        }, 500);
        setTimeout(() => {
          const spinnerContainerEl = <HTMLElement>document.querySelector('.spinner--container');
          const resendEmailBtnEl = <HTMLElement>document.querySelector('.resend-email-me-login-link-wpr');
          resendEmailBtnEl.style.visibility = "visible";
          spinnerContainerEl.style.visibility = "hidden";
        }, 60000);
      } else {
        this.logger.warn("[CNP-IS-MOB] Email not sent")
        this.logger.warn('[CNP-IS-MOB] send email response ', response)
      }
    }).catch((err) => {
      this.logger.error('[CNP-IS-MOB] send email error ', err)
    })

    // if (this.loginLinkSent === true) {
    //   setTimeout(() => {
    //     const spinnerContainerEl = <HTMLElement>document.querySelector('.spinner--container');
    //     this.logger.log('[CNP-IS-MOB] spinnerContainerEl ', spinnerContainerEl)
    //     spinnerContainerEl.style.visibility = "visible";
    //   }, 500);
    //   setTimeout(() => {
    //     const spinnerContainerEl = <HTMLElement>document.querySelector('.spinner--container');
    //     const resendEmailBtnEl = <HTMLElement>document.querySelector('.resend-email-me-login-link-wpr');
    //     resendEmailBtnEl.style.visibility = "visible";
    //     spinnerContainerEl.style.visibility = "hidden";
    //   }, 60000);
    // }
  }

  hasClickedResendEmail() {
    this.logger.log('[CNP-IS-MOB] hasClickedResendEmail')

    this.sendEmail().then((response) => {
      if (response == true) {
        this.loginLinkResent = true;
        this.logger.log('[CNP-IS-MOB] loginLinkResent', this.loginLinkResent)
      } else {
        this.logger.warn("[CNP-IS-MOB] Email not sent")
        this.logger.warn('[CNP-IS-MOB] send email response ', response)
      }
    }).catch((err) => {
      this.logger.error('[CNP-IS-MOB] send email error ', err)
    })

  }

  sendEmail() {

    let data = {
      id_project: this.id_project
    }
    this.logger.log("sendEmail data: ", data);

    return new Promise((resolve, reject) => {
      this.usersService.sendLoginEmail(data).subscribe((response: any) => {
        if (response.success == true) {
          resolve(true);
        } else {
          reject(false);
        }
      }, (error) => {
        reject(error);
      })
    })
  }

}
