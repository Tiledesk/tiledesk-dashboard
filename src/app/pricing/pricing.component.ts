import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService } from '../core/auth.service';
import { Router } from '@angular/router'
import { UsersService } from '../services/users.service';
import { ProjectService } from '../services/project.service';
import { ProjectPlanService } from '../services/project-plan.service';
declare var Stripe: any;

@Component({
  selector: 'appdashboard-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit {
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
  subscription_id: string
  constructor(
    public location: Location,
    public auth: AuthService,
    private router: Router,
    private usersService: UsersService,
    public projectService: ProjectService,
    private prjctPlanService: ProjectPlanService
  ) { }

  ngOnInit() {
    this.getCurrentProject();
    this.selectedPlanName = 'pro'

    // this.switchPlanPrice()

    this.getBaseUrl()
    this.getCurrentUser();
    this.getAllUsersOfCurrentProject();
    this.getProjectPlan();
    
  }


  getProjectPlan() {

    this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      console.log('PricingComponent - project Profile Data ', projectProfileData)
      if (projectProfileData) {

        this.subscription_id = projectProfileData.subscription_id;
        console.log('PricingComponent - project Profile Data > subscription_id ', this.subscription_id )

      }
    })
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
    this.operatorNo -= 1;

    console.log('decreaseOperatorNumber operatorNo', this.operatorNo);
    // this.switchPlanPrice()
    this.numberOfAgentPerPrice = this.operatorNo * this.proPlanPerAgentPrice;

    if ((this.operatorNo < this.projectUsersNumber) && (this.info_modal_has_been_displayed === false)) {

      this.openInfoModal()
    }
  }

  openInfoModal() {
    // if (this.operatorNo === this.projectUsersNumber) {
    this.displayInfoModal = 'block'

    this.info_modal_has_been_displayed = true;
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
   * ***************************
   * *** PRO PLAN X MOUNTH  ***
   * ***************************
   */
  stripeProPlanPerMonthCheckout() {
    const that = this;
    console.log('clicked on stripeProPlanPerMonthCheckout ');

    const stripe = Stripe('pk_test_lurAeBj5B7n7JGvE1zIPIFwV');

    stripe.redirectToCheckout({
      items: [{ plan: 'plan_EjFHNnzJXE3jul', quantity: that.operatorNo }],
     
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
   * *************************
   * *** PRO PLAN X YEAR  ***
   * *************************
   */
  stripeProPlanPerYearCheckout() {
    const that = this;
    const stripe = Stripe('pk_test_lurAeBj5B7n7JGvE1zIPIFwV');

    // When the customer clicks on the button, redirect
    // them to Checkout.
    stripe.redirectToCheckout({
      items: [{ plan: 'plan_FHYWzhwbGermkq', quantity: that.operatorNo }],
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
// this.projectService.cancelSubscription().subscribe((faq: any) => { });

  }
}
