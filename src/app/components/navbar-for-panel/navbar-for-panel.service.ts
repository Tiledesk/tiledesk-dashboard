import { Injectable } from '@angular/core';
import { LoggerService } from 'app/services/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'app/services/chat21-core/providers/logger/loggerInstance';
import { BehaviorSubject } from 'rxjs';

@Injectable()

export class NavbarForPanelService {

  public darkmode$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  private logger: LoggerService = LoggerInstance.getInstance();

  constructor() { }


  publishDisplayPreferences(dkm) {

    this.logger.log('[NAVBAR-X-PANEL] publishDisplayPreferences dkm ', dkm)

  }
}
