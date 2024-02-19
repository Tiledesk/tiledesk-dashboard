import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IntegrationService } from 'app/services/integration.service';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'customerio-integration',
  templateUrl: './customerio-integration.component.html',
  styleUrls: ['./customerio-integration.component.scss']
})
export class CustomerioIntegrationComponent implements OnInit {

  @Input() integration: any;
  @Output() onUpdateIntegration = new EventEmitter;
  @Output() onDeleteIntegration = new EventEmitter;

  keyVisibile: boolean = false;
  isVerified: boolean;

  constructor(
    private integrationService: IntegrationService,
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    this.logger.log("[INT-Customer.io] integration ", this.integration)
    this.logger.debug("[INT-Customer.io] integration ", this.integration)
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

  deleteIntegration() {
    this.isVerified = null;
    this.onDeleteIntegration.emit(this.integration);
  }

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
        this.logger.error("[INT-Customer.io] Key verification failed: ", error);
        this.isVerified = false;
        resolve(false);
      })
    })
  }

  resetValues() {
    this.integration.value = {
      apikey: null,
      siteid: null
    }
  }

}
