import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IntegrationService } from 'app/services/integration.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { isMaskedApikey } from 'app/integrations/utils';

@Component({
  selector: 'cerebras-integration',
  templateUrl: './cerebras-integration.component.html',
  styleUrls: ['./cerebras-integration.component.scss']
})
export class CerebrasIntegrationComponent implements OnInit {

  @Input() integration: any;
  @Output() onUpdateIntegration = new EventEmitter;
  @Output() onDeleteIntegration = new EventEmitter;

  isVerified: boolean;
  translateparams: any;
  apiKeyCanSave = false;

  constructor(
    private integrationService: IntegrationService,
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    this.logger.log('[INT-CEREBRAS] integration ', this.integration);
    this.translateparams = { intname: 'Cerebras' };
    if (this.integration.value.apikey && !isMaskedApikey(this.integration.value.apikey)) {
      this.checkKey();
    }
  }

  saveIntegration() {
    this.checkKey().then((status) => {
      let data = {
        integration: this.integration,
        isVerified: status
      };
      this.onUpdateIntegration.emit(data);
    });
  }

  deleteIntegration() {
    this.isVerified = null;
    this.onDeleteIntegration.emit(this.integration);
  }

  checkKey() {
    return new Promise((resolve) => {
      const url = 'https://api.cerebras.ai/v1/models';
      const key = 'Bearer ' + this.integration.value.apikey;
      this.integrationService.checkIntegrationKeyValidity(url, key).subscribe((resp) => {
        this.logger.log('[INT-CEREBRAS] Key verification resp: ', resp);
        this.isVerified = true;
        resolve(true);
      }, (error) => {
        this.logger.error('[INT-CEREBRAS] Key verification failed: ', error);
        this.isVerified = false;
        resolve(false);
      });
    });
  }

  resetValues() {
    this.integration.value = {
      apikey: null,
      organization: null
    };
  }

}
