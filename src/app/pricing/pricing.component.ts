
import { Component, OnInit, OnDestroy, isDevMode } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService } from '../core/auth.service';
import { ActivatedRoute, Router } from '@angular/router'
import { UsersService } from '../services/users.service';
import { ProjectService } from '../services/project.service';
import { ProjectPlanService } from '../services/project-plan.service';
import { zip } from 'rxjs';
import { Subscription } from 'rxjs';
import { BrandService } from '../services/brand.service';
import { LoggerService } from '../services/logger/logger.service';
import { AppConfigService } from '../services/app-config.service';
import { TranslateService } from '@ngx-translate/core';
import {  additionalFeaturesPlanD, additionalFeaturesPlanE, featuresPlanA, featuresPlanB, featuresPlanC, featuresPlanD, featuresPlanE, featuresPlanF, highlightedFeaturesPlanA, highlightedFeaturesPlanB, highlightedFeaturesPlanC, highlightedFeaturesPlanD, highlightedFeaturesPlanE, highlightedFeaturesPlanF, PLAN_NAME } from 'app/utils/util';
import { NotifyService } from 'app/core/notify.service';

declare var Stripe: any;


enum PLAN_DESC {
  Growth = 'Improve customer experience and qualify leads better with premium features',
  Scale = 'Go omni-channel & find your customers where they already are: WhatsApp, Facebook, etc.',
  Plus = 'Exploit all the premium features and receive support to design chatbots tailor-made',
  Basic = 'Automate simple website conversations as an individual',
  Premium = 'Expand automation across channels for individuals and small teams',
  Custom = 'Exploit all the premium features and receive support to design chatbots tailor-made'
}

enum MONTHLY_PRICE {
  Growth = "25",
  Scale = "89",
  Plus = 'Custom',
  Basic = "15",
  Premium = "100",
  Custom = 'Starting at 500€'
}

enum ANNUAL_PRICE {
  Growth = "225",
  Scale = "790",
  Plus = 'Custom',
  Basic = "150",
  Premium = "1,000",
  Custom = 'Starting at 500€'
}


@Component({
  selector: 'appdashboard-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit, OnDestroy {
  PLAN_NAME = PLAN_NAME;
  PLAN_DESC = PLAN_DESC;
  MONTHLY_PRICE = MONTHLY_PRICE;
  ANNUAL_PRICE = ANNUAL_PRICE;
  planName: string;
  planDecription: string;
  profileType: string;
  planFeatures: Array<string>;
  additionalFeatures: Array<any>;
  annualPrice: string;
  monthlyPrice: string;
  annualPeriod: boolean;
  monthlyPeriod: boolean;
  highlightedFeatures = []
  projectCurrenPlan: string;
  clientReferenceIdForPlanA: string;
  clientReferenceIdForPlanB: string;
  clientReferenceIdForPlanC: string;
  // NEW PLAN
  clientReferenceIdForPlanD: string;
  clientReferenceIdForPlanE: string;

  browser_lang: string;
  
  company_name: string;

  projectId: string;
  projectName: string;
  currentUserID: string;
  currentUserEmail: string;

  // operatorNo = 1
  operatorNo: number;
  numberOfAgentPerPrice: number


  selectedPlanName: string;
  proPlanPerAgentPrice = 5;

  yearlyProPlanPerAgentPrice = 4.16;


  displayStipeCheckoutError: any;
  perMonth = true;
  perYear: boolean;

  dshbrdBaseUrl: string;

  displayPaymentReport = 'none'
  displayInfoModal = 'none'

  projectUsersNumber: number;
  showSpinnerInTotalPrice = true;
  info_modal_has_been_displayed = false;
  subscription_id: string;
  subscription: Subscription;

  STRIPE_LIVE_PK: string;

  LIVE_PLAN_X_DAY_20CENTS_PLAN_CODE: string;
  LIVE_PLAN_X_YEAR_PLAN_CODE: string;
  LIVE_PLAN_X_MONTH_PLAN_CODE: string;

  TILEDESK_V2 = true;

  public TEST_PAYMENT_LINKS = false;

  DISPLAY_BTN_PLAN_LIVE_20_CENTSXUNIT_PROD: boolean = false;
  DISPLAY_BTN_PLAN_TEST_3_EURXUNIT_PRE: boolean = false;
  DISPLAY_BTN_PLAN_TEST_3_EURXDAY_LIVE: boolean = false;
  ARE_VISIBLE_NEW_PRICING_BTN: boolean

  contactUsEmail: string;
  displayClosePricingPageBtn: boolean;
  // old Plan link
  PAYMENT_LINK_MONTLY_PLAN_A: string;
  PAYMENT_LINK_MONTLY_PLAN_B: string;
  PAYMENT_LINK_ANNUALLY_PLAN_A: string;
  PAYMENT_LINK_ANNUALLY_PLAN_B: string;
  PAYMENT_LINK_PLAN_C: string;

  // new Plan link
  PAYMENT_LINK_MONTLY_PLAN_D: string;
  PAYMENT_LINK_ANNUALLY_PLAN_D: string;
  PAYMENT_LINK_MONTLY_PLAN_E: string;
  PAYMENT_LINK_ANNUALLY_PLAN_E: string;

  user: any;
  USER_ROLE: any;
  agentCannotManageAdvancedOptions: string;
  learnMoreAboutDefaultRoles: string;
  salesEmail: string;


  constructor(
    public location: Location,
    public auth: AuthService,
    private route: ActivatedRoute,
    private usersService: UsersService,
    public projectService: ProjectService,
    private prjctPlanService: ProjectPlanService,
    public brandService: BrandService,
    private logger: LoggerService,
    public appConfigService: AppConfigService,
    private translate: TranslateService,
    private router: Router,
    private notify: NotifyService
  ) {

    const brand = brandService.getBrand();
    this.company_name = brand['BRAND_NAME'];
    this.contactUsEmail = brand['CONTACT_US_EMAIL'];
    this.salesEmail = brand['CONTACT_SALES_EMAIL'];
  }

  /**
   * FOR TEST PLANS in the Stripe Dashboard> Developers> Webhook> Webhook Details click Update details and enter
   * in endpoint URL:
   *  
   *  * to test from localhost start ngrok and replace the initial part of the url
   *    http://03caec73.ngrok.io/modules/payments/stripe/webhook
   *  https://98bf-151-57-59-176.eu.ngrok.io/modules/payments/stripe/webhook 
   * 
   *  Note: to create an ngrok tunnel run: ./ngrok http  http://localhost:3000/
   * 
   *  * to test in in PRE 
   *    https://tiledesk-server-pre.herokuapp.com/modules/payments/stripe/webhook
   * 
   */


  ngOnInit() {
    // this.auth.checkRoleForCurrentProjectAndRedirectAdminAndAgent(); // redirect admin and ahent -- only owner has access to payment
    this.getCurrentProject();
    this.selectedPlanName = 'pro'
    this.getBaseUrl()
    // this.getAllUsersOfCurrentProject();
    this.getNoOfProjectUsersAndPendingInvitations();
    this.getProjectPlan();
    this.setPlansPKandCode();
    this.setpaymentLinks()
    this.getRouteParamsAndAppId();
    this.getLoggedUser();
    this.getProjectUserRole();
    this.translateString();
    this.getBrowserLanguage();

    this.planName =  PLAN_NAME.D; // PLAN_NAME.A
    this.planDecription = PLAN_DESC[PLAN_NAME.D];  //PLAN_DESC[PLAN_NAME.A] 
    this.planFeatures = featuresPlanD; // featuresPlanA;
    this.highlightedFeatures = highlightedFeaturesPlanD; //highlightedFeaturesPlanA
    this.additionalFeatures = additionalFeaturesPlanD
    this.monthlyPeriod = true;
    this.annualPeriod = false;
    this.monthlyPrice =  MONTHLY_PRICE[PLAN_NAME.D] // MONTHLY_PRICE[PLAN_NAME.A]

    // console.log('[PRICING] ROUTER URL ', this.router.url)
    const current_url = this.router.url;
    // console.log('[PRICING] current_url ', current_url)
    var n = current_url.lastIndexOf('/');
    var valueAfterLastString = current_url.substring(n + 1);
    // console.log('[PRICING] valueAfterLastString ', valueAfterLastString)
    if (valueAfterLastString === 'pricing') {
      this.displayClosePricingPageBtn = true;
    } else {
      this.displayClosePricingPageBtn = false;
    }

  }

  translateString() {
    this.translate.get('UsersWiththeAgentroleCannotManageTheAdvancedOptionsOfTheProject')
      .subscribe((translation: any) => {
        this.agentCannotManageAdvancedOptions = translation;
      });

    this.translate.get('LearnMoreAboutDefaultRoles')
      .subscribe((translation: any) => {

        this.learnMoreAboutDefaultRoles = translation;
      });
  }

  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {

      this.user = user;
    })
  }

  getProjectUserRole() {
    this.usersService.project_user_role_bs
      .subscribe((user_role) => {
        this.logger.log('[APP-STORE] - GET PROJECT-USER ROLE ', user_role);
        if (user_role) {
          this.USER_ROLE = user_role;
        }
      });
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.logger.log('[PRICING] - project ', project)
        this.projectId = project._id;
        this.logger.log('[PRICING] - projectId ', this.projectId)
        this.projectName = project.name;

        if (this.projectId) {
          this.getCurrentUser();
        }
      }
    });
  }

  getCurrentUser() {
    const user = this.auth.user_bs.value

    this.logger.log('[PRICING]  Component user ', user);
    if (user) {
      this.currentUserID = user._id
      this.currentUserEmail = user.email
      this.logger.log('[PRICING] USER UID ', this.currentUserID);
      this.logger.log('[PRICING] USER email ', this.currentUserEmail);

      this.clientReferenceIdForPlanA = this.currentUserID + '_' + this.projectId + '_' + PLAN_NAME.A
      // console.log('[PRICING] clientReferenceIdForPlanA ', this.clientReferenceIdForPlanA)
      this.clientReferenceIdForPlanB = this.currentUserID + '_' + this.projectId + '_' + PLAN_NAME.B
      // console.log('[PRICING] clientReferenceIdForPlanB ', this.clientReferenceIdForPlanB)
      this.clientReferenceIdForPlanC = this.currentUserID + '_' + this.projectId + '_' + PLAN_NAME.C
      // console.log('[PRICING] clientReferenceIdForPlanB ', this.clientReferenceIdForPlanC)

      // -------------------------------------------------------------------------------------------
      // New pricing
      // -------------------------------------------------------------------------------------------
      this.clientReferenceIdForPlanD = this.currentUserID + '_' + this.projectId + '_' + PLAN_NAME.D + '_' + 1
      this.logger.log('[PRICING] clientReferenceIdForPlanD ', this.clientReferenceIdForPlanD)
      this.clientReferenceIdForPlanE = this.currentUserID + '_' + this.projectId + '_' + PLAN_NAME.E + '_' + 2
      this.logger.log('[PRICING] clientReferenceIdForPlanE ', this.clientReferenceIdForPlanB)
    } else {
      // this.logger.log('No user is signed in');
    }
  }
  setpaymentLinks() {
    if (this.TEST_PAYMENT_LINKS === true) {
      this.PAYMENT_LINK_MONTLY_PLAN_A = "https://buy.stripe.com/test_3cseVQ6TIadkd8Y4gg";
      this.PAYMENT_LINK_ANNUALLY_PLAN_A = "https://buy.stripe.com/test_8wMbJE4LA3OW9WMeUV";
      this.PAYMENT_LINK_MONTLY_PLAN_B = "https://buy.stripe.com/test_7sI6pkce24T0d8YdQT";
      this.PAYMENT_LINK_ANNUALLY_PLAN_B = "https://buy.stripe.com/test_fZeeVQ6TI85cglabIK";
      this.PAYMENT_LINK_PLAN_C = "https://buy.stripe.com/test_4gw1502Ds5X4ed26ot";

      // New pricing test link
      this.PAYMENT_LINK_MONTLY_PLAN_D = "https://buy.stripe.com/test_7sI150fqedpwfh6dRc",
      this.PAYMENT_LINK_ANNUALLY_PLAN_D = "https://buy.stripe.com/test_9AQdRMb9Y4T03yo8wT", 
      this.PAYMENT_LINK_MONTLY_PLAN_E = "https://buy.stripe.com/test_3cs8xs5PE5X4d8Y8wQ", 
      this.PAYMENT_LINK_ANNUALLY_PLAN_E = "https://buy.stripe.com/test_9AQdRMdi699gc4U00l" 


    } else if (this.TEST_PAYMENT_LINKS === false) {
      // this.PAYMENT_LINK_MONTLY_PLAN_A = "https://buy.stripe.com/5kA3ck5K604y9qg3ck"; // "https://buy.stripe.com/aEU3ckc8ug3wdGwdQS";
      // this.PAYMENT_LINK_ANNUALLY_PLAN_A = "https://buy.stripe.com/fZefZ6egCeZsgSI14d";// "https://buy.stripe.com/28oaEM1tQeZs6e4fYZ";
      // this.PAYMENT_LINK_MONTLY_PLAN_B = "https://buy.stripe.com/cN2aEMfkGaJc1XObIO"; //"https://buy.stripe.com/8wM9AI0pMeZsbyo28c";
      // this.PAYMENT_LINK_ANNUALLY_PLAN_B = "https://buy.stripe.com/8wM14cc8ug3weKA003";


      this.PAYMENT_LINK_MONTLY_PLAN_D = " https://buy.stripe.com/4gw0082xUeZs7i83ct"; // Basic Montly
      this.PAYMENT_LINK_ANNUALLY_PLAN_D = "https://buy.stripe.com/9AQbIQc8u04y8mcaEW"; // Basic Annually 
      this.PAYMENT_LINK_MONTLY_PLAN_E =  "https://buy.stripe.com/00g6ow0pM5oSdGw8wQ"; // "https://buy.stripe.com/14k0086OacRk6e4cN1"; // Premium €50.00 EUR / month
      this.PAYMENT_LINK_ANNUALLY_PLAN_E = "https://buy.stripe.com/3cs9AI6Oa9F8gSI3cx"; // "https://buy.stripe.com/3cs6owfkGeZseKAaEU"; // Premium Annually
     
    }
  }

 // -------------------------------
  // PLAN D 
  // -------------------------------
  openPaymentLinkMontlyPlanD() {
    if (this.USER_ROLE === 'owner') {
      this.logger.log('[PRICING] PLAN A Montly')
      // const url = `https://buy.stripe.com/test_3cseVQ6TIadkd8Y4gg?prefilled_email=${this.currentUserEmail}&client_reference_id=${this.clientReferenceIdForPlanA}&locale=${this.browser_lang}`
      const url = `${this.PAYMENT_LINK_MONTLY_PLAN_D}?prefilled_email=${this.currentUserEmail}&client_reference_id=${this.clientReferenceIdForPlanD}&locale=${this.browser_lang}"`
      this.logger.log('[PRICING] PLAN D Montly url ', url)
      window.open(url, '_self');

      this.trackGoToCheckout(PLAN_NAME.D, 'montly') 
    
    } else {
      this.presentModalAgentCannotManageAvancedSettings()
    }
  }

  openPaymentLinkAnnuallyPlanD() {
    if (this.USER_ROLE === 'owner') {
      this.logger.log('[PRICING] PLAN D Annually')
      // const url = `https://buy.stripe.com/test_8wMbJE4LA3OW9WMeUV?prefilled_email=${this.currentUserEmail}&client_reference_id=${this.clientReferenceIdForPlanA}&locale=${this.browser_lang}`
      const url = `${this.PAYMENT_LINK_ANNUALLY_PLAN_D}?prefilled_email=${this.currentUserEmail}&client_reference_id=${this.clientReferenceIdForPlanD}&locale=${this.browser_lang}`
      window.open(url, '_self');

      this.trackGoToCheckout(PLAN_NAME.D, 'annually')

    } else {
      this.presentModalAgentCannotManageAvancedSettings()
    }
  }


  // -------------------------------
  // PLAN E 
  // -------------------------------
  openPaymentLinkMontlyPlanE() {
    if (this.USER_ROLE === 'owner') {
      this.logger.log('[PRICING] PLAN E Montly')
      // const url = `https://buy.stripe.com/test_3cseVQ6TIadkd8Y4gg?prefilled_email=${this.currentUserEmail}&client_reference_id=${this.clientReferenceIdForPlanA}&locale=${this.browser_lang}`
      const url = `${this.PAYMENT_LINK_MONTLY_PLAN_E}?prefilled_email=${this.currentUserEmail}&client_reference_id=${this.clientReferenceIdForPlanE}&locale=${this.browser_lang}"`
      this.logger.log('[PRICING] PLAN A Montly url ', url)
      window.open(url, '_self');
     
      this.trackGoToCheckout(PLAN_NAME.E, 'montly')
   
    } else {
      this.presentModalAgentCannotManageAvancedSettings()
    }
  }

  openPaymentLinkAnnuallyPlanE() {
    if (this.USER_ROLE === 'owner') {
      this.logger.log('[PRICING] PLAN E Annually')
      // const url = `https://buy.stripe.com/test_8wMbJE4LA3OW9WMeUV?prefilled_email=${this.currentUserEmail}&client_reference_id=${this.clientReferenceIdForPlanA}&locale=${this.browser_lang}`
      const url = `${this.PAYMENT_LINK_ANNUALLY_PLAN_E}?prefilled_email=${this.currentUserEmail}&client_reference_id=${this.clientReferenceIdForPlanE}&locale=${this.browser_lang}`
      window.open(url, '_self');

      this.trackGoToCheckout(PLAN_NAME.E, 'annually') 
    
    } else {
      this.presentModalAgentCannotManageAvancedSettings()
    }
  }



  // -------------------------------
  // PLAN A 
  // -------------------------------
  openPaymentLinkMontlyPlanA() {
    if (this.USER_ROLE === 'owner') {
      // console.log('[PRICING] PLAN A Montly')
      // const url = `https://buy.stripe.com/test_3cseVQ6TIadkd8Y4gg?prefilled_email=${this.currentUserEmail}&client_reference_id=${this.clientReferenceIdForPlanA}&locale=${this.browser_lang}`
      const url = `${this.PAYMENT_LINK_MONTLY_PLAN_A}?prefilled_email=${this.currentUserEmail}&client_reference_id=${this.clientReferenceIdForPlanA}&locale=${this.browser_lang}"`
      window.open(url, '_self');

      this.trackGoToCheckout(PLAN_NAME.A, 'montly')  
    
    } else {
      this.presentModalAgentCannotManageAvancedSettings()
    }
  }

  openPaymentLinkAnnuallyPlanA() {
    if (this.USER_ROLE === 'owner') {
      // console.log('[PRICING] PLAN A Annually')
      // const url = `https://buy.stripe.com/test_8wMbJE4LA3OW9WMeUV?prefilled_email=${this.currentUserEmail}&client_reference_id=${this.clientReferenceIdForPlanA}&locale=${this.browser_lang}`
      const url = `${this.PAYMENT_LINK_ANNUALLY_PLAN_A}?prefilled_email=${this.currentUserEmail}&client_reference_id=${this.clientReferenceIdForPlanA}&locale=${this.browser_lang}`
      window.open(url, '_self');

      this.trackGoToCheckout(PLAN_NAME.A, 'annually')   

    } else {
      this.presentModalAgentCannotManageAvancedSettings()
    }
  }

  // -------------------------------
  // PLAN B 
  // -------------------------------
  openPaymentLinkMontlyPlanB() {
    if (this.USER_ROLE === 'owner') {
      // console.log('[PRICING] PLAN B Montly')
      // const url = `https://buy.stripe.com/test_7sI6pkce24T0d8YdQT?prefilled_email=${this.currentUserEmail}&client_reference_id=${this.clientReferenceIdForPlanB}&locale=${this.browser_lang}`
      const url = `${this.PAYMENT_LINK_MONTLY_PLAN_B}?prefilled_email=${this.currentUserEmail}&client_reference_id=${this.clientReferenceIdForPlanB}&locale=${this.browser_lang}`
      window.open(url, '_self');
     
      this.trackGoToCheckout(PLAN_NAME.B, 'montly')   

    } else {
      this.presentModalAgentCannotManageAvancedSettings()
    }
  }

  openPaymentLinkAnnuallyPlanB() {
    if (this.USER_ROLE === 'owner') {
      // console.log('[PRICING] PLAN B Annually')
      // const url = `https://buy.stripe.com/test_fZeeVQ6TI85cglabIK?prefilled_email=${this.currentUserEmail}&client_reference_id=${this.clientReferenceIdForPlanB}&locale=${this.browser_lang}`
      const url = `${this.PAYMENT_LINK_ANNUALLY_PLAN_B}?prefilled_email=${this.currentUserEmail}&client_reference_id=${this.clientReferenceIdForPlanB}&locale=${this.browser_lang}`
      window.open(url, '_self');

      this.trackGoToCheckout(PLAN_NAME.B, 'annually')   
    
    } else {
      this.presentModalAgentCannotManageAvancedSettings()
    }
  }

  openPaymentLinkPlanC() {
    if (this.USER_ROLE === 'owner') {
      // console.log('[PRICING] PLAN C')
      // const url = `https://buy.stripe.com/test_4gw1502Ds5X4ed26ot?prefilled_email=${this.currentUserEmail}&client_reference_id=${this.clientReferenceIdForPlanC}&locale=${this.browser_lang}`
      const url = `${this.PAYMENT_LINK_PLAN_C}?prefilled_email=${this.currentUserEmail}&client_reference_id=${this.clientReferenceIdForPlanC}&locale=${this.browser_lang}`
      window.open(url, '_self');
    } else {
      this.presentModalAgentCannotManageAvancedSettings()
    }
  }

  trackGoToCheckout(plan: string, period: string) {
    if (!isDevMode()) {
      try {
        window['analytics'].page('Pricing page', {

        });
      } catch (err) {
        this.logger.error('Pricing page error', err);
      }

      try {
        window['analytics'].track('Go to checkout for plan' + plan + ' /' + period, {
          "email": this.user.email,
        }, {
          "context": {
            "groupId": this.projectId
          }
        });
      } catch (err) {
        this.logger.error('track go to checkout error', err);
      }
    }
  }

  // To test Live Plan 3.00 / Daily
  openPaymentTestLivePaymentLink() {
    // const url = `https://buy.stripe.com/9AQ7sAfkGdVo7i8cMR?prefilled_email=${this.currentUserEmail}&client_reference_id=${this.clientReferenceIdForPlanB}&locale=${this.browser_lang}`
    // window.open(url, '_self');
    const url = `https://buy.stripe.com/9AQ7sAfkGdVo7i8cMR?prefilled_email=${this.currentUserEmail}&client_reference_id=${this.clientReferenceIdForPlanE}&locale=${this.browser_lang}`
    window.open(url, '_self');
  }

  presentModalAgentCannotManageAvancedSettings() {
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.agentCannotManageAdvancedOptions, this.learnMoreAboutDefaultRoles)
  }


  contactUs(planname) {
    if (this.USER_ROLE === 'owner') {
      // console.log('[PRICING] contactUs planname ', planname)
      window.open(`mailto:${this.salesEmail}?subject=Upgrade to ${planname}`);

      // if (!isDevMode()) {
      try {
        window['analytics'].page('Pricing page', {

        });
      } catch (err) {
        this.logger.error('Pricing page error', err);
      }

      try {
        window['analytics'].track(`Contact us to upgrade plan to ${planname}`, {
          "email": this.user.email,
        }, {
          "context": {
            "groupId": this.projectId
          }
        });
      } catch (err) {
        this.logger.error('track contact us to upgrade plan error', err);
      }
    } else {
      this.presentModalAgentCannotManageAvancedSettings()
    }
  }


  updatesubscription(price) {
    this.projectService.updatesubscription(price).subscribe((updatesubscription: any) => {
      this.logger.log('[PRICING] - updatesubscription RES ', updatesubscription);

    }, error => {
      this.logger.error('[PRICING] - updatesubscription - ERROR: ', error);
    }, () => {
      this.logger.log('[PRICING] - updatesubscription * COMPLETE *')
    });

  }


  selected_Plan(planname) {
    this.planFeatures = [];
    this.highlightedFeatures = [];
    this.additionalFeatures = [];
    this.planName = planname;


    // console.log('select plan name', planname)
    this.planDecription = PLAN_DESC[planname]
    // console.log('select planDecription', this.planDecription);

    // if (planname === PLAN_NAME.A) {
    //   // console.log(' PLAN A Features')
    //   this.planFeatures = featuresPlanA;
    //   this.highlightedFeatures = highlightedFeaturesPlanA;
    // }
    // if (planname === PLAN_NAME.B) {
    //   // console.log(' PLAN B Features')
    //   this.planFeatures = featuresPlanB;
    //   this.highlightedFeatures = highlightedFeaturesPlanB;
    // }

    // if (planname === PLAN_NAME.C) {
    //   // console.log(' PLAN C Features');
    //   this.planFeatures = featuresPlanC;
    //   this.highlightedFeatures = highlightedFeaturesPlanC;
    // }

    if (planname === PLAN_NAME.D) {
      this.logger.log(' PLAN D Features')
      this.planFeatures = featuresPlanD;
      this.highlightedFeatures = highlightedFeaturesPlanD;
      this.additionalFeatures = additionalFeaturesPlanD
    }
    if (planname === PLAN_NAME.E) {
      this.logger.log(' PLAN E Features')
      this.planFeatures = featuresPlanE;
      this.highlightedFeatures = highlightedFeaturesPlanE;
      this.additionalFeatures = additionalFeaturesPlanE
    }

    if (planname === PLAN_NAME.F) {
      this.logger.log(' PLAN F Features');
      this.planFeatures = featuresPlanF;
      this.highlightedFeatures = highlightedFeaturesPlanF;
    }

    this.selectedPeriod('monthly')
  }

  selectedPeriod(period) {
    // console.log('selectedPeriod > select plan name', this.planName)
    // console.log('selectedPeriod > select period', period)
    // annualPeriod: boolean; 
    // monthlyPeriod: boolean; 
    if (period === 'monthly') {
      this.monthlyPeriod = true;
      this.annualPeriod = false;
      // if (this.planName === PLAN_NAME.A) {
      //   this.monthlyPrice = MONTHLY_PRICE[PLAN_NAME.A]
      // }
      // if (this.planName === PLAN_NAME.B) {
      //   this.monthlyPrice = MONTHLY_PRICE[PLAN_NAME.B]
      // }
      // if (this.planName === PLAN_NAME.C) {
      //   this.monthlyPrice = MONTHLY_PRICE[PLAN_NAME.C]
      // }

      if (this.planName === PLAN_NAME.D) {
        this.monthlyPrice = MONTHLY_PRICE[PLAN_NAME.D]
      }
      if (this.planName === PLAN_NAME.E) {
        this.monthlyPrice = MONTHLY_PRICE[PLAN_NAME.E]
      }
      if (this.planName === PLAN_NAME.F) {
        this.monthlyPrice = MONTHLY_PRICE[PLAN_NAME.F]
      }

    }

    if (period === 'annual') {
      this.monthlyPeriod = false;
      this.annualPeriod = true;
      // if (this.planName === PLAN_NAME.A) {
      //   this.annualPrice = ANNUAL_PRICE[PLAN_NAME.A]
      // }
      // if (this.planName === PLAN_NAME.B) {
      //   this.annualPrice = ANNUAL_PRICE[PLAN_NAME.B]
      // }
      // if (this.planName === PLAN_NAME.C) {
      //   this.annualPrice = ANNUAL_PRICE[PLAN_NAME.C]
      // }

      if (this.planName === PLAN_NAME.D) {
        this.annualPrice = ANNUAL_PRICE[PLAN_NAME.D]
      }
      if (this.planName === PLAN_NAME.E) {
        this.annualPrice = ANNUAL_PRICE[PLAN_NAME.E]
      }
      if (this.planName === PLAN_NAME.F) {
        this.annualPrice = ANNUAL_PRICE[PLAN_NAME.F]
      }
    }
  }

  getBrowserLanguage() {
    this.browser_lang = this.translate.getBrowserLang();
    // console.log('[PRICING] - browser_lang ', this.browser_lang)
  }

  getRouteParamsAndAppId() {
    const appID = this.appConfigService.getConfig().firebase.appId;
    this.logger.log('[PRICING] GET ROUTE-PARAMS & APPID - APP ID: ', appID);

    this.route.queryParams.subscribe((params) => {
      this.logger.log('[PRICING] - GET ROUTE-PARAMS & APPID - params: ', params)
      if (params.nk) {
        this.logger.log('[PRICING] -  GET ROUTE-PARAMS & APPID - params.nk: ', params.nk)
        // if (params.nk === 'y' && appID === "1:92907897826:web:f255664014a7cc14ee2fbb") {
        //   this.DISPLAY_BTN_PLAN_LIVE_20_CENTSXUNIT_PROD = true;
        //   this.logger.log('[PRICING] - ROUTE-PARAMS DISPLAY_BTN_PLAN_LIVE_20_CENTSXUNIT_PROD', this.DISPLAY_BTN_PLAN_LIVE_20_CENTSXUNIT_PROD)
        // }
        if (params.nk === 'y' && appID === "1:522823349790:web:0d4ba710f38b586e1fa00f") {
          this.DISPLAY_BTN_PLAN_TEST_3_EURXDAY_LIVE = true;
          // console.log('[PRICING] - ROUTE-PARAMS DISPLAY_BTN_PLAN_TEST_3_EURXDAY_LIVE', this.DISPLAY_BTN_PLAN_TEST_3_EURXDAY_LIVE)
        }
      }
      // if (appID === "1:522823349790:web:0d4ba710f38b586e1fa00f") { // prod
      //   this.ARE_VISIBLE_NEW_PRICING_BTN = false
      //   console.log('[PRICING] ARE_VISIBLE_NEW_PRICING_BTN prod key: ', this.ARE_VISIBLE_NEW_PRICING_BTN);
      // } else if (appID === "1:269505353043:web:b82af070572669e3707da6") { // pre
      //   this.ARE_VISIBLE_NEW_PRICING_BTN = true
      //   console.log('[PRICING] ARE_VISIBLE_NEW_PRICING_BTN pre key: ', this.ARE_VISIBLE_NEW_PRICING_BTN);
      // }
    });
  }
  // pre app id 1:269505353043:web:b82af070572669e3707da6
  // prod app id 1:522823349790:web:0d4ba710f38b586e1fa00f

  setPlansPKandCode() {
    if (this.TILEDESK_V2 === true) {
      this.logger.log('[PRICING] - TILEDESK_V2 ?', this.TILEDESK_V2)
      this.STRIPE_LIVE_PK = 'pk_live_ED4EiI7FHgu0rv4lEHAl8pff00n2qPazOn';
      this.LIVE_PLAN_X_MONTH_PLAN_CODE = 'plan_H3i8qRroJqwO6K';
      this.LIVE_PLAN_X_YEAR_PLAN_CODE = 'plan_H3iDFGtPN8coKT';
      this.LIVE_PLAN_X_DAY_20CENTS_PLAN_CODE = 'plan_H3iIUMonLu2jIW';

    } else {
      this.logger.log('[PRICING] - TILEDESK_V2 ?', this.TILEDESK_V2)
      this.STRIPE_LIVE_PK = 'pk_live_XcOe1UfJm9GkSgreETF7WGsc';
      this.LIVE_PLAN_X_MONTH_PLAN_CODE = 'plan_FrXJ00oxr0akaF';
      this.LIVE_PLAN_X_YEAR_PLAN_CODE = 'plan_FrXjIcRD20tsAN';
      this.LIVE_PLAN_X_DAY_20CENTS_PLAN_CODE = 'plan_FqRflmxFPy6AOn';


    }
  }

  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      // console.log('[PRICING] - getProjectPlan - project Profile Data ', projectProfileData)
      if (projectProfileData) {

        this.subscription_id = projectProfileData.subscription_id;
        this.projectCurrenPlan = projectProfileData.profile_name
        this.profileType = projectProfileData.profile_type

        // console.log('[PRICING]  - getProjectPlan > subscription_id ', this.subscription_id)
        // console.log('[PRICING]  - getProjectPlan > projectCurrenPlan ', this.projectCurrenPlan)
        // console.log('[PRICING]  - getProjectPlan > profileType ', this.profileType)
      }
    }, error => {

      this.logger.error('[PRICING] - getProjectPlan - ERROR', error);
    }, () => {

      // console.log('[PRICING] - getProjectPlan * COMPLETE *')

    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getNoOfProjectUsersAndPendingInvitations() {
    // https://stackoverflow.com/questions/44004144/how-to-wait-for-two-observables-in-rxjs
    const projectUsers = this.usersService.getProjectUsersByProjectId();
    const pendingInvitation = this.usersService.getPendingUsers();
    zip(projectUsers, pendingInvitation, (_projectUsers: any, _pendingInvitation: any) => ({ _projectUsers, _pendingInvitation }))
      .subscribe(pair => {
        // console.log('[PRICING]  - PAIR _projectUsers: ', pair._projectUsers);
        // console.log('[PRICING]  - PAIR _pendingInvitation: ', pair._pendingInvitation);

        if (pair) {
          const NoOfProjectUsers = pair._projectUsers.length
          const NoOfPendingInvitians = pair._pendingInvitation.length

          this.projectUsersNumber = NoOfProjectUsers + NoOfPendingInvitians;
          this.operatorNo = NoOfProjectUsers + NoOfPendingInvitians;
          this.logger.log('[PRICING] - PAIR operatorNo (sum of NoOfProjectUsers + NoOfPendingInvitians): ', this.operatorNo);
          this.numberOfAgentPerPrice = this.operatorNo * this.proPlanPerAgentPrice;
          // console.log('[PRICING] - PAIR numberOfAgentPerPrice: ', this.operatorNo);
        }
      }, error => {
        this.showSpinnerInTotalPrice = false;
        this.logger.error('[PRICING] - PAIR * ERROR: ', error);
      }, () => {
        this.showSpinnerInTotalPrice = false;
        this.logger.log('[PRICING] - PAIR * COMPLETE');
      });
  }

  getAllUsersOfCurrentProject() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      this.logger.log('[PRICING] - PROJECT USERS (FILTERED FOR PROJECT ID)', projectUsers);

      if (projectUsers) {
        this.projectUsersNumber = projectUsers.length
        this.logger.log('[PRICING] - PROJECT USERS (FILTERED FOR PROJECT ID) projectUsersNumber', this.projectUsersNumber);


        this.operatorNo = projectUsers.length
        this.numberOfAgentPerPrice = this.operatorNo * this.proPlanPerAgentPrice;
      }
    }, error => {
      this.showSpinnerInTotalPrice = false;
      this.logger.error('[PRICING] - PROJECT USERS (FILTERED FOR PROJECT ID) - ERROR', error);
    }, () => {
      this.showSpinnerInTotalPrice = false;
      this.logger.log('[PRICING] - PROJECT USERS (FILTERED FOR PROJECT ID) - COMPLETE');
    });
  }




  getBaseUrl() {
    const href = window.location.href;
    this.logger.log('[PRICING] href ', href)

    const hrefArray = href.split('/#/');
    this.dshbrdBaseUrl = hrefArray[0]

    this.logger.log('[PRICING] dshbrdBaseUrl ', this.dshbrdBaseUrl)
    // var url = new URL(href);
    // this.dashboardHost = url.origin
    // this.logger.log('[PRICING] host ', this.dashboardHost)
  }






  setPeriod(selectedPeriod: string) {
    this.logger.log('[PRICING] - selectedPeriod ', selectedPeriod);
    if (selectedPeriod === 'perMonth') {
      this.perMonth = true;
      this.perYear = false;
    } else if (selectedPeriod === 'perYear') {
      this.perYear = true;
      this.perMonth = false;
    }
  }

  decreaseOperatorNumber() {
    if (this.operatorNo > this.projectUsersNumber) {
      this.operatorNo -= 1;
    } else {
      this.openInfoModal()
    }

    this.logger.log('[PRICING] - decreaseOperatorNumber operatorNo', this.operatorNo);
    // this.switchPlanPrice()
    this.numberOfAgentPerPrice = this.operatorNo * this.proPlanPerAgentPrice;
    //
    // if ((this.operatorNo <= this.projectUsersNumber) && (this.info_modal_has_been_displayed === false)) {

    //   this.openInfoModal()
    // }
  }

  openInfoModal() {
    // if (this.operatorNo === this.projectUsersNumber) {
    this.displayInfoModal = 'block'

    // this.info_modal_has_been_displayed = true;
    // }
  }

  closeInfoModal() {
    this.displayInfoModal = 'none'
  }

  increaseOperatorNumber() {
    this.operatorNo += 1;

    // this.switchPlanPrice()
    this.numberOfAgentPerPrice = this.operatorNo * this.proPlanPerAgentPrice;
  }



  goBack() {
    this.location.back();
  }


  /**
   **! *** *** *** *** *** *** *** *** *** ** !*
   **!        PRO PLAN X MOUNTH - LIVE        !*
   **! *** *** *** *** *** *** *** *** *** ** !*
   */
  stripeProPlanPerMonthCheckout() {
    const that = this;
    this.logger.log('[PRICING] - clicked on stripeProPlanPerMonthCheckout (LIVE) ');

    // const stripe = Stripe('pk_test_lurAeBj5B7n7JGvE1zIPIFwV');
    // const stripe = Stripe('pk_live_XcOe1UfJm9GkSgreETF7WGsc');
    const stripe = Stripe(this.STRIPE_LIVE_PK);

    // ID OF THE TEST MONTHLY PLAN plan_EjFHNnzJXE3jul
    stripe.redirectToCheckout({
      items: [{ plan: this.LIVE_PLAN_X_MONTH_PLAN_CODE, quantity: that.operatorNo }],

      clientReferenceId: that.currentUserID + '|' + that.projectId,
      customerEmail: that.currentUserEmail,

      // successUrl: 'https://your-website.com/success',
      // cancelUrl: 'https://your-website.com/canceled',

      successUrl: this.dshbrdBaseUrl + '/#/project/' + this.projectId + '/success',
      cancelUrl: this.dshbrdBaseUrl + '/#/project/' + this.projectId + '/canceled',


    }).then(function (result) {
      this.logger.log('[PRICING] - clicked on stripeProPlanPerMonthCheckout (LIVE) result', result);

      if (result.error) {
        // If `redirectToCheckout` fails due to a browser or network
        // error, display the localized error message to your customer.
        that.displayStipeCheckoutError = result.error.message;

      }
    });
  }


  /**
   **! *** *** *** *** *** *** *** *** *** * !*
   **!         PRO PLAN X YEAR - LIVE        !*
   **! *** *** *** *** *** *** *** *** *** * !*
   */
  stripeProPlanPerYearCheckout() {
    const that = this;
    // const stripe = Stripe('pk_test_lurAeBj5B7n7JGvE1zIPIFwV');
    const stripe = Stripe(this.STRIPE_LIVE_PK);

    // When the customer clicks on the button, redirect
    // them to Checkout.
    // ID OF THE TEST yearly PLAN plan_FHYWzhwbGermkq
    stripe.redirectToCheckout({
      items: [{ plan: this.LIVE_PLAN_X_YEAR_PLAN_CODE, quantity: that.operatorNo }],
      clientReferenceId: that.currentUserID + '|' + that.projectId,
      customerEmail: that.currentUserEmail,

      // Do not rely on the redirect to the successUrl for fulfilling
      // purchases, customers may not always reach the success_url after
      // a successful payment.
      // Instead use one of the strategies described in
      // https://stripe.com/docs/payments/checkout/fulfillment
      successUrl: this.dshbrdBaseUrl + '/#/project/' + this.projectId + '/success',
      cancelUrl: this.dshbrdBaseUrl + '/#/project/' + this.projectId + '/canceled',
    })
      .then(function (result) {
        this.logger.log('[PRICING] - clicked on stripeProPlanPerYearCheckout (LIVE) result', result);
        if (result.error) {
          // If `redirectToCheckout` fails due to a browser or network
          // error, display the localized error message to your customer.

          // var displayError = document.getElementById('error-message');
          // displayError.textContent = result.error.message;

          that.displayStipeCheckoutError = result.error.message;
        }
      });
  }

  /**
  **! *** *** *** *** *** *** *** *** *** *** *** !*
  **!     LIVE PLAN 0,20 €/giorno MIN 3 QTY       !*
  **! *** *** *** *** *** *** *** *** *** *** *** !*
  */
  stripeLiveProDailyCheckout() {
    const that = this;
    const stripe = Stripe(this.STRIPE_LIVE_PK);

    // When the customer clicks on the button, redirect
    // them to Checkout.
    stripe.redirectToCheckout({
      items: [{ plan: this.LIVE_PLAN_X_DAY_20CENTS_PLAN_CODE, quantity: that.operatorNo }],
      clientReferenceId: that.currentUserID + '|' + that.projectId,
      customerEmail: that.currentUserEmail,

      // Do not rely on the redirect to the successUrl for fulfilling
      // purchases, customers may not always reach the success_url after
      // a successful payment.
      // Instead use one of the strategies described in
      // https://stripe.com/docs/payments/checkout/fulfillment
      successUrl: this.dshbrdBaseUrl + '/#/project/' + this.projectId + '/success',
      cancelUrl: this.dshbrdBaseUrl + '/#/project/' + this.projectId + '/canceled',
    })
      .then(function (result) {
        if (result.error) {
          // If `redirectToCheckout` fails due to a browser or network
          // error, display the localized error message to your customer.

          // var displayError = document.getElementById('error-message');
          // displayError.textContent = result.error.message;
          that.displayStipeCheckoutError = result.error.message;
        }
      });
  }


  /**
  **! *** *** *** *** *** *** *** *** !*
  **!  TEST DAILY PLAN €3.00 EUR/day  !*
  **! *** *** *** *** *** *** *** *** !*
  */
  stripeProPlanPerDayCheckout() {
    const that = this;
    const stripe = Stripe('pk_test_lurAeBj5B7n7JGvE1zIPIFwV');

    // When the customer clicks on the button, redirect
    // them to Checkout.
    stripe.redirectToCheckout({
      items: [{ plan: 'plan_FiYA1sAElF2aNp', quantity: that.operatorNo }],
      clientReferenceId: that.currentUserID + '|' + that.projectId,
      customerEmail: that.currentUserEmail,

      // Do not rely on the redirect to the successUrl for fulfilling
      // purchases, customers may not always reach the success_url after
      // a successful payment.
      // Instead use one of the strategies described in
      // https://stripe.com/docs/payments/checkout/fulfillment
      successUrl: this.dshbrdBaseUrl + '/#/project/' + this.projectId + '/success',
      cancelUrl: this.dshbrdBaseUrl + '/#/project/' + this.projectId + '/canceled',
    })
      .then(function (result) {
        if (result.error) {
          // If `redirectToCheckout` fails due to a browser or network
          // error, display the localized error message to your customer.

          // var displayError = document.getElementById('error-message');
          // displayError.textContent = result.error.message;
          that.displayStipeCheckoutError = result.error.message;
        }
      });
  }


  /**
  **! *** *** *** *** *** *** *** *** *** *** *** !*
  **!  TEST DAILY WITH TRIAL PLAN €10.00 EUR/day  !*
  **! *** *** *** *** *** *** *** *** *** *** *** !*
  */
  stripeProPlanPerDayWithTrialCheckout() {
    const that = this;
    const stripe = Stripe('pk_test_lurAeBj5B7n7JGvE1zIPIFwV');

    // When the customer clicks on the button, redirect
    // them to Checkout.
    stripe.redirectToCheckout({
      items: [{ plan: 'plan_Fn0Jy1ecmNXAjK', quantity: that.operatorNo }],
      clientReferenceId: that.currentUserID + '|' + that.projectId,
      customerEmail: that.currentUserEmail,

      // Do not rely on the redirect to the successUrl for fulfilling
      // purchases, customers may not always reach the success_url after
      // a successful payment.
      // Instead use one of the strategies described in
      // https://stripe.com/docs/payments/checkout/fulfillment
      successUrl: this.dshbrdBaseUrl + '/#/project/' + this.projectId + '/success',
      cancelUrl: this.dshbrdBaseUrl + '/#/project/' + this.projectId + '/canceled',
    })
      .then(function (result) {
        if (result.error) {
          // If `redirectToCheckout` fails due to a browser or network
          // error, display the localized error message to your customer.

          // var displayError = document.getElementById('error-message');
          // displayError.textContent = result.error.message;
          that.displayStipeCheckoutError = result.error.message;
        }
      });
  }








  launchWidget() {
    // if (window && window['tiledesk']) {
    //   window['tiledesk'].open();
    // }

    // <a onClick="javascript:window.open('mailto:mail@domain.com', 'mail');event.preventDefault()" href="mailto:mail@domain.com">Send a e-mail</a>

    // const mailTo = "mailto:info@tiledesk.com";
    // window.location.href = mailTo;
    // window.open('mailto:{{contactUsEmail}}', 'mail')
    window.open(`mailto:${this.salesEmail}?subject=Upgrade plan`);

  }

  openReportPaymentModal() {
    this.displayPaymentReport = 'block'
  }

  closePaymentReportModal() {
    this.displayPaymentReport = 'none'
  }

  // -------------------------------------------------------------
  // Used for test (uncomment the button in the template to use it) 
  // -------------------------------------------------------------
  cancelSubcription() {
    this.projectService.cancelSubscription().subscribe((confirmation: any) => {
      this.logger.log('[PRICING] - cancelSubscription RES ', confirmation);

    }, error => {
      this.logger.error('[PRICING] - cancelSubscription - ERROR: ', error);
    }, () => {
      this.logger.log('[PRICING] - cancelSubscription * COMPLETE *')
    });

  }








}
