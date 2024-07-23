import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ChatbotModalComponent } from 'app/bots/bots-list/chatbot-modal/chatbot-modal.component';
import { AuthService } from 'app/core/auth.service';
import { NotifyService } from 'app/core/notify.service';
import { ModalChatbotNameComponent } from 'app/knowledge-bases/modals/modal-chatbot-name/modal-chatbot-name.component';
import { ModalHookBotComponent } from 'app/knowledge-bases/modals/modal-hook-bot/modal-hook-bot.component';
import { Chatbot } from 'app/models/faq_kb-model';
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component';
import { AppConfigService } from 'app/services/app-config.service';
import { DepartmentService } from 'app/services/department.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { FaqService } from 'app/services/faq.service';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { LocalDbService } from 'app/services/users-local-db.service';
import { UsersService } from 'app/services/users.service';
import { goToCDSVersion } from 'app/utils/util';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
const Swal = require('sweetalert2')

@Component({
  selector: 'home-cds',
  templateUrl: './home-cds.component.html',
  styleUrls: ['./home-cds.component.scss']
})

export class HomeCdsComponent extends PricingBaseComponent implements OnInit, OnChanges {
  @Output() goToCreateChatbot = new EventEmitter();
  @Output() dismissKbSkeleton = new EventEmitter();
  // @Output() hasFinishedGetProjectBots = new EventEmitter();
  @Input() chatbots: Array<Chatbot> = [];
  @Input() displayKbHeroSection: boolean
  @Input() isVisibleKNB: boolean
  private unsubscribe$: Subject<any> = new Subject<any>();
  USER_ROLE: string;
  projectId: string;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;
  storageBucket: string;
  baseUrl: string;
  // chatbots:  Array<Chatbot> = [];
  chatbotName: string;
  lastUpdatedChatbot: Chatbot;
  showSpinner: boolean
  chatbotsUsingNamespace: any;
  kbNameSpaceid: string = '';
  kbNameSpaceName: string
  kbAssistantName: string;
  kbOfficialResponderTag = "kb-official-responder";
  dept_id: string;
  private dialogRefHookBoot: MatDialogRef<any>;
  private dialogRefCreateCb: MatDialogRef<any>;
  depts_without_bot_array = [];
  chatbotCount: number;
  depts: any;
  namespaces: any

  constructor(
    public appConfigService: AppConfigService,
    private faqKbService: FaqKbService,
    private usersService: UsersService,
    private logger: LoggerService,
    private router: Router,
    public auth: AuthService,
    public notify: NotifyService,
    private kbService: KnowledgeBaseService,
    public localDbService: LocalDbService,
    public dialog: MatDialog,
    public faqService: FaqService,
    private departmentService: DepartmentService,
    private translate: TranslateService,
    public prjctPlanService: ProjectPlanService,
  ) {
    super(prjctPlanService, notify);
  }

  ngOnInit(): void {
    this.getUserRole()
    this.getCurrentProject()
    this.getFaqKbByProjectId()
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.logger.log('[HOME-CDS] - chatbots ngOnChanges', this.chatbots);
    this.logger.log('[HOME-CDS] - displayKbHeroSection ngOnChanges', this.displayKbHeroSection);
    this.sortChatbots();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


  getFaqKbByProjectId() {
    this.faqKbService.getFaqKbByProjectId().subscribe((faqKb: any) => {
      this.logger.log('[HOME-CDS] - GET BOTS BY PROJECT ID', faqKb);
      if (faqKb) {
        this.chatbotCount = faqKb.length;
        this.logger.log('[HOME-CDS] - GET BOTS BY PROJECT ID chatbotCount', this.chatbotCount);
      }
    }, (error) => {
      this.logger.error('[HOME-CDS] GET BOTS ERROR ', error);

    }, () => {
      this.logger.log('[HOME-CDS] GET BOTS COMPLETE');
    });
  }

  getCurrentProject() {
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {
        this.logger.log('[HOME-CDS] $UBSCIBE TO PUBLISHED PROJECT - RES  ', project)

        if (project) {
          this.projectId = project._id

          const storedNamespace = this.localDbService.getFromStorage(`last_kbnamespace-${this.projectId}`)
          this.logger.log('[HOME-CDS] storedNamespace', storedNamespace);
          if (storedNamespace) {
            let storedNamespaceObjct = JSON.parse(storedNamespace)
            this.logger.log('[HOME-CDS] storedNamespaceObjct', storedNamespaceObjct);
            this.kbNameSpaceid = storedNamespaceObjct.id;
            this.kbNameSpaceName = storedNamespaceObjct.name
            this.getChatbotUsingNamespace(this.kbNameSpaceid)
          } else {
            this.getAllNamespaces()
          }
        }
      }, (error) => {
        this.logger.error('[HOME-CDS] $UBSCIBE TO PUBLISHED PROJECT - ERROR ', error);
      }, () => {
        this.logger.log('[HOME-CDS] $UBSCIBE TO PUBLISHED PROJECT * COMPLETE *');
      });
  }


  getAllNamespaces() {
    this.kbService.getAllNamespaces().subscribe((namespaces: any) => {
      if (namespaces) {

        this.logger.log('[HOME-CDS] - GET ALL NAMESPACES', namespaces);
        this.namespaces = namespaces
        namespaces.sort(function compare(a, b) {
          if (a['updatedAt'] > b['updatedAt']) {
            return -1;
          }
          if (a['updatedAt'] < b['updatedAt']) {
            return 1;
          }
          return 0;
        });

        this.logger.log('[HOME-CDS] - GET ALL NAMESPACES ', namespaces);
        this.kbNameSpaceid = namespaces[0].id;
        this.kbNameSpaceName = namespaces[0].name
        this.getChatbotUsingNamespace(this.kbNameSpaceid)

      }
    }, (error) => {
      this.logger.error('[HOME-CDS]  GET GET ALL NAMESPACES ERROR ', error);

    }, () => {
      this.logger.log('[HOME-CDS]  GET ALL NAMESPACES * COMPLETE *');
      // if (this.namespaces) {
      //   this.selectLastUsedNamespaceAndGetKbList(this.namespaces);
      // }
    });
  }


  getChatbotUsingNamespace(selectedNamespaceid: string) {
    this.chatbotsUsingNamespace = []
    this.kbService.getChatbotsUsingNamespace(selectedNamespaceid).subscribe((kbAssistants: any) => {

      this.logger.log('[HOME-CDS] - GET kbAssistant USING NAMESPACE kbAssistants', kbAssistants);
      this.chatbotsUsingNamespace = kbAssistants

      if (this.chatbotsUsingNamespace.length > 0) {
        this.kbAssistantName = kbAssistants[0].name
      }

      // this.getDeptsByProjectIdOnInit(this.chatbotsUsingNamespace)

      // let isArray = this.isArray(chatbots)
      // if (isArray) {
      // if (kbAssistants.length > 0) {
      //   this.logger.log('[HOME-CDS] - GET CHATBOTS USING NAMESPACE kbAssistants ', kbAssistants)
      //   this.chatbotsUsingNamespace = kbAssistants

      // } else {
      //   this.kbNameSpaceid = '0'
      // }

    }, (error) => {
      this.logger.error('[HOME-CDS] - GET CHATBOTS USING NAMESPACE ', error);

    }, () => {
      this.logger.log('[HOME-CDS] - GET CHATBOTS USING NAMESPACE * COMPLETE *');
      this.dismissKbSkeleton.emit(true)

    });
  }

  getDeptsByProjectIdOnInit(chatbotsUsingNamespace) {

    this.logger.log('[HOME-CDS] ---> GET DEPTS oninit chatbotsUsingNamespace ', chatbotsUsingNamespace);

    this.departmentService.getDeptsByProjectId().subscribe((departments: any) => {

      this.logger.log('[HOME-CDS] ---> GET DEPTS oninit RES ', departments);

      if (departments) {
        this.depts = departments;
      }
    })
  }


  getUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((userRole) => {
        this.logger.log('[HOME-CDS] - SUBSCRIPTION TO USER ROLE »»» ', userRole)
        this.USER_ROLE = userRole;
      })
  }


  // getImageStorageThenBots() {
  //   if (this.appConfigService.getConfig().uploadEngine === 'firebase') {

  //     this.UPLOAD_ENGINE_IS_FIREBASE = true;
  //     const firebase_conf = this.appConfigService.getConfig().firebase;
  //     this.storageBucket = firebase_conf['storageBucket'];
  //     this.logger.log('[HOME-CDS] - IMAGE STORAGE ', this.storageBucket, 'usecase firebase')


  //     this.getProjectBots(this.storageBucket, this.UPLOAD_ENGINE_IS_FIREBASE) // USED FOR COUNT OF BOTS FOR THE NEW HOME-CDS-CREATE-CHATBOT-CREATE-CHATBOT

  //   } else {

  //     this.UPLOAD_ENGINE_IS_FIREBASE = false;
  //     this.baseUrl = this.appConfigService.getConfig().baseImageUrl;
  //     this.logger.log('[HOME-CDS] - IMAGE STORAGE ', this.baseUrl, 'usecase native')

  //     this.getProjectBots(this.baseUrl, this.UPLOAD_ENGINE_IS_FIREBASE) // USED FOR COUNT OF BOTS FOR THE NEW HOME-CDS-CREATE-CHATBOT-CREATE-CHATBOT
  //   }
  // }


  // getProjectBots(storage, uploadEngineIsFirebase) {
  //   this.faqKbService.getFaqKbByProjectId().subscribe((faqKb: any) => {
  //     this.chatbots = faqKb
  //     if (this.chatbots &&  this.chatbots.length > 0) {

  //       this.chatbots.sort(function compare(a: Chatbot, b: Chatbot) {
  //         if (a['updatedAt'] > b['updatedAt']) {
  //           return -1;
  //         }
  //         if (a['updatedAt'] < b['updatedAt']) {
  //           return 1;
  //         }
  //         return 0;
  //       });

  //       this.logger.log('[HOME-CDS] - GET FAQKB RES (sorted)', this.chatbots);

  //       this.chatbotName = this.chatbots[0].name;
  //       this.lastUpdatedChatbot = this.chatbots[0];
  //       this.logger.log('[HOME-CDS] - lastUpdatedChatbot ', this.lastUpdatedChatbot);
  //       this.logger.log('[HOME-CDS] - GET FAQKB lastUpdatedChatbot', this.lastUpdatedChatbot);
  //     } 

  //   }, (error) => {
  //     this.logger.error('[HOME-CDS] - GET FAQKB - ERROR ', error);
  //     this.showSpinner = false
  //   }, () => {
  //     this.logger.log('[HOME-CDS] - GET FAQKB * COMPLETE *');
  //     this.showSpinner = false
  //     this.hasFinishedGetProjectBots.emit()
  //   });
  // }

  sortChatbots() {
    // this.faqKbService.getFaqKbByProjectId().subscribe((faqKb: any) => {
    //   this.chatbots = faqKb
    if (this.chatbots && this.chatbots.length > 0) {

      this.chatbots.sort(function compare(a: Chatbot, b: Chatbot) {
        if (a['updatedAt'] > b['updatedAt']) {
          return -1;
        }
        if (a['updatedAt'] < b['updatedAt']) {
          return 1;
        }
        return 0;
      });

      this.logger.log('[HOME-CDS] - GET FAQKB RES (sorted)', this.chatbots);

      this.chatbotName = this.chatbots[0].name;
      this.lastUpdatedChatbot = this.chatbots[0];
      this.logger.log('[HOME-CDS] - lastUpdatedChatbot ', this.lastUpdatedChatbot);
      this.logger.log('[HOME-CDS] - GET FAQKB lastUpdatedChatbot', this.lastUpdatedChatbot);
    }

    // }
    // , (error) => {
    //   this.logger.error('[HOME-CDS] - GET FAQKB - ERROR ', error);
    //   this.showSpinner = false
    // }, () => {
    //   this.logger.log('[HOME-CDS] - GET FAQKB * COMPLETE *');
    //   this.showSpinner = false
    //   this.hasFinishedGetProjectBots.emit()
    // });
  }

  goToBotProfile() {
    this.logger.log('[HOME-CDS] - goToBotProfile  projectId ', this.projectId);
    if (this.USER_ROLE !== 'agent') {
      if (this.chatbots?.length > 0) {
        // this.router.navigate(['project/' + this.project._id + '/tilebot/intents/', bot_id, botType]);
        // this.router.navigate(['project/' + this.projectId + '/cds/', bot._id, 'intent', '0', 'h']);
        goToCDSVersion(this.router, this.lastUpdatedChatbot, this.projectId, this.appConfigService.getConfig().cdsBaseUrl)
      } else if (this.chatbots?.length === 0) {

        if (this.chatBotLimit) {
          if (this.chatbotCount < this.chatBotLimit) {
            this.logger.log('[COMMUNITY-TEMPLATE-DTLS] USECASE  chatBotCount < chatBotLimit: RUN FORK')
            this.goToCreateChatbot.emit()
          } else if (this.chatbotCount >= this.chatBotLimit) {
            this.logger.log('[COMMUNITY-TEMPLATE-DTLS] USECASE  chatBotCount >= chatBotLimit DISPLAY MODAL')
            this.presentDialogReachedChatbotLimit()
          }
        } else if (!this.chatBotLimit) {
          this.logger.log('[COMMUNITY-TEMPLATE-DTLS] USECASE  NO chatBotLimit: RUN FORK')
          this.goToCreateChatbot.emit()
        }
      }
    } else {

      this.presentModalAgentCannotManageChatbot()
    }
  }

  presentModalAgentCannotManageChatbot() {
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan('Agents can\'t manage chatbots', 'Learn more about default roles')
  }

  checkImageExists(imageUrl, callBack) {
    var imageData = new Image();
    imageData.onload = function () {
      callBack(true);
    };
    imageData.onerror = function () {
      callBack(false);
    };
    imageData.src = imageUrl;
  }


  goToKBPage() {
    this.logger.log('[HOME-CDS] goToKBPage')
    this.router.navigate(['project/' + this.projectId + '/knowledge-bases/' + this.kbNameSpaceid]);
  }


  createChatbotfromKbOfficialResponderTemplate() {
    this.findKbOfficialResponderAndThenExportToJSON()
    if (this.chatBotLimit) {
      if (this.chatbotCount < this.chatBotLimit) {
        this.logger.log('[HOME-CDS] USECASE  chatBotCount < chatBotLimit: RUN findKbOfficial')
        this.findKbOfficialResponderAndThenExportToJSON()
      } else if (this.chatbotCount >= this.chatBotLimit) {
        this.logger.log('[HOME-CDS] USECASE  chatBotCount >= chatBotLimit DISPLAY MODAL')
        this.presentDialogReachedChatbotLimit()
      }
    } else if (!this.chatBotLimit) {
      this.logger.log('[HOME-CDS] USECASE  NO chatBotLimit: RUN findKbOfficial')
      this.findKbOfficialResponderAndThenExportToJSON()
    }
  }
  presentDialogReachedChatbotLimit() {
    this.logger.log('[HOME-CDS] openDialog presentDialogReachedChatbotLimit prjct_profile_name ', this.prjct_profile_name)
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
      this.logger.log(`[HOME-CDS] Dialog result: ${result}`);
    });
  }


  findKbOfficialResponderAndThenExportToJSON() {
    this.faqKbService.getTemplates().subscribe((certifiedTemplates: any) => {

      if (certifiedTemplates) {

        let kbOfficialResponderTemplate = certifiedTemplates.find(c => {
          if (c.certifiedTags) {
            let officialResponder = c.certifiedTags.find(t => t.name === this.kbOfficialResponderTag)
            return officialResponder
          }
        });
        this.logger.log('[HOME-CDS] kbOfficialResponderTemplate', kbOfficialResponderTemplate)

        if (kbOfficialResponderTemplate) {
          this.exportKbOfficialResponderToJSON(kbOfficialResponderTemplate._id)
        }
      }
    })
  }


  exportKbOfficialResponderToJSON(kbOfficialResponderTemplate_id) {
    this.faqKbService.exportChatbotToJSON(kbOfficialResponderTemplate_id).subscribe((chatbot: any) => {
      this.logger.log('[HOME-CDS] - EXPORT CHATBOT TO JSON - CHATBOT', chatbot)
      this.logger.log('[HOME-CDS] - EXPORT CHATBOT TO JSON - CHATBOT INTENTS', chatbot.intents)
      const intentArray = chatbot.intents
      const actionsArray = []
      chatbot.intents.forEach((intent, index, intentArray) => {
        // this.logger.log('[HOME-CDS] - EXPORT CHATBOT TO JSON - CHATBOT INTENT > actions', intent.actions)
        this.logger.log('[HOME-CDS] - EXPORT CHATBOT TO JSON - CHATBOT INTENT > actions > intent', intent)

        actionsArray.push(intent.actions)


        const askGPT_Action = intent.actions.find(o => o._tdActionType === "askgptv2")

        if (askGPT_Action) {
          askGPT_Action.namespace = this.kbNameSpaceid
          this.logger.log('[HOME-CDS] - EXPORT CHATBOT TO JSON - CHATBOT INTENT > actions askGPT_Action', askGPT_Action)

        }
        // ----------------------------------------------------------------------------
        // Find a solution! This no more working affter that the template was changed
        // ----------------------------------------------------------------------------
        // const replyActionWithWelcomeMsg = intent.actions.find(x => x.text !== undefined);
        // if(replyActionWithWelcomeMsg) {
        //   this.logger.log('[HOME-CDS] - EXPORT CHATBOT TO JSON - CHATBOT INTENT > actions replyActionWithWelcomeMsg', replyActionWithWelcomeMsg)
        //   replyActionWithWelcomeMsg.text = this.welcomeMsg

        //   if (replyActionWithWelcomeMsg && replyActionWithWelcomeMsg.attributes && replyActionWithWelcomeMsg.attributes.commands) {
        //     const actionCommands = replyActionWithWelcomeMsg.attributes.commands
        //     this.logger.log('[HOME-CDS] - EXPORT CHATBOT TO JSON - CHATBOT INTENT > actions replyActionWithWelcomeMsg actionCommands', actionCommands)
        //     actionCommands.forEach(command => {
        //       if (command.type === "message" ) {

        //         this.logger.log("[HOME-CDS] - EXPORT CHATBOT TO JSON - CHATBOT INTENT > actions replyActionWithWelcomeMsg actionCommands command ", command.message.text) 
        //         command.message.text = this.welcomeMsg

        //       }

        //     });
        //   }

        // }

        // if (askGPT_Action &&  replyActionWithWelcomeMsg) {

        // }

        if (index === intentArray.length - 1) {
          // this.logger.log('[HOME-CDS] - askGPT_Action' , askGPT_Action)
          // this.logger.log('[HOME-CDS] - replyActionWithWelcomeMsg' , replyActionWithWelcomeMsg)
          this.logger.log('[HOME-CDS] - actionsArray', actionsArray)
          if (!this.dialogRefCreateCb) {
            this.presentDialogChatbotname(chatbot)
          }

        }
      });

    }, (error) => {
      this.logger.error('[HOME-CDS] - EXPORT BOT TO JSON - ERROR', error);
    }, () => {
      this.logger.log('[HOME-CDS] - EXPORT BOT TO JSON - COMPLETE');


    });
  }

  presentDialogChatbotname(chatbot) {
    this.logger.log('[HOME-CDS] openDialog presentDialogChatbotname chatbot ', chatbot)
    // const dialogRef = this.dialog.open(ModalChatbotNameComponent, {
    this.dialogRefCreateCb = this.dialog.open(ModalChatbotNameComponent, {

      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '600px',
      data: {
        chatbot: chatbot,
      },
    });

    this.dialogRefCreateCb.afterClosed().subscribe(editedChatbot => {
      if (editedChatbot) {
        this.logger.log(`[HOME-CDS] DIALOG CHATBOT NAME editedChatbot:`, editedChatbot);
        this.importChatbotFromJSON(editedChatbot)
      }
    });
  }


  importChatbotFromJSON(editedChatbot) {
    this.logger.log('[HOME-CDS] - IMPORT CHATBOT FROM JSON editedChatbot ', editedChatbot)
    this.faqService.importChatbotFromJSONFromScratch(editedChatbot).subscribe((faqkb: any) => {
      this.logger.log('[HOME-CDS] - IMPORT CHATBOT FROM JSON - ', faqkb)
      if (faqkb) {
        this.logger.log('[HOME-CDS] - IMPORT CHATBOT FROM JSON faqkb certifiedTags  ', faqkb.certifiedTags)
        faqkb.certifiedTags

        this.getDeptsByProjectId(faqkb)

      }

    }, (error) => {
      this.logger.error('[HOME-CDS] -  IMPORT CHATBOT FROM JSON- ERROR', error);
    }, () => {
      this.logger.log('[HOME-CDS] - IMPORT CHATBOT FROM JSON - COMPLETE');

    });
  }


  getDeptsByProjectId(faqkb?: string) {
    this.departmentService.getDeptsByProjectId().subscribe((departments: any) => {

      this.logger.log('[HOME-CDS] --->  DEPTS RES ', departments);

      if (departments) {
        const depts_length = departments.length
        this.logger.log('[HOME-CDS] --->  DEPTS LENGHT ', depts_length);

        if (depts_length === 1) {
          // this.DISPLAY_SELECT_DEPTS_WITHOUT_BOT = false
          this.dept_id = departments[0]['_id']

          this.logger.log('[HOME-CDS] ---> USECASE DEPTS LENGHT = 1 - DEFAULT DEPT HAS BOT ', departments[0].hasBot);
          this.logger.log('[HOME-CDS] ---> USECASE DEPTS LENGHT = 1 - DEFAULT DEPT HAS BOT ', departments[0]);

          if (departments[0].hasBot === true) {
            this.presentDialogChatbotSuccessfullyCreated('1')


            this.logger.log('[HOME-CDS] --->  DEFAULT DEPT HAS BOT ');
            // this.DISPLAY_BTN_ACTIVATE_BOT_FOR_NEW_CONV = false;
            // this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT = false

            // this.logger.log('Bot Create --->  DEFAULT DEPT HAS BOT DISPLAY_BTN_ACTIVATE_BOT_FOR_NEW_CONV ', this.DISPLAY_BTN_ACTIVATE_BOT_FOR_NEW_CONV);
            // this.logger.log('[HOME-CDS] --->  DEFAULT DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);
          } else {
            this.logger.log('[HOME-CDS] ---> USECASE DEPTS LENGHT = 1 DEFAULT DEPT NOT HAS BOT ', departments[0]);
            this.logger.log('[HOME-CDS] ---> USECASE DEPTS LENGHT = 1 DEFAULT DEPT NOT HAS BOT ', departments[0].hasBot);
            this.hookBotToDept(departments[0]._id, faqkb, 'hookToDefaultDept');
            this.presentDialogChatbotSuccessfullyCreated('2')


            // this.DISPLAY_BTN_ACTIVATE_BOT_FOR_NEW_CONV = true;
            // this.logger.log('[HOME-CDS] --->  DEFAULT DEPT botType selected ', this.botType);
            // if (this.botType !== 'identity') {
            // this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT = true;
          }

          // this.logger.log('[HOME-CDS] --->  DEFAULT DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);
        } else if (depts_length > 1) {
          this.logger.log('[HOME-CDS] --->  DEPTS LENGHT  USECASE DEPTS LENGHT > 1', depts_length);

          // this.DISPLAY_SELECT_DEPTS_WITHOUT_BOT = true;
          departments.forEach((dept, index, departments) => {

            if (dept.hasBot === true) {
              this.logger.log('[HOME-CDS] ---> USECASE DEPTS LENGHT > 1  DEPT HAS BOT ');

              // this.logger.log('[BOT-CREATE] --->  DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);
            } else {
              this.logger.log('[HOME-CDS] ---> USECASE DEPTS LENGHT > 1  DEPT NOT HAS BOT ');
              // this.logger.log('[BOT-CREATE] --->  DEPT botType selected ', this.botType);
              // if (this.botType !== 'identity') {
              //   this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT = true;
              // }
              // this.logger.log('[BOT-CREATE] --->  DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);

              this.depts_without_bot_array.push({ id: dept._id, name: dept.name })
              this.logger.log('[HOME-CDS] ---> USECASE DEPTS LENGHT > 1  DEPT NOT HAS BOT  depts_without_bot_array ', this.depts_without_bot_array);

              if (!this.dialogRefHookBoot) {
                // this.openDialogHookBot(this.depts_without_bot_array, faqkb)
                this.presentDialogChatbotSuccessfullyCreatedTheHookBot(this.depts_without_bot_array, faqkb)
              }
            }

            if (index === departments.length - 1) {
              this.logger.log('[HOME-CDS] ---> FOREACH FINISHED depts_without_bot_array ', this.depts_without_bot_array)
            }
          });
        }
      }
    }, error => {

      this.logger.error('[HOME-CDS] --->  DEPTS RES - ERROR', error);
    }, () => {
      this.logger.log('[HOME-CDS] --->  DEPTS RES - COMPLETE')
    });
  }



  hookBotToDept(deptId, botId, hookToDefaultDept?: string) {
    this.logger.log('[HOME-CDS] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT > hookToDefaultDept ', hookToDefaultDept);
    this.logger.log('[HOME-CDS] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT > deptId ', deptId, 'botId', botId);
    this.departmentService.updateExistingDeptWithSelectedBot(deptId, botId).subscribe((res) => {
      this.logger.log('[HOME-CDS] Bot Create - UPDATE EXISTING DEPT WITH SELECTED BOT - RES ', res);

    }, (error) => {
      this.logger.error('[HOME-CDS] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - ERROR ', error);

      // this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT = true
      // this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT_ERROR = true;

      // this.logger.error('[HOME-CDS] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - ERROR - HAS_COMPLETED_HOOK_BOOT_TO_DEPT', this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT);
    }, () => {
      this.logger.log('[HOME-CDS] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - COMPLETE ');

      // this.notify.showWidgetStyleUpdateNotification(this.translate.instant('BotSuccessfullyActivated'), 2, 'done');
      // this.presentModalBotCreate()

      // this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT = true
      // this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT_SUCCESS = true;
      // this.logger.log('[BOT-CREATE] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - COMPLETE - HAS_COMPLETED_HOOK_BOOT_TO_DEPT', this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT);
    });
  }

  presentDialogChatbotSuccessfullyCreated(calledBy) {
    this.logger.log('[HOME-CDS] --->  DIALOG CHATBOT CREATED calledBy ', calledBy);
    this.logger.log('[HOME-CDS] --->  DIALOG CHATBOT CREATED depts_without_bot_array 1', this.depts_without_bot_array);

    Swal.fire({
      // title: this.translate.instant('Success'),
      // text: this.translate.instant('ChatbotSuccessfullyCreated'),
      title: this.translate.instant('ChatbotSuccessfullyCreated'),
      text: this.translate.instant('NowItIsTimeToAddContent') + ' !',
      icon: "success",
      showCloseButton: false,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('Ok'),
      confirmButtonColor: "var(--blue-light)",
      focusConfirm: true,
      // reverseButtons: true,
      // buttons: [null, this.cancel],
      // dangerMode: false
    }).then((result: any) => {

      if (result.isConfirmed) {

        this.logger.log('[HOME-CDS] --->  DIALOG CHATBOT CREATED result ', result);

        this.router.navigate(['project/' + this.projectId + '/knowledge-bases/' + this.kbNameSpaceid]);
      }
    })


  }

  presentDialogChatbotSuccessfullyCreatedTheHookBot(depts_without_bot_array, faqkb) {
    this.logger.log('[HOME-CDS] --->  DIALOG CHATBOT CREATED depts_without_bot_array 1', this.depts_without_bot_array);

    Swal.fire({
      // title: this.translate.instant('Success'),
      // text: this.translate.instant('ChatbotSuccessfullyCreated'),
      title: this.translate.instant('ChatbotSuccessfullyCreated'),
      text: this.translate.instant('NowItIsTimeToAddContent') + ' !',
      icon: "success",
      showCloseButton: false,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('BotsPage.Continue') + ' ' + '<i class="fa fa-arrow-right">',
      // cancelButtonText: this.cancel,
      confirmButtonColor: "var(--blue-light)",
      reverseButtons: true,
      // dangerMode: false
    }).then((result: any) => {

      if (result.isConfirmed) {

        this.logger.log('[HOME-CDS] --->  DIALOG CHATBOT CREATED result ', result);

        this.openDialogHookBot(depts_without_bot_array, faqkb)
      }
    })
  }

  openDialogHookBot(deptsWithoutBotArray, faqkb) {
    this.logger.log('[HOME-CDS] -------> OPEN DIALOG HOOK BOT !!!!')
    this.dialogRefHookBoot = this.dialog.open(ModalHookBotComponent, {
      width: '700px',
      data: {
        deptsWithoutBotArray: deptsWithoutBotArray,
        chatbot: faqkb
      },
    })
    this.dialogRefHookBoot.afterClosed().subscribe(result => {
      this.dialogRefHookBoot = null;
      this.logger.log(`[HOME-CDS] DIALOG HOOK BOT after closed result:`, result);
      // this.logger.log(`[HOME-CDS] DIALOG HOOK BOT after closed getState:`,  dialogRef.getState());
      // dialogRef.getState()
      if (result && result.deptId && result.botId) {
        this.hookBotToDept(result.deptId, result.botId)
        this.router.navigate(['project/' + this.projectId + '/knowledge-bases/' + this.kbNameSpaceid]);
      }
    });
  }

  presentModalBotCreate() {
    Swal.fire({
      // title: this.onlyOwnerCanManageTheAccountPlanMsg,
      title: 'Success',
      text: "You\'ve created your first chatbot to answer your users\' questions. Now it's time to deliver the content!",
      icon: "success",
      showCancelButton: false,
      confirmButtonText: "Let\'s go!",
      confirmButtonColor: "var(--blue-light)",
      focusConfirm: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['project/' + this.projectId + '/knowledge-bases/' + this.kbNameSpaceid]);
      }
    })
  }


}
