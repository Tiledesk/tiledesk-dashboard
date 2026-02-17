import { Component, isDevMode, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { IntegrationService } from 'app/services/integration.service';
import { APPS_TITLE, BrevoIntegration, N8nIntegration, CATEGORIES_LIST, CustomerioIntegration, HubspotIntegration, INTEGRATIONS_CATEGORIES, INTEGRATIONS_KEYS, INTEGRATION_LIST_ARRAY, MakeIntegration, OpenaiIntegration, QaplaIntegration, INTEGRATION_LIST_ARRAY_CLONE, GoogleIntegration, AnthropicIntegration, GroqIntegration, CohereIntegration, DeepseekIntegration, OllamaIntegration, McpIntegration, vLLMIntegration} from './utils'; // , DeepseekIntegration
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
import { RoleService } from 'app/services/role.service';
import { RolesService } from 'app/services/roles.service';
import { C } from '@angular/cdk/keycodes';
import { PERMISSIONS } from 'app/utils/permissions.constants';
import { browserRefresh } from 'app/app.component';
import { AppConfigService } from 'app/services/app-config.service';

const swal = require('sweetalert');
const Swal = require('sweetalert2')

@Component({
  selector: 'appdashboard-integrations',
  templateUrl: './integrations.component.html',
  styleUrls: ['./integrations.component.scss']
})


export class IntegrationsComponent implements OnInit, OnDestroy {
  public browserRefresh: boolean;
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
  user: any;
  salesEmail: string;
  public_Key: string;
  isVisiblePAY: boolean;

  isAuthorized = false;
  permissionChecked = false;
  PERMISSION_TO_UPDATE: boolean;

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
    private appService: AppStoreService,
    private roleService: RoleService,
    public rolesService: RolesService,
    public appConfigService: AppConfigService,
  ) {
    const _brand = this.brand.getBrand();
    this.logger.log("[INTEGRATION-COMP] brand: ", _brand);
    this.translateparams = _brand;
    this.salesEmail = _brand['CONTACT_SALES_EMAIL'];
    // this.INTEGRATIONS_CLONE = JSON.parse(JSON.stringify(INTEGRATION_LIST_ARRAY))

  }

  ngOnInit(): void {
    this.getCurrentProject();
    this.getLoggedUser();
    this.getOSCODE();
    this.getProjectPlan();
    this.getBrowserVersion();
    this.listenSidebarIsOpened();
    this.translateModalOnlyOwnerCanManageProjectAccount();
    this.getProjectUserRole()
    this.checkPermissions();
    this.listenToProjectUser();
  }

  listenToProjectUser() {
    this.rolesService.listenToProjectUserPermissions(this.unsubscribe$);
    this.rolesService.getUpdateRequestPermission()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(status => {
        console.log("[INTEGRATION-COMP] - PERMISSION_TO_UPDATE Project: ", this.project) ;
        console.log('[INTEGRATION-COMP] - Role:', status.role);
        console.log('[INTEGRATION-COMP] - Permissions:', status.matchedPermissions);

        // PERMISSION TO UPDATE
        if (status.role !== 'owner' && status.role !== 'admin' && status.role !== 'agent') {

          if (status.matchedPermissions.includes(PERMISSIONS.INTEGRATIONS_UPDATE)) {
            this.PERMISSION_TO_UPDATE = true
            console.log('[INTEGRATION-COMP] - PERMISSION_TO_UPDATE ', this.PERMISSION_TO_UPDATE);
          } else {
            this.PERMISSION_TO_UPDATE = false;
            if (this.PERMISSION_TO_UPDATE === false) {
              this.router.navigate(['project/' + this.projectID + '/integrations/'])
            }
           
            console.log('[INTEGRATION-COMP] - PERMISSION_TO_UPDATE ', this.PERMISSION_TO_UPDATE);
          }
        } else {
          this.PERMISSION_TO_UPDATE = true
          console.log('[INTEGRATION-COMP] - Project user has a default role ', status.role, 'PERMISSION_TO_UPDATE ', this.PERMISSION_TO_UPDATE);
        }


        // if (status.matchedPermissions.includes('lead_update')) {
        //   // Enable lead update action
        // }

        // You can also check status.role === 'owner' if needed
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


  async checkPermissions() {
    const result = await this.roleService.checkRoleForCurrentProject('integrations')
    console.log('[INTEGRATION-COMP] result ', result)
    this.isAuthorized = result === true;
    this.permissionChecked = true;
    console.log('[INTEGRATION-COMP] isAuthorized ', this.isAuthorized)
    console.log('[INTEGRATION-COMP] permissionChecked ', this.permissionChecked)
  }

  // ------------------------------
  // UTILS FUNCTIONS - START
  // ------------------------------

    getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[INTEGRATION-COMP] AppConfigService getAppConfig public_Key', this.public_Key);

    let keys = this.public_Key.split("-");
    this.logger.log('[INTEGRATION-COMP] PUBLIC-KEY - public_Key keys', keys)

    keys.forEach(key => {

      if (key.includes("PAY")) {

        let pay = key.split(":");

        if (pay[1] === "F") {
          this.isVisiblePAY = false;
          this.logger.log('[INTEGRATION-COMP] isVisiblePAY', this.isVisiblePAY)
        } else {
          this.isVisiblePAY = true;
          this.logger.log('[INTEGRATION-COMP] isVisiblePAY', this.isVisiblePAY)
        }
      }
    });

    if (!this.public_Key.includes("PAY")) {
      this.isVisiblePAY = false;
    }
  }

  getPayValue(): boolean {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    let keys = this.public_Key.split("-");

    let payKey = keys.find((key) => key.startsWith('PAY'));
    if (payKey) {
      let payParts = payKey.split(':');
      let payValue = payParts[1];
      if (payValue === 'F') {
        return false;
      } else {
        return true;
      }
    }

    // If PAY key doesn't exist, return false
    return false;
  }

  getLoggedUser() {
    this.auth.user_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user) => {
        this.logger.log('[INTEGRATION-COMP] - USER GET IN HOME ', user)

        this.user = user;
      })
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
          console.log("[INTEGRATION-COMP] getCurrentProject Project: ", this.project) ;
          console.log("[INTEGRATION-COMP] getCurrentProject PERMISSION_TO_UPDATE: ", this.PERMISSION_TO_UPDATE) ;
           if (this.PERMISSION_TO_UPDATE === false) {
              this.router.navigate(['project/' + this.projectID + '/integrations/'])
           }
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
          this.logger.log('[INTEGRATION-COMP] INTEGRATIONS profile_name ', this.profile_name)

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
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user_role) => {
        if (user_role) {
          this.USER_ROLE = user_role
          if (user_role === 'agent') {
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
        console.log("[INTEGRATION-COMP] Integrations for this project ", integrations)
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

        let voiceEnghouseApp = response.apps.find(a => (a.title === APPS_TITLE.VXML_VOICE_ENGHOUSE && a.version === "v2"));
        if (environment['voiceConfigUrl']) {
          if (voiceEnghouseApp) {
            voiceEnghouseApp.runURL = environment['voiceConfigUrl'];
            voiceEnghouseApp.channel = "voice-vxml-enghouse";
          } else {
            voiceApp = {
              voiceEnghouseApp: environment['voiceConfigUrl'],
              channel: "voice-vxml-enghouse"
            }
          }
        }
        else {
          if (voiceEnghouseApp) {
            voiceEnghouseApp.channel = "voice-vxml-enghouse";
          }
        }
        this.availableApps.push(voiceEnghouseApp);

        // -------

        let voiceTwiloApp = response.apps.find(a => (a.title === APPS_TITLE.TWILIO_VOICE && a.version === "v2"));
        if (environment['voiceTwilioConfigUrl']) {
          if (voiceTwiloApp) {
            voiceTwiloApp.runURL = environment['voiceTwilioConfigUrl'];
            voiceTwiloApp.channel = "voice_twilio";
          } else {
            voiceTwiloApp = {
              voiceTwiloApp: environment['voiceTwilioConfigUrl'],
              channel: "voice_twilio"
            }
          }
        }
        else {
          this.logger.log('heree voiceTwiloApp ', voiceTwiloApp)
          if (voiceTwiloApp) {
            voiceTwiloApp.channel = "voice_twilio";
          }
        }
        this.availableApps.push(voiceTwiloApp);

        // -------

        this.availableApps = this.availableApps.filter(item => item !== undefined);
        resolve(true);

      }, (error) => {
        this.logger.error("--> error getting apps: ", error)
      })
    })
  }
  // if (this.browserRefresh && !this.PERMISSION_TO_UPDATE) {
  //      this.router.navigate(['project/' + this.projectID + '/integrations/'])
  //     } 
  onIntegrationSelect(integration) {

    if (this.PERMISSION_TO_UPDATE === false) {
      this.notify.presentDialogNoPermissionToPermomfAction()
      return
    }



    console.log("[INTEGRATIONS]- onIntegrationSelect integration", integration)

    this.integrationSelectedType = 'none'
    this.integrationLocked = false;
    this.checkPlan(integration, integration.plan).then(() => {
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
    }).catch((err) => {
      if (err !== false) {
        this.logger.error("[INTEGRATIONS] err ", err)
      }
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
      this.logger.log("available for plan ", integration.plan)
      this.logger.log("available for plan ", integration.plan)
    })
  }

  integrationUpdateEvent(data) {
    console.log('[INTEGRATION-COMP] data', data)
    this.integrationService.saveIntegration(data.integration).subscribe((result) => {
      this.logger.log("[INTEGRATION-COMP] Save integration result: ", result);
      // this.notify.showNotification("Saved successfully", 2, 'done');
      this.reloadSelectedIntegration(data.integration);
      // if (data.isVerified === true) {
      //   this.notify.showWidgetStyleUpdateNotification("Saved successfully", 2, 'done');
      // } else {
      //   this.notify.showWidgetStyleUpdateNotification("Saved but not verified", 3, 'priority_high');
      // }
      this.logger.log('Integration ', data.integration.name, 'saved ', ' key verified ', data.isVerified)

      this.trackSavedIntegration(data.integration.name, data.isVerified)

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
          this.logger.log('Integration ', integration.name, 'deleted ')
          this.trackDeletedIntegration(integration.name)
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
    console.log('[INTEGRATION-COMP] browserRefresh', this.browserRefresh)
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

    if (key === INTEGRATIONS_KEYS.OLLAMA) {
      return new OllamaIntegration();
    }

    if (key === INTEGRATIONS_KEYS.MCP) {
      return new McpIntegration();
    }

    if (key === INTEGRATIONS_KEYS.VLLM) {
      return new vLLMIntegration();
    }

    

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

  checkPlan(integration, integration_plan) {
    this.logger.log("INTEGRATIONS_KEYS checkPlan profile_name: " + this.profile_name + " integration_plan: " + integration_plan);

    return new Promise((resolve, reject) => {

       // TWILIO_VOICE: Check trial/subscription status first, then customization
      // Reject if: trial is expired (profileType === 'free' && trialExpired === true), 
      //            or subscription is expired (profileType === 'payment' && subscriptionIsActive === false),
      //            or getPayValue() is false, or customization doesn't exist, or voice_twilio key doesn't exist, or voice_twilio is false
      // Resolve only if trial/subscription is active, getPayValue() is true, and voice_twilio exists and is true
      if (integration && integration.key === this.INT_KEYS.TWILIO_VOICE) {
        // First check: if trial is expired (free profile with expired trial)
        if (this.profileType === 'free' && this.trialExpired === true) {
          reject(false);
        }
        // Second check: if subscription is expired (payment profile with inactive subscription)
        else if (this.profileType === 'payment' && this.subscriptionIsActive === false) {
          reject(false);
        } else if (!this.getPayValue()) {
          reject(false);
        } else if (!this.customization) {
          reject(false);
        } else if (!this.customization.hasOwnProperty(this.INT_KEYS.TWILIO_VOICE) || this.customization[this.INT_KEYS.TWILIO_VOICE] === false) {
          reject(false);
        } else {
          resolve(true);
        }
        return;
      }

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
    const isVisiblePAY = this.getPayValue();
    this.logger.log('[INTEGRATIONS] manageAppVisibility isVisiblePAY ', isVisiblePAY)

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
      // Remove TWILIO_VOICE if getPayValue() is false or if customization.voice_twilio is false
      if (!isVisiblePAY || (projectProfileData.customization[this.INT_KEYS.TWILIO_VOICE] === false)) {
        let index = this.INTEGRATIONS.findIndex(i => i.key === this.INT_KEYS.TWILIO_VOICE);
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
          this.logger.log('VXMLVoiceObjct', VXMLVoiceObjct)
          this.INTEGRATIONS.push(VXMLVoiceObjct)
        }
      }


      // -----------------------------
      // TWILIO_VOICE
      // -----------------------------
      // Removes "Twilio voice" integration if in not activated in customization
      //if (!projectProfileData.customization[this.INT_KEYS.TWILIO_VOICE] || projectProfileData.customization[this.INT_KEYS.TWILIO_VOICE] === false) {
      //  let index = this.INTEGRATIONS.findIndex(i => i.key === this.INT_KEYS.TWILIO_VOICE);
      //  if (index != -1) { this.INTEGRATIONS.splice(index, 1) };
      //}

      // Restores the "Twilio voice" integration (use case: it was removed from the Integration array in a project where it was not active)
      //if (projectProfileData.customization[this.INT_KEYS.TWILIO_VOICE] && projectProfileData.customization[this.INT_KEYS.TWILIO_VOICE] === true) {
      //  this.logger.log('[INTEGRATIONS] manageAppVisibility TWILIO_VOICE ')
      //  let index = this.INTEGRATIONS.findIndex(i => i.key === this.INT_KEYS.TWILIO_VOICE);
      //  if (index != -1) {
      //    this.logger.log('TWILIO_VOICE index A', index)
      //  } else if (index == -1) {
      //    this.logger.log('TWILIO_VOICE index B', index)
      //    const twilioVoiceObjct = INTEGRATION_LIST_ARRAY_CLONE.find(i => i.key === this.INT_KEYS.TWILIO_VOICE);
      //    this.logger.log('twilioVoiceObjct', twilioVoiceObjct)
      //    this.INTEGRATIONS.push(twilioVoiceObjct)
      //  }
      //}

      // -----------------------------
      // VXML_ENGHOUSE
      // -----------------------------
      if (!projectProfileData.customization[this.INT_KEYS.VXML_VOICE_ENGHOUSE] || projectProfileData.customization[this.INT_KEYS.VXML_VOICE_ENGHOUSE] === false) {
        let index = this.INTEGRATIONS.findIndex(i => i.key === this.INT_KEYS.VXML_VOICE_ENGHOUSE);
        if (index != -1) { this.INTEGRATIONS.splice(index, 1) };
      }

      // Restores the "VXML Enghouse voice" integration (use case: it was removed from the Integration array in a project where it was not active)
      if (projectProfileData.customization[this.INT_KEYS.VXML_VOICE_ENGHOUSE] && projectProfileData.customization[this.INT_KEYS.VXML_VOICE_ENGHOUSE] === true) {
        this.logger.log('[INTEGRATIONS] manageAppVisibility VXML_VOICE_ENGHOUSE ')
        let index = this.INTEGRATIONS.findIndex(i => i.key === this.INT_KEYS.VXML_VOICE_ENGHOUSE);
        if (index != -1) {
          this.logger.log('VXML_VOICE_ENGHOUSE index A', index)
        } else if (index == -1) {
          this.logger.log('VXML_VOICE_ENGHOUSE index B', index)
          const VXMLVoiceObjct = INTEGRATION_LIST_ARRAY_CLONE.find(i => i.key === this.INT_KEYS.VXML_VOICE_ENGHOUSE);
          this.logger.log('VXMLVoiceObjct', VXMLVoiceObjct)
          this.INTEGRATIONS.push(VXMLVoiceObjct)
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

      // Remove TWILIO_VOICE if getPayValue() is false (even when customization is not present)
      if (!isVisiblePAY) {
        let twilio_voice_index = this.INTEGRATIONS.findIndex(i => i.key === this.INT_KEYS.TWILIO_VOICE);
        if (twilio_voice_index != -1) { this.INTEGRATIONS.splice(twilio_voice_index, 1) };
      }

    }

    this.integrationListReady = true;
  }

  contactUs() {
    window.open(`mailto:${this.salesEmail}?subject=Enable Twilio Voice for project id ${this.projectID}`);
  }

  contactUsToUpgradePlan(){
    window.open(`mailto:${this.salesEmail}?subject=Upgrade plan (subscription expired) for project id ${this.projectID}`);
  }

  trackSavedIntegration(integrationName, integrationisVerified) {
    this.logger.log('[INTEGRATIONS] trackSavedIntegration integrationName ', integrationName)
    this.logger.log('[INTEGRATIONS] trackSavedIntegration integrationisVerified ', integrationisVerified)
    let userFullname = ''
    if (this.user.firstname && this.user.lastname) {
      userFullname = this.user.firstname + ' ' + this.user.lastname
    } else if (this.user.firstname && !this.user.lastname) {
      userFullname = this.user.firstname
    }
    if (!isDevMode()) {
      try {
        window['analytics'].track('Integration saved', {
          "type": "organic",
          "username": userFullname,
          "email": this.user.email,
          'userId': this.user._id,
          'integration': integrationName,
          'apiKeyVerified': integrationisVerified,
          'action': 'save'
        });
      } catch (err) {
        // this.logger.error(`Track Integration saved error`, err);
      }

      try {
        window['analytics'].identify(this.user._id, {
          username: userFullname,
          email: this.user.email,
          logins: 5,

        });
      } catch (err) {
        // this.logger.error(`Identify Integration saved error`, err);
      }

      try {
        window['analytics'].group(this.project._id, {
          name: this.project.name,
          plan: this.profile_name

        });
      } catch (err) {
        // this.logger.error(`Group Integration saved error`, err);
      }
    }
  }

  trackDeletedIntegration(integrationName) {
    this.logger.log('[INTEGRATIONS] trackDeletedIntegrations integrationName ', integrationName)
    let userFullname = ''
    if (this.user.firstname && this.user.lastname) {
      userFullname = this.user.firstname + ' ' + this.user.lastname
    } else if (this.user.firstname && !this.user.lastname) {
      userFullname = this.user.firstname
    }
    if (!isDevMode()) {
      try {
        window['analytics'].track('Integration deleted', {
          "type": "organic",
          "username": userFullname,
          "email": this.user.email,
          'userId': this.user._id,
          'integration': integrationName,
          'action': 'delete'
        });
      } catch (err) {
        // this.logger.error(`Track Integration deleted error`, err);
      }

      try {
        window['analytics'].identify(this.user._id, {
          username: userFullname,
          email: this.user.email,
          logins: 5,

        });
      } catch (err) {
        // this.logger.error(`Identify Integration deleted error`, err);
      }

      try {
        window['analytics'].group(this.project._id, {
          name: this.project.name,
          plan: this.profile_name

        });
      } catch (err) {
        // this.logger.error(`Group Integration deleted error`, err);
      }
    }
  }

}
