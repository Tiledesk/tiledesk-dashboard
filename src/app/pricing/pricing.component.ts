
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService } from '../core/auth.service';
import { ActivatedRoute } from '@angular/router'
import { UsersService } from '../services/users.service';
import { ProjectService } from '../services/project.service';
import { ProjectPlanService } from '../services/project-plan.service';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { BrandService } from '../services/brand.service';
import { LoggerService } from '../services/logger/logger.service';
import { AppConfigService } from '../services/app-config.service';

declare var Stripe: any;

@Component({
  selector: 'appdashboard-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit, OnDestroy {

  // company_name = brand.company_name;
  company_name: string;

  projectId: string;
  projectName: string;
  currentUserID: string;
  currentUserEmail: string;

  // operatorNo = 1
  operatorNo: number;
  numberOfAgentPerPrice: number
  enterprisePlanNoAgentPerPrice: number

  selectedPlanName: string;
  proPlanPerAgentPrice = 5;

  yearlyProPlanPerAgentPrice = 4.16;
  // yearlyProPlanPerAgentPrice = 4;
  enterprisePlanPerAgentPrice = 59;

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

  DISPLAY_BTN_PLAN_LIVE_20_CENTSXUNIT_PROD: boolean = false;
  DISPLAY_BTN_PLAN_TEST_3_EURXUNIT_PRE: boolean = false;
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
  ) { 

    const brand = brandService.getBrand();
    this.company_name = brand['company_name'];
  }

  /**
   * FOR TEST PLANS in the Stripe Dashboard> Developers> Webhook> Webhook Details click Update details and enter
   * in endpoint URL:
   *  
   *  * to test from localhost start ngrok and replace the initial part of the url
   *    http://03caec73.ngrok.io/modules/payments/stripe/webhook
   * 
   *  Note: to create an ngrok tunnel run: ./ngrok http  http://localhost:3000/
   * 
   *  * to test in in PRE 
   *    https://tiledesk-server-pre.herokuapp.com/modules/payments/stripe/webhook
   * 
   */


  ngOnInit() {
    this.auth.checkRoleForCurrentProjectAndRedirectAdminAndAgent(); // redirect admin and ahent -- only owner has access to payment
    this.getCurrentProject();
    this.selectedPlanName = 'pro'

    // this.switchPlanPrice()

    this.getBaseUrl()
    this.getCurrentUser();
    // this.getAllUsersOfCurrentProject();
    this.getNoOfProjectUsersAndPendingInvitations();

    this.getProjectPlan();

    this.setPlansPKandCode();
    this.getRouteParamsAndAppId();
  }

  getRouteParamsAndAppId() {
    const appID = this.appConfigService.getConfig().firebase.appId;
    this.logger.log('[PRICING] GET ROUTE-PARAMS & APPID - APP ID: ', appID);

    this.route.queryParams.subscribe((params) => {
      this.logger.log('[PRICING] - GET ROUTE-PARAMS & APPID - params: ', params)
      if (params.nk) {
        this.logger.log('[PRICING] -  GET ROUTE-PARAMS & APPID - params.nk: ', params.nk)
        if(params.nk === 'y' && appID === "1:92907897826:web:f255664014a7cc14ee2fbb") {
          this.DISPLAY_BTN_PLAN_LIVE_20_CENTSXUNIT_PROD = true;
          this.logger.log('[PRICING] - ROUTE-PARAMS DISPLAY_BTN_PLAN_LIVE_20_CENTSXUNIT_PROD', this.DISPLAY_BTN_PLAN_LIVE_20_CENTSXUNIT_PROD)
        }
        if(params.nk === 'y' && appID === "1:269505353043:web:b82af070572669e3707da6") {
          this.DISPLAY_BTN_PLAN_TEST_3_EURXUNIT_PRE = true;
          this.logger.log('[PRICING] - ROUTE-PARAMS DISPLAY_BTN_PLAN_TEST_3_EURXUNIT_PRE', this.DISPLAY_BTN_PLAN_TEST_3_EURXUNIT_PRE)
        }

        
      }
    });
  }


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
      this.logger.log('[PRICING] - getProjectPlan - project Profile Data ', projectProfileData)
      if (projectProfileData) {

        this.subscription_id = projectProfileData.subscription_id;
        this.logger.log('[PRICING]  - getProjectPlan > subscription_id ', this.subscription_id)

      }
    }, error => {
    
      this.logger.error('[PRICING] - getProjectPlan - ERROR', error);
    }, () => {
     
      this.logger.log('[PRICING] - getProjectPlan * COMPLETE *')

    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getNoOfProjectUsersAndPendingInvitations() {

    // https://stackoverflow.com/questions/44004144/how-to-wait-for-two-observables-in-rxjs
    const projectUsers = this.usersService.getProjectUsersByProjectId();
    const pendingInvitation = this.usersService.getPendingUsers();

    Observable
      .zip(projectUsers, pendingInvitation, (_projectUsers: any, _pendingInvitation: any) => ({ _projectUsers, _pendingInvitation }))
      .subscribe(pair => {
        this.logger.log('[PRICING]  - PAIR _projectUsers: ', pair._projectUsers);
        this.logger.log('[PRICING]  - PAIR _pendingInvitation: ', pair._pendingInvitation);

        if (pair) {
          const NoOfProjectUsers = pair._projectUsers.length
          const NoOfPendingInvitians = pair._pendingInvitation.length

          this.projectUsersNumber = NoOfProjectUsers + NoOfPendingInvitians;
          this.operatorNo = NoOfProjectUsers + NoOfPendingInvitians;
          this.logger.log('[PRICING] - PAIR operatorNo (sum of NoOfProjectUsers + NoOfPendingInvitians): ', this.operatorNo);
          this.numberOfAgentPerPrice = this.operatorNo * this.proPlanPerAgentPrice;
          this.logger.log('[PRICING] - PAIR numberOfAgentPerPrice: ', this.operatorNo);
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

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.logger.log('[PRICING] - project ', project)
        this.projectId = project._id;
        this.logger.log('[PRICING] - projectId ', this.projectId)
        this.projectName = project.name;
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

    } else {
      // this.logger.log('No user is signed in');
    }
  }


  selectedPlan(_selectedPlanName: string) {
    this.selectedPlanName = _selectedPlanName
    this.logger.log('[PRICING] selectePlanName ', this.selectedPlanName);

    this.switchPlanPrice()
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

  switchPlanPrice() {
    if (this.selectedPlanName === 'pro') {
      this.numberOfAgentPerPrice = this.operatorNo * this.proPlanPerAgentPrice;
    } else {
      this.numberOfAgentPerPrice = this.operatorNo * this.enterprisePlanPerAgentPrice;
    }
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
    window.open('mailto:info@tiledesk.com', 'mail')
  }

  openReportPaymentModal() {
    this.displayPaymentReport = 'block'
  }

  closePaymentReportModal() {
    this.displayPaymentReport = 'none'
  }


  cancelSubcription() {
    this.projectService.cancelSubscription().subscribe((confirmation: any) => {
      this.logger.log('[PRICING] - cancelSubscription RES ', confirmation);

    }, error => {
      this.logger.error('[PRICING] - cancelSubscription - ERROR: ', error);
    }, () => {
      this.logger.log('[PRICING] - cancelSubscription * COMPLETE *')
    });

  }

  updatesubscription() {
    this.projectService.updatesubscription().subscribe((updatesubscription: any) => {
      this.logger.log('[PRICING] - updatesubscription RES ', updatesubscription);

    }, error => {
      this.logger.error('[PRICING] - updatesubscription - ERROR: ', error);
    }, () => {
      this.logger.log('[PRICING] - updatesubscription * COMPLETE *')
    });

  }




}
