import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IntegrationService } from 'app/services/integration.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { OpenaiService } from 'app/services/openai.service';

@Component({
  selector: 'openai-integration',
  templateUrl: './openai-integration.component.html',
  styleUrls: ['./openai-integration.component.scss']
})
export class OpenaiIntegrationComponent implements OnInit {

  @Input() integration: any;
  @Output() onUpdateIntegration = new EventEmitter;
  @Output() onDeleteIntegration = new EventEmitter;

  keyVisibile: boolean = false;
  isVerified: boolean;
  translateparams: any;

  constructor(
    private integrationService: IntegrationService,
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    this.logger.debug("[INT-OpenAI] integration ", this.integration)
    this.translateparams = { intname: 'OpenAI' };
    if (this.integration.value.apikey) {
      this.checkKey();
    }
  }

  showHideKey() {
    let input = <HTMLInputElement>document.getElementById('api-key-input');
    if (this.keyVisibile === false) {
      input.type = 'text';
    } else {
      input.type = 'password';
    }
    this.keyVisibile = !this.keyVisibile;
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
      let url = "https://api.openai.com/v1/models";
      let key = "Bearer " + this.integration.value.apikey;
      this.integrationService.checkIntegrationKeyValidity(url, key).subscribe((resp) => {
        this.isVerified = true;
        resolve(true);
      }, (error) => {
        this.logger.error("[INT-OpenAI] Key verification failed: ", error);
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
