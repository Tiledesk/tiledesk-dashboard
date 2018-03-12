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
    ) {
        translate.setDefaultLang('it');

        const browserLang = this.translate.getBrowserLang();
        if (browserLang) {
            if (browserLang === 'en') {
                this.translate.use('en');
            } else {
                this.translate.use('it');
            }
        }

        // this.unservedRequestCount = 0
    }

    switchLanguage(language: string) {
        this.translate.use(language);
    }

    ngOnInit() {
        $.material.init();


        this.hideElementsInLoginPage()

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

        this.requestsService.startRequestsQuery()

    }


    hideElementsInLoginPage() {
        // GET THE HTML ELEMENT NAVBAR AND SIDEBAR THAT WILL BE HIDDEN IF IS DETECTED THE LOGIN PAGE
        const elemAppSidebar = <HTMLElement>document.querySelector('app-sidebar');
        // console.log('xxxx xxxx elemAppSidebar ', elemAppSidebar)
        const elemNavbar = <HTMLElement>document.querySelector('.navbar');
        // console.log('xxxx xxxx elemNavbar', elemNavbar)

        /* DETECT IF IS THE LOGIN PAGE */
        this.router.events.subscribe((val) => {
            if (this.location.path() !== '') {
                this.route = this.location.path();

                // console.log('»> ', this.route)
                if (this.route === '/login') {

                    // this.navbar.sidebarClose();
                    elemAppSidebar.setAttribute('style', 'display:none;');
                    elemNavbar.setAttribute('style', 'display:none;');

                    console.log('DETECT LOGIN PAGE')
                    this.LOGIN_PAGE = true;
                } else {
                    this.LOGIN_PAGE = false;
                    elemAppSidebar.setAttribute('style', 'display:block;');
                    elemNavbar.setAttribute('style', 'display:block;');
                }
            } else {
                // console.log('»> * ', this.route)
            }
        });
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
