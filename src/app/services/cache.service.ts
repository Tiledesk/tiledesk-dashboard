import { Injectable } from '@angular/core';
import { Project } from 'app/models/project-model';
import { Observable } from 'rxjs';
import moment from 'moment';
import { LoggerService } from './logger/logger.service';
@Injectable({
  providedIn: 'root'
})
export class CacheService {

  readonly CACHE_DURATION_IN_MINUTES = 5;

  private cache: {
    expires: Date,
    value: Observable<Project[]>
  } = null;

  constructor(
    private logger: LoggerService,
  ) { }

  getValue(): Observable<Project[]> {

    if (!this.cache) {
      return null;
    }

    if (moment(new Date()).isAfter(this.cache.expires)) {
      this.logger.log('[CACHE SERV] GET VALUE cache.expires ' , moment(new Date()).isAfter(this.cache.expires) )
      return null;
    }
    // this.logger.log('[CACHE SERV] GET VALUE cache.value' , this.cache.value )
    this.logger.log('[CACHE SERV] GET VALUE cache expires' ,moment(this.cache.expires).fromNow() )
    return this.cache.value;
  }

  setValue(value: Observable<Project[]>) {
    // this.logger.log('[CACHE SERV] SET VALUE >>> value' , value )
    this.cache = {
      value,
      expires: moment(new Date()).add(this.CACHE_DURATION_IN_MINUTES, 'minutes').toDate()
    };
    // this.logger.log('[CACHE SERV] SET VALUE cache.expires' ,this.cache.expires )
    // this.logger.log('[CACHE SERV] SET VALUE cache.value' ,this.cache.value )
    this.logger.log('[CACHE SERV] SET VALUE cache expires' ,moment(this.cache.expires).fromNow() )
  }

  clearCache() {
    this.cache = null;
    this.logger.log('[CACHE SERV] clearCache')
  }
}
