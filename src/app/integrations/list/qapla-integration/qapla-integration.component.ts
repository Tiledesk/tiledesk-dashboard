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
      this.checkKey(this.integration.value.apikey);
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
        this.logger.error("[INT-Qapla] Key verification failed: ", error);
        this.isVerified = false;
        resolve(false);
      })
    })
  }

  resetValues() {
    this.integration.value = {
      apikey: null
    }
  }

}
