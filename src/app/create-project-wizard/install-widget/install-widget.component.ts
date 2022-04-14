import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { AuthService } from '../../core/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { slideInAnimation } from '../../_animations/index';
import { AppConfigService } from '../../services/app-config.service';
// import brand from 'assets/brand/brand.json';
import { BrandService } from '../../services/brand.service';
import { LoggerService } from '../../services/logger/logger.service';
import { WidgetService } from 'app/services/widget.service';
import { WidgetSetUpBaseComponent } from '../../widget_components/widget-set-up/widget-set-up-base/widget-set-up-base.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'appdashboard-install-widget',
  templateUrl: './install-widget.component.html',
  styleUrls: ['./install-widget.component.scss'],
  animations: [slideInAnimation],
  // tslint:disable-next-line:use-host-property-decorator
  host: { '[@slideInAnimation]': '' }
})

export class InstallWidgetComponent extends WidgetSetUpBaseComponent implements OnInit, OnDestroy {
  // tparams = brand;
  // logo_on_rocket = brand.wizard_install_widget_page.logo_on_rocket

  tparams: any;
  logo_on_rocket: string;

  projectName: string;
  projectId: string;
  sub: Subscription;
  has_copied = false;
  continue_btn_disabled: boolean = true; 

  // WIDGET_URL = environment.widgetUrl; // now get from appconfig
  WIDGET_URL: string;
  
  constructor(
    private auth: AuthService,
    private router: Router,
    public appConfigService: AppConfigService,
    public brandService: BrandService,
    private logger: LoggerService,
    private route: ActivatedRoute,
    private widgetService: WidgetService,
    public translate: TranslateService,
  ) { 
    super(translate);
    const brand = brandService.getBrand();
    this.tparams = brand;
    this.logo_on_rocket = brand['wizard_install_widget_page']['logo_on_rocket'];
    const selectLangCode = this.route.snapshot.params['langcode'];
    const selectLangName = this.route.snapshot.params['langname'];  
    this.logger.log('[WIZARD - INSTALL-WIDGET] selectLangCode in the previous step ', selectLangCode)
    this.logger.log('[WIZARD - INSTALL-WIDGET] selectLangName in the previous step ', selectLangName)
    this.addNewLanguage(selectLangCode, selectLangName)
  }

  addNewLanguage(selectLangCode: string, selectLangName: string) {
  
    // cloneLabel CHE RITORNERA IN RESPONSE LA NUOVA LINGUA (l'inglese nel caso non sia una delle nostre lingue pretradotte)
    this.widgetService.cloneLabel(selectLangCode.toUpperCase())
      .subscribe((res: any) => {
        // this.logger.log('Multilanguage - addNewLanguage - CLONE LABEL RES ', res);
        this.logger.log('[WIZARD - INSTALL-WIDGET] - ADD-NEW-LANG (clone-label) RES ', res.data);


      }, error => {
        this.continue_btn_disabled = false;
        this.logger.error('[WIZARD - INSTALL-WIDGET] ADD-NEW-LANG (clone-label) - ERROR ', error)
      }, () => {
        this.logger.log('[WIZARD - INSTALL-WIDGET] ADD-NEW-LANG (clone-label) * COMPLETE *')
        this.continue_btn_disabled = false;
      });

    // // ADD THE NEW LANGUAGE TO BOTTOM NAV
    const newLang = { code: selectLangCode, name: selectLangName };
    this.logger.log('[WIZARD - CONFIGURE-WIDGET] Multilanguage saveNewLanguage newLang objct ', newLang);

    this.availableTranslations.push(newLang)
    this.logger.log('[WIZARD - CONFIGURE-WIDGET] Multilanguage saveNewLanguage availableTranslations ', this.availableTranslations)
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
