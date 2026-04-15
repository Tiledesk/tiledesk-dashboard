import { Injectable } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class KbSitemapEventsService {
  readonly sitemap$: Observable<any> = fromEvent<CustomEvent>(document, 'on-send-sitemap').pipe(
    map((e) => e?.detail?.sitemap),
    filter((sitemap) => Boolean(sitemap)),
    shareReplay(1),
  );
}

