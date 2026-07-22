import { Injectable } from '@angular/core';
import { LoggerService } from './logger/logger.service';

const STRIPE_JS_URL = 'https://js.stripe.com/v3';

@Injectable({
  providedIn: 'root',
})
export class StripeLoaderService {
  private stripeLoaded = false;
  private loadPromise: Promise<void> | null = null;

  constructor(private logger: LoggerService) {}

  /** Dynamically loads Stripe.js once (used when PAY is enabled). */
  loadStripe(): Promise<void> {
    if (this.stripeLoaded || (window as Window & { Stripe?: unknown }).Stripe) {
      this.stripeLoaded = true;
      return Promise.resolve();
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = STRIPE_JS_URL;
      script.async = true;

      script.onload = () => {
        this.stripeLoaded = true;
        this.logger.log('[STRIPE-LOADER] Stripe.js loaded successfully');
        resolve();
      };

      script.onerror = (error) => {
        this.loadPromise = null;
        this.logger.error('[STRIPE-LOADER] Failed to load Stripe.js', error);
        reject(error);
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }
}
