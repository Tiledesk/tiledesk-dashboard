import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { LocalDbService } from 'app/services/users-local-db.service';

export type KbNamespaceSelection = {
  selectedNamespace?: any;
  routeNamespaceId?: string;
};

@Injectable({ providedIn: 'root' })
export class KbNamespacesWorkflowService {
  constructor(
    private kbService: KnowledgeBaseService,
    private localDbService: LocalDbService,
  ) {}

  loadNamespaces(): Observable<any[]> {
    // `KnowledgeBaseService.getAllNamespaces()` is typed as `Observable<Object>` in this codebase.
    // Runtime payload is an array, so we cast here to keep downstream types consistent.
    return this.kbService.getAllNamespaces() as unknown as Observable<any[]>;
  }

  /**
   * Seleziona il namespace iniziale con priorità:
   * 1) `last_kbnamespace-<projectId>` se presente
   * 2) se URL contiene un id alfanumerico, prova a matchare quello
   * 3) fallback sul namespace default
   */
  resolveInitialSelection(params: {
    projectId: string;
    namespaces: any[];
    currentUrl: string;
  }): KbNamespaceSelection {
    const { projectId, namespaces, currentUrl } = params || ({} as any);
    const storedNamespace = projectId
      ? this.localDbService.getFromStorage(`last_kbnamespace-${projectId}`)
      : null;

    const findDefault = () => namespaces?.find((el: any) => el?.default === true);

    // 1) storage
    if (storedNamespace) {
      try {
        const stored = JSON.parse(storedNamespace);
        const byStoredId = namespaces?.find((el: any) => el?.id === stored?.id);
        if (byStoredId) {
          return { selectedNamespace: byStoredId, routeNamespaceId: byStoredId?.id };
        }
      } catch {
        // ignore JSON parse errors
      }
    }

    // 2) URL id (best effort)
    const urlNsId = this.extractNamespaceIdFromUrl(currentUrl);
    if (urlNsId && urlNsId !== '0') {
      const byUrl = namespaces?.find((el: any) => el?.id === urlNsId);
      if (byUrl) {
        return { selectedNamespace: byUrl, routeNamespaceId: byUrl?.id };
      }
    }

    // 3) default fallback
    const def = findDefault();
    return { selectedNamespace: def, routeNamespaceId: def?.id };
  }

  persistLastNamespace(projectId: string, namespace: any) {
    if (!projectId || !namespace) return;
    this.localDbService.setInStorage(`last_kbnamespace-${projectId}`, JSON.stringify(namespace));
  }

  createNamespace(projectId: string, namespaceName: string, hybrid: boolean): Observable<any> {
    if (!namespaceName) {
      return throwError(() => new Error('namespaceName is required'));
    }
    return this.kbService.createNamespace(namespaceName, hybrid).pipe(
      map((namespace: any) => {
        if (namespace) {
          this.persistLastNamespace(projectId, namespace);
        }
        return namespace;
      }),
    );
  }

  updateNamespace(projectId: string, namespaceId: string, body: any): Observable<any> {
    if (!namespaceId) {
      return throwError(() => new Error('namespaceId is required'));
    }
    return this.kbService.updateNamespace(body, namespaceId).pipe(
      map((namespace: any) => {
        if (namespace) {
          this.persistLastNamespace(projectId, namespace);
        }
        return namespace;
      }),
    );
  }

  private extractNamespaceIdFromUrl(currentUrl: string): string | undefined {
    if (!currentUrl) return undefined;
    const afterLastSlash = currentUrl.substring(currentUrl.lastIndexOf('/') + 1);
    if (!afterLastSlash) return undefined;
    // Keep original behavior: only accept alphanumeric ids
    const isAlphaNumeric = /^[a-z0-9]+$/i.test(afterLastSlash);
    return isAlphaNumeric ? afterLastSlash : '0';
  }
}

