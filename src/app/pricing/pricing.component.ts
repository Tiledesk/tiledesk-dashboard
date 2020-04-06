import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService } from '../core/auth.service';
import { Router } from '@angular/router'
import { UsersService } from '../services/users.service';
import { ProjectService } from '../services/project.service';
import { ProjectPlanService } from '../services/project-plan.service';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
declare var Stripe: any;
import { Subscription } from 'rxjs';
import brand from 'assets/brand/brand.json';
@Component({
  selector: 'appdashboard-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit, OnDestroy {
  
  company_name = brand.company_name;

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

  yearlyProPlanPerAgentPrice = 4.16
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

  constructor(
    public location: Location,
    public auth: AuthService,
    private router: Router,
    private usersService: UsersService,
    public projectService: ProjectService,
    private prjctPlanService: ProjectPlanService
  ) { }

  /**
   *  PER I PIANI DI TEST IN Stripe > Sviluppatori > Webhook > Dettagli Webhook clicca Aggiorna dettagli ed inserisci
   *  in URL endpoint
   *  
   *  per testare in localhost fai partire ngrok e sortituisci la parte iniziale dell'url 
   *  http://03caec73.ngrok.io/modules/payments/stripe/webhook
   * 
   *  per testate in PRE 
   *  https://tiledesk-server-pre.herokuapp.com/modules/payments/stripe/webhook
   * 
   */
 

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    this.getCurrentProject();
    this.selectedPlanName = 'pro'

    // this.switchPlanPrice()

    this.getBaseUrl()
    this.getCurrentUser();
    // this.getAllUsersOfCurrentProject();
    this.getNoOfProjectUsersAndPendingInvitations();

    this.getProjectPlan();

  }


  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      console.log('PricingComponent - project Profile Data ', projectProfileData)
      if (projectProfileData) {

        this.subscription_id = projectProfileData.subscription_id;
        console.log('PricingComponent - project Profile Data > subscription_id ', this.subscription_id)

      }
    })
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
        console.log('PricingComponent - PAIR _projectUsers: ', pair._projectUsers);
        console.log('PricingComponent - PAIR _projectUsers: ', pair._pendingInvitation);

        if (pair) {
          const NoOfProjectUsers = pair._projectUsers.length
          const NoOfPendingInvitians = pair._pendingInvitation.length

          this.projectUsersNumber = NoOfProjectUsers + NoOfPendingInvitians;
          this.operatorNo = NoOfProjectUsers + NoOfPendingInvitians;
          console.log('PricingComponent - PAIR operatorNo (sum of NoOfProjectUsers + NoOfPendingInvitians): ', this.operatorNo);
          this.numberOfAgentPerPrice = this.operatorNo * this.proPlanPerAgentPrice;
          console.log('PricingComponent - PAIR numberOfAgentPerPrice: ', this.operatorNo);
        }
      }, error => {
        this.showSpinnerInTotalPrice = false;
        console.log('PricingComponent - PAIR * ERROR: ', error);
      }, () => {
        this.showSpinnerInTotalPrice = false;
        console.log('PricingComponent - PAIR * COMPLETE');
      });
  }

  getAllUsersOfCurrentProject() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      console.log('PricingComponent - PROJECT USERS (FILTERED FOR PROJECT ID)', projectUsers);

      if (projectUsers) {
        this.projectUsersNumber = projectUsers.length
        console.log('PricingComponent - PROJECT USERS (FILTERED FOR PROJECT ID) projectUsersNumber', this.projectUsersNumber);


        this.operatorNo = projectUsers.length
        this.numberOfAgentPerPrice = this.operatorNo * this.proPlanPerAgentPrice;
      }
    }, error => {
      this.showSpinnerInTotalPrice = false;
      console.log('PricingComponent - PROJECT USERS (FILTERED FOR PROJECT ID) - ERROR', error);
    }, () => {
      this.showSpinnerInTotalPrice = false;
      console.log('PricingComponent - PROJECT USERS (FILTERED FOR PROJECT ID) - COMPLETE');
    });
  }




  getBaseUrl() {
    const href = window.location.href;
    console.log('PricingComponent href ', href)

    const hrefArray = href.split('/#/');
    this.dshbrdBaseUrl = hrefArray[0]

    console.log('PricingComponent dshbrdBaseUrl ', this.dshbrdBaseUrl)
    // var url = new URL(href);
    // this.dashboardHost = url.origin
    // console.log('PricingComponent host ', this.dashboardHost)
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        console.log('PricingComponent - project ', project)
        this.projectId = project._id;
        console.log('PricingComponent - projectId ', this.projectId)
        this.projectName = project.name;
      }
    });
  }

  getCurrentUser() {
    const user = this.auth.user_bs.value

    console.log('PricingComponent user ', user);
    if (user) {

      this.currentUserID = user._id
      this.currentUserEmail = user.email
      console.log('PricingComponent USER UID ', this.currentUserID);
      console.log('PricingComponent USER email ', this.currentUserEmail);

    } else {
      // console.log('No user is signed in');
    }
  }


  selectedPlan(_selectedPlanName: string) {
    this.selectedPlanName = _selectedPlanName
    console.log('selectePlanName ', this.selectedPlanName);

    this.switchPlanPrice()
  }

  setPeriod(selectedPeriod: string) {
    console.log('selectedPeriod ', selectedPeriod);
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

    console.log('decreaseOperatorNumber operatorNo', this.operatorNo);
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
    console.log('clicked on stripeProPlanPerMonthCheckout ');

    // const stripe = Stripe('pk_test_lurAeBj5B7n7JGvE1zIPIFwV');
    const stripe = Stripe('pk_live_XcOe1UfJm9GkSgreETF7WGsc');

    // ID OF THE TEST MONTHLY PLAN plan_EjFHNnzJXE3jul
    stripe.redirectToCheckout({
      items: [{ plan: 'plan_FrXJ00oxr0akaF', quantity: that.operatorNo }],

      clientReferenceId: that.currentUserID + '|' + that.projectId,
      customerEmail: that.currentUserEmail,

      // successUrl: 'https://your-website.com/success',
      // cancelUrl: 'https://your-website.com/canceled',

      successUrl: this.dshbrdBaseUrl + '/#/project/' + this.projectId + '/success',
      cancelUrl: this.dshbrdBaseUrl + '/#/project/' + this.projectId + '/canceled',


    }).then(function (result) {
      console.log('clicked on stripeProPlanPerMonthCheckout result', result);

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
    const stripe = Stripe('pk_live_XcOe1UfJm9GkSgreETF7WGsc');


    // When the customer clicks on the button, redirect
    // them to Checkout.
    // ID OF THE TEST yearly PLAN plan_FHYWzhwbGermkq
    stripe.redirectToCheckout({
      items: [{ plan: 'plan_FrXjIcRD20tsAN', quantity: that.operatorNo }],
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

  /**
  **! *** *** *** *** *** *** *** *** *** *** *** !*
  **!     LIVE PLAN 0,20 €/giorno MIN 3 QTY       !*
  **! *** *** *** *** *** *** *** *** *** *** *** !*
  */
  stripeLiveProDailyCheckout() {
    const that = this;  
    const stripe = Stripe('pk_live_XcOe1UfJm9GkSgreETF7WGsc');

    // When the customer clicks on the button, redirect
    // them to Checkout.
    stripe.redirectToCheckout({
      items: [{ plan: 'plan_FqRflmxFPy6AOn', quantity: that.operatorNo }],
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
    if (window && window['tiledesk']) {
      window['tiledesk'].open();
    }
  }

  openReportPaymentModal() {
    this.displayPaymentReport = 'block'
  }

  closePaymentReportModal() {
    this.displayPaymentReport = 'none'
  }


  cancelSubcription() {
    this.projectService.cancelSubscription().subscribe((confirmation: any) => {
      console.log('cancelSubscription RES ', confirmation);

    }, error => {
      console.log('cancelSubscription - ERROR: ', error);
    }, () => {
      console.log('cancelSubscription * COMPLETE *')
    });

  }

  updatesubscription() {
    this.projectService.updatesubscription().subscribe((updatesubscription: any) => {
      console.log('updatesubscription RES ', updatesubscription);

    }, error => {
      console.log('updatesubscription - ERROR: ', error);
    }, () => {
      console.log('updatesubscription * COMPLETE *')
    });

  }




}
