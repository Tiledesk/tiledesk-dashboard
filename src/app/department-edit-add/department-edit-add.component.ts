// tslint:disable:max-line-length
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MongodbDepartmentService } from '../services/mongodb-department.service';

import { BotService } from '../services/bot.service'; // no more used
import { FaqKbService } from '../services/faq-kb.service';


import { Project } from '../models/project-model';
import { AuthService } from '../core/auth.service';

import { GroupService } from '../services/group.service';
import { Group } from '../models/group-model';

@Component({
  selector: 'app-department-edit-add',
  templateUrl: './department-edit-add.component.html',
  styleUrls: ['./department-edit-add.component.scss']
})
export class DepartmentEditAddComponent implements OnInit {

  CREATE_VIEW = false;
  EDIT_VIEW = false;

  id_dept: string;
  dept_name: string;

  // !!! NOTE: IS CALLED BOT LIST BUT REALLY IS THE LIST OF FAQ-KB LIST
  botsList: any;

  selectedBotId: string;
  selectedGroupId: string;

  SHOW_GROUP_OPTION_FORM: boolean;

  ROUTING_SELECTED: string;

  deptName_toUpdate: string;
  botId: string;

  selectedValue: string;
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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private mongodbDepartmentService: MongodbDepartmentService,
    private botService: BotService,
    private faqKbService: FaqKbService,
    private auth: AuthService,
    private groupService: GroupService
  ) { }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    /**
     * ==================================================================
     * !!! NO MORE USED - getBots() HAS BEEN REPLACED BY getFaqKbByProjecId()
     * (IN THE HTML THE USER CONTINUE TO SEE 'Select a Bot' but, really,
     * in the options form are displayed the faq-kb list)
     * ==================================================================
     *
     * *** GET ALL BOTS LIST ***
     * ARE SHOWED AS OPTIONS TO SELECT IN THE SELECTION FIELD (IN CREATE VIEW)
     */
    // this.getBots();



    /**
     * BASED ON THE URL PATH DETERMINE IF THE USER HAS SELECTED (IN DEPARTMENTS PAGE) 'CREATE' OR 'EDIT'
     */
    // if (this.router.url === '/create') {
    if (this.router.url.indexOf('/create') !== -1) {

      console.log('HAS CLICKED CREATE ');
      this.CREATE_VIEW = true;
      // this.showSpinner = false;
      // this.SHOW_OPTION_FORM = true;
      // this.ROUTING_SELECTED = 'fixed';

      this.ROUTING_SELECTED = 'assigned';
      this.dept_routing = 'assigned';

      this.SHOW_OPTION_FORM = false;
      this.BOT_NOT_SELECTED = true;
      this.has_selected_bot = false;
      this.selectedBotId = null;
      console.log('ON INIT (IF HAS SELECT CREATE) SHOW OPTION FORM ', this.SHOW_OPTION_FORM, 'ROUTING SELECTED ', this.ROUTING_SELECTED);

    } else {
      console.log('HAS CLICKED EDIT ');
      this.EDIT_VIEW = true;


      // *** GET DEPT ID FROM URL PARAMS ***
      // IS USED TO GET THE BOT OBJECT ( THE ID IS PASSED FROM BOTS COMPONENT - goToEditAddPage_EDIT())
      this.getDeptId();
      this.SHOW_OPTION_FORM = false;

      if (this.id_dept) {
        this.getDeptById();

        // WHEN IT IS OPENED THE EDIT VIEW IF DEPT ROUTING HAS THE VALUE POOLED IT NOT DISPLAYED THE ITEM
        // FORM FOR THE SELECTION OF A BOT (TO CORRELATE WITH THE CURRENT DEPT)
        // NOTE: dept_routing is determinate in getDeptById()
        // THE VALUE fixed or pooled TO dept_routing IS THEN REASSIGNED IN has_clicked_fixed() AND has_clicked_POOLED
        if (this.dept_routing === 'pooled') {
          this.SHOW_OPTION_FORM = false;
          this.dept_routing = 'pooled'
          this.BOT_NOT_SELECTED = true;
        } else if (this.dept_routing === 'fixed') {
          this.SHOW_OPTION_FORM = true;
          this.dept_routing = 'fixed'
          this.BOT_NOT_SELECTED = false;
        } else if (this.dept_routing === 'assigned') {
          this.SHOW_OPTION_FORM = false;
          this.dept_routing = 'fixed'
          this.BOT_NOT_SELECTED = true;
        }

        // TEST CHAT21-API-NODEJS router.get('/:departmentid/operators'
        /* GET OPERATORS OF A DEPT */
        this.getDeptByIdToTestChat21AssigneesFunction()
      }
    }

    this.getCurrentProject();

    /**
     * ======================= GET FAQ-KB LIST =========================
     * THE FAQ-KB LIST COME BACK FROM THE CALLBACK
     * IS USED TO POPULATE THE DROP-DOWN LIST 'SELECT A BOT' OF CREATE VIEW AND OF IN THE EDIT VIEW)
     */
    this.getFaqKbByProjecId()

    this.getGroupsByProjectId();
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

  /**
   * ======================= GETS ALL GROUPS WITH THE CURRENT PROJECT-ID =======================
   * USED TO POPULATE THE DROP-DOWN LIST 'GROUPS' ASSOCIATED TO THE ASSIGNED ANF POOLED ROUTING
   */
  getGroupsByProjectId() {
    this.groupService.getGroupsByProjectId().subscribe((groups: any) => {
      console.log('+ + GROUPS GET BY PROJECT ID', groups);

      if (groups) {
        this.groupsList = groups;

        console.log('for DEBUG GROUP ID SELECTED', this.selectedGroupId);

        // CHECK IN THE GROUPS LIST THE GROUP-ID RETURNED FROM THE DEPT OBJECT.
        // IF THE GROUP-ID DOES NOT EXIST MEANS THAT WAS DELETED
        if (this.selectedGroupId !== null && this.selectedGroupId !== undefined) {
          this.checkGroupId(this.selectedGroupId, this.groupsList)
        }
      }
    },
      (error) => {
        console.log('+ + GET GROUPS - ERROR ', error);

        // this.showSpinner = false;
      },
      () => {
        console.log('+ + GET GROUPS * COMPLETE');

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

  setSelectedGroup(id: any): void {
    this.selectedGroupId = id;
    console.log('GROUP ID SELECTED: ', this.selectedGroupId);

    // IF THE GROUP ASSIGNED TO THE DEPT HAS BEEN DELETED,
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

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      // console.log('00 -> DEPT EDIT/ADD COMP project ID from AUTH service subscription  ', this.project._id)
    });
  }

  getDeptId() {
    this.id_dept = this.route.snapshot.params['deptid'];
    console.log('DEPATMENT COMPONENT HAS PASSED id_DEPT ', this.id_dept);
  }

  /**
   * !!! NO MORE USED (see THE COMMENT ABOVE)
   * === GET ALL BOTS LIST ===
   * * USED IN THE CREATE VIEW *
   */
  getBots() {
    this.botService.getMongDbBots().subscribe((bots: any) => {
      console.log('GET BOTS LIST (TO SHOW IN SELECTION FIELD) ', bots);
      this.botsList = bots;
    },
      (error) => {
        console.log('GET BOTS LIST - ERROR ', error);
      },
      () => {
        console.log('GET BOTS LIST - COMPLETE ');
      });
  }

  /**
   * GET THE FAQ-KB LIST FILTERING ALL THE FAQ-KB FOR THE CURRENT PROJECT ID
   * NOTE: THE CURRENT PROJECT ID IS OBTAINED IN THE FAQ-KB SERVICE
   * * USED IN THE OPTION ITEM FORM OF THE CREATE VIEW AND OF THE EDIT VIEW *
   */
  getFaqKbByProjecId() {
    this.faqKbService.getFaqKbByProjectId().subscribe((faqkb: any) => {
      console.log('GET FAQ-KB LIST - SUBSTITUTE BOT (TO SHOW IN SELECTION FIELD) ', faqkb);
      this.botsList = faqkb;
    },
      (error) => {
        console.log('GET FAQ-KB LIST - SUBSTITUTE BOT - ERROR ', error);
      },
      () => {
        console.log('GET FAQ-KB LIST - SUBSTITUTE BOT - COMPLETE ');
      });

  }


  // GO BACK TO DEPARTMENTS COMPONENT
  goBackToDeptsList() {
    this.router.navigate(['project/' + this.project._id + '/departments']);
  }

  // WHEN THE USER EDITS A DEPTS CAN SELECT A BOT TO CORRELATE AT THE DEPARTMENT
  // WHEN THE BTN 'EDIT DEPARTMENT' IS PRESSED THE VALUE OF THE ID OF THE SELECTED BOT IS MODIFIED IN THE DEPT'S FIELD id_bot
  // Note: is used also for the 'CREATE VIEW'
  setSelectedBot(id: any): void {
    this.selectedBotId = id;
    console.log('FAQ-KB ID SELECTED (SUBSTITUTE BOT): ', this.selectedBotId);

    // IN THE CREATE VIEW IF IS NOT SELECTET ANY FAQ-KB (SUBSTITUTE BOT) THE BUTTON 'CREATE BOT' IS DISABLED
    if (this.selectedBotId !== 'BOT_NOT_SELECTED') {
      this.BOT_NOT_SELECTED = false;
    }
    if (this.selectedBotId === 'BOT_NOT_SELECTED') {
      this.BOT_NOT_SELECTED = true;
    }
  }

  /**
   * ADD DEPARMENT
   */
  createDepartment() {
    console.log('MONGO DB DEPT-NAME DIGIT BY USER ', this.dept_name);
    console.log('GROUP ID WHEN CREATE IS PRESSED ', this.selectedGroupId);
    this.mongodbDepartmentService.addMongoDbDepartments(this.dept_name, this.selectedBotId, this.bot_only, this.selectedGroupId, this.ROUTING_SELECTED)
      .subscribe((department) => {
        console.log('+++ ++++ POST DATA DEPT', department);
      },
        (error) => {
          console.log('DEPT POST REQUEST ERROR ', error);
        },
        () => {
          console.log('DEPT POST REQUEST * COMPLETE *');
          this.router.navigate(['project/' + this.project._id + '/departments']);
        });
  }

  has_clicked_assigned(show_group_option_form: boolean, show_option_form: boolean, routing: string) {

    this.SHOW_GROUP_OPTION_FORM = show_group_option_form;
    this.SHOW_OPTION_FORM = show_option_form;
    this.ROUTING_SELECTED = routing
    console.log('HAS CLICKED ASSIGNABLE - SHOW GROUP OPTION ', this.SHOW_GROUP_OPTION_FORM, ' SHOW BOT OPTION: ', this.SHOW_OPTION_FORM, ' ROUTING SELECTED ', this.ROUTING_SELECTED)

    // ONLY FOR THE EDIT VIEW (see above in ngOnInit the logic for the EDIT VIEW)
    this.dept_routing = 'assigned'
  }

  // is the option (called Bot in the html) that provides for the selection of a faq-kb (also this called Bot in the html)
  has_clicked_fixed(show_option_form: boolean, routing: string) {
    // this.HAS_CLICKED_FIXED = true;
    // this.HAS_CLICKED_POOLED = false;
    this.SHOW_OPTION_FORM = show_option_form;
    this.ROUTING_SELECTED = routing
    console.log('HAS CLICKED FIXED - SHOW OPTION ', this.SHOW_OPTION_FORM, ' ROUTING SELECTED ', this.ROUTING_SELECTED)
    // ONLY FOR THE EDIT VIEW (see above in ngOnInit the logic for the EDIT VIEW)
    this.dept_routing = 'fixed'
    this.BOT_NOT_SELECTED = true;
  }

  has_clicked_pooled(show_group_option_form: boolean, show_option_form: boolean, routing: string) {
    // console.log('HAS CLICKED POOLED')
    // this.HAS_CLICKED_FIXED = false;
    // this.HAS_CLICKED_POOLED = true;
    this.SHOW_GROUP_OPTION_FORM = show_group_option_form;
    this.SHOW_OPTION_FORM = show_option_form;
    this.ROUTING_SELECTED = routing
    console.log('HAS CLICKED POOLED  - SHOW GROUP OPTION ', this.SHOW_GROUP_OPTION_FORM, ' SHOW BOT OPTION: ', this.SHOW_OPTION_FORM, ' ROUTING SELECTED ', this.ROUTING_SELECTED)

    // ONLY FOR THE EDIT VIEW (see above in ngOnInit the logic for the EDIT VIEW)
    this.dept_routing = 'pooled'

  }



  /** === FOR EDIT VIEW === **
   * **** GET DEPT (DETAILS) OBJECT BY ID AND (THEN) GET BOT OBJECT BY ID (GET BOT DETAILS) ***
   * THE ID USED TO RUN THIS getMongDbDeptById IS PASSED FROM THE DEPT LIST (DEPARTMENTS COMPONENT goToEditAddPage_EDIT))
   * FROM DEPT OBJECT IS USED:
   * THE DEPT NAME TO SHOW IN THE INPUT FIELD (OF THE EDIT VIEW)
   * THE DEPT ROUTING (PREVIOUSLY SELECTED): dept_routing is passed in the view [checked]="dept_routing === 'pooled'"
   * to determine the option selected
   * THE BOT ID (IT'S ACTUALLY THE FAQ-KB ID) TO RUN ANOTHER CALLBACK TO OBTAIN THE FAQ-KB OBJECT (SUBSTITUTE BOT) AND, FROM THIS,
   * THE FAQ-KB ID THAT IS USED TO OBTAIN (IN THE EDIT VIEW) THE FAQ-KB NAME AS OPTION PREVIOUSLY SELECTED
   * (WHEN THE USER HAS CREATED THE DEPT)  (see: selectedId === bot._id)
   */
  getDeptById() {
    this.mongodbDepartmentService.getMongDbDeptById(this.id_dept).subscribe((dept: any) => {
      console.log('++ > GET DEPT (DETAILS) BY ID - DEPT OBJECT: ', dept);

      this.deptName_toUpdate = dept.name;
      this.botId = dept.id_bot;
      this.dept_routing = dept.routing;
      this.selectedGroupId = dept.id_group;

      this.bot_only = dept.bot_only

      if (this.bot_only === false || this.bot_only === undefined || this.bot_only === null) {
        this.has_selected_only_bot = false;
      } else {
        this.has_selected_only_bot = true;
        this.onlybot_disable_routing = true;
      }

      console.log('++ DEPT DTLS - DEPT FULLNAME TO UPDATE: ', this.deptName_toUpdate);
      console.log('++ DEPT DTLS - BOT ID (IT IS ACTUALLY FAQ-KB ID) GET FROM DEPT OBJECT: ', this.botId);
      console.log('++ DEPT DTLS - ONLY BOT: ', this.bot_only);
      console.log('++ DEPT DTLS - DEPT ROUTING GET FROM DEPT OBJECT: ', this.dept_routing);
      console.log('++ DEPT DTLS - GROUP ID GET FROM DEPT OBJECT: ', this.selectedGroupId);

    },
      (error) => {
        console.log('GET DEPT BY ID - ERROR ', error);
        // this.showSpinner = false;
      },
      () => {
        console.log('GET DEPT BY ID - COMPLETE ');

        // MOVED IN getFaqKbById
        // this.showSpinner = false;

        if (this.botId === undefined) {

          this.selectedBotId = null;

          this.BOT_NOT_SELECTED = true;
          this.has_selected_bot = false;

          console.log(' !!! BOT ID UNDEFINED ', this.botId, ', BOT NOT SELECTED: ', this.BOT_NOT_SELECTED);
          // this.showSpinner = false;
          // this.selectedValue = 'Selezione FAQ KB';

        } else if (this.botId == null) {

          this.selectedBotId = null;

          this.BOT_NOT_SELECTED = true;
          this.has_selected_bot = false;
          console.log(' !!! BOT ID NULL ', this.botId, ', BOT NOT SELECTED: ', this.BOT_NOT_SELECTED);
          // this.showSpinner = false;
        } else {
          // getBotById() IS RUNNED ONLY IF THE BOT-ID (returned in the DEPT OBJECT) 
          // IS NOT undefined AND IS NOT null

          // if the bot is defined it means that the user had selected the bot
          this.has_selected_bot = true

          this.getBotById();
          console.log(' !!! BOT ID DEFINED ', this.botId);
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
    // this.botService.getMongDbBotById(this.botId).subscribe((bot: any) => { // NO MORE USED
    this.faqKbService.getMongDbFaqKbById(this.botId).subscribe((faqkb: any) => {
      console.log('GET FAQ-KB (DETAILS) BY ID (SUBSTITUTE BOT) ', faqkb);
      // this.selectedId = bot._id;
      this.selectedId = faqkb._id;

      // USED ONLY FOR DEBUG
      // this.selectedValue = bot.fullname;
      this.selectedValue = faqkb.name;

      // this.faqKbUrlToUpdate = faqKb.url;
      console.log('FAQ-KB NAME (SUBSTITUTE BOT) ', this.selectedValue);

    },
      (error) => {
        console.log('GET FAQ-KB BY ID (SUBSTITUTE BOT) - ERROR ', error);
        // this.showSpinner = false;
      },
      () => {
        console.log('GET FAQ-KB ID (SUBSTITUTE BOT) - COMPLETE ');
        // this.showSpinner = false;

      });

  }

  // WHEN IS PRESSES EDIT THE DATA PASSED TO THE FUNCTION updateMongoDbDepartment ARE
  // * this.id_dept: IS PASSED BY DEPARTMENT COMPONENT VIA URL (see getDeptId())
  // * deptName_toUpdate: IS RETURNED BY THE DEPARTMENT OBJECT (see getDeptById())
  edit() {
    console.log('DEPT ID WHEN EDIT IS PRESSED ', this.id_dept);
    console.log('DEPT FULL-NAME WHEN EDIT IS PRESSED ', this.deptName_toUpdate);
    console.log('BOT ID WHEN EDIT IS PRESSED IF USER HAS SELECT ANOTHER BOT', this.selectedBotId);
    console.log('BOT ID WHEN EDIT IS PRESSED IF USER ! DOES NOT SELECT A ANOTHER BOT', this.botId);
    console.log('* DEPT_ROUTING WHEN EDIT IS PRESSED ', this.dept_routing);
    console.log('* ROUTING_SELECTED WHEN EDIT IS PRESSED ', this.ROUTING_SELECTED);

    // selectedFaqKbId
    // 'FIXED' (NOW, IN THE HTML, RENAMED IN 'BOT') OPTION WORK-FLOW:
    // IF THE USER, WHEN EDIT THE DEPT (AND HAS SELECTED FIXED), DOESN'T SELECT ANY NEW BOT this.selectedBotId IS UNDEFINED
    // SO SET this.botIdEdit EQUAL TO THE BOT ID RETURNED BY getBotById
    // if (this.ROUTING_SELECTED === 'fixed') {

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
    this.mongodbDepartmentService.updateMongoDbDepartment(this.id_dept, this.deptName_toUpdate, this.botIdEdit, this.bot_only, this.selectedGroupId, this.dept_routing).subscribe((data) => {
      console.log('PUT DATA ', data);

      // RE-RUN GET CONTACT TO UPDATE THE TABLE
      // this.getDepartments();
      // this.ngOnInit();
    },
      (error) => {
        console.log('PUT REQUEST ERROR ', error);
      },
      () => {
        console.log('PUT REQUEST * COMPLETE *');

        this.router.navigate(['project/' + this.project._id + '/departments']);
      });

  }

  goTo_BotEditAddPage_CREATE() {
    this.router.navigate(['project/' + this.project._id + '/createfaqkb']);
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



}
