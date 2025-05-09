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
    this.logger.log("[INT-Ollama] saveIntegration ", this.integration)
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

  }

 



}
