import { Component, HostListener, OnInit } from '@angular/core'
import { LoggerService } from './../../services/logger/logger.service'
import { AppConfigService } from '../../services/app-config.service'
import { AuthService } from '../../core/auth.service'
import { NavigationEnd, Router } from '@angular/router'
import { Location } from '@angular/common'
import { TranslateService } from '@ngx-translate/core'
import { UsersService } from 'app/services/users.service'
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'appdashboard-settings-sidebar',
  templateUrl: './settings-sidebar.component.html',
  styleUrls: ['./settings-sidebar.component.scss'],
})
export class SettingsSidebarComponent implements OnInit {
  EMAIL_TEMPLATE_NAME = [
    'assignedRequest',
    'assignedEmailMessage',
    'pooledRequest',
    'pooledEmailMessage',
    'newMessage',
    'ticket',
    'sendTranscript',
  ]
  isVisibleANA: boolean
  isVisibleACT: boolean
  isVisibleTRI: boolean
  isVisibleGRO: boolean
  isVisibleDEP: boolean
  isVisibleOPH: boolean
  isVisibleCAR: boolean
  isVisibleLBS: boolean
  isVisibleAPP: boolean
  TAG_ROUTE_IS_ACTIVE: boolean
  CANNED_RESPONSES_ROUTE_IS_ACTIVE: boolean
  DEPTS_ROUTE_IS_ACTIVE: boolean
  TRIGGER_ROUTE_IS_ACTIVE: boolean
  TEAMMATES_ROUTE_IS_ACTIVE: boolean
  GROUPS_ROUTE_IS_ACTIVE: boolean
  WIDGET_SETUP_ROUTE_IS_ACTIVE: boolean
  CHATBOT_ROUTE_IS_ACTIVE: boolean
  PROJECT_SETTINGS_ROUTE_IS_ACTIVE: boolean
  OPERATING_HOURS_ROUTE_IS_ACTIVE: boolean
  public_Key: string
  USER_ROLE: any
  CHAT_BASE_URL: string
  project: any
  route: string
  sidebar_settings_height: any
  IS_OPEN: boolean = true
  routing_and_depts_lbl: string;
  teammatates_and_groups_lbl: string;
  USER_HAS_TOGGLE_SIDEBAR: boolean 
  private unsubscribe$: Subject<any> = new Subject<any>();
  constructor(
    public appConfigService: AppConfigService,
    private logger: LoggerService,
    private auth: AuthService,
    public router: Router,
    public location: Location,
    private translate: TranslateService,
    private usersService: UsersService,
  ) { }

  ngOnInit() {
    this.getUserRole();
    this.getOSCODE();
    this.getChatUrl();
    this.getCurrentProject();
    this.getCurrentRoute();
    // this.getMainContentHeight();
    this.listenSidebarIsOpened();

  }

  ngAfterContentInit() {
    setTimeout(() => {
      this.getWindowWidthOnInit();
    }, 0);
  }

  getUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((userRole) => {
        //  console.log('[SETTINGS-SIDEBAR]] - SUBSCRIPTION TO USER ROLE »»» ', userRole)
        this.USER_ROLE = userRole;
      })
  }

  listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
      this.logger.log('[SETTINGS-SIDEBAR] SETTINGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN = isopened
    })
  }

  toggleSettingsSidebar(IS_OPEN) {
    this.logger.log('[SETTINGS-SIDEBAR] IS_OPEN >>>>>', IS_OPEN)
    // this.IS_OPEN = IS_OPENù
    this.USER_HAS_TOGGLE_SIDEBAR = true
    this.logger.log('[SETTINGS-SIDEBAR] toggleSettingsSidebar USER_HAS_TOGGLE_SIDEBAR >>>>>',  this.USER_HAS_TOGGLE_SIDEBAR)
    this.auth.toggleSettingsSidebar(IS_OPEN)
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const newInnerWidth = event.target.innerWidth;

    // console.log('SETTINGS-SIDEBAR] ON RESIZE WINDOW WIDTH ', newInnerWidth);

    if (newInnerWidth < 1200) {
      this.toggleSettingsSidebar(false)
    }
    if (newInnerWidth >= 1200) {
      this.toggleSettingsSidebar(true)

    }
  }


  getWindowWidthOnInit() {
    const onInitWindoeWidth = window.innerWidth;
    this.logger.log('SETTINGS-SIDEBAR] ON INIT WINDOW WIDTH >>>>>> ', onInitWindoeWidth);
    this.logger.log('SETTINGS-SIDEBAR] ON INIT USER_HAS_TOGGLE_SIDEBAR >>>>>> ',this.USER_HAS_TOGGLE_SIDEBAR);
    // if (this.USER_HAS_TOGGLE_SIDEBAR === false) {
      if (onInitWindoeWidth < 1200) {
        this.toggleSettingsSidebar(false)
      }
      if (onInitWindoeWidth >= 1200) {
        this.toggleSettingsSidebar(true)
      }
    // }
  }

  // @ Not used 
  getMainContentHeight() {
    const elemMainContent = <HTMLElement>document.querySelector('.main-content')
    const elemAppdashboardSettingsSidebar = <HTMLElement>(
      document.querySelector('appdashboard-settings-sidebar')
    )
    this.logger.log('[SETTINGS-SIDEBAR] elemMainContent ', elemMainContent)
    this.logger.log('[SETTINGS-SIDEBAR] elemAppdashboardSettingsSidebar ', elemAppdashboardSettingsSidebar)
    setTimeout(() => {
      this.logger.log('[SETTINGS-SIDEBAR] elemAppdashboardSettingsSidebar clientHeight', elemAppdashboardSettingsSidebar.clientHeight)
    }, 0)

    const main_content_height = elemMainContent.clientHeight
    this.logger.log('[SETTINGS-SIDEBAR] elemMainContent.clientHeight ', main_content_height)

    const _main_content_height = elemMainContent.offsetHeight
    this.logger.log('[SETTINGS-SIDEBAR]  elemMainContent.offsetHeight ', _main_content_height)

    let h = window.innerHeight
    this.logger.log('[SETTINGS-SIDEBAR] window.innerHeight ', h)
    // }, 500);
    //  const main_content_height = elemMainContent.clientHeight
    //  console.log('[SETTINGS-SIDEBAR] main_content_height ',main_content_height)
    this.sidebar_settings_height = main_content_height + 70 + 'px'
  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK
    this.logger.log(
      '[SETTINGS-SIDEBAR] AppConfigService getAppConfig public_Key',
      this.public_Key,
    )

    let keys = this.public_Key.split('-')
    this.logger.log('[SETTINGS-SIDEBAR] PUBLIC-KEY - public_Key keys', keys)

    keys.forEach((key) => {
      if (key.includes('ANA')) {
        let ana = key.split(':')

        if (ana[1] === 'F') {
          this.isVisibleANA = false;
        } else {
          this.isVisibleANA = true;
        }
      }

      if (key.includes('ACT')) {
        let act = key.split(':')
        if (act[1] === 'F') {
          this.isVisibleACT = false;
        } else {
          this.isVisibleACT = true;
        }
      }

      if (key.includes('TRI')) {
        let tri = key.split(':')
        if (tri[1] === 'F') {
          this.isVisibleTRI = false;
        } else {
          this.isVisibleTRI = true;
        }
      }

      if (key.includes('GRO')) {
        let gro = key.split(':')
        if (gro[1] === 'F') {
          this.isVisibleGRO = false;
          this.getTeammatesTraslantion()
        } else {
          this.isVisibleGRO = true;
          this.getTeammatesAndGroupTraslantion()
        }
      }

      if (key.includes('DEP')) {
        let dep = key.split(':')
        if (dep[1] === 'F') {
          this.isVisibleDEP = false;
          this.getRoutingTranslation();
        } else {
          this.isVisibleDEP = true;
          this.getDeptsAndRoutingTranslation();
        }
      }

      if (key.includes('OPH')) {
        let oph = key.split(':')
        if (oph[1] === 'F') {
          this.isVisibleOPH = false;
        } else {
          this.isVisibleOPH = true;
        }
      }

      if (key.includes('CAR')) {
        let car = key.split(':')
        if (car[1] === 'F') {
          this.isVisibleCAR = false;
        } else {
          this.isVisibleCAR = true;
        }
      }

      if (key.includes('LBS')) {
        let lbs = key.split(':')
        if (lbs[1] === 'F') {
          this.isVisibleLBS = false;
        } else {
          this.isVisibleLBS = true;
        }
      }

      if (key.includes('APP')) {
        let lbs = key.split(':')
        if (lbs[1] === 'F') {
          this.isVisibleAPP = false;
        } else {
          this.isVisibleAPP = true;
        }
      }
    })

    if (!this.public_Key.includes('CAR')) {
      this.isVisibleCAR = false
    }

    if (!this.public_Key.includes('LBS')) {
      this.isVisibleLBS = false
    }

    if (!this.public_Key.includes('APP')) {
      this.isVisibleAPP = false
    }
  }

  getRoutingTranslation() {
    this.translate.get('Routing')
      .subscribe((text: string) => {
        this.routing_and_depts_lbl = text;
      });
  }

  getDeptsAndRoutingTranslation() {
    this.translate.get('RoutingAndDepts')
      .subscribe((text: string) => {
        this.routing_and_depts_lbl = text;
      });
  }

  getTeammatesTraslantion() {
    this.translate.get('Teammates')
      .subscribe((text: string) => {
        this.teammatates_and_groups_lbl = text.replace(/\b\w/g, l => l.toUpperCase());
      });
  }

  getTeammatesAndGroupTraslantion() {
    this.translate.get('UsersAndGroups')
      .subscribe((text: string) => {

        this.teammatates_and_groups_lbl = text;
      });
  }

  getChatUrl() {
    this.CHAT_BASE_URL = this.appConfigService.getConfig().CHAT_BASE_URL
    // this.logger.log('[SIDEBAR] AppConfigService getAppConfig CHAT_BASE_URL', this.CHAT_BASE_URL);
  }

  getCurrentProject() {
    this.logger.log(
      '[SETTINGS-SIDEBAR] - CALLING GET CURRENT PROJECT  ',
      this.project,
    )
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      // this.logger.log('[SIDEBAR] project from AUTH service subscription  ', this.project)
    })
  }

  goToCannedResponses() {
    this.router.navigate(['project/' + this.project._id + '/cannedresponses'])
  }

  goToEmailTicketing() {
    this.router.navigate(['project/' + this.project._id + '/email'])
  }

  goToTags() {
    // routerLink="project/{{ project._id }}/labels"
    this.router.navigate(['project/' + this.project._id + '/labels'])
  }

  goToDepartments() {
    // routerLink="project/{{ project._id }}/departments"
    this.router.navigate(['project/' + this.project._id + '/departments'])
  }

  goToTrigger() {
    //   routerLink="project/{{ project._id }}/trigger
    this.router.navigate(['project/' + this.project._id + '/trigger'])
  }

  goToTeammates() {
    // routerLink="project/{{ project._id }}/users"
    this.router.navigate(['project/' + this.project._id + '/users'])
  }

  goToChatbot() {
    // routerLink="project/{{ project._id }}/bots
    this.router.navigate(['project/' + this.project._id + '/bots'])
  }

  goToWidgetSetUp() {
    // routerLink="project/{{ project._id }}/widget-set-up"
    this.router.navigate(['project/' + this.project._id + '/widget-set-up'])
  }

  goToOperatingHours() {
    // routerLink="project/{{ project._id }}/hours"
    this.router.navigate(['project/' + this.project._id + '/hours'])
  }

  goToProjectSettings() {
    // routerLink="project/{{ project._id }}/project-settings/general"
    this.router.navigate([
      'project/' + this.project._id + '/project-settings/general',
    ])
  }

  getCurrentRoute() {
    // this.router.events.filter((event: any) => event instanceof NavigationEnd)
    //   .subscribe(event => {
    // this.router.events.subscribe((val) => {
    // if (this.location.path() !== '') {
    // this.route = this.location.path();
    this.route = this.router.url
    // this.logger.log('[SETTINGS-SIDEBAR] route ', this.route);

    if (this.route.indexOf('/labels') !== -1) {
      this.TAG_ROUTE_IS_ACTIVE = true
      this.logger.log(
        '[SETTING-SIDEBAR] - TAG_ROUTE_IS_ACTIVE  ',
        this.TAG_ROUTE_IS_ACTIVE,
      )
    } else {
      this.TAG_ROUTE_IS_ACTIVE = false
      this.logger.log(
        '[SETTING-SIDEBAR] - TAG_ROUTE_IS_ACTIVE  ',
        this.TAG_ROUTE_IS_ACTIVE,
      )
    }

    if (this.route.indexOf('/cannedresponses') !== -1) {
      this.CANNED_RESPONSES_ROUTE_IS_ACTIVE = true
      this.logger.log(
        '[SETTING-SIDEBAR] - CANNED_RESPONSES_ROUTE_IS_ACTIVE  ',
        this.CANNED_RESPONSES_ROUTE_IS_ACTIVE,
      )
    } else {
      this.CANNED_RESPONSES_ROUTE_IS_ACTIVE = false
      this.logger.log(
        '[SETTING-SIDEBAR] - CANNED_RESPONSES_ROUTE_IS_ACTIVE  ',
        this.CANNED_RESPONSES_ROUTE_IS_ACTIVE,
      )
    }

    if (this.route.indexOf('/departments') !== -1) {
      this.DEPTS_ROUTE_IS_ACTIVE = true
      this.logger.log(
        '[SETTING-SIDEBAR] - DEPTS_ROUTE_IS_ACTIVE  ',
        this.DEPTS_ROUTE_IS_ACTIVE,
      )
    } else {
      this.DEPTS_ROUTE_IS_ACTIVE = false
      this.logger.log(
        '[SETTING-SIDEBAR] - DEPTS_ROUTE_IS_ACTIVE  ',
        this.DEPTS_ROUTE_IS_ACTIVE,
      )
    }

    if (this.route.indexOf('/trigger') !== -1) {
      this.TRIGGER_ROUTE_IS_ACTIVE = true
      this.logger.log(
        '[SETTING-SIDEBAR] - TRIGGER_ROUTE_IS_ACTIVE  ',
        this.TRIGGER_ROUTE_IS_ACTIVE,
      )
    } else {
      this.TRIGGER_ROUTE_IS_ACTIVE = false
      this.logger.log(
        '[SETTING-SIDEBAR] - TRIGGER_ROUTE_IS_ACTIVE  ',
        this.TRIGGER_ROUTE_IS_ACTIVE,
      )
    }

    if (this.route.indexOf('/users') !== -1) {
      this.TEAMMATES_ROUTE_IS_ACTIVE = true
      this.logger.log(
        '[SETTING-SIDEBAR] - TEAMMATES_ROUTE_IS_ACTIVE  ',
        this.TEAMMATES_ROUTE_IS_ACTIVE,
      )
    } else {
      this.TEAMMATES_ROUTE_IS_ACTIVE = false
      this.logger.log(
        '[SETTING-SIDEBAR] - TEAMMATES_ROUTE_IS_ACTIVE  ',
        this.TEAMMATES_ROUTE_IS_ACTIVE,
      )
    }

    if (this.route.indexOf('/groups') !== -1) {
      this.GROUPS_ROUTE_IS_ACTIVE = true
      this.logger.log(
        '[SETTING-SIDEBAR] - GROUPS_ROUTE_IS_ACTIVE  ',
        this.GROUPS_ROUTE_IS_ACTIVE,
      )
    } else {
      this.GROUPS_ROUTE_IS_ACTIVE = false
      this.logger.log(
        '[SETTING-SIDEBAR] - GROUPS_ROUTE_IS_ACTIVE  ',
        this.GROUPS_ROUTE_IS_ACTIVE,
      )
    }

    if (this.route.indexOf('/widget-set-up') !== -1) {
      this.WIDGET_SETUP_ROUTE_IS_ACTIVE = true
      this.logger.log(
        '[SETTING-SIDEBAR] - WIDGET_SETUP_ROUTE_IS_ACTIVE  ',
        this.WIDGET_SETUP_ROUTE_IS_ACTIVE,
      )
    } else {
      this.WIDGET_SETUP_ROUTE_IS_ACTIVE = false
      this.logger.log(
        '[SETTING-SIDEBAR] - WIDGET_SETUP_ROUTE_IS_ACTIVE  ',
        this.WIDGET_SETUP_ROUTE_IS_ACTIVE,
      )
    }

    if (this.route.indexOf('/bots') !== -1) {
      this.CHATBOT_ROUTE_IS_ACTIVE = true
      this.logger.log(
        '[SETTING-SIDEBAR] - CHATBOT_ROUTE_IS_ACTIVE  ',
        this.CHATBOT_ROUTE_IS_ACTIVE,
      )
    } else {
      this.CHATBOT_ROUTE_IS_ACTIVE = false
      this.logger.log(
        '[SETTING-SIDEBAR] - CHATBOT_ROUTE_IS_ACTIVE  ',
        this.CHATBOT_ROUTE_IS_ACTIVE,
      )
    }

    if (this.route.indexOf('/hours') !== -1) {
      this.OPERATING_HOURS_ROUTE_IS_ACTIVE = true
      this.logger.log(
        '[SETTING-SIDEBAR] - OPERATING_HOURS_ROUTE_IS_ACTIVE  ',
        this.OPERATING_HOURS_ROUTE_IS_ACTIVE,
      )
    } else {
      this.OPERATING_HOURS_ROUTE_IS_ACTIVE = false
      this.logger.log(
        '[SETTING-SIDEBAR] - OPERATING_HOURS_ROUTE_IS_ACTIVE  ',
        this.OPERATING_HOURS_ROUTE_IS_ACTIVE,
      )
    }

    if (this.route.indexOf('/project-settings/') !== -1) {
      this.PROJECT_SETTINGS_ROUTE_IS_ACTIVE = true
      this.logger.log(
        '[SETTING-SIDEBAR] - PROJECT_SETTINGS_ROUTE_IS_ACTIVE  ',
        this.PROJECT_SETTINGS_ROUTE_IS_ACTIVE,
      )
    } else {
      this.PROJECT_SETTINGS_ROUTE_IS_ACTIVE = false
      this.logger.log(
        '[SETTING-SIDEBAR] - PROJECT_SETTINGS_ROUTE_IS_ACTIVE  ',
        this.PROJECT_SETTINGS_ROUTE_IS_ACTIVE,
      )
    }
  }
}
