import { Component, OnInit } from '@angular/core';
import { URL_understanding_default_roles } from '../../utils/util';
import { BrandService } from 'app/services/brand.service';
import { AppConfigService } from 'app/services/app-config.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
@Component({
  selector: 'appdashboard-unauthorized-for-pricing',
  templateUrl: './unauthorized-for-pricing.component.html',
  styleUrls: ['./unauthorized-for-pricing.component.scss']
})
export class UnauthorizedForPricingComponent implements OnInit {

  URL_UNDERSTANDING_DEFAULT_ROLES = URL_understanding_default_roles;
  public hideHelpLink: boolean;
  projectid: string;
  public_Key: string;
  isVisiblePAY: boolean;

  constructor(
    private router: Router,
    public brandService: BrandService,
    public appConfigService: AppConfigService,
    private logger: LoggerService,
    private auth: AuthService,
  ) {
    const brand = brandService.getBrand();
    this.hideHelpLink = brand['DOCS'];
  }

  ngOnInit() {
    this.getCurrentProject();
    this.getOSCODE();
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {

        this.projectid = project._id

      }
      // this.logger.log('[BOT-CREATE] 00 -> FAQ-KB EDIT ADD COMP project ID from AUTH service subscription  ', this.project._id)
    });
  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[UNAUTHORIZED-PAGE-FOR-PRICING] AppConfigService getAppConfig public_Key', this.public_Key);

    let keys = this.public_Key.split("-");
    this.logger.log('[UNAUTHORIZED-PAGE-FOR-PRICING] PUBLIC-KEY - public_Key keys', keys)

    keys.forEach(key => {

      if (key.includes("PAY")) {

        let pay = key.split(":");

        if (pay[1] === "F") {
          this.isVisiblePAY = false;
          this.logger.log('[UNAUTHORIZED-PAGE-FOR-PRICING] isVisiblePAY', this.isVisiblePAY)
        } else {
          this.isVisiblePAY = true;
          this.logger.log('[UNAUTHORIZED-PAGE-FOR-PRICING] isVisiblePAY', this.isVisiblePAY)
        }
      }

    });


    if (!this.public_Key.includes("PAY")) {
      this.isVisiblePAY = false;
    }

  }

  goToDashboard() {
    this.router.navigate(['/project/' + this.projectid + '/home']);
  }

}
