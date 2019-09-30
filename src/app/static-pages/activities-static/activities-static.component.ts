import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { IMyDpOptions, IMyDateModel } from 'mydatepicker';
import { NotifyService } from '../../core/notify.service';
import { ProjectPlanService } from '../../services/project-plan.service';
import { StaticPageBaseComponent } from './../static-page-base/static-page-base.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'appdashboard-activities-static',
  templateUrl: './activities-static.component.html',
  styleUrls: ['./activities-static.component.scss']
})
export class ActivitiesStaticComponent extends StaticPageBaseComponent implements OnInit, OnDestroy {
  activities: any;
  agentAvailabilityOrRoleChange: string;
  agentDeletion: string;
  agentInvitation: string;
  newRequest: string;
  projectId: string;
  prjct_profile_type: string;
  subscription_is_active: any;
  prjct_profile_name: string;
  subscription_end_date: Date;
  browserLang: string;

  subscription: Subscription;

  public myDatePickerOptions: IMyDpOptions = {
    // other options...
    dateFormat: 'dd/mm/yyyy',
    // dateFormat: 'yyyy, mm , dd',
  };

  constructor(
    private translate: TranslateService,
    public auth: AuthService,
    private router: Router,
    private prjctPlanService: ProjectPlanService,
    private notify: NotifyService
  ) {
    super();
  }

  ngOnInit() {
    this.buildActivitiesOptions();
    this.getCurrentProject();
    this.getBrowserLang();
    this.getProjectPlan();
  }
  getBrowserLang() {
    this.browserLang = this.translate.getBrowserLang();
  }

  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      console.log('ProjectPlanService (ActivitiesStaticComponent) project Profile Data', projectProfileData)
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


  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      console.log('!!! ACTIVITIES STATIC - project ', project)

      if (project) {
        this.projectId = project._id
      }
    });
  }

  // buildActivitiesOptions() {
  //   const browserLang = this.translate.getBrowserLang();
  //   if (browserLang) {
  //     if (browserLang === 'it') {
  //       this.activities = [
  //         { name: 'Modifica disponibilità o ruolo agente' },
  //         { name: 'Cancellazione agente' },
  //         { name: 'Invito agente' },
  //       ];
  //     } else {
  //       this.activities = [
  //         { name: 'Change agent availability or role' },
  //         { name: 'Agent deletion' },
  //         { name: 'Agent invitation' },
  //       ];
  //     }
  //   }
  // }

  buildActivitiesOptions() {
    this.translate.get('ActivitiesOptions')
      .subscribe((text: any) => {

        this.agentAvailabilityOrRoleChange = text.AgentAvailabilityOrRoleChange;
        this.agentDeletion = text.AgentDeletion;
        this.agentInvitation = text.AgentInvitation;
        this.newRequest = text.NewRequest;

        console.log('translateActivities AgentAvailabilityOrRoleChange ', text.AgentAvailabilityOrRoleChange)
        console.log('translateActivities AgentDeletion ', text.AgentDeletion)
        console.log('translateActivities AgentDeletion ', text.AgentInvitation)
        console.log('translateActivities newRequest ', text.newRequest)
      }, (error) => {
        console.log('ActivitiesComponent - GET translations error', error);
      }, () => {
        console.log('ActivitiesComponent - GET translations * COMPLETE *');

        this.activities = [
          { id: 'PROJECT_USER_UPDATE', name: this.agentAvailabilityOrRoleChange },
          { id: 'PROJECT_USER_DELETE', name: this.agentDeletion },
          { id: 'PROJECT_USER_INVITE', name: this.agentInvitation },
          { id: 'REQUEST_CREATE', name: this.newRequest },
        ];
      });
  }


  goToPricing() {
    if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
      this.notify._displayContactUsModal(true, 'upgrade_plan');
    } else {
      this.router.navigate(['project/' + this.projectId + '/pricing']);
    }
  }

}
