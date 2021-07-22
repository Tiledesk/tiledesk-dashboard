import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { slideInAnimation } from '../../_animations/index';
import { AppConfigService } from '../../services/app-config.service';
// import brand from 'assets/brand/brand.json';
import { BrandService } from '../../services/brand.service';
import { LoggerService } from '../../services/logger/logger.service';

@Component({
  selector: 'appdashboard-install-widget',
  templateUrl: './install-widget.component.html',
  styleUrls: ['./install-widget.component.scss'],
  animations: [slideInAnimation],
  // tslint:disable-next-line:use-host-property-decorator
  host: { '[@slideInAnimation]': '' }
})
export class InstallWidgetComponent implements OnInit, OnDestroy {
  // tparams = brand;
  // logo_on_rocket = brand.wizard_install_widget_page.logo_on_rocket

  tparams: any;
  logo_on_rocket: string;

  projectName: string;
  projectId: string;
  sub: Subscription;
  has_copied = false;

  // WIDGET_URL = environment.widgetUrl; // now get from appconfig
  WIDGET_URL: string;
  
  constructor(
    private auth: AuthService,
    private router: Router,
    public appConfigService: AppConfigService,
    public brandService: BrandService,
    private logger: LoggerService
  ) { 
    const brand = brandService.getBrand();
    this.tparams = brand;
    this.logo_on_rocket = brand['wizard_install_widget_page']['logo_on_rocket'];
  }

  ngOnInit() {
    this.getCurrentProject();
    this.getWidgetUrl();
  }

  getWidgetUrl() {
    this.WIDGET_URL = this.appConfigService.getConfig().widgetUrl;
    this.logger.log('[WIZARD - INSTALL-WIDGET] AppConfigService getAppConfig WIDGET_URL ', this.WIDGET_URL)
  }

  getCurrentProject() {
    this.sub = this.auth.project_bs
      .subscribe((project) => {

        if (project) {
          this.projectId = project._id;
          this.projectName = project.name;
        }

        this.logger.log('[WIZARD - INSTALL-WIDGET] projectId  ', this.projectId);
        this.logger.log('[WIZARD - INSTALL-WIDGET] projectName  ', this.projectName);
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
