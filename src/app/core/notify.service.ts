import { Injectable } from '@angular/core';

import { Subject } from 'rxjs/Subject';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


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
  _prjctPlanSubsEndDate: Date;
  _prjctPlanName: string;

  public hasOpenChecklistModal: Subject<boolean> = new BehaviorSubject<boolean>(null);
  public bs_hasClickedChat: Subject<boolean> = new BehaviorSubject<boolean>(null);
  public isOpenedExpiredSessionModal: Subject<boolean> = new BehaviorSubject<boolean>(null);


  constructor(
    private router: Router,
    public location: Location
  ) {

    // this.router.events.subscribe((val) => {
    //   if (this.location.path() !== '') {
    //     this.route = this.location.path();
    //     console.log('ROUTE DETECTED ', this.route);

    //     if ((this.route === '/login') || (this.route === '/signup')) {

    //       console.log('NOTIFY SERVICE - DETECTED ROUTE ', this.route)
    //     }
    //   }
    // })
  }

  displaySubscripionHasExpiredModal(subHasExpired: boolean, prjctPlanName: string, prjctPlanSubsEndDate: Date) {
    if (subHasExpired === true) {
      this.displayModalSubsExpired = 'block';
    }

    console.log('NotifyService - HasExpiredModal subHasExpired ', subHasExpired);
    console.log('NotifyService - HasExpiredModal prjctPlanName ', prjctPlanName);
    console.log('NotifyService - HasExpiredModal prjctPlanSubsEndDate ', prjctPlanSubsEndDate);
    this._prjctPlanSubsEndDate = prjctPlanSubsEndDate;
    this._prjctPlanName = prjctPlanName;
  }

  closeModalSubsExpired() {
    this.displayModalSubsExpired = 'none';
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
    console.log('NotifyService - displayCecklistModal ', _displayCecklistModal)
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
    console.log('NotifyService  - hasClickedChat ', hasClickedChat);
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
          '<span data-notify="icon" style="display: inline;"><i style="vertical-align: middle; padding: 3px;background-color: #449d48; border-radius: 50%; font-size:16px " class="material-icons">' + icon + '</i> </span> ' +
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
        // timer: 55000,
        // delay: 100,
        placement: {
          from: 'bottom',
          align: 'center'
        },
        // tslint:disable-next-line:max-line-length
        template: '<div data-notify="container" class="col-xs-12 col-sm-8 alert alert-{0}" style="text-align: center; background-color: #131313; color:#a9afbb" role="alert">' +
          '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
          // '<span data-notify="title" style="max-width: 100%; font-size:1.1em; ">TileDesk</span> ' +
          // tslint:disable-next-line:max-line-length
          '<span data-notify="icon" style="display: inline;"><i style="vertical-align: middle; padding-right: 5px; color: #5bc0de;" class="material-icons">' + icon + '</i> </span> ' +
          '<span data-notify="message" style="display: inline; vertical-align: middle ">' + message + '</span>' +
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
      allow_dismiss: false,
      showProgressbar: false,
    });

  }
  showRequestIsArchivedNotification(msg_part1, request_id, msg_part2) {
    // tslint:disable-next-line:max-line-length
    this.notifyArchivingRequest.update({ 'type': 'success', 'message': '<i class="material-icons" style="vertical-align: middle;"> done </i> <span style="vertical-align: middle; display: inline-block; padding-right:5px">' + msg_part1 + request_id + msg_part2 + '</span> <span style="padding-left:28px">' + '</span>' })
  }



}
