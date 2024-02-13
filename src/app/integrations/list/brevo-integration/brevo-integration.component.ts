import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IntegrationService } from 'app/services/integration.service';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'brevo-integration',
  templateUrl: './brevo-integration.component.html',
  styleUrls: ['./brevo-integration.component.scss']
})
export class BrevoIntegrationComponent implements OnInit {

  @Input() integration: any;
  @Output() onUpdateIntegration = new EventEmitter;
  @Output() onDeleteIntegration = new EventEmitter;

  keyVisibile: boolean = false;
  isVerified: boolean;

  constructor(
    private integrationService: IntegrationService,
    private logger: LoggerService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.logger.debug("[INT-Brevo] integration ", this.integration)
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
