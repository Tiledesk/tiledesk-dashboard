import { Component, OnInit } from '@angular/core';
import { Project } from 'app/models/project-model';
import { BrandService } from 'app/services/brand.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { ProjectService } from 'app/services/project.service';
import { LocalDbService } from 'app/services/users-local-db.service';

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
  public  selectedProject: any;
  public selectedTemplates: any;
  public templateImg: string;
  public templateNameOnSite: string;
  public projects: Project[];
  constructor(
    public brandService: BrandService,
    private projectService: ProjectService,
    private logger: LoggerService,
    private faqKbService: FaqKbService,
    private localDbService: LocalDbService
  ) {
    const brand = brandService.getBrand();
    this.companyLogoBlack_Url = brand['company_logo_black__url'];
    this.tparams = brand;
    this.company_name = brand['company_name'];
    this.company_site_url = brand['company_site_url'];

  }

  ngOnInit(): void {
    this.getProjects();
    this.getTemplates()
  }

  getTemplates() {
    const storedRoute = this.localDbService.getFromStorage('wannago')
    console.log('[GET START CHATBOT FORK] storedRoute ', storedRoute)
    let botId = ''
    if (storedRoute) {
      storedRoute.split('/')
      const storedRouteSegment = storedRoute.split('/')
      console.log('[GET START CHATBOT FORK] storedRouteSegment ', storedRouteSegment)
      botId = storedRouteSegment[2]
    }

    this.faqKbService.getTemplates().subscribe((res: any) => {
      console.log('[GET START CHATBOT FORK] GET TEMPLATES - RES ', res)
      if (res) {
        const templates = res

      const selectedTemplates = templates.filter((obj) => {
          return obj._id === botId
        });
        this.selectedTemplates = selectedTemplates[0]
        console.log('[GET START CHATBOT FORK] GET TEMPLATES - SELECTED TEMPALTES ', this.selectedTemplates)


        this.templateImg =  this.selectedTemplates['bigImage'];
        this.templateNameOnSite  =  this.selectedTemplates['nameOnSite'];
        console.log('[GET START CHATBOT FORK] GET TEMPLATES - SELECTED TEMPALTES templateImg ', this.templateImg)
        console.log('[GET START CHATBOT FORK] GET TEMPLATES - SELECTED TEMPALTES templateNameOnSite ', this.templateNameOnSite)
      }

    }, (error) => {
      this.logger.error('[GET START CHATBOT FORK] GET TEMPLATES ERROR ', error);

    }, () => {
      this.logger.log('[GET START CHATBOT FORK] GET TEMPLATES COMPLETE');

    });
  }


  getProjects() {
    this.projectService.getProjects().subscribe((projects: any) => {
      console.log('[GET START CHATBOT FORK] - GET PROJECTS ', projects);



      if (projects) {
        this.projects = projects;
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

  onSelectProject(selectedproject) {
    console.log('[GET START CHATBOT FORK] - ON SELECTED PROJECT - selectedproject ', selectedproject)
  }

  continueToNextStep() {
    console.log('[GET START CHATBOT FORK] - CONTINUE TO NEXT STEP CLICKED  ')
  }

}
