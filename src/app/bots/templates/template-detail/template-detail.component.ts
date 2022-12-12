import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from 'app/services/app-config.service';
import { DepartmentService } from 'app/services/department.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { UsersService } from 'app/services/users.service';

@Component({
  selector: 'appdashboard-template-detail',
  templateUrl: './template-detail.component.html',
  styleUrls: ['./template-detail.component.scss']
})


export class TemplateDetailComponent implements OnInit {
  // public templateName: string;
  // public templateDescription: string;

  public template: any

  public TESTSITE_BASE_URL: string;
  public project: any;
  public projectId: string;
  public projectName: string;
  public USER_ROLE: string;
  public botid: string;
  public botname: string;
  public templateid: string;
  public projectid: string;
  public depts_length: number;
  public DISPLAY_SELECT_DEPTS_WITHOUT_BOT: boolean;
  public dept_id: string;
  public PRESENTS_MODAL_ATTACH_BOT_TO_DEPT: boolean = false;
  public depts_without_bot_array = [];
  public displayInfoModal = 'none';
  public SHOW_CIRCULAR_SPINNER = false;
  public CREATE_BOT_ERROR: boolean;
  public displayModalAttacchBotToDept: string;
  public HAS_CLICKED_HOOK_BOOT_TO_DEPT: boolean = false;
  public HAS_COMPLETED_HOOK_BOOT_TO_DEPT: boolean = false;
  public HAS_COMPLETED_HOOK_BOOT_TO_DEPT_SUCCESS: boolean = false;
  public HAS_COMPLETED_HOOK_BOOT_TO_DEPT_ERROR: boolean = false;
  public selected_dept_id: string;
  public selected_dept_name: string;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<TemplateDetailComponent>,
    public appConfigService: AppConfigService,
    private logger: LoggerService,
    public auth: AuthService,
    private usersService: UsersService,
    private faqKbService: FaqKbService,
    private router: Router,
    public dialog: MatDialog,
    private departmentService: DepartmentService,
  ) {
    console.log('[TEMPLATE DETAIL]', data)
    this.projectid = data.projectId
    this.template = data.template;
    console.log('[TEMPLATE DETAIL] template ', this.template)
    console.log('[TEMPLATE DETAIL] projectid ', this.projectid)
    if (this.template) {
      this.botname = this.template.name
      this.templateid = this.template._id
    }
    // this.templateName = data.name
    // console.log('TemplateDetailComponent templateName ' ,this.templateName)
    // this.templateDescription = data.description
  }

  ngOnInit(): void {
    this.getTestSiteUrl()
    this.getCurrentProject()
    this.getProjectUserRole()
    this.getDeptsByProjectId()
  }

  getDeptsByProjectId() {
    this.departmentService.getDeptsByProjectId().subscribe((departments: any) => {

      console.log('[TEMPLATE DETAIL] - DEPTS RES ', departments);

      if (departments) {
        this.depts_length = departments.length
        console.log('[TEMPLATE DETAIL] - DEPTS LENGHT ', this.depts_length);

        if (this.depts_length === 1) {
          this.DISPLAY_SELECT_DEPTS_WITHOUT_BOT = false
          this.dept_id = departments[0]['_id']

          console.log('[TEMPLATE DETAIL] - DEFAULT DEPT HAS BOT ', departments[0].hasBot);
          if (departments[0].hasBot === true) {

            console.log('[TEMPLATE DETAIL] - DEFAULT DEPT HAS BOT ');
            console.log('[TEMPLATE DETAIL] - DEFAULT DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);
          } else {

            this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT = true;
            console.log('[TEMPLATE DETAIL] - DEFAULT DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);
          }
        }

        if (this.depts_length > 1) {
          this.DISPLAY_SELECT_DEPTS_WITHOUT_BOT = true;
          departments.forEach(dept => {

            if (dept.hasBot === true) {
              console.log('[TEMPLATE DETAIL] - DEPT HAS BOT ');

              console.log('[TEMPLATE DETAIL] - DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);
            } else {

              this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT = true;

              console.log('[TEMPLATE DETAIL] - DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);

              this.depts_without_bot_array.push({ id: dept._id, name: dept.name })
            }
          });

          console.log('[TEMPLATE DETAIL] - DEPT ARRAY OF DEPT WITHOUT BOT ', this.depts_without_bot_array);
        }

      }
    }, error => {

      this.logger.error('[TEMPLATE DETAIL] - DEPTS RES - ERROR', error);
    }, () => {
      this.logger.log('[TEMPLATE DETAIL] - DEPTS RES * COMPLETE *')

    });
  }


  getProjectUserRole() {
    this.usersService.project_user_role_bs

      .subscribe((user_role) => {

        if (user_role) {
          this.USER_ROLE = user_role
          console.log('[TEMPLATE DETAIL] user_role ', user_role);
        }
      });
  }

  getCurrentProject() {
    // this.project = this.auth.project_bs.value;
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.project = project
        console.log('[TEMPLATE DETAIL] project from AUTH service subscription ', this.project);
        this.projectId = project._id;
        this.projectName = project.name;

      }
    });
  }

  getTestSiteUrl() {
    this.TESTSITE_BASE_URL = this.appConfigService.getConfig().testsiteBaseUrl;
    this.logger.log('[TEMPLATE DETAIL] AppConfigService getAppConfig TESTSITE_BASE_URL', this.TESTSITE_BASE_URL);
  }

  openTestSiteInPopupWindow() {
    const url = this.TESTSITE_BASE_URL + '?tiledesk_projectid=' + "635b97cc7d7275001a2ab3e0" + '&project_name=' + this.projectName + '&role=' + this.USER_ROLE
    let params = `toolbar=no,menubar=no,width=815,height=727,left=100,top=100`;
    window.open(url, '_blank', params);
  }

  // (dovrebbe funzionare anche con POST ../PROJECT_ID/bots/fork/ID_FAQ_FB/)
  forkTemplate() {
    this.displayInfoModal = 'block'
    this.SHOW_CIRCULAR_SPINNER = true;

    console.log('[TEMPLATE DETAIL] - FORK TEMPLATE - TEMPLATE ID', this.templateid);
    this.faqKbService.installTemplate(this.templateid, this.projectid).subscribe((res: any) => {
      console.log('[TEMPLATE DETAIL] - FORK TEMPLATE RES', res);
      this.botid = res.bot_id
      // console.log('[BOTS-TEMPLATES] - FORK TEMPLATE RES - botid ',  this.botid);

    }, (error) => {
      console.error('[TEMPLATE DETAIL] FORK TEMPLATE - ERROR ', error);

      this.SHOW_CIRCULAR_SPINNER = false;
      this.CREATE_BOT_ERROR = true;
    }, () => {
      console.log('[TEMPLATE DETAIL]FORK TEMPLATE COMPLETE');
      // this.goToBotDtls(this.botid, 'tilebot', this.botname) 
      // http://localhost:4200/#/project/625830e51976f200353fce7b/bots/intents/63959c3e7adf790035bbc4aa/native

      this.SHOW_CIRCULAR_SPINNER = false;
      this.CREATE_BOT_ERROR = false;
      // this.router.navigate(['project/' + this.projectid + '/tilebot/general/', this.botid, 'tilebot']);
      // this.router.navigate(['project/' + this.projectid + '/bots/intents/', this.botid, 'tilebot']);
      // this.closeDialog()
    });
  }

  closeDialog() {
    this.dialogRef.close()
  }

  closeCreateBotInfoModal() {
    this.displayInfoModal = 'none';
    this.CREATE_BOT_ERROR = null;
  }


  goToBotDetails() {
    if (this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT === false) {
      this.router.navigate(['project/' + this.projectid + '/bots/intents/', this.botid, 'tilebot']);
    } else {
      this.present_modal_attacch_bot_to_dept()
    }
  }

  present_modal_attacch_bot_to_dept() {
    this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT = false
    this.displayModalAttacchBotToDept = 'block'
    // this.closeCreateBotInfoModal();
  }


  onSelectDepartment() {
   console.log('[TEMPLATE DETAIL] - selected_dept_id ', this.selected_dept_id);
    this.dept_id = this.selected_dept_id
    const hasFound = this.depts_without_bot_array.filter((obj: any) => {
      return obj.id === this.selected_dept_id;
    });
    console.log('[TEMPLATE DETAIL] private logger: LoggerService --->  onSelectBotId dept found', hasFound);

    if (hasFound.length > 0) {
      this.selected_dept_name = hasFound[0]['name']
    }
  }

  onCloseModalAttacchBotToDept() {
    this.router.navigate(['project/' + this.projectid + '/bots/intents/', this.botid, 'tilebot']);
  }

  hookBotToDept() {
    this.HAS_CLICKED_HOOK_BOOT_TO_DEPT = true;
    this.departmentService.updateExistingDeptWithSelectedBot(this.dept_id, this.botid).subscribe((res) => {
      console.log('[TEMPLATE DETAIL] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - RES ', res);
    }, (error) => {
      console.error('[TEMPLATE DETAIL] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - ERROR ', error);

      this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT = true
      this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT_ERROR = true;

      console.log('[TEMPLATE DETAIL] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - ERROR - HAS_COMPLETED_HOOK_BOOT_TO_DEPT', this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT);
    }, () => {
      console.log('[TEMPLATE DETAIL] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - COMPLETE ');

      this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT = true
      this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT_SUCCESS = true;
      console.log('[TEMPLATE DETAIL] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - COMPLETE - HAS_COMPLETED_HOOK_BOOT_TO_DEPT', this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT);
    });
  }


}
