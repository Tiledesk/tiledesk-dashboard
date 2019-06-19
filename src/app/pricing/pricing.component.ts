import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
declare var Stripe: any;

@Component({
  selector: 'appdashboard-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit {
  operatorNo = 1
  numberOfAgentPerPrice: number
  enterprisePlanNoAgentPerPrice: number

  selectedPlanName: string;
  proPlanPerAgentPrice = 8;
  enterprisePlanPerAgentPrice = 59;

  displayStipeCheckoutError: any;
  perMonth = true;
  perYear: boolean;

  constructor(
    public location: Location,
  ) { }

  ngOnInit() {

    this.selectedPlanName = 'pro'

    this.switchPlanPrice()
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

      successUrl: 'https://your-website.com/success',
      cancelUrl: 'https://your-website.com/canceled',

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
      successUrl: 'https://your-website.com/success',
      cancelUrl: 'https://your-website.com/canceled',
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



}
