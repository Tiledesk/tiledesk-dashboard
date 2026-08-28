import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IntegrationService } from 'app/services/integration.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { isMaskedApikey } from 'app/integrations/utils';

@Component({
  selector: 'google-integration',
  templateUrl: './google-integration.component.html',
  styleUrls: ['./google-integration.component.scss']
})
export class GoogleIntegrationComponent implements OnInit {

  @Input() integration: any;
  @Output() onUpdateIntegration = new EventEmitter;
  @Output() onDeleteIntegration = new EventEmitter;

  isVerified: boolean;
  translateparams: any;
  apiKeyCanSave = false;

  constructor(
    private integrationService: IntegrationService,
    private logger: LoggerService
  ) { 
    
  }

  
  ngOnInit(): void {
    this.logger.log("[INT-GOOGLE-GEMINI] integration ", this.integration)
    this.translateparams = { intname: 'Google AI' };
    if (this.integration.value.apikey && !isMaskedApikey(this.integration.value.apikey)) {
      this.checkKey();
    }
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
                //  https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash?key=YOUR_GEMINI_API_KEY
     // let url_old = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash?key=" + this.integration.value.apikey;
      const url = "https://generativelanguage.googleapis.com/v1beta/models?key=" + this.integration.value.apikey;
      this.integrationService.checkIntegrationKeyValidity(url).subscribe((resp: any) => {
        this.logger.log('[INT-GOOGLE-GEMINI] resp ' ,resp)
        if (resp) {
          this.isVerified = true;
          resolve(true);
        } 
      }, (error) => {
        this.logger.error("[INT-GOOGLE-GEMINI] Key verification failed: ", error);
        // check for CORS policies errors
        if (error.status == 0) {
          this.isVerified = false;
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
      apikey: null,
      organization: null
    }
  }

}
