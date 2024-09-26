import { Component, OnInit, ElementRef, HostListener, OnDestroy, AfterContentInit } from '@angular/core';
import { ProjectService } from '../services/project.service';
import { Project } from '../models/project-model';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { isDevMode } from '@angular/core';
import { UsersService } from '../services/users.service';
import { UploadImageService } from '../services/upload-image.service';
import { UploadImageNativeService } from '../services/upload-image-native.service';
import { Subscription } from 'rxjs'
import { AppConfigService } from '../services/app-config.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// import brand from 'assets/brand/brand.json';
import { BrandService } from '../services/brand.service';
import { WsRequestsService } from '../services/websocket/ws-requests.service';
import { LoggerService } from '../services/logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { APP_SUMO_PLAN_NAME, PLAN_NAME, tranlatedLanguage } from 'app/utils/util';
@Component({
  selector: 'projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit, AfterContentInit, OnDestroy {

  // pageBackgroundColor = brand.recent_project_page.background_color;
  // tparams = brand;
  PLAN_NAME = PLAN_NAME
  APP_SUMO_PLAN_NAME = APP_SUMO_PLAN_NAME
  tparams: any;
  companyLogo: string;
  companyLogo_width: string;
  companyLogo_height: string;
  companyLogo_top: string;
  companyLogo_left: string;
  company_brand_color: string;
  projects: Project[];

  id_project: string;
  project_name: string;

  // set to none the property display of the modal
  displayCreateModal = 'none';
  displayInfoModal = 'none';

  projectName_toDelete: string;
  id_toDelete: string;

  user: any;
  private toggleButton: any;
  private sidebarVisible: boolean;
  newInnerWidth: any;
  showSpinner = true;

  SHOW_CIRCULAR_SPINNER = false;
  displayLogoutModal = 'none';

  APP_IS_DEV_MODE: boolean;
  userProfileImageExist: boolean;
  userImageHasBeenUploaded: boolean;
  userProfileImageurl: string;
  timeStamp: any;
  myAvailabilityCount: number;
  subscription: Subscription;

  storageBucket: string;
  baseUrl: string;

  currentUserId: string
  public_Key: string;
  MT: boolean;
  project_plan_badge: boolean;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;
  flag_url: string;
  dsbrd_lang: string;
  tlangparams: any
  browserLang: string;
  languageNotSupported: boolean = false
  private unsubscribe$: Subject<any> = new Subject<any>();
  prjct_profile_name: string;
  DISPLAY_PROJECT_ID: boolean = false;
  public logoutBtnVisible: boolean;
  constructor(
    private projectService: ProjectService,
    private router: Router,
    private auth: AuthService,
    private element: ElementRef,
    private usersService: UsersService,
    private uploadImageService: UploadImageService,
    private uploadImageNativeService: UploadImageNativeService,
    public appConfigService: AppConfigService,
    public brandService: BrandService,
    public wsRequestsService: WsRequestsService,
    private logger: LoggerService,
    private translate: TranslateService,
    private route: ActivatedRoute
  ) {
    const brand = brandService.getBrand();
    this.logoutBtnVisible = brand['LOGOUT_ENABLED'];
    this.tparams = brand;
    this.companyLogo = brand['BASE_LOGO'];
    this.companyLogo_width = brand['recent_project_page']['company_logo_width'];
    this.companyLogo_height = brand['recent_project_page']['company_logo_height'];
    this.companyLogo_top = brand['recent_project_page']['company_logo_top'];
    this.companyLogo_left = brand['recent_project_page']['company_logo_left'];


    this.company_brand_color = brand['BRAND_PRIMARY_COLOR'];
    // this.logger.log('[PROJECTS] company_brand_color' ,this.company_brand_color)

    this.logger.log('[PROJECTS] - IS DEV MODE ', isDevMode());
    this.APP_IS_DEV_MODE = isDevMode()

  }

  ngOnInit() {
    const navbar: HTMLElement = this.element.nativeElement;
    this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
    // this.getUploadEgine();
    this.getProjectsAndSaveInStorage();
    this.getLoggedUserAndCheckProfilePhoto();

    // this.checkUserImageUploadIsComplete();
    // this.checkUserImageExist();

    // this.subscribeToLogoutPressedinSidebarNavMobilePrjctUndefined();
    // this.getStorageBucket();
    this.getOSCODE();
    this.listenHasDeleteUserProfileImage();
    this.getRouteParams();
  }

  ngAfterContentInit(): void {
    if (this.company_brand_color) {
      this.element.nativeElement.querySelector('.project_background').style.setProperty('--brandColor', this.company_brand_color)
      // this.logger.log('[PROJECTS] project_background', this.element.nativeElement.querySelector('.project_background')) 
      // this.element.nativeElement.querySelector('#create-prjct-card > .card-add-project-icon').style.setProperty('--brandColor' , this.company_brand_color)
      // this.element.nativeElement.querySelector('#create-prjct-card > .card-add-project-text').style.setProperty('--brandColor' , this.company_brand_color)
    }
  }

  ngOnDestroy() {
    if (this.projects) {
      this.projects.forEach(project => {
        if (project.id_project.status !== 0) {
          this.usersService.unsubsToWS_CurrentUser_allProject(project.id_project._id, project._id)
        }
      });

      this.unsubscribe$.next();
      this.unsubscribe$.complete();
    }

    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  getRouteParams() {
    this.route.queryParams.subscribe((params) => {
      this.logger.log('[PROJECTS] - GET ROUTE-PARAMS & APPID - params: ', params)
      if (params.showid) {
        this.logger.log('[PROJECTS] -  GET ROUTE-PARAMS & APPID - params.nk: ', params.showid)
        if (params.showid === 'y') {
          this.DISPLAY_PROJECT_ID = true;
        }
      }
    });
  }

  getLoggedUserAndCheckProfilePhoto() {
    // this.logger.log('window.opener.location ', window.opener.location )

    this.auth.user_bs.subscribe((user) => {
      // this.logger.log('[PROJECTS] - USER  ', user)
      this.user = user;

      if (user) {
        this.currentUserId = user._id;
        this.logger.log('[PROJECTS] - Current USER ID ', this.currentUserId)


        const stored_preferred_lang = localStorage.getItem(this.currentUserId + '_lang')
        // this.logger.log('[PROJECTS] stored_preferred_lang ', stored_preferred_lang)
        if (stored_preferred_lang) {
          this.dsbrd_lang = stored_preferred_lang;
          this.getLangTranslation(this.dsbrd_lang)
          this.flag_url = "assets/img/language_flag/" + stored_preferred_lang + ".png"
          this.translate.use(this.dsbrd_lang);
          // this.logger.log('[PROJECTS] flag_url (from stored_preferred_lang) ', this.flag_url)

          // this.logger.log('[PROJECTS] stored_preferred_lang ', stored_preferred_lang)
        } else {
          this.browserLang = this.translate.getBrowserLang();
          this.dsbrd_lang = this.browserLang;
          this.getLangTranslation(this.dsbrd_lang)
          // this.logger.log('[PROJECTS] - browser_lang ', this.browserLang)
          this.flag_url = "assets/img/language_flag/" + this.browserLang + ".png"
          this.translate.use(this.dsbrd_lang);
          // this.logger.log('[PROJECTS] flag_url (from browser_lang) ', this.flag_url)
        }


        if (!tranlatedLanguage.includes(this.dsbrd_lang)) {
          // this.logger.log('dsbrd_lang', this.dsbrd_lang)
          // this.logger.log('tranlatedLanguage', tranlatedLanguage)
          // this.logger.log('[PROJECTS] - browser_lang includes', tranlatedLanguage.includes(this.dsbrd_lang))

          this.logger.log('[PROJECTS] - browser_lang', this.dsbrd_lang)
          this.flag_url = "assets/img/language_flag/en.png"
          this.languageNotSupported = true;
          // this.logger.log('languageNotSupported', this.languageNotSupported)
        } else {
          this.languageNotSupported = false;
          // this.logger.log('languageNotSupported', this.languageNotSupported)
        }


        if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
          this.UPLOAD_ENGINE_IS_FIREBASE = true
          this.ckeckUserPhotoProfileOnFirebase(user);
        } else {
          this.UPLOAD_ENGINE_IS_FIREBASE = false
          this.ckeckUserPhotoProfileOnNative(user);
        }
      }
    });
  }



  getLangTranslation(dsbrd_lang_code) {
    this.translate.get(dsbrd_lang_code)
      .subscribe((translation: any) => {
        this.logger.log('[PROJECTS] getLangTranslation', translation)
        this.tlangparams = { language_name: translation }
      });
  }

  ckeckUserPhotoProfileOnFirebase(user) {
    const firebase_conf = this.appConfigService.getConfig().firebase;
    this.storageBucket = firebase_conf['storageBucket'];
    this.logger.log('[PROJECTS] STORAGE-BUCKET Projects ', this.storageBucket)

    const imgUrl = "https://firebasestorage.googleapis.com/v0/b/" + this.storageBucket + "/o/profiles%2F" + this.currentUserId + "%2Fphoto.jpg?alt=media"
    this.logger.log('[PROJECTS] - check if exist imgUrl ', imgUrl, '(usecase firebase)');

    this.checkImageExists(imgUrl, (existsImage) => {
      if (existsImage == true) {

        user.hasImage = true;
        this.logger.log('[PROJECTS] - IMAGE EXIST X USER', this.user, '(usecase firebase)');
      }
      else {
        user.hasImage = false;
        this.logger.log('[PROJECTS] - IMAGE NOT EXIST X USER', this.user, '(usecase firebase)');
      }
    });
  }

  ckeckUserPhotoProfileOnNative(user) {
    this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;
    const imgUrl = this.baseUrl + 'images?path=uploads%2Fusers%2F' + this.currentUserId + '%2Fimages%2Fthumbnails_200_200-photo.jpg';
    this.logger.log('[PROJECTS] - check if exist imgUrl ', imgUrl, '(usecase native)');

    this.checkImageExists(imgUrl, (existsImage) => {
      if (existsImage == true) {

        user.hasImage = true;
        this.logger.log('[PROJECTS] - IMAGE EXIST X USER', user, '(usecase native)');
      }
      else {
        user.hasImage = false;
        this.logger.log('[PROJECTS] - IMAGE NOT EXIST X USER', user, '(usecase native)');
      }
    });
  }

  checkImageExists(imageUrl, callBack) {
    var imageData = new Image();
    imageData.onload = function () {
      callBack(true);
    };
    imageData.onerror = function () {
      callBack(false);
    };
    imageData.src = imageUrl;
  }



  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[PROJECTS] AppConfigService getAppConfig public_Key', this.public_Key)
    this.logger.log('[PROJECTS] public_Key', this.public_Key)

    let keys = this.public_Key.split("-");
    this.logger.log('[PROJECTS] PUBLIC-KEY - public_Key keys', keys)

    this.logger.log('[PROJECTS] PUBLIC-KEY - public_Key Arry includes MTT', this.public_Key.includes("MTT"));


    keys.forEach(key => {
      // this.logger.log('NavbarComponent public_Key key', key)
      if (key.includes("MTT")) {
        // this.logger.log('PUBLIC-KEY (PROJECTS-LIST) - key', key);
        let mt = key.split(":");
        // this.logger.log('PUBLIC-KEY (PROJECTS-LIST) - mt key&value', mt);

        if (mt[1] === "F") {
          this.MT = false;
          // this.logger.log('PUBLIC-KEY (PROJECTS-LIST) - mt is', this.MT);
        } else {
          this.MT = true;
          // this.logger.log('PUBLIC-KEY (PROJECTS-LIST) - mt is', this.MT);
        }
      }


      if (key.includes("PPB")) {
        // this.logger.log('PUBLIC-KEY (PROJECTS-LIST) - key', key);
        let ppb = key.split(":");
        // this.logger.log('PUBLIC-KEY (PROJECTS-LIST) - ppb key&value', ppb);

        if (ppb[1] === "F") {
          this.project_plan_badge = false;
          // this.logger.log('PUBLIC-KEY (PROJECTS-LIST) - project plan badge is', this.project_plan_badge);
        } else {
          this.project_plan_badge = true;
          // this.logger.log('PUBLIC-KEY (PROJECTS-LIST) - project plan badge is', this.project_plan_badge);
        }
      }


      if (!this.public_Key.includes("MTT")) {
        // this.logger.log('PUBLIC-KEY (PROJECTS-LIST - key.includes("MTT")', this.public_Key.includes("MTT"));
        this.MT = false;
      }

      if (!this.public_Key.includes("PPB")) {
        // this.logger.log('PUBLIC-KEY (PROJECTS-LIST) - key.includes("PPB")', this.public_Key.includes("PPB"));
        this.project_plan_badge = false;
      }

    });
  }



  listenHasDeleteUserProfileImage() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.uploadImageService.hasDeletedUserPhoto.subscribe((hasDeletedImage) => {
        this.logger.log('[PROJECTS] - LISTEN TO hasDeletedImage ? ', hasDeletedImage, '(usecase Firebase)');
        this.userImageHasBeenUploaded = false
        this.userProfileImageExist = false
      });
    } else {
      this.uploadImageNativeService.hasDeletedUserPhoto.subscribe((hasDeletedImage) => {
        this.logger.log('[PROJECTS] - LISTEN TO hasDeletedImage ?', hasDeletedImage, '(usecase Native)');
        this.userImageHasBeenUploaded = false
        this.userProfileImageExist = false
      });
    }
  }


  // checkUserImageExist() {
  //   this.usersService.userProfileImageExist.subscribe((image_exist) => {
  //     this.logger.log('[PROJECTS] - USER PROFILE EXIST ? ', image_exist);
  //     this.userProfileImageExist = image_exist;

  //     if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
  //       if (this.storageBucket && this.userProfileImageExist === true) {
  //         this.logger.log('[PROJECTS] - USER PROFILE EXIST - BUILD userProfileImageurl');
  //         this.setImageProfileUrl(this.storageBucket)
  //       }
  //     } else {
  //       this.logger.log('[PROJECTS] - USER PROFILE EXIST - BUILD userProfileImageurl (NATIVE)');
  //       if (this.userProfileImageExist === true) {
  //         this.setImageProfileUrl_Native()
  //       }
  //     }
  //   });
  // }


  // checkUserImageUploadIsComplete() {
  //   if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
  //     this.uploadImageService.userImageWasUploaded.subscribe((image_exist) => {
  //       this.logger.log('PROJECTS-LIST - IMAGE UPLOADING IS COMPLETE ? ', image_exist);
  //       this.userImageHasBeenUploaded = image_exist;

  //       if (this.storageBucket && this.userImageHasBeenUploaded === true) {
  //         this.logger.log('PROJECT-COMP - IMAGE UPLOADING IS COMPLETE - BUILD userProfileImageurl ');
  //         this.setImageProfileUrl(this.storageBucket)
  //       }
  //     });
  //   } else {
  //     // NATIVE
  //     this.uploadImageNativeService.userImageWasUploaded_Native.subscribe((image_exist) => {
  //       this.logger.log('[PROJECTS] - USER PROFILE IMAGE - IMAGE UPLOADING IS COMPLETE ? ', image_exist, '(usecase Native)');

  //       this.userImageHasBeenUploaded = image_exist;
  //       this.uploadImageNativeService.userImageDownloadUrl_Native.subscribe((imageUrl) => {
  //         this.userProfileImageurl = imageUrl
  //         this.timeStamp = (new Date()).getTime();
  //       })
  //     })
  //   }
  // }



  // display_loading(project_id) {
  //   const loadingInProjectCardEle = <HTMLElement>document.querySelector('#loading_' + project_id);
  //   this.logger.log('[PROJECTS] !!! GO TO HOME >  display_loading - loadingInProjectCardEle ', loadingInProjectCardEle)
  //   loadingInProjectCardEle.style.color = "red";
  // }
 
  goToHome(
    project_user: any,
    project: any,
    role: string,
    project_id: string,
    project_status: number,
    ) {
    this.logger.log('[PROJECTS] - GO TO HOME - PROJECT ', project)
    
    localStorage.setItem('last_project', JSON.stringify(project_user))
    // window.top.postMessage('hasChangedProject', '*')

    this.logger.log('[PROJECTS] - GO TO HOME - PROJECT status ', project_status)

    project['is_selected'] = true;

    if (project_status === 0) {
      project['is_selected'] = false;
    }

    // const loadingInProjectCardEle = <HTMLElement>document.querySelector('#loading_' + project_id);
    // loadingInProjectCardEle.classList.add("display_loading")
    // this.logger.log('!!! GO TO HOME - exist_class ', loadingInProjectCardEle.classList.contains("display_loading"))

    // const requestIdArrowIconElem = <HTMLElement>document.querySelector('#request_id_arrow_down');
    // requestIdArrowIconElem.classList.add("up");
    if (project_status !== 0) {



      // // WHEN THE USER SELECT A PROJECT ITS ID and NAME IS SEND IN THE AUTH SERVICE THAT PUBLISHES IT
      // const project: Project = {
      //   _id: project_id,
      //   name: project_name,
      //   profile_name: project_profile_name,
      //   trial_expired: project_trial_expired,
      //   trial_days_left: project_trial_days_left,
      //   operatingHours: activeOperatingHours
      // }

      project['role'] = role
      this.auth.projectSelected(project, 'PROJECTS')
      localStorage.setItem(project_id, JSON.stringify(project));
     
      
      const storedProjectJson = localStorage.getItem(project_id);

      if (storedProjectJson === null) {
        this.getProjectFromRemotePublishAndSaveInStorage(project_id, role);
      }
      this.logger.log('[PROJECTS] - GO TO HOME - storedProjectJson ', storedProjectJson)

      localStorage.setItem('project', JSON.stringify(project)); // ?? serve


      this.logger.log('[PROJECTS] - GO TO HOME - PROJECT ', project.id_project)
      setTimeout(() => {
        this.router.navigate([`/project/${project_id}/home`]);
      }, 0);
    }
    /* !!! NO MORE USED - NOW THE ALL PROJECTS ARE SETTED IN THE STORAGE IN getProjectsAndSaveInStorage()
     * SET THE project_id IN THE LOCAL STORAGE
     * WHEN THE PAGE IS RELOADED THE SIDEBAR GET THE PROJECT ID FROM THE LOCAL STORAGE */
    
  }

  getProjectFromRemotePublishAndSaveInStorage(project_id, role){
    this.projectService.getProjectById(project_id).subscribe((prjct: any) => {
      this.logger.log('[PROJECTS] - PROJECTS OBJCTS FROM REMOTE CALLBACK ', prjct)
      prjct[role] = role
      this.auth.projectSelected(prjct, 'PROJECTS');
      localStorage.setItem(project_id, JSON.stringify(prjct));
    }, (error) => {
      this.logger.error('[PROJECTS] - GET PROJECT BY ID - ERROR ', error);
    }, () => {
      this.logger.log('[PROJECTS] - GET PROJECT BY ID - COMPLETE ');

    });
  }

  // GO TO  PROJECT-EDIT-ADD COMPONENT
  goToEditAddPage_CREATE() {
    this.router.navigate(['/project/create']);
  }

  // TEST VERIFY-EMAIL
  testVerifyEmail() {
    if (this.user) {
      this.router.navigate(['/verify/email/', this.user._id]);
    }
  }

  // !NO MORE USED - GO TO PROJECT-EDIT-ADD COMPONENT AND PASS THE PROJECT ID (RECEIVED FROM THE VIEW)
  // goToEditAddPage_EDIT(project_id: string) {
  //   this.logger.log('PROJECT ID ', project_id);
  //   this.router.navigate(['project/edit', project_id]);
  // }

  //   subsTo_WsCurrentUser(currentuserprjctuserid) {
  //     this.logger.log('SB - SUBSCRIBE TO WS CURRENT-USER AVAILABILITY  prjct user id of current user ', currentuserprjctuserid);
  //     this.usersService.subscriptionToWsCurrentUser(this.projectId, currentuserprjctuserid);
  //     this.getWsCurrentUserAvailability$();
  //     // this.getWsCurrentUserIsBusy$();
  // }


  getWsCurrentUserAvailability$() {
    // this.usersService.currentUserWsAvailability$
    this.wsRequestsService.currentUserWsAvailability$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((currentuser_availability) => {
        this.logger.log('[PROJECTS] - WS-CURRENT-USER - IS AVAILABLE? ', currentuser_availability);
        if (currentuser_availability !== null) {
          // this.IS_AVAILABLE = currentuser_availability;
        }
      }, error => {
        this.logger.error('[PROJECTS] - WS-CURRENT-USER AVAILABILITY * ERROR * ', error)
      }, () => {
        this.logger.log('[PROJECTS] - WS-CURRENT-USER AVAILABILITY * COMPLETE * ')
      });
  }



  /**
   * GET PROJECTS AND SAVE IN THE STORAGE: PROJECT ID - PROJECT NAME - USE ROLE   */
  getProjectsAndSaveInStorage() {
    this.projectService.getProjects().subscribe((projects: any) => {
      this.logger.log('[PROJECTS] - GET PROJECTS ', projects);

      this.showSpinner = false;

      if (projects) {
        this.projects = projects;
        // SET THE IDs and the NAMES OF THE PROJECT IN THE LOCAL STORAGE.
        // WHEN IS REFRESHED A PAGE THE AUTSERVICE USE THE NAVIGATION PROJECT ID TO GET FROM STORAGE THE NAME OF THE PROJECT
        // AND THEN PUBLISH PROJECT ID AND PROJECT NAME
        let countOfcurrentUserAvailabilityInProjects = 0


        this.projects.forEach(project => {
          // this.logger.log('[PROJECTS] - SET PROJECT IN STORAGE > project ', project)
          project['is_selected'] = false

          if (project.id_project && project.id_project.profile.type === 'free') {
            if (project.id_project && project.id_project.trialExpired === false) {
              // this.getProPlanTrialTranslation(project);
              if (project.id_project.profile.name === 'free') {
                this.prjct_profile_name = PLAN_NAME.B + " plan (trial)";
                project['prjct_profile_name'] = this.prjct_profile_name;
                project['plan_badge_background_type'] = 'b_plan_badge';
              } else if (project.id_project.profile.name === 'Sandbox') {
                this.prjct_profile_name = PLAN_NAME.E + " plan (trial)";
                project['prjct_profile_name'] = this.prjct_profile_name;
                project['plan_badge_background_type'] = 'b_plan_badge';
              }
            } else {
              // this.getPaidPlanTranslation(project, project.id_project.profile.name)
              if (project.id_project.profile.name === 'free') {
                this.prjct_profile_name = "Free plan";
                project['prjct_profile_name'] = this.prjct_profile_name;
                project['plan_badge_background_type'] = 'free_plan_badge'
              } else if (project.id_project.profile.name === 'Sandbox') {
                this.prjct_profile_name = "Sandbox plan";
                project['prjct_profile_name'] = this.prjct_profile_name;
                project['plan_badge_background_type'] = 'free_plan_badge'
              }
            }

          } else if (project.id_project && project.id_project.profile.type === 'payment') {
            // this.getPaidPlanTranslation(project, project.id_project.profile.name);
            // if ( project.id_project.isActiveSubscription === true) {
            if (project.id_project.profile.name === PLAN_NAME.A) {
              if (!project.id_project.profile.extra3) {
                this.prjct_profile_name = PLAN_NAME.A + " plan";
                project['prjct_profile_name'] = this.prjct_profile_name;
              } else {
                this.prjct_profile_name = PLAN_NAME.A + ' plan ' + '(' + APP_SUMO_PLAN_NAME[project.id_project.profile.extra3] + ')'
                project['prjct_profile_name'] = this.prjct_profile_name;
              }
              project['plan_badge_background_type'] = 'a_plan_badge'
            } else if (project.id_project.profile.name === PLAN_NAME.B) {
              if (!project.id_project.profile.extra3) {
                project['prjct_profile_name'] = this.prjct_profile_name;
                this.prjct_profile_name = PLAN_NAME.B + " plan";
              } else {
                this.prjct_profile_name = PLAN_NAME.B + ' plan ' + '(' + APP_SUMO_PLAN_NAME[project.id_project.profile.extra3] + ')'
              }
              project['prjct_profile_name'] = this.prjct_profile_name;
              project['plan_badge_background_type'] = 'b_plan_badge'
            } else if (project.id_project.profile.name === PLAN_NAME.C) {
              this.prjct_profile_name = PLAN_NAME.C + " plan";
              project['prjct_profile_name'] = this.prjct_profile_name;
              project['plan_badge_background_type'] = 'c_plan_badge'
            } else if (project.id_project.profile.name === PLAN_NAME.D) {
              this.prjct_profile_name = PLAN_NAME.D + " plan";
              project['prjct_profile_name'] = this.prjct_profile_name;
              project['plan_badge_background_type'] = 'a_plan_badge'
            } else if (project.id_project.profile.name === PLAN_NAME.E) {
              this.prjct_profile_name = PLAN_NAME.E + " plan";
              project['prjct_profile_name'] = this.prjct_profile_name;
              project['plan_badge_background_type'] = 'b_plan_badge'
            } else if (project.id_project.profile.name === PLAN_NAME.EE) {
                this.prjct_profile_name = PLAN_NAME.EE + " plan";
                project['prjct_profile_name'] = this.prjct_profile_name;
                project['plan_badge_background_type'] = 'bb_plan_badge'
            } else if (project.id_project.profile.name === PLAN_NAME.F) {
              this.prjct_profile_name = PLAN_NAME.F + " plan";
              project['prjct_profile_name'] = this.prjct_profile_name;
              project['plan_badge_background_type'] = 'c_plan_badge'
            } else if (
              project.id_project.profile.name !== PLAN_NAME.A &&
              project.id_project.profile.name !== PLAN_NAME.B &&
              project.id_project.profile.name !== PLAN_NAME.C &&
              project.id_project.profile.name !== PLAN_NAME.D &&
              project.id_project.profile.name !== PLAN_NAME.E &&
              project.id_project.profile.name !== PLAN_NAME.EE &&
              project.id_project.profile.name !== PLAN_NAME.F
            ) {
              this.prjct_profile_name = project.id_project.profile.name + ' plan (UNSUPPORTED)'
              // this.logger.log('project.id_project.profile.name' ,project.id_project.profile.name)
              project['prjct_profile_name'] = this.prjct_profile_name;
              project['plan_badge_background_type'] = 'unsupported_plan_badge'
            }

            // } 
            // else if ( project.id_project.isActiveSubscription === false) {}

          }
          if (project.id_project) {
            // this.logger.log( '[PROJECTS] project.id_project',  project.id_project) 
            // this.logger.log( '[PROJECTS] project',  project) 

            // const prjct: Project = {
            //   _id: project.id_project._id,
            //   name: project.id_project.name,
            //   role: project.role,
            //   profile_name: project.id_project.profile.name,
            //   trial_expired: project.id_project.trialExpired,
            //   trial_days_left: project.id_project.trialDaysLeft,
            //   profile_type: project.id_project.profile.type,
            //   subscription_is_active: project.id_project.isActiveSubscription,
            //   operatingHours: project.id_project.activeOperatingHours
            // }

            // this.subsTo_WsCurrentUser( project.id_project._id)
            // this.getProjectUsersIdByCurrentUserId(project.id_project._id)

            /**
             * project.id_project._id is the id of the project
             * project._id is the id of the project user
             */
            if (project.id_project.status !== 0) {
              this.usersService.subscriptionToWsCurrentUser_allProject(project.id_project._id, project._id);
            }
            this.listenTocurrentUserWSAvailabilityAndBusyStatusForProject$()


            /***  ADDED TO KNOW IF THE CURRENT USER IS AVAILABLE IN SOME PROJECT
             *    ID USED TO DISPLAY OR NOT THE MSG 'Attention, if you don't want to receive requests...' IN THE LOGOUT MODAL  ***/
            if (project.user_available === true) {
              countOfcurrentUserAvailabilityInProjects = countOfcurrentUserAvailabilityInProjects + 1;
            }

            localStorage.setItem(project.id_project._id, JSON.stringify(project.id_project));
          }
        });
        this.logger.log('[PROJECTS] - GET PROJECTS AFTER', projects);

        this.myAvailabilityCount = countOfcurrentUserAvailabilityInProjects;
        this.projectService.countOfMyAvailability(this.myAvailabilityCount);
        this.logger.log('[PROJECTS] - GET PROJECTS - I AM AVAILABLE IN # ', this.myAvailabilityCount, 'PROJECTS');
      }
    }, error => {
      this.showSpinner = false;
      this.logger.error('[PROJECTS] - GET PROJECTS - ERROR ', error)
    }, () => {
      this.logger.log('[PROJECTS] - GET PROJECTS * COMPLETE *')
    });
  }

  changeAvailabilityState(projectid, selectedStatusValue) {
    // this.logger.log('[PROJECTS] - changeAvailabilityState projectid', projectid, ' selectedStatusValue: ', selectedStatusValue);

    // available = !available
    let IS_AVAILABLE = null
    let profilestatus = ''
    if (selectedStatusValue === 'available') {

      IS_AVAILABLE = true
      // this.logger.log('[PROJECTS] changeAvailabilityState IS_AVAILABLE' , IS_AVAILABLE , ' profilestatus ', profilestatus) 
    } else if (selectedStatusValue === 'unavailable') {
      IS_AVAILABLE = false
      // this.logger.log('[PROJECTS] changeAvailabilityState IS_AVAILABLE' , IS_AVAILABLE , ' profilestatus ', profilestatus)

    } else if (selectedStatusValue === 'inactive') {
      IS_AVAILABLE = false
      profilestatus = 'inactive'
      // this.logger.log('[PROJECTS] changeAvailabilityState IS_AVAILABLE' , IS_AVAILABLE , ' profilestatus ', profilestatus)
    }
    // this.logger.log('[PROJECTS] - changeAvailabilityState projectid', projectid, ' selectedStatusValue: ', selectedStatusValue);
    this.usersService.updateCurrentUserAvailability(projectid, IS_AVAILABLE, profilestatus).subscribe((projectUser: any) => { // non 

      //  this.logger.log('[PROJECTS] - PROJECT-USER UPDATED ', projectUser)
      // NOTIFY TO THE USER SERVICE WHEN THE AVAILABLE / UNAVAILABLE BUTTON IS CLICKED
      // this.usersService.availability_btn_clicked(true)
      this.projects.forEach(project => {
        if (project.id_project._id === projectUser.id_project) {
          // this.logger.log('[PROJECTS] - PROJECT-USER UPDATED ', projectUser)
          project['ws_projct_user_available'] = projectUser.user_available;
          // this.logger.log('[PROJECTS] - changeAvailabilityState  projectUser.user_available',  projectUser.user_available);
          // this.logger.log('[PROJECTS] - changeAvailabilityState  projectUser.profileStatus',  projectUser.profileStatus);
          project['ws_projct_user_profileStatus'] = projectUser.profileStatus
          // project['ws_projct_user_isBusy'] = projectUser['isBusy']
        }
      });

    }, (error) => {
      this.logger.error('[PROJECTS] - PROJECT-USER UPDATED - ERROR  ', error);

    }, () => {
      this.logger.log('[PROJECTS] - PROJECT-USER UPDATED  * COMPLETE *');

    });
  }

  listenTocurrentUserWSAvailabilityAndBusyStatusForProject$() {
    this.usersService.currentUserWsBusyAndAvailabilityForProject$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((projectUser) => {
        // this.logger.log('PROJECT COMP $UBSC  TO WS USER AVAILABILITY & BUSY STATUS DATA (listenTo)', projectUser);
        this.projects.forEach(project => {
          if (project.id_project._id === projectUser['id_project']) {
            project['ws_projct_user_available'] = projectUser['user_available'];
            project['ws_projct_user_isBusy'] = projectUser['isBusy']
            if (projectUser['profileStatus']) {
              // this.logger.log('PROJECT COMP $UBSC  TO WS USER AVAILABILITY & BUSY STATUS DATA (listenTo)', projectUser);
              project['ws_projct_user_profileStatus'] = projectUser['profileStatus']
              // this.logger.log('PROJECT COMP $UBSC  TO WS USER AVAILABILITY & BUSY STATUS DATA (listenTo) projectUser[profileStatus]', projectUser['profileStatus']);
            }
          }
        });

      }, (error) => {
        this.logger.error('[PROJECTS] $UBSC TO WS USER AVAILABILITY & BUSY STATUS - ERROR ', error);
      }, () => {
        this.logger.log('[PROJECTS] $UBSC TO WS USER AVAILABILITY & BUSY STATUS * COMPLETE *');
      })
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.newInnerWidth = event.target.innerWidth;
    this.logger.log('[PROJECTS] INNER WIDTH ', this.newInnerWidth)

    if (this.newInnerWidth >= 992) {
      const elemAppSidebar = <HTMLElement>document.querySelector('app-sidebar');
      elemAppSidebar.setAttribute('style', 'display:none;');
    }
  }

  sidebarOpen() {
    const toggleButton = this.toggleButton;
    const body = document.getElementsByTagName('body')[0];
    setTimeout(function () {
      toggleButton.classList.add('toggled');
    }, 500);
    body.classList.add('nav-open');

    this.sidebarVisible = true;
    const elemAppSidebar = <HTMLElement>document.querySelector('app-sidebar');
    elemAppSidebar.setAttribute('style', 'display:block;');

    try {
      if (window && window['tiledesk_widget_hide']) {
        this.logger.log('[PROJECTS] - HIDE WIDGET - HERE 1')
        window['tiledesk_widget_hide']();
      }
    } catch (e) {
      this.logger.error('tiledesk_widget_hide ERROR', e)
    }

  };
  sidebarClose() {
    const body = document.getElementsByTagName('body')[0];
    this.toggleButton.classList.remove('toggled');
    this.sidebarVisible = false;
    body.classList.remove('nav-open');

    const elemAppSidebar = <HTMLElement>document.querySelector('app-sidebar');
    elemAppSidebar.setAttribute('style', 'display:none;');

    // try {
    //   if (window && window['tiledesk_widget_show']) {
    //     this.logger.log('[PROJECTS] - SHOW WIDGET - HERE 1')
    //     window['tiledesk_widget_show']();
    //   }
    // } catch (e) {
    //   this.logger.error('tiledesk_widget_show ERROR', e)
    // }
  };
  sidebarToggle() {
    // const toggleButton = this.toggleButton;
    // const body = document.getElementsByTagName('body')[0];
    if (this.sidebarVisible === false) {
      this.sidebarOpen();
    } else {
      this.sidebarClose();
    }
  };


  // subscribeToLogoutPressedinSidebarNavMobilePrjctUndefined() {
  //  this.usersService.has_clicked_logoutfrom_mobile_sidebar_project_undefined
  //     .subscribe((has_clicked_logout: boolean) => {
  //       this.logger.log('[PROJECTS] - HAS CLICKED LOGOUT IN THE SIDEBAR ', has_clicked_logout);
  //       this.logger.log('[PROJECTS]-  SIDEBAR is VISIBILE', this.sidebarVisible);

  //       if (has_clicked_logout === true) {
  //         this.sidebarClose();
  //         this.openLogoutModal();
  //         this.usersService.logout_btn_clicked_from_mobile_sidebar_project_undefined(false)
  //       }
  //     })
  // };



  openLogoutModal() {
    this.displayLogoutModal = 'block';
    this.auth.hasOpenedLogoutModal(true);
  }

  onCloseModal() {
    this.displayCreateModal = 'none';
    this.displayInfoModal = 'none';
    this.displayLogoutModal = 'none';
  }

  onCloseLogoutModalHandled() {
    this.displayLogoutModal = 'none';
  }

  onLogoutModalHandled() {
    this.logout();
    this.displayLogoutModal = 'none';
  }

  logout() {
    this.auth.showExpiredSessionPopup(false);
    this.auth.signOut('projects');
  }

  testExpiredSessionFirebaseLogout() {
    this.auth.testExpiredSessionFirebaseLogout(true)
  }


  goToCreateProject() {
    this.logger.log('[PROJECTS] - GO TO CREATE  PROJECT')
    this.router.navigate(['/create-new-project']);
  }


}
