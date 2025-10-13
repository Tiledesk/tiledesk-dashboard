import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/core/auth.service';
import { NotifyService } from 'app/core/notify.service';
import { AppConfigService } from 'app/services/app-config.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { FaqService } from 'app/services/faq.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { RoleService } from 'app/services/role.service';
import { RolesService } from 'app/services/roles.service';
import { WebhookService } from 'app/services/webhook.service';
import { PERMISSIONS } from 'app/utils/permissions.constants';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
const Swal = require('sweetalert2')
@Component({
  selector: 'appdashboard-flow-webhooks',
  templateUrl: './flow-webhooks.component.html',
  styleUrls: ['./flow-webhooks.component.scss']
})
export class FlowWebhooksComponent implements OnInit {
  isChromeVerGreaterThan100: boolean;
  IS_OPEN_SETTINGS_SIDEBAR: boolean = true;
  allTemplatesCount: number;
  customerSatisfactionTemplatesCount: number;
  increaseSalesTemplatesCount: number;
  route: string
  showSpinner: boolean

  chatBotCount: any;

  myChatbotOtherCount: number;
  automationsCount: number;

  customerSatisfactionBotsCount: number;
  increaseSalesBotsCount: number;

  allCommunityTemplatesCount: number;

  flowWebhooks: any;
  flowWebhooksCount: number;

  // webhookid: string
  copied: boolean = false;
  copiedStates: { [key: string]: boolean } = {};

  SERVER_BASE_PATH: string;

  hasDefaultRole: boolean;
  ROLE: string;
  PERMISSIONS: any;
  private unsubscribe$: Subject<any> = new Subject<any>();
  PERMISSION_TO_COPY_WEBHOOK_URL: boolean;
  PERMISSION_TO_ENABLE_DISABLE_WEBHOOK: boolean;
  PERMISSION_TO_DELETE_WEBHOOK: boolean;

  constructor(
    private auth: AuthService,
    private translate: TranslateService,
    private logger: LoggerService,
    private router: Router,
    private webhookService: WebhookService,
    private faqKbService: FaqKbService,
    public appConfigService: AppConfigService,
    public notify: NotifyService,
    private roleService: RoleService,
    private rolesService: RolesService,
  ) { }

  ngOnInit(): void {
    this.roleService.checkRoleForCurrentProject('flow-webhook')
    this.getBrowserVersion();
    this.getFaqKbByProjectId()
    // this.getTemplates()
    // this.getCommunityTemplates()
    this.getFlowWebhooks()
    this.getServerBaseURL()
    this.listenToProjectUser()
  }

   listenToProjectUser() {
      this.rolesService.listenToProjectUserPermissions(this.unsubscribe$);
  
      this.rolesService.getUpdateRequestPermission()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(status => {
          this.ROLE = status.role;
          this.PERMISSIONS = status.matchedPermissions;
          console.log('[PERMISSION_TO_COPY_WEBHOOK_URL] - this.ROLE:', this.ROLE);
          console.log('PERMISSION_TO_COPY_WEBHOOK_URL] - this.PERMISSIONS', this.PERMISSIONS);
          this.hasDefaultRole = ['owner', 'admin', 'agent'].includes(status.role);
          console.log('PERMISSION_TO_COPY_WEBHOOK_URL] - hasDefaultRole', this.hasDefaultRole);
  
          // PERMISSION_TO_COPY_WEBHOOK_URL
          if (status.role === 'owner' || status.role === 'admin') {
            // Owner and Admin always has permission
            this.PERMISSION_TO_COPY_WEBHOOK_URL = true;
            console.log('[BOT-PERMISSION_TO_COPY_WEBHOOK_URL] - Project user is owner or admin (1)', 'PERMISSION_TO_COPY_WEBHOOK_URL:', this.PERMISSION_TO_COPY_WEBHOOK_URL);
  
          } else if (status.role === 'agent') {
            // Agent never have permission
            this.PERMISSION_TO_COPY_WEBHOOK_URL = false;
            console.log('[PERMISSION_TO_COPY_WEBHOOK_URL] - Project user is agent (2)', 'PERMISSION_TO_COPY_WEBHOOK_URL:', this.PERMISSION_TO_COPY_WEBHOOK_URL);
  
          } else {
            // Custom roles: permission depends on matchedPermissions
            this.PERMISSION_TO_COPY_WEBHOOK_URL = status.matchedPermissions.includes(PERMISSIONS.FLOW_WEBHOOK_COPY);
            console.log('[PERMISSION_TO_COPY_WEBHOOK_URL] - Custom role (3)', status.role, 'PERMISSION_TO_COPY_WEBHOOK_URL:', this.PERMISSION_TO_COPY_WEBHOOK_URL);
          }

          // PERMISSION_TO_ENABLE_DISABLE_WEBHOOK
          if (status.role === 'owner' || status.role === 'admin') {
            // Owner and Admin always has permission
            this.PERMISSION_TO_ENABLE_DISABLE_WEBHOOK = true;
            console.log('[BOT-PERMISSION_TO_COPY_WEBHOOK_URL] - Project user is owner or admin (1)', 'PERMISSION_TO_ENABLE_DISABLE_WEBHOOK:', this.PERMISSION_TO_ENABLE_DISABLE_WEBHOOK);
  
          } else if (status.role === 'agent') {
            // Agent never have permission
            this.PERMISSION_TO_ENABLE_DISABLE_WEBHOOK = false;
            console.log('[PERMISSION_TO_COPY_WEBHOOK_URL] - Project user is agent (2)', 'PERMISSION_TO_ENABLE_DISABLE_WEBHOOK:', this.PERMISSION_TO_ENABLE_DISABLE_WEBHOOK);
  
          } else {
            // Custom roles: permission depends on matchedPermissions
            this.PERMISSION_TO_ENABLE_DISABLE_WEBHOOK = status.matchedPermissions.includes(PERMISSIONS.FLOW_WEBHOOK_EDIT);
            console.log('[PERMISSION_TO_COPY_WEBHOOK_URL] - Custom role (3)', status.role, 'PERMISSION_TO_ENABLE_DISABLE_WEBHOOK:', this.PERMISSION_TO_ENABLE_DISABLE_WEBHOOK);
          }


          // PERMISSION_TO_DELETE_WEBHOOK
          if (status.role === 'owner' || status.role === 'admin') {
            // Owner and Admin always has permission
            this.PERMISSION_TO_DELETE_WEBHOOK = true;
            console.log('[BOT-PERMISSION_TO_COPY_WEBHOOK_URL] - Project user is owner or admin (1)', 'PERMISSION_TO_DELETE_WEBHOOK:', this.PERMISSION_TO_DELETE_WEBHOOK);
  
          } else if (status.role === 'agent') {
            // Agent never have permission
            this.PERMISSION_TO_DELETE_WEBHOOK = false;
            console.log('[PERMISSION_TO_COPY_WEBHOOK_URL] - Project user is agent (2)', 'PERMISSION_TO_DELETE_WEBHOOK:', this.PERMISSION_TO_DELETE_WEBHOOK);
  
          } else {
            // Custom roles: permission depends on matchedPermissions
            this.PERMISSION_TO_DELETE_WEBHOOK = status.matchedPermissions.includes(PERMISSIONS.FLOW_WEBHOOK_DELETE);
            console.log('[PERMISSION_TO_COPY_WEBHOOK_URL] - Custom role (3)', status.role, 'PERMISSION_TO_DELETE_WEBHOOK:', this.PERMISSION_TO_DELETE_WEBHOOK);
          }
        });
  
    }

  getServerBaseURL() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    this.logger.log('[FLOW-WEBHOOKS] SERVER_BASE_PATH  ', this.SERVER_BASE_PATH)
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //   this.logger.log("[FLOW-WEBHOOKS] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }

  getFlowWebhooks() {
    this.showSpinner = true;
    this.webhookService.getFlowWebhooks().subscribe((res: any) => {

      this.logger.log('[FLOW-WEBHOOKS] GET WH RES  ', res);
      if (res) {
        this.flowWebhooks = res
        this.flowWebhooksCount = res.length
        this.flowWebhooks.forEach(webhook => {
          this.logger.log('[FLOW-WEBHOOKS] GET WH RES - webhook  ', webhook);
          webhook['url'] = this.SERVER_BASE_PATH + 'webhook/' + webhook['webhook_id']
        });
      }

    }, (error) => {
      this.logger.error('[FLOW-WEBHOOKS] GET WH ERROR ', error);
      this.showSpinner = false;
    }, () => {
      this.logger.log('[FLOW-WEBHOOKS] GET WH COMPLETE');
      this.showSpinner = false;
    });
  }


  // --------------------------------------------------------------------------------------
  //  @ Enable / disable flow webkook
  // --------------------------------------------------------------------------------------
  webhookOnOff(event, webhook_id) {
    if (!this.PERMISSION_TO_ENABLE_DISABLE_WEBHOOK) {
      event.preventDefault();
      this.notify.presentDialogNoPermissionToPermomfAction();
      return;
    }

    this.logger.log('[FLOW-WEBHOOKS] Enable / Disable flow webhook - event', event.target.checked, 'webhook_id ', webhook_id)

    this.webhookService.updateFlowWebhook(event.target.checked, webhook_id).subscribe((res: any) => {

      this.logger.log('[FLOW-WEBHOOKS] UPDATE WH RES  ', res);
      this.notify.showWidgetStyleUpdateNotification(this.translate.instant('WebhookUpdatedSuccessfully'), 2, 'done');

    }, (error) => {
      this.logger.error('[FLOW-WEBHOOKS] UPDATE WH ERROR ', error);
      this.notify.showWidgetStyleUpdateNotification(this.translate.instant('AnErrorOccurredWhileUpdating'), 4, 'report_problem');
    }, () => {
      this.logger.log('[FLOW-WEBHOOKS] UPDATE WH COMPLETE');
   
    });
  }



  deleteWebhook(webhookid) {
    if (!this.PERMISSION_TO_DELETE_WEBHOOK) {
      this.notify.presentDialogNoPermissionToPermomfAction()
      return;
    }

    this.logger.log('[FLOW-WEBHOOKS] delete flow webhook - webhookid ', webhookid)
    Swal.fire({
      title: this.translate.instant('AreYouSure')+ "?",
      text: this.translate.instant('TheWebhookWillBeDeleted'),
      icon: "warning",
      showCloseButton: false,
      showCancelButton: true,
      showConfirmButton: false,
      showDenyButton: true,
      denyButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
      focusConfirm: false,
      reverseButtons: true,
      // buttons: ["Cancel", "Delete"],
      // dangerMode: true,
    })
      .then((result) => {
        if (result.isDenied) {
          this.webhookService.deleteFlowWebhook(webhookid).subscribe((res: any) => {
            this.logger.log('[FLOW-WEBHOOKS] DELETE  - RES', res);
          }, (error) => {
            Swal.fire({
              title: this.translate.instant('Oops') + '!',
              text: this.translate.instant('HoursPage.ErrorOccurred'),
              icon: "error",
              showCloseButton: false,
              showCancelButton: false,
              confirmButtonText: this.translate.instant('Ok'),
              // confirmButtonColor: "var(--primary-btn-background)",
            });
            this.logger.error('[FLOW-WEBHOOKS] DELETE  ERROR ', error);
          }, () => {
            this.logger.log('[FLOW-WEBHOOKS]  * COMPLETE *');


            for (var i = 0; i < this.flowWebhooks.length; i++) {

              if (this.flowWebhooks[i].webhook_id === webhookid) {
                this.flowWebhooks.splice(i, 1);
                i--;
              }
            }

            this.getFlowWebhooks()

            Swal.fire({
              title: this.translate.instant('Done') + "!",
              text: this.translate.instant('TheWebhookHasBeenDeleted'),
              icon: "success",
              showCloseButton: false,
              showCancelButton: false,
              // confirmButtonColor: "var(--primary-btn-background)",
              confirmButtonText: this.translate.instant('Ok'),
            }).then((okpressed) => {

            });
          });
        } else {
          this.logger.log('[FLOW-WEBHOOKS] (else)')
        }
      });
  }

  copyToClipboard(element: HTMLElement,  itemId: string) {
    const text = element.innerText.trim(); // Get the text content
    navigator.clipboard.writeText(text).then(() => {
      this.logger.log('Copied to clipboard:', text);
      // Reset all tooltips
      this.copiedStates = {};
      this.copied = true;
      this.copiedStates[itemId] = true;

      setTimeout(() => {
        this.copiedStates[itemId] = false;
      }, 1000);
    }).catch(err => {
      this.logger.error('Error copying text:', err);
    });
  }


  // ------------------------------------------------------------------------
  // FOR the sidebar
  // ------------------------------------------------------------------------
  getTemplates() {
    this.faqKbService.getTemplates().subscribe((res: any) => {

      if (res) {
        const templates = res
        //  this.logger.log('[FLOW-WEBHOOKS] - GET ALL TEMPLATES', templates);
        this.allTemplatesCount = templates.length;
        this.logger.log('[FLOW-WEBHOOKS] - GET ALL TEMPLATES COUNT', this.allTemplatesCount);

        // --------------------------------
        // Customer Satisfaction templates
        // --------------------------------
        const customerSatisfactionTemplates = templates.filter((obj) => {
          return obj.mainCategory === "Customer Satisfaction"
        });
        this.logger.log('[FLOW-WEBHOOKS] - Customer Satisfaction TEMPLATES', customerSatisfactionTemplates);
        if (customerSatisfactionTemplates) {
          this.customerSatisfactionTemplatesCount = customerSatisfactionTemplates.length;
          this.logger.log('[FLOW-WEBHOOKS] - Customer Satisfaction COUNT', this.customerSatisfactionTemplatesCount);
        }

        // --------------------------------
        // Customer Increase Sales
        // --------------------------------
        const increaseSalesTemplates = templates.filter((obj) => {
          return obj.mainCategory === "Increase Sales"
        });
        //  this.logger.log('[FLOW-WEBHOOKS] - Increase Sales TEMPLATES', increaseSalesTemplates);
        if (increaseSalesTemplates) {
          this.increaseSalesTemplatesCount = increaseSalesTemplates.length;
          this.logger.log('[FLOW-WEBHOOKS] - Increase Sales COUNT', this.increaseSalesTemplatesCount);
        }
      }

    }, (error) => {
      this.logger.error('[FLOW-WEBHOOKS] GET TEMPLATES ERROR ', error);

    }, () => {
      this.logger.log('[FLOW-WEBHOOKS] GET TEMPLATES COMPLETE');
    });
  }

  getFaqKbByProjectId() {
    this.faqKbService.getFaqKbByProjectId().subscribe((faqKb: any) => {
      if (faqKb) {
        this.chatBotCount = faqKb.length
        // this.myChatbotOtherCount = faqKb.length
        this.logger.log('[FLOW-WEBHOOKS] - GET BOTS BY PROJECT ID - myChatbotOtherCount', this.myChatbotOtherCount);
        this.logger.log('[FLOW-WEBHOOKS] - GET BOTS BY PROJECT ID - faqKb', faqKb);
      }

      const myChatbot = faqKb.filter((obj) => {
        return !obj.subtype || obj.subtype === "chatbot" || obj.subtype === "voice" || obj.subtype === "voice_twilio";
      });
      this.logger.log('[FLOW-WEBHOOKS]  - myChatbot', myChatbot);
      if (myChatbot) {
        this.myChatbotOtherCount = myChatbot.length;
        this.logger.log('[FLOW-WEBHOOKS]  - myChatbot COUNT', this.customerSatisfactionTemplatesCount);
      }


      const automations = faqKb.filter((obj) => {
        return obj.subtype && ["webhook", "copilot"].includes(obj.subtype);
      });
      this.logger.log('[FLOW-WEBHOOKS]  - automations', automations);
      if (automations) {
        this.automationsCount = automations.length;
        this.logger.log('[FLOW-WEBHOOKS]  - automations COUNT', this.customerSatisfactionTemplatesCount);
      }

      const customerSatisfactionBots = faqKb.filter((obj) => {
        return obj.mainCategory === "Customer Satisfaction"
      });
      this.logger.log('[FLOW-WEBHOOKS]  - Customer Satisfaction BOTS', customerSatisfactionBots);
      if (customerSatisfactionBots) {
        this.customerSatisfactionBotsCount = customerSatisfactionBots.length;
        this.logger.log('[FLOW-WEBHOOKS]  - Customer Satisfaction COUNT', this.customerSatisfactionTemplatesCount);
      }

      const increaseSalesBots = faqKb.filter((obj) => {
        return obj.mainCategory === "Increase Sales"
      });
      this.logger.log('[FLOW-WEBHOOKS]  - Increase Sales BOTS ', increaseSalesBots);
      if (increaseSalesBots) {
        this.increaseSalesBotsCount = increaseSalesBots.length;
        this.logger.log('[FLOW-WEBHOOKS] - Increase Sales BOTS COUNT', this.increaseSalesTemplatesCount);
      }


    }, (error) => {
      this.logger.error('[FLOW-WEBHOOKS] GET BOTS ERROR ', error);

    }, () => {
      this.logger.log('[FLOW-WEBHOOKS] GET BOTS COMPLETE');

    });

  }


  getCommunityTemplates() {
    this.faqKbService.getCommunityTemplates().subscribe((res: any) => {
      if (res) {
        const communityTemplates = res
        this.logger.log('[FLOW-WEBHOOKS] - GET COMMUNITY TEMPLATES', communityTemplates);
        this.allCommunityTemplatesCount = communityTemplates.length;
        this.logger.log('[[FLOW-WEBHOOKS] - GET COMMUNITY TEMPLATES COUNT', this.allCommunityTemplatesCount);
      }
    }, (error) => {
      this.logger.error('[FLOW-WEBHOOKS]  GET COMMUNITY TEMPLATES ERROR ', error);

    }, () => {
      this.logger.log('[FLOW-WEBHOOKS]  GET COMMUNITY TEMPLATES COMPLETE');

    });
  }

}
