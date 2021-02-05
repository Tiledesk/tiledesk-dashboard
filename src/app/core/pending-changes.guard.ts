import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { NotifyService } from './notify.service';
const swal = require('sweetalert');

// https://stackoverflow.com/questions/35922071/warn-user-of-unsaved-changes-before-leaving-page?rq=1

// https://stackoverflow.com/questions/49803776/how-to-prompt-user-when-leaving-the-angular-4-page-if-there-are-any-changes-made  // in questo esempio il confirm è nel componente
export interface ComponentCanDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}


@Injectable()
export class PendingChangesGuard implements CanDeactivate<ComponentCanDeactivate> {

  constructor(private notifyService: NotifyService) { };

  canDeactivate(component: ComponentCanDeactivate): boolean | Observable<boolean> {
    // if there are no pending changes, just allow deactivation; else confirm first
    return component.canDeactivate() ?
      true :
      // NOTE: this warning message will only be shown when navigating elsewhere within your angular app;
      // when navigating away from your angular app, the browser will show a generic warning message
      // see http://stackoverflow.com/a/42207299/7307355
      confirm('WARNING: You have unsaved changes. Press Cancel to go back and save these changes, or OK to lose these changes.');
      // this.openConfirmDialog();
  }

  // openConfirmDialog() {
  //   // this.notifyService.showExitFromComponentConfirmation();
  //   // console.log('this.notifyService.onClose$ value', this.notifyService.onClose$.getValue())
  //   // return this.notifyService.onClose$.subscribe((res: any) => {
  //   //   return res
  //   // })
  //   // return this.notifyService.onClose$.map(result => {

  //   //   console.log('this.notifyService.onClose result', result)
  //   //   return result;
  //   // })

  // return  swal({
  //     title: "Are you sure?",
  //     text: "You have unsaved changes. Press Cancel to go back and save these changes, or OK to lose these changes.",
  //     icon: "warning",
  //     buttons: true,
  //     dangerMode: true,
  //   })
  //   .then((willExit) => {
  //     if (willExit) {

  //       console.log('showExitFromComponentConfirmation willExit pressed OK' )
       
  //         // const close = false
  //         // this._onClose.next(close);

  //       //   private _onClose = new Subject<boolean>();
  //       //   close = this._onClose.asObservable();
       
  //       // this.onClose$.next(false)

  //       return false;

  //     } else {
  //       console.log('showExitFromComponentConfirmation willExit else'  )
  //       // this.onClose$.next(true)

  //       // const close = true
  //       // this._onClose.next(close);

  //       return true;

  //     }
  //   });

  // }
  

}


