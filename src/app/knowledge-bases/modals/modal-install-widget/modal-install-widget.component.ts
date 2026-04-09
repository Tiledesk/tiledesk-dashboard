import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from 'app/services/app-config.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { Router } from '@angular/router';

@Component({
  selector: 'appdashboard-modal-install-widget',
  templateUrl: './modal-install-widget.component.html',
  styleUrls: ['./modal-install-widget.component.scss']
})
export class ModalInstallWidgetComponent implements OnInit {
  WIDGET_URL: string;
  projectId: string;
  has_copied = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalInstallWidgetComponent>,
    private logger: LoggerService,
    public appConfigService: AppConfigService,
    private auth: AuthService,
    private clipboard: Clipboard,
    public router: Router,
  ) {}

  ngOnInit(): void {
    this.getCurrentProject();
    this.getWidgetUrl();
  }

  private getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project?._id) {
        this.projectId = project._id;
      }
    });
  }

  private getWidgetUrl() {
    this.WIDGET_URL = this.appConfigService.getConfig().WIDGET_BASE_URL + 'launch.js';
  }

  copyToClipboard() {
    this.has_copied = true;
    setTimeout(() => {
      this.has_copied = false;
    }, 2000);

    const projectId = this.projectId ?? '';
    const widgetUrl = this.WIDGET_URL ?? '';

    this.clipboard.copy(
      `<script type="application/javascript">
  window.tiledeskSettings=
  {
    projectid: "${projectId}"
  };
  (function(d, s, id) {
    var w=window; var d=document; var i=function(){i.c(arguments);};
    i.q=[]; i.c=function(args){i.q.push(args);}; w.Tiledesk=i;
    var js, fjs=d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js=d.createElement(s);
    js.id=id; js.async=true; js.src="${widgetUrl}";
    fjs.parentNode.insertBefore(js, fjs);
  }(document,'script','tiledesk-jssdk'));
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

