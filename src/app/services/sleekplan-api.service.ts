import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SleekplanApiService {
 SLEEKPLAN_API_KEY = '410017437c9fbea3a57b12346860fae9741ad0921'; // The good one
//  SLEEKPLAN_API_KEY = '9834831126380f3d69fff6251cd3a690cb97e41ac'; // for test
 SLEEKPLAN_API_URL = 'https://api.sleekplan.com/v1/updates';

  constructor(
    private httpClient: HttpClient
  ) { }


  // getNewChangelogCount(lastSeen: number): Observable<{ count: number }> {
  //   return this.http.get<{ count: number }>(
  //     `/api/sleekplan/new-changelog-count?lastSeen=${lastSeen}`
  //   );
  // }

  getNewChangelogCount() {
    const httpOptions = {
      headers: new HttpHeaders({ 
        Authorization: `Bearer ${this.SLEEKPLAN_API_KEY}`,
        'Content-Type': 'application/json',
      })
    };
    

    // const url = `https://9c17ea53-8432-4560-b14b-8169b389c8a8-00-34l7pm8guu6m6.riker.replit.dev/api/sleekplan/new-changelog-count?lastSeen=${lastSeen}`;
    const url = this.SLEEKPLAN_API_URL + '?per_page=1'
    console.log('[SLEEKPLAN-SERVICE] - get last post');

    return this.httpClient.get(url, httpOptions);
  }


  // public getUsersActivities(querystring: string, pagenumber: number): Observable<Activity[]> {
   

  //   const url = this.ACTIVITIES_URL + '?page=' + pagenumber + _querystring;

  //   this.logger.log('[ACTIVITIES-SERV] - GET ACTIVITIES - URL ', url);
  //   const httpOptions = {
  //     headers: new HttpHeaders( { Authorization: `Bearer ${this.SLEEKPLAN_API_KEY}` })
  //   };
  //   return this._httpClient.get<Activity[]>(url, httpOptions);
  // }
}
