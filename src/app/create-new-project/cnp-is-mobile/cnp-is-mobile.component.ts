import { Component, OnInit } from '@angular/core';
import { BrandService } from 'app/services/brand.service';
import { LoggerService } from 'app/services/logger/logger.service';


@Component({
  selector: 'appdashboard-cnp-is-mobile',
  templateUrl: './cnp-is-mobile.component.html',
  styleUrls: ['./cnp-is-mobile.component.scss']
})
export class CnpIsMobileComponent implements OnInit {
  companyLogoBlack_Url: string;
  loginLinkSent: boolean = false;
  loginLinkResent: boolean = false;
  constructor(
    public brandService: BrandService,
    private logger: LoggerService
  ) {
    const brand = brandService.getBrand();
    this.companyLogoBlack_Url = brand['company_logo_black__url'];
  }

  ngOnInit(): void {
  }

  hasClickedSendEmail() {
    this.loginLinkSent = true


    if (this.loginLinkSent === true) {
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
    }
  }
  hasClickedResendEmail() {
    this.logger.log('[CNP-IS-MOB] hasClickedResendEmail')
    this.loginLinkResent = true;
    this.logger.log('[CNP-IS-MOB] loginLinkResent', this.loginLinkResent)
  }

}
