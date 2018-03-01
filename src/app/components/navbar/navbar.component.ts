import { Component, OnInit, ElementRef, AfterContentChecked, AfterViewChecked } from '@angular/core';
import { ROUTES } from '../sidebar/sidebar.component';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { RequestsService } from '../../services/requests.service';
declare var $: any;
import * as firebase from 'firebase/app';
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

    constructor(
        location: Location,
        private element: ElementRef,
        public auth: AuthService,
        private translate: TranslateService,
        private requestsService: RequestsService,
    ) {
        this.location = location;
        this.sidebarVisible = false;

        // this.unservedRequestCount = 0



    }


    ngOnInit() {
        this.listTitles = ROUTES.filter(listTitle => listTitle);
        const navbar: HTMLElement = this.element.nativeElement;
        this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];


        // GET COUNT OF UNSERVED REQUESTS
        this.requestsService.getCountUnservedRequest().subscribe((count: number) => {
            this.unservedRequestCount = count;
            console.log(' ++ +++ (navbar) COUNT OF UNSERVED REQUEST ', this.unservedRequestCount);

        });

        // SUBSCRIBE TO UNSERVED REQUESTS PUBLISHED BY REQUEST SERVICE
        this.requestsService.mySubject.subscribe(
            (values) => {
                // console.log('xxxxx xxxxx', values)
                if (values) {
                    this.unservedRequestCount = values.length
                    console.log('NAVBAR SUBSCRIBE TO REQUEST SERVICE PUBLISHED REQUESTS ', values)
                    console.log('NAVBAR SUBSCRIBE TO REQUEST PUBLISHED COUNT OF UNSERVED REQUEST ', this.unservedRequestCount);
                    // let i: any;
                    // for (i = 0; i < values.length; i++) {
                    //     this.valueText = values[i].text
                    //     console.log('REQUEST TEXT: ', this.valueText )
                    // }

                    this.lastRequest = values[values.length - 1];
                    console.log('LAST REQUEST TEXT: ', this.lastRequest.text)
                    console.log('LAST REQUEST recipient: ', this.lastRequest.recipient)

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

                    // WHEN A NOTIFICATION IS SHOWED SET IN THE LOCAL STORAGE (see showNotification()) THE LAST REQUEST RECIPIENT THEN
                    // THE NOTIFICATION IS SHOWED ONLY IF IT THERE IS NOT IN THE LOCAL STORAGE AND IF EXIST THE OBJECT USER IL LOCAL STORAGE
                    // (THIS TO AVOID THAT ARE RECEIVED NOTIFICATION WHEN THE USER IS IN THE LOGIN PAGE AND IS YET LOGGED OUT) 
                    // console.log(' --  LOCAL STORAGE GET REQUEST ID ', localStorage.getItem(this.lastRequest.recipient))

                    // GET CURRENT USER FROM LOCAL STORAGE
                    const userKey = Object.keys(window.localStorage)
                        .filter(it => it.startsWith('firebase:authUser'))[0];
                    this.LOCAL_STORAGE_CURRENT_USER = userKey ? JSON.parse(localStorage.getItem(userKey)) : undefined;
                    // console.log('NAVBAR - USER GET FROM LOCAL STORAGE ', this.LOCAL_STORAGE_CURRENT_USER)

                    this.LOCAL_STORAGE_LAST_REQUEST_RECIPIENT = localStorage.getItem(this.lastRequest.recipient)

                    if (this.LOCAL_STORAGE_LAST_REQUEST_RECIPIENT === null && this.LOCAL_STORAGE_CURRENT_USER !== undefined) {

                        this.showNotification(this.lastRequest.recipient)
                        this.audio = new Audio();
                        this.audio.src = 'assets/Carme.mp3';
                        this.audio.load();
                        this.audio.play();
                    }


                }


            }
        );
    }



    showNotification(request_recipient: string) {
        console.log('show notification')
        const type = ['', 'info', 'success', 'warning', 'danger'];

        // const color = Math.floor((Math.random() * 4) + 1);
        // the tree corresponds to the orange
        const color = 3
        console.log('COLOR ', color)
        // const color = '#ffffff';

        $.notify({
            icon: 'notifications',
            // message: 'Welcome to <b>Material Dashboard</b> - a beautiful freebie for every web developer.'
            message: '<b>Ultima richiesta:</b> ' + this.lastRequest.text


        }, {
                type: type[color],
                timer: 2000,
                // placement: {
                //     from: from,
                //     align: align
                // }
            });

        // if (request_recipient === this.lastRequest.recipient) {
        //     console.log('!! HO GIà VISUALIZZATO NOTIFICA PER QUESTA REQUEST  RR ', request_recipient, 'LRR ', this.lastRequest.recipient)
        //     this.SHOW_NOTIFICATION_FOR_REQUEST_RECIPIENT = false;

        // } else {
        //     this.SHOW_NOTIFICATION_FOR_REQUEST_RECIPIENT = true;
        // }
        localStorage.setItem(request_recipient, request_recipient);
        // console.log(' -- -- LOCAL STORAGE  SET REQUEST ID ', localStorage.setItem(request_recipient, request_recipient))
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

    logout() {
        this.auth.signOut();
        // this.display = 'none';
        localStorage.clear();
    }



}
