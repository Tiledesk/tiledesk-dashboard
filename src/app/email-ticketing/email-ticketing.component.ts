import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { DepartmentService } from 'app/services/department.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { URL_getting_started_with_email_ticketing } from '../utils/util';
@Component({
  selector: 'appdashboard-email-ticketing',
  templateUrl: './email-ticketing.component.html',
  styleUrls: ['./email-ticketing.component.scss']
})
export class EmailTicketingComponent implements OnInit {
 public projectID: string;
 public isVisibleDEP: boolean
 public IS_OPEN_SETTINGS_SIDEBAR: boolean;
 public email_ticketing_docs_url = URL_getting_started_with_email_ticketing
 public isChromeVerGreaterThan100: boolean;
 public ticketingEmail: string;
 public departments: any;
 public selectedDeptId: string;
 public ticketingEmailDept: string;
  constructor(
    private deptService: DepartmentService,
    private auth: AuthService,
    private logger: LoggerService
  ) { }

  ngOnInit() {
    this.getCurrentProjectAndBuildTicketingEmail();
    this.getDeptsByProjectId();
    this.getBrowserVersion();
    this.listenSidebarIsOpened();
  }

  getCurrentProjectAndBuildTicketingEmail() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.projectID = project._id
         console.log('[EMAIL-TICKETING] projectID ', this.projectID)

         this.ticketingEmail = "support@" +  this.projectID + '.tickets.tiledesk.com'
      }
    });
  }


  getDeptsByProjectId() {
    this.deptService.getDeptsByProjectId().subscribe((departments: any) => {
     console.log('[EMAIL-TICKETING] - GET DEPTS (FILTERED FOR PROJECT ID)', departments);

      if (departments) {
        this.departments = [ ]
        
        departments.forEach((dept: any) => {
          // this.logger.log('»»» »»» DEPTS PAGE - DEPT)', dept);
          if (dept && dept.default === false) {
            console.log('[EMAIL-TICKETING] - GET DEPTS - DEFAULT DEPT ', dept);
            this.departments.push(dept)
          }
        });

      }
    }, error => {
     
      console.error('[EMAIL-TICKETING] (FILTERED FOR PROJECT ID) - ERROR', error);
    }, () => {
      console.log('[EMAIL-TICKETING] (FILTERED FOR PROJECT ID) - COMPLETE')
     
    });
  }

  onSelectedDeptId(selectedDeptId: string) {
    console.log('onSelectedDeptId - selectedDeptId', selectedDeptId);

  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => { 
     this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    //  console.log("[WS-REQUESTS-LIST] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
   }  


   listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
      this.logger.log('[EMAIL-TICKETING] SETTNGS-SIDEBAR is opened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    });
  }

  goToEmailTicketingDocs() {
    const url = this.email_ticketing_docs_url;
    window.open(url, '_blank');
  }


}
