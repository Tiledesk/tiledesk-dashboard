import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Home2StorageService {
  private readonly POPUP_CLOSED_KEY = 'dshbrd----hasclosedpopup';

  getHasClosedPopup(): boolean {
    return localStorage.getItem(this.POPUP_CLOSED_KEY) === 'true';
  }

  setHasClosedPopup(value: boolean): void {
    localStorage.setItem(this.POPUP_CLOSED_KEY, value ? 'true' : 'false');
  }

  getHasEmittedTrialEnded(projectId: string): boolean {
    return localStorage.getItem(this.trialEndedKey(projectId)) === 'hasEmittedTrialEnded';
  }

  setHasEmittedTrialEnded(projectId: string): void {
    localStorage.setItem(this.trialEndedKey(projectId), 'hasEmittedTrialEnded');
  }

  private trialEndedKey(projectId: string): string {
    return `dshbrd----${projectId}`;
  }
}

