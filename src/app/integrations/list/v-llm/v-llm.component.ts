import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
 
   translateparams: any;
   newModelName: string = '';
   isMasked: boolean = true; // State for masking
   keyVisibile: boolean = false;

   constructor(
     private integrationService: IntegrationService,
     private logger: LoggerService
   ) { }
 
   ngOnInit(): void {
     this.logger.log("[INT-vLLM] integration ", this.integration)
     this.translateparams = { intname: 'vLLM' };
   }
 
   
   addModel(modelName: string): void {
     let enterBtnElement = document.getElementById('enter-button')
     enterBtnElement.style.display = 'none';
     this.logger.log('[INT-vLLM] - addModel ', modelName)
     if (modelName && !this.integration.value.models.includes(modelName)) {
       this.logger.log('[INT-vLLM] - addModel here yes modelName', modelName)
       this.logger.log('[INT-vLLM] - addModel this.integration.value.models', this.integration.value.models)
       this.integration.value.models.push(modelName);
       
     }
     this.newModelName = null
   }
 
   onEnterModel(event) {
     // console.log('[INT-vLLM] - onEnterModel event', event)
     let enterBtnElement = document.getElementById('enter-button')
     // console.log('[INT-vLLM] - onEnterModel enterBtnElement', enterBtnElement)
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
 
  showHideKey() {
    let input = <HTMLInputElement>document.getElementById('api-key-input');
    if (this.keyVisibile === false) {
      input.type = 'text';
    } else {
      input.type = 'password';
    }
    this.keyVisibile = !this.keyVisibile;
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
