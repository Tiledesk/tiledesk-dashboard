import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/core/auth.service';

@Component({
  selector: 'appdashboard-unauthorized-for-sidebar',
  templateUrl: './unauthorized-for-sidebar.component.html',
  styleUrls: ['./unauthorized-for-sidebar.component.scss']
})
export class UnauthorizedForSidebarComponent implements OnInit {
  pageName: string = ''
  isChromeVerGreaterThan100: boolean;
  callingPage: string
  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
  ) { }

  ngOnInit(): void {

    this.route.paramMap.subscribe((params) => {
      this.callingPage = params.get('callingpage');
      console.log('Unauthorized for sidebar - *** Called from page:', this.callingPage);
      if (this.callingPage === 'wsrequests' || this.callingPage === 'all-conversations') {
        this.pageName = 'Requests'
      }
      if (this.callingPage === 'wsrequest-detail' || this.callingPage === 'wsrequest-detail-history') {
        this.pageName = 'RequestMsgsPage.RequestDetails'
      }

      if (this.callingPage === 'contacts') {
        this.pageName = 'Contacts'
      }

      if (this.callingPage === 'flows') {
        this.pageName = 'Flows'
      }

      if (this.callingPage === 'kb') {
        this.pageName = 'KnowledgeBases'
      }

       if (this.callingPage === 'flow-webhook') {
        this.pageName = 'Webhooks'
      }

      if (this.callingPage === 'analytics') {
        this.pageName = 'Analytics.AnalyticsTITLE'
      }

      if (this.callingPage === 'activities') {
        this.pageName = 'Activities'
      }
     

      

      


      
      

      

      

    });
     this.getBrowserVersion()
  }

   getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    })
  }

}
