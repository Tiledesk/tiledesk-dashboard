import { Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';
import { AuthService } from 'app/core/auth.service';
import { Project } from 'app/models/project-model';
import { Home2BrandVm, Home2BrandVmService } from './home2-brand-vm.service';

export interface Home2ProjectVm {
  project: Project | any;
  projectId?: string;
  projectName?: string;
  operatingHoursActive?: boolean;
}

/**
 * Home2Facade (Step 1)
 *
 * Facade **in sola lettura**: espone gli stream (user/progetto) già pubblicati da `AuthService`
 * verso il layer UI di Home2, senza introdurre side-effect.
 *
 * I side-effect (analytics, routing, localStorage, modali) restano volutamente nel componente
 * per minimizzare regressioni; verranno spostati nei prossimi step.
 */
@Injectable({ providedIn: 'root' })
export class Home2Facade {
  readonly user$: Observable<any> = this.auth.user_bs.pipe(shareReplay({ bufferSize: 1, refCount: true }));

  readonly project$: Observable<Project> = this.auth.project_bs.pipe(shareReplay({ bufferSize: 1, refCount: true }));

  readonly hasChangedProjectFromList$: Observable<boolean> = (this.auth as any).hasChangedProjectFroList$.pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly brandVm$: Observable<Home2BrandVm> = defer(() => [this.brandVmService.getBrandVm()]).pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly projectVm$: Observable<Home2ProjectVm> = this.project$.pipe(
    map((p: any) => ({
      project: p,
      projectId: p?._id,
      projectName: p?.name,
      operatingHoursActive: p?.activeOperatingHours
    })),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly projectId$: Observable<string | undefined> = this.project$.pipe(
    map((p: any) => p?._id),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    private auth: AuthService,
    private brandVmService: Home2BrandVmService
  ) {}
}

