import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, Self, OnDestroy, HostListener, isDevMode } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy, PopStateEvent } from '@angular/common';

import { filter } from 'rxjs/operators';
import { NavbarComponent } from './components/navbar/navbar.component';
import { Router, NavigationEnd, NavigationStart, Event as NavigationEvent } from '@angular/router';
import { Subscription } from 'rxjs'
import PerfectScrollbar from 'perfect-scrollbar'; // https://github.com/mdbootstrap/perfect-scrollbar

import { AuthService } from './core/auth.service';
import { TranslateService } from '@ngx-translate/core';
declare const $: any;

import { environment } from '../environments/environment';
export const firebaseConfig = environment.firebase;
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/messaging';

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
import { NotifyService } from './core/notify.service';
import { avatarPlaceholder, freePlanLimitDate, getColorBck } from './utils/util';
import { LocalDbService } from './services/users-local-db.service';
import { ProjectService } from './services/project.service';
import { HttpClient } from '@angular/common/http';
import { SleekplanSsoService } from './services/sleekplan-sso.service';
import { SleekplanService } from './services/sleekplan.service';
import { SleekplanApiService } from './services/sleekplan-api.service';
// import { UsersService } from './services/users.service';



declare const gtag: Function;

@Component({
    selector: 'appdashboard-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
    private _router: Subscription;
    private lastPoppedUrl: string;
    private yScrollStack: number[] = [];


    route: string;
    LOGIN_PAGE: boolean;
    // USER_ROLE: string;
    userIsSignedIn: boolean;
    IS_REQUEST_X_PANEL_ROUTE: boolean;
    IS_PROJECTS_FOR_PANEL: boolean;
    HIDE_FOREGROUND_NOTIFICATION: boolean

    BRAND: any;

    @ViewChild(NavbarComponent, { static: false }) navbar: NavbarComponent;
    @ViewChild('myModal', { static: false }) myModal: ElementRef;
    isPageWithNav: boolean;

    // wsbasepath = environment.websocket.wsUrl; // moved
    // wsbasepath = environment.wsUrl;

    subscription: Subscription;
    public_Key: string;

    browserName = '';
    browserVersion = '';
    count: number = 0;
    public setIntervalTime: any;
    public isTabVisible: boolean = true;
    public tabTitle: string;
    // current_selected_prjct: any;
    current_selected_prjct_user: any;

    wsInitialized: boolean = false;
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
        private logger: LoggerService,
        private notify: NotifyService,
        public usersLocalDbService: LocalDbService,
        private projectService: ProjectService,

        private sleekplanSsoService: SleekplanSsoService,
        private sleekplanService: SleekplanService,
        private sleekplanApiService: SleekplanApiService

        // public usersService: UsersService,
        // private faqKbService: FaqKbService,
    ) {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                console.log('[APP-COMPONENT] - NavigationEnd event ', event)
                gtag('config', 'G-3DMYV3HG61', { 'page_path': event.urlAfterRedirects });

                if (event.urlAfterRedirects !== '/projects' && event.urlAfterRedirects !== '/login' && event.urlAfterRedirects !== '/signup' && event.urlAfterRedirects !== '/create-new-project') {
                    console.log('[APP-COMPONENT] ------>  calling GET CURRENT PROJECT ')
                    this.getCurrentProject(event.urlAfterRedirects)
                }
                
                // if (this.router.url.indexOf('/request-for-panel') !== -1) { 
                //    const CHAT_PANEL_MODE = true
                //     console.log('[APP-COMPONENT] ------>  CHAT_PANEL_MODE 1 ', CHAT_PANEL_MODE)
                //     console.log('[APP-COMPONENT] ------>  calling GET CURRENT PROJECT ')

                    
                // } else if (this.router.url.indexOf('/request-for-panel') === -1) {
                //     const CHAT_PANEL_MODE = false
                //     console.log('[APP-COMPONENT] ------>  CHAT_PANEL_MODE 2 ', CHAT_PANEL_MODE)
                //     if (event.urlAfterRedirects !== '/projects' && event.urlAfterRedirects !== '/login' && event.urlAfterRedirects !== '/signup') {
                //         console.log('[APP-COMPONENT] ------>  calling GET CURRENT PROJECT ')
                //         this.getCurrentProject(event.urlAfterRedirects, CHAT_PANEL_MODE)
                //     }
                // }
                   

                

               

               

                const grecaptchaBadgeEl = <HTMLElement>document.querySelector('.grecaptcha-badge');
                if (event.url !== '/signup') {
                    // this.logger.log('[APP-COMPONENT] grecaptchaBadgeEl ', grecaptchaBadgeEl)
                    if (grecaptchaBadgeEl) {
                        grecaptchaBadgeEl.style.visibility = 'hidden'
                    }
                } else {
                    if (grecaptchaBadgeEl) {
                        grecaptchaBadgeEl.style.visibility = 'visible'
                    }
                }
            }
        })




        // this.logger.log('HI! [APP-COMPONENT] ')
        // https://www.freecodecamp.org/news/how-to-check-internet-connection-status-with-javascript/

        // const { userAgent } = navigator
        // if (userAgent.includes('Firefox/')) {
        //     this.logger.log(`Firefox v${userAgent.split('Firefox/')[1]}`)
        // } else if (userAgent.includes('Edg/')) {
        //     this.logger.log(`Edg v${userAgent.split('Edg/')[1]}`)
        // } else if (userAgent.includes('Chrome/')) {
        //     this.logger.log(`Chrome v${userAgent.split('Chrome/')[1]}`)
        // } else if (userAgent.includes('Safari/')) {
        //     this.logger.log(userAgent)
        // }
        // https://www.positronx.io/angular-detect-browser-name-and-version-tutorial-example/
        this.browserName = this.detectBrowserName();
        this.browserVersion = this.detectBrowserVersion();
        // this.logger.log('[APP-COMPONENT] - browserName  ',  this.browserName)
        // this.logger.log('[APP-COMPONENT] - browserVersion  ',  this.browserVersion)
        this.auth.browserNameAndVersion(this.browserName, this.browserVersion)


        // script.load('dummy').then(data => {
        // script.load().then(data => {
        //     this.logger.log('APP.COMP - script loaded ', data);
        // }).catch(error => this.logger.log('APP.COMP - script error ', error));

        this.logger.initilaizeLoger()

        const brand = brandService.getBrand();

        // this.logger.log('[APP-COMPONENT] - GET BRAND brandService > brand ', brand)

        if (brand) {
            this.metaTitle.setTitle(brand['META_TITLE']); // here used with: "import brand from ..." now see in getBrand()
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

            const firebase_conf = appConfigService.getConfig().firebase;
            this.logger.log('[APP-COMPONENT] AppConfigService - APP-COMPONENT-TS firebase_conf 2', firebase_conf)
            firebase.initializeApp(firebase_conf);

            // ----------------------------------------------------
            // Listen to FOREGROND MESSAGES
            // ----------------------------------------------------
            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
            this.logger.log('[APP-COMPONENT] isSafari ', isSafari)
            if (isSafari === false) {
                this.listenToFCMForegroundMsgs();
            }

            localStorage.removeItem('firebase:previous_websocket_failure');

        } else {
            this.logger.log('[APP-COMPONENT] - !!! WORKS WITHOUT FIREBASE ')
        }

        this.logger.log('[APP-COMPONENT] !!! =========== HELLO APP.COMP (constructor) ===========')

        translate.setDefaultLang('en');

        const browserLang = this.translate.getBrowserLang();
        // this.logger.log('[APP-COMPONENT] browserLang ', browserLang)
        if (this.auth.user_bs && this.auth.user_bs.value) {
            this.logger.log('[APP-COMPONENT] this.auth.user_bs.value._id ', this.auth.user_bs.value._id)
            const stored_preferred_lang = localStorage.getItem(this.auth.user_bs.value._id + '_lang')
            this.logger.log('[APP-COMPONENT] stored_preferred_lang', stored_preferred_lang)
            // this.logger.log('[APP-COMPONENT] !!! ===== HELLO APP.COMP ===== BRS LANG ', browserLang)
            let dshbrd_lang = ''
            if (browserLang && !stored_preferred_lang) {
                dshbrd_lang = browserLang
            } else if (browserLang && stored_preferred_lang) {
                dshbrd_lang = stored_preferred_lang
            }

            this.translate.use(dshbrd_lang);

            moment.locale(dshbrd_lang)
        } else {
            this.logger.log('[APP-COMPONENT] There is no logged in user')
        }

        // --------------------------
        // Get if page is refreshed
        // --------------------------
        this.subscription = router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                browserRefresh = !router.navigated;
                this.logger.log('[APP-COMPONENT] browserRefresh ', browserRefresh)
                this.logger.log('[APP-COMPONENT] browserRefresh ', event)
                if (browserRefresh === true) {
                    window.addEventListener('load', () => {
                        this.logger.log('Page fully loaded');

                        // Check if there is the sleelplan chagenlog live announcemnt popup
                        this.checkSPPopupIframeWithRetries(5, 1000); // Retry 5 times with a 1-second delay
                    });
                }
            }
        });


        this.loadStyle(JSON.parse(localStorage.getItem('custom_style')))

    }

    checkSPPopupIframeWithRetries = (maxRetries = 5, delay = 1000) => {
        let attempts = 0;

        const checkForIframe = () => {
            attempts++;
            this.logger.log(`Attempt ${attempts} to find the iframe...`);

            const wrapper = document.getElementById('sleek-widget-wrap');
            this.logger.log('wrapper 1', wrapper)
            if (wrapper) {
                this.logger.log('wrapper', wrapper)
                // this.observeClassChange('.i-sl-wrapper.right.popup.active', 'expanded', () => {
                this.observeClassChange(wrapper, 'expanded', () => {
                    this.logger.log('The "expanded" class was added!');
                    this.sleekplanApiService.hasOpenedSPChangelogFromPopup()
                });

                return; // Stop further retries once the iframe is found
            }

            if (attempts < maxRetries) {
                setTimeout(checkForIframe, delay);
            } else {
                this.logger.log('Max attempts reached. Iframe not found.');
            }
        };

        checkForIframe();
    };


    // observeClassChange(targetSelector: any, classToDetect: string, callback: () => void): void {
    observeClassChange(targetElement: any, classToDetect: string, callback: () => void): void {
        // const targetElement = document.querySelector(targetSelector);
        this.logger.log('targetElement ', targetElement);
        // if (!targetElement) {
        //     this.logger.error('Target element not found');
        //     return;
        // }

        // Create a MutationObserver instance
        const observer = new MutationObserver((mutationsList) => {

            for (const mutation of mutationsList) {
                this.logger.log('mutation ', mutation);
                if (
                    mutation.type === 'attributes' &&
                    mutation.attributeName === 'class'
                ) {
                    const element = mutation.target as HTMLElement;

                    // Check if the target element has the specified class
                    if (element.classList.contains(classToDetect)) {
                        this.logger.log(`Class "${classToDetect}" added to the element`);
                        callback(); // Trigger the callback
                        observer.disconnect();
                    }
                }
            }
        });

        // Observe the element for class attribute changes
        observer.observe(targetElement, { attributes: true });
    }



    async loadStyle(data) {

        if (!data || !data.parameter) {
            let className = document.body.className.replace(new RegExp(/style-\S*/gm), '')
            document.body.className = className
            document.body.classList.remove('light')
            document.body.classList.remove('dark')
            document.body.classList.remove('custom')
            let link = document.getElementById('themeCustom');
            if (link) {
                link.remove();
            }
            /** remove style INFO from storage */
            localStorage.removeItem('custom_style')

            return;
        }

        // Create link
        let link = document.createElement('link');
        link.id = 'themeCustom'
        link.href = data.parameter;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.media = 'all';

        this.logger.log('[APP-COMPONENT] link', link, 'document ', document)
        let head = document.getElementsByTagName('head')[0];
        head.appendChild(link);
        document.body.classList.add(data.type) //ADD class to body element as theme type ('light', 'dark', 'custom')
        return;
    }


    ngOnInit() {
        // this.logger.log('[APP-COMPONENT] ====== >>> HELLO APP.COMP (ngOnInit)  ')
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


        this._router = this.router.events
            .pipe(
                filter(event => event instanceof NavigationEnd)
            )
            .subscribe((event: NavigationEvent) => {
                // this.logger.log('[APP-COMPONENT] NavigationEvent ', event);
                elemMainPanel.scrollTop = 0;
                elemSidebar.scrollTop = 0;
            }
            )

        if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
            let ps = new PerfectScrollbar(elemMainPanel);
            ps = new PerfectScrollbar(elemSidebar);
        }


        this.unsetNavbarBoxShadow();
        this.hideWidgetAndForegroundNotificationInComponentDisplayedInChat()
        // -----------------------------------------------------------------------------------------------------
        // Websocket connection
        // -----------------------------------------------------------------------------------------------------
        this.getCurrentUserAndConnectToWs();

        this.listenToSwPostMessage();
        // this.getCurrentProject()
    }



    getCurrentProject(url) {
        // console.log('[APP-COMPONENT] calling --- GET CURRENT PROJECT ---- - url 1', url)
        console.log('[APP-COMPONENT] calling --- GET CURRENT PROJECT ---- - this.auth.user_bs.value 1 ', this.auth.user_bs.value)
        this.auth.project_bs.subscribe((project) => {
            if (project) {
                console.log('[APP-COMPONENT] -->> project from $ubscription 1 ', project)
                // this.current_selected_prjct = project
                this.projectService.getProjects().subscribe((projects: any) => {
                    this.logger.log('[APP-COMPONENT] getProjects projects ', projects)
                    if (projects) {
                        this.current_selected_prjct_user = projects.find(prj => prj.id_project.id === project._id);
                        console.log('[APP-COMPONENT] -->> current_selected_prjct_user 1', this.current_selected_prjct_user)
                        if (this.current_selected_prjct_user) {
                            // console.log('[APP-COMPONENT] xxxxx  1 -->> url.indexOf(/request-for-panel', url.indexOf('/request-for-panel') !== -1)
                            // console.log('[APP-COMPONENT] xxxxx -->> url', url)
                            // if(CHAT_PANEL_MODE === false) {
                           
                            this.redirectToPricing(this.current_selected_prjct_user)

                            // } else if(CHAT_PANEL_MODE === true) {
                            //     this.redirectToPricingFromChat(this.current_selected_prjct_user)
                            // }
                        }
                        // this.router.navigate(['project/' + project._id + '/pricing']);
                        // this.USER_ROLE = this.current_selected_prjct_user.role
                        // this.logger.log('[APP-COMPONENT] USER_ROLE ', this.USER_ROLE)
                    }
                })
            } else {
                console.log('[APP-COMPONENT] calling --- GET CURRENT PROJECT ---- - url 2', url)
                console.log('[APP-COMPONENT] calling --- GET CURRENT PROJECT ---- - project 2 ', project)
                console.log('[APP-COMPONENT] calling --- GET CURRENT PROJECT ---- - this.auth.user_bs.value 2 ', this.auth.user_bs.value)
                console.log('[APP-COMPONENT] calling --- GET CURRENT PROJECT ---- - this.auth.hasChangedProject.value 2 ', this.auth.hasChangedProject.value)
                if (!project && this.auth.user_bs.value && this.auth.hasChangedProject.value === false) {
                    const url_segments = url.split('/');
                    const nav_project_id = url_segments[2];
                    console.log('[APP-COMPONENT] -->> project from $ubscription 2 nav_project_id', nav_project_id)
                    // console.log('[APP-COMPONENT] project from $ubscription 2 nav_project_id', nav_project_id)

                    const navProjectIdContainsNumber = this.containsNumber(nav_project_id)
                    console.log('[APP-COMPONENT] -->> project from $ubscription 2 projectIdIsNumber', navProjectIdContainsNumber)

                    if (navProjectIdContainsNumber === true) {
                        this.projectService.getProjects().subscribe((projects: any) => {
                            this.logger.log('[APP-COMPONENT] getProjects projects ', projects)
                            if (projects) {
                                this.current_selected_prjct_user = projects.find(prj => prj.id_project.id === nav_project_id);
                                console.log('[APP-COMPONENT] current_selected_prjct_user 2', this.current_selected_prjct_user)
                                console.log('[APP-COMPONENT] calling --- GET CURRENT PROJECT ---- - this.auth.user_bs.value 3 ', this.auth.user_bs.value)
                                if (this.current_selected_prjct_user) {
                                    this.redirectToPricing(this.current_selected_prjct_user)
                                }
                            }
                        })
                    }
                }
            }
        });
    }

    redirectToPricing(projectUser) {
        console.log('[APP-COMPONENT] REDIRECT TO PRICING - projectUser ', projectUser)

        const role = projectUser.role;
        const project = projectUser.id_project;
        console.log('[APP-COMPONENT] REDIRECT TO PRICING - project ', project)

      
        // const dateLimit = new Date('2025-01-16T00:00:00');
        // const dateLimit = new Date('2022-07-04T00:00:00') // for test purpose
        // console.log('[APP-COMPONENT] REDIRECT TO PRICING - dateLimit ', dateLimit)
        console.log('[APP-COMPONENT] REDIRECT TO PRICING - freePlanLimitDate ', freePlanLimitDate)
       

        if (project) {

            const projectCreationDate = new Date(project.createdAt);
            console.log('[APP-COMPONENT] REDIRECT TO PRICING - projectCreationDate ', projectCreationDate)
            console.log('[APP-COMPONENT] REDIRECT TO PRICING - project.profile.type ', project.profile.type)
            console.log('[APP-COMPONENT] REDIRECT TO PRICING - project.trialExpired ', project.trialExpired)
            
            if (projectCreationDate >= freePlanLimitDate) {
                console.log('[APP-COMPONENT] REDIRECT TO PRICING - projectCreationDate > dateLimit ')


                if (project.profile.type === 'free' && project.trialExpired === true) {
                    if (role === 'owner') {
                        
                            this.router.navigate(['project/' + project._id + '/pricing/te']);
                        // } else if (CHAT_PANEL_MODE) {
                        //     this.router.navigate(['project/' + project._id + '/unauthorized-to-upgrade/cm']);
                        // }
                        
                    } else {
                        // if (!CHAT_PANEL_MODE) {
                        this.router.navigate(['project/' + project._id + '/unauthorized-to-upgrade']);
                        // } else if (CHAT_PANEL_MODE) {
                        //     this.router.navigate(['project/' + project._id + '/unauthorized-to-upgrade/cm']);
                        // }
                    }
                }
            } else {
                console.log('[APP-COMPONENT] REDIRECT TO PRICING - projectCreationDate < dateLimit ')
            }
        }
    }


    redirectToPricingFromChat(projectUser) {
        const project = projectUser.id_project;
        console.log('[APP-COMPONENT] redirectToPricingFromChat')
        this.router.navigate(['project/' + project._id + '/unauthorized-to-upgrade']);
    }

    containsNumber(str: string): boolean {
        return /\d/.test(str);
    }

    listenToSwPostMessage() {
        this.logger.log('[APP-COMPONENT] listenToNotificationCLick - CALLED: ')

        if (navigator && navigator.serviceWorker) {
            const that = this
            navigator.serviceWorker.addEventListener('message', function (event) {
                // event.preventDefault(); 
                that.logger.log('[APP-COMPONENT] FIREBASE-NOTIFICATION  - Received a message from service worker event : ', event)
                const count = +that.usersLocalDbService.getForegrondNotificationsCount();
                that.logger.log('[APP-COMPONENT] FIREBASE-NOTIFICATION  - Received a message from service worker event count ', count)
                that.wsRequestsService.publishAndStoreForegroundRequestCount(count, 'App-comp listenToSwPostMessage')
            })
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    switchLanguage(language: string) {
        this.translate.use(language);
    }

    @HostListener('document:visibilitychange', [])
    visibilitychange() {
        // this.logger.log("document ", document);
        // this.logger.log(">>>> document is hidden", document.hidden, " >>>> document title ", document.title, " >>>> FOREGROUND COUNT ", this.count);

        if (document.hidden) {
            this.isTabVisible = false;
            this.manageDocumentTitle()
        } else {
            // TAB IS ACTIVE --> restore title and DO NOT SOUND
            // this.logger.log("document is hidden 2", document.hidden);
            this.isTabVisible = true;
            this.manageDocumentTitle()
        }
    }

    @HostListener('window:storage', ['$event'])
    onStorageChanged(event: any) {
        // this.logger.log('>>>>>>>> onStorageChanged event', event)
        if ((event.key !== 'dshbrd----foregroundcount') && (event.key !== 'dshbrd----sound')) {
            return;
        }
        const foregrondNotificationsCount = +this.usersLocalDbService.getForegrondNotificationsCount();
        // this.logger.log('>>>>>>>> onStorageChanged foregrondNotificationsCount', foregrondNotificationsCount)
        this.count = foregrondNotificationsCount
        this.wsRequestsService.publishAndStoreForegroundRequestCount(foregrondNotificationsCount, 'App-comp onStorageChanged')
        if (this.count === 0) {
            const brand = this.brandService.getBrand();
            document.title = brand['META_TITLE']
        }

        if (event.key === 'dshbrd----sound') {
            this.wsRequestsService.hasChangedSoundPreference(event.newValue)
        }

    }



    subscribeToStoredForegroundAndManageAppTab() {
        this.wsRequestsService.foregroundNotificationCount$
            .subscribe((foregroundNoticationCount) => {
                // this.logger.log('[APP-COMPONENT] - stored FOREGROUND NOTIFICATION COUNT ', foregroundNoticationCount);
                // this.logger.log('[APP-COMPONENT] - stored FOREGROUND NOTIFICATION this.isTabVisible ', this.isTabVisible);

                // && foregroundNoticationCount > 0
                if (foregroundNoticationCount) {
                    this.count = foregroundNoticationCount;
                    // this.logger.log('[APP-COMPONENT] - stored FOREGROUND NOTIFICATION COUNT ', this.count)
                }


            })
    }

    manageDocumentTitle() {
        // this.logger.log('[APP-COMPONENT] - manageDocumentTitle ', this.count)
        const brand = this.brandService.getBrand();
        let isBlurred = false;

        const that = this
        // window.onblur = function () {
        // this.logger.log('[APP-COMPONENT] - stored FOREGROUND NOTIFICATION COUNT USECASE 1  WINDOW NOT HAS FOCUS this.count ', this.count)
        if (this.isTabVisible === false && that.count > 0) {
            // this.logger.log('[APP-COMPONENT] - stored FOREGROUND NOTIFICATION COUNT  isTabVisible ', this.isTabVisible)
            isBlurred = true;

            this.setIntervalTime = window.setInterval(function () {

                // this.logger.log('[APP-COMPONENT] - stored FOREGROUND NOTIFICATION COUNT USECASE 1  WINDOW NOT HAS FOCUS  HERE YES  document.title ', document.title)
                document.title = document.title == brand['META_TITLE'] ? '(' + that.count + ')' + ' ' + brand['META_TITLE'] : brand['META_TITLE'];

            }, 1000);
        }
        // window.onfocus = function () {
        if (this.isTabVisible === true) {
            // this.logger.log('[APP-COMPONENT] - stored FOREGROUND NOTIFICATION isTabVisible ', this.isTabVisible)
            // this.logger.log('[APP-COMPONENT] - stored FOREGROUND NOTIFICATION COUNT USECASE 2  WINDOW HAS FOCUS ')
            isBlurred = false;
            document.title = brand['META_TITLE']
            clearInterval(this.setIntervalTime);
        }
    }


    listenToFCMForegroundMsgs() {
        this.logger.log('[APP-COMPONENT] listenToFCMForegroundMsgs')
        try {
            const messaging = firebase.messaging()
            messaging.onMessage((payload) => {

                // this.logger.log(' listenToFCMForegroundMsgs Message received. ', payload);
                const recipient_fullname = payload.data.recipient_fullname
                const requester_avatar_initial = this.doRecipient_fullname_initial(recipient_fullname)
                const requester_avatar_bckgrnd = this.doRecipient_fullname_bckgrnd(recipient_fullname)
                const link = payload.notification.click_action + "#/conversation-detail/" + payload.data.recipient + '/' + payload.data.sender_fullname + '/active'
                // this.logger.log('Message received link ', link);
                if (this.HIDE_FOREGROUND_NOTIFICATION === false) {
                    this.notify.showForegroungPushNotification(payload.data.recipient_fullname, payload.data.text, link, requester_avatar_initial, requester_avatar_bckgrnd);
                }
                this.count = this.count + 1;
                // this.logger.log('snd test foreground notification count ', this.count);
                this.wsRequestsService.publishAndStoreForegroundRequestCount(this.count, 'App comp - listenToFCMForegroundMsgs')

                const elemNotification = document.getElementById('foreground-not');
                // this.logger.log('[APP-COMPONENT] !! elemNotification  ', elemNotification)
                const self = this
                if (elemNotification) {
                    elemNotification.addEventListener('click', function handleClick() {
                        // this.logger.log('element clicked');
                        localStorage.setItem('last_project', JSON.stringify(self.current_selected_prjct_user))
                    });
                }

                this.showNotification(recipient_fullname, payload.data.text, link)
            });
        } catch (error) {
            this.logger.error('FCM error', error);
            // expected output: ReferenceError: nonExistentFunction is not defined
            // Note - error messages will vary depending on browser
        }

    }

    showNotification(recipient_fullname, notificationBody, link) {
        // if (Notification.permission !== 'granted') {
        if ((Notification as any).permission !== 'granted') {
            Notification.requestPermission();
        } else {
            const notification = new Notification(recipient_fullname, {
                body: notificationBody,
                dir: 'auto',
                icon: 'https://console.tiledesk.com/chat/assets/img/icon.png'
            });
            const self = this
            notification.onclick = () => {
                window.open(link);
                localStorage.setItem('last_project', JSON.stringify(this.current_selected_prjct_user))
            };
        }
    }

    doRecipient_fullname_initial(recipient_fullname) {
        const recipient_fullname_initial = avatarPlaceholder(recipient_fullname)
        return recipient_fullname_initial;
    }

    doRecipient_fullname_bckgrnd(recipient_fullname) {
        const recipient_fullname_background = getColorBck(recipient_fullname);
        return recipient_fullname_background;

    }

    sendForegroundMsg() {
        const recipient_fullname = 'Milani Salame'
        const requester_avatar_initial = this.doRecipient_fullname_initial(recipient_fullname)
        const requester_avatar_bckgrnd = this.doRecipient_fullname_bckgrnd(recipient_fullname)
        // this.logger.log('recipient_fullname initial', requester_avatar_initial);
        // this.logger.log('recipient_fullname bckgnd', requester_avatar_bckgrnd);
        // https://support-pre.tiledesk.com/chat-ionic5/#/conversation-detail/support-group-62728d1ca76e050040cee42e-025be323bc914f9f9f727ca0b7364eb7/Chicco/active
        // this.logger.log('snd test foreground notification');
        const link = "https://console.tiledesk.com/v2/chat/#/conversation-detail/support-group-6228d9d792d1ed0019240d2b-7f4cc830069f48458b8fd7070f4a7f48/Bot/active"
        // this.logger.log('snd test foreground notification link ', link);
        this.notify.showForegroungPushNotification("Milani Salame", "A new support request has been assigned to you: yuppt tutti", link, requester_avatar_initial, requester_avatar_bckgrnd);
        const elemNotification = document.getElementById('foreground-not');
        // this.logger.log('[APP-COMPONENT] !! elemNotification  ', elemNotification)
        const self = this
        elemNotification.addEventListener('click', function handleClick() {
            // this.logger.log('element clicked');
            localStorage.setItem('last_project', JSON.stringify(self.current_selected_prjct_user))
        });



        this.count = this.count + 1;
        // this.logger.log('snd test foreground notification count ', this.count);
        this.wsRequestsService.publishAndStoreForegroundRequestCount(this.count, 'App comp sendForegroundMsg')
        // const brand = this.brandService.getBrand();
    }

    detectBrowserName() {
        const agent = window.navigator.userAgent.toLowerCase()
        switch (true) {
            case agent.indexOf('edge') > -1:
                return 'edge';
            case agent.indexOf('opr') > -1 && !!(<any>window).opr:
                return 'opera';
            case agent.indexOf('chrome') > -1 && !!(<any>window).chrome:
                return 'chrome';
            case agent.indexOf('trident') > -1:
                return 'ie';
            case agent.indexOf('firefox') > -1:
                return 'firefox';
            case agent.indexOf('safari') > -1:
                return 'safari';
            default:
                return 'other';
        }
    }

    detectBrowserVersion() {
        var userAgent = navigator.userAgent, tem,
            matchTest = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];

        if (/trident/i.test(matchTest[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(userAgent) || [];
            return 'IE ' + (tem[1] || '');
        }
        if (matchTest[1] === 'Chrome') {
            tem = userAgent.match(/\b(OPR|Edge)\/(\d+)/);
            if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
        }
        matchTest = matchTest[2] ? [matchTest[1], matchTest[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = userAgent.match(/version\/(\d+)/i)) != null) matchTest.splice(1, 1, tem[1]);
        return matchTest.join(' ');
    }


    setFavicon(brand) {
        var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        this.logger.log('[APP-COMPONENT] setFavicon ', link)
        link['type'] = 'image/x-icon';
        link['rel'] = 'shortcut icon';
        if (brand) {
            link['href'] = brand.FAVICON_URL;
        }
        document.getElementsByTagName('head')[0].appendChild(link);

    }

    sleekplanSso(user) {
        // this.logger.log('APP-COMP sleekplanSso ')
        // window['$sleek'].setUser = { 
        //     mail: user.email, 
        //     id: user._id, 
        //     name: user.firstname, 
        // }

        this.sleekplanSsoService.getSsoToken(user).subscribe(
            (response) => {
                this.logger.log('[APP-COMP] sleekplanSso response ', response)
                this.logger.log('[APP-COMP] sleekplanSso response token', response['token'])

                // Configure Sleekplan with SSO
                // window['Sleekplan'] = {
                //   id: 'YOUR_SLEEKPLAN_ID',
                //   sso: response.token,
                // };

                // window['$sleek'].setUser({
                //   token: response['token'],
                // });

                // window.document.addEventListener('sleek:init', () => {
                //   window['$sleek'].setUser({ token: response['token'] });
                // }, false);

                // window['$sleek'].sso = { token: response['token'] }

                window['SLEEK_USER'] = { token: response['token'] }

                // Load the Sleekplan widget
                this.sleekplanService.loadSleekplan().then(() => {
                    this.logger.log('[APP-COMP] - Sleekplan successfully initialized');
                })
                    .catch(err => {
                        this.logger.error('[APP-COMP] - Sleekplan initialization failed', err);
                    });
            },
            (error) => {
                this.logger.error('[APP-COMP] - Failed to fetch Sleekplan SSO token', error);

            }
        );
    }

    getCurrentUserAndConnectToWs() {
        this.auth.user_bs.subscribe((user) => {
            this.logger.log('% »»» WebSocketJs WF - APP-COMPONENT - LoggedUser ', user);
            if (user) {
                this.sleekplanSso(user)
            }
            if (!user) {
                this.wsInitialized = false;
            }
            // this.logger.log('% »»» WebSocketJs WF - APP-COMPONENT - WS URL ', this.wsbasepath);
            // this.logger.log('AppConfigService % »»» WebSocketJs WF - APP-COMPONENT - WS URL ', this.appConfigService.getConfig().wsUrl);
            this.logger.log('% »»» WebSocketJs WF - APP-COMPONENT - wsInitialized ', this.wsInitialized);
            // 
            if (user && user.token && !this.wsInitialized) {
                this.logger.log('% »»» WebSocketJs WF - APP-COMPONENT - init ws ');
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
                this.wsInitialized = true
                // this.logger.log('% »»» WebSocketJs WF - APP-COMPONENT - wsInitialized ', this.wsInitialized);
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

    hideWidgetAndForegroundNotificationInComponentDisplayedInChat() {
        this.subscription = this.router.events.subscribe((e) => {
            if (e instanceof NavigationEnd) {
                //    this.logger.log('[APP-COMP] - HIDE WIDGET -> CURRENT URL ', e.url);
                if ((e.url.indexOf('/unserved-request-for-panel') !== -1) || (e.url.indexOf('/projects-for-panel') !== -1) || (e.url.indexOf('/request-for-panel') !== -1)) {

                    this.HIDE_FOREGROUND_NOTIFICATION = true
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
                } else {
                    this.HIDE_FOREGROUND_NOTIFICATION = false
                }
                // if (e.url.indexOf('/unserved-request-for-panel') !== -1) {
                //     this.IS_UNSERVED_REQUEST_FOR_PANEL = true;
                //     this.logger.log('[APP-COMPONENT] NavigationEnd IS_UNSERVED_REQUEST_FOR_PANEL ', this.IS_UNSERVED_REQUEST_FOR_PANEL)
                // } else {
                //     this.IS_UNSERVED_REQUEST_FOR_PANEL = false;
                //     this.logger.log('[APP-COMPONENT] NavigationEnd IS_UNSERVED_REQUEST_FOR_PANEL ', this.IS_UNSERVED_REQUEST_FOR_PANEL)
                // }
            }
        });

        // this.router.events.subscribe((val) => {
        //     if (this.location.path() !== '') {
        //         this.route = this.location.path();
        //         this.logger.log('hideWidgetInComponentDisplayedInChat »> route', this.route)
        //         // tslint:disable-next-line:max-line-length
        //         if ((this.route.indexOf('/unserved-request-for-panel') !== -1) || (this.route.indexOf('/projects-for-panel') !== -1) || (this.route.indexOf('/request-for-panel') !== -1)){
        //             this.logger.log('hideWidgetInComponentDisplayedInChat HERE 1')
        //             // try {
        //             //     if (window && window['tiledeskSettings'] && window['tiledeskSettings'].angularcomponent && window['tiledeskSettings'].angularcomponent.g) {
        //             //         this.logger.log('hideWidgetInComponentDisplayedInChat HERE 2')
        //             //         window['tiledeskSettings'].angularcomponent.g.setParameter('isShown', false)
        //             //     }
        //             // } catch (e) {
        //             //     this.logger.log('hideWidgetInComponentDisplayedInChat ERROR' ,e)
        //             // }

        //             // let wContext: any = window;
        //             // // this.logger.log('windowContext 0', wContext);
        //             // if (window.frameElement && window.frameElement.getAttribute('tiledesk_context') === 'parent') {
        //             //     wContext = window.parent;
        //             //     this.logger.log('hideWidgetInComponentDisplayedInChat HERE 1', wContext)

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

                // (this.route === '/signup') ||
                if ((this.route === '/login') ||
                    (this.route === '/signup') ||
                    (this.route.indexOf('/signup') !== -1) ||
                    (this.route.indexOf('/signup-on-invitation') !== -1) ||
                    (this.route === '/forgotpsw') ||
                    (this.route === '/projects') ||
                    (this.route === '/projects?showid=y') ||
                    (this.route.indexOf('/verify') !== -1) ||
                    (this.route.indexOf('/resetpassword') !== -1) ||
                    (this.route.indexOf('/pricing') !== -1) ||
                    (this.route.indexOf('/chat-pricing') !== -1) ||
                    (this.route.indexOf('/success') !== -1) ||
                    (this.route.indexOf('/canceled') !== -1) ||
                    (this.route.indexOf('/create-project') !== -1) ||
                    (this.route.indexOf('/create-new-project') !== -1) ||
                    (this.route.indexOf('/configure-widget') !== -1) ||
                    (this.route.indexOf('/onboarding') !== -1) ||
                    (this.route.indexOf('/install-widget') !== -1) ||
                    (this.route.indexOf('/handle-invitation') !== -1) ||
                    (this.route.indexOf('/activate-product') !== -1) ||
                    (this.route.indexOf('/request-for-panel') !== -1) ||
                    (this.route.indexOf('/projects-for-panel') !== -1) ||
                    (this.route.indexOf('/project-for-panel') !== -1) ||
                    (this.route.indexOf('/unserved-request-for-panel') !== -1) ||
                    (this.route.indexOf('/autologin') !== -1) ||
                    (this.route.indexOf('/get-chatbot') !== -1) ||
                    (this.route.indexOf('/install-template') !== -1) ||
                    (this.route.indexOf('/unauthorized_access') !== -1) ||
                    (this.route.indexOf('/unauthorized') !== -1) ||
                    (this.route.indexOf('/invalid-token') !== -1) ||
                    (this.route.indexOf('/editfaq') !== -1) ||
                    (this.route.indexOf('/createfaq') !== -1) ||
                    (this.route.indexOf('/cds') !== -1) ||
                    (this.route.indexOf('/desktop-access') !== -1) ||
                    (this.route.indexOf('/desktop--access') !== -1)

                ) {
                    // && this.USER_ROLE === 'agent' 

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
                    // elemSidebarWrapper.style.height = "calc(100vh - 44px)";
                    elemSidebarWrapper.style.height = "calc(100vh - 60px)";


                }

                if (this.route.indexOf('/request-for-panel') !== -1) {
                    this.IS_REQUEST_X_PANEL_ROUTE = true
                    // #right-col
                    // const elemMainPanel = <HTMLElement>document.querySelector('appdashboard-ws-requests-msgs');
                    // this.logger.log('[APP-COMP] request-for-panel elemMainPanel' , elemMainPanel) 

                    // if (this.IS_REQUEST_X_PANEL_ROUTE === true && !this.isMobile()) {
                    //     let ps = new PerfectScrollbar(elemMainPanel, {
                    //         wheelSpeed: 0,
                    //         wheelPropagation: true,
                    //         maxScrollbarLength: 20
                    //       });
                    //       ps.update();
                    // }



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
        this.hideFooter();
    }

    hideFooter() {
        const elemFooter = <HTMLElement>document.querySelector('footer');
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
                    (this.route.indexOf('/onboarding') !== -1) ||
                    (this.route.indexOf('/install-widget') !== -1) ||
                    (this.route.indexOf('/handle-invitation') !== -1) ||
                    (this.route.indexOf('/activate-product') !== -1) ||
                    (this.route.indexOf('/chat') !== -1) ||
                    (this.route.indexOf('/request-for-panel') !== -1) ||
                    (this.route.indexOf('/projects-for-panel') !== -1) ||
                    (this.route.indexOf('/project-for-panel') !== -1) ||
                    (this.route.indexOf('/unserved-request-for-panel') !== -1) ||
                    (this.route.indexOf('/autologin') !== -1) ||
                    (this.route.indexOf('/unauthorized_access') !== -1) ||
                    (this.route.indexOf('/unauthorized') !== -1) ||
                    (this.route.indexOf('/invalid-token') !== -1) ||
                    (this.route.indexOf('/editfaq') !== -1) ||
                    (this.route.indexOf('/createfaq') !== -1) ||
                    (this.route.indexOf('/cds') !== -1) ||
                    (this.route.indexOf('/desktop-access') !== -1) ||
                    (this.route.indexOf('/desktop--access') !== -1) ||
                    (this.route.indexOf('/projects') !== -1) ||
                    (this.route.indexOf('/pricing') !== -1)
                ) {
                    elemFooter.setAttribute('style', 'display:none;');
                    // this.logger.log('DETECT LOGIN PAGE')
                    // tslint:disable-next-line:max-line-length
                } else {
                    elemFooter.setAttribute('style', '');
                }

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
                } else {

                    elemAppFooter.setAttribute('style', '');

                }
            } else {
                // this.logger.log('»> * ', this.route)
            }
        });
    }


    setPrechatFormInWidgetSettings() {
        this.router.events.subscribe((val) => {
            if (this.location.path() !== '') {
                this.route = this.location.path();
                // this.logger.log('»> ', this.route)
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
                // this.logger.log('APP.COMP currentUrl ', this.route, 'tiledeskSettings ', window['tiledeskSettings']);
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
