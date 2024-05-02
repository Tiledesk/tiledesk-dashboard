import { Component, OnInit, isDevMode, OnDestroy } from '@angular/core';
import { AppStoreService } from '../services/app-store.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Subscription } from 'rxjs'
import { LoggerService } from '../services/logger/logger.service';
import { NotifyService } from 'app/core/notify.service';
import { TranslateService } from '@ngx-translate/core';
import { URL_configure_your_first_chatbot, URL_connect_your_dialogflow_agent, URL_rasa_ai_integration, URL_external_chatbot_connect_your_own_chatbot, PLAN_NAME, APP_SUMO_PLAN_NAME } from './../utils/util';
import { BrandService } from 'app/services/brand.service';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { UsersService } from 'app/services/users.service';
import { takeUntil } from 'rxjs/operators'
import { Subject } from 'rxjs';
import { AppConfigService } from 'app/services/app-config.service';
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component';
import { FaqKbService } from 'app/services/faq-kb.service';
import { ChatbotModalComponent } from 'app/bots/bots-list/chatbot-modal/chatbot-modal.component';
import { MatDialog } from '@angular/material/dialog';
const swal = require('sweetalert');
const Swal = require('sweetalert2')
@Component({
  selector: 'appdashboard-app-store',
  templateUrl: './app-store.component.html',
  styleUrls: ['./app-store.component.scss']
})
export class AppStoreComponent extends PricingBaseComponent implements OnInit, OnDestroy {
  PLAN_NAME = PLAN_NAME;
  APP_SUMO_PLAN_NAME = APP_SUMO_PLAN_NAME;
  private unsubscribe$: Subject<any> = new Subject<any>();
  apps: any;
  subscription: Subscription;
  projectId: string;
  showSpinner = true;
  TOKEN: string;
  isChromeVerGreaterThan100: boolean;
  userId: string;
  areYouSureMsg: string;
  appWillBeDeletedMsg: string;
  appHasBeenDeletedMsg: string;
  errorWhileDeletingApp: string;
  done_msg: string;
  tparams: any;
  profile_name: any;
  prjct_profile_type: any;
  subscription_is_active: any;
  subscription_end_date: any;
  trial_expired: any;
  featureAvailableFromBPlan: string;
  featureAvailableFromEPlan: string;
  cancel: string;
  upgradePlan: string;
  USER_ROLE: string;
  public_Key: string;
  isVisiblePAY: boolean;
  // areVisiblePaidApps: boolean = false;
  agentCannotManageAdvancedOptions: string;
  learnMoreAboutDefaultRoles: string;
  agentsCannotManageChatbots: string;
  tPlanParams: any;
  appIsAvailable: boolean = true;
  appSumoProfile: string;
  appSumoProfilefeatureAvailableFromBPlan: string;
  user: any;
  project: any;
  callingPage: string;
  onlyOwnerCanManageTheAccountPlanMsg: string;
  hideExternalChatbotLeranMore: boolean

  public chatBotCount: any;
  constructor(
    public appStoreService: AppStoreService,
    private router: Router,
    public auth: AuthService,
    private logger: LoggerService,
    public notify: NotifyService,
    private translate: TranslateService,
    public brandService: BrandService,
    public prjctPlanService: ProjectPlanService,
    public usersService: UsersService,
    public appConfigService: AppConfigService,
    public route: ActivatedRoute,
    private faqKbService: FaqKbService,
    public dialog: MatDialog,
  ) {
    super(prjctPlanService, notify);
    const brand = brandService.getBrand();
    this.tparams = brand;
    this.hideExternalChatbotLeranMore = brand['DOCS'];

  }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    this.getApps();
    this.getCurrentProject();
    // this.getToken();
    this.getBrowserVersion();
    this.translateLabels();
    this.getProjectPlan();
    this.getOSCODE();
    this.getProjectUserRole();
    this.getLoggedUser();
    this.getRouteParams();
    this.listenToParentPostMessage()
    this.getFaqKbByProjectId()
  }


  ngOnDestroy() {
    // this.subscription.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getRouteParams() {
    this.route.params.subscribe((params) => {
      // this.projectId = params.projectid
      this.logger.log('[APP-STORE] - GET ROUTE PARAMS ', params);
      if (params.calledby && params.calledby === 'h') {
        this.callingPage = 'home'
      }
    })
  }

  listenToParentPostMessage() {
    const current_url = this.router.url
    this.logger.log('[APP-STORE] - current_url ', current_url);

    window.addEventListener("message", (event) => {
      this.logger.log("[APP-STORE] message event ", event);

      if (event && event.data && event.data.calledBy && event.data.calledBy === "whatsapp_proxy") {
        if (event.data.action === 'installWhatsapp') {
          this.logger.log("[APP-STORE] post message action ", event.data.action);

        }

        if (event.data.action === 'uninstallWhatsapp') {
          this.logger.log("[APP-STORE] post message action ", event.data.action);

        }

        if (event.data.action === 'connectWhatsapp' && event.data.connected === false) {
          this.logger.log("[APP-STORE] post message action ", event.data.action);
          this.logger.log("[APP-STORE] post message WA connected ", event.data.action.connected);

        }

        if (event.data.action === 'connectWhatsapp' && event.data.connected === true) {
          this.logger.log("[APP-STORE] post message action ", event.data.action);
          this.logger.log("[APP-STORE] post message WA connected ", event.data.connected);

        }
      }
    })
  }



  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((isChromeVerGreaterThan100: boolean) => {
        this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
        //  this.logger.log("APP-STORE] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
      })
  }

  getLoggedUser() {
    this.auth.user_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user) => {
        this.logger.log('[APP-STORE] - user ', user)


        if (user) {
          this.user = user;
          this.TOKEN = user.token
          this.userId = user._id
          this.logger.log('[APP-STORE] - userId ', this.userId)
        }
      })
  }



  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[APP-STORE] AppConfigService getAppConfig public_Key', this.public_Key);

    let keys = this.public_Key.split("-");
    this.logger.log('[APP-STORE] PUBLIC-KEY - public_Key keys', keys)

    keys.forEach(key => {

      if (key.includes("PAY")) {

        let pay = key.split(":");

        if (pay[1] === "F") {
          this.isVisiblePAY = false;
        } else {
          this.isVisiblePAY = true;
        }
      }

      // if (key.includes("DPA")) {

      //   let paidApps = key.split(":");

      //   if (paidApps[1] === "F") {
      //     this.areVisiblePaidApps = false;
      //     this.logger.log('APP-STORE areVisiblePaidApps ', this.areVisiblePaidApps)
      //   } else {
      //     this.areVisiblePaidApps = true;
      //     this.logger.log('APP-STORE areVisiblePaidApps ', this.areVisiblePaidApps)
      //   }
      // }


    });


    if (!this.public_Key.includes("PAY")) {
      this.isVisiblePAY = false;
    }
    // if (!this.public_Key.includes("DPA")) {
    //   this.areVisiblePaidApps = false;
    // }
  }

  getCurrentProject() {
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {
        if (project) {
          this.project = project;
          this.projectId = project._id;
          this.logger.log('APP-STORE - projectId ', this.projectId)
        }
      });
  }

  getProjectUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user_role) => {
        this.logger.log('[APP-STORE] - GET PROJECT-USER ROLE ', user_role);
        if (user_role) {
          this.USER_ROLE = user_role;
        }
      });
  }


  // ---------------------------
  // GET APPS
  // ---------------------------
  getApps() {
    this.appStoreService.getApps().subscribe((_apps: any) => {
      this.apps = _apps.apps;
      this.logger.log('APP-STORE - getApps APPS ', this.apps);



      // 'Help Center'
      let paidApps = ['WhatsApp Business', 'Facebook Messenger', 'Telegram']
      this.apps = this.apps.filter(x => !paidApps.includes(x.title));
      this.logger.log('APP-STORE - getApps APPS ', this.apps)


      const sendTranscriptAppIndex = this.apps.findIndex(object => {
        return object.title === "Send transcript by email";
      });



      this.logger.log('sendTranscriptAppIndex ', sendTranscriptAppIndex);
      if (sendTranscriptAppIndex > -1) {
        this.apps.splice(sendTranscriptAppIndex, 1);
      }

      this.apps.forEach(app => {
        this.logger.log('APP-STORE - getApps APPS app ', app)


        if (app.description.length > 118) {
          app.description = app.description.slice(0, 118) + '...'
        }

        if (app && app.version === "v2") {
          if (app.installActionURL === "") {
            // this.logger.log('APP-STORE - getApps APPS app installActionURL', app.installActionURL)
            delete app.installActionURL
          }
        }

      });


    }, (error) => {
      this.logger.error('[APP-STORE] - getApps ERROR  ', error);
      this.showSpinner = false;
    }, () => {
      this.logger.log('[APP-STORE] getApps * COMPLETE *');
      this.getInstallations().then((res: any) => {

        for (let installation of res) {
          // this.logger.log("[APP-STORE] getInstallations INSTALLATION - res", res)
          // this.logger.log("[APP-STORE] getInstallations INSTALLATION: ", this.apps.findIndex(x => x._id === installation.app_id))
          let index = this.apps.findIndex(x => x._id === installation.app_id);
          if (this.apps[index]) {
            this.apps[index].installed = true;
          }

        }
        this.showSpinner = false;
      }).catch((err) => {
        this.logger.error("[APP-STORE] getInstallations ERROR: ", err)
        this.showSpinner = false;
      })

      // this.showSpinner = false;
    });
  }

  checkPlanAndPresentModal(appTitle) {
    if (
      (appTitle === "WhatsApp Business" ||
        appTitle === "Facebook Messenger" ||
        appTitle === "Zapier" ||
        appTitle === 'Help Center' ||
        appTitle === 'Send transcript by email') &&
      ((this.profile_name === PLAN_NAME.A) ||
        (this.profile_name === PLAN_NAME.B && this.subscription_is_active === false) ||
        (this.profile_name === PLAN_NAME.C && this.subscription_is_active === false) ||
        (this.profile_name === 'free' && this.trial_expired === true))) {

      if (!this.appSumoProfile) {
        // this.presentModalFeautureAvailableFromBPlan()
        this.presentModalFeautureAvailableFromTier2Plan(this.featureAvailableFromBPlan)
        return false
      } else {
        this.presentModalAppSumoFeautureAvailableFromBPlan()
        return false
      }
    } else if (
      (appTitle === "WhatsApp Business" ||
        appTitle === "Facebook Messenger" ||
        appTitle === "Zapier" ||
        appTitle === 'Help Center' ||
        appTitle === 'Send transcript by email') &&
      ((this.profile_name === PLAN_NAME.D) ||
        (this.profile_name === PLAN_NAME.E && this.subscription_is_active === false) ||
        (this.profile_name === PLAN_NAME.F && this.subscription_is_active === false) ||
        (this.profile_name === 'Sandbox' && this.trial_expired === true))) {
      if (!this.appSumoProfile) {
        this.presentModalFeautureAvailableFromTier2Plan(this.featureAvailableFromEPlan)
        return false
      }

    }
  }


  installApp(app, installationType: string, installationUrl: string, appTitle: string, appId: string) {
    this.logger.log('[APP-STORE] appId ', appId, 'appTitle ', appTitle)
    const isAvailable = this.checkPlanAndPresentModal(appTitle)
    this.logger.log('[APP-STORE] isAvaibleFromPlan ', isAvailable)
    if (isAvailable === false) {
      return
    }

    // this.logger.log('[APP-STORE] app ', app)
    this.logger.log('[APP-STORE] app app version', app.version)
    this.logger.log('[APP-STORE] installationType ', installationType);
    this.logger.log('[APP-STORE] installationUrl ', installationUrl);

    if (app && app.version === 'v1') {

      const urlHasQueryString = this.detectQueryString(installationUrl)
      this.logger.log('[APP-STORE] installationUrl Has QueryString ', urlHasQueryString);


      let installationUrlWithQueryString = ''
      if (urlHasQueryString === false) {
        installationUrlWithQueryString = installationUrl + '?project_id=' + this.projectId + '&token=' + this.TOKEN
      } else {
        installationUrlWithQueryString = installationUrl + '&project_id=' + this.projectId + '&token=' + this.TOKEN
      }

      if (installationType === 'internal') {
        this.logger.log("[APP-STORE] Navigation to: " + 'project/' + this.projectId + '/app-store-install', installationUrlWithQueryString, appTitle)
        //this.router.navigate(['project/' + this.projectId + '/app-store-install', installationUrlWithQueryString, appTitle]);
        this.router.navigate(['project/' + this.projectId + '/app-store-install/' + appId + '/installation'])
      } else {
        const url = installationUrlWithQueryString;
        window.open(url, '_blank');
      }
    } else if (app && app.version === 'v2') {
      this.installV2App(this.projectId, appId, appTitle)
    }

  }




  openInAppStoreInstall(app, appTitle) {
    const isAvailable = this.checkPlanAndPresentModal(appTitle)
    this.logger.log('[APP-STORE] isAvaibleFromPlan ', isAvailable)
    if (isAvailable === false) {
      return
    }

    this.logger.log('openInAppStoreInstall app ', app)
    this.router.navigate(['project/' + this.projectId + '/app-store-install/' + app._id + '/run'])
  }

  openConfigureUrlInAppStoreInstall(app, appTitle) {
    const isAvailable = this.checkPlanAndPresentModal(appTitle)
    this.logger.log('[APP-STORE] isAvaibleFromPlan ', isAvailable)
    if (isAvailable === false) {
      return
    }
    this.router.navigate(['project/' + this.projectId + '/app-store-install/' + app._id + '/configure'])
  }

  installV2App(projectId, appId, appTitle) {

    this.appStoreService.installAppVersionTwo(projectId, appId).subscribe((res: any) => {
      this.logger.log('[APP-STORE] INSTALL V2 APP projectId ', projectId, ' appId ', appId, ' appTitle ', appTitle)

    }, (error) => {
      this.logger.error('[APP-STORE] INSTALL V2 APP - ERROR  ', error);
      this.notify.showWidgetStyleUpdateNotification("An error occurred while creating the app", 4, 'report_problem');
    }, () => {
      this.logger.log('[APP-STORE] INSTALL V2 APP - COMPLETE');
      this.notify.showWidgetStyleUpdateNotification("App installed successfully", 2, 'done');
      let index = this.apps.findIndex(x => x._id === appId);

      // -----------------------------------
      // @ Track event
      // -----------------------------------
      this.trackUserActionOnApp(appId, appTitle, 'Install app')
      // this.apps[index].installed = false;
      // this.apps[index].version = 'v2';
      setTimeout(() => {
        this.apps[index].installed = true;
      }, 1000);

    });
  }

  unistallApp(appId, appTitle) {
    this.logger.log('[APP-STORE] UNINSTALL V2 APP - app_id', appId, ' appTitle ', appTitle);

    this.appStoreService.unistallNewApp(this.projectId, appId).subscribe((res: any) => {
      this.logger.log('[APP-STORE] UNINSTALL V2 APP - app_id - RES', res);

    }, (error) => {
      this.logger.error('[APP-STORE] UNINSTALL V2 APP - ERROR  ', error);
      this.notify.showWidgetStyleUpdateNotification("An error occurred while uninstalling the app", 4, 'report_problem');
    }, () => {
      this.logger.log('[APP-STORE] UNINSTALL V2 APP - COMPLETE');
      this.notify.showWidgetStyleUpdateNotification("App uninstalled successfully", 2, 'done');
      let index = this.apps.findIndex(x => x._id === appId);

      // -----------------------------------
      // @ Track event
      // -----------------------------------
      this.trackUserActionOnApp(appId, appTitle, 'Uninstall app')
      // this.apps[index].installed = false;
      // this.apps[index].version = 'v2';
      setTimeout(() => {
        this.apps[index].installed = false;
      }, 1000);

    });
  }

  // -----------------------------------
  // @ Track event
  // -----------------------------------
  trackUserActionOnApp(appId, appTitle, event) {
    let userFullname = ''
    if (this.user.firstname && this.user.lastname) {
      userFullname = this.user.firstname + ' ' + this.user.lastname
    } else if (this.user.firstname && !this.user.lastname) {
      userFullname = this.user.firstname
    }
    if (!isDevMode()) {
      try {
        window['analytics'].track(event, {
          "type": "organic",
          "username": userFullname,
          "email": this.user.email,
          'userId': this.user._id,
          'appTitle': appTitle,
          'appID': appId,
          'page': 'App store'
        });
      } catch (err) {
        this.logger.error(`Track ${event} error`, err);
      }

      try {
        window['analytics'].identify(this.user._id, {
          username: userFullname,
          email: this.user.email,
          logins: 5,

        });
      } catch (err) {
        this.logger.error(`Identify ${event} error`, err);
      }

      try {
        window['analytics'].group(this.projectId, {
          name: this.project.name,
          plan: this.profile_name

        });
      } catch (err) {
        this.logger.error(`Group ${event} error`, err);
      }
    }

  }


  deleteNewApp(appId, appTitle) {
    this.logger.log('[APP-STORE] - deleteNewApp appId ', appId, 'appTitle ', appTitle)
    swal({
      title: this.areYouSureMsg,
      text: this.appWillBeDeletedMsg,
      icon: "warning",
      buttons: ["Cancel", "Delete"],
      dangerMode: true,
    })
      .then((WillDelete) => {
        if (WillDelete) {
          this.appStoreService.deleteNewApp(appId).subscribe((res: any) => {
            this.logger.log('[APP-STORE] DELETE V2 APP - app_id - RES', res);
          }, (error) => {
            swal(this.errorWhileDeletingApp, {
              icon: "error",
            });
            this.logger.error('[FAQ-EDIT-ADD] DELETE FAQ ERROR ', error);
          }, () => {
            this.logger.log('[FAQ-EDIT-ADD] DELETE FAQ * COMPLETE *');

            // -----------------------------------
            // @ Track event
            // -----------------------------------
            this.trackUserActionOnApp(appId, appTitle, 'Delete app')

            for (var i = 0; i < this.apps.length; i++) {

              if (this.apps[i]._id === appId) {
                this.apps.splice(i, 1);
                i--;
              }
            }

            swal(this.done_msg + "!", this.appHasBeenDeletedMsg, {
              icon: "success",
            }).then((okpressed) => {

            });
          });
        } else {
          this.logger.log('[FAQ-EDIT-ADD] WS-REQUESTS-LIST swal WillDelete (else)')
        }
      });
  }

  _deleteNewApp(appId) {
    this.appStoreService.deleteNewApp(appId).subscribe((res: any) => {
      this.logger.log('[APP-STORE] DELETE V2 APP - app_id - RES', res);

    }, (error) => {
      this.logger.error('[APP-STORE] DELETE V2 APP - ERROR  ', error);
      this.notify.showWidgetStyleUpdateNotification("An error occurred while deleting the app", 4, 'report_problem');
    }, () => {
      this.logger.log('[APP-STORE] DELETE V2 APP - COMPLETE');
      this.notify.showWidgetStyleUpdateNotification("App successfully deleted", 2, 'done');
      // let index = this.apps.findIndex(x => x._id === appId);
      // // this.apps[index].installed = false;
      // // this.apps[index].version = 'v2';
      for (var i = 0; i < this.apps.length; i++) {

        if (this.apps[i]._id === appId) {
          this.apps.splice(i, 1);
          i--;
        }
      }

    });
  }

  learnmore(learnmoreUrl: string, app_id) {
    // this.logger.log('[APP-STORE] learnmoreUrl ', learnmoreUrl);
    if (learnmoreUrl.startsWith('{')) {
      // this.logger.log('[APP-STORE] installationUrl start with curly bracket ');
      const learnmoreUrlString = learnmoreUrl.replace(/&quot;/ig, '"');
      const learnMoreObjct = JSON.parse(learnmoreUrlString)
      // this.logger.log('[APP-STORE] learnmoreUrl start with curly bracket - learnMoreObjct, ', learnMoreObjct);
      // URL = learnMoreObjct.url
      const target = learnMoreObjct.target;

      if (target === '_self') {
        this.openAppDetails(URL, app_id)
      }
    } else if (learnmoreUrl.startsWith('http')) {
      // this.logger.log('[APP-STORE] learnmoreUrl NOT start with curly bracket ');
      const URL = learnmoreUrl
      window.open(URL, '_blank')
    }
    //   // const url = learnmoreUrl;
  }
  openAppDetails(URL, app_id) {
    // this.logger.log('HERE Y')
    this.router.navigate(['project/' + this.projectId + '/app-store-install/' + app_id + '/detail'])
  }

  detectQueryString(url) {
    // regex pattern for detecting querystring
    var pattern = new RegExp(/\?.+=.*/g);
    // this.logger.log('[APP-STORE] PATTERN TEST URL ')
    return pattern.test(url);
  }

  getInstallations() {
    let promise = new Promise((resolve, reject) => {
      this.appStoreService.getInstallation(this.projectId).then((res) => {
        //  this.logger.log("[APP-STORE] Get Installation Response: ", res);
        resolve(res);
      }).catch((err) => {
        // this.logger.error("[APP-STORE] Error getting installation: ", err);
        reject(err);
      })
    })
    return promise;
  }
  //  project/:projectid/app-create 
  goToCreateApp() {
    this.router.navigate(['project/' + this.projectId + '/app-create'])
  }

  goToEditApp(appid) {
    this.router.navigate(['project/' + this.projectId + '/app-edit/' + appid])
  }



  // ----------------------------------------------------------
  // Chatbot methods and doc link
  // ----------------------------------------------------------

  openExternalBotIntegrationTutorial() {
    const url = URL_external_chatbot_connect_your_own_chatbot;
    window.open(url, '_blank');
  }

  openDocsTiledeskDialogflowConnector() {
    const url = URL_connect_your_dialogflow_agent
    window.open(url, '_blank');
  }

  openRasaIntegrationTutorial() {
    const url = URL_rasa_ai_integration;
    window.open(url, '_blank');
  }

  getFaqKbByProjectId() {
    this.showSpinner = true
    // this.faqKbService.getAllBotByProjectId().subscribe((faqKb: any) => {
    this.faqKbService.getFaqKbByProjectId().subscribe((faqKb: any) => {
      this.logger.log('[APP-STORE] - GET BOTS BY PROJECT ID', faqKb);
      if (faqKb) {
        this.chatBotCount = faqKb.length;
      }

    }, (error) => {
      this.logger.error('[APP-STORE] GET BOTS ERROR ', error);
      this.showSpinner = false;
    }, () => {
      this.logger.log('[APP-STORE] GET BOTS COMPLETE');

    });
  }


  createExternalBot(type: string) {
    this.logger.log('[APP-STORE] createExternalBot ', type)
    if (this.USER_ROLE !== 'agent') {
      if (this.chatBotLimit) {
        if (this.chatBotCount < this.chatBotLimit) {
          this.logger.log('[APP-STORE] USECASE  chatBotCount < chatBotLimit')
          this.goToCreateBot(type)
        } else if (this.chatBotCount >= this.chatBotLimit) {
          this.logger.log('[APP-STORE] USECASE  chatBotCount >= chatBotLimit DISPLAY MODAL')
          this.presentDialogReachedChatbotLimit()
        }
      } else if (!this.chatBotLimit) {
        this.logger.log('[APP-STORE] USECASE  NO chatBotLimit: RUN PRJCTS')
        this.goToCreateBot(type)
      }
    } else if (this.USER_ROLE === 'agent') {
      this.presentModalAgentCannotManageChatbot()
    }
  }



  goToCreateBot(type: string) {
    //  this.logger.log('[BOT-TYPE-SELECT] Bot Type Selected type ', type)
    if (type !== 'native' && type !== 'tilebot') {
      this.router.navigate(['project/' + this.projectId + '/bots/create/' + type]);
    } else if (type === 'native') {
      this.router.navigate(['project/' + this.projectId + '/bots/prebuilt']);
      // this.router.navigate(['project/' + this.projectId + '/bots/create/' + type]);

    } else if (type === 'tilebot') {
      // this.logger.log('[BOT-TYPE-SELECT] HERE Y ')
      this.router.navigate(['project/' + this.projectId + '/tilebot/prebuilt']);
    }
  }

  presentDialogReachedChatbotLimit() {
    this.logger.log('[BOTS-LIST] openDialog presentDialogReachedChatbotLimit prjct_profile_name ', this.prjct_profile_name)
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
      this.logger.log(`[BOTS-LIST] Dialog result: ${result}`);
    });
  }

  presentModalAgentCannotManageChatbot() {
    this.notify.presentModalAgentCannotManageChatbot(this.agentsCannotManageChatbots, this.learnMoreAboutDefaultRoles)
  }

  goToCreateRasaBot() {
    this.router.navigate(['project/' + this.projectId + '/bot/rasa/create']);
  }

  // -----------------------------
  // Modals
  // -----------------------------
  presentModalFeautureAvailableFromTier2Plan(planName) {
    this.logger.log('presentModalFeautureAvailableFromTier2Plan', planName)
    const el = document.createElement('div')
    el.innerHTML = planName //this.featureAvailableFromBPlan
    // swal({
    //   // title: this.onlyOwnerCanManageTheAccountPlanMsg,
    //   content: el,
    //   icon: "info",
    //   // buttons: true,
    //   buttons: {
    //     cancel: this.cancel,
    //     catch: {
    //       text: this.upgradePlan,
    //       value: "catch",
    //     },
    //   },
    //   dangerMode: false,
    // }).then((value) => {
    //   if (value === 'catch') {
    //     this.logger.log('presentModalFeautureAvailableFromTier2Plan value', value)
    //     // this.logger.log('[APP-STORE] prjct_profile_type', this.prjct_profile_type)
    //     // this.logger.log('[APP-STORE] subscription_is_active', this.subscription_is_active)
    //     // this.logger.log('[APP-STORE] prjct_profile_type', this.prjct_profile_type)
    //     // this.logger.log('[APP-STORE] trial_expired', this.trial_expired)
    //     this.logger.log('[APP-STORE] isVisiblePAY', this.isVisiblePAY)
    //     if (this.isVisiblePAY) {
    //       // this.logger.log('[APP-STORE] HERE 1')
    //       if (this.USER_ROLE === 'owner') {
    //         // this.logger.log('[APP-STORE] HERE 2')
    //         if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
    //           // this.logger.log('[APP-STORE] HERE 3')
    //           this.notify._displayContactUsModal(true, 'upgrade_plan');
    //         } else if (this.prjct_profile_type === 'payment' && this.subscription_is_active === true && (this.profile_name === PLAN_NAME.A || this.profile_name === PLAN_NAME.D)) {
    //           this.notify._displayContactUsModal(true, 'upgrade_plan');
    //         } else if (this.prjct_profile_type === 'free' && this.trial_expired === true) {
    //           // this.logger.log('[APP-STORE] HERE 4')
    //           this.router.navigate(['project/' + this.projectId + '/pricing']);
    //         }
    //       } else {
    //         // this.logger.log('[APP-STORE] HERE 5')

    //         this.presentModalOnlyOwnerCanManageTheAccountPlan();
    //       }
    //     } else {
    //       // this.logger.log('[APP-STORE] HERE 6')
    //       this.notify._displayContactUsModal(true, 'upgrade_plan');
    //     }
    //   }
    // });

    Swal.fire({
      // title: this.onlyOwnerCanManageTheAccountPlanMsg,
      html: el,
      icon: "info",
      showCloseButton: true,
      showCancelButton: false,
      confirmButtonText: this.upgradePlan,
      confirmButtonColor: "var(--blue-light)",
      focusConfirm: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.logger.log('presentModalFeautureAvailableFromTier2Plan result', result)
        // this.logger.log('[APP-STORE] prjct_profile_type', this.prjct_profile_type)
        // this.logger.log('[APP-STORE] subscription_is_active', this.subscription_is_active)
        // this.logger.log('[APP-STORE] prjct_profile_type', this.prjct_profile_type)
        // this.logger.log('[APP-STORE] trial_expired', this.trial_expired)
        this.logger.log('[APP-STORE] isVisiblePAY', this.isVisiblePAY)
        if (this.isVisiblePAY) {
          // this.logger.log('[APP-STORE] HERE 1')
          if (this.USER_ROLE === 'owner') {
            // this.logger.log('[APP-STORE] HERE 2')
            if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
              // this.logger.log('[APP-STORE] HERE 3')
              this.notify._displayContactUsModal(true, 'upgrade_plan');
            } else if (this.prjct_profile_type === 'payment' && this.subscription_is_active === true && (this.profile_name === PLAN_NAME.A || this.profile_name === PLAN_NAME.D)) {
              this.notify._displayContactUsModal(true, 'upgrade_plan');
            } else if (this.prjct_profile_type === 'free' && this.trial_expired === true) {
              // this.logger.log('[APP-STORE] HERE 4')
              this.router.navigate(['project/' + this.projectId + '/pricing']);
            }
          } else {
            // this.logger.log('[APP-STORE] HERE 5')

            this.presentModalOnlyOwnerCanManageTheAccountPlan();
          }
        } else {
          // this.logger.log('[APP-STORE] HERE 6')
          this.notify._displayContactUsModal(true, 'upgrade_plan');
        }
      }
    });
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
          // this.logger.log('[APP-STORE] HERE 5')
          this.presentModalOnlyOwnerCanManageTheAccountPlan();
        }
      }
    });

  }

  presentModalOnlyOwnerCanManageTheAccountPlan() {
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyOwnerCanManageTheAccountPlanMsg, this.learnMoreAboutDefaultRoles)
  }


  // -----------------------------
  // Translations
  // -----------------------------
  translateLabels() {
    this.translateAreYouSure();
    this.translateAppWillBeDeleted();
    this.translateAppHasBeenDeleted();
    this.translateAnErrorOccurreWhileDeletingTheApp();
    this.translateDone();
    this.translateCancel()

    this.translate.get('AvailableFromThePlan', { plan_name: PLAN_NAME.B })
      .subscribe((translation: any) => {
        this.featureAvailableFromBPlan = translation;
      });

    this.translate.get('AvailableFromThePlan', { plan_name: PLAN_NAME.E })
      .subscribe((translation: any) => {
        this.featureAvailableFromEPlan = translation;
      });


    this.translate.get('Pricing.UpgradePlan')
      .subscribe((translation: any) => {
        this.upgradePlan = translation;
      });

    this.translate.get('UsersWiththeAgentroleCannotManageTheAdvancedOptionsOfTheProject')
      .subscribe((translation: any) => {
        this.agentCannotManageAdvancedOptions = translation;
      });

    this.translate.get('LearnMoreAboutDefaultRoles')
      .subscribe((translation: any) => {

        this.learnMoreAboutDefaultRoles = translation;
      });

    this.translate
      .get('OnlyUsersWithTheOwnerRoleCanManageTheAccountPlan')
      .subscribe((translation: any) => {
        this.onlyOwnerCanManageTheAccountPlanMsg = translation
      })

    this.translate
      .get('AgentsCannotManageChatbots')
      .subscribe((translation: any) => {
        this.agentsCannotManageChatbots = translation
      })

  }

  translateCancel() {
    this.translate.get('Cancel')
      .subscribe((text: string) => {
        this.cancel = text;
      });
  }

  translateAreYouSure() {
    this.translate.get('AreYouSure').subscribe((text: string) => {
      this.areYouSureMsg = text;
    });
  }

  translateAppWillBeDeleted() {
    this.translate.get('TheAppWillBeDeleted').subscribe((text: string) => {
      this.appWillBeDeletedMsg = text;
    });
  }


  translateAppHasBeenDeleted() {
    this.translate.get('TheAppHasBeenDeleted').subscribe((text: string) => {
      this.appHasBeenDeletedMsg = text;
    });
  }
  translateAnErrorOccurreWhileDeletingTheApp() {
    this.translate.get('AnErrorOccurreWhileDeletingTheApp').subscribe((text: string) => {
      this.errorWhileDeletingApp = text;
    });
  }

  translateDone() {
    this.translate.get('Done').subscribe((text: string) => {
      this.done_msg = text;
    });
  }

  goToWhatsapp() {
    this.router.navigate(['project/' + this.projectId + '/integrations' ],{ queryParams: { 'name': 'whatsapp' } })
  }

  goToMessenger() {
    this.router.navigate(['project/' + this.projectId + '/integrations' ],{ queryParams: { 'name': 'messenger' } })
  }

  goToTelegram() {
    this.router.navigate(['project/' + this.projectId + '/integrations' ],{ queryParams: { 'name': 'telegram' } })
  }

  goToIntegrations() {
    this.router.navigate(['project/' + this.projectId + '/integrations' ])
  }

}
