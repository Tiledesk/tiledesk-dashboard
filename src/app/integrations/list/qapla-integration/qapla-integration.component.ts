import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IntegrationService } from 'app/services/integration.service';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'qapla-integration',
  templateUrl: './qapla-integration.component.html',
  styleUrls: ['./qapla-integration.component.scss']
})
export class QaplaIntegrationComponent implements OnInit {

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
    this.logger.debug("[INT-Qapla] integration ", this.integration)
    this.translateparams = { intname: "Qapla'" };
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
      let url = "https://api.qapla.it/1.2/getCouriers/?apiKey=" + this.integration.value.apikey;
      this.integrationService.checkIntegrationKeyValidity(url).subscribe((resp: any) => {
        if (resp.getCouriers.result === 'OK') {
          this.isVerified = true;
          resolve(true);
        } else {
          this.isVerified = false;
          resolve(false);
        }
      }, (error) => {
        this.logger.error("[INT-Qapla] Key verification failed: ", error);
        // check for CORS policies errors
        if (error.status == 0) {
          resolve(false);  
        } else {
          this.isVerified = false;
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

}
