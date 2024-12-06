import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HomeKbModalComponent } from './home-kb-modal/home-kb-modal.component';
import { KB, KbSettings } from 'app/models/kbsettings-model';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { OpenaiService } from 'app/services/openai.service';
import { AuthService } from 'app/core/auth.service';
import { Router } from '@angular/router';
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { NotifyService } from 'app/core/notify.service';
import { UsersService } from 'app/services/users.service';
import { PLAN_NAME } from 'app/utils/util';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators'
import { Subject } from 'rxjs';
import { LocalDbService } from 'app/services/users-local-db.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { ChatbotModalComponent } from 'app/bots/bots-list/chatbot-modal/chatbot-modal.component';
import { FaqService } from 'app/services/faq.service';
import { ModalHookBotComponent } from 'app/knowledge-bases/modals/modal-hook-bot/modal-hook-bot.component';
import { DepartmentService } from 'app/services/department.service';
import { ModalChatbotNameComponent } from 'app/knowledge-bases/modals/modal-chatbot-name/modal-chatbot-name.component';
const Swal = require('sweetalert2')
@Component({
  selector: 'appdashboard-home-kb',
  templateUrl: './home-kb.component.html',
  styleUrls: ['./home-kb.component.scss']
})
export class HomeKbComponent extends PricingBaseComponent implements OnInit {
  PLAN_NAME = PLAN_NAME;
  @Output() trackUserAction = new EventEmitter();
  private unsubscribe$: Subject<any> = new Subject<any>();
  addButtonDisabled: boolean = false;
  project: any;
  kbCount: number;
  projectId: string;
  namespaces: any;
  kbSettings: KbSettings = {
    _id: null,
    id_project: null,
    gptkey: null,
    maxKbsNumber: null,
    maxPagesNumber: null,
    kbs: []
  }

  newKb: KB = {
    _id: null,
    name: '',
    url: ''
  }

  onlyOwnerCanManageTheAccountPlanMsg: string;
  learnMoreAboutDefaultRoles: string;
  areNewKb: boolean;

  kbNameSpaceid: string = '';
  kbNameSpaceName: string;
  kbAssistantName: string;
  kbOfficialResponderTag = "kb-official-responder";
  chatbotsUsingNamespace: any;
  dept_id: string;
  private dialogRefHookBoot: MatDialogRef<any>;
  private dialogRefCreateCb: MatDialogRef<any>;
  depts_without_bot_array = [];
  chatbotCount: number;
  depts: any;
  namespaceCount: number;

  constructor(
    public dialog: MatDialog,
    private kbService: KnowledgeBaseService,
    private logger: LoggerService,
    private openaiService: OpenaiService,
    private auth: AuthService,
    public router: Router,
    public prjctPlanService: ProjectPlanService,
    public notify: NotifyService,
    public usersService: UsersService,
    private translate: TranslateService,
    public localDbService: LocalDbService,
    private faqKbService: FaqKbService,
    public faqService: FaqService,
    private departmentService: DepartmentService,
  ) {
    super(prjctPlanService, notify);
  }

  ngOnInit(): void {
    // this.getKnowledgeBaseSettings();
    this.getCurrentProject();
    this.getProjectPlan();
    this.translateString();
    this.getKnowledgeBaseSettings();
    this.getUserRole()
    this.getFaqKbByProjectId()
  }


  getUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((userRole) => {
        this.logger.log('[HOME-KB] - SUBSCRIPTION TO USER ROLE »»» ', userRole)
        this.USER_ROLE = userRole;
      })
  }

  getCurrentProject() {
    this.logger.log('[HOME-KB] - $ubscribe to CURRENT PROJECT ', this.project)
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {
        if (project) {
          this.project = project;
          const storedNamespace = this.localDbService.getFromStorage(`last_kbnamespace-${this.projectId}`)
          this.logger.log('[HOME-KB] storedNamespace', storedNamespace);
          if (storedNamespace) {
            let storedNamespaceObjct = JSON.parse(storedNamespace)
            this.logger.log('[HOME-KB] storedNamespaceObjct', storedNamespaceObjct);
            this.kbNameSpaceid = storedNamespaceObjct.id;
            this.kbNameSpaceName = storedNamespaceObjct.name
            this.getChatbotUsingNamespace(this.kbNameSpaceid)
          } else {
            this.getAllNamespaces()
          }
        }
      })
  }


   getFaqKbByProjectId() {
    this.faqKbService.getFaqKbByProjectId().subscribe((faqKb: any) => {
      this.logger.log('[HOME-KB] - GET BOTS BY PROJECT ID', faqKb);
      if (faqKb) {
        this.chatbotCount = faqKb.length;
        this.logger.log('[HOME-KB] - GET BOTS BY PROJECT ID chatbotCount', this.chatbotCount);
      }
    }, (error) => {
      this.logger.error('[HOME-KB] GET BOTS ERROR ', error);

    }, () => {
      this.logger.log('[HOME-KB] GET BOTS COMPLETE');
    });
  }

  getAllNamespaces() {
    this.kbService.getAllNamespaces().subscribe((namespaces: any) => {
      if (namespaces) {
        this.logger.log('[HOME-KB] - GET ALL NAMESPACES', namespaces);
        this.namespaces = namespaces

        this.namespaceCount = this.namespaces.length
        this.logger.log('[HOME-KB] - GET ALL NAMESPACES -> NAMESPACES count', namespaces);
        this.namespaces.sort(function compare(a, b) {
          if (a['updatedAt'] > b['updatedAt']) {
            return -1;
          }
          if (a['updatedAt'] < b['updatedAt']) {
            return 1;
          }
          return 0;
        });

        this.logger.log('[HOME-KB] - GET ALL NAMESPACES ', namespaces);
        this.kbNameSpaceid = namespaces[0].id;
        this.kbNameSpaceName = namespaces[0].name
        this.getChatbotUsingNamespace(this.kbNameSpaceid)

      }
    }, (error) => {
      this.logger.error('[HOME-KB]  GET GET ALL NAMESPACES ERROR ', error);

    }, () => {
      this.logger.log('[HOME-KB]  GET ALL NAMESPACES * COMPLETE *');
      
    });
  }

  getChatbotUsingNamespace(selectedNamespaceid: string) {
    this.chatbotsUsingNamespace = []
    this.kbService.getChatbotsUsingNamespace(selectedNamespaceid).subscribe((kbAssistants: any) => {

      this.logger.log('[HOME-KB] - GET kbAssistant USING NAMESPACE kbAssistants', kbAssistants);
      this.chatbotsUsingNamespace = kbAssistants

      if (this.chatbotsUsingNamespace.length > 0) {
        this.kbAssistantName = kbAssistants[0].name
      }

    }, (error) => {
      this.logger.error('[HOME-KB] - GET CHATBOTS USING NAMESPACE ', error);

    }, () => {
      this.logger.log('[HOME-KB] - GET CHATBOTS USING NAMESPACE * COMPLETE *');
     

    });
  }


  createChatbotfromKbOfficialResponderTemplate() {
    this.findKbOfficialResponderAndThenExportToJSON()
    if (this.chatBotLimit) {
      if (this.chatbotCount < this.chatBotLimit) {
        this.logger.log('[HOME-KB] USECASE  chatBotCount < chatBotLimit: RUN findKbOfficial')
        this.findKbOfficialResponderAndThenExportToJSON()
      } else if (this.chatbotCount >= this.chatBotLimit) {
        this.logger.log('[HOME-KB] USECASE  chatBotCount >= chatBotLimit DISPLAY MODAL')
        this.presentDialogReachedChatbotLimit()
      }
    } else if (!this.chatBotLimit) {
      this.logger.log('[HOME-KB] USECASE  NO chatBotLimit: RUN findKbOfficial')
      this.findKbOfficialResponderAndThenExportToJSON()
    }
  }
  presentDialogReachedChatbotLimit() {
    this.logger.log('[HOME-KB] openDialog presentDialogReachedChatbotLimit prjct_profile_name ', this.prjct_profile_name)
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
      this.logger.log(`[HOME-KB] Dialog result: ${result}`);
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
        this.logger.log('[HOME-KB] kbOfficialResponderTemplate', kbOfficialResponderTemplate)
        if (kbOfficialResponderTemplate) {
          this.exportKbOfficialResponderToJSON(kbOfficialResponderTemplate._id)
        }
      }
    })
  }

  exportKbOfficialResponderToJSON(kbOfficialResponderTemplate_id) {
    this.faqKbService.exportChatbotToJSON(kbOfficialResponderTemplate_id).subscribe((chatbot: any) => {
      this.logger.log('[HOME-KB] - EXPORT CHATBOT TO JSON - CHATBOT', chatbot)
      this.logger.log('[HOME-KB] - EXPORT CHATBOT TO JSON - CHATBOT INTENTS', chatbot.intents)
      const intentArray = chatbot.intents
      const actionsArray = []
      chatbot.intents.forEach((intent, index, intentArray) => {
        // this.logger.log('[HOME-KB] - EXPORT CHATBOT TO JSON - CHATBOT INTENT > actions', intent.actions)
        this.logger.log('[HOME-KB] - EXPORT CHATBOT TO JSON - CHATBOT INTENT > actions > intent', intent)

        actionsArray.push(intent.actions)


        const askGPT_Action = intent.actions.find(o => o._tdActionType === "askgptv2")

        if (askGPT_Action) {
          askGPT_Action.namespace = this.kbNameSpaceid
          this.logger.log('[HOME-KB] - EXPORT CHATBOT TO JSON - CHATBOT INTENT > actions askGPT_Action', askGPT_Action)

        }
        // ----------------------------------------------------------------------------
        // Find a solution! This no more working affter that the template was changed
        // ----------------------------------------------------------------------------
        // const replyActionWithWelcomeMsg = intent.actions.find(x => x.text !== undefined);
        // if(replyActionWithWelcomeMsg) {
        //   this.logger.log('[HOME-KB] - EXPORT CHATBOT TO JSON - CHATBOT INTENT > actions replyActionWithWelcomeMsg', replyActionWithWelcomeMsg)
        //   replyActionWithWelcomeMsg.text = this.welcomeMsg

        //   if (replyActionWithWelcomeMsg && replyActionWithWelcomeMsg.attributes && replyActionWithWelcomeMsg.attributes.commands) {
        //     const actionCommands = replyActionWithWelcomeMsg.attributes.commands
        //     this.logger.log('[HOME-KB] - EXPORT CHATBOT TO JSON - CHATBOT INTENT > actions replyActionWithWelcomeMsg actionCommands', actionCommands)
        //     actionCommands.forEach(command => {
        //       if (command.type === "message" ) {

        //         this.logger.log("[HOME-KB] - EXPORT CHATBOT TO JSON - CHATBOT INTENT > actions replyActionWithWelcomeMsg actionCommands command ", command.message.text) 
        //         command.message.text = this.welcomeMsg

        //       }

        //     });
        //   }

        // }

        // if (askGPT_Action &&  replyActionWithWelcomeMsg) {

        // }

        if (index === intentArray.length - 1) {
          // this.logger.log('[HOME-KB] - askGPT_Action' , askGPT_Action)
          // this.logger.log('[HOME-KB] - replyActionWithWelcomeMsg' , replyActionWithWelcomeMsg)
          this.logger.log('[HOME-KB] - actionsArray', actionsArray)
          if (!this.dialogRefCreateCb) {
            this.presentDialogChatbotname(chatbot)
          }

        }
      });

    }, (error) => {
      this.logger.error('[HOME-KB] - EXPORT BOT TO JSON - ERROR', error);
    }, () => {
      this.logger.log('[HOME-KB] - EXPORT BOT TO JSON - COMPLETE');


    });
  }

  presentDialogChatbotname(chatbot) {
    this.logger.log('[HOME-KB] openDialog presentDialogChatbotname chatbot ', chatbot)
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
        this.logger.log(`[HOME-KB] DIALOG CHATBOT NAME editedChatbot:`, editedChatbot);
        this.importChatbotFromJSON(editedChatbot)
      }
    });
  }


  importChatbotFromJSON(editedChatbot) {
    this.logger.log('[HOME-KB] - IMPORT CHATBOT FROM JSON editedChatbot ', editedChatbot)
    this.faqService.importChatbotFromJSONFromScratch(editedChatbot).subscribe((faqkb: any) => {
      this.logger.log('[HOME-KB] - IMPORT CHATBOT FROM JSON - ', faqkb)
      if (faqkb) {
        this.logger.log('[HOME-KB] - IMPORT CHATBOT FROM JSON faqkb certifiedTags  ', faqkb.certifiedTags)
        faqkb.certifiedTags

        this.getDeptsByProjectId(faqkb)

      }

    }, (error) => {
      this.logger.error('[HOME-KB] -  IMPORT CHATBOT FROM JSON- ERROR', error);
    }, () => {
      this.logger.log('[HOME-KB] - IMPORT CHATBOT FROM JSON - COMPLETE');

    });
  }


  getDeptsByProjectId(faqkb?: string) {
    this.departmentService.getDeptsByProjectId().subscribe((departments: any) => {

      this.logger.log('[HOME-KB] --->  DEPTS RES ', departments);

      if (departments) {
        const depts_length = departments.length
        this.logger.log('[HOME-KB] --->  DEPTS LENGHT ', depts_length);

        if (depts_length === 1) {
          // this.DISPLAY_SELECT_DEPTS_WITHOUT_BOT = false
          this.dept_id = departments[0]['_id']

          this.logger.log('[HOME-KB] ---> USECASE DEPTS LENGHT = 1 - DEFAULT DEPT HAS BOT ', departments[0].hasBot);
          this.logger.log('[HOME-KB] ---> USECASE DEPTS LENGHT = 1 - DEFAULT DEPT HAS BOT ', departments[0]);

          if (departments[0].hasBot === true) {
            this.presentDialogChatbotSuccessfullyCreated('1')


            this.logger.log('[HOME-KB] --->  DEFAULT DEPT HAS BOT ');
            // this.DISPLAY_BTN_ACTIVATE_BOT_FOR_NEW_CONV = false;
            // this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT = false

            // this.logger.log('Bot Create --->  DEFAULT DEPT HAS BOT DISPLAY_BTN_ACTIVATE_BOT_FOR_NEW_CONV ', this.DISPLAY_BTN_ACTIVATE_BOT_FOR_NEW_CONV);
            // this.logger.log('[HOME-KB] --->  DEFAULT DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);
          } else {
            this.logger.log('[HOME-KB] ---> USECASE DEPTS LENGHT = 1 DEFAULT DEPT NOT HAS BOT ', departments[0]);
            this.logger.log('[HOME-KB] ---> USECASE DEPTS LENGHT = 1 DEFAULT DEPT NOT HAS BOT ', departments[0].hasBot);
            this.hookBotToDept(departments[0]._id, faqkb, 'hookToDefaultDept');
            this.presentDialogChatbotSuccessfullyCreated('2')


            // this.DISPLAY_BTN_ACTIVATE_BOT_FOR_NEW_CONV = true;
            // this.logger.log('[HOME-KB] --->  DEFAULT DEPT botType selected ', this.botType);
            // if (this.botType !== 'identity') {
            // this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT = true;
          }

          // this.logger.log('[HOME-KB] --->  DEFAULT DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);
        } else if (depts_length > 1) {
          this.logger.log('[HOME-KB] --->  DEPTS LENGHT  USECASE DEPTS LENGHT > 1', depts_length);

          // this.DISPLAY_SELECT_DEPTS_WITHOUT_BOT = true;
          departments.forEach((dept, index, departments) => {

            if (dept.hasBot === true) {
              this.logger.log('[HOME-KB] ---> USECASE DEPTS LENGHT > 1  DEPT HAS BOT ');


              // this.logger.log('[BOT-CREATE] --->  DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);
            } else {
              this.logger.log('[HOME-KB] ---> USECASE DEPTS LENGHT > 1  DEPT NOT HAS BOT ');
              // this.logger.log('[BOT-CREATE] --->  DEPT botType selected ', this.botType);
              // if (this.botType !== 'identity') {
              //   this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT = true;
              // }
              // this.logger.log('[BOT-CREATE] --->  DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);

              this.depts_without_bot_array.push({ id: dept._id, name: dept.name })
              this.logger.log('[HOME-KB] ---> USECASE DEPTS LENGHT > 1  DEPT NOT HAS BOT  depts_without_bot_array ', this.depts_without_bot_array);

              if (!this.dialogRefHookBoot) {
                // this.openDialogHookBot(this.depts_without_bot_array, faqkb)
                this.presentDialogChatbotSuccessfullyCreatedTheHookBot(this.depts_without_bot_array, faqkb)
              }
            }

            if (index === departments.length - 1) {
              this.logger.log('[HOME-KB] ---> FOREACH FINISHED depts_without_bot_array ', this.depts_without_bot_array)
            }
          });


        }
      }
    }, error => {

      this.logger.error('[HOME-KB] --->  DEPTS RES - ERROR', error);
    }, () => {
      this.logger.log('[HOME-KB] --->  DEPTS RES - COMPLETE')
    });
  }


  hookBotToDept(deptId, botId, hookToDefaultDept?: string) {
    this.logger.log('[HOME-KB] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT > hookToDefaultDept ', hookToDefaultDept);
    this.logger.log('[HOME-KB] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT > deptId ', deptId, 'botId', botId);
    this.departmentService.updateExistingDeptWithSelectedBot(deptId, botId).subscribe((res) => {
      this.logger.log('[HOME-KB] Bot Create - UPDATE EXISTING DEPT WITH SELECTED BOT - RES ', res);

    }, (error) => {
      this.logger.error('[HOME-KB] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - ERROR ', error);

      // this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT = true
      // this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT_ERROR = true;

      // this.logger.error('[HOME-KB] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - ERROR - HAS_COMPLETED_HOOK_BOOT_TO_DEPT', this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT);
    }, () => {
      this.logger.log('[HOME-KB] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - COMPLETE ');

      // this.notify.showWidgetStyleUpdateNotification(this.translate.instant('BotSuccessfullyActivated'), 2, 'done');
      // this.presentModalBotCreate()

      // this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT = true
      // this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT_SUCCESS = true;
      // this.logger.log('[BOT-CREATE] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - COMPLETE - HAS_COMPLETED_HOOK_BOOT_TO_DEPT', this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT);
    });
  }


  presentDialogChatbotSuccessfullyCreated(calledBy) {
    this.logger.log('[HOME-KB] --->  DIALOG CHATBOT CREATED calledBy ', calledBy);
    this.logger.log('[HOME-KB] --->  DIALOG CHATBOT CREATED depts_without_bot_array 1', this.depts_without_bot_array);

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

        this.logger.log('[HOME-KB] --->  DIALOG CHATBOT CREATED result ', result);

        this.router.navigate(['project/' + this.projectId + '/knowledge-bases/' + this.kbNameSpaceid]);
      }
    })


  }


  presentDialogChatbotSuccessfullyCreatedTheHookBot(depts_without_bot_array, faqkb) {
    this.logger.log('[HOME-KB] --->  DIALOG CHATBOT CREATED depts_without_bot_array 1', this.depts_without_bot_array);

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

        this.logger.log('[HOME-KB] --->  DIALOG CHATBOT CREATED result ', result);

        this.openDialogHookBot(depts_without_bot_array, faqkb)
      }
    })
  }

  openDialogHookBot(deptsWithoutBotArray, faqkb) {
    this.logger.log('[HOME-KB] -------> OPEN DIALOG HOOK BOT !!!!')
    this.dialogRefHookBoot = this.dialog.open(ModalHookBotComponent, {
      width: '700px',
      data: {
        deptsWithoutBotArray: deptsWithoutBotArray,
        chatbot: faqkb
      },
    })
    this.dialogRefHookBoot.afterClosed().subscribe(result => {
      this.dialogRefHookBoot = null;
      this.logger.log(`[HOME-KB] DIALOG HOOK BOT after closed result:`, result);
      // this.logger.log(`[HOME-KB] DIALOG HOOK BOT after closed getState:`,  dialogRef.getState());
      // dialogRef.getState()
      if (result && result.deptId && result.botId) {
        this.hookBotToDept(result.deptId, result.botId)
        this.router.navigate(['project/' + this.projectId + '/knowledge-bases/' + this.kbNameSpaceid]);
      }
    });
  }

  

  getKnowledgeBaseSettings() {
    this.kbService.getKbSettingsPrev().subscribe((kbSettings: KbSettings) => {
      this.logger.log("[HOME-KB] get kbSettings RES ", kbSettings);
      if (kbSettings && kbSettings.kbs) {
        if (kbSettings.kbs.length === 0) {
          this.areNewKb = true;
        } else if (kbSettings.kbs.length > 0) {
          this.areNewKb = false;
        }

      } else {
        this.areNewKb = true;
      }

    }, (error) => {
      this.logger.error("[HOME-KB] get kbSettings ERROR ", error);
    }, () => {
      this.logger.log("HOME-KB] get kbSettings * COMPLETE *");

    })
  }


  // goToKnowledgeBases() {
  //   // this.trackUserAction.emit({action:'Home, Add Knowledge Base button clicked',actionRes: null })
  //   this.logger.log("goToKnowledgeBases -----> project._id: ", this.project._id);
  //   this.router.navigate(['project/' + this.project._id + '/knowledge-bases/h'])
  // }

  goToKnowledgeBases() {
    const storedNamespace = this.localDbService.getFromStorage(`last_kbnamespace-${this.project._id}`)
    this.logger.log('[HOME-KB] storedNamespace', storedNamespace);
    if (storedNamespace) {
      let storedNamespaceObjct = JSON.parse(storedNamespace)
      this.logger.log('[BOTS-SIDEBAR] storedNamespaceObjct', storedNamespaceObjct);
      this.kbNameSpaceid = storedNamespaceObjct.id
    }

    this.logger.log("goToKnowledgeBases -----> project._id: ", this.project._id);
    if (this.areNewKb) {
      if (this.kbNameSpaceid !== '') {
        this.router.navigate(['project/' + this.project._id + '/knowledge-bases/' + this.kbNameSpaceid]);
      } else {
        this.router.navigate(['project/' + this.project._id + '/knowledge-bases/0']);
      }

      // this.router.navigate(['project/' + this.project._id + '/knowledge-bases'])

    } else if (!this.areNewKb) {
      this.router.navigate(['project/' + this.project._id + '/knowledge-bases-pre'])
    }
  }


  openModalSubsExpired() {
    if (this.USER_ROLE === 'owner') {
      if (this.profile_name !== PLAN_NAME.C && this.profile_name !== PLAN_NAME.F) {
        this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
      } else if (this.profile_name === PLAN_NAME.C || this.profile_name === PLAN_NAME.F) {
        this.notify.displayEnterprisePlanHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
      }
    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan();
    }
  }

  // openModalTrialExpired() {
  //   if (this.USER_ROLE === 'owner') {  
  //       this.notify.displayTrialHasExpiredModal(this.projectId);
  //   } else {
  //     this.presentModalOnlyOwnerCanManageTheAccountPlan();
  //   }
  // }

  presentModalOnlyOwnerCanManageTheAccountPlan() {
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyOwnerCanManageTheAccountPlanMsg, this.learnMoreAboutDefaultRoles)
  }


  translateString() {
    this.translateModalOnlyOwnerCanManageProjectAccount()
  }
  translateModalOnlyOwnerCanManageProjectAccount() {
    this.translate.get('OnlyUsersWithTheOwnerRoleCanManageTheAccountPlan')
      .subscribe((translation: any) => {
        this.onlyOwnerCanManageTheAccountPlanMsg = translation;
      });

    this.translate.get('LearnMoreAboutDefaultRoles')
      .subscribe((translation: any) => {
        this.learnMoreAboutDefaultRoles = translation;
      });
  }
}
