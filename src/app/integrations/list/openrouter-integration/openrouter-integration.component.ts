import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IntegrationService } from 'app/services/integration.service';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'openrouter-integration',
  templateUrl: './openrouter-integration.component.html',
  styleUrls: ['./openrouter-integration.component.scss']
})
export class OpenRouterIntegrationComponent implements OnInit {

  @Input() integration: any;
  @Output() onUpdateIntegration = new EventEmitter;
  @Output() onDeleteIntegration = new EventEmitter;

  keyVisibile: boolean = false;
  isVerified: boolean;
  translateparams: any;
  isMasked: boolean = true; // State for masking

  constructor(
    private integrationService: IntegrationService,
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    this.logger.log('[INT-OPENROUTER] integration ', this.integration);
    this.translateparams = { intname: 'OpenRouter' };
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
      const url = 'https://openrouter.ai/api/v1/models';
      const key = 'Bearer ' + this.integration.value.apikey;
      this.integrationService.checkIntegrationKeyValidity(url, key).subscribe((resp) => {
        this.logger.log('[INT-OPENROUTER] Key verification resp: ', resp);
        this.isVerified = true;
        resolve(true);
      }, (error) => {
        this.logger.error('[INT-OPENROUTER] Key verification failed: ', error);
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

  // ---------------------------------------------------
  // Mask Api key without use input of password type
  // ---------------------------------------------------
  handleInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const displayedValue = inputElement.value;

    if (this.isMasked && this.integration.value.apikey) {
      const newChar = displayedValue.slice(this.integration.value.apikey.length);
      this.integration.value.apikey += newChar;
    } else {
      this.integration.value.apikey = displayedValue;
    }

    inputElement.value = this.getDisplayValue();
  }

  handleBackspace(): void {
    this.integration.value.apikey = this.integration.value.apikey.slice(0, -1);
  }

  toggleMask(inputElement: HTMLInputElement): void {
    this.isMasked = !this.isMasked;
    inputElement.value = this.getDisplayValue();
  }

  getDisplayValue(): string {
    if (!this.integration.value.apikey) {
      return '';
    }
    return this.isMasked ? '●'.repeat(this.integration.value.apikey.length) : this.integration.value.apikey;
  }

}
