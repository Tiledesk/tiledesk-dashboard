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
  
  constructor(
    private integrationService: IntegrationService,
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    this.logger.log("[INT-Hubspot] integration ", this.integration)
    this.logger.debug("[INT-Hubspot] integration ", this.integration)
    this.translateparams = { intname: 'Hubspot' };
    if (this.integration.value.apikey) {
      this.checkKey(this.integration.value.apikey);
    }
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
    this.checkKey(this.integration.value.apikey).then((status) => {
      let data = {
        integration: this.integration,
        isVerified: status
      }
      this.onUpdateIntegration.emit(data);
    })
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

  checkKey(key: string) {
    return new Promise((resolve, reject) => {
      this.integrationService.checkKeyQapla(key).subscribe((resp: any) => {
        if (resp.getCouriers.result === 'OK') {
          this.isVerified = true;
          resolve(true);
        } else {
          this.isVerified = false;
          resolve(false);
        }
      }, (error) => {
        this.logger.error("[INT-Qapla] Key verification failed: ", error);
        this.isVerified = false;
        resolve(false);
      })
    })
  }

  resetValues() {
    this.integration.value = {
      apikey: null,
    }
  }

}
