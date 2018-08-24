import { Injectable } from '@angular/core';

@Injectable()
export class UsersLocalDbService {

  constructor() { }

  getMemberFromStorage(member_id: string) {
    if (member_id) {
      const member = JSON.parse((localStorage.getItem(member_id)));
      // console.log('HEY MEMBER !!! ', member)
      return member;
    }
  }

  saveMembersInStorage(member_id: string, member_object: any): void {
    if (member_id) {
      localStorage.setItem(member_id, JSON.stringify(member_object));

      // console.log('HEY - SAVE IN STORAGE !!! ');
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

