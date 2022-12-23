import { Injectable } from '@angular/core';
import { AppConfigService } from '../services/app-config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../core/auth.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoggerService } from '../services/logger/logger.service';

@Injectable()
export class UploadImageNativeService {

  public userImageWasUploaded_Native: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public userImageDownloadUrl_Native: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public botImageWasUploaded_Native: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public botImageDownloadUrl_Native: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public hasDeletedUserPhoto: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public uploadAttachment$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  BASE_URL: string
  TOKEN: string;
  public files: any[];

  constructor(
    public appConfigService: AppConfigService,
    public auth: AuthService,
    public _httpClient: HttpClient,
    private logger: LoggerService
  ) {
    this.getToken()

    this.files = [];
    this.BASE_URL = this.appConfigService.getConfig().baseImageUrl
    this.logger.log('[UPLOAD-IMAGE-NATIVE.SERV] - BASE URL ', this.BASE_URL)
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

  // returns:
  // {"message":"Image uploded successfully","filename":"uploads%2Fusers%2F5aaa99024c3b110014b478f0%2Fimages%2Fphoto.jpg","thumbnail":"uploads%2Fusers%2F5aaa99024c3b110014b478f0%2Fimages%2Fthumbnails_200_200-photo.jpg"}*

  // in PROD
  // https://api.tiledesk.com/v2/images?path=uploads%2Fusers%2F5ebf9b2892befe0019055217%2Fimages%2Fphoto.jpg

  // https://tiledesk-server-pre.herokuapp.com/images?path=uploads%2Fusers%2F5aaa99024c3b110014b478f0%2Fimages%2Fthumbnails_200_200-photo.jpg
  // : Promise<any>
  
  uploadUserPhotoProfile_Native(file: File): Observable<any> {
    // console.log('[UPLOAD-IMAGE-NATIVE.SERV] - UPLOAD USER PHOTO PROFILE - file ', file)
    const headers = new HttpHeaders({
      Authorization: this.TOKEN,
      // 'Content-Type': 'multipart/form-data',
    });
    const requestOptions = { headers: headers };
    const formData = new FormData();

    // for (const file of this.files) {
    formData.append('file', file);
    this.logger.log('[UPLOAD-IMAGE-NATIVE.SERV] - UPLOAD USER PHOTO PROFILE - formData ', formData);
    // }
    // formData.append('file', file, file.name);

    // USE IMAGE API
    const BASE_URL_IMAGES = this.BASE_URL + 'images'
    this.logger.log('[UPLOAD-IMAGE-NATIVE.SERV] BASE_URL_IMAGES ', BASE_URL_IMAGES) 
    return this._httpClient
      .put<any>(BASE_URL_IMAGES + '/users/photo?force=true', formData, requestOptions)
      .pipe(map((res: any) => {
        // console.log('[UPLOAD-IMAGE-NATIVE.SERV] UPLOAD USER PHOTO PROFILE - RES ', res);
        if (res && res.message) {
          this.logger.log('[UPLOAD-IMAGE-NATIVE.SERV] UPLOAD USER PHOTO PROFILE - RES MSG ', res.message);
          
          if (res.message === 'Image uploded successfully') {
            this.userImageWasUploaded_Native.next(true);
          } else {
            this.userImageWasUploaded_Native.next(false);
            this.logger.error('[UPLOAD-IMAGE-NATIVE.SERV] UPLOAD USER PHOTO PROFILE - ERROR RES MSG ', res.message);
          }
        }
        const downloadURL = BASE_URL_IMAGES + '?path=' + res['filename'];
        // const downloadURL = BASE_URL_IMAGES + '?path=' + res['thumbnail'];
        // console.log('[UPLOAD-IMAGE-NATIVE.SERV] UPLOAD USER PHOTO PROFILE - downloadURL ', downloadURL);
        this.userImageDownloadUrl_Native.next(downloadURL);

        return downloadURL
      }))
  }


  // @nicola_74 when you upload by bot (or otherwise not the current user) you have to use this: 

  // curl -v -X PUT -u andrea.leo@frontiere21.it:258456td   -F "file=@/Users/andrealeo/dev/chat21/tiledesk-server-dev-org/test.jpg"  
  // https://tiledesk-server-pre.herokuapp.com/images/users/photo?user_id=bot_IDBOT

  uploadBotPhotoProfile_Native(file: File, id: string): Observable<any> {
    this.logger.log('[UPLOAD-IMAGE-NATIVE.SERV] - UPLOAD BOT PHOTO PROFILE NATIVE file ', file)
    const headers = new HttpHeaders({
      Authorization: this.TOKEN,
      // 'Content-Type': 'multipart/form-data',
    });
    const requestOptions = { headers: headers };
    const formData = new FormData();

    // for (const file of this.files) {
    formData.append('file', file);
    this.logger.log('[UPLOAD-IMAGE-NATIVE.SERV] - UPLOAD BOT PHOTO PROFILE formData ', formData)
    // }
    // formData.append('file', file, file.name);

    // USE IMAGE API
    const BASE_URL_IMAGES = this.BASE_URL + 'images'
    return this._httpClient
      .put<any>(BASE_URL_IMAGES + `/users/photo?force=true&user_id=${id}`, formData, requestOptions)
      .pipe(map((res: any) => {
        this.logger.log('[UPLOAD-IMAGE-NATIVE.SERV] UPLOAD BOT PHOTO PROFILE - RES ', res);
        if (res && res.message) {
          this.logger.log('[UPLOAD-IMAGE-NATIVE.SERV] UPLOAD BOT PHOTO PROFILE - RES MSG ', res.message);
          if (res.message === 'Image uploded successfully') {

            this.botImageWasUploaded_Native.next(true);
          } else {
            this.botImageWasUploaded_Native.next(false);
            this.logger.error('[UPLOAD-IMAGE-NATIVE.SERV] UPLOAD BOT PHOTO PROFILE - ERROR RES MSG ', res.message);
          }
        }
        // const downloadURL = BASE_URL_IMAGES + '?path=' + res['filename'];
        const downloadURL = BASE_URL_IMAGES + '?path=' + res['thumbnail'];

        this.botImageDownloadUrl_Native.next(downloadURL);
        return downloadURL
      }))
  }

  // curl -v -X DELETE  -u andrea.leo@frontiere21.it:258456td \
  // https://tiledesk-server-pre.herokuapp.com/images/users/?path=uploads%2Fusers%2F5aaa99024c3b110014b478f0%2Fimages%2Fphoto.jpg
  deletePhotoProfile_Native(id, calledfor: string) {
    this.logger.log('[UPLOAD-IMAGE-NATIVE.SERV] CALLING DELETE - ID (OF USER OR BOT) ', id);
    this.logger.log('[UPLOAD-IMAGE-NATIVE.SERV] CALLING DELETE calledfor ', calledfor);

    const headers = new HttpHeaders({
      Authorization: this.TOKEN,
      // 'Content-Type': 'multipart/form-data',
    });
    const requestOptions = { headers: headers };
    // const url = "https://tiledesk-server-pre.herokuapp.com/images/users/?path=uploads%2Fusers%2F" + id + "%2Fimages%2Fphoto.jpg"
    const BASE_URL_IMAGES = this.BASE_URL + 'images'
    return this._httpClient
      .delete(BASE_URL_IMAGES +"/users/?path=uploads/users/"+ id + "/images/photo.jpg" , requestOptions)
      .subscribe((res: any) => {
        this.logger.log('[UPLOAD-IMAGE-NATIVE.SERV] DELETE PHOTO PROFILE - RES ', res);

        if (res && res.message === "Image deleted successfully") {
          if (calledfor === 'user') {
            this.hasDeletedUserPhoto.next(true);
          }
        } else if (res && res.message !== "Image deleted successfully") {
          if (calledfor === 'user') {
            this.hasDeletedUserPhoto.next(false);
            this.logger.error('[UPLOAD-IMAGE-NATIVE.SERV] DELETE PHOTO PROFILE - ERROR ', res.message);
          }
        }
      });
  }


  uploadLauncherLogoOnNative(file: File): Observable<any> {
    this.logger.log('[UPLOAD-IMAGE-NATIVE.SERV] - UPLOAD USER PHOTO PROFILE - file ', file)
    const headers = new HttpHeaders({
      Authorization: this.TOKEN,
      // 'Content-Type': 'multipart/form-data',
    });
    const requestOptions = { headers: headers };
    const formData = new FormData();

    // for (const file of this.files) {
    formData.append('file', file);
    this.logger.log('[UPLOAD-IMAGE-NATIVE.SERV] - UPLOAD LAUNCHER LOGO - formData ', formData);
    // }
    // formData.append('file', file, file.name);

    // USE IMAGE API
    const BASE_URL_IMAGES = this.BASE_URL + 'images'
    return this._httpClient
      .put<any>(BASE_URL_IMAGES + '/users/photo?force=true', formData, requestOptions)
      .pipe(map((res: any) => {
        this.logger.log('[UPLOAD-IMAGE-NATIVE.SERV] UPLOAD LAUNCHER LOGO - RES ', res);
        if (res && res.message) {
          // console.log('[UPLOAD-IMAGE-NATIVE.SERV] UPLOAD LAUNCHER LOGO - RES MSG ', res.message);
          
          if (res.message === 'Image uploded successfully') {
            // this.userImageWasUploaded_Native.next(true);
          } else {
            // this.userImageWasUploaded_Native.next(false);
            this.logger.error('[UPLOAD-IMAGE-NATIVE.SERV] UPLOAD LAUNCHER LOGO - ERROR RES MSG ', res.message);
          }
        }
        const downloadURL = BASE_URL_IMAGES + '?path=' + res['filename'];
        // const downloadURL = BASE_URL_IMAGES + '?path=' + res['thumbnail'];
        // this.userImageDownloadUrl_Native.next(downloadURL);
        // console.log('[UPLOAD-IMAGE-NATIVE.SERV] downloadURL ', downloadURL)
        return downloadURL
      }))
  }


  uploadAttachment_Native(upload): Promise<any> {
    //  console.log('[NATIVE UPLOAD] - upload new image/file ... upload', upload)
      const headers = new HttpHeaders({
        Authorization: this.TOKEN,
        //'Content-Type': 'multipart/form-data',
      });
      const requestOptions = { headers: headers };
      const formData = new FormData();
      formData.append('file', upload);
  
      const that = this;
      if ((upload.type.startsWith('image') && (!upload.type.includes('svg')))) {
        // console.log('[NATIVE UPLOAD] - upload new image')
        //USE IMAGE API
        const url = this.BASE_URL + 'images' + '/users'
        return new Promise((resolve, reject) => {
          that.uploadAttachment$.next(0);
          that._httpClient.post(url, formData, requestOptions).subscribe(data => {
            const downloadURL = this.BASE_URL + 'images' + '?path=' + data['filename'];
            resolve(downloadURL)
            that.uploadAttachment$.next(100);
          }, (error) => {
            reject(error)
          });
        });
      } else {
        // console.log('[NATIVE UPLOAD] - upload new file')
        //USE FILE API
        const url = this.BASE_URL + 'files' + '/users'
        return new Promise((resolve, reject) => {
          that.uploadAttachment$.next(0);
          that._httpClient.post(url, formData, requestOptions).subscribe(data => {
            const downloadURL = this.BASE_URL + 'files' + '?path=' + encodeURI(data['filename']);
            resolve(downloadURL)
            that.uploadAttachment$.next(100);
            // that.BSStateUpload.next({upload: upload});
          }, (error) => {
            this.logger.error('[NATIVE UPLOAD] - ERROR upload new file ', error)
            reject(error)
          });
        });
      }
  
    }


}
