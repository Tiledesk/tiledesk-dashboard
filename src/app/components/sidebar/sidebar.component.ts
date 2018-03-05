import { Component, OnInit } from '@angular/core';
import { RequestsService } from '../../services/requests.service';
import { Router } from '@angular/router'
import { Location } from '@angular/common'


declare const $: any;
declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}
export const ROUTES: RouteInfo[] = [
    { path: 'home', title: 'Home', icon: 'dashboard', class: '' },
    { path: 'requests', title: 'Visitatori', icon: 'group', class: '' },
    // MOVED IN THE TEMPLATE: IS NECESSARY TO LINK THE CHAT IN A EXTERNAL PAGE
    // { path: 'chat', title: 'Chat', icon: 'chat', class: '' },
    // { path: 'analytics', title: 'Analytics', icon: 'trending_up', class: '' },
    // MOVED IN THE TEMPLATE: IS NECESSARY TO MANAGE THE SETTING SUB MENU
    // { path: 'settings', title: 'Impostazioni',  icon: 'settings', class: '' },

    // { path: 'dashboard', title: 'Dashboard', icon: 'dashboard', class: '' },
    // { path: 'user-profile', title: 'User Profile', icon: 'person', class: '' },
    // { path: 'table-list', title: 'Table List', icon: 'content_paste', class: '' },
    // { path: 'typography', title: 'Typography', icon: 'library_books', class: '' },
    // { path: 'icons', title: 'Icons', icon: 'bubble_chart', class: '' },
    // { path: 'maps', title: 'Maps', icon: 'location_on', class: '' },
    // { path: 'notifications', title: 'Notifications', icon: 'notifications', class: '' },
    // { path: 'upgrade', title: 'Upgrade to PRO', icon: 'unarchive', class: 'active-pro' },
];

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
    menuItems: any[];

    SHOW_SETTINGS_SUBMENU = false;
    isActive: string;
    // switch up and down the caret of menu item settings
    trasform = 'none';
    unservedRequestCount: number;

    route: string;
    LOGIN_PAGE: boolean;
    IS_UNAVAILABLE = false;


    constructor(
        private requestsService: RequestsService,
        private router: Router,
        public location: Location,
    ) { }

    ngOnInit() {
        this.menuItems = ROUTES.filter(menuItem => menuItem);

        // GET COUNT OF UNSERVED REQUESTS
        this.requestsService.getCountUnservedRequest().subscribe((count: number) => {
            this.unservedRequestCount = count;
            // console.log(' ++ +++ (sidebar) COUNT OF UNSERVED REQUEST ', this.unservedRequestCount);

        });

        // SUBSCRIBE TO UNSERVED REQUESTS PUBLISHED BY REQUEST SERVICE
        this.requestsService.mySubject.subscribe((values) => {
            // console.log('xxxxx xxxxx', values)
            if (values) {
                this.unservedRequestCount = values.length
                // console.log('SIDEBAR SUBSCRIBE TO REQUEST SERVICE PUBLISHED REQUESTS ', values)
                // console.log('SIDEBAR SUBSCRIBE TO REQUEST PUBLISHED COUNT OF UNSERVED REQUEST ', this.unservedRequestCount);
            }
        });

    }
    isMobileMenu() {
        if ($(window).width() > 991) {
            return false;
        }
        return true;
    };

    has_clicked_settings(SHOW_SETTINGS_SUBMENU: boolean) {
        this.SHOW_SETTINGS_SUBMENU = SHOW_SETTINGS_SUBMENU;
        console.log('HAS CLICKED SETTINGS - SHOW_SETTINGS_SUBMENU ', this.SHOW_SETTINGS_SUBMENU);
        if (this.SHOW_SETTINGS_SUBMENU === true) {
            this.trasform = 'rotate(180deg)';
        } else {
            this.trasform = 'none';
        }
    }
    setActiveClassToSettings() {
        this.isActive = 'active';
        console.log('HAS CLICKED SET ACTIVE TO SETTINGS MENU ITEM ', this.isActive);
    }

    availale_unavailable_status(hasClickedChangeStatus: boolean) {
        hasClickedChangeStatus = hasClickedChangeStatus;
        if (hasClickedChangeStatus) {
            //   this.display = 'block';

           this.IS_UNAVAILABLE = hasClickedChangeStatus
            console.log('HAS CLICKED CHANGE STATUS - IS_UNAVAILABLE ? ', this.IS_UNAVAILABLE);
        }

        if (!hasClickedChangeStatus) {
            //   this.display = 'none';
            console.log('HAS CLICKED CHANGE STATUS ', hasClickedChangeStatus);
            this.IS_UNAVAILABLE = hasClickedChangeStatus
            console.log('HAS CLICKED CHANGE STATUS - IS_UNAVAILABLE ? ', this.IS_UNAVAILABLE);
        }
        // this.HAS_CLICKED_BTN_OPEN_DROPDOWN = hasClickedOpenDropDown;
        // console.log('HAS_CLICKED_BTN_OPEN_DROPDOWN ', hasClickedOpenDropDown);

    }
}
