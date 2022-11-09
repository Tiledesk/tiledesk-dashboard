import { Component, OnInit } from '@angular/core';
import { URL_understanding_default_roles } from '../../utils/util';
@Component({
  selector: 'appdashboard-unauthorized-for-pricing',
  templateUrl: './unauthorized-for-pricing.component.html',
  styleUrls: ['./unauthorized-for-pricing.component.scss']
})
export class UnauthorizedForPricingComponent implements OnInit {

  URL_UNDERSTANDING_DEFAULT_ROLES = URL_understanding_default_roles
  constructor() { }

  ngOnInit() {
  }

}
