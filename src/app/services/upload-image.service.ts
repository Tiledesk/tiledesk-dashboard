import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as firebase from 'firebase/app';
import 'firebase/storage';
import { LoggerService } from '../services/logger/logger.service';
import { NotifyService } from '../core/notify.service';
import { TranslateService } from '@ngx-translate/core';
@Injectable()
export class UploadImageService {

  public imageExist: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public userImageWasUploaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public botImageWasUploaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public hasDeletedUserPhoto: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public hasUploadedLauncherLogo$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public hasdeletedLauncherLogo$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public uploadAttachment$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public attachmentDeleted$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  // public imageWasUploaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  public uploadImageErrorMsg: string;
  public fileNotSupportedMsg: string;
  constructor(
    private logger: LoggerService,
    private notify: NotifyService,
    private translate: TranslateService
  ) {
    this.getTranslations();
  }

  getTranslations() {
    this.translate.get('SorryTheFollowingErrorOccurredWhileUploadingTheImage')
      .subscribe((text: string) => {
        this.uploadImageErrorMsg = text;
        // console.log('[UPLOAD-IMAGE-FB.SERV] - getTranslations - uploadImageError ', text)
      });
    this.translate.get('SorryFileTypeNotSupported')
      .subscribe((text: string) => {
        this.fileNotSupportedMsg = text;
        // console.log('[UPLOAD-IMAGE-FB.SERV] - getTranslations - fileNotSupportedMsg ', text)
      });
  }

  // ---------------------------------------------------
  // @ UPLOAD USER PHOTO
  // ---------------------------------------------------
  public uploadUserAvatar(file: any, user_id: string) {
    this.logger.log('[UPLOAD-IMAGE-FB.SERV] - UPLOAD USER PHOTO - FILE ', file)
    this.logger.log('[UPLOAD-IMAGE-FB.SERV] - UPLOAD USER PHOTO - FILE > TYPE ', file.type);

    if (file.type === "image/png" || file.type === "image/jpeg") {


      const file_name = 'photo.jpg';
      this.logger.log('[UPLOAD-IMAGE-FB.SERV] - UPLOAD USER PHOTO - FILE NAME ', file_name);
      const file_metadata = { contentType: file.type };
      this.logger.log('[UPLOAD-IMAGE-FB.SERV] - FILE METADATA ', file_metadata);

      this.logger.log('[UPLOAD-IMAGE-FB.SERV] - UPLOAD USER PHOTO - CURRENT USER ID ', user_id)

      // Create a root reference
      const storageRef = firebase.storage().ref();
      // this.logger.log('UPLOAD IMAGE SERVICE - STORAGE REFERENCE ', storageRef)

      // Upload file and metadata to the object 'images/mountains.jpg'
      const uploadTask = storageRef.child('profiles/' + user_id + '/' + file_name).put(file, file_metadata);

      // uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
      //   (snapshot) =>  {
      //     upload.progress = (uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100;
      //     this.logger.log(upload.progress);
      //   },
      // Listen for state changes, errors, and completion of the upload.
      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
        (snapshot) => {
          // this.logger.log('SNAPSHOT ', snapshot)
          const progress = (uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100;

          if (progress === 100) {
            // const self = this
            // this.imageExist.next(true);

            this.logger.log('[UPLOAD-IMAGE-FB.SERV] - UPLOAD USER PHOTO * COMPLETE *', true)
          }
          this.logger.log('Upload is ' + progress + '% done');
          switch (uploadTask.snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
              this.logger.log('Upload is paused');
              break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
              this.logger.log('Upload is running');
              break;
          }
        }, (error: any) => {

          this.userImageWasUploaded.next(false);
          this.notify.showToast(this.uploadImageErrorMsg + error, 4, 'report_problem')
          // A full list of error codes is available at
          // https://firebase.google.com/docs/storage/web/handle-errors
          this.logger.error('[UPLOAD-IMAGE-FB.SERV] - UPLOAD USER PHOTO - ERROR ', error)
          switch (error.code) {
            case 'storage/unauthorized':
              // User doesn't have permission to access the object
              break;
            case 'storage/canceled':
              // User canceled the upload
              break;
            case 'storage/unknown':
              // Unknown error occurred, inspect error.serverResponse
              break;
          }
        }, () => {
          // Upload completed successfully, now we can get the download URL
          const self = this
          uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
            self.logger.log('[UPLOAD-IMAGE-FB.SERV] - UPLOAD USER PHOTO - File available at', downloadURL);

            self.userImageWasUploaded.next(true);
          });
        }
      );
    } else {
      this.notify.showToast(this.fileNotSupportedMsg, 4, 'report_problem')
    }
  }

  // ---------------------------------------------------
  // @ DELETE USER PHOTO & THUMB-PHOTO
  // ---------------------------------------------------
  public deleteUserProfileImage(userid) {
    const file_name_photo = 'photo.jpg';
    const file_name_thumb_photo = 'thumb_photo.jpg';

    // Create a root reference
    const storageRef = firebase.storage().ref();
    // const deleteTask = storageRef.child('profiles/' + userid + '/' + file_name)

    const deletePhoto = storageRef.child('profiles/' + userid + '/' + file_name_photo)
    const deleteThumbPhoto = storageRef.child('profiles/' + userid + '/' + file_name_thumb_photo)

    // ------------------------------------
    // Delete the file photo
    // ------------------------------------
    deletePhoto.delete().then(() => {
      this.logger.log('[UPLOAD-IMAGE-FB.SERV] - DELETE USER PHOTO ')

      this.hasDeletedUserPhoto.next(true);

    }).catch((error) => {
      this.logger.error('[UPLOAD-IMAGE-FB.SERV] - DELETE USER - ERROR ', error)
    });

    // ------------------------------------
    // Delete the file thumb_photo
    // ------------------------------------
    deleteThumbPhoto.delete().then(() => {
      this.logger.log('[UPLOAD-IMAGE-FB.SERV] - DELETE USER THUMB-PHOTO ')
      // this.userImageWasUploaded.next(false);

    }).catch((error) => {
      this.logger.error('[UPLOAD-IMAGE-FB.SERV] - DELETE USER THUMB-PHOTO - ERROR ', error)
    });
  }

  // ---------------------------------------------------
  // @ BOT
  // ---------------------------------------------------
  public uploadBotAvatar(file: any, bot_id: string) {
    this.logger.log('[UPLOAD-IMAGE-FB.SERV] - UPLOAD BOT PHOTO - FILE ', file)

    const file_name = 'photo.jpg';
    this.logger.log('[UPLOAD-IMAGE-FB.SERV] - UPLOAD BOT PHOTO - FILE NAME ', file_name);
    const file_metadata = { contentType: file.type };
    this.logger.log('[UPLOAD-IMAGE-FB.SERV] - UPLOAD BOT PHOTO - FILE METADATA ', file_metadata);

    this.logger.log('[UPLOAD-IMAGE-FB.SERV] - UPLOAD BOT PHOTO - BOT ID ', bot_id)

    // Create a root reference
    const storageRef = firebase.storage().ref();
    // this.logger.log('UPLOAD IMAGE SERVICE - STORAGE REFERENCE ', storageRef)

    // Upload file and metadata to the object 'images/mountains.jpg'
    const uploadTask = storageRef.child('profiles/' + bot_id + '/' + file_name).put(file, file_metadata);

    // uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
    //   (snapshot) =>  {
    //     upload.progress = (uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100;
    //     this.logger.log(upload.progress);
    //   },
    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
      (snapshot) => {
        // this.logger.log('SNAPSHOT ', snapshot)
        const progress = (uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100;

        if (progress === 100) {
          // const self = this
          // this.imageExist.next(true);

          this.logger.log('[UPLOAD-IMAGE-FB.SERV] - BOT PROFILE IMAGE UPLOAD COMPLETE ', true)
        }
        this.logger.log('[UPLOAD-IMAGE-FB.SERV] Upload is ' + progress + '% done');
        switch (uploadTask.snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            this.logger.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            this.logger.log('Upload is running');
            break;
        }
      }, (error: any) => {
        this.botImageWasUploaded.next(false);
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        this.logger.error('[UPLOAD-IMAGE-FB.SERV] - BOT PROFILE IMAGE UPLOAD - ERROR ', error)
        switch (error.code) {
          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;
          case 'storage/canceled':
            // User canceled the upload
            break;
          case 'storage/unknown':
            // Unknown error occurred, inspect error.serverResponse
            break;
        }
      }, () => {
        // Upload completed successfully, now we can get the download URL
        const self = this
        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
          self.logger.log('[UPLOAD-IMAGE-FB.SERV] - BOT PROFILE IMAGE UPLOAD - File available at', downloadURL);

          self.botImageWasUploaded.next(true);
        });
      }
    );
  }


  // ---------------------------------------------------
  // @ DELETE BOT PHOTO & THUMB-PHOTO
  // ---------------------------------------------------

  public deleteBotProfileImage(botid) {
    const file_name_photo = 'photo.jpg';
    const file_name_thumb_photo = 'thumb_photo.jpg';
    // Create a root reference
    const storageRef = firebase.storage().ref();
    // const deleteTask = storageRef.child('profiles/' + userid + '/' + file_name)
    const deleteBotPhoto = storageRef.child('profiles/' + botid + '/' + file_name_photo)
    const deleteBotThumbPhoto = storageRef.child('profiles/' + botid + '/' + file_name_thumb_photo)

    // ------------------------------------
    // Delete the file photo
    // ------------------------------------
    deleteBotPhoto.delete().then(() => {
      this.logger.log('[UPLOAD-IMAGE-FB.SERV] - DELETE BOT PHOTO ')


    }).catch((error) => {
      this.logger.error('[UPLOAD-IMAGE-FB.SERV] - DELETE BOT PHOTO - ERROR ', error)
    });


    // ------------------------------------
    // Delete the file thumb_photo
    // ------------------------------------
    deleteBotThumbPhoto.delete().then(() => {
      this.logger.log('[UPLOAD-IMAGE-FB.SERV] - DELETE BOT THUMB-PHOTO ')

    }).catch((error) => {
      this.logger.error('[UPLOAD-IMAGE-FB.SERV] - DELETE BOT THUMB-PHOTO - ERROR ', error)
    });
  }


  uploadLauncherLogoImage(file, projctid) {
    // console.log('[UPLOAD-LAUNCHER-LOGO-FB.SERV] file ', file)
    // console.log('[UPLOAD-LAUNCHER-LOGO-FB.SERV] projctid ', projctid)
    const file_metadata = { contentType: file.type };
    // const file_name = 'launcher_logo.jpg';
    const file_name = 'launcher.jpg';
    // Create a root reference
    const storageRef = firebase.storage().ref();
  
    // const uploadTask = storageRef.child('public/images/' + projctid + '/' + file_name).put(file, file_metadata);
    const uploadTask = storageRef.child('profiles/' + projctid + '/' + file_name).put(file, file_metadata);
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
      (snapshot) => {
        // console.log('[UPLOAD-LAUNCHER-LOGO-FB.SERV] SNAPSHOT ', snapshot)
        const progress = (uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100;

        if (progress === 100) {
          // const self = this
          // this.imageExist.next(true);

          // console.log('[UPLOAD-LAUNCHER-LOGO-FB.SERV] - UPLOAD LAUNCHER-LOGO * COMPLETE *', true)
        }
        this.logger.log('Upload is ' + progress + '% done');
        switch (uploadTask.snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
          // console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            this.logger.log('Upload is running');
            break;
        }
      }, (error: any) => {

        //  this.userImageWasUploaded.next(false);
        this.notify.showToast(this.uploadImageErrorMsg + error, 4, 'report_problem')
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        // console.error('[UPLOAD-LAUNCHER-LOGO-FB.SERV] - UPLOAD LAUNCHER-LOGO - ERROR ', error)
        switch (error.code) {
          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;
          case 'storage/canceled':
            // User canceled the upload
            break;
          case 'storage/unknown':
            // Unknown error occurred, inspect error.serverResponse
            break;
        }
      }, () => {
        // Upload completed successfully, now we can get the download URL
        const self = this
        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
          // self.logger.log('[UPLOAD-LAUNCHER-LOGO-FB.SERV] - UPLOAD LAUNCHER-LOGO - File available at', downloadURL);
          // console.log('[UPLOAD-LAUNCHER-LOGO-FB.SERV] - UPLOAD LAUNCHER-LOGO - File available at', downloadURL);
         self.hasUploadedLauncherLogo$.next(downloadURL);
        });
      }
    );
  }

  deleteCustomLauncherLogo(projctid) {

    const file_name = 'launcher.jpg';
    const file_name_thumb = 'thumb_launcher.jpg';
    // Create a root reference
    const storageRef = firebase.storage().ref();
  
    // const deleteCustomLauncherLogo = storageRef.child('public/images/' + projctid + '/' + file_name)
    // const deleteCustomLauncherLogoThumb = storageRef.child('public/images/' + projctid + '/' + file_name_thumb)

    const deleteCustomLauncherLogo = storageRef.child('profiles/' + projctid + '/' + file_name)
    const deleteCustomLauncherLogoThumb = storageRef.child('profiles/' + projctid + '/' + file_name_thumb)
    // ------------------------------------
    // Delete the file launcher Logo
    // ------------------------------------
    deleteCustomLauncherLogo.delete().then((res) => {
    //  console.log('[UPLOAD-IMAGE-FB.SERV] - DELETE CUSTOM LAUNCHER LOGO RES', res)

     this.hasdeletedLauncherLogo$.next(true);
    }).catch((error) => {
      // console.error('[UPLOAD-IMAGE-FB.SERV] - DELETE CUSTOM LAUNCHER LOGO - ERROR ', error)
    });


    // ------------------------------------
    // Delete the file launcher Logo Thumb
    // ------------------------------------
    deleteCustomLauncherLogoThumb.delete().then((res) => {
      // console.log('[UPLOAD-IMAGE-FB.SERV] - DELETE CUSTOM LAUNCHER LOGO THUMB ', res)

    }).catch((error) => {
      // console.error('[UPLOAD-IMAGE-FB.SERV] -  DELETE CUSTOM LAUNCHER LOGO THUMB - ERROR ', error)
    });
  }


    // ---------------------------------------------------
  // @ Upload image
  // ---------------------------------------------------
  private createGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      // tslint:disable-next-line:no-bitwise
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  public uploadAttachment(userId: string, upload): Promise<any> {
    // console.log('[FIREBASEUploadSERVICE] upload ', upload);
    const that = this;
    const uid = this.createGuid();
    const urlImagesNodeFirebase = '/public/images/' + userId + '/' + uid + '/' + upload.name;
    // console.log('[FIREBASEUploadSERVICE] pushUpload ', urlImagesNodeFirebase, 'file ', upload);

    // Create a root reference
    const storageRef = firebase.storage().ref();
    // console.log('[FIREBASEUploadSERVICE] storageRef', storageRef);

    // Create a reference to 'mountains.jpg'
    const mountainsRef = storageRef.child(urlImagesNodeFirebase);
    // console.log('[FIREBASEUploadSERVICE] mountainsRef ', mountainsRef);

    // const metadata = {};
    const metadata = { name: upload.name, contentType: upload.type, contentDisposition: 'attachment; filename=' + upload.name };
    // console.log('[FIREBASEUploadSERVICE] metadata ', metadata);
    let uploadTask = mountainsRef.put(upload, metadata);

    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed', function progress(snapshot) {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        // console.log('[FIREBASEUploadSERVICE] Upload is ' + progress + '% done');

        // ----------------------------------------------------------------------------------------------------------------------------------------------
        // BehaviorSubject publish the upload progress state - the subscriber is in ion-conversastion-detail.component.ts > listenToUploadFileProgress()
        // ----------------------------------------------------------------------------------------------------------------------------------------------
        that.uploadAttachment$.next(progress);

        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            // console.log('[FIREBASEUploadSERVICE] Upload is paused');

            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            // console.log('[FIREBASEUploadSERVICE] Upload is running');

            break;
        }
      }, function error(error) {
        // Handle unsuccessful uploads
        reject(error)
      }, function complete() {
        // Handle successful uploads on complete
        // console.log('[FIREBASEUploadSERVICE] Upload is complete', upload);

        resolve(uploadTask.snapshot.ref.getDownloadURL())
        // that.BSStateUpload.next({upload: upload});

      });
    })
  }
  // /public/images/608ad02d3a4dc000344ade17/3ea5c718-3b1c-4be9-b8f9-2daf19aeeb9a/gundam.png
  removeUpladedAttachment(currentUserID, fileUID, filename) {
    const storageRef = firebase.storage().ref();
    var ref = storageRef.child('/public/images/' + currentUserID + '/' + fileUID + '/' + filename);

    ref.delete().then(() => {
      // File deleted successfully
      // console.log('[FIREBASEUploadSERVICE]  File deleted successfully ');
      this.attachmentDeleted$.next(true)
    }).catch((error) => {
      // Uh-oh, an error occurred!
      // console.log('[FIREBASEUploadSERVICE]  Uh-oh, an error occurred! ', error);
      this.attachmentDeleted$.next(false)
    });
  }

}
