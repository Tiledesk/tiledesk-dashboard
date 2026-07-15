import { Injectable } from '@angular/core';

@Injectable()
export class ActivitiesTeammateLookupService {
  private emailsByUserId = new Map<string, string>();

  syncProjectUsers(projectUsers: any[] = []): void {
    this.emailsByUserId.clear();

    for (const projectUser of projectUsers) {
      const userId = projectUser?.id_user?._id;
      const email = String(projectUser?.id_user?.email || '').trim();
      if (userId && email) {
        this.emailsByUserId.set(userId, email);
      }
    }
  }

  getEmail(userId?: string | null): string {
    if (!userId) {
      return '';
    }

    return this.emailsByUserId.get(userId) || '';
  }
}
