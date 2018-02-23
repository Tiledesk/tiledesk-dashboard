import { Component, OnInit } from '@angular/core';

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

    constructor() { }

    ngOnInit() {
        this.menuItems = ROUTES.filter(menuItem => menuItem);
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
    }
    setActiveClassToSettings() {
        this.isActive = 'active';
        console.log('HAS CLICKED SET ACTIVE TO SETTINGS MENU ITEM ', this.isActive);
    }
}
