import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from 'app/services/app-config.service';



@Component({
  selector: 'appdashboard-static-page-base',
  templateUrl: './static-page-base.component.html',
  styleUrls: ['./static-page-base.component.scss']
})
export class StaticPageBaseComponent implements OnInit {

  prjct_profile_name: string;
  public_Key:any
  payIsVisible: boolean;
  constructor(
    public translate: TranslateService,
    
  
  ) { 
   
  
  }

  ngOnInit() { 
    
  }




  // ADDS 'Plan' to the project plan's name
  // NOTE: IF THE PLAN IS OF FREE TYPE IN THE USER INTERFACE THE MODAL 'YOU SUBSCRIPTION HAS EXPIRED' IS NOT DISPLAYED
  buildPlanName(planName: string, browserLang: string, planType: string) {
    // console.log('[STATIC-PAGE-BASE] BUILD PLAN NAME - planName ', planName, ' browserLang  ', browserLang);

    if (planType === 'payment') {

      this.getPaidPlanTranslation(planName)
      // if (browserLang === 'it') {

      //   this.prjct_profile_name = 'Piano ' + planName;

      //   return this.prjct_profile_name

      // } else if (browserLang !== 'it') {

      //   this.prjct_profile_name = planName + ' Plan';

      //   return this.prjct_profile_name
      // }
    }
    
  }

  getPaidPlanTranslation(project_profile_name) {
    this.translate.get('PaydPlanName', { projectprofile: project_profile_name })
      .subscribe((text: string) => {
        this.prjct_profile_name = text;
        // this.logger.log('+ + + PaydPlanName ', text)
      });
  }


}
