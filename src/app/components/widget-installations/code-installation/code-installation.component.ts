import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from 'app/services/app-config.service';

@Component({
  selector: 'appdashboard-code-installation',
  templateUrl: './code-installation.component.html',
  styleUrls: ['./code-installation.component.scss']
})
export class CodeInstallationComponent implements OnInit {
  has_copied = false;
  id_project: string;
  WIDGET_URL: string;

  constructor(
    private auth: AuthService,
    public appConfigService: AppConfigService
  ) { }

  ngOnInit() {
    this. getWidgetUrl();
    this.getCurrentProject();
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.id_project = project._id
      }
    });
  }

  getWidgetUrl() {
    this.WIDGET_URL = this.appConfigService.getConfig().WIDGET_BASE_URL + 'launch.js';
  // console.log('[WIDGET-INSTALLATION] getAppConfig WIDGET_URL ', this.WIDGET_URL)
  }


  copyToClipboard() {
    document.querySelector('textarea').select();
    document.execCommand('copy');

    this.has_copied = true;
    setTimeout(() => {
      this.has_copied = false;
    }, 2000);
  }
}