import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';

// USED FOR go back last page
import { Location } from '@angular/common';
import { Project } from '../models/project-model';
import { UsersService } from '../services/users.service';
import { UploadImageService } from '../services/upload-image.service';

import { NotifyService } from '../core/notify.service';
import * as firebase from 'firebase/app';
import { Router } from '@angular/router';
import { AppConfigService } from '../services/app-config.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  user: any;
  project: Project;
  userFirstname: string;
  userLastname: string;
  userEmail: string;
  userId: string;
  displayModalUpdatingUser = 'none';
  SHOW_CIRCULAR_SPINNER = false;
  UPDATE_USER_ERROR = false;
  showSpinner = true;
  firstnameCurrentValue: string;
  lastnameCurrentValue: string;
  HAS_EDIT_FIRSTNAME = false;
  HAS_EDIT_LASTNAME = false;
  emailverified: boolean;
  projectId: string;
  userProfileImageExist: boolean;
  userImageHasBeenUploaded: boolean;
  userProfileImageurl: string;
  timeStamp: any;

  storageBucket: string;
  showSpinnerInUploadImageBtn = false;

  constructor(
    public auth: AuthService,
    private _location: Location,
    private usersService: UsersService,
    public notify: NotifyService,
    private router: Router,
    private uploadImageService: UploadImageService,
    public appConfigService: AppConfigService
  ) { }

  ngOnInit() {

    this.getLoggedUser();
    this.getStorageBucket();
    this.getCurrentProject();

    this.checkUserImageUploadIsComplete()
    // used when the page is refreshed
    this.checkUserImageExist();
  }

  getStorageBucket() {
    const firebase_conf = this.appConfigService.getConfig().firebase;
    this.storageBucket = firebase_conf['storageBucket'];
    console.log('STORAGE-BUCKET User profile ', this.storageBucket)
  }

  upload(event) {
    this.showSpinnerInUploadImageBtn = true;
    const file = event.target.files[0]
    this.uploadImageService.uploadUserAvatar(file, this.userId)
  }

  checkUserImageExist() {
    this.usersService.userProfileImageExist.subscribe((image_exist) => {
      console.log('PROFILE IMAGE (USER-PROFILE ) - USER PROFILE IMAGE EXIST ? ', image_exist);
      this.userProfileImageExist = image_exist;
      if (this.storageBucket && this.userProfileImageExist === true) {
        console.log('PROFILE IMAGE (USER-PROFILE ) - USER PROFILE IMAGE EXIST - setImageProfileUrl ');
        this.setImageProfileUrl(this.storageBucket)
      }
    });
  }
  checkUserImageUploadIsComplete() {
    this.uploadImageService.imageExist.subscribe((image_exist) => {
      console.log('PROFILE IMAGE - IMAGE UPLOADING IS COMPLETE ? ', image_exist);
      this.userImageHasBeenUploaded = image_exist;
      if (this.storageBucket && this.userImageHasBeenUploaded === true) {

        this.showSpinnerInUploadImageBtn = false;

        console.log('PROFILE IMAGE (USER-PROFILE ) - IMAGE UPLOADING IS COMPLETE - BUILD userProfileImageurl ');
        
        this.setImageProfileUrl(this.storageBucket)
      }
    });
  }

  setImageProfileUrl(storageBucket) {
    this.userProfileImageurl = 'https://firebasestorage.googleapis.com/v0/b/' + storageBucket + '/o/profiles%2F' + this.userId + '%2Fphoto.jpg?alt=media';
    // console.log('PROFILE IMAGE (USER-PROFILE ) - userProfileImageurl ', this.userProfileImageurl);
    this.timeStamp = (new Date()).getTime();
  }

  getUserProfileImage() {
    if (this.timeStamp) {
      // console.log('PROFILE IMAGE (USER-PROFILE ) - getUserProfileImage ', this.userProfileImageurl);
      // setTimeout(() => {
        return this.userProfileImageurl + '&' + this.timeStamp;
      // }, 200);
      
    }

    return this.userProfileImageurl
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project

      if (this.project) {
        this.projectId = project._id
        console.log('00 -> USER PROFILE project from AUTH service subscription  ', project)
      } else {
        console.log('00 -> USER PROFILE project from AUTH service subscription ? ', project)
        this.selectSidebar();
      }
    });
  }

  // hides the sidebar if the user views his profile but has not yet selected a project
  selectSidebar() {
    const elemAppSidebar = <HTMLElement>document.querySelector('app-sidebar');
    console.log('USER PROFILE  elemAppSidebar ', elemAppSidebar)
    elemAppSidebar.setAttribute('style', 'display:none;');

    const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    console.log('USER PROFILE  elemMainPanel ', elemMainPanel)
    elemMainPanel.setAttribute('style', 'width:100% !important; overflow-x: hidden !important;');
  }

  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      console.log('==> USER GET IN USER PROFILE ', user)
      // tslint:disable-next-line:no-debugger
      // debugger
      if (user) {
        this.user = user;

        this.userFirstname = user.firstname;
        this.userLastname = user.lastname;
        this.userId = user._id;
        this.userEmail = user.email;

        /// ===== CHECK USER PROFILE IMAGE ===== 
        // this.verifyUserProfileImageOnStorage(this.userId);

        this.firstnameCurrentValue = user.firstname;
        this.lastnameCurrentValue = user.lastname;
        this.emailverified = user.emailverified;
        console.log('EMAIL VERIFIED ', this.emailverified)
        this.showSpinner = false;
      }

    }, (error) => {
      console.log('==> USER GET IN USER PROFILE', error);
      this.showSpinner = false;
    });
  }

  // verifyUserProfileImageOnStorage(user_id) {
  //   // tslint:disable-next-line:max-line-length
  //   const url = 'https://firebasestorage.googleapis.com/v0/b/{{storageBucket}}/o/profiles%2F' + user_id + '%2Fphoto.jpg?alt=media';
  //   const self = this;
  //   this.verifyImageURL(url, function (imageExists) {


  //     if (imageExists === true) {
  //       // alert('Image Exists');
  //       console.log('=== === USER PROFILE IMAGE EXIST ', imageExists)
  //       self.userProfileImageExist = true;
  //     } else {
  //       // alert('Image does not Exist');
  //       console.log('=== === USER PROFILE IMAGE EXIST ', imageExists)
  //       self.userProfileImageExist = false;
  //     }
  //   });
  // }


  // verifyImageURL(image_url, callBack) {
  //   const img = new Image();
  //   img.src = image_url;
  //   img.onload = function () {
  //     callBack(true);
  //   };
  //   img.onerror = function () {
  //     callBack(false);
  //   };
  // }

  onEditFirstname(updatedFirstname) {
    console.log('==> firstname previous value ', this.firstnameCurrentValue);
    console.log('==> firstname updated value', updatedFirstname);
    if (this.firstnameCurrentValue !== updatedFirstname) {
      this.HAS_EDIT_FIRSTNAME = true;
      console.log('HAS CHANGED FIRSTNAME: ', this.HAS_EDIT_FIRSTNAME);
    } else {
      this.HAS_EDIT_FIRSTNAME = false;
      console.log('HAS CHANGED FIRSTNAME: ', this.HAS_EDIT_FIRSTNAME);
    }
  }

  onEditLastname(updatedLastname) {
    console.log('==> lastname previous value ', this.lastnameCurrentValue);
    console.log('==> lastname updated value', updatedLastname);
    if (this.lastnameCurrentValue !== updatedLastname) {
      this.HAS_EDIT_LASTNAME = true;
      console.log('HAS CHANGED LASTNAME: ', this.HAS_EDIT_LASTNAME);
    } else {
      this.HAS_EDIT_LASTNAME = false;
      console.log('HAS CHANGED LASTNAME: ', this.HAS_EDIT_LASTNAME);
    }
  }

  goBack() {
    this._location.back();
  }

  updateCurrentUserFirstnameLastname() {
    this.displayModalUpdatingUser = 'block';
    this.SHOW_CIRCULAR_SPINNER = true;

    console.log('»» »» »» WHEN CLICK UPDATE - USER FIRST NAME ', this.userFirstname);
    console.log('»» »» »» WHEN CLICK UPDATE - USER LAST NAME ', this.userLastname);
    this.usersService.updateCurrentUserLastnameFirstname(this.userFirstname, this.userLastname, (response) => {

      console.log('»»»» CALLBACK RESPONSE ', response)
      if (response === 'user successfully updated on firebase') {

        this.SHOW_CIRCULAR_SPINNER = false;
        this.UPDATE_USER_ERROR = false;
        // =========== NOTIFY SUCCESS===========
        this.notify.showNotification('your profile has been successfully updated', 2, 'done');

      } else if (response === 'error') {
        this.SHOW_CIRCULAR_SPINNER = false;
        this.UPDATE_USER_ERROR = true;
        // =========== NOTIFY ERROR ===========
        this.notify.showNotification('An error has occurred updating your profile', 4, 'report_problem')
      }
    });
    // this.notify.showNotification()
    // this.displayModalUpdatingUser = 'block'
  }

  closeModalUpdatingUser() {
    this.displayModalUpdatingUser = 'none';
  }

  closeModalUpdatingUserHandler() {
    this.displayModalUpdatingUser = 'none';
    this.HAS_EDIT_FIRSTNAME = false;
    this.HAS_EDIT_LASTNAME = false;
  }

  goToChangePsw() {
    console.log('»» GO TO CHANGE PSW - PROJECT ID ', this.projectId)
    if (this.projectId === undefined) {
      this.router.navigate(['user/' + this.userId + '/password/change']);
    } else {
      this.router.navigate(['project/' + this.projectId + '/user/' + this.userId + '/password/change']);
    }
  }




  resendVerificationEmail() {
    this.usersService.resendVerifyEmail().subscribe((res) => {


      console.log('RESEND VERIFY EMAIL - RESPONSE ', res);
      const res_success = res['success'];
      console.log('RESEND VERIFY EMAIL - RESPONSE SUCCESS ', res_success);
      if (res_success === true) {
        // =========== NOTIFY SUCCESS===========
        this.notify.showResendingVerifyEmailNotification(this.userEmail);
      }
    },
      (error) => {
        console.log('RESEND VERIFY EMAIL - ERROR ', error);
        const error_body = JSON.parse(error._body);
        console.log('RESEND VERIFY EMAIL - ERROR BODY', error_body);
        if (error_body['success'] === false) {
          this.notify.showNotification('An error has occurred sending verification link', 4, 'report_problem')
        }
      },
      () => {
        console.log('RESEND VERIFY EMAIL * COMPLETE *');
      });
  }
}
