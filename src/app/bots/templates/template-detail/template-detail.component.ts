import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from 'app/services/app-config.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { UsersService } from 'app/services/users.service';

@Component({
  selector: 'appdashboard-template-detail',
  templateUrl: './template-detail.component.html',
  styleUrls: ['./template-detail.component.scss']
})


export class TemplateDetailComponent implements OnInit {
  // public templateName: string;
  // public templateDescription: string;

  public template: any

  public TESTSITE_BASE_URL: string;
  public project: any;
  public projectId: string;
  public projectName: string;
  public USER_ROLE: string;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public appConfigService: AppConfigService,
    private logger: LoggerService,
    public auth: AuthService,
    private usersService: UsersService,
    private faqKbService: FaqKbService,
  ) {
    // console.log('TemplateDetailComponent', data) 

    this.template = data.template;
    console.log('TemplateDetailComponent template ', this.template)

    // this.templateName = data.name
    // console.log('TemplateDetailComponent templateName ' ,this.templateName)
    // this.templateDescription = data.description
  }

  ngOnInit(): void {
    this.getTestSiteUrl()
    this.getCurrentProject()
    this.getProjectUserRole()
  }


  getProjectUserRole() {
    this.usersService.project_user_role_bs

      .subscribe((user_role) => {

        if (user_role) {
          this.USER_ROLE = user_role
          console.log('[TemplateDetailComponent] user_role ', user_role);
        }
      });
  }

  getCurrentProject() {
    // this.project = this.auth.project_bs.value;
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.project = project
        this.logger.log('[TemplateDetailComponent] project from AUTH service subscription ', this.project);
        this.projectId = project._id;
        this.projectName = project.name;

      }
    });
  }

  getTestSiteUrl() {
    this.TESTSITE_BASE_URL = this.appConfigService.getConfig().testsiteBaseUrl;
    this.logger.log('[TemplateDetailComponent] AppConfigService getAppConfig TESTSITE_BASE_URL', this.TESTSITE_BASE_URL);
  }

  openTestSiteInPopupWindow() {
    const url = this.TESTSITE_BASE_URL + '?tiledesk_projectid=' + "635b97cc7d7275001a2ab3e0" + '&project_name=' + this.projectName + '&role=' + this.USER_ROLE
    let params = `toolbar=no,menubar=no,width=815,height=727,left=100,top=100`;
    window.open(url, '_blank', params);
  }

  // (dovrebbe funzionare anche con POST ../PROJECT_ID/bots/fork/ID_FAQ_FB/)
  forkTemplate() {
    console.log('[BOTS-TEMPLATES] - FORK TEMPLATE - TEMPLATE ID', this.template._id);
    this.faqKbService.installTemplate(this.template._id).subscribe((res: any) => {
      console.log('[BOTS-TEMPLATES] - FORK TEMPLATE RES', res);


    }, (error) => {
      console.error('[BOTS-TEMPLATES] FORK TEMPLATE - ERROR ', error);

    }, () => {
      console.log('[BOTS-TEMPLATES] FORK TEMPLATE COMPLETE');


    });
  }
}
