import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay, startWith, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { KbNamespaceSelectionService } from '../services/kb-namespace-selection.service';
import type { KbNamespace } from '../models/kb-types';
import { KbListQueryParams, KbListQueryParamsService, SortDirection } from '../services/kb-list-query-params.service';

export interface KnowledgeBases2ViewState {
  loading: boolean;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class KnowledgeBases2Facade {
  private readonly stateSubject = new BehaviorSubject<KnowledgeBases2ViewState>({ loading: true });
  readonly state$: Observable<KnowledgeBases2ViewState> = this.stateSubject.asObservable();

  readonly user$ = this.auth.user_bs.pipe(shareReplay(1));
  readonly project$ = this.auth.project_bs.pipe(shareReplay(1));
  readonly callingPage$ = this.route.params.pipe(
    map((params: any) => (params?.calledby === 'h' ? 'Home' : 'Knowledge Bases')),
    startWith('Knowledge Bases'),
    shareReplay(1),
  );

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private kbService: KnowledgeBaseService,
    private namespaceSelection: KbNamespaceSelectionService,
    private kbListQueryParams: KbListQueryParamsService,
  ) {}

  loadNamespaces(projectId: string, currentUrl: string) {
    this.setLoading(true);
    return this.kbService.getAllNamespaces().pipe(
      map((namespaces: any) => (namespaces as KbNamespace[]) ?? []),
      map((namespaces) => {
        const stored = this.namespaceSelection.getStoredNamespace(projectId);
        const urlNamespaceId = this.namespaceSelection.resolveNamespaceIdFromUrl(currentUrl);
        const selection = this.namespaceSelection.select(namespaces, stored, urlNamespaceId);
        return { namespaces, selection };
      }),
      tap(() => this.setLoading(false)),
      catchError((err) => {
        this.setError('Failed to load namespaces');
        return of({ namespaces: [] as KbNamespace[], selection: { selected: undefined, shouldNavigateToSelected: false, shouldPersistSelected: false } });
      }),
      shareReplay(1),
    );
  }

  loadKbList(params: any) {
    return this.kbService.getListOfKb(params);
  }

  buildKbListParams(params: KbListQueryParams): string {
    return this.kbListQueryParams.build(params);
  }

  getDefaultKbListSortField(): string {
    return this.kbListQueryParams.defaultSortField();
  }

  getDefaultKbListDirection(): SortDirection {
    return this.kbListQueryParams.defaultDirection();
  }

  setLoading(loading: boolean) {
    const curr = this.stateSubject.value;
    this.stateSubject.next({ ...curr, loading });
  }

  setError(error?: string) {
    const curr = this.stateSubject.value;
    this.stateSubject.next({ ...curr, error, loading: false });
  }
}

