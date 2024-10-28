import { Component, isDevMode, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { Project } from 'app/models/project-model';
import { BrandService } from 'app/services/brand.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { ProjectService } from 'app/services/project.service';
import { APP_SUMO_PLAN_NAME, CHATBOT_MAX_NUM, goToCDSVersion, PLAN_NAME, URL_understanding_default_roles } from 'app/utils/util';
import { FaqKb } from 'app/models/faq_kb-model';
import { AppConfigService } from 'app/services/app-config.service';
import { BotLocalDbService } from 'app/services/bot-local-db.service';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { NotifyService } from 'app/core/notify.service';
import { UsersService } from 'app/services/users.service';
import { ChatbotModalComponent } from 'app/bots/bots-list/chatbot-modal/chatbot-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from 'app/services/cache.service';
const swal = require('sweetalert');

@Component({
  selector: 'appdashboard-get-start-chatbot-fork',
  templateUrl: './get-start-chatbot-fork.component.html',
  styleUrls: ['./get-start-chatbot-fork.component.scss']
})
export class GetStartChatbotForkComponent implements OnInit {
  APP_SUMO_PLAN_NAME = APP_SUMO_PLAN_NAME
  PLAN_NAME = PLAN_NAME
  public companyLogo: string;
  CHATBOT_MAX_NUM = CHATBOT_MAX_NUM;
  public companyLogoBlack_Url: string;
  public tparams: any;
  public company_name: any;
  public company_site_url: any;

  // public company_name: any;
  // public company_site_url: any;
  public selectedProject: any;
  public selectedTemplate: any;
  public templateImg: string;
  public templateNameOnSite: string;
  public projects: Project[];
  public activeProjects: Project[];
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
  public chatBotCount: number;
  public chatBotLimit: any;
  public USER_ROLE: string;
  public getChatBotCompleted: boolean = false
  public URL_UNDERSTANDING_DEFAULT_ROLES = URL_understanding_default_roles
  learnMoreAboutDefaultRoles: string;
  agentsCannotManageChatbots: string;
  public hideHelpLink: boolean;
  constructor(
    public brandService: BrandService,
    private projectService: ProjectService,
    private logger: LoggerService,
    private faqKbService: FaqKbService,
    private auth: AuthService,
    private router: Router,
    public appConfigService: AppConfigService,
    private botLocalDbService: BotLocalDbService,
    public usersService: UsersService,
    public prjctPlanService: ProjectPlanService,
    public notify: NotifyService,
    public dialog: MatDialog,
    private translate: TranslateService,
    private cacheService: CacheService
  ) {
    const brand = brandService.getBrand();
    this.companyLogo = brand['BASE_LOGO'];
    this.hideHelpLink = brand['DOCS'];
    // this.company_name = brand['BRAND_NAME'];
    // this.company_site_url = brand['COMPANY_SITE_URL'];
  }

  ngOnInit(): void {
    this.getProjects();
    this.getTemplate();
    // this.getTemplateNameOnSite();
    this.getLoggedUser();
    // this.getCurrentProject();
    this.getUserRole();
    this.traslateString()
    this.clearCache()
  }

  clearCache() {
    this.cacheService.clearCache()
  }

  getLoggedUser() {
    this.logger.log('[GET START CHATBOT FORK] getLoggedUser called')
    this.auth.user_bs
      .subscribe((user) => {
        if (user) {
          this.user = user;
          // this.logger.log('[GET START CHATBOT FORK]  - user ', this.user)
        }
      });
  }

  getUserRole() {
    this.usersService.project_user_role_bs
      .subscribe((userRole) => {

        this.logger.log('[GET START CHATBOT FORK] - SUBSCRIPTION TO USER ROLE »»» ', userRole)
        this.USER_ROLE = userRole;
      })
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
    // this.logger.log('[GET START CHATBOT FORK] storedRoute ', storedRoute)

  const storedRoute = decodeURIComponent(this.router.url);
   this.logger.log('[GET START CHATBOT FORK] _storedRoute ', storedRoute)
    if (storedRoute) {
      // storedRoute.split('/')
      let storedRouteSegments = storedRoute.split('/')

      this.logger.log('[GET START CHATBOT FORK] storedRouteSegment ', storedRouteSegments)
      let secondStoredRouteSegment = storedRouteSegments[2]

      // this.logger.log('[GET START CHATBOT FORK] secondStoredRouteSegment ', secondStoredRouteSegment)
      // && (!storedRouteSegments.includes("?tn=")) && (!storedRouteSegments.includes("%253Ftn%253D"))
      if (secondStoredRouteSegment.includes("?")) {

        const secondStoredRouteSegments = storedRouteSegments[2].split('?tn=')

        // this.logger.log('[GET START CHATBOT FORK] secondStoredRouteSegments ', secondStoredRouteSegments)
        this.botid = secondStoredRouteSegments[0]
        this.logger.log('[GET START CHATBOT FORK] botid ', this.botid)
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
     this.logger.log('[GET START CHATBOT FORK] GET-CHATBOT-TEMPLATE-BY-ID - RES ', res)
      if (res) {
        this.selectedTemplate = res
        // this.logger.log('[GET START CHATBOT FORK] GET-CHATBOT-TEMPLATE-BY-ID - selectedTemplate ', this.selectedTemplate)
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
      this.logger.log('[GET START CHATBOT FORK] - GET PROJECTS ', projects);
      if (projects) {
        this.projects = projects;

        this.activeProjects = this.projects.filter((project) => {
          return project.id_project.status === 100
        });

        if (this.activeProjects && this.activeProjects.length === 1) {
          this.logger.log('[GET START CHATBOT FORK] USE-CASE PROJECTS NO = 1')
          this.projectName = this.activeProjects[0].id_project.name
          this.selectedProjectId = this.activeProjects[0].id_project._id
          this.logger.log('[GET START CHATBOT FORK] this.project ', this.selectedProjectId)
          this.project = this.activeProjects[0].id_project;
          // this.logger.log('[GET START CHATBOT FORK] this.project ', this.project)
          this.getProjectBotsByPassingProjectId(this.selectedProjectId);
          this.getProjectPlan(this.project)
          this.trackGroup(this.selectedProjectId)
        }
        if (projectid) {

          if (this.activeProjects && this.activeProjects.length > 1) {
            this.logger.log('[GET START CHATBOT FORK] USE-CASE PROJECTS NO > 1')
            this.activeProjects.forEach(project => {
              if (project.id_project.id === projectid) {
                this.project = project.id_project
                this.logger.log('[GET START CHATBOT FORK] this.project ', this.project)
                this.projectPlan = project.id_project.profile.name
                this.projectName = project.id_project.name;
                this.selectedProjectId = projectid


                const _project = this.project
                _project['role'] = project['role']
                // const selectedProject: Project = {
                //   _id: this.project['_id'],
                //   name: this.project['name'],
                //   operatingHours: this.project['activeOperatingHours'],
                //   profile_type: this.project['profile'].type,
                //   profile_name: this.project['profile'].name,
                //   trial_expired: this.project['trialExpired']
                // }
                this.auth.projectSelected(_project, 'get-start-chatbot-fork')
                localStorage.setItem('last_project', JSON.stringify(project))  

                this.getProjectBots();

                this.getProjectPlan(this.project)
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

  getProjectBots() {
    this.logger.log('[GET START CHATBOT FORK] -  CALLING GET CHATBOTS');
    this.faqKbService.getFaqKbByProjectId().subscribe((faqKb: any) => {
      this.logger.log('[GET START CHATBOT FORK] - GET CHATBOTS RES', faqKb);

      if (faqKb) {
        this.chatBotCount = faqKb.length;
        this.logger.log('[GET START CHATBOT FORK] - COUNT OF CHATBOTS', this.chatBotCount);
      }
    }, (error) => {
      this.logger.error('[GET START CHATBOT FORK] - GET CHATBOTS - ERROR ', error);

    }, () => {
      this.logger.log('[GET START CHATBOT FORK] - GET CHATBOTS * COMPLETE *');
      this.getChatBotCompleted = true
    });
  }

  getProjectBotsByPassingProjectId(idProject: string) {
    this.logger.log('[GET START CHATBOT FORK] -  CALLING GET CHATBOTS BY PASS PRJCT ID');
    this.faqKbService.getFaqKbByPassingProjectId(idProject).subscribe((faqKb: any) => {
      this.logger.log('[GET START CHATBOT FORK] - GET CHATBOTS BY PASS PRJCT ID', faqKb);

      if (faqKb) {
        this.chatBotCount = faqKb.length;
        this.logger.log('[GET START CHATBOT FORK] - COUNT OF CHATBOTS', this.chatBotCount);
      }
    }, (error) => {
      this.logger.error('[GET START CHATBOT FORK] - GET CHATBOTS - ERROR ', error);

    }, () => {
      this.logger.log('[GET START CHATBOT FORK] - GET CHATBOTS * COMPLETE *');
      this.getChatBotCompleted = true
    });
  }




  onSelectProject(selectedprojectid) {
    this.logger.log('[GET START CHATBOT FORK] - ON SELECTED PROJECT - selectedprojectid ', selectedprojectid)
    this.selectedProjectId = selectedprojectid
    this.getProjects(this.selectedProjectId)

  }

  importTemplate() {
    this.logger.log('[GET START CHATBOT FORK] importTemplate botid', this.botid, ' - selectedProjectId ', this.selectedProjectId,)
    this.logger.log('[GET START CHATBOT FORK] importTemplate chatBotCount ', this.chatBotCount, ' chatBotLimit ', this.chatBotLimit, ' USER_ROLE ', this.USER_ROLE, ' profile_name ', this.project.profile.name)

    // this.router.navigate([`install-template/${this.botid}/${this.selectedProjectId}`]); // old
    // this.forkTemplate()
    if (this.USER_ROLE !== 'agent') {
      if (this.chatBotLimit) {
        if (this.chatBotCount < this.chatBotLimit) {
          this.logger.log('[GET START CHATBOT FORK] USECASE  chatBotCount < chatBotLimit: RUN FORK')
          this.forkTemplate()
        } else if (this.chatBotCount >= this.chatBotLimit) {
          this.logger.log('[GET START CHATBOT FORK] USECASE  chatBotCount >= chatBotLimit DISPLAY MODAL')
          this.presentDialogReachedChatbotLimit()
        }
      } else if (!this.chatBotLimit) {
        this.logger.log('[GET START CHATBOT FORK] USECASE  NO chatBotLimit: RUN FORK')
        this.forkTemplate()
      }
    } if (this.USER_ROLE === 'agent') {
      this.presentModalAgentCannotManageChatbotAndGoToHome()
    }
  }

  presentDialogReachedChatbotLimit() {
    this.logger.log('[BOTS-LIST] openDialog presentDialogReachedChatbotLimit prjct_profile_name ', this.prjct_profile_name)
    const dialogRef = this.dialog.open(ChatbotModalComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      data: {
        projectProfile: this.prjct_profile_name,
        callingPage: "getStartChatbotFork",
        projectId: this.project._id,

        // subscriptionIsActive: this.subscription_is_active,
        // prjctProfileType: this.prjct_profile_type,
        // trialExpired: this.trial_expired
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      this.logger.log(`[GET START CHATBOT FORK] Dialog result: ${result}`);
    });
  }

  presentModalAgentCannotManageChatbotAndGoToHome() {
    const el = document.createElement('div')
    if (this.hideHelpLink) {
      el.innerHTML = this.agentsCannotManageChatbots + '. ' + `<a href=${this.URL_UNDERSTANDING_DEFAULT_ROLES} target='_blank'>` + this.learnMoreAboutDefaultRoles + "</a>"
    } else {
      el.innerHTML = this.agentsCannotManageChatbots + '. '
    }
    swal({
      // title: this.onlyOwnerCanManageTheAccountPlanMsg,
      content: el,
      icon: "info",
      buttons: {
        catch: {
          text: "OK",
          value: "catch",
        },
      },
      dangerMode: false,
    }).then((value: any) => {
      if (value === 'catch') {
        this.goToHome()
      }
    });

  }


  goToHome() {
    this.router.navigate([`/project/${this.project._id}/home`]);
  }

  goToYourProject() {
    this.router.navigate(['/projects']);
  }

  goToCreateProject() {
    this.logger.log('[GET START CHATBOT FORK] goToCreateProject (create-project-itw)  botid', this.botid)
    this.router.navigate([`/create-project-itw/${this.botid}`]);
  }


  forkTemplate() {
    // this.logger.log('[GET START CHATBOT FORK] selectedTemplate ',this.selectedTemplate._id)
    this.logger.log('[GET START CHATBOT FORK] selectedProjectId ',this.selectedProjectId)
    this.logger.log('[GET START CHATBOT FORK] selectedProjectId ',this.selectedTemplate)
    this.faqKbService.installTemplate(this.selectedTemplate._id, this.selectedProjectId, true, this.selectedTemplate._id).subscribe((res: any) => {
      // this.logger.log('[GET START CHATBOT FORK] - FORK TEMPLATE RES', res);
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
    this.faqKbService.getFaqKbByIdAndProjectId(this.selectedProjectId, botid).subscribe((faqkb: any) => {
      // this.logger.log('[GET START CHATBOT FORK] GET FAQ-KB (DETAILS) BY ID  ', faqkb);

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
          // this.logger.log('[GET START CHATBOT FORK] this.user',  this.user)
          this.user = localStorage.getItem('user');
          // this.logger.log('[GET START CHATBOT FORK] stored user',  this.user)
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

  getProjectPlan(project) {
    this.logger.log('[GET START CHATBOT FORK] - GET PROJECT PLAN - project ', project)
    if (project.profile.extra3) {
      this.appSumoProfile = APP_SUMO_PLAN_NAME[project.profile.extra3]
      // this.logger.log('[GET START CHATBOT FORK] Find Current Project appSumoProfile ', this.appSumoProfile)
    }

    if (project.profile.type === 'free') {
      this.logger.log('[GET START CHATBOT FORK] - GET PROJECT PLAN - project profile type ', project.profile.type)
      this.logger.log('[GET START CHATBOT FORK] - GET PROJECT PLAN - TRIAL EXPIRED ', project.trialExpired)
      // ------------------------------------------------------------------------ 
      // USECASE: TRIAL ACTIVE 
      // ------------------------------------------------------------------------
      if (project.trialExpired === false) {
        if (project.profile.name === 'free') {
          this.prjct_profile_name = PLAN_NAME.B + " plan (trial)"
          // Chatbot limit
          this.chatBotLimit = null
          this.logger.log('[GET START CHATBOT FORK] - GET PROJECT PLAN - project profile type ', project.profile.type, 'prjct_profile_name', this.prjct_profile_name, ' chatBotLimit', this.chatBotLimit)


        } else if (project.profile.name === 'Sandbox') {
          this.prjct_profile_name = PLAN_NAME.E + " plan (trial)"
          this.chatBotLimit = CHATBOT_MAX_NUM[PLAN_NAME.E];
          this.logger.log('[GET START CHATBOT FORK] - GET PROJECT PLAN - project profile type ', project.profile.type, 'prjct_profile_name', this.prjct_profile_name, ' chatBotLimit', this.chatBotLimit)

        }
      } else {
        this.logger.log('[GET START CHATBOT FORK] - GET PROJECT PLAN - TRIAL EXPIRED ', project.trialExpired)
        // ------------------------------------------------------------------------ 
        // USECASE: TRIAL EXPIRED 
        // ------------------------------------------------------------------------
        if (project.profile.name === 'free') {
          this.prjct_profile_name = "Free plan";
          this.chatBotLimit = CHATBOT_MAX_NUM.free;
          this.logger.log('[GET START CHATBOT FORK] - GET PROJECT PLAN - project profile type ', project.profile.type, 'prjct_profile_name', this.prjct_profile_name, ' chatBotLimit', this.chatBotLimit)

        } else if (project.profile.name === 'Sandbox') {
          this.prjct_profile_name = "Sandbox plan";
          this.chatBotLimit = CHATBOT_MAX_NUM.free;
          this.logger.log('[GET START CHATBOT FORK] - GET PROJECT PLAN - project profile type ', project.profile.type, 'prjct_profile_name', this.prjct_profile_name, ' chatBotLimit', this.chatBotLimit)

        }
      }
    } else if (project.profile.type === 'payment') {
      this.logger.log('[GET START CHATBOT FORK] - GET PROJECT PLAN - project profile type ', project.profile.type)
      // ------------------------------------------------------------------------
      // USECASE: SUB ACTIVE
      // ------------------------------------------------------------------------
      if (project.isActiveSubscription === true) {
        this.logger.log('[GET START CHATBOT FORK] - GET PROJECT PLAN - SUB ACTIVE', project.isActiveSubscription)
        if (project.profile.name === PLAN_NAME.A) {
          if (!this.appSumoProfile) {
            this.prjct_profile_name = PLAN_NAME.A + " plan";
            this.chatBotLimit = null;
            this.logger.log('[GET START CHATBOT FORK] - GET PROJECT PLAN - project profile type ', project.profile.type, 'prjct_profile_name', this.prjct_profile_name, ' chatBotLimit', this.chatBotLimit)
          } else {
            this.prjct_profile_name = PLAN_NAME.A + " plan " + '(' + this.appSumoProfile + ')';
            this.chatBotLimit = null;
            this.logger.log('[GET START CHATBOT FORK] - GET PROJECT PLAN - project profile type ', project.profile.type, 'prjct_profile_name', this.prjct_profile_name, ' chatBotLimit', this.chatBotLimit)

          }
        } else if (project.profile.name === PLAN_NAME.B) {
          if (!this.appSumoProfile) {
            this.prjct_profile_name = PLAN_NAME.B + " plan";
            this.chatBotLimit = null;
            this.logger.log('[GET START CHATBOT FORK] - GET PROJECT PLAN - project profile type ', project.profile.type, 'prjct_profile_name', this.prjct_profile_name, ' chatBotLimit', this.chatBotLimit)

          } else {
            this.prjct_profile_name = PLAN_NAME.B + " plan " + '(' + this.appSumoProfile + ')';;
            this.chatBotLimit = null;
            this.logger.log('[GET START CHATBOT FORK] - GET PROJECT PLAN - project profile type ', project.profile.type, 'prjct_profile_name', this.prjct_profile_name, ' chatBotLimit', this.chatBotLimit)

          }
        } else if (project.profile.name === PLAN_NAME.C) {
          this.prjct_profile_name = PLAN_NAME.C + " plan";
          this.chatBotLimit = null;
          this.logger.log('[GET START CHATBOT FORK] - GET PROJECT PLAN - project profile type ', project.profile.type, 'prjct_profile_name', this.prjct_profile_name, ' chatBotLimit', this.chatBotLimit)

        } else if (project.profile.name === PLAN_NAME.D) {
          this.prjct_profile_name = PLAN_NAME.D + " plan";
          this.chatBotLimit = CHATBOT_MAX_NUM[PLAN_NAME.D]
          this.logger.log('[GET START CHATBOT FORK] - GET PROJECT PLAN - project profile type ', project.profile.type, 'prjct_profile_name', this.prjct_profile_name, ' chatBotLimit', this.chatBotLimit)

        }
        else if (project.profile.name === PLAN_NAME.E) {
          this.prjct_profile_name = PLAN_NAME.E + " plan";
          this.chatBotLimit = CHATBOT_MAX_NUM[PLAN_NAME.E]
          this.logger.log('[GET START CHATBOT FORK] - GET PROJECT PLAN - project profile type ', project.profile.type, 'prjct_profile_name', this.prjct_profile_name, ' chatBotLimit', this.chatBotLimit)
        }

        else if (project.profile.name === PLAN_NAME.EE) {
          this.prjct_profile_name = PLAN_NAME.EE + " plan";
          this.chatBotLimit = CHATBOT_MAX_NUM[PLAN_NAME.EE]
          this.logger.log('[GET START CHATBOT FORK] - GET PROJECT PLAN - project profile type ', project.profile.type, 'prjct_profile_name', this.prjct_profile_name, ' chatBotLimit', this.chatBotLimit)
        }

        else if (project.profile.name === PLAN_NAME.F) {
          this.prjct_profile_name = PLAN_NAME.F + " plan";
          this.chatBotLimit = null
          this.logger.log('[GET START CHATBOT FORK] - GET PROJECT PLAN - project profile type ', project.profile.type, 'prjct_profile_name', this.prjct_profile_name, ' chatBotLimit', this.chatBotLimit)

        }

      } else if (project.isActiveSubscription === false) {
        this.logger.log('[GET START CHATBOT FORK] - GET PROJECT PLAN - SUB ACTIVE', project.isActiveSubscription)
        if (project.profile.name === PLAN_NAME.A) {
          this.prjct_profile_name = PLAN_NAME.A + " plan";
          this.chatBotLimit = CHATBOT_MAX_NUM.free
          this.logger.log('[GET START CHATBOT FORK] - GET PROJECT PLAN - project profile type ', project.profile.type, 'prjct_profile_name', this.prjct_profile_name, ' chatBotLimit', this.chatBotLimit)

        }
        else if (project.profile.name === PLAN_NAME.B) {
          this.prjct_profile_name = PLAN_NAME.B + " plan";
          this.chatBotLimit = CHATBOT_MAX_NUM.free
          this.logger.log('[GET START CHATBOT FORK] - GET PROJECT PLAN - project profile type ', project.profile.type, 'prjct_profile_name', this.prjct_profile_name, ' chatBotLimit', this.chatBotLimit)

        }
        else if (project.profile.name === PLAN_NAME.C) {
          this.prjct_profile_name = PLAN_NAME.C + " plan";
          this.chatBotLimit = CHATBOT_MAX_NUM.free
          this.logger.log('[GET START CHATBOT FORK] - GET PROJECT PLAN - project profile type ', project.profile.type, 'prjct_profile_name', this.prjct_profile_name, ' chatBotLimit', this.chatBotLimit)

        }
        else if (project.profile.name === PLAN_NAME.D) {
          this.prjct_profile_name = PLAN_NAME.D + " plan";
          this.chatBotLimit = CHATBOT_MAX_NUM.free
          this.logger.log('[GET START CHATBOT FORK] - GET PROJECT PLAN - project profile type ', project.profile.type, 'prjct_profile_name', this.prjct_profile_name, ' chatBotLimit', this.chatBotLimit)

        }
        else if (project.profile.name === PLAN_NAME.E) {
          this.prjct_profile_name = PLAN_NAME.E + " plan";
          this.chatBotLimit = CHATBOT_MAX_NUM.free
          this.logger.log('[GET START CHATBOT FORK] - GET PROJECT PLAN - project profile type ', project.profile.type, 'prjct_profile_name', this.prjct_profile_name, ' chatBotLimit', this.chatBotLimit)
        }
        else if (project.profile.name === PLAN_NAME.EE) {
          this.prjct_profile_name = PLAN_NAME.EE + " plan";
          this.chatBotLimit = CHATBOT_MAX_NUM.free
          this.logger.log('[GET START CHATBOT FORK] - GET PROJECT PLAN - project profile type ', project.profile.type, 'prjct_profile_name', this.prjct_profile_name, ' chatBotLimit', this.chatBotLimit)
        }
        else if (project.profile.name === PLAN_NAME.F) {
          this.prjct_profile_name = PLAN_NAME.F + " plan";
          this.chatBotLimit = CHATBOT_MAX_NUM.free
          this.logger.log('[GET START CHATBOT FORK] - GET PROJECT PLAN - project profile type ', project.profile.type, 'prjct_profile_name', this.prjct_profile_name, ' chatBotLimit', this.chatBotLimit)

        }
      }
    }
  }

  traslateString() {
    this.translate
      .get('LearnMoreAboutDefaultRoles')
      .subscribe((translation: any) => {
        this.learnMoreAboutDefaultRoles = translation
      })

    this.translate
      .get('AgentsCannotManageChatbots')
      .subscribe((translation: any) => {
        this.agentsCannotManageChatbots = translation
      })
  }

}
