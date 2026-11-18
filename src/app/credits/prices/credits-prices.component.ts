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
    const used = new Set<string>();
    tokenUsage(this.store.current).forEach((usage) => usage.model && modelIds(usage.model).forEach((id) => used.add(id)));
    return prices.filter((price) => used.has(price.id) || used.has(price.id.split('/').pop()));
  }

  objectKeys(value: object): string[] {
    return value ? Object.keys(value) : [];
  }

  trackPrice(index: number, price: CreditsLlmPrice) {
    return price.id;
  }
}

/**
 * The ids of the price list a reported model can have, as the server looks them up: without the date of the
 * snapshot (gpt-4o-2024-08-06, claude-sonnet-4-5-20250929, -latest) and with the dotted versions of OpenRouter
 * (claude-sonnet-4-5 -> claude-sonnet-4.5).
 */
function modelIds(model: string): string[] {
  const undated = model.replace(/-(\d{4}-?\d{2}-?\d{2}|latest)$/, '');
  const dotted = undated.replace(/(\d)-(\d)(?=$|-)/g, '$1.$2');
  return [model, undated, dotted];
}
