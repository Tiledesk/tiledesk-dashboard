import { Injectable } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { ProjectService } from 'app/services/project.service';
import { environment } from 'environments/environment';

export type ProjectLandingKey =
  | 'home'
  | 'conversation-detail'
  | 'wsrequests'
  | 'contacts'
  | 'analytics'
  | 'activities'
  | 'history'
  | 'automations'
  | 'bots/my-chatbots/all'
  | 'knowledge-bases'
  | 'project-settings/general'
  | 'support';

type SidebarItemKey =
  | 'chat'
  | 'home'
  | 'knowledgeBases'
  | 'flows'
  | 'monitor'
  | 'waBroadcasts'
  | 'contacts'
  | 'analytics'
  | 'activities'
  | 'history'
  | 'settings'
  | 'support';

@Injectable({ providedIn: 'root' })
export class ProjectEntryWorkflowService {
  private readonly defaultLanding: ProjectLandingKey = 'home';
  private readonly storageKeyDefault = 'tiledesk.projectLanding.default';
  private readonly storageKeyByProjectPrefix = 'tiledesk.projectLanding.project.';

  constructor(
    private auth: AuthService,
    private projectService: ProjectService
  ) {}

  async run(projectId: string): Promise<string> {
    if (!projectId) {
      return '/projects';
    }

    await this.ensureProjectIsPublished(projectId);

    const landing = this.resolveLanding(projectId);
    return `/project/${projectId}/${landing}`;
  }

  private resolveLanding(projectId: string): ProjectLandingKey {
    // 1) Per-project override (optional, kept for future use)
    const byProject = localStorage.getItem(this.storageKeyByProjectPrefix + projectId) as ProjectLandingKey | null;
    if (byProject) return byProject;

    // 2) Env override (best for deployments)
    const envLanding = this.normalizeLanding((environment as any)?.projectHomePage ?? (environment as any)?.homePage);
    if (envLanding) return envLanding;

    // 3) Fallback: first `true` item in `environment.sidebarItems` (in the declared order)
    const firstEnabledFromSidebar = this.pickFirstEnabledFromSidebarItems();
    if (firstEnabledFromSidebar) return firstEnabledFromSidebar;

    // 4) Last resort
    return this.defaultLanding;
  }

  private pickFirstEnabledFromSidebarItems(): ProjectLandingKey | null {
    const sidebarItems = ((environment as any)?.sidebarItems ?? {}) as Partial<Record<SidebarItemKey, boolean>>;

    // Must follow the order as declared in `environment.sidebarItems`.
    const orderedKeys: SidebarItemKey[] = [
      'chat',
      'home',
      'knowledgeBases',
      'flows',
      'monitor',
      'waBroadcasts',
      'contacts',
      'analytics',
      'activities',
      'history',
      'settings',
      'support'
    ];

    for (const key of orderedKeys) {
      if (sidebarItems[key] === true) {
        return this.sidebarKeyToLanding(key);
      }
    }
    return null;
  }

  private sidebarKeyToLanding(key: SidebarItemKey): ProjectLandingKey {
    switch (key) {
      case 'chat':
        return 'conversation-detail';
      case 'home':
        return 'home';
      case 'knowledgeBases':
        return 'knowledge-bases';
      case 'flows':
        return 'bots/my-chatbots/all';
      case 'monitor':
        return 'wsrequests';
      case 'waBroadcasts':
        return 'automations';
      case 'contacts':
        return 'contacts';
      case 'analytics':
        return 'analytics';
      case 'activities':
        return 'activities';
      case 'history':
        return 'history';
      case 'settings':
        return 'project-settings/general';
      case 'support':
        return 'support';
      default:
        return 'home';
    }
  }

  private normalizeLanding(value: any): ProjectLandingKey | null {
    if (!value || typeof value !== 'string') return null;
    const v = value.trim().replace(/^\/+/, '');
    return (v as ProjectLandingKey) || null;
  }

  private async ensureProjectIsPublished(projectId: string): Promise<void> {
    const current = this.auth.project_bs?.value as any;
    if (current?._id === projectId) return;

    const stored = this.safeParse(localStorage.getItem(projectId));
    if (stored && stored._id === projectId) {
      this.auth.projectSelected(stored, 'project-entry');
      return;
    }

    try {
      // RxJS version in this repo doesn't expose `firstValueFrom`, so we use `.toPromise()`.
      const project = await (this.projectService.getProjectById(projectId) as any).toPromise();
      if (project) {
        this.auth.projectSelected(project, 'project-entry');
        localStorage.setItem(projectId, JSON.stringify(project));
      }
    } catch {
      // If we can't fetch/publish, we still let the navigation continue to avoid blocking the app.
    }
  }

  private safeParse(json: string | null): any | null {
    if (!json) return null;
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  }
}

