import { Injectable } from '@angular/core';
import { LoggerService } from './logger/logger.service';

const REWARDFUL_JS_URL = 'https://r.wdfl.co/rw.js';
const REWARDFUL_DATA_ID = '351f89';

@Injectable({
  providedIn: 'root',
})
export class RewardfulLoaderService {
  private rewardfulLoaded = false;
  private loadPromise: Promise<void> | null = null;

  constructor(private logger: LoggerService) {}

  /** Loads Rewardful affiliate script (panel.tiledesk.com only). */
  loadRewardful(): Promise<void> {
    if (this.rewardfulLoaded) {
      return Promise.resolve();
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      const win = window as Window & {
        _rwq?: string;
        rewardful?: ((...args: unknown[]) => void) & { q?: unknown[] };
      };

      // Queue stub used by Rewardful before rw.js is ready.
      win._rwq = 'rewardful';
      win.rewardful = win.rewardful || function (...args: unknown[]) {
        (win.rewardful.q = win.rewardful.q || []).push(args);
      };

      const script = document.createElement('script');
      script.async = true;
      script.src = REWARDFUL_JS_URL;
      script.setAttribute('data-rewardful', REWARDFUL_DATA_ID);

      script.onload = () => {
        this.rewardfulLoaded = true;
        this.logger.log('[REWARDFUL-LOADER] Rewardful script loaded successfully');
        resolve();
      };

      script.onerror = (error) => {
        this.loadPromise = null;
        this.logger.error('[REWARDFUL-LOADER] Failed to load Rewardful script', error);
        reject(error);
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }
}
