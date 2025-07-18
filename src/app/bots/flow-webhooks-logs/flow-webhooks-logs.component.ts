import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from 'app/services/app-config.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { WebhookService } from 'app/services/webhook.service';
import { Location } from '@angular/common';
import { NotifyService } from 'app/core/notify.service';
import { MatTooltip } from '@angular/material/tooltip';
import { FlowWebhooksLogsService } from 'app/services/flow-webhooks-logs.service';
const Swal = require('sweetalert2');

export enum LogType {
  WEBHOOK = 'webhook',
  REQUEST = 'request',
} 

@Component({
  selector: 'appdashboard-flow-webhooks-logs',
  templateUrl: './flow-webhooks-logs.component.html',
  styleUrls: ['./flow-webhooks-logs.component.scss']
})
export class FlowWebhooksLogsComponent implements OnInit {
  @ViewChild('tooltip') tooltip: MatTooltip;

  LogType = LogType;
  isChromeVerGreaterThan100: boolean;
  IS_OPEN_SETTINGS_SIDEBAR = true;
  SERVER_BASE_PATH: string;
  currentWH: any;
  webhookURL: string;
  webhook_id: string;
  copied = false;
  log_type: string;
  log_id: string;

  // Log filtering and state
  selectedLogLevel = 'info';
  logLevels = [
    { label: 'info', value: 'info', nlevel: 2 },
    { label: 'warn', value: 'warn', nlevel: 3 },
    { label: 'error', value: 'error', nlevel: 4 }
  ];
  filteredLogs = [];
  listOfLogs = [];
  expandedLogs = new Set<number>();
  loadingPrev = false;
  loadingNext = false;
  scrollTop: boolean = null;
  scrollBottom: boolean = null;
  loadingLogs = false;

  chatBotCount: any;
  myChatbotOtherCount: number;
  automationsCount: number;
  customerSatisfactionBotsCount: number;
  increaseSalesBotsCount: number;
  allCommunityTemplatesCount: number;
  flowWebhooks: any;
  flowWebhooksCount: number;
  allTemplatesCount: number;
  customerSatisfactionTemplatesCount: number;
  increaseSalesTemplatesCount: number;

  constructor(
    private auth: AuthService,
    private translate: TranslateService,
    private logger: LoggerService,
    private webhookService: WebhookService,
    private route: ActivatedRoute,
    public appConfigService: AppConfigService,
    public location: Location,
    public notify: NotifyService,
    private flowWebhooksLogsService: FlowWebhooksLogsService,
    private faqKbService: FaqKbService,
  ) { }

  async ngOnInit(): Promise<void> {
    await this.getBrowserVersion();
    this.getFaqKbByProjectId();
    this.getFlowWebhooks();
    await this.getServerBaseURL();
    await this.getRouteParams();
  }


  private getBrowserVersion(): Promise<void> {
    return new Promise((resolve) => {
      this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
        this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
        resolve();
      });
    });
  }

  private getRouteParams(): Promise<void> {
    return new Promise((resolve) => {
      this.route.params.subscribe(async (params) => {
        this.log_type = params.type;
        this.log_id = params.id;

        this.logger.log('[FLOW-WEBHOOKS-LOGS] params ', params);
        if (this.log_type === LogType.WEBHOOK && this.log_id) {
          await this.getFlowWebhookById(params.id);
          if (this.webhook_id) {
            this.getStaticLastLogs();
          }
        } else if (this.log_type === LogType.REQUEST && this.log_id) {
          this.logger.log('[FLOW-WEBHOOKS-LOGS] GET REQUEST BY ID ', params.id);
          this.getStaticLastLogs();
        }
        resolve();
      });
    });
  }

  getFlowWebhooks() {
    this.webhookService.getFlowWebhooks().subscribe((res: any) => {
      this.logger.log('[FLOW-WEBHOOKS] GET WH RES  ', res);
      if (res) {
        this.flowWebhooks = res
        this.flowWebhooksCount = res.length
      }
    }, (error) => {
      this.logger.error('[FLOW-WEBHOOKS] GET WH ERROR ', error);

    }, () => {
      this.logger.log('[FLOW-WEBHOOKS] GET WH COMPLETE');
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

  private getServerBaseURL(): Promise<void> {
    return new Promise((resolve) => {
      this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
      this.logger.log('[FLOW-WEBHOOKS-LOGS] SERVER_BASE_PATH  ', this.SERVER_BASE_PATH);
      resolve();
    });
  }

  private getFlowWebhookById(webhookid: string): Promise<void> {
    return new Promise((resolve) => {
      this.webhookService.getFlowWebhookById(webhookid).subscribe((res: any) => {
        if (res) {
          this.currentWH = res;
          this.webhookURL = this.SERVER_BASE_PATH + 'webhook/' + this.currentWH['webhook_id'];
          this.webhook_id = this.currentWH['webhook_id'];
        }
        resolve();
      }, (error) => {
        this.logger.error('[FLOW-WEBHOOKS-LOGS] GET WH BY ID ERROR ', error);
        resolve();
      }, () => {
        this.logger.log('[FLOW-WEBHOOKS-LOGS] GET WH BY ID * COMPLETE *');
      });
    });
  }

  goBack(): void {
    this.location.back();
  }

  copyToClipboard(event: Event): void {
    const span = document.getElementById('webhook-text');
    const text = span?.textContent?.trim();
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 1000);
    });
  }

  webhookOnOff(event: any, webhook_id: string): void {
    this.logger.log('[FLOW-WEBHOOKS] Enable / Disable flow webhook - event', event.target.checked, 'webhook_id ', webhook_id);
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

  deleteWebhook(webhookid: string): void {
    this.logger.log('[FLOW-WEBHOOKS] delete flow webhook - webhookid ', webhookid);
    Swal.fire({
      title: this.translate.instant('AreYouSure'),
      text: this.translate.instant('TheWebhookWillBeDeleted'),
      icon: 'warning',
      showCloseButton: false,
      showCancelButton: true,
      showConfirmButton: false,
      showDenyButton: true,
      denyButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
      focusConfirm: false,
      reverseButtons: true,
    }).then((result) => {
      if (result.isDenied) {
        this.webhookService.deleteFlowWebhook(webhookid).subscribe((res: any) => {
          this.logger.log('[FLOW-WEBHOOKS] DELETE  - RES', res);
        }, (error) => {
          Swal.fire({
            title: this.translate.instant('Oops') + '!',
            text: this.translate.instant('HoursPage.ErrorOccurred'),
            icon: 'error',
            showCloseButton: false,
            showCancelButton: false,
            confirmButtonText: this.translate.instant('Ok'),
          });
          this.logger.error('[FLOW-WEBHOOKS] DELETE  ERROR ', error);
        }, () => {
          this.logger.log('[FLOW-WEBHOOKS]  * COMPLETE *');
          this.goBack();
          Swal.fire({
            title: this.translate.instant('Done') + '!',
            text: this.translate.instant('TheWebhookHasBeenDeleted'),
            icon: 'success',
            showCloseButton: false,
            showCancelButton: false,
            confirmButtonText: this.translate.instant('Ok'),
          });
        });
      } else {
        this.logger.log('[FLOW-WEBHOOKS] (else)');
      }
    });
  }

  // ---------------------------------------------
  // @ Webhook Logs
  // ---------------------------------------------

  onWheel(event: any): void {
    const element = event.target;
    if (event.deltaY < 0) {
      const atTop = element.scrollTop === 0;
      if (atTop && !this.loadingPrev) {
        this.loadingPrev = true;
        this.loadPrevLogs();
      }
    } else if (event.deltaY > 0) {
      const atBottom = element.scrollHeight - element.scrollTop === element.clientHeight;
      this.scrollTop = false;
      if (atBottom && !this.loadingNext) {
        this.loadingNext = true;
        this.loadNextLogs();
      }
    }
  }

  onLogLevelChange(level: string): void {
    this.selectedLogLevel = level;
    this.getStaticLastLogs();
  }

  onToggleRowLog(i: number): void {
    if (this.isButtonEnabled(i)) {
      if (this.listOfLogs[i]['open']) {
        this.listOfLogs[i]['open'] = !this.listOfLogs[i]['open'];
      } else {
        this.listOfLogs[i]['open'] = true;
      }
    }
  }

  onToggleLog(index: number): void {
    if (this.expandedLogs.has(index)) {
      this.expandedLogs.delete(index); // collapse
    } else {
      //if (this.isButtonEnabled(index)) {
        this.expandedLogs.add(index);
      //}
    }
  }

  isButtonEnabled(index: number): boolean {
    const blockTextId = 'row-log-text_' + index;
    const elementText = document.getElementById(blockTextId);
    if (elementText) {
      // Se il testo è ellissato/troncato scrollWidth > clientWidth
      return elementText.scrollWidth > elementText.clientWidth;
    }
    return false;
  }

  applyFilter(): void {
    const selected = this.logLevels.find(l => l.value === this.selectedLogLevel);
    if (selected) {
      this.filteredLogs = this.listOfLogs.filter(log => {
        if (log.rows && typeof log.rows.nlevel === 'number' && typeof selected.nlevel === 'number') {
          return log.rows.nlevel >= selected.nlevel;
        }
        return log.rows && log.rows.level === selected.value;
      });
    } else {
      this.filteredLogs = this.listOfLogs;
    }
  }

  getStaticLastLogs(): void {
    if(this.log_type === LogType.WEBHOOK) {
      this.flowWebhooksLogsService.getStaticLastLogs(this.log_type, this.log_id, null, null, this.selectedLogLevel).subscribe((logs: any[]) => {
        this.listOfLogs = logs;
      }, (error) => {
        this.logger.error('[FLOW-WEBHOOKS-LOGS] Error loading logs', error);
      });
    } else if(this.log_type === LogType.REQUEST) {  
      this.flowWebhooksLogsService.getStaticLastLogs(this.log_type, this.log_id, null, null, this.selectedLogLevel).subscribe((logs: any[]) => {
        this.listOfLogs = logs;
      }, (error) => {
        this.logger.error('[FLOW-WEBHOOKS-LOGS] Error loading logs', error);
      });
    }
    // this.flowWebhooksLogsService.getLogs(this.webhook_id).subscribe((logs: any[]) => {
    //   this.listOfLogs = logs;
    // }, (error) => {
    //   this.logger.error('[FLOW-WEBHOOKS-LOGS] Error loading logs', error);
    //   this.loadingLogs = false;
    // });
    // return;
    // this.flowWebhooksLogsService.getStaticLastLogs(this.webhook_id, null, null, this.selectedLogLevel).subscribe((logs: any[]) => {
    //   this.listOfLogs = logs;
    //   // this.applyFilter();
    // }, (error) => {
    //   this.logger.error('[FLOW-WEBHOOKS-LOGS] Error loading logs', error);
    // });
  }

  loadPrevLogs(): void {
    if (!this.listOfLogs.length || !this.listOfLogs[0].rows || !this.listOfLogs[0].rows.timestamp) {
      this.logger.warn('[FLOW-WEBHOOKS-LOGS] loadPrevLogs: nessun log o timestamp iniziale.');
      this.loadingPrev = false;
      return;
    }
    this.loadingNext = false;
    this.loadingLogs = true;
    const timestamp = this.listOfLogs[0].rows.timestamp;
    this.flowWebhooksLogsService.getStaticLastLogs(this.log_type, this.log_id, 'prev', timestamp, this.selectedLogLevel).subscribe((logs: any[]) => {
      setTimeout(() => {
        this.listOfLogs.unshift(...logs);
        this.loadingLogs = false;
        this.loadingPrev = false;
      }, 2000);
    }, (error) => {
      this.logger.error('[FLOW-WEBHOOKS-LOGS] Error loading logs', error);
      this.loadingLogs = false;
      this.loadingPrev = false;
    });
  }

  loadNextLogs(): void {
    if (!this.listOfLogs.length || !this.listOfLogs[this.listOfLogs.length - 1].rows || !this.listOfLogs[this.listOfLogs.length - 1].rows.timestamp) {
      this.logger.warn('[FLOW-WEBHOOKS-LOGS] loadNextLogs: nessun log o timestamp finale.');
      this.loadingNext = false;
      return;
    }
    this.loadingPrev = false;
    this.loadingLogs = true;
    const timestamp = this.listOfLogs[this.listOfLogs.length - 1].rows.timestamp;
    this.logger.log('[FLOW-WEBHOOKS-LOGS] loadNextLogs: timestamp ', this.listOfLogs[this.listOfLogs.length - 1], ' - ', timestamp);
    this.flowWebhooksLogsService.getStaticLastLogs(this.log_type, this.log_id, 'next', timestamp, this.selectedLogLevel).subscribe((logs: any[]) => {
      setTimeout(() => {
        this.listOfLogs.push(...logs);
        // this.applyFilter();
        this.loadingNext = false;
        this.loadingLogs = false;
      }, 2000);
    }, (error) => {
      this.logger.error('[FLOW-WEBHOOKS-LOGS] Error loading logs', error);
      this.loadingNext = false;
    });
  }
}