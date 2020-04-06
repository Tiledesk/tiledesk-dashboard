import { Component, OnInit, AfterViewInit, NgModule, ElementRef, ViewChild, HostListener } from '@angular/core';
import { RequestsService } from '../../services/requests.service';
import { Router, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../core/auth.service';
import { UsersService } from '../../services/users.service';
import { Project } from '../../models/project-model';
// import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
// import { SharedModule } from '../../shared/shared.module';
import { UsersLocalDbService } from '../../services/users-local-db.service';
import { NotifyService } from '../../core/notify.service';
import { UploadImageService } from '../../services/upload-image.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AppConfigService } from '../../services/app-config.service';
import brand from 'assets/brand/brand.json';

// import { publicKey } from '../../utils/util';
// import { public_Key } from '../../utils/util';
import { environment } from '../../../environments/environment';
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

    tparams = brand;
    sidebarLogoWhite_Url = brand.company_logo_white__url;
    hidechangelogrocket = brand.sidebar__hide_changelog_rocket;
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
    SIDEBAR_IS_SMALL: boolean;
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
    isVisibleCAR: boolean; // canned responses

    storageBucket: string;
    private unsubscribe$: Subject<any> = new Subject<any>();

    constructor(
        private requestsService: RequestsService,
        private router: Router,
        public location: Location,
        private route: ActivatedRoute,
        private projectService: ProjectService,
        private auth: AuthService,
        private usersService: UsersService,
        private usersLocalDbService: UsersLocalDbService,
        private notify: NotifyService,
        private uploadImageService: UploadImageService,
        private translate: TranslateService,
        public appConfigService: AppConfigService
    ) { console.log('!!!!! HELLO SIDEBAR') }

    ngOnInit() {
        this.translateChangeAvailabilitySuccessMsg();
        this.translateChangeAvailabilityErrorMsg();

        // !!!! NO MORE USED
        // this.ROUTES = [
        //     { path: `project/${this.projectid}/home`, title: 'Home', icon: 'dashboard', class: '' },
        //     { path: `project/${this.projectid}/requests`, title: 'Visitatori', icon: 'group', class: '' },
        //     { path: 'chat', title: 'Chat', icon: 'chat', class: '' }
        // ]
        // this.menuItems = this.ROUTES.filter(menuItem => menuItem);


        // WHEN THE PAGE IS REFRESHED GETS FROM LOCAL STORAGE IF THE SETTINGS SUBMENU WAS OPENED OR CLOSED
        // this.SETTINGS_SUBMENU_WAS_OPEN = localStorage.getItem('show_settings_submenu')
        // console.log('LOCAL STORAGE VALU OF KEY show_settings_submenu', localStorage.getItem('show_settings_submenu'))
        // this.SHOW_SETTINGS_SUBMENU = this.SETTINGS_SUBMENU_WAS_OPEN
        // console.log('ON INIT - SHOW SETTINGS SUBMENU ', this.SHOW_SETTINGS_SUBMENU)
        // if (localStorage.getItem('show_settings_submenu') === 'true') {
        //     this.trasform = 'rotate(180deg)';
        // } else {
        //     this.trasform = 'none';
        // }
        this.getLoggedUser();
        this.getCurrentProject();

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
        this.getStorageBucket();
        this.brandLog();
        this.getHasOpenBlogKey()
        this.getChatUrl();

      
    }

    getChatUrl() {
        this.CHAT_BASE_URL = this.appConfigService.getConfig().CHAT_BASE_URL;
        console.log('AppConfigService getAppConfig (SIDEBAR) CHAT_BASE_URL', this.CHAT_BASE_URL);
    }



    getHasOpenBlogKey() {
        const hasOpenedBlog = this.usersLocalDbService.getStoredChangelogDate();
        console.log('SIDEBAR  »»»»»»»»» hasOpenedBlog ', hasOpenedBlog);

        if (hasOpenedBlog === true) {
            this.hidechangelogrocket = true;
        }

    }

    brandLog() {
        console.log('BRAND_JSON - SIDEBAR ', brand);
        console.log('BRAND_JSON - SIDEBAR sidebarlogourl ', this.sidebarLogoWhite_Url);
        console.log('BRAND_JSON - SIDEBAR hidechangelogrocket ', this.hidechangelogrocket);
    }

    getStorageBucket() {
        const firebase_conf = this.appConfigService.getConfig().firebase;
        this.storageBucket = firebase_conf['storageBucket'];
        console.log('STORAGE-BUCKET Sidebar ', this.storageBucket)
    }

    getOSCODE() {
        this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
        console.log('AppConfigService getAppConfig (SIDEBAR) public_Key', this.public_Key);

        let keys = this.public_Key.split("-");
        console.log('PUBLIC-KEY (SIDEBAR) - public_Key keys', keys)

        keys.forEach(key => {
            // console.log('NavbarComponent public_Key key', key)
            if (key.includes("ANA")) {
                // console.log('PUBLIC-KEY (SIDEBAR) - key', key);
                let ana = key.split(":");
                // console.log('PUBLIC-KEY (SIDEBAR) - ana key&value', ana);

                if (ana[1] === "F") {
                    this.isVisibleANA = false;
                    // console.log('PUBLIC-KEY (SIDEBAR) - ana isVisible', this.isVisibleANA);
                } else {
                    this.isVisibleANA = true;
                    // console.log('PUBLIC-KEY (SIDEBAR) - ana isVisible', this.isVisibleANA);
                }
            }

            if (key.includes("ACT")) {
                // console.log('PUBLIC-KEY (SIDEBAR) - key', key);
                let act = key.split(":");
                // console.log('PUBLIC-KEY (SIDEBAR) - act key&value', act);

                if (act[1] === "F") {
                    this.isVisibleACT = false;
                    // console.log('PUBLIC-KEY (SIDEBAR) - act isVisible', this.isVisibleACT);
                } else {
                    this.isVisibleACT = true;
                    // console.log('PUBLIC-KEY (SIDEBAR) - act isVisible', this.isVisibleACT);
                }
            }

            if (key.includes("TRI")) {
                // console.log('PUBLIC-KEY (SIDEBAR) - key', key);
                let tri = key.split(":");
                // console.log('PUBLIC-KEY (SIDEBAR) - tri key&value', tri);

                if (tri[1] === "F") {
                    this.isVisibleTRI = false;
                    // console.log('PUBLIC-KEY (SIDEBAR) - tri isVisible', this.isVisibleTRI);
                } else {
                    this.isVisibleTRI = true;
                    // console.log('PUBLIC-KEY (SIDEBAR) - tri isVisible', this.isVisibleTRI);
                }
            }

            if (key.includes("GRO")) {
                // console.log('PUBLIC-KEY (SIDEBAR) - key', key);
                let gro = key.split(":");
                // console.log('PUBLIC-KEY (SIDEBAR) - gro key&value', gro);

                if (gro[1] === "F") {
                    this.isVisibleGRO = false;
                    // console.log('PUBLIC-KEY (SIDEBAR) - gro isVisible', this.isVisibleGRO);
                } else {
                    this.isVisibleGRO = true;
                    // console.log('PUBLIC-KEY (SIDEBAR) - gro isVisible', this.isVisibleGRO);
                }
            }

            if (key.includes("DEP")) {
                // console.log('PUBLIC-KEY (SIDEBAR) - key', key);
                let dep = key.split(":");
                // console.log('PUBLIC-KEY (SIDEBAR) - dep key&value', dep);

                if (dep[1] === "F") {
                    this.isVisibleDEP = false;
                    // console.log('PUBLIC-KEY (SIDEBAR) - dep isVisible', this.isVisibleDEP);
                } else {
                    this.isVisibleDEP = true;
                    // console.log('PUBLIC-KEY (SIDEBAR) - dep isVisible', this.isVisibleDEP);
                }
            }

            if (key.includes("OPH")) {
                // console.log('PUBLIC-KEY (SIDEBAR) - key', key);
                let oph = key.split(":");
                // console.log('PUBLIC-KEY (SIDEBAR) - oph key&value', oph);

                if (oph[1] === "F") {
                    this.isVisibleOPH = false;
                    // console.log('PUBLIC-KEY (SIDEBAR) - oph isVisible', this.isVisibleOPH);
                } else {
                    this.isVisibleOPH = true;
                    // console.log('PUBLIC-KEY (SIDEBAR) - oph isVisible', this.isVisibleOPH);
                }
            }

            if (key.includes("CAR")) {
                console.log('PUBLIC-KEY (SIDEBAR) - key.includes("CAR")', key.includes("CAR"));
                console.log('PUBLIC-KEY (SIDEBAR) - key', key);
                let car = key.split(":");
                console.log('PUBLIC-KEY (SIDEBAR) - car key&value', car);

                if (car[1] === "F") {
                    this.isVisibleCAR = false;
                    console.log('PUBLIC-KEY (SIDEBAR) - car isVisible', this.isVisibleCAR);
                } else {
                    this.isVisibleCAR = true;
                    console.log('PUBLIC-KEY (SIDEBAR) - car isVisible', this.isVisibleCAR);
                }
            }

            /* this generates bugs: the loop goes into the false until the "key" matches "CAR" */
            // else {
            //     this.isVisibleCAR = false;
            //     console.log('PUBLIC-KEY (SIDEBAR) - car isVisible', this.isVisibleCAR);
            // }
        });

        if (!this.public_Key.includes("CAR")) {
            console.log('PUBLIC-KEY (SIDEBAR) - key.includes("CAR")', this.public_Key.includes("CAR"));
            this.isVisibleCAR = false;
        }



    }


    getCurrentRoute() {

        this.router.events.filter((event: any) => event instanceof NavigationEnd)
            .subscribe(event => {
                console.log('SIDEBAR NavigationEnd ', event.url);

                // USED FOR THE BADGE 'NEW'
                if (event.url.indexOf('/activities') !== -1) {
                    // console.log('SIDEBAR NavigationEnd - THE activities-demo route IS ACTIVE  ', event.url);
                    this.ACTIVITIES_ROUTE_IS_ACTIVE = true;
                } else {
                    // console.log('SIDEBAR NavigationEnd - THE activities-demo route IS NOT ACTIVE  ', event.url);
                    this.ACTIVITIES_ROUTE_IS_ACTIVE = false;
                }

                if (event.url.indexOf('/activities-demo') !== -1) {
                    // console.log('SIDEBAR NavigationEnd - THE activities-demo route IS ACTIVE  ', event.url);
                    this.ACTIVITIES_DEMO_ROUTE_IS_ACTIVE = true;
                } else {
                    // console.log('SIDEBAR NavigationEnd - THE activities-demo route IS NOT ACTIVE  ', event.url);
                    this.ACTIVITIES_DEMO_ROUTE_IS_ACTIVE = false;
                }

                if (event.url.indexOf('/analytics-demo') !== -1) {
                    // console.log('SIDEBAR NavigationEnd - THE analytics-demo route IS ACTIVE  ', event.url);
                    this.ANALYTICS_DEMO_ROUTE_IS_ACTIVE = true;
                } else {
                    // console.log('SIDEBAR NavigationEnd - THE analytics-demo route IS NOT ACTIVE  ', event.url);
                    this.ANALYTICS_DEMO_ROUTE_IS_ACTIVE = false;
                }

                if (event.url.indexOf('/widget') !== -1) {
                    // console.log('SIDEBAR NavigationEnd - THE widget route IS ACTIVE  ', event.url);
                    this.WIDGET_ROUTE_IS_ACTIVE = true;
                } else {
                    // console.log('SIDEBAR NavigationEnd - THE widget route IS NOT ACTIVE  ', event.url);
                    this.WIDGET_ROUTE_IS_ACTIVE = false;
                }

                if (event.url.indexOf('/analytics') !== -1) {
                    // console.log('SIDEBAR NavigationEnd - THE analytics route IS ACTIVE  ', event.url);
                    this.ANALITYCS_ROUTE_IS_ACTIVE = true;
                } else {
                    // console.log('SIDEBAR NavigationEnd - THE analytics route IS NOT ACTIVE  ', event.url);
                    this.ANALITYCS_ROUTE_IS_ACTIVE = false;
                }

                if (event.url.indexOf('/home') !== -1) {
                    // console.log('SIDEBAR NavigationEnd - THE home route IS ACTIVE  ', event.url);
                    this.HOME_ROUTE_IS_ACTIVE = true;
                } else {
                    // console.log('SIDEBAR NavigationEnd - THE home route IS NOT ACTIVE  ', event.url);
                    this.HOME_ROUTE_IS_ACTIVE = false;
                }
            });
    }


    subscribeToMyAvailibilityCount() {
        this.projectService.myAvailabilityCount
            .subscribe((num: number) => {
                console.log('SIDEBAR subscribeToMyAvailibilityCount ', num)
                this.availabilityCount = num;
            })
    }

    translateChangeAvailabilitySuccessMsg() {
        this.translate.get('ChangeAvailabilitySuccessNoticationMsg')
            .subscribe((text: string) => {
                this.changeAvailabilitySuccessNoticationMsg = text;
                // console.log('+ + + change Availability Success Notication Msg', text)
            });
    }

    translateChangeAvailabilityErrorMsg() {
        this.translate.get('ChangeAvailabilityErrorNoticationMsg')
            .subscribe((text: string) => {
                this.changeAvailabilityErrorNoticationMsg = text;
                // console.log('+ + + change Availability Error Notication Msg', text)
            });
    }


    checkUserImageExist() {
        this.usersService.userProfileImageExist.subscribe((image_exist) => {
            console.log('SIDEBAR - USER PROFILE EXIST ? ', image_exist);
            this.userProfileImageExist = image_exist;
            if (this.storageBucket && this.userProfileImageExist === true) {
                console.log('SIDEBAR - USER PROFILE EXIST - BUILD userProfileImageurl');
                this.setImageProfileUrl(this.storageBucket)
            }
        });
    }


    checkUserImageUploadIsComplete() {
        this.uploadImageService.imageExist.subscribe((image_exist) => {
            console.log('SIDEBAR - IMAGE UPLOADING IS COMPLETE ? ', image_exist);
            this.userImageHasBeenUploaded = image_exist;
            if (this.storageBucket && this.userImageHasBeenUploaded === true) {
                console.log('SIDEBAR - IMAGE UPLOADING IS COMPLETE - BUILD userProfileImageurl ');
                this.setImageProfileUrl(this.storageBucket)
            }
        });
    }

    setImageProfileUrl(storageBucket) {
        this.userProfileImageurl = 'https://firebasestorage.googleapis.com/v0/b/' + storageBucket + '/o/profiles%2F' + this.currentUserId + '%2Fphoto.jpg?alt=media';
        this.timeStamp = (new Date()).getTime();
    }

    getUserProfileImage() {
        if (this.timeStamp) {
            return this.userProfileImageurl + '&' + this.timeStamp;
        }
        return this.userProfileImageurl
    }


    getProjectUserRole() {
        this.usersService.project_user_role_bs.subscribe((user_role) => {
            this.USER_ROLE = user_role;
            console.log('!!! SIDEBAR - 1. SUBSCRIBE PROJECT_USER_ROLE_BS ', this.USER_ROLE);
            if (this.USER_ROLE) {
                console.log('SIDEBAR - PROJECT USER ROLE ', this.USER_ROLE);
                if (this.USER_ROLE === 'agent') {
                    this.SHOW_SETTINGS_SUBMENU = false;
                }
            }
            //  else {
            //     // used when the page is refreshed
            //     // this.USER_ROLE = this.usersLocalDbService.getUserRoleFromStorage();

            //     /*  IF USER_ROLE IS NULL FROM SUBSCRIPTION IS GOT FROM THE getProjectUser CALLBACK */
            //     console.log('!!! SIDEBAR - 2. PROJECT_USER_ROLE_BS IS NULL GET USER ROLE FROM getProjectUser CALLBACK ', this.USER_ROLE);
            //     if (this.USER_ROLE === 'agent') {
            //         this.SHOW_SETTINGS_SUBMENU = false;
            //     }
            // }
        });
    }

    getProjectUserId() {
        this.usersService.project_user_id_bs.subscribe((projectUser_id) => {
            console.log('SIDEBAR - PROJECT-USER-ID ', projectUser_id);
            this.projectUser_id = projectUser_id;
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
            console.log('!!! SIDEBAR - USER IS AVAILABLE ', this.IS_AVAILABLE);
        });
    }

    getUserUserIsBusy() {
        this.usersService.user_is_busy$.subscribe((user_isbusy) => {
            this.IS_BUSY = user_isbusy;
            // THE VALUE OS  IS_BUSY IS THEN UPDATED WITH THE VALUE RETURNED FROM THE WEBSOCKET getWsCurrentUserIsBusy$()
            // WHEN, FOR EXAMPLE IN PROJECT-SETTINGS > ADVANCED THE NUM OF MAX CHAT IS 3 AND THE 
            console.log('!!! SIDEBAR - USER IS BUSY (from db)', this.IS_BUSY); 
        });
    }


    changeAvailabilityState(IS_AVAILABLE) {
        console.log('SB - CHANGE STATUS - USER IS AVAILABLE ? ', IS_AVAILABLE);
        console.log('SB - CHANGE STATUS - PROJECT USER ID: ', this.projectUser_id);


        // this.usersService.updateProjectUser(this.projectUser_id, IS_AVAILABLE).subscribe((projectUser: any) => {
        // DONE - WORKS NK-TO-TEST - da implementare quando viene implementato il servizio - serve per cambiare lo stato di disponibilità dell'utente corrente
        // anche in USER & GROUP bisogna cambiare per la riga dell'utente corrente   
        this.usersService.updateCurrentUserAvailability(IS_AVAILABLE).subscribe((projectUser: any) => { // non 

            console.log('PROJECT-USER UPDATED ', projectUser)

            // NOTIFY TO THE USER SERVICE WHEN THE AVAILABLE / UNAVAILABLE BUTTON IS CLICKED
            this.usersService.availability_btn_clicked(true)

        }, (error) => {
            console.log('PROJECT-USER UPDATED ERR  ', error);
            // =========== NOTIFY ERROR ===========
            // this.notify.showNotification('An error occurred while updating status', 4, 'report_problem');
            this.notify.showNotification(this.changeAvailabilityErrorNoticationMsg, 4, 'report_problem');

        }, () => {
            console.log('PROJECT-USER UPDATED  * COMPLETE *');

            // =========== NOTIFY SUCCESS===========
            // this.notify.showNotification('status successfully updated', 2, 'done');
            this.notify.showNotification(this.changeAvailabilitySuccessNoticationMsg, 2, 'done');


            // this.getUserAvailability()
            this.getProjectUser();
        });
    }

    // IF THE AVAILABILITY STATUS IS CHANGED from THE USER.COMP AVAILABLE / UNAVAILABLE TOGGLE BTN
    // RE-RUN getAllUsersOfCurrentProject TO UPDATE AVAILABLE / UNAVAILABLE BTN ON THE TOP OF THE SIDEBAR
    hasChangedAvailabilityStatusInUsersComp() {
        this.usersService.has_changed_availability_in_users.subscribe((has_changed_availability) => {
            console.log('SIDEBAR SUBSCRIBES TO HAS CHANGED AVAILABILITY FROM THE USERS COMP', has_changed_availability)

            if (this.project) {
                this.getProjectUser()
            }
        })
    }


    // *** NOTE: THE SAME CALLBACK IS RUNNED IN THE HOME.COMP ***
    getProjectUser() {
        console.log('!!! SIDEBAR CALL GET-PROJECT-USER')
        this.usersService.getProjectUserByUserId(this.currentUserId).subscribe((projectUser: any) => {
            console.log('SB PROJECT-USER GET BY PROJECT-ID ', this.projectId);
            console.log('SB PROJECT-USER GET BY CURRENT-USER-ID ', this.user._id);
            console.log('SB PROJECT-USER GET BY PROJECT-ID & CURRENT-USER-ID ', projectUser);
            console.log('SB PROJECT-USER GET BY PROJECT-ID & CURRENT-USER-ID LENGTH', projectUser.length);
            if ((projectUser) && (projectUser.length !== 0)) {
                console.log('SB PROJECT-USER ID ', projectUser[0]._id)
                console.log('SB USER IS AVAILABLE ', projectUser[0].user_available)
                console.log('SB USER IS BUSY (from db)', projectUser[0].isBusy)
                // this.user_is_available_bs = projectUser.user_available;
                
                this.subsTo_WsCurrentUser(projectUser[0]._id)



                if (projectUser[0].user_available !== undefined) {
                    this.usersService.user_availability(projectUser[0]._id, projectUser[0].user_available, projectUser[0].isBusy)
                }

                // ADDED 21 AGO
                if (projectUser[0].role !== undefined) {
                    console.log('!!! »» SIDEBAR GET PROJECT USER ROLE FOR THE PROJECT ', this.projectId, ' »» ', projectUser[0].role);

                    // ASSIGN THE projectUser[0].role VALUE TO USER_ROLE
                    this.USER_ROLE = projectUser[0].role;

                    // SEND THE ROLE TO USER SERVICE THAT PUBLISH
                    this.usersService.user_role(projectUser[0].role);



                    // save the user role in storage - then the value is get by auth.service:
                    // the user with agent role can not access to the pages under the settings sub-menu
                    // this.auth.user_role(projectUser[0].role);

                    // this.usersLocalDbService.saveUserRoleInStorage(projectUser[0].role);
                }
            } else {
                // this could be the case in which the current user was deleted as a member of the current project
                console.log('SB PROJECT-USER UNDEFINED ')
            }

        }, (error) => {
            console.log('SB PROJECT-USER GET BY PROJECT-ID & CURRENT-USER-ID  ', error);
        }, () => {
            console.log('SB PROJECT-USER GET BY PROJECT ID & CURRENT-USER-ID  * COMPLETE *');
        });
    }


    subsTo_WsCurrentUser(currentuserprjctuserid) {
        console.log('SB - SUBSCRIBE TO WS CURRENT-USER AVAILABILITY  prjct user id of current user ', currentuserprjctuserid);
        this.usersService.subscriptionToWsCurrentUser(currentuserprjctuserid);
        this.getWsCurrentUserAvailability$();
        this.getWsCurrentUserIsBusy$();
    }

    getWsCurrentUserAvailability$() {
        this.usersService.currentUserWsAvailability$
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe((currentuser_availability) => {
            console.log('SB - GET WS CURRENT-USER AVAILABILITY - IS AVAILABLE? ', currentuser_availability);
            if(currentuser_availability !== null)  {
                this.IS_AVAILABLE = currentuser_availability;
            }
        }, error => {
          console.log('SB - GET WS CURRENT-USER AVAILABILITY * error * ', error)
        }, () => {
          console.log('SB - GET WS CURRENT-USER AVAILABILITY *** complete *** ')
        });
    }

    getWsCurrentUserIsBusy$() {
        this.usersService.currentUserWsIsBusy$
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe((currentuser_isbusy) => {
            console.log('SB - GET WS CURRENT-USER - currentuser_isbusy? ', currentuser_isbusy);
            if(currentuser_isbusy !== null)  {
                this.IS_BUSY = currentuser_isbusy;
                console.log('SB - GET WS CURRENT-USER (from ws)- this.IS_BUSY? ', this.IS_BUSY);
            }
        }, error => {
          console.log('SB - GET WS CURRENT-USER IS BUSY * error * ', error)
        }, () => {
          console.log('SB - GET WS CURRENT-USER IS BUSY *** complete *** ')
        });


    }
    // NO MORE USED - SUBSTITUDED WITH changeAvailabilityState
    // availale_unavailable_status(hasClickedChangeStatus: boolean) {
    //     hasClickedChangeStatus = hasClickedChangeStatus;
    //     if (hasClickedChangeStatus) {
    //         //   this.display = 'block';

    //         this.IS_AVAILABLE = hasClickedChangeStatus
    //         console.log('HAS CLICKED CHANGE STATUS - IS_AVAILABLE ? ', this.IS_AVAILABLE);
    //     }

    //     if (!hasClickedChangeStatus) {
    //         //   this.display = 'none';
    //         console.log('HAS CLICKED CHANGE STATUS ', hasClickedChangeStatus);
    //         this.IS_AVAILABLE = hasClickedChangeStatus
    //         console.log('HAS CLICKED CHANGE STATUS - IS_AVAILABLE ? ', this.IS_AVAILABLE);
    //     }
    // }


    // GET CURRENT PROJECT - IF IS DEFINED THE CURRENT PROJECT GET THE PROJECTUSER
    getCurrentProject() {
        console.log('SIDEBAR - CALLING GET CURRENT PROJECT  ', this.project)
        this.auth.project_bs.subscribe((project) => {
            this.project = project
            console.log('00 -> SIDEBAR project from AUTH service subscription  ', this.project)

            if (this.project) {
                this.projectId = this.project._id

                this.prjct_profile_name = this.project.profile_name;
                this.prjct_trial_expired = this.project.trial_expired;
                this.prjc_trial_days_left = this.project.trial_days_left;
                // this.prjc_trial_days_left_percentage = ((this.prjc_trial_days_left *= -1) * 100) / 30
                this.prjc_trial_days_left_percentage = (this.prjc_trial_days_left * 100) / 30;

                // this.prjc_trial_days_left_percentage IT IS 
                // A NEGATIVE NUMBER AND SO TO DETERMINE THE PERCENT IS MADE AN ADDITION
                const perc = 100 + this.prjc_trial_days_left_percentage
                console.log('SIDEBAR project perc ', perc)


                this.prjc_trial_days_left_percentage = this.round5(perc)
                console.log('SIDEBAR project trial days left % rounded', this.prjc_trial_days_left_percentage);
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

                console.log('SIDEBAR project profile name ', this.prjct_profile_name);
                console.log('SIDEBAR project trial expired ', this.prjct_trial_expired);
                console.log('SIDEBAR project trial expired ', this.prjct_trial_expired);
                console.log('SIDEBAR project trial days left  ', this.prjc_trial_days_left);
                console.log('SIDEBAR project trial days left % ', this.prjc_trial_days_left_percentage);



                // IS USED TO GET THE PROJECT-USER AND DETERMINE IF THE USER IS AVAILAVLE / UNAVAILABLE
                // WHEN THE PAGE IS REFRESHED
                this.getProjectUser();
            }
        });
    }

    round5(x) {
        // const percentageRounded = Math.ceil(x / 5) * 5;
        // console.log('SIDEBAR project trial days left % rounded', percentageRounded);
        // return Math.ceil(x / 5) * 5;
        return x % 5 < 3 ? (x % 5 === 0 ? x : Math.floor(x / 5) * 5) : Math.ceil(x / 5) * 5
    }

    ngAfterViewInit() {
        // const elemProgressBar = <HTMLElement>document.querySelector('.progress');
        // const elemProgressBarDataset = elemProgressBar.dataset.percentage
        // console.log('SIDEBAR project ELEMENT PROGRESS', elemProgressBar);
        // console.log('SIDEBAR project ELEMENT PROGRESS elemProgressBarDataset', elemProgressBarDataset);
        // elemProgressBarDataset = '80'


        // this.checkForUnathorizedRoute();

        //     this.SETTINGS_SUBMENU_WAS_OPEN = localStorage.getItem('show_settings_submenu')
        //     console.log('LOCAL STORAGE VALUE OF KEY show_settings_submenu: ', localStorage.getItem('show_settings_submenu'))

        //     if (this.SETTINGS_SUBMENU_WAS_OPEN === 'true') {
        //         console.log(' XXXXX ', this.SETTINGS_SUBMENU_WAS_OPEN)
        //         this.trasform = 'rotate(180deg)';

        //     } else {
        //         this.trasform = 'none';
        //         console.log(' XXXXX ', this.SETTINGS_SUBMENU_WAS_OPEN)
        //     }

    }

    getLoggedUser() {
        this.auth.user_bs.subscribe((user) => {
            console.log('USER GET IN SIDEBAR ', user)
            // tslint:disable-next-line:no-debugger
            // debugger
            this.user = user;

            if (user) {
                this.currentUserId = user._id;
                console.log('Current USER ID ', this.currentUserId)
            }
        });
    }




    isMobileMenu() {
        if ($(window).width() > 991) {
            this.IS_MOBILE_MENU = false

            // console.log('SIDEBAR - IS MOBILE MENU ', this.IS_MOBILE_MENU);

            return false;
        }
        this.IS_MOBILE_MENU = true

        // console.log('SIDEBAR - IS MOBILE MENU ', this.IS_MOBILE_MENU);

        return true;
    };

    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
        // console.log('SIDEBAR - WINDOW WIDTH ON RESIZE', event.target.innerWidth);
        if (event.target.innerWidth > 991) {
            this.IS_MOBILE_MENU = false

        } else {
            this.IS_MOBILE_MENU = true
        }
    }

    onScroll(event: any): void {
        // console.log('SIDEBAR RICHIAMO ON SCROLL ');
        this.elSidebarWrapper = <HTMLElement>document.querySelector('.sidebar-wrapper');
        this.scrollpos = this.elSidebarWrapper.scrollTop
        // console.log('SIDEBAR SCROLL POSITION', this.scrollpos)
    }

    stopScroll() {
        // const el = <HTMLElement>document.querySelector('.sidebar-wrapper');
        console.log('SIDEBAR SCROLL TO', this.scrollpos);
        console.log('SIDEBAR SCROLL TO elSidebarWrapper ', this.elSidebarWrapper)

        // const oh = <HTMLElement>document.querySelector('.oh');
        // console.log('SIDEBAR SCROLL TO operating hours ', oh)
        // oh.scrollIntoView();

        if (this.elSidebarWrapper) {

            this.elSidebarWrapper.scrollTop = this.scrollpos;
            // this.elSidebarWrapper.scrollTo(0,242)
        }
    }

    onEvent($event) {
        console.log('SIDEBAR SCROLL event ', $event);
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
        console.log('SIDEBAR IS MOBILE -  HAS CLICCKED GO TO PROJECT  ')
        this.router.navigate(['/projects']);

        // (in AUTH SERVICE ) RESET PROJECT_BS AND REMOVE ITEM PROJECT FROM STORAGE WHEN THE USER GO TO PROJECTS PAGE
        this.auth.hasClickedGoToProjects()
        console.log('00 -> SIDEBAR IS MOBILE project AFTER GOTO PROJECTS ', this.project)
    }

    has_clicked_settings(SHOW_SETTINGS_SUBMENU: boolean) {
        this.SHOW_SETTINGS_SUBMENU = SHOW_SETTINGS_SUBMENU;
        console.log('HAS CLICKED SETTINGS - SHOW_SETTINGS_SUBMENU ', this.SHOW_SETTINGS_SUBMENU);

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
        console.log('HAS CLICKED PROJECT NAME ON MOBILE - SHOW SUBMENU ', this.SHOW_PRJCT_SUB);
        if (this.SHOW_PRJCT_SUB === true) {
            this.trasform_projectname_caret = 'rotate(180deg)';
        } else {
            this.trasform_projectname_caret = 'none';
        }
    }

    // USED FOR SIDEBAR IN MOBILE MODE (TOGGLE THE CARET OF THE 'NAME OF THE CURRENT USER' DROPDOWN-MENU)
    has_cliked_hidden_profile(SHOW_PROFILE_SUB) {
        console.log('HAS CLICKED NAME OF THE CURRENT USER ON MOBILE - SHOW SUBMENU ', this.SHOW_PRJCT_SUB);
        if (this.SHOW_PROFILE_SUB === true) {
            this.transform_user_profile_caret = 'rotate(180deg)';
        } else {
            this.transform_user_profile_caret = 'none';
        }
    }

    // NO MORE USED
    // setActiveClassToSettings() {
    //     this.isActive = 'active';
    //     console.log('HAS CLICKED SET ACTIVE TO SETTINGS MENU ITEM ', this.isActive);
    // }


    // !! NO MORE USED
    // setUnavailableAndlogout() {
    //     console.log('PRESSED SIDEBAR LOGOUT  - PRJ-USER ID ', this.projectUser_id)
    //     if (this.projectUser_id) {
    //         this.usersService.updateProjectUser(this.projectUser_id, false).subscribe((projectUser: any) => {
    //             console.log('PROJECT-USER UPDATED ', projectUser)
    //         },
    //             (error) => {
    //                 console.log('PROJECT-USER UPDATED ERR  ', error);
    //             },
    //             () => {
    //                 console.log('PROJECT-USER UPDATED  * COMPLETE *');
    //                 this.logout();
    //             });
    //     } else {
    //         // this could be the case in which the current user was deleted as a member of the current project
    //         console.log('PRESSED SIDEBAR LOGOUT - PRJ-USER IS NOT DEFINED - RUN ONLY THE LOGOUT')
    //         this.logout();
    //     }
    // }

    openLogoutModal() {
        console.log('SIDEBAR - calling openLogoutModal - PROJRCT ID ', this.projectId);
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
        this.auth.signOut();

    }

    // RESOLVE THE BUG 'chat button remains focused after clicking'
    // SET IN THE STORAGE THAT THE CHAT HAS BEEN OPENED
    removeChatBtnFocus() {

        this.notify.publishHasClickedChat(true);

        // localStorage.setItem('chatOpened', 'true');
        this.elementRef.nativeElement.blur();
    }

    // SE IMPLEMENTATO NELL 'AFTER VIEW INIT' RITORNA ERRORE:
    // Cannot read property 'nativeElement' of undefined
    // PER ORA LO COMMENTO NELL 'AFTER VIEW INIT'
    checkForUnathorizedRoute() {
        this.router.events.subscribe((val) => {
            if (this.location.path() !== '') {
                this.checked_route = this.location.path();
                console.log('!! »»» SIDEBAR CHECKED ROUTE ', this.checked_route)
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
        // console.log('Mouse Over Avatar Container ', _isOverAvar)
    }

    goToPricing() {
        this.router.navigate(['project/' + this.projectId + '/pricing']);
    }

    // goToAnalytics() {
    //     this.router.navigate(['project/' + this.projectId + '/analytics']);
    // }

    // goToActivities() {
    //     this.router.navigate(['project/' + this.projectId + '/activities']);
    // }


    smallSidebar(IS_SMALL) {
        this.SIDEBAR_IS_SMALL = IS_SMALL;
        console.log('smallSidebar ', IS_SMALL)

        const elemSidebarWrapper = <HTMLElement>document.querySelector('.sidebar-wrapper');
        const elemSidebar = <HTMLElement>document.querySelector('.sidebar');
        const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
        // console.log('elemAppSidebar', elemAppSidebar)

        if (IS_SMALL === true) {


            elemSidebar.setAttribute('style', 'width: 70px;');
            elemSidebarWrapper.setAttribute('style', 'width: 70px; background-color: #2d323e!important');
            elemMainPanel.setAttribute('style', 'width:calc(100% - 70px);');

            [].forEach.call(
                document.querySelectorAll('.nav-container ul li a p'),
                function (el) {
                    console.log('footer > ul > li > a element: ', el);
                    el.setAttribute('style', 'display: none');
                }
            );

            [].forEach.call(
                document.querySelectorAll('.nav-container ul li a'),
                function (el) {
                    console.log('footer > ul > li > a element: ', el);
                    el.setAttribute('style', 'height: 40px');
                }
            );

        } else {
            elemSidebar.setAttribute('style', 'width: 260px;');
            elemSidebarWrapper.setAttribute('style', 'width: 260px;background-color: #2d323e!important');
            elemMainPanel.setAttribute('style', 'width:calc(100% - 260px);');



            [].forEach.call(
                document.querySelectorAll('.nav-container ul li a p'),
                function (el) {
                    console.log('footer > ul > li > a element: ', el);
                    el.setAttribute('style', 'display: block');
                }
            );
        }
    }





}
