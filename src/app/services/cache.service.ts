import { Injectable } from '@angular/core';
import { Project } from 'app/models/project-model';
import { Observable } from 'rxjs';
import moment from 'moment';
@Injectable({
  providedIn: 'root'
})
export class CacheService {

  readonly CACHE_DURATION_IN_MINUTES = 5;

  private cache: {
    expires: Date,
    value: Observable<Project[]>
  } = null;

  constructor() { }

  getValue(): Observable<Project[]> {

    if (!this.cache) {
      return null;
    }

    if (moment(new Date()).isAfter(this.cache.expires)) {
      console.log('[CACHE SERV] GET VALUE cache.expires ' , moment(new Date()).isAfter(this.cache.expires) )
      return null;
    }
    // console.log('[CACHE SERV] GET VALUE cache.value' , this.cache.value )
    console.log('[CACHE SERV] GET VALUE cache expires' ,moment(this.cache.expires).fromNow() )
    return this.cache.value;
  }

  setValue(value: Observable<Project[]>) {
    // console.log('[CACHE SERV] SET VALUE >>> value' , value )
    this.cache = {
      value,
      expires: moment(new Date()).add(this.CACHE_DURATION_IN_MINUTES, 'minutes').toDate()
    };
    // console.log('[CACHE SERV] SET VALUE cache.expires' ,this.cache.expires )
    // console.log('[CACHE SERV] SET VALUE cache.value' ,this.cache.value )
    console.log('[CACHE SERV] SET VALUE cache expires' ,moment(this.cache.expires).fromNow() )
  }

  clearCache() {
    this.cache = null;
    console.log('[CACHE SERV] clearCache')
  }
}
