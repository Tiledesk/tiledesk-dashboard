import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';

import { NotifyService } from '../../core/notify.service';
import { AuthService } from '../../core/auth.service';
import { ProjectService } from '../../services/project.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ProjectPlanService } from '../../services/project-plan.service';
import { Subject, Subscription } from 'rxjs';
import { AppConfigService } from '../../services/app-config.service';
import { BrandService } from '../../services/brand.service';
import { LoggerService } from '../../services/logger/logger.service';
import { UsersService } from '../../services/users.service';
import { takeUntil } from 'rxjs/operators';
const swal = require('sweetalert');
@Component({
  selector: 'notification-message',
  templateUrl: './notification-message.component.html',
  styleUrls: ['./notification-message.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NotificationMessageComponent implements OnInit, OnDestroy {
  private unsubscribe$: Subject<any> = new Subject<any>();
  tparams: any;
  company_name: string;
  displayExpiredSessionModal: string;
  projectId: string;
  gettingStartedChecklist: any;
  CHAT_BASE_URL: string;
  showSpinnerInModal = true;
  browserLang: string;
  subscriptionCanceledSuccessfully: string;
  subscriptionCanceledError: string;

  prjct_profile_type: string;
  subscription_is_active: boolean;
  trial_expired: boolean;
  subscription_end_date: any;
  prjct_profile_name: string;
  subscription: Subscription;
  WIDGET_URL: string;
  has_copied = false;
  tprojectprofilemane: any;
  USER_ROLE: string;
  profile_name: string;
  onlyOwnerCanManageTheAccountPlanMsg: string;
  learnMoreAboutDefaultRoles: string;
  contactUsEmail: string;

  constructor(
    public notify: NotifyService,
    public auth: AuthService,
    public projectService: ProjectService,
    private router: Router,
    private translate: TranslateService,
    private prjctPlanService: ProjectPlanService,
    public appConfigService: AppConfigService,
    public brandService: BrandService,
    private logger: LoggerService,
    private usersService: UsersService,
  ) {
    const brand = brandService.getBrand();
    this.tparams = brand;

    if (brand) {
      this.company_name = brand['company_name'];
      this.contactUsEmail = brand['contact_us_email'];
    }
  
  }

  ngOnInit() {
    this.getBrowserLang();
    this.getCurrentProject()
    // this.getProjectById();
    this.translateMsgSubscriptionCanceledSuccessfully();
    this.translateMsgSubscriptionCanceledError();
    this.getUserRole();
    this.getProjectPlan();
    this.getWidgetUrl();
    this.getChatUrl();
    this.translateModalOnlyOwnerCanManageProjectAccount();
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


  getUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((userRole) => {

        this.logger.log('[NOTIFICATION-MSG] - SUBSCRIPTION TO USER ROLE »»» ', userRole)
        // used to display / hide 'WIDGET' and 'ANALITCS' in home.component.html
        this.USER_ROLE = userRole;
      })
  }

  getChatUrl() {
    this.CHAT_BASE_URL = this.appConfigService.getConfig().CHAT_BASE_URL;
  }

  getWidgetUrl() {
    this.WIDGET_URL = this.appConfigService.getConfig().widgetUrl;
  }

  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      this.logger.log('[NOTIFICATION-MSG] - GET PROJECT PROFILE', projectProfileData)
      if (projectProfileData) {

        this.prjct_profile_type = projectProfileData.profile_type;
        this.logger.log('[NOTIFICATION-MSG] - GET PROJECT PROFILE prjct_profile_type ', this.prjct_profile_type);
        this.subscription_is_active = projectProfileData.subscription_is_active;

        this.trial_expired = projectProfileData.trial_expired;

        this.subscription_end_date = projectProfileData.subscription_end_date;

        const projectprofile = projectProfileData.profile_name.toUpperCase()
        this.tprojectprofilemane = { projectprofile: projectprofile }
        this.profile_name = projectProfileData.profile_name;
        this.buildPlanName(projectProfileData.profile_name, this.browserLang, this.prjct_profile_type);
      }
    }, err => {
      this.logger.error('[NOTIFICATION-MSG] GET PROJECT PROFILE - ERROR', err);
    }, () => {
      this.logger.log('[NOTIFICATION-MSG] GET PROJECT PROFILE * COMPLETE *');
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  buildPlanName(planName: string, browserLang: string, planType: string) {
    this.logger.log('[NOTIFICATION-MSG] buildPlanName - planName ', planName, ' browserLang  ', browserLang);

    if (planType === 'payment') {

      this.getPaidPlanTranslation(planName)
      // if (browserLang === 'it') {
      //   this.prjct_profile_name = 'Piano ' + planName;
      //   return this.prjct_profile_name
      // } else if (browserLang !== 'it') {
      //   this.prjct_profile_name = planName + ' Plan';
      //   return this.prjct_profile_name
      // }
    }
  }

  getPaidPlanTranslation(project_profile_name) {
    this.translate.get('PaydPlanName', { projectprofile: project_profile_name })
      .subscribe((text: string) => {
        this.prjct_profile_name = text;

        // this.logger.log('+ + + PaydPlanName ', text)
      });
  }


  openModalExpiredSubscOrGoToPricing() {
    // if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
    //   this.notify.closeDataExportNotAvailable();
    //   this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
    // }

    // if (this.prjct_profile_type === 'free' && this.trial_expired === true) {
    //   this.notify.closeDataExportNotAvailable();
    //   this.router.navigate(['project/' + this.projectId + '/pricing']);
    // }

    if (this.USER_ROLE === 'owner') {
      if (this.prjct_profile_type === 'free' && this.trial_expired === true) {
        this.notify.closeDataExportNotAvailable();
        this.router.navigate(['project/' + this.projectId + '/pricing']);

      } else if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
        this.notify.closeDataExportNotAvailable();
        if (this.profile_name !== 'enterprise') {
          this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
        } else if (this.profile_name === 'enterprise') {

          this.notify.displayEnterprisePlanHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
        }
      }

    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan();
    }
  }

  presentModalOnlyOwnerCanManageTheAccountPlan() {
    const el = document.createElement('div')
    el.innerHTML = this.onlyOwnerCanManageTheAccountPlanMsg + '. ' + "<a href='https://docs.tiledesk.com/knowledge-base/understanding-default-roles/' target='_blank'>" + this.learnMoreAboutDefaultRoles + "</a>"

    swal({
      // title: this.onlyOwnerCanManageTheAccountPlanMsg,
      content: el,
      icon: "info",
      // buttons: true,
      button: {
        text: "OK",
      },
      dangerMode: false,
    })

  }



  // closeExportCSVnotAvailable

  getBrowserLang() {
    this.browserLang = this.translate.getBrowserLang();
  }

  translateMsgSubscriptionCanceledSuccessfully() {
    this.translate.get('SubscriptionSuccessfullyCanceled')
      .subscribe((text: string) => {
        this.subscriptionCanceledSuccessfully = text;
      });
  }

  translateMsgSubscriptionCanceledError() {
    this.translate.get('AnErrorOccurredWhileCancellingSubscription')
      .subscribe((text: string) => {
        this.subscriptionCanceledError = text;
      });
  }


  onOkExpiredSessionModal() {
    this.notify.onOkExpiredSessionModal();
    this.auth.signOut('notification-message');
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      // this.logger.log('[NOTIFICATION-MSG] project from AUTH service subscription  ', project)
      if (project) {
        this.projectId = project._id
        this.logger.log('[NOTIFICATION-MSG] project ID ', this.projectId)
      }
    });
  }


  cancelSubscription() {
    this.notify.cancelSubscriptionCompleted(false)

    // this.showSpinner = true;
    this.projectService.cancelSubscription().subscribe((confirmation: any) => {
      this.logger.log('[NOTIFICATION-MSG] - cancelSubscription RES ', confirmation);

      if (confirmation && confirmation.status === 'canceled') {
        this.notify.showNotification(this.subscriptionCanceledSuccessfully, 2, 'done');

        this.notify.cancelSubscriptionCompleted(true);
      }
    }, error => {
      this.logger.error('[NOTIFICATION-MSG] - cancelSubscription - ERROR: ', error);
      this.notify.showNotification(this.subscriptionCanceledError, 4, 'report_problem');

      this.notify.cancelSubscriptionCompleted(true)
    }, () => {
      this.logger.log('[NOTIFICATION-MSG] - cancelSubscription * COMPLETE *');

    });

  }


  goToPricing() {
    this.logger.log('goToPricing projectId ', this.projectId);
    this.router.navigate(['project/' + this.projectId + '/pricing']);
    this.notify.closeModalSubsExpired();
  }

  launchWidget() {
    // if (window && window['tiledesk']) {
    //   window['tiledesk'].open();
    // }
    window.open('mailto:' + this.contactUsEmail, 'mail')
  }


  // ----------------------------------------
  // TODO: PROBABLY NOT USED - VERIFY BETTER
  // ----------------------------------------
  copyToClipboard() {
    document.querySelector('textarea').select();
    document.execCommand('copy');

    this.has_copied = true;
    setTimeout(() => {
      this.has_copied = false;
    }, 2000);
  }

  // ----------------------------------------
  // TODO: PROBABLY NOT USED - VERIFY BETTER
  // ----------------------------------------
  openChat() {
    // localStorage.setItem('chatOpened', 'true');
    const url = this.CHAT_BASE_URL;
    window.open(url, '_blank');
    this.notify.publishHasClickedChat(true);
  }

  // ----------------------------------------
  // TODO: PROBABLY NOT USED - VERIFY BETTER
  // ----------------------------------------
  goToWidgetPage() {
    this.router.navigate(['project/' + this.projectId + '/widget']);
    this.notify.closeModalInstallTiledeskModal()
  }


  // --------------------------------------------------------------------------------------------
  // NOT USED - subdsribe to hasOpenChecklistModal and get project by is > project.gettingStarted
  // --------------------------------------------------------------------------------------------

  // getProjectById() {
  //   this.notify.hasOpenChecklistModal.subscribe((hasOpen: boolean) => {
  //     this.logger.log('[NOTIFICATION-MSG] - THE checklist modal has been opened ', hasOpen);

  //     if (hasOpen === true) {
  //       this.projectService.getProjectById(this.projectId)
  //         .subscribe((project: any) => {


  //           if (project) {
  //             this.logger.log('[NOTIFICATION-MSG] - GET PROJECT BY ID : ', project);

  //             if (project.gettingStarted) {
  //               this.gettingStartedChecklist = project.gettingStarted;
  //               this.logger.log('[NOTIFICATION-MSG] - GET PROJECT Getting Started Checklist : ', this.gettingStartedChecklist);
  //             }
  //           }
  //         }, (error) => {
  //           this.showSpinnerInModal = false;
  //           this.logger.error('[NOTIFICATION-MSG]  GET PROJECT BY ID - ERROR ', error);
  //         }, () => {
  //           this.showSpinnerInModal = false;
  //           this.logger.log('[NOTIFICATION-MSG]  GET PROJECT BY ID * COMPLETE *');
  //         });
  //     }
  //   })
  // }

  // -------------------------------------
  // CHECKLIST MODAL - NOT USED
  // -------------------------------------

  // hasClickedChecklist(event) {
  //   this.logger.log('[NOTIFICATION-MSG] - event : ', event);
  //   this.logger.log('[NOTIFICATION-MSG] - target name : ', event.target.name);

  //   if (event.target.name === 'openChat') {
  //     // this.openChat()
  //     this.notify.onCloseCheckLIstModal();

  //     this.updateGettingStarted('openChat');
  //   } else if (event.target.name === 'openWidget') {

  //     // this.router.navigate(['project/' + this.projectId + '/widget']);
  //     this.notify.onCloseCheckLIstModal();

  //     // const updatedGettingStarted = this.gettingStartedChecklist[1].done = true;

  //     this.updateGettingStarted('openWidget')


  //   } else if (event.target.name === 'openUserProfile') {

  //     // this.router.navigate(['project/' + this.projectId + '/user-profile']);

  //     this.notify.onCloseCheckLIstModal();
  //     // const updatedGettingStarted = this.gettingStartedChecklist[2].done = true;
  //     this.updateGettingStarted('openUserProfile')
  //   }
  // }

  // ----------------------------------------
  // CALLED BY hasClickedChecklist - NOT USED
  // ----------------------------------------

  // updateGettingStarted(selectesTask) {
  //   // const updatedGettingStarted = [
  //   //   { 'task': 'openChat', 'taskDesc': 'openChatDesc', 'done': false },
  //   //   { 'task': 'openWidget', 'taskDesc': 'openWidgetDesc', 'done': false },
  //   //   { 'task': 'openUserProfile', 'taskDesc': 'openUserProfileDesc', 'done': false }
  //   // ]


  //   const objIndex = this.gettingStartedChecklist.findIndex((obj => obj.task === selectesTask));
  //   // Log object to this.logger.
  //   this.logger.log('666 Before update: ', this.gettingStartedChecklist[objIndex])
  //   this.logger.log('666 updatedGettingStarted ', this.gettingStartedChecklist);
  //   // Update object's name property.
  //   this.gettingStartedChecklist[objIndex].done = true;

  //   // Log object to this.logger again.
  //   this.logger.log('[NOTIFICATION-MSG]  666 After update: ', this.gettingStartedChecklist[objIndex]),

  //     this.logger.log('[NOTIFICATION-MSG]  666 After update 2: ', this.gettingStartedChecklist)

  //   this.projectService.updateGettingStartedProject(this.gettingStartedChecklist)
  //     .subscribe((res) => {
  //       this.logger.log('[NOTIFICATION-MSG] - GETTING-STARTED UPDATED: ', res.gettingStarted);
  //     },
  //       (error) => {
  //         this.logger.error('[NOTIFICATION-MSG] - GETTING-STARTED UPDATED - ERROR ', error);
  //       },
  //       () => {
  //         this.logger.log('[NOTIFICATION-MSG] - GETTING-STARTED UPDATED * COMPLETE *');
  //       });
  // }


  // -----------------------------------------------------------------
  // DOWNGRADE PLAN TO FREE - DO I NEED TO DO SERVICE ON TILEDESK API?
  // ------------------------------------------------------------------

  // downgradePlanToFree() {
  //   //
  //   this.projectService.downgradePlanToFree(this.projectId)
  //     .subscribe((prjct) => {

  //       this.logger.log('[NOTIFICATION-MSG] -  downgradePlanToFree ', prjct);
  //     }, (error) => {
  //       this.logger.error('[NOTIFICATION-MSG] -  downgradePlanToFree ERROR ', error);
  //     },
  //       () => {
  //         this.logger.log('[NOTIFICATION-MSG] -  downgradePlanToFree * COMPLETE *');

  //         // CALL getProjectByID IN THE ProjectPlanService THAT PUBLISH THE UPDATED PROJECT
  //         this.prjctPlanService.getProjectByIdAndPublish(this.projectId);
  //         this.notify.closeModalSubsExpired();
  //       });
  // }


}
