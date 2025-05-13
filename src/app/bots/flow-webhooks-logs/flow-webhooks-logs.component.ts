import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { MatMenuTrigger } from '@angular/material/menu';
const Swal = require('sweetalert2')
@Component({
  selector: 'appdashboard-flow-webhooks-logs',
  templateUrl: './flow-webhooks-logs.component.html',
  styleUrls: ['./flow-webhooks-logs.component.scss']
})
export class FlowWebhooksLogsComponent implements OnInit {
  @ViewChild('tooltip') tooltip: MatTooltip;

  isChromeVerGreaterThan100: boolean;
  IS_OPEN_SETTINGS_SIDEBAR: boolean = true;
  SERVER_BASE_PATH: string;

  chatBotCount: any
  myChatbotOtherCount: number;
  automationsCount: number;
  flowWebhooksCount: number;
  currentWH: any;
  webhookURL: string;
  
  // TO REMOVE
  allCommunityTemplatesCount: number;
  allTemplatesCount: number;
  customerSatisfactionTemplatesCount: number;
  increaseSalesTemplatesCount: number;
  customerSatisfactionBotsCount: number;
  increaseSalesBotsCount: number;
  copied = false;
  // ----------------------------------
  // @ Logs
  // ----------------------------------
 
  selectedLogLevel = 'info'
  logContainer: any;
  scrollTop: boolean = null;
  scrollBottom: boolean = null;
  loadingPrev: boolean =  true;
  loadingNext: boolean =  false;

  // expandedLogIndex: number | null = null;
  expandedLogs = new Set<number>();
  logLevels = [
    { label: 'debug', value: 'debug' },
    { label: 'info', value: 'info' },
    { label: 'warn', value: 'warn' },
    { label: 'error', value: 'error' }
  ];


  listOfLogs =[
    {
        "_id": "681c7926be4eb9cda85816dc",
        "request_id": "support-group-681b77762e33a500136c33f5-3601ef153a424aba9dabbbcea1eaebed",
        "__v": 0,
        "createdAt": "2025-05-08T09:28:06.009Z",
        "id_project": "681b77762e33a500136c33f5",
        "rows": {
            "text": "Executing Action Reply  {\n  \"_tdActionType\": \"reply\",\n  \"attributes\": {\n    \"disableInputMessage\": false,\n    \"commands\": [\n      {\n        \"type\": \"wait\",\n        \"time\": 500\n      },\n      {\n        \"type\": \"message\",\n        \"message\": {\n          \"type\": \"text\",\n          \"text\": \"Hi, how can I help you?\",\n          \"attributes\": {\n            \"attachment\": {\n              \"type\": \"template\",\n              \"buttons\": []\n            }\n          }\n        }\n      }\n    ],\n    \"fillParams\": true\n  },\n  \"text\": \"Hi, how can I help you?\\r\\n\",\n  \"_tdActionId\": \"a079df138a514970b0fadc0110592d68\"\n}",
            "level": "info",
            "nlevel": 2,
            "_id": "681c79262c1ce9f5b203e091",
            "timestamp": "2025-05-08T09:28:06.010Z"
        },
        "shortExp": "2025-05-08T09:28:06.586Z",
        "updatedAt": "2025-05-08T09:28:06.586Z"
    },
    {
        "_id": "681c7926be4eb9cda85816dc",
        "request_id": "support-group-681b77762e33a500136c33f5-3601ef153a424aba9dabbbcea1eaebed",
        "__v": 0,
        "createdAt": "2025-05-08T09:28:06.009Z",
        "id_project": "681b77762e33a500136c33f5",
        "rows": {
            "text": "Action Reply terminated",
            "level": "info",
            "nlevel": 2,
            "_id": "681c79262c1ce9f5b203e094",
            "timestamp": "2025-05-08T09:28:06.554Z"
        },
        "shortExp": "2025-05-08T09:28:06.586Z",
        "updatedAt": "2025-05-08T09:28:06.586Z"
    },
    {
      "_id": "681c7926be4eb9cda85816dc",
      "request_id": "support-group-681b77762e33a500136c33f5-3601ef153a424aba9dabbbcea1eaebed",
      "__v": 0,
      "createdAt": "2025-05-08T09:28:06.009Z",
      "id_project": "681b77762e33a500136c33f5",
      "rows": {
          "text": "Executing Action Reply  {\n  \"_tdActionType\": \"reply\",\n  \"attributes\": {\n    \"disableInputMessage\": false,\n    \"commands\": [\n      {\n        \"type\": \"wait\",\n        \"time\": 500\n      },\n      {\n        \"type\": \"message\",\n        \"message\": {\n          \"type\": \"text\",\n          \"text\": \"Hi, how can I help you?\",\n          \"attributes\": {\n            \"attachment\": {\n              \"type\": \"template\",\n              \"buttons\": []\n            }\n          }\n        }\n      }\n    ],\n    \"fillParams\": true\n  },\n  \"text\": \"Hi, how can I help you?\\r\\n\",\n  \"_tdActionId\": \"a079df138a514970b0fadc0110592d68\"\n}",
          "level": "info",
          "nlevel": 2,
          "_id": "681c79262c1ce9f5b203e091",
          "timestamp": "2025-05-08T09:28:06.010Z"
      },
      "shortExp": "2025-05-08T09:28:06.586Z",
      "updatedAt": "2025-05-08T09:28:06.586Z"
    },
    {
        "_id": "681c7926be4eb9cda85816dc",
        "request_id": "support-group-681b77762e33a500136c33f5-3601ef153a424aba9dabbbcea1eaebed",
        "__v": 0,
        "createdAt": "2025-05-08T09:28:06.009Z",
        "id_project": "681b77762e33a500136c33f5",
        "rows": {
            "text": "[Capture User Reply] Executing action",
            "level": "info",
            "nlevel": 2,
            "_id": "681c79262c1ce9f5b203e098",
            "timestamp": "2025-05-08T09:28:06.585Z"
        },
        "shortExp": "2025-05-08T09:28:06.586Z",
        "updatedAt": "2025-05-08T09:28:06.586Z"
    },
    {
        "_id": "681c7926be4eb9cda85816dc",
        "request_id": "support-group-681b77762e33a500136c33f5-3601ef153a424aba9dabbbcea1eaebed",
        "__v": 0,
        "createdAt": "2025-05-08T09:28:06.009Z",
        "id_project": "681b77762e33a500136c33f5",
        "rows": {
            "text": "[Capture User Reply] Action completed",
            "level": "info",
            "nlevel": 2,
            "_id": "681c79262c1ce9f5b203e09d",
            "timestamp": "2025-05-08T09:28:06.587Z"
        },
        "shortExp": "2025-05-08T09:28:06.586Z",
        "updatedAt": "2025-05-08T09:28:06.586Z"
    }
]

  constructor(
    private auth: AuthService,
    private translate: TranslateService,
    private logger: LoggerService,
    private webhookService: WebhookService,
    private faqKbService: FaqKbService,
    private route: ActivatedRoute,
    public appConfigService: AppConfigService,
    public location: Location,
     public notify: NotifyService,
  ) { }

  ngOnInit(): void {
    this.getBrowserVersion();
    this.getFaqKbByProjectId()
    this.getFlowWebhooks()
    this.getRouteParams()
    this.getServerBaseURL()
  }

  getRouteParams() {
    this.route.params.subscribe((params) => {
      console.log('[FLOW-WEBHOOKS-LOGS] - params ', params)
      if (params.webhookid) {
        this.getFlowWebhookById(params.webhookid)
      }
    });
  }

  getServerBaseURL() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    this.logger.log('[FLOW-WEBHOOKS-LOGS] SERVER_BASE_PATH  ', this.SERVER_BASE_PATH)
  }

  getFlowWebhookById(webhookid) {
    // this.showSpinner = true;
    this.webhookService.getFlowWebhookById(webhookid).subscribe((res: any) => {

      console.log('[FLOW-WEBHOOKS-LOGS] GET WH BY ID RES  ', res);
      if (res) {

        this.currentWH = res
        console.log('[FLOW-WEBHOOKS-LOGS] GET WH BY ID currentWH  ', this.currentWH);
        this.webhookURL = this.SERVER_BASE_PATH + 'webhook/' + this.currentWH['webhook_id']
        console.log('[FLOW-WEBHOOKS-LOGS] GET WH BY ID webhookURL  ', this.webhookURL);
        // this.flowWebhooks.forEach(webhook => {
        //   this.logger.log('[FLOW-WEBHOOKS-LOGS] GET WH RES - webhook  ', webhook);
        //   webhook['url'] = this.SERVER_BASE_PATH + 'webhook/' + webhook['webhook_id']
        // });
      }

    }, (error) => {
      this.logger.error('[FLOW-WEBHOOKS-LOGS] GET WH BY ID ERROR ', error);
      // this.showSpinner = false;
    }, () => {
      this.logger.log('[FLOW-WEBHOOKS-LOGS] GET WH BY ID * COMPLETE *');
      // this.showSpinner = false;
    });
  }


  getFlowWebhooks() {
    // this.showSpinner = true;
    this.webhookService.getFlowWebhooks().subscribe((res: any) => {

      console.log('[FLOW-WEBHOOKS-LOGS] GET WH RES  ', res);
      if (res) {
        // this.flowWebhooks = res
        this.flowWebhooksCount = res.length

      }

    }, (error) => {
      this.logger.error('[FLOW-WEBHOOKS-LOGS] GET WH ERROR ', error);
      // this.showSpinner = false;
    }, () => {
      this.logger.log('[FLOW-WEBHOOKS-LOGS] GET WH COMPLETE');
      // this.showSpinner = false;
    });
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    })
  }

  getFaqKbByProjectId() {
    this.faqKbService.getFaqKbByProjectId().subscribe((faqKb: any) => {
      if (faqKb) {
        this.chatBotCount = faqKb.length
        // this.myChatbotOtherCount = faqKb.length
        this.logger.log('[FLOW-WEBHOOKS-LOGS] - GET BOTS BY PROJECT ID - myChatbotOtherCount', this.myChatbotOtherCount);
        this.logger.log('[FLOW-WEBHOOKS-LOGS] - GET BOTS BY PROJECT ID - faqKb', faqKb);
      }

      const myChatbot = faqKb.filter((obj) => {
        return !obj.subtype || obj.subtype === "chatbot" || obj.subtype === "voice" || obj.subtype === "voice-twilio";
      });
      this.logger.log('[FLOW-WEBHOOKS-LOGS]  - myChatbot', myChatbot);
      if (myChatbot) {
        this.myChatbotOtherCount = myChatbot.length;
        this.logger.log('[FLOW-WEBHOOKS-LOGS]  - myChatbot COUNT', this.myChatbotOtherCount);
      }


      const automations = faqKb.filter((obj) => {
        return obj.subtype && ["webhook", "copilot"].includes(obj.subtype);
      });
      this.logger.log('[FLOW-WEBHOOKS-LOGS]  - automations', automations);
      if (automations) {
        this.automationsCount = automations.length;
        this.logger.log('[FLOW-WEBHOOKS-LOGS]  - automations COUNT', this.automationsCount);
      }


    }, (error) => {
      this.logger.error('[FLOW-WEBHOOKS-LOGS] GET BOTS ERROR ', error);

    }, () => {
      this.logger.log('[FLOW-WEBHOOKS-LOGS] GET BOTS COMPLETE');
    });
  }

  goBack() {
    this.location.back();
  }

  // -----------------------------------------------
  //  @ Copy webkook URL
  // -----------------------------------------------
  copyToClipboard(event): void {
    const span = document.getElementById('webhook-text');
    console.log('copyToClipboard span ' , span) 
    const text = span?.textContent?.trim();
    console.log('copyToClipboard text ' , text) 
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 1000);
    });
  }

  // -----------------------------------------------
  //  @ Enable / disable flow webkook
  // -----------------------------------------------
  webhookOnOff(event, webhook_id) {
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
    this.logger.log('[FLOW-WEBHOOKS] delete flow webhook - webhookid ', webhookid)
    Swal.fire({
      title: this.translate.instant('AreYouSure'),
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


            // for (var i = 0; i < this.flowWebhooks.length; i++) {

            //   if (this.flowWebhooks[i].webhook_id === webhookid) {
            //     this.flowWebhooks.splice(i, 1);
            //     i--;
            //   }
            // }

            // this.getFlowWebhooks()
            this.goBack()

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


// ---------------------------------------------
// @ Webhook Logs
// ---------------------------------------------

onWheel(event: any) {
  // //this.logger.log('[CDS-WIDGET-LOG] onWheel');
  const element = event.target;
  console.log('[FLOW-WEBHOOKS-LOGS]  onWheel element ', element);
  if (event.deltaY < 0) {
   console.log('[FLOW-WEBHOOKS-LOGS]  onWheel Scroll verso l alto');
    const atTop = element.scrollTop === 0;
    this.scrollBottom = false;
    if (atTop && !this.scrollTop) {
        this.scrollTop = true;
        // this.loadLogs("prev");
        console.log('[FLOW-WEBHOOKS-LOGS]  onWheel Sei già all\'inizio del div e stai scrollando ulteriormente verso l\'alto.');
    }
  } else if (event.deltaY > 0) {
    console.log('[FLOW-WEBHOOKS-LOGS] onWheel Scroll verso il basso');
    const atBottom = element.scrollHeight - element.scrollTop === element.clientHeight;
    this.scrollTop = false;
    console.log('[FLOW-WEBHOOKS-LOGS] onWheel Scroll verso il basso', element.scrollHeight,  element.scrollTop, element.clientHeight, atBottom);
    if (atBottom && !this.scrollBottom) {
      this.scrollBottom = true;
      // this.loadLogs("next");
      console.log('[FLOW-WEBHOOKS-LOGS] onWheel Sei già alla fine del div e stai scrollando ulteriormente verso il basso.');
    }
  }
}

onLogLevelChange(event: any, menuTrigger: MatMenuTrigger) {
  console.log('[FLOW-WEBHOOKS-LOGS] selectedLogLevel event', event);
  this.selectedLogLevel = event.value;
  console.log('[FLOW-WEBHOOKS-LOGS] selectedLogLevel ', this.selectedLogLevel);
  menuTrigger.closeMenu()
  // this.loadingPrev = true;
  // this.getLastLogs();
}

  onToggleRowLog(i) {
    if(this.isButtonEnabled(i)){
      if(this.listOfLogs[i]['open']){
        this.listOfLogs[i]['open'] = !this.listOfLogs[i]['open'];
      } else {
        this.listOfLogs[i]['open'] = true;
      }
    }
    
  }

  onToggleLog(index: number) {
    console.log('[FLOW-WEBHOOKS-LOGS] onToggleLog index', index);
    // this.expandedLogIndex = this.expandedLogIndex === index ? null : index;
    if (this.expandedLogs.has(index)) {
      this.expandedLogs.delete(index); // collapse
    } else {
      this.expandedLogs.add(index); // expand
    }
  }

  isButtonEnabled(index: number): boolean {
    const blockTextId = "row-log-text_"+index;
    const elementText = document.getElementById(blockTextId);
    const blockButtonId = "row-log-button_"+index;
    const elementButton = document.getElementById(blockButtonId);
    if (elementText && elementButton) {
      if(elementText.offsetHeight > elementButton.offsetHeight){
        this.logger.log(`[CDS-WIDGET-LOG] ENABLED: ${elementText.offsetHeight}, ${elementButton.offsetHeight} px`);
        return true;
      } else {
        return false;
      }
    } else {
      this.logger.log(`[CDS-WIDGET-LOG] DISABLED: ${elementText.offsetHeight}, ${elementButton.offsetHeight} px`);
      return false;
    }
  }


}
