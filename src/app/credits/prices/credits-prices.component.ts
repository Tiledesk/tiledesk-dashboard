import { Component } from '@angular/core';
import { CreditsLlmPrice } from 'app/services/credits.service';
import { CreditsStore } from '../credits-store.service';
import { tokenUsage } from '../credits-resources';

const LLM_PRICES_SHOWN = 50;

/**
 * Costs in credits of the resources and of the AI models
 */
@Component({
  selector: 'appdashboard-credits-prices',
  templateUrl: './credits-prices.component.html'
})
export class CreditsPricesComponent {

  llmPriceFilter = '';

  constructor(public store: CreditsStore) { }

  /** The models used in the period, or the ones matching the search (at most LLM_PRICES_SHOWN) */
  get llmPriceRows(): CreditsLlmPrice[] {
    const prices = this.store.llmPrices;
    const filter = this.llmPriceFilter.trim().toLowerCase();
    if (filter) {
      return prices.filter((price) => price.id.toLowerCase().includes(filter)).slice(0, LLM_PRICES_SHOWN);
    }
    const used = tokenUsage(this.store.current).map((usage) => usage.model).filter(Boolean);
    return prices.filter((price) => used.some((model) => price.id === model || price.id.endsWith('/' + model)));
  }

  objectKeys(value: object): string[] {
    return value ? Object.keys(value) : [];
  }

  trackPrice(index: number, price: CreditsLlmPrice) {
    return price.id;
  }
}
