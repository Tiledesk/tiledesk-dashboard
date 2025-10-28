import { RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';

/**
 * Custom RouteReuseStrategy per mantenere in cache componenti specifici
 * 
 * Questa strategia permette di:
 * 1. Mantenere l'iframe conversation-detail in memoria quando si naviga via
 * 2. Evitare il reload dell'iframe quando si torna sulla route
 * 3. Migliorare le performance e l'esperienza utente
 */
export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  
  // Store per i componenti cached
  private storedRoutes = new Map<string, DetachedRouteHandle>();
  
  // Lista delle route da cachare (whitelist)
  private routesToCache: string[] = [
    'conversation-detail',
  ];

  /**
   * Determina se la route dovrebbe essere riutilizzata
   */
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  /**
   * Determina se salvare (detach) il componente quando si naviga via
   */
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    const path = this.getRoutePath(route);
    const shouldCache = this.shouldCacheRoute(path);
    
    return shouldCache;
  }

  /**
   * Salva (store) il componente detached
   */
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    if (handle) {
      const path = this.getRoutePath(route);
      this.storedRoutes.set(path, handle);
    }
  }

  /**
   * Determina se recuperare (attach) un componente salvato
   */
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const path = this.getRoutePath(route);
    const hasStoredRoute = this.storedRoutes.has(path);
    
    return hasStoredRoute;
  }

  /**
   * Recupera il componente salvato dalla cache
   */
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const path = this.getRoutePath(route);
    const handle = this.storedRoutes.get(path);
    
    return handle || null;
  }

  /**
   * Utility per ottenere il path della route
   */
  private getRoutePath(route: ActivatedRouteSnapshot): string {
    if (route.routeConfig && route.routeConfig.path) {
      return route.routeConfig.path;
    }
    
    return route.pathFromRoot
      .map(v => v.url.map(segment => segment.toString()).join('/'))
      .join('/');
  }

  /**
   * Verifica se una route dovrebbe essere cachata
   * Gestisce sia path semplici che path con parametri
   */
  private shouldCacheRoute(path: string): boolean {
    // Check esatto
    if (this.routesToCache.includes(path)) {
      return true;
    }
    
    // Check se il path contiene una delle route da cachare
    return this.routesToCache.some(cachePath => {
      const pathSegments = path.split('/');
      return pathSegments.includes(cachePath);
    });
  }

  /**
   * Pulisci cache
   */
  public clearCache(path?: string): void {
    if (path) {
      this.storedRoutes.delete(path);
    } else {
      this.storedRoutes.clear();
    }
  }

  /**
   * Ottieni numero di route in cache
   */
  public getCacheSize(): number {
    return this.storedRoutes.size;
  }

  /**
   * Ottieni lista delle route cachate
   */
  public getCachedRoutes(): string[] {
    return Array.from(this.storedRoutes.keys());
  }
}
