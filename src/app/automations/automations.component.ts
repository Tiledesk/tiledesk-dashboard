import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { AutomationsService } from 'app/services/automations.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { RoleService } from 'app/services/role.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'appdashboard-automations',
  templateUrl: './automations.component.html',
  styleUrls: ['./automations.component.scss']
})
export class AutomationsComponent implements OnInit {

  public IS_OPEN_SETTINGS_SIDEBAR: boolean;
  public isChromeVerGreaterThan100: boolean;

  showSpinner: boolean = true;
  showAutomationsList: boolean = true;
  showAutomationDetail: boolean = false;

  myControl = new FormControl('');
  channels: string[] = ['WhatsApp'];
  filteredChannels: Observable<string[]>;
  project: any;

  channel: string;
  selected_automation_id: any;
  transactions = [];
  logs = [];

  read_count: any;
  delivered_count: any;
  sent_count: any;
  accepted_count: any;
  rejected_count: any;
  failed_count: any;

  constructor(
    private auth: AuthService,
    private logger: LoggerService,
    private automationsService: AutomationsService,
    private router: Router,
    private roleService: RoleService
  ) { 
   
  }

  ngOnInit(): void {
    // this.auth.checkRoleForCurrentProject();
    this.roleService.checkRoleForCurrentProject('automations')
    this.getBrowserVersion();
    this.listenSidebarIsOpened();
    this.showSpinner = true;
    this.initializeFilters();
    this.getTransactions();
    this.getCurrentProject();
  }

  initializeFilters() {
    this.filteredChannels = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    )
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.channels.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  // ----------------------
  // UTILS FUNCTION - Start
  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    })
  }

  listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
      this.logger.log('[AUTOMATION COMP.] SETTINGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    });
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      this.logger.log('[AUTOMATION] project',  this.project ) 
      // if ((this.project.profile_name === 'Sandbox' || this.project.profile_name === 'free') && this.project.trial_expired === true) {
      //   this.plan_expired = true;
      // }
    });
  }
  // UTILS FUNCTION - End
  // --------------------

  onChannelSelect(channel) {
    this.channel = channel;
    this.getTransactions();
  }

  getTransactions() {
    this.automationsService.getTransactions('whatsapp').subscribe((transactions: []) => {
      this.logger.debug("[AUTOMATION COMP.] Transactions: ", transactions);
      this.transactions = transactions;
      this.transactions.sort(function compare(a, b) {
        if (a.createdAt > b.createdAt) {
          return -1;
        }
        if (a.createdAt < b.createdAt) {
          return 1;
        }
        return 0
      });
      this.showSpinner = false;

    }, (error) => {
      this.logger.error("get transactions error: ", error)
    })
  }

  onAutomationSelect(automation_id: string) {
    this.selected_automation_id = automation_id;
    this.showSpinner = true;
    this.getLogs(this.selected_automation_id);
  }

  getLogs(automation_id: string) {
    this.automationsService.getTransactionLogs(automation_id).subscribe((logs: []) => {
      this.logger.debug("[AUTOMATION COMP.] Logs: ", logs);
      this.logs = logs;
      this.showAutomationsList = false;
      this.showAutomationDetail = true;
      this.counter();
      this.changeRoute(automation_id)
      this.showSpinner = false;
    }, (error) => {
      this.logger.error("[AUTOMATION COMP.] Get logs error: ", error);
    })
  }

  counter() {
    this.read_count = this.logs.filter(l => l.status_code === 3).length
    this.delivered_count = this.logs.filter(l => l.status_code === 2).length
    this.sent_count = this.logs.filter(l => l.status_code === 1).length
    this.accepted_count = this.logs.filter(l => l.status_code === 0).length
    this.rejected_count = this.logs.filter(l => l.status_code === -1).length
    this.failed_count = this.logs.filter(l => l.status_code === -2).length
  }

  changeRoute(key?) {
    if (key) {
      this.router.navigate(['project/' + this.project._id + '/automations/'], { queryParams: { id: key } });
    } else {
      this.router.navigate(['project/' + this.project._id + '/automations/']);
    }
  }

  backToAutomations() {
    this.changeRoute();
    this.showAutomationsList = true;
    this.showAutomationDetail = false;
  }

  reload(target) {
    this.showSpinner = true;
    if (target === 'logs') {
      this.getLogs(this.selected_automation_id);
    }
    if (target === 'automations') {
      this.getTransactions();
    }
  }
}
