import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { BrandService } from 'app/services/brand.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'appdashboard-chatbots',
  templateUrl: './chatbots.component.html',
  styleUrls: ['./chatbots.component.scss']
})
export class ChatbotsComponent implements OnInit {

  public IS_OPEN_SETTINGS_SIDEBAR: boolean;

  isChromeVerGreaterThan100: boolean;
  translateparams: any;

  // Bots Sidebar
  allTemplatesCount: number;
  allCommunityTemplatesCount: number;
  customerSatisfactionTemplatesCount: number;
  increaseSalesTemplatesCount: number;
  customerSatisfactionBotsCount: number;
  myChatbotOtherCount: number;
  increaseSalesBotsCount: number;

  constructor(
    private auth: AuthService,
    private brand: BrandService,
    private faqKbService: FaqKbService,
    private logger: LoggerService,
  ) {
    const _brand = this.brand.getBrand();
    this.logger.log("[INTEGRATION-COMP] brand: ", _brand);
    this.translateparams = _brand;
   }

  ngOnInit(): void {
    this.getBrowserVersion();
    this.listenSidebarIsOpened();
  }


  // UTILS - Start
  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.logger.debug("[INTEGRATION-COMP] isChromeVerGreaterThan100: ", isChromeVerGreaterThan100)
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    })
  }

  listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
      this.logger.log('[INTEGRATION-COMP] SETTINGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    });
  }
  // UTILS - End

  // CHATBOTS - Start
  getTemplates() {
    this.faqKbService.getTemplates().subscribe((res: any) => {

      if (res) {
        const templates = res
        //  this.logger.log('[BOTS-LIST] - GET ALL TEMPLATES', templates);
        this.allTemplatesCount = templates.length;
        this.logger.log('[KNOWLEDGE-BASES-COMP] - GET ALL TEMPLATES COUNT', this.allTemplatesCount);

        // ---------------------------------------------------------------------
        // Customer Satisfaction templates
        // ---------------------------------------------------------------------
        const customerSatisfactionTemplates = templates.filter((obj) => {
          return obj.mainCategory === "Customer Satisfaction"
        });
        this.logger.log('KNOWLEDGE-BASES-COMP] - Customer Satisfaction TEMPLATES', customerSatisfactionTemplates);
        if (customerSatisfactionTemplates) {
          this.customerSatisfactionTemplatesCount = customerSatisfactionTemplates.length;
          this.logger.log('[KNOWLEDGE-BASES-COMP] - Customer Satisfaction COUNT', this.customerSatisfactionTemplatesCount);
        }

        // ---------------------------------------------------------------------
        // Customer Increase Sales
        // ---------------------------------------------------------------------
        const increaseSalesTemplates = templates.filter((obj) => {
          return obj.mainCategory === "Increase Sales"
        });
        //  this.logger.log('[BOTS-LIST] - Increase Sales TEMPLATES', increaseSalesTemplates);
        if (increaseSalesTemplates) {
          this.increaseSalesTemplatesCount = increaseSalesTemplates.length;
          this.logger.log('[KNOWLEDGE-BASES-COMP] - Increase Sales COUNT', this.increaseSalesTemplatesCount);
        }
      }

    }, (error) => {
      this.logger.error('[KNOWLEDGE-BASES-COMP] GET TEMPLATES ERROR ', error);
      // this.showSpinner = false;
    }, () => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] GET TEMPLATES COMPLETE');
      // this.showSpinner = false;
      // this.generateTagsBackground(this.templates)
    });
  }

  getCommunityTemplates() {

    this.faqKbService.getCommunityTemplates().subscribe((res: any) => {
      if (res) {
        const communityTemplates = res
        this.logger.log('[KNOWLEDGE-BASES-COMP] - GET COMMUNITY TEMPLATES', communityTemplates);
        this.allCommunityTemplatesCount = communityTemplates.length;
        this.logger.log('[KNOWLEDGE-BASES-COMP] - GET COMMUNITY TEMPLATES COUNT', this.allCommunityTemplatesCount);
      }
    }, (error) => {
      this.logger.error('[KNOWLEDGE-BASES-COMP]  GET COMMUNITY TEMPLATES ERROR ', error);

    }, () => {
      this.logger.log('[KNOWLEDGE-BASES-COMP]  GET COMMUNITY TEMPLATES COMPLETE');

    });
  }
  // CHATBOTS - End
}
