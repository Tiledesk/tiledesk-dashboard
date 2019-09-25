// tslint:disable:max-line-length
import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, Self } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy, PopStateEvent } from '@angular/common';
import 'rxjs/add/operator/filter';
import { NavbarComponent } from './components/navbar/navbar.component';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import PerfectScrollbar from 'perfect-scrollbar';

import { AuthService } from './core/auth.service';
import { TranslateService } from '@ngx-translate/core';

import { RequestsService } from './services/requests.service';

import { NotifyService } from './core/notify.service';
declare const $: any;

import { environment } from '../environments/environment';
export const firebaseConfig = environment.firebase;
import * as firebase from 'firebase';
import 'firebase/auth';

import { AppConfigService } from './services/app-config.service';

@Component({
    selector: 'appdashboard-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
    private _router: Subscription;
    private lastPoppedUrl: string;
    private yScrollStack: number[] = [];
    private unservedRequestCount: number;

    route: string;
    LOGIN_PAGE: boolean;

    userIsSignedIn: boolean;

    @ViewChild(NavbarComponent) navbar: NavbarComponent;

    @ViewChild('myModal') myModal: ElementRef;

    constructor(
        public location: Location,
        private router: Router,
        private translate: TranslateService,
        private requestsService: RequestsService,
        private auth: AuthService,
        private notify: NotifyService,
        public appConfigService: AppConfigService,

        // private faqKbService: FaqKbService,
    ) {


        /**
         * *** ---------------------- ***
         * *** FIREBASE initializeApp ***
         * *** ---------------------- ***
         */
        // firebase.initializeApp(firebaseConfig);

        if (!appConfigService.getConfig().firebase || appConfigService.getConfig().firebase.apiKey === 'CHANGEIT') {
            throw new Error('firebase config is not defined. Please create your firebase-config.json. See the Chat21-Web_widget Installation Page');
        }

        const firebase_conf = JSON.parse(appConfigService.getConfig().firebase)
        console.log('AppConfigService - AppComponent firebase_conf ', firebase_conf)
        firebase.initializeApp(firebase_conf);



        localStorage.removeItem('firebase:previous_websocket_failure');

        console.log('!!! =========== HELLO APP.COMP (constructor) ===========')
        translate.setDefaultLang('en');

        const browserLang = this.translate.getBrowserLang();
        console.log('!!! ===== HELLO APP.COMP ===== BRS LANG ', browserLang)
        if (browserLang) {
            if (browserLang === 'it') {
                this.translate.use('it');
            } else {
                this.translate.use('en');
            }
        }
        // this.unservedRequestCount = 0

    }

    switchLanguage(language: string) {
        this.translate.use(language);
    }

    ngOnInit() {
        console.log(' ====== >>> HELLO APP.COMP (ngOnInit) <<< ====== ')
        console.log('!! FIREBASE  ', firebase);

        this.resetRequestsIfUserIsSignedOut();

        // NEW (SEE ALSO )
        const _elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
        // console.log('APP COMP - MAIN PANEL ', _elemMainPanel)
        _elemMainPanel.setAttribute('style', 'overflow-x: hidden !important;');

        $.material.init();

        // HIDE ELEMENT IF THE USER IN ONE OF THE 'AUTH' PAGES: SIGNIN, SIGUP, WELCOME
        this.hideElementsInAuthPage()

        this.location.subscribe((ev: PopStateEvent) => {
            this.lastPoppedUrl = ev.url;
        });
        this.router.events.subscribe((event: any) => {
            this.navbar.sidebarClose();
            if (event instanceof NavigationStart) {
                if (event.url !== this.lastPoppedUrl) {
                    this.yScrollStack.push(window.scrollY);
                }
            } else if (event instanceof NavigationEnd) {
                if (event.url === this.lastPoppedUrl) {
                    this.lastPoppedUrl = undefined;
                    window.scrollTo(0, this.yScrollStack.pop());
                } else {
                    window.scrollTo(0, 0);
                }
            }
        });

        const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
        const elemSidebar = <HTMLElement>document.querySelector('.sidebar .sidebar-wrapper');

        this._router = this.router.events.filter(event => event instanceof NavigationEnd).subscribe((event: NavigationEnd) => {
            elemMainPanel.scrollTop = 0;
            elemSidebar.scrollTop = 0;
        });
        if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
            let ps = new PerfectScrollbar(elemMainPanel);
            ps = new PerfectScrollbar(elemSidebar);
        }


        this.unsetNavbarBoxShadow();
    }

    resetRequestsIfUserIsSignedOut() {
        const self = this
        console.log('resetRequestsIfUserIsSignedOut ', typeof firebase.auth)
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                console.log('resetRequestsIfUserIsSignedOut - User is signed in. ', user)
                this.userIsSignedIn = true

            } else {
                console.log('resetRequestsIfUserIsSignedOut - No user is signed in. ', user)

                this.userIsSignedIn = false
                console.log('resetRequestsIfUserIsSignedOut - User is signed in. ', this.userIsSignedIn)

                // USED TO DETERMINE WHEN VISUALIZING THE POPUP WINDOW 'SESSION EXPIRED'
                self.auth.userIsSignedIn(this.userIsSignedIn);

                // No user is signed in.
                // tslint:disable-next-line:no-debugger
                // debugger
                if (self.requestsService.unsubscribe) {
                    self.requestsService.unsubscribe()
                    self.requestsService.resetRequestsList()
                }
            }
        });
    }


    // SET TO 'none' the box-shadow style of the navbar in the page in which is present the second navbar (i.e. the bottom-nav)
    unsetNavbarBoxShadow() {
        this.router.events.subscribe((val) => {
            if (this.location.path() !== '') {
                this.route = this.location.path();
                // console.log('»> ', this.route);

                // (this.route.indexOf('/analytics') !== -1) ||
                if ((this.route.indexOf('/requests') !== -1) ||
                    (this.route.indexOf('/users') !== -1) ||
                    (this.route.indexOf('/groups') !== -1)) {

                    const elemNavbar = <HTMLElement>document.querySelector('.navbar');
                    // console.log('»> is analytics -- elemNavbar ', elemNavbar)
                    elemNavbar.setAttribute('style', 'box-shadow:none');

                }
            }
        })
    }


    hideElementsInAuthPage() {
        // GET THE HTML ELEMENT NAVBAR AND SIDEBAR THAT WILL BE HIDDEN IF IS DETECTED THE LOGIN PAGE
        const elemAppSidebar = <HTMLElement>document.querySelector('app-sidebar');
        // console.log('xxxx xxxx elemAppSidebar ', elemAppSidebar)
        const elemNavbar = <HTMLElement>document.querySelector('.navbar');
        const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
        // console.log('xxxx xxxx elemNavbar', elemNavbar)
        // const elemContentainerFluid = <HTMLElement>document.querySelector('.container-fluid');

        const elemNavbarToogle = <HTMLElement>document.querySelector('.navbar-toggle');



        /* DETECT IF IS THE LOGIN PAGE - SIGNUP - WELCOME - VERIFY-EMAIL */
        this.router.events.subscribe((val) => {
            if (this.location.path() !== '') {
                this.route = this.location.path();

                // console.log('»> ', this.route)
                // tslint:disable-next-line:max-line-length
                if ((this.route === '/login') ||
                    (this.route === '/signup') ||
                    (this.route === '/forgotpsw') ||
                    (this.route === '/projects') ||
                    (this.route.indexOf('/verify') !== -1) ||
                    (this.route.indexOf('/resetpassword') !== -1) ||
                    (this.route.indexOf('/pricing') !== -1) ||
                    (this.route.indexOf('/success') !== -1)
                ) {

                    elemNavbar.setAttribute('style', 'display:none;');
                    elemAppSidebar.setAttribute('style', 'display:none;');
                    // margin-top: -70px
                    elemMainPanel.setAttribute('style', 'width:100% !important; overflow-x: hidden !important;');

                    // console.log('DETECT LOGIN PAGE')
                    this.LOGIN_PAGE = true;
                } else {
                    this.LOGIN_PAGE = false;
                    elemAppSidebar.setAttribute('style', 'display:block;');
                    elemNavbar.setAttribute('style', 'display:block;');
                    elemMainPanel.setAttribute('style', 'overflow-x: hidden !important;');
                }
            } else {
                // console.log('»> * ', this.route)
            }
        });
    }

    ngAfterViewInit() {

        this.runOnRouteChange();

        const elemFooter = <HTMLElement>document.querySelector('footer');
        // console.log('xxxx xxxx APP FOOTER ', elemFooter)

        /* HIDE FOOTER IF IS LOGIN PAGE - SIGNUP PAGE */
        this.router.events.subscribe((val) => {
            if (this.location.path() !== '') {
                this.route = this.location.path();
                // console.log('»> ', this.route)
                // tslint:disable-next-line:max-line-length
                if ((this.route === '/login') || (this.route === '/signup') || (this.route === '/forgotpsw') || (this.route.indexOf('/resetpassword') !== -1)) {

                    elemFooter.setAttribute('style', 'display:none;');
                    // console.log('DETECT LOGIN PAGE')
                    // tslint:disable-next-line:max-line-length
                } else {

                    elemFooter.setAttribute('style', '');

                }
            } else {
                // console.log('»> * ', this.route)
            }
        });

        const elemAppFooter = <HTMLElement>document.querySelector('app-footer');
        this.router.events.subscribe((val) => {
            if (this.location.path() !== '') {
                this.route = this.location.path();
                // console.log('»> ', this.route)
                if (this.route.indexOf('/verify') !== -1) {

                    elemAppFooter.setAttribute('style', 'display:none;');
                    // console.log('DETECT LOGIN PAGE')
                    // tslint:disable-next-line:max-line-length
                } else {

                    elemAppFooter.setAttribute('style', '');

                }
            } else {
                // console.log('»> * ', this.route)
            }
        });

    }


    isMaps(path) {
        var titlee = this.location.prepareExternalUrl(this.location.path());
        titlee = titlee.slice(1);
        if (path == titlee) {
            return false;
        }
        else {
            return true;
        }
    }
    runOnRouteChange(): void {
        if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
            const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
            const ps = new PerfectScrollbar(elemMainPanel);
            ps.update();
        }
    }
    isMac(): boolean {
        let bool = false;
        if (navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.platform.toUpperCase().indexOf('IPAD') >= 0) {
            bool = true;
        }
        return bool;
    }

    changeOfRoutes() {
        console.log('changeOfRoutes ')
    }


}
