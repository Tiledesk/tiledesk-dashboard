import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import * as firebase from 'firebase/app';
import 'firebase/storage';

@Injectable()
export class UploadImageService {

  public imageExist: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public userImageWasUploaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public botImageWasUploaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public hasDeletedUserPhoto: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  // public imageWasUploaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  constructor() { }

  // ---------------------------------------------------
  // @ UPLOAD USER PHOTO
  // ---------------------------------------------------
  public uploadUserAvatar(file: any, user_id: string) {
    console.log('UPLOAD IMAGE SERVICE - FILE ', file)

    const file_name = 'photo.jpg';
    console.log('UPLOAD IMAGE SERVICE - FILE NAME ', file_name);
    const file_metadata = { contentType: file.type };
    console.log('UPLOAD IMAGE SERVICE - FILE METADATA ', file_metadata);

    console.log('UPLOAD IMAGE SERVICE - CURRENT USER ID ', user_id)

    // Create a root reference
    const storageRef = firebase.storage().ref();
    // console.log('UPLOAD IMAGE SERVICE - STORAGE REFERENCE ', storageRef)

    // Upload file and metadata to the object 'images/mountains.jpg'
    const uploadTask = storageRef.child('profiles/' + user_id + '/' + file_name).put(file, file_metadata);

    // uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
    //   (snapshot) =>  {
    //     upload.progress = (uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100;
    //     console.log(upload.progress);
    //   },
    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
      (snapshot) => {
        // console.log('SNAPSHOT ', snapshot)
        const progress = (uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100;

        if (progress === 100) {
          // const self = this
          // this.imageExist.next(true);

          console.log('=== === UPLOAD-IMG-SERV PUBLISH - USER PROFILE IMAGE UPLOAD COMPLETE ', true)
        }
        console.log('Upload is ' + progress + '% done');
        switch (uploadTask.snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
        }
      }, (error: any) => {

        this.userImageWasUploaded.next(false);
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        console.log('ERROR ', error)
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
          console.log('File available at', downloadURL);

          self.userImageWasUploaded.next(true);
        });
      }
    );
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
      console.log('UPLOAD IMAGE SERVICE - DELETE USER PHOTO ')

      this.hasDeletedUserPhoto.next(true);

    }).catch((error) => {
      console.log('UPLOAD IMAGE SERVICE - DELETE USER PHOTO err ', error)
    });

    // ------------------------------------
    // Delete the file thumb_photo
    // ------------------------------------
    deleteThumbPhoto.delete().then(() => {
      console.log('UPLOAD IMAGE SERVICE - DELETE USER THUMB-PHOTO ')
      // this.userImageWasUploaded.next(false);

    }).catch((error) => {
      console.log('UPLOAD IMAGE SERVICE - DELETE USER THUMB-PHOTO err ', error)
    });
  }

  // ---------------------------------------------------
  // @ BOT
  // ---------------------------------------------------
  public uploadBotAvatar(file: any, bot_id: string) {
    console.log('UPLOAD IMAGE SERVICE - FILE ', file)

    const file_name = 'photo.jpg';
    console.log('UPLOAD BOT IMAGE SERVICE - FILE NAME ', file_name);
    const file_metadata = { contentType: file.type };
    console.log('UPLOAD BOT IMAGE SERVICE - FILE METADATA ', file_metadata);

    console.log('UPLOAD BOT IMAGE SERVICE - CURRENT USER ID ', bot_id)

    // Create a root reference
    const storageRef = firebase.storage().ref();
    // console.log('UPLOAD IMAGE SERVICE - STORAGE REFERENCE ', storageRef)

    // Upload file and metadata to the object 'images/mountains.jpg'
    const uploadTask = storageRef.child('profiles/' + bot_id + '/' + file_name).put(file, file_metadata);

    // uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
    //   (snapshot) =>  {
    //     upload.progress = (uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100;
    //     console.log(upload.progress);
    //   },
    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
      (snapshot) => {
        // console.log('SNAPSHOT ', snapshot)
        const progress = (uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100;

        if (progress === 100) {
          // const self = this
          // this.imageExist.next(true);

          console.log('=== === UPLOAD-IMG-SERV PUBLISH - BOT PROFILE IMAGE UPLOAD COMPLETE ', true)
        }
        console.log('Upload is ' + progress + '% done');
        switch (uploadTask.snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
        }
      }, (error: any) => {
        this.botImageWasUploaded.next(false);
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        console.log('ERROR ', error)
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
          console.log('File available at', downloadURL);

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
      console.log('UPLOAD IMAGE SERVICE - DELETE BOT PHOTO ')


    }).catch((error) => {
      console.log('UPLOAD IMAGE SERVICE - DELETE BOT PHOTO - ERR ', error)
    });
  

   // ------------------------------------
    // Delete the file thumb_photo
    // ------------------------------------
    deleteBotThumbPhoto.delete().then(() => {
      console.log('UPLOAD IMAGE SERVICE - DELETE BOT THUMB-PHOTO ')

    }).catch((error) => {
      console.log('UPLOAD IMAGE SERVICE - DELETE BOT THUMB-PHOTO - ERR ', error)
    });
  }

}
