import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/core/auth.service';
import { NotifyService } from 'app/core/notify.service';
import { AutomationsService } from 'app/services/automations.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { RoleService } from 'app/services/role.service';
import { RolesService } from 'app/services/roles.service';
import { PERMISSIONS } from 'app/utils/permissions.constants';
import * as moment from 'moment';
import { Observable, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';

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
  selected_template_name: string;
  selected_automation_created_at: string;
  transactions = [];
  logs = [];

  read_count: any;
  delivered_count: any;
  sent_count: any;
  accepted_count: any;
  rejected_count: any;
  failed_count: any;

  browserLang: string;
  currentLang: string;
  private unsubscribe$: Subject<any> = new Subject<any>();

  hasDefaultRole: boolean;
  ROLE: string;
  PERMISSIONS: any;
  PERMISSION_TO_CREATE: boolean;

  constructor(
    private auth: AuthService,
    private logger: LoggerService,
    private automationsService: AutomationsService,
    private router: Router,
    private roleService: RoleService,
    public translate: TranslateService,
    public route: ActivatedRoute,
    private rolesService: RolesService,
    public notify: NotifyService,
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
    this.setMomentLocale();
    this.listenToProjectUser()
    // this.getQueryParams()
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();   
    this.unsubscribe$.complete();
  }

  listenToProjectUser() {
    this.rolesService.listenToProjectUserPermissions(this.unsubscribe$);

    this.rolesService.getUpdateRequestPermission()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(status => {
        this.ROLE = status.role;
        this.PERMISSIONS = status.matchedPermissions;
        console.log('[AUTOMATION] - this.ROLE:', this.ROLE);
        console.log('[AUTOMATION] - this.PERMISSIONS', this.PERMISSIONS);
        this.hasDefaultRole = ['owner', 'admin', 'agent'].includes(status.role);
        console.log('[AUTOMATION] - hasDefaultRole', this.hasDefaultRole);

        // PERMISSION_TO_CREATE
        if (status.role === 'owner' || status.role === 'admin') {
          // Owner and Admin always has permission
          this.PERMISSION_TO_CREATE = true;
          console.log('[AUTOMATION] - Project user is owner or admin (1)', 'PERMISSION_TO_CREATE:', this.PERMISSION_TO_CREATE);

        } else if (status.role === 'agent') {
          // Agent never have permission
          this.PERMISSION_TO_CREATE = false;
          console.log('[AUTOMATION] - Project user is agent (2)', 'PERMISSION_TO_CREATE:', this.PERMISSION_TO_CREATE);

        } else {
          // Custom roles: permission depends on matchedPermissions
          this.PERMISSION_TO_CREATE = status.matchedPermissions.includes(PERMISSIONS.AUTOMATIONSLOG_CREATE);
          console.log('[AUTOMATION] - Custom role (3)', status.role, 'PERMISSION_TO_CREATE:', this.PERMISSION_TO_CREATE);
        }

      }
    );
  
  }

   getQueryParams() {
    this.route.queryParamMap
      .subscribe(params => {
        this.logger.log('[AUTOMATION COMP.]  queryParams', params['params']);
        
        if (params['params']['id']) {
          this.showAutomationsList = false;
          this.showAutomationDetail = true;
        } else {
          this.showAutomationsList =  true;
          this.showAutomationDetail = false;
        }
      })
    }
  


  setMomentLocale() {
      this.browserLang = this.translate.getBrowserLang();
      // this.logger.log('[REQUEST-DTLS-X-PANEL] - setMomentLocale browserLang', this.browserLang)
  
      let stored_preferred_lang = undefined
      if (this.auth.user_bs && this.auth.user_bs.value) {
        stored_preferred_lang = localStorage.getItem(this.auth.user_bs.value._id + '_lang')
      }
      // const stored_preferred_lang = localStorage.getItem(this.auth.user_bs.value._id + '_lang')
      let dshbrd_lang = ''
      if (this.browserLang && !stored_preferred_lang) {
        dshbrd_lang = this.browserLang
      } else if (this.browserLang && stored_preferred_lang) {
        dshbrd_lang = stored_preferred_lang
      }
      this.currentLang = dshbrd_lang
      moment.locale(dshbrd_lang)

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
      this.logger.log("[AUTOMATION COMP.] Transactions: ", transactions);
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

  onAutomationSelect(automation_id: string, createdAt: string, template_name:any) {
    this.selected_template_name = template_name;
    this.selected_automation_created_at = createdAt;
    this.logger.log("[AUTOMATION COMP.] onAutomationSelect createdAt: ", this.selected_automation_created_at, 'template_name ',  this.selected_template_name);
    this.selected_automation_id = automation_id;
    this.showSpinner = true;
    this.getLogs(this.selected_automation_id);
  }

  getLogs(automation_id: string) {
    this.automationsService.getTransactionLogs(automation_id).subscribe((logs: []) => {
      this.logger.log("[AUTOMATION COMP.] Logs: ", logs);
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
      this.showAutomationsList = false;
      this.showAutomationDetail = true;
    }
    if (target === 'automations') {
      this.getTransactions();
      this.showAutomationsList = true;
      this.showAutomationDetail = false;
    }
  }

  _reload(target) {
 
  this.showSpinner = true;

  if (target === 'logs') {
    this.getLogs(this.selected_automation_id);

    // Mantieni i query params attuali (es. id)
    this.router.navigate([], {
      relativeTo: this.route,
      queryParamsHandling: 'preserve'
    });

    this.showAutomationsList = false;
    this.showAutomationDetail = true;
  }

  if (target === 'automations') {
    this.getTransactions();

    // In questo caso puoi rimuovere l'id
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });

    this.showAutomationsList = true;
    this.showAutomationDetail = false;
  }
}


  goToNewBroadcast() {
    if (!this.PERMISSION_TO_CREATE) {
      this.notify.presentDialogNoPermissionToPermomfAction()
      return;
    }
    this.router.navigate(['project/' + this.project._id + '/new-broadcast']);
  }

  trackByTransactionId(_index: number, automation: any) { 
    return automation._id; 
  }
}
