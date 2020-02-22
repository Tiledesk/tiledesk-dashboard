import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProjectService } from '../services/project.service';
import { Router, ActivatedRoute } from '@angular/router';


// USED FOR go back last page
import { Location } from '@angular/common';
import { AuthService } from '../core/auth.service';
import { Project } from '../models/project-model';
import { ProjectPlanService } from '../services/project-plan.service';
import { NotifyService } from '../core/notify.service';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';

import { UsersService } from '../services/users.service';
import * as moment from 'moment';
import brand from 'assets/brand/brand.json';
import { environment } from './../../environments/environment';
import { AppConfigService } from '../services/app-config.service';

@Component({
  selector: 'app-project-edit-add',
  templateUrl: './project-edit-add.component.html',
  styleUrls: ['./project-edit-add.component.scss']
})
export class ProjectEditAddComponent implements OnInit, OnDestroy {
  tparams = brand;
  // public_Key = environment.t2y12PruGU9wUtEGzBJfolMIgK; // now get from appconfig
  public_Key: string; 
  CREATE_VIEW = false;
  EDIT_VIEW = false;
  PROJECT_SETTINGS_ROUTE: boolean;
  PROJECT_SETTINGS_PAYMENTS_ROUTE: boolean;
  PROJECT_SETTINGS_AUTH_ROUTE: boolean;

  
  showSpinner = true;

  project_name: string;
  projectName_toUpdate: string;
  id_project: string;

  display = 'none';
  displayJwtSecretGeneratedModal = 'none';
  displayConfirmJwtSecretCreationModal = 'none';
  sharedSecret: string;

  DISABLE_UPDATE_BTN = true;
  project: Project;

  AUTO_SEND_TRANSCRIPT_IS_ON: boolean;

  prjct_name: string;
  prjct_profile_name: string;
  prjct_trial_expired: boolean;
  prjc_trial_days_left: any;
  prjct_profile_type: string;
  subscription_is_active: boolean;
  subscription_end_date: Date;

  displayContactUsModal = 'none';
  subscription: Subscription;

  subscriptionCanceledSuccessfully: string;
  subscriptionCanceledError: string;

  cancelSubscriptionDone = false;
  subscription_payments: any;
  subscription_creation_date: string;
  current_invoice_start_date: string;
  current_invoice_end_date: string;

  stripe_subscription_objct: any;
  days_to_next_renew: number;
  numberOf_agents_seats: number;
  subscription_start_date: string;
  timeOfNextRenew: string;
  plan_amount: string;
  plan_interval: string;
  isVisible: boolean;
  browser_lang: string;
  countOfPendingInvites: number;
  projectUsersLength: number;
  subscriptionPaymentsLength: number;
  SUBSCRIPTION_BUFFER_DAYS: boolean;
  
  constructor(
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute,
    private _location: Location,
    private auth: AuthService,
    private prjctPlanService: ProjectPlanService,
    private notify: NotifyService,
    private usersService: UsersService,
    private translate: TranslateService,
    public appConfigService: AppConfigService

  ) { }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    this.getCurrentUrlAndSwitchView();

    this.getProjectPlan();

    this.listenCancelSubscription();

    this.translateMsgSubscriptionCanceledSuccessfully();
    this.translateMsgSubscriptionCanceledError();

    this.getProjectId();
    this.getBrowserLanguage();
    this.getOSCODE();
    this.getAllUsersOfCurrentProject();
    this.getPendingInvitation();
  }

  getPendingInvitation() {
    this.usersService.getPendingUsers()
      .subscribe((pendingInvitation: any) => {
        console.log('ProjectEditAddComponent - GET PENDING INVITATION ', pendingInvitation);

        if (pendingInvitation) {
          this.countOfPendingInvites = pendingInvitation.length
          console.log('ProjectEditAddComponent - # OF PENDING INVITATION ', this.countOfPendingInvites);
        }
      }, error => {
        console.log('ProjectEditAddComponent - GET PENDING INVITATION - ERROR', error);
      }, () => {
        console.log('ProjectEditAddComponent - GET PENDING INVITATION - COMPLETE');
      });
  }

  getAllUsersOfCurrentProject() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      console.log('ProjectEditAddComponent PROJECT USERS ', projectUsers);

      if (projectUsers) {
        this.projectUsersLength = projectUsers.length;
        console.log('ProjectEditAddComponent # OF PROJECT USERS ', this.projectUsersLength);
      }
    }, error => {
      console.log('ProjectEditAddComponent PROJECT USERS - ERROR', error);
    }, () => {
      console.log('ProjectEditAddComponent PROJECT USERS - COMPLETE');
    });
  }


  getBrowserLanguage() {
    this.browser_lang = this.translate.getBrowserLang();
    console.log('ProjectEditAddComponent - browser_lang ', this.browser_lang)
  }


  getOSCODE() {

    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    console.log('AppConfigService getAppConfig (PROJECT-EDIT-ADD) public_Key', this.public_Key);
    let keys = this.public_Key.split("-");
    console.log('PUBLIC-KEY (Home) keys', keys)
    keys.forEach(key => {
      // console.log('NavbarComponent public_Key key', key)
      if (key.includes("PAY")) {
        console.log('PUBLIC-KEY (Home) - key', key);
        let pay = key.split(":");
        console.log('PUBLIC-KEY (Home) - pay key&value', pay);
        if (pay[1] === "F") {
          this.isVisible = false;
        } else {
          this.isVisible = true;
        }
      }
    });

    // console.log('ProjectEditAddComponent eoscode', this.eos);
    // if (this.eos && this.eos === publicKey) {

    //   this.isVisible = true;
    //   console.log('ProjectEditAddComponent eoscode isVisible ', this.isVisible);
    // } else {

    //   this.isVisible = false;
    //   console.log('ProjectEditAddComponent eoscode isVisible ', this.isVisible);
    // }
  }

  getCurrentUrlAndSwitchView() {

    const currentUrl = this.router.url;
    console.log('%ProjectEditAddComponent current_url ', currentUrl);

    console.log('%ProjectEditAddComponent PROJECT_SETTINGS_ROUTE ', currentUrl.indexOf('/project-settings/general'));
    console.log('%ProjectEditAddComponent PROJECT_SETTINGS_PAYMENTS_ROUTE ', currentUrl.indexOf('/project-settings/payments'));
    console.log('%ProjectEditAddComponent PROJECT_SETTINGS_AUTH_ROUTE ', currentUrl.indexOf('/project-settings/auth'));

    /** THE ACTIVE ROUTE IS /project-settings */
    if (
      (currentUrl.indexOf('/project-settings/general') !== -1) &&
      (currentUrl.indexOf('/project-settings/payments') === -1) &&
      (currentUrl.indexOf('/project-settings/auth') === -1)
    ) {
      console.log('%ProjectEditAddComponent router.url', this.router.url);

      this.PROJECT_SETTINGS_ROUTE = true;
      this.PROJECT_SETTINGS_PAYMENTS_ROUTE = false;
      this.PROJECT_SETTINGS_AUTH_ROUTE = false;
      console.log('%ProjectEditAddComponent is PROJECT_SETTINGS_ROUTE ', this.PROJECT_SETTINGS_ROUTE);
      console.log('%ProjectEditAddComponent is PROJECT_SETTINGS_PAYMENTS_ROUTE ', this.PROJECT_SETTINGS_PAYMENTS_ROUTE);
      console.log('%ProjectEditAddComponent is PROJECT_SETTINGS_AUTH_ROUTE ', this.PROJECT_SETTINGS_AUTH_ROUTE);

      /** THE ACTIVE ROUTE IS /project-settings/payments */
    } else if (
      (currentUrl.indexOf('/project-settings/general') === -1) &&
      (currentUrl.indexOf('/project-settings/payments') !== -1) &&
      (currentUrl.indexOf('/project-settings/auth') === -1)

    ) {
      this.PROJECT_SETTINGS_ROUTE = false;
      this.PROJECT_SETTINGS_PAYMENTS_ROUTE = true;
      this.PROJECT_SETTINGS_AUTH_ROUTE = false;

      console.log('%ProjectEditAddComponent is PROJECT_SETTINGS_ROUTE ', this.PROJECT_SETTINGS_ROUTE);
      console.log('%ProjectEditAddComponent is PROJECT_SETTINGS_PAYMENTS_ROUTE ', this.PROJECT_SETTINGS_PAYMENTS_ROUTE);
      console.log('%ProjectEditAddComponent is PROJECT_SETTINGS_AUTH_ROUTE ', this.PROJECT_SETTINGS_AUTH_ROUTE);

      /** THE ACTIVE ROUTE IS project-settings/auth */
    } else if (
      (currentUrl.indexOf('/project-settings/general') === -1) &&
      (currentUrl.indexOf('/project-settings/payments') === -1) &&
      (currentUrl.indexOf('/project-settings/auth') !== -1)
    ) {
      this.PROJECT_SETTINGS_ROUTE = false;
      this.PROJECT_SETTINGS_PAYMENTS_ROUTE = false;
      this.PROJECT_SETTINGS_AUTH_ROUTE = true;
      console.log('%ProjectEditAddComponent is PROJECT_SETTINGS_ROUTE ', this.PROJECT_SETTINGS_ROUTE);
      console.log('%ProjectEditAddComponent is PROJECT_SETTINGS_PAYMENTS_ROUTE ', this.PROJECT_SETTINGS_PAYMENTS_ROUTE);
      console.log('%ProjectEditAddComponent is PROJECT_SETTINGS_AUTH_ROUTE ', this.PROJECT_SETTINGS_AUTH_ROUTE);
    }

  }


  goToProjectSettings_Payments() {
    console.log('%ProjectEditAddComponent HAS CLICKED goToProjectSettings_Payments ');
    this.router.navigate(['project/' + this.id_project + '/project-settings/payments']);
  }

  goToProjectSettings_General() {
    console.log('%ProjectEditAddComponent HAS CLICKED goToProjectSettings_General ');
    this.router.navigate(['project/' + this.id_project + '/project-settings/general']);
  }

  goToProjectSettings_Auth() {
    console.log('%ProjectEditAddComponent HAS CLICKED goToProjectSettings_Auth ');
    this.router.navigate(['project/' + this.id_project + '/project-settings/auth']);
  }

  // "SubscriptionSuccessfullyCanceled":"Abbonamento annullato correttamente",
  // "AnErrorOccurredWhileCancellingSubscription": "Si è verificato un errore durante l'annullamento dell'abbonamento",
  // TRANSLATION
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

  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      console.log('ProjectPlanService (ProjectEditAddComponent) project Profile Data', projectProfileData)
      if (projectProfileData) {
        this.prjct_name = projectProfileData.name;
        this.prjct_profile_name = projectProfileData.profile_name;
        this.prjct_trial_expired = projectProfileData.trial_expired;
        this.prjc_trial_days_left = projectProfileData.trial_days_left;

        this.numberOf_agents_seats = projectProfileData.profile_agents

        // nk new

        this.prjct_profile_type = projectProfileData.profile_type;
        this.subscription_is_active = projectProfileData.subscription_is_active;
        this.subscription_end_date = projectProfileData.subscription_end_date;
        this.subscription_start_date = projectProfileData.subscription_start_date;
        this.subscription_creation_date = projectProfileData.subscription_creation_date;
        /**
         * *** GET THE subscription_creation_date FROM THE PTOJECT PROFILE ***
         */
        // if (projectProfileData.subscription_creation_date) {
        //   this.subscription_creation_date = projectProfileData.subscription_creation_date;
        //   console.log('ProjectPlanService (ProjectEditAddComponent) subscription_creation_date', this.subscription_creation_date)
        // }
        // RETURN THE CURRENT DAY AT THE TIME 00:00:00
        const today = moment().startOf('day')

        // RETURN THE CURRENT DAY AT THE CURRENT TIME
        // const today = moment();
        // 2019-09-20T08:48:07.000Z
        const current_sub_end_date = moment(this.subscription_end_date)
        console.log('»»»»» ProjectEditAddComponent project Profile Data ', today);
        console.log('»»»»» ProjectEditAddComponent project Profile Data current_sub_end_date ', current_sub_end_date);

        this.days_to_next_renew = current_sub_end_date.diff(today, 'days');
        console.log('»»»»» ProjectEditAddComponent project Profile Data days_to_next_renew ', this.days_to_next_renew);

        if (this.days_to_next_renew === 0) {

          this.timeOfNextRenew = moment(current_sub_end_date).format('HH.mm')
          console.log('»»»»» ProjectEditAddComponent project Profile Data timeOfNextRenew ', this.timeOfNextRenew);
        }

        // USE CASE 'BUFFER DAYS': WHEN THE SUBSCRIPTION IS EXPIRED WE ADD 3 DAYS TO THE SUB END DATE
        // WHEN days_to_next_renew IS = -3 OR > 3 THE SUBSCRIPTION IS NOT ACTIVE
        // WHEN days_to_next_renew IS = 0 THE SUBSCRIPTION IS ACTIVE
        // WHEN days_to_next_renew IS = -1 OR = -2 THE STRIPE SUBCRIPTION IS EXPIRED BUT WE NOT STILL LOCKED THE PRO FEATURE
        if (this.days_to_next_renew === -1 || this.days_to_next_renew === -2) {

          this.SUBSCRIPTION_BUFFER_DAYS = true;
          console.log('»»»»» ProjectEditAddComponent days_to_next_renew ', this.days_to_next_renew, ' SUBSCRIPTION_BUFFER_DAYS ', this.SUBSCRIPTION_BUFFER_DAYS);
        } else {
          this.SUBSCRIPTION_BUFFER_DAYS = false;
          console.log('»»»»» ProjectEditAddComponent days_to_next_renew ', this.days_to_next_renew, ' SUBSCRIPTION_BUFFER_DAYS ', this.SUBSCRIPTION_BUFFER_DAYS);
        }


        // if (this.prjct_profile_name === 'free') {
        if (this.prjct_profile_type === 'free') {
          if (this.prjct_trial_expired === false) {
            this.prjct_profile_name = 'Pro (free trial 30gg)'
          } else {
            this.prjct_profile_name = projectProfileData.profile_name;
          }
        } else if (this.prjct_profile_type === 'payment') {

          this.prjct_profile_name = projectProfileData.profile_name;
        }

        this.getSubscriptionPayments(projectProfileData.subscription_id)
        // this.getSubscriptionByID(projectProfileData.subscription_id);
      }
    })
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  openModalSubsExpired() {
    this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
  }

  // !!! NOT USED -- RETRIEVE THE CURRENT SUBSCRIPTION FROM STRIPE
  // getSubscriptionByID(subscription_id: string) {
  //   this.projectService.getSubscriptionById(subscription_id)
  //     .subscribe((subscription: any) => {
  //       this.stripe_subscription_objct = subscription;
  //       console.log('»»»»» ProjectEditAddComponent get subscription by id ', subscription);

  //       // RETURN THE CURRENT DAY AT THE TIME 00:00:00
  //       // const today = moment().startOf('day')

  //       // RETURN THE CURRENT DAY AT THE CURRENT TIME
  //       const today = moment();

  //       const current_sub_end_date = moment(subscription.current_period_end * 1000)
  //       console.log('»»»»» ProjectEditAddComponent get subscription by id today ', today);
  //       console.log('»»»»» ProjectEditAddComponent get subscription by id current_sub_end_date ', current_sub_end_date);

  //       this.days_to_next_renew = current_sub_end_date.diff(today, 'days');
  //       console.log('»»»»» ProjectEditAddComponent get subscription by id days_to_next_renew ', this.days_to_next_renew);

  //       if (this.days_to_next_renew === 0) {

  //         const timeOfNextRenew = moment(current_sub_end_date).format('HH.mm')
  //         console.log('»»»»» ProjectEditAddComponent get subscription by id timeOfNextRenew ', timeOfNextRenew);
  //       }

  //     }, (error) => {
  //       console.log('»»»»» ProjectEditAddComponent get subscription by id ', error);

  //     }, () => {
  //       console.log('»»»»» ProjectEditAddComponent get subscription by id * COMPLETE * ');
  //     });
  // }

  // GET THE SUBSCRIPTION PAYMENT SAVED IN OUR DB
  getSubscriptionPayments(subscription_id) {
    this.projectService.getSubscriptionPayments(subscription_id).subscribe((subscriptionPayments: any) => {
      console.log('ProjectEditAddComponent get subscriptionPayments ', subscriptionPayments);

      this.subscriptionPaymentsLength = subscriptionPayments.length
      console.log('ProjectEditAddComponent get subscriptionPayments Length ', this.subscriptionPaymentsLength);
      if (subscriptionPayments) {
        this.subscription_payments = [];
        subscriptionPayments.forEach((subscriptionPayment, index) => {
          console.log('ProjectEditAddComponent subscriptionPayment.stripe_event ', subscriptionPayment.stripe_event);

          if (subscriptionPayment.stripe_event === 'invoice.payment_succeeded') {

            /**
             **! *** GET THE subscription_creation_date FROM THE SUBSCRIPTION PAYMENT OBJECT OF TYPE invoice.payment_succeeded ***
             *  AND billing_reason === 'subscription_create'
             */
            if (subscriptionPayment.object.data.object.billing_reason === 'subscription_create') {
              this.subscription_creation_date = subscriptionPayment.object.data.object.lines.data[0].period.start

              console.log('ProjectEditAddComponent subscription creation date ', this.subscription_creation_date);

            }

            // get the last iteration in a _.forEach() loop

            this.plan_amount = subscriptionPayment.object.data.object.lines.data[0].plan.amount;
            console.log('»»»»» ProjectEditAddComponent plan_amount ', this.plan_amount);

            this.plan_interval = subscriptionPayment.object.data.object.lines.data[0].plan.interval;
            console.log('»»»»»  ProjectEditAddComponent plan_interval ', this.plan_interval);

            // if (index === subscriptionPayments.length - 1) {

            //   console.log('last invoice ', subscriptionPayment);
            //   this.current_invoice_start_date = subscriptionPayment.object.data.object.lines.data[0].period.start
            //   this.current_invoice_end_date = subscriptionPayment.object.data.object.lines.data[0].period.end

            // }

            const plan_description = subscriptionPayment.object.data.object.lines.data[0].description;
            console.log('ProjectEditAddComponent subscriptionPayment plan_description: ', plan_description);

            if (plan_description.indexOf('×') !== -1) {
              const planSubstring = plan_description.split('×').pop();
              console.log('ProjectEditAddComponent subscriptionPayment planSubstring: ', planSubstring);
              if (plan_description.indexOf('(') !== -1) {
                const planName = planSubstring.substring(0, planSubstring.indexOf('('));
                console.log('ProjectEditAddComponent subscriptionPayment planName: ', planName);

                subscriptionPayment.plan_name = planName.trim()
              }

              if (plan_description.indexOf('after') !== -1) {
                const planName = planSubstring.substring(0, planSubstring.indexOf('after'));
                console.log('ProjectEditAddComponent subscriptionPayment planName: ', planName);

                subscriptionPayment.plan_name = planName.trim()
              }
            } else {
              subscriptionPayment.plan_name = plan_description
            }
            this.subscription_payments.push(subscriptionPayment);

          }


        });
        console.log('ProjectEditAddComponent FILTERED subscriptionPayments ', this.subscription_payments);
      }
    }, (error) => {
      console.log('ProjectEditAddComponent get subscriptionPayments error ', error);
      this.showSpinner = false;
    }, () => {
      console.log('ProjectEditAddComponent get subscriptionPayments * COMPLETE * ');
      this.showSpinner = false;
    });
  }


  /**
   * *** CANCEL SUBSCRIPTION ***
   * * the callback cancelSubscription() IS RUNNED in NotificationMessageComponent when the user click on
   *   the modal button Cancel Subscription
   * * NotificationMessageComponent, through the notify service, publishes the progress status
   *   of the cancellation of the subscription
   * * the NavbarComponent is subscribed to cancelSubscriptionCompleted$ and, when hasDone === true,
   *   call prjctPlanService.getProjectByID() that get and publish (with prjctPlanService.projectPlan$) the updated project object
   * * this component is a subscriber of prjctPlanService.projectPlan$ so the UI is refreshed when the prjctPlanService publish projectPlan$
   */

  listenCancelSubscription() {
    this.notify.cancelSubscriptionCompleted$.subscribe((hasDone: boolean) => {

      console.log('ProjectEditAddComponent cancelSubscriptionCompleted hasDone', hasDone);
      if (hasDone === false) {
        this.showSpinner = true;
      }

      if (hasDone === true) {
        this.showSpinner = false;
        // this.prjct_profile_type = 'free'
      }
    });
  }

  // doCancelSubcription() {
  //   this.showSpinner = true;
  //   this.projectService.cancelSubscription().subscribe((confirmation: any) => {
  //     console.log('cancelSubscription RES ', confirmation);

  //     if (confirmation && confirmation.status === 'canceled') {
  //       this.notify.showNotification(this.subscriptionCanceledSuccessfully, 2, 'done');

  //       // this.ngOnInit()
  //       this.prjct_profile_type = 'free'
  //       this.cancelSubscriptionDone = true;
  //       console.log('ProjectEditAddComponent cancelSubscriptionDone ', this.cancelSubscriptionDone);
  //       // setTimeout(() => {
  //       // }, 2000);
  //     }
  //   }, error => {
  //     console.log('cancelSubscription - ERROR: ', error);
  //     this.notify.showNotification(this.subscriptionCanceledError, 4, 'report_problem');
  //     this.showSpinner = false;
  //   }, () => {
  //     console.log('cancelSubscription * COMPLETE *');
  //     this.showSpinner = false;
  //   });
  // }

  goToPayments() {
    this.router.navigate(['project/' + this.id_project + '/payments']);
  }

  // openLetsChatModal() {
  //   this.displayContactUsModal = 'block';
  //   console.log('openLetsChatModal')
  // }
  getMoreOperatorsSeats() {
    this.notify._displayContactUsModal(true, 'upgrade_plan');
  }

  closeContactUsModal() {
    this.displayContactUsModal = 'none';
  }

  launchWidget() {
    if (window && window['tiledesk']) {
      window['tiledesk'].open();
    }
  }

  goToPricing() {
    this.router.navigate(['project/' + this.id_project + '/pricing']);
  }

  // !!! NO MORE USED - GO BACK TO PROJECT LIST
  goBackToProjectsList() {
    this.router.navigate(['/projects']);
  }

  goBack() {
    this._location.back();
  }

  getProjectId() {
    this.id_project = this.route.snapshot.params['projectid'];
    console.log('PROJECT COMPONENT HAS PASSED id_project ', this.id_project);
    if (this.id_project) {
      this.getProjectById();
    }

  }

  /**
   * *** GET PROJECT OBJECT BY ID (EDIT VIEW) ***
   * THE ID USED TO RUN THIS getMongDbBotById IS PASSED FROM BOTS LIST (BOTS COMPONENT goToEditAddPage_EDIT))
   * FROM THE BOT OBJECT IS USED:
   */
  getProjectById() {
    this.projectService.getProjectById(this.id_project).subscribe((project: any) => {
      console.log('PRJCT-EDIT-ADD - GET PROJECT (DETAILS) BY ID - PROJECT OBJECT: ', project);

      if (project) {
        this.projectName_toUpdate = project.name;
        console.log('PRJCT-EDIT-ADD - PROJECT NAME TO UPDATE: ', this.projectName_toUpdate);

        // used in onProjectNameChange to enable / disable the 'update project name' btn
        this.project_name = project.name;

        if (project.settings) {

          if (project.settings.email.autoSendTranscriptToRequester === true) {
            console.log('PRJCT-EDIT-ADD - ON INIT AUTO SEND TRANSCRIPT IS ', project.settings.email.autoSendTranscriptToRequester);

            this.AUTO_SEND_TRANSCRIPT_IS_ON = true;
            console.log('PRJCT-EDIT-ADD - ON INIT AUTO SEND TRANSCRIPT IS ON ', this.AUTO_SEND_TRANSCRIPT_IS_ON);

          } else {
            this.AUTO_SEND_TRANSCRIPT_IS_ON = false;
            console.log('PRJCT-EDIT-ADD - ON INIT AUTO SEND TRANSCRIPT IS ON ', this.AUTO_SEND_TRANSCRIPT_IS_ON);
          }
        } else {

          this.AUTO_SEND_TRANSCRIPT_IS_ON = false;
          console.log('PRJCT-EDIT-ADD - ON INIT AUTO SEND TRANSCRIPT IS ON ', this.AUTO_SEND_TRANSCRIPT_IS_ON);
        }
      }

    }, (error) => {
      console.log('PRJCT-EDIT-ADD - GET PROJECT BY ID - ERROR ', error);
      this.showSpinner = false;
    }, () => {
      console.log('PRJCT-EDIT-ADD - GET PROJECT BY ID - COMPLETE ');
      this.showSpinner = false;
    });
  }

  /**
   * ADD PROJECT (CREATE VIEW)  */
  // createProject() {
  //   console.log('CREATE PROJECT - PROJECT-NAME DIGIT BY USER ', this.project_name);

  //   this.projectService.addMongoDbProject(this.project_name)
  //     .subscribe((project) => {
  //       console.log('POST DATA PROJECT', project);

  //       // if (project) {
  //       //   this.projectService.createUserProject(project._id)
  //       //   .subscribe((project_user) => {

  //       //     console.log('POST DATA PROJECT-USER ', project_user);
  //       //   },
  //       //   (error) => {
  //       //     console.log('CREATE PROJECT-USER - POST REQUEST ERROR ', error);
  //       //   },
  //       // );
  //       // }
  //     }, (error) => {
  //       console.log('CREATE PROJECT - POST REQUEST ERROR ', error);
  //     }, () => {
  //       console.log('CREATE PROJECT - POST REQUEST COMPLETE ');

  //       this.router.navigate(['/projects']);
  //     });
  // }

  onProjectNameChange(event) {

    console.log('ON PROJECT NAME CHANGE ', event);
    console.log('ON PROJECT NAME TO UPDATE ', this.project_name);

    if (event === this.project_name) {
      this.DISABLE_UPDATE_BTN = true;

    } else {
      this.DISABLE_UPDATE_BTN = false;
    }
  }

  edit() {
    console.log('PROJECT ID WHEN EDIT IS PRESSED ', this.id_project);
    console.log('PROJECT NAME WHEN EDIT IS PRESSED ', this.projectName_toUpdate);

    this.projectService.updateMongoDbProject(this.id_project, this.projectName_toUpdate)
      .subscribe((prjct) => {
        console.log('UPDATE PROJECT - RESPONSE ', prjct);

        if (prjct) {
          if (prjct.name === this.projectName_toUpdate) {
            this.DISABLE_UPDATE_BTN = true;
          }

          // WHEN THE USER UPDATE THE PROJECT ITS ID and NAME IS SEND IN THE AUTH SERVICE THAT RE-PUBLISHES IT
          const project: Project = {
            _id: this.id_project,
            name: prjct.name,
          }
          this.auth.projectSelected(project)

          const storedProjectJson = localStorage.getItem(this.id_project);
          console.log('PRJCT-EDIT-ADD - STORED PROJECT JSON ', storedProjectJson);

          if (storedProjectJson) {
            const projectObject = JSON.parse(storedProjectJson);
            console.log('PRJCT-EDIT-ADD - STORED PROJECT OBJ ', projectObject);
            const storedUserRole = projectObject['role'];
            console.log('PRJCT-EDIT-ADD - STORED PROJECT OBJ - USER ROLE ', storedUserRole);
            const storedProjectName = projectObject['name'];
            console.log('PRJCT-EDIT-ADD - STORED PROJECT OBJ - PRJ NAME ', storedProjectName);
            const storedProjectId = projectObject['_id'];
            console.log('PRJCT-EDIT-ADD - STORED PROJECT OBJ - PRJ ID ', storedProjectId);

            if (storedProjectName !== prjct.name) {

              const updatedProjectForStorage: Project = {
                _id: storedProjectId,
                name: prjct.name,
                role: storedUserRole
              }

              // RE-SET THE PROJECT IN THE STORAGE WITH THE UPDATED NAME
              localStorage.setItem(storedProjectId, JSON.stringify(updatedProjectForStorage));

            }
          }
        }

      }, (error) => {
        console.log('UPDATE PROJECT - ERROR ', error);
      }, () => {
        console.log('UPDATE PROJECT * COMPLETE *');
        // this.router.navigate(['/projects']);
      });
  }


  autoSendTranscriptOnOff($event) {
    console.log('»» PRJCT-EDIT-ADD - AUTO SEND TRANSCRIPT BY EMAIL ON ', $event.target.checked);

    this.projectService.updateAutoSendTranscriptToRequester($event.target.checked)
      .subscribe((prjct) => {
        console.log('PRJCT-EDIT-ADD AUTO SEND TRANSCRIPT UPDATE PROJECT - RES ', prjct);

      }, (error) => {
        console.log('PRJCT-EDIT-ADD AUTO SEND TRANSCRIPT UPDATE PROJECT - ERROR ', error);
      }, () => {
        console.log('PRJCT-EDIT-ADD AUTO SEND TRANSCRIPT UPDATE PROJECT * COMPLETE *');
        // this.router.navigate(['/projects']);
      });
  }

  openConfirmJwtSecretCreationModal() {
    this.displayConfirmJwtSecretCreationModal = 'block';
  }

  closeConfirmJwtSecretCreationModal() {
    this.displayConfirmJwtSecretCreationModal = 'none';
  }

  generateSharedSecret() {
    this.displayConfirmJwtSecretCreationModal = 'none';
    this.projectService.generateSharedSecret()
      .subscribe((res) => {
        console.log('PRJCT-EDIT-ADD GENERATE SHARED SECRET - RESPONSE ', res);
        this.sharedSecret = res.jwtSecret

      }, (error) => {
        console.log('PRJCT-EDIT-ADD GENERATE SHARED SECRET - ERROR ', error);
      }, () => {
        console.log('PRJCT-EDIT-ADD GENERATE SHARED SECRET  * COMPLETE *');

        this.displayJwtSecretGeneratedModal = 'block'
      });
  }

  closeJwtSecretGeneratedModal() {
    this.displayJwtSecretGeneratedModal = 'none'
  }

  copySharedSecret() {
    const copyText = document.getElementById('sharedSecretInput') as HTMLInputElement;
    copyText.select();
    document.execCommand('copy');
  }


  /**
   * MODAL DELETE PROJECT
   * @param id
   * @param projectName
   */
  openDeleteModal() {
    console.log('OPEN DELETE MODAL -> PROJECT ID ', this.id_project);
    this.display = 'block';
  }

  onCloseModal() {
    this.display = 'none';
  }

  goToWidgetAuthenticationDocs() {
    const url = 'https://docs.tiledesk.com/widget/auth'
    window.open(url, '_blank');
  }

  viewCancelSubscription() {
    this.notify.displayCancelSubscriptionModal(true);
  }



}
