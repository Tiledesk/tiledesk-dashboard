import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class SleekplanService {
  private sleekplanLoaded = false;
  constructor(

  ) { }

  loadSleekplan(): Promise<void> {
    console.log('loadSleekplan ');
    return new Promise((resolve, reject) => {
      if (this.sleekplanLoaded) {
        resolve();
        return;
      }

      this.sleekplanLoaded = true;

      // Configure Sleekplan product ID
      window['$sleek'] = [];
      window['SLEEK_PRODUCT_ID'] = 869241497; // Replace with your actual product ID

      // Dynamically load the Sleekplan script
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://client.sleekplan.com/sdk/e.js';
      script.async = true;

      script.onload = () => {
        console.log('Sleekplan script loaded successfully');
        resolve();
        
      };

      script.onerror = (error) => {
        console.error('Failed to load Sleekplan script', error);
        reject(error);
      };

      document.head.appendChild(script);
    });
  }

 
}
