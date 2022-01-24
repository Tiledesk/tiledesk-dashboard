import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, Self, OnDestroy } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy, PopStateEvent } from '@angular/common';
import 'rxjs/add/operator/filter';
import { NavbarComponent } from './components/navbar/navbar.component';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import PerfectScrollbar from 'perfect-scrollbar'; // https://github.com/mdbootstrap/perfect-scrollbar

import { AuthService } from './core/auth.service';
import { TranslateService } from '@ngx-translate/core';

declare const $: any;

import { environment } from '../environments/environment';
export const firebaseConfig = environment.firebase;
import * as firebase from 'firebase/app';
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
import { LoggerService } from './services/logger/logger.service';


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
    public_Key: string;

    // private logger: LoggerService = LoggerInstance.getInstance();
    // background_bottom_section = brand.sidebar.background_bottom_section
    constructor(
        public location: Location,
        private router: Router,
        private translate: TranslateService,
        private auth: AuthService,
        public appConfigService: AppConfigService,
        public wsRequestsService: WsRequestsService,
        public wsMsgsService: WsMsgsService,
        public webSocketJs: WebSocketJs,
        private metaTitle: Title,
        public brandService: BrandService,
        public script: ScriptService,
        private logger: LoggerService
        // private faqKbService: FaqKbService,
    ) {
        // this.getBrand();

        // script.load('dummy').then(data => {
        // script.load().then(data => {
        //     this.logger.log('APP.COMP - script loaded ', data);
        // }).catch(error => this.logger.log('APP.COMP - script error ', error));

        this.logger.initilaizeLoger()

        const brand = brandService.getBrand();

        this.logger.log('[APP-COMPONENT] - GET BRAND brandService > brand ', brand)

        if (brand) {
            this.metaTitle.setTitle(brand['metaTitle']); // here used with: "import brand from ..." now see in getBrand()
        }
        this.setFavicon(brand); // here used with "import brand from ..." now see in getBrand()


        // ---------------------------------------------------------------------------------
        // InitializeApp with firebase config IF 
        // * chatEngine is = firebase or
        // * uploadEngine is = firebase or 
        // * pushEngine is = firebase
        // --------------------------------------------------------------------------------- 
        this.logger.log('[APP-COMPONENT] getConfig chatEngine', appConfigService.getConfig().chatEngine)
        this.logger.log('[APP-COMPONENT] getConfig uploadEngine', appConfigService.getConfig().uploadEngine)
        this.logger.log('[APP-COMPONENT] getConfig pushEngine', appConfigService.getConfig().pushEngine)
        // if (appConfigService.getConfig().chatEngine && appConfigService.getConfig().chatEngine !== 'mqtt') {
        if (appConfigService.getConfig().uploadEngine === 'firebase' || appConfigService.getConfig().chatEngine === 'firebase' || appConfigService.getConfig().pushEngine === 'firebase') {
            this.logger.log('[APP-COMPONENT] - WORKS WITH FIREBASE ')

            // ----------------------------
            // FIREBASE initializeApp 
            // ---------------------------- 
            this.logger.log('[APP-COMPONENT] AppConfigService firebase_conf 1 ', appConfigService.getConfig().firebase)
            // firebase.initializeApp(firebaseConfig);
            if (!appConfigService.getConfig().firebase || appConfigService.getConfig().firebase.apiKey === 'CHANGEIT') {
                throw new Error('firebase config is not defined. Please create your dashboard-config.json. See the Dashboard Installation Page');
            }


            // const firebase_conf = JSON.parse(appConfigService.getConfig().firebase)
            const firebase_conf = appConfigService.getConfig().firebase;
            this.logger.log('[APP-COMPONENT] AppConfigService - APP-COMPONENT-TS firebase_conf 2', firebase_conf)
            firebase.initializeApp(firebase_conf);


            localStorage.removeItem('firebase:previous_websocket_failure');

        } else {
            this.logger.log('[APP-COMPONENT] - !!! WORKS WITHOUT FIREBASE ')
        }

        this.logger.log('[APP-COMPONENT] !!! =========== HELLO APP.COMP (constructor) ===========')

        translate.setDefaultLang('en');

        const browserLang = this.translate.getBrowserLang();
        this.logger.log('[APP-COMPONENT] this.auth.user_bs.value._id ', this.auth.user_bs.value._id)
        const stored_preferred_lang = localStorage.getItem(this.auth.user_bs.value._id + '_lang')
        this.logger.log('[APP-COMPONENT] stored_preferred_lang', stored_preferred_lang)
        // console.log('[APP-COMPONENT] !!! ===== HELLO APP.COMP ===== BRS LANG ', browserLang)
        let dshbrd_lang = ''
        if (browserLang && !stored_preferred_lang) {
            dshbrd_lang = browserLang
        } else if (browserLang && stored_preferred_lang) {
            dshbrd_lang = stored_preferred_lang
        }

        this.translate.use(dshbrd_lang);

        moment.locale(dshbrd_lang)

        // if (browserLang) {
        //     // if (browserLang === 'it') {
        //     //     this.translate.use('it');
        //     //     moment.locale('it')

        //     // } else if (browserLang === 'de') {
        //     //     this.translate.use('de');
        //     //     moment.locale('de')

        //     // } else {
        //     //     this.translate.use('en');
        //     // }
        // }
        // this.unservedRequestCount = 0


        this.subscription = router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                browserRefresh = !router.navigated;
            }
        });
    }




    setFavicon(brand) {
        var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        this.logger.log('[APP-COMPONENT] setFavicon ', link)
        link['type'] = 'image/x-icon';
        link['rel'] = 'shortcut icon';
        if (brand) {
            link['href'] = brand.favicon__url;
        }
        document.getElementsByTagName('head')[0].appendChild(link);

    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    switchLanguage(language: string) {
        this.translate.use(language);
    }

    ngOnInit() {
        this.logger.log('[APP-COMPONENT] ====== >>> HELLO APP.COMP (ngOnInit) <<< ====== ')
        this.logger.log('[APP-COMPONENT] !! FIREBASE  ', firebase);

        // this.closeWSAndResetWsRequestsIfUserIsSignedOut();
        this.closeWSAndResetWsRequestsIfUserIsSignedOut_NoFB();

        // NEW (SEE ALSO )
        const _elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
        // this.logger.log('APP COMP - MAIN PANEL ', _elemMainPanel)
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
        this.hideWidgetInComponentDisplayedInChat()
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
    //         this.logger.log('APP-COMPONENT - GET BRAND ', this.BRAND);

    //         if (this.BRAND) {
    //             this.metaTitle.setTitle(this.BRAND.metaTitle);
    //             this.setFavicon();
    //         }

    //     }, (error) => {
    //         this.logger.log('APP-COMPONENT GET BRAND - ERROR  ', error);

    //     }, () => {
    //         this.logger.log('APP-COMPONENT GET BRAND * COMPLETE *');

    //     });
    // }



    getCurrentUserAndConnectToWs() {

        this.auth.user_bs.subscribe((user) => {
            // this.logger.log('% »»» WebSocketJs WF - APP-COMPONENT - LoggedUser ', user);
            // this.logger.log('% »»» WebSocketJs WF - APP-COMPONENT - WS URL ', this.wsbasepath);
            // this.logger.log('AppConfigService % »»» WebSocketJs WF - APP-COMPONENT - WS URL ', this.appConfigService.getConfig().wsUrl);

            if (user && user.token) {

                // const WS_URL = 'ws://tiledesk-server-pre.herokuapp.com?token=' + user.token
                const WS_URL = this.appConfigService.getConfig().wsUrl + '?token=' + user.token

                // this.logger.log('AppConfigService % »»» WebSocketJs WF - APP-COMPONENT - I am about to connect to ws ')

                // -----------------------------------------------------------------------------------------------------
                // Websocket init 
                // -----------------------------------------------------------------------------------------------------
                // NOTE_nk: comment this.webSocketJs.init
                this.webSocketJs.init(
                    WS_URL,
                    undefined,
                    undefined,
                    undefined
                );
            }
        });
    }

    closeWSAndResetWsRequestsIfUserIsSignedOut_NoFB() {
        this.auth.user_bs.subscribe((user) => {

            this.logger.log('[APP-COMPONENT] - closeWSAndResetWsRequestsIfUserIsSignedOut_NoFB ', user)

            if (user) {
                this.logger.log('[APP-COMPONENT] - closeWSAndResetWsRequestsIfUserIsSignedOut_NoFB - User is signed in. ', user)
                this.userIsSignedIn = true

            } else {
                this.logger.log('[APP-COMPONENT] - closeWSAndResetWsRequestsIfUserIsSignedOut_NoFB - No user is signed in. ', user)

                this.webSocketClose()
                this.wsRequestsService.resetWsRequestList()
            }
        })
    }


    closeWSAndResetWsRequestsIfUserIsSignedOut() {
        const self = this
        this.logger.log('[APP-COMPONENT] % »»» WebSocketJs WF - APP-COMPONENT - closeWSAndResetWsRequestsIfUserIsSignedOut ', typeof firebase.auth)
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                this.logger.log('% »»» WebSocketJs WF - APP-COMPONENT - User is signed in. ', user)
                this.userIsSignedIn = true

            } else {
                this.logger.log('[APP-COMPONENT] % »»» WebSocketJs WF - APP-COMPONENT - closeWSAndResetWsRequestsIfUserIsSignedOut - No user is signed in. ', user)

                this.userIsSignedIn = false
                this.logger.log('[APP-COMPONENT] % »»» WebSocketJs WF - APP-COMPONENT - User is signed in. ', this.userIsSignedIn)

                // USED TO DETERMINE WHEN VISUALIZING THE POPUP WINDOW 'SESSION EXPIRED'
                self.auth.userIsSignedIn(this.userIsSignedIn);

                // -----------------------------------------------------------------------------------------------------    
                //  Websocket - Close websocket and reset ws requests list 
                // -----------------------------------------------------------------------------------------------------

                // self.webSocketJs.close()
                self.webSocketClose()
                self.wsRequestsService.resetWsRequestList()

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
                // this.logger.log('»> ', this.route);

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
                    // this.logger.log('»> is analytics -- elemNavbar ', elemNavbar)
                    elemNavbar.setAttribute('style', 'box-shadow:none');

                }
            }
        })
    }

    hideWidgetInComponentDisplayedInChat() {

        this.subscription = this.router.events.subscribe((e) => {
            if (e instanceof NavigationEnd) {


                this.logger.log('[APP-COMP] - HIDE WIDGET -> CURRENT URL ', e.url);
                if ((e.url.indexOf('/unserved-request-for-panel') !== -1) || (e.url.indexOf('/projects-for-panel') !== -1) || (e.url.indexOf('/request-for-panel') !== -1)) {
                    // window.addEventListener("load", () => {
                    this.logger.log('[APP-COMP] - HIDE WIDGET - PAGE LOAD')
                    try {
                        if (window && window['tiledesk_widget_hide']) {
                            this.logger.log('[APP-COMP] - HIDE WIDGET - HERE 1')
                            window['tiledesk_widget_hide']();
                        }
                    } catch (e) {
                        this.logger.error('tiledesk_widget_hide ERROR', e)
                    }
                }
                // )};
            }


        });



        // this.router.events.subscribe((val) => {
        //     if (this.location.path() !== '') {
        //         this.route = this.location.path();
        //         this.logger.log('hideWidgetInComponentDisplayedInChat »> route', this.route)
        //         // tslint:disable-next-line:max-line-length
        //         if ((this.route.indexOf('/unserved-request-for-panel') !== -1) || (this.route.indexOf('/projects-for-panel') !== -1) || (this.route.indexOf('/request-for-panel') !== -1)){
        //             console.log('hideWidgetInComponentDisplayedInChat HERE 1')
        //             // try {
        //             //     if (window && window['tiledeskSettings'] && window['tiledeskSettings'].angularcomponent && window['tiledeskSettings'].angularcomponent.g) {
        //             //         this.logger.log('hideWidgetInComponentDisplayedInChat HERE 2')
        //             //         window['tiledeskSettings'].angularcomponent.g.setParameter('isShown', false)
        //             //     }
        //             // } catch (e) {
        //             //     this.logger.log('hideWidgetInComponentDisplayedInChat ERROR' ,e)
        //             // }

        //             // let wContext: any = window;
        //             // // console.log('windowContext 0', wContext);
        //             // if (window.frameElement && window.frameElement.getAttribute('tiledesk_context') === 'parent') {
        //             //     wContext = window.parent;
        //             //     console.log('hideWidgetInComponentDisplayedInChat HERE 1', wContext)

        //             // }
        //             // window.addEventListener("load", () => {
        //                 try {
        //                     if (window && window['tiledesk_widget_hide']) {
        //                         window['tiledesk_widget_hide']();
        //                     }
        //                 } catch (e) {
        //                     this.logger.log('tiledesk_widget_hide ERROR', e)
        //                 }
        //             }
        //         //    )};

        //     }
        // })
    }


    hideElementsInAuthPage() {
        // GET THE HTML ELEMENT NAVBAR AND SIDEBAR THAT WILL BE HIDDEN IF IS DETECTED THE LOGIN PAGE
        const elemAppSidebar = <HTMLElement>document.querySelector('app-sidebar');
        // this.logger.log('xxxx xxxx elemAppSidebar ', elemAppSidebar)
        const elemNavbar = <HTMLElement>document.querySelector('.navbar');
        const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
        // this.logger.log('xxxx xxxx elemNavbar', elemNavbar)
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

                // this.logger.log('»> ', this.route)
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
                    (this.route.indexOf('/canceled') !== -1) ||
                    (this.route.indexOf('/create-project') !== -1) ||
                    (this.route.indexOf('/create-new-project') !== -1) ||
                    (this.route.indexOf('/configure-widget') !== -1) ||
                    (this.route.indexOf('/install-widget') !== -1) ||
                    (this.route.indexOf('/handle-invitation') !== -1) ||
                    (this.route.indexOf('/request-for-panel') !== -1) ||
                    (this.route.indexOf('/projects-for-panel') !== -1) ||
                    (this.route.indexOf('/project-for-panel') !== -1) ||
                    (this.route.indexOf('/unserved-request-for-panel') !== -1) ||
                    (this.route.indexOf('/autologin') !== -1) ||
                    (this.route.indexOf('/unauthorized_access') !== -1)

                ) {

                    elemNavbar.setAttribute('style', 'display:none;');
                    elemAppSidebar.setAttribute('style', 'display:none;');
                    // margin-top: -70px
                    elemMainPanel.setAttribute('style', 'width:100% !important; overflow-x: hidden !important;');

                    // this.logger.log('DETECT LOGIN PAGE')
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

                    if (this.IS_REQUEST_X_PANEL_ROUTE === true && !this.isMobile()) {
                        let ps = new PerfectScrollbar(elemMainPanel);
                    }


                } else {
                    this.IS_REQUEST_X_PANEL_ROUTE = false
                }


                // if (this.route.indexOf('/projects-for-panel') !== -1) {
                //     this.IS_PROJECTS_FOR_PANEL = true

                //     const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
                //     this.logger.log('APP COMP IS_PROJECTS_FOR_PANEL .main-panel ', elemMainPanel)
                //     if (this.IS_PROJECTS_FOR_PANEL === true) {
                //         let ps = new PerfectScrollbar(elemMainPanel);
                //     }



                // } else {
                //     this.IS_PROJECTS_FOR_PANEL = false
                // }


            } else {
                // this.logger.log('»> * ', this.route)
            }
        });
    }




    ngAfterViewInit() {
        this.runOnRouteChange();
        // this.setPrechatFormInWidgetSettings();
        const elemFooter = <HTMLElement>document.querySelector('footer');
        // const eleWidget = <HTMLElement>document.querySelector('#tiledesk-container');
        // this.logger.log('APP.COMP - elem FOOTER ', elemFooter);
        // setTimeout(() => {
        // console.log('[APP-COMPONENT] window', window)
        // var tiledeskiframe = document.getElementById('tiledeskiframe') as HTMLIFrameElement;
        // console.log('[APP-COMPONENT] tiledeskiframe', tiledeskiframe)
        // if (tiledeskiframe) {
        //     if (window && window['tiledesk'] && window['tiledesk']['angularcomponent']) {
        //         window['tiledesk'].angularcomponent.component.g.preChatForm = false
        //     }
        // }
        // }, 3000);



        /* HIDE FOOTER IF IS LOGIN PAGE - SIGNUP PAGE */
        this.router.events.subscribe((val) => {
            if (this.location.path() !== '') {
                this.route = this.location.path();
                // this.logger.log('»> ', this.route)
                // tslint:disable-next-line:max-line-length
                if (
                    (this.route === '/login') ||
                    (this.route === '/signup') ||
                    (this.route.indexOf('/signup-on-invitation') !== -1) ||
                    (this.route === '/forgotpsw') ||
                    (this.route.indexOf('/resetpassword') !== -1) ||
                    (this.route.indexOf('/create-project') !== -1) ||
                    (this.route.indexOf('/create-new-project') !== -1) ||
                    (this.route.indexOf('/configure-widget') !== -1) ||
                    (this.route.indexOf('/install-widget') !== -1) ||
                    (this.route.indexOf('/handle-invitation') !== -1) ||
                    (this.route.indexOf('/chat') !== -1) ||
                    (this.route.indexOf('/request-for-panel') !== -1) ||
                    (this.route.indexOf('/projects-for-panel') !== -1) ||
                    (this.route.indexOf('/project-for-panel') !== -1) ||
                    (this.route.indexOf('/unserved-request-for-panel') !== -1) ||
                    (this.route.indexOf('/autologin') !== -1) ||
                    (this.route.indexOf('/unauthorized_access') !== -1)

                ) {
                    elemFooter.setAttribute('style', 'display:none;');
                    // this.logger.log('DETECT LOGIN PAGE')
                    // tslint:disable-next-line:max-line-length
                } else {
                    elemFooter.setAttribute('style', '');
                }

                // WIDGET HIDDEN IF THE ROUTE IS request-for-panel
                // if (this.route.indexOf('/request-for-panel') !== -1) {

                //     if (eleWidget) {
                //         eleWidget.style.display = 'none';
                //     } else {
                //         this.logger.log('APP.COMP - elem WIDGET ', eleWidget) 
                //     }
                // }

            } else {
                // this.logger.log('»> * ', this.route)
            }
        });

        const elemAppFooter = <HTMLElement>document.querySelector('app-footer');
        this.router.events.subscribe((val) => {
            if (this.location.path() !== '') {
                this.route = this.location.path();
                // this.logger.log('»> ', this.route)
                if (this.route.indexOf('/verify') !== -1) {

                    elemAppFooter.setAttribute('style', 'display:none;');
                    // this.logger.log('DETECT LOGIN PAGE')
                    // tslint:disable-next-line:max-line-length
                } else {

                    elemAppFooter.setAttribute('style', '');

                }
            } else {
                // this.logger.log('»> * ', this.route)
            }
        });

    }


    // setPrechatFormInWidgetSettings() {
    //     this.router.events.subscribe((val) => {
    //         if (this.location.path() !== '') {
    //             this.route = this.location.path();
    //             // this.logger.log('»> ', this.route)
    //             // tslint:disable-next-line:max-line-length
    //             if ((this.route === '/login') || (this.route === '/signup') || (this.route === '/forgotpsw') || (this.route.indexOf('/signup-on-invitation') !== -1)) {

    //                 this.isPageWithNav = false;

    //                 if (window && window['tiledeskSettings']) {
    //                     window['tiledeskSettings']['preChatForm'] = true
    //                 }
    //             } else {

    //                 this.isPageWithNav = true;
    //                 if (window && window['tiledeskSettings']) {
    //                     if (window['tiledeskSettings']['preChatForm']) {
    //                         delete window['tiledeskSettings']['preChatForm'];
    //                     }
    //                 }
    //             }
    //             // this.logger.log('APP.COMP currentUrl ', this.route, 'tiledeskSettings ', window['tiledeskSettings']);
    //         }
    //     });
    // }

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

    isMobile() {
        let bool = false;
        if (/Android|iPhone/i.test(window.navigator.userAgent)) {
            bool = true;
        }
        return bool;
    }

    changeOfRoutes() {
        this.logger.log('[APP-COMPONENT] changeOfRoutes ')
    }


}
