import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from 'app/services/app-config.service';
import { BotLocalDbService } from 'app/services/bot-local-db.service';
import { DepartmentService } from 'app/services/department.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { LocalDbService } from 'app/services/users-local-db.service';
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
  public _newlyCreatedProject: boolean;
  public defaultDeptID: string;
  // public depts_length: number;
  // public DISPLAY_SELECT_DEPTS_WITHOUT_BOT: boolean;
  // public dept_id: string;
  // public PRESENTS_MODAL_ATTACH_BOT_TO_DEPT: boolean = false;
  // public depts_without_bot_array = [];
  // public displayInfoModal = 'none';
  // public SHOW_CIRCULAR_SPINNER = false;
  // public CREATE_BOT_ERROR: boolean;
  // public displayModalAttacchBotToDept: string;
  // public HAS_CLICKED_HOOK_BOOT_TO_DEPT: boolean = false;
  // public HAS_COMPLETED_HOOK_BOOT_TO_DEPT: boolean = false;
  // public HAS_COMPLETED_HOOK_BOOT_TO_DEPT_SUCCESS: boolean = false;
  // public HAS_COMPLETED_HOOK_BOOT_TO_DEPT_ERROR: boolean = false;
  // public selected_dept_id: string;
  // public selected_dept_name: string;
  // translateparamBotName: any;
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
    private localDbService: LocalDbService,
    private botLocalDbService: BotLocalDbService,
  ) {
    // console.log('[TEMPLATE DETAIL] data ', data)
    this.projectid = data.projectId
    this.template = data.template;
    this._newlyCreatedProject =  data.newlyCreatedProject
    // console.log('[TEMPLATE DETAIL] template ', this.template)
    // console.log('[TEMPLATE DETAIL] projectid ', this.projectid)
    if (this.template) {
      this.botname = this.template.name
      this.templateid = this.template._id
      // this.translateparamBotName = { bot_name: this.botname }
    }
    // this.templateName = data.name
    // console.log('TemplateDetailComponent templateName ' ,this.templateName)
    // this.templateDescription = data.description
  }

  ngOnInit(): void {
    this.getTestSiteUrl()
    this.getCurrentProjectAndThenGetDeptsByProjectId()
    this.getProjectUserRole()
    
  }

  getCurrentProjectAndThenGetDeptsByProjectId() {
    // this.project = this.auth.project_bs.value;
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.project = project
        // console.log('[TEMPLATE DETAIL] project from AUTH service subscription ', this.project);
        this.projectId = project._id;
        this.projectName = project.name;
        this.getDeptsByProjectId()
      }
    });
  }

  getDeptsByProjectId() {
    this.departmentService.getDeptsByProjectId().subscribe((departments: any) => {

      // console.log('[TEMPLATE DETAIL] - DEPTS RES ', departments);

      if (departments && departments.length === 1) {
        this.defaultDeptID = departments[0]._id
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
          // console.log('[TEMPLATE DETAIL] user_role ', user_role);
        }
      });
  }

  getTestSiteUrl() {
    this.TESTSITE_BASE_URL = this.appConfigService.getConfig().testsiteBaseUrl;
    this.logger.log('[TEMPLATE DETAIL] AppConfigService getAppConfig TESTSITE_BASE_URL', this.TESTSITE_BASE_URL);
  }

  openTestSiteInPopupWindow() {
    // console.log('openTestSiteInPopupWindow TESTSITE_BASE_URL', this.TESTSITE_BASE_URL)
    const testItOutBaseUrl = this.TESTSITE_BASE_URL.substring(0, this.TESTSITE_BASE_URL.lastIndexOf('/'));
    const testItOutUrl = testItOutBaseUrl + '/chatbot-panel.html'
    const url = testItOutUrl + '?tiledesk_projectid=' + "635b97cc7d7275001a2ab3e0" + '&tiledesk_participants=bot_' + this.templateid + "&tiledesk_departmentID=635b97cc7d7275001a2ab3e4"
    // console.log('openTestSiteInPopupWindow URL ', url)
    let params = `toolbar=no,menubar=no,width=815,height=727,left=100,top=100`;
    window.open(url, '_blank', params);
  }

 
  forkTemplate() {
    this.faqKbService.installTemplate(this.templateid, this.projectid).subscribe((res: any) => {
      this.logger.log('[TEMPLATE DETAIL] - FORK TEMPLATE RES', res);
      this.botid = res.bot_id
    
    }, (error) => {
      this.logger.error('[TEMPLATE DETAIL] FORK TEMPLATE - ERROR ', error);

    }, () => {
      this.logger.log('[TEMPLATE DETAIL] FORK TEMPLATE COMPLETE');
      if (this._newlyCreatedProject) {
        this.hookBotToDept()
      }
    
      this.getFaqKbById(this.botid);
      this.goToBotDetails()
    
    });
  }

   hookBotToDept() {
    this.departmentService.updateExistingDeptWithSelectedBot(this.defaultDeptID, this.botid).subscribe((res) => {
      this.logger.log('[TEMPLATE DETAIL] Bot Create - UPDATE DEFAULT DEPT WITH FORKED BOT - RES ', res);
    }, (error) => {
      this.logger.error('[TEMPLATE DETAIL] Bot Create - UPDATE DEFAULT DEPT WITH FORKED BOT - ERROR ', error);
    }, () => {
      this.logger.log('[TEMPLATE DETAIL] Bot Create - UPDATE DEFAULT DEPT WITH FORKED BOT - COMPLETE ');
    });
  }

  getFaqKbById(botid) {
    this.faqKbService.getFaqKbById(botid).subscribe((faqkb: any) => {
      this.logger.log('[TEMPLATE DETAIL] GET FAQ-KB (DETAILS) BY ID (SUBSTITUTE BOT) ', faqkb);

      this.botLocalDbService.saveBotsInStorage(botid, faqkb);

    }, (error) => {
      this.logger.error('[TEMPLATE DETAIL] GET FAQ-KB BY ID (SUBSTITUTE BOT) - ERROR ', error);
    }, () => {
      this.logger.log('[TEMPLATE DETAIL] GET FAQ-KB ID (SUBSTITUTE BOT) - COMPLETE ');
    });
  }


  goToBotDetails() {
    // if (this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT === false) {
      this.router.navigate(['project/' + this.projectid + '/tilebot/intents/', this.botid, 'tilebot']);
      this.closeDialog();
      // this.closeCreateBotInfoModal();
    // } else {
    //   this.present_modal_attacch_bot_to_dept()
    // }
  }

  closeDialog() {
    this.dialogRef.close()
  }

  // closeCreateBotInfoModal() {
  //   this.displayInfoModal = 'none';
  //   this.CREATE_BOT_ERROR = null;
  // }




  // present_modal_attacch_bot_to_dept() {
  //   this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT = false
  //   this.displayModalAttacchBotToDept = 'block'
  //   this.closeCreateBotInfoModal();
  // }


  // onSelectDepartment() {
  //   console.log('[TEMPLATE DETAIL] - selected_dept_id ', this.selected_dept_id);
  //   this.dept_id = this.selected_dept_id
  //   const hasFound = this.depts_without_bot_array.filter((obj: any) => {
  //     return obj.id === this.selected_dept_id;
  //   });
  //   console.log('[TEMPLATE DETAIL] private logger: LoggerService --->  onSelectBotId dept found', hasFound);

  //   if (hasFound.length > 0) {
  //     this.selected_dept_name = hasFound[0]['name']
  //   }
  // }

  // onCloseModalAttacchBotToDept() {
  //   this.router.navigate(['project/' + this.projectid + '/tilebot/intents/', this.botid, 'tilebot']);
  //   this.closeDialog();
  //   this.displayModalAttacchBotToDept = 'none'
  // }

  // hookBotGoToBotDetails() {
  //   this.router.navigate(['project/' + this.projectid + '/tilebot/intents/', this.botid, 'tilebot']);
  //   this.closeDialog();
  //   this.displayModalAttacchBotToDept = 'none'
  // }

 


}
