import { Injectable } from '@angular/core';
import { LogRequestsInterceptor } from './interceptor/log-requests.interceptor';

export interface HttpStats {
  [endpoint: string]: {
    count: number;
    totalTime: number;
    avgTime: number;
  };
}

@Injectable({ providedIn: 'root' })
export class HttpStatsService {
  private stats: HttpStats = {};
  constructor() {}

  // Metodo per aggiornare le statistiche (chiamato dall'interceptor)
  updateStats(endpoint: string, method: string, duration: number) {
    // Crea una chiave unica che include metodo ed endpoint
    const key = `${method} ${endpoint}`;
    
    if (!this.stats[key]) {
      this.stats[key] = { count: 0, totalTime: 0, avgTime: 0 };
    }

    this.stats[key].count++;
    this.stats[key].totalTime += duration;
    this.stats[key].avgTime = this.stats[key].totalTime / this.stats[key].count;
  }

  // Metodo per ottenere le statistiche
  getStats(): HttpStats {
    return { ...this.stats }; // Restituisce una copia
  }

  // Metodo per resettare le statistiche (opzionale)
  resetStats() {
    this.stats = {};
  }
}