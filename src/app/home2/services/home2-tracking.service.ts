import { Injectable, isDevMode } from '@angular/core';

type Analytics = {
  page: (name: string, properties?: any) => void;
  track: (event: string, properties?: any, options?: any) => void;
  identify: (userId: string, traits?: any) => void;
  group: (groupId: string, traits?: any) => void;
};

@Injectable({ providedIn: 'root' })
export class Home2TrackingService {
  pageHome(): void {
    if (isDevMode()) return;
    const a = this.analytics();
    if (!a) return;
    try {
      a.page('Home Page, Home', {});
    } catch {
      // intentionally swallow tracking errors
    }
  }

  trackTrialEnded(userId: string, projectId: string, trialStartDate: string, trialEndDate: string, trialPlanName: string): void {
    if (isDevMode()) return;
    const a = this.analytics();
    if (!a) return;
    try {
      a.track(
        'Trial Ended',
        {
          userId,
          trial_start_date: trialStartDate,
          trial_end_date: trialEndDate,
          trial_plan_name: trialPlanName
        },
        { context: { groupId: projectId } }
      );
    } catch {
      // intentionally swallow tracking errors
    }
  }

  identifyUser(userId: string, traits: any): void {
    if (isDevMode()) return;
    const a = this.analytics();
    if (!a) return;
    try {
      a.identify(userId, traits);
    } catch {
      // intentionally swallow tracking errors
    }
  }

  groupProject(projectId: string, traits: any): void {
    if (isDevMode()) return;
    const a = this.analytics();
    if (!a) return;
    try {
      a.group(projectId, traits);
    } catch {
      // intentionally swallow tracking errors
    }
  }

  track(event: string, properties: any): void {
    if (isDevMode()) return;
    const a = this.analytics();
    if (!a) return;
    try {
      a.track(event, properties);
    } catch {
      // intentionally swallow tracking errors
    }
  }

  private analytics(): Analytics | undefined {
    const w: any = window as any;
    return w?.analytics as Analytics | undefined;
  }
}

