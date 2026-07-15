import { Injectable } from '@angular/core';

function buildDisplayNameKey(firstname: unknown, lastname: unknown): string {
  return [firstname, lastname]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

@Injectable()
export class ActivitiesTeammateLookupService {
  private emailsByUserId = new Map<string, string>();
  private userIdsWithDuplicateNames = new Set<string>();

  syncProjectUsers(projectUsers: any[] = []): void {
    this.emailsByUserId.clear();
    this.userIdsWithDuplicateNames.clear();

    const usersByDisplayNameKey = new Map<string, string[]>();

    for (const projectUser of projectUsers) {
      const user = projectUser?.id_user;
      const userId = user?._id;
      if (!userId) {
        continue;
      }

      const email = String(user?.email || '').trim();
      if (email) {
        this.emailsByUserId.set(userId, email);
      }

      const displayNameKey = buildDisplayNameKey(user?.firstname, user?.lastname);
      if (!displayNameKey) {
        continue;
      }

      const userIds = usersByDisplayNameKey.get(displayNameKey) || [];
      userIds.push(userId);
      usersByDisplayNameKey.set(displayNameKey, userIds);
    }

    for (const userIds of usersByDisplayNameKey.values()) {
      if (userIds.length <= 1) {
        continue;
      }

      for (const userId of userIds) {
        this.userIdsWithDuplicateNames.add(userId);
      }
    }
  }

  shouldShowEmail(userId?: string | null): boolean {
    if (!userId) {
      return false;
    }

    return this.userIdsWithDuplicateNames.has(userId);
  }

  getEmail(userId?: string | null): string {
    if (!userId) {
      return '';
    }

    return this.emailsByUserId.get(userId) || '';
  }

  getDisplayEmail(userId?: string | null): string {
    if (!this.shouldShowEmail(userId)) {
      return '';
    }

    return this.getEmail(userId);
  }
}
