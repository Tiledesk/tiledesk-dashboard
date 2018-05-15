import { Component, OnInit } from '@angular/core';
import { MongodbDepartmentService } from '../services/mongodb-department.service';
import { Department } from '../models/department-model';
import { FaqKbService } from '../services/faq-kb.service';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Project } from '../models/project-model';
import { GroupService } from '../services/group.service';
import { Group } from '../models/group-model';

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

  BOT_NOT_SELECTED: boolean;
  SHOW_OPTION_FORM: boolean;
  ROUTING_SELECTED: string;
  selectedBotId: string;
  selectedGroupId: string;
  botIdEdit: string;
  selectedId: string;

  showSpinner: boolean

  displayInfoModal = 'none';
  SHOW_CIRCULAR_SPINNER = false;
  project: Project;
  groupsList: Group[];

  constructor(
    private mongodbDepartmentService: MongodbDepartmentService,
    private faqKbService: FaqKbService,
    private router: Router,
    private auth: AuthService,
    private groupService: GroupService
  ) { }

  ngOnInit() {
    this.auth.checkRole();

    this.showSpinner = true;

    this.getDeptsByProjectId();

    this.getFaqKbByProjecId();

    this.getCurrentProject();

    this.getGroupsByProjectId();


  }



  /*
   * GETS ALL GROUPS WITH THE CURRENT PROJECT-ID
   */
  getGroupsByProjectId() {
    this.groupService.getGroupsByProjectId().subscribe((groups: any) => {
      console.log('GROUPS GET BY PROJECT ID', groups);

      this.groupsList = groups;

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

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      // console.log('00 -> DEPT EDIT/ADD COMP project ID from AUTH service subscription  ', this.project._id)
    });
  }

  getDeptsByProjectId() {
    this.mongodbDepartmentService.getDeptsByProjectId().subscribe((departments: any) => {
      // console.log('ROUTING PAGE - DEPTS (FILTERED FOR PROJECT ID)', departments);

      if (departments) {
        departments.forEach(dept => {
          if (dept.default === true) {
            this.default_dept = dept
            console.log('ROUTING PAGE - DEFAULT DEPT (FILTERED FOR PROJECT ID)', this.default_dept);


            this.default_dept_name = dept.name;
            this.dept_routing = dept.routing

            this.botId = dept.id_bot;

            this.id_dept = dept._id;

            this.selectedGroupId = dept.id_group;



            console.log('ROUTING PAGE - BOT ID: ', this.botId);
            console.log('ROUTING PAGE - GROUP ID: ', this.selectedGroupId);
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
          console.log(' !!! BOT ID UNDEFINED ', this.botId);
          this.showSpinner = false;


        } else if (this.botId == null) {
          this.showSpinner = false;
          console.log(' !!! BOT ID NULL ', this.botId);
        } else {

          // getBotById() IS RUNNED ONLY IF THE BOT-ID (returned in the DEPT OBJECT) IS NOT undefined and IS NOT null
          this.getBotById();
          console.log(' BOT ID DEFINED ', this.botId);
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

    // IN THE CREATE VIEW IF IS NOT SELECTET ANY FAQ-KB (SUBSTITUTE BOT) THE BUTTON 'CREATE BOT' IS DISABLED
    if (this.selectedBotId !== 'BOT_NOT_SELECTED') {
      this.BOT_NOT_SELECTED = false;
    }
    if (this.selectedBotId === 'BOT_NOT_SELECTED') {
      this.BOT_NOT_SELECTED = true;
    }
  }

  setSelectedGroup(id: any): void {
    this.selectedGroupId = id;
    console.log('GROUP ID SELECTED: ', this.selectedGroupId);

    // IN THE CREATE VIEW IF IS NOT SELECTET ANY FAQ-KB (SUBSTITUTE BOT) THE BUTTON 'CREATE BOT' IS DISABLED
    if (this.selectedGroupId !== 'ALL_USERS_SELECTED') {
      // this.BOT_NOT_SELECTED = false;
    }
    if (this.selectedGroupId === 'ALL_USERS_SELECTED') {
      // this.BOT_NOT_SELECTED = true;
      this.selectedGroupId = null;
    }
  }


  has_clicked_assigned(show_option_form: boolean, routing: string) {

    this.SHOW_OPTION_FORM = show_option_form;
    this.ROUTING_SELECTED = routing
    console.log('HAS CLICKED ASSIGNABLE - SHOW OPTION ', this.SHOW_OPTION_FORM, ' ROUTING SELECTED ', this.ROUTING_SELECTED)

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

  edit() {
    this.displayInfoModal = 'block'
    this.SHOW_CIRCULAR_SPINNER = true;

    console.log('DEPT ID WHEN EDIT IS PRESSED ', this.id_dept);
    console.log('DEPT FULL-NAME WHEN EDIT IS PRESSED ', this.default_dept_name);
    console.log('BOT ID WHEN EDIT IS PRESSED IF USER HAS SELECT ANOTHER BOT', this.selectedBotId);
    console.log('BOT ID WHEN EDIT IS PRESSED IF USER ! DOES NOT SELECT A ANOTHER BOT', this.botId);
    console.log('GROP ID WHEN EDIT IS PRESSED ', this.selectedGroupId);
    console.log('* DEPT_ROUTING WHEN EDIT IS PRESSED ', this.dept_routing);
    console.log('* ROUTING_SELECTED WHEN EDIT IS PRESSED ', this.ROUTING_SELECTED);

    // selectedFaqKbId
    // 'FIXED' (NOW, IN THE HTML, RENAMED IN 'BOT') OPTION WORK-FLOW:
    // IF THE USER, WHEN EDIT THE DEPT (AND HAS SELECTED FIXED), DOESN'T SELECT ANY NEW BOT this.selectedBotId IS UNDEFINED
    // SO SET this.botIdEdit EQUAL TO THE BOT ID RETURNED BY getBotById
    // if (this.ROUTING_SELECTED === 'fixed') {
    if (this.dept_routing === 'fixed') {
      if (this.selectedBotId === undefined) {
        this.botIdEdit = this.botId
      } else {
        this.botIdEdit = this.selectedBotId
      }
    } else {
      this.botIdEdit = null;
    }


    // this.faqKbEdit
    // this.ROUTING_SELECTED
    // tslint:disable-next-line:max-line-length
    this.mongodbDepartmentService.updateMongoDbDepartment(this.id_dept, this.default_dept_name, this.botIdEdit, this.selectedGroupId, this.dept_routing).subscribe((data) => {
      console.log('PUT DATA ', data);

      // RE-RUN GET CONTACT TO UPDATE THE TABLE
      // this.getDepartments();
      // this.ngOnInit();
    },
      (error) => {
        console.log('PUT REQUEST ERROR ', error);
        this.SHOW_CIRCULAR_SPINNER = false;
      },
      () => {
        console.log('PUT REQUEST * COMPLETE *');
        this.SHOW_CIRCULAR_SPINNER = false;

      });

  }

  onCloseInfoModalHandled() {
    this.displayInfoModal = 'none'
  }

  onCloseModal() {
    this.displayInfoModal = 'none';
  }

  goTo_BotEditAddPage_CREATE() {
    this.router.navigate(['project/' + this.project._id + '/createfaqkb']);
  }

}
