import { Injectable } from '@angular/core';

@Injectable()
export class LocalDbService {

  prefix = 'dshbrd----'
  constructor() { }

  getMemberFromStorage(member_id: string) {
    // console.log('HEY MEMBER member_id !!! ', member_id);
    if (member_id) {

      /**
       * *** OLD: WITHOUT PREFIX ***
       */
      // const member = JSON.parse((localStorage.getItem(member_id)));

      /**
       * *** NEW 29JAN19 - GET FROM LOCAL STORAGE MEMBER ID WITH PREFIX ***
       */
      const prefixedMemberId = this.prefix + member_id;
      // console.log('HEY MEMBER prefixedMemberId !!! ', prefixedMemberId);
      const member = JSON.parse((localStorage.getItem(prefixedMemberId)));


      // console.log('HEY MEMBER !!! ', member);
      return member;
    }
  }

  saveMembersInStorage(member_id: string, member_object: any): void {
    if (member_id) {

      /**
       * *** OLD: WITHOUT PREFIX ***
       */
      // localStorage.setItem(member_id, JSON.stringify(member_object));

      /**
       * *** NEW 29JAN19 - SET IN LOCAL STORAGE MEMBER ID WITH PREFIX ***
       */
      localStorage.setItem(this.prefix + member_id, JSON.stringify(member_object));
      console.log('HEY - SAVE IN STORAGE !!! ');
    }
  }

  saveUserInStorageWithProjectUserId(projectuserid: string, userobj: any)  {
    localStorage.setItem(this.prefix + projectuserid, JSON.stringify(userobj));
    console.log('HEY - SAVE IN STORAGE !!! ');
  }



  getUserInStorageWithProjectUserId(projectuserid: string) {
     if (projectuserid) {
      const prefixedMemberId = this.prefix + projectuserid;
      // console.log('HEY MEMBER prefixedMemberId !!! ', prefixedMemberId);
      const member = JSON.parse((localStorage.getItem(prefixedMemberId)));
      return member;
    }
  }


  saveUserRoleInStorage(user_role: string) {
    localStorage.setItem('role', user_role);
    console.log('HEY - SAVE ROLE IN STORAGE !!! ');
  }

  getUserRoleFromStorage() {
    const user_role = localStorage.getItem('role');
    console.log('HEY - GET USER ROLE FROM STORAGE !!! ', user_role)
    return user_role
  }

  // -----------------------------------------------------------
  // display / hide the rocket "go-to-changelog"
  // -----------------------------------------------------------
  savChangelogDate() {
    // 1) to display the rocket "go-to-changelog" change the chglog_date
    const chglog_date = "03022021"
    localStorage.setItem(this.prefix + 'chglogdate', chglog_date);
  }

  getStoredChangelogDate() {
    const chglog_date = localStorage.getItem(this.prefix + 'chglogdate')
    let hasOpenBlog = false;
    // 2) if this chglog_date is equal to that get from local storage the rocket "go-to-changelog" is hidden
    if (chglog_date === '03022021') {
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
      console.log('HEY - SAVE IN STORAGE !!! ');
    }

  }


}

