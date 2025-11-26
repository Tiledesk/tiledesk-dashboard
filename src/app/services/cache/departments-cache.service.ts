import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import moment from 'moment';
import { Department } from 'app/models/department-model';
import { LoggerService } from '../logger/logger.service';

@Injectable({
  providedIn: 'root'
})
export class DepartmentsCacheService {

  readonly CACHE_DURATION_IN_MINUTES = 5;

  private cache: {
    expires: Date,
    value: Observable<Department[]>
  } = null;

  private cachedData: {
    expires: Date,
    data: Department[]
  } = null;

  constructor(
    private logger: LoggerService,
  ) { }

  getValue(): Observable<Department[]> {
    if (!this.cache) {
      this.logger.log('[DEPARTMENTS-CACHE-SERV] GET VALUE - No Observable cache available');
      return null;
    }

    if (moment(new Date()).isAfter(this.cache.expires)) {
      this.logger.log('[DEPARTMENTS-CACHE-SERV] GET VALUE - Observable cache expired');
      this.cache = null; // Clean up expired cache
      return null;
    }
    
    this.logger.log('[DEPARTMENTS-CACHE-SERV] GET VALUE - Observable cache hit, expires', moment(this.cache.expires).fromNow());
    return this.cache.value;
  }

  setValue(value: Observable<Department[]>) {
    this.cache = {
      value,
      expires: moment(new Date()).add(this.CACHE_DURATION_IN_MINUTES, 'minutes').toDate()
    };
    this.logger.log('[DEPARTMENTS-CACHE-SERV] SET VALUE - Observable cache set, expires', moment(this.cache.expires).fromNow());
  }

  getCachedData(): Department[] | null {
    if (!this.cachedData) {
      this.logger.log('[DEPARTMENTS-CACHE-SERV] GET CACHED DATA - No data cache available');
      return null;
    }

    if (moment(new Date()).isAfter(this.cachedData.expires)) {
      this.logger.log('[DEPARTMENTS-CACHE-SERV] GET CACHED DATA - Data cache expired');
      this.cachedData = null; // Clean up expired cache
      return null;
    }
    
    this.logger.log('[DEPARTMENTS-CACHE-SERV] GET CACHED DATA - Data cache hit, expires', moment(this.cachedData.expires).fromNow());
    return this.cachedData.data;
  }

  setCachedData(data: Department[]) {
    this.cachedData = {
      data,
      expires: moment(new Date()).add(this.CACHE_DURATION_IN_MINUTES, 'minutes').toDate()
    };
    this.logger.log('[DEPARTMENTS-CACHE-SERV] SET CACHED DATA - Data cache set, expires', moment(this.cachedData.expires).fromNow());
  }

  clearDepartmentsCache() {
    this.cache = null;
    this.cachedData = null;
    this.logger.log('[DEPARTMENTS-CACHE-SERV] CLEAR CACHE - Cache cleared');
  }
}

