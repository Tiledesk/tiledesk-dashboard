import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IntegrationService } from 'app/services/integration.service';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'v-llm',
  templateUrl: './v-llm.component.html',
  styleUrls: ['./v-llm.component.scss']
})
export class VLLMComponent implements OnInit {

  @Input() integration: any;
  @Output() onUpdateIntegration = new EventEmitter;
  @Output() onDeleteIntegration = new EventEmitter;
  @ViewChild('enterButton') enterButtonRef?: ElementRef<HTMLElement>;

  translateparams: any;
  newModelName: string = '';

  constructor(
    private integrationService: IntegrationService,
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    this.logger.log('[INT-vLLM] integration ', this.integration);
    this.translateparams = { intname: 'vLLM' };
    if (!this.integration?.value) {
      this.integration.value = { url: null, token: null, models: [] };
    }
    if (!Array.isArray(this.integration.value.models)) {
      this.integration.value.models = [];
    }
  }

  addModel(modelName: string): void {
    this.hideEnterButton();
    const name = (modelName || '').trim();
    this.logger.log('[INT-vLLM] - addModel ', name);

    if (!Array.isArray(this.integration.value.models)) {
      this.integration.value.models = [];
    }

    if (name && !this.integration.value.models.includes(name)) {
      this.logger.log('[INT-vLLM] - addModel this.integration.value.models', this.integration.value.models);
      // New array reference so *ngFor reliably refreshes
      this.integration.value.models = [...this.integration.value.models, name];
    }
    this.newModelName = '';
  }

  onEnterModel(event: string): void {
    const enterBtnElement = this.enterButtonRef?.nativeElement;
    if (!enterBtnElement) { return; }

    if (event?.length > 0) {
      enterBtnElement.style.display = 'inline-block';
    } else {
      enterBtnElement.style.display = 'none';
    }
  }

  removeModel(modelName: string): void {
    if (!Array.isArray(this.integration.value.models)) {
      this.integration.value.models = [];
      return;
    }
    this.integration.value.models = this.integration.value.models.filter(model => model !== modelName);
  }

  saveIntegration() {
    const data = {
      integration: this.integration,
    };
    this.logger.log('[INT-vLLM] saveIntegration ', this.integration);
    this.onUpdateIntegration.emit(data);
  }

  deleteIntegration() {
    this.onDeleteIntegration.emit(this.integration);
  }

  resetValues() {
    this.integration.value = {
      url: null,
      token: null,
      models: []
    };
    this.newModelName = '';
  }

  handleInput(_event: Event): void {
    // Reserved for URL input handling
  }

  private hideEnterButton(): void {
    const enterBtnElement = this.enterButtonRef?.nativeElement;
    if (enterBtnElement) {
      enterBtnElement.style.display = 'none';
    }
  }
}
