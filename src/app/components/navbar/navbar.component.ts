// tslint:disable:max-line-length
import { Component, OnInit, ElementRef, AfterContentChecked, AfterViewChecked } from '@angular/core';
// import { ROUTES } from '../sidebar/sidebar.component';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { RequestsService } from '../../services/requests.service';
import { AuthGuard } from '../../core/auth.guard';
import { Router } from '@angular/router';

// FOR TEST
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Request } from '../../models/request-model';

declare var $: any;
import * as firebase from 'firebase/app';
import { forEach } from '@angular/router/src/utils/collection';

import { Project } from '../../models/project-model';
import { UsersService } from '../../services/users.service';
import { environment } from '../../../environments/environment';
import { isDevMode } from '@angular/core';
import { UploadImageService } from '../../services/upload-image.service';
import { NotifyService } from '../../core/notify.service';
import * as moment from 'moment';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, AfterContentChecked, AfterViewChecked {
    private listTitles: any[];
    location: Location;
    private toggleButton: any;
    private sidebarVisible: boolean;
    unservedRequestCount: number;

    value: number
    valueText: string;
    lastRequest: any;
    audio: any;
    membersObjectInRequestArray: any;
    currentUserFireBaseUID: string;
    user: any;
    LOCAL_STORAGE_CURRENT_USER: any;
    // CURRENT_USER_UID_IS_BETWEEN_MEMBERS = false;
    // SHOW_NOTIFICATION_FOR_REQUEST_RECIPIENT: boolean;
    LOCAL_STORAGE_LAST_REQUEST_RECIPIENT: string;
    USER_IS_SIGNED_IN: boolean;
    routerLink = 'routerLink="/analytics"'

    notify: any;
    private shown_requests = {};

    project: Project;
    projectUser_id: string;
    route: string;

    DETECTED_CHAT_PAGE = false;
    // DETECTED_PROJECT_PAGE = false;
    // DETECTED_LOGIN_PAGE = false;
    // DETECTED_SIGNUP_PAGE = false;
    HIDE_PENDING_EMAIL_NOTIFICATION = true;

    DETECTED_USER_PROFILE_PAGE = false;
    CHAT_BASE_URL = environment.chat.CHAT_BASE_URL

    displayLogoutModal = 'none';

    APP_IS_DEV_MODE: boolean;

    userProfileImageExist: boolean;
    userImageHasBeenUploaded: boolean;

    HAS_OPENED_THE_CHAT: boolean;
    constructor(
        location: Location,
        private element: ElementRef,
        public auth: AuthService,
        public authguard: AuthGuard,
        private translate: TranslateService,
        private requestsService: RequestsService,
        private router: Router,
        // FOR TEST
        private afs: AngularFirestore,
        private usersService: UsersService,
        private uploadImageService: UploadImageService,
        private notifyService: NotifyService
    ) {
        this.location = location;
        this.sidebarVisible = false;
        // this.unservedRequestCount = 0

        console.log('IS DEV MODE ', isDevMode());
        this.APP_IS_DEV_MODE = isDevMode()
    }



    ngOnInit() {


        this.getCurrentProject();
        // tslint:disable-next-line:no-debugger
        // debugger
        // this.listTitles = ROUTES.filter(listTitle => listTitle);
        const navbar: HTMLElement = this.element.nativeElement;
        this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];

        // SUBSCRIBE TO IS LOGGED IN PUBLISHED BY AUTH GUARD
        // this.authguard.IS_LOGGED_IN.subscribe((islogged: boolean) => {
        //     this.USER_IS_SIGNED_IN = islogged
        //     console.log('>>> >>> USER IS SIGNED IN ', this.USER_IS_SIGNED_IN);

        // })


        this.updateUnservedRequestCount();

        this.notifyLastUnservedRequest();

        this.checkRequestStatusInShown_requests();

        this.getLoggedUser();

        /* REPLACED */
        // this.getLastRequest();
        // this.getUnservedRequestLenght();
        // this.getUnservedRequestLenght_bs();


        this.getProjectUserId();

        // this.detectChatPage();
        this.hidePendingEmailNotification();
        this.detectUserProfilePage();

        this.checkUserImageUploadIsComplete();

        // used when the page is refreshed
        this.checkUserImageExist();

        this.getFromLocalStorageHasOpenedTheChat();
        this.getFromNotifyServiceHasOpenedChat();


    } // OnInit

    // bs_hasClickedChat IS PUBLISHED WHEN THE USER CLICK THE CHAT BTN FROM SIDEBAR OR HOME
    getFromNotifyServiceHasOpenedChat() {
        this.notifyService.bs_hasClickedChat.subscribe((hasClickedChat) => {
            console.log('NAVBAR - HAS CLICKED CHAT ? ', hasClickedChat);

            if (hasClickedChat === true) {
                this.HAS_OPENED_THE_CHAT = true
            }
        })
    }


    checkUserImageExist() {
        this.usersService.userProfileImageExist.subscribe((image_exist) => {
            console.log('NAVBAR - USER PROFILE EXIST ? ', image_exist);
            this.userProfileImageExist = image_exist;
        });
    }
    checkUserImageUploadIsComplete() {
        this.uploadImageService.imageExist.subscribe((image_exist) => {
            console.log('NAVBAR - IMAGE UPLOADING IS COMPLETE ? ', image_exist);
            this.userImageHasBeenUploaded = image_exist;
        });
    }

    /* DETECT IF IS THE CHAT PAGE */
    detectChatPage() {

        this.router.events.subscribe((val) => {


            if (this.location.path() !== '') {
                this.route = this.location.path();
                // console.log('»> »> »> NAVBAR ROUTE DETECTED »> ', this.route)
                if (this.route === '/chat') {
                    // console.log('»> »> »> NAVBAR ROUTE DETECTED  »> ', this.route)
                    this.DETECTED_CHAT_PAGE = true;
                } else {
                    this.DETECTED_CHAT_PAGE = false;
                }
            }
        });
    }

    /**
     * - WHEN IS DETECTED THE PROJECT PAGE OR THE LOGIN PAGE OR THE SIGNUP PAGE  THE "PENDING EMAIL VERIFICATION ALERT " IS NOT DISPLAYED
     */
    hidePendingEmailNotification() {

        this.router.events.subscribe((val) => {

            if (this.location.path() !== '') {
                this.route = this.location.path();
                // console.log('»> »> »> NAVBAR ROUTE DETECTED »> ', this.route)
                if ((this.route === '/projects') || (this.route === '/login') || (this.route === '/signup')) {
                    // console.log('»> »> »> NAVBAR ROUTE DETECTED  »> ', this.route)
                    // this.DETECTED_PROJECT_PAGE = true;
                    this.HIDE_PENDING_EMAIL_NOTIFICATION = true;
                    // console.log('»> »> »> NAVBAR ROUTE DETECTED  »> ', this.route, 'HIDE PENDING_EMAIL_NOTIFICATION ', this.HIDE_PENDING_EMAIL_NOTIFICATION)
                } else {
                    this.HIDE_PENDING_EMAIL_NOTIFICATION = false;
                    // console.log('»> »> »> NAVBAR ROUTE DETECTED  »> ', this.route, 'HIDE PENDING_EMAIL_NOTIFICATION ', this.HIDE_PENDING_EMAIL_NOTIFICATION)
                }

                // if (this.route === '/login') {
                //     console.log('»> »> »> NAVBAR ROUTE DETECTED  »> ', this.route)
                //     // this.DETECTED_LOGIN_PAGE = true;
                //     this.HIDE_PENDING_EMAIL_NOTIFICATION = true;
                // } else {
                //     // this.DETECTED_LOGIN_PAGE = false;
                //     this.HIDE_PENDING_EMAIL_NOTIFICATION = false;
                // }

                // if (this.route === '/signup') {
                //     console.log('»> »> »> NAVBAR ROUTE DETECTED  »> ', this.route)
                //     // this.DETECTED_SIGNUP_PAGE = true;
                //     this.HIDE_PENDING_EMAIL_NOTIFICATION = true;
                // } else {
                //     // this.DETECTED_SIGNUP_PAGE = false;
                //     this.HIDE_PENDING_EMAIL_NOTIFICATION = false;
                // }

            }
        });
    }

    /**
     * WHEN IS DETECTED THE USER-PROFILE PAGE (NOTE: THE ROUTE '/user-profile' IS THAT IN WHICH THERE IS NOT THE SIDEBAR)
     * TO THE "PENDING EMAIL VERIFICATION ALERT " IS ASIGNED THE CLASS is-user-profile-page THAT MODIFIED THE LEFT POSITION */
    detectUserProfilePage() {
        this.router.events.subscribe((val) => {

            if (this.location.path() !== '') {
                this.route = this.location.path();
                if (this.route === '/user-profile') {

                    this.DETECTED_USER_PROFILE_PAGE = true;
                    // console.log('»> »> »> NAVBAR ROUTE DETECTED  »> ', this.route, 'DETECTED_USER_PROFILE_PAGE ', this.DETECTED_USER_PROFILE_PAGE)
                } else {
                    this.DETECTED_USER_PROFILE_PAGE = false;
                    // console.log('»> »> »> NAVBAR ROUTE DETECTED  »> ', this.route, 'DETECTED_USER_PROFILE_PAGE ', this.DETECTED_USER_PROFILE_PAGE)
                }
            }
        });
    }

    getCurrentProject() {
        // this.project = this.auth.project_bs.value;
        this.auth.project_bs.subscribe((project) => {
            this.project = project
            console.log('!!C-U 00 -> NAVBAR project from AUTH service subscription ', this.project);
        });
    }

    getLoggedUser() {
        this.auth.user_bs.subscribe((user) => {
            console.log('»»» »»» USER GET IN NAVBAR ', user)
            // tslint:disable-next-line:no-debugger
            // debugger
            this.user = user;
        });
    }


    goToProjects() {
        console.log('HAS CLICCKED GO TO PROJECT ')
        this.router.navigate(['/projects']);

        // (in AUTH SERVICE ) RESET PROJECT_BS AND REMOVE ITEM PROJECT FROM STORAGE WHEN THE USER GO TO PROJECTS PAGE
        this.auth.hasClickedGoToProjects()
        console.log('00 -> NAVBAR project AFTER GOTO PROJECTS ', this.project)
    }

    goToUserProfile() {
        console.log('»»» »»» NAVBAR GO TO USER PROFILE ', this.project)
        if (this.project) {
            this.router.navigate(['/project/' + this.project._id + '/user-profile']);

        }
    }


    // NEW
    updateUnservedRequestCount() {
        this.requestsService.requestsList_bs.subscribe((requests) => {
            if (requests) {
                let count = 0;
                requests.forEach(r => {
                    if (r.support_status === 100) {
                        count = count + 1;
                    }
                });
                this.unservedRequestCount = count;
            }
        });
    }

    // IS USED FOR: A REQUEST CHANGE STATE
    // FROM -> 100 (THE R. RECIPIENT IS ADDED AND SET TO TRUE IN  shown_requests )
    // TO -> 200 (THE R. RECIPIENT IS SET TO FALSE IN  shown_requests )
    // SO IF THE REQUEST CHANGE AGAIN STATUS IN 100 THE NOTICATION IS AGAIN DISPLAYED
    checkRequestStatusInShown_requests() {
        this.requestsService.requestsList_bs.subscribe((requests) => {
            if (requests) {
                requests.forEach(r => {
                    if (r.support_status !== 100) {
                        console.log('REQUEST WITH STATUS != 100 ', r.support_status)
                        this.shown_requests[r.id] = false;
                    }
                });
            }
        });
    }

    // NOTE: ARE DISPLAYED IN THE NOTIFICATION ONLY THE UNSERVED REQUEST (support_status = 100)
    // THAT ARE NOT FOUND (OR HAVE THE VALUE FALSE) IN THE LOCAL DICTIONARY shown_requests
    // FURTHERMORE THE NOTICATIONS WILL NOT BE DISPLAYED IF THE USER OBJECT IS NULL (i.e THERE ISN'T USER LOGGED IN)
    notifyLastUnservedRequest() {
        this.requestsService.requestsList_bs.subscribe((requests) => {
            if (requests) {

                requests.forEach(r => {


                    if (r.support_status === 100 && !this.shown_requests[r.id] && this.user !== null) {

                        const requestCreationDate = moment(r.created_on);
                        // console.log('notifyLastUnservedRequest REQUEST', r.id, ' CREATED ON ', requestCreationDate);
                        // const today = new Date();
                        const currentTime = moment();
                        // console.log('notifyLastUnservedRequest REQUEST TODAY ', currentTime);

                        const dateDiff = currentTime.diff(requestCreationDate, 'h');
                        console.log('»» WIDGET notifyLastUnservedRequest DATE DIFF ', dateDiff);

                        /**
                         * *** NEW 29JAN19: the unserved requests notifications are not displayed if it is older than one day ***
                         */
                        if (dateDiff < 24) {

                            // this.lastRequest = requests[requests.length - 1];
                            // console.log('!!! »»» LAST UNSERVED REQUEST ', this.lastRequest)

                            // console.log('!!! »»» UNSERVED REQUEST IN BOOTSTRAP NOTIFY ', r)
                            this.showNotification('<span style="font-weight: 400; font-family: Google Sans, sans-serif;">' + r.requester_fullname + '</span>' + '<em style="font-family: Google Sans, sans-serif;">' + r.first_text + '</em>');

                            this.shown_requests[r.id] = true;
                            // r.notification_already_shown = true;
                        }
                    }
                });
                // this.unservedRequestCount = count;
            }
        });
    }


    showNotification(text: string) {
        console.log('show notification')
        const type = ['', 'info', 'success', 'warning', 'danger'];

        // const color = Math.floor((Math.random() * 4) + 1);
        // the tree corresponds to the orange
        const color = 3
        // console.log('COLOR ', color)
        // const color = '#ffffff';

        this.notify = $.notify({
            icon: 'notifications',
            // message: 'Welcome to <b>Material Dashboard</b> - a beautiful freebie for every web developer.'
            // this.lastRequest.text + '<br>ID: ' + request_recipient,
            message: text
            // url: 'routerLink="/requests"',
            // url: 'https://github.com/mouse0270/bootstrap-notify',
            // url: '<a routerLink="/requests">',
            // url: this.router.navigate(['/requests']),
            // target: '_self'
        }, {
                type: type[color],
                timer: 2000,
                // placement: {
                //     from: from,
                //     align: align
                // }
            },
            {
                // onClose: this.test(),
            }
        );

        // if (request_recipient === this.lastRequest.recipient) {
        //     console.log('!! HO GIà VISUALIZZATO NOTIFICA PER QUESTA REQUEST  RR ', request_recipient, 'LRR ', this.lastRequest.recipient)
        //     this.SHOW_NOTIFICATION_FOR_REQUEST_RECIPIENT = false;

        // } else {
        //     this.SHOW_NOTIFICATION_FOR_REQUEST_RECIPIENT = true;
        // }
        // localStorage.setItem(request_recipient, request_recipient);
        // console.log(' -- -- LOCAL STORAGE  SET REQUEST ID ', localStorage.setItem(request_recipient, request_recipient))

        this.audio = new Audio();
        this.audio.src = 'assets/Carme.mp3';
        this.audio.load();
        this.audio.play();



    }

    ngAfterContentChecked() {
        // console.log(' -- --- *** ngAfterContentChecked');
    }

    ngAfterViewChecked() {
        // console.log('++ ++ +++ ngAfterViewChecked');
    }

    sidebarOpen() {
        const toggleButton = this.toggleButton;
        const body = document.getElementsByTagName('body')[0];
        setTimeout(function () {
            toggleButton.classList.add('toggled');
        }, 500);
        body.classList.add('nav-open');

        this.sidebarVisible = true;
    };
    sidebarClose() {
        const body = document.getElementsByTagName('body')[0];
        this.toggleButton.classList.remove('toggled');
        this.sidebarVisible = false;
        body.classList.remove('nav-open');
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

    getTitle() {
        var titlee = this.location.prepareExternalUrl(this.location.path());
        if (titlee.charAt(0) === '#') {
            titlee = titlee.slice(2);
        }
        titlee = titlee.split('/').pop();

        for (var item = 0; item < this.listTitles.length; item++) {
            if (this.listTitles[item].path === titlee) {
                return this.listTitles[item].title;
            }
        }
        return 'Dashboard';
    }



    getProjectUserId() {
        this.usersService.project_user_id_bs.subscribe((projectUser_id) => {
            console.log('NAV-BAR - PROJECT-USER-ID ', projectUser_id);
            this.projectUser_id = projectUser_id;
        });
    }


    // !! NO MORE USED
    // setUnavailableAndlogout() {
    //     console.log('PRESSED NAVBAR LOGOUT  - PRJ-USER ID ', this.projectUser_id);
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
    //         console.log('PRESSED NAVBAR LOGOUT - PRJ-USER ID IS NOT DEFINED - RUN ONLY THE LOGOUT')
    //         this.logout();
    //     }
    // }



    openLogoutModal() {
        this.displayLogoutModal = 'block';
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
        console.log('RUN LOGOUT FROM NAV-BAR')
        this.auth.showExpiredSessionPopup(false);
        this.auth.signOut();
    }

    testExpiredSessionFirebaseLogout() {
        this.auth.testExpiredSessionFirebaseLogout(true)
    }
    openChat() {
        localStorage.setItem('chatOpened', 'true');
        const url = this.CHAT_BASE_URL;
        window.open(url, '_blank');
        this.getFromLocalStorageHasOpenedTheChat();
    }

    getFromLocalStorageHasOpenedTheChat() {

        const storedChatOpenedValue = localStorage.getItem('chatOpened');
        console.log('+ + + STORED CHAT OPENED VALUE ', storedChatOpenedValue);
        if (storedChatOpenedValue && storedChatOpenedValue === 'true') {
            this.HAS_OPENED_THE_CHAT = true;
            console.log('+ + + HAS OPENED THE CHAT ', this.HAS_OPENED_THE_CHAT);
        } else {
            this.HAS_OPENED_THE_CHAT = false;
            console.log('+ + + HAS OPENED THE CHAT ', this.HAS_OPENED_THE_CHAT);
        }
    }
}
