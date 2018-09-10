import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/storage';
@Injectable()
export class UploadImageService {

  constructor() { }

  public uploadUserAvatar(file: any, user_id: string) {
    console.log('UPLOAD IMAGE SERVICE - FILE ', file)

    const file_name = file.name;
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
        console.log('SNAPSHOT ', snapshot)
        const progress = (uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      }, function (error) {
        console.log('ERROR ', error)
      }, function () {
        // Upload completed successfully, now we can get the download URL


      }
    );
  }

}
