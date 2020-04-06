import { Component, OnInit, OnDestroy } from '@angular/core';
import { SlideshowModule } from 'ng-simple-slideshow';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { StaticPageBaseComponent } from './../static-page-base/static-page-base.component';
import { Subscription } from 'rxjs';
import { NotifyService } from '../../core/notify.service';
import { ProjectPlanService } from '../../services/project-plan.service';
import { TranslateService } from '@ngx-translate/core';
// node_modules/ng-simple-slideshow/src/app/modules/slideshow/IImage.d.ts
// src/app/static-pages/departments-static/departments-static.component.ts
@Component({
  selector: 'appdashboard-departments-static',
  templateUrl: './departments-static.component.html',
  styleUrls: ['./departments-static.component.scss']
})
export class DepartmentsStaticComponent extends StaticPageBaseComponent implements OnInit, OnDestroy {


  imageUrlArray = [
    { url: 'assets/img/static-depts4.png', backgroundSize: 'contain' },
    { url: 'assets/img/static-depts5.png', backgroundSize: 'contain' }
  ];


  // ,
  // 'https://cdn.vox-cdn.com/uploads/chorus_asset/file/9278671/jbareham_170917_2000_0124.jpg',
  // 'https://cdn.vox-cdn.com/uploads/chorus_image/image/56789263/akrales_170919_1976_0104.0.jpg'

  activities: any;
  agentAvailabilityOrRoleChange: string;
  agentDeletion: string;
  agentInvitation: string;
  newRequest: string;

  prjct_profile_type: string;
  subscription_is_active: any;
  prjct_profile_name: string;
  subscription_end_date: Date;
  browserLang: string;

  subscription: Subscription;

  projectId: string;
  constructor(
    slideshowModule: SlideshowModule,
    private router: Router,
    public auth: AuthService,
    private prjctPlanService: ProjectPlanService,
    private notify: NotifyService,
    private translate: TranslateService
  ) {
    super();
  }

  ngOnInit() {
    this.getCurrentProject();
    this.getProjectPlan();
  }

  getBrowserLang() {
    this.browserLang = this.translate.getBrowserLang();
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      console.log('!!! ANALYTICS STATIC - project ', project)

      if (project) {
        this.projectId = project._id
      }
    });
  }

  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      console.log('ProjectPlanService (DepartmentsStaticComponent) project Profile Data', projectProfileData)
      if (projectProfileData) {
        this.prjct_profile_type = projectProfileData.profile_type;
        this.subscription_is_active = projectProfileData.subscription_is_active;
        this.subscription_end_date = projectProfileData.subscription_end_date
        this.prjct_profile_name = this.buildPlanName(projectProfileData.profile_name, this.browserLang, this.prjct_profile_type);
        if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
          this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date)
        }
      }
    })
  }

  goToPricing() {
    console.log('goToPricing projectId ', this.projectId);
    if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
      this.notify._displayContactUsModal(true, 'upgrade_plan');
    } else {
      this.router.navigate(['project/' + this.projectId + '/pricing']);
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
