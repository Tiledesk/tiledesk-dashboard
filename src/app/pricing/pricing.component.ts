import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService } from '../core/auth.service';
import { Router } from '@angular/router'

declare var Stripe: any;

@Component({
  selector: 'appdashboard-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit {
  projectId: string;

  operatorNo = 1
  numberOfAgentPerPrice: number
  enterprisePlanNoAgentPerPrice: number

  selectedPlanName: string;
  proPlanPerAgentPrice = 8;
  enterprisePlanPerAgentPrice = 59;

  displayStipeCheckoutError: any;
  perMonth = true;
  perYear: boolean;

  dashboardHost: string;

  constructor(
    public location: Location,
    public auth: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.getCurrentProject();
    this.selectedPlanName = 'pro'

    this.switchPlanPrice()
    // const route = this.router;
    // console.log('PricingComponent route ', route)

    this.getUrlHost()

  }


  getUrlHost() {
    const href = window.location.href;
    console.log('PricingComponent href ', href)

    var url = new URL(href);
    this.dashboardHost = url.origin
    console.log('PricingComponent host ', this.dashboardHost)

  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.projectId = project._id
        console.log('PricingComponent - projectId ', this.projectId)
      }
    });
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

    this.switchPlanPrice()
  }

  increaseOperatorNumber() {
    this.operatorNo += 1;

    this.switchPlanPrice()
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


  stripeProPlanPerMonthCheckout() {
    const that = this;
    console.log('clicked on stripeProPlanPerMonthCheckout ');

    const stripe = Stripe('pk_test_lurAeBj5B7n7JGvE1zIPIFwV');

    stripe.redirectToCheckout({
      items: [{ plan: 'plan_EjFHNnzJXE3jul', quantity: that.operatorNo }],

      // successUrl: 'https://your-website.com/success',
      // cancelUrl: 'https://your-website.com/canceled',

      successUrl: this.dashboardHost + '/#/project/' + this.projectId + '/success',
      cancelUrl: this.dashboardHost + '/#/project/' + this.projectId + '/canceled',


    }).then(function (result) {
      console.log('clicked on stripeProPlanPerMonthCheckout result', result);

      if (result.error) {
        // If `redirectToCheckout` fails due to a browser or network
        // error, display the localized error message to your customer.
        that.displayStipeCheckoutError = result.error.message;

      }
    });
  }



  stripeProPlanPerYearCheckout() {
    const that = this;
    const stripe = Stripe('pk_test_lurAeBj5B7n7JGvE1zIPIFwV');

    // When the customer clicks on the button, redirect
    // them to Checkout.
    stripe.redirectToCheckout({
      items: [{ plan: 'plan_FHYWzhwbGermkq', quantity: that.operatorNo }],

      // Do not rely on the redirect to the successUrl for fulfilling
      // purchases, customers may not always reach the success_url after
      // a successful payment.
      // Instead use one of the strategies described in
      // https://stripe.com/docs/payments/checkout/fulfillment
      successUrl: this.dashboardHost + '/#/project/' + this.projectId + '/success',
      cancelUrl: this.dashboardHost + '/#/project/' + this.projectId + '/canceled',
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


}
