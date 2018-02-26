import { Component, OnInit, ElementRef, AfterContentChecked, AfterViewChecked } from '@angular/core';
import { ROUTES } from '../sidebar/sidebar.component';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { RequestsService } from '../../services/requests.service';
declare var $: any;

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
            console.log(' ++ +++ COUNT OF UNSERVED REQUEST ', this.unservedRequestCount);

        });

        // SUBSCRIBE TO COUNT OF UNSERVED REQUESTS
        this.requestsService.mySubject.subscribe(
            (values) => {
                if (values) {
                    this.unservedRequestCount = values.length
                    console.log('REQUEST SERVICE PUBLISH REQUESTS ', values)
                    console.log('REQUEST SERVICE PUBLISH COUNT OF UNSERVED REQUEST ', this.unservedRequestCount);
                    // let i: any;
                    // for (i = 0; i < values.length; i++) {
                    //     this.valueText = values[i].text
                    //     console.log('REQUEST TEXT: ', this.valueText )
                    // }
                    this.lastRequest = values[values.length - 1];
                    console.log('LAST REQUEST TEXT: ', this.lastRequest.text)

                    this.showNotification()

                }
            }
        );
    }



    showNotification() {
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
    }



}
