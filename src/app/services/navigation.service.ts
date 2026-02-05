import { Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { LoggerService } from './logger/logger.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  private currentUrlSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public currentUrl$: Observable<string> = this.currentUrlSubject.asObservable();
  private backSubject = new Subject<void>();

  emitBack(): void {
    this.backSubject.next();
  }

  onBack(): Observable<void> {
    return this.backSubject.asObservable();
  }

  constructor(
    private router: Router,
    private location: Location,
    private logger: LoggerService
  ) {
    // this.initNavigationTracking();
  }

  /**
   * Inizializza il tracking della navigazione
   */
  private initNavigationTracking(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map((event: NavigationEnd) => event.urlAfterRedirects)
      )
      .subscribe((url: string) => {
        this.currentUrlSubject.next(url);
        this.logger.log('[NAVIGATION-SERVICE] Navigation ended to:', url);
      });
  }

  /**
   * Ottiene l'URL corrente
   */
  getCurrentUrl(): string {
    return this.currentUrlSubject.value || this.router.url;
  }

  /**
   * Naviga a una route specifica
   */
  navigateTo(route: string, queryParams?: any): Promise<boolean> {
    this.logger.log('[NAVIGATION-SERVICE] Navigating to:', route, queryParams);
    return this.router.navigate([route], { queryParams });
  }

  /**
   * Naviga indietro nella history
   */
  goBack(): void {
    this.location.back();
  }

  /**
   * Naviga avanti nella history
   */
  goForward(): void {
    this.location.forward();
  }

  /**
   * Verifica se una route è attiva
   */
  isRouteActive(route: string): boolean {
    return this.getCurrentUrl().includes(route);
  }

  /**
   * Ottiene i query parameters della route corrente
   */
  getQueryParams(): Observable<any> {
    return this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let route = this.router.routerState.root;
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route.snapshot.queryParams;
      })
    );
  }

  /**
   * Naviga mantenendo i query parameters esistenti
   */
  navigateWithQueryParams(route: string, additionalParams?: any): Promise<boolean> {
    this.getQueryParams().subscribe(currentParams => {
      const mergedParams = { ...currentParams, ...additionalParams };
      this.navigateTo(route, mergedParams);
    });
    return this.navigateTo(route, additionalParams);
  }
}

