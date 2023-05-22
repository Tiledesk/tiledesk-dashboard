import { Injectable } from '@angular/core';
import { LoggerService } from '../services/logger/logger.service';


@Injectable()
export class LocalDbService {

  prefix = 'dshbrd----'
  constructor(
    private logger: LoggerService
  ) { }

  getMemberFromStorage(member_id: string) {
    // this.logger.log('HEY MEMBER member_id !!! ', member_id);
    if (member_id) {

      /**
       * *** OLD: WITHOUT PREFIX ***
       */
      // const member = JSON.parse((localStorage.getItem(member_id)));

      /**
       * *** NEW 29JAN19 - GET FROM LOCAL STORAGE MEMBER ID WITH PREFIX ***
       */
      const prefixedMemberId = this.prefix + member_id;

      const memberString = localStorage.getItem(prefixedMemberId)
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
       * *** OLD: WITHOUT PREFIX ***
       */
      // localStorage.setItem(member_id, JSON.stringify(member_object));

      /**
       * *** NEW 29JAN19 - SET IN LOCAL STORAGE MEMBER ID WITH PREFIX ***
       */
      localStorage.setItem(this.prefix + member_id, JSON.stringify(member_object));
      this.logger.log('[USERS-LOCAL-DB] - SET IN STORAGE MEMBER-OBJCT WITH KEY MEMBER-ID ', member_id);
    }
  }

  saveUserInStorageWithProjectUserId(projectuserid: string, userobj: any) {
    localStorage.setItem(this.prefix + projectuserid, JSON.stringify(userobj));
    this.logger.log('[USERS-LOCAL-DB] - SET IN STORAGE USER-OBJCT WITH KEY PROJECT-USER-ID ', projectuserid);
  }

  getUserInStorageWithProjectUserId(projectuserid: string) {
    if (projectuserid) {
      const prefixedMemberId = this.prefix + projectuserid;
      // this.logger.log('HEY MEMBER prefixedMemberId !!! ', prefixedMemberId);
      const member = JSON.parse((localStorage.getItem(prefixedMemberId)));
      return member;
    }
  }


  saveUserRoleInStorage(user_role: string) {
    localStorage.setItem('role', user_role);
    this.logger.log('[USERS-LOCAL-DB] - SET USER ROLE IN STORAGE - ROLE ', user_role);
  }

  getUserRoleFromStorage() {
    const user_role = localStorage.getItem('role');
    this.logger.log('[USERS-LOCAL-DB] - GET USER ROLE FROM STORAGE - ROLE ', user_role)
    return user_role
  }

  // -----------------------------------------------------------
  // display / hide the rocket "go-to-changelog"
  // -----------------------------------------------------------
  savChangelogDate() {
    // 1) to display the rocket "go-to-changelog" change the chglog_date
    const chglog_date = "22052023" // 
    localStorage.setItem(this.prefix + 'chglogdate', chglog_date);
  }

  getStoredChangelogDate() {
    const chglog_date = localStorage.getItem(this.prefix + 'chglogdate')
    let hasOpenBlog = false;
    // 2) if this chglog_date is equal to that get from local storage the rocket "go-to-changelog" is hidden
    if (chglog_date === '22052023') {
      hasOpenBlog = true
    }
    return hasOpenBlog
  }

  getStoredAppearanceDisplayPreferences() {
    const darkmode = localStorage.getItem(this.prefix + 'dkmode');
    return darkmode
  }

  storeAppearanceDisplayPreferences(dkm): void {
    if (dkm) {
      localStorage.setItem(this.prefix + 'dkmode', dkm);
      this.logger.log('HEY - SAVE IN STORAGE !!! ');
    }
  }

  storeIsOpenAppSidebar(isopen): void {
    localStorage.setItem(this.prefix + 'appssidebar', isopen);
    // console.log('HEY - SAVE IN STORAGE !!! appssidebar isopen ', isopen);
  }

  getStoredIsOpenAppSidebar() {
    const isOpen = localStorage.getItem(this.prefix + 'appssidebar');
    return isOpen
  }

  storeIsWideAppSidebar(iswide): void {
    localStorage.setItem(this.prefix + 'appssidebarwidemode', iswide);
    // console.log('HEY - SAVE IN STORAGE !!! appssidebar wide mode ', iswide);
  }

  getStoredIsWideAppSidebar() {
    const isWide = localStorage.getItem(this.prefix + 'appssidebarwidemode');
    return isWide
  }

  storeForegrondNotificationsCount(count): void {
    localStorage.setItem(this.prefix + 'foregroundcount', count);
    // console.log('HEY - SAVE IN STORAGE !!! Foregrond Notifications Count ', count);
  }

  getForegrondNotificationsCount() {
    const foregroundcCunt = localStorage.getItem(this.prefix + 'foregroundcount');
    return foregroundcCunt
  }

  setInStorage(key, value) {
    // console.log('[local-db-service] setInStorage key', key , ' value: ', value)
    localStorage.setItem(this.prefix + key, value);
  }

  getFromStorage(key) {
    key = localStorage.getItem(this.prefix + key);
    return key
  }

  removeFromStorage(key) {
    localStorage.removeItem(this.prefix + key)
  }


}

