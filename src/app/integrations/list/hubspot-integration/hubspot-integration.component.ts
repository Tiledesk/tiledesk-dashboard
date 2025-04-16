import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IntegrationService } from 'app/services/integration.service';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'hubspot-integration',
  templateUrl: './hubspot-integration.component.html',
  styleUrls: ['./hubspot-integration.component.scss']
})
export class HubspotIntegrationComponent implements OnInit {

 
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
    this.logger.log("[INT-Hubspot] integration ", this.integration)
    this.logger.debug("[INT-Hubspot] integration ", this.integration)
    this.translateparams = { intname: 'Hubspot' };
    // if (this.integration.value.apikey) {
    //   this.checkKey();
    // }
  }

  showHideKey() {
    this.logger.log("showHideKey called");
    let input = <HTMLInputElement>document.getElementById('api-key-input');
    if (this.keyVisibile === false) {
      input.type = 'text';
    } else {
      input.type = 'password';
    }
    this.keyVisibile = !this.keyVisibile;
  }

  saveIntegration() {
    let data = {
      integration: this.integration
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

  // saveIntegration() {
  //   console.log("save integration clicked");
  //   console.log("save following data: ", this.integration_data);
    
  //   this.integrationService.saveIntegration(this.integration_data).subscribe((result) => {
  //     console.log("save integration result: ", result);
  //     this.onUpdateIntegration.emit();
  //   }, (error) => {
  //     console.error("save integration error: ", error);
  //   }, () => {
  //     console.log("save integration *COMPLETED*");    
  //   })

  // }

  deleteIntegration() {
    this.isVerified = null;
    this.onDeleteIntegration.emit(this.integration);
  }

  // deleteIntegration() {
  //   console.log("delete integration clicked")

  //   this.integrationService.deleteIntegration(this.integration._id).subscribe((result) => {
  //     console.log("delete integration result: ", result);
  //     this.check_status = null;
  //     this.onDeleteIntegration.emit();
  //   }, (error) => {
  //     console.error("delete integration error: ", error);
  //   }, () => {
  //     console.log("delete integration *COMPLETE*");
  //   })
  // }

  checkKey() {
    return new Promise((resolve) => {
      this.logger.log('checkKey  this.integration.value.apikey; ', this.integration.value.apikey)
      let url = "https://api.hubapi.com/account-info/v3/details"; // "https://api.hubapi.com/integrations/v1/me"; //"https://api.hubapi.com/crm/v3/objects/contacts?limit=10";
      let key = "Bearer " + this.integration.value.apikey;
      this.integrationService.checkIntegrationKeyValidity(url, key).subscribe((resp: any) => {
        this.isVerified = true;      
        resolve(true);
      }, (error) => {
        this.isVerified = false;
        this.logger.error("[INT-Hubspot] Key verification failed: ", error);
        if (error.status === 0) {
          resolve(false);
        } else {
          resolve(false);

        }
      })
    })
  }

  resetValues() {
    this.integration.value = {
      apikey: null
    }
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
