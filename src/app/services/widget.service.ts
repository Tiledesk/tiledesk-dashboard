import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { NotifyService } from '../core/notify.service';
@Injectable()
export class WidgetService {
  
  public primaryColorBs: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public secondaryColorBs: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  constructor(
    private notify: NotifyService
  ) { }


  publishOnChangePrimaryColor(primary_color: string) {

    console.log('WIDGET SERVICE - PRIMARY COLOR ', primary_color);
    setTimeout(() => {
      this.primaryColorBs.next(primary_color);
      // tslint:disable-next-line:max-line-length
      this.notify.showNotification('The style of your Chat Widget has been updated!', 2, 'done');
    }, 1500);
  }

  publishOnChangeSecondaryColor(secondary_color: string) {

    console.log('WIDGET SERVICE - SECONDARY COLOR ', secondary_color);
    setTimeout(() => {
      this.secondaryColorBs.next(secondary_color);
      // tslint:disable-next-line:max-line-length
      this.notify.showNotification('The style of your Chat Widget has been updated!', 2, 'done');
    }, 1500);
  }

}
