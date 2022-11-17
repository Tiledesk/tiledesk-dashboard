import { Component, OnInit } from '@angular/core';
import { fromEvent, merge, of, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'appdashboard-network-offline',
  templateUrl: './network-offline.component.html',
  styleUrls: ['./network-offline.component.scss']
})
export class NetworkOfflineComponent implements OnInit {
  networkStatus: boolean = false;
  networkStatus$: Subscription = Subscription.EMPTY;
  constructor() { }

  ngOnInit(): void {
    this.checkNetworkStatus();
  }

  checkNetworkStatus() {
    this.networkStatus = navigator.onLine;
    this.networkStatus$ = merge(
      of(null),
      fromEvent(window, 'online'),
      fromEvent(window, 'offline')
    )
      .pipe(map(() => navigator.onLine))
      .subscribe(status => {
        // console.log('[NETWORK-OFFLINE] connection status', status);
        this.networkStatus = status;
      });
  }
}
