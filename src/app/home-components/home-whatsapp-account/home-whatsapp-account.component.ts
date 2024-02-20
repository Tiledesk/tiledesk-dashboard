import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/core/auth.service';
import { NotifyService } from 'app/core/notify.service';
import { AppConfigService } from 'app/services/app-config.service';
import { AppStoreService } from 'app/services/app-store.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { UsersService } from 'app/services/users.service';
import { APP_SUMO_PLAN_NAME, PLAN_NAME } from 'app/utils/util';
import { Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { Subject } from 'rxjs';
import { ProjectService } from 'app/services/project.service';
const swal = require('sweetalert');

@Component({
  selector: 'appdashboard-home-whatsapp-account',
  templateUrl: './home-whatsapp-account.component.html',
  styleUrls: ['./home-whatsapp-account.component.scss']
})
export class HomeWhatsappAccountComponent implements OnInit, OnChanges {
  PLAN_NAME = PLAN_NAME;
  APP_SUMO_PLAN_NAME = APP_SUMO_PLAN_NAME;
  private unsubscribe$: Subject<any> = new Subject<any>();
  @Input() whatsAppIsInstalled: boolean;
  @Input() whatsAppIsConnected: boolean;
  @Input() solution_channel_for_child : string;
  @Input() solution_for_child : string;
  @Input() userHasClickedDisplayWAWizard:boolean;
  @Output() onClickOnGoToLearnMoreOrManageApp = new EventEmitter();
  @Output() onClickOnUnistallApp  = new EventEmitter();
  @Output() onClickOnDisplayWhatsAppWizard  = new EventEmitter();
  apps: any;
  projectId: string;
  subscription: Subscription;
  profile_name: any;
  prjct_profile_type: any;
  subscription_is_active: any;
  subscription_end_date: any;
  trial_expired: any;
  featureAvailableFromBPlan: string;
  tPlanParams: any;
  appIsAvailable: boolean = true;
  appSumoProfile: string;
  appSumoProfilefeatureAvailableFromBPlan: string;
  whatsAppAppId: string;
  // whatsAppIsInstalled: boolean;
  cancel: string;
  learnMoreAboutDefaultRoles: string;
  upgradePlan: string;
  agentCannotManageAdvancedOptions: string;

  USER_ROLE: string;
  public_Key: string;
  isVisiblePAY: boolean;

  installActionType: string;
  runURL: string;
  appTitle: string;
  appVersion: string;
  whatsAppLearnMoreURL: string;

  constructor(
    public appStoreService: AppStoreService,
    private router: Router,
    private prjctPlanService: ProjectPlanService,
    public auth: AuthService,
    private logger: LoggerService,
    private notify: NotifyService,
    private translate: TranslateService,
    public appConfigService: AppConfigService,
    public usersService: UsersService,
    private projectService: ProjectService,
  ) { }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // 
    this.getCurrentProject();
    // this.getProjectPlan();
    // this.translateLabels();
    this.getProjectUserRole();
    this.getOSCODE();
   
  }


  
  /**
   * On changes
   */
   ngOnChanges(changes: SimpleChanges) {
    this.logger.log('[HOME-WA] ngOnChanges changes ', changes);
    this.logger.log('[HOME-WA] ngOnChanges whatsAppIsInstalled ', this.whatsAppIsInstalled);
    this.logger.log('[HOME-WA] ngOnChanges whatsAppIsConnected ', this.whatsAppIsConnected);
    this.logger.log('[HOME-WA] ngOnChanges solution_channel_for_child ', this.solution_channel_for_child);
    this.logger.log('[HOME-WA] ngOnChanges solution_for_child ', this.solution_for_child);
    this.logger.log('[HOME-WA] userHasClickedDisplayWAWizard ', this.userHasClickedDisplayWAWizard)
    // this.getApps();
   }


  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[HOME-WA] AppConfigService getAppConfig public_Key', this.public_Key);

    let keys = this.public_Key.split("-");
    this.logger.log('[HOME-WA] PUBLIC-KEY - public_Key keys', keys)

    keys.forEach(key => {
      if (key.includes("PAY")) {
        let pay = key.split(":");
        if (pay[1] === "F") {
          this.isVisiblePAY = false;
        } else {
          this.isVisiblePAY = true;
        }
      }
    });


    if (!this.public_Key.includes("PAY")) {
      this.isVisiblePAY = false;
    }
  }

  getProjectUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user_role) => {
        this.logger.log('[HOME-WA] - GET PROJECT-USER ROLE ', user_role);
        if (user_role) {
          this.USER_ROLE = user_role;
        }
      });
  }

  translateLabels() {
    // this.translateAreYouSure();
    // this.translateAppWillBeDeleted();
    // this.translateAppHasBeenDeleted();
    // this.translateAnErrorOccurreWhileDeletingTheApp();
    // this.translateDone();
    // this.translateCancel()

    this.translate.get('AvailableFromThePlan', { plan_name: PLAN_NAME.B })
      .subscribe((translation: any) => {
        this.featureAvailableFromBPlan = translation;
      });

    this.translate.get('Pricing.UpgradePlan')
      .subscribe((translation: any) => {
        this.upgradePlan = translation;
      });

    this.translate.get('OnlyUsersWithTheOwnerRoleCanManageTheAccountPlan')
      .subscribe((translation: any) => {
        this.agentCannotManageAdvancedOptions = translation;
      });

    this.translate.get('LearnMoreAboutDefaultRoles')
      .subscribe((translation: any) => {

        this.learnMoreAboutDefaultRoles = translation;
      });

    this.translate.get('Cancel')
      .subscribe((text: string) => {
        this.cancel = text;
      });
  }

  getCurrentProject() {
    this.subscription = this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.projectId = project._id
        this.logger.log('[HOME-WA] - projectId ', this.projectId)
      }
    });
  }

  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      // this.logger.log('[PRICING - PAYMENT-LIST] getProjectPlan project Profile Data', projectProfileData)

      if (projectProfileData) {
        this.profile_name = projectProfileData.profile_name
        this.prjct_profile_type = projectProfileData.profile_type;
        this.subscription_is_active = projectProfileData.subscription_is_active;

        this.subscription_end_date = projectProfileData.subscription_end_date;
        this.trial_expired = projectProfileData.trial_expired;
        if (projectProfileData.extra3) {
          this.appSumoProfile = APP_SUMO_PLAN_NAME[projectProfileData.extra3]
          this.appSumoProfilefeatureAvailableFromBPlan = APP_SUMO_PLAN_NAME['tiledesk_tier3']

          this.tPlanParams = { 'plan_name': this.appSumoProfilefeatureAvailableFromBPlan }

        } else if (!projectProfileData.extra3) {
          this.tPlanParams = { 'plan_name': PLAN_NAME.B }
        }
      }
    }, error => {
      this.logger.error('[HOME-WA] - getProjectPlan - ERROR', error);
    }, () => {
      this.logger.log('[HOME-WA] - getProjectPlan * COMPLETE *')
    });
  }

  getApps() {
    this.appStoreService.getApps().subscribe((_apps: any) => {
      this.apps = _apps.apps;
      this.logger.log('[HOME-WA] - getApps APPS ', this.apps);
      this.apps.forEach(app => {
        if (app.title === "WhatsApp Business") {

          this.whatsAppAppId = app._id;
          this.logger.log('[HOME-WA] - whatsAppAppId ', this.whatsAppAppId)
          this.installActionType = app.installActionType
          this.logger.log('[HOME-WA] - installActionType ', this.installActionType)
          this.runURL = app.runURL
          this.logger.log('[HOME-WA] - runURL ', this.runURL)
          this.appTitle = app.title;
          this.logger.log('[HOME-WA] - appTitle ', this.appTitle)
          this.appVersion = app.version;
          this.logger.log('[HOME-WA] - appVersion ', this.appVersion)

          this.whatsAppLearnMoreURL = app.learnMore;
          this.logger.log('[HOME-WA] - whatsAppLearnMoreURL ', this.whatsAppLearnMoreURL)
        }

        // this.logger.log('[HOME-WA] - getApps APPS app ', app)
        if (app && app.version === "v2") {
          if (app.installActionURL === "") {
            // this.logger.log('HOME-WA - getApps APPS app installActionURL', app.installActionURL)
            delete app.installActionURL
          }
        }
      });


    }, (error) => {
      this.logger.error('[HOME-WA] - getApps ERROR  ', error);
      // this.showSpinner = false;
    }, () => {
      this.logger.log('[HOME-WA] getApps * COMPLETE *');
      this.getInstallations().then((res: any) => {
        this.logger.log("[HOME-WA] getInstallations res: ", res)
        if (res) {
          if (res.length > 0) {
            res.forEach(r => {
              this.logger.log("[HOME-WA] getInstallations r: ", r)
              if (r.app_id === this.whatsAppAppId) {
                this.whatsAppIsInstalled = true;
              } else {
                this.whatsAppIsInstalled = false;
              }
            });
          } else {
            this.whatsAppIsInstalled = false;
          }
        } else {
          this.whatsAppIsInstalled = false;
        }

        // this.showSpinner = false;
      }).catch((err) => {
        this.logger.error("[HOME-WA] getInstallations ERROR: ", err)
        // this.showSpinner = false;
      })

      // this.showSpinner = false;
    });
  }

  getInstallations() {
    let promise = new Promise((resolve, reject) => {
      this.appStoreService.getInstallation(this.projectId).then((res) => {
        //  this.logger.log("[HOME-WA] Get Installation Response: ", res);
        resolve(res);
      }).catch((err) => {
        // this.logger.error("[HOME-WA] Error getting installation: ", err);
        reject(err);
      })
    })
    return promise;
  }

  gotToLearMoreOrManageApp() {
    this.onClickOnGoToLearnMoreOrManageApp.emit()
    // this.logger.log('[HOME-WA] INSTALL OR OPEN APP ', this.whatsAppIsInstalled);
    // if (this.whatsAppIsInstalled === false) {
    //   this.goToWhatsAppDetails()
    // } else {
    //   this.openInAppStoreInstall()
    // }
  }

  // goToWhatsAppDetails() {
  //   this.router.navigate(['project/' + this.projectId + '/app-store-install/' + this.whatsAppAppId + '/detail/h'])
  // }

  displayWhatsAppWizard() {
    this.onClickOnDisplayWhatsAppWizard.emit()
  }


  // installApp() {
  //   if ((this.appTitle === "WhatsApp Business" || this.appTitle === "Facebook Messenger" || this.appTitle === "Zapier" || this.appTitle === 'Help Center') &&
  //     ((this.profile_name === PLAN_NAME.A) ||
  //       (this.profile_name === PLAN_NAME.B && this.subscription_is_active === false) ||
  //       (this.profile_name === PLAN_NAME.C && this.subscription_is_active === false) ||
  //       (this.prjct_profile_type === 'free' && this.trial_expired === true))) {

  //     if (!this.appSumoProfile) {
  //       this.presentModalFeautureAvailableFromBPlan()
  //       return
  //     } else {
  //       this.presentModalAppSumoFeautureAvailableFromBPlan()
  //       return
  //     }
  //   }

  //   this.logger.log('[HOME-WA] appId ', this.whatsAppAppId)
  //   this.logger.log('[HOME-WA] app app version', this.appVersion)
  //   this.logger.log('[HOME-WA] installationType ', this.installActionType);

  //   // this.installV2App(this.projectId, this.whatsAppAppId)

  // }




  // openInAppStoreInstall() {
  //   if ((this.appTitle === "WhatsApp Business" || this.appTitle === "Facebook Messenger") &&
  //     ((this.profile_name === PLAN_NAME.A) ||
  //       (this.profile_name === PLAN_NAME.B && this.subscription_is_active === false) ||
  //       (this.profile_name === PLAN_NAME.C && this.subscription_is_active === false) ||
  //       (this.prjct_profile_type === 'free' && this.trial_expired === true))) {
  //     // this.presentModalFeautureAvailableFromBPlan()
  //     // return
  //     if (!this.appSumoProfile) {
  //       this.presentModalFeautureAvailableFromBPlan()
  //       return
  //     } else {
  //       this.presentModalAppSumoFeautureAvailableFromBPlan()
  //       return
  //     }

  //   }

  //   if (this.appTitle === "WhatsApp Business" || this.appTitle === "Facebook Messenger") {
  //     this.router.navigate(['project/' + this.projectId + '/app-store-install/' + this.whatsAppAppId + '/connect/h'])
  //   }
  
  // }



  unistallApp() {
    this.onClickOnUnistallApp.emit()

  }


  // presentModalFeautureAvailableFromBPlan() {
  //   const el = document.createElement('div')
  //   el.innerHTML = this.featureAvailableFromBPlan
  //   swal({
  //     // title: this.onlyOwnerCanManageTheAccountPlanMsg,
  //     content: el,
  //     icon: "info",
  //     // buttons: true,
  //     buttons: {
  //       cancel: this.cancel,
  //       catch: {
  //         text: this.upgradePlan,
  //         value: "catch",
  //       },
  //     },
  //     dangerMode: false,
  //   }).then((value) => {
  //     if (value === 'catch') {
  //       // this.logger.log('featureAvailableFromPlanC value', value)
  //       // this.logger.log('[HOME-WA] prjct_profile_type', this.prjct_profile_type)
  //       // this.logger.log('[HOME-WA] subscription_is_active', this.subscription_is_active)
  //       // this.logger.log('[HOME-WA] prjct_profile_type', this.prjct_profile_type)
  //       // this.logger.log('[HOME-WA] trial_expired', this.trial_expired)
  //       // this.logger.log('[HOME-WA] isVisiblePAY', this.isVisiblePAY)
  //       if (this.isVisiblePAY) {
  //         // this.logger.log('[HOME-WA] HERE 1')
  //         if (this.USER_ROLE === 'owner') {
  //           // this.logger.log('[HOME-WA] HERE 2')
  //           if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
  //             // this.logger.log('[HOME-WA] HERE 3')
  //             this.notify._displayContactUsModal(true, 'upgrade_plan');
  //           } else if (this.prjct_profile_type === 'payment' && this.subscription_is_active === true && this.profile_name === PLAN_NAME.A) {
  //             this.notify._displayContactUsModal(true, 'upgrade_plan');
  //           } else if (this.prjct_profile_type === 'free' && this.trial_expired === true) {
  //             // this.logger.log('[HOME-WA] HERE 4')
  //             this.router.navigate(['project/' + this.projectId + '/pricing']);
  //           }
  //         } else {
  //           // this.logger.log('[HOME-WA] HERE 5')
  //           this.presentModalAgentCannotManageAvancedSettings();
  //         }
  //       } else {
  //         // this.logger.log('[HOME-WA] HERE 6')
  //         this.notify._displayContactUsModal(true, 'upgrade_plan');
  //       }
  //     }
  //   });
  // }


  presentModalAgentCannotManageAvancedSettings() {
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.agentCannotManageAdvancedOptions, this.learnMoreAboutDefaultRoles)
  }


  presentModalAppSumoFeautureAvailableFromBPlan() {
    const el = document.createElement('div')
    el.innerHTML = 'Available from ' + this.appSumoProfilefeatureAvailableFromBPlan
    swal({
      // title: this.onlyOwnerCanManageTheAccountPlanMsg,
      content: el,
      icon: "info",
      // buttons: true,
      buttons: {
        cancel: this.cancel,
        catch: {
          text: this.upgradePlan,
          value: "catch",
        },
      },
      dangerMode: false,
    }).then((value) => {
      if (value === 'catch') {
        if (this.USER_ROLE === 'owner') {
          this.router.navigate(['project/' + this.projectId + '/project-settings/payments']);
        } else {
          // this.logger.log('[HOME-WA] HERE 5')
          this.presentModalAgentCannotManageAvancedSettings();
        }
      }
    });

  }


  // installV2App(projectId, appId) {

  //   this.appStoreService.installAppVersionTwo(projectId, appId).subscribe((res: any) => {
  //     this.logger.log('[HOME-WA] INSTALL V2 APP projectId ', projectId, 'appId ', appId)

  //   }, (error) => {
  //     this.logger.error('[HOME-WA] INSTALL V2 APP - ERROR  ', error);
  //     this.notify.showWidgetStyleUpdateNotification("An error occurred while creating the app", 4, 'report_problem');
  //   }, () => {
  //     this.logger.log('[HOME-WA] INSTALL V2 APP - COMPLETE');
  //     this.notify.showWidgetStyleUpdateNotification("App installed successfully", 2, 'done');
  //     // let index = this.apps.findIndex(x => x._id === appId);
  //     // // this.apps[index].installed = false;
  //     // // this.apps[index].version = 'v2';
  //     // setTimeout(() => {
  //     //   this.apps[index].installed = true;
  //     // }, 1000);
  //     this.whatsAppIsInstalled = true;
  //   });
  // }

}
