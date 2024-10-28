import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from 'app/services/app-config.service';
import { BrandService } from 'app/services/brand.service';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { LocalDbService } from 'app/services/users-local-db.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'appdashboard-bots-sidebar',
  templateUrl: './bots-sidebar.component.html',
  styleUrls: ['./bots-sidebar.component.scss']
})
export class BotsSidebarComponent implements OnInit, OnChanges {
  @Input() allTemplatesCount: number;
  @Input() customerSatisfactionTemplatesCount: number;
  @Input() increaseSalesTemplatesCount: number;
  @Input() myChatbotOtherCount: number;
  @Input() customerSatisfactionBotsCount: number;
  @Input() increaseSalesBotsCount: number;
  @Input() allCommunityTemplatesCount: number;
  @Input() kbCount : number;

  USER_ROLE: any;
  project: any;
  route: string;
  IS_OPEN: boolean;
  ARE_NEW_KB: boolean;
  private unsubscribe$: Subject<any> = new Subject<any>();


  public BOTS_ALL_TEMPALTES_ROUTE_IS_ACTIVE: boolean;
  public BOTS_CUSTOMER_SATISFACTION_TEMPALTES_ROUTE_IS_ACTIVE: boolean;
  public BOTS_INCREASE_SALES_TEMPALTES_ROUTE_IS_ACTIVE: boolean;
  public BOTS_MYCHATBOT_ALL_ROUTE_IS_ACTIVE: boolean;
  public BOTS_MYCHATBOT_INCREASE_SALES_ROUTE_IS_ACTIVE: boolean;
  public BOTS_MYCHATBOT_CUSTOMER_SATISFACTION_ROUTE_IS_ACTIVE: boolean;
  public BOTS_COMMUNITY_TEMPLATES_ROUTE_IS_ACTIVE: boolean;
  public KNOWLEDGE_BASE_ROUTE_IS_ACTIVE: boolean;
  public displayChatbotsCommunity: boolean;
  public displayTemplatesCategory: boolean;
  public isVisibleKNB: boolean;
  public_Key: string;
  kbNameSpaceid : string = '';

  constructor(
    private auth: AuthService,
    private logger: LoggerService,
    public router: Router,
    private kbService: KnowledgeBaseService,
    public brandService: BrandService,
    private prjctPlanService: ProjectPlanService,
    public appConfigService: AppConfigService,
    public localDbService: LocalDbService,
  ) {
    const brand = brandService.getBrand();
    this.displayChatbotsCommunity = brand['display_chatbots_community']
    this.displayTemplatesCategory = brand['display_templates_category']
    // this.logger.log('[BOTS-SIDEBAR] - displayChatbotsCommunity ', this.displayChatbotsCommunity)
    // this.logger.log('[BOTS-SIDEBAR] - displayTemplatesCategory ', this.displayTemplatesCategory)
  }

  ngOnInit(): void {
    this.getCurrentRoute()
   
    this.getCurrentProject();
    this.IS_OPEN = true
    this.listenToKbVersion()
    this.getDahordBaseUrlThenOSCODE()
    // this.getProjectPlan()
    // this.logger.log('[BOTS-SIDEBAR] - IS_OPEN ', this.IS_OPEN)
  }
  ngOnChanges() {
    // this.logger.log('[BOTS-SIDEBAR] - allTemplatesCount ', this.allTemplatesCount)
    // this.logger.log('[BOTS-SIDEBAR] - customerSatisfactionTemplatesCount ', this.customerSatisfactionTemplatesCount)
    // this.logger.log('[BOTS-SIDEBAR] - increaseSalesTemplatesCount ', this.increaseSalesTemplatesCount)
    // this.logger.log('[BOTS-SIDEBAR] - myChatbotOtherCount ', this.myChatbotOtherCount)
  }

  getCurrentProject() {
    // this.logger.log('[BOTS-SIDEBAR] - CALLING GET CURRENT PROJECT  ', this.project)
    this.auth.project_bs.subscribe((project) => {
      if ( project) {
          this.project = project;
          const storedNamespace = this.localDbService.getFromStorage(`last_kbnamespace-${this.project._id}`)
          this.logger.log('[BOTS-SIDEBAR] storedNamespace', storedNamespace);
          if(storedNamespace) {
            let storedNamespaceObjct = JSON.parse(storedNamespace)
            this.logger.log('[BOTS-SIDEBAR] storedNamespaceObjct', storedNamespaceObjct);
            this.kbNameSpaceid= storedNamespaceObjct.id
          }
        }
    })
  }

  getDahordBaseUrlThenOSCODE() {
    const href = window.location.href;

    // For test in local host
    // const href = "https://panel.tiledesk.com/v3/dashboard/#/project/63a075485f117f0013541e32/bots/templates/community"

    this.logger.log('[BOTS-SIDEBAR] href ', href)

    const hrefArray = href.split('/#/');
    const dshbrdBaseUrl = hrefArray[0]
    this.logger.log('[BOTS-SIDEBAR]  dshbrdBaseUrl includes tiledesk.com', dshbrdBaseUrl.includes('tiledesk.com'));

    if (dshbrdBaseUrl.includes('tiledesk.com')) {
      this.isVisibleKNB = true;
    } else if (!dshbrdBaseUrl.includes('tiledesk.com')) {
      this.logger.log('[BOTS-SIDEBAR] dshbrdBaseUrl includes tiledesk.com', dshbrdBaseUrl.includes('tiledesk.com'));
      this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
      if (this.public_Key.includes("KNB")) {
        let parts = this.public_Key.split('-');
        // this.logger.log('[BOTS-SIDEBAR] getAppConfig  parts ', parts);

        let kbn = parts.find((part) => part.startsWith('KNB'));
        this.logger.log('[BOTS-SIDEBAR] kbn from FT', kbn);
        let kbnParts = kbn.split(':');
        this.logger.log('[BOTS-SIDEBAR] kbnParts from FT', kbnParts);
        let kbnValue = kbnParts[1]
        this.logger.log('[BOTS-SIDEBAR] kbnValue from FT', kbnValue);

        if (kbnValue === 'T') {
          this.getProjectPlan()
          // if (dshbrdBaseUrl.includes('tiledesk.com')) {
          //   this.isVisibleKNB = true;
          //   this.logger.log('[BOTS-SIDEBAR] dshbrdBaseUrl includes tiledesk.com', dshbrdBaseUrl.includes('tiledesk.com'));
          //   this.logger.log('[BOTS-SIDEBAR] isVisibleKNB from FT', this.isVisibleKNB);
          // } else if (!dshbrdBaseUrl.includes('tiledesk.com')) {
          //   this.logger.log('[BOTS-SIDEBAR] dshbrdBaseUrl includes tiledesk.com', dshbrdBaseUrl.includes('tiledesk.com'));
          //   this.getProjectPlan()
          // }
        } else if (kbnValue === 'F') {
          this.isVisibleKNB = false;
        }

      } else {
        this.isVisibleKNB = false;
        this.logger.log('[BOTS-SIDEBAR] this.public_Key.includes("KNB")', this.public_Key.includes("KNB"))
      }
    }

  }




  getProjectPlan() {
    this.prjctPlanService.projectPlan$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((projectProfileData: any) => {
        this.logger.log('[BOTS-SIDEBAR] - getProjectPlan project Profile Data', projectProfileData)
        if (projectProfileData) {

          this.manageknowledgeBasesVisibility(projectProfileData)

        }
      })
  }



  manageknowledgeBasesVisibility(projectProfileData) {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    if (projectProfileData['customization']) {
      this.logger.log('[BOTS-SIDEBAR] manageknowledgeBasesVisibility USECASE EXIST customization > knowledgeBases (1)', projectProfileData['customization']['knowledgeBases'])
    }

    if (projectProfileData['customization'] && projectProfileData['customization']['knowledgeBases'] !== undefined) {
      this.logger.log('[BOTS-SIDEBAR] manageknowledgeBasesVisibility USECASE A EXIST customization ', projectProfileData['customization'], ' & knowledgeBases', projectProfileData['customization']['knowledgeBases'])

      if (projectProfileData['customization']['knowledgeBases'] === true) {
        this.isVisibleKNB = true;
        this.logger.log('[BOTS-SIDEBAR] manageknowledgeBasesVisibility USECASE A isVisibleKNB', this.isVisibleKNB)
      } else if (projectProfileData['customization']['knowledgeBases'] === false) {

        this.isVisibleKNB = false;
        this.logger.log('[BOTS-SIDEBAR] manageknowledgeBasesVisibility USECASE A isVisibleKNB', this.isVisibleKNB)
      }


    } else if (projectProfileData['customization'] && projectProfileData['customization']['knowledgeBases'] === undefined) {
      this.logger.log('[BOTS-SIDEBAR] manageknowledgeBasesVisibility USECASE B EXIST customization ', projectProfileData['customization'], ' BUT knowledgeBases IS', projectProfileData['customization']['knowledgeBases'])

      // if (this.public_Key.includes("KNB")) {
      this.logger.log('[BOTS-SIDEBAR] manageknowledgeBasesVisibility USECASE B  (from FT) - EXIST KNB ', this.public_Key.includes("KNB"));

      this.isVisibleKNB = this.getKnbValue()
      this.logger.log('[BOTS-SIDEBAR]  this.isVisibleKNB from FT ', this.isVisibleKNB)
      // if (key.includes("KNB")) {
      //   // this.logger.log('PUBLIC-KEY (BOTS-SIDEBAR) - key', key);
      //   let wun = key.split(":");
      //   //  this.logger.log('PUBLIC-KEY (BOTS-SIDEBAR) - ips key&value', ips);
      //   if (wun[1] === "F") {
      //     this.isVisibleKNB = false;
      //     this.logger.log('[BOTS-SIDEBAR] Widget unbranding USECASE B  (from FT) isVisibleKNB', this.isVisibleKNB);
      //     // this.logger.log('PUBLIC-KEY (BOTS-SIDEBAR) - isVisibleKNB', this.isVisibleAutoSendTranscript);
      //   } else {
      //     this.isVisibleKNB = true;
      //     this.logger.log('[BOTS-SIDEBAR] Widget unbranding  USECASE B  (from FT) isVisibleKNB', this.isVisibleKNB);
      //     // this.logger.log('PUBLIC-KEY (BOTS-SIDEBAR) - isVisibleKNB', this.isVisibleAutoSendTranscript);
      //   }
      // }
      // } else if (!this.public_Key.includes("KNB")) {
      //   this.logger.log('[BOTS-SIDEBAR] manageknowledgeBasesVisibility isVisibleKNB  USECASE B (from FT) -  EXIST KNB ', this.public_Key.includes("KNB"));
      //   this.isVisibleKNB = false;
      //   this.logger.log('[BOTS-SIDEBAR] manageknowledgeBasesVisibility isVisibleKNB  USECASE B (from FT) ', this.isVisibleKNB);
      // }

    } else if (projectProfileData['customization'] === undefined) {
      this.logger.log('[BOTS-SIDEBAR] manageknowledgeBasesVisibility USECASE C customization is  ', projectProfileData['customization'], 'get value from FT')
      // if (this.public_Key.includes("KNB")) {
        // this.logger.log('[BOTS-SIDEBAR] manageknowledgeBasesVisibility  USECASE B  (from FT) - EXIST KNB ', this.public_Key.includes("KNB"));

        this.isVisibleKNB = this.getKnbValue()
        this.logger.log('[BOTS-SIDEBAR]  this.isVisibleKNB from FT ', this.isVisibleKNB)

      
      // } else if (!this.public_Key.includes("KNB")) {
      //   this.logger.log('[BOTS-SIDEBAR] Widget unbranding  USECASE B (from FT) -  EXIST KNB ', this.public_Key.includes("KNB"));
      //   this.isVisibleKNB = false;
      //   this.logger.log('[BOTS-SIDEBAR] Widget unbranding  USECASE B (from FT) isVisibleKNB', this.isVisibleKNB);
      // }

    }
  }

  getKnbValue() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    // this.logger.log('[BOTS-SIDEBAR] getAppConfig  public_Key', this.public_Key);
    // this.logger.log('[BOTS-SIDEBAR] getAppConfig  public_Key type of', typeof this.public_Key);
    // this.logger.log('[BOTS-SIDEBAR] getAppConfig  this.public_Key.includes("KNB") ', this.public_Key.includes("KNB"));
    // let substring = this.public_Key.substring(this.public_Key.indexOf('KNB'));
    let parts = this.public_Key.split('-');
    // this.logger.log('[BOTS-SIDEBAR] getAppConfig  parts ', parts);

    let kbn = parts.find((part) => part.startsWith('KNB'));
    this.logger.log('[BOTS-SIDEBAR] manageknowledgeBasesVisibility  kbn ', kbn);
    let kbnParts = kbn.split(':');
    this.logger.log('[BOTS-SIDEBAR] manageknowledgeBasesVisibility  kbnParts ', kbnParts);
    let kbnValue = kbnParts[1]
    this.logger.log('[BOTS-SIDEBAR] manageknowledgeBasesVisibility  kbnValue ', kbnValue);
    if (kbnValue === 'T') {
      return true
    } else if (kbnValue === 'F') {
      return false
    }

  }

  // getOSCODE() {
  //   this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;


  // }

  listenToKbVersion() {
    this.kbService.newKb
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((newKb) => {
        this.logger.log('[BOTS-SIDEBAR] - are new KB ', newKb)
        this.ARE_NEW_KB = newKb;
      })
  }

 




  getCurrentRoute() {
    this.route = this.router.url
    if (this.route.indexOf('/bots/my-chatbots/all') !== -1) {
      this.BOTS_MYCHATBOT_ALL_ROUTE_IS_ACTIVE = true
      // this.logger.log('[BOTS-SIDEBAR] - BOTS_MYCHATBOT_ALL_ROUTE_IS_ACTIVE  ', this.BOTS_MYCHATBOT_ALL_ROUTE_IS_ACTIVE)
    } else {
      this.BOTS_MYCHATBOT_ALL_ROUTE_IS_ACTIVE = false
      // this.logger.log('[BOTS-SIDEBAR] - BOTS_MYCHATBOT_ALL_ROUTE_IS_ACTIVE  ', this.BOTS_MYCHATBOT_ALL_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/bots/my-chatbots/increase-sales') !== -1) {
      this.BOTS_MYCHATBOT_INCREASE_SALES_ROUTE_IS_ACTIVE = true
      // this.logger.log('[BOTS-SIDEBAR] - BOTS_MYCHATBOT_INCREASE_SALES_ROUTE_IS_ACTIVE  ', this.BOTS_MYCHATBOT_INCREASE_SALES_ROUTE_IS_ACTIVE)
    } else {
      this.BOTS_MYCHATBOT_INCREASE_SALES_ROUTE_IS_ACTIVE = false
      // this.logger.log('[BOTS-SIDEBAR] - BOTS_MYCHATBOT_INCREASE_SALES_ROUTE_IS_ACTIVE  ', this.BOTS_MYCHATBOT_INCREASE_SALES_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/bots/my-chatbots/customer-satisfaction') !== -1) {
      this.BOTS_MYCHATBOT_CUSTOMER_SATISFACTION_ROUTE_IS_ACTIVE = true
      // this.logger.log('[BOTS-SIDEBAR] - BOTS_MYCHATBOT_CUSTOMER_SATISFACTION_ROUTE_IS_ACTIVE  ', this.BOTS_MYCHATBOT_CUSTOMER_SATISFACTION_ROUTE_IS_ACTIVE)
    } else {
      this.BOTS_MYCHATBOT_CUSTOMER_SATISFACTION_ROUTE_IS_ACTIVE = false
      // this.logger.log('[BOTS-SIDEBAR] - BOTS_MYCHATBOT_CUSTOMER_SATISFACTION_ROUTE_IS_ACTIVE  ', this.BOTS_MYCHATBOT_CUSTOMER_SATISFACTION_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/bots/templates/all') !== -1) {
      this.BOTS_ALL_TEMPALTES_ROUTE_IS_ACTIVE = true
      // this.logger.log('[BOTS-SIDEBAR] - BOTS_ALL_TEMPALTES_ROUTE_IS_ACTIVE  ', this.BOTS_ALL_TEMPALTES_ROUTE_IS_ACTIVE)
    } else {
      this.BOTS_ALL_TEMPALTES_ROUTE_IS_ACTIVE = false
      // this.logger.log('[BOTS-SIDEBAR] - BOTS_ALL_TEMPALTES_ROUTE_IS_ACTIVE  ', this.BOTS_ALL_TEMPALTES_ROUTE_IS_ACTIVE)
    }
    if (this.route.indexOf('/bots/templates/customer-satisfaction') !== -1) {
      this.BOTS_CUSTOMER_SATISFACTION_TEMPALTES_ROUTE_IS_ACTIVE = true
      // this.logger.log('[BOTS-SIDEBAR] - BOTS_CUSTOMER_SATISFACTION_TEMPALTES_ROUTE_IS_ACTIVE  ', this.BOTS_CUSTOMER_SATISFACTION_TEMPALTES_ROUTE_IS_ACTIVE)
    } else {
      this.BOTS_CUSTOMER_SATISFACTION_TEMPALTES_ROUTE_IS_ACTIVE = false
      // this.logger.log('[BOTS-SIDEBAR] - BOTS_CUSTOMER_SATISFACTION_TEMPALTES_ROUTE_IS_ACTIVE  ', this.BOTS_CUSTOMER_SATISFACTION_TEMPALTES_ROUTE_IS_ACTIVE)
    }
    if (this.route.indexOf('/bots/templates/increase-sales') !== -1) {
      this.BOTS_INCREASE_SALES_TEMPALTES_ROUTE_IS_ACTIVE = true
      // this.logger.log('[BOTS-SIDEBAR] - BOTS_INCREASE_SALES_ROUTE_IS_ACTIVE  ', this.BOTS_INCREASE_SALES_TEMPALTES_ROUTE_IS_ACTIVE)
    } else {
      this.BOTS_INCREASE_SALES_TEMPALTES_ROUTE_IS_ACTIVE = false
      // this.logger.log('[BOTS-SIDEBAR] - BOTS_INCREASE_SALES_TEMPALTES_ROUTE_IS_ACTIVE  ', this.BOTS_INCREASE_SALES_TEMPALTES_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/bots/templates/community') !== -1) {
      this.BOTS_COMMUNITY_TEMPLATES_ROUTE_IS_ACTIVE = true
      // this.logger.log('[BOTS-SIDEBAR] - BOTS_INCREASE_SALES_ROUTE_IS_ACTIVE  ', this.BOTS_INCREASE_SALES_TEMPALTES_ROUTE_IS_ACTIVE)
    } else {
      this.BOTS_COMMUNITY_TEMPLATES_ROUTE_IS_ACTIVE = false
      // this.logger.log('[BOTS-SIDEBAR] - BOTS_INCREASE_SALES_TEMPALTES_ROUTE_IS_ACTIVE  ', this.BOTS_INCREASE_SALES_TEMPALTES_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/knowledge-bases') !== -1) {
      this.KNOWLEDGE_BASE_ROUTE_IS_ACTIVE = true
      // this.logger.log('[BOTS-SIDEBAR] - KNOWLEDGE_BASE_ROUTE_IS_ACTIVE  ', this.KNOWLEDGE_BASE_ROUTE_IS_ACTIVE)
    } else {
      this.KNOWLEDGE_BASE_ROUTE_IS_ACTIVE = false
      // this.logger.log('[BOTS-SIDEBAR] - KNOWLEDGE_BASE_ROUTE_IS_ACTIVE  ', this.KNOWLEDGE_BASE_ROUTE_IS_ACTIVE)
    }

  }




  goToBotAllTemplates() {
    this.router.navigate(['project/' + this.project._id + '/bots/templates/all']);
  }

  goToBotCommunityTemplates() {
    this.router.navigate(['project/' + this.project._id + '/bots/templates/community']);
  }

  goToBotIncreaseSalesTemplates() {
    this.router.navigate(['project/' + this.project._id + '/bots/templates/increase-sales']);
  }

  goToBotCustomerSatisfactionTemplates() {
    this.router.navigate(['project/' + this.project._id + '/bots/templates/customer-satisfaction']);
  }

  goToOtherMyChatbotOther() {
    this.router.navigate(['project/' + this.project._id + '/bots/my-chatbots/all']);
  }

  goToBotCustomerSatisfactionBots() {
    this.router.navigate(['project/' + this.project._id + '/bots/my-chatbots/customer-satisfaction']);
  }

  goToBotIncreaseSalesBots() {
    this.router.navigate(['project/' + this.project._id + '/bots/my-chatbots/increase-sales']);
  }

  goToNewKnowledgeBases() {
    if (this.kbNameSpaceid !== '') {
      this.router.navigate(['project/' + this.project._id + '/knowledge-bases/' + this.kbNameSpaceid]);
    } else {
      this.router.navigate(['project/' + this.project._id + '/knowledge-bases/0']);
    }
  }

}
