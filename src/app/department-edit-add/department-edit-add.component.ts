// tslint:disable:max-line-length
import { Component, OnInit, Input, Output, AfterViewInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { DepartmentService } from '../services/department.service';
import { FaqKbService } from '../services/faq-kb.service';
import { Project } from '../models/project-model';
import { AuthService } from '../core/auth.service';
import { GroupService } from '../services/group.service';
import { Group } from '../models/group-model';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from '../core/notify.service';
import { slideInOutAnimation } from '../_animations/index';
import { UsersService } from '../services/users.service';
import { APP_SUMO_PLAN_NAME, PLAN_NAME, avatarPlaceholder, getColorBck, goToCDSVersion } from '../utils/util';
import { AppConfigService } from '../services/app-config.service';
import { ComponentCanDeactivate } from '../core/pending-changes.guard';
import { LoggerService } from '../services/logger/logger.service';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { FaqKb } from 'app/models/faq_kb-model';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component';
import { RoleService } from 'app/services/role.service';
declare const $: any;
const swal = require('sweetalert');
const Swal = require('sweetalert2')

@Component({
  selector: 'app-department-edit-add',
  templateUrl: './department-edit-add.component.html',
  styleUrls: ['./department-edit-add.component.scss'],
  // animations: [slideInOutAnimation],
  // tslint:disable-next-line:use-host-property-decorator
  // host: { '[@slideInOutAnimation]': '' }
})
// , ComponentCanDeactivate
export class DepartmentEditAddComponent extends PricingBaseComponent implements OnInit, AfterViewInit, ComponentCanDeactivate {
  private unsubscribe$: Subject<any> = new Subject<any>();

  @Input() ws_requestslist_deptIdSelected: string;
  @Input() display_dept_sidebar: boolean;

  @ViewChild("navbarbrand", { static: false }) navbarbrandRef: ElementRef;

  CREATE_VIEW = false;
  EDIT_VIEW = false;
  id_dept: string;
  dept_name: string; // not more used
  dept_description: string; // not more used

  deptName_toUpdate: string;
  dept_description_toUpdate: string;

  // !!! NOTE: IS CALLED BOT LIST BUT REALLY IS THE LIST OF FAQ-KB LIST
  botsList: any;
  selectedBotId: string;
  selectedChatbot: string;
  selectedGroupId: string;
  SHOW_GROUP_OPTION_FORM: boolean;
  ROUTING_SELECTED: string;

  botId: string;
  selectedValue: string;
  selectedBot: FaqKb
  selectedId: string;
  botIdEdit: string;
  dept_routing: string;
  project: Project;
  groupsList: Group[];
  GROUP_ID_NOT_EXIST: boolean;
  has_selected_bot: boolean
  BOT_NOT_SELECTED: boolean;
  SHOW_OPTION_FORM: boolean;
  has_selected_only_bot: boolean;
  bot_only: boolean;
  onlybot_disable_routing: boolean;
  createSuccessMsg: string;
  createErrorMsg: string;
  updateSuccessMsg: string;
  updateErrorMsg: string;
  showSpinner = false;
  projectUsers: any;
  projectUsersInGroup: any;

  dept_name_initial: string
  dept_name_fillcolour: string
  dept_created_at: string
  dept_ID: string;

  bot_type: string;
  storageBucket: string;
  UPLOAD_ENGINE_IS_FIREBASE: boolean

  baseUrl: string;
  group_name: string;
  bot_description: string;
  ROUTING_PAGE_MODE: boolean;
  IS_DEFAULT_DEPT: boolean;

  display_btn_read_all_descr: boolean;
  read_all: boolean

  OPEN_CREATE_GROUP_RIGHT_SIDEBAR = false;
  OPEN_CREATE_BOT_RIGHT_SIDEBAR = false;
  train_bot_sidebar_height: any;
  newInnerWidth: any;
  newInnerHeight: any;
  main_content_height: any
  new_group_created_id: string;
  SELECT_GROUP_CREATED_FROM_CREATE_GROUP_SIDEBAR = false

  HAS_COMPLETED_GET_GROUPS: boolean;
  NOT_HAS_EDITED: boolean = true;

  areYouSureMsg: string;
  youHaveUnsavedChangesMsg: string;
  cancelMsg: string;
  areTouSureYouWantToNavigateAwayFromThisPageWithoutSaving: string
  isChromeVerGreaterThan100: boolean;
  USER_ROLE: string;
  featureAvailableFromBPlan: string;
  featureAvailableFromEPlan: string;
  cancel: string;
  upgradePlan: string;
  isVisiblePAY: boolean;
  overridePay: boolean;
  public_Key: string;
  projectId: string;

  isVisibleGroups: boolean;
  loadingBot: boolean;
  // prjct_id: string
  // prjct_name: string
  // profile_name: string
  // projectPlanAgentsNo: number
  // prjct_profile_name: string
  // browserLang: string
  // prjct_profile_type: any;
  // subscription_is_active: any
  // subscription_end_date: any
  // seatsLimit: any;
  // trial_expired: any;
  // appSumoProfile: string
  agentCannotManageAdvancedOptions: string;
  learnMoreAboutDefaultRoles: string;
  onlyOwnerCanManageTheAccountPlanMsg: string;
  IS_OPEN_SETTINGS_SIDEBAR: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private deptService: DepartmentService,
    private faqKbService: FaqKbService,
    private auth: AuthService,
    private groupService: GroupService,
    public location: Location,
    public translate: TranslateService,
    public notify: NotifyService,
    private usersService: UsersService,
    public appConfigService: AppConfigService,
    private logger: LoggerService,
    public prjctPlanService: ProjectPlanService,
    private roleService: RoleService
  ) {
    super(prjctPlanService, notify);
  }


  // ------------------------------------------------------------------------------------------------------------------------------------------------------
  // @ canDeactivate 1st method  https://stackoverflow.com/questions/35922071/warn-user-of-unsaved-changes-before-leaving-page?rq=1
  // modified to display a custom modal (see here https://stackoverflow.com/questions/55013903/angular-candeactivate-guard-not-working-with-sweet-alert-js)
  // ------------------------------------------------------------------------------------------------------------------------------------------------------
  // @HostListener('window:beforeunload')

  @HostListener('window:beforeunload', ['$event'])
  onbeforeunload(event) {
    if (this.NOT_HAS_EDITED === false) {
      event.preventDefault();
      event.returnValue = false;
    }
  }
  canDeactivate(): Observable<boolean> | boolean {
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away

    if (this.NOT_HAS_EDITED === true) {
      return true;

    } else if (this.NOT_HAS_EDITED === false) {

      // areYouSureMsg
      // youHaveUnsavedChangesMsg
      // cancelMsg
      // this.cancelMsg,

      // return swal({
      //   // title: this.areYouSureMsg,
      //   text: this.areTouSureYouWantToNavigateAwayFromThisPageWithoutSaving,
      //   icon: "warning",
      //   buttons: true,
      //   // dangerMode: true,
      // }).then((willRemain) => {
      //     if (willRemain) {
      //       this.logger.log('[DEPT-EDIT-ADD] showExitFromComponentConfirmation willRemain pressed OK')

      //       return true;

      //     } else {
      //       this.logger.log('[DEPT-EDIT-ADD] showExitFromComponentConfirmation willRemain else')

      //       return false;

      //     }
      //   });

      return Swal.fire({
        title: this.areYouSureMsg,
        text: this.areTouSureYouWantToNavigateAwayFromThisPageWithoutSaving,
        icon: "warning",
        showCloseButton: false,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('YesImSure'),
        confirmButtonColor: "var(--blue-light)",
        focusConfirm: false,
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          this.logger.log('[DEPT-EDIT-ADD] showExitFromComponentConfirmation willRemain pressed OK')

          return true;

        } else {
          this.logger.log('[DEPT-EDIT-ADD] showExitFromComponentConfirmation willRemain else')

          return false;

        }
      });
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {

    this.newInnerWidth = event.target.innerWidth;
    this.logger.log('[DEPT-EDIT-ADD] - ON RESIZE -> WINDOW WITH ', this.newInnerWidth);


    this.newInnerHeight = event.target.innerHeight;
    this.logger.log('[DEPT-EDIT-ADD] - ON RESIZE -> WINDOW HEIGHT ', this.newInnerHeight);

    const elemMainContent = <HTMLElement>document.querySelector('.main-content');
    this.main_content_height = elemMainContent.clientHeight
    this.logger.log('[DEPT-EDIT-ADD] - ON RESIZE -> MAIN CONTENT HEIGHT', this.main_content_height);

    // determine the height of the modal when the width of the window is <= of 991px when the window is resized
    // RESOLVE THE BUG: @media screen and (max-width: 992px) THE HEIGHT OF THE  MODAL 'USERS LIST' IS NOT 100%
    // if (this.newInnerWidth <= 991) { // nk gli tolgo la condizione dato che il bug si verifica anche pima del @media < 992
    this.train_bot_sidebar_height = elemMainContent.clientHeight + 'px'
    // this.logger.log('%%% Ws-REQUESTS-Msgs - *** MODAL HEIGHT ***', this.users_list_modal_height);
    // }

    // ------------------------------
    // Right sidebar width on resize
    // ------------------------------
    // const rightSidebar = <HTMLElement>document.querySelector(`.right-card`);
    // this.rightSidebarWidth = rightSidebar.offsetWidth
  }

  ngOnInit() {
    // this.auth.checkRoleForCurrentProject();
    this.roleService.checkRoleForCurrentProject('dept-edit-add')
    this.getProfileImageStorage();
    this.listenSidebarIsOpened();


    this.logger.log('[DEPT-EDIT-ADD] selectedDeptId FROM @INPUT: ', this.ws_requestslist_deptIdSelected)
    this.logger.log('[DEPT-EDIT-ADD] display_dept_sidebar FROM @INPUT: ', this.display_dept_sidebar)

    // toDo: to call the department detail as a sidebar in the request list
    // if (this.display_dept_sidebar === true) {
    //   this.EDIT_VIEW = true;
    //   this.id_dept = this.ws_requestslist_deptIdSelected;
    //   this.getDeptById();
    // }



    /**
     * BASED ON THE URL PATH DETERMINE IF THE USER HAS SELECTED (IN DEPARTMENTS PAGE) 'CREATE' OR 'EDIT' OR  ROUTING
     */
    // if (this.router.url === '/create') {

    if (this.router.url.indexOf('/create') !== -1) {

      this.logger.log('[DEPT-EDIT-ADD] ++ DEPT DTLS HAS CLICKED CREATE ');
      this.CREATE_VIEW = true;
      // this.showSpinner = false;
      // this.SHOW_OPTION_FORM = true;
      // this.ROUTING_SELECTED = 'fixed';

      this.ROUTING_SELECTED = 'assigned';
      this.dept_routing = 'assigned';

      this.SHOW_OPTION_FORM = false; // to check if is used
      this.BOT_NOT_SELECTED = true;
      this.has_selected_bot = false;
      this.selectedBotId = null;

      this.logger.log('[DEPT-EDIT-ADD] ON INIT (IF HAS SELECT CREATE) SHOW OPTION FORM ', this.SHOW_OPTION_FORM, 'ROUTING SELECTED ', this.ROUTING_SELECTED);
      this.ROUTING_PAGE_MODE = false;

    } else if (this.router.url.indexOf('/edit') !== -1) {
      this.logger.log('[DEPT-EDIT-ADD] ++ DEPT DTLS - HAS CLICKED EDIT DEPT');
      this.EDIT_VIEW = true;
      this.showSpinner = true;
      this.SHOW_OPTION_FORM = false; // to check if is used
      this.ROUTING_PAGE_MODE = false;

      // *** GET DEPT ID FROM URL PARAMS AND THEN DEPT BY ID ***
      this.getParamsAndDeptById();


    } else if (this.router.url.indexOf('/routing') !== -1) {

      this.logger.log('[DEPT-EDIT-ADD] ++ DEPT DTLS HAS CLICKED ROUTING FROM SIDEBAR');
      this.EDIT_VIEW = true;
      this.SHOW_OPTION_FORM = false; // to check if is used
      this.showSpinner = true;

      this.ROUTING_PAGE_MODE = true;

      // *** GET DEPT ID FROM URL PARAMS AND THEN DEPT BY ID ***
      this.getParamsAndDeptById();
    }

    this.getCurrentProject();

    /**
     * ======================= GET FAQ-KB LIST =========================
     * THE FAQ-KB LIST COME BACK FROM THE CALLBACK
     * IS USED TO POPULATE THE DROP-DOWN LIST 'SELECT A BOT' OF CREATE VIEW AND OF IN THE EDIT VIEW)
     */
    this.getFaqKbByProjecId()

    this.getUsersAndGroup()
    // this.getProjectUsers();

    this.translateLabels()
    this.getBrowserVersion()
    this.getProjectPlan();
    this.getOSCODE();
  }


  listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
      this.logger.log('[DEPT-EDIT-ADD] SETTNGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    });
  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK
    this.logger.log('[DEPT-EDIT-ADD] getAppConfig - public_Key', this.public_Key)

    let keys = this.public_Key.split('-')
    keys.forEach((key) => {
      if (key.includes('GRO')) {
        // this.logger.log('[DEPT-EDIT-ADD] - PUBLIC-KEY (Users) - key', key);
        let gro = key.split(':')
        // this.logger.log('[DEPT-EDIT-ADD] - PUBLIC-KEY (Users) - gro key&value', gro);

        if (gro[1] === 'F') {
          this.isVisibleGroups = false
          // this.logger.log('[DEPT-EDIT-ADD] - PUBLIC-KEY (Users) - gro isVisibleGroups', this.isVisibleGroups);
        } else {
          this.isVisibleGroups = true
          // this.logger.log('[DEPT-EDIT-ADD] - PUBLIC-KEY (Users) - gro isVisibleGroups', this.isVisibleGroups);
        }
      }

      if (key.includes("PAY")) {

        let pay = key.split(":");

        if (pay[1] === "F") {
          this.isVisiblePAY = false;
        } else {
          this.isVisiblePAY = true;
        }
      }


      if (key.includes("OVP")) {
        let pay = key.split(":");

        if (pay[1] === "F") {
          this.overridePay = false;
        } else {
          this.overridePay = true;
        }
      }

    })

    if (!this.public_Key.includes("GRO")) {
      this.isVisibleGroups = false;
    }

    if (!this.public_Key.includes("PAY")) {
      this.isVisiblePAY = false;
    }

    if (!this.public_Key.includes("OVP")) {
      this.overridePay = false;
    }
    // if (this.isVisibleGroups === true) {
    //   this.getProjectPlan()
    // }
  }



  getUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((userRole) => {

        this.logger.log('[DEPT-EDIT-ADD] - SUBSCRIPTION TO USER ROLE »»» ', userRole)
        // used to display / hide 'WIDGET' and 'ANALITCS' in home.component.html
        this.USER_ROLE = userRole;
      })
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  this.logger.log("[WS-REQUESTS-LIST] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }

  // -------------------------------------------------------------------------------------
  // @ canDeactivate NOT_HAS_EDITED is to canDeactivate if is false is displayed the alert
  // -------------------------------------------------------------------------------------
  onChangeDeptName($event) {
    this.logger.log('[DEPT-EDIT-ADD] - onChangeDeptName ', $event);
    this.NOT_HAS_EDITED = false
  }


  onChangeDeptDescription($event) {
    this.logger.log('[DEPT-EDIT-ADD] - onChangeDeptDescription ', $event);
    this.NOT_HAS_EDITED = false
  }


  // -----------------------------------------------------------------------------
  // @ CREATE GROUP RIGHT SIDEBAR
  // -----------------------------------------------------------------------------
  checkPlanAndPresentModal() {

    if ((this.profile_name === PLAN_NAME.A) ||
      (this.profile_name === PLAN_NAME.B && this.subscription_is_active === false) ||
      (this.profile_name === PLAN_NAME.C && this.subscription_is_active === false) ||
      (this.profile_name === 'free' && this.trial_expired === true)) {
      if (!this.appSumoProfile) {

        // this.presentModalFeautureAvailableFromTier2Plan(this.featureAvailableFromBPlan)
        this.presentModalFeautureAvailableFromTier2Plan(this.featureAvailableFromEPlan)
        return false
      } else {
        this.presentModalAppSumoFeautureAvailableFromBPlan()
        return false
      }
    } else if ((this.profile_name === PLAN_NAME.D) ||
      (this.profile_name === PLAN_NAME.E && this.subscription_is_active === false) ||
      (this.profile_name === PLAN_NAME.EE && this.subscription_is_active === false) ||
      (this.profile_name === PLAN_NAME.F && this.subscription_is_active === false) ||
      (this.profile_name === 'Sandbox' && this.trial_expired === true)) {

      if (!this.appSumoProfile) {
        this.presentModalFeautureAvailableFromTier2Plan(this.featureAvailableFromEPlan)
        return false
      }
    }
  }

  presentModalFeautureAvailableFromTier2Plan(planName) {
    this.logger.log('[DEPT-EDIT-ADD] presentModalFeautureAvailableFromTier2Plan projectId', this.projectId)
    
      if (this.isVisiblePAY) {
        Swal.fire({
          // content: el,
          title: this.upgradePlan,
          text: planName,
          icon: "info",
          showCloseButton: false,
          showCancelButton: true,
          confirmButtonText: this.upgradePlan,
          cancelButtonText: this.cancel,
          confirmButtonColor: "var(--blue-light)",
          focusConfirm: true,
          reverseButtons: true,
          // buttons: {
          //   cancel: this.cancel,
          //   catch: {
          //     text: this.upgradePlan,
          //     value: "catch",
          //   },
          // },
          // dangerMode: false,
        }).then((result) => {
          if (result.isConfirmed) {
            if (this.isVisiblePAY) {
              this.logger.log('[DEPT-EDIT-ADD] HERE 1')
              if (this.USER_ROLE === 'owner') {
                this.logger.log('[DEPT-EDIT-ADD] HERE 2')
                if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
                  this.logger.log('[DEPT-EDIT-ADD] HERE 3')
                  this.notify._displayContactUsModal(true, 'upgrade_plan');
                } else if (this.prjct_profile_type === 'payment' && this.subscription_is_active === true && (this.profile_name === PLAN_NAME.A || this.profile_name === PLAN_NAME.D)) {
                  this.notify._displayContactUsModal(true, 'upgrade_plan');
                } else if (this.prjct_profile_type === 'free' && this.trial_expired === true) {
                  this.logger.log('[DEPT-EDIT-ADD] HERE 4')
                  this.router.navigate(['project/' + this.projectId + '/pricing']);
                }
              } else {
                this.logger.log('[DEPT-EDIT-ADD] HERE 5')
                this.presentModalAgentCannotManageAvancedSettings();
              }
             
            } else {
              this.logger.log('[DEPT-EDIT-ADD] HERE 6')
              this.notify._displayContactUsModal(true, 'upgrade_plan');
            }
          }
        });
      } else {
        this.notify._displayContactUsModal(true, 'upgrade_plan');
      }
    
  }

  presentModalAppSumoFeautureAvailableFromBPlan() {
    // const el = document.createElement('div')
    // el.innerHTML = 'Available from ' + this.appSumoProfilefeatureAvailableFromBPlan
    Swal.fire({
      // content: el,
      icon: "info",
      title: this.upgradePlan,
      text: 'Available from ' + this.appSumoProfilefeatureAvailableFromBPlan,
      showCloseButton: false,
      showCancelButton: true,
      confirmButtonText: this.upgradePlan,
      cancelButtonText: this.cancel,
      confirmButtonColor: "var(--blue-light)",
      focusConfirm: true,
      reverseButtons: true,

      // buttons: {
      //   cancel: this.cancel,
      //   catch: {
      //     text: this.upgradePlan,
      //     value: "catch",
      //   },
      // },
      // dangerMode: false,
    }).then((result) => {
      if (result.isConfirmed) {
        if (this.USER_ROLE === 'owner') {
          this.router.navigate(['project/' + this.projectId + '/project-settings/payments']);
        } else {
          // this.logger.log('[APP-STORE] HERE 5')
          // this.presentModalAgentCannotManageAvancedSettings();
          this.presentModalOnlyOwnerCanManageTheAccountPlan();
        }
      }
    });

  }

  presentModalOnlyOwnerCanManageTheAccountPlan() {
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyOwnerCanManageTheAccountPlanMsg, this.learnMoreAboutDefaultRoles)
  }

  presentModalAgentCannotManageAvancedSettings() {
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.agentCannotManageAdvancedOptions, this.learnMoreAboutDefaultRoles)
  }


  // OPEN * CREATE GROUP RIGHT SIDEBAR *
  openCreateGroupRightSideBar() {
    const isAvailable = this.checkPlanAndPresentModal()
    this.logger.log('[DEPT-EDIT-ADD] isAvaibleFromPlan ', isAvailable)
    if (isAvailable === false) {
      return
    }

    // SCOLL TO TOP WHEN THE USER CLICK 'CREATE A NEW GROUP'
    this.navbarbrandRef.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });

    this.OPEN_CREATE_GROUP_RIGHT_SIDEBAR = true
    this.logger.log('[DEPT-EDIT-ADD] - OPEN CREATE GROUP SIDEBAR ', this.OPEN_CREATE_GROUP_RIGHT_SIDEBAR);

    const elemMainContent = <HTMLElement>document.querySelector('.main-content');
    this.train_bot_sidebar_height = elemMainContent.clientHeight + 10 + 'px'
    this.logger.log('[DEPT-EDIT-ADD] - OPEN CREATE GROUP SIDEBAR -> RIGHT SIDEBAR HEIGHT', this.train_bot_sidebar_height);


  }

  // HALDLE OUTPUT 'CLOSE SIDEBAR' * CREATE GROUP RIGHT SIDEBAR *
  handleCloseCreateGroupSidebar(event) {
    this.OPEN_CREATE_GROUP_RIGHT_SIDEBAR = event;
    this.logger.log('[DEPT-EDIT-ADD] - CLOSE CREATE GROUP SIDEBAR ', this.OPEN_CREATE_GROUP_RIGHT_SIDEBAR);
  }

  // HALDLE OUTPUT 'GROUP CREATED' * CREATE GROUP RIGHT SIDEBAR *
  handleNewGroupCreatedFromSidebar(event) {
    this.logger.log('[DEPT-EDIT-ADD] - handleNewGroupCreatedFromSidebar ID GROUP ', event);
    if (event) {
      this.new_group_created_id = event
      this.SELECT_GROUP_CREATED_FROM_CREATE_GROUP_SIDEBAR = true

      this.NOT_HAS_EDITED = false;

      this.getGroupsByProjectId();
      // this.HAS_COMPLETED_GET_GROUPS = true
      // this.logger.log('DEPT EDIT-ADD - handleNewGroupCreatedFromSidebar tHAS_COMPLETED_GET_GROUPS  ', this.HAS_COMPLETED_GET_GROUPS );
    }
  }

  // -----------------------------------------------------------------------------
  // @ CREATE BOT RIGHT SIDEBAR --- IN SOSPESO
  // -----------------------------------------------------------------------------
  // OPEN * CREATE GROUP RIGHT SIDEBAR *
  openCreateBotRightSideBar() {

    // SCOLL TO TOP WHEN THE USER CLICK 'CREATE A NEW BOT'
    this.navbarbrandRef.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });

    this.OPEN_CREATE_BOT_RIGHT_SIDEBAR = true
    this.logger.log('[DEPT-EDIT-ADD] - OPEN CREATE BOT SIDEBAR ', this.OPEN_CREATE_BOT_RIGHT_SIDEBAR);

    const elemMainContent = <HTMLElement>document.querySelector('.main-content');
    this.train_bot_sidebar_height = elemMainContent.clientHeight + 10 + 'px'
    this.logger.log('[DEPT-EDIT-ADD]  - OPEN CREATE BOT SIDEBAR -> RIGHT SIDEBAR HEIGHT', this.train_bot_sidebar_height);

    const elemFooter = <HTMLElement>document.querySelector('footer');
    elemFooter.setAttribute('style', 'display:none;');
    // _elemMainPanel.setAttribute('style', 'overflow-x: unset !important;');
  }


  // HALDLE OUTPUT 'CLOSE SIDEBAR' * CREATE BOT RIGHT SIDEBAR *
  handleCloseCreateBotSidebar(event) {
    this.OPEN_CREATE_BOT_RIGHT_SIDEBAR = event;
    this.logger.log('[DEPT-EDIT-ADD]- CLOSE CREATE BOT SIDEBAR ', this.OPEN_CREATE_BOT_RIGHT_SIDEBAR);
    const elemFooter = <HTMLElement>document.querySelector('footer');
    elemFooter.setAttribute('style', '');
  }


  getParamsAndDeptById() {
    this.id_dept = this.route.snapshot.params['deptid'];
    this.logger.log('[DEPT-EDIT-ADD] - DEPATMENT COMPONENT HAS PASSED id_DEPT ', this.id_dept);
    if (this.id_dept) {
      this.getDeptById();

      // TEST CHAT21-API-NODEJS router.get('/:departmentid/operators'
      /* GET OPERATORS OF A DEPT */
      // this.getDeptByIdToTestChat21AssigneesFunction()
    }

  }

  ngAfterViewInit() {
  }

  getProfileImageStorage() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[DEPT-EDIT-ADD] IMAGE STORAGE ', this.storageBucket, 'usecase firebase')
    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.baseUrl = this.appConfigService.getConfig().baseImageUrl;
      this.logger.log('[DEPT-EDIT-ADD] IMAGE STORAGE ', this.baseUrl, 'usecase native')
    }
  }

  getUsersAndGroup() {
    this.getProjectUsers();
  }

  getProjectUsers() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      this.logger.log('[DEPT-EDIT-ADD] - GET PROJECT USERS - RES ', projectUsers)

      if (projectUsers) {
        this.projectUsers = projectUsers;

      }
    }, error => {
      this.logger.error('[DEPT-EDIT-ADD] - GET PROJECT USERS - ERROR', error);
    }, () => {
      this.logger.log('[DEPT-EDIT-ADD] - GET PROJECT USERS - COMPLETE');

      this.getGroupsByProjectId();
    });
  }


  translateLabels() {
    this.translate.get('DeptsAddEditPage.NotificationMsgs')
      .subscribe((translation: any) => {
        // this.logger.log('Depts Add Edit - translateNotificationMsgs text', translation)
        this.createSuccessMsg = translation.CreateDeptSuccess;
        this.createErrorMsg = translation.CreateDeptError;
        this.updateSuccessMsg = translation.UpdateDeptSuccess;
        this.updateErrorMsg = translation.UpdateDeptError;
      });

    this.translate.get('CanDeactivateModalText')
      .subscribe((translation: any) => {
        this.areYouSureMsg = translation.AreYouSure;
        this.youHaveUnsavedChangesMsg = translation.YouHaveUnsavedChanges;
        this.cancelMsg = translation.Cancel;
        this.areTouSureYouWantToNavigateAwayFromThisPageWithoutSaving = translation.AreTouSureYouWantToNavigateAwayFromThisPageWithoutSaving;

      });


    this.translate.get('AvailableFromThePlan', { plan_name: PLAN_NAME.B })
      .subscribe((translation: any) => {
        this.featureAvailableFromBPlan = translation;
      });

    this.translate.get('AvailableFromThePlans', { plan_name_1: PLAN_NAME.E, plan_name_2: PLAN_NAME.EE })
      .subscribe((translation: any) => {
        this.featureAvailableFromEPlan = translation;
      });


    this.translate.get('Cancel')
      .subscribe((text: string) => {
        this.cancel = text;
      });

    this.translate.get('Pricing.UpgradePlan')
      .subscribe((translation: any) => {
        this.upgradePlan = translation;
      });

    this.translate.get('UsersWiththeAgentroleCannotManageTheAdvancedOptionsOfTheProject')
      .subscribe((translation: any) => {
        this.agentCannotManageAdvancedOptions = translation;
      });

    this.translate.get('OnlyUsersWithTheOwnerRoleCanManageTheAccountPlan')
      .subscribe((translation: any) => {
        this.onlyOwnerCanManageTheAccountPlanMsg = translation;
      });

    this.translate.get('LearnMoreAboutDefaultRoles')
      .subscribe((translation: any) => {

        this.learnMoreAboutDefaultRoles = translation;
      });


  }

  // ============ NEW - SUBSTITUTES has_clicked_fixed ============
  has_clicked_bot(has_selected_bot: boolean) {
    this.logger.log('[DEPT-EDIT-ADD] HAS CLICKED BOT - SHOW DROPDOWN ', has_selected_bot);

    this.NOT_HAS_EDITED = false;

    if (has_selected_bot === false) {
      this.BOT_NOT_SELECTED = true;
      this.logger.log('[DEPT-EDIT-ADD] - HAS CLICKED BOT - BOT NOT SELECTED ', this.BOT_NOT_SELECTED);


      this.selectedBotId = null;
      this.logger.log('[DEPT-EDIT-ADD] - SELECTED BOT ID ', this.selectedBotId)

      // ONLY BOT AUEOMATIC DESELECTION IF has_selected_bot IS FALSE
      this.has_selected_only_bot = false
      this.onlybot_disable_routing = false;
      this.bot_only = false;
    }
  }


  toggleActivateBot($event) {
    this.logger.log('[DEPT-EDIT-ADD] toggleActivateBot event', $event);
  }

  has_clicked_only_bot(has_selected_only_bot) {
    this.logger.log('[DEPT-EDIT-ADD] - HAS CLICKED ONLY BOT ', has_selected_only_bot);
    if (has_selected_only_bot === true) {
      this.onlybot_disable_routing = true;
      this.bot_only = true;
    } else {
      this.onlybot_disable_routing = false;
      this.bot_only = false;
    }
  }

  // WHEN THE USER EDITS A DEPTS CAN SELECT A BOT TO CORRELATE AT THE DEPARTMENT
  // WHEN THE BTN 'EDIT DEPARTMENT' IS PRESSED THE VALUE OF THE ID OF THE SELECTED BOT IS MODIFIED IN THE DEPT'S FIELD id_bot
  // Note: is used also for the 'CREATE VIEW'
  setSelectedBot(id: any): void {
    this.selectedBotId = id;
    this.logger.log('[DEPT-EDIT-ADD] BOT ID SELECTED: ', this.selectedBotId);

    if (this.selectedBotId !== null) {
      this.NOT_HAS_EDITED = false
    }



    // IN THE CREATE VIEW IF IS NOT SELECTET ANY FAQ-KB (SUBSTITUTE BOT) THE BUTTON 'CREATE BOT' IS DISABLED
    if (this.selectedBotId !== 'BOT_NOT_SELECTED') {
      this.BOT_NOT_SELECTED = false;

      // Used to display bot info in right sidebar
      this.botId = this.selectedBotId
      this.getBotById()

    }
    if (this.selectedBotId === 'BOT_NOT_SELECTED') {
      this.BOT_NOT_SELECTED = true;
    }
  }


  _setSelectedBot() {
    // this.selectedChatbot
    // this.selectedBotId = id;
    // this.logger.log('[DEPT-EDIT-ADD] BOT ID SELECTED 2: ', this.selectedBotId);
    // this.logger.log('[DEPT-EDIT-ADD] BOT ID id: ', id);
    // this.logger.log('[DEPT-EDIT-ADD] BOT ID SELECTED 2 $event: ', event);
    this.logger.log('[DEPT-EDIT-ADD] BOT ID SELECTED 2 selectedId: ', this.selectedId);
    this.logger.log('[DEPT-EDIT-ADD] BOT ID SELECTED 2 selectedBotId: ', this.selectedBotId);



    if (this.selectedBotId !== null) {
      this.NOT_HAS_EDITED = false;
      this.logger.log('[DEPT-EDIT-ADD] NOT_HAS_EDITED ', this.NOT_HAS_EDITED)
    }



    // IN THE CREATE VIEW IF IS NOT SELECTET ANY FAQ-KB (SUBSTITUTE BOT) THE BUTTON 'CREATE BOT' IS DISABLED
    if (this.selectedBotId !== null) {
      this.BOT_NOT_SELECTED = false;

      // Used to display bot info in right sidebar
      this.botId = this.selectedBotId
      this.getBotById()

    }
    if (this.selectedBotId === null) {
      this.BOT_NOT_SELECTED = true;
    }
  }



  /**
   * ======================= GETS ALL GROUPS WITH THE CURRENT PROJECT-ID =======================
   * USED TO POPULATE THE DROP-DOWN LIST 'GROUPS' ASSOCIATED TO THE ASSIGNED ANF POOLED ROUTING
   */
  getGroupsByProjectId() {

    if (this.SELECT_GROUP_CREATED_FROM_CREATE_GROUP_SIDEBAR === true) {
      this.logger.log('[DEPT-EDIT-ADD] - GET GROUPS  SELECT_GROUP_CREATED_FROM_CREATE_GROUP_SIDEBAR', this.new_group_created_id);

      this.selectedGroupId = this.new_group_created_id;
    }
    // this.HAS_COMPLETED_GET_GROUPS = false
    this.groupService.getGroupsByProjectId().subscribe((groups: any) => {
      this.logger.log('[DEPT-EDIT-ADD] - GROUPS GET BY PROJECT ID', groups);

      if (groups) {
        this.groupsList = groups;

        this.logger.log('[DEPT-EDIT-ADD] - GROUP ID SELECTED', this.selectedGroupId);
        this.groupsList.forEach(group => {

          if (this.selectedGroupId) {
            if (group._id === this.selectedGroupId) {
              this.logger.log('[DEPT-EDIT-ADD] - GROUP ASSIGNED TO THIS DEPT', group);
              this.group_name = group.name
              this.projectUsersInGroup = [];

              group.members.forEach(member => {
                this.logger.log('[DEPT-EDIT-ADD] - MEMBER OF THE GROUP ASSIGNED TO THIS DEPT', member);

                this.projectUsers.forEach(projectuser => {
                  // this.logger.log('DEPT EDIT-ADD - PROJECT USER ', projectuser);
                  if (member === projectuser.id_user._id) {

                    this.projectUsersInGroup.push(projectuser.id_user)
                  }
                });

              });

              this.logger.log('[DEPT-EDIT-ADD] - PROJECT USERS IN GROUP ', this.projectUsersInGroup);
              // const filteredProjectUsers = group.members
            }
          } else {
            this.logger.log('[DEPT-EDIT-ADD] - NO GROUP ASSIGNED TO THIS DEPT - GROUP ID', this.selectedGroupId);
          }
        });


        // CHECK IN THE GROUPS LIST THE GROUP-ID RETURNED FROM THE DEPT OBJECT.
        // IF THE GROUP-ID DOES NOT EXIST MEANS THAT WAS DELETED
        if (this.selectedGroupId !== null && this.selectedGroupId !== undefined) {
          this.checkGroupId(this.selectedGroupId, this.groupsList)
        }
      }
    }, (error) => {
      this.logger.error('[DEPT-EDIT-ADD] - GET GROUPS - ERROR ', error);
      // this.HAS_COMPLETED_GET_GROUPS = false
      // this.showSpinner = false;
    },
      () => {
        this.logger.log('[DEPT-EDIT-ADD] - GET GROUPS * COMPLETE');
      });
  }

  checkGroupId(groupIdSelected, groups_list) {
    this.logger.log('[DEPT-EDIT-ADD] - CHECK FOR GROUP ID: groupIdSelected', this.selectedGroupId, 'groups_list ', groups_list);
    this.GROUP_ID_NOT_EXIST = true;

    for (let i = 0; i < groups_list.length; i++) {
      const group_id = groups_list[i]._id;
      if (group_id === groupIdSelected) {
        this.GROUP_ID_NOT_EXIST = false;
        break;
      }
    }
    this.logger.log('[DEPT-EDIT-ADD] - CHECK FOR GROUP ID - NOT EXIST?: ', this.GROUP_ID_NOT_EXIST)
    return this.GROUP_ID_NOT_EXIST;
  }

  setSelectedGroup(id: any): void {
    this.SELECT_GROUP_CREATED_FROM_CREATE_GROUP_SIDEBAR = false;

    this.NOT_HAS_EDITED = false

    this.selectedGroupId = id;
    this.logger.log('[DEPT-EDIT-ADD] - GROUP ID SELECTED: ', this.selectedGroupId);
    this.logger.log('[DEPT-EDIT-ADD] - GROUP_ID_NOT_EXIST: ', this.GROUP_ID_NOT_EXIST);

    // this.SELECT_GROUP_CREATED_FROM_CREATE_GROUP_SIDEBAR = false;

    // IF THE GROUP ASSIGNED TO THE DEPT HAS BEEN DELETED,
    // this.GROUP_ID_NOT_EXIST IS SET TO TRUE - IN THIS USE-CASE IS SHOWED THE SELECT OPTION
    // 'GROUP ERROR' AND the CLASS errorGroup OF THE HTML TAG select IS SET TO TRUE
    // - IF THE USER SELECT ANOTHER OPTION this.GROUP_ID_NOT_EXIST IS SET TO false
    if (this.selectedGroupId !== 'Group error') {
      this.GROUP_ID_NOT_EXIST = false

      this.getGroupsByProjectId()
      this.logger.log('[DEPT-EDIT-ADD] - setSelectedGroup this.selectedGroupId !== Group error');
    }

    // if (this.selectedGroupId !== 'ALL_USERS_SELECTED') {
    // }

    // SET TO null THE ID OF GROUP IF IS SELECTED 'ALL USER'
    if (this.selectedGroupId === 'ALL_USERS_SELECTED') {
      this.selectedGroupId = null;
    }
  }

  _setSelectedGroup() {
    this.logger.log('[DEPT-EDIT-ADD] - GROUP ID SELECTED: ', this.selectedGroupId);
    this.SELECT_GROUP_CREATED_FROM_CREATE_GROUP_SIDEBAR = false;

    this.NOT_HAS_EDITED = false
    this.getGroupsByProjectId()


    // this.logger.log('[DEPT-EDIT-ADD] - GROUP_ID_NOT_EXIST: ', this.GROUP_ID_NOT_EXIST);



    // // IF THE GROUP ASSIGNED TO THE DEPT HAS BEEN DELETED,
    // // this.GROUP_ID_NOT_EXIST IS SET TO TRUE - IN THIS USE-CASE IS SHOWED THE SELECT OPTION
    // // 'GROUP ERROR' AND the CLASS errorGroup OF THE HTML TAG select IS SET TO TRUE
    // // - IF THE USER SELECT ANOTHER OPTION this.GROUP_ID_NOT_EXIST IS SET TO false
    // if (this.selectedGroupId !== 'Group error') {
    //   this.GROUP_ID_NOT_EXIST = false

    //   this.getGroupsByProjectId()
    //   this.logger.log('[DEPT-EDIT-ADD] - setSelectedGroup this.selectedGroupId !== Group error');
    // }

    // // if (this.selectedGroupId !== 'ALL_USERS_SELECTED') {
    // // }

    // // SET TO null THE ID OF GROUP IF IS SELECTED 'ALL USER'
    // if (this.selectedGroupId === 'ALL_USERS_SELECTED') {
    //   this.selectedGroupId = null;
    // }
  }

  getCurrentProject() {
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {
        this.project = project
        this.projectId = project._id
        // this.logger.log('[DEPT-EDIT-ADD] project ID from AUTH service subscription  ', this.project._id)
      });
  }



  /**
   * GET THE FAQ-KB LIST FILTERING ALL THE FAQ-KB FOR THE CURRENT PROJECT ID
   * NOTE: THE CURRENT PROJECT ID IS OBTAINED IN THE FAQ-KB SERVICE
   * * USED IN THE OPTION ITEM FORM OF THE CREATE VIEW AND OF THE EDIT VIEW *
   */
  getFaqKbByProjecId() {
    this.loadingBot = true
    this.faqKbService.getFaqKbByProjectId().subscribe((faqkb: any) => {
      this.logger.log('[DEPT-EDIT-ADD] - GET BOTS (TO SHOW IN SELECTION FIELD) ', faqkb);

      faqkb.sort(function compare(a, b) {
        if (a['name'].toLowerCase() < b['name'].toLowerCase()) {
          return -1;
        }
        if (a['name'].toLowerCase() > b['name'].toLowerCase()) {
          return 1;
        }
        return 0;
      });

      this.botsList = faqkb;

    }, (error) => {
      this.loadingBot = false
      this.logger.error('[DEPT-EDIT-ADD] GET BOTS - ERROR ', error);
    }, () => {
      this.logger.log('[DEPT-EDIT-ADD] GET BOTS - COMPLETE ');
      this.loadingBot = false
    });

  }

  // GO BACK TO DEPARTMENTS COMPONENT
  goBackToDeptsList() {
    this.router.navigate(['project/' + this.project._id + '/departments']);
  }

  has_clicked_assigned(show_group_option_form: boolean, show_option_form: boolean, routing: string) {
    if (this.dept_routing !== 'assigned') {
      this.NOT_HAS_EDITED = false
    }

    this.SHOW_GROUP_OPTION_FORM = show_group_option_form;
    this.SHOW_OPTION_FORM = show_option_form;
    this.ROUTING_SELECTED = routing
    this.logger.log('[DEPT-EDIT-ADD] HAS CLICKED ASSIGNABLE - SHOW GROUP OPTION ', this.SHOW_GROUP_OPTION_FORM, ' SHOW BOT OPTION: ', this.SHOW_OPTION_FORM, ' ROUTING SELECTED ', this.ROUTING_SELECTED)

    // ONLY FOR THE EDIT VIEW (see above in ngOnInit the logic for the EDIT VIEW)
    this.dept_routing = 'assigned'
  }

  has_clicked_pooled(show_group_option_form: boolean, show_option_form: boolean, routing: string) {
    if (this.dept_routing !== 'pooled') {
      this.NOT_HAS_EDITED = false
    }
    this.SHOW_GROUP_OPTION_FORM = show_group_option_form;
    this.SHOW_OPTION_FORM = show_option_form;
    this.ROUTING_SELECTED = routing
    this.logger.log('[DEPT-EDIT-ADD] HAS CLICKED POOLED  - SHOW GROUP OPTION ', this.SHOW_GROUP_OPTION_FORM, ' SHOW BOT OPTION: ', this.SHOW_OPTION_FORM, ' ROUTING SELECTED ', this.ROUTING_SELECTED)

    // ONLY FOR THE EDIT VIEW (see above in ngOnInit the logic for the EDIT VIEW)
    this.dept_routing = 'pooled'

  }



  /** === FOR EDIT VIEW === **
   * **** GET DEPT (DETAILS) OBJECT BY ID AND (THEN) GET BOT OBJECT BY ID (GET BOT DETAILS) ***
   * THE ID USED TO RUN THIS getDeptById IS PASSED FROM THE DEPT LIST (DEPARTMENTS COMPONENT goToEditAddPage_EDIT))
   * FROM DEPT OBJECT IS USED:
   * THE DEPT NAME TO SHOW IN THE INPUT FIELD (OF THE EDIT VIEW)
   * THE DEPT ROUTING (PREVIOUSLY SELECTED): dept_routing is passed in the view [checked]="dept_routing === 'pooled'"
   * to determine the option selected
   * THE BOT ID (IT'S ACTUALLY THE FAQ-KB ID) TO RUN ANOTHER CALLBACK TO OBTAIN THE FAQ-KB OBJECT (SUBSTITUTE BOT) AND, FROM THIS,
   * THE FAQ-KB ID THAT IS USED TO OBTAIN (IN THE EDIT VIEW) THE FAQ-KB NAME AS OPTION PREVIOUSLY SELECTED
   * (WHEN THE USER HAS CREATED THE DEPT)  (see: selectedId === bot._id)
   */
  getDeptById() {
    this.deptService.getDeptById(this.id_dept).subscribe((dept: any) => {
      this.logger.log('[DEPT-EDIT-ADD] ++ > GET DEPT (DETAILS) BY ID - DEPT OBJECT: ', dept);
      if (dept) {
        this.IS_DEFAULT_DEPT = dept.default
        this.deptName_toUpdate = dept.name;
        this.dept_description_toUpdate = dept.description;
        this.botId = dept.id_bot;
        this.dept_routing = dept.routing;
        this.selectedGroupId = dept.id_group;
        this.dept_created_at = dept.createdAt;
        this.dept_ID = dept.id;
        this.bot_only = dept.bot_only

      }

      if (this.dept_routing === 'pooled') {
        this.SHOW_OPTION_FORM = false;
        this.dept_routing = 'pooled'
        this.BOT_NOT_SELECTED = true;

      } else if (this.dept_routing === 'assigned') {
        this.SHOW_OPTION_FORM = false;
        this.dept_routing = 'assigned'
        this.BOT_NOT_SELECTED = true;
      }

      if (this.bot_only === false || this.bot_only === undefined || this.bot_only === null) {
        this.has_selected_only_bot = false;
      } else {
        this.has_selected_only_bot = true;
        this.onlybot_disable_routing = true;
      }

      this.logger.log('[DEPT-EDIT-ADD] ++ DEPT DTLS - DEPT FULLNAME TO UPDATE: ', this.deptName_toUpdate);
      this.logger.log('[DEPT-EDIT-ADD] ++ DEPT DTLS - DEPT DESCRIPTION TO UPDATE: ', this.dept_description_toUpdate);
      this.logger.log('[DEPT-EDIT-ADD] ++ DEPT DTLS - BOT ID (IT IS ACTUALLY FAQ-KB ID) GET FROM DEPT OBJECT: ', this.botId);
      this.logger.log('[DEPT-EDIT-ADD] ++ DEPT DTLS - ONLY BOT: ', this.bot_only);
      this.logger.log('[DEPT-EDIT-ADD] ++ DEPT DTLS - DEPT ROUTING GET FROM DEPT OBJECT: ', this.dept_routing);
      this.logger.log('[DEPT-EDIT-ADD] ++ DEPT DTLS - GROUP ID GET FROM DEPT OBJECT: ', this.selectedGroupId);


      // -------------------------------------------------------------------
      // Dept's avatar
      // -------------------------------------------------------------------
      let newInitials = '';
      let newFillColour = '';

      if (dept.name) {
        newInitials = avatarPlaceholder(dept.name);
        newFillColour = getColorBck(dept.name)
      } else {

        newInitials = 'N/A';
        newFillColour = '#eeeeee';
      }

      this.dept_name_initial = newInitials;
      this.dept_name_fillcolour = newFillColour;
    }, (error) => {
      this.logger.error('[DEPT-EDIT-ADD] GET DEPT BY ID - ERROR ', error);
      this.showSpinner = false;
    }, () => {
      this.logger.log('[DEPT-EDIT-ADD] GET DEPT BY ID - COMPLETE ');

      this.showSpinner = false;

      if (this.botId === undefined) {
        this.selectedBotId = null;
        this.BOT_NOT_SELECTED = true;
        this.has_selected_bot = false;
        this.logger.log('[DEPT-EDIT-ADD] ++ DEPT DTLS getDeptById has_selected_bot ', this.has_selected_bot);
        this.logger.log('[DEPT-EDIT-ADD] ++ DEPT DTLS !!! BOT ID UNDEFINED ', this.botId, ', BOT NOT SELECTED: ', this.BOT_NOT_SELECTED);
        // this.showSpinner = false;
        // this.selectedValue = 'Selezione FAQ KB';

      } else if (this.botId == null) {

        this.selectedBotId = null;

        this.BOT_NOT_SELECTED = true;
        this.has_selected_bot = false;
        this.logger.log('[DEPT-EDIT-ADD] ++ DEPT DTLS getDeptById has_selected_bot ', this.has_selected_bot);
        this.logger.log('[DEPT-EDIT-ADD] ++ BOT ID NULL ', this.botId, ', BOT NOT SELECTED: ', this.BOT_NOT_SELECTED);
        // this.showSpinner = false;
      } else {
        // getBotById() IS RUNNED ONLY IF THE BOT-ID (returned in the DEPT OBJECT) 
        // IS NOT undefined AND IS NOT null

        // if the bot is defined it means that the user had selected the bot
        this.has_selected_bot = true
        this.BOT_NOT_SELECTED = false;

        this.getBotById();
        this.logger.log('[DEPT-EDIT-ADD] ++ BOT ID DEFINED ', this.botId);
      }
    });

  }

  /** === FOR EDIT VIEW === **
   * **** GET FAQ-KB BY ID (SUBSTITUTE BOT) ***
   * THE ID OF THE BOT (IT'S ACTUALLY IS THE ID OF THE FAQ-KB) IS GET FROM THE DEPT OBJECT (CALLBACK getDeptById)
   * FROM THE FAQ-KB OBJECT (SUBSTITUTE BOT) IS USED:
   * THE FAQ-KB ID (SUBSTITUTE BOT) THAT IS USED TO OBTAIN THE FAQ-KB NAME SHOWED AS OPTION SELECTED IN THE EDIT VIEW
   * (see: selectedId === bot._id)
   */
  getBotById() {
    this.faqKbService.getFaqKbById(this.botId).subscribe((faqkb: any) => {
      this.logger.log('[DEPT-EDIT-ADD] ++ GET BOT (DETAILS) BY ID ', faqkb);
      // this.selectedId = bot._id;

      if (faqkb) {
        this.selectedBot = faqkb
        this.selectedId = faqkb._id;
        this.selectedBotId = faqkb._id
        this.bot_type = faqkb.type;
        // USED ONLY FOR DEBUG
        // this.selectedValue = bot.fullname;

        this.selectedValue = faqkb.name;
        if (faqkb.description) {
          this.bot_description = faqkb.description

          // --------------------------------------------------------------------------------
          // add btn read all if bot description text line are more of 2
          // --------------------------------------------------------------------------------   
          const elemSidebarDescription = <HTMLElement>document.querySelector('.sidebar-description');
          this.logger.log('[DEPT-EDIT-ADD] - GET BOT BY ID - elem Sidebar Description', elemSidebarDescription)

          let lines = undefined;
          if (this.bot_description) {
            if (elemSidebarDescription) {
              setTimeout(() => {

                const divHeight = elemSidebarDescription.offsetHeight
                const lineHeight = parseInt(elemSidebarDescription.style.lineHeight);
                this.logger.log('[DEPT-EDIT-ADD] - GET BOT BY ID - elem Sidebar Description divHeight', divHeight);
                this.logger.log('[DEPT-EDIT-ADD] - GET BOT BY ID - elem Sidebar Description lineHeight', lineHeight)


                if (divHeight && lineHeight) {
                  lines = Math.round(divHeight / lineHeight);
                  this.logger.log('[DEPT-EDIT-ADD] - GET BOT BY ID - elem Sidebar Description lines', lines)
                }

                // const elemDescription = <HTMLElement>document.querySelector('.sidebar-description .description-icon-and-text .bot-description')
                // this.logger.log(' DEPT EDIT-ADD elem Sidebar Description elemDescription', elemDescription)
                const textInDescription = elemSidebarDescription.textContent.replace(/(<.*?>)|\s+/g, (m, $1) => $1 ? $1 : ' ')
                this.logger.log('[DEPT-EDIT-ADD] - GET BOT BY ID - elem Sidebar Description elemDescription text', textInDescription)
                const lastThree = textInDescription.substr(textInDescription.length - 3);
                this.logger.log('[DEPT-EDIT-ADD] - GET BOT BY ID - elem Sidebar Description elemDescription text lastThree', lastThree)

                if (lines && lines > 3) {
                  this.logger.log('[DEPT-EDIT-ADD] - GET BOT BY ID - elem Sidebar Description lines is > 3', lines)
                  // elemSidebarDescription.setAttribute('style', ' display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;');
                  elemSidebarDescription.classList.add("sidebar-description-cropped");
                  this.display_btn_read_all_descr = true;
                  this.read_all = true;
                } else {
                  this.display_btn_read_all_descr = false
                }
              }, 300);
            }
          }
        } else {
          this.bot_description = 'n/a'
        }
      }

      // this.faqKbUrlToUpdate = faqKb.url;
      this.logger.log('[DEPT-EDIT-ADD] GET BOT BY ID - BOT NAME  ', this.selectedValue);

    }, (error) => {
      this.logger.error('[DEPT-EDIT-ADD] - GET BOT BY ID - ERROR ', error);

    }, () => {
      this.logger.log('[DEPT-EDIT-ADD] - GET BOT BY ID  - COMPLETE ');

    });

  }

  toggleDescriptionReadAll() {
    const elemSidebarDescription = <HTMLElement>document.querySelector('.sidebar-description');
    this.logger.log('[DEPT-EDIT-ADD] elem Sidebar Description toggleDescriptionReadAll', elemSidebarDescription)
    if (elemSidebarDescription.classList) {
      elemSidebarDescription.classList.toggle("sidebar-description-cropped");

      const hasClassCropped = elemSidebarDescription.classList.contains("sidebar-description-cropped")
      this.logger.log('[DEPT-EDIT-ADD] elem Sidebar Description toggleDescriptionReadAll hasClassCropped', hasClassCropped)
      if (hasClassCropped === false) {
        this.read_all = false;
      } else {
        this.read_all = true;
      }

    } else {
      // For IE9
      var classes = elemSidebarDescription.className.split(" ");
      var i = classes.indexOf("sidebar-description-cropped");

      if (i >= 0)
        classes.splice(i, 1);
      else
        classes.push("sidebar-description-cropped");
      elemSidebarDescription.className = classes.join(" ");
    }
  }


  goToBotDetails() {
    let botType = ''
    if (this.bot_type === 'internal') {
      botType = 'native'
      if (this.USER_ROLE !== 'agent') {
        this.router.navigate(['project/' + this.project._id + '/bots/intents/', this.selectedId, botType]);
      }
    } else if (this.bot_type === 'tilebot') {
      botType = 'tilebot'
      if (this.USER_ROLE !== 'agent') {
        // this.router.navigate(['project/' + this.project._id + '/tilebot/intents/', this.selectedId, botType]);
        // this.router.navigate(['project/' + this.project._id + '/cds/', this.selectedId, 'intent', '0']);
        goToCDSVersion(this.router, this.selectedBot, this.project._id, this.appConfigService.getConfig().cdsBaseUrl)
      }
    } else if (this.bot_type === 'tiledesk-ai') {
      botType = 'tiledesk-ai'
      if (this.USER_ROLE !== 'agent') {
        // this.router.navigate(['project/' + this.project._id + '/tilebot/intents/', this.selectedId, botType]);
        // this.router.navigate(['project/' + this.project._id + '/cds/', this.selectedId, 'intent', '0']);
        goToCDSVersion(this.router, this.selectedBot, this.project._id, this.appConfigService.getConfig().cdsBaseUrl)
      }
    } else {
      botType = this.bot_type;
      if (this.USER_ROLE !== 'agent') {
        this.router.navigate(['project/' + this.project._id + '/bots', this.selectedId, botType]);
      }
    }


  }

  goToMemberProfile(memberid) {
    this.getProjectuserbyUseridAndGoToEditProjectuser(memberid)
  }

  goToEditGroup() {
    this.router.navigate(['project/' + this.project._id + '/group/edit/' + this.selectedGroupId]);
  }

  getProjectuserbyUseridAndGoToEditProjectuser(member_id: string) {

    this.usersService.getProjectUserByUserId(member_id).subscribe((projectUser: any) => {
      this.logger.log('[DEPT-EDIT-ADD] GET projectUser by USER-ID ', projectUser)
      if (projectUser) {
        this.logger.log('[DEPT-EDIT-ADD] - GET projectUser by USER-ID > projectUser id', projectUser[0]._id);

        this.router.navigate(['project/' + this.project._id + '/user/edit/' + projectUser[0]._id]);
      }
    }, (error) => {
      this.logger.error('[DEPT-EDIT-ADD] GET projectUser by USER-ID - ERROR ', error);
    }, () => {
      this.logger.log('[DEPT-EDIT-ADD]GET projectUser by USER-ID * COMPLETE *');
    });
  }

  /**
 * ADD DEPARMENT
 *       this.dept_name,
    this.dept_description,
 */
  createDepartment() {
    this.NOT_HAS_EDITED = true;
    this.logger.log('[DEPT-EDIT-ADD] createDepartment DEPT NAME  ', this.deptName_toUpdate);
    this.logger.log('[DEPT-EDIT-ADD] createDepartment DEPT DESCRIPTION DIGIT BY USER ', this.dept_description_toUpdate);
    this.logger.log('[DEPT-EDIT-ADD] createDepartment GROUP ID WHEN CREATE IS PRESSED ', this.selectedGroupId);
    this.logger.log('[DEPT-EDIT-ADD] ROUTING_SELECTED ', this.ROUTING_SELECTED);
    this.deptService.addDept(
      this.deptName_toUpdate,
      this.dept_description_toUpdate,
      this.selectedBotId,
      this.bot_only,
      this.selectedGroupId,
      this.ROUTING_SELECTED)
      .subscribe((department) => {
        this.logger.log('[DEPT-EDIT-ADD] - createDepartment - POST DATA DEPT', department);
      }, (error) => {
        this.logger.error('[DEPT-EDIT-ADD] createDepartment - ERROR ', error);
        this.notify.showWidgetStyleUpdateNotification(this.createErrorMsg, 4, 'report_problem');
      }, () => {
        this.notify.showWidgetStyleUpdateNotification(this.createSuccessMsg, 2, 'done');
        this.logger.log('[DEPT-EDIT-ADD] - createDepartment * COMPLETE *');
        this.router.navigate(['project/' + this.project._id + '/departments']);

      });
  }


  edit() {
    this.NOT_HAS_EDITED = true;
    // RESOLVE THE BUG: THE BUTTON UPDATE REMAIN FOCUSED AFTER PRESSED
    const updated_btn = <HTMLElement>document.querySelector('.update-dept-btn');
    updated_btn.blur();

    this.logger.log('[DEPT-EDIT-ADD] - EDIT - updated_btn ', updated_btn);
    this.logger.log('[DEPT-EDIT-ADD] - EDIT - ID WHEN EDIT IS PRESSED ', this.id_dept);
    this.logger.log('[DEPT-EDIT-ADD] - EDIT - FULL-NAME WHEN EDIT IS PRESSED ', this.deptName_toUpdate);
    this.logger.log('[DEPT-EDIT-ADD] - EDIT - DESCRIPTION WHEN EDIT IS PRESSED ', this.dept_description_toUpdate);
    this.logger.log('[DEPT-EDIT-ADD]- EDIT - BOT ID WHEN EDIT IS PRESSED IF USER HAS SELECT ANOTHER BOT', this.selectedBotId);
    this.logger.log('[DEPT-EDIT-ADD] - EDIT - BOT ID WHEN EDIT IS PRESSED IF USER ! DOES NOT SELECT A ANOTHER BOT', this.botId);
    this.logger.log('[DEPT-EDIT-ADD] - EDIT - DEPT_ROUTING WHEN EDIT IS PRESSED ', this.dept_routing);
    this.logger.log('[DEPT-EDIT-ADD] - EDIT - ROUTING_SELECTED WHEN EDIT IS PRESSED ', this.ROUTING_SELECTED);

    if (this.selectedBotId === undefined) {
      this.botIdEdit = this.botId
    } else {
      this.botIdEdit = this.selectedBotId
    }

    this.deptService.updateDept(this.id_dept,
      this.deptName_toUpdate,
      this.dept_description_toUpdate,
      this.botIdEdit,
      this.bot_only,
      this.selectedGroupId,
      this.dept_routing).subscribe((data) => {
        this.logger.log('[DEPT-EDIT-ADD] - EDIT DEPT - RES ', data);

      }, (error) => {
        this.logger.error('[DEPT-EDIT-ADD] - EDIT DEPT - ERROR ', error);
        this.notify.showWidgetStyleUpdateNotification(this.updateErrorMsg, 4, 'report_problem');

      }, () => {
        this.logger.log('[DEPT-EDIT-ADD] - EDIT * COMPLETE *');
        this.notify.showWidgetStyleUpdateNotification(this.updateSuccessMsg, 2, 'done');
      });

  }

  goTo_BotEditAddPage_CREATE() {
    // this.router.navigate(['project/' + this.project._id + '/bots/bot-select-type']);
    this.router.navigate(['project/' + this.project._id + '/bots/my-chatbots/all']);

  }

  // TEST CHAT21-API-NODEJS router.get('/:departmentid/operators'
  /* GET OPERATORS OF A DEPT */
  getDeptByIdToTestChat21AssigneesFunction() {
    this.deptService.testChat21AssignesFunction(this.id_dept).subscribe((dept: any) => {
      this.logger.log('[DEPT-EDIT-ADD] -- -- -- TEST func - RESULT: ', dept);
    }, (error) => {
      this.logger.error('[DEPT-EDIT-ADD] -- -- -- TEST func - ERROR ', error);
      // this.showSpinner = false;
    }, () => {
      this.logger.log('[DEPT-EDIT-ADD] -- -- -- TEST func * COMPLETE *');
    });
  }



}
