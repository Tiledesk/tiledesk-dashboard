import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { RoleService } from 'app/services/role.service';

@Component({
  selector: 'appdashboard-unauthorized-for-sidebar',
  templateUrl: './unauthorized-for-sidebar.component.html',
  styleUrls: ['./unauthorized-for-sidebar.component.scss']
})
export class UnauthorizedForSidebarComponent implements OnInit, OnDestroy {
  pageName: string = ''
  isChromeVerGreaterThan100: boolean;
  callingPage: string
  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private roleService: RoleService
  ) { }

  ngOnInit(): void {
    // Imposta il flag per prevenire il loop di reindirizzamento
    this.roleService.setOnUnauthorizedPage(true);

    // Ottieni i parametri immediatamente (non solo dalla subscription)
    this.callingPage = this.route.snapshot.paramMap.get('callingpage');
    console.log('Unauthorized for sidebar - *** Called from page (snapshot):', this.callingPage);
    this.setPageName(this.callingPage);

    this.route.paramMap.subscribe((params) => {
      this.callingPage = params.get('callingpage');
      console.log('Unauthorized for sidebar - *** Called from page:', this.callingPage);
      this.setPageName(this.callingPage);
    });
     this.getBrowserVersion()
  }

   getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    })
  }

  ngOnDestroy(): void {
    // Resetta il flag quando si lascia la pagina /no-auth
    this.roleService.setOnUnauthorizedPage(false);
  }

  private setPageName(callingPage: string): void {
    if (!callingPage) {
      this.pageName = '';
      return;
    }

    if (callingPage === 'wsrequests' || callingPage === 'all-conversations') {
      this.pageName = 'Requests'
    } else if (callingPage === 'wsrequest-detail' || callingPage === 'wsrequest-detail-history') {
      this.pageName = 'RequestMsgsPage.RequestDetails'
    } else if (callingPage === 'history') {
      this.pageName = 'History'
    } else if (callingPage === 'contacts' || callingPage === 'contact-details') {
      this.pageName = 'Contacts'
    } else if (callingPage === 'flows') {
      this.pageName = 'Flows'
    } else if (callingPage === 'kb') {
      this.pageName = 'KnowledgeBases'
    } else if (callingPage === 'flow-webhook') {
      this.pageName = 'Webhooks'
    } else if (callingPage === 'analytics') {
      this.pageName = 'Analytics.AnalyticsTITLE'
    } else if (callingPage === 'activities') {
      this.pageName = 'Activities'
    } else if (callingPage === 'automations') {
      this.pageName = 'WhatsAppBroadcasts'
    } else if (callingPage === 'new-broadcast') {
      this.pageName = 'NewBroadcast'
    } else {
      // Fallback: usa il callingPage stesso se non corrisponde a nessun caso
      this.pageName = callingPage;
      console.warn('Unauthorized for sidebar - Unknown callingPage:', callingPage);
    }
  }

}
