import { Injectable } from '@angular/core';

@Injectable()
export class BotLocalDbService {

  constructor() {
    console.log('$ HELLO BOT LOCAL SERVICE')
  }


  saveBotsInStorage(faqkb_id: string, faqkb_object: any): void {
    if (faqkb_id) {
      localStorage.setItem(faqkb_id, JSON.stringify(faqkb_object));

      console.log('HEY - SAVE BOT IN STORAGE !!! ');
    }

  }

}
