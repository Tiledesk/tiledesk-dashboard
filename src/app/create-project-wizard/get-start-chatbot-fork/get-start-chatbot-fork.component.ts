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
import { APP_SUMO_PLAN_NAME, goToCDSVersion, PLAN_NAME } from 'app/utils/util';
import { FaqKb } from 'app/models/faq_kb-model';
import { AppConfigService } from 'app/services/app-config.service';
import { BotLocalDbService } from 'app/services/bot-local-db.service';



@Component({
  selector: 'appdashboard-get-start-chatbot-fork',
  templateUrl: './get-start-chatbot-fork.component.html',
  styleUrls: ['./get-start-chatbot-fork.component.scss']
})
export class GetStartChatbotForkComponent implements OnInit {
  APP_SUMO_PLAN_NAME = APP_SUMO_PLAN_NAME
  PLAN_NAME = PLAN_NAME
  public companyLogoBlack_Url: string;
  public tparams: any;
  public company_name: any;
  public company_site_url: any;
  public selectedProject: any;
  public selectedTemplate: any;
  public templateImg: string;
  public templateNameOnSite: string;
  public projects: Project[];
  public botid: string;
  public selectedProjectId: string;
  public projectname: string;
  public user: any;
  public projectId: string;
  public project: Project;
  public projectName: string;
  public projectPlan: string;
  public prjct_profile_name: string;
  public appSumoProfile: string;
  public botname: string;

  constructor(
    public brandService: BrandService,
    private projectService: ProjectService,
    private logger: LoggerService,
    private faqKbService: FaqKbService,
    private auth: AuthService,
    private router: Router,
    public appConfigService: AppConfigService,
    private botLocalDbService: BotLocalDbService,
  ) {
    const brand = brandService.getBrand();
    this.companyLogoBlack_Url = brand['company_logo_black__url'];
    this.tparams = brand;
    this.company_name = brand['company_name'];
    this.company_site_url = brand['company_site_url'];
  }

  ngOnInit(): void {
    this.getProjects();
    this.getTemplate();
    // this.getTemplateNameOnSite();
    this.getLoggedUser();
    // this.getCurrentProject();
  }

  getLoggedUser() {
    console.log('[GET START CHATBOT FORK] getLoggedUser called') 
    this.auth.user_bs
      .subscribe((user) => {
        if (user) {
          this.user = user;
          console.log('[GET START CHATBOT FORK]  - user ', this.user)
        }
      });
  }

  // getCurrentProject() {
  //   this.auth.project_bs.subscribe((project) => {
  //     if (project) {
  //       this.projectId = project._id
  //       // this.logger.log('[GET START CHATBOT FORK]  - projectId ', this.projectId)
  //     }
  //   });
  // }

  // getTemplateNameOnSite() {
  //   this.route.queryParams
  //     .subscribe(params => {
  //       // this.logger.log('[GET START CHATBOT FORK] GET QUERY PARAMS - params ', params);
  //       this.templateNameOnSite = params.tn
  //       // this.logger.log('[GET START CHATBOT FORK] GET QUERY PARAMS - templateNameOnSite ', this.templateNameOnSite);
  //     });
  // }

  getTemplate() {
    // const storedRoute = this.localDbService.getFromStorage('wannago')
    // console.log('[GET START CHATBOT FORK] storedRoute ', storedRoute)

    const storedRoute = decodeURIComponent(this.router.url);
    console.log('[GET START CHATBOT FORK] _storedRoute ', storedRoute)
    if (storedRoute) {
      // storedRoute.split('/')
      let storedRouteSegments = storedRoute.split('/')

      console.log('[GET START CHATBOT FORK] storedRouteSegment ', storedRouteSegments)
      let secondStoredRouteSegment = storedRouteSegments[2]

      // this.logger.log('[GET START CHATBOT FORK] secondStoredRouteSegment ', secondStoredRouteSegment)
      // && (!storedRouteSegments.includes("?tn=")) && (!storedRouteSegments.includes("%253Ftn%253D"))
      if (secondStoredRouteSegment.includes("?")) {

        const secondStoredRouteSegments = storedRouteSegments[2].split('?tn=')

        // console.log('[GET START CHATBOT FORK] secondStoredRouteSegments ', secondStoredRouteSegments)
        this.botid = secondStoredRouteSegments[0]
        console.log('[GET START CHATBOT FORK] botid ', this.botid)
        const _templateNameOnSite = secondStoredRouteSegments[1];
        try {
          this.templateNameOnSite = decodeURI(_templateNameOnSite)
        } catch (e) { // catches a malformed URI
          this.logger.error(e);
        }
        this.trackPage(this.templateNameOnSite)
      }
    }

    this.faqKbService.getChatbotTemplateById(this.botid).subscribe((res: any) => {
      // console.log('[GET START CHATBOT FORK] GET-CHATBOT-TEMPLATE-BY-ID - RES ', res)
      if (res) {
        this.selectedTemplate = res
        console.log('[GET START CHATBOT FORK] GET-CHATBOT-TEMPLATE-BY-ID - selectedTemplate ', this.selectedTemplate)
        this.botname = res['name']

        if (this.selectedTemplate && this.selectedTemplate['bigImage']) {
          this.templateImg = this.selectedTemplate['bigImage'];
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

  getProjects(projectid?: string) {
    this.projectService.getProjects().subscribe((projects: any) => {
      console.log('[GET START CHATBOT FORK] - GET PROJECTS ', projects);
      if (projects) {
        this.projects = projects;
        if (this.projects && this.projects.length === 1) {
          console.log('[GET START CHATBOT FORK] USE-CASE PROJECTS NO = 1')
          this.projectName = this.projects[0].id_project.name
          this.selectedProjectId = this.projects[0].id_project._id
          console.log('[GET START CHATBOT FORK] this.project ', this.selectedProjectId)
          this.project = this.projects[0].id_project;
          console.log('[GET START CHATBOT FORK] this.project ', this.project)
          this.buildPlanName(this.project)
          this.trackGroup(this.selectedProjectId)
        }
        if (projectid) {
          console.log('[GET START CHATBOT FORK] USE-CASE PROJECTS NO > 1' , projectid)
          if (this.projects && this.projects.length > 1) {
            console.log('[GET START CHATBOT FORK] USE-CASE PROJECTS NO > 1')
            projects.forEach(project => {
              if (project.id_project.id === projectid) {
                this.project = project.id_project
                console.log('[GET START CHATBOT FORK] this.project ', this.project)
                this.projectPlan = project.id_project.profile.name
                this.projectName = project.id_project.name;
                this.selectedProjectId = projectid

                const selectedProject: Project = {
                  _id: this.project['_id'],
                  name: this.project['name'],
                  operatingHours: this.project['activeOperatingHours'],
                  profile_type: this.project['profile'].type,
                  profile_name: this.project['profile'].name,
                  trial_expired: this.project['trialExpired']
                }
                this.auth.projectSelected(selectedProject)

                this.buildPlanName(this.project)
                this.trackGroup(this.selectedProjectId)
              }
            })
          }
        }

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
    this.getProjects(this.selectedProjectId)
  }

  goToInstallTemplate() {
    this.logger.log('[GET START CHATBOT FORK] goToInstallTemplate botid', this.botid, ' - selectedProjectId ', this.selectedProjectId)
    // this.router.navigate([`install-template/${this.botid}/${this.selectedProjectId}`]);
    this.forkTemplate()
  }

  goToYourProject() {
    this.router.navigate(['/projects']);
  }

  goToCreateProject() {
    this.logger.log('[GET START CHATBOT FORK] goToCreateProject (create-project-itw)  botid', this.botid)
    this.router.navigate([`/create-project-itw/${this.botid}`]);
  }


  forkTemplate() {
    console.log('[GET START CHATBOT FORK] selectedTemplate ',this.selectedTemplate._id)
    console.log('[GET START CHATBOT FORK] selectedProjectId ',this.selectedProjectId)
    this.faqKbService.installTemplate(this.selectedTemplate._id, this.selectedProjectId, true, this.selectedTemplate._id).subscribe((res: any) => {
      console.log('[GET START CHATBOT FORK] - FORK TEMPLATE RES', res);
      this.botid = res.bot_id

    }, (error) => {
      this.logger.error('[GET START CHATBOT FORK] FORK TEMPLATE - ERROR ', error);

    }, () => {
      this.logger.log('[GET START CHATBOT FORK] FORK TEMPLATE COMPLETE');


      this.getFaqKbById(this.botid);
      this.trackEvent()

     

    });
  }

  getFaqKbById(botid) {
    this.faqKbService.getFaqKbByIdAndProjectId(this.selectedProjectId , botid).subscribe((faqkb: any) => {
      console.log('[GET START CHATBOT FORK] GET FAQ-KB (DETAILS) BY ID  ', faqkb);

      this.botLocalDbService.saveBotsInStorage(botid, faqkb);
      this.goToBotDetails(faqkb)
    }, (error) => {
      this.logger.error('[GET START CHATBOT FORK] GET FAQ-KB BY ID  - ERROR ', error);
    }, () => {
      this.logger.log('[GET START CHATBOT FORK] GET FAQ-KB ID  - COMPLETE ');
    });
  }


  goToBotDetails(faqkb: FaqKb) {
    this.logger.log('[GET START CHATBOT FORK] GO TO  BOT DETAILS - isDevMode() ', isDevMode());
    // this.router.navigate(['project/' + this.project._id + '/cds/', this.botid, 'intent', '0']);
    goToCDSVersion(this.router, faqkb, this.project._id, this.appConfigService.getConfig().cdsBaseUrl)
  }


  trackPage(templateNameOnSite) {
    if (!isDevMode()) {
      if (window['analytics']) {
        try {
          window['analytics'].page("Wizard, Get start chatbot fork", {
            template: templateNameOnSite
          });
        } catch (err) {
          this.logger.error('Wizard Get start chatbot fork page error', err);
        }
        if (!this.user) {
            console.log('[GET START CHATBOT FORK] this.user',  this.user)
            this.user = localStorage.getItem('user');
            console.log('[GET START CHATBOT FORK] stored user',  this.user)
        }

        let userFullname = ''
        if (this.user.firstname && this.user.lastname) {
          userFullname = this.user.firstname + ' ' + this.user.lastname
        } else if (this.user.firstname && !this.user.lastname) {
          userFullname = this.user.firstname
        }

        try {
          window['analytics'].identify(this.user._id, {
            name: userFullname,
            email: this.user.email,
            logins: 5,

          });
        } catch (err) {
          this.logger.error('Wizard Get start chatbot fork identify error', err);
        }

        try {
          window['analytics'].group(this.projectId, {
            name: this.projectName,
            plan: this.prjct_profile_name,
          });
        } catch (err) {
          this.logger.error('Group Install template group error', err);
        }

      }
    }
  }


  trackGroup(selectedProjectId) {
    if (!isDevMode()) {
      try {
        window['analytics'].group(selectedProjectId, {
          name: this.projectName,
          plan: this.prjct_profile_name,
        });
      } catch (err) {
        this.logger.error('Group Install template group error', err);
      }
    }
  }

  trackEvent() {
    if (!isDevMode()) {
      if (window['analytics']) {

        let userFullname = ''
        if (this.user.firstname && this.user.lastname) {
          userFullname = this.user.firstname + ' ' + this.user.lastname
        } else if (this.user.firstname && !this.user.lastname) {
          userFullname = this.user.firstname
        }

        try {
          window['analytics'].track('Create chatbot', {
            "username": userFullname,
            "email": this.user.email,
            "userId": this.user._id,
            "chatbotName": this.botname,
            'chatbotId': this.botid,
            'page': 'Wizard, Get start chatbot fork',
            'button': 'Import Template',
          });
        } catch (err) {
          this.logger.error('track Use template (install template) event error', err);
        }

        try {
          window['analytics'].identify(this.user._id, {
            name: userFullname,
            email: this.user.email,
            logins: 5,

          });
        } catch (err) {
          this.logger.error('Identify Use template (install template) event error', err);
        }

        try {
          window['analytics'].group(this.projectId, {
            name: this.projectName,
            plan: this.prjct_profile_name,
          });
        } catch (err) {
          this.logger.error('Group tUse template (install template) error', err);
        }

      }
    }
  }

  buildPlanName(project) {
    if (project.profile.extra3) {
      this.appSumoProfile = APP_SUMO_PLAN_NAME[project.profile.extra3]
      console.log('[GET START CHATBOT FORK] Find Current Project appSumoProfile ', this.appSumoProfile)
    }

    if (project.profile.type === 'free') {
      if (project.trial_expired === false) {
        this.prjct_profile_name = PLAN_NAME.B + " plan (trial)"


      } else {
        this.prjct_profile_name = "Free plan";

      }
    } else if (project.profile.type === 'payment') {

      if (project.profile.name === PLAN_NAME.A) {
        if (!this.appSumoProfile) {
          this.prjct_profile_name = PLAN_NAME.A + " plan";

        } else {
          this.prjct_profile_name = PLAN_NAME.A + " plan " + '(' + this.appSumoProfile + ')';

        }
      } else if (project.profile.name === PLAN_NAME.B) {
        if (!this.appSumoProfile) {
          this.prjct_profile_name = PLAN_NAME.B + " plan";

        } else {
          this.prjct_profile_name = PLAN_NAME.B + " plan " + '(' + this.appSumoProfile + ')';;

        }
      } else if (project.profile.name === PLAN_NAME.C) {
        this.prjct_profile_name = PLAN_NAME.C + " plan";
      }
    }
  }
}
