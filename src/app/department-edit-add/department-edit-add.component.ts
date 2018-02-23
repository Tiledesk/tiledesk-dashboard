import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MongodbDepartmentService } from '../services/mongodb-department.service';
import { BotService } from '../services/bot.service';

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
  BOT_NOT_SELECTED = true;

  SHOW_OPTION_FORM: boolean;

  ROUTING_SELECTED: string;

  deptName_toUpdate: string;
  botId: string;

  selectedValue: string;
  selectedId: string;
  botIdEdit: string;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private mongodbDepartmentService: MongodbDepartmentService,
    private botService: BotService,
  ) { }

  ngOnInit() {
    this.SHOW_OPTION_FORM = true;
    this.ROUTING_SELECTED = 'fixed';
    console.log('ON INIT SHOW OPTION FORM ', this.SHOW_OPTION_FORM, 'ROUTING SELECTED ', this.ROUTING_SELECTED);
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

    } else {
      console.log('HAS CLICKED EDIT ');
      this.EDIT_VIEW = true;

      // *** GET DEPT ID FROM URL PARAMS ***
      // IS USED TO GET THE BOT OBJECT ( THE ID IS PASSED FROM BOTS COMPONENT - goToEditAddPage_EDIT())
      this.getDeptId();

      if (this.id_dept) {
        this.getDeptById();
      }
    }

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
    this.router.navigate(['/departments']);
  }

  // WHEN THE USER EDITS A BOT CAN SELECT A BOT TO CORRELATE AT THE DEPARTMENT
  // WHEN THE BTN 'EDIT DEPARTMENT' IS PRESSED THE VALUE OF THE ID OF THE SELECTED DEPT IS MODIFIED IN THE DEPT'S FIELD id_bot
  // Note: is used also for the 'CREATE'
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
        this.router.navigate(['/departments']);
      });
  }

  has_clicked_fixed_bot(show_option_form: boolean, routing: string) {

    // this.HAS_CLICKED_FIXED = true;
    // this.HAS_CLICKED_POOLED = false;
    this.SHOW_OPTION_FORM = show_option_form;
    this.ROUTING_SELECTED = routing
    console.log('HAS CLICKED FIXED - SHOW OPTION ', this.SHOW_OPTION_FORM, ' ROUTING SELECTED ', this.ROUTING_SELECTED)
  }

  has_clicked_pooled_bot(show_option_form: boolean, routing: string) {
    // console.log('HAS CLICKED POOLED')
    // this.HAS_CLICKED_FIXED = false;
    // this.HAS_CLICKED_POOLED = true;
    this.SHOW_OPTION_FORM = show_option_form;
    this.ROUTING_SELECTED = routing
    console.log('HAS CLICKED POOLED  - SHOW OPTION ', this.SHOW_OPTION_FORM, ' ROUTING SELECTED ', this.ROUTING_SELECTED)
  }

 

  /** FOR EDIT
   * *** GET DEPT OBJECT BY ID AND (THEN) GET BOT OBJECT BY ID ***
   * THE ID USED TO RUN THIS getMongDbBotById IS PASSED FROM BOTS LIST (BOTS COMPONENT goToEditAddPage_EDIT))
   * FROM THE BOT OBJECT IS USED:
   * THE DEPT FULLNAME TO SHOW IN THE INPUT FIELD (OF THE EDIT VIEW)
   * THE FAQ-KB ID TO RUN A CALLBACK TO OBTAIN THE FAQ-KB OBJECT AND, FROM THIS,
   * THE FAQ-KB NAME THAT IS SHOWED AS OPTION SELECTED IN THE EDIT VIEW
   */
  getDeptById() {
    this.mongodbDepartmentService.getMongDbDeptById(this.id_dept).subscribe((dept: any) => {
      console.log('++ > GET DEPT (DETAILS) BY ID - DEPT OBJECT: ', dept);

      this.deptName_toUpdate = dept.name;
      this.botId = dept.id_bot;

      console.log(' DEPT FULLNAME TO UPDATE: ', this.deptName_toUpdate );
      console.log(' BOT ID GET FROM BOT OBJECT: ', this.botId);

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

   /**
   * *** GET BOT BY ID ***
   * THE ID OF THE BOT IS GET FROM THE DEPT OBJECT (CALLBACK getBotById)
   * FROM THE BOT OBJECT IS USED:
   * THE BOT NAME THAT IS SHOWED AS OPTION SELECTED IN THE EDIT VIEW
   */
  getBotById() {
    this.botService.getMongDbBotById(this.botId).subscribe((bot: any) => {
      console.log('GET BOT (DETAILS) BY ID', bot);
      this.selectedId = bot._id;
      // NOW USED ONLY FOR DEBUG
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

   // WHEN IS PRESSES EDIT THE DATA PASSED TO THE FUNCTION updateMongoDbBot() ARE
  // * this.id_dept: IS PASSED BY BOT COMPONENT VIA URL (see getBotId())
  // * botFullNAme_toUpdate: IS RETURNED BY THE DEPARTMENT OBJECT (see getBotById)
  edit() {
    console.log('BOT ID WHEN EDIT IS PRESSED ', this.id_dept);
    console.log('BOT FULL-NAME WHEN EDIT IS PRESSED ', this.deptName_toUpdate);
    console.log('BOT FAQ-KB WHEN EDIT IS PRESSED IF USER HAS SELECT ANOTHER FAQ-KB', this.selectedBotId);
    console.log('BOT FAQ-KB WHEN EDIT IS PRESSED IF USER ! DOES NOT SELECT A ANOTHER FAQ-KB', this.botId);

    // selectedFaqKbId
    // IF THE USER, WHEN EDIT THE BOT, DOESN'T SELECT ANY NEW FAQ-KB this.selectedFaqKbId IS UNDEFINED
    // SO SET this.faqKbEdit EQUAL TO THE FAQ-KB ID RETURNED BY getBotById
    if (this.selectedBotId === undefined) {

      this.botIdEdit = this.botId

    } else {
      this.botIdEdit = this.selectedBotId
    }
    // this.faqKbEdit
    this.mongodbDepartmentService.updateMongoDbDepartment(this.id_dept, this.deptName_toUpdate, this.botIdEdit ).subscribe((data) => {
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

        this.router.navigate(['/departments']);
      });

  }



}
