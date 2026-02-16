import { Injectable } from '@angular/core';
import { AppConfigService } from '../services/app-config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../core/auth.service';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LoggerService } from '../services/logger/logger.service';
import { formatBytesWithDecimal } from 'app/utils/util';
import { NotifyService } from 'app/core/notify.service';
import { TranslateService } from '@ngx-translate/core';

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
  projectId: string;
  public files: any[];

  constructor(
    public appConfigService: AppConfigService,
    public auth: AuthService,
    public _httpClient: HttpClient,
    private logger: LoggerService,
    public notify: NotifyService,
    private translate: TranslateService,
  ) {
    this.getToken();
    this.getCurrentProject()

    this.files = [];
    this.BASE_URL = this.appConfigService.getConfig().baseImageUrl
    this.logger.log('[UPLOAD-IMAGE-NATIVE.SERV] - BASE URL ', this.BASE_URL)
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.projectId = project._id
        this.logger.log('[UPLOAD-IMAGE-NATIVE.SERV] - projectId ', this.projectId)
      }
    });
  }

  getToken() {
    this.auth.user_bs.subscribe((user) => {
      if (user) {
        this.TOKEN = user.token
      }
    });
  }


  //   https://tiledesk-server-pre.herokuapp.com/images/users/photo

  // returns:
  // {"message":"Image uploded successfully","filename":"uploads%2Fusers%2F5aaa99024c3b110014b478f0%2Fimages%2Fphoto.jpg","thumbnail":"uploads%2Fusers%2F5aaa99024c3b110014b478f0%2Fimages%2Fthumbnails_200_200-photo.jpg"}*

  // in PROD
  // https://api.tiledesk.com/v2/files?path=uploads%2Fusers%2F5ebf9b2892befe0019055217%2Fimages%2Fphoto.jpg

  // https://tiledesk-server-pre.herokuapp.com/files?path=uploads%2Fusers%2F5aaa99024c3b110014b478f0%2Fimages%2Fthumbnails_200_200-photo.jpg
  // : Promise<any>

  uploadUserPhotoProfile_Native(file: File): Observable<any> {
    this.logger.log('[UPLOAD-IMAGE-NATIVE.SERV] - UPLOAD USER PHOTO PROFILE - file ', file)
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
    // const BASE_URL_IMAGES = this.BASE_URL + 'images'
    const BASE_URL_IMAGES = this.BASE_URL + this.projectId + '/files'
    this.logger.log('[UPLOAD-IMAGE-NATIVE.SERV] Photo Profile upload BASE_URL_IMAGES ', BASE_URL_IMAGES)
    return this._httpClient
      .post<any>(BASE_URL_IMAGES + '/users/photo', formData, requestOptions)
      .pipe(map((res: any) => {
        this.logger.log('[UPLOAD-IMAGE-NATIVE.SERV] UPLOAD USER PHOTO PROFILE - RES ', res);
        if (res && res.message) {
          this.logger.log('[UPLOAD-IMAGE-NATIVE.SERV] UPLOAD USER PHOTO PROFILE - RES MSG ', res.message);

          if (res.message === 'Image uploaded successfully') {
            this.userImageWasUploaded_Native.next(true);
          } else {
            this.userImageWasUploaded_Native.next(false);
            this.logger.error('[UPLOAD-IMAGE-NATIVE.SERV] UPLOAD USER PHOTO PROFILE - ERROR RES MSG ', res.message);
          }
        }
        const downloadURL = this.BASE_URL + 'files?path=' + res['filename'];
        // const downloadURL = BASE_URL_IMAGES + '?path=' + res['thumbnail'];
        // this.logger.log('[UPLOAD-IMAGE-NATIVE.SERV] UPLOAD USER PHOTO PROFILE - downloadURL ', downloadURL);
        this.userImageDownloadUrl_Native.next(downloadURL);

        return downloadURL
      }),
      catchError((error: any) => {
        this.logger.error('[UPLOAD-IMAGE-NATIVE.SERV] UPLOAD ERROR: ', error);
        this.logger.error('[UPLOAD-IMAGE-NATIVE.SERV] UPLOAD ERROR: ', error);

        
        this.userImageWasUploaded_Native.next(false);
        this.manageUploadError(error)

        // Return an observable with an error message
        return throwError(() => new Error('File upload failed. Please try again.'));
      })
    );
  }

    // https://tiledesk-server-pre.herokuapp.com/images/users/?path=uploads%2Fusers%2F5aaa99024c3b110014b478f0%2Fimages%2Fphoto.jpg
  deletePhotoProfile_Native(id, calledfor: string) {
    this.logger.log('[UPLOAD-IMAGE-NATIVE.SERV] CALLING DELETE - ID) ', id);
    this.logger.log('[UPLOAD-IMAGE-NATIVE.SERV] CALLING DELETE calledfor ', calledfor);

    const headers = new HttpHeaders({
      Authorization: this.TOKEN,
      // 'Content-Type': 'multipart/form-data',
    });
    const requestOptions = { headers: headers };
    // const url = "https://tiledesk-server-pre.herokuapp.com/images/users/?path=uploads%2Fusers%2F" + id + "%2Fimages%2Fphoto.jpg"
    // const BASE_URL_IMAGES = this.BASE_URL + 'images'
    const BASE_URL_IMAGES = this.BASE_URL + this.projectId + '/files'
    return this._httpClient
      .delete(BASE_URL_IMAGES + "?path=uploads/users/" + id + "/images/photo.jpg", requestOptions)
      .subscribe((res: any) => {
        this.logger.log('[UPLOAD-IMAGE-NATIVE.SERV] DELETE PHOTO PROFILE - RES ', res);

        if (res && res.message === "File deleted successfully") {
          if (calledfor === 'user') {
            this.hasDeletedUserPhoto.next(true);
          }
        } else if (res && res.message !== "File deleted successfully") {
          if (calledfor === 'user') {
            this.hasDeletedUserPhoto.next(false);
            this.logger.error('[UPLOAD-IMAGE-NATIVE.SERV] DELETE PHOTO PROFILE - ERROR ', res.message);
          }
        }
      });
  }


  // @nicola_74 when you upload by bot (or otherwise not the current user) you have to use this: 
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
      .put<any>(BASE_URL_IMAGES + `/users/photo?force=true&bot_id=${id}`, formData, requestOptions)
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
      }),
      catchError((error: any) => {
        this.logger.error('[UPLOAD-IMAGE-NATIVE.SERV] UPLOAD BOT PROFILE ERROR: ', error);
        this.logger.error('[UPLOAD-IMAGE-NATIVE.SERV] UPLOAD BOT PROFILE ERROR: ', error);

        
        this.botImageWasUploaded_Native.next(false);
        this.manageUploadError(error)

        // Return an observable with an error message
        return throwError(() => new Error('File upload failed. Please try again.'));
      })
    );
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
          // this.logger.log('[UPLOAD-IMAGE-NATIVE.SERV] UPLOAD LAUNCHER LOGO - RES MSG ', res.message);

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
        // this.logger.log('[UPLOAD-IMAGE-NATIVE.SERV] downloadURL ', downloadURL)
        return downloadURL
      }))
  }

  // this.URL_TILEDESK_FILE = this.getBaseUrl() + projectId + '/files'
  uploadAttachment_Native(upload): Promise<any> {
    //  this.logger.log('[NATIVE UPLOAD] - upload new image/file ... upload', upload)
    const headers = new HttpHeaders({
      Authorization: this.TOKEN,
      //'Content-Type': 'multipart/form-data',
    });
    const requestOptions = { headers: headers };
    const formData = new FormData();
    formData.append('file', upload);

    const that = this;
    if ((upload.type.startsWith('image') && (!upload.type.includes('svg')))) {
      // this.logger.log('[NATIVE UPLOAD] - upload new image')
      //USE IMAGE API
      // const url = this.BASE_URL + 'images' + '/users'
      const url = this.BASE_URL + this.projectId + '/files/chat'
      return new Promise((resolve, reject) => {
        that.uploadAttachment$.next(0);
        that._httpClient.post(url, formData, requestOptions).subscribe(data => {
          const downloadURL = this.BASE_URL + 'files' + '?path=' + data['filename'];
          resolve(downloadURL)
          that.uploadAttachment$.next(100);
        }, (error) => {
          that.uploadAttachment$.next(100);
          this.manageUploadError(error)
          this.logger.log('uploadAttachment_Native error 1', error)
          reject(error)
        });
      });
    } else {
      // this.logger.log('[NATIVE UPLOAD] - upload new file')
      // USE FILE API
      // const url = this.BASE_URL + 'files' + '/users'
      const url = this.BASE_URL + this.projectId + '/files/chat'
      return new Promise((resolve, reject) => {
        that.uploadAttachment$.next(0);
        that._httpClient.post(url, formData, requestOptions).subscribe(data => {
          const downloadURL = this.BASE_URL + 'files' + '?path=' + encodeURIComponent(data['filename']);
          resolve(downloadURL)
          that.uploadAttachment$.next(100);
          // that.BSStateUpload.next({upload: upload});
        }, (error) => {
          that.uploadAttachment$.next(100);
          this.manageUploadError(error)
          this.logger.error('[NATIVE UPLOAD] - ERROR upload new file ', error)
          this.logger.log('[NATIVE UPLOAD] uploadAttachment_Native error 2', error)
          reject(error)
        });
      });
    }
  }


  uploadAssetFile(upload, expirationTime?:any): Promise<any> {
    //  this.logger.log('[NATIVE UPLOAD] - upload new image/file ... upload', upload)
    const headers = new HttpHeaders({
      Authorization: this.TOKEN,
      //'Content-Type': 'multipart/form-data',
    });
    const requestOptions = { headers: headers };
    const formData = new FormData();
    formData.append('file', upload);

    const that = this;

      let url = this.BASE_URL + this.projectId + '/files/assets'

      if (expirationTime) {
        url += `?expirationTime=${encodeURIComponent(expirationTime)}`;
      }

      return new Promise((resolve, reject) => {
        that.uploadAttachment$.next(0);
        that._httpClient.post(url, formData, requestOptions).subscribe(data => {
          const downloadURL = this.BASE_URL + 'files' + '?path=' + (data['filename']);
          resolve(downloadURL)
          that.uploadAttachment$.next(100);
        }, (error) => {
          that.uploadAttachment$.next(100);
          this.manageUploadError(error)
          this.logger.error('[NATIVE UPLOAD] - ERROR upload new file ', error)
          this.logger.log('[NATIVE UPLOAD] uploadAssetFile error 2', error)
          reject(error)
        });
      });
    
  }

  

  manageUploadError(error) {
    if (error.status === 413) {
      // this.logger.log(`[NATIVE UPLOAD] - upload native error message 1`, error.error.err)
      this.logger.log(`[NATIVE UPLOAD] - upload native error message 2`, error.error.limit_file_size)
      const uploadLimitInBytes = error.error.limit_file_size
      const uploadFileLimitSize = formatBytesWithDecimal(uploadLimitInBytes, 2)
      this.logger.log(`[NATIVE UPLOAD] - upload native error limitInMB`, uploadFileLimitSize)
      this.notify.presentModalAttachmentFileSizeTooLarge(uploadFileLimitSize)
    } else {
      this.notify.showWidgetStyleUpdateNotification(this.translate.instant('BotsAddEditPage.AnErrorHasOccurred'), 4, 'report_problem');
    }
  }

  deleteImageUploadAttachment_Native(path) {
    this.logger.log('[NATIVE UPLOAD] - delete image path ',path)
    const headers = new HttpHeaders({
      Authorization: this.TOKEN,
      //'Content-Type': 'multipart/form-data',
    });
    const requestOptions = { headers: headers };

    //USE IMAGE API
    const that = this;
    // const url = this.BASE_URL + 'images' + '/users' + '?path=' + path.split('path=')[1]
    const url = this.BASE_URL + this.projectId + '/files?path=' + path.split('path=')[1]
    this.logger.log('[NATIVE UPLOAD] delete Image Attachment URL ', url)
    return new Promise((resolve, reject) => {
      that._httpClient.delete(url, requestOptions).subscribe(data => {
        // this.logger.log('deleteUploadAttachment_Native data' , data) 
        // const downloadURL = this.URL_TILEDESK_IMAGES + '?path=' + data['filename'];
        resolve(true)
        // that.BSStateUpload.next({upload: upload});
      }, (error) => {
        reject(error)
      });
    });
  }


  deleteDocumentUploadAttachment_Native(path) {
   this.logger.log('[NATIVE UPLOAD] - delete Document path ',path)
   const headers = new HttpHeaders({
     Authorization: this.TOKEN,
     //'Content-Type': 'multipart/form-data',
   });
   const requestOptions = { headers: headers };

   const that = this;

  //  const url = this.BASE_URL + 'files' + '/users' + '?path=' + path.split('path=')[1]
   const url = this.BASE_URL + this.projectId + '/files?path=' + path.split('path=')[1]
   this.logger.log('[NATIVE UPLOAD] delete Document Attachment URL ', url)
   return new Promise((resolve, reject) => {
     that._httpClient.delete(url, requestOptions).subscribe(data => {
      this.logger.log('deleteUploadAttachment_Native data' , data) 
       // const downloadURL = this.URL_TILEDESK_IMAGES + '?path=' + data['filename'];
       resolve(true)
       // that.BSStateUpload.next({upload: upload});
     }, (error) => {
       reject(error)
     });
   });
 }


}
