import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IntegrationService } from 'app/services/integration.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { isMaskedApikey } from 'app/integrations/utils';

@Component({
  selector: 'v-llm',
  templateUrl: './v-llm.component.html',
  styleUrls: ['./v-llm.component.scss']
})
export class VLLMComponent implements OnInit {

  @Input() integration: any;
  @Output() onUpdateIntegration = new EventEmitter;
  @Output() onDeleteIntegration = new EventEmitter;

  translateparams: any;
  newModelName: string = '';
  apiKeyCanSave = true;
  apiKeyIsReplacing = false;

  constructor(
    private integrationService: IntegrationService,
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    this.logger.log("[INT-vLLM] integration ", this.integration)
    this.translateparams = { intname: 'vLLM' };
    if (!this.integration.value) {
      this.integration.value = { url: null, token: null, apikey: null, models: [] };
    }
    if (!Array.isArray(this.integration.value.models)) {
      this.integration.value.models = [];
    }
  }


  addModel(modelName: string): void {
    const name = String(modelName || '').trim();
    const enterBtnElement = document.getElementById('vllm-enter-button');
    if (enterBtnElement) {
      enterBtnElement.style.display = 'none';
    }
    this.logger.log('[INT-vLLM] - addModel ', name);
    if (!this.integration.value) {
      this.integration.value = { models: [] };
    }
    if (!Array.isArray(this.integration.value.models)) {
      this.integration.value.models = [];
    }
    if (name && !this.integration.value.models.includes(name)) {
      this.logger.log('[INT-vLLM] - addModel here yes modelName', name);
      this.integration.value.models.push(name);
    }
    this.newModelName = null;
  }

  onEnterModel(event) {
    const enterBtnElement = document.getElementById('vllm-enter-button');
    if (!enterBtnElement) {
      return;
    }
    if (event && event.length > 0) {
      enterBtnElement.style.display = 'inline-block';
    } else {
      enterBtnElement.style.display = 'none';
    }
  }

  removeModel(modelName: string): void {
    this.integration.value.models = this.integration.value.models.filter(model => model !== modelName);
  }

  saveIntegration() {
    // When replacing, drop masked leftover so we don't persist a non-usable key.
    if (this.apiKeyIsReplacing && isMaskedApikey(this.integration?.value?.apikey)) {
      this.integration.value.apikey = null;
    }
    let data = {
      integration: this.integration,
    }
    this.logger.log("[INT-vLLM] saveIntegration ", this.integration)
    this.onUpdateIntegration.emit(data);

  }

  deleteIntegration() {
    // this.newModelName = null
    this.onDeleteIntegration.emit(this.integration);
  }



  resetValues() {
    //  console.log("[INT-vLLM] resetValues ",  this.integration.value)
    this.integration.value = {
      url: null,
      token: null,
      apikey: null,
      models: []
    }

    this.newModelName = null
  }

}
