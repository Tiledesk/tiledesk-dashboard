import { Component, OnInit, AfterViewInit, NgModule, ElementRef, ViewChild, HostListener } from '@angular/core';

import { Router, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../core/auth.service';
import { UsersService } from '../../services/users.service';
import { Project } from '../../models/project-model';
// import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
// import { SharedModule } from '../../shared/shared.module';
import { LocalDbService } from '../../services/users-local-db.service';
import { NotifyService } from '../../core/notify.service';
import { UploadImageService } from '../../services/upload-image.service';
import { UploadImageNativeService } from '../../services/upload-image-native.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AppConfigService } from '../../services/app-config.service';

import { DepartmentService } from '../../services/department.service';

// import { publicKey } from '../../utils/util';
// import { public_Key } from '../../utils/util';
import { environment } from '../../../environments/environment';
// import brand from 'assets/brand/brand.json';
import { BrandService } from '../../services/brand.service';
import { WsRequestsService } from './../../services/websocket/ws-requests.service';
import { LoggerService } from './../../services/logger/logger.service';
declare const $: any;

declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}

//    export const ROUTES: RouteInfo[];
//  = [
//     { path: `project/${this.projectid}/home`, title: 'Home', icon: 'dashboard', class: '' },
//     { path: 'requests', title: 'Visitatori', icon: 'group', class: '' },
//     { path: 'chat', title: 'Chat', icon: 'chat', class: '' },
//     // { path: 'analytics', title: 'Analytics', icon: 'trending_up', class: '' },
//     // MOVED IN THE TEMPLATE: IS NECESSARY TO MANAGE THE SETTING SUB MENU
//     // { path: 'settings', title: 'Impostazioni',  icon: 'settings', class: '' },

//     // { path: 'dashboard', title: 'Dashboard', icon: 'dashboard', class: '' },
//     // { path: 'user-profile', title: 'User Profile', icon: 'person', class: '' },
//     // { path: 'table-list', title: 'Table List', icon: 'content_paste', class: '' },
//     // { path: 'typography', title: 'Typography', icon: 'library_books', class: '' },
//     // { path: 'icons', title: 'Icons', icon: 'bubble_chart', class: '' },
//     // { path: 'maps', title: 'Maps', icon: 'location_on', class: '' },
//     // { path: 'notifications', title: 'Notifications', icon: 'notifications', class: '' },
//     // { path: 'upgrade', title: 'Upgrade to PRO', icon: 'unarchive', class: 'active-pro' },
// ];

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, AfterViewInit {

    // tparams = brand;
    // sidebarLogoWhite_Url = brand.company_logo_white__url;
    // hidechangelogrocket = brand.sidebar__hide_changelog_rocket;
    tparams: any;
    sidebarLogoWhite_Url: string;
    sidebarLogoNoText: string;
    hidechangelogrocket: boolean;

    // background_bottom_section = brand.sidebar.background_bottom_section
    // public_Key = environment.t2y12PruGU9wUtEGzBJfolMIgK; // now get from appconfig
    public_Key: string;

    @ViewChild('openchatbtn') private elementRef: ElementRef;
    @ViewChild('homebtn') private homeBtnElement: ElementRef;

    menuItems: any[];

    checked_route: string;

    // SHOW_SETTINGS_SUBMENU = false;
    SHOW_SETTINGS_SUBMENU = false;
    SETTINGS_SUBMENU_WAS_OPEN: any;

    // FOR THE CARETS IN SIDEBAR IN MOBILE MODE
    SHOW_PRJCT_SUB = false;
    SHOW_PROFILE_SUB = false;

    // NO MORE USED
    // isActive: string;

    // switch up and down the caret of menu item settings
    // trasform = 'none';
    trasform = 'none';
    trasform_projectname_caret = 'none';
    transform_user_profile_caret = 'none';

    unservedRequestCount: number;

    // route: string;
    LOGIN_PAGE: boolean;
    // IS_UNAVAILABLE = false;
    IS_AVAILABLE: boolean;
    IS_BUSY: boolean;
    SIDEBAR_IS_SMALL: boolean = false;
    projectUser_id: string;

    project: Project;
    projectId: string;
    user: any;

    ROUTES: RouteInfo[];
    displayLogoutModal = 'none';

    USER_ROLE: string;

    currentUserId: string

    // CHAT_BASE_URL = environment.chat.CHAT_BASE_URL; // moved
    // CHAT_BASE_URL = environment.CHAT_BASE_URL; // now get from appconfig
    CHAT_BASE_URL: string;

    userProfileImageExist: boolean;
    userImageHasBeenUploaded: boolean;
    userProfileImageurl: string;
    timeStamp: any;

    IS_MOBILE_MENU: boolean;
    scrollpos: number;
    elSidebarWrapper: any;

    changeAvailabilitySuccessNoticationMsg: string;
    changeAvailabilityErrorNoticationMsg: string;

    isOverAvar = false;

    availabilityCount: number;
    _route: string;

    ACTIVITIES_ROUTE_IS_ACTIVE: boolean;
    ACTIVITIES_DEMO_ROUTE_IS_ACTIVE: boolean;
    ANALYTICS_DEMO_ROUTE_IS_ACTIVE: boolean;
    WIDGET_ROUTE_IS_ACTIVE: boolean;
    ANALITYCS_ROUTE_IS_ACTIVE: boolean;
    HOME_ROUTE_IS_ACTIVE: boolean;
    TRIGGER_ROUTE_IS_ACTIVE: boolean;
    APPS_ROUTE_IS_ACTIVE: boolean;
    NOTIFICATION_EMAIL_IS_ACTIVE: boolean;
    YOUR_PROJECT_ROUTE_IS_ACTIVE: boolean;
    AUTOLOGIN_ROUTE_IS_ACTIVE: boolean;
    prjct_profile_name: string;
    prjct_trial_expired: boolean;
    prjc_trial_days_left: number
    prjc_trial_days_left_percentage: number
    isVisibleANA: boolean;
    isVisibleACT: boolean;
    isVisibleTRI: boolean;
    isVisibleGRO: boolean;
    isVisibleDEP: boolean;
    isVisibleOPH: boolean;
    isVisibleCAR: boolean;
    isVisibleLBS: boolean;
    isVisibleAPP: boolean;
    storageBucket: string;
    baseUrl: string;
    default_dept_id: string;
    browserLang: string;
    dsbrd_lang : string;
    tlangparams: any
    flag_url: string;
    private unsubscribe$: Subject<any> = new Subject<any>();

    constructor(
        private router: Router,
        public location: Location,
        private route: ActivatedRoute,
        private projectService: ProjectService,
        private auth: AuthService,
        private usersService: UsersService,
        private usersLocalDbService: LocalDbService,
        private notify: NotifyService,
        private uploadImageService: UploadImageService,
        private translate: TranslateService,
        public appConfigService: AppConfigService,
        private deptService: DepartmentService,
        public brandService: BrandService,
        public wsRequestsService: WsRequestsService,
        private uploadImageNativeService: UploadImageNativeService,
        private logger: LoggerService
    ) {
        this.logger.log('[SIDEBAR] !!!!! HELLO SIDEBAR')

        const brand = brandService.getBrand();

        this.tparams = brand;
        if (brand) {
            this.sidebarLogoWhite_Url = brand['company_logo_white__url'];
            this.hidechangelogrocket = brand['sidebar__hide_changelog_rocket'];
            this.sidebarLogoNoText = brand['company_logo_no_text__url'];
        }
    }

    ngOnInit() {
        this.getLoggedUser();
        this.translateChangeAvailabilitySuccessMsg();
        this.translateChangeAvailabilityErrorMsg();
        this.getProfileImageStorage();

        this.getCurrentProject_andThenDepts();

        this.getUserAvailability();
        this.getUserUserIsBusy();
        this.getProjectUserId();

        this.getProjectUserRole();

        this.hasChangedAvailabilityStatusInUsersComp();

        this.checkUserImageUploadIsComplete();
        // used when the page is refreshed
        this.checkUserImageExist();

        this.subscribeToMyAvailibilityCount();
        this.getCurrentRoute();

        this.getOSCODE();

        this.brandLog();
        this.getHasOpenBlogKey()
        this.getChatUrl();
        this.isMac();
        this.listenHasDeleteUserProfileImage();
    }

    getLoggedUser() {
        this.auth.user_bs.subscribe((user) => {
            this.logger.log('[SIDEBAR] USER GET IN SIDEBAR ', user)
            // tslint:disable-next-line:no-debugger
            // debugger
            this.user = user;

            if (user) {
                this.currentUserId = user._id;
                this.logger.log('[SIDEBAR] Current USER ID ', this.currentUserId);
                
                const stored_preferred_lang = localStorage.getItem(this.user._id + '_lang')

                if (stored_preferred_lang) {
                    this.dsbrd_lang = stored_preferred_lang;
                    this.getLangTranslation(this.dsbrd_lang)
                    this.flag_url = "assets/img/language_flag/" + stored_preferred_lang + ".png"

                    this.logger.log('[SIDEBAR] flag_url (from stored_preferred_lang) ', this.flag_url)
                 
                    this.logger.log('[SIDEBAR] stored_preferred_lang ', stored_preferred_lang)
                } else {
                    this.browserLang = this.translate.getBrowserLang();
                    this.dsbrd_lang = this.browserLang; 
                    this.getLangTranslation(this.dsbrd_lang)
                    this.logger.log('[SIDEBAR] - browser_lang ', this.browserLang)
                    this.flag_url = "assets/img/language_flag/" + this.browserLang + ".png"
                  
                    this.logger.log('[SIDEBAR] flag_url (from browser_lang) ', this.flag_url)
                }
            }
        });
    }

     getLangTranslation(dsbrd_lang_code) {
        this.translate.get(dsbrd_lang_code)
        .subscribe((translation: any) => {
            this.logger.log('[SIDEBAR] getLangTranslation', translation)
            this.tlangparams = {language_name: translation}
        });
    }

    getChatUrl() {
        this.CHAT_BASE_URL = this.appConfigService.getConfig().CHAT_BASE_URL;
        // this.logger.log('[SIDEBAR] AppConfigService getAppConfig CHAT_BASE_URL', this.CHAT_BASE_URL);
    }

    getHasOpenBlogKey() {
        const hasOpenedBlog = this.usersLocalDbService.getStoredChangelogDate();
        this.logger.log('[SIDEBAR] »»»»»»»»» hasOpenedBlog ', hasOpenedBlog);
        if (hasOpenedBlog === true) {
            this.hidechangelogrocket = true;
        }
    }

    brandLog() {
        // this.logger.log('BRAND_JSON - SIDEBAR ', brand);
        this.logger.log('[SIDEBAR] BRAND_JSON - sidebarlogourl ', this.sidebarLogoWhite_Url);
        this.logger.log('[SIDEBAR] BRAND_JSON - hidechangelogrocket ', this.hidechangelogrocket);
    }

    getProfileImageStorage() {
        if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
            const firebase_conf = this.appConfigService.getConfig().firebase;
            this.storageBucket = firebase_conf['storageBucket'];
            this.logger.log('[SIDEBAR] IMAGE STORAGE ', this.storageBucket, 'usecase Firebase')
        } else {
            this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;
            this.logger.log('[SIDEBAR] IMAGE STORAGE ', this.storageBucket, 'usecase Native')
        }


    }

    getOSCODE() {
        this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
        this.logger.log('[SIDEBAR] AppConfigService getAppConfig public_Key', this.public_Key);

        let keys = this.public_Key.split("-");
        this.logger.log('[SIDEBAR] PUBLIC-KEY - public_Key keys', keys)

        keys.forEach(key => {

            if (key.includes("ANA")) {

                let ana = key.split(":");

                if (ana[1] === "F") {
                    this.isVisibleANA = false;
                } else {
                    this.isVisibleANA = true;
                }
            }

            if (key.includes("ACT")) {
                let act = key.split(":");
                if (act[1] === "F") {
                    this.isVisibleACT = false;
                } else {
                    this.isVisibleACT = true;
                }
            }

            if (key.includes("TRI")) {
                let tri = key.split(":");
                if (tri[1] === "F") {
                    this.isVisibleTRI = false;
                } else {
                    this.isVisibleTRI = true;
                }
            }

            if (key.includes("GRO")) {
                let gro = key.split(":");
                if (gro[1] === "F") {
                    this.isVisibleGRO = false;
                } else {
                    this.isVisibleGRO = true;
                }
            }

            if (key.includes("DEP")) {
                let dep = key.split(":");
                if (dep[1] === "F") {
                    this.isVisibleDEP = false;
                } else {
                    this.isVisibleDEP = true;
                }
            }

            if (key.includes("OPH")) {
                let oph = key.split(":");
                if (oph[1] === "F") {
                    this.isVisibleOPH = false;
                } else {
                    this.isVisibleOPH = true;
                }
            }

            if (key.includes("CAR")) {
                let car = key.split(":");
                if (car[1] === "F") {
                    this.isVisibleCAR = false;
                } else {
                    this.isVisibleCAR = true;
                }
            }

            if (key.includes("LBS")) {
                let lbs = key.split(":");
                if (lbs[1] === "F") {
                    this.isVisibleLBS = false;
                } else {
                    this.isVisibleLBS = true;
                }
            }

            if (key.includes("APP")) {
                let lbs = key.split(":");
                if (lbs[1] === "F") {
                    this.isVisibleAPP = false;
                } else {
                    this.isVisibleAPP = true;
                }
            }
        });

        if (!this.public_Key.includes("CAR")) {
            this.isVisibleCAR = false;
        }

        if (!this.public_Key.includes("LBS")) {
            this.isVisibleLBS = false;
        }

        if (!this.public_Key.includes("APP")) {
            this.isVisibleAPP = false;
        }
    }


    getCurrentRoute() {
        this.router.events.filter((event: any) => event instanceof NavigationEnd)
            .subscribe(event => {
                // this.logger.log('[SIDEBAR] NavigationEnd ', event.url);

                // this.nav_project_id !== 'email' &&
                // url_segments[1] !== 'user' &&
                // url_segments[1] !== 'handle-invitation' &&
                // url_segments[1] !== 'signup-on-invitation' &&
                // url_segments[1] !== 'resetpassword' &&
                // url_segments[1] !== 'autologin' &&
                // current_url !== '/projects'

                if (event.url.indexOf('/autologin') !== -1) {
                    this.logger.log('[SIDEBAR] NavigationEnd - THE activities-demo route IS ACTIVE  ', event.url);
                    this.AUTOLOGIN_ROUTE_IS_ACTIVE = true;
                    // const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
                    // this.logger.log('[SIDEBAR] NavigationEnd - elemMainPanel  ', elemMainPanel);
                    // elemMainPanel.style.width = "100% !important"
                } else {
                    // this.logger.log('[SIDEBAR] NavigationEnd - THE activities-demo route IS NOT ACTIVE  ', event.url);
                    this.AUTOLOGIN_ROUTE_IS_ACTIVE = false;
                }
                
                if (event.url === '/projects') {
                    this.logger.log('[SIDEBAR] NavigationEnd - THE activities-demo route IS ACTIVE  ', event.url);
                    this.YOUR_PROJECT_ROUTE_IS_ACTIVE = true;
                    // const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
                    // this.logger.log('[SIDEBAR] NavigationEnd - elemMainPanel  ', elemMainPanel);
                    // elemMainPanel.style.width = "100% !important"
                } else {
                    // this.logger.log('[SIDEBAR] NavigationEnd - THE activities-demo route IS NOT ACTIVE  ', event.url);
                    this.YOUR_PROJECT_ROUTE_IS_ACTIVE = false;
                }

                if (event.url.indexOf('/activities') !== -1) {
                    // this.logger.log('[SIDEBAR] NavigationEnd - THE activities-demo route IS ACTIVE  ', event.url);
                    this.ACTIVITIES_ROUTE_IS_ACTIVE = true;
                } else {
                    // this.logger.log('[SIDEBAR] NavigationEnd - THE activities-demo route IS NOT ACTIVE  ', event.url);
                    this.ACTIVITIES_ROUTE_IS_ACTIVE = false;
                }

                if (event.url.indexOf('/activities-demo') !== -1) {
                    // this.logger.log('[SIDEBAR] NavigationEnd - THE activities-demo route IS ACTIVE  ', event.url);
                    this.ACTIVITIES_DEMO_ROUTE_IS_ACTIVE = true;
                } else {
                    // this.logger.log('[SIDEBAR] NavigationEnd - THE activities-demo route IS NOT ACTIVE  ', event.url);
                    this.ACTIVITIES_DEMO_ROUTE_IS_ACTIVE = false;
                }

                if (event.url.indexOf('/analytics-demo') !== -1) {
                    // this.logger.log('[SIDEBAR] NavigationEnd - THE analytics-demo route IS ACTIVE  ', event.url);
                    this.ANALYTICS_DEMO_ROUTE_IS_ACTIVE = true;
                } else {
                    // this.logger.log('[SIDEBAR] NavigationEnd - THE analytics-demo route IS NOT ACTIVE  ', event.url);
                    this.ANALYTICS_DEMO_ROUTE_IS_ACTIVE = false;
                }

                if (event.url.indexOf('/widget') !== -1) {
                    // this.logger.log('[SIDEBAR] NavigationEnd - THE widget route IS ACTIVE  ', event.url);
                    this.WIDGET_ROUTE_IS_ACTIVE = true;
                } else {
                    // this.logger.log('[SIDEBAR] NavigationEnd - THE widget route IS NOT ACTIVE  ', event.url);
                    this.WIDGET_ROUTE_IS_ACTIVE = false;
                }

                if (event.url.indexOf('/analytics') !== -1) {
                    // this.logger.log('[SIDEBAR] NavigationEnd - THE analytics route IS ACTIVE  ', event.url);
                    this.ANALITYCS_ROUTE_IS_ACTIVE = true;
                } else {
                    // this.logger.log('[SIDEBAR] NavigationEnd - THE analytics route IS NOT ACTIVE  ', event.url);
                    this.ANALITYCS_ROUTE_IS_ACTIVE = false;
                }

                if (event.url.indexOf('/home') !== -1) {
                    // this.logger.log('[SIDEBAR] NavigationEnd - THE home route IS ACTIVE  ', event.url);
                    this.HOME_ROUTE_IS_ACTIVE = true;
                } else {
                    // this.logger.log('[SIDEBAR] NavigationEnd - THE home route IS NOT ACTIVE  ', event.url);
                    this.HOME_ROUTE_IS_ACTIVE = false;
                }

                if (event.url.indexOf('/trigger') !== -1) {
                    // this.logger.log('[SIDEBAR] NavigationEnd - THE home route IS ACTIVE  ', event.url);
                    this.TRIGGER_ROUTE_IS_ACTIVE = true;
                } else {
                    // this.logger.log('[SIDEBAR] NavigationEnd - THE home route IS NOT ACTIVE  ', event.url);
                    this.TRIGGER_ROUTE_IS_ACTIVE = false;
                }

                if (event.url.indexOf('/notification-email') !== -1) {
                    // this.logger.log('[SIDEBAR] NavigationEnd - THE home route IS ACTIVE  ', event.url);
                    this.NOTIFICATION_EMAIL_IS_ACTIVE = true;
                    // this.smallSidebar(true)
                } else {
                    // this.logger.log('[SIDEBAR] NavigationEnd - THE home route IS NOT ACTIVE  ', event.url);
                    this.NOTIFICATION_EMAIL_IS_ACTIVE = false;
                    // this.smallSidebar(false)
                }

                if (event.url.indexOf('/app-store') !== -1) {
                    // this.logger.log('[SIDEBAR] NavigationEnd - THE home route IS ACTIVE  ', event.url);
                    this.APPS_ROUTE_IS_ACTIVE = true;
                    // this.smallSidebar(true)
                } else {
                    // this.logger.log('[SIDEBAR] NavigationEnd - THE home route IS NOT ACTIVE  ', event.url);
                    this.APPS_ROUTE_IS_ACTIVE = false;
                    // this.smallSidebar(false)
                }

            });
    }


    subscribeToMyAvailibilityCount() {
        this.projectService.myAvailabilityCount
            .subscribe((num: number) => {
                this.logger.log('[SIDEBAR] subscribeToMyAvailibilityCount ', num)
                this.availabilityCount = num;
            })
    }

    translateChangeAvailabilitySuccessMsg() {
        this.translate.get('ChangeAvailabilitySuccessNoticationMsg')
            .subscribe((text: string) => {
                this.changeAvailabilitySuccessNoticationMsg = text;
                // this.logger.log('+ + + change Availability Success Notication Msg', text)
            });
    }

    translateChangeAvailabilityErrorMsg() {
        this.translate.get('ChangeAvailabilityErrorNoticationMsg')
            .subscribe((text: string) => {
                this.changeAvailabilityErrorNoticationMsg = text;
                // this.logger.log('+ + + change Availability Error Notication Msg', text)
            });
    }


    listenHasDeleteUserProfileImage() {
        if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
            this.uploadImageService.hasDeletedUserPhoto.subscribe((hasDeletedImage) => {
                this.logger.log('[SIDEBAR] - hasDeletedImage ? ', hasDeletedImage, '(usecase Firebase)');
                this.userImageHasBeenUploaded = false
                this.userProfileImageExist = false
            });
        } else {
            this.uploadImageNativeService.hasDeletedUserPhoto.subscribe((hasDeletedImage) => {
                this.logger.log('[SIDEBAR] - hasDeletedImage ? ', hasDeletedImage, '(usecase Native)');
                this.userImageHasBeenUploaded = false
                this.userProfileImageExist = false
            });
        }

    }


    checkUserImageExist() {
        this.usersService.userProfileImageExist.subscribe((image_exist) => {
            this.logger.log('[SIDEBAR] - USER PROFILE EXIST ? ', image_exist);
            this.userProfileImageExist = image_exist;

            if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
                if (this.storageBucket && this.userProfileImageExist === true) {
                    this.logger.log('[SIDEBAR] - USER PROFILE EXIST - BUILD userProfileImageurl');
                    this.setImageProfileUrl(this.storageBucket)
                }
            } else {
                if (this.baseUrl && this.userProfileImageExist === true) {
                    this.setImageProfileUrl_Native(this.baseUrl)
                }
            }
        });
    }



    checkUserImageUploadIsComplete() {
        if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
            this.uploadImageService.userImageWasUploaded.subscribe((image_exist) => {
                this.logger.log('[SIDEBAR] - IMAGE UPLOADING IS COMPLETE ? ', image_exist, '(usecase Firebase)');
                this.userImageHasBeenUploaded = image_exist;
                if (this.storageBucket && this.userImageHasBeenUploaded === true) {
                    this.logger.log('[SIDEBAR] - IMAGE UPLOADING IS COMPLETE - BUILD userProfileImageurl ');
                    this.setImageProfileUrl(this.storageBucket)
                }
            });
        } else {

            // NATIVE
            this.uploadImageNativeService.userImageWasUploaded_Native.subscribe((image_exist) => {
                this.logger.log('[SIDEBAR] USER PROFILE IMAGE - IMAGE UPLOADING IS COMPLETE ? ', image_exist, '(usecase Native)');

                this.userImageHasBeenUploaded = image_exist;
                this.uploadImageNativeService.userImageDownloadUrl_Native.subscribe((imageUrl) => {
                    this.userProfileImageurl = imageUrl
                    this.timeStamp = (new Date()).getTime();
                })
            })
        }
    }

    setImageProfileUrl_Native(storage) {
        this.userProfileImageurl = storage + 'images?path=uploads%2Fusers%2F' + this.currentUserId + '%2Fimages%2Fthumbnails_200_200-photo.jpg';
        this.logger.log('[SIDEBAR] PROFILE IMAGE (USER-PROFILE ) - userProfileImageurl ', this.userProfileImageurl);
        this.timeStamp = (new Date()).getTime();
    }

    setImageProfileUrl(storageBucket) {
        this.userProfileImageurl = 'https://firebasestorage.googleapis.com/v0/b/' + storageBucket + '/o/profiles%2F' + this.currentUserId + '%2Fphoto.jpg?alt=media';
        this.timeStamp = (new Date()).getTime();
    }

    getUserProfileImage() {
        if (this.timeStamp) {
            // this.logger.log('PROFILE IMAGE (USER-PROFILE IN SIDEBAR-COMP) - getUserProfileImage ', this.userProfileImageurl);
            return this.userProfileImageurl + '&' + this.timeStamp;
        }
        return this.userProfileImageurl
    }


    getProjectUserRole() {
        this.usersService.project_user_role_bs.subscribe((user_role) => {
            this.USER_ROLE = user_role;
            this.logger.log('[SIDEBAR] - 1. SUBSCRIBE PROJECT_USER_ROLE_BS ', this.USER_ROLE);
            if (this.USER_ROLE) {
                this.logger.log('[SIDEBAR] - PROJECT USER ROLE ', this.USER_ROLE);
                if (this.USER_ROLE === 'agent') {
                    this.SHOW_SETTINGS_SUBMENU = false;
                }
            }
            //  else {
            //     // used when the page is refreshed
            //     // this.USER_ROLE = this.usersLocalDbService.getUserRoleFromStorage();

            //     /*  IF USER_ROLE IS NULL FROM SUBSCRIPTION IS GOT FROM THE getProjectUser CALLBACK */
            //     this.logger.log('!!! SIDEBAR - 2. PROJECT_USER_ROLE_BS IS NULL GET USER ROLE FROM getProjectUser CALLBACK ', this.USER_ROLE);
            //     if (this.USER_ROLE === 'agent') {
            //         this.SHOW_SETTINGS_SUBMENU = false;
            //     }
            // }
        });
    }

    getProjectUserId() {
        this.usersService.project_user_id_bs.subscribe((projectUser_id) => {
            this.logger.log('[SIDEBAR] - PROJECT-USER-ID ', projectUser_id);

            // if (this.projectUser_id) {
            //     this.logger.log('[SIDEBAR] - PROJECT-USER-ID (THIS)  ', this.projectUser_id);
            //     this.logger.log('[SIDEBAR] - PROJECT-USER-ID ', projectUser_id);

            //     this.usersService.unsubscriptionToWsCurrentUser(projectUser_id)
            // }
            if (projectUser_id) {
                this.projectUser_id = projectUser_id;
            }
        });
    }

    // ============ SUBSCRIPTION TO user_is_available_bs, project_user_id_bs AND user_is_busy$ PUBLISHED BY THE USER SERVICE USED
    /* WF: when the user select A PROJECT,
       - in the HOME COMP is made a call-back to get the PROJECT-USER OBJECT
       - the HOME COMP PASS THE PROJECT-USER AVAILABILITY AND THE PROJECT-USER-ID  AND USER IS BUSY TO THE  USER SERVICE
       - the USER-SERVICE PUBLISH THE PROJECT-USER AVAILABILITY AND THE PROJECT-USER ID
       - the SIDEBAR (this component) SUBSCRIBES THESE VALUES
    */
    getUserAvailability() {
        this.usersService.user_is_available_bs.subscribe((user_available) => {
            this.IS_AVAILABLE = user_available;
            this.logger.log('[SIDEBAR] - USER IS AVAILABLE ', this.IS_AVAILABLE);
        });
    }

    getUserUserIsBusy() {
        this.usersService.user_is_busy$.subscribe((user_isbusy) => {
            this.IS_BUSY = user_isbusy;
            // THE VALUE OS  IS_BUSY IS THEN UPDATED WITH THE VALUE RETURNED FROM THE WEBSOCKET getWsCurrentUserIsBusy$()
            // WHEN, FOR EXAMPLE IN PROJECT-SETTINGS > ADVANCED THE NUM OF MAX CHAT IS 3 AND THE 
            this.logger.log('[SIDEBAR] - USER IS BUSY (from db)', this.IS_BUSY);
        });
    }


    changeAvailabilityState(IS_AVAILABLE) {
        this.logger.log('[SIDEBAR] - CHANGE STATUS - USER IS AVAILABLE ? ', IS_AVAILABLE);
        this.logger.log('[SIDEBAR]- CHANGE STATUS - PROJECT USER ID: ', this.projectUser_id);


        // this.usersService.updateProjectUser(this.projectUser_id, IS_AVAILABLE).subscribe((projectUser: any) => {
        // DONE - WORKS NK-TO-TEST - da implementare quando viene implementato il servizio - serve per cambiare lo stato di disponibilità dell'utente corrente
        // anche in USER & GROUP bisogna cambiare per la riga dell'utente corrente   
        this.usersService.updateCurrentUserAvailability(this.projectId, IS_AVAILABLE).subscribe((projectUser: any) => { // non 

            this.logger.log('[SIDEBAR] PROJECT-USER UPDATED ', projectUser)

            // NOTIFY TO THE USER SERVICE WHEN THE AVAILABLE / UNAVAILABLE BUTTON IS CLICKED
            this.usersService.availability_btn_clicked(true)

        }, (error) => {
            this.logger.error('[SIDEBAR] PROJECT-USER UPDATED ERR  ', error);
            // =========== NOTIFY ERROR ===========
            // this.notify.showNotification('An error occurred while updating status', 4, 'report_problem');
            this.notify.showWidgetStyleUpdateNotification(this.changeAvailabilityErrorNoticationMsg, 4, 'report_problem');

        }, () => {
            this.logger.log('[SIDEBAR] PROJECT-USER UPDATED  * COMPLETE *');

            // =========== NOTIFY SUCCESS===========
            // this.notify.showNotification('status successfully updated', 2, 'done');
            this.notify.showWidgetStyleUpdateNotification(this.changeAvailabilitySuccessNoticationMsg, 2, 'done');


            // this.getUserAvailability()
            this.getProjectUser();
        });
    }

    // IF THE AVAILABILITY STATUS IS CHANGED from THE USER.COMP AVAILABLE / UNAVAILABLE TOGGLE BTN
    // RE-RUN getAllUsersOfCurrentProject TO UPDATE AVAILABLE / UNAVAILABLE BTN ON THE TOP OF THE SIDEBAR
    hasChangedAvailabilityStatusInUsersComp() {
        this.usersService.has_changed_availability_in_users.subscribe((has_changed_availability) => {
            this.logger.log('[SIDEBAR] SUBSCRIBES TO HAS CHANGED AVAILABILITY FROM THE USERS COMP', has_changed_availability)

            if (this.project) {
                this.getProjectUser()
            }
            // this.getWsCurrentUserAvailability$()
        })
    }




    // *** NOTE: THE SAME CALLBACK IS RUNNED IN THE HOME.COMP ***
    getProjectUser() {
        this.logger.log('[SIDEBAR]  !!! SIDEBAR CALL GET-PROJECT-USER')
        this.usersService.getProjectUserByUserId(this.currentUserId).subscribe((projectUser: any) => {

            this.logger.log('[SIDEBAR] PROJECT-USER GET BY USER-ID - PROJECT-ID ', this.projectId);
            this.logger.log('[SIDEBAR] PROJECT-USER GET BY USER-ID - CURRENT-USER-ID ', this.user._id);
            this.logger.log('[SIDEBAR] PROJECT-USER GET BY USER-ID - PROJECT USER ', projectUser);
            this.logger.log('[SIDEBAR] PROJECT-USER GET BY USER-ID - PROJECT USER LENGTH', projectUser.length);
            if ((projectUser) && (projectUser.length !== 0)) {
                // this.logger.log('[SIDEBAR] PROJECT-USER ID ', projectUser[0]._id)
                // this.logger.log('[SIDEBAR] USER IS AVAILABLE ', projectUser[0].user_available)
                // this.logger.log('[SIDEBAR] USER IS BUSY (from db)', projectUser[0].isBusy)
                // this.user_is_available_bs = projectUser.user_available;

                // NOTE_nk: comment this this.subsTo_WsCurrentUser(projectUser[0]._id)
                this.subsTo_WsCurrentUser(projectUser[0]._id)

                if (projectUser[0].user_available !== undefined) {
                    this.usersService.user_availability(projectUser[0]._id, projectUser[0].user_available, projectUser[0].isBusy)
                }

                // ADDED 21 AGO
                if (projectUser[0].role !== undefined) {
                    this.logger.log('[SIDEBAR] GET PROJECT USER ROLE FOR THE PROJECT ', this.projectId, ' »» ', projectUser[0].role);

                    // ASSIGN THE projectUser[0].role VALUE TO USER_ROLE
                    this.USER_ROLE = projectUser[0].role;

                    // SEND THE ROLE TO USER SERVICE THAT PUBLISH
                    this.usersService.user_role(projectUser[0].role);

                }
            } else {
                // this could be the case in which the current user was deleted as a member of the current project
                this.logger.log('[SIDEBAR] PROJECT-USER UNDEFINED ')
            }

        }, (error) => {
            this.logger.error('[SIDEBAR] PROJECT-USER GET BY PROJECT-ID & CURRENT-USER-ID  ', error);
        }, () => {
            this.logger.log('[SIDEBAR] PROJECT-USER GET BY PROJECT ID & CURRENT-USER-ID  * COMPLETE *');
        });
    }


    subsTo_WsCurrentUser(currentuserprjctuserid) {
        this.logger.log('[SIDEBAR] - SUBSCRIBE TO WS CURRENT-USER AVAILABILITY  prjct user id of current user ', currentuserprjctuserid);
        // this.usersService.subscriptionToWsCurrentUser(currentuserprjctuserid);
        this.wsRequestsService.subscriptionToWsCurrentUser(currentuserprjctuserid);

        this.getWsCurrentUserAvailability$();
        this.getWsCurrentUserIsBusy$();
    }

    getWsCurrentUserAvailability$() {
        // this.usersService.currentUserWsAvailability$
        this.wsRequestsService.currentUserWsAvailability$
            .pipe(
                takeUntil(this.unsubscribe$)
            )
            .subscribe((currentuser_availability) => {
                // this.logger.log('[SIDEBAR] - GET WS CURRENT-USER AVAILABILITY - IS AVAILABLE? ', currentuser_availability);
                if (currentuser_availability !== null) {
                    this.IS_AVAILABLE = currentuser_availability;
                }
            }, error => {
                this.logger.error('[SIDEBAR] - GET WS CURRENT-USER AVAILABILITY * error * ', error)
            }, () => {
                this.logger.log('[SIDEBAR] - GET WS CURRENT-USER AVAILABILITY *** complete *** ')
            });
    }

    getWsCurrentUserIsBusy$() {
        // this.usersService.currentUserWsIsBusy$
        this.wsRequestsService.currentUserWsIsBusy$
            .pipe(
                takeUntil(this.unsubscribe$)
            )
            .subscribe((currentuser_isbusy) => {
                // this.logger.log('[SIDEBAR] - GET WS CURRENT-USER - currentuser_isbusy? ', currentuser_isbusy);
                if (currentuser_isbusy !== null) {
                    this.IS_BUSY = currentuser_isbusy;
                    // this.logger.log('[SIDEBAR] - GET WS CURRENT-USER (from ws)- this.IS_BUSY? ', this.IS_BUSY);
                }
            }, error => {
                this.logger.error('[SIDEBAR] - GET WS CURRENT-USER IS BUSY * error * ', error)
            }, () => {
                this.logger.log('[SIDEBAR] - GET WS CURRENT-USER IS BUSY *** complete *** ')
            });


    }
    // NO MORE USED - SUBSTITUDED WITH changeAvailabilityState
    // availale_unavailable_status(hasClickedChangeStatus: boolean) {
    //     hasClickedChangeStatus = hasClickedChangeStatus;
    //     if (hasClickedChangeStatus) {
    //         //   this.display = 'block';

    //         this.IS_AVAILABLE = hasClickedChangeStatus
    //         this.logger.log('HAS CLICKED CHANGE STATUS - IS_AVAILABLE ? ', this.IS_AVAILABLE);
    //     }

    //     if (!hasClickedChangeStatus) {
    //         //   this.display = 'none';
    //         this.logger.log('HAS CLICKED CHANGE STATUS ', hasClickedChangeStatus);
    //         this.IS_AVAILABLE = hasClickedChangeStatus
    //         this.logger.log('HAS CLICKED CHANGE STATUS - IS_AVAILABLE ? ', this.IS_AVAILABLE);
    //     }
    // }


    // GET CURRENT PROJECT - IF IS DEFINED THE CURRENT PROJECT GET THE PROJECTUSER
    getCurrentProject_andThenDepts() {
        this.logger.log('[SIDEBAR] - CALLING GET CURRENT PROJECT  ', this.project)
        this.auth.project_bs.subscribe((project) => {
            this.project = project
            // this.logger.log('[SIDEBAR] project from AUTH service subscription  ', this.project)

            if (this.project) {

                this.getDeptsAndFilterDefaultDept();

                this.projectId = this.project._id

                this.prjct_profile_name = this.project.profile_name;
                this.prjct_trial_expired = this.project.trial_expired;
                this.prjc_trial_days_left = this.project.trial_days_left;
                // this.prjc_trial_days_left_percentage = ((this.prjc_trial_days_left *= -1) * 100) / 30
                this.prjc_trial_days_left_percentage = (this.prjc_trial_days_left * 100) / 30;

                // this.prjc_trial_days_left_percentage IT IS 
                // A NEGATIVE NUMBER AND SO TO DETERMINE THE PERCENT IS MADE AN ADDITION
                const perc = 100 + this.prjc_trial_days_left_percentage
                // this.logger.log('[SIDEBAR] project perc ', perc)


                this.prjc_trial_days_left_percentage = this.round5(perc)
                // this.logger.log('[SIDEBAR] project trial days left % rounded', this.prjc_trial_days_left_percentage);
                // if (roundedPercentage === 0) {
                //     this.prjc_trial_days_left_percentage = 0;
                // }



                // FOR TEST
                // this.prjc_trial_days_left_percentage = 5;
                // this.prjc_trial_days_left_percentage = 10;
                // this.prjc_trial_days_left_percentage = 15;
                // this.prjc_trial_days_left_percentage = 20;
                // this.prjc_trial_days_left_percentage = 25;
                // this.prjc_trial_days_left_percentage = 30;
                // this.prjc_trial_days_left_percentage = 35;
                // this.prjc_trial_days_left_percentage = 40;
                // this.prjc_trial_days_left_percentage = 45;

                // this.prjc_trial_days_left_percentage = 50;
                // this.prjc_trial_days_left_percentage = 55;
                // this.prjc_trial_days_left_percentage = 60;
                // this.prjc_trial_days_left_percentage = 65;
                // this.prjc_trial_days_left_percentage = 70;
                // this.prjc_trial_days_left_percentage = 75;
                // this.prjc_trial_days_left_percentage = 80;
                // this.prjc_trial_days_left_percentage = 85;
                // this.prjc_trial_days_left_percentage = 90;
                // this.prjc_trial_days_left_percentage = 95;
                // this.prjc_trial_days_left_percentage = 100;

                // this.logger.log('[SIDEBAR] project profile name ', this.prjct_profile_name);
                // this.logger.log('[SIDEBAR] project trial expired ', this.prjct_trial_expired);
                // this.logger.log('[SIDEBAR] project trial expired ', this.prjct_trial_expired);
                // this.logger.log('[SIDEBAR] project trial days left  ', this.prjc_trial_days_left);
                // this.logger.log('[SIDEBAR] project trial days left % ', this.prjc_trial_days_left_percentage);



                // IS USED TO GET THE PROJECT-USER AND DETERMINE IF THE USER IS AVAILAVLE / UNAVAILABLE
                // WHEN THE PAGE IS REFRESHED
                this.getProjectUser();
            }
        });
    }

    getDeptsAndFilterDefaultDept() {
        this.deptService.getDeptsByProjectId().subscribe((departments: any) => {
            //   this.logger.log('[SIDEBAR] - DEPTS (FILTERED FOR PROJECT ID)', departments);

            if (departments) {
                departments.forEach(dept => {
                    if (dept.default === true) {
                        // this.logger.log('[SIDEBAR] - GET DEPTS - DEFAULT DEPT ', dept);
                        this.default_dept_id = dept._id;
                        // this.logger.log('[SIDEBAR] - GET DEPTS - DEFAULT DEPT ID: ', this.default_dept_id);
                    }
                })
            }
        }, error => {
            this.logger.error('[SIDEBAR] - GET DEPTS ERR', error);
        }, () => {
            this.logger.log('[SIDEBAR] - GET DEPTS COMPLETE');
        });

    }

    round5(x) {
        // const percentageRounded = Math.ceil(x / 5) * 5;
        // this.logger.log('SIDEBAR project trial days left % rounded', percentageRounded);
        // return Math.ceil(x / 5) * 5;
        return x % 5 < 3 ? (x % 5 === 0 ? x : Math.floor(x / 5) * 5) : Math.ceil(x / 5) * 5
    }

    ngAfterViewInit() {

    }


    isMobileMenu() {
        // console.log('SIDEBAR_IS_SMALL', this.SIDEBAR_IS_SMALL)
        if ($(window).width() > 991) {
            this.IS_MOBILE_MENU = false
            // this.logger.log('[SIDEBAR] - IS MOBILE MENU ', this.IS_MOBILE_MENU);
            // USED FOR THE SMALL SIDEBAR
            // const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
            // const elemSidebar = <HTMLElement>document.querySelector('.sidebar');
            // const elemSidebarWrapper = <HTMLElement>document.querySelector('.sidebar-wrapper');
            // if (this.SIDEBAR_IS_SMALL === false) {
            //     if (this.YOUR_PROJECT_ROUTE_IS_ACTIVE === false && this.AUTOLOGIN_ROUTE_IS_ACTIVE) {
            //         elemMainPanel.style.width = "calc(100% - 260px)";
            //         elemSidebar.style.width = "260px"
            //         elemSidebarWrapper.setAttribute('style', 'width: 260px;background-color: #2d323e!important');
            //     }
            // } else if (this.SIDEBAR_IS_SMALL === true) {
            //     elemMainPanel.style.width = "calc(100% - 70px)"
            //     elemSidebar.style.width = "70px"
            //     elemSidebarWrapper.setAttribute('style', 'width: 70px; background-color: #2d323e!important');
            // }
            return false;
        }

        this.IS_MOBILE_MENU = true

        // USED FOR THE SMALL SIDEBAR
        // const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
        // const elemSidebarWrapper = <HTMLElement>document.querySelector('.sidebar-wrapper');
        // const elemSidebar = <HTMLElement>document.querySelector('.sidebar');
        // elemMainPanel.style.width = "100%"
        // elemSidebarWrapper.setAttribute('style', 'width: 260px;background-color: #2d323e!important');
        // elemSidebar.style.width = "260px"
        // // this.logger.log('[SIDEBAR] - IS MOBILE MENU ', this.IS_MOBILE_MENU);

        return true;
    };

    isMac(): boolean {
        this.logger.log('[SIDEBAR] NAVIGATOR PLATFORM', navigator.platform)
        let bool = false;
        if (navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.platform.toUpperCase().indexOf('IPAD') >= 0) {
            bool = true;
        }
        return bool;
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
        // this.logger.log('SIDEBAR - WINDOW WIDTH ON RESIZE', event.target.innerWidth);
        if (event.target.innerWidth > 991) {
            this.IS_MOBILE_MENU = false

        } else {
            this.IS_MOBILE_MENU = true


        }
    }

    smallSidebar(IS_SMALL) {
        this.SIDEBAR_IS_SMALL = IS_SMALL;
        this.logger.log('[SIDEBAR] smallSidebar ', IS_SMALL)

        const elemSidebarWrapper = <HTMLElement>document.querySelector('.sidebar-wrapper');
        const elemSidebar = <HTMLElement>document.querySelector('.sidebar');
        const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
        const elemHtmlTag = <HTMLElement>document.querySelector('html');
        this.logger.log('[SIDEBAR] smallSidebar', elemHtmlTag)
        elemHtmlTag.style.overflowY = 'auto';
        // this.logger.log('elemAppSidebar', elemAppSidebar)

        if (IS_SMALL === true) {
            elemSidebar.setAttribute('style', 'width: 70px;');
            elemSidebarWrapper.setAttribute('style', 'width: 70px; background-color: #2d323e!important');
            elemMainPanel.setAttribute('style', 'width:calc(100% - 70px);');
            elemMainPanel.style.overflowX = 'hidden';
            elemSidebarWrapper.style.height = "calc(100vh - 45px)";

            // if (this.IS_MOBILE_MENU === false) {
            //     elemMainPanel.style.width = "calc(100% - 70px)"
            // } else {
            //     elemMainPanel.style.width = "100%"
            // }

            // if (window.matchMedia(`(min-width: 992px)`).matches ) {
            //     console.log('[SIDEBAR] smallSidebar TRUE matchMedia' ) 
            //     elemMainPanel.style.width = "100%"
            //  }
            // [].forEach.call(
            //     document.querySelectorAll('.nav-container ul li a p'),
            //     function (el) {
            //         el.setAttribute('style', 'display: none');
            //     }
            // );

            // [].forEach.call(
            //     document.querySelectorAll('.nav-container ul li a'),
            //     function (el) {
            //         el.setAttribute('style', 'height: 40px');
            //     }
            // );

        } else {
            if (this.YOUR_PROJECT_ROUTE_IS_ACTIVE === false && this.AUTOLOGIN_ROUTE_IS_ACTIVE === false) {
                elemSidebar.setAttribute('style', 'width: 260px;');
                elemSidebarWrapper.setAttribute('style', 'width: 260px;background-color: #2d323e!important');
                elemMainPanel.setAttribute('style', 'width:calc(100% - 260px);');
                elemSidebarWrapper.style.height = "calc(100vh - 60px)";
            }
            // if (this.IS_MOBILE_MENU === false) {
            //     elemMainPanel.style.width = "calc(100% - 260px)"
            // } else {
            //     elemMainPanel.style.width = "100%"
            // }


            //  if (window.matchMedia(`(max-width: 991px)`).matches ) {
            //     console.log('[SIDEBAR] smallSidebar FALSE matchMedia' ) 
            //     elemMainPanel.style.width = "100%"
            //  }



            // [].forEach.call(
            //     document.querySelectorAll('.nav-container ul li a p'),
            //     function (el) {
            //         el.setAttribute('style', 'display: block');
            //     }
            // );
        }
    }




    onScroll(event: any): void {
        // this.logger.log('[SIDEBAR] RICHIAMO ON SCROLL ');
        this.elSidebarWrapper = <HTMLElement>document.querySelector('.sidebar-wrapper');
        this.scrollpos = this.elSidebarWrapper.scrollTop
        // this.logger.log('[SIDEBAR] SCROLL POSITION', this.scrollpos)
    }

    stopScroll() {
        // const el = <HTMLElement>document.querySelector('.sidebar-wrapper');
        this.logger.log('[SIDEBAR] SCROLL TO', this.scrollpos);
        this.logger.log('[SIDEBAR] SCROLL TO elSidebarWrapper ', this.elSidebarWrapper)

        // const oh = <HTMLElement>document.querySelector('.oh');
        // this.logger.log('[SIDEBAR] SCROLL TO operating hours ', oh)
        // oh.scrollIntoView();

        if (this.elSidebarWrapper) {

            this.elSidebarWrapper.scrollTop = this.scrollpos;
            // this.elSidebarWrapper.scrollTo(0,242)
        }
    }

    onEvent($event) {
        this.logger.log('[SIDEBAR] SCROLL event ', $event);
        event.stopPropagation();
    }


    goToHome() {
        this.router.navigate(['/project/' + this.projectId + '/home']);
    }
    // goToOperatingHours() {
    //     this.router.navigate(['/project/' + this.projectId + '/hours']);
    // }


    goToBlogChangelog() {
        const url = 'https://www.tiledesk.com/category/changelog/';
        window.open(url, '_blank');

        this.usersLocalDbService.savChangelogDate()
        this.hidechangelogrocket = true;
    }

    goToProjects() {
        this.logger.log('[SIDEBAR] IS MOBILE -  HAS CLICCKED GO TO PROJECT')
        this.router.navigate(['/projects']);

        // (in AUTH SERVICE ) RESET PROJECT_BS AND REMOVE ITEM PROJECT FROM STORAGE WHEN THE USER GO TO PROJECTS PAGE
        this.auth.hasClickedGoToProjects()
        this.logger.log('[SIDEBAR] IS MOBILE project AFTER GOTO PROJECTS ', this.project)
    }

    has_clicked_settings(SHOW_SETTINGS_SUBMENU: boolean) {
        this.SHOW_SETTINGS_SUBMENU = SHOW_SETTINGS_SUBMENU;
        this.logger.log('[SIDEBAR] HAS CLICKED SETTINGS - SHOW_SETTINGS_SUBMENU ', this.SHOW_SETTINGS_SUBMENU);

        // SAVE IN 'show_settings_submenu' KEY OF LOCAL STORAGE THE VALUE OF this.SHOW_SETTINGS_SUBMENU
        // (IS USED TO DISPLAY / HIDE THE SUBMENU WHEN THE PAGE IS REFRESHED)
        localStorage.setItem('show_settings_submenu', `${this.SHOW_SETTINGS_SUBMENU}`);

        if (this.SHOW_SETTINGS_SUBMENU === true) {
            this.trasform = 'rotate(180deg)';
        } else {
            this.trasform = 'none';
        }
    }

    // USED FOR SIDEBAR IN MOBILE MODE (TOGGLE THE CARET OF THE 'PROJECT NAME' DROPDOWN-MENU)
    has_cliked_hidden_project(SHOW_PRJCT_SUB) {
        this.logger.log('[SIDEBAR] HAS CLICKED PROJECT NAME ON MOBILE - SHOW SUBMENU ', this.SHOW_PRJCT_SUB);
        if (this.SHOW_PRJCT_SUB === true) {
            this.trasform_projectname_caret = 'rotate(180deg)';
        } else {
            this.trasform_projectname_caret = 'none';
        }
    }

    // USED FOR SIDEBAR IN MOBILE MODE (TOGGLE THE CARET OF THE 'NAME OF THE CURRENT USER' DROPDOWN-MENU)
    has_cliked_hidden_profile(SHOW_PROFILE_SUB) {
        this.logger.log('[SIDEBAR] HAS CLICKED NAME OF THE CURRENT USER ON MOBILE - SHOW SUBMENU ', this.SHOW_PRJCT_SUB);
        if (this.SHOW_PROFILE_SUB === true) {
            this.transform_user_profile_caret = 'rotate(180deg)';
        } else {
            this.transform_user_profile_caret = 'none';
        }
    }



    openLogoutModal() {
        this.logger.log('[SIDEBAR] - calling openLogoutModal - PROJRCT ID ', this.projectId);
        this.displayLogoutModal = 'block';
        this.auth.hasOpenedLogoutModal(true);

        // if (this.projectId !== undefined) {
        //     this.usersService.logout_btn_clicked_from_mobile_sidebar(true);
        // } else {
        //     this.usersService.logout_btn_clicked_from_mobile_sidebar_project_undefined(true);
        // }
    }

    onCloseModal() {
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
        this.auth.signOut('sidebar');

    }

    removeChatBtnFocus() {
        this.notify.publishHasClickedChat(true);
        this.elementRef.nativeElement.blur();
    }

    openChat() {
        this.elementRef.nativeElement.blur();
        this.notify.publishHasClickedChat(true);
        // const url = this.CHAT_BASE_URL;
        // this.openWindow('Tiledesk - Open Source Live Chat', url)
        // this.focusWin('Tiledesk - Open Source Live Chat')
        // --- new 

        let baseUrl = this.CHAT_BASE_URL + '#/conversation-detail/'
        let url = baseUrl
        const myWindow = window.open(url, 'Tiledesk - Open Source Live Chat');
        myWindow.focus();
        // const chatTabCount = localStorage.getItem('tabCount');
        // this.logger.log('[SIDEBAR] openChat chatTabCount ', chatTabCount);
        // if (chatTabCount) {
        //     if (+chatTabCount > 0) {
        //         this.logger.log('[SIDEBAR] openChat chatTabCount > 0 ')

        //         this.openWindow('Tiledesk - Open Source Live Chat', url + '?conversation_detail');
        //         // this.focusWin('Tiledesk - Open Source Live Chat')
        //         // window.open('Tiledesk - Open Source Live Chat', url).focus();
        //     } else if (chatTabCount && +chatTabCount === 0) {
        //         this.openWindow('Tiledesk - Open Source Live Chat', url);
        //     }
        // } else {
        //     this.openWindow('Tiledesk - Open Source Live Chat', url);
        // }

    }

    openWindow(winName: any, winURL: any) {
        const myWindows = new Array();
        if (myWindows[winName] && !myWindows[winName].closed) {
            alert('window already exists');
        } else {
            myWindows[winName] = window.open(winURL, winName);
        }
    }

    focusWin(winName: any) {
        const myWindows = new Array();
        if (myWindows[winName] && !myWindows[winName].closed) {
            myWindows[winName].focus();
        } else {
            // alert('cannot focus closed or nonexistant window');
            this.logger.log('[SIDEBAR] - cannot focus closed or nonexistant window');
        }
    }





    // SE IMPLEMENTATO NELL 'AFTER VIEW INIT' RITORNA ERRORE:
    // Cannot read property 'nativeElement' of undefined
    // PER ORA LO COMMENTO NELL 'AFTER VIEW INIT'
    checkForUnathorizedRoute() {
        this.router.events.subscribe((val) => {
            if (this.location.path() !== '') {
                this.checked_route = this.location.path();
                this.logger.log('[SIDEBAR] CHECKED ROUTE ', this.checked_route)
                if (this.checked_route.indexOf('/unauthorized') !== -1) {

                    // RESOLVE THE BUG 'HOME button remains focused WHEN AN USER WITH AGENT ROLE TRY TO ACCESS TO AN UNATHORIZED PAGE 
                    // IS REDIRECTED TO THE unauthorized page
                    this.homeBtnElement.nativeElement.blur();
                }
            }
        })
    }

    mouseOver(_isOverAvar: boolean) {
        this.isOverAvar = _isOverAvar
        // this.logger.log('[SIDEBAR] Mouse Over Avatar Container ', _isOverAvar)
    }

 
    // goToAnalytics() {
    //     this.router.navigate(['project/' + this.projectId + '/analytics']);
    // }

    // goToActivities() {
    //     this.router.navigate(['project/' + this.projectId + '/activities']);
    // }








}
