import { AfterViewInit, Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { HomeCreateChatbotModalComponent } from 'app/home-components/home-create-chatbot/home-create-chatbot-modal/home-create-chatbot-modal.component';
import { AppConfigService } from 'app/services/app-config.service';
import { BotLocalDbService } from 'app/services/bot-local-db.service';
import { BrandService } from 'app/services/brand.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { ProjectService } from 'app/services/project.service';
import { goToCDSVersion } from 'app/utils/util';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'cnp-templates',
  templateUrl: './cnp-templates.component.html',
  styleUrls: ['./cnp-templates.component.scss']
})
export class CnpTemplatesComponent implements OnInit, AfterViewInit, OnChanges {
  @Output() prevPage = new EventEmitter();
  @Output() nextPage = new EventEmitter();
  @Output() goToNext = new EventEmitter();
  @Output() createProjectFromTemplates = new EventEmitter();
  @Input() segmentAttributes: any;
  @Input() updatedProject: any;

  displayLogoWithText: boolean = true;
  companyLogoBlack_Url: string;
  companyLogoNoText_Url: string;

  selectedIndex: number;
  template: any;
  t_paramsUserRole: any;
  templateid: string;
  templatename: string;
  botid: string;
  botName: string;
  projectid: string;

  botDefaultSelectedLang: string = 'English - en';
  botDefaultSelectedLangCode: string = 'en'
  language: string;
  chatbotName: string
  newBot_Id: string
  isMobile: boolean = true;
  templates: Array<any>;
  customerSatisfactionTemplates: Array<any>
  increaseSalesTemplates: Array<any>
  DISPLAY_INCREASE_TMPLT: boolean
  videoURL: any;
  DIPLAY_CUSTOM_SUBTITLE: boolean;
  isLoading= true;

  templtId = ['651a87648cb2c70013d80d8b', '651e66be6717f500135f41b9', '6529582c23034f0013ee1af6', '651ecc5749598e0013305876', '651fc9ef8c10e70013b6e240', '651ad6c1bfdf310013ca90d7']
  videoSource = [
    { _id: '651a87648cb2c70013d80d8b', source: 'https://videos.files.wordpress.com/TOZV61Dq/demo-booking-bot.mp4' },
    { _id: '651e66be6717f500135f41b9', source: 'https://videos.files.wordpress.com/pujds7Bw/product-cards.mp4' },
    { _id: '6529582c23034f0013ee1af6', source: 'https://videos.files.wordpress.com/miWQ0mBX/lead-gen.mp4' },
    { _id: '651ecc5749598e0013305876', source: 'https://videos.files.wordpress.com/VJfeGCBw/priority-gpt-bot.mp4' },
    { _id: '651fc9ef8c10e70013b6e240', source: 'https://videos.files.wordpress.com/f1mIA27P/gpt-powered-kb.mp4' },
    { _id: '651ad6c1bfdf310013ca90d7', source: 'https://videos.files.wordpress.com/o3etQXZJ/customer-service.mp4' },
  ]

  constructor(
    public brandService: BrandService,
    private logger: LoggerService,
    private faqKbService: FaqKbService,
    public auth: AuthService,
    private projectService: ProjectService,
    private botLocalDbService: BotLocalDbService,
    public appConfigService: AppConfigService,
    private router: Router,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private translate: TranslateService,
  ) {

    const brand = brandService.getBrand();

    this.companyLogoBlack_Url = brand['company_logo_black__url'];
    this.companyLogoNoText_Url = brand['company_logo_no_text__url'];
  }

  ngOnInit(): void {
    this.onInitWindowHeight();
    // this.getTemplates();
    this.selectedIndex = 0;
    // this.getCurrentProject()
    this.detectMobile()
  }

  ngAfterViewInit(): void {
    // console.log('[CNP-TEMPLATES] HELLO !!! ');
    this.createProjectFromTemplates.emit()
  }

  ngOnChanges(changes: SimpleChanges): void {

    // console.log('[CNP-TEMPLATES] - updatedProject ', this.updatedProject)
    if (this.updatedProject && this.updatedProject.attributes && this.updatedProject.attributes.userPreferences) {
      // console.log('[CNP-TEMPLATES] - updatedProject > attributes > userPreferences', this.updatedProject.attributes.userPreferences)
      const userPreferences = this.updatedProject.attributes.userPreferences
      this.projectid = this.updatedProject._id
      // console.log('[CNP-TEMPLATES] - updatedProject > projectid', this.projectid)

      if (userPreferences.user_role === 'developer' || userPreferences.user_role === 'conversation_designer' || userPreferences.user_role === 'no_code_builder' || userPreferences.user_role === 'business_stakeholder') {
        this.DIPLAY_CUSTOM_SUBTITLE = false;
        const userRole = this.translate.instant(userPreferences.user_role)

        // console.log('[CNP-TEMPLATES] - userRole', userRole)
        // console.log('[CNP-TEMPLATES] - DIPLAY_CUSTOM_SUBTITLE ', this.DIPLAY_CUSTOM_SUBTITLE)

        this.t_paramsUserRole = { selected_role: userRole }
      } else if (userPreferences.user_role === 'other') {
        this.DIPLAY_CUSTOM_SUBTITLE = true;
        // console.log('[CNP-TEMPLATES] - DIPLAY_CUSTOM_SUBTITLE ', this.DIPLAY_CUSTOM_SUBTITLE)
      }
      if (userPreferences && userPreferences.use_case && userPreferences.use_case === "solve_customer_problems") {
        this.DISPLAY_INCREASE_TMPLT = false
        this.getTemplates('Customer Satisfaction');
      } else {
        this.DISPLAY_INCREASE_TMPLT = true
        this.getTemplates('Increase Sales');
      }
    }
  }

  // getCurrentProject() {
  //   this.auth.project_bs.subscribe((project) => {
  //     if (project) {
  //       // this.projectId = project._id
  //       console.log('[CNP-TEMPLATES] - project ', project)
  //       this.getProjectById(project._id);
  //     }
  //   });
  // }

  // getProjectById(projectId) {
  //   this.projectService.getProjectById(projectId).subscribe((project: any) => {
  //     console.log('[CNP-TEMPLATES] - GET PROJECT BY ID - PROJECT OBJECT: ', project);

  //    }, (error) => {
  //     this.logger.error('[CNP-TEMPLATES] - GET PROJECT BY ID - ERROR ', error);
  //   }, () => {
  //     this.logger.log('[CNP-TEMPLATES] - GET PROJECT BY ID - COMPLETE ');
  //   });

  // }



  onInitWindowHeight(): any {
    this.logger.log('[CNP-TEMPLATES] ACTUAL WIDTH ', window.innerWidth);

    if (window.innerWidth < 452) {
      if (window && window['Tiledesk']) {
        window['Tiledesk']('hide')
      }
    }
    if (window.innerWidth < 371) {
      this.displayLogoWithText = false
    } else {
      this.displayLogoWithText = true
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.logger.log('[CNP-TEMPLATES] NEW WIDTH ', window.innerWidth);
    if (window.innerWidth < 452) {
      if (window && window['Tiledesk']) {
        window['Tiledesk']('hide')
      }
    }

    if (window.innerWidth < 371) {
      this.displayLogoWithText = false
    } else {
      this.displayLogoWithText = true
    }
  }

  getTemplates(selectedUseCase) {

    // this.showSpinner = true;
    // this.route = this.router.url
    // this.logger.log('[BOTS-TEMPLATES] - GET ALL TEMPLATES route', this.route);
    this.faqKbService.getTemplates().subscribe((res: any) => {

      if (res) {
        // this.certfifiedTemplates = res
        // console.log('[CNP-TEMPLATES] - GET ALL TEMPLATES RES', res);
        if (res) {
          // this.templates = res.slice(0, 5);

          // this.templates = res.filter((tmplt: any) => {
          //  tmplt._id ==='651a87648cb2c70013d80d8b' || 
          //     tmplt._id === '651e66be6717f500135f41b9' ||
          //     tmplt._id === '6529582c23034f0013ee1af6' ||
          //     tmplt._id === '651ecc5749598e0013305876' ||
          //     tmplt._id === '651fc9ef8c10e70013b6e240' ||
          //     tmplt._id === '651ad6c1bfdf310013ca90d7' 
          // });

          const filterdres = res.filter((item) => {
            return this.templtId.includes(item._id)
          });

          // console.log('[CNP-TEMPLATES] - filterdres ', filterdres);

          this.templates = filterdres.filter((obj) => {
            return obj.mainCategory === selectedUseCase
          });

          // console.log('[CNP-TEMPLATES] - FILTERED TEMPLATES CATEGORY: ', selectedUseCase, 'TEMPLATES:  ', this.templates);

          // for (let i = 0; i < this.templates.length; i++) {
          //   for (let j = 0; j < this.videoSource.length; j++) { 
          //     if (this.templates[i]['_id'] === this.videoSource[j]['_id']) {
          //       this.templates[i]['videoURL'] = this.videoSource[j]['source']
          //     }
          //   }
          //  }

          // this.customerSatisfactionTemplates = this.templates.filter((obj) => {
          //   return obj.mainCategory === "Customer Satisfaction"
          // });
          // console.log('[CNP-TEMPLATES] - GET ALL TEMPLATES customerSatisfactionTemplates ', this.customerSatisfactionTemplates);

          // this.increaseSalesTemplates = this.templates.filter((obj) => {
          //   return obj.mainCategory === "Increase Sales"
          // });
          // console.log('[CNP-TEMPLATES] - GET ALL TEMPLATES increaseSalesTemplates ', this.increaseSalesTemplates);

          this.template = this.templates[0];
          this.templatename = this.template.name
          this.templateid = this.template._id
          // this.videoURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.template.videoSource)

          // console.log('[CNP-TEMPLATES] first tempaltes videoURL ', this.videoURL)
          // console.log('[CNP-TEMPLATES] first tempaltes selected ', this.template)
          // console.log('[CNP-TEMPLATES] first tempaltes selected templateid', this.template._id)
        }
        // console.log('[CNP-TEMPLATES] - GET ALL TEMPLATES templates', this.templates);

      }

    }, (error) => {
      this.logger.error('[CNP-TEMPLATES] GET TEMPLATES ERROR ', error);
    
      this.isLoading = false
    }, () => {
      this.logger.log('[CNP-TEMPLATES] GET TEMPLATES COMPLETE');
      this.isLoading = false
   
      // this.generateTagsBackground(this.templates)
    });
  }

  selectedTemplate(i, templateid) {
    this.selectedIndex = i;
    // console.log('[CNP-TEMPLATES] selectedTemplate selectedIndex ', this.selectedIndex);

    this.templateid = templateid
    // console.log('[CNP-TEMPLATES] selectedTemplate templateid ', this.templateid);

    const template = this.templates.filter((el: any) => {
      return el._id === templateid
    });
    this.template = template[0]
    this.templatename = this.template.name
    // this.videoURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.template.videoSource)
    // console.log('[CNP-TEMPLATES] selectedTemplate template ', this.template);
    // console.log('[CNP-TEMPLATES] selectedTemplate videoURL ', this.videoURL);
  }

  forkTemplate() {
    this.faqKbService.installTemplate(this.templateid, this.projectid, true, this.templateid).subscribe((res: any) => {
      this.logger.log('[CNP-TEMPLATES] - FORK TEMPLATE RES', res);
      this.botid = res.bot_id

    }, (error) => {
      this.logger.error('[CNP-TEMPLATES] FORK TEMPLATE - ERROR ', error);

    }, () => {
      this.logger.log('[CNP-TEMPLATES] FORK TEMPLATE COMPLETE');

      this.getFaqKbById(this.botid);



      this.segmentAttributes['chatbotName'] = this.templatename
      this.segmentAttributes['chatbotId'] = this.templateid;
      this.segmentAttributes['method'] = "import template"
      // this.goToBotDetails()
      this.goToExitOnboarding()
    });
  }

  getFaqKbById(botid) {
    this.faqKbService.getFaqKbById(botid).subscribe((faqkb: any) => {
      this.logger.log('[TEMPLATE DETAIL] GET FAQ-KB (DETAILS) BY ID (SUBSTITUTE BOT) ', faqkb);

      this.botLocalDbService.saveBotsInStorage(botid, faqkb);

    }, (error) => {
      this.logger.error('[TEMPLATE DETAIL] GET FAQ-KB BY ID (SUBSTITUTE BOT) - ERROR ', error);
    }, () => {
      this.logger.log('[TEMPLATE DETAIL] GET FAQ-KB ID (SUBSTITUTE BOT) - COMPLETE ');
    });
  }



  presentModalAddBotFromScratch() {
    // console.log('[TEMPLATE DETAIL] - presentModalAddBotFromScratch ');
    const dialogRef = this.dialog.open(HomeCreateChatbotModalComponent, {
      width: '600px',
      // data: {
      //   calledBy: 'step1'
      // },
    })
    dialogRef.afterClosed().subscribe(result => {
      this.logger.log(`[TEMPLATE DETAIL] Dialog result:`, result);

      if (result) {
        this.chatbotName = result.chatbotName;

        if (this.chatbotName) {
          this.createTilebotBotFromScratch(this.chatbotName)
        }
      }
    });
  }

  createTilebotBotFromScratch(chatbotName) {
    this.language = this.botDefaultSelectedLangCode;
    this.faqKbService.createChatbotFromScratch(chatbotName, 'tilebot', this.language)
      .subscribe((faqKb) => {
        this.logger.log('[TEMPLATE DETAIL] createTilebotBotFromScratch - RES ', faqKb);

        if (faqKb) {

          this.botid = faqKb['_id'];
          this.botName = faqKb['name'];
          // console.log('[TEMPLATE DETAIL] createTilebotBotFromScratch - botid ', this.botid);
          // console.log('[TEMPLATE DETAIL] createTilebotBotFromScratch - botName ', this.botName);
          // this.translateparamBotName = { bot_name: this.newBot_name }
          // SAVE THE BOT IN LOCAL STORAGE
          this.botLocalDbService.saveBotsInStorage(faqKb['_id'], faqKb);

          // this.trackUserAction.emit({action:'Create chatbot',actionRes: faqKb })

          // this.router.navigate(['project/' + this.projectId + '/cds/', this.newBot_Id, 'intent', '0', 'h']);
          // goToCDSVersion(this.router, faqKb, this.projectid, this.appConfigService.getConfig().cdsBaseUrl)
        }

      }, (error) => {

        this.logger.error('[TEMPLATE DETAIL] CREATE FAQKB - POST REQUEST ERROR ', error);


      }, () => {
        this.logger.log('[TEMPLATE DETAIL] CREATE FAQKB - POST REQUEST * COMPLETE *');
        this.segmentAttributes['chatbotName'] = this.botName
        this.segmentAttributes['chatbotId'] = this.botid;
        this.segmentAttributes['method'] = "from scratch";
        // console.log('[TEMPLATE DETAIL] segmentAttributes', this.segmentAttributes)
        this.goToExitOnboarding()
      })
  }

  detectMobile() {
    this.isMobile = /Android|iPhone/i.test(window.navigator.userAgent);
    this.logger.log('[ONBOARDING-CONTENT] - IS MOBILE ', this.isMobile);
  }

  goToExitOnboarding() {
    if (this.isMobile === false) {
      this.goToBotDetails()
    } else {
      this.router.navigate(['project/' + this.projectid + '/desktop-access/' + this.botid])
    }
  }

  goToBotDetails() {
    this.goToNext.emit(this.segmentAttributes);
    // this.router.navigate(['project/' + this.project._id + '/cds/', this.botid, 'intent', '0']);
    let faqkb = {
      createdAt: new Date(),
      _id: this.botid
    }
    goToCDSVersion(this.router, faqkb, this.projectid, this.appConfigService.getConfig().cdsBaseUrl)

  }

  goToPrevPage() {
    let event = { step: 'step2' }
    this.prevPage.emit(event);
  }

  goToNextPage() {

    let event = { step: 'step3' }
    this.nextPage.emit(event);

    // this.goToNext.emit(this.segmentAttributes);

  }

}
