
import { Component, OnInit, AfterViewInit, ElementRef, HostListener, OnDestroy, ViewChildren, QueryList } from '@angular/core';
import { ProjectService } from '../../../services/project.service';
import { Project } from '../../../models/project-model';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { isDevMode } from '@angular/core';
import { UsersService } from '../../../services/users.service';
import { UploadImageService } from '../../../services/upload-image.service';
import { Subscription } from 'rxjs/Subscription';
import { AppConfigService } from '../../../services/app-config.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// import brand from 'assets/brand/brand.json';
import { BrandService } from '../../../services/brand.service';
import PerfectScrollbar from 'perfect-scrollbar';
// import { PerfectScrollbarTdDirective } from '../../../_directives/td-perfect-scrollbar/perfect-scrollbar-td.directive';
import { LoggerService } from '../../../services/logger/logger.service';
declare const ngDevMode: boolean;
@Component({
  selector: 'appdashboard-projects-for-panel',
  templateUrl: './projects-for-panel.component.html',
  styleUrls: ['./projects-for-panel.component.scss']
})
export class ProjectsForPanelComponent implements OnInit, OnDestroy {

  // @ViewChildren(PerfectScrollbarTdDirective)
  // perfectScrollbarTdDirective: QueryList<PerfectScrollbarTdDirective>;

  // companyLogoBlack_Url = brand.company_logo_allwhite__url
  // pageBackgroundColor = brand.recent_project_page.background_color;

  // tparams = brand;
  // companyLogoBlack_Url = brand.company_logo_black__url;
  // companyLogoBlack_width = brand.recent_project_page.company_logo_black__width;

  tparams: any;
  companyLogoBlack_Url: string;
  companyLogoBlack_width: string;

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
  myAvailabilityCount: number;
  subscription: Subscription;

  storageBucket: string;
  currentUserId: string
  public_Key: string;
  MT: boolean;

  window_width_is_60: boolean;
 LAST_STORED_PRJCT_ID:  string

  private unsubscribe$: Subject<any> = new Subject<any>();

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private auth: AuthService,
    private element: ElementRef,
    private usersService: UsersService,
    private uploadImageService: UploadImageService,
    public appConfigService: AppConfigService,
    public brandService: BrandService,
    private logger: LoggerService
  ) {
    const brand = brandService.getBrand();
    this.tparams = brand;
    this.companyLogoBlack_Url = brand['company_logo_black__url'];
    this.companyLogoBlack_width = brand['recent_project_page']['company_logo_black__width'];


    this.logger.log('[PROJECTS-X-PANEL] - IS DEV MODE ', isDevMode());
    this.APP_IS_DEV_MODE = isDevMode()
  }

  // -----------------------------------------------
  // @ Lifehook
  // -----------------------------------------------

  ngOnInit() {
    if (ngDevMode) {
      this.logger.log('[PROJECTS-X-PANEL] is in DEV MODE');
    }
    const navbar: HTMLElement = this.element.nativeElement;
    this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];

    this.getProjectsAndSaveInStorage();
    this.getLoggedUser();

    this.checkUserImageUploadIsComplete();

    // used when the page is refreshed
    this.checkUserImageExist();

    // this.subscribeToLogoutPressedinSidebarNavMobilePrjctUndefined();
    this.getStorageBucket();
    this.getOSCODE();
    this.onInitWindowWidth()

    this.setPerfectScrollbar();
    this.listenHasDeleteUserProfileImage();
    window.top.postMessage('onInitProjectsForPanel', '*')

    this.getLastStoredProject()
  }
  getLastStoredProject() {
    const lastStoredProjectObjct = localStorage.getItem('last_project')
    if (lastStoredProjectObjct) {
      const lastStoredProject = JSON.parse(lastStoredProjectObjct);
      // console.log('[PROJECTS-X-PANEL] GET LAST STORED PROJECT - lastStoredProject ', lastStoredProject)
      this.LAST_STORED_PRJCT_ID = lastStoredProject.id_project.id
      this.logger.log('[PROJECTS-X-PANEL] GET LAST STORED PROJECT - LAST_STORED_PRJCT_ID ', this.LAST_STORED_PRJCT_ID)
    }

  }



  setPerfectScrollbar() {
    const container_projects_for_panel = <HTMLElement>document.querySelector('.main-content-projects-for-panel');
    this.logger.log('[PROJECTS-X-PANEL] main-content-projects-for-panel', container_projects_for_panel);
    let ps = new PerfectScrollbar(container_projects_for_panel);
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    if (this.projects) {
      this.projects.forEach(project => {
        // this.logger.log('[PROJECTS-X-PANEL] - unsubsToWS_CurrentUser_allProject ', project);
        this.usersService.unsubsToWS_CurrentUser_allProject(project.id_project._id, project._id)
      });
    }

    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    window.top.postMessage('onDestroyProjectsForPanel', '*')
  }



  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[PROJECTS-X-PANEL] AppConfigService getAppConfig public_Key', this.public_Key)
    this.logger.log('[PROJECTS-X-PANEL] public_Key', this.public_Key)

    let keys = this.public_Key.split("-");
    this.logger.log('[PROJECTS-X-PANEL] PUBLIC-KEY- public_Key keys', keys)

    this.logger.log('[PROJECTS-X-PANEL] PUBLIC-KEY - public_Key Arry includes MTT', this.public_Key.includes("MTT"));

    if (this.public_Key.includes("MTT") === true) {

      keys.forEach(key => {
        // this.logger.log('NavbarComponent public_Key key', key)
        if (key.includes("MTT")) {
          this.logger.log('[PROJECTS-X-PANEL] PUBLIC-KEY  - key', key);
          let mt = key.split(":");
          this.logger.log('[PROJECTS-X-PANEL] PUBLIC-KEY - mt key&value', mt);
          if (mt[1] === "F") {
            this.MT = false;
            this.logger.log('[PROJECTS-X-PANEL] PUBLIC-KEY - mt is', this.MT);
          } else {
            this.MT = true;
            this.logger.log('[PROJECTS-X-PANEL] PUBLIC-KEY - mt is', this.MT);
          }
        }
      });

    } else {
      this.MT = false;
      this.logger.log('[PROJECTS-X-PANEL] PUBLIC-KEY - mt is', this.MT);
    }
  }


  getStorageBucket() {
    const firebase_conf = this.appConfigService.getConfig().firebase;
    this.storageBucket = firebase_conf['storageBucket'];
    this.logger.log('[PROJECTS-X-PANEL] STORAGE-BUCKET ', this.storageBucket)
  }

  listenHasDeleteUserProfileImage() {
    this.uploadImageService.hasDeletedUserPhoto.subscribe((hasDeletedImage) => {
      this.logger.log('[PROJECTS-X-PANEL] - LISTEN TO hasDeletedImage ? ', hasDeletedImage);
      this.userImageHasBeenUploaded = false
      this.userProfileImageExist = false
    });

  }

  checkUserImageExist() {
    this.usersService.userProfileImageExist.subscribe((image_exist) => {
      this.logger.log('[PROJECTS-X-PANEL] - USER PROFILE EXIST ? ', image_exist);
      this.userProfileImageExist = image_exist;
    });
  }

  checkUserImageUploadIsComplete() {
    this.uploadImageService.userImageWasUploaded.subscribe((image_exist) => {
      this.logger.log('[PROJECTS-X-PANEL] - IMAGE UPLOADING IS COMPLETE ? ', image_exist);
      this.userImageHasBeenUploaded = image_exist;
    });
  }


  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      this.logger.log('[PROJECTS-X-PANEL] - USER  ', user)
      this.user = user;

      if (user) {
        this.currentUserId = user._id;
        this.logger.log('[PROJECTS-X-PANEL] Current USER ID ', this.currentUserId)
      }

    });
  }


  hasChangedPRJCT(
    project: any,
    project_id: string,
    project_name: string,
    project_profile_name: string,
    project_trial_expired: string,
    project_trial_days_left: number,
    project_status: number) {
    this.logger.log('[PROJECTS-X-PANEL] - hasChangedPRJCT - PROJECT SELECTED ', project)

    // ------------------------------------------------------------------------------------------------------------
    // POST MESSAGE hasChangedProject (communicates to the parent (chat-ionic) that the agent has changed project)
    // ------------------------------------------------------------------------------------------------------------
    localStorage.setItem('last_project', JSON.stringify(project))
    window.top.postMessage('hasChangedProject', '*')

    this.logger.log('[PROJECTS-X-PANEL] - hasChangedPRJCT - PROJECT status ', project_status)

    if (project_status !== 0) {

      window.top.postMessage('open', '*')

      // this.router.navigate([`/project/${project_id}/unserved-request-for-panel`]);

      // WHEN THE USER SELECT A PROJECT ITS ID and NAME IS SEND IN THE AUTH SERVICE THAT PUBLISHES IT
      const project: Project = {
        _id: project_id,
        name: project_name,
        profile_name: project_profile_name,
        trial_expired: project_trial_expired,
        trial_days_left: project_trial_days_left
      }

      this.auth.projectSelected(project)
      this.logger.log('[PROJECTS-X-PANEL] - hasChangedPRJCT - PROJECT ', project)

    }
    /* !!! NO MORE USED - NOW THE ALL PROJECTS ARE SETTED IN THE STORAGE IN getProjectsAndSaveInStorage()
     * SET THE project_id IN THE LOCAL STORAGE
     * WHEN THE PAGE IS RELOADED THE SIDEBAR GET THE PROJECT ID FROM THE LOCAL STORAGE */
    // localStorage.setItem('project', JSON.stringify(project));
  }


  /**
   * GET PROJECTS AND SAVE IN THE STORAGE: PROJECT ID - PROJECT NAME - USE ROLE   */
  getProjectsAndSaveInStorage() {
    this.projectService.getProjects().subscribe((projects: any) => {
      this.logger.log('[PROJECTS-X-PANEL] - GET PROJECTS & SAVE IN STORAGE ', projects);

      this.showSpinner = false;

      if (projects) {
        this.projects = projects;

        // SET THE IDs and the NAMES OF THE PROJECT IN THE LOCAL STORAGE.
        // WHEN IS REFRESHED A PAGE THE AUTSERVICE USE THE NAVIGATION PROJECT ID TO GET FROM STORAGE THE NAME OF THE PROJECT
        // AND THEN PUBLISH PROJECT ID AND PROJECT NAME
        let countOfcurrentUserAvailabilityInProjects = 0


        this.projects.forEach(project => {
          this.logger.log('[PROJECTS-X-PANEL] - SET PROJECT IN STORAGE')

          if (project.id_project) {
            const prjct: Project = {
              _id: project.id_project._id,
              name: project.id_project.name,
              role: project.role,
              profile_name: project.id_project.profile.name,
              trial_expired: project.id_project.trialExpired,
              trial_days_left: project.id_project.trialDaysLeft,
              profile_type: project.id_project.profile.type,
              subscription_is_active: project.id_project.isActiveSubscription,
              operatingHours: project.id_project.activeOperatingHours
            }

            if (project && project.id_project && project.id_project.name) {
              project['project_name_initial'] = project.id_project.name.charAt(0)
            }

            // this.subsTo_WsCurrentUser( project.id_project._id)
            // this.getProjectUsersIdByCurrentUserId(project.id_project._id)

            /**
             * project.id_project._id is the id of the project
             * project._id is the id of the project user
             */
            this.usersService.subscriptionToWsCurrentUser_allProject(project.id_project._id, project._id);

            this.listenTocurrentUserWSAvailabilityAndBusyStatustForProject$(project)

            // .then((data) => {

            //     this.logger.log("PROJECT COMP SUBSCR TO WS CURRENT USERS - RES ", data);
            //     project['ws_projct_user_available'] = data['user_available']
            //     project['ws_projct_user_isBusy'] = data['isBusy']
            //   })


            /***  ADDED TO KNOW IF THE CURRENT USER IS AVAILABLE IN SOME PROJECT
             *    ID USED TO DISPLAY OR NOT THE MSG 'Attention, if you don't want to receive requests...' IN THE LOGOUT MODAL  ***/
            if (project.user_available === true) {
              countOfcurrentUserAvailabilityInProjects = countOfcurrentUserAvailabilityInProjects + 1;
            }

            localStorage.setItem(project.id_project._id, JSON.stringify(prjct));
          }
        });
        this.logger.log('[PROJECTS-X-PANEL] - GET PROJECTS AFTER', projects);

        this.myAvailabilityCount = countOfcurrentUserAvailabilityInProjects;
        this.projectService.countOfMyAvailability(this.myAvailabilityCount);
        this.logger.log('[PROJECTS-X-PANEL] - GET PROJECTS - I AM AVAILABLE IN # ', this.myAvailabilityCount, 'PROJECTS');
      }
    }, error => {
      this.showSpinner = false;
      this.logger.error('[PROJECTS-X-PANEL] - GET PROJECTS - ERROR ', error)
    }, () => {
      this.logger.log('[PROJECTS-X-PANEL] - GET PROJECTS - COMPLETE')
    });
  }

  changeAvailabilityState(projectid, available) {
    this.logger.log('[PROJECTS-X-PANEL] - changeAvailabilityState projectid', projectid, ' available: ', available);

    available = !available
    this.logger.log('[PROJECTS-X-PANEL] - changeAvailabilityState projectid', projectid, ' available: ', available);

    this.usersService.updateCurrentUserAvailability(projectid, available).subscribe((projectUser: any) => { // non 

      this.logger.log('[PROJECTS-X-PANEL] - PROJECT-USER UPDATED ', projectUser)

      // NOTIFY TO THE USER SERVICE WHEN THE AVAILABLE / UNAVAILABLE BUTTON IS CLICKED
      // this.usersService.availability_btn_clicked(true)

      this.projects.forEach(project => {
        if (project.id_project._id === projectUser.id_project) {
          project['ws_projct_user_available'] = projectUser.user_available;
          // project['ws_projct_user_isBusy'] = projectUser['isBusy']
        }
      });

    }, (error) => {
      this.logger.error('[PROJECTS-X-PANEL] - PROJECT-USER UPDATED - ERROR  ', error);

    }, () => {
      this.logger.log('[PROJECTS-X-PANEL] - PROJECT-USER UPDATED  * COMPLETE *');

    });
  }

  listenTocurrentUserWSAvailabilityAndBusyStatustForProject$(project) {
    this.usersService.currentUserWsBusyAndAvailabilityForProject$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((projectUser) => {
        // this.logger.log('PROJECT COMP $UBSC  TO WS USER AVAILABILITY & BUSY STATUS DATA (listenTo)', projectUser);
        // this.projects.forEach(project => {
        if (project.id_project._id === projectUser['id_project']) {
          project['ws_projct_user_available'] = projectUser['user_available'];
          project['ws_projct_user_isBusy'] = projectUser['isBusy']
        }
        // });

      }, (error) => {
        this.logger.error('[PROJECTS-X-PANEL] - $UBSC TO WS USER AVAILABILITY & BUSY STATUS error ', error);
      }, () => {
        this.logger.log('[PROJECTS-X-PANEL] - $UBSC TO WS USER AVAILABILITY & BUSY STATUS * COMPLETE *');
      })

  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.newInnerWidth = event.target.innerWidth;
    this.logger.log('[PROJECTS-X-PANEL] - INNER WIDTH ', this.newInnerWidth)

    // if (this.newInnerWidth >= 992) {
    //   const elemAppSidebar = <HTMLElement>document.querySelector('app-sidebar');
    //   elemAppSidebar.setAttribute('style', 'display:none;');
    // }
    // if (this.newInnerWidth <= 60) {
    if (this.newInnerWidth <= 150) {
      this.window_width_is_60 = true;
    } else {
      this.window_width_is_60 = false;
    }
  }

  onInitWindowWidth(): any {
    const actualWidth = window.innerWidth;
    this.logger.log('[PROJECTS-X-PANEL] - ACTUAL Width ', actualWidth);


    // if (actualWidth <= 60) {
    if (actualWidth <= 150) {
      this.window_width_is_60 = true;
    } else {
      this.window_width_is_60 = false;
    }
  }

  // sidebarOpen() {
  //   const toggleButton = this.toggleButton;
  //   const body = document.getElementsByTagName('body')[0];
  //   setTimeout(function () {
  //     toggleButton.classList.add('toggled');
  //   }, 500);
  //   body.classList.add('nav-open');

  //   this.sidebarVisible = true;
  //   const elemAppSidebar = <HTMLElement>document.querySelector('app-sidebar');
  //   elemAppSidebar.setAttribute('style', 'display:block;');
  // };

  // sidebarClose() {
  //   const body = document.getElementsByTagName('body')[0];
  //   this.toggleButton.classList.remove('toggled');
  //   this.sidebarVisible = false;
  //   body.classList.remove('nav-open');

  //   const elemAppSidebar = <HTMLElement>document.querySelector('app-sidebar');
  //   elemAppSidebar.setAttribute('style', 'display:none;');
  // };

  // sidebarToggle() {
  //   // const toggleButton = this.toggleButton;
  //   // const body = document.getElementsByTagName('body')[0];
  //   if (this.sidebarVisible === false) {
  //     this.sidebarOpen();
  //   } else {
  //     this.sidebarClose();
  //   }
  // };

  // openLogoutModal() {
  //   this.displayLogoutModal = 'block';
  //   this.auth.hasOpenedLogoutModal(true);
  // }

  // onCloseLogoutModalHandled() {
  //   this.displayLogoutModal = 'none';
  // }

  // onLogoutModalHandled() {
  //   this.logout();
  //   this.displayLogoutModal = 'none';
  // }

  // logout() {
  //   this.auth.showExpiredSessionPopup(false);
  //   this.auth.signOut('project-for-panel');
  // }

  // testExpiredSessionFirebaseLogout() {
  //   this.auth.testExpiredSessionFirebaseLogout(true)
  // }


  // goToCreateProject() {
  //   this.router.navigate(['/create-new-project']);
  // }


}

