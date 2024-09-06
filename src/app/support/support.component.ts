import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { SUPPORT_OPTIONS, TYPE_URL } from './support-utils';
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component';
import { NotifyService } from 'app/core/notify.service';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'appdashboard-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent extends PricingBaseComponent implements OnInit {

  isChromeVerGreaterThan100: boolean;
  SUPPORT_OPTIONS = SUPPORT_OPTIONS
  cardOptions: { [key: string]: Array<{ key: string, label: string, icon: string, type: TYPE_URL, status: "active" | "inactive", src?: string, description?: string, localIcon?: boolean }> }
  constructor(
    private auth: AuthService,
    public prjctPlanService: ProjectPlanService,
    public notify: NotifyService,
    private logger: LoggerService,
  ) { super(prjctPlanService, notify); }

  ngOnInit(): void {
    this.getProjectPlan();
    this.getBrowserVersion()

    this.cardOptions = SUPPORT_OPTIONS


    Object.keys(SUPPORT_OPTIONS).forEach(key => {
      this.cardOptions[key] = this.cardOptions[key].filter(el => el.status !== 'inactive')
      this.cardOptions[key].map((el) => {
        el.localIcon = false
        if (el.icon && el.icon.match(new RegExp(/(?=.*?assets|http|https\b)^.*$/))) {
          el.localIcon = true
        }
      })
    })

    let projectBaseInfo = {
      _id: this.prjct_id,
      profile: this.projectProfileData,
      isActiveSubscription: this.subscription_is_active,
      trialExpired: this.trial_expired
    }

    // console.log('[CDS-SUPPORT this.cardOptions]', this.cardOptions)
    // this.manageWidget("start", projectBaseInfo)
    // this.manageWidget('show')

  }




  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    })
  }

}
