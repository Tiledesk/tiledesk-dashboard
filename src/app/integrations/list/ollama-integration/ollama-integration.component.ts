import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IntegrationService } from 'app/services/integration.service';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'ollama-integration',
  templateUrl: './ollama-integration.component.html',
  styleUrls: ['./ollama-integration.component.scss']
})
export class OllamaIntegrationComponent implements OnInit {

  @Input() integration: any;
  @Output() onUpdateIntegration = new EventEmitter;
  @Output() onDeleteIntegration = new EventEmitter;

  translateparams: any;
  newModelName: string = '';
  isMasked: boolean = true; // State for masking

  constructor(
    private integrationService: IntegrationService,
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    this.logger.log("[INT-Ollama] integration ", this.integration)
    this.translateparams = { intname: 'Ollama' };
  }

  
  addModel(modelName: string): void {
    let enterBtnElement = document.getElementById('enter-button')
    enterBtnElement.style.display = 'none';
    this.logger.log('[INT-Ollama] - addModel ', modelName)
    if (modelName && !this.integration.value.models.includes(modelName)) {
      this.logger.log('[INT-Ollama] - addModel here yes modelName', modelName)
      this.logger.log('[INT-Ollama] - addModel this.integration.value.models', this.integration.value.models)
      this.integration.value.models.push(modelName);
      
    }
    this.newModelName = null
  }

  onEnterModel(event) {
    // console.log('[INT-Ollama] - onEnterModel event', event)
    let enterBtnElement = document.getElementById('enter-button')
    // console.log('[INT-Ollama] - onEnterModel enterBtnElement', enterBtnElement)
    if (event.length > 0) {
      enterBtnElement.style.display = 'inline-block';
    } else {
      enterBtnElement.style.display = 'none';
    }
  }

  removeModel(modelName: string): void {
    this.integration.value.models =  this.integration.value.models.filter(model => model !== modelName);
  }

  saveIntegration() {
    let data = {
      integration: this.integration,
    }
    // console.log("[INT-Ollama] saveIntegration ", this.integration)
    this.onUpdateIntegration.emit(data);
   
  }

  deleteIntegration() {
    // this.newModelName = null
    this.onDeleteIntegration.emit(this.integration);
  }

  

  resetValues() {
  //  console.log("[INT-Ollama] resetValues ",  this.integration.value)
    this.integration.value = {
      url: null,
      token: null,
      apikey: null,
      models: []
    }

    this.newModelName = null
  }

 
  // ---------------------------------------------------
  // Mask Api key without use input of password type
  // ---------------------------------------------------
  handleInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const displayedValue = inputElement.value;

    // Update realValue based on input length and masking state
    if (this.isMasked && this.integration.value.apikey) {
      // Add only new characters to realValue
      const newChar = displayedValue.slice(this.integration.value.apikey.length);
      this.integration.value.apikey += newChar;
    } else {
      // Directly update realValue when unmasked
      this.integration.value.apikey = displayedValue;
    }

    // Always set the displayed value to match the current state
    inputElement.value = this.getDisplayValue();
  }

  handleBackspace(): void {
    this.integration.value.apikey = this.integration.value.apikey.slice(0, -1);
  }

  toggleMask(inputElement: HTMLInputElement): void {
    this.isMasked = !this.isMasked;

    // Update the displayed value immediately when toggling the mask
    inputElement.value = this.getDisplayValue();
  }

  getDisplayValue(): string {
    if (!this.integration.value.apikey) {
      return ''; // Return an empty string if realValue is null, undefined, or empty
    }
    return this.isMasked ? '●'.repeat(this.integration.value.apikey.length) : this.integration.value.apikey;
  }

 



}
