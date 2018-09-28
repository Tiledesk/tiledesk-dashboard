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

  getBotFromStorage(bot_id: string) {
    if (bot_id) {
      const bot = JSON.parse((localStorage.getItem(bot_id)));
      // console.log('HEY MEMBER !!! ', member)
      return bot;
    }
  }

}
