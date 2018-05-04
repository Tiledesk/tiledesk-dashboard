import { Injectable } from '@angular/core';

import { Subject } from 'rxjs/Subject';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

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


}
