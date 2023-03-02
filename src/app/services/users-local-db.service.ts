import { Injectable } from '@angular/core';
import { AppStorageService } from './chat21-core/providers/abstract/app-storage.service';
import { LoggerService } from './chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from './chat21-core/providers/logger/loggerInstance';


@Injectable()
export class LocalDbService {

  // prefix = 'dshbrd----'

  private logger: LoggerService = LoggerInstance.getInstance();
  
  constructor(private appStorageService: AppStorageService,) { }

  getMemberFromStorage(member_id: string) {
    // this.logger.log('HEY MEMBER member_id !!! ', member_id);
    if (member_id) {

      /**
       * *** OLD: WITHOUT PREFIX ***
       */
      // const member = JSON.parse((this.appStorageService.getItem(member_id)));

      /**
       * *** NEW 29JAN19 - GET FROM LOCAL STORAGE MEMBER ID WITH PREFIX ***
       */
      // const prefixedMemberId = this.prefix + member_id;

      const memberString = this.appStorageService.getItem(member_id)
      // this.logger.log('HEY MEMBER prefixedMemberId !!! ', prefixedMemberId);
      let member = ''
      if (memberString) {
        member = JSON.parse(memberString);
      }


      // this.logger.log('HEY MEMBER !!! ', member);
      return member;
    }
  }

  saveMembersInStorage(member_id: string, member_object: any, calledBy): void {
    this.logger.log('[USERS-LOCAL-DB] - calledBy ', calledBy);
    if (member_id) {
      this.logger.log('saveMembersInStorage member_id: ', member_id, 'member_object: ', member_object)

      /**
       * *** NEW 29JAN19 - SET IN LOCAL STORAGE MEMBER ID WITH PREFIX ***
       */
      this.appStorageService.setItem(member_id, JSON.stringify(member_object));
      this.logger.log('[USERS-LOCAL-DB] - SET IN STORAGE MEMBER-OBJCT WITH KEY MEMBER-ID ', member_id);
    }
  }

  saveUserInStorageWithProjectUserId(projectuserid: string, userobj: any) {
    this.appStorageService.setItem(projectuserid, JSON.stringify(userobj));
    this.logger.log('[USERS-LOCAL-DB] - SET IN STORAGE USER-OBJCT WITH KEY PROJECT-USER-ID ', projectuserid);
  }

  getUserInStorageWithProjectUserId(projectuserid: string) {
    if (projectuserid) {
      // const prefixedMemberId = this.prefix + projectuserid;
      // this.logger.log('HEY MEMBER prefixedMemberId !!! ', prefixedMemberId);
      const member = JSON.parse((this.appStorageService.getItem(projectuserid)));
      return member;
    }
  }


  saveUserRoleInStorage(user_role: string) {
    this.appStorageService.setItem('role', user_role);
    this.logger.log('[USERS-LOCAL-DB] - SET USER ROLE IN STORAGE - ROLE ', user_role);
  }

  getUserRoleFromStorage() {
    const user_role = this.appStorageService.getItem('role');
    this.logger.log('[USERS-LOCAL-DB] - GET USER ROLE FROM STORAGE - ROLE ', user_role)
    return user_role
  }

  // -----------------------------------------------------------
  // display / hide the rocket "go-to-changelog"
  // -----------------------------------------------------------
  savChangelogDate() {
    // 1) to display the rocket "go-to-changelog" change the chglog_date
    const chglog_date = "08022023" // 
    this.appStorageService.setItem('chglogdate', chglog_date);
  }

  getStoredChangelogDate() {
    const chglog_date = this.appStorageService.getItem('chglogdate')
    let hasOpenBlog = false;
    // 2) if this chglog_date is equal to that get from local storage the rocket "go-to-changelog" is hidden
    if (chglog_date === '08022023') {
      hasOpenBlog = true
    }
    return hasOpenBlog
  }

  getStoredAppearanceDisplayPreferences() {
    const darkmode = this.appStorageService.getItem('dkmode');
    return darkmode
  }

  storeAppearanceDisplayPreferences(dkm): void {
    if (dkm) {
      this.appStorageService.setItem('dkmode', dkm);
      this.logger.log('HEY - SAVE IN STORAGE !!! ');
    }
  }

  storeIsOpenAppSidebar(isopen): void {
    this.appStorageService.setItem('appssidebar', isopen);
    // console.log('HEY - SAVE IN STORAGE !!! appssidebar isopen ', isopen);
  }

  getStoredIsOpenAppSidebar() {
    const isOpen = this.appStorageService.getItem('appssidebar');
    return isOpen
  }

  storeIsWideAppSidebar(iswide): void {
    this.appStorageService.setItem('appssidebarwidemode', iswide);
    // console.log('HEY - SAVE IN STORAGE !!! appssidebar wide mode ', iswide);
  }

  getStoredIsWideAppSidebar() {
    const isWide = this.appStorageService.getItem('appssidebarwidemode');
    return isWide
  }

  storeForegrondNotificationsCount(count): void {
    this.appStorageService.setItem('foregroundcount', count);
    // console.log('HEY - SAVE IN STORAGE !!! Foregrond Notifications Count ', count);
  }

  getForegrondNotificationsCount() {
    const foregroundcCunt = this.appStorageService.getItem('foregroundcount');
    return foregroundcCunt
  }

  setInStorage(key, value) {
    // console.log('[local-db-service] setInStorage key', key , ' value: ', value)
    this.appStorageService.setItem(key, value);
  }

  getFromStorage(key) {
    key = this.appStorageService.getItem(key);
    return key
  }

  removeFromStorage(key) {
    this.appStorageService.removeItem(key)
  }


}

