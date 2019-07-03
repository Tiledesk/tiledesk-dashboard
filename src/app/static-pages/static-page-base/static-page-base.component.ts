import { Component, OnInit } from '@angular/core';
// import { ProjectPlanService } from '../../services/project-plan.service';
// import { NotifyService } from '../../core/notify.service';


@Component({
  selector: 'appdashboard-static-page-base',
  templateUrl: './static-page-base.component.html',
  styleUrls: ['./static-page-base.component.scss']
})
export class StaticPageBaseComponent implements OnInit {
  prjct_profile_type: string;
  subscription_is_active: any;
  prjct_profile_name: string;
  subscription_end_date: Date;

  constructor(
    // protected prjctPlanService: ProjectPlanService,
    // protected notify: NotifyService
  ) { }

  ngOnInit() {
    // this.getProjectPlan();
   

  }


  buildPlanName(planName: string, browserLang: string) {


return planName
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
