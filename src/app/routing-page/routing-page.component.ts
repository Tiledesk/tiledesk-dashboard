import { Component, OnInit, ViewChild } from '@angular/core';
import { DepartmentService } from '../services/mongodb-department.service';
import { Department } from '../models/department-model';
import { FaqKbService } from '../services/faq-kb.service';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Project } from '../models/project-model';
import { GroupService } from '../services/group.service';
import { Group } from '../models/group-model';
import { NotifyService } from '../core/notify.service';

@Component({
  selector: 'app-routing-page',
  templateUrl: './routing-page.component.html',
  styleUrls: ['./routing-page.component.scss']
})
export class RoutingPageComponent implements OnInit {

  default_dept: Department[];
  default_dept_name: string;
  dept_routing: string;
  botId: string;
  id_dept: string;

  // !!! NOTE: IS CALLED BOT LIST BUT REALLY IS THE LIST OF FAQ-KB LIST
  botsList: any;


  SHOW_OPTION_FORM: boolean;

  SHOW_GROUP_OPTION_FORM: boolean;
  ROUTING_SELECTED: string;
  selectedBotId: string;
  selectedGroupId: any;
  botIdEdit: string;
  selectedId: string;

  showSpinner: boolean

  displayInfoModal = 'none';
  SHOW_CIRCULAR_SPINNER = false;
  project: Project;
  groupsList: Group[];
  GROUP_ID_NOT_EXIST: boolean;

  // show_option_form: boolean;
  has_selected_bot: boolean
  BOT_NOT_SELECTED: boolean;
  bot_only: boolean;
  has_selected_only_bot: boolean;
  onlybot_disable_routing: boolean;
  
  constructor(
    private mongodbDepartmentService: DepartmentService,
    private faqKbService: FaqKbService,
    private router: Router,
    private auth: AuthService,
    private groupService: GroupService,
    private notify: NotifyService
  ) { }

  ngOnInit() {

    this.auth.checkRoleForCurrentProject();

    this.showSpinner = true;

    this.getDeptsByProjectId();

    this.getFaqKbByProjecId();

    this.getCurrentProject();

    this.getGroupsByProjectId();
    // tslint:disable-next-line:quotemark

  }

  /**
   * ======================= GETS ALL GROUPS WITH THE CURRENT PROJECT-ID =======================
   * USED TO POPULATE THE DROP-DOWN LIST 'GROUPS' ASSOCIATED TO THE ASSIGNED ANF POOLED ROUTING
   */
  getGroupsByProjectId() {
    this.groupService.getGroupsByProjectId().subscribe((groups: any) => {
      console.log('GROUPS GET BY PROJECT ID', groups);

      if (groups) {
        this.groupsList = groups;

        console.log('for DEBUG GROUP ID SELECTED', this.selectedGroupId);
        // CHECK IN THE GROUPS LIST THE GROUP-ID RETURNED FROM THE DEPT OBJECT.
        // IF THE GROUP-ID DOES NOT EXIST MEANS THAT WAS DELETED
        if (this.selectedGroupId !== null && this.selectedGroupId !== undefined) {
          this.checkGroupId(this.selectedGroupId, this.groupsList)
        }
      }
      // this.showSpinner = false;
    },
      (error) => {
        console.log('GET GROUPS - ERROR ', error);
        // this.showSpinner = false;
      },
      () => {
        console.log('GET GROUPS * COMPLETE');
      });
  }

  checkGroupId(groupIdSelected, groups_list) {
    this.GROUP_ID_NOT_EXIST = true;

    for (let i = 0; i < groups_list.length; i++) {
      const group_id = groups_list[i]._id;
      if (group_id === groupIdSelected) {
        this.GROUP_ID_NOT_EXIST = false;
        break;
      }
    }
    console.log('CHECK FOR GROUP ID - NOT EXIST?: ', this.GROUP_ID_NOT_EXIST)
    return this.GROUP_ID_NOT_EXIST;
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      // console.log('00 -> DEPT EDIT/ADD COMP project ID from AUTH service subscription  ', this.project._id)
    });
  }

  getDeptsByProjectId() {
    this.mongodbDepartmentService.getDeptsByProjectId().subscribe((departments: any) => {
      console.log('ROUTING PAGE - DEPTS (FILTERED FOR PROJECT ID)', departments);

      if (departments) {
        departments.forEach(dept => {
          if (dept.default === true) {
            this.default_dept = dept
            console.log('++ ROUTING PAGE - DEFAULT DEPT (FILTERED FOR PROJECT ID)', this.default_dept);

            this.default_dept_name = dept.name;
            this.dept_routing = dept.routing

            this.botId = dept.id_bot;

            this.id_dept = dept._id;

            this.selectedGroupId = dept.id_group;
            this.bot_only = dept.bot_only
            if (this.bot_only === false || this.bot_only === undefined || this.bot_only === null) {
              this.has_selected_only_bot = false;
            } else {
              this.has_selected_only_bot = true;
              this.onlybot_disable_routing = true;
            }

            console.log('++ ROUTING PAGE - DEPT - BOT ID: ', this.botId);
            console.log('++ ROUTING PAGE - DEPT - ONLY BOT: ', this.bot_only);
            console.log('++ ROUTING PAGE - DEPT - GROUP ID: ', this.selectedGroupId);
            console.log('++ ROUTING PAGE - DEPT - ROUTING: ', this.dept_routing);
          }
        })
      }
      this.showSpinner = false;
      // this.departments = departments;
    },
      error => {
        this.showSpinner = false;
        console.log('ROUTING PAGE - DEPTS (FILTERED FOR PROJECT ID) - ERROR', error);
      },
      () => {
        console.log('ROUTING PAGE - DEPTS (FILTERED FOR PROJECT ID) - COMPLETE')

        if (this.botId === undefined) {

          this.showSpinner = false;

          this.selectedBotId = null;

          this.BOT_NOT_SELECTED = true;
          this.has_selected_bot = false;
          console.log(' !!! BOT ID UNDEFINED ', this.botId, ', BOT NOT SELECTED: ', this.BOT_NOT_SELECTED);

        } else if (this.botId == null) {

          this.showSpinner = false;

          this.selectedBotId = null;

          this.BOT_NOT_SELECTED = true;
          this.has_selected_bot = false;
          console.log(' !!! BOT ID NULL ', this.botId, ', BOT NOT SELECTED: ', this.BOT_NOT_SELECTED);

        } else {
          // getBotById() IS RUNNED ONLY IF THE BOT-ID (returned in the DEPT OBJECT) IS NOT undefined and IS NOT null
          this.getBotById();
          // this.SHOW_OPTION_FORM = false;
          // this.show_option_form = true;

          // if the bot is defined it means that the user had selected the bot
          this.has_selected_bot = true
          console.log('BOT ID DEFINED ', this.botId);
        }
        this.getDeptByIdToTestChat21AssigneesFunction();
      });

  }

  // TEST CHAT21-API-NODEJS router.get('/:departmentid/operators'
  /* GET OPERATORS OF A DEPT */
  getDeptByIdToTestChat21AssigneesFunction() {
    this.mongodbDepartmentService.testChat21AssignesFunction(this.id_dept).subscribe((dept: any) => {
      console.log('-- -- -- TEST func - RESULT: ', dept);
    },
      (error) => {
        console.log('-- -- -- TEST func - ERROR ', error);
        // this.showSpinner = false;
      },
      () => {
        console.log('-- -- --TEST func * COMPLETE *');
      });
  }

  /*
     ====== GET FAQ-KB BY ID (SUBSTITUTE BOT) ======
   * THE ID OF THE BOT (IT'S ACTUALLY IS THE ID OF THE FAQ-KB) IS GET FROM THE DEPT OBJECT (CALLBACK getDeptById)
   * FROM THE FAQ-KB OBJECT (SUBSTITUTE BOT) IS USED:
   * THE FAQ-KB ID (SUBSTITUTES BOT) THAT IS USED TO OBTAIN THE FAQ-KB NAME SHOWED AS OPTION SELECTED IN THE EDIT VIEW
   * (see: selectedId === bot._id)
   */
  getBotById() {
    // this.botService.getMongDbBotById(this.botId).subscribe((bot: any) => { // NO MORE USED
    this.faqKbService.getMongDbFaqKbById(this.botId).subscribe((faqkb: any) => {
      console.log('ROUTING PAGE - GET FAQ-KB (DETAILS) BY ID (SUBSTITUTES BOT) ', faqkb);

      this.selectedId = faqkb._id;
    },
      (error) => {
        console.log('ROUTING PAGE - GET FAQ-KB BY ID (SUBSTITUTES BOT) - ERROR ', error);
        this.showSpinner = false;
      },
      () => {
        console.log('ROUTING PAGE - GET FAQ-KB ID (SUBSTITUTES BOT) - COMPLETE ');
        this.showSpinner = false;

      });

  }

  getFaqKbByProjecId() {
    this.faqKbService.getFaqKbByProjectId().subscribe((faqkb: any) => {
      console.log('ROUTING PAGE - GET FAQ-KB LIST - SUBSTITUTE BOT (TO SHOW IN SELECTION FIELD) ', faqkb);
      this.botsList = faqkb;
    },
      (error) => {
        console.log('ROUTING PAGE - GET FAQ-KB LIST - SUBSTITUTE BOT - ERROR ', error);
      },
      () => {
        console.log('ROUTING PAGE - GET FAQ-KB LIST - SUBSTITUTE BOT - COMPLETE ');
      });

  }

  setSelectedBot(id: any): void {
    this.selectedBotId = id;
    console.log('FAQ-KB ID SELECTED (SUBSTITUTE BOT): ', this.selectedBotId);

    // IF IS NOT SELECTET ANY FAQ-KB (SUBSTITUTE BOT) THE BUTTON 'CREATE BOT' IS DISABLED
    if (this.selectedBotId !== 'BOT_NOT_SELECTED') {
      this.BOT_NOT_SELECTED = false;
    }
    if (this.selectedBotId === 'BOT_NOT_SELECTED') {
      this.BOT_NOT_SELECTED = true;
    }
  }

  // ============ NEW - SUBSTITUTES has_clicked_fixed ============
  has_clicked_bot(has_selected_bot: boolean) {

    console.log('HAS CLICKED BOT - SHOW DROPDOWN ', has_selected_bot);
    if (has_selected_bot === false) {
      this.BOT_NOT_SELECTED = true;
      console.log('HAS CLICKED BOT - BOT NOT SELECTED ', this.BOT_NOT_SELECTED);


      this.selectedBotId = null;
      console.log('SELECTED BOT ID ', this.selectedBotId)

      // ONLY BOT AUEOMATIC DESELECTION IF has_selected_bot IS FALSE
      this.has_selected_only_bot = false
      this.onlybot_disable_routing = false;
      this.bot_only = false;
    }
  }

  has_clicked_only_bot(has_selected_only_bot) {
    console.log('HAS CLICKED ONLY BOT ', has_selected_only_bot);
    if (has_selected_only_bot === true) {
      this.onlybot_disable_routing = true;
      this.bot_only = true;
    } else {
      this.onlybot_disable_routing = false;
      this.bot_only = false;
    }

  }


  setSelectedGroup(id: any): void {
    this.selectedGroupId = id;
    console.log('GROUP ID SELECTED: ', this.selectedGroupId);

    // IF THE GROUP ASSIGNED TO THE DEFAULT DEPT HAS BEEN DELETED,
    // this.GROUP_ID_NOT_EXIST IS SET TO TRUE - IN THIS USE-CASE IS SHOWED THE SELECT OPTION
    // 'GROUP ERROR' AND the CLASS errorGroup OF THE HTML TAG select IS SET TO TRUE
    // - IF THE USER SELECT ANOTHER OPTION this.GROUP_ID_NOT_EXIST IS SET TO false
    if (this.selectedGroupId !== 'Group error') {
      this.GROUP_ID_NOT_EXIST = false
    }

    // if (this.selectedGroupId !== 'ALL_USERS_SELECTED') {
    // }

    // SET TO null THE ID OF GROUP IF IS SELECTED 'ALL USER'
    if (this.selectedGroupId === 'ALL_USERS_SELECTED') {

      this.selectedGroupId = null;
    }
  }

  has_clicked_assigned(show_group_option_form: boolean, show_option_form: boolean, routing: string) {

    this.SHOW_GROUP_OPTION_FORM = show_group_option_form;
    this.SHOW_OPTION_FORM = show_option_form;
    this.ROUTING_SELECTED = routing
    // tslint:disable-next-line:max-line-length
    console.log('HAS CLICKED ASSIGNABLE - SHOW GROUP OPTION: ', this.SHOW_GROUP_OPTION_FORM, ' SHOW BOT OPTION: ', this.SHOW_OPTION_FORM, ' ROUTING SELECTED ', this.ROUTING_SELECTED)

    // ONLY FOR THE EDIT VIEW (see above in ngOnInit the logic for the EDIT VIEW)
    this.dept_routing = 'assigned'
  }

  // !!!! NO MORE USED - IS SUBSTITUTED BY has_clicked_bot()
  // is the option (called Bot in the html) that provides for the selection of a faq-kb (also this called Bot in the html)
  has_clicked_fixed(show_group_option_form: boolean, show_option_form: boolean, routing: string) {
    // this.HAS_CLICKED_FIXED = true;
    // this.HAS_CLICKED_POOLED = false;
    this.SHOW_GROUP_OPTION_FORM = show_group_option_form;
    this.SHOW_OPTION_FORM = show_option_form;
    this.ROUTING_SELECTED = routing
    // tslint:disable-next-line:max-line-length
    console.log('HAS CLICKED FIXED - SHOW GROUP OPTION: ', this.SHOW_GROUP_OPTION_FORM, ' SHOW BOT OPTION: ', this.SHOW_OPTION_FORM, ' ROUTING SELECTED ', this.ROUTING_SELECTED)
    // ONLY FOR THE EDIT VIEW (see above in ngOnInit the logic for the EDIT VIEW)
    this.dept_routing = 'fixed'

    this.BOT_NOT_SELECTED = true;
    console.log('BOT_NOT_SELECTED ', this.BOT_NOT_SELECTED);
  }



  has_clicked_pooled(show_group_option_form: boolean, show_option_form: boolean, routing: string) {
    // console.log('HAS CLICKED POOLED')
    // this.HAS_CLICKED_FIXED = false;
    // this.HAS_CLICKED_POOLED = true;
    this.SHOW_GROUP_OPTION_FORM = show_group_option_form;
    this.SHOW_OPTION_FORM = show_option_form;
    this.ROUTING_SELECTED = routing
    // tslint:disable-next-line:max-line-length
    console.log('HAS CLICKED POOLED: - SHOW GROUP OPTION: ', this.SHOW_GROUP_OPTION_FORM, ' SHOW BOT OPTION: ', this.SHOW_OPTION_FORM, ' ROUTING SELECTED ', this.ROUTING_SELECTED)

    // ONLY FOR THE EDIT VIEW (see above in ngOnInit the logic for the EDIT VIEW)
    this.dept_routing = 'pooled'

  }

  edit() {
    this.displayInfoModal = 'block'
    this.SHOW_CIRCULAR_SPINNER = true;

    console.log('DEPT ID WHEN EDIT IS PRESSED ', this.id_dept);
    console.log('DEPT FULL-NAME WHEN EDIT IS PRESSED ', this.default_dept_name);
    console.log('BOT ID WHEN EDIT IS PRESSED IF USER HAS SELECT ANOTHER BOT', this.selectedBotId);
    console.log('BOT ID WHEN EDIT IS PRESSED IF USER ! DOES NOT SELECT A ANOTHER BOT', this.botId);
    console.log('GROUP ID WHEN EDIT IS PRESSED ', this.selectedGroupId);
    console.log('* DEPT_ROUTING WHEN EDIT IS PRESSED ', this.dept_routing);
    console.log('* ROUTING_SELECTED WHEN EDIT IS PRESSED ', this.ROUTING_SELECTED);

    // selectedFaqKbId
    // 'FIXED' (NOW, IN THE HTML, RENAMED IN 'BOT') OPTION WORK-FLOW:
    // IF THE USER, WHEN EDIT THE DEPT (AND HAS SELECTED FIXED), DOESN'T SELECT ANY NEW BOT this.selectedBotId IS UNDEFINED
    // SO SET this.botIdEdit EQUAL TO THE BOT ID RETURNED BY getBotById

    // if (this.dept_routing === 'fixed') {
    if (this.selectedBotId === undefined) {
      this.botIdEdit = this.botId
    } else {
      this.botIdEdit = this.selectedBotId
    }
    // } else {
    //   this.botIdEdit = null;
    // }


    // this.faqKbEdit
    // this.ROUTING_SELECTED
    // tslint:disable-next-line:max-line-length
    this.mongodbDepartmentService.updateMongoDbDepartment(this.id_dept, this.default_dept_name, this.botIdEdit, this.bot_only, this.selectedGroupId, this.dept_routing)
      .subscribe((data) => {
        console.log('PUT DATA ', data);

        // RE-RUN GET CONTACT TO UPDATE THE TABLE
        // this.getDepartments();
        // this.ngOnInit();
      },
        (error) => {
          console.log('PUT REQUEST ERROR ', error);
          this.SHOW_CIRCULAR_SPINNER = false;

          // =========== NOTIFY ERROR ===========
          // tslint:disable-next-line:quotemark
          this.notify.showNotification("An error occurred while updating routing rules", 4, 'report_problem')
        },
        () => {
          console.log('PUT REQUEST * COMPLETE *');
          setTimeout(() => {
            this.SHOW_CIRCULAR_SPINNER = false
          }, 300);

          this.ngOnInit();
          // =========== NOTIFY SUCCESS===========
          this.notify.showNotification('routing rules successfully updated', 2, 'done');
        });

  }

  onCloseInfoModalHandled() {
    this.displayInfoModal = 'none'
  }

  onCloseModal() {
    this.displayInfoModal = 'none';
  }

  goTo_BotEditAddPage_CREATE() {
    this.router.navigate(['project/' + this.project._id + '/bots/bot-select-type']);
  }

}
