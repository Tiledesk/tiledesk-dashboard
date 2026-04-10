import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type KbStateSnapshot = {
  projectId?: string;
  namespaces?: any[];
  selectedNamespace?: any;
  kbsList?: any[];
};

@Injectable({ providedIn: 'root' })
/**
 * Store minimale (state container) per Knowledge Bases.
 *
 * Contiene lo stato “core” condiviso tra workflow e UI:
 * - `projectId`
 * - `namespaces`
 * - `selectedNamespace`
 * - `kbsList`
 *
 * Invocazioni tipiche:
 * - `KnowledgeBasesFacadeService`: unica porta d’ingresso consigliata per leggere/scrivere lo state.
 * - `KnowledgeBasesComponent`: si sottoscrive agli stream per sincronizzare il view-model usato dal template.
 */
export class KbStateService {
  private readonly projectIdSubject = new BehaviorSubject<string | undefined>(undefined);
  readonly projectId$ = this.projectIdSubject.asObservable();

  private readonly namespacesSubject = new BehaviorSubject<any[] | undefined>(undefined);
  readonly namespaces$ = this.namespacesSubject.asObservable();

  private readonly selectedNamespaceSubject = new BehaviorSubject<any | undefined>(undefined);
  readonly selectedNamespace$ = this.selectedNamespaceSubject.asObservable();

  private readonly kbsListSubject = new BehaviorSubject<any[] | undefined>(undefined);
  readonly kbsList$ = this.kbsListSubject.asObservable();

  get snapshot(): KbStateSnapshot {
    return {
      projectId: this.projectIdSubject.value,
      namespaces: this.namespacesSubject.value,
      selectedNamespace: this.selectedNamespaceSubject.value,
      kbsList: this.kbsListSubject.value,
    };
  }

  setProjectId(projectId?: string) {
    this.projectIdSubject.next(projectId);
  }

  setNamespaces(namespaces?: any[]) {
    this.namespacesSubject.next(namespaces);
  }

  setSelectedNamespace(namespace?: any) {
    this.selectedNamespaceSubject.next(namespace);
  }

  setKbsList(kbsList?: any[]) {
    this.kbsListSubject.next(kbsList);
  }
}

