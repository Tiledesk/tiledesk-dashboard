import { Injectable } from '@angular/core';
import { LocalDbService } from 'app/services/users-local-db.service';
import type { KbNamespace } from '../models/kb-types';

export interface NamespaceSelectionResult {
  selected?: KbNamespace;
  shouldNavigateToSelected: boolean;
  shouldPersistSelected: boolean;
}

@Injectable({ providedIn: 'root' })
export class KbNamespaceSelectionService {
  constructor(private localDb: LocalDbService) {}

  getStoredNamespace(projectId: string): KbNamespace | undefined {
    const raw = this.localDb.getFromStorage(`last_kbnamespace-${projectId}`);
    if (!raw) return undefined;
    try {
      return JSON.parse(raw);
    } catch {
      return undefined;
    }
  }

  persistNamespace(projectId: string, namespace: KbNamespace) {
    this.localDb.setInStorage(`last_kbnamespace-${projectId}`, JSON.stringify(namespace));
  }

  resolveNamespaceIdFromUrl(url: string): string {
    // We expect URLs like: /project/<pid>/knowledge-bases/<namespaceId>
    // Fallback to '0' when the last segment isn't alphanumeric.
    const last = url.substring(url.lastIndexOf('/') + 1);
    return this.isAlphaNumeric(last) ? last : '0';
  }

  select(namespaces: KbNamespace[], stored: KbNamespace | undefined, urlNamespaceId: string): NamespaceSelectionResult {
    if (!namespaces?.length) {
      return { selected: undefined, shouldNavigateToSelected: false, shouldPersistSelected: false };
    }

    if (stored?.id) {
      const found = namespaces.find((n) => n.id === stored.id);
      const fallback = found ?? namespaces.find((n) => n.default === true);
      return {
        selected: fallback,
        shouldNavigateToSelected: Boolean(fallback),
        shouldPersistSelected: false,
      };
    }

    if (urlNamespaceId === '0') {
      const fallback = namespaces.find((n) => n.default === true);
      return {
        selected: fallback,
        shouldNavigateToSelected: Boolean(fallback),
        shouldPersistSelected: Boolean(fallback),
      };
    }

    const found = namespaces.find((n) => n.id === urlNamespaceId);
    const fallback = found ?? namespaces.find((n) => n.default === true);
    return {
      selected: fallback,
      shouldNavigateToSelected: Boolean(fallback),
      shouldPersistSelected: Boolean(fallback),
    };
  }

  private isAlphaNumeric(str: string) {
    if (!str) return false;
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      const isNum = code > 47 && code < 58;
      const isUpper = code > 64 && code < 91;
      const isLower = code > 96 && code < 123;
      if (!isNum && !isUpper && !isLower) return false;
    }
    return true;
  }
}

