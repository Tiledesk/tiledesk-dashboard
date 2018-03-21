// tslint:disable:max-line-length
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MongodbDepartmentService } from '../services/mongodb-department.service';
import { BotService } from '../services/bot.service';

import { Project } from '../models/project-model';
import { AuthService } from '../core/auth.service';

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

  botsList: any;
  selectedBotId: string;
  BOT_NOT_SELECTED: boolean;

  SHOW_OPTION_FORM: boolean;

  ROUTING_SELECTED: string;

  deptName_toUpdate: string;
  botId: string;

  selectedValue: string;
  selectedId: string;
  botIdEdit: string;
  dept_routing: string;

  project: Project;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private mongodbDepartmentService: MongodbDepartmentService,
    private botService: BotService,
    private auth: AuthService
  ) { }

  ngOnInit() {


    /**
     * *** GET ALL BOTS LIST ***
     * ARE SHOWED AS OPTIONS TO SELECT IN THE SELECTION FIELD (IN CREATE AND IN EDIT VIEW)
     */
    this.getBots();

    /**
     * BASED ON THE URL PATH DETERMINE IF THE USER HAS SELECTED (IN DEPARTMENTS PAGE) 'CREATE' OR 'EDIT'
     */
    // if (this.router.url === '/create') {
    if (this.router.url.indexOf('/create') !== -1) {

      console.log('HAS CLICKED CREATE ');
      this.CREATE_VIEW = true;
      // this.showSpinner = false;
      this.SHOW_OPTION_FORM = true;
      this.ROUTING_SELECTED = 'fixed';
      this.BOT_NOT_SELECTED = true;
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

        // WHEN IT IS OPENED THE EDIT VIEW IF DEPT ROUTING HAS THE VALUE POOLED IT NOT DISPAYED THE ITEM
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
        }

      }
    }

    this.getCurrentProject();
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      console.log('00 -> DEPT COMP project ID from AUTH service subscription  ', this.project._id)
    });
  }

  getDeptId() {
    this.id_dept = this.route.snapshot.params['deptid'];
    console.log('DEPATMENT COMPONENT HAS PASSED id_DEPT ', this.id_dept);
  }

  /**
 * *** GET ALL FAQ KB LIST ***
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


  // GO BACK TO DEPARTMENTS COMPONENT
  goBackToDeptsList() {
    this.router.navigate(['project/' + this.project._id  + '/departments']);
  }

  // WHEN THE USER EDITS A BOT CAN SELECT A BOT TO CORRELATE AT THE DEPARTMENT
  // WHEN THE BTN 'EDIT DEPARTMENT' IS PRESSED THE VALUE OF THE ID OF THE SELECTED DEPT IS MODIFIED IN THE DEPT'S FIELD id_bot
  // Note: is used also for the 'CREATE VIEW'
  setSelectedBot(id: any): void {
    this.selectedBotId = id;
    console.log('BOT ID SELECTED: ', this.selectedBotId);

    // IN THE CREATE VIEW IF IS NOT SELECTET ANY FAQ-KB THE BUTTON 'CREATE BOT' IS DISABLED
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
    this.mongodbDepartmentService.addMongoDbDepartments(this.dept_name, this.selectedBotId, this.ROUTING_SELECTED)
      .subscribe((department) => {
        console.log('POST DATA DEPT', department);

        // this.dept_name = '';

        // RE-RUN GET CONTACT TO UPDATE THE TABLE
        // this.getDepartments();
        // this.ngOnInit();
      },
      (error) => {
        console.log('DEPT POST REQUEST ERROR ', error);
      },
      () => {
        console.log('DEPT POST REQUEST * COMPLETE *');
        this.router.navigate(['project/' + this.project._id  + '/departments']);
      });
  }

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

  has_clicked_pooled(show_option_form: boolean, routing: string) {
    // console.log('HAS CLICKED POOLED')
    // this.HAS_CLICKED_FIXED = false;
    // this.HAS_CLICKED_POOLED = true;
    this.SHOW_OPTION_FORM = show_option_form;
    this.ROUTING_SELECTED = routing
    console.log('HAS CLICKED POOLED  - SHOW OPTION ', this.SHOW_OPTION_FORM, ' ROUTING SELECTED ', this.ROUTING_SELECTED)
    // ONLY FOR THE EDIT VIEW (see above in ngOnInit the logic for the EDIT VIEW)
    this.dept_routing = 'pooled'

  }



  /** === FOR EDIT VIEW === **
   * **** GET DEPT (DETAIL) OBJECT BY ID AND (THEN) GET BOT (DETAIL) OBJECT BY ID ***
   * THE ID USED TO RUN THIS getMongDbDeptById IS PASSED FROM THE DEPT LIST (DEPARTMENTS COMPONENT goToEditAddPage_EDIT))
   * FROM DEPT OBJECT IS USED:
   * THE DEPT NAME TO SHOW IN THE INPUT FIELD (OF THE EDIT VIEW)
   * THE DEPT ROUTING (PREVIOUSLY SELECTED): dept_routing is passed in the view [checked]="dept_routing === 'pooled'"
   * to determine the option selected
   * THE BOT ID TO RUN ANOTHER CALLBACK TO OBTAIN THE BOT OBJECT AND, FROM THIS,
   * THE BOT ID THAT IS USED TO OBTAIN (IN THE EDIT VIEW) THE BOT FULL-NAME AS OPTION PREVIOUSLY SELECTED
   * (WHEN THE USER HAS CREATED THE DEPT)  (see: selectedId === bot._id)
   */
  getDeptById() {
    this.mongodbDepartmentService.getMongDbDeptById(this.id_dept).subscribe((dept: any) => {
      console.log('++ > GET DEPT (DETAILS) BY ID - DEPT OBJECT: ', dept);

      this.deptName_toUpdate = dept.name;
      this.botId = dept.id_bot;
      this.dept_routing = dept.routing
      // if (this.dept_routing === 'pooled' ) {
      //   this.SHOW_OPTION_FORM = false;
      // }

      console.log(' DEPT FULLNAME TO UPDATE: ', this.deptName_toUpdate);
      console.log(' BOT ID GET FROM DEPT OBJECT: ', this.botId);
      console.log(' DEPT ROUTING GET FROM DEPT OBJECT: ', this.dept_routing);

    },
      (error) => {
        console.log('GET BOT BY ID - ERROR ', error);
        // this.showSpinner = false;
      },
      () => {
        console.log('GET BOT BY ID - COMPLETE ');

        // MOVED IN getFaqKbById
        // this.showSpinner = false;

        if (this.botId === 'undefined') {
          console.log(' !!! BOT ID UNDEFINED ', this.botId);
          // this.showSpinner = false;
          // this.selectedValue = 'Selezione FAQ KB';

        } else {
          this.getBotById();
          console.log(' !!! BOT ID DEFINED ', this.botId);
        }
      });

  }

  /** === FOR EDIT VIEW === **
   * **** GET BOT BY ID ***
   * THE ID OF THE BOT IS GET FROM THE DEPT OBJECT (CALLBACK getBotById)
   * FROM THE BOT OBJECT IS USED:
   * THE BOT ID THAT IS USED TO OBTAIN THE BOT-FULLNAME SHOWED AS OPTION SELECTED IN THE EDIT VIEW
   * (see: selectedId === bot._id)
   */
  getBotById() {
    this.botService.getMongDbBotById(this.botId).subscribe((bot: any) => {
      console.log('GET BOT (DETAILS) BY ID', bot);
      this.selectedId = bot._id;

      // USED ONLY FOR DEBUG
      this.selectedValue = bot.fullname;

      // this.faqKbUrlToUpdate = faqKb.url;
      console.log(' ++ ++ BOT NAME', this.selectedValue);

    },
      (error) => {
        console.log('GET BOT BY ID - ERROR ', error);
        // this.showSpinner = false;
      },
      () => {
        console.log('GET BOT ID - COMPLETE ');
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

    // selectedFaqKbId
    // FIXED LOGIC IF THE USER, WHEN EDIT THE BOT (AND HAS SELECTED FIXED), DOESN'T SELECT ANY NEW BOT this.selectedBotId IS UNDEFINED
    // SO SET this.botIdEdit EQUAL TO THE BOT ID RETURNED BY getBotById
    if (this.ROUTING_SELECTED === 'fixed') {
      if (this.selectedBotId === undefined) {
        this.botIdEdit = this.botId
      } else {
        this.botIdEdit = this.selectedBotId
      }
    }
    // this.faqKbEdit
    this.mongodbDepartmentService.updateMongoDbDepartment(this.id_dept, this.deptName_toUpdate, this.botIdEdit, this.ROUTING_SELECTED).subscribe((data) => {
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

        this.router.navigate(['project/' + this.project._id  + '/departments']);
      });

  }



}
