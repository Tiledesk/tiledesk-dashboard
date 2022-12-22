import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BrandService } from 'app/services/brand.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { MatDialog } from '@angular/material/dialog';
import { TemplateDetailComponent } from 'app/bots/templates/template-detail/template-detail.component';
import { ProjectService } from 'app/services/project.service';
import { AuthService } from 'app/core/auth.service';
import { Project } from 'app/models/project-model';
import { WidgetService } from 'app/services/widget.service';
import { WidgetSetUpBaseComponent } from 'app/widget_components/widget-set-up/widget-set-up-base/widget-set-up-base.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'appdashboard-install-template',
  templateUrl: './install-template.component.html',
  styleUrls: ['./install-template.component.scss']
})
export class InstallTemplateComponent extends WidgetSetUpBaseComponent implements OnInit {

  projectId: string;
  botId: string;
  selectedTemplate: string;

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
  }

  getParamsTemplatesAndProjects() {
    this.route.params.subscribe((params) => {

      this.logger.log('[INSTALL-TEMPLATE] params ', params)
      this.projectId = params.projectid;
      this.botId = params.botid;
      this.langCode = params.langcode;
      this.langName = params.langname;
      this.logger.log('[INSTALL-TEMPLATE] params langCode: ', this.langCode, ' - langName: ', this.langName)
      if (this.langCode &&  this.langName) {
      this.addNewLanguage(this.langCode,  this.langName)
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
          // console.log('[INSTALL-TEMPLATE] - GET PROJECTS  project ', project);
          if (project.id_project.id === projectid) {
            this.logger.log('[INSTALL-TEMPLATE] - GET PROJECTS selected project ', project);

            const selectedProject: Project = {
              _id: project['id_project']['_id'],
              name: project['id_project']['name'],
              operatingHours: project['id_project']['activeOperatingHours'],
              profile_type: project['id_project']['profile'].type,
              profile_name: project['id_project']['profile'].name,
              trial_expired: project['id_project']['trialExpired']
            }
            this.auth.projectSelected(selectedProject)
          }
        }); 
      }
    }, error => {

      this.logger.error('[GET START CHATBOT FORK] - GET PROJECTS - ERROR ', error)
    }, () => {
      this.logger.log('[GET START CHATBOT FORK] - GET PROJECTS * COMPLETE *')
    });
  }



  getTemplates(botid) {
    this.faqKbService.getTemplates().subscribe((res: any) => {

      if (res) {
        this.logger.log('[INSTALL-TEMPLATE] GET TEMPLATES - RES ', res)

        const selectedTemplate = res.filter((obj) => {
          return obj._id === botid
        });
        this.templates = selectedTemplate
        this.openDialog(this.templates[0])
        this.logger.log('[INSTALL-TEMPLATE] GET TEMPLATES - SELECTED TEMPALTES ', this.templates)
        this.generateTagsBackground(this.templates)

        this.templateImg = this.templates[0]['bigImage'];
      }

    }, (error) => {
      this.logger.error('[INSTALL-TEMPLATE] GET TEMPLATE BY ID - ERROR ', error);

    }, () => {
      this.logger.log('[GET START CHATBOT FORK] GET TEMPLATE BY ID * COMPLETE *');

    });
  }

  generateTagsBackground(templates) {
    templates.forEach(template => {
      // console.log('generateTagsBackground template', template)
      if (template && template.certifiedTags) {
        template.certifiedTags.forEach(tag => {
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
            // console.log('generateTagsBackground tagbckgnd ', tagbckgnd)
          }
          tag.background = tagbckgnd;
        });
      }
    });
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

  openDialog(template) {
    const dialogRef = this.dialog.open(TemplateDetailComponent, {
      data: {
        template: template,
        projectId: this.projectId,
        newlyCreatedProject: this.newlyCreatedProject

      },
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log(`Dialog result: ${result}`);
    });
  }

  goToGetStartChatbot() {
    this.router.navigate([`/get-chatbot/${this.botId}`]);

  }

}
