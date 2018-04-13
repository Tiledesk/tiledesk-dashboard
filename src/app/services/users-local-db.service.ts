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


}

