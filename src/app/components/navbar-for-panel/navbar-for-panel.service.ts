import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()

export class NavbarForPanelService {

  public darkmode$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  constructor() { }


  publishDisplayPreferences(dkm) {

    console.log('NAVBAR-X-PANEL Service publishDisplayPreferences dkm ', dkm)

  }
}
