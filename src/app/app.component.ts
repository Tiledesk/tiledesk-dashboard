import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy, PopStateEvent } from '@angular/common';
import 'rxjs/add/operator/filter';
import { NavbarComponent } from './components/navbar/navbar.component';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import PerfectScrollbar from 'perfect-scrollbar';

import { AuthService } from './core/auth.service';
import { TranslateService } from '@ngx-translate/core';

import { RequestsService } from './services/requests.service';
import * as firebase from 'firebase/app';

// import { FaqKbService } from './services/faq-kb.service';

declare const $: any;

@Component({
    selector: 'app-root',
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

    @ViewChild(NavbarComponent) navbar: NavbarComponent;

    constructor(
        public location: Location,
        private router: Router,
        private translate: TranslateService,
        private requestsService: RequestsService,
        private auth: AuthService,
        // private faqKbService: FaqKbService,
    ) {
        translate.setDefaultLang('en');

        const browserLang = this.translate.getBrowserLang();
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
        console.log('APP COMP ')
        $.material.init();

        // HIDE ELEMENT IF THE USER IN ONE OF THE 'AUTH' PAGES: SIGNIN, SIGUP, WELCOME
        this.hideElementsInAuthPage()



        this.location.subscribe((ev: PopStateEvent) => {
            this.lastPoppedUrl = ev.url;
        });
        this.router.events.subscribe((event: any) => {
            this.navbar.sidebarClose();
            if (event instanceof NavigationStart) {
                if (event.url !== this.lastPoppedUrl)
                    this.yScrollStack.push(window.scrollY);
            } else if (event instanceof NavigationEnd) {
                if (event.url === this.lastPoppedUrl) {
                    this.lastPoppedUrl = undefined;
                    window.scrollTo(0, this.yScrollStack.pop());
                } else
                    window.scrollTo(0, 0);
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

        // GET ALL REQUESTS (AFTER THE CHECK 'IF THE USER IS SIGNED IN')
        const self = this
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                console.log('// User is signed in. ', user)

                // self.requestsService.startRequestsQuery()
            } else {
                console.log('// // No user is signed in. ', user)
                // No user is signed in.
                // tslint:disable-next-line:no-debugger
                // debugger
                if (self.requestsService.unsubscribe) {
                    self.requestsService.unsubscribe()
                    self.requestsService.resetRequestsList()
                }
            }
        });
        // this.requestsService.startRequestsQuery()

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


        /* DETECT IF IS THE LOGIN PAGE - SIGNUP - WELCOME */
        this.router.events.subscribe((val) => {
            if (this.location.path() !== '') {
                this.route = this.location.path();

                // console.log('»> ', this.route)
                // tslint:disable-next-line:max-line-length
                if ((this.route === '/login') || (this.route === '/signup') || (this.route === '/welcome') || (this.route === '/projects')) {

                    elemNavbar.setAttribute('style', 'display:none;');
                    elemAppSidebar.setAttribute('style', 'display:none;');
                    elemMainPanel.setAttribute('style', 'width:100% !important; margin-top: -70px');

                    // console.log('DETECT LOGIN PAGE')
                    this.LOGIN_PAGE = true;
                } else {
                    this.LOGIN_PAGE = false;
                    elemAppSidebar.setAttribute('style', 'display:block;');
                    elemNavbar.setAttribute('style', 'display:block;');
                    elemMainPanel.setAttribute('style', '');

                }
            } else {
                // console.log('»> * ', this.route)
            }
        });

        /* DETECT IF IS PROJECT PAGE*/
        // this.router.events.subscribe((val) => {
        //     if (this.location.path() !== '') {
        //         this.route = this.location.path();
        //         console.log('»> ', this.route)
        //         if (this.route === '/projects') {

        //             elemAppSidebar.setAttribute('style', 'display:none;');
        //             elemMainPanel.setAttribute('style', 'width:100% !important;');
        //             elemNavbarToogle.setAttribute('style', 'display:none;');

        //             if (window.matchMedia(`(min-width: 960px)`).matches) {
        //                 console.log('MATCH min-width: 960px)')
        //             }

        //             // console.log('DETECT LOGIN PAGE')
        //             // tslint:disable-next-line:max-line-length
        //         } else if ((this.route === '/login') || (this.route === '/signup') || (this.route === '/welcome')) {

        //             elemNavbar.setAttribute('style', 'display:none;');
        //             elemAppSidebar.setAttribute('style', 'display:none;');
        //             elemMainPanel.setAttribute('style', 'width:100% !important; margin-top: -70px');

        //         }
        //     } else {
        //         // console.log('»> * ', this.route)
        //     }
        // });
    }

    ngAfterViewInit() {
        this.runOnRouteChange();
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
}
