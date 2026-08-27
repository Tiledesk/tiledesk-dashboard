import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IntegrationService } from 'app/services/integration.service';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'anthropic-integration',
  templateUrl: './anthropic-integration.component.html',
  styleUrls: ['./anthropic-integration.component.scss']
})
export class AnthropicIntegrationComponent implements OnInit {

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
    this.logger.log("[INT-Anthropic] integration ", this.integration)
    this.translateparams = { intname: 'Anthropic' };
    // if (this.integration.value.apikey) {
    //   this.checkKey();
    // }
  }

  saveIntegration() {

    let data = {
      integration: this.integration,
    }
    this.onUpdateIntegration.emit(data);
    // this.checkKey().then((status) => {
    //   let data = {
    //     integration: this.integration,
    //     isVerified: status
    //   }
    //   this.onUpdateIntegration.emit(data);
    // })
  }

  deleteIntegration() {
    this.isVerified = null;
    this.onDeleteIntegration.emit(this.integration);
  }

  checkKey() {
    return new Promise((resolve) => {
      let url = 'https://api.anthropic.com/v1/models';
      let key = this.integration.value.apikey;
      this.integrationService.checkAnthropicKeyValidity(url, key).subscribe((resp) => {
        this.logger.log("[INT-Anthropic] Key verification resp : ", resp);
        this.isVerified = true;
        resolve(true);
      }, (error) => {
        this.logger.error("[INT-Anthropic] Key verification failed: ", error);
        this.isVerified = false;
        resolve(false);
      })
    })
  }

  resetValues() {
    this.integration.value = {
      apikey: null,
      organization: null
    }
  }
}
