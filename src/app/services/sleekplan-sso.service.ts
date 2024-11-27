import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SleekplanSsoService {

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
    const url = 'https://9c17ea53-8432-4560-b14b-8169b389c8a8-00-34l7pm8guu6m6.riker.replit.dev/api/sleekplan/sso'
    // console.log("sleekplan sso]  ", url);
    return this.httpClient.post(url, body );
  }

}
