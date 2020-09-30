import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, Self, OnDestroy } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy, PopStateEvent } from '@angular/common';
import 'rxjs/add/operator/filter';
import { NavbarComponent } from './components/navbar/navbar.component';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import PerfectScrollbar from 'perfect-scrollbar'; // https://github.com/mdbootstrap/perfect-scrollbar

import { AuthService } from './core/auth.service';
import { TranslateService } from '@ngx-translate/core';

import { RequestsService } from './services/requests.service';

// import { NotifyService } from './core/notify.service';
declare const $: any;

import { environment } from '../environments/environment';
export const firebaseConfig = environment.firebase;
import * as firebase from 'firebase';
import 'firebase/auth';
import { AppConfigService } from './services/app-config.service';
import { WsRequestsService } from './services/websocket/ws-requests.service';
import { WsMsgsService } from './services/websocket/ws-msgs.service';

import { WebSocketJs } from './services/websocket/websocket-js';
import { Title } from '@angular/platform-browser';
// import { webSocket } from "rxjs/webSocket";
export let browserRefresh = false;
import * as moment from 'moment';

// import brand from 'assets/brand/brand.json';
import { BrandService } from './services/brand.service';
import { ScriptService } from './services/script/script.service';



@Component({
    selector: 'appdashboard-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
    private _router: Subscription;
    private lastPoppedUrl: string;
    private yScrollStack: number[] = [];
    private unservedRequestCount: number;

    route: string;
    LOGIN_PAGE: boolean;

    userIsSignedIn: boolean;
    IS_REQUEST_X_PANEL_ROUTE: boolean;
    IS_PROJECTS_FOR_PANEL: boolean;
    BRAND: any;

    @ViewChild(NavbarComponent) navbar: NavbarComponent;

    @ViewChild('myModal') myModal: ElementRef;
    isPageWithNav: boolean;

    // wsbasepath = environment.websocket.wsUrl; // moved
    // wsbasepath = environment.wsUrl;

    subscription: Subscription;
    // background_bottom_section = brand.sidebar.background_bottom_section
    constructor(
        public location: Location,
        private router: Router,
        private translate: TranslateService,
        private requestsService: RequestsService,
        private auth: AuthService,
        // private notify: NotifyService,
        public appConfigService: AppConfigService,
        public wsRequestsService: WsRequestsService,
        public wsMsgsService: WsMsgsService,
        public webSocketJs: WebSocketJs,
        private metaTitle: Title,
        public brandService: BrandService,
        public script: ScriptService,
        // private faqKbService: FaqKbService,
    ) {
        // this.getBrand();

        // script.load('dummy').then(data => {
        // script.load().then(data => {
        //     console.log('APP.COMP - script loaded ', data);
        // }).catch(error => console.log('APP.COMP - script error ', error));

        const brand = brandService.getBrand();

        console.log('APP-COMPONENT - GET BRAND brandService > brand ', brand)


        this.metaTitle.setTitle(brand['metaTitle']); // here used with: "import brand from ..." now see in getBrand()
        this.setFavicon(brand); // here used with "import brand from ..." now see in getBrand()
        

        // ----------------------------
        // FIREBASE initializeApp 
        // ---------------------------- 

        // firebase.initializeApp(firebaseConfig);

        if (!appConfigService.getConfig().firebase || appConfigService.getConfig().firebase.apiKey === 'CHANGEIT') {
            throw new Error('firebase config is not defined. Please create your dashboard-config.json. See the Chat21-Web_widget Installation Page');
        }

        // const firebase_conf = JSON.parse(appConfigService.getConfig().firebase)
        const firebase_conf = appConfigService.getConfig().firebase;
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
                moment.locale('it')

            } else if (browserLang === 'de') {
                this.translate.use('de');
                moment.locale('de')

            } else {
                this.translate.use('en');
            }
        }
        // this.unservedRequestCount = 0


        this.subscription = router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                browserRefresh = !router.navigated;
            }
        });
    }

    setFavicon(brand) {
        var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        console.log('APP.COMP setFavicon ', link)
        link['type'] = 'image/x-icon';
        link['rel'] = 'shortcut icon';
        link['href'] = brand.favicon__url;
        document.getElementsByTagName('head')[0].appendChild(link);

    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    switchLanguage(language: string) {
        this.translate.use(language);
    }

    ngOnInit() {
        console.log(' ====== >>> HELLO APP.COMP (ngOnInit) <<< ====== ')
        console.log('!! FIREBASE  ', firebase);

        this.closeWSAndResetWsRequestsIfUserIsSignedOut();

        // NEW (SEE ALSO )
        const _elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
        // console.log('APP COMP - MAIN PANEL ', _elemMainPanel)
        _elemMainPanel.setAttribute('style', 'overflow-x: hidden !important;');
        // _elemMainPanel.setAttribute('style', 'overflow-x: auto !important;');
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

        // -----------------------------------------------------------------------------------------------------
        // Websocket connection
        // -----------------------------------------------------------------------------------------------------
        this.getCurrentUserAndConnectToWs();
    }


    // ---------------------------
    // GET BRAND
    // ---------------------------
    // getBrand() {
    //     this.brandService.getBrand().subscribe((_brand: any) => {

    //         this.BRAND = _brand;
    //         console.log('APP-COMPONENT - GET BRAND ', this.BRAND);

    //         if (this.BRAND) {
    //             this.metaTitle.setTitle(this.BRAND.metaTitle);
    //             this.setFavicon();
    //         }

    //     }, (error) => {
    //         console.log('APP-COMPONENT GET BRAND - ERROR  ', error);

    //     }, () => {
    //         console.log('APP-COMPONENT GET BRAND * COMPLETE *');

    //     });
    // }



    getCurrentUserAndConnectToWs() {

        this.auth.user_bs.subscribe((user) => {
            console.log('% »»» WebSocketJs WF - APP-COMPONENT - LoggedUser ', user);
            // console.log('% »»» WebSocketJs WF - APP-COMPONENT - WS URL ', this.wsbasepath);
            console.log('AppConfigService % »»» WebSocketJs WF - APP-COMPONENT - WS URL ', this.appConfigService.getConfig().wsUrl);

            if (user && user.token) {

                // const CHAT_URL = 'ws://tiledesk-server-pre.herokuapp.com?token=' + user.token
                const CHAT_URL = this.appConfigService.getConfig().wsUrl + '?token=' + user.token

                console.log('AppConfigService % »»» WebSocketJs WF - APP-COMPONENT - I am about to connect to ws ')

                // -----------------------------------------------------------------------------------------------------
                // Websocket init 
                // -----------------------------------------------------------------------------------------------------
                // NOTE_nk: comment this.webSocketJs.init
                this.webSocketJs.init(
                    CHAT_URL,
                    undefined,
                    undefined,
                    undefined
                );
            }
        });
    }


    closeWSAndResetWsRequestsIfUserIsSignedOut() {
        const self = this
        console.log('% »»» WebSocketJs WF - APP-COMPONENT - closeWSAndResetWsRequestsIfUserIsSignedOut ', typeof firebase.auth)
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                console.log('% »»» WebSocketJs WF - APP-COMPONENT - User is signed in. ', user)
                this.userIsSignedIn = true

            } else {
                console.log('% »»» WebSocketJs WF - APP-COMPONENT - closeWSAndResetWsRequestsIfUserIsSignedOut - No user is signed in. ', user)

                this.userIsSignedIn = false
                console.log('% »»» WebSocketJs WF - APP-COMPONENT - User is signed in. ', this.userIsSignedIn)

                // USED TO DETERMINE WHEN VISUALIZING THE POPUP WINDOW 'SESSION EXPIRED'
                self.auth.userIsSignedIn(this.userIsSignedIn);

                // -----------------------------------------------------------------------------------------------------    
                //  Websocket - Close websocket and reset ws requests list 
                // -----------------------------------------------------------------------------------------------------

                // self.webSocketJs.close()
                self.webSocketClose()
                self.wsRequestsService.resetWsRequestList()

                /* The old unsuscribe to firestore requests when No user is signed in. */
                // if (self.requestsService.unsubscribe) {
                //     self.requestsService.unsubscribe()
                //     self.requestsService.resetRequestsList()
                // }

            }
        });
    }

    webSocketClose() {
        this.webSocketJs.close()
    }

    // SET TO 'none' the box-shadow style of the navbar in the page in which is present the second navbar (i.e. the bottom-nav)
    unsetNavbarBoxShadow() {
        this.router.events.subscribe((val) => {
            if (this.location.path() !== '') {
                this.route = this.location.path();
                // console.log('»> ', this.route);

                // (this.route.indexOf('/analytics') !== -1) ||
                if (
                    (this.route.indexOf('/requests') !== -1) ||
                    (this.route.indexOf('/wsrequests') !== -1) ||
                    (this.route.indexOf('/translations') !== -1) ||
                    (this.route.indexOf('/users') !== -1) ||
                    (this.route.indexOf('/groups') !== -1) ||
                    (this.route.indexOf('/general') !== -1) ||
                    (this.route.indexOf('/payments') !== -1) ||
                    (this.route.indexOf('/auth') !== -1) ||
                    (this.route.indexOf('/advanced') !== -1) ||
                    (this.route.indexOf('/analytics') !== -1) ||
                    (this.route.indexOf('/user-profile') !== -1) ||
                    (this.route.indexOf('/settings') !== -1) || // account settings
                    (this.route.indexOf('/bot-select-type') !== -1) ||
                    (this.route.indexOf('/change') !== -1)
                ) {

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
        const elemSidebarWrapper = <HTMLElement>document.querySelector('.sidebar-wrapper')
        /**
         * DETECT IF IS THE LOGIN PAGE - SIGNUP - WELCOME - VERIFY-EMAIL - ...
         * the path /create-project and /create-new-project they both lead to the same component (CreateProjectComponent)
         * /create-project is called after the signup - In CreateProjectComponent is checked the current URL and if it is =
         * to create-project is hidden ehe button 'close' that go to home (in this way the user cannot go to the home if he does
         * not first create a project)
         */
        this.router.events.subscribe((val) => {
            if (this.location.path() !== '') {
                this.route = this.location.path();

                // console.log('»> ', this.route)
                // tslint:disable-next-line:max-line-length
                if ((this.route === '/login') ||
                    (this.route === '/signup') ||
                    (this.route.indexOf('/signup-on-invitation') !== -1) ||
                    (this.route === '/forgotpsw') ||
                    (this.route === '/projects') ||
                    (this.route.indexOf('/verify') !== -1) ||
                    (this.route.indexOf('/resetpassword') !== -1) ||
                    (this.route.indexOf('/pricing') !== -1) ||
                    (this.route.indexOf('/success') !== -1) ||
                    (this.route.indexOf('/create-project') !== -1) ||
                    (this.route.indexOf('/create-new-project') !== -1) ||
                    (this.route.indexOf('/handle-invitation') !== -1) ||
                    (this.route.indexOf('/install-tiledesk') !== -1) ||
                    (this.route.indexOf('/request-for-panel') !== -1) ||
                    (this.route.indexOf('/projects-for-panel') !== -1) ||
                    (this.route.indexOf('/unserved-request-for-panel') !== -1) ||
                    (this.route.indexOf('/autologin') !== -1)

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


                // RESOLVE THE BUG: THE "MOBILE" SIDEBAR IN THE PAGE "RECENT PROJECT" IS SMALLER OF THE APP WINDOW
                if (this.route === '/projects') {
                    // elemSidebarWrapper.setAttribute('style', `height:100vh; background-color: ${this.background_bottom_section} !important;`);

                    elemSidebarWrapper.style.height = "100vh";
                } else {
                    elemSidebarWrapper.style.height = "calc(100vh - 60px)";
                    // elemSidebarWrapper.setAttribute('style', `background-color: ${this.background_bottom_section} !important;`);
                }

                if (this.route.indexOf('/request-for-panel') !== -1) {
                    this.IS_REQUEST_X_PANEL_ROUTE = true

                    const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
                    if (this.IS_REQUEST_X_PANEL_ROUTE === true) {
                        let ps = new PerfectScrollbar(elemMainPanel);
                    }
                } else {
                    this.IS_REQUEST_X_PANEL_ROUTE = false
                }


                // if (this.route.indexOf('/projects-for-panel') !== -1) {
                //     this.IS_PROJECTS_FOR_PANEL = true

                //     const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
                //     console.log('APP COMP IS_PROJECTS_FOR_PANEL .main-panel ', elemMainPanel)
                //     if (this.IS_PROJECTS_FOR_PANEL === true) {
                //         let ps = new PerfectScrollbar(elemMainPanel);
                //     }



                // } else {
                //     this.IS_PROJECTS_FOR_PANEL = false
                // }


            } else {
                // console.log('»> * ', this.route)
            }
        });
    }




    ngAfterViewInit() {
        this.runOnRouteChange();
        this.setPrechatFormInWidgetSettings();


        const elemFooter = <HTMLElement>document.querySelector('footer');
        const eleWidget = <HTMLElement>document.querySelector('#tiledesk-container');
        // console.log('APP.COMP - elem FOOTER ', elemFooter);
        console.log('APP.COMP - elem WIDGET ', eleWidget);

        /* HIDE FOOTER IF IS LOGIN PAGE - SIGNUP PAGE */
        this.router.events.subscribe((val) => {
            if (this.location.path() !== '') {
                this.route = this.location.path();
                // console.log('»> ', this.route)
                // tslint:disable-next-line:max-line-length
                if (
                    (this.route === '/login') ||
                    (this.route === '/signup') ||
                    (this.route.indexOf('/signup-on-invitation') !== -1) ||
                    (this.route === '/forgotpsw') ||
                    (this.route.indexOf('/resetpassword') !== -1) ||
                    (this.route.indexOf('/create-project') !== -1) ||
                    (this.route.indexOf('/create-new-project') !== -1) ||
                    (this.route.indexOf('/install-tiledesk') !== -1) ||
                    (this.route.indexOf('/handle-invitation') !== -1) ||
                    (this.route.indexOf('/chat') !== -1) ||
                    (this.route.indexOf('/request-for-panel') !== -1) ||
                    (this.route.indexOf('/projects-for-panel') !== -1) ||
                    (this.route.indexOf('/unserved-request-for-panel') !== -1) ||
                    (this.route.indexOf('/autologin') !== -1)
                ) {
                    elemFooter.setAttribute('style', 'display:none;');
                    // console.log('DETECT LOGIN PAGE')
                    // tslint:disable-next-line:max-line-length
                } else {
                    elemFooter.setAttribute('style', '');
                }

                // WIDGET HIDDEN IF THE ROUTE IS request-for-panel
                // if (this.route.indexOf('/request-for-panel') !== -1) {

                //     if (eleWidget) {
                //         eleWidget.style.display = 'none';
                //     } else {
                //         console.log('APP.COMP - elem WIDGET ', eleWidget) 
                //     }
                // }

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


    setPrechatFormInWidgetSettings() {
        this.router.events.subscribe((val) => {
            if (this.location.path() !== '') {
                this.route = this.location.path();
                // console.log('»> ', this.route)
                // tslint:disable-next-line:max-line-length
                if ((this.route === '/login') || (this.route === '/signup') || (this.route === '/forgotpsw') || (this.route.indexOf('/signup-on-invitation') !== -1)) {

                    this.isPageWithNav = false;

                    if (window && window['tiledeskSettings']) {
                        window['tiledeskSettings']['preChatForm'] = true
                    }
                } else {

                    this.isPageWithNav = true;
                    if (window && window['tiledeskSettings']) {
                        if (window['tiledeskSettings']['preChatForm']) {
                            delete window['tiledeskSettings']['preChatForm'];
                        }
                    }
                }
                // console.log('APP.COMP currentUrl ', this.route, 'tiledeskSettings ', window['tiledeskSettings']);
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
