import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MultichannelService {

  whatsapp_replit_base_url = "https://tiledesk-whatsapp-app-pre.giovannitroisi3.repl.co"

  constructor(private http: HttpClient) { }

  getCodeForWhatsappTest(info) {
    let promise = new Promise((resolve, reject) => {
      let headers = new HttpHeaders({
        'Content-Type': 'application/json',
        //'Authorization': this.TOKEN
      })

      this.http.post(this.whatsapp_replit_base_url + "/newtest", info, { headers: headers })
          .toPromise().then((res) => {
            resolve(res)
          }).catch((err) => {
            reject(err);
          })
    })
    return promise;
  }
}
