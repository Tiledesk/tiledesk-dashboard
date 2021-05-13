import { Injectable } from '@angular/core';
import { AppConfigService } from '../services/app-config.service';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../core/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { catchError, retry } from 'rxjs/operators';
// import { Http, Headers, RequestOptions } from '@angular/http';
@Injectable()
export class UploadImageNativeService {

  public userImageWasUploaded_Native: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public userImageDownloadUrl_Native: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public botImageWasUploaded_Native: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public botImageDownloadUrl_Native: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public hasDeletedUserPhoto: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
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

  // curl -v -X PUT -u andrea.leo@frontiere21.it:258456td \
  // -F "file=@/Users/andrealeo/dev/chat21/tiledesk-server-dev-org/test.jpg" \
  //   https://tiledesk-server-pre.herokuapp.com/images/users/photo

  // ritorna:
  // {"message":"Image uploded successfully","filename":"uploads%2Fusers%2F5aaa99024c3b110014b478f0%2Fimages%2Fphoto.jpg","thumbnail":"uploads%2Fusers%2F5aaa99024c3b110014b478f0%2Fimages%2Fthumbnails_200_200-photo.jpg"}*

  // https://tiledesk-server-pre.herokuapp.com/images?path=uploads%2Fusers%2F5aaa99024c3b110014b478f0%2Fimages%2Fthumbnails_200_200-photo.jpg
  // : Promise<any>
  uploadUserPhotoProfile_Native(file: File): Observable<any> {
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
      .put<any>(BASE_URL_IMAGES + '/users/photo?force=true', formData, requestOptions)
      .pipe(map((res: any) => {
        console.log('UploadImageNativeService uploadPhotoProfile_Native RES ', res);
        if (res && res.message) {
          console.log('UploadImageNativeService uploadPhotoProfile_Native RES MSG ', res.message);
          if (res.message === 'Image uploded successfully') {

            this.userImageWasUploaded_Native.next(true);

          } else {

            this.userImageWasUploaded_Native.next(false);


          }
        }
        const downloadURL = BASE_URL_IMAGES + '?path=' + res['filename'];
        // const downloadURL = BASE_URL_IMAGES + '?path=' + res['thumbnail'];

        this.userImageDownloadUrl_Native.next(downloadURL);

        return downloadURL

      }))
  }


  // @nicola_74 quando fai l'upload per bot (o comunque non l'utente corrente) devi usare questo :

  // curl -v -X PUT -u andrea.leo@frontiere21.it:258456td   -F "file=@/Users/andrealeo/dev/chat21/tiledesk-server-dev-org/test.jpg"  
  // https://tiledesk-server-pre.herokuapp.com/images/users/photo?user_id=bot_IDBOT


  uploadBotPhotoProfile_Native(file: File, id: string): Observable<any> {
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
      .put<any>(BASE_URL_IMAGES + `/users/photo?force=true&user_id=${id}`, formData, requestOptions)
      .pipe(map((res: any) => {
        console.log('UploadImageNativeService uploadPhotoProfile_Native RES ', res);
        if (res && res.message) {
          console.log('UploadImageNativeService uploadPhotoProfile_Native RES MSG ', res.message);
          if (res.message === 'Image uploded successfully') {

            this.botImageWasUploaded_Native.next(true);
          } else {
            this.botImageWasUploaded_Native.next(false);

          }
        }
        // const downloadURL = BASE_URL_IMAGES + '?path=' + res['filename'];
        const downloadURL = BASE_URL_IMAGES + '?path=' + res['thumbnail'];

        this.botImageDownloadUrl_Native.next(downloadURL);

        return downloadURL

      }))
  }




  // curl -v -X DELETE  -u andrea.leo@frontiere21.it:258456td \
  //  https://tiledesk-server-pre.herokuapp.com/images/users/?path=uploads%2Fusers%2F5aaa99024c3b110014b478f0%2Fimages%2Fphoto.jpg
  deletePhotoProfile_Native(id, calledfor: string) {
    console.log('UploadImageNativeService calling deleteNativeUserAvatar calledfor ', calledfor);
    const headers = new HttpHeaders({
      Authorization: this.TOKEN,
      // 'Content-Type': 'multipart/form-data',
    });
    const requestOptions = { headers: headers };
    const url = "https://tiledesk-server-pre.herokuapp.com/images/users/?path=uploads%2Fusers%2F" + id + "%2Fimages%2Fphoto.jpg"

    return this.http
      .delete(url, requestOptions)
      .subscribe((res: any) => {
        console.log('UploadImageNativeService deleteNativeUserAvatar res ', res);

        if (res && res.message === "Image deleted successfully") {
          if (calledfor === 'user') {

            this.hasDeletedUserPhoto.next(true);
          }
        } else if (res && res.message !== "Image deleted successfully") {
          if (calledfor === 'user') {
            this.hasDeletedUserPhoto.next(false);
          }
        }
      });
  }

  // private handleError(error: HttpErrorResponse): Observable<{}> {
  //   if (error.status === 0) {
  //     // A client-side or network error occurred. Handle it accordingly.
  //     console.error('An error occurred:', error.error);
  //   } else {
  //     // The backend returned an unsuccessful response code.
  //     // The response body may contain clues as to what went wrong.
  //     console.error(
  //       `Backend returned code ${error.status}, ` +
  //       `body was: ${error.error}`);
  //   }
  //   // Return an observable with a user-facing error message.
  //   return throwError(
  //     'Something bad happened; please try again later.');
  // }

}
