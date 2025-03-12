import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { IntegrationService } from 'app/services/integration.service';
import { APPS_TITLE, BrevoIntegration, N8nIntegration, CATEGORIES_LIST, CustomerioIntegration, HubspotIntegration, INTEGRATIONS_CATEGORIES, INTEGRATIONS_KEYS, INTEGRATION_LIST_ARRAY, MakeIntegration, OpenaiIntegration, QaplaIntegration, INTEGRATION_LIST_ARRAY_CLONE, GoogleIntegration, AnthropicIntegration, GroqIntegration, CohereIntegration, DeepseekIntegration,  } from './utils'; // OllamaIntegration, DeepseekIntegration
import { LoggerService } from 'app/services/logger/logger.service';
import { NotifyService } from 'app/core/notify.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from 'app/services/users.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { BrandService } from 'app/services/brand.service';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { PLAN_NAME } from 'app/utils/util';
import { AppStoreService } from 'app/services/app-store.service';
import { environment } from 'environments/environment';
import { ProjectUser } from 'app/models/project-user';


const swal = require('sweetalert');
const Swal = require('sweetalert2')

@Component({
  selector: 'appdashboard-integrations',
  templateUrl: './integrations.component.html',
  styleUrls: ['./integrations.component.scss']
})


export class IntegrationsComponent implements OnInit, OnDestroy {
  project: any;
  projectID: string;
  project_plan: any;
  profile_name: string;
  customization: string;
  public IS_OPEN_SETTINGS_SIDEBAR: boolean;
  isChromeVerGreaterThan100: boolean;
  panelOpenState = true;
  integrationSelectedName: string = "none";
  integrationSelectedType: string = "none";

  integrations = [];
  selectedIntegration: any;
  selectedIntegrationModel: null;
  integrationLocked: boolean = false;
  intName: string;
  integrationListReady: boolean = false;

  INT_KEYS = INTEGRATIONS_KEYS;
  INTEGRATIONS = INTEGRATION_LIST_ARRAY;

  CATEGORIES = CATEGORIES_LIST;

  plan_expired: boolean = false;
  plan_require: string = "";
  private unsubscribe$: Subject<any> = new Subject<any>();
  USER_ROLE: string;
  ROLE_IS_AGENT: boolean;

  onlyOwnerCanManageTheAccountPlanMsg: string;
  learnMoreAboutDefaultRoles: string;

  translateparams: any;
  showSpinner: boolean = true;
  showInIframe: boolean = false;
  renderUrl: string;
  availableApps = [];

  isVisibleTelegram: boolean;
  trialExpired: boolean
  subscriptionIsActive: boolean;
  profileType: string;

  constructor(
    private auth: AuthService,
    private usersService: UsersService,
    private integrationService: IntegrationService,
    public notify: NotifyService,
    private logger: LoggerService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private brand: BrandService,
    public prjctPlanService: ProjectPlanService,
    private projectPlanService: ProjectPlanService,
    private appService: AppStoreService
  ) {
    const _brand = this.brand.getBrand();
    this.logger.log("[INTEGRATION-COMP] brand: ", _brand);
    this.translateparams = _brand;
    // this.INTEGRATIONS_CLONE = JSON.parse(JSON.stringify(INTEGRATION_LIST_ARRAY))
    
  }

  ngOnInit(): void {
    this.getCurrentProject();

    this.getProjectPlan();
    this.getBrowserVersion();
    this.listenSidebarIsOpened();
    this.translateModalOnlyOwnerCanManageProjectAccount();
    this.getProjectUserRole()
  }


  /**
   * UTILS FUNCTIONS - START
   */

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
      this.logger.log('[INTEGRATION-COMP] SETTINGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    });
  }

  getCurrentProject() {
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {
        if (project) {

          this.project = project
          this.projectID = project._id
          this.logger.log("[INTEGRATION-COMP] Project: ", this.project);
        }
      });
  }

  getProjectPlan() {
    this.projectPlanService.projectPlan$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(async (projectProfileData: any) => {
        if (projectProfileData) {
          this.logger.log('[INTEGRATION-COMP] projectProfileData ', projectProfileData)
          this.logger.log('[INTEGRATION-COMP] INTEGRATIONS ', this.INTEGRATIONS)

          this.profile_name = projectProfileData.profile_name;
          this.trialExpired = projectProfileData.trial_expired
          this.trialExpired = projectProfileData.trial_expired
          this.profileType = projectProfileData.profile_type
          this.subscriptionIsActive = projectProfileData.subscription_is_active

          this.customization = projectProfileData.customization;

          this.INTEGRATIONS.forEach(integration => {
            this.manageProBadgeVisibility(integration, projectProfileData)
          });

          await this.getApps();
          //this.manageTelegramVisibility(projectProfileData);
          this.logger.log("[INTEGRATION-COMP] app retrieved")
          this.manageAppVisibility(projectProfileData)
          this.getIntegrations();
        }
      }, (error) => {
        this.logger.error("[INTEGRATION-COMP] err: ", error);
      })
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.logger.debug("[INTEGRATION-COMP] isChromeVerGreaterThan100: ", isChromeVerGreaterThan100)
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    })
  }

  getProjectUserRole() {
    this.usersService.projectUser_bs.pipe(takeUntil(this.unsubscribe$)).subscribe((projectUser: ProjectUser) => {
      if (projectUser) {
        this.USER_ROLE = projectUser.role
        if (this.USER_ROLE === 'agent') {
          this.ROLE_IS_AGENT = true;

        } else {
          this.ROLE_IS_AGENT = false;
        }
      }
    });
  }

  /**
   * UTILS FUNCTIONS - END
   */
  getIntegrations() {
    this.getAllIntegrations().then(() => {
      this.intName = this.route.snapshot.queryParamMap.get('name');
      this.logger.log("[INTEGRATION-COMP] getIntegrations intName: ", this.intName);
      this.logger.log("[INTEGRATION-COMP] getIntegrations this.INTEGRATIONS: ", this.INTEGRATIONS);

      if (this.intName) {
        this.onIntegrationSelect(this.INTEGRATIONS.find(i => i.key === this.intName));
        this.logger.log("[INTEGRATION-COMP] getIntegrations this.INTEGRATIONS find: ", this.INTEGRATIONS.find(i => i.key === this.intName));
      }
    })
  }

  getAllIntegrations() {
    return new Promise((resolve, reject) => {
      this.integrationService.getAllIntegrations().subscribe((integrations: Array<any>) => {
        this.logger.log("[INTEGRATION-COMP] Integrations for this project ", integrations)
        this.integrations = integrations;

        this.showSpinner = false
        resolve(true);
      }, (error) => {
        this.showSpinner = false
        this.logger.error("[INTEGRATION-COMP] Get all integrations error: ", error);
        reject()
      })
    })
  }

  async getApps() {

    return new Promise((resolve) => {
      this.appService.getApps().subscribe((response: any) => {

        let whatsappApp = response.apps.find(a => (a.title === APPS_TITLE.WHATSAPP && a.version === "v2"));
        if (environment['whatsappConfigUrl']) {
          if (whatsappApp) {
            whatsappApp.runURL = environment['whatsappConfigUrl'];
            whatsappApp.channel = "whatsapp";
          } else {
            whatsappApp = {
              runURL: environment['whatsappConfigUrl'],
              channel: "whatsapp"
            }
          }
        } else {
          if (whatsappApp) {
            whatsappApp.channel = "whatsapp";
          }
        }
        this.availableApps.push(whatsappApp);

        let messengerApp = response.apps.find(a => (a.title === APPS_TITLE.MESSENGER && a.version === "v2"));
        if (environment['messengerConfigUrl']) {
          if (messengerApp) {
            messengerApp.runURL = environment['messengerConfigUrl'];
            messengerApp.channel = "messenger";
          } else {
            messengerApp = {
              runURL: environment['messengerConfigUrl'],
              channel: "messenger"
            }
          }
        }
        else {
          if (messengerApp) {
            messengerApp.channel = "messenger";
          }
        }
        this.availableApps.push(messengerApp);

        let telegramApp = response.apps.find(a => (a.title === APPS_TITLE.TELEGRAM && a.version === "v2"));
        if (environment['telegramConfigUrl']) {
          if (telegramApp) {
            telegramApp.runURL = environment['telegramConfigUrl'];
            telegramApp.channel = "telegram";
          } else {
            telegramApp = {
              runURL: environment['telegramConfigUrl'],
              channel: "telegram"
            }
          }
        }
        else {
          if (telegramApp) {
            telegramApp.channel = "telegram";
          }
        }
        this.availableApps.push(telegramApp);

        let smsApp = response.apps.find(a => (a.title === APPS_TITLE.TWILIO_SMS && a.version === "v2"));
        if (environment['smsConfigUrl']) {
          if (smsApp) {
            smsApp.runURL = environment['smsConfigUrl'];
            smsApp.channel = "sms";
          } else {
            smsApp = {
              runURL: environment['smsConfigUrl'],
              channel: "sms"
            }
          }
        }
        else {
          if (smsApp) {
            smsApp.channel = "sms";
          }
        }
        this.availableApps.push(smsApp);

        let voiceApp = response.apps.find(a => (a.title === APPS_TITLE.VXML_VOICE && a.version === "v2"));
        if (environment['voiceConfigUrl']) {
          if (voiceApp) {
            voiceApp.runURL = environment['voiceConfigUrl'];
            voiceApp.channel = "voice";
          } else {
            voiceApp = {
              voiceApp: environment['voiceConfigUrl'],
              channel: "voice"
            }
          }
        }
        else {
          if (voiceApp) {
            voiceApp.channel = "voice";
          }
        }
        this.availableApps.push(voiceApp);

        // -------

        let voiceTwiloApp = response.apps.find(a => (a.title === APPS_TITLE.TWILIO_VOICE && a.version === "v2"));

        if (environment['voiceTwilioConfigUrl']) {
          if (voiceTwiloApp) {
            voiceTwiloApp.runURL = environment['voiceTwilioConfigUrl'];
            voiceTwiloApp.channel = "voice-twilio";
          } else {
            voiceTwiloApp = {
              voiceTwiloApp: environment['voiceTwilioConfigUrl'],
              channel: "voice-twilio"
            }
          }
        }
        else {
          this.logger.log('heree voiceTwiloApp ', voiceTwiloApp)
          if (voiceTwiloApp) {
            voiceTwiloApp.channel = "voice-twilio";
          }
        }
        this.availableApps.push(voiceTwiloApp);

        // -------


        resolve(true);

      }, (error) => {
        this.logger.error("--> error getting apps: ", error)
      })
    })
  }

  onIntegrationSelect(integration) {
    this.logger.log("[INTEGRATIONS]- onIntegrationSelect integration", integration)
    this.integrationSelectedType = 'none'
    this.integrationLocked = false;
    this.checkPlan(integration.plan).then(() => {
      this.integrationSelectedName = integration.key;
      this.logger.log("[INTEGRATIONS]- onIntegrationSelect integrationSelectedName", integration.key)
      this.logger.log("[INTEGRATIONS]- onIntegrationSelect this.integrations", this.integrations)
      this.selectedIntegration = this.integrations.find(i => i.name === integration.key);
      this.logger.log("[INTEGRATIONS]- onIntegrationSelect selectedIntegration", this.selectedIntegration)
      if (!this.selectedIntegration) {
        this.selectedIntegration = this.initializeIntegration(integration.key);
      }
      this.logger.log("[INTEGRATIONS]- onIntegrationSelect integration.category", integration.category, ' INTEGRATIONS_CATEGORIES.CHANNEL ', INTEGRATIONS_CATEGORIES.CHANNEL)
      if (integration && integration.category === INTEGRATIONS_CATEGORIES.CHANNEL) {
        this.logger.log("[INTEGRATIONS]- OLLa ")
        // this.integrationSelectedName = "external";

        this.integrationSelectedType = "external";
        this.showInIframe = true;
        this.logger.log("[INTEGRATIONS]- onIntegrationSelect integrationSelectedType", this.integrationSelectedType, ' showInIframe ', this.showInIframe)
        this.logger.log("[INTEGRATIONS]- availableApps ", this.availableApps)
        let app = this.availableApps.find(a => a.channel === integration.key);
        this.logger.log("[INTEGRATIONS]- app ", app)

        this.renderUrl = app.runURL;
      } else {
        this.showInIframe = false;
      }
      this.selectedIntegrationModel = integration;
      this.changeRoute(integration.key);
    }).catch(() => {
      this.showInIframe = false;
      this.integrationLocked = true;
      this.plan_require = integration.plan;
      this.integrationSelectedName = integration.key;
      this.selectedIntegration = this.integrations.find(i => i.name === integration.key);
      if (!this.selectedIntegration) {
        this.selectedIntegration = this.initializeIntegration(integration.key);
      }
      this.selectedIntegrationModel = integration;
      this.changeRoute(integration.key);

      // this.integrationSelectedName = 'none';
      // this.integrationLocked = true;
      // this.plan_require = integration.plan;
      this.logger.log("Integration unavailable for your project")
      this.logger.log("available for plan ", integration.plan)
    })
  }

  integrationUpdateEvent(data) {
    this.logger.log('[INTEGRATION-COMP] data',  data) 
    this.integrationService.saveIntegration(data.integration).subscribe((result) => {
      this.logger.log("[INTEGRATION-COMP] Save integration result: ", result);
      // this.notify.showNotification("Saved successfully", 2, 'done');
      this.reloadSelectedIntegration(data.integration);
      // if (data.isVerified === true) {
      //   this.notify.showWidgetStyleUpdateNotification("Saved successfully", 2, 'done');
      // } else {
      //   this.notify.showWidgetStyleUpdateNotification("Saved but not verified", 3, 'priority_high');
      // }

      this.notify.showWidgetStyleUpdateNotification("Saved successfully", 2, 'done');

    }, (error) => {
      this.logger.error("[INTEGRATION-COMP] Save integration error: ", error);
    })
  }

  integrationDeletedEvent(integration) {
    this.presentDeleteConfirmModal(integration);
  }

  reloadSelectedIntegration(integration) {
    this.getAllIntegrations().then(() => {
      this.onIntegrationSelect(this.INTEGRATIONS.find(i => i.key === integration.name));
    })
  }
  // TheIntegratonWillBeDeleted
  // TheIntegrationHasBeenDeleted
  // AnErrorOccurreWhileDeletingTheIntegration
  presentDeleteConfirmModal(integration) {
    Swal.fire({
      title: this.translate.instant('AreYouSure'), // "Are you sure?",
      text: this.translate.instant('TheIntegratonWillBeDeleted'),
      icon: "warning",
      showCloseButton: false,
      showCancelButton: true,
      showConfirmButton: false,
      showDenyButton: true,
      denyButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
      focusConfirm: false,
      reverseButtons: true,
      // buttons: ["Cancel", "Delete"],
      // dangerMode: true,
    }).then((result) => {
      if (result.isDenied) {

        this.integrationService.deleteIntegration(integration._id).subscribe((result) => {
          this.logger.debug("[INTEGRATION-COMP] Delete integration result: ", result);
          Swal.fire({
            title: this.translate.instant('Done') + "!",
            text: this.translate.instant('TheIntegrationHasBeenDeleted'),
            icon: "success",
            showCloseButton: false,
            showCancelButton: false,
            // confirmButtonColor: "var(--primary-btn-background)",
            confirmButtonText: this.translate.instant('Ok'),
          }).then((okpressed) => {
            this.logger.log("[INTEGRATION-COMP]  ok pressed")
          });
          this.reloadSelectedIntegration(integration);

        }, (error) => {
          this.logger.error("[INTEGRATION-COMP] Delete integration error: ", error);
          Swal.fire({
            title: this.translate.instant('Oops') + '!',
            text: this.translate.instant('AnErrorOccurreWhileDeletingTheIntegration'), 
            icon: "error",
            showCloseButton: false,
            showCancelButton: false,
            confirmButtonText: this.translate.instant('Ok'),
            // confirmButtonColor: "var(--primary-btn-background)",
          });
        })
      } else {
        this.logger.log('[INTEGRATION-COMP] operation aborted')
      }
    });
  }

  presentUpgradePlanModal() {
    this.logger.log("[INTEGRATION-COMP] apro la modale");
    swal({
      title: "Upgrade plan",
      text: "Upgrade your plan to get this feature",
      icon: "warning",
      buttons: ["Cancel", "Upgrade!"],
      dangerMode: true,
    }).then((WillUpgrade) => {
      if (WillUpgrade) {

        this.logger.log("[INTEGRATION-COMP] route vs plan management");
        this.goToPricing();

      } else {
        this.logger.log('[INTEGRATION-COMP]  operation aborted')
      }
    });
  }

  changeRoute(key) {
    this.logger.log("[INTEGRATION-COMP] change route in ", key);
    this.router.navigate(['project/' + this.projectID + '/integrations/'], { queryParams: { name: key } })
  }

  goToPricing() {
    // if (this.ROLE_IS_AGENT === false) {
    if (this.USER_ROLE === 'owner') {
      // this.presentModalUpgradePlan()
      this.router.navigate(['project/' + this.projectID + '/pricing']);
    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan()
    }
  }

  presentModalOnlyOwnerCanManageTheAccountPlan() {
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyOwnerCanManageTheAccountPlanMsg, this.learnMoreAboutDefaultRoles)
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


  initializeIntegration(key: INTEGRATIONS_KEYS) {
    this.logger.log("[INTEGRATION-COMP] initializeIntegration key ", key, 'INTEGRATIONS_KEYS ', INTEGRATIONS_KEYS);
    if (key === INTEGRATIONS_KEYS.OPENAI) {
      return new OpenaiIntegration();
    }

    if (key === INTEGRATIONS_KEYS.GOOGLE) {
      return new GoogleIntegration();
    }

    if (key === INTEGRATIONS_KEYS.ANTHROPIC) {
      return new AnthropicIntegration();
    }

    if (key === INTEGRATIONS_KEYS.GROQ) {
      return new GroqIntegration();
    }

    if (key === INTEGRATIONS_KEYS.COHERE) {
      return new CohereIntegration();
    }

    // if (key === INTEGRATIONS_KEYS.OLLAMA) {
    //   return new OllamaIntegration();
    // }

    if (key === INTEGRATIONS_KEYS.DEEPSEEK) {
      return new DeepseekIntegration();
    }

    if (key === INTEGRATIONS_KEYS.MAKE) {
      return new MakeIntegration();
    }
    if (key === INTEGRATIONS_KEYS.QAPLA) {
      return new QaplaIntegration();
    }
    if (key === INTEGRATIONS_KEYS.HUBSPOT) {
      return new HubspotIntegration();
    }
    if (key === INTEGRATIONS_KEYS.CUSTOMERIO) {
      return new CustomerioIntegration();
    }
    if (key === INTEGRATIONS_KEYS.BREVO) {
      return new BrevoIntegration();
    }
    if (key === INTEGRATIONS_KEYS.N8N) {
      return new N8nIntegration();
    }
  }


  manageProBadgeVisibility(integration: any, projectProfileData: any) {
    if (this.profileType === 'free') {
      this.logger.log('[INTEGRATION-COMP] >>> CURRENT PLAN ', projectProfileData.profile_name)

      if (projectProfileData.trial_expired === true) {

        this.logger.log('[INTEGRATION-COMP] USECASE PLAN ,', this.profile_name, 'TRIAL EXPIRED ', projectProfileData.trial_expired)
        if (integration.plan === 'Sandbox') {
          this.logger.log('[INTEGRATION-COMP] INTEGRATION NAME ', integration.name, '  AVAILABLE FOM ', integration.plan, ' PLAN ')
          integration['displayBadge'] = false
        }
        if (integration.plan === PLAN_NAME.D) {
          this.logger.log('[INTEGRATION-COMP] INTEGRATION NAME ', integration.name, '  AVAILABLE FOM ', integration.plan, ' PLAN ')
          integration['displayBadge'] = true
        }
        if (integration.plan === PLAN_NAME.E) {
          this.logger.log('[INTEGRATION-COMP] INTEGRATION NAME ', integration.name, '  AVAILABLE FOM ', integration.plan, ' PLAN ')
          integration['displayBadge'] = true
        }
        if (integration.plan === PLAN_NAME.EE) {
          this.logger.log('[INTEGRATION-COMP] INTEGRATION NAME ', integration.name, '  AVAILABLE FOM ', integration.plan, ' PLAN ')
          integration['displayBadge'] = true
        }
        if (integration.plan === PLAN_NAME.F) {
          this.logger.log('[INTEGRATION-COMP] INTEGRATION NAME ', integration.name, '  AVAILABLE FOM ', integration.plan, ' PLAN ')
          integration['displayBadge'] = true
        }

      } else if (projectProfileData.trial_expired === false) {
        this.logger.log('[INTEGRATION-COMP] USECASE PLAN ,', this.profile_name, 'TRIAL EXPIRED ', projectProfileData.trial_expired)


        if (integration.plan === "Sandbox") {
          this.logger.log('[INTEGRATION-COMP] INTEGRATION NAME ', integration.name, '  AVAILABLE FOM ', integration.plan, ' PLAN ')
          integration['displayBadge'] = false
        }

        if (integration.plan === PLAN_NAME.D) {
          this.logger.log('[INTEGRATION-COMP] INTEGRATION NAME ', integration.name, '  AVAILABLE FOM ', integration.plan, ' PLAN ')
          integration['displayBadge'] = false
        }
        if (integration.plan === PLAN_NAME.E) {
          this.logger.log('[INTEGRATION-COMP] INTEGRATION NAME ', integration.name, '  AVAILABLE FOM ', integration.plan, ' PLAN ')
          integration['displayBadge'] = false
        }
        if (integration.plan === PLAN_NAME.EE) {
          this.logger.log('[INTEGRATION-COMP] INTEGRATION NAME ', integration.name, '  AVAILABLE FOM ', integration.plan, ' PLAN ')
          integration['displayBadge'] = false
        }
        if (integration.plan === PLAN_NAME.F) {
          this.logger.log('[INTEGRATION-COMP] INTEGRATION NAME ', integration.name, '  AVAILABLE FOM ', integration.plan, ' PLAN ')
          integration['displayBadge'] = true
        }
        // }



      }
    } else if (this.profileType === 'payment') {
      if (this.subscriptionIsActive === true) {
        this.logger.log('[INTEGRATION-COMP] USE CASE PROFILE TYPE ', this.profileType, ' SUB ACTIVE ', this.subscriptionIsActive)
        if (projectProfileData.profile_name === PLAN_NAME.A || projectProfileData.profile_name === PLAN_NAME.D) {

          this.logger.log('[INTEGRATION-COMP] >>> CURRENT PLAN ', projectProfileData.profile_name)
          // BASIC
          if (integration.plan === PLAN_NAME.D) {
            this.logger.log('[INTEGRATION-COMP] INTEGRATION NAME ', integration.name, '  AVAILABLE FOM ', integration.plan, ' PLAN ')
            integration['displayBadge'] = false
          }
          // PREMIUM
          if (integration.plan === PLAN_NAME.E) {
            this.logger.log('[INTEGRATION-COMP] INTEGRATION NAME ', integration.name, '  AVAILABLE FOM ', integration.plan, ' PLAN ')
            integration['displayBadge'] = true
          }
          // Team
          if (integration.plan === PLAN_NAME.EE) {
            this.logger.log('[INTEGRATION-COMP] INTEGRATION NAME ', integration.name, '  AVAILABLE FOM ', integration.plan, ' PLAN ')
            integration['displayBadge'] = true
          }
          // CUSTOM
          if (integration.plan === PLAN_NAME.F) {
            this.logger.log('[INTEGRATION-COMP] INTEGRATION NAME ', integration.name, '  AVAILABLE FOM ', integration.plan, ' PLAN ')
            integration['displayBadge'] = true
          }

        } else if (projectProfileData.profile_name === PLAN_NAME.B || projectProfileData.profile_name === PLAN_NAME.E || projectProfileData.profile_name === PLAN_NAME.EE) {
          this.logger.log('[INTEGRATION-COMP] >>> CURRENT PLAN ', projectProfileData.profile_name)
          // BASIC
          if (integration.plan === PLAN_NAME.D) {
            this.logger.log('[INTEGRATION-COMP] INTEGRATION NAME ', integration.name, '  AVAILABLE FOM ', integration.plan, ' PLAN ')
            integration['displayBadge'] = false
          }
          // PREMIUM
          if (integration.plan === PLAN_NAME.E) {
            this.logger.log('[INTEGRATION-COMP] INTEGRATION NAME ', integration.name, '  AVAILABLE FOM ', integration.plan, ' PLAN ')
            integration['displayBadge'] = false
          }

          // TEAM
          if (integration.plan === PLAN_NAME.EE) {
            this.logger.log('[INTEGRATION-COMP] INTEGRATION NAME ', integration.name, '  AVAILABLE FOM ', integration.plan, ' PLAN ')
            integration['displayBadge'] = false
          }
          // CUSTOM
          if (integration.plan === PLAN_NAME.F) {
            this.logger.log('[INTEGRATION-COMP] INTEGRATION NAME ', integration.name, '  AVAILABLE FOM ', integration.plan, ' PLAN ')
            integration['displayBadge'] = true
          }
        } else if (projectProfileData.profile_name === PLAN_NAME.C || projectProfileData.profile_name === PLAN_NAME.F) {
          this.logger.log('[INTEGRATION-COMP] >>> CURRENT PLAN ', projectProfileData.profile_name)
          // BASIC
          if (integration.plan === PLAN_NAME.D) {
            this.logger.log('[INTEGRATION-COMP] INTEGRATION NAME ', integration.name, '  AVAILABLE FOM ', integration.plan, ' PLAN ')
            integration['displayBadge'] = false
          }


          // PREMIUM
          if (integration.plan === PLAN_NAME.E) {
            this.logger.log('[INTEGRATION-COMP] INTEGRATION NAME ', integration.name, '  AVAILABLE FOM ', integration.plan, ' PLAN ')
            integration['displayBadge'] = false
          }

          // TEAM
          if (integration.plan === PLAN_NAME.EE) {
            this.logger.log('[INTEGRATION-COMP] INTEGRATION NAME ', integration.name, '  AVAILABLE FOM ', integration.plan, ' PLAN ')
            integration['displayBadge'] = false
          }

          // CUSTOM
          if (integration.plan === PLAN_NAME.F) {
            this.logger.log('[INTEGRATION-COMP] INTEGRATION NAME ', integration.name, '  AVAILABLE FOM ', integration.plan, ' PLAN ')
            integration['displayBadge'] = false
          }
        }
      } else if (this.subscriptionIsActive === false) {
        // BASIC
        if (integration.plan === PLAN_NAME.D) {
          this.logger.log('[INTEGRATION-COMP] INTEGRATION NAME ', integration.name, '  AVAILABLE FOM ', integration.plan, ' PLAN ')
          integration['displayBadge'] = true
        }
        // PREMIUM
        if (integration.plan === PLAN_NAME.E) {
          this.logger.log('[INTEGRATION-COMP] INTEGRATION NAME ', integration.name, '  AVAILABLE FOM ', integration.plan, ' PLAN ')
          integration['displayBadge'] = true
        }
        // CUSTOM
        if (integration.plan === PLAN_NAME.F) {
          this.logger.log('[INTEGRATION-COMP] INTEGRATION NAME ', integration.name, '  AVAILABLE FOM ', integration.plan, ' PLAN ')
          integration['displayBadge'] = true
        }

      }

    }


    this.logger.log('[INTEGRATION-COMP] INTEGRATIONS ', this.INTEGRATIONS)
  }

  checkPlan(integration_plan) {
    // this.logger.log("INTEGRATIONS_KEYS checkPlan profile_name: " + this.profile_name + " integration_plan: " + integration_plan);

    return new Promise((resolve, reject) => {

      // FREE or SANDBOX PLAN
      // if (this.profile_name === 'free' || this.profile_name === 'Sandbox') {
      //   if (integration_plan !== 'Sandbox') {
      //     reject(false);
      //   }
      //   resolve(true)
      // }

      // FREE or SANDBOX PLAN - Trial expired // nk
      if ((this.profile_name === 'free' && this.trialExpired) || (this.profile_name === 'Sandbox' && this.trialExpired)) {
        if (integration_plan !== 'Sandbox') {
          reject(false);
        }
        resolve(true)
      }

      // FREE or SANDBOX PLAN - Trial // nk 
      if ((this.profile_name === 'free' && !this.trialExpired) || (this.profile_name === 'Sandbox' && !this.trialExpired)) {
        if (integration_plan === PLAN_NAME.F) {
          reject(false);
        }
        resolve(true)
      }



      // BASIC PLAN
      // else if (this.profile_name === PLAN_NAME.A || this.profile_name === PLAN_NAME.D) {
      //   if (integration_plan === PLAN_NAME.E || integration_plan === PLAN_NAME.EE || integration_plan === PLAN_NAME.F) {
      //     reject(false);
      //   }
      //   resolve(true)
      // }

      // BASIC PLAN ubscription Is Active // nk
      else if ((this.profile_name === PLAN_NAME.A && this.subscriptionIsActive) || (this.profile_name === PLAN_NAME.D && this.subscriptionIsActive)) {
        if (integration_plan === PLAN_NAME.E || integration_plan === PLAN_NAME.EE || integration_plan === PLAN_NAME.F) {
          reject(false);
        }
        resolve(true)
      }

      // BASIC PLAN ubscription Is Not Active // nk
      else if ((this.profile_name === PLAN_NAME.A && !this.subscriptionIsActive) || (this.profile_name === PLAN_NAME.D && !this.subscriptionIsActive)) {
        if (integration_plan !== 'Sandbox') {
          reject(false);
        }
        resolve(true)
      }

      // PREMIUM PLAN
      // else if (this.profile_name === PLAN_NAME.B || this.profile_name === PLAN_NAME.E || this.profile_name === PLAN_NAME.EE) {
      //   if (integration_plan === PLAN_NAME.F) {
      //     reject(false);
      //   }
      //   resolve(true)
      // }

      // PREMIUM PLAN subscription Is Active // nk
      else if ((this.profile_name === PLAN_NAME.B && this.subscriptionIsActive) || (this.profile_name === PLAN_NAME.E && this.subscriptionIsActive) || (this.profile_name === PLAN_NAME.EE && this.subscriptionIsActive)) {
        if (integration_plan === PLAN_NAME.F) {
          reject(false);
        }
        resolve(true)
      }
      // PREMIUM PLAN subscription Is Not Active // nk
      else if ((this.profile_name === PLAN_NAME.B && !this.subscriptionIsActive) || (this.profile_name === PLAN_NAME.E && !this.subscriptionIsActive) || (this.profile_name === PLAN_NAME.EE && !this.subscriptionIsActive) || (this.profile_name === PLAN_NAME.C && !this.subscriptionIsActive) || (this.profile_name === PLAN_NAME.F && !this.subscriptionIsActive)) {
        if (integration_plan !== 'Sandbox') {
          reject(false);
        }
        resolve(true)
      }

      else {
        this.logger.log("Custom plan?")
        resolve(true)
      }
    })

  }

  manageAppVisibility(projectProfileData) {

    if (projectProfileData && projectProfileData.customization) {
   
      if (projectProfileData.customization[this.INT_KEYS.WHATSAPP] === false) {
        let index = this.INTEGRATIONS.findIndex(i => i.key === this.INT_KEYS.WHATSAPP);
        if (index != -1) { this.INTEGRATIONS.splice(index, 1) };
      }
      if (projectProfileData.customization[this.INT_KEYS.TELEGRAM] === false) {
        let index = this.INTEGRATIONS.findIndex(i => i.key === this.INT_KEYS.TELEGRAM);
        if (index != -1) { this.INTEGRATIONS.splice(index, 1) };
      }
      if (projectProfileData.customization[this.INT_KEYS.MESSENGER] === false) {
        let index = this.INTEGRATIONS.findIndex(i => i.key === this.INT_KEYS.MESSENGER);
        if (index != -1) { this.INTEGRATIONS.splice(index, 1) };
      }
      if (projectProfileData.customization[this.INT_KEYS.TWILIO_SMS] === false) {
        let index = this.INTEGRATIONS.findIndex(i => i.key === this.INT_KEYS.TWILIO_SMS);
        if (index != -1) { this.INTEGRATIONS.splice(index, 1) };
      }

      // -----------------------------
      // VXML_VOICE
      // -----------------------------
      // Removes "VXML voice" integration if in not activated in customization
      if (!projectProfileData.customization[this.INT_KEYS.VXML_VOICE] || projectProfileData.customization[this.INT_KEYS.VXML_VOICE] === false) {
        let index = this.INTEGRATIONS.findIndex(i => i.key === this.INT_KEYS.VXML_VOICE);
        if (index != -1) { this.INTEGRATIONS.splice(index, 1) };
      }

       // Restores the "VXML voice" integration (use case: it was removed from the Integration array in a project where it was not active)
       if (projectProfileData.customization[this.INT_KEYS.VXML_VOICE] && projectProfileData.customization[this.INT_KEYS.VXML_VOICE] === true) {
        this.logger.log('[INTEGRATIONS] manageAppVisibility VXML_VOICE ')
        let index = this.INTEGRATIONS.findIndex(i => i.key === this.INT_KEYS.VXML_VOICE);
        if (index != -1) {
          this.logger.log('VXML_VOICE index A', index)
        } else if (index == -1) {
          this.logger.log('VXML_VOICE index B', index)
          const VXMLVoiceObjct = INTEGRATION_LIST_ARRAY_CLONE.find(i => i.key === this.INT_KEYS.VXML_VOICE);
          this.logger.log('VXMLVoiceObjct' , VXMLVoiceObjct) 
          this.INTEGRATIONS.push(VXMLVoiceObjct)
        }
      }


      // -----------------------------
      // TWILIO_VOICE
      // -----------------------------
      // Removes "Twilio voice" integration if in not activated in customization
      if (!projectProfileData.customization[this.INT_KEYS.TWILIO_VOICE] || projectProfileData.customization[this.INT_KEYS.TWILIO_VOICE] === false) {
        let index = this.INTEGRATIONS.findIndex(i => i.key === this.INT_KEYS.TWILIO_VOICE);
        if (index != -1) { this.INTEGRATIONS.splice(index, 1) };
      }

      // Restores the "Twilio voice" integration (use case: it was removed from the Integration array in a project where it was not active)
      if (projectProfileData.customization[this.INT_KEYS.TWILIO_VOICE] && projectProfileData.customization[this.INT_KEYS.TWILIO_VOICE] === true) {
        this.logger.log('[INTEGRATIONS] manageAppVisibility TWILIO_VOICE ')
        let index = this.INTEGRATIONS.findIndex(i => i.key === this.INT_KEYS.TWILIO_VOICE);
        if (index != -1) {
          this.logger.log('TWILIO_VOICE index A', index)
        } else if (index == -1) {
          this.logger.log('TWILIO_VOICE index B', index)
          const twilioVoiceObjct = INTEGRATION_LIST_ARRAY_CLONE.find(i => i.key === this.INT_KEYS.TWILIO_VOICE);
          this.logger.log('twilioVoiceObjct' , twilioVoiceObjct) 
          this.INTEGRATIONS.push(twilioVoiceObjct)
        }
      }


      let index = this.INTEGRATIONS.findIndex(i => i.category === INTEGRATIONS_CATEGORIES.CHANNEL);
      if (index === -1) {
        let idx = this.CATEGORIES.findIndex(c => c.type === INTEGRATIONS_CATEGORIES.CHANNEL);
        if (idx != -1) {
          this.CATEGORIES.splice(idx, 1);
        }
      }

    } else {
      let vxml_voice_index = this.INTEGRATIONS.findIndex(i => i.key === this.INT_KEYS.VXML_VOICE);
      if (vxml_voice_index != -1) { this.INTEGRATIONS.splice(vxml_voice_index, 1) };

      let twilio_voice_index = this.INTEGRATIONS.findIndex(i => i.key === this.INT_KEYS.TWILIO_VOICE);
      if (twilio_voice_index != -1) { this.INTEGRATIONS.splice(twilio_voice_index, 1) };

    }

    this.integrationListReady = true;
  }

}
