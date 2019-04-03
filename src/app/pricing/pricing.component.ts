import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'appdashboard-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit {
  operatorNo = 1
  proPlanNoOperatorPerPrice: number
  constructor(
    public location: Location,
  ) { }

  ngOnInit() {

    this.proPlanNoOperatorPerPrice =  this.operatorNo * 8
  }

  decreaseOperatorNumber() {
    this.operatorNo -= 1;

    this.proPlanNoOperatorPerPrice =  this.operatorNo * 8
  }

  increaseOperatorNumber() {
    this.operatorNo += 1;

    this.proPlanNoOperatorPerPrice =  this.operatorNo * 8
  }

  goBack() {
    this.location.back();
  }

}
