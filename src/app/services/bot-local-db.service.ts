import { Injectable } from '@angular/core';
import { LoggerService } from '../services/logger/logger.service';
@Injectable()
export class BotLocalDbService {

  constructor(
    private logger: LoggerService
  ) {
    // this.logger.log('[BOT-LOCAL-SERVICE] - HELLO BOT LOCAL SERVICE')
    
  }


  saveBotsInStorage(faqkb_id: string, faqkb_object: any): void {

    if (faqkb_id) {
      localStorage.setItem(faqkb_id, JSON.stringify(faqkb_object));

      this.logger.log('[BOT-LOCAL-SERVICE]  HEY - SAVE BOT IN STORAGE !!! ');
    }
  }

  getBotFromStorage(bot_id: string) {
    if (bot_id) {
      const bot = JSON.parse((localStorage.getItem(bot_id)));
    
      return bot;
    }
  }

}
