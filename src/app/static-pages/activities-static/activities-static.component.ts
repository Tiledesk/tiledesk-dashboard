import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
@Component({
  selector: 'appdashboard-activities-static',
  templateUrl: './activities-static.component.html',
  styleUrls: ['./activities-static.component.scss']
})
export class ActivitiesStaticComponent implements OnInit {
  activities: any;
  agentAvailabilityOrRoleChange: string;
  agentDeletion: string;
  agentInvitation: string;
  projectId: string;
  
  constructor(
    private translate: TranslateService,
    public auth: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.buildActivitiesOptions();
    this.getCurrentProject();
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      console.log('!!! ANALYTICS STATIC - project ', project)

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

        console.log('translateActivities AgentAvailabilityOrRoleChange ', text.AgentAvailabilityOrRoleChange)
        console.log('translateActivities AgentDeletion ', text.AgentDeletion)
        console.log('translateActivities AgentDeletion ', text.AgentInvitation)
      }, (error) => {
        console.log('ActivitiesComponent - GET translations error', error);
      }, () => {
        console.log('ActivitiesComponent - GET translations * COMPLETE *');

        this.activities = [
          { id: 'PROJECT_USER_UPDATE', name: this.agentAvailabilityOrRoleChange },
          { id: 'PROJECT_USER_DELETE', name: this.agentDeletion },
          { id: 'PROJECT_USER_INVITE', name: this.agentInvitation },
        ];
      });
  }


  goToPricing() {
    this.router.navigate(['project/' + this.projectId + '/pricing']);
  }

}
