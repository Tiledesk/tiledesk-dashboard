import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { Location } from '@angular/common';
import { LoggerService } from '../services/logger/logger.service';
import { PLAN_NAME, URL_understanding_default_roles } from './../utils/util';
import { BrandService } from 'app/services/brand.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

const Swal = require('sweetalert2')

import { DashboardToastrService } from './dashboard-toastr.service';

/** Gate per /roles: permesso lettura ruoli (stream), piano Custom, customization.roles (tab Ruoli nascosta se pay off). */
export interface CustomRolesNavigationContext {
  projectId: string;
  /** Custom: true se può vedere i ruoli (es. ROLES_READ). Owner/admin: come valorizzato dal caller. */
  hasPermission: boolean;
  profileName: string;
  customization: any;
  userRole: string;
  prjct_profile_type: string;
  subscription_is_active: boolean;
  subscription_end_date?: any;
}

/// Notify users about errors and other helpful stuff
export interface Msg {
  content: string;
  style: string;
}

@Injectable()
export class NotifyService {
  PLAN_NAME = PLAN_NAME
  displayExpiredSessionModal: string

  private _msgSource = new Subject<Msg | null>();

  msg = this._msgSource.asObservable();
  route: string;
  displayCheckLIstModal: string;

  displayModalSubsExpired: string;
  displayModalEnterpiseSubsExpired: string;
  displayModalTrialExpired = 'none';

  displayContactUsModal = 'none';
  displayContactOwnerModal = 'none';

  goToPricingModal = 'none';

  viewCancelSubscriptionModal = 'none';
  displayDataExportNotAvailable = 'none';
  displayInstallTiledeskModal = 'none';

  displaySuccessCheckModal = 'none';
  successCheckModalTitleText: string;
  successCheckModalBodyText: string;

  _prjctPlanSubsEndDate: Date;
  _prjctPlanName: string;

  public hasOpenChecklistModal: Subject<boolean> = new BehaviorSubject<boolean>(null);
  public bs_hasClickedChat: Subject<boolean> = new BehaviorSubject<boolean>(null);
  public isOpenedExpiredSessionModal: Subject<boolean> = new BehaviorSubject<boolean>(null);

  public cancelSubscriptionCompleted$ = new Subject();

  showSubtitleAllOperatorsSeatsUsed: boolean;
  showSubtitleSeatsNumberExceed: boolean;
  showSubtitleAllChatbotUsed: boolean;
  displayLogoutModal = 'none';
  prjct_profile_name: string;
  salesEmail: string;
  public hideHelpLink: boolean;

  public URL_UNDERSTANDING_DEFAULT_ROLES = URL_understanding_default_roles
  public displayContactUsModalToUpgradePlan = 'none';

  yourTrialHasEnded: string
  upgradeNowToKeepOurAmazingFeatures: string
  constructor(
    public location: Location,
    public brandService: BrandService,
    private logger: LoggerService,
    private router: Router,
    private translate: TranslateService,
    private dashboardToastr: DashboardToastrService,
    // private projectService: ProjectService,
  ) {
    const brand = brandService.getBrand();
    this.salesEmail = brand['CONTACT_SALES_EMAIL'];
    this.logger.log('[NOTIFY-SERVICE] salesEmail ', this.salesEmail)
    this.hideHelpLink = brand['DOCS'];

  }



  // Not Used
  presentContactUsModalToUpgradePlan(displayModal: boolean) {
    if (displayModal === true) {
      this.displayContactUsModalToUpgradePlan = 'block';
    }
  }

  contacUsViaEmail() {
    this.closeContactUsModalToUpgradePlan();
    this.closeModalSubsExpired()
    this.closeContactUsModal();
    window.open(`mailto:${this.salesEmail}?subject=Upgrade plan`);
  }

  contacUsViaEmailPlanC() {
    window.open(`mailto:${this.salesEmail}?subject=Upgrade plan (${this.prjct_profile_name} expired)`);
    this.closeModalEnterpiseSubsExpired()
  }

  closeContactUsModalToUpgradePlan() {
    this.displayContactUsModalToUpgradePlan = 'none';
    this.displayContactUsModal = 'none'
  }


  displaySubscripionHasExpiredModal(subHasExpired: boolean, prjctPlanName: string, prjctPlanSubsEndDate: Date) {
    if (subHasExpired === true) {
      this._prjctPlanSubsEndDate = prjctPlanSubsEndDate;
      this._prjctPlanName = prjctPlanName;
      Swal.fire({
        title: this.translate.instant("Pricing.SubscriptionPaymentProblem"),
        text: this.translate.instant('Pricing.WeWereUnableToAutomaticallyRenewYourSubscription') + '. ' + this.translate.instant("Pricing.PleaseContactUs") + ' ' + this.translate.instant("Pricing.ToUpdateYourPaymentInformation") + '.',
        icon: "warning",
        showCloseButton: true,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('ContactUs'),
        // confirmButtonColor: "var(--blue-light)",
        focusConfirm: false,
        // reverseButtons: true,
        // cancelButtonColor: "var(--red-color)",


      }).then((result) => {
        if (result.isConfirmed) {
          this.logger.log('[NOTIFY-SERVICE] displaySubscripionHasExpiredModal result.isConfirmed', result.isConfirmed)
          window.open(`mailto:${this.salesEmail}?subject=Upgrade plan`);
        }

      });


      // this.displayModalSubsExpired = 'block';
    }

    this.logger.log('[NOTIFY-SERVICE] - HasExpiredModal subHasExpired ', subHasExpired);
    this.logger.log('[NOTIFY-SERVICE] - HasExpiredModal prjctPlanName ', prjctPlanName);
    this.logger.log('[NOTIFY-SERVICE] - HasExpiredModal prjctPlanSubsEndDate ', prjctPlanSubsEndDate);


  }

  presentDialogNoPermissionToPermomfAction(CHAT_PANEL_MODE?: boolean) {
    this.logger.log('[NOTIFY-SERVICE] - DIALOG NO PERMISSION TO PERFORM ACTION CHAT_PANEL_MODE', CHAT_PANEL_MODE);

    Swal.fire({
      icon: 'warning',
      title: this.translate.instant('PermissionDenied'),
      text: this.translate.instant('YonDontHavePermissionsToPerformThisAction'),
      confirmButtonText: this.translate.instant('Ok'),
      confirmButtonColor: "var(--blue-light)",
      focusConfirm: true,
      customClass: CHAT_PANEL_MODE === true ? "swal-size-sm" : "",
    });
  }


  presentDialogNoPermissionToEditFlow(CHAT_PANEL_MODE?: boolean) {
    this.logger.log('[NOTIFY-SERVICE] - DIALOG NO PERMISSION TO EDIT FLOWS CHAT_PANEL_MODE', CHAT_PANEL_MODE);

    Swal.fire({
      icon: 'warning',
      title: this.translate.instant('PermissionDenied'),
      text: this.translate.instant('YouDoNotHavePermissionToEditFlows'),
      confirmButtonText: this.translate.instant('Ok'),
      confirmButtonColor: "var(--blue-light)",
      focusConfirm: true,
      customClass: CHAT_PANEL_MODE === true ? "swal-size-sm" : "",
    });
  }

  presentDialogNoPermissionToViewReports(CHAT_PANEL_MODE?: boolean) {
    this.logger.log('[NOTIFY-SERVICE] - DIALOG NO PERMISSION TO VIEW REPORTS CHAT_PANEL_MODE', CHAT_PANEL_MODE);

    Swal.fire({
      icon: 'warning',
      title: this.translate.instant('PermissionDenied'),
      text: this.translate.instant('YonDontHavePermissionsToViewReports'),
      confirmButtonText: this.translate.instant('Ok'),
      confirmButtonColor: "var(--blue-light)",
      focusConfirm: true,
      customClass: CHAT_PANEL_MODE === true ? "swal-size-sm" : "",
    });
  }


   presentDialogNoPermissionToViewThisSection(CHAT_PANEL_MODE?: boolean) {
    this.logger.log('[NOTIFY-SERVICE] - DIALOG NO PERMISSION TO PERFORM ACTION CHAT_PANEL_MODE', CHAT_PANEL_MODE);

    Swal.fire({
      icon: 'warning',
      title: this.translate.instant('PermissionDenied'),
      text: this.translate.instant('YonDontHavePermissionsToViewThisSection'),
      confirmButtonText: this.translate.instant('Ok'),
      confirmButtonColor: "var(--blue-light)",
      focusConfirm: true,
      customClass: CHAT_PANEL_MODE === true ? "swal-size-sm" : "",
    });
  }


  // "{{'YourTrialHasEnded' | translate }}"
  // "{{'UpgradeNowToKeepOurAmazingFeatures' | translate}}"
  displayTrialHasExpiredModal(projectId, yourTrialHasEnded, upgradeNowToKeepOurAmazingFeatures, upgrade) {
    this.logger.log('displayTrialHasExpiredModal yourTrialHasEnded', yourTrialHasEnded, 'upgradeNowToKeepOurAmazingFeatures ', upgradeNowToKeepOurAmazingFeatures)
    Swal.fire({
      title: yourTrialHasEnded, // "Your 14-days free trial has expired",
      text: upgradeNowToKeepOurAmazingFeatures, //"Upgrade now to keep our amazing features",
      icon: "warning",
      showCloseButton: true,
      showCancelButton: false,
      confirmButtonText: upgrade,
      // confirmButtonColor: "var(--blue-light)",
      // cancelButtonColor: "var(--red-color)",
      focusConfirm: false,
      // reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['project/' + projectId + '/pricing']);
      }

    });
  }

  closeModalTrialExpired() {
    this.displayModalTrialExpired = 'none';
  }

  displayEnterprisePlanHasExpiredModal(subHasExpired: boolean, prjctPlanName: string, prjctPlanSubsEndDate: Date) {

    if (subHasExpired === true) {
      // this.displayModalEnterpiseSubsExpired = 'block';

      this.prjct_profile_name = prjctPlanName // + ' plan'
      Swal.fire({
        title: this.prjct_profile_name + ' ' + this.translate.instant('Pricing.HasExpired'),
        text: this.translate.instant('Pricing.PleaseContactUs') + ' ' + this.translate.instant("Pricing.ToUpdateYourPaymentInformation"),
        icon: "warning",
        showCloseButton: true,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('ContactUs'),
        // confirmButtonColor: "var(--blue-light)",
        focusConfirm: false,
        // reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          this.logger.log('[NOTIFY-SERVICE] displayModalEnterpiseSubsExpired result.isConfirmed', result.isConfirmed)
          window.open(`mailto:${this.salesEmail}?subject=Upgrade plan (${this.prjct_profile_name} expired)`);
        }

      });

    }
    this.logger.log('[NOTIFY-SERVICE] - HasExpiredEnterpriseModal prjctPlanName ', prjctPlanName);
  }

  closeModalEnterpiseSubsExpired() {
    this.displayModalEnterpiseSubsExpired = 'none';
  }

  closeModalSubsExpired() {
    this.displayModalSubsExpired = 'none';
  }

  closeThisModalAndDisplayCancelSubscriptionModal() {
    this.logger.log('[NOTIFY-SERVICE] - closeThisModalAndDisplayCancelSubscriptionModal');
    this.displayModalEnterpiseSubsExpired = 'none';
    this.displayModalSubsExpired = 'none';
    this.viewCancelSubscriptionModal = 'block';
  }

  // "CONTACT US - LET'S CHAT" MODAL
  _displayContactUsModal(displayModal: boolean, reason: string) {
    this.logger.log('[NOTIFY-SERVICE] - _displayContactUsModal reason ', reason);
    if (reason === 'seats_limit_reached') {
      this.showSubtitleAllOperatorsSeatsUsed = true;
      this.showSubtitleSeatsNumberExceed = false;
    } else if (reason === 'seats_limit_exceed') {
      this.showSubtitleSeatsNumberExceed = true;
      this.showSubtitleAllOperatorsSeatsUsed = false;
    } else {
      this.showSubtitleAllOperatorsSeatsUsed = false;
      this.showSubtitleSeatsNumberExceed = false;
    }
    let contentText = ""
    if (reason === 'upgrade_plan') {
      contentText = this.translate.instant('Pricing.ContactUsViaEmailToUpgradeYourPricingPlan')
    }
    else if (reason === 'seats_limit_exceed') {
      contentText = this.translate.instant("Pricing.TheSeatsNumberExceedsTheAllowed") + '. ' + this.translate.instant('Pricing.ContactUsViaEmailToUpgradeYourPricingPlan')
    }
    else if (reason === 'seats_limit_reached') {
      contentText = this.translate.instant("Pricing.YouCurrentlyAreUsingAllActiveOperatorSeats") + '. ' + this.translate.instant('Pricing.ContactUsViaEmailToUpgradeYourPricingPlan')
    }

    Swal.fire({
      title: this.translate.instant('Pricing.PlanChange'),
      text: contentText,
      // html: `contentText`,
      icon: "warning",
      showCloseButton: true,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('ContactUs'),
      // confirmButtonColor: "var(--blue-light)",
      focusConfirm: false,
      // reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        window.open(`mailto:${this.salesEmail}?subject=Upgrade plan`);
      }
    });

    // if (displayModal === true) {
    //   this.displayContactUsModal = 'block';
    // }
  }

  closeContactUsModal() {
    this.displayContactUsModal = 'none';
  }

  _displayContactOwnerModal(displayModal: boolean, reason: string) {
    const el = document.createElement('div')
    this.logger.log('[NOTIFY-SERVICE] - _displayContactOwnerModal reason ', reason);
    if (reason === 'seats_limit_reached') {
      // this.showSubtitleAllOperatorsSeatsUsed = true;
      // this.showSubtitleSeatsNumberExceed = false;
      el.innerHTML = this.translate.instant("Pricing.YouCurrentlyAreUsingAllActiveOperatorSeats") + '. ' + this.translate.instant("Pricing.OnlyOwnerCanManageSeatsNumber") + '. ' + '<br>' + this.translate.instant("Pricing.ContactTheProjectOwner") + '.'
    } else if (reason === 'seats_limit_exceed') {
      // this.showSubtitleSeatsNumberExceed = true;
      // this.showSubtitleAllOperatorsSeatsUsed = false;
      el.innerHTML = this.translate.instant("Pricing.TheSeatsNumberExceedsTheAllowed") + '. ' + this.translate.instant("Pricing.OnlyOwnerCanManageSeatsNumber") + '. ' + '<br>' + this.translate.instant("Pricing.ContactTheProjectOwner") + '.'
    } else if (reason === 'upgrade_plan') {
      // this.showSubtitleAllOperatorsSeatsUsed = false;
      // this.showSubtitleSeatsNumberExceed = false;

      el.innerHTML = this.translate.instant("Pricing.OnlyOwnerCanManageSeatsNumber") + '. ' + '<br>' + this.translate.instant("Pricing.ContactTheProjectOwner") + '.'
    }

    Swal.fire({
      // title: yourTrialHasEnded, // "Your 14-days free trial has expired",
      // text: upgradeNowToKeepOurAmazingFeatures, //"Upgrade now to keep our amazing features",
      // content: el,
      title: this.translate.instant("Pricing.PlanChange"),
      html: el,
      icon: "warning",
      showCloseButton: true,
      showCancelButton: false,
      confirmButtonText: "OK",
      // confirmButtonColor: "var(--blue-light)",
      focusConfirm: false,
      // reverseButtons: true,
    })



    if (displayModal === true) {
      // this.displayContactOwnerModal = 'block';
    }
  }


  closeContactOwnerModal() {
    this.displayContactOwnerModal = 'none';
  }


  presentModalAttachmentFileSizeTooLarge(fileSize) {
    Swal.fire({
      title: this.translate.instant('Warning'),
      text: this.translate.instant('FileTooLarge', { file_size: fileSize }),
      icon: "warning",
      showCloseButton: false,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('Ok')
    })
  }

  presenModalAttachmentFileTypeNotSupported() {
    Swal.fire({
      title: this.translate.instant('Warning'),
      text: this.translate.instant('SorryFileTypeNotSupported'),
      icon: "warning",
      showCloseButton: false,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('Ok')
    })
  }





  displayGoToPricingModal(reason) {
    this.goToPricingModal = 'block';
    if (reason === 'user_exceeds') {
      this.showSubtitleAllOperatorsSeatsUsed = true;
      this.showSubtitleAllChatbotUsed = false;
    } else if (reason === 'chatbot_exceeds') {
      this.showSubtitleAllOperatorsSeatsUsed = false;
      this.showSubtitleAllChatbotUsed = true;
    }
  }

  closeGoToPricingModal() {
    this.goToPricingModal = 'none';
  }




  // -----------------------------------------------
  // Data Export Not Available Modal
  // -----------------------------------------------
  openDataExportNotAvailable() {
    this.displayDataExportNotAvailable = 'block';
  }

  closeDataExportNotAvailable() {
    this.displayDataExportNotAvailable = 'none';
  }

  // -----------------------------------------------
  // Install Tiledesk Modal
  // -----------------------------------------------
  presentModalInstallTiledeskModal() {
    this.displayInstallTiledeskModal = 'block';
  }

  closeModalInstallTiledeskModal() {
    this.displayInstallTiledeskModal = 'none';
  }

  // -----------------------------------------------
  // Success Check Modal
  // -----------------------------------------------
  presentModalSuccessCheckModal(titletext: string, bodytext: string) {
    this.successCheckModalTitleText = titletext;
    this.successCheckModalBodyText = bodytext;
    this.displaySuccessCheckModal = 'block';
  }

  closeModalSuccessCheckModal() {
    this.displaySuccessCheckModal = 'none';
  }


  // -----------------------------------------------
  // Cancel Subscription Modal
  // -----------------------------------------------
  displayCancelSubscriptionModal(displayModal: boolean) {
    if (displayModal === true) {
      this.viewCancelSubscriptionModal = 'block';
    }
  }

  closeCancelSubscriptionModal() {
    this.viewCancelSubscriptionModal = 'none';
  }

  // CALLED FROM NotificationMessageComponent
  cancelSubscriptionCompleted(hasDone: boolean) {
    this.viewCancelSubscriptionModal = 'none';
    this.cancelSubscriptionCompleted$.next(hasDone);
  }


  update(content: string, style: 'error' | 'info' | 'success') {
    const msg: Msg = { content, style };
    this._msgSource.next(msg);
  }

  clear() {
    this._msgSource.next(null);
  }

  showExiperdSessionPopup(user_is_signed_in: boolean) {
    if (user_is_signed_in === false) {
      this.displayExpiredSessionModal = 'block'

      this.isOpenedExpiredSessionModal.next(true);
    }
  }

  onCloseExpiredSessionModal() {
    this.displayExpiredSessionModal = 'none'
  }

  onOkExpiredSessionModal() {
    this.displayExpiredSessionModal = 'none'
  }

  showCheckListModal(_displayCecklistModal: boolean) {
    this.logger.log('[NOTIFY-SERVICE] - displayCecklistModal ', _displayCecklistModal)
    if (_displayCecklistModal === true) {
      this.displayCheckLIstModal = 'block'
      this.hasOpenChecklistModal.next(true);
    }
  }

  onCloseCheckLIstModal() {
    this.displayCheckLIstModal = 'none'
  }

  // is CALLED FROM SIDEBAR, IN THE CHECLIST MODAL (NOTIFICATION-MESSAGE) AND HOME WHEN THE USER CLICK ON THE CHAT BTN
  publishHasClickedChat(hasClickedChat: boolean) {
    this.logger.log('[NOTIFY-SERVICE] - hasClickedChat ', hasClickedChat);
    this.bs_hasClickedChat.next(true);
  }


  showForegroungPushNotification(
    sender: string,
    msg: string,
    link: string,
    requester_avatar_initial?: string,
    requester_avatar_bckgrnd?: string
  ) {
    this.dashboardToastr.showForegroungPushNotification(
      sender,
      msg,
      link,
      requester_avatar_initial,
      requester_avatar_bckgrnd
    );
  }

  showUnservedNotication(sender: string, msg: string, link: string) {
    this.dashboardToastr.showUnservedNotication(sender, msg, link);
  }

  showWidgetStyleUpdateNotification(message: string, notificationColor: number, icon: string) {
    this.dashboardToastr.showWidgetStyleUpdateNotification(message, notificationColor, icon);
  }

  showNotificationChangeProject(message: string, notificationColor: number, icon: string) {
    this.dashboardToastr.showNotificationChangeProject(message, notificationColor, icon);
  }



  showToast(message: string, notificationColor: number, icon: string) {
    this.dashboardToastr.showToast(message, notificationColor, icon);
  }

  showResendingVerifyEmailNotification(user_email: string) {
    this.dashboardToastr.showResendingVerifyEmailNotification(user_email);
  }

  showArchivingRequestNotification(msg: string) {
    this.dashboardToastr.showArchivingRequestNotification(msg);
  }

  showArchivingRequestProgress(messagePrefix: string, completed: number, total: number): void {
    this.dashboardToastr.showArchivingRequestProgress(messagePrefix, completed, total);
  }

  showAllRequestHaveBeenArchivedNotification(msg_part1: string) {
    this.dashboardToastr.showAllRequestHaveBeenArchivedNotification(msg_part1);
  }

  showRequestIsArchivedNotification(msg_part1: string) {
    this.dashboardToastr.showRequestIsArchivedNotification(msg_part1);
  }

  // usesed in ws-requests-msgs.component when the tennates adds notes  
  operationinprogress(msg: string) {
    this.dashboardToastr.operationinprogress(msg);
  }

  operationcompleted(msg: string) {
    this.dashboardToastr.operationcompleted(msg);
  }

  // No more used - called by sidebar user details
  presentLogoutModal() {
    this.displayLogoutModal = 'block';
  }

  closeLogoutModal() {
    this.displayLogoutModal = 'none';
  }



  presentModalOnlyOwnerCanManageTheAccountPlan(
    onlyOwnerCanManageTheAccountPlanMsg: string,
    learnMoreAboutDefaultRoles: string,
    modalTitle?: string
  ) {
    // console.log('NOTIFY SERVICE presentModalOnlyOwnerCanManageTheAccountPlan hideHelpLink', this.hideHelpLink)
    const el = document.createElement('div')
    if (this.hideHelpLink) {
      el.innerHTML = onlyOwnerCanManageTheAccountPlanMsg + '. ' + `<a  href=${this.URL_UNDERSTANDING_DEFAULT_ROLES} target='_blank'>` + learnMoreAboutDefaultRoles + "</a>"
    } else {
      el.innerHTML = onlyOwnerCanManageTheAccountPlanMsg + '. '
    }
   
    Swal.fire({
      ...(modalTitle ? { title: modalTitle } : {}),
      // content: el,
      html: el,
      icon: "warning",
      showCloseButton: true,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('Ok'),
      focusConfirm: false,
    })

  }

  presentModalAgentCannotManageChatbot(agentsCannotManageChatbots: string, learnMoreAboutDefaultRoles: string) {

    const el = document.createElement('div')
    if (this.hideHelpLink) {
      el.innerHTML = agentsCannotManageChatbots + '. ' + `<a href=${this.URL_UNDERSTANDING_DEFAULT_ROLES} target='_blank'>` + learnMoreAboutDefaultRoles + "</a>"
    } else {
      el.innerHTML = agentsCannotManageChatbots + '. '
    }
    Swal.fire({

      html: el,
      icon: "warning",
      showCloseButton: true,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('Ok'),

      focusConfirm: false,
    })

  }

  presentModalOnlyOwnerCanManageTSMTPsettings(onlyOwnerCanManageSMTPSettings: string, learnMoreAboutDefaultRoles: string) {
    const el = document.createElement('div')
    if (this.hideHelpLink) {
      el.innerHTML = onlyOwnerCanManageSMTPSettings + '. ' + `<a href=${this.URL_UNDERSTANDING_DEFAULT_ROLES} target='_blank'>` + learnMoreAboutDefaultRoles + "</a>"
    } else {
      el.innerHTML = onlyOwnerCanManageSMTPSettings + '. '
    }
    Swal.fire({
      html: el,
      icon: "warning",
      showCloseButton: true,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('Ok'),

      focusConfirm: false,
    })
  }

  presentModalOnlyOwnerCanManageAdvancedProjectSettings(onlyOwnerCanAdvencedProjectSettings: string, learnMoreAboutDefaultRoles: string) {
    const el = document.createElement('div')
    if (this.hideHelpLink) {
      el.innerHTML = onlyOwnerCanAdvencedProjectSettings + '. ' + `<a href=${this.URL_UNDERSTANDING_DEFAULT_ROLES} target='_blank'>` + learnMoreAboutDefaultRoles + "</a>"
    } else {
      el.innerHTML = onlyOwnerCanAdvencedProjectSettings + '. '
    }
    Swal.fire({
      // title: this.onlyOwnerCanManageTheAccountPlanMsg,
      html: el,
      icon: "warning",
      showCancelButton: false,
      confirmButtonText: this.translate.instant('Ok'),

      focusConfirm: true,

    })
  }

  /**
   * Custom Roles: accesso (owner / admin / custom con permesso lettura) → piano Custom → customization.roles → /roles.
   * Upgrade del piano dopo lo Swal: solo owner (canProceedWithCustomPlanUpgrade).
   */
  navigateToCustomRolesSectionOrExplain(p: CustomRolesNavigationContext): void {
    const isOwner = p.userRole === 'owner';
    const isAdmin = p.userRole === 'admin';
    const isCustomRole = !isOwner && !isAdmin && p.userRole !== 'agent';

    const hasAccess =
      isOwner ||
      isAdmin ||
      (isCustomRole && p.hasPermission === true);

    if (!hasAccess) {
      this.presentDialogNoPermissionToViewThisSection();
      return;
    }

    if (!this.isCustomPlanProfileName(p.profileName)) {
      this.presentModalRolesRequiresCustomPlan(p);
      return;
    }

    if (p.prjct_profile_type === 'payment' && p.subscription_is_active === false) {
      if (isCustomRole) {
        this.presentModalCustomPlanExpiredForCustomTeammate();
      } else if (!isOwner) {
        // Admin (e altri non-owner): piano Custom scaduto → titolo scadenza + solo owner può gestire il piano
        this.presentModalOnlyOwnerCanManageTheAccountPlan(
          this.translate.instant('OnlyUsersWithTheOwnerRoleCanManageTheAccountPlan'),
          this.translate.instant('LearnMoreAboutDefaultRoles'),
          this.translate.instant('UsersPage.CustomPlanExpiredTitle')
        );
      } else {
        this.displayEnterprisePlanHasExpiredModal(true, this.PLAN_NAME.F + ' plan', p.subscription_end_date);
      }
      return;
    }

    if (!this.isCustomizationRolesEnabled(p.customization)) {
      this.presentContactUsToEnableCustomRolesFeature(p);
      return;
    }

    this.router.navigate(['project/' + p.projectId + '/roles']);
  }

  /** Teammate con ruolo custom: piano Custom scaduto → messaggio informativo, solo OK (niente mail Contattaci). */
  private presentModalCustomPlanExpiredForCustomTeammate(): void {
    Swal.fire({
      title: this.translate.instant('UsersPage.CustomPlanExpiredTitle'),
      text: this.translate.instant('UsersPage.CustomPlanExpiredMessage'),
      icon: 'warning',
      showCloseButton: false,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('Ok'),
      focusConfirm: true,
    });
  }

  /** profile_name from API may be PLAN_NAME.F ('Custom') or occasional variants */
  private isCustomPlanProfileName(profileName: string | undefined | null): boolean {
    if (profileName == null || profileName === '') {
      return false;
    }
    if (profileName === this.PLAN_NAME.F) {
      return true;
    }
    return String(profileName).trim().toLowerCase() === 'custom';
  }

  /** Piano Custom con flag customization.roles esplicito (true / 'true'). Assenza oggetto, chiave roles o valore falso → contattaci. */
  private isCustomizationRolesEnabled(customization: any): boolean {
    if (!customization || typeof customization !== 'object') {
      return false;
    }
    const v = customization['roles'];
    return v === true || v === 'true';
  }

  /** Solo l'owner può confermare upgrade piano (contact / pricing su free). */
  private canProceedWithCustomPlanUpgrade(p: CustomRolesNavigationContext): boolean {
    return p.userRole === 'owner';
  }

  /** Piano non Custom → Aggiorna piano; dopo conferma solo chi può gestire account/upgrade. */
  private presentModalRolesRequiresCustomPlan(p: CustomRolesNavigationContext): void {
    const title = this.translate.instant('Integration.UpgradePlan');
    const text = this.translate.instant('AvailableWithThePlan', { plan_name: this.PLAN_NAME.F });
    const upgradeLbl = this.translate.instant('Upgrade');
    const cancelLbl = this.translate.instant('Cancel');
    Swal.fire({
      title,
      text,
      icon: 'info',
      showCloseButton: false,
      showCancelButton: true,
      confirmButtonText: upgradeLbl,
      cancelButtonText: cancelLbl,
      focusConfirm: true,
      reverseButtons: true,
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }
      if (p.prjct_profile_type === 'free') {
        if (p.userRole === 'owner') {
          this.router.navigate(['project/' + p.projectId + '/pricing']);
        } else {
          this.presentFreePlanCustomRolesOwnerOnlyInfoForNonOwner();
        }
        return;
      }
      if (!this.canProceedWithCustomPlanUpgrade(p)) {
        this.presentModalOnlyOwnerCanManageTheAccountPlan(
          this.translate.instant('OnlyUsersWithTheOwnerRoleCanManageTheAccountPlan'),
          this.translate.instant('LearnMoreAboutDefaultRoles')
        );
        return;
      }
      if (p.prjct_profile_type === 'payment' && p.subscription_is_active === true) {
        if (
          p.profileName === this.PLAN_NAME.A ||
          p.profileName === this.PLAN_NAME.B ||
          p.profileName === this.PLAN_NAME.C ||
          p.profileName === this.PLAN_NAME.D ||
          p.profileName === this.PLAN_NAME.E ||
          p.profileName === this.PLAN_NAME.EE
        ) {
          this._displayContactUsModal(true, 'upgrade_plan');
        }
      } else if (p.prjct_profile_type === 'payment' && p.subscription_is_active === false) {
        // Solo piano Custom scaduto → "Subscription payment problem". Altri piani scaduti → contact upgrade (anche owner).
        if (this.isCustomPlanProfileName(p.profileName)) {
          this.displaySubscripionHasExpiredModal(true, p.profileName, p.subscription_end_date);
        } else {
          this._displayContactUsModal(true, 'upgrade_plan');
        }
      }
    });
  }

  /**
   * Piano free, non-owner: dopo il primo Swal, spiega che solo il proprietario può aggiornare il piano (nessun redirect a pricing).
   */
  private presentFreePlanCustomRolesOwnerOnlyInfoForNonOwner(): void {
    const ownerPlanMsg = this.translate.instant('OnlyUsersWithTheOwnerRoleCanManageTheAccountPlan');
    Swal.fire({
      title: this.translate.instant('Pricing.PlanChange'),
      text: ownerPlanMsg,
      icon: 'info',
      showCloseButton: false,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('Close'),
      focusConfirm: true,
    });
  }

  private presentContactUsToEnableCustomRolesFeature(p: CustomRolesNavigationContext): void {
    const isOwner = p.userRole === 'owner';
    const isAdmin = p.userRole === 'admin';
    const isCustomRole = !isOwner && !isAdmin && p.userRole !== 'agent';

    if (isCustomRole) {
      Swal.fire({
        title: this.translate.instant('EnableCustomRoles'),
        text: this.translate.instant('UsersPage.ContactProjectOwnerOrAdministratorsToEnableRoles'),
        icon: 'warning',
        showCloseButton: false,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('Ok'),
        focusConfirm: true,
      });
      return;
    }

    const text = this.translate.instant('ContactUsToEnableCustomRoleManagement');
    Swal.fire({
      title: this.translate.instant('EnableCustomRoles'),
      text,
      icon: 'warning',
      showCloseButton: true,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('ContactUs'),
      focusConfirm: false,
    }).then((result) => {
      if (result.isConfirmed) {
        const subj = encodeURIComponent(`Enable custom roles (project ${p.projectId})`);
        window.open(`mailto:${this.salesEmail}?subject=${subj}`);
      }
    });
  }

}
