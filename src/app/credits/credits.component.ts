import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, IsActiveMatchOptions } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CreditsStore } from './credits-store.service';

/**
 * Credits section: header, notices and tabs, with the pages (overview, AI models, history, prices) as children.
 * The styles are not encapsulated so that the pages share them (every class starts with credits-).
 */
@Component({
  selector: 'appdashboard-credits',
  templateUrl: './credits.component.html',
  styleUrls: ['./credits.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [CreditsStore]
})
export class CreditsComponent implements OnInit, OnDestroy {

  readonly tabs = [
    { page: '', label: 'Credits.Tabs.Overview' },
    { page: 'models', label: 'Credits.Tabs.Models' },
    { page: 'history', label: 'Credits.Tabs.History' },
    { page: 'prices', label: 'Credits.Tabs.Prices' }
  ];

  // the overview is active only on its own path, with or without the checkout outcome
  readonly tabMatch: IsActiveMatchOptions = { paths: 'exact', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' };

  checkoutOutcome: 'success' | 'cancel' | null = null;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    public store: CreditsStore
  ) { }

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.unsubscribe$)).subscribe((params) => {
      this.store.setProject(params.get('projectid'));
    });
    this.route.queryParamMap.pipe(takeUntil(this.unsubscribe$)).subscribe((params) => {
      const outcome = params.get('credits_checkout');
      this.checkoutOutcome = outcome === 'success' || outcome === 'cancel' ? outcome : null;
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
