import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppConfigService } from 'app/services/app-config.service';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'appdashboard-modal-install-on-website',
  templateUrl: './modal-install-on-website.component.html',
  styleUrls: ['./modal-install-on-website.component.scss'],
})
export class ModalInstallOnWebsiteComponent implements OnInit {
  WIDGET_URL: string;
  projectId: string;
  has_copied = false;

  constructor(
    public dialogRef: MatDialogRef<ModalInstallOnWebsiteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title?: string; projectId?: string } | null,
    public appConfigService: AppConfigService,
    private clipboard: Clipboard,
  ) {}

  ngOnInit(): void {
    this.projectId = this.data?.projectId;
    this.WIDGET_URL = this.appConfigService.getConfig().WIDGET_BASE_URL + 'launch.js';
  }

  copyToClipboard() {
    this.has_copied = true;
    setTimeout(() => {
      this.has_copied = false;
    }, 2000);

    this.clipboard.copy(
      `<script type="application/javascript">
  window.tiledeskSettings=
  {
    projectid: "${this.projectId}"
  };
  (function(d, s, id) {
    var w=window; var d=document; var i=function(){i.c(arguments);};
    i.q=[]; i.c=function(args){i.q.push(args);}; w.Tiledesk=i;
    var js, fjs=d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js=d.createElement(s);
    js.id=id; js.async=true; js.src="${this.WIDGET_URL}";
    fjs.parentNode.insertBefore(js, fjs);
  }(document,'script','tiledesk-jssdk'));
</script>`
    );
  }

  close(): void {
    this.dialogRef.close();
  }
}

