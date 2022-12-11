import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
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
  public botid: string;
  public botname : string;
  public templateid: string;
  public projectid: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<TemplateDetailComponent>,
    public appConfigService: AppConfigService,
    private logger: LoggerService,
    public auth: AuthService,
    private usersService: UsersService,
    private faqKbService: FaqKbService,
    private router: Router,
    public dialog: MatDialog,
  ) {
    console.log('TemplateDetailComponent', data) 
    this.projectid = data.projectId
    this.template = data.template;
    console.log('TemplateDetailComponent template ', this.template)
    console.log('TemplateDetailComponent projectid ', this.projectid)
if (this.template) {
    this.botname = this.template.name
    this.templateid = this.template._id
}
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
    console.log('[BOTS-TEMPLATES] - FORK TEMPLATE - TEMPLATE ID',  this.templateid);
    this.faqKbService.installTemplate(this.templateid,  this.projectid).subscribe((res: any) => {
      console.log('[BOTS-TEMPLATES] - FORK TEMPLATE RES', res);
      this.botid = res.bot_id 
      // console.log('[BOTS-TEMPLATES] - FORK TEMPLATE RES - botid ',  this.botid);
    
    }, (error) => {
      console.error('[BOTS-TEMPLATES] FORK TEMPLATE - ERROR ', error);

    }, () => {
      console.log('[BOTS-TEMPLATES] FORK TEMPLATE COMPLETE');
      // this.goToBotDtls(this.botid, 'tilebot', this.botname) 
      // http://localhost:4200/#/project/625830e51976f200353fce7b/bots/intents/63959c3e7adf790035bbc4aa/native

      this.router.navigate(['project/' + this.projectid + '/bots/intents/', this.botid, 'native']);
      this.closeDialog()
    });
  }

  closeDialog() {

    this.dialogRef.close()
  }

  // goToBotDtls(idFaqKb: string, botType: string, botname: string) {
  //   this.logger.log('[BOTS-LIST] NAME OF THE BOT SELECTED ', botname);
  //   this.router.navigate(['project/' + this.projectid + '/bots/intents/', this.botid, 'native']);

  //   let _botType = ""
  //   if (botType === 'internal') {
  //     _botType = 'native'

  //     // -------------------------------------------------------------------------------------------
  //     // Publish the bot name to be able to check in the native bot sidebar if the bot name changes,
  //     // to prevent the bot name from updating every time a bot sidebar menu item is clicked
  //     // -------------------------------------------------------------------------------------------
  //     // this.faqKbService.publishBotName(botname)

      
  //   // } else if (botType === 'tilebot') {
  //   //   _botType = 'tilebot'
  //   //   this.router.navigate(['project/' + this.project._id + '/tilebot/intents/', idFaqKb, _botType]);
  //   // } else {
  //   //   _botType = botType
  //   //   this.router.navigate(['project/' + this.project._id + '/bots', idFaqKb, _botType]);
  //   // }

  //   // this.logger.log('[BOTS-LIST] ID OF THE BOT (FAQKB) SELECTED ', idFaqKb, 'bot type ', botType);

  // }


}
