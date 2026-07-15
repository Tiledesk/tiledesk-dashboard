import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from 'app/services/app-config.service';
import { DepartmentService } from 'app/services/department.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'appdashboard-modal-confirm-goto-cds',
  templateUrl: './modal-confirm-goto-cds.component.html',
  styleUrls: ['./modal-confirm-goto-cds.component.scss']
})


export class ModalConfirmGotoCdsComponent implements OnInit, OnDestroy {
  chatbot: any;
  chatbotName: string;
  panelOpenState = false;
  WIDGET_URL: string;
  projectId: string;
  defaultDeptId: string;
  has_copied = false;
  hasClickedInstallBtn: boolean = false
  hasClickedEditBtn: boolean = false
  private unsubscribe$ = new Subject<void>();



  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalConfirmGotoCdsComponent>,
    private logger: LoggerService,
    public appConfigService: AppConfigService,
    private auth: AuthService,
    private clipboard: Clipboard,
    public router: Router,
    private departmentService: DepartmentService,

  ) {
    if (data && data.chatbot) {
      this.chatbot = data.chatbot
      this.logger.log('[MODAL-CONFIRM-GOTO-CDS] data > chatbot', this.chatbot)

      this.chatbotName = this.chatbot.name
      this.logger.log('[MODAL-CONFIRM-GOTO-CDS] data > chatbotName', this.chatbotName)
    }
  }

  ngOnInit(): void {
    this.getCurrentProject();
    this.getWidgetUrl();
    this.getDefaultDept();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getCurrentProject() {
    this.auth.project_bs
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((project) => {
        if (project) {
          this.projectId = project._id;
        }
        this.logger.log('[MODAL-CONFIRM-GOTO-CDS] projectId  ', this.projectId);
      });
  }

  getDefaultDept(): void {
    this.departmentService.getDeptsByProjectId()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (departments: any[]) => {
          if (!Array.isArray(departments) || !departments.length) {
            this.defaultDeptId = null;
            return;
          }

          if (departments.length === 1) {
            this.defaultDeptId = departments[0]?._id;
            this.logger.log('[MODAL-CONFIRM-GOTO-CDS] default dept (single)', this.defaultDeptId);
            return;
          }

          const defaultDept = departments.find((dept: any) => dept?.default === true);
          this.defaultDeptId = defaultDept?._id || null;
          this.logger.log('[MODAL-CONFIRM-GOTO-CDS] default dept', this.defaultDeptId);
        },
        error: (error) => {
          this.logger.error('[MODAL-CONFIRM-GOTO-CDS] getDefaultDept ERROR', error);
          this.defaultDeptId = null;
        },
      });
  }

  get installScriptLines(): string[] {
    return this.buildInstallScriptLines();
  }

  hasClickedInstall() {
    this.logger.log('[MODAL-CONFIRM-GOTO-CDS] AppConfigService hasClickedInstall ')
    this.hasClickedInstallBtn = true;
  }

  hasClickedBackFromInstall() {
    
    this.hasClickedInstallBtn = false;
    this.hasClickedEditBtn = false;
    this.logger.log('[MODAL-CONFIRM-GOTO-CDS] AppConfigService hasClickedBackFromInstall hasClickedInstallBtn ', this.hasClickedInstallBtn)
    this.logger.log('[MODAL-CONFIRM-GOTO-CDS] AppConfigService hasClickedBackFromInstall hasClickedEditBtn ', this.hasClickedEditBtn)
  }

  hasClickedEdit() {
    this.logger.log('[MODAL-CONFIRM-GOTO-CDS] AppConfigService hasClickedEdit ')
    this.hasClickedEditBtn = true;
  }

  getWidgetUrl() {
    this.WIDGET_URL = this.appConfigService.getConfig().WIDGET_BASE_URL + 'launch.js';
    this.logger.log('[MODAL-CONFIRM-GOTO-CDS] AppConfigService getAppConfig WIDGET_URL ', this.WIDGET_URL)
  }


  copyToClipboard() {
    this.has_copied = true;
    setTimeout(() => {
      this.has_copied = false;
    }, 2000);

    this.clipboard.copy(this.installScriptLines.join('\n'));
  }

  private buildInstallScriptLines(): string[] {
    const settingsEntries: string[] = [`\t projectid: "${this.projectId}"`];

    if (this.defaultDeptId) {
      settingsEntries.push(`\t departmentID: "${this.defaultDeptId}"`);
    }

    if (this.chatbot?._id) {
      settingsEntries.push(`\t participants: "bot_${this.chatbot._id}"`);
    }

    const settingsLines = settingsEntries.map((line, index) => (
      index < settingsEntries.length - 1 ? `${line},` : line
    ));

    return [
      '<script type="application/javascript">',
      '   window.tiledeskSettings=',
      '   {',
      ...settingsLines,
      '   };',
      '   (function(d, s, id) {',
      '      var w=window; var d=document; var i=function(){i.c(arguments);};',
      '      i.q=[]; i.c=function(args){i.q.push(args);}; w.Tiledesk=i;',
      '      var js, fjs=d.getElementsByTagName(s)[0];',
      '      if (d.getElementById(id)) return;',
      '      js=d.createElement(s);',
      '      js.id=id; js.async=true; js.src="' + this.WIDGET_URL + '";',
      '      fjs.parentNode.insertBefore(js, fjs);',
      "   }(document,'script','tiledesk-jssdk'));",
      '</script>',
    ];
  }


  goToWidgetInstallation() {
    this.dialogRef.close();
    this.router.navigate(['project/' + this.projectId + '/installation'])
  }

  onOkPresssed() {
    this.dialogRef.close({ chatbot: this.chatbot });
  }

  goToCDSBlock() {
    this.logger.log('goToCDSBlock')
    this.dialogRef.close({ chatbot: this.chatbot, redirectTo: 'block' });
  }

  goToCDSSettings() {
    this.logger.log('goToCDSSettings')
    this.dialogRef.close({ chatbot: this.chatbot, redirectTo: 'settings' });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
