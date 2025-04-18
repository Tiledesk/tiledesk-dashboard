import { Injectable } from '@angular/core';
import { ProjectUser } from 'app/models/project-user';
import { Observable } from 'rxjs';
import { LoggerService } from './logger/logger.service';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})

export class UsersCacheService {

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
      this.logger.log('[USERS CACHE SERV] GET VALUE cache.expires ', moment(new Date()).isAfter(this.cache.expires))
      return null;
    }
    console.log('[USERS CACHE SERV] GET VALUE cache.value' , this.cache.value )
    this.logger.log('[USERS CACHE SERV] GET VALUE cache expires', moment(this.cache.expires).fromNow())
    return this.cache.value;
  }



  setValue(value: Observable<ProjectUser[]>) {
   console.log('[USERS CACHE SERV] SET VALUE >>> value' , value )
    this.cache = {
      value,
      expires: moment(new Date()).add(this.CACHE_DURATION_IN_MINUTES, 'minutes').toDate()
    };
    console.log('[USERS CACHE SERV] SET VALUE cache.expires' ,this.cache.expires )
    console.log('[USERS CACHE SERV] SET VALUE cache.value' ,this.cache.value )
    console.log('[USERS CACHE SERV] SET VALUE cache expires', moment(this.cache.expires).fromNow())
  }


  clearCache() {
    this.cache = null;
    console.log('[USERS SERV] clearCache')
  }
}
