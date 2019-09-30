import { Component, OnInit } from '@angular/core';
// import { ProjectPlanService } from '../../services/project-plan.service';
// import { NotifyService } from '../../core/notify.service';


@Component({
  selector: 'appdashboard-static-page-base',
  templateUrl: './static-page-base.component.html',
  styleUrls: ['./static-page-base.component.scss']
})
export class StaticPageBaseComponent implements OnInit {

  prjct_profile_name: string;

  constructor(
    // protected prjctPlanService: ProjectPlanService,
    // protected notify: NotifyService
  ) { }

  ngOnInit() {
    // this.getProjectPlan();


  }


  // ADDS 'Plan' to the project plan's name
  // NOTE: IF THE PLAN IS OF FREE TYPE IN THE USER INTERFACE THE MODAL 'YOU SUBSCRIPTION HAS EXPIRED' IS NOT DISPLAYED
  buildPlanName(planName: string, browserLang: string, planType: string) {
    console.log('StaticPageBaseComponent planName ', planName, ' browserLang  ', browserLang);

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




  // getProjectPlan() {
  //   this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
  //     console.log('StaticPageBaseComponent (HomeComponent) project Profile Data', projectProfileData)
  //     if (projectProfileData) {



  //       this.prjct_profile_type = projectProfileData.profile_type;
  //       this.subscription_is_active = projectProfileData.subscription_is_active;
  //       this.prjct_profile_name = projectProfileData.profile_name;
  //       this.subscription_end_date = projectProfileData.subscription_end_date

  //       if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {


  //         this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date)
  //       }


  //     }
  //   })
  // }



}
