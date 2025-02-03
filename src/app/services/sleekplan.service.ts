import { Injectable } from '@angular/core';
import { LoggerService } from './logger/logger.service';


@Injectable({
  providedIn: 'root'
})
export class SleekplanService {
  private sleekplanLoaded = false;
  constructor(
    private logger: LoggerService,
  ) { }

  loadSleekplan(): Promise<void> {
    this.logger.log('[SLEEKPLAN-SERV] - loadSleekplan ');
    return new Promise((resolve, reject) => {
      if (this.sleekplanLoaded) {
        resolve();
        return;
      }

      this.sleekplanLoaded = true;

      // Configure Sleekplan product ID
      window['$sleek'] = [];
      window['SLEEK_PRODUCT_ID'] = 869241497; // The good one product ID
      // window['SLEEK_PRODUCT_ID'] = 615248482 // for test

      // Dynamically load the Sleekplan script
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://client.sleekplan.com/sdk/e.js';
      script.async = true;

      script.onload = () => {
        console.log('[SLEEKPLAN-SERV] - Sleekplan script loaded successfully');
        resolve();
        
      };

      script.onerror = (error) => {
        this.logger.error('[SLEEKPLAN-SERV] - Failed to load Sleekplan script', error);
        reject(error);
      };

      document.head.appendChild(script);

     
    });
  }


 
}
