import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { FaqKbService } from '../../services/faq-kb.service';
import { MatDialog } from '@angular/material/dialog';
import { TemplateDetailComponent } from './template-detail/template-detail.component';
import { Router } from '@angular/router';
import { AppConfigService } from 'app/services/app-config.service';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { UsersService } from 'app/services/users.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { ChatbotModalComponent } from '../bots-list/chatbot-modal/chatbot-modal.component';
import { NotifyService } from 'app/core/notify.service';
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component';
import { TranslateService } from '@ngx-translate/core';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';



@Component({
  selector: 'appdashboard-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss']
})

// interface certifiedTags {
//   name: string;
//   [others: string]: any;
// }

export class TemplatesComponent extends PricingBaseComponent implements OnInit {
  private unsubscribe$: Subject<any> = new Subject<any>();
  isChromeVerGreaterThan100: boolean;
  templates: Array<any>
  communityTemplates: Array<any>;
  certfifiedTemplates: Array<any>;
  allTemplatesCount: number;
  allCommunityTemplatesCount: number;
  kbCount: number;

  customerSatisfactionTemplates: Array<any>
  customerSatisfactionTemplatesCount: number;

  increaseSalesTemplates: Array<any>
  increaseSalesTemplatesCount: number;

  project: any;
  projectId: string
  route: string
  showSpinner: boolean
  myChatbotOtherCount: number;
  customerSatisfactionBotsCount: number;
  increaseSalesBotsCount: number;
  COMMUNITY_TEMPLATE: boolean = false;
  CERTIFIED_TEMPLATE: boolean = false;

  storageBucket: string;
  baseUrl: string;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;
  valueToSearch: string;
  public THERE_ARE_RESULTS: boolean = true;
  chatBotCount: any;
  public USER_ROLE: string;
  learnMoreAboutDefaultRoles: string;
  agentsCannotManageChatbots: string;
  isVisiblePAY: boolean;
  public_Key: string;
  IS_OPEN_SETTINGS_SIDEBAR: boolean = true;
  pageTitle: string;
 
  constructor(
    private auth: AuthService,
    private faqKbService: FaqKbService,
    private logger: LoggerService,
    public dialog: MatDialog,
    private router: Router,
    public appConfigService: AppConfigService,
    public prjctPlanService: ProjectPlanService,
    public notify: NotifyService,
    public usersService: UsersService,
    private translate: TranslateService,
    private kbService: KnowledgeBaseService,
  ) { 
    super(prjctPlanService, notify);
  }



  ngOnInit(): void {
    this.getBrowserVersion();
    this.getTemplates()
    this.getCommunityTemplates()
    this.getCurrentProject()
    this.getAllNamespaces()
    // this.getAllFaqKbByProjectId();
    this.getFaqKbByProjectId()
    this.getRoutes();
    this.getProfileImageStorage();
    this.getProjectPlan();
    this.getUserRole();
    this.getOSCODE()
    this.getCurreURL()
  }


  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getCurreURL() {
    const currentUrl = this.router.url;
    this.logger.log('[BOTS-TEMPLATES] - current URL »»» ', currentUrl)
    const currentUrlLastSegment = currentUrl.substring(currentUrl.lastIndexOf('/') + 1);
    this.logger.log('[BOTS-TEMPLATES] - current URL last segment ',  currentUrlLastSegment);
    if (currentUrlLastSegment === 'all') {
      this.pageTitle = "All templates"
    } else if (currentUrlLastSegment === 'community') {
      this.pageTitle = "Community templates"
    } else if (currentUrlLastSegment === 'increase-sales') {
      this.pageTitle = "Increase sales templates "
    } else if (currentUrlLastSegment === 'customer-satisfaction') {
      this.pageTitle = "Customer Satisfaction templates "
    }
  }




  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    // this.logger.log('AppConfigService getAppConfig (BOT LIST) public_Key', this.public_Key);
    let keys = this.public_Key.split("-");
    // this.logger.log('PUBLIC-KEY (BOT LIST) keys', keys)
    keys.forEach(key => {

      if (key.includes("PAY")) {

        let pay = key.split(":");

        if (pay[1] === "F") {
          this.isVisiblePAY = false;
        } else {
          this.isVisiblePAY = true;
        }
      }
    })

    if (!this.public_Key.includes("PAY")) {
      this.isVisiblePAY = false;
    }

  }

  getUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((userRole) => {
        this.logger.log('[BOTS-TEMPLATES] - SUBSCRIPTION TO USER ROLE »»» ', userRole)
        this.USER_ROLE = userRole;
      })
  }

  getProfileImageStorage() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[BOTS-TEMPLATES] IMAGE STORAGE ', this.storageBucket, 'usecase Firebase')
    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.baseUrl = this.appConfigService.getConfig().baseImageUrl;

      // this.logger.log('[BOTS-TEMPLATES] IMAGE STORAGE ', this.baseUrl, 'usecase native')
    }
  }

  getRoutes() {
    this.route = this.router.url
    if (this.route.indexOf('bots/templates/community') !== -1) {
      this.COMMUNITY_TEMPLATE = true
      this.CERTIFIED_TEMPLATE = false
      this.logger.log('[BOTS-TEMPLATES] COMMUNITY TEMPLATES ', this.COMMUNITY_TEMPLATE)
      this.logger.log('[BOTS-TEMPLATES] CERTIFIED TEMPLATES ', this.CERTIFIED_TEMPLATE)
    } else if ((this.route.indexOf('bots/templates/all') !== -1 ) || (this.route.indexOf('bots/templates/customer-satisfaction') !== -1 ) || (this.route.indexOf('bots/templates/increase-sales') !== -1 )) {
      this.CERTIFIED_TEMPLATE = true
      this.COMMUNITY_TEMPLATE = false
      this.logger.log('[BOTS-TEMPLATES] CERTIFIED TEMPLATES ', this.CERTIFIED_TEMPLATE)
      this.logger.log('[BOTS-TEMPLATES] COMMUNITY TEMPLATES ', this.COMMUNITY_TEMPLATE)
    }
  }


  // Lead-gen ->  #a16300
  // Pre-sale -> #00699e
  //  Support -> #25833e
  // Self-serve -> #0049bd
  // Internal-Processes -> #a613ec

  // certified: true
  // mainCategory
  // bigImage
  // templateFeatures

  // nameOnSite

  // certifiedTags
  // "certifiedTags": [{ "color": "#00699e", "name": "Pre-Sale" }, { "color": "#a16300", "name": "Lead-Gen" }],

  getCurrentProject() {
    // this.project = this.auth.project_bs.value;
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.project = project;
        this.projectId = project._id;
      }
    });
  }

  openDialog(template) {
    this.logger.log('openDialog TemplateDetailComponent')
    const dialogRef = this.dialog.open(TemplateDetailComponent, {
      data: {
        template: template,
        projectId: this.projectId,
        callingPage: "Templates",
        projectProfile: this.prjct_profile_name
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      // this.logger.log(`Dialog result: ${result}`);
    });
  }

  getFaqKbByProjectId() {
    this.faqKbService.getFaqKbByProjectId().subscribe((faqKb: any) => {
      if (faqKb) {
        this.chatBotCount = faqKb.length
        this.myChatbotOtherCount = faqKb.length
        this.logger.log('[BOTS-TEMPLATES] - GET BOTS BY PROJECT ID - myChatbotOtherCount',  this.myChatbotOtherCount);
        this.logger.log('[BOTS-TEMPLATES] - GET BOTS BY PROJECT ID - faqKb',  faqKb);
      }

      const customerSatisfactionBots = faqKb.filter((obj) => {
        return obj.mainCategory === "Customer Satisfaction"
      });
      this.logger.log('[BOTS-TEMPLATES]  - Customer Satisfaction BOTS', customerSatisfactionBots);
      if (customerSatisfactionBots) {
        this.customerSatisfactionBotsCount = customerSatisfactionBots.length;
        this.logger.log('[BOTS-TEMPLATES]  - Customer Satisfaction COUNT', this.customerSatisfactionTemplatesCount);
      }

      const increaseSalesBots = faqKb.filter((obj) => {
        return obj.mainCategory === "Increase Sales"
      });
      this.logger.log('[BOTS-TEMPLATES]  - Increase Sales BOTS ', increaseSalesBots);
      if (increaseSalesBots) {
        this.increaseSalesBotsCount = increaseSalesBots.length;
        this.logger.log('[BOTS-TEMPLATES] - Increase Sales BOTS COUNT', this.increaseSalesTemplatesCount);
      }


    }, (error) => {
      this.logger.error('[BOTS-TEMPLATES] GET BOTS ERROR ', error);

    }, () => {
      this.logger.log('[BOTS-TEMPLATES] GET BOTS COMPLETE');

    });

  }



  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    })
  }

  getAllNamespaces() {
    this.kbService.getAllNamespaces().subscribe((res: any) => {
      if (res) {
        this.kbCount = res.length
        this.logger.log('[BOTS-TEMPLATES] - GET ALL NAMESPACES', res);
        
      }
    }, (error) => {
      this.logger.error('[BOTS-TEMPLATES]  GET GET ALL NAMESPACES ERROR ', error);

    }, () => {
      this.logger.log('[BOTS-TEMPLATES]  GET ALL NAMESPACES * COMPLETE *');
      
    });
  }


  getCommunityTemplates() {
    this.showSpinner = true;
    this.faqKbService.getCommunityTemplates().subscribe((res: any) => {

      if (res) {
        this.communityTemplates = res
        this.logger.log('[BOTS-TEMPLATES] - GET COMMUNITY TEMPLATES', this.communityTemplates);
        this.allCommunityTemplatesCount = this.communityTemplates.length;
        this.logger.log('[BOTS-TEMPLATES] - GET COMMUNITY TEMPLATES COUNT', this.allCommunityTemplatesCount);

        // this.getUserCommunityProfile(this.communityTemplates)


        // let stripHere = 115;
        // this.communityTemplates.forEach(communityTemplate => {
        //   // this.logger.log('[BOTS-TEMPLATES] communityTemplate', communityTemplate);
        //   if (communityTemplate['description']) {
        //     communityTemplate['shortDescription'] = communityTemplate['description'].substring(0, stripHere) + '...';
        //   }
        // });

        this.route = this.router.url
        if (this.route.indexOf('bots/templates/community') !== -1) {
          this.templates = this.communityTemplates
          this.logger.log('[BOTS-TEMPLATES] ROUTE templates/community');
        }

        // this.generateTagsBackground(this.templates)
      }

    }, (error) => {
      this.logger.error('[BOTS-TEMPLATES] GET TEMPLATES ERROR ', error);
      this.showSpinner = false;
    }, () => {
      this.logger.log('[BOTS-TEMPLATES] GET TEMPLATES COMPLETE');
      this.showSpinner = false;
      // this.generateTagsBackground(this.templates)
    });

  }

  getUserCommunityProfile(communityTemplates) {
    this.logger.log('[BOTS-TEMPLATES] USER CMNTY PROFILE ',communityTemplates);
    communityTemplates.forEach(tmplt => {
      this.logger.log('BOTS-TEMPLATES] created by  ', tmplt.createdBy)

      this.usersService.getCurrentUserCommunityProfile(tmplt.createdBy)
        .subscribe((userCmntyProfile: any) => {
          let createdByFullName = ""
          if (userCmntyProfile.firstname && userCmntyProfile.lastname) {
            createdByFullName = userCmntyProfile.firstname + ' ' + userCmntyProfile.lastname
            this.communityTemplates['createdByFullName'] = createdByFullName
          } else if (userCmntyProfile.firstname && !userCmntyProfile.lastname) {
            createdByFullName = userCmntyProfile.firstname
            this.communityTemplates['createdByFullName'] = createdByFullName
          }

          this.logger.log('[BOTS-TEMPLATES] USER CMNTY PROFILE >  createdBy', createdByFullName);
          // this.logger.log('[BOTS-TEMPLATES] USER CMNTY PROFILE >  communityTemplates', this.communityTemplates);
        })
    });
  }

  getTemplates() {
    this.showSpinner = true;
    this.route = this.router.url
    this.logger.log('[BOTS-TEMPLATES] - GET ALL TEMPLATES route', this.route);
    this.faqKbService.getTemplates().subscribe((res: any) => {

      if (res) {
        this.certfifiedTemplates = res
        this.logger.log('[BOTS-TEMPLATES] - GET ALL TEMPLATES ', this.certfifiedTemplates);

        this.doShortDescription(this.certfifiedTemplates)
        // this.templates = res
        // this.logger.log('[BOTS-TEMPLATES] - GET ALL TEMPLATES', this.templates);
        // this.allTemplatesCount = this.templates.length;
        this.allTemplatesCount = this.certfifiedTemplates.length;
        this.logger.log('[BOTS-TEMPLATES] - GET ALL TEMPLATES COUNT', this.allTemplatesCount);
        if (this.route.indexOf('bots/templates/all') !== -1) {
          this.templates = this.certfifiedTemplates
        }

        // ---------------------------------------------------------------------
        // Customer Satisfaction templates
        // ---------------------------------------------------------------------
        this.customerSatisfactionTemplates = this.certfifiedTemplates.filter((obj) => {
          return obj.mainCategory === "Customer Satisfaction"
        });
        this.logger.log('[BOTS-TEMPLATES] - Customer Satisfaction TEMPLATES', this.customerSatisfactionTemplates);
        if (this.customerSatisfactionTemplates) {
          this.customerSatisfactionTemplatesCount = this.customerSatisfactionTemplates.length;
          this.logger.log('[BOTS-TEMPLATES] - Customer Satisfaction COUNT', this.customerSatisfactionTemplatesCount);
          // this.doShortDescription(this.customerSatisfactionTemplates)
        }



        // ---------------------------------------------------------------------
        // Customer Increase Sales
        // ---------------------------------------------------------------------
        this.increaseSalesTemplates = this.certfifiedTemplates.filter((obj) => {
          return obj.mainCategory === "Increase Sales"
        });
        this.logger.log('[BOTS-TEMPLATES] - Increase Sales TEMPLATES', this.increaseSalesTemplates);
        if (this.increaseSalesTemplates) {
          this.increaseSalesTemplatesCount = this.increaseSalesTemplates.length;
          this.logger.log('[BOTS-TEMPLATES] - Increase Sales COUNT', this.increaseSalesTemplatesCount);
          // this.doShortDescription(this.increaseSalesTemplates)
        }

        this.route = this.router.url
        // if (this.route.indexOf('bots/templates/all') !== -1) {
        //   this.templates = this.templates 
        //   this.logger.log('[BOTS-TEMPLATES] ROUTE templates/all');
        //   this.allTemplatesCount = this.templates.length;
        //   this.logger.log('[BOTS-TEMPLATES] - GET ALL TEMPLATES COUNT', this.allTemplatesCount);
        // } else 
        if (this.route.indexOf('bots/templates/customer-satisfaction') !== -1) {
          this.templates = this.customerSatisfactionTemplates
          this.logger.log('[BOTS-TEMPLATES] ROUTE templates/customer-satisfaction templates ', this.templates);
        } else if (this.route.indexOf('bots/templates/increase-sales') !== -1) {

          this.templates = this.increaseSalesTemplates
          this.logger.log('[BOTS-TEMPLATES] ROUTE templates/increase-sales templates ', this.templates);
        }

        this.logger.log('[BOTS-TEMPLATES] - GET TEMPLATES - All TEMPLATES COUNT ', this.allTemplatesCount);
        if (this.templates) {
          this.generateTagsBackground(this.templates)
        }
      }

    }, (error) => {
      this.logger.error('[BOTS-TEMPLATES] GET TEMPLATES ERROR ', error);
      this.showSpinner = false;
    }, () => {
      this.logger.log('[BOTS-TEMPLATES] GET TEMPLATES COMPLETE');
      this.showSpinner = false;
      // this.generateTagsBackground(this.templates)
    });
  }

  doShortDescription(templates) {

    let stripHere = 115;
    templates.forEach(template => {
      this.logger.log('[BOTS-TEMPLATES] startChatBot', template);
      if ( template['description']) { 
        template['shortDescription'] = template['description'].substring(0, stripHere) + '...';
      }
    });
  }



  generateTagsBackground(templates) {
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
          } else if (tag.color === "#a613ec" || tag.color === "#A613EC") {
            tagbckgnd = 'rgba(166, 19, 236, 0.2)'
          } else if (tag.color !== "#a16300" && tag.color !== "#A16300" && tag.color !== "#00699E" && tag.color !== "#00699e" && tag.color !== "#25833e" && tag.color !== "#25833E" && tag.color !== "#0049bd" && tag.color !== "#0049BD") {

            tagbckgnd = this.hexToRgba(tag.color)
            // this.logger.log('generateTagsBackground tagbckgnd ', tagbckgnd)
          }

          // let b = {background : tagbckgnd}

          tag.background = tagbckgnd
          // template.certifiedTags.find(t => t.color === t.background).background = tagbckgnd;

          // if (tag.color === tag.background) {
          //   // template.certifiedTags.push({ 'background': `${tagbckgnd}` })
          //   template.certifiedTags['background']=  tagbckgnd
          // }
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




  createBlankTilebot() {
    // this.router.navigate(['project/' + this.project._id + '/bots/create/tilebot/blank']);
    // this.router.navigate(['project/' + this.project._id + '/chatbot/create']);
    this.logger.log('[BOTS-TEMPLATES] createBlankTilebot chatBotCount ', this.chatBotCount, ' chatBotLimit ', this.chatBotLimit, ' USER_ROLE ', this.USER_ROLE)
    if (this.USER_ROLE !== 'agent') {
      if (this.chatBotLimit || this.chatBotLimit === 0) {
        if (this.chatBotCount < this.chatBotLimit) {
          this.logger.log('[BOTS-TEMPLATES] USECASE  chatBotCount < chatBotLimit: RUN NAVIGATE')
          this.router.navigate(['project/' + this.project._id + '/bots/create/tilebot/blank']);

        } else if (this.chatBotCount >= this.chatBotLimit) {
          this.logger.log('[BOTS-TEMPLATES] USECASE  chatBotCount >= chatBotLimit DISPLAY MODAL')
          this.presentDialogReachedChatbotLimit()
        }
      } else if (this.chatBotLimit === null) {
        this.logger.log('[BOTS-TEMPLATES] USECASE  NO chatBotLimit: RUN NAVIGATE')
        this.router.navigate(['project/' + this.project._id + '/bots/create/tilebot/blank']);
      }
    } if (this.USER_ROLE === 'agent') {
      this.presentModalAgentCannotManageChatbot()
    }

  }

  presentModalAgentCannotManageChatbot() {
    this.notify.presentModalAgentCannotManageChatbot(this.agentsCannotManageChatbots, this.learnMoreAboutDefaultRoles)
  }

  presentDialogReachedChatbotLimit() {
    this.logger.log('[BOTS-TEMPLATES] openDialog presentDialogReachedChatbotLimit prjct_profile_name ', this.prjct_profile_name)
    const dialogRef = this.dialog.open(ChatbotModalComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      data: {
        projectProfile: this.prjct_profile_name,
        subscriptionIsActive: this.subscription_is_active,
        prjctProfileType: this.prjct_profile_type,
        trialExpired: this.trial_expired,
        chatBotLimit: this.chatBotLimit
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      this.logger.log(`Dialog result: ${result}`);
    });
  }

  goToCommunityTemplateDetail(templateid) {
    this.logger.log('[BOTS-TEMPLATES]  GO TO COMMUNITY TEMPLATE DTLS -  templateid ', templateid);
    this.router.navigate(['project/' + this.project._id + '/template-details/' + templateid]);
  }

  goToExternalCommunity() {
   const url = "https://tiledesk.com/community/"
   window.open(url, '_blank');
  }



  searchInCommunityTemplates() {
    this.logger.log('[BOTS-TEMPLATES]  SEARCH IN COMMUNITY TEMPLATE - value to search ', this.valueToSearch);
    this.faqKbService.searchInCommunityTemplates(this.valueToSearch).subscribe((searchedtemplates: any) => {
      if (searchedtemplates) {
       this.templates = searchedtemplates
       
       if (searchedtemplates.length === 0) {
         this.THERE_ARE_RESULTS = false;

       } else {
        this.THERE_ARE_RESULTS = true;
       }
      }
      
      this.logger.log('[BOTS-TEMPLATES]  SEARCH IN COMMUNITY TEMPLATE - RES  ', searchedtemplates);
    }, (error) => {
      this.logger.error('[BOTS-TEMPLATES] SEARCH IN COMMUNITY TEMPLATE - ERROR ', error);

    }, () => {
      this.logger.log('[BOTS-TEMPLATES] SEARCH IN COMMUNITY TEMPLATE * COMPLETE * ');

    });
  }

  onChangeValueToSearch(valueToSearch) {
    this.logger.log('[BOTS-TEMPLATES] onChangeValueToSearch  valueToSearch ', valueToSearch);
    if (valueToSearch === '') {
      // this.getCommunityTemplates()
     this.templates = this.communityTemplates
    }
   
  }

  clearSearchInCommunityTemplates() {
    this.valueToSearch = ''
    this.templates = this.communityTemplates
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
