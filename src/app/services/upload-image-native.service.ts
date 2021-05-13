import { Injectable } from '@angular/core';
import { AppConfigService } from '../services/app-config.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from '../core/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
// import { Http, Headers, RequestOptions } from '@angular/http';
@Injectable()
export class UploadImageNativeService {

  public userImageWasUploaded_Native: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public userImageDownloadUrl_Native: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public botImageWasUploaded_Native: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public botImageDownloadUrl_Native: BehaviorSubject<string> = new BehaviorSubject<string>('');
  // http: Http;
  BASE_URL: string
  TOKEN: string;
  public files: any[];

  constructor(
    // http: Http,
    public appConfigService: AppConfigService,
    public auth: AuthService,
    public http: HttpClient
  ) {
    this.getToken()
    // this.http = http;
    this.files = [];
    this.BASE_URL = this.appConfigService.getConfig().SERVER_BASE_URL
    // this.BASE_URL = "http://tiledesk-server-pre.herokuapp.com/"
    console.log('UploadImageNativeService BASE_URL ', this.BASE_URL)
  }
  getToken() {
    this.auth.user_bs.subscribe((user) => {
      if (user) {
        this.TOKEN = user.token
      }
    });
  }

  // : Promise<any>
  uploadPhotoProfile_Native(file: File, type: string): Observable<any> {
    console.log('UploadImageNativeService  - file ', file)
    const headers = new HttpHeaders({
      Authorization: this.TOKEN,
      // 'Content-Type': 'multipart/form-data',
    });
    const requestOptions = { headers: headers };
    const formData = new FormData();

    // for (const file of this.files) {
    formData.append('file', file);
    console.log('UploadImageNativeService  - formData ', formData)
    // }
    // formData.append('file', file, file.name);

    const that = this;

    //USE IMAGE API
    const BASE_URL_IMAGES = this.BASE_URL + 'images'
    return this.http
      .post<any>(BASE_URL_IMAGES + '/users', formData, requestOptions)
      .pipe(map((res: any) => {
        console.log('UploadImageNativeService uploadNativeUserAvatar RES ', res);
        if (res && res.message) {
          console.log('UploadImageNativeService uploadNativeUserAvatar RES MSG ', res.message);
          if (res.message === 'Image uploded successfully') {
            if (type === 'user') {
              this.userImageWasUploaded_Native.next(true);
            } else {
              this.botImageWasUploaded_Native.next(true);
            }
          } else {
            if (type === 'user') {
              this.userImageWasUploaded_Native.next(false);
            } else {
              this.botImageWasUploaded_Native.next(false);
            }

          }
        }
        const downloadURL = BASE_URL_IMAGES + '?path=' + res['filename'];
        if (type === 'user') {
          this.userImageDownloadUrl_Native.next(downloadURL);
        } else {
          this.botImageDownloadUrl_Native.next(downloadURL);
        }
        return downloadURL

      }))
  }


}
