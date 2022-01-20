import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../core/auth.service';

// USED FOR go back last page
import { Location } from '@angular/common';
import { Project } from '../models/project-model';
import { UsersService } from '../services/users.service';
import { UploadImageService } from '../services/upload-image.service';
import { UploadImageNativeService } from '../services/upload-image-native.service';
import { NotifyService } from '../core/notify.service';
import { Router } from '@angular/router';
import { AppConfigService } from '../services/app-config.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '../services/logger/logger.service';


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
  baseUrl: string;
  showSpinnerInUploadImageBtn = false;
  userRole: string;
  profilePhotoWasUploaded: string;
  browser_lang: string;
  selected_dashboard_language: any
  // used to unsuscribe from behaviour subject
  private unsubscribe$: Subject<any> = new Subject<any>();

  @ViewChild('fileInputUserProfileImage') fileInputUserProfileImage: any;


  dashboard_languages = [
    {
      id: 1,
      name: 'it',
      avatar: 'assets/img/language_flag/it.png'
    },
    {
      id: 2,
      name: 'en',
      avatar: 'assets/img/language_flag/en.png'
    },
    {
      id: 3,
      name: 'de',
      avatar: 'assets/img/language_flag/de.png'
    },
    {
      id: 4,
      name: 'es',
      avatar: 'assets/img/language_flag/es.png'
    },
  ];


  constructor(
    public auth: AuthService,
    private _location: Location,
    private usersService: UsersService,
    public notify: NotifyService,
    private router: Router,
    private uploadImageService: UploadImageService,
    private uploadImageNativeService: UploadImageNativeService,
    public appConfigService: AppConfigService,
    private translate: TranslateService,
    private logger: LoggerService
  ) { }

  ngOnInit() {

    this.getLoggedUser();
    this.getProfileImageStorage();
    this.getCurrentProject();

    this.checkUserImageUploadIsComplete()
    // used when the page is refreshed
    this.checkUserImageExist();
    this.getProjectUserRole();

    this.translateStrings();
    this.getBrowserLanguage();
  }

  getBrowserLanguage() {
    this.browser_lang = this.translate.getBrowserLang();
    console.log('[USER-PROFILE] - browser_lang ', this.browser_lang)
  }

  onSelectDsbrdLang(selectedLanguage) {
    this.logger.log('[USER-PROFILE] onChangeSelectedPriority selectedLanguage ', selectedLanguage)
    this.selected_dashboard_language = selectedLanguage;
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
        this.logger.log('[USER-PROFILE] - USER ROLE ', user_role);
        if (user_role) {
          // this.userRole = user_role

          this.translate.get(user_role)
            .subscribe((text: string) => {
              this.userRole = text;
            });
        }
      });
  }

  getProfileImageStorage() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[USER-PROFILE] - IMAGE STORAGE ', this.storageBucket, 'usecase Firebase')
    } else {
      this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;

      this.logger.log('[USER-PROFILE] - IMAGE STORAGE ', this.baseUrl, 'usecase Native')
    }
  }

  upload(event) {
    this.logger.log('[USER-PROFILE] IMAGE upload')
    this.showSpinnerInUploadImageBtn = true;
    const file = event.target.files[0]
    // Firebase upload
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.uploadImageService.uploadUserAvatar(file, this.userId)

    } else {
      // Native upload
      this.logger.log('[USER-PROFILE] IMAGE upload with native service')
      // const userImageExist = this.usersService.userProfileImageExist.getValue()
      // this.logger.log('USER PROFILE IMAGE (USER-PROFILE ) upload with native service userImageExist ', userImageExist);

      this.uploadImageNativeService.uploadUserPhotoProfile_Native(file).subscribe((downoloadurl) => {
        this.logger.log('[USER-PROFILE] IMAGE upload with native service - RES downoloadurl', downoloadurl);

        this.userProfileImageurl = downoloadurl
        this.timeStamp = (new Date()).getTime();
      }, (error) => {

        this.logger.error('[USER-PROFILE] IMAGE upload with native service - ERR ', error);
      })

    }
    this.fileInputUserProfileImage.nativeElement.value = '';
  }

  checkUserImageUploadIsComplete() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.uploadImageService.userImageWasUploaded.subscribe((image_exist) => {
        this.logger.log('[USER-PROFILE] - IMAGE UPLOADING IS COMPLETE ?  ', image_exist, '(usecase Firebase)');

        // this.notify.showWidgetStyleUpdateNotification(this.profilePhotoWasUploaded, 2, 'done');
        this.userImageHasBeenUploaded = image_exist;
        if (this.storageBucket && this.userImageHasBeenUploaded === true) {

          this.showSpinnerInUploadImageBtn = false;

          this.logger.log('[USER-PROFILE] - IMAGE UPLOADING IS COMPLETE - BUILD userProfileImageurl ');
          this.setImageProfileUrl(this.storageBucket)
        }
      });
    } else {
      // Native upload
      this.uploadImageNativeService.userImageWasUploaded_Native.subscribe((image_exist) => {
        this.logger.log('[USER-PROFILE] - IMAGE UPLOADING IS COMPLETE ? ', image_exist, '(usecase Native)');

        this.userImageHasBeenUploaded = image_exist;
        this.showSpinnerInUploadImageBtn = false;
        // here "setImageProfileUrl" is missing because in the "upload" method there is the subscription to the downoload 
        // url published by the BehaviourSubject in the service "upload-image-native"
      })
    }
  }

  checkUserImageExist() {
    this.usersService.userProfileImageExist.subscribe((image_exist) => {
      this.logger.log('[USER-PROFILE] PROFILE IMAGE - USER PROFILE IMAGE EXIST ? ', image_exist);
      this.userProfileImageExist = image_exist;

      if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
        if (this.storageBucket && this.userProfileImageExist === true) {
          this.logger.log('[USER-PROFILE] PROFILE IMAGE - USER PROFILE IMAGE EXIST - setImageProfileUrl ');
          this.setImageProfileUrl(this.storageBucket)
        }
      } else {
        if (this.baseUrl && this.userProfileImageExist === true) {
          this.setImageProfileUrl_Native(this.baseUrl)
        }
      }
    });
  }

  setImageProfileUrl_Native(baseUrl) {
    this.userProfileImageurl = baseUrl + 'images?path=uploads%2Fusers%2F' + this.userId + '%2Fimages%2Fthumbnails_200_200-photo.jpg';
    // this.logger.log('PROFILE IMAGE (USER-PROFILE ) - userProfileImageurl ', this.userProfileImageurl);
    this.timeStamp = (new Date()).getTime();
  }

  setImageProfileUrl(storageBucket) {
    this.userProfileImageurl = 'https://firebasestorage.googleapis.com/v0/b/' + storageBucket + '/o/profiles%2F' + this.userId + '%2Fphoto.jpg?alt=media';
    // this.logger.log('PROFILE IMAGE (USER-PROFILE ) - userProfileImageurl ', this.userProfileImageurl);
    this.timeStamp = (new Date()).getTime();
  }

  deleteUserProfileImage() {
    this.logger.log('[USER-PROFILE] - deleteUserProfileImage')

    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.logger.log('[USER-PROFILE] IMAGE deleteUserProfileImage with firebase service')
      this.uploadImageService.deleteUserProfileImage(this.userId);
    } else {
      this.logger.log('[USER-PROFILE] IMAGE deleteUserProfileImage with native service')
      this.uploadImageNativeService.deletePhotoProfile_Native(this.userId, 'user');
    }

    this.userProfileImageExist = false;
    this.userImageHasBeenUploaded = false

    const delete_user_image_btn = <HTMLElement>document.querySelector('.delete-user-image');
    delete_user_image_btn.blur();
  }

  getUserProfileImage() {
    if (this.timeStamp) {
      // this.logger.log('PROFILE IMAGE (USER-IMG IN USER-LOG) - getUserProfileImage ', this.userProfileImageurl);
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
        this.logger.log('[USER-PROFILE] - GET CURRENT PROJECT project ', project)
      } else {
        this.logger.log('[USER-PROFILE] - GET CURRENT PROJECT project ', project , ' - HIDE SIDEBAR')
        this.selectSidebar();
      }
    });
  }

  // hides the sidebar if the user views his profile but has not yet selected a project
  selectSidebar() {
    const elemAppSidebar = <HTMLElement>document.querySelector('app-sidebar');
    this.logger.log('[USER-PROFILE]  elemAppSidebar ', elemAppSidebar)
    elemAppSidebar.setAttribute('style', 'display:none;');

    const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    this.logger.log('[USER-PROFILE] elemMainPanel ', elemMainPanel)
    elemMainPanel.setAttribute('style', 'width:100% !important; overflow-x: hidden !important;');
  }

  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      this.logger.log('[USER-PROFILE] - USER GET IN USER PROFILE - USER', user)
    
      if (user) {
        this.user = user;
        this.userFirstname = user.firstname;
        this.userLastname = user.lastname;
        this.userId = user._id;
        this.userEmail = user.email;
        this.firstnameCurrentValue = user.firstname;
        this.lastnameCurrentValue = user.lastname;
        this.emailverified = user.emailverified;
        this.logger.log('[USER-PROFILE] - USER GET IN USER PROFILE - EMAIL VERIFIED ', this.emailverified)
        this.showSpinner = false;
      }

    }, (error) => {
      this.logger.error('[USER-PROFILE] - USER GET IN USER PROFILE - ERROR', error);
      this.showSpinner = false;
    }, () => {
      this.logger.log('[USER-PROFILE] - USER GET IN USER PROFILE * COMPLETE *');
    });
  }


  onEditFirstname(updatedFirstname) {
    this.logger.log('[USER-PROFILE] - onEditFirstname ==> firstname previous value ', this.firstnameCurrentValue);
    this.logger.log('[USER-PROFILE] - onEditFirstname ==> firstname updated value', updatedFirstname);
    if (this.firstnameCurrentValue !== updatedFirstname) {
      this.HAS_EDIT_FIRSTNAME = true;
      this.logger.log('[USER-PROFILE] - onEditFirstname HAS CHANGED FIRSTNAME: ', this.HAS_EDIT_FIRSTNAME);
    } else {
      this.HAS_EDIT_FIRSTNAME = false;
      this.logger.log('[USER-PROFILE] - onEditFirstname HAS CHANGED FIRSTNAME: ', this.HAS_EDIT_FIRSTNAME);
    }
  }

  onEditLastname(updatedLastname) {
    this.logger.log('[USER-PROFILE] - onEditLastname ==> lastname previous value ', this.lastnameCurrentValue);
    this.logger.log('[USER-PROFILE] - onEditLastname  ==> lastname updated value', updatedLastname);
    if (this.lastnameCurrentValue !== updatedLastname) {
      this.HAS_EDIT_LASTNAME = true;
      this.logger.log('[USER-PROFILE] - onEditLastname HAS CHANGED LASTNAME: ', this.HAS_EDIT_LASTNAME);
    } else {
      this.HAS_EDIT_LASTNAME = false;
      this.logger.log('[USER-PROFILE] - onEditLastname HAS CHANGED LASTNAME: ', this.HAS_EDIT_LASTNAME);
    }
  }

  updateCurrentUserFirstnameLastname() {
    this.displayModalUpdatingUser = 'block';
    this.SHOW_CIRCULAR_SPINNER = true;

    this.logger.log('[USER-PROFILE] - UPDATE CURRENT USER - WHEN CLICK UPDATE - USER FIRST NAME ', this.userFirstname);
    this.logger.log('[USER-PROFILE] - UPDATE CURRENT USER - WHEN CLICK UPDATE - USER LAST NAME ', this.userLastname);
    this.usersService.updateCurrentUserLastnameFirstname(this.userFirstname, this.userLastname, (response) => {

      this.logger.log('[USER-PROFILE] - CALLBACK RESPONSE ', response)
      if (response === 'success') {

        this.SHOW_CIRCULAR_SPINNER = false;
        this.UPDATE_USER_ERROR = false;
        this.logger.log('[USER-PROFILE] - UPDATE CURRENT USER  ', this.SHOW_CIRCULAR_SPINNER);
        // =========== NOTIFY SUCCESS===========
        this.notify.showNotification('your profile has been successfully updated', 2, 'done');

      } else if (response === 'error') {
        this.SHOW_CIRCULAR_SPINNER = false;
        this.UPDATE_USER_ERROR = true;
        // =========== NOTIFY ERROR ===========
        this.notify.showNotification('An error has occurred updating your profile', 4, 'report_problem')
      }
    });
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

      this.logger.log('[USER-PROFILE] - RESEND VERIFY EMAIL - RESPONSE ', res);
      const res_success = res['success'];
      this.logger.log('[USER-PROFILE] - RESEND VERIFY EMAIL - RESPONSE SUCCESS ', res_success);
      if (res_success === true) {
        // =========== NOTIFY SUCCESS===========
        this.notify.showResendingVerifyEmailNotification(this.userEmail);
      }
    }, (error) => {
        this.logger.error('[USER-PROFILE] - RESEND VERIFY EMAIL - ERROR ', error);
        const error_body = JSON.parse(error._body);
        this.logger.error('[USER-PROFILE] - RESEND VERIFY EMAIL - ERROR BODY', error_body);
        if (error_body['success'] === false) {
          this.notify.showNotification('An error has occurred sending verification link', 4, 'report_problem')
        }
      }, () => {
        this.logger.log('[USER-PROFILE] - RESEND VERIFY EMAIL * COMPLETE *');
      });
  }


  goBack() {
    this._location.back();
  }

  goToChangePsw() {
    this.logger.log('[USER-PROFILE] - GO TO CHANGE PSW - PROJECT ID ', this.projectId)
    if (this.projectId === undefined) {
      this.router.navigate(['user/' + this.userId + '/password/change']);
    } else {
      this.router.navigate(['project/' + this.projectId + '/user/' + this.userId + '/password/change']);
    }
  }

  goToAccountSettings() {
    this.logger.log('[USER-PROFILE] - GO TO USER  PROFILE SETTINGS - PROJECT ID ', this.projectId)
    if (this.projectId === undefined) {
      this.router.navigate(['user/' + this.userId + '/settings']);
    } else {
      this.router.navigate(['project/' + this.projectId + '/user/' + this.userId + '/settings']);
    }
  }

  goToNotificationSettings() {
    this.logger.log('[USER-PROFILE] - GO TO USER  NOTIFICATION SETTINGS - PROJECT ID ', this.projectId)
    if (this.projectId === undefined) {
      this.router.navigate(['user/' + this.userId + '/notifications']);
    } else {
      this.router.navigate(['project/' + this.projectId + '/user/' + this.userId + '/notifications']);
    }
  }
}
