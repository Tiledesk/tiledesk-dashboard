import { Component, OnInit } from '@angular/core';
import { DepartmentService } from '../services/department.service';
import { Department } from '../models/department-model';
import { Router } from '@angular/router';

import { Project } from '../models/project-model';
import { AuthService } from '../core/auth.service';
import { GroupService } from '../services/group.service';
import { FaqKbService } from '../services/faq-kb.service';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from '../core/notify.service';
import { APP_SUMO_PLAN_NAME, avatarPlaceholder, getColorBck, PLAN_NAME } from '../utils/util';
import { AppConfigService } from '../services/app-config.service';
import { ProjectPlanService } from '../services/project-plan.service';
import { LoggerService } from '../services/logger/logger.service';
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component';

@Component({
  selector: 'departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss'],
})

export class DepartmentsComponent extends PricingBaseComponent implements OnInit {
  PLAN_NAME = PLAN_NAME;
  APP_SUMO_PLAN_NAME = APP_SUMO_PLAN_NAME
  // t_params: any;
  departments: Department[] = [];

  dept_name: string;

  // SWITCH DISPLAYED DATA IN THE MODAL DEPENDING ON WHETHER THE
  // USER CLICK ON DELETE BTN OR ON EDIT BUTTON
  DISPLAY_DATA_FOR_UPDATE_MODAL = false;
  DISPLAY_DATA_FOR_DELETE_MODAL = false;
  // set to none the property display of the modal
  displayDeleteModal = 'none';
  // DATA DISPLAYED IN THE 'DELETE' MODAL
  id_toDelete: string;
  deptName_toDelete: string;
  // DATA DISPLAYED IN THE 'UPDATE' MODAL
  id_toUpdate: string;
  deptName_toUpdate: string;
  project: Project;
  showSpinner = true;
  groupName: string;
  id_group: string;
  groupIsTrashed: string;
  botName: string;
  deptStatus: number;
  deleteErrorMsg: string;
  deleteSuccessMsg: string;
  updateSuccessMsg: string;
  updateErrorMsg: string;
  browser_lang: string;

  COUNT_OF_VISIBLE_DEPT: number;

  isVisibleDEP: boolean;
  public_Key: string;

  prjct_profile_type: string;
  // subscription_is_active: boolean;
  // trialExpired: boolean;
  profile_name: string;
  subscriptionInactiveOrTrialExpired: boolean;
  IS_OPEN_SETTINGS_SIDEBAR: boolean;
  isChromeVerGreaterThan100: boolean;
  appSumoProfile: string;
 
  appSumoProfilefeatureAvailableFromBPlan: string;
  constructor(
    private deptService: DepartmentService,
    private router: Router,
    private auth: AuthService,
    private groupsService: GroupService,
    private faqKbService: FaqKbService,
    public translate: TranslateService,
    public notify: NotifyService,
    public prjctPlanService: ProjectPlanService,
    public appConfigService: AppConfigService,
    private logger: LoggerService
  ) { 
    super(prjctPlanService, notify);
  }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    this.getOSCODE();
    this.getCurrentProject();

    // this.getDepartments();
    this.getDeptsByProjectId();
    this.translateNotificationMsgs();
    this.getProjectPlan();
    this.getBrowserLanguage();
    this.listenSidebarIsOpened();
    this.getBrowserVersion()
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => { 
     this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    //  console.log("[WS-REQUESTS-LIST] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
   }  

  listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
      this.logger.log('[DEPTS] SETTNGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    });
  }


  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[DEPTS] AppConfigService getAppConfig  public_Key', this.public_Key);

    let keys = this.public_Key.split("-");
    // this.logger.log('[DEPTS] PUBLIC-KEY - public_Key keys', keys)

    keys.forEach(key => {
      // this.logger.log('[DEPTS] public_Key key', key)

      if (key.includes("DEP")) {
        // this.logger.log('[DEPTS] PUBLIC-KEY - key', key);
        let dep = key.split(":");
        // this.logger.log('[DEPTS] PUBLIC-KEY - dep key&value', dep);

        if (dep[1] === "F") {
          this.isVisibleDEP = false;
          // this.logger.log('[DEPTS] PUBLIC-KEY - dep isVisible', this.isVisibleDEP);
        } else {
          this.isVisibleDEP = true;
          // this.logger.log('[DEPTS] PUBLIC-KEY - dep isVisible', this.isVisibleDEP);
        }
      }

    });

    if (!this.public_Key.includes("DEP")) {
      // this.logger.log('[DEPTS] PUBLIC-KEY - key.includes("DEP")', this.public_Key.includes("DEP"));
      this.isVisibleDEP = false;
    }
  }

  getBrowserLanguage() {
    this.browser_lang = this.translate.getBrowserLang();
    this.logger.log('[DEPTS]  - browser_lang ', this.browser_lang)
    var userLang = navigator.language;
    this.logger.log('[DEPTS]  - browser_lang ', userLang)
  }

  translateNotificationMsgs() {
    this.translate.get('DeptsAddEditPage.NotificationMsgs')
      .subscribe((translation: any) => {
        // this.logger.log('Depts - translateNotificationMsgs text', translation)
        this.deleteErrorMsg = translation.DeleteDeptError;
        this.deleteSuccessMsg = translation.DeleteDeptSuccess;
        this.updateSuccessMsg = translation.UpdateDeptSuccess;
        this.updateErrorMsg = translation.UpdateDeptError;
      });
  }


  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      // this.logger.log('00 -> DEPTS COMP project ID from AUTH service subscription  ', this.project._id)
    });
  }



  // GO TO BOT-EDIT-ADD COMPONENT AND PASS THE BOT ID (RECEIVED FROM THE VIEW)
  goToEditAddPage_EDIT(dept_id: string, dept_default: boolean) {
    this.logger.log('[DEPTS] - goToEditAddPage_EDIT DEPT ID ', dept_id);
    this.logger.log('[DEPTS] - goToEditAddPage_EDIT DEPT DEFAULT ', dept_default);
    this.logger.log('[DEPTS] - goToEditAddPage_EDIT DEPTS LENGHT ', this.departments.length);

    this.router.navigate(['project/' + this.project._id + '/department/edit', dept_id]);
  }


  /**
   * GETS ONLY THE DEPTs WITH THE CURRENT PROJECT ID
   * note: the project id is passed get and passed by deptService */
  getDeptsByProjectId() {
    this.deptService.getDeptsByProjectId().subscribe((departments: any) => {
      this.logger.log('[DEPTS] - GET DEPTS (FILTERED FOR PROJECT ID)', departments);

      if (departments) {
        let count = 0;
        departments.forEach((dept: any) => {
          // this.logger.log('»»» »»» DEPTS PAGE - DEPT)', dept);
          if (dept && dept.default === true) {
            this.logger.log('[DEPTS] - GET DEPTS - DEFAULT DEPT ', dept);
            dept['display_name'] = "Default Routing"
          }

          /// DI QUESTO NN C'E NE SAREBBE BISOGNO
          if (!this.isVisibleDEP) {
            if (dept && dept.default === true) {
              this.logger.log('[DEPTS]  - this.isVisibleDEP ', this.isVisibleDEP, 'DEFAULT DEPT STATUS', dept.status);

              if (dept.status === 0) {
                this.updateDefaultDeptStatusIfIsZero(dept._id, 1)
              }

              const index = departments.indexOf(dept);
              this.logger.log('[DEPTS] - this.isVisibleDEP ', this.isVisibleDEP, 'INDEX OF DEFAULT DEPT', index);

              this.departments.push(dept)
              this.logger.log('[DEPTS] - this.isVisibleDEP ', this.isVisibleDEP, 'this.departments ', this.departments);
            }
          } else {

            this.departments = departments;
            this.logger.log('[DEPTS] - this.isVisibleDEP ', this.isVisibleDEP, 'this.departments ', this.departments);
          }

          if (this.isVisibleDEP) {
            if (dept.default === false && dept.status === 1) {
              count = count + 1;
            }
          }
          // -------------------------------------------------------------------
          // Dept's avatar
          // -------------------------------------------------------------------
          let newInitials = '';
          let newFillColour = '';


          if (dept.name) {
            newInitials = avatarPlaceholder(dept.name);
            if (dept.default !== true) {
              newFillColour = getColorBck(dept.name);
            } else if (dept.default === true && departments.length === 1) {
              newFillColour = '#6264A7'
            } else if (dept.default === true && departments.length > 1) {
              newFillColour = 'rgba(98, 100, 167, 0.6) '
            }
          } else {

            newInitials = 'N/A.';
            newFillColour = '#eeeeee';
          }

          dept['dept_name_initial'] = newInitials;
          dept['dept_name_fillcolour'] = newFillColour;

          // -------------------------------------------------------------------
          // Dept's description
          // -------------------------------------------------------------------

          if (dept.description) {
            let stripHere = 20;
            dept['truncated_desc'] = dept.description.substring(0, stripHere) + '...';
          }

          if (dept.routing === 'assigned' || dept.routing === 'pooled') {

            if (dept.id_group !== null && dept.id_group !== undefined) {
              this.getGroupById(dept.id_group)
            }

            if (dept.id_bot !== null && dept.id_bot !== undefined) {
              this.getBotById(dept.id_bot);
            }
          }
        });

        this.COUNT_OF_VISIBLE_DEPT = count;
        this.logger.log('[DEPTS] - COUNT_OF_VISIBLE_DEPT', this.COUNT_OF_VISIBLE_DEPT);
      }
    }, error => {
      this.showSpinner = false;
      this.logger.error('[DEPTS] (FILTERED FOR PROJECT ID) - ERROR', error);
    }, () => {
      this.logger.log('[DEPTS] (FILTERED FOR PROJECT ID) - COMPLETE')
      this.showSpinner = false;
    });
  }


  updateDefaultDeptStatusIfIsZero(dept_id, deptStatus) {
    this.deptService.updateDeptStatus(dept_id, deptStatus)
      .subscribe((department: any) => {
        this.logger.log('[DEPTS] - updateDefaultDeptStatusIfIsZero - UPDATED DEPT ', department)

      }, error => {
     
        this.logger.error('[DEPTS] - updateDefaultDeptStatusIfIsZero - ERROR', error);
      }, () => {
      
        this.logger.log('[DEPTS] - updateDefaultDeptStatusIfIsZero - COMPLETE')

      });
  }

  updateDeptStatus($event, dept_id) {
    this.logger.log('[DEPTS] - ON CHANGE DEPT STATUS - event ', $event)
    const checkModel = $event.target.checked;
    this.logger.log('[DEPTS] - ON CHANGE DEPT STATUS - DEPT ID ', dept_id, 'CHECKED ', checkModel)

    // let deptStatus = null;

    if (checkModel === true) {
      this.deptStatus = 1
    } else if (checkModel === false) {
      this.deptStatus = 0
    }

    this.deptService.updateDeptStatus(dept_id, this.deptStatus)
      .subscribe((department: any) => {
        this.logger.log('[DEPTS] - UPDATE DEPT STATUS - UPDATED DEPT ', department)

      }, error => {
        this.notify.showWidgetStyleUpdateNotification(this.updateErrorMsg, 4, 'report_problem');
        this.logger.error('[DEPTS] - UPDATE DEPT STATUS - ERROR', error);
      }, () => {
        this.notify.showWidgetStyleUpdateNotification(this.updateSuccessMsg, 2, 'done');
        this.logger.log('[DEPTS] - UPDATE DEPT STATUS - COMPLETE')

        // ------------------------
        // GET  DEPTS BY PROJECT ID
        // ------------------------
        this.getDeptsByProjectId();

        this.logger.log('[DEPTS] - UPDATE DEPT STATUS - COMPLETE DEPTS - ', this.departments)
      });
  }


  // GO TO  BOT-EDIT-ADD COMPONENT
  goToEditAddPage_CREATE() {
    this.logger.log('DEPTS prjct_profile_type ', this.prjct_profile_type) 
    this.logger.log('DEPTS subscription_is_active ', this.subscription_is_active) 
    this.logger.log('DEPTS trial_expired ', this.trial_expired) 
    


    if ((this.prjct_profile_type === 'payment' && this.subscription_is_active === false) || (this.prjct_profile_type === 'free' && this.trial_expired === true)) {
      this.router.navigate(['project/' + this.project._id + '/departments-demo']);
    } else {
      this.router.navigate(['project/' + this.project._id + '/department/create']);
    }

    if (
      (this.profile_name === PLAN_NAME.A) ||
      (this.profile_name === PLAN_NAME.B && this.subscription_is_active === false) ||
      (this.profile_name === PLAN_NAME.C && this.subscription_is_active === false) ||
      (this.profile_name === 'free' && this.trial_expired === true) ||  
      (this.profile_name === PLAN_NAME.D) ||
      (this.profile_name === PLAN_NAME.E && this.subscription_is_active === false) ||
      (this.profile_name === PLAN_NAME.F && this.subscription_is_active === false) ||
      (this.profile_name === 'Sandbox' && this.trial_expired === true)
      ) {
        this.router.navigate(['project/' + this.project._id + '/departments-demo']);
      // console.log('[WIDGET-SET-UP] - featureIsAvailable IS NOT AVAIBLE ')
    } else if (
      (this.profile_name === PLAN_NAME.B && this.subscription_is_active === true) ||
      (this.profile_name === PLAN_NAME.C && this.subscription_is_active === true) ||
      (this.profile_name === 'free' && this.trial_expired === false) ||
      (this.profile_name === PLAN_NAME.D && this.subscription_is_active === true) ||
      (this.profile_name === PLAN_NAME.F && this.subscription_is_active === true) ||
      (this.profile_name === 'Sandbox' && this.trial_expired === false)
     
      ) {
        this.router.navigate(['project/' + this.project._id + '/department/create']);
        // console.log('[WIDGET-SET-UP] - featureIsAvailable IS AVAIBLE' )
      }
  }

  /**
   * GET BOT BY ID  */
  getBotById(id_bot) {
    this.faqKbService.getFaqKbById(id_bot).subscribe((bot: any) => {
      if (bot) {
        this.logger.log('[DEPTS] -- > BOT GET BY ID', bot);
        this.botName = bot.name;

        for (const dept of this.departments) {
          if (dept.id_bot === bot._id) {
            dept.hasDeptName = this.botName;
            dept.botHasBeenTrashed = bot.trashed
          }
        }
      }
    }, error => {
      this.logger.error('[DEPTS] -- > BOT GET BY ID - ERROR', error);

      const errorMsg = error['error']['msg'];
      this.logger.log('[DEPTS] - BOT GET BY ID - ERROR MSG', errorMsg);
      if (errorMsg === 'Object not found.') {
        this.logger.log('[DEPTS] -  BOT GET BY ID - ERROR BODY MSG', errorMsg);
        this.logger.log('[DEPTS] - BOT GET BY ID - ERROR url', error.url);
        const IdOfBotNotFound = error.url.split('/').pop();
        this.logger.log('[DEPTS] - BOT GET BY ID - ERROR - ID OF BOT NOT FOUND ', IdOfBotNotFound);

      }
    }, () => {
      this.logger.log('[DEPTS] -- > BOT GET BY ID - COMPLETE')
    });
  }

  /**
   * GET GROUP BY ID  */
  getGroupById(id_group) {
    this.groupsService.getGroupById(id_group).subscribe((group: any) => {

      if (group) {
        this.logger.log('[DEPTS] --> GROUP GET BY ID', group);

        this.groupName = group.name
        this.groupIsTrashed = group.trashed
        this.logger.log('[DEPTS] --> GROUP NAME ', this.groupName, 'is TRASHED ', this.groupIsTrashed);
        for (const dept of this.departments) {

          if (dept.id_group === group._id) {

            if (dept.routing === 'assigned' || dept.routing === 'pooled') {

              dept.hasGroupName = this.groupName

              if (group.trashed === true) {

                dept.groupHasBeenTrashed = true
              }
            }
          }
        }
      }
    }, error => {
      this.logger.error('[DEPTS] --> GROUP GET BY ID - ERROR', error);
    }, () => {
      this.logger.log('[DEPTS] --> GROUP GET BY ID - COMPLETE')
    });
  }

  /**
   * !!! USED ONLY FOR TESTING THE CALLBACK RUNNED BY THE OLD WIDGET VERSION
   * THAT GET DEPTS FILTERED FOR STATUS === 1 and WITHOUT AUTHENTICATION
   * NOTE: the DSBRD CALL /departments/allstatus  WHILE the OLD WIDGET VERSION CALL /departments
   * GET DEPTS ALL DEPTS (READ)
   */
  // getDepartments() {
  //   this.deptService.getDeptsAsOldWidget().subscribe((departments: any) => {
  //     this.logger.log('RETRIEVED DEPTS AS THE OLD WIDGET VERSION: ', departments);
  //     // this.departments = departments;
  //   });
  // }

  /**
  * !!! USED ONLY FOR TESTING THE CALLBACK RUNNED BY THE NEW WIDGET VERSION
  * THAT GET DEPTS FILTERED FOR STATUS === 1 and WITHOUT AUTHENTICATION
  * NOTE: the DSBRD CALL /departments/allstatus  WHILE the NEW WIDGET VERSION CALL /widget
  * GET DEPTS ALL DEPTS (READ)
  */
  // getDepartmentsAsNewWidgetVersion() {
  //   this.deptService.getDeptsAsNewWidget().subscribe((departments: any) => {
  //     this.logger.log('RETRIEVED DEPTS AS THE NEW WIDGET VERSION: ', departments);
  //     // this.departments = departments;
  //   });
  // }


  // getVisitorCounter() {
  //   this.deptService.getVisitorCounter()
  //     .subscribe((visitorCounter: any) => {
  //       this.logger.log('getVisitorCounter : ', visitorCounter);
  //       // this.departments = departments;
  //     }, (error) => {

  //       this.logger.log('getVisitorCounter ERROR ', error);

  //     },
  //       () => {
  //         this.logger.log('getVisitorCounter * COMPLETE *');
  //       });
  // }

  /**
   * ADD DEPARMENT
   * !! MOVED IN DEPARTMENT-EDIT-ADD COMPONENT
   */
  // createDepartment() {
  //   this.logger.log('MONGO DB DEPT-NAME DIGIT BY USER ', this.dept_name);
  //   this.deptService.addMongoDbDepartments(this.dept_name)
  //     .subscribe((department) => {
  //       this.logger.log('POST DATA ', department);

  //       this.dept_name = '';

  //       // RE-RUN GET CONTACT TO UPDATE THE TABLE
  //       // this.getDepartments();
  //       this.ngOnInit();
  //     },
  //     (error) => {

  //       this.logger.log('POST REQUEST ERROR ', error);

  //     },
  //     () => {
  //       this.logger.log('POST REQUEST * COMPLETE *');
  //     });

  // }

  /**
   * MODAL DELETE DEPARTMENT
   * @param id
   * @param deptName
   */
  openDeleteModal(id: string, deptName: string) {

    this.logger.log('[DEPTS] - ON MODAL DELETE OPEN -> DEPT ID ', id);

    this.DISPLAY_DATA_FOR_UPDATE_MODAL = false;

    this.displayDeleteModal = 'block';

    this.id_toDelete = id;
    this.deptName_toDelete = deptName;
  }

  /**
   * DELETE DEPARTMENT (WHEN THE 'CONFIRM' BUTTON IN MODAL IS CLICKED) */
  onCloseDeleteModalHandled() {
    this.displayDeleteModal = 'none';

    this.deptService.deleteDeparment(this.id_toDelete).subscribe((data) => {
      this.logger.log('[DEPTS] - DELETE DEPT RES ', data);

      this.getDeptsByProjectId();
  
    },(error) => {
        this.logger.error('[DEPTS] DELETE DEPT - ERROR ', error);
        this.notify.showWidgetStyleUpdateNotification(this.deleteErrorMsg, 4, 'report_problem');
      },() => {
        this.logger.log('[DEPTS] DELETE DEPT * COMPLETE *');
        this.notify.showWidgetStyleUpdateNotification(this.deleteSuccessMsg, 2, 'done');

      });
  }


  // CLOSE MODAL WITHOUT SAVE THE UPDATES OR WITHOUT CONFIRM THE DELETION
  onCloseModal() {
    this.displayDeleteModal = 'none';
  }

}
