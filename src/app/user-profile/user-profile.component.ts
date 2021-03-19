import { Component, OnInit, ViewChild } from '@angular/core';
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
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { TranslateService } from '@ngx-translate/core';

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
  userRole: string;
  profilePhotoWasUploaded: string;

  // used to unsuscribe from behaviour subject
  private unsubscribe$: Subject<any> = new Subject<any>();
  
  @ViewChild('fileInputUserProfileImage') fileInputUserProfileImage: any;
  
  constructor(
    public auth: AuthService,
    private _location: Location,
    private usersService: UsersService,
    public notify: NotifyService,
    private router: Router,
    private uploadImageService: UploadImageService,
    public appConfigService: AppConfigService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {

    this.getLoggedUser();
    this.getStorageBucket();
    this.getCurrentProject();

    this.checkUserImageUploadIsComplete()
    // used when the page is refreshed
    this.checkUserImageExist();
    this.getProjectUserRole();

    this.translateStrings()
  }

  translateStrings() {
    this.translate.get('YourProfilePhotoHasBeenUploadedSuccessfully')
    .subscribe((text: string) => {

      this.profilePhotoWasUploaded = text;
    
    });
  }

  getProjectUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user_role) => {
        console.log('% »»» WebSocketJs WF +++++ ws-requests--- navbar - USER ROLE ', user_role);
        if (user_role) {        
            // this.userRole = user_role

            this.translate.get(user_role)
            .subscribe((text: string) => {
              this.userRole = text;
              
            });
        }
      });
  }

  getStorageBucket() {
    const firebase_conf = this.appConfigService.getConfig().firebase;
    this.storageBucket = firebase_conf['storageBucket'];
    console.log('STORAGE-BUCKET User profile ', this.storageBucket)
  }

  upload(event) {
    console.log('PROFILE IMAGE (USER-PROFILE ) upload')
    this.showSpinnerInUploadImageBtn = true;
    const file = event.target.files[0]
    this.uploadImageService.uploadUserAvatar(file, this.userId)
    this.fileInputUserProfileImage.nativeElement.value = '';
  }

  deleteUserProfileImage() {
    // const file = event.target.files[0]
    console.log('PROFILE IMAGE (USER-PROFILE ) deleteUserProfileImage')
    this.uploadImageService.deleteUserProfileImage(this.userId);

    const delete_user_image_btn = <HTMLElement>document.querySelector('.delete-user-image');
    delete_user_image_btn.blur();
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
    this.uploadImageService.userImageWasUploaded.subscribe((image_exist) => {
      console.log('PROFILE IMAGE - IMAGE UPLOADING IS COMPLETE ? ', image_exist);

      // this.notify.showWidgetStyleUpdateNotification(this.profilePhotoWasUploaded, 2, 'done');
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
      // console.log('PROFILE IMAGE (USER-IMG IN USER-LOG) - getUserProfileImage ', this.userProfileImageurl);
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



  updateCurrentUserFirstnameLastname() {
    this.displayModalUpdatingUser = 'block';
    this.SHOW_CIRCULAR_SPINNER = true;

    console.log('»» »» »» UPDATE CURRENT USER - WHEN CLICK UPDATE - USER FIRST NAME ', this.userFirstname);
    console.log('»» »» »» UPDATE CURRENT USER - WHEN CLICK UPDATE - USER LAST NAME ', this.userLastname);
    this.usersService.updateCurrentUserLastnameFirstname(this.userFirstname, this.userLastname, (response) => {

      console.log('»»»» CALLBACK RESPONSE ', response)
      if (response === 'success') {

        this.SHOW_CIRCULAR_SPINNER = false;
        this.UPDATE_USER_ERROR = false;
        console.log('»» »» »» UPDATE CURRENT USER  ', this.SHOW_CIRCULAR_SPINNER);
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


  goBack() {
    this._location.back();
  }

  goToChangePsw() {
    console.log('»» GO TO CHANGE PSW - PROJECT ID ', this.projectId)
    if (this.projectId === undefined) {
      this.router.navigate(['user/' + this.userId + '/password/change']);
    } else {
      this.router.navigate(['project/' + this.projectId + '/user/' + this.userId + '/password/change']);
    }
  }

  goToAccountSettings() {
    console.log('»» GO TO USER  PROFILE SETTINGS - PROJECT ID ', this.projectId)
    if (this.projectId === undefined) {
      this.router.navigate(['user/' + this.userId + '/settings']);
    } else {
      this.router.navigate(['project/' + this.projectId + '/user/' + this.userId + '/settings']);
    }
  }

  goToNotificationSettings() {
    console.log('»» GO TO USER  NOTIFICATION SETTINGS - PROJECT ID ', this.projectId)
    if (this.projectId === undefined) {
      this.router.navigate(['user/' + this.userId + '/notifications']);
    } else {
      this.router.navigate(['project/' + this.projectId + '/user/' + this.userId + '/notifications']);
    }
  }
}
