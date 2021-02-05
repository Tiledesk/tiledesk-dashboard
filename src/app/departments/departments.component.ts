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
import { avatarPlaceholder, getColorBck } from '../utils/util';
import { AppConfigService } from '../services/app-config.service';
import { ProjectPlanService } from '../services/project-plan.service';

@Component({
  selector: 'mongodb-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss'],
})

export class DepartmentsComponent implements OnInit {

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
  subscription_is_active: boolean;
  trialExpired: boolean;
  subscriptionInactiveOrTrialExpired: boolean;
  constructor(
    private mongodbDepartmentService: DepartmentService,
    private router: Router,
    private auth: AuthService,
    private groupsService: GroupService,
    private faqKbService: FaqKbService,
    public translate: TranslateService,
    private notify: NotifyService,
    private prjctPlanService: ProjectPlanService,
    public appConfigService: AppConfigService
  ) { }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    this.getOSCODE();
    this.getCurrentProject();

    // this.getDepartments();
    this.getDeptsByProjectId();
    this.translateNotificationMsgs();
    this.getProjectPlan();
    this.getBrowserLanguage();
  }


  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    console.log('AppConfigService getAppConfig (DEPTS) public_Key', this.public_Key);

    let keys = this.public_Key.split("-");
    // console.log('PUBLIC-KEY (SIDEBAR) - public_Key keys', keys)

    keys.forEach(key => {
      // console.log('DEPTS public_Key key', key)

      if (key.includes("DEP")) {
        // console.log('PUBLIC-KEY (SIDEBAR) - key', key);
        let dep = key.split(":");
        // console.log('PUBLIC-KEY (SIDEBAR) - dep key&value', dep);

        if (dep[1] === "F") {
          this.isVisibleDEP = false;
          // console.log('PUBLIC-KEY (SIDEBAR) - dep isVisible', this.isVisibleDEP);
        } else {
          this.isVisibleDEP = true;
          // console.log('PUBLIC-KEY (SIDEBAR) - dep isVisible', this.isVisibleDEP);
        }
      }
      // this.getDeptsByProjectId();
    });

    if (!this.public_Key.includes("DEP")) {
      console.log('PUBLIC-KEY (SIDEBAR) - key.includes("DEP")', this.public_Key.includes("DEP"));
      this.isVisibleDEP = false;
    }
  }

  getBrowserLanguage() {
    this.browser_lang = this.translate.getBrowserLang();
    console.log('Depts - browser_lang ', this.browser_lang)
    var userLang = navigator.language;
    console.log('Depts - browser_lang ', userLang)
  }

  translateNotificationMsgs() {
    this.translate.get('DeptsAddEditPage.NotificationMsgs')
      .subscribe((translation: any) => {
        // console.log('Depts - translateNotificationMsgs text', translation)
        this.deleteErrorMsg = translation.DeleteDeptError;
        this.deleteSuccessMsg = translation.DeleteDeptSuccess;
        this.updateSuccessMsg = translation.UpdateDeptSuccess;
        this.updateErrorMsg = translation.UpdateDeptError;
      });
  }


  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      // console.log('00 -> DEPTS COMP project ID from AUTH service subscription  ', this.project._id)
    });
  }



  // GO TO BOT-EDIT-ADD COMPONENT AND PASS THE BOT ID (RECEIVED FROM THE VIEW)
  goToEditAddPage_EDIT(dept_id: string, dept_default: boolean) {
    console.log('goToEditAddPage_EDIT DEPT ID ', dept_id);
    console.log('goToEditAddPage_EDIT DEPT DEFAULT ', dept_default);
    console.log('goToEditAddPage_EDIT DEPTS LENGHT ', this.departments.length);

    this.router.navigate(['project/' + this.project._id + '/department/edit', dept_id]);

    // if (dept_default === true && this.departments.length ===  1 ) {
    // this.router.navigate(['project/' + this.project._id + '/department/edit', dept_id]);
    // } else if (dept_default !== true && this.departments.length >  1) { 
    //   this.router.navigate(['project/' + this.project._id + '/department/edit', dept_id]);
    // }
  }


  /**
   * GETS ONLY THE DEPTs WITH THE CURRENT PROJECT ID
   * note: the project id is passed get and passed by mongodbDepartmentService */
  getDeptsByProjectId() {
    this.mongodbDepartmentService.getDeptsByProjectId().subscribe((departments: any) => {
      console.log('»»» »»» DEPTS PAGE - DEPTS (FILTERED FOR PROJECT ID)', departments);

      if (departments) {
        let count = 0;
        departments.forEach((dept: any) => {
          // console.log('»»» »»» DEPTS PAGE - DEPT)', dept);
          if (dept && dept.default === true) {
            console.log('»»» »»» DEPTS PAGE - DEFAULT DEPT ', dept);
            dept['display_name'] = "Default Routing"
          }

          /// DI QUESTO NN C'E NE SAREBBE BISOGNO
          if (!this.isVisibleDEP) {
            if (dept && dept.default === true) {
              console.log('»»» »»» DEPTS PAGE - this.isVisibleDEP ', this.isVisibleDEP, 'DEFAULT DEPT STATUS', dept.status);

              if (dept.status === 0) {
                this.updateDefaultDeptStatusIfIsZero(dept._id, 1)
              }

              const index = departments.indexOf(dept);
              console.log('»»» »»» DEPTS PAGE - this.isVisibleDEP ', this.isVisibleDEP, 'INDEX OF DEFAULT DEPT', index);

              this.departments.push(dept)
              console.log('»»» »»» DEPTS PAGE - this.isVisibleDEP ', this.isVisibleDEP, 'this.departments ', this.departments);
            }
          } else {

            this.departments = departments;
            console.log('»»» »»» DEPTS PAGE - this.isVisibleDEP ', this.isVisibleDEP, 'this.departments ', this.departments);
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
        console.log('»»» »»» DEPTS PAGE - COUNT_OF_VISIBLE_DEPT', this.COUNT_OF_VISIBLE_DEPT);
      }
    }, error => {
      this.showSpinner = false;
      console.log('DEPARTMENTS (FILTERED FOR PROJECT ID) - ERROR', error);
    }, () => {
      console.log('DEPARTMENTS (FILTERED FOR PROJECT ID) - COMPLETE')
      this.showSpinner = false;
    });
  }


  // da controllare sembra nn usato
  updateDefaultDeptStatusIfIsZero(dept_id, deptStatus) {
    this.mongodbDepartmentService.updateDeptStatus(dept_id, deptStatus)
      .subscribe((department: any) => {
        console.log('»»» »»» DEPTS PAGE - updateDefaultDeptStatusIfIsZero - UPDATED DEPT ', department)

      }, error => {
        // this.notify.showWidgetStyleUpdateNotification(this.updateErrorMsg, 4, 'report_problem');
        console.log('»»» »»» DEPTS PAGE - updateDefaultDeptStatusIfIsZero - ERROR', error);
      }, () => {
        // this.notify.showWidgetStyleUpdateNotification(this.updateSuccessMsg, 2, 'done');
        console.log('»»» »»» DEPTS PAGE - updateDefaultDeptStatusIfIsZero - COMPLETE')

      });
  }

  updateDeptStatus($event, dept_id) {
    console.log('»»» »»» DEPTS PAGE - ON CHANGE DEPT STATUS - event ', $event)
    const checkModel = $event.target.checked;
    console.log('»»» »»» DEPTS PAGE - ON CHANGE DEPT STATUS - DEPT ID ', dept_id, 'CHECHED ', checkModel)

    // let deptStatus = null;

    if (checkModel === true) {
      this.deptStatus = 1
    } else if (checkModel === false) {
      this.deptStatus = 0
    }

    this.mongodbDepartmentService.updateDeptStatus(dept_id, this.deptStatus)
      .subscribe((department: any) => {
        console.log('»»» »»» DEPTS PAGE - UPDATE DEPT STATUS - UPDATED DEPT ', department)

      }, error => {
        this.notify.showWidgetStyleUpdateNotification(this.updateErrorMsg, 4, 'report_problem');
        console.log('»»» »»» DEPTS PAGE - UPDATE DEPT STATUS - ERROR', error);
      }, () => {
        this.notify.showWidgetStyleUpdateNotification(this.updateSuccessMsg, 2, 'done');
        console.log('»»» »»» DEPTS PAGE - UPDATE DEPT STATUS - COMPLETE')
        this.getDeptsByProjectId();

        console.log('»»» »»» DEPTS PAGE - UPDATE DEPT STATUS - COMPLETE DEPTS - ', this.departments)

        

      });
  }


  getProjectPlan() {
    this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      console.log('»»» »»» DEPTS PAGE project Profile Data', projectProfileData)
      if (projectProfileData) {
        this.prjct_profile_type = projectProfileData.profile_type;
        console.log('»»» »»» DEPTS PAGE prjct_profile_type', this.prjct_profile_type)
        this.subscription_is_active = projectProfileData.subscription_is_active;
        console.log('»»» »»» DEPTS PAGE subscription_is_active', this.subscription_is_active)
        this.trialExpired = projectProfileData.trial_expired;
        console.log('»»» »»» DEPTS PAGE trialExpired', this.trialExpired)
       
        if ((this.prjct_profile_type === 'payment' && this.subscription_is_active === false ) || (this.prjct_profile_type === 'free' && this.trialExpired === true )) {
          this.subscriptionInactiveOrTrialExpired = true;
          console.log('»»» »»» DEPTS PAGE subscriptionInactiveOrTrialExpired', this.subscriptionInactiveOrTrialExpired)
        } else {
          this.subscriptionInactiveOrTrialExpired = false;
          console.log('»»» »»» DEPTS PAGE subscriptionInactiveOrTrialExpired', this.subscriptionInactiveOrTrialExpired)
        }

       
      }
    })
  }


  // GO TO  BOT-EDIT-ADD COMPONENT
  goToEditAddPage_CREATE() {
    if ((this.prjct_profile_type === 'payment' && this.subscription_is_active === false ) || (this.prjct_profile_type === 'free' && this.trialExpired === true )) {
      this.router.navigate(['project/' + this.project._id + '/departments-demo']);
    } else {
      this.router.navigate(['project/' + this.project._id + '/department/create']);
    }
  }

  /**
   * GET BOT BY ID  */
  getBotById(id_bot) {
    this.faqKbService.getMongDbFaqKbById(id_bot).subscribe((bot: any) => {
      if (bot) {
        console.log(' -- > BOT GET BY ID', bot);
        this.botName = bot.name;

        for (const dept of this.departments) {
          if (dept.id_bot === bot._id) {
            dept.hasDeptName = this.botName;
            dept.botHasBeenTrashed = bot.trashed
          }
        }
      }
    }, error => {
      console.log('-- > BOT GET BY ID - ERROR', error);

      const errorBody = JSON.parse(error._body)
      console.log('BOT GET BY ID - ERROR BODY', errorBody);
      if (errorBody.msg === 'Object not found.') {
        console.log('BOT GET BY ID - ERROR BODY MSG', errorBody.msg);
        console.log('BOT GET BY ID - ERROR url', error.url);
        const IdOfBotNotFound = error.url.split('/').pop();
        console.log('BOT GET BY ID - ERROR - ID OF BOT NOT FOUND ', IdOfBotNotFound);

      }
    }, () => {
      console.log('-- > BOT GET BY ID - COMPLETE')
    });
  }

  /**
   * GET GROUP BY ID  */
  getGroupById(id_group) {
    this.groupsService.getGroupById(id_group).subscribe((group: any) => {

      if (group) {
        console.log(' -- > GROUP GET BY ID', group);

        this.groupName = group.name
        this.groupIsTrashed = group.trashed
        console.log(' -- > GROUP NAME ', this.groupName, 'is TRASHED ', this.groupIsTrashed);
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
      console.log('-- > GROUP GET BY ID - ERROR', error);
    }, () => {
      console.log('-- > GROUP GET BY ID - COMPLETE')
    });
  }

  /**
   * !!! USED ONLY FOR TESTING THE CALLBACK RUNNED BY THE OLD WIDGET VERSION
   * THAT GET DEPTS FILTERED FOR STATUS === 1 and WITHOUT AUTHENTICATION
   * NOTE: the DSBRD CALL /departments/allstatus  WHILE the OLD WIDGET VERSION CALL /departments
   * GET DEPTS ALL DEPTS (READ)
   */
  // getDepartments() {
  //   this.mongodbDepartmentService.getMongDbDepartments().subscribe((departments: any) => {
  //     console.log('RETRIEVED DEPTS AS THE OLD WIDGET VERSION: ', departments);
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
  //   this.mongodbDepartmentService.getDepartmentsAsNewWidgetVersion().subscribe((departments: any) => {
  //     console.log('RETRIEVED DEPTS AS THE NEW WIDGET VERSION: ', departments);
  //     // this.departments = departments;
  //   });
  // }


  // getVisitorCounter() {
  //   this.mongodbDepartmentService.getVisitorCounter()
  //     .subscribe((visitorCounter: any) => {
  //       console.log('getVisitorCounter : ', visitorCounter);
  //       // this.departments = departments;
  //     }, (error) => {

  //       console.log('getVisitorCounter ERROR ', error);

  //     },
  //       () => {
  //         console.log('getVisitorCounter * COMPLETE *');
  //       });
  // }

  /**
   * ADD DEPARMENT
   * !! MOVED IN DEPARTMENT-EDIT-ADD COMPONENT
   */
  // createDepartment() {
  //   console.log('MONGO DB DEPT-NAME DIGIT BY USER ', this.dept_name);
  //   this.mongodbDepartmentService.addMongoDbDepartments(this.dept_name)
  //     .subscribe((department) => {
  //       console.log('POST DATA ', department);

  //       this.dept_name = '';

  //       // RE-RUN GET CONTACT TO UPDATE THE TABLE
  //       // this.getDepartments();
  //       this.ngOnInit();
  //     },
  //     (error) => {

  //       console.log('POST REQUEST ERROR ', error);

  //     },
  //     () => {
  //       console.log('POST REQUEST * COMPLETE *');
  //     });

  // }

  /**
   * MODAL DELETE DEPARTMENT
   * @param id
   * @param deptName
   */
  openDeleteModal(id: string, deptName: string) {

    console.log('ON MODAL DELETE OPEN -> DEPT ID ', id);

    this.DISPLAY_DATA_FOR_UPDATE_MODAL = false;

    this.displayDeleteModal = 'block';

    this.id_toDelete = id;
    this.deptName_toDelete = deptName;
  }

  /**
   * DELETE DEPARTMENT (WHEN THE 'CONFIRM' BUTTON IN MODAL IS CLICKED) */
  onCloseDeleteModalHandled() {
    this.displayDeleteModal = 'none';

    this.mongodbDepartmentService.deleteMongoDbDeparment(this.id_toDelete).subscribe((data) => {
      console.log('DELETE DATA ', data);


      this.getDeptsByProjectId();
      // this.ngOnInit();

    },
      (error) => {
        console.log('DELETE REQUEST ERROR ', error);
        this.notify.showWidgetStyleUpdateNotification(this.deleteErrorMsg, 4, 'report_problem');
      },
      () => {
        console.log('DELETE REQUEST * COMPLETE *');
        this.notify.showWidgetStyleUpdateNotification(this.deleteSuccessMsg, 2, 'done');

      });
  }

  /** !!! NO MORE USED
   * MODAL UPDATE DEPARTMENT
   * @param id
   * @param deptName
   * @param hasClickedUpdateModal
   */
  // openUpdateModal(id: string, deptName: string, hasClickedUpdateModal: boolean) {
  //   // display the modal windows (change the display value in the view)
  //   console.log('HAS CLICKED OPEN MODAL TO UPDATE USER DATA ', hasClickedUpdateModal);
  //   this.DISPLAY_DATA_FOR_UPDATE_MODAL = hasClickedUpdateModal;
  //   this.DISPLAY_DATA_FOR_DELETE_MODAL = false;

  //   if (hasClickedUpdateModal) {
  //     this.display = 'block';
  //   }

  //   console.log('ON MODAL OPEN -> CONTACT ID ', id);
  //   console.log('ON MODAL OPEN -> CONTACT FULL-NAME TO UPDATE', deptName);

  //   this.id_toUpdate = id;
  //   this.deptName_toUpdate = deptName;
  // }

  /**
   * UPDATE CONTACT (WHEN THE 'SAVE' BUTTON IN MODAL IS CLICKED)
   */
  // onCloseUpdateModalHandled() {
  //   // HIDE THE MODAL
  //   this.display = 'none';

  //   console.log('ON MODAL UPDATE CLOSE -> CONTACT ID ', this.id_toUpdate);
  //   console.log('ON MODAL UPDATE CLOSE -> CONTACT FULL-NAME UPDATED ', this.deptName_toUpdate);
  //   this.mongodbDepartmentService.updateMongoDbDepartment(this.id_toUpdate, this.deptName_toUpdate).subscribe((data) => {
  //     console.log('PUT DATA ', data);

  //     // RE-RUN GET CONTACT TO UPDATE THE TABLE
  //     // this.getDepartments();
  //     this.ngOnInit();
  //   },
  //     (error) => {

  //       console.log('PUT REQUEST ERROR ', error);

  //     },
  //     () => {
  //       console.log('PUT REQUEST * COMPLETE *');
  //     });

  // }

  // CLOSE MODAL WITHOUT SAVE THE UPDATES OR WITHOUT CONFIRM THE DELETION
  onCloseModal() {
    this.displayDeleteModal = 'none';
  }

}
