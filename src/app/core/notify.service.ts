import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Location } from '@angular/common';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { LoggerService } from '../services/logger/logger.service';
declare var $: any;
/// Notify users about errors and other helpful stuff
export interface Msg {
  content: string;
  style: string;
}

@Injectable()
export class NotifyService {

  displayExpiredSessionModal: string

  private _msgSource = new Subject<Msg | null>();

  msg = this._msgSource.asObservable();

  route: string;
  notify: any;
  notifySendingVerifyEmail: any;

  notifyArchivingRequest: any;
  displayCheckLIstModal: string;

  displayModalSubsExpired: string;
  displayModalEnterpiseSubsExpired : string;
  displayContactUsModal = 'none';
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

  constructor(
    public location: Location,
    private logger: LoggerService
  ) {   }

  displaySubscripionHasExpiredModal(subHasExpired: boolean, prjctPlanName: string, prjctPlanSubsEndDate: Date) {
    if (subHasExpired === true) {
      this.displayModalSubsExpired = 'block';
    }

    this.logger.log('[NOTIFY-SERVICE] - HasExpiredModal subHasExpired ', subHasExpired);
    this.logger.log('[NOTIFY-SERVICE] - HasExpiredModal prjctPlanName ', prjctPlanName);
    this.logger.log('[NOTIFY-SERVICE] - HasExpiredModal prjctPlanSubsEndDate ', prjctPlanSubsEndDate);
    this._prjctPlanSubsEndDate = prjctPlanSubsEndDate;
    this._prjctPlanName = prjctPlanName;
  }


  displayEnterprisePlanHasExpiredModal(subHasExpired: boolean, prjctPlanName: string, prjctPlanSubsEndDate: Date) { 
    if (subHasExpired === true) {
      this.displayModalEnterpiseSubsExpired = 'block';
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
  _displayContactUsModal(displayModal: boolean, areAvailableOperatorsSeats: string) {
    this.logger.log('[NOTIFY-SERVICE] - _displayContactUsModal areAvailableOperatorsSeats ', areAvailableOperatorsSeats);
    if (areAvailableOperatorsSeats === 'operators_seats_unavailable') {
      this.showSubtitleAllOperatorsSeatsUsed = true;
    } else {
      this.showSubtitleAllOperatorsSeatsUsed = false;
    }

    if (displayModal === true) {
      this.displayContactUsModal = 'block';
    }
  }

  closeContactUsModal() {
    this.displayContactUsModal = 'none';
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



  // showNotification(from, align) {
  showNotification(message, notificationColor, icon) {
    const type = ['', 'info', 'success', 'warning', 'danger'];
    // const color = Math.floor((Math.random() * 4) + 1);
    const color = notificationColor

    this.notify = $.notify({
      // icon: 'glyphicon glyphicon-warning-sign',
      // message: message

    }, {
      type: type[color],
      // timer: 55000,
      // delay: 0,
      placement: {
        from: 'top',
        align: 'right'
      },
      template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" style="text-align: left;" role="alert">' +
        '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
        // '<span data-notify="title" style="max-width: 100%; font-size:1.1em; ">TileDesk</span> ' +
        // tslint:disable-next-line:max-line-length
        '<span data-notify="icon" style="display: inline;"><i style="vertical-align: middle; padding-right: 5px;" class="material-icons">' + icon + '</i> </span> ' +
        '<span data-notify="message" style="display: inline; vertical-align: middle ">' + message + '</span>' +
        '</div>'
    });
  }

  showWidgetStyleUpdateNotification(message, notificationColor, icon) {
    const type = ['', 'info', 'success', 'warning', 'danger'];
    // const color = Math.floor((Math.random() * 4) + 1);
    const color = notificationColor

    let icon_bckgrnd_color = ''
    if (notificationColor === 4) {
      icon_bckgrnd_color = '#d2291c'
    } else if (notificationColor === 2) {
      icon_bckgrnd_color = '#449d48'
    }
    this.notify = $.notify({
      // icon: 'glyphicon glyphicon-warning-sign',
      // message: message

    }, {
      type: type[color],
      // timer: 1500,
      delay: 1500,

      placement: {
        from: 'top',
        align: 'right'
      },
      // animate: {
      //   enter: 'animated zoomIn',
      //   exit: 'animated zoomOut'
      // },
      // tslint:disable-next-line:max-line-length
      template: '<div data-notify="container" class="col-xs-11 col-sm-3  alert alert-{0}" style="text-align: left; padding-top: 8px;padding-bottom: 8px;" role="alert">' +
        '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
        // '<span data-notify="title" style="max-width: 100%; font-size:1.1em; ">TileDesk</span> ' +
        // tslint:disable-next-line:max-line-length
        `<span data-notify="icon" style="display: inline;"><i style="vertical-align: middle; padding: 3px;background-color: ${icon_bckgrnd_color}; border-radius: 50%; font-size:16px " class="material-icons">` + icon + '</i> </span> ' +
        '<span data-notify="message" style="display: inline; vertical-align: middle; padding-left:8px">' + message + '</span>' +
        '</div>'
    });
  }

  showNotificationChangeProject(message, notificationColor, icon) {
    const type = ['', 'info', 'success', 'warning', 'danger'];
    // const color = Math.floor((Math.random() * 4) + 1);
    const color = notificationColor

    this.notify = $.notify({
      // icon: 'glyphicon glyphicon-warning-sign',
      // message: message

    }, {
      type: type[color],
      timer: 1500,
      // delay: 100,
      placement: {
        // from: 'bottom',
        // align: 'center'
        from: 'top',
        align: 'right'
      },
      // tslint:disable-next-line:max-line-length

      // col-xs-12 col-sm-8 <- used with from: 'bottom', align: 'center' (toast)
      template: '<div data-notify="container" class="col-xs-11 col-sm-3  alert alert-{0}" style="text-align: left; padding-top: 8px;padding-bottom: 8px; background-color: #131313; color:#a9afbb" role="alert">' +
        '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
        // '<span data-notify="title" style="max-width: 100%; font-size:1.1em; ">TileDesk</span> ' +
        // tslint:disable-next-line:max-line-length
        '<span data-notify="icon" style="display: inline;"><i style="vertical-align: middle; padding: 2px;border-radius: 50%; margin-right: 6px;background-color: #3c4858;color: #5bc0de;" class="material-icons">' + icon + '</i> </span> ' +
        '<span data-notify="message" style="display: inline; vertical-align: middle ">' + message + '</span>' +
        '</div>'
    });
  }



  showNotificationInstallWidget(message, notificationColor, icon) {
    const type = ['', 'info', 'success', 'warning', 'danger'];
    // const color = Math.floor((Math.random() * 4) + 1);
    const color = notificationColor

    this.notify = $.notify({
      // icon: 'glyphicon glyphicon-warning-sign',
      // message: message

    }, {
      type: type[color],
      timer: 55000,
      // delay: 100,
      placement: {
        from: 'bottom',
        align: 'center'
      },
      // tslint:disable-next-line:max-line-length
      template: '<div data-notify="container" class="col-xs-12 col-sm-8 alert alert-{0}" style="text-align: center; background-color: rgb(251, 188, 5); color:rgb(66, 77, 87);font-size: 15px;font-weight: 600;" role="alert">' +
        '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
        // '<span data-notify="title" style="max-width: 100%; font-size:1.1em; ">TileDesk</span> ' +
        // tslint:disable-next-line:max-line-length
        '<span data-notify="icon" style="display: inline;"><i style="vertical-align: middle; padding-right: 5px; color: #5bc0de;" class="material-icons">' + icon + '</i> </span> ' +
        '<span data-notify="message" style="display: inline; vertical-align: middle ">' + message + '</span>' +
        '</div>'
    });
  }


  showToast(message, notificationColor, icon) {
    const type = ['', 'info', 'success', 'warning', 'danger'];
    // const color = Math.floor((Math.random() * 4) + 1);
    const color = notificationColor

    this.notify = $.notify({
      // icon: 'glyphicon glyphicon-warning-sign',
      // message: message

    }, {
      type: type[color],
      timer: 1500,
      // delay: 100,
      placement: {
        from: 'bottom',
        align: 'center'
      },
      // tslint:disable-next-line:max-line-length
      template: '<div data-notify="container" class="col-xs-12 col-sm-8 alert alert-{0}" style="text-align: center; background-color:' + color + '; color:rgb(66, 77, 87);font-size: 15px;font-weight: 600;" role="alert">' +
        '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
        // '<span data-notify="title" style="max-width: 100%; font-size:1.1em; ">TileDesk</span> ' +
        // tslint:disable-next-line:max-line-length
        '<span data-notify="icon" style="display: inline;"><i style="vertical-align: middle; padding-right: 5px; color: #fff;" class="material-icons">' + icon + '</i> </span> ' +
        '<span data-notify="message" style="display: inline; vertical-align: middle; color:#fff ">' + message + '</span>' +
        '</div>'
    });
  }

  showResendingVerifyEmailNotification(user_email) {
    this.notifySendingVerifyEmail = $.notify('Sending verification link ...', {
      allow_dismiss: false,
      showProgressbar: false,
      // delay: 0
    });
    setTimeout(() => {
      // tslint:disable-next-line:max-line-length
      this.notifySendingVerifyEmail.update({ 'type': 'success', 'message': '<i class="material-icons" style="vertical-align: middle;"> done </i> <span style="vertical-align: middle; display: inline-block; padding-right:5px">Verification link has been sent to: </span>' + '<span style="padding-left:28px">' + user_email + '</span>' });
    }, 2000);
  }

  showArchivingRequestNotification(msg) {
    this.notifyArchivingRequest = $.notify(msg, {
      allow_dismiss: true,
      showProgressbar: false,
      // timer: 55000,
      template: '<div data-notify="container" style="padding:8px 15px " class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
        '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
        '<span data-notify="icon"></span> ' +
        '<span data-notify="title">{1}</span> ' +
        '<span data-notify="message">{2}</span>' +
        '<div class="progress" data-notify="progressbar">' +
        '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
        '</div>' +
        '<a href="{3}" target="{4}" data-notify="url"></a>' +
        '</div>'
    });
  }

  // showRequestIsArchivedNotification(msg_part1, request_id, msg_part2) {
  showRequestIsArchivedNotification(msg_part1) {
    // tslint:disable-next-line:max-line-length
    // this.notifyArchivingRequest.update({ 'type': 'success', 'message': '<i class="material-icons" style="vertical-align: middle;"> done </i> <span style="vertical-align: middle; display: inline-block; padding-right:5px">' + msg_part1 + request_id + msg_part2 + '</span> <span style="padding-left:28px">' + '</span>' })
    this.notifyArchivingRequest.update({
      'type': 'success', 'message':
        `<span data-notify="icon" style="display: inline;"><i style="vertical-align: middle; padding: 3px;background-color: #449d48; border-radius: 50%; font-size:16px " class="material-icons">` + 'done' + '</i> </span> ' +
        '<span data-notify="message" style="display: inline; vertical-align: middle; padding-left:8px">' + msg_part1 + '</span>'
    })
  }
 
  showAllRequestHaveBeenArchivedNotification(msg_part1) {
    // tslint:disable-next-line:max-line-length
    // this.notifyArchivingRequest.update({ 'type': 'success', 'message': '<i class="material-icons" style="vertical-align: middle;"> done </i> <span style="vertical-align: middle; display: inline-block; padding-right:5px">' + msg_part1 + request_id + msg_part2 + '</span> <span style="padding-left:28px">' + '</span>' })
    this.notifyArchivingRequest.update({
      'type': 'success', 'message':
        `<span data-notify="icon" style="display: inline;"><i style="vertical-align: middle; padding: 3px;background-color: #449d48; border-radius: 50%; font-size:16px " class="material-icons">` + 'done' + '</i> </span> ' +
        '<span data-notify="message" style="display: inline; vertical-align: middle; padding-left:8px">' + msg_part1 + '</span>'
    })
  }

  operationinprogress(msg) {
    this.notifyArchivingRequest = $.notify(msg, {
      allow_dismiss: true,
      showProgressbar: false,
      // timer: 55000,
    });
  }

  operationcompleted(msg) {
    // tslint:disable-next-line:max-line-length
    this.notifyArchivingRequest.update({
      'type': 'success',
      'message': '<i class="material-icons" style="vertical-align: middle;padding: 3px;background-color: #449d48; border-radius: 50%; font-size:16px"> done </i> <span style="vertical-align: middle; display: inline-block; padding-right:5px">' + msg + '</span> <span style="padding-left:28px">' + '</span>'
    })
  }



}
