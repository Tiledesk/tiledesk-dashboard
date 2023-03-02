import { Injectable } from '@angular/core';
import { AppStorageService } from './chat21-core/providers/abstract/app-storage.service';
import { LoggerService } from './chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from './chat21-core/providers/logger/loggerInstance';
@Injectable()
export class BotLocalDbService {

  private logger: LoggerService = LoggerInstance.getInstance();
  
  constructor(private appStorageService: AppStorageService,) {
    // this.logger.log('[BOT-LOCAL-SERVICE] - HELLO BOT LOCAL SERVICE')
    
  }


  saveBotsInStorage(faqkb_id: string, faqkb_object: any): void {

    if (faqkb_id) {
      this.appStorageService.setItem(faqkb_id, JSON.stringify(faqkb_object));

      this.logger.log('[BOT-LOCAL-SERVICE]  HEY - SAVE BOT IN STORAGE !!! ');
    }
  }

  getBotFromStorage(bot_id: string) {
    if (bot_id) {
      const bot = JSON.parse((this.appStorageService.getItem(bot_id)));
    
      return bot;
    }
  }

}
