import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

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

}
