import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  companyLogo: string;
  loginLinkSent: boolean = false;
  loginLinkResent: boolean = false;
  id_project: string;
  botId: string;

  constructor(
    public brandService: BrandService,
    private logger: LoggerService,
    private usersService: UsersService,
    private auth: AuthService,
    private route: ActivatedRoute,
  ) {
    const brand = brandService.getBrand();
    this.companyLogo = brand['BASE_LOGO'];
  }

  ngOnInit(): void {
    this.getCurrentProject();
    this.getParamsBotTypeAndDepts()
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.id_project = project._id;
    });
  }

  getParamsBotTypeAndDepts() {
    this.route.params.subscribe((params) => {
      // console.log('[CNP-IS-MOB] --->  PARAMS', params);
      if(params && params.botid)  {
        this.botId = params.botid
      }
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
      id_project: this.id_project,
      bot_id: this.botId
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
