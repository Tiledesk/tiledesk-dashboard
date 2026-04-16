import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { BrandService } from 'app/services/brand.service';
import {
  KbNamespaceLinkedResourcesService,
  type KbProvisioningProgressEvent,
} from 'app/knowledge-bases2/services/kb-namespace-linked-resources.service';
import { of } from 'rxjs';
import { catchError, finalize, map, switchMap, tap } from 'rxjs/operators';
import type { KbNamespace } from 'app/knowledge-bases2/models/kb-types';

type Onboarding2StepId = 'kb' | 'chatbot' | 'department' | 'redirect';
type Onboarding2StepStatus = 'pending' | 'running' | 'success' | 'error';
interface Onboarding2Step {
  id: Onboarding2StepId;
  labelKey: string;
  status: Onboarding2StepStatus;
  detail?: string | null;
}

@Component({
  selector: 'appdashboard-onboarding2',
  templateUrl: './onboarding2.component.html',
  styleUrls: ['./onboarding2.component.scss'],
})
export class Onboarding2Component implements OnInit {
  projectId: string;
  companyLogo: string;

  isProvisioning = false;
  provisioningError: string | null = null;
  provisioningDone = false;

  steps: Onboarding2Step[] = [
    { id: 'kb', labelKey: 'MinimalOnboarding2.StepCreateKb', status: 'pending' },
    { id: 'chatbot', labelKey: 'MinimalOnboarding2.StepCreateChatbot', status: 'pending' },
    { id: 'department', labelKey: 'MinimalOnboarding2.StepCreateDepartment', status: 'pending' },
    { id: 'redirect', labelKey: 'MinimalOnboarding2.StepRedirect', status: 'pending' },
  ];

  private createdNamespace: KbNamespace | null = null;
  private readonly minLoadingMs = 1000;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private kbService: KnowledgeBaseService,
    private kbLinkedResources: KbNamespaceLinkedResourcesService,
    public brandService: BrandService,
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot?.params?.projectid;
    const brand = this.brandService.getBrand();
    this.companyLogo = brand?.['BASE_LOGO'];
    this.provisionDefaultKb();
  }

  goToKnowledgeBases(): void {
    if (!this.projectId) return;
    this.router.navigate([`/project/${this.projectId}/knowledge-bases`]);
  }

  goToDashboard(): void {
    if (!this.projectId) return;
    // Route entrypoint: lets the app decide the correct landing for the project.
    this.router.navigate([`/project/${this.projectId}`]);
  }

  retryProvisioning(): void {
    this.provisionDefaultKb(true);
  }

  private provisionDefaultKb(force = false): void {
    if (!this.projectId) return;
    if (this.isProvisioning) return;

    const startedAt = Date.now();
    const sessionKey = this.sessionProvisioningKey(this.projectId);
    if (!force && sessionStorage.getItem(sessionKey) === 'true') {
      this.provisioningDone = true;
      // Keep UX consistent: still show a short loader then redirect.
      this.markAllStepsSuccess();
      this.redirectAfterMinDelay(startedAt);
      return;
    }

    this.isProvisioning = true;
    this.provisioningError = null;
    this.resetSteps();

    const defaultName = this.translate.instant('MinimalOnboarding2.DefaultKbName') || 'My Agent';

    this.kbService
      .getAllNamespaces()
      .pipe(
        map((namespaces: any) => (Array.isArray(namespaces) ? namespaces : ([] as any[]))),
        switchMap((namespaces: any[]) => {
          if (namespaces.length > 0) {
            // Backend may auto-create a starter namespace named "Default".
            // If that's the only namespace, rename it to our localized defaultName and provision resources on it.
            if (
              namespaces.length === 1 &&
              typeof namespaces[0]?.id === 'string' &&
              typeof namespaces[0]?.name === 'string' &&
              namespaces[0].name === 'Default' &&
              !force
            ) {
              this.setStepStatus('kb', 'running', this.translate.instant('MinimalOnboarding2.Running'));
              const body = JSON.stringify({ name: defaultName });
              return this.kbService.updateNamespace(body, namespaces[0].id).pipe(
                tap(() => this.setStepStatus('kb', 'success', this.translate.instant('MinimalOnboarding2.Done'))),
                map((updated: any) => ({ skipped: false as const, namespace: updated as KbNamespace, existing: namespaces as any[] })),
                catchError((err) => {
                  this.setStepStatus('kb', 'error', this.statusDetailFor('error', err));
                  throw err;
                }),
              );
            }

            if (!force) {
              // No-op: project already provisioned.
              return of({ skipped: true as const, namespace: null as any, existing: namespaces as any[] });
            }
            // Retry path: do not create duplicates. Try to provision the most relevant existing namespace.
            const fromStorage = this.getStoredNamespace(this.projectId);
            const byId = fromStorage?.id ? namespaces.find((n) => n?.id === fromStorage.id) : undefined;
            const byName = namespaces.find((n) => n?.name === defaultName);
            const candidate = (byId || byName) as KbNamespace | undefined;
            if (candidate?.id) {
              this.setStepStatus('kb', 'success', this.translate.instant('MinimalOnboarding2.Done'));
              return of({ skipped: false as const, namespace: candidate, existing: namespaces as any[] });
            }
            return of({ skipped: true as const, namespace: null as any, existing: namespaces as any[] });
          }

          this.setStepStatus('kb', 'running', this.translate.instant('MinimalOnboarding2.Running'));
          return this.kbService.createNamespace(defaultName, false).pipe(
            tap(() => this.setStepStatus('kb', 'success', this.translate.instant('MinimalOnboarding2.Done'))),
            map((namespace: any) => ({ skipped: false as const, namespace: namespace as KbNamespace, existing: [] as any[] })),
            catchError((err) => {
              this.setStepStatus('kb', 'error', this.statusDetailFor('error', err));
              throw err;
            }),
          );
        }),
        tap(({ namespace }) => {
          if (namespace?.id) {
            this.createdNamespace = namespace;
            localStorage.setItem(`last_kbnamespace-${this.projectId}`, JSON.stringify(namespace));
          }
        }),
        switchMap(({ skipped, namespace, existing }) => {
          if (skipped) {
            // Already provisioned; mark steps and continue to redirect.
            this.setStepStatus('kb', 'success', this.translate.instant('MinimalOnboarding2.Done'));
            this.setStepStatus('chatbot', 'success', this.translate.instant('MinimalOnboarding2.Done'));
            this.setStepStatus('department', 'success', this.translate.instant('MinimalOnboarding2.Done'));
            return of(undefined);
          }
          if (!namespace) {
            // Nothing we can do; treat as done for redirect-only.
            this.setStepStatus('kb', 'success', this.translate.instant('MinimalOnboarding2.Done'));
            return of(undefined);
          }

          const onProgress = (ev: KbProvisioningProgressEvent) => this.onProvisioningProgress(ev);
          return this.kbLinkedResources.ensureOnCreateWithProgress({ projectId: this.projectId, namespace }, onProgress);
        }),
        tap(() => {
          sessionStorage.setItem(sessionKey, 'true');
          this.provisioningDone = true;
          this.setStepStatus('redirect', 'running', this.translate.instant('MinimalOnboarding2.Running'));
        }),
        finalize(() => {
          this.isProvisioning = false;
        }),
      )
      .subscribe({
        next: () => {
          this.setStepStatus('redirect', 'success', this.translate.instant('MinimalOnboarding2.Done'));
          this.redirectAfterMinDelay(startedAt);
        },
        error: (err) => {
          // Keep error visible and allow a deterministic retry.
          const fallback = this.translate.instant('AnErrorOccurredWhileUpdating') || 'An error occurred';
          const message = typeof err?.message === 'string' ? err.message : fallback;
          this.provisioningError = message;
          this.setStepStatus('redirect', 'pending', null);
        },
      });
  }

  private onProvisioningProgress(ev: KbProvisioningProgressEvent) {
    if (ev.step === 'chatbot') {
      this.setStepStatus('chatbot', this.mapProgressStatus(ev.status), this.statusDetailFor(ev.status, ev.error));
    }
    if (ev.step === 'department') {
      this.setStepStatus('department', this.mapProgressStatus(ev.status), this.statusDetailFor(ev.status, ev.error));
    }
    // tags is internal (ownership); we don't surface as a dedicated step here to keep UX simple.
  }

  private mapProgressStatus(status: KbProvisioningProgressEvent['status']): Onboarding2StepStatus {
    if (status === 'running') return 'running';
    if (status === 'success') return 'success';
    return 'error';
  }

  private statusDetailFor(status: KbProvisioningProgressEvent['status'], err?: any): string | null {
    if (status === 'running') return this.translate.instant('MinimalOnboarding2.Running');
    if (status === 'success') return this.translate.instant('MinimalOnboarding2.Done');
    const fallback = this.translate.instant('MinimalOnboarding2.Failed') || 'Failed';
    return typeof err?.message === 'string' ? err.message : fallback;
  }

  private resetSteps() {
    this.steps = this.steps.map((s) => ({ ...s, status: 'pending', detail: null }));
    this.setStepStatus('kb', 'running', this.translate.instant('MinimalOnboarding2.Running'));
  }

  private markAllStepsSuccess() {
    this.setStepStatus('kb', 'success', this.translate.instant('MinimalOnboarding2.Done'));
    this.setStepStatus('chatbot', 'success', this.translate.instant('MinimalOnboarding2.Done'));
    this.setStepStatus('department', 'success', this.translate.instant('MinimalOnboarding2.Done'));
    this.setStepStatus('redirect', 'running', this.translate.instant('MinimalOnboarding2.Running'));
  }

  private setStepStatus(id: Onboarding2StepId, status: Onboarding2StepStatus, detail?: string | null) {
    this.steps = this.steps.map((s) => (s.id === id ? { ...s, status, detail: detail ?? null } : s));
  }

  private redirectAfterMinDelay(startedAt: number) {
    if (!this.projectId) return;
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, this.minLoadingMs - elapsed);

    const namespaceId = this.createdNamespace?.id;
    const target = namespaceId
      ? [`/project/${this.projectId}/knowledge-bases/${namespaceId}`]
      : [`/project/${this.projectId}/knowledge-bases`];

    setTimeout(() => {
      this.router.navigate(target);
    }, remaining);
  }

  private getStoredNamespace(projectId: string): KbNamespace | null {
    try {
      const raw = localStorage.getItem(`last_kbnamespace-${projectId}`);
      return raw ? (JSON.parse(raw) as KbNamespace) : null;
    } catch {
      return null;
    }
  }

  private sessionProvisioningKey(projectId: string): string {
    return `default_kb_provisioned_${projectId}`;
  }
}

