import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { isMaskedApikey } from 'app/integrations/utils';
import { IntegrationService } from 'app/services/integration.service';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'customerio-integration',
  templateUrl: './customerio-integration.component.html',
  styleUrls: ['./customerio-integration.component.scss']
})
export class CustomerioIntegrationComponent implements OnInit {

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
    this.logger.debug("[INT-Customer.io] integration ", this.integration)
    this.translateparams = { intname: "Customer.io" };
    if (this.integration.value.apikey && !isMaskedApikey(this.integration.value.apikey)) {
      this.checkKey();
    }
  }

  onApikeyChange(value: string | null): void {
    // Raw key used to build Basic auth; stored/masked apikey stays for display until Save.
    this.integration.value.key = value;
  }

  saveIntegration() {
    let apikey = btoa(this.integration.value.siteid + ":" + this.integration.value.key);
    this.integration.value.apikey = apikey;
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
      this.logger.log("[INT-Customer.io] integration.value.apikey" , this.integration.value.apikey)
      let url = "https://track.customer.io/api/v1/accounts/region";
      let apikey = 'Basic ' + this.integration.value.apikey;
      this.integrationService.checkIntegrationKeyValidity(url, apikey).subscribe((resp: any) => {
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
      siteid: null,
      key: null,
      apikey: null
    }
  }

}
