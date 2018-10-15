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
    DETECTED_PROJECT_PAGE = false;
    CHAT_BASE_URL = environment.chat.CHAT_BASE_URL

    displayLogoutModal = 'none';

    APP_IS_DEV_MODE: boolean;

    userProfileImageExist: boolean;
    userImageHasBeenUploaded: boolean;
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
        private uploadImageService: UploadImageService
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
        this.detectProjectPage()

        this.checkUserImageUploadIsComplete()

        // used when the page is refreshed
        this.checkUserImageExist()

    } // OnInit

    checkUserImageExist() {
        this.usersService.userProfileImageExist.subscribe((image_exist) => {
            console.log('USER-PROFILE - USER PROFILE EXIST ? ', image_exist);
            this.userProfileImageExist = image_exist;
        });
    }
    checkUserImageUploadIsComplete() {
        this.uploadImageService.imageExist.subscribe((image_exist) => {
            console.log('USER-PROFILE - IMAGE UPLOADING IS COMPLETE ? ', image_exist);
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
                    console.log('»> »> »> NAVBAR ROUTE DETECTED  »> ', this.route)
                    this.DETECTED_CHAT_PAGE = true;
                } else {
                    this.DETECTED_CHAT_PAGE = false;
                }
            }
        });
    }

    // USED TO ASSIGN THE CLASS is-project-page TO THE EMAIL VERIFICATION ALERT
    detectProjectPage() {

        this.router.events.subscribe((val) => {

            if (this.location.path() !== '') {
                this.route = this.location.path();
                // console.log('»> »> »> NAVBAR ROUTE DETECTED »> ', this.route)
                if (this.route === '/projects') {
                    console.log('»> »> »> NAVBAR ROUTE DETECTED  »> ', this.route)
                    this.DETECTED_PROJECT_PAGE = true;
                } else {
                    this.DETECTED_PROJECT_PAGE = false;
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

                    // this.lastRequest = requests[requests.length - 1];
                    // console.log('!!! »»» LAST UNSERVED REQUEST ', this.lastRequest)
                    console.log('!!! »»» UNSERVED REQUEST IN BOOTSTRAP NOTIFY ', r)
                    this.showNotification('<span style="font-weight: 400; font-family: Google Sans, sans-serif;">' + r.requester_fullname + '</span>' + '<em style="font-family: Google Sans, sans-serif;">' + r.first_text + '</em>');

                    this.shown_requests[r.id] = true;
                    // r.notification_already_shown = true;
                }
            });
            // this.unservedRequestCount = count;
        }
    });
}

// !!! NO MORE USED
getUnservedRequestLenght() {
    // GET COUNT OF UNSERVED REQUESTS
    this.requestsService.getCountUnservedRequest().subscribe((count: number) => {
        this.unservedRequestCount = count;
        console.log(' ++ +++ (navbar) COUNT OF UNSERVED REQUEST ', this.unservedRequestCount);

    });
}

// !!! NO MORE USED
getUnservedRequestLenght_bs() {
    // SUBSCRIBE TO UNSERVED REQUESTS PUBLISHED BY REQUEST SERVICE
    this.requestsService.mySubject.subscribe(
        (values) => {
            // console.log('xxxxx xxxxx', values)
            if (values) {
                this.unservedRequestCount = values.length
                // console.log('NAVBAR SUBSCRIBE TO REQUEST SERVICE PUBLISHED REQUESTS ', values)
                // console.log('NAVBAR SUBSCRIBE TO REQUEST PUBLISHED COUNT OF UNSERVED REQUEST ', this.unservedRequestCount);
                // let i: any;
                // for (i = 0; i < values.length; i++) {
                //     this.valueText = values[i].text
                //     console.log('REQUEST TEXT: ', this.valueText )
                // }

                // GET THE LAST REQUEST (note: lastRequest.text replaced with lastRequest.first_text)
                // this.lastRequest = values[values.length - 1];
                // console.log('NAVBAR - LAST REQUEST: ', this.lastRequest)
                // console.log('NAVBAR - LAST REQUEST (FIRST) TEXT: ', this.lastRequest.first_text)
                // console.log('NAVBAR - LAST REQUEST RECIPIENT (ID): ', this.lastRequest.recipient)
                // console.log('NAVBAR - LAST REQUEST SUPPORT STATUS: ', this.lastRequest.support_status)

                // console.log('NAVBAR - MEMBERS IN LAST REQUEST ', this.lastRequest.members)

                // this.user = firebase.auth().currentUser;
                // console.log('NAVBAR COMPONENT: LOGGED USER ', this.user);
                // if (this.user) {
                //     this.currentUserFireBaseUID = this.user.uid
                //     console.log(' -- > FIREBASE SIGNED-IN USER UID GET IN NAVBAR COMPONENT', this.currentUserFireBaseUID);
                // }
                // IF THE CURRENT USER UID IS ALREADY MEMBER OF THE CONVERSATION DOES NOT SHOW THE NOTIFICATION
                // this avoid a new display of the notification related to the unserved request when the user joins to
                // the same request
                // this.requestsService.getSnapshotConversationByRecipient(this.lastRequest.recipient)
                //     .subscribe((request) => {
                //         console.log('NAVBAR - LAST REQUEST ', request)
                //         this.membersObjectInRequestArray = request[0].members;
                //         console.log('NAVBAR - MEMBERS IN LAST REQUEST ', this.membersObjectInRequestArray)

                //         const uidKeysInMemberObject = Object.keys(this.membersObjectInRequestArray)
                //         console.log('UID KEYS CONTAINED IN MEMBER OBJECT ', Object.keys(this.membersObjectInRequestArray))

                //         const lengthOfUidKeysInMemberObject = uidKeysInMemberObject.length;
                //         console.log('LENGHT OF UID KEY CONTAINED IN MEMBER OBJECT ', lengthOfUidKeysInMemberObject)

                //         let i: number;
                //         for (i = 0; i < lengthOfUidKeysInMemberObject; i++) {
                //             const uidKey = uidKeysInMemberObject[i];

                //             if (uidKey === this.currentUserFireBaseUID) {
                //                 console.log('CURRENT USER IS BETWEEN THE MEMBERS')
                //                 this.CURRENT_USER_UID_IS_BETWEEN_MEMBERS = true;
                //             } else {
                //                 this.CURRENT_USER_UID_IS_BETWEEN_MEMBERS = false;
                //             }
                //         }

                //     });

                // this.requestsService.getSnapshotConversationByRecipient(this.lastRequest.recipient)
                //     .subscribe((request) => {

                //     });
                // if (this.CURRENT_USER_UID_IS_BETWEEN_MEMBERS === false) {
                // if (this.lastRequest) {

                // if (this.lastRequest.recipient !== this.SHOW_NOTIFICATION_FOR_REQUEST_RECIPIENT) {
                // this.SHOW_NOTIFICATION_FOR_REQUEST_RECIPIENT = this.lastRequest.recipient;
                // console.log('SHOW_NOTIFICATION_FOR_REQUEST WITH RECIPIENT ', this.SHOW_NOTIFICATION_FOR_REQUEST_RECIPIENT);

                // if (this.SHOW_NOTIFICATION_FOR_REQUEST_RECIPIENT === true) {


                // GET CURRENT USER FROM LOCAL STORAGE
                // const userKey = Object.keys(window.localStorage)
                //     .filter(it => it.startsWith('firebase:authUser'))[0];
                // this.LOCAL_STORAGE_CURRENT_USER = userKey ? JSON.parse(localStorage.getItem(userKey)) : undefined;
                // console.log('NAVBAR - USER GET FROM LOCAL STORAGE ', this.LOCAL_STORAGE_CURRENT_USER)

                // GET LAST REQUEST RECIPIENT FROM LOCAL STORAGE
                // this.LOCAL_STORAGE_LAST_REQUEST_RECIPIENT = localStorage.getItem(this.lastRequest.recipient)
                // console.log(' --  LOCAL STORAGE GET LAST REQUEST ID ',  this.LOCAL_STORAGE_LAST_REQUEST_RECIPIENT)

                /**
                 * ====== DISPLAY THE LAST REQUEST IN A NOTIFICATION ======
                 * WHENEVER A NOTIFICATION IS DISPLAYED ITS REQUEST-RECIPIENT IS SAVED IN THE LOCAL STORAGE
                 * WHEN IS GET ANOTHER LAST REQUEST THIS IS DISPLAYED IN A NOTIFICATION IF:
                 * - ITS REQUEST-RECIPIENT IS NOT PRESENT IN THE LOCAL STORAGE
                 *   (this so that the last request is only displayed once in the notification)
                 * - THE CURRENT USER IS PRESENT IN THE LOCAL STORAGE
                 *   (this so that the last request is only displayed if there is a user logged)
                 */

                // if ((this.LOCAL_STORAGE_LAST_REQUEST_RECIPIENT === null) && (this.LOCAL_STORAGE_CURRENT_USER !== undefined) && (this.lastRequest.support_status === 100)) {
                //     this.showNotification(this.lastRequest.recipient)
                //     this.audio = new Audio();
                //     this.audio.src = 'assets/Carme.mp3';
                //     this.audio.load();
                //     this.audio.play();
                // }

            }

        }
    ); // mySubject.subscribe
}

/** // !!! NO MORE USED
 * ====== DISPLAY THE LAST REQUEST IN A NOTIFICATION ======
 * WHEN IS GET ANOTHER LAST REQUEST THIS IS DISPLAYED IN A NOTIFICATION IF:
 * - THE USER IS SIGNED IN
 *   (this so that the last request is only displayed if there is a user logged)
 *   note: to get the boolean value of this.USER_IS_SIGNED_IN the navbar subscribe to IS_LOGGED_IN published by authguard)
 */
getLastRequest() {
    this.requestsService.getSnapshotLastConversation().subscribe((last_request) => {
        console.log('NAVBAR - SUBSCRIPTION TO REQUEST WITH SUPPORT-STATUS == 100 ', last_request);


        this.lastRequest = last_request[last_request.length - 1];
        // this.lastRequest = last_request;
        console.log('NAVBAR <-> LAST UNSERVED REQUEST ', this.lastRequest);
        // && (this.USER_IS_SIGNED_IN === true)
        if ((this.lastRequest) && (this.USER_IS_SIGNED_IN === true)) {
            // MOVED IN REQUEST DETAIL
            // this.showNotification(this.lastRequest.recipient)

            // this.audio = new Audio();
            // this.audio.src = 'assets/Carme.mp3';
            // this.audio.load();
            // this.audio.play();


            // GET LAST REQUEST DETAIL
            this.afs.collection('conversations')
                .doc(this.lastRequest.recipient)
                .ref
                .get().then((doc: any) => {
                    if (doc.exists) {
                        console.log('LAST REQUEST DETAIL - Document data:', doc.data());
                        // console.log('LAST REQUEST DETAIL PREVIOUS- Document data:', doc.data.previous.data() );
                        const support_status = doc.data().support_status
                        const id = doc.data().recipient
                        const timestamp = doc.data().timestamp
                        console.log('LAST REQUEST DETAIL S-Status - Document data:', support_status, ' ID ', id, ' TIMEST ', timestamp);

                        if (support_status === 100) {

                            this.showNotification(this.lastRequest.recipient)
                            console.log('LAST REQUEST LENGHT ', this.lastRequest.length)
                            // for (const r of this.lastRequest) {
                            //     if (r.recipient === doc.data().recipient) {
                            //         r.notification = true;
                            //     }
                            // }

                        }
                    } else {
                        console.log('No such document!');
                    }
                }).catch((error: any) => {
                    console.log('Error getting document:', error);
                });

            // GET PREVIOUS VALUE ON-UPDATE
            // this.afs.doc(`conversations/${this.lastRequest.recipient}`)
            //     .update(event => {
            //         const newValue = event.data;
            //         console.log('NEW VALUE ', newValue)

            //         const previousValue = event.data.previous;
            //         console.log('PREVIOUS VALUE ', newValue)
            //     });



            // .document('users/{userId}')
            // .onUpdate(event => {
            //   // Get an object representing the document
            //   // e.g. {'name': 'Marie', 'age': 66}
            //   var newValue = event.data.data();

            //   // ...or the previous value before this update
            //   var previousValue = event.data.previous.data();

            //   // access a particular field as you would any JS property
            //   var name = newValue.name;
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


}
