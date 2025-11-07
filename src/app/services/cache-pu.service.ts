import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import moment from 'moment';
import { LoggerService } from './logger/logger.service';
import { ProjectUser } from 'app/models/project-user';


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
      return null;
    }

    if (moment(new Date()).isAfter(this.cache.expires)) {
      console.log('[USER-SERV][CACHE-PU SERV] GET VALUE cache.expires ' , moment(new Date()).isAfter(this.cache.expires) )
      return null;
    }
    // this.logger.log('[CACHE SERV] GET VALUE cache.value' , this.cache.value )
    console.log('[USER-SERV][CACHE-PU SERV] GET VALUE cache expires' ,moment(this.cache.expires).fromNow() )
    return this.cache.value;
  }

  setValue(value: Observable<ProjectUser[]>) {
   console.log('[USER-SERV][CACHE SERV] SET VALUE >>> value' , value )
    this.cache = {
      value,
      expires: moment(new Date()).add(this.CACHE_DURATION_IN_MINUTES, 'minutes').toDate()
    };
    console.log('[USER-SERV][CACHE SERV] SET VALUE cache.expires' ,this.cache.expires )
    console.log('[USER-SERV][CACHE SERV] SET VALUE cache.value' ,this.cache.value )
    this.logger.log('[USER-SERV][CACHE-PU SERV] SET VALUE cache expires' ,moment(this.cache.expires).fromNow() )
  }
  
  clearCache() {
    this.cache = null;
    console.log('[USER-SERV][CACHE-PU SERV] clearCache')
  }
 
}
