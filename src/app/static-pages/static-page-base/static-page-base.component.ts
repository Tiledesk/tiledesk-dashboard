import { Component, OnInit } from '@angular/core';



@Component({
  selector: 'appdashboard-static-page-base',
  templateUrl: './static-page-base.component.html',
  styleUrls: ['./static-page-base.component.scss']
})
export class StaticPageBaseComponent implements OnInit {

  prjct_profile_name: string;

  constructor(
  ) { }

  ngOnInit() { }


  // ADDS 'Plan' to the project plan's name
  // NOTE: IF THE PLAN IS OF FREE TYPE IN THE USER INTERFACE THE MODAL 'YOU SUBSCRIPTION HAS EXPIRED' IS NOT DISPLAYED
  buildPlanName(planName: string, browserLang: string, planType: string) {
    // console.log('[STATIC-PAGE-BASE] BUILD PLAN NAME - planName ', planName, ' browserLang  ', browserLang);

    if (planType === 'payment') {
      if (browserLang === 'it') {

        this.prjct_profile_name = 'Piano ' + planName;

        return this.prjct_profile_name

      } else if (browserLang !== 'it') {

        this.prjct_profile_name = planName + ' Plan';

        return this.prjct_profile_name
      }
    }
  }


}
