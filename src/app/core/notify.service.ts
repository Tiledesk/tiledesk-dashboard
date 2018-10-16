import { Injectable } from '@angular/core';

import { Subject } from 'rxjs/Subject';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

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

  constructor(
    private router: Router,
    public location: Location,
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
    }
  }

  onCloseExpiredSessionModal() {
    this.displayExpiredSessionModal = 'none'
  }

  onOkExpiredSessionModal() {
    this.displayExpiredSessionModal = 'none'
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
        template: '<div data-notify="container" class="col-xs-12 col-sm-3 alert alert-{0}" style="text-align: center; background-color: #131313; color:#a9afbb" role="alert">' +
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
      this.notifySendingVerifyEmail.update({ 'type': 'success', 'message': '<i class="material-icons" style="vertical-align: middle;"> done </i> <span style="vertical-align: middle; display: inline-block; padding-right:5px">Verification link has been sent to: </span>' + '<span style="padding-left:28px">' + user_email + '</span>'});
    }, 2000);

  }


}
