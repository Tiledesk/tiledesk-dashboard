import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from 'app/services/app-config.service';
import { BrandService } from 'app/services/brand.service';
import { URL_google_tag_manager_add_tiledesk_to_your_sites } from '../utils/util';

@Component({
  selector: 'appdashboard-widget-installation',
  templateUrl: './widget-installation.component.html',
  styleUrls: ['./widget-installation.component.scss']
})
export class WidgetInstallationComponent implements OnInit {

  IS_OPEN_SETTINGS_SIDEBAR: boolean;
  isChromeVerGreaterThan100: boolean;
  has_copied = false;
  WIDGET_URL: string;
  HAS_SELECT_INSTALL_WITH_CODE: boolean = false;
  HAS_SELECT_INSTALL_WITH_GTM: boolean = false;
  tparams: any;
  company_name: any;
  id_project: string;
  constructor( 
     private auth: AuthService,
     public appConfigService: AppConfigService,
     public brandService: BrandService
    ) { 
      const brand = brandService.getBrand();
      this.tparams = brand;
      this.company_name = brand['company_name'];

     }

  ngOnInit() {
    this.getBrowserVersion();
    this.listenSidebarIsOpened()
    this. getWidgetUrl()
    this.getAndManageAccordionInstallWidget();
    this.getCurrentProject()
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.id_project = project._id
      }
    });
  }

  getWidgetUrl() {
    this.WIDGET_URL = this.appConfigService.getConfig().widgetUrl;
  // console.log('[WIDGET-INSTALLATION] getAppConfig WIDGET_URL ', this.WIDGET_URL)
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  console.log("[WIDGET-INSTALLATION] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }

  listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
    //  console.log('[WIDGET-INSTALLATION] SETTINGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    });
  }


  getAndManageAccordionInstallWidget() {
    var acc = document.getElementsByClassName("accordion-install-widget");

    // console.log('[WIDGET-INSTALLATION] ACCORDION INSTALL WIDGET', acc);

    var i: number;
    for (i = 0; i < acc.length; i++) {
    // console.log('[WIDGET-INSTALLATION] ACCORDION ARROW - INSTALL WIDGET - QUI ENTRO');
    // console.log('[WIDGET-INSTALLATION] ACCORDION ARROW - INSTALL WIDGET - acc[i]', acc[i]);

      const self = this;
      var firstAccordion = acc[0];
      var firstPanel = <HTMLElement>firstAccordion.nextElementSibling;
      firstAccordion.classList.add("active");
      firstPanel.style.maxHeight = firstPanel.scrollHeight + "px";
      acc[i].addEventListener("click", function () {

        this.classList.toggle("active-install-widget");

        var panel = this.nextElementSibling;
        // this.logger.log('[WIDGET-INSTALLATION] ACCORDION ARROW - INSTALL WIDGET - panel', panel);

        var arrow_icon_div = this.children[1];
        // console.log('[WIDGET-INSTALLATION] ACCORDION ARROW - INSTALL WIDGET - ICON WRAP DIV', arrow_icon_div);

        var arrow_icon = arrow_icon_div.children[0]
        // console.log('[WIDGET-INSTALLATION] ACCORDION ARROW ICON', arrow_icon);
        arrow_icon.classList.toggle("arrow-up-install-widget");

        if (panel.style.maxHeight) {
          panel.style.maxHeight = null;

        } else {
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });
    }
  }

  copyToClipboard() {
    document.querySelector('textarea').select();
    document.execCommand('copy');

    this.has_copied = true;
    setTimeout(() => {
      this.has_copied = false;
    }, 2000);
  }

  close_panel_install_widget() {
    this.HAS_SELECT_INSTALL_WITH_CODE = false;
    this.HAS_SELECT_INSTALL_WITH_GTM = false
  // console.log('[WIDGET-INSTALLATION] close_panel_install_widget HAS_SELECT_INSTALL_WITH_CODE', this.HAS_SELECT_INSTALL_WITH_CODE)

  }


  installWithCode() {
    // this.HAS_SELECT_INSTALL_WITH_CODE = true;
    // this.HAS_SELECT_INSTALL_WITH_GTM = false;
    this.HAS_SELECT_INSTALL_WITH_GTM = false;
    if (this.HAS_SELECT_INSTALL_WITH_CODE === false) {
      this.HAS_SELECT_INSTALL_WITH_CODE = true;
    } else if (this.HAS_SELECT_INSTALL_WITH_CODE === true) {
      this.HAS_SELECT_INSTALL_WITH_CODE = false;
    }

    // console.log('[WIDGET-INSTALLATION] installWithCode HAS_SELECT_INSTALL_WITH_CODE', this.HAS_SELECT_INSTALL_WITH_CODE)
  }

  installWithGTM() {
    // this.HAS_SELECT_INSTALL_WITH_CODE = false;
    // this.HAS_SELECT_INSTALL_WITH_GTM = true;
    this.HAS_SELECT_INSTALL_WITH_CODE = false;
    if (this.HAS_SELECT_INSTALL_WITH_GTM === false) {
      this.HAS_SELECT_INSTALL_WITH_GTM = true;
    } else if (this.HAS_SELECT_INSTALL_WITH_GTM === true) {
      this.HAS_SELECT_INSTALL_WITH_GTM = false;
    }

    // console.log('[WIDGET-INSTALLATION] installWithCode HAS_SELECT_INSTALL_WITH_GTM', this.HAS_SELECT_INSTALL_WITH_GTM)
  }

  goToInstallWithTagManagerDocs() {
    const url = URL_google_tag_manager_add_tiledesk_to_your_sites;
    window.open(url, '_blank');
  }

}