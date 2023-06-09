import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/core/auth.service';
import { NotifyService } from 'app/core/notify.service';
import { AppStoreService } from 'app/services/app-store.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { APP_SUMO_PLAN_NAME, PLAN_NAME } from 'app/utils/util';
import { Subscription } from 'rxjs';
const swal = require('sweetalert');
@Component({
  selector: 'appdashboard-home-whatsapp-account',
  templateUrl: './home-whatsapp-account.component.html',
  styleUrls: ['./home-whatsapp-account.component.scss']
})
export class HomeWhatsappAccountComponent implements OnInit {
  PLAN_NAME = PLAN_NAME;
  APP_SUMO_PLAN_NAME = APP_SUMO_PLAN_NAME;
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
  whatsAppIsInstalled: boolean
  constructor(
    public appStoreService: AppStoreService,
    private router: Router,
    private prjctPlanService: ProjectPlanService,
    public auth: AuthService,
    private logger: LoggerService,
    private notify: NotifyService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.getApps();
    this.getCurrentProject();
    this.getProjectPlan();
    this.translateLabels();
    // this.getOSCODE();
  }

  translateLabels() {
    // this.translateAreYouSure();
    // this.translateAppWillBeDeleted();
    // this.translateAppHasBeenDeleted();
    // this.translateAnErrorOccurreWhileDeletingTheApp();
    // this.translateDone();
    // this.translateCancel()

    // this.translate.get('AvailableFromThePlan', { plan_name: PLAN_NAME.B })
    //   .subscribe((translation: any) => {
    //     this.featureAvailableFromBPlan = translation;
    //   });

    // this.translate.get('Pricing.UpgradePlan')
    //   .subscribe((translation: any) => {
    //     this.upgradePlan = translation;
    //   });

    // this.translate.get('OnlyUsersWithTheOwnerRoleCanManageTheAccountPlan')
    //   .subscribe((translation: any) => {
    //     this.agentCannotManageAdvancedOptions = translation;
    //   });

    // this.translate.get('LearnMoreAboutDefaultRoles')
    //   .subscribe((translation: any) => {

    //     this.learnMoreAboutDefaultRoles = translation;
    //   });

  }

  getCurrentProject() {
    this.subscription = this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.projectId = project._id
        console.log('APP-STORE - projectId ', this.projectId)
      }
    });
  }

  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      // console.log('[PRICING - PAYMENT-LIST] getProjectPlan project Profile Data', projectProfileData)

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

      console.error('[HOME - WA] - getProjectPlan - ERROR', error);
    }, () => {

      console.log('[HOME - WA] - getProjectPlan * COMPLETE *')

    });
  }

  getApps() {
    this.appStoreService.getApps().subscribe((_apps: any) => {
      this.apps = _apps.apps;
      console.log('[HOME - WA] - getApps APPS ', this.apps);
      this.apps.forEach(app => {
        if (app.title === "WhatsApp Business") {

          this.whatsAppAppId = app._id;
          console.log('[HOME - WA] - whatsAppAppId ', this.whatsAppAppId)

        }
        console.log('[HOME - WA] - getApps APPS app ', app)
        if (app && app.version === "v2") {
          if (app.installActionURL === "") {
            // console.log('APP-STORE - getApps APPS app installActionURL', app.installActionURL)
            delete app.installActionURL
          }
        }
      });


    }, (error) => {
      console.error('[HOME - WA] - getApps ERROR  ', error);
      // this.showSpinner = false;
    }, () => {
      console.log('[HOME - WA] getApps * COMPLETE *');
      this.getInstallations().then((res: any) => {
        console.log("[HOME - WA] getInstallations res: ", res)
        if (res) {
          if (res.length > 0) {
            res.forEach(r => {
              console.log("[HOME - WA] getInstallations r: ", r)
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
        console.error("[HOME - WA] getInstallations ERROR: ", err)
        // this.showSpinner = false;
      })

      // this.showSpinner = false;
    });
  }

  getInstallations() {
    let promise = new Promise((resolve, reject) => {
      this.appStoreService.getInstallation(this.projectId).then((res) => {
        //  console.log("[APP-STORE] Get Installation Response: ", res);
        resolve(res);
      }).catch((err) => {
        // console.error("[APP-STORE] Error getting installation: ", err);
        reject(err);
      })
    })
    return promise;
  }


  installApp(app, installationType: string, installationUrl: string, appTitle: string, appId: string) {
    console.log('[APP-STORE] appId ', appId)
    if ((appTitle === "WhatsApp Business" || appTitle === "Facebook Messenger" || appTitle === "Zapier" || appTitle === 'Help Center') &&
      ((this.profile_name === PLAN_NAME.A) ||
        (this.profile_name === PLAN_NAME.B && this.subscription_is_active === false) ||
        (this.profile_name === PLAN_NAME.C && this.subscription_is_active === false) ||
        (this.prjct_profile_type === 'free' && this.trial_expired === true))) {

      if (!this.appSumoProfile) {
        // this.presentModalFeautureAvailableFromBPlan()
        return
      } else {
        // this.presentModalAppSumoFeautureAvailableFromBPlan()
        return
      }
    }

    // console.log('[APP-STORE] app ', app)
    console.log('[APP-STORE] app app version', app.version)
    console.log('[APP-STORE] installationType ', installationType);
    console.log('[APP-STORE] installationUrl ', installationUrl);
    // this.installV2App(this.projectId, appId)
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
  //       // console.log('featureAvailableFromPlanC value', value)
  //       // console.log('[APP-STORE] prjct_profile_type', this.prjct_profile_type)
  //       // console.log('[APP-STORE] subscription_is_active', this.subscription_is_active)
  //       // console.log('[APP-STORE] prjct_profile_type', this.prjct_profile_type)
  //       // console.log('[APP-STORE] trial_expired', this.trial_expired)
  //       // console.log('[APP-STORE] isVisiblePAY', this.isVisiblePAY)
  //       if (this.isVisiblePAY) {
  //         // console.log('[APP-STORE] HERE 1')
  //         if (this.USER_ROLE === 'owner') {
  //           // console.log('[APP-STORE] HERE 2')
  //           if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
  //             // console.log('[APP-STORE] HERE 3')
  //             this.notify._displayContactUsModal(true, 'upgrade_plan');
  //           } else if (this.prjct_profile_type === 'payment' && this.subscription_is_active === true && this.profile_name === PLAN_NAME.A) {
  //             this.notify._displayContactUsModal(true, 'upgrade_plan');
  //           } else if (this.prjct_profile_type === 'free' && this.trial_expired === true) {
  //             // console.log('[APP-STORE] HERE 4')
  //             this.router.navigate(['project/' + this.projectId + '/pricing']);
  //           }
  //         } else {
  //           // console.log('[APP-STORE] HERE 5')
  //           this.presentModalAgentCannotManageAvancedSettings();
  //         }
  //       } else {
  //         // console.log('[APP-STORE] HERE 6')
  //         this.notify._displayContactUsModal(true, 'upgrade_plan');
  //       }
  //     }
  //   });
  // }


  // presentModalAppSumoFeautureAvailableFromBPlan() {
  //   const el = document.createElement('div')
  //   el.innerHTML = 'Available from ' + this.appSumoProfilefeatureAvailableFromBPlan
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
  //       if (this.USER_ROLE === 'owner') {
  //         this.router.navigate(['project/' + this.projectId + '/project-settings/payments']);
  //       } else {
  //         // console.log('[APP-STORE] HERE 5')
  //         this.presentModalAgentCannotManageAvancedSettings();
  //       }
  //     }
  //   });

  // }




}
