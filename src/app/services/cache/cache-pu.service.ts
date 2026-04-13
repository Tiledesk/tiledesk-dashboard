import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import moment from 'moment';
import { ProjectUser } from 'app/models/project-user';
import { LoggerService } from '../logger/logger.service';

@Injectable({
  providedIn: 'root'
})
export class CachePuService {

  readonly CACHE_DURATION_IN_MINUTES = 5;

  private cache: {
    expires: Date,
    value: Observable<ProjectUser[]>
  } = null;

  constructor(
     private logger: LoggerService,
  ) { }

  getValue(): Observable<ProjectUser[]> {
    if (!this.cache) {
      this.logger.log('[CACHE-PU-SERV] GET VALUE - No cache available');
      return null;
    }

    if (moment(new Date()).isAfter(this.cache.expires)) {
      this.logger.log('[CACHE-PU-SERV] GET VALUE - Cache expired');
      this.cache = null; // Clean up expired cache
      return null;
    }
    
    this.logger.log('[CACHE-PU-SERV] GET VALUE - Cache hit, expires', moment(this.cache.expires).fromNow());
    return this.cache.value;
  }

  setValue(value: Observable<ProjectUser[]>) {
    this.cache = {
      value,
      expires: moment(new Date()).add(this.CACHE_DURATION_IN_MINUTES, 'minutes').toDate()
    };
    this.logger.log('[CACHE-PU-SERV] SET VALUE - Cache set, expires', moment(this.cache.expires).fromNow());
  }

   clearPuCache() {
    this.cache = null;
    this.logger.log('[CACHE-PU-SERV] CLEAR CACHE - Cache cleared');
  }
}
