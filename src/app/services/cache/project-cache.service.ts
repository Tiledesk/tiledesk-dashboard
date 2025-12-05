import { Injectable } from '@angular/core';
import { Project } from 'app/models/project-model';
import { Observable } from 'rxjs';
import moment from 'moment';
import { LoggerService } from '../logger/logger.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectCacheService {

  readonly CACHE_DURATION_IN_MINUTES = 5;

  // Cache per singoli progetti (key: projectId, value: {expires, value})
  private projectCache: Map<string, {
    expires: Date,
    value: Observable<Project[]>
  }> = new Map();

  constructor(
    private logger: LoggerService,
  ) { }

  /**
   * Ottiene un progetto dalla cache se disponibile e non scaduto
   * @param projectId ID del progetto
   * @returns Observable<Project[]> se in cache e valido, null altrimenti
   */
  getProjectById(projectId: string): Observable<Project[]> | null {
    const cached = this.projectCache.get(projectId);
    
    if (!cached) {
      this.logger.log('[PROJECT-CACHE-SERV] GET PROJECT BY ID - No cache for project:', projectId);
      return null;
    }

    if (moment(new Date()).isAfter(cached.expires)) {
      this.logger.log('[PROJECT-CACHE-SERV] GET PROJECT BY ID - Cache expired for project:', projectId);
      this.projectCache.delete(projectId);
      return null;
    }

    this.logger.log('[PROJECT-CACHE-SERV] GET PROJECT BY ID - Cache hit for project:', projectId, 'expires', moment(cached.expires).fromNow());
    return cached.value;
  }

  /**
   * Salva un progetto nella cache
   * @param projectId ID del progetto
   * @param value Observable del progetto
   */
  setProjectById(projectId: string, value: Observable<Project[]>) {
    this.projectCache.set(projectId, {
      value,
      expires: moment(new Date()).add(this.CACHE_DURATION_IN_MINUTES, 'minutes').toDate()
    });
    this.logger.log('[PROJECT-CACHE-SERV] SET PROJECT BY ID - Cached project:', projectId, 'expires', moment(this.projectCache.get(projectId).expires).fromNow());
  }

  /**
   * Rimuove un progetto specifico dalla cache
   * @param projectId ID del progetto da rimuovere
   */
  clearProjectCache(projectId: string) {
    const deleted = this.projectCache.delete(projectId);
    if (deleted) {
      this.logger.log('[PROJECT-CACHE-SERV] CLEAR PROJECT CACHE - Removed cache for project:', projectId);
    }
  }

  /**
   * Rimuove tutti i progetti dalla cache
   */
  clearAllProjectCache() {
    this.projectCache.clear();
    this.logger.log('[PROJECT-CACHE-SERV] CLEAR ALL PROJECT CACHE - Removed all project caches');
  }
}

