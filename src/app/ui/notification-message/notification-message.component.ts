import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';

import { NotifyService } from '../../core/notify.service';
import { AuthService } from '../../core/auth.service';
import { ProjectService } from '../../services/project.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { ProjectPlanService } from '../../services/project-plan.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'notification-message',
  templateUrl: './notification-message.component.html',
  styleUrls: ['./notification-message.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NotificationMessageComponent implements OnInit, OnDestroy {
  displayExpiredSessionModal: string;
  projectId: string;
  gettingStartedChecklist: any;

  CHAT_BASE_URL = environment.chat.CHAT_BASE_URL;
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
  WIDGET_URL = environment.widgetUrl;
  has_copied = false;
  constructor(
    public notify: NotifyService,
    public auth: AuthService,
    public projectService: ProjectService,
    private router: Router,
    private translate: TranslateService,
    private prjctPlanService: ProjectPlanService
  ) { }

  ngOnInit() {
    this.getBrowserLang();
    this.getCurrentProject()
    this.getProjectById();
    this.translateMsgSubscriptionCanceledSuccessfully();
    this.translateMsgSubscriptionCanceledError();
    this.getProjectPlan();
  }

  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      console.log('UserEditAddComponent - project Profile Data', projectProfileData)
      if (projectProfileData) {

        this.prjct_profile_type = projectProfileData.profile_type;
        console.log('UserEditAddComponent prjct_profile_type ', this.prjct_profile_type);
        this.subscription_is_active = projectProfileData.subscription_is_active;

        this.trial_expired = projectProfileData.trial_expired;

        this.subscription_end_date = projectProfileData.subscription_end_date

        this.prjct_profile_name = this.buildPlanName(projectProfileData.profile_name, this.browserLang, this.prjct_profile_type);
      }
    })
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  buildPlanName(planName: string, browserLang: string, planType: string) {
    console.log('StaticPageBaseComponent planName ', planName, ' browserLang  ', browserLang);

    if (planType === 'payment') {
      if (browserLang === 'it') {
        this.prjct_profile_name = 'Piano ' + planName;
        return this.prjct_profile_name
      } else if (browserLang !== 'it') {
        this.prjct_profile_name = planName + ' Plan';
        return this.prjct_profile_name
      }
    }
  }


  openModalExpiredSubscOrGoToPricing() {
    if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
      this.notify.closeDataExportNotAvailable();
      this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
    }

    if (this.prjct_profile_type === 'free' && this.trial_expired === true) {
      this.notify.closeDataExportNotAvailable();
      this.router.navigate(['project/' + this.projectId + '/pricing']);
    }
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
    this.auth.signOut();
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      // console.log('00 -> Notification Message Component project from AUTH service subscription  ', project)

      if (project) {
        this.projectId = project._id
      }
    });
  }

  getProjectById() {
    this.notify.hasOpenChecklistModal.subscribe((hasOpen: boolean) => {
      console.log('Notification-Message-Component - THE checklist modal has been opened ', hasOpen);

      if (hasOpen === true) {
        this.projectService.getProjectById(this.projectId)
          .subscribe((project: any) => {


            if (project) {
              console.log('Notification-Message-Component - GET PROJECT BY ID : ', project);

              if (project.gettingStarted) {
                this.gettingStartedChecklist = project.gettingStarted;
                console.log('Notification-Message-Component - GET PROJECT Getting Started Checklist : ', this.gettingStartedChecklist);
              }
            }
          }, (error) => {
            this.showSpinnerInModal = false;
            console.log('GET PROJECT BY ID - ERROR ', error);
          }, () => {
            this.showSpinnerInModal = false;
            console.log('GET PROJECT BY ID * COMPLETE *');
          });
      }
    })
  }

  hasClickedChecklist(event) {
    console.log('Notification-Message-Component - event : ', event);
    console.log('Notification-Message-Component - target name : ', event.target.name);

    if (event.target.name === 'openChat') {
      // this.openChat()
      this.notify.onCloseCheckLIstModal();

      this.updateGettingStarted('openChat');
    } else if (event.target.name === 'openWidget') {

      // this.router.navigate(['project/' + this.projectId + '/widget']);
      this.notify.onCloseCheckLIstModal();

      // const updatedGettingStarted = this.gettingStartedChecklist[1].done = true;

      this.updateGettingStarted('openWidget')


    } else if (event.target.name === 'openUserProfile') {

      // this.router.navigate(['project/' + this.projectId + '/user-profile']);

      this.notify.onCloseCheckLIstModal();
      // const updatedGettingStarted = this.gettingStartedChecklist[2].done = true;
      this.updateGettingStarted('openUserProfile')
    }
  }

  updateGettingStarted(selectesTask) {
    // const updatedGettingStarted = [
    //   { 'task': 'openChat', 'taskDesc': 'openChatDesc', 'done': false },
    //   { 'task': 'openWidget', 'taskDesc': 'openWidgetDesc', 'done': false },
    //   { 'task': 'openUserProfile', 'taskDesc': 'openUserProfileDesc', 'done': false }
    // ]


    const objIndex = this.gettingStartedChecklist.findIndex((obj => obj.task === selectesTask));
    // Log object to Console.
    console.log('666 Before update: ', this.gettingStartedChecklist[objIndex])
    console.log('666 updatedGettingStarted ', this.gettingStartedChecklist);
    // Update object's name property.
    this.gettingStartedChecklist[objIndex].done = true;

    // Log object to console again.
    console.log('666 After update: ', this.gettingStartedChecklist[objIndex]),

      console.log('666 After update 2: ', this.gettingStartedChecklist)

    this.projectService.updateGettingStartedProject(this.gettingStartedChecklist)
      .subscribe((res) => {
        console.log('GETTING-STARTED UPDATED: ', res.gettingStarted);
      },
        (error) => {
          console.log('GETTING-STARTED UPDATED - ERROR ', error);
        },
        () => {
          console.log('GETTING-STARTED UPDATED * COMPLETE *');
        });
  }

  openChat() {
    // localStorage.setItem('chatOpened', 'true');
    const url = this.CHAT_BASE_URL;
    window.open(url, '_blank');

    this.notify.publishHasClickedChat(true);
  }


  downgradePlanToFree() {

    // BISOGNA FARE SERVIZIO SU TILEDESK API
    this.projectService.downgradePlanToFree(this.projectId)
      .subscribe((prjct) => {

        console.log('NotificationMessageComponent -  downgradePlanToFree ', prjct);
      }, (error) => {
        console.log('NotificationMessageComponent -  downgradePlanToFree ERROR ', error);
      },
        () => {
          console.log('NotificationMessageComponent -  downgradePlanToFree * COMPLETE *');

          // CALL getProjectByID IN THE ProjectPlanService THAT PUBLISH THE UPDATED PROJECT
          this.prjctPlanService.getProjectByID(this.projectId);
          this.notify.closeModalSubsExpired();
        });
  }


  cancelSubscription() {
    this.notify.cancelSubscriptionCompleted(false)

    // this.showSpinner = true;
    this.projectService.cancelSubscription().subscribe((confirmation: any) => {
      console.log('cancelSubscription RES ', confirmation);

      if (confirmation && confirmation.status === 'canceled') {
        this.notify.showNotification(this.subscriptionCanceledSuccessfully, 2, 'done');

        this.notify.cancelSubscriptionCompleted(true)
        // this.prjct_profile_type = 'free'
        // console.log('ProjectEditAddComponent cancelSubscriptionDone ', this.cancelSubscriptionDone);

      }
    }, error => {
      console.log('cancelSubscription - ERROR: ', error);
      this.notify.showNotification(this.subscriptionCanceledError, 4, 'report_problem');
      // this.showSpinner = false;
      this.notify.cancelSubscriptionCompleted(true)
    }, () => {
      console.log('cancelSubscription * COMPLETE *');
      // this.showSpinner = false;
    });

  }



  goToPricing() {
    console.log('goToPricing projectId ', this.projectId);
    this.router.navigate(['project/' + this.projectId + '/pricing']);
    this.notify.closeModalSubsExpired();
  }

  launchWidget() {
    if (window && window['tiledesk']) {
      window['tiledesk'].open();
    }
  }

  copyToClipboard() {
    document.querySelector('textarea').select();
    document.execCommand('copy');

    this.has_copied = true;
    setTimeout(() => {
      this.has_copied = false;
    }, 2000);
  }

  goToWidgetPage() {

    this.router.navigate(['project/' + this.projectId + '/widget']);

    this.notify.closeModalInstallTiledeskModal()
  }


}
