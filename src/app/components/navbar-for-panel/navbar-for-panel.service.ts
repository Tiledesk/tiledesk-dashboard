import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoggerService } from '../../services/logger/logger.service';

@Injectable()

export class NavbarForPanelService {

  public darkmode$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  constructor(
    private logger: LoggerService
    ) { }


  publishDisplayPreferences(dkm) {

    this.logger.log('[NAVBAR-X-PANEL] publishDisplayPreferences dkm ', dkm)

  }
}
