import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

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

}
