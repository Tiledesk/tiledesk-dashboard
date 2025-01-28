import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SleekplanSsoService {
  // SLEEKPLAN_SSO_BASE_URL = "https://5f2eecc3-87fe-4e17-ab99-6d24e063dd70-00-357btkikl6pcl.spock.replit.dev"
  SLEEKPLAN_SSO_BASE_URL = "https://formez-app-v-3-tiledesk.replit.app"

  constructor(
    private httpClient: HttpClient
  ) { }

  // _getSsoToken(user: { id: string; name: string; email: string; image?: string }): Observable<{ token: string }> {
  //   return this.httpClient.post<{ token: string }>('/api/sleekplan/sso', user);
  // }

  getSsoToken(user: string) {
    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Content-Type': 'application/json',
    //     'Authorization': this.TOKEN
    //   })
    // }
    let body = { user }
  
    // const url = 'https://formez-app-v-3-tiledesk.replit.app/api/sleekplan/sso'
    const url = this.SLEEKPLAN_SSO_BASE_URL +'/api/sleekplan/sso'
    // console.log("sleekplan sso]  ", url);
    return this.httpClient.post(url, body );
  }

}
