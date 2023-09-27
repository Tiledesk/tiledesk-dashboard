import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from 'app/services/app-config.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { Location } from '@angular/common';
import { DepartmentService } from 'app/services/department.service';
import { Project } from 'app/models/project-model';
import { goToCDSVersion } from 'app/utils/util';

@Component({
  selector: 'appdashboard-community-template-dtls',
  templateUrl: './community-template-dtls.component.html',
  styleUrls: ['./community-template-dtls.component.scss']
})

export class CommunityTemplateDtlsComponent implements OnInit {

  public templateId: string;
  public projectId: string;
  public template: any;
  description: any;
  public isChromeVerGreaterThan100: boolean;
  public UPLOAD_ENGINE_IS_FIREBASE: boolean;
  public storageBucket: string;
  public baseUrl: string;
  public botid: string;
  public TESTSITE_BASE_URL: string;
  public defaultDepartmentId: string;
  project: Project;
  constructor(
    private route: ActivatedRoute,
    private faqKbService: FaqKbService,
    private auth: AuthService,
    public appConfigService: AppConfigService,
    private logger: LoggerService,
    public location: Location,
    private router: Router,
    private departmentService: DepartmentService,
  ) { }

  ngOnInit(): void {
    this.getParamsAndTemplateDetails();
    this.getBrowserVersion();
    this.getProfileImageStorage();
    this.getDeptsByProjectId();
    this.getCurrentProject();
    this.getTestSiteUrl()
  }

  getProfileImageStorage() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[BOTS-TEMPLATES] IMAGE STORAGE ', this.storageBucket, 'usecase Firebase')
    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;

      this.logger.log('[BOTS-TEMPLATES] IMAGE STORAGE ', this.baseUrl, 'usecase native')
    }
  }

  getParamsAndTemplateDetails() {
    this.route.params.subscribe((params) => {
      this.logger.log('[COMMUNITY-TEMPLATE-DTLS] GET PARAMS - params ', params);
      if (params) {
        this.templateId = params.templateid
        this.projectId = params.projectid
        this.getCommunityTemplateDetails(this.templateId)
      }
    });
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    })
  }

  getCommunityTemplateDetails(templateId) {
    this.faqKbService.getCommunityTemplateDetail(templateId)
      .subscribe((_template) => {
        this.logger.log('[COMMUNITY-TEMPLATE-DTLS] GET COMMUNITY TEMPLATE - template ', _template);
        if (_template) {
          this.template = _template


        }
      })
  }


  goBack() {
    this.location.back();
  }

  forkTemplate() {
    this.faqKbService.installTemplate(this.templateId, this.projectId, true, this.projectId).subscribe((res: any) => {
      this.logger.log('[COMMUNITY-TEMPLATE-DTLS] - FORK TEMPLATE RES', res);
      this.botid = res.bot_id

    }, (error) => {
      this.logger.error('[COMMUNITY-TEMPLATE-DTLS] FORK TEMPLATE - ERROR ', error);

    }, () => {
      this.logger.log('[COMMUNITY-TEMPLATE-DTLS] FORK TEMPLATE COMPLETE');
     
      this.goToBotDetails()
  

    });
  }


  goToBotDetails() {
    // this.router.navigate(['project/' + this.projectId + '/cds/', this.botid, 'intent', '0'])
    let faqkb = {
      createdAt: new Date(),
      _id : this.botid
    }
    goToCDSVersion(this.router, faqkb, this.project._id, this.appConfigService.getConfig().cdsBaseUrl)
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project;
      this.logger.log('[TILEBOT] project from AUTH service subscription  ', this.project)
    });
  }

  getDeptsByProjectId() {
    this.departmentService.getDeptsByProjectId().subscribe((departments: any) => {
      this.logger.log('[COMMUNITY-TEMPLATE-DTLS] - DEPT GET DEPTS ', departments);

      if (departments) {
        departments.forEach((dept: any) => {

          if (dept.default === true) {
            this.defaultDepartmentId = dept._id;
            this.logger.log('[COMMUNITY-TEMPLATE-DTLS - DEFAULT DEPT ID ',  this.defaultDepartmentId);
          }
        });
      }
    }, error => {

      this.logger.error('[COMMUNITY-TEMPLATE-DTLS] - DEPT - GET DEPTS  - ERROR', error);
    }, () => {
      this.logger.log('[COMMUNITY-TEMPLATE-DTLS] - DEPT - GET DEPTS - COMPLETE')

    });
  }


  getTestSiteUrl() {
    this.TESTSITE_BASE_URL = this.appConfigService.getConfig().WIDGET_BASE_URL + 'assets/twp/index.html';
    this.logger.log('[COMMUNITY-TEMPLATE-DTLS] AppConfigService getAppConfig TESTSITE_BASE_URL', this.TESTSITE_BASE_URL);
  }

  openTestSiteInPopupWindow() {
    // this.logger.log('openTestSiteInPopupWindow TESTSITE_BASE_URL', this.TESTSITE_BASE_URL)
    const testItOutBaseUrl = this.TESTSITE_BASE_URL.substring(0, this.TESTSITE_BASE_URL.lastIndexOf('/'));
    const testItOutUrl = testItOutBaseUrl + '/chatbot-panel.html'
    // this.logger.log('openTestSiteInPopupWindow testItOutBaseUrl' , testItOutBaseUrl )  
    const url = testItOutUrl + '?tiledesk_projectid=' + this.project._id + '&tiledesk_participants=bot_' + this.templateId + "&tiledesk_departmentID=" + this.defaultDepartmentId
    // this.logger.log('openTestSiteInPopupWindow URL ', url) 
    let params = `toolbar=no,menubar=no,width=815,height=727,left=100,top=100`;
    window.open(url, '_blank', params);
  }



}
