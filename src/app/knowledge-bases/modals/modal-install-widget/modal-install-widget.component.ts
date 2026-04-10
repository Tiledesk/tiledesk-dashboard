import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';
import { AppConfigService } from 'app/services/app-config.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { Router } from '@angular/router';
import { TILEDESK_JSSDK_SCRIPT_ID, WIDGET_LAUNCH_JS_FILENAME } from 'app/utils/constants';

@Component({
  selector: 'appdashboard-modal-install-widget',
  templateUrl: './modal-install-widget.component.html',
  styleUrls: ['./modal-install-widget.component.scss']
})
export class ModalInstallWidgetComponent implements OnInit {
  WIDGET_URL: string;
  projectId: string;
  participants: string;
  departmentID: string;
  has_copied = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalInstallWidgetComponent>,
    private logger: LoggerService,
    public appConfigService: AppConfigService,
    private clipboard: Clipboard,
    public router: Router,
  ) {}

  ngOnInit(): void {
    this.getWidgetUrl();
    this.projectId = this.data?.projectId;
    this.participants = this.data?.participants;
    this.departmentID = this.data?.departmentID;
  }

  private getWidgetUrl() {
    this.WIDGET_URL = this.appConfigService.getConfig().WIDGET_BASE_URL + WIDGET_LAUNCH_JS_FILENAME;
  }

  copyToClipboard() {
    this.has_copied = true;
    setTimeout(() => {
      this.has_copied = false;
    }, 2000);

    const projectId = this.projectId ?? '';
    const widgetUrl = this.WIDGET_URL ?? '';
    const participants = this.participants;
    const departmentID = this.departmentID;

    this.clipboard.copy(
      `<script type="application/javascript">
  window.tiledeskSettings=
  {
    projectid: "${projectId}"${participants ? `,\n    participants: "${participants}"` : ''}${departmentID ? `,\n    departmentID: "${departmentID}"` : ''}
  };
  (function(d, s, id) {
    var w=window; var d=document; var i=function(){i.c(arguments);};
    i.q=[]; i.c=function(args){i.q.push(args);}; w.Tiledesk=i;
    var js, fjs=d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js=d.createElement(s);
    js.id=id; js.async=true; js.src="${widgetUrl}";
    fjs.parentNode.insertBefore(js, fjs);
  }(document,'script','${TILEDESK_JSSDK_SCRIPT_ID}'));
</script>`
    );
  }

  goToWidgetInstallation() {
    if (!this.projectId) {
      this.logger.warn('[MODAL-INSTALL-WIDGET] Missing projectId, cannot navigate to installations page.');
      return;
    }
    this.dialogRef.close();
    this.router.navigate(['project/' + this.projectId + '/installation']);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

