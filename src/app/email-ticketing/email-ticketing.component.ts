import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from 'app/services/app-config.service';
import { DepartmentService } from 'app/services/department.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { URL_getting_started_with_email_ticketing } from '../utils/util';
import { BrandService } from 'app/services/brand.service';
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
  public hasCopiedTicketingEmail: boolean = false
  public public_Key: any;
  public emailEndpoint: string;
  public hideHelpLink: boolean;
  public companyName: string
  constructor(
    private deptService: DepartmentService,
    private auth: AuthService,
    private logger: LoggerService,
    public appConfigService: AppConfigService,
    public brandService: BrandService
  ) { 
    const brand = brandService.getBrand(); 
    this.hideHelpLink= brand['DOCS'];
    this.companyName = this.companyName = brand["BRAND_NAME"] 
  }

  ngOnInit() {
    this.getCurrentProjectAndBuildTicketingEmail();
    this.getDeptsByProjectId();
    this.getBrowserVersion();
    this.listenSidebarIsOpened();
    this.getOSCODE();
    // this.getTicketingEmailEndpoint()
  
  }

  // getTicketingEmailEndpoint() {
  //   this.emailEndpoint = this.appConfigService.getConfig().ticketingEmail
  //   console.log('  this.emailEndpoint ',   this.emailEndpoint)
  // }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    // this.logger.log('[EMAIL-TICKETING] AppConfigService getAppConfig  public_Key', this.public_Key);

    let keys = this.public_Key.split("-");
    keys.forEach(key => {
      if (key.includes("DEP")) {
        // this.logger.log('[EMAIL-TICKETING] PUBLIC-KEY - key', key);
        let dep = key.split(":");
        
        if (dep[1] === "F") {
          this.isVisibleDEP = false;
        } else {
          this.isVisibleDEP = true;
        }
      }

    });

    if (!this.public_Key.includes("DEP")) {
  
      this.isVisibleDEP = false;
    }
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;

    })
  }

  getCurrentProjectAndBuildTicketingEmail() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.projectID = project._id
        this.logger.log('[EMAIL-TICKETING] projectID ', this.projectID)

        // this.ticketingEmail = "support@" + this.projectID + '.tickets.tiledesk.com' // v2
        // this.ticketingEmail = "support@" + this.projectID + '.email.tiledesk.com' // v3
        this.ticketingEmail = "support@" + this.projectID + '.' + this.appConfigService.getConfig().ticketingEmail
      }
    });
  }

  copyTicketingEmail() {
    const ticketingEmailElem = document.getElementById('ticketing-email') as HTMLInputElement;
    this.logger.log('onSelectedDeptId - selectedDeptId', ticketingEmailElem);
    ticketingEmailElem.select();
    try {
      document.execCommand('copy');
      this.hasCopiedTicketingEmail = true
    } catch (err) {
      this.logger.error('Fallback: Oops, unable to copy', err);
    }
  }





  getDeptsByProjectId() {
    this.deptService.getDeptsByProjectId().subscribe((departments: any) => {
      this.logger.log('[EMAIL-TICKETING] - GET DEPTS (FILTERED FOR PROJECT ID)', departments);

      if (departments) {
        this.departments = []

        departments.forEach((dept: any) => {
          // this.logger.log('»»» »»» DEPTS PAGE - DEPT)', dept);
          if (dept && dept.default === false) {
            this.logger.log('[EMAIL-TICKETING] - GET DEPTS - DEFAULT DEPT ', dept);
            this.departments.push(dept)
          }
        });

      }
    }, error => {

      this.logger.error('[EMAIL-TICKETING] (FILTERED FOR PROJECT ID) - ERROR', error);
    }, () => {
      this.logger.log('[EMAIL-TICKETING] (FILTERED FOR PROJECT ID) - COMPLETE')

    });
  }

  onSelectedDeptId(selectedDeptId: string) {
    this.logger.log('onSelectedDeptId - selectedDeptId', selectedDeptId);
    this.buildDeptTicketingEmail(selectedDeptId)
  }

  buildDeptTicketingEmail(selectedDeptId) {
    // <Department_id>@<Project_id>.tickets.tiledesk.com
    // this.ticketingEmailDept = selectedDeptId + "@" + this.projectID + '.tickets.tiledesk.com'
    // this.ticketingEmailDept = selectedDeptId + "@" + this.projectID + '.email.tiledesk.com'
    this.ticketingEmailDept = selectedDeptId + "@" + this.projectID + '.' + this.appConfigService.getConfig().ticketingEmail
  }

  copyTicketingEmailDept() {
    const ticketingEmailDeptElem = document.getElementById('ticketing-email-dept') as HTMLInputElement;
    this.logger.log('onSelectedDeptId - selectedDeptId', ticketingEmailDeptElem);
    ticketingEmailDeptElem.select();
    document.execCommand('copy');
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
