import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoggerService } from './logger/logger.service';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})

export class SleekplanApiService {
 SLEEKPLAN_API_KEY = '410017437c9fbea3a57b12346860fae9741ad0921'; // The good one
//  SLEEKPLAN_API_KEY = '9834831126380f3d69fff6251cd3a690cb97e41ac'; // for test
 SLEEKPLAN_API_URL = 'https://api.sleekplan.com/v1/updates';
 
 public hasOpenedChangelogfromPopup$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  constructor(
    private httpClient: HttpClient,
    private logger: LoggerService,
  ) { }


  getNewChangelogCount() {
    const httpOptions = {
      headers: new HttpHeaders({ 
        Authorization: `Bearer ${this.SLEEKPLAN_API_KEY}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',  
        'Pragma': 'no-cache'  
      })
    };
    

    const url = this.SLEEKPLAN_API_URL + '?per_page=1'
    this.logger.log('[SLEEKPLAN-SERVICE] - get last changelog');

    return this.httpClient.get(url, httpOptions);
  }

  hasOpenedSPChangelogFromPopup() {
    this.hasOpenedChangelogfromPopup$.next(true)
  }


}
