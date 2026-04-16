import { AppConfigService } from 'app/services/app-config.service';

export function isMinimalDashboard(appConfigService: AppConfigService): boolean {
  const cfg: any = appConfigService.getConfig?.();
  return cfg?.dashboardType === 'minimal';
}

export function getPostProjectCreationNavigation(
  appConfigService: AppConfigService,
  projectId: string,
  fallbackCommands: any[]
): any[] {
  if (!projectId) return fallbackCommands;
  if (isMinimalDashboard(appConfigService)) {
    return [`/project/${projectId}/onboarding2`];
  }
  return fallbackCommands;
}

