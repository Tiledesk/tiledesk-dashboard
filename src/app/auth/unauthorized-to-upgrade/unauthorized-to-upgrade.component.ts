import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BrandService } from 'app/services/brand.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { Subscription } from 'rxjs';
import moment from "moment";
import { AppConfigService } from 'app/services/app-config.service';

@Component({
  selector: 'appdashboard-unauthorized-to-upgrade',
  templateUrl: './unauthorized-to-upgrade.component.html',
  styleUrls: ['./unauthorized-to-upgrade.component.scss']
})
export class UnauthorizedToUpgradeComponent implements OnInit {

  company_name: string;
  companyNameParams: any
  subscription: Subscription;
  trialExpirationDate: string
  public_Key: string;
  isVisiblePAY: boolean;
  CHAT_MODE:  boolean;
  userRole: string;
  dshbrdBaseUrl: string;
  id_project: string;
  salesEmail: string;

  constructor(
    private router: Router,
    public brandService: BrandService,
    private prjctPlanService: ProjectPlanService,
    private logger: LoggerService,
    public appConfigService: AppConfigService,
  ) {
    const brand = brandService.getBrand();
    this.company_name = brand['BRAND_NAME'];
    // console.log('[ON-BOARDING-WELCOME company_name]' , this.company_name)
    this.companyNameParams = { 'BRAND_NAME': this.company_name }
    this.salesEmail = brand['CONTACT_SALES_EMAIL'];
  }

  ngOnInit(): void {
    this.getProjectPlan()
    this.getOSCODE();


    this.CHAT_MODE = window.self !== window.top;
    console.log('[UNAUTHORIZED-TO-UPGRADE] Is in iframe (CHAT_MODE) :', this.CHAT_MODE);
   
  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[UNAUTHORIZED-TO-UPGRADE] AppConfigService getAppConfig public_Key', this.public_Key);

    let keys = this.public_Key.split("-");
    this.logger.log('[UNAUTHORIZED-TO-UPGRADE] PUBLIC-KEY - public_Key keys', keys)

    keys.forEach(key => {

      if (key.includes("PAY")) {

        let pay = key.split(":");

        if (pay[1] === "F") {
          this.isVisiblePAY = false;
          this.logger.log('[UNAUTHORIZED-TO-UPGRADE] isVisiblePAY', this.isVisiblePAY)
        } else {
          this.isVisiblePAY = true;
          this.logger.log('[UNAUTHORIZED-TO-UPGRADE] isVisiblePAY', this.isVisiblePAY)
        }
      }

    });


    if (!this.public_Key.includes("PAY")) {
      this.isVisiblePAY = false;
    }

  }

  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      console.log('[UNAUTHORIZED-TO-UPGRADE] - getProjectPlan - project Profile Data ', projectProfileData)

      if (projectProfileData) {
        this.userRole  = projectProfileData.user_role
        this.id_project = projectProfileData._id;
        console.log('[UNAUTHORIZED-TO-UPGRADE] - getProjectPlan - userRole ', this.userRole)

        if (projectProfileData.profile_type === 'free' && projectProfileData.trial_expired === true) {

          this.trialExpirationDate = moment(projectProfileData.createdAt).add(14, 'days').format('LL');;
          console.log('[UNAUTHORIZED-TO-UPGRADE] - trialExpirationDate', this.trialExpirationDate); // Outputs the new date as an ISO string
        }
      }
    }, error => {

      this.logger.error('[UNAUTHORIZED-TO-UPGRADE] - getProjectPlan - ERROR', error);
    }, () => {

      // console.log('[PRICING] - getProjectPlan * COMPLETE *')

    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  goToYourProjects() {
    this.router.navigate(['/projects']);
  }

  goToPricingFromChat() {
    if (this.isVisiblePAY) {
     
        const href = window.location.href;
        this.logger.log('[UNAUTHORIZED-TO-UPGRADE] href ', href)

        const hrefArray = href.split('/#/');
        this.dshbrdBaseUrl = hrefArray[0]
        const pricingUrl = this.dshbrdBaseUrl + '/#/project/' + this.id_project + '/pricing/te';
        window.open(pricingUrl, '_blank');
      
    }
  }

  contactUs() {
    window.open(`mailto:${this.salesEmail}?subject=Upgrade plan`);
  }

}
