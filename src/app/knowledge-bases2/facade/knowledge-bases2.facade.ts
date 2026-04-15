import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, map, shareReplay, startWith, tap } from 'rxjs/operators';
import { KbNamespaceSelectionService } from '../services/kb-namespace-selection.service';
import type { KbListItem, KbListResponse, KbNamespace } from '../models/kb-types';
import { KbListQueryParams, KbListQueryParamsService, SortDirection } from '../services/kb-list-query-params.service';

export interface KnowledgeBases2ViewState {
  loading: boolean;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class KnowledgeBases2Facade {
  private readonly stateSubject = new BehaviorSubject<KnowledgeBases2ViewState>({ loading: true });
  readonly state$: Observable<KnowledgeBases2ViewState> = this.stateSubject.asObservable();

  private readonly namespacesSubject = new BehaviorSubject<KbNamespace[]>([]);
  readonly namespaces$: Observable<KbNamespace[]> = this.namespacesSubject.asObservable();

  private readonly selectedNamespaceSubject = new BehaviorSubject<KbNamespace | null>(null);
  readonly selectedNamespace$: Observable<KbNamespace | null> = this.selectedNamespaceSubject.asObservable();

  readonly totalCount$: Observable<number> = this.namespaces$.pipe(
    map((namespaces) => namespaces.reduce((acc, ns) => acc + (ns?.count || 0), 0)),
    shareReplay(1),
  );

  private readonly kbListSubject = new BehaviorSubject<KbListItem[]>([]);
  readonly kbList$: Observable<KbListItem[]> = this.kbListSubject.asObservable();

  private readonly kbListCountSubject = new BehaviorSubject<number>(0);
  readonly kbListCount$: Observable<number> = this.kbListCountSubject.asObservable();

  private readonly kbListLoadingSubject = new BehaviorSubject<boolean>(false);
  readonly kbListLoading$: Observable<boolean> = this.kbListLoadingSubject.asObservable();

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

  setNamespaces(namespaces: KbNamespace[]) {
    this.namespacesSubject.next(namespaces ?? []);
  }

  setSelectedNamespace(namespace: KbNamespace | null) {
    this.selectedNamespaceSubject.next(namespace ?? null);
  }

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
      tap(({ namespaces, selection }) => {
        this.setNamespaces(namespaces);
        this.setSelectedNamespace(selection?.selected ?? null);
        this.setLoading(false);
      }),
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

  fetchKbList(params: any, calledby?: string, currentList: KbListItem[] = []) {
    const shouldReset =
      calledby === 'onSelectNamespace' ||
      calledby === 'createNewNamespace' ||
      calledby === 'deleteNamespace' ||
      calledby === 'onImportJSON' ||
      calledby === 'after-update' ||
      calledby === 'after-add';

    const baseList = shouldReset ? [] : currentList ?? [];

    this.kbListLoadingSubject.next(true);
    return this.kbService.getListOfKb(params).pipe(
      map((resp: any) => resp as KbListResponse),
      map((resp) => {
        const count = resp?.count ?? 0;
        const kbs = resp?.kbs ?? [];

        // If called after update or add, replace the entire list to maintain server order
        if (calledby === 'after-update' || calledby === 'after-add') {
          return { list: [...kbs], count };
        }

        const next = [...baseList];
        for (const kb of kbs) {
          const kbId = (kb as any)?._id;
          const index = next.findIndex((x: any) => x?._id === kbId);
          if (index !== -1) {
            next[index] = kb;
          } else {
            if (calledby === 'add-multi-faq' || calledby === 'onAddMultiKb') {
              next.unshift(kb);
            } else {
              next.push(kb);
            }
          }
        }

        return { list: next, count };
      }),
      tap(({ list, count }) => {
        this.kbListSubject.next(list);
        this.kbListCountSubject.next(count);
      }),
      finalize(() => this.kbListLoadingSubject.next(false)),
    );
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

