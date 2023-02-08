import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from 'app/services/app-config.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { Location } from '@angular/common';

@Component({
  selector: 'appdashboard-community-template-dtls',
  templateUrl: './community-template-dtls.component.html',
  styleUrls: ['./community-template-dtls.component.scss']
})

export class CommunityTemplateDtlsComponent implements OnInit {

  public templateId: string;
  public projectId: string;
  public template: any;
  public isChromeVerGreaterThan100: boolean;
  public UPLOAD_ENGINE_IS_FIREBASE: boolean;
  public storageBucket: string;
  public baseUrl: string;
  public botid: string;
  constructor(
    private route: ActivatedRoute,
    private faqKbService: FaqKbService,
    private auth: AuthService,
    public appConfigService: AppConfigService,
    private logger: LoggerService,
    public location: Location,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.getParamsAndTemplateDetails();
    this.getBrowserVersion();
    this.getProfileImageStorage();
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
    this.faqKbService.installTemplate(this.templateId, this.projectId).subscribe((res: any) => {
      this.logger.log('[TEMPLATE DETAIL] - FORK TEMPLATE RES', res);
      this.botid = res.bot_id

    }, (error) => {
      this.logger.error('[TEMPLATE DETAIL] FORK TEMPLATE - ERROR ', error);

    }, () => {
      this.logger.log('[TEMPLATE DETAIL] FORK TEMPLATE COMPLETE');
    

     
      this.goToBotDetails()
  

    });
  }


  goToBotDetails() {
    this.router.navigate(['project/' + this.projectId + '/cds/', this.botid, 'intent', '0'])
  }








}
