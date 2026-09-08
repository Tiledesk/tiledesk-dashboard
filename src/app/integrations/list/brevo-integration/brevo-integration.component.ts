import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IntegrationService } from 'app/services/integration.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { isMaskedApikey } from 'app/integrations/utils';

@Component({
  selector: 'brevo-integration',
  templateUrl: './brevo-integration.component.html',
  styleUrls: ['./brevo-integration.component.scss']
})
export class BrevoIntegrationComponent implements OnInit {

  @Input() integration: any;
  @Output() onUpdateIntegration = new EventEmitter;
  @Output() onDeleteIntegration = new EventEmitter;

  isVerified: boolean;

  translateparams: any;
  apiKeyCanSave = false;

  constructor(
    private integrationService: IntegrationService,
    private logger: LoggerService,
  ) { }

  ngOnInit(): void {
    this.logger.debug("[INT-Brevo] integration ", this.integration)
    this.translateparams = { intname: "Brevo" }
    if (this.integration.value.apikey && !isMaskedApikey(this.integration.value.apikey)) {
      this.checkKey();
    }
  }

  saveIntegration() {
    this.checkKey().then((status) => {
      let data = {
        integration: this.integration,
        isVerified: status
      }
      this.onUpdateIntegration.emit(data);
    })
  }

  deleteIntegration() {
    this.isVerified = null;
    this.onDeleteIntegration.emit(this.integration);
  }

  checkKey() {
    return new Promise((resolve) => {
      let url = "https://api.brevo.com/v3/contacts?limit=2";
      let apikey = 'Basic ' + this.integration.value.apikey;
      this.integrationService.checkIntegrationKeyValidity(url, null, apikey).subscribe((resp: any) => {
        this.isVerified = true;
        resolve(true);
      }, (error) => {
        this.logger.error("[INT-Customer.io] Key verification failed: ", error);
        this.isVerified = false;
        resolve(false);
      })
    })
  }

  resetValues() {
    this.integration.value = {
      apikey: null
    }
  }

}
