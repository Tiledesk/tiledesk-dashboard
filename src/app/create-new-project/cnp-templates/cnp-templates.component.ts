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
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { ModalChatbotNameComponent } from 'app/knowledge-bases/modals/modal-chatbot-name/modal-chatbot-name.component';
import { FaqService } from 'app/services/faq.service';
import { DepartmentService } from 'app/services/department.service';
import { LocalDbService } from 'app/services/users-local-db.service';
const Swal = require('sweetalert2')

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
  @Input() hasSelectChatBotOrKb: string;

  displayLogoWithText: boolean = true;
  companyLogo: string;
  companyLogoNoText: string;

  selectedIndex: number;
  template: any;
  t_paramsUserRole: any;
  templateid: string;
  templatename: string;
  botid: string;
  botName: string;
  projectid: string;
  project_Id:  string;
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
  isLoading = true;

  // Hook bot to dept
  dept_id: string;
  kbOfficialResponderTag = "kb-official-responder";
  selectedNamespace: any;
  welcomeMsg: string;
  spinnerInBtn: boolean = false;
  createChatbotBtnWidth: any;

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
    private kbService: KnowledgeBaseService,
    public faqService: FaqService,
    private departmentService: DepartmentService,
    public localDbService: LocalDbService,
  ) {

    const brand = brandService.getBrand();

    this.companyLogo = brand['BASE_LOGO'];
    this.companyLogoNoText = brand['BASE_LOGO_NO_TEXT'];
  }

  ngOnInit(): void {
    this.onInitWindowHeight();
    // this.getTemplates();
    this.selectedIndex = 0;
    this.getCurrentProject()
    this.detectMobile()
  }

  ngAfterViewInit(): void {
   this.logger.log('[CNP-TEMPLATES] HELLO !!! ');
    this.createProjectFromTemplates.emit()

    this.getCreateChatbotBtnWidth()

  }

  getCreateChatbotBtnWidth() {
    this.createChatbotBtnWidth  =  document.getElementById("create-kb-assistant-btn").offsetWidth + 'px';
    this.logger.log('[CNP-TEMPLATES] createChatbotBtnWidth ', this.createChatbotBtnWidth)
  }

  ngOnChanges(changes: SimpleChanges): void {


    this.logger.log('[CNP-TEMPLATES] hasSelectChatBotOrKb ', this.hasSelectChatBotOrKb)

    // this.logger.log('[CNP-TEMPLATES] - updatedProject ', this.updatedProject)
    if (this.updatedProject && this.updatedProject.attributes && this.updatedProject.attributes.userPreferences) {
      // this.logger.log('[CNP-TEMPLATES] - updatedProject > attributes > userPreferences', this.updatedProject.attributes.userPreferences)
      const userPreferences = this.updatedProject.attributes.userPreferences
      this.projectid = this.updatedProject._id
      // this.logger.log('[CNP-TEMPLATES] - updatedProject > projectid', this.projectid)

      if (userPreferences.user_role === 'business_owner' || userPreferences.user_role === 'developer' || userPreferences.user_role === 'conversation_designer' || userPreferences.user_role === 'no_code_builder' || userPreferences.user_role === 'business_stakeholder') {
        this.DIPLAY_CUSTOM_SUBTITLE = false;
        const userRole = this.translate.instant(userPreferences.user_role)

        // this.logger.log('[CNP-TEMPLATES] - userRole', userRole)
        // this.logger.log('[CNP-TEMPLATES] - DIPLAY_CUSTOM_SUBTITLE ', this.DIPLAY_CUSTOM_SUBTITLE)

        this.t_paramsUserRole = { selected_role: userRole }
      } else if (userPreferences.user_role === 'other') {
        this.DIPLAY_CUSTOM_SUBTITLE = true;
        // this.logger.log('[CNP-TEMPLATES] - DIPLAY_CUSTOM_SUBTITLE ', this.DIPLAY_CUSTOM_SUBTITLE)
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

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.project_Id = project._id
        this.logger.log('[CNP-TEMPLATES] - project ', project)

        this.welcomeMsg = 'Hi, I\'m the virtual assistant of ' + this.capitalize(project.name) + 'how can I help you?\r\n'
        this.getAllNamespaces(this.project_Id)
      }
    });
  }

  capitalize(string) {
    this.logger.log('[CNP-TEMPLATES] - capitalize project name ', string)
    this.logger.log('[CNP-TEMPLATES] - capitalize project welcomeMsg', this.welcomeMsg)
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // getProjectById(projectId) {
  //   this.projectService.getProjectById(projectId).subscribe((project: any) => {
  //     this.logger.log('[CNP-TEMPLATES] - GET PROJECT BY ID - PROJECT OBJECT: ', project);

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


      // this.certfifiedTemplates = res
      this.logger.log('[CNP-TEMPLATES] - GET ALL TEMPLATES RES', res);
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

        // this.logger.log('[CNP-TEMPLATES] - filterdres ', filterdres);

        this.templates = filterdres.filter((obj) => {
          return obj.mainCategory === selectedUseCase
        });

        // this.logger.log('[CNP-TEMPLATES] - FILTERED TEMPLATES CATEGORY: ', selectedUseCase, 'TEMPLATES:  ', this.templates);

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
        // this.logger.log('[CNP-TEMPLATES] - GET ALL TEMPLATES customerSatisfactionTemplates ', this.customerSatisfactionTemplates);

        // this.increaseSalesTemplates = this.templates.filter((obj) => {
        //   return obj.mainCategory === "Increase Sales"
        // });
        // this.logger.log('[CNP-TEMPLATES] - GET ALL TEMPLATES increaseSalesTemplates ', this.increaseSalesTemplates);

        this.template = this.templates[0];
        this.templatename = this.template.name
        this.templateid = this.template._id
        // this.videoURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.template.videoSource)

        // this.logger.log('[CNP-TEMPLATES] first tempaltes videoURL ', this.videoURL)
        // this.logger.log('[CNP-TEMPLATES] first tempaltes selected ', this.template)
        // this.logger.log('[CNP-TEMPLATES] first tempaltes selected templateid', this.template._id)
      }
      // this.logger.log('[CNP-TEMPLATES] - GET ALL TEMPLATES templates', this.templates);



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
    // this.logger.log('[CNP-TEMPLATES] selectedTemplate selectedIndex ', this.selectedIndex);

    this.templateid = templateid
    // this.logger.log('[CNP-TEMPLATES] selectedTemplate templateid ', this.templateid);

    const template = this.templates.filter((el: any) => {
      return el._id === templateid
    });
    this.template = template[0]
    this.templatename = this.template.name
    // this.videoURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.template.videoSource)
    // this.logger.log('[CNP-TEMPLATES] selectedTemplate template ', this.template);
    // this.logger.log('[CNP-TEMPLATES] selectedTemplate videoURL ', this.videoURL);
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
      this.logger.log('[CNP-TEMPLATES] GET FAQ-KB (DETAILS) BY ID (SUBSTITUTE BOT) ', faqkb);

      this.botLocalDbService.saveBotsInStorage(botid, faqkb);

    }, (error) => {
      this.logger.error('[CNP-TEMPLATES] GET FAQ-KB BY ID (SUBSTITUTE BOT) - ERROR ', error);
    }, () => {
      this.logger.log('[CNP-TEMPLATES] GET FAQ-KB ID (SUBSTITUTE BOT) - COMPLETE ');
    });
  }



  presentModalAddBotFromScratch() {
    // this.logger.log('[TEMPLATE DETAIL] - presentModalAddBotFromScratch ');
    const dialogRef = this.dialog.open(HomeCreateChatbotModalComponent, {
      width: '600px',
      // data: {
      //   calledBy: 'step1'
      // },
    })
    dialogRef.afterClosed().subscribe(result => {
      this.logger.log(`[CNP-TEMPLATES] Dialog result:`, result);

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
        this.logger.log('[CNP-TEMPLATES] createTilebotBotFromScratch - RES ', faqKb);

        if (faqKb) {

          this.botid = faqKb['_id'];
          this.botName = faqKb['name'];
          // this.logger.log('[TEMPLATE DETAIL] createTilebotBotFromScratch - botid ', this.botid);
          // this.logger.log('[TEMPLATE DETAIL] createTilebotBotFromScratch - botName ', this.botName);
          // this.translateparamBotName = { bot_name: this.newBot_name }
          // SAVE THE BOT IN LOCAL STORAGE
          this.botLocalDbService.saveBotsInStorage(faqKb['_id'], faqKb);

          // this.trackUserAction.emit({action:'Create chatbot',actionRes: faqKb })

          // this.router.navigate(['project/' + this.projectId + '/cds/', this.newBot_Id, 'intent', '0', 'h']);
          // goToCDSVersion(this.router, faqKb, this.projectid, this.appConfigService.getConfig().cdsBaseUrl)
        }

      }, (error) => {

        this.logger.error('[CNP-TEMPLATES] CREATE FAQKB - POST REQUEST ERROR ', error);


      }, () => {
        this.logger.log('[CNP-TEMPLATES] CREATE FAQKB - POST REQUEST * COMPLETE *');
        this.segmentAttributes['chatbotName'] = this.botName
        this.segmentAttributes['chatbotId'] = this.botid;
        this.segmentAttributes['method'] = "from scratch";
        // this.logger.log('[TEMPLATE DETAIL] segmentAttributes', this.segmentAttributes)
        this.goToExitOnboarding()
      })
  }

  detectMobile() {
    this.isMobile = /Android|iPhone/i.test(window.navigator.userAgent);
    this.logger.log('[CNP-TEMPLATES] - IS MOBILE ', this.isMobile);
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


  // ------------------------------------
  // Kb responder 
  // ------------------------------------

  getAllNamespaces(project_id) {

    this.kbService.getAllNamespaces().subscribe((res: any) => {
      if (res) {

        this.logger.log('[CNP-TEMPLATES] - GET ALL NAMESPACES', res);
        this.selectedNamespace = res[0];
        this.localDbService.setInStorage(`last_kbnamespace-${project_id}`, JSON.stringify(this.selectedNamespace))

        this.logger.log('[CNP-TEMPLATES] - GET ALL NAMESPACES selectedNamespace', this.selectedNamespace);
      }
    }, (error) => {
      this.logger.error('[CNP-TEMPLATES]  GET GET ALL NAMESPACES ERROR ', error);

    }, () => {
      this.logger.log('[CNP-TEMPLATES]  GET ALL NAMESPACES * COMPLETE *');

    });
  }

  createChatbotfromKbOfficialResponderTemplate() {
    this.findKbOfficialResponderAndThenExportToJSON()

    
  }

  findKbOfficialResponderAndThenExportToJSON() {
    this.spinnerInBtn = true;

    this.logger.log('[CNP-TEMPLATES] spinnerInBtn', this.spinnerInBtn)
    this.faqKbService.getTemplates().subscribe((certifiedTemplates: any) => {

      if (certifiedTemplates) {

        let kbOfficialResponderTemplate = certifiedTemplates.find(c => {
          if (c.certifiedTags) {
            let officialResponder = c.certifiedTags.find(t => t.name === this.kbOfficialResponderTag)
            return officialResponder
          }
        });
        this.logger.log('[CNP-TEMPLATES] kbOfficialResponderTemplate', kbOfficialResponderTemplate)



        if (kbOfficialResponderTemplate) {
          this.exportKbOfficialResponderToJSON(kbOfficialResponderTemplate._id)
        }
      }
    })
  }

  exportKbOfficialResponderToJSON(kbOfficialResponderTemplate_id) {
    
    this.faqKbService.exportChatbotToJSON(kbOfficialResponderTemplate_id).subscribe((chatbot: any) => {
      this.logger.log('[CNP-TEMPLATES] - EXPORT CHATBOT TO JSON - CHATBOT', chatbot)
      this.logger.log('[CNP-TEMPLATES] - EXPORT CHATBOT TO JSON - CHATBOT INTENTS', chatbot.intents)
      const intentArray = chatbot.intents
      const actionsArray = []
      chatbot.intents.forEach((intent, index, intentArray) => {
        // this.logger.log('[KNOWLEDGE-BASES-COMP] - EXPORT CHATBOT TO JSON - CHATBOT INTENT > actions', intent.actions)
        this.logger.log('[KNOWLEDGE-BASES-COMP] - EXPORT CHATBOT TO JSON - CHATBOT INTENT > actions > intent', intent)

        actionsArray.push(intent.actions)


        const askGPT_Action = intent.actions.find(o => o._tdActionType === "askgptv2")

        if (askGPT_Action) {
          askGPT_Action.namespace = this.selectedNamespace.id
          this.logger.log('[CNP-TEMPLATES] - EXPORT CHATBOT TO JSON - CHATBOT INTENT > actions askGPT_Action', askGPT_Action)

        }
        // ----------------------------------------------------------------------------
        // Find a solution! This no more working affter that the template was changed
        // ----------------------------------------------------------------------------
        // const replyActionWithWelcomeMsg = intent.actions.find(x => x.text !== undefined);
        // if(replyActionWithWelcomeMsg) {
        //   this.logger.log('[CNP-TEMPLATES] - EXPORT CHATBOT TO JSON - CHATBOT INTENT > actions replyActionWithWelcomeMsg', replyActionWithWelcomeMsg)
        //   replyActionWithWelcomeMsg.text = this.welcomeMsg

        //   if (replyActionWithWelcomeMsg && replyActionWithWelcomeMsg.attributes && replyActionWithWelcomeMsg.attributes.commands) {
        //     const actionCommands = replyActionWithWelcomeMsg.attributes.commands
        //     this.logger.log('[CNP-TEMPLATES] - EXPORT CHATBOT TO JSON - CHATBOT INTENT > actions replyActionWithWelcomeMsg actionCommands', actionCommands)
        //     actionCommands.forEach(command => {
        //       if (command.type === "message" ) {

        //         this.logger.log("[CNP-TEMPLATES] - EXPORT CHATBOT TO JSON - CHATBOT INTENT > actions replyActionWithWelcomeMsg actionCommands command ", command.message.text) 
        //         command.message.text = this.welcomeMsg

        //       }

        //     });
        //   }

        // }

        // if (askGPT_Action &&  replyActionWithWelcomeMsg) {

        // }

        if (index === intentArray.length - 1) {
          // this.logger.log('[CNP-TEMPLATES] - askGPT_Action' , askGPT_Action)
          // this.logger.log('[CNP-TEMPLATES] - replyActionWithWelcomeMsg' , replyActionWithWelcomeMsg)
          this.logger.log('[CNP-TEMPLATES] - actionsArray', actionsArray)

          this.presentDialogChatbotname(chatbot)

        }
      });

    }, (error) => {
      this.logger.error('[CNP-TEMPLATES] - EXPORT BOT TO JSON - ERROR', error);
      this.spinnerInBtn = false;
    }, () => {
      this.logger.log('[CNP-TEMPLATES] - EXPORT BOT TO JSON - COMPLETE');


    });
  }


  presentDialogChatbotname(chatbot) {
    this.spinnerInBtn = false;
    this.logger.log('[CNP-TEMPLATES] spinnerInBtn ',  this.spinnerInBtn)
    this.logger.log('[CNP-TEMPLATES] openDialog presentDialogChatbotname chatbot ', chatbot)
    const dialogRef = this.dialog.open(ModalChatbotNameComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '600px',
      data: {
        chatbot: chatbot,
      },
    });

    dialogRef.afterClosed().subscribe(editedChatbot => {
      if (editedChatbot) {
        this.logger.log(`[CNP-TEMPLATES] DIALOG CHATBOT NAME AFTER CLOSED editedChatbot:`, editedChatbot);
        this.importChatbotFromJSON(editedChatbot)

        this.logger.log(`[CNP-TEMPLATES] DIALOG CHATBOT NAME  AFTER CLOSE selectedNamespace:`, this.selectedNamespace);
        // this.selectedNamespace['name'] = editedChatbot['name']
        let body = { name: editedChatbot['name'] }
        this.updateNamespace(body)
      }
    });
  }

  updateNamespace(body) {

    this.kbService.updateNamespace(body, this.selectedNamespace.id).subscribe((namespace: any) => {
      if (namespace) {
        this.logger.log(`[CNP-TEMPLATES] updateNamespace RES:`, namespace);
        this.localDbService.setInStorage(`last_kbnamespace-${this.project_Id}`, JSON.stringify(namespace))
      }
    }
    ), (error) => {
      this.logger.error('[CNP-TEMPLATES] - UPDATE NAME SPACE NAME ERROR', error);

    }, () => {
      this.logger.log('[CNP-TEMPLATES] - UPDATE NAME SPACE NAME * COMPLETE *');

    };
  }

  importChatbotFromJSON(editedChatbot) {
    this.logger.log('[CNP-TEMPLATES] - IMPORT CHATBOT FROM JSON editedChatbot ', editedChatbot)
    this.faqService.importChatbotFromJSONFromScratch(editedChatbot).subscribe((faqkb: any) => {
      this.logger.log('[CNP-TEMPLATES] - IMPORT CHATBOT FROM JSON - ', faqkb)
      if (faqkb) {
        this.logger.log('[CNP-TEMPLATES] - IMPORT CHATBOT FROM JSON faqkb certifiedTags  ', faqkb.certifiedTags)

        this.getDeptsByProjectId(faqkb)
        this.publish(faqkb)

      }

    }, (error) => {
      this.logger.error('[CNP-TEMPLATES] -  IMPORT CHATBOT FROM JSON- ERROR', error);
    }, () => {
      this.logger.log('[CNP-TEMPLATES] - IMPORT CHATBOT FROM JSON - COMPLETE');

    });
  }

  publish(faqkb) {
    this.logger.log('[CNP-TEMPLATES] publish  - selectedChatbot ', faqkb)
    this.faqKbService.publish(faqkb).subscribe((data) => {
      this.logger.log('[CNP-TEMPLATES] publish  - RES ', data)
    }, (error) => {
     
      this.logger.error('[CNP-TEMPLATES] publish ERROR ', error);
    }, () => {
  
      this.logger.log('[CNP-TEMPLATES] publish * COMPLETE *');
    });
  }

  getDeptsByProjectId(faqkb?: string) {
    this.departmentService.getDeptsByProjectId().subscribe((departments: any) => {

      this.logger.log('[CNP-TEMPLATES] --->  DEPTS RES ', departments);

      if (departments) {
        const depts_length = departments.length
        this.logger.log('[CNP-TEMPLATES] --->  DEPTS LENGHT ', depts_length);

        if (depts_length === 1) {
          // this.DISPLAY_SELECT_DEPTS_WITHOUT_BOT = false
          this.dept_id = departments[0]['_id']

          this.logger.log('[CNP-TEMPLATES] ---> USECASE DEPTS LENGHT = 1 - DEFAULT DEPT HAS BOT ', departments[0].hasBot);
          this.logger.log('[CNP-TEMPLATES] ---> USECASE DEPTS LENGHT = 1 - DEFAULT DEPT HAS BOT ', departments[0]);
          if (departments[0].hasBot === true) {

            this.logger.log('[CNP-TEMPLATES] --->  DEFAULT DEPT HAS BOT ');
            // this.DISPLAY_BTN_ACTIVATE_BOT_FOR_NEW_CONV = false;
            // this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT = false

            // this.logger.log('Bot Create --->  DEFAULT DEPT HAS BOT DISPLAY_BTN_ACTIVATE_BOT_FOR_NEW_CONV ', this.DISPLAY_BTN_ACTIVATE_BOT_FOR_NEW_CONV);
            // this.logger.log('[KNOWLEDGE-BASES-COMP] --->  DEFAULT DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);
          } else {
            this.logger.log('[CNP-TEMPLATES] ---> USECASE DEPTS LENGHT = 1 DEFAULT DEPT NOT HAS BOT ', departments[0]);
            this.logger.log('[CNP-TEMPLATES] ---> USECASE DEPTS LENGHT = 1 DEFAULT DEPT NOT HAS BOT ', departments[0].hasBot);
            this.hookBotToDept(departments[0]._id, faqkb, 'hookToDefaultDept')

            // this.DISPLAY_BTN_ACTIVATE_BOT_FOR_NEW_CONV = true;
            // this.logger.log('[KNOWLEDGE-BASES-COMP] --->  DEFAULT DEPT botType selected ', this.botType);
            // if (this.botType !== 'identity') {
            // this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT = true;
          }

          // this.logger.log('[KNOWLEDGE-BASES-COMP] --->  DEFAULT DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);
        }

        // else if (depts_length > 1) {
        //   this.logger.log('[KNOWLEDGE-BASES-COMP] --->  DEPTS LENGHT  USECASE DEPTS LENGHT > 1', depts_length);


        //   departments.forEach(dept => {

        //     if (dept.hasBot === true) {
        //       this.logger.log('[KNOWLEDGE-BASES-COMP] ---> USECASE DEPTS LENGHT > 1  DEPT HAS BOT ');

        //     } else {
        //       this.logger.log('[KNOWLEDGE-BASES-COMP] ---> USECASE DEPTS LENGHT > 1  DEPT NOT HAS BOT ');

        //       this.depts_without_bot_array.push({ id: dept._id, name: dept.name })
        //       this.logger.log('[KNOWLEDGE-BASES-COMP] ---> USECASE DEPTS LENGHT > 1  DEPT NOT HAS BOT  depts_without_bot_array ', this.depts_without_bot_array);
        //       if (!this.dialogRefHookBoot) {
        //         this.openDialogHookBot(this.depts_without_bot_array, faqkb)
        //       }
        //     }
        //   });
        // }
      }
    }, error => {

      this.logger.error('[KCNP-TEMPLATES] --->  DEPTS RES - ERROR', error);
    }, () => {
      this.logger.log('[CNP-TEMPLATES] --->  DEPTS RES - COMPLETE')

    });

  }

  hookBotToDept(deptId, botId, hookToDefaultDept?: string) {
    this.logger.log('[CNP-TEMPLATES] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT > hookToDefaultDept ', hookToDefaultDept);
    this.logger.log('[CNP-TEMPLATES] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT > deptId ', deptId, 'botId', botId);
    this.departmentService.updateExistingDeptWithSelectedBot(deptId, botId).subscribe((res) => {
      this.logger.log('[CNP-TEMPLATES] Bot Create - UPDATE EXISTING DEPT WITH SELECTED BOT - RES ', res);

    }, (error) => {
      this.logger.error('[CNP-TEMPLATES] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - ERROR ', error);

      // this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT = true
      // this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT_ERROR = true;

      // this.logger.error('[KNOWLEDGE-BASES-COMP] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - ERROR - HAS_COMPLETED_HOOK_BOOT_TO_DEPT', this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT);
    }, () => {
      this.logger.log('[CNP-TEMPLATES] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - COMPLETE ');

      // this.notify.showWidgetStyleUpdateNotification(this.translate.instant('BotSuccessfullyActivated'), 2, 'done');
      this.presentModalBotCreated()

      // this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT = true
      // this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT_SUCCESS = true;
      // this.logger.log('[BOT-CREATE] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - COMPLETE - HAS_COMPLETED_HOOK_BOOT_TO_DEPT', this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT);
    });
  }

  presentModalBotCreated() {
    this.logger.log('[CNP-TEMPLATES] presentModalBotCreate') 
    Swal.fire({
      // title: this.onlyOwnerCanManageTheAccountPlanMsg,
      title: this.translate.instant('Success'),
      text: this.translate.instant('YouHaveCreatedYourFirstChatbot'), //"You\'ve created your first chatbot to answer your users\' questions. Now it's time to add contents!",
      icon: "success",
      showCancelButton: false,
      confirmButtonText: this.translate.instant('LetsGo'), //"Let\'s go!",
      confirmButtonColor: "var(--blue-light)",
      focusConfirm: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.logger.log('[CNP-TEMPLATES] presentModalBotCreate result ', result)
       

        this.goToExitOnboardingKB()
      }
    })
  }


  goToExitOnboardingKB() {
    if (this.isMobile === false) {
      this.router.navigate(['project/' + this.projectid + '/knowledge-bases/' + this.selectedNamespace.id]);
    } else {
      this.router.navigate(['project/' + this.projectid + '/desktop--access/' +  this.selectedNamespace.id])
    }
  }



  goToPrevPage() {
    let event = { step: 'step4' }
    this.prevPage.emit(event);
  }

  goToNextPage() {
    let event = { step: 'step3' }
    this.nextPage.emit(event);

    // this.goToNext.emit(this.segmentAttributes);

  }

}
