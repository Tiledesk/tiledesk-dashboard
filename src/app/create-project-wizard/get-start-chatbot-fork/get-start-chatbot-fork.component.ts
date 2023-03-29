import { Component, isDevMode, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { Project } from 'app/models/project-model';
import { BrandService } from 'app/services/brand.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { ProjectService } from 'app/services/project.service';
import { LocalDbService } from 'app/services/users-local-db.service';
import { CreateProjectComponent } from '../create-project/create-project.component';



@Component({
  selector: 'appdashboard-get-start-chatbot-fork',
  templateUrl: './get-start-chatbot-fork.component.html',
  styleUrls: ['./get-start-chatbot-fork.component.scss']
})
export class GetStartChatbotForkComponent implements OnInit {
  public companyLogoBlack_Url: string;
  public tparams: any;
  public company_name: any;
  public company_site_url: any;
  public selectedProject: any;
  public selectedTemplates: any;
  public templateImg: string;
  public templateNameOnSite: string;
  public projects: Project[];
  public botid: string;
  public selectedProjectId: string;
  public projectname: string;
  public user: any;
  public projectId: any;
  constructor(
    public brandService: BrandService,
    private projectService: ProjectService,
    private logger: LoggerService,
    private faqKbService: FaqKbService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,


  ) {
    const brand = brandService.getBrand();
    this.companyLogoBlack_Url = brand['company_logo_black__url'];
    this.tparams = brand;
    this.company_name = brand['company_name'];
    this.company_site_url = brand['company_site_url'];
  }

  ngOnInit(): void {
    this.getProjects();
    this.getTemplates();
    // this.getTemplateNameOnSite();
    this.getLoggedUser();
    // this.getCurrentProject();
  }

  getLoggedUser() {
    this.auth.user_bs
      .subscribe((user) => {
        if (user) {
          this.user = user;
          // this.logger.log('[GET START CHATBOT FORK]  - user ', this.user)
        }
      });
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.projectId = project._id
        // this.logger.log('[GET START CHATBOT FORK]  - projectId ', this.projectId)
      }
    });
  }

  getTemplateNameOnSite() {
    this.route.queryParams
      .subscribe(params => {
        // this.logger.log('[GET START CHATBOT FORK] GET QUERY PARAMS - params ', params);
        this.templateNameOnSite = params.tn
        // this.logger.log('[GET START CHATBOT FORK] GET QUERY PARAMS - templateNameOnSite ', this.templateNameOnSite);
      });

  }

  getTemplates() {
    // const storedRoute = this.localDbService.getFromStorage('wannago')
    // this.logger.log('[GET START CHATBOT FORK] storedRoute ', storedRoute)

    const storedRoute = decodeURIComponent(this.router.url);
    // console.log('[GET START CHATBOT FORK] _storedRoute ', storedRoute)
    if (storedRoute) {
      // storedRoute.split('/')
      let storedRouteSegments = storedRoute.split('/')

      // this.logger.log('[GET START CHATBOT FORK] storedRouteSegment ', storedRouteSegments)
      let secondStoredRouteSegment = storedRouteSegments[2]

      // this.logger.log('[GET START CHATBOT FORK] secondStoredRouteSegment ', secondStoredRouteSegment)
      // && (!storedRouteSegments.includes("?tn=")) && (!storedRouteSegments.includes("%253Ftn%253D"))
      if (secondStoredRouteSegment.includes("?")) {

        const secondStoredRouteSegments = storedRouteSegments[2].split('?tn=')

        // console.log('[GET START CHATBOT FORK] secondStoredRouteSegments ', secondStoredRouteSegments)
        this.botid = secondStoredRouteSegments[0]
        const _templateNameOnSite = secondStoredRouteSegments[1];
        try {
          this.templateNameOnSite = decodeURI(_templateNameOnSite)
        } catch (e) { // catches a malformed URI
          this.logger.error(e);
        }
      }

      if (!isDevMode()) {
        if (window['analytics']) {
          try {
            window['analytics'].page("Wizard, Get start chatbot fork", {
              template: this.templateNameOnSite
            });
          } catch (err) {
            this.logger.error('Get start chatbot page error', err);
          }
        }
      }
    }

    //   this.faqKbService.getTemplates().subscribe((res: any) => {
    //     // this.logger.log('[GET START CHATBOT FORK] GET TEMPLATES - RES ', res)
    //     if (res) {
    //       const templates = res

    //       const selectedTemplates = templates.filter((obj) => {
    //         return obj._id === this.botid
    //       });
    //       this.selectedTemplates = selectedTemplates[0]
    //       // this.logger.log('[GET START CHATBOT FORK] GET TEMPLATES - SELECTED TEMPALTES ', this.selectedTemplates)

    //       this.templateImg = this.selectedTemplates['bigImage'];
    //       // this.templateNameOnSite = this.selectedTemplates['nameOnSite'];
    //       // this.logger.log('[GET START CHATBOT FORK] GET TEMPLATES - SELECTED TEMPALTES templateImg ', this.templateImg)

    //     }

    //   }, (error) => {
    //     this.logger.error('[GET START CHATBOT FORK] GET TEMPLATES ERROR ', error);

    //   }, () => {
    //     this.logger.log('[GET START CHATBOT FORK] GET TEMPLATES COMPLETE');

    //   });
    // }

    this.faqKbService.getChatbotTemplateById(this.botid).subscribe((res: any) => {
      // console.log('[GET START CHATBOT FORK] GET-CHATBOT-TEMPLATE-BY-ID - RES ', res)
      if (res) {
        this.selectedTemplates = res

        // const selectedTemplates = templates.filter((obj) => {
        //   return obj._id === this.botid
        // });
        // this.selectedTemplates = selectedTemplates[0]
        // this.logger.log('[GET START CHATBOT FORK] GET TEMPLATES - SELECTED TEMPALTES ', this.selectedTemplates)
        if (this.selectedTemplates && this.selectedTemplates['bigImage']) {
          this.templateImg = this.selectedTemplates['bigImage'];
        }
        // this.templateNameOnSite = this.selectedTemplates['nameOnSite'];
        // this.logger.log('[GET START CHATBOT FORK] GET TEMPLATES - SELECTED TEMPALTES templateImg ', this.templateImg)

      }

    }, (error) => {
      this.logger.error('[GET START CHATBOT FORK] GET-CHATBOT-TEMPLATE-BY-ID ', error);

    }, () => {
      this.logger.log('[GET START CHATBOT FORK] GET-CHATBOT-TEMPLATE-BY-ID');

    });
  }

  getProjects() {
    this.projectService.getProjects().subscribe((projects: any) => {
      // this.logger.log('[GET START CHATBOT FORK] - GET PROJECTS ', projects);
      if (projects) {
        this.projects = projects;
        if (this.projects && this.projects.length === 1) {
          this.projectname = this.projects[0].id_project.name
          this.selectedProjectId = this.projects[0].id_project._id
        }
        // SET THE IDs and the NAMES OF THE PROJECT IN THE LOCAL STORAGE.
        // WHEN IS REFRESHED A PAGE THE AUTSERVICE USE THE NAVIGATION PROJECT ID TO GET FROM STORAGE THE NAME OF THE PROJECT
        // AND THEN PUBLISH PROJECT ID AND PROJECT NAME


        // if (project.id_project) {
        //   const prjct: Project = {
        //     _id: project.id_project._id,
        //     name: project.id_project.name,
        //     role: project.role,
        //     profile_name: project.id_project.profile.name,
        //     trial_expired: project.id_project.trialExpired,
        //     trial_days_left: project.id_project.trialDaysLeft,
        //     profile_type: project.id_project.profile.type,
        //     subscription_is_active: project.id_project.isActiveSubscription,
        //     operatingHours: project.id_project.activeOperatingHours
        //   }

        // this.subsTo_WsCurrentUser( project.id_project._id)
        // this.getProjectUsersIdByCurrentUserId(project.id_project._id)

        /**
         * project.id_project._id is the id of the project
         * project._id is the id of the project user
         */
        //   if (project.id_project.status !== 0) {
        //     this.usersService.subscriptionToWsCurrentUser_allProject(project.id_project._id, project._id);
        //   }
        //   this.listenTocurrentUserWSAvailabilityAndBusyStatusForProject$()


        //   /***  ADDED TO KNOW IF THE CURRENT USER IS AVAILABLE IN SOME PROJECT
        //    *    ID USED TO DISPLAY OR NOT THE MSG 'Attention, if you don't want to receive requests...' IN THE LOGOUT MODAL  ***/
        //   if (project.user_available === true) {
        //     countOfcurrentUserAvailabilityInProjects = countOfcurrentUserAvailabilityInProjects + 1;
        //   }

        //   localStorage.setItem(project.id_project._id, JSON.stringify(prjct));
      }

      // this.logger.log('[PROJECTS] - GET PROJECTS AFTER', projects);
      // this.myAvailabilityCount = countOfcurrentUserAvailabilityInProjects;
      // this.projectService.countOfMyAvailability(this.myAvailabilityCount);
      // this.logger.log('[PROJECTS] - GET PROJECTS - I AM AVAILABLE IN # ', this.myAvailabilityCount, 'PROJECTS');

    }, error => {

      this.logger.error('[GET START CHATBOT FORK] - GET PROJECTS - ERROR ', error)
    }, () => {
      this.logger.log('[GET START CHATBOT FORK] - GET PROJECTS * COMPLETE *')
    });
  }

  onSelectProject(selectedprojectid) {
    this.logger.log('[GET START CHATBOT FORK] - ON SELECTED PROJECT - selectedprojectid ', selectedprojectid)
    this.selectedProjectId = selectedprojectid
  }

  goToInstallTemplate() {
    this.logger.log('[GET START CHATBOT FORK] goToInstallTemplate botid', this.botid, ' - selectedProjectId ', this.selectedProjectId)
    this.router.navigate([`install-template/${this.botid}/${this.selectedProjectId}`]);
  }

  goToYourProject() {
    this.router.navigate(['/projects']);
  }

  goToCreateProject() {
    this.logger.log('[GET START CHATBOT FORK] goToCreateProject (create-project-itw)  botid', this.botid)
    this.router.navigate([`/create-project-itw/${this.botid}`]);
  }


}
