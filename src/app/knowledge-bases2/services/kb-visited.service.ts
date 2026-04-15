import { Injectable } from '@angular/core';
import { LocalDbService } from 'app/services/users-local-db.service';

@Injectable({ providedIn: 'root' })
export class KbVisitedService {
  constructor(private localDb: LocalDbService) {}

  getVisited(projectId: string): boolean {
    return Boolean(this.localDb.getFromStorage(`has-visited-kb-${projectId}`));
  }

  markVisited(projectId: string): void {
    this.localDb.setInStorage(`has-visited-kb-${projectId}`, 'true');
  }
}

