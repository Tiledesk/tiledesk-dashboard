import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { AuthService } from '../core/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { slideInAnimation } from '../_animations/index';
import brand from 'assets/brand/brand.json';
import { AppConfigService } from '../services/app-config.service';

@Component({
  selector: 'appdashboard-install-tiledesk',
  templateUrl: './install-tiledesk.component.html',
  styleUrls: ['./install-tiledesk.component.scss'],
  animations: [slideInAnimation],
  // tslint:disable-next-line:use-host-property-decorator
  host: { '[@slideInAnimation]': '' }
})
export class InstallTiledeskComponent implements OnInit, OnDestroy {
  tparams = brand;
  logo_on_rocket = brand.wizard_install_widget_page.logo_on_rocket

  projectName: string;
  projectId: string;
  sub: Subscription;
  has_copied = false;

  // WIDGET_URL = environment.widgetUrl; // now get from appconfig
  WIDGET_URL: string;
  
  constructor(
    private auth: AuthService,
    private router: Router,
    public appConfigService: AppConfigService
  ) { }

  ngOnInit() {
    this.getCurrentProject();
    this.getWidgetUrl();
  }

  getWidgetUrl() {
    this.WIDGET_URL = this.appConfigService.getConfig().widgetUrl;
    console.log('AppConfigService getAppConfig (Install Tiledesk) WIDGET_URL ', this.WIDGET_URL)

  }

  getCurrentProject() {
    this.sub = this.auth.project_bs
      .subscribe((project) => {

        // console.log('00 -> InstallTiledeskComponent project from AUTH service subscription  ', project)

        if (project) {
          this.projectId = project._id;
          this.projectName = project.name;

        }
        console.log('InstallTiledeskComponent projectId  ', this.projectId);
        console.log('InstallTiledeskComponent projectName  ', this.projectName);
      });
  }

  copyToClipboard() {
    document.querySelector('textarea').select();
    document.execCommand('copy');

    this.has_copied = true;
    setTimeout(() => {
      this.has_copied = false;
    }, 2000);
  }


  continueToHome() {
    this.router.navigate([`/project/${this.projectId}/home`]);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
