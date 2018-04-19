import { Component, OnInit } from '@angular/core';
import { MongodbDepartmentService } from '../services/mongodb-department.service';
import { Department } from '../models/department-model';
import { FaqKbService } from '../services/faq-kb.service';

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
  botIdEdit: string;
  selectedId: string;

  constructor(
    private mongodbDepartmentService: MongodbDepartmentService,
    private faqKbService: FaqKbService,
  ) { }

  ngOnInit() {
    this.getDeptsByProjectId();

    this.getFaqKbByProjecId();
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

            this.id_dept = dept._id

            console.log('ROUTING PAGE - BOT ID: ', this.botId);
          }
        })
      }
      // this.showSpinner = false;
      // this.departments = departments;
    },
      error => {
        // this.showSpinner = false;
        console.log('ROUTING PAGE - DEPTS (FILTERED FOR PROJECT ID) - ERROR', error);
      },
      () => {
        console.log('ROUTING PAGE - DEPTS (FILTERED FOR PROJECT ID) - COMPLETE')

        if (this.botId === undefined) {
          console.log(' !!! BOT ID UNDEFINED ', this.botId);
          // this.showSpinner = false;
          // this.selectedValue = 'Selezione FAQ KB';

        } else if (this.botId == null) {

          console.log(' !!! BOT ID NULL ', this.botId);
        } else {

          // getBotById() IS RUNNED ONLY IF THE BOT-ID (returned in the DEPT OBJECT) IS NOT undefined and IS NOT null
          this.getBotById();
          console.log(' BOT ID DEFINED ', this.botId);
        }
      });

  }

  /*
     ====== GET FAQ-KB BY ID (SUBSTITUTE BOT) ======
   * THE ID OF THE BOT (IT'S ACTUALLY IS THE ID OF THE FAQ-KB) IS GET FROM THE DEPT OBJECT (CALLBACK getDeptById)
   * FROM THE FAQ-KB OBJECT (SUBSTITUTE BOT) IS USED:
   * THE FAQ-KB ID (SUBSTITUTE BOT) THAT IS USED TO OBTAIN THE FAQ-KB NAME SHOWED AS OPTION SELECTED IN THE EDIT VIEW
   * (see: selectedId === bot._id)
   */
  getBotById() {
    // this.botService.getMongDbBotById(this.botId).subscribe((bot: any) => { // NO MORE USED
    this.faqKbService.getMongDbFaqKbById(this.botId).subscribe((faqkb: any) => {
      console.log('GET FAQ-KB (DETAILS) BY ID (SUBSTITUTE BOT) ', faqkb);

      this.selectedId = faqkb._id;
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
    console.log('DEPT ID WHEN EDIT IS PRESSED ', this.id_dept);
    console.log('DEPT FULL-NAME WHEN EDIT IS PRESSED ', this.default_dept_name);
    console.log('BOT ID WHEN EDIT IS PRESSED IF USER HAS SELECT ANOTHER BOT', this.selectedBotId);
    console.log('BOT ID WHEN EDIT IS PRESSED IF USER ! DOES NOT SELECT A ANOTHER BOT', this.botId);
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
    this.mongodbDepartmentService.updateMongoDbDepartment(this.id_dept, this.default_dept_name, this.botIdEdit, this.dept_routing).subscribe((data) => {
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


      });

  }

}
