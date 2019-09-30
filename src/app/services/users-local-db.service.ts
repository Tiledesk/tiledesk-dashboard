import { Injectable } from '@angular/core';

@Injectable()
export class UsersLocalDbService {

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


  saveUserRoleInStorage(user_role: string) {
    localStorage.setItem('role', user_role);
    console.log('HEY - SAVE ROLE IN STORAGE !!! ');
  }

  getUserRoleFromStorage() {
    const user_role = localStorage.getItem('role');
    console.log('HEY - GET USER ROLE FROM STORAGE !!! ', user_role)
    return user_role
  }

}

