import { Component, isDevMode, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BrandService } from 'app/services/brand.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { MatDialog } from '@angular/material/dialog';
// import { TemplateDetailComponent } from 'app/bots/templates/template-detail/template-detail.component';
import { ProjectService } from 'app/services/project.service';
import { AuthService } from 'app/core/auth.service';
import { Project } from 'app/models/project-model';
import { WidgetService } from 'app/services/widget.service';
import { WidgetSetUpBaseComponent } from 'app/widget_components/widget-set-up/widget-set-up-base/widget-set-up-base.component';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { BotLocalDbService } from 'app/services/bot-local-db.service';
import { DepartmentService } from 'app/services/department.service';
import { AppConfigService } from 'app/services/app-config.service';
import { APP_SUMO_PLAN_NAME, goToCDSVersion, PLAN_NAME } from 'app/utils/util';
import { FaqKb } from 'app/models/faq_kb-model';
@Component({
  selector: 'appdashboard-install-template',
  templateUrl: './install-template.component.html',
  styleUrls: ['./install-template.component.scss']
})
export class InstallTemplateComponent extends WidgetSetUpBaseComponent implements OnInit {
  PLAN_NAME = PLAN_NAME;
  APP_SUMO_PLAN_NAME = APP_SUMO_PLAN_NAME;
  appSumoProfile: string
  projectId: string;
  projectName: string;
  projectPlan: string;
  botId: string;
  selectedTemplate: any;

  public companyLogoBlack_Url: string;
  public tparams: any;
  public company_name: any;
  public company_site_url: any;
  public templateImg: string;
  public templateNameOnSite: string;
  public langCode: string;
  public langName: string;
  public templates: any;
  public newlyCreatedProject = false
  public user: any
  public botid: string;
  public defaultDeptID: string;
  public botname: string;
  public botDescription: string;
  public templateFeature: any;
  public templateTags: any;
  public templatesCertifiedTags: any;
  project: Project;
  public TESTSITE_BASE_URL: string;
  prjct_profile_name: string
  constructor(
    private route: ActivatedRoute,
    private faqKbService: FaqKbService,
    private logger: LoggerService,
    public brandService: BrandService,
    public dialog: MatDialog,
    private router: Router,
    private projectService: ProjectService,
    public auth: AuthService,
    private widgetService: WidgetService,
    public translate: TranslateService,
    public location: Location,
    private botLocalDbService: BotLocalDbService,
    private departmentService: DepartmentService,
    public appConfigService: AppConfigService,

  ) {
    super(translate);
    const brand = brandService.getBrand();
    this.companyLogoBlack_Url = brand['company_logo_black__url'];
    this.tparams = brand;
    this.company_name = brand['company_name'];
    this.company_site_url = brand['company_site_url'];
  }

  ngOnInit(): void {
    this.getParamsTemplatesAndProjects()
    this.getLoggedUser();
    this.getTestSiteUrl()
  }

  getLoggedUser() {
    this.auth.user_bs
      .subscribe((user) => {
        if (user) {
          this.user = user;
          // this.logger.log('[INSTALL-TEMPLATE]  - user ', this.user)
        }
      });
  }

  getParamsTemplatesAndProjects() {
    this.route.params.subscribe((params) => {

      // console.log('[INSTALL-TEMPLATE] params ', params)
      this.projectId = params.projectid;
      // this.logger.log('[INSTALL-TEMPLATE] projectId ', this.projectId)
      this.botId = params.botid;
      this.langCode = params.langcode;
      this.langName = params.langname;
      // console.log('[INSTALL-TEMPLATE] params langCode: ', this.langCode, ' - langName: ', this.langName)
      if (this.langCode && this.langName) {
        this.addNewLanguage(this.langCode, this.langName)
        this.newlyCreatedProject = true
      }

      this.getTemplates(params['botid'])

      this.getProjects(this.projectId)
    })
  }

  addNewLanguage(langCode: string, langName: string) {

    this.logger.log('[INSTALL-TEMPLATE] - ADD-NEW-LANG selectedTranslationCode', langCode);
    this.logger.log('[INSTALL-TEMPLATE] - ADD-NEW-LANG selectedTranslationLabel', langName);

    // cloneLabel CHE RITORNERA IN RESPONSE LA NUOVA LINGUA (l'inglese nel caso non sia una delle nostre lingue pretradotte)
    this.widgetService.cloneLabel(langCode.toUpperCase())
      .subscribe((res: any) => {

        this.logger.log('[INSTALL-TEMPLATE] - ADD-NEW-LANG (clone-label) RES ', res.data);



      }, error => {
        this.logger.error('[INSTALL-TEMPLATE] ADD-NEW-LANG (clone-label) - ERROR ', error)
      }, () => {
        this.logger.log('[INSTALL-TEMPLATE] ADD-NEW-LANG (clone-label) * COMPLETE *')

      });

    // // ADD THE NEW LANGUAGE TO BOTTOM NAV
    const newLang = { code: langCode, name: langName };
    this.logger.log('[INSTALL-TEMPLATE] Multilanguage saveNewLanguage newLang objct ', newLang);

    this.availableTranslations.push(newLang)
    this.logger.log('[INSTALL-TEMPLATE] Multilanguage saveNewLanguage availableTranslations ', this.availableTranslations)
  }

  getProjects(projectid) {
    this.projectService.getProjects().subscribe((projects: any) => {
      this.logger.log('[INSTALL-TEMPLATE] - GET PROJECTS ', projects);
      if (projects && projects.length > 0) {
        projects.forEach(project => {
          // this.logger.log('[INSTALL-TEMPLATE] - GET PROJECTS  project ', project);
          if (project.id_project.id === projectid) {
            this.logger.log('[INSTALL-TEMPLATE] - GET PROJECTS selected project ', project);
            this.project = project.id_project
            this.projectName = project.id_project.name;
            this.projectPlan = project.id_project.profile.name

            if (project.id_project.profile.extra3) {
              
              this.appSumoProfile = APP_SUMO_PLAN_NAME[project.id_project.profile.extra3]
              this.logger.log('[INSTALL-TEMPLATE] Find Current Project appSumoProfile ', this.appSumoProfile)
            }


            if (project.id_project.profile.type === 'free') {
              if (project.id_project.trial_expired === false) {
                this.prjct_profile_name = PLAN_NAME.B + " plan (trial)"
               
                
              } else {
                this.prjct_profile_name = "Free plan";
              
              }
            } else if (project.id_project.profile.type === 'payment') {
            
                if (project.id_project.profile.name === PLAN_NAME.A) {
                  if (!this.appSumoProfile) {
                    this.prjct_profile_name = PLAN_NAME.A + " plan";
                  
                  } else {
                    this.prjct_profile_name = PLAN_NAME.A + " plan " + '(' + this.appSumoProfile + ')';
                  
                  }
                } else if (project.id_project.profile.name === PLAN_NAME.B) {
                  if (!this.appSumoProfile) {
                    this.prjct_profile_name = PLAN_NAME.B + " plan";
                   
                  } else {
                    this.prjct_profile_name = PLAN_NAME.B + " plan " + '(' + this.appSumoProfile + ')';;
                  
                  }
                } else if (project.id_project.profile.name === PLAN_NAME.C) {
                  this.prjct_profile_name = PLAN_NAME.C + " plan";
                }
            }

            const selectedProject: Project = {
              _id: project['id_project']['_id'],
              name: project['id_project']['name'],
              operatingHours: project['id_project']['activeOperatingHours'],
              profile_type: project['id_project']['profile'].type,
              profile_name: project['id_project']['profile'].name,
              trial_expired: project['id_project']['trialExpired']
            }
            this.auth.projectSelected(selectedProject)

            this.getDeptsByProjectId()
          }
        });
      }
    }, error => {

      this.logger.error('[INSTALL-TEMPLATE] - GET PROJECTS - ERROR ', error)
    }, () => {
      this.logger.log('[INSTALL-TEMPLATE] - GET PROJECTS * COMPLETE *')
    });
  }



  getTemplates(botid) {
    // this.faqKbService.getTemplates().subscribe((res: any) => {
    this.faqKbService.getChatbotTemplateById(botid).subscribe((res: any) => {
      if (res) {
        this.logger.log('[INSTALL-TEMPLATE] GET TEMPLATES - RES ', res)

        // const selectedTemplate = res.filter((obj) => {
        //   return obj._id === botid
        // });
        this.templates = res;
        this.botname = res['name']
        this.botDescription = res['description']
        this.templateFeature = res['templateFeatures']
        this.templateTags = res['tags']
        this.templatesCertifiedTags = res['certifiedTags']
        // this.openDialog(this.templates[0])
        // console.log('[INSTALL-TEMPLATE] GET TEMPLATES - SELECTED TEMPALTES > templateFeature', this.templateFeature)
        // console.log('[INSTALL-TEMPLATE] GET TEMPLATES - SELECTED TEMPALTES > templateTags', this.templateTags)
        // console.log('[INSTALL-TEMPLATE] GET TEMPLATES - SELECTED TEMPALTES ', this.templates)

        if (this.templates && this.templates.certifiedTags) {
          this.generateTagsBackgroundFromCertifiedTags(this.templates)
        } 
        // else  if (this.templates && this.templates.tags) {
        //   this.generateTagsBackgroundFromTags(this.templates)
        // }

        if (this.templates && this.templates['bigImage']) {
          this.templateImg = this.templates['bigImage'];
        }
        if (  this.templates && this.templates['name']) {
        this.botname = this.templates['name']
        // console.log('[INSTALL-TEMPLATE] GET TEMPLATES - SELECTED TEMPALTES >  botname', this.botname)
        }

        if (!isDevMode()) {
          if (window['analytics']) {
            try {
              window['analytics'].page("Wizard, Install chatbot", {
                "chatbotName": this.botname
              });
            } catch (err) {
              this.logger.error('Wizard Install template page error', err);
            }

            let userFullname = ''
            if (this.user.firstname && this.user.lastname)  {
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
              this.logger.error('Identify Install template event error', err);
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

    }, (error) => {
      this.logger.error('[INSTALL-TEMPLATE] GET TEMPLATE BY ID - ERROR ', error);

    }, () => {
      this.logger.log('[INSTALL-TEMPLATE] GET TEMPLATE BY ID * COMPLETE *');

    });
  }

  generateTagsBackgroundFromCertifiedTags(templates) {
    templates.forEach(template => {
      // this.logger.log('generateTagsBackground template', template)
      if (template && template.certifiedTags) {
        template.certifiedTags.forEach(tag => {
          // this.logger.log('generateTagsBackground tag', tag)
          let tagbckgnd = ''
          if (tag.color === "#a16300" || tag.color === "#A16300") {
            tagbckgnd = 'rgba(255,221,167,1)'
          } else if (tag.color === "#00699E" || tag.color === "#00699e") {
            tagbckgnd = 'rgba(208,239,255, 1)'
          } else if (tag.color === "#25833e" || tag.color === "#25833E") {
            tagbckgnd = 'rgba(204,241,213, 1)'
          } else if (tag.color === "#0049bd" || tag.color === "#0049BD") {
            tagbckgnd = 'rgba(220,233,255, 1)'
          } else if (tag.color !== "#a16300" && tag.color !== "#A16300" && tag.color !== "#00699E" && tag.color !== "#00699e" && tag.color !== "#25833e" && tag.color !== "#25833E" && tag.color !== "#0049bd" && tag.color !== "#0049BD") {

            tagbckgnd = this.hexToRgba(tag.color)
            // this.logger.log('generateTagsBackground tagbckgnd ', tagbckgnd)
          }
          tag.background = tagbckgnd;
        });
      }
    });
  }

  generateTagsBackgroundFromTags(template) {
    
      // console.log('generateTagsBackground template', template)
      if (template && template.tags) {
        template.tags.forEach(tag => {
          // console.log('generateTagsBackground tag', tag)
          let tagbckgnd = ''
          if (tag.color === "#a16300" || tag.color === "#A16300") {
            tagbckgnd = 'rgba(255,221,167,1)'
          } else if (tag.color === "#00699E" || tag.color === "#00699e") {
            tagbckgnd = 'rgba(208,239,255, 1)'
          } else if (tag.color === "#25833e" || tag.color === "#25833E") {
            tagbckgnd = 'rgba(204,241,213, 1)'
          } else if (tag.color === "#0049bd" || tag.color === "#0049BD") {
            tagbckgnd = 'rgba(220,233,255, 1)'
          } else if (tag.color !== "#a16300" && tag.color !== "#A16300" && tag.color !== "#00699E" && tag.color !== "#00699e" && tag.color !== "#25833e" && tag.color !== "#25833E" && tag.color !== "#0049bd" && tag.color !== "#0049BD") {

            tagbckgnd = this.hexToRgba(tag.color)
            // this.logger.log('generateTagsBackground tagbckgnd ', tagbckgnd)
          }
          tag.background = tagbckgnd;
        });
      }
    
  }

  hexToRgba(hex) {
    var c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split('');
      if (c.length == 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = '0x' + c.join('');
      return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',0.3)';
    }
    throw new Error('Bad Hex');
  }

  // openDialog(template) {
  //   const dialogRef = this.dialog.open(TemplateDetailComponent, {
  //     data: {
  //       template: template,
  //       projectId: this.projectId,
  //       newlyCreatedProject: this.newlyCreatedProject

  //     },
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     // this.logger.log(`Dialog result: ${result}`);
  //   });
  // }

  goToGetStartChatbot() {
    // this.router.navigate([`/get-chatbot/${this.botId}`]);
    this.location.back();

  }


  forkTemplate() {
    this.faqKbService.installTemplate(this.templates._id, this.projectId, true, this.templates._id).subscribe((res: any) => {
      this.logger.log('[INSTALL-TEMPLATE] - FORK TEMPLATE RES', res);
      this.botid = res.bot_id

    }, (error) => {
      this.logger.error('[INSTALL-TEMPLATE]] FORK TEMPLATE - ERROR ', error);

    }, () => {
      this.logger.log('[INSTALL-TEMPLATE] FORK TEMPLATE COMPLETE');
      if (this.newlyCreatedProject) {
        this.hookBotToDept()
      }

      this.getFaqKbById(this.botid);
     
      if (!isDevMode()) {
        if (window['analytics']) {

          let userFullname = ''
          if (this.user.firstname && this.user.lastname)  {
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
              'chatbotId':  this.botid,
              'page': 'Onboarding, Install template',
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

    });
  }

  getDeptsByProjectId() {
    this.departmentService.getDeptsByProjectId().subscribe((departments: any) => {

      // this.logger.log('[FAQ-EDIT-ADD] - DEPT - GET DEPTS  - RES', departments);
      if (departments) {
        departments.forEach((dept: any) => {


          if (dept.default === true) {
            this.defaultDeptID = dept._id;

          }
        });
      }

    }, error => {

      this.logger.error('[INSTALL-TEMPLATE] - DEPT - GET DEPTS  - ERROR', error);
    }, () => {
      this.logger.log('[INSTALL-TEMPLATE] - DEPT - GET DEPTS - COMPLETE')

    });
  }

  hookBotToDept() {
    this.departmentService.updateExistingDeptWithSelectedBot(this.defaultDeptID, this.botid).subscribe((res) => {
      this.logger.log('[INSTALL-TEMPLATE] Bot Create - UPDATE DEFAULT DEPT WITH FORKED BOT - RES ', res);
    }, (error) => {
      this.logger.error('[INSTALL-TEMPLATE] Bot Create - UPDATE DEFAULT DEPT WITH FORKED BOT - ERROR ', error);
    }, () => {
      this.logger.log('[[INSTALL-TEMPLATE] Bot Create - UPDATE DEFAULT DEPT WITH FORKED BOT - COMPLETE ');
    });
  }


  getFaqKbById(botid) {
    this.faqKbService.getFaqKbById(botid).subscribe((faqkb: any) => {
      this.logger.log('[INSTALL-TEMPLATE] GET FAQ-KB (DETAILS) BY ID  ', faqkb);

      this.botLocalDbService.saveBotsInStorage(botid, faqkb);
      this.goToBotDetails(faqkb)
    }, (error) => {
      this.logger.error('[INSTALL-TEMPLATE] GET FAQ-KB BY ID  - ERROR ', error);
    }, () => {
      this.logger.log('[INSTALL-TEMPLATE] GET FAQ-KB ID  - COMPLETE ');
    });
  }


  goToBotDetails(faqkb: FaqKb) {
    this.logger.log('[TEMPLATE DETAIL] GO TO  BOT DETAILS - isDevMode() ', isDevMode());
    // this.router.navigate(['project/' + this.project._id + '/cds/', this.botid, 'intent', '0']);
    goToCDSVersion(this.router, faqkb, this.project._id, this.appConfigService.getConfig().cdsBaseUrl)
  }

  getTestSiteUrl() {
    this.TESTSITE_BASE_URL = this.appConfigService.getConfig().WIDGET_BASE_URL + 'assets/twp/index.html';
    this.logger.log('[TEMPLATE DETAIL] AppConfigService getAppConfig TESTSITE_BASE_URL', this.TESTSITE_BASE_URL);
  }

  openTestSiteInPopupWindow() {
    // this.logger.log('openTestSiteInPopupWindow TESTSITE_BASE_URL', this.TESTSITE_BASE_URL)
    const testItOutBaseUrl = this.TESTSITE_BASE_URL.substring(0, this.TESTSITE_BASE_URL.lastIndexOf('/'));
    const testItOutUrl = testItOutBaseUrl + '/chatbot-panel.html'
    // const url = testItOutUrl + '?tiledesk_projectid=' + "635b97cc7d7275001a2ab3e0" + '&tiledesk_participants=bot_' + this.templateid + "&tiledesk_departmentID=635b97cc7d7275001a2ab3e4"
    const url = testItOutUrl + '?tiledesk_projectid=' + this.templates.id_project + '&tiledesk_participants=bot_' + this.templates._id + "&tiledesk_departmentID=" + "63d7911ca7b3d3001a4a9408"
    // this.logger.log('openTestSiteInPopupWindow URL ', url)


    let params = `toolbar=no,menubar=no,width=815,height=727,left=100,top=100`;
    window.open(url, '_blank', params);
  }


}
